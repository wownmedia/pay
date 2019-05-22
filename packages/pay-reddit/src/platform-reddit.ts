import { Command, Commands } from "@cryptology.hk/pay-commands";
import { config } from "@cryptology.hk/pay-config";
import { logger } from "@cryptology.hk/pay-logger";
import { Reply } from "@cryptology.hk/pay-messenger";
import { Parser } from "@cryptology.hk/pay-parser";
import { Storage } from "@cryptology.hk/pay-storage";
import { Username } from "@cryptology.hk/pay-user";
import os from "os";
import Snoowrap from "snoowrap";

export interface RedditConfig {
    admin: string;
    userAgent: string;
    clientId: string;
    clientSecret: string;
    username: string;
    password: string;
    requestDelay: number;
    continueAfterRatelimitError: boolean;
    networks: string[];
}

export interface RedditMessage {
    author: Author;
    name: string;
    body: string;
    was_comment: boolean;
    id: string;
    parent_id?: string;
}

interface Author {
    name;
}

const merchantsConfig = config.get("merchants");

export class PlatformReddit {
    public static async prepareCommand(
        item: RedditMessage,
        sender: Username,
        receiver: Username,
        arkPayUser: string,
    ): Promise<Command[]> {
        try {
            // Do we have a mention or a direct message
            if (item.hasOwnProperty("was_comment") && item.was_comment) {
                const id: string = item.name;
                const parentId: string = item.parent_id;
                // Mention
                logger.info(`Reddit Mention received: ${id} replying to ${parentId}`);
                return await Parser.parseMention(item.body, arkPayUser, "reddit", sender, receiver, parentId);
            } else {
                // Direct Messenger
                logger.info(`Reddit Direct Message received: ${item.id}`);
                return await Parser.parseDirectMessage(item.body, "reddit", sender);
            }
        } catch (e) {
            logger.error(e.messenger);
        }
        return [];
    }
    /**
     * Load settings from the configuration file
     */
    private static __loadConfig(): RedditConfig {
        const platforms = config.get("platforms");
        const readConfig = platforms.reddit;
        const parsedConfig: RedditConfig = {
            admin: readConfig.hasOwnProperty("admin") ? readConfig.admin : null,
            userAgent: "ArkPay",
            clientId: readConfig.hasOwnProperty("clientId") ? readConfig.clientId : null,
            clientSecret: readConfig.hasOwnProperty("clientSecret") ? readConfig.clientSecret : null,
            username: readConfig.hasOwnProperty("username") ? readConfig.username : null,
            password: readConfig.hasOwnProperty("password") ? readConfig.password : null,
            requestDelay: 2000,
            continueAfterRatelimitError: true,
            networks: readConfig.hasOwnProperty("networks") ? readConfig.admin : ["ARK"],
        };

        if (
            !parsedConfig.admin ||
            !parsedConfig.clientId ||
            !parsedConfig.clientSecret ||
            !parsedConfig.username ||
            !parsedConfig.password
        ) {
            throw new Error("Bad Reddit configuration.");
        }

        return parsedConfig;
    }

    private static __filterInbox(unreadMessages: RedditMessage[]): RedditMessage[] {
        const inbox: RedditMessage[] = [];

        for (const item in unreadMessages) {
            if (unreadMessages[item] && unreadMessages[item].author) {
                const message: RedditMessage = {
                    author: unreadMessages[item].author,
                    name: unreadMessages[item].name,
                    id: unreadMessages[item].id,
                    body: unreadMessages[item].body,
                    was_comment: unreadMessages[item].was_comment,
                };
                if (unreadMessages[item].hasOwnProperty("parent_id") && unreadMessages[item].parent_id) {
                    message.parent_id = unreadMessages[item].parent_id;
                }
                inbox.push(message);
            }
        }
        return inbox.reverse();
    }

    private static async isNewSubmission(submissionId: string): Promise<boolean> {
        try {
            if (await Storage.checkSubmission(submissionId)) {
                return false;
            }
            return await Storage.addSubmission(submissionId);
        } catch (e) {
            logger.error(e);
        }
        return false;
    }

    private static __getMerchant(command: string): Username {
        command = command.toLowerCase();

        if (!merchantsConfig.hasOwnProperty(command)) {
            throw TypeError(`Could not find merchant for ${command.toUpperCase()} in the configuration`);
        }

        if (!merchantsConfig[command].hasOwnProperty("notify")) {
            throw TypeError(`Could not find merchant notify for ${command.toUpperCase()} in the configuration`);
        }

        return merchantsConfig[command].notify;
    }
    public readonly platformConfig: Snoowrap;

    private readonly redditConfig: RedditConfig;

    constructor() {
        try {
            this.redditConfig = PlatformReddit.__loadConfig();
            this.platformConfig = new Snoowrap({
                userAgent: this.redditConfig.userAgent,
                clientId: this.redditConfig.clientId,
                clientSecret: this.redditConfig.clientSecret,
                username: this.redditConfig.username,
                password: this.redditConfig.password,
            });

            const snooWrapParameters = {
                requestDelay: this.redditConfig.requestDelay,
                continueAfterRatelimitError: this.redditConfig.continueAfterRatelimitError,
            };
            this.platformConfig.config(snooWrapParameters);
        } catch (e) {
            logger.error(e.messenger);
        }
    }

    /**
     * @dev Poll Reddit and process what we receive
     */
    public async redditPolling() {
        try {
            const inbox: RedditMessage[] = await this.getUnreadMessages();
            for (const inboxIndex in inbox) {
                if (
                    typeof inbox[inboxIndex] !== "undefined" &&
                    inbox[inboxIndex].hasOwnProperty("author") &&
                    inbox[inboxIndex].author.hasOwnProperty("name")
                ) {
                    if (!inbox[inboxIndex].hasOwnProperty("was_comment")) {
                        inbox[inboxIndex].was_comment = false;
                    }
                    const commands: Command[] = await this.processInboxItem(inbox[inboxIndex]);
                    logger.info(`COMMANDS: ${JSON.stringify(commands)}`); // todo
                    for (const commandIndex in commands) {
                        if (commands[commandIndex]) {
                            try {
                                const command: Command = commands[commandIndex];
                                const reply: Reply = await Commands.executeCommand(command);
                                const subject: string = `ArkPay: ${command.command}`;
                                if (reply.hasOwnProperty("directMessageSender")) {
                                    logger.info(`Sending DM to sender: ${command.commandSender.username}`);
                                    await this.sendDirectMessage(
                                        command.commandSender.username,
                                        reply.directMessageSender,
                                        subject,
                                    );
                                }
                                if (reply.hasOwnProperty("directMessageReceiver")) {
                                    // todo: check platform
                                    let youGot: string = command.command;
                                    if (
                                        command.hasOwnProperty("transfer") &&
                                        command.transfer.hasOwnProperty("token")
                                    ) {
                                        youGot = command.transfer.token;
                                    }
                                    const subject = `You've got ${youGot}!`;
                                    let receiver: Username = command.commandReplyTo;
                                    if (
                                        command.hasOwnProperty("transfer") &&
                                        command.transfer.hasOwnProperty("receiver")
                                    ) {
                                        receiver = command.transfer.receiver;
                                    }
                                    logger.info(`Sending DM to receiver: ${receiver.username}`);
                                    await this.sendDirectMessage(
                                        receiver.username,
                                        reply.directMessageReceiver,
                                        subject,
                                    );
                                }

                                if (reply.hasOwnProperty("directMessageMerchant")) {
                                    const merchant: Username = PlatformReddit.__getMerchant(command.command);
                                    // todo check platform
                                    logger.info(`Sending DM to merchant: ${merchant.username}`);
                                    await this.sendDirectMessage(
                                        merchant.username,
                                        reply.directMessageMerchant,
                                        subject,
                                    );
                                }

                                if (reply.hasOwnProperty("replyComment") && inbox[inboxIndex].was_comment) {
                                    logger.info(`Sending Reply to comment: ${inbox[inboxIndex].id}`);
                                    await this.postCommentReply(inbox[inboxIndex].id, reply.replyComment);
                                }
                            } catch (e) {
                                logger.error(e);
                            }
                        }
                    }
                }
            }
        } catch (e) {
            logger.warn(e.message);
        }
    }

    /**
     * @dev Retrieve unread Direct Messages and Mentions from Reddit
     */
    public async getUnreadMessages(): Promise<RedditMessage[]> {
        const options = {
            filter: "unread",
        };

        try {
            let unreadMessages = await this.platformConfig.getInbox(options);
            unreadMessages = PlatformReddit.__filterInbox(unreadMessages);
            return unreadMessages;
        } catch (e) {
            return [];
        }
    }

    /**
     * @dev  Process an item (message, mention) from the Bot's Inbox
     * @param {object} item The message or mention to process
     */
    public async processInboxItem(item: RedditMessage): Promise<Command[]> {
        logger.info(JSON.stringify(item)); // todo
        try {
            const needToProcessSubmission: boolean = await PlatformReddit.isNewSubmission(item.id);
            if (!needToProcessSubmission) {
                return [];
            }

            let receiver: Username = null;
            if (item.was_comment && item.parent_id) {
                // This is a Mention
                await this.__markCommentRead(item.id);
                const parentAuthor: Author = await this.getParentAuthor(item.parent_id);
                receiver = {
                    username: parentAuthor.name,
                    platform: "reddit",
                };
            } else {
                // This is a Direct Messenger
                await this.__markMessageRead(item.id);
            }

            logger.info(`Processing new submission ${item.id} from ${item.author.name}`);
            const sender: Username = {
                username: item.author.name,
                platform: "reddit",
            };

            return await PlatformReddit.prepareCommand(item, sender, receiver, this.redditConfig.username);
        } catch (e) {
            logger.error(e.message);
            return [];
        }
    }

    public async getParentAuthor(commentId: string): Promise<Author> {
        const parentAuthor: Author = await this.platformConfig.getComment(commentId).author;
        if (!parentAuthor || !parentAuthor.hasOwnProperty("name") || parentAuthor.name === "[deleted]") {
            throw new Error("Parent comment has been deleted.");
        }
        return parentAuthor;
    }

    /**
     * @dev Send a notification to the admin that the Reddit listener has started
     */
    public async notifyAdmin() {
        this.platformConfig
            .composeMessage({
                to: this.redditConfig.admin,
                subject: "ARK Pay",
                text: `ARK Pay Reddit Listener started for ${this.redditConfig.username} on ${os.hostname()}`,
            })
            .then(() => {
                logger.info(`ARK Pay Reddit listener START-notification sent to ${this.redditConfig.admin}`);
                return true;
            })
            .catch(e => {
                return false;
            });
    }

    /**
     * @dev Check if a username is a valid user on Reddit
     * @param username
     */
    public async isValidUser(username: string): Promise<boolean> {
        try {
            const redditUser = await this.platformConfig.getUser(username).getTrophies();
            return redditUser && redditUser.hasOwnProperty("trophies");
        } catch (error) {
            return false;
        }
    }

    public async sendDirectMessage(to: string, text: string, subject: string) {
        return this.platformConfig
            .composeMessage({
                to,
                subject,
                text,
            })
            .catch(e => {
                logger.error(e.message);
            });
    }

    public async postCommentReply(submissionId: string, reply: string) {
        try {
            const submission = await this.platformConfig.getComment(submissionId);
            await submission.reply(reply);
        } catch (e) {
            logger.error(e.message);
        }
    }

    private async __markCommentRead(id: string): Promise<void> {
        try {
            const comment: any = await this.platformConfig.getComment(id);
            await this.platformConfig.markMessagesAsRead([comment]);
        } catch (e) {
            logger.error(e.message);
        }
    }

    private async __markMessageRead(id: string): Promise<void> {
        try {
            const privateMessage: any = await this.platformConfig.getMessage(id);
            await privateMessage.markAsRead();
        } catch (error) {
            logger.error(error);
        }
    }
}
