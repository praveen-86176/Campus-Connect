import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Club, Event, RSVP, AttendanceRecord, AttendanceStatus, Membership } from '../types';
import { dataService } from '../services/dataService';
import { useAuth } from './AuthContext';
import { generateAttendanceId, generateMembershipId } from '../utils/idUtils';
import { processAllPostEventNotifications } from '../services/notifications/postEventNotifications';

type CampusDataContextType = {
  clubs: Club[];
  events: Event[];
  rsvps: RSVP[];
  attendance: AttendanceRecord[];
  memberships: Membership[];
  getEventById: (eventId: string) => Event | undefined;
  getEventsByClub: (clubId: string) => Event[];
  getUserAttendanceStatus: (eventId: string, userId: string) => AttendanceStatus;
  getEventAttendanceAnalytics: (eventId: string) => {
    totalRsvps: number;
    checkedIn: number;
    checkedOut: number;
    absent: number;
  };
  getAttendanceForEvent: (eventId: string) => AttendanceRecord[];
  markCheckIn: (eventId: string, userId: string) => Promise<void>;
  markCheckOut: (eventId: string, userId: string) => Promise<void>;
  upsertRsvp: (rsvp: RSVP) => Promise<void>;
  createEvent: (event: Event) => Promise<void>;
  joinClub: (clubId: string, userId: string) => Promise<void>;
  leaveClub: (clubId: string, userId: string) => Promise<void>;
  isUserFollowingClub: (clubId: string, userId: string) => boolean;
  refreshData: () => Promise<void>;
};

const CampusDataContext = createContext<CampusDataContextType | undefined>(undefined);

export const CampusDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const { user, loading } = useAuth();

  const loadData = useCallback(async () => {
    try {
      console.log('🔄 Loading campus data...');
      await dataService.init();
      
      // Load memberships first (may be empty, that's okay)
      let membershipsData: Membership[] = [];
      try {
        membershipsData = await dataService.getMemberships();
      } catch (membershipError: any) {
        console.warn('⚠️ Failed to load memberships (may not have permission yet):', membershipError.message);
        // Continue without memberships - member counts will be 0
      }
      
      // Run test function first to verify connection
      try {
        await dataService.testEventFetch();
      } catch (testError) {
        console.warn('⚠️ Test fetch failed, but continuing:', testError);
      }
      
      const [clubsData, eventsData, rsvpsData, attendanceData] = await Promise.all([
        dataService.getClubs(),
        dataService.getEvents(),
        dataService.getRsvps(),
        dataService.getAttendance(),
      ]);
      
      // Update club member counts based on active memberships
      const updatedClubs = clubsData.map(club => {
        const activeMembers = membershipsData.filter(
          m => m.clubId === club.id && m.status === 'active'
        ).length;
        return {
          ...club,
          memberCount: activeMembers,
        };
      });
      
      setClubs(updatedClubs);
      setEvents(eventsData);
      setRsvps(rsvpsData);
      setAttendance(attendanceData);
      setMemberships(membershipsData);
      
      console.log(`✅ Loaded data: ${updatedClubs.length} clubs, ${eventsData.length} events, ${rsvpsData.length} RSVPs, ${membershipsData.length} memberships`);
      
      // Log events with images for debugging
      const eventsWithImages = eventsData.filter(e => e.image && e.image.trim() !== '');
      console.log(`📸 Events with images: ${eventsWithImages.length} out of ${eventsData.length}`);
      eventsWithImages.forEach(e => {
        console.log(`   - "${e.title}": ${e.image?.substring(0, 50)}...`);
      });

      // Process post-event notifications for completed events
      // Run in background (don't block UI)
      processAllPostEventNotifications(eventsData).catch((error) => {
        console.error('Error processing post-event notifications:', error);
      });
    } catch (error) {
      console.error('❌ Failed to load campus data:', error);
      // Don't throw - allow app to continue with partial data
    }
  }, []);

  // Set up real-time listeners for events, attendance, and RSVPs
  useEffect(() => {
    if (!loading && user) {
      // Initial load
      loadData();

      // Set up real-time listener for events
      const unsubscribeEvents = dataService.subscribeToEvents((eventsData) => {
        console.log(`📅 Real-time update: ${eventsData.length} events received`);
        const eventsWithImages = eventsData.filter(e => e.image && e.image.trim() !== '');
        console.log(`📸 Real-time: ${eventsWithImages.length} events with images`);
        setEvents(eventsData);
      });

      // Set up real-time listener for attendance
      const unsubscribeAttendance = dataService.subscribeToAttendance((attendanceData) => {
        console.log(`✅ Real-time attendance update: ${attendanceData.length} records`);
        setAttendance(attendanceData);
      });

      // Set up real-time listener for RSVPs
      const unsubscribeRsvps = dataService.subscribeToRsvps((rsvpsData) => {
        console.log(`📝 Real-time RSVPs update: ${rsvpsData.length} RSVPs`);
        setRsvps(rsvpsData);
      });

      // Cleanup listeners on unmount
      return () => {
        if (unsubscribeEvents) {
          unsubscribeEvents();
        }
        if (unsubscribeAttendance) {
          unsubscribeAttendance();
        }
        if (unsubscribeRsvps) {
          unsubscribeRsvps();
        }
      };
    }
  }, [loading, user, loadData]);

  const getEventById = useCallback(
    (eventId: string): Event | undefined => {
      return events.find((event) => event.id === eventId);
    },
    [events]
  );

  const getEventsByClub = useCallback(
    (clubId: string): Event[] => {
      return events.filter((event) => event.clubId === clubId);
    },
    [events]
  );

  const getUserAttendanceStatus = useCallback(
    (eventId: string, userId: string): AttendanceStatus => {
      // Use correct attendance ID format: `${userId}_${eventId}`
      const attendanceId = generateAttendanceId(userId, eventId);
      const record = attendance.find(
        (r) => generateAttendanceId(r.userId, r.eventId) === attendanceId
      );
      if (!record) return 'absent';
      if (record.checkOutAt) return 'checked_out';
      if (record.checkInAt) return 'checked_in';
      return 'absent';
    },
    [attendance]
  );

  const getEventAttendanceAnalytics = useCallback(
    (eventId: string) => {
      const eventRsvps = rsvps.filter((r) => r.eventId === eventId);
      const eventAttendance = attendance.filter((a) => a.eventId === eventId);
      const checkedIn = eventAttendance.filter((a) => a.checkInAt && !a.checkOutAt).length;
      const checkedOut = eventAttendance.filter((a) => a.checkOutAt).length;
      const absent = eventRsvps.length - checkedIn - checkedOut;

      return {
        totalRsvps: eventRsvps.length,
        checkedIn,
        checkedOut,
        absent: Math.max(0, absent),
      };
    },
    [rsvps, attendance]
  );

  const getAttendanceForEvent = useCallback(
    (eventId: string): AttendanceRecord[] => {
      return attendance.filter((record) => record.eventId === eventId);
    },
    [attendance]
  );

  const markCheckIn = useCallback(
    async (eventId: string, userId: string) => {
      try {
        // Use correct attendance ID format: `${userId}_${eventId}`
        const attendanceId = generateAttendanceId(userId, eventId);
        const existingRecord = attendance.find(
          (r) => generateAttendanceId(r.userId, r.eventId) === attendanceId
        );

        let updatedAttendance: AttendanceRecord[];
        if (existingRecord) {
          // Update existing record
          updatedAttendance = attendance.map((r) => {
            const rId = generateAttendanceId(r.userId, r.eventId);
            return rId === attendanceId
              ? { ...r, checkInAt: new Date().toISOString() }
              : r;
          });
        } else {
          // Create new record
          const newRecord: AttendanceRecord = {
            eventId,
            userId,
            checkInAt: new Date().toISOString(),
          };
          updatedAttendance = [...attendance, newRecord];
        }

        setAttendance(updatedAttendance);
        await dataService.saveAttendance(updatedAttendance);
      } catch (error) {
        console.error('Failed to mark check-in:', error);
        throw error;
      }
    },
    [attendance]
  );

  const markCheckOut = useCallback(
    async (eventId: string, userId: string) => {
      try {
        // Use correct attendance ID format: `${userId}_${eventId}`
        const attendanceId = generateAttendanceId(userId, eventId);
        const existingRecord = attendance.find(
          (r) => generateAttendanceId(r.userId, r.eventId) === attendanceId
        );

        // Validate: Cannot check out without checking in first
        if (!existingRecord || !existingRecord.checkInAt) {
          throw new Error('Cannot check out without checking in first. Please check in before checking out.');
        }

        // Validate: Cannot check out if already checked out
        if (existingRecord.checkOutAt) {
          throw new Error('Already checked out from this event.');
        }

        const updatedAttendance = attendance.map((r) => {
          const rId = generateAttendanceId(r.userId, r.eventId);
          return rId === attendanceId
            ? { ...r, checkOutAt: new Date().toISOString() }
            : r;
        });

        setAttendance(updatedAttendance);
        await dataService.saveAttendance(updatedAttendance);
      } catch (error) {
        console.error('Failed to mark check-out:', error);
        throw error;
      }
    },
    [attendance]
  );

  const upsertRsvp = useCallback(
    async (rsvp: RSVP) => {
      try {
        const existingIndex = rsvps.findIndex(
          (r) => r.eventId === rsvp.eventId && r.userId === rsvp.userId
        );

        let updatedRsvps: RSVP[];
        if (existingIndex >= 0) {
          updatedRsvps = rsvps.map((r, index) =>
            index === existingIndex ? rsvp : r
          );
        } else {
          updatedRsvps = [...rsvps, rsvp];
        }

        setRsvps(updatedRsvps);
        await dataService.saveRsvps(updatedRsvps);
      } catch (error) {
        console.error('Failed to save RSVP:', error);
        throw error;
      }
    },
    [rsvps]
  );

  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const createEvent = useCallback(
    async (event: Event) => {
      try {
        // Save to Firestore first
        await dataService.upsertEvent(event);
        // Then refresh all data to ensure consistency across all users
        await loadData();
      } catch (error) {
        console.error('Failed to create event:', error);
        throw error;
      }
    },
    [loadData]
  );

  const joinClub = useCallback(
    async (clubId: string, userId: string) => {
      try {
        const membershipId = generateMembershipId(userId, clubId);
        const existingMembership = memberships.find(m => m.id === membershipId);
        
        if (existingMembership && existingMembership.status === 'active') {
          // Already a member
          return;
        }

        const newMembership: Membership = {
          id: membershipId,
          userId,
          clubId,
          role: 'member',
          joinedAt: new Date(),
          status: 'active',
        };

        // Update local state
        const updatedMemberships = existingMembership
          ? memberships.map(m => m.id === membershipId ? newMembership : m)
          : [...memberships, newMembership];
        
        setMemberships(updatedMemberships);
        
        // Save to Firestore
        await dataService.saveMembership(newMembership);
        
        // Update club member count
        const updatedClubs = clubs.map(club => {
          if (club.id === clubId) {
            const activeMembers = updatedMemberships.filter(
              m => m.clubId === clubId && m.status === 'active'
            ).length;
            return { ...club, memberCount: activeMembers };
          }
          return club;
        });
        setClubs(updatedClubs);
        
        // Update club in Firestore
        const club = updatedClubs.find(c => c.id === clubId);
        if (club) {
          await dataService.upsertClub(club);
        }
        
        console.log(`✅ User ${userId} joined club ${clubId}`);
      } catch (error) {
        console.error('Failed to join club:', error);
        throw error;
      }
    },
    [clubs, memberships]
  );

  const leaveClub = useCallback(
    async (clubId: string, userId: string) => {
      try {
        const membershipId = generateMembershipId(userId, clubId);
        const existingMembership = memberships.find(m => m.id === membershipId);
        
        if (!existingMembership || existingMembership.status === 'inactive') {
          // Not a member
          return;
        }

        const updatedMembership: Membership = {
          ...existingMembership,
          status: 'inactive',
        };

        // Update local state
        const updatedMemberships = memberships.map(m => 
          m.id === membershipId ? updatedMembership : m
        );
        setMemberships(updatedMemberships);
        
        // Save to Firestore
        await dataService.saveMembership(updatedMembership);
        
        // Update club member count
        const updatedClubs = clubs.map(club => {
          if (club.id === clubId) {
            const activeMembers = updatedMemberships.filter(
              m => m.clubId === clubId && m.status === 'active'
            ).length;
            return { ...club, memberCount: activeMembers };
          }
          return club;
        });
        setClubs(updatedClubs);
        
        // Update club in Firestore
        const club = updatedClubs.find(c => c.id === clubId);
        if (club) {
          await dataService.upsertClub(club);
        }
        
        console.log(`✅ User ${userId} left club ${clubId}`);
      } catch (error) {
        console.error('Failed to leave club:', error);
        throw error;
      }
    },
    [clubs, memberships]
  );

  const isUserFollowingClub = useCallback(
    (clubId: string, userId: string): boolean => {
      const membershipId = generateMembershipId(userId, clubId);
      const membership = memberships.find(m => m.id === membershipId);
      return membership?.status === 'active' || false;
    },
    [memberships]
  );

  const value: CampusDataContextType = {
    clubs,
    events,
    rsvps,
    attendance,
    memberships,
    getEventById,
    getEventsByClub,
    getUserAttendanceStatus,
    getEventAttendanceAnalytics,
    getAttendanceForEvent,
    markCheckIn,
    markCheckOut,
    upsertRsvp,
    createEvent,
    joinClub,
    leaveClub,
    isUserFollowingClub,
    refreshData,
  };

  return (
    <CampusDataContext.Provider value={value}>
      {children}
    </CampusDataContext.Provider>
  );
};

export const useCampusData = (): CampusDataContextType => {
  const context = useContext(CampusDataContext);
  if (context === undefined) {
    throw new Error('useCampusData must be used within a CampusDataProvider');
  }
  return context;
};
