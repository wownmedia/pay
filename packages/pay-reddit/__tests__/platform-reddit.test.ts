import "jest-extended";

// Mock Config
import { config } from "@cryptology.hk/pay-config";
const configMock = jest.spyOn(config, "get");
configMock.mockImplementation(() => ({
    admin: "marcs1970",
    clientId: "pERfdivv_zzc_Q",
    clientSecret: "YADPcgz_YjmoBvQaQOhs1xGrE7Q",
    username: "DarkTippr",
    password: "0318msh7088vu",
}));

import { Command } from "../../pay-commands/src";
import { PlatformReddit, RedditMessage } from "../src/platform-reddit";
const platformReddit = new PlatformReddit();

// Mock Reddit Interface
const inboxSample: RedditMessage[] = [
    {
        author: { name: "user1" },
        name: "t4_gt5w6s",
        id: "gt5w6s",
        body: "HELP",
        was_comment: false,
        parent_id: "t4_gsl4yf",
    },
    {
        author: { name: "user2" },
        name: "t1_eni4olk",
        id: "eni4olk",
        body: "1 USD u/darktippr",
        was_comment: true,
        parent_id: "t1_encrlk3",
    },
];
const inboxMock = jest.spyOn(platformReddit.platformConfig, "getInbox");
inboxMock.mockImplementation(() => Promise.resolve(inboxSample));
const commentMock = jest.spyOn(platformReddit.platformConfig, "getComment");
commentMock.mockImplementation(() =>
    Promise.resolve({
        author: { name: "user5" },
    }),
);
const msgsReadMock = jest.spyOn(platformReddit.platformConfig, "markMessagesAsRead");
msgsReadMock.mockImplementation(() => Promise.resolve({}));
const getMessageMock = jest.spyOn(platformReddit.platformConfig, "getMessage");
getMessageMock.mockImplementation(() => Promise.resolve({}));

describe("pay-reddit: PlatformReddit()", () => {
    describe("getUnreadMessages()", () => {
        it("should get unread Direct Messages and Mentions for the Reddit user", async () => {
            const inbox: RedditMessage[] = await platformReddit.getUnreadMessages();
            expect(inbox).toBeArrayOfSize(2);
        });

        it("should get return an empty array in case of an error", async () => {
            const errorMock = jest.spyOn(platformReddit.platformConfig, "getInbox");
            errorMock.mockImplementation(() => Promise.reject(TypeError("Bad")));
            const inbox: RedditMessage[] = await platformReddit.getUnreadMessages();
            expect(inbox).toBeArrayOfSize(0);
            errorMock.mockClear();
        });
    });

    describe("processInboxItem()", () => {
        it("Should correctly process a Mention with a TIP", async () => {
            const parentAuthorMock = jest.spyOn(platformReddit, "getParentAuthor");
            parentAuthorMock.mockImplementation(() => Promise.resolve({ name: "user5" }));
            const mentionTIP: RedditMessage = {
                author: { name: "user2" },
                name: "t1_eni4olk",
                id: "eni4olk",
                body: "1 USD u/darktippr",
                was_comment: true,
                parent_id: "t1_encrlk3",
            };
            const result: Command[] = await platformReddit.processInboxItem(mentionTIP);
            expect(result).toBeArrayOfSize(1);
            expect(result[0]).toContainAllKeys(["command", "transfers", "sender", "receiver"]);
            expect(result[0].command).toEqual("TIP");
            expect(result[0].sender.username).toEqual("user2");
            expect(result[0].receiver.username).toEqual("user5");
            expect(result[0].transfers).toBeArrayOfSize(1);
            expect(result[0].transfers[0]).toContainAllKeys(["arkToshiValue", "check", "command", "receiver"]);
            expect(result[0].transfers[0].receiver).toBeNull();
            parentAuthorMock.mockClear();
        });

        it("Should correctly process a Mention with a REWARD", async () => {
            const parentAuthorMock = jest.spyOn(platformReddit, "getParentAuthor");
            parentAuthorMock.mockImplementation(() => Promise.resolve({ name: "user5" }));
            const mentionTIP: RedditMessage = {
                author: { name: "user2" },
                name: "t1_eni4olk",
                id: "eni4olk",
                body: "REWARD u/darktippr 10 ARK user1 20ARK user3 ARK5 user5",
                was_comment: true,
                parent_id: "t1_encrlk3",
            };
            const result: Command[] = await platformReddit.processInboxItem(mentionTIP);
            expect(result).toBeArrayOfSize(1);
            expect(result[0]).toContainAllKeys(["command", "transfers", "sender", "receiver"]);
            expect(result[0].command).toEqual("TIP");
            expect(result[0].sender.username).toEqual("user2");
            expect(result[0].receiver.username).toEqual("user5");
            expect(result[0].transfers).toBeArrayOfSize(1);
            expect(result[0].transfers[0]).toContainAllKeys(["arkToshiValue", "check", "command", "receiver"]);
            expect(result[0].transfers[0].receiver).toBeNull();
            parentAuthorMock.mockClear();
        });
    });

    /*
    describe("redditPolling()", () => {});

    describe("notifyAdmin()", () => {});

    describe("isValidUser()", () => {});

    describe("sendDirectMessage()", () => {});

    describe("postCommentReply()", () => {});

     */
});
