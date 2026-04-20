# Start Evacuation Center Reservations - Complete Guide

## Quick Start (3 Steps)

### Step 1: Install Dependencies ✅
```powershell
cd MOBILE_APP/mobile
npm install
```

**Note**: The `@react-native-community/datetimepicker` package has been installed.

### Step 2: Start Backend
```powershell
cd MOBILE_APP/backend
npm run dev
```

**Wait for**:
```
✅ Server running on port 3001
✅ WebSocket server initialized
✅ Cron job scheduled: Expire reservations every 5 minutes
```

### Step 3: Start Mobile App
```powershell
cd MOBILE_APP/mobile
npm start
```

Press `a` for Android or `i` for iOS

## Verify Installation

### Check Backend
```powershell
# Terminal 1
cd MOBILE_APP/backend
npm run dev
```

Look for:
- ✅ MySQL connection successful
- ✅ Server running on port 3001
- ✅ WebSocket initialized
- ✅ Cron job scheduled

### Check Mobile App
```powershell
# Terminal 2
cd MOBILE_APP/mobile
npm start
```

Look for:
- ✅ Metro bundler started
- ✅ No dependency errors
- ✅ QR code displayed

## Test the Feature

### 1. Navigate to Centers
- Open app
- Tap "Centers" tab at bottom
- Select any center from map or list

### 2. View Status
- See status badge at top (🟢🟡🔴⚫)
- See available slots count
- See "Reserve Slot" button

### 3. Create Reservation
- Tap "Reserve Slot"
- Enter group size (1-50)
- Select arrival time
- Add notes (optional)
- Tap "Reserve Slot"

### 4. View Reservations
- Tap "View My Reservations"
- See your reservation with countdown
- Try filters: All / Active / Past
- Pull down to refresh

### 5. Cancel Reservation
- Tap "Cancel" on reservation card
- Confirm cancellation
- Status changes to "Cancelled"

## Troubleshooting

### Error: Module not found
```powershell
cd MOBILE_APP/mobile
npm install
npm start -- --clear
```

### Error: Backend not responding
```powershell
# Check if backend is running
cd MOBILE_APP/backend
npm run dev

# Check if port 3001 is in use
netstat -ano | findstr :3001
```

### Error: Database connection failed
```powershell
# Check MySQL is running
# Check .env file has correct credentials
cd MOBILE_APP/backend
cat .env
```

### Error: WebSocket not connecting
```powershell
# Check backend logs for WebSocket initialization
# Check mobile console for connection logs
# Verify API_CONFIG.BASE_URL in mobile/src/constants/config.ts
```

### Error: DateTimePicker not working
```powershell
# Reinstall package
cd MOBILE_APP/mobile
npm uninstall @react-native-community/datetimepicker
npm install @react-native-community/datetimepicker
npm start -- --clear
```

## Common Issues

### Issue 1: "Reserve Slot" button disabled
**Cause**: No available slots or already has reservation
**Solution**: 
- Check center capacity
- Check if you have active reservation
- Try different center

### Issue 2: Countdown not updating
**Cause**: Component not mounted or date invalid
**Solution**:
- Restart app
- Check reservation status is "pending"
- Check expiresAt date is valid

### Issue 3: Real-time updates not working
**Cause**: WebSocket not connected
**Solution**:
- Check backend WebSocket logs
- Check mobile WebSocket logs
- Verify auth token is valid
- Restart both backend and mobile

## File Structure

```
MOBILE_APP/
├── backend/
│   ├── src/
│   │   ├── services/reservation.service.ts
│   │   ├── controllers/reservation.controller.ts
│   │   ├── routes/reservation.routes.ts
│   │   └── jobs/expireReservations.ts
│   └── test-reservation-api.ps1
├── mobile/
│   ├── src/
│   │   ├── services/reservation.ts
│   │   ├── components/evacuation/
│   │   │   ├── CenterStatusBadge.tsx
│   │   │   ├── ReservationCountdown.tsx
│   │   │   ├── ReservationModal.tsx
│   │   │   └── ReservationCard.tsx
│   │   ├── screens/
│   │   │   ├── centers/CenterDetailsScreen.tsx
│   │   │   └── evacuation/MyReservationsScreen.tsx
│   │   └── navigation/MainNavigator.tsx
│   └── package.json
└── database/
    └── migrations/013_add_center_reservations.sql
```

## API Endpoints

### User Endpoints
- `POST /api/v1/centers/:id/reserve` - Create reservation
- `GET /api/v1/centers/reservations/my` - Get my reservations
- `POST /api/v1/centers/reservations/:id/cancel` - Cancel
- `GET /api/v1/centers/:id/status` - Get status

### Admin Endpoints
- `GET /api/v1/admin/centers/:id/reservations` - Get all
- `POST /api/v1/admin/centers/reservations/:id/confirm` - Confirm
- `POST /api/v1/admin/centers/reservations/:id/reject` - Reject

## WebSocket Events

### capacity_updated
Broadcasted when capacity changes:
```typescript
{
  type: 'capacity_update',
  data: {
    centerId: 1,
    availableSlots: 150,
    statusLevel: 'available',
    occupancyPercentage: 25.5,
    reservedSlots: 10
  }
}
```

## Environment Variables

### Backend (.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=safehaven_db
PORT=3001
JWT_SECRET=your_secret
```

### Mobile (.env)
```env
API_URL=http://192.168.1.100:3001/api/v1
WS_URL=http://192.168.1.100:3001
```

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Mobile app starts without errors
- [ ] Can navigate to Centers
- [ ] Can see center details
- [ ] Can see status badge
- [ ] Can open reservation modal
- [ ] Can create reservation
- [ ] Can see countdown timer
- [ ] Can view My Reservations
- [ ] Can filter reservations
- [ ] Can cancel reservation
- [ ] Can get directions
- [ ] Real-time updates work
- [ ] Pull-to-refresh works

## Next Steps

1. ✅ Install dependencies
2. ✅ Start backend
3. ✅ Start mobile app
4. ✅ Test complete flow
5. Build APK for testing on real device
6. Test with multiple users
7. Test expiration (wait 30 minutes)
8. Test admin confirmation (web app)

## Support

If you encounter any issues:
1. Check this guide first
2. Check backend console for errors
3. Check mobile console for errors
4. Verify all dependencies installed
5. Restart both backend and mobile
6. Clear cache and rebuild

## Documentation

- `EVACUATION_RESERVATION_COMPLETE.md` - Complete feature documentation
- `TEST_EVACUATION_RESERVATIONS_NOW.md` - Testing guide
- `EVACUATION_RESERVATION_DEPENDENCY_FIX.md` - Dependency fix guide

## Summary

The evacuation center reservation system is fully implemented and ready to use! Follow the steps above to start testing.

