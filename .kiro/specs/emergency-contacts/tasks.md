# Implementation Plan: Emergency Contacts Management

## Overview

This plan implements the Emergency Contacts Management system with category organization, location-based filtering, and offline support.

## Tasks

- [x] 1. Implement Emergency Contact Service
  - [x] 1.1 Create contact service with CRUD operations
    - Implement createContact method with validation
    - Implement getContacts with filtering and grouping
    - Implement getContactById method
    - Implement updateContact method
    - Implement deactivateContact method (soft delete)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 1.2 Implement category grouping
    - Group contacts by category
    - Sort by display_order and name
    - Return grouped structure
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 1.3 Implement location filtering
    - Support national vs local contacts
    - Include national contacts in all location queries
    - Filter local contacts by city/province
    - Prioritize local contacts over national
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 2. Implement Emergency Contact Controller
  - [x] 2.1 Create public contact endpoints
    - Implement GET /emergency-contacts (grouped by category)
    - Implement GET /emergency-contacts/category/:category
    - Implement GET /emergency-contacts/search
    - Implement GET /emergency-contacts/categories
    - Implement GET /emergency-contacts/:id
    - Add filtering by category, city, province
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 2.2 Create admin contact endpoints
    - Implement POST /emergency-contacts (create)
    - Implement PUT /emergency-contacts/:id (update)
    - Implement DELETE /emergency-contacts/:id (deactivate)
    - Add authentication and authorization middleware
    - _Requirements: 1.1, 1.5, 1.6, 6.1, 6.2, 6.3_

- [x] 3. Implement Display Order Management
  - [x] 3.1 Add display order support
    - Store display_order field
    - Sort by display_order ascending
    - Then sort alphabetically by name
    - Support custom ordering per category
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 4. Implement Offline Support
  - [x] 4.1 Add cache-control headers
    - Set appropriate cache headers (1 hour for contacts)
    - Include Last-Modified timestamps
    - Support bulk retrieval for offline caching
    - Optimize response size for mobile
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 5. Implement Contact Information Validation
  - [x] 5.1 Add validation methods
    - Validate phone number format (Philippine format)
    - Validate email format
    - Validate alternate phone number
    - Require location for local contacts
    - Provide specific error messages
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 6. Implement Search Functionality
  - [x] 6.1 Create search endpoint
    - Search in name and category fields
    - Support case-insensitive search
    - Filter by category, city, province
    - Sort by location priority (local first)
    - Then by display_order and name
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 7. Implement Administrative Operations
  - [x] 7.1 Add admin features
    - Support filtering by active/inactive status
    - Track which admin made modifications (via created_at/updated_at)
    - Support bulk operations via standard endpoints
    - Validate all updates before applying
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 8. Implement Data Validation
  - [x] 8.1 Create validation rules
    - Validate phone numbers (09XXXXXXXXX or +639XXXXXXXXX)
    - Validate email format
    - Validate local contacts have city or province
    - Provide format guidance in errors
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 9. Testing and Documentation
  - [ ] 9.1 Write unit tests
    - Test CRUD operations
    - Test category grouping
    - Test location filtering
    - Test validation logic

  - [ ] 9.2 Write integration tests
    - Test complete contact management flow
    - Test national vs local contact logic
    - Test search functionality

  - [x] 9.3 Update API documentation
    - Document all endpoints
    - Include request/response examples
    - Document query parameters
    - Document error responses

## Notes

- All core functionality is implemented
- Contacts grouped by category for easy mobile app display
- National contacts always included in location-based queries
- Local contacts prioritized over national in results
- Soft delete pattern used (is_active flag)
- Cache headers set for offline support (1 hour)
- Phone and email validation included
- Display order allows custom sorting within categories
