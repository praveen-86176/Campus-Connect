import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Event } from '../types';
import { navigateToEventDetails } from '../navigation/navigationRef';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const initNotifications = async () => {
  const settings = await Notifications.getPermissionsAsync();
  if (!settings.granted) {
    await Notifications.requestPermissionsAsync();
  }

  Notifications.addNotificationResponseReceivedListener((response) => {
    const eventId = response.notification.request.content.data?.eventId as string | undefined;
    if (eventId) {
      navigateToEventDetails(eventId);
    }
  });
};

const parseEventDateTime = (event: Event): Date | null => {
  try {
    const [timeStr, meridiem] = event.time.split(' ');
    const [hStr, mStr] = timeStr.split(':');
    let hour = parseInt(hStr, 10);
    const minute = parseInt(mStr, 10);
    const isPM = meridiem?.toUpperCase() === 'PM';
    if (isPM && hour < 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
    const date = new Date(event.date);
    date.setHours(hour, minute, 0, 0);
    return date;
  } catch {
    return null;
  }
};

export const scheduleEventReminders = async (event: Event, userId: string) => {
  const eventDate = parseEventDateTime(event);
  if (!eventDate) return;

  const oneDayBefore = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);
  const oneHourBefore = new Date(eventDate.getTime() - 60 * 60 * 1000);

  const now = new Date();
  const identifiers = {
    day: `event-${event.id}-${userId}-day`,
    hour: `event-${event.id}-${userId}-hour`,
  };

  try {
    if (oneDayBefore > now) {
      await Notifications.scheduleNotificationAsync({
        identifier: identifiers.day,
        content: {
          title: 'Event tomorrow',
          body: `${event.title} at ${event.time} • ${event.location}`,
          data: { eventId: event.id },
        },
        trigger: { date: oneDayBefore },
      } as any);
    }

    if (oneHourBefore > now) {
      await Notifications.scheduleNotificationAsync({
        identifier: identifiers.hour,
        content: {
          title: 'Event in 1 hour',
          body: `${event.title} • Get ready to attend`,
          data: { eventId: event.id },
        },
        trigger: { date: oneHourBefore },
      } as any);
    }
  } catch (e) {
    // noop
  }
};