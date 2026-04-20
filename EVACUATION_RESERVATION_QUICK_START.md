# Evacuation Center Reservation - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Apply Database Migration (2 minutes)
```powershell
cd MOBILE_APP/database
.\apply-reservation-migration.ps1
```

**What this does:**
- Creates `center_reservations` table
- Creates `center_availability` view
- Updates `evacuation_centers` table
- Verifies all changes

**Expected output:**
```
✅ Connected to database
✅ Migration applied successfully!
✅ center_reservations table created
✅ center_availability view created
✅ evacuation_centers table updated
```

### Step 2: Restart Backend Server (1 minute)
```powershell
cd MOBILE_APP/backend
.\restart-backend.ps1
```

Or manually:
```powershell
cd MOBILE_APP/backend
npm run dev
```

**What this does:**
- Loads new reservation routes
- Starts expiration cron job (runs every 5 minutes)
- Initializes WebSocket for real-time updates

**Expected output:**
```
✅ SafeHaven API Server running on port 3001
✅ WebSocket server ready
✅ Reservation expiration job started
```

### Step 3: Test API (3 minutes)
```powershell
cd MOBILE_APP/backend
.\test-reservation-api.ps1
```

**What this tests:**
1. User login
2. Check center status
3. Check availability for group
4. Create reservation
5. Get my reservations
6. Cancel reservation
7. Verify cancellation

**Expected output:**
```
✅ Login successful
✅ Center status retrieved
✅ Availability check complete
✅ Reservation created
✅ Retrieved reservations
✅ Reservation cancelled
✅ Cancellation verified
🎉 Reservation API test complete!
```

## 🎯 That's It!

Your evacuation center reservation system backend is now running!

## 📱 What You Can Do Now

### As a User (Mobile App - Coming in Phase 2):
1. View evacuation center availability
2. Reserve slots for your group (1-50 people)
3. See countdown timer (30 minutes)
4. Cancel reservation if plans change
5. Get real-time capacity updates

### As an Admin (Web Portal - Coming in Phase 3):
1. View all reservations for a center
2. Filter by status (pending/confirmed/cancelled)
3. Confirm arrivals
4. Reject reservations
5. Monitor capacity in real-time

## 🔄 How It Works

### User Flow:
```
1. User opens evacuation center details
2. Sees: "150 slots available" (🟢 Green)
3. Clicks "Reserve Slot"
4. Enters: Group size (5 people)
5. Enters: Estimated arrival (2:00 PM)
6. Confirms reservation
7. Gets: 30-minute countdown timer
8. Arrives at center
9. Admin confirms arrival
10. Slots officially occupied
```

### Auto-Expiration:
```
1. User creates reservation at 12:00 PM
2. Reservation expires at 12:30 PM
3. Cron job runs at 12:30 PM
4. Finds expired reservation
5. Auto-cancels it
6. Returns 5 slots to available pool
7. Broadcasts update to all users
```

### Real-Time Updates:
```
1. User A reserves 10 slots
2. WebSocket broadcasts: "140 slots available"
3. All connected users see update instantly
4. No page refresh needed
```

## 📊 API Endpoints Summary

### User Endpoints:
- `POST /api/v1/centers/:id/reserve` - Create reservation
- `GET /api/v1/centers/reservations/my` - My reservations
- `POST /api/v1/centers/reservations/:id/cancel` - Cancel
- `GET /api/v1/centers/:id/status` - Center status
- `POST /api/v1/centers/:id/check-availability` - Check slots

### Admin Endpoints:
- `GET /api/v1/admin/centers/:id/reservations` - All reservations
- `POST /api/v1/admin/centers/reservations/:id/confirm` - Confirm arrival
- `POST /api/v1/admin/centers/reservations/:id/reject` - Reject

## 🎨 Status Colors

- 🟢 **Green (Available)**: > 25% capacity
- 🟡 **Yellow (Limited)**: 5-25% capacity
- 🔴 **Red (Critical)**: < 5% capacity
- ⛔ **Full**: 0 slots

## ⏰ Important Timings

- **Reservation Timeout**: 30 minutes
- **Cron Job Frequency**: Every 5 minutes
- **Max Group Size**: 50 people
- **Reservations Per User**: 1 active per center

## 🔐 Security

- ✅ JWT authentication required
- ✅ RBAC permissions for admin
- ✅ Input validation
- ✅ Transaction support
- ✅ Rate limiting

## 🐛 Troubleshooting

### Migration Failed?
```powershell
# Check database connection
cd MOBILE_APP/backend
node -e "require('dotenv').config(); console.log(process.env.DB_HOST)"
```

### Backend Not Starting?
```powershell
# Check if port 3001 is in use
cd MOBILE_APP/backend
.\kill-port-3001.ps1
npm run dev
```

### Test Script Failed?
```powershell
# Check if backend is running
curl http://localhost:3001/health

# Check test user exists
# Login: citizen1@test.com
# Password: password123
```

## 📞 Need Help?

Check these files:
- `EVACUATION_RESERVATION_BACKEND_COMPLETE.md` - Full documentation
- `EVACUATION_CENTER_RESERVATION_PLAN.md` - Implementation plan
- `EVACUATION_RESERVATION_PHASE1_PROGRESS.md` - Progress tracker

## 🎉 Next: Phase 2 - Mobile UI

Once backend is tested and working, proceed to implement:
1. CenterDetailsScreen with Reserve button
2. ReservationModal component
3. MyReservationsScreen
4. Status badges and countdown timers
5. WebSocket integration

Ready to build the mobile UI? Let's go! 🚀
