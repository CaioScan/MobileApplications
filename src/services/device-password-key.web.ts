export const hasDevicePasswordKey = false;

export async function getDevicePasswordKey(): Promise<Uint8Array> {
    throw new Error('Credenciais vinculadas ao dispositivo não podem ser usadas no navegador.');
}
