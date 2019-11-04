import "jest-extended";
import { Help } from "../../../src/services/commands";

describe("pay-commands: Help()", () => {
    it("getHelp() should be a function", () => {
        expect(Help.getHelp).toBeFunction();
    });

    describe("getHelp()", () => {
        it("should return a Reply for a valid command", () => {
            const command: string = "HELP";
            const result = Help.getHelp(command);
            expect(result).toContainAllKeys(["directMessageSender"]);
        });

        it("should return a Reply for a valid command with a request for a short version", () => {
            const command: string = "HELP";
            const short: boolean = true;
            const result = Help.getHelp(command, short);
            expect(result).toContainAllKeys(["directMessageSender"]);
        });
    });
});
