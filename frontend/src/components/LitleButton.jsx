import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
export default function AppLitleButton({ title, onPress }) {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: colors.roseGold,
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 16,
        alignSelf: 'flex-start', 
    },
    text: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '500',
    },
});