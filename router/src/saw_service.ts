// TODO
// * Write cashout store to file on flush and load on startup
// * Write active sessions to file and flush to cashout store on startup
// * More Machine Interpretable Errors: Accumulated Time too low, POP Timeout (with values indicating how to fix)

import {promisify} from "util";

import {Wallet} from "ethers";
import {hexlify, keccak256, recoverAddress, Signature} from "ethers/utils";
import {sendUnaryData, Server, ServerCredentials, ServerUnaryCall} from "grpc";
import {exec} from "shelljs";

import {SawPopService} from "./grpc/saw_pop_grpc_pb";
import {Pop, PopStatus, PopStatusCode, SessionIdRequest, SessionIdResponse} from "./grpc/saw_pop_pb";

import {tracing} from "./tracing";

tracing.LOG_LEVEL = process.env.SAW_LOG_LEVEL ? process.env.SAW_LOG_LEVEL : "INFO";

interface ISession  {
    sessionId: number | undefined;
    macAddr: string;
    accTime: number;
    lastPopTime: number;
    lastValidPopSignature: string | undefined;
    currentTimer: any;
    active: boolean;
}

class SawService {
    // Service Configuration (Hardcoded for now)
    private static SHUTDOWN_KILL_TIMEOUT = 5000; // ms
    private static SESSION_INACTIVITY_THRESHOLD = 15000; // ms
    private static CASHOUT_PERIOD = 3600; // s
    private static CASHOUT_THRESHOLD = 20; // min. num. of POP's for cashout to happen
    private static BLACKLIST_INTERVAL = 600; // s

    // Admission Policy (Hardcoded for now)
    private static MAX_POP_INTERVAL = 10000; // ms
    private static POP_TOLERANCE = 200; // ms
    private static MIN_INITIAL_FUNDS = 10000; // gwei

    private grpcPopService: Server;

    // Map of Ethereum Address to Session
    // TODO: Enforce stuff (mac address format, etc.)?
    private sessions: Map<string, ISession>;
    private cashoutStore: Array<{sessionId: number, accTime: number, signature: string}> = [];

    constructor() {
        this.grpcPopService = new Server();
        this.grpcPopService.addService(SawPopService as any, this);
        this.grpcPopService.bind("0.0.0.0:6666", ServerCredentials.createInsecure());

        this.sessions = new Map<string, ISession>();

        // DEBUG for now
        const testClientEth = "0x9C850041C6F6A7430dF01A6c246f60bDa4313571";
        this.sessions.set(testClientEth, {
            accTime: 0,
            active: false,
            currentTimer: undefined,
            lastPopTime: 0,
            lastValidPopSignature: undefined,
            macAddr: "00:00:00:00:00:00",
            sessionId: undefined,
        });
        this.sessions.get(testClientEth)!.currentTimer = setTimeout(this.removeEmptyClientSession.bind(this),
            SawService.MAX_POP_INTERVAL + SawService.POP_TOLERANCE,
            testClientEth);
    }

    public start() {
        tracing.log("INFO", "Starting SAW POP Service...");
        this.grpcPopService.start();
    }

    public stop() {
        tracing.log("INFO", "Stopping SAW POP Service...");
        this.flushSessions(false);
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
        const signature = call.request.getSignature();
        const response = new SessionIdResponse();
        const responseStatus = new PopStatus();
        tracing.log("DEBUG", `Session ID Request received from: ${ethAddr}`);

        if (!(this.recoverSignerAddress(ethAddr, signature) === ethAddr)) {
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
            session.active = true;
            session.lastPopTime = Date.now();
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
        tracing.log("SILLY", "submitPop called.");

        const now = Date.now();
        const sessionId = call.request.getSessionhash();
        const accTime = call.request.getAccTime();
        const signature = call.request.getSignature();
        const ethAddr = this.recoverSignerAddress(sessionId + accTime, signature);
        tracing.log("DEBUG", `POP received. ETH address: ${ethAddr}`);

        const response = new PopStatus();

        if (!(this.sessions.has(ethAddr) && this.sessions.get(ethAddr)!.sessionId === sessionId)) {
            response.setState(PopStatusCode.POP_INVALID);
            response.setMsg(`No Session for ETH Address: ${ethAddr}.`);
            tracing.log("DEBUG", `No Session for ETH Address: ${ethAddr}`);
            callback(null, response);
            return;
        }

        const session = this.sessions.get(ethAddr)!;

        if (!session.active) {
            response.setState(PopStatusCode.POP_TIMEOUT);
            response.setMsg(`Session is closed. Last received POP was at: ${session.lastPopTime}.
                Maximum Interval between POPs is ${SawService.MAX_POP_INTERVAL / 1000}s`);
            tracing.log("DEBUG", `Session ${session.sessionId} is closed.
                Last received POP was at: ${session.lastPopTime}`);
            callback(null, response);
            return;
        }

        clearTimeout(session.currentTimer);
        const expectedAccTime = session.accTime + now - session.lastPopTime;
        if (accTime < expectedAccTime - SawService.POP_TOLERANCE) {
            // Client is (probably) trying to screw us
            // TODO: BAN Client for some time (punishment)
            response.setState(PopStatusCode.POP_INVALID);
            response.setMsg(`Accumulated Time is too low: ${accTime}.
                Expected: ${expectedAccTime}ms`);
            tracing.log("DEBUG", `Session: ${session.sessionId}: Accumulated Time is too low: ${accTime}.
                Expected: ${expectedAccTime}ms`);

            // Only give accTime if its actually more than what we already have
            const args = accTime > session.accTime ? [ethAddr, {accTime, signature}] : [ethAddr];
            setImmediate(this.processFinishedSession.bind(this), ...args);
            callback(null, response);
            return;
        }

        session.accTime = accTime;
        session.lastPopTime = now;
        session.currentTimer = setTimeout(this.processFinishedSession.bind(this),
            SawService.MAX_POP_INTERVAL + SawService.POP_TOLERANCE,
            ethAddr);

        tracing.log("DEBUG", `Session: ${session.sessionId}: Updated using valid POP from: ${ethAddr}`);
        tracing.log("DEBUG", `Session: ${session.sessionId}: New Accumulated Time: ${session.accTime}`);
        response.setState(PopStatusCode.POP_OK);
        callback(null, response);
    }

    private removeEmptyClientSession(clientEthAddress: string) {
        tracing.log("SILLY", "removeEmptyClientSession called.");
        tracing.log("INFO", `Removing client with ETH address ${clientEthAddress}.
            Reason: Empty Session, No POP Received`);
        const macAddr = this.sessions.get(clientEthAddress)!.macAddr;
        this.sessions.delete(clientEthAddress);
        this.disassociateClient(clientEthAddress, macAddr);
    }

    private processFinishedSession(clientEthAddress: string, extraTimeUpdate?: {accTime: number, signature: string}) {
        tracing.log("SILLY", "processFinishedSession called.");
        const reason = extraTimeUpdate ? "Accumulated Time too low" : "POP Timeout";
        tracing.log("INFO", `Processing session of client with ETH address ${clientEthAddress}. Reason: ${reason}`);
        const session = this.sessions.get(clientEthAddress)!;
        session.active = false;
        if (extraTimeUpdate) {
            session.accTime = extraTimeUpdate.accTime;
            session.lastValidPopSignature = extraTimeUpdate.signature;
        }
        this.disassociateClient(clientEthAddress, session.macAddr);
    }

    private disassociateClient(ethAddr: string, macAddr: string) {
        tracing.log("SILLY", "disassociateClient called.");
        // Don't try to hostapd_cli when debugging in IDE
        if (process.env.SAW_DEBUG && process.env.SAW_DEBUG!.includes("VSC")) {
            tracing.log("INFO", `Deassociated client with ETH address ${ethAddr} and MAC address ${macAddr}`);
            return;
        }

        if (exec(`hostapd_cli deauthenticate ${macAddr}`).code === 0) {
            tracing.log("INFO", `Deassociated client with ETH address ${ethAddr} and MAC address ${macAddr}`);
        } else {
            // tslint:disable-next-line: max-line-length
            tracing.log("ERRPR", `Failed to deassociate client with ETH address ${ethAddr} and MAC address ${macAddr}`);
        }
    }

    private recoverSignerAddress(message: string | number, signature: Signature | string)
            : string {
        tracing.log("SILLY", "recoverSignerAddress called.");
        if (typeof(message) === "number") {
            message = hexlify(message);
        }

        try {
            return recoverAddress(keccak256(message), signature);
        } catch (error) {
            tracing.log("DEBUG", "Signature Verification Failed: Malformed message", error);
            return "";
        }
    }

    private flushSessions(inactiveOnly: boolean) {
        tracing.log("SILLY", "flushSessions called.");
        this.sessions.forEach((session, ethAddr, sessionsMap) => {
            if (!inactiveOnly ||
                (inactiveOnly && !session.active
                    && session.lastPopTime < Date.now() + SawService.SESSION_INACTIVITY_THRESHOLD)) {

                // Check if there is a point in cashing out the session
                if (typeof(session.sessionId) === "number" && session.accTime > 0) {

                    this.cashoutStore.push({
                        accTime: session.accTime,
                        sessionId: session.sessionId as number,
                        signature: session.lastValidPopSignature as string,
                    });
                }

                clearTimeout(session.currentTimer);
                sessionsMap.delete(ethAddr);
            }
        });

        this.saveCashoutStore();
    }

    private saveCashoutStore() {
        tracing.log("SILLY", "saveCashoutStore called.");
        // TODO
    }

    private saveActiveSessions() {
        tracing.log("SILLY", "saveActiveSessions called.");
        // TODO
    }

    private loadState() {
        tracing.log("SILLY", "loadState called.");
        // TODO
    }

    private cashout() {
        tracing.log("SILLY", "cashout called.");
        // TODO
    }
}

// Run
const sawService = new SawService();
process.on("SIGINT", sawService.stop.bind(sawService));
process.on("SIGTERM", sawService.stop.bind(sawService));
sawService.start();

// NOTES
// authServer.addService(auth_services.SawAuthService, {authUser: authUser})
// authServer.bind('127.0.0.1:6667', grpc.ServerCredentials.createInsecure());
// authServer.start();
