import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useCampusData } from '../../context/CampusDataContext';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';

type ClubsNavProp = NativeStackNavigationProp<any>;

export const ClubsManagementScreen: React.FC = () => {
  const navigation = useNavigation<ClubsNavProp>();
  const { clubs, refreshData } = useCampusData();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  
  const handleInitializeDefaultClubs = async () => {
    if (!user?.uid) return;
    try {
      await adminService.initializeDefaultClubs(user.uid);
      await refreshData();
      Alert.alert('Success', 'Default clubs (Tech, Cultural, Sports, Arts) have been created!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to initialize default clubs');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>Clubs Management</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('CreateClub')}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <ScrollView style={styles.content}>
        {clubs.length > 0 ? (
          clubs.map((club) => (
            <TouchableOpacity
              key={club.id}
              style={[styles.clubCard, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('ClubDetails', { clubId: club.id })}
            >
              <Text style={[styles.clubName, { color: colors.text }]}>{club.name}</Text>
              <Text style={[styles.clubMeta, { color: colors.mutedText }]}>
                {club.memberCount} members • {club.category}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Ionicons name="people-outline" size={64} color={colors.mutedText} />
            <Text style={[styles.emptyText, { color: colors.mutedText }]}>No clubs yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.mutedText }]}>
              Initialize default clubs or create your first club
            </Text>
            <TouchableOpacity
              style={[styles.initButton, { backgroundColor: colors.primary, marginTop: 16 }]}
              onPress={handleInitializeDefaultClubs}
            >
              <Ionicons name="sparkles" size={20} color="#FFFFFF" />
              <Text style={styles.initButtonText}>Initialize Default Clubs</Text>
            </TouchableOpacity>
          </View>
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
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  clubCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  clubName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  clubMeta: {
    fontSize: 14,
  },
  emptyState: {
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  initButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  initButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

