import "jest-extended";
import { CoinGeckoAPI } from "../src/coinGecko";

describe("pay-currency: CoinGeckoAPI()", () => {
    describe("price()", () => {
        it("should be a function", () => {
            expect(CoinGeckoAPI.price).toBeFunction();
        });
    });
});
