import BigNumber from "bignumber.js";
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
        });

        it("Should return 1 in the TEST environment", async () => {
            const expectedValue: BigNumber = new BigNumber(1);
            const currency: string = "ARK";
            const fiat: string = "USD";
            const result: BigNumber = await CoinGeckoAPI.getSimplePrice(currency, fiat);
            expect(result).toEqual(expectedValue);
        });
    });
});
