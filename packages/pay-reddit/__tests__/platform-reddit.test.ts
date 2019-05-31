import "jest-extended";

// Mock Config
import { config } from "@cryptology.hk/pay-framework";
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

        it("should correctly invalidate a username that is a command", async () => {
            const username: string = "help";
            const result = await platformReddit.isValidUser(username);
            expect(result).toBeFalse();
        });

        it("should correctly invalidate a username that is a currency", async () => {
            const username: string = "ark";
            const result = await platformReddit.isValidUser(username);
            expect(result).toBeFalse();
        });

        it("should correctly invalidate a username that is nat a valid username", async () => {
            const userMock = jest.spyOn(platformReddit.platformConfig, "getUser");
            userMock.mockImplementation(() => Promise.reject("Bad User"));
            const username: string = "@";
            const result = await platformReddit.isValidUser(username);
            expect(result).toBeFalse();
            userMock.mockRestore();
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
