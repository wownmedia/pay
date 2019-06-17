import { Core } from "@cryptology.hk/pay-framework";
import axios from "axios";
import Twit from "twit";
import Twitter from "twitter";

// import crypto from "crypto";
// import { TwitterAPIUserContext, TwitterOauthJSON, TwitterAPIRequestOptions } from "../interfaces";

export class TwitterApi {
    private readonly consumerSecret: string;
    private readonly consumerKey: string;
    private readonly accessToken: string;
    private readonly accessTokenSecret: string;
    private readonly environment: string;
    private readonly twitterClient: Twitter;
    private readonly twit: Twit;
    private appBearerToken: string;

    constructor(config) {
        this.consumerSecret = config.consumerSecret;
        this.consumerKey = config.consumerKey;
        this.accessToken = config.accessToken;
        this.accessTokenSecret = config.accessTokenSecret;
        this.environment = config.environment;

        // Retrieve a Bearer token from Twitter, a bit of a hack way since it's an async in a constructor
        const temp = new Promise(resolve => {
            this.getAppBearerToken().then(result => {
                this.appBearerToken = result;
                Core.logger.info(`appBearerToken: ${this.appBearerToken}`);
                resolve(undefined);
            });
        });

        Core.logger.info(`CK: ${this.consumerKey} CS: ${this.consumerSecret}`);
        Core.logger.info(`AK: ${this.accessToken} AS: ${this.accessTokenSecret}`);
        this.twit = new Twit({
            consumer_key: this.consumerKey,
            consumer_secret: this.consumerSecret,
            access_token: this.accessToken,
            access_token_secret: this.accessTokenSecret,
            timeout_ms: 5 * 1000, // optional HTTP request timeout to apply to all requests.
            strictSSL: false, // optional - requires SSL certificates to be valid.
        });

        this.twitterClient = new Twitter({
            consumer_key: this.consumerKey,
            consumer_secret: this.consumerSecret,
            access_token_key: this.accessToken,
            access_token_secret: this.accessTokenSecret,
        });

        this.twitterClient.options.post_method = "formData";
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
                (err, data) => {
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

    public async postCommentReply(message: string): Promise<void> {
        try {
            // todo await this.twit.post('statuses/update', { status: message });
            Core.logger.info(`postCommentReply: ${message}`);
        } catch (e) {
            Core.logger.error(`There was an error posting this tweet: ${e}`);
        }
    }

    private async getAppBearerToken(): Promise<string> {
        try {
            const credentials: string = `${this.consumerKey}:${this.consumerSecret}`;
            const credentialsBase64Encoded: string = Buffer.from(credentials).toString("base64");
            const response = await axios.request({
                url: "https://api.twitter.com/oauth2/token",
                method: "POST",
                headers: {
                    Authorization: `Basic ${credentialsBase64Encoded}`,
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                },
                data: "grant_type=client_credentials",
            });
            return response.data.access_token;
        } catch (e) {
            Core.logger.error(e.message);
            return "";
        }
    }
    /*
    public async registerURL(): Promise<boolean> {
        try {
            const twitterClient = new Twitter({
                consumer_key: this.consumerKey,
                consumer_secret: this.consumerSecret,
                access_token_key: this.accessToken,
                access_token_secret: this.accessTokenSecret
            });

            const url: string = `/account_activity/all/${this.environment}/webhooks.json`;
            twitterClient.post(url, {url: `${this.serverUrl}${this.route}`}, (errors: any[], response) => {
                if (errors) {
                    for (let item in errors) {
                        if (errors[item]) {
                            Core.logger.warn(`Register Webhook URL: Code ${errors[item].code} - ${errors[item].message}`);
                        }
                    }
                }
                Core.logger.info(`Response: ${JSON.stringify(response)}`);
            });

            return true;
        } catch (e) {
            Core.logger.warn(`Registering Webhook URL: ${e}`);
            return false;
        }
    }

     */
}
