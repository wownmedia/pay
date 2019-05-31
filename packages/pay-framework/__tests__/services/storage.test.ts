import "jest-extended";

// mock database
import { payDatabase } from "../../src/core";

import { Storage, Wallet } from "../../src/services";

describe("pay-storage: Storage()", () => {
    describe("getWallet", () => {
        it("should return a valid wallet", async () => {
            const payDatabaseMock = jest.spyOn(payDatabase, "query");
            payDatabaseMock.mockImplementation(() =>
                Promise.resolve({
                    rows: [{ address: "xxx", seed: "YYY" }],
                }),
            );
            const result = await Storage.getWallet("marcs1970", "reddit", "ark");
            expect(result).toContainAllKeys(["address", "encryptedSeed"]);
            payDatabaseMock.mockRestore();
        });

        it("should return null if the wallet is not found", async () => {
            const payDatabaseMock = jest.spyOn(payDatabase, "query");
            payDatabaseMock.mockImplementation(() =>
                Promise.resolve({
                    rows: [],
                }),
            );
            const result = await Storage.getWallet("marcs1970", "reddit", "ark");
            expect(result).toBeNull();
            payDatabaseMock.mockRestore();
        });
    });

    describe("setWallet", () => {
        const username: string = "AAA";
        const platform: string = "reddit";
        const token: string = "ARK";
        const wallet: Wallet = {
            address: "XXX",
            encryptedSeed: "YYY",
        };
        it("should correctly store a wallet to the DB", async () => {
            const payDatabaseMock = jest.spyOn(payDatabase, "query");
            payDatabaseMock.mockImplementation(() =>
                Promise.resolve({
                    rows: [{ address: "xxx", seed: "YYY" }],
                }),
            );
            const result: boolean = await Storage.setWallet(username, platform, token, wallet);
            expect(result).toBeTrue();
            payDatabaseMock.mockRestore();
        });
        it("should throw an error if it cant insert the new wallet", async () => {
            const payDatabaseMock = jest.spyOn(payDatabase, "query");
            payDatabaseMock.mockImplementation(() =>
                Promise.resolve({
                    rows: {},
                }),
            );
            await expect(Storage.setWallet(username, platform, token, wallet)).rejects.toThrow(Error);
            payDatabaseMock.mockRestore();
        });
    });

    describe("checkSubmission()", () => {
        const submission: string = "XXX";
        it("should correctly find an exisitng submission", async () => {
            const payDatabaseMock = jest.spyOn(payDatabase, "query");
            payDatabaseMock.mockImplementation(() =>
                Promise.resolve({
                    rows: [{ submission: "XXX" }],
                }),
            );
            const result: boolean = await Storage.checkSubmission(submission);
            expect(result).toBeTrue();
            payDatabaseMock.mockRestore();
        });
    });

    describe("addSubmission()", () => {
        const submission: string = "XXX";
        it("should correctly find an exisitng submission", async () => {
            const payDatabaseMock = jest.spyOn(payDatabase, "query");
            payDatabaseMock.mockImplementation(() =>
                Promise.resolve({
                    rows: [{ submission: "XXX" }],
                }),
            );
            const result: boolean = await Storage.addSubmission(submission);
            expect(result).toBeTrue();
            payDatabaseMock.mockRestore();
        });
    });
});
