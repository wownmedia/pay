import "jest-extended";
import { Messages } from "../../src";

describe("pay-messenger: /messages/Messages()", () => {
    describe("getExplorer()", () => {
        it("should return default Ark explorer if a token is not configured", () => {
            expect(Messages.getExplorer("bad")).toEqual("https://explorer.ark.io");
        });
    });
});
