import { CompositeNavigationProp, useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCampusData } from '../context/CampusDataContext';
import { EventCard } from '../components/EventCard';
import { SearchBar } from '../components/SearchBar';
import { CategoryFilter } from '../components/CategoryFilter';
import { NotificationBell } from '../components/notifications/NotificationBell';
import { useNotifications } from '../hooks/useNotifications';
import { MainTabsParamList, RootStackParamList } from '../navigation/types';
import { Event } from '../types';

type HomeNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNavProp>();
  const { events, clubs, refreshData } = useCampusData();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const { unreadCount } = useNotifications(user?.uid || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Events');
  const [refreshing, setRefreshing] = useState(false);
  
  // Reset category to 'All Events' if selected category no longer exists in clubs
  useEffect(() => {
    if (selectedCategory !== 'All Events') {
      const categoryExists = clubs.some(club => club.category === selectedCategory);
      if (!categoryExists) {
        setSelectedCategory('All Events');
      }
    }
  }, [clubs, selectedCategory]);

  // Refresh data when screen comes into focus (e.g., after creating event)
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

  // Helper function to parse date safely
  const parseEventDate = (dateStr: string): Date => {
    // Handle YYYY-MM-DD format
    if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return new Date(dateStr + 'T00:00:00');
    }
    // Handle other date formats
    return new Date(dateStr);
  };

  // Debug: Log all events received
  useEffect(() => {
    console.log(`📊 HomeScreen - Total events received: ${events.length}`);
    const eventsWithImages = events.filter(e => e.image && e.image.trim() !== '');
    console.log(`📸 HomeScreen - Events with images: ${eventsWithImages.length}`);
    events.forEach(e => {
      console.log(`   - "${e.title}" (ID: ${e.id}): image=${e.image ? 'YES' : 'NO'}`);
    });
  }, [events]);

  // Filter events based on category, search, and date
  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => {
        // Filter by category - match club's category
        if (selectedCategory !== 'All Events') {
          const club = clubs.find(c => c.id === event.clubId);
          if (!club || club.category !== selectedCategory) {
            return false;
          }
        }
        
        // Filter by date - show upcoming events
        if (!event.date) {
          console.warn(`⚠️ Event "${event.title}" has no date - including anyway`);
          return true; // Include events without dates
        }
        try {
          const eventDate = parseEventDate(event.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Reset time to compare dates only
          const isUpcoming = eventDate >= today;
          return isUpcoming;
        } catch (error) {
          console.error('Error parsing event date:', event.date, error);
          return true; // Include event if date parsing fails (better to show than hide)
        }
      })
      .filter((event) => {
        const matchesSearch = searchQuery === '' ||
          event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
      })
      .sort((a, b) => {
        try {
          const dateA = parseEventDate(a.date);
          const dateB = parseEventDate(b.date);
          return dateA.getTime() - dateB.getTime();
        } catch (error) {
          return 0;
        }
      });
  }, [events, clubs, selectedCategory, searchQuery]);

  const handleEventPress = (event: Event) => {
    navigation.navigate('EventDetails', { eventId: event.id });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Gradient Header */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcome}>Welcome back,</Text>
              <Text style={styles.name}>{user?.name || 'User'}</Text>
            </View>
            <NotificationBell unreadCount={unreadCount} />
          </View>

          {/* Search Bar */}
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search events, clubs..."
          />
        </SafeAreaView>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
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
        {/* Category Filter */}
        <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />

        {/* Section Title */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {selectedCategory !== 'All Events' 
            ? `${selectedCategory} Events (${filteredEvents.length})`
            : searchQuery 
              ? `Search Results (${filteredEvents.length})` 
              : `All Events (${filteredEvents.length})`
          }
        </Text>

        {/* Event Cards */}
        {events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={colors.mutedText} />
            <Text style={[styles.emptyText, { color: colors.mutedText }]}>
              No events available
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.mutedText }]}>
              Pull down to refresh
            </Text>
          </View>
        ) : filteredEvents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color={colors.mutedText} />
            <Text style={[styles.emptyText, { color: colors.mutedText }]}>
              {searchQuery 
                ? 'No events found' 
                : selectedCategory !== 'All Events'
                  ? `No ${selectedCategory} events`
                  : 'No upcoming events'}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.mutedText }]}>
              {events.length} total event{events.length !== 1 ? 's' : ''} in system
            </Text>
          </View>
        ) : (
          filteredEvents.map((event) => {
            // Debug logging for events with images
            if (event.image) {
              console.log(`📋 HomeScreen - Rendering event "${event.title}":`);
              console.log(`   Event ID: ${event.id}`);
              console.log(`   Image URL: ${event.image}`);
              console.log(`   Image type: ${typeof event.image}`);
              console.log(`   Full event data:`, JSON.stringify({
                id: event.id,
                title: event.title,
                image: event.image,
                imageLength: event.image?.length,
                hasImage: !!event.image
              }, null, 2));
            }
            return <EventCard key={event.id} event={event} onPress={handleEventPress} />;
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcome: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.9,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
