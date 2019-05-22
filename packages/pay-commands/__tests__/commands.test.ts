import "jest-extended";

import { Reply } from "@cryptology.hk/pay-messenger";
import { Command, Commands } from "../src";

describe("pay-commands: Commands()", () => {
    describe("isValidCommand()", () => {
        describe("should return true on a valid command", () => {
            it("HELP", () => {
                const command: string = "HELP";
                const result: boolean = Commands.isValidCommand(command);
                expect(result).toBeTrue();
            });
            it("STICKERS", () => {
                const command: string = "STICKERS";
                const result: boolean = Commands.isValidCommand(command);
                expect(result).toBeTrue();
            });
            it("REWARD", () => {
                const command: string = "REWARD";
                const result: boolean = Commands.isValidCommand(command);
                expect(result).toBeTrue();
            });
            it("TIP", () => {
                const command: string = "TIP";
                const result: boolean = Commands.isValidCommand(command);
                expect(result).toBeTrue();
            });
            it("DEPOSIT", () => {
                const command: string = "DEPOSIT";
                const result: boolean = Commands.isValidCommand(command);
                expect(result).toBeTrue();
            });
            it("ADDRESS", () => {
                const command: string = "ADDRESS";
                const result: boolean = Commands.isValidCommand(command);
                expect(result).toBeTrue();
            });
            it("WITHDRAW", () => {
                const command: string = "WITHDRAW";
                const result: boolean = Commands.isValidCommand(command);
                expect(result).toBeTrue();
            });
            it("SEND", () => {
                const command: string = "SEND";
                const result: boolean = Commands.isValidCommand(command);
                expect(result).toBeTrue();
            });
            it("BALANCE", () => {
                const command: string = "BALANCE";
                const result: boolean = Commands.isValidCommand(command);
                expect(result).toBeTrue();
            });
        });
        it("should return false on a bad command", () => {
            const command: string = "BAD";
            const result: boolean = Commands.isValidCommand(command);
            expect(result).toBeFalse();
        });
    });
    describe("hasArguments()", () => {
        describe("should return true or false on a valid command", () => {
            it("HELP", () => {
                const command: string = "HELP";
                const result: boolean = Commands.hasArguments(command);
                expect(result).toBeFalse();
            });
            it("STICKERS", () => {
                const command: string = "STICKERS";
                const result: boolean = Commands.hasArguments(command);
                expect(result).toBeTrue();
            });
            it("TIP", () => {
                const command: string = "TIP";
                const result: boolean = Commands.hasArguments(command);
                expect(result).toBeFalse();
            });
            it("DEPOSIT", () => {
                const command: string = "DEPOSIT";
                const result: boolean = Commands.hasArguments(command);
                expect(result).toBeTrue();
            });
            it("REWARD", () => {
                const command: string = "REWARD";
                const result: boolean = Commands.hasArguments(command);
                expect(result).toBeTrue();
            });
            it("ADDRESS", () => {
                const command: string = "ADDRESS";
                const result: boolean = Commands.hasArguments(command);
                expect(result).toBeTrue();
            });
            it("WITHDRAW", () => {
                const command: string = "WITHDRAW";
                const result: boolean = Commands.hasArguments(command);
                expect(result).toBeTrue();
            });
            it("SEND", () => {
                const command: string = "SEND";
                const result: boolean = Commands.hasArguments(command);
                expect(result).toBeTrue();
            });
            it("BALANCE", () => {
                const command: string = "BALANCE";
                const result: boolean = Commands.hasArguments(command);
                expect(result).toBeTrue();
            });
        });
        it("should throw on an unknown command", () => {
            const command: string = "BAD";
            expect(() => {
                Commands.hasArguments(command);
            }).toThrow();
        });
    });

    describe("executeCommand()", () => {
        describe("should return Help Reply object on a valid command", () => {
            it("HELP", async () => {
                const command: Command = {
                    command: "HELP",
                };
                const result: Reply = await Commands.executeCommand(command);
                expect(result).toContainAllKeys(["directMessageSender"]);
            });
            it("TIP", async () => {
                const command: Command = {
                    command: "TIP",
                };
                const result: Reply = await Commands.executeCommand(command);
                expect(result).toContainAllKeys(["directMessageSender"]);
            });
            it("SEND", async () => {
                const command: Command = {
                    command: "SEND",
                };
                const result: Reply = await Commands.executeCommand(command);
                expect(result).toContainAllKeys(["directMessageSender"]);
            });
            it("WITHDRAW", async () => {
                const command: Command = {
                    command: "WITHDRAW",
                };
                const result: Reply = await Commands.executeCommand(command);
                expect(result).toContainAllKeys(["directMessageSender"]);
            });
            it("REWARD", async () => {
                const command: Command = {
                    command: "REWARD",
                };
                const result: Reply = await Commands.executeCommand(command);
                expect(result).toContainAllKeys(["directMessageSender"]);
            });
            it("STICKERS", async () => {
                const command: Command = {
                    command: "STICKERS",
                };
                const result: Reply = await Commands.executeCommand(command);
                expect(result).toContainAllKeys(["directMessageSender"]);
            });
        });
        it("should return a summoned comment reply for unknown commands", async () => {
            const command: Command = {
                command: "BAD",
            };
            const result: Reply = await Commands.executeCommand(command);
            expect(result).toContainAllKeys(["replyComment"]);
        });

        it("should return a summoned comment reply badly formatted DEPOSIT commands", async () => {
            const command: Command = {
                command: "DEPOSIT",
            };
            const result: Reply = await Commands.executeCommand(command);
            expect(result).toContainAllKeys(["replyComment", "directMessageSender"]);
        });
        it("should return a summoned comment reply badly formatted BALANCE commands", async () => {
            const command: Command = {
                command: "BALANCE",
            };
            const result: Reply = await Commands.executeCommand(command);
            expect(result).toContainAllKeys(["replyComment", "directMessageSender"]);
        });
    });
});
