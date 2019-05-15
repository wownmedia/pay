// @ts-ignore
import { Command, Commands } from "@cryptology.hk/pay-commands";
import { ParserUtils } from "./utils";

/**
 * Parse textual input for commands and parameters
 */
export class Parser {
    /**
     * Parse a received mention and return it's command and the value in Arktoshi
     * @param mentionBody
     * @param arkPayUser The user that was mentioned e.g. u/arktippr or @arktippr
     * @param platform The plaform where this was mentioned e.g. reddit or twitter
     */
    public static async parseMention(mentionBody: string, arkPayUser: string, platform: string): Promise<Command[]> {
        // We need something to work with
        if (
            typeof mentionBody === "undefined" ||
            typeof arkPayUser === "undefined" ||
            mentionBody === "" ||
            arkPayUser === ""
        ) {
            return null;
        }

        try {
            // Split up the mention so we can parse it for commands
            const mentionBodyParts: string[] = ParserUtils.splitMessageToParts(mentionBody, false);
            arkPayUser = arkPayUser.toUpperCase();
            const mentionIndex: number = ParserUtils.findMentionedArkPayUser(arkPayUser, mentionBodyParts);
            const command: string = mentionBodyParts[mentionIndex - 1];

            return await ParserUtils.parseMentionCommand(
                command,
                mentionBodyParts,
                mentionBody,
                mentionIndex,
                platform,
            );
        } catch (e) {
            return null;
        }
    }

    /**
     * Parse a Direct Messenger for commands
     * @param directMessageBody
     * @param platform
     */
    public static async parseDirectMessage(directMessageBody: string, platform: string): Promise<Command[]> {
        // We need something to work with
        if (typeof directMessageBody === "undefined" || directMessageBody === "") {
            return null;
        }

        const commandsToExecute = [];
        // Split up the mention so we can parse it for commands
        const commandBodyParts: string[] = ParserUtils.splitMessageToParts(directMessageBody, true);

        // We allow multiple commands per PM.
        // Process Commands
        for (const item in commandBodyParts) {
            if (commandBodyParts[item] && Commands.isValidCommand(commandBodyParts[item])) {
                const command = commandBodyParts[item].toUpperCase();
                const index = parseInt(item, 10);
                const argumentsBody = commandBodyParts.slice(index, index + 4);
                const commandToDo = await ParserUtils.checkCommand(command, argumentsBody, platform);
                if (commandToDo !== null) {
                    commandsToExecute.push(commandToDo);
                }
            }
        }
        return commandsToExecute.length ? commandsToExecute : null;
    }
}
