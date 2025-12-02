import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';

export default function App() {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      const ErrorUtils: any = (global as any).ErrorUtils;
      if (ErrorUtils && typeof ErrorUtils.setGlobalHandler === 'function') {
        ErrorUtils.setGlobalHandler((error: unknown) => {
          console.error('Global error', error);
        });
      }
      return () => { };
    }
    if (typeof window !== 'undefined') {
      const handler = (e: ErrorEvent) => console.error('Global web error', e.error ?? e.message);
      window.addEventListener('error', handler);
      return () => window.removeEventListener('error', handler);
    }
    return () => { };
  }, []);
  return (
    <ErrorBoundary>
      <StatusBar style="dark" />
      <RootNavigator />
    </ErrorBoundary>
  );
}
