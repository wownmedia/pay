import BigNumber from "bignumber.js";

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
}

export interface TransactionResponse {
    node: Node;
    response: ApiResponse;
}
