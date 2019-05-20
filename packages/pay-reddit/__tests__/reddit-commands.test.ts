import { Command } from "@cryptology.hk/pay-commands/src";
import BigNumber from "bignumber.js";

// SEND arkpay 10 EUR
const sendExampleCommand: string = "SEND arkpay 10 EUR";
const sendExample: Command = {
    command: "SEND",
    transfer: {
        sender: { username: "marcs1970", platform: "reddit" },
        receiver: { username: "arkpay", platform: "reddit" },
        command: "SEND",
        arkToshiValue: new BigNumber("1668042801"),
        check: { currency: "USD", amount: new BigNumber("10"), arkToshiValue: new BigNumber("1668042801") },
    },
    commandSender: { username: "marcs1970", platform: "reddit" },
    commandReplyTo: { username: "arkpay", platform: "reddit" },
};

// SEND
const sendHelpExampleCommand: string = "SEND";
const sendHelpExample: Command = {
    command: "SEND",
    commandSender: { username: "marcs1970", platform: "reddit" },
    commandReplyTo: null,
};

// STICKERS arkpay
const stickersExampleCommand: string = "STICKERS arkpay";
const stickersExample: Command = {
    command: "STICKERS",
    commandReplyTo: { username: "arkpay", platform: "reddit" },
    commandSender: { username: "marcs1970", platform: "reddit" },
};

// STICKERS
const stickersHelpExampleCommand: string = "STICKERS";
const stickersHelpExample: Command = {
    command: "STICKERS",
    commandSender: { username: "marcs1970", platform: "reddit" },
};

// DEPOSIT
const depositExampleCommand: string = "DEPOSIT";
const depositExample: Command = {
    command: "DEPOSIT",
    token: "ARK",
    commandSender: { username: "marcs1970", platform: "reddit" },
};

// DEPOSIT DARK
const depositDarkExampleCommand: string = "DEPOSIT DARK";
const depositDarkExample: Command = {
    command: "DEPOSIT",
    token: "DARK",
    commandSender: { username: "marcs1970", platform: "reddit" },
};

// DEPOSIT BADCURRENCY
const depositBadExampleCommand: string = "DEPOSIT BADCURRENCY";
const depositBadExample: Command = {
    command: "DEPOSIT",
    token: "ARK",
    commandSender: { username: "marcs1970", platform: "reddit" },
};

// HELP
const helpExampleCommand: string = "HELP";
const helpExample: Command = { command: "HELP", commandSender: { username: "marcs1970", platform: "reddit" } };

// TIP
const tipExampleCommand: string = "TIP";
const tipExample: Command = { command: "TIP", commandSender: { username: "marcs1970", platform: "reddit" } };

// WITHDRAW
const withdrawHelpExampleCommand: string = "WITHDRAW";
const withdrawHelpExample: Command = {
    command: "WITHDRAW",
    token: "ARK",
    commandSender: { username: "marcs1970", platform: "reddit" },
};

// WITHDRAW ARK
const withdrawBaseHelpExampleCommand: string = "WITHDRAW ARK";
const withdrawBaseHelpExample: Command = {
    command: "WITHDRAW",
    token: "ARK",
    commandSender: { username: "marcs1970", platform: "reddit" },
};

// WITHDRAW AFqavNP6bvyTiS4WcSFaTWnpMCHHYbiguR
const withdrawAddressExampleCommand: string = "WITHDRAW AFqavNP6bvyTiS4WcSFaTWnpMCHHYbiguR";
const withdrawAddressExample: Command = {
    command: "WITHDRAW",
    transfer: {
        sender: { username: "marcs1970", platform: "reddit" },
        address: "AFqavNP6bvyTiS4WcSFaTWnpMCHHYbiguR",
        command: "WITHDRAW",
        arkToshiValue: null,
        check: null,
    },
    commandSender: { username: "marcs1970", platform: "reddit" },
};

// WITHDRAW ARK AFqavNP6bvyTiS4WcSFaTWnpMCHHYbiguR
const withdrawBaseAddressExampleCommand: string = "WITHDRAW ARK AFqavNP6bvyTiS4WcSFaTWnpMCHHYbiguR";
const withdrawBaseAddressExample: Command = {
    command: "WITHDRAW",
    transfer: {
        sender: { username: "marcs1970", platform: "reddit" },
        address: "AFqavNP6bvyTiS4WcSFaTWnpMCHHYbiguR",
        command: "WITHDRAW",
        arkToshiValue: null,
        check: null,
    },
    commandSender: { username: "marcs1970", platform: "reddit" },
};

// WITHDRAW AFqavNP6bvyTiS4WcSFaTWnpMCHHYbiguR 10 USD
const withdrawAmountExampleCommand: string = "WITHDRAW AFqavNP6bvyTiS4WcSFaTWnpMCHHYbiguR 10 USD";
const withdrawAmountExample: Command = {
    command: "WITHDRAW",
    transfer: {
        sender: { username: "marcs1970", platform: "reddit" },
        address: "AFqavNP6bvyTiS4WcSFaTWnpMCHHYbiguR",
        command: "WITHDRAW",
        arkToshiValue: new BigNumber("1633421102"),
        check: { currency: "USD", amount: new BigNumber("10"), arkToshiValue: new BigNumber("1633421102") },
    },
    commandSender: { username: "marcs1970", platform: "reddit" },
};

// WITHDRAW DARK D858GWCkiARE79vA3ZkGrz6hv4bbZFVJZJ 10 USD
const withdrawBaseAmountExampleCommand: string = "WITHDRAW DARK D858GWCkiARE79vA3ZkGrz6hv4bbZFVJZJ 10 USD";
const withdrawBaseAmountExample: Command = {
    command: "WITHDRAW",
    transfer: {
        sender: { username: "marcs1970", platform: "reddit" },
        address: "D858GWCkiARE79vA3ZkGrz6hv4bbZFVJZJ",
        command: "WITHDRAW",
        arkToshiValue: new BigNumber("1633421102"),
        check: { currency: "USD", amount: new BigNumber("10"), arkToshiValue: new BigNumber("1633421102") },
    },
    commandSender: { username: "marcs1970", platform: "reddit" },
};

// Mention TIP
const mentionTipExapmleCommand: string = "10 u/arktippr";
const mentionTipExample: Command = {
    command: "TIP",
    transfer: {
        sender: { username: "marcs1970", platform: "reddit" },
        receiver: { username: "marcs1970", platform: "reddit" },
        command: "TIP",
        arkToshiValue: new BigNumber("1000000000"),
        check: { currency: "ARK", amount: new BigNumber("10"), arkToshiValue: new BigNumber("1000000000") },
    },
    smallFooter: false,
    commandSender: { username: "marcs1970", platform: "reddit" },
    commandReplyTo: { username: "marcs1970", platform: "reddit" },
};

// Mention STICKERS
const mentionStickersExapmleCommand: string = "STICKERS u/arktippr";
const mentionStickersExample: Command = {
    command: "STICKERS",
    smallFooter: false,
    commandSender: { username: "marcs1970", platform: "reddit" },
    commandReplyTo: { username: "marcs1970", platform: "reddit" },
};

// Mention REWARD
const mentionRewardExampleCommand: string = "REWARD u/arktippr /" + "10 USD arkpay/" + "STICKERS arkpay";
const mentionRewardExample: Command[] = [
    {
        commandReplyTo: { username: "arkpay", platform: "reddit" },
        commandSender: { username: "marcs1970", platform: "reddit" },
        command: "REWARD",
        transfer: {
            sender: { username: "marcs1970", platform: "reddit" },
            receiver: { username: "arkpay", platform: "reddit" },
            command: "TIP",
            arkToshiValue: new BigNumber("1613738726"),
            check: { currency: "USD", amount: new BigNumber("10"), arkToshiValue: new BigNumber("1613738726") },
        },
        smallFooter: false,
    },
    {
        commandReplyTo: { username: "arkpay", platform: "reddit" },
        commandSender: { username: "marcs1970", platform: "reddit" },
        command: "REWARD",
        transfer: {
            sender: { username: "marcs1970", platform: "reddit" },
            receiver: { username: "arkpay", platform: "reddit" },
            command: "STICKERS",
        },
        smallFooter: false,
    },
];
