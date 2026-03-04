# Profile Update 401 Error - Troubleshooting

## Error
When submitting the Edit Profile form in the mobile app, you get:
```
Request failed with status code 401
```

## Cause
401 = Unauthorized. This means:
1. No authentication token is present
2. Token is invalid or expired
3. Token is not being sent with the request

## Quick Fixes

### Fix 1: Re-login to the App

The token may have expired. Simply:
1. Close the app completely
2. Reopen the app
3. Login again with your credentials
4. Try updating profile again

### Fix 2: Check if User is Logged In

In the EditProfileScreen, add a check:

```typescript
const handleUpdate = async () => {
  try {
    setLoading(true);
    
    // Check if user is logged in
    if (!user) {
      Alert.alert('Error', 'Please login first');
      navigation.navigate('Login');
      return;
    }
    
    await api.put('/auth/profile', formData);
    await refreshUser();
    Alert.alert('Success', 'Profile updated successfully');
    navigation.goBack();
  } catch (error: any) {
    console.error('Profile update error:', error);
    
    // Handle 401 specifically
    if (error.response?.status === 401) {
      Alert.alert('Session Expired', 'Please login again', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } else {
      Alert.alert('Error', error.message || 'Failed to update profile');
    }
  } finally {
    setLoading(false);
  }
};
```

### Fix 3: Verify Token is Being Sent

Check the API service logs. The token should be attached automatically by the interceptor.

Add debug logging to see if token exists:

```typescript
// In EditProfileScreen.tsx
const handleUpdate = async () => {
  try {
    setLoading(true);
    
    // Debug: Check if token exists
    const token = await getData(STORAGE_KEYS.ACCESS_TOKEN);
    console.log('Token exists:', !!token);
    console.log('Token preview:', token?.substring(0, 20) + '...');
    
    await api.put('/auth/profile', formData);
    // ...
  }
}
```

### Fix 4: Check Backend Logs

Look at the backend console to see what error is being returned:

```
[Backend Console]
GET /api/v1/auth/profile 401 - Invalid or expired token
```

If you see "Invalid or expired token", the user needs to login again.

## Testing the Fix

### Test 1: Login and Update Profile

1. Open mobile app
2. Login with test credentials:
   - Email: `citizen@test.safehaven.com`
   - Password: `Test123!`
3. Go to Profile → Edit Profile
4. Update address fields:
   - Address: `123 Main Street`
   - Barangay: `Poblacion`
   - City: `Cebu City`
   - Province: `Cebu`
5. Click "Update Profile"
6. Should see "Success" message

### Test 2: Verify Geocoding Worked

After successful update, check if coordinates were saved:

```bash
# In backend, check database
mysql -u root -p safehaven

SELECT u.email, p.address, p.city, p.latitude, p.longitude 
FROM users u 
JOIN user_profiles p ON u.id = p.user_id 
WHERE u.email = 'citizen@test.safehaven.com';
```

Expected result:
```
email                          | address         | city       | latitude  | longitude
citizen@test.safehaven.com    | 123 Main Street | Cebu City  | 10.3157   | 123.8854
```

## Common Issues

### Issue 1: Token Expired
**Symptom:** 401 error after app has been open for a while  
**Solution:** Login again. Tokens expire after 24 hours for citizens.

### Issue 2: No Token Stored
**Symptom:** 401 error immediately after opening app  
**Solution:** User was never logged in. Go to login screen.

### Issue 3: Backend Not Running
**Symptom:** Network error or timeout  
**Solution:** Start backend server:
```bash
cd MOBILE_APP/backend
npm run dev
```

### Issue 4: Wrong API URL
**Symptom:** Connection refused or 404  
**Solution:** Check `MOBILE_APP/mobile/.env`:
```
API_URL=http://localhost:3001/api/v1
```

For physical device, use your computer's IP:
```
API_URL=http://192.168.1.100:3001/api/v1
```

## Updated EditProfileScreen with Better Error Handling

Here's the improved version:

```typescript
const handleUpdate = async () => {
  try {
    setLoading(true);
    
    // Validate user is logged in
    if (!user) {
      Alert.alert('Error', 'Please login first');
      navigation.navigate('Login');
      return;
    }
    
    console.log('Updating profile for user:', user.email);
    console.log('Form data:', formData);
    
    const response = await api.put('/auth/profile', formData);
    console.log('Profile updated successfully:', response.data);
    
    await refreshUser();
    
    Alert.alert(
      'Success', 
      'Profile updated successfully' + 
      (response.data.data.profile.latitude ? 
        '\n\nLocation coordinates saved!' : '')
    );
    
    navigation.goBack();
  } catch (error: any) {
    console.error('Profile update error:', error);
    console.error('Error response:', error.response?.data);
    
    if (error.response?.status === 401) {
      Alert.alert(
        'Session Expired', 
        'Your session has expired. Please login again.',
        [
          { 
            text: 'Login', 
            onPress: () => {
              // Logout and go to login
              logout();
              navigation.navigate('Login');
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Error', 
        error.response?.data?.message || 
        error.message || 
        'Failed to update profile'
      );
    }
  } finally {
    setLoading(false);
  }
};
```

## Quick Test Script

Test the profile update endpoint directly:

```bash
# Login first
$login = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"citizen@test.safehaven.com","password":"Test123!"}'

# Update profile
$headers = @{"Authorization" = "Bearer $($login.accessToken)"}
$body = @{
  address = "123 Main Street"
  barangay = "Poblacion"
  city = "Cebu City"
  province = "Cebu"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/profile" -Method PUT -Headers $headers -ContentType "application/json" -Body $body
```

## Summary

The 401 error means the user needs to login again. The most common fix is:

1. **Close and reopen the app**
2. **Login with valid credentials**
3. **Try updating profile again**

If the issue persists, check:
- Backend is running
- API URL is correct
- Token is being stored (check AsyncStorage)
- Backend logs for specific error message
