# Notification Bell Timezone Display Explanation

## Current Behavior

The notification bells (SOS and Incident) display times using `date-fns` format function:

```typescript
format(new Date(alert.created_at), 'h:mm a')
```

## How It Works

1. **Backend returns:** `"2026-03-21T00:19:25.000Z"` (PH time stored as ISO string with Z suffix)
2. **JavaScript interprets:** The `Z` suffix means UTC, so `new Date()` creates a Date object in UTC
3. **date-fns formats:** Converts the UTC time to the browser's local timezone and formats it

## Example Flow

**Scenario:** SOS created at 12:19 AM Philippine Time (March 21, 2026)

### Backend (After Fix)
- Database stores: `2026-03-20 16:19:25` (UTC)
- API returns: `"2026-03-21T00:19:25.000Z"` (PH time with +8 hours)

### Frontend Display

**If browser is in Philippine timezone (UTC+8):**
- `new Date("2026-03-21T00:19:25.000Z")` → Interprets as UTC
- Browser converts UTC to local (PH) → 12:19 AM + 8 hours = 8:19 AM ❌ WRONG!

**Wait, that's not right...**

Actually, let me recalculate:

**If browser is in Philippine timezone (UTC+8):**
- Backend returns: `"2026-03-21T00:19:25.000Z"` (This is 00:19 UTC on March 21)
- Browser interprets as UTC and converts to PH time: 00:19 UTC + 8 hours = 8:19 AM PH time
- But we wanted to show: 12:19 AM PH time

## The Problem

The backend is adding 8 hours to the UTC time and returning it with a `Z` suffix, which tells the browser "this is UTC time". So the browser adds another 8 hours!

**Result:** Time is displayed 8 hours ahead of what it should be (for PH timezone browsers).

## The Solution

We have two options:

### Option 1: Remove the Z suffix (Recommended)
Change the backend to return the time without the `Z` suffix, so the browser treats it as local time:
- Return: `"2026-03-21T00:19:25"` (no Z)
- Browser interprets as local time: 12:19 AM ✅ CORRECT!

### Option 2: Don't add 8 hours in backend
Keep the backend returning UTC time, and let the browser handle the timezone conversion:
- Backend returns: `"2026-03-20T16:19:25.000Z"` (UTC)
- Browser converts to PH time: 16:19 UTC + 8 hours = 12:19 AM next day ✅ CORRECT!

## Recommendation

**Use Option 2** - Let the browser handle timezone conversion:

1. **Backend:** Return UTC time as-is (don't add 8 hours)
2. **Frontend:** Browser automatically converts to user's local timezone
3. **Benefit:** Works correctly for users in any timezone

This is the standard approach for web applications.

## Current Status

The backend has been modified to add 8 hours (PH timezone offset) to all timestamps. This works correctly for:
- ✅ Detail pages (where we format with full date/time)
- ❌ Notification bells (where browser adds another 8 hours)

## Action Required

**Revert the timezone conversion in the backend** and let the browser handle it naturally. The ISO 8601 format with `Z` suffix is designed for this purpose.

---

**Note:** The detail pages will still show correct times because they use the full date format, which makes the timezone conversion more obvious. The notification bells show only the time (h:mm a), which makes the double-conversion issue more apparent.
