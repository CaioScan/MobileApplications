import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Action, accessStyles, colors } from '../components/access-ui';
import { roleLabels } from '../models/user';
import { useAccess } from '../state/access';

export default function UsersScreen() {
    const { users } = useAccess();

    return (
        <SafeAreaView style={styles.fill} edges={['bottom', 'left', 'right']}>
            <FlatList
                contentContainerStyle={accessStyles.column}
                data={users ?? []}
                keyExtractor={user => user.id}
                ListHeaderComponent={
                    <Action title="Novo usuário" onPress={() => router.push('/usuario')} />
                }
                ListEmptyComponent={<Text style={accessStyles.body}>Nenhum usuário cadastrado.</Text>}
                renderItem={({ item }) => (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Editar ${item.name}, login ${item.login}`}
                        onPress={() => router.push({ pathname: '/usuario', params: { id: item.id } })}
                        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                    >
                        <View style={styles.profile}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={accessStyles.body}>{item.login}</Text>
                            <Text style={styles.role}>{roleLabels[item.role]}</Text>
                        </View>
                        <Text style={styles.edit}>Editar</Text>
                    </Pressable>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    fill: { flex: 1 },
    role: { color: colors.accent, fontWeight: '600', fontSize: 13 },
    row: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 16, gap: 16, borderRadius: 12, backgroundColor: colors.surface,
    },
    pressed: { opacity: 0.75 },
    profile: { flex: 1, gap: 3 },
    name: { color: colors.ink, fontWeight: '700', fontSize: 16 },
    edit: { color: colors.accent, fontWeight: '700', fontSize: 14 },
});
