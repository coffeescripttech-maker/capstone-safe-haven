# SMS Blast Recipient Phone Numbers Display - Complete

## Summary
Added functionality to display actual recipient phone numbers in both the SMS blast send page (for verification before sending) and the blast detail page (to see who received the SMS successfully). Also added recipient filters display to show which provinces/cities/barangays were targeted.

## Changes Made

### 1. Database Migration
**File**: `MOBILE_APP/database/migrations/013_add_recipient_filters_to_sms_blasts.sql`

**Changes**:
- Added `recipient_filters` JSON column to `sms_blasts` table
- Stores the filters used for each blast (provinces, cities, barangays, contact groups)
- Applied successfully using migration script

### 2. Backend - Create SMS Blast
**File**: `MOBILE_APP/backend/src/controllers/smsBlast.controller.ts`

**Changes in `createSMSBlast()`**:
- Now stores `recipient_filters` as JSON when creating blast
- Filters include: provinces, cities, barangays, contactGroupIds
- Stored for audit trail and display purposes

### 3. Backend - Estimate Recipients Endpoint
**File**: `MOBILE_APP/backend/src/controllers/smsBlast.controller.ts`

**Changes in `estimateRecipients()`**:
- Modified to return full recipient list instead of just count
- Changed from `recipientFilter.countRecipients()` to `recipientFilter.getRecipients()`
- Added `recipients` array to response with name and phone number for each recipient
- Response now includes:
  ```json
  {
    "recipientCount": 2,
    "recipients": [
      { "name": "John Doe", "phone": "+639123456789" },
      { "name": "Jane Smith", "phone": "+639987654321" }
    ],
    "estimatedCost": 2,
    "smsPartCount": 1,
    "characterCount": 45
  }
  ```

### 4. Backend - Blast Details Endpoint
**File**: `MOBILE_APP/backend/src/controllers/smsBlast.controller.ts`

**Changes in `getSMSBlastStatus()`**:
- Modified to include recipient list with delivery status
- Added query to fetch recipients from `sms_jobs` table with user information
- Added retrieval and parsing of `recipient_filters` from database
- Response now includes:
  - `recipientFilters` object with provinces, cities, barangays arrays
  - `recipients` array with:
    - Name
    - Phone number
    - Status (queued, processing, sent, delivered, failed)
    - Sent timestamp
    - Delivered timestamp
    - Error message (if failed)

### 5. Frontend - SMS Blast Send Page
**File**: `MOBILE_APP/web_app/src/app/(admin)/sms-blast/send/page.tsx`

**Changes**:
- Added `recipientDetails` state to store array of {name, phone}
- Updated `estimateRecipients()` to extract recipients from API response
- Added new UI section below "Estimated Recipients" card
- Displays scrollable list of recipients with:
  - Name on the left
  - Phone number on the right (in monospace font)
  - Max height of 64 (256px) with scroll
  - Clean card design with borders

**UI Features**:
- Shows "Recipients List (X)" header with count
- Each recipient in a white card with border
- Scrollable if more than ~8 recipients
- Phone numbers in monospace font for easy reading
- Only shows when recipients are available

### 6. Frontend - SMS Blast Detail Page
**File**: `MOBILE_APP/web_app/src/app/(admin)/sms-blast/[id]/page.tsx`

**Changes**:
- Added `recipients` array to `BlastDetails` interface
- Added `recipientFilter` state for filtering by status
- Updated to display recipient filters (provinces, cities, barangays)
- Added new "Recipients" section with:
  - Filter tabs: All, Delivered, Sent, Failed (with counts)
  - Sortable table with columns: Name, Phone Number, Status, Time
  - Status badges with color coding:
    - Green for delivered
    - Blue for sent
    - Red for failed
    - Gray for pending
  - Scrollable table (max height 96 = 384px)
  - Sticky header

**UI Features**:
- Recipient Filters section now shows provinces/cities/barangays used
- Filter tabs show count for each status
- Active filter highlighted with color
- Table shows delivery timestamp or sent timestamp
- Hover effect on table rows
- Responsive design

## Testing

### Test Send Page
1. Go to http://localhost:3000/sms-blast/send
2. Select Province: "Pangasinan"
3. Enter a message
4. Check "Estimated Recipients" section
5. Should see "Recipients List (X)" below with names and phone numbers

### Test Detail Page
1. Send an SMS blast
2. Go to http://localhost:3000/sms-blast/[blast-id]
3. Check "Recipient Filters" section - should show provinces selected
4. Scroll down to "Recipients" section
5. Should see table with all recipients
6. Click filter tabs to filter by status
7. Verify phone numbers and delivery status are shown

## Database Schema Changes

### sms_blasts table
Added column:
- `recipient_filters` JSON - Stores the filters used (provinces, cities, barangays, contactGroupIds)

### Tables Used

#### sms_jobs
- Stores individual SMS job records
- Fields: phone_number, status, sent_at, delivered_at, error_message
- Linked to users table via recipient_id

#### users
- Provides recipient names (first_name, last_name)
- Linked via recipient_id in sms_jobs

## API Endpoints Updated

### POST /api/sms-blast
**Request**: Now stores recipient_filters in database
```json
{
  "recipientFilters": {
    "provinces": ["Pangasinan"],
    "cities": [],
    "barangays": []
  },
  "message": "Emergency alert..."
}
```

### POST /api/sms-blast/estimate
**Response**:
```json
{
  "status": "success",
  "data": {
    "recipientCount": 2,
    "recipients": [
      { "name": "John Doe", "phone": "+639123456789" },
      { "name": "Jane Smith", "phone": "+639987654321" }
    ],
    "estimatedCost": 2,
    "smsPartCount": 1,
    "characterCount": 45
  }
}
```

### GET /api/sms-blast/:blastId
**Response**:
```json
{
  "status": "success",
  "data": {
    "blastId": "...",
    "message": "...",
    "recipientFilters": {
      "provinces": ["Pangasinan"],
      "cities": [],
      "barangays": []
    },
    "recipientCount": 2,
    "deliveryStatistics": { ... },
    "recipients": [
      {
        "name": "John Doe",
        "phone": "+639123456789",
        "status": "delivered",
        "sentAt": "2026-03-12T07:30:00Z",
        "deliveredAt": "2026-03-12T07:30:05Z",
        "error": null
      }
    ]
  }
}
```

## Benefits

1. **Verification Before Sending**: Users can verify exactly who will receive the SMS before sending
2. **Delivery Tracking**: Users can see which specific phone numbers received the SMS successfully
3. **Error Debugging**: Failed deliveries show error messages for troubleshooting
4. **Audit Trail**: Complete record of who received each SMS blast and what filters were used
5. **Transparency**: Clear visibility into SMS delivery status per recipient
6. **Filter Display**: Shows which provinces/cities/barangays were targeted for each blast

## Files Created/Modified

### Created:
- `MOBILE_APP/database/migrations/013_add_recipient_filters_to_sms_blasts.sql`
- `MOBILE_APP/backend/apply-recipient-filters-migration.js`
- `MOBILE_APP/database/apply-recipient-filters-migration.js`

### Modified:
- `MOBILE_APP/backend/src/controllers/smsBlast.controller.ts`
- `MOBILE_APP/web_app/src/app/(admin)/sms-blast/send/page.tsx`
- `MOBILE_APP/web_app/src/app/(admin)/sms-blast/[id]/page.tsx`

## Status
✅ Complete - Database migrated, backend compiled successfully, ready for testing

## Next Steps
1. Test sending a new SMS blast to verify recipient_filters are stored
2. Check detail page shows recipient filters correctly
3. Verify recipient phone numbers display on both send and detail pages
