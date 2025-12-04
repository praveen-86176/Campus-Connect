import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Switch, Alert, Linking, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getColors, Colors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { useCampusData } from '../context/CampusDataContext';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';
import { pickAndUploadImage, takePhotoAndUpload } from '../services/cloudinaryService';

type ProfileNavProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen: React.FC = () => {
    const navigation = useNavigation<ProfileNavProp>();
    const { theme, toggleTheme, isDark } = useTheme();
    const { user, signOut, updateUserProfile } = useAuth();
    const { rsvps, attendance, events, memberships } = useCampusData();
    const colors = getColors(isDark);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    // Calculate stats (only for students, not admin)
    const isAdmin = user?.role === 'admin' || user?.role === 'developer';
    const eventsAttended = isAdmin ? 0 : attendance.filter(a => a.userId === user?.uid && a.checkInAt).length;

    // Count clubs joined based on actual memberships (active status) - only for students
    const clubsJoined = isAdmin ? 0 : memberships.filter(
        m => m.userId === user?.uid && m.status === 'active'
    ).length;

    const upcomingEvents = isAdmin ? 0 : rsvps.filter(r => {
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

    const handleChangePhoto = () => {
        Alert.alert(
            'Change Profile Photo',
            'Choose an option',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Take Photo',
                    onPress: async () => {
                        try {
                            setUploadingPhoto(true);
                            const result = await takePhotoAndUpload('profile-pictures', true);
                            if (result) {
                                await updateUserProfile({ photoURL: result.secureUrl });
                                Alert.alert('Success', 'Profile picture updated!');
                            }
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to upload photo');
                        } finally {
                            setUploadingPhoto(false);
                        }
                    },
                },
                {
                    text: 'Choose from Library',
                    onPress: async () => {
                        try {
                            setUploadingPhoto(true);
                            const result = await pickAndUploadImage('profile-pictures', true);
                            if (result) {
                                await updateUserProfile({ photoURL: result.secureUrl });
                                Alert.alert('Success', 'Profile picture updated!');
                            }
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to upload photo');
                        } finally {
                            setUploadingPhoto(false);
                        }
                    },
                },
            ]
        );
    };


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
                            <TouchableOpacity 
                                style={styles.avatarContainer}
                                onPress={handleChangePhoto}
                                disabled={uploadingPhoto}
                            >
                                {user?.photoURL ? (
                                    <Image 
                                        source={{ uri: user.photoURL }} 
                                        style={styles.avatarImage}
                                    />
                                ) : (
                                    <View style={styles.avatar}>
                                        <Ionicons name="person" size={56} color={colors.primary} />
                                    </View>
                                )}
                                {uploadingPhoto ? (
                                    <View style={styles.uploadingOverlay}>
                                        <ActivityIndicator color="#FFFFFF" />
                                    </View>
                                ) : (
                                    <View style={styles.editPhotoBadge}>
                                        <Ionicons name="camera" size={16} color="#FFFFFF" />
                                    </View>
                                )}
                            </TouchableOpacity>

                            {/* User Info and Settings */}
                            <View style={styles.userInfoContainer}>
                                <View style={styles.nameContainer}>
                                    <View>
                                        <Text style={styles.name}>{user?.name || 'User'}</Text>
                                        <Text style={styles.username}>{user?.email || ''}</Text>
                                    </View>
                                    <TouchableOpacity 
                                        style={styles.settingsIcon}
                                        onPress={() => navigation.navigate('EditProfile')}
                                    >
                                        <Ionicons name="settings-outline" size={24} color={colors.textLight} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Stats Row - Only show for students, not admin */}
                        {!isAdmin && (
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
                        )}
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

                    {user?.role === 'admin' ? (
                        <>
                            <View style={styles.infoRow}>
                                <Ionicons name="business-outline" size={20} color={colors.mutedText} />
                                <View style={styles.infoContent}>
                                    <Text style={[styles.infoLabel, { color: colors.mutedText }]}>Institution</Text>
                                    <Text style={[styles.infoValue, { color: colors.text }]}>{user?.institution || 'Not specified'}</Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <Ionicons name="shield-checkmark-outline" size={20} color={colors.mutedText} />
                                <View style={styles.infoContent}>
                                    <Text style={[styles.infoLabel, { color: colors.mutedText }]}>Admin Role</Text>
                                    <Text style={[styles.infoValue, { color: colors.text }]}>{user?.adminRole || 'Not specified'}</Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <Ionicons name="card-outline" size={20} color={colors.mutedText} />
                                <View style={styles.infoContent}>
                                    <Text style={[styles.infoLabel, { color: colors.mutedText }]}>College ID</Text>
                                    <Text style={[styles.infoValue, { color: colors.text }]}>{user?.collegeId || 'Not specified'}</Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <Ionicons name="call-outline" size={20} color={colors.mutedText} />
                                <View style={styles.infoContent}>
                                    <Text style={[styles.infoLabel, { color: colors.mutedText }]}>Phone</Text>
                                    <Text style={[styles.infoValue, { color: colors.text }]}>{user?.phone || 'Not specified'}</Text>
                                </View>
                            </View>
                        </>
                    ) : (
                        <>
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
                        </>
                    )}

                    <TouchableOpacity 
                        style={[styles.editButton, { borderColor: colors.border }]}
                        onPress={() => navigation.navigate('EditProfile')}
                    >
                        <Text style={[styles.editButtonText, { color: colors.text }]}>Edit Profile</Text>
                    </TouchableOpacity>
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
                    <TouchableOpacity 
                        style={[styles.menuItem, { borderBottomColor: colors.border }]}
                        onPress={() => Alert.alert('Notification Settings', 'Notification preferences are managed in the section above.')}
                    >
                        <View style={styles.menuItemLeft}>
                            <Ionicons name="notifications-outline" size={22} color={colors.text} />
                            <Text style={[styles.menuItemText, { color: colors.text }]}>Notification Settings</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.mutedText} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.menuItem, { borderBottomColor: colors.border }]}
                        onPress={() => navigation.navigate('EditProfile')}
                    >
                        <View style={styles.menuItemLeft}>
                            <Ionicons name="settings-outline" size={22} color={colors.text} />
                            <Text style={[styles.menuItemText, { color: colors.text }]}>Account Settings</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.mutedText} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.menuItem, { borderBottomColor: colors.border }]}
                        onPress={() => {
                            Alert.alert(
                                'Help & Support',
                                'For support, please contact:\n\nEmail: support@campusconnect.edu\nPhone: (555) 123-4567',
                                [
                                    { text: 'OK', style: 'default' },
                                    { 
                                        text: 'Send Email', 
                                        onPress: () => Linking.openURL('mailto:support@campusconnect.edu')
                                    }
                                ]
                            );
                        }}
                    >
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
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFFFFF',
    },
    editPhotoBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    uploadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
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
