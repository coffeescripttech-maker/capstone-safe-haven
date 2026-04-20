# Deploy Evacuation Reservations to Production

## Issue
The mobile app is calling `https://capstone-safe-haven.onrender.com/api/v1/evacuation-centers/4/status` but getting **404 - Route not found**.

This means the reservation feature hasn't been deployed to your production server yet.

## Solution: Deploy to Production

### Step 1: Apply Database Migration

**Option A: Using MySQL Client**
```sql
-- Connect to production database
mysql -h [production-host] -u [username] -p [database-name]

-- Run the migration
source MOBILE_APP/database/migrations/013_add_center_reservations.sql
```

**Option B: Using Migration Script**
```powershell
# Update database credentials in the script
cd MOBILE_APP/database
node apply-reservation-migration.js
```

### Step 2: Deploy Backend Code

Your backend needs these new files:
- `backend/src/services/reservation.service.ts`
- `backend/src/controllers/reservation.controller.ts`
- `backend/src/routes/reservation.routes.ts`
- `backend/src/jobs/expireReservations.ts`

And these updated files:
- `backend/src/routes/index.ts` (added reservation routes)
- `backend/src/server.ts` (added cron job)

**Deploy to Render.com:**
1. Push code to your Git repository:
   ```powershell
   git add .
   git commit -m "Add evacuation center reservation system"
   git push origin main
   ```

2. Render will automatically deploy (if auto-deploy is enabled)
3. Or manually deploy from Render dashboard

### Step 3: Verify Deployment

Test the API endpoint:
```powershell
# Replace with your production URL
curl https://capstone-safe-haven.onrender.com/api/v1/evacuation-centers/1/status
```

Expected response:
```json
{
  "status": "success",
  "data": {
    "centerId": 1,
    "available": true,
    "availableSlots": 100,
    "statusLevel": "available",
    "myReservation": null
  }
}
```

## Alternative: Test Locally First

If you want to test before deploying to production:

### 1. Start Local Backend
```powershell
cd MOBILE_APP/backend
npm run dev
```

### 2. Update Mobile App to Use Local Backend

**File**: `MOBILE_APP/mobile/.env`
```env
# Change from production URL
API_URL=http://192.168.1.100:3001/api/v1
WS_URL=http://192.168.1.100:3001

# Replace 192.168.1.100 with your computer's IP address
```

### 3. Restart Mobile App
```powershell
cd MOBILE_APP/mobile
npm start
```

### 4. Test Locally
- Open app
- Navigate to Centers
- Select a center
- "Reserve Slot" button should now work!

## Checklist

### Database Migration
- [ ] Connect to production database
- [ ] Run migration script
- [ ] Verify tables created:
  - `center_reservations`
  - `center_availability` (view)
- [ ] Verify columns added to `evacuation_centers`:
  - `reserved_slots`
  - `confirmed_slots`

### Backend Deployment
- [ ] Push code to Git repository
- [ ] Verify deployment on Render
- [ ] Check deployment logs for errors
- [ ] Verify cron job is running

### API Testing
- [ ] Test `/evacuation-centers/:id/status` endpoint
- [ ] Test `/evacuation-centers/:id/reserve` endpoint
- [ ] Test `/evacuation-centers/reservations/my` endpoint
- [ ] Verify WebSocket connection
- [ ] Verify cron job runs every 5 minutes

### Mobile App Testing
- [ ] Update API URL (if testing locally)
- [ ] Restart mobile app
- [ ] Navigate to center details
- [ ] Verify "Reserve Slot" button is clickable
- [ ] Create test reservation
- [ ] View in "My Reservations"
- [ ] Cancel reservation
- [ ] Test real-time updates

## Production Database Migration SQL

If you need to run the migration manually:

```sql
-- Create center_reservations table
CREATE TABLE IF NOT EXISTS center_reservations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  center_id INT NOT NULL,
  user_id INT NOT NULL,
  group_size INT NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled', 'expired', 'arrived') DEFAULT 'pending',
  estimated_arrival DATETIME,
  reserved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  confirmed_at DATETIME NULL,
  confirmed_by INT NULL,
  cancelled_at DATETIME NULL,
  cancellation_reason TEXT NULL,
  arrived_at DATETIME NULL,
  notes TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (center_id) REFERENCES evacuation_centers(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (confirmed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_center_status (center_id, status),
  INDEX idx_user_status (user_id, status),
  INDEX idx_expires_at (expires_at),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add columns to evacuation_centers (check if exists first)
ALTER TABLE evacuation_centers 
ADD COLUMN IF NOT EXISTS reserved_slots INT DEFAULT 0 COMMENT 'Number of slots currently reserved',
ADD COLUMN IF NOT EXISTS confirmed_slots INT DEFAULT 0 COMMENT 'Number of confirmed arrivals not yet checked in';

-- Create view for available slots
CREATE OR REPLACE VIEW center_availability AS
SELECT 
  ec.id,
  ec.name,
  ec.capacity,
  ec.current_occupancy,
  ec.reserved_slots,
  ec.confirmed_slots,
  (ec.capacity - ec.current_occupancy - ec.reserved_slots - ec.confirmed_slots) AS available_slots,
  CASE
    WHEN (ec.capacity - ec.current_occupancy - ec.reserved_slots - ec.confirmed_slots) <= 0 THEN 'full'
    WHEN (ec.capacity - ec.current_occupancy - ec.reserved_slots - ec.confirmed_slots) < (ec.capacity * 0.05) THEN 'critical'
    WHEN (ec.capacity - ec.current_occupancy - ec.reserved_slots - ec.confirmed_slots) < (ec.capacity * 0.25) THEN 'limited'
    ELSE 'available'
  END AS status_level,
  ROUND(((ec.current_occupancy + ec.reserved_slots + ec.confirmed_slots) / ec.capacity) * 100, 2) AS occupancy_percentage
FROM evacuation_centers ec;
```

## Troubleshooting

### Error: Table already exists
- Migration was already applied
- Skip to Step 2 (Deploy Backend)

### Error: Column already exists
- Some columns were already added
- Safe to ignore, continue deployment

### Error: Route still not found after deployment
- Check Render deployment logs
- Verify code was pushed to Git
- Verify Render pulled latest code
- Check for TypeScript compilation errors
- Restart Render service

### Error: Database connection failed
- Check production database credentials
- Verify database is accessible
- Check firewall rules

## Summary

The reservation feature is fully implemented in your local codebase but needs to be deployed to production. Follow the steps above to:

1. Apply database migration to production
2. Deploy backend code to Render
3. Test the API endpoints
4. Mobile app will work automatically once backend is deployed

