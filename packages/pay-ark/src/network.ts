import { config } from "@cryptology.hk/pay-config";
import { logger } from "@cryptology.hk/pay-logger";
import axios from "axios";

const arkEcosystemConfig = config.get("arkEcosystem");

export interface Node {
    host: string;
    port: number;
}

export interface Parameters {
    nope?: string;
}

export interface ApiResponse {
    data: APITransaction;
    error?: string;
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

export class Network {
    public static async broadcastTransactions(transactions: any[], token: string): Promise<TransactionResponse[]> {
        const nodes: Node[] = this.__loadNodes(token);
        const results: TransactionResponse[] = [];
        for (const item in nodes) {
            if (nodes[item]) {
                const node = `http://${nodes[item].host}:${nodes[item].port}`;
                logger.info(`Sending ${transactions.length} transactions to ${node}.`);
                try {
                    const response = await axios.post(
                        `${node}/api/v2/transactions`,
                        {
                            transactions,
                        },
                        {
                            headers: { "API-Version": 2 },
                        },
                    );
                    results.push({ node: nodes[item], response: response.data });
                    logger.info(`Posted transaction to ${node}`);
                } catch (e) {
                    logger.error(e.message);
                }
            }
        }
        return results;
    }

    public static async getFromAPI(request: string, token: string, params?: Parameters): Promise<ApiResponse> {
        const nodes: Node[] = this.__loadNodes(token);
        for (const item in nodes) {
            if (nodes[item]) {
                const node = `http://${nodes[item].host}:${nodes[item].port}`;
                try {
                    const response = await axios.get(`${node}${request}`, {
                        params,
                        headers: { "API-Version": 2 },
                    });

                    if (typeof response !== "undefined" && response.hasOwnProperty("data")) {
                        logger.info(`Retrieved data from ${node}`);
                        logger.info(`${node}${request}`);
                        logger.info(JSON.stringify(response.data));
                        return response.data;
                    }
                } catch (e) {
                    logger.error(e.message);
                }
            }
        }
        return null;
    }

    private static __loadNodes(token: string): Node[] {
        token = token.toLowerCase();
        if (typeof arkEcosystemConfig[token] === "undefined" || arkEcosystemConfig[token].nodes === "undefined") {
            throw TypeError(`Could not find ${token.toUpperCase()} in the configuration`);
        }

        const nodes: Node[] = arkEcosystemConfig[token].nodes;
        if (nodes.length === 0) {
            throw TypeError(`Bad nodes for ${token.toUpperCase()} in the configuration`);
        }

        return nodes;
    }
}
