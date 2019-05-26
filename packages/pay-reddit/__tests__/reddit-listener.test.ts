import "jest-extended";
import { RedditListener } from "../src/";

describe("pay-reddit: RedditListener()", () => {
    describe("listener()", () => {
        it("should be a function", () => {
            expect(RedditListener.listener).toBeFunction();
        });
    });
});
