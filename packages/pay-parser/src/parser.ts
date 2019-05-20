import { Command, Commands } from "@cryptology.hk/pay-commands";
import { Username } from "@cryptology.hk/pay-user";
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
     * @param sender
     * @param receiver
     * @param id
     */
    public static async parseMention(
        mentionBody: string,
        arkPayUser: string,
        platform: string,
        sender: Username,
        receiver: Username,
        id: string,
    ): Promise<Command[]> {
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
                sender,
                receiver,
                id,
            );
        } catch (e) {
            return null;
        }
    }

    /**
     * Parse a Direct Messenger for commands
     * @param directMessageBody
     * @param platform
     * @param sender
     */
    public static async parseDirectMessage(
        directMessageBody: string,
        platform: string,
        sender: Username,
    ): Promise<Command[]> {
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
                const command: string = commandBodyParts[item].toUpperCase();
                const index: number = parseInt(item, 10);
                const argumentsBody: string[] = commandBodyParts.slice(index, index + 5);
                const commandToDo: Command = await ParserUtils.checkCommand(command, argumentsBody, platform, sender);
                if (commandToDo !== null) {
                    commandsToExecute.push(commandToDo);
                }
            }
        }
        return commandsToExecute.length ? commandsToExecute : null;
    }
}
