// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var saw_pop_pb = require('./saw_pop_pb.js');

function serialize_saw_Pop(arg) {
  if (!(arg instanceof saw_pop_pb.Pop)) {
    throw new Error('Expected argument of type saw.Pop');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_saw_Pop(buffer_arg) {
  return saw_pop_pb.Pop.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_saw_PopStatus(arg) {
  if (!(arg instanceof saw_pop_pb.PopStatus)) {
    throw new Error('Expected argument of type saw.PopStatus');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_saw_PopStatus(buffer_arg) {
  return saw_pop_pb.PopStatus.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_saw_SessionIdRequest(arg) {
  if (!(arg instanceof saw_pop_pb.SessionIdRequest)) {
    throw new Error('Expected argument of type saw.SessionIdRequest');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_saw_SessionIdRequest(buffer_arg) {
  return saw_pop_pb.SessionIdRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_saw_SessionIdResponse(arg) {
  if (!(arg instanceof saw_pop_pb.SessionIdResponse)) {
    throw new Error('Expected argument of type saw.SessionIdResponse');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_saw_SessionIdResponse(buffer_arg) {
  return saw_pop_pb.SessionIdResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var SawPopService = exports.SawPopService = {
  newSession: {
    path: '/saw.SawPop/newSession',
    requestStream: false,
    responseStream: false,
    requestType: saw_pop_pb.SessionIdRequest,
    responseType: saw_pop_pb.SessionIdResponse,
    requestSerialize: serialize_saw_SessionIdRequest,
    requestDeserialize: deserialize_saw_SessionIdRequest,
    responseSerialize: serialize_saw_SessionIdResponse,
    responseDeserialize: deserialize_saw_SessionIdResponse,
  },
  submitPop: {
    path: '/saw.SawPop/submitPop',
    requestStream: false,
    responseStream: false,
    requestType: saw_pop_pb.Pop,
    responseType: saw_pop_pb.PopStatus,
    requestSerialize: serialize_saw_Pop,
    requestDeserialize: deserialize_saw_Pop,
    responseSerialize: serialize_saw_PopStatus,
    responseDeserialize: deserialize_saw_PopStatus,
  },
};

exports.SawPopClient = grpc.makeGenericClientConstructor(SawPopService);
