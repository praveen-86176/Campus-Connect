import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { AdminDashboardHomeScreen } from '../screens/admin/AdminDashboardHomeScreen';
import { ClubsManagementScreen } from '../screens/admin/ClubsManagementScreen';
import { EventsManagementScreen } from '../screens/admin/EventsManagementScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CreateClubScreen } from '../screens/admin/CreateClubScreen';
import { EditClubScreen } from '../screens/admin/EditClubScreen';
import { ClubDetailsScreen } from '../screens/admin/ClubDetailsScreen';
import { CreateEventScreen } from '../screens/admin/CreateEventScreen';
import { EditEventScreen } from '../screens/admin/EditEventScreen';
import { EventDetailsScreen } from '../screens/EventDetailsScreen';
import { UserManagementScreen } from '../screens/admin/UserManagementScreen';
import { RSVPManagementScreen } from '../screens/admin/RSVPManagementScreen';
import { AnalyticsScreen } from '../screens/admin/AnalyticsScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { QRScannerScreen } from '../screens/QRScannerScreen';
import { AttendanceReportScreen } from '../screens/AttendanceReportScreen';
import { RecentActivityScreen } from '../screens/admin/RecentActivityScreen';
import { AdminTabsParamList, AdminStackParamList } from './types';

const Tab = createBottomTabNavigator<AdminTabsParamList>();
const Stack = createNativeStackNavigator<AdminStackParamList>();

const AdminTabs = () => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  return (
    <Tab.Navigator
      id="AdminTabs"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = 'home-outline';
          } else if (route.name === 'Clubs') {
            iconName = 'people-outline';
          } else if (route.name === 'Events') {
            iconName = 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={AdminDashboardHomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Clubs" component={ClubsManagementScreen} />
      <Tab.Screen name="Events" component={EventsManagementScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const AdminDashboardNavigator = () => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  return (
    <Stack.Navigator
      id="AdminStack"
      screenOptions={{
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        headerStyle: { backgroundColor: colors.primary },
      }}
    >
      <Stack.Screen name="AdminTabs" component={AdminTabs} options={{ headerShown: false }} />
      <Stack.Screen name="CreateClub" component={CreateClubScreen} options={{ title: 'Create Club' }} />
      <Stack.Screen name="EditClub" component={EditClubScreen} options={{ title: 'Edit Club' }} />
      <Stack.Screen name="ClubDetails" component={ClubDetailsScreen} options={{ title: 'Club Details' }} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} options={{ title: 'Create Event' }} />
      <Stack.Screen name="EditEvent" component={EditEventScreen} options={{ title: 'Edit Event' }} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} options={{ title: 'Event Details' }} />
      <Stack.Screen name="QRScanner" component={QRScannerScreen} options={{ title: 'Scan QR Code' }} />
      <Stack.Screen name="AttendanceReport" component={AttendanceReportScreen} options={{ title: 'Attendance Report' }} />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} options={{ title: 'User Management' }} />
      <Stack.Screen name="RSVPManagement" component={RSVPManagementScreen} options={{ title: 'RSVP Management' }} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Analytics & Reports' }} />
      <Stack.Screen name="RecentActivity" component={RecentActivityScreen} options={{ title: 'Recent Activity' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
    </Stack.Navigator>
  );
};
