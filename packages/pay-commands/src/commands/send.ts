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
import { Transfer } from "../command";

const arkEcosystemConfig = config.get("arkEcosystem");

const usernameSchema = Joi.object().keys({
    sender: {
        username: Joi.string()
            .token()
            .required(),
        platform: Joi.string()
            .token()
            .required(),
    },
    receiver: {
        username: Joi.string()
            .token()
            .required(),
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
            logger.info(`VendorField: ${vendorField}`);
            // Check if not sending to self
            if (this.__sendingToSelf(transfer.sender, transfer.receiver)) {
                return Messenger.errorMessage();
            }

            // Check if amount is above minimum
            if (!this.__amountLargerThanMinimum(transfer.arkToshiValue, transfer.token)) {
                return Messenger.minAmountMessage(transfer.token);
            }

            // Check if the Sender has sufficient balance
            const senderBalance: WalletBalance = await this.__senderHasBalance(
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
            return await this.__sendTransaction(transfer, vendorField, smallFooter);
        } catch (e) {
            logger.warn(e.message);
            return Messenger.errorMessage();
        }
    }

    protected static async __sendTransaction(
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
        const walletReceiver: Wallet = await Storage.getWallet(
            transfer.receiver.username,
            transfer.receiver.platform,
            transfer.token,
        );
        const token: string = transfer.token;
        const txSender: ArkEcosystemWallet = {
            address: walletSender.address,
            encryptedSeed: walletSender.encryptedSeed,
            networkVersion,
            token,
        };
        const txReceiver: ArkEcosystemWallet = {
            address: walletReceiver.address,
            encryptedSeed: walletReceiver.encryptedSeed,
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

        const transactionId: string = this.__processTransaction(response);
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

    protected static __processTransaction(response: TransactionResponse[]): string {
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

    protected static __sendingToSelf(sender: Username, receiver: Username): boolean {
        // Check the Users
        const { error } = Joi.validate({ sender, receiver }, usernameSchema);
        if (error) {
            throw TypeError(error);
        }
        return sender.username === receiver.username && sender.platform === receiver.platform;
    }

    protected static __amountLargerThanMinimum(amount: BigNumber, token: string): boolean {
        token = token.toLowerCase();
        if (typeof arkEcosystemConfig[token] === "undefined" || arkEcosystemConfig[token].minValue === "undefined") {
            throw TypeError(`Could not find ${token.toUpperCase()} in the configuration`);
        }

        const minValue: BigNumber = new BigNumber(arkEcosystemConfig[token].minValue);
        if (minValue.isNaN()) {
            throw TypeError(`Bad minValue for ${token.toUpperCase()} in the configuration`);
        }
        logger.info(`MinValue: ${minValue} Amount: ${amount} token: ${token} `);
        return minValue.lte(amount);
    }

    protected static async __senderHasBalance(
        sender: Username,
        token: string,
        amount: BigNumber,
    ): Promise<WalletBalance> {
        token = token.toLowerCase();

        if (
            typeof arkEcosystemConfig[token] === "undefined" ||
            arkEcosystemConfig[token].transactionFee === "undefined"
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
