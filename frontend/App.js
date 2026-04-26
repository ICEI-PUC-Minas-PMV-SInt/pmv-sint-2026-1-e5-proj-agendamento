
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './src/screens/LoginScreen';

export default function App() {
    return (
        <View style={{ flex: 1 }}>
            <LoginScreen />
            <StatusBar style="auto" />
        </View>
    );
}


