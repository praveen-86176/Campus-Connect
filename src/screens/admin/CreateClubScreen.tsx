import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useCampusData } from '../../context/CampusDataContext';
import { Club } from '../../types';
import { adminService } from '../../services/adminService';
import { pickAndUploadImage, takePhotoAndUpload } from '../../services/cloudinaryService';

type CreateClubNavProp = NativeStackNavigationProp<any>;

const categories = ['Tech', 'Cultural', 'Sports', 'Arts', 'Academic', 'Social', 'Other'];

export const CreateClubScreen: React.FC = () => {
  const navigation = useNavigation<CreateClubNavProp>();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const { user } = useAuth();
  const { refreshData } = useCampusData();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Tech');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [rules, setRules] = useState('');
  const [logo, setLogo] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!name || !name.trim()) {
      Alert.alert('Missing Info', 'Please enter a club name.');
      return;
    }
    if (!description || !description.trim()) {
      Alert.alert('Missing Info', 'Please enter a club description.');
      return;
    }
    if (!category) {
      Alert.alert('Missing Info', 'Please select a category.');
      return;
    }
    if (!user?.uid) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    setLoading(true);
    try {
      const now = new Date();
      const newClub: Club = {
        id: `club_${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        logo: logo && logo.trim() !== '' ? logo : '', // Use uploaded logo if available
        category: category,
        contactPerson: contactPerson.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        meetingLocation: meetingLocation.trim() || undefined,
        meetingTime: meetingTime.trim() || undefined,
        rules: rules.trim() || undefined,
        adminId: user.uid,
        memberCount: 0,
        isVerified: true,
        createdAt: now,
        updatedAt: now,
      };

      await adminService.createClub(newClub);
      await refreshData();
      
      Alert.alert('Success', 'Club created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Club creation error:', error);
      Alert.alert('Error', error.message || 'Failed to create club. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Create Club</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Club Logo/Photo */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Club Photo</Text>
          <Text style={[styles.labelHint, { color: colors.mutedText }]}>
            Optional - Add a photo or logo for your club
          </Text>
          
          {logo ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: logo }} style={styles.imagePreview} />
              <TouchableOpacity
                style={[styles.removeImageButton, { backgroundColor: '#EF4444' }]}
                onPress={() => setLogo('')}
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imageUploadContainer}>
              <TouchableOpacity
                style={[styles.imageUploadButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={async () => {
                  Alert.alert(
                    'Add Club Photo',
                    'Choose an option',
                    [
                      {
                        text: 'Take Photo',
                        onPress: async () => {
                          try {
                            setUploadingImage(true);
                            const result = await takePhotoAndUpload('event-photos', true);
                            if (result) {
                              setLogo(result.secureUrl);
                            }
                          } catch (error: any) {
                            console.error('Photo upload error:', error);
                            // Image upload is optional, so don't block club creation
                            if (error.message && !error.message.includes('preset not found')) {
                              Alert.alert('Upload Error', 'Failed to upload photo. You can still create the club without a photo.');
                            }
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
                              setLogo(result.secureUrl);
                            }
                          } catch (error: any) {
                            console.error('Pick and upload error:', error);
                            // Image upload is optional, so don't block club creation
                            if (error.message && !error.message.includes('preset not found')) {
                              Alert.alert('Upload Error', 'Failed to upload photo. You can still create the club without a photo.');
                            }
                          } finally {
                            setUploadingImage(false);
                          }
                        },
                      },
                      { text: 'Cancel', style: 'cancel' },
                    ]
                  );
                }}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={32} color={colors.primary} />
                    <Text style={[styles.imageUploadText, { color: colors.text }]}>
                      Add Club Photo
                    </Text>
                    <Text style={[styles.imageUploadHint, { color: colors.mutedText }]}>
                      Tap to take a photo or choose from library
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Club Name */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Club Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Enter club name"
            placeholderTextColor={colors.mutedText}
            value={name}
            onChangeText={setName}
            maxLength={100}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Description *</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Describe the club's purpose and activities"
            placeholderTextColor={colors.mutedText}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={[styles.charCount, { color: colors.mutedText }]}>
            {description.length}/500
          </Text>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Category *</Text>
          <TouchableOpacity
            style={[styles.pickerButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          >
            <Text style={[styles.pickerText, { color: colors.text }]}>{category}</Text>
            <Ionicons name={showCategoryPicker ? "chevron-up" : "chevron-down"} size={20} color={colors.text} />
          </TouchableOpacity>
          {showCategoryPicker && (
            <View style={[styles.pickerOptions, { backgroundColor: colors.card }]}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.pickerOption,
                    { backgroundColor: category === cat ? colors.primary + '20' : 'transparent' }
                  ]}
                  onPress={() => {
                    setCategory(cat);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    { color: category === cat ? colors.primary : colors.text }
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Contact Person */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Contact Person</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Name of contact person (optional)"
            placeholderTextColor={colors.mutedText}
            value={contactPerson}
            onChangeText={setContactPerson}
            maxLength={100}
          />
        </View>

        {/* Contact Email */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Contact Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="contact@example.com (optional)"
            placeholderTextColor={colors.mutedText}
            value={contactEmail}
            onChangeText={setContactEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            maxLength={100}
          />
        </View>

        {/* Meeting Location */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Meeting Location</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Where does the club meet? (optional)"
            placeholderTextColor={colors.mutedText}
            value={meetingLocation}
            onChangeText={setMeetingLocation}
            maxLength={200}
          />
        </View>

        {/* Meeting Time */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Meeting Time</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="e.g., Every Monday 6:00 PM (optional)"
            placeholderTextColor={colors.mutedText}
            value={meetingTime}
            onChangeText={setMeetingTime}
            maxLength={100}
          />
        </View>

        {/* Rules */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Club Rules</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Club rules and guidelines (optional)"
            placeholderTextColor={colors.mutedText}
            value={rules}
            onChangeText={setRules}
            multiline
            numberOfLines={3}
            maxLength={1000}
          />
          <Text style={[styles.charCount, { color: colors.mutedText }]}>
            {rules.length}/1000
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Create Club</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  labelHint: {
    fontSize: 12,
    marginBottom: 12,
  },
  imageUploadContainer: {
    marginBottom: 8,
  },
  imageUploadButton: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    minHeight: 150,
  },
  imageUploadText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  imageUploadHint: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
  },
  textArea: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  pickerText: {
    fontSize: 15,
  },
  pickerOptions: {
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pickerOptionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
