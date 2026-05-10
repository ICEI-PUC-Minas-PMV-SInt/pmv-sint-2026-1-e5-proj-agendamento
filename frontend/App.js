import { StatusBar } from 'expo-status-bar';
import { useFonts, BodoniModa_400Regular, BodoniModa_700Bold } from '@expo-google-fonts/bodoni-moda';

import { AuthProvider } from './src/contexts/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  const [fontsLoaded] = useFonts({
    BodoniModa_400Regular,
    BodoniModa_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <RootNavigator />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
