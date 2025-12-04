# Cloudinary Upload Presets Configuration

## Overview

The app now uses **separate upload presets** for different types of images:
- **Profile Pictures**: Uses `profile_pic_preset`
- **Event Photos**: Uses `event_preset`

## Preset Configuration

### In the App (`src/constants/creds.tsx`)

The preset names are configured here:
```typescript
export const CLOUDINARY_PROFILE_PRESET = 'profile_pic_preset';
export const CLOUDINARY_EVENT_PRESET = 'event_preset';
```

**⚠️ Important**: Update these values to match the exact preset names you created in Cloudinary!

### How It Works

The app automatically selects the correct preset based on the folder:
- `profile-pictures` folder → Uses `CLOUDINARY_PROFILE_PRESET`
- `event-photos` folder → Uses `CLOUDINARY_EVENT_PRESET`

## Setting Up Presets in Cloudinary

### 1. Profile Picture Preset

1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Navigate to **Settings** → **Upload** → **Upload presets**
3. Click **Add upload preset**
4. Configure:
   - **Preset name**: `profile_pic_preset` (must match exactly)
   - **Signing mode**: **Unsigned**
   - **Folder**: `profile-pictures` (optional)
   - **Allowed formats**: `jpg, png, gif, webp`
   - **Max file size**: `5` MB (recommended for profile pics)
   - **Transformation**: Optional - you can add automatic cropping/resizing
5. Click **Save**

### 2. Event Photo Preset

1. In the same **Upload presets** section
2. Click **Add upload preset** again
3. Configure:
   - **Preset name**: `event_preset` (must match exactly)
   - **Signing mode**: **Unsigned**
   - **Folder**: `event-photos` (optional)
   - **Allowed formats**: `jpg, png, gif, webp`
   - **Max file size**: `10` MB (recommended for event photos)
   - **Transformation**: Optional - you can add automatic optimization
4. Click **Save**

## Verification

After creating the presets:

1. **Check preset names match exactly**:
   - Profile preset: `profile_pic_preset`
   - Event preset: `event_preset`

2. **Verify both are set to "Unsigned"**:
   - This is required for client-side uploads

3. **Test in the app**:
   - Upload a profile picture → Should use `profile_pic_preset`
   - Upload an event photo → Should use `event_preset`

## Customization

If you want to use different preset names:

1. Update the preset names in Cloudinary Dashboard
2. Update `src/constants/creds.tsx`:
   ```typescript
   export const CLOUDINARY_PROFILE_PRESET = 'your_profile_preset_name';
   export const CLOUDINARY_EVENT_PRESET = 'your_event_preset_name';
   ```

## Troubleshooting

### Error: "Upload preset not found"

**Solution**: 
- Verify the preset name in Cloudinary matches exactly (case-sensitive)
- Check that the preset is set to "Unsigned"
- Ensure the preset is saved and active

### Error: "No upload preset configured"

**Solution**:
- Make sure both presets are created in Cloudinary
- Verify the preset names in `creds.tsx` match Cloudinary exactly
- Check that the folder names contain "profile" or "event" keywords

## Current Implementation

The app automatically:
- ✅ Detects upload type based on folder name
- ✅ Uses the correct preset automatically
- ✅ Provides helpful error messages if presets are missing
- ✅ Organizes uploads into proper folders

No code changes needed in screens - everything works automatically! 🎉

