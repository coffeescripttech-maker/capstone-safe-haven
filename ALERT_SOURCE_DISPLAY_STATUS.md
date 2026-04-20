# Alert Source Display Status

## Current Implementation Status

### ✅ Mobile App - Alert Card Component
**File**: `MOBILE_APP/mobile/src/components/alerts/AlertCard.tsx`

The AlertCard component HAS the source badge implementation:
- Lines 51-75: `getSourceBadge()` function with full mapping
- Line 119-121: Source badge is rendered in the footer section
- Handles automated sources (auto_weather, auto_earthquake)
- Handles official agencies (PAGASA, PHIVOLCS, NDRRMC, LGU)
- Shows "Manual" badge for empty/null/N/A sources

### ✅ Mobile App - Alert Details Screen
**File**: `MOBILE_APP/mobile/src/screens/alerts/AlertDetailsScreen.tsx`

The details screen displays source:
- Lines 234-240: Source section with information icon
- Displays `alert.source` or 'Unknown source'

### ✅ Mobile App - Data Transformation
**File**: `MOBILE_APP/mobile/src/services/alerts.ts`

The transform function maps the source field:
- Line 38: `source: alert.source && alert.source.trim() !== '' ? alert.source : 'Unknown'`

### ✅ Web Portal - Alert List
**File**: `MOBILE_APP/web_app/src/app/(admin)/emergency-alerts/page.tsx`

The web list HAS source column:
- Lines 155-177: `getSourceBadge()` function
- Line 398: Source column in table header
- Lines 467-469: Source badge rendered in table cell

### ❌ Web Portal - Alert Details
**File**: `MOBILE_APP/web_app/src/app/(admin)/emergency-alerts/[id]/page.tsx`

The web details page is MISSING the source field display.

### ✅ Database Schema
**File**: `MOBILE_APP/database/schema.sql`

The source column exists:
- Line 47: `source VARCHAR(100) NOT NULL`
- Column is marked as NOT NULL, so all alerts must have a source

## Issue Analysis

The code implementation is complete on mobile, but you're not seeing it. Possible reasons:

1. **Database has NULL or empty source values** - Even though schema says NOT NULL, existing data might have empty strings
2. **Backend not returning source field** - Check if API response includes source
3. **App needs rebuild** - Changes to AlertCard might not be reflected in running app
4. **Data issue** - Alerts in database might have source = '' (empty string) which shows as "Manual"

## Recommended Actions

1. Check actual database data:
   ```sql
   SELECT id, title, source FROM disaster_alerts LIMIT 10;
   ```

2. Check API response in mobile app console logs

3. Rebuild mobile app to ensure latest AlertCard code is used

4. Add source field to web portal alert details page

5. Update existing alerts to have proper source values if they're empty
