import axios from "axios";
import "jest-extended";

// Mock Config
import { config } from "@cryptology.hk/pay-config";
const configMock = jest.spyOn(config, "get");
configMock.mockImplementation(() => ({
    encryptionKey: "935bff586aeb4244452802e4cf87eaca",
    ark: {
        nodes: [
            {
                host: "localhost",
                port: 4003,
            },
            {
                host: "remote.host",
                port: 4003,
            },
        ],
    },
    verybad: {
        nodes: [],
    },
}));
import { Network } from "../src";

describe("pay-ark: network()", () => {
    describe("broadcastTransactions", () => {
        it("should be a function", () => {
            expect(Network.broadcastTransactions).toBeFunction();
        });

        it("should correctly post to the API", async () => {
            const axiosMock = jest.spyOn(axios, "post");
            axiosMock.mockImplementation(() =>
                Promise.resolve({
                    status: 200,
                    statusText: "200",
                    headers: "",
                    config: {},
                    data: {},
                }),
            );
            const transactions: string[] = ["A", "B"];
            const token: string = "ARK";
            const result = await Network.broadcastTransactions(transactions, token);
            expect(result).toBeArrayOfSize(2);
            expect(result[0]).toContainAllKeys(["node", "response"]);
            axiosMock.mockRestore();
        });

        it("should return an empty array on failing to post to the API", async () => {
            const axiosMock = jest.spyOn(axios, "post");
            axiosMock.mockImplementation(() => Promise.reject("Bad"));
            const transactions: string[] = ["A", "B"];
            const token: string = "ARK";
            const result = await Network.broadcastTransactions(transactions, token);
            expect(result).toBeArrayOfSize(0);
            axiosMock.mockRestore();
        });
    });

    describe("getFromAPI", () => {
        it("should correctly get from the API", async () => {
            const axiosMock = jest.spyOn(axios, "get");
            axiosMock.mockImplementation(() =>
                Promise.resolve({
                    status: 200,
                    statusText: "200",
                    headers: "",
                    config: {},
                    data: {},
                }),
            );
            const request: string = "api/v2/wallets";
            const token: string = "ARK";
            const result = await Network.getFromAPI(request, token);
            expect(result).toEqual({});
            axiosMock.mockRestore();
        });

        it("should throw on getting for a bad token from the API", async () => {
            const axiosMock = jest.spyOn(axios, "get");
            axiosMock.mockImplementation(() =>
                Promise.resolve({
                    status: 200,
                    statusText: "200",
                    headers: "",
                    config: {},
                    data: {},
                }),
            );
            const request: string = "api/v2/wallets";
            const token: string = "BAD";
            await expect(Network.getFromAPI(request, token)).rejects.toThrow();
            axiosMock.mockRestore();
        });

        it("should throw on getting for a bad configured token from the API", async () => {
            const axiosMock = jest.spyOn(axios, "get");
            axiosMock.mockImplementation(() =>
                Promise.resolve({
                    status: 200,
                    statusText: "200",
                    headers: "",
                    config: {},
                    data: {},
                }),
            );
            const request: string = "api/v2/wallets";
            const token: string = "VERYBAD";
            await expect(Network.getFromAPI(request, token)).rejects.toThrow();
            axiosMock.mockRestore();
        });

        it("should return null from the API on errors", async () => {
            const axiosMock = jest.spyOn(axios, "get");
            axiosMock.mockImplementation(() => Promise.reject("Bad"));
            const request: string = "api/v2/wallets";
            const token: string = "ARK";
            const result = await Network.getFromAPI(request, token);
            expect(result).toBeNull();
            axiosMock.mockRestore();
        });
    });
});
