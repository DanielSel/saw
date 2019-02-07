import {exec} from "shelljs";

import {tracing} from "./tracing";

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
    sessionId: number;
    accTime: number;
    signature: string;
}

export class SessionManager {
    // Configuration
    private sessionInactivityThreshold: number;
    private debugMode?: string;

    // Map of Ethereum Address to Session
    // TODO: Enforce stuff (mac address format, etc.)?
    private sessions: Map<string, ISession>;
    private cashoutStore: IFinishedSession[] = [];

    constructor(sessionInactivityThreshold: number, debugMode?: string) {
        tracing.log("SILLY", "SessionManager.constructor called.");
        this.sessionInactivityThreshold = sessionInactivityThreshold;
        this.debugMode = debugMode;

        this.sessions = new Map<string, ISession>();
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

    public removeEmptyClientSession(clientEthAddress: string) {
        tracing.log("SILLY", "SawService.removeEmptyClientSession called.");
        tracing.log("INFO", `Removing client with ETH address ${clientEthAddress}.
            Reason: Empty Session, No POP Received`);
        const macAddr = this.sessions.get(clientEthAddress)!.macAddr;
        this.sessions.delete(clientEthAddress);
        this.disassociateClient(clientEthAddress, macAddr);
    }

    public processFinishedSession(clientEthAddress: string, extraTimeUpdate?: {accTime: number, signature: string}) {
        tracing.log("SILLY", "SawService.processFinishedSession called.");
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

    public flushSessions(inactiveOnly: boolean) {
        tracing.log("SILLY", "SessionManager.flushSessions called.");
        this.sessions.forEach((session, ethAddr, sessionsMap) => {
            if (!inactiveOnly ||
                (inactiveOnly && !session.active
                    && session.lastPopTime < Date.now() + this.sessionInactivityThreshold)) {

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

    private disassociateClient(ethAddr: string, macAddr: string) {
        tracing.log("SILLY", "SawService.disassociateClient called.");
        // Don't try to hostapd_cli when debugging in IDE
        if (this.debugMode && this.debugMode.includes("VSC")) {
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

    private saveCashoutStore() {
        tracing.log("SILLY", "SessionManager.saveCashoutStore called.");
        // TODO
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
