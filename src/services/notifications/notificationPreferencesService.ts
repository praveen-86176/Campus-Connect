import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase.config';
import { NotificationPreferences, DEFAULT_NOTIFICATION_PREFERENCES } from '../../types/NotificationPreferences.types';

/**
 * Get notification preferences for a user
 */
export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const prefs = userData.notificationPreferences;

      if (prefs) {
        return {
          eventReminders: prefs.eventReminders ?? DEFAULT_NOTIFICATION_PREFERENCES.eventReminders,
          newEvents: prefs.newEvents ?? DEFAULT_NOTIFICATION_PREFERENCES.newEvents,
          newClubs: prefs.newClubs ?? DEFAULT_NOTIFICATION_PREFERENCES.newClubs,
          eventUpdates: prefs.eventUpdates ?? DEFAULT_NOTIFICATION_PREFERENCES.eventUpdates,
          weeklyDigest: prefs.weeklyDigest ?? DEFAULT_NOTIFICATION_PREFERENCES.weeklyDigest,
        };
      }
    }

    return DEFAULT_NOTIFICATION_PREFERENCES;
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

/**
 * Update notification preferences for a user
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', userId);
    
    // Get current preferences
    const currentPrefs = await getNotificationPreferences(userId);
    
    // Merge with new preferences
    const updatedPrefs: NotificationPreferences = {
      ...currentPrefs,
      ...preferences,
    };

    await updateDoc(userDocRef, {
      notificationPreferences: updatedPrefs,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw new Error('Failed to update notification preferences');
  }
}

/**
 * Check if user has preference enabled for a notification type
 */
export async function shouldSendNotification(
  userId: string,
  notificationType: 'event_reminder' | 'new_event' | 'new_club' | 'event_update'
): Promise<boolean> {
  try {
    const preferences = await getNotificationPreferences(userId);

    switch (notificationType) {
      case 'event_reminder':
        return preferences.eventReminders;
      case 'new_event':
        return preferences.newEvents;
      case 'new_club':
        return preferences.newClubs;
      case 'event_update':
        return preferences.eventUpdates;
      default:
        return true; // Default to sending if preference not found
    }
  } catch (error) {
    console.error('Error checking notification preference:', error);
    return true; // Default to sending on error
  }
}
