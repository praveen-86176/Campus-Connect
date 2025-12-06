export type NotificationType = 
  | 'new_event' 
  | 'new_club' 
  | 'event_reminder' 
  | 'event_update' 
  | 'rsvp_confirmed'
  | 'event_completed_attended'
  | 'event_completed_absent';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: {
    eventId?: string;
    clubId?: string;
    [key: string]: any;
  };
  read: boolean;
  createdAt: string;
}

export interface PushNotificationToken {
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  createdAt: string;
  updatedAt: string;
}
