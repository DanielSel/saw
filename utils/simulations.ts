// Simulations to test the functionality of SAW Service

import {Wallet} from "ethers";
import {InfuraProvider} from "ethers/providers";

import {SawClient} from "./saw_client";
import {tracing} from "./tracing";

tracing.LOG_LEVEL = "SILLY"; // CRITICAL, ERROR, WARNING, INFO, VERBOSE, DEBUG, SILLY

// Test
async function simpleTest() {
    const provider = module.exports.provider = new InfuraProvider("ropsten",
                                        "***REMOVED***");
    const testMnemonic = "***REMOVED***";
    const testWallet = Wallet.fromMnemonic(testMnemonic);
    testWallet.connect(provider);

    const sawClient = new SawClient(testWallet);

    const response = await sawClient.getSessionId();
    console.log(response);
}

simpleTest();
