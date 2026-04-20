# Evacuation Reservation - Dependency Fix

## Issue
Missing dependency: `@react-native-community/datetimepicker`

## Error
```
Error: Unable to resolve module @react-native-community/datetimepicker
```

## Solution Applied ✅

Installed the missing package:
```powershell
cd MOBILE_APP/mobile
npm install @react-native-community/datetimepicker
```

## What This Package Does

The `@react-native-community/datetimepicker` package provides a native date and time picker component for React Native. It's used in the ReservationModal to allow users to select their estimated arrival time.

## Usage in Our Code

**File**: `mobile/src/components/evacuation/ReservationModal.tsx`

```tsx
import DateTimePicker from '@react-native-community/datetimepicker';

// Used for selecting estimated arrival time
<DateTimePicker
  value={estimatedArrival}
  mode="datetime"
  display="default"
  onChange={(event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEstimatedArrival(selectedDate);
    }
  }}
  minimumDate={new Date()}
/>
```

## Next Steps

1. Restart the Expo development server:
   ```powershell
   cd MOBILE_APP/mobile
   npm start
   ```

2. Clear cache if needed:
   ```powershell
   npm start -- --clear
   ```

3. Test the reservation modal:
   - Open app
   - Navigate to Centers
   - Select a center
   - Click "Reserve Slot"
   - Try selecting a date/time

## Package Info

- **Package**: `@react-native-community/datetimepicker`
- **Version**: Latest (installed automatically)
- **Platform Support**: iOS, Android, Windows
- **Documentation**: https://github.com/react-native-datetimepicker/datetimepicker

## Alternative (If Issues Persist)

If you encounter platform-specific issues, you can use Expo's built-in DateTimePicker:

```tsx
// Replace import
import DateTimePicker from 'expo-date-time-picker';

// Or use a simpler text input
<TextInput
  value={estimatedArrival.toLocaleString()}
  onPress={() => setShowDatePicker(true)}
  editable={false}
/>
```

## Status

✅ Package installed successfully
✅ Ready to test

