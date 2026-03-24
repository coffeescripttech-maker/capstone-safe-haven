# Incident Reporting Workflow - Mobile to Admin

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MOBILE APP (Citizen)                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1. User fills form
                                    │    - Incident type (damage, injury, etc.)
                                    │    - Severity (low, moderate, high, critical)
                                    │    - Target agency (PNP, BFP, MDRRMO, LGU)
                                    │    - Title & description
                                    │    - Photos (optional, max 5)
                                    │    - GPS location (auto-captured)
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  ReportIncidentScreen.tsx     │
                    │  - Validates form data        │
                    │  - Captures GPS coordinates   │
                    │  - Compresses photos (30%)    │
                    │  - Auto-suggests agency       │
                    └───────────────────────────────┘
                                    │
                                    │ 2. Submit via API
                                    │    POST /api/v1/incidents
                                    │    {
                                    │      incidentType, title, description,
                                    │      latitude, longitude, address,
                                    │      severity, photos, targetAgency
                                    │    }
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND API SERVER                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 3. API Route Handler
                                    │    incident.routes.ts
                                    │    - Authenticates user (JWT)
                                    │    - Checks permissions
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  incident.controller.ts       │
                    │  - Validates input data       │
                    │  - Checks incident type       │
                    │  - Validates severity level   │
                    │  - Validates target agency    │
                    └───────────────────────────────┘
                                    │
                                    │ 4. Create incident
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  incident.service.ts          │
                    │  - Finds agency admin user    │
                    │  - Inserts to database        │
                    │  - Sets status = 'pending'    │
                    │  - Assigns to agency admin    │
                    └───────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌─────────────────────┐       ┌─────────────────────┐
        │  MySQL Database     │       │  WebSocket Service  │
        │  incident_reports   │       │  - Broadcasts event │
        │  - id               │       │  - Sends to agency  │
        │  - user_id          │       │    admin users      │
        │  - incident_type    │       └─────────────────────┘
        │  - title            │                   │
        │  - description      │                   │
        │  - latitude         │                   │ 5. Real-time broadcast
        │  - longitude        │                   │    Event: 'new_incident'
        │  - address          │                   │    {
        │  - severity         │                   │      id, type, title,
        │  - status           │                   │      severity, location
        │  - photos (JSON)    │                   │    }
        │  - assigned_to      │                   │
        │  - created_at       │                   │
        └─────────────────────┘                   │
                                                  │
                                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         WEB ADMIN DASHBOARD                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌─────────────────────┐       ┌─────────────────────┐
        │  Polling Method     │       │  WebSocket Method   │
        │  (Every 15 seconds) │       │  (Real-time)        │
        └─────────────────────┘       └─────────────────────┘
                    │                               │
                    │ 6a. HTTP Polling              │ 6b. WebSocket listener
                    │     GET /api/v1/incidents     │     (if implemented)
                    │     ?status=pending           │
                    │     &limit=50                 │
                    │                               │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  IncidentNotificationBell.tsx │
                    │  - Checks for new incidents   │
                    │  - Filters by timestamp       │
                    │  - Shows ALL severities       │
                    │  - Updates unread count       │
                    │  - Plays notification sound   │
                    └───────────────────────────────┘
                                    │
                                    │ 7. Visual & Audio Alert
                                    │    - Badge count (orange)
                                    │    - Pulse animation
                                    │    - Notification sound
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  Admin sees notification      │
                    │  - Bell icon with badge       │
                    │  - Dropdown with details      │
                    │  - Click to view full report  │
                    └───────────────────────────────┘
                                    │
                                    │ 8. Admin clicks notification
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  /incidents/[id] page         │
                    │  - Full incident details      │
                    │  - Photos gallery             │
                    │  - Map with location          │
                    │  - Update status options      │
                    │  - Assign to responder        │
                    └───────────────────────────────┘
```

## Detailed Step-by-Step Process

### Step 1: Citizen Reports Incident (Mobile App)

**File:** `MOBILE_APP/mobile/src/screens/incidents/ReportIncidentScreen.tsx`

1. User opens "Report Incident" screen
2. Selects incident type:
   - 🏚️ Property Damage
   - 🚑 Injury/Casualty
   - 🔍 Missing Person
   - ⚠️ Hazard/Danger
   - 📝 Other

3. System auto-suggests target agency:
   - Damage → LGU
   - Injury → BFP
   - Missing Person → PNP
   - Hazard → BFP
   - Other → MDRRMO

4. User can override and select different agency:
   - 👮 PNP (Police matters)
   - 🚒 BFP (Fire & rescue)
   - 🆘 MDRRMO (Disaster response)
   - 🏛️ LGU (Local government)

5. Selects severity level:
   - 🟢 Low
   - 🟡 Moderate
   - 🟠 High
   - 🔴 Critical

6. Fills in details:
   - Title (required, max 100 chars)
   - Description (required, multiline)
   - Address (optional)
   - Photos (optional, max 5, compressed to 30%)

7. GPS location captured automatically

8. Clicks "Submit Report"

### Step 2: API Request

**Endpoint:** `POST http://192.168.43.25:3001/api/v1/incidents`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "incidentType": "damage",
  "title": "Collapsed building on Main Street",
  "description": "A two-story building has partially collapsed...",
  "latitude": 15.9754,
  "longitude": 120.5720,
  "address": "123 Main St, Barangay Centro, Dagupan City",
  "severity": "high",
  "photos": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  ],
  "targetAgency": "lgu"
}
```

### Step 3: Backend Processing

**File:** `MOBILE_APP/backend/src/controllers/incident.controller.ts`

1. Authenticates user via JWT token
2. Checks user has 'create' permission on 'incidents' resource
3. Validates all required fields
4. Validates incident type (damage, injury, missing_person, hazard, fire, other)
5. Validates severity (low, moderate, high, critical)
6. Validates target agency (pnp, bfp, mdrrmo, lgu)

**File:** `MOBILE_APP/backend/src/services/incident.service.ts`

7. Finds agency admin user:
   ```sql
   SELECT id FROM users WHERE role = 'lgu' LIMIT 1
   ```

8. Inserts incident to database:
   ```sql
   INSERT INTO incident_reports 
   (user_id, incident_type, title, description, latitude, longitude, 
    address, severity, photos, status, assigned_to)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
   ```

9. Sends notification to assigned agency admin:
   ```typescript
   await notificationService.sendIncidentNotification(
     assignedTo,
     { id, incidentType, title, severity, address },
     targetAgency
   );
   ```

10. Returns success response:
    ```json
    {
      "status": "success",
      "data": {
        "id": 123,
        "userId": 45,
        "incidentType": "damage",
        "title": "Collapsed building on Main Street",
        "severity": "high",
        "status": "pending",
        "assignedTo": 10,
        "createdAt": "2026-03-20T12:30:00.000Z"
      },
      "message": "Incident reported successfully"
    }
    ```

### Step 4: Real-Time Notification (WebSocket)

**File:** `MOBILE_APP/backend/src/services/websocket.service.ts`

If WebSocket is connected:
```typescript
// Broadcast to agency admin users
io.to(`user_${assignedTo}`).emit('new_incident', {
  id: 123,
  type: 'damage',
  title: 'Collapsed building on Main Street',
  severity: 'high',
  location: '123 Main St, Barangay Centro',
  createdAt: '2026-03-20T12:30:00.000Z'
});
```

### Step 5: Admin Receives Notification (Web Dashboard)

**File:** `MOBILE_APP/web_app/src/components/header/IncidentNotificationBell.tsx`

#### Method A: HTTP Polling (Current Implementation)

Every 15 seconds:
```typescript
const checkForNewIncidents = async () => {
  // Fetch pending incidents
  const response = await incidentsApi.getAll({ 
    status: 'pending',
    limit: 50
  });
  
  // Filter incidents created after last check
  const newIncidentsFound = incidents.filter((incident) => {
    const incidentTime = new Date(incident.createdAt);
    return incidentTime > lastCheckTime;
  });
  
  if (newIncidentsFound.length > 0) {
    // Play notification sound
    playNotificationSound();
    
    // Update UI
    setNewIncidents([...newIncidentsFound, ...prev]);
    setUnreadCount(prev => prev + newIncidentsFound.length);
  }
};
```

#### Method B: WebSocket (If Implemented)

```typescript
// Listen for real-time events
socket.on('new_incident', (incident) => {
  playNotificationSound();
  setNewIncidents([incident, ...prev]);
  setUnreadCount(prev => prev + 1);
});
```

### Step 6: Visual Notification

**UI Elements:**

1. **Bell Icon** (FileText icon)
   - Orange color on hover
   - Located in header

2. **Badge Count**
   - Red circle with number
   - Shows "9+" if more than 9
   - Pulse animation

3. **Notification Sound**
   - Plays `/notification-sound.mp3`
   - Fallback: Web Audio API beep (600Hz sine wave)

4. **Dropdown Panel**
   - Shows last 10 incidents
   - Each incident shows:
     - Severity indicator (colored badge)
     - Title and description
     - Incident type icon
     - Time (e.g., "5m ago")
     - Location indicator
     - "View" button

### Step 7: Admin Views Incident

**Navigation:** Click notification → `/incidents/[id]`

**File:** `MOBILE_APP/web_app/src/app/(admin)/incidents/[id]/page.tsx`

**Displays:**
- Full incident details
- Reporter information (name, phone)
- Photos gallery
- Interactive map with marker
- Status update dropdown
- Assign to responder
- Action buttons (Verify, Resolve, Delete)

### Step 8: Admin Takes Action

**Available Actions:**

1. **Update Status:**
   - Pending → Verified
   - Verified → In Progress
   - In Progress → Resolved

2. **Assign to Responder:**
   - Select from agency team members

3. **Add Notes:**
   - Internal comments
   - Response actions taken

4. **Contact Reporter:**
   - Phone number displayed
   - Click to call

## Key Features

### 🔔 Real-Time Notifications
- Polling every 15 seconds
- WebSocket support (if enabled)
- Instant visual and audio alerts

### 🎯 Smart Agency Routing
- Auto-suggests appropriate agency
- User can override selection
- Incident assigned to agency admin

### 📍 Location Tracking
- GPS coordinates captured automatically
- Address field optional
- Map display in admin panel

### 📸 Photo Evidence
- Up to 5 photos
- Compressed to 30% quality
- Base64 encoded
- Stored as JSON in database

### 🔐 Security & Permissions
- JWT authentication required
- Role-based access control (RBAC)
- Citizens can only see their own reports
- Agency admins see assigned incidents
- MDRRMO sees all incidents

### 📊 Severity Levels
- **Low:** Minor issues, no immediate danger
- **Moderate:** Requires attention, not urgent
- **High:** Urgent, potential danger
- **Critical:** Life-threatening, immediate response needed

### 🏢 Target Agencies
- **PNP:** Police matters, security, missing persons
- **BFP:** Fire, rescue, hazards
- **MDRRMO:** Disaster response, coordination
- **LGU:** Infrastructure, local government services

## Database Schema

```sql
CREATE TABLE incident_reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  incident_type ENUM('damage', 'injury', 'missing_person', 'hazard', 'fire', 'other'),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address VARCHAR(255),
  severity ENUM('low', 'moderate', 'high', 'critical') NOT NULL,
  status ENUM('pending', 'verified', 'in_progress', 'resolved') DEFAULT 'pending',
  photos JSON,
  assigned_to INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);
```

## API Endpoints

### Create Incident
```
POST /api/v1/incidents
Authorization: Bearer <token>
Permission: incidents:create
```

### Get All Incidents
```
GET /api/v1/incidents?status=pending&limit=50
Authorization: Bearer <token>
Permission: incidents:read
```

### Get Incident by ID
```
GET /api/v1/incidents/:id
Authorization: Bearer <token>
Permission: incidents:read
```

### Update Incident Status
```
PATCH /api/v1/incidents/:id/status
Authorization: Bearer <token>
Permission: incidents:update
Body: { status: 'verified', assignedTo: 10 }
```

### Get My Incidents (Citizen)
```
GET /api/v1/incidents/my
Authorization: Bearer <token>
```

## Testing the Flow

### 1. Test from Mobile App
```bash
# Login as citizen
Email: citizen@test.com
Password: password123

# Go to "Report Incident"
# Fill form and submit
```

### 2. Monitor Backend Logs
```bash
cd MOBILE_APP/backend
npm run dev

# Watch for:
# ✅ Incident created: ID 123
# ✅ Assigned to LGU admin (user ID: 10)
# ✅ Notification sent to LGU
```

### 3. Check Admin Dashboard
```bash
# Login as agency admin
Email: lgu@test.com
Password: password123

# Watch for:
# 🔔 Bell icon shows badge count
# 🔊 Notification sound plays
# 📋 Dropdown shows new incident
```

### 4. Verify Database
```sql
SELECT * FROM incident_reports 
WHERE status = 'pending' 
ORDER BY created_at DESC 
LIMIT 10;
```

## Performance Considerations

### Mobile App
- Photos compressed to 30% quality
- Max 5 photos per report
- Offline queue support
- GPS timeout: 10 seconds

### Backend
- Database indexed on: status, created_at, assigned_to
- Photos stored as JSON (consider moving to S3 for production)
- WebSocket rooms per user for targeted notifications

### Web Dashboard
- Polling interval: 15 seconds (configurable)
- Max 50 incidents fetched per poll
- Dropdown shows last 10 incidents
- Sound plays once per batch

## Future Enhancements

1. **Push Notifications** (Web Push API)
2. **SMS Alerts** to agency admins
3. **Email Notifications** with incident details
4. **Photo Upload to Cloud Storage** (S3/Cloudinary)
5. **Video Support** for incident evidence
6. **Voice Notes** for quick reporting
7. **Incident Categories** with custom fields
8. **Response Time Tracking** and SLA monitoring
9. **Citizen Feedback** on resolution
10. **Analytics Dashboard** for incident trends
