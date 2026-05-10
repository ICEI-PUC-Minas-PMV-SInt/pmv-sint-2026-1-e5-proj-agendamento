import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function AppButton({ title, onPress, disabled }) {
    return (
        <TouchableOpacity
            style={[styles.button, disabled && styles.disabled]}
            onPress={onPress}
            disabled={disabled}
        >
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: colors.black,
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 16,
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
});
