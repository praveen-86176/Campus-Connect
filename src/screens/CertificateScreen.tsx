import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useCampusData } from '../context/CampusDataContext';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';

type RouteProps = RouteProp<RootStackParamList, 'Certificate'>;

export const CertificateScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { getEventById, getUserAttendanceStatus } = useCampusData();
  const { user } = useAuth();
  const event = getEventById(route.params.eventId);

  if (!event) {
    Alert.alert('Missing', 'Event not found');
    return null;
  }

  const status = getUserAttendanceStatus(event.id, user?.uid ?? '');

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {status !== 'checked_out' ? (
            <View style={styles.infoContainer}>
              <Text style={styles.info}>Complete check-out to view your certificate.</Text>
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.title}>Certificate of Participation</Text>
              <Text style={styles.name}>{user?.name ?? ''}</Text>
              <Text style={styles.event}>{event.title}</Text>
              <Text style={styles.meta}>{event.date} • {event.location}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  infoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  info: {
    color: Colors.mutedText,
    marginBottom: 16,
    textAlign: 'center',
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
