import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { useCampusData } from '../context/CampusDataContext';
import { useAuth } from '../context/AuthContext';

export const ProfileScreen: React.FC = () => {
    const { theme, toggleTheme, isDark } = useTheme();
    const { user, signOut } = useAuth();
    const { rsvps, attendance, events } = useCampusData();
    const colors = getColors(isDark);

    // Calculate stats
    const eventsAttended = attendance.filter(a => a.userId === user?.uid && a.checkInAt).length;

    // Unique clubs joined based on RSVPs (approximation)
    const clubsJoined = new Set(
        rsvps
            .filter(r => r.userId === user?.uid)
            .map(r => {
                const event = events.find(e => e.id === r.eventId);
                return event?.clubId;
            })
            .filter(Boolean)
    ).size;

    const upcomingEvents = rsvps.filter(r => {
        if (r.userId !== user?.uid) return false;
        const event = events.find(e => e.id === r.eventId);
        if (!event) return false;
        return new Date(event.date) > new Date();
    }).length;

    // Mock notification preferences
    const [eventReminders, setEventReminders] = useState(true);
    const [newEvents, setNewEvents] = useState(true);
    const [eventUpdates, setEventUpdates] = useState(true);
    const [weeklyDigest, setWeeklyDigest] = useState(false);

    const achievements = [
        { id: '1', icon: 'star', label: 'First Event', unlocked: true, color: '#FEF3C7' },
        { id: '2', icon: 'calendar', label: '10 Events', unlocked: true, color: '#DBEAFE' },
        { id: '3', icon: 'people', label: 'Club Joiner', unlocked: true, color: '#E9D5FF' },
        { id: '4', icon: 'trophy', label: 'Locked', unlocked: false, color: '#F3F4F6' },
    ];

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut();
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to sign out');
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Gradient Header */}
                <LinearGradient
                    colors={[colors.gradientStart, colors.gradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.header}
                >
                    <SafeAreaView edges={['top']}>
                        {/* Header Content with Avatar on Left */}
                        <View style={styles.headerContent}>
                            {/* Avatar */}
                            <View style={styles.avatar}>
                                <Ionicons name="person" size={56} color={colors.primary} />
                            </View>

                            {/* User Info and Settings */}
                            <View style={styles.userInfoContainer}>
                                <View style={styles.nameContainer}>
                                    <View>
                                        <Text style={styles.name}>{user?.name || 'User'}</Text>
                                        <Text style={styles.username}>{user?.email || ''}</Text>
                                    </View>
                                    <TouchableOpacity style={styles.settingsIcon}>
                                        <Ionicons name="settings-outline" size={24} color={colors.textLight} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Stats Row */}
                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{eventsAttended}</Text>
                                <Text style={styles.statLabel}>Events Attended</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{clubsJoined}</Text>
                                <Text style={styles.statLabel}>Clubs Joined</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{upcomingEvents}</Text>
                                <Text style={styles.statLabel}>Upcoming</Text>
                            </View>
                        </View>
                    </SafeAreaView>
                </LinearGradient>

                {/* Profile Information */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile Information</Text>

                    <View style={styles.infoRow}>
                        <Ionicons name="mail-outline" size={20} color={colors.mutedText} />
                        <View style={styles.infoContent}>
                            <Text style={[styles.infoLabel, { color: colors.mutedText }]}>Email</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>{user?.email || 'N/A'}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="school-outline" size={20} color={colors.mutedText} />
                        <View style={styles.infoContent}>
                            <Text style={[styles.infoLabel, { color: colors.mutedText }]}>Major</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>{user?.major || 'Not specified'}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={20} color={colors.mutedText} />
                        <View style={styles.infoContent}>
                            <Text style={[styles.infoLabel, { color: colors.mutedText }]}>Graduation Year</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>{user?.graduationYear || 'Not specified'}</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={[styles.editButton, { borderColor: colors.border }]}>
                        <Text style={[styles.editButtonText, { color: colors.text }]}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* Achievements */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <View style={styles.achievementsHeader}>
                        <View style={styles.achievementsTitleRow}>
                            <Ionicons name="ribbon" size={20} color="#F59E0B" />
                            <Text style={[styles.sectionTitle, { color: colors.text, marginLeft: 8 }]}>Achievements</Text>
                        </View>
                        <Text style={[styles.achievementsCount, { color: colors.mutedText }]}>4/12</Text>
                    </View>

                    <View style={styles.achievementsGrid}>
                        {achievements.map((achievement) => (
                            <View key={achievement.id} style={styles.achievementItem}>
                                <View style={[styles.achievementIcon, { backgroundColor: achievement.color }]}>
                                    <Ionicons
                                        name={achievement.icon as any}
                                        size={28}
                                        color={achievement.unlocked ? colors.primary : colors.mutedText}
                                    />
                                </View>
                                <Text style={[styles.achievementLabel, { color: colors.text }]}>
                                    {achievement.label}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Notification Preferences */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Notification Preferences</Text>

                    <View style={styles.preferenceRow}>
                        <View style={styles.preferenceInfo}>
                            <Text style={[styles.preferenceTitle, { color: colors.text }]}>Event Reminders</Text>
                            <Text style={[styles.preferenceSubtitle, { color: colors.mutedText }]}>
                                Get notified before events
                            </Text>
                        </View>
                        <Switch
                            value={eventReminders}
                            onValueChange={setEventReminders}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor={colors.textLight}
                        />
                    </View>

                    <View style={styles.preferenceRow}>
                        <View style={styles.preferenceInfo}>
                            <Text style={[styles.preferenceTitle, { color: colors.text }]}>New Events</Text>
                            <Text style={[styles.preferenceSubtitle, { color: colors.mutedText }]}>
                                From clubs you follow
                            </Text>
                        </View>
                        <Switch
                            value={newEvents}
                            onValueChange={setNewEvents}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor={colors.textLight}
                        />
                    </View>

                    <View style={styles.preferenceRow}>
                        <View style={styles.preferenceInfo}>
                            <Text style={[styles.preferenceTitle, { color: colors.text }]}>Event Updates</Text>
                            <Text style={[styles.preferenceSubtitle, { color: colors.mutedText }]}>
                                Changes to your RSVPs
                            </Text>
                        </View>
                        <Switch
                            value={eventUpdates}
                            onValueChange={setEventUpdates}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor={colors.textLight}
                        />
                    </View>

                    <View style={styles.preferenceRow}>
                        <View style={styles.preferenceInfo}>
                            <Text style={[styles.preferenceTitle, { color: colors.text }]}>Weekly Digest</Text>
                            <Text style={[styles.preferenceSubtitle, { color: colors.mutedText }]}>
                                Summary of upcoming events
                            </Text>
                        </View>
                        <Switch
                            value={weeklyDigest}
                            onValueChange={setWeeklyDigest}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor={colors.textLight}
                        />
                    </View>
                </View>

                {/* Settings Menu */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]}>
                        <View style={styles.menuItemLeft}>
                            <Ionicons name="notifications-outline" size={22} color={colors.text} />
                            <Text style={[styles.menuItemText, { color: colors.text }]}>Notification Settings</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.mutedText} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]}>
                        <View style={styles.menuItemLeft}>
                            <Ionicons name="settings-outline" size={22} color={colors.text} />
                            <Text style={[styles.menuItemText, { color: colors.text }]}>Account Settings</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.mutedText} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]}>
                        <View style={styles.menuItemLeft}>
                            <Ionicons name="help-circle-outline" size={22} color={colors.text} />
                            <Text style={[styles.menuItemText, { color: colors.text }]}>Help & Support</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.mutedText} />
                    </TouchableOpacity>

                    {/* Dark Mode Toggle */}
                    <View style={[styles.menuItem, { borderBottomColor: colors.border }]}>
                        <View style={styles.menuItemLeft}>
                            <Ionicons name={isDark ? 'moon' : 'sunny'} size={22} color={colors.text} />
                            <Text style={[styles.menuItemText, { color: colors.text }]}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor={colors.textLight}
                        />
                    </View>

                    <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
                        <View style={styles.menuItemLeft}>
                            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
                            <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Sign Out</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#EF4444" />
                    </TouchableOpacity>
                </View>

                {/* App Version */}
                <Text style={[styles.version, { color: colors.mutedText }]}>Campus Events App v1.0.0</Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingBottom: 24,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        marginBottom: 24,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    userInfoContainer: {
        flex: 1,
    },
    nameContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    name: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    username: {
        fontSize: 15,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    settingsIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        color: '#FFFFFF',
        opacity: 0.9,
        textAlign: 'center',
    },
    section: {
        marginTop: 16,
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    infoContent: {
        marginLeft: 12,
        flex: 1,
    },
    infoLabel: {
        fontSize: 13,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '500',
    },
    editButton: {
        borderWidth: 1.5,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    editButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    achievementsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    achievementsTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    achievementsCount: {
        fontSize: 14,
        fontWeight: '600',
    },
    achievementsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    achievementItem: {
        width: '22%',
        alignItems: 'center',
    },
    achievementIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    achievementLabel: {
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '500',
    },
    preferenceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    preferenceInfo: {
        flex: 1,
    },
    preferenceTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    preferenceSubtitle: {
        fontSize: 13,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemText: {
        fontSize: 15,
        fontWeight: '500',
        marginLeft: 12,
    },
    version: {
        textAlign: 'center',
        fontSize: 13,
        marginTop: 24,
        marginBottom: 32,
    },
});
