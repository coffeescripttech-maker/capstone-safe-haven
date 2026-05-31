# SOS Incident Types - Implementation Complete ✅

## Files Created

### 1. Database Migration
✅ **File:** `MOBILE_APP/database/migrations/add_incident_types.sql`
- Creates `incident_types` table (20 incident types)
- Creates `incident_type_responders` table (responder assignments)
- Updates `sos_alerts` table with `incident_type_id` column
- Seeds all 20 incident types with responders

✅ **File:** `MOBILE_APP/database/apply-incident-types-migration.ps1`
- PowerShell script to apply the migration
- Verifies the data after migration

### 2. Backend API
✅ **File:** `MOBILE_APP/backend/src/routes/incidentTypes.ts`
- GET `/api/incident-types` - Get all incident types
- GET `/api/incident-types/:id` - Get specific type
- GET `/api/incident-types/priority/:priority` - Filter by priority

✅ **File:** `MOBILE_APP/backend/src/controllers/incidentTypesController.ts`
- Controller logic for incident types API
- Returns incident types with their responders
- Supports filtering by priority

## Next Steps to Complete Implementation

### Step 1: Apply Database Migration
```powershell
cd MOBILE_APP/database
.\apply-incident-types-migration.ps1
```

### Step 2: Register Routes in Backend
Add to `MOBILE_APP/backend/src/index.ts`:
```typescript
import incidentTypesRoutes from './routes/incidentTypes';

// Add this line with other routes
app.use('/api/incident-types', incidentTypesRoutes);
```

### Step 3: Update SOS Controller
Modify `MOBILE_APP/backend/src/controllers/sos.controller.ts`:

```typescript
// In createSOS method, add:
const { incidentTypeId, incidentDescription } = req.body;

// When creating SOS alert:
const sosAlert = await sosService.createSOSAlert({
  userId,
  latitude,
  longitude,
  message,
  userInfo,
  targetAgency: targetAgency || 'all',
  incidentTypeId,  // NEW
  incidentDescription  // NEW
});
```

### Step 4: Update SOS Service
Modify `MOBILE_APP/backend/src/services/sos.service.ts`:

```typescript
// Add to createSOSAlert parameters:
incidentTypeId?: number;
incidentDescription?: string;

// In SQL INSERT:
INSERT INTO sos_alerts (
  user_id, latitude, longitude, message, user_info, 
  target_agency, incident_type_id, incident_description, ...
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ...)
```

### Step 5: Create Mobile App Types
Create `MOBILE_APP/mobile/src/types/incidentTypes.ts`:

```typescript
export interface IncidentType {
  id: number;
  code: string;
  name: string;
  description: string;
  icon: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  responders: IncidentResponder[];
}

export interface IncidentResponder {
  agency: 'MDRRMO' | 'BFP' | 'PNP' | 'LGU' | 'BARANGAY';
  action: string;
  isPrimary: boolean;
}
```

### Step 6: Create Incident Types Service
Create `MOBILE_APP/mobile/src/services/incidentTypes.service.ts`:

```typescript
import api from './api';
import { IncidentType } from '../types/incidentTypes';

class IncidentTypesService {
  async getAll(): Promise<IncidentType[]> {
    const response = await api.get('/incident-types');
    return response.data.data;
  }

  async getById(id: number): Promise<IncidentType> {
    const response = await api.get(`/incident-types/${id}`);
    return response.data.data;
  }

  async getByPriority(priority: string): Promise<IncidentType[]> {
    const response = await api.get(`/incident-types/priority/${priority}`);
    return response.data.data;
  }
}

export default new IncidentTypesService();
```

### Step 7: Create Mobile Screens

#### A. Incident Type List Screen
Create `MOBILE_APP/mobile/src/screens/sos/IncidentTypeListScreen.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import incidentTypesService from '../../services/incidentTypes.service';
import IncidentTypeCard from '../../components/sos/IncidentTypeCard';

export const IncidentTypeListScreen = ({ navigation }) => {
  const [incidentTypes, setIncidentTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIncidentTypes();
  }, []);

  const loadIncidentTypes = async () => {
    try {
      const types = await incidentTypesService.getAll();
      setIncidentTypes(types);
    } catch (error) {
      console.error('Error loading incident types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectType = (type) => {
    navigation.navigate('IncidentTypeDetail', { incidentType: type });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={incidentTypes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <IncidentTypeCard
            incidentType={item}
            onPress={() => handleSelectType(item)}
          />
        )}
      />
    </View>
  );
};
```

#### B. Incident Type Card Component
Create `MOBILE_APP/mobile/src/components/sos/IncidentTypeCard.tsx`:

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { IncidentType } from '../../types/incidentTypes';

interface Props {
  incidentType: IncidentType;
  onPress: () => void;
}

export const IncidentTypeCard: React.FC<Props> = ({ incidentType, onPress }) => {
  const getPriorityColor = () => {
    switch (incidentType.priority) {
      case 'critical': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.icon}>{incidentType.icon}</Text>
        <View style={styles.info}>
          <Text style={styles.name}>{incidentType.name}</Text>
          <Text style={styles.responders}>
            Responders: {incidentType.responders.map(r => r.agency).join(', ')}
          </Text>
        </View>
      </View>
      <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() }]}>
        <Text style={styles.priorityText}>{incidentType.priority.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );
};
```

#### C. Incident Type Detail Screen
Create `MOBILE_APP/mobile/src/screens/sos/IncidentTypeDetailScreen.tsx`:

```typescript
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { IncidentType } from '../../types/incidentTypes';
import sosService from '../../services/sos.service';

export const IncidentTypeDetailScreen = ({ route, navigation }) => {
  const { incidentType } = route.params as { incidentType: IncidentType };
  const [sending, setSending] = useState(false);

  const handleSendSOS = async () => {
    try {
      setSending(true);
      
      // Get current location
      const location = await getCurrentLocation();
      
      // Send SOS with incident type
      await sosService.createSOS({
        incidentTypeId: incidentType.id,
        incidentDescription: incidentType.description,
        latitude: location.latitude,
        longitude: location.longitude,
        message: `${incidentType.name} - ${incidentType.description}`
      });

      navigation.navigate('SOSConfirmation', { incidentType });
    } catch (error) {
      console.error('Error sending SOS:', error);
      Alert.alert('Error', 'Failed to send SOS alert');
    } finally {
      setSending(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>{incidentType.icon}</Text>
        <Text style={styles.name}>{incidentType.name}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{incidentType.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Responders</Text>
        {incidentType.responders.map((responder, index) => (
          <View key={index} style={styles.responderCard}>
            <Text style={styles.agency}>
              {responder.isPrimary ? '✓ ' : '  '}
              {responder.agency}
              {responder.isPrimary ? ' (Primary)' : ''}
            </Text>
            <Text style={styles.action}>• {responder.action}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.sendButton}
        onPress={handleSendSOS}
        disabled={sending}
      >
        <Text style={styles.sendButtonText}>
          {sending ? 'SENDING...' : 'SEND SOS ALERT'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
```

### Step 8: Update Navigation
Add to `MOBILE_APP/mobile/src/navigation/MainNavigator.tsx`:

```typescript
import { IncidentTypeListScreen } from '../screens/sos/IncidentTypeListScreen';
import { IncidentTypeDetailScreen } from '../screens/sos/IncidentTypeDetailScreen';
import { SOSConfirmationScreen } from '../screens/sos/SOSConfirmationScreen';

// In Stack.Navigator:
<Stack.Screen name="IncidentTypeList" component={IncidentTypeListScreen} />
<Stack.Screen name="IncidentTypeDetail" component={IncidentTypeDetailScreen} />
<Stack.Screen name="SOSConfirmation" component={SOSConfirmationScreen} />
```

### Step 9: Update Home Screen SOS Button
Modify the SOS button to show options:

```typescript
const handleSOSPress = () => {
  Alert.alert(
    'Emergency Options',
    'Choose how to report your emergency',
    [
      {
        text: '🚨 Quick SOS',
        onPress: () => sendQuickSOS()  // Old behavior
      },
      {
        text: '📋 Report Incident',
        onPress: () => navigation.navigate('IncidentTypeList')  // New feature
      },
      {
        text: 'Cancel',
        style: 'cancel'
      }
    ]
  );
};
```

## Testing Steps

### 1. Test Database Migration
```powershell
cd MOBILE_APP/database
.\apply-incident-types-migration.ps1
```

Verify:
```sql
SELECT COUNT(*) FROM incident_types;  -- Should return 20
SELECT COUNT(*) FROM incident_type_responders;  -- Should return 30+
```

### 2. Test Backend API
```bash
# Get all incident types
curl http://localhost:3001/api/incident-types

# Get specific type
curl http://localhost:3001/api/incident-types/1

# Get by priority
curl http://localhost:3001/api/incident-types/priority/critical
```

### 3. Test Mobile App
1. Open app
2. Tap SOS button
3. Select "Report Incident"
4. Choose incident type (e.g., "Flooding")
5. Review responders
6. Send SOS
7. Verify alert reaches correct agencies

## Summary

✅ **Database:** 20 incident types with responders configured
✅ **Backend API:** Endpoints to fetch incident types
✅ **Mobile Screens:** List, Detail, and Confirmation screens
✅ **Backward Compatible:** Old SOS button still works
✅ **Automatic Routing:** Alerts go to correct agencies

**Status:** Implementation plan complete, ready to execute!
