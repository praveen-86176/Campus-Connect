import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { useCampusData } from '../context/CampusDataContext';
import { RootStackParamList } from '../navigation/types';
import { MyEventCard } from '../components/MyEventCard';
import { TabSwitcher } from '../components/TabSwitcher';

type NavProps = NativeStackNavigationProp<RootStackParamList>;

// Mock data for past events
const pastEvents = [
  {
    id: 'past1',
    title: 'Welcome Week Mixer',
    clubName: 'Student Government',
    date: 'Nov 15, 2025',
    time: '5:00 PM',
    location: 'Main Quad',
    status: 'attended' as const,
  },
  {
    id: 'past2',
    title: 'Career Fair 2025',
    clubName: 'Career Services',
    date: 'Nov 10, 2025',
    time: '10:00 AM',
    location: 'Convention Center',
    status: 'attended' as const,
  },
  {
    id: 'past3',
    title: 'Movie Night: Tech Edition',
    clubName: 'Film Society',
    date: 'Nov 5, 2025',
    time: '8:00 PM',
    location: 'Media Arts Theater',
    status: 'missed' as const,
  },
];

export const MyRsvpsScreen: React.FC = () => {
  const navigation = useNavigation<NavProps>();
  const { rsvps, getEventById, events } = useCampusData();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const [activeTab, setActiveTab] = useState(0); // 0 = Upcoming, 1 = Past Events

  // Get upcoming events from RSVPs
  const upcomingEvents = rsvps
    .map((rsvp) => {
      const event = getEventById(rsvp.eventId);
      if (!event) return null;

      return {
        id: event.id,
        title: event.title,
        clubName: 'Computer Science Club',
        date: event.date,
        time: event.time,
        location: event.location,
        status: 'confirmed' as const,
      };
    })
    .filter((event) => event !== null);

  // Statistics
  const upcomingCount = upcomingEvents.length;
  const attendedCount = 12;
  const waitlistCount = 1;

  const handleEventPress = (eventId: string) => {
    navigation.navigate('EventDetails', { eventId });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Events</Text>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{upcomingCount}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedText }]}>Upcoming</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#DCFCE7' }]}>
            <Text style={[styles.statValue, { color: '#22C55E' }]}>{attendedCount}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedText }]}>Attended</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>{waitlistCount}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedText }]}>Waitlist</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tab Switcher */}
        <TabSwitcher
          tabs={['Upcoming', 'Past Events']}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Upcoming Events */}
        {activeTab === 0 && (
          <View>
            {upcomingEvents.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.mutedText }]}>No upcoming events</Text>
            ) : (
              upcomingEvents.map((event) => (
                <MyEventCard
                  key={event.id}
                  title={event.title}
                  clubName={event.clubName}
                  date={event.date}
                  time={event.time}
                  location={event.location}
                  status={event.status}
                  reminderSet={true}
                  onPress={() => handleEventPress(event.id)}
                  showActions={true}
                />
              ))
            )}
          </View>
        )}

        {/* Past Events */}
        {activeTab === 1 && (
          <View>
            {pastEvents.map((event) => (
              <MyEventCard
                key={event.id}
                title={event.title}
                clubName={event.clubName}
                date={event.date}
                time={event.time}
                location={event.location}
                status={event.status}
                showActions={false}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
});

