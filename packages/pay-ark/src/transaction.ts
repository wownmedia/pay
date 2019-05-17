import { transactionBuilder } from "@arkecosystem/crypto";
import BigNumber from "bignumber.js";

export class ArkTransaction {
    public static generateTransferTransaction(
        networkVersion: number,
        amount: BigNumber,
        recipientId: string,
        vendorField: string,
        fee: BigNumber,
        seed: string,
        secondPassphrase?: string,
    ): any {
        let transaction = transactionBuilder
            .transfer()
            .network(networkVersion)
            .amount(parseInt(amount.toFixed(0), 10))
            .recipientId(recipientId)
            .vendorField(vendorField)
            .fee(parseInt(fee.toFixed(0), 10));

        transaction = transaction.sign(seed);

        if (secondPassphrase) {
            transaction = transaction.secondSign(secondPassphrase);
        }

        return transaction.getStruct();
    }
}
