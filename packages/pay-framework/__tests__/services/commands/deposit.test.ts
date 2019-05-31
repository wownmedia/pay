import "jest-extended";
import { Command, Deposit, User } from "../../../src";

describe("pay-commands: Deposit()", () => {
    it("getDeposit() should be a function", () => {
        expect(Deposit.getDeposit).toBeFunction();
    });

    describe("getDeposit()", () => {
        it("should return a Deposit Reply", async () => {
            // Mock User.getWalletAddress()
            const getWalletAddressMock = jest.spyOn(User, "getWalletAddress");
            getWalletAddressMock.mockImplementation(() => Promise.resolve("XXX"));
            const command: Command = {
                commandSender: {
                    username: "AAA",
                    platform: "BBB",
                },
                token: "ZZZ",
                command: "DEPOSIT",
            };
            const result = await Deposit.getDeposit(command);
            expect(result).toContainAllKeys(["directMessageSender"]);
            getWalletAddressMock.mockRestore();
        });
        it("should return an Error Reply", async () => {
            // Mock User.getWalletAddress()
            const getWalletAddressMock = jest.spyOn(User, "getWalletAddress");
            getWalletAddressMock.mockImplementation(() => Promise.reject("XXX"));
            const command: Command = {
                commandSender: {
                    username: "AAA",
                    platform: "BBB",
                },
                token: "ZZZ",
                command: "DEPOSIT",
            };
            const result = await Deposit.getDeposit(command);
            expect(result).toContainAllKeys(["directMessageSender", "replyComment"]);
            getWalletAddressMock.mockRestore();
        });
    });
});
