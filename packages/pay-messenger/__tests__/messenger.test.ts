import "jest-extended";

// Mock Config
import { config } from "@cryptology.hk/pay-config";
const configMock = jest.spyOn(config, "get");
configMock.mockImplementation(() => ({
    ark: {
        networkVersion: 23,
        minValue: 2000000,
        transactionFee: 300,
        nodes: [
            {
                host: "localhost",
                port: 4003,
            },
        ],
        vote: {
            voteFee: 157,
            delegate: "cryptology",
            fillWalletFromSeed: "crash credit enact stock use orient resist blast access process cereal car",
            fillWalletValue: 20000,
            fillVendorField: "Welcome to ARK Pay",
        },
        explorer: "https://explorer.ark.io",
    },

    dark: {
        networkVersion: 30,
        minValue: 2000000,
        transactionFee: 300,
        nodes: [
            {
                host: "localhost",
                port: 4033,
            },
        ],
        vote: false,
        explorer: "https://dexplorer.ark.io",
    },
}));

import { Username } from "@cryptology.hk/pay-user";
import BigNumber from "bignumber.js";
import { Messenger, Reply } from "../src";

describe("pay-messenger: Messenger()", () => {
    describe("helpMessage()", () => {
        it("should generate a message to send to the sender of a HELP command", () => {
            const command: string = "HELP";
            const result: Reply = Messenger.helpMessage(command);
            expect(result).toContainAllKeys(["directMessageSender"]);
            expect(result.directMessageSender).toBeString();
        });

        it("should generate a message to send to the sender of a TIP command", () => {
            const command: string = "TIP";
            const result: Reply = Messenger.helpMessage(command);
            expect(result).toContainAllKeys(["directMessageSender"]);
            expect(result.directMessageSender).toBeString();
        });

        it("should generate a message to send to the sender of a WITHDRAW command", () => {
            const command: string = "WITHDRAW";
            const result: Reply = Messenger.helpMessage(command);
            expect(result).toContainAllKeys(["directMessageSender"]);
            expect(result.directMessageSender).toBeString();
        });

        it("should generate a message to send to the sender of a SEND command", () => {
            const command: string = "SEND";
            const result: Reply = Messenger.helpMessage(command);
            expect(result).toContainAllKeys(["directMessageSender"]);
            expect(result.directMessageSender).toBeString();
        });

        it("should generate a message to send to the sender of a STICKERS command", () => {
            const command: string = "STICKERS";
            const result: Reply = Messenger.helpMessage(command);
            expect(result).toContainAllKeys(["directMessageSender"]);
            expect(result.directMessageSender).toBeString();
        });
    });

    describe("errorMessage()", () => {
        it("should generate a message to send to the sender, and to reply to a comment, of an errored command", () => {
            const result: Reply = Messenger.errorMessage();
            expect(result).toContainAllKeys(["directMessageSender", "replyComment"]);
            expect(result.directMessageSender).toBeString();
            expect(result.replyComment).toBeString();
        });
    });

    describe("summonedMessage()", () => {
        it("should generate a message to reply to a comment of an summoned command", () => {
            const result: Reply = Messenger.summonedMessage();
            expect(result).toContainAllKeys(["replyComment"]);
            expect(result.replyComment).toBeString();
        });
    });

    describe("minAmountMessage()", () => {
        it("should generate a message to reply to a comment and a sender of a command", () => {
            const token = "ARK";
            const result: Reply = Messenger.minAmountMessage(token);
            expect(result).toContainAllKeys(["directMessageSender", "replyComment"]);
            expect(result.directMessageSender).toBeString();
            expect(result.replyComment).toBeString();
        });
    });

    describe("senderLowBalance()", () => {
        it("should generate a message to reply to a comment and a sender of a command", () => {
            const balance: BigNumber = new BigNumber(1);
            const amount: BigNumber = new BigNumber(2);
            const token = "ARK";
            const address = "abcd";
            const result: Reply = Messenger.senderLowBalance(balance, amount, token, address);
            expect(result).toContainAllKeys(["directMessageSender", "replyComment"]);
            expect(result.directMessageSender).toBeString();
            expect(result.replyComment).toBeString();
        });
    });

    describe("depositMessage()", () => {
        it("should generate a message to reply to a sender of a command", () => {
            const platform: string = "Reddit";
            const token = "ARK";
            const address = "abcd";
            const result: Reply = Messenger.depositMessage(address, token, platform);
            expect(result).toContainAllKeys(["directMessageSender"]);
            expect(result.directMessageSender).toBeString();
        });
    });
    describe("transferMessage()", () => {
        it("should generate a message to reply to a comment, a receiver and a sender of a command", () => {
            const sender: Username = { username: "sender", platform: "reddit" };
            const receiver: Username = { username: "receiver", platform: "reddit" };
            const transactionId: string = "12345";
            const usdValue: BigNumber = new BigNumber(1);
            const amount: BigNumber = new BigNumber(2);
            const token: string = "ARK";
            const address = "abcd";
            const smallFooter: boolean = false;
            const result: Reply = Messenger.transferMessage(
                sender,
                receiver,
                transactionId,
                amount,
                usdValue,
                token,
                address,
                smallFooter,
            );
            expect(result).toContainAllKeys(["directMessageSender", "replyComment", "directMessageReceiver"]);
            expect(result.directMessageSender).toBeString();
            expect(result.replyComment).toBeString();
            expect(result.directMessageReceiver).toBeString();
        });
    });

    describe("transferMessage()", () => {
        it("should generate a message to reply to a comment with a small footer, a receiver and a sender of a command", () => {
            const sender: Username = { username: "sender", platform: "reddit" };
            const receiver: Username = { username: "receiver", platform: "reddit" };
            const transactionId: string = "12345";
            const usdValue: BigNumber = new BigNumber(1);
            const amount: BigNumber = new BigNumber(2);
            const token: string = "ARK";
            const address = "abcd";
            const smallFooter: boolean = true;
            const result: Reply = Messenger.transferMessage(
                sender,
                receiver,
                transactionId,
                amount,
                usdValue,
                token,
                address,
                smallFooter,
            );
            expect(result).toContainAllKeys(["directMessageSender", "replyComment", "directMessageReceiver"]);
            expect(result.directMessageSender).toBeString();
            expect(result.replyComment).toBeString();
            expect(result.directMessageReceiver).toBeString();
        });
    });

    describe("stickersMessage()", () => {
        it("should generate a message to reply to a comment, a receiver and a sender of a command", () => {
            const sender: Username = { username: "sender", platform: "reddit" };
            const receiver: Username = { username: "receiver", platform: "reddit" };
            const transactionId: string = "12345";
            const usdValue: BigNumber = new BigNumber(1);
            const amount: BigNumber = new BigNumber(2);
            const token: string = "ARK";
            const address = "abcd";
            const smallFooter: boolean = false;
            const result: Reply = Messenger.stickersMessage(
                sender,
                receiver,
                transactionId,
                amount,
                usdValue,
                token,
                address,
                smallFooter,
            );
            expect(result).toContainAllKeys([
                "directMessageSender",
                "replyComment",
                "directMessageReceiver",
                "directMessageMerchant",
            ]);
            expect(result.directMessageSender).toBeString();
            expect(result.directMessageMerchant).toBeString();
            expect(result.replyComment).toBeString();
            expect(result.directMessageReceiver).toBeString();
        });
    });
});
