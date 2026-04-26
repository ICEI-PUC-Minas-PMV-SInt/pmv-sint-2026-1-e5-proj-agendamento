import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
export default function AppButton({ title, onPress }) {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
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
    text: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
});