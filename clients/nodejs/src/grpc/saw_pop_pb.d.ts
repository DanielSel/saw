// package: saw
// file: saw_pop.proto

/* tslint:disable */

import * as jspb from "google-protobuf";

export class Pop extends jspb.Message { 
    getSessionhash(): number;
    setSessionhash(value: number): void;

    getAccTime(): number;
    setAccTime(value: number): void;

    getSignature(): string;
    setSignature(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Pop.AsObject;
    static toObject(includeInstance: boolean, msg: Pop): Pop.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Pop, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Pop;
    static deserializeBinaryFromReader(message: Pop, reader: jspb.BinaryReader): Pop;
}

export namespace Pop {
    export type AsObject = {
        sessionhash: number,
        accTime: number,
        signature: string,
    }
}

export class PopStatus extends jspb.Message { 
    getState(): PopStatusCode;
    setState(value: PopStatusCode): void;

    getMsg(): string;
    setMsg(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PopStatus.AsObject;
    static toObject(includeInstance: boolean, msg: PopStatus): PopStatus.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PopStatus, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PopStatus;
    static deserializeBinaryFromReader(message: PopStatus, reader: jspb.BinaryReader): PopStatus;
}

export namespace PopStatus {
    export type AsObject = {
        state: PopStatusCode,
        msg: string,
    }
}

export class SessionIdRequest extends jspb.Message { 
    getEthAddress(): string;
    setEthAddress(value: string): void;

    getSignature(): string;
    setSignature(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SessionIdRequest.AsObject;
    static toObject(includeInstance: boolean, msg: SessionIdRequest): SessionIdRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SessionIdRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SessionIdRequest;
    static deserializeBinaryFromReader(message: SessionIdRequest, reader: jspb.BinaryReader): SessionIdRequest;
}

export namespace SessionIdRequest {
    export type AsObject = {
        ethAddress: string,
        signature: string,
    }
}

export class SessionIdResponse extends jspb.Message { 
    getSessionhash(): number;
    setSessionhash(value: number): void;


    hasSuccess(): boolean;
    clearSuccess(): void;
    getSuccess(): PopStatus | undefined;
    setSuccess(value?: PopStatus): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SessionIdResponse.AsObject;
    static toObject(includeInstance: boolean, msg: SessionIdResponse): SessionIdResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SessionIdResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SessionIdResponse;
    static deserializeBinaryFromReader(message: SessionIdResponse, reader: jspb.BinaryReader): SessionIdResponse;
}

export namespace SessionIdResponse {
    export type AsObject = {
        sessionhash: number,
        success?: PopStatus.AsObject,
    }
}

export enum PopStatusCode {
    POP_OK = 0,
    POP_TIMEOUT = 1,
    POP_INVALID = 2,
    POP_CONNECTION_ERROR = 3,
    POP_NO_CLUE_WHATS_WRONG = 4,
}
