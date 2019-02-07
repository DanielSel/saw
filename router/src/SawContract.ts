import {readFileSync} from "fs";

import {Contract, Wallet} from "ethers";
import {InfuraProvider} from "ethers/providers";
import {splitSignature, BigNumber} from "ethers/utils";

import {tracing} from "./tracing";

export class SawContract {
    public readonly canBalance: boolean;
    public readonly canCashout: boolean;
    private contract: Contract | undefined;

    constructor(network: string, infuraToken: string,
                contractJsonPath: string, contractAddress?: string,
                walletMnemonic?: string) {

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
        if (walletMnemonic) {
            try {
                wallet = Wallet.fromMnemonic(walletMnemonic).connect(provider);
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

    public async cashoutPops(cashoutStore: Array<{sessionId: number, accTime: number, signature: string}>) {
        tracing.log("SILLY", "cashout called.");
        if (!this.canCashout) {
            tracing.log("VERBOSE", "Attempted Cashout denied (cashout functionality is currently disabled).");
            return;
        }

        await this.cashoutPopsSingle(cashoutStore);
    }

    private async cashoutPopsSingle(cashoutStore: Array<{sessionId: number, accTime: number, signature: string}>) {
        let txCount = await (this.contract!.signer as Wallet).getTransactionCount();
        cashoutStore.forEach(async (pop) => {
            try {
                const signature = splitSignature(pop.signature);
                await this.contract!.payoutPops(pop.sessionId, pop.accTime, signature.v, signature.r, signature.s,
                    {nonce: txCount});
            } catch (error) {
                tracing.log("ERROR", `Failed to cashout POP
                 (sessionId=${pop.sessionId}, accTime=${pop.accTime}, signature=${pop.signature})`,
                error);
            }

            txCount++;
        });
    }

    private async cashoutPopsList(cashoutStore: Array<{sessionId: number, accTime: number, signature: string}>) {
        // TODO
    }

    private loadContractInfo(contractJsonPath: string, contractAddress?: string) 
        : {abi: string, address: string} | null {

        tracing.log("SILLY", "SawContract.loadContractInfo.");
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
