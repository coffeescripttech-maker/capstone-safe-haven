# 📝 Mobile App Profile Update Analysis

## Summary

**Question:** Does the Edit Profile page update the `user_profiles` table with address fields (street, barangay, city, province)? Are latitude and longitude automatically inserted?

**Answer:** 
- ✅ **YES** - Address fields ARE updated in `user_profiles` table
- ❌ **NO** - Latitude and longitude are NOT automatically inserted

---

## Current Implementation

### Mobile App (EditProfileScreen.tsx)

The edit profile screen collects these fields:

```typescript
const [formData, setFormData] = useState({
  firstName: user?.firstName || '',
  lastName: user?.lastName || '',
  phone: user?.phone || '',
  address: profile?.address || '',        // ✅ Street address
  city: profile?.city || '',              // ✅ City
  province: profile?.province || '',      // ✅ Province
  barangay: profile?.barangay || '',      // ✅ Barangay
  bloodType: profile?.bloodType || '',
  emergencyContactName: profile?.emergencyContactName || '',
  emergencyContactPhone: profile?.emergencyContactPhone || '',
  medicalConditions: profile?.medicalConditions || '',
});
```

**API Call:**
```typescript
await api.put('/auth/profile', formData);
```

---

### Backend (auth.service.ts)

The `updateProfile` method updates TWO tables:

#### 1. Updates `users` table:
```typescript
UPDATE users SET 
  first_name = COALESCE(?, first_name),
  last_name = COALESCE(?, last_name),
  phone = COALESCE(?, phone)
WHERE id = ?
```

#### 2. Updates `user_profiles` table:
```typescript
UPDATE user_profiles SET
  address = COALESCE(?, address),           // ✅ Street address
  city = COALESCE(?, city),                 // ✅ City
  province = COALESCE(?, province),         // ✅ Province
  barangay = COALESCE(?, barangay),         // ✅ Barangay
  blood_type = COALESCE(?, blood_type),
  medical_conditions = COALESCE(?, medical_conditions),
  emergency_contact_name = COALESCE(?, emergency_contact_name),
  emergency_contact_phone = COALESCE(?, emergency_contact_phone)
WHERE user_id = ?
```

**Result:** ✅ All address fields (street, barangay, city, province) ARE saved to `user_profiles` table.

---

## Missing: Latitude & Longitude

### Database Schema

The `user_profiles` table HAS latitude and longitude fields:

```sql
CREATE TABLE user_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    barangay VARCHAR(100),
    blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    medical_conditions TEXT,
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    latitude DECIMAL(10, 8),      // ❌ NOT being updated
    longitude DECIMAL(11, 8),     // ❌ NOT being updated
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Current Behavior

When a user updates their profile:
1. ✅ Address, city, province, barangay are saved
2. ❌ Latitude and longitude remain NULL or unchanged
3. ❌ No geocoding is performed

---

## Why Latitude/Longitude Matter

These coordinates are used for:

1. **SMS Blast Targeting** - Send alerts to users within a radius
2. **Alert Automation** - Target users by location for weather/earthquake alerts
3. **Family Locator** - Show family members on map
4. **Evacuation Centers** - Find nearest centers
5. **SOS Alerts** - Show user's location when sending SOS

---

## Recommended Solutions

### Option 1: Automatic Geocoding (Recommended)

Add geocoding to the backend when address is updated:

```typescript
// In auth.service.ts
async updateProfile(userId: number, data: any) {
  const {
    firstName, lastName, phone, address, city, province, barangay,
    bloodType, medicalConditions, emergencyContactName, emergencyContactPhone
  } = data;

  // Update user table
  if (firstName || lastName || phone) {
    await db.query(
      `UPDATE users SET 
       first_name = COALESCE(?, first_name),
       last_name = COALESCE(?, last_name),
       phone = COALESCE(?, phone)
       WHERE id = ?`,
      [firstName, lastName, phone, userId]
    );
  }

  // Geocode address if provided
  let latitude = null;
  let longitude = null;
  
  if (address || city || province) {
    const fullAddress = `${address || ''}, ${barangay || ''}, ${city || ''}, ${province || ''}, Philippines`;
    const coords = await this.geocodeAddress(fullAddress);
    if (coords) {
      latitude = coords.latitude;
      longitude = coords.longitude;
    }
  }

  // Update profile table with coordinates
  await db.query(
    `UPDATE user_profiles SET
     address = COALESCE(?, address),
     city = COALESCE(?, city),
     province = COALESCE(?, province),
     barangay = COALESCE(?, barangay),
     latitude = COALESCE(?, latitude),
     longitude = COALESCE(?, longitude),
     blood_type = COALESCE(?, blood_type),
     medical_conditions = COALESCE(?, medical_conditions),
     emergency_contact_name = COALESCE(?, emergency_contact_name),
     emergency_contact_phone = COALESCE(?, emergency_contact_phone)
     WHERE user_id = ?`,
    [address, city, province, barangay, latitude, longitude, bloodType, 
     medicalConditions, emergencyContactName, emergencyContactPhone, userId]
  );

  return this.getProfile(userId);
}

private async geocodeAddress(address: string): Promise<{latitude: number, longitude: number} | null> {
  try {
    // Use Google Maps Geocoding API or OpenStreetMap Nominatim
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}
```

**Pros:**
- ✅ Automatic - no user action needed
- ✅ Works for all users
- ✅ Consistent data

**Cons:**
- ❌ Requires external API (Google Maps or OpenStreetMap)
- ❌ May have rate limits
- ❌ Accuracy depends on address quality

---

### Option 2: Use Device Location

Get coordinates from the mobile device:

```typescript
// In EditProfileScreen.tsx
import * as Location from 'expo-location';

const handleUpdate = async () => {
  try {
    setLoading(true);
    
    // Get current location
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      formData.latitude = location.coords.latitude;
      formData.longitude = location.coords.longitude;
    }
    
    await api.put('/auth/profile', formData);
    await refreshUser();
    Alert.alert('Success', 'Profile updated successfully');
    navigation.goBack();
  } catch (error: any) {
    Alert.alert('Error', error.message || 'Failed to update profile');
  } finally {
    setLoading(false);
  }
};
```

**Pros:**
- ✅ Accurate - uses GPS
- ✅ No external API needed
- ✅ Real-time location

**Cons:**
- ❌ Requires location permission
- ❌ May not match address (user could be anywhere)
- ❌ Doesn't work if user denies permission

---

### Option 3: Manual Entry (Not Recommended)

Add latitude/longitude input fields:

```typescript
<Input 
  label="Latitude" 
  value={formData.latitude} 
  onChangeText={(text) => setFormData({ ...formData, latitude: text })} 
  placeholder="e.g., 14.5995"
  keyboardType="decimal-pad"
/>
<Input 
  label="Longitude" 
  value={formData.longitude} 
  onChangeText={(text) => setFormData({ ...formData, longitude: text })} 
  placeholder="e.g., 120.9842"
  keyboardType="decimal-pad"
/>
```

**Pros:**
- ✅ Simple to implement
- ✅ No API or permissions needed

**Cons:**
- ❌ Users don't know their coordinates
- ❌ High chance of errors
- ❌ Poor user experience

---

## Recommended Implementation

**Use Option 1 (Automatic Geocoding) + Option 2 (Device Location) as fallback:**

1. When user updates address:
   - Try to geocode the address
   - If geocoding fails, use device location (if permission granted)
   - If both fail, leave coordinates as NULL

2. Add a "Use Current Location" button:
   - Let users manually trigger location update
   - Useful if they move or address geocoding is inaccurate

---

## Implementation Steps

### Step 1: Add Geocoding Service

Create `MOBILE_APP/backend/src/services/geocoding.service.ts`:

```typescript
import axios from 'axios';

export class GeocodingService {
  async geocodeAddress(address: string): Promise<{latitude: number, longitude: number} | null> {
    try {
      // Using OpenStreetMap Nominatim (free, no API key needed)
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: address,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'SafeHaven-App'
        }
      });
      
      if (response.data && response.data.length > 0) {
        return {
          latitude: parseFloat(response.data[0].lat),
          longitude: parseFloat(response.data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }
}

export const geocodingService = new GeocodingService();
```

### Step 2: Update Auth Service

Modify `updateProfile` method to use geocoding.

### Step 3: Update Mobile App

Add "Use Current Location" button to EditProfileScreen.

### Step 4: Update Backend Schema

Ensure latitude/longitude are included in UPDATE query.

---

## Current Status

| Feature | Status | Notes |
|---------|--------|-------|
| Address fields saved | ✅ Working | Street, barangay, city, province |
| Latitude saved | ❌ Not implemented | Always NULL |
| Longitude saved | ❌ Not implemented | Always NULL |
| Geocoding | ❌ Not implemented | No address-to-coordinates conversion |
| Device location | ❌ Not implemented | Not captured during profile update |

---

## Impact on Features

### Features that NEED coordinates:

1. **SMS Blast by Radius** ⚠️ Won't work without coordinates
2. **Alert Automation** ⚠️ Can only target by city name, not radius
3. **Family Locator** ⚠️ Can't show user on map
4. **Nearest Evacuation Centers** ⚠️ Can't calculate distance
5. **SOS Alerts** ✅ Works (uses real-time location, not profile)

---

## Recommendation

**Implement Option 1 (Automatic Geocoding) immediately** because:

1. SMS Blast and Alert Automation are critical features
2. Users won't manually enter coordinates
3. OpenStreetMap Nominatim is free and doesn't require API key
4. Can be implemented in 1-2 hours

Would you like me to implement the geocoding solution?
