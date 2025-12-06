import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase.config';
import { Event } from '../../types';
import { createNotification } from './notificationService';

/**
 * Parse time string (e.g., "6:00 PM") to 24-hour format
 */
function parseTimeTo24Hour(timeStr: string): string {
  const trimmed = timeStr.trim();
  const isPM = trimmed.toUpperCase().includes('PM');
  const isAM = trimmed.toUpperCase().includes('AM');
  
  // Remove AM/PM and get time parts
  const timeWithoutAmPm = trimmed.replace(/AM|PM/gi, '').trim();
  const [hours, minutes = '0'] = timeWithoutAmPm.split(':').map(s => s.trim());
  
  let hour24 = parseInt(hours, 10);
  
  if (isPM && hour24 !== 12) {
    hour24 += 12;
  } else if (isAM && hour24 === 12) {
    hour24 = 0;
  }
  
  return `${hour24.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
}

/**
 * Parse date and time strings to a Date object
 */
function parseEventDateTime(dateStr: string, timeStr: string): Date {
  // Date is in YYYY-MM-DD format
  // Time is in format like "6:00 PM"
  const time24Hour = parseTimeTo24Hour(timeStr);
  const dateTimeStr = `${dateStr}T${time24Hour}`;
  return new Date(dateTimeStr);
}

/**
 * Check if an event has ended
 */
export function isEventOver(event: Event): boolean {
  try {
    if (!event.endTime) {
      // If no endTime is set, check if event date has passed
      const eventDate = parseEventDateTime(event.date, event.time);
      return eventDate < new Date();
    }

    // Parse event end datetime
    const eventEndDateTime = parseEventDateTime(event.date, event.endTime);
    return eventEndDateTime < new Date();
  } catch (error) {
    console.error('Error parsing event datetime:', error);
    // If parsing fails, assume event is not over
    return false;
  }
}

/**
 * Check if post-event notifications have already been sent for an event
 */
async function hasNotificationsBeenSent(eventId: string): Promise<boolean> {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);
    
    if (!eventDoc.exists()) {
      return false;
    }
    
    const eventData = eventDoc.data();
    return eventData.postEventNotificationsSent === true;
  } catch (error) {
    console.error('Error checking notification status:', error);
    return false;
  }
}

/**
 * Mark post-event notifications as sent for an event
 */
async function markNotificationsAsSent(eventId: string): Promise<void> {
  try {
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      postEventNotificationsSent: true,
      postEventNotificationsSentAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error marking notifications as sent:', error);
  }
}

/**
 * Send notification to users who successfully attended the event
 */
async function notifyAttendedUsers(
  eventId: string,
  eventName: string,
  userIds: string[]
): Promise<void> {
  const promises = userIds.map(async (userId) => {
    await createNotification(
      userId,
      'event_completed_attended',
      '🎉 Thank You for Attending!',
      `Amazing! You successfully attended "${eventName}". Your presence and engagement made this event truly special. We're grateful for your participation and look forward to seeing you at future events! 🌟`,
      { eventId }
    );
  });

  await Promise.all(promises);
}

/**
 * Send notification to users who were absent
 */
async function notifyAbsentUsers(
  eventId: string,
  eventName: string,
  userIds: string[]
): Promise<void> {
  const promises = userIds.map(async (userId) => {
    await createNotification(
      userId,
      'event_completed_absent',
      '⏰ Event Completed',
      `We noticed you weren't able to attend "${eventName}" that you had registered for. We understand schedules can be busy! Don't worry - there are more exciting events coming up, and we'd love to have you join us next time. 📅`,
      { eventId }
    );
  });

  await Promise.all(promises);
}

/**
 * Process post-event notifications for a single event
 */
export async function processPostEventNotifications(event: Event): Promise<void> {
  try {
    // Check if event is over
    if (!isEventOver(event)) {
      return;
    }

    // Check if notifications have already been sent
    const alreadySent = await hasNotificationsBeenSent(event.id);
    if (alreadySent) {
      console.log(`Post-event notifications already sent for event: ${event.title}`);
      return;
    }

    console.log(`Processing post-event notifications for: ${event.title}`);

    // Get all RSVPs for this event
    const rsvpsRef = collection(db, 'rsvps');
    const rsvpsQuery = query(rsvpsRef, where('eventId', '==', event.id));
    const rsvpsSnapshot = await getDocs(rsvpsQuery);

    // Get all attendance records for this event
    const attendanceRef = collection(db, 'attendance');
    const attendanceQuery = query(attendanceRef, where('eventId', '==', event.id));
    const attendanceSnapshot = await getDocs(attendanceQuery);

    // Create a map of userId -> attendance status
    const attendanceMap = new Map<string, { checkedIn: boolean; checkedOut: boolean }>();
    
    attendanceSnapshot.forEach((doc) => {
      const data = doc.data();
      const userId = data.userId;
      const checkedIn = !!data.checkInAt;
      const checkedOut = !!data.checkOutAt;
      
      attendanceMap.set(userId, { checkedIn, checkedOut });
    });

    // Categorize users
    const attendedUserIds: string[] = []; // Checked in AND checked out
    const absentUserIds: string[] = []; // Registered but didn't check in/out

    rsvpsSnapshot.forEach((doc) => {
      const rsvpData = doc.data();
      const userId = rsvpData.userId;
      const attendance = attendanceMap.get(userId);

      if (attendance?.checkedOut) {
        // User successfully attended (checked in and checked out)
        attendedUserIds.push(userId);
      } else {
        // User was absent (no check-in or only checked in but not out)
        absentUserIds.push(userId);
      }
    });

    // Send notifications
    if (attendedUserIds.length > 0) {
      console.log(`Sending success notifications to ${attendedUserIds.length} users`);
      await notifyAttendedUsers(event.id, event.title, attendedUserIds);
    }

    if (absentUserIds.length > 0) {
      console.log(`Sending absent notifications to ${absentUserIds.length} users`);
      await notifyAbsentUsers(event.id, event.title, absentUserIds);
    }

    // Mark notifications as sent
    await markNotificationsAsSent(event.id);
    
    console.log(`✅ Post-event notifications processed for: ${event.title}`);
  } catch (error) {
    console.error(`Error processing post-event notifications for ${event.title}:`, error);
  }
}

/**
 * Process post-event notifications for all events
 * Call this function periodically or on app load
 */
export async function processAllPostEventNotifications(events: Event[]): Promise<void> {
  const promises = events.map((event) => processPostEventNotifications(event));
  await Promise.all(promises);
}
