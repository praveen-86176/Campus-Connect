import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCampusData } from '../context/CampusDataContext';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';
import { getColors } from '../constants/colors';

type RouteProps = RouteProp<RootStackParamList, 'AttendanceReport'>;
type NavProps = NativeStackNavigationProp<RootStackParamList>;

export const AttendanceReportScreen: React.FC = () => {
  const navigation = useNavigation<NavProps>();
  const route = useRoute<RouteProps>();
  const { getAttendanceForEvent, getEventById, rsvps, getEventAttendanceAnalytics } = useCampusData();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const records = getAttendanceForEvent(route.params.eventId);
  const event = getEventById(route.params.eventId);
  const analytics = getEventAttendanceAnalytics(route.params.eventId);
  
  // Get user info from RSVPs
  const getUsername = (userId: string, eventId: string) => {
    const rsvp = rsvps.find(r => r.userId === userId && r.eventId === eventId);
    return rsvp?.userName || 'Unknown User';
  };
  
  const getUserEmail = (userId: string, eventId: string) => {
    const rsvp = rsvps.find(r => r.userId === userId && r.eventId === eventId);
    return rsvp?.email || 'N/A';
  };
  
  // Sort records: checked out first, then checked in, then absent
  const sortedRecords = [...records].sort((a, b) => {
    if (a.checkOutAt && !b.checkOutAt) return -1;
    if (!a.checkOutAt && b.checkOutAt) return 1;
    if (a.checkInAt && !b.checkInAt) return -1;
    if (!a.checkInAt && b.checkInAt) return 1;
    // If both have check-in, sort by time
    if (a.checkInAt && b.checkInAt) {
      return new Date(b.checkInAt).getTime() - new Date(a.checkInAt).getTime();
    }
    return 0;
  });

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      })
    };
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Custom Header with Back Button */}
        <View style={[styles.topHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.topHeaderTitle, { color: colors.text }]}>Attendance Report</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.title, { color: colors.text }]}>Attendance Report</Text>
              {event && (
                <Text style={[styles.eventTitle, { color: colors.mutedText }]} numberOfLines={2}>
                  {event.title}
                </Text>
              )}
              {event && (
                <View style={styles.eventMeta}>
                  <Ionicons name="calendar-outline" size={14} color={colors.mutedText} />
                  <Text style={[styles.eventMetaText, { color: colors.mutedText }]}>
                    {event.date} • {event.time}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Statistics Cards */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="people" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{analytics.totalRsvps}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedText }]}>Total RSVPs</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <View style={[styles.statIconContainer, { backgroundColor: '#10B98120' }]}>
                <Ionicons name="log-in" size={24} color="#10B981" />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{analytics.checkedIn}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedText }]}>Checked In</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <View style={[styles.statIconContainer, { backgroundColor: '#8B5CF620' }]}>
                <Ionicons name="log-out" size={24} color="#8B5CF6" />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{analytics.checkedOut}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedText }]}>Checked Out</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <View style={[styles.statIconContainer, { backgroundColor: '#6B728020' }]}>
                <Ionicons name="close-circle" size={24} color="#6B7280" />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{analytics.absent}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedText }]}>Absent</Text>
            </View>
          </View>

          {/* Attendance Rate */}
          {analytics.totalRsvps > 0 && (() => {
            // Calculate attendance rate: 
            // - 100% for users checked in AND checked out (fully attended)
            // - 50% for users only checked in (not checked out yet)
            const attendanceScore = (analytics.checkedOut * 1.0) + (analytics.checkedIn * 0.5);
            const attendanceRate = Math.round((attendanceScore / analytics.totalRsvps) * 100);
            
            return (
              <View style={[styles.rateCard, { backgroundColor: colors.card }]}>
                <View style={styles.rateHeader}>
                  <Ionicons name="trophy-outline" size={20} color={colors.primary} />
                  <Text style={[styles.rateTitle, { color: colors.text }]}>Attendance Rate</Text>
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
            );
          })()}

          {/* Attendance List Header */}
          <View style={styles.listHeader}>
            <Text style={[styles.listHeaderTitle, { color: colors.text }]}>
              Attendees ({sortedRecords.length})
            </Text>
          </View>

          {/* Attendance List */}
          {sortedRecords.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
              <Ionicons name="calendar-outline" size={64} color={colors.mutedText} />
              <Text style={[styles.emptyText, { color: colors.text }]}>No attendance yet</Text>
              <Text style={[styles.emptySubtext, { color: colors.mutedText }]}>
                Attendance will appear here once students check in via QR code
              </Text>
            </View>
          ) : (
            sortedRecords.map((item, index) => {
              const userName = getUsername(item.userId, item.eventId);
              const userEmail = getUserEmail(item.userId, item.eventId);
              const isCheckedOut = !!item.checkOutAt;
              const isCheckedIn = !!item.checkInAt && !item.checkOutAt;
              const isAbsent = !item.checkInAt;
              
              const checkInDateTime = item.checkInAt ? formatDateTime(item.checkInAt) : null;
              const checkOutDateTime = item.checkOutAt ? formatDateTime(item.checkOutAt) : null;
              
              return (
                <View key={`${item.userId}-${item.eventId}-${index}`} style={[styles.attendeeCard, { backgroundColor: colors.card }]}>
                  <View style={styles.attendeeHeader}>
                    <View style={styles.userInfo}>
                      <View style={[
                        styles.userIcon, 
                        { 
                          backgroundColor: isCheckedOut ? '#8B5CF620' : 
                                         isCheckedIn ? '#10B98120' : 
                                         '#6B728020'
                        }
                      ]}>
                        <Ionicons 
                          name={
                            isCheckedOut ? 'checkmark-done-circle' : 
                            isCheckedIn ? 'log-in' : 
                            'person-outline'
                          } 
                          size={24} 
                          color={
                            isCheckedOut ? '#8B5CF6' : 
                            isCheckedIn ? '#10B981' : 
                            colors.mutedText
                          } 
                        />
                      </View>
                      <View style={styles.userDetails}>
                        <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                          {userName}
                        </Text>
                        <Text style={[styles.userEmail, { color: colors.mutedText }]} numberOfLines={1}>
                          {userEmail}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={[
                      styles.statusBadge,
                      { 
                        backgroundColor: isCheckedOut ? '#8B5CF620' : 
                                       isCheckedIn ? '#10B98120' : 
                                       '#6B728020'
                      }
                    ]}>
                      <Ionicons 
                        name={
                          isCheckedOut ? 'checkmark-done-circle' : 
                          isCheckedIn ? 'log-in' : 
                          'time-outline'
                        }
                        size={14}
                        color={
                          isCheckedOut ? '#8B5CF6' : 
                          isCheckedIn ? '#10B981' : 
                          colors.mutedText
                        }
                      />
                      <Text style={[
                        styles.statusText,
                        { 
                          color: isCheckedOut ? '#8B5CF6' : 
                                 isCheckedIn ? '#10B981' : 
                                 colors.mutedText
                        }
                      ]}>
                        {isCheckedOut ? 'Checked Out' : isCheckedIn ? 'Checked In' : 'Absent'}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Check-in Time */}
                  {checkInDateTime && (
                    <View style={styles.timeRow}>
                      <View style={[styles.timeIconContainer, { backgroundColor: '#10B98120' }]}>
                        <Ionicons name="log-in" size={16} color="#10B981" />
                      </View>
                      <View style={styles.timeDetails}>
                        <Text style={[styles.timeLabel, { color: colors.mutedText }]}>Check-in</Text>
                        <Text style={[styles.timeValue, { color: colors.text }]}>
                          {checkInDateTime.date} at {checkInDateTime.time}
                        </Text>
                      </View>
                    </View>
                  )}
                  
                  {/* Check-out Time */}
                  {checkOutDateTime && (
                    <View style={styles.timeRow}>
                      <View style={[styles.timeIconContainer, { backgroundColor: '#8B5CF620' }]}>
                        <Ionicons name="log-out" size={16} color="#8B5CF6" />
                      </View>
                      <View style={styles.timeDetails}>
                        <Text style={[styles.timeLabel, { color: colors.mutedText }]}>Check-out</Text>
                        <Text style={[styles.timeValue, { color: colors.text }]}>
                          {checkOutDateTime.date} at {checkOutDateTime.time}
                        </Text>
                      </View>
                    </View>
                  )}
                  
                  {/* Absent indicator */}
                  {isAbsent && (
                    <View style={styles.absentIndicator}>
                      <Ionicons name="close-circle-outline" size={16} color={colors.mutedText} />
                      <Text style={[styles.absentText, { color: colors.mutedText }]}>
                        Not checked in yet
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginRight: 8,
  },
  topHeaderTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },
  headerContainer: {
    marginBottom: 24,
    marginTop: 8,
  },
  headerTextContainer: {
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventMetaText: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    maxWidth: '48%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  rateCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  },
  listHeader: {
    marginBottom: 16,
  },
  listHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  attendeeCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  attendeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  userIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  timeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timeDetails: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  absentIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  absentText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  emptyContainer: {
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
