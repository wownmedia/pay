import { config } from "@cryptology.hk/pay-config";
import BigNumber from "bignumber.js";
import "jest-extended";

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

import { AmountCurrency, Currency } from "../src";
import { CurrencyUtils } from "../src/utils";

const arktoshi = Math.pow(10, 8);

describe("pay-currency: Currency()", () => {
    describe("isValidCurrency()", () => {
        it("should return false on a non-valid currency", () => {
            const data = "badCurrency";
            expect(Currency.isValidCurrency(data)).toBeFalse();
        });

        it("should return false on empty input", () => {
            const data = "";
            expect(Currency.isValidCurrency(data)).toBeFalse();
        });

        describe("should return true on a valid currency", () => {
            it("for ARK and Ѧ", () => {
                let data = "ark";
                expect(Currency.isValidCurrency(data)).toBeTrue();
                data = "Ѧ";
                expect(Currency.isValidCurrency(data)).toBeTrue();
            });

            it("for USD and $", () => {
                let data = "usd";
                expect(Currency.isValidCurrency(data)).toBeTrue();
                data = "$";
                expect(Currency.isValidCurrency(data)).toBeTrue();
            });

            it("for EUR and €", () => {
                let data = "eur";
                expect(Currency.isValidCurrency(data)).toBeTrue();
                data = "€";
                expect(Currency.isValidCurrency(data)).toBeTrue();
            });

            it("for BTC", () => {
                const data = "btc";
                expect(Currency.isValidCurrency(data)).toBeTrue();
            });

            it("for BCH", () => {
                const data = "bch";
                expect(Currency.isValidCurrency(data)).toBeTrue();
            });

            it("for GBP", () => {
                const data = "gbp";
                expect(Currency.isValidCurrency(data)).toBeTrue();
            });
        });
    });

    describe("parseAmountCurrency()", () => {
        describe("should correctly parse a valid input", () => {
            it("for USD10", () => {
                const input = "USD10";
                const result: AmountCurrency = Currency.parseAmountCurrency(input);
                expect(result).toContainAllKeys(["currency", "amount"]);
                expect(result.currency).toEqual("USD");
                expect(result.amount).toEqual(new BigNumber(10));
            });

            it("for 10USD", () => {
                const input = "10USD";
                const result: AmountCurrency = Currency.parseAmountCurrency(input);
                expect(result).toContainAllKeys(["currency", "amount"]);
                expect(result.currency).toEqual("USD");
                expect(result.amount).toEqual(new BigNumber(10));
            });

            it("for 10", () => {
                const input = "10";
                const result: AmountCurrency = Currency.parseAmountCurrency(input);
                expect(result).toContainAllKeys(["currency", "amount"]);
                expect(result.currency).toEqual("ARK");
                expect(result.amount).toEqual(new BigNumber(10));
            });
        });

        describe("should correctly parse invalid input reutrn null", () => {
            let badInput: string = "bad";
            let result = Currency.parseAmountCurrency(badInput);
            expect(result).toBeNull();

            badInput = "10BAD";
            result = Currency.parseAmountCurrency(badInput);
            expect(result).toBeNull();

            badInput = "BAD10";
            result = Currency.parseAmountCurrency(badInput);
            expect(result).toBeNull();

            badInput = "USDTEN";
            result = Currency.parseAmountCurrency(badInput);
            expect(result).toBeNull();

            badInput = "TENUSD";
            result = Currency.parseAmountCurrency(badInput);
            expect(result).toBeNull();

            badInput = "USD";
            result = Currency.parseAmountCurrency(badInput);
            expect(result).toBeNull();
        });
    });

    describe("getExchangedValue()", () => {
        describe("should return an Arktoshi value for an amount/currency pair", () => {
            it("for an amount in ARK", async () => {
                const amount: BigNumber = new BigNumber(1);
                const currency: string = "ARK";
                const result: BigNumber = await Currency.getExchangedValue(amount, currency);
                expect(result).toEqual(new BigNumber(arktoshi));
            });

            it("for an amount in USD", async () => {
                const mock = jest.spyOn(CurrencyUtils, "getCurrencyTicker");
                mock.mockImplementation(() => Promise.resolve(new BigNumber(1)));
                const amount: BigNumber = new BigNumber(2);
                const currency: string = "USD";
                const result: BigNumber = await Currency.getExchangedValue(amount, currency);
                expect(result).toEqual(new BigNumber(arktoshi).times(amount));
                mock.mockRestore();
            });

            it("for an amount in BCH", async () => {
                const mock = jest.spyOn(CurrencyUtils, "getCurrencyTicker");
                mock.mockImplementation(() => Promise.resolve(new BigNumber(1)));
                const amount: BigNumber = new BigNumber(3);
                const currency: string = "BCH";
                const result: BigNumber = await Currency.getExchangedValue(amount, currency);
                expect(result).toEqual(new BigNumber(arktoshi).times(amount));
                mock.mockRestore();
            });

            it("for an amount in BTC", async () => {
                const mock = jest.spyOn(CurrencyUtils, "getCurrencyTicker");
                mock.mockImplementation(() => Promise.resolve(new BigNumber(1)));
                const amount: BigNumber = new BigNumber(4);
                const currency: string = "BTC";
                const result: BigNumber = await Currency.getExchangedValue(amount, currency);
                expect(result).toEqual(new BigNumber(arktoshi).times(amount));
                mock.mockRestore();
            });

            it("for an amount in EUR", async () => {
                const mock = jest.spyOn(CurrencyUtils, "getCurrencyTicker");
                mock.mockImplementation(() => Promise.resolve(new BigNumber(1)));
                const amount: BigNumber = new BigNumber(5);
                const currency: string = "EUR";
                const result: BigNumber = await Currency.getExchangedValue(amount, currency);
                expect(result).toEqual(new BigNumber(arktoshi).times(amount));
                mock.mockRestore();
            });
        });

        it("should throw a TypeError for currencies that are not accepted", async () => {
            const amount: BigNumber = new BigNumber(1);
            const currency: string = "BADCURRENCY";
            await expect(Currency.getExchangedValue(amount, currency)).rejects.toThrowError(TypeError);
        });

        it("should throw a TypeError for amounts that are <= 0", async () => {
            const amount: BigNumber = new BigNumber(0);
            const currency: string = "USD";
            await expect(Currency.getExchangedValue(amount, currency)).rejects.toThrowError(TypeError);
        });
    });

    describe("baseCurrencyUnitsToUSD()", () => {
        it("should return the US$ value for an amount in units of the base currency (e.g. Arktoshi)", async () => {
            const mock = jest.spyOn(CurrencyUtils, "getCurrencyTicker");
            mock.mockImplementation(() => Promise.resolve(new BigNumber(1)));
            const units: BigNumber = new BigNumber(arktoshi).times(2);
            const result = await Currency.baseCurrencyUnitsToUSD(units);
            expect(result).toEqual(new BigNumber(2));
            mock.mockRestore();
        });

        it("should return 0 for input that is 0", async () => {
            const units: BigNumber = new BigNumber(arktoshi).times(0);
            const result = await Currency.baseCurrencyUnitsToUSD(units);
            expect(result).toEqual(new BigNumber(0));
        });

        it("should throw a TypeError for amounts in units that are <= 0", async () => {
            const units: BigNumber = new BigNumber(-1);
            await expect(Currency.baseCurrencyUnitsToUSD(units)).rejects.toThrowError(TypeError);
        });
    });

    describe("isNumericalInput()", () => {
        it("should return TRUE for numerical input", () => {
            const input: string = "1";
            const result = Currency.isNumericalInput(input);
            expect(result).toBeTrue();
        });

        it("should return False for non-numerical input", () => {
            const input: string = "One";
            const result = Currency.isNumericalInput(input);
            expect(result).toBeFalse();
        });
    });

    describe("currencySymbolsToName", () => {
        it("should correctly convert $ to USD", () => {
            const symbol: string = "$";
            const result = Currency.currencySymbolsToName(symbol);
            expect(result).toEqual("USD");
        });

        it("should correctly convert € to EUR", () => {
            const symbol: string = "€";
            const result = Currency.currencySymbolsToName(symbol);
            expect(result).toEqual("EUR");
        });

        it("should correctly convert Ѧ to ARK", () => {
            const symbol: string = "Ѧ";
            const result = Currency.currencySymbolsToName(symbol);
            expect(result).toEqual("ARK");
        });

        it("should correctly convert £ to GBP", () => {
            const symbol: string = "£";
            const result = Currency.currencySymbolsToName(symbol);
            expect(result).toEqual("GBP");
        });
    });

    describe("isValidCurrencyInput()", () => {
        it("should correctly accept an ecosystem currency", () => {
            const data: string = "1DARK";
            const result: boolean = Currency.isValidCurrencyInput(data);
            expect(result).toBeTrue();
        });

        it("should correctly accept an accepted fiat currency", () => {
            const data: string = "1USD";
            const result: boolean = Currency.isValidCurrencyInput(data);
            expect(result).toBeTrue();
        });

        it("should reject a bad currency", () => {
            const data: string = "1BAD";
            const result: boolean = Currency.isValidCurrencyInput(data);
            expect(result).toBeFalse();
        });
    });
});
