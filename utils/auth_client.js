require('google-protobuf');
const grpc = require('grpc');
const messages = require('./generated/saw_auth_pb');
const services = require('./generated/saw_auth_grpc_pb');

let client = new services.SawAuthClient('localhost:6667', grpc.credentials.createInsecure());

function tryAuth(user, pw) {
    request = new messages.UserAuthRequest();
    request.setUser(user);
    request.setPassword(pw);

    function authCallback(error, authResponse) {
        if (error) {
            console.log("Oops, something went wrong...");
            console.log(error);
            return;
        }

        if (authResponse.getAuthenticated()) {
            console.log("Buhja! It worked :)");
            return;
        }

        else {
            console.log("We got rejected :(");
            console.log("CODE: %s", authResponse.getState());
            console.log("TEXT: %s", authResponse.getMsg());
            return;
        }
    }

    client.authUser(request, authCallback);
}

tryAuth("hans", "zigeuner");