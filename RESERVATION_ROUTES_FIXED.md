# Reservation Routes Fixed ✅

## Issue
Mobile app was calling `/evacuation-centers/:id/status` but backend route is `/centers/:id/status`

## Fix Applied
Updated `MOBILE_APP/mobile/src/services/reservation.ts` to use correct routes:

### Changed Routes:
- ❌ `/evacuation-centers/${centerId}/reserve` → ✅ `/centers/${centerId}/reserve`
- ❌ `/evacuation-centers/reservations/my` → ✅ `/centers/reservations/my`
- ❌ `/evacuation-centers/reservations/${id}/cancel` → ✅ `/centers/reservations/${id}/cancel`
- ❌ `/evacuation-centers/${centerId}/status` → ✅ `/centers/${centerId}/status`
- ❌ `/evacuation-centers/${centerId}/check-availability` → ✅ `/centers/${centerId}/check-availability`

## Backend Routes (from reservation.routes.ts)
```
POST   /api/v1/centers/:id/reserve
GET    /api/v1/centers/reservations/my
POST   /api/v1/centers/reservations/:id/cancel
GET    /api/v1/centers/:id/status
POST   /api/v1/centers/:id/check-availability
```

## What to Test Now

### 1. View Center Status
1. Open the app (it should auto-reload)
2. Navigate to Evacuation Centers
3. Click on any center
4. **Expected**: You should see a status badge (Green/Yellow/Red/Gray)
5. **Expected**: "Reserve Slot" button should be clickable

### 2. Check Logs
You should now see successful API calls:
```
LOG  API Request: GET http://192.168.43.25:3001/api/v1/centers/4/status
LOG  ✅ Center status: {...}
```

Instead of 404 errors.

### 3. Create Reservation
1. Click "Reserve Slot" button
2. Fill in:
   - Group size (1-50)
   - Estimated arrival time
   - Optional notes
3. Click "Reserve"
4. **Expected**: Success message and countdown timer appears

### 4. View My Reservations
1. Go back to home
2. Navigate to "My Reservations" (should be in the menu)
3. **Expected**: See your active reservation with countdown timer

### 5. Cancel Reservation
1. In "My Reservations" screen
2. Click "Cancel Reservation"
3. **Expected**: Reservation cancelled, capacity restored

## Current Status
✅ Backend running on: `http://192.168.43.25:3001`
✅ Mobile app connected to local backend
✅ Routes fixed to match backend
✅ Database migration applied
✅ WebSocket integration ready

## Next Steps After Testing
Once you confirm everything works locally:
1. Deploy backend to production (see `DEPLOY_RESERVATIONS_TO_PRODUCTION.md`)
2. Update mobile config to use production URL
3. Build new APK with reservation feature

## Troubleshooting

### If button still disabled:
- Check logs for API errors
- Verify backend is running: `cd MOBILE_APP/backend && npm run dev`
- Test endpoint directly: `http://192.168.43.25:3001/api/v1/centers/4/status`

### If app doesn't reload:
- Shake device → Reload
- Or stop Metro and restart: `npm start -- --clear`

### If 404 errors persist:
- Verify routes in backend: `MOBILE_APP/backend/src/routes/index.ts`
- Check reservation routes are imported and mounted
