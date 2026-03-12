# SMS Blast Jurisdiction Setup Guide

## Problem

When trying to use SMS Blast as Admin or MDRRMO user, you get this error:
```json
{"status":"error","message":"Admin user has no jurisdiction assigned"}
```

## Why This Happens

For security reasons, Admin and MDRRMO users MUST have a jurisdiction assigned to use SMS Blast. This prevents them from sending SMS to areas outside their responsibility.

### Jurisdiction Levels

1. **Province Level**: `"Pangasinan"`
   - Can send SMS to ANY city/barangay in Pangasinan
   - Most common for MDRRMO users

2. **City Level**: `"Pangasinan:Dagupan"`
   - Can send SMS to ANY barangay in Dagupan City
   - Restricted to Dagupan only

3. **Barangay Level**: `"Pangasinan:Dagupan:Poblacion"`
   - Can send SMS ONLY to Poblacion barangay
   - Most restrictive

### Super Admin Exception

Super Admin users do NOT need jurisdiction - they have unrestricted access to all locations.

---

## Solution: Assign Jurisdiction

### Option 1: Using PowerShell Script (Recommended)

```powershell
cd MOBILE_APP/backend
.\assign-jurisdiction.ps1
```

This will:
- Find all admin/MDRRMO users
- Assign "Pangasinan" jurisdiction to users without jurisdiction
- Show current jurisdiction status

### Option 2: Using Node.js Script

```bash
cd MOBILE_APP/backend
node assign-jurisdiction.js
```

### Option 3: Using SQL (Manual)

```sql
-- View current users
SELECT id, email, role, jurisdiction 
FROM users 
WHERE role IN ('admin', 'mdrrmo');

-- Assign Pangasinan to all admin/MDRRMO users
UPDATE users 
SET jurisdiction = 'Pangasinan'
WHERE role IN ('admin', 'mdrrmo') 
AND jurisdiction IS NULL;

-- Assign specific jurisdiction to one user
UPDATE users 
SET jurisdiction = 'Pangasinan:Dagupan' 
WHERE id = 1;
```

---

## Verification

After assigning jurisdiction, verify it worked:

### 1. Check Database

```sql
SELECT id, email, role, jurisdiction 
FROM users 
WHERE role IN ('admin', 'mdrrmo');
```

Expected result:
```
+----+------------------+--------+-------------+
| id | email            | role   | jurisdiction|
+----+------------------+--------+-------------+
|  1 | admin@test.com   | admin  | Pangasinan  |
|  2 | mdrrmo@test.com  | mdrrmo | Pangasinan  |
+----+------------------+--------+-------------+
```

### 2. Test SMS Blast

1. Login as admin/MDRRMO user
2. Go to SMS Blast page
3. Try to estimate recipients
4. Should work without "no jurisdiction" error

---

## How Jurisdiction Works

### Province Level: `"Pangasinan"`

**Can send to**:
- ✅ Any city in Pangasinan (Dagupan, Urdaneta, etc.)
- ✅ Any barangay in Pangasinan
- ✅ All users in Pangasinan

**Cannot send to**:
- ❌ Other provinces (Manila, Cebu, etc.)

### City Level: `"Pangasinan:Dagupan"`

**Can send to**:
- ✅ Any barangay in Dagupan City
- ✅ All users in Dagupan City

**Cannot send to**:
- ❌ Other cities in Pangasinan (Urdaneta, etc.)
- ❌ Other provinces

### Barangay Level: `"Pangasinan:Dagupan:Poblacion"`

**Can send to**:
- ✅ Only Poblacion barangay
- ✅ Only users in Poblacion

**Cannot send to**:
- ❌ Other barangays in Dagupan
- ❌ Other cities
- ❌ Other provinces

---

## Common Scenarios

### Scenario 1: Municipal MDRRMO

**Jurisdiction**: `"Pangasinan:Dagupan"`

```sql
UPDATE users 
SET jurisdiction = 'Pangasinan:Dagupan' 
WHERE email = 'mdrrmo.dagupan@example.com';
```

This MDRRMO can send SMS to all barangays in Dagupan City.

### Scenario 2: Provincial MDRRMO

**Jurisdiction**: `"Pangasinan"`

```sql
UPDATE users 
SET jurisdiction = 'Pangasinan' 
WHERE email = 'mdrrmo.pangasinan@example.com';
```

This MDRRMO can send SMS to all cities and barangays in Pangasinan province.

### Scenario 3: Barangay Admin

**Jurisdiction**: `"Pangasinan:Dagupan:Poblacion"`

```sql
UPDATE users 
SET jurisdiction = 'Pangasinan:Dagupan:Poblacion' 
WHERE email = 'admin.poblacion@example.com';
```

This admin can only send SMS to Poblacion barangay.

---

## Troubleshooting

### Error: "Admin user has no jurisdiction assigned"

**Solution**: Assign jurisdiction using one of the methods above.

### Error: "Access denied - locations outside your jurisdiction"

**Problem**: User is trying to send SMS to locations outside their jurisdiction.

**Example**:
- User jurisdiction: `"Pangasinan:Dagupan"`
- Trying to send to: `"Pangasinan:Urdaneta"`
- Result: ❌ Access denied

**Solution**: 
1. Either change user's jurisdiction to province level
2. Or only send SMS to locations within their jurisdiction

### How to Change Jurisdiction

```sql
-- Change to province level (more access)
UPDATE users 
SET jurisdiction = 'Pangasinan' 
WHERE id = 1;

-- Change to city level (moderate access)
UPDATE users 
SET jurisdiction = 'Pangasinan:Dagupan' 
WHERE id = 1;

-- Change to barangay level (restricted access)
UPDATE users 
SET jurisdiction = 'Pangasinan:Dagupan:Poblacion' 
WHERE id = 1;
```

---

## Security Notes

### Why Jurisdiction is Required

1. **Prevents Abuse**: Admin can't send SMS to areas they don't manage
2. **Accountability**: Each SMS blast is tied to a specific jurisdiction
3. **Audit Trail**: All SMS operations are logged with jurisdiction info
4. **Compliance**: Ensures proper authorization for mass communications

### Super Admin Exception

Super Admin users bypass jurisdiction checks because they:
- Manage the entire system
- Need to send system-wide announcements
- Have full administrative privileges

### Audit Logging

All SMS Blast operations are logged with:
- User ID and role
- Jurisdiction
- Target locations
- Success/failure status
- Timestamp and IP address

---

## Quick Reference

### Check Current Jurisdiction

```sql
SELECT id, email, role, jurisdiction 
FROM users 
WHERE email = 'your-email@example.com';
```

### Assign Province Level

```sql
UPDATE users 
SET jurisdiction = 'Pangasinan' 
WHERE email = 'your-email@example.com';
```

### Assign City Level

```sql
UPDATE users 
SET jurisdiction = 'Pangasinan:Dagupan' 
WHERE email = 'your-email@example.com';
```

### Assign Barangay Level

```sql
UPDATE users 
SET jurisdiction = 'Pangasinan:Dagupan:Poblacion' 
WHERE email = 'your-email@example.com';
```

### Remove Jurisdiction (Not Recommended)

```sql
UPDATE users 
SET jurisdiction = NULL 
WHERE email = 'your-email@example.com';
-- Note: User will NOT be able to use SMS Blast after this
```

---

## Files Created

1. **MOBILE_APP/backend/assign-jurisdiction.js**
   - Node.js script to assign jurisdiction automatically

2. **MOBILE_APP/backend/assign-jurisdiction.ps1**
   - PowerShell script to run the Node.js script

3. **MOBILE_APP/database/assign-jurisdiction.sql**
   - SQL script for manual jurisdiction assignment

4. **MOBILE_APP/SMS_BLAST_JURISDICTION_SETUP.md**
   - This comprehensive guide

---

## Summary

To fix the "Admin user has no jurisdiction assigned" error:

1. Run: `cd MOBILE_APP/backend && .\assign-jurisdiction.ps1`
2. Or execute SQL: `UPDATE users SET jurisdiction = 'Pangasinan' WHERE role IN ('admin', 'mdrrmo');`
3. Verify: Check users table to confirm jurisdiction is set
4. Test: Login and try SMS Blast - should work now!

**Recommended Jurisdiction**: `"Pangasinan"` (province level) for most MDRRMO users.

---

**Status**: ✅ Solution Provided
**Date**: March 12, 2026
**Issue**: Admin/MDRRMO users need jurisdiction to use SMS Blast
**Fix**: Assign jurisdiction using provided scripts or SQL
