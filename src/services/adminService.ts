import { User, Club, Event, RSVP, AttendanceRecord, Membership } from '../types';
import { db } from '../config/firebase.config';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { logFirebaseError, handleFirebaseError } from '../utils/errorHandler';

const USERS_COLLECTION = 'users';
const CLUBS_COLLECTION = 'clubs';
const EVENTS_COLLECTION = 'events';
const RSVPS_COLLECTION = 'rsvps';
const ATTENDANCE_COLLECTION = 'attendance';
const MEMBERSHIPS_COLLECTION = 'memberships';
const NOTIFICATIONS_COLLECTION = 'notifications';

export const adminService = {
  // ==================== USER MANAGEMENT ====================
  
  async getAllUsers(): Promise<User[]> {
    try {
      const snap = await getDocs(query(collection(db, USERS_COLLECTION), orderBy('createdAt', 'desc')));
      return snap.docs.map((d) => {
        const data = d.data();
        return {
          uid: d.id,
          email: data.email || '',
          name: data.name || '',
          phone: data.phone,
          photoURL: data.photoURL,
          role: data.role || 'student',
          createdAt: data.createdAt?.toDate() || new Date(),
          institution: data.institution,
          adminRole: data.adminRole,
          collegeId: data.collegeId,
          major: data.major,
          graduationYear: data.graduationYear,
          yearOfStudy: data.yearOfStudy,
          interests: data.interests || [],
          clubLeaderRole: data.clubLeaderRole,
          managedClubIds: data.managedClubIds || [],
        } as User;
      });
    } catch (error: any) {
      logFirebaseError(error, 'getAllUsers');
      throw new Error(handleFirebaseError(error, 'getAllUsers'));
    }
  },

  async getUserById(userId: string): Promise<User | null> {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      
      const data = docSnap.data();
      return {
        uid: docSnap.id,
        email: data.email || '',
        name: data.name || '',
        phone: data.phone,
        photoURL: data.photoURL,
        role: data.role || 'student',
        createdAt: data.createdAt?.toDate() || new Date(),
        institution: data.institution,
        adminRole: data.adminRole,
        collegeId: data.collegeId,
        major: data.major,
        graduationYear: data.graduationYear,
        yearOfStudy: data.yearOfStudy,
        interests: data.interests || [],
        clubLeaderRole: data.clubLeaderRole,
        managedClubIds: data.managedClubIds || [],
      } as User;
    } catch (error: any) {
      logFirebaseError(error, 'getUserById', { userId });
      throw new Error(handleFirebaseError(error, 'getUserById'));
    }
  },

  async updateUserRole(userId: string, role: string, additionalData?: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(userRef, {
        role,
        ...additionalData,
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      logFirebaseError(error, 'updateUserRole', { userId, role });
      throw new Error(handleFirebaseError(error, 'updateUserRole'));
    }
  },

  async deactivateUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(userRef, {
        status: 'inactive',
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      logFirebaseError(error, 'deactivateUser', { userId });
      throw new Error(handleFirebaseError(error, 'deactivateUser'));
    }
  },

  async activateUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(userRef, {
        status: 'active',
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      logFirebaseError(error, 'activateUser', { userId });
      throw new Error(handleFirebaseError(error, 'activateUser'));
    }
  },

  async deleteUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      await deleteDoc(userRef);
    } catch (error: any) {
      logFirebaseError(error, 'deleteUser', { userId });
      throw new Error(handleFirebaseError(error, 'deleteUser'));
    }
  },

  // ==================== CLUB MANAGEMENT ====================

  /**
   * Initialize default clubs (Tech, Cultural, Sports, Arts)
   * Only creates them if they don't already exist
   */
  async initializeDefaultClubs(adminId: string): Promise<void> {
    try {
      const defaultClubs: Omit<Club, 'id'>[] = [
        {
          name: 'Tech Club',
          description: 'Technology and programming enthusiasts. Join us for coding workshops, hackathons, and tech talks.',
          logo: '',
          category: 'Tech',
          adminId: adminId,
          memberCount: 0,
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Cultural Club',
          description: 'Celebrating diversity and culture. Participate in cultural events, festivals, and performances.',
          logo: '',
          category: 'Cultural',
          adminId: adminId,
          memberCount: 0,
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Sports Club',
          description: 'Athletic activities and sports events. Join teams, participate in tournaments, and stay active.',
          logo: '',
          category: 'Sports',
          adminId: adminId,
          memberCount: 0,
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Arts Club',
          description: 'Creative arts and expression. Explore painting, music, drama, and other artistic endeavors.',
          logo: '',
          category: 'Arts',
          adminId: adminId,
          memberCount: 0,
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Check existing clubs
      const existingClubs = await getDocs(collection(db, CLUBS_COLLECTION));
      const existingNames = new Set(existingClubs.docs.map(d => d.data().name));

      // Create clubs that don't exist
      const batch = writeBatch(db);
      let createdCount = 0;

      for (const clubData of defaultClubs) {
        if (!existingNames.has(clubData.name)) {
          const clubId = `club_${clubData.category.toLowerCase()}_${Date.now()}`;
          const clubRef = doc(db, CLUBS_COLLECTION, clubId);
          batch.set(clubRef, {
            ...clubData,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
          createdCount++;
        }
      }

      if (createdCount > 0) {
        await batch.commit();
        console.log(`✅ Initialized ${createdCount} default clubs`);
      }
    } catch (error: any) {
      logFirebaseError(error, 'initializeDefaultClubs', { adminId });
      console.error('Failed to initialize default clubs:', error);
      // Don't throw - this is a convenience feature
    }
  },

  async createClub(club: Club): Promise<void> {
    try {
      const clubRef = doc(db, CLUBS_COLLECTION, club.id);
      await setDoc(clubRef, {
        ...club,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      logFirebaseError(error, 'createClub', { clubId: club.id });
      throw new Error(handleFirebaseError(error, 'createClub'));
    }
  },

  async updateClub(clubId: string, updates: Partial<Club>): Promise<void> {
    try {
      const clubRef = doc(db, CLUBS_COLLECTION, clubId);
      await updateDoc(clubRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      logFirebaseError(error, 'updateClub', { clubId });
      throw new Error(handleFirebaseError(error, 'updateClub'));
    }
  },

  async deleteClub(clubId: string): Promise<void> {
    try {
      const clubRef = doc(db, CLUBS_COLLECTION, clubId);
      await deleteDoc(clubRef);
    } catch (error: any) {
      logFirebaseError(error, 'deleteClub', { clubId });
      throw new Error(handleFirebaseError(error, 'deleteClub'));
    }
  },

  // ==================== EVENT MANAGEMENT ====================

  async deleteEvent(eventId: string): Promise<void> {
    try {
      const eventRef = doc(db, EVENTS_COLLECTION, eventId);
      await deleteDoc(eventRef);
    } catch (error: any) {
      logFirebaseError(error, 'deleteEvent', { eventId });
      throw new Error(handleFirebaseError(error, 'deleteEvent'));
    }
  },

  async updateEventStatus(eventId: string, status: Event['status']): Promise<void> {
    try {
      const eventRef = doc(db, EVENTS_COLLECTION, eventId);
      await updateDoc(eventRef, {
        status,
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      logFirebaseError(error, 'updateEventStatus', { eventId, status });
      throw new Error(handleFirebaseError(error, 'updateEventStatus'));
    }
  },

  // ==================== RSVP MANAGEMENT ====================

  async getRsvpsByEvent(eventId: string): Promise<RSVP[]> {
    try {
      const q = query(
        collection(db, RSVPS_COLLECTION),
        where('eventId', '==', eventId),
        orderBy('timestamp', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          userId: data.userId,
          eventId: data.eventId,
          userName: data.userName,
          email: data.email,
          phone: data.phone,
          timestamp: data.timestamp,
          attended: !!data.attended,
        } as RSVP;
      });
    } catch (error: any) {
      logFirebaseError(error, 'getRsvpsByEvent', { eventId });
      throw new Error(handleFirebaseError(error, 'getRsvpsByEvent'));
    }
  },

  async deleteRsvp(rsvpId: string): Promise<void> {
    try {
      const rsvpRef = doc(db, RSVPS_COLLECTION, rsvpId);
      await deleteDoc(rsvpRef);
    } catch (error: any) {
      logFirebaseError(error, 'deleteRsvp', { rsvpId });
      throw new Error(handleFirebaseError(error, 'deleteRsvp'));
    }
  },

  // ==================== ATTENDANCE MANAGEMENT ====================

  async getAttendanceByEvent(eventId: string): Promise<AttendanceRecord[]> {
    try {
      const q = query(
        collection(db, ATTENDANCE_COLLECTION),
        where('eventId', '==', eventId),
        orderBy('checkInAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => {
        const data = d.data();
        return {
          eventId: data.eventId,
          userId: data.userId,
          checkInAt: data.checkInAt,
          checkOutAt: data.checkOutAt,
        } as AttendanceRecord;
      });
    } catch (error: any) {
      logFirebaseError(error, 'getAttendanceByEvent', { eventId });
      throw new Error(handleFirebaseError(error, 'getAttendanceByEvent'));
    }
  },

  async markAttendanceManually(eventId: string, userId: string, notes?: string): Promise<void> {
    try {
      const attendanceId = `${userId}_${eventId}`;
      const attendanceRef = doc(db, ATTENDANCE_COLLECTION, attendanceId);
      await setDoc(attendanceRef, {
        eventId,
        userId,
        checkInAt: new Date().toISOString(),
        notes,
        method: 'manual',
        verifiedBy: 'admin',
      }, { merge: true });
    } catch (error: any) {
      logFirebaseError(error, 'markAttendanceManually', { eventId, userId });
      throw new Error(handleFirebaseError(error, 'markAttendanceManually'));
    }
  },

  // ==================== ANALYTICS ====================

  async getAnalytics(startDate?: Date, endDate?: Date): Promise<any> {
    try {
      // Get all data for analytics
      const [users, clubs, events, rsvps, attendance] = await Promise.all([
        this.getAllUsers(),
        getDocs(collection(db, CLUBS_COLLECTION)),
        getDocs(collection(db, EVENTS_COLLECTION)),
        getDocs(collection(db, RSVPS_COLLECTION)),
        getDocs(collection(db, ATTENDANCE_COLLECTION)),
      ]);

      const clubsData = clubs.docs.map(d => ({ id: d.id, ...d.data() }));
      const eventsData = events.docs.map(d => ({ id: d.id, ...d.data() }));
      const rsvpsData = rsvps.docs.map(d => ({ id: d.id, ...d.data() }));
      const attendanceData = attendance.docs.map(d => ({ id: d.id, ...d.data() }));

      // Calculate analytics
      const totalUsers = users.length;
      // Users with a role are considered active (inactive is not a valid UserRole)
      const activeUsers = users.filter(u => u.role !== undefined).length;
      const totalClubs = clubsData.length;
      const activeClubs = clubsData.filter((c: any) => c.isVerified).length;
      const totalEvents = eventsData.length;
      const upcomingEvents = eventsData.filter((e: any) => {
        const eventDate = new Date(e.date);
        return eventDate > new Date();
      }).length;
      const totalRsvps = rsvpsData.length;
      const totalAttendance = attendanceData.length;

      // User role distribution
      const roleDistribution = users.reduce((acc: any, user) => {
        const role = user.role || 'student';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {});

      // Event status distribution
      const eventStatusDistribution = eventsData.reduce((acc: any, event: any) => {
        const status = event.status || 'Draft';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      // Monthly event trend (last 6 months)
      const monthlyTrend = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const monthEvents = eventsData.filter((e: any) => {
          const eventDate = new Date(e.createdAt?.toDate?.() || e.createdAt || Date.now());
          return eventDate >= monthStart && eventDate <= monthEnd;
        }).length;
        
        monthlyTrend.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          count: monthEvents,
        });
      }

      return {
        overview: {
          totalUsers,
          activeUsers,
          totalClubs,
          activeClubs,
          totalEvents,
          upcomingEvents,
          totalRsvps,
          totalAttendance,
        },
        roleDistribution,
        eventStatusDistribution,
        monthlyTrend,
      };
    } catch (error: any) {
      logFirebaseError(error, 'getAnalytics');
      throw new Error(handleFirebaseError(error, 'getAnalytics'));
    }
  },
};

