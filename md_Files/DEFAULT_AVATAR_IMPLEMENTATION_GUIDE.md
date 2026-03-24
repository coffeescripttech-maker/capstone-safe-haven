# Default Avatar Implementation Guide 🎭

## Overview

This guide shows you how to add a default avatar image to your SafeHaven mobile app. The avatar will appear in:
- HomeScreen welcome section
- Profile screen header
- Navigation header (optional)

## Step 1: Download and Add Avatar Image

### Download the Avatar
1. Go to: https://img.freepik.com/free-psd/3d-rendering-avatar_23-2150833560.jpg
2. Download the image
3. Save it as `default-avatar.png` or `default-avatar.jpg`

### Add to Assets Folder
```
MOBILE_APP/mobile/assets/
├── logo.png
├── default-avatar.png  ← Add here
└── ...
```

**Recommended Image Specs:**
- Format: PNG (with transparency) or JPG
- Size: 512x512px or 1024x1024px
- File size: < 500KB (optimize if needed)

## Step 2: Create Avatar Component

Create a reusable Avatar component:

**File:** `MOBILE_APP/mobile/src/components/common/Avatar.tsx`

```typescript
// Avatar Component - Displays user avatar with fallback

import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

interface AvatarProps {
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  firstName,
  lastName,
  imageUrl,
  size = 'medium',
  style,
}) => {
  const sizeStyles = {
    small: { width: 40, height: 40, fontSize: 16 },
    medium: { width: 60, height: 60, fontSize: 24 },
    large: { width: 80, height: 80, fontSize: 32 },
    xlarge: { width: 120, height: 120, fontSize: 48 },
  };

  const { width, height, fontSize } = sizeStyles[size];

  // Get initials for fallback
  const getInitials = () => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return `${first}${last}`.toUpperCase();
  };

  return (
    <View style={[styles.container, { width, height }, style]}>
      {imageUrl ? (
        // User uploaded avatar
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, { width, height }]}
          resizeMode="cover"
        />
      ) : (
        // Default avatar with initials overlay
        <>
          <Image
            source={require('../../../assets/default-avatar.png')}
            style={[styles.image, { width, height }]}
            resizeMode="cover"
          />
          {(firstName || lastName) && (
            <View style={styles.initialsOverlay}>
              <Text style={[styles.initials, { fontSize }]}>
                {getInitials()}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 999, // Fully circular
    overflow: 'hidden',
    backgroundColor: COLORS.border,
    position: 'relative',
  },
  image: {
    borderRadius: 999,
  },
  initialsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.bold,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
```

## Step 3: Update HomeScreen

Update the welcome section in HomeScreen to use the Avatar component:

**File:** `MOBILE_APP/mobile/src/screens/home/HomeScreen.tsx`

```typescript
// Add import at top
import { Avatar } from '../../components/common/Avatar';

// Replace the welcomeInWidget section (around line 270)
<View style={styles.welcomeInWidget}>
  <Avatar
    firstName={user?.firstName}
    lastName={user?.lastName}
    size="medium"
    style={styles.welcomeAvatar}
  />
  <View style={styles.welcomeTextSmall}>
    <Text style={styles.greetingSmall}>Hello, {user?.firstName}! 👋</Text>
    <View style={styles.subtitleRowSmall}>
      <Sparkles color={COLORS.primary} size={14} strokeWidth={2} />
      <Text style={styles.subtitleSmall}>Stay safe and informed</Text>
    </View>
  </View>
</View>

// Add to styles
welcomeAvatar: {
  marginRight: SPACING.sm,
  borderWidth: 2,
  borderColor: COLORS.primary,
},
```

## Step 4: Update ProfileScreen

Update the profile header to use the Avatar component:

**File:** `MOBILE_APP/mobile/src/screens/profile/ProfileScreen.tsx`

```typescript
// Add import at top
import { Avatar } from '../../components/common/Avatar';

// Replace the avatar section (around line 48)
<View style={styles.header}>
  <Avatar
    firstName={user?.firstName}
    lastName={user?.lastName}
    size="xlarge"
    style={styles.profileAvatar}
  />
  <Text style={styles.name}>
    {user?.firstName} {user?.lastName}
  </Text>
  {/* ... rest of header ... */}
</View>

// Update styles - remove old avatar styles, add:
profileAvatar: {
  marginBottom: SPACING.md,
  borderWidth: 4,
  borderColor: COLORS.primary,
  shadowColor: COLORS.shadow,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 6,
},
```

## Step 5: Alternative - Use Icon Instead of Image

If you prefer to use an icon instead of downloading an image:

```typescript
import { User } from 'lucide-react-native';

// In Avatar component, replace default image with icon:
<View style={[styles.iconContainer, { width, height }]}>
  <User 
    color={COLORS.primary} 
    size={width * 0.6} 
    strokeWidth={2} 
  />
</View>

// Add style:
iconContainer: {
  backgroundColor: '#F0F9FF',
  alignItems: 'center',
  justifyContent: 'center',
},
```

## Step 6: Add Avatar Upload Feature (Future Enhancement)

For allowing users to upload their own avatar:

```typescript
// In EditProfileScreen.tsx
import * as ImagePicker from 'expo-image-picker';

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled) {
    // Upload to backend
    const formData = new FormData();
    formData.append('avatar', {
      uri: result.assets[0].uri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);

    await api.post('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
};
```

## Visual Examples

### HomeScreen Welcome Section
```
┌─────────────────────────────┐
│  ╭───╮                      │
│  │ 👤 │  Hello, Juan! 👋    │
│  ╰───╯  Stay safe...        │
└─────────────────────────────┘
```

### Profile Screen Header
```
┌─────────────────────────────┐
│                             │
│         ╭─────╮             │
│         │     │             │
│         │ 👤  │             │
│         │     │             │
│         ╰─────╯             │
│                             │
│      Juan Dela Cruz         │
│    juan@example.com         │
│       [Citizen]             │
└─────────────────────────────┘
```

## Testing Checklist

- [ ] Avatar image added to assets folder
- [ ] Avatar component created
- [ ] HomeScreen displays avatar in welcome section
- [ ] ProfileScreen displays avatar in header
- [ ] Avatar is circular
- [ ] Avatar has proper border and shadow
- [ ] Initials overlay works (if no custom image)
- [ ] Avatar sizes work correctly (small, medium, large, xlarge)
- [ ] Avatar looks good on different screen sizes

## File Structure

```
MOBILE_APP/mobile/
├── assets/
│   ├── logo.png
│   └── default-avatar.png          ← New
├── src/
│   ├── components/
│   │   └── common/
│   │       └── Avatar.tsx          ← New
│   └── screens/
│       ├── home/
│       │   └── HomeScreen.tsx      ← Updated
│       └── profile/
│           └── ProfileScreen.tsx   ← Updated
```

## Customization Options

### Different Avatar Styles

1. **Circular with Border**
```typescript
style={{
  borderWidth: 3,
  borderColor: COLORS.primary,
}}
```

2. **With Shadow**
```typescript
style={{
  shadowColor: COLORS.shadow,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
  elevation: 6,
}}
```

3. **Rounded Square**
```typescript
// In Avatar component styles
container: {
  borderRadius: 16, // Instead of 999
}
```

## Troubleshooting

### Image Not Showing
- Check file path: `require('../../../assets/default-avatar.png')`
- Verify image exists in assets folder
- Try restarting Metro bundler: `npm start -- --reset-cache`

### Image Too Large
- Optimize image size (< 500KB recommended)
- Use online tools like TinyPNG or ImageOptim
- Consider using WebP format for better compression

### Border Not Circular
- Ensure `borderRadius: 999` or `borderRadius: width / 2`
- Check that width and height are equal
- Verify `overflow: 'hidden'` is set

## Next Steps

1. Download the avatar image from the provided URL
2. Add it to your assets folder
3. Create the Avatar component
4. Update HomeScreen and ProfileScreen
5. Test on device/emulator
6. (Optional) Add avatar upload feature

## Status: READY TO IMPLEMENT ✅

Follow the steps above to add a beautiful default avatar to your SafeHaven mobile app!
