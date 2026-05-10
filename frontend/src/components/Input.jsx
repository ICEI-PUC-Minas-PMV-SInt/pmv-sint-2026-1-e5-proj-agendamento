import { Text, TextInput, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

export default function AppInput({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    keyboardType = 'default',
    multiline = false,
    error,
    ...rest
}) {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            <TextInput
                style={[styles.input, multiline && styles.multiline, error && styles.inputError]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.mutedText}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                multiline={multiline}
                {...rest}
            />

            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 14,
    },
    label: {
        fontSize: 14,
        color: colors.text,
        marginBottom: 6,
        fontWeight: '500',
    },
    input: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: colors.text,
    },
    multiline: {
        minHeight: 90,
        textAlignVertical: 'top',
    },
    inputError: {
        borderColor: '#D32F2F',
    },
    error: {
        marginTop: 4,
        fontSize: 12,
        color: '#D32F2F',
    },
});