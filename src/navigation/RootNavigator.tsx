import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { CampusDataProvider } from '../context/CampusDataContext';
import { EventDetailsScreen } from '../screens/EventDetailsScreen';
import { EventsListScreen } from '../screens/EventsListScreen';
import { QRScannerScreen } from '../screens/QRScannerScreen';
import { RSVPFormScreen } from '../screens/RSVPFormScreen';
import { AttendanceReportScreen } from '../screens/AttendanceReportScreen';
import { CertificateScreen } from '../screens/CertificateScreen';
import { MainTabs } from './MainTabs';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/')],
  config: {
    screens: {
      MainTabs: {
        screens: {
          Home: 'home',
          Clubs: 'clubs',
          MyRsvps: 'rsvps',
        },
      },
      EventsList: 'clubs/:clubId/events',
      EventDetails: 'events/:eventId',
      RSVPForm: 'events/:eventId/rsvp',
      QRScanner: 'qr',
      AttendanceReport: 'events/:eventId/attendance',
      Certificate: 'events/:eventId/certificate',
    },
  },
};

export const RootNavigator = () => (
  <CampusDataProvider>
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
          headerBackground: () => (
            <LinearGradient
              colors={[Colors.primary, '#6FB3F0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1 }}
            />
          ),
        }}
      >
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
        <Stack.Screen name="AttendanceReport" component={AttendanceReportScreen} options={{ title: 'Attendance' }} />
        <Stack.Screen name="Certificate" component={CertificateScreen} options={{ title: 'Certificate' }} />
      </Stack.Navigator>
    </NavigationContainer>
  </CampusDataProvider>
);
