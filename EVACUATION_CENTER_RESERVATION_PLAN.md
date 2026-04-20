# Evacuation Center Reservation System - Implementation Plan

## Overview
Implement a comprehensive reservation system for evacuation centers with real-time capacity management, preventing slot hoarding, and admin confirmation workflow.

## Features to Implement

### 1. Reserve Slot (Mobile User)
- User clicks "Reserve Slot" button
- Input number of members (e.g., 10)
- Automatically reserves slots (200 → 190 available)
- 30-minute timer to prevent hoarding
- Auto-cancels if not confirmed

### 2. Live Status Indicators
- ✅ Available (> 50 slots or > 25%)
- ⚠️ Limited (10-50 slots or 5-25%)
- ❌ Full (< 10 slots or < 5%)
- Real-time updates across all users

### 3. Pre-Register / Declare Arrival
- User declares group size
- Estimated Time of Arrival (ETA)
- Admin can prepare before arrival
- Reservation status tracking

### 4. Confirm Arrival (Admin Side)
- Admin confirms when user actually arrives
- Only then officially deduct from capacity
- Prevents fake reservations
- Updates real-time capacity

### 5. Cancel Reservation
- User can cancel before arrival
- Slots automatically returned
- Cancellation history tracked

### 6. Auto-Expire Reservations
- Background job checks expired reservations
- Auto-cancels after 30 minutes
- Returns slots to available pool
- Notifies user of cancellation

### 7. Real-Time Updates
- WebSocket integration for live updates
- Multiple users see same data
- No manual admin intervention needed
- Instant capacity updates

### 8. Quick Action Buttons
- 🧭 Get Directions
- 🏢 Join Center (Reserve)
- 📊 View Status
- 👥 Register Group

### 9. Color-Coded Status Bar
- 🟢 Green = Available (> 25% capacity)
- 🟡 Yellow = Limited (5-25% capacity)
- 🔴 Red = Full (< 5% capacity)

## Database Schema Changes

### New Table: `center_reservations`
```sql
CREATE TABLE center_reservations (
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
  FOREIGN KEY (center_id) REFERENCES evacuation_centers(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (confirmed_by) REFERENCES users(id),
  INDEX idx_center_status (center_id, status),
  INDEX idx_user_status (user_id, status),
  INDEX idx_expires_at (expires_at)
);
```

### Update `evacuation_centers` Table
```sql
ALTER TABLE evacuation_centers
ADD COLUMN reserved_slots INT DEFAULT 0,
ADD COLUMN confirmed_slots INT DEFAULT 0,
ADD COLUMN available_slots INT GENERATED ALWAYS AS (capacity - current_occupancy - reserved_slots) STORED;
```

## API Endpoints

### Mobile User Endpoints

#### 1. Create Reservation
```
POST /api/centers/:id/reserve
Body: {
  groupSize: number,
  estimatedArrival: string (ISO datetime),
  notes?: string
}
Response: {
  reservationId: number,
  expiresAt: string,
  status: 'pending'
}
```

#### 2. Get My Reservations
```
GET /api/centers/reservations/my
Response: {
  reservations: [{
    id, centerId, centerName, groupSize, status,
    estimatedArrival, expiresAt, reservedAt
  }]
}
```

#### 3. Cancel Reservation
```
POST /api/centers/reservations/:id/cancel
Body: { reason?: string }
Response: { success: true }
```

#### 4. Get Center with Real-Time Status
```
GET /api/centers/:id/status
Response: {
  center: {...},
  capacity: number,
  currentOccupancy: number,
  reservedSlots: number,
  availableSlots: number,
  statusLevel: 'available' | 'limited' | 'full',
  myReservation?: {...}
}
```

### Admin Endpoints

#### 5. Get Center Reservations
```
GET /api/admin/centers/:id/reservations
Query: { status?: string, date?: string }
Response: {
  reservations: [{
    id, user, groupSize, status,
    estimatedArrival, reservedAt, expiresAt
  }]
}
```

#### 6. Confirm Arrival
```
POST /api/admin/centers/reservations/:id/confirm
Response: { success: true, updatedCapacity: number }
```

#### 7. Reject/Cancel Reservation (Admin)
```
POST /api/admin/centers/reservations/:id/reject
Body: { reason: string }
Response: { success: true }
```

## Backend Services

### 1. ReservationService
```typescript
class ReservationService {
  async createReservation(centerId, userId, data)
  async cancelReservation(reservationId, userId, reason)
  async confirmArrival(reservationId, adminId)
  async getMyReservations(userId)
  async getCenterReservations(centerId, filters)
  async expireOldReservations() // Cron job
  async checkAvailability(centerId, groupSize)
}
```

### 2. CapacityManager
```typescript
class CapacityManager {
  async reserveSlots(centerId, groupSize)
  async releaseSlots(centerId, groupSize)
  async confirmSlots(centerId, groupSize)
  async getAvailableSlots(centerId)
  async getStatusLevel(centerId)
  async broadcastCapacityUpdate(centerId)
}
```

### 3. ExpirationWorker (Cron Job)
```typescript
// Runs every 5 minutes
async function expireReservations() {
  // Find expired reservations
  // Auto-cancel them
  // Release slots
  // Notify users
  // Broadcast updates
}
```

## Mobile UI Components

### 1. ReservationModal
- Input: Group size
- Input: Estimated arrival time
- Input: Notes (optional)
- Shows: Available slots
- Shows: Expiration timer
- Button: Confirm Reservation

### 2. MyReservationCard
- Shows: Center name
- Shows: Group size
- Shows: Status badge
- Shows: Countdown timer
- Shows: ETA
- Button: Cancel
- Button: Get Directions

### 3. CenterStatusBadge
- Color-coded indicator
- Shows available slots
- Shows status text
- Real-time updates

### 4. QuickActionButtons
- 🧭 Directions
- 🏢 Reserve Slot
- 📊 View Details
- 👥 My Reservation

## Web Admin UI Components

### 1. ReservationsTable
- List of all reservations
- Filter by status
- Filter by date
- Sort by arrival time
- Actions: Confirm, Reject

### 2. ReservationDetailModal
- User information
- Group size
- ETA
- Notes
- Status history
- Actions: Confirm Arrival, Reject

### 3. CapacityDashboard
- Real-time capacity chart
- Reserved vs Available
- Pending confirmations
- Recent arrivals

### 4. CenterManagement
- Update capacity
- View reservations
- Confirm arrivals
- Manage occupancy

## WebSocket Events

### Client → Server
- `subscribe_center`: Subscribe to center updates
- `unsubscribe_center`: Unsubscribe

### Server → Client
- `capacity_updated`: { centerId, availableSlots, status }
- `reservation_created`: { centerId, reservationId }
- `reservation_cancelled`: { centerId, reservationId }
- `reservation_confirmed`: { centerId, reservationId }

## Implementation Steps

### Phase 1: Database & Backend (Priority)
1. ✅ Create migration for `center_reservations` table
2. ✅ Update `evacuation_centers` table schema
3. ✅ Create ReservationService
4. ✅ Create CapacityManager
5. ✅ Add API endpoints
6. ✅ Add WebSocket events
7. ✅ Create expiration cron job

### Phase 2: Mobile UI (User Side)
1. ✅ Update CenterDetailsScreen with Reserve button
2. ✅ Create ReservationModal component
3. ✅ Create MyReservationsScreen
4. ✅ Add status badges with colors
5. ✅ Add quick action buttons
6. ✅ Integrate WebSocket for real-time updates
7. ✅ Add countdown timer component

### Phase 3: Web Admin UI
1. ✅ Create Reservations management page
2. ✅ Add reservation table with filters
3. ✅ Create confirmation modal
4. ✅ Add capacity dashboard
5. ✅ Integrate real-time updates

### Phase 4: Testing & Polish
1. ✅ Test reservation flow
2. ✅ Test expiration logic
3. ✅ Test concurrent reservations
4. ✅ Test real-time updates
5. ✅ Test admin confirmation
6. ✅ Load testing

## Business Rules

1. **Reservation Limits**
   - Max group size: 50 people
   - Max 1 active reservation per user
   - Must have available slots

2. **Expiration**
   - Reservations expire after 30 minutes
   - Auto-cancelled if not confirmed
   - Slots returned to pool

3. **Confirmation**
   - Only admin can confirm arrivals
   - Confirmation moves slots from reserved to occupied
   - Cannot confirm expired reservations

4. **Cancellation**
   - User can cancel anytime before arrival
   - Admin can reject reservations
   - Slots immediately returned

5. **Capacity Calculation**
   - Available = Capacity - Occupied - Reserved
   - Status based on available percentage
   - Real-time updates via WebSocket

## Security Considerations

1. **Rate Limiting**: Prevent spam reservations
2. **Validation**: Check available slots before reserving
3. **Authorization**: Only user can cancel their reservation
4. **Admin Only**: Only admin can confirm arrivals
5. **Audit Trail**: Log all reservation actions

## Benefits

✅ Prevents overcrowding
✅ Better capacity management
✅ Reduces fake reservations
✅ Real-time visibility
✅ Improved user experience
✅ Admin control and oversight
✅ Automatic slot management
✅ Fair distribution of slots

## Next Steps

1. Review and approve this plan
2. Start with Phase 1 (Database & Backend)
3. Test backend thoroughly
4. Implement mobile UI
5. Implement admin UI
6. End-to-end testing
7. Deploy and monitor
