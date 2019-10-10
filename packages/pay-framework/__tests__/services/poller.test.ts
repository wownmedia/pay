import "jest-extended";

beforeEach(() => jest.useFakeTimers());

import { Poller } from "../../src/services";
const poller: Poller = new Poller(500);

describe("pay-poller", () => {
    describe("Poller: poll", () => {
        it("should be a function", () => {
            expect(poller.poll).toBeFunction();
        });

        it("should correctly emit a poll event", () => {
            poller.poll();
            expect(setTimeout).toHaveBeenCalledTimes(1);
            expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 500);
        });
    });

    describe("Poller: onPoll", () => {
        it("should be a function", () => {
            expect(poller.onPoll).toBeFunction();
        });

        it("should fire on even poll", async () => {
            const pollMock = jest.fn(() => {
                return true;
            });
            poller.onPoll(pollMock);
            poller.emit("poll");
            expect(pollMock).toHaveBeenCalledTimes(1);
            jest.runOnlyPendingTimers();
            expect(pollMock).toHaveBeenCalledTimes(2);
        });
    });
});
