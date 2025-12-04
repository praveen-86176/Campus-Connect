import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Share, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import QRCode from 'react-native-qrcode-svg';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { useCampusData } from '../context/CampusDataContext';
import { RootStackParamList } from '../navigation/types';

const formatDateTime = (date: string, time: string) => `${date} • ${time}`;

type RouteProps = RouteProp<RootStackParamList, 'EventDetails'>;
type NavProps = NativeStackNavigationProp<RootStackParamList>;

export const EventDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NavProps>();
  const route = useRoute<RouteProps>();
  const { getEventById, rsvps, getUserAttendanceStatus, getEventAttendanceAnalytics } = useCampusData();
  const { user } = useAuth();
  const event = getEventById(route.params.eventId);

  const existingRsvp = useMemo(
    () => rsvps.find((record) => record.eventId === route.params.eventId && record.userId === (user?.uid ?? '')),
    [rsvps, route.params.eventId]
  );

  if (!event) {
    Alert.alert('Event missing', 'Unable to find this event.');
    navigation.goBack();
    return null;
  }

  const qrPayload = JSON.stringify({ eventId: event.id, userId: user?.uid, timestamp: existingRsvp?.timestamp ?? new Date().toISOString() });

  const attendanceStatus = getUserAttendanceStatus(event.id, user?.uid ?? '');
  const analytics = getEventAttendanceAnalytics(event.id);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.meta}>{formatDateTime(event.date, event.time)}</Text>
          <Text style={styles.location}>{event.location}</Text>
          <Text style={styles.description}>{event.description}</Text>

          <TouchableOpacity
            style={[styles.button, styles.shareButton]}
            onPress={async () => {
              try {
                const url = Linking.createURL(`/events/${event.id}`);
                await Share.share({
                  message: `Check out this event: ${event.title}\n${url}`,
                  url: url, // iOS
                  title: event.title, // Android
                });
              } catch (error) {
                Alert.alert('Error', 'Failed to share event');
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={`Share ${event.title}`}
          >
            <Text style={styles.buttonText}>Share Event</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('RSVPForm', { eventId: event.id })}
            accessibilityRole="button"
            accessibilityLabel={`RSVP for ${event.title}`}
          >
            <Text style={styles.buttonText}>{existingRsvp ? 'Update RSVP' : 'RSVP Now'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('QRScanner')}
            accessibilityRole="button"
            accessibilityLabel="Scan QR for attendance"
          >
            <Text style={styles.buttonText}>Scan QR for Attendance</Text>
          </TouchableOpacity>

          <View style={styles.statsRow}>
            <Text style={styles.stat}>Checked-in: {analytics.checkedIn}</Text>
            <Text style={styles.stat}>Checked-out: {analytics.checkedOut}</Text>
            <Text style={styles.stat}>RSVP: {analytics.totalRsvps}</Text>
            <Text style={styles.stat}>Rate: {analytics.totalRsvps ? Math.round((analytics.checkedIn / analytics.totalRsvps) * 100) : 0}%</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, { marginBottom: 12 }]}
            onPress={() => navigation.navigate('AttendanceReport', { eventId: event.id })}
            accessibilityRole="button"
            accessibilityLabel="View attendance report"
          >
            <Text style={styles.buttonText}>Attendance Report</Text>
          </TouchableOpacity>

          {existingRsvp ? (
            <View style={styles.qrContainer}>
              <Text style={styles.qrTitle}>Your QR Pass</Text>
              <QRCode value={qrPayload} size={180} />
              <Text style={styles.qrNote}>Show this at the event entrance.</Text>
              {attendanceStatus === 'checked_out' ? (
                <TouchableOpacity
                  style={[styles.button, { marginTop: 16 }]}
                  onPress={() => navigation.navigate('Certificate', { eventId: event.id })}
                  accessibilityRole="button"
                  accessibilityLabel="View certificate"
                >
                  <Text style={styles.buttonText}>View Certificate</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
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
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  meta: {
    color: Colors.mutedText,
    marginBottom: 4,
  },
  location: {
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 16,
  },
  description: {
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  shareButton: {
    backgroundColor: '#4CAF50',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 24,
  },
  qrTitle: {
    fontWeight: '600',
    marginBottom: 12,
    color: Colors.text,
  },
  qrNote: {
    marginTop: 12,
    color: Colors.mutedText,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  stat: {
    backgroundColor: Colors.card,
    color: Colors.text,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 8,
  },
});
