import { AmountCurrency } from "@cryptology.hk/pay-currency";
import { Username } from "@cryptology.hk/pay-user";
import BigNumber from "bignumber.js";

/**
 * Command parsed from a parsed mention/command and it's value in Arktoshi
 */
export interface Command {
    command: string;
    commandSender?: Username;
    commandReplyTo?: Username;
    transfer?: Transfer;
    smallFooter?: boolean;
    token?: string;
    id?: string;
}

export interface Transfer {
    sender?: Username;
    receiver?: Username;
    command: string;
    address?: string;
    arkToshiValue?: BigNumber;
    token?: string;
    check?: AmountCurrency;
}

export interface Transaction {
    sender: Username;
    receiver: Username;
    transactionId: string;
    arkToshiValue?: BigNumber;
    currency?: string;
}
