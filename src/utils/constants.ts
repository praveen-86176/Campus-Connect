/**
 * Application-wide constants
 * Centralized location for all constant values
 */

// ==================== FIREBASE COLLECTIONS ====================
export const FIREBASE_COLLECTIONS = {
  USERS: 'users',
  CLUBS: 'clubs',
  EVENTS: 'events',
  RSVPS: 'rsvps',
  ATTENDANCE: 'attendance',
  MEMBERSHIPS: 'memberships',
  FEEDBACK: 'feedback',
  NOTIFICATIONS: 'notifications',
} as const;

// ==================== USER ROLES ====================
export const USER_ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
  DEVELOPER: 'developer',
  ORGANIZER: 'organizer',
  CLUB_LEADER: 'club_leader',
} as const;

export type UserRoleType = typeof USER_ROLES[keyof typeof USER_ROLES];

export const ADMIN_ROLES = {
  CLUB_COORDINATOR: 'Club Coordinator',
  EVENTS_MANAGER: 'Events Manager',
  CAMPUS_ADMINISTRATOR: 'Campus Administrator',
} as const;

export const CLUB_LEADER_ROLES = {
  PRESIDENT: 'President',
  VICE_PRESIDENT: 'Vice President',
  COORDINATOR: 'Coordinator',
} as const;

// ==================== EVENT STATUS ====================
export const EVENT_STATUS = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  UPCOMING: 'Upcoming',
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
} as const;

export type EventStatusType = typeof EVENT_STATUS[keyof typeof EVENT_STATUS];

// ==================== ATTENDANCE STATUS ====================
export const ATTENDANCE_STATUS = {
  ABSENT: 'absent',
  CHECKED_IN: 'checked_in',
  CHECKED_OUT: 'checked_out',
} as const;

export type AttendanceStatusType = typeof ATTENDANCE_STATUS[keyof typeof ATTENDANCE_STATUS];

// ==================== CLUB CATEGORIES ====================
export const CLUB_CATEGORIES = {
  TECH: 'Tech',
  CULTURAL: 'Cultural',
  SPORTS: 'Sports',
  ARTS: 'Arts',
  ACADEMIC: 'Academic',
  SOCIAL: 'Social',
  OTHER: 'Other',
} as const;

export type ClubCategoryType = typeof CLUB_CATEGORIES[keyof typeof CLUB_CATEGORIES];

// ==================== MEMBERSHIP STATUS ====================
export const MEMBERSHIP_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export type MembershipStatusType = typeof MEMBERSHIP_STATUS[keyof typeof MEMBERSHIP_STATUS];

// ==================== MEMBERSHIP ROLES ====================
export const MEMBERSHIP_ROLES = {
  MEMBER: 'member',
  LEADER: 'leader',
  ORGANIZER: 'organizer',
} as const;

export type MembershipRoleType = typeof MEMBERSHIP_ROLES[keyof typeof MEMBERSHIP_ROLES];

// ==================== MEETING PLATFORMS ====================
export const MEETING_PLATFORMS = {
  ZOOM: 'Zoom',
  GOOGLE_MEET: 'Google Meet',
  YOUTUBE: 'YouTube',
  OTHER: 'Other',
} as const;

export type MeetingPlatformType = typeof MEETING_PLATFORMS[keyof typeof MEETING_PLATFORMS];

// ==================== FILTER TYPES ====================
export const FILTER_TYPES = {
  UPCOMING: 'upcoming',
  PAST: 'past',
  ALL: 'all',
} as const;

export type FilterTypeType = typeof FILTER_TYPES[keyof typeof FILTER_TYPES];

// ==================== VALIDATION CONSTANTS ====================
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 1000,
  MIN_EVENT_CAPACITY: 1,
  MAX_EVENT_CAPACITY: 10000,
  PHONE_LENGTH: 10,
} as const;

// ==================== DATE/TIME FORMATS ====================
export const DATE_FORMATS = {
  DISPLAY: 'MMMM dd, yyyy',
  SHORT: 'MMM dd, yyyy',
  ISO: 'yyyy-MM-dd',
  TIME: 'hh:mm a',
  DATETIME: 'MMMM dd, yyyy • hh:mm a',
} as const;

// ==================== IMAGE CONSTANTS ====================
export const IMAGE_CONFIG = {
  MAX_SIZE_MB: 5,
  ALLOWED_FORMATS: ['image/jpeg', 'image/png', 'image/jpg'],
  DEFAULT_QUALITY: 0.8,
  EVENT_IMAGE_ASPECT: [16, 9] as [number, number],
  PROFILE_IMAGE_ASPECT: [1, 1] as [number, number],
} as const;

// ==================== PAGINATION ====================
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// ==================== ERROR MESSAGES ====================
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  GENERIC_ERROR: 'An error occurred. Please try again.',
  LOAD_ERROR: 'Failed to load data. Please try again.',
  SAVE_ERROR: 'Failed to save. Please try again.',
  DELETE_ERROR: 'Failed to delete. Please try again.',
  UPLOAD_ERROR: 'Failed to upload image. Please try again.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
} as const;

// ==================== SUCCESS MESSAGES ====================
export const SUCCESS_MESSAGES = {
  SAVED: 'Successfully saved!',
  DELETED: 'Successfully deleted!',
  UPLOADED: 'Successfully uploaded!',
  RSVP_CONFIRMED: 'RSVP confirmed!',
  CHECK_IN_SUCCESS: 'Successfully checked in!',
  CHECK_OUT_SUCCESS: 'Successfully checked out!',
} as const;

// ==================== CLOUDINARY FOLDERS ====================
export const CLOUDINARY_FOLDERS = {
  EVENT_PHOTOS: 'event-photos',
  PROFILE_PHOTOS: 'profile-photos',
  CLUB_LOGOS: 'club-logos',
} as const;
