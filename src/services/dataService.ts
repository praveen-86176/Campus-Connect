import { mockClubs, mockEvents, mockRsvps } from '../constants/mockData';
import { Club, Event, RSVP, AttendanceRecord } from '../types';
import { storage } from './storage';

const CLUBS_KEY = 'clubs';
const EVENTS_KEY = 'events';
const RSVPS_KEY = 'rsvps';
const ATTENDANCE_KEY = 'attendance';

export const dataService = {
  async init(): Promise<void> {
    const [clubs, events, rsvps, attendance] = await Promise.all([
      storage.get<Club[]>(CLUBS_KEY),
      storage.get<Event[]>(EVENTS_KEY),
      storage.get<RSVP[]>(RSVPS_KEY),
      storage.get<AttendanceRecord[]>(ATTENDANCE_KEY),
    ]);

    if (!clubs) {
      await storage.set(CLUBS_KEY, mockClubs);
    }

    if (!events) {
      await storage.set(EVENTS_KEY, mockEvents);
    }

    if (!rsvps) {
      await storage.set(RSVPS_KEY, mockRsvps);
    }

    if (!attendance) {
      await storage.set(ATTENDANCE_KEY, [] as AttendanceRecord[]);
    }
  },

  async getClubs() {
    return (await storage.get<Club[]>(CLUBS_KEY)) ?? [];
  },

  async getEvents() {
    return (await storage.get<Event[]>(EVENTS_KEY)) ?? [];
  },

  async getRsvps() {
    return (await storage.get<RSVP[]>(RSVPS_KEY)) ?? [];
  },

  async saveRsvps(rsvps: RSVP[]) {
    await storage.set(RSVPS_KEY, rsvps);
  },

  async getAttendance() {
    return (await storage.get<AttendanceRecord[]>(ATTENDANCE_KEY)) ?? [];
  },

  async saveAttendance(records: AttendanceRecord[]) {
    await storage.set(ATTENDANCE_KEY, records);
  },
};
