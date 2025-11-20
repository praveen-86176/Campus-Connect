import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabsParamList = {
  Home: undefined;
  Clubs: undefined;
  MyRsvps: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabsParamList>;
  EventsList: { clubId: string; clubName?: string };
  EventDetails: { eventId: string };
  RSVPForm: { eventId: string };
  QRScanner: undefined;
};
