import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { CampusDataProvider } from '../context/CampusDataContext';
import { EventDetailsScreen } from '../screens/EventDetailsScreen';
import { EventsListScreen } from '../screens/EventsListScreen';
import { QRScannerScreen } from '../screens/QRScannerScreen';
import { RSVPFormScreen } from '../screens/RSVPFormScreen';
import { MainTabs } from './MainTabs';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => (
  <CampusDataProvider>
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="EventsList"
          component={EventsListScreen}
          options={({ route }) => ({ title: route.params.clubName ?? 'Events' })}
        />
        <Stack.Screen
          name="EventDetails"
          component={EventDetailsScreen}
          options={{ title: 'Event Details' }}
        />
        <Stack.Screen name="RSVPForm" component={RSVPFormScreen} options={{ title: 'RSVP' }} />
        <Stack.Screen name="QRScanner" component={QRScannerScreen} options={{ title: 'Scan QR' }} />
      </Stack.Navigator>
    </NavigationContainer>
  </CampusDataProvider>
);
