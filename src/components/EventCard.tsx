import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Event } from '../types';
import { useCampusData } from '../context/CampusDataContext';

type Props = {
  event: Event;
  onPress: (event: Event) => void;
};

const EventCardComponent: React.FC<Props> = ({ event, onPress }) => {
  const { clubs } = useCampusData();
  const [imageError, setImageError] = React.useState(false);
  
  // Get club name from real data
  const club = clubs.find(c => c.id === event.clubId);
  const clubName = club?.name || 'Club';
  const category = event.category || 'Event';

  // Track current image URL to reset error state only when image changes
  const currentImageUrl = React.useRef<string | undefined>(event.image?.trim());
  
  // Reset image error state when event image changes
  React.useEffect(() => {
    const newImageUrl = event.image?.trim();
    if (currentImageUrl.current !== newImageUrl) {
      currentImageUrl.current = newImageUrl;
      setImageError(false);
    }
  }, [event.image]);

  // Image validation - matches CreateEventScreen logic
  // Image is saved as: image && image.trim() !== '' ? image.trim() : ''
  const hasValidImage = React.useMemo(() => {
    const imageValue = event.image;
    
    // Use same logic as CreateEventScreen: check if image exists and is not empty
    // Image from Firestore should be a string (empty string if no image)
    return imageValue && 
           typeof imageValue === 'string' && 
           imageValue.trim() !== '';
  }, [event.image]);

  return (
    <View style={styles.cardContainer}>
      {/* Event Image or Gradient Header with Calendar Icon */}
      {hasValidImage && !imageError ? (
        <Image
          key={event.image?.trim()} // Force remount when image URL changes
          source={{ uri: event.image?.trim() }}
          style={styles.eventImage}
          resizeMode="cover"
          onError={() => {
            setImageError(true);
          }}
        />
      ) : (
      <LinearGradient
        colors={['#6B9FFF', '#A78BFA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <Ionicons name="calendar-outline" size={64} color="rgba(255, 255, 255, 0.4)" />
      </LinearGradient>
      )}

      {/* Event Details */}
      <View style={styles.contentContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>
          {category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
          )}
        </View>

        <Text style={styles.clubName}>{clubName}</Text>

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
          <Ionicons 
            name={event.category === 'Online' ? "videocam" : "location"} 
            size={16} 
            color={Colors.mutedText} 
          />
          <Text style={styles.infoText}>
            {event.category === 'Online' && event.meetingPlatform 
              ? `Online - ${event.meetingPlatform}` 
              : event.location}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="people" size={16} color={Colors.mutedText} />
          <Text style={styles.infoText}>{event.registeredCount} attending</Text>
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
  eventImage: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.card,
    // Ensure image is visible
    opacity: 1,
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

