import { Core, Interfaces, Services } from "@cryptology.hk/pay-framework";
import bodyParser from "body-parser";
import express from "express";
import http from "http";
import twitterWebhooks from "twitter-webhooks";
import { TwitterConfig, TwitterDirectMessage } from "./interfaces";
import { TwitterApi } from "./twitter-api";

const app = express();
app.use(bodyParser.json());

const merchantsConfig = Core.config.get("merchants");

export class PlatformTwitter {
    /**
     * @dev Load Twitter settings from the configuration file
     * @returns {TwitterConfig}  Configuration for Twitter
     * @private
     */
    private static loadConfig(): TwitterConfig {
        const platforms: any = Core.config.get("platforms");
        if (!platforms || !platforms.hasOwnProperty("twitter")) {
            throw new Error("Did not find the configuration for Twitter.");
        }
        const twitterConfiguration: any = platforms.twitter;
        const parsedConfig: TwitterConfig = {
            admin: twitterConfiguration.hasOwnProperty("admin") ? twitterConfiguration.admin : null,
            environment: twitterConfiguration.hasOwnProperty("environment")
                ? twitterConfiguration.environment
                : "arktippr",
            serverUrl: twitterConfiguration.hasOwnProperty("serverUrl") ? twitterConfiguration.serverUrl : null,
            route: twitterConfiguration.hasOwnProperty("route") ? twitterConfiguration.route : null,
            consumerKey: twitterConfiguration.hasOwnProperty("consumerKey") ? twitterConfiguration.consumerKey : null,
            consumerSecret: twitterConfiguration.hasOwnProperty("consumerSecret")
                ? twitterConfiguration.consumerSecret
                : null,
            accessToken: twitterConfiguration.hasOwnProperty("accessToken") ? twitterConfiguration.accessToken : null,
            accessTokenSecret: twitterConfiguration.hasOwnProperty("accessTokenSecret")
                ? twitterConfiguration.accessTokenSecret
                : null,
            networks: twitterConfiguration.hasOwnProperty("networks") ? twitterConfiguration.admin : ["ARK"],
            userId: twitterConfiguration.hasOwnProperty("userId") ? twitterConfiguration.userId : null,
            accountApiPort: twitterConfiguration.hasOwnProperty("accountApiPort")
                ? twitterConfiguration.accountApiPort
                : null,
        };

        if (
            !parsedConfig.admin ||
            !parsedConfig.serverUrl ||
            !parsedConfig.route ||
            !parsedConfig.consumerKey ||
            !parsedConfig.consumerSecret ||
            !parsedConfig.accessToken ||
            !parsedConfig.accessTokenSecret ||
            !parsedConfig.accountApiPort
        ) {
            throw new Error("Bad Twitter configuration.");
        }
        return parsedConfig;
    }

    /**
     * @dev Retrieve the username to be notified when a merchant transaction is processed
     * @param command
     * @returns {Interfaces.Username}  The username of the merchant that needs to be notified
     * @private
     */
    private static getMerchantUsername(command: string): Interfaces.Username {
        command = command.toLowerCase();

        if (!merchantsConfig.hasOwnProperty(command)) {
            throw TypeError(`Could not find merchant for ${command.toUpperCase()} in the configuration`);
        }

        if (!merchantsConfig[command].hasOwnProperty("notify")) {
            throw TypeError(`Could not find merchant notify for ${command.toUpperCase()} in the configuration`);
        }

        return merchantsConfig[command].notify;
    }

    /**
     * @dev replace all occurences
     * @param target
     * @param search
     * @param replacement
     * @private
     */
    private static replaceAll(target: string, search: string, replacement: string): string {
        return target.split(search).join(replacement);
    }

    /**
     * @dev The configuration for the Twitter Account API
     */
    private readonly twitterConfig: TwitterConfig;
    private readonly twitterApi: TwitterApi;
    private readonly userActivityWebhook;
    private platform: Services.Platform;

    constructor() {
        try {
            this.twitterConfig = PlatformTwitter.loadConfig();

            this.twitterApi = new TwitterApi(this.twitterConfig);

            this.userActivityWebhook = twitterWebhooks.userActivity({
                serverUrl: this.twitterConfig.serverUrl,
                route: this.twitterConfig.route,
                consumerKey: this.twitterConfig.consumerKey,
                consumerSecret: this.twitterConfig.consumerSecret,
                accessToken: this.twitterConfig.accessToken,
                accessTokenSecret: this.twitterConfig.accessTokenSecret,
                environment: this.twitterConfig.environment,
                app,
            });

            this.platform = new Services.Platform();
        } catch (e) {
            Core.logger.error(e.message);
        }
    }

    public async startWebhookListener() {
        // Register the actual webhook, this needs to be done only 1x per URL
        await this.userActivityWebhook.register().then(
            results => {
                Core.logger.info(`Webhook registered: ${results}`);
            },
            error => {
                Core.logger.warn(`Webhook registration: ${error.message}`);
            },
        );

        await this.userActivityWebhook
            .subscribe({
                userId: this.twitterConfig.userId,
                accessToken: this.twitterConfig.accessToken,
                accessTokenSecret: this.twitterConfig.accessTokenSecret,
            })
            .then(
                userActivity => {
                    Core.logger.info(
                        `Listening to events on Twitter Account API Webhook ${JSON.stringify(userActivity)}`,
                    );
                },
                error => {
                    Core.logger.warn(`Subscribing to webhook: ${error.message}`);
                },
            );

        // listen to any user activity
        this.userActivityWebhook.on("event", async (event, userId, data) => {
            const commands: Interfaces.Command[] = await this.filterEvent(data);

            if (commands === null) {
                // Nothing to do here, bad command, no connection to DB or it was processed already by an other server
                return;
            }

            // if (commands.length === 0 && !data.hasOwnProperty("type")) {
            // We received a mention without a command
            // Reply to the comment with a "I was summoned but have no clue what you want from me" message
            // const reply: Interfaces.Reply = Services.Messenger.Messenger.summonedMessage();
            // const message = `@${data.user.screen_name} - ${reply.replyComment}`;
            // Core.logger.info(`Sending Summoned Reply to comment: ${data.id_str}`);
            // await this.twitterApi.replyTweet(message, data.id_str);
            // }

            if (commands.length > 0) {
                // Reply to them commands baby
                for (const commandIndex in commands) {
                    if (commands[commandIndex]) {
                        try {
                            const command: Interfaces.Command = commands[commandIndex];
                            command.smallFooter = true; // No large footers on Twitter, 140 Chars etc

                            // check receiver
                            if (!(await this.checkReceiver(command))) {
                                return;
                            }

                            // Execute the command, except if it is STICKERS, can't do that on Twitter
                            if (command.command !== "STICKERS") {
                                const reply: Interfaces.Reply = await Services.Commander.executeCommand(command);

                                // Reply to the Sender of the command
                                if (reply.hasOwnProperty("directMessageSender")) {
                                    Core.logger.info(
                                        `Sending Direct Message to sender: ${
                                            command.commandSender.username
                                        } on twitter`,
                                    );
                                    const messageText: string = Services.Platform.undoTextFormatting(
                                        reply.directMessageSender,
                                    );
                                    this.twitterApi.sendDirectMessage(command.commandSender.username, messageText);
                                }

                                // Reply to the receiver of the command
                                let receiver: Interfaces.Username = command.commandReplyTo;
                                if (command.hasOwnProperty("transfer") && command.transfer.hasOwnProperty("receiver")) {
                                    receiver = command.transfer.receiver;
                                }
                                if (reply.hasOwnProperty("directMessageReceiver") && receiver.platform !== "twitter") {
                                    Core.logger.info(
                                        `Sending Direct Message to receiver: ${receiver.username} on ${
                                            receiver.platform
                                        }`,
                                    );
                                    await this.platform.notifyReceiver(receiver, reply);
                                }

                                // (Reply to) a Tweet
                                if (reply.hasOwnProperty("replyComment") && receiver.platform === "twitter") {
                                    let message: string = Services.Platform.undoTextFormatting(reply.replyComment);
                                    Core.logger.info(`Sending Tweet with mention of receiver: ${receiver.username}`);
                                    if (command.id) {
                                        this.twitterApi.replyTweet(message, command.id);
                                    } else {
                                        if (!message.startsWith(`@${receiver.username}`)) {
                                            message = `@${receiver.username} ${message}`;
                                        }
                                        this.platform.tweet(message);
                                    }
                                }
                            }
                        } catch (e) {
                            Core.logger.error(e.message);
                        }
                    }
                }
            }
        });

        // Make sure there is a reverse HTTPS proxy in front of this port!
        const server = http.createServer({}, app);
        server.listen(this.twitterConfig.accountApiPort);
    }

    public async filterEvent(eventData): Promise<Interfaces.Command[]> {
        // filter out activity pushes (while a user is typing etc)
        if (!eventData.hasOwnProperty("id")) {
            return null;
        }

        const messageId: string = eventData.hasOwnProperty("id_str") ? eventData.id_str : eventData.id.toString();
        // Check if we have already processed this entry
        if (!(await Services.Storage.Storage.isNewSubmission(messageId))) {
            return null;
        }

        const platform: string = "twitter";
        if (eventData.hasOwnProperty("type") && eventData.type === "message_create") {
            // Received a Direct Message
            const directMessage: TwitterDirectMessage = eventData;
            const senderName: string = await this.twitterApi.getUsername(directMessage.message_create.sender_id);
            const sender: Interfaces.Username = {
                username: senderName,
                platform,
            };

            // Filter out our own sent messages
            if (this.twitterConfig.userId.toLowerCase() !== senderName.toLowerCase()) {
                Core.logger.info(`Direct Message Received from @${senderName}`);
                return await Services.Parser.Parser.parseDirectMessage(
                    directMessage.message_create.message_data.text,
                    platform,
                    sender,
                );
            }
        } else if (eventData.hasOwnProperty("is_quote_status") && eventData.is_quote_status === true) {
            // Received a mention in a comment with a quoted retweet

            // todo interface eventData
            const senderName: string = eventData.user.screen_name;
            const sender: Interfaces.Username = {
                username: senderName,
                platform,
            };

            // Filter out our own sent messages
            if (this.twitterConfig.userId.toLowerCase() !== senderName.toLowerCase()) {
                Core.logger.info(`Comment with Retweet from @${senderName}`);

                const receiver: Interfaces.Username = {
                    username: eventData.quoted_status.user.screen_name,
                    platform,
                };

                const commands: Interfaces.Command[] = await Services.Parser.Parser.parseMention(
                    eventData.text,
                    this.twitterConfig.userId,
                    platform,
                    sender,
                    receiver,
                    eventData.quoted_status_id_str,
                );
                if (commands === null) {
                    return [];
                }
                return commands;
            }
        } else if (
            eventData.hasOwnProperty("text") &&
            eventData.hasOwnProperty("in_reply_to_screen_name") &&
            eventData.in_reply_to_screen_name !== null
        ) {
            // Received a mention in comment to a tweet

            // todo interface eventData
            const senderName: string = eventData.user.screen_name;
            const sender: Interfaces.Username = {
                username: senderName,
                platform,
            };

            // Filter out our own sent messages
            if (this.twitterConfig.userId.toLowerCase() !== senderName.toLowerCase()) {
                Core.logger.info(`Comment from @${senderName}`);
                const receiver: Interfaces.Username = {
                    username: eventData.in_reply_to_screen_name,
                    platform,
                };

                const commands: Interfaces.Command[] = await Services.Parser.Parser.parseMention(
                    eventData.text,
                    this.twitterConfig.userId,
                    platform,
                    sender,
                    receiver,
                    eventData.in_reply_to_status_id_str,
                );

                if (commands === null) {
                    return [];
                }
                return commands;
            }
        }

        return null;
    }

    /**
     * @dev Check if a receiver is valid on a platform
     * @param command
     * @returns {Promise<boolean>}  True if receiver is valid on the platform
     * @private
     */
    private async checkReceiver(command: Interfaces.Command): Promise<boolean> {
        const checkReceiver: Interfaces.Username =
            command.hasOwnProperty("transfer") && command.transfer.hasOwnProperty("receiver")
                ? command.transfer.receiver
                : command.hasOwnProperty("commandReplyTo")
                ? command.commandReplyTo
                : null;

        // No receiver, so always good
        if (checkReceiver === null) {
            return true;
        }

        const receiverOk: boolean = await this.platform.isValidUser(checkReceiver);
        if (receiverOk === null) {
            Core.logger.error(`Bad receiver: ${checkReceiver.username} on ${checkReceiver.platform}`);
        }
        return receiverOk;
    }
}
