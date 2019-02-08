import { readFileSync } from "fs";
import {promisify} from "util";

import {Contract, ContractTransaction, Wallet} from "ethers";
import { parseEther } from "ethers/utils";

import {credentials} from "grpc";

import {SawAuthClient} from "./grpc/saw_auth_grpc_pb";
import {AuthStatusCode, UserAuthRequest, UserAuthResponse} from "./grpc/saw_auth_pb";
import {SawPopClient} from "./grpc/saw_pop_grpc_pb";
import {Pop, PopStatus, PopStatusCode, SessionIdRequest, SessionIdResponse} from "./grpc/saw_pop_pb";

import {signMessage} from "./utils/crypto";
import {tracing} from "./utils/tracing";

// SAW Configuration (To be externalized...)
const MAX_SESSION_TIME = 79200000; // ms
const MAX_POP_INTERVAL = 10000; // ms
const POP_TIME_SAFETY_MARGIN = 500; // ms

export class SawClient {
    private macAddress: string;
    private ethWallet: Wallet;
    private authClient: SawAuthClient;
    private popClient: SawPopClient;
    private sessionId!: number;
    private prevPopTime!: number;
    private popTimer!: any;
    private accTime: number = 0;

    constructor(ethWallet: Wallet, host?: string, authPort?: string, popPort?: string, localMacAddress?: string) {
        this.ethWallet = ethWallet;

        const sawHost: string = host ? host : "localhost";
        const sawAuthPort: string = authPort ? authPort : "6667";
        const sawPopPort: string = popPort ? popPort : "6666";
        this.macAddress = localMacAddress ? localMacAddress : "00:66:00:66:00:66";
        this.authClient = new SawAuthClient( sawHost + ":" + sawAuthPort, credentials.createInsecure());
        this.popClient = new SawPopClient( sawHost + ":" + sawPopPort, credentials.createInsecure());
    }

    public async ensureDeposit(minBalance: number) {
        tracing.log("DEBUG", `Ensuring minimum balance of: ${minBalance}`);
        const sawContract = this.createSawContractInstance();
        const balance = await sawContract.getOwnBalance();
        tracing.log("DEBUG", `Current Balance: ${balance}`);
        const minBalanceBig = parseEther(minBalance.toString());
        if (minBalanceBig.gt(balance)) {
            const deposit = minBalanceBig.sub(balance);
            tracing.log("DEBUG", `Transferring Deposit: ${deposit}`);
            const tx = await sawContract.deposit({value: deposit}) as ContractTransaction;
            const tr = await tx.wait();
            if (tr.status) {
                const newBalance = await sawContract.getOwnBalance();
                tracing.log("DEBUG", `New Balance: ${newBalance}`);
                return true;
            }   else {
                tracing.log("ERROR", `Failed to transfer deposit.`);
                return false;
            }
        }

        return true;
    }

    public async authenticate(): Promise<boolean> {
        tracing.log("DEBUG", "Preparing to send authentication request...");
        const authRequest = new UserAuthRequest();
        const ethAddress = await this.ethWallet.getAddress();
        tracing.log("DEBUG", `Client Ethereum Address: ${ethAddress}`);
        authRequest.setUser(ethAddress);
        const signature = this.signMessage(ethAddress);
        tracing.log("DEBUG", `Signature: ${signature}`);
        authRequest.setPassword(signature);
        tracing.log("DEBUG", `MAC Address: ${this.macAddress}`);
        authRequest.setMacaddress(this.macAddress);

        tracing.log("DEBUG", "Sending authentication request...");
        try {
            const result = (await promisify(this.authClient.authUser)
                            .call(this.authClient, authRequest) as UserAuthResponse);

            if (result.getState() === AuthStatusCode.AUTH_OK) {
                tracing.log("INFO", `Successfully authenticated.`);
                return true;
            } else {
                tracing.log("ERROR", `Authentication Failed: Reason: ${result.getMsg()}`);
                return false;
            }
        } catch (error) {
            tracing.log("CRITICAL", "Could not authenticate.", error);
            return false;
        }
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
        const signature = this.signMessage(sessionId + accTime, 16);
        tracing.log("DEBUG", `Signature: ${signature}`);
        pop.setSignature(signature);
        return pop;
    }

    private signMessage(message: string | number, size?: number): string {
        tracing.log("SILLY", "SawClient.signMessage called.");

        try {
            return signMessage(this.ethWallet, message, size);
        } catch (error) {
            tracing.log("DEBUG", "Unable to Sign Message: Malformed message or key", error);
            throw error;
        }
    }

    // TODO: Externalize Config and Error Handling
    private createSawContractInstance(): Contract {
        const contractInfo = this.loadContractInfo(
            process.env.SAW_CONTRACT_JSON_PATH!, process.env.SAW_CONTRACT_ADDRESS!);
        return new Contract(contractInfo!.address, contractInfo!.abi, this.ethWallet);
    }

    private loadContractInfo(contractJsonPath: string, contractAddress?: string)
        : {abi: string, address: string} | null {

        tracing.log("SILLY", "SawContract.loadContractInfo called.");
        let contractInfo;
        try {
            contractInfo = JSON.parse(readFileSync(contractJsonPath, "UTF-8"));
        } catch (error) {
            tracing.log("ERROR", "Failed to load Smart Contract Info from JSON File", error);
            return null;
        }

        const abi = contractInfo.abi;
        if (!abi) {
            tracing.log("ERROR", "Contract JSON does not contain ABI");
            tracing.log("DEBUG", "JSON Object", contractInfo);
            return null;
        }

        const address = contractInfo.address ? contractInfo.address : contractAddress;
        if (!address) {
            tracing.log("ERROR", "Contract JSON does not contain address and SAW_CONTRACT_ADDRESS not set");
            tracing.log("DEBUG", "JSON Object", contractInfo);
            return null;
        }

        tracing.log("VERBOSE", "Successfully loaded Smart Contract ABI and ADDRESS");
        return {abi, address};
    }
}
