# SOS Incident Types Implementation Plan

## Overview
Transform the current generic SOS button into a categorized incident reporting system where users select specific incident types, and the system automatically routes to the appropriate responders (MDRRMO, BFP, PNP, LGU).

## Current State
- Single "SOS" button
- Generic emergency alert
- Manual agency selection

## Proposed Enhancement
- **20 Pre-defined Incident Types**
- **Automatic Responder Assignment**
- **Clear Action Descriptions**
- **Visual Icons for Each Type**

---

## Incident Types & Responders

### 1. 🌊 Flooding in Low-Lying Area
- **Responders:** MDRRMO, LGU
- **Actions:**
  - MDRRMO: Evacuation coordination
  - LGU: Relief goods distribution

### 2. 🔥 House Fire
- **Responders:** BFP, PNP
- **Actions:**
  - BFP: Fire suppression
  - PNP: Crowd control and investigation

### 3. 🚗 Road Accident
- **Responders:** PNP, MDRRMO
- **Actions:**
  - PNP: Traffic control
  - MDRRMO: Rescue and first aid

### 4. 🌀 Typhoon Alert
- **Responders:** MDRRMO, LGU
- **Actions:**
  - MDRRMO: Early warning alerts
  - LGU: Evacuation preparation

### 5. 🏔️ Landslide
- **Responders:** MDRRMO, PNP
- **Actions:**
  - MDRRMO: Search and rescue
  - PNP: Area security

### 6. ⚡ Power Outage
- **Responders:** LGU
- **Actions:**
  - LGU: Coordination with power provider

### 7. 👤 Missing Person
- **Responders:** PNP
- **Actions:**
  - PNP: Search operation

### 8. 🌲 Forest Fire
- **Responders:** BFP, MDRRMO
- **Actions:**
  - BFP: Fire control
  - MDRRMO: Evacuation support

### 9. 💧 Flash Flood
- **Responders:** MDRRMO, PNP
- **Actions:**
  - MDRRMO: Rescue
  - PNP: Road closure

### 10. 🏢 Evacuation Center Overcrowding
- **Responders:** LGU
- **Actions:**
  - LGU: Assign new evacuation sites

### 11. 🚑 Medical Emergency
- **Responders:** MDRRMO
- **Actions:**
  - MDRRMO: Emergency response

### 12. 💨 Gas Leak
- **Responders:** BFP
- **Actions:**
  - BFP: Hazard control

### 13. 🚙 Flooded Vehicle Stranded
- **Responders:** MDRRMO
- **Actions:**
  - MDRRMO: Rescue

### 14. 👥 Public Panic / Crowd
- **Responders:** PNP
- **Actions:**
  - PNP: Crowd control

### 15. 🌊 Dam Overflow Warning
- **Responders:** MDRRMO, LGU
- **Actions:**
  - MDRRMO: Alert dissemination
  - LGU: Evacuation

### 16. ⚡ Electrical Fire (Post-Flood)
- **Responders:** BFP
- **Actions:**
  - BFP: Fire response

### 17. 🌳 Blocked Road
- **Responders:** LGU, PNP
- **Actions:**
  - LGU: Clearing
  - PNP: Traffic control

### 18. 🤕 Injured Evacuee
- **Responders:** MDRRMO
- **Actions:**
  - MDRRMO: First aid

### 19. 💨 Strong Wind Damage
- **Responders:** LGU
- **Actions:**
  - LGU: Assistance and shelter

### 20. 📡 Communication Failure
- **Responders:** MDRRMO, LGU
- **Actions:**
  - MDRRMO: Alternative communication
  - LGU: Coordination

---

## Implementation Strategy

### Phase 1: Data Structure (Backend)

#### 1.1 Database Schema
```sql
-- Incident Types Table
CREATE TABLE incident_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Incident Responders Table (Many-to-Many)
CREATE TABLE incident_type_responders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  incident_type_id INT NOT NULL,
  agency ENUM('MDRRMO', 'BFP', 'PNP', 'LGU', 'BARANGAY') NOT NULL,
  action_description TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (incident_type_id) REFERENCES incident_types(id)
);

-- Update SOS Alerts Table
ALTER TABLE sos_alerts 
ADD COLUMN incident_type_id INT,
ADD FOREIGN KEY (incident_type_id) REFERENCES incident_types(id);
```

#### 1.2 Seed Data Script
```javascript
// backend/seed-incident-types.js
const incidentTypes = [
  {
    code: 'flooding',
    name: 'Flooding in Low-Lying Area',
    description: 'Biglang tumaas ang tubig sa residential area',
    icon: '🌊',
    priority: 'high',
    responders: [
      { agency: 'MDRRMO', action: 'Evacuation coordination', isPrimary: true },
      { agency: 'LGU', action: 'Relief goods distribution', isPrimary: false }
    ]
  },
  {
    code: 'house_fire',
    name: 'House Fire',
    description: 'Nasunog ang bahay dahil sa faulty wiring',
    icon: '🔥',
    priority: 'critical',
    responders: [
      { agency: 'BFP', action: 'Fire suppression', isPrimary: true },
      { agency: 'PNP', action: 'Crowd control and investigation', isPrimary: false }
    ]
  },
  // ... rest of 20 incident types
];
```

### Phase 2: Backend API

#### 2.1 New Endpoints
```typescript
// GET /api/incident-types
// Returns all available incident types with responders

// POST /api/sos/report
// Body: {
//   incidentTypeId: number,
//   location: { latitude, longitude },
//   message?: string,
//   photos?: string[]
// }
// Automatically assigns to correct agencies
```

#### 2.2 API Response Example
```json
{
  "incidentTypes": [
    {
      "id": 1,
      "code": "flooding",
      "name": "Flooding in Low-Lying Area",
      "description": "Biglang tumaas ang tubig sa residential area",
      "icon": "🌊",
      "priority": "high",
      "responders": [
        {
          "agency": "MDRRMO",
          "action": "Evacuation coordination",
          "isPrimary": true
        },
        {
          "agency": "LGU",
          "action": "Relief goods distribution",
          "isPrimary": false
        }
      ]
    }
  ]
}
```

### Phase 3: Mobile App UI

#### 3.1 New Screen: Incident Type Selection
```
┌─────────────────────────────────────┐
│  Select Emergency Type              │
├─────────────────────────────────────┤
│                                     │
│  🌊 Flooding                        │
│  Responders: MDRRMO, LGU       →   │
│                                     │
│  🔥 House Fire                      │
│  Responders: BFP, PNP          →   │
│                                     │
│  🚗 Road Accident                   │
│  Responders: PNP, MDRRMO       →   │
│                                     │
│  🌀 Typhoon Alert                   │
│  Responders: MDRRMO, LGU       →   │
│                                     │
│  [View All 20 Types...]             │
└─────────────────────────────────────┘
```

#### 3.2 Incident Detail Screen
```
┌─────────────────────────────────────┐
│  🌊 Flooding in Low-Lying Area      │
├─────────────────────────────────────┤
│                                     │
│  Description:                       │
│  Biglang tumaas ang tubig sa        │
│  residential area after heavy rain  │
│                                     │
│  Responders:                        │
│  ✓ MDRRMO (Primary)                 │
│    • Evacuation coordination        │
│                                     │
│  ✓ LGU                              │
│    • Relief goods distribution      │
│                                     │
│  Priority: HIGH                     │
│                                     │
│  [Add Photo] [Add Details]          │
│                                     │
│  [SEND SOS ALERT]                   │
└─────────────────────────────────────┘
```

#### 3.3 Component Structure
```
screens/
  sos/
    IncidentTypeListScreen.tsx      // List of 20 incident types
    IncidentTypeDetailScreen.tsx    // Detail + Send SOS
    SOSConfirmationScreen.tsx       // Success message

components/
  sos/
    IncidentTypeCard.tsx            // Card for each incident type
    ResponderBadge.tsx              // Agency badge component
    PriorityIndicator.tsx           // Priority level indicator
```

### Phase 4: Backward Compatibility

#### 4.1 Keep Existing SOS Button
- Add "Quick SOS" option for generic emergencies
- Defaults to "all" agencies like current behavior
- Gradually migrate users to new system

#### 4.2 Migration Strategy
```typescript
// Option 1: Show both buttons initially
<QuickSOSButton />  // Old behavior
<ReportIncidentButton />  // New feature

// Option 2: Replace with modal
<SOSButton onPress={() => showModal()}>
  Modal shows:
  - Quick SOS (generic)
  - Report Specific Incident (new)
</SOSButton>
```

---

## UI/UX Flow

### User Journey

1. **User taps SOS button**
   ```
   Home Screen → SOS Modal
   ```

2. **Modal shows options**
   ```
   ┌─────────────────────────┐
   │  Emergency Options      │
   ├─────────────────────────┤
   │  🚨 Quick SOS           │
   │  (Generic emergency)    │
   │                         │
   │  📋 Report Incident     │
   │  (Specific type)        │
   └─────────────────────────┘
   ```

3. **If "Report Incident" selected**
   ```
   → Incident Type List
   → Select Type (e.g., Flooding)
   → Review Details & Responders
   → Add Photo/Message (optional)
   → Confirm & Send
   → Success Screen
   ```

4. **Automatic Routing**
   ```
   Backend automatically:
   - Assigns to correct agencies
   - Sets priority level
   - Sends notifications
   - Creates incident record
   ```

---

## Benefits

### For Users (Citizens)
✅ **Faster Response** - Right agencies notified immediately
✅ **Clear Expectations** - Know who will respond
✅ **Better Communication** - Specific incident details
✅ **Reduced Confusion** - No need to guess which agency

### For Responders (Agencies)
✅ **Relevant Alerts Only** - BFP gets fires, PNP gets accidents
✅ **Clear Responsibilities** - Know what action to take
✅ **Better Coordination** - Multiple agencies can collaborate
✅ **Reduced False Alarms** - More accurate reporting

### For System
✅ **Better Analytics** - Track incident types
✅ **Resource Planning** - See which incidents are common
✅ **Performance Metrics** - Response times per incident type
✅ **Scalable** - Easy to add new incident types

---

## Implementation Timeline

### Week 1: Backend
- [ ] Create database schema
- [ ] Seed incident types data
- [ ] Create API endpoints
- [ ] Test with Postman

### Week 2: Mobile UI
- [ ] Create incident type list screen
- [ ] Create incident detail screen
- [ ] Create confirmation screen
- [ ] Add photo upload

### Week 3: Integration
- [ ] Connect mobile to API
- [ ] Test SOS flow end-to-end
- [ ] Add error handling
- [ ] Test offline mode

### Week 4: Testing & Deployment
- [ ] User acceptance testing
- [ ] Fix bugs
- [ ] Deploy to production
- [ ] Monitor and adjust

---

## Testing Checklist

### Functional Testing
- [ ] All 20 incident types display correctly
- [ ] Responders show for each type
- [ ] SOS alert sends to correct agencies
- [ ] Photos upload successfully
- [ ] Location captured accurately
- [ ] Backward compatibility maintained

### User Testing
- [ ] Users can find incident types easily
- [ ] Flow is intuitive
- [ ] Response time is acceptable
- [ ] Error messages are clear

### Agency Testing
- [ ] BFP receives fire incidents only
- [ ] PNP receives relevant incidents
- [ ] MDRRMO receives appropriate alerts
- [ ] LGU receives correct notifications

---

## Risk Mitigation

### Risk 1: Breaking Current SOS
**Mitigation:** Keep old SOS button as fallback, gradual rollout

### Risk 2: Users Don't Know Which Type
**Mitigation:** Add search, categories, and "Not Sure?" option

### Risk 3: Too Many Options Overwhelm Users
**Mitigation:** Show top 5 common types first, "More..." button

### Risk 4: Wrong Agency Assignment
**Mitigation:** Allow manual override, admin can reassign

---

## Future Enhancements

### Phase 2 Features
- [ ] AI-powered incident type suggestion
- [ ] Voice-to-text incident description
- [ ] Real-time responder ETA
- [ ] Incident status tracking
- [ ] Multi-language support

### Phase 3 Features
- [ ] Incident clustering (multiple reports of same incident)
- [ ] Predictive analytics
- [ ] Integration with weather alerts
- [ ] Community incident verification

---

## Summary

This implementation transforms the generic SOS button into an intelligent incident reporting system that:
1. **Categorizes** emergencies into 20 specific types
2. **Routes** alerts to the correct responders automatically
3. **Provides** clear action descriptions for each agency
4. **Maintains** backward compatibility with existing system
5. **Improves** response times and coordination

**Next Steps:**
1. Review and approve this plan
2. Start with backend database schema
3. Create API endpoints
4. Build mobile UI screens
5. Test and deploy incrementally

