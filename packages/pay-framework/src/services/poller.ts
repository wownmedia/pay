import { EventEmitter } from "events";

export class Poller extends EventEmitter {
    /**
     * @dev Time-out to wait between polls
     */
    private readonly timeOut: number;

    constructor(timeOut: number) {
        super();
        this.timeOut = timeOut;
    }

    /**
     * @dev Set a next event
     */
    public poll() {
        setTimeout(() => this.emit("poll"), this.timeOut);
    }

    /**
     * @dev Execute the callback on the event
     * @param cb {any} A function to execute when the event is emitted
     */
    public onPoll(cb: any) {
        this.on("poll", cb);
    }
}
