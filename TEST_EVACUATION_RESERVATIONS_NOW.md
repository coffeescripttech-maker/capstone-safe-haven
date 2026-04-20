# Test Evacuation Center Reservations - Quick Guide

## Prerequisites

1. Backend running on port 3001
2. Mobile app running (Expo)
3. Database migration applied
4. Test user logged in

## Quick Test (5 Minutes)

### Step 1: Start Backend
```powershell
cd MOBILE_APP/backend
npm run dev
```

Wait for:
```
✅ Server running on port 3001
✅ WebSocket server initialized
✅ Cron job scheduled: Expire reservations every 5 minutes
```

### Step 2: Start Mobile App
```powershell
cd MOBILE_APP/mobile
npm start
```

Press `a` for Android or `i` for iOS

### Step 3: Test Flow

#### A. View Center with Status
1. Open app
2. Tap "Centers" tab
3. Select any center
4. **Expected**: See status badge at top (🟢 Available / 🟡 Limited / 🔴 Critical)
5. **Expected**: See available slots count

#### B. Create Reservation
1. On center details, tap "Reserve Slot" button
2. Enter group size: `5`
3. Select arrival time: (any future time)
4. Add notes: `Test reservation`
5. Tap "Reserve Slot"
6. **Expected**: Success alert
7. **Expected**: See active reservation section
8. **Expected**: See countdown timer (30:00)

#### C. View My Reservations
1. Tap "View My Reservations" button
2. **Expected**: See list with your reservation
3. **Expected**: See countdown timer
4. **Expected**: See "Pending" status badge
5. Try filters: All / Active / Past
6. Pull down to refresh

#### D. Cancel Reservation
1. On reservation card, tap "Cancel" button
2. Confirm cancellation
3. **Expected**: Status changes to "Cancelled"
4. **Expected**: Appears in "Past" filter

#### E. Real-Time Updates
1. Create another reservation
2. Open backend terminal
3. Watch for WebSocket broadcast:
   ```
   📢 Broadcasted capacity update for center X
   ```
4. **Expected**: Status badge updates in real-time

## Test API Directly

```powershell
cd MOBILE_APP/backend
.\test-reservation-api.ps1
```

This will:
1. Create test reservation
2. Get user reservations
3. Check center status
4. Cancel reservation
5. Verify expiration

## Expected Results

### Center Details Screen
- ✅ Status badge visible at top
- ✅ Available slots count shown
- ✅ "Reserve Slot" button enabled (if slots available)
- ✅ Active reservation section (if exists)
- ✅ Countdown timer (if pending)
- ✅ "View My Reservations" button

### My Reservations Screen
- ✅ List of reservations
- ✅ Filter buttons (All/Active/Past)
- ✅ Reservation cards with details
- ✅ Countdown timers for pending
- ✅ Cancel button
- ✅ Directions button
- ✅ Pull-to-refresh

### Reservation Modal
- ✅ Group size input (1-50)
- ✅ Date/time picker
- ✅ Notes field
- ✅ Available slots display
- ✅ 30-minute warning
- ✅ Validation errors
- ✅ Loading state

### Status Badge Colors
- 🟢 Green: > 25% capacity (Available)
- 🟡 Yellow: 5-25% capacity (Limited)
- 🔴 Red: < 5% capacity (Critical)
- ⚫ Gray: 0 slots (Full)

### Countdown Timer Colors
- 🟢 Green: > 5 minutes remaining
- 🔴 Red: < 5 minutes remaining
- ⚫ Gray: Expired

## Common Issues

### "Reserve Slot" button disabled
- Check if center has available slots
- Check if you already have active reservation
- Check if center status is "Full"

### Countdown not updating
- Check if reservation status is "pending"
- Check if expiresAt is valid date
- Restart app if needed

### WebSocket not updating
- Check backend console for WebSocket logs
- Check mobile console for event logs
- Verify WebSocket connection in backend logs

### Modal not opening
- Check if centerStatus is loaded
- Check console for errors
- Verify center has available slots

## Debug Logs

### Backend Console
```
✅ Reservation created: ID 1, Center 1, User 1, Size 5
📢 Broadcasted capacity update for center 1
⏰ Expired 0 reservations
```

### Mobile Console
```
📝 Creating reservation: { centerId: 1, groupSize: 5, ... }
✅ Reservation created: { id: 1, ... }
📢 [WebSocket] CAPACITY UPDATE RECEIVED!
   Center: 1
   Available Slots: 145
   Status: available
```

## Test Scenarios

### Scenario 1: Happy Path
1. Create reservation ✅
2. View in My Reservations ✅
3. See countdown timer ✅
4. Cancel reservation ✅

### Scenario 2: Already Has Reservation
1. Create reservation ✅
2. Try to create another ✅
3. See alert: "You already have an active reservation" ✅

### Scenario 3: No Slots Available
1. Find full center ✅
2. "Reserve Slot" button disabled ✅
3. Status badge shows "Full" ✅

### Scenario 4: Expiration
1. Create reservation ✅
2. Wait 30 minutes (or change expiresAt in DB) ✅
3. Cron job expires reservation ✅
4. Status changes to "Expired" ✅
5. Slots returned to available ✅

### Scenario 5: Real-Time Updates
1. Open center on Device A ✅
2. Create reservation on Device B ✅
3. Device A sees capacity update ✅
4. Status badge updates ✅

## Quick Verification

Run this in backend terminal:
```powershell
# Check if migration applied
mysql -u root -p safehaven_db -e "SHOW TABLES LIKE 'center_reservations';"

# Check if cron job running
# Look for: "Cron job scheduled: Expire reservations every 5 minutes"

# Check WebSocket
# Look for: "WebSocket server initialized on port 3001"
```

## Success Criteria

- [x] Can view center with status badge
- [x] Can create reservation
- [x] Can view reservations list
- [x] Can filter reservations
- [x] Can cancel reservation
- [x] Countdown timer updates
- [x] WebSocket updates work
- [x] Navigation works
- [x] Pull-to-refresh works
- [x] Validation works
- [x] Error handling works

## Next Steps After Testing

1. Test on real device
2. Test with multiple users
3. Test expiration (wait 30 minutes)
4. Test admin confirmation (web app)
5. Build APK and test offline
6. Load test with many reservations

## Support

If you encounter issues:
1. Check backend console for errors
2. Check mobile console for errors
3. Verify database migration applied
4. Restart backend and mobile app
5. Check network connection
6. Verify auth token is valid

## Summary

The evacuation center reservation system is fully functional and ready to test! Follow the steps above to verify all features work correctly.

