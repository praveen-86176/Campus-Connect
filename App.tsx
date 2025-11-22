import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useEffect } from 'react';
import { initNotifications } from './src/services/notifications';

export default function App() {
  useEffect(() => {
    initNotifications();
  }, []);
  return (
    <>
      <StatusBar style="dark" />
      <RootNavigator />
    </>
  );
}
