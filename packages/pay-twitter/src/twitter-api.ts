import { Core } from "@cryptology.hk/pay-framework";
import axios from "axios";
import Twitter from "twitter";

// import crypto from "crypto";
// import { TwitterAPIUserContext, TwitterOauthJSON, TwitterAPIRequestOptions } from "../interfaces";

export class TwitterApi {
    private consumerSecret: string;
    private consumerKey: string;
    private accessToken: string;
    private accessTokenSecret: string;
    private environment: string;
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
    }

    public getUsername(userId: string): string {
        try {
            const twitterClient = new Twitter({
                consumer_key: this.consumerKey,
                consumer_secret: this.consumerSecret,
                access_token_key: this.accessToken,
                access_token_secret: this.accessTokenSecret,
            });

            const getPath: string = "users/lookup.json";
            const parameter = {
                user_id: userId,
            };
            return twitterClient.get(getPath, parameter, (errors: any[], users: any[]) => {
                if (errors) {
                    for (const item in errors) {
                        if (errors[item]) {
                            Core.logger.warn(`getUsername: Code ${errors[item].code} - ${errors[item].message}`);
                        }
                    }
                }
                // todo
                Core.logger.info(JSON.stringify(users[0].name));
                return users[0].name;
            });
        } catch (e) {
            Core.logger.error(e.message);
        }
        return null;
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
