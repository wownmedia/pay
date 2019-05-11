import BigNumber from "bignumber.js";
import "jest-extended";

import { AmountCurrency } from "../src";
import { CoinGeckoAPI } from "../src/coinGecko";
import { CurrencyUtils } from "../src/utils";

describe("pay-currency: CurrencyUtils()", () => {
    describe("getCurrencyTicker()", () => {
        it("should return a BigNumber that represent the currency value in the base currency", async () => {
            const mock = jest.spyOn(CoinGeckoAPI, "price");
            mock.mockImplementation(() => Promise.resolve(new BigNumber(1)));
            const currency = "BTC";
            const baseCurrency = "ARK";
            const result: BigNumber = await CurrencyUtils.getCurrencyTicker(currency, baseCurrency);
            expect(result).toEqual(new BigNumber(1));
            mock.mockRestore();
        });

        it("should return 1 if currency === base currency", async () => {
            const baseCurrency = "ARK";
            const result: BigNumber = await CurrencyUtils.getCurrencyTicker(baseCurrency, baseCurrency);
            expect(result).toEqual(new BigNumber(1));
        });
    });

    describe("getCurrencyValue()", () => {
        it("should return 1 if currency is a potential base currency (BTC, BCH, USD, EUR)", async () => {
            let currency = "USD";
            const fiat = "anythingReally";
            let result: BigNumber = await CurrencyUtils.getCurrencyValue(currency, fiat);
            expect(result).toEqual(new BigNumber(1));
            currency = "EUR";
            result = await CurrencyUtils.getCurrencyValue(currency, fiat);
            expect(result).toEqual(new BigNumber(1));
            currency = "BTC";
            result = await CurrencyUtils.getCurrencyValue(currency, fiat);
            expect(result).toEqual(new BigNumber(1));
            currency = "BCH";
            result = await CurrencyUtils.getCurrencyValue(currency, fiat);
            expect(result).toEqual(new BigNumber(1));
        });

        it("should return 1 if base currency is not a valid base currency (BTC, BCH, USD, EUR)", async () => {
            const mock = jest.spyOn(CoinGeckoAPI, "getSimplePrice");
            mock.mockImplementation(() => Promise.resolve(new BigNumber(1)));
            const currency = "ARK";
            const fiat = "anythingReally";
            const result: BigNumber = await CurrencyUtils.getCurrencyValue(currency, fiat);
            expect(result).toEqual(new BigNumber(1));
            mock.mockRestore();
        });

        it("should return 1 if base currency is a valid base currency (BTC, BCH, USD, EUR)", async () => {
            const mock = jest.spyOn(CoinGeckoAPI, "getSimplePrice");
            mock.mockImplementation(() => Promise.resolve(new BigNumber(1)));
            const currency = "ARK";
            let fiat = "USD";
            let result: BigNumber = await CurrencyUtils.getCurrencyValue(currency, fiat);
            expect(result).toEqual(new BigNumber(1));
            fiat = "EUR";
            result = await CurrencyUtils.getCurrencyValue(currency, fiat);
            expect(result).toEqual(new BigNumber(1));
            fiat = "BTC";
            result = await CurrencyUtils.getCurrencyValue(currency, fiat);
            expect(result).toEqual(new BigNumber(1));
            fiat = "BCH";
            result = await CurrencyUtils.getCurrencyValue(currency, fiat);
            expect(result).toEqual(new BigNumber(1));
            mock.mockRestore();
        });
    });

    describe("convertAmountCurrency()", () => {
        it("should return an empty string for empty input", () => {
            const result: string = CurrencyUtils.convertAmountCurrency("");
            expect(result).toEqual("");
        });

        it("should convert . to ,", () => {
            const result: string = CurrencyUtils.convertAmountCurrency("1,1");
            expect(result).toEqual("1.1");
        });

        it("should convert lowercase to uppercase", () => {
            const input: string = "1usd";
            const result: string = CurrencyUtils.convertAmountCurrency(input);
            expect(result).toEqual(input.toUpperCase());
        });
    });

    describe("splitCurrencyAmountPair", () => {
        it("should correctly split a valid pair", () => {
            let data: string = "10USD";
            let result: AmountCurrency = CurrencyUtils.splitCurrencyAmountPair(data);
            expect(result).toContainAllKeys(["currency", "amount"]);
            expect(result.currency).toEqual("USD");
            expect(result.amount).toEqual(new BigNumber(10));
            data = "USD10";
            result = CurrencyUtils.splitCurrencyAmountPair(data);
            expect(result).toContainAllKeys(["currency", "amount"]);
            expect(result.currency).toEqual("USD");
            expect(result.amount).toEqual(new BigNumber(10));
        });

        it("should throw a TypeError on invalid input", () => {
            let badInput = "anythingReally";
            expect(() => {
                CurrencyUtils.splitCurrencyAmountPair(badInput);
            }).toThrowError(TypeError);
            badInput = "USDNOAMOUNT";
            expect(() => {
                CurrencyUtils.splitCurrencyAmountPair(badInput);
            }).toThrowError(TypeError);
        });
    });
});
