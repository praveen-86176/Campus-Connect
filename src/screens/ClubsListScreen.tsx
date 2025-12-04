import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, View, Text, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ClubCard } from '../components/ClubCard';
import { StatCard } from '../components/StatCard';
import { CategoryFilter } from '../components/CategoryFilter';
import { getColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { useCampusData } from '../context/CampusDataContext';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';
import { Club } from '../types';

const { width: screenWidth } = Dimensions.get('window');

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const clubGradients = [
  ['#1E90FF', '#00CED1'], // Blue to Cyan
  ['#9333EA', '#EC4899'], // Purple to Pink
  ['#F59E0B', '#EF4444'], // Orange to Red
  ['#10B981', '#3B82F6'], // Green to Blue
];

export const ClubsListScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { clubs, events, rsvps, memberships, joinClub, leaveClub, isUserFollowingClub } = useCampusData();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const [searchQuery, setSearchQuery] = useState('');

  const handleClubPress = (club: Club) => {
    navigation.navigate('EventsList', { clubId: club.id, clubName: club.name });
  };

  const handleFollowToggle = async (club: Club, isFollowing: boolean) => {
    if (!user?.uid) return;
    
    if (isFollowing) {
      await leaveClub(club.id, user.uid);
    } else {
      await joinClub(club.id, user.uid);
    }
  };

  const totalClubs = clubs.length;
  // Count clubs the user is actually following (active memberships)
  const followingCount = user?.uid 
    ? memberships.filter(m => m.userId === user.uid && m.status === 'active').length
    : 0;
  const eventsThisWeek = (() => {
    const now = new Date();
    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return events.filter((e) => {
      const d = new Date(e.date);
      return d >= now && d <= oneWeekLater;
    }).length;
  })();

  // Filter clubs based on search
  const filteredClubs = clubs.filter((club) =>
    searchQuery === '' ||
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Campus Clubs</Text>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color={colors.mutedText} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search clubs..."
            placeholderTextColor={colors.mutedText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </SafeAreaView>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Category Filter */}
        <CategoryFilter />

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <StatCard value={totalClubs} label="Total Clubs" color={colors.primary} />
          <StatCard value={followingCount} label="Following" color="#22C55E" />
          <StatCard value={eventsThisWeek} label="Events This Week" color="#9333EA" />
        </View>

        {/* Section Title */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Explore Clubs</Text>

        {/* Club Cards */}
        <View style={styles.clubsContainer}>
          {filteredClubs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={colors.mutedText} />
              <Text style={[styles.emptyText, { color: colors.mutedText }]}>No clubs found</Text>
            </View>
          ) : (
            filteredClubs.map((club, index) => (
              <ClubCard
                key={club.id}
                club={club}
                onPress={handleClubPress}
                isFollowing={user ? isUserFollowingClub(club.id, user.uid) : false}
                onFollowToggle={handleFollowToggle}
                gradientColors={clubGradients[index % clubGradients.length]}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Math.max(16, screenWidth * 0.05), // Responsive padding
    paddingTop: 10,
    paddingBottom: 16,
    width: '100%',
  },
  headerTitle: {
    fontSize: Math.min(28, screenWidth * 0.07), // Responsive font size (7% of screen width, max 28px)
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: Math.max(16, screenWidth * 0.05), // Responsive margin
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: screenWidth - (Math.max(16, screenWidth * 0.05) * 2), // Ensure it fits within screen
    maxWidth: '100%',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    minWidth: 0, // Prevent overflow
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Math.max(16, screenWidth * 0.05), // Responsive padding (5% of screen width, min 16px)
    paddingBottom: 100,
    width: '100%',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
    width: '100%',
  },
  sectionTitle: {
    fontSize: Math.min(20, screenWidth * 0.05), // Responsive font size
    fontWeight: '700',
    marginBottom: 16,
    width: '100%',
  },
  clubsContainer: {
    width: '100%',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    width: '100%',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});
