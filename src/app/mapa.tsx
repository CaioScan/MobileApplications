import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Action, FormError, accessStyles, colors } from '../components/access-ui';
import PointDialog, { type PointSelection } from '../components/point-dialog';
import PointMap from '../components/point-map';
import { placeKey, type Coordinates, type Place } from '../models/place';
import { can, roleLabels, type User } from '../models/user';
import * as repository from '../services/place.repo';
import { useAccess } from '../state/access';

export default function MapScreen() {
    const { currentUser, signOut } = useAccess();
    if (!currentUser) return null;
    return <Points key={currentUser.id} user={currentUser} signOut={signOut} />;
}

function Points({ user, signOut }: { user: User; signOut: () => void }) {
    const [places, setPlaces] = useState<Place[] | null>(null);
    const [selection, setSelection] = useState<PointSelection>();
    const [picking, setPicking] = useState(false);
    const [center, setCenter] = useState<Coordinates>();
    const [loadError, setLoadError] = useState(false);
    const [locationError, setLocationError] = useState('');
    const [locating, setLocating] = useState(false);
    const canAdd = can(user.role, 'addPoint');
    const canDelete = can(user.role, 'deletePoint');

    const load = useCallback(() => repository.getPlaces(user.id).then(result => {
        setPlaces(result);
        setLoadError(false);
    }, () => setLoadError(true)), [user.id]);

    useEffect(() => {
        void load();
    }, [load]);

    const select = useCallback((place: Place) => {
        setSelection({ kind: 'existing', place });
    }, []);

    const pick = useCallback((coordinates: Coordinates) => {
        setPicking(false);
        setSelection({ kind: 'new', coordinates });
    }, []);

    function recenter({ latitude, longitude }: Coordinates) {
        setCenter({ latitude, longitude });
        setSelection(undefined);
    }

    async function locate() {
        setLocating(true);
        setLocationError('');
        try {
            const permission = await Location.requestForegroundPermissionsAsync();
            if (!permission.granted) {
                setLocationError('Permita o acesso à localização para centralizar o mapa.');
                return;
            }
            const { coords } = await Location.getCurrentPositionAsync({});
            recenter(coords);
        } catch {
            setLocationError('Não foi possível obter sua localização.');
        } finally {
            setLocating(false);
        }
    }

    const choosingPoint = picking && canAdd;

    return (
        <SafeAreaView style={styles.fill} edges={['bottom', 'left', 'right']}>
            <ScrollView contentContainerStyle={styles.column}>
                <View style={styles.account}>
                    <View style={styles.accountName}>
                        <Text style={styles.name}>{user.name}</Text>
                        <Text style={styles.role}>{roleLabels[user.role]}</Text>
                    </View>
                    <Action title="Sair" secondary onPress={signOut} />
                </View>
                <View style={styles.map}>
                    <PointMap places={places ?? []} center={center} onSelect={select}
                        onPick={choosingPoint ? pick : undefined} />
                </View>
                {choosingPoint && (
                    <Text accessibilityLiveRegion="polite" style={accessStyles.body}>
                        Toque no mapa para marcar o local do novo ponto.
                    </Text>
                )}
                <View style={styles.actions}>
                    {canAdd && places !== null && (
                        <View style={styles.primary}>
                            <Action title={choosingPoint ? 'Cancelar seleção' : 'Adicionar ponto'}
                                onPress={() => setPicking(!choosingPoint)} />
                        </View>
                    )}
                    <Action title="Minha localização" secondary busy={locating} onPress={locate} />
                </View>
                <FormError message={locationError} />
                {can(user.role, 'manageUsers') && (
                    <Action title="Gerenciar usuários" secondary onPress={() => router.push('/usuarios')} />
                )}
                <View style={styles.points}>
                    <Text accessibilityRole="header" style={accessStyles.title}>Pontos cadastrados</Text>
                    {loadError ? (
                        <>
                            <FormError message="Não foi possível carregar os pontos." />
                            <Action title="Tentar novamente" secondary onPress={load} />
                        </>
                    ) : places === null ? (
                        <ActivityIndicator accessibilityLabel="Carregando pontos" color={colors.accent} />
                    ) : places.length === 0 ? (
                        <Text style={accessStyles.body}>Nenhum ponto cadastrado.</Text>
                    ) : places.map(place => (
                        <Pressable accessibilityRole="button" accessibilityLabel={`Ver ponto ${place.name}`}
                            key={placeKey(place)} onPress={() => select(place)}
                            style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                            <View style={styles.accountName}>
                                <Text style={styles.name}>{place.name}</Text>
                                {!!place.description && (
                                    <Text numberOfLines={2} style={accessStyles.body}>{place.description}</Text>
                                )}
                            </View>
                            <Text style={styles.role}>Ver detalhes</Text>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
            {selection && (
                <PointDialog
                    selection={selection}
                    onClose={() => setSelection(undefined)}
                    onLocate={recenter}
                    onSave={async place => setPlaces(await repository.addPlace(user.id, place))}
                    onDelete={canDelete ? async point => setPlaces(await repository.deletePlace(user.id, point)) : undefined}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    fill: { flex: 1 },
    column: { ...accessStyles.column, maxWidth: 760, gap: 12 },
    account: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
    accountName: { gap: 4, flex: 1 },
    name: { color: colors.ink, fontWeight: '700', fontSize: 16 },
    role: { color: colors.accent, fontWeight: '600', fontSize: 14 },
    map: { height: 310, borderRadius: 16, overflow: 'hidden', backgroundColor: '#E0DDEB' },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
    primary: { flexGrow: 1 },
    points: { gap: 12, marginTop: 8 },
    row: {
        padding: 15, backgroundColor: colors.surface, borderRadius: 12, minHeight: 56,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10,
    },
    pressed: { opacity: 0.75 },
});
