# Incident Report Agency Selection - Recommendation

## Current Status

The Incident Report feature currently does NOT have agency selection like the SOS feature does.

### Current Workflow:
1. User selects incident type (damage, injury, missing person, hazard, other)
2. User fills in details (title, description, severity, photos)
3. User submits report
4. Report is created with `status='pending'` and `assigned_to=NULL`
5. Admin must manually assign it to an agency later

### Database Support:
✅ The `incident_reports` table already has an `assigned_to` field
✅ Infrastructure is ready for automatic assignment

## Recommendation: Add Agency Selection (Like SOS)

### Proposed Workflow:
1. User selects incident type
2. **User selects which agency to notify** (NEW STEP)
   - PNP (Police) - for crimes, missing persons, security
   - BFP (Fire) - for fires, hazards, rescues
   - MDRRMO (Disaster) - for disasters, damage, general emergencies
3. User fills in details
4. User submits report
5. Report is automatically assigned to selected agency
6. **Agency receives immediate notification** (push + SMS)

### Benefits:

1. **Faster Response**
   - Reports go directly to the right agency
   - No manual assignment delay
   - Agency notified immediately

2. **Better User Experience**
   - Consistent with SOS workflow
   - User knows who will respond
   - Clear accountability

3. **Reduced Admin Workload**
   - No manual assignment needed
   - Automatic routing
   - Less confusion

4. **Smart Defaults**
   - Can suggest agency based on incident type
   - User can override if needed

## Suggested Agency Mapping

| Incident Type | Suggested Agency | Why |
|--------------|------------------|-----|
| Property Damage | MDRRMO | Disaster management handles infrastructure |
| Injury/Casualty | BFP | Fire dept has medical response |
| Missing Person | PNP | Police handle missing persons |
| Hazard/Danger | BFP | Fire dept handles hazards |
| Other | MDRRMO | General emergency management |

## Implementation Plan

### 1. Update Mobile App UI

Add agency selection step in `ReportIncidentScreen.tsx`:

```typescript
const agencies = [
  { value: 'pnp', label: 'PNP (Police)', icon: '👮', description: 'Crimes, missing persons, security' },
  { value: 'bfp', label: 'BFP (Fire)', icon: '🚒', description: 'Fires, hazards, rescues' },
  { value: 'mdrrmo', label: 'MDRRMO', icon: '🆘', description: 'Disasters, damage, emergencies' },
];

// Add state
const [selectedAgency, setSelectedAgency] = useState<string>('mdrrmo');

// Auto-suggest based on incident type
useEffect(() => {
  const suggestions = {
    'damage': 'mdrrmo',
    'injury': 'bfp',
    'missing_person': 'pnp',
    'hazard': 'bfp',
    'other': 'mdrrmo',
  };
  setSelectedAgency(suggestions[incidentType]);
}, [incidentType]);
```

### 2. Update Backend API

Modify `incidents.controller.ts` to:
- Accept `targetAgency` parameter
- Look up agency admin user ID
- Set `assigned_to` field
- Send notification to agency

```typescript
// Get agency admin
const [agencyUsers] = await db.query(
  'SELECT id FROM users WHERE role = ? AND is_active = TRUE LIMIT 1',
  [targetAgency]
);

if (agencyUsers.length > 0) {
  assignedTo = agencyUsers[0].id;
  
  // Send notification
  await notificationService.sendIncidentNotification(
    assignedTo,
    incidentId,
    incidentType,
    severity
  );
}
```

### 3. Update Database

No changes needed - `assigned_to` field already exists!

### 4. Add Notifications

Send push notification + SMS to assigned agency:
- "New {severity} {incidentType} report in {location}"
- Include link to incident details
- Mark as urgent for high/critical severity

## Alternative: Automatic Assignment Only

If you don't want to add UI complexity, you could:
1. Automatically assign based on incident type (no user selection)
2. Use the mapping table above
3. Still send notifications to assigned agency

This is simpler but gives users less control.

## Comparison with SOS

| Feature | SOS | Incident Report (Current) | Incident Report (Proposed) |
|---------|-----|---------------------------|----------------------------|
| Agency Selection | ✅ Yes | ❌ No | ✅ Yes |
| Auto-Assignment | ✅ Yes | ❌ No | ✅ Yes |
| Immediate Notification | ✅ Yes | ❌ No | ✅ Yes |
| User Control | ✅ High | ❌ None | ✅ High |
| Admin Workload | ✅ Low | ❌ High | ✅ Low |

## Recommendation

**Implement agency selection for Incident Reports** to match the SOS workflow. This will:
- Improve response times
- Reduce admin workload
- Provide better user experience
- Maintain consistency across features

The infrastructure is already in place - we just need to add the UI and notification logic!

## Next Steps

1. Add agency selection UI to mobile app
2. Update backend to handle agency assignment
3. Implement notification system
4. Test with all three agencies
5. Update documentation

Would you like me to implement this feature?
