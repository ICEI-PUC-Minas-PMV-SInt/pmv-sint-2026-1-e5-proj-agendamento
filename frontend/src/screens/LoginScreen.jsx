import { useState } from 'react';
import { View, StyleSheet, Text, Image, Platform, Alert } from 'react-native';

import Button from '../components/Button';
import Input from '../components/Input';
import { colors } from '../theme/colors';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [submitting, setSubmitting] = useState(false);

    function notify(msg) {
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('Atenção', msg);
    }

    async function handleLogin() {
        if (!email || !senha) {
            notify('Informe e-mail e senha.');
            return;
        }
        setSubmitting(true);
        try {
            await signIn(email, senha);
        } catch (error) {
            notify('E-mail ou senha inválidos.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image
                    source={require('../../assets/logo-ivinah.png')}
                    style={styles.logoImage}
                />
            </View>

            <Text style={styles.logo}>Lash Designer</Text>
            <Text style={styles.subtitle}>Ivinah Sousa</Text>

            <View style={styles.card}>
                <Text style={styles.title}>Bem-vinda de volta</Text>

                <Input
                    label="E-mail"
                    placeholder="seu@email.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <Input
                    label="Senha"
                    placeholder="Digite sua senha"
                    value={senha}
                    onChangeText={setSenha}
                    secureTextEntry
                />

                <View style={{ marginTop: 16 }}>
                    <Button title={submitting ? 'Entrando...' : 'Entrar'} onPress={handleLogin} disabled={submitting} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.background,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    logo: {
        fontSize: 26,
        fontWeight: '600',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 24,
        color: '#999',
        letterSpacing: 1,
    },
    title: {
        fontSize: 18,
        marginBottom: 16,
    },
    logoImage: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    header: {
        width: 150,
        height: 150,
        backgroundColor: colors.black,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 75,
        marginBottom: 20,
    },
});
