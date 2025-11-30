import { Club, Event, RSVP, UserProfile } from '../types';

export const mockUser: UserProfile = {
  id: 'user123',
  name: 'Sarah Johnson',
  email: 'sarah@college.edu',
};

export const mockClubs: Club[] = [
  {
    id: '1',
    name: 'Computer Science Club',
    description: 'Weekly coding workshops and tech talks',
    logo: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?fm=jpg&fit=crop&w=100&q=40',
    memberCount: 234,
  },
  {
    id: '2',
    name: 'Photography Club',
    description: 'Capture campus moments and learn photography',
    logo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?fm=jpg&fit=crop&w=100&q=40',
    memberCount: 156,
  },
  {
    id: '3',
    name: 'Drama Club',
    description: 'Stage performances and improv workshops',
    logo: 'https://images.unsplash.com/photo-1515165562835-c4c1bfa2b805?fm=jpg&fit=crop&w=100&q=40',
    memberCount: 89,
  },
];

export const mockEvents: Event[] = [
  {
    id: '1',
    clubId: '1',
    title: 'Tech Talk: AI in Modern Development',
    description: 'Explore the latest AI technologies and their applications in software development.',
    date: 'Nov 28, 2025',
    time: '6:00 PM',
    location: 'Engineering Hall 205',
    capacity: 100,
    rsvpCount: 45,
  },
  {
    id: '2',
    clubId: '2',
    title: 'Hack Night',
    description: 'Team up to solve real problems overnight.',
    date: '2025-11-25',
    time: '07:00 PM',
    location: 'Innovation Lab',
    capacity: 50,
    rsvpCount: 40,
  },
  {
    id: '3',
    clubId: '3',
    title: 'Winter Showcase',
    description: 'Drama club presents original skits.',
    date: '2025-12-10',
    time: '06:00 PM',
    location: 'Auditorium',
    capacity: 100,
    rsvpCount: 75,
  },
  {
    id: '4',
    clubId: '1',
    title: 'Editing Masterclass',
    description: 'Learn Lightroom basics and workflow tips.',
    date: '2025-11-22',
    time: '02:00 PM',
    location: 'Media Center',
    capacity: 25,
    rsvpCount: 18,
  },
];

export const mockRsvps: RSVP[] = [
  {
    id: '1',
    userId: mockUser.id,
    eventId: '1',
    userName: mockUser.name,
    email: mockUser.email,
    phone: '9876543210',
    timestamp: '2025-11-15T10:30:00Z',
    attended: false,
  },
];
