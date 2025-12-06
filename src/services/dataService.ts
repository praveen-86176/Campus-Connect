import { Club, Event, RSVP, AttendanceRecord, Membership, Feedback } from '../types';
import { db } from '../config/firebase.config';
import { collection, getDocs, writeBatch, doc, query, setDoc, getDoc, Timestamp, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { generateRsvpId, generateMembershipId, generateAttendanceId, generateFeedbackId } from '../utils/idUtils';
import { logFirebaseError, handleFirebaseError } from '../utils/errorHandler';

const CLUBS_COLLECTION = 'clubs';
const EVENTS_COLLECTION = 'events';
const RSVPS_COLLECTION = 'rsvps';
const ATTENDANCE_COLLECTION = 'attendance';
const MEMBERSHIPS_COLLECTION = 'memberships';
const FEEDBACK_COLLECTION = 'feedback';

export const dataService = {
  async init(): Promise<void> {
    // No-op: real data is fetched from Firestore
    return;
  },

  async getClubs(): Promise<Club[]> {
    try {
      const snap = await getDocs(query(collection(db, CLUBS_COLLECTION)));
      return snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          name: data.name,
          description: data.description,
          logo: data.logo ?? '',
          category: data.category ?? '',
          contactPerson: data.contactPerson,
          contactEmail: data.contactEmail,
          meetingLocation: data.meetingLocation,
          meetingTime: data.meetingTime,
          rules: data.rules,
          adminId: data.adminId ?? '',
          memberCount: data.memberCount ?? 0,
          isVerified: !!data.isVerified,
          createdAt: (data.createdAt?.toDate?.() ?? new Date(data.createdAt ?? Date.now())) as Date,
          updatedAt: (data.updatedAt?.toDate?.() ?? new Date(data.updatedAt ?? Date.now())) as Date,
        } as Club;
      });
    } catch (error: any) {
      logFirebaseError(error, 'getClubs', { collection: CLUBS_COLLECTION });
      throw new Error(handleFirebaseError(error, 'getClubs'));
    }
  },

  async upsertClub(club: Club): Promise<void> {
    try {
      const ref = doc(db, CLUBS_COLLECTION, club.id);
      const clubData: any = {
        id: club.id,
        name: club.name,
        description: club.description,
        logo: club.logo ?? '',
        category: club.category ?? '',
        contactPerson: club.contactPerson || null,
        contactEmail: club.contactEmail || null,
        meetingLocation: club.meetingLocation || null,
        meetingTime: club.meetingTime || null,
        rules: club.rules || null,
        adminId: club.adminId ?? '',
        memberCount: club.memberCount ?? 0,
        isVerified: club.isVerified || false,
        createdAt: club.createdAt instanceof Date 
          ? Timestamp.fromDate(club.createdAt) 
          : Timestamp.now(),
        updatedAt: club.updatedAt instanceof Date 
          ? Timestamp.fromDate(club.updatedAt) 
          : Timestamp.now(),
      };
      
      await setDoc(ref, clubData, { merge: true });
      console.log(`✅ Club updated in Firestore: ${club.name} (ID: ${club.id}, Members: ${club.memberCount})`);
    } catch (error: any) {
      console.error('❌ Failed to save club:', error);
      logFirebaseError(error, 'upsertClub', { clubId: club.id });
      throw new Error(handleFirebaseError(error, 'upsertClub'));
    }
  },

  async getEvents(): Promise<Event[]> {
    try {
      console.log('🔍 Fetching events for student view...');
      console.log(`📍 Collection name: ${EVENTS_COLLECTION}`);
      console.log(`📍 Database instance:`, db ? 'Initialized' : 'NOT INITIALIZED');
      
      const eventsRef = collection(db, EVENTS_COLLECTION);
      const q = query(eventsRef);
      const snap = await getDocs(q);
      
      console.log(`📅 Fetched ${snap.size} events from Firestore collection "${EVENTS_COLLECTION}"`);
      console.log(`📍 Number of docs fetched: ${snap.size}`);
      
      if (snap.empty) {
        console.warn('⚠️ No events found in Firestore collection. Check:');
        console.warn('   1. Collection name is correct: "events"');
        console.warn('   2. Firestore security rules allow read access');
        console.warn('   3. Events have been created by admin');
        return [];
      }
      
      const events = snap.docs.map((d) => {
        const data = d.data() as any;
        
        // Debug: Log raw Firestore data for ALL events
        console.log(`📅 Fetched event: ${data.title || 'Untitled'}`, {
          docId: d.id,
          hasImage: !!data.image,
          imageUrl: data.image ? data.image.substring(0, 50) + '...' : 'N/A',
          hasTitle: !!data.title,
          hasDate: !!data.date,
        });
        
        // Handle image field more robustly - preserve valid URLs, convert null/undefined to empty string
        const imageValue = data.image !== null && data.image !== undefined 
          ? (typeof data.image === 'string' ? data.image : String(data.image))
          : '';
        
        const event = {
          id: d.id,
          clubId: data.clubId,
          title: data.title,
          description: data.description,
          date: data.date,
          time: data.time,
          endTime: data.endTime,
          location: data.location,
          category: data.category ?? '',
          capacity: data.capacity ?? 0,
          registeredCount: data.registeredCount ?? 0,
          image: imageValue, // Preserve image URL if it exists
          status: data.status ?? 'Upcoming',
          registrationRequired: !!data.registrationRequired,
          tags: data.tags,
          eventLink: data.eventLink,
          meetingPlatform: data.meetingPlatform || undefined,
          createdAt: (data.createdAt?.toDate?.() ?? new Date(data.createdAt ?? Date.now())) as Date,
          updatedAt: (data.updatedAt?.toDate?.() ?? new Date(data.updatedAt ?? Date.now())) as Date,
        } as Event;
        
        // Log event details for debugging
        if (event.image && event.image.trim() !== '') {
          console.log(`📸 Event "${event.title}" HAS IMAGE: ${event.image.substring(0, 60)}...`);
          console.log(`📸 Image validation:`, {
            isString: typeof event.image === 'string',
            hasLength: event.image.length > 0,
            startsWithHttp: event.image.startsWith('http://') || event.image.startsWith('https://'),
            trimmedLength: event.image.trim().length
          });
        } else {
          console.log(`📸 Event "${event.title}" has NO image`);
        }
        return event;
      });
      
      const eventsWithImages = events.filter(e => e.image && e.image.trim() !== '').length;
      const eventsWithoutImages = events.length - eventsWithImages;
      console.log(`✅ Total events fetched for students: ${events.length}`);
      console.log(`📊 Events summary: ${events.length} total, ${eventsWithImages} with images, ${eventsWithoutImages} without images`);
      
      // Log all event IDs for debugging
      console.log(`📋 Event IDs:`, events.map(e => e.id));
      
      return events;
    } catch (error: any) {
      console.error('❌ Error fetching student events:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack?.substring(0, 200)
      });
      logFirebaseError(error, 'getEvents', { collection: EVENTS_COLLECTION });
      throw new Error(handleFirebaseError(error, 'getEvents'));
    }
  },

  // Real-time listener for events
  subscribeToEvents(callback: (events: Event[]) => void): Unsubscribe {
    try {
      const eventsRef = collection(db, EVENTS_COLLECTION);
      const q = query(eventsRef);
      
      return onSnapshot(q, (snap) => {
        const eventsData = snap.docs.map((d) => {
          const data = d.data() as any;
          // Handle image field more robustly - preserve valid URLs, convert null/undefined to empty string
          const imageValue = data.image !== null && data.image !== undefined 
            ? (typeof data.image === 'string' ? data.image : String(data.image))
            : '';
          const event = {
            id: d.id,
            clubId: data.clubId,
            title: data.title,
            description: data.description,
            date: data.date,
            time: data.time,
            endTime: data.endTime,
            location: data.location,
            category: data.category ?? '',
            capacity: data.capacity ?? 0,
            registeredCount: data.registeredCount ?? 0,
          image: imageValue, // Preserve image URL if it exists
          status: data.status ?? 'Upcoming',
          registrationRequired: !!data.registrationRequired,
          tags: data.tags,
          eventLink: data.eventLink,
          meetingPlatform: data.meetingPlatform || undefined,
          createdAt: (data.createdAt?.toDate?.() ?? new Date(data.createdAt ?? Date.now())) as Date,
          updatedAt: (data.updatedAt?.toDate?.() ?? new Date(data.updatedAt ?? Date.now())) as Date,
          } as Event;
          
          // Log event details for debugging
          if (event.image && event.image.trim() !== '') {
            console.log(`📅 Real-time Event "${event.title}": HAS IMAGE (${event.image.substring(0, 50)}...)`);
            console.log(`📸 Full image URL for "${event.title}": ${event.image}`);
          }
          return event;
        });
        
        const eventsWithImages = eventsData.filter(e => e.image && e.image.trim() !== '').length;
        const eventsWithoutImages = eventsData.length - eventsWithImages;
        console.log(`📊 Real-time: ${eventsData.length} events total (${eventsWithImages} with images, ${eventsWithoutImages} without)`);
        callback(eventsData);
      }, (error) => {
        console.error('❌ Real-time events listener error:', error);
        logFirebaseError(error, 'subscribeToEvents', { collection: EVENTS_COLLECTION });
      });
    } catch (error: any) {
      console.error('❌ Failed to set up events listener:', error);
      logFirebaseError(error, 'subscribeToEvents', { collection: EVENTS_COLLECTION });
      // Return a no-op function if subscription fails
      return () => {};
    }
  },

  // Real-time listener for attendance
  subscribeToAttendance(callback: (attendance: AttendanceRecord[]) => void): Unsubscribe {
    try {
      const attendanceRef = collection(db, ATTENDANCE_COLLECTION);
      const q = query(attendanceRef);
      
      return onSnapshot(q, (snap) => {
        const attendanceData = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            eventId: data.eventId,
            userId: data.userId,
            checkInAt: data.checkInAt,
            checkOutAt: data.checkOutAt,
          } as AttendanceRecord;
        });
        
        console.log(`📊 Real-time attendance update: ${attendanceData.length} records`);
        callback(attendanceData);
      }, (error) => {
        console.error('❌ Real-time attendance listener error:', error);
        logFirebaseError(error, 'subscribeToAttendance', { collection: ATTENDANCE_COLLECTION });
      });
    } catch (error: any) {
      console.error('❌ Failed to set up attendance listener:', error);
      logFirebaseError(error, 'subscribeToAttendance', { collection: ATTENDANCE_COLLECTION });
      return () => {};
    }
  },

  // Real-time listener for RSVPs
  subscribeToRsvps(callback: (rsvps: RSVP[]) => void): Unsubscribe {
    try {
      const rsvpsRef = collection(db, RSVPS_COLLECTION);
      const q = query(rsvpsRef);
      
      return onSnapshot(q, (snap) => {
        const rsvpsData = snap.docs.map((d) => {
          const data = d.data() as any;
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
        
        console.log(`📊 Real-time RSVPs update: ${rsvpsData.length} RSVPs`);
        callback(rsvpsData);
      }, (error) => {
        console.error('❌ Real-time RSVPs listener error:', error);
        logFirebaseError(error, 'subscribeToRsvps', { collection: RSVPS_COLLECTION });
      });
    } catch (error: any) {
      console.error('❌ Failed to set up RSVPs listener:', error);
      logFirebaseError(error, 'subscribeToRsvps', { collection: RSVPS_COLLECTION });
      return () => {};
    }
  },

  async upsertEvent(event: Event): Promise<void> {
    try {
      const ref = doc(db, EVENTS_COLLECTION, event.id);
      // Convert Date objects to Firestore Timestamps and remove undefined values
      const eventData: any = {
        id: event.id,
        clubId: event.clubId,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        endTime: event.endTime || null,
        location: event.location,
        category: event.category || '',
        capacity: event.capacity || 0,
        registeredCount: event.registeredCount || 0,
        status: event.status || 'Upcoming',
        registrationRequired: event.registrationRequired || false,
        tags: event.tags || null,
        eventLink: event.eventLink || null,
        meetingPlatform: event.meetingPlatform || null,
        createdAt: event.createdAt instanceof Date 
          ? Timestamp.fromDate(event.createdAt) 
          : Timestamp.now(),
        updatedAt: event.updatedAt instanceof Date 
          ? Timestamp.fromDate(event.updatedAt) 
          : Timestamp.now(),
      };
      
      // Always include image field (even if empty) for consistency
      // Ensure image is a string, not null or undefined
      const imageToSave = event.image && typeof event.image === 'string' && event.image.trim() !== '' 
        ? event.image.trim() 
        : '';
      eventData.image = imageToSave;
      
      await setDoc(ref, eventData, { merge: true });
      console.log(`✅ Event saved to Firestore: ${event.title} (ID: ${event.id})`);
      if (eventData.image) {
        console.log(`📸 Event image URL saved: ${eventData.image}`);
        console.log(`📸 Image field type: ${typeof eventData.image}, length: ${eventData.image.length}`);
      } else {
        console.log(`📸 Event created without image (image field set to empty string)`);
      }
    } catch (error: any) {
      console.error('❌ Failed to save event:', error);
      logFirebaseError(error, 'upsertEvent', { eventId: event.id });
      throw new Error(handleFirebaseError(error, 'upsertEvent'));
    }
  },

  async getRsvps(): Promise<RSVP[]> {
    try {
      const snap = await getDocs(query(collection(db, RSVPS_COLLECTION)));
      return snap.docs.map((d) => {
        const data = d.data() as any;
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
      logFirebaseError(error, 'getRsvps', { collection: RSVPS_COLLECTION });
      throw new Error(handleFirebaseError(error, 'getRsvps'));
    }
  },

  async saveRsvps(rsvps: RSVP[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      rsvps.forEach((r) => {
        // Ensure RSVP ID follows format: `${userId}_${eventId}`
        const rsvpId = r.id || generateRsvpId(r.userId, r.eventId);
        const ref = doc(db, RSVPS_COLLECTION, rsvpId);
        batch.set(ref, { ...r, id: rsvpId }, { merge: true });
      });
      await batch.commit();
    } catch (error: any) {
      logFirebaseError(error, 'saveRsvps', { count: rsvps.length });
      throw new Error(handleFirebaseError(error, 'saveRsvps'));
    }
  },

  async getAttendance(): Promise<AttendanceRecord[]> {
    try {
      const snap = await getDocs(query(collection(db, ATTENDANCE_COLLECTION)));
      return snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          eventId: data.eventId,
          userId: data.userId,
          checkInAt: data.checkInAt,
          checkOutAt: data.checkOutAt,
        } as AttendanceRecord;
      });
    } catch (error: any) {
      logFirebaseError(error, 'getAttendance', { collection: ATTENDANCE_COLLECTION });
      throw new Error(handleFirebaseError(error, 'getAttendance'));
    }
  },

  async saveAttendance(records: AttendanceRecord[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      records.forEach((rec) => {
        // Attendance ID format: `${userId}_${eventId}` (corrected from previous format)
        const attendanceId = generateAttendanceId(rec.userId, rec.eventId);
        const ref = doc(db, ATTENDANCE_COLLECTION, attendanceId);
        batch.set(ref, rec, { merge: true });
      });
      await batch.commit();
    } catch (error: any) {
      logFirebaseError(error, 'saveAttendance', { count: records.length });
      throw new Error(handleFirebaseError(error, 'saveAttendance'));
    }
  },

  // Membership operations
  async getMemberships(): Promise<Membership[]> {
    try {
      const snap = await getDocs(query(collection(db, MEMBERSHIPS_COLLECTION)));
      return snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          userId: data.userId,
          clubId: data.clubId,
          role: data.role || 'member',
          joinedAt: (data.joinedAt?.toDate?.() ?? new Date(data.joinedAt ?? Date.now())) as Date,
          status: data.status || 'active',
        } as Membership;
      });
    } catch (error: any) {
      logFirebaseError(error, 'getMemberships', { collection: MEMBERSHIPS_COLLECTION });
      throw new Error(handleFirebaseError(error, 'getMemberships'));
    }
  },

  async saveMembership(membership: Membership): Promise<void> {
    try {
      // Membership ID format: `${userId}_${clubId}`
      const membershipId = membership.id || generateMembershipId(membership.userId, membership.clubId);
      const ref = doc(db, MEMBERSHIPS_COLLECTION, membershipId);
      await setDoc(ref, { ...membership, id: membershipId }, { merge: true });
    } catch (error: any) {
      logFirebaseError(error, 'saveMembership', { userId: membership.userId, clubId: membership.clubId });
      throw new Error(handleFirebaseError(error, 'saveMembership'));
    }
  },

  // Feedback operations
  async getFeedback(): Promise<Feedback[]> {
    try {
      const snap = await getDocs(query(collection(db, FEEDBACK_COLLECTION)));
      return snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          userId: data.userId,
          eventId: data.eventId,
          rating: data.rating,
          comment: data.comment,
          submittedAt: (data.submittedAt?.toDate?.() ?? new Date(data.submittedAt ?? Date.now())) as Date,
        } as Feedback;
      });
    } catch (error: any) {
      logFirebaseError(error, 'getFeedback', { collection: FEEDBACK_COLLECTION });
      throw new Error(handleFirebaseError(error, 'getFeedback'));
    }
  },

  async saveFeedback(feedback: Feedback): Promise<void> {
    try {
      // Feedback ID format: `${userId}_${eventId}`
      const feedbackId = feedback.id || generateFeedbackId(feedback.userId, feedback.eventId);
      const ref = doc(db, FEEDBACK_COLLECTION, feedbackId);
      await setDoc(ref, { ...feedback, id: feedbackId }, { merge: true });
    } catch (error: any) {
      logFirebaseError(error, 'saveFeedback', { userId: feedback.userId, eventId: feedback.eventId });
      throw new Error(handleFirebaseError(error, 'saveFeedback'));
    }
  },

  // Test Firebase connection (for debugging)
  async testConnection(collectionName: string, docId: string): Promise<any> {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log('✅ Success:', docSnap.data());
        return docSnap.data();
      } else {
        console.log('⚠️ Document does not exist');
        return null;
      }
    } catch (error: any) {
      logFirebaseError(error, `testConnection (${collectionName}/${docId})`);
      throw error;
    }
  },

  // Test function to verify event fetching
  async testEventFetch(): Promise<void> {
    try {
      console.log('🧪 TEST: Starting event fetch test...');
      const eventsRef = collection(db, EVENTS_COLLECTION);
      const snapshot = await getDocs(eventsRef);
      
      console.log('🧪 TEST: Total docs in events collection:', snapshot.size);
      
      if (snapshot.empty) {
        console.log('🧪 TEST: ⚠️ No events found in collection');
        console.log('🧪 TEST: Check Firestore rules and collection name');
        return;
      }
      
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log('🧪 TEST Event:', {
          id: doc.id,
          name: data.title || data.name || 'Untitled',
          hasImage: !!data.image,
          imageUrl: data.image ? data.image.substring(0, 50) + '...' : 'N/A',
          date: data.date,
          location: data.location,
        });
      });
      
      console.log('🧪 TEST: ✅ Event fetch test completed');
    } catch (error: any) {
      console.log('🧪 TEST Error:', error.message);
      console.log('🧪 TEST Error Code:', error.code);
    }
  },
};
