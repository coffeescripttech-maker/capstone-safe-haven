# Incident Privacy & Filtering Fix - COMPLETE ✅

## Problem Fixed

Citizens were able to see ALL incidents from all users, which is a privacy violation. Now each role sees only the incidents they should have access to.

## New Filtering Rules

| Role        | Can See                                    | Implementation                    |
|-------------|--------------------------------------------|-----------------------------------|
| super_admin | ALL incidents                              | No filtering                      |
| admin       | ALL incidents (MDRRMO)                     | No filtering                      |
| mdrrmo      | ALL incidents                              | No filtering                      |
| pnp         | Only incidents assigned to PNP             | Filter by assigned_agency = 'pnp' |
| bfp         | Only incidents assigned to BFP             | Filter by assigned_agency = 'bfp' |
| lgu_officer | Incidents in their jurisdiction            | Filter by jurisdiction            |
| citizen     | Only their own submitted reports           | Filter by user_id                 |

## Changes Made

### 1. ✅ Backend Service

**File:** `backend/src/services/incident.service.ts`

Added citizen filtering:

```typescript
// Citizens can only see their own incidents
if (userRole === 'citizen' && currentUserId) {
  query += ' AND ir.user_id = ?';
  params.push(currentUserId);
}
```

Updated interface:

```typescript
export interface IncidentFilters {
  // ... existing fields
  currentUserId?: number; // For citizen filtering
}
```

### 2. ✅ Backend Controller

**File:** `backend/src/controllers/incident.controller.ts`

Pass current user ID to service:

```typescript
const filters = {
  // ... existing filters
  currentUserId: req.user?.id // For citizen filtering
};
```

### 3. ✅ Mobile App

**File:** `mobile/src/screens/incidents/IncidentsListScreen.tsx`

Use role-based endpoint selection:

```typescript
const { user } = useAuth();

const loadIncidents = async () => {
  // Citizens see only their own incidents
  if (user?.role === 'citizen') {
    const response = await incidentService.getMyIncidents();
    setIncidents(response);
  } else {
    // Agency roles and admins see filtered incidents
    const response = await incidentService.getIncidents({ limit: 50 });
    setIncidents(response.data);
  }
};
```

### 4. ✅ Web App

**File:** `web_app/src/app/(admin)/incidents/page.tsx`

No changes needed - already uses backend filtering correctly.

## How It Works

### Citizen Flow (Mobile App)

1. Citizen logs in to mobile app
2. Navigates to "My Reports" screen
3. App checks user role: `user.role === 'citizen'`
4. Calls `/incidents/my` endpoint
5. Backend returns only incidents where `user_id = currentUser.id`
6. Citizen sees ONLY their own reports

### Agency Flow (Web App)

1. PNP user logs in to web app
2. Navigates to Incidents page
3. Frontend calls `/incidents` endpoint
4. Backend checks user role: `userRole === 'pnp'`
5. Adds filter: `assigned_user.role = 'pnp'`
6. PNP user sees ONLY incidents assigned to PNP

### Admin Flow (Web App)

1. Admin/MDRRMO logs in to web app
2. Navigates to Incidents page
3. Frontend calls `/incidents` endpoint
4. Backend checks user role: `userRole === 'admin'` or `'mdrrmo'`
5. No filtering applied
6. Admin sees ALL incidents

## Testing Instructions

### Test 1: Citizen Privacy

1. **Create Test Incidents:**
   ```sql
   -- Citizen 1 reports
   INSERT INTO incident_reports (user_id, incident_type, title, description, latitude, longitude, severity, status)
   VALUES (10, 'damage', 'Citizen 1 Report', 'Test', 14.5995, 120.9842, 'moderate', 'pending');
   
   -- Citizen 2 reports
   INSERT INTO incident_reports (user_id, incident_type, title, description, latitude, longitude, severity, status)
   VALUES (11, 'injury', 'Citizen 2 Report', 'Test', 14.5995, 120.9842, 'high', 'pending');
   ```

2. **Test Citizen 1 (Mobile App):**
   - Login as Citizen 1
   - Navigate to Incidents screen
   - Should see ONLY "Citizen 1 Report"
   - Should NOT see "Citizen 2 Report"

3. **Test Citizen 2 (Mobile App):**
   - Login as Citizen 2
   - Navigate to Incidents screen
   - Should see ONLY "Citizen 2 Report"
   - Should NOT see "Citizen 1 Report"

### Test 2: Agency Filtering

1. **Create Agency-Assigned Incidents:**
   ```sql
   -- Assign to PNP
   UPDATE incident_reports 
   SET assigned_to = (SELECT id FROM users WHERE role = 'pnp' LIMIT 1)
   WHERE id = 1;
   
   -- Assign to BFP
   UPDATE incident_reports 
   SET assigned_to = (SELECT id FROM users WHERE role = 'bfp' LIMIT 1)
   WHERE id = 2;
   ```

2. **Test PNP User (Web App):**
   - Login as `pnp@test.com`
   - Navigate to Incidents page
   - Should see ONLY incidents assigned to PNP
   - Should NOT see BFP or MDRRMO incidents

3. **Test BFP User (Web App):**
   - Login as `bfp@test.com`
   - Navigate to Incidents page
   - Should see ONLY incidents assigned to BFP
   - Should NOT see PNP or MDRRMO incidents

### Test 3: Admin Full Access

1. **Test Admin User (Web App):**
   - Login as `admin@test.com` or `mdrrmo@test.com`
   - Navigate to Incidents page
   - Should see ALL incidents
   - Should see incidents from all citizens
   - Should see incidents assigned to all agencies

## Recompile & Restart

After making these changes, you need to:

1. **Recompile Backend:**
   ```powershell
   cd MOBILE_APP/backend
   npm run build
   ```

2. **Restart Backend Server:**
   ```powershell
   npm start
   ```

3. **Rebuild Mobile App:**
   ```powershell
   cd MOBILE_APP/mobile
   # For development
   npx expo start
   
   # For APK build
   eas build --profile preview --platform android
   ```

## Security Benefits

✅ **Privacy Protection:** Citizens can't see other citizens' reports
✅ **Data Isolation:** Each agency only sees their assigned incidents
✅ **Role-Based Access:** Proper access control based on user role
✅ **Audit Trail:** All incidents still visible to admins for oversight

## Related Files

- `backend/src/services/incident.service.ts` - Filtering logic
- `backend/src/controllers/incident.controller.ts` - Pass user context
- `mobile/src/screens/incidents/IncidentsListScreen.tsx` - Role-based UI
- `mobile/src/services/incidents.ts` - API service
- `web_app/src/app/(admin)/incidents/page.tsx` - Admin UI

## Summary

The incident filtering system now properly enforces privacy and access control:

- Citizens see only their own reports (privacy protected)
- Agency roles see only their assigned incidents (data isolation)
- Admins see all incidents (oversight capability)
- Backend enforces filtering (security at API level)
- Mobile app uses correct endpoints (user experience)
