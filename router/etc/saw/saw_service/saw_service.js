// Master Wallet Address: 0x08f7a5575a0907b96e897f5b67049b866c27aa8b

// Test Wallets:
// 0x9b35bCfC7716C606b03c82aFC6Ae7b33CDc3f625: 7.5347722569762885
// 0x360F4eCFDa27b629ADda7eEBfF080Ac67e31e554: 8.685009427970796
// 0xA6a5E74422c0e7400543fEA7370ba02F5aad90a8: 7.634879046979034
// 0x97B01c870A2CF19F1e01379423f087F45EA291C0: 9.374573640976287
// 0x02129e066BF819c7dc6435A96d7276b9BD6bb5ce: 10.595016692979033
// 0x9C850041C6F6A7430dF01A6c246f60bDa4313571: 7.675990029973543
// 0x53D18ce93AB6230079641c703be29FD1D2D24574: 8.367396287970797

// Admission Policy (Hardcoded for now)
let MAX_POP_INTERVAL = 10; //s
let MIN_INITIAL_FUNDS = 10000; //gwei
let CASHOUT_PERIOD = 3600; //s
let CASHOUT_THRESHOLD = 20; // min. num. of POP's for cashout to happen
let BLACKLIST_INTERVAL = 600; //s

// Global Storage
let lastCashout = 0;
let sessions = [];
let timer;

// Set Up Access to Ethereum Smart Contract
const ethers = require('ethers');
const saw_contract_json = require('../../../../smart_contracts/build/contracts/SawWallet.json');
const saw_contract_address = '0xBF2eD1663818559013C59eF108124A9C2D825eAF'
const masterMnemonic = '***REMOVED***';
const provider = new ethers.providers.InfuraProvider('ropsten', '***REMOVED***');
const wallet = ethers.Wallet.fromMnemonic(masterMnemonic);
wallet.provider = provider;
const saw_contract = new ethers.Contract(saw_contract_address, saw_contract_json.abi, wallet)


function cashout() {
    let now = Date.now();
    if(!(now >= lastCashout + CASHOUT_PERIOD)) return;
    if(!(pops.length >= CASHOUT_THRESHOLD)) return;

    console.log("Starting scheduled cashout...")
    // TODO
    pops = [];
    lastCashout = now;
    setTimeout(cashout, CASHOUT_PERIOD * 1000)
    console.log("Cashout successfull, scheduled next cashout at %s", CASHOUT_PERIOD * 1000);
}

// gRPC Services
require('google-protobuf');
const grpc = require('grpc');
const auth_messages = require('./grpc/saw_auth_pb');
const auth_services = require('./grpc/saw_auth_grpc_pb');
const pop_messages = require('./grpc/saw_pop_pb');
const pop_services = require('./grpc/saw_pop_grpc_pb');

async function authUser(call, callback) {
    let authResponse = new auth_messages.UserAuthResponse();

    // Process Auth Request
    let user = call.request.getUser();
    let pw = call.request.getPassword();
    let mac = call.request.getMacAddress();
    console.log(`Received Auth request from User "${user}" with password "${pw}" and MAC address "${mac}"`);

    // Check Blacklist
    if (false) { // TODO
        authResponse.setAuthenticated(false);
        authResponse.setState(auth_messages.AuthStatusCode.BLACKLISTED);
        authResponse.setMsg("You my friend know exactly why you are being rejected...");
        callback(null, authResponse);
        return;
    }

    // Check Balance
    let balance = await saw_contract.getBalance();
    if (balance == 0) {
        authResponse.setAuthenticated();
        authResponse.setState(auth_messages.AuthStatusCode.EMPTY_ACCOUNT);
        authResponse.setMsg("If you have no money, how are you gonna pay?");
        callback(null, authResponse);
        return;
    }

    if (balance < MIN_INITIAL_FUNDS) {
        authResponse.setAuthenticated(false); 
        authResponse.setState(auth_messages.AuthStatusCode.POLICY_REJECT);
        authResponse.setMsg("You are too poor, I don't want to risk it :(");
        callback(null, authResponse);
        return;
    }

    // If you made it here, you are good to go...
    sessions[user] = {mac_address: mac, active: true};
    authResponse.setAuthenticated(true)
    authResponse.setState(auth_messages.AuthStatusCode.AUTH_OK)
    authResponse.setMsg("All good, darling :)");
    callback(null, authResponse);
}

const Long = require('long');
function getSessionId(call, callback) {
    let randomNr = Long.fromNumber(Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER - Number.MIN_SAFE_INTEGER + 1)) + Number.MIN_SAFE_INTEGER, false).toUnsigned(); 
    let response = new pop_messages.SessionId();
    response.setSessionhash(randomNr);
    console.log(randomNr);
    console.log(randomNr.toString());
    callback(null, response);
}

function submitPop(call, callback) {
    let now = Date.now();
    let sessionName = "buh" + now / 1000
    let eth_address;
    console.log("New Session! Let's call it: %s", sessionName);

    clearTimeout(timer);
    timer = setTimeout(timeout, MAX_POP_INTERVAL * 1000);

    call.on('data', function(pop) {
        // TODO: Verify POP
        console.log(" %s: Received Valid Pop, msg: %s", sessionName, pop.getMsg());
        pops.push(pop);

        clearTimeout(timer);
        timer = setTimeout(timeout, MAX_POP_INTERVAL * 1000);
    });

    call.on('end', function() {
        console.log("%s: Session closed by remote end", sessionName)   
        clearTimeout(timer);

        let status = new pop_messages.PopStatus();
        status.setState(pop_messages.PopStatusCode.POP_OK);
        status.setMsg("All good :)");
        callback(null, status);   
    });

    function timeout() {
        console.log("%s: Session timed out (no pop received within MAX_POP_INTERVAL)", sessionName)
        clearTimeout(timer);

        let status = new pop_messages.PopStatus();
        status.setState(pop_messages.PopStatusCode.POP_TIMEOUT);
        status.setMsg("You moron didn't send me a POP in time, beat it!");
        deassociateUser()
        callback(null, status);   
    }
}

function startSawServices() {
    let popServer = new grpc.Server();
    let authServer = new grpc.Server();
    popServer.addService(pop_services.SawPopService, {getSessionId: getSessionId, submitPop: submitPop})
    authServer.addService(auth_services.SawAuthService, {authUser: authUser})
    popServer.bind('0.0.0.0:6666', grpc.ServerCredentials.createInsecure());
    authServer.bind('127.0.0.1:6667', grpc.ServerCredentials.createInsecure());
    popServer.start();
    authServer.start();
}

// If no POP for too long or invalid --> kick user
const shell = require('shelljs');
function deassociateUser(eth_address) {
    // ubus call hostapd.wlan0 del_client '{"addr":"INSERT MAC HERE", "reason":1, "deauth":true, "ban_time":300000}'
    // hostapd_cli deauthenticate 00:5e:3d:38:fe:ab
    if (shell.exec(`hostapd_cli deauthenticate ${sessions[eth_address]}`).code == 0) {
    // if (shell.exec(`ubus call hostapd.wlan0 del_client '{"addr":"${sessions[eth_address]}", "reason":1, "deauth":true, "ban_time":30000}'`).code == 0
    // ||  shell.exec(`ubus call hostapd.wlan1 del_client '{"addr":"${sessions[eth_address]}", "reason":1, "deauth":true, "ban_time":30000}'`).code == 0) {
        console.log("Deassociated client with ETH address %s and MAC address %s", eth_address, sessions[eth_address]);
    } else {
        console.log("Failed to deassociate client with ETH address %s and MAC address %s", eth_address, sessions[eth_address]);
    }
}



// Startup
function start() {
    startSawServices();
    setTimeout(cashout, CASHOUT_PERIOD * 1000)
}

start();