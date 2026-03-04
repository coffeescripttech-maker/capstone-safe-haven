# 🚨 SOS Agency Selection - Quick Summary

## What Was Implemented

Enhanced the SOS emergency alert system to allow users to select which specific agency should receive their alert.

---

## User Experience

### Before (Old System)
```
User taps SOS → Alert sent to EVERYONE
```

### After (New System)
```
User taps SOS → Selects Agency → Alert sent to SELECTED AGENCY
```

---

## Agency Options

| Icon | Agency | Who Gets Notified | Use Case |
|------|--------|-------------------|----------|
| 🚨 | All Agencies | Everyone | General emergency, unsure |
| 🏘️ | Barangay | Local officials | Community issues |
| 🏛️ | LGU | Local government | Municipal matters |
| 🚒 | BFP | Fire department | Fire, rescue |
| 👮 | PNP | Police | Crime, security |
| ⚠️ | MDRRMO | Disaster management | Natural disasters |

---

## How It Works

### 1. Mobile App (User Side)

**Location**: `mobile/src/components/home/SOSButton.tsx`

```
User Flow:
1. Tap SOS button
2. Modal shows 6 agency cards in grid
3. Select target agency (default: All)
4. Confirm
5. 3-second countdown
6. SOS sent with selected agency
```

### 2. Backend (Server Side)

**Location**: `backend/src/services/sos.service.ts`

```
Notification Routing:
- If "All" → Notify all agencies
- If "BFP" → Notify only BFP + admins
- If "PNP" → Notify only PNP + admins
- If "MDRRMO" → Notify only MDRRMO + admins
- If "Barangay/LGU" → Notify only LGU officers + admins

Always Notified:
- Emergency Services (911)
- User's emergency contact
- System admins
```

### 3. Database

**New Column**: `sos_alerts.target_agency`

```sql
ENUM('barangay', 'lgu', 'bfp', 'pnp', 'mdrrmo', 'all')
DEFAULT 'all'
```

---

## Setup Instructions

### Step 1: Apply Database Migration

```powershell
cd MOBILE_APP/backend
.\setup-sos-agency-selection.ps1
```

Or manually:
```bash
mysql -u root -p safehaven_db < ../database/migrations/011_add_target_agency_to_sos.sql
```

### Step 2: Restart Backend

```bash
cd MOBILE_APP/backend
npm run dev
```

### Step 3: Test Mobile App

```bash
cd MOBILE_APP/mobile
npm start
```

Then:
1. Login
2. Tap SOS button
3. See agency selection grid
4. Select an agency
5. Send SOS
6. Verify in database

---

## Testing

### Quick Test

```sql
-- Check if migration applied
DESCRIBE sos_alerts;
-- Should show target_agency column

-- Send test SOS from mobile app

-- Verify SOS created with target agency
SELECT id, user_id, target_agency, message, created_at 
FROM sos_alerts 
ORDER BY created_at DESC 
LIMIT 1;

-- Check who was notified
SELECT 
  sn.recipient_type,
  u.role,
  u.email,
  JSON_EXTRACT(sn.recipient_info, '$.agency') as agency
FROM sos_notifications sn
LEFT JOIN users u ON sn.recipient_id = u.id
WHERE sn.sos_alert_id = 1  -- Replace with your SOS ID
ORDER BY sn.created_at DESC;
```

---

## Benefits

### For Users
✅ Faster response from the right agency  
✅ Less confusion about who to contact  
✅ Still can notify everyone if unsure  

### For Responders
✅ Only receive relevant alerts  
✅ Less alert fatigue  
✅ Clear responsibility  

### For System
✅ Efficient notification routing  
✅ Better analytics  
✅ RBAC compliant  

---

## Files Modified

### New Files (3)
```
database/migrations/011_add_target_agency_to_sos.sql
backend/setup-sos-agency-selection.ps1
SOS_AGENCY_SELECTION_IMPLEMENTATION.md
```

### Modified Files (3)
```
mobile/src/components/home/SOSButton.tsx
backend/src/controllers/sos.controller.ts
backend/src/services/sos.service.ts
```

---

## Example Usage

### Fire Emergency
```
User selects: 🚒 BFP
Result: Only BFP personnel + admins notified
```

### Crime/Security
```
User selects: 👮 PNP
Result: Only PNP personnel + admins notified
```

### General Emergency
```
User selects: 🚨 All Agencies
Result: All agencies notified (BFP, PNP, MDRRMO, LGU)
```

### Local Issue
```
User selects: 🏘️ Barangay
Result: Only LGU officers + admins notified
```

---

## RBAC Integration

Works seamlessly with existing role-based access control:

```
Roles in System:
- super_admin (full access)
- admin (full access)
- pnp (police)
- bfp (fire)
- mdrrmo (disaster management)
- lgu_officer (local government)
- citizen (regular users)

Notification Routing:
- Matches target_agency to user roles
- Admins always notified (oversight)
- 911 always notified (safety)
```

---

## Status

✅ **Database Migration**: Ready  
✅ **Mobile App UI**: Implemented  
✅ **Backend API**: Updated  
✅ **Notification Routing**: Implemented  
✅ **RBAC Integration**: Complete  
✅ **Documentation**: Complete  

**Ready for**: Testing and Deployment

---

## Next Steps

1. ✅ Apply database migration
2. ✅ Test mobile app agency selection
3. ⏳ Test notification routing
4. ⏳ Update web portal to show target agency
5. ⏳ Add analytics for agency usage

---

## Documentation

- **Full Implementation Guide**: `SOS_AGENCY_SELECTION_IMPLEMENTATION.md`
- **Original SOS Feature**: `SOS_FEATURE_EXPLANATION.md`
- **RBAC Documentation**: `database/migrations/004_seed_role_permissions.sql`

---

**Date**: March 4, 2026  
**Feature**: SOS Agency Selection  
**Status**: ✅ Ready for Testing

