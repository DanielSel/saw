import {promisify} from "util";

import {Wallet} from "ethers";
import {Arrayish, joinSignature, keccak256, SigningKey} from "ethers/utils";
import {sendUnaryData, Server, ServerCredentials, ServerUnaryCall} from "grpc";

import {SawPopService} from "./grpc/saw_pop_grpc_pb";
import {Pop, PopStatus, PopStatusCode, SessionIdRequest, SessionIdResponse} from "./grpc/saw_pop_pb";

import {tracing} from "./tracing";

tracing.LOG_LEVEL = "SILLY";

class SawService {
    // Service Configuration (Hardcoded for now)
    private static SHUTDOWN_KILL_TIMEOUT = 5000; // ms

    // Admission Policy (Hardcoded for now)
    private static MAX_POP_INTERVAL = 10000; // ms
    private static MIN_INITIAL_FUNDS = 10000; // gwei
    private static CASHOUT_PERIOD = 3600; // s
    private static CASHOUT_THRESHOLD = 20; // min. num. of POP's for cashout to happen
    private static BLACKLIST_INTERVAL = 600; // s

    private grpcPopService: Server;

    constructor() {
        this.grpcPopService = new Server();
        this.grpcPopService.addService(SawPopService, {newSession: this.newSession, submitPop: this.submitPop});
        this.grpcPopService.bind("0.0.0.0:6666", ServerCredentials.createInsecure());
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
