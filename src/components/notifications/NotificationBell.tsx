import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../constants/colors';

interface NotificationBellProps {
  unreadCount: number;
  onPress?: () => void;
}

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const NotificationBell: React.FC<NotificationBellProps> = ({
  unreadCount,
  onPress,
}) => {
  const navigation = useNavigation<NavProp>();
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Navigate to notifications screen
      navigation.navigate('Notifications' as never);
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      style={styles.container}
      activeOpacity={0.7}
    >
      <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
      {unreadCount > 0 && (
        <View style={[styles.badge, { backgroundColor: '#e74c3c' }]}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount.toString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 8,
    marginRight: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
