import { Identities } from "@arkecosystem/crypto";
import { Core, Interfaces, Services } from "@cryptology.hk/pay-framework";
import envPaths from "env-paths";
import { default as fsWithCallbacks } from "fs";
import Joi from "joi";
import WebhookManager from "webhook-manager";
import { Webhook, WebhookConfig, WebhookToken } from "./interfaces";
const fs = fsWithCallbacks.promises;

const webhookConfig = Core.config.get("apiServer");

export class WebhookListener {
    private static async checkWebhookConfig(webhookConfig: WebhookConfig): Promise<void> {
        const uriConfig = {
            scheme: ["http", "https"],
        };

        const webhookConfigSchema = Joi.object().keys({
            id: Joi.string()
                .length(36)
                .required(),
            event: Joi.string()
                .valid("transaction.forged")
                .required(),
            target: Joi.string()
                .uri(uriConfig)
                .required(),
            token: Joi.string()
                .token()
                .required(),
            enabled: Joi.boolean()
                .valid(true)
                .required(),
            conditions: Joi.any()
                .allow(null)
                .optional(),
        });

        const badWebhookConfig = new Error("Bad or no webhook");
        await Joi.attempt(webhookConfig, webhookConfigSchema, badWebhookConfig);
    }

    private static async tokenFromWebhookToken(webhookToken) {
        try {
            const tokenSchema = Joi.object().keys({
                webhookToken: Joi.string()
                    .token()
                    .length(64)
                    .required(),
            });
            const badWebhookToken = new Error("Badly formatted webhook token");
            await Joi.attempt({ webhookToken }, tokenSchema, badWebhookToken);

            return webhookToken.substr(32);
        } catch (e) {
            Core.logger.warn(e.message);
        }
        return null;
    }

    private static async validateResponse(
        authorization: string,
        webhookToken: string,
        verification: string,
    ): Promise<void> {
        Core.logger.info(
            `validateResponse(): authorization: ${authorization} webhookToken: ${webhookToken} verification: ${verification}`,
        );
        const validationSchema = Joi.object().keys({
            authorization: Joi.string()
                .token()
                .length(32)
                .required(),
            webhookToken: Joi.string()
                .token()
                .length(64)
                .valid(authorization + verification)
                .required(),
            verification: Joi.string()
                .token()
                .length(32)
                .required(),
        });
        const validationError = new Error("Bad verification on received DATA.");
        await Joi.attempt({ authorization, webhookToken, verification }, validationSchema, validationError);
    }
    private readonly port: number;
    private readonly url: string;
    private readonly node: string;
    private readonly seed: string;
    private readonly wallet: string;
    private readonly webhookConfigFile: string = `${envPaths("ark-pay").config}/pay-webhook-listener.json`;
    private webhookToken: WebhookToken;

    constructor() {
        try {
            this.checkConfig();
            this.port = webhookConfig.port;
            this.url = webhookConfig.url;
            this.node = webhookConfig.node;
            this.seed = webhookConfig.seed;
            const networkVersion: number = 23; // todo maybe make this configurable so listeners can be added to other blockchains
            const publicKey: string = Identities.PublicKey.fromPassphrase(this.seed);
            this.wallet = Identities.Address.fromPublicKey(publicKey, networkVersion);

            Core.logger.info(`constructor() wallet ${this.wallet}`);
        } catch (e) {
            Core.logger.error(e.message);
        }
    }

    public async start() {
        try {
            // Load the Webhook, if it doesnt yet exist create one
            this.webhookToken = await this.loadWebhook();

            if (this.webhookToken.token32 === null) {
                Core.logger.error("Could not register or connect to a webhook");
                return;
            }

            // Startup the Listener
            const webhookListener = new WebhookManager(this.port);
            webhookListener.on("ready", () => {
                Core.logger.info(`Webhook Listener started on ${webhookListener.PORT}`);
            });
            webhookListener.on("/", async data => {
                try {
                    console.log("Received webhook with following data:", data);
                    // Core.logger.info(`Incoming webhook: ${data}`);
                    const authorization =
                        data.hasOwnProperty("headers") && data.headers.hasOwnProperty("authorization")
                            ? data.headers.authorization
                            : "";
                    await WebhookListener.validateResponse(
                        authorization,
                        this.webhookToken.token64,
                        this.webhookToken.token32,
                    );
                    await this.processResponse(data.body);
                } catch (e) {
                    Core.logger.error(e.message);
                }
            });
        } catch (e) {
            Core.logger.error(e.message);
        }
    }

    private async processResponse(data: any): Promise<void> {
        // todo
        Core.logger.info(`Process Response: ${JSON.stringify(data)}`);

        // COMMANDS: REGISTER, SEND, DEPOSIT, BALANCE, WITHDRAW
        /*
        request:  { command: REGISTER, platform: UNIQUE-NAME }
        response: { id: TX-ID, registered: true/false, error?: ERROR }

        request:  { command: SEND, senderId: marc1970, receiverId: mschot@twitter, amount: 10, currency: ARK }
        response: { id: TX-ID, transactionId: TX-ID2, explorer: http://exlplorer, error?: NOT ENOUGH FUNDS }

        request:  { command: DEPOSIT, senderId: marc1970, currency?: ARK }
        response: { id: TX-ID, address: address }

        request:  { command: BALANCE, senderId: marc1970, currency?: ARK }
        response: { id: TX-ID: balance: 0 }

        request:  { command: WITHDRAW, senderId: marc1970, address: address, amount: 0, currency?: ARK }
        response: { id: TX-ID, transactionId: TX-ID2, explorer: http://exlplorer, error?: NOT ENOUGH FUNDS }
         */

        // check if send amount in tx is above level

        // check if address is from registered platform

        // parse command

        // execute command

        // send reply
    }

    /**
     * @dev Check if the config is correct, will  throw an error if the config isn't ok
     * @private
     */
    private checkConfig(): void {
        const uriConfig = {
            scheme: ["http", "https"],
        };
        const webhookSchema = Joi.object().keys({
            port: Joi.number()
                .integer()
                .min(1024)
                .max(49151)
                .required(),
            url: Joi.string()
                .uri(uriConfig)
                .required(),
            node: Joi.string()
                .uri(uriConfig)
                .required(),
            seed: Joi.string().required(),
        });

        Joi.validate(
            {
                port: webhookConfig.port,
                url: webhookConfig.url,
                node: webhookConfig.node,
                seed: webhookConfig.seed,
            },
            webhookSchema,
            err => {
                if (err) {
                    Core.logger.error(err);
                    throw new Error("Bad configuration: check your configuration");
                }
            },
        );
    }

    private async loadWebhook(): Promise<WebhookToken> {
        try {
            Core.logger.info(`Loading webhook from: ${this.webhookConfigFile}`);
            // Check if an existing webhook is correctly registered
            const webhookConfig: WebhookConfig = require(this.webhookConfigFile);
            await WebhookListener.checkWebhookConfig(webhookConfig);

            // Check if configured webhook is active and if the authorization matches
            Core.logger.info("Webhook loaded from file, checking if it is still active on the server");
            if (await this.checkWebhook(webhookConfig.id)) {
                const token: string = await WebhookListener.tokenFromWebhookToken(webhookConfig.token);
                Core.logger.info("Valid webhook registration found.");
                return {
                    token32: token,
                    token64: webhookConfig.token,
                };
            }
        } catch (e) {
            Core.logger.warn(`Webhook not configured (correctly), going to register a new webhook: ${e.message}`);
        }

        // register a new webhook
        try {
            const webhookToken: string = await this.registerWebhook();
            const token = await WebhookListener.tokenFromWebhookToken(webhookToken);
            return {
                token32: token,
                token64: webhookToken,
            };
        } catch (e) {
            Core.logger.error(e.message);
        }

        return {
            token32: null,
            token64: null,
        };
    }

    private async registerWebhook() {
        try {
            const postWebhookEndpoint = "/api/webhooks";
            const params = {
                target: this.url,
                event: "transaction.forged",
                conditions: [
                    {
                        key: "recipientId",
                        value: this.wallet,
                        condition: "eq",
                    },
                ],
            };
            const webhookAPIResults: Interfaces.ApiResponse = await Services.Network.postToNode(
                this.node,
                postWebhookEndpoint,
                params,
            );
            Core.logger.info(`registerWebhook(): ${JSON.stringify(webhookAPIResults)}`);
            const receivedWebhookConfig: WebhookConfig = {
                id: webhookAPIResults.data.id ? webhookAPIResults.data.id : null,
                event: webhookAPIResults.data.event ? webhookAPIResults.data.event : null,
                target: webhookAPIResults.data.target ? webhookAPIResults.data.target : null,
                token: webhookAPIResults.data.token ? webhookAPIResults.data.token : null,
                enabled: webhookAPIResults.data.enabled ? webhookAPIResults.data.enabled : null,
                conditions: webhookAPIResults.data.conditions ? webhookAPIResults.data.conditions : null,
            };
            await WebhookListener.checkWebhookConfig(receivedWebhookConfig);
            await this.storeWebhook(receivedWebhookConfig);
            return webhookAPIResults.data.token;
        } catch (e) {
            Core.logger.error(`registerWebhook(): ${e.message}`);
        }
        return null;
    }

    private async checkWebhook(id: string): Promise<boolean> {
        try {
            const getWebhookEndpoint = `/api/webhooks/${id}`;
            const webhookAPIResults: Interfaces.ApiResponse = await Services.Network.getFromNode(
                this.node,
                getWebhookEndpoint,
            );
            const receivedWebhookConfig: WebhookConfig = {
                id: webhookAPIResults.data.id ? webhookAPIResults.data.id : null,
                event: webhookAPIResults.data.event ? webhookAPIResults.data.event : null,
                target: webhookAPIResults.data.target ? webhookAPIResults.data.target : null,
                token: webhookAPIResults.data.token ? webhookAPIResults.data.token : null,
                enabled: webhookAPIResults.data.enabled ? webhookAPIResults.data.enabled : null,
                conditions: webhookAPIResults.data.conditions ? webhookAPIResults.data.conditions : null,
            };

            if (
                webhookAPIResults.data.target === this.url &&
                webhookAPIResults.data.conditions[0].value === this.wallet
            ) {
                Core.logger.info(`Webhook confirmed for ${this.wallet}`);
                return true;
            }

            Core.logger.warn("checkWebhook(): Hey, this is not our webhook!");
        } catch (e) {
            Core.logger.error(`checkWebhook(): ${e.message}`);
        }
        return false;
    }

    private async storeWebhook(webhookConfig: WebhookConfig): Promise<void> {
        const jsonWebhook: string = JSON.stringify(webhookConfig);
        await fs.writeFile(this.webhookConfigFile, jsonWebhook);
    }
}
