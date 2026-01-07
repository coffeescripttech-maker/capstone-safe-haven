# Implementation Plan: Evacuation Centers Management

## Overview

This plan implements the Evacuation Centers Management system with location-based search, capacity tracking, and offline support.

## Tasks

- [x] 1. Implement Evacuation Center Service
  - [x] 1.1 Create center service with CRUD operations
    - Implement createCenter method with validation
    - Implement getCenters with filtering and pagination
    - Implement getCenterById method
    - Implement updateCenter method
    - Implement deactivateCenter method (soft delete)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 1.2 Implement location-based search
    - Create findNearby method using Haversine formula
    - Implement radius-based filtering (default 50km)
    - Sort results by distance (nearest first)
    - Include distance in response
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 1.3 Implement capacity tracking
    - Track current_occupancy and capacity
    - Calculate occupancy_percentage
    - Flag centers as full when at capacity
    - Validate occupancy doesn't exceed capacity
    - Support occupancy reset to zero
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 2. Implement Evacuation Center Controller
  - [x] 2.1 Create public center endpoints
    - Implement GET /evacuation-centers (list with filters)
    - Implement GET /evacuation-centers/nearby (location-based)
    - Implement GET /evacuation-centers/search (name search)
    - Implement GET /evacuation-centers/:id (single center)
    - Add pagination support
    - Add filtering by city, province, barangay
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 2.2 Create admin center endpoints
    - Implement POST /evacuation-centers (create)
    - Implement PUT /evacuation-centers/:id (update)
    - Implement PATCH /evacuation-centers/:id/occupancy (update occupancy)
    - Implement DELETE /evacuation-centers/:id (deactivate)
    - Add authentication and authorization middleware
    - _Requirements: 1.1, 1.3, 1.4, 3.3, 8.1, 8.2_

- [x] 3. Implement Facility Management
  - [x] 3.1 Add facility support
    - Store facilities as JSON array
    - Support common facilities (medical, food, water, restrooms, power, wifi)
    - Include facilities in all responses
    - Allow facilities to be updated independently
    - Return empty array when not specified
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 4. Implement Offline Support
  - [x] 4.1 Add cache-control headers
    - Set appropriate cache headers (10 minutes for centers)
    - Include Last-Modified timestamps
    - Support bulk retrieval for offline caching
    - Optimize response size for mobile
    - Include all necessary navigation data
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 5. Implement Contact Information
  - [x] 5.1 Add contact support
    - Include contact_person and contact_number
    - Validate phone number format (Philippine format)
    - Handle missing contact information
    - Format phone numbers consistently
    - Allow contact updates without full center update
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 6. Implement Statistics and Reporting
  - [x] 6.1 Create statistics endpoint
    - Provide total centers by region
    - Calculate total capacity and occupancy
    - Show centers at or near capacity
    - Provide occupancy breakdown by province
    - Support filtering by province
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [x] 7. Implement Data Validation
  - [x] 7.1 Create validation methods
    - Validate coordinates (lat: -90 to 90, lng: -180 to 180)
    - Validate capacity (must be > 0)
    - Validate phone number format
    - Validate occupancy doesn't exceed capacity
    - Provide specific error messages
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 8. Testing and Documentation
  - [ ] 8.1 Write unit tests
    - Test CRUD operations
    - Test location-based search
    - Test capacity tracking
    - Test validation logic

  - [ ] 8.2 Write integration tests
    - Test complete center management flow
    - Test nearby search with real coordinates
    - Test occupancy updates

  - [x] 8.3 Update API documentation
    - Document all endpoints
    - Include request/response examples
    - Document query parameters
    - Document error responses

## Notes

- All core functionality is implemented
- Database uses POINT type with SPATIAL INDEX for efficient geospatial queries
- Haversine formula implemented via MySQL ST_Distance_Sphere function
- Soft delete pattern used (is_active flag)
- Cache headers set for offline support
- Phone validation uses Philippine format
