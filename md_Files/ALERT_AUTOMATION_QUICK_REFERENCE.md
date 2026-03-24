# Alert Automation - Quick Reference Card

## 🎯 Status: 100% COMPLETE

---

## 🚀 Quick Start

### 1. Restart Backend (Required)
```powershell
cd backend
npm run dev
```

### 2. Verify Monitoring (Wait 5 min)
Look for logs:
```
[Alert Automation] Running scheduled monitoring cycle
[Alert Automation] Cycle complete. Weather: 0, Earthquakes: 0
```

### 3. Test Manually
```powershell
cd backend
./test-automation-complete.ps1
```

---

## 📊 What's Implemented

| Component | Status | Location |
|-----------|--------|----------|
| Scheduled Monitoring | ✅ | `backend/src/server.ts` |
| User Location Data | ✅ | `users` table (9 users, 6 cities) |
| Weather Monitoring | ✅ | Open-Meteo API |
| Earthquake Monitoring | ✅ | USGS API |
| Alert Rules | ✅ | 4 active rules |
| Location Targeting | ✅ | City + Radius based |
| Automation Logs | ✅ | `alert_automation_logs` table |
| Frontend Dashboard | ✅ | `/alert-automation` |
| Frontend Logs | ✅ | `/alert-automation/logs` |
| Frontend Rules | ✅ | `/alert-automation/rules` |

---

## 🔄 Monitoring Schedule

**Frequency**: Every 5 minutes  
**Cron**: `*/5 * * * *`  
**Actions**:
1. Fetch weather (6 cities)
2. Fetch earthquakes (M4+, 24h)
3. Evaluate 4 rules
4. Create alerts if matched
5. Target users by location
6. Log all events

---

## 📍 User Locations

| City | Users | Coordinates |
|------|-------|-------------|
| Manila | ~2 | 14.5995, 120.9842 |
| Quezon City | ~2 | 14.6760, 121.0437 |
| Cebu City | ~2 | 10.3157, 123.8854 |
| Davao City | ~1 | 7.1907, 125.4553 |
| Baguio | ~1 | 16.4023, 120.5960 |
| Iloilo City | ~1 | 10.7202, 122.5621 |

**Total**: 9 users with location data

---

## 🎯 Alert Rules

| Rule | Type | Threshold | Targeting |
|------|------|-----------|-----------|
| Extreme Heat Warning | Weather | ≥35°C | City |
| Heavy Rainfall Alert | Weather | ≥50mm | City |
| Strong Wind Warning | Weather | ≥60km/h | City |
| Significant Earthquake | Earthquake | ≥M5.0 | 100km radius |

---

## 🔧 Common Commands

### Test Monitoring
```powershell
cd backend
./test-alert-automation.ps1
```

### Check User Locations
```powershell
cd backend
node -e "const mysql = require('mysql2/promise'); require('dotenv').config(); (async () => { const conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'safehaven_db' }); const [rows] = await conn.query('SELECT id, email, city FROM users WHERE city IS NOT NULL'); console.table(rows); await conn.end(); })();"
```

### View Automation Logs
```sql
SELECT * FROM alert_automation_logs ORDER BY created_at DESC LIMIT 10;
```

### Check Active Rules
```sql
SELECT id, name, is_active FROM alert_rules WHERE is_active = 1;
```

---

## 🌐 Frontend URLs

- **Dashboard**: http://localhost:3001/alert-automation
- **Logs**: http://localhost:3001/alert-automation/logs
- **Rules**: http://localhost:3001/alert-automation/rules

---

## 🔍 API Endpoints

### Monitoring
- `POST /api/v1/admin/alert-automation/trigger` - Manual trigger
- `GET /api/v1/admin/alert-automation/logs` - Get logs
- `GET /api/v1/admin/alert-automation/pending` - Pending alerts

### Rules
- `GET /api/v1/admin/alert-automation/rules` - All rules
- `PUT /api/v1/admin/alert-automation/rules/:id` - Update rule
- `PUT /api/v1/admin/alert-automation/rules/:id/toggle` - Enable/disable

### Approval
- `POST /api/v1/admin/alert-automation/approve/:id` - Approve
- `POST /api/v1/admin/alert-automation/reject/:id` - Reject

---

## 🐛 Troubleshooting

### No monitoring logs?
→ Restart backend server

### No alerts created?
→ Normal if thresholds not exceeded  
→ Lower thresholds for testing:
```sql
UPDATE alert_rules 
SET conditions = JSON_SET(conditions, '$.temperature_celsius', 25)
WHERE name = 'Extreme Heat Warning';
```

### TypeScript errors?
→ Restart VS Code TypeScript server  
→ Run: `cd backend && npm run build`

---

## ✅ Verification Checklist

- [ ] Backend server restarted
- [ ] Logs show "Alert Automation monitoring scheduled"
- [ ] After 5 min, logs show monitoring cycle
- [ ] Manual trigger works
- [ ] Frontend pages load
- [ ] Automation logs table has entries
- [ ] Users have location data

---

## 📚 Documentation

- `ALERT_AUTOMATION_SUMMARY.md` - Quick summary
- `ALERT_AUTOMATION_100_COMPLETE.md` - Full documentation
- `ALERT_AUTOMATION_FINAL_STEPS.md` - Setup steps
- `ALERT_AUTOMATION_IMPLEMENTATION_COMPLETE.md` - Implementation details
- `ALERT_AUTOMATION_QUICK_REFERENCE.md` - This file

---

## 🎉 Result

**Alert Automation System: 100% Complete**

The system automatically monitors weather and earthquake data every 5 minutes, creates alerts when thresholds are exceeded, and targets users based on their location.

**Next**: Just restart the backend server!
