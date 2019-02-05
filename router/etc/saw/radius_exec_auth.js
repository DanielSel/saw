// Authentication Script for RADIUS Server

// TODO:
// Call the saw_service to authenticate user via gRPC

// UserName: Expected Ethereum Address for Account
// Password: Expected Signature for the UserName (to prove that user in fact is owner of the account)
const user = process.env["User-Name"];
const pw = process.env["User-Password"];
const mac = process.env["Calling-Station-ID"];


console.log(`Authorized User "${user}" with password "${pw}" and MAC address: "${mac}"`);
return 0;
