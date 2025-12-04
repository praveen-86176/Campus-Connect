import { memo } from 'react';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Club } from '../types';

type Props = {
  club: Club;
  onPress: (club: Club) => void;
  category?: string;
  isFollowing?: boolean;
  onFollowToggle?: (club: Club, isFollowing: boolean) => Promise<void>;
  gradientColors?: string[];
};

const ClubCardComponent: React.FC<Props> = ({
  club,
  onPress,
  category = 'Tech',
  isFollowing = false,
  onFollowToggle,
  gradientColors = ['#1E90FF', '#00CED1']
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleFollowToggle = async () => {
    if (!onFollowToggle) return;
    
    setIsLoading(true);
    try {
      await onFollowToggle(club, isFollowing);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update club membership');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <View style={styles.cardContainer}>
      {/* Gradient Header with People Icon */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="people" size={32} color={Colors.text} />
        </View>
      </LinearGradient>

      {/* Club Details */}
      <View style={styles.contentContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {club.name}
          </Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {club.description}
        </Text>

        {/* Member Count */}
        <View style={styles.memberRow}>
          <Ionicons name="people" size={16} color={Colors.mutedText} />
          <Text style={styles.memberText}>{club.memberCount} members</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.followButton, 
              isFollowing && styles.followingButton,
              isLoading && styles.followButtonDisabled
            ]}
            onPress={handleFollowToggle}
            disabled={isLoading || !onFollowToggle}
          >
            <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
              {isLoading ? '...' : (isFollowing ? 'Following' : 'Follow')}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => onPress(club)}
        >
          <Text style={styles.viewDetailsText}>View Club Details</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const ClubCard = memo(ClubCardComponent);

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    width: '100%',
    ...Platform.select({
      web: { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)' },
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      },
    }),
  },
  gradientHeader: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 16,
    width: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    backgroundColor: Colors.categoryBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexShrink: 0,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.categoryText,
  },
  description: {
    fontSize: 14,
    color: Colors.mutedText,
    marginBottom: 12,
    lineHeight: 20,
    width: '100%',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  memberText: {
    fontSize: 14,
    color: Colors.mutedText,
    marginLeft: 6,
  },
  buttonRow: {
    marginBottom: 12,
  },
  followButton: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'flex-end',
    minWidth: 100,
  },
  followingButton: {
    backgroundColor: Colors.primary,
  },
  followButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  followingButtonText: {
    color: Colors.textLight,
  },
  followButtonDisabled: {
    opacity: 0.6,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    width: '100%',
  },
  viewDetailsText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
    flexShrink: 1,
  },
});

