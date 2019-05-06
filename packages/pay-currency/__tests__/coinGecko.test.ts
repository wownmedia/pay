import "jest-extended";
import { CoinGeckoAPI } from "../src/coinGecko";

describe("pay-currency: CoinGeckoAPI()", () => {
    describe("price()", () => {
        it("should be a function", () => {
            expect(CoinGeckoAPI.price).toBeFunction();
        });
    });

    describe("getSimplePrice", () => {
        it("Should be a function()", async () => {
            expect(CoinGeckoAPI.getSimplePrice).toBeFunction();
            expect(await CoinGeckoAPI.getSimplePrice("ark", "usd")).toBeFalse();
        });
    });
});
