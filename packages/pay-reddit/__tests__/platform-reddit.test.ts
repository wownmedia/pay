// Mock Config
import { config } from "@cryptology.hk/pay-config";
import "jest-extended";
const configMock = jest.spyOn(config, "get");
configMock.mockImplementation(() => ({
    reddit: {
        admin: "arkpay",
        clientId: "xxx",
        clientSecret: "yyy",
        username: "arktippr",
        password: "zzz",
        usernamePrefix: "u/",
    },
    stickers: {
        token: "ark",
        price: "2",
        payoutTo: "aaa",
        notify: { username: "arkpay", platform: "reddit" },
    },
}));
import { PlatformReddit } from "../src/platform-reddit";
const platformReddit = new PlatformReddit();

describe("pay-reddit: PlatformReddit()", () => {
    describe("redditPolling()", () => {
        it("should be a function", () => {
            expect(platformReddit.redditPolling).toBeFunction();
        });
    });

    describe("isValidUser()", () => {
        it("should be a function", () => {
            expect(platformReddit.isValidUser).toBeFunction();
        });
    });

    describe("sendDirectMessage()", () => {
        it("should be a function", () => {
            expect(platformReddit.sendDirectMessage).toBeFunction();
        });
    });

    describe("postCommentReply()", () => {
        it("should be a function", () => {
            expect(platformReddit.postCommentReply).toBeFunction();
        });
    });
});
