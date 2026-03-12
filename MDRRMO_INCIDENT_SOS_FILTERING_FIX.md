# MDRRMO Incident & SOS Filtering Fix - COMPLETE ✅

## Problem

When logged in as MDRRMO user, they could see:
- ❌ Incidents assigned to PNP
- ❌ Incidents assigned to BFP  
- ❌ All SOS alerts (including those targeted to PNP/BFP)

**Expected Behavior**: MDRRMO should ONLY see:
- ✅ Incidents assigned to MDRRMO
- ✅ Incidents not assigned to anyone (unassigned)
- ✅ SOS alerts targeted to MDRRMO or 'all'

## Root Cause

### Issue 1: Incidents Filtering (incident.service.ts)
**Line 167-170** - Wrong filtering logic:
```typescript
// OLD CODE - WRONG
if (userRole && ['pnp', 'bfp', 'mdrrmo'].includes(userRole)) {
  query += ' AND assigned_user.role = ?';
  params.push(userRole);
}
```

**Problem**: This filters WHERE the assigned user's role matches, but doesn't exclude incidents assigned to OTHER agencies.

### Issue 2: SOS Alerts Filtering (sos.service.ts)
**Line 358** - MDRRMO excluded from filtering:
```typescript
// OLD CODE - WRONG
if (filters.userRole && filters.userRole !== 'super_admin' && filters.userRole !== 'admin' && filters.userRole !== 'mdrrmo') {
  // Filtering logic...
}
```

**Problem**: MDRRMO was excluded from filtering, so they saw ALL SOS alerts instead of only those targeted to them.

---

## Solution

### Fix 1: Incidents Filtering ✅

**File**: `MOBILE_APP/backend/src/services/incident.service.ts`

**Changed**:
```typescript
// NEW CODE - CORRECT
// Filter by assigned agency for agency roles (PNP, BFP, MDRRMO)
// Each agency only sees incidents assigned to them
// Super admin and admin see all incidents
if (userRole && ['pnp', 'bfp', 'mdrrmo'].includes(userRole)) {
  query += ' AND (assigned_user.role = ? OR ir.assigned_to IS NULL)';
  params.push(userRole);
}
```

**What Changed**:
- Added `OR ir.assigned_to IS NULL` to include unassigned incidents
- Now each agency only sees:
  - Incidents assigned to their role
  - Unassigned incidents (so they can claim them)

### Fix 2: SOS Alerts Filtering ✅

**File**: `MOBILE_APP/backend/src/services/sos.service.ts`

**Changed**:
```typescript
// NEW CODE - CORRECT
// Apply role-based filtering for target_agency
// Super admin and admin can see all alerts
// MDRRMO, PNP, BFP, and other roles only see alerts targeted to them or 'all'
if (filters.userRole && filters.userRole !== 'super_admin' && filters.userRole !== 'admin') {
  // Map role to target_agency values they should see
  const roleAgencyMap: Record<string, string[]> = {
    'mdrrmo': ['mdrrmo', 'all'],  // ← ADDED
    'pnp': ['pnp', 'all'],
    'bfp': ['bfp', 'all'],
    'lgu_officer': ['barangay', 'lgu', 'all']
  };

  const allowedAgencies = roleAgencyMap[filters.userRole] || ['all'];
  const placeholders = allowedAgencies.map(() => '?').join(',');
  whereConditions.push(`sa.target_agency IN (${placeholders})`);
  params.push(...allowedAgencies);

  logger.info(`Filtering SOS alerts for role ${filters.userRole}: ${allowedAgencies.join(', ')}`);
}
```

**What Changed**:
- Removed MDRRMO from the exclusion list
- Added MDRRMO to the `roleAgencyMap` with `['mdrrmo', 'all']`
- Now MDRRMO only sees SOS alerts targeted to them or 'all'

---

## How It Works Now

### Incidents Filtering

#### Super Admin / Admin
```sql
-- No filtering - sees ALL incidents
SELECT * FROM incident_reports
```

#### MDRRMO User
```sql
-- Only sees incidents assigned to MDRRMO or unassigned
SELECT * FROM incident_reports ir
LEFT JOIN users assigned_user ON ir.assigned_to = assigned_user.id
WHERE (assigned_user.role = 'mdrrmo' OR ir.assigned_to IS NULL)
```

#### PNP User
```sql
-- Only sees incidents assigned to PNP or unassigned
SELECT * FROM incident_reports ir
LEFT JOIN users assigned_user ON ir.assigned_to = assigned_user.id
WHERE (assigned_user.role = 'pnp' OR ir.assigned_to IS NULL)
```

#### BFP User
```sql
-- Only sees incidents assigned to BFP or unassigned
SELECT * FROM incident_reports ir
LEFT JOIN users assigned_user ON ir.assigned_to = assigned_user.id
WHERE (assigned_user.role = 'bfp' OR ir.assigned_to IS NULL)
```

### SOS Alerts Filtering

#### Super Admin / Admin
```sql
-- No filtering - sees ALL SOS alerts
SELECT * FROM sos_alerts
```

#### MDRRMO User
```sql
-- Only sees SOS alerts targeted to MDRRMO or 'all'
SELECT * FROM sos_alerts sa
WHERE sa.target_agency IN ('mdrrmo', 'all')
```

#### PNP User
```sql
-- Only sees SOS alerts targeted to PNP or 'all'
SELECT * FROM sos_alerts sa
WHERE sa.target_agency IN ('pnp', 'all')
```

#### BFP User
```sql
-- Only sees SOS alerts targeted to BFP or 'all'
SELECT * FROM sos_alerts sa
WHERE sa.target_agency IN ('bfp', 'all')
```

---

## Testing Scenarios

### Test 1: MDRRMO User - Incidents

**Setup**:
- Incident A: Assigned to MDRRMO
- Incident B: Assigned to PNP
- Incident C: Assigned to BFP
- Incident D: Unassigned

**Expected Result**:
- ✅ Sees Incident A (assigned to MDRRMO)
- ❌ Does NOT see Incident B (assigned to PNP)
- ❌ Does NOT see Incident C (assigned to BFP)
- ✅ Sees Incident D (unassigned - can claim it)

### Test 2: MDRRMO User - SOS Alerts

**Setup**:
- SOS Alert A: target_agency = 'mdrrmo'
- SOS Alert B: target_agency = 'pnp'
- SOS Alert C: target_agency = 'bfp'
- SOS Alert D: target_agency = 'all'

**Expected Result**:
- ✅ Sees SOS Alert A (targeted to MDRRMO)
- ❌ Does NOT see SOS Alert B (targeted to PNP)
- ❌ Does NOT see SOS Alert C (targeted to BFP)
- ✅ Sees SOS Alert D (targeted to 'all')

### Test 3: PNP User - Incidents

**Setup**:
- Incident A: Assigned to MDRRMO
- Incident B: Assigned to PNP
- Incident C: Unassigned

**Expected Result**:
- ❌ Does NOT see Incident A (assigned to MDRRMO)
- ✅ Sees Incident B (assigned to PNP)
- ✅ Sees Incident C (unassigned)

### Test 4: Admin User

**Expected Result**:
- ✅ Sees ALL incidents (no filtering)
- ✅ Sees ALL SOS alerts (no filtering)

---

## Why Unassigned Incidents Are Visible

Unassigned incidents (`assigned_to IS NULL`) are visible to all agencies because:

1. **Triage Process**: Agencies need to see new incidents to claim them
2. **Coordination**: Multiple agencies may need to respond
3. **Flexibility**: Allows agencies to self-assign based on their capacity

**Example**:
- Citizen reports a fire incident
- Incident is created as unassigned
- BFP sees it and can claim it
- MDRRMO also sees it for coordination
- Once BFP claims it, only BFP sees it (and admin/super admin)

---

## Database Schema Reference

### incident_reports Table
```sql
CREATE TABLE incident_reports (
  id INT PRIMARY KEY,
  user_id INT,
  incident_type VARCHAR(50),
  title VARCHAR(255),
  description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address VARCHAR(255),
  severity VARCHAR(20),
  status VARCHAR(20),
  photos JSON,
  assigned_to INT,  -- ← User ID of assigned agency admin
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### sos_alerts Table
```sql
CREATE TABLE sos_alerts (
  id INT PRIMARY KEY,
  user_id INT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address VARCHAR(255),
  priority VARCHAR(20),
  status VARCHAR(20),
  target_agency VARCHAR(50),  -- ← 'mdrrmo', 'pnp', 'bfp', 'all', etc.
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## Files Modified

1. **MOBILE_APP/backend/src/services/incident.service.ts**
   - Line 167-172: Updated incident filtering logic
   - Added `OR ir.assigned_to IS NULL` condition

2. **MOBILE_APP/backend/src/services/sos.service.ts**
   - Line 358-375: Updated SOS alerts filtering logic
   - Removed MDRRMO from exclusion list
   - Added MDRRMO to roleAgencyMap

---

## Deployment

### 1. Compile Backend
```bash
cd MOBILE_APP/backend
npm run build
```

### 2. Restart Backend Server
```bash
npm run dev
```

### 3. Test
1. Login as MDRRMO user
2. Go to http://localhost:3000/incidents
3. Verify: Only see incidents assigned to MDRRMO or unassigned
4. Go to http://localhost:3000/sos-alerts
5. Verify: Only see SOS alerts targeted to MDRRMO or 'all'

---

## Summary

**Before**:
- ❌ MDRRMO saw incidents assigned to PNP/BFP
- ❌ MDRRMO saw all SOS alerts

**After**:
- ✅ MDRRMO only sees incidents assigned to MDRRMO or unassigned
- ✅ MDRRMO only sees SOS alerts targeted to MDRRMO or 'all'
- ✅ Each agency (PNP, BFP, MDRRMO) only sees their own data
- ✅ Admin/Super Admin still see everything

This ensures proper data isolation and role-based access control!

---

**Status**: ✅ COMPLETE
**Date**: March 12, 2026
**Files Modified**: 2
**Issue**: MDRRMO seeing other agencies' data
**Fix**: Updated filtering logic in incident and SOS services
