import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { AuthStackParamList } from '../../types';

type WelcomeNavProp = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeNavProp>();
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  const handleRoleSelection = (role: 'student' | 'admin') => {
    if (role === 'admin') {
      navigation.navigate('AdminSignUp');
    } else {
      navigation.navigate('StudentSignUp');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#E8F4F8' }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          {/* Main Card */}
          <View style={[styles.card, { backgroundColor: '#FFFFFF', shadowColor: '#000' }]}>
            {/* Title */}
            <Text style={styles.title}>Welcome to Campus Connect</Text>
            
            {/* Subtitle */}
            <Text style={[styles.subtitle, { color: colors.mutedText }]}>
              Please select your role to continue
            </Text>

            {/* Role Selection Buttons */}
            <View style={styles.buttonsContainer}>
              {/* Student Button */}
              <TouchableOpacity
                style={[styles.roleButton, styles.studentButton]}
                onPress={() => handleRoleSelection('student')}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  <Ionicons name="person-outline" size={32} color="#1E90FF" />
                  <Text style={[styles.roleTitle, { color: '#1E90FF' }]}>
                    I am a Student
                  </Text>
                  <Text style={[styles.roleDescription, { color: '#4A5568' }]}>
                    I want to browse events and RSVP
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Admin Button */}
              <TouchableOpacity
                style={[styles.roleButton, styles.adminButton]}
                onPress={() => handleRoleSelection('admin')}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  <Ionicons name="shield-checkmark-outline" size={32} color="#10B981" />
                  <Text style={[styles.roleTitle, { color: '#10B981' }]}>
                    I am an Admin
                  </Text>
                  <Text style={[styles.roleDescription, { color: '#4A5568' }]}>
                    I want to manage events and attendance
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

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
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  buttonsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  roleButton: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 24,
    minHeight: 140,
    justifyContent: 'center',
  },
  studentButton: {
    borderColor: '#1E90FF',
    backgroundColor: '#FFFFFF',
  },
  adminButton: {
    borderColor: '#10B981',
    backgroundColor: '#FFFFFF',
  },
  buttonContent: {
    alignItems: 'center',
    gap: 12,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  roleDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  signInText: {
    fontSize: 15,
  },
  signInLink: {
    fontSize: 15,
    fontWeight: '700',
  },
});
