import "jest-extended";
import { config } from "../../src/core";

beforeEach(() => config.loadFromFile(resolve(__dirname, "./.config/ark-pay/pay-config.json")));
import { resolve } from "path";
import { payDatabase } from "../../src/core";

describe("payDatabase", () => {
    it("should be an object", () => {
        expect(payDatabase).toBeObject();
    });
});
