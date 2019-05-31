import { Reply } from "../interfaces";
import { Messenger } from "../messenger";

export class Help {
    /**
     * @dev Retrieve the help message for a command
     * @param command {string} The command to retrieve the help message for
     * @returns {Reply} Object with the specific help message to reply to a user per direct message
     */
    public static getHelp(command: string): Reply {
        return Messenger.helpMessage(command);
    }
}
