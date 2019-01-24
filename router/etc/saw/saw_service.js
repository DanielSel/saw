// Contract Address: 0xBF2eD1663818559013C59eF108124A9C2D825eAF

// Set Up Access to Ethereum Smart Contract
const ethers = require('ethers');
const saw_contract_json = require('../../smart_contracts/build/contracts/SawWallet.json');
const saw_contract_address = '0xBF2eD1663818559013C59eF108124A9C2D825eAF'
const masterMnemonic = '***REMOVED***';
const provider = new ethers.providers.InfuraProvider('ropsten', '***REMOVED***');
const wallet = ethers.Wallet.fromMnemonic(masterMnemonic);
wallet.provider = provider;
const saw_contract = new ethers.Contract(saw_contract_address, saw_contract_json.abi, wallet)

