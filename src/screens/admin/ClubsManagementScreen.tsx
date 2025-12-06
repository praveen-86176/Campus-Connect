import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { getColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useCampusData } from '../../context/CampusDataContext';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import { getClubCategoryImage, getClubCategoryIcon } from '../../utils/clubCategoryImages';

import { AdminStackParamList } from '../../navigation/types';

type ClubsNavProp = NativeStackNavigationProp<AdminStackParamList>;

export const ClubsManagementScreen: React.FC = () => {
  const navigation = useNavigation<ClubsNavProp>();
  const { clubs, refreshData } = useCampusData();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  
  const handleInitializeDefaultClubs = async () => {
    if (!user?.uid) return;
    try {
      await adminService.initializeDefaultClubs(user.uid);
      await refreshData();
      Alert.alert('Success', 'Default clubs (Tech, Cultural, Sports, Arts) have been created!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to initialize default clubs');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>Clubs Management</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('CreateClub')}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <ScrollView style={styles.content}>
        {clubs.length > 0 ? (
          clubs.map((club) => {
            const categoryImage = getClubCategoryImage(club.category);
            const categoryIcon = getClubCategoryIcon(club.category);
            
            return (
              <TouchableOpacity
                key={club.id}
                style={[styles.clubCard, { backgroundColor: colors.card }]}
                onPress={() => navigation.navigate('ClubDetails', { clubId: club.id })}
                activeOpacity={0.8}
              >
                <View style={styles.clubCardContent}>
                  {/* Club Image */}
                  <View style={styles.imageContainer}>
                    {club.logo && club.logo.trim() !== '' ? (
                      <Image
                        source={{ uri: club.logo }}
                        style={styles.clubImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Image
                        source={{ uri: categoryImage }}
                        style={styles.clubImage}
                        resizeMode="cover"
                      />
                    )}
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
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Ionicons name="people-outline" size={64} color={colors.mutedText} />
            <Text style={[styles.emptyText, { color: colors.mutedText }]}>No clubs yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.mutedText }]}>
              Initialize default clubs or create your first club
            </Text>
            <TouchableOpacity
              style={[styles.initButton, { backgroundColor: colors.primary, marginTop: 16 }]}
              onPress={handleInitializeDefaultClubs}
            >
              <Ionicons name="sparkles" size={20} color="#FFFFFF" />
              <Text style={styles.initButtonText}>Initialize Default Clubs</Text>
            </TouchableOpacity>
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
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
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
    paddingVertical: 4,
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
  initButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  initButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

