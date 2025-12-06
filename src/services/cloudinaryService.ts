import { 
  CLOUDINARY_CLOUD_NAME, 
  CLOUDINARY_API_KEY, 
  CLOUDINARY_API_SECRET,
  CLOUDINARY_PROFILE_PRESET,
  CLOUDINARY_EVENT_PRESET
} from '../constants/creds';
import * as ImagePicker from 'expo-image-picker';
import { MediaTypeOptions } from 'expo-image-picker';
import { Alert, Platform } from 'react-native';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

export interface UploadResult {
  url: string;
  publicId: string;
  secureUrl: string;
}

/**
 * Upload image to Cloudinary from local URI
 * Uses the provided pattern with FormData and upload preset
 */
export const uploadImageToCloudinary = async (
  imageUri: string,
  uploadPreset?: string,
  folder: string = 'campus-connect'
): Promise<UploadResult> => {
  try {
    // Determine upload preset based on folder if not provided
    const preset = uploadPreset || getUploadPreset(folder) || CLOUDINARY_EVENT_PRESET;
    
    const data = new FormData();
    
    // Extract filename from URI - accept all image types
    const filename = imageUri.split('/').pop() || 'upload.jpg';
    // Try to detect image type from extension, but default to generic image type
    // This allows all image formats (JPEG, PNG, WebP, HEIC, GIF, etc.)
    const match = /\.(\w+)$/i.exec(filename);
    let imageType = 'image/jpeg'; // Default fallback
    if (match) {
      const ext = match[1].toLowerCase();
      // Map common extensions to MIME types, but accept any image type
      const typeMap: { [key: string]: string } = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'heic': 'image/heic',
        'heif': 'image/heif',
        'bmp': 'image/bmp',
        'tiff': 'image/tiff',
        'tif': 'image/tiff',
      };
      imageType = typeMap[ext] || `image/${ext}`; // Use extension as fallback for unknown types
    }

    // @ts-ignore - FormData typing issue for React Native
    data.append('file', {
      uri: imageUri,
      type: imageType,
      name: filename,
    });
    data.append('upload_preset', preset);
    data.append('cloud_name', CLOUDINARY_CLOUD_NAME);
    
    // Add folder if provided
    if (folder) {
      data.append('folder', folder);
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to upload image');
    }

    const result = await response.json();
    console.log('Cloudinary upload result:', result);
    
    return {
      url: result.url,
      publicId: result.public_id,
      secureUrl: result.secure_url,
    };
  } catch (error: any) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error(error.message || 'Failed to upload image to Cloudinary');
  }
};

/**
 * Get the appropriate upload preset based on folder type
 */
const getUploadPreset = (folder: string): string | null => {
  // Automatically determine preset based on folder
  if (folder.includes('profile') || folder === 'profile-pictures') {
    return CLOUDINARY_PROFILE_PRESET;
  } else if (folder.includes('event') || folder === 'event-photos') {
    return CLOUDINARY_EVENT_PRESET;
  }
  // Default fallback (can be changed to a default preset if needed)
  return null;
};

/**
 * Upload image using unsigned upload preset (for React Native)
 * Automatically selects the correct preset based on folder type
 */
export const uploadImageUnsigned = async (
  imageUri: string,
  uploadPreset: string | null = null,
  folder: string = 'campus-connect'
): Promise<UploadResult> => {
  // Auto-detect preset if not provided
  if (!uploadPreset) {
    uploadPreset = getUploadPreset(folder);
  }
  try {
    const filename = imageUri.split('/').pop() || 'image.jpg';
    // Accept all image types - detect from extension or use generic type
    const match = /\.(\w+)$/i.exec(filename);
    let type = 'image/jpeg'; // Default fallback
    if (match) {
      const ext = match[1].toLowerCase();
      // Map common extensions, but accept any image type
      const typeMap: { [key: string]: string } = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'heic': 'image/heic',
        'heif': 'image/heif',
        'bmp': 'image/bmp',
        'tiff': 'image/tiff',
        'tif': 'image/tiff',
      };
      type = typeMap[ext] || `image/${ext}`; // Use extension as fallback for unknown types
    }

    // Generate timestamp for signature
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Create signature for signed upload (more secure than unsigned preset)
    const signatureString = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    // Note: In production, this should be done server-side. For now, we'll use a simpler approach
    
    const formData = new FormData();
    
    // @ts-ignore - FormData typing issue in React Native
    formData.append('file', {
      uri: imageUri,
      type: type,
      name: filename,
    } as any);
    
    // Use unsigned upload preset (required for client-side uploads)
    if (uploadPreset) {
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', folder);
    } else {
      // Fallback: Try using a default preset name based on folder
      const fallbackPreset = folder.includes('profile') ? 'ml_default' : 'ml_default';
      console.warn(`No preset specified, trying fallback: ${fallbackPreset}`);
      formData.append('upload_preset', fallbackPreset);
      formData.append('folder', folder);
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let React Native set it with boundary
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error?.message || 'Failed to upload image';
      
      // If preset error, provide helpful message with instructions
      if (errorMessage.includes('preset') || errorMessage.includes('Upload preset') || errorMessage.includes('Invalid preset')) {
        const presetName = uploadPreset || 'the appropriate preset';
        const presetType = folder.includes('profile') ? 'profile picture' : 'event photo';
        throw new Error(
          `Upload preset "${presetName}" not found for ${presetType} upload. ` +
          `Please create an unsigned upload preset in Cloudinary: ` +
          `1. Go to Cloudinary Dashboard → Settings → Upload → Upload presets ` +
          `2. Create preset named "${presetName}" (or update preset name in creds.tsx) ` +
          `3. Set signing mode to "Unsigned" ` +
          `4. Save and try again.`
        );
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    return {
      url: data.url,
      publicId: data.public_id,
      secureUrl: data.secure_url,
    };
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    throw new Error(error.message || 'Failed to upload image to Cloudinary');
  }
};

/**
 * Request media library permissions with user-friendly alerts
 */
const requestMediaLibraryPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
    
    if (existingStatus === 'granted') {
      return true;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status === 'granted') {
      return true;
    }

    Alert.alert(
      'Permission Required',
      'This app needs access to your photo library to select photos. Please enable it in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          },
        },
      ]
    );
    
    return false;
  } catch (error) {
    console.error('Permission request error:', error);
    return false;
  }
};

/**
 * Pick image from device and upload to Cloudinary
 * Uses the provided pattern with launchImageLibraryAsync
 */
export const pickAndUploadImage = async (
  folder: string = 'campus-connect',
  allowsEditing: boolean = true
): Promise<UploadResult | null> => {
  try {
    // Request permissions first
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
        return null;
      }
    }

    // Pick image from library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing,
      aspect: folder.includes('profile') ? [1, 1] : [4, 3],
      quality: 1,
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    const imageUri = result.assets[0].uri;
    
    // Validate image size (max 10MB)
    if (result.assets[0].fileSize && result.assets[0].fileSize > 10 * 1024 * 1024) {
      Alert.alert('Image Too Large', 'Please select an image smaller than 10MB.');
      return null;
    }
    
    // Upload to Cloudinary using the provided pattern
    const uploadResult = await uploadImageToCloudinary(imageUri, undefined, folder);
    return uploadResult;
  } catch (error: any) {
    console.error('Pick and upload error:', error);
    Alert.alert('Error', error.message || 'Failed to pick and upload image. Please try again.');
    throw error;
  }
};

/**
 * Request camera permissions with user-friendly alerts
 */
const requestCameraPermissions = async (): Promise<boolean> => {
  try {
    // Check current permission status
    const { status: existingStatus } = await ImagePicker.getCameraPermissionsAsync();
    
    if (existingStatus === 'granted') {
      return true;
    }

    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status === 'granted') {
      return true;
    }

    // Permission denied - show alert
    Alert.alert(
      'Permission Required',
      'This app needs access to your camera to take photos. Please enable it in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          },
        },
      ]
    );
    
    return false;
  } catch (error) {
    console.error('Permission request error:', error);
    return false;
  }
};

/**
 * Take photo with camera and upload to Cloudinary
 */
export const takePhotoAndUpload = async (
  folder: string = 'campus-connect',
  allowsEditing: boolean = true
): Promise<UploadResult | null> => {
  try {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) {
      throw new Error('Permission to access camera was denied. Please enable it in settings.');
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing,
      aspect: [4, 3],
      quality: 0.8,
      exif: false,
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    const imageUri = result.assets[0].uri;
    
    // Validate image size (max 10MB)
    if (result.assets[0].fileSize && result.assets[0].fileSize > 10 * 1024 * 1024) {
      Alert.alert('Image Too Large', 'Please select an image smaller than 10MB.');
      return null;
    }
    
    const uploadResult = await uploadImageUnsigned(imageUri, null, folder);
    return uploadResult;
  } catch (error: any) {
    console.error('Take photo and upload error:', error);
    const errorMessage = error.message || error.toString() || '';
    
    if (errorMessage.includes('simulator') || errorMessage.includes('not available') || errorMessage.includes('Camera')) {
      return new Promise((resolve) => {
        Alert.alert(
          'Camera Not Available',
          'Camera is not available. Would you like to choose a photo from your library instead?',
          [
            { 
              text: 'Cancel', 
              style: 'cancel',
              onPress: () => resolve(null)
            },
            {
              text: 'Use Library',
              onPress: async () => {
                try {
                  const result = await pickAndUploadImage(folder, allowsEditing);
                  resolve(result);
                } catch (libError: any) {
                  console.error('Library picker error:', libError);
                  Alert.alert('Error', libError.message || 'Failed to pick image from library');
                  resolve(null);
                }
              },
            },
          ]
        );
      });
    }
    
    Alert.alert('Error', errorMessage || 'Failed to take photo. Please try again.');
    throw error;
  }
};

/**
 * Delete image from Cloudinary
 */
export const deleteImageFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_id: publicId,
          api_key: CLOUDINARY_API_KEY,
          api_secret: CLOUDINARY_API_SECRET,
          timestamp: Math.floor(Date.now() / 1000),
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete image from Cloudinary');
    }
  } catch (error: any) {
    console.error('Delete image error:', error);
    throw error;
  }
};

