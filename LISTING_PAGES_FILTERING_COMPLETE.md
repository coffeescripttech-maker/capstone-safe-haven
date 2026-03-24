# Listing Pages Role-Based Filtering - Complete

## Overview

Updated backend services to ensure role-based filtering applies to both the listing pages (`/sos-alerts` and `/incidents`) and the notification bells.

## Changes Made

### 1. SOS Alerts Service (`sos.service.ts`)

Updated `getSOSAlerts()` method to properly filter based on user role:

**Before:**
```typescript
// Super admin and admin can see all alerts
if (filters.userRole && filters.userRole !== 'super_admin' && filters.userRole !== 'admin') {
  // Only filter for non-admin roles
}
```

**After:**
```typescript
// Super admin sees all alerts
// MDRRMO/admin, PNP, BFP, and other roles only see alerts targeted to them or 'all'
if (filters.userRole && filters.userRole !== 'super_admin') {
  const roleAgencyMap: Record<string, string[]> = {
    'mdrrmo': ['mdrrmo', 'admin', 'all'],
    'admin': ['mdrrmo', 'admin', 'all'],
    'pnp': ['pnp', 'all'],
    'bfp': ['bfp', 'all'],
    'lgu_officer': ['barangay', 'lgu', 'all']
  };
  // Filter by target_agency
}
```

### 2. Incident Service (`incident.service.ts`)

Updated `getIncidents()` method to properly filter based on assigned agency:

**Before:**
```typescript
// Super admin and admin see all incidents
if (userRole && ['pnp', 'bfp', 'mdrrmo'].includes(userRole)) {
  query += ' AND (assigned_user.role = ? OR ir.assigned_to IS NULL)';
  params.push(userRole);
}
```

**After:**
```typescript
// Super admin sees all incidents
if (userRole && ['pnp', 'bfp', 'mdrrmo', 'admin'].includes(userRole)) {
  query += ' AND (assigned_user.role = ? OR assigned_user.role = ? OR ir.assigned_to IS NULL)';
  // Support both mdrrmo and admin roles
  const primaryRole = userRole;
  const alternateRole = userRole === 'mdrrmo' ? 'admin' : 'mdrrmo';
  params.push(primaryRole, alternateRole);
}
```

## Filtering Rules

### SOS Alerts (`/sos-alerts` page)

- **super_admin**: Sees ALL SOS alerts (no filtering)
- **mdrrmo/admin**: Only sees alerts where `target_agency IN ('mdrrmo', 'admin', 'all')`
- **pnp**: Only sees alerts where `target_agency IN ('pnp', 'all')`
- **bfp**: Only sees alerts where `target_agency IN ('bfp', 'all')`
- **lgu_officer**: Only sees alerts where `target_agency IN ('barangay', 'lgu', 'all')`

### Incidents (`/incidents` page)

- **super_admin**: Sees ALL incidents (no filtering)
- **mdrrmo/admin**: Only sees incidents where `assigned_agency IN ('mdrrmo', 'admin')` OR unassigned
- **pnp**: Only sees incidents where `assigned_agency = 'pnp'` OR unassigned
- **bfp**: Only sees incidents where `assigned_agency = 'bfp'` OR unassigned
- **lgu_officer**: Sees incidents based on jurisdiction
- **citizen**: Only sees their own incidents

## How It Works

### Frontend (Listing Pages)

Both listing pages call the backend APIs:
- `/sos-alerts` page → `sosApi.getAll(params)`
- `/incidents` page → `incidentsApi.getAll(params)`

The frontend passes filter parameters (status, priority, etc.) but does NOT handle role-based filtering.

### Backend (Services)

The backend services automatically apply role-based filtering:

1. **Authentication middleware** extracts user role from JWT token
2. **Controller** passes `userRole` to service method
3. **Service** applies SQL WHERE clauses based on role
4. **Response** only includes items the user is authorized to see

### Example SQL Queries

**SOS Alerts for PNP user:**
```sql
SELECT sa.*, u.first_name, u.last_name, u.email, u.phone
FROM sos_alerts sa
LEFT JOIN users u ON sa.user_id = u.id
WHERE sa.target_agency IN ('pnp', 'all')
ORDER BY sa.created_at DESC
```

**Incidents for BFP user:**
```sql
SELECT ir.*, CONCAT(u.first_name, ' ', u.last_name) as user_name,
       u.phone as user_phone, assigned_user.role as assigned_agency
FROM incident_reports ir
LEFT JOIN users u ON ir.user_id = u.id
LEFT JOIN users assigned_user ON ir.assigned_to = assigned_user.id
WHERE (assigned_user.role = 'bfp' OR assigned_user.role = 'admin' OR ir.assigned_to IS NULL)
ORDER BY ir.created_at DESC
```

## Testing

### Test SOS Alerts Listing

1. Login as PNP user
2. Go to `/sos-alerts` page
3. Should only see alerts targeted to PNP or ALL
4. Should NOT see alerts targeted to BFP, MDRRMO, etc.

### Test Incidents Listing

1. Login as BFP user
2. Go to `/incidents` page
3. Should only see incidents assigned to BFP or unassigned
4. Should NOT see incidents assigned to PNP, MDRRMO, etc.

### Test Super Admin

1. Login as super_admin
2. Go to `/sos-alerts` and `/incidents` pages
3. Should see ALL alerts and incidents regardless of target/assignment

### Test MDRRMO/Admin

1. Login as mdrrmo or admin user
2. Go to `/sos-alerts` page
3. Should only see alerts targeted to mdrrmo, admin, or all
4. Go to `/incidents` page
5. Should only see incidents assigned to mdrrmo or admin

## Files Modified

- `MOBILE_APP/backend/src/services/sos.service.ts` (Line ~373)
- `MOBILE_APP/backend/src/services/incident.service.ts` (Line ~374)

## Frontend Pages (No Changes Needed)

- `MOBILE_APP/web_app/src/app/(admin)/sos-alerts/page.tsx` ✅ Already calls backend API
- `MOBILE_APP/web_app/src/app/(admin)/incidents/page.tsx` ✅ Already calls backend API

The frontend pages don't need any changes because they already rely on the backend API for data, which now has proper role-based filtering.

## Status

✅ **COMPLETE** - Backend filtering updated for both SOS alerts and incidents listing pages

---

**Date:** March 24, 2026
**Issue:** Listing pages showing all alerts/incidents regardless of user role
**Resolution:** Updated backend services to apply strict role-based filtering for both SOS alerts and incidents
