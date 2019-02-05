// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var saw_auth_pb = require('./saw_auth_pb.js');

function serialize_saw_UserAuthRequest(arg) {
  if (!(arg instanceof saw_auth_pb.UserAuthRequest)) {
    throw new Error('Expected argument of type saw.UserAuthRequest');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_saw_UserAuthRequest(buffer_arg) {
  return saw_auth_pb.UserAuthRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_saw_UserAuthResponse(arg) {
  if (!(arg instanceof saw_auth_pb.UserAuthResponse)) {
    throw new Error('Expected argument of type saw.UserAuthResponse');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_saw_UserAuthResponse(buffer_arg) {
  return saw_auth_pb.UserAuthResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var SawAuthService = exports.SawAuthService = {
  authUser: {
    path: '/saw.SawAuth/authUser',
    requestStream: false,
    responseStream: false,
    requestType: saw_auth_pb.UserAuthRequest,
    responseType: saw_auth_pb.UserAuthResponse,
    requestSerialize: serialize_saw_UserAuthRequest,
    requestDeserialize: deserialize_saw_UserAuthRequest,
    responseSerialize: serialize_saw_UserAuthResponse,
    responseDeserialize: deserialize_saw_UserAuthResponse,
  },
};

exports.SawAuthClient = grpc.makeGenericClientConstructor(SawAuthService);
