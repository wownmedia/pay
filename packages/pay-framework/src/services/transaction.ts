import { Identities, Interfaces, Managers, Transactions } from "@arkecosystem/crypto";
import BigNumber from "bignumber.js";
import moment from "moment";
import { config } from "../core";
import { Network } from "./network";

const arkEcosystemConfig = config.get("arkEcosystem");

export class ArkTransaction {
    /**
     * @dev Generate and sign a Transfer transaction for an ArkEcosystem blockchain
     * @param amount {BigNumber}    The amount to transfer
     * @param recipientId {string}  The wallet of the receiver of the transfer
     * @param vendorField {string}  The vendor field
     * @param fee {BigNumber}       The fee to set for the Transfer
     * @param seed  {string}        The decrypted seed of the sender's wallet
     * @param token {string}        The token of the ArkEcosystem blockchain to send the transfer on
     * @param nonce
     * @param secondPassphrase {string} Optional decrypted second seed of the sender's wallet
     * @returns {Promise<any>}      A signed structure of the Transfer
     */
    public static async generateTransferTransaction(
        amount: BigNumber,
        recipientId: string,
        vendorField: string,
        fee: BigNumber,
        seed: string,
        token: string,
        nonce?: number,
        secondPassphrase?: string,
    ): Promise<Interfaces.ITransactionData> {
        // Load network specific config
        token = token.toLowerCase();
        await ArkTransaction.setupNetwork(token);

        const senderPublicKey: string = ArkTransaction.getPublicKeyFromSeed(seed);
        const senderWallet: string = ArkTransaction.getAddressFromPublicKey(
            senderPublicKey,
            arkEcosystemConfig[token].networkVersion,
        );
        if (!nonce || nonce < 1) {
            nonce = await Network.getNonceForWallet(senderWallet, token);
        }
        nonce += 1;

        if(arkEcosystemConfig[token].noVendorField) {
            vendorField="";
        }

        let transaction = Transactions.BuilderFactory.transfer()
            .amount(amount.toFixed(0))
            .recipientId(recipientId)
            .vendorField(vendorField)
            .fee(fee.toFixed(0))
            .nonce(nonce.toString());

        // todo somehow it doesn't take it as 255 from the setConfig with ARK mainnet
        if (Buffer.from(vendorField).length > 64 && Buffer.from(vendorField).length <= 255) {
            transaction.data.vendorField = vendorField;
        }

        // todo: Remove this workaround for pre 2.4 networks that have a different epoch than ARK Devnet
        const epoch: string = this.getArkEcosystemEpochForToken(token);
        if (epoch !== null) {
            transaction.data.timestamp = this.calculateTimestamp(epoch);
        }

        transaction = transaction.sign(seed);

        if (secondPassphrase) {
            transaction = transaction.secondSign(secondPassphrase);
        }

        return transaction.getStruct();
    }

    private static async setupNetwork(token: string) {
        const networkConfig: Interfaces.INetworkConfig = await Network.getNetworkConfig(token);
        if (networkConfig !== null) {
            Managers.configManager.setConfig(networkConfig);
        }

        let height: number = await Network.getCurrentHeight(token);
        if (height === null) {
            height = 1;
        }
        Managers.configManager.setHeight(height);
    }

    /**
     * @dev Retrieve the network config of an ArkEcosystem > v2.4 Blockchain
     * @param token {string}    The token of the ArkEcosystem blockchain
     * @returns {Promise<any>}  The config of the blockchain
     */
    public static async getNetworkConfig(token: string): Promise<any> {
        token = token.toLowerCase();
        try {
            const config = await Network.getFromAPI("/api/v2/node/configuration/crypto", token);
            return config.data;
        } catch (e) {
            return null;
        }
    }

    /**
     * Generate an Address from a public key for a blockchain.
     * @param {string} publicKey The public key of the wallet to generate the address for.
     * @param {number} networkVersion The network version of the blockchain to generate the address for.
     * @returns {string} The generated address.
     * @static
     */
    private static getAddressFromPublicKey(publicKey: string, networkVersion: number): string {
        return Identities.Address.fromPublicKey(publicKey, networkVersion);
    }

    private static getPublicKeyFromSeed(seed: string): string {
        return Identities.PublicKey.fromPassphrase(seed);
    }

    /**
     * @dev Calculate a timestamp based on an epoch
     * @param epoch {string} Epoch (e.g. "2019-05-24T11:48:58.165Z")
     * @returns {number}    The calculated timestamp
     * @private
     */
    private static calculateTimestamp(epoch: string): number {
        const epochTime = moment(epoch)
            .utc()
            .valueOf();
        const now = moment().valueOf();
        return Math.floor((now - epochTime) / 1000);
    }

    /**
     * @dev Retrieve a configured epoch for an ArkEcosystem Blockchain from the config
     * @param token {string}    The token for the ArkEcosystem blockchain
     * @returns {string}        Epoch (e.g. "2019-05-24T11:48:58.165Z")
     * @private
     */
    private static getArkEcosystemEpochForToken(token: string): string {
        token = token.toLowerCase();
        return typeof arkEcosystemConfig[token].epoch !== "undefined" ? arkEcosystemConfig[token].epoch : null;
    }
}
