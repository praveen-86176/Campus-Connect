import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useCampusData } from '../../context/CampusDataContext';
// Note: ClubDetails is in AdminDashboardNavigator, not RootStackParamList
import { getClubCategoryImage, getClubCategoryIcon } from '../../utils/clubCategoryImages';
import { adminService } from '../../services/adminService';
import { User } from '../../types';

import { AdminStackParamList } from '../../navigation/types';
import { RouteProp } from '@react-navigation/native';

type ClubDetailsRouteProp = RouteProp<AdminStackParamList, 'ClubDetails'>;
type ClubDetailsNavProp = NativeStackNavigationProp<AdminStackParamList, 'ClubDetails'>;

export const ClubDetailsScreen: React.FC = () => {
  const route = useRoute<ClubDetailsRouteProp>();
  const navigation = useNavigation<ClubDetailsNavProp>();
  const { clubs, memberships, getEventsByClub } = useCampusData();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  
  const [memberUsers, setMemberUsers] = useState<User[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  
  const clubId = route.params?.clubId || '';
  const club = clubs.find(c => c.id === clubId);
  const clubEvents = club ? getEventsByClub(club.id) : [];
  
  // Get active memberships for this club
  const clubMemberships = useMemo(() => {
    if (!club) return [];
    return memberships.filter(
      m => m.clubId === club.id && m.status === 'active'
    );
  }, [memberships, club]);
  
  // Load member user information
  useEffect(() => {
    const loadMemberUsers = async () => {
      if (clubMemberships.length === 0) {
        setLoadingMembers(false);
        return;
      }
      
      try {
        setLoadingMembers(true);
        const userPromises = clubMemberships.map(membership =>
          adminService.getUserById(membership.userId)
        );
        const users = await Promise.all(userPromises);
        const validUsers = users.filter((user): user is User => user !== null);
        setMemberUsers(validUsers);
      } catch (error) {
        console.error('Failed to load member users:', error);
      } finally {
        setLoadingMembers(false);
      }
    };
    
    loadMemberUsers();
  }, [clubMemberships]);
  
  if (!club) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.mutedText} />
            <Text style={[styles.errorText, { color: colors.text }]}>Club not found</Text>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }
  
  const categoryImage = getClubCategoryImage(club.category);
  const categoryIcon = getClubCategoryIcon(club.category);
  const displayImage = club.logo && club.logo.trim() !== '' ? club.logo : categoryImage;
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Club Image */}
          <View style={styles.headerContainer}>
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: displayImage }}
                style={styles.clubHeaderImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.imageGradient}
              />
              <View style={styles.imageContent}>
                <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '40' }]}>
                  <Ionicons name={categoryIcon as any} size={18} color="#fff" />
                  <Text style={styles.categoryText}>{club.category}</Text>
                </View>
                <Text style={styles.clubTitle}>{club.name}</Text>
                {club.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text style={styles.verifiedText}>Verified Club</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          
          {/* Club Statistics */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Ionicons name="people" size={24} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>{club.memberCount}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedText }]}>Members</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Ionicons name="calendar" size={24} color="#10B981" />
              <Text style={[styles.statValue, { color: colors.text }]}>{clubEvents.length}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedText }]}>Events</Text>
            </View>
          </View>
          
          {/* Club Description */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
            </View>
            <Text style={[styles.description, { color: colors.text }]}>
              {club.description || 'No description available for this club.'}
            </Text>
          </View>
          
          {/* Club Rules */}
          {club.rules && (
            <View style={[styles.section, { backgroundColor: colors.card }]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="list" size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Club Rules</Text>
              </View>
              <Text style={[styles.rulesText, { color: colors.text }]}>{club.rules}</Text>
            </View>
          )}
          
          {/* Members List */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="people" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Members ({club.memberCount})
              </Text>
            </View>
            
            {loadingMembers ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.mutedText }]}>
                  Loading members...
                </Text>
              </View>
            ) : memberUsers.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={48} color={colors.mutedText} />
                <Text style={[styles.emptyText, { color: colors.mutedText }]}>
                  No members yet
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.mutedText }]}>
                  Members will appear here once they join this club
                </Text>
              </View>
            ) : (
              <View style={styles.membersList}>
                {memberUsers.map((user, index) => (
                  <View
                    key={user.uid}
                    style={[
                      styles.memberItem,
                      index < memberUsers.length - 1 && styles.memberItemBorder
                    ]}
                  >
                    <View style={[styles.memberAvatar, { backgroundColor: colors.primary + '20' }]}>
                      {user.photoURL ? (
                        <Image
                          source={{ uri: user.photoURL }}
                          style={styles.memberAvatarImage}
                        />
                      ) : (
                        <Ionicons name="person" size={24} color={colors.primary} />
                      )}
                    </View>
                    <View style={styles.memberInfo}>
                      <Text style={[styles.memberName, { color: colors.text }]} numberOfLines={1}>
                        {user.name || 'Unknown User'}
                      </Text>
                      <Text style={[styles.memberEmail, { color: colors.mutedText }]} numberOfLines={1}>
                        {user.email}
                      </Text>
                      {user.role && (
                        <View style={styles.roleBadge}>
                          <Text style={[styles.roleText, { color: colors.mutedText }]}>
                            {user.role}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
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
    paddingBottom: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContainer: {
    marginBottom: 16,
  },
  imageWrapper: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  clubHeaderImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  imageContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
    gap: 6,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  clubTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  rulesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  membersList: {
    marginTop: 8,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  memberItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  memberInfo: {
    flex: 1,
    minWidth: 0,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 13,
    marginBottom: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginTop: 4,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
