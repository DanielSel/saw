// package: saw
// file: saw_pop.proto

/* tslint:disable */

import * as grpc from "grpc";
import * as saw_pop_pb from "./saw_pop_pb";

interface ISawPopService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    newSession: ISawPopService_InewSession;
    submitPop: ISawPopService_IsubmitPop;
}

interface ISawPopService_InewSession extends grpc.MethodDefinition<saw_pop_pb.SessionIdRequest, saw_pop_pb.SessionIdResponse> {
    path: string; // "/saw.SawPop/newSession"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<saw_pop_pb.SessionIdRequest>;
    requestDeserialize: grpc.deserialize<saw_pop_pb.SessionIdRequest>;
    responseSerialize: grpc.serialize<saw_pop_pb.SessionIdResponse>;
    responseDeserialize: grpc.deserialize<saw_pop_pb.SessionIdResponse>;
}
interface ISawPopService_IsubmitPop extends grpc.MethodDefinition<saw_pop_pb.Pop, saw_pop_pb.PopStatus> {
    path: string; // "/saw.SawPop/submitPop"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<saw_pop_pb.Pop>;
    requestDeserialize: grpc.deserialize<saw_pop_pb.Pop>;
    responseSerialize: grpc.serialize<saw_pop_pb.PopStatus>;
    responseDeserialize: grpc.deserialize<saw_pop_pb.PopStatus>;
}

export const SawPopService: ISawPopService;

export interface ISawPopServer {
    newSession: grpc.handleUnaryCall<saw_pop_pb.SessionIdRequest, saw_pop_pb.SessionIdResponse>;
    submitPop: grpc.handleUnaryCall<saw_pop_pb.Pop, saw_pop_pb.PopStatus>;
}

export interface ISawPopClient {
    newSession(request: saw_pop_pb.SessionIdRequest, callback: (error: grpc.ServiceError | null, response: saw_pop_pb.SessionIdResponse) => void): grpc.ClientUnaryCall;
    newSession(request: saw_pop_pb.SessionIdRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: saw_pop_pb.SessionIdResponse) => void): grpc.ClientUnaryCall;
    newSession(request: saw_pop_pb.SessionIdRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: saw_pop_pb.SessionIdResponse) => void): grpc.ClientUnaryCall;
    submitPop(request: saw_pop_pb.Pop, callback: (error: grpc.ServiceError | null, response: saw_pop_pb.PopStatus) => void): grpc.ClientUnaryCall;
    submitPop(request: saw_pop_pb.Pop, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: saw_pop_pb.PopStatus) => void): grpc.ClientUnaryCall;
    submitPop(request: saw_pop_pb.Pop, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: saw_pop_pb.PopStatus) => void): grpc.ClientUnaryCall;
}

export class SawPopClient extends grpc.Client implements ISawPopClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public newSession(request: saw_pop_pb.SessionIdRequest, callback: (error: grpc.ServiceError | null, response: saw_pop_pb.SessionIdResponse) => void): grpc.ClientUnaryCall;
    public newSession(request: saw_pop_pb.SessionIdRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: saw_pop_pb.SessionIdResponse) => void): grpc.ClientUnaryCall;
    public newSession(request: saw_pop_pb.SessionIdRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: saw_pop_pb.SessionIdResponse) => void): grpc.ClientUnaryCall;
    public submitPop(request: saw_pop_pb.Pop, callback: (error: grpc.ServiceError | null, response: saw_pop_pb.PopStatus) => void): grpc.ClientUnaryCall;
    public submitPop(request: saw_pop_pb.Pop, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: saw_pop_pb.PopStatus) => void): grpc.ClientUnaryCall;
    public submitPop(request: saw_pop_pb.Pop, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: saw_pop_pb.PopStatus) => void): grpc.ClientUnaryCall;
}
