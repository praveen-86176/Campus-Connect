import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { dataService } from '../services/dataService';
import { Club, Event, RSVP, AttendanceRecord, AttendanceStatus } from '../types';
import { storage } from '../services/storage';
import { mockClubs, mockEvents } from '../constants/mockData';

const RSVPS_KEY = 'rsvps';

export type CampusDataContextValue = {
  loading: boolean;
  clubs: Club[];
  events: Event[];
  rsvps: RSVP[];
  attendance: AttendanceRecord[];
  refresh: () => Promise<void>;
  getClubById: (clubId: string) => Club | undefined;
  getEventsByClub: (clubId: string) => Event[];
  getEventById: (eventId: string) => Event | undefined;
  upsertRsvp: (rsvp: RSVP) => Promise<void>;
  getAttendanceForEvent: (eventId: string) => AttendanceRecord[];
  getAttendanceForUser: (userId: string) => AttendanceRecord[];
  getUserAttendanceStatus: (eventId: string, userId: string) => AttendanceStatus;
  markCheckIn: (userId: string, eventId: string) => Promise<void>;
  markCheckOut: (userId: string, eventId: string) => Promise<void>;
  getEventAttendanceAnalytics: (
    eventId: string
  ) => { checkedIn: number; checkedOut: number; totalRsvp: number; attendanceRate: number };
};

const CampusDataContext = createContext<CampusDataContextValue | undefined>(undefined);

export const CampusDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  const readData = async () => {
    setLoading(true);
    try {
      await dataService.init();
      const [loadedClubs, loadedEvents, loadedRsvps, loadedAttendance] = await Promise.all([
        dataService.getClubs(),
        dataService.getEvents(),
        dataService.getRsvps(),
        dataService.getAttendance(),
      ]);
      setClubs(loadedClubs);
      setEvents(loadedEvents);
      setRsvps(loadedRsvps);
      setAttendance(loadedAttendance);
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
    } catch (error) {
      Alert.alert('Error', 'Unable to save RSVP right now.');
    }
  };

  const getAttendanceForEvent = (eventId: string) => attendance.filter((a) => a.eventId === eventId);
  const getAttendanceForUser = (userId: string) => attendance.filter((a) => a.userId === userId);
  const getUserAttendanceStatus = (eventId: string, userId: string): AttendanceStatus => {
    const rec = attendance.find((a) => a.eventId === eventId && a.userId === userId);
    if (!rec) return 'absent';
    if (rec.checkOutAt) return 'checked_out';
    if (rec.checkInAt) return 'checked_in';
    return 'absent';
  };

  const saveAttendance = async (next: AttendanceRecord[]) => {
    setAttendance(next);
    await dataService.saveAttendance(next);
  };

  const markCheckIn = async (userId: string, eventId: string) => {
    const existing = attendance.find((a) => a.eventId === eventId && a.userId === userId);
    const now = new Date().toISOString();
    const next = existing
      ? attendance.map((a) => (a.eventId === eventId && a.userId === userId ? { ...a, checkInAt: now } : a))
      : [...attendance, { eventId, userId, checkInAt: now }];
    await saveAttendance(next);
  };

  const markCheckOut = async (userId: string, eventId: string) => {
    const existing = attendance.find((a) => a.eventId === eventId && a.userId === userId);
    const now = new Date().toISOString();
    const next = existing
      ? attendance.map((a) => (a.eventId === eventId && a.userId === userId ? { ...a, checkOutAt: now } : a))
      : [...attendance, { eventId, userId, checkOutAt: now }];
    await saveAttendance(next);
  };

  const getEventAttendanceAnalytics = (eventId: string) => {
    const records = getAttendanceForEvent(eventId);
    const checkedIn = records.filter((r) => !!r.checkInAt).length;
    const checkedOut = records.filter((r) => !!r.checkOutAt).length;
    const totalRsvp = rsvps.filter((r) => r.eventId === eventId).length;
    const attendanceRate = totalRsvp === 0 ? 0 : Math.round((checkedIn / totalRsvp) * 100);
    return { checkedIn, checkedOut, totalRsvp, attendanceRate };
  };

  const value = useMemo<CampusDataContextValue>(() => ({
    loading,
    clubs,
    events,
    rsvps,
    attendance,
    refresh,
    getClubById: (clubId) => clubs.find((club) => club.id === clubId),
    getEventsByClub: (clubId) => events.filter((event) => event.clubId === clubId),
    getEventById: (eventId) => events.find((event) => event.id === eventId),
    upsertRsvp,
    getAttendanceForEvent,
    getAttendanceForUser,
    getUserAttendanceStatus,
    markCheckIn,
    markCheckOut,
    getEventAttendanceAnalytics,
  }), [loading, clubs, events, rsvps, attendance]);

  return <CampusDataContext.Provider value={value}>{children}</CampusDataContext.Provider>;
};

export const useCampusData = () => {
  const context = useContext(CampusDataContext);
  if (!context) {
    throw new Error('useCampusData must be used within CampusDataProvider');
  }
  return context;
};
