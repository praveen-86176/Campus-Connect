import { mockClubs, mockEvents, mockRsvps } from '../constants/mockData';
import { Club, Event, RSVP } from '../types';
import { storage } from './storage';

const CLUBS_KEY = 'clubs';
const EVENTS_KEY = 'events';
const RSVPS_KEY = 'rsvps';

export const dataService = {
  async init(): Promise<void> {
    const [clubs, events, rsvps] = await Promise.all([
      storage.get<Club[]>(CLUBS_KEY),
      storage.get<Event[]>(EVENTS_KEY),
      storage.get<RSVP[]>(RSVPS_KEY),
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
};
