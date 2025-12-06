import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useCampusData } from '../../context/CampusDataContext';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/formatters';

import { AdminStackParamList } from '../../navigation/types';

type AnalyticsNavProp = NativeStackNavigationProp<AdminStackParamList>;

const getUserRoleColor = (role?: string): string => {
  switch (role) {
    case 'admin':
    case 'developer':
      return '#F59E0B';
    case 'organizer':
      return '#8B5CF6';
    case 'club_leader':
      return '#10B981';
    case 'student':
    default:
      return '#3B82F6';
  }
};

export const AnalyticsScreen: React.FC = () => {
  const navigation = useNavigation<AnalyticsNavProp>();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const { clubs, events, rsvps, attendance, memberships } = useCampusData();
  
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'clubs' | 'events' | 'rsvps'>('overview');

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAnalytics();
      setAnalytics(data);
    } catch (error: any) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const usersData = await adminService.getAllUsers();
      setUsers(usersData);
    } catch (error: any) {
      console.error('Failed to load users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'grid-outline' },
    { id: 'users', label: 'Users', icon: 'people-outline' },
    { id: 'clubs', label: 'Clubs', icon: 'business-outline' },
    { id: 'events', label: 'Events', icon: 'calendar-outline' },
    { id: 'rsvps', label: 'RSVPs', icon: 'checkmark-circle-outline' },
  ];

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading analytics...</Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Analytics & Reports</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                { 
                  backgroundColor: activeTab === tab.id ? colors.primary : colors.card,
                },
              ]}
              onPress={() => setActiveTab(tab.id as any)}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={18} 
                color={activeTab === tab.id ? '#FFFFFF' : colors.text} 
              />
              <Text style={[
                styles.tabText, 
                { color: activeTab === tab.id ? '#FFFFFF' : colors.text }
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'overview' && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Overview Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Ionicons name="people" size={24} color="#3B82F6" />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {analytics?.overview?.totalUsers || 0}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedText }]}>Total Users</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Ionicons name="business" size={24} color="#10B981" />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {analytics?.overview?.totalClubs || 0}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedText }]}>Total Clubs</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Ionicons name="calendar" size={24} color="#F59E0B" />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {analytics?.overview?.totalEvents || 0}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedText }]}>Total Events</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {analytics?.overview?.totalRsvps || 0}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedText }]}>Total RSVPs</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Role Distribution</Text>
            <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
              {analytics?.roleDistribution && Object.entries(analytics.roleDistribution).map(([role, count]: [string, any]) => (
                <View key={role} style={styles.chartRow}>
                  <Text style={[styles.chartLabel, { color: colors.text }]}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Text>
                  <View style={styles.chartBarContainer}>
                    <View 
                      style={[
                        styles.chartBar, 
                        { 
                          width: `${(count / analytics.overview.totalUsers) * 100}%`,
                          backgroundColor: colors.primary,
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.chartValue, { color: colors.text }]}>{count}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'events' && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Event Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.statValue, { color: colors.text }]}>{events.length}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedText }]}>Total Events</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {events.filter(e => e.status === 'Upcoming').length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedText }]}>Upcoming</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {events.filter(e => e.status === 'Completed').length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedText }]}>Completed</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {attendance.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedText }]}>Check-ins</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'users' && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>User Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Ionicons name="people" size={24} color="#3B82F6" />
                <Text style={[styles.statValue, { color: colors.text }]}>{users.length}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedText }]}>Total Users</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Ionicons name="school" size={24} color="#10B981" />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {users.filter(u => u.role === 'student').length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedText }]}>Students</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Ionicons name="shield" size={24} color="#F59E0B" />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {users.filter(u => u.role === 'admin' || u.role === 'developer').length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedText }]}>Admins</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Ionicons name="calendar" size={24} color="#8B5CF6" />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {users.filter(u => u.role === 'organizer').length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedText }]}>Organizers</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>All Users</Text>
            {loadingUsers ? (
              <View style={styles.centerContent}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.text }]}>Loading users...</Text>
              </View>
            ) : users.length === 0 ? (
              <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
                <Ionicons name="people-outline" size={64} color={colors.mutedText} />
                <Text style={[styles.emptyText, { color: colors.text }]}>No users found</Text>
              </View>
            ) : (
              <View style={styles.usersList}>
                {users.map((user) => (
                  <View key={user.uid} style={[styles.userCard, { backgroundColor: colors.card }]}>
                    <View style={styles.userInfo}>
                      <View style={[styles.userAvatar, { backgroundColor: colors.primary + '20' }]}>
                        <Ionicons name="person" size={24} color={colors.primary} />
                      </View>
                      <View style={styles.userDetails}>
                        <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                          {user.name || 'No Name'}
                        </Text>
                        <Text style={[styles.userEmail, { color: colors.mutedText }]} numberOfLines={1}>
                          {user.email}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.roleBadge, { backgroundColor: getUserRoleColor(user.role) + '20' }]}>
                      <Text style={[styles.roleText, { color: getUserRoleColor(user.role) }]}>
                        {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'rsvps' && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>RSVP Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
                <Text style={[styles.statValue, { color: colors.text }]}>{rsvps.length}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedText }]}>Total RSVPs</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Ionicons name="calendar" size={24} color="#10B981" />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {new Set(rsvps.map(r => r.eventId)).size}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedText }]}>Events</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Ionicons name="people" size={24} color="#3B82F6" />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {new Set(rsvps.map(r => r.userId)).size}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedText }]}>Unique Users</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Ionicons name="checkmark-done-circle" size={24} color="#F59E0B" />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {rsvps.filter(r => r.attended).length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedText }]}>Attended</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>All RSVPs</Text>
            {rsvps.length === 0 ? (
              <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
                <Ionicons name="checkmark-circle-outline" size={64} color={colors.mutedText} />
                <Text style={[styles.emptyText, { color: colors.text }]}>No RSVPs found</Text>
              </View>
            ) : (
              <View style={styles.rsvpsList}>
                {rsvps.map((rsvp) => {
                  const event = events.find(e => e.id === rsvp.eventId);
                  const attendanceStatus = attendance.find(
                    a => a.eventId === rsvp.eventId && a.userId === rsvp.userId
                  );
                  const isCheckedIn = !!attendanceStatus?.checkInAt;
                  const isCheckedOut = !!attendanceStatus?.checkOutAt;

                  return (
                    <View key={rsvp.id} style={[styles.rsvpCard, { backgroundColor: colors.card }]}>
                      <View style={styles.rsvpInfo}>
                        <View style={[styles.rsvpAvatar, { backgroundColor: colors.primary + '20' }]}>
                          <Ionicons name="person" size={24} color={colors.primary} />
                        </View>
                        <View style={styles.rsvpDetails}>
                          <Text style={[styles.rsvpMemberName, { color: colors.text }]} numberOfLines={1}>
                            {rsvp.userName || 'Unknown User'}
                          </Text>
                          <Text style={[styles.rsvpEmail, { color: colors.mutedText }]} numberOfLines={1}>
                            {rsvp.email}
                          </Text>
                          {event && (
                            <Text style={[styles.rsvpEventName, { color: colors.primary }]} numberOfLines={1}>
                              {event.title}
                            </Text>
                          )}
                          <Text style={[styles.rsvpDate, { color: colors.mutedText }]}>
                            RSVP'd: {formatDate(rsvp.timestamp, 'short')}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.rsvpStatus}>
                        {isCheckedOut ? (
                          <View style={[styles.statusBadge, { backgroundColor: '#3B82F620' }]}>
                            <Ionicons name="checkmark-done-circle" size={16} color="#3B82F6" />
                            <Text style={[styles.statusText, { color: '#3B82F6' }]}>Checked Out</Text>
                          </View>
                        ) : isCheckedIn ? (
                          <View style={[styles.statusBadge, { backgroundColor: '#10B98220' }]}>
                            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                            <Text style={[styles.statusText, { color: '#10B981' }]}>Checked In</Text>
                          </View>
                        ) : (
                          <View style={[styles.statusBadge, { backgroundColor: '#6B728020' }]}>
                            <Ionicons name="time-outline" size={16} color="#6B7280" />
                            <Text style={[styles.statusText, { color: '#6B7280' }]}>Not Checked In</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {activeTab === 'clubs' && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Club Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.statValue, { color: colors.text }]}>{clubs.length}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedText }]}>Total Clubs</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {clubs.filter(c => c.isVerified).length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedText }]}>Verified</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {memberships.filter(m => m.status === 'active').length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedText }]}>Total Members</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {clubs.reduce((sum, club) => {
                    const activeMembers = memberships.filter(
                      m => m.clubId === club.id && m.status === 'active'
                    ).length;
                    return sum + activeMembers;
                  }, 0)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedText }]}>Active Memberships</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  tabsContainer: {
    marginBottom: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  chartContainer: {
    borderRadius: 12,
    padding: 16,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  chartLabel: {
    width: 80,
    fontSize: 14,
    fontWeight: '600',
  },
  chartBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    overflow: 'hidden',
  },
  chartBar: {
    height: '100%',
    borderRadius: 10,
  },
  chartValue: {
    width: 40,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  usersList: {
    gap: 12,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  userAvatar: {
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
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  rsvpsList: {
    gap: 12,
  },
  rsvpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  rsvpInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  rsvpAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rsvpDetails: {
    flex: 1,
    minWidth: 0,
  },
  rsvpMemberName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  rsvpEmail: {
    fontSize: 13,
    marginBottom: 4,
  },
  rsvpEventName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  rsvpDate: {
    fontSize: 12,
  },
  rsvpStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

