export type Club = {
  id: string;
  name: string;
  description: string;
  logo: string;
  memberCount: number;
};

export type Event = {
  id: string;
  clubId: string;
  title: string;
  description: string;
  date: string; // ISO date string
  time: string;
  location: string;
  capacity: number;
  rsvpCount: number;
};

export type RSVP = {
  id: string;
  userId: string;
  eventId: string;
  userName: string;
  email: string;
  phone: string;
  timestamp: string;
  attended: boolean;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
};

export type FilterType = 'upcoming' | 'past' | 'all';

export type AttendanceRecord = {
  eventId: string;
  userId: string;
  checkInAt?: string;
  checkOutAt?: string;
};

export type AttendanceStatus = 'absent' | 'checked_in' | 'checked_out';
