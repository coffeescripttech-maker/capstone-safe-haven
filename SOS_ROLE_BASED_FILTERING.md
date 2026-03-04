# 🔒 SOS Role-Based Filtering - Implementation Guide

## Overview

Implemented role-based filtering for the SOS alerts dashboard so that each user role only sees alerts relevant to them based on the `target_agency` field.

---

## Access Control Matrix

### Who Sees What

| User Role | Can See Alerts Targeted To | Example |
|-----------|---------------------------|---------|
| **Super Admin** | ALL alerts (no filtering) | Sees everything |
| **Admin** | ALL alerts (no filtering) | Sees everything |
| **PNP** | `pnp`, `all` | Only police-related alerts |
| **BFP** | `bfp`, `all` | Only fire-related alerts |
| **MDRRMO** | `mdrrmo`, `all` | Only disaster management alerts |
| **LGU Officer** | `barangay`, `lgu`, `all` | Local government alerts |
| **Citizen** | Own alerts only | Personal SOS history |

---

## Implementation Details

### 1. Backend Filtering

**File**: `MOBILE_APP/backend/src/services/sos.service.ts`

**Method**: `getSOSAlerts()`

#### Role-to-Agency Mapping

```typescript
const roleAgencyMap: Record<string, string[]> = {
  'pnp': ['pnp', 'all'],
  'bfp': ['bfp', 'all'],
  'mdrrmo': ['mdrrmo', 'all'],
  'lgu_officer': ['barangay', 'lgu', 'all']
};
```

#### SQL Query Logic

```sql
-- For PNP users
WHERE sa.target_agency IN ('pnp', 'all')

-- For BFP users
WHERE sa.target_agency IN ('bfp', 'all')

-- For MDRRMO users
WHERE sa.target_agency IN ('mdrrmo', 'all')

-- For LGU Officers
WHERE sa.target_agency IN ('barangay', 'lgu', 'all')

-- For Super Admin and Admin
-- No WHERE clause for target_agency (see all)
```

#### Code Implementation

```typescript
// Apply role-based filtering for target_agency
if (filters.userRole && filters.userRole !== 'super_admin' && filters.userRole !== 'admin') {
  const roleAgencyMap: Record<string, string[]> = {
    'pnp': ['pnp', 'all'],
    'bfp': ['bfp', 'all'],
    'mdrrmo': ['mdrrmo', 'all'],
    'lgu_officer': ['barangay', 'lgu', 'all']
  };

  const allowedAgencies = roleAgencyMap[filters.userRole] || ['all'];
  const placeholders = allowedAgencies.map(() => '?').join(',');
  whereConditions.push(`sa.target_agency IN (${placeholders})`);
  params.push(...allowedAgencies);
}
```

---

### 2. Web Portal Updates

**File**: `MOBILE_APP/web_app/src/app/(admin)/sos-alerts/page.tsx`

#### Added Features

1. **Agency Filter Dropdown**
   - Filter by specific agency
   - Shows all 6 agency options
   - Works alongside status and priority filters

2. **Agency Badge Column**
   - New column in alerts table
   - Color-coded badges with icons
   - Shows target agency for each alert

3. **Agency Badge Helper**
```typescript
const getAgencyBadge = (agency: string) => {
  const badges: Record<string, { color: string; icon: string }> = {
    all: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '🚨' },
    barangay: { color: 'bg-green-100 text-green-700 border-green-200', icon: '🏘️' },
    lgu: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '🏛️' },
    bfp: { color: 'bg-red-100 text-red-700 border-red-200', icon: '🚒' },
    pnp: { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: '👮' },
    mdrrmo: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: '⚠️' }
  };
  return badges[agency] || badges.all;
};
```

---

## User Experience Examples

### Example 1: PNP Officer Login

```
User: PNP Officer (role: 'pnp')
Logs into: http://localhost:3000/sos-alerts

What they see:
✅ SOS Alert #1 - target_agency: 'pnp'
✅ SOS Alert #3 - target_agency: 'all'
❌ SOS Alert #2 - target_agency: 'bfp' (hidden)
❌ SOS Alert #4 - target_agency: 'mdrrmo' (hidden)

Statistics shown:
- Only counts alerts they can see
- Response times for their agency only
```

### Example 2: BFP Personnel Login

```
User: Fire Officer (role: 'bfp')
Logs into: http://localhost:3000/sos-alerts

What they see:
✅ SOS Alert #2 - target_agency: 'bfp'
✅ SOS Alert #3 - target_agency: 'all'
❌ SOS Alert #1 - target_agency: 'pnp' (hidden)
❌ SOS Alert #5 - target_agency: 'lgu' (hidden)

Can filter by:
- Status (sent, acknowledged, etc.)
- Priority (low, medium, high, critical)
- Agency (shows only 'bfp' and 'all' in results)
```

### Example 3: Admin Login

```
User: System Admin (role: 'admin')
Logs into: http://localhost:3000/sos-alerts

What they see:
✅ ALL SOS alerts regardless of target_agency
✅ Complete system-wide view
✅ Can filter by any agency

Statistics shown:
- System-wide metrics
- All agencies combined
```

### Example 4: LGU Officer Login

```
User: LGU Officer (role: 'lgu_officer')
Logs into: http://localhost:3000/sos-alerts

What they see:
✅ SOS Alert #4 - target_agency: 'barangay'
✅ SOS Alert #5 - target_agency: 'lgu'
✅ SOS Alert #3 - target_agency: 'all'
❌ SOS Alert #1 - target_agency: 'pnp' (hidden)
❌ SOS Alert #2 - target_agency: 'bfp' (hidden)
```

---

## Security Benefits

### 1. Data Privacy
✅ Users only see alerts relevant to their role  
✅ Prevents information leakage between agencies  
✅ Maintains need-to-know principle  

### 2. Reduced Noise
✅ Responders focus on their alerts only  
✅ Less alert fatigue  
✅ Faster response times  

### 3. Clear Responsibility
✅ Each agency knows their scope  
✅ No confusion about jurisdiction  
✅ Better accountability  

### 4. Audit Trail
✅ All access is logged  
✅ Role-based filtering is transparent  
✅ Admins can see everything for oversight  

---

## Testing Guide

### Step 1: Create Test Users

```sql
-- Create test users with different roles
INSERT INTO users (email, phone, password_hash, first_name, last_name, role, is_active)
VALUES
('pnp@test.com', '09111111111', '$2b$10$...', 'PNP', 'Officer', 'pnp', true),
('bfp@test.com', '09222222222', '$2b$10$...', 'Fire', 'Officer', 'bfp', true),
('mdrrmo@test.com', '09333333333', '$2b$10$...', 'MDRRMO', 'Officer', 'mdrrmo', true),
('lgu@test.com', '09444444444', '$2b$10$...', 'LGU', 'Officer', 'lgu_officer', true);
```

### Step 2: Create Test SOS Alerts

```sql
-- Create alerts with different target agencies
INSERT INTO sos_alerts (user_id, message, target_agency, status, priority)
VALUES
(1, 'Police emergency', 'pnp', 'sent', 'high'),
(1, 'Fire emergency', 'bfp', 'sent', 'high'),
(1, 'Disaster alert', 'mdrrmo', 'sent', 'high'),
(1, 'Local issue', 'barangay', 'sent', 'medium'),
(1, 'General emergency', 'all', 'sent', 'critical');
```

### Step 3: Test Each Role

#### Test PNP Access
```bash
# Login as PNP officer
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pnp@test.com","password":"password123"}'

# Get SOS alerts (should see only pnp and all)
curl -X GET http://localhost:3001/api/v1/sos \
  -H "Authorization: Bearer <PNP_TOKEN>"

# Expected: 2 alerts (pnp + all)
```

#### Test BFP Access
```bash
# Login as BFP officer
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bfp@test.com","password":"password123"}'

# Get SOS alerts (should see only bfp and all)
curl -X GET http://localhost:3001/api/v1/sos \
  -H "Authorization: Bearer <BFP_TOKEN>"

# Expected: 2 alerts (bfp + all)
```

#### Test Admin Access
```bash
# Login as admin
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@safehaven.com","password":"admin123"}'

# Get SOS alerts (should see ALL)
curl -X GET http://localhost:3001/api/v1/sos \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

# Expected: 5 alerts (all of them)
```

### Step 4: Verify in Web Portal

1. Login as PNP officer → Should see 2 alerts
2. Login as BFP officer → Should see 2 alerts (different ones)
3. Login as Admin → Should see all 5 alerts
4. Use agency filter → Should work correctly for each role

---

## Database Queries for Verification

### Check Alert Distribution
```sql
SELECT 
  target_agency,
  COUNT(*) as count
FROM sos_alerts
GROUP BY target_agency;
```

### Verify Role-Based Access
```sql
-- What PNP should see
SELECT id, message, target_agency 
FROM sos_alerts 
WHERE target_agency IN ('pnp', 'all');

-- What BFP should see
SELECT id, message, target_agency 
FROM sos_alerts 
WHERE target_agency IN ('bfp', 'all');

-- What LGU should see
SELECT id, message, target_agency 
FROM sos_alerts 
WHERE target_agency IN ('barangay', 'lgu', 'all');
```

---

## Troubleshooting

### Issue: User sees all alerts (should be filtered)

**Check**:
1. Verify user role in database: `SELECT role FROM users WHERE id = ?`
2. Check JWT token contains role: Decode token and verify `role` field
3. Verify backend filtering logic is applied
4. Check logs for filtering SQL query

**Solution**:
```sql
-- Verify user role
SELECT id, email, role FROM users WHERE email = 'pnp@test.com';

-- Should return role = 'pnp'
```

### Issue: User sees no alerts (should see some)

**Check**:
1. Verify alerts exist with correct target_agency
2. Check user has permission to read sos_alerts
3. Verify role mapping includes their role

**Solution**:
```sql
-- Check if alerts exist for this role
SELECT COUNT(*) FROM sos_alerts WHERE target_agency IN ('pnp', 'all');

-- Should return > 0
```

### Issue: Admin sees filtered results (should see all)

**Check**:
1. Verify user role is exactly 'admin' or 'super_admin'
2. Check backend skips filtering for these roles

**Solution**:
```typescript
// Backend should have this check
if (filters.userRole !== 'super_admin' && filters.userRole !== 'admin') {
  // Apply filtering
}
```

---

## Performance Considerations

### Indexed Columns

```sql
-- Ensure these indexes exist for fast filtering
CREATE INDEX idx_target_agency ON sos_alerts(target_agency);
CREATE INDEX idx_status ON sos_alerts(status);
CREATE INDEX idx_created_at ON sos_alerts(created_at);
```

### Query Optimization

```sql
-- Optimized query with proper indexes
EXPLAIN SELECT sa.* 
FROM sos_alerts sa
WHERE sa.target_agency IN ('pnp', 'all')
  AND sa.status = 'sent'
ORDER BY sa.created_at DESC
LIMIT 20;

-- Should use idx_target_agency and idx_status
```

---

## Summary

### What Was Implemented

✅ **Backend Filtering**: Role-based SQL filtering in `getSOSAlerts()`  
✅ **Web Portal UI**: Agency filter dropdown and badge column  
✅ **Access Control**: Each role sees only relevant alerts  
✅ **Admin Override**: Super admin and admin see everything  
✅ **Security**: No data leakage between agencies  

### Benefits

✅ **Privacy**: Users only see what they need  
✅ **Efficiency**: Reduced noise and alert fatigue  
✅ **Clarity**: Clear responsibility per agency  
✅ **Scalability**: Easy to add new roles/agencies  

### Files Modified

1. `backend/src/services/sos.service.ts` - Added role-based filtering
2. `web_app/src/app/(admin)/sos-alerts/page.tsx` - Added agency column and filter

---

**Status**: ✅ Complete and Ready for Testing  
**Date**: March 4, 2026  
**Feature**: SOS Role-Based Filtering

