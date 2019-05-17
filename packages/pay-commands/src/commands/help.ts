import { Messenger } from "@cryptology.hk/pay-messenger";
import { Reply } from "@cryptology.hk/pay-messenger";

export class Help {
    public static getHelp(command: string): Reply {
        return Messenger.helpMessage(command);
    }
}
