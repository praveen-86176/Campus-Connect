import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { dataService } from '../services/dataService';
import { Club, Event, RSVP } from '../types';
import { storage } from '../services/storage';
import { scheduleEventReminders } from '../services/notifications';
import { mockClubs, mockEvents } from '../constants/mockData';

const RSVPS_KEY = 'rsvps';

export type CampusDataContextValue = {
  loading: boolean;
  clubs: Club[];
  events: Event[];
  rsvps: RSVP[];
  refresh: () => Promise<void>;
  getClubById: (clubId: string) => Club | undefined;
  getEventsByClub: (clubId: string) => Event[];
  getEventById: (eventId: string) => Event | undefined;
  upsertRsvp: (rsvp: RSVP) => Promise<void>;
};

const CampusDataContext = createContext<CampusDataContextValue | undefined>(undefined);

export const CampusDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);

  const readData = async () => {
    setLoading(true);
    try {
      await dataService.init();
      const [loadedClubs, loadedEvents, loadedRsvps] = await Promise.all([
        dataService.getClubs(),
        dataService.getEvents(),
        dataService.getRsvps(),
      ]);
      setClubs(loadedClubs);
      setEvents(loadedEvents);
      setRsvps(loadedRsvps);
    } catch (error) {
      console.warn('Failed to load data', error);
      Alert.alert('Offline mode', 'Showing cached data while offline.');
      setClubs(mockClubs);
      setEvents(mockEvents);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    readData();
  }, []);

  const refresh = async () => {
    await readData();
  };

  const upsertRsvp = async (rsvp: RSVP) => {
    try {
      const nextRsvps = [...rsvps.filter((item) => item.eventId !== rsvp.eventId || item.userId !== rsvp.userId), rsvp];
      setRsvps(nextRsvps);
      await storage.set(RSVPS_KEY, nextRsvps);
      const event = events.find((e) => e.id === rsvp.eventId);
      if (event) {
        await scheduleEventReminders(event, rsvp.userId);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to save RSVP right now.');
    }
  };

  const value = useMemo<CampusDataContextValue>(() => ({
    loading,
    clubs,
    events,
    rsvps,
    refresh,
    getClubById: (clubId) => clubs.find((club) => club.id === clubId),
    getEventsByClub: (clubId) => events.filter((event) => event.clubId === clubId),
    getEventById: (eventId) => events.find((event) => event.id === eventId),
    upsertRsvp,
  }), [loading, clubs, events, rsvps]);

  return <CampusDataContext.Provider value={value}>{children}</CampusDataContext.Provider>;
};

export const useCampusData = () => {
  const context = useContext(CampusDataContext);
  if (!context) {
    throw new Error('useCampusData must be used within CampusDataProvider');
  }
  return context;
};
