import {
    APITransaction,
    ArkEcosystemWallet,
    ArkWallet,
    TransactionResponse,
    WalletBalance,
} from "@cryptology.hk/pay-ark";
import { config } from "@cryptology.hk/pay-config";
import { Currency } from "@cryptology.hk/pay-currency";
import { logger } from "@cryptology.hk/pay-logger";
import { Messenger, Reply } from "@cryptology.hk/pay-messenger";
import { Storage, Wallet } from "@cryptology.hk/pay-storage";
import { User, Username } from "@cryptology.hk/pay-user";
import BigNumber from "bignumber.js";
import Joi from "joi";
import { Transfer } from "../interfaces";

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
    public static async transfer(
        transfer: Transfer,
        vendorField: string,
        smallFooter: boolean = false,
    ): Promise<Reply> {
        try {
            // Check if not sending to self
            if (this.sendingToSelf(transfer.sender, transfer.receiver)) {
                return Messenger.errorMessage();
            }

            // Check if amount is above minimum
            if (!this.amountLargerThanMinimum(transfer.arkToshiValue, transfer.token)) {
                return Messenger.minAmountMessage(transfer.token);
            }

            // Check if the Sender has sufficient balance
            const senderBalance: WalletBalance = await this.senderHasBalance(
                transfer.sender,
                transfer.token,
                transfer.arkToshiValue,
            );
            if (!senderBalance.success) {
                return Messenger.senderLowBalance(
                    senderBalance.balance,
                    transfer.arkToshiValue,
                    transfer.token,
                    senderBalance.address,
                );
            }

            // and..... send
            return await this.sendTransaction(transfer, vendorField, smallFooter);
        } catch (e) {
            logger.warn(e.message);
            return Messenger.errorMessage();
        }
    }

    protected static async sendTransaction(
        transfer: Transfer,
        vendorField: string,
        smallFooter: boolean,
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
        );

        const transactionId: string = this.processTransaction(response);
        const usdValue: BigNumber = await Currency.baseCurrencyUnitsToUSD(transfer.arkToshiValue, transfer.token);
        return Messenger.transferMessage(
            transfer.sender,
            transfer.receiver,
            transactionId,
            transfer.arkToshiValue,
            usdValue,
            transfer.token,
            txReceiver.address,
            smallFooter,
        );
    }

    protected static processTransaction(response: TransactionResponse[]): string {
        for (const item in response) {
            if (response[item]) {
                const data: APITransaction = response[item].response.data;
                if (data.accept[0]) {
                    return data.accept[0];
                }
            }
        }
        throw new Error("Could not succesfully send Transaction");
    }

    protected static sendingToSelf(sender: Username, receiver: Username): boolean {
        // Check the Users
        Joi.assert({ sender, receiver }, usernameSchema);
        return sender.username === receiver.username && sender.platform === receiver.platform;
    }

    protected static amountLargerThanMinimum(amount: BigNumber, token: string): boolean {
        token = token.toLowerCase();
        if (
            typeof arkEcosystemConfig[token] === "undefined" ||
            typeof arkEcosystemConfig[token].minValue === "undefined"
        ) {
            throw TypeError(`Could not find ${token.toUpperCase()} in the configuration`);
        }

        const minValue: BigNumber = new BigNumber(arkEcosystemConfig[token].minValue);
        if (minValue.isNaN()) {
            throw TypeError(`Bad minValue for ${token.toUpperCase()} in the configuration`);
        }
        return minValue.lte(amount);
    }

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
