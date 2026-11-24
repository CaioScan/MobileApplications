import { useState } from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Action, Field, FormError, FormPage, accessStyles, colors } from '../components/access-ui';
import UserFields from '../components/user-fields';
import { useAccess } from '../state/access';

export default function LoginScreen() {
    const { users, setup, signIn } = useAccess();
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [firstAccountCreated, setFirstAccountCreated] = useState(false);
    const firstAccess = users?.length === 0;

    async function submit() {
        if (busy) return;
        if (!login.trim() || !password) {
            setError('Informe o login e a senha.');
            return;
        }

        Keyboard.dismiss();
        setError('');
        setBusy(true);
        try {
            if (!await signIn(login, password)) {
                setError('Login ou senha incorretos.');
            }
        } catch {
            setError('Não foi possível entrar. Tente novamente.');
        } finally {
            setBusy(false);
        }
    }

    return (
        <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
            <SafeAreaView style={styles.banner} edges={['top']}>
                <View style={accessStyles.column}>
                    <Text accessibilityRole="header" style={styles.bannerTitle}>Controle de acesso</Text>
                </View>
            </SafeAreaView>
            <FormPage>
                <View style={accessStyles.panel}>
                    <Text accessibilityRole="header" style={accessStyles.title}>
                        {firstAccess ? 'Primeiro acesso' : 'Entrar'}
                    </Text>
                    {firstAccess ? (
                        <>
                            <Text style={accessStyles.body}>Crie a conta de administrador deste dispositivo.</Text>
                            <UserFields button="Criar primeiro usuário" onSave={async input => {
                                await setup(input);
                                setLogin(input.login.trim().toLowerCase());
                                setFirstAccountCreated(true);
                            }} />
                        </>
                    ) : (
                        <>
                            {firstAccountCreated && (
                                <Text accessibilityLiveRegion="polite" style={accessStyles.body}>
                                    Conta criada. Entre com sua senha.
                                </Text>
                            )}
                            <Field label="Login" value={login} onChangeText={setLogin}
                                autoCapitalize="none" autoComplete="username" editable={!busy} />
                            <Field label="Senha" value={password} onChangeText={setPassword}
                                secureTextEntry autoCapitalize="none" autoComplete="current-password"
                                onSubmitEditing={submit} editable={!busy} />
                            <FormError message={error} />
                            <Action title="Entrar" onPress={submit} busy={busy} />
                        </>
                    )}
                </View>
            </FormPage>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    banner: { backgroundColor: colors.dark },
    bannerTitle: { color: colors.surface, fontSize: 30, fontWeight: '800', letterSpacing: -0.7 },
});
