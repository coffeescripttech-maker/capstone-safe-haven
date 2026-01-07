# Requirements Document: Evacuation Centers Management

## Introduction

The Evacuation Centers Management system provides users with information about safe zones and evacuation facilities during disasters. It enables location-based search, capacity tracking, and offline access to critical shelter information.

## Glossary

- **Evacuation_System**: The backend service managing evacuation center data
- **Evacuation_Center**: A designated safe facility for disaster evacuees
- **User**: A SafeHaven mobile app user seeking shelter information
- **Admin**: LGU personnel managing evacuation center data
- **Capacity**: Maximum number of people an evacuation center can accommodate
- **Occupancy**: Current number of people at an evacuation center
- **GPS_Coordinates**: Latitude and longitude of evacuation center location

## Requirements

### Requirement 1: Evacuation Center Data Management

**User Story:** As an LGU officer, I want to manage evacuation center information, so that users have accurate shelter data during emergencies.

#### Acceptance Criteria

1. WHEN an admin creates an evacuation center, THE Evacuation_System SHALL validate all required fields (name, address, city, province, coordinates, capacity)
2. WHEN an evacuation center is created, THE Evacuation_System SHALL assign a unique identifier
3. WHEN updating center information, THE Evacuation_System SHALL preserve creation timestamp
4. WHEN an admin deactivates a center, THE Evacuation_System SHALL set is_active to false
5. THE Evacuation_System SHALL store contact person name and phone number for each center
6. WHEN facilities are specified, THE Evacuation_System SHALL store them as a JSON array

### Requirement 2: Location-Based Center Search

**User Story:** As a user, I want to find nearby evacuation centers, so that I can quickly locate the closest safe shelter.

#### Acceptance Criteria

1. WHEN a user searches for nearby centers, THE Evacuation_System SHALL require latitude and longitude
2. WHEN calculating distance, THE Evacuation_System SHALL use the Haversine formula for accuracy
3. WHEN a radius is specified, THE Evacuation_System SHALL return only centers within that radius
4. THE Evacuation_System SHALL sort results by distance from user location (nearest first)
5. WHEN no radius is specified, THE Evacuation_System SHALL default to 50 kilometers
6. THE Evacuation_System SHALL include distance in kilometers in the response

### Requirement 3: Capacity and Occupancy Tracking

**User Story:** As a user, I want to see evacuation center capacity status, so that I can choose centers with available space.

#### Acceptance Criteria

1. WHEN retrieving center details, THE Evacuation_System SHALL include current occupancy and total capacity
2. WHEN occupancy reaches capacity, THE Evacuation_System SHALL flag the center as full
3. WHEN an admin updates occupancy, THE Evacuation_System SHALL validate it doesn't exceed capacity
4. THE Evacuation_System SHALL calculate occupancy percentage for each center
5. WHEN listing centers, THE Evacuation_System SHALL indicate availability status
6. THE Evacuation_System SHALL allow occupancy to be reset to zero

### Requirement 4: Filtering and Search

**User Story:** As a user, I want to filter evacuation centers by location and facilities, so that I can find suitable shelters for my needs.

#### Acceptance Criteria

1. WHEN filtering by city, THE Evacuation_System SHALL return centers in that city only
2. WHEN filtering by province, THE Evacuation_System SHALL return all centers in that province
3. WHEN filtering by barangay, THE Evacuation_System SHALL return centers in that barangay
4. THE Evacuation_System SHALL support filtering by multiple criteria simultaneously
5. WHEN searching by name, THE Evacuation_System SHALL perform case-insensitive partial matching
6. THE Evacuation_System SHALL return only active centers by default

### Requirement 5: Facility Information

**User Story:** As a user, I want to know what facilities are available at evacuation centers, so that I can prepare accordingly.

#### Acceptance Criteria

1. WHEN creating a center, THE Evacuation_System SHALL accept a facilities array
2. THE Evacuation_System SHALL support common facilities (medical, food, water, restrooms, power, wifi)
3. WHEN retrieving center details, THE Evacuation_System SHALL include complete facilities list
4. WHEN filtering by facilities, THE Evacuation_System SHALL return centers with requested amenities
5. THE Evacuation_System SHALL allow facilities to be updated independently
6. WHEN facilities are not specified, THE Evacuation_System SHALL return an empty array

### Requirement 6: Offline Data Access

**User Story:** As a user, I want to access evacuation center data offline, so that I can find shelters during connectivity issues.

#### Acceptance Criteria

1. WHEN the mobile app syncs, THE Evacuation_System SHALL provide all active centers in user's region
2. THE Evacuation_System SHALL include cache-control headers for offline storage
3. WHEN centers are updated, THE Evacuation_System SHALL provide updated_at timestamps
4. THE Evacuation_System SHALL support bulk retrieval for offline caching
5. WHEN returning center lists, THE Evacuation_System SHALL include all necessary navigation data
6. THE Evacuation_System SHALL optimize response size for mobile data constraints

### Requirement 7: Contact Information

**User Story:** As a user, I want to contact evacuation centers directly, so that I can verify availability before traveling.

#### Acceptance Criteria

1. WHEN retrieving center details, THE Evacuation_System SHALL include contact person and phone number
2. THE Evacuation_System SHALL validate phone number format during creation
3. WHEN contact information is unavailable, THE Evacuation_System SHALL indicate this clearly
4. THE Evacuation_System SHALL support alternate contact numbers
5. WHEN displaying contacts, THE Evacuation_System SHALL format phone numbers consistently
6. THE Evacuation_System SHALL allow contact information updates without full center update

### Requirement 8: Administrative Operations

**User Story:** As an admin, I want to perform bulk operations on evacuation centers, so that I can efficiently manage multiple facilities.

#### Acceptance Criteria

1. WHEN an admin requests all centers, THE Evacuation_System SHALL support pagination
2. THE Evacuation_System SHALL allow filtering by active/inactive status
3. WHEN bulk updating occupancy, THE Evacuation_System SHALL validate all updates before applying
4. THE Evacuation_System SHALL support exporting center data for reporting
5. WHEN deactivating centers, THE Evacuation_System SHALL support bulk deactivation
6. THE Evacuation_System SHALL track which admin made each modification

### Requirement 9: Data Validation

**User Story:** As an admin, I want clear validation errors, so that I can correct data entry mistakes quickly.

#### Acceptance Criteria

1. WHEN coordinates are invalid, THE Evacuation_System SHALL return specific error messages
2. WHEN capacity is negative or zero, THE Evacuation_System SHALL reject the input
3. WHEN required address fields are missing, THE Evacuation_System SHALL specify which fields
4. IF occupancy exceeds capacity, THEN THE Evacuation_System SHALL prevent the update
5. WHEN phone numbers are invalid, THE Evacuation_System SHALL provide format guidance
6. THE Evacuation_System SHALL validate city and province against known locations

### Requirement 10: Statistics and Reporting

**User Story:** As an admin, I want to view evacuation center statistics, so that I can monitor shelter capacity across regions.

#### Acceptance Criteria

1. WHEN requesting statistics, THE Evacuation_System SHALL provide total centers by region
2. THE Evacuation_System SHALL calculate total capacity and occupancy across all centers
3. WHEN viewing statistics, THE Evacuation_System SHALL show centers at or near capacity
4. THE Evacuation_System SHALL provide occupancy trends over time
5. WHEN filtering statistics, THE Evacuation_System SHALL support date ranges
6. THE Evacuation_System SHALL identify regions with insufficient evacuation capacity
