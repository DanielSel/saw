import {promisify} from "util";

import {Wallet} from "ethers";
import {hexlify, joinSignature, keccak256, SigningKey} from "ethers/utils";
import {credentials} from "grpc";

import {SawPopClient} from "./grpc/saw_pop_grpc_pb";
import {Pop, PopStatus, PopStatusCode, SessionIdRequest, SessionIdResponse} from "./grpc/saw_pop_pb";

import {tracing} from "./tracing";

// SAW Configuration (To be externalized...)
const MAX_POP_INTERVAL = 10000; // ms
const POP_TIME_SAFETY_MARGIN = 500; // ms

export class SawClient {
    private ethWallet: Wallet;
    private popClient: SawPopClient;
    private sessionId!: number;
    private prevPopTime!: number;
    private popTimer!: any;
    private accTime: number = 0;

    constructor(ethWallet: Wallet, sawHost?: string) {
        this.ethWallet = ethWallet;
        this.popClient = new SawPopClient(sawHost ? sawHost : "localhost" + ":6666", credentials.createInsecure());
    }

    public async getSessionId(): Promise<number> {
        if (this.sessionId) { return this.sessionId; }

        tracing.log("DEBUG", "Preparing to request new Session ID...");
        const newSessionRequest = new SessionIdRequest();
        const ethAddress = await this.ethWallet.getAddress();
        tracing.log("DEBUG", `Client Ethereum Address: ${ethAddress}`);
        newSessionRequest.setEthAddress(ethAddress);
        const signature = this.signMessage(ethAddress);
        tracing.log("DEBUG", `Signature: ${signature}`);
        newSessionRequest.setSignature(signature);

        tracing.log("DEBUG", "Sending Session ID Request...");
        try {
            this.sessionId = (await promisify(this.popClient.newSession)
                            .call(this.popClient, newSessionRequest) as SessionIdResponse)
                                .getSessionhash();
            tracing.log("INFO", `Successfully received new Session ID: ${this.sessionId}`);
            return this.sessionId;
        } catch (error) {
            tracing.log("CRITICAL", "Could not retrieve new Session ID", error);
            throw error;
        }
    }

    public async popCycle(popInterval?: number, safetyMargin?: number) {
        clearTimeout(this.popTimer);
        let popStatus;

        try {
            popStatus = await this.sendPop();
        } catch (error) {
            tracing.log("ERROR", "Could not send POP", error);
            return;
        }

        popInterval = popInterval ? popInterval : MAX_POP_INTERVAL;
        safetyMargin = safetyMargin ? safetyMargin : POP_TIME_SAFETY_MARGIN;

        if (PopStatusCode.POP_OK === popStatus.getState()) {
            tracing.log("INFO", `Successfully sent POP at time: ${this.prevPopTime}ms`);
            tracing.log("DEBUG", "Resetting Timer...");
            tracing.log("SILLY", `Next Execution: ${this.prevPopTime + popInterval - safetyMargin}ms`);
            tracing.log("SILLY", `popInterval: ${safetyMargin}ms`);
            tracing.log("SILLY", `safetyMargin: ${popInterval}ms`);
            this.popTimer = setTimeout(this.popCycle.bind(this),
                popInterval - safetyMargin, popInterval, safetyMargin);
            tracing.log("DEBUG", "Timer reset!", this.popTimer);
        } else {
            tracing.log("ERROR", popStatus.getMsg());
            tracing.log("INFO", "Stopping Pop Cycle...");
        }
    }

    public async sendPop(): Promise<PopStatus> {
        tracing.log("DEBUG", "Preparing to send POP...");
        if (!this.prevPopTime) {
            this.prevPopTime = Date.now();
            tracing.log("SILLY", `No Previous POP Time, setting it to current Time: ${this.prevPopTime}`);
        }

        const sessionId = await this.getSessionId();
        tracing.log("DEBUG", `Session ID: ${sessionId}`);

        const popTime = Date.now();
        tracing.log("SILLY", `Previous POP Time: ${this.prevPopTime}ms`);
        tracing.log("SILLY", `Current POP Time: ${popTime}ms`);
        this.accTime += popTime - this.prevPopTime;
        this.prevPopTime = popTime;
        tracing.log("DEBUG", `Accumulated Time: ${this.accTime}ms`);

        const pop = this.createPop(sessionId, this.accTime);
        tracing.log("DEBUG", "Sending POP...");
        return await promisify(this.popClient.submitPop).call(this.popClient, pop) as PopStatus;
    }

    public createPop(sessionId: number, accTime: number): Pop {
        tracing.log("DEBUG", "Creating POP...");
        const pop = new Pop();
        tracing.log("SILLY", `Session ID: ${sessionId}`);
        pop.setSessionhash(sessionId);
        tracing.log("SILLY", `Accumulated Time: ${accTime}`);
        pop.setAccTime(accTime);
        const signature = this.signMessage(sessionId + accTime);
        tracing.log("DEBUG", `Signature: ${signature}`);
        pop.setSignature(signature);
        return pop;
    }

    // Utility Functions
    private signMessage(message: string | number): string {
        if (typeof(message) === "number"){
            message = hexlify(message);
        }

        const messageHash = keccak256(message);
        return joinSignature(this.getSigningKey().signDigest(messageHash));
    }

    private getSigningKey(): SigningKey {
        const key = this.ethWallet.privateKey;
        if (SigningKey.isSigningKey(key)) {
            return key;
        } else {
            return new SigningKey(key);
        }
    }
}
