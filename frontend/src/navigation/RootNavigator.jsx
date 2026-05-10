import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ServicesScreen from '../screens/ServicesScreen';
import ClientsScreen from '../screens/ClientsScreen';
import ClientProfileScreen from '../screens/ClientProfileScreen';
import AgendamentosScreen from '../screens/AgendamentosScreen';
import AgendamentoDetailScreen from '../screens/AgendamentoDetailScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.roseGold} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {usuario ? (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Agendamentos" component={AgendamentosScreen} />
            <Stack.Screen name="AgendamentoDetail" component={AgendamentoDetailScreen} />
            <Stack.Screen name="Clientes" component={ClientsScreen} />
            <Stack.Screen name="ClientProfile" component={ClientProfileScreen} />
            <Stack.Screen name="Services" component={ServicesScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
