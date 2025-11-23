import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { EventCard } from '../components/EventCard';
import { EmptyState } from '../components/EmptyState';
import { Colors } from '../constants/colors';
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
  const { getEventsByClub } = useCampusData();
  const [filter, setFilter] = useState<FilterType>('upcoming');

  const events = useMemo(() => getEventsByClub(clubId), [getEventsByClub, clubId]);
  const filteredEvents = useMemo(() => filterEvents(events, filter), [events, filter]);

  const handleEventPress = (event: Event) => {
    navigation.navigate('EventDetails', { eventId: event.id });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{clubName ?? 'Events'}</Text>
      <View style={styles.filterRow}>
        {(['upcoming', 'past', 'all'] as FilterType[]).map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.filterChip, filter === option && styles.filterChipActive]}
            onPress={() => setFilter(option)}
          >
            <Text style={[styles.filterText, filter === option && styles.filterTextActive]}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredEvents}
        keyExtractor={(event) => event.id}
        renderItem={({ item }) => <EventCard event={item} onPress={handleEventPress} />}
        ListEmptyComponent={<EmptyState message="No events found for this filter." />}
        contentContainerStyle={filteredEvents.length === 0 ? styles.empty : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    color: Colors.text,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  empty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});
