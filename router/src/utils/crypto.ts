import { Wallet } from "ethers";
import {joinSignature, keccak256, recoverAddress, Signature, SigningKey} from "ethers/utils";

export function recoverSignerAddress(message: string | number, signature: Signature | string, size?: number)
        : string {

    if (typeof(message) === "number") {
        message = convertToHexString(message, size);
    }

    return recoverAddress(keccak256(message), signature);
}

export function signMessage(ethWallet: Wallet, message: string | number, size?: number): string {
    if (typeof(message) === "number") {
        message = convertToHexString(message, size);
    }

    const messageHash = keccak256(message);
    return joinSignature(getSigningKey(ethWallet).signDigest(messageHash));
}

export function convertToHexString(value: number, size?: number): string {

    if (value < 0) {
        throw new RangeError(`cannot hexlify negative value: ${value}`);
    }

    let hex = "";
    while (value) {
        // tslint:disable-next-line: no-bitwise
        hex = "0123456789abcdef"[value & 0x0f] + hex;
        value = Math.floor(value / 16);
    }

    if (hex.length) {
        if (hex.length % 2) { hex = "0" + hex; }

        if (size) {
            hex = "0".repeat(size - hex.length) + hex;
        }

        return "0x" + hex;
    }

    return "0x00";
}

function getSigningKey(ethWallet: Wallet): SigningKey {
    const key = ethWallet.privateKey;
    if (SigningKey.isSigningKey(key)) {
        return key;
    } else {
        return new SigningKey(key);
    }
}
