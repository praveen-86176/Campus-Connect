import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { getColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useCampusData } from '../../context/CampusDataContext';
import { adminService } from '../../services/adminService';
import { dataService } from '../../services/dataService';

const screenWidth = Dimensions.get('window').width;

type AdminDashboardNavProp = NativeStackNavigationProp<any>;

export const AdminDashboardHomeScreen: React.FC = () => {
  const navigation = useNavigation<AdminDashboardNavProp>();
  const { user } = useAuth();
  const { clubs, events, rsvps, attendance, memberships, refreshData } = useCampusData();
  const { isDark } = useTheme();
  
  // Initialize colors immediately with a default value, then memoize
  const defaultColors = getColors(false); // Light theme as default
  
  // Memoize colors to ensure it's always available
  const colors = useMemo(() => {
    try {
      // Ensure isDark is a boolean
      const isDarkMode = typeof isDark === 'boolean' ? isDark : false;
      
      // Get colors object - this should never return undefined based on getColors implementation
      const colorObj = getColors(isDarkMode);
      
      // Double check the object exists
      if (!colorObj) {
        console.error('getColors returned undefined! This should not happen.');
        return defaultColors;
      }
      
      return colorObj;
    } catch (error) {
      console.error('Error getting colors:', error);
      return defaultColors;
    }
  }, [isDark, defaultColors]);
  
  const [totalUsers, setTotalUsers] = useState(0);
  const [previousUsers, setPreviousUsers] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    loadUserCount();
  }, []);

  useEffect(() => {
    // Initialize default clubs when user is available and no clubs exist
    if (user?.uid && clubs.length === 0) {
      initializeDefaultClubsIfNeeded();
    }
  }, [user?.uid, clubs.length]);

  const initializeDefaultClubsIfNeeded = async () => {
    try {
      if (user?.uid) {
        await adminService.initializeDefaultClubs(user.uid);
        // Refresh data to load the newly created clubs
        await refreshData();
        console.log('✅ Default clubs initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize default clubs:', error);
    }
  };

  const loadUserCount = async () => {
    try {
      const users = await adminService.getAllUsers();
      setAllUsers(users);
      setTotalUsers(users.length);
      
      // Calculate previous period (30 days ago)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const previousUsersCount = users.filter(u => 
        new Date(u.createdAt) < thirtyDaysAgo
      ).length;
      setPreviousUsers(previousUsersCount);
    } catch (error) {
      console.error('Failed to load user count:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Calculate stats
  const totalClubs = clubs.length;
  const activeClubs = clubs.filter(c => c.isVerified).length;
  const totalEvents = events.length;
  const upcomingEvents = events.filter(e => e.status === 'Upcoming' || e.status === 'Published').length;
  const totalRsvps = rsvps.length;
  const confirmedRsvps = rsvps.filter(r => !r.attended).length; // RSVPs that are registered but not yet attended

  // Calculate growth percentage
  const userGrowth = previousUsers > 0 
    ? ((totalUsers - previousUsers) / previousUsers * 100).toFixed(1)
    : '0';

  // Line Chart Data: Event RSVPs - Only show events with registered RSVPs
  const rsvpChartData = useMemo(() => {
    // Get all events and filter to only those with registered RSVPs (in use)
    const eventsWithRsvps = events.filter(event => {
      const eventRsvps = rsvps.filter(r => 
        r.eventId === event.id && 
        !r.attended // Only registered RSVPs (not yet attended)
      );
      return eventRsvps.length > 0; // Only events with registered RSVPs
    });
    
    // Sort by creation date (newest first) and limit to 10 for better visibility
    const recentEvents = [...eventsWithRsvps]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
    
    if (recentEvents.length === 0) {
      return { labels: [], datasets: [{ data: [] }] };
    }
    
    const data: number[] = [];
    const labels: string[] = [];
    
    recentEvents.forEach(event => {
      // Count RSVPs for this event (only registered - not yet attended)
      const eventRsvps = rsvps.filter(r => 
        r.eventId === event.id && 
        !r.attended // Only registered RSVPs (not yet attended)
      ).length;
      
      data.push(eventRsvps);
      
      // Truncate event title for label
      const eventLabel = event.title.length > 12 
        ? event.title.substring(0, 12) + '...' 
        : event.title;
      labels.push(eventLabel);
    });
    
    return { labels, datasets: [{ data }] };
  }, [events, rsvps]);

  // Bar Chart: Top 5 clubs by member count (using real membership data)
  const topClubsData = useMemo(() => {
    // Calculate actual member counts from memberships
    const clubsWithMembers = clubs.map(club => {
      const activeMembers = memberships.filter(
        m => m.clubId === club.id && m.status === 'active'
      ).length;
      return {
        ...club,
        actualMemberCount: activeMembers,
      };
    });
    
    // Filter out clubs with 0 members and sort by member count
    const sortedClubs = clubsWithMembers
      .filter(c => c.actualMemberCount > 0) // Only show clubs with members
      .sort((a, b) => b.actualMemberCount - a.actualMemberCount)
      .slice(0, 5);
    
    // If no clubs with members, return empty data
    if (sortedClubs.length === 0) {
      return {
        labels: [],
        datasets: [{ data: [] }],
      };
    }
    
    return {
      labels: sortedClubs.map(c => {
        // Truncate long club names for better display (shorter for bar chart)
        const name = c.name.length > 10 ? c.name.substring(0, 10) + '...' : c.name;
        return name;
      }),
      datasets: [{
        data: sortedClubs.map(c => c.actualMemberCount),
      }],
    };
  }, [clubs, memberships]);


  // Recent Activity Feed
  const recentActivity = useMemo(() => {
    const activities: any[] = [];
    
    // Recent events
    events.slice(0, 3).forEach(event => {
      activities.push({
        id: `event-${event.id}`,
        type: 'event',
        title: `New event: ${event.title}`,
        timestamp: event.createdAt,
        icon: 'calendar',
        color: '#10B981',
      });
    });
    
    // Recent RSVPs
    rsvps.slice(0, 3).forEach(rsvp => {
      activities.push({
        id: `rsvp-${rsvp.id}`,
        type: 'rsvp',
        title: `${rsvp.userName} registered for an event`,
        timestamp: rsvp.timestamp,
        icon: 'checkmark-circle',
        color: '#3B82F6',
      });
    });
    
    // Sort by timestamp
    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 10);
  }, [events, rsvps]);

  const chartConfig = useMemo(() => {
    if (!colors) {
      return {
        backgroundColor: '#FFFFFF',
        backgroundGradientFrom: '#FFFFFF',
        backgroundGradientTo: '#FFFFFF',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        labelColor: (opacity = 1) => '#000000',
        style: {
          borderRadius: 16,
        },
        propsForDots: {
          r: '4',
          strokeWidth: '2',
          stroke: '#3B82F6',
        },
      };
    }
    
    return {
      backgroundColor: colors.card || '#FFFFFF',
      backgroundGradientFrom: colors.card || '#FFFFFF',
      backgroundGradientTo: colors.card || '#FFFFFF',
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(${isDark ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
      labelColor: (opacity = 1) => colors.text || '#000000',
      style: {
        borderRadius: 16,
      },
      propsForDots: {
        r: '4',
        strokeWidth: '2',
        stroke: colors.primary || '#3B82F6',
      },
    };
  }, [colors, isDark]);

  const recentEvents = events
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const quickActions = [
    { icon: 'add-circle-outline', label: 'Create Event', screen: 'CreateEvent', color: '#10B981' },
    { icon: 'people-outline', label: 'Create Club', screen: 'CreateClub', color: '#3B82F6' },
    { icon: 'person-outline', label: 'Users', screen: 'UserManagement', color: '#8B5CF6' },
    { icon: 'checkmark-circle-outline', label: 'RSVPs', screen: 'RSVPManagement', color: '#F59E0B' },
    { icon: 'bar-chart-outline', label: 'Analytics', screen: 'Analytics', color: '#EF4444' },
  ];

  // Early return if colors is not available
  if (!colors) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.centerContent}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading...</Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={{ width: '100%', maxWidth: '100%' }}
      >
        {/* Header */}
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.greeting}>Welcome back,</Text>
                <Text style={styles.adminName}>{user?.name || 'Admin'}</Text>
                <Text style={styles.adminRole}>{user?.adminRole || 'Administrator'}</Text>
              </View>
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
              ) : (
              <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Ionicons name="person" size={32} color="#FFFFFF" />
              </View>
              )}
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Overview Statistics - 2x2 Grid */}
        <View style={[styles.overviewSection, { paddingTop: 8 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Overview Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <View style={styles.statHeader}>
                <Ionicons name="people" size={24} color="#8B5CF6" />
                {loadingUsers ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <View style={styles.growthIndicator}>
                    <Ionicons 
                      name={parseFloat(userGrowth) >= 0 ? "trending-up" : "trending-down"} 
                      size={16} 
                      color={parseFloat(userGrowth) >= 0 ? "#10B981" : "#EF4444"} 
                    />
                    <Text style={[
                      styles.growthText, 
                      { color: parseFloat(userGrowth) >= 0 ? "#10B981" : "#EF4444" }
                    ]}>
                      {userGrowth}%
                    </Text>
                  </View>
                )}
              </View>
              {loadingUsers ? (
                <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 8 }} />
              ) : (
                <Text style={[styles.statValue, { color: colors.text }]}>{totalUsers}</Text>
              )}
              <Text style={[styles.statLabel, { color: colors.mutedText }]}>Total Users</Text>
            </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Ionicons name="business" size={24} color="#3B82F6" />
              <Text style={[styles.statValue, { color: colors.text }]}>{activeClubs}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedText }]}>Active Clubs</Text>
              <Text style={[styles.statSubtext, { color: colors.mutedText }]}>
                {totalClubs} total
              </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Ionicons name="calendar" size={24} color="#10B981" />
              <Text style={[styles.statValue, { color: colors.text }]}>{upcomingEvents}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedText }]}>Upcoming Events</Text>
              <Text style={[styles.statSubtext, { color: colors.mutedText }]}>
                {totalEvents} total
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Ionicons name="checkmark-circle" size={24} color="#F59E0B" />
              <Text style={[styles.statValue, { color: colors.text }]}>{confirmedRsvps}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedText }]}>Confirmed RSVPs</Text>
              <Text style={[styles.statSubtext, { color: colors.mutedText }]}>
                {totalRsvps} total
              </Text>
            </View>
          </View>
        </View>

        {/* Charts Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 8 }]}>Analytics Charts</Text>
          
          {/* Line Chart: RSVPs per Event (Only events with registered RSVPs) */}
          <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Event RSVPs Distribution (Active Events)</Text>
            {rsvpChartData.labels.length > 0 && rsvpChartData.datasets[0].data.length > 0 ? (
              <View style={styles.lineChartContainer}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.lineChartScrollContent}
                >
                  <LineChart
                    data={rsvpChartData}
                    width={Math.max(screenWidth - 64, rsvpChartData.labels.length * 80)} // Responsive width based on number of events
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                    withInnerLines={false}
                    withOuterLines={true}
                    withVerticalLabels={true}
                    withHorizontalLabels={true}
                    segments={4}
                    xLabelsOffset={-5}
                    yAxisInterval={1}
                  />
                </ScrollView>
              </View>
            ) : (
              <View style={styles.chartPlaceholder}>
                <Text style={[styles.chartPlaceholderText, { color: colors.mutedText }]}>
                  No active events with RSVPs
                </Text>
              </View>
            )}
          </View>

          {/* Bar Chart: Top 5 Clubs */}
          <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Top 5 Clubs by Members</Text>
            {topClubsData.labels.length > 0 ? (
              <View style={styles.barChartContainer}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.barChartScrollContent}
                >
                  <BarChart
                    data={topClubsData}
                    width={Math.max(screenWidth - 64, topClubsData.labels.length * 80)} // Responsive width based on number of bars
                    height={240}
                    chartConfig={chartConfig}
                    style={styles.chart}
                    yAxisLabel=""
                    yAxisSuffix=""
                    showValuesOnTopOfBars
                    fromZero
                    yAxisInterval={1}
                  />
                </ScrollView>
              </View>
            ) : (
              <View style={styles.chartPlaceholder}>
                <Text style={[styles.chartPlaceholderText, { color: colors.mutedText }]}>
                  No club data available
                </Text>
              </View>
            )}
          </View>

        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 8 }]}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.screen}
                style={[styles.quickActionCard, { backgroundColor: colors.card }]}
                onPress={() => navigation.navigate(action.screen)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                  <Ionicons name={action.icon as any} size={28} color={action.color} />
                </View>
                <Text style={[styles.quickActionLabel, { color: colors.text }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity Feed */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 8 }]}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Analytics')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <View
                key={activity.id}
                style={[styles.activityCard, { backgroundColor: colors.card }]}
              >
                <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
                  <Ionicons name={activity.icon as any} size={20} color={activity.color} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={[styles.activityTitle, { color: colors.text }]}>
                    {activity.title}
                    </Text>
                  <Text style={[styles.activityTime, { color: colors.mutedText }]}>
                    {new Date(activity.timestamp).toLocaleString()}
                    </Text>
                  </View>
                </View>
            ))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
              <Ionicons name="time-outline" size={48} color={colors.mutedText} />
              <Text style={[styles.emptyStateText, { color: colors.mutedText }]}>No recent activity</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Published':
    case 'Upcoming':
      return '#3B82F6';
    case 'Ongoing':
      return '#10B981';
    case 'Completed':
      return '#6B7280';
    case 'Cancelled':
      return '#EF4444';
    default:
      return '#6B7280';
  }
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  header: {
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  adminName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  adminRole: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  overviewSection: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
    maxWidth: '100%',
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    maxWidth: '48%', // Prevent cards from getting too wide
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden', // Prevent content overflow
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  growthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  growthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statSubtext: {
    fontSize: 11,
    marginTop: 4,
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
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden', // Prevent horizontal overflow
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    maxWidth: '100%',
    flexWrap: 'wrap',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '30%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  eventCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventMeta: {
    fontSize: 13,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  chartCard: {
    borderRadius: 16,
    padding: 10,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: screenWidth - 32, // Fixed width to prevent overflow
    maxWidth: screenWidth - 32, // Ensure it never exceeds screen width
    alignSelf: 'center',
    overflow: 'hidden', // Prevent any content from overflowing
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    maxWidth: '100%',
    flexWrap: 'wrap',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartScrollView: {
    marginHorizontal: -16, // Offset card padding for full-width scroll
  },
  barChartContainer: {
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  barChartScrollContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  lineChartContainer: {
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  lineChartScrollContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  chartPlaceholder: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
    width: '100%',
    maxWidth: '100%',
  },
  chartPlaceholderText: {
    fontSize: 14,
  },
  activityCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
  },
});

