import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  const [touched, setTouched] = useState<{ name: boolean; email: boolean; phone: boolean }>({ name: false, email: false, phone: false });

  const validateName = (value: string) => {
    const v = value.trim();
    if (v.length < 2) return 'Enter your full name';
    if (!/^[A-Za-z][A-Za-z ]+$/.test(v)) return 'Use letters and spaces only';
    return '';
  };

  const validateEmail = (value: string) => {
    const v = value.trim();
    if (!v) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email';
    return '';
  };

  const validatePhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return 'Phone is required';
    if (digits.length < 10 || digits.length > 15) return 'Enter 10–15 digits';
    return '';
  };

  const nameError = validateName(fullName);
  const emailError = validateEmail(email);
  const phoneError = validatePhone(phone);
  const isValid = !nameError && !emailError && !phoneError;

  const handleSubmit = async () => {
    if (!isValid) {
      Alert.alert('Missing info', 'Please correct the highlighted fields.');
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
        style={[styles.input, touched.name && nameError ? styles.inputError : undefined]}
        value={fullName}
        onChangeText={(t) => setFullName(t)}
        onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
      />
      {touched.name && !!nameError && <Text style={styles.errorText}>{nameError}</Text>}
      <TextInput
        placeholder="Email"
        keyboardType="email-address"
        style={[styles.input, touched.email && emailError ? styles.inputError : undefined]}
        value={email}
        onChangeText={(t) => setEmail(t)}
        onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
      />
      {touched.email && !!emailError && <Text style={styles.errorText}>{emailError}</Text>}
      <TextInput
        placeholder="Phone Number"
        keyboardType="phone-pad"
        style={[styles.input, touched.phone && phoneError ? styles.inputError : undefined]}
        value={phone}
        onChangeText={(t) => setPhone(t)}
        onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
      />
      {touched.phone && !!phoneError && <Text style={styles.errorText}>{phoneError}</Text>}

      <TouchableOpacity style={[styles.button, (saving || !isValid) && styles.buttonDisabled]} onPress={handleSubmit} disabled={saving || !isValid}>
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
  inputError: {
    borderColor: Colors.danger,
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
  errorText: {
    color: Colors.danger,
    marginTop: -8,
    marginBottom: 8,
    fontSize: 12,
  },
});
