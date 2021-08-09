import { ReceiverHandler } from "../controllers/ReceiverHandler";

const MINS_TO_REDEEM = 5;
const SECONDS_IN_MINUTE = 60;
const MIL_IN_SECONDS = 1000;

export class RedeemTimer {
    private timer: number;
    private intervalObject: NodeJS.Timeout;
    private receiverHandlerReference: ReceiverHandler;
    private redeemRoutine: (receiverListener: ReceiverHandler) => Promise<void>;

    public constructor(receiverHandler: ReceiverHandler, redeemRoutine: (receiverListener: ReceiverHandler) => Promise<void>) {
        this.timer = 0;
        this.receiverHandlerReference = receiverHandler;
        this.redeemRoutine = redeemRoutine;
    }

    public resetTimer = () => {
        this.timer = MINS_TO_REDEEM;
        this.intervalObject = setInterval(() => {
            this.timer -= 1;
            if (this.timer <= 0){
                this.redeemRoutine(this.receiverHandlerReference);
                this.stopTimer();
            }
        }, SECONDS_IN_MINUTE * MIL_IN_SECONDS);
    }

    public stopTimer = () => {
        clearInterval(this.intervalObject);
    }
}