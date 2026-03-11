# Final Requirements Analysis & Implementation Plan

## Requirements Summary

### 1. Report Incident - Add LGU/MDRRMO Option
**Current:** Mobile app only shows PNP, BFP, MDRRMO as target agencies
**Required:** Add option for citizens to report directly to LGU/Admin (MDRRMO)
**Impact:** Mobile app UI update

### 2. SOS Filtering - Restrict Agency Access
**Current:** PNP, BFP, MDRRMO see all SOS alerts
**Required:** Only Super Admin and Admin (MDRRMO) see ALL SOS alerts
**Impact:** Backend filtering logic

### 3. MDRRMO Dashboard - Use Admin Dashboard
**Current:** Separate dashboard logic for MDRRMO role
**Required:** MDRRMO role should use the same dashboard as Admin
**Impact:** No code changes needed (already implemented with admin→mdrrmo migration)

## Detailed Analysis

### Requirement 1: Report Incident - LGU/MDRRMO Option

**Current Implementation:**
```typescript
// mobile/src/screens/incidents/ReportIncidentScreen.tsx
const agencies = [
  { id: 'pnp', name: 'PNP', icon: '👮', description: 'Philippine National Police' },
  { id: 'bfp', name: 'BFP', icon: '🚒', description: 'Bureau of Fire Protection' },
  { id: 'mdrrmo', name: 'MDRRMO', icon: '🆘', description: 'Disaster Management Office' },
];
```

**Required Change:**
- Keep existing 3 options (PNP, BFP, MDRRMO)
- MDRRMO option already goes to admin@test.safehaven.com (the main admin)
- No changes needed - already working as required!

**Clarification Needed:**
- Do you want a 4th option labeled "LGU" that also goes to MDRRMO?
- Or is the current MDRRMO option sufficient?

### Requirement 2: SOS Filtering - Restrict Agency Access

**Current Implementation:**
```typescript
// backend/src/services/dataFilter.service.ts
// PNP, BFP: system-wide access for emergency response
if (role === 'pnp' || role === 'bfp') {
  return { whereClause: '', params }; // NO FILTERING - sees all SOS
}
```

**Required Change:**
```typescript
// Only super_admin, admin, and mdrrmo see all SOS
if (role === 'super_admin' || role === 'admin' || role === 'mdrrmo') {
  return { whereClause: '', params };
}

// PNP sees only SOS assigned to PNP
if (role === 'pnp') {
  return { 
    whereClause: 'target_agency = ? OR target_agency IS NULL', 
    params: ['pnp'] 
  };
}

// BFP sees only SOS assigned to BFP
if (role === 'bfp') {
  return { 
    whereClause: 'target_agency = ? OR target_agency IS NULL', 
    params: ['bfp'] 
  };
}
```

**Impact:**
- PNP users will only see SOS alerts sent to PNP
- BFP users will only see SOS alerts sent to BFP
- Super Admin and MDRRMO see all SOS alerts

### Requirement 3: MDRRMO Dashboard

**Current Status:**
✅ Already implemented with the admin→mdrrmo migration!

When admin@test.safehaven.com logs in:
- Role is now `mdrrmo`
- Uses the same dashboard as admin
- Has all admin permissions
- No separate MDRRMO dashboard

**No changes needed for this requirement.**

## Implementation Plan

### Step 1: Update SOS Filtering (Backend)

**Files to Modify:**
1. `backend/src/services/dataFilter.service.ts` - Update `applySOSAlertFilter()`
2. `backend/src/services/sos.service.ts` - Update filtering logic
3. `backend/src/controllers/sos.controller.ts` - Verify role checks

### Step 2: Update SOS Service

**Files to Modify:**
1. `backend/src/services/sos.service.ts` - Add agency-based filtering

### Step 3: Test

1. Login as PNP - should only see PNP SOS alerts
2. Login as BFP - should only see BFP SOS alerts
3. Login as MDRRMO - should see ALL SOS alerts
4. Login as Super Admin - should see ALL SOS alerts

## Files to Modify

### Backend (2 files)
1. `backend/src/services/dataFilter.service.ts` - SOS filtering
2. `backend/src/services/sos.service.ts` - SOS query logic

### Mobile App
- No changes needed (incident reporting already works)

### Web App
- No changes needed (dashboard already works)

## Testing Checklist

### SOS Filtering
- [ ] PNP user sees only PNP SOS alerts
- [ ] BFP user sees only BFP SOS alerts
- [ ] MDRRMO user sees ALL SOS alerts
- [ ] Super Admin sees ALL SOS alerts
- [ ] Citizen can send SOS to specific agency

### Incident Reporting
- [ ] Citizen can report to PNP
- [ ] Citizen can report to BFP
- [ ] Citizen can report to MDRRMO
- [ ] MDRRMO receives the incident

### Dashboard
- [ ] MDRRMO user sees admin dashboard
- [ ] All admin features work for MDRRMO
- [ ] No separate MDRRMO dashboard

## Summary

**Changes Needed:**
1. ✅ Incident Reporting - Already works (MDRRMO option exists)
2. ⏳ SOS Filtering - Need to restrict PNP/BFP to only their SOS
3. ✅ MDRRMO Dashboard - Already works (uses admin dashboard)

**Priority:** Implement SOS filtering changes
