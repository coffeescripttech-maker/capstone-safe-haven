# SOS Function - Complete Explanation

## Overview

The SOS feature allows citizens to send emergency alerts to specific agencies or all agencies at once. It's a one-tap emergency button that sends location, user info, and a distress message to responders.

---

## User Side (Mobile App)

### 1. SOS Button Location

The SOS button is located in the **center of the bottom tab bar** (between Alerts and Centers tabs).

**File:** `MOBILE_APP/mobile/src/components/home/SOSButton.tsx`

### 2. How It Works (User Flow)

#### Step 1: User Presses SOS Button
- Red circular button with "SOS" text
- Pulsing animation to draw attention
- Vibrates on press for haptic feedback

#### Step 2: Confirmation Modal Opens
User sees:
- Warning icon
- "Send Emergency Alert?" title
- **Agency Selection Grid** with 6 options:
  - 🚨 All Agencies (default)
  - 🏘️ Barangay
  - 🏛️ LGU
  - 🚒 BFP (Fire)
  - 👮 PNP (Police)
  - ⚠️ MDRRMO (Disaster)
- Location warning (if GPS is off)
- "Send SOS" and "Cancel" buttons

#### Step 3: User Selects Agency
- Tap on any agency card to select
- Selected card turns red with red border
- Can change selection before confirming

#### Step 4: User Confirms
- Taps "Send SOS" button
- 3-second countdown starts (3... 2... 1...)
- Vibrates each second
- Can cancel during countdown

#### Step 5: SOS Sent
- API call to backend: `POST /api/v1/sos`
- Success vibration pattern
- Alert: "SOS Sent! Your emergency alert has been sent to authorities..."
- Modal closes

### 3. Data Sent to Backend

```typescript
{
  latitude: 14.5995,        // User's GPS coordinates (if available)
  longitude: 120.9842,
  message: 'Emergency! I need help!',
  targetAgency: 'pnp',      // Selected agency or 'all'
  userInfo: {
    name: 'Juan Dela Cruz',  // From user profile
    phone: '09171234567'     // From user profile
  }
}
```

### 4. What Happens After Sending

The user can:
- View their sent SOS alerts in "My Alerts" section
- See status updates (sent → acknowledged → responding → resolved)
- Receive notifications when responders acknowledge/respond

---

## Backend API

### 1. Create SOS Alert

**Endpoint:** `POST /api/v1/sos`

**Authentication:** Required (JWT token)

**Permission:** `sos_alerts:create` (citizens have this)

**Request Body:**
```json
{
  "latitude": 14.5995,
  "longitude": 120.9842,
  "message": "Emergency! I need help!",
  "targetAgency": "pnp",
  "userInfo": {
    "name": "Juan Dela Cruz",
    "phone": "09171234567"
  }
}
```

**Validation:**
- `message`: Required
- `userInfo.name`: Required
- `targetAgency`: Must be one of: `['barangay', 'lgu', 'bfp', 'pnp', 'mdrrmo', 'all']`
- `latitude/longitude`: Optional (but recommended)

**Response (201):**
```json
{
  "status": "success",
  "message": "SOS alert sent successfully",
  "data": {
    "id": 123,
    "status": "sent",
    "targetAgency": "pnp",
    "createdAt": "2026-03-25T10:30:00.000Z"
  }
}
```

### 2. What Backend Does

**File:** `MOBILE_APP/backend/src/services/sos.service.ts`

#### Step 1: Save to Database
```sql
INSERT INTO sos_alerts (
  user_id, 
  latitude, 
  longitude, 
  message, 
  user_info, 
  status, 
  priority, 
  target_agency
) VALUES (?, ?, ?, ?, ?, 'sent', 'high', ?)
```

#### Step 2: Broadcast via WebSocket
- Sends real-time notification to all connected web app users
- Event: `new_sos`
- Payload includes: alert ID, user info, location, target agency
- **Role-based filtering**: Only relevant agencies receive the notification

#### Step 3: Send Notifications (Async)

The backend sends notifications to:

**A. Emergency Services (911)**
- Always notified for critical emergencies
- Method: Call

**B. User's Emergency Contact**
- From user profile (`emergency_contact_phone`)
- Method: SMS

**C. Target Agency Responders**

If `targetAgency = 'all'`:
- Notifies ALL agencies: Barangay, LGU, BFP, PNP, MDRRMO, Admin

If `targetAgency = 'pnp'`:
- Notifies PNP responders only
- Also notifies Admin (always included)

If `targetAgency = 'barangay'` or `'lgu'`:
- Notifies LGU officers
- Also notifies Admin

**D. Nearby Responders (within 10km)**
- Uses Haversine formula to find responders near the SOS location
- Filtered by target agency
- Sorted by distance
- Limit: 10 closest responders

### 3. Database Tables

**sos_alerts table:**
```sql
CREATE TABLE sos_alerts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  message TEXT NOT NULL,
  user_info JSON,                    -- {name, phone}
  status ENUM('sent', 'acknowledged', 'responding', 'resolved', 'cancelled'),
  priority ENUM('low', 'medium', 'high', 'critical'),
  target_agency VARCHAR(50),         -- 'pnp', 'bfp', 'mdrrmo', 'lgu', 'barangay', 'all'
  responder_id INT,
  response_time TIMESTAMP,
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**sos_notifications table:**
```sql
CREATE TABLE sos_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sos_alert_id INT NOT NULL,
  recipient_type ENUM('emergency_services', 'emergency_contact', 'responder', 'admin'),
  recipient_id INT,                  -- User ID if responder/admin
  recipient_info JSON,               -- Contact details
  notification_method ENUM('push', 'sms', 'email', 'call'),
  status ENUM('pending', 'sent', 'delivered', 'failed'),
  sent_at TIMESTAMP
);
```

---

## Responder Side (Web App)

### 1. Real-Time Notification

When a citizen sends SOS, responders see:

**A. WebSocket Event**
- Event: `new_sos`
- Received by: `SOSNotificationBell.tsx`
- Filtered by: `target_agency` field

**B. Notification Bell**
- Red bell icon in header
- Badge shows unread count
- Plays notification sound
- Shows alert preview with:
  - User name
  - Message
  - Time (PH timezone)
  - Target agency badge
  - Location indicator

**C. Role-Based Filtering**

```typescript
// ONLY super_admin sees ALL alerts
if (userRole === 'super_admin') {
  shouldShow = true;
}
// Each agency ONLY sees alerts targeted to them or 'all'
else if (userRole === 'pnp') {
  shouldShow = targetAgency === 'pnp' || targetAgency === 'all';
}
else if (userRole === 'bfp') {
  shouldShow = targetAgency === 'bfp' || targetAgency === 'all';
}
else if (userRole === 'mdrrmo') {
  shouldShow = targetAgency === 'mdrrmo' || targetAgency === 'all';
}
else if (userRole === 'lgu_officer') {
  shouldShow = targetAgency === 'barangay' || targetAgency === 'lgu' || targetAgency === 'all';
}
```

### 2. SOS Detail Page

**URL:** `/sos-alerts/[id]`

Responders can:
- View full alert details
- See user location on map
- Update status (acknowledged → responding → resolved)
- Add resolution notes
- View response timeline

### 3. SOS List Page

**URL:** `/sos-alerts`

Shows all SOS alerts filtered by:
- User's role (only see relevant alerts)
- Status (sent, acknowledged, responding, resolved)
- Priority (low, medium, high, critical)
- Date range

---

## Complete Flow Example

### Scenario: Citizen Reports Fire Emergency

**1. Citizen (Mobile App)**
```
User presses SOS button
→ Selects "BFP" (Fire)
→ Confirms
→ 3-second countdown
→ SOS sent with location
```

**2. Backend Processing**
```
Receives POST /api/v1/sos
→ Validates data
→ Saves to sos_alerts table (status='sent', target_agency='bfp')
→ Broadcasts via WebSocket (event: 'new_sos')
→ Sends notifications:
   - 911 emergency services (call)
   - User's emergency contact (SMS)
   - All BFP responders (push notification)
   - Admin users (push notification)
   - Nearby BFP responders within 10km (push notification)
```

**3. BFP Responder (Web App)**
```
WebSocket receives 'new_sos' event
→ Checks: target_agency = 'bfp' ✅ (matches role)
→ Shows notification bell badge
→ Plays notification sound
→ Displays alert in bell dropdown
→ Responder clicks "View Details"
→ Opens /sos-alerts/123
→ Sees location on map
→ Updates status to "acknowledged"
→ Updates status to "responding"
→ Arrives at scene
→ Updates status to "resolved" with notes
```

**4. Other Agencies**
```
PNP responder: target_agency = 'bfp' ❌ (doesn't match)
→ Does NOT see the alert

MDRRMO responder: target_agency = 'bfp' ❌ (doesn't match)
→ Does NOT see the alert

Super Admin: ✅ Sees ALL alerts regardless of target
```

---

## Key Features

### 1. Agency Selection
- User chooses which agency to notify
- Prevents overwhelming all agencies with every alert
- Faster response from the right agency

### 2. Location Sharing
- Automatically includes GPS coordinates
- Responders see exact location on map
- Works even without location (sends without coordinates)

### 3. Real-Time Updates
- WebSocket broadcasts to all connected responders
- Instant notification (no polling delay)
- Role-based filtering ensures privacy

### 4. Multi-Channel Notifications
- Push notifications (web app)
- SMS (emergency contact)
- Call (911 for critical)
- Email (admins)

### 5. Status Tracking
- sent → acknowledged → responding → resolved
- Response time tracking
- Resolution notes

### 6. Nearby Responders
- Finds responders within 10km radius
- Sorted by distance
- Filtered by target agency

---

## API Endpoints

### Create SOS
```
POST /api/v1/sos
Auth: Required
Permission: sos_alerts:create
Body: { latitude, longitude, message, targetAgency, userInfo }
```

### Get My SOS Alerts
```
GET /api/v1/sos/my-alerts?page=1&limit=20&status=sent
Auth: Required
Returns: User's own SOS alerts
```

### Get All SOS Alerts (Responders)
```
GET /api/v1/sos?page=1&limit=20&status=sent&priority=high
Auth: Required
Permission: sos_alerts:read
Returns: Filtered by role and target_agency
```

### Get SOS by ID
```
GET /api/v1/sos/:id
Auth: Required
Permission: sos_alerts:read
Returns: Single SOS alert details
```

### Update SOS Status
```
PATCH /api/v1/sos/:id/status
Auth: Required
Permission: sos_alerts:update
Body: { status: 'acknowledged', notes: 'On the way' }
```

### Get SOS Statistics
```
GET /api/v1/sos/statistics
Auth: Required
Returns: Stats filtered by user role
```

---

## Code Files

### Mobile App (User Side)
- `MOBILE_APP/mobile/src/components/home/SOSButton.tsx` - SOS button UI
- `MOBILE_APP/mobile/src/components/navigation/CustomTabBar.tsx` - Tab bar with SOS button
- `MOBILE_APP/mobile/src/services/api.ts` - API client

### Backend (API)
- `MOBILE_APP/backend/src/routes/sos.routes.ts` - API routes
- `MOBILE_APP/backend/src/controllers/sos.controller.ts` - Request handlers
- `MOBILE_APP/backend/src/services/sos.service.ts` - Business logic
- `MOBILE_APP/backend/src/services/websocket.service.ts` - Real-time broadcasting

### Web App (Responder Side)
- `MOBILE_APP/web_app/src/components/header/SOSNotificationBell.tsx` - Notification bell
- `MOBILE_APP/web_app/src/app/(admin)/sos-alerts/page.tsx` - SOS list page
- `MOBILE_APP/web_app/src/app/(admin)/sos-alerts/[id]/page.tsx` - SOS detail page

### Database
- `MOBILE_APP/database/sos_alerts.sql` - Table schema
- `MOBILE_APP/database/migrations/011_add_target_agency_to_sos.sql` - Target agency migration

---

## Testing

### Test SOS Flow

**1. Send SOS from Mobile App**
```
1. Login as citizen
2. Press SOS button (center of tab bar)
3. Select "PNP" as target agency
4. Tap "Send SOS"
5. Wait for 3-second countdown
6. Should see "SOS Sent!" success message
```

**2. Verify Backend Received**
```powershell
# Check database
mysql -u root -p safehaven_db
SELECT * FROM sos_alerts ORDER BY created_at DESC LIMIT 1;

# Should see:
# - user_id: Your user ID
# - target_agency: 'pnp'
# - status: 'sent'
# - priority: 'high'
# - message: 'Emergency! I need help!'
```

**3. Verify Responder Notification**
```
1. Login to web app as PNP user
2. Should see red notification bell with badge
3. Click bell to see SOS alert
4. Should show user name, message, time, location
5. Click "View Details" to open detail page
```

**4. Test Role-Based Filtering**
```
Scenario: Citizen sends SOS to BFP

✅ BFP user: Sees the alert (target matches)
❌ PNP user: Does NOT see (target doesn't match)
❌ MDRRMO user: Does NOT see (target doesn't match)
✅ Super Admin: Sees the alert (sees all)
```

**5. Test "All Agencies" Option**
```
Scenario: Citizen sends SOS to "All Agencies"

✅ BFP user: Sees the alert (target = 'all')
✅ PNP user: Sees the alert (target = 'all')
✅ MDRRMO user: Sees the alert (target = 'all')
✅ LGU user: Sees the alert (target = 'all')
✅ Super Admin: Sees the alert (sees all)
```

---

## Key Differences: SOS vs Incident Report

| Feature | SOS Alert | Incident Report |
|---------|-----------|-----------------|
| **Purpose** | Immediate emergency | Non-urgent reporting |
| **Speed** | One-tap (3 seconds) | Multi-step form |
| **Priority** | Always HIGH | User selects (low/moderate/high/critical) |
| **Location** | Auto-included | Auto-included |
| **Photos** | Not supported | Up to 5 photos |
| **Title** | Fixed message | User enters custom title |
| **Description** | Fixed message | User enters detailed description |
| **Agency** | Select before sending | Select before sending |
| **Notifications** | Multi-channel (push, SMS, call) | Push only |
| **Response** | Real-time tracking | Status updates |
| **Use Case** | Life-threatening emergency | Property damage, hazards, etc. |

---

## Notification Flow

### When Citizen Sends SOS to PNP

```
Mobile App (Citizen)
    ↓ POST /api/v1/sos { targetAgency: 'pnp' }
    
Backend API
    ↓ Save to sos_alerts table
    ↓ Broadcast via WebSocket (event: 'new_sos')
    ↓ Send notifications:
        → 911 emergency services (call)
        → User's emergency contact (SMS)
        → All PNP responders (push)
        → Admin users (push)
        → Nearby PNP responders within 10km (push)
    
Web App (PNP Responder)
    ↓ WebSocket receives 'new_sos' event
    ↓ Checks: target_agency = 'pnp' ✅
    ↓ Shows notification bell badge
    ↓ Plays notification sound
    ↓ Displays in bell dropdown
    
PNP Responder Actions
    ↓ Clicks "View Details"
    ↓ Opens /sos-alerts/123
    ↓ Updates status to "acknowledged"
    ↓ Updates status to "responding"
    ↓ Arrives at scene
    ↓ Updates status to "resolved"
```

---

## Status Lifecycle

```
sent (initial)
    ↓
acknowledged (responder saw it)
    ↓
responding (responder is on the way)
    ↓
resolved (emergency handled)
```

Or:

```
sent
    ↓
cancelled (false alarm)
```

---

## Common Issues

### Issue 1: "Location not available"
**Cause:** GPS is off or permissions denied
**Impact:** SOS sent without coordinates
**Fix:** Enable location services before sending

### Issue 2: "Failed to send SOS alert"
**Cause:** Network error or backend down
**Impact:** SOS not sent
**Fix:** Try again or call emergency services directly

### Issue 3: Responder doesn't see alert
**Cause:** Wrong target agency selected
**Example:** Citizen selected BFP, but PNP responder is logged in
**Fix:** Citizen should select correct agency or "All Agencies"

---

## Summary

The SOS function is a **one-tap emergency button** that:
1. Lets citizens select which agency to notify
2. Sends location and user info to backend
3. Backend broadcasts to relevant responders via WebSocket
4. Responders see real-time notification in web app
5. Responders can track and update status
6. Multi-channel notifications ensure help arrives quickly

It's designed for **life-threatening emergencies** where speed matters more than detailed reporting.

---

**Date:** March 25, 2026
**Purpose:** Explain SOS function for user and responder sides
