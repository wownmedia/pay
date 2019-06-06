import { Core, Interfaces, Services } from "@cryptology.hk/pay-framework";
import bodyParser from "body-parser";
import express from "express";
import http from "http";
import twitterWebhooks, { UserActivity } from "twitter-webhooks";
import { TwitterConfig, TwitterKnownWebhooks } from "./interfaces";

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

    private static filterEvent(eventData, userId) {
        if (eventData.hasOwnProperty("type")) {
            Core.logger.info(`Event Received from ${userId}: ${eventData.type} : ${JSON.stringify(eventData)}`);
        }
    }

    /**
     * @dev The configuration for the Twitter Account API
     */
    private readonly twitterConfig: TwitterConfig;

    private readonly userActivityWebhook: UserActivity;

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

        // Register the actual webhook, this needs to be done only 1x per URL
        this.userActivityWebhook.register().then(
            results => {
                Core.logger.info(`Webhook registered: ${results}`);
            },
            error => {
                Core.logger.warn(`Webhook registration: ${error.message}`);
            },
        );
    }

    public async startWebhookListener() {
        await this.userActivityWebhook
            .unsubscribe({
                userId: this.twitterConfig.userId,
                accessToken: this.twitterConfig.accessToken,
                accessTokenSecret: this.twitterConfig.accessTokenSecret,
            })
            .then(result => {
                Core.logger.info("Unsubscribed from Webhook");
            });

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
        this.userActivityWebhook.on("event", (event, userId, data) => {
            PlatformTwitter.filterEvent(data, userId);
            // console.log(`Event: ${userId} => ${JSON.stringify(data)}`)
        });

        // listen to unknown payload (in case of api new features)
        this.userActivityWebhook.on("unknown-event", rawData => console.log(`RawDATA: ${rawData}`));
        const server = http.createServer({}, app);
        server.listen(this.twitterConfig.accountApiPort);
    }

    public async notifyAdmin(): Promise<boolean> {
        return true;
    }

    private async checkActiveWebhooks() {
        const activeWebhooks: TwitterKnownWebhooks = await this.userActivityWebhook.getWebhooks();
        if (activeWebhooks.hasOwnProperty("environments") && activeWebhooks.environments.length > 0) {
            // we have registered active webhooks, unregister the ones for our URL
            for (const item in activeWebhooks.environments) {
                if (
                    activeWebhooks.environments[item] &&
                    activeWebhooks.environments[item].environment_name === this.twitterConfig.environment
                ) {
                    const url: string = `${this.twitterConfig.serverUrl}${this.twitterConfig.route}`;
                    for (const webhookItem in activeWebhooks.environments[item].webhooks) {
                        if (
                            activeWebhooks.environments[item].webhooks[webhookItem] &&
                            activeWebhooks.environments[item].webhooks[webhookItem].url === url
                        ) {
                            // We have an active webhook registered for the one we try to register
                            const webhookId: string = activeWebhooks.environments[item].webhooks[webhookItem].id;
                            const unregistered = await this.userActivityWebhook.unregister({ webhookId });
                            Core.logger.warn(
                                `Webhook was already registered as ${webhookId}. Unregistered: ${unregistered}`,
                            );
                        }
                    }
                }
            }
        }
    }
}
