import { memo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Event } from '../types';

type Props = {
  event: Event;
  onPress: (event: Event) => void;
  category?: string;
};

const EventCardComponent: React.FC<Props> = ({ event, onPress, category = 'Tech' }) => {
  return (
    <View style={styles.cardContainer}>
      {/* Gradient Header with Calendar Icon */}
      <LinearGradient
        colors={['#6B9FFF', '#A78BFA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <Ionicons name="calendar-outline" size={64} color="rgba(255, 255, 255, 0.4)" />
      </LinearGradient>

      {/* Event Details */}
      <View style={styles.contentContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        </View>

        <Text style={styles.clubName}>Computer Science Club</Text>

        {/* Date, Time, Location */}
        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={16} color={Colors.mutedText} />
          <Text style={styles.infoText}>{event.date}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time" size={16} color={Colors.mutedText} />
          <Text style={styles.infoText}>{event.time}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location" size={16} color={Colors.mutedText} />
          <Text style={styles.infoText}>{event.location}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="people" size={16} color={Colors.mutedText} />
          <Text style={styles.infoText}>{event.rsvpCount} attending</Text>
        </View>

        {/* RSVP Button */}
        <TouchableOpacity
          style={styles.rsvpButton}
          onPress={() => onPress(event)}
        >
          <Text style={styles.rsvpButtonText}>RSVP Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const EventCard = memo(EventCardComponent);

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)' },
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      },
    }),
  },
  gradientHeader: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
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
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.categoryText,
  },
  clubName: {
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 12,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.mutedText,
    marginLeft: 8,
  },
  rsvpButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  rsvpButtonText: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: '700',
  },
});

