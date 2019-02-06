import {promisify} from "util";

import {Wallet} from "ethers";
import {Arrayish, joinSignature, keccak256, SigningKey} from "ethers/utils";
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
    active: boolean;
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
        this.grpcPopService.addService(SawPopService, {newSession: this.newSession, submitPop: this.submitPop});
        this.grpcPopService.bind("0.0.0.0:6666", ServerCredentials.createInsecure());

        this.sessions = new Map<string, ISession>();

        // DEBUG for now
        const testClientEth = "0x9C850041C6F6A7430dF01A6c246f60bDa4313571";
        this.sessions[testClientEth] = {
            accTime: 0,
            active: true,
            currentTimer: undefined,
            lastPop: 0,
            macAddr: "00:00:00:00:00:00",
            sessionId: undefined,
        };
        this.sessions[testClientEth].currentTimer = setTimeout(this.removeEmptyClientSession,
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
        tracing.log("DEBUG", "newSession called.");
    }

    public submitPop(call: ServerUnaryCall<Pop>, callback: sendUnaryData<PopStatus> ) {
        tracing.log("DEBUG", "submitPop called.");
    }

    private removeEmptyClientSession(clientEthAddress: string) {
        // tslint:disable-next-line: max-line-length
        tracing.log("INFO", `Removing client with ETH address ${clientEthAddress}. Reason: Empty Session, No POP Received`);
        const macAddr = this.sessions[clientEthAddress];
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
