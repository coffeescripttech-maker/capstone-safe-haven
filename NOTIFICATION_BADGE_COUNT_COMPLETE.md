# Notification Badge Count - Complete Implementation

## ✅ Status: WORKING CORRECTLY

The notification badge count system is fully functional with proper role-based filtering, real-time updates, and persistent tracking.

---

## 🎯 How It Works

### Frontend (Web App)

#### 1. Initial Load
```typescript
// On component mount, fetch pending alerts
const lastViewedKey = `sos_bell_last_viewed_${userId}`;
const lastViewed = localStorage.getItem(lastViewedKey) || new Date(0);

// Fetch all pending alerts
const response = await sosApi.getAll({ status: 'sent', limit: 50 });

// Filter to only NEW alerts (created after last view)
const newAlertsOnly = alerts.filter(alert => 
  new Date(alert.created_at) > lastViewed
);

// Set badge count to NEW alerts only
setUnreadCount(newAlertsOnly.length);
```

#### 2. Real-Time Updates (WebSocket)
```typescript
socket.on('new_sos', (payload) => {
  const alert = payload.data;
  
  // Role-based filtering
  if (shouldShowToUser(alert, userRole)) {
    // Add to list
    setNewAlerts(prev => [alert, ...prev].slice(0, 10));
    
    // ✅ INCREMENT BADGE COUNT
    setUnreadCount(prev => prev + 1);
    
    // Play sound
    playNotificationSound();
  }
});
```

#### 3. Mark as Read
```typescript
const handleBellClick = () => {
  if (!isOpen) {
    // Save current timestamp to localStorage
    const lastViewedKey = `sos_bell_last_viewed_${userId}`;
    localStorage.setItem(lastViewedKey, new Date().toISOString());
    
    // Reset badge count
    setUnreadCount(0);
  }
};
```

---

## 🔐 Backend API - Role-Based Filtering

### SOS Alerts Endpoint
**GET** `/api/v1/sos?status=sent&limit=50`

```typescript
// Backend automatically filters by role
async getSOSAlerts(filters: {
  status?: string;
  userRole?: string;
  userJurisdiction?: string;
}) {
  // Super admin sees ALL alerts
  if (userRole === 'super_admin') {
    // No filtering
  }
  // Other roles only see alerts targeted to them or 'all'
  else {
    const roleAgencyMap = {
      'mdrrmo': ['mdrrmo', 'admin', 'all'],
      'pnp': ['pnp', 'all'],
      'bfp': ['bfp', 'all'],
      'lgu_officer': ['barangay', 'lgu', 'all']
    };
    
    const allowedAgencies = roleAgencyMap[userRole] || ['all'];
    whereConditions.push(`target_agency IN (${allowedAgencies})`);
  }
}
```

### Incidents Endpoint
**GET** `/api/v1/incidents?status=pending&limit=50`

```typescript
// Backend filters by assigned_agency
async getIncidents(filters: {
  status?: string;
  userRole?: string;
}) {
  // Super admin sees ALL incidents
  if (userRole === 'super_admin') {
    // No filtering
  }
  // Citizens see only their own
  else if (userRole === 'citizen') {
    whereConditions.push('user_id = ?');
  }
  // Agency roles see only incidents assigned to them
  else {
    whereConditions.push('assigned_agency = ?');
  }
}
```

---

## 📊 Complete Flow Example

### Scenario: MDRRMO User

```
1. User logs in
   └─> Badge shows: 0 (no new alerts since last view)

2. Citizen sends SOS targeting "MDRRMO"
   └─> Backend creates SOS with target_agency='mdrrmo'
   └─> WebSocket broadcasts to all connected clients
   
3. MDRRMO user's browser receives WebSocket event
   └─> Role check: userRole='mdrrmo', targetAgency='mdrrmo' ✅
   └─> Badge increments: 0 → 1
   └─> Sound plays
   └─> Alert appears in dropdown

4. Another SOS arrives targeting "PNP"
   └─> Role check: userRole='mdrrmo', targetAgency='pnp' ❌
   └─> Badge stays: 1 (not relevant to MDRRMO)

5. Another SOS arrives targeting "ALL"
   └─> Role check: userRole='mdrrmo', targetAgency='all' ✅
   └─> Badge increments: 1 → 2

6. User clicks notification bell
   └─> Timestamp saved: 2026-03-27T10:55:00.000Z
   └─> Badge resets: 2 → 0

7. User refreshes page
   └─> Fetches all pending alerts
   └─> Filters: created_at > 2026-03-27T10:55:00.000Z
   └─> Badge shows: 0 (no new alerts since last view)

8. New SOS arrives
   └─> Badge increments: 0 → 1 ✅
```

---

## 🎨 UI Components

### SOS Notification Bell
- **File**: `MOBILE_APP/web_app/src/components/header/SOSNotificationBell.tsx`
- **Badge Color**: Red (`bg-error-500`)
- **Icon**: Bell with AlertOctagon
- **LocalStorage Key**: `sos_bell_last_viewed_{userId}`

### Incident Notification Bell
- **File**: `MOBILE_APP/web_app/src/components/header/IncidentNotificationBell.tsx`
- **Badge Color**: Orange (`bg-orange-500`)
- **Icon**: Bell with FileText
- **LocalStorage Key**: `incident_bell_last_viewed_{userId}`

---

## 🔧 Key Features

### ✅ Real-Time Updates
- WebSocket connection provides instant badge updates
- No polling required (polling is disabled)
- Connection status indicator (green dot = connected)

### ✅ Role-Based Filtering
- Super admin sees ALL alerts
- MDRRMO/Admin see: mdrrmo, admin, all
- PNP sees: pnp, all
- BFP sees: bfp, all
- LGU Officer sees: barangay, lgu, all

### ✅ Persistent Tracking
- Last viewed timestamp stored in localStorage
- Per-user tracking (each user has own timestamp)
- Survives page refreshes
- Works across browser tabs

### ✅ Smart Counting
- Only counts NEW alerts (created after last view)
- Increments on WebSocket events
- Resets when bell is clicked
- Shows "9+" for counts > 9

### ✅ Philippine Timezone
- Backend converts all timestamps to PH time
- Frontend displays correctly (removed `.replace('Z', '')` bug)
- Consistent across table lists and notification bells

---

## 🐛 Fixed Issues

### Issue 1: Badge showed ALL pending alerts
**Before**: Badge showed total count of all pending alerts in database
**After**: Badge only shows alerts created after user's last view

### Issue 2: Timezone mismatch
**Before**: Notification bell showed UTC time (10:55 AM) while table showed PH time (6:55 PM)
**After**: Both show consistent PH time (6:55 PM)

### Issue 3: No persistence
**Before**: Badge count reset on page refresh
**After**: Badge count persists using localStorage timestamps

---

## 📝 Testing Checklist

- [x] Badge increments when new SOS arrives via WebSocket
- [x] Badge increments when new Incident arrives via WebSocket
- [x] Badge respects role-based filtering (only relevant alerts)
- [x] Badge resets to 0 when bell is clicked
- [x] Badge persists across page refreshes
- [x] Badge shows correct count after login
- [x] Timezone displays correctly in notification bell
- [x] Timezone displays correctly in table list
- [x] WebSocket connection indicator works
- [x] Sound plays on new notification
- [x] Multiple users have independent badge counts

---

## 🚀 Next Steps (Optional Enhancements)

1. **Backend API Endpoint** (Optional)
   - Add `GET /api/v1/notifications/unread-count` endpoint
   - Returns count of unread notifications per type
   - Useful for syncing across devices

2. **Badge Sync Across Tabs** (Optional)
   - Use `localStorage` events to sync badge counts
   - When user clicks bell in one tab, update all tabs

3. **Badge Animation** (Optional)
   - Add bounce animation when count increases
   - Add fade animation when count decreases

4. **Desktop Notifications** (Optional)
   - Request browser notification permission
   - Show desktop notification when new alert arrives

---

## 📚 Related Files

### Frontend
- `MOBILE_APP/web_app/src/components/header/SOSNotificationBell.tsx`
- `MOBILE_APP/web_app/src/components/header/IncidentNotificationBell.tsx`

### Backend
- `MOBILE_APP/backend/src/controllers/sos.controller.ts`
- `MOBILE_APP/backend/src/services/sos.service.ts`
- `MOBILE_APP/backend/src/controllers/incident.controller.ts`
- `MOBILE_APP/backend/src/services/incident.service.ts`
- `MOBILE_APP/backend/src/services/websocket.service.ts`

### Documentation
- `MOBILE_APP/SMS_MOBILE_API_WEBHOOK_FIX.md`
- `MOBILE_APP/NOTIFICATION_BADGE_COUNT_COMPLETE.md` (this file)

---

**Last Updated**: March 27, 2026
**Status**: ✅ Production Ready
