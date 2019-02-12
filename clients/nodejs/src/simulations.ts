// Simulations to test the functionality of SAW Service

import minimist from "minimist";

import {Wallet} from "ethers";
import {InfuraProvider} from "ethers/providers";

import {SawClient} from "./SawClient";
import {tracing} from "./utils/tracing";

const simulations: any = {};

simulations.happyClient = async (sawClient: SawClient) => {
    tracing.log("INFO", `Starting Simulation "happyClient"...`);
    await sawClient.ensureDeposit(0.1);
    if (await sawClient.authenticate()) {
        await sawClient.popCycle();
    }
};

simulations.realClient = async (sawClient: SawClient) => {
    tracing.log("INFO", `Starting Simulation "Real Client"...`);
    const authParameters = await sawClient.getAuthParameters();
    tracing.log("INFO", `Username: ${authParameters.user}`);
    tracing.log("INFO", `Password: ${authParameters.password}`);
    await sawClient.popCycle();
};

simulations.all = async (sawClient: SawClient) => {
    tracing.log("INFO", `Starting Simulation "all"...`);
    await simulations.happyClient(sawClient);
};

async function runSimulation(arg: any) {
    // Apply default values
    arg.h = arg.h ? arg.h : "localhost";
    arg.l = arg.l ? arg.l : "INFO";
    arg.s = arg.s ? arg.s : "all";

    // Set up Test Clients
    const testClients: SawClient[] = [];
    let i: number = 1;
    while (process.env[`SAW_TEST_WALLET_MNEMONIC_${i}`]) {
        testClients.push(
            new SawClient(
                Wallet.fromMnemonic(process.env[`SAW_TEST_WALLET_MNEMONIC_${i}`]!)
                    .connect(new InfuraProvider("ropsten", process.env.SAW_CONTRACT_INFURA_TOKEN!)),
                arg.h));
        i++;
    }

    tracing.LOG_LEVEL = arg.l;
    await Promise.all(testClients.map(async (sawClient) => simulations[arg.s](sawClient)));
}

// Execute the Simulation on Startup
// Usage: -s simulation name
const argv = minimist(process.argv.slice(2), {alias: {
    h: "host",
    l: "log-level",
    s: "simulation",
}});
runSimulation(argv);
