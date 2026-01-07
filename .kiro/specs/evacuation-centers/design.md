# Design Document: Evacuation Centers Management

## Overview

The Evacuation Centers Management system provides location-based search and management of emergency shelters. It implements efficient geospatial queries, capacity tracking, and offline-first data access patterns.

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
│ + Spatial Index │
└─────────────────┘
```

## Components and Interfaces

### 1. Evacuation Controller (`evacuation.controller.ts`)

**Responsibilities:**
- Handle HTTP requests for evacuation center operations
- Validate location parameters
- Format geospatial responses

**Key Methods:**
```typescript
class EvacuationController {
  createCenter(req, res, next): Promise<void>
  getCenters(req, res, next): Promise<void>
  getCenterById(req, res, next): Promise<void>
  getNearby(req, res, next): Promise<void>
  updateCenter(req, res, next): Promise<void>
  updateOccupancy(req, res, next): Promise<void>
  deactivateCenter(req, res, next): Promise<void>
  getStatistics(req, res, next): Promise<void>
}
```

### 2. Evacuation Service (`evacuation.service.ts`)

**Responsibilities:**
- Implement center management logic
- Calculate distances using Haversine formula
- Track capacity and occupancy
- Filter by location and facilities

**Key Methods:**
```typescript
class EvacuationService {
  createCenter(data: CreateCenterDto): Promise<EvacuationCenter>
  getCenters(filters: CenterFilters): Promise<PaginatedCenters>
  getCenterById(id: number): Promise<EvacuationCenter>
  getNearby(lat: number, lng: number, radius: number): Promise<CenterWithDistance[]>
  updateCenter(id: number, data: UpdateCenterDto): Promise<EvacuationCenter>
  updateOccupancy(id: number, occupancy: number): Promise<EvacuationCenter>
  deactivateCenter(id: number): Promise<void>
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number
  getStatistics(filters?: StatFilters): Promise<CenterStatistics>
}
```

## Data Models

### EvacuationCenter Interface
```typescript
interface EvacuationCenter {
  id: number;
  name: string;
  address: string;
  city: string;
  province: string;
  barangay?: string;
  latitude: number;
  longitude: number;
  capacity: number;
  current_occupancy: number;
  contact_person?: string;
  contact_number?: string;
  facilities: string[]; // JSON array
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface CenterWithDistance extends EvacuationCenter {
  distance_km: number;
}
```

### DTOs
```typescript
interface CreateCenterDto {
  name: string;
  address: string;
  city: string;
  province: string;
  barangay?: string;
  latitude: number;
  longitude: number;
  capacity: number;
  contact_person?: string;
  contact_number?: string;
  facilities?: string[];
}

interface CenterFilters {
  city?: string;
  province?: string;
  barangay?: string;
  is_active?: boolean;
  has_capacity?: boolean;
  facilities?: string[];
  page?: number;
  limit?: number;
}
```

## API Endpoints

### Public Endpoints

**GET /api/v1/evacuation-centers**
- Get list of centers with filtering
- Query params: `city`, `province`, `barangay`, `is_active`, `page`, `limit`

**GET /api/v1/evacuation-centers/nearby**
- Get nearby centers sorted by distance
- Query params: `lat`, `lng`, `radius` (default: 50km)

**GET /api/v1/evacuation-centers/:id**
- Get single center details

### Admin Endpoints

**POST /api/v1/evacuation-centers**
- Create new center

**PUT /api/v1/evacuation-centers/:id**
- Update center information

**PATCH /api/v1/evacuation-centers/:id/occupancy**
- Update current occupancy

**DELETE /api/v1/evacuation-centers/:id**
- Deactivate center

**GET /api/v1/evacuation-centers/statistics**
- Get capacity statistics

## Correctness Properties

### Property 1: Distance Calculation Accuracy
*For any* two valid coordinate pairs, the Haversine distance calculation should return a non-negative value in kilometers.
**Validates: Requirements 2.2**

### Property 2: Nearby Centers Sorting
*For any* nearby centers query, results should be sorted by distance in ascending order (nearest first).
**Validates: Requirements 2.4**

### Property 3: Radius Filtering
*For any* nearby query with specified radius, all returned centers should be within that radius from the query coordinates.
**Validates: Requirements 2.3**

### Property 4: Occupancy Validation
*For any* occupancy update, if the new occupancy exceeds capacity, the system should reject the update.
**Validates: Requirements 3.3**

### Property 5: Active Centers Default
*For any* center list request without is_active filter, only active centers should be returned.
**Validates: Requirements 4.6**

### Property 6: Capacity Percentage Calculation
*For any* center with occupancy and capacity, the occupancy percentage should equal (occupancy / capacity) * 100.
**Validates: Requirements 3.4**

### Property 7: Location Filter Combination
*For any* query filtering by both city and province, all returned centers should match both criteria.
**Validates: Requirements 4.4**

### Property 8: Coordinate Validation
*For any* center creation with coordinates, latitude should be between -90 and 90, longitude between -180 and 180.
**Validates: Requirements 9.1**

### Property 9: Facilities Array Preservation
*For any* center update that doesn't modify facilities, the original facilities array should remain unchanged.
**Validates: Requirements 5.6**

### Property 10: Deactivation Preservation
*For any* center deactivation, all center data should be preserved with only is_active set to false.
**Validates: Requirements 1.4**

## Error Handling

### Validation Errors (400)
- Invalid coordinates
- Negative or zero capacity
- Occupancy exceeds capacity
- Missing required fields

### Not Found Errors (404)
- Center ID doesn't exist

### Server Errors (500)
- Database failures
- Geospatial calculation errors

## Testing Strategy

### Unit Tests
- Test Haversine distance calculation
- Test occupancy percentage calculation
- Test coordinate validation
- Test capacity validation

### Property-Based Tests
- Generate random coordinates, verify distance calculations
- Generate random centers, verify sorting by distance
- Generate random occupancy values, verify validation
- Generate random filters, verify result accuracy

### Integration Tests
- Test complete center creation flow
- Test nearby search with real coordinates
- Test occupancy updates
- Test filtering combinations
