import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert, type DimensionValue } from 'react-native';
import { auth } from '../../config/firebase.config';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { getColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { validateEmail, validatePassword, validateName, passwordsMatch } from '../../utils/validation';
import { AuthStackParamList } from '../../types';

type AdminSignUpNavProp = NativeStackNavigationProp<AuthStackParamList, 'AdminSignUp'>;

const ADMIN_ROLES = ['Club Coordinator', 'Events Manager', 'Campus Administrator'] as const;

export const AdminSignUpScreen: React.FC = () => {
    const navigation = useNavigation<AdminSignUpNavProp>();
    const { signUp, updateUserProfile } = useAuth();
    const { isDark } = useTheme();
    const colors = getColors(isDark);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [institution, setInstitution] = useState('');
    const [adminRole, setAdminRole] = useState<string>('');
    const [phone, setPhone] = useState('');
    const [collegeId, setCollegeId] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [confirmFocused, setConfirmFocused] = useState(false);
    const [loading, setLoading] = useState(false);

    const getPasswordStrength = (pwd: string): { strength: string; color: string; width: DimensionValue } => {
        if (pwd.length === 0) return { strength: '', color: '#E5E7EB', width: '0%' };
        if (pwd.length < 6) return { strength: 'Weak', color: '#EF4444', width: '33%' };
        if (pwd.length < 10) return { strength: 'Medium', color: '#F59E0B', width: '66%' };
        return { strength: 'Strong', color: '#10B981', width: '100%' };
    };

    const passwordStrength = getPasswordStrength(password);

    const handleSignUp = async () => {
        if (!name || !email || !password || !confirmPassword || !institution || !adminRole || !phone || !collegeId) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        if (!validateName(name)) {
            Alert.alert('Error', 'Please enter a valid name (at least 2 characters)');
            return;
        }

        if (!validateEmail(email)) {
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

        if (!termsAccepted) {
            Alert.alert('Error', 'Please accept the Terms & Conditions');
            return;
        }

        setLoading(true);
        try {
            await signUp(email, password, {
                name,
                phone,
                institution,
                adminRole: adminRole as 'Club Coordinator' | 'Events Manager' | 'Campus Administrator',
                collegeId,
                role: 'admin',
            });
        } catch (error: any) {
            Alert.alert('Sign Up Failed', error.message || 'Please try again');
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
                            <Text style={styles.title}>Admin Sign Up</Text>
                            <Text style={styles.subtitle}>Create your admin account</Text>
                        </View>
                    </SafeAreaView>
                </LinearGradient>

                <View style={styles.formContainer}>
                    
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

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text }]}>Email *</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="mail-outline" size={20} color={colors.mutedText} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="admin@college.edu"
                                placeholderTextColor={colors.mutedText}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                    </View>

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
                                secureTextEntry={passwordFocused || !showPassword}
                                autoCapitalize="none"
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                            />
                            {!passwordFocused && password.length > 0 && (
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={colors.mutedText}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                        {password.length > 0 && (
                            <View style={styles.passwordStrengthContainer}>
                                <View style={[styles.passwordStrengthBar, { backgroundColor: colors.border }]}>
                                    <View style={[styles.passwordStrengthFill, { backgroundColor: passwordStrength.color, width: passwordStrength.width }]} />
                                </View>
                                <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
                                    {passwordStrength.strength}
                                </Text>
                            </View>
                        )}
                    </View>

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
                                secureTextEntry={confirmFocused || !showConfirmPassword}
                                autoCapitalize="none"
                                onFocus={() => setConfirmFocused(true)}
                                onBlur={() => setConfirmFocused(false)}
                            />
                            {!confirmFocused && confirmPassword.length > 0 && (
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <Ionicons
                                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={colors.mutedText}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text }]}>College/Institution Name *</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="school-outline" size={20} color={colors.mutedText} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="University Name"
                                placeholderTextColor={colors.mutedText}
                                value={institution}
                                onChangeText={setInstitution}
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text }]}>Admin Role *</Text>
                        <View style={styles.roleContainer}>
                            {ADMIN_ROLES.map((role) => (
                                <TouchableOpacity
                                    key={role}
                                    style={[
                                        styles.roleButton,
                                        { borderColor: adminRole === role ? colors.primary : colors.border, backgroundColor: colors.card },
                                        adminRole === role && { backgroundColor: colors.primary + '20' }
                                    ]}
                                    onPress={() => setAdminRole(role)}
                                >
                                    <Text style={[styles.roleButtonText, { color: adminRole === role ? colors.primary : colors.text }]}>
                                        {role}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text }]}>Phone Number *</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="call-outline" size={20} color={colors.mutedText} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="+1 234 567 8900"
                                placeholderTextColor={colors.mutedText}
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text }]}>College ID *</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="card-outline" size={20} color={colors.mutedText} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Enter your college ID"
                                placeholderTextColor={colors.mutedText}
                                value={collegeId}
                                onChangeText={setCollegeId}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.checkboxContainer}
                        onPress={() => setTermsAccepted(!termsAccepted)}
                    >
                        <View style={[styles.checkbox, { borderColor: termsAccepted ? colors.primary : colors.border, backgroundColor: termsAccepted ? colors.primary : 'transparent' }]}>
                            {termsAccepted && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                        </View>
                        <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                            I agree to the Terms & Conditions
                        </Text>
                    </TouchableOpacity>

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
                                <Text style={styles.signUpButtonText}>Create Admin Account</Text>
                            )}
                </LinearGradient>
            </TouchableOpacity>
            

                    <View style={styles.signInContainer}>
                        <Text style={[styles.signInText, { color: colors.mutedText }]}>
                            Already have an account?{' '}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SignIn', { selectedRole: 'admin' })}>
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
    passwordStrengthContainer: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    passwordStrengthBar: {
        flex: 1,
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    passwordStrengthFill: {
        height: '100%',
        borderRadius: 2,
    },
    passwordStrengthText: {
        fontSize: 12,
        fontWeight: '600',
        minWidth: 50,
    },
    roleContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    roleButton: {
        borderWidth: 1.5,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        minWidth: 120,
    },
    roleButtonText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxLabel: {
        fontSize: 14,
        flex: 1,
    },
    signUpButton: {
        borderRadius: 12,
        overflow: 'hidden',
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
