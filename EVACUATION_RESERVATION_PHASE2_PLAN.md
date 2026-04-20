# Evacuation Center Reservation - Phase 2: Mobile UI Implementation Plan

## Overview
Implement user-facing reservation features in the React Native mobile app.

## Components to Create

### 1. Reservation API Service
**File**: `mobile/src/services/reservation.ts`
- `createReservation(centerId, data)` - Create new reservation
- `getMyReservations()` - Get user's reservations
- `cancelReservation(reservationId, reason)` - Cancel reservation
- `getCenterStatus(centerId)` - Get center availability
- `checkAvailability(centerId, groupSize)` - Check if slots available

### 2. Status Badge Component
**File**: `mobile/src/components/evacuation/CenterStatusBadge.tsx`
- Color-coded badge (Green/Yellow/Red)
- Shows available slots
- Shows status text (Available/Limited/Critical/Full)
- Real-time updates

### 3. Reservation Modal
**File**: `mobile/src/components/evacuation/ReservationModal.tsx`
- Group size input (1-50)
- Date/time picker for estimated arrival
- Notes field (optional)
- Shows available slots
- 30-minute expiration warning
- Submit button

### 4. Countdown Timer Component
**File**: `mobile/src/components/evacuation/ReservationCountdown.tsx`
- Shows time remaining (30 minutes)
- Updates every second
- Visual warning when < 5 minutes
- Auto-refreshes on expiration

### 5. My Reservations Screen
**File**: `mobile/src/screens/evacuation/MyReservationsScreen.tsx`
- List of user's reservations
- Filter by status (pending/confirmed/cancelled)
- Shows countdown for pending
- Cancel button
- Get directions button
- Empty state

### 6. Reservation Card Component
**File**: `mobile/src/components/evacuation/ReservationCard.tsx`
- Center name and address
- Group size
- Status badge
- Countdown timer (if pending)
- ETA
- Action buttons (Cancel, Directions)

## Updates to Existing Files

### 7. Update Evacuation Center Details Screen
**File**: `mobile/src/screens/evacuation/EvacuationCenterDetailsScreen.tsx`
- Add status badge at top
- Add "Reserve Slot" button
- Show user's active reservation (if exists)
- Disable reserve button if already reserved

### 8. Update WebSocket Service
**File**: `mobile/src/services/websocket.service.ts`
- Listen for `capacity_updated` events
- Update center status in real-time
- Trigger UI refresh

### 9. Add Navigation
**File**: `mobile/src/types/navigation.ts`
- Add `MyReservations` screen to navigation

## Implementation Order

1. **Reservation Service** (API client)
2. **Status Badge Component** (visual indicator)
3. **Reservation Modal** (create reservation)
4. **Update Center Details Screen** (integrate reserve button)
5. **Countdown Timer** (expiration warning)
6. **Reservation Card** (display reservation)
7. **My Reservations Screen** (manage reservations)
8. **WebSocket Integration** (real-time updates)

## Color Scheme

```typescript
const STATUS_COLORS = {
  available: '#10B981',   // Green
  limited: '#F59E0B',     // Yellow/Orange
  critical: '#EF4444',    // Red
  full: '#6B7280',        // Gray
};
```

## Status Levels

- **Available**: > 25% capacity (Green)
- **Limited**: 5-25% capacity (Yellow)
- **Critical**: < 5% capacity (Red)
- **Full**: 0 slots (Gray)

## User Flow

1. User opens Evacuation Center Details
2. Sees status badge: "150 slots available" (Green)
3. Clicks "Reserve Slot" button
4. Modal opens with form
5. Enters group size (5 people)
6. Selects estimated arrival time
7. Submits reservation
8. Sees countdown timer (30 minutes)
9. Can cancel or wait for arrival
10. Admin confirms arrival at center

## WebSocket Events

### Subscribe to Center Updates
```typescript
socket.on('capacity_updated', (data) => {
  // data: { centerId, availableSlots, statusLevel, occupancyPercentage }
  // Update UI with new capacity
});
```

## API Endpoints Used

- `POST /api/v1/centers/:id/reserve` - Create reservation
- `GET /api/v1/centers/reservations/my` - Get my reservations
- `POST /api/v1/centers/reservations/:id/cancel` - Cancel
- `GET /api/v1/centers/:id/status` - Get status
- `POST /api/v1/centers/:id/check-availability` - Check slots

## Next Steps

After Phase 2 is complete:
1. Test reservation flow end-to-end
2. Test WebSocket real-time updates
3. Test countdown timer and auto-expiration
4. Build APK and test on real device
5. Proceed to Phase 3 (Web Admin UI)
