import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { Colors } from '../constants/colors';
import { useCampusData } from '../context/CampusDataContext';
import { RootStackParamList } from '../navigation/types';

const formatLabel = (date: string, time: string) => `${date} • ${time}`;

type NavProps = NativeStackNavigationProp<RootStackParamList>;

export const MyRsvpsScreen: React.FC = () => {
  const navigation = useNavigation<NavProps>();
  const { rsvps, getEventById, getUserAttendanceStatus } = useCampusData();

  const renderRow = ({ item }: { item: typeof rsvps[number] }) => {
    const event = getEventById(item.eventId);
    if (!event) {
      return null;
    }

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}
        accessibilityRole="button"
        accessibilityLabel={`Open ${event.title} details`}
      >
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.detail}>{formatLabel(event.date, event.time)}</Text>
        {(() => {
          const status = getUserAttendanceStatus(event.id, item.userId);
          const attended = status === 'checked_out';
          return (
            <Text style={[styles.status, attended ? styles.attended : styles.pending]}>
              {attended ? 'Attended' : 'Upcoming'}
            </Text>
          );
        })()}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My RSVPs</Text>
      <FlatList
        data={rsvps}
        keyExtractor={(item) => item.id}
        renderItem={renderRow}
        ListEmptyComponent={<Text style={styles.empty}>You have not RSVP’d to events yet.</Text>}
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
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: Colors.text,
  },
  card: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    ...Platform.select({
      web: { boxShadow: '0px 4px 10px rgba(0,0,0,0.04)' },
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
    }),
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  detail: {
    color: Colors.mutedText,
    marginTop: 4,
  },
  status: {
    marginTop: 8,
    fontWeight: '600',
  },
  attended: {
    color: Colors.success,
  },
  pending: {
    color: Colors.primary,
  },
  empty: {
    marginTop: 24,
    textAlign: 'center',
    color: Colors.mutedText,
  },
});
