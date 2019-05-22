import "jest-extended";
import { PlatformReddit } from "../src/platform-reddit";

describe("pay-reddit: PlatformReddit()", () => {
    describe("prepareCommand()", () => {
        it("should be a function", () => {
            expect(PlatformReddit.prepareCommand).toBeFunction();
        });
    });
});
