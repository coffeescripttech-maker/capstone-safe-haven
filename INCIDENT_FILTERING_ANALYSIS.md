# Incident Filtering Analysis & Requirements

## Current Implementation Review

### Backend (incident.service.ts)

**Current Filtering Logic:**
```typescript
// Filter by assigned agency for agency roles (PNP, BFP, MDRRMO)
// Super admin and admin see all incidents
if (userRole && ['pnp', 'bfp', 'mdrrmo'].includes(userRole)) {
  query += ' AND assigned_user.role = ?';
  params.push(userRole);
}
```

**Issues:**
1. ✅ PNP/BFP/MDRRMO filtering works correctly - they only see incidents assigned to them
2. ✅ Super admin and admin see all incidents
3. ❌ **CRITICAL**: Citizens see ALL incidents, not just their own
4. ❌ LGU officers filtering not implemented

### Mobile App (IncidentsListScreen.tsx)

**Current Implementation:**
```typescript
const loadIncidents = async () => {
  const response = await incidentService.getIncidents({ limit: 50 });
  setIncidents(response.data);
};
```

**Issues:**
1. ❌ Calls `/incidents` endpoint which returns ALL incidents
2. ❌ Should call `/incidents/my` for citizens to see only their own reports
3. ❌ No role-based logic to determine which endpoint to call

### Web App (incidents/page.tsx)

**Current Implementation:**
```typescript
const response = await incidentsApi.getAll(params);
```

**Issues:**
1. ✅ Uses the same `/incidents` endpoint with role-based filtering
2. ✅ Backend filters correctly for agency roles
3. ⚠️ Citizens shouldn't access web app, but if they do, they see all incidents

## Required Behavior

### Role-Based Incident Visibility

| Role        | Can See                                    | Endpoint          |
|-------------|--------------------------------------------|-------------------|
| super_admin | ALL incidents                              | `/incidents`      |
| admin       | ALL incidents (MDRRMO)                     | `/incidents`      |
| mdrrmo      | ALL incidents                              | `/incidents`      |
| pnp         | Only incidents assigned to PNP             | `/incidents`      |
| bfp         | Only incidents assigned to BFP             | `/incidents`      |
| lgu_officer | Incidents in their jurisdiction            | `/incidents`      |
| citizen     | Only their own submitted reports           | `/incidents/my`   |

## Required Changes

### 1. Backend - Add Citizen Filtering

**File:** `backend/src/services/incident.service.ts`

Add citizen filtering after agency filtering:

```typescript
// Filter by assigned agency for agency roles (PNP, BFP, MDRRMO)
if (userRole && ['pnp', 'bfp', 'mdrrmo'].includes(userRole)) {
  query += ' AND assigned_user.role = ?';
  params.push(userRole);
}

// Citizens can only see their own incidents
if (userRole === 'citizen' && userId) {
  query += ' AND ir.user_id = ?';
  params.push(userId);
}
```

**Note:** Need to pass `userId` to the service method.

### 2. Backend - Update Controller

**File:** `backend/src/controllers/incident.controller.ts`

Pass user ID to service:

```typescript
async getIncidents(req: AuthRequest, res: Response) {
  const filters = {
    type: req.query.type as string,
    severity: req.query.severity as string,
    status: req.query.status as string,
    userId: req.query.userId ? parseInt(req.query.userId as string) : undefined,
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string,
    page: req.query.page ? parseInt(req.query.page as string) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    userRole: req.user?.role,
    userJurisdiction: req.user?.jurisdiction,
    currentUserId: req.user?.id  // Add this for citizen filtering
  };

  const result = await incidentService.getIncidents(filters);
  // ...
}
```

### 3. Backend - Update Service Interface

**File:** `backend/src/services/incident.service.ts`

```typescript
export interface IncidentFilters {
  type?: string;
  severity?: string;
  status?: string;
  userId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  userRole?: string;
  userJurisdiction?: string | null;
  currentUserId?: number;  // Add this
}
```

### 4. Mobile App - Use Role-Based Endpoint

**File:** `mobile/src/screens/incidents/IncidentsListScreen.tsx`

```typescript
import { useAuth } from '../../store/AuthContext';

export const IncidentsListScreen: React.FC = () => {
  const { user } = useAuth();
  
  const loadIncidents = async () => {
    try {
      // Citizens see only their own incidents
      if (user?.role === 'citizen') {
        const response = await incidentService.getMyIncidents();
        setIncidents(response);
      } else {
        // Admins and agency roles see filtered incidents
        const response = await incidentService.getIncidents({ limit: 50 });
        setIncidents(response.data);
      }
    } catch (error) {
      console.error('Error loading incidents:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  // ...
}
```

### 5. Web App - Already Correct

The web app already uses the `/incidents` endpoint with role-based filtering in the backend. No changes needed.

## Testing Plan

### Test Case 1: Citizen User (Mobile App)
1. Login as citizen (e.g., `citizen@test.com`)
2. Navigate to Incidents screen
3. Should see ONLY incidents they reported
4. Should NOT see incidents from other citizens
5. Should NOT see incidents assigned to agencies

### Test Case 2: PNP User (Web App)
1. Login as PNP (e.g., `pnp@test.com`)
2. Navigate to Incidents page
3. Should see ONLY incidents assigned to PNP
4. Should NOT see BFP or MDRRMO incidents
5. Should NOT see unassigned incidents

### Test Case 3: BFP User (Web App)
1. Login as BFP (e.g., `bfp@test.com`)
2. Navigate to Incidents page
3. Should see ONLY incidents assigned to BFP
4. Should NOT see PNP or MDRRMO incidents

### Test Case 4: MDRRMO/Admin (Web App)
1. Login as MDRRMO (e.g., `mdrrmo@test.com`)
2. Navigate to Incidents page
3. Should see ALL incidents (no filtering)
4. Can see incidents from all agencies and citizens

### Test Case 5: Super Admin (Web App)
1. Login as super admin
2. Navigate to Incidents page
3. Should see ALL incidents (no filtering)
4. Full visibility across all reports

## Summary

**Current Issues:**
- ❌ Citizens in mobile app see ALL incidents (privacy violation)
- ✅ Agency filtering works correctly
- ✅ Admin/MDRRMO see all incidents

**Required Fixes:**
1. Add citizen filtering in backend service
2. Update mobile app to use `/incidents/my` for citizens
3. Pass currentUserId to service for filtering

**Priority:** HIGH - This is a privacy and security issue
