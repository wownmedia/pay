import "jest-extended";
import { RedditListener } from "../src/";
const redditListener: RedditListener = new RedditListener();

describe("pay-reddit: RedditListener()", () => {
    describe("listener()", () => {
        it("should be a function", () => {
            expect(redditListener.listener).toBeFunction();
        });
    });
});
