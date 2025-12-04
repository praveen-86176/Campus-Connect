import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { useCampusData } from '../context/CampusDataContext';
import { RootStackParamList } from '../navigation/types';
import { RSVP } from '../types';
import { generateRsvpId } from '../utils/idUtils';

type RouteProps = RouteProp<RootStackParamList, 'RSVPForm'>;
type NavProps = NativeStackNavigationProp<RootStackParamList>;

export const RSVPFormScreen: React.FC = () => {
  const navigation = useNavigation<NavProps>();
  const route = useRoute<RouteProps>();
  const { rsvps, upsertRsvp } = useCampusData();
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
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
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
              placeholder="Phone Number"
              keyboardType="phone-pad"
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
            />

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
});
