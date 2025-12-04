export type Club = {
  id: string;
  name: string;
  description: string;
  logo: string;
  category: string;
  contactPerson?: string;
  contactEmail?: string;
  meetingLocation?: string;
  meetingTime?: string;
  rules?: string;
  adminId: string;
  memberCount: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Event = {
  id: string;
  clubId: string;
  title: string;
  description: string;
  date: string; // ISO date string
  time: string;
  endTime?: string;
  location: string;
  category: string;
  capacity: number;
  registeredCount: number;
  image?: string;
  status: 'Draft' | 'Published' | 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  registrationRequired: boolean;
  tags?: string[];
  eventLink?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type RSVP = {
  id: string;
  userId: string;
  eventId: string;
  userName: string;
  email: string;
  phone: string;
  timestamp: string;
  attended: boolean;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
};

export type FilterType = 'upcoming' | 'past' | 'all';

export type AttendanceRecord = {
  eventId: string;
  userId: string;
  checkInAt?: string;
  checkOutAt?: string;
};

export type AttendanceStatus = 'absent' | 'checked_in' | 'checked_out';

// Role hierarchy types
export type UserRole = 'student' | 'admin' | 'developer' | 'organizer' | 'club_leader';
export type ClubLeaderRole = 'President' | 'Vice President' | 'Coordinator';

// Authentication types
export type User = {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  photoURL?: string;
  role?: UserRole;
  createdAt: Date;
  // Admin fields
  institution?: string;
  adminRole?: 'Club Coordinator' | 'Events Manager' | 'Campus Administrator';
  collegeId?: string;
  // Student fields
  major?: string;
  graduationYear?: string;
  yearOfStudy?: 'Freshman' | 'Sophomore' | 'Junior' | 'Senior';
  interests?: string[];
  // Club Leader fields
  clubLeaderRole?: ClubLeaderRole;
  managedClubIds?: string[]; // Clubs this user manages
};

// Membership type
export type Membership = {
  id: string; // Format: `${userId}_${clubId}`
  userId: string;
  clubId: string;
  role?: 'member' | 'leader' | 'organizer';
  joinedAt: Date;
  status: 'active' | 'inactive';
};

// Feedback type
export type Feedback = {
  id: string; // Format: `${userId}_${eventId}`
  userId: string;
  eventId: string;
  rating?: number; // 1-5
  comment?: string;
  submittedAt: Date;
};

export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: { selectedRole?: 'student' | 'admin' };
  SignUp: { selectedRole?: 'student' | 'admin' };
  AdminSignUp: undefined;
  StudentSignUp: undefined;
  ForgotPassword: undefined;
};
