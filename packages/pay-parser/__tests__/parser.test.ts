import BigNumber from "bignumber.js";
import "jest-extended";
import { Command } from "../../pay-commands";
import { Parser } from "../dist";

describe("pay-Parser: Parser()", () => {
    describe("parseMention()", () => {
        const mentionUser = "arktippr";
        const platform = "reddit";

        describe("should return a valid Command for a STICKERS mention", () => {
            it("for: stickers u/arktippr", async () => {
                const inputText: string = "stickers u/arktippr";
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
                expect(result).toContainAllKeys(["command", "smallFooter"]);
                expect(result.command).toEqual("STICKERS");
                expect(result.smallFooter).toBeFalse();
            });

            it("for: stickers u/arktippr.", async () => {
                const inputText: string = "stickers u/arktippr.";
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
                expect(result).toContainAllKeys(["command", "smallFooter"]);
                expect(result.command).toEqual("STICKERS");
                expect(result.smallFooter).toBeFalse();
            });

            it("for: stickers u/arktippr ~ (small footer)", async () => {
                const inputText: string = "stickers u/arktippr ~";
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
                expect(result).toContainAllKeys(["command", "smallFooter"]);
                expect(result.command).toEqual("STICKERS");
                expect(result.smallFooter).toBeTrue();
            });

            it("for: I am giving you stickers u/arktippr so you can enjoy them", async () => {
                const inputText: string = "I am giving you stickers u/arktippr so you can enjoy them";
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
                expect(result).toContainAllKeys(["command", "smallFooter"]);
                expect(result.command).toEqual("STICKERS");
                expect(result.smallFooter).toBeFalse();
            });

            it("for: I am giving you stickers u/arktippr ~ so you can enjoy them (small footer)", async () => {
                const inputText: string = "I am giving you stickers u/arktippr ~ so you can enjoy them";
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
                expect(result).toContainAllKeys(["command", "smallFooter"]);
                expect(result.command).toEqual("STICKERS");
                expect(result.smallFooter).toBeTrue();
            });

            it("for: stickers @arktippr.", async () => {
                const inputText: string = "stickers @arktippr";
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
                expect(result).toContainAllKeys(["command", "smallFooter"]);
                expect(result.command).toEqual("STICKERS");
                expect(result.smallFooter).toBeFalse();
            });

            it("for: stickers @arktippr.", async () => {
                const inputText: string = "stickers @arktippr.";
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
                expect(result).toContainAllKeys(["command", "smallFooter"]);
                expect(result.command).toEqual("STICKERS");
                expect(result.smallFooter).toBeFalse();
            });

            it("for: I am giving you stickers @arktippr so you can enjoy them", async () => {
                const inputText: string = "I am giving you stickers @arktippr so you can enjoy them";
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
                expect(result).toContainAllKeys(["command", "smallFooter"]);
                expect(result.command).toEqual("STICKERS");
                expect(result.smallFooter).toBeFalse();
            });
        });

        describe("should return a valid Command for a TIP mention", () => {
            it("for: 10 USD u/arktippr", async () => {
                const inputText: string = "10 USD u/arktippr";
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
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
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
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
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
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
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
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

        describe("should return a valid Command for a TIP mention", () => {
            it("for: USD 10 u/arktippr", async () => {
                const inputText: string = "USD 10 u/arktippr";
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
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
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
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
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
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
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
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
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
                expect(result).toBeNull();
            });

            it("for: 10EOS u/arktippr", async () => {
                const inputText: string = "10EOS u/arktippr";
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
                expect(result).toBeNull();
            });

            it("for: 10 EOS u/arktippr", async () => {
                const inputText: string = "10 for u/arktippr";
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
                expect(result).toBeNull();
            });

            it("for: a message without a tip u/arktippr", async () => {
                const inputText: string = "a message without a tip u/arktippr";
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
                expect(result).toBeNull();
            });
        });

        describe("Should return null on non-valid input", () => {
            it("for empty input", async () => {
                const emptyInput = "";
                let result: Command = await Parser.parseMention(emptyInput, mentionUser, platform);
                expect(result).toBeNull();
                result = await Parser.parseMention(emptyInput, emptyInput, platform);
                expect(result).toBeNull();
                const inputText: string = "10 u/arktippr";
                result = await Parser.parseMention(inputText, emptyInput, platform);
                expect(result).toBeNull();
            });

            it("for a mention without a command", async () => {
                const onlyMention = "u/arktippr";
                const result: Command = await Parser.parseMention(onlyMention, mentionUser, platform);
                expect(result).toBeNull();
            });

            it("for invalid or badly formatted input", async () => {
                let badInput: string = "anything that is not valid for u/arktippr We just mentioned him";
                let result: Command = await Parser.parseMention(badInput, mentionUser, platform);
                expect(result).toBeNull();
                badInput = "10 for u/arktippr";
                result = await Parser.parseMention(badInput, mentionUser, platform);
                expect(result).toBeNull();
                badInput = "10 nocurrency u/arktippr";
                result = await Parser.parseMention(badInput, mentionUser, platform);
                expect(result).toBeNull();
                badInput = "10nocurrency u/arktippr";
                result = await Parser.parseMention(badInput, mentionUser, platform);
                expect(result).toBeNull();
            });

            it("for badly formatted REWARD commands", async () => {
                let inputText: string = "REWARD u/arktippr \
                    10 badUser1";
                let result: Command = await Parser.parseMention(inputText, mentionUser, platform);
                expect(result).toBeNull();
                inputText = "REWARD u/arktippr \
                    STICKERS badUser1";
                result = await Parser.parseMention(inputText, mentionUser, platform);
                expect(result).toBeNull();
            });

            it("for empty input", async () => {
                const emptyInput = "";
                let result: Command = await Parser.parseMention(emptyInput, mentionUser, platform);
                expect(result).toBeNull();
                result = await Parser.parseMention(emptyInput, emptyInput, platform);
                expect(result).toBeNull();
                const inputText: string = "10 u/arktippr";
                result = await Parser.parseMention(inputText, emptyInput, platform);
                expect(result).toBeNull();
            });
        });

        describe("should return a valid Command for a TIP mention", () => {
            it("for: 10 $ u/arktippr", async () => {
                const inputText: string = "10 $ u/arktippr";
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
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
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
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
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
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
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
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

        describe("should return a valid Command for a TIP mention", () => {
            it("for: $ 10 u/arktippr", async () => {
                const inputText: string = "$ 10 u/arktippr";
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
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
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
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
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
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
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
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
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
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
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
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
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
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
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
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
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
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
                    10 u/user1";
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
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
                expect(result.transfers[0].user.platform).toEqual(platform);
            });

            it("for a single STICKERS REWARD entry", async () => {
                const inputText: string = "REWARD u/arktippr \
                    STICKERS user1";
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
                expect(result).toContainAllKeys(["command", "transfers", "smallFooter"]);
                expect(result.command).toEqual("REWARD");
                expect(result.smallFooter).toBeFalse();
                expect(result.transfers).toBeArrayOfSize(1);
                expect(result.transfers[0]).toContainAllKeys(["user", "command"]);
                expect(result.transfers[0].user).toContainAllKeys(["username", "platform"]);
                expect(result.transfers[0].command).toEqual("STICKERS");
                expect(result.transfers[0].user.username).toEqual("user1");
                expect(result.transfers[0].user.platform).toEqual(platform);
            });

            it("for a multiple REWARD entry", async () => {
                const inputText: string =
                    "REWARD u/arktippr \
                    10 user1 \
                    20USD @user2@twitter \
                    EUR30 user3 \
                    40 USD u/user4 \
                    STICKERS user5@reddit\
                    EUR 50 user6";
                const result: Command = await Parser.parseMention(inputText, mentionUser, platform);
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
                expect(result.transfers[0].user.platform).toEqual(platform);
                expect(result.transfers[1].user.platform).toEqual("twitter");
                expect(result.transfers[4].user.platform).toEqual("reddit");
            });
        });
    });

    describe("parseDirectMessage", () => {
        const platform = "reddit";

        it("should return NULL on input that contains no commands", async () => {
            const messageBody: string = "whatever is here does not matter";
            const result = await Parser.parseDirectMessage(messageBody, platform);
            expect(result).toBeNull();
        });

        describe("should correctly parse a single command that has no input arguments", () => {
            it("HELP", async () => {
                const messageBody: string = "HELP whatever is here does not matter";
                const result = await Parser.parseDirectMessage(messageBody, platform);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainKey("command");
                expect(result[0].command).toEqual("HELP");
            });

            it("BALANCE", async () => {
                const messageBody: string = "BALANCE whatever is here does not matter";
                const result = await Parser.parseDirectMessage(messageBody, platform);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainKey("command");
                expect(result[0].command).toEqual("BALANCE");
            });

            it("TIP", async () => {
                const messageBody: string = "TIP whatever is here does not matter";
                const result = await Parser.parseDirectMessage(messageBody, platform);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainKey("command");
                expect(result[0].command).toEqual("TIP");
            });

            it("DEPOSIT", async () => {
                const messageBody: string = "DEPOSIT whatever is here does not matter";
                const result = await Parser.parseDirectMessage(messageBody, platform);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainKey("command");
                expect(result[0].command).toEqual("DEPOSIT");
            });

            it("ADDRESS", async () => {
                const messageBody: string = "ADDRESS whatever is here does not matter";
                const result = await Parser.parseDirectMessage(messageBody, platform);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainKey("command");
                expect(result[0].command).toEqual("ADDRESS");
            });
        });

        describe("should correctly parse a single command that has input arguments", () => {
            it("STICKERS without valid arguments (request for HELP)", async () => {
                const messageBody: string = "STICKERS whatever is here does not matter";
                const result = await Parser.parseDirectMessage(messageBody, platform);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainKey("command");
                expect(result[0].command).toEqual("STICKERS");
            });

            it("STICKERS with valid argument", async () => {
                const messageBody: string = "STICKERS user1";
                const result = await Parser.parseDirectMessage(messageBody, platform);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "user"]);
                expect(result[0].command).toEqual("STICKERS");
                expect(result[0].user).toContainAllKeys(["username", "platform"]);
                expect(result[0].user.username).toEqual("user1");
                expect(result[0].user.platform).toEqual(platform);
            });

            it("SEND without arguments (request for HELP)", async () => {
                const messageBody: string = "SEND whatever is here does not matter";
                const result = await Parser.parseDirectMessage(messageBody, platform);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainKey("command");
                expect(result[0].command).toEqual("SEND");
            });

            it("SEND with valid arguments", async () => {
                let messageBody: string = "SEND user1 10 USD";
                let result = await Parser.parseDirectMessage(messageBody, platform);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "transfers"]);
                expect(result[0].command).toEqual("SEND");
                expect(result[0].transfers).toBeArrayOfSize(1);
                expect(result[0].transfers[0]).toContainAllKeys(["user", "command", "arkToshiValue", "check"]);
                expect(result[0].transfers[0].user.username).toEqual("user1");
                expect(result[0].transfers[0].user.platform).toEqual(platform);
                expect(result[0].transfers[0].arkToshiValue).toEqual(new BigNumber(1));
                expect(result[0].transfers[0].check.currency).toEqual("USD");
                expect(result[0].transfers[0].check.amount).toEqual(new BigNumber(10));
                messageBody = "SEND user1 ARK 10";
                result = await Parser.parseDirectMessage(messageBody, platform);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "transfers"]);
                expect(result[0].command).toEqual("SEND");
                expect(result[0].transfers).toBeArrayOfSize(1);
                expect(result[0].transfers[0]).toContainAllKeys(["user", "command", "arkToshiValue", "check"]);
                expect(result[0].transfers[0].user.username).toEqual("user1");
                expect(result[0].transfers[0].user.platform).toEqual(platform);
                expect(result[0].transfers[0].arkToshiValue).toEqual(new BigNumber(1));
                expect(result[0].transfers[0].check.currency).toEqual("ARK");
                expect(result[0].transfers[0].check.amount).toEqual(new BigNumber(10));
                messageBody = "SEND user1 10";
                result = await Parser.parseDirectMessage(messageBody, platform);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "transfers"]);
                expect(result[0].command).toEqual("SEND");
                expect(result[0].transfers).toBeArrayOfSize(1);
                expect(result[0].transfers[0]).toContainAllKeys(["user", "command", "arkToshiValue", "check"]);
                expect(result[0].transfers[0].user.username).toEqual("user1");
                expect(result[0].transfers[0].user.platform).toEqual(platform);
                expect(result[0].transfers[0].arkToshiValue).toEqual(new BigNumber(1));
                expect(result[0].transfers[0].check.currency).toEqual("ARK");
                expect(result[0].transfers[0].check.amount).toEqual(new BigNumber(10));
                messageBody = "SEND user1 EUR10";
                result = await Parser.parseDirectMessage(messageBody, platform);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "transfers"]);
                expect(result[0].command).toEqual("SEND");
                expect(result[0].transfers).toBeArrayOfSize(1);
                expect(result[0].transfers[0]).toContainAllKeys(["user", "command", "arkToshiValue", "check"]);
                expect(result[0].transfers[0].user.username).toEqual("user1");
                expect(result[0].transfers[0].user.platform).toEqual(platform);
                expect(result[0].transfers[0].arkToshiValue).toEqual(new BigNumber(1));
                expect(result[0].transfers[0].check.currency).toEqual("EUR");
                expect(result[0].transfers[0].check.amount).toEqual(new BigNumber(10));
                messageBody = "SEND user1 10BTC";
                result = await Parser.parseDirectMessage(messageBody, platform);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "transfers"]);
                expect(result[0].command).toEqual("SEND");
                expect(result[0].transfers).toBeArrayOfSize(1);
                expect(result[0].transfers[0]).toContainAllKeys(["user", "command", "arkToshiValue", "check"]);
                expect(result[0].transfers[0].user.username).toEqual("user1");
                expect(result[0].transfers[0].user.platform).toEqual(platform);
                expect(result[0].transfers[0].arkToshiValue).toEqual(new BigNumber(1));
                expect(result[0].transfers[0].check.currency).toEqual("BTC");
                expect(result[0].transfers[0].check.amount).toEqual(new BigNumber(10));
            });

            it("WITHDRAW without arguments (request for WITHDRAW)", async () => {
                const messageBody: string = "WITHDRAW whatever is here does not matter";
                const result = await Parser.parseDirectMessage(messageBody, platform);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainKey("command");
                expect(result[0].command).toEqual("WITHDRAW");
            });

            it("WITHDRAW with valid arguments", async () => {
                let messageBody: string = "WITHDRAW AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V";
                let result = await Parser.parseDirectMessage(messageBody, platform);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "transfers"]);
                expect(result[0].command).toEqual("WITHDRAW");
                expect(result[0].transfers).toBeArrayOfSize(1);
                expect(result[0].transfers[0]).toContainAllKeys(["address", "command", "arkToshiValue", "check"]);
                expect(result[0].transfers[0].address).toEqual("AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V");
                expect(result[0].transfers[0].arkToshiValue).toBeNull();
                messageBody = "WITHDRAW AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V 10";
                result = await Parser.parseDirectMessage(messageBody, platform);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "transfers"]);
                expect(result[0].command).toEqual("WITHDRAW");
                expect(result[0].transfers).toBeArrayOfSize(1);
                expect(result[0].transfers[0]).toContainAllKeys(["address", "command", "arkToshiValue", "check"]);
                expect(result[0].transfers[0].address).toEqual("AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V");
                expect(result[0].transfers[0].arkToshiValue).toEqual(new BigNumber(1));
                expect(result[0].transfers[0].check.currency).toEqual("ARK");
                expect(result[0].transfers[0].check.amount).toEqual(new BigNumber(10));
                messageBody = "WITHDRAW AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V ARK 10";
                result = await Parser.parseDirectMessage(messageBody, platform);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "transfers"]);
                expect(result[0].command).toEqual("WITHDRAW");
                expect(result[0].transfers).toBeArrayOfSize(1);
                expect(result[0].transfers[0]).toContainAllKeys(["address", "command", "arkToshiValue", "check"]);
                expect(result[0].transfers[0].address).toEqual("AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V");
                expect(result[0].transfers[0].arkToshiValue).toEqual(new BigNumber(1));
                expect(result[0].transfers[0].check.currency).toEqual("ARK");
                expect(result[0].transfers[0].check.amount).toEqual(new BigNumber(10));
                messageBody = "WITHDRAW AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V 10 USD";
                result = await Parser.parseDirectMessage(messageBody, platform);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "transfers"]);
                expect(result[0].command).toEqual("WITHDRAW");
                expect(result[0].transfers).toBeArrayOfSize(1);
                expect(result[0].transfers[0]).toContainAllKeys(["address", "command", "arkToshiValue", "check"]);
                expect(result[0].transfers[0].address).toEqual("AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V");
                expect(result[0].transfers[0].arkToshiValue).toEqual(new BigNumber(1));
                expect(result[0].transfers[0].check.currency).toEqual("USD");
                expect(result[0].transfers[0].check.amount).toEqual(new BigNumber(10));
                messageBody = "WITHDRAW AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V 10USD";
                result = await Parser.parseDirectMessage(messageBody, platform);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "transfers"]);
                expect(result[0].command).toEqual("WITHDRAW");
                expect(result[0].transfers).toBeArrayOfSize(1);
                expect(result[0].transfers[0]).toContainAllKeys(["address", "command", "arkToshiValue", "check"]);
                expect(result[0].transfers[0].address).toEqual("AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V");
                expect(result[0].transfers[0].arkToshiValue).toEqual(new BigNumber(1));
                expect(result[0].transfers[0].check.currency).toEqual("USD");
                expect(result[0].transfers[0].check.amount).toEqual(new BigNumber(10));
                messageBody = "WITHDRAW AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V EUR10";
                result = await Parser.parseDirectMessage(messageBody, platform);
                expect(result).toBeArrayOfSize(1);
                expect(result[0]).toContainAllKeys(["command", "transfers"]);
                expect(result[0].command).toEqual("WITHDRAW");
                expect(result[0].transfers).toBeArrayOfSize(1);
                expect(result[0].transfers[0]).toContainAllKeys(["address", "command", "arkToshiValue", "check"]);
                expect(result[0].transfers[0].address).toEqual("AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V");
                expect(result[0].transfers[0].arkToshiValue).toEqual(new BigNumber(1));
                expect(result[0].transfers[0].check.currency).toEqual("EUR");
                expect(result[0].transfers[0].check.amount).toEqual(new BigNumber(10));
            });

            it("Should return an array of parsed commands", async () => {
                const messageBody: string = "WITHDRAW AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V SEND user1 10 USD HELP";
                const result = await Parser.parseDirectMessage(messageBody, platform);
                expect(result).toBeArrayOfSize(3);
            });
        });
    });
});
