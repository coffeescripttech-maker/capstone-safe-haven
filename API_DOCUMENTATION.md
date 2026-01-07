# SafeHaven API Documentation

Base URL: `http://localhost:3000/api/v1`

---

## Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "email": "juan@example.com",
  "phone": "09123456789",
  "password": "securePassword123",
  "firstName": "Juan",
  "lastName": "Dela Cruz"
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "email": "juan@example.com",
      "firstName": "Juan",
      "lastName": "Dela Cruz"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "juan@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "email": "juan@example.com",
      "firstName": "Juan",
      "lastName": "Dela Cruz",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Refresh Token
**POST** `/auth/refresh-token`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 4. Get Profile
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "email": "juan@example.com",
    "phone": "09123456789",
    "first_name": "Juan",
    "last_name": "Dela Cruz",
    "role": "user",
    "address": "123 Main St",
    "city": "Manila",
    "province": "Metro Manila",
    "barangay": "Barangay 1",
    "blood_type": "O+",
    "medical_conditions": null,
    "emergency_contact_name": "Maria Dela Cruz",
    "emergency_contact_phone": "09987654321"
  }
}
```

---

### 5. Update Profile
**PUT** `/auth/profile`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "firstName": "Juan",
  "lastName": "Dela Cruz",
  "phone": "09123456789",
  "address": "123 Main Street",
  "city": "Manila",
  "province": "Metro Manila",
  "barangay": "Barangay 1",
  "bloodType": "O+",
  "medicalConditions": "Asthma",
  "emergencyContactName": "Maria Dela Cruz",
  "emergencyContactPhone": "09987654321"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    // Updated profile data
  }
}
```

---

### 6. Register Device Token
**POST** `/auth/device-token`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "token": "firebase_device_token_here",
  "platform": "android"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Device token registered successfully"
}
```

---

## Disaster Alerts Endpoints (Coming Soon)

### Get All Alerts
**GET** `/alerts`

### Get Alert by ID
**GET** `/alerts/:id`

### Create Alert (Admin Only)
**POST** `/alerts`

---

## Evacuation Centers Endpoints (Coming Soon)

### Get All Centers
**GET** `/evacuation-centers`

### Get Nearby Centers
**GET** `/evacuation-centers/nearby?lat=14.5995&lng=120.9842&radius=10`

---

## Emergency Contacts Endpoints (Coming Soon)

### Get All Contacts
**GET** `/emergency-contacts`

---

## SOS Alerts Endpoints (Coming Soon)

### Create SOS Alert
**POST** `/sos`

### Get My SOS Alerts
**GET** `/sos/my-alerts`

---

## Incident Reports Endpoints (Coming Soon)

### Report Incident
**POST** `/incidents`

### Get All Incidents
**GET** `/incidents`

---

## Groups Endpoints (Coming Soon)

### Create Group
**POST** `/groups`

### Get My Groups
**GET** `/groups/my-groups`

---

## Bulletin Board Endpoints (Coming Soon)

### Get Posts
**GET** `/bulletin`

### Create Post
**POST** `/bulletin`

---

## Preparedness Guides Endpoints (Coming Soon)

### Get All Guides
**GET** `/guides`

### Get Guide by ID
**GET** `/guides/:id`

---

## Error Responses

All endpoints may return these error responses:

**400 Bad Request:**
```json
{
  "status": "error",
  "message": "Validation error message"
}
```

**401 Unauthorized:**
```json
{
  "status": "error",
  "message": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "status": "error",
  "message": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "status": "error",
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

---

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

Tokens expire after 7 days. Use the refresh token endpoint to get a new access token.

---

## Rate Limiting

API requests are limited to 100 requests per 15 minutes per IP address.

---

## Testing with cURL (Windows PowerShell)

**Register:**
```powershell
$body = @{
    email = "test@example.com"
    phone = "09123456789"
    password = "password123"
    firstName = "Test"
    lastName = "User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/register" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"
```

**Login:**
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"

$token = $response.data.accessToken
```

**Get Profile:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/me" `
    -Method Get `
    -Headers @{ Authorization = "Bearer $token" }
```


---

## Disaster Alert Endpoints

### 1. Get All Alerts
**GET** `/alerts`

**Query Parameters:**
- `type` - Filter by alert type (typhoon, earthquake, flood, etc.)
- `severity` - Filter by severity (low, moderate, high, critical)
- `is_active` - Filter by active status (default: true)
- `lat` - User latitude for location-based filtering
- `lng` - User longitude for location-based filtering
- `radius` - Search radius in km (default: 50)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "alerts": [
      {
        "id": 1,
        "alert_type": "typhoon",
        "severity": "critical",
        "title": "Typhoon Odette approaching",
        "description": "Strong typhoon expected to make landfall...",
        "source": "PAGASA",
        "affected_areas": ["Cebu", "Bohol", "Leyte"],
        "latitude": 10.3157,
        "longitude": 123.8854,
        "radius_km": 100,
        "start_time": "2024-01-15T08:00:00Z",
        "end_time": "2024-01-16T20:00:00Z",
        "is_active": true,
        "metadata": {
          "wind_speed": 185,
          "signal_number": 4
        },
        "created_at": "2024-01-14T10:00:00Z",
        "updated_at": "2024-01-14T10:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

### 2. Get Alert by ID
**GET** `/alerts/:id`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "alert_type": "typhoon",
    "severity": "critical",
    "title": "Typhoon Odette approaching",
    "description": "Strong typhoon expected to make landfall...",
    "source": "PAGASA",
    "affected_areas": ["Cebu", "Bohol", "Leyte"],
    "latitude": 10.3157,
    "longitude": 123.8854,
    "radius_km": 100,
    "start_time": "2024-01-15T08:00:00Z",
    "end_time": "2024-01-16T20:00:00Z",
    "is_active": true,
    "metadata": {
      "wind_speed": 185,
      "signal_number": 4
    },
    "created_at": "2024-01-14T10:00:00Z",
    "updated_at": "2024-01-14T10:00:00Z"
  }
}
```

### 3. Search Alerts
**GET** `/alerts/search`

**Query Parameters:**
- `q` - Search query (required)
- `start_date` - Filter by start date
- `end_date` - Filter by end date

**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "alert_type": "typhoon",
      "severity": "critical",
      "title": "Typhoon Odette approaching",
      "description": "Strong typhoon expected to make landfall..."
    }
  ]
}
```

### 4. Create Alert (Admin)
**POST** `/alerts`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "alert_type": "typhoon",
  "severity": "critical",
  "title": "Typhoon Odette approaching",
  "description": "Strong typhoon expected to make landfall in Visayas region...",
  "source": "PAGASA",
  "affected_areas": ["Cebu", "Bohol", "Leyte"],
  "latitude": 10.3157,
  "longitude": 123.8854,
  "radius_km": 100,
  "start_time": "2024-01-15T08:00:00Z",
  "end_time": "2024-01-16T20:00:00Z",
  "metadata": {
    "wind_speed": 185,
    "signal_number": 4
  }
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "alert_type": "typhoon",
    "severity": "critical",
    "title": "Typhoon Odette approaching",
    "description": "Strong typhoon expected to make landfall...",
    "source": "PAGASA",
    "affected_areas": ["Cebu", "Bohol", "Leyte"],
    "is_active": true,
    "created_at": "2024-01-14T10:00:00Z"
  }
}
```

### 5. Update Alert (Admin)
**PUT** `/alerts/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:** (Same as Create Alert, all fields optional)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "alert_type": "typhoon",
    "severity": "critical",
    "title": "Typhoon Odette approaching - UPDATED",
    "updated_at": "2024-01-14T12:00:00Z"
  }
}
```

### 6. Deactivate Alert (Admin)
**DELETE** `/alerts/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Alert deactivated successfully"
}
```

### 7. Broadcast Alert (Admin)
**POST** `/alerts/:id/broadcast`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "total_recipients": 1500,
    "push_sent": 1200,
    "push_failed": 50,
    "sms_sent": 250,
    "sms_failed": 0
  }
}
```

### 8. Get Alert Statistics (Admin)
**GET** `/alerts/:id/statistics`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "total_notifications": 1450,
    "push_count": 1200,
    "sms_count": 250,
    "successful": 1450,
    "failed": 0
  }
}
```

### 9. Deactivate Expired Alerts (Admin)
**POST** `/alerts/deactivate-expired`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "status": "success",
  "message": "5 expired alerts deactivated",
  "data": {
    "count": 5
  }
}
```

---

## Evacuation Center Endpoints

### 1. Get All Centers
**GET** `/evacuation-centers`

**Query Parameters:**
- `city` - Filter by city
- `province` - Filter by province
- `barangay` - Filter by barangay
- `is_active` - Filter by active status (default: true)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "centers": [
      {
        "id": 1,
        "name": "Cebu City Sports Center",
        "address": "M.J. Cuenco Ave, Cebu City",
        "city": "Cebu City",
        "province": "Cebu",
        "barangay": "Mabolo",
        "latitude": 10.3157,
        "longitude": 123.8854,
        "capacity": 5000,
        "current_occupancy": 1200,
        "occupancy_percentage": 24,
        "is_full": false,
        "contact_person": "Juan Dela Cruz",
        "contact_number": "09123456789",
        "facilities": ["medical", "food", "water", "restrooms", "power"],
        "is_active": true,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-14T10:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

### 2. Find Nearby Centers
**GET** `/evacuation-centers/nearby`

**Query Parameters:**
- `lat` - User latitude (required)
- `lng` - User longitude (required)
- `radius` - Search radius in km (default: 50)

**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Cebu City Sports Center",
      "address": "M.J. Cuenco Ave, Cebu City",
      "city": "Cebu City",
      "province": "Cebu",
      "latitude": 10.3157,
      "longitude": 123.8854,
      "distance": 2.5,
      "capacity": 5000,
      "current_occupancy": 1200,
      "occupancy_percentage": 24,
      "is_full": false,
      "facilities": ["medical", "food", "water", "restrooms", "power"]
    }
  ]
}
```

### 3. Search Centers
**GET** `/evacuation-centers/search`

**Query Parameters:**
- `q` - Search query (required)
- `city` - Filter by city
- `province` - Filter by province

**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Cebu City Sports Center",
      "address": "M.J. Cuenco Ave, Cebu City",
      "city": "Cebu City",
      "province": "Cebu"
    }
  ]
}
```

### 4. Get Center by ID
**GET** `/evacuation-centers/:id`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Cebu City Sports Center",
    "address": "M.J. Cuenco Ave, Cebu City",
    "city": "Cebu City",
    "province": "Cebu",
    "barangay": "Mabolo",
    "latitude": 10.3157,
    "longitude": 123.8854,
    "capacity": 5000,
    "current_occupancy": 1200,
    "occupancy_percentage": 24,
    "is_full": false,
    "contact_person": "Juan Dela Cruz",
    "contact_number": "09123456789",
    "facilities": ["medical", "food", "water", "restrooms", "power"],
    "is_active": true
  }
}
```

### 5. Create Center (Admin)
**POST** `/evacuation-centers`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "Cebu City Sports Center",
  "address": "M.J. Cuenco Ave, Cebu City",
  "city": "Cebu City",
  "province": "Cebu",
  "barangay": "Mabolo",
  "latitude": 10.3157,
  "longitude": 123.8854,
  "capacity": 5000,
  "contact_person": "Juan Dela Cruz",
  "contact_number": "09123456789",
  "facilities": ["medical", "food", "water", "restrooms", "power"]
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Cebu City Sports Center",
    "capacity": 5000,
    "current_occupancy": 0,
    "is_active": true
  }
}
```

### 6. Update Center (Admin)
**PUT** `/evacuation-centers/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:** (Same as Create Center, all fields optional)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Cebu City Sports Center - UPDATED",
    "updated_at": "2024-01-14T12:00:00Z"
  }
}
```

### 7. Update Occupancy (Admin)
**PATCH** `/evacuation-centers/:id/occupancy`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "occupancy": 1500
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "current_occupancy": 1500,
    "capacity": 5000,
    "occupancy_percentage": 30,
    "is_full": false
  }
}
```

### 8. Deactivate Center (Admin)
**DELETE** `/evacuation-centers/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Evacuation center deactivated successfully"
}
```

### 9. Get Statistics (Admin)
**GET** `/evacuation-centers/admin/statistics`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `province` - Filter by province (optional)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "total_centers": 50,
    "total_capacity": 250000,
    "total_occupancy": 45000,
    "average_occupancy_percentage": 18,
    "centers_at_capacity": 3,
    "by_province": [
      {
        "province": "Cebu",
        "count": 20,
        "capacity": 100000,
        "occupancy": 18000
      }
    ]
  }
}
```

---

## Emergency Contact Endpoints

### 1. Get All Contacts (Grouped by Category)
**GET** `/emergency-contacts`

**Query Parameters:**
- `category` - Filter by category
- `city` - Filter by city (includes national contacts)
- `province` - Filter by province (includes national contacts)
- `is_national` - Filter by national status
- `is_active` - Filter by active status (default: true)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "Police": [
      {
        "id": 1,
        "category": "Police",
        "name": "Philippine National Police",
        "phone": "09171234567",
        "alternate_phone": "09181234567",
        "email": "pnp@example.com",
        "address": "Camp Crame, Quezon City",
        "is_national": true,
        "display_order": 0
      }
    ],
    "Fire": [
      {
        "id": 2,
        "category": "Fire",
        "name": "Bureau of Fire Protection",
        "phone": "09171234568",
        "is_national": true,
        "display_order": 0
      }
    ]
  }
}
```

### 2. Get Contacts by Category
**GET** `/emergency-contacts/category/:category`

**Query Parameters:**
- `city` - Filter by city (includes national contacts)
- `province` - Filter by province (includes national contacts)

**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "category": "Police",
      "name": "Philippine National Police",
      "phone": "09171234567",
      "alternate_phone": "09181234567",
      "is_national": true
    }
  ]
}
```

### 3. Search Contacts
**GET** `/emergency-contacts/search`

**Query Parameters:**
- `q` - Search query (required)
- `category` - Filter by category
- `city` - Filter by city
- `province` - Filter by province

**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "category": "Police",
      "name": "Philippine National Police",
      "phone": "09171234567"
    }
  ]
}
```

### 4. Get All Categories
**GET** `/emergency-contacts/categories`

**Response (200):**
```json
{
  "status": "success",
  "data": ["Police", "Fire", "Medical", "Disaster Response", "Coast Guard"]
}
```

### 5. Get Contact by ID
**GET** `/emergency-contacts/:id`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "category": "Police",
    "name": "Philippine National Police",
    "phone": "09171234567",
    "alternate_phone": "09181234567",
    "email": "pnp@example.com",
    "address": "Camp Crame, Quezon City",
    "is_national": true,
    "is_active": true,
    "display_order": 0
  }
}
```

### 6. Create Contact (Admin)
**POST** `/emergency-contacts`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "category": "Police",
  "name": "Philippine National Police",
  "phone": "09171234567",
  "alternate_phone": "09181234567",
  "email": "pnp@example.com",
  "address": "Camp Crame, Quezon City",
  "is_national": true,
  "display_order": 0
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "category": "Police",
    "name": "Philippine National Police",
    "phone": "09171234567",
    "is_national": true,
    "is_active": true
  }
}
```

### 7. Update Contact (Admin)
**PUT** `/emergency-contacts/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:** (Same as Create Contact, all fields optional)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "category": "Police",
    "name": "Philippine National Police - UPDATED",
    "updated_at": "2024-01-14T12:00:00Z"
  }
}
```

### 8. Deactivate Contact (Admin)
**DELETE** `/emergency-contacts/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Emergency contact deactivated successfully"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Invalid input data",
  "errors": ["Field 'email' is required"]
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "status": "error",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Pagination is available on list endpoints with `page` and `limit` parameters
- Cache-Control headers are set for offline support on public endpoints
- Admin endpoints require authentication and appropriate role (admin or lgu_officer)
- Phone numbers must be in Philippine format: 09XXXXXXXXX or +639XXXXXXXXX
- Coordinates must be valid: latitude (-90 to 90), longitude (-180 to 180)
