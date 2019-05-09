import "jest-extended";
import { config } from "../src";

describe("pay-currency: Config()", () => {
    describe("get()", () => {
        it("should be a function", () => {
            const subConfig: string = "pay-config";
            const result = config.get(subConfig);
            expect(result).toContainAllKeys(["test"]);
            expect(result.test).toEqual("cryptology");
        });
    });
});
