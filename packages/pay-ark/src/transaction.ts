import { configManager, transactionBuilder } from "@arkecosystem/crypto";
import { config } from "@cryptology.hk/pay-config";
import BigNumber from "bignumber.js";
import moment from "moment";
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
        secondPassphrase?: string,
    ): Promise<any> {
        // Load network specific config
        const config = await this.getNetworkConfig(token);
        if (config !== null) {
            configManager.setConfig(config);
        }

        let transaction = transactionBuilder
            .transfer()
            .amount(amount.toNumber())
            .recipientId(recipientId)
            .vendorField(vendorField)
            .fee(fee.toNumber());

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
        try {
            return typeof arkEcosystemConfig[token].epoch !== "undefined" ? arkEcosystemConfig[token].epoch : null;
        } catch (e) {
            return null;
        }
    }
}
