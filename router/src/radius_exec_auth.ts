// Authentication Script for RADIUS Server
import {credentials} from "grpc";

import {SawAuthClient} from "./grpc/saw_auth_grpc_pb";
import {AuthStatusCode, UserAuthRequest} from "./grpc/saw_auth_pb";

// UserName: Expected Ethereum Address for Account
// Password: Expected Signature for the UserName (to prove that user in fact is owner of the account)
const user = process.env["User-Name"];
const pw = process.env["User-Password"];
const mac = process.env["Calling-Station-Id"];

if (!user || !pw || !mac) {
    // RADIUS "Invalid User Configuration Entry"
    console.log("Invalid User Configuration Entry");
    console.log("User: %s, Password: %s, MAC Address: %s", user, pw, mac);
    process.exit(5);
}

const authClient = new SawAuthClient( "localhost:6667", credentials.createInsecure());

const authRequest = new UserAuthRequest();
authRequest.setUser(user!);
authRequest.setPassword(pw!);
authRequest.setMacaddress(mac!);

authClient.authUser(authRequest, (error, response) => {
    console.log("User: %s, Password: %s, MAC Address: %s", user, pw, mac);
    if (error) {
        // RADIUS "Auth module failed"
        console.log("Auth module failed");
        console.log(error);
        process.exit(2);
    }

    if (response.getState() === AuthStatusCode.AUTH_OK) {
        // RADIUS "OK"
        process.exit(0);
    }

    if (response.getState() === AuthStatusCode.POLICY_REJECT
     || response.getState() === AuthStatusCode.EMPTY_ACCOUNT) {
        // RADIUS "User rejected"
        console.log("User rejected");
        console.log("Rejection Message: %s", response.getMsg());
        process.exit(1);
    }

    if (response.getState() === AuthStatusCode.INVALID_SIGNATURE) {
        // RADIUS "User not found"
        console.log("User not found (Invalid Signature)");
        console.log("Message: %s", response.getMsg());
        process.exit(7);
    }

    if (response.getState() === AuthStatusCode.BLACKLISTED) {
        // RADIUS "User locked out"
        console.log("User Blacklisted");
        console.log("Message: %s", response.getMsg());
        process.exit(6);
    }

    process.exit(-1);
});
