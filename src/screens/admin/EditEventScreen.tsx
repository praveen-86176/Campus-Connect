import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Switch, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useCampusData } from '../../context/CampusDataContext';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../../types';
import { pickAndUploadImage, takePhotoAndUpload } from '../../services/cloudinaryService';

export const EditEventScreen: React.FC = () => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { clubs, events, createEvent } = useCampusData();
  const eventId = route.params?.eventId;
  const event = events.find(e => e.id === eventId);

  const [clubId, setClubId] = useState(event?.clubId ?? (clubs[0]?.id ?? ''));
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [date, setDate] = useState(event?.date || '');
  const [time, setTime] = useState(event?.time || '');
  const [location, setLocation] = useState(event?.location || '');
  const [capacity, setCapacity] = useState(event?.capacity?.toString() || '0');
  const [category, setCategory] = useState(event?.category || 'Workshop');
  const [registrationRequired, setRegistrationRequired] = useState(event?.registrationRequired ?? true);
  const [image, setImage] = useState<string>(event?.image || '');
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleSubmit = async () => {
    if (!clubId || !title || !description || !date || !time || !location) {
      Alert.alert('Missing info', 'Please fill all required fields.');
      return;
    }

    const now = new Date();
    const updatedEvent: Event = {
      ...event!,
      clubId,
      title: title.trim(),
      description: description.trim(),
      date: date.trim(),
      time: time.trim(),
      location: location.trim(),
      category: category.trim(),
      capacity: Number(capacity) || 0,
      registrationRequired,
      image: image || undefined,
      updatedAt: now,
    };

    try {
      await createEvent(updatedEvent);
      Alert.alert('Success', 'Event updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update event');
    }
  };

  const handleImagePicker = () => {
    Alert.alert(
      'Change Event Photo',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Take Photo',
          onPress: async () => {
            try {
              setUploadingImage(true);
              const result = await takePhotoAndUpload('event-photos', true);
              if (result) {
                setImage(result.secureUrl);
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to upload photo');
            } finally {
              setUploadingImage(false);
            }
          },
        },
        {
          text: 'Choose from Library',
          onPress: async () => {
            try {
              setUploadingImage(true);
              const result = await pickAndUploadImage('event-photos', true);
              if (result) {
                setImage(result.secureUrl);
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to upload photo');
            } finally {
              setUploadingImage(false);
            }
          },
        },
      ]
    );
  };

  if (!event) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView>
          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>Event not found</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: colors.text }]}>Edit Event</Text>

          <Text style={[styles.label, { color: colors.text }]}>Club</Text>
          <View style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
            <Text style={{ color: colors.text }}>{clubs.find(c => c.id === clubId)?.name || 'Select a club'}</Text>
            <Ionicons name="chevron-down" size={18} color={colors.mutedText} />
          </View>

          <Text style={[styles.label, { color: colors.text }]}>Title</Text>
          <TextInput style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]} value={title} onChangeText={setTitle} placeholder="Event title" placeholderTextColor={colors.mutedText} />

          <Text style={[styles.label, { color: colors.text }]}>Description</Text>
          <TextInput style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text, height: 100 }]} multiline value={description} onChangeText={setDescription} placeholder="Event description" placeholderTextColor={colors.mutedText} />

          <Text style={[styles.label, { color: colors.text }]}>Date (YYYY-MM-DD)</Text>
          <TextInput style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]} value={date} onChangeText={setDate} placeholder="2025-12-15" placeholderTextColor={colors.mutedText} />

          <Text style={[styles.label, { color: colors.text }]}>Time (e.g., 6:00 PM)</Text>
          <TextInput style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]} value={time} onChangeText={setTime} placeholder="6:00 PM" placeholderTextColor={colors.mutedText} />

          <Text style={[styles.label, { color: colors.text }]}>Location</Text>
          <TextInput style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]} value={location} onChangeText={setLocation} placeholder="Hall 101" placeholderTextColor={colors.mutedText} />

          <Text style={[styles.label, { color: colors.text }]}>Event Photo (Optional)</Text>
          <TouchableOpacity 
            style={[styles.imagePicker, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={handleImagePicker}
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <ActivityIndicator color={colors.primary} />
            ) : image ? (
              <View style={styles.imagePreview}>
                <Image source={{ uri: image }} style={styles.previewImage} />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => setImage('')}
                >
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={32} color={colors.mutedText} />
                <Text style={[styles.imagePlaceholderText, { color: colors.mutedText }]}>Tap to add photo</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={[styles.label, { color: colors.text }]}>Capacity</Text>
          <TextInput style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]} value={capacity} onChangeText={setCapacity} keyboardType="number-pad" placeholder="50" placeholderTextColor={colors.mutedText} />

          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.text }]}>Registration Required</Text>
            <Switch value={registrationRequired} onValueChange={setRegistrationRequired} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.textLight} />
          </View>

          <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Update Event</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  imagePicker: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 16,
    marginBottom: 14,
    minHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 4,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
  },
});

