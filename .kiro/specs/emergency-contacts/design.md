# Design Document: Emergency Contacts Management

## Overview

The Emergency Contacts Management system provides quick access to emergency hotlines and services. It implements efficient categorization, location-based filtering, and offline-first data access.

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
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Database      │
│   (MySQL)       │
└─────────────────┘
```

## Components and Interfaces

### 1. Emergency Contact Controller (`emergencyContact.controller.ts`)

**Responsibilities:**
- Handle HTTP requests for contact operations
- Validate contact data
- Format responses with categorization

**Key Methods:**
```typescript
class EmergencyContactController {
  createContact(req, res, next): Promise<void>
  getContacts(req, res, next): Promise<void>
  getContactById(req, res, next): Promise<void>
  getByCategory(req, res, next): Promise<void>
  updateContact(req, res, next): Promise<void>
  deactivateContact(req, res, next): Promise<void>
  searchContacts(req, res, next): Promise<void>
}
```

### 2. Emergency Contact Service (`emergencyContact.service.ts`)

**Responsibilities:**
- Implement contact management logic
- Filter by location and category
- Handle national vs local contacts
- Manage display ordering

**Key Methods:**
```typescript
class EmergencyContactService {
  createContact(data: CreateContactDto): Promise<EmergencyContact>
  getContacts(filters: ContactFilters): Promise<GroupedContacts>
  getContactById(id: number): Promise<EmergencyContact>
  getByCategory(category: string, location?: LocationFilter): Promise<EmergencyContact[]>
  updateContact(id: number, data: UpdateContactDto): Promise<EmergencyContact>
  deactivateContact(id: number): Promise<void>
  searchContacts(query: string, filters?: ContactFilters): Promise<EmergencyContact[]>
  validatePhoneNumber(phone: string): boolean
}
```

## Data Models

### EmergencyContact Interface
```typescript
interface EmergencyContact {
  id: number;
  category: string;
  name: string;
  phone: string;
  alternate_phone?: string;
  email?: string;
  address?: string;
  city?: string;
  province?: string;
  is_national: boolean;
  is_active: boolean;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}

interface GroupedContacts {
  [category: string]: EmergencyContact[];
}
```

### DTOs
```typescript
interface CreateContactDto {
  category: string;
  name: string;
  phone: string;
  alternate_phone?: string;
  email?: string;
  address?: string;
  city?: string;
  province?: string;
  is_national: boolean;
  display_order?: number;
}

interface ContactFilters {
  category?: string;
  city?: string;
  province?: string;
  is_national?: boolean;
  is_active?: boolean;
}

interface LocationFilter {
  city?: string;
  province?: string;
}
```

## API Endpoints

### Public Endpoints

**GET /api/v1/emergency-contacts**
- Get all contacts grouped by category
- Query params: `city`, `province`, `category`, `is_active`

**GET /api/v1/emergency-contacts/category/:category**
- Get contacts by specific category
- Query params: `city`, `province`

**GET /api/v1/emergency-contacts/search**
- Search contacts by keyword
- Query params: `q`, `category`, `city`

**GET /api/v1/emergency-contacts/:id**
- Get single contact details

### Admin Endpoints

**POST /api/v1/emergency-contacts**
- Create new contact

**PUT /api/v1/emergency-contacts/:id**
- Update contact information

**DELETE /api/v1/emergency-contacts/:id**
- Deactivate contact

## Correctness Properties

### Property 1: Category Grouping
*For any* contacts retrieval, contacts should be grouped by category with all contacts in each group having the same category value.
**Validates: Requirements 2.1**

### Property 2: Display Order Sorting
*For any* category, contacts should be sorted by display_order ascending, then alphabetically by name.
**Validates: Requirements 5.2**

### Property 3: National Contacts Inclusion
*For any* location-filtered query, national contacts should always be included in results regardless of location.
**Validates: Requirements 3.4**

### Property 4: Local Contact Location Requirement
*For any* contact with is_national=false, either city or province must be specified.
**Validates: Requirements 8.3**

### Property 5: Phone Number Validation
*For any* contact creation or update, phone numbers should match Philippine format (09XXXXXXXXX or +639XXXXXXXXX).
**Validates: Requirements 7.1**

### Property 6: Active Contacts Default
*For any* contact retrieval without is_active filter, only active contacts should be returned.
**Validates: Requirements 4.6**

### Property 7: Search Case Insensitivity
*For any* search query, results should include matches regardless of case (uppercase/lowercase).
**Validates: Requirements 4.2**

### Property 8: Location Priority
*For any* location-filtered query, local contacts matching the location should appear before national contacts.
**Validates: Requirements 3.2**

### Property 9: Category Count Accuracy
*For any* grouped contacts response, the count of contacts per category should match the actual number of contacts in that category.
**Validates: Requirements 2.6**

### Property 10: Deactivation Preservation
*For any* contact deactivation, all contact data should be preserved with only is_active set to false.
**Validates: Requirements 6.4**

## Error Handling

### Validation Errors (400)
- Invalid phone number format
- Invalid email format
- Missing required fields
- Local contact without location

### Not Found Errors (404)
- Contact ID doesn't exist
- Category doesn't exist

### Server Errors (500)
- Database failures

## Testing Strategy

### Unit Tests
- Test phone number validation
- Test email validation
- Test display order sorting
- Test category grouping logic

### Property-Based Tests
- Generate random contacts, verify grouping
- Generate random display orders, verify sorting
- Generate random locations, verify filtering
- Generate random search queries, verify case insensitivity

### Integration Tests
- Test complete contact creation flow
- Test location-based filtering
- Test search functionality
- Test national vs local contact logic
