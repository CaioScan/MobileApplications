import type { ReactNode } from 'react';
import {
    ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView,
    StyleSheet, Text, TextInput, View, type TextInputProps,
} from 'react-native';

export const colors = {
    background: '#F2EFF8',
    surface: '#FFFFFF',
    ink: '#27213C',
    muted: '#5E586D',
    accent: '#5942A3',
    dark: '#302357',
    border: '#D7CFE4',
    danger: '#963250',
};

export const accessStyles = StyleSheet.create({
    column: { width: '100%', maxWidth: 520, alignSelf: 'center', padding: 22, gap: 20 },
    panel: { backgroundColor: colors.surface, borderRadius: 18, padding: 20, gap: 16 },
    title: { color: colors.ink, fontSize: 29, fontWeight: '800', letterSpacing: -0.7 },
    body: { color: colors.muted, fontSize: 15, lineHeight: 22 },
});

export function FormPage({ children }: { children: ReactNode }) {
    return (
        <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={accessStyles.column} keyboardShouldPersistTaps="handled">
                {children}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                accessibilityLabel={label}
                placeholderTextColor={colors.muted}
                selectionColor={colors.accent}
                autoCorrect={false}
                {...props}
                style={styles.input}
            />
        </View>
    );
}

export function Action({
    title, onPress, busy = false, secondary = false, danger = false,
}: {
    title: string;
    onPress: () => void;
    busy?: boolean;
    secondary?: boolean;
    danger?: boolean;
}) {
    return (
        <Pressable
            accessibilityLabel={title}
            accessibilityRole="button"
            accessibilityState={{ busy, disabled: busy }}
            disabled={busy}
            onPress={onPress}
            style={({ pressed }) => [
                styles.action, secondary && styles.secondary, danger && styles.danger,
                (pressed || busy) && styles.dimmed,
            ]}
        >
            {busy && <ActivityIndicator size="small" color={secondary ? colors.accent : colors.surface} />}
            <Text style={[styles.actionText, secondary && styles.secondaryText]}>{title}</Text>
        </Pressable>
    );
}

export function FormError({ message }: { message: string }) {
    if (!message) return null;
    return <Text accessibilityRole="alert" style={styles.error}>{message}</Text>;
}

const styles = StyleSheet.create({
    fill: { flex: 1 },
    field: { gap: 6 },
    label: { color: colors.ink, fontSize: 14, fontWeight: '600' },
    input: {
        color: colors.ink, fontSize: 16, minHeight: 48, paddingHorizontal: 12,
        borderWidth: 1, borderColor: colors.border, borderRadius: 9, backgroundColor: colors.surface,
    },
    action: {
        alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
        minHeight: 48, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 9,
        backgroundColor: colors.accent,
    },
    secondary: { backgroundColor: colors.background },
    danger: { backgroundColor: colors.danger },
    dimmed: { opacity: 0.75 },
    actionText: { color: colors.surface, fontSize: 15, fontWeight: '700', textAlign: 'center' },
    secondaryText: { color: colors.accent },
    error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
});
