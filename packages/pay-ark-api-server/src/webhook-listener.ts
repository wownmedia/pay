import { Identities } from "@arkecosystem/crypto";
import { Core, Interfaces, Services } from "@cryptology.hk/pay-framework";
import BigNumber from "bignumber.js";
import envPaths from "env-paths";
import { default as fsWithCallbacks } from "fs";
import Joi from "joi";
import WebhookManager from "webhook-manager";
import { ApiFees, APITransferCommand, APITransferReply, WebhookConfig, WebhookToken } from "./interfaces";
const fs = fsWithCallbacks.promises;

const webhookConfig = Core.config.get("apiServer");
const apiFeesConfig = Core.config.get("apiFees");
const parserConfig = Core.config.get("parser");
const arkEcosystemConfig = Core.config.get("arkEcosystem");
const arkTransactionFee: BigNumber =
    arkEcosystemConfig.hasOwnProperty("ark") && arkEcosystemConfig.ark.hasOwnProperty("transactionFee")
        ? new BigNumber(arkEcosystemConfig.ark.transactionFee)
        : new BigNumber(2000000);
const arkNode: string =
    arkEcosystemConfig.hasOwnProperty("ark") && arkEcosystemConfig.ark.hasOwnProperty("nodes")
        ? `http://${arkEcosystemConfig.ark.nodes[0].host}:${arkEcosystemConfig.ark.nodes[0].port}`
        : "http://localhost:4003";
const USERNAME_PLATFORM_SEPERATOR = parserConfig.seperator ? parserConfig.seperator : "@";

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

    /**
     * @dev Check if a message/mention was not processed before
     * @param submissionId
     * @returns {Promise<boolean>} True if the message was not processed already
     * @private
     */
    private static async isNewSubmission(submissionId: string): Promise<boolean> {
        try {
            if (await Services.Storage.Storage.checkSubmission(submissionId)) {
                return false;
            }
            return await Services.Storage.Storage.addSubmission(submissionId);
        } catch (e) {
            // Most likely a DB connection error
            Core.logger.error(e.message);
        }
        return false;
    }

    private static getSenderWallet(senderPublicKey: string): string {
        return Identities.Address.fromPublicKey(senderPublicKey, 23);
    }

    /**
     * Parse a username
     * @param username
     */
    private static parseUsername(username: string): Interfaces.Username {
        // Remove the Reddit user u/ and Twitter @
        const userNameReplace: RegExp = new RegExp("(^@|u/)");
        username = username.replace(userNameReplace, "");

        // Split up the username and platform if any (eg. cryptology@twitter)
        const usernameParts: string[] = username.split(USERNAME_PLATFORM_SEPERATOR);
        if (usernameParts.length === 2) {
            username = usernameParts[0];
            const platform = usernameParts[1];
            return { username, platform };
        }
        return null;
    }

    private static checkTransferResult(transfer: any): string {
        if (
            transfer.hasOwnProperty("response") &&
            transfer.response.hasOwnProperty("data") &&
            transfer.response.data.hasOwnProperty("accept") &&
            transfer.response.data.accept.length > 0
        ) {
            return transfer.response.data.accept[0];
        }
        return null;
    }
    private readonly port: number;
    private readonly url: string;
    private readonly node: string;
    private readonly seed: string;
    private readonly wallet: string;
    private readonly webhookConfigFile: string = `${envPaths("ark-pay").config}/pay-webhook-listener.json`;
    private webhookToken: WebhookToken;
    private readonly apiFees: ApiFees;
    private platform: Services.Platform;

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
            this.platform = new Services.Platform();
        } catch (e) {
            Core.logger.error(e.message);
        }
    }

    public async start() {
        try {
            // todo
            // Process all transactions that have not yet been processed  and that might not have been received by the webhook
            // because offline etc.
            const transactions: any[] = await this.searchTransactions();
            Core.logger.info(`Transactions found: ${transactions.length}`);

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
                    Core.logger.info(`Received webhook: ${JSON.stringify(data.headers)}`); // todo
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

    private async searchTransactions(): Promise<any[]> {
        const searchTransactionsEndpoint: string = "/api/v2/transactions/search";
        const params: Interfaces.Parameters = {
            page: 1,
            limit: 100,
        };

        const data: any = {
            type: 0,
            recipientId: this.wallet,
        };

        let results;
        let transactions: any[] = [];
        try {
            do {
                results = await Services.Network.postToNode(arkNode, searchTransactionsEndpoint, data, params);
                if (results.hasOwnProperty("data") && results.data.length > 0) {
                    transactions = transactions.concat(results.data);
                }
                params.page++;
            } while (results.hasOwnProperty("data") && results.data.length > 0);
        } catch (e) {
            Core.logger.error(e.message);
        }
        return transactions;
    }

    private async processResponse(data: any): Promise<void> {
        // todo
        Core.logger.info(`Process Response: ${JSON.stringify(data)}`);

        try {
            // Only accept transfers (type 0)
            if (!data.hasOwnProperty("data") || !data.data.hasOwnProperty("type") || data.data.type !== 0) {
                return;
            }

            // First make sure we didn't process this tx already on an other server
            if (!(await WebhookListener.isNewSubmission(data.data.id))) {
                return;
            }

            // I think the larger amount of transactions will be direct deposits, so check for those first
            // check if vendorField is a valid user so we can do a direct deposit
            const possibleUser: Interfaces.Username = WebhookListener.parseUsername(data.data.vendorField);

            // If the Vendorfield does not contain a valid user it could contain a command or be a regular transaction
            // to the ArkTippr listener wallet....
            if (await this.platform.isValidUser(possibleUser)) {
                Core.logger.info(`Direct Deposit request to: ${JSON.stringify(possibleUser)}`);

                // calculate value: received amount minus 2x the fee so we can forward the tx and send a reply tx
                const amount: BigNumber = new BigNumber(data.data.amount).minus(arkTransactionFee.times(2));

                // create a tx and send it
                const recipientId: string = await Services.User.getWalletAddress(possibleUser, "ARK");
                const sender: string = WebhookListener.getSenderWallet(data.data.senderPublicKey);
                const vendorField: string = `ARK Pay - Direct Deposit from ${sender}`;
                const transaction = await Services.ArkTransaction.generateTransferTransaction(
                    amount,
                    recipientId,
                    vendorField,
                    arkTransactionFee,
                    this.seed,
                    "ARK",
                );
                const transactions: any[] = [];
                transactions.push(transaction);
                const transfers: Interfaces.TransactionResponse[] = await Services.Network.broadcastTransactions(
                    transactions,
                    "ARK",
                );

                // Check if we have an accepted transaction
                const transactionId: string = WebhookListener.checkTransferResult(transfers[0]);
                let transferReply: APITransferReply;
                if (transactionId) {
                    // send reply to receiver and send reply tx`
                    transferReply = {
                        id: data.data.id,
                        transactionId,
                        explorer: arkEcosystemConfig.ark.explorer,
                    };

                    // todo remove
                    Core.logger.info(`transferReply: ${JSON.stringify(transferReply)}`);
                } else {
                    transferReply = {
                        id: data.data.id,
                        error: "Could not POST transfer",
                    };
                }

                // Send a reply to the Sender
                const replyTransaction = await Services.ArkTransaction.generateTransferTransaction(
                    new BigNumber(1),
                    sender,
                    JSON.stringify(transferReply),
                    arkTransactionFee,
                    this.seed,
                    "ARK",
                );
                const replyTransactions: any[] = [];
                replyTransactions.push(replyTransaction);
                await Services.Network.broadcastTransactions(replyTransactions, "ARK");
                return;
            }

            // Now check if this is a command
            const command = JSON.parse(data.data.vendorField);

            switch (command.command.toUpperCase()) {
                case "REGISTER":
                    // check if platform isn't a common one (e.g. reddit, twitter, facebook, etc)

                    // check if address or platform exists

                    // check if value is larger than minimal

                    // register platform

                    // send reply tx

                    return;
                case "DEPOSIT":
                    // check if from address is a valid platform

                    // get user address

                    // send reply tx

                    return;
                case "BALANCE":
                    // check if from address is a valid platform

                    // get balance

                    // send reply tx

                    return;

                case "SEND":
                    // check if from address is a valid platform

                    // create and execute send transaction

                    // send reply tx

                    return;
                case "WITHDRAW":
                    // check if from address is a valid platform

                    // create and execute withdraw transaction

                    // send reply tx

                    return;
            }

            // It didn't contain a Direct deposit, nor a valid command. To prevent DDOS we will not reply with an
            // error message.
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
