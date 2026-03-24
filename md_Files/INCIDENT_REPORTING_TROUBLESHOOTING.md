# Incident Reporting - Troubleshooting Guide

## Common Issues and Solutions

### 1. "Got a packet bigger than 'max_allowed_packet' bytes"

**Problem**: Photos are too large for MySQL to handle.

**Root Cause**: Base64-encoded photos can be 33% larger than original, and MySQL has a default packet size limit of 4MB.

**Solutions**:

#### Option A: Increase MySQL Packet Size (Recommended)

**Quick Fix** (temporary until MySQL restart):
```sql
-- Run in MySQL Workbench or command line
SET GLOBAL max_allowed_packet=67108864;  -- 64MB

-- Verify
SHOW VARIABLES LIKE 'max_allowed_packet';
```

**Permanent Fix**:
1. Find your MySQL config file:
   - Windows: `C:\ProgramData\MySQL\MySQL Server 8.0\my.ini`
   - Mac: `/etc/my.cnf` or `/usr/local/etc/my.cnf`
   - Linux: `/etc/mysql/my.cnf`

2. Add under `[mysqld]` section:
```ini
[mysqld]
max_allowed_packet=64M
```

3. Restart MySQL service:
```powershell
# Windows
net stop MySQL80
net start MySQL80

# Or use Services app (services.msc)
```

#### Option B: Reduce Photo Size (Already Applied)

The code has been updated to use 30% quality instead of 70%:
- Restart your mobile app to apply changes
- Photos will be smaller but still clear
- Can upload more photos without hitting limit

#### Option C: Upload Fewer Photos

- Limit to 1-2 photos per report instead of 5
- Use smaller resolution images
- Crop images before uploading

---

### 2. "ImagePicker.MediaTypeOptions deprecated" Warning

**Problem**: Expo updated their API and deprecated `MediaTypeOptions`.

**Solution**: ✅ Already fixed in code
- Changed from `ImagePicker.MediaTypeOptions.Images`
- To `['images']` (new array format)
- Warning will disappear after app restart

---

### 3. "Location Required" Error

**Problem**: GPS not enabled or permission denied.

**Solutions**:
1. Enable location services on device
2. Grant location permission to Expo Go
3. For Android emulator:
   - Use Extended Controls (⋮ button)
   - Go to Location tab
   - Set a location (e.g., Manila: 14.5995, 120.9842)

---

### 4. "Permission Required" for Photos

**Problem**: Camera roll permission not granted.

**Solutions**:
1. Grant permission when prompted
2. Or go to device Settings:
   - Android: Settings > Apps > Expo Go > Permissions > Storage
   - iOS: Settings > Expo Go > Photos

---

### 5. Photos Not Displaying in Details

**Problem**: Photos stored as base64 but not rendering.

**Solutions**:
1. Check if photos array is not empty
2. Verify base64 format: `data:image/jpeg;base64,...`
3. Check backend logs for errors
4. Try with smaller photos

---

### 6. Backend 500 Error on Create

**Problem**: Various backend errors.

**Common Causes**:
1. **MySQL not running**
   - Start MySQL service
   - Check connection in backend logs

2. **Missing table**
   - Run: `database/schema.sql`
   - Verify `incident_reports` table exists

3. **Invalid data**
   - Check required fields: type, title, description, lat, lng, severity
   - Verify enum values match database

4. **Packet size** (see issue #1 above)

---

### 7. Incidents List Not Loading

**Problem**: Empty list or loading forever.

**Solutions**:
1. Check backend is running on port 3000
2. Verify API URL in `mobile/src/constants/config.ts`:
   - Android emulator: `http://10.0.2.2:3000/api/v1`
   - iOS simulator: `http://localhost:3000/api/v1`
   - Physical device: `http://YOUR_IP:3000/api/v1`
3. Check backend logs for errors
4. Try pull-to-refresh

---

### 8. Photos Taking Too Long to Upload

**Problem**: Upload is slow or times out.

**Solutions**:
1. Use fewer photos (1-2 instead of 5)
2. Reduce quality further (change `quality: 0.3` to `0.2`)
3. Check internet connection
4. Use WiFi instead of mobile data
5. Consider implementing cloud storage (future enhancement)

---

## Photo Size Comparison

| Quality | Original Size | Base64 Size | Recommended |
|---------|--------------|-------------|-------------|
| 1.0 (100%) | 2-3 MB | 3-4 MB | ❌ Too large |
| 0.7 (70%) | 500 KB - 1 MB | 700 KB - 1.3 MB | ⚠️ May fail with 5 photos |
| 0.3 (30%) | 100-200 KB | 130-260 KB | ✅ Recommended |
| 0.2 (20%) | 50-100 KB | 65-130 KB | ✅ Very safe |

**Current Setting**: 0.3 (30% quality)

---

## MySQL Configuration

### Check Current Settings
```sql
SHOW VARIABLES LIKE 'max_allowed_packet';
```

### Recommended Settings
```sql
SET GLOBAL max_allowed_packet=67108864;  -- 64MB
SET GLOBAL wait_timeout=300;             -- 5 minutes
SET GLOBAL interactive_timeout=300;      -- 5 minutes
```

### Verify Changes
```sql
SHOW VARIABLES LIKE '%packet%';
SHOW VARIABLES LIKE '%timeout%';
```

---

## Testing Checklist

After applying fixes:

- [ ] MySQL packet size increased to 64MB
- [ ] Backend restarted
- [ ] Mobile app restarted
- [ ] Can create incident without photos
- [ ] Can create incident with 1 photo
- [ ] Can create incident with 2-3 photos
- [ ] Can create incident with 5 photos
- [ ] Photos display in details screen
- [ ] Incidents list loads properly
- [ ] Pull-to-refresh works

---

## Quick Fixes Summary

### 1. Run SQL Command
```sql
SET GLOBAL max_allowed_packet=67108864;
```

### 2. Restart Backend
```powershell
cd backend
# Stop current server (Ctrl+C)
npm start
```

### 3. Restart Mobile App
```powershell
cd mobile
# Stop Expo (Ctrl+C)
npx expo start
# Press 'r' to reload app
```

---

## Alternative: Use Cloud Storage (Future Enhancement)

For production, consider:
1. **AWS S3** - Store photos in S3 bucket
2. **Firebase Storage** - Easy integration with Firebase
3. **Cloudinary** - Image optimization and CDN
4. **Azure Blob Storage** - Microsoft cloud storage

**Benefits**:
- No database size issues
- Faster uploads
- Image optimization
- CDN delivery
- Automatic backups

**Implementation** (future):
```typescript
// Upload to cloud storage
const photoUrl = await uploadToS3(base64Photo);

// Store only URL in database
await incidentService.createIncident({
  ...data,
  photos: [photoUrl], // URLs instead of base64
});
```

---

## Debug Commands

### Check Backend Logs
```powershell
cd backend
# Logs are in backend/logs/ folder
type logs\error.log
type logs\combined.log
```

### Check MySQL Connection
```sql
SHOW PROCESSLIST;
SHOW STATUS LIKE 'Threads_connected';
```

### Test API Directly
```powershell
# Test without photos
curl -X POST http://localhost:3000/api/v1/incidents `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{
    "incidentType": "damage",
    "title": "Test incident",
    "description": "Testing without photos",
    "latitude": 14.5995,
    "longitude": 120.9842,
    "severity": "low"
  }'
```

---

## Support

If issues persist:
1. Check backend logs: `backend/logs/`
2. Check mobile console: Expo DevTools
3. Verify MySQL is running: `services.msc`
4. Check database connection: MySQL Workbench
5. Review error messages carefully

---

## Performance Tips

1. **Limit Photos**: Use 1-2 photos per report
2. **Compress Before Upload**: Use lower quality setting
3. **WiFi Only**: Upload on WiFi for faster speeds
4. **Batch Uploads**: Consider queuing for offline support
5. **Monitor Size**: Keep total request under 10MB

---

## Status

- ✅ Photo quality reduced to 30%
- ✅ Deprecated warning fixed
- ⏳ MySQL packet size needs manual increase
- ⏳ Backend restart required
- ⏳ App restart required

Run `.\fix-photo-upload-issue.ps1` for step-by-step instructions.
