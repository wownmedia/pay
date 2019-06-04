import "jest-extended";
import { config } from "../../src/core";

// Mock Config
const configMock = jest.spyOn(config, "get");
configMock.mockImplementation(() => ({
    dbUser: "XXX",
    dbPassword: "YYY",
    database: "AAA",
    host: "BBB",
    port: 111,
}));

// mock database
import { payDatabase } from "../../src/core";

describe("payDatabase", () => {
    it("should be an object", () => {
        expect(payDatabase).toBeObject();
    });
});
configMock.mockRestore();
