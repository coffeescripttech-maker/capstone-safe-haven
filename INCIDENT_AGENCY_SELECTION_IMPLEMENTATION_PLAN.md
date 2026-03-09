# Incident Report Agency Selection - Implementation Plan

## Overview
Add agency selection to Incident Reports (matching SOS workflow) so reports are automatically assigned to the correct agency with immediate notifications.

## Files to Modify

### 1. Mobile App - ReportIncidentScreen.tsx
**Location:** `MOBILE_APP/mobile/src/screens/incidents/ReportIncidentScreen.tsx`

**Changes:**
- Add agency selection state
- Add agency selection UI (after incident type)
- Auto-suggest agency based on incident type
- Include `targetAgency` in submission

### 2. Backend - incidents.controller.ts
**Location:** `MOBILE_APP/backend/src/controllers/incidents.controller.ts`

**Changes:**
- Accept `targetAgency` parameter
- Look up agency admin user
- Set `assigned_to` field
- Send notification to assigned agency

### 3. Backend - notification.service.ts
**Location:** `MOBILE_APP/backend/src/services/notification.service.ts`

**Changes:**
- Add `sendIncidentNotification` method
- Send push notification
- Send SMS notification
- Include incident details and location

## Detailed Implementation

### Step 1: Update Mobile App UI

Add to `ReportIncidentScreen.tsx` after incident type selection:

```typescript
// Add state
const [selectedAgency, setSelectedAgency] = useState<'pnp' | 'bfp' | 'mdrrmo'>('mdrrmo');

// Agency options
const agencies = [
  { 
    value: 'pnp' as const, 
    label: 'PNP (Police)', 
    icon: '👮',
    color: '#1E40AF',
    description: 'Crimes, missing persons, security issues'
  },
  { 
    value: 'bfp' as const, 
    label: 'BFP (Fire)', 
    icon: '🚒',
    color: '#DC2626',
    description: 'Fires, hazards, rescue operations'
  },
  { 
    value: 'mdrrmo' as const, 
    label: 'MDRRMO', 
    icon: '🆘',
    color: '#059669',
    description: 'Disasters, damage, general emergencies'
  },
];

// Auto-suggest agency based on incident type
useEffect(() => {
  const agencyMapping: Record<IncidentType, 'pnp' | 'bfp' | 'mdrrmo'> = {
    'damage': 'mdrrmo',
    'injury': 'bfp',
    'missing_person': 'pnp',
    'hazard': 'bfp',
    'other': 'mdrrmo',
  };
  setSelectedAgency(agencyMapping[incidentType]);
}, [incidentType]);

// Add UI section (after incident type, before severity)
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Select Emergency Agency</Text>
  <Text style={styles.sectionSubtitle}>
    Recommended: {agencies.find(a => a.value === selectedAgency)?.label}
  </Text>
  <View style={styles.agencyGrid}>
    {agencies.map((agency) => (
      <TouchableOpacity
        key={agency.value}
        style={[
          styles.agencyCard,
          selectedAgency === agency.value && {
            borderColor: agency.color,
            backgroundColor: `${agency.color}10`,
          },
        ]}
        onPress={() => setSelectedAgency(agency.value)}
      >
        <Text style={styles.agencyIcon}>{agency.icon}</Text>
        <Text style={[
          styles.agencyLabel,
          selectedAgency === agency.value && { color: agency.color }
        ]}>
          {agency.label}
        </Text>
        <Text style={styles.agencyDescription}>{agency.description}</Text>
      </TouchableOpacity>
    ))}
  </View>
</View>

// Update submission to include targetAgency
const reportData = {
  incidentType,
  title: title.trim(),
  description: description.trim(),
  latitude: location.latitude,
  longitude: location.longitude,
  address: address.trim() || undefined,
  severity,
  photos: photos.length > 0 ? photos : undefined,
  targetAgency: selectedAgency, // NEW
};
```

Add styles:
```typescript
agencyGrid: {
  gap: SPACING.sm,
},
agencyCard: {
  backgroundColor: COLORS.white,
  borderRadius: 12,
  padding: SPACING.md,
  borderWidth: 2,
  borderColor: COLORS.border,
  marginBottom: SPACING.sm,
},
agencyIcon: {
  fontSize: 32,
  marginBottom: SPACING.xs,
},
agencyLabel: {
  fontSize: TYPOGRAPHY.sizes.md,
  fontWeight: TYPOGRAPHY.weights.bold,
  color: COLORS.text,
  marginBottom: SPACING.xs,
},
agencyDescription: {
  fontSize: TYPOGRAPHY.sizes.xs,
  color: COLORS.textSecondary,
  lineHeight: 16,
},
sectionSubtitle: {
  fontSize: TYPOGRAPHY.sizes.sm,
  color: COLORS.primary,
  marginBottom: SPACING.sm,
  fontWeight: TYPOGRAPHY.weights.medium,
},
```

### Step 2: Update Backend Controller

In `incidents.controller.ts`, modify the `createIncident` method:

```typescript
async createIncident(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const {
      incidentType,
      title,
      description,
      latitude,
      longitude,
      address,
      severity,
      photos,
      targetAgency, // NEW
    } = req.body;

    // Validation...

    // Find agency admin to assign
    let assignedTo = null;
    if (targetAgency) {
      const [agencyUsers] = await db.query(
        'SELECT id, phone FROM users WHERE role = ? AND is_active = TRUE LIMIT 1',
        [targetAgency]
      );

      if (Array.isArray(agencyUsers) && agencyUsers.length > 0) {
        assignedTo = agencyUsers[0].id;
      }
    }

    // Create incident with assignment
    const [result] = await db.query(
      `INSERT INTO incident_reports 
       (user_id, incident_type, title, description, latitude, longitude, 
        address, severity, photos, assigned_to, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        userId,
        incidentType,
        title,
        description,
        latitude,
        longitude,
        address,
        severity,
        photos ? JSON.stringify(photos) : null,
        assignedTo, // NEW
      ]
    );

    const incidentId = (result as any).insertId;

    // Send notification to assigned agency
    if (assignedTo && targetAgency) {
      await notificationService.sendIncidentNotification(
        assignedTo,
        incidentId,
        incidentType,
        severity,
        title,
        { latitude, longitude }
      );
    }

    res.status(201).json({
      status: 'success',
      data: {
        id: incidentId,
        assignedTo,
        targetAgency,
      },
    });
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create incident report',
    });
  }
}
```

### Step 3: Add Notification Method

In `notification.service.ts`, add:

```typescript
async sendIncidentNotification(
  userId: number,
  incidentId: number,
  incidentType: string,
  severity: string,
  title: string,
  location: { latitude: number; longitude: number }
): Promise<void> {
  try {
    // Get user details
    const [users] = await db.query(
      'SELECT phone, role FROM users WHERE id = ?',
      [userId]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return;
    }

    const user = users[0] as any;
    const agencyName = this.getAgencyName(user.role);

    // Format message
    const severityEmoji = {
      low: '🟢',
      moderate: '🟡',
      high: '🟠',
      critical: '🔴',
    }[severity] || '⚠️';

    const typeLabel = incidentType.replace('_', ' ').toUpperCase();
    
    const message = `${severityEmoji} NEW INCIDENT REPORT\n\n` +
      `Type: ${typeLabel}\n` +
      `Severity: ${severity.toUpperCase()}\n` +
      `Title: ${title}\n` +
      `Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}\n\n` +
      `Assigned to: ${agencyName}\n` +
      `View details in the admin dashboard.`;

    // Send push notification
    const [tokens] = await db.query(
      'SELECT token FROM device_tokens WHERE user_id = ? AND is_active = TRUE',
      [userId]
    );

    if (Array.isArray(tokens) && tokens.length > 0) {
      for (const tokenRow of tokens) {
        const token = (tokenRow as any).token;
        await this.sendPushNotification(token, {
          title: `${severityEmoji} New ${severity} Incident`,
          body: `${typeLabel}: ${title}`,
          data: {
            type: 'incident',
            incidentId: incidentId.toString(),
            severity,
          },
        });
      }
    }

    // Send SMS notification
    if (user.phone) {
      await this.sendSMS(user.phone, message);
    }

    // Log notification
    await db.query(
      `INSERT INTO notification_log (user_id, type, title, message, status) 
       VALUES (?, 'push', ?, ?, 'sent')`,
      [userId, `New ${severity} Incident`, message]
    );

  } catch (error) {
    console.error('Error sending incident notification:', error);
  }
}

private getAgencyName(role: string): string {
  const names: Record<string, string> = {
    pnp: 'PNP (Philippine National Police)',
    bfp: 'BFP (Bureau of Fire Protection)',
    mdrrmo: 'MDRRMO (Municipal Disaster Risk Reduction)',
  };
  return names[role] || role.toUpperCase();
}
```

### Step 4: Update Incident Type

In `MOBILE_APP/mobile/src/types/incident.ts`, add:

```typescript
export type TargetAgency = 'pnp' | 'bfp' | 'mdrrmo';

export interface CreateIncidentRequest {
  incidentType: IncidentType;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  severity: IncidentSeverity;
  photos?: string[];
  targetAgency: TargetAgency; // NEW
}
```

## Testing

### Test Cases

1. **Create incident with PNP**
   - Select "Missing Person"
   - Verify PNP is auto-suggested
   - Submit report
   - Verify PNP admin receives notification

2. **Create incident with BFP**
   - Select "Hazard"
   - Verify BFP is auto-suggested
   - Submit report
   - Verify BFP admin receives notification

3. **Create incident with MDRRMO**
   - Select "Property Damage"
   - Verify MDRRMO is auto-suggested
   - Submit report
   - Verify MDRRMO admin receives notification

4. **Override suggestion**
   - Select "Injury" (suggests BFP)
   - Manually select PNP
   - Submit report
   - Verify PNP receives notification

5. **Offline mode**
   - Go offline
   - Create incident
   - Verify queued for later
   - Go online
   - Verify submitted with assignment

### Test Script

```powershell
# Test incident creation with agency
$body = @{
  incidentType = "missing_person"
  title = "Missing child in Quiapo"
  description = "5-year-old child missing since 2pm"
  latitude = 14.5995
  longitude = 120.9842
  severity = "high"
  targetAgency = "pnp"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/v1/incidents" `
  -Method POST `
  -Headers @{ "Authorization" = "Bearer $token" } `
  -Body $body `
  -ContentType "application/json"
```

## Benefits

✅ Faster response - Reports go directly to right agency
✅ Better UX - Consistent with SOS workflow  
✅ Reduced admin work - No manual assignment needed
✅ Smart defaults - Auto-suggests based on incident type
✅ User control - Can override suggestion if needed
✅ Immediate notifications - Agency notified instantly

## Rollout Plan

1. Implement mobile UI changes
2. Update backend API
3. Add notification logic
4. Test with all three agencies
5. Deploy to staging
6. User acceptance testing
7. Deploy to production
8. Monitor notifications

## Documentation Updates

- Update user guide with agency selection
- Update admin guide with auto-assignment
- Update API documentation
- Create training materials for agencies

## Next Steps

Ready to implement! The changes are minimal and follow the proven SOS pattern. Should take about 2-3 hours to complete and test.
