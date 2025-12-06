import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Switch, Image, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useCampusData } from '../../context/CampusDataContext';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../../types';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '../../services/cloudinaryService';
import { notifyNewEvent } from '../../services/notifications/notificationService';
import { AdminStackParamList } from '../../navigation/types';

type CreateEventNavProp = NativeStackNavigationProp<AdminStackParamList, 'CreateEvent'>;

export const CreateEventScreen: React.FC = () => {
  const navigation = useNavigation<CreateEventNavProp>();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const { clubs, createEvent } = useCampusData();
  const { user } = useAuth();

  const [clubId, setClubId] = useState(clubs[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [eventType, setEventType] = useState<'Online' | 'Offline'>('Offline');
  const [location, setLocation] = useState('');
  const [meetingPlatform, setMeetingPlatform] = useState<'Zoom' | 'Google Meet' | 'YouTube' | 'Other'>('Zoom');
  const [capacity, setCapacity] = useState('0');
  const [category, setCategory] = useState('Offline');
  const [registrationRequired, setRegistrationRequired] = useState(true);
  const [image, setImage] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showClubPicker, setShowClubPicker] = useState(false);
  const [showPlatformPicker, setShowPlatformPicker] = useState(false);

  // Request media library permissions on mount
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          // Permission will be requested when user tries to pick image
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      setUploadingImage(true);
      
      // Request permission if not granted
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
          setUploadingImage(false);
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        // Upload to Cloudinary
        const uploadResult = await uploadImageToCloudinary(
          result.assets[0].uri,
          undefined,
          'event-photos'
        );
        
        if (uploadResult) {
          setImage(uploadResult.secureUrl);
          Alert.alert('Success', 'Photo uploaded successfully!');
        }
      }
    } catch (error: any) {
      console.error('Error uploading image to Cloudinary:', error);
      Alert.alert(
        'Photo Upload Failed',
        error.message || 'Failed to upload photo. You can still create the event without a photo.',
        [
          { text: 'Continue Without Photo', style: 'cancel' },
          { text: 'Try Again', onPress: pickImage }
        ]
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!clubId) {
      Alert.alert('Missing Info', 'Please select a club for this event.');
      return;
    }
    if (!title || !title.trim()) {
      Alert.alert('Missing Info', 'Please enter an event title.');
      return;
    }
    if (!description || !description.trim()) {
      Alert.alert('Missing Info', 'Please enter an event description.');
      return;
    }
    if (!date || !date.trim()) {
      Alert.alert('Missing Info', 'Please enter an event date (YYYY-MM-DD).');
      return;
    }
    if (!time || !time.trim()) {
      Alert.alert('Missing Info', 'Please enter an event time (e.g., 6:00 PM).');
      return;
    }
    if (!endTime || !endTime.trim()) {
      Alert.alert('Missing Info', 'Please enter an event end time (e.g., 8:00 PM).');
      return;
    }
    if (eventType === 'Offline' && (!location || !location.trim())) {
      Alert.alert('Missing Info', 'Please enter an event location.');
      return;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date.trim())) {
      Alert.alert('Invalid Date', 'Please enter date in YYYY-MM-DD format (e.g., 2025-12-15).');
      return;
    }

    // Validate capacity
    const capacityNum = Number(capacity);
    if (isNaN(capacityNum) || capacityNum < 0) {
      Alert.alert('Invalid Capacity', 'Please enter a valid capacity (0 or greater).');
      return;
    }

    const now = new Date();
    const finalLocation = eventType === 'Online' ? 'Online' : location.trim();
    const finalCategory = eventType === 'Online' ? 'Online' : 'Offline';
    
    const newEvent: Event = {
      id: Date.now().toString(),
      clubId,
      title: title.trim(),
      description: description.trim(),
      date: date.trim(),
      time: time.trim(),
      endTime: endTime.trim(),
      location: finalLocation,
      category: finalCategory,
      capacity: capacityNum,
      registeredCount: 0,
      status: 'Upcoming',
      registrationRequired,
      image: image && image.trim() !== '' ? image.trim() : '',
      meetingPlatform: eventType === 'Online' ? meetingPlatform : undefined,
      createdAt: now,
      updatedAt: now,
    };

    try {
      console.log('📸 Creating event with image:', newEvent.image ? 'Yes' : 'No', newEvent.image);
      await createEvent(newEvent);
      
      // Send notifications to all students about the new event
      try {
        await notifyNewEvent(newEvent.id, newEvent.title);
      } catch (notifError) {
        console.error('Error sending notifications:', notifError);
        // Don't fail the event creation if notifications fail
      }
      
      // Clear form after successful creation
      setTitle('');
      setDescription('');
      setDate('');
      setTime('');
      setEndTime('');
      setEventType('Offline');
      setLocation('');
      setMeetingPlatform('Zoom');
      setCapacity('0');
      setImage('');
      setCategory('Offline');
      setRegistrationRequired(true);
      Alert.alert('Success', 'Event created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Event creation error:', error);
      Alert.alert('Error', error.message || 'Failed to create event. Please try again.');
    }
  };

  const handleImagePicker = () => {
    Alert.alert(
      'Add Event Photo',
      'Choose an option (Photo is optional)',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Choose from Library',
          onPress: pickImage,
        },
        {
          text: 'Remove Photo',
          style: 'destructive',
          onPress: () => {
            setImage('');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: colors.text }]}>Create Event</Text>

          <Text style={[styles.label, { color: colors.text }]}>Club *</Text>
          <TouchableOpacity 
            style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
            onPress={() => setShowClubPicker(true)}
          >
            <Text style={{ color: clubId ? colors.text : colors.mutedText }}>
              {clubs.find(c => c.id === clubId)?.name || 'Select a club'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.mutedText} />
          </TouchableOpacity>
          
          {/* Club Picker Modal */}
          {showClubPicker && (
            <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
              <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Select Club</Text>
                  <TouchableOpacity onPress={() => setShowClubPicker(false)}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalList}>
                  {clubs.length === 0 ? (
                    <View style={styles.emptyClubs}>
                      <Text style={[styles.emptyText, { color: colors.mutedText }]}>
                        No clubs available. Please create a club first.
                      </Text>
                    </View>
                  ) : (
                    clubs.map((club) => (
                      <TouchableOpacity
                        key={club.id}
                        style={[
                          styles.clubOption,
                          { 
                            backgroundColor: clubId === club.id ? colors.primary + '20' : 'transparent',
                            borderBottomColor: colors.border 
                          }
                        ]}
                        onPress={() => {
                          setClubId(club.id);
                          setShowClubPicker(false);
                        }}
                      >
                        <View style={styles.clubOptionContent}>
                          <Ionicons 
                            name="business" 
                            size={24} 
                            color={clubId === club.id ? colors.primary : colors.mutedText} 
                          />
                          <View style={styles.clubOptionText}>
                            <Text style={[styles.clubOptionName, { color: colors.text }]}>
                              {club.name}
                            </Text>
                            {club.description && (
                              <Text 
                                style={[styles.clubOptionDesc, { color: colors.mutedText }]}
                                numberOfLines={1}
                              >
                                {club.description}
                              </Text>
                            )}
                          </View>
                        </View>
                        {clubId === club.id && (
                          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            </View>
          )}

          <Text style={[styles.label, { color: colors.text }]}>Title</Text>
          <TextInput style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]} value={title} onChangeText={setTitle} placeholder="Event title" placeholderTextColor={colors.mutedText} />

          <Text style={[styles.label, { color: colors.text }]}>Description</Text>
          <TextInput style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text, height: 100 }]} multiline value={description} onChangeText={setDescription} placeholder="Event description" placeholderTextColor={colors.mutedText} />

          <Text style={[styles.label, { color: colors.text }]}>Date (YYYY-MM-DD)</Text>
          <TextInput style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]} value={date} onChangeText={setDate} placeholder="2025-12-15" placeholderTextColor={colors.mutedText} />

          <Text style={[styles.label, { color: colors.text }]}>Start Time (e.g., 6:00 PM)</Text>
          <TextInput style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]} value={time} onChangeText={setTime} placeholder="6:00 PM" placeholderTextColor={colors.mutedText} />

          <Text style={[styles.label, { color: colors.text }]}>End Time (e.g., 8:00 PM)</Text>
          <TextInput style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]} value={endTime} onChangeText={setEndTime} placeholder="8:00 PM" placeholderTextColor={colors.mutedText} />

          {/* Event Type Selector */}
          <Text style={[styles.label, { color: colors.text }]}>Event Type *</Text>
          <View style={styles.eventTypeContainer}>
            <TouchableOpacity
              style={[
                styles.eventTypeButton,
                {
                  backgroundColor: eventType === 'Online' ? colors.primary : colors.card,
                  borderColor: colors.border,
                }
              ]}
              onPress={() => {
                setEventType('Online');
                setLocation('Online');
                setCategory('Online');
              }}
            >
              <Ionicons 
                name="videocam" 
                size={20} 
                color={eventType === 'Online' ? '#FFFFFF' : colors.text} 
              />
              <Text style={[
                styles.eventTypeText,
                { color: eventType === 'Online' ? '#FFFFFF' : colors.text }
              ]}>
                Online
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.eventTypeButton,
                {
                  backgroundColor: eventType === 'Offline' ? colors.primary : colors.card,
                  borderColor: colors.border,
                }
              ]}
              onPress={() => {
                setEventType('Offline');
                setLocation('');
                setCategory('Offline');
              }}
            >
              <Ionicons 
                name="location" 
                size={20} 
                color={eventType === 'Offline' ? '#FFFFFF' : colors.text} 
              />
              <Text style={[
                styles.eventTypeText,
                { color: eventType === 'Offline' ? '#FFFFFF' : colors.text }
              ]}>
                Offline
              </Text>
            </TouchableOpacity>
          </View>

          {/* Location or Meeting Platform */}
          {eventType === 'Online' ? (
            <>
              <Text style={[styles.label, { color: colors.text }]}>Meeting Platform *</Text>
              <TouchableOpacity
                style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                onPress={() => setShowPlatformPicker(true)}
              >
                <Text style={{ color: colors.text }}>
                  {meetingPlatform}
                </Text>
                <Ionicons name="chevron-down" size={18} color={colors.mutedText} />
              </TouchableOpacity>
              
              {/* Platform Picker Modal */}
              {showPlatformPicker && (
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                  <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                      <Text style={[styles.modalTitle, { color: colors.text }]}>Select Platform</Text>
                      <TouchableOpacity onPress={() => setShowPlatformPicker(false)}>
                        <Ionicons name="close" size={24} color={colors.text} />
                      </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalList}>
                      {(['Zoom', 'Google Meet', 'YouTube', 'Other'] as const).map((platform) => (
                        <TouchableOpacity
                          key={platform}
                          style={[
                            styles.clubOption,
                            {
                              backgroundColor: meetingPlatform === platform ? colors.primary + '20' : 'transparent',
                              borderBottomColor: colors.border
                            }
                          ]}
                          onPress={() => {
                            setMeetingPlatform(platform);
                            setShowPlatformPicker(false);
                          }}
                        >
                          <View style={styles.clubOptionContent}>
                            <Ionicons
                              name={platform === 'Zoom' ? 'videocam' : platform === 'Google Meet' ? 'logo-google' : platform === 'YouTube' ? 'logo-youtube' : 'globe'}
                              size={24}
                              color={meetingPlatform === platform ? colors.primary : colors.mutedText}
                            />
                            <Text style={[
                              styles.clubOptionName,
                              { color: colors.text }
                            ]}>
                              {platform}
                            </Text>
                          </View>
                          {meetingPlatform === platform && (
                            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              )}
              <Text style={[styles.helperText, { color: colors.mutedText }]}>Location will be set to "Online"</Text>
            </>
          ) : (
            <>
              <Text style={[styles.label, { color: colors.text }]}>Location *</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]}
                value={location}
                onChangeText={setLocation}
                placeholder="Hall 101"
                placeholderTextColor={colors.mutedText}
              />
            </>
          )}

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
            <Text style={styles.buttonText}>Create Event</Text>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '90%',
    maxHeight: '70%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalList: {
    maxHeight: 400,
  },
  clubOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  clubOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clubOptionText: {
    marginLeft: 12,
    flex: 1,
  },
  clubOptionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  clubOptionDesc: {
    fontSize: 14,
  },
  emptyClubs: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  eventTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  eventTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  eventTypeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    marginTop: -10,
    marginBottom: 14,
    marginLeft: 4,
  },
});
