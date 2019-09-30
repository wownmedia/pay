import BigNumber from "bignumber.js";
import "jest-extended";

import { config } from "../../../src/core";

// Mock Config
const configMock = jest.spyOn(config, "get");
configMock.mockImplementation(() => ({
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
        transactionFee: 300,
        nodes: [
            {
                host: "localhost",
                port: 4003,
            },
        ],
    },
    min: {
        networkVersion: 30,
        transactionFee: 300,
        minValue: "bad",
        nodes: [
            {
                host: "localhost",
                port: 4003,
            },
        ],
    },
    test: {
        networkVersion: 23,
        minValue: 2000000,
        transactionFee: "bad",
        nodes: [
            {
                host: "localhost",
                port: 4003,
            },
        ],
    },
    fee: {
        networkVersion: 23,
        minValue: 2000000,
        nodes: [
            {
                host: "localhost",
                port: 4003,
            },
        ],
    },
}));

import { Reply, Transfer, Username } from "../../../src/interfaces";
import { ArkWallet, User } from "../../../src/services";
import { Send } from "../../../src/services/commands";
import { Currency } from "../../../src/services/currency";
import { Storage } from "../../../src/services/storage";

describe("pay-commands: Send()", () => {
    it("transfer() should be a function", () => {
        expect(Send.transfer).toBeFunction();
    });

    describe("transfer()", () => {
        it("should return an error message when sender and user are the same", async () => {
            const sender: Username = {
                username: "AAA",
                platform: "ZZZ",
            };
            const transfer: Transfer = {
                command: "SEND",
                sender,
                receiver: sender,
            };
            const vendorField: string = "XXX";
            const result: Reply = await Send.transfer(transfer, vendorField);
            expect(result).toContainAllKeys(["directMessageSender", "replyComment", "error"]);
        });

        it("should return an error message when amount is below the minimal amount", async () => {
            const sender: Username = {
                username: "AAA",
                platform: "ZZZ",
            };
            const receiver: Username = {
                username: "BBB",
                platform: "ZZZ",
            };
            const transfer: Transfer = {
                command: "SEND",
                sender,
                receiver,
                token: "ARK",
                arkToshiValue: new BigNumber(1),
            };
            const vendorField: string = "XXX";
            const result: Reply = await Send.transfer(transfer, vendorField);
            expect(result).toContainAllKeys(["directMessageSender", "replyComment", "error"]);
        });

        it("should return an error message when sender tries transfer for badly configured token (no min value)", async () => {
            // Mock User.getWalletAddress()
            const getWalletAddressMock = jest.spyOn(User, "getWalletAddress");
            getWalletAddressMock.mockImplementation(() => Promise.resolve("XXX"));
            // Mock ArkWallet.getBalance()
            const getBalanceMock = jest.spyOn(ArkWallet, "getBalance");
            getBalanceMock.mockImplementation(() => Promise.resolve(new BigNumber(1)));
            const sender: Username = {
                username: "AAA",
                platform: "ZZZ",
            };
            const receiver: Username = {
                username: "BBB",
                platform: "ZZZ",
            };
            const transfer: Transfer = {
                command: "SEND",
                sender,
                receiver,
                token: "DARK",
                arkToshiValue: new BigNumber(2100000000),
            };
            const vendorField: string = "XXX";
            const result: Reply = await Send.transfer(transfer, vendorField);
            expect(result).toContainAllKeys(["directMessageSender", "replyComment", "error"]);
            getBalanceMock.mockRestore();
            getWalletAddressMock.mockRestore();
        });

        it("should return an error message when sender tries transfer for badly configured token (bad min value)", async () => {
            // Mock User.getWalletAddress()
            const getWalletAddressMock = jest.spyOn(User, "getWalletAddress");
            getWalletAddressMock.mockImplementation(() => Promise.resolve("XXX"));
            // Mock ArkWallet.getBalance()
            const getBalanceMock = jest.spyOn(ArkWallet, "getBalance");
            getBalanceMock.mockImplementation(() => Promise.resolve(new BigNumber(1)));
            const sender: Username = {
                username: "AAA",
                platform: "ZZZ",
            };
            const receiver: Username = {
                username: "BBB",
                platform: "ZZZ",
            };
            const transfer: Transfer = {
                command: "SEND",
                sender,
                receiver,
                token: "MIN",
                arkToshiValue: new BigNumber(2100000000),
            };
            const vendorField: string = "XXX";
            const result: Reply = await Send.transfer(transfer, vendorField);
            expect(result).toContainAllKeys(["directMessageSender", "replyComment", "error"]);
            getBalanceMock.mockRestore();
            getWalletAddressMock.mockRestore();
        });

        it("should return an error message when sender tries transfer for badly configured token (no fee)", async () => {
            // Mock User.getWalletAddress()
            const getWalletAddressMock = jest.spyOn(User, "getWalletAddress");
            getWalletAddressMock.mockImplementation(() => Promise.resolve("XXX"));
            // Mock ArkWallet.getBalance()
            const getBalanceMock = jest.spyOn(ArkWallet, "getBalance");
            getBalanceMock.mockImplementation(() => Promise.resolve(new BigNumber(1)));
            const sender: Username = {
                username: "AAA",
                platform: "ZZZ",
            };
            const receiver: Username = {
                username: "BBB",
                platform: "ZZZ",
            };
            const transfer: Transfer = {
                command: "SEND",
                sender,
                receiver,
                token: "FEE",
                arkToshiValue: new BigNumber(2100000000),
            };
            const vendorField: string = "XXX";
            const result: Reply = await Send.transfer(transfer, vendorField);
            expect(result).toContainAllKeys(["directMessageSender", "replyComment", "error"]);
            getBalanceMock.mockRestore();
            getWalletAddressMock.mockRestore();
        });

        it("should return an error message when sender tries transfer for badly configured token (bad fee)", async () => {
            // Mock User.getWalletAddress()
            const getWalletAddressMock = jest.spyOn(User, "getWalletAddress");
            getWalletAddressMock.mockImplementation(() => Promise.resolve("XXX"));
            // Mock ArkWallet.getBalance()
            const getBalanceMock = jest.spyOn(ArkWallet, "getBalance");
            getBalanceMock.mockImplementation(() => Promise.resolve(new BigNumber(1)));
            const sender: Username = {
                username: "AAA",
                platform: "ZZZ",
            };
            const receiver: Username = {
                username: "BBB",
                platform: "ZZZ",
            };
            const transfer: Transfer = {
                command: "SEND",
                sender,
                receiver,
                token: "TEST",
                arkToshiValue: new BigNumber(2100000000),
            };
            const vendorField: string = "XXX";
            const result: Reply = await Send.transfer(transfer, vendorField);
            expect(result).toContainAllKeys(["directMessageSender", "replyComment", "error"]);
            getBalanceMock.mockRestore();
            getWalletAddressMock.mockRestore();
        });

        it("should return an error message when sender tries transfer unknown token", async () => {
            // Mock User.getWalletAddress()
            const getWalletAddressMock = jest.spyOn(User, "getWalletAddress");
            getWalletAddressMock.mockImplementation(() => Promise.resolve("XXX"));
            // Mock ArkWallet.getBalance()
            const getBalanceMock = jest.spyOn(ArkWallet, "getBalance");
            getBalanceMock.mockImplementation(() => Promise.resolve(new BigNumber(1)));
            const sender: Username = {
                username: "AAA",
                platform: "ZZZ",
            };
            const receiver: Username = {
                username: "BBB",
                platform: "ZZZ",
            };
            const transfer: Transfer = {
                command: "SEND",
                sender,
                receiver,
                token: "BAD",
                arkToshiValue: new BigNumber(2100000000),
            };
            const vendorField: string = "XXX";
            const result: Reply = await Send.transfer(transfer, vendorField);
            expect(result).toContainAllKeys(["directMessageSender", "replyComment", "error"]);
            getBalanceMock.mockRestore();
            getWalletAddressMock.mockRestore();
        });

        it("should return error on low Balance", async () => {
            // Mock User.getWalletAddress()
            const getWalletAddressMock = jest.spyOn(User, "getWalletAddress");
            getWalletAddressMock.mockImplementation(() => Promise.resolve("XXX"));
            // Mock ArkWallet.getBalance()
            const getBalanceMock = jest.spyOn(ArkWallet, "getBalance");
            getBalanceMock.mockImplementation(() => Promise.resolve(new BigNumber(1)));
            const sender: Username = {
                username: "AAA",
                platform: "ZZZ",
            };
            const receiver: Username = {
                username: "BBB",
                platform: "ZZZ",
            };
            const transfer: Transfer = {
                command: "SEND",
                sender,
                receiver,
                token: "ARK",
                arkToshiValue: new BigNumber(2100000000),
            };
            const vendorField: string = "XXX";
            const result: Reply = await Send.transfer(transfer, vendorField, true, true);
            expect(result).toContainAllKeys(["directMessageSender", "replyComment", "error"]);
            getBalanceMock.mockRestore();
            getWalletAddressMock.mockRestore();
        });

        it("should return a low balance message when sender does not have enough balance for ARK", async () => {
            // Mock User.getWalletAddress()
            const getWalletAddressMock = jest.spyOn(User, "getWalletAddress");
            getWalletAddressMock.mockImplementation(() => Promise.resolve("XXX"));
            // Mock ArkWallet.getBalance()
            const getBalanceMock = jest.spyOn(ArkWallet, "getBalance");
            getBalanceMock.mockImplementation(() => Promise.resolve(new BigNumber(1)));
            const sender: Username = {
                username: "AAA",
                platform: "ZZZ",
            };
            const receiver: Username = {
                username: "BBB",
                platform: "ZZZ",
            };
            const transfer: Transfer = {
                command: "SEND",
                sender,
                receiver,
                token: "ARK",
                arkToshiValue: new BigNumber(2100000000),
            };
            const vendorField: string = "XXX";
            const result: Reply = await Send.transfer(transfer, vendorField, true, true);
            expect(result).toContainAllKeys(["directMessageSender", "replyComment", "error"]);
            getBalanceMock.mockRestore();
            getWalletAddressMock.mockRestore();
        });

        it("should return Reply for sender, receiver and comment on a good tx", async () => {
            // Mock User.getWalletAddress()
            const getWalletAddressMock = jest.spyOn(User, "getWalletAddress");
            getWalletAddressMock.mockImplementation(() => Promise.resolve("XXX"));
            // Mock ArkWallet.getBalance()
            const getBalanceMock = jest.spyOn(ArkWallet, "getBalance");
            getBalanceMock.mockImplementation(() => Promise.resolve(new BigNumber(12100000000)));
            // mock Storage.getWallet(
            const getWalletMock = jest.spyOn(Storage, "getWallet");
            getWalletMock.mockImplementation(() =>
                Promise.resolve({
                    address: "AFqavNP6bvyTiS4WcSFaTWnpMCHHYbiguR",
                    encryptedSeed:
                        "58d848800dc9d7eb29202cd2898b6a30:f2a38f59563976b061d2df13e1488bc674f4949beffdcfd3fe0cee8c10971db1b2bfbd2ff11a99c7a8e73055966d7e1ce51c85adc27adadfaff627a894b502839276e864529084118fb232d4bb1645b3",
                }),
            );
            // Mock Currency.baseCurrencyUnitsToUSD()
            const baseCurrencyUnitsToUSDMock = jest.spyOn(Currency, "baseCurrencyUnitsToUSD");
            baseCurrencyUnitsToUSDMock.mockImplementation(() => Promise.resolve(new BigNumber(2)));
            const sendTransactionMock = jest.spyOn(ArkWallet, "sendTransaction");
            sendTransactionMock.mockImplementation(() =>
                Promise.resolve([
                    {
                        node: {
                            host: "XXX",
                            port: 1,
                        },
                        response: {
                            data: {
                                accept: ["TXTXTX"],
                            },
                        },
                    },
                ]),
            );
            const sender: Username = {
                username: "AAA",
                platform: "ZZZ",
            };
            const receiver: Username = {
                username: "BBB",
                platform: "ZZZ",
            };
            const transfer: Transfer = {
                command: "SEND",
                sender,
                receiver,
                token: "ARK",
                arkToshiValue: new BigNumber(2100000000),
            };
            const vendorField: string = "XXX";
            const result: Reply = await Send.transfer(transfer, vendorField);
            expect(result).toContainAllKeys(["directMessageSender", "replyComment", "directMessageReceiver", "data"]);
            getBalanceMock.mockRestore();
            getWalletAddressMock.mockRestore();
            getWalletMock.mockRestore();
            sendTransactionMock.mockRestore();
            baseCurrencyUnitsToUSDMock.mockRestore();
        });

        it("should return an Error for sender and comment on a bad tx", async () => {
            // Mock User.getWalletAddress()
            const getWalletAddressMock = jest.spyOn(User, "getWalletAddress");
            getWalletAddressMock.mockImplementation(() => Promise.resolve("XXX"));
            // Mock ArkWallet.getBalance()
            const getBalanceMock = jest.spyOn(ArkWallet, "getBalance");
            getBalanceMock.mockImplementation(() => Promise.resolve(new BigNumber(12100000000)));
            // mock Storage.getWallet(
            const getWalletMock = jest.spyOn(Storage, "getWallet");
            getWalletMock.mockImplementation(() =>
                Promise.resolve({
                    address: "AFqavNP6bvyTiS4WcSFaTWnpMCHHYbiguR",
                    encryptedSeed:
                        "58d848800dc9d7eb29202cd2898b6a30:f2a38f59563976b061d2df13e1488bc674f4949beffdcfd3fe0cee8c10971db1b2bfbd2ff11a99c7a8e73055966d7e1ce51c85adc27adadfaff627a894b502839276e864529084118fb232d4bb1645b3",
                }),
            );
            // Mock Currency.baseCurrencyUnitsToUSD()
            const baseCurrencyUnitsToUSDMock = jest.spyOn(Currency, "baseCurrencyUnitsToUSD");
            baseCurrencyUnitsToUSDMock.mockImplementation(() => Promise.resolve(new BigNumber(2)));
            const sendTransactionMock = jest.spyOn(ArkWallet, "sendTransaction");
            sendTransactionMock.mockImplementation(() =>
                Promise.resolve([
                    {
                        node: {
                            host: "XXX",
                            port: 1,
                        },
                        response: {
                            data: {
                                accept: [],
                            },
                        },
                    },
                ]),
            );
            const sender: Username = {
                username: "AAA",
                platform: "ZZZ",
            };
            const receiver: Username = {
                username: "BBB",
                platform: "ZZZ",
            };
            const transfer: Transfer = {
                command: "SEND",
                sender,
                receiver,
                token: "ARK",
                arkToshiValue: new BigNumber(2100000000),
            };
            const vendorField: string = "XXX";
            const result: Reply = await Send.transfer(transfer, vendorField);
            expect(result).toContainAllKeys(["directMessageSender", "replyComment", "error"]);
            getBalanceMock.mockRestore();
            getWalletAddressMock.mockRestore();
            getWalletMock.mockRestore();
            sendTransactionMock.mockRestore();
            baseCurrencyUnitsToUSDMock.mockRestore();
        });
    });
});
configMock.mockRestore();
