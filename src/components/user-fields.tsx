import { useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';

import { roleLabels, roles, type Role, type User, type UserInput } from '../models/user';
import { Action, Field, FormError, colors } from './access-ui';

export default function UserFields({
    user, button, onSave, manageRole = false,
}: {
    user?: User;
    button: string;
    manageRole?: boolean;
    onSave: (input: UserInput) => Promise<void>;
}) {
    const [name, setName] = useState(user?.name ?? '');
    const [login, setLogin] = useState(user?.login ?? '');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role>(user?.role ?? 'viewer');
    const [confirmation, setConfirmation] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    async function submit() {
        if (busy) return;
        if (password !== confirmation) {
            setError('As senhas não coincidem.');
            return;
        }

        Keyboard.dismiss();
        setError('');
        setBusy(true);
        try {
            await onSave({ name, login, password, role });
        } catch (failure) {
            setError(failure instanceof Error ? failure.message : 'Não foi possível salvar. Tente novamente.');
        } finally {
            setBusy(false);
        }
    }

    return (
        <>
            <Field label="Nome" value={name} onChangeText={setName} autoCapitalize="words" editable={!busy} />
            <Field label="Login" value={login} onChangeText={setLogin} autoCapitalize="none" editable={!busy} />
            <Field
                label={user ? 'Nova senha (opcional)' : 'Senha'}
                placeholder={user ? 'Em branco mantém a senha atual' : 'Pelo menos 6 caracteres'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
                editable={!busy}
            />
            <Field
                label="Confirmar senha"
                value={confirmation}
                onChangeText={setConfirmation}
                secureTextEntry
                autoCapitalize="none"
                editable={!busy}
                onSubmitEditing={submit}
            />
            {manageRole && (
                <View style={styles.roles} accessibilityRole="radiogroup" accessibilityLabel="Perfil de acesso">
                    <Text style={styles.label}>Perfil de acesso</Text>
                    {roles.map(option => (
                        <Pressable
                            key={option}
                            accessibilityRole="radio"
                            aria-checked={role === option}
                            accessibilityState={{ disabled: busy }}
                            disabled={busy}
                            onPress={() => setRole(option)}
                            style={[styles.role, role === option && styles.selected]}
                        >
                            <View style={[styles.radio, role === option && styles.selectedRadio]} />
                            <Text style={styles.label}>{roleLabels[option]}</Text>
                        </Pressable>
                    ))}
                </View>
            )}
            <FormError message={error} />
            <Action title={busy ? 'Salvando usuário…' : button} onPress={submit} busy={busy} />
        </>
    );
}

const styles = StyleSheet.create({
    roles: { gap: 7 },
    label: { color: colors.ink, fontSize: 14, fontWeight: '600' },
    role: {
        flexDirection: 'row', alignItems: 'center', gap: 9, minHeight: 44, paddingHorizontal: 12,
        borderWidth: 1, borderColor: colors.border, borderRadius: 9,
    },
    selected: { backgroundColor: colors.background, borderColor: colors.accent },
    radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.muted },
    selectedRadio: { borderWidth: 5, borderColor: colors.accent, backgroundColor: colors.surface },
});
