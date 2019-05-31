import BigNumber from "bignumber.js";
import "jest-extended";

import { config } from "../../../src/core";

const configMock = jest.spyOn(config, "get");
configMock.mockImplementation(() => ({
    stickers: {
        token: "ark",
        price: "2",
        payoutTo: "Aa74QyqAFBsevReox3rMWy6FhMUyJVGPop",
        notify: { username: "arkpay", platform: "reddit" },
    },
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
}));

import { ArkWallet, Currency, Reply, Storage, Transfer, User, Username, Withdraw } from "../../../src";

describe("pay-commands: Withdraw()", () => {
    it("transfer() should be a function", () => {
        expect(Withdraw.transfer).toBeFunction();
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
            const result: Reply = await Withdraw.transfer(transfer);
            expect(result).toContainAllKeys(["directMessageSender", "replyComment"]);
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
            const result: Reply = await Withdraw.transfer(transfer);
            expect(result).toContainAllKeys(["directMessageSender", "replyComment"]);
            getBalanceMock.mockRestore();
            getWalletAddressMock.mockRestore();
        });

        it("should return Reply for the Sender on a successful tx with a request to withdraw full balance ", async () => {
            // Mock User.getWalletAddress()
            const getWalletAddressMock = jest.spyOn(User, "getWalletAddress");
            getWalletAddressMock.mockImplementation(() => Promise.resolve("XXX"));
            // Mock ArkWallet.getBalance()
            const getBalanceMock = jest.spyOn(ArkWallet, "getBalance");
            getBalanceMock.mockImplementation(() => Promise.resolve(new BigNumber(1000000000000)));
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
                arkToshiValue: null,
            };
            const result: Reply = await Withdraw.transfer(transfer);
            expect(result).toContainAllKeys(["directMessageSender"]);
            getBalanceMock.mockRestore();
            getWalletAddressMock.mockRestore();
        });

        it("should return Reply for the Sender on a successful tx with a request to withdraw a valid amount", async () => {
            // Mock User.getWalletAddress()
            const getWalletAddressMock = jest.spyOn(User, "getWalletAddress");
            getWalletAddressMock.mockImplementation(() => Promise.resolve("XXX"));
            // Mock ArkWallet.getBalance()
            const getBalanceMock = jest.spyOn(ArkWallet, "getBalance");
            getBalanceMock.mockImplementation(() => Promise.resolve(new BigNumber(1000000000000)));
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
                arkToshiValue: new BigNumber(5000000),
            };
            const result: Reply = await Withdraw.transfer(transfer);
            expect(result).toContainAllKeys(["directMessageSender"]);
            getBalanceMock.mockRestore();
            getWalletAddressMock.mockRestore();
        });
    });
});
