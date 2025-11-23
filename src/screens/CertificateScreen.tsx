import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../constants/colors';
import { useCampusData } from '../context/CampusDataContext';
import { RootStackParamList } from '../navigation/types';
import { mockUser } from '../constants/mockData';

type RouteProps = RouteProp<RootStackParamList, 'Certificate'>;

export const CertificateScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { getEventById, getUserAttendanceStatus } = useCampusData();
  const event = getEventById(route.params.eventId);

  if (!event) {
    Alert.alert('Missing', 'Event not found');
    return null;
  }

  const status = getUserAttendanceStatus(event.id, mockUser.id);

  return (
    <View style={styles.container}>
      {status !== 'checked_out' ? (
        <Text style={styles.info}>Complete check-out to view your certificate.</Text>
      ) : (
        <View style={styles.card}>
          <Text style={styles.title}>Certificate of Participation</Text>
          <Text style={styles.name}>{mockUser.name}</Text>
          <Text style={styles.event}>{event.title}</Text>
          <Text style={styles.meta}>{event.date} • {event.location}</Text>
        </View>
      )}
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    color: Colors.mutedText,
    marginBottom: 16,
  },
  card: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  event: {
    color: Colors.primary,
    marginBottom: 6,
    fontWeight: '600',
  },
  meta: {
    color: Colors.mutedText,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});