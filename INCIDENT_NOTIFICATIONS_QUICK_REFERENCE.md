# Incident Notifications - Quick Reference 🚀

## Quick Start

### For Responders (Web Portal)

1. **Login** to web portal
2. **Look for orange bell** 🔔 in header (next to red SOS bell)
3. **Badge shows** number of new high-priority incidents
4. **Click bell** to see incident previews
5. **Click incident** to view full details
6. **Update status** as you respond

### For Citizens (Mobile App)

1. **Open mobile app**
2. **Go to Incident Reporting**
3. **Fill out form** (type, severity, description, location, photos)
4. **Submit report**
5. **Responders notified** automatically (if high/critical severity)

---

## Notification Bell Colors

| Bell Color | Type | Priority |
|-----------|------|----------|
| 🔴 Red | SOS Alerts | Emergency |
| 🟠 Orange | Incident Reports | High/Critical |

---

## Incident Severities

| Severity | Color | Notifies? |
|----------|-------|-----------|
| 🔴 Critical | Red | ✅ Yes |
| 🟠 High | Orange | ✅ Yes |
| 🟡 Moderate | Yellow | ✅ Yes |
| 🟢 Low | Green | ✅ Yes |

**Note**: All severity levels trigger notifications so responders have complete visibility.

---

## Incident Types

| Type | Icon | Description |
|------|------|-------------|
| Damage | 🏚️ | Property/infrastructure damage |
| Injury | 🚑 | Medical emergency/injury |
| Missing Person | 🔍 | Person reported missing |
| Hazard | ⚠️ | Environmental/safety hazard |
| Fire | 🔥 | Fire incident |
| Other | 📋 | Other incidents |

---

## Incident Statuses

| Status | Icon | Color | Description |
|--------|------|-------|-------------|
| Pending | ⏳ | Yellow | Awaiting response |
| In Progress | 🔄 | Blue | Being handled |
| Resolved | ✅ | Green | Issue resolved |
| Closed | ❌ | Gray | Case closed |

---

## How to Respond to Incidents

### From Notification Bell

1. **Click orange bell** in header
2. **See incident preview** in dropdown
3. **Click incident** to view details
4. **Review information** (location, photos, reporter)
5. **Update status** using dropdown
6. **Click "Update Status"** button

### From Incidents Page

1. **Go to Incidents** page
2. **Use filters** to find specific incidents
3. **Click eye icon** to view details
4. **Follow same steps** as above

---

## Auto-Refresh

The incidents page automatically refreshes every 15 seconds:
- ✅ Shows new incidents without manual refresh
- ✅ Respects your current filters
- ✅ Shows toast notification when refreshed
- ✅ Doesn't interrupt your work

---

## Incident Detail Page Features

### Information Displayed
- ✅ Incident title and description
- ✅ Severity and status badges
- ✅ Reporter name and phone
- ✅ Incident type
- ✅ Report date and time
- ✅ Last update time

### Interactive Map
- ✅ Shows exact incident location
- ✅ Orange marker on map
- ✅ Address displayed (if available)
- ✅ "Google Maps" button
- ✅ "Get Directions" button

### Photos
- ✅ View all attached photos
- ✅ Grid layout
- ✅ Click to enlarge

### Status Update
- ✅ Dropdown to change status
- ✅ One-click update
- ✅ Confirmation toast

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open notification | Click bell |
| Close notification | Click outside or X |
| View all incidents | Click "View All Incidents" |
| Clear notifications | Click "Clear all" |
| Go back | Click "Back to Incidents" |

---

## Troubleshooting

### Not Receiving Notifications?

1. **Check severity**: Only high/critical incidents notify
2. **Check status**: Only pending incidents notify
3. **Check time**: Polling happens every 15 seconds
4. **Check permissions**: Ensure you have incident read permission
5. **Refresh page**: Hard refresh (Ctrl+F5)

### Notification Bell Not Showing?

1. **Check login**: Must be logged in
2. **Check role**: Must have responder role
3. **Clear cache**: Clear browser cache
4. **Check console**: Look for errors in browser console

### Can't Update Status?

1. **Check permissions**: Must have incident update permission
2. **Check role**: Citizens can't update status
3. **Check connection**: Ensure backend is running
4. **Try again**: Click "Update Status" again

---

## API Endpoints

### Get Incidents
```
GET /api/v1/incidents?status=pending&limit=50
```

### Get Incident Details
```
GET /api/v1/incidents/:id
```

### Update Status
```
PATCH /api/v1/incidents/:id/status
Body: { status: 'in_progress' }
```

---

## Role-Based Access

| Role | Can View | Can Update | Notifications |
|------|----------|-----------|---------------|
| Super Admin | All | ✅ | ✅ |
| Admin | All | ✅ | ✅ |
| PNP | Jurisdiction | ✅ | ✅ |
| BFP | Fire + Basic | ✅ | ✅ |
| MDRRMO | Jurisdiction | ✅ | ✅ |
| LGU Officer | Barangay/LGU | ✅ | ✅ |
| Citizen | Public | ❌ | ❌ |

---

## Best Practices

### For Responders

1. **Check notifications regularly** - Don't rely only on sound
2. **Update status promptly** - Keep citizens informed
3. **Use filters** - Find specific incidents quickly
4. **Review photos** - Visual evidence is important
5. **Contact reporter** - Call if more info needed

### For Citizens

1. **Be accurate** - Provide correct location
2. **Be detailed** - Describe incident clearly
3. **Add photos** - Visual evidence helps
4. **Choose correct severity** - High/critical for urgent only
5. **Choose correct type** - Helps route to right responder

---

## Support

### Need Help?

1. **Check documentation**: Read full implementation guide
2. **Check logs**: Browser console for errors
3. **Test backend**: Ensure API is responding
4. **Contact admin**: Report issues to system admin

### Report Issues

Include:
- Your role
- What you were doing
- Error message (if any)
- Browser and version
- Screenshot (if possible)

---

## Summary

✅ Orange bell = Incident notifications
✅ Red bell = SOS notifications
✅ Only high/critical incidents notify
✅ Auto-refresh every 15 seconds
✅ Click to view full details
✅ Update status from detail page
✅ Role-based filtering applied

**You're all set!** 🎉
