# SMS Blast API Fixes - Complete

## Issues Fixed

### 1. API Path Issues (404 Errors)
**Problem:** Duplicate `/api` in URL paths causing 404 errors
- URLs were: `http://localhost:3001/api/v1/api/sms-blast/*`
- Should be: `http://localhost:3001/api/v1/sms-blast/*`

**Root Cause:** `NEXT_PUBLIC_API_URL` already includes `/api/v1`, but the API client was adding `/api` again

**Fix:** Removed `/api` prefix from all endpoints in `web_app/src/lib/sms-blast-api.ts`

**Files Changed:**
- `MOBILE_APP/web_app/src/lib/sms-blast-api.ts` - Removed `/api` from all endpoint paths

---

### 2. Authentication Issues (401 Errors)
**Problem:** Token not being sent with requests

**Root Cause:** API client was looking for `token` in localStorage, but the app stores it as `safehaven_token`

**Fix:** Updated token retrieval to use correct key

**Files Changed:**
- `MOBILE_APP/web_app/src/lib/sms-blast-api.ts` - Changed `localStorage.getItem('token')` to `localStorage.getItem('safehaven_token')`

---

### 3. Database Schema Issues (500 Errors)
**Problem:** SQL queries using `u.name` but users table has `first_name` and `last_name`

**Root Cause:** Queries were written for a `name` column that doesn't exist in the users table

**Fix:** Updated all SQL queries to use `CONCAT(u.first_name, ' ', u.last_name) as user_name`

**Files Changed:**
- `MOBILE_APP/backend/src/controllers/smsBlast.controller.ts`
  - Line ~491: Updated getSMSBlastHistory query
  
- `MOBILE_APP/backend/src/services/dashboardReporting.service.ts`
  - Line ~148: Updated getDashboardStatistics query (recent blasts)
  - Line ~369: Updated getFilteredDashboard query
  - Line ~627: Updated getCreditUsageReport query with GROUP BY fix

---

### 4. Missing GET Contact Groups Route (404 Error)
**Problem:** No GET endpoint for listing contact groups

**Root Cause:** Only POST route was implemented, GET route was missing

**Fix:** Added GET route and controller method

**Files Changed:**
- `MOBILE_APP/backend/src/routes/smsBlast.routes.ts`
  - Added GET `/contact-groups` route
  
- `MOBILE_APP/backend/src/controllers/smsBlast.controller.ts`
  - Added `listContactGroups()` method

---

## Testing

### Verify Fixes

1. **Check API Paths:**
```bash
# Should return 200 (not 404)
curl http://localhost:3001/api/v1/sms-blast/templates \
  -H "Authorization: Bearer YOUR_TOKEN"
```

2. **Check Authentication:**
```bash
# Login and get token
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@safehaven.ph","password":"Admin123!"}'

# Use token in SMS blast requests
curl http://localhost:3001/api/v1/sms-blast/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

3. **Check Database Queries:**
```bash
# Should return 200 with user names (not 500)
curl http://localhost:3001/api/v1/sms-blast/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

4. **Check Contact Groups:**
```bash
# Should return 200 with empty array (not 404)
curl http://localhost:3001/api/v1/sms-blast/contact-groups \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Web App Testing

1. Login to web app as superadmin:
   - Email: `superadmin@safehaven.ph`
   - Password: `Admin123!`

2. Navigate to SMS Blast page:
   - Should see "SMS Blast" in sidebar
   - Click to open SMS Blast dashboard

3. Verify data loads:
   - SMS history should load (no 404/500 errors)
   - Templates should load
   - Contact groups should load
   - Credit balance should load

---

## Summary

All API path, authentication, and database schema issues have been resolved. The SMS Blast feature should now work correctly in the web interface.

**Status:** ✅ Complete

**Next Steps:**
- Test sending actual SMS blasts
- Verify template creation
- Test contact group management
- Monitor credit balance updates
