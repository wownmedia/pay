import "jest-extended";
import { config } from "../../src/core";
// Mock Config
const configMock = jest.spyOn(config, "get");
configMock.mockImplementation(() => ({
    encryptionKey: "935bff586aeb4244452802e4cf87eaca",
    seperator: "@",
    baseCurrency: "ark",
    acceptedCurrencies: ["ARK", "Ѧ", "USD", "$", "EUR", "€", "BTC", "BCH", "GBP"],
    ark: {
        networkVersion: 23,
        minValue: 2000000,
        transactionFee: 300,
        nodes: [
            {
                host: "localhost",
                port: 4003,
            },
        ],
    },
    dark: {
        networkVersion: 30,
        minValue: 2000000,
        transactionFee: 300,
        nodes: [
            {
                host: "localhost",
                port: 4003,
            },
        ],
    },
}));
import { Storage } from "../../src";
import { User, Username } from "../../src";

describe("pay-user", () => {
    describe("getWalletAddress()", () => {
        it("should retrieve correctly an existing wallet address", async () => {
            const storageMock = jest.spyOn(Storage, "getWallet");
            storageMock.mockImplementation(() =>
                Promise.resolve({
                    address: "XXX",
                    encryptedSeed: "YYY",
                }),
            );
            const testUser: Username = {
                username: "AAA",
                platform: "BBB",
            };
            const token = "ARK";
            const result = await User.getWalletAddress(testUser, token);
            expect(result).toBe("XXX");
            storageMock.mockRestore();
        });

        it("should create a new wallet address", async () => {
            const storageMock = jest.spyOn(Storage, "getWallet");
            storageMock.mockImplementation(() =>
                Promise.resolve({
                    address: null,
                    encryptedSeed: null,
                }),
            );
            const storageSetMock = jest.spyOn(Storage, "setWallet");
            storageSetMock.mockImplementation(() => Promise.resolve(true));
            const testUser: Username = {
                username: "AAA",
                platform: "BBB",
            };
            const token = "ARK";
            const result = await User.getWalletAddress(testUser, token);
            expect(result).toBeString();
            expect(result).toHaveLength(34);
            storageMock.mockRestore();
            storageSetMock.mockRestore();
        });

        it("should throw on a not accepted token", async () => {
            const storageMock = jest.spyOn(Storage, "getWallet");
            storageMock.mockImplementation(() =>
                Promise.resolve({
                    address: null,
                    encryptedSeed: null,
                }),
            );
            const storageSetMock = jest.spyOn(Storage, "setWallet");
            storageSetMock.mockImplementation(() => Promise.resolve(true));
            const testUser: Username = {
                username: "AAA",
                platform: "BBB",
            };
            const token = "BAD";
            await expect(User.getWalletAddress(testUser, token)).rejects.toThrow();
            storageMock.mockRestore();
            storageSetMock.mockRestore();
        });
    });
});
configMock.mockRestore();
