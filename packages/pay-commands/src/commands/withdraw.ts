import { ArkEcosystemWallet, ArkWallet, TransactionResponse, WalletBalance } from "@cryptology.hk/pay-ark";
import { config } from "@cryptology.hk/pay-config";
import { Currency } from "@cryptology.hk/pay-currency";
import { logger } from "@cryptology.hk/pay-logger";
import { Messenger, Reply } from "@cryptology.hk/pay-messenger";
import { Storage, Wallet } from "@cryptology.hk/pay-storage";
import BigNumber from "bignumber.js";
import { Transfer } from "../command";
import { Send } from "./send";

const arkEcosystemConfig = config.get("arkEcosystem");

export class Withdraw extends Send {
    public static async transfer(transfer: Transfer): Promise<Reply> {
        try {
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

            if (transfer.arkToshiValue === null) {
                transfer.arkToshiValue = this.__getWithdrawBalance(senderBalance.balance, transfer.token);
            }

            // and..... send
            const vendorField: string = "ARK Pay - Withdraw";
            return await this.__sendTransaction(transfer, vendorField, true);
        } catch (e) {
            logger.warn(e.message);
            return Messenger.errorMessage();
        }
    }

    protected static __getWithdrawBalance(balance: BigNumber, token: string): BigNumber {
        token = token.toLowerCase();
        if (
            typeof arkEcosystemConfig[token] === "undefined" ||
            arkEcosystemConfig[token].transactionFee === "undefined"
        ) {
            throw TypeError(`Could not find ${token} in the configuration`);
        }

        const fee: BigNumber = new BigNumber(arkEcosystemConfig[token].transactionFee);
        if (fee.isNaN()) {
            throw TypeError(`Bad transaction fee for ${token.toUpperCase()} in the configuration`);
        }

        return balance.minus(fee);
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

        const token: string = transfer.token;
        const txSender: ArkEcosystemWallet = {
            address: walletSender.address,
            encryptedSeed: walletSender.encryptedSeed,
            networkVersion,
            token,
        };
        const txReceiver: ArkEcosystemWallet = {
            address: transfer.address,
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

        const transactionId: string = this.__processTransaction(response);
        const usdValue: BigNumber = await Currency.baseCurrencyUnitsToUSD(transfer.arkToshiValue, transfer.token);
        return Messenger.withdrawMessage(transfer.arkToshiValue, usdValue, transactionId, transfer.token);
    }
}