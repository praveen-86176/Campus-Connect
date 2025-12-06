import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { getColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { validateName, validateEmail } from '../utils/validation';
import { RootStackParamList } from '../navigation/types';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '../services/cloudinaryService';

type EditProfileNavProp = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;

export const EditProfileScreen: React.FC = () => {
    const navigation = useNavigation<EditProfileNavProp>();
    const { user, updateUserProfile } = useAuth();
    const { isDark } = useTheme();
    const colors = getColors(isDark);

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [major, setMajor] = useState(user?.major || '');
    const [graduationYear, setGraduationYear] = useState(user?.graduationYear || '');
    const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
    const [loading, setLoading] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    // Request media library permissions on mount
    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    // Permission will be requested when user tries to pick image
                }
            }
        })();
    }, []);

    const pickImage = async () => {
        try {
            setUploadingPhoto(true);
            
            // Request permission if not granted
            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
                    setUploadingPhoto(false);
                    return;
                }
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1], // Square for profile pictures
                quality: 1,
            });

            if (!result.canceled && result.assets[0]) {
                // Upload to Cloudinary
                const uploadResult = await uploadImageToCloudinary(
                    result.assets[0].uri,
                    undefined,
                    'profile-pictures'
                );
                
                if (uploadResult) {
                    setPhotoURL(uploadResult.secureUrl);
                    Alert.alert('Success', 'Profile photo uploaded successfully!');
                }
            }
        } catch (error: any) {
            console.error('Error uploading image to Cloudinary:', error);
            Alert.alert('Error', error.message || 'Failed to upload photo');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleSave = async () => {
        // Validation
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter your name');
            return;
        }

        if (!validateName(name)) {
            Alert.alert('Error', 'Please enter a valid name (at least 2 characters)');
            return;
        }

        // Email is read-only, but we validate it anyway
        if (email && !validateEmail(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            await updateUserProfile({
                name: name.trim(),
                major: major.trim() || undefined,
                graduationYear: graduationYear.trim() || undefined,
                photoURL: photoURL || undefined,
            });
            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePhoto = () => {
        Alert.alert(
            'Change Profile Photo',
            'Choose an option',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Choose from Library',
                    onPress: pickImage,
                },
                {
                    text: 'Remove Photo',
                    style: 'destructive',
                    onPress: () => {
                        setPhotoURL('');
                    },
                },
            ]
        );
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Gradient Header */}
                <LinearGradient
                    colors={[colors.gradientStart, colors.gradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.header}
                >
                    <SafeAreaView edges={['top']}>
                        <View style={styles.headerContent}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                            <Text style={styles.title}>Edit Profile</Text>
                            <Text style={styles.subtitle}>Update your information</Text>
                        </View>
                    </SafeAreaView>
                </LinearGradient>

                {/* Form */}
                <View style={styles.formContainer}>
                    {/* Profile Picture */}
                    <View style={styles.photoContainer}>
                        <TouchableOpacity 
                            style={styles.photoButton}
                            onPress={handleChangePhoto}
                            disabled={uploadingPhoto}
                        >
                            {photoURL ? (
                                <Image source={{ uri: photoURL }} style={styles.profilePhoto} />
                            ) : (
                                <View style={[styles.profilePhotoPlaceholder, { backgroundColor: colors.card }]}>
                                    <Ionicons name="person" size={48} color={colors.mutedText} />
                                </View>
                            )}
                            {uploadingPhoto && (
                                <View style={styles.uploadingOverlay}>
                                    <ActivityIndicator color="#FFFFFF" />
                                </View>
                            )}
                            <View style={[styles.cameraIcon, { backgroundColor: colors.primary }]}>
                                <Ionicons name="camera" size={20} color="#FFFFFF" />
                            </View>
                        </TouchableOpacity>
                        <Text style={[styles.photoLabel, { color: colors.mutedText }]}>Tap to change photo</Text>
                    </View>

                    {/* Name Input */}
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text }]}>Full Name *</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="person-outline" size={20} color={colors.mutedText} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="John Doe"
                                placeholderTextColor={colors.mutedText}
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                        </View>
                    </View>

                    {/* Email Input (Read-only) */}
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border, opacity: 0.6 }]}>
                            <Ionicons name="mail-outline" size={20} color={colors.mutedText} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: colors.mutedText }]}
                                value={email}
                                editable={false}
                            />
                        </View>
                        <Text style={[styles.helperText, { color: colors.mutedText }]}>Email cannot be changed</Text>
                    </View>

                    {/* Major Input */}
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text }]}>Major (Optional)</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="school-outline" size={20} color={colors.mutedText} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Computer Science"
                                placeholderTextColor={colors.mutedText}
                                value={major}
                                onChangeText={setMajor}
                            />
                        </View>
                    </View>

                    {/* Graduation Year Input */}
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text }]}>Graduation Year (Optional)</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="calendar-outline" size={20} color={colors.mutedText} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="2025"
                                placeholderTextColor={colors.mutedText}
                                value={graduationYear}
                                onChangeText={setGraduationYear}
                                keyboardType="number-pad"
                                maxLength={4}
                            />
                        </View>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        style={[styles.saveButton, { opacity: loading ? 0.7 : 1 }]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={[colors.gradientStart, colors.gradientEnd]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.saveButtonGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        paddingBottom: 32,
    },
    headerContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    backButton: {
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 40,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        height: 52,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
    },
    helperText: {
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    saveButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 8,
        marginBottom: 24,
    },
    saveButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    photoContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    photoButton: {
        position: 'relative',
        marginBottom: 8,
    },
    profilePhoto: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F3F4F6',
    },
    profilePhotoPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
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
        borderRadius: 60,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoLabel: {
        fontSize: 14,
        marginTop: 8,
    },
});

