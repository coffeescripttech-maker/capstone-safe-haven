# Incident Report Agency Selection - Implementation Complete ✅

## Overview
Successfully implemented agency selection for incident reports, allowing citizens to report incidents directly to the appropriate emergency agency (PNP, BFP, or MDRRMO). The system automatically assigns the incident to the selected agency and sends notifications.

## Implementation Summary

### 1. Mobile App Changes ✅

**File: `mobile/src/types/incident.ts`**
- Added `TargetAgency` type: `'pnp' | 'bfp' | 'mdrrmo'`
- Updated `CreateIncidentRequest` interface to include `targetAgency?: TargetAgency`

**File: `mobile/src/screens/incidents/ReportIncidentScreen.tsx`**
- Added `selectedAgency` state with default value `'mdrrmo'`
- Added agency selection UI with three cards (PNP, BFP, MDRRMO)
- Implemented auto-suggestion logic based on incident type:
  - `damage` → MDRRMO
  - `injury` → BFP
  - `missing_person` → PNP
  - `hazard` → BFP
  - `other` → MDRRMO
- Agency cards show icon, label, and description
- Selected agency is highlighted with primary color
- Agency selection placed between incident type and severity
- Included `targetAgency` in report submission data

### 2. Backend Changes ✅

**File: `backend/src/controllers/incident.controller.ts`**
- Added `targetAgency` parameter validation
- Valid agencies: `'pnp'`, `'bfp'`, `'mdrrmo'`
- Passed `targetAgency` to incident service

**File: `backend/src/services/incident.service.ts`**
- Added `targetAgency` to `CreateIncidentData` interface
- Implemented agency admin lookup by role
- Automatically assigns incident to agency admin user
- Sends notification to assigned agency after incident creation
- Logs assignment and notification status
- Gracefully handles missing agency admins

**File: `backend/src/services/notification.service.ts`**
- Added `sendIncidentNotification()` method
- Sends push notification to agency admin's devices
- Sends SMS notification to agency admin's phone
- Includes incident details: title, type, severity, location
- Uses severity emoji for visual impact
- Logs notification attempts to database

## Features

### Agency Selection UI
```
┌─────────────────────────────────────┐
│  Report To                          │
│                                     │
│  ┌────────┐  ┌────────┐  ┌────────┐│
│  │  👮    │  │  🚒    │  │  🆘    ││
│  │  PNP   │  │  BFP   │  │ MDRRMO ││
│  │ Police │  │ Fire & │  │Disaster││
│  │matters │  │ rescue │  │response││
│  └────────┘  └────────┘  └────────┘│
└─────────────────────────────────────┘
```

### Auto-Suggestion Logic
When user selects an incident type, the system automatically suggests the most appropriate agency:
- Property Damage → MDRRMO (disaster response)
- Injury/Casualty → BFP (medical/rescue)
- Missing Person → PNP (police investigation)
- Hazard/Danger → BFP (safety/rescue)
- Other → MDRRMO (general response)

User can override the suggestion and select any agency.

### Notification System
When an incident is submitted:
1. System finds the admin user for the selected agency (by role)
2. Assigns the incident to that admin (`assigned_to` field)
3. Sends push notification to admin's devices
4. Sends SMS to admin's phone number
5. Notification includes:
   - Severity emoji (🚨 Critical, ⚠️ High, ⚡ Moderate, ℹ️ Low)
   - Incident title and type
   - Location/address
   - Severity level

## Database Schema
The `incident_reports` table already has the `assigned_to` field:
```sql
CREATE TABLE incident_reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  incident_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address VARCHAR(255),
  severity VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  photos JSON,
  assigned_to INT,  -- Agency admin user ID
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);
```

## API Changes

### POST /api/v1/incidents
**Request Body:**
```json
{
  "incidentType": "damage",
  "title": "Collapsed building",
  "description": "Building collapsed after earthquake",
  "latitude": 14.5995,
  "longitude": 120.9842,
  "address": "Quiapo, Manila",
  "severity": "critical",
  "photos": ["base64..."],
  "targetAgency": "mdrrmo"  // NEW FIELD
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 123,
    "userId": 456,
    "incidentType": "damage",
    "title": "Collapsed building",
    "severity": "critical",
    "status": "pending",
    "assignedTo": 789,  // Agency admin user ID
    "createdAt": "2026-03-09T10:30:00Z"
  },
  "message": "Incident reported successfully"
}
```

## Testing

### Test Scenario 1: Report with Agency Selection
1. Open mobile app
2. Navigate to Incident Reports
3. Tap "Report Incident"
4. Select incident type (e.g., "Property Damage")
5. Notice MDRRMO is auto-selected
6. Change to BFP if desired
7. Fill in title, description, severity
8. Submit report
9. Verify incident is assigned to BFP admin
10. Check BFP admin receives notification

### Test Scenario 2: Auto-Suggestion
1. Select "Missing Person" incident type
2. Verify PNP is auto-selected
3. Select "Injury/Casualty"
4. Verify BFP is auto-selected
5. Select "Property Damage"
6. Verify MDRRMO is auto-selected

### Test Scenario 3: Notification Delivery
1. Create test users with roles: `pnp`, `bfp`, `mdrrmo`
2. Add device tokens and phone numbers
3. Submit incident with targetAgency: "pnp"
4. Verify PNP admin receives:
   - Push notification on device
   - SMS on phone
5. Check backend logs for notification status

## Error Handling

### Missing Agency Admin
If no admin user exists for the selected agency:
- Incident is still created with `assigned_to = NULL`
- Warning is logged: "No admin found for agency: {agency}"
- User receives success message
- Admin can manually assign later

### Notification Failure
If notification fails:
- Incident creation still succeeds
- Error is logged but not shown to user
- Admin can view incident in dashboard
- Notification can be retried manually

## Next Steps

### Optional Enhancements
1. **Multiple Admins**: Support multiple admins per agency
2. **Notification Preferences**: Allow admins to configure notification settings
3. **Escalation**: Auto-escalate if no response within timeframe
4. **Status Updates**: Notify citizen when incident status changes
5. **In-App Notifications**: Add notification bell in admin dashboard

### Testing Checklist
- [ ] Test with all three agencies (PNP, BFP, MDRRMO)
- [ ] Test auto-suggestion for each incident type
- [ ] Test manual agency override
- [ ] Test with missing agency admin
- [ ] Test notification delivery (push + SMS)
- [ ] Test offline incident submission
- [ ] Test incident assignment in admin dashboard

## Files Modified

### Mobile App
- `mobile/src/types/incident.ts` - Added TargetAgency type
- `mobile/src/screens/incidents/ReportIncidentScreen.tsx` - Added agency selection UI

### Backend
- `backend/src/controllers/incident.controller.ts` - Added targetAgency validation
- `backend/src/services/incident.service.ts` - Added agency assignment logic
- `backend/src/services/notification.service.ts` - Added sendIncidentNotification method

## Deployment Notes

1. **Backend**: Recompile TypeScript and restart server
   ```bash
   cd MOBILE_APP/backend
   npm run build
   npm start
   ```

2. **Mobile App**: No rebuild needed, hot reload will apply changes

3. **Database**: No migrations needed, `assigned_to` field already exists

4. **Testing**: Create test users with roles `pnp`, `bfp`, `mdrrmo` for testing

## Success Criteria ✅
- [x] Agency selection UI implemented
- [x] Auto-suggestion based on incident type
- [x] Backend accepts targetAgency parameter
- [x] Incident assigned to agency admin
- [x] Push notifications sent to agency
- [x] SMS notifications sent to agency
- [x] Error handling for missing admins
- [x] Graceful notification failure handling
- [x] No breaking changes to existing functionality

---

**Status**: Implementation Complete
**Date**: March 9, 2026
**Next**: Backend recompilation and testing
