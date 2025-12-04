# Cloudinary Preset Names Configuration

## Current Preset Names in Code

The app is configured to use these preset names (in `src/constants/creds.tsx`):

```typescript
export const CLOUDINARY_PROFILE_PRESET = 'profile_pic_preset';
export const CLOUDINARY_EVENT_PRESET = 'event_preset';
```

## ⚠️ Important: Update Preset Names

**You must update the preset names in `src/constants/creds.tsx` to match the exact names you created in Cloudinary Dashboard.**

### Steps to Fix:

1. **Check Your Cloudinary Preset Names:**
   - Go to [Cloudinary Dashboard](https://cloudinary.com/console)
   - Navigate to **Settings** → **Upload** → **Upload presets**
   - Note the exact preset names you created (they are case-sensitive!)

2. **Update `src/constants/creds.tsx`:**
   ```typescript
   // Replace with your actual preset names
   export const CLOUDINARY_PROFILE_PRESET = 'your_actual_profile_preset_name';
   export const CLOUDINARY_EVENT_PRESET = 'your_actual_event_preset_name';
   ```

3. **Common Preset Name Examples:**
   - `profile_pic_preset` or `profile_pic` or `profile_preset`
   - `event_preset` or `event_photos` or `events_preset`
   - `ml_default` (if using a single default preset)

## Preset Requirements

Both presets must be:
- ✅ **Unsigned** (Signing mode: Unsigned)
- ✅ **Active** (enabled in Cloudinary)
- ✅ **Name matches exactly** (case-sensitive, no extra spaces)

## Testing

After updating the preset names:
1. Restart the app
2. Try uploading a profile picture
3. Try uploading an event photo
4. Both should work without errors

## Fallback Behavior

If a preset is not found, the app will:
- Show a helpful error message with instructions
- Allow event creation to continue without a photo (photo is optional)
- Provide clear instructions on how to create the preset

