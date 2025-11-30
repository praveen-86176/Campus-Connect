import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ClubCard } from '../components/ClubCard';
import { StatCard } from '../components/StatCard';
import { CategoryFilter } from '../components/CategoryFilter';
import { getColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { useCampusData } from '../context/CampusDataContext';
import { RootStackParamList } from '../navigation/types';
import { Club } from '../types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const clubGradients = [
  ['#1E90FF', '#00CED1'], // Blue to Cyan
  ['#9333EA', '#EC4899'], // Purple to Pink
  ['#F59E0B', '#EF4444'], // Orange to Red
  ['#10B981', '#3B82F6'], // Green to Blue
];

export const ClubsListScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { clubs } = useCampusData();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const [searchQuery, setSearchQuery] = useState('');

  const handleClubPress = (club: Club) => {
    navigation.navigate('EventsList', { clubId: club.id, clubName: club.name });
  };

  // Mock data for stats
  const totalClubs = clubs.length;
  const followingCount = 3;
  const eventsThisWeek = 12;

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
              gradientColors={clubGradients[index % clubGradients.length]}
            />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    marginHorizontal: -6,
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
  },
});

