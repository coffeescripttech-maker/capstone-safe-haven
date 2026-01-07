# Requirements Document: Disaster Alert System

## Introduction

The Disaster Alert System is a critical component of SafeHaven that enables real-time dissemination of disaster warnings to users through multiple channels (push notifications and SMS). The system must work reliably during emergencies and support offline caching for areas with poor connectivity.

## Glossary

- **Alert_System**: The backend service responsible for creating, managing, and broadcasting disaster alerts
- **User**: A registered SafeHaven mobile app user
- **Admin**: An LGU officer or DRRM personnel authorized to create alerts
- **FCM**: Firebase Cloud Messaging service for push notifications
- **SMS_Provider**: Third-party service (Semaphore/Twilio) for SMS delivery
- **Alert_Type**: Category of disaster (typhoon, earthquake, flood, storm_surge, volcanic, tsunami, landslide)
- **Severity_Level**: Alert urgency (low, moderate, high, critical)
- **Affected_Area**: Geographic region impacted by the disaster

## Requirements

### Requirement 1: Alert Creation and Management

**User Story:** As an LGU officer, I want to create and broadcast disaster alerts, so that citizens receive timely warnings about emergencies.

#### Acceptance Criteria

1. WHEN an admin creates an alert, THE Alert_System SHALL validate all required fields (type, severity, title, description, affected areas)
2. WHEN an alert is created, THE Alert_System SHALL store it in the database with a unique identifier
3. WHEN an alert is created, THE Alert_System SHALL set the alert status to active by default
4. WHERE an alert includes geographic coordinates, THE Alert_System SHALL store latitude, longitude, and radius
5. WHEN an admin updates an alert, THE Alert_System SHALL preserve the original creation timestamp
6. WHEN an admin deactivates an alert, THE Alert_System SHALL set is_active to false without deleting the record

### Requirement 2: Multi-Channel Alert Broadcasting

**User Story:** As a user, I want to receive disaster alerts through push notifications and SMS, so that I'm informed even when I don't have internet access.

#### Acceptance Criteria

1. WHEN an alert is broadcast, THE Alert_System SHALL send push notifications to all registered devices
2. WHEN push notification delivery fails, THE Alert_System SHALL attempt SMS delivery as fallback
3. WHEN a user's location matches an affected area, THE Alert_System SHALL prioritize that user for notifications
4. WHEN broadcasting alerts, THE Alert_System SHALL log all notification attempts with status
5. IF a user has disabled notifications, THEN THE Alert_System SHALL respect user preferences
6. WHEN sending SMS alerts, THE Alert_System SHALL format messages to fit within 160 characters

### Requirement 3: Alert Retrieval and Filtering

**User Story:** As a user, I want to view current and past disaster alerts, so that I can stay informed about ongoing and historical emergencies.

#### Acceptance Criteria

1. WHEN a user requests alerts, THE Alert_System SHALL return active alerts first, sorted by severity
2. WHEN a user filters by alert type, THE Alert_System SHALL return only alerts matching that type
3. WHEN a user filters by location, THE Alert_System SHALL return alerts within specified radius
4. WHEN a user requests alert details, THE Alert_System SHALL include all metadata (source, affected areas, timestamps)
5. THE Alert_System SHALL support pagination for alert lists with configurable page size
6. WHEN retrieving alerts, THE Alert_System SHALL include alert source (PAGASA, PHIVOLCS, NDRRMC)

### Requirement 4: Location-Based Alert Targeting

**User Story:** As an admin, I want to target alerts to specific geographic areas, so that only affected users receive notifications.

#### Acceptance Criteria

1. WHEN creating an alert with affected areas, THE Alert_System SHALL accept an array of provinces/cities
2. WHEN broadcasting location-based alerts, THE Alert_System SHALL query users within affected areas
3. WHERE radius is specified, THE Alert_System SHALL calculate distance from alert coordinates to user location
4. WHEN a user's location is unknown, THE Alert_System SHALL send the alert as a precaution
5. THE Alert_System SHALL support multiple affected areas per alert
6. WHEN updating affected areas, THE Alert_System SHALL re-evaluate notification targets

### Requirement 5: Alert Metadata and Source Tracking

**User Story:** As a user, I want to know the source and details of each alert, so that I can assess credibility and take appropriate action.

#### Acceptance Criteria

1. WHEN an alert is created, THE Alert_System SHALL require a source field (PAGASA, PHIVOLCS, NDRRMC)
2. WHEN an alert includes additional data, THE Alert_System SHALL store it in the metadata JSON field
3. WHERE alert type is typhoon, THE Alert_System SHALL support wind speed and signal number in metadata
4. WHERE alert type is earthquake, THE Alert_System SHALL support magnitude and depth in metadata
5. WHEN displaying alerts, THE Alert_System SHALL include start_time and end_time if available
6. THE Alert_System SHALL track which admin created each alert

### Requirement 6: Offline Alert Caching

**User Story:** As a user, I want to access recent alerts even without internet, so that I can review safety information during connectivity issues.

#### Acceptance Criteria

1. WHEN the mobile app receives alerts, THE Alert_System SHALL provide data suitable for local caching
2. WHEN a user requests alerts offline, THE Alert_System SHALL have provided sufficient data for 7 days of alerts
3. THE Alert_System SHALL include cache-control headers in API responses
4. WHEN alerts are updated, THE Alert_System SHALL provide updated_at timestamps for sync detection
5. THE Alert_System SHALL support conditional requests using If-Modified-Since headers
6. WHEN returning alert lists, THE Alert_System SHALL include pagination metadata for offline sync

### Requirement 7: Alert Statistics and Monitoring

**User Story:** As an admin, I want to view alert delivery statistics, so that I can ensure notifications reach users effectively.

#### Acceptance Criteria

1. WHEN an alert is broadcast, THE Alert_System SHALL track total recipients, successful deliveries, and failures
2. WHEN viewing alert details, THE Alert_System SHALL display delivery statistics by channel (push, SMS)
3. THE Alert_System SHALL maintain a notification log for audit purposes
4. WHEN notification delivery fails, THE Alert_System SHALL log the failure reason
5. THE Alert_System SHALL provide aggregate statistics for alert effectiveness
6. WHEN querying statistics, THE Alert_System SHALL support filtering by date range and alert type

### Requirement 8: Alert Validation and Error Handling

**User Story:** As an admin, I want clear error messages when creating alerts, so that I can correct issues quickly during emergencies.

#### Acceptance Criteria

1. WHEN required fields are missing, THE Alert_System SHALL return a 400 error with specific field names
2. WHEN invalid alert type is provided, THE Alert_System SHALL return available alert types
3. WHEN invalid severity level is provided, THE Alert_System SHALL return valid severity options
4. IF geographic coordinates are invalid, THEN THE Alert_System SHALL reject the alert with clear error message
5. WHEN affected areas are empty, THE Alert_System SHALL require at least one affected area or nationwide flag
6. THE Alert_System SHALL validate date ranges ensuring end_time is after start_time

### Requirement 9: Alert Search and History

**User Story:** As a user, I want to search past alerts by keyword or date, so that I can find specific disaster information.

#### Acceptance Criteria

1. WHEN a user searches alerts, THE Alert_System SHALL search in title and description fields
2. WHEN filtering by date range, THE Alert_System SHALL return alerts within specified start and end dates
3. THE Alert_System SHALL support case-insensitive search
4. WHEN searching, THE Alert_System SHALL return results sorted by relevance and date
5. THE Alert_System SHALL maintain alert history for at least 1 year
6. WHEN no results match, THE Alert_System SHALL return an empty array with appropriate message

### Requirement 10: Real-Time Alert Updates

**User Story:** As a user, I want to receive updates when alert severity changes, so that I can respond to evolving situations.

#### Acceptance Criteria

1. WHEN an alert severity is upgraded, THE Alert_System SHALL broadcast update notifications
2. WHEN an alert is deactivated, THE Alert_System SHALL notify users who received the original alert
3. THE Alert_System SHALL include update reason in notification messages
4. WHEN alerts are updated frequently, THE Alert_System SHALL rate-limit notifications to prevent spam
5. THE Alert_System SHALL track alert version history for audit purposes
6. WHEN an alert end_time is reached, THE Alert_System SHALL automatically deactivate the alert
