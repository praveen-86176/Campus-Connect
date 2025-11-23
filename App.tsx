import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
      (async () => {
        const settings = await Notifications.getPermissionsAsync();
        if (!settings.granted) {
          await Notifications.requestPermissionsAsync();
        }
      })();
      const sub = Notifications.addNotificationReceivedListener(() => {});
      const sub2 = Notifications.addNotificationResponseReceivedListener(() => {});
      return () => {
        sub.remove();
        sub2.remove();
      };
    }
    return () => {};
  }, []);
  return (
    <>
      <StatusBar style="dark" />
      <RootNavigator />
    </>
  );
}
