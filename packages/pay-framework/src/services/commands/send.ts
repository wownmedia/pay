import BigNumber from "bignumber.js";
import Joi from "joi";
import { config, logger } from "../../core";
import {
    ArkEcosystemWallet,
    Reply,
    TransactionResponse,
    Transfer,
    Username,
    Wallet,
    WalletBalance,
} from "../../interfaces";
import { ArkWallet } from "../ark-wallet";
import { Currency } from "../currency/";
import { Messenger } from "../messenger";
import { Storage } from "../storage/";
import { User } from "../user";

const arkEcosystemConfig = config.get("arkEcosystem");

const usernameSchema = Joi.object().keys({
    sender: {
        username: Joi.string().required(),
        platform: Joi.string()
            .token()
            .required(),
    },
    receiver: {
        username: Joi.string().required(),
        platform: Joi.string()
            .token()
            .required(),
    },
});

export class Send {
    /**
     * @dev Create and Send a transfer
     * @param transfer {Transfer}   A parsed transfer
     * @param vendorField {string}  The text to place in the vendor field
     * @param smallFooter {boolean} True when user requested a small footer instead of a regular footer
     * @param isComment {boolean}   True if the SEND comes from a comment instead of a DM
     * @param nonce
     * @returns {Promise<Reply>} A Reply-object containing messages to send to Sender, Receiver and optionally a Comment reply
     */
    public static async transfer(
        transfer: Transfer,
        vendorField: string,
        smallFooter: boolean = true,
        isComment?: boolean,
        nonce?: number,
    ): Promise<Reply> {
        try {
            // Check if not sending to self
            if (this.sendingToSelf(transfer.sender, transfer.receiver)) {
                const reply: Reply = Messenger.errorMessage();
                reply.error = "Trying to send to self";
                return reply;
            }

            // Check if amount is above minimum
            if (!this.amountLargerThanMinimum(transfer.arkToshiValue, transfer.token)) {
                const reply: Reply = Messenger.minAmountMessage(transfer.token);
                reply.error = "Amount too low";
                return reply;
            }

            // Check if the Sender has sufficient balance
            const senderBalance: WalletBalance = await this.senderHasBalance(
                transfer.sender,
                transfer.token,
                transfer.arkToshiValue,
            );
            if (!senderBalance.success) {
                const reply: Reply = Messenger.senderLowBalance(
                    senderBalance.balance,
                    transfer.arkToshiValue,
                    transfer.token,
                    senderBalance.address,
                    isComment,
                );
                reply.error = "Insufficient balance";
                return reply;
            }

            // and..... send
            if (!nonce) {
                nonce = 0;
            }
            return await this.sendTransaction(transfer, vendorField, smallFooter, nonce);
        } catch (e) {
            logger.warn(e.message);
            const reply: Reply = Messenger.errorMessage();
            reply.error = e.message;
            return reply;
        }
    }

    /**
     * @dev Send the transaction to the blockchain
     * @param transfer {Transfer}   A parsed transfer
     * @param vendorField {string}  The text to add to the vendor field
     * @param smallFooter {boolean} True when user requested a small footer instead of a regular footer
     * @param nonce
     * @returns {Promise<Reply>} A Reply-object containing messages to send to Sender, Receiver and optionally a Comment reply
     * @protected
     */
    protected static async sendTransaction(
        transfer: Transfer,
        vendorField: string,
        smallFooter: boolean,
        nonce: number,
    ): Promise<Reply> {
        const networkVersion: number = ArkWallet.getArkEcosystemNetworkVersionForToken(transfer.token);
        const walletSender: Wallet = await Storage.getWallet(
            transfer.sender.username,
            transfer.sender.platform,
            transfer.token,
        );
        const walletReceiver: string = await User.getWalletAddress(transfer.receiver, transfer.token);
        const token: string = transfer.token;
        const txSender: ArkEcosystemWallet = {
            address: walletSender.address,
            encryptedSeed: walletSender.encryptedSeed,
            networkVersion,
            token,
        };
        const txReceiver: ArkEcosystemWallet = {
            address: walletReceiver,
            encryptedSeed: "",
            networkVersion,
            token,
        };
        const response: TransactionResponse[] = await ArkWallet.sendTransaction(
            txSender,
            txReceiver,
            transfer.arkToshiValue,
            vendorField,
            token,
            nonce,
        );

        const transactionId: string = this.processTransaction(response);
        const usdValue: BigNumber = await Currency.baseCurrencyUnitsToUSD(transfer.arkToshiValue, transfer.token);
        const reply: Reply = Messenger.transferMessage(
            transfer.sender,
            transfer.receiver,
            transactionId,
            transfer.arkToshiValue,
            usdValue,
            transfer.token,
            txReceiver.address,
            smallFooter,
        );
        reply.data = transactionId;
        reply.nonce = response[response.length - 1].nonce;
        return reply;
    }

    /**
     * @dev Process a sent transaction and check if it was accepted
     * @param response {TransactionResponse[]}  An array containing the transaction responses per node it was broadcasted to
     * @returns {string} The transaction ID if a tx was successful
     * @protected
     */
    protected static processTransaction(response: TransactionResponse[]): string {
        for (const item in response) {
            if (
                response[item] &&
                response[item].hasOwnProperty("response") &&
                response[item].response.hasOwnProperty("data") &&
                response[item].response.data.hasOwnProperty("accept") &&
                response[item].response.data.accept[0]
            ) {
                return response[item].response.data.accept[0];
            }
        }
        throw new Error("Could not successfully send Transaction");
    }

    /**
     * @dev Checks if sender and receiver are the same (no tipping to self!)
     * @param sender {Username}     The sender's username/platform pair
     * @param receiver {Username}   The receiver's username/platform pair
     * @returns {boolean}   True if sender === receiver
     * @protected
     */
    protected static sendingToSelf(sender: Username, receiver: Username): boolean {
        // Check the Users
        Joi.assert({ sender, receiver }, usernameSchema);
        return sender.username === receiver.username && sender.platform === receiver.platform;
    }

    /**
     * @dev Check if the amount of the transfer is above the configured threshold of an ArkEcosystem blockchain
     * @param amount {BigNumber}    The amount the sender requests to transfer
     * @param token {string}        The token of the ArkEcosystem blockchain to transfer on
     * @returns {boolean} True if amount is larger or equal to the threshold
     * @protected
     */
    protected static amountLargerThanMinimum(amount: BigNumber, token: string): boolean {
        token = token.toLowerCase();
        if (
            typeof arkEcosystemConfig[token] === "undefined" ||
            typeof arkEcosystemConfig[token].minValue === "undefined"
        ) {
            throw TypeError(`Could not find minValue for ${token.toUpperCase()} in the configuration`);
        }

        const minValue: BigNumber = new BigNumber(arkEcosystemConfig[token].minValue);
        if (minValue.isNaN()) {
            throw TypeError(`Bad minValue for ${token.toUpperCase()} in the configuration`);
        }
        return minValue.lte(amount);
    }

    /**
     * @dev Check if the sender has sufficient balance for the requested transfer
     * @param sender {Username} The username/platform pair of the sender
     * @param token {string}    The token for the ArkEcosystem blockchain to transfer on
     * @param amount {BigNumber} The amount the sender requests to transfer
     * @returns {Promise<WalletBalance>} The balance, address and success = True if balance is sufficient
     */
    protected static async senderHasBalance(
        sender: Username,
        token: string,
        amount: BigNumber,
    ): Promise<WalletBalance> {
        token = token.toLowerCase();
        if (
            typeof arkEcosystemConfig[token] === "undefined" ||
            typeof arkEcosystemConfig[token].transactionFee === "undefined"
        ) {
            throw TypeError(`Could not find ${token.toUpperCase()} in the configuration`);
        }

        const fee: BigNumber = new BigNumber(arkEcosystemConfig[token].transactionFee);
        if (fee.isNaN()) {
            throw TypeError(`Bad transaction fee for ${token.toUpperCase()} in the configuration`);
        }

        const walletAddress: string = await User.getWalletAddress(sender, token);
        const balance: BigNumber = await ArkWallet.getBalance(walletAddress, token);

        return {
            success: amount.plus(fee).lte(balance),
            address: walletAddress,
            balance,
        };
    }
}
