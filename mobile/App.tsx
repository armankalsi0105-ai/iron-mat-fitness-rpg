import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import WebAppShell from './src/components/WebAppShell';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <WebAppShell />
    </SafeAreaProvider>
  );
}
