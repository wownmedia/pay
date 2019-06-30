import "jest-extended";

// Mock Config
import { config } from "../../src/core";
const configMock = jest.spyOn(config, "get");
configMock.mockImplementation(() => ({
    reddit: {
        clientId: "A",
        clientSecret: "B",
        username: "arktippr",
        password: "C",
    },
    twitter: {
        consumerKey: "X",
        consumerSecret: "Y",
        accessToken: "W",
        accessTokenSecret: "V",
    },
}));
import { Platform } from "../../src/services";
const platform = new Platform();

describe("pay-framework: Platform()", () => {
    describe("undoTextFormatting()", () => {
        it("should remover all markup elements from a message", () => {
            const message: string = "This `is` a **message**";
            const unformattedMessage: string = "This is a message";
            const result: string = Platform.undoTextFormatting(message);
            expect(result).toEqual(unformattedMessage);
        });
    });

    describe("notifyReceiver()", () => {
        it("should be a funtion", () => {
            expect(platform.notifyReceiver).toBeFunction();
        });
    });

    describe("tweet()", () => {
        it("should be a funtion", () => {
            expect(platform.tweet).toBeFunction();
        });
    });

    describe("sendDirectMessageReddit()", () => {
        it("should be a funtion", () => {
            expect(platform.sendDirectMessageReddit).toBeFunction();
        });
    });

    describe("isValidUser()", () => {
        it("should be a funtion", () => {
            expect(platform.isValidUser).toBeFunction();
        });
    });

    describe("isValidRedditUser()", () => {
        it("should be a funtion", () => {
            expect(platform.isValidRedditUser).toBeFunction();
        });
    });

    describe("getTwitterUserId()", () => {
        it("should be a funtion", () => {
            expect(platform.getTwitterUserId).toBeFunction();
        });
    });
});
