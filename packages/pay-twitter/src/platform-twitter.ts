import { Core, Interfaces, Services } from "@cryptology.hk/pay-framework";
import bodyParser from "body-parser";
import express from "express";
import http from "http";
import twitterWebhooks from "twitter-webhooks";
import { TwitterConfig } from "./interfaces";

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

    private readonly userActivityWebhook;

    constructor() {
        try {
            this.twitterConfig = PlatformTwitter.loadConfig();
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
        // Register the webhook url - just needed once per URL
        try {
            await this.userActivityWebhook.register();
        } catch (e) {
            Core.logger.warn(e.message);
        }

        // Subscribe for a particular user activity
        try {
            await this.userActivityWebhook.unsubscribe({
                userId: this.twitterConfig.userId,
                accessToken: this.twitterConfig.accessToken,
                accessTokenSecret: this.twitterConfig.accessTokenSecret,
            });

            const userActivity = await this.userActivityWebhook.subscribe({
                userId: this.twitterConfig.userId,
                accessToken: this.twitterConfig.accessToken,
                accessTokenSecret: this.twitterConfig.accessTokenSecret,
            });

            userActivity
                .on("favorite", data => console.log(userActivity.id + " - favorite"))
                .on("tweet_create", data => console.log(userActivity.id + " - tweet_create"))
                .on("follow", data => console.log(userActivity.id + " - follow"))
                .on("mute", data => console.log(userActivity.id + " - mute"))
                .on("revoke", data => console.log(userActivity.id + " - revoke"))
                .on("direct_message", data => console.log(userActivity.id + " - direct_message"))
                .on("direct_message_indicate_typing", data =>
                    console.log(userActivity.id + " - direct_message_indicate_typing"),
                )
                .on("direct_message_mark_read", data => console.log(userActivity.id + " - direct_message_mark_read"))
                .on("tweet_delete", data => console.log(userActivity.id + " - tweet_delete"));

            // listen to any user activity
            this.userActivityWebhook.on("event", (event, userId, data) => console.log(userId + JSON.stringify(data)));

            // listen to unknown payload (in case of api new features)
            this.userActivityWebhook.on("unknown-event", rawData => console.log(rawData));

            const server = http.createServer({}, app);
            server.listen(this.twitterConfig.accountApiPort);
        } catch (e) {
            Core.logger.error(e.message);
        }
    }

    public async notifyAdmin(): Promise<boolean> {
        return true;
    }
}
