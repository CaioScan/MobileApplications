import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import type { User, UserInput } from '../models/user';
import * as repository from '../services/user.repo';

type Access = {
    users: User[] | null;
    loadFailed: boolean;
    currentUser: User | undefined;
    reload: () => Promise<void>;
    signIn: (login: string, password: string) => Promise<boolean>;
    signOut: () => void;
    save: (input: UserInput, id?: string) => Promise<void>;
    setup: (input: UserInput) => Promise<void>;
};

const AccessContext = createContext<Access | null>(null);

export function AccessProvider({ children }: { children: ReactNode }) {
    const [users, setUsers] = useState<User[] | null>(null);
    const [loadFailed, setLoadFailed] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const currentUser = users?.find(user => user.id === sessionId);

    const reload = useCallback(() => repository.listUsers().then(result => {
        setUsers(result);
        setLoadFailed(false);
    }, () => setLoadFailed(true)), []);

    useEffect(() => {
        void reload();
    }, [reload]);

    async function signIn(login: string, password: string) {
        const user = await repository.authenticate(login, password);
        if (!user) return false;
        setSessionId(user.id);
        return true;
    }

    async function save(input: UserInput, id?: string) {
        if (!sessionId) throw new Error('Entre para gerenciar usuários.');
        setUsers(await repository.saveUser(input, sessionId, id));
    }

    async function setup(input: UserInput) {
        setUsers(await repository.saveUser(input, null));
    }

    return (
        <AccessContext.Provider value={{
            users, loadFailed, currentUser, reload, signIn,
            signOut: () => setSessionId(null), save, setup,
        }}>
            {children}
        </AccessContext.Provider>
    );
}

export function useAccess() {
    const access = useContext(AccessContext);
    if (!access) throw new Error('AccessProvider ausente.');
    return access;
}
