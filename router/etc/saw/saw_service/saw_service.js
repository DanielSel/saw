// Contract Address: 0xBF2eD1663818559013C59eF108124A9C2D825eAF

// Admission Policy (Hardcoded for now)
let MAX_POP_INTERVAL = 10; //s
let MIN_INITIAL_FUNDS = 10000; //gwei
let CASHOUT_PERIOD = 3600; //s
let CASHOUT_THRESHOLD = 20; // min. num. of POP's for cashout to happen
let BLACKLIST_INTERVAL = 600; //s

// Global Storage
let pops = [];
let lastCashout = 0;

// Set Up Access to Ethereum Smart Contract
const ethers = require('ethers');
const saw_contract_json = require('../../../../smart_contracts/build/contracts/SawWallet.json');
const saw_contract_address = '0xBF2eD1663818559013C59eF108124A9C2D825eAF'
const masterMnemonic = '***REMOVED***';
const provider = new ethers.providers.InfuraProvider('ropsten', '***REMOVED***');
const wallet = ethers.Wallet.fromMnemonic(masterMnemonic);
wallet.provider = provider;
const saw_contract = new ethers.Contract(saw_contract_address, saw_contract_json.abi, wallet)

// Smart Contract Interactions
function getBalance() {
    return 20000;
}

function cashout() {
    let now = Date.now();
    if(! now >= lastCashout + CASHOUT_PERIOD) return;
    if(! pops.length >= CASHOUT_THRESHOLD) return;

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
const auth_messages = require('./saw_auth_pb');
const auth_services = require('./saw_auth_grpc_pb');
const pop_messages = require('./saw_pop_pb');
const pop_services = require('./saw_pop_grpc_pb');

function authUser(call, callback) {
    let authResponse = new auth_messages.UserAuthResponse();

    // Process Auth Request
    let user = call.request.getUser();
    let pw = call.request.getPassword();
    console.log(`Received Auth request from User "${user}" with password "${pw}"`);

    // Check Blacklist
    if (false) { // TODO
        authResponse.setAuthenticated(false);
        authResponse.setState(auth_messages.Status.BLACKLISTED);
        authResponse.setMsg("You my friend know exactly why you are being rejected...");
        callback(null, authResponse);
        return;
    }

    // Check Balance
    let balance = getBalance();
    if (balance == 0) {
        authResponse.setAuthenticated();
        authResponse.setState(auth_messages.Status.EMPTY_ACCOUNT);
        authResponse.setMsg("If you have no money, how are you gonna pay?");
        callback(null, authResponse);
        return;
    }

    if (balance < MIN_INITIAL_FUNDS) {
        authResponse.setAuthenticated(false); 
        authResponse.setState(auth_messages.Status.POLICY_REJECT);
        authResponse.setMsg("You are too poor, I don't want to risk it :(");
        callback(null, authResponse);
        return;
    }

    // If you made it here, you are good to go...
    authResponse.setAuthenticated(true)
    authResponse.setState(auth_messages.Status.OK)
    authResponse.setMsg("All good, darling :)");
    callback(null, authResponse);
}

function submitPop(call, callback) {
    let now = Date.now();
    let sessionName = "buh" + now / 1000
    console.log("New Session! Let's call it: %s", sessionName);

    let timer = setTimeout(timeout, MAX_POP_INTERVAL * 1000);

    call.on('data', function(pop) {
        console.log(" %s: Received Valid Pop, msg: %s", sessionName, pop.getMsg());
        pops.push(pop);

        clearTimeout(timer);
        timer = setTimeout(timeout, MAX_POP_INTERVAL * 1000);
    });

    call.on('end', function() {
        console.log("%s: Session closed by remote end", sessionName)   
        clearTimeout(timer);

        let status = new pop_messages.PopStatus();
        status.setState(pop_messages.Status.OK);
        status.setMsg("All good :)");
        callback(null, status);   
    });

    function timeout() {
        console.log("%s: Session timed out (no pop received within MAX_POP_INTERVAL)", sessionName)
        clearTimeout(timer);

        let status = new pop_messages.PopStatus();
        status.setState(pop_messages.Status.POP_TIMEOUT);
        status.setMsg("You moron didn't send me a POP in time, beat it!");
        callback(null, status);   
    }
}

function startSawServices() {
    let popServer = new grpc.Server();
    let authServer = new grpc.Server();
    popServer.addService(pop_services.SawPopService, {submitPop: submitPop})
    authServer.addService(auth_services.SawAuthService, {authUser: authUser})
    popServer.bind('0.0.0.0:6666', grpc.ServerCredentials.createInsecure());
    authServer.bind('127.0.0.1:6667', grpc.ServerCredentials.createInsecure());
    popServer.start();
    authServer.start();
}


// Startup
function start() {
    startSawServices();
    setTimeout(cashout, CASHOUT_PERIOD * 1000)
}

start();