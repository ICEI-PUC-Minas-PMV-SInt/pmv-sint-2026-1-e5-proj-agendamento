import { useState } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Button from '../components/Button';
import Input from '../components/Input';
import { colors } from '../theme/colors';
import { api } from '../services/api';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    async function handleLogin() {
        try {
            const data = await api.post('/Auth/login', {
                email,
                senha,
            });

            console.log('Login realizado:', data);

            const userName = data.nome || data.Nome;
            await AsyncStorage.setItem('token', data.token);

            navigation.replace('Services', { userName });
        } catch (error) {
            console.log(error.message);
            alert('E-mail ou senha inválidos.');
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
                />

                <Input
                    label="Senha"
                    placeholder="Digite sua senha"
                    value={senha}
                    onChangeText={setSenha}
                    secureTextEntry
                />

                <View style={{ marginTop: 16 }}>
                    <Button title="Entrar" onPress={handleLogin} />
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