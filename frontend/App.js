import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts, BodoniModa_400Regular, BodoniModa_700Bold } from '@expo-google-fonts/bodoni-moda';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ServicesScreen from './src/screens/ServicesScreen';
import ClientsScreen from './src/screens/ClientsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
    const [initialRoute, setInitialRoute] = useState(null);
    const [fontsLoaded] = useFonts({
        BodoniModa_400Regular,
        BodoniModa_700Bold,
    });

    useEffect(() => {
        async function verificarLogin() {
            const token = await AsyncStorage.getItem('token');

            if (token) {
                setInitialRoute('Services');
            } else {
                setInitialRoute('Login');
            }
        }

        verificarLogin();
    }, []);

    if (!initialRoute || !fontsLoaded) {
        return null;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={initialRoute}
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Services" component={ServicesScreen} />
                <Stack.Screen name="Dashboard" component={DashboardScreen} />
                <Stack.Screen name="Clientes" component={ClientsScreen} />
            </Stack.Navigator>

            <StatusBar style="auto" />
        </NavigationContainer>
    );
}