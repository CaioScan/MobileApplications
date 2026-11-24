import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
import { getRandomBytesAsync } from 'expo-crypto';
import { getItemAsync, setItemAsync, WHEN_UNLOCKED_THIS_DEVICE_ONLY } from 'expo-secure-store';

export const hasDevicePasswordKey = true;

const KEY = 'access.passwordKey.v1';
const options = { keychainAccessible: WHEN_UNLOCKED_THIS_DEVICE_ONLY };

export async function getDevicePasswordKey(createIfMissing: boolean): Promise<Uint8Array> {
    try {
        const existing = await getItemAsync(KEY, options);
        if (existing !== null) return hexToBytes(existing);

        if (createIfMissing) {
            const key = await getRandomBytesAsync(32);
            await setItemAsync(KEY, bytesToHex(key), options);
            return key;
        }
    } catch {
        throw new Error('Não foi possível acessar o armazenamento seguro. Tente novamente.');
    }

    throw new Error('A chave das credenciais deste dispositivo não está disponível.');
}
