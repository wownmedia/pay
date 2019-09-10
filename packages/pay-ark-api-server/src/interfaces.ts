import { BigNumber } from "bignumber.js";

export interface ApiFees {
    registration: BigNumber;
    command: BigNumber;
}

export interface WebhookToken {
    token32: string;
    token64: string;
}

export interface WebhookConfig {
    id: string;
    event: string;
    target: string;
    token: string;
    enabled: boolean;
    conditions?: any;
}

export interface APIRegisterCommand {
    command: string;
    platform: string;
}

export interface APITransferCommand {
    command: string;
    senderId: string;
    receiverId?: string;
    address?: string;
    amount: string;
    token: string;
}

export interface APITransferReply {
    id: string;
    transactionId?: string;
    explorer?: string;
    error?: string;
    registered?: boolean;
}

export interface APIInfoCommand {
    command: string;
    senderId: string;
    token: string;
}

export interface APIBalanceReply {
    id: string;
    balance?: string;
    error?: string;
}

export interface APIDepositReply {
    id: string;
    address?: string;
    error?: string;
}
