import BigNumber from "bignumber.js";
import "jest-extended";
import { Command, Transfer } from "../../pay-commands/src";
import { AmountCurrency } from "../../pay-currency/src";
import { CurrencyUtils } from "../../pay-currency/src/utils";
import { Username } from "../../pay-user/src/";
import { ParserUtils } from "../src/utils";

const arktoshiValue = new BigNumber(Math.pow(10, 8));
const amount = new BigNumber(10);

describe("pay-Parser: ParserUtils()", () => {
    describe("parseAmount()", () => {
        describe("should return null on bad input", () => {
            const currency = "USD";
            const badInput = "";
            const badInputValidCurrency = "USD";
            it("for input without a numerical part, but with valid currency (USD)", async () => {
                let amountCurrency = await ParserUtils.parseAmount(badInputValidCurrency);
                expect(amountCurrency).toBeNull();
                amountCurrency = await ParserUtils.parseAmount(badInputValidCurrency, badInput);
                expect(amountCurrency).toBeNull();
                amountCurrency = await ParserUtils.parseAmount(badInput, badInputValidCurrency);
                expect(amountCurrency).toBeNull();
            });

            const badInputBadCurrency = "EOS";
            it("for input without a numerical part and without valid currency (EOS)", async () => {
                let amountCurrency = await ParserUtils.parseAmount(badInputBadCurrency);
                expect(amountCurrency).toBeNull();
                amountCurrency = await ParserUtils.parseAmount(badInputBadCurrency, badInput);
                expect(amountCurrency).toBeNull();
                amountCurrency = await ParserUtils.parseAmount(badInput, badInputBadCurrency);
                expect(amountCurrency).toBeNull();
            });

            const badInputBadCurrencyWithNumerical = "10EOS";
            it("for input with a numerical part and without valid currency (10EOS)", async () => {
                let amountCurrency = await ParserUtils.parseAmount(badInputBadCurrencyWithNumerical);
                expect(amountCurrency).toBeNull();
                amountCurrency = await ParserUtils.parseAmount(badInputBadCurrencyWithNumerical, badInput);
                expect(amountCurrency).toBeNull();
                amountCurrency = await ParserUtils.parseAmount(badInput, badInputBadCurrencyWithNumerical);
                expect(amountCurrency).toBeNull();
            });

            const amount = "10";
            it("for input with a numerical part and without valid currency (10 EOS)", async () => {
                let amountCurrency = await ParserUtils.parseAmount(amount, badInputBadCurrency);
                expect(amountCurrency).toBeNull();
                amountCurrency = await ParserUtils.parseAmount(badInputBadCurrency, amount);
                expect(amountCurrency).toBeNull();
            });

            const badInputWithNumericalLargerThanMAXINT = `${Number.MAX_SAFE_INTEGER + 1}`;
            it("for input with a numerical part that is larger than, or equal to, Max Integer value", async () => {
                let amountCurrency = await ParserUtils.parseAmount(badInputWithNumericalLargerThanMAXINT);
                expect(amountCurrency).toBeNull();
                amountCurrency = await ParserUtils.parseAmount(badInputWithNumericalLargerThanMAXINT, badInput);
                expect(amountCurrency).toBeNull();
                amountCurrency = await ParserUtils.parseAmount(badInput, badInputWithNumericalLargerThanMAXINT);
                expect(amountCurrency).toBeNull();
                amountCurrency = await ParserUtils.parseAmount(badInputWithNumericalLargerThanMAXINT, currency);
                expect(amountCurrency).toBeNull();
                amountCurrency = await ParserUtils.parseAmount(currency, badInputWithNumericalLargerThanMAXINT);
                expect(amountCurrency).toBeNull();
            });
        });

        describe("should correctly parse a valid numerical input as a value in the base currency", () => {
            const baseCurrency = "ARK";

            it("for an Integer value (10)", async () => {
                const input: string = "10";
                let amountCurrency = await ParserUtils.parseAmount(input);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(baseCurrency);
                expect(amountCurrency.amount).toEqual(new BigNumber(10));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(arktoshiValue.times(10)));
                amountCurrency = await ParserUtils.parseAmount(input, "");
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(baseCurrency);
                expect(amountCurrency.amount).toEqual(new BigNumber(10));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(arktoshiValue.times(10)));
                amountCurrency = await ParserUtils.parseAmount("", input);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(baseCurrency);
                expect(amountCurrency.amount).toEqual(new BigNumber(10));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(arktoshiValue.times(10)));
            });

            it("for a decimal value (1.0)", async () => {
                const input = "1.0";
                const amountCurrency = await ParserUtils.parseAmount(input);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(baseCurrency);
                expect(amountCurrency.amount).toEqual(new BigNumber(1.0));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(arktoshiValue));
            });

            it("for an international decimal value (1,0)", async () => {
                const input = "1,0";
                const amountCurrency = await ParserUtils.parseAmount(input);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(baseCurrency);
                expect(amountCurrency.amount).toEqual(new BigNumber(1.0));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(arktoshiValue));
            });
        });

        describe("should correctly parse and valuate valid ammountCurrency input", () => {
            const currency = "USD";
            const mock = jest.spyOn(CurrencyUtils, "getCurrencyTicker");
            mock.mockImplementation(() => Promise.resolve(new BigNumber(1)));

            it("for an Integer value + a currency (10USD)", async () => {
                const input: string = "10USD";
                let amountCurrency = await ParserUtils.parseAmount(input);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(currency);
                expect(amountCurrency.amount).toEqual(new BigNumber(10));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(arktoshiValue.times(10)));
                amountCurrency = await ParserUtils.parseAmount(input, "");
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(currency);
                expect(amountCurrency.amount).toEqual(new BigNumber(10));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(arktoshiValue.times(10)));
                amountCurrency = await ParserUtils.parseAmount("", input);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(currency);
                expect(amountCurrency.amount).toEqual(new BigNumber(10));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(arktoshiValue.times(10)));
            });

            it("for a decimal value + a currency (1.0USD)", async () => {
                const input = "1.0USD";
                const amountCurrency = await ParserUtils.parseAmount(input);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(currency);
                expect(amountCurrency.amount).toEqual(new BigNumber(1.0));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(arktoshiValue));
            });

            it("for an international decimal value + a currency (1,0USD)", async () => {
                const input = "1,0USD";
                const amountCurrency = await ParserUtils.parseAmount(input);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(currency);
                expect(amountCurrency.amount).toEqual(new BigNumber(1.0));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(arktoshiValue));
            });

            it("for a currency + an Integer value (USD10)", async () => {
                const input: string = "USD10";
                const amountCurrency = await ParserUtils.parseAmount(input);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(currency);
                expect(amountCurrency.amount).toEqual(new BigNumber(10));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(arktoshiValue.times(10)));
            });

            it("for a currency + a decimal value (USD1.0)", async () => {
                const input = "USD1.0";
                const amountCurrency = await ParserUtils.parseAmount(input);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(currency);
                expect(amountCurrency.amount).toEqual(new BigNumber(1.0));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(arktoshiValue));
            });

            it("for a currency + an international decimal value (USD1,0)", async () => {
                const input = "USD1,0";
                const amountCurrency = await ParserUtils.parseAmount(input);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(currency);
                expect(amountCurrency.amount).toEqual(new BigNumber(1.0));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(arktoshiValue));
            });
        });

        describe("should correctly parse and valuate valid ammount and valid currency input", () => {
            const currency = "USD";
            const mock = jest.spyOn(CurrencyUtils, "getCurrencyTicker");
            mock.mockImplementation(() => Promise.resolve(new BigNumber(1)));

            it("for an Integer value + a currency (10 USD)", async () => {
                const input: string = "10";
                const amountCurrency = await ParserUtils.parseAmount(input, currency);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(currency);
                expect(amountCurrency.amount).toEqual(new BigNumber(10));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(arktoshiValue.times(10)));
            });

            it("for a decimal value + a currency (1.0 USD)", async () => {
                const input = "1.0";
                const amountCurrency = await ParserUtils.parseAmount(input, currency);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(currency);
                expect(amountCurrency.amount).toEqual(new BigNumber(1.0));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(arktoshiValue));
            });

            it("for an international decimal value + a currency (1,0 USD)", async () => {
                const input = "1,0";
                const amountCurrency = await ParserUtils.parseAmount(input, currency);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(currency);
                expect(amountCurrency.amount).toEqual(new BigNumber(1.0));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(arktoshiValue));
            });

            it("for a currency + an Integer value (USD 10)", async () => {
                const input: string = "10";
                const amountCurrency = await ParserUtils.parseAmount(currency, input);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(currency);
                expect(amountCurrency.amount).toEqual(new BigNumber(10));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(arktoshiValue.times(10)));
            });

            it("for a currency + a decimal value (USD 1.0)", async () => {
                const input = "1.0";
                const amountCurrency = await ParserUtils.parseAmount(currency, input);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(currency);
                expect(amountCurrency.amount).toEqual(new BigNumber(1.0));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(arktoshiValue));
            });

            it("for a currency + an international decimal value (USD 1,0)", async () => {
                const input = "1,0";
                const amountCurrency = await ParserUtils.parseAmount(currency, input);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(currency);
                expect(amountCurrency.amount).toEqual(new BigNumber(1.0));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(arktoshiValue));
            });

            it("for a currency symbol + a valid value (Ѧ 1)", async () => {
                const input = "1";
                const inputCurrency = "Ѧ";
                const expectedCurrency = "ARK";
                const amountCurrency = await ParserUtils.parseAmount(inputCurrency, input);
                expect(amountCurrency).toBeObject();
                expect(amountCurrency).toContainKeys(["amount", "currency", "arkToshiValue"]);
                expect(amountCurrency.currency).toEqual(expectedCurrency);
                expect(amountCurrency.amount).toEqual(new BigNumber(1.0));
                expect(amountCurrency.arkToshiValue).toEqual(new BigNumber(arktoshiValue));
            });
        });
    });

    describe("parseAmount()", () => {
        describe("should correctly parse amount/currency combinations", () => {
            const mock = jest.spyOn(CurrencyUtils, "getCurrencyTicker");
            mock.mockImplementation(() => Promise.resolve(new BigNumber(1)));
            it("for a numerical input only (10)", async () => {
                const input: string = "10";
                let result: AmountCurrency = await ParserUtils.parseAmount(input);
                expect(result).toContainAllKeys(["arkToshiValue", "currency", "amount"]);
                expect(result.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result.currency).toEqual("ARK");
                expect(result.amount).toEqual(amount);
                result = await ParserUtils.parseAmount("", input);
                expect(result).toContainAllKeys(["arkToshiValue", "currency", "amount"]);
                expect(result.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result.currency).toEqual("ARK");
                expect(result.amount).toEqual(amount);
            });

            it("for a single argument currency input (10USD | USD10)", async () => {
                let input: string = "10USD";
                let result: AmountCurrency = await ParserUtils.parseAmount(input);
                expect(result).toContainAllKeys(["arkToshiValue", "currency", "amount"]);
                expect(result.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result.currency).toEqual("USD");
                expect(result.amount).toEqual(amount);
                result = await ParserUtils.parseAmount("", input);
                expect(result).toContainAllKeys(["arkToshiValue", "currency", "amount"]);
                expect(result.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result.currency).toEqual("USD");
                expect(result.amount).toEqual(amount);
                input = "USD10";
                result = await ParserUtils.parseAmount(input);
                expect(result).toContainAllKeys(["arkToshiValue", "currency", "amount"]);
                expect(result.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result.currency).toEqual("USD");
                expect(result.amount).toEqual(amount);
                result = await ParserUtils.parseAmount("", input);
                expect(result).toContainAllKeys(["arkToshiValue", "currency", "amount"]);
                expect(result.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result.currency).toEqual("USD");
                expect(result.amount).toEqual(amount);
            });

            it("for a double argument currency and numerical input (10 USD | USD 10)", async () => {
                const value: string = "10";
                const currency = "USD";
                let result: AmountCurrency = await ParserUtils.parseAmount(value, currency);
                expect(result).toContainAllKeys(["arkToshiValue", "currency", "amount"]);
                expect(result.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result.currency).toEqual("USD");
                expect(result.amount).toEqual(amount);
                result = await ParserUtils.parseAmount(currency, value);
                expect(result).toContainAllKeys(["arkToshiValue", "currency", "amount"]);
                expect(result.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result.currency).toEqual("USD");
                expect(result.amount).toEqual(amount);
            });
        });
        describe("should return NULL on invalid input", () => {
            it("for non numerical input", async () => {
                const badInput: string = "USD";
                let result: AmountCurrency = await ParserUtils.parseAmount(badInput);
                expect(result).toBeNull();
                result = await ParserUtils.parseAmount(badInput, badInput);
                expect(result).toBeNull();
                result = await ParserUtils.parseAmount("", badInput);
                expect(result).toBeNull();
            });

            it("for bad single argument currency input (10BAD | BAD10)", async () => {
                let badInput: string = "10BAD";
                let result: AmountCurrency = await ParserUtils.parseAmount(badInput);
                expect(result).toBeNull();
                result = await ParserUtils.parseAmount("", badInput);
                expect(result).toBeNull();
                badInput = "BAD10";
                result = await ParserUtils.parseAmount(badInput);
                expect(result).toBeNull();
                result = await ParserUtils.parseAmount("", badInput);
                expect(result).toBeNull();
            });

            it("for bad double argument currency input (10 BAD | BAD 10)", async () => {
                const value: string = "10";
                const badCurrency = "BAD";
                let result: AmountCurrency = await ParserUtils.parseAmount(value, badCurrency);
                expect(result).toBeNull();
                result = await ParserUtils.parseAmount(badCurrency, value);
                expect(result).toBeNull();
            });

            it("for empty input", async () => {
                const emptyInput: string = "";
                let result: AmountCurrency = await ParserUtils.parseAmount(emptyInput);
                expect(result).toBeNull();
                result = await ParserUtils.parseAmount(emptyInput, emptyInput);
                expect(result).toBeNull();
            });
        });
    });

    describe("parseTip()", () => {
        describe("should correctly parse a TIP in a mention", () => {
            const mock = jest.spyOn(CurrencyUtils, "getCurrencyTicker");
            mock.mockImplementation(() => Promise.resolve(new BigNumber(1)));
            it("for numerical input (10 u/arktippr)", async () => {
                const tipValue: string = "10";
                const mentionedUser: string = "u/arktippr";
                let input: string[] = [tipValue, mentionedUser];
                let mentionIndex: number = input.indexOf(mentionedUser);
                let result: AmountCurrency = await ParserUtils.parseTip(input, mentionIndex);
                expect(result).toContainAllKeys(["arkToshiValue", "currency", "amount"]);
                expect(result.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result.currency).toEqual("ARK");
                expect(result.amount).toEqual(amount);
                input = ["something", tipValue, mentionedUser];
                mentionIndex = input.indexOf(mentionedUser);
                result = await ParserUtils.parseTip(input, mentionIndex);
                expect(result).toContainAllKeys(["arkToshiValue", "currency", "amount"]);
                expect(result.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result.currency).toEqual("ARK");
                expect(result.amount).toEqual(amount);
                input = [tipValue, tipValue, mentionedUser];
                mentionIndex = input.indexOf(mentionedUser);
                result = await ParserUtils.parseTip(input, mentionIndex);
                expect(result).toContainAllKeys(["arkToshiValue", "currency", "amount"]);
                expect(result.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result.currency).toEqual("ARK");
                expect(result.amount).toEqual(amount);
            });

            it("for single argument input (10USD u/arktippr | USD10 u/arktippr)", async () => {
                let tipValue: string = "10USD";
                const mentionedUser: string = "u/arktippr";
                let input: string[] = [tipValue, mentionedUser];
                let mentionIndex: number = input.indexOf(mentionedUser);
                let result: AmountCurrency = await ParserUtils.parseTip(input, mentionIndex);
                expect(result).toContainAllKeys(["arkToshiValue", "currency", "amount"]);
                expect(result.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result.currency).toEqual("USD");
                expect(result.amount).toEqual(amount);
                tipValue = "USD10";
                result = await ParserUtils.parseTip(input, mentionIndex);
                expect(result).toContainAllKeys(["arkToshiValue", "currency", "amount"]);
                expect(result.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result.currency).toEqual("USD");
                expect(result.amount).toEqual(amount);
                input = ["something", tipValue, mentionedUser];
                mentionIndex = input.indexOf(mentionedUser);
                result = await ParserUtils.parseTip(input, mentionIndex);
                expect(result).toContainAllKeys(["arkToshiValue", "currency", "amount"]);
                expect(result.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result.currency).toEqual("USD");
                expect(result.amount).toEqual(amount);
                input = [tipValue, tipValue, mentionedUser];
                mentionIndex = input.indexOf(mentionedUser);
                result = await ParserUtils.parseTip(input, mentionIndex);
                expect(result).toContainAllKeys(["arkToshiValue", "currency", "amount"]);
                expect(result.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result.currency).toEqual("USD");
                expect(result.amount).toEqual(amount);
            });

            it("for double argument input (10 USD u/arktippr | USD 10 u/arktippr", async () => {
                const tipValue = "10";
                const currency = "USD";
                const mentionedUser: string = "u/arktippr";
                let input: string[] = [tipValue, currency, mentionedUser];
                let mentionIndex: number = input.indexOf(mentionedUser);
                let result: AmountCurrency = await ParserUtils.parseTip(input, mentionIndex);
                expect(result).toContainAllKeys(["arkToshiValue", "currency", "amount"]);
                expect(result.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result.currency).toEqual("USD");
                expect(result.amount).toEqual(amount);
                input = [currency, tipValue, mentionedUser];
                mentionIndex = input.indexOf(mentionedUser);
                result = await ParserUtils.parseTip(input, mentionIndex);
                expect(result).toContainAllKeys(["arkToshiValue", "currency", "amount"]);
                expect(result.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result.currency).toEqual("USD");
                expect(result.amount).toEqual(amount);
                input = ["something", currency, tipValue, mentionedUser];
                mentionIndex = input.indexOf(mentionedUser);
                result = await ParserUtils.parseTip(input, mentionIndex);
                expect(result).toContainAllKeys(["arkToshiValue", "currency", "amount"]);
                expect(result.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result.currency).toEqual("USD");
                expect(result.amount).toEqual(amount);
            });

            it("for a TIP in a wall of text", async () => {
                const bla = "bla";
                const tipValue = "10";
                const currency = "USD";
                const mentionedUser: string = "u/arktippr";
                let input: string[] = [bla, bla, bla, tipValue, currency, mentionedUser, bla, bla, bla];
                let mentionIndex: number = input.indexOf(mentionedUser);
                let result: AmountCurrency = await ParserUtils.parseTip(input, mentionIndex);
                expect(result).toContainAllKeys(["arkToshiValue", "currency", "amount"]);
                expect(result.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result.currency).toEqual("USD");
                expect(result.amount).toEqual(amount);
                input = [bla, bla, bla, tipValue, mentionedUser, bla, bla, bla];
                mentionIndex = input.indexOf(mentionedUser);
                result = await ParserUtils.parseTip(input, mentionIndex);
                expect(result).toContainAllKeys(["arkToshiValue", "currency", "amount"]);
                expect(result.arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result.currency).toEqual("ARK");
                expect(result.amount).toEqual(amount);
            });
        });

        it("should return null for a badly formatted mention", async () => {
            const mentionedUser: string = "u/arktippr";
            const input: string[] = [mentionedUser];
            const mentionIndex: number = input.indexOf(mentionedUser);
            const result: AmountCurrency = await ParserUtils.parseTip(input, mentionIndex);
            expect(result).toBeNull();
        });
    });

    describe("isValidLeftInput()", () => {
        it("should return TRUE on valid input", () => {
            let leftInput: string = "10";
            const rightInput: string = "NAN";
            let result: boolean = ParserUtils.isValidLeftInput(leftInput, rightInput);
            expect(result).toBeTrue();
            leftInput = "USD";
            result = ParserUtils.isValidLeftInput(leftInput, rightInput);
            expect(result).toBeTrue();
        });

        it("should return FALSE on invalid input", () => {
            let leftInput: string = "something";
            const rightInput: string = "10";
            let result: boolean = ParserUtils.isValidLeftInput(leftInput, rightInput);
            expect(result).toBeFalse();
            leftInput = "10";
            result = ParserUtils.isValidLeftInput(leftInput, rightInput);
            expect(result).toBeFalse();
        });
    });

    describe("isValidUser()", () => {
        it("should return TRUE on valid input", async () => {
            const user: Username = {
                username: "user1",
                platform: "reddit",
            };
            const result: boolean = await ParserUtils.isValidUser(user);
            expect(result).toBeTrue();
        });

        it("should return FALSE on invalid input", async () => {
            const user: Username = {
                username: "badUser1",
                platform: "reddit",
            };
            let result: boolean = await ParserUtils.isValidUser(user);
            expect(result).toBeFalse();
            user.platform = "badPlatform";
            result = await ParserUtils.isValidUser(user);
            expect(result).toBeFalse();
            user.username = "10";
            result = await ParserUtils.isValidUser(user);
            expect(result).toBeFalse();
            user.username = "USD";
            result = await ParserUtils.isValidUser(user);
            expect(result).toBeFalse();
        });
    });

    describe("findMentionedArkPayUser()", () => {
        it("should correctly find the index of the user that was mentioned in the array of mention parts", () => {
            const mentionedUser: string = "ARKTIPPR";
            const mentionParts: string[] = ["bla", "bla", mentionedUser, "bla"];
            let result: number = ParserUtils.findMentionedArkPayUser(mentionedUser, mentionParts);
            expect(result).toBe(mentionParts.indexOf(mentionedUser));
            result = ParserUtils.findMentionedArkPayUser(mentionedUser.toLowerCase(), mentionParts);
            expect(result).toBe(mentionParts.indexOf(mentionedUser));
        });

        it("should throw a TypeError if the mentioned user is the first entry in the array", () => {
            const mentionedUser: string = "ARKTIPPR";
            const mentionParts: string[] = [mentionedUser, "bla", "bla", "bla"];
            expect(() => {
                ParserUtils.findMentionedArkPayUser(mentionedUser, mentionParts);
            }).toThrow(TypeError);
            expect(() => {
                ParserUtils.findMentionedArkPayUser(mentionedUser.toLowerCase(), mentionParts);
            }).toThrow(TypeError);
        });

        it("should throw a TypeError if the mentioned user is not found in the array", () => {
            const mentionedUser: string = "ARKTIPPR";
            const mentionParts: string[] = ["bla", "bla", "bla"];
            expect(() => {
                ParserUtils.findMentionedArkPayUser(mentionedUser, mentionParts);
            }).toThrow(TypeError);
            expect(() => {
                ParserUtils.findMentionedArkPayUser(mentionedUser.toLowerCase(), mentionParts);
            }).toThrow(TypeError);
        });
    });

    describe("splitMessageToParts()", () => {
        it("Should correctly split up a string into seperate words and convert each word to uppercase", () => {
            let message: string = "this is a message";
            let result: string[] = ParserUtils.splitMessageToParts(message, false);
            expect(result).toBeArrayOfSize(4);
            expect(result[0]).toEqual("THIS");
            expect(result[3]).toEqual("MESSAGE");
            message = "this \
                is a\
                message";
            result = ParserUtils.splitMessageToParts(message, false);
            expect(result).toBeArrayOfSize(4);
            expect(result[0]).toEqual("THIS");
            expect(result[3]).toEqual("MESSAGE");
        });

        it("Should correctly split up a string into seperate words and not convert each word to uppercase", () => {
            const message: string = "this is a MESSAGE";
            const result: string[] = ParserUtils.splitMessageToParts(message, true);
            expect(result).toBeArrayOfSize(4);
            expect(result[0]).toEqual("this");
            expect(result[3]).toEqual("MESSAGE");
        });
    });

    describe("parseUsername()", () => {
        it("should correctly parse usernames and platforms", () => {
            let username = "user1";
            const platform = "reddit";
            let result: Username = ParserUtils.parseUsername(username, platform);
            expect(result).toContainAllKeys(["username", "platform"]);
            expect(result.username).toEqual(username);
            expect(result.platform).toEqual(platform);
            username = "u/user1";
            result = ParserUtils.parseUsername(username, platform);
            expect(result).toContainAllKeys(["username", "platform"]);
            expect(result.username).toEqual("user1");
            expect(result.platform).toEqual(platform);
            username = "@user1";
            result = ParserUtils.parseUsername(username, platform);
            expect(result).toContainAllKeys(["username", "platform"]);
            expect(result.username).toEqual("user1");
            expect(result.platform).toEqual(platform);
            username = "user1@twitter";
            result = ParserUtils.parseUsername(username, platform);
            expect(result).toContainAllKeys(["username", "platform"]);
            expect(result.username).toEqual("user1");
            expect(result.platform).toEqual("twitter");
            username = "u/user1@twitter";
            result = ParserUtils.parseUsername(username, platform);
            expect(result).toContainAllKeys(["username", "platform"]);
            expect(result.username).toEqual("user1");
            expect(result.platform).toEqual("twitter");
            username = "@user1@twitter";
            result = ParserUtils.parseUsername(username, platform);
            expect(result).toContainAllKeys(["username", "platform"]);
            expect(result.username).toEqual("user1");
            expect(result.platform).toEqual("twitter");
        });
    });

    describe("checkCommand()", () => {
        it("should correctly return a command that has no arguments", async () => {
            let command: string = "HELP";
            const platform: string = "reddit";
            const commandArguments: string[] = [];
            let result: Command = await ParserUtils.checkCommand(command, commandArguments, platform);
            expect(result).toContainAllKeys(["command"]);
            expect(result.command).toEqual(command);
            command = "DEPOSIT";
            result = await ParserUtils.checkCommand(command, commandArguments, platform);
            expect(result).toContainAllKeys(["command"]);
            expect(result.command).toEqual(command);
            command = "TIP";
            result = await ParserUtils.checkCommand(command, commandArguments, platform);
            expect(result).toContainAllKeys(["command"]);
            expect(result.command).toEqual(command);
            command = "BALANCE";
            result = await ParserUtils.checkCommand(command, commandArguments, platform);
            expect(result).toContainAllKeys(["command"]);
            expect(result.command).toEqual(command);
            command = "ADDRESS";
            result = await ParserUtils.checkCommand(command, commandArguments, platform);
            expect(result).toContainAllKeys(["command"]);
            expect(result.command).toEqual(command);
        });

        it("should return null for a command that is invalid", async () => {
            const command: string = "BADONE";
            const platform: string = "reddit";
            const commandArguments: string[] = [];
            const result: Command = await ParserUtils.checkCommand(command, commandArguments, platform);
            expect(result).toBeNull();
        });
    });

    describe("parseCommand()", () => {
        it("should return null for a command that is invalid", async () => {
            const command: string = "BADONE";
            const platform: string = "reddit";
            const commandArguments: string[] = [command];
            const result: Command = await ParserUtils.parseCommand(command, commandArguments, platform);
            expect(result).toBeNull();
        });

        it("should return {command} for a command that is valid, but has no need for additional argument", async () => {
            const command: string = "HELP";
            const platform: string = "reddit";
            let commandArguments: string[] = [command];
            let result: Command = await ParserUtils.parseCommand(command, commandArguments, platform);
            expect(result).toContainAllKeys(["command"]);
            expect(result.command).toEqual(command);
            commandArguments = [command, "bla"];
            result = await ParserUtils.parseCommand(command, commandArguments, platform);
            expect(result).toContainAllKeys(["command"]);
            expect(result.command).toEqual(command);
        });

        it("should correctly return a command when inputted without arguments", async () => {
            let command: string = "SEND";
            const platform: string = "reddit";
            let commandArguments: string[] = [command];
            let result: Command = await ParserUtils.parseCommand(command, commandArguments, platform);
            expect(result).toContainAllKeys(["command"]);
            expect(result.command).toEqual(command);
            command = "WITHDRAW";
            commandArguments = [command];
            result = await ParserUtils.parseCommand(command, commandArguments, platform);
            expect(result).toContainAllKeys(["command"]);
            expect(result.command).toEqual(command);
            command = "STICKERS";
            commandArguments = [command];
            result = await ParserUtils.parseCommand(command, commandArguments, platform);
            expect(result).toContainAllKeys(["command"]);
            expect(result.command).toEqual(command);
        });

        it("should correctly parse a SEND command with valid arguments", async () => {
            const platform: string = "reddit";
            const command: string = "SEND";
            const arg1: string = "user1";
            let arg2: string = "10";
            const arg3: string = "USD";
            let commandArguments: string[] = [command, arg1, arg2, arg3];
            let result = await ParserUtils.parseCommand(command, commandArguments, platform);
            expect(result).toContainAllKeys(["command", "transfers"]);
            expect(result.command).toEqual(command);
            expect(result.transfers).toBeArrayOfSize(1);
            expect(result.transfers[0]).toContainAllKeys(["user", "command", "arkToshiValue", "check"]);
            arg2 = "10USD";
            commandArguments = [command, arg1, arg2];
            result = await ParserUtils.parseCommand(command, commandArguments, platform);
            expect(result).toContainAllKeys(["command", "transfers"]);
            expect(result.command).toEqual(command);
            expect(result.transfers).toBeArrayOfSize(1);
            expect(result.transfers[0]).toContainAllKeys(["user", "command", "arkToshiValue", "check"]);
        });

        it("should correctly parse a WITHDRAW command with valid arguments", async () => {
            const platform: string = "reddit";
            const command = "WITHDRAW";
            const arg1 = "AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V";
            let arg2: string = "10";
            const arg3: string = "USD";
            let commandArguments: string[] = [command, arg1, arg2, arg3];
            let result = await ParserUtils.parseCommand(command, commandArguments, platform);
            expect(result).toContainAllKeys(["command", "transfers"]);
            expect(result.command).toEqual(command);
            expect(result.transfers).toBeArrayOfSize(1);
            expect(result.transfers[0]).toContainAllKeys(["address", "command", "arkToshiValue", "check"]);
            expect(result.transfers[0].arkToshiValue).toEqual(arktoshiValue.times(10));
            arg2 = "10USD";
            commandArguments = [command, arg1, arg2];
            result = await ParserUtils.parseCommand(command, commandArguments, platform);
            expect(result).toContainAllKeys(["command", "transfers"]);
            expect(result.command).toEqual(command);
            expect(result.transfers).toBeArrayOfSize(1);
            expect(result.transfers[0]).toContainAllKeys(["address", "command", "arkToshiValue", "check"]);
            expect(result.transfers[0].arkToshiValue).toEqual(arktoshiValue.times(10));
            commandArguments = [command, arg1];
            result = await ParserUtils.parseCommand(command, commandArguments, platform);
            expect(result).toContainAllKeys(["command", "transfers"]);
            expect(result.command).toEqual(command);
            expect(result.transfers).toBeArrayOfSize(1);
            expect(result.transfers[0]).toContainAllKeys(["address", "command", "arkToshiValue", "check"]);
            expect(result.transfers[0].arkToshiValue).toBeNull();
        });

        it("should correctly parse a STICKERS command with valid arguments", async () => {
            const platform: string = "reddit";
            const command = "STICKERS";
            const arg1: string = "user1";
            const commandArguments: string[] = [command, arg1];
            const result = await ParserUtils.parseCommand(command, commandArguments, platform);
            expect(result).toContainAllKeys(["command", "user"]);
        });
    });

    describe("isValidAddress()", () => {
        it("should correctly validate an ARK address", async () => {
            let address: string = "AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V";
            const token: string = "ARK";
            let result: boolean = await ParserUtils.isValidAddress(address, token);
            expect(result).toBeTrue();
            address = "BFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V";
            result = await ParserUtils.isValidAddress(address, token);
            expect(result).toBeFalse();
        });

        it("should correctly validate a DARK address", async () => {
            let address: string = "DFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V";
            const token: string = "DARK";
            let result: boolean = await ParserUtils.isValidAddress(address, token);
            expect(result).toBeTrue();
            address = "BFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V";
            result = await ParserUtils.isValidAddress(address, token);
            expect(result).toBeFalse();
        });

        it("should return false on other addresses", async () => {
            const address: string = "DFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V";
            const token: string = "NOTSUPPORTED";
            const result = await ParserUtils.isValidAddress(address, token);
            expect(result).toBeFalse();
        });
    });

    describe("commandIndex()", () => {
        it("should correctly find a command in an array of strings", () => {
            const bla: string = "bla";
            let command: string = "COMMAND";
            let stack: string[] = [command, bla, bla, bla];
            let result: number = ParserUtils.commandIndex(command, stack);
            expect(result).toEqual(0);
            command = "command";
            stack = [command, bla, bla, bla];
            result = ParserUtils.commandIndex(command, stack);
            expect(result).toEqual(0);
        });
    });

    describe("parseSEND()", () => {
        describe("should correctly parse a SEND command", () => {
            it("for a SEND without arguments", async () => {
                const arg1: string = "";
                const arg2: string = "";
                const arg3: string = "";
                const platform: string = "reddit";
                const result: Command = await ParserUtils.parseSEND(arg1, arg2, arg3, platform);
                expect(result).toContainAllKeys(["command"]);
                expect(result.command).toEqual("SEND");
            });
            it("for a SEND with 2 valid arguments", async () => {
                const arg1: string = "user1";
                const arg2: string = "10USD";
                const arg3: string = "";
                const platform: string = "reddit";
                const result: Command = await ParserUtils.parseSEND(arg1, arg2, arg3, platform);
                expect(result).toContainAllKeys(["command", "transfers"]);
                expect(result.command).toEqual("SEND");
                expect(result.transfers).toBeArrayOfSize(1);
                expect(result.transfers[0]).toContainAllKeys(["user", "command", "arkToshiValue", "check"]);
                expect(result.transfers[0].arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result.transfers[0].check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result.transfers[0].check.currency).toEqual("USD");
                expect(result.transfers[0].check.amount).toEqual(amount);
            });
            it("for a SEND with 3 valid arguments", async () => {
                const arg1: string = "user1";
                const arg2: string = "10";
                const arg3: string = "USD";
                const platform: string = "reddit";
                const result: Command = await ParserUtils.parseSEND(arg1, arg2, arg3, platform);
                expect(result).toContainAllKeys(["command", "transfers"]);
                expect(result.command).toEqual("SEND");
                expect(result.transfers).toBeArrayOfSize(1);
                expect(result.transfers[0]).toContainAllKeys(["user", "command", "arkToshiValue", "check"]);
                expect(result.transfers[0].arkToshiValue).toEqual(arktoshiValue.times(10));
                expect(result.transfers[0].check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
                expect(result.transfers[0].check.currency).toEqual("USD");
                expect(result.transfers[0].check.amount).toEqual(amount);
            });
        });
    });

    describe("parseSTICKERS()", () => {
        describe("should correctly parse a STICKERS command", () => {
            it("without valid arguments", async () => {
                const platform: string = "reddit";
                const arg1: string = "";
                const result: Command = await ParserUtils.parseSTICKERS(arg1, platform);
                expect(result).toContainAllKeys(["command"]);
                expect(result.command).toEqual("STICKERS");
            });

            it("with valid arguments", async () => {
                const platform: string = "reddit";
                const arg1: string = "user1";
                const result: Command = await ParserUtils.parseSTICKERS(arg1, platform);
                expect(result).toContainAllKeys(["command", "user"]);
                expect(result.command).toEqual("STICKERS");
            });
        });
    });

    describe("parseWITHDRAW()", () => {
        describe("should correctly parse a WITHDRAW command", () => {
            it("without valid arguments", async () => {
                const arg1: string = "";
                const arg2: string = "";
                const arg3: string = "";
                const token: string = "ARK";
                const result: Command = await ParserUtils.parseWITHDRAW(arg1, arg2, arg3, token);
                expect(result).toContainAllKeys(["command"]);
                expect(result.command).toEqual("WITHDRAW");
            });

            it("with 1 valid argument", async () => {
                const arg1: string = "AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V";
                const arg2: string = "";
                const arg3: string = "";
                const token: string = "ARK";
                const result: Command = await ParserUtils.parseWITHDRAW(arg1, arg2, arg3, token);
                expect(result).toContainAllKeys(["command", "transfers"]);
                expect(result.command).toEqual("WITHDRAW");
                expect(result.transfers).toBeArrayOfSize(1);
                expect(result.transfers[0]).toContainAllKeys(["address", "command", "arkToshiValue", "check"]);
                expect(result.transfers[0].arkToshiValue).toBeNull();
            });

            it("with 2 valid arguments", async () => {
                const arg1: string = "AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V";
                const arg2: string = "10";
                const arg3: string = "";
                const token: string = "ARK";
                const result: Command = await ParserUtils.parseWITHDRAW(arg1, arg2, arg3, token);
                expect(result).toContainAllKeys(["command", "transfers"]);
                expect(result.command).toEqual("WITHDRAW");
                expect(result.transfers).toBeArrayOfSize(1);
                expect(result.transfers[0]).toContainAllKeys(["address", "command", "arkToshiValue", "check"]);
                expect(result.transfers[0].arkToshiValue).toEqual(arktoshiValue.times(10));
            });

            it("with 3 valid arguments", async () => {
                const arg1: string = "AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V";
                const arg2: string = "10";
                const arg3: string = "USD";
                const token: string = "ARK";
                const result: Command = await ParserUtils.parseWITHDRAW(arg1, arg2, arg3, token);
                expect(result).toContainAllKeys(["command", "transfers"]);
                expect(result.command).toEqual("WITHDRAW");
                expect(result.transfers).toBeArrayOfSize(1);
                expect(result.transfers[0]).toContainAllKeys(["address", "command", "arkToshiValue", "check"]);
                expect(result.transfers[0].arkToshiValue).toEqual(arktoshiValue.times(10));
            });
        });
    });

    describe("parseMentionCommand()", () => {
        const platform: string = "reddit";
        const smallFooter = "~";
        const mentionedUser = "arktippr";
        describe("should correctly parse a STICKERS mention", () => {
            const command: string = "STICKERS";
            it("for STICKERS without small footer argument", async () => {
                const bodyParts: string[] = [command, mentionedUser];
                const mentionBody: string = "STICKERS u/arktippr";
                const mentionIndex: number = bodyParts.indexOf(mentionedUser);
                const result: Command = await ParserUtils.parseMentionCommand(
                    command,
                    bodyParts,
                    mentionBody,
                    mentionIndex,
                    platform,
                );
                expect(result).toContainAllKeys(["command", "smallFooter"]);
                expect(result.command).toEqual(command);
                expect(result.smallFooter).toBeFalse();
            });

            it("for STICKERS with small footer argument", async () => {
                const bodyParts: string[] = [command, mentionedUser, smallFooter];
                const mentionBody: string = "STICKERS u/arktippr ~";
                const mentionIndex: number = bodyParts.indexOf(mentionedUser);
                const result: Command = await ParserUtils.parseMentionCommand(
                    command,
                    bodyParts,
                    mentionBody,
                    mentionIndex,
                    platform,
                );
                expect(result).toContainAllKeys(["command", "smallFooter"]);
                expect(result.command).toEqual(command);
                expect(result.smallFooter).toBeTrue();
            });
        });

        describe("should correctly parse a REWARD mention", () => {
            const command: string = "REWARD";
            it("for REWARD without small footer argument", async () => {
                const bodyParts: string[] = [
                    command,
                    mentionedUser,
                    "10",
                    "user1",
                    "20USD",
                    "user2",
                    "30",
                    "EUR",
                    "user3",
                    "USD",
                    "4",
                    "baduser1",
                ];
                const mentionBody: string = "REWARD u/arktippr 10 user1 20USD user2 30 EUR user3 USD 4 baduser1";
                const mentionIndex: number = bodyParts.indexOf(mentionedUser);
                const result: Command = await ParserUtils.parseMentionCommand(
                    command,
                    bodyParts,
                    mentionBody,
                    mentionIndex,
                    platform,
                );
                expect(result).toContainAllKeys(["command", "transfers", "smallFooter"]);
                expect(result.command).toEqual(command);
                expect(result.smallFooter).toBeFalse();
                expect(result.transfers).toBeArrayOfSize(3);
                expect(result.transfers[0]).toContainAllKeys(["user", "arkToshiValue", "check", "command"]);
                expect(result.transfers[0].command).toEqual("TIP");
                expect(result.transfers[0].arkToshiValue).toEqual(arktoshiValue.times(10));
            });

            it("for REWARD with small footer argument", async () => {
                const bodyParts: string[] = [
                    command,
                    mentionedUser,
                    smallFooter,
                    "10",
                    "user1",
                    "20USD",
                    "user2",
                    "30",
                    "EUR",
                    "user3",
                    "USD",
                    "4",
                    "baduser1",
                ];
                const mentionBody: string = "REWARD u/arktippr ~ 10 user1 20USD user2 30 EUR user3 USD 4 baduser1";
                const mentionIndex: number = bodyParts.indexOf(mentionedUser);
                const result: Command = await ParserUtils.parseMentionCommand(
                    command,
                    bodyParts,
                    mentionBody,
                    mentionIndex,
                    platform,
                );
                expect(result).toContainAllKeys(["command", "transfers", "smallFooter"]);
                expect(result.command).toEqual(command);
                expect(result.smallFooter).toBeTrue();
                expect(result.transfers).toBeArrayOfSize(3);
                expect(result.transfers[0]).toContainAllKeys(["user", "arkToshiValue", "check", "command"]);
                expect(result.transfers[0].command).toEqual("TIP");
                expect(result.transfers[0].arkToshiValue).toEqual(arktoshiValue.times(10));
            });

            it("for a REWARD without valid users", async () => {
                const bodyParts: string[] = [command, mentionedUser, "10", "baduser1"];
                const mentionBody: string = "REWARD u/arktippr ~ 10 baduser1";
                const mentionIndex: number = bodyParts.indexOf(mentionedUser);
                const result: Command = await ParserUtils.parseMentionCommand(
                    command,
                    bodyParts,
                    mentionBody,
                    mentionIndex,
                    platform,
                );
                expect(result).toBeNull();
            });
        });

        describe("should correctly parse a TIP mention", () => {
            it("for a TIP without small footer argument", async () => {
                const bodyParts: string[] = ["10", "USD", mentionedUser];
                const mentionBody: string = "10 USD u/arktippr";
                const mentionIndex: number = bodyParts.indexOf(mentionedUser);
                const result: Command = await ParserUtils.parseMentionCommand(
                    "",
                    bodyParts,
                    mentionBody,
                    mentionIndex,
                    platform,
                );
                expect(result).toContainAllKeys(["command", "check", "smallFooter", "arkToshiValue"]);
                expect(result.command).toEqual("TIP");
                expect(result.smallFooter).toBeFalse();
                expect(result.arkToshiValue).toEqual(arktoshiValue.times(10));
            });

            it("for a TIP with small footer argument", async () => {
                const bodyParts: string[] = ["10", "USD", mentionedUser, smallFooter];
                const mentionBody: string = "10 USD u/arktippr ~";
                const mentionIndex: number = bodyParts.indexOf(mentionedUser);
                const result: Command = await ParserUtils.parseMentionCommand(
                    "",
                    bodyParts,
                    mentionBody,
                    mentionIndex,
                    platform,
                );
                expect(result).toContainAllKeys(["command", "check", "smallFooter", "arkToshiValue"]);
                expect(result.command).toEqual("TIP");
                expect(result.smallFooter).toBeTrue();
                expect(result.arkToshiValue).toEqual(arktoshiValue.times(10));
            });
        });

        it("should return null on mentions without commands", async () => {
            const bodyParts: string[] = ["anything", "really", mentionedUser, smallFooter];
            const mentionBody: string = "10 USD u/arktippr ~";
            const mentionIndex: number = bodyParts.indexOf(mentionedUser);
            const result: Command = await ParserUtils.parseMentionCommand(
                "",
                bodyParts,
                mentionBody,
                mentionIndex,
                platform,
            );
            expect(result).toBeNull();
        });
    });

    describe("parseReward()", () => {
        const command = "REWARD";
        const platform: string = "reddit";
        const mentionedUser = "arktippr";
        it("should correctly parse a REWARD mention with mixed multiple entries", async () => {
            const bodyParts: string[] = [command, mentionedUser];
            const mentionBody: string =
                "REWARD u/arktippr 10 user1 20USD user2@twitter 30 EUR baduser3 EUR 4 user4 0 user5";
            const mentionIndex: number = bodyParts.indexOf(mentionedUser);
            const result: Transfer[] = await ParserUtils.parseReward(mentionBody, mentionIndex, platform);
            expect(result).toBeArrayOfSize(3);
            expect(result[0]).toContainAllKeys(["user", "arkToshiValue", "check", "command"]);
            expect(result[0].command).toEqual("TIP");
            expect(result[0].arkToshiValue).toEqual(arktoshiValue.times(10));
            expect(result[0].user).toContainAllKeys(["username", "platform"]);
            expect(result[0].check).toContainAllKeys(["currency", "amount", "arkToshiValue"]);
            expect(result[0].user.username).toEqual("user1");
            expect(result[0].user.platform).toEqual(platform);
            expect(result[0].check.currency).toEqual("ARK");
            expect(result[0].check.amount).toEqual(amount);
            expect(result[0].check.arkToshiValue).toEqual(arktoshiValue.times(10));
            expect(result[1].user.username).toEqual("user2");
            expect(result[1].user.platform).toEqual("twitter");
            expect(result[1].check.currency).toEqual("USD");
            expect(result[1].check.amount).toEqual(new BigNumber(20));
            expect(result[2].user.username).toEqual("user4");
            expect(result[2].user.platform).toEqual(platform);
            expect(result[2].check.currency).toEqual("EUR");
            expect(result[2].check.amount).toEqual(new BigNumber(4));
        });

        it("should return NULL for a REWARD mention without valid entries", async () => {
            const bodyParts: string[] = [command, mentionedUser];
            const mentionBody: string =
                "REWARD u/arktippr 10 baduser1 20USD baduser2@twitter 30 BADCURRENCY user3 EUR 4 baduser4 0 user5";
            const mentionIndex: number = bodyParts.indexOf(mentionedUser);
            const result: Transfer[] = await ParserUtils.parseReward(mentionBody, mentionIndex, platform);
            expect(result).toBeNull();
        });
    });
});
