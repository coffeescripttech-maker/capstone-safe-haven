# Web Portal - Evacuation Center Reservations Feature

## Overview
Implement admin interface for managing evacuation center reservations in the web portal.

## Features to Implement

### 1. Reservations Management Page (Priority 1)
**Route**: `/evacuation-centers/reservations`

**Features**:
- View all reservations across all centers
- Filter by status: All, Pending, Confirmed, Cancelled, Expired, Arrived
- Filter by center
- Search by user name/phone
- Sort by date, status, center
- Real-time updates via WebSocket
- Bulk actions (confirm multiple, reject multiple)

**Actions**:
- Confirm reservation (mark as confirmed)
- Reject reservation (with reason)
- Mark as arrived (user checked in)
- View user details
- View center details

**Display Info**:
- Reservation ID
- User name, phone, email
- Center name
- Group size
- Status badge (color-coded)
- Estimated arrival time
- Reserved at timestamp
- Expires at timestamp (with countdown for pending)
- Actions buttons

### 2. Center-Specific Reservations View
**Route**: `/evacuation-centers/[id]/reservations`

**Features**:
- View reservations for specific center
- Same filtering/sorting as main page
- Quick confirm/reject actions
- Capacity overview at top

### 3. Evacuation Centers List Enhancement
**Route**: `/evacuation-centers`

**Add**:
- Reserved slots column
- Pending reservations count
- Quick link to center reservations

### 4. Real-Time Updates
- WebSocket integration for live updates
- Auto-refresh when reservations change
- Notification badges for new pending reservations

## Implementation Plan

### Phase 1: Backend API Integration (Already Done ✅)
- ✅ Backend routes exist: `/api/v1/centers/:id/reservations`
- ✅ Admin endpoints: confirm, reject, list
- ✅ WebSocket events: `capacity_updated`

### Phase 2: Web Portal Pages (To Do)
1. Create reservations management page
2. Add API client functions
3. Implement real-time updates
4. Add filtering and search
5. Create reservation detail modal
6. Add bulk actions

### Phase 3: UI Components (To Do)
1. ReservationTable component
2. ReservationStatusBadge component
3. ReservationFilters component
4. ConfirmRejectModal component
5. CountdownTimer component

### Phase 4: Integration (To Do)
1. Add sidebar menu item
2. Connect WebSocket
3. Add notification badges
4. Test end-to-end flow

## Files to Create/Modify

### New Files:
1. `web_app/src/app/(admin)/evacuation-centers/reservations/page.tsx` - Main reservations page
2. `web_app/src/app/(admin)/evacuation-centers/[id]/reservations/page.tsx` - Center-specific reservations
3. `web_app/src/components/reservations/ReservationTable.tsx` - Table component
4. `web_app/src/components/reservations/ReservationStatusBadge.tsx` - Status badge
5. `web_app/src/components/reservations/ReservationFilters.tsx` - Filters
6. `web_app/src/components/reservations/ConfirmRejectModal.tsx` - Action modal
7. `web_app/src/lib/reservation-api.ts` - API client

### Files to Modify:
1. `web_app/src/layout/AppSidebar.tsx` - Add menu item
2. `web_app/src/app/(admin)/evacuation-centers/page.tsx` - Add reserved slots column

## API Endpoints (Backend)

### Admin Endpoints:
- `GET /api/v1/centers/:id/reservations` - Get center reservations
- `POST /api/v1/centers/reservations/:id/confirm` - Confirm reservation
- `POST /api/v1/centers/reservations/:id/reject` - Reject reservation

### WebSocket Events:
- `capacity_updated` - When reservation created/cancelled/confirmed

## UI Design

### Reservations Table Columns:
1. ID
2. User (name + phone)
3. Center
4. Group Size
5. Status (badge)
6. Reserved At
7. Expires At / Arrival Time
8. Actions (Confirm/Reject/View)

### Status Colors:
- Pending: Yellow/Orange
- Confirmed: Blue
- Arrived: Green
- Cancelled: Gray
- Expired: Red

### Filters:
- Status dropdown
- Center dropdown
- Date range picker
- Search input (user name/phone)

## Next Steps

1. Create API client (`reservation-api.ts`)
2. Create main reservations page
3. Add sidebar menu item
4. Test with existing reservations
5. Add real-time updates
6. Polish UI and add loading states

---

**Status**: Ready to implement
**Priority**: High
**Estimated Time**: 2-3 hours
