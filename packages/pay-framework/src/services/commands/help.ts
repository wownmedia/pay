import { Reply } from "../../interfaces";
import { Messenger } from "../messenger";

export class Help {
    /**
     * @dev Retrieve the help message for a command
     * @param command {string} The command to retrieve the help message for
     * @param short {boolean} Return a short version of the message
     * @returns {Reply} Object with the specific help message to reply to a user per direct message
     */
    public static getHelp(command: string, short?: boolean): Reply {
        return Messenger.helpMessage(command);
    }
}
