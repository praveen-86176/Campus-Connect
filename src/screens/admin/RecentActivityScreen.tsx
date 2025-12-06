import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useCampusData } from '../../context/CampusDataContext';

import { AdminStackParamList } from '../../navigation/types';

type RecentActivityNavProp = NativeStackNavigationProp<AdminStackParamList>;

export const RecentActivityScreen: React.FC = () => {
  const navigation = useNavigation<RecentActivityNavProp>();
  const { events, rsvps, attendance, refreshData } = useCampusData();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } finally {
      setRefreshing(false);
    }
  }, [refreshData]);

  // Get all activities (not limited to 10)
  const allActivities = useMemo(() => {
    const activities: any[] = [];
    
    // All events
    events.forEach(event => {
      activities.push({
        id: `event-${event.id}`,
        type: 'event',
        title: `New event: ${event.title}`,
        timestamp: event.createdAt,
        icon: 'calendar',
        color: '#10B981',
      });
    });
    
    // All RSVPs with event names
    rsvps.forEach(rsvp => {
      const event = events.find(e => e.id === rsvp.eventId);
      if (event) {
        activities.push({
          id: `rsvp-${rsvp.id}`,
          type: 'rsvp',
          title: `${rsvp.userName} registered for "${event.title}"`,
          timestamp: rsvp.timestamp,
          icon: 'checkmark-circle',
          color: '#3B82F6',
        });
      }
    });
    
    // All check-ins and check-outs (attendance)
    attendance.forEach(record => {
      const event = events.find(e => e.id === record.eventId);
      const rsvp = rsvps.find(r => r.eventId === record.eventId && r.userId === record.userId);
      
      if (event && rsvp) {
        // Show check-out activity if available
        if (record.checkOutAt) {
          activities.push({
            id: `checkout-${record.userId}-${record.eventId}-${record.checkOutAt}`,
            type: 'checkout',
            title: `${rsvp.userName || 'Member'} checked out from "${event.title}"`,
            timestamp: record.checkOutAt,
            icon: 'log-out',
            color: '#3B82F6',
          });
        }
        
        // Show check-in activity if available
        if (record.checkInAt) {
          activities.push({
            id: `checkin-${record.userId}-${record.eventId}-${record.checkInAt}`,
            type: 'checkin',
            title: `${rsvp.userName || 'Member'} checked in to "${event.title}"`,
            timestamp: record.checkInAt,
            icon: 'log-in',
            color: '#10B981',
          });
        }
      }
    });
    
    // Sort by timestamp (most recent first)
    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [events, rsvps, attendance]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              All Recent Activity
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.mutedText }]}>
              {allActivities.length} total activities
            </Text>
          </View>

          {/* Activities List */}
          {allActivities.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="time-outline" size={64} color={colors.mutedText} />
              <Text style={[styles.emptyText, { color: colors.mutedText }]}>
                No recent activity
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.mutedText }]}>
                Activity will appear here as events are created, RSVPs are made, and check-ins/check-outs occur.
              </Text>
            </View>
          ) : (
            allActivities.map((activity) => (
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
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  activityCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
