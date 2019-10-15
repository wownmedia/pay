import BigNumber from "bignumber.js";
import "jest-extended";
import { CoinGeckoAPI } from "../../src/services/currency/coinGecko";

describe("pay-currency: CoinGeckoAPI()", () => {
    describe("price()", () => {
        it("should be a function", () => {
            expect(CoinGeckoAPI.price).toBeFunction();
        });
    });

    describe("getSimplePrice", () => {
        it("Should be a function()", async () => {
            expect(CoinGeckoAPI.getSimplePrice).toBeFunction();
        });

        it("Should return 1 in the TEST environment", async () => {
            const value: BigNumber = await CoinGeckoAPI.getSimplePrice("ARK", "USD");

            expect(value.isGreaterThan(0)).toBeTrue();
        });

        it("should return 0 if the coinGecky API doesn't respond or has bad input", async () => {
            const value: BigNumber = await CoinGeckoAPI.getSimplePrice("FAKE", "ALSOFAKE");
            expect(value.isZero()).toBeTrue();
        });
    });
});
