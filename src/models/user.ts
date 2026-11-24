export const roleLabels = {
    viewer: 'Visualizador',
    contributor: 'Colaborador',
    admin: 'Administrador',
};

export type Role = keyof typeof roleLabels;
export type Permission = 'viewPoints' | 'addPoint' | 'deletePoint' | 'manageUsers';

export const roles: Role[] = ['viewer', 'contributor', 'admin'];

const permissions: Record<Role, readonly Permission[]> = {
    viewer: ['viewPoints'],
    contributor: ['viewPoints', 'addPoint'],
    admin: ['viewPoints', 'addPoint', 'deletePoint', 'manageUsers'],
};

export function can(role: Role | undefined, permission: Permission) {
    return role ? permissions[role].includes(permission) : false;
}

export type User = {
    id: string;
    name: string;
    login: string;
    role: Role;
};

export type UserInput = {
    name: string;
    login: string;
    password: string;
    role: Role;
};
