import "jest-extended";
import { Help } from "../../src";

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
    });
});
