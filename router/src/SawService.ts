// TODO
// * Write cashout store to file on flush and load on startup
// * Write active sessions to file and flush to cashout store on startup
// * More Machine Interpretable Errors: Accumulated Time too low, POP Timeout (with values indicating how to fix)
// * Externalize Configurations (Environment Variables?)
// * Externalize Smart Contract Definitions

// Imports
import {hexlify, keccak256, recoverAddress, Signature} from "ethers/utils";
import {sendUnaryData, Server, ServerCredentials, ServerUnaryCall} from "grpc";
import {exec} from "shelljs";

import {SawAuthService} from "./grpc/saw_auth_grpc_pb";
import {AuthStatusCode, UserAuthRequest, UserAuthResponse} from "./grpc/saw_auth_pb";
import {SawPopService} from "./grpc/saw_pop_grpc_pb";
import {Pop, PopStatus, PopStatusCode, SessionIdRequest, SessionIdResponse} from "./grpc/saw_pop_pb";

import {SawContract} from "./SawContract";
import {IFinishedSession, SessionManager} from "./SessionManager";
import {tracing} from "./tracing";

// Global Types and Settings

export class SawService {
    // tslint:disable: max-line-length
    // Service Configuration
    private static DEBUG = process.env.SAW_DEBUG;
    private static LOG_LEVEL = process.env.SAW_LOG_LEVEL ? process.env.SAW_LOG_LEVEL : "INFO";
    private static SHUTDOWN_KILL_TIMEOUT = process.env.SAW_SHUTDOWN_KILL_TIMEOUT ? process.env.SAW_SHUTDOWN_KILL_TIMEOUT as unknown as number : 5000; // ms
    private static SESSION_INACTIVITY_THRESHOLD = process.env.SAW_SESSION_INACTIVITY_THRESHOLD ? process.env.SAW_SESSION_INACTIVITY_THRESHOLD as unknown as number : 15000; // ms
    private static CASHOUT_INTERVAL = process.env.SAW_CASHOUT_INTERVAL ? process.env.SAW_CASHOUT_INTERVAL as unknown as number : 3600; // s
    private static CASHOUT_THRESHOLD = process.env.SAW_CASHOUT_THRESHOLD ? process.env.SAW_CASHOUT_THRESHOLD as unknown as number : 20; // min. num. of POP's for cashout to happen
    private static BLACKLIST_TIME = process.env.SAW_BLACKLIST_TIME ? process.env.SAW_BLACKLIST_TIME as unknown as number : 600; // s
    private static CONTRACT_NETWORK = process.env.SAW_CONTRACT_NETWORK ? process.env.SAW_CONTRACT_NETWORK : (process.env.SAW_DEBUG ? "ropsten" : "mainnet"); // Ethereum Network. Default: ROPSTEN in debug mode, MAINNET in production
    private static CONTRACT_INFURA_TOKEN = process.env.SAW_CONTRACT_INFURA_TOKEN; // Access Token for Infura / No default
    private static CONTRACT_WALLET_MNEMONIC = process.env.SAW_CONTRACT_WALLET_MNEMONIC; // Access Token for Infura / No default
    private static CONTRACT_JSON_PATH = process.env.SAW_CONTRACT_JSON_PATH ? process.env.SAW_CONTRACT_JSON_PATH : "contract.json"; // Path to Contract ABI
    private static CONTRACT_ADDRESS = process.env.SAW_CONTRACT_ADDRESS; // Contract deployment address / No default

    // Admission Policy
    private static ALLOW_OFFLINE_OPERATION = process.env.SAW_ALLOW_OFFLINE_OPERATION; // Run without connection to Smart Contract (NOT RECOMMENDED!). "CASHOUT" = Allow running when unable to cashout, "ALL" = Allow operation without any connection (not even balance check)
    private static MAX_POP_INTERVAL = process.env.SAW_MAX_POP_INTERVAL ? process.env.SAW_MAX_POP_INTERVAL as unknown as number : 10000; // ms
    private static POP_TOLERANCE = process.env.SAW_POP_TOLERANCE ? process.env.SAW_POP_TOLERANCE as unknown as number : 200; // ms
    private static MIN_INITIAL_FUNDS = process.env.SAW_MIN_INITIAL_FUNDS ? process.env.SAW_MIN_INITIAL_FUNDS as unknown as number : 10000; // gwei
    // tslint:enable: max-line-length

    // Smart Contract
    private sawContract: SawContract;

    // Session Manager
    private sessionManager: SessionManager;

    // gRPC Services
    private grpcAuthService: Server;
    private grpcPopService: Server;

    constructor() {
        // SAW Configuration
        tracing.LOG_LEVEL = SawService.LOG_LEVEL;
        tracing.log("SILLY", "SawService.constructor called.");

        // Smart Contract
        this.sawContract = new SawContract(SawService.CONTRACT_NETWORK, SawService.CONTRACT_INFURA_TOKEN!,
            SawService.CONTRACT_JSON_PATH, SawService.CONTRACT_ADDRESS,
            SawService.CONTRACT_WALLET_MNEMONIC);

        if (!this.sawContract.canBalance &&
            SawService.ALLOW_OFFLINE_OPERATION && SawService.ALLOW_OFFLINE_OPERATION === "ALL") {
            // No Connection, but User allows it
            tracing.log("WARNING", "Unable to connect to SAW Smart Contract. Balance Checks and Cashout not possible.");
            tracing.log("WARNING", "ALLOW_OFFLINE_OPERATION is enabled. Continuing without ANY safety guarantees.");
            tracing.log("WARNING", "This is risky and not recommended.");
            tracing.log("WARNING", "You have been warned...");
        } else if (this.sawContract.canBalance && !this.sawContract.canCashout &&
            SawService.ALLOW_OFFLINE_OPERATION === "CASHOUT") {
            // Problem with Wallet, but at least can check balance. User is OK with it
            tracing.log("WARNING", "Unable to access Wallet. Cashout not possible.");
            // tslint:disable-next-line: max-line-length
            tracing.log("WARNING", "ALLOW_OFFLINE_OPERATION is allowed for this case. Continuing without periodical POP cashouts.");
            tracing.log("WARNING", "This is kind of risky.");
            // tslint:disable-next-line: max-line-length
            tracing.log("WARNING", "Do not forget to fix the configuration or cashout manually in the next 24h or you will loose your earnings!");
            tracing.log("WARNING", "You have been warned...");
        } else if (!this.sawContract.canCashout || !this.sawContract.canBalance) {
            // Contract not working properly and user is NOT OK with it
            tracing.log("ERROR", "Unable to configure SAW Smart Contract");
            tracing.log("ERROR", "Aborting Startup");
            process.exit(2);
        } else {
            // All good
            tracing.log("INFO", "Successfully connected to SAW Smart Contract.");
        }

        // Session Manager
        this.sessionManager = new SessionManager(SawService.SESSION_INACTIVITY_THRESHOLD);

        // AUTH Service
        this.grpcAuthService = new Server();
        this.grpcAuthService.addService(SawAuthService as any, this);
        this.grpcAuthService.bind("0.0.0.0:6667", ServerCredentials.createInsecure());

        // POP Service
        this.grpcPopService = new Server();
        this.grpcPopService.addService(SawPopService as any, this);
        this.grpcPopService.bind("0.0.0.0:6666", ServerCredentials.createInsecure());
    }

    public start() {
        tracing.log("SILLY", "SawService.start called.");
        tracing.log("INFO", "Starting SAW Services...");
        tracing.log("INFO", "Starting SAW AUTH Service...");
        this.grpcAuthService.start();
        tracing.log("INFO", "Starting SAW POP Service...");
        this.grpcPopService.start();
    }

    public stop() {
        tracing.log("SILLY", "SawService.stop called.");
        tracing.log("INFO", "Stopping SAW Services...");
        this.sessionManager.flushSessions(false);

        const killAuthServiceTimer = setTimeout(() => {
            this.grpcAuthService.forceShutdown();
            tracing.log("WARNING", "SAW AUTH Service was killed.");
        }, SawService.SHUTDOWN_KILL_TIMEOUT);
        const killPopServiceTimer = setTimeout(() => {
            this.grpcPopService.forceShutdown();
            tracing.log("WARNING", "SAW POP Service was killed.");
        }, SawService.SHUTDOWN_KILL_TIMEOUT);

        this.grpcAuthService.tryShutdown(() => {
            tracing.log("INFO", "SAW AUTH Service stopped.");
            clearTimeout(killAuthServiceTimer);
        });

        this.grpcPopService.tryShutdown(() => {
            tracing.log("INFO", "SAW POP Service stopped.");
            clearTimeout(killPopServiceTimer);
        });
    }

    public async authUser(call: ServerUnaryCall<UserAuthRequest>, callback: sendUnaryData<UserAuthResponse>) {
        tracing.log("SILLY", "SawService.authUser called.");
        const user = call.request.getUser();
        const pw = call.request.getPassword();
        const mac = call.request.getMacaddress();
        // tslint:disable-next-line: max-line-length
        tracing.log("DEBUG", `Received Auth request from User "${user}" with password "${pw}" and MAC address "${mac}"`);
        const response = new UserAuthResponse();

        // Verify Signature
        if (user !== this.recoverSignerAddress(user, pw)) {
            tracing.log("VERBOSE", `Denied Auth request from User "${user}" with  MAC address "${mac}.
             Reason: Invalid Signature."`);
            response.setState(AuthStatusCode.INVALID_SIGNATURE);
            response.setMsg("Invalid Signature! Maybe it's not your account...");
            return;
        }

        // Check Blacklist
        if (false) { // TODO
            response.setState(AuthStatusCode.BLACKLISTED);
            response.setMsg("You my friend know exactly why you are being rejected...");
            callback(null, response);
            return;
        }

        // Check Balance (if we can do balance checks)
        if (this.sawContract.canBalance) {
            const balance = await this.sawContract.getBalance(user);
            tracing.log("DEBUG", `User "${user}" has balance "${balance} gwei"`);
            if (balance < SawService.MIN_INITIAL_FUNDS) {
                tracing.log("VERBOSE", `User "${user}" has insufficient funds.
                 Minimum: "${SawService.MIN_INITIAL_FUNDS} wei"`);
                response.setState(AuthStatusCode.EMPTY_ACCOUNT);
                response.setMsg("If you have no money, how are you gonna pay?");
                callback(null, response);
                return;
            }
        }

        // If you made it here, you are good to go...
        this.sessionManager.addSession(user, {
            accTime: 0,
            active: false,
            currentTimer: undefined,
            lastPopTime: 0,
            lastValidPopSignature: undefined,
            macAddr: mac,
            sessionId: undefined,
        });
        this.sessionManager.getSession(user)!.currentTimer = setTimeout(this.removeEmptyClientSession.bind(this),
            SawService.MAX_POP_INTERVAL + SawService.POP_TOLERANCE,
            user);
        tracing.log("INFO", `Access granted to User "${user}" with MAC address "${mac}"`);
        response.setState(AuthStatusCode.AUTH_OK);
        callback(null, response);
    }

    public newSession(call: ServerUnaryCall<SessionIdRequest>, callback: sendUnaryData<SessionIdResponse>) {
        tracing.log("SILLY", "SawService.newSession called.");
        const ethAddr = call.request.getEthAddress();
        const signature = call.request.getSignature();
        const response = new SessionIdResponse();
        const responseStatus = new PopStatus();
        tracing.log("DEBUG", `Session ID Request received from: ${ethAddr}`);

        if (!(this.recoverSignerAddress(ethAddr, signature) === ethAddr)) {
            responseStatus.setState(PopStatusCode.POP_INVALID);
            responseStatus.setMsg("Invalid Signature on Session ID Request");
            tracing.log("DEBUG", `Invalid Signature on Session ID Request from: ${ethAddr}`);
        } else if (!this.sessionManager.getSession(ethAddr)) {
            responseStatus.setState(PopStatusCode.POP_CONNECTION_ERROR);
            responseStatus.setMsg(`No pre-session for ETH Address: ${ethAddr}. Authenticate using RADIUS first.`);
            tracing.log("DEBUG", `No pre-session for Session ID Request from: ${ethAddr}`);
        } else {
            const session = this.sessionManager.getSession(ethAddr)!;
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
        tracing.log("SILLY", "SawService.submitPop called.");

        const now = Date.now();
        const sessionId = call.request.getSessionhash();
        const accTime = call.request.getAccTime();
        const signature = call.request.getSignature();
        const ethAddr = this.recoverSignerAddress(sessionId + accTime, signature);
        tracing.log("DEBUG", `POP received. ETH address: ${ethAddr}`);

        const response = new PopStatus();

        if (!(this.sessionManager.getSession(ethAddr)
            && this.sessionManager.getSession(ethAddr)!.sessionId === sessionId)) {

            response.setState(PopStatusCode.POP_INVALID);
            response.setMsg(`No Session for ETH Address: ${ethAddr}.`);
            tracing.log("DEBUG", `No Session for ETH Address: ${ethAddr}`);
            callback(null, response);
            return;
        }

        const session = this.sessionManager.getSession(ethAddr)!;

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
        tracing.log("SILLY", "SawService.removeEmptyClientSession called.");
        tracing.log("INFO", `Removing client with ETH address ${clientEthAddress}.
            Reason: Empty Session, No POP Received`);
        const macAddr = this.sessionManager.getSession(clientEthAddress)!.macAddr;
        this.sessionManager.deleteSession(clientEthAddress);
        this.disassociateClient(clientEthAddress, macAddr);
    }

    private processFinishedSession(clientEthAddress: string, extraTimeUpdate?: {accTime: number, signature: string}) {
        tracing.log("SILLY", "SawService.processFinishedSession called.");
        const reason = extraTimeUpdate ? "Accumulated Time too low" : "POP Timeout";
        tracing.log("INFO", `Processing session of client with ETH address ${clientEthAddress}. Reason: ${reason}`);
        const session = this.sessionManager.getSession(clientEthAddress)!;
        session.active = false;
        if (extraTimeUpdate) {
            session.accTime = extraTimeUpdate.accTime;
            session.lastValidPopSignature = extraTimeUpdate.signature;
        }
        this.disassociateClient(clientEthAddress, session.macAddr);
    }

    private disassociateClient(ethAddr: string, macAddr: string) {
        tracing.log("SILLY", "SawService.disassociateClient called.");
        // Don't try to hostapd_cli when debugging in IDE
        if (SawService.DEBUG && SawService.DEBUG.includes("VSC")) {
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
        tracing.log("SILLY", "SawService.recoverSignerAddress called.");
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

    private cashoutPops() {
        tracing.log("SILLY", "SawService.cashoutPops called.");
        // TODO
    }
}

// Run
const sawService = new SawService();
process.on("SIGINT", sawService.stop.bind(sawService));
process.on("SIGTERM", sawService.stop.bind(sawService));
sawService.start();
