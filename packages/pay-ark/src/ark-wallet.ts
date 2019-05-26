import { crypto } from "@arkecosystem/crypto";
import { config } from "@cryptology.hk/pay-config";
import { logger } from "@cryptology.hk/pay-logger";
import { SecureStorage } from "@cryptology.hk/pay-storage";
import BigNumber from "bignumber.js";
import { generateMnemonic } from "bip39";
import Joi from "joi";
import { ApiResponse, APITransaction, Network, TransactionResponse } from "./network";
import { ArkTransaction } from "./transaction";
const ARKTOSHI = new BigNumber(Math.pow(10, 8));

const arkEcosystemConfig = config.get("arkEcosystem");

const encryptedSeedFormat = new RegExp(/^[a-z\d]{32}[:](?:[a-z\d]{32})+$/);
const walletSchema = Joi.object().keys({
    encryptedSeed: Joi.string()
        .regex(encryptedSeedFormat)
        .required(),
    address: Joi.string()
        .token()
        .length(34)
        .required(),
});

export interface WalletBalance {
    address: string;
    balance: BigNumber;
    success: boolean;
}

export interface ArkEcosystemWallet {
    address: string;
    encryptedSeed: string;
    networkVersion: number;
    token: string;
}

export class ArkWallet {
    public static generateWallet(token: string): ArkEcosystemWallet {
        const networkVersion = this.getArkEcosystemNetworkVersionForToken(token);

        // Create the wallet
        const seed: string = generateMnemonic();
        const encryptedSeed: string = SecureStorage.generateSecretFromSeed(seed);
        const publicKey: string = crypto.getKeys(seed).publicKey;
        const address: string = crypto.getAddress(publicKey, networkVersion);

        // Check the wallet
        Joi.assert({ address, encryptedSeed }, walletSchema);

        return {
            encryptedSeed,
            address,
            networkVersion,
            token,
        };
    }

    public static getArkEcosystemNetworkVersionForToken(token: string): number {
        token = token.toLowerCase();
        if (
            typeof arkEcosystemConfig[token] === "undefined" ||
            arkEcosystemConfig[token].networkVersion === "undefined"
        ) {
            throw TypeError(`Could not find ${token.toUpperCase()} in the configuration`);
        }

        const networkVersion: BigNumber = new BigNumber(arkEcosystemConfig[token].networkVersion);
        if (networkVersion.isNaN()) {
            throw TypeError(`Bad network version for ${token.toUpperCase()} in the configuration`);
        }

        return networkVersion.toNumber();
    }

    public static getArkEcosystemNetworkTransactionFee(token: string): BigNumber {
        token = token.toLowerCase();
        if (
            typeof arkEcosystemConfig[token] === "undefined" ||
            arkEcosystemConfig[token].transactionFee === "undefined"
        ) {
            throw TypeError(`Could not find ${token.toUpperCase()} in the configuration`);
        }

        const transactionFee: BigNumber = new BigNumber(arkEcosystemConfig[token].transactionFee);
        if (transactionFee.isNaN()) {
            throw TypeError(`Bad transaction fee for ${token.toUpperCase()} in the configuration`);
        }

        return transactionFee;
    }

    public static async getBalance(wallet: string, token: string): Promise<BigNumber> {
        let balance: BigNumber = new BigNumber(0);
        logger.info(`GETTING BALANCE: ${wallet} at ${token}`);

        // In case the wallet is new the Node will return a 404 Error
        // Using the try{} catch{} to avoid getting an error there
        try {
            const response: ApiResponse = await Network.getFromAPI(`/api/v2/wallets/${wallet}`, token);
            const retrievedWallet: APITransaction = response.data;
            balance = new BigNumber(retrievedWallet.balance);
        } catch (e) {
            logger.info(e.message);
        }

        if (balance.isNaN() || balance.lt(0)) {
            balance = new BigNumber(0);
        }

        logger.info(`BALANCE for ${wallet} at ${token}: ${balance.div(ARKTOSHI).toNumber()}`);
        return balance;
    }

    public static async sendTransaction(
        sender: ArkEcosystemWallet,
        receiver: ArkEcosystemWallet,
        amount: BigNumber,
        vendorField: string,
        token: string,
    ): Promise<TransactionResponse[]> {
        const fee = this.getArkEcosystemNetworkTransactionFee(token);
        const seed = SecureStorage.getSeedFromSecret(sender.encryptedSeed);
        const transaction = await ArkTransaction.generateTransferTransaction(
            amount,
            receiver.address,
            vendorField,
            fee,
            seed,
            token,
        );

        const transactions: any[] = [];
        transactions.push(transaction);
        return await Network.broadcastTransactions(transactions, token);
    }
}
