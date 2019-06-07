import { Core, Interfaces, Services } from "@cryptology.hk/pay-framework";
import bodyParser from "body-parser";
import express from "express";
import http from "http";
import twitterWebhooks from "twitter-webhooks";
import { TwitterConfig, TwitterDirectMessage, TwitterKnownWebhooks } from "./interfaces";
import { TwitterApi } from "./twitter-api";

const app = express();
app.use(bodyParser.json());

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
     * @dev The configuration for the Twitter Account API
     */
    private readonly twitterConfig: TwitterConfig;
    private readonly twitterApi: TwitterApi;
    private readonly userActivityWebhook;

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

        /*
        await this.userActivityWebhook
            .unsubscribe({
                userId: this.twitterConfig.userId,
                accessToken: this.twitterConfig.accessToken,
                accessTokenSecret: this.twitterConfig.accessTokenSecret,
            })
            .then(result => {
                Core.logger.info("Unsubscribed from Webhook");
            });
        */
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
            await this.filterEvent(data, userId);
            // console.log(`Event: ${userId} => ${JSON.stringify(data)}`)
        });

        // Make sure there is a reverse HTTPS proxy in front of this port!
        const server = http.createServer({}, app);
        server.listen(this.twitterConfig.accountApiPort);
    }

    public async notifyAdmin(): Promise<boolean> {
        return true;
    }

    private async filterEvent(eventData, userId) {
        if (eventData.hasOwnProperty("type") && eventData.type === "message_create") {
            // Received a Direct Message
            const directMessage: TwitterDirectMessage = eventData;
            const senderName: string = await this.twitterApi.getUsername(directMessage.message_create.sender_id);

            // Filter out our own sent messages
            if (this.twitterConfig.userId.toLowerCase() !== senderName.toLowerCase()) {
                Core.logger.info(
                    `Direct Message Received from @${senderName} => ${directMessage.message_create.message_data.text}`,
                );

                // Todo what we do with DMs
            }
        } else if (eventData.hasOwnProperty("is_quote_status") && eventData.is_quote_status === true) {
            // Received a mention in a comment with a quoted retweet
            // todo interface eventData
            const senderName: string = eventData.user.screen_name;

            // Filter out our own sent messages
            if (this.twitterConfig.userId.toLowerCase() !== senderName.toLowerCase()) {
                Core.logger.info(`Comment with Retweet from @${senderName} => ${eventData.text}`);
            }

            // Todo what we do with mentions
        } else if (
            eventData.hasOwnProperty("text") &&
            eventData.hasOwnProperty("in_reply_to_screen_name") &&
            eventData.in_reply_to_screen_name !== null
        ) {
            // Received a mention in comment to a tweet
            // todo interface eventData
            const senderName: string = eventData.user.screen_name;

            // Filter out our own sent messages
            if (this.twitterConfig.userId.toLowerCase() !== senderName.toLowerCase()) {
                Core.logger.info(`Comment from @${senderName} => ${eventData.text}`);
            }

            // Todo what we do with mentions
        }
    }
}
