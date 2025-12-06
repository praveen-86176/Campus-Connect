import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { getColors } from '../../constants/colors';
import { validateEmail, validatePassword, validateName, passwordsMatch, normalizeEmail, getFirebaseAuthErrorMessage } from '../../utils/validation';
import { AuthStackParamList } from '../../types';

type SignUpNavProp = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;
type SignUpRouteProp = RouteProp<AuthStackParamList, 'SignUp'>;

export const SignUpScreen: React.FC = () => {
    const navigation = useNavigation<SignUpNavProp>();
    const route = useRoute<SignUpRouteProp>();
    const { signUp } = useAuth();
    // Always use light mode for sign up page
    const colors = getColors(false);
    
    const selectedRole = route.params?.selectedRole || 'student';

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [major, setMajor] = useState('');
    const [graduationYear, setGraduationYear] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSignUp = async () => {
        // Validation
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        if (!validateName(name)) {
            Alert.alert('Error', 'Please enter a valid name (at least 2 characters, letters only)');
            return;
        }

        // Normalize email (trim and lowercase)
        const normalizedEmail = normalizeEmail(email);
        
        if (!normalizedEmail || !validateEmail(normalizedEmail)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            Alert.alert('Error', passwordValidation.message || 'Invalid password');
            return;
        }

        if (!passwordsMatch(password, confirmPassword)) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            // Use normalized email for sign up
            await signUp(normalizedEmail, password, {
                name: name.trim(),
                major: major.trim(),
                graduationYear: graduationYear.trim(),
                role: selectedRole,
            });
            // Navigation handled by AuthContext state change
        } catch (error: any) {
            const friendlyMessage = getFirebaseAuthErrorMessage(error);
            Alert.alert('Sign Up Failed', friendlyMessage);
        } finally {
            setLoading(false);
        }
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
                            <Text style={styles.title}>Create Account</Text>
                            <Text style={styles.subtitle}>
                                Sign up as {selectedRole === 'admin' ? 'Admin' : 'Student'}
                            </Text>
                        </View>
                    </SafeAreaView>
                </LinearGradient>

                {/* Form */}
                <View style={styles.formContainer}>
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

                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text }]}>Email *</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="mail-outline" size={20} color={colors.mutedText} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="your.email@university.edu"
                                placeholderTextColor={colors.mutedText}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text }]}>Password *</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="lock-closed-outline" size={20} color={colors.mutedText} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="At least 6 characters"
                                placeholderTextColor={colors.mutedText}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={colors.mutedText}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Confirm Password Input */}
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text }]}>Confirm Password *</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="lock-closed-outline" size={20} color={colors.mutedText} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Re-enter password"
                                placeholderTextColor={colors.mutedText}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <Ionicons
                                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={colors.mutedText}
                                />
                            </TouchableOpacity>
                        </View>
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

                    {/* Sign Up Button */}
                    <TouchableOpacity
                        style={[styles.signUpButton, { opacity: loading ? 0.7 : 1 }]}
                        onPress={handleSignUp}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={[colors.gradientStart, colors.gradientEnd]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.signUpButtonGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.signUpButtonText}>Create Account</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Sign In Link */}
                    <View style={styles.signInContainer}>
                        <Text style={[styles.signInText, { color: colors.mutedText }]}>
                            Already have an account?{' '}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate({ name: 'SignIn', params: {} })}>
                            <Text style={[styles.signInLink, { color: colors.primary }]}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
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
        marginBottom: 16,
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
    signUpButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 8,
        marginBottom: 24,
    },
    signUpButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    signUpButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signInText: {
        fontSize: 15,
    },
    signInLink: {
        fontSize: 15,
        fontWeight: '700',
    },
});
