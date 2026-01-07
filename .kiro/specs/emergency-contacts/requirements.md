# Requirements Document: Emergency Contacts Management

## Introduction

The Emergency Contacts Management system provides users with quick access to critical hotlines and emergency services. It supports national and local contacts, offline access, and dynamic updates from administrators.

## Glossary

- **Contact_System**: The backend service managing emergency contact information
- **Emergency_Contact**: A hotline or service for emergency assistance
- **User**: A SafeHaven mobile app user needing emergency assistance
- **Admin**: LGU personnel managing contact information
- **Category**: Type of emergency service (Police, Fire, Medical, Rescue, etc.)
- **National_Contact**: Emergency service available nationwide
- **Local_Contact**: Emergency service specific to a city or province

## Requirements

### Requirement 1: Contact Data Management

**User Story:** As an LGU officer, I want to manage emergency contact information, so that users have accurate hotlines during emergencies.

#### Acceptance Criteria

1. WHEN an admin creates a contact, THE Contact_System SHALL validate all required fields (category, name, phone)
2. WHEN a contact is created, THE Contact_System SHALL assign a unique identifier
3. WHEN updating contact information, THE Contact_System SHALL preserve creation timestamp
4. WHEN an admin deactivates a contact, THE Contact_System SHALL set is_active to false
5. THE Contact_System SHALL support alternate phone numbers for each contact
6. WHEN email is provided, THE Contact_System SHALL validate email format

### Requirement 2: Contact Categorization

**User Story:** As a user, I want to browse emergency contacts by category, so that I can quickly find the right service.

#### Acceptance Criteria

1. WHEN retrieving contacts, THE Contact_System SHALL group results by category
2. THE Contact_System SHALL support standard categories (Police, Fire, Medical, Rescue, Coast Guard, NDRRMC)
3. WHEN filtering by category, THE Contact_System SHALL return only contacts in that category
4. THE Contact_System SHALL allow custom categories for local services
5. WHEN displaying categories, THE Contact_System SHALL sort alphabetically
6. THE Contact_System SHALL include contact count per category

### Requirement 3: Location-Based Contact Filtering

**User Story:** As a user, I want to see emergency contacts relevant to my location, so that I reach local services quickly.

#### Acceptance Criteria

1. WHEN a user requests contacts, THE Contact_System SHALL prioritize local contacts based on user location
2. WHEN filtering by city, THE Contact_System SHALL return city-specific and national contacts
3. WHEN filtering by province, THE Contact_System SHALL return province-wide and national contacts
4. THE Contact_System SHALL always include national emergency contacts in results
5. WHEN location is not specified, THE Contact_System SHALL return national contacts only
6. THE Contact_System SHALL indicate whether each contact is national or local

### Requirement 4: Contact Search

**User Story:** As a user, I want to search for specific emergency services, so that I can find specialized assistance.

#### Acceptance Criteria

1. WHEN searching contacts, THE Contact_System SHALL search in name, category, and city fields
2. THE Contact_System SHALL perform case-insensitive partial matching
3. WHEN multiple search terms are provided, THE Contact_System SHALL match any term
4. THE Contact_System SHALL return results sorted by relevance
5. WHEN no results match, THE Contact_System SHALL return an empty array
6. THE Contact_System SHALL support search within specific categories

### Requirement 5: Display Order Management

**User Story:** As an admin, I want to control the display order of contacts, so that most important services appear first.

#### Acceptance Criteria

1. WHEN creating contacts, THE Contact_System SHALL accept a display_order field
2. WHEN retrieving contacts, THE Contact_System SHALL sort by display_order ascending
3. WHEN display_order is not specified, THE Contact_System SHALL default to 0
4. THE Contact_System SHALL allow reordering contacts within categories
5. WHEN multiple contacts have same display_order, THE Contact_System SHALL sort alphabetically
6. THE Contact_System SHALL support bulk reordering operations

### Requirement 6: Offline Access

**User Story:** As a user, I want to access emergency contacts offline, so that I can call for help during connectivity issues.

#### Acceptance Criteria

1. WHEN the mobile app syncs, THE Contact_System SHALL provide all relevant contacts for offline storage
2. THE Contact_System SHALL include cache-control headers for offline caching
3. WHEN contacts are updated, THE Contact_System SHALL provide updated_at timestamps
4. THE Contact_System SHALL support bulk retrieval for efficient syncing
5. THE Contact_System SHALL optimize response size for mobile data constraints
6. WHEN returning contacts, THE Contact_System SHALL include all necessary information for offline use

### Requirement 7: Contact Validation

**User Story:** As an admin, I want validation of contact information, so that users receive accurate emergency numbers.

#### Acceptance Criteria

1. WHEN phone numbers are entered, THE Contact_System SHALL validate Philippine phone number format
2. WHEN email is provided, THE Contact_System SHALL validate email format
3. WHEN required fields are missing, THE Contact_System SHALL return specific error messages
4. IF duplicate phone numbers exist, THEN THE Contact_System SHALL warn the admin
5. WHEN updating contacts, THE Contact_System SHALL validate all fields
6. THE Contact_System SHALL ensure at least one phone number is provided

### Requirement 8: National vs Local Contacts

**User Story:** As a user, I want to distinguish between national and local emergency services, so that I know which services are available in my area.

#### Acceptance Criteria

1. WHEN creating a contact, THE Contact_System SHALL require is_national flag
2. WHEN a contact is national, THE Contact_System SHALL not require city or province
3. WHEN a contact is local, THE Contact_System SHALL require city or province
4. THE Contact_System SHALL display national contacts prominently in all locations
5. WHEN filtering by location, THE Contact_System SHALL always include national contacts
6. THE Contact_System SHALL indicate contact scope (national/local) in responses

### Requirement 9: Contact Information Completeness

**User Story:** As a user, I want complete contact information, so that I can reach emergency services through multiple channels.

#### Acceptance Criteria

1. WHEN retrieving contact details, THE Contact_System SHALL include all available contact methods
2. THE Contact_System SHALL support primary and alternate phone numbers
3. WHEN email is available, THE Contact_System SHALL include it in responses
4. WHEN address is provided, THE Contact_System SHALL include it for reference
5. THE Contact_System SHALL indicate which contact methods are available
6. WHEN contact information is incomplete, THE Contact_System SHALL clearly indicate missing data

### Requirement 10: Administrative Features

**User Story:** As an admin, I want to manage emergency contacts efficiently, so that I can keep information current during emergencies.

#### Acceptance Criteria

1. WHEN an admin requests all contacts, THE Contact_System SHALL support pagination
2. THE Contact_System SHALL allow filtering by active/inactive status
3. WHEN bulk updating contacts, THE Contact_System SHALL validate all updates before applying
4. THE Contact_System SHALL support exporting contact data for reporting
5. WHEN deactivating contacts, THE Contact_System SHALL support bulk deactivation
6. THE Contact_System SHALL track which admin made each modification
