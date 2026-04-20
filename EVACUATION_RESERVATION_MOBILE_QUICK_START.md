# Evacuation Center Reservation - Mobile Quick Start Guide

## What's Been Built

### Backend (100% Complete) ✅
- Database schema with reservations table
- API endpoints for all operations
- Auto-expiration cron job (every 5 minutes)
- WebSocket real-time updates
- Transaction support

### Mobile UI (90% Complete) ✅
- Reservation API Service
- Status Badge Component (Green/Yellow/Red)
- Countdown Timer Component (30 minutes)
- Reservation Modal (Create reservation)
- Reservation Card (Display reservation)
- My Reservations Screen (Manage reservations)
- WebSocket integration for real-time updates

## What's Still Needed

### Integration Tasks (10%)
1. **Find/Create Center Details Screen**
   - Add status badge
   - Add "Reserve Slot" button
   - Integrate ReservationModal

2. **Add Navigation**
   - Add MyReservations to Centers stack
   - Add button to access My Reservations

## How to Test (Once Integrated)

### 1. Start Backend
```powershell
cd MOBILE_APP/backend
npm run dev
```

### 2. Start Mobile App
```powershell
cd MOBILE_APP/mobile
npm start
```

### 3. Test Flow

#### Create Reservation
1. Open Evacuation Centers
2. Select a center
3. See status badge (Green/Yellow/Red)
4. Click "Reserve Slot"
5. Enter group size (1-50)
6. Select arrival time
7. Add notes (optional)
8. Submit

#### View Reservations
1. Navigate to "My Reservations"
2. See list of reservations
3. Filter by All/Active/Past
4. See countdown timer for pending

#### Cancel Reservation
1. Open reservation card
2. Click "Cancel" button
3. Confirm cancellation
4. Reservation status changes to "Cancelled"

#### Get Directions
1. Open reservation card
2. Click "Directions" button
3. Opens Google Maps with center address

#### Watch Expiration
1. Create reservation
2. Watch countdown timer
3. Timer turns red when < 5 minutes
4. After 30 minutes, status changes to "Expired"

### 4. Test Real-Time Updates

#### Terminal 1 (Backend)
```powershell
cd MOBILE_APP/backend
npm run dev
```

#### Terminal 2 (Test API)
```powershell
cd MOBILE_APP/backend
.\test-reservation-api.ps1
```

Watch the mobile app update in real-time when:
- New reservation created
- Reservation cancelled
- Reservation expires
- Capacity changes

## API Endpoints

### User Endpoints
```
POST   /api/v1/centers/:id/reserve
GET    /api/v1/centers/reservations/my
POST   /api/v1/centers/reservations/:id/cancel
GET    /api/v1/centers/:id/status
POST   /api/v1/centers/:id/check-availability
```

### Admin Endpoints
```
GET    /api/v1/admin/centers/:id/reservations
POST   /api/v1/admin/centers/reservations/:id/confirm
POST   /api/v1/admin/centers/reservations/:id/reject
```

## WebSocket Events

### Subscribe
```typescript
websocketService.on('capacity_updated', (data) => {
  console.log('Capacity updated:', data);
  // Update UI with new capacity
});
```

### Event Data
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

## Status Levels

| Status | Color | Condition | Percentage |
|--------|-------|-----------|------------|
| Available | 🟢 Green | > 25% capacity | > 25% |
| Limited | 🟡 Yellow | 5-25% capacity | 5-25% |
| Critical | 🔴 Red | < 5% capacity | < 5% |
| Full | ⚫ Gray | 0 slots | 0% |

## Reservation Status

| Status | Color | Description |
|--------|-------|-------------|
| Pending | 🟡 Yellow | Waiting for arrival (30 min timer) |
| Confirmed | 🔵 Blue | Admin confirmed arrival |
| Cancelled | ⚫ Gray | User or admin cancelled |
| Expired | 🔴 Red | 30 minutes passed without arrival |
| Arrived | 🟢 Green | User checked in at center |

## Business Rules

1. **Group Size**: 1-50 people per reservation
2. **Expiration**: Auto-cancels after 30 minutes
3. **Limit**: One active reservation per user per center
4. **Confirmation**: Only admin can confirm arrivals
5. **Capacity**: Available = Total - Occupied - Reserved

## Example Usage

### Create Reservation
```typescript
import reservationService from './services/reservation';

const reservation = await reservationService.createReservation(
  centerId: 1,
  {
    groupSize: 5,
    estimatedArrival: new Date().toISOString(),
    notes: 'Family of 5 with elderly member'
  }
);
```

### Get My Reservations
```typescript
const reservations = await reservationService.getMyReservations();
console.log('My reservations:', reservations);
```

### Cancel Reservation
```typescript
await reservationService.cancelReservation(
  reservationId: 123,
  reason: 'Plans changed'
);
```

### Check Availability
```typescript
const status = await reservationService.getCenterStatus(centerId: 1);
console.log('Available slots:', status.availableSlots);
console.log('Status level:', status.statusLevel);
console.log('My reservation:', status.myReservation);
```

## Components Usage

### Status Badge
```tsx
import CenterStatusBadge from './components/evacuation/CenterStatusBadge';

<CenterStatusBadge
  statusLevel="available"
  availableSlots={150}
  size="medium"
/>
```

### Countdown Timer
```tsx
import ReservationCountdown from './components/evacuation/ReservationCountdown';

<ReservationCountdown
  expiresAt={reservation.expiresAt}
  onExpired={() => console.log('Expired!')}
  size="medium"
/>
```

### Reservation Modal
```tsx
import ReservationModal from './components/evacuation/ReservationModal';

<ReservationModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  onSuccess={() => loadReservations()}
  centerId={1}
  centerName="Main Evacuation Center"
  availableSlots={150}
/>
```

### Reservation Card
```tsx
import ReservationCard from './components/evacuation/ReservationCard';

<ReservationCard
  reservation={reservation}
  onCancel={(id) => handleCancel(id)}
  onRefresh={() => loadReservations()}
/>
```

## Troubleshooting

### Reservation Not Creating
- Check backend is running
- Check auth token is valid
- Check available slots > group size
- Check no existing active reservation

### Countdown Not Updating
- Check expiresAt is valid ISO date string
- Check component is mounted
- Check interval is running

### WebSocket Not Updating
- Check WebSocket is connected
- Check auth token in WebSocket connection
- Check event handler is registered
- Check backend is broadcasting events

### Status Badge Wrong Color
- Check statusLevel value ('available', 'limited', 'critical', 'full')
- Check availableSlots is number
- Check backend calculation is correct

## Next Steps

1. **Find Center Details Screen** or create it
2. **Integrate ReservationModal** into Center Details
3. **Add Navigation** to My Reservations
4. **Test Complete Flow** end-to-end
5. **Build APK** and test on real device

## Files Reference

### Services
- `mobile/src/services/reservation.ts` - API client

### Components
- `mobile/src/components/evacuation/CenterStatusBadge.tsx`
- `mobile/src/components/evacuation/ReservationCountdown.tsx`
- `mobile/src/components/evacuation/ReservationModal.tsx`
- `mobile/src/components/evacuation/ReservationCard.tsx`

### Screens
- `mobile/src/screens/evacuation/MyReservationsScreen.tsx`

### Types
- `mobile/src/types/navigation.ts` - Updated with MyReservations

### WebSocket
- `mobile/src/services/websocket.service.ts` - Updated with capacity_updated

## Summary

Phase 2 Mobile UI is complete! All components are built and ready to use. Only integration tasks remain to connect everything together and test the complete flow.

