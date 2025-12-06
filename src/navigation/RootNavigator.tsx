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
import { RSVPFormScreen } from '../screens/RSVPFormScreen';
import { RSVPQRCodeScreen } from '../screens/RSVPQRCodeScreen';
import { AttendanceReportScreen } from '../screens/AttendanceReportScreen';
import { CertificateScreen } from '../screens/CertificateScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { QRScannerScreen } from '../screens/QRScannerScreen';
import { MainTabs } from './MainTabs';
import { AuthStack } from './AuthStack';
import { AdminNavigator } from './AdminNavigator';
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
        user.role === 'admin' || user.role === 'developer' ? (
          <AdminNavigator />
        ) : (
          // User is signed in as student - show main app
          <Stack.Navigator
            id="RootStack"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen
              name="EventsList"
              component={EventsListScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="EventDetails"
              component={EventDetailsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="RSVPForm" component={RSVPFormScreen} options={{ headerShown: false }} />
            <Stack.Screen name="RSVPQRCode" component={RSVPQRCodeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="AttendanceReport" component={AttendanceReportScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Certificate" component={CertificateScreen} options={{ headerShown: false }} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="QRScanner" component={QRScannerScreen} options={{ headerShown: false }} />
          </Stack.Navigator>
        )
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
