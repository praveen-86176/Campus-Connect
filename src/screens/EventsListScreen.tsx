import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { EventCard } from '../components/EventCard';
import { EmptyState } from '../components/EmptyState';
import { getColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { useCampusData } from '../context/CampusDataContext';
import { RootStackParamList } from '../navigation/types';
import { Event, FilterType } from '../types';

const filterEvents = (events: Event[], filter: FilterType) => {
  const now = new Date();
  switch (filter) {
    case 'upcoming':
      return events.filter((event) => new Date(event.date) >= now);
    case 'past':
      return events.filter((event) => new Date(event.date) < now);
    default:
      return events;
  }
};

type RouteProps = RouteProp<RootStackParamList, 'EventsList'>;
type NavProps = NativeStackNavigationProp<RootStackParamList>;

export const EventsListScreen: React.FC = () => {
  const navigation = useNavigation<NavProps>();
  const route = useRoute<RouteProps>();
  const { clubId, clubName } = route.params;
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const { getEventsByClub, clubs } = useCampusData();
  const [filter, setFilter] = useState<FilterType>('upcoming');

  // Get club details for display
  const club = clubs.find(c => c.id === clubId);

  // Filter events strictly by clubId - only show events that belong to this specific club
  const events = useMemo(() => {
    if (!clubId) return [];
    const clubEvents = getEventsByClub(clubId);
    // Double-check that all events belong to this club
    return clubEvents.filter(event => event.clubId === clubId);
  }, [getEventsByClub, clubId]);

  const filteredEvents = useMemo(() => filterEvents(events, filter), [events, filter]);

  const handleEventPress = (event: Event) => {
    navigation.navigate('EventDetails', { eventId: event.id });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.card }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {clubName || club?.name || 'Club Events'}
            </Text>
            {club && (
              <Text style={[styles.subtitle, { color: colors.mutedText }]} numberOfLines={1}>
                {events.length} event{events.length !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Filter Row */}
        <View style={styles.filterRow}>
          {(['upcoming', 'past', 'all'] as FilterType[]).map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.filterChip,
                { backgroundColor: filter === option ? colors.primary : colors.card },
                { borderColor: filter === option ? colors.primary : colors.border }
              ]}
              onPress={() => setFilter(option)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: filter === option ? '#FFFFFF' : colors.text }
                ]}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Events List */}
        <FlatList
          data={filteredEvents}
          keyExtractor={(event) => event.id}
          renderItem={({ item }) => <EventCard event={item} onPress={handleEventPress} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color={colors.mutedText} />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No events found
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.mutedText }]}>
                {filter === 'upcoming'
                  ? `No upcoming events for ${clubName || 'this club'}`
                  : filter === 'past'
                  ? `No past events for ${clubName || 'this club'}`
                  : `No events available for ${clubName || 'this club'}`}
              </Text>
            </View>
          }
          contentContainerStyle={filteredEvents.length === 0 ? styles.empty : styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  empty: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
