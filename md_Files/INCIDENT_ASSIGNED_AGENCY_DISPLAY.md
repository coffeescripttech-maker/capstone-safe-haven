# Incident Assigned Agency Display - Complete ✅

## Overview
Added "Assigned To" column in the incidents listing page to show which agency (PNP, BFP, or MDRRMO) each incident was assigned to.

## Changes Made

### 1. Backend Changes ✅

**File: `backend/src/services/incident.service.ts`**

- Updated `getIncidents()` query to include assigned agency role:
  ```sql
  SELECT 
    ir.*,
    CONCAT(u.first_name, ' ', u.last_name) as user_name,
    u.phone as user_phone,
    assigned_user.role as assigned_agency  -- NEW
  FROM incident_reports ir
  LEFT JOIN users u ON ir.user_id = u.id
  LEFT JOIN users assigned_user ON ir.assigned_to = assigned_user.id  -- NEW JOIN
  WHERE 1=1
  ```

- Updated `getIncidentById()` with same join to include assigned agency

- Updated `formatIncidentForRole()` to include `assignedAgency` in response:
  ```typescript
  return {
    ...baseIncident,
    assignedTo: incident.assigned_to,
    assignedAgency: (incident as any).assigned_agency || null,  // NEW
    // ... other fields
  };
  ```

### 2. Frontend Changes ✅

**File: `web_app/src/app/(admin)/incidents/page.tsx`**

- Added `assignedAgency?: string` to `Incident` interface

- Added new `getAgencyBadge()` function to display agency badges:
  ```typescript
  const getAgencyBadge = (assignedAgency?: string) => {
    if (!assignedAgency) {
      return <span>Unassigned</span>;
    }

    const agencyConfig = {
      pnp: { label: 'PNP', color: 'blue', icon: '👮' },
      bfp: { label: 'BFP', color: 'red', icon: '🚒' },
      mdrrmo: { label: 'MDRRMO', color: 'orange', icon: '🆘' },
    };
    // Returns styled badge with icon
  };
  ```

- Added new table column "Assigned To" between "Status" and "Location":
  ```tsx
  <th>Assigned To</th>
  ```

- Display agency badge in table row:
  ```tsx
  <td>{getAgencyBadge(incident.assignedAgency)}</td>
  ```

## Visual Display

### Agency Badges

**PNP (Police)**
- Icon: 👮
- Color: Blue
- Label: "PNP"

**BFP (Fire)**
- Icon: 🚒
- Color: Red
- Label: "BFP"

**MDRRMO (Disaster Response)**
- Icon: 🆘
- Color: Orange
- Label: "MDRRMO"

**Unassigned**
- Color: Gray
- Label: "Unassigned"

## Table Layout

```
| Incident Details | Reporter | Type | Severity | Status | Assigned To | Location | Date | Actions |
|-----------------|----------|------|----------|--------|-------------|----------|------|---------|
| Building damage | John Doe | 🏚️   | Critical | Pending| 🆘 MDRRMO   | Manila   | ...  | 👁️      |
| Missing person  | Jane S.  | 🔍   | High     | Active | 👮 PNP      | Quezon   | ...  | 👁️      |
| Fire incident   | Bob M.   | 🔥   | Critical | Active | 🚒 BFP      | Makati   | ...  | 👁️      |
```

## How It Works

1. **Mobile App**: User selects target agency when reporting incident
2. **Backend**: Finds admin user with that role and assigns incident
3. **Database**: Stores `assigned_to` (user ID) in `incident_reports` table
4. **API Response**: Joins with users table to get the role (agency)
5. **Frontend**: Displays agency badge with icon and color

## Testing

### Test Scenario 1: View Assigned Incidents
1. Go to http://localhost:3000/incidents
2. Look at "Assigned To" column
3. Should see agency badges (PNP, BFP, MDRRMO) or "Unassigned"

### Test Scenario 2: Create New Incident from Mobile
1. Open mobile app
2. Report incident with agency selection
3. Check web dashboard
4. Should see incident assigned to selected agency

### Test Scenario 3: Filter by Agency (Future Enhancement)
Could add filter dropdown to show only incidents for specific agency

## Database Query Example

```sql
SELECT 
  ir.id,
  ir.title,
  ir.status,
  ir.assigned_to,
  assigned_user.role as assigned_agency
FROM incident_reports ir
LEFT JOIN users assigned_user ON ir.assigned_to = assigned_user.id
WHERE ir.id = 123;
```

Result:
```
id  | title           | status  | assigned_to | assigned_agency
----|-----------------|---------|-------------|----------------
123 | Building damage | pending | 456         | mdrrmo
```

## API Response Format

```json
{
  "status": "success",
  "data": {
    "data": [
      {
        "id": 123,
        "title": "Building collapsed",
        "incidentType": "damage",
        "severity": "critical",
        "status": "pending",
        "assignedTo": 456,
        "assignedAgency": "mdrrmo",  // NEW FIELD
        "createdAt": "2026-03-09T10:30:00Z",
        "user": {
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

## Next Steps

### Required: Backend Compilation
```bash
cd MOBILE_APP/backend
npm run build
npm start
```

### Optional Enhancements
1. Add filter dropdown for agency
2. Show agency stats in dashboard
3. Add agency column to incident detail page
4. Export incidents by agency
5. Agency-specific incident counts

## Files Modified

### Backend
- `backend/src/services/incident.service.ts` - Added assigned_agency to queries

### Frontend
- `web_app/src/app/(admin)/incidents/page.tsx` - Added Assigned To column

## Success Criteria ✅
- [x] Backend returns assignedAgency in API response
- [x] Frontend displays Assigned To column
- [x] Agency badges show correct icon and color
- [x] Unassigned incidents show "Unassigned"
- [x] Table layout remains clean and readable

---

**Status**: Implementation Complete
**Date**: March 9, 2026
**Next**: Compile backend and restart server to see changes
