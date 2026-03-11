# Emergency Contacts List Refresh Fix

## Issue
When updating an emergency contact and returning to the list page, the changes didn't reflect immediately. The list was showing stale/cached data.

## Root Cause
- The list page's `useEffect` only ran when `categoryFilter` changed
- Navigating back from edit page didn't trigger a refetch because the filter hadn't changed
- Client-side navigation (`router.push`) doesn't cause a full page reload

## Solution Implemented

### 1. Edit Page Enhancement
**File**: `MOBILE_APP/web_app/src/app/(admin)/emergency-contacts/[id]/edit/page.tsx`

Added `router.refresh()` after successful update:
```typescript
await emergencyContactsApi.update(id, formData);
toast.success('Contact updated successfully');
router.push('/emergency-contacts');
router.refresh(); // Force refresh to clear cache
```

### 2. List Page Enhancement
**File**: `MOBILE_APP/web_app/src/app/(admin)/emergency-contacts/page.tsx`

Added visibility change and focus listeners to automatically refetch:
```typescript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      loadContacts(true); // Silent refresh
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', () => loadContacts(true));

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('focus', () => loadContacts(true));
  };
}, []);
```

## How It Works

1. **Visibility API**: Detects when the page becomes visible again (e.g., switching tabs, navigating back)
2. **Focus Event**: Detects when the window gains focus
3. **Silent Refresh**: Uses `loadContacts(true)` to refresh without showing loading spinner
4. **Router Refresh**: Forces Next.js to invalidate cache and refetch data

## Benefits

- ✅ List automatically refreshes when returning from edit page
- ✅ List refreshes when switching browser tabs back to the page
- ✅ List refreshes when clicking back into the browser window
- ✅ No loading spinner during automatic refreshes (better UX)
- ✅ Manual refresh button still available for user control

## Testing

1. Open emergency contacts list
2. Click edit on any contact
3. Make changes and save
4. Verify list shows updated data immediately
5. Try switching tabs and coming back - list should refresh
6. Try clicking into another window and back - list should refresh

## Status
✅ Complete - List now refreshes automatically after updates
