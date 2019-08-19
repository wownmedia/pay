import "jest-extended";

// Mock Config
import { Core } from "@cryptology.hk/pay-framework";
const config = new Core.Config();
const configMock = jest.spyOn(config, "get");
configMock.mockImplementation(() => ({
    port: 66,
    url: "https://test.cryptology.hk/",
    node: "http://127.0.0.1:4004",
}));
import { WebhookListener } from "../src/";

describe("pay-ark-api-server: WebhookListener()", () => {
    describe("start()", () => {
        it("should be a function", () => {
            const webhookListener = new WebhookListener();
            expect(webhookListener.start).toBeFunction();
        });
    });
});
