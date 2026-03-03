# SMS Blast API Implementation

## Overview

This document describes the implementation of the POST /api/sms-blast endpoint for creating and sending SMS blast emergency alerts.

## Implementation Status

✅ **Task 16.1 Complete**: POST /api/sms-blast endpoint implemented

## Files Created/Modified

### New Files
1. **src/controllers/smsBlast.controller.ts** - SMS Blast controller with createSMSBlast method
2. **src/routes/smsBlast.routes.ts** - SMS Blast routes with authentication and rate limiting
3. **src/controllers/__tests__/smsBlast.controller.test.ts** - Unit tests for the controller
4. **test-sms-blast-endpoint.ps1** - Manual testing script

### Modified Files
1. **src/routes/index.ts** - Added SMS blast routes registration

## API Endpoint

### POST /api/sms-blast

Creates and sends an SMS blast to filtered recipients.

**Authentication**: Required (JWT token)
**Authorization**: Admin or Superadmin only
**Rate Limit**: 20 requests per 15 minutes

#### Request Body

```json
{
  "message": "Emergency alert message text",
  "templateId": "optional-template-uuid",
  "templateVariables": {
    "location": "Metro Manila",
    "severity": "High"
  },
  "recipientFilters": {
    "provinces": ["Metro Manila"],
    "cities": ["Manila", "Quezon City"],
    "barangays": ["Barangay 1"],
    "contactGroupIds": ["group-uuid"]
  },
  "scheduledTime": "2024-12-31T23:59:59.000Z",
  "language": "en",
  "priority": "normal"
}
```

#### Request Parameters

- **message** (string, optional): Direct message text. Required if templateId not provided.
- **templateId** (string, optional): UUID of SMS template to use. Required if message not provided.
- **templateVariables** (object, optional): Variables to replace in template.
- **recipientFilters** (object, required): Filters to select recipients.
  - **provinces** (string[], optional): Filter by provinces.
  - **cities** (string[], optional): Filter by cities.
  - **barangays** (string[], optional): Filter by barangays.
  - **contactGroupIds** (string[], optional): Filter by contact groups.
- **scheduledTime** (string, optional): ISO 8601 datetime for scheduled delivery.
- **language** (string, required): Message language - "en" or "fil".
- **priority** (string, optional): Message priority - "critical", "high", or "normal". Default: "normal".

#### Response (201 Created)

```json
{
  "status": "success",
  "data": {
    "blastId": "uuid-of-blast",
    "recipientCount": 150,
    "estimatedCost": 150,
    "creditsPerMessage": 1,
    "status": "queued",
    "scheduledTime": null,
    "message": {
      "content": "Final message content with variables replaced",
      "characterCount": 45,
      "smsPartCount": 1,
      "encoding": "GSM-7",
      "language": "en"
    }
  }
}
```

#### Error Responses

**400 Bad Request** - Validation errors
```json
{
  "status": "error",
  "message": "Either message or templateId must be provided"
}
```

**401 Unauthorized** - Authentication required
```json
{
  "status": "error",
  "message": "Authentication required"
}
```

**402 Payment Required** - Insufficient credits
```json
{
  "status": "error",
  "message": "Insufficient credits. Required: 150, Available: 100"
}
```

**403 Forbidden** - Authorization or spending limit errors
```json
{
  "status": "error",
  "message": "Daily spending limit would be exceeded. Limit: 10000, Current spend: 9900, Remaining: 100"
}
```

**429 Too Many Requests** - Rate limit exceeded
```json
{
  "status": "error",
  "message": "Rate limit exceeded. You can send 5000 SMS per hour. Already sent: 4999, Attempting: 2"
}
```

## Implementation Details

### Requirements Implemented

- **Requirement 1.1**: SMS message composition with templates and direct text
- **Requirement 2.1, 2.2**: Recipient selection and targeting with location filters
- **Requirement 7.1, 7.2**: Scheduling and immediate delivery
- **Requirement 8.1**: Create SMS blast record in database
- **Requirement 8.2**: Return blast ID, recipient count, estimated cost
- **Requirement 8.3**: Create confirmation record before processing
- **Requirement 8.5**: Insufficient credits prevention
- **Requirement 8.6**: Rate limiting enforcement (5000 SMS per hour)
- **Requirement 14.1**: Spending limit enforcement

### Validation Steps

The endpoint performs the following validations in order:

1. **Request Validation**
   - Validates message or templateId is provided
   - Validates recipient filters are provided
   - Validates language is "en" or "fil"
   - Validates scheduled time is in the future (if provided)

2. **Recipient Filtering**
   - Applies location filters (provinces, cities, barangays)
   - Enforces jurisdiction restrictions for Admin users
   - Filters only active users with valid phone numbers
   - Validates at least one recipient matches

3. **Message Composition**
   - Composes from template with variable replacement (if templateId provided)
   - Composes from direct text (if message provided)
   - Validates message content
   - Calculates character count and SMS parts

4. **Cost Estimation**
   - Calculates total credits required
   - Checks available credit balance
   - Validates against daily spending limits
   - Allows Superadmin to override spending limits

5. **Rate Limiting**
   - Checks SMS sent in last hour
   - Enforces 5000 SMS per hour limit per user

6. **Database Operations**
   - Creates SMS blast record
   - Creates SMS usage record
   - Enqueues jobs for each recipient
   - Logs to audit logs

### Security Features

1. **Authentication**: JWT token required
2. **Authorization**: Only Admin and Superadmin roles allowed
3. **Jurisdiction Enforcement**: Admin users restricted to their assigned locations
4. **Rate Limiting**: 20 API requests per 15 minutes, 5000 SMS per hour
5. **Spending Limits**: Daily spending limit enforcement
6. **Audit Logging**: All blast creation logged with user ID and details

### Database Transactions

The endpoint uses database transactions to ensure data consistency:
- Begins transaction before any database operations
- Commits transaction only if all operations succeed
- Rolls back transaction on any error
- Releases connection in finally block

### Queue Integration

Messages are enqueued using BullMQ:
- **Immediate delivery**: Jobs added to queue immediately
- **Scheduled delivery**: Jobs scheduled for future execution
- **Priority queues**: Separate queues for critical, high, and normal priority
- **Batch processing**: Queue workers process messages in batches of 100

## Testing

### Manual Testing

Use the provided PowerShell script:

```powershell
# Set your JWT token
$env:TEST_TOKEN = "your-jwt-token-here"

# Run tests
.\test-sms-blast-endpoint.ps1
```

### Unit Testing

Run the unit tests:

```bash
npm test -- smsBlast.controller.test.ts
```

### Integration Testing

1. Start the backend server
2. Ensure database is running and migrated
3. Ensure Redis is running for queue
4. Use Postman or curl to test the endpoint

Example curl command:

```bash
curl -X POST http://localhost:3001/api/sms-blast \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Test emergency alert",
    "recipientFilters": {
      "provinces": ["Metro Manila"]
    },
    "language": "en"
  }'
```

## Dependencies

The endpoint relies on the following services (already implemented):

- **RecipientFilter**: Filters and retrieves recipients based on location
- **MessageComposer**: Composes messages from templates or direct text
- **CostEstimator**: Calculates SMS costs and checks spending limits
- **SMSQueue**: Manages message queue with BullMQ
- **IProgAPIClient**: Integrates with iProg SMS API for balance checking
- **AuditLogger**: Logs all SMS blast activities

## Next Steps

The following endpoints still need to be implemented (Task 17):

- GET /api/sms-blast/:blastId - Get blast status
- GET /api/sms-blast/credits/balance - Get credit balance
- GET /api/sms-blast/history - Get blast history
- POST /api/sms-blast/templates - Create template
- GET /api/sms-blast/templates - List templates
- POST /api/sms-blast/contact-groups - Create contact group
- GET /api/sms-blast/audit-logs/export - Export audit logs

## Notes

- The endpoint is fully functional and ready for testing
- All requirements for Task 16.1 have been implemented
- TypeScript compilation is successful with no errors
- Database schema is already created via migration 008
- Queue workers need to be started separately to process jobs

