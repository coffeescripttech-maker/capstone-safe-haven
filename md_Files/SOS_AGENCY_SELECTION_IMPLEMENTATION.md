# 🚨 SOS Agency Selection Feature - Implementation Guide

## Overview

Enhanced the SOS feature to allow users to select which specific emergency agency should receive their alert: Barangay, LGU, BFP (Bureau of Fire Protection), PNP (Philippine National Police), MDRRMO (Municipal Disaster Risk Reduction and Management Office), or All Agencies.

---

## Changes Made

### 1. Database Migration

**File**: `MOBILE_APP/database/migrations/011_add_target_agency_to_sos.sql`

Added `target_agency` column to `sos_alerts` table:

```sql
ALTER TABLE sos_alerts 
ADD COLUMN target_agency ENUM('barangay', 'lgu', 'bfp', 'pnp', 'mdrrmo', 'all') 
DEFAULT 'all' 
AFTER priority;
```

**To Apply**:
```bash
cd MOBILE_APP/backend
mysql -u root -p safehaven_db < ../database/migrations/011_add_target_agency_to_sos.sql
```

Or using PowerShell:
```powershell
Get-Content ..\database\migrations\011_add_target_agency_to_sos.sql | mysql -u root -p safehaven_db
```

---

### 2. Mobile App UI Changes

**File**: `MOBILE_APP/mobile/src/components/home/SOSButton.tsx`

#### Added Agency Selection

- **Agency Grid**: 2-column grid showing all 6 agency options
- **Visual Indicators**: Each agency has an icon, label, and description
- **Selection State**: Selected agency highlighted with red border
- **Default**: "All Agencies" selected by default

#### Agency Options

| Agency | Icon | Description | Role Mapping |
|--------|------|-------------|--------------|
| All Agencies | 🚨 | Notify all emergency responders | All roles |
| Barangay | 🏘️ | Local barangay officials | lgu_officer |
| LGU | 🏛️ | Local Government Unit | lgu_officer |
| BFP | 🚒 | Bureau of Fire Protection | bfp |
| PNP | 👮 | Philippine National Police | pnp |
| MDRRMO | ⚠️ | Disaster Risk Management | mdrrmo |

#### UI Flow

```
1. User taps SOS button
   ↓
2. Modal opens with agency selection grid
   ↓
3. User selects target agency (default: All)
   ↓
4. User confirms
   ↓
5. 3-second countdown
   ↓
6. SOS sent with selected agency
```


---

### 3. Backend API Changes

#### Controller Updates

**File**: `MOBILE_APP/backend/src/controllers/sos.controller.ts`

- Added `targetAgency` parameter validation
- Validates against allowed agencies: `['barangay', 'lgu', 'bfp', 'pnp', 'mdrrmo', 'all']`
- Returns `targetAgency` in response

**Request Body**:
```typescript
{
  latitude: number,
  longitude: number,
  message: string,
  targetAgency: 'barangay' | 'lgu' | 'bfp' | 'pnp' | 'mdrrmo' | 'all',
  userInfo: {
    name: string,
    phone: string
  }
}
```

**Response**:
```typescript
{
  status: 'success',
  message: 'SOS alert sent successfully',
  data: {
    id: number,
    status: 'sent',
    targetAgency: string,
    createdAt: string
  }
}
```

#### Service Updates

**File**: `MOBILE_APP/backend/src/services/sos.service.ts`

##### Smart Notification Routing

The service now routes notifications based on the selected agency:

**1. All Agencies** (`targetAgency: 'all'`)
```
Notifies:
- Emergency Services (911)
- All LGU Officers
- All BFP Personnel
- All PNP Personnel
- All MDRRMO Personnel
- All Admins
- User's Emergency Contact
- Nearby Responders (all roles within 10km)
```

**2. Barangay/LGU** (`targetAgency: 'barangay'` or `'lgu'`)
```
Notifies:
- Emergency Services (911)
- LGU Officers only
- Admins
- User's Emergency Contact
- Nearby LGU Officers (within 10km)
```

**3. Specific Agency** (`targetAgency: 'bfp'`, `'pnp'`, or `'mdrrmo'`)
```
Notifies:
- Emergency Services (911)
- Selected Agency Personnel only
- Admins
- User's Emergency Contact
- Nearby Personnel from selected agency (within 10km)
```

##### New Methods

**`notifyAgency(sosId, role, agencyName)`**
- Queries users by specific role
- Sends push notifications to all active users with that role
- Logs notification count

**`notifyNearbyResponders(sosId, latitude, longitude, targetAgency, radiusKm)`**
- Filters responders by target agency
- Uses Haversine formula to find nearby responders
- Limits to 10 closest responders
- Includes distance in notification

---

### 4. Notification Routing Logic

#### Role Mapping

```typescript
const roleMapping = {
  'all': ['lgu_officer', 'admin', 'pnp', 'bfp', 'mdrrmo'],
  'barangay': ['lgu_officer', 'admin'],
  'lgu': ['lgu_officer', 'admin'],
  'bfp': ['bfp', 'admin'],
  'pnp': ['pnp', 'admin'],
  'mdrrmo': ['mdrrmo', 'admin']
};
```

#### SQL Query Example (Nearby Responders)

```sql
SELECT id, email, phone, role,
  (6371 * acos(
    cos(radians(?)) * cos(radians(latitude)) * 
    cos(radians(longitude) - radians(?)) + 
    sin(radians(?)) * sin(radians(latitude))
  )) AS distance
FROM users
WHERE role IN ('bfp', 'admin')  -- Filtered by target agency
  AND is_active = true
  AND latitude IS NOT NULL 
  AND longitude IS NOT NULL
HAVING distance < 10
ORDER BY distance
LIMIT 10
```

---

## Testing Guide

### Step 1: Apply Database Migration

```bash
cd MOBILE_APP/backend
mysql -u root -p safehaven_db < ../database/migrations/011_add_target_agency_to_sos.sql
```

Verify:
```sql
DESCRIBE sos_alerts;
-- Should show target_agency column
```

### Step 2: Test Mobile App

1. Start mobile app: `cd mobile && npm start`
2. Login with test user
3. Tap SOS button on home screen
4. **Verify Agency Selection Grid**:
   - Should see 6 agency cards in 2 columns
   - "All Agencies" should be selected by default (red border)
   - Tap different agencies to select them
5. Select "BFP" (Bureau of Fire Protection)
6. Tap "Send SOS"
7. Wait for 3-second countdown
8. Verify success message

### Step 3: Verify in Database

```sql
SELECT id, user_id, target_agency, message, created_at 
FROM sos_alerts 
ORDER BY created_at DESC 
LIMIT 1;

-- Should show target_agency = 'bfp'
```

### Step 4: Check Notifications

```sql
SELECT 
  sn.id,
  sn.sos_alert_id,
  sn.recipient_type,
  u.role,
  u.email,
  JSON_EXTRACT(sn.recipient_info, '$.agency') as agency
FROM sos_notifications sn
LEFT JOIN users u ON sn.recipient_id = u.id
WHERE sn.sos_alert_id = 1  -- Replace with your SOS ID
ORDER BY sn.created_at DESC;

-- Should show notifications sent only to BFP and admin users
```

### Step 5: Test Different Agencies

Repeat the process for each agency:

1. **Test Barangay**: Should notify only LGU officers
2. **Test LGU**: Should notify only LGU officers
3. **Test PNP**: Should notify only PNP personnel
4. **Test MDRRMO**: Should notify only MDRRMO personnel
5. **Test All**: Should notify all agencies


---

## Web Portal Updates (Optional Enhancement)

To display the target agency in the admin dashboard, update:

**File**: `MOBILE_APP/web_app/src/app/(admin)/sos-alerts/page.tsx`

Add target agency badge to the alerts table:

```typescript
// Add to interface
interface SOSAlert {
  // ... existing fields
  target_agency: string;
}

// Add to table column
<td className="px-6 py-4 whitespace-nowrap">
  <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full border ${getAgencyBadge(alert.target_agency)}`}>
    {getAgencyIcon(alert.target_agency)} {alert.target_agency.toUpperCase()}
  </span>
</td>

// Helper functions
const getAgencyBadge = (agency: string) => {
  const badges: Record<string, string> = {
    all: 'bg-purple-100 text-purple-700 border-purple-200',
    barangay: 'bg-green-100 text-green-700 border-green-200',
    lgu: 'bg-blue-100 text-blue-700 border-blue-200',
    bfp: 'bg-red-100 text-red-700 border-red-200',
    pnp: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    mdrrmo: 'bg-orange-100 text-orange-700 border-orange-200'
  };
  return badges[agency] || badges.all;
};

const getAgencyIcon = (agency: string) => {
  const icons: Record<string, string> = {
    all: '🚨',
    barangay: '🏘️',
    lgu: '🏛️',
    bfp: '🚒',
    pnp: '👮',
    mdrrmo: '⚠️'
  };
  return icons[agency] || '🚨';
};
```

---

## RBAC Integration

### How It Works with Existing RBAC

The SOS agency selection integrates seamlessly with the existing RBAC system:

#### 1. User Permissions (Already Implemented)

From `004_seed_role_permissions.sql`:

```sql
-- Citizens can create SOS alerts
('citizen', 'sos_alerts', 'create'),

-- All responder roles can read SOS alerts
('pnp', 'sos_alerts', 'read'),
('bfp', 'sos_alerts', 'read'),
('mdrrmo', 'sos_alerts', 'read'),
('lgu_officer', 'sos_alerts', 'read'),
('admin', 'sos_alerts', 'read'),
```

#### 2. Notification Filtering

When a user selects a specific agency:
- Only users with that role receive notifications
- Admins always receive notifications (oversight)
- Emergency services (911) always notified (safety)

#### 3. Web Portal Access

Each role sees SOS alerts based on their permissions:

**Admin/Super Admin**:
- See ALL SOS alerts regardless of target agency
- Can update status and assign responders

**BFP Personnel**:
- See SOS alerts where `target_agency = 'bfp'` OR `target_agency = 'all'`
- Can update status for their assigned alerts

**PNP Personnel**:
- See SOS alerts where `target_agency = 'pnp'` OR `target_agency = 'all'`
- Can update status for their assigned alerts

**MDRRMO Personnel**:
- See SOS alerts where `target_agency = 'mdrrmo'` OR `target_agency = 'all'`
- Can update status for their assigned alerts

**LGU Officers**:
- See SOS alerts where `target_agency IN ('barangay', 'lgu', 'all')`
- Can update status for their jurisdiction

---

## Benefits

### For Users (Citizens)

✅ **Targeted Response**: Get help from the right agency faster  
✅ **Reduced Noise**: Only relevant agencies are notified  
✅ **Flexibility**: Can still notify all agencies if unsure  
✅ **Clear Options**: Easy-to-understand agency selection  

### For Responders

✅ **Relevant Alerts**: Only receive alerts meant for their agency  
✅ **Faster Response**: Less alert fatigue, better focus  
✅ **Clear Responsibility**: Know when they're the primary responder  
✅ **Better Coordination**: Reduces duplicate responses  

### For System

✅ **Efficient Notifications**: Fewer unnecessary notifications  
✅ **Better Analytics**: Track which agencies are most needed  
✅ **Scalable**: Easy to add new agencies in the future  
✅ **RBAC Compliant**: Works with existing permission system  

---

## Example Scenarios

### Scenario 1: Fire Emergency

```
User Action:
1. Taps SOS button
2. Selects "BFP" (🚒 Bureau of Fire Protection)
3. Confirms and sends

System Response:
- Notifies all BFP personnel
- Notifies admins
- Notifies 911
- Notifies user's emergency contact
- Notifies nearby BFP responders (within 10km)
- Does NOT notify PNP, MDRRMO, or LGU (unless they're nearby)

Database:
target_agency = 'bfp'
```

### Scenario 2: Crime/Security Issue

```
User Action:
1. Taps SOS button
2. Selects "PNP" (👮 Philippine National Police)
3. Confirms and sends

System Response:
- Notifies all PNP personnel
- Notifies admins
- Notifies 911
- Notifies user's emergency contact
- Notifies nearby PNP responders (within 10km)
- Does NOT notify BFP, MDRRMO, or LGU (unless they're nearby)

Database:
target_agency = 'pnp'
```

### Scenario 3: General Emergency (Unsure)

```
User Action:
1. Taps SOS button
2. Keeps default "All Agencies" (🚨)
3. Confirms and sends

System Response:
- Notifies ALL agencies (BFP, PNP, MDRRMO, LGU)
- Notifies admins
- Notifies 911
- Notifies user's emergency contact
- Notifies nearby responders from all agencies (within 10km)

Database:
target_agency = 'all'
```

### Scenario 4: Local Barangay Issue

```
User Action:
1. Taps SOS button
2. Selects "Barangay" (🏘️)
3. Confirms and sends

System Response:
- Notifies LGU officers (includes barangay officials)
- Notifies admins
- Notifies 911
- Notifies user's emergency contact
- Notifies nearby LGU officers (within 10km)
- Does NOT notify BFP, PNP, or MDRRMO

Database:
target_agency = 'barangay'
```

---

## Future Enhancements

### Phase 1 (Current) ✅
- Agency selection in mobile app
- Smart notification routing
- Database schema update
- RBAC integration

### Phase 2 (Planned)
- Web portal filtering by target agency
- Agency-specific response time metrics
- Heat maps showing which agencies are most requested
- Auto-suggest agency based on emergency type

### Phase 3 (Planned)
- AI-powered agency recommendation
- Multi-agency coordination for complex emergencies
- Agency availability status
- Estimated response time per agency

---

## Troubleshooting

### Issue: Agency selection not showing

**Solution**:
1. Check mobile app is updated
2. Verify `SOSButton.tsx` has latest changes
3. Clear app cache and restart

### Issue: Wrong agency receiving notifications

**Solution**:
1. Check database: `SELECT target_agency FROM sos_alerts WHERE id = ?`
2. Verify user roles: `SELECT role FROM users WHERE id = ?`
3. Check notification logs: `SELECT * FROM sos_notifications WHERE sos_alert_id = ?`

### Issue: Database migration failed

**Solution**:
```sql
-- Check if column exists
DESCRIBE sos_alerts;

-- If column doesn't exist, run migration manually
ALTER TABLE sos_alerts 
ADD COLUMN target_agency ENUM('barangay', 'lgu', 'bfp', 'pnp', 'mdrrmo', 'all') 
DEFAULT 'all' 
AFTER priority;
```

---

## Summary

The SOS Agency Selection feature enhances the emergency alert system by:

1. **Empowering Users**: Let them choose the right agency for their emergency
2. **Optimizing Response**: Route alerts to the most relevant responders
3. **Reducing Noise**: Prevent alert fatigue for responders
4. **Maintaining Safety**: Always notify 911 and admins regardless of selection
5. **RBAC Compliant**: Works seamlessly with existing role-based permissions

**Status**: ✅ Implementation Complete  
**Ready for**: Testing and Deployment  
**Next Step**: Apply database migration and test in mobile app

