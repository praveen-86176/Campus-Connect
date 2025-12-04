import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useCampusData } from '../../context/CampusDataContext';

type RSVPManagementNavProp = NativeStackNavigationProp<any>;

export const RSVPManagementScreen: React.FC = () => {
  const navigation = useNavigation<RSVPManagementNavProp>();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const { rsvps, events, refreshData } = useCampusData();
  const [refreshing, setRefreshing] = useState(false);
  const [lastRsvpCount, setLastRsvpCount] = useState(rsvps.length);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'registered' | 'attended'>('all');

  const filteredRsvps = useMemo(() => {
    return rsvps.filter(rsvp => {
      const matchesSearch = 
        searchQuery === '' ||
        rsvp.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rsvp.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesEvent = eventFilter === 'all' || rsvp.eventId === eventFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'registered' && !rsvp.attended) ||
        (statusFilter === 'attended' && rsvp.attended);
      
      return matchesSearch && matchesEvent && matchesStatus;
    });
  }, [rsvps, searchQuery, eventFilter, statusFilter]);

  const getEventName = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    return event?.title || 'Unknown Event';
  };

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  // Track RSVP count changes
  useEffect(() => {
    if (rsvps.length > lastRsvpCount) {
      setLastRsvpCount(rsvps.length);
    }
  }, [rsvps.length, lastRsvpCount]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } finally {
      setRefreshing(false);
    }
  }, [refreshData]);

  const totalRsvps = rsvps.length;
  const registeredCount = rsvps.filter(r => !r.attended).length;
  const attendedCount = rsvps.filter(r => r.attended).length;
  const newRsvps = rsvps.length > lastRsvpCount ? rsvps.length - lastRsvpCount : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>RSVP Management</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color={colors.mutedText} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search RSVPs..."
            placeholderTextColor={colors.mutedText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Status Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          <TouchableOpacity
            style={[styles.filterChip, { backgroundColor: statusFilter === 'all' ? colors.primary : colors.card }]}
            onPress={() => setStatusFilter('all')}
          >
            <Text style={[styles.filterText, { color: statusFilter === 'all' ? '#FFFFFF' : colors.text }]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, { backgroundColor: statusFilter === 'registered' ? colors.primary : colors.card }]}
            onPress={() => setStatusFilter('registered')}
          >
            <Text style={[styles.filterText, { color: statusFilter === 'registered' ? '#FFFFFF' : colors.text }]}>
              Registered
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, { backgroundColor: statusFilter === 'attended' ? colors.primary : colors.card }]}
            onPress={() => setStatusFilter('attended')}
          >
            <Text style={[styles.filterText, { color: statusFilter === 'attended' ? '#FFFFFF' : colors.text }]}>
              Attended
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Event Filter */}
        {events.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
            <TouchableOpacity
              style={[styles.filterChip, { backgroundColor: eventFilter === 'all' ? colors.primary : colors.card }]}
              onPress={() => setEventFilter('all')}
            >
              <Text style={[styles.filterText, { color: eventFilter === 'all' ? '#FFFFFF' : colors.text }]}>
                All Events
              </Text>
            </TouchableOpacity>
            {events.slice(0, 10).map((event) => (
              <TouchableOpacity
                key={event.id}
                style={[styles.filterChip, { backgroundColor: eventFilter === event.id ? colors.primary : colors.card }]}
                onPress={() => setEventFilter(event.id)}
              >
                <Text style={[styles.filterText, { color: eventFilter === event.id ? '#FFFFFF' : colors.text }]}>
                  {event.title.length > 20 ? event.title.substring(0, 20) + '...' : event.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Statistics Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Ionicons name="people" size={24} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{totalRsvps}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedText }]}>Total RSVPs</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Ionicons name="calendar" size={24} color="#3B82F6" />
            <Text style={[styles.statValue, { color: colors.text }]}>{registeredCount}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedText }]}>Registered</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={[styles.statValue, { color: colors.text }]}>{attendedCount}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedText }]}>Attended</Text>
          </View>
        </View>

        {/* Results Count */}
        <View style={styles.resultsHeader}>
          <View style={styles.resultsRow}>
            <Text style={[styles.resultsText, { color: colors.mutedText }]}>
              Showing {filteredRsvps.length} of {totalRsvps} RSVPs
            </Text>
            {newRsvps > 0 && (
              <View style={[styles.newBadge, { backgroundColor: colors.primary }]}>
                <Ionicons name="notifications" size={12} color="#FFFFFF" />
                <Text style={styles.newBadgeText}>{newRsvps} new</Text>
              </View>
            )}
          </View>
        </View>

        {/* RSVP List */}
        {filteredRsvps.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Ionicons name="calendar-outline" size={64} color={colors.mutedText} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No RSVPs found</Text>
            <Text style={[styles.emptySubtext, { color: colors.mutedText }]}>
              {searchQuery || eventFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No RSVPs have been registered yet'}
            </Text>
          </View>
        ) : (
          filteredRsvps.map((rsvp) => (
            <View key={rsvp.id} style={[styles.rsvpCard, { backgroundColor: colors.card }]}>
              <View style={styles.rsvpHeader}>
                <View style={styles.userInfo}>
                  <View style={styles.userIconContainer}>
                    <Ionicons name="person" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                      {rsvp.userName}
                    </Text>
                    <Text style={[styles.userEmail, { color: colors.mutedText }]} numberOfLines={1}>
                      {rsvp.email}
                    </Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: rsvp.attended ? '#10B98120' : '#3B82F620' }]}>
                  <Ionicons 
                    name={rsvp.attended ? "checkmark-circle" : "time-outline"} 
                    size={16} 
                    color={rsvp.attended ? '#10B981' : '#3B82F6'} 
                  />
                  <Text style={[styles.statusText, { color: rsvp.attended ? '#10B981' : '#3B82F6' }]}>
                    {rsvp.attended ? 'Attended' : 'Registered'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.eventInfo}>
                <Ionicons name="calendar-outline" size={16} color={colors.mutedText} />
                <Text style={[styles.eventName, { color: colors.text }]} numberOfLines={1}>
                  {getEventName(rsvp.eventId)}
                </Text>
              </View>
              
              <View style={styles.timestampContainer}>
                <Ionicons name="time-outline" size={14} color={colors.mutedText} />
                <Text style={[styles.timestamp, { color: colors.mutedText }]}>
                  {new Date(rsvp.timestamp).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            </View>
          ))
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filtersContainer: {
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 0,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  resultsHeader: {
    marginBottom: 16,
  },
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '500',
  },
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  rsvpCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  rsvpHeader: {
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
  userIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F620',
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
  eventInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  eventName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timestamp: {
    fontSize: 12,
  },
  emptyState: {
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

