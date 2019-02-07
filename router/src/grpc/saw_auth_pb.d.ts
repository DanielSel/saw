// package: saw
// file: saw_auth.proto

/* tslint:disable */

import * as jspb from "google-protobuf";

export class UserAuthRequest extends jspb.Message { 
    getUser(): string;
    setUser(value: string): void;

    getPassword(): string;
    setPassword(value: string): void;

    getMacaddress(): string;
    setMacaddress(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UserAuthRequest.AsObject;
    static toObject(includeInstance: boolean, msg: UserAuthRequest): UserAuthRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UserAuthRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UserAuthRequest;
    static deserializeBinaryFromReader(message: UserAuthRequest, reader: jspb.BinaryReader): UserAuthRequest;
}

export namespace UserAuthRequest {
    export type AsObject = {
        user: string,
        password: string,
        macaddress: string,
    }
}

export class UserAuthResponse extends jspb.Message { 
    getAuthenticated(): boolean;
    setAuthenticated(value: boolean): void;

    getState(): AuthStatusCode;
    setState(value: AuthStatusCode): void;

    getMsg(): string;
    setMsg(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UserAuthResponse.AsObject;
    static toObject(includeInstance: boolean, msg: UserAuthResponse): UserAuthResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UserAuthResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UserAuthResponse;
    static deserializeBinaryFromReader(message: UserAuthResponse, reader: jspb.BinaryReader): UserAuthResponse;
}

export namespace UserAuthResponse {
    export type AsObject = {
        authenticated: boolean,
        state: AuthStatusCode,
        msg: string,
    }
}

export enum AuthStatusCode {
    AUTH_OK = 0,
    INVALID_SIGNATURE = 1,
    EMPTY_ACCOUNT = 2,
    POLICY_REJECT = 3,
    BLACKLISTED = 4,
    AUTH_CONNECTION_ERROR = 5,
    AUTH_NO_CLUE_WHATS_WRONG = 6,
}
