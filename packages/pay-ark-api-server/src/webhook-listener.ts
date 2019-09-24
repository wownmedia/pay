import { Identities } from "@arkecosystem/crypto";
import { ARKTOSHI } from "@arkecosystem/crypto/dist/constants";
import { Core, Interfaces, Services } from "@cryptology.hk/pay-framework";
import BigNumber from "bignumber.js";
import envPaths from "env-paths";
import { default as fsWithCallbacks } from "fs";
import Joi from "joi";
import WebhookManager from "webhook-manager";
import { Balance, Deposit, Register, Send, Withdraw } from "./commands";
import {
    APIBalanceReply,
    APIDepositReply,
    ApiFees,
    APIInfoCommand,
    APIRegisterCommand,
    APITransferCommand,
    APITransferReply,
    WebhookConfig,
    WebhookToken,
} from "./interfaces";

const fs = fsWithCallbacks.promises;
const webhookConfig = Core.config.get("apiServer");
const apiFeesConfig = Core.config.get("apiFees");
const arkEcosystemConfig = Core.config.get("arkEcosystem");
const arkTransactionFee: BigNumber =
    arkEcosystemConfig.hasOwnProperty("ark") && arkEcosystemConfig.ark.hasOwnProperty("transactionFee")
        ? new BigNumber(arkEcosystemConfig.ark.transactionFee)
        : new BigNumber(2000000);
const arkNode: string =
    arkEcosystemConfig.hasOwnProperty("ark") && arkEcosystemConfig.ark.hasOwnProperty("nodes")
        ? `http://${arkEcosystemConfig.ark.nodes[0].host}:${arkEcosystemConfig.ark.nodes[0].port}`
        : "http://localhost:4003";

export class WebhookListener {
    /**
     * @dev Check if the configuration for the webhook is complete
     * @param webhookConfig
     */
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

    /**
     * @dev Check and generate the 32 byte token from the 64 byte webhook token
     * @param webhookToken
     */
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

    /**
     * @dev Validate if received data on the webhook listener is valid (e.g. coming from the right source)
     * @param authorization
     * @param webhookToken
     * @param verification
     */
    private static async validateResponse(
        authorization: string,
        webhookToken: string,
        verification: string,
    ): Promise<void> {
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

    /**
     * @dev Generate an ARK wallet from a public key
     * @param senderPublicKey
     */
    private static getSenderWallet(senderPublicKey: string): string {
        return Identities.Address.fromPublicKey(senderPublicKey, 23);
    }

    /**
     * @dev Check if a sent transaction was accepted
     * @param transfer
     */
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

    /**
     * @dev start the webhook listener
     */
    public async start() {
        try {
            // Process all transactions that have not yet been processed  and that might not have been received by the webhook
            // because offline etc.
            const transactions: any[] = await this.searchTransactions();
            Core.logger.info(`Received Transactions found: ${transactions.length}`);
            for (const item in transactions) {
                if (transactions[item]) {
                    // process old received transactions to see if we missed one via webhooks
                    await this.processResponse({ data: transactions[item] });
                }
            }

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

    /**
     * @dev Retrieve all received transactions for the listener's wallet
     */
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

    /**
     * @dev Process a received transaction
     * @param data
     */
    private async processResponse(data: any): Promise<void> {
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
            const possibleUser: Interfaces.Username = Send.parseUsername(data.data.vendorField);
            const sender: string = WebhookListener.getSenderWallet(data.data.senderPublicKey);
            let transferReply: APITransferReply;

            // If the Vendorfield does not contain a valid user it could contain a command or be a regular transaction
            // to the ArkTippr listener wallet....
            if (possibleUser && (await this.platform.isValidUser(possibleUser))) {
                Core.logger.info(`Direct Deposit request to: ${JSON.stringify(possibleUser)}`);

                // calculate value: received amount minus 2x the fee so we can forward the tx and send a reply tx
                const amount: BigNumber = new BigNumber(data.data.amount).minus(arkTransactionFee.times(2));

                // create a tx and send it
                const recipientId: string = await Services.User.getWalletAddress(possibleUser, "ARK");
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
                Core.logger.info(
                    `Transfering ${amount.div(ARKTOSHI)} ARK to ${possibleUser.username} at ${possibleUser.platform}.`,
                );
                const transfers: Interfaces.TransactionResponse[] = await Services.Network.broadcastTransactions(
                    transactions,
                    "ARK",
                );

                // Check if we have an accepted transaction
                const transactionId: string = WebhookListener.checkTransferResult(transfers[0]);
                if (transactionId) {
                    // send reply to receiver and send reply tx`
                    transferReply = {
                        id: data.data.id,
                        transactionId,
                        explorer: arkEcosystemConfig.ark.explorer,
                    };

                    // Notify Receiver via platform
                    const usdValue: BigNumber = await Services.Currency.Currency.baseCurrencyUnitsToUSD(amount, "ARK");
                    const reply: Interfaces.Reply = Services.Messenger.Messenger.directDepositMessage(
                        sender,
                        possibleUser,
                        transactionId,
                        amount,
                        usdValue,
                        "ARK",
                        recipientId,
                    );
                    await this.platform.notifyReceiver(possibleUser, reply);
                } else {
                    transferReply = {
                        id: data.data.id,
                        error: "Could not POST transfer",
                    };
                }

                // Send a reply to the Sender
                await this.sendReplyToSender(sender, transferReply);
                return;
            }

            // Now check if this is a command
            const command = JSON.parse(data.data.vendorField);
            Core.logger.info(JSON.stringify(command));

            if (!command.hasOwnProperty("command")) {
                return;
            }
            const amount: BigNumber = new BigNumber(data.data.amount);

            switch (command.command.toUpperCase()) {
                case "REGISTER":
                    try {
                        const vendorField: APIRegisterCommand = {
                            command: "REGISTER",
                            platform: command.hasOwnProperty("platform") ? command.platform : null,
                        };
                        const registrationCommand = new Register(sender, amount, data.data.id, vendorField);
                        await registrationCommand.registrate();
                        transferReply = {
                            id: data.data.id,
                            registered: true,
                        };
                    } catch (e) {
                        transferReply = {
                            id: data.data.id,
                            registered: false,
                            error: e.message,
                        };
                    }
                    await this.sendReplyToSender(sender, transferReply);
                    return;

                case "DEPOSIT":
                    let depositReply: APIDepositReply;
                    try {
                        const vendorField: APIInfoCommand = {
                            command: "DEPOSIT",
                            token: command.hasOwnProperty("token") ? command.token.toUpperCase() : "ARK",
                            senderId: command.hasOwnProperty("senderId") ? command.senderId : null,
                        };
                        const depositCommand = new Deposit(sender, amount, vendorField);
                        const address: string = await depositCommand.getAddress();
                        depositReply = {
                            id: data.data.id,
                            address,
                        };
                    } catch (e) {
                        depositReply = {
                            id: data.data.id,
                            error: e.message,
                        };
                    }
                    await this.sendReplyToSender(sender, depositReply);
                    return;

                case "BALANCE":
                    let balanceReply: APIBalanceReply;
                    try {
                        const vendorField: APIInfoCommand = {
                            command: "BALANCE",
                            token: command.hasOwnProperty("token") ? command.token.toUpperCase() : "ARK",
                            senderId: command.hasOwnProperty("senderId") ? command.senderId : null,
                        };
                        const balanceCommand = new Balance(sender, amount, vendorField);
                        const balance: BigNumber = await balanceCommand.getBalance();
                        balanceReply = {
                            id: data.data.id,
                            balance: balance.toString(),
                        };
                    } catch (e) {
                        balanceReply = {
                            id: data.data.id,
                            error: e.message,
                        };
                    }

                    await this.sendReplyToSender(sender, balanceReply);
                    return;

                case "SEND":
                case "WITHDRAW":
                    let sendReply: APITransferReply;
                    try {
                        const vendorField: APITransferCommand = {
                            command: "SEND",
                            token: command.hasOwnProperty("token") ? command.token.toUpperCase() : "ARK",
                            senderId: command.hasOwnProperty("senderId") ? command.senderId : null,
                            receiverId: command.hasOwnProperty("receiverId") ? command.receiverId : null,
                            address: command.hasOwnProperty("address") ? command.address : null,
                            amount: command.hasOwnProperty("amount") ? command.amount : null,
                        };
                        const sendCommand =
                            command.command.toUpperCase() === "SEND"
                                ? new Send(sender, amount, vendorField)
                                : new Withdraw(sender, amount, vendorField);
                        const reply: Interfaces.Reply = await sendCommand.sendTransaction();

                        if (reply.hasOwnProperty("error")) {
                            sendReply = {
                                id: data.data.id,
                                error: reply.error,
                            };
                        } else {
                            sendReply = {
                                id: data.data.id,
                                transactionId: reply.data,
                                explorer: arkEcosystemConfig.ark.explorer,
                            };
                            await this.platform.notifyReceiver(possibleUser, reply);
                        }
                    } catch (e) {
                        sendReply = {
                            id: data.data.id,
                            error: e.message,
                        };
                    }

                    await this.sendReplyToSender(sender, sendReply);
                    return;
            }
        } catch (e) {
            Core.logger.error(e.message);
        }
    }

    private async sendReplyToSender(sender: string, transferReply: APITransferReply): Promise<void> {
        Core.logger.info("Sending notification to Sender");
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

    /**
     * @dev Load the webhook configuration from file
     */
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

    /**
     * @dev Register a new webhook with the node
     */
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

    /**
     * @dev Check if the configured webhook ist still active on the node
     * @param id
     */
    private async checkWebhook(id: string): Promise<boolean> {
        try {
            const getWebhookEndpoint = `/api/webhooks/${id}`;
            const webhookAPIResults: Interfaces.ApiResponse = await Services.Network.getFromNode(
                this.node,
                getWebhookEndpoint,
            );

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

    /**
     * @dev Store the webhook config to file
     * @param webhookConfig
     */
    private async storeWebhook(webhookConfig: WebhookConfig): Promise<void> {
        const jsonWebhook: string = JSON.stringify(webhookConfig);
        await fs.writeFile(this.webhookConfigFile, jsonWebhook);
    }
}
