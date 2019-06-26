import axios from "axios";
import { config } from "../core";
import { logger } from "../core";
import { ApiResponse, Node, Parameters, TransactionResponse } from "../interfaces";

const arkEcosystemConfig = config.get("arkEcosystem");

export class Network {
    /**
     * @dev Broadcast a transaction to the configured Nodes of an ArkEcosystem Blockchain
     * @param transactions {any[]}  An array with transactions
     * @param token {string}        The ArkEcosystem token of the blockchain to broadcast on
     * @returns {Promise<TransactionResponse[]>} An array with response messages per Node the transactions were broadcasted to.
     */
    public static async broadcastTransactions(transactions: any[], token: string): Promise<TransactionResponse[]> {
        const nodes: Node[] = this.loadNodes(token);
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
                            headers: { "Content-Type": "application/json" },
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

    /**
     * @dev Send a GET request to the configured Nodes of a Blockchain, it will try each node until one has replied
     * @param request {string}  The request to GET (e.g. "/api/v2/wallets/xxx")
     * @param token {string}    The token of the ArkEcosystem blockchain to send the request to
     * @param params {Parameters}   Optional parameters
     * @returns {Promise<ApiResponse>}  A response with the requested data
     */
    public static async getFromAPI(request: string, token: string, params?: Parameters): Promise<ApiResponse> {
        const nodes: Node[] = this.loadNodes(token);
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
                        return response.data;
                    }
                } catch (e) {
                    logger.error(e.message);
                }
            }
        }
        return null;
    }

    /**
     * @dev Load the configured Nodes for an ArkEcosystem blockchain from the config file
     * @param token {string}    The token of the ArkEcosystem blockchain to load the configured nodes for
     * @returns {Node[]}        An array of Nodes
     * @private
     */
    private static loadNodes(token: string): Node[] {
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
