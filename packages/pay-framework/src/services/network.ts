import axios from "axios";
import { Interfaces } from "@arkecosystem/crypto";
import { config, logger } from "../core";
import { ApiResponse, APIResults, Node, Parameters, TransactionResponse } from "../interfaces";

const arkEcosystemConfig: Record<string, any> = config.get("arkEcosystem");

export class Network {
    /**
     * @dev Broadcast a transaction to the configured Nodes of an ArkEcosystem Blockchain
     * @param transactions {any[]}  An array with transactions
     * @param token {string}        The ArkEcosystem token of the blockchain to broadcast on
     * @param nonce
     * @returns {Promise<TransactionResponse[]>} An array with response messages per Node the transactions were broadcasted to.
     */
    public static async broadcastTransactions(
        transactions: any[],
        token: string,
        nonce: number,
    ): Promise<TransactionResponse[]> {
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
                    results.push({ node: nodes[item], response: response.data, nonce });
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
                        headers: { "Content-Type": "application/json" },
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

    public static async getNetworkConfig(token: string): Promise<Interfaces.INetworkConfig> {
        try {
            const config: APIResults = await this.getFromAPI("/api/node/configuration/crypto", token);
            return config.data;
        } catch (e) {
            return null;
        }
    }

    public static async getCurrentHeight(token: string): Promise<number> {
        try {
            const config: APIResults = await this.getFromAPI("/api/blockchain", token);
            return config.data.block.height;
        } catch (e) {
            return null;
        }
    }

    public static async getNonceForWallet(wallet: string, token: string): Promise<number> {
        try {
            const walletInfo: APIResults = await Network.getFromAPI(`/api/wallets/${wallet}`, token);
            const nonce: number =
                walletInfo.hasOwnProperty("data") && walletInfo.data.hasOwnProperty("nonce")
                    ? parseInt(walletInfo.data.nonce, 10)
                    : null;
            logger.info(`Nonce loaded for ${wallet}: ${nonce}`);
            return nonce;
        } catch (e) {
            return 0;
        }
    }

    /**
     * @dev Send a GET request to a node
     * @param node {string} The node to where to GET
     * @param request {string}  The request to GET (e.g. "/api/webhooks/xxx")
     * @param params {Parameters}   Optional parameters
     * @returns {Promise<ApiResponse>}  A response with the requested data
     */
    public static async getFromNode(node: string, request: string, params?: Parameters): Promise<ApiResponse> {
        try {
            const response = await axios.get(`${node}${request}`, {
                params,
                headers: { "Content-Type": "application/json" },
            });
            if (typeof response !== "undefined" && response.hasOwnProperty("data")) {
                logger.info(`Retrieved webhook data from ${node}`);
                return response.data;
            }
        } catch (e) {
            logger.error(e.message);
        }

        return null;
    }

    /**
     * @dev Send a POST to a node
     * @param node {string} The node to where to post to
     * @param endPoint {string}  The endpoint to POST to (e.g. "/api/webhooks/xxx")
     * @param data {any}   Optional data to POST
     * @param params {Parameters}   Optional parameters
     * @returns {Promise<TransactionResponse>}  A response from the node
     */
    public static async postToNode(
        node: string,
        endPoint: string,
        data?: any,
        params?: Parameters,
    ): Promise<ApiResponse> {
        try {
            const response = await axios.post(`${node}${endPoint}`, data, {
                params,
                headers: { "Content-Type": "application/json" },
            });
            if (typeof response !== "undefined" && response.hasOwnProperty("data")) {
                return response.data;
            }
        } catch (e) {
            logger.error(e.message);
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
