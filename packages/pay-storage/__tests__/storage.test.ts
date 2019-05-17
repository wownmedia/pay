import "jest-extended";
import { Storage } from "../src";

describe("pay-storage: Storage()", () => {
    describe("getWallet", () => {
        it("should ", async () => {
            const result = await Storage.getWallet("marcs1970", "reddit", "ark");
            expect(result).toEqual("marc");
        });
    });
});
