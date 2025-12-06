import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { AppNotification } from '../types/Notification.types';
import {
  fetchUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  subscribeToNotifications,
} from '../services/notifications/notificationService';
import {
  registerForPushNotifications,
} from '../services/notifications/pushNotificationService';

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  // Initialize notifications
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Register for push notifications
    registerForPushNotifications(userId);

    // Load initial notifications
    loadNotifications();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToNotifications(userId, (newNotifications) => {
      setNotifications(newNotifications);
      updateUnreadCount(newNotifications);
      setLoading(false);
    });

    // Listen for notification received while app is open
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        loadNotifications(); // Refresh notifications
      }
    );

    // Listen for notification tapped
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification tapped:', response);
        const data = response.notification.request.content.data;
        // Handle navigation based on notification data
        handleNotificationTap(data);
      }
    );

    return () => {
      unsubscribe();
      if (notificationListener.current && typeof notificationListener.current.remove === 'function') {
        notificationListener.current.remove();
      }
      if (responseListener.current && typeof responseListener.current.remove === 'function') {
        responseListener.current.remove();
      }
    };
  }, [userId]);

  const loadNotifications = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const data = await fetchUserNotifications(userId);
      setNotifications(data);
      updateUnreadCount(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUnreadCount = (notificationList: AppNotification[]) => {
    const count = notificationList.filter((n) => !n.read).length;
    setUnreadCount(count);
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!userId) return;
    
    try {
      await markAllAsRead(userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationTap = (data: any) => {
    // Navigation will be handled by the component that uses this hook
    // This is just a placeholder
    if (data.eventId) {
      console.log('Navigate to event:', data.eventId);
    } else if (data.clubId) {
      console.log('Navigate to club:', data.clubId);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    refresh: loadNotifications,
    markAsRead: markNotificationAsRead,
    markAllAsRead: markAllNotificationsAsRead,
  };
}
