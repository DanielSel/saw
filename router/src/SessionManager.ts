import {readdirSync} from "fs";

import {exec} from "shelljs";

import {tracing} from "./utils/tracing";

export interface ISession  {
    sessionId: number | undefined;
    macAddr: string;
    accTime: number;
    lastPopTime: number;
    lastValidPopSignature: string | undefined;
    currentTimer: any;
    active: boolean;
}

export interface IFinishedSession {
    accTime: number;
    signature: string;
    numProcessingAttempts: number;
}

export class SessionManager {
    // Configuration
    private sessionInactivityThreshold: number;
    private cashoutUnprocessableThreshold: number;
    private debugMode?: string;

    // Map of Ethereum Address to Session
    private sessions: Map<string, ISession>;
    private finishedSessions: Map<number, IFinishedSession>;
    private wifiIfaces?: string[];

    constructor(sessionInactivityThreshold: number, cashoutUnprocessableThreshold: number, debugMode?: string) {
        tracing.log("SILLY", "SessionManager.constructor called.");
        this.sessionInactivityThreshold = sessionInactivityThreshold;
        this.cashoutUnprocessableThreshold = cashoutUnprocessableThreshold;
        this.debugMode = debugMode;

        this.sessions = new Map<string, ISession>();
        this.finishedSessions = new Map<number, IFinishedSession>();

        // Don't try to hostapd_cli when debugging in IDE
        if (!this.debugMode || !this.debugMode.includes("VSC")) {
            tracing.log("DEBUG", "Running on real device.");
            this.wifiIfaces = readdirSync("/var/run/hostapd");
            tracing.log("DEBUG", `Found Wifi Interfaces: ${this.wifiIfaces}`);
        }
    }

    public addSession(ethAddress: string, newSession: ISession) {
        tracing.log("SILLY", "SessionManager.addSession called.");
        this.sessions.set(ethAddress, newSession);
    }

    public getSession(ethAddress: string): ISession | undefined {
        tracing.log("SILLY", "SessionManager.getSession called.");
        return this.sessions.get(ethAddress);
    }

    public deleteSession(ethAddress: string): boolean {
        tracing.log("SILLY", "SessionManager.deleteSession called.");
        return this.sessions.delete(ethAddress);
    }

    public getFinishedSessionMap(): Map<number, IFinishedSession> {
        return this.finishedSessions;
    }

    public removeEmptyClientSession(clientEthAddress: string) {
        tracing.log("SILLY", "SawService.removeEmptyClientSession called.");
        tracing.log("INFO", `Removing client with ETH address ${clientEthAddress}.
            Reason: Empty Session, No POP Received`);
        const session = this.sessions.get(clientEthAddress);
        if (!session) {
            tracing.log("WARNING", `Attempted to remove supposedly empty session for client with
             ETH address ${clientEthAddress} but it does not exist.`);
            return;
        }
        const macAddr = session.macAddr;
        this.sessions.delete(clientEthAddress);
        this.disassociateClient(clientEthAddress, macAddr);
    }

    public processFinishedSession(clientEthAddress: string, extraTimeUpdate?: {accTime: number, signature: string}) {
        tracing.log("SILLY", "SawService.processFinishedSession called.");
        const reason = extraTimeUpdate ? "Accumulated Time too low" : "POP Timeout";
        tracing.log("INFO", `Processing session of client with ETH address ${clientEthAddress}. Reason: ${reason}`);
        const session = this.sessions.get(clientEthAddress);
        if (!session) {
            tracing.log("WARNING", `Attempted to process finished session for client with
             ETH address ${clientEthAddress} but it does not exist.`);
            return;
        }
        session.active = false;
        if (extraTimeUpdate) {
            session.accTime = extraTimeUpdate.accTime;
            session.lastValidPopSignature = extraTimeUpdate.signature;
        }
        this.disassociateClient(clientEthAddress, session.macAddr);
    }

    public flushSessions(inactiveOnly: boolean) {
        tracing.log("SILLY", "SessionManager.flushSessions called.");
        this.sessions.forEach((session, ethAddr, sessionsMap) => {
            // Only Cashout "Inactive" Sessions. Preparation for RESUME Session feature.
            if (!inactiveOnly ||
                (inactiveOnly && !session.active
                    && session.lastPopTime < Date.now() + this.sessionInactivityThreshold)) {

                // Check if there is a point in cashing out the session
                if (typeof(session.sessionId) === "number" && session.accTime > 0) {

                    this.finishedSessions.set(session.sessionId, {
                        accTime: session.accTime,
                        numProcessingAttempts: 0,
                        signature: session.lastValidPopSignature as string,
                    });
                }

                clearTimeout(session.currentTimer);
                sessionsMap.delete(ethAddr);
            }
        });

        this.saveCashoutStore();
    }

    private disassociateClient(ethAddr: string, macAddr: string) {
        tracing.log("SILLY", "SawService.disassociateClient called.");
        // Don't try to hostapd_cli when debugging in IDE
        if (!this.wifiIfaces) {
            tracing.log("INFO", `Deassociated client with ETH address ${ethAddr} and MAC address ${macAddr}`);
            return;
        }

        let success: boolean = false;
        this.wifiIfaces.forEach(iface => success = success ||
            exec(`hostapd_cli -i ${iface} deauthenticate ${macAddr}`).code === 0);

        if (success) {
            tracing.log("INFO", `Deassociated client with ETH address ${ethAddr} and MAC address ${macAddr}`);
        } else {
            // tslint:disable-next-line: max-line-length
            tracing.log("ERROR", `Failed to deassociate client with ETH address ${ethAddr} and MAC address ${macAddr}`);
        }
    }

    private saveCashoutStore() {
        tracing.log("SILLY", "SessionManager.saveCashoutStore called.");
        // TODO
        // Note: Write Unprocessable Sessions into separate file
        // Unprocessable: session.numAttemptedCashouts >= cashoutUnprocessableThreshold
    }

    private saveActiveSessions() {
        tracing.log("SILLY", "SessionManager.saveActiveSessions called.");
        // TODO
    }

    private loadState() {
        tracing.log("SILLY", "SessionManager.loadState called.");
        // TODO
    }
}
