import "jest-extended";

import BigNumber from "bignumber.js";
import { Transaction } from "../src/";

describe("pay-ark: Transaction()", () => {
    describe("generateTransferTransaction()", () => {
        it("should correctly generate and sign a transaction on ARK without second passphrase", () => {
            const networkVersion: number = 23;
            const amount: BigNumber = new BigNumber(1);
            const recipientId: string = "AUDud8tvyVZa67p3QY7XPRUTjRGnWQQ9Xv";
            const vendorField: string = "test";
            const fee: BigNumber = new BigNumber(2);
            const seed: string = "this is a top secret passphrase";
            const result = Transaction.generateTransferTransaction(
                networkVersion,
                amount,
                recipientId,
                vendorField,
                fee,
                seed,
            );
            expect(result).toContainKeys([
                "amount",
                "fee",
                "id",
                "network",
                "recipientId",
                "senderPublicKey",
                "signature",
                "timestamp",
                "type",
                "vendorField",
                "version",
            ]);
        });

        it("should correctly generate and sign a transaction on ARK with second passphrase", () => {
            const networkVersion: number = 23;
            const amount: BigNumber = new BigNumber(1);
            const recipientId: string = "AUDud8tvyVZa67p3QY7XPRUTjRGnWQQ9Xv";
            const vendorField: string = "test";
            const fee: BigNumber = new BigNumber(2);
            const seed: string = "this is a top secret passphrase";
            const result = Transaction.generateTransferTransaction(
                networkVersion,
                amount,
                recipientId,
                vendorField,
                fee,
                seed,
                seed,
            );
            expect(result).toContainKeys([
                "amount",
                "fee",
                "id",
                "network",
                "recipientId",
                "senderPublicKey",
                "signature",
                "secondSignature",
                "timestamp",
                "type",
                "vendorField",
                "version",
            ]);
        });

        it("should correctly generate and sign a transaction on DARK without second passphrase", () => {
            const networkVersion: number = 30;
            const amount: BigNumber = new BigNumber(1);
            const recipientId: string = "D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax";
            const vendorField: string = "test";
            const fee: BigNumber = new BigNumber(2);
            const seed: string = "this is a top secret passphrase";
            const result = Transaction.generateTransferTransaction(
                networkVersion,
                amount,
                recipientId,
                vendorField,
                fee,
                seed,
            );
            expect(result).toContainKeys([
                "amount",
                "fee",
                "id",
                "network",
                "recipientId",
                "senderPublicKey",
                "signature",
                "timestamp",
                "type",
                "vendorField",
                "version",
            ]);
        });
    });
});
