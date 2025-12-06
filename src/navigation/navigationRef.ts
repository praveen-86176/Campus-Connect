import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const navigateToEventDetails = (eventId: string) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate('EventDetails', { eventId });
  }
};