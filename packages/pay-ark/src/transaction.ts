import { configManager, transactionBuilder } from "@arkecosystem/crypto";
import { config } from "@cryptology.hk/pay-config";
import { logger } from "@cryptology.hk/pay-logger";
import BigNumber from "bignumber.js";
import moment from "moment";
import { Network } from "./network";

const arkEcosystemConfig = config.get("arkEcosystem");

export class ArkTransaction {
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

        logger.info(`Config: ${JSON.stringify(config)}`);
        let transaction = transactionBuilder
            .transfer()
            .amount(amount.toNumber())
            .recipientId(recipientId)
            .vendorField(vendorField)
            .fee(fee.toNumber());

        // todo: Remove this workaround for pre 2.4 networks that have a different epoch than ARK Devnet
        const epoch: string = this.__getArkEcosystemEpochForToken(token);
        if (epoch !== null) {
            transaction.data.timestamp = this.__calculateTimestamp(epoch);
        }

        transaction = transaction.sign(seed);

        if (secondPassphrase) {
            transaction = transaction.secondSign(secondPassphrase);
        }

        return transaction.getStruct();
    }

    public static async getNetworkConfig(token: string): Promise<any> {
        token = token.toLowerCase();
        try {
            const config = await Network.getFromAPI("/api/v2/node/configuration/crypto", token);
            return config.data;
        } catch (e) {
            return null;
        }
    }

    private static __calculateTimestamp(epoch: string): number {
        const epochTime = moment(epoch)
            .utc()
            .valueOf();
        const now = moment().valueOf();
        return Math.floor((now - epochTime) / 1000);
    }

    private static __getArkEcosystemEpochForToken(token: string): string {
        token = token.toLowerCase();
        return typeof arkEcosystemConfig[token].epoch !== "undefined" ? arkEcosystemConfig[token].epoch : null;
    }
}
