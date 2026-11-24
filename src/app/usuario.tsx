import { Stack, router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Action, FormPage, accessStyles } from '../components/access-ui';
import UserFields from '../components/user-fields';
import { useAccess } from '../state/access';

function returnToUsers() {
    if (router.canGoBack()) {
        router.back();
    } else {
        router.replace('/usuarios');
    }
}

export default function UserScreen() {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const { users, save } = useAccess();
    const user = users?.find(item => item.id === id);
    const title = id ? 'Editar usuário' : 'Novo usuário';

    return (
        <SafeAreaView style={styles.fill} edges={['bottom', 'left', 'right']}>
            <Stack.Screen options={{ title }} />
            <FormPage>
                <View style={accessStyles.panel}>
                    {id && !user ? (
                        <>
                            <Text accessibilityRole="alert" style={accessStyles.body}>Usuário não encontrado.</Text>
                            <Action title="Voltar à lista" onPress={returnToUsers} />
                        </>
                    ) : (
                        <UserFields key={user?.id ?? 'new'} user={user} manageRole
                            button={user ? 'Salvar alterações' : 'Cadastrar usuário'}
                            onSave={async input => {
                                await save(input, user?.id);
                                returnToUsers();
                            }} />
                    )}
                </View>
            </FormPage>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
