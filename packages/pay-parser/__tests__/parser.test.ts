import BigNumber from "bignumber.js";
import "jest-extended";
import { Command } from "../../pay-commands";

// Mock Config
import { config } from "@cryptology.hk/pay-config";
const configMock = jest.spyOn(config, "get");
configMock.mockImplementation(() => ({
    seperator: "@",
    baseCurrency: "ark",
    acceptedCurrencies: ["ARK", "Ѧ", "USD", "$", "EUR", "€", "BTC", "BCH", "GBP"],
    ark: {
        networkVersion: 23,
        minValue: 2000000,
        transactionFee: 300,
        vote: {
            voteFee: 157,
            delegate: "cryptology",
            fillWalletFromSeed: "a very secret seed",
            fillWalletValue: 20000,
            fillVendorField: "Welcome to ARK Pay",
        },
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
        vote: false,
        nodes: [
            {
                host: "localhost",
                port: 4003,
            },
        ],
    },
}));

import { CoinGeckoAPI } from "../../pay-currency/src/coinGecko";
const mockPrice = jest.spyOn(CoinGeckoAPI, "price");
mockPrice.mockImplementation(() => Promise.resolve(new BigNumber(1)));
import { Currency } from "../../pay-currency/src/";
import { CurrencyUtils } from "../../pay-currency/src/utils";
const mockGetCurrencyTicker = jest.spyOn(Currency, "getExchangedValue");
mockGetCurrencyTicker.mockImplementation(() => Promise.resolve(new BigNumber(1)));
import { Username } from "@cryptology.hk/pay-user";
import { Parser } from "../src";

const arktoshiValue = new BigNumber(Math.pow(10, 8));
const sender: Username = {
    username: "cryptology",
    platform: "reddit",
};
const receiver: Username = {
    username: "arkpay",
    platform: "reddit",
};

describe("pay-Parser: Parser()", () => {
    describe("parseMention()", () => {
        const mentionUser = "arktippr";
        const platform = "reddit";

        describe("should return a valid Command for a STICKERS mention", () => {
            it("for: stickers u/arktippr", async () => {
                const id: string = "xxx";
                const inputText: string = "stickers u/arktippr";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "smallFooter", "commandSender", "commandReplyTo", "id"]);
                expect(result[0].command).toEqual("STICKERS");
                expect(result[0].smallFooter).toBeFalse();
            });

            it("for: stickers u/arktippr.", async () => {
                const id: string = "xxx";
                const inputText: string = "stickers u/arktippr.";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "smallFooter", "commandSender", "commandReplyTo", "id"]);
                expect(result[0].command).toEqual("STICKERS");
                expect(result[0].smallFooter).toBeFalse();
            });

            it("for: stickers u/arktippr ~ (small footer)", async () => {
                const inputText: string = "stickers u/arktippr ~";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "smallFooter", "commandSender", "commandReplyTo", "id"]);
                expect(result[0].command).toEqual("STICKERS");
                expect(result[0].smallFooter).toBeTrue();
            });

            it("for: I am giving you stickers u/arktippr so you can enjoy them", async () => {
                const inputText: string = "I am giving you stickers u/arktippr so you can enjoy them";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result[0]).toContainAllKeys(["command", "smallFooter", "commandSender", "commandReplyTo", "id"]);
                expect(result[0].command).toEqual("STICKERS");
                expect(result[0].smallFooter).toBeFalse();
            });

            it("for: I am giving you stickers u/arktippr ~ so you can enjoy them (small footer)", async () => {
                const inputText: string = "I am giving you stickers u/arktippr ~ so you can enjoy them";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result[0]).toContainAllKeys(["command", "smallFooter", "commandSender", "commandReplyTo", "id"]);
                expect(result[0].command).toEqual("STICKERS");
                expect(result[0].smallFooter).toBeTrue();
            });

            it("for: stickers @arktippr.", async () => {
                const inputText: string = "stickers @arktippr";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result[0]).toContainAllKeys(["command", "smallFooter", "commandSender", "commandReplyTo", "id"]);
                expect(result[0].command).toEqual("STICKERS");
                expect(result[0].smallFooter).toBeFalse();
            });

            it("for: stickers @arktippr.", async () => {
                const inputText: string = "stickers @arktippr.";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result[0]).toContainAllKeys(["command", "smallFooter", "commandSender", "commandReplyTo", "id"]);
                expect(result[0].command).toEqual("STICKERS");
                expect(result[0].smallFooter).toBeFalse();
            });

            it("for: I am giving you stickers @arktippr so you can enjoy them", async () => {
                const inputText: string = "I am giving you stickers @arktippr so you can enjoy them";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result[0]).toContainAllKeys(["command", "smallFooter", "commandSender", "commandReplyTo", "id"]);
                expect(result[0].command).toEqual("STICKERS");
                expect(result[0].smallFooter).toBeFalse();
            });
        });

        describe("should return a valid Command for a TIP mention", () => {
            it("for: 10 USD u/arktippr", async () => {
                const inputText: string = "10 USD u/arktippr";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result[0]).toContainAllKeys([
                    "command",
                    "transfer",
                    "smallFooter",
                    "commandSender",
                    "commandReplyTo",
                    "id",
                ]);
                expect(result[0].command).toEqual("TIP");
                expect(result[0].smallFooter).toBeFalse();
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result[0].transfer.check.currency).toEqual("USD");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                expect(result[0].transfer.check.arkToshiValue).toEqual(arktoshiValue.times(10));
            });

            it("for: 10 USD u/arktippr ~ (small footer)", async () => {
                const inputText: string = "10 USD u/arktippr ~";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result[0]).toContainAllKeys([
                    "command",
                    "transfer",
                    "smallFooter",
                    "commandSender",
                    "commandReplyTo",
                    "id",
                ]);
                expect(result[0].command).toEqual("TIP");
                expect(result[0].smallFooter).toBeTrue();
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result[0].transfer.check.currency).toEqual("USD");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                expect(result[0].transfer.check.arkToshiValue).toEqual(arktoshiValue.times(10));
            });

            it("for: 10USD u/arktippr", async () => {
                const inputText: string = "10USD u/arktippr";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result[0]).toContainAllKeys([
                    "command",
                    "transfer",
                    "smallFooter",
                    "commandSender",
                    "commandReplyTo",
                    "id",
                ]);
                expect(result[0].command).toEqual("TIP");
                expect(result[0].smallFooter).toBeFalse();
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result[0].transfer.check.currency).toEqual("USD");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                expect(result[0].transfer.check.arkToshiValue).toEqual(arktoshiValue.times(10));
            });

            it("for: 10USD u/arktippr ~ (small footer)", async () => {
                const inputText: string = "10USD u/arktippr ~";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result[0]).toContainAllKeys([
                    "command",
                    "transfer",
                    "smallFooter",
                    "commandSender",
                    "commandReplyTo",
                    "id",
                ]);
                expect(result[0].command).toEqual("TIP");
                expect(result[0].smallFooter).toBeTrue();
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result[0].transfer.check.currency).toEqual("USD");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                expect(result[0].transfer.check.arkToshiValue).toEqual(arktoshiValue.times(10));
            });
        });

        describe("should return a valid Command for a TIP mention", () => {
            it("for: USD 10 u/arktippr", async () => {
                const inputText: string = "USD 10 u/arktippr";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result[0]).toContainAllKeys([
                    "command",
                    "transfer",
                    "smallFooter",
                    "commandSender",
                    "commandReplyTo",
                    "id",
                ]);
                expect(result[0].command).toEqual("TIP");
                expect(result[0].smallFooter).toBeFalse();
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result[0].transfer.check.currency).toEqual("USD");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                expect(result[0].transfer.check.arkToshiValue).toEqual(arktoshiValue.times(10));
            });

            it("for: USD 10 u/arktippr ~ (small footer)", async () => {
                const inputText: string = "USD 10 u/arktippr ~";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result[0]).toContainAllKeys([
                    "command",
                    "transfer",
                    "smallFooter",
                    "commandSender",
                    "commandReplyTo",
                    "id",
                ]);
                expect(result[0].command).toEqual("TIP");
                expect(result[0].smallFooter).toBeTrue();
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result[0].transfer.check.currency).toEqual("USD");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                expect(result[0].transfer.check.arkToshiValue).toEqual(arktoshiValue.times(10));
            });

            it("for: USD10 u/arktippr", async () => {
                const inputText: string = "USD10 u/arktippr";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result[0]).toContainAllKeys([
                    "command",
                    "transfer",
                    "smallFooter",
                    "commandSender",
                    "commandReplyTo",
                    "id",
                ]);
                expect(result[0].command).toEqual("TIP");
                expect(result[0].smallFooter).toBeFalse();
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result[0].transfer.check.currency).toEqual("USD");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                expect(result[0].transfer.check.arkToshiValue).toEqual(arktoshiValue.times(10));
            });

            it("for: USD10 u/arktippr ~ (small footer)", async () => {
                const inputText: string = "USD10 u/arktippr ~";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result[0]).toContainAllKeys([
                    "command",
                    "transfer",
                    "smallFooter",
                    "commandSender",
                    "commandReplyTo",
                    "id",
                ]);
                expect(result[0].command).toEqual("TIP");
                expect(result[0].smallFooter).toBeTrue();
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result[0].transfer.check.currency).toEqual("USD");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                expect(result[0].transfer.check.arkToshiValue).toEqual(arktoshiValue.times(10));
            });

            it("for: 10 EOS u/arktippr", async () => {
                const inputText: string = "10 for u/arktippr";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result[0].command).toEqual("TIP");
                expect(result[0].smallFooter).toBeFalse();
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result[0].transfer.check.currency).toEqual("ARK");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                expect(result[0].transfer.check.arkToshiValue).toEqual(arktoshiValue.times(10));
            });
        });

        describe("should return null for a bad mention", () => {
            it("for: u/arktippr", async () => {
                const inputText: string = "u/arktippr";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result).toBeNull();
            });

            it("for: 10EOS u/arktippr", async () => {
                const inputText: string = "10EOS u/arktippr";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result).toBeNull();
            });

            it("for: a message without a tip u/arktippr", async () => {
                const inputText: string = "a message without a tip u/arktippr";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result).toBeNull();
            });
        });

        describe("Should return null on non-valid input", () => {
            it("for empty input", async () => {
                const emptyInput = "";
                const id: string = "xxx";
                let result: Command[] = await Parser.parseMention(
                    emptyInput,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result).toBeNull();
                result = await Parser.parseMention(emptyInput, emptyInput, platform, sender, receiver, id);
                expect(result).toBeNull();
                const inputText: string = "10 u/arktippr";
                result = await Parser.parseMention(inputText, emptyInput, platform, sender, receiver, id);
                expect(result).toBeNull();
            });

            it("for a mention without a command", async () => {
                const onlyMention = "u/arktippr";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    onlyMention,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result).toBeNull();
            });

            it("for invalid or badly formatted input", async () => {
                const id: string = "xxx";
                let badInput: string = "anything that is not valid for u/arktippr We just mentioned him";
                let result: Command[] = await Parser.parseMention(
                    badInput,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result).toBeNull();
                badInput = "10nocurrency u/arktippr";
                result = await Parser.parseMention(badInput, mentionUser, platform, sender, receiver, id);
                expect(result).toBeNull();
            });

            it("for empty input", async () => {
                const emptyInput = "";
                const id: string = "xxx";
                let result: Command[] = await Parser.parseMention(
                    emptyInput,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result).toBeNull();
                result = await Parser.parseMention(emptyInput, emptyInput, platform, sender, receiver, id);
                expect(result).toBeNull();
                const inputText: string = "10 u/arktippr";
                result = await Parser.parseMention(inputText, emptyInput, platform, sender, receiver, id);
                expect(result).toBeNull();
            });
        });

        describe("should return a valid Command for a TIP mention", () => {
            it("for: 10 $ u/arktippr", async () => {
                const id: string = "xxx";
                const inputText: string = "10 $ u/arktippr";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result[0]).toContainAllKeys([
                    "command",
                    "transfer",
                    "smallFooter",
                    "commandSender",
                    "commandReplyTo",
                    "id",
                ]);
                expect(result).toBeArrayOfSize(1);
                expect(result[0].command).toEqual("TIP");
                expect(result[0].smallFooter).toBeFalse();
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result[0].transfer.check.currency).toEqual("USD");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                expect(result[0].transfer.check.arkToshiValue).toEqual(arktoshiValue.times(10));
            });

            it("for: 10 $ u/arktippr ~ (small footer)", async () => {
                const id: string = "xxx";
                const inputText: string = "10 $ u/arktippr ~";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result[0]).toContainAllKeys([
                    "command",
                    "transfer",
                    "smallFooter",
                    "commandSender",
                    "commandReplyTo",
                    "id",
                ]);
                expect(result).toBeArrayOfSize(1);
                expect(result[0].command).toEqual("TIP");
                expect(result[0].smallFooter).toBeTrue();
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result[0].transfer.check.currency).toEqual("USD");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                expect(result[0].transfer.check.arkToshiValue).toEqual(arktoshiValue.times(10));
            });

            it("for: 10$ u/arktippr", async () => {
                const inputText: string = "10$ u/arktippr";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys([
                    "command",
                    "transfer",
                    "smallFooter",
                    "commandSender",
                    "commandReplyTo",
                    "id",
                ]);
                expect(result[0].command).toEqual("TIP");
                expect(result[0].smallFooter).toBeFalse();
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result[0].transfer.check.currency).toEqual("USD");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                expect(result[0].transfer.check.arkToshiValue).toEqual(arktoshiValue.times(10));
            });

            it("for: 10$ u/arktippr ~ (small footer)", async () => {
                const inputText: string = "10$ u/arktippr ~";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result[0]).toContainAllKeys([
                    "command",
                    "transfer",
                    "smallFooter",
                    "commandSender",
                    "commandReplyTo",
                    "id",
                ]);
                expect(result).toBeArrayOfSize(1);
                expect(result[0].command).toEqual("TIP");
                expect(result[0].smallFooter).toBeTrue();
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result[0].transfer.check.currency).toEqual("USD");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                expect(result[0].transfer.check.arkToshiValue).toEqual(arktoshiValue.times(10));
            });
        });

        describe("should return a valid Command for a TIP mention", () => {
            it("for: $ 10 u/arktippr", async () => {
                const inputText: string = "$ 10 u/arktippr";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result[0]).toContainAllKeys([
                    "command",
                    "transfer",
                    "smallFooter",
                    "commandSender",
                    "commandReplyTo",
                    "id",
                ]);
                expect(result).toBeArrayOfSize(1);
                expect(result[0].command).toEqual("TIP");
                expect(result[0].smallFooter).toBeFalse();
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result[0].transfer.check.currency).toEqual("USD");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                expect(result[0].transfer.check.arkToshiValue).toEqual(arktoshiValue.times(10));
            });

            it("for: $ 10 u/arktippr ~ (small footer)", async () => {
                const inputText: string = "$ 10 u/arktippr ~";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result[0]).toContainAllKeys([
                    "command",
                    "transfer",
                    "smallFooter",
                    "commandSender",
                    "commandReplyTo",
                    "id",
                ]);
                expect(result).toBeArrayOfSize(1);
                expect(result[0].command).toEqual("TIP");
                expect(result[0].smallFooter).toBeTrue();
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result[0].transfer.check.currency).toEqual("USD");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                expect(result[0].transfer.check.arkToshiValue).toEqual(arktoshiValue.times(10));
            });

            it("for: $10 u/arktippr", async () => {
                const inputText: string = "$10 u/arktippr";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys([
                    "command",
                    "transfer",
                    "smallFooter",
                    "commandSender",
                    "commandReplyTo",
                    "id",
                ]);
                expect(result[0].command).toEqual("TIP");
                expect(result[0].smallFooter).toBeFalse();
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result[0].transfer.check.currency).toEqual("USD");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                expect(result[0].transfer.check.arkToshiValue).toEqual(arktoshiValue.times(10));
            });

            it("for: $10 u/arktippr ~ (small footer)", async () => {
                const inputText: string = "$10 u/arktippr ~";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys([
                    "command",
                    "transfer",
                    "smallFooter",
                    "commandSender",
                    "commandReplyTo",
                    "id",
                ]);
                expect(result[0].command).toEqual("TIP");
                expect(result[0].smallFooter).toBeTrue();
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result[0].transfer.check.currency).toEqual("USD");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                expect(result[0].transfer.check.arkToshiValue).toEqual(arktoshiValue.times(10));
            });

            it("for: 10 u/arktippr", async () => {
                const inputText: string = "10 u/arktippr";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys([
                    "command",
                    "transfer",
                    "smallFooter",
                    "commandSender",
                    "commandReplyTo",
                    "id",
                ]);
                expect(result[0].command).toEqual("TIP");
                expect(result[0].smallFooter).toBeFalse();
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result[0].transfer.check.currency).toEqual("ARK");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                expect(result[0].transfer.check.arkToshiValue).toEqual(arktoshiValue.times(10));
            });

            it("for: EOS 10 u/arktippr (expected behaviour is ARK for any text that is not a valid currency before the number)", async () => {
                const inputText: string = "10 u/arktippr";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys([
                    "command",
                    "transfer",
                    "smallFooter",
                    "commandSender",
                    "commandReplyTo",
                    "id",
                ]);
                expect(result[0].command).toEqual("TIP");
                expect(result[0].smallFooter).toBeFalse();
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result[0].transfer.check.currency).toEqual("ARK");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                expect(result[0].transfer.check.arkToshiValue).toEqual(arktoshiValue.times(10));
            });

            it("for: 10 u/arktippr ~ (small footer)", async () => {
                const inputText: string = "10 u/arktippr ~";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys([
                    "command",
                    "transfer",
                    "smallFooter",
                    "commandSender",
                    "commandReplyTo",
                    "id",
                ]);
                expect(result[0].command).toEqual("TIP");
                expect(result[0].smallFooter).toBeTrue();
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result[0].transfer.check.currency).toEqual("ARK");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                expect(result[0].transfer.check.arkToshiValue).toEqual(arktoshiValue.times(10));
            });

            it("for: text here that is no currency 10 u/arktippr", async () => {
                const inputText: string = "10 u/arktippr";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys([
                    "command",
                    "transfer",
                    "smallFooter",
                    "commandSender",
                    "commandReplyTo",
                    "id",
                ]);
                expect(result[0].command).toEqual("TIP");
                expect(result[0].smallFooter).toBeFalse();
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result[0].transfer.check.currency).toEqual("ARK");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                expect(result[0].transfer.check.arkToshiValue).toEqual(arktoshiValue.times(10));
            });

            it("for: text here that is no currency 10 u/arktippr ~ (small footer)", async () => {
                const inputText: string = "10 u/arktippr ~";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys([
                    "command",
                    "transfer",
                    "smallFooter",
                    "commandSender",
                    "commandReplyTo",
                    "id",
                ]);
                expect(result[0].command).toEqual("TIP");
                expect(result[0].smallFooter).toBeTrue();
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result[0].transfer.check.currency).toEqual("ARK");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                expect(result[0].transfer.check.arkToshiValue).toEqual(arktoshiValue.times(10));
            });
        });

        describe("Should correctly parse REWARD mentions", () => {
            it("for a single REWARD entry", async () => {
                const inputText: string = "REWARD u/arktippr \
                    10 u/user1";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys([
                    "command",
                    "transfer",
                    "smallFooter",
                    "commandSender",
                    "commandReplyTo",
                    "id",
                ]);
                expect(result[0].command).toEqual("TIP");
                expect(result[0].smallFooter).toBeFalse();
                expect(result[0].transfer).toContainAllKeys([
                    "sender",
                    "receiver",
                    "command",
                    "arkToshiValue",
                    "check",
                    "token",
                ]);
                expect(result[0].transfer.receiver).toContainAllKeys(["username", "platform"]);
                expect(result[0].transfer.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result[0].transfer.command).toEqual("TIP");
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check.currency).toEqual("ARK");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                expect(result[0].transfer.check.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.receiver.username).toEqual("user1");
                expect(result[0].transfer.receiver.platform).toEqual(platform);
            });

            it("for a single STICKERS REWARD entry", async () => {
                const inputText: string = "REWARD u/arktippr \
                    STICKERS user1";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys([
                    "command",
                    "transfer",
                    "smallFooter",
                    "commandSender",
                    "commandReplyTo",
                    "id",
                ]);
                expect(result[0].command).toEqual("STICKERS");
                expect(result[0].smallFooter).toBeFalse();
                expect(result[0].transfer).toContainAllKeys(["sender", "receiver", "command"]);
                expect(result[0].transfer.receiver).toContainAllKeys(["username", "platform"]);
                expect(result[0].transfer.command).toEqual("STICKERS");
                expect(result[0].transfer.receiver.username).toEqual("user1");
                expect(result[0].transfer.receiver.platform).toEqual(platform);
            });

            it("for a multiple REWARD entry", async () => {
                const inputText: string =
                    "REWARD u/arktippr \
                    10 user1 \
                    STICKERS user5@reddit\
                    40 USD u/user4 \
                    EUR 50 user6";
                const id: string = "xxx";
                const result: Command[] = await Parser.parseMention(
                    inputText,
                    mentionUser,
                    platform,
                    sender,
                    receiver,
                    id,
                );
                expect(result).toBeArrayOfSize(4);
                expect(result[0]).toContainAllKeys([
                    "command",
                    "transfer",
                    "smallFooter",
                    "commandSender",
                    "commandReplyTo",
                    "id",
                ]);
                expect(result[0].command).toEqual("TIP");
                expect(result[0].smallFooter).toBeFalse();
                expect(result[0].transfer).toContainAllKeys([
                    "sender",
                    "receiver",
                    "command",
                    "arkToshiValue",
                    "check",
                    "token",
                ]);
                expect(result[0].transfer.receiver).toContainAllKeys(["username", "platform"]);
                expect(result[0].transfer.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result[0].transfer.command).toEqual("TIP");
                expect(result[1].transfer.command).toEqual("STICKERS");
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check.currency).toEqual("ARK");
                expect(result[2].transfer.check.currency).toEqual("USD");
                expect(result[3].transfer.check.currency).toEqual("EUR");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                expect(result[2].transfer.check.amount).toEqual(new BigNumber(40));
                expect(result[3].transfer.check.amount).toEqual(new BigNumber(50));
                expect(result[0].transfer.check.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.receiver.username).toEqual("user1");
                expect(result[1].transfer.receiver.username).toEqual("user5");
                expect(result[2].transfer.receiver.username).toEqual("user4");
                expect(result[3].transfer.receiver.username).toEqual("user6");
                expect(result[0].transfer.receiver.platform).toEqual(platform);
                expect(result[1].transfer.receiver.platform).toEqual("reddit");
            });
        });
    });

    describe("parseDirectMessage", () => {
        const platform = "reddit";
        const mock = jest.spyOn(CurrencyUtils, "getCurrencyTicker");
        mock.mockImplementation(() => Promise.resolve(new BigNumber(1)));

        it("should return NULL on input that contains no commands", async () => {
            const messageBody: string = "whatever is here does not matter";
            const result = await Parser.parseDirectMessage(messageBody, platform, sender);
            expect(result).toBeNull();
        });

        it("should return NULL on empty input", async () => {
            const messageBody: string = "";
            const result = await Parser.parseDirectMessage(messageBody, platform, sender);
            expect(result).toBeNull();
        });

        describe("should correctly parse a single command that has no input arguments", () => {
            it("HELP", async () => {
                const messageBody: string = "HELP whatever is here does not matter";
                const result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainKey("command");
                expect(result[0].command).toEqual("HELP");
            });

            it("TIP", async () => {
                const messageBody: string = "TIP whatever is here does not matter";
                const result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainKey("command");
                expect(result[0].command).toEqual("TIP");
            });
        });

        describe("should correctly parse a single command that has input arguments", () => {
            it("BALANCE without valid arguments (request for BaseCurrency)", async () => {
                const messageBody: string = "BALANCE whatever is here does not matter";
                const result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "commandSender", "token"]);
                expect(result[0].command).toEqual("BALANCE");
            });

            it("BALANCE with token argument (request for BALANCE ARK)", async () => {
                const messageBody: string = "BALANCE ARK whatever is here does not matter";
                const result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "commandSender", "token"]);
                expect(result[0].command).toEqual("BALANCE");
                expect(result[0].token).toEqual("ARK");
            });

            it("BALANCE with token argument (request for BALANCE DARK)", async () => {
                const messageBody: string = "BALANCE DARK whatever is here does not matter";
                const result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "commandSender", "token"]);
                expect(result[0].command).toEqual("BALANCE");
                expect(result[0].token).toEqual("DARK");
            });

            it("DEPOSIT without valid arguments (request for BaseCurrency)", async () => {
                const messageBody: string = "DEPOSIT whatever is here does not matter";
                const result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "token", "commandSender"]);
                expect(result[0].command).toEqual("DEPOSIT");
            });

            it("DEPOSIT with token argument (request for DEPOSIT ARK)", async () => {
                const messageBody: string = "DEPOSIT ARK whatever is here does not matter";
                const result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "commandSender", "token"]);
                expect(result[0].command).toEqual("DEPOSIT");
                expect(result[0].token).toEqual("ARK");
            });

            it("DEPOSIT with token argument (request for DEPOSIT DARK)", async () => {
                const messageBody: string = "DEPOSIT DARK whatever is here does not matter";
                const result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "commandSender", "token"]);
                expect(result[0].command).toEqual("DEPOSIT");
                expect(result[0].token).toEqual("DARK");
            });

            it("ADDRESS without valid arguments (request for BaseCurrency)", async () => {
                const messageBody: string = "ADDRESS whatever is here does not matter";
                const result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "token", "commandSender"]);
                expect(result[0].command).toEqual("DEPOSIT");
            });

            it("ADDRESS with token argument (request for ADDRESS ARK)", async () => {
                const messageBody: string = "ADDRESS ARK whatever is here does not matter";
                const result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "commandSender", "token"]);
                expect(result[0].command).toEqual("DEPOSIT");
                expect(result[0].token).toEqual("ARK");
            });

            it("ADDRESS with token argument (request for ADDRESS DARK)", async () => {
                const messageBody: string = "ADDRESS DARK whatever is here does not matter";
                const result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "commandSender", "token"]);
                expect(result[0].command).toEqual("DEPOSIT");
                expect(result[0].token).toEqual("DARK");
            });

            it("STICKERS without valid arguments (request for HELP)", async () => {
                const messageBody: string = "STICKERS whatever is here does not matter";
                const result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainKey("command");
                expect(result[0].command).toEqual("STICKERS");
            });

            it("STICKERS with valid argument", async () => {
                const messageBody: string = "STICKERS user1";
                const result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "commandReplyTo", "commandSender"]);
                expect(result[0].command).toEqual("STICKERS");
                expect(result[0].commandReplyTo).toContainAllKeys(["username", "platform"]);
                expect(result[0].commandReplyTo.username).toEqual("user1");
                expect(result[0].commandReplyTo.platform).toEqual(platform);
            });

            it("SEND without arguments (request for HELP)", async () => {
                const messageBody: string = "SEND whatever is here does not matter";
                const result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainKey("command");
                expect(result[0].command).toEqual("SEND");
            });

            it("SEND with valid arguments", async () => {
                let messageBody: string = "SEND user1 10 USD";
                let result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "transfer", "commandSender", "commandReplyTo"]);
                expect(result[0].command).toEqual("SEND");
                expect(result[0].transfer).toContainAllKeys([
                    "sender",
                    "receiver",
                    "command",
                    "arkToshiValue",
                    "check",
                    "token",
                ]);
                expect(result[0].transfer.receiver.username).toEqual("user1");
                expect(result[0].transfer.receiver.platform).toEqual(platform);
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check.currency).toEqual("USD");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                messageBody = "SEND user1 ARK 10";
                result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "transfer", "commandSender", "commandReplyTo"]);
                expect(result[0].command).toEqual("SEND");
                expect(result[0].transfer).toContainAllKeys([
                    "sender",
                    "receiver",
                    "command",
                    "arkToshiValue",
                    "check",
                    "token",
                ]);
                expect(result[0].transfer.receiver.username).toEqual("user1");
                expect(result[0].transfer.receiver.platform).toEqual(platform);
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check.currency).toEqual("ARK");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                messageBody = "SEND user1 10";
                result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "transfer", "commandSender", "commandReplyTo"]);
                expect(result[0].command).toEqual("SEND");
                expect(result[0].transfer).toContainAllKeys([
                    "sender",
                    "receiver",
                    "command",
                    "arkToshiValue",
                    "check",
                    "token",
                ]);
                expect(result[0].transfer.receiver.username).toEqual("user1");
                expect(result[0].transfer.receiver.platform).toEqual(platform);
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check.currency).toEqual("ARK");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                messageBody = "SEND user1 EUR10";
                result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "transfer", "commandSender", "commandReplyTo"]);
                expect(result[0].command).toEqual("SEND");
                expect(result[0].transfer).toContainAllKeys([
                    "sender",
                    "receiver",
                    "command",
                    "arkToshiValue",
                    "check",
                    "token",
                ]);
                expect(result[0].transfer.receiver.username).toEqual("user1");
                expect(result[0].transfer.receiver.platform).toEqual(platform);
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check.currency).toEqual("EUR");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                messageBody = "SEND user1 10BTC";
                result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "transfer", "commandSender", "commandReplyTo"]);
                expect(result[0].command).toEqual("SEND");
                expect(result[0].transfer).toContainAllKeys([
                    "sender",
                    "receiver",
                    "command",
                    "arkToshiValue",
                    "check",
                    "token",
                ]);
                expect(result[0].transfer.receiver.username).toEqual("user1");
                expect(result[0].transfer.receiver.platform).toEqual(platform);
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check.currency).toEqual("BTC");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
            });

            it("WITHDRAW without arguments (request for WITHDRAW)", async () => {
                const messageBody: string = "WITHDRAW whatever is here does not matter";
                const result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "commandSender", "token"]);
                expect(result[0].command).toEqual("WITHDRAW");
            });
            it("WITHDRAW with token argument (request for WITHDRAW ARK)", async () => {
                const messageBody: string = "WITHDRAW ARK whatever is here does not matter";
                const result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "commandSender", "token"]);
                expect(result[0].command).toEqual("WITHDRAW");
            });

            it("WITHDRAW with valid arguments", async () => {
                let messageBody: string = "WITHDRAW AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V";
                let result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "transfer", "commandSender", "token"]);
                expect(result[0].command).toEqual("WITHDRAW");
                expect(result[0].transfer).toContainAllKeys([
                    "sender",
                    "address",
                    "command",
                    "arkToshiValue",
                    "check",
                    "token",
                ]);
                expect(result[0].transfer.address).toEqual("AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V");
                expect(result[0].transfer.arkToshiValue).toBeNull();
                messageBody = "WITHDRAW ARK AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V";
                result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "transfer", "commandSender", "token"]);
                expect(result[0].command).toEqual("WITHDRAW");
                expect(result[0].transfer).toContainAllKeys([
                    "sender",
                    "address",
                    "command",
                    "arkToshiValue",
                    "check",
                    "token",
                ]);
                expect(result[0].transfer.address).toEqual("AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V");
                expect(result[0].transfer.arkToshiValue).toBeNull();
                messageBody = "WITHDRAW AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V 10";
                result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "transfer", "commandSender", "token"]);
                expect(result[0].command).toEqual("WITHDRAW");
                expect(result[0].transfer).toContainAllKeys([
                    "sender",
                    "address",
                    "command",
                    "arkToshiValue",
                    "check",
                    "token",
                ]);
                expect(result[0].transfer.address).toEqual("AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V");
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check.currency).toEqual("ARK");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                messageBody = "WITHDRAW ARK AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V 10";
                result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "transfer", "commandSender", "token"]);
                expect(result[0].command).toEqual("WITHDRAW");
                expect(result[0].transfer).toContainAllKeys([
                    "sender",
                    "address",
                    "command",
                    "arkToshiValue",
                    "check",
                    "token",
                ]);
                expect(result[0].transfer.address).toEqual("AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V");
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check.currency).toEqual("ARK");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                messageBody = "WITHDRAW AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V ARK 10";
                result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "transfer", "commandSender", "token"]);
                expect(result[0].command).toEqual("WITHDRAW");
                expect(result[0].transfer).toContainAllKeys([
                    "sender",
                    "address",
                    "command",
                    "arkToshiValue",
                    "check",
                    "token",
                ]);
                expect(result[0].transfer.address).toEqual("AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V");
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check.currency).toEqual("ARK");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                messageBody = "WITHDRAW ARK AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V ARK 10";
                result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "transfer", "commandSender", "token"]);
                expect(result[0].command).toEqual("WITHDRAW");
                expect(result[0].transfer).toContainAllKeys([
                    "sender",
                    "address",
                    "command",
                    "arkToshiValue",
                    "check",
                    "token",
                ]);
                expect(result[0].transfer.address).toEqual("AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V");
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check.currency).toEqual("ARK");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                messageBody = "WITHDRAW AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V 10 USD";
                result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "transfer", "commandSender", "token"]);
                expect(result[0].command).toEqual("WITHDRAW");
                expect(result[0].transfer).toContainAllKeys([
                    "sender",
                    "address",
                    "command",
                    "arkToshiValue",
                    "check",
                    "token",
                ]);
                expect(result[0].transfer.address).toEqual("AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V");
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check.currency).toEqual("USD");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                messageBody = "WITHDRAW ARK AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V 10 USD";
                result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "transfer", "commandSender", "token"]);
                expect(result[0].command).toEqual("WITHDRAW");
                expect(result[0].transfer).toContainAllKeys([
                    "sender",
                    "address",
                    "command",
                    "arkToshiValue",
                    "check",
                    "token",
                ]);
                expect(result[0].transfer.address).toEqual("AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V");
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check.currency).toEqual("USD");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                messageBody = "WITHDRAW AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V 10USD";
                result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "transfer", "commandSender", "token"]);
                expect(result[0].command).toEqual("WITHDRAW");
                expect(result[0].transfer).toContainAllKeys([
                    "sender",
                    "address",
                    "command",
                    "arkToshiValue",
                    "check",
                    "token",
                ]);
                expect(result[0].transfer.address).toEqual("AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V");
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check.currency).toEqual("USD");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                messageBody = "WITHDRAW ARK AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V 10USD";
                result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "transfer", "commandSender", "token"]);
                expect(result[0].command).toEqual("WITHDRAW");
                expect(result[0].transfer).toContainAllKeys([
                    "sender",
                    "address",
                    "command",
                    "arkToshiValue",
                    "check",
                    "token",
                ]);
                expect(result[0].transfer.address).toEqual("AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V");
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check.currency).toEqual("USD");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                messageBody = "WITHDRAW AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V EUR10";
                result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "transfer", "commandSender", "token"]);
                expect(result[0].command).toEqual("WITHDRAW");
                expect(result[0].transfer).toContainAllKeys([
                    "sender",
                    "address",
                    "command",
                    "arkToshiValue",
                    "check",
                    "token",
                ]);
                expect(result[0].transfer.address).toEqual("AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V");
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check.currency).toEqual("EUR");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
                messageBody = "WITHDRAW ARK AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V EUR10";
                result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "transfer", "commandSender", "token"]);
                expect(result[0].command).toEqual("WITHDRAW");
                expect(result[0].transfer).toContainAllKeys([
                    "sender",
                    "address",
                    "command",
                    "arkToshiValue",
                    "check",
                    "token",
                ]);
                expect(result[0].transfer.address).toEqual("AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V");
                expect(result[0].transfer.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result[0].transfer.check.currency).toEqual("EUR");
                expect(result[0].transfer.check.amount).toEqual(new BigNumber(10));
            });

            it("Should return an array of parsed commands", async () => {
                const messageBody: string = "WITHDRAW AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V SEND user1 10 USD HELP";
                const result = await Parser.parseDirectMessage(messageBody, platform, sender);
                expect(result).toBeArrayOfSize(3);
            });
        });
    });
});
