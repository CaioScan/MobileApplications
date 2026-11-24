import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Action, accessStyles, colors } from '../components/access-ui';
import { can } from '../models/user';
import { AccessProvider, useAccess } from '../state/access';

function AccessNavigator() {
    const { currentUser } = useAccess();

    return (
        <Stack screenOptions={{
            contentStyle: { backgroundColor: colors.background },
            headerStyle: { backgroundColor: colors.dark },
            headerTintColor: colors.surface,
            headerShadowVisible: false,
            headerBackButtonDisplayMode: 'minimal',
        }}>
            <Stack.Protected guard={!currentUser} redirectTo="/mapa">
                <Stack.Screen name="index" options={{ headerShown: false, title: 'Acesso' }} />
            </Stack.Protected>
            <Stack.Protected guard={!!currentUser} redirectTo="/">
                <Stack.Screen name="mapa" options={{ title: 'Mapa de pontos', headerBackVisible: false }} />
                <Stack.Protected guard={can(currentUser?.role, 'manageUsers')} redirectTo="/mapa">
                    <Stack.Screen name="usuarios" options={{ title: 'Usuários' }} />
                    <Stack.Screen name="usuario" options={{ title: 'Cadastro de usuário' }} />
                </Stack.Protected>
            </Stack.Protected>
        </Stack>
    );
}

function AccessRoot() {
    const { users, loadFailed, reload } = useAccess();

    if (users === null) {
        return (
            <View style={styles.loading}>
                {loadFailed ? (
                    <View style={accessStyles.panel}>
                        <Text style={accessStyles.body}>Não foi possível carregar os usuários salvos.</Text>
                        <Action title="Tentar novamente" onPress={reload} />
                    </View>
                ) : (
                    <ActivityIndicator accessibilityLabel="Carregando usuários" color={colors.accent} />
                )}
            </View>
        );
    }

    return <AccessNavigator />;
}

export default function RootLayout() {
    return (
        <AccessProvider>
            <StatusBar style="light" />
            <AccessRoot />
        </AccessProvider>
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
        padding: 22, backgroundColor: colors.background,
    },
});
