import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';

import { can, roles, type Permission, type User, type UserInput } from '../models/user';
import { hasDevicePasswordKey } from './device-password-key';
import { createCredentials, matchesPassword, type Credentials } from './password';

type StoredUser = User & Credentials;
type LegacyUser = Omit<StoredUser, 'role'> & { role?: StoredUser['role'] };

const USERS_KEY = 'access@users';
let pendingWrite: Promise<unknown> = Promise.resolve();

async function readUsers(): Promise<StoredUser[]> {
    const json = await AsyncStorage.getItem(USERS_KEY);
    if (json === null) return [];

    const users = JSON.parse(json) as LegacyUser[];
    // Accounts created before roles were added keep their credentials.
    const firstLegacyId = users.some(user => user.role === 'admin')
        ? undefined
        : users.find(user => user.role === undefined)?.id;

    return users.map(user => ({
        ...user,
        role: user.role ?? (user.id === firstLegacyId ? 'admin' : 'viewer'),
    }));
}

function profile({ id, name, login, role }: StoredUser): User {
    return { id, name, login, role };
}

function writeUsers<Result>(update: () => Promise<Result>) {
    const write = pendingWrite.then(update);
    pendingWrite = write.catch(() => undefined);
    return write;
}

function hasProtectedCredentials(users: StoredUser[]) {
    return users.some(user => user.passwordScheme === 'device-hmac');
}

export async function listUsers() {
    return (await readUsers()).map(profile);
}

export async function authenticate(login: string, password: string): Promise<User | null> {
    const user = (await readUsers()).find(item => item.login === login.trim().toLowerCase());
    if (!user || !await matchesPassword(password, user)) return null;

    if (hasDevicePasswordKey && !user.passwordScheme) {
        try {
            await writeUsers(async () => {
                const users = await readUsers();
                const latest = users.find(item => item.id === user.id);
                if (!latest || latest.passwordScheme || latest.passwordHash !== user.passwordHash) return;

                const credentials = await createCredentials(password, !hasProtectedCredentials(users));
                const updated = users.map(item => item.id === user.id ? { ...item, ...credentials } : item);
                await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updated));
            });
        } catch {
            // The verified legacy credential remains valid if its upgrade cannot be saved.
        }
    }

    return profile(user);
}

function checkPermission(users: StoredUser[], actorId: string, permission: Permission) {
    const actor = users.find(user => user.id === actorId);
    if (!can(actor?.role, permission)) {
        throw new Error('Seu perfil não tem permissão para esta ação.');
    }
}

export async function requirePermission(actorId: string, permission: Permission) {
    checkPermission(await readUsers(), actorId, permission);
}

export function saveUser(input: UserInput, actorId: string | null, id?: string) {
    // Serialize read-modify-write operations so two saves cannot overwrite each other.
    return writeUsers(async () => {
        const users = await readUsers();
        if (actorId === null) {
            if (users.length > 0 || id !== undefined) {
                throw new Error('O primeiro usuário já foi cadastrado.');
            }
        } else {
            checkPermission(users, actorId, 'manageUsers');
        }

        const name = input.name.trim();
        const login = input.login.trim().toLowerCase();
        const role = actorId === null ? 'admin' : input.role;
        const existing = users.find(user => user.id === id);

        if (id !== undefined && !existing) throw new Error('Usuário não encontrado.');
        if (!roles.includes(role)) throw new Error('Selecione um perfil válido.');
        if (!name || !login || /\s/.test(login)) {
            throw new Error('Informe o nome e um login sem espaços.');
        }
        if (users.some(user => user.login === login && user.id !== id)) {
            throw new Error('Esse login já está em uso.');
        }
        if (existing?.role === 'admin' && role !== 'admin'
            && !users.some(user => user.id !== id && user.role === 'admin')) {
            throw new Error('O app precisa manter pelo menos um administrador.');
        }

        const changePassword = !existing || input.password !== '';
        if (changePassword && input.password.trim().length < 6) {
            throw new Error('A senha precisa ter pelo menos 6 caracteres.');
        }

        const credentials = changePassword
            ? await createCredentials(input.password, !hasProtectedCredentials(users))
            : existing;

        const saved = { ...credentials, id: existing?.id ?? randomUUID(), name, login, role };
        const updated = existing
            ? users.map(user => user.id === saved.id ? saved : user)
            : [...users, saved];

        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updated));
        return updated.map(profile);
    });
}
