require('google-protobuf');
const grpc = require('grpc');
const messages = require('./generated/saw_pop_pb');
const services = require('./generated/saw_pop_grpc_pb');

let client = new services.SawPopClient('localhost:6666', grpc.credentials.createInsecure());
let timer;

function sendPopsDelayed(ttl, minDelay, maxDelay, call) {
    clearTimeout(timer);
    if (ttl == 0) {
        console.log("That was the last one, closing the stream...");
        call.end();
        return;   
    }
    console.log("Sending random pop...")
    let pop = new messages.Pop();
    pop.setMsg("wuhuu+" + Math.random());
    call.write(pop);
    ttl--;
    delay = Math.random() * (maxDelay - minDelay) + minDelay;
    console.log("One more, delay: %s", delay);
    timer = setTimeout(() => sendPopsDelayed(ttl, minDelay, maxDelay, call), delay * 1000);
}

function popCallback(error, popStatus) {
    if (error) {
        console.log("Oops, something went wrong...");
        console.log(error);
        clearTimeout(timer);
        return;
    }
    let state = popStatus.getState()
    if (state == messages.Status.OK) {
        console.log("Buhja! It worked :)");
        clearTimeout(timer);
        return;
    }
    else if (state == messages.Status.POP_TIMEOUT) {
        console.log("We took to long with sending a POP... :(");
        clearTimeout(timer);
        return;
    }
    else {
        console.log("We got rejected :(");
        console.log("CODE: %s", authResponse.getState());
        console.log("TEXT: %s", authResponse.getMsg());
        clearTimeout(timer);
        return;
    }
}


let call = client.submitPop(popCallback);
console.log("Test good...")
sendPopsDelayed(5, 2, 9, call); // Should work
call = client.submitPop(popCallback);
console.log("Let's screw up...")
sendPopsDelayed(5, 8, 25, call); // Should timeout
