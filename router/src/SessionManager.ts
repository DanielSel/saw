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

    // Map of Ethereum Address to Session
    // TODO: Enforce stuff (mac address format, etc.)?
    private sessions: Map<string, ISession>;
    private cashoutStore: IFinishedSession[] = [];

    constructor(sessionInactivityThreshold: number) {
        tracing.log("SILLY", "SessionManager.constructor called.");
        this.sessionInactivityThreshold = sessionInactivityThreshold;

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
