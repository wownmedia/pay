import { Core } from "@cryptology.hk/pay-framework";
import Twit from "twit";
import Twitter from "twitter";

export class TwitterApi {
    private readonly consumerSecret: string;
    private readonly consumerKey: string;
    private readonly accessToken: string;
    private readonly accessTokenSecret: string;
    private readonly environment: string;
    private readonly twitterClient: Twitter;
    private readonly twit: Twit;

    constructor(config) {
        this.consumerSecret = config.consumerSecret;
        this.consumerKey = config.consumerKey;
        this.accessToken = config.accessToken;
        this.accessTokenSecret = config.accessTokenSecret;
        this.environment = config.environment;

        // To send messages and tweets
        this.twit = new Twit({
            consumer_key: this.consumerKey,
            consumer_secret: this.consumerSecret,
            access_token: this.accessToken,
            access_token_secret: this.accessTokenSecret,
            timeout_ms: 5 * 1000, // optional HTTP request timeout to apply to all requests.
            strictSSL: false, // optional - requires SSL certificates to be valid.
        });

        // To retrieve information about users
        this.twitterClient = new Twitter({
            consumer_key: this.consumerKey,
            consumer_secret: this.consumerSecret,
            access_token_key: this.accessToken,
            access_token_secret: this.accessTokenSecret,
        });
    }

    public async getUsername(userId: string): Promise<string> {
        try {
            const getPath: string = "users/lookup.json";
            const parameter = {
                user_id: userId,
            };
            return this.twitterClient
                .get(getPath, parameter)
                .then(users => {
                    if (users.lenght === 0 || !users[0].hasOwnProperty("screen_name")) {
                        throw new Error("Bad username");
                    }
                    return users[0].screen_name;
                })
                .catch(error => {
                    throw error;
                });
        } catch (e) {
            Core.logger.error(e.message);
            return null;
        }
    }

    public async getUserId(username: string): Promise<string> {
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
            Core.logger.error(e.message);
            return null;
        }
    }

    public async sendDirectMessage(username: string, message: string): Promise<void> {
        try {
            const recipientId: string = await this.getUserId(username);
            await this.twit.post(
                "direct_messages/events/new",
                {
                    event: {
                        type: "message_create",
                        message_create: {
                            target: {
                                recipient_id: recipientId,
                            },
                            message_data: {
                                text: message,
                            },
                        },
                    },
                },
                err => {
                    if (!err) {
                        Core.logger.info("Message Sent.");
                    } else {
                        throw new Error(`Could not deliver message to ${username}`);
                    }
                },
            );
        } catch (e) {
            Core.logger.error(e.message);
        }
    }

    public async tweet(message: string): Promise<void> {
        try {
            await this.twit.post("statuses/update", { status: message });
            Core.logger.info(`postCommentReply: ${message}`);
        } catch (e) {
            Core.logger.error(`There was an error posting this tweet: ${e}`);
        }
    }

    public async replyTweet(message: string, statusId: string): Promise<void> {
        try {
            await this.twit.post("statuses/update", {
                status: message,
                in_reply_to_status_id: statusId,
            });
            Core.logger.info(`replyTweet: ${message}`);
        } catch (e) {
            Core.logger.error(`There was an error posting this tweet: ${e}`);
        }
    }
}
