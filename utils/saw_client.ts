import {promisify} from "util";

import {Wallet} from "ethers";
import {InfuraProvider} from "ethers/providers";
import {Arrayish, joinSignature, keccak256, SigningKey} from "ethers/utils";
import {credentials} from "grpc";

import {SawPopClient} from "./grpc/saw_pop_grpc_pb";
import {Pop, PopStatus, PopStatusCode, SessionIdRequest, SessionIdResponse} from "./grpc/saw_pop_pb";

class SawClient {
    private ethWallet: Wallet;
    private popClient: SawPopClient;
    private sessionId!: number;
    private accTime: number = 0;

    constructor(ethWallet: Wallet, sawHost?: string) {
        this.ethWallet = ethWallet;
        this.popClient = new SawPopClient(sawHost ? sawHost : "localhost" + ":6666", credentials.createInsecure());
    }

    public async start() {
        
    }

    public async getSessionId(): Promise<any> {
        if (this.sessionId) { return this.sessionId; }

        const newSessionRequest = new SessionIdRequest();
        const ethAddress = await this.ethWallet.getAddress();
        newSessionRequest.setEthAddress(ethAddress);
        newSessionRequest.setSignature(this.signMessage(ethAddress));

        this.sessionId = (await promisify(this.popClient.newSession)
                            .call(this.popClient, newSessionRequest) as SessionIdResponse)
                                .getSessionhash();
        return this.sessionId;
    }

    public async createPop(): Promise<Pop> {
        if (!this.sessionId) {
            console.error("ERROR: No active session! Request a new session first");
            throw new Error("No active session! Request a new session first");
        }

        const pop = new Pop();
        pop.setSessionhash(this.sessionId);
        pop.setAccTime(this.accTime);
        pop.setSignature(this.signMessage([this.sessionId, this.accTime]));
        return pop;
    }

    // Utility Functions
    private signMessage(msg: Arrayish): string {
        const messageHash = keccak256(msg);
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

// Test
async function simpleTest() {
    let provider = module.exports.provider = new InfuraProvider("ropsten",
                                        "***REMOVED***");
    let testMnemonic = "***REMOVED***";
    let testWallet = Wallet.fromMnemonic(testMnemonic);
    testWallet.connect(provider);

    let sawClient = new SawClient(testWallet);

    let response = await sawClient.getSessionId();
    console.log(response);
}

simpleTest();
