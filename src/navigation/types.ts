import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabsParamList = {
  Home: undefined;
  Clubs: undefined;
  MyRsvps: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabsParamList>;
  EventsList: { clubId: string; clubName?: string };
  EventDetails: { eventId: string };
  RSVPForm: { eventId: string };
  RSVPQRCode: { rsvpId: string; eventId?: string };
  QRScanner: { eventId?: string };
  AttendanceReport: { eventId: string };
  Certificate: { eventId: string };
  EditProfile: undefined;
  Notifications: undefined;
};

export type AdminTabsParamList = {
  Home: undefined;
  Clubs: undefined;
  Events: undefined;
  Profile: undefined;
};

export type AdminStackParamList = {
  AdminTabs: NavigatorScreenParams<AdminTabsParamList>;
  CreateClub: undefined;
  EditClub: { clubId: string };
  ClubDetails: { clubId: string };
  CreateEvent: undefined;
  EditEvent: { eventId: string };
  EventDetails: { eventId: string };
  QRScanner: { eventId?: string };
  AttendanceReport: { eventId: string };
  UserManagement: undefined;
  RSVPManagement: undefined;
  Analytics: undefined;
  RecentActivity: undefined;
  EditProfile: undefined;
};
