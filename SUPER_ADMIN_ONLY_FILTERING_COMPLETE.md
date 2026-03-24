# Super Admin Only Filtering - Complete

## Changes Made

Updated role-based filtering so that ONLY `super_admin` sees ALL alerts and incidents. All other roles (including MDRRMO) now have scoped access.

## New Filtering Rules

### SOS Alerts (SOSNotificationBell.tsx)

- **super_admin**: Sees ALL SOS alerts (no filtering)
- **mdrrmo/admin**: Only sees alerts where `target_agency = 'mdrrmo'` OR `'admin'` OR `'all'`
- **pnp**: Only sees alerts where `target_agency = 'pnp'` OR `'all'`
- **bfp**: Only sees alerts where `target_agency = 'bfp'` OR `'all'`
- **lgu_officer**: Only sees alerts where `target_agency = 'barangay'` OR `'lgu'` OR `'all'`

### Incidents (IncidentNotificationBell.tsx)

- **super_admin**: Sees ALL incidents (no filtering)
- **mdrrmo/admin**: Only sees incidents where `assigned_agency = 'mdrrmo'` OR `'admin'`
- **pnp**: Only sees incidents where `assigned_agency = 'pnp'`
- **bfp**: Only sees incidents where `assigned_agency = 'bfp'`
- **lgu_officer**: Only sees incidents where `assigned_agency = 'lgu_officer'` OR unassigned
- **citizen**: Only sees their own incidents

## Example Scenarios

### Scenario 1: Citizen reports to BFP
- Citizen creates incident, assigns to BFP
- **BFP**: ✅ Sees the incident (assigned to them)
- **PNP**: ❌ Does NOT see (not assigned to them)
- **MDRRMO**: ❌ Does NOT see (not assigned to them)
- **Super Admin**: ✅ Sees the incident (sees all)

### Scenario 2: SOS alert targeted to PNP
- Citizen sends SOS, selects PNP as target
- **PNP**: ✅ Sees the alert (targeted to them)
- **BFP**: ❌ Does NOT see (not targeted to them)
- **MDRRMO**: ❌ Does NOT see (not targeted to them)
- **Super Admin**: ✅ Sees the alert (sees all)

### Scenario 3: SOS alert targeted to ALL
- Citizen sends SOS, selects "All Agencies"
- **PNP**: ✅ Sees the alert (target = 'all')
- **BFP**: ✅ Sees the alert (target = 'all')
- **MDRRMO**: ✅ Sees the alert (target = 'all')
- **LGU**: ✅ Sees the alert (target = 'all')
- **Super Admin**: ✅ Sees the alert (sees all)

## Code Changes

### SOSNotificationBell.tsx (Line ~165)
```typescript
// ONLY super_admin sees ALL alerts
if (userRole === 'super_admin') {
  shouldShow = true;
  console.log(`✅ [SOS WebSocket] Super admin - showing all alerts`);
}
// Each agency (including MDRRMO) ONLY sees alerts targeted to them or 'all'
else if (userRole === 'mdrrmo') {
  shouldShow = targetAgency === 'mdrrmo' || targetAgency === 'all';
  console.log(`${shouldShow ? '✅' : '❌'} [SOS WebSocket] MDRRMO - ${shouldShow ? 'showing' : 'hiding'} alert`);
}
else if (userRole === 'pnp') {
  shouldShow = targetAgency === 'pnp' || targetAgency === 'all';
  console.log(`${shouldShow ? '✅' : '❌'} [SOS WebSocket] PNP - ${shouldShow ? 'showing' : 'hiding'} alert`);
}
// ... etc
```

### IncidentNotificationBell.tsx (Line ~165)
```typescript
// ONLY super_admin sees ALL incidents
if (userRole === 'super_admin') {
  shouldShow = true;
  console.log(`✅ [Incident WebSocket] Super admin - showing all incidents`);
}
// Agency roles (including MDRRMO) ONLY see incidents assigned to them
else if (userRole === 'mdrrmo') {
  shouldShow = assignedAgency === 'mdrrmo';
  console.log(`${shouldShow ? '✅' : '❌'} [Incident WebSocket] MDRRMO - ${shouldShow ? 'showing' : 'hiding'} incident`);
}
else if (userRole === 'pnp') {
  shouldShow = assignedAgency === 'pnp';
  console.log(`${shouldShow ? '✅' : '❌'} [Incident WebSocket] PNP - ${shouldShow ? 'showing' : 'hiding'} incident`);
}
// ... etc
```

## Other Fixes Included

### 1. Timezone Fix
Both notification bells now correctly display Philippine time by removing the 'Z' suffix:
```typescript
format(new Date(alert.created_at.replace('Z', '')), 'h:mm a')
```

### 2. Family Group Join Fix
To fix the "Invalid invite code" error, run:
```powershell
cd MOBILE_APP/backend
.\setup-family-groups-now.ps1
```

This creates the required `groups`, `group_members`, `location_shares`, and `group_alerts` tables.

## Testing

### Test SOS Filtering
1. Login as BFP user
2. Create SOS alert targeted to PNP from mobile app
3. BFP should NOT see the alert in notification bell
4. Login as PNP user
5. PNP should see the alert

### Test Incident Filtering
1. Login as PNP user
2. Create incident assigned to BFP from mobile app
3. PNP should NOT see the incident in notification bell
4. Login as BFP user
5. BFP should see the incident

### Test Super Admin
1. Login as super_admin
2. Should see ALL SOS alerts and incidents regardless of target/assignment

## Files Modified

- `MOBILE_APP/web_app/src/components/header/SOSNotificationBell.tsx`
- `MOBILE_APP/web_app/src/components/header/IncidentNotificationBell.tsx`

## Status

✅ **COMPLETE** - Only super_admin sees all; MDRRMO and other agencies have scoped access

---

**Date:** March 24, 2026
**Issue:** MDRRMO was seeing all alerts/incidents like super_admin
**Resolution:** Updated filtering logic so only super_admin sees everything; MDRRMO/admin now has scoped access like other agencies (supports both 'mdrrmo' and legacy 'admin' roles)
