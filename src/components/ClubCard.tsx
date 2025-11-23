import { memo, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { Colors } from '../constants/colors';
import { Club } from '../types';

type Props = {
  club: Club;
  onPress: (club: Club) => void;
};

const ClubCardComponent: React.FC<Props> = ({ club, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(club)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.card, { transform: [{ scale }] }] }>
        <Image source={{ uri: club.logo }} style={styles.logo} />
        <View style={styles.content}>
          <Text style={styles.title}>{club.name}</Text>
          <Text style={styles.description}>{club.description}</Text>
          <Text style={styles.meta}>{club.memberCount} members</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const ClubCard = memo(ClubCardComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    padding: 16,
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
  logo: {
    width: 60,
    height: 60,
    borderRadius: 14,
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  description: {
    marginTop: 4,
    fontSize: 14,
    color: Colors.mutedText,
  },
  meta: {
    marginTop: 8,
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
});
