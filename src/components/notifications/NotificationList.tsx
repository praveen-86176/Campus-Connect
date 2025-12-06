import React from 'react';
import { FlatList, View, StyleSheet, RefreshControl } from 'react-native';
import { NotificationItem } from './NotificationItem';
import { AppNotification } from '../../types/Notification.types';
import { EmptyState } from '../EmptyState';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../constants/colors';

interface NotificationListProps {
  notifications: AppNotification[];
  onNotificationPress: (notification: AppNotification) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onNotificationPress,
  refreshing = false,
  onRefresh,
}) => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  if (notifications.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <EmptyState message="No notifications yet" />
      </View>
    );
  }

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <NotificationItem
          notification={item}
          onPress={() => onNotificationPress(item)}
        />
      )}
      contentContainerStyle={styles.listContent}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        ) : undefined
      }
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
});
