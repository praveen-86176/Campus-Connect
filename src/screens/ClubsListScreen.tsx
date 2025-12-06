import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, View, Text, TextInput, TouchableOpacity, Dimensions, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatCard } from '../components/StatCard';
import { getColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { useCampusData } from '../context/CampusDataContext';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';
import { Club } from '../types';
import { getClubCategoryImage, getClubCategoryIcon } from '../utils/clubCategoryImages';

const { width: screenWidth } = Dimensions.get('window');

type NavProp = NativeStackNavigationProp<RootStackParamList>;


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

  const [followingClubs, setFollowingClubs] = useState<Set<string>>(new Set());
  const [loadingFollow, setLoadingFollow] = useState<Record<string, boolean>>({});

  const handleFollowToggle = async (club: Club, isFollowing: boolean) => {
    if (!user?.uid) return;
    
    setLoadingFollow(prev => ({ ...prev, [club.id]: true }));
    try {
      if (isFollowing) {
        await leaveClub(club.id, user.uid);
      } else {
        await joinClub(club.id, user.uid);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update club membership');
    } finally {
      setLoadingFollow(prev => ({ ...prev, [club.id]: false }));
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
            filteredClubs.map((club) => {
              const categoryImage = getClubCategoryImage(club.category);
              const categoryIcon = getClubCategoryIcon(club.category);
              const displayImage = club.logo && club.logo.trim() !== '' ? club.logo : categoryImage;
              const isFollowing = user ? isUserFollowingClub(club.id, user.uid) : false;
              const isLoading = loadingFollow[club.id] || false;
              
              return (
                <TouchableOpacity
                  key={club.id}
                  style={[styles.clubCard, { backgroundColor: colors.card }]}
                  onPress={() => handleClubPress(club)}
                  activeOpacity={0.8}
                >
                  <View style={styles.clubCardContent}>
                    {/* Club Image */}
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: displayImage }}
                        style={styles.clubImage}
                        resizeMode="cover"
                      />
                    </View>
                    
                    {/* Club Info */}
                    <View style={styles.clubInfo}>
                      <View style={styles.clubHeader}>
                        <Text style={[styles.clubName, { color: colors.text }]} numberOfLines={1}>
                          {club.name}
                        </Text>
                        <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
                          <Ionicons name={categoryIcon as any} size={14} color={colors.primary} />
                          <Text style={[styles.categoryText, { color: colors.primary }]}>
                            {club.category}
                          </Text>
                        </View>
                      </View>
                      
                      <Text style={[styles.clubDescription, { color: colors.mutedText }]} numberOfLines={2}>
                        {club.description || 'No description available'}
                      </Text>
                      
                      <View style={styles.clubFooter}>
                        <View style={styles.memberInfo}>
                          <Ionicons name="people" size={16} color={colors.primary} />
                          <Text style={[styles.memberCount, { color: colors.text }]}>
                            {club.memberCount} {club.memberCount === 1 ? 'member' : 'members'}
                          </Text>
                        </View>
                        {club.isVerified && (
                          <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                            <Text style={styles.verifiedText}>Verified</Text>
                          </View>
                        )}
                      </View>
                      
                      {/* Follow Button */}
                      <TouchableOpacity
                        style={[
                          styles.followButton,
                          { borderColor: colors.primary },
                          isFollowing && { backgroundColor: colors.primary, borderColor: colors.primary },
                          isLoading && styles.followButtonDisabled
                        ]}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleFollowToggle(club, isFollowing);
                        }}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <ActivityIndicator size="small" color={isFollowing ? '#FFFFFF' : colors.primary} />
                        ) : (
                          <Text style={[
                            styles.followButtonText,
                            { color: isFollowing ? '#FFFFFF' : colors.primary }
                          ]}>
                            {isFollowing ? 'Following' : 'Follow'}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
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
    paddingHorizontal: Math.max(16, screenWidth * 0.05), // Responsive padding
    paddingTop: 10,
    paddingBottom: 16,
    width: '100%',
  },
  headerTitle: {
    fontSize: Math.min(28, screenWidth * 0.07), // Responsive font size (7% of screen width, max 28px)
    fontWeight: '700',
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
  clubCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clubCardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  clubImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  clubInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  clubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  clubName: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  clubDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  clubFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  followButton: {
    borderWidth: 1.5,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'flex-start',
    minWidth: 100,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  followButtonDisabled: {
    opacity: 0.6,
  },
});
