import { Identities, Interfaces } from "@arkecosystem/crypto";
import BigNumber from "bignumber.js";
import { generateMnemonic } from "bip39";
import Joi from "joi";
import { config, logger } from "../core";
import { ApiResponse, APITransaction, ArkEcosystemWallet, TransactionResponse } from "../interfaces";
import { Network } from "./network";
import { SecureStorage } from "./storage/secure-storage";
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

/**
 * @dev Basic ArkEcosystem wallet functions.
 */
export class ArkWallet {
    /**
     * @dev Generate a new ArkEcosystem Wallet
     * @param token {string}    The ArkEcosystem token to generate a wallet for (e.g. ARK, DARK)
     * @returns {ArkEcosystemWallet} The generated wallet
     */
    public static generateWallet(token: string): ArkEcosystemWallet {
        const networkVersion = this.getArkEcosystemNetworkVersionForToken(token);

        // Create the wallet
        const seed: string = generateMnemonic();
        const encryptedSeed: string = SecureStorage.generateSecretFromSeed(seed);
        const publicKey: string = Identities.PublicKey.fromPassphrase(seed);
        const address: string = Identities.Address.fromPublicKey(publicKey, networkVersion);

        // Check the wallet
        Joi.assert({ address, encryptedSeed }, walletSchema);

        return {
            encryptedSeed,
            address,
            networkVersion,
            token,
        };
    }

    /**
     * @dev Retrieve the configured network version for a token from the config
     * @param token {string}    The ArkEcosystem token to retrieve the network version for
     * @returns {number}        The retrieved network version
     */
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
        logger.info(`Getting Network version for ${token}: ${networkVersion}`);
        return networkVersion.toNumber();
    }

    /**
     * @dev Retrieve the configured network transfer fee for a token from the config
     * @param token {string}    The ArkEcosystem token to retrieve the transfer fee for
     * @returns {BigNumber}        The retrieved transfer fee
     */
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

    /**
     * @dev Retrieve the balance for a wallet
     * @param wallet {string}   The wallet address
     * @param token {string}    The ArkEcosystem token to retreive the wallet balance from
     * @returns {Promise<BigNumber>} The balance in ArkToshi
     */
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

    /**
     * @dev Generate and send a transfer
     * @param sender {ArkEcosystemWallet}   The sender of the transfer
     * @param receiver {ArkEcosystemWallet} The receiver of the transfer
     * @param amount {BigNumber}            The amount to transfer
     * @param vendorField {string}          The vendor field message
     * @param token {string}                The ArkEcosystem token of the blockchain where to transfer
     * @param nonce
     */
    public static async sendTransaction(
        sender: ArkEcosystemWallet,
        receiver: ArkEcosystemWallet,
        amount: BigNumber,
        vendorField: string,
        token: string,
        nonce?: number
    ): Promise<TransactionResponse[]> {
        if (!nonce) {
            nonce = 0;
        }
        const fee = this.getArkEcosystemNetworkTransactionFee(token);
        const seed = SecureStorage.getSeedFromSecret(sender.encryptedSeed);
        const transaction: Interfaces.ITransactionData = await ArkTransaction.generateTransferTransaction(
            amount,
            receiver.address,
            vendorField,
            fee,
            seed,
            token,
            nonce
        );

        if(transaction.nonce.isGreaterThan(1)) {
            nonce = parseInt(transaction.nonce.toString(), 10);
        }

        const transactions: Interfaces.ITransactionData[] = [];
        transactions.push(transaction);
        return await Network.broadcastTransactions(transactions, token, nonce);
    }
}
