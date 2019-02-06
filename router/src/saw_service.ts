import {promisify} from "util";

import {Wallet} from "ethers";
import {keccak256, recoverAddress, Signature} from "ethers/utils";
import {sendUnaryData, Server, ServerCredentials, ServerUnaryCall} from "grpc";
import {exec} from "shelljs";

import {SawPopService} from "./grpc/saw_pop_grpc_pb";
import {Pop, PopStatus, PopStatusCode, SessionIdRequest, SessionIdResponse} from "./grpc/saw_pop_pb";

import {tracing} from "./tracing";

tracing.LOG_LEVEL = "SILLY";

interface ISession  {
    sessionId: number | undefined;
    macAddr: string;
    accTime: number;
    lastPop: number;
    currentTimer: any;
}

class SawService {
    // Service Configuration (Hardcoded for now)
    private static SHUTDOWN_KILL_TIMEOUT = 5000; // ms

    // Admission Policy (Hardcoded for now)
    private static MAX_POP_INTERVAL = 10000; // ms
    private static POP_TOLERANCE = 200; // ms
    private static MIN_INITIAL_FUNDS = 10000; // gwei
    private static CASHOUT_PERIOD = 3600; // s
    private static CASHOUT_THRESHOLD = 20; // min. num. of POP's for cashout to happen
    private static BLACKLIST_INTERVAL = 600; // s

    private grpcPopService: Server;

    // Map of Ethereum Address to Session
    // TODO: Enforce stuff (mac address format, etc.)?
    private sessions: Map<string, ISession>;

    constructor() {
        this.grpcPopService = new Server();
        this.grpcPopService.addService(SawPopService as any, this);
        this.grpcPopService.bind("0.0.0.0:6666", ServerCredentials.createInsecure());

        this.sessions = new Map<string, ISession>();

        // DEBUG for now
        const testClientEth = "0x9C850041C6F6A7430dF01A6c246f60bDa4313571";
        this.sessions.set(testClientEth, {
            accTime: 0,
            currentTimer: undefined,
            lastPop: 0,
            macAddr: "00:00:00:00:00:00",
            sessionId: undefined,
        });
        this.sessions.get(testClientEth)!.currentTimer = setTimeout(this.removeEmptyClientSession.bind(this),
            SawService.MAX_POP_INTERVAL + SawService.POP_TOLERANCE,
            testClientEth);
    }

    public start() {
        this.grpcPopService.start();
        tracing.log("INFO", "Starting SAW POP Service...");
    }

    public stop() {
        tracing.log("INFO", "Stopping SAW POP Service...");
        const killPopServiceTimer = setTimeout(() => {
            this.grpcPopService.forceShutdown();
            tracing.log("WARNING", "SAW POP Service was killed.");
        }, SawService.SHUTDOWN_KILL_TIMEOUT);

        this.grpcPopService.tryShutdown(() => {
            tracing.log("INFO", "SAW POP Service stopped.");
            clearTimeout(killPopServiceTimer);
        });

    }

    public newSession(call: ServerUnaryCall<SessionIdRequest>, callback: sendUnaryData<SessionIdResponse>) {
        tracing.log("SILLY", "newSession called.");
        const ethAddr = call.request.getEthAddress();
        const sig = call.request.getSignature();
        const response = new SessionIdResponse();
        const responseStatus = new PopStatus();
        tracing.log("DEBUG", `Session ID Request received from: ${ethAddr}`);

        if (!this.verifyMessage(ethAddr, sig, ethAddr)) {
            responseStatus.setState(PopStatusCode.POP_INVALID);
            responseStatus.setMsg("Invalid Signature on Session ID Request");
            tracing.log("DEBUG", `Invalid Signature on Session ID Request from: ${ethAddr}`);
        } else if (!this.sessions.has(ethAddr)) {
            responseStatus.setState(PopStatusCode.POP_CONNECTION_ERROR);
            responseStatus.setMsg(`No pre-session for ETH Address: ${ethAddr}. Authenticate using RADIUS first.`);
            tracing.log("DEBUG", `No pre-session for Session ID Request from: ${ethAddr}`);
        } else {
            const session = this.sessions.get(ethAddr)!;
            clearTimeout(session.currentTimer);
            const sessionId = Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER - 1));
            session.sessionId = sessionId;
            session.accTime = 0;
            session.lastPop = Date.now();
            session.currentTimer = setTimeout(this.removeEmptyClientSession.bind(this),
                SawService.MAX_POP_INTERVAL + SawService.POP_TOLERANCE,
                ethAddr);
            tracing.log("INFO", `New Session: ${sessionId} from client: ${ethAddr}`);

            response.setSessionhash(sessionId);
            responseStatus.setState(PopStatusCode.POP_OK);
        }

        response.setSuccess(responseStatus);
        callback(null, response);
    }

    public submitPop(call: ServerUnaryCall<Pop>, callback: sendUnaryData<PopStatus> ) {
        tracing.log("DEBUG", "submitPop called.");
    }

    private removeEmptyClientSession(clientEthAddress: string) {
        // tslint:disable-next-line: max-line-length
        tracing.log("INFO", `Removing client with ETH address ${clientEthAddress}. Reason: Empty Session, No POP Received`);
        const macAddr = this.sessions.get(clientEthAddress)!.macAddr;
        this.sessions.delete(clientEthAddress);
        this.disassociateClient(clientEthAddress, macAddr);
    }

    private processFinishedSession(clientEthAddress: string) {
        tracing.log("INFO", `Processing session of client with ETH address ${clientEthAddress}. Reason: POP Timeout`);
    }

    private disassociateClient(ethAddr: string, macAddr: string) {
        tracing.log("INFO", `Deassociated client with ETH address ${ethAddr} and MAC address ${macAddr}`);
        return;
        if (exec(`hostapd_cli deauthenticate ${macAddr}`).code === 0) {
                tracing.log("INFO", `Deassociated client with ETH address ${ethAddr} and MAC address ${macAddr}`);
            } else {
                // tslint:disable-next-line: max-line-length
                tracing.log("ERRPR", `Failed to deassociate client with ETH address ${ethAddr} and MAC address ${macAddr}`);
            }
    }

    private verifyMessage(message: string | ArrayLike<number>, signature: Signature | string, expectedAddress: string)
            : boolean {
        try {
            return recoverAddress(keccak256(message), signature) === expectedAddress;
        } catch (error) {
            tracing.log("DEBUG", "Signature Verification Failed: Malformed message", error);
            return false;
        }
    }
}

// Run
const sawService = new SawService();
process.on("SIGINT", sawService.stop);
process.on("SIGTERM", sawService.stop);
sawService.start();

// NOTES
// authServer.addService(auth_services.SawAuthService, {authUser: authUser})
// authServer.bind('127.0.0.1:6667', grpc.ServerCredentials.createInsecure());
// authServer.start();
