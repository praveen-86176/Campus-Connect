import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  ActivityIndicator,
  Image,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { User, UserRole } from '../../types';
import { adminService } from '../../services/adminService';

type UserManagementNavProp = NativeStackNavigationProp<any>;

export const UserManagementScreen: React.FC = () => {
  const navigation = useNavigation<UserManagementNavProp>();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await adminService.getAllUsers();
      setUsers(allUsers);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && user.role !== 'inactive') ||
        (statusFilter === 'inactive' && user.role === 'inactive');
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      await loadUsers();
      Alert.alert('Success', 'User role updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update user role');
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await adminService.activateUser(userId);
      } else {
        await adminService.deactivateUser(userId);
      }
      await loadUsers();
      Alert.alert('Success', `User ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.deleteUser(userId);
              await loadUsers();
              Alert.alert('Success', 'User deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleBulkRoleChange = () => {
    if (selectedUsers.size === 0) {
      Alert.alert('No Selection', 'Please select users first');
      return;
    }

    Alert.alert(
      'Bulk Role Change',
      'Select new role for selected users',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Student', onPress: () => bulkUpdateRole('student') },
        { text: 'Organizer', onPress: () => bulkUpdateRole('organizer') },
        { text: 'Admin', onPress: () => bulkUpdateRole('admin') },
      ]
    );
  };

  const bulkUpdateRole = async (role: UserRole) => {
    try {
      const promises = Array.from(selectedUsers).map(userId => 
        adminService.updateUserRole(userId, role)
      );
      await Promise.all(promises);
      setSelectedUsers(new Set());
      await loadUsers();
      Alert.alert('Success', 'User roles updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update user roles');
    }
  };

  const getRoleColor = (role?: UserRole): string => {
    switch (role) {
      case 'admin':
      case 'developer':
        return '#EF4444';
      case 'organizer':
        return '#3B82F6';
      case 'club_leader':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading users...</Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>User Management</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color={colors.mutedText} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search users..."
            placeholderTextColor={colors.mutedText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.mutedText} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              { backgroundColor: roleFilter === 'all' ? colors.primary : colors.card },
            ]}
            onPress={() => setRoleFilter('all')}
          >
            <Text style={[styles.filterText, { color: roleFilter === 'all' ? '#FFFFFF' : colors.text }]}>
              All Roles
            </Text>
          </TouchableOpacity>
          {(['student', 'organizer', 'admin'] as UserRole[]).map((role) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.filterChip,
                { backgroundColor: roleFilter === role ? colors.primary : colors.card },
              ]}
              onPress={() => setRoleFilter(role)}
            >
              <Text style={[styles.filterText, { color: roleFilter === role ? '#FFFFFF' : colors.text }]}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <View style={[styles.bulkActions, { backgroundColor: colors.primary }]}>
            <Text style={styles.bulkActionsText}>
              {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
            </Text>
            <TouchableOpacity onPress={handleBulkRoleChange}>
              <Ionicons name="people" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>

      <ScrollView style={styles.content}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{users.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedText }]}>Total Users</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{filteredUsers.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedText }]}>Filtered</Text>
          </View>
        </View>

        {filteredUsers.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Ionicons name="people-outline" size={64} color={colors.mutedText} />
            <Text style={[styles.emptyText, { color: colors.mutedText }]}>No users found</Text>
          </View>
        ) : (
          filteredUsers.map((user) => (
            <TouchableOpacity
              key={user.uid}
              style={[styles.userCard, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('UserDetails', { userId: user.uid })}
            >
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => toggleUserSelection(user.uid)}
              >
                <Ionicons
                  name={selectedUsers.has(user.uid) ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={selectedUsers.has(user.uid) ? colors.primary : colors.mutedText}
                />
              </TouchableOpacity>

              {user.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: colors.border }]}>
                  <Ionicons name="person" size={24} color={colors.mutedText} />
                </View>
              )}

              <View style={styles.userInfo}>
                <View style={styles.userHeader}>
                  <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
                  <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) + '20' }]}>
                    <Text style={[styles.roleText, { color: getRoleColor(user.role) }]}>
                      {user.role || 'student'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.userEmail, { color: colors.mutedText }]}>{user.email}</Text>
                {user.phone && (
                  <Text style={[styles.userPhone, { color: colors.mutedText }]}>{user.phone}</Text>
                )}
                <Text style={[styles.userDate, { color: colors.mutedText }]}>
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    const currentRole = user.role || 'student';
                    const roles: UserRole[] = ['student', 'organizer', 'admin'];
                    const currentIndex = roles.indexOf(currentRole);
                    const nextRole = roles[(currentIndex + 1) % roles.length];
                    handleRoleChange(user.uid, nextRole);
                  }}
                >
                  <Ionicons name="swap-horizontal" size={20} color={colors.primary} />
                </TouchableOpacity>
                <Switch
                  value={user.role !== 'inactive'}
                  onValueChange={(value) => handleToggleUserStatus(user.uid, value)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteUser(user.uid, user.name)}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
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
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filtersContainer: {
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bulkActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  bulkActionsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  userCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  userEmail: {
    fontSize: 13,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 12,
    marginBottom: 2,
  },
  userDate: {
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  emptyState: {
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
});

