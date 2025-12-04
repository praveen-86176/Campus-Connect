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
 */
export const uploadImageToCloudinary = async (
  imageUri: string,
  folder: string = 'campus-connect',
  resourceType: 'image' | 'auto' = 'image'
): Promise<UploadResult> => {
  try {
    // Convert local URI to base64 or use direct upload
    // For React Native, we'll use the upload API with the URI
    const formData = new FormData();
    
    // Extract filename from URI
    const filename = imageUri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // @ts-ignore - FormData typing issue
    formData.append('file', {
      uri: imageUri,
      type,
      name: filename,
    });
    formData.append('upload_preset', 'ml_default'); // You may need to create this in Cloudinary
    formData.append('folder', folder);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to upload image');
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
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // Generate timestamp for signature
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Create signature for signed upload (more secure than unsigned preset)
    const signatureString = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    // Note: In production, this should be done server-side. For now, we'll use a simpler approach
    
    const formData = new FormData();
    
    // @ts-ignore - FormData typing issue in React Native
    formData.append('file', {
      uri: imageUri,
      type,
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
    // Check current permission status
    const { status: existingStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
    
    if (existingStatus === 'granted') {
      return true;
    }

    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status === 'granted') {
      return true;
    }

    // Permission denied - show alert
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
 */
export const pickAndUploadImage = async (
  folder: string = 'campus-connect',
  allowsEditing: boolean = true
): Promise<UploadResult | null> => {
  try {
    // Request permissions with user-friendly handling
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) {
      throw new Error('Permission to access media library was denied. Please enable it in settings.');
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    const imageUri = result.assets[0].uri;
    
    // Upload to Cloudinary - automatically uses correct preset based on folder
    const uploadResult = await uploadImageUnsigned(imageUri, null, folder);
    return uploadResult;
  } catch (error: any) {
    console.error('Pick and upload error:', error);
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
    // Request permissions with user-friendly handling
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) {
      throw new Error('Permission to access camera was denied. Please enable it in settings.');
    }

    // Take photo (will handle simulator errors gracefully)
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    const imageUri = result.assets[0].uri;
    
    // Upload to Cloudinary - automatically uses correct preset based on folder
    const uploadResult = await uploadImageUnsigned(imageUri, null, folder);
    return uploadResult;
  } catch (error: any) {
    console.error('Take photo and upload error:', error);
    // Handle simulator-specific errors gracefully
    const errorMessage = error.message || error.toString() || '';
    if (errorMessage.includes('simulator') || errorMessage.includes('not available') || errorMessage.includes('Camera')) {
      Alert.alert(
        'Camera Not Available',
        'Camera is not available on simulators. Please use "Choose from Library" instead, or test on a physical device.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Use Library',
            onPress: async () => {
              try {
                // Automatically fall back to library picker
                const result = await pickAndUploadImage(folder, allowsEditing);
                return result;
              } catch (libError) {
                console.error('Library picker error:', libError);
              }
            },
          },
        ]
      );
      return null; // Return null instead of throwing to allow graceful fallback
    }
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

