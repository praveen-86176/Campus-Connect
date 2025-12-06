# Utilities Documentation

## ID Generation (`idUtils.ts`)

Consistent ID format conventions for all user-related entities:

### Usage Examples

```typescript
import { 
  generateRsvpId, 
  generateMembershipId, 
  generateAttendanceId, 
  generateFeedbackId 
} from '../utils/idUtils';

// RSVP ID format: `${userId}_${eventId}`
const rsvpId = generateRsvpId('user123', 'event456');
// Result: "user123_event456"

// Membership ID format: `${userId}_${clubId}`
const membershipId = generateMembershipId('user123', 'club001');
// Result: "user123_club001"

// Attendance ID format: `${userId}_${eventId}`
const attendanceId = generateAttendanceId('user123', 'event456');
// Result: "user123_event456"

// Feedback ID format: `${userId}_${eventId}`
const feedbackId = generateFeedbackId('user123', 'event456');
// Result: "user123_event456"
```

## Role-Based Permissions (`roleUtils.ts`)

Role hierarchy and permission checking:

### Role Hierarchy
- **Admin** (Highest): Full access to everything
- **Organizer**: Can create/edit events, mark attendance, send notifications, view analytics
- **Club Leader** (President/VP/Coordinator): Can manage their club, create events, view members
- **Member/Student** (Default): Can view clubs/events, RSVP, view own data

### Usage Examples

```typescript
import { 
  hasPermission, 
  isAdmin, 
  isOrganizer, 
  isClubLeader, 
  canManageClub,
  canCreateEditEvents,
  canMarkAttendance 
} from '../utils/roleUtils';

// Check if user has a specific permission
if (hasPermission(user, 'create_edit_events', clubId)) {
  // User can create/edit events
}

// Check if user is admin
if (isAdmin(user)) {
  // User is an administrator
}

// Check if user can manage a specific club
if (canManageClub(user, 'club001')) {
  // User can manage this club
}

// Check if user can create/edit events
if (canCreateEditEvents(user, clubId)) {
  // User can create/edit events
}
```

## Error Handling (`errorHandler.ts`)

Detailed Firebase error logging and user-friendly error messages:

### Usage Examples

```typescript
import { logFirebaseError, handleFirebaseError, testFirebaseConnection } from '../utils/errorHandler';
import { db } from '../config/firebase.config';

// Log detailed error information
try {
  await someFirebaseOperation();
} catch (error) {
  logFirebaseError(error, 'Operation Name', { context: 'additional info' });
  // Outputs:
  // ❌ Operation Name - Error Code: permission-denied
  // ❌ Operation Name - Error Message: Missing or insufficient permissions
  // ❌ Operation Name - Explanation: Rules rejected the operation
}

// Get user-friendly error message
try {
  await someFirebaseOperation();
} catch (error) {
  const userMessage = handleFirebaseError(error, 'Operation Name');
  Alert.alert('Error', userMessage);
}

// Test Firebase connection
await testFirebaseConnection(db, 'clubs', 'club_001');
// Outputs: ✅ Success: { ... } or ⚠️ Document does not exist
```

### Common Error Codes
- `permission-denied`: Rules rejected the operation
- `not-found`: Document doesn't exist
- `unauthenticated`: User not logged in
- `already-exists`: Document already exists
- `invalid-argument`: Invalid argument provided
- `deadline-exceeded`: Operation timed out
- `resource-exhausted`: Quota exceeded
- `unavailable`: Service temporarily unavailable

