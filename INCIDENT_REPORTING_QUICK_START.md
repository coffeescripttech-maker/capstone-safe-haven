# Incident Reporting - Quick Start Guide

## Overview

The Incident Reporting feature allows users to report disasters, hazards, and emergencies with photos, location, and detailed descriptions.

## Setup

### 1. Install Dependencies

```powershell
# Run the setup script
.\setup-incident-reporting.ps1

# Or manually:
cd mobile
npm install

cd ../backend
npm run build
```

### 2. Start Services

```powershell
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Mobile App
cd mobile
npx expo start
```

## Using the Feature

### Report an Incident

1. **Open the app** and log in
2. **Tap "Reports" tab** (📋) in bottom navigation
3. **Tap the + button** (floating action button)
4. **Select incident type**:
   - 🏚️ Property Damage
   - 🚑 Injury/Casualty
   - 🔍 Missing Person
   - ⚠️ Hazard/Danger
   - 📝 Other
5. **Choose severity level**:
   - Low (green)
   - Moderate (orange)
   - High (red)
   - Critical (purple)
6. **Fill in details**:
   - Title (required)
   - Description (required)
   - Address (optional)
7. **Add photos** (optional, up to 5):
   - Tap "Add Photo"
   - Select from gallery
   - Photos are automatically compressed
8. **Location** is captured automatically from GPS
9. **Tap "Submit Report"**
10. **Confirmation** - Authorities are notified

### View Incidents

1. **Tap "Reports" tab** (📋)
2. **Browse incidents** - See all reported incidents
3. **Pull down** to refresh
4. **Tap an incident** to view full details
5. **View details**:
   - Full description
   - Location on map
   - Photo gallery
   - Reporter information
   - Status and severity

## Incident Types

| Type | Icon | Description |
|------|------|-------------|
| Damage | 🏚️ | Property or infrastructure damage |
| Injury | 🚑 | Injuries or casualties |
| Missing Person | 🔍 | Missing persons reports |
| Hazard | ⚠️ | Dangerous conditions or hazards |
| Other | 📝 | Other incidents |

## Severity Levels

| Level | Color | When to Use |
|-------|-------|-------------|
| Low | Green | Minor issues, no immediate danger |
| Moderate | Orange | Requires attention, some risk |
| High | Red | Serious situation, immediate action needed |
| Critical | Purple | Life-threatening, emergency response required |

## Status Workflow

1. **Pending** (Orange) - Just reported, awaiting verification
2. **Verified** (Blue) - Confirmed by authorities
3. **In Progress** (Purple) - Being addressed
4. **Resolved** (Green) - Issue resolved

## API Endpoints

### Create Incident
```http
POST /api/v1/incidents
Authorization: Bearer <token>
Content-Type: application/json

{
  "incidentType": "damage",
  "title": "Collapsed bridge",
  "description": "Bridge collapsed after heavy rains",
  "latitude": 14.5995,
  "longitude": 120.9842,
  "address": "Main Street, Barangay Centro",
  "severity": "high",
  "photos": ["data:image/jpeg;base64,..."]
}
```

### Get All Incidents
```http
GET /api/v1/incidents?severity=high&status=pending&limit=20&page=1
```

### Get Incident by ID
```http
GET /api/v1/incidents/123
```

### Get My Incidents
```http
GET /api/v1/incidents/my
Authorization: Bearer <token>
```

### Update Status (Admin Only)
```http
PATCH /api/v1/incidents/123/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "verified",
  "assignedTo": 5
}
```

## Testing

### Backend API Test
```powershell
cd backend
.\test-incidents.ps1
```

**Note**: Update the `$token` variable in the script with your auth token.

### Mobile App Test

1. **Create Test Incident**:
   - Use emulator location: Manila (14.5995, 120.9842)
   - Add test photos from gallery
   - Try different types and severities

2. **View Incidents**:
   - Check list displays correctly
   - Verify badges show right colors
   - Test pull-to-refresh

3. **View Details**:
   - Verify map shows correct location
   - Check photos display properly
   - Confirm all information is visible

## Troubleshooting

### "Location Required" Error
- **Cause**: GPS not enabled or permission denied
- **Fix**: Enable location services in device settings

### "Permission Required" for Photos
- **Cause**: Camera roll permission not granted
- **Fix**: Grant permission in device settings

### Photos Not Uploading
- **Cause**: Photos too large or network issue
- **Fix**: 
  - Photos are automatically compressed to 70% quality
  - Check internet connection
  - Try with fewer photos

### Backend 500 Error
- **Cause**: Database connection or missing columns
- **Fix**:
  - Check MySQL is running
  - Verify `incident_reports` table exists
  - Check backend logs for details

### Incidents Not Loading
- **Cause**: Backend not running or wrong API URL
- **Fix**:
  - Verify backend is running on port 3000
  - Check `mobile/src/constants/config.ts` for correct API URL
  - For Android emulator: `http://10.0.2.2:3000/api/v1`

## Tips

### For Best Results

1. **Clear Titles**: Use descriptive, concise titles
2. **Detailed Descriptions**: Provide as much information as possible
3. **Multiple Photos**: Add photos from different angles
4. **Accurate Location**: Ensure GPS is enabled for precise location
5. **Appropriate Severity**: Choose severity level carefully

### Photo Guidelines

- **Quality**: Photos are compressed to 70% quality
- **Limit**: Maximum 5 photos per report
- **Format**: JPEG format recommended
- **Size**: Each photo should be under 2MB before compression

### Privacy

- Your name and phone number are visible to authorities
- Location is shared with incident report
- Photos may be viewed by responders
- Reports are public (visible to all users)

## Admin Features

### Status Management

Admins and LGU officers can:
- Update incident status
- Assign incidents to responders
- Delete inappropriate reports

### Status Update Example
```typescript
await incidentService.updateIncidentStatus(
  incidentId,
  'verified',
  responderId
);
```

## Next Steps

After testing Incident Reporting:
1. **Offline Mode** - Queue reports when offline
2. **Family Locator** - Share location with family
3. **Community Bulletin** - Post community updates

## Support

For issues or questions:
1. Check backend logs: `backend/logs/`
2. Check mobile console: Expo DevTools
3. Review documentation: `PHASE_3_INCIDENT_REPORTING_COMPLETE.md`

## Bottom Navigation

Current tabs:
- 🏠 Home
- 🚨 Alerts
- 🏢 Centers
- 📞 Contacts
- 📚 Guides
- 📋 **Reports** ← New!
- 👤 Profile
