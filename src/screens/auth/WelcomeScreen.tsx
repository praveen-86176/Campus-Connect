import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getColors } from '../../constants/colors';
import { AuthStackParamList } from '../../types';

type WelcomeNavProp = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeNavProp>();
  // Always use light mode for welcome page (ignore theme)
  const colors = getColors(false);

  const handleRoleSelection = (role: 'student' | 'admin') => {
    if (role === 'admin') {
      navigation.navigate('AdminSignUp');
    } else {
      navigation.navigate('StudentSignUp');
    }
  };

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          {/* Main Card */}
          <View style={[styles.card, { backgroundColor: colors.card, shadowColor: '#000', borderColor: colors.primary + '40' }]}>
            {/* Title */}
            <Text style={[styles.title, { color: colors.text }]}>Welcome to Campus Connect</Text>
            
            {/* Subtitle */}
            <Text style={[styles.subtitle, { color: colors.mutedText }]}>
              Please select your role to continue
            </Text>

            {/* Role Selection Buttons */}
            <View style={styles.buttonsContainer}>
              {/* Student Button */}
              <TouchableOpacity
                style={[styles.roleButton, { borderColor: colors.primary + '60', backgroundColor: colors.card }]}
                onPress={() => handleRoleSelection('student')}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  <Ionicons name="person-outline" size={32} color={colors.primary} />
                  <Text style={[styles.roleTitle, { color: colors.primary }]}>
                    I am a Student
                  </Text>
                  <Text style={[styles.roleDescription, { color: colors.mutedText }]}>
                    I want to browse events and RSVP
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Admin Button */}
              <TouchableOpacity
                style={[styles.roleButton, { borderColor: colors.success + '60', backgroundColor: colors.card }]}
                onPress={() => handleRoleSelection('admin')}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  <Ionicons name="shield-checkmark-outline" size={32} color={colors.success} />
                  <Text style={[styles.roleTitle, { color: colors.success }]}>
                    I am an Admin
                  </Text>
                  <Text style={[styles.roleDescription, { color: colors.mutedText }]}>
                    I want to manage events and attendance
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
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
    borderWidth: 2.5,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
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
    borderWidth: 2.5,
    padding: 24,
    minHeight: 140,
    justifyContent: 'center',
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
