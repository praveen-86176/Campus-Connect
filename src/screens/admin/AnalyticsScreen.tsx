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

type AnalyticsNavProp = NativeStackNavigationProp<any>;

export const AnalyticsScreen: React.FC = () => {
  const navigation = useNavigation<AnalyticsNavProp>();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const { clubs, events, rsvps, attendance, memberships } = useCampusData();
  
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'clubs' | 'events' | 'rsvps'>('overview');

  useEffect(() => {
    loadAnalytics();
  }, []);

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
});

