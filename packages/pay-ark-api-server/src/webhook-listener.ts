import { Identities } from "@arkecosystem/crypto";
import { Core, Interfaces, Services } from "@cryptology.hk/pay-framework";
import BigNumber from "bignumber.js";
import envPaths from "env-paths";
import { default as fsWithCallbacks } from "fs";
import Joi from "joi";
import WebhookManager from "webhook-manager";
import { ApiFees, WebhookConfig, WebhookToken } from "./interfaces";
const fs = fsWithCallbacks.promises;

const webhookConfig = Core.config.get("apiServer");
const apiFeesConfig = Core.config.get("apiFees");

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
                .valid("transaction.applied")
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
    private readonly apiFees: ApiFees;

    constructor() {
        try {
            this.checkConfig();
            this.port = webhookConfig.port;
            this.url = webhookConfig.url;
            this.node = webhookConfig.node;
            this.seed = webhookConfig.seed;
            const registration = new BigNumber(apiFeesConfig.registration).gt(0)
                ? new BigNumber(apiFeesConfig.registration)
                : new BigNumber(1);
            const command = new BigNumber(apiFeesConfig.command).gt(0)
                ? new BigNumber(apiFeesConfig.command)
                : new BigNumber(1);
            this.apiFees = {
                registration,
                command,
            };
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

        try {
            const command = JSON.parse(data.vendorField);
            if (!command.hasOwnProperty("command")) {
                return;
            }

            switch (command.command.toUpperCase()) {
                case "REGISTER":
                    // check if platform isn't a common one (e.g. reddit, twitter, facebook, etc)

                    // check if address or platform exists

                    // check if value is larger than minimal

                    // register platform

                    // send reply tx

                    break;
                case "DEPOSIT":
                    // check if from address is a valid platform

                    // get user address

                    // send reply tx

                    break;
                case "BALANCE":
                    // check if from address is a valid platform

                    // get balance

                    // send reply tx

                    break;

                case "SEND":
                    // check if from address is a valid platform

                    // create and execute send transaction

                    // send reply tx

                    break;
                case "WITHDRAW":
                    // check if from address is a valid platform

                    // create and execute withdraw transaction

                    // send reply tx

                    break;
                default:
                // check if vendorField is a valid user

                // transfer to that user

                // send reply tx
            }
        } catch (e) {
            Core.logger.error(e.message);
        }
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
                event: "transaction.applied",
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
