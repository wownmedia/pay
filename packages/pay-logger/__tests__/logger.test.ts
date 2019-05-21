import "jest-extended";
import { logger } from "../src";

describe("pay-logger", () => {
    describe("logger()", () => {
        it("should have a info() method", () => {
            expect(logger.info).toBeFunction();
        });
        it("should have a warn() method", () => {
            expect(logger.warn).toBeFunction();
        });
        it("should have an error() method", () => {
            expect(logger.error).toBeFunction();
        });
        it("should have a debug() method", () => {
            expect(logger.debug).toBeFunction();
        });
    });
});
