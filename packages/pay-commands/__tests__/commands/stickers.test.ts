import BigNumber from "bignumber.js";
import "jest-extended";

import { config } from "@cryptology.hk/pay-config";

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

import { ArkWallet } from "@cryptology.hk/pay-ark";
import { Currency } from "@cryptology.hk/pay-currency";
import { Reply } from "@cryptology.hk/pay-messenger";
import { Storage } from "@cryptology.hk/pay-storage";
import { User, Username } from "@cryptology.hk/pay-user";
import { Send, Stickers, Transfer } from "../../src";

describe("pay-commands: Stickers()", () => {
    it("send() should be a function", () => {
        expect(Stickers.send).toBeFunction();
    });

    describe("send()", () => {
        it("should return an error Reply when sender does nopt have sufficient balance", async () => {
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
            const result: Reply = await Stickers.send(sender, receiver);
            expect(result).toContainAllKeys(["directMessageSender", "replyComment"]);
            getBalanceMock.mockRestore();
            getWalletAddressMock.mockRestore();
        });

        it("should return an Reply to sender, receiver, creator and comment if TX is success", async () => {
            // Mock User.getWalletAddress()
            const getWalletAddressMock = jest.spyOn(User, "getWalletAddress");
            getWalletAddressMock.mockImplementation(() => Promise.resolve("XXX"));
            // Mock ArkWallet.getBalance()
            const getBalanceMock = jest.spyOn(ArkWallet, "getBalance");
            getBalanceMock.mockImplementation(() => Promise.resolve(new BigNumber(9999999999999)));
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
            const result: Reply = await Stickers.send(sender, receiver);
            expect(result).toContainAllKeys([
                "directMessageSender",
                "replyComment",
                "directMessageReceiver",
                "directMessageMerchant",
            ]);
            getBalanceMock.mockRestore();
            getWalletAddressMock.mockRestore();
        });
    });
});
configMock.mockRestore();
