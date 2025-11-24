import { memo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { Colors } from '../constants/colors';
import { Event } from '../types';

type Props = {
  event: Event;
  onPress: (event: Event) => void;
};

const EventCardComponent: React.FC<Props> = ({ event, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const daysLeft = Math.ceil((new Date(event.date).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  const countdown = Number.isFinite(daysLeft) ? (daysLeft >= 0 ? `${daysLeft}d` : 'Past') : '';

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(event)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${event.date} ${event.time}, ${event.location}`}
    >
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.meta}>{event.rsvpCount}/{event.capacity}</Text>
        </View>
        <Text style={styles.detail}>{event.date} • {event.time}{countdown ? ` • ${countdown}` : ''}</Text>
        <Text style={styles.location}>{event.location}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const EventCard = memo(EventCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    padding: 18,
    borderRadius: 18,
    marginBottom: 12,
    ...Platform.select({
      web: { boxShadow: '0px 6px 12px rgba(0,0,0,0.06)' },
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: 12,
  },
  meta: {
    color: Colors.primary,
    fontWeight: '600',
  },
  detail: {
    color: Colors.mutedText,
    marginBottom: 4,
  },
  location: {
    color: Colors.text,
    fontWeight: '500',
  },
});
