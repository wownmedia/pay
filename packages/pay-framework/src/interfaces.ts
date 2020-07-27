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
    nonce?: number;
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

export interface APIResults {
    meta?: any;
    data?: any;
}

export interface Receiver {
    wallet: string;
    amount: BigNumber;
}

/**
 * Parsed amount/currency pair and it's value in Arktoshi
 */
export interface AmountCurrency {
    arkToshiValue?: BigNumber;
    amount: BigNumber;
    currency: string;
}

export interface BaseCurrency {
    ticker: string;
    units: BigNumber;
}

export interface Reply {
    directMessageSender?: string;
    directMessageReceiver?: string;
    directMessageMerchant?: string;
    replyComment?: string;
    data?: string;
    error?: string;
    nonce?: number;
}

export interface Username {
    username: string;
    platform: string;
}

export interface WalletBalance {
    address: string;
    balance: BigNumber;
    success: boolean;
}

export interface ArkEcosystemWallet {
    address: string;
    encryptedSeed: string;
    networkVersion: number;
    token: string;
}

export interface Node {
    host: string;
    port: number;
}

export interface Parameters {
    nope?: string;
    page?: number;
    limit?: number;
}

export interface ApiResponse {
    data?: APITransaction;
    error?: string;
    statusCode?: number;
    message?: string;
}

export interface APITransaction {
    accept?: string[];
    broadcast?: string[];
    excess?: string[];
    invalid?: string[];
    address?: string;
    publicKey?: string;
    username?: string;
    secondPublicKey?: string;
    balance?: number;
    isDelegate?: boolean;
    vote?: string;
    id?: string;
    event?: string;
    target?: string;
    token?: string;
    enabled?: boolean;
    conditions?: any;
}

export interface TransactionResponse {
    node: Node;
    response: ApiResponse;
    nonce: number;
}

export interface Wallet {
    address: string;
    encryptedSeed: string;
    seed?: string;
}

export interface TwitterCfg {
    consumerKey: string;
    consumerSecret: string;
    accessToken: string;
    accessTokenSecret: string;
}

export interface RedditCfg {
    userAgent: string;
    clientId: string;
    clientSecret: string;
    username: string;
    password: string;
    requestDelay: number;
    continueAfterRatelimitError: boolean;
}
