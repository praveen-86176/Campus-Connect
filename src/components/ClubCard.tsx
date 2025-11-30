import { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Club } from '../types';

type Props = {
  club: Club;
  onPress: (club: Club) => void;
  category?: string;
  isFollowing?: boolean;
  gradientColors?: string[];
};

const ClubCardComponent: React.FC<Props> = ({
  club,
  onPress,
  category = 'Tech',
  isFollowing = false,
  gradientColors = ['#1E90FF', '#00CED1']
}) => {
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
            style={[styles.followButton, isFollowing && styles.followingButton]}
          >
            <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
              {isFollowing ? 'Following' : 'Follow'}
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
    ...Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.08)' },
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
    }),
  },
  gradientHeader: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    backgroundColor: Colors.categoryBg,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.categoryText,
  },
  description: {
    fontSize: 14,
    color: Colors.mutedText,
    marginBottom: 12,
    lineHeight: 20,
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
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'flex-end',
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
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  viewDetailsText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
    marginRight: 4,
  },
});

