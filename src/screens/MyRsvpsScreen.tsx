import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useCampusData } from '../context/CampusDataContext';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';

const formatLabel = (date: string, time: string) => `${date} • ${time}`;

type NavProps = NativeStackNavigationProp<RootStackParamList>;

export const MyRsvpsScreen: React.FC = () => {
  const navigation = useNavigation<NavProps>();
  const { rsvps, getEventById, getUserAttendanceStatus } = useCampusData();
  const { user } = useAuth();

  const renderRow = ({ item }: { item: typeof rsvps[number] }) => {
    const event = getEventById(item.eventId);
    if (!event) {
      return null;
    }

    const status = getUserAttendanceStatus(event.id, item.userId);
    const attended = status === 'checked_out';

    return (
      <View style={styles.card}>
        <TouchableOpacity 
          style={styles.cardContent}
          onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}
          activeOpacity={0.7}
        >
          <View style={styles.cardInfo}>
            <Text style={styles.title}>{event.title}</Text>
            <Text style={styles.detail}>{formatLabel(event.date, event.time)}</Text>
            <Text style={[styles.status, attended ? styles.attended : styles.pending]}>
              {attended ? 'Attended' : 'Upcoming'}
            </Text>
          </View>
        </TouchableOpacity>
        
        {/* Small QR Button */}
        <TouchableOpacity
          style={styles.qrButton}
          onPress={() => navigation.navigate('RSVPQRCode', { rsvpId: item.id, eventId: event.id })}
          activeOpacity={0.7}
        >
          <Ionicons name="qr-code-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>My RSVPs</Text>
        <FlatList
          data={rsvps.filter((rsvp) => rsvp.userId === user?.uid)}
          keyExtractor={(item) => item.id}
          renderItem={renderRow}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.empty}>You have not RSVP'd to events yet.</Text>}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    backgroundColor: Colors.background,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: Colors.text,
    marginTop: Platform.OS === 'ios' ? 0 : 0,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    padding: 16,
    alignItems: 'center',
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
  cardContent: {
    flex: 1,
  },
  cardInfo: {
    flex: 1,
  },
  qrButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
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
