# Design Document: Disaster Alert System

## Overview

The Disaster Alert System is a critical real-time notification service that broadcasts emergency warnings through multiple channels (push notifications and SMS). The system follows a layered architecture with clear separation between API endpoints, business logic, notification services, and data persistence.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│  Mobile App /   │
│  Admin Dashboard│
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│   API Layer     │
│  (Controllers)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Service Layer  │
│ (Business Logic)│
└────┬────────┬───┘
     │        │
     ▼        ▼
┌─────────┐ ┌──────────────┐
│ Database│ │ Notification │
│  (MySQL)│ │   Services   │
└─────────┘ └──────┬───────┘
                   │
            ┌──────┴──────┐
            ▼             ▼
      ┌─────────┐   ┌─────────┐
      │   FCM   │   │   SMS   │
      │  (Push) │   │Provider │
      └─────────┘   └─────────┘
```

### Component Responsibilities

1. **Alert Controller**: Handles HTTP requests, validates input, calls service layer
2. **Alert Service**: Implements business logic, coordinates between database and notifications
3. **Notification Service**: Manages FCM and SMS delivery
4. **Database Layer**: Persists alert data and notification logs

## Components and Interfaces

### 1. Alert Controller (`alert.controller.ts`)

**Responsibilities:**
- Handle HTTP requests for alert operations
- Validate request parameters
- Call appropriate service methods
- Format responses

**Key Methods:**
```typescript
class AlertController {
  createAlert(req, res, next): Promise<void>
  getAlerts(req, res, next): Promise<void>
  getAlertById(req, res, next): Promise<void>
  updateAlert(req, res, next): Promise<void>
  deactivateAlert(req, res, next): Promise<void>
  broadcastAlert(req, res, next): Promise<void>
  getAlertStatistics(req, res, next): Promise<void>
}
```

### 2. Alert Service (`alert.service.ts`)

**Responsibilities:**
- Implement alert business logic
- Coordinate database operations
- Trigger notifications
- Calculate location-based targeting

**Key Methods:**
```typescript
class AlertService {
  createAlert(data: CreateAlertDto): Promise<Alert>
  getAlerts(filters: AlertFilters): Promise<PaginatedAlerts>
  getAlertById(id: number): Promise<Alert>
  updateAlert(id: number, data: UpdateAlertDto): Promise<Alert>
  deactivateAlert(id: number): Promise<void>
  broadcastAlert(alertId: number): Promise<BroadcastResult>
  getTargetedUsers(alert: Alert): Promise<User[]>
  getAlertStatistics(alertId: number): Promise<AlertStats>
}
```

### 3. Notification Service (`notification.service.ts`)

**Responsibilities:**
- Send push notifications via FCM
- Send SMS via provider API
- Log notification attempts
- Handle delivery failures

**Key Methods:**
```typescript
class NotificationService {
  sendPushNotification(tokens: string[], alert: Alert): Promise<PushResult>
  sendSMS(phones: string[], message: string): Promise<SMSResult>
  logNotification(userId: number, type: string, status: string): Promise<void>
  formatSMSMessage(alert: Alert): string
}
```

## Data Models

### Alert Interface
```typescript
interface Alert {
  id: number;
  alert_type: 'typhoon' | 'earthquake' | 'flood' | 'storm_surge' | 'volcanic' | 'tsunami' | 'landslide';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  title: string;
  description: string;
  source: string; // PAGASA, PHIVOLCS, NDRRMC
  affected_areas: string[]; // JSON array of provinces/cities
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  start_time: Date;
  end_time?: Date;
  is_active: boolean;
  metadata?: Record<string, any>; // Additional data (wind speed, magnitude, etc.)
  created_by: number;
  created_at: Date;
  updated_at: Date;
}
```

### DTOs (Data Transfer Objects)

```typescript
interface CreateAlertDto {
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  source: string;
  affected_areas: string[];
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  start_time: string;
  end_time?: string;
  metadata?: Record<string, any>;
}

interface AlertFilters {
  alert_type?: string;
  severity?: string;
  is_active?: boolean;
  latitude?: number;
  longitude?: number;
  radius?: number;
  page?: number;
  limit?: number;
}

interface BroadcastResult {
  total_recipients: number;
  push_sent: number;
  push_failed: number;
  sms_sent: number;
  sms_failed: number;
}
```

## API Endpoints

### Public Endpoints

**GET /api/v1/alerts**
- Get list of alerts with filtering and pagination
- Query params: `type`, `severity`, `is_active`, `lat`, `lng`, `radius`, `page`, `limit`
- Response: Paginated list of alerts

**GET /api/v1/alerts/:id**
- Get single alert by ID
- Response: Alert details with metadata

### Admin Endpoints (Requires Authentication + Admin Role)

**POST /api/v1/alerts**
- Create new alert
- Body: CreateAlertDto
- Response: Created alert

**PUT /api/v1/alerts/:id**
- Update existing alert
- Body: Partial<CreateAlertDto>
- Response: Updated alert

**DELETE /api/v1/alerts/:id**
- Deactivate alert (soft delete)
- Response: Success message

**POST /api/v1/alerts/:id/broadcast**
- Broadcast alert to targeted users
- Response: Broadcast statistics

**GET /api/v1/alerts/:id/statistics**
- Get delivery statistics for alert
- Response: Notification stats

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Alert Creation Validation
*For any* alert creation request, if all required fields are provided with valid values, then the system should successfully create and store the alert with a unique ID.
**Validates: Requirements 1.1, 1.2**

### Property 2: Active Alerts Filtering
*For any* alert retrieval request with is_active=true filter, all returned alerts should have is_active set to true.
**Validates: Requirements 3.1**

### Property 3: Location-Based Targeting
*For any* alert with specified coordinates and radius, the system should only target users whose location falls within the specified radius from the alert coordinates.
**Validates: Requirements 4.3**

### Property 4: Severity Sorting
*For any* alert list request without explicit sorting, alerts should be returned sorted by severity (critical > high > moderate > low) and then by creation date (newest first).
**Validates: Requirements 3.1**

### Property 5: Notification Logging
*For any* broadcast operation, the system should log every notification attempt (success or failure) in the notification_log table.
**Validates: Requirements 2.4, 7.3**

### Property 6: SMS Fallback
*For any* push notification that fails to deliver, if the user has a valid phone number, the system should attempt SMS delivery.
**Validates: Requirements 2.2**

### Property 7: Alert Deactivation Preservation
*For any* alert deactivation, the system should set is_active to false without deleting the alert record, preserving all historical data.
**Validates: Requirements 1.6**

### Property 8: Affected Areas Validation
*For any* alert creation, if affected_areas is empty and no nationwide flag is set, the system should reject the request with a validation error.
**Validates: Requirements 8.5**

### Property 9: Date Range Validation
*For any* alert with both start_time and end_time specified, end_time should be after start_time, otherwise the system should reject the request.
**Validates: Requirements 8.6**

### Property 10: Metadata Preservation
*For any* alert update that doesn't modify metadata, the original metadata should remain unchanged in the database.
**Validates: Requirements 5.2**

## Error Handling

### Validation Errors (400)
- Missing required fields
- Invalid alert type or severity
- Invalid coordinates
- Invalid date ranges
- Empty affected areas without nationwide flag

### Authentication Errors (401)
- Missing or invalid JWT token
- Expired token

### Authorization Errors (403)
- Non-admin user attempting admin operations

### Not Found Errors (404)
- Alert ID doesn't exist

### Server Errors (500)
- Database connection failures
- FCM/SMS service failures
- Unexpected errors

## Testing Strategy

### Unit Tests
- Test alert validation logic
- Test location distance calculations
- Test SMS message formatting
- Test date range validation
- Test affected areas validation

### Property-Based Tests
Each correctness property should be implemented as a property-based test with minimum 100 iterations:

1. **Property Test: Alert Creation** - Generate random valid alert data, verify successful creation
2. **Property Test: Active Filtering** - Generate mixed active/inactive alerts, verify filtering
3. **Property Test: Location Targeting** - Generate random coordinates and users, verify targeting accuracy
4. **Property Test: Severity Sorting** - Generate random alerts, verify sort order
5. **Property Test: Notification Logging** - Generate broadcast operations, verify all logs created
6. **Property Test: Deactivation** - Generate alerts, deactivate, verify data preservation

### Integration Tests
- Test complete alert creation and broadcast flow
- Test FCM integration
- Test SMS provider integration
- Test database transactions
- Test error handling paths

### Performance Tests
- Test alert broadcast to 10,000+ users
- Test concurrent alert creation
- Test database query performance with large datasets
