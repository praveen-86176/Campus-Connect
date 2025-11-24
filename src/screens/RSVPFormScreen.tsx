import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';
import { Colors } from '../constants/colors';
import { mockUser } from '../constants/mockData';
import { useCampusData } from '../context/CampusDataContext';
import { RootStackParamList } from '../navigation/types';
import { RSVP } from '../types';

type RouteProps = RouteProp<RootStackParamList, 'RSVPForm'>;
type NavProps = NativeStackNavigationProp<RootStackParamList>;

export const RSVPFormScreen: React.FC = () => {
  const navigation = useNavigation<NavProps>();
  const route = useRoute<RouteProps>();
  const { rsvps, upsertRsvp } = useCampusData();
  const existingRsvp = rsvps.find((record) => record.eventId === route.params.eventId && record.userId === mockUser.id);

  const [fullName, setFullName] = useState(existingRsvp?.userName ?? mockUser.name);
  const [email, setEmail] = useState(existingRsvp?.email ?? mockUser.email);
  const [phone, setPhone] = useState(existingRsvp?.phone ?? '');
  const [saving, setSaving] = useState(false);

  const rsvpSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  });

  const handleSubmit = async () => {
    const result = rsvpSchema.safeParse({ fullName, email, phone });
    if (!result.success) {
      const msg = result.error.issues[0]?.message ?? 'Invalid form data';
      Alert.alert('Invalid details', msg);
      return;
    }

    const newRsvp: RSVP = {
      id: existingRsvp?.id ?? Date.now().toString(),
      userId: mockUser.id,
      eventId: route.params.eventId,
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
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
