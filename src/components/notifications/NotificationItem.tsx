import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppNotification } from '../../types/Notification.types';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../constants/colors';

interface NotificationItemProps {
  notification: AppNotification;
  onPress: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
}) => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  const getIcon = () => {
    switch (notification.type) {
      case 'new_event':
        return 'calendar';
      case 'new_club':
        return 'people';
      case 'event_reminder':
        return 'alarm';
      case 'event_update':
        return 'information-circle';
      case 'rsvp_confirmed':
        return 'checkmark-circle';
      default:
        return 'notifications';
    }
  };

  const getIconColor = () => {
    switch (notification.type) {
      case 'new_event':
        return '#10B981';
      case 'new_club':
        return '#3B82F6';
      case 'event_reminder':
        return '#F59E0B';
      case 'event_update':
        return '#6366F1';
      case 'rsvp_confirmed':
        return '#10B981';
      default:
        return colors.primary;
    }
  };

  let timeAgo = 'just now';
  try {
    timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
      addSuffix: true,
    });
  } catch (error) {
    console.error('Error formatting date:', error);
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: notification.read ? colors.card : colors.card + 'E0' },
        !notification.read && { borderLeftWidth: 3, borderLeftColor: colors.primary }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: getIconColor() + '20' }]}>
        <Ionicons name={getIcon() as any} size={24} color={getIconColor()} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{notification.title}</Text>
        <Text style={[styles.body, { color: colors.mutedText }]} numberOfLines={2}>
          {notification.body}
        </Text>
        <Text style={[styles.time, { color: colors.mutedText }]}>{timeAgo}</Text>
      </View>

      {!notification.read && (
        <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
});
