import Snoowrap from "snoowrap";
import Twit from "twit";
import Twitter from "twitter";
import { config, logger } from "../core";
import { RedditCfg, Reply, TwitterCfg, Username } from "../interfaces";
import { Commander } from "./command";
import { Currency } from "./currency";

export class Platform {
    public static undoTextFormatting(text: string): string {
        // remove **
        text = Platform.replaceAll(text, "**", "");

        // remove `
        text = Platform.replaceAll(text, "`", "");

        return text;
    }

    private static loadRedditConfig(): RedditCfg {
        const platforms: any = config.get("platforms");
        if (!platforms || !platforms.hasOwnProperty("reddit")) {
            throw new Error("Did not find the configuration for Reddit.");
        }
        const redditConfiguration: any = platforms.reddit;
        const parsedConfig: RedditCfg = {
            userAgent: "ArkPay",
            clientId: redditConfiguration.hasOwnProperty("clientId") ? redditConfiguration.clientId : null,
            clientSecret: redditConfiguration.hasOwnProperty("clientSecret") ? redditConfiguration.clientSecret : null,
            username: redditConfiguration.hasOwnProperty("username") ? redditConfiguration.username : null,
            password: redditConfiguration.hasOwnProperty("password") ? redditConfiguration.password : null,
            requestDelay: 3000,
            continueAfterRatelimitError: true,
        };

        if (!parsedConfig.clientId || !parsedConfig.clientSecret || !parsedConfig.username || !parsedConfig.password) {
            throw new Error("Bad Reddit configuration.");
        }
        return parsedConfig;
    }

    private static loadTwitterConfig(): TwitterCfg {
        const platforms: any = config.get("platforms");
        if (!platforms || !platforms.hasOwnProperty("twitter")) {
            throw new Error("Did not find the configuration for Twitter.");
        }
        const twitterConfiguration: any = platforms.twitter;
        const parsedConfig: TwitterCfg = {
            consumerKey: twitterConfiguration.hasOwnProperty("consumerKey") ? twitterConfiguration.consumerKey : null,
            consumerSecret: twitterConfiguration.hasOwnProperty("consumerSecret")
                ? twitterConfiguration.consumerSecret
                : null,
            accessToken: twitterConfiguration.hasOwnProperty("accessToken") ? twitterConfiguration.accessToken : null,
            accessTokenSecret: twitterConfiguration.hasOwnProperty("accessTokenSecret")
                ? twitterConfiguration.accessTokenSecret
                : null,
        };

        if (
            !parsedConfig.consumerKey ||
            !parsedConfig.consumerSecret ||
            !parsedConfig.accessToken ||
            !parsedConfig.accessTokenSecret
        ) {
            throw new Error("Bad Twitter configuration.");
        }
        return parsedConfig;
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

    private twitter: Twit;
    private twitterClient: Twitter;
    private reddit: Snoowrap;

    constructor() {
        try {
            const redditConfig: RedditCfg = Platform.loadRedditConfig();
            const twitterConfig: TwitterCfg = Platform.loadTwitterConfig();

            this.reddit = new Snoowrap({
                userAgent: redditConfig.userAgent,
                clientId: redditConfig.clientId,
                clientSecret: redditConfig.clientSecret,
                username: redditConfig.username,
                password: redditConfig.password,
            });

            const parameters: any = {
                requestDelay: redditConfig.requestDelay,
                continueAfterRatelimitError: redditConfig.continueAfterRatelimitError,
            };
            this.reddit.config(parameters);

            // to post Tweets
            this.twitter = new Twit({
                consumer_key: twitterConfig.consumerKey,
                consumer_secret: twitterConfig.consumerSecret,
                access_token: twitterConfig.accessToken,
                access_token_secret: twitterConfig.accessTokenSecret,
                timeout_ms: 5 * 1000, // optional HTTP request timeout to apply to all requests.
                strictSSL: false, // optional - requires SSL certificates to be valid.
            });

            // To retrieve information about users
            this.twitterClient = new Twitter({
                consumer_key: twitterConfig.consumerKey,
                consumer_secret: twitterConfig.consumerSecret,
                access_token_key: twitterConfig.accessToken,
                access_token_secret: twitterConfig.accessTokenSecret,
            });
        } catch (e) {
            logger.error(e.message);
        }
    }

    public async notifyReceiver(receiver: Username, reply: Reply): Promise<boolean> {
        try {
            logger.info(`Sending Message to receiver: ${receiver.username} on ${receiver.platform}`);

            switch (receiver.platform) {
                case "reddit":
                    // Notify a Reddit User
                    if (await this.isValidRedditUser(receiver.username)) {
                        const subject: string = "ArkPay";
                        return await this.sendDirectMessageReddit(
                            receiver.username,
                            reply.directMessageReceiver,
                            subject,
                        );
                    } else {
                        logger.error(`Not a valid Reddit user: ${receiver.username}`);
                    }
                    break;
                case "twitter":
                    // Notify a Twitter user
                    const twitterUserId: string = await this.getTwitterUserId(receiver.username);
                    if (twitterUserId !== null) {
                        const message: string = Platform.undoTextFormatting(reply.replyComment);
                        logger.info(`Sending Tweet with mention of receiver: ${receiver.username}`);
                        this.tweet(message);
                    } else {
                        logger.error(`Not a valid Twitter user: ${receiver.username}`);
                    }
                    break;
            }
        } catch (e) {
            logger.error(e.message);
        }
        return false;
    }

    public async tweet(message: string): Promise<void> {
        try {
            await this.twitter.post("statuses/update", { status: message });
            logger.info(`postCommentReply: ${message}`);
        } catch (e) {
            logger.error(`There was an error posting this tweet: ${e}`);
        }
    }

    /**
     * @dev Send a Direct message on Reddit
     * @param to {string}       The receiving user
     * @param body {string}     The message body
     * @param subject {string}  The message subject
     * @returns {Promise<boolean>}  True if message was sent successfully
     */
    public async sendDirectMessageReddit(to: string, body: string, subject: string): Promise<boolean> {
        return this.reddit
            .composeMessage({
                to,
                subject,
                text: body,
            })
            .then(() => {
                return true;
            })
            .catch(e => {
                logger.error(e.message);
                return false;
            });
    }

    public async isValidUser(user: Username): Promise<boolean> {
        switch (user.platform) {
            case "reddit":
                return await this.isValidRedditUser(user.username);
            case "twitter":
                return (await this.getTwitterUserId(user.username)) !== null;
        }
        return false;
    }

    /**
     * @dev Check if a username is a valid user on Reddit
     * @param username {string}     The username to check
     * @returns {Promise<boolean>}  True if the username is valid on the platform
     */
    public async isValidRedditUser(username: string): Promise<boolean> {
        try {
            // A username can't be a command
            if (Commander.isValidCommand(username.toUpperCase())) {
                return false;
            }

            // A username can't be a currency
            if (Currency.isValidCurrency(username.toUpperCase())) {
                return false;
            }

            const redditUser: any = await this.reddit.getUser(username).getTrophies();
            return redditUser && redditUser.hasOwnProperty("trophies");
        } catch (e) {
            logger.error(e.message);
            return false;
        }
    }

    public async getTwitterUserId(username: string): Promise<string> {
        try {
            const getPath: string = "users/lookup.json";
            const parameter = {
                screen_name: username,
            };
            return this.twitterClient
                .get(getPath, parameter)
                .then(users => {
                    if (users.lenght === 0 || !users[0].hasOwnProperty("id_str")) {
                        throw new Error("Bad username");
                    }
                    return users[0].id_str;
                })
                .catch(error => {
                    throw error;
                });
        } catch (e) {
            logger.error(e.message);
            return null;
        }
    }
}
