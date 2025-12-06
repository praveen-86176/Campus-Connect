import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { getColors } from '../../constants/colors';
import { validateEmail, normalizeEmail, getFirebaseAuthErrorMessage } from '../../utils/validation';
import { AuthStackParamList } from '../../types';

type SignInNavProp = NativeStackNavigationProp<AuthStackParamList, 'SignIn'>;
type SignInRouteProp = RouteProp<AuthStackParamList, 'SignIn'>;

export const SignInScreen: React.FC = () => {
    const navigation = useNavigation<SignInNavProp>();
    const route = useRoute<SignInRouteProp>();
    const { signIn } = useAuth();
    // Always use light mode for sign in page
    const colors = getColors(false);
    
    const selectedRole = route.params?.selectedRole;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // Load saved email on mount
    useEffect(() => {
        loadRememberedEmail();
    }, []);

    const loadRememberedEmail = async () => {
        try {
            const savedEmail = await AsyncStorage.getItem('remembered_email');
            const isRemembered = await AsyncStorage.getItem('remember_me');
            
            if (savedEmail && isRemembered === 'true') {
                setEmail(savedEmail);
                setRememberMe(true);
            }
        } catch (error) {
            console.error('Error loading remembered email:', error);
        }
    };

    const handleRememberMeToggle = async () => {
        const newValue = !rememberMe;
        setRememberMe(newValue);
        
        // If unchecking, clear saved email immediately
        if (!newValue) {
            try {
                await AsyncStorage.removeItem('remembered_email');
                await AsyncStorage.removeItem('remember_me');
            } catch (error) {
                console.error('Error clearing remembered email:', error);
            }
        }
    };

    const handleSignIn = async () => {
        // Validation
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        // Normalize email (trim and lowercase)
        const normalizedEmail = normalizeEmail(email);
        
        if (!normalizedEmail || !validateEmail(normalizedEmail)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        if (!password.trim()) {
            Alert.alert('Error', 'Please enter your password');
            return;
        }

        setLoading(true);
        try {
            // Use normalized email for sign in
            await signIn(normalizedEmail, password);
            
            // Handle remember me functionality
            if (rememberMe) {
                // Save email for next time
                await AsyncStorage.setItem('remembered_email', normalizedEmail);
                await AsyncStorage.setItem('remember_me', 'true');
            } else {
                // Clear saved email if remember me is unchecked
                await AsyncStorage.removeItem('remembered_email');
                await AsyncStorage.removeItem('remember_me');
            }
            
            // Navigation handled by AuthContext state change
        } catch (error: any) {
            const friendlyMessage = getFirebaseAuthErrorMessage(error);
            Alert.alert('Sign In Failed', friendlyMessage);
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
                            <TouchableOpacity 
                                onPress={() => navigation.goBack()} 
                                style={styles.backButton}
                            >
                                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                            <Text style={styles.title}>Welcome Back!</Text>
                            <Text style={styles.subtitle}>Sign in to continue to Campus Connect</Text>
                        </View>
                    </SafeAreaView>
                </LinearGradient>

                {/* Form */}
                <View style={styles.formContainer}>
                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
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
                        <Text style={[styles.label, { color: colors.text }]}>Password</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="lock-closed-outline" size={20} color={colors.mutedText} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Enter your password"
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

                    {/* Forgot Password */}
                    <TouchableOpacity
                        style={styles.forgotPassword}
                        onPress={() => navigation.navigate('ForgotPassword')}
                    >
                        <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                            Forgot Password?
                        </Text>
                    </TouchableOpacity>

                    {/* Sign In Button */}
                    <TouchableOpacity
                        style={[styles.signInButton, { opacity: loading ? 0.7 : 1 }]}
                        onPress={handleSignIn}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={[colors.gradientStart, colors.gradientEnd]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.signInButtonGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.signInButtonText}>Sign In</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Remember Me Checkbox */}
                    <View style={styles.rememberMeContainer}>
                        <TouchableOpacity
                            style={styles.checkboxContainer}
                            onPress={handleRememberMeToggle}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.checkbox, 
                                { 
                                    borderColor: rememberMe ? colors.primary : colors.border,
                                    backgroundColor: rememberMe ? colors.primary : 'transparent'
                                }
                            ]}>
                                {rememberMe && (
                                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                                )}
                            </View>
                            <Text style={[styles.checkboxLabel, { color: colors.text }]}>Remember me</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Sign Up Links */}
                    <View style={styles.signUpContainer}>
                        <Text style={[styles.signUpText, { color: colors.mutedText }]}>
                            Don't have an account?{' '}
                        </Text>
                        <View style={styles.signUpLinks}>
                            <TouchableOpacity onPress={() => navigation.navigate('StudentSignUp')}>
                                <Text style={[styles.signUpLink, { color: colors.primary }]}>Sign Up as Student</Text>
                            </TouchableOpacity>
                            {selectedRole !== 'admin' && (
                                <>
                                    <Text style={[styles.signUpText, { color: colors.mutedText }]}> or </Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('AdminSignUp')}>
                                        <Text style={[styles.signUpLink, { color: colors.primary }]}>Sign Up as Admin</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
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
        paddingBottom: 40,
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
        paddingTop: 32,
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: '600',
    },
    signInButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 24,
    },
    signInButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    signInButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    rememberMeContainer: {
        marginBottom: 20,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxLabel: {
        fontSize: 14,
    },
    signUpContainer: {
        alignItems: 'center',
    },
    signUpLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    signUpText: {
        fontSize: 15,
    },
    signUpLink: {
        fontSize: 15,
        fontWeight: '700',
    },
});
