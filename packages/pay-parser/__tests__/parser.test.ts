import { Mention, Parser } from "@cryptology.hk/pay-parser";
import BigNumber from "bignumber.js";
import "jest-extended";

describe("Parser", () => {
    describe("parseMention()", () => {
        const parser = new Parser();
        const mentionUser = "arktippr";
        const platform = "twitter";

        describe("should return a valid Mention for a STICKERS mention", () => {
            it("for: stickers u/arktippr", async () => {
                const inputText: string = "stickers u/arktippr";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toContainAllKeys(["command", "smallFooter"]);
                expect(result.command).toEqual("STICKERS");
                expect(result.smallFooter).toBeFalse();
            });

            it("for: stickers u/arktippr.", async () => {
                const inputText: string = "stickers u/arktippr.";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toContainAllKeys(["command", "smallFooter"]);
                expect(result.command).toEqual("STICKERS");
                expect(result.smallFooter).toBeFalse();
            });

            it("for: stickers u/arktippr ~ (small footer)", async () => {
                const inputText: string = "stickers u/arktippr ~";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toContainAllKeys(["command", "smallFooter"]);
                expect(result.command).toEqual("STICKERS");
                expect(result.smallFooter).toBeTrue();
            });

            it("for: I am giving you stickers u/arktippr so you can enjoy them", async () => {
                const inputText: string = "I am giving you stickers u/arktippr so you can enjoy them";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toContainAllKeys(["command", "smallFooter"]);
                expect(result.command).toEqual("STICKERS");
                expect(result.smallFooter).toBeFalse();
            });

            it("for: I am giving you stickers u/arktippr ~ so you can enjoy them (small footer)", async () => {
                const inputText: string = "I am giving you stickers u/arktippr ~ so you can enjoy them";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toContainAllKeys(["command", "smallFooter"]);
                expect(result.command).toEqual("STICKERS");
                expect(result.smallFooter).toBeTrue();
            });

            it("for: stickers @arktippr.", async () => {
                const inputText: string = "stickers @arktippr";
                const result: Mention = await parser.parseMention(inputText, mentionUser, platform);
                expect(result).toContainAllKeys(["command", "smallFooter"]);
                expect(result.command).toEqual("STICKERS");
                expect(result.smallFooter).toBeFalse();
            });

            it("for: stickers @arktippr.", async () => {
                const inputText: string = "stickers @arktippr.";
                const result: Mention = await parser.parseMention(inputText, mentionUser, platform);
                expect(result).toContainAllKeys(["command", "smallFooter"]);
                expect(result.command).toEqual("STICKERS");
                expect(result.smallFooter).toBeFalse();
            });

            it("for: I am giving you stickers @arktippr so you can enjoy them", async () => {
                const inputText: string = "I am giving you stickers @arktippr so you can enjoy them";
                const result: Mention = await parser.parseMention(inputText, mentionUser, platform);
                expect(result).toContainAllKeys(["command", "smallFooter"]);
                expect(result.command).toEqual("STICKERS");
                expect(result.smallFooter).toBeFalse();
            });
        });

        describe("should return a valid Mention for a TIP mention", () => {
            it("for: 10 USD u/arktippr", async () => {
                const inputText: string = "10 USD u/arktippr";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toContainAllKeys(["command", "arkToshiValue", "check", "smallFooter"]);
                expect(result.command).toEqual("TIP");
                expect(result.smallFooter).toBeFalse();
                expect(result.arkToshiValue).toEqual(new BigNumber(1));
                expect(result.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result.check.currency).toEqual("USD");
                expect(result.check.amount).toEqual(new BigNumber(10));
                expect(result.check.arkToshiValue).toEqual(new BigNumber(1));
            });

            it("for: 10 USD u/arktippr ~ (small footer)", async () => {
                const inputText: string = "10 USD u/arktippr ~";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toContainAllKeys(["command", "arkToshiValue", "check", "smallFooter"]);
                expect(result.command).toEqual("TIP");
                expect(result.smallFooter).toBeTrue();
                expect(result.arkToshiValue).toEqual(new BigNumber(1));
                expect(result.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result.check.currency).toEqual("USD");
                expect(result.check.amount).toEqual(new BigNumber(10));
                expect(result.check.arkToshiValue).toEqual(new BigNumber(1));
            });

            it("for: 10USD u/arktippr", async () => {
                const inputText: string = "10USD u/arktippr";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toContainAllKeys(["command", "arkToshiValue", "check", "smallFooter"]);
                expect(result.command).toEqual("TIP");
                expect(result.smallFooter).toBeFalse();
                expect(result.arkToshiValue).toEqual(new BigNumber(1));
                expect(result.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result.check.currency).toEqual("USD");
                expect(result.check.amount).toEqual(new BigNumber(10));
                expect(result.check.arkToshiValue).toEqual(new BigNumber(1));
            });

            it("for: 10USD u/arktippr ~ (small footer)", async () => {
                const inputText: string = "10USD u/arktippr ~";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toContainAllKeys(["command", "arkToshiValue", "check", "smallFooter"]);
                expect(result.command).toEqual("TIP");
                expect(result.smallFooter).toBeTrue();
                expect(result.arkToshiValue).toEqual(new BigNumber(1));
                expect(result.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result.check.currency).toEqual("USD");
                expect(result.check.amount).toEqual(new BigNumber(10));
                expect(result.check.arkToshiValue).toEqual(new BigNumber(1));
            });
        });

        describe("should return a valid Mention for a TIP mention", () => {
            it("for: USD 10 u/arktippr", async () => {
                const inputText: string = "USD 10 u/arktippr";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toContainAllKeys(["command", "arkToshiValue", "check", "smallFooter"]);
                expect(result.command).toEqual("TIP");
                expect(result.smallFooter).toBeFalse();
                expect(result.arkToshiValue).toEqual(new BigNumber(1));
                expect(result.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result.check.currency).toEqual("USD");
                expect(result.check.amount).toEqual(new BigNumber(10));
                expect(result.check.arkToshiValue).toEqual(new BigNumber(1));
            });

            it("for: USD 10 u/arktippr ~ (small footer)", async () => {
                const inputText: string = "USD 10 u/arktippr ~";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toContainAllKeys(["command", "arkToshiValue", "check", "smallFooter"]);
                expect(result.command).toEqual("TIP");
                expect(result.smallFooter).toBeTrue();
                expect(result.arkToshiValue).toEqual(new BigNumber(1));
                expect(result.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result.check.currency).toEqual("USD");
                expect(result.check.amount).toEqual(new BigNumber(10));
                expect(result.check.arkToshiValue).toEqual(new BigNumber(1));
            });

            it("for: USD10 u/arktippr", async () => {
                const inputText: string = "USD10 u/arktippr";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toContainAllKeys(["command", "arkToshiValue", "check", "smallFooter"]);
                expect(result.command).toEqual("TIP");
                expect(result.smallFooter).toBeFalse();
                expect(result.arkToshiValue).toEqual(new BigNumber(1));
                expect(result.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result.check.currency).toEqual("USD");
                expect(result.check.amount).toEqual(new BigNumber(10));
                expect(result.check.arkToshiValue).toEqual(new BigNumber(1));
            });

            it("for: USD10 u/arktippr ~ (small footer)", async () => {
                const inputText: string = "USD10 u/arktippr ~";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toContainAllKeys(["command", "arkToshiValue", "check", "smallFooter"]);
                expect(result.command).toEqual("TIP");
                expect(result.smallFooter).toBeTrue();
                expect(result.arkToshiValue).toEqual(new BigNumber(1));
                expect(result.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result.check.currency).toEqual("USD");
                expect(result.check.amount).toEqual(new BigNumber(10));
                expect(result.check.arkToshiValue).toEqual(new BigNumber(1));
            });
        });

        describe("should return null for a bad mention", () => {
            it("for: u/arktippr", async () => {
                const inputText: string = "u/arktippr";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toBeNull();
            });

            it("for: 10EOS u/arktippr", async () => {
                const inputText: string = "10EOS u/arktippr";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toBeNull();
            });

            it("for: 10 EOS u/arktippr", async () => {
                const inputText: string = "10 for u/arktippr";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toBeNull();
            });

            it("for: a message without a tip u/arktippr", async () => {
                const inputText: string = "a message without a tip u/arktippr";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toBeNull();
            });
        });

        describe("should return a valid Mention for a TIP mention", () => {
            it("for: 10 $ u/arktippr", async () => {
                const inputText: string = "10 $ u/arktippr";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toContainAllKeys(["command", "arkToshiValue", "check", "smallFooter"]);
                expect(result.command).toEqual("TIP");
                expect(result.smallFooter).toBeFalse();
                expect(result.arkToshiValue).toEqual(new BigNumber(1));
                expect(result.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result.check.currency).toEqual("USD");
                expect(result.check.amount).toEqual(new BigNumber(10));
                expect(result.check.arkToshiValue).toEqual(new BigNumber(1));
            });

            it("for: 10 $ u/arktippr ~ (small footer)", async () => {
                const inputText: string = "10 $ u/arktippr ~";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toContainAllKeys(["command", "arkToshiValue", "check", "smallFooter"]);
                expect(result.command).toEqual("TIP");
                expect(result.smallFooter).toBeTrue();
                expect(result.arkToshiValue).toEqual(new BigNumber(1));
                expect(result.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result.check.currency).toEqual("USD");
                expect(result.check.amount).toEqual(new BigNumber(10));
                expect(result.check.arkToshiValue).toEqual(new BigNumber(1));
            });

            it("for: 10$ u/arktippr", async () => {
                const inputText: string = "10$ u/arktippr";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toContainAllKeys(["command", "arkToshiValue", "check", "smallFooter"]);
                expect(result.command).toEqual("TIP");
                expect(result.smallFooter).toBeFalse();
                expect(result.arkToshiValue).toEqual(new BigNumber(1));
                expect(result.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result.check.currency).toEqual("USD");
                expect(result.check.amount).toEqual(new BigNumber(10));
                expect(result.check.arkToshiValue).toEqual(new BigNumber(1));
            });

            it("for: 10$ u/arktippr ~ (small footer)", async () => {
                const inputText: string = "10$ u/arktippr ~";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toContainAllKeys(["command", "arkToshiValue", "check", "smallFooter"]);
                expect(result.command).toEqual("TIP");
                expect(result.smallFooter).toBeTrue();
                expect(result.arkToshiValue).toEqual(new BigNumber(1));
                expect(result.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result.check.currency).toEqual("USD");
                expect(result.check.amount).toEqual(new BigNumber(10));
                expect(result.check.arkToshiValue).toEqual(new BigNumber(1));
            });
        });

        describe("should return a valid Mention for a TIP mention", () => {
            it("for: $ 10 u/arktippr", async () => {
                const inputText: string = "$ 10 u/arktippr";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toContainAllKeys(["command", "arkToshiValue", "check", "smallFooter"]);
                expect(result.command).toEqual("TIP");
                expect(result.smallFooter).toBeFalse();
                expect(result.arkToshiValue).toEqual(new BigNumber(1));
                expect(result.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result.check.currency).toEqual("USD");
                expect(result.check.amount).toEqual(new BigNumber(10));
                expect(result.check.arkToshiValue).toEqual(new BigNumber(1));
            });

            it("for: $ 10 u/arktippr ~ (small footer)", async () => {
                const inputText: string = "$ 10 u/arktippr ~";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toContainAllKeys(["command", "arkToshiValue", "check", "smallFooter"]);
                expect(result.command).toEqual("TIP");
                expect(result.smallFooter).toBeTrue();
                expect(result.arkToshiValue).toEqual(new BigNumber(1));
                expect(result.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result.check.currency).toEqual("USD");
                expect(result.check.amount).toEqual(new BigNumber(10));
                expect(result.check.arkToshiValue).toEqual(new BigNumber(1));
            });

            it("for: $10 u/arktippr", async () => {
                const inputText: string = "$10 u/arktippr";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toContainAllKeys(["command", "arkToshiValue", "check", "smallFooter"]);
                expect(result.command).toEqual("TIP");
                expect(result.smallFooter).toBeFalse();
                expect(result.arkToshiValue).toEqual(new BigNumber(1));
                expect(result.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result.check.currency).toEqual("USD");
                expect(result.check.amount).toEqual(new BigNumber(10));
                expect(result.check.arkToshiValue).toEqual(new BigNumber(1));
            });

            it("for: $10 u/arktippr ~ (small footer)", async () => {
                const inputText: string = "$10 u/arktippr ~";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toContainAllKeys(["command", "arkToshiValue", "check", "smallFooter"]);
                expect(result.command).toEqual("TIP");
                expect(result.smallFooter).toBeTrue();
                expect(result.arkToshiValue).toEqual(new BigNumber(1));
                expect(result.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result.check.currency).toEqual("USD");
                expect(result.check.amount).toEqual(new BigNumber(10));
                expect(result.check.arkToshiValue).toEqual(new BigNumber(1));
            });

            it("for: 10 u/arktippr", async () => {
                const inputText: string = "10 u/arktippr";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toContainAllKeys(["command", "arkToshiValue", "check", "smallFooter"]);
                expect(result.command).toEqual("TIP");
                expect(result.smallFooter).toBeFalse();
                expect(result.arkToshiValue).toEqual(new BigNumber(1));
                expect(result.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result.check.currency).toEqual("ARK");
                expect(result.check.amount).toEqual(new BigNumber(10));
                expect(result.check.arkToshiValue).toEqual(new BigNumber(1));
            });

            it("for: EOS 10 u/arktippr (expected behaviour is ARK for any text that is not a valid currency before the number)", async () => {
                const inputText: string = "10 u/arktippr";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toContainAllKeys(["command", "arkToshiValue", "check", "smallFooter"]);
                expect(result.command).toEqual("TIP");
                expect(result.smallFooter).toBeFalse();
                expect(result.arkToshiValue).toEqual(new BigNumber(1));
                expect(result.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result.check.currency).toEqual("ARK");
                expect(result.check.amount).toEqual(new BigNumber(10));
                expect(result.check.arkToshiValue).toEqual(new BigNumber(1));
            });

            it("for: 10 u/arktippr ~ (small footer)", async () => {
                const inputText: string = "10 u/arktippr ~";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toContainAllKeys(["command", "arkToshiValue", "check", "smallFooter"]);
                expect(result.command).toEqual("TIP");
                expect(result.smallFooter).toBeTrue();
                expect(result.arkToshiValue).toEqual(new BigNumber(1));
                expect(result.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result.check.currency).toEqual("ARK");
                expect(result.check.amount).toEqual(new BigNumber(10));
                expect(result.check.arkToshiValue).toEqual(new BigNumber(1));
            });

            it("for: text here that is no currency 10 u/arktippr", async () => {
                const inputText: string = "10 u/arktippr";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toContainAllKeys(["command", "arkToshiValue", "check", "smallFooter"]);
                expect(result.command).toEqual("TIP");
                expect(result.smallFooter).toBeFalse();
                expect(result.arkToshiValue).toEqual(new BigNumber(1));
                expect(result.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result.check.currency).toEqual("ARK");
                expect(result.check.amount).toEqual(new BigNumber(10));
                expect(result.check.arkToshiValue).toEqual(new BigNumber(1));
            });

            it("for: text here that is no currency 10 u/arktippr ~ (small footer)", async () => {
                const inputText: string = "10 u/arktippr ~";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toContainAllKeys(["command", "arkToshiValue", "check", "smallFooter"]);
                expect(result.command).toEqual("TIP");
                expect(result.smallFooter).toBeTrue();
                expect(result.arkToshiValue).toEqual(new BigNumber(1));
                expect(result.check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result.check.currency).toEqual("ARK");
                expect(result.check.amount).toEqual(new BigNumber(10));
                expect(result.check.arkToshiValue).toEqual(new BigNumber(1));
            });
        });

        describe("Should correctly parse REWARD mentions", () => {
            it("for a single REWARD entry", async () => {
                const inputText: string = "REWARD u/arktippr \
                    10 user1";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toContainAllKeys(["command", "transfers", "smallFooter"]);
                expect(result.command).toEqual("REWARD");
                expect(result.smallFooter).toBeFalse();
                expect(result.transfers).toBeArrayOfSize(1);
                expect(result.transfers[0]).toContainAllKeys(["user", "command", "arkToshiValue", "check"]);
                expect(result.transfers[0].user).toContainAllKeys(["username", "platform"]);
                expect(result.transfers[0].check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result.transfers[0].command).toEqual("TIP");
                expect(result.transfers[0].arkToshiValue).toEqual(new BigNumber(1));
                expect(result.transfers[0].check.currency).toEqual("ARK");
                expect(result.transfers[0].check.amount).toEqual(new BigNumber(10));
                expect(result.transfers[0].check.arkToshiValue).toEqual(new BigNumber(1));
                expect(result.transfers[0].user.username).toEqual("user1");
                expect(result.transfers[0].user.platform).toEqual("reddit");
            });

            it("for a single STICKERS REWARD entry", async () => {
                const inputText: string = "REWARD u/arktippr \
                    STICKERS user1";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toContainAllKeys(["command", "transfers", "smallFooter"]);
                expect(result.command).toEqual("REWARD");
                expect(result.smallFooter).toBeFalse();
                expect(result.transfers).toBeArrayOfSize(1);
                expect(result.transfers[0]).toContainAllKeys(["user", "command"]);
                expect(result.transfers[0].user).toContainAllKeys(["username", "platform"]);
                expect(result.transfers[0].command).toEqual("STICKERS");
                expect(result.transfers[0].user.username).toEqual("user1");
                expect(result.transfers[0].user.platform).toEqual("reddit");
            });

            it("for a multiple REWARD entry", async () => {
                const inputText: string =
                    "REWARD u/arktippr \
                    10 user1 \
                    20USD user2@twitter \
                    EUR30 user3 \
                    40 USD user4 \
                    STICKERS user5\
                    EUR 50 user6";
                const result: Mention = await parser.parseMention(inputText, mentionUser);
                expect(result).toContainAllKeys(["command", "transfers", "smallFooter"]);
                expect(result.command).toEqual("REWARD");
                expect(result.smallFooter).toBeFalse();
                expect(result.transfers).toBeArrayOfSize(6);
                expect(result.transfers[0]).toContainAllKeys(["user", "command", "arkToshiValue", "check"]);
                expect(result.transfers[0].user).toContainAllKeys(["username", "platform"]);
                expect(result.transfers[0].check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result.transfers[0].command).toEqual("TIP");
                expect(result.transfers[4].command).toEqual("STICKERS");
                expect(result.transfers[0].arkToshiValue).toEqual(new BigNumber(1));
                expect(result.transfers[0].check.currency).toEqual("ARK");
                expect(result.transfers[1].check.currency).toEqual("USD");
                expect(result.transfers[2].check.currency).toEqual("EUR");
                expect(result.transfers[3].check.currency).toEqual("USD");
                expect(result.transfers[5].check.currency).toEqual("EUR");
                expect(result.transfers[0].check.amount).toEqual(new BigNumber(10));
                expect(result.transfers[1].check.amount).toEqual(new BigNumber(20));
                expect(result.transfers[2].check.amount).toEqual(new BigNumber(30));
                expect(result.transfers[3].check.amount).toEqual(new BigNumber(40));
                expect(result.transfers[5].check.amount).toEqual(new BigNumber(50));
                expect(result.transfers[0].check.arkToshiValue).toEqual(new BigNumber(1));
                expect(result.transfers[0].user.username).toEqual("user1");
                expect(result.transfers[1].user.username).toEqual("user2");
                expect(result.transfers[2].user.username).toEqual("user3");
                expect(result.transfers[3].user.username).toEqual("user4");
                expect(result.transfers[4].user.username).toEqual("user5");
                expect(result.transfers[5].user.username).toEqual("user6");
                expect(result.transfers[0].user.platform).toEqual("reddit");
                expect(result.transfers[1].user.platform).toEqual("twitter");
            });
        });
    });

    describe("isValidCurrency()", () => {
        const baseCurrency = "TEST";
        const parser = new Parser(baseCurrency);

        describe("should return true on a valid currency", () => {
            it("for the base currency added via the constructor", () => {
                const data = "test";
                expect(parser.isValidCurrency(data)).toBeTrue();
            });

            it("for ARK and Ѧ", () => {
                let data = "ark";
                expect(parser.isValidCurrency(data)).toBeTrue();
                data = "Ѧ";
                expect(parser.isValidCurrency(data)).toBeTrue();
            });

            it("for USD and $", () => {
                let data = "usd";
                expect(parser.isValidCurrency(data)).toBeTrue();
                data = "$";
                expect(parser.isValidCurrency(data)).toBeTrue();
            });

            it("for EUR and €", () => {
                let data = "eur";
                expect(parser.isValidCurrency(data)).toBeTrue();
                data = "€";
                expect(parser.isValidCurrency(data)).toBeTrue();
            });

            it("for BTC", () => {
                const data = "btc";
                expect(parser.isValidCurrency(data)).toBeTrue();
            });

            it("for BCH", () => {
                const data = "bch";
                expect(parser.isValidCurrency(data)).toBeTrue();
            });
        });
    });

    describe("parseAmount()", () => {
        describe("should return null on bad input", () => {
            const currency = "USD";
            const badInput = "";
            const parser = new Parser();
            const badInputValidCurrency = "USD";
            it("for input without a numerical part, but with valid currency (USD)", async () => {
                let amountCurrency = await parser.parseAmount(badInputValidCurrency);
                expect(amountCurrency).toBeNull();
                amountCurrency = await parser.parseAmount(badInputValidCurrency, badInput);
                expect(amountCurrency).toBeNull();
                amountCurrency = await parser.parseAmount(badInput, badInputValidCurrency);
                expect(amountCurrency).toBeNull();
            });

            const badInputBadCurrency = "EOS";
            it("for input without a numerical part and without valid currency (EOS)", async () => {
                let amountCurrency = await parser.parseAmount(badInputBadCurrency);
                expect(amountCurrency).toBeNull();
                amountCurrency = await parser.parseAmount(badInputBadCurrency, badInput);
                expect(amountCurrency).toBeNull();
                amountCurrency = await parser.parseAmount(badInput, badInputBadCurrency);
                expect(amountCurrency).toBeNull();
            });

            const badInputBadCurrencyWithNumerical = "10EOS";
            it("for input with a numerical part and without valid currency (10EOS)", async () => {
                let amountCurrency = await parser.parseAmount(badInputBadCurrencyWithNumerical);
                expect(amountCurrency).toBeNull();
                amountCurrency = await parser.parseAmount(badInputBadCurrencyWithNumerical, badInput);
                expect(amountCurrency).toBeNull();
                amountCurrency = await parser.parseAmount(badInput, badInputBadCurrencyWithNumerical);
                expect(amountCurrency).toBeNull();
            });

            const amount = "10";
            it("for input with a numerical part and without valid currency (10 EOS)", async () => {
                let amountCurrency = await parser.parseAmount(amount, badInputBadCurrency);
                expect(amountCurrency).toBeNull();
                amountCurrency = await parser.parseAmount(badInputBadCurrency, amount);
                expect(amountCurrency).toBeNull();
            });

            const badInputWithNumericalLargerThanMAXINT = `${Number.MAX_SAFE_INTEGER + 1}`;
            it("for input with a numerical part that is larger than, or equal to, Max Integer value", async () => {
                let amountCurrency = await parser.parseAmount(badInputWithNumericalLargerThanMAXINT);
                expect(amountCurrency).toBeNull();
                amountCurrency = await parser.parseAmount(badInputWithNumericalLargerThanMAXINT, badInput);
                expect(amountCurrency).toBeNull();
                amountCurrency = await parser.parseAmount(badInput, badInputWithNumericalLargerThanMAXINT);
                expect(amountCurrency).toBeNull();
                amountCurrency = await parser.parseAmount(badInputWithNumericalLargerThanMAXINT, currency);
                expect(amountCurrency).toBeNull();
                amountCurrency = await parser.parseAmount(currency, badInputWithNumericalLargerThanMAXINT);
                expect(amountCurrency).toBeNull();
            });
        });

        describe("should correctly parse a valid numerical input as a value in the base currency", () => {
            const baseCurrency = "TEST";
            const parser = new Parser(baseCurrency);

            it("for an Integer value (10)", async () => {
                const input: string = "10";
                let amountCurrency = await parser.parseAmount(input);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(baseCurrency);
                expect(amountCurrency.amount).toEqual(new BigNumber(10));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(1));
                amountCurrency = await parser.parseAmount(input, "");
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(baseCurrency);
                expect(amountCurrency.amount).toEqual(new BigNumber(10));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(1));
                amountCurrency = await parser.parseAmount("", input);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(baseCurrency);
                expect(amountCurrency.amount).toEqual(new BigNumber(10));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(1));
            });

            it("for a decimal value (1.0)", async () => {
                const input = "1.0";
                const amountCurrency = await parser.parseAmount(input);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(baseCurrency);
                expect(amountCurrency.amount).toEqual(new BigNumber(1.0));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(1));
            });

            it("for an international decimal value (1,0)", async () => {
                const input = "1,0";
                const amountCurrency = await parser.parseAmount(input);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(baseCurrency);
                expect(amountCurrency.amount).toEqual(new BigNumber(1.0));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(1));
            });
        });

        describe("should correctly parse and valuate valid ammountCurrency input", () => {
            const currency = "USD";
            const parser = new Parser();

            it("for an Integer value + a currency (10USD)", async () => {
                const input: string = "10USD";
                let amountCurrency = await parser.parseAmount(input);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(currency);
                expect(amountCurrency.amount).toEqual(new BigNumber(10));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(1));
                amountCurrency = await parser.parseAmount(input, "");
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(currency);
                expect(amountCurrency.amount).toEqual(new BigNumber(10));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(1));
                amountCurrency = await parser.parseAmount("", input);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(currency);
                expect(amountCurrency.amount).toEqual(new BigNumber(10));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(1));
            });

            it("for a decimal value + a currency (1.0USD)", async () => {
                const input = "1.0USD";
                const amountCurrency = await parser.parseAmount(input);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(currency);
                expect(amountCurrency.amount).toEqual(new BigNumber(1.0));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(1));
            });

            it("for an international decimal value + a currency (1,0USD)", async () => {
                const input = "1,0USD";
                const amountCurrency = await parser.parseAmount(input);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(currency);
                expect(amountCurrency.amount).toEqual(new BigNumber(1.0));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(1));
            });

            it("for a currency + an Integer value (USD10)", async () => {
                const input: string = "USD10";
                const amountCurrency = await parser.parseAmount(input);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(currency);
                expect(amountCurrency.amount).toEqual(new BigNumber(10));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(1));
            });

            it("for a currency + a decimal value (USD1.0)", async () => {
                const input = "USD1.0";
                const amountCurrency = await parser.parseAmount(input);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(currency);
                expect(amountCurrency.amount).toEqual(new BigNumber(1.0));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(1));
            });

            it("for a currency + an international decimal value (USD1,0)", async () => {
                const input = "USD1,0";
                const amountCurrency = await parser.parseAmount(input);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(currency);
                expect(amountCurrency.amount).toEqual(new BigNumber(1.0));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(1));
            });
        });

        describe("should correctly parse and valuate valid ammount and valid currency input", () => {
            const currency = "USD";
            const parser = new Parser();

            it("for an Integer value + a currency (10 USD)", async () => {
                const input: string = "10";
                const amountCurrency = await parser.parseAmount(input, currency);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(currency);
                expect(amountCurrency.amount).toEqual(new BigNumber(10));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(1));
            });

            it("for a decimal value + a currency (1.0 USD)", async () => {
                const input = "1.0";
                const amountCurrency = await parser.parseAmount(input, currency);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(currency);
                expect(amountCurrency.amount).toEqual(new BigNumber(1.0));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(1));
            });

            it("for an international decimal value + a currency (1,0 USD)", async () => {
                const input = "1,0";
                const amountCurrency = await parser.parseAmount(input, currency);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(currency);
                expect(amountCurrency.amount).toEqual(new BigNumber(1.0));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(1));
            });

            it("for a currency + an Integer value (USD 10)", async () => {
                const input: string = "10";
                const amountCurrency = await parser.parseAmount(currency, input);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(currency);
                expect(amountCurrency.amount).toEqual(new BigNumber(10));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(1));
            });

            it("for a currency + a decimal value (USD 1.0)", async () => {
                const input = "1.0";
                const amountCurrency = await parser.parseAmount(currency, input);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(currency);
                expect(amountCurrency.amount).toEqual(new BigNumber(1.0));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(1));
            });

            it("for a currency + an international decimal value (USD 1,0)", async () => {
                const input = "1,0";
                const amountCurrency = await parser.parseAmount(currency, input);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(currency);
                expect(amountCurrency.amount).toEqual(new BigNumber(1.0));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(1));
            });

            it("for a currency symbol + a valid value (Ѧ 1)", async () => {
                const input = "1";
                const inputCurrency = "Ѧ";
                const expectedCurrency = "ARK";
                const amountCurrency = await parser.parseAmount(inputCurrency, input);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(expectedCurrency);
                expect(amountCurrency.amount).toEqual(new BigNumber(1.0));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(1));
            });
        });
    });
});
