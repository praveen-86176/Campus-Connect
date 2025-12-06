import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { useCampusData } from '../context/CampusDataContext';
import { RootStackParamList } from '../navigation/types';
import { RSVP } from '../types';
import { generateRsvpId } from '../utils/idUtils';
import { validatePhone, formatPhoneInput } from '../utils/validation';
import { scheduleEventReminder } from '../services/notifications/scheduledNotifications';
import { createNotification } from '../services/notifications/notificationService';

type RouteProps = RouteProp<RootStackParamList, 'RSVPForm'>;
type NavProps = NativeStackNavigationProp<RootStackParamList>;

export const RSVPFormScreen: React.FC = () => {
  const navigation = useNavigation<NavProps>();
  const route = useRoute<RouteProps>();
  const { rsvps, upsertRsvp, getEventById } = useCampusData();
  const { user } = useAuth();
  const existingRsvp = rsvps.find((record) => record.eventId === route.params.eventId && record.userId === (user?.uid ?? ''));

  const [fullName, setFullName] = useState(existingRsvp?.userName ?? (user?.name ?? ''));
  const [email, setEmail] = useState(existingRsvp?.email ?? (user?.email ?? ''));
  const [phone, setPhone] = useState(existingRsvp?.phone ?? '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      Alert.alert('Missing info', 'Please fill all fields to continue.');
      return;
    }

    // Validate phone number - must be exactly 10 digits
    if (!validatePhone(phone)) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit phone number (numbers only).');
      return;
    }

    const userId = user?.uid ?? '';
    const eventId = route.params.eventId;
    
    // RSVP ID format: `${userId}_${eventId}`
    const rsvpId = existingRsvp?.id ?? generateRsvpId(userId, eventId);
    
    const newRsvp: RSVP = {
      id: rsvpId,
      userId,
      eventId,
      userName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      timestamp: new Date().toISOString(),
      attended: existingRsvp?.attended ?? false,
    };

    try {
      setSaving(true);
      await upsertRsvp(newRsvp);
      
      const event = getEventById(eventId);
      
      // Create RSVP confirmation notification
      if (user?.uid && event) {
        try {
          await createNotification(
            user.uid,
            'rsvp_confirmed',
            'RSVP Confirmed! ✅',
            `You're registered for ${event.title}`,
            { eventId }
          );
        } catch (notifError) {
          console.error('Error creating confirmation notification:', notifError);
          // Don't fail the RSVP if notification fails
        }
      }
      
      // Schedule reminder notification 1 hour before event
      if (event && event.date && event.time && user?.uid) {
        try {
          await scheduleEventReminder(
            user.uid,
            eventId,
            event.title,
            event.date,
            event.time
          );
        } catch (reminderError) {
          console.error('Error scheduling reminder:', reminderError);
          // Don't fail the RSVP if reminder scheduling fails
        }
      }
      
      Alert.alert('Success', 'You are on the RSVP list!', [
        {
          text: 'Done',
          onPress: () => navigation.navigate('EventDetails', { eventId: route.params.eventId }),
        },
      ]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>RSVP</Text>
          <View style={{ width: 40 }} />
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="automatic"
          >
            <Text style={styles.title}>RSVP Details</Text>

            <TextInput
              placeholder="Full Name"
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
            />
            <TextInput
              placeholder="Email"
              keyboardType="email-address"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              placeholder="Phone Number (10 digits)"
              keyboardType="phone-pad"
              style={styles.input}
              value={phone}
              onChangeText={(text) => setPhone(formatPhoneInput(text))}
              maxLength={10}
            />
            {phone.length > 0 && phone.length < 10 && (
              <Text style={styles.helperText}>
                {10 - phone.length} digit{10 - phone.length !== 1 ? 's' : ''} remaining
              </Text>
            )}

            <TouchableOpacity style={[styles.button, saving && styles.buttonDisabled]} onPress={handleSubmit} disabled={saving}>
              <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Submit RSVP'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    color: Colors.mutedText,
    marginTop: -10,
    marginBottom: 14,
    marginLeft: 4,
  },
});
