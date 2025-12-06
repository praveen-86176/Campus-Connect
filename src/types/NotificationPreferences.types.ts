export interface NotificationPreferences {
  eventReminders: boolean;    // 1 hour before event reminders
  newEvents: boolean;         // Notifications when new events are created
  newClubs: boolean;          // Notifications when new clubs are created
  eventUpdates: boolean;      // Notifications for event changes
  weeklyDigest: boolean;      // Weekly summary of events
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  eventReminders: true,
  newEvents: true,
  newClubs: true,
  eventUpdates: true,
  weeklyDigest: false,
};
