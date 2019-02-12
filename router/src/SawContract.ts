import {readFileSync} from "fs";

import {Contract, ContractTransaction, Wallet} from "ethers";
import {InfuraProvider} from "ethers/providers";
import {BigNumber, splitSignature} from "ethers/utils";

import {IFinishedSession} from "./SessionManager";
import {tracing} from "./utils/tracing";

export class SawContract {
    public readonly canBalance: boolean;
    public readonly canCashout: boolean;
    private contract: Contract | undefined;

    private activeCasbout: boolean = false;

    constructor(network: string, infuraToken: string,
                contractJsonPath: string, contractAddress?: string,
                walletPrivKey?: string, walletMnemonic?: string) {
        tracing.log("SILLY", "SawContract.constructor called.");

        this.canBalance = false;
        this.canCashout = false;
        const contractInfo = this.loadContractInfo(contractJsonPath, contractAddress);
        if (!contractInfo) {
            return;
        }

        let provider;
        try {
            provider = new InfuraProvider(network, infuraToken);
            this.canBalance = true;
        } catch (error) {
            tracing.log("ERROR", "Unable to connect to Infura Network.", error);
            return;
        }

        let wallet;
        if (walletPrivKey || walletMnemonic) {
            try {
                if (walletPrivKey) {
                    tracing.log("DEBUG", "Creating Wallet from Private Key...");
                    wallet = new Wallet(walletPrivKey, provider);
                } else {
                    tracing.log("DEBUG", "Creating Wallet from Mnemonic...");
                    wallet = Wallet.fromMnemonic(walletMnemonic!).connect(provider);
                }
                tracing.log("VERBOSE", "Ethereum Wallet connected. Cashout Enabled.");
                tracing.log("VERBOSE", "NOTE: Ensure you have sufficient funds for gas fees.");
                this.canCashout = true;
            } catch (error) {
                tracing.log("ERROR", "Unable to instantiate Ethereum Wallet from provided Mnemonic", error);
            }
        } else {
            tracing.log("VERBOSE", "No Ethereum Wallet provided. Disabling cashout service.");
        }

        try {
            this.contract = new Contract(contractInfo.address, contractInfo.abi, wallet ? wallet : provider);
            tracing.log("VERBOSE", "Connected to SAW Smart Contract.");
        } catch (error) {
            this.canCashout = false;
            this.canBalance = false;
        }
    }

    public async getBalance(ethAddr: string): Promise<number> {
        tracing.log("SILLY", "SawContract.getBalance called.");

        if (!this.canBalance) {
            tracing.log("VERBOSE", "Attempted Balance check denied (contract functionality is currently disabled).");
            return 0;
        }
        try {
            const balanceInWei: BigNumber = await this.contract!.getBalance(ethAddr);
            return balanceInWei.div(1000000000).toNumber();
        } catch (error) {
            tracing.log("ERROR", `Failed to retrieve balance of user with ETH address ${ethAddr}.
             Assuming "0 ETH"`,
            error);
            return 0;
        }
    }

    public async cashoutPops(getFinishedSessions: () => Map<number, IFinishedSession>) {
        tracing.log("SILLY", "SawContract.cashoutPops called.");

        // Block overlapping cashouts
        if (this.activeCasbout) {
            tracing.log("WARN", "Attempted to Cashout during an active cashout. Maybe increase CASHOUT_INTERVAL?");
            return;
        }
        this.activeCasbout = true;

        if (!this.canCashout) {
            tracing.log("VERBOSE", "Attempted Cashout denied (cashout functionality is currently disabled).");
            this.activeCasbout = false;
            return;
        }

        tracing.log("VERBOSE", "Beginninng to cashout all currently finished Sessions...");
        const finishedSessions = getFinishedSessions();
        if (finishedSessions.size === 0) {
            tracing.log("VERBOSE", "No finished sessions (nothing to cashout).");
            this.activeCasbout = false;
            return;
        }

        const balanceBefore = await this.contract!.getOwnBalance();
        tracing.log("VERBOSE", `Balance before Cashout: ${balanceBefore}`);

        await this.cashoutPopsSingle(finishedSessions);

        const balanceAfter = await this.contract!.getOwnBalance();
        tracing.log("VERBOSE", `Balance after Cashout: ${balanceAfter}`);
        this.activeCasbout = false;
    }

    private async cashoutPopsSingle(finishedSessions: Map<number, IFinishedSession>) {
        tracing.log("SILLY", "SawContract.cashoutPopsSingle called.");

        let txCount = await (this.contract!.signer as Wallet).getTransactionCount();
        await finishedSessions.forEach(async (pop, sessionId, finishedSessionMap) => {
            try {
                const signature = splitSignature(pop.signature);
                const tx = await this.contract!.payoutSinglePop(sessionId, pop.accTime,
                    signature.v, signature.r, signature.s,
                    {gasLimit: 4600000, nonce: txCount++}) as ContractTransaction;
                const tr = await tx.wait();
                if (tr.status) {
                    finishedSessionMap.delete(sessionId);
                    tracing.log("VERBOSE", `Successfully cashed out POP
                     with Session ID: ${sessionId} and Accumulated Time: ${pop.accTime}`);
                } else {
                    tracing.log("ERROR", `Failed to cashout POP: Smart Contract Execution unsuccessful.
                     (sessionId=${sessionId}, accTime=${pop.accTime}, signature=${pop.signature})`);
                }
        } catch (error) {
                tracing.log("ERROR", `Failed to submit cashout request to Smart Contract for POP
                 (sessionId=${sessionId}, accTime=${pop.accTime}, signature=${pop.signature})`,
                error);
            }
        });

    }

    private async cashoutPopsList(finishedSessions: Map<number, IFinishedSession>) {
        tracing.log("SILLY", "SawContract.cashoutPopsList called.");
        // TODO
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
