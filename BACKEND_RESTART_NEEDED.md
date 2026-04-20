# Backend Restart Required ⚠️

## Issue
The reservation routes are returning 404 because the backend server needs to be restarted to load the new routes.

## Why This Happened
The reservation routes were added to the codebase, but the running backend server doesn't have them loaded yet. Node.js doesn't hot-reload route changes automatically.

## Solution

### Step 1: Stop Current Backend
If you have a terminal running the backend, press `Ctrl+C` to stop it.

Or run this to kill the process:
```powershell
cd MOBILE_APP/backend
.\kill-port-3001.ps1
```

### Step 2: Restart Backend
```powershell
cd MOBILE_APP/backend
npm run dev
```

You should see in the logs:
```
SafeHaven API Server running on port 3001
WebSocket server ready at ws://localhost:3001/ws
Alert Automation monitoring scheduled (every 5 minutes)
Reservation expiration job started (runs every 5 minutes)
```

### Step 3: Verify Routes Are Loaded
Open a new terminal and test:
```powershell
cd MOBILE_APP/backend
.\test-reservation-routes.ps1
```

You should see:
```
✅ Center status endpoint works!
✅ Check availability endpoint works!
```

### Step 4: Test Mobile App
1. The mobile app should automatically reconnect
2. Navigate to Evacuation Centers
3. Click on a center
4. You should now see:
   - Status badge (Green/Yellow/Red/Gray)
   - Clickable "Reserve Slot" button

## What Routes Were Added

The following routes are now available:

### User Endpoints (Authenticated)
- `POST /api/v1/centers/:id/reserve` - Create reservation
- `GET /api/v1/centers/reservations/my` - Get my reservations
- `POST /api/v1/centers/reservations/:id/cancel` - Cancel reservation
- `GET /api/v1/centers/:id/status` - Get center availability status
- `POST /api/v1/centers/:id/check-availability` - Check if group size fits

### Admin Endpoints
- `GET /api/v1/admin/centers/:id/reservations` - Get all reservations for center
- `POST /api/v1/admin/centers/reservations/:id/confirm` - Confirm arrival
- `POST /api/v1/admin/centers/reservations/:id/reject` - Reject reservation

## Background Jobs Running
- **Reservation Expiration**: Runs every 5 minutes, expires reservations after 30 minutes
- **Alert Automation**: Runs every 5 minutes, checks weather/earthquake data
- **WebSocket**: Real-time updates for capacity changes

## Current Configuration
- **Backend URL**: `http://192.168.43.25:3001`
- **Database**: Local MySQL (safehaven_db)
- **Migration Applied**: `013_add_center_reservations.sql` ✅

## Troubleshooting

### Backend won't start
- Check if port 3001 is in use: `.\kill-port-3001.ps1`
- Check database connection in `.env`
- Check for syntax errors: `npm run build`

### Routes still 404 after restart
- Verify routes in `src/routes/index.ts`
- Check `src/routes/reservation.routes.ts` exists
- Look for errors in backend console

### Mobile app still shows errors
- Clear Metro cache: `npm start -- --clear`
- Verify config points to local backend
- Check phone is on same WiFi network
