import "jest-extended";

import { resolve } from "path";
import { config } from "../../src/core";

beforeEach(() => config.loadFromFile(resolve(__dirname, "./.config/ark-pay/pay-config.json")));

describe("pay-currency: Config()", () => {
    describe("get()", () => {
        it("should correctly parse and load the config test file", () => {
            const result: Record<string, string> = config.get("pay-config");

            expect(result).toContainAllKeys(["test"]);
            expect(result.test).toEqual("cryptology");
        });

        it("should return an empty object if the sub-config is not found", () => {
            expect(config.get("invalid-key")).toBeUndefined();
        });
    });
});
