// Simulations to test the functionality of SAW Service

// NOTES
// Testnet: Ropsten

// Master Wallet Address: 0x08f7a5575a0907b96e897f5b67049b866c27aa8b

// Test Wallets:
// 0x9b35bCfC7716C606b03c82aFC6Ae7b33CDc3f625: 7.5347722569762885
// 0x360F4eCFDa27b629ADda7eEBfF080Ac67e31e554: 8.685009427970796
// 0xA6a5E74422c0e7400543fEA7370ba02F5aad90a8: 7.634879046979034
// 0x97B01c870A2CF19F1e01379423f087F45EA291C0: 9.374573640976287
// 0x02129e066BF819c7dc6435A96d7276b9BD6bb5ce: 10.595016692979033
// 0x9C850041C6F6A7430dF01A6c246f60bDa4313571: 7.675990029973543
// 0x53D18ce93AB6230079641c703be29FD1D2D24574: 8.367396287970797

import {Wallet} from "ethers";
import {InfuraProvider} from "ethers/providers";

import {SawClient} from "./saw_client";
import {tracing} from "./tracing";

tracing.LOG_LEVEL = "SILLY"; // CRITICAL, ERROR, WARNING, INFO, VERBOSE, DEBUG, SILLY

// Test
function simpleTest() {
    const provider = module.exports.provider = new InfuraProvider("ropsten",
                                        "***REMOVED***");
    const testMnemonic = "***REMOVED***";
    const testWallet = Wallet.fromMnemonic(testMnemonic);
    testWallet.connect(provider);

    const sawClient = new SawClient(testWallet);

    // const response = await sawClient.getSessionId();
    sawClient.popCycle();
}

simpleTest();
