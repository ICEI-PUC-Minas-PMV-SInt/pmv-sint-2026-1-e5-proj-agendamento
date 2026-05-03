import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ServicesScreen from './src/screens/ServicesScreen';

const Stack = createNativeStackNavigator();

export default function App() {
    const [initialRoute, setInitialRoute] = useState(null);

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

    if (!initialRoute) {
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
            </Stack.Navigator>

            <StatusBar style="auto" />
        </NavigationContainer>
    );
}