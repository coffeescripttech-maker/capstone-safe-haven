# Task 7 Implementation Summary: Special Access Rules

## Overview
Implemented special access rules for the Enhanced RBAC System, including emergency location access for PNP, fire incident filtering for BFP, and alert approval workflow for LGU officers.

## Completed Subtasks

### 7.1 Emergency Location Access for PNP ✅
**Requirements: 4.4**

#### Implementation Details:
1. **Created Emergency Access Middleware** (`src/middleware/emergencyAccess.ts`)
   - `requireActiveEmergency`: Middleware that checks for active emergencies
   - Only applies to PNP role (other roles bypass this check)
   - Checks for active incidents and SOS alerts within the last 24 hours
   - Returns 403 when no active emergency exists
   - Logs all access attempts to audit logs

2. **Added Citizen Location Endpoint**
   - New route: `GET /api/users/locations`
   - Protected by `requireActiveEmergency` middleware
   - Supports filtering by coordinates and radius
   - Returns citizen location data with emergency contact information

3. **Service Layer** (`src/services/user.service.ts`)
   - `getCitizenLocations`: Retrieves citizen location data
   - Filters by distance using Haversine formula
   - Only returns active citizens with location data
   - Includes emergency contact information

#### Key Features:
- PNP can only access citizen locations during active emergencies
- Active emergencies include:
  - Incidents with status: pending, verified, in_progress
  - SOS alerts with status: sent, acknowledged, responding
  - Created within the last 24 hours
- All access attempts are logged to audit logs
- Super admin and admin bypass emergency checks

---

### 7.3 Fire Incident Filtering for BFP ✅
**Requirements: 5.1, 5.6**

#### Implementation Details:
1. **Database Migration** (`database/migrations/006_add_fire_incident_type.sql`)
   - Added 'fire' to incident_type ENUM
   - Allows creation of fire-specific incidents

2. **Incident Service Enhancement** (`src/services/incident.service.ts`)
   - Created `formatIncidentForRole` helper method
   - BFP users receive:
     - **Fire incidents**: Full details (title, description, address, severity, photos, etc.)
     - **Non-fire incidents**: Basic info only (id, type, location, status)
   - Applied to both `getIncidents` and `getIncidentById` methods

3. **Controller Update** (`src/controllers/incident.controller.ts`)
   - Added 'fire' to valid incident types
   - Validation ensures fire incidents can be created

#### Key Features:
- BFP role has specialized access to incident data
- Fire incidents: Full access to all details
- Non-fire incidents: Limited to basic information (id, location, status)
- Filtering applied consistently across all incident queries
- Other roles (admin, super_admin, mdrrmo, pnp) see full details for all incidents

---

### 7.5 Alert Approval Workflow for LGU Officers ✅
**Requirements: 7.1**

#### Implementation Details:
1. **Database Migration** (`database/migrations/007_add_alert_approval_workflow.sql`)
   - Added `status` column: ENUM('pending_approval', 'approved', 'rejected')
   - Added `approved_by` column: Foreign key to users table
   - Added index on status for efficient filtering

2. **Alert Service** (`src/services/alert.service.ts`)
   - **Create Alert**: Automatically sets status to 'pending_approval' for lgu_officer
   - **Get Alerts**: Filters out pending alerts for citizen role
   - **Approve Alert**: 
     - Changes status from 'pending_approval' to 'approved'
     - Records approver ID
     - Broadcasts alert to targeted users

3. **Alert Routes** (`src/routes/alert.routes.ts`)
   - Approval endpoint: `PATCH /api/alerts/:id/approve`
   - Requires 'update' permission on 'alerts' resource
   - Available to mdrrmo, admin, and super_admin roles

#### Key Features:
- LGU officers create alerts with 'pending_approval' status
- Citizens cannot see pending alerts (only approved alerts)
- MDRRMO, admin, and super_admin can approve alerts
- Approved alerts are automatically broadcasted
- Approval workflow tracked in audit logs

---

## Files Created

### Middleware
- `MOBILE_APP/backend/src/middleware/emergencyAccess.ts`

### Database Migrations
- `MOBILE_APP/database/migrations/006_add_fire_incident_type.sql`
- `MOBILE_APP/database/migrations/007_add_alert_approval_workflow.sql`

## Files Modified

### Controllers
- `MOBILE_APP/backend/src/controllers/user.controller.ts`
  - Added `getCitizenLocations` method

- `MOBILE_APP/backend/src/controllers/incident.controller.ts`
  - Added 'fire' to valid incident types

### Services
- `MOBILE_APP/backend/src/services/user.service.ts`
  - Added `getCitizenLocations` method

- `MOBILE_APP/backend/src/services/incident.service.ts`
  - Created `formatIncidentForRole` helper method
  - Enhanced `getIncidents` and `getIncidentById` with BFP filtering

### Routes
- `MOBILE_APP/backend/src/routes/user.routes.ts`
  - Added `/locations` route with emergency access middleware

## Testing Recommendations

### 7.1 Emergency Location Access
```bash
# Test PNP access without active emergency (should fail)
curl -X GET http://localhost:3000/api/users/locations \
  -H "Authorization: Bearer <pnp_token>"

# Create an active incident or SOS alert
# Then test PNP access again (should succeed)

# Test admin access (should always succeed)
curl -X GET http://localhost:3000/api/users/locations \
  -H "Authorization: Bearer <admin_token>"
```

### 7.3 Fire Incident Filtering
```bash
# Create a fire incident
curl -X POST http://localhost:3000/api/incidents \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "incidentType": "fire",
    "title": "Building Fire",
    "description": "Fire at commercial building",
    "latitude": 14.5995,
    "longitude": 120.9842,
    "severity": "high"
  }'

# Test BFP access to fire incident (should see full details)
curl -X GET http://localhost:3000/api/incidents/<id> \
  -H "Authorization: Bearer <bfp_token>"

# Test BFP access to non-fire incident (should see basic info only)
curl -X GET http://localhost:3000/api/incidents/<id> \
  -H "Authorization: Bearer <bfp_token>"
```

### 7.5 Alert Approval Workflow
```bash
# LGU officer creates alert (should be pending)
curl -X POST http://localhost:3000/api/alerts \
  -H "Authorization: Bearer <lgu_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "alert_type": "flood",
    "severity": "high",
    "title": "Flood Warning",
    "description": "Heavy rainfall expected",
    "source": "LGU",
    "affected_areas": ["Manila"],
    "start_time": "2026-03-02T10:00:00Z"
  }'

# Citizen queries alerts (should not see pending alert)
curl -X GET http://localhost:3000/api/alerts \
  -H "Authorization: Bearer <citizen_token>"

# MDRRMO approves alert
curl -X PATCH http://localhost:3000/api/alerts/<id>/approve \
  -H "Authorization: Bearer <mdrrmo_token>"

# Citizen queries alerts again (should now see approved alert)
curl -X GET http://localhost:3000/api/alerts \
  -H "Authorization: Bearer <citizen_token>"
```

## Database Migration Instructions

Run the following migrations in order:

```bash
# Add fire incident type
mysql -u root -p safehaven < MOBILE_APP/database/migrations/006_add_fire_incident_type.sql

# Add alert approval workflow
mysql -u root -p safehaven < MOBILE_APP/database/migrations/007_add_alert_approval_workflow.sql
```

## Security Considerations

1. **Emergency Location Access**
   - PNP access is strictly controlled by active emergency status
   - All access attempts are logged to audit logs
   - Super admin can always access (for system administration)

2. **Fire Incident Filtering**
   - BFP cannot see sensitive details of non-fire incidents
   - Prevents unauthorized access to incident information
   - Maintains data privacy while allowing emergency response

3. **Alert Approval Workflow**
   - Prevents unauthorized alert broadcasting by LGU officers
   - Ensures alerts are reviewed before public dissemination
   - Tracks approval chain for accountability

## Next Steps

The optional property-based tests (tasks 7.2, 7.4, 7.6) can be implemented to validate:
- **Property 23**: Emergency location access for PNP
- **Property 24**: Fire incident filtering for BFP
- **Property 11**: Alert approval workflow

These tests would provide comprehensive validation of the special access rules across all possible inputs.

## Compliance

All implementations comply with the requirements specified in:
- Requirements Document: `.kiro/specs/enhanced-rbac-system/requirements.md`
- Design Document: `.kiro/specs/enhanced-rbac-system/design.md`
- Task List: `.kiro/specs/enhanced-rbac-system/tasks.md`
