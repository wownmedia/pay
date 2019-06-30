import "jest-extended";

// mock config
import { config } from "../../src/core";
const configMock = jest.spyOn(config, "get");
configMock.mockImplementation(() => ({
    seed: "this is a top secret passphrase",
}));

// mock database
import { payDatabase } from "../../src/core";
import { Wallet } from "../../src/interfaces";
import { Storage } from "../../src/services/storage";

describe("pay-storage: Storage()", () => {
    describe("getWallet", () => {
        it("should return a valid wallet", async () => {
            const payDatabaseMock: any = jest.spyOn(payDatabase, "query");
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
            const payDatabaseMock: any = jest.spyOn(payDatabase, "query");
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
            const payDatabaseMock: any = jest.spyOn(payDatabase, "query");
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
            const payDatabaseMock: any = jest.spyOn(payDatabase, "query");
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
        it("should correctly find an existing submission for a registered server", async () => {
            const payDatabaseMock: any = jest.spyOn(payDatabase, "query");
            payDatabaseMock.mockImplementation(() =>
                Promise.resolve({
                    rows: [
                        {
                            submission: "XXX",
                            signature:
                                "30450221008732a92a48455eb306879c0144e6473ac61036d5b2d460d5e67121f04349d92802202d11935a624b7ac158c015cb97c1edc9d92ad8cb495717c3c28c2e039970f365",
                        },
                    ],
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
            const payDatabaseMock: any = jest.spyOn(payDatabase, "query");
            payDatabaseMock.mockImplementation(() =>
                Promise.resolve({
                    rows: [
                        {
                            submission: "XXX",
                            signature:
                                "30450221008732a92a48455eb306879c0144e6473ac61036d5b2d460d5e67121f04349d92802202d11935a624b7ac158c015cb97c1edc9d92ad8cb495717c3c28c2e039970f365",
                        },
                    ],
                }),
            );
            const result: boolean = await Storage.addSubmission(submission);
            expect(result).toBeTrue();
            payDatabaseMock.mockRestore();
        });
    });
});
