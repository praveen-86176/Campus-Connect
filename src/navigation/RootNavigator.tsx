import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { View, Platform, ActivityIndicator } from 'react-native';
import * as Linking from 'expo-linking';
import { CampusDataProvider } from '../context/CampusDataContext';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { EventDetailsScreen } from '../screens/EventDetailsScreen';
import { EventsListScreen } from '../screens/EventsListScreen';
import { QRScannerScreen } from '../screens/QRScannerScreen';
import { RSVPFormScreen } from '../screens/RSVPFormScreen';
import { AttendanceReportScreen } from '../screens/AttendanceReportScreen';
import { CertificateScreen } from '../screens/CertificateScreen';
import { MainTabs } from './MainTabs';
import { AuthStack } from './AuthStack';
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

// Navigation component that uses auth state
const Navigation = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer
      linking={linking}
      onStateChange={() => {
        if (Platform.OS === 'web') {
          const el = (document.activeElement as HTMLElement | null);
          if (el && typeof el.blur === 'function') {
            el.blur();
          }
        }
      }}
    >
      {user ? (
        // User is signed in - show main app
        <Stack.Navigator
          screenOptions={{
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '700' },
            headerBackground: () => <View style={{ flex: 1, backgroundColor: Colors.primary }} />,
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
      ) : (
        // User is not signed in - show auth screens
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

export const RootNavigator = () => (
  <ThemeProvider>
    <AuthProvider>
      <CampusDataProvider>
        <Navigation />
      </CampusDataProvider>
    </AuthProvider>
  </ThemeProvider>
);
