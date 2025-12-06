import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { getColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useCampusData } from '../../context/CampusDataContext';
import { Event } from '../../types';

import { AdminStackParamList } from '../../navigation/types';

type EventsNavProp = NativeStackNavigationProp<AdminStackParamList>;

export const EventsManagementScreen: React.FC = () => {
  const navigation = useNavigation<EventsNavProp>();
  const { events, rsvps, attendance, refreshData, getEventAttendanceAnalytics } = useCampusData();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled'>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } finally {
      setRefreshing(false);
    }
  }, [refreshData]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = 
        searchQuery === '' ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      // Sort by date: upcoming first, then by date
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  }, [events, searchQuery, statusFilter]);

  const getEventRsvpCount = (eventId: string) => {
    return rsvps.filter(r => r.eventId === eventId).length;
  };

  const getEventAttendanceCount = (eventId: string) => {
    return attendance.filter(a => a.eventId === eventId && a.checkInAt).length;
  };

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: events.length,
      upcoming: events.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate > now && e.status !== 'Cancelled';
      }).length,
      completed: events.filter(e => e.status === 'Completed').length,
      totalRsvps: rsvps.length,
    };
  }, [events, rsvps]);

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

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'Published':
      case 'Upcoming':
        return 'calendar-outline';
      case 'Ongoing':
        return 'play-circle-outline';
      case 'Completed':
        return 'checkmark-circle-outline';
      case 'Cancelled':
        return 'close-circle-outline';
      default:
        return 'calendar-outline';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Events Management</Text>
            <Text style={[styles.headerSubtitle, { color: colors.mutedText }]}>
              Manage and track all events
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('CreateEvent')}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color={colors.mutedText} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search events..."
            placeholderTextColor={colors.mutedText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.mutedText} />
            </TouchableOpacity>
          )}
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
            style={[styles.filterChip, { backgroundColor: statusFilter === 'Upcoming' ? colors.primary : colors.card }]}
            onPress={() => setStatusFilter('Upcoming')}
          >
            <Text style={[styles.filterText, { color: statusFilter === 'Upcoming' ? '#FFFFFF' : colors.text }]}>
              Upcoming
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, { backgroundColor: statusFilter === 'Ongoing' ? colors.primary : colors.card }]}
            onPress={() => setStatusFilter('Ongoing')}
          >
            <Text style={[styles.filterText, { color: statusFilter === 'Ongoing' ? '#FFFFFF' : colors.text }]}>
              Ongoing
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, { backgroundColor: statusFilter === 'Completed' ? colors.primary : colors.card }]}
            onPress={() => setStatusFilter('Completed')}
          >
            <Text style={[styles.filterText, { color: statusFilter === 'Completed' ? '#FFFFFF' : colors.text }]}>
              Completed
            </Text>
          </TouchableOpacity>
        </ScrollView>
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
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              style={styles.statGradient}
            >
              <Ionicons name="calendar" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.total}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedText }]}>Total Events</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.statGradient}
            >
              <Ionicons name="time" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.upcoming}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedText }]}>Upcoming</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              style={styles.statGradient}
            >
              <Ionicons name="people" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalRsvps}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedText }]}>Total RSVPs</Text>
          </View>
        </View>

        {/* Results Count */}
        <View style={styles.resultsHeader}>
          <Text style={[styles.resultsText, { color: colors.mutedText }]}>
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
          </Text>
        </View>

        {/* Event Cards */}
        {filteredEvents.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Ionicons name="calendar-outline" size={64} color={colors.mutedText} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No events found</Text>
            <Text style={[styles.emptySubtext, { color: colors.mutedText }]}>
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first event to get started'}
            </Text>
            {!searchQuery && statusFilter === 'all' && (
              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('CreateEvent')}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.createButtonText}>Create Event</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredEvents.map((event) => {
            const rsvpCount = getEventRsvpCount(event.id);
            const attendanceCount = getEventAttendanceCount(event.id);
            const analytics = getEventAttendanceAnalytics(event.id);
            const eventDate = new Date(event.date);
            const isPast = eventDate < new Date();
            
            return (
              <TouchableOpacity
                key={event.id}
                style={[styles.eventCard, { backgroundColor: colors.card }]}
                onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}
              >
                {/* Event Image */}
                {event.image ? (
                  <Image source={{ uri: event.image }} style={styles.eventImage} />
                ) : (
                  <LinearGradient
                    colors={['#3B82F6', '#2563EB']}
                    style={styles.eventImagePlaceholder}
                  >
                    <Ionicons name="calendar" size={32} color="#FFFFFF" />
                  </LinearGradient>
                )}

                {/* Event Content */}
                <View style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    <View style={styles.eventTitleContainer}>
                      <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={2}>
                        {event.title}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) + '20' }]}>
                        <Ionicons 
                          name={getStatusIcon(event.status) as any} 
                          size={12} 
                          color={getStatusColor(event.status)} 
                        />
                        <Text style={[styles.statusText, { color: getStatusColor(event.status) }]}>
                          {event.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {event.description && (
                    <Text style={[styles.eventDescription, { color: colors.mutedText }]} numberOfLines={2}>
                      {event.description}
                    </Text>
                  )}

                  <View style={styles.eventDetails}>
                    <View style={styles.eventDetailRow}>
                      <Ionicons name="calendar-outline" size={16} color={colors.mutedText} />
                      <Text style={[styles.eventDetailText, { color: colors.mutedText }]}>
                        {eventDate.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </Text>
                    </View>
                    <View style={styles.eventDetailRow}>
                      <Ionicons name="time-outline" size={16} color={colors.mutedText} />
                      <Text style={[styles.eventDetailText, { color: colors.mutedText }]}>
                        {event.time}
                      </Text>
                    </View>
                    <View style={styles.eventDetailRow}>
                      <Ionicons name="location-outline" size={16} color={colors.mutedText} />
                      <Text style={[styles.eventDetailText, { color: colors.mutedText }]} numberOfLines={1}>
                        {event.location}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.eventFooter}>
                    <View style={styles.rsvpInfo}>
                      <Ionicons name="people" size={16} color={colors.primary} />
                      <Text style={[styles.rsvpCount, { color: colors.text }]}>
                        {rsvpCount} RSVP{rsvpCount !== 1 ? 's' : ''}
                      </Text>
                      {attendanceCount > 0 && (
                        <View style={styles.attendanceBadge}>
                          <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                          <Text style={[styles.attendanceText, { color: '#10B981' }]}>
                            {attendanceCount} attended
                          </Text>
                        </View>
                      )}
                      {event.capacity > 0 && (
                        <Text style={[styles.capacityText, { color: colors.mutedText }]}>
                          / {event.capacity} capacity
                        </Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.mutedText} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    gap: 12,
  },
  searchIcon: {
    marginRight: 0,
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
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statGradient: {
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
  resultsHeader: {
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '500',
  },
  eventCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eventImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  eventImagePlaceholder: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    marginBottom: 8,
  },
  eventTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  eventDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  eventDetails: {
    marginBottom: 12,
    gap: 8,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventDetailText: {
    fontSize: 13,
    flex: 1,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  rsvpInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rsvpCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  capacityText: {
    fontSize: 13,
  },
  attendanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
  },
  attendanceText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
