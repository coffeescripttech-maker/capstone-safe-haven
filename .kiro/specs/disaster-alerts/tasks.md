# Implementation Plan: Disaster Alert System

## Overview

This plan implements the Disaster Alert System with multi-channel broadcasting (push notifications and SMS), location-based targeting, and offline caching support.

## Tasks

- [x] 1. Setup notification infrastructure
  - Install Firebase Admin SDK and SMS provider dependencies
  - Configure Firebase credentials in environment variables
  - Configure SMS provider (Semaphore/Twilio) API keys
  - Create notification service base structure
  - _Requirements: 2.1, 2.2_

- [x] 2. Implement Alert Service
  - [x] 2.1 Create alert service with CRUD operations
    - Implement createAlert method with validation
    - Implement getAlerts with filtering and pagination
    - Implement getAlertById method
    - Implement updateAlert method
    - Implement deactivateAlert method (soft delete)
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6_

  - [ ]* 2.2 Write property test for alert creation validation
    - **Property 1: Alert Creation Validation**
    - **Validates: Requirements 1.1, 1.2**

  - [x] 2.3 Implement location-based user targeting
    - Create getTargetedUsers method
    - Implement affected areas matching logic
    - Implement radius-based distance calculation
    - Handle users with unknown locations
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 2.4 Write property test for location targeting
    - **Property 3: Location-Based Targeting**
    - **Validates: Requirements 4.3**

- [x] 3. Implement Notification Service
  - [x] 3.1 Create FCM push notification handler
    - Implement sendPushNotification method
    - Handle device token retrieval
    - Format notification payload
    - Handle FCM errors and retries
    - _Requirements: 2.1_

  - [x] 3.2 Create SMS notification handler
    - Implement sendSMS method
    - Format SMS messages (160 char limit)
    - Integrate with SMS provider API
    - Handle SMS delivery failures
    - _Requirements: 2.2, 2.6_

  - [x] 3.3 Implement notification logging
    - Create logNotification method
    - Log all notification attempts
    - Track success/failure status
    - Store delivery timestamps
    - _Requirements: 2.4, 7.3_

  - [ ]* 3.4 Write property test for notification logging
    - **Property 5: Notification Logging**
    - **Validates: Requirements 2.4, 7.3**

  - [x] 3.5 Implement SMS fallback logic
    - Detect push notification failures
    - Trigger SMS for failed push notifications
    - Verify user has valid phone number
    - _Requirements: 2.2_

  - [ ]* 3.6 Write property test for SMS fallback
    - **Property 6: SMS Fallback**
    - **Validates: Requirements 2.2**

- [x] 4. Implement Alert Controller
  - [x] 4.1 Create public alert endpoints
    - Implement GET /alerts (list with filters)
    - Implement GET /alerts/:id (single alert)
    - Add pagination support
    - Add filtering by type, severity, location
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 4.2 Write property test for active alerts filtering
    - **Property 2: Active Alerts Filtering**
    - **Validates: Requirements 3.1**

  - [ ]* 4.3 Write property test for severity sorting
    - **Property 4: Severity Sorting**
    - **Validates: Requirements 3.1**

  - [x] 4.4 Create admin alert endpoints
    - Implement POST /alerts (create)
    - Implement PUT /alerts/:id (update)
    - Implement DELETE /alerts/:id (deactivate)
    - Add authentication and authorization middleware
    - _Requirements: 1.1, 1.5, 1.6_

  - [ ]* 4.5 Write property test for alert deactivation
    - **Property 7: Alert Deactivation Preservation**
    - **Validates: Requirements 1.6**

- [x] 5. Implement Alert Broadcasting
  - [x] 5.1 Create broadcast endpoint and logic
    - Implement POST /alerts/:id/broadcast
    - Get targeted users based on alert
    - Send push notifications to all devices
    - Trigger SMS fallback for failures
    - Return broadcast statistics
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 5.2 Implement broadcast statistics
    - Track total recipients
    - Count successful/failed push notifications
    - Count successful/failed SMS
    - Store statistics in database
    - _Requirements: 7.1, 7.2_

  - [ ]* 5.3 Write integration test for complete broadcast flow
    - Test alert creation → broadcast → notification delivery
    - Verify statistics accuracy
    - _Requirements: 2.1, 2.2, 7.1_

- [x] 6. Implement Alert Validation
  - [x] 6.1 Create input validation middleware
    - Validate alert type enum
    - Validate severity enum
    - Validate required fields
    - Validate coordinate ranges
    - Validate date ranges
    - Validate affected areas
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ]* 6.2 Write property test for date range validation
    - **Property 9: Date Range Validation**
    - **Validates: Requirements 8.6**

  - [ ]* 6.3 Write property test for affected areas validation
    - **Property 8: Affected Areas Validation**
    - **Validates: Requirements 8.5**

- [x] 7. Implement Alert Metadata and Source Tracking
  - [x] 7.1 Add metadata support
    - Store metadata as JSON field
    - Support typhoon-specific data (wind speed, signal)
    - Support earthquake-specific data (magnitude, depth)
    - Preserve metadata on updates
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 7.2 Write property test for metadata preservation
    - **Property 10: Metadata Preservation**
    - **Validates: Requirements 5.2**

  - [x] 7.3 Implement source tracking
    - Validate source field (PAGASA, PHIVOLCS, NDRRMC, LGU, OTHER)
    - Track creating admin user
    - Include source in all responses
    - _Requirements: 5.1, 5.6_

- [x] 8. Implement Alert Search and History
  - [x] 8.1 Create search endpoint
    - Implement GET /alerts/search
    - Search in title and description
    - Support case-insensitive search
    - Filter by date range
    - Sort by relevance and date
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.6_

  - [x] 8.2 Implement alert history maintenance
    - Ensure alerts are never hard-deleted (soft delete with is_active)
    - Maintain history with created_at timestamps
    - Add created_at index for performance (already in schema)
    - _Requirements: 9.5_

- [x] 9. Implement Offline Support Features
  - [x] 9.1 Add cache-control headers
    - Set appropriate cache headers (5 minutes for alerts)
    - Support Last-Modified headers
    - Include updated_at in responses
    - _Requirements: 6.1, 6.3, 6.4_

  - [x] 9.2 Optimize responses for mobile
    - Add pagination metadata
    - Limit response sizes (20 items default)
    - Include only necessary fields
    - _Requirements: 6.2, 6.6_

- [x] 10. Implement Real-Time Alert Updates
  - [x] 10.1 Create alert update notification system
    - Detect severity upgrades
    - Broadcast update notifications
    - Include update reason
    - Track alert updates with updated_at
    - _Requirements: 10.1, 10.3, 10.5_

  - [x] 10.2 Implement alert deactivation notifications
    - Auto-deactivate expired alerts endpoint
    - Soft delete with is_active flag
    - _Requirements: 10.2, 10.6_

  - [ ] 10.3 Add rate limiting for updates
    - Prevent notification spam
    - Limit update frequency
    - _Requirements: 10.4_

- [ ] 11. Checkpoint - Ensure all tests pass
  - Run all unit tests
  - Run all property-based tests
  - Run integration tests
  - Verify API endpoints with Postman/curl
  - Check error handling
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests should run with minimum 100 iterations
- Integration tests should cover end-to-end flows
