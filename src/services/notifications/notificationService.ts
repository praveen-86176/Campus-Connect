import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../../config/firebase.config';
import { AppNotification, NotificationType } from '../../types/Notification.types';
import { shouldSendNotification } from './notificationPreferencesService';
import { DEFAULT_NOTIFICATION_PREFERENCES } from '../../types/NotificationPreferences.types';

/**
 * Create notification in Firestore
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  data?: any
): Promise<string> {
  try {
    const notificationsRef = collection(db, 'notifications');
    const docRef = await addDoc(notificationsRef, {
      userId,
      type,
      title,
      body,
      data: data || {},
      read: false,
      createdAt: new Date().toISOString(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new Error('Failed to create notification');
  }
}

/**
 * Fetch all notifications for a user
 */
export async function fetchUserNotifications(
  userId: string,
  limitCount: number = 50
): Promise<AppNotification[]> {
  try {
    const notificationsRef = collection(db, 'notifications');
    
    // Use simple query without orderBy to avoid index requirement
    // We'll sort in memory instead
    const q = query(
      notificationsRef,
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    const notifications: AppNotification[] = [];

    snapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data(),
      } as AppNotification);
    });

    // Sort by createdAt descending and limit
    const sorted = notifications.sort((a, b) => {
      try {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      } catch (error) {
        return 0;
      }
    });

    return sorted.slice(0, limitCount);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(userId: string): Promise<void> {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    const updates = snapshot.docs.map((doc) =>
      updateDoc(doc.ref, { read: true })
    );

    await Promise.all(updates);
  } catch (error) {
    console.error('Error marking all as read:', error);
  }
}

/**
 * Listen to real-time notifications
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notifications: AppNotification[]) => void
): Unsubscribe {
  const notificationsRef = collection(db, 'notifications');
  
  // Use simpler query without orderBy to avoid index requirement
  // We'll sort in memory
  const q = query(
    notificationsRef,
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const notifications: AppNotification[] = [];
    snapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data(),
      } as AppNotification);
    });
    
    // Sort by createdAt descending
    const sorted = notifications.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
    
    callback(sorted.slice(0, 50));
  }, (error) => {
    console.error('Error in notification subscription:', error);
    // Return empty array on error
    callback([]);
  });
}

/**
 * Send notification to all students when new event is created
 * Respects user notification preferences
 */
export async function notifyNewEvent(
  eventId: string,
  eventName: string
): Promise<void> {
  try {
    // Get all student users
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'student'));
    const snapshot = await getDocs(q);

    // Create notification for each student who has preferences enabled
    const promises = snapshot.docs.map(async (userDoc) => {
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      // Check user's notification preferences
      const preferences = userData.notificationPreferences || DEFAULT_NOTIFICATION_PREFERENCES;
      const shouldSend = preferences.newEvents !== false; // Default to true if not set
      
      if (shouldSend) {
        await createNotification(
          userId,
          'new_event',
          'New Event Created! 🎉',
          `Check out the new event: ${eventName}`,
          { eventId }
        );
      }
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('Error notifying new event:', error);
  }
}

/**
 * Send notification to all students when new club is created
 * Respects user notification preferences
 */
export async function notifyNewClub(
  clubId: string,
  clubName: string
): Promise<void> {
  try {
    // Get all student users
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'student'));
    const snapshot = await getDocs(q);

    // Create notification for each student who has preferences enabled
    const promises = snapshot.docs.map(async (userDoc) => {
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      // Check user's notification preferences
      const preferences = userData.notificationPreferences || DEFAULT_NOTIFICATION_PREFERENCES;
      const shouldSend = preferences.newClubs !== false; // Default to true if not set
      
      if (shouldSend) {
        await createNotification(
          userId,
          'new_club',
          'New Club Available! 🎊',
          `A new club has been created: ${clubName}`,
          { clubId }
        );
      }
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('Error notifying new club:', error);
  }
}
