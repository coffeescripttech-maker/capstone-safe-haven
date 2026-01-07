# Family/Group Locator - Implementation Plan

## Overview
Enable families to create groups, share real-time locations, and send emergency alerts to each other during disasters.

## Phase 1: Database & Backend (Priority)

### Database Tables ✅
- `groups` - Family/group information
- `group_members` - Members and their roles
- `location_shares` - Location history
- `group_alerts` - Emergency broadcasts

### Backend Services (To Do)
- `backend/src/services/group.service.ts`
- `backend/src/controllers/group.controller.ts`
- `backend/src/routes/group.routes.ts`

### API Endpoints
```
POST   /api/v1/groups              - Create group
POST   /api/v1/groups/join         - Join with invite code
GET    /api/v1/groups/my           - Get user's groups
GET    /api/v1/groups/:id          - Get group details
GET    /api/v1/groups/:id/members  - Get members with locations
POST   /api/v1/groups/location     - Share location
POST   /api/v1/groups/alerts       - Send alert to group
GET    /api/v1/groups/:id/alerts   - Get group alerts
PATCH  /api/v1/groups/:id/member   - Update member settings
DELETE /api/v1/groups/:id/leave    - Leave group
DELETE /api/v1/groups/:id/members/:userId - Remove member (admin)
```

## Phase 2: Mobile Screens

### 1. Groups List Screen
- List of user's groups
- Create new group button
- Join group button
- Group cards showing member count

### 2. Create Group Screen
- Group name input
- Description (optional)
- Generate invite code automatically
- Create button

### 3. Join Group Screen
- Invite code input
- Join button
- Validation

### 4. Group Map Screen (Main Feature)
- Interactive map showing all members
- Member markers with avatars/initials
- Current user highlighted
- Member list at bottom
- Location sharing toggle
- Send alert button

### 5. Group Details Screen
- Group info (name, description, invite code)
- Member list with status
- Admin controls (remove members)
- Leave group button
- Share invite code

### 6. Member Details Screen
- Member info
- Last seen time
- Location history
- Battery level
- Distance from you

## Phase 3: Real-time Updates

### Location Sharing
- Background location tracking (every 30 seconds when enabled)
- Send location to backend
- Poll for member locations (every 10 seconds)
- Update map markers

### Alert System
- Send emergency/safe/help alerts
- Push notifications to group members
- Alert history

## Features

### Core Features
- ✅ Create family groups
- ✅ Generate unique invite codes
- ✅ Join groups with invite code
- ✅ Share location with group
- ✅ View members on map
- ✅ Send emergency alerts
- ✅ Admin controls

### Privacy & Settings
- Toggle location sharing on/off
- Leave group anytime
- Admin can remove members
- Location history (last 24 hours)

### Status Indicators
- 🟢 Active (location updated < 5 min)
- 🟡 Idle (5-30 min)
- 🔴 Offline (> 30 min)
- 🔋 Battery level indicator
- 🚶 Moving indicator

## User Flow

### Creating a Group
1. Tap "Create Group"
2. Enter group name
3. Optionally add description
4. Tap "Create"
5. Get invite code
6. Share code with family

### Joining a Group
1. Tap "Join Group"
2. Enter invite code
3. Tap "Join"
4. Enable location sharing
5. See family members on map

### Sharing Location
1. Open group map
2. Toggle "Share Location" ON
3. Location updates every 30 seconds
4. Members see your location in real-time

### Sending Emergency Alert
1. Open group map
2. Tap "Send Alert" button
3. Choose alert type (Emergency/Safe/Help/Info)
4. Add message
5. Send to all members
6. Members get push notification

## Technical Implementation

### Location Tracking
```typescript
// Start tracking
const startLocationSharing = async (groupId: number) => {
  const interval = setInterval(async () => {
    const location = await Location.getCurrentPositionAsync();
    await groupService.shareLocation({
      groupId,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
    });
  }, 30000); // Every 30 seconds
};
```

### Polling for Updates
```typescript
// Poll for member locations
const pollMemberLocations = async (groupId: number) => {
  const interval = setInterval(async () => {
    const members = await groupService.getGroupMembers(groupId);
    updateMapMarkers(members);
  }, 10000); // Every 10 seconds
};
```

### Map Markers
- Different colors for different statuses
- Show member name/initials
- Tap marker to see details
- Cluster markers when zoomed out

## Navigation Structure

```
Family Tab (new tab in bottom navigation)
├── GroupsList
├── CreateGroup
├── JoinGroup
├── GroupMap (main screen)
│   ├── MemberDetails (modal)
│   └── SendAlert (modal)
└── GroupDetails
    └── MemberList
```

## Database Schema

### groups
```sql
id, name, description, created_by, invite_code, 
is_active, created_at, updated_at
```

### group_members
```sql
id, group_id, user_id, role, status, 
location_sharing_enabled, joined_at, last_seen
```

### location_shares
```sql
id, user_id, group_id, latitude, longitude, 
accuracy, battery_level, is_moving, shared_at
```

### group_alerts
```sql
id, group_id, user_id, alert_type, message, 
latitude, longitude, created_at
```

## Security & Privacy

### Access Control
- Only group members can see locations
- Admins can remove members
- Users can leave anytime
- Users control their own sharing

### Data Retention
- Location history: 24 hours
- Alerts history: 7 days
- Inactive groups: 30 days

## Next Steps

1. ✅ Create database tables
2. ✅ Create TypeScript types
3. ✅ Create mobile API service
4. ⏳ Implement backend service
5. ⏳ Implement backend controller
6. ⏳ Implement backend routes
7. ⏳ Create mobile screens
8. ⏳ Implement location tracking
9. ⏳ Test end-to-end

## Estimated Timeline

- Backend: 1 day
- Mobile screens: 1-2 days
- Location tracking: 1 day
- Testing & polish: 1 day

**Total: 3-4 days**

## Files Created

- ✅ `database/family_groups.sql`
- ✅ `mobile/src/types/group.ts`
- ✅ `mobile/src/services/groups.ts`
- ⏳ Backend files (next)
- ⏳ Mobile screens (after backend)
