import "jest-extended";

import { Poller } from "../../src/services";
const poller: Poller = new Poller(1);

describe("pay-poller", () => {
    describe("Poller: poll", () => {
        it("should be a function", () => {
            expect(poller.poll).toBeFunction();
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
            poller.poll();
            await setTimeout(() => {
                expect(pollMock).toHaveBeenCalled();
            }, 2);
        });
    });
});
