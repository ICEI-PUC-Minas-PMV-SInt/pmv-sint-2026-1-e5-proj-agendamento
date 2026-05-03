import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

export default function BottomMenu({ active, navigation }) {
    return (
        <View style={styles.wrapper}>
            <View style={styles.container}>
                {[
                    { label: 'Agenda', route: 'Dashboard' },
                    { label: 'Clientes', route: 'Clientes' },
                    { label: 'Serviços', route: 'Services' },
                ].map((item) => {
                    const isActive = active === item.route;

                    return (
                        <TouchableOpacity
                            key={item.route}
                            style={styles.itemContainer}
                            onPress={() => navigation.navigate(item.route)}
                        >
                            {/* bolinha */}
                            {isActive && <View style={styles.dot} />}

                            <Text style={isActive ? styles.active : styles.item}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: 16,
        left: 0,
        right: 0,
        alignItems: 'center',
    },

    container: {
        width: '90%',
        maxWidth: 420, 
        height: 56,    
        backgroundColor: colors.white,
        borderRadius: 24,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',

        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 5,
    },

    itemContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    item: {
        fontSize: 12,
        color: colors.mutedText,
    },

    active: {
        fontSize: 12,
        color: colors.roseGold,
        fontWeight: '700',
    },

    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.roseGold,
        marginBottom: 4,
    },
});