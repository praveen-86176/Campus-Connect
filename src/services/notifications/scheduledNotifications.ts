import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase.config';
import { scheduleNotification } from './pushNotificationService';
import { createNotification } from './notificationService';
import { DEFAULT_NOTIFICATION_PREFERENCES } from '../../types/NotificationPreferences.types';

/**
 * Schedule reminder notification 1 hour before event
 * Checks user preferences before scheduling
 */
export async function scheduleEventReminder(
  userId: string,
  eventId: string,
  eventName: string,
  eventDate: string,
  eventTime: string
): Promise<string | null> {
  try {
    // Check user's notification preferences
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const preferences = userData.notificationPreferences || DEFAULT_NOTIFICATION_PREFERENCES;
      
      // Don't schedule if user has disabled event reminders
      if (preferences.eventReminders === false) {
        console.log('User has disabled event reminders');
        return null;
      }
    }
    
    // Parse event datetime - handle different date formats
    let eventDateTime: Date;
    
    if (eventDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // YYYY-MM-DD format
      const timeStr = eventTime.match(/\d{1,2}:\d{2}/)?.[0] || '00:00';
      const [hours, minutes] = timeStr.split(':');
      eventDateTime = new Date(eventDate);
      eventDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    } else {
      // Try parsing as ISO string
      eventDateTime = new Date(`${eventDate}T${eventTime}`);
    }
    
    // Calculate 1 hour before
    const reminderTime = new Date(eventDateTime.getTime() - 60 * 60 * 1000);
    
    // Don't schedule if reminder time has passed
    if (reminderTime <= new Date()) {
      console.log('Event is too soon for reminder');
      return null;
    }

    // Schedule local notification
    const notificationId = await scheduleNotification(
      'Event Reminder 🔔',
      `Your event "${eventName}" starts in 1 hour!`,
      reminderTime,
      { eventId, type: 'event_reminder' }
    );

    return notificationId;
  } catch (error) {
    console.error('Error scheduling reminder:', error);
    return null;
  }
}

/**
 * Schedule reminders for all user's upcoming RSVPs
 */
export async function scheduleAllEventReminders(userId: string): Promise<void> {
  try {
    // Get all user's RSVPs
    const rsvpsRef = collection(db, 'rsvps');
    const q = query(
      rsvpsRef,
      where('userId', '==', userId)
    );

    const rsvpSnapshot = await getDocs(q);

    // Get event details for each RSVP
    const eventsRef = collection(db, 'events');
    const allEventsSnapshot = await getDocs(eventsRef);
    const eventsMap = new Map<string, any>();
    
    allEventsSnapshot.forEach((doc) => {
      eventsMap.set(doc.id, doc.data());
    });

    // Schedule reminders for each RSVP
    const promises = rsvpSnapshot.docs.map(async (rsvpDoc) => {
      const rsvpData = rsvpDoc.data();
      const eventId = rsvpData.eventId;
      const eventData = eventsMap.get(eventId);

      if (eventData && eventData.date && eventData.time) {
        await scheduleEventReminder(
          userId,
          eventId,
          eventData.title || 'Event',
          eventData.date,
          eventData.time
        );
      }
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('Error scheduling all reminders:', error);
  }
}

/**
 * Cancel reminder for specific event
 */
export async function cancelEventReminder(
  notificationId: string
): Promise<void> {
  try {
    const { cancelScheduledNotification } = await import('./pushNotificationService');
    await cancelScheduledNotification(notificationId);
  } catch (error) {
    console.error('Error canceling reminder:', error);
  }
}
