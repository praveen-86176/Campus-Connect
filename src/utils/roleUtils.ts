import { User, UserRole, ClubLeaderRole } from '../types';

/**
 * Role Hierarchy Utilities
 * 
 * Hierarchy:
 * - Admin (Highest): Full access to everything
 * - Organizer: Can create/edit events, mark attendance, send notifications, view analytics
 * - Club Leader (President/VP/Coordinator): Can manage their club, create events, view members
 * - Member/Student (Default): Can view clubs/events, RSVP, view own data
 */

export type Permission = 
  | 'view_all_analytics'
  | 'change_user_roles'
  | 'delete_anything'
  | 'create_edit_events'
  | 'mark_attendance'
  | 'send_notifications'
  | 'view_event_analytics'
  | 'manage_club'
  | 'create_club_events'
  | 'view_club_members'
  | 'update_club_info'
  | 'view_clubs_events'
  | 'rsvp_events'
  | 'view_own_data';

/**
 * Check if user has a specific permission
 */
export const hasPermission = (user: User | null, permission: Permission, clubId?: string): boolean => {
  if (!user) return false;

  const role = user.role || 'student';

  // Admin has all permissions
  if (role === 'admin' || role === 'developer') {
    return true;
  }

  // Organizer permissions
  if (role === 'organizer') {
    const organizerPermissions: Permission[] = [
      'create_edit_events',
      'mark_attendance',
      'send_notifications',
      'view_event_analytics',
      'view_clubs_events',
      'rsvp_events',
      'view_own_data',
    ];
    return organizerPermissions.includes(permission);
  }

  // Club Leader permissions (only for their managed clubs)
  if (role === 'club_leader') {
    const isClubManager = clubId && user.managedClubIds?.includes(clubId);
    
    if (isClubManager) {
      const clubLeaderPermissions: Permission[] = [
        'manage_club',
        'create_club_events',
        'view_club_members',
        'update_club_info',
        'view_clubs_events',
        'rsvp_events',
        'view_own_data',
        'view_event_analytics', // For their club's events
      ];
      return clubLeaderPermissions.includes(permission);
    }
  }

  // Student/Member permissions (default)
  const studentPermissions: Permission[] = [
    'view_clubs_events',
    'rsvp_events',
    'view_own_data',
  ];
  return studentPermissions.includes(permission);
};

/**
 * Check if user is admin
 */
export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'admin' || user?.role === 'developer';
};

/**
 * Check if user is organizer
 */
export const isOrganizer = (user: User | null): boolean => {
  return user?.role === 'organizer';
};

/**
 * Check if user is club leader
 */
export const isClubLeader = (user: User | null, clubId?: string): boolean => {
  if (user?.role !== 'club_leader') return false;
  if (!clubId) return true; // If no clubId specified, just check if they're a leader
  return user.managedClubIds?.includes(clubId) ?? false;
};

/**
 * Check if user can manage a specific club
 */
export const canManageClub = (user: User | null, clubId: string): boolean => {
  if (isAdmin(user)) return true;
  return isClubLeader(user, clubId);
};

/**
 * Check if user can create/edit events
 */
export const canCreateEditEvents = (user: User | null, clubId?: string): boolean => {
  if (isAdmin(user)) return true;
  if (isOrganizer(user)) return true;
  if (clubId) return canManageClub(user, clubId);
  return false;
};

/**
 * Check if user can mark attendance
 */
export const canMarkAttendance = (user: User | null): boolean => {
  if (isAdmin(user)) return true;
  if (isOrganizer(user)) return true;
  return false;
};

/**
 * Get user's role display name
 */
export const getRoleDisplayName = (user: User | null): string => {
  if (!user) return 'Guest';
  
  switch (user.role) {
    case 'admin':
    case 'developer':
      return 'Administrator';
    case 'organizer':
      return 'Organizer';
    case 'club_leader':
      return user.clubLeaderRole || 'Club Leader';
    case 'student':
    default:
      return 'Student';
  }
};

