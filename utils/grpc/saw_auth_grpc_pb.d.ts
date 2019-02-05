// package: saw
// file: saw_auth.proto

/* tslint:disable */

import * as grpc from "grpc";
import * as saw_auth_pb from "./saw_auth_pb";

interface ISawAuthService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    authUser: ISawAuthService_IauthUser;
}

interface ISawAuthService_IauthUser extends grpc.MethodDefinition<saw_auth_pb.UserAuthRequest, saw_auth_pb.UserAuthResponse> {
    path: string; // "/saw.SawAuth/authUser"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<saw_auth_pb.UserAuthRequest>;
    requestDeserialize: grpc.deserialize<saw_auth_pb.UserAuthRequest>;
    responseSerialize: grpc.serialize<saw_auth_pb.UserAuthResponse>;
    responseDeserialize: grpc.deserialize<saw_auth_pb.UserAuthResponse>;
}

export const SawAuthService: ISawAuthService;

export interface ISawAuthServer {
    authUser: grpc.handleUnaryCall<saw_auth_pb.UserAuthRequest, saw_auth_pb.UserAuthResponse>;
}

export interface ISawAuthClient {
    authUser(request: saw_auth_pb.UserAuthRequest, callback: (error: grpc.ServiceError | null, response: saw_auth_pb.UserAuthResponse) => void): grpc.ClientUnaryCall;
    authUser(request: saw_auth_pb.UserAuthRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: saw_auth_pb.UserAuthResponse) => void): grpc.ClientUnaryCall;
    authUser(request: saw_auth_pb.UserAuthRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: saw_auth_pb.UserAuthResponse) => void): grpc.ClientUnaryCall;
}

export class SawAuthClient extends grpc.Client implements ISawAuthClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public authUser(request: saw_auth_pb.UserAuthRequest, callback: (error: grpc.ServiceError | null, response: saw_auth_pb.UserAuthResponse) => void): grpc.ClientUnaryCall;
    public authUser(request: saw_auth_pb.UserAuthRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: saw_auth_pb.UserAuthResponse) => void): grpc.ClientUnaryCall;
    public authUser(request: saw_auth_pb.UserAuthRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: saw_auth_pb.UserAuthResponse) => void): grpc.ClientUnaryCall;
}
