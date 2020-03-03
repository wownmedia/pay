import BigNumber from "bignumber.js";
import { config, logger } from "../../core";
import { ArkEcosystemWallet, Reply, TransactionResponse, Transfer, Wallet, WalletBalance } from "../../interfaces";
import { ArkWallet } from "../ark-wallet";
import { Currency } from "../currency/";
import { Messenger } from "../messenger";
import { Storage } from "../storage/";
import { Send } from "./send";

const arkEcosystemConfig = config.get("arkEcosystem");

export class Withdraw extends Send {
    /**
     * @dev Generate and transfer a transaction to withdraw funds of a user to an ArEcosystem wallet
     * @param transfer {Transfer}   A parsed withdraw request
     * @returns {Promise<Reply}>}   Object with message to send to sender per direct message
     */
    public static async transfer(transfer: Transfer): Promise<Reply> {
        try {
            // Check if the Sender has sufficient balance
            const balanceCheckAmount = transfer.arkToshiValue === null ? new BigNumber(1) : transfer.arkToshiValue;
            const senderBalance: WalletBalance = await this.senderHasBalance(
                transfer.sender,
                transfer.token,
                balanceCheckAmount,
            );
            if (!senderBalance.success) {
                const reply: Reply = Messenger.senderLowBalance(
                    senderBalance.balance,
                    transfer.arkToshiValue,
                    transfer.token,
                    senderBalance.address,
                );
                reply.error = "Insufficient balance";
                return reply;
            }

            if (transfer.arkToshiValue === null) {
                transfer.arkToshiValue = this.getWithdrawBalance(senderBalance.balance, transfer.token);
            }

            // and..... send
            const vendorField: string = "ARK Pay - Withdraw";
            return await this.sendTransaction(transfer, vendorField);
        } catch (e) {
            logger.warn(e.message);
            const reply: Reply = Messenger.errorMessage();
            reply.error = e.message;
            return reply;
        }
    }

    /**
     * @dev Calculate the maximal withdrawable balance
     * @param balance {BigNumber}   The balance of the wallet
     * @param token {string}        The token of the ArkEcosystem Blockchain to check the fees for
     * @returns {BigNumber} The maximal possible withdraw amount
     * @protected
     */
    protected static getWithdrawBalance(balance: BigNumber, token: string): BigNumber {
        token = token.toLowerCase();
        const fee: BigNumber = new BigNumber(arkEcosystemConfig[token].transactionFee);

        return balance.minus(fee);
    }

    /**
     * @dev Generate and broadcast a withdraw transfer
     * @param transfer {Transfer}    A parsed withdraw transfer
     * @param vendorField {string}  The vendor field text
     * @returns {Promise<Reply>} Object with message to send to sender per direct message
     * @protected
     */
    protected static async sendTransaction(transfer: Transfer, vendorField: string): Promise<Reply> {
        const networkVersion: number = ArkWallet.getArkEcosystemNetworkVersionForToken(transfer.token);
        const walletSender: Wallet = await Storage.getWallet(
            transfer.sender.username,
            transfer.sender.platform,
            transfer.token,
        );

        logger.info(`A`);

        const token: string = transfer.token;
        const txSender: ArkEcosystemWallet = {
            address: walletSender.address,
            encryptedSeed: walletSender.encryptedSeed,
            networkVersion,
            token,
        };

        logger.info(`B`);

        const txReceiver: ArkEcosystemWallet = {
            address: transfer.address,
            encryptedSeed: "",
            networkVersion,
            token,
        };

        logger.info(`C`);

        const response: TransactionResponse[] = await ArkWallet.sendTransaction(
            txSender,
            txReceiver,
            transfer.arkToshiValue,
            vendorField,
            token,
        );

        logger.info(`D`);

        const transactionId: string = this.processTransaction(response);
        const usdValue: BigNumber = await Currency.baseCurrencyUnitsToUSD(transfer.arkToshiValue, transfer.token);
        const reply: Reply = Messenger.withdrawMessage(transfer.arkToshiValue, usdValue, transactionId, transfer.token);
        reply.data = transactionId;
        return reply;
    }
}
