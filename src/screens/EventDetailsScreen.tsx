import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Share, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { useCampusData } from '../context/CampusDataContext';
import { RootStackParamList } from '../navigation/types';
import { canMarkAttendance } from '../utils/roleUtils';
import { CheckInInstructions } from '../components/CheckInInstructions';

const formatDateTime = (date: string, time: string) => `${date} • ${time}`;

type RouteProps = RouteProp<RootStackParamList, 'EventDetails'>;
type NavProps = NativeStackNavigationProp<RootStackParamList>;

export const EventDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NavProps>();
  const route = useRoute<RouteProps>();
  const { getEventById, rsvps, getUserAttendanceStatus, getEventAttendanceAnalytics } = useCampusData();
  const { user } = useAuth();
  const event = getEventById(route.params.eventId);
  const isAdminOrOrganizer = canMarkAttendance(user);

  const existingRsvp = useMemo(
    () => rsvps.find((record) => record.eventId === route.params.eventId && record.userId === (user?.uid ?? '')),
    [rsvps, route.params.eventId]
  );

  if (!event) {
    Alert.alert('Event missing', 'Unable to find this event.');
    navigation.goBack();
    return null;
  }

  // Generate QR code payload with RSVP ID for better tracking
  const qrPayload = JSON.stringify({ 
    rsvpId: existingRsvp?.id,
    eventId: event.id, 
    userId: user?.uid, 
    timestamp: existingRsvp?.timestamp ?? new Date().toISOString() 
  });

  const attendanceStatus = getUserAttendanceStatus(event.id, user?.uid ?? '');
  const analytics = getEventAttendanceAnalytics(event.id);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {event.title}
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Event Image */}
          {/* Use same logic as CreateEventScreen: image && image.trim() !== '' */}
          {event.image && typeof event.image === 'string' && event.image.trim() !== '' ? (
            <Image
              source={{ uri: event.image.trim() }}
              style={styles.eventImage}
              resizeMode="cover"
              onError={(error) => {
                console.error('❌ Failed to load event image in details:', event.image);
              }}
              onLoad={() => {
                console.log('✅ Event image loaded in details');
              }}
            />
          ) : (
            <LinearGradient
              colors={['#6B9FFF', '#A78BFA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.eventImagePlaceholder}
            >
              <Ionicons name="calendar-outline" size={64} color="rgba(255, 255, 255, 0.4)" />
            </LinearGradient>
          )}

          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.meta}>{formatDateTime(event.date, event.time)}</Text>
          {event.category === 'Online' && event.meetingPlatform ? (
            <View style={styles.locationContainer}>
              <Text style={styles.location}>Online - {event.meetingPlatform}</Text>
              <Ionicons name="videocam" size={16} color={Colors.primary} style={{ marginLeft: 6 }} />
            </View>
          ) : (
            <Text style={styles.location}>{event.location}</Text>
          )}
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

          {/* RSVP button - only show for students, not admins/organizers */}
          {!isAdminOrOrganizer && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('RSVPForm', { eventId: event.id })}
              accessibilityRole="button"
              accessibilityLabel={`RSVP for ${event.title}`}
            >
              <Text style={styles.buttonText}>{existingRsvp ? 'Update RSVP' : 'RSVP Now'}</Text>
            </TouchableOpacity>
          )}

          {/* Show scan button only for admin/organizer */}
          {isAdminOrOrganizer && (
            <TouchableOpacity
              style={[styles.button, styles.scanButton]}
              onPress={() => navigation.navigate('QRScanner', { eventId: event.id })}
              accessibilityRole="button"
              accessibilityLabel="Scan QR for attendance"
            >
              <Ionicons name="qr-code-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Scan QR Code for Attendance</Text>
            </TouchableOpacity>
          )}

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

          {/* Student QR Code and Check-in/Check-out Section */}
          {existingRsvp && !isAdminOrOrganizer ? (
            <View style={styles.qrContainer}>
              <Text style={styles.qrTitle}>Your Event QR Code</Text>
              <Text style={styles.qrSubtitle}>Show this QR code at the event entrance for check-in</Text>
              
              {/* QR Code embedded directly */}
              <View style={styles.qrCodeWrapper}>
                <QRCode value={qrPayload} size={200} />
              </View>
              
              {/* Attendance Status Badge */}
              <View style={[styles.statusBadge, 
                attendanceStatus === 'checked_in' ? styles.statusCheckedIn : 
                attendanceStatus === 'checked_out' ? styles.statusCheckedOut : 
                styles.statusAbsent
              ]}>
                <Ionicons 
                  name={
                    attendanceStatus === 'checked_in' ? 'checkmark-circle' :
                    attendanceStatus === 'checked_out' ? 'checkmark-done-circle' :
                    'time-outline'
                  } 
                  size={20} 
                  color="#fff" 
                />
                <Text style={styles.statusText}>
                  {attendanceStatus === 'checked_in' ? 'Checked In' :
                   attendanceStatus === 'checked_out' ? 'Checked Out' :
                   'Not Checked In'}
                </Text>
              </View>

              {/* Information about QR code check-in */}
              <View style={styles.qrInfoContainer}>
                <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
                <Text style={styles.qrInfoText}>
                  Show this QR code to the event organizer to check in/out
                </Text>
              </View>

              {/* Instructions */}
              <CheckInInstructions />

              {attendanceStatus === 'checked_out' && (
                <TouchableOpacity
                  style={[styles.button, { marginTop: 16 }]}
                  onPress={() => navigation.navigate('Certificate', { eventId: event.id })}
                  accessibilityRole="button"
                  accessibilityLabel="View certificate"
                >
                  <Ionicons name="trophy-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.buttonText}>View Certificate</Text>
                </TouchableOpacity>
              )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  eventImage: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: Colors.card,
  },
  eventImagePlaceholder: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  location: {
    color: Colors.primary,
    fontWeight: '600',
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
  scanButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCodeWrapper: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrSubtitle: {
    fontSize: 14,
    color: Colors.mutedText,
    textAlign: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  statusCheckedIn: {
    backgroundColor: '#10B981',
  },
  statusCheckedOut: {
    backgroundColor: '#3B82F6',
  },
  statusAbsent: {
    backgroundColor: '#6B7280',
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  qrInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  qrInfoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.mutedText,
    lineHeight: 18,
  },
});
