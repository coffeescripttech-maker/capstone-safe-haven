# 🏘️ Tayug Evacuation Centers Setup Guide

## Overview

This guide helps you populate evacuation centers for all 21 barangays in Tayug, Pangasinan so they appear in both the web admin portal and mobile app.

---

## 📋 Tayug Barangays (21 Total)

### Poblacion Barangays (4)
1. Barangay A (Poblacion)
2. Barangay B (Poblacion)
3. Barangay C (Poblacion)
4. Barangay D (Poblacion)

### Rural Barangays (17)
5. Agno
6. Amistad
7. Barangobong
8. C. Lichauco
9. Carriedo
10. Evangelista
11. Guzon
12. Lawak (Dacanay)
13. Legaspi
14. Libertad
15. Magallanes
16. Panganiban
17. Saleng
18. Santo Domingo
19. Toketec
20. Trenchera
21. Zamora

---

## 🚀 Quick Start

### Step 1: Apply SQL Script

```powershell
cd MOBILE_APP/database
.\apply-tayug-centers.ps1
```

**What it does:**
- Adds 21 evacuation centers (one per barangay)
- Sets default capacity: 150-200 people
- Sets status: Active
- Adds basic facilities (Restrooms, Water, First Aid, Kitchen)
- Uses approximate GPS coordinates

### Step 2: Verify in Web Admin

1. Open web admin: `http://localhost:3000/evacuation-centers`
2. You should see 21 new centers for Tayug
3. Filter by municipality: "Tayug"
4. Check that all barangays are listed

### Step 3: Verify in Mobile App

1. Open mobile app
2. Navigate to "Evacuation Centers"
3. You should see all 21 Tayug centers
4. Test the map view
5. Test the auto-navigation feature

---

## 📊 Default Data Structure

Each evacuation center includes:

| Field | Value | Notes |
|-------|-------|-------|
| **Name** | `[Barangay] Barangay Hall Evacuation Center` | Standard naming |
| **Address** | `Barangay [Name], Tayug` | Full address |
| **Barangay** | Actual barangay name | Exact match |
| **Municipality** | `Tayug` | Fixed |
| **Province** | `Pangasinan` | Fixed |
| **Latitude** | Approximate | ⚠️ **NEEDS UPDATE** |
| **Longitude** | Approximate | ⚠️ **NEEDS UPDATE** |
| **Capacity** | 150-200 | Poblacion: 200, Others: 150 |
| **Current Occupancy** | 0 | Empty by default |
| **Contact Number** | `09171234567` | ⚠️ **NEEDS UPDATE** |
| **Contact Person** | `Barangay Captain - [Name]` | Generic |
| **Facilities** | Basic set | Can be updated |
| **Status** | `active` | Ready to use |
| **Is Active** | `true` | Visible in app |

---

## ⚠️ Important: Update Required Data

### 1. GPS Coordinates

**Current**: Approximate coordinates based on Tayug center  
**Action Required**: Update with actual barangay hall locations

```sql
-- Example: Update Agno coordinates
UPDATE evacuation_centers
SET 
  latitude = 16.0295,  -- Actual latitude
  longitude = 120.7485  -- Actual longitude
WHERE barangay = 'Agno' AND municipality = 'Tayug';
```

**How to get coordinates:**
1. Open Google Maps
2. Search for "[Barangay] Barangay Hall, Tayug, Pangasinan"
3. Right-click on location → Click coordinates
4. Copy latitude and longitude
5. Update database

### 2. Contact Numbers

**Current**: Placeholder numbers (09171234567, etc.)  
**Action Required**: Update with actual barangay contact numbers

```sql
-- Example: Update Agno contact
UPDATE evacuation_centers
SET 
  contact_number = '09171234567',  -- Actual number
  contact_person = 'Hon. Juan Dela Cruz'  -- Actual captain name
WHERE barangay = 'Agno' AND municipality = 'Tayug';
```

### 3. Capacity

**Current**: Estimated (150-200)  
**Action Required**: Update with actual barangay hall capacity

```sql
-- Example: Update Agno capacity
UPDATE evacuation_centers
SET capacity = 180  -- Actual capacity
WHERE barangay = 'Agno' AND municipality = 'Tayug';
```

### 4. Facilities

**Current**: Basic set (Restrooms, Water Supply, First Aid, Kitchen)  
**Action Required**: Add actual facilities available

```sql
-- Example: Update Agno facilities
UPDATE evacuation_centers
SET facilities = JSON_ARRAY(
  'Restrooms',
  'Water Supply',
  'First Aid',
  'Kitchen',
  'Generator',
  'Medical Supplies',
  'Sleeping Mats',
  'Blankets'
)
WHERE barangay = 'Agno' AND municipality = 'Tayug';
```

---

## 🗺️ Coordinate Reference

Approximate coordinates for Tayug barangays (center of municipality: 16.028°N, 120.752°E):

| Barangay | Approx Latitude | Approx Longitude | Notes |
|----------|----------------|------------------|-------|
| Agno | 16.0290 | 120.7480 | North-west |
| Amistad | 16.0310 | 120.7500 | North-west |
| Barangay A (Poblacion) | 16.0280 | 120.7520 | Center |
| Barangay B (Poblacion) | 16.0270 | 120.7530 | Center |
| Barangay C (Poblacion) | 16.0260 | 120.7540 | Center |
| Barangay D (Poblacion) | 16.0250 | 120.7550 | Center |
| Barangobong | 16.0330 | 120.7460 | North |
| C. Lichauco | 16.0240 | 120.7560 | South-east |
| Carriedo | 16.0350 | 120.7440 | North |
| Evangelista | 16.0230 | 120.7570 | South-east |
| Guzon | 16.0370 | 120.7420 | North |
| Lawak (Dacanay) | 16.0220 | 120.7580 | South-east |
| Legaspi | 16.0390 | 120.7400 | North |
| Libertad | 16.0210 | 120.7590 | South-east |
| Magallanes | 16.0410 | 120.7380 | North |
| Panganiban | 16.0200 | 120.7600 | South-east |
| Saleng | 16.0430 | 120.7360 | North |
| Santo Domingo | 16.0190 | 120.7610 | South-east |
| Toketec | 16.0450 | 120.7340 | North |
| Trenchera | 16.0180 | 120.7620 | South-east |
| Zamora | 16.0470 | 120.7320 | North |

⚠️ **These are approximate!** Please verify and update with actual barangay hall locations.

---

## 📱 How Users Will See It

### Web Admin Portal

**URL**: `http://localhost:3000/evacuation-centers`

**Features:**
- List view with all 21 centers
- Filter by barangay, municipality, status
- Search by name
- Map view showing all locations
- Edit/update center details
- View capacity and occupancy
- Manage reservations

### Mobile App

**Screen**: Evacuation Centers

**Features:**
- List view with cards for each center
- Distance from user's location
- Tap to see details
- Auto-navigation to center
- View facilities and capacity
- Reserve slots (if enabled)
- Call contact number

---

## 🧪 Testing Checklist

### Web Admin
- [ ] All 21 centers appear in list
- [ ] Filter by "Tayug" works
- [ ] Search by barangay name works
- [ ] Map shows all 21 markers
- [ ] Click marker shows center details
- [ ] Edit center works
- [ ] Status toggle works

### Mobile App
- [ ] All 21 centers appear in list
- [ ] Centers sorted by distance
- [ ] Tap center shows details
- [ ] Map view shows all markers
- [ ] Auto-navigation works
- [ ] Call button works
- [ ] Facilities list displays correctly

---

## 🔧 Troubleshooting

### Centers Don't Appear in Web Admin

**Check:**
1. Database connection working?
2. SQL script executed successfully?
3. Backend server running?
4. Check browser console for errors

**Solution:**
```powershell
# Verify centers in database
cd MOBILE_APP/backend
npm start

# In another terminal
mysql -u root -p safehaven_db
SELECT COUNT(*) FROM evacuation_centers WHERE municipality = 'Tayug';
# Should return 21
```

### Centers Don't Appear in Mobile App

**Check:**
1. Backend API running?
2. Mobile app connected to backend?
3. Check mobile app console logs

**Solution:**
```powershell
# Check API endpoint
curl http://localhost:3001/api/v1/evacuation-centers?municipality=Tayug

# Should return 21 centers
```

### Map Doesn't Show Markers

**Check:**
1. Coordinates are valid (not NULL)?
2. Mapbox token configured?
3. Internet connection available?

**Solution:**
```sql
-- Check for NULL coordinates
SELECT id, name, barangay, latitude, longitude
FROM evacuation_centers
WHERE municipality = 'Tayug'
AND (latitude IS NULL OR longitude IS NULL);

-- Should return 0 rows
```

---

## 📝 SQL Queries for Management

### View All Tayug Centers
```sql
SELECT 
  id,
  name,
  barangay,
  capacity,
  current_occupancy,
  status,
  is_active
FROM evacuation_centers
WHERE municipality = 'Tayug'
ORDER BY barangay;
```

### Update All Contact Numbers at Once
```sql
-- Prepare CSV with: barangay, contact_number, contact_person
-- Then use UPDATE statements or import tool
```

### Activate/Deactivate Centers
```sql
-- Deactivate a center
UPDATE evacuation_centers
SET is_active = false, status = 'inactive'
WHERE barangay = 'Agno' AND municipality = 'Tayug';

-- Activate a center
UPDATE evacuation_centers
SET is_active = true, status = 'active'
WHERE barangay = 'Agno' AND municipality = 'Tayug';
```

### Update Occupancy
```sql
-- Set current occupancy
UPDATE evacuation_centers
SET current_occupancy = 50
WHERE barangay = 'Agno' AND municipality = 'Tayug';
```

---

## 🎯 Next Steps

### Immediate (Required)
1. ✅ Run SQL script to add centers
2. ⚠️ Update GPS coordinates with actual locations
3. ⚠️ Update contact numbers with real barangay contacts
4. ✅ Verify centers appear in web admin
5. ✅ Verify centers appear in mobile app

### Short-term (Recommended)
1. Update capacity with actual barangay hall capacity
2. Update facilities with actual available facilities
3. Add photos of each evacuation center
4. Test reservation system
5. Train barangay officials on system usage

### Long-term (Optional)
1. Add multiple evacuation centers per barangay (schools, gyms, etc.)
2. Integrate with weather alerts for auto-activation
3. Add real-time occupancy tracking
4. Add facility status updates (water available, generator working, etc.)
5. Add evacuation routes and safe zones

---

## 📞 Support

If you encounter issues:

1. Check database connection
2. Verify SQL script executed successfully
3. Check backend logs: `MOBILE_APP/backend/logs/`
4. Check mobile app logs in console
5. Verify API endpoints are working

---

## ✅ Summary

**What You Get:**
- 21 evacuation centers for Tayug
- One center per barangay
- Ready to use in web admin and mobile app
- Basic facilities and contact info
- Active and visible by default

**What You Need to Update:**
- GPS coordinates (approximate → actual)
- Contact numbers (placeholder → real)
- Contact person names (generic → actual)
- Capacity (estimated → actual)
- Facilities (basic → complete)

**Files Created:**
- `database/add-tayug-evacuation-centers.sql` - SQL script
- `database/apply-tayug-centers.ps1` - PowerShell script
- `TAYUG_EVACUATION_CENTERS_SETUP.md` - This guide

**Ready to use!** 🎉
