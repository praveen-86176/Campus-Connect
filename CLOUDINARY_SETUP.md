# Cloudinary Setup Instructions

## Configuration

The Cloudinary credentials have been configured in `src/constants/creds.tsx`:
- Cloud Name: `dkboqz2t9`
- API Key: `153467722819223`
- API Secret: `ZnrDtMk4-apXrHBqmyr7wFIM-_c`

## Important: Upload Preset Setup (REQUIRED)

**⚠️ The app will show "Upload preset not found" error if this is not configured!**

For client-side uploads to work, you **MUST** create an **unsigned upload preset** in your Cloudinary dashboard:

### Step-by-Step Instructions:

1. **Go to Cloudinary Dashboard**
   - Visit: https://cloudinary.com/console
   - Login with your Cloudinary account

2. **Navigate to Upload Settings**
   - Click **Settings** (gear icon) in the top menu
   - Click **Upload** in the left sidebar
   - Click **Upload presets** tab

3. **Create New Upload Preset**
   - Click **Add upload preset** button
   - Configure the following:
     - **Preset name**: `ml_default` (must match exactly)
     - **Signing mode**: Select **Unsigned** (this is critical!)
     - **Folder**: `campus-connect` (optional, but recommended for organization)
     - **Allowed formats**: Select `jpg, png, gif, webp`
     - **Max file size**: Set to `10` MB (or your preferred limit)
     - **Use filename**: Enable if you want to keep original filenames
   - Click **Save** button

4. **Verify Preset**
   - Make sure the preset name is exactly `ml_default`
   - Make sure "Signing mode" shows "Unsigned"
   - The preset should appear in your list of upload presets

### Why This Is Required:

- Unsigned uploads allow the mobile app to upload images without server-side authentication
- The preset name `ml_default` is hardcoded in the app
- Without this preset, all image uploads will fail with "Upload preset not found" error

## Alternative: Use Signed Uploads (Server-Side)

For better security, you can create a server-side endpoint that handles signed uploads using the API secret. This keeps your API secret secure.

## Usage

The app now supports:
- ✅ Profile picture uploads (Admin & Student)
- ✅ Event photo uploads (Admin only)
- ✅ Image picker from library
- ✅ Camera capture

All images are uploaded to Cloudinary and stored in organized folders:
- Profile pictures: `profile-pictures/`
- Event photos: `event-photos/`

## Testing

To test the upload functionality:
1. Ensure the upload preset is created in Cloudinary
2. Try uploading a profile picture from Profile screen
3. Try adding a photo when creating/editing an event

If uploads fail, check:
- Upload preset exists and is set to "Unsigned"
- API credentials are correct
- Network connectivity

