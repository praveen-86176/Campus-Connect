/**
 * ID Generation Utilities
 * 
 * Consistent ID format conventions:
 * - RSVP ID: `${userId}_${eventId}`
 * - Membership ID: `${userId}_${clubId}`
 * - Attendance ID: `${userId}_${eventId}`
 * - Feedback ID: `${userId}_${eventId}`
 */

/**
 * Generate RSVP ID
 * Format: `${userId}_${eventId}`
 */
export const generateRsvpId = (userId: string, eventId: string): string => {
  return `${userId}_${eventId}`;
};

/**
 * Generate Membership ID
 * Format: `${userId}_${clubId}`
 */
export const generateMembershipId = (userId: string, clubId: string): string => {
  return `${userId}_${clubId}`;
};

/**
 * Generate Attendance ID
 * Format: `${userId}_${eventId}`
 */
export const generateAttendanceId = (userId: string, eventId: string): string => {
  return `${userId}_${eventId}`;
};

/**
 * Generate Feedback ID
 * Format: `${userId}_${eventId}`
 */
export const generateFeedbackId = (userId: string, eventId: string): string => {
  return `${userId}_${eventId}`;
};

/**
 * Parse ID to extract userId and relatedId
 */
export const parseId = (id: string): { userId: string; relatedId: string } | null => {
  const parts = id.split('_');
  if (parts.length < 2) return null;
  
  const userId = parts[0];
  const relatedId = parts.slice(1).join('_'); // In case relatedId contains underscores
  
  return { userId, relatedId };
};

