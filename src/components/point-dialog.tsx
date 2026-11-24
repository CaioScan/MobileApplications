import { useState } from 'react';
import {
    Image, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';

import { defaultPlaceType, placeTypeLabels, placeTypes, type Coordinates, type Place, type PlaceType } from '../models/place';
import { Action, Field, FormError, accessStyles, colors } from './access-ui';
import { pointPinImages } from './point-pins';

export type PointSelection =
    | { kind: 'new'; coordinates: Coordinates }
    | { kind: 'existing'; place: Place };

export default function PointDialog({ selection, onClose, onSave, onDelete, onLocate }: {
    selection: PointSelection;
    onClose: () => void;
    onSave: (place: Place) => Promise<void>;
    onDelete?: (point: Coordinates) => Promise<void>;
    onLocate: (coordinates: Coordinates) => void;
}) {
    const [name, setName] = useState('');
    const [type, setType] = useState<PlaceType>(defaultPlaceType);
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const existing = selection.kind === 'existing' ? selection.place : undefined;
    const coordinates = selection.kind === 'new' ? selection.coordinates : selection.place;

    async function submit(action: () => Promise<void>) {
        if (busy) return;
        Keyboard.dismiss();
        setBusy(true);
        setError('');
        try {
            await action();
            onClose();
        } catch (failure) {
            setError(failure instanceof Error ? failure.message : 'Não foi possível concluir a ação.');
        } finally {
            setBusy(false);
        }
    }

    function close() {
        if (busy) return;
        if (confirming) {
            setConfirming(false);
            setError('');
        } else {
            onClose();
        }
    }

    return (
        <Modal transparent animationType="fade" onRequestClose={close}>
            <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.center} keyboardShouldPersistTaps="handled">
                    <View accessibilityViewIsModal style={accessStyles.panel}>
                        <Text accessibilityRole="header" style={accessStyles.title}>
                            {confirming ? 'Excluir ponto?' : existing?.name ?? 'Novo ponto'}
                        </Text>
                        <Text style={accessStyles.body}>
                            {confirming
                                ? `“${existing?.name}” será removido do mapa.`
                                : `${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}`}
                        </Text>
                        {selection.kind === 'new' && (
                            <>
                                <Field label="Nome do ponto" value={name} onChangeText={setName} editable={!busy} />
                                <Field label="Descrição (opcional)" value={description}
                                    onChangeText={setDescription} multiline editable={!busy} />

                                <View style={styles.typeField} accessibilityRole="radiogroup" accessibilityLabel="Tipo de ponto">
                                    <Text style={styles.typeLabel}>Tipo de ponto</Text>
                                    <View style={styles.typeOptions}>
                                        {placeTypes.map(option => (
                                            <Pressable key={option} accessibilityRole="radio"
                                                accessibilityLabel={placeTypeLabels[option]} aria-checked={type === option}
                                                disabled={busy} onPress={() => setType(option)}
                                                style={[styles.typeOption, option === type && styles.activeType]}>
                                                <Image source={pointPinImages[option]} style={styles.pin} resizeMode="contain" />
                                                <Text style={styles.optionLabel}>{placeTypeLabels[option]}</Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>
                                <Action title="Salvar ponto" busy={busy} onPress={() => submit(() =>
                                    onSave({ ...coordinates, name, description, type }))} />
                            </>
                        )}
                        {existing && !confirming && (
                            <>
                                <View style={styles.typeDetail}>
                                    <Image source={pointPinImages[existing.type]} style={styles.pin} resizeMode="contain" />
                                    <Text style={styles.typeLabel}>{placeTypeLabels[existing.type]}</Text>
                                </View>
                                {!!existing.description && <Text style={accessStyles.body}>{existing.description}</Text>}
                                <Action title="Mostrar no mapa" onPress={() => onLocate(existing)} />
                            </>
                        )}
                        {existing && onDelete && (
                            confirming
                                ? <Action title="Confirmar exclusão" danger busy={busy}
                                    onPress={() => submit(() => onDelete(existing))} />
                                : <Action title="Excluir ponto" danger onPress={() => setConfirming(true)} />
                        )}
                        <FormError message={error} />
                        <Action title={existing && !confirming ? 'Fechar' : 'Cancelar'}
                            secondary busy={busy} onPress={close} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    typeField: { gap: 7 },
    typeLabel: { color: colors.ink, fontSize: 14, fontWeight: '600' },
    typeOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    typeOption: {
        flexBasis: '46%', flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 4,
        minWidth: 110, minHeight: 62, padding: 6, borderWidth: 1, borderColor: colors.border, borderRadius: 8,
    },
    optionLabel: { color: colors.ink, fontSize: 13, fontWeight: '600', textAlign: 'center' },
    activeType: { borderColor: colors.accent, backgroundColor: colors.background },
    pin: { width: 21, height: 25 },
    typeDetail: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    backdrop: { flex: 1, backgroundColor: '#21183999' },
    center: { flexGrow: 1, justifyContent: 'center', alignSelf: 'center', width: '100%', maxWidth: 500, padding: 22 },
});
