import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCampusData } from '../context/CampusDataContext';
import { RootStackParamList } from '../navigation/types';
import { CheckInInstructions } from '../components/CheckInInstructions';
import { formatDate, formatTime } from '../utils/formatters';

type RouteProps = RouteProp<RootStackParamList, 'RSVPQRCode'>;
type NavProps = NativeStackNavigationProp<RootStackParamList>;

export const RSVPQRCodeScreen: React.FC = () => {
  const navigation = useNavigation<NavProps>();
  const route = useRoute<RouteProps>();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const { user } = useAuth();
  const { rsvps, getEventById, getUserAttendanceStatus, getEventAttendanceAnalytics } = useCampusData();

  const { rsvpId, eventId } = route.params;
  
  // Find the RSVP
  const rsvp = rsvps.find(r => r.id === rsvpId);
  const event = eventId ? getEventById(eventId) : (rsvp ? getEventById(rsvp.eventId) : null);

  if (!rsvp || !event) {
    Alert.alert('Error', 'RSVP or event not found.');
    navigation.goBack();
    return null;
  }

  // Verify this RSVP belongs to the current user (security check)
  if (rsvp.userId !== user?.uid) {
    Alert.alert('Access Denied', 'You do not have permission to view this RSVP QR code.');
    navigation.goBack();
    return null;
  }

  const attendanceStatus = getUserAttendanceStatus(event.id, user?.uid ?? '');
  const analytics = getEventAttendanceAnalytics(event.id);
  
  // Calculate attendance rate: 
  // - 100% for users checked in AND checked out (fully attended)
  // - 50% for users only checked in (not checked out yet)
  const attendanceScore = (analytics.checkedOut * 1.0) + (analytics.checkedIn * 0.5);
  const attendanceRate = analytics.totalRsvps > 0 
    ? Math.round((attendanceScore / analytics.totalRsvps) * 100) 
    : 0;

  // Generate QR code payload with RSVP ID for better tracking
  const qrPayload = JSON.stringify({
    rsvpId: rsvp.id,
    eventId: event.id,
    userId: user?.uid,
    timestamp: rsvp.timestamp,
  });

  const handleShare = async () => {
    try {
      const message = `My RSVP QR Code for ${event.title}\nEvent Date: ${formatDate(event.date, 'full')} at ${formatTime(event.time)}`;
      await Share.share({
        message,
        title: `${event.title} - RSVP QR Code`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share QR code.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: colors.card }]}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Your Event Pass</Text>
              <Text style={[styles.headerSubtitle, { color: colors.mutedText }]} numberOfLines={1}>
                {event.title}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: colors.card }]}
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Event Info Card */}
          <View style={[styles.eventCard, { backgroundColor: colors.card }]}>
            <View style={styles.eventInfoRow}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={[styles.eventInfoText, { color: colors.text }]}>
                {formatDate(event.date, 'full')}
              </Text>
            </View>
            <View style={styles.eventInfoRow}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text style={[styles.eventInfoText, { color: colors.text }]}>
                {formatTime(event.time)}
              </Text>
            </View>
            <View style={styles.eventInfoRow}>
              <Ionicons name="location-outline" size={20} color={colors.primary} />
              <Text style={[styles.eventInfoText, { color: colors.text }]} numberOfLines={2}>
                {event.location}
              </Text>
            </View>
          </View>

          {/* QR Code Section */}
          <View style={[styles.qrContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.qrTitle, { color: colors.text }]}>Your RSVP QR Code</Text>
            <Text style={[styles.qrSubtitle, { color: colors.mutedText }]}>
              Show this QR code to the event organizer for check-in
            </Text>
            
            <View style={styles.qrCodeWrapper}>
              <QRCode value={qrPayload} size={250} />
            </View>

            {/* RSVP Details */}
            <View style={[styles.rsvpDetails, { backgroundColor: colors.background }]}>
              <View style={styles.rsvpDetailRow}>
                <Text style={[styles.rsvpDetailLabel, { color: colors.mutedText }]}>Name:</Text>
                <Text style={[styles.rsvpDetailValue, { color: colors.text }]}>{rsvp.userName}</Text>
              </View>
              <View style={styles.rsvpDetailRow}>
                <Text style={[styles.rsvpDetailLabel, { color: colors.mutedText }]}>Email:</Text>
                <Text style={[styles.rsvpDetailValue, { color: colors.text }]} numberOfLines={1}>
                  {rsvp.email}
                </Text>
              </View>
              <View style={styles.rsvpDetailRow}>
                <Text style={[styles.rsvpDetailLabel, { color: colors.mutedText }]}>RSVP Date:</Text>
                <Text style={[styles.rsvpDetailValue, { color: colors.text }]}>
                  {formatDate(rsvp.timestamp, 'full')}
                </Text>
              </View>
            </View>

            {/* Attendance Status Badge */}
            <View
              style={[
                styles.statusBadge,
                attendanceStatus === 'checked_in'
                  ? styles.statusCheckedIn
                  : attendanceStatus === 'checked_out'
                  ? styles.statusCheckedOut
                  : styles.statusAbsent,
              ]}
            >
              <Ionicons
                name={
                  attendanceStatus === 'checked_in'
                    ? 'checkmark-circle'
                    : attendanceStatus === 'checked_out'
                    ? 'checkmark-done-circle'
                    : 'time-outline'
                }
                size={20}
                color="#fff"
              />
              <Text style={styles.statusText}>
                {attendanceStatus === 'checked_in'
                  ? 'Checked In'
                  : attendanceStatus === 'checked_out'
                  ? 'Checked Out'
                  : 'Not Checked In'}
              </Text>
            </View>
          </View>

          {/* Attendance Rate Card */}
          {analytics.totalRsvps > 0 && (
            <View style={[styles.attendanceRateCard, { backgroundColor: colors.card }]}>
              <View style={styles.rateHeader}>
                <Ionicons name="trophy-outline" size={20} color={colors.primary} />
                <Text style={[styles.rateTitle, { color: colors.text }]}>Event Attendance Rate</Text>
              </View>
              <Text style={[styles.rateValue, { color: colors.primary }]}>
                {attendanceRate}%
              </Text>
              <View style={styles.rateBar}>
                <View 
                  style={[
                    styles.rateBarFill, 
                    { 
                      width: `${Math.min(attendanceRate, 100)}%`,
                      backgroundColor: colors.primary
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.rateSubtext, { color: colors.mutedText }]}>
                {analytics.checkedOut} fully attended • {analytics.checkedIn} checked in • {analytics.absent} absent
              </Text>
            </View>
          )}

          {/* Instructions */}
          <View style={[styles.instructionsContainer, { backgroundColor: colors.card }]}>
            <CheckInInstructions />
          </View>

          {/* Information Banner */}
          <View style={[styles.infoBanner, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              Only event organizers and administrators can scan this QR code for check-in/check-out.
            </Text>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  eventInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  eventInfoText: {
    fontSize: 15,
    flex: 1,
  },
  qrContainer: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  qrSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  qrCodeWrapper: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  rsvpDetails: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  rsvpDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rsvpDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 100,
  },
  rsvpDetailValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
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
  instructionsContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  attendanceRateCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  rateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  rateTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  rateValue: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 12,
  },
  rateBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  rateBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  rateSubtext: {
    fontSize: 13,
    textAlign: 'center',
  },
});
