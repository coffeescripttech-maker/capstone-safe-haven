# Quick Test Guide - Phase 2 Features

## Prerequisites

1. **Database Setup**
```bash
mysql -u root -p safehaven_db < database/schema.sql
```

2. **Environment Variables**
Copy `.env.example` to `.env` and configure:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=safehaven_db
JWT_SECRET=your_secret
```

3. **Start Server**
```bash
cd backend
npm install
npm run dev
```

Server should start on `http://localhost:3000`

---

## Quick Test Commands (PowerShell)

### 1. Health Check
```powershell
curl http://localhost:3000/health
```

### 2. Register Admin User
```powershell
$body = @{
    email = "admin@safehaven.com"
    phone = "09123456789"
    password = "Admin123!"
    firstName = "Admin"
    lastName = "User"
} | ConvertTo-Json

curl -Method POST -Uri "http://localhost:3000/api/v1/auth/register" `
     -ContentType "application/json" `
     -Body $body
```

Save the `accessToken` from response!

### 3. Test Disaster Alerts

**Create Alert (Admin):**
```powershell
$token = "YOUR_ACCESS_TOKEN_HERE"

$alert = @{
    alert_type = "typhoon"
    severity = "critical"
    title = "Typhoon Odette Approaching"
    description = "Strong typhoon expected to make landfall in Visayas region"
    source = "PAGASA"
    affected_areas = @("Cebu", "Bohol", "Leyte")
    latitude = 10.3157
    longitude = 123.8854
    radius_km = 100
    start_time = "2024-01-15T08:00:00Z"
    end_time = "2024-01-16T20:00:00Z"
    metadata = @{
        wind_speed = 185
        signal_number = 4
    }
} | ConvertTo-Json

curl -Method POST -Uri "http://localhost:3000/api/v1/alerts" `
     -Headers @{Authorization="Bearer $token"} `
     -ContentType "application/json" `
     -Body $alert
```

**Get All Alerts (Public):**
```powershell
curl http://localhost:3000/api/v1/alerts
```

**Search Alerts (Public):**
```powershell
curl "http://localhost:3000/api/v1/alerts/search?q=typhoon"
```

**Broadcast Alert (Admin):**
```powershell
curl -Method POST -Uri "http://localhost:3000/api/v1/alerts/1/broadcast" `
     -Headers @{Authorization="Bearer $token"}
```

### 4. Test Evacuation Centers

**Create Center (Admin):**
```powershell
$center = @{
    name = "Cebu City Sports Center"
    address = "M.J. Cuenco Ave, Cebu City"
    city = "Cebu City"
    province = "Cebu"
    barangay = "Mabolo"
    latitude = 10.3157
    longitude = 123.8854
    capacity = 5000
    contact_person = "Juan Dela Cruz"
    contact_number = "09123456789"
    facilities = @("medical", "food", "water", "restrooms", "power")
} | ConvertTo-Json

curl -Method POST -Uri "http://localhost:3000/api/v1/evacuation-centers" `
     -Headers @{Authorization="Bearer $token"} `
     -ContentType "application/json" `
     -Body $center
```

**Find Nearby Centers (Public):**
```powershell
curl "http://localhost:3000/api/v1/evacuation-centers/nearby?lat=10.3157&lng=123.8854&radius=50"
```

**Update Occupancy (Admin):**
```powershell
$occupancy = @{
    occupancy = 1500
} | ConvertTo-Json

curl -Method PATCH -Uri "http://localhost:3000/api/v1/evacuation-centers/1/occupancy" `
     -Headers @{Authorization="Bearer $token"} `
     -ContentType "application/json" `
     -Body $occupancy
```

**Get Statistics (Admin):**
```powershell
curl -Headers @{Authorization="Bearer $token"} `
     "http://localhost:3000/api/v1/evacuation-centers/admin/statistics"
```

### 5. Test Emergency Contacts

**Create Contact (Admin):**
```powershell
$contact = @{
    category = "Police"
    name = "Philippine National Police"
    phone = "09171234567"
    alternate_phone = "09181234567"
    email = "pnp@example.com"
    address = "Camp Crame, Quezon City"
    is_national = $true
    display_order = 0
} | ConvertTo-Json

curl -Method POST -Uri "http://localhost:3000/api/v1/emergency-contacts" `
     -Headers @{Authorization="Bearer $token"} `
     -ContentType "application/json" `
     -Body $contact
```

**Get All Contacts Grouped (Public):**
```powershell
curl http://localhost:3000/api/v1/emergency-contacts
```

**Get Contacts by Category (Public):**
```powershell
curl http://localhost:3000/api/v1/emergency-contacts/category/Police
```

**Search Contacts (Public):**
```powershell
curl "http://localhost:3000/api/v1/emergency-contacts/search?q=police"
```

---

## Expected Results

### ✅ Success Indicators:
- Server starts without errors
- Health check returns `{"status":"ok"}`
- User registration returns access token
- All CRUD operations return 200/201 status
- Public endpoints work without authentication
- Admin endpoints require valid token
- Data persists in database

### ❌ Common Issues:

**Database Connection Failed:**
- Check MySQL is running
- Verify credentials in `.env`
- Ensure database exists

**Authentication Failed:**
- Check JWT_SECRET is set
- Verify token is not expired
- Use correct Authorization header format

**Validation Errors:**
- Check phone format: 09XXXXXXXXX
- Check coordinates: lat (-90 to 90), lng (-180 to 180)
- Check required fields are present

---

## Testing Checklist

### Disaster Alerts:
- [ ] Create alert
- [ ] List alerts with filters
- [ ] Search alerts
- [ ] Get single alert
- [ ] Update alert
- [ ] Broadcast alert
- [ ] Get statistics
- [ ] Deactivate alert

### Evacuation Centers:
- [ ] Create center
- [ ] List centers with filters
- [ ] Find nearby centers
- [ ] Search centers
- [ ] Get single center
- [ ] Update center
- [ ] Update occupancy
- [ ] Get statistics
- [ ] Deactivate center

### Emergency Contacts:
- [ ] Create contact
- [ ] List contacts (grouped)
- [ ] Get by category
- [ ] Search contacts
- [ ] Get categories
- [ ] Get single contact
- [ ] Update contact
- [ ] Deactivate contact

---

## Next Steps After Testing

1. **Fix any bugs found**
2. **Write automated tests**
3. **Add rate limiting**
4. **Performance testing**
5. **Move to Phase 3 features**

---

## Support

If you encounter issues:
1. Check server logs in `backend/logs/`
2. Verify database schema is imported
3. Check environment variables
4. Review API documentation in `API_DOCUMENTATION.md`
5. Check implementation details in `PHASE_2_IMPLEMENTATION_COMPLETE.md`
