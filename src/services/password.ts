import { hmac } from '@noble/hashes/hmac.js';
import { pbkdf2Async } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, hexToBytes, utf8ToBytes } from '@noble/hashes/utils.js';
import { getRandomBytesAsync } from 'expo-crypto';

import { getDevicePasswordKey, hasDevicePasswordKey } from './device-password-key';

export type Credentials = {
    salt: string;
    passwordHash: string;
    passwordScheme?: 'device-hmac';
};

const PASSWORD_ITERATIONS = 600_000;

async function hashPassword(password: string, salt: string) {
    const saltBytes = hexToBytes(salt);
    const subtle = globalThis.crypto?.subtle;
    if (subtle) {
        const key = await subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
        const digest = await subtle.deriveBits({
            name: 'PBKDF2', hash: 'SHA-256', salt: new Uint8Array(saltBytes), iterations: PASSWORD_ITERATIONS,
        }, key, 256);
        return bytesToHex(new Uint8Array(digest));
    }

    return bytesToHex(await pbkdf2Async(sha256, password, saltBytes, {
        c: PASSWORD_ITERATIONS,
        dkLen: 32,
    }));
}

async function deviceVerifier(password: string, salt: string, createKey = false) {
    const key = await getDevicePasswordKey(createKey);
    // The fixed-length salt separates credentials. The HMAC key stays in the OS secure store at rest.
    return bytesToHex(hmac(sha256, key, utf8ToBytes(salt + password)));
}

export async function matchesPassword(password: string, credentials: Credentials) {
    const { salt, passwordHash, passwordScheme } = credentials;
    const actual = passwordScheme === 'device-hmac'
        ? await deviceVerifier(password, salt)
        : await hashPassword(password, salt);

    return actual === passwordHash;
}

export async function createCredentials(password: string, createKey: boolean): Promise<Credentials> {
    const salt = bytesToHex(await getRandomBytesAsync(16));
    if (hasDevicePasswordKey) {
        return {
            salt,
            passwordHash: await deviceVerifier(password, salt, createKey),
            passwordScheme: 'device-hmac',
        };
    }
    return { salt, passwordHash: await hashPassword(password, salt) };
}
