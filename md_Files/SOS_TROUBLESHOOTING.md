# 🚨 SOS Troubleshooting Guide

## Error: Unknown column 'user_info' in 'field list'

### Quick Fix: Add Missing Column

The `sos_alerts` table was created but is missing the `user_info` column.

**Run this SQL in MySQL Workbench:**

```sql
USE safehaven_db;
ALTER TABLE sos_alerts ADD COLUMN user_info JSON AFTER message;
```

**Or use the fix script:**
1. Open MySQL Workbench
2. Connect to `safehaven_db`
3. Open file: `FIX_SOS_TABLE.sql`
4. Execute it

**Or recreate tables completely:**
1. Open MySQL Workbench
2. Connect to `safehaven_db`
3. Open file: `RECREATE_SOS_TABLES.sql`
4. Execute it (⚠️ This will delete existing SOS data)

---

## Error: 500 Internal Server Error

### Most Common Cause: Database Tables Not Created

The SOS feature requires two database tables that need to be created manually.

---

## Quick Fix

### Step 1: Create the Database Tables

**Option A: Using MySQL Workbench (Easiest)**
1. Open MySQL Workbench
2. Connect to your `safehaven_db` database
3. Open the file: `database/sos_alerts.sql`
4. Click "Execute" (lightning bolt icon)
5. Verify tables created:
   ```sql
   SHOW TABLES LIKE 'sos%';
   ```

**Option B: Using Command Line**
```bash
mysql -u root safehaven_db < database/sos_alerts.sql
```

**Option C: Using PowerShell Script**
```powershell
cd backend
.\setup-sos-tables.ps1
```

**Option D: Manual SQL Execution**
Copy and paste this SQL into MySQL:

```sql
CREATE TABLE IF NOT EXISTS sos_alerts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  message TEXT,
  user_info JSON,
  status ENUM('pending', 'sent', 'acknowledged', 'responding', 'resolved', 'cancelled') DEFAULT 'sent',
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'high',
  responder_id INT NULL,
  response_time TIMESTAMP NULL,
  resolution_notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (responder_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_location (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sos_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sos_alert_id INT NOT NULL,
  recipient_type ENUM('emergency_services', 'emergency_contact', 'responder', 'admin') NOT NULL,
  recipient_id INT NULL,
  recipient_info JSON,
  notification_method ENUM('push', 'sms', 'email', 'call') NOT NULL,
  status ENUM('pending', 'sent', 'delivered', 'failed') DEFAULT 'pending',
  sent_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  error_message TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sos_alert_id) REFERENCES sos_alerts(id) ON DELETE CASCADE,
  INDEX idx_sos_alert_id (sos_alert_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Step 2: Verify Tables Created

Run this SQL to check:
```sql
USE safehaven_db;
SHOW TABLES LIKE 'sos%';
DESCRIBE sos_alerts;
DESCRIBE sos_notifications;
```

You should see:
```
+---------------------------+
| Tables_in_safehaven_db    |
+---------------------------+
| sos_alerts                |
| sos_notifications         |
+---------------------------+
```

### Step 3: Restart Backend Server

```bash
cd backend
npm run dev
```

### Step 4: Test SOS Again

Go back to the mobile app and try the SOS button again.

---

## Other Possible Issues

### Issue: Backend Not Running
**Check:** Is the backend server running?
```bash
cd backend
npm run dev
```

**Expected Output:**
```
SafeHaven API Server running on port 3000
Database connected successfully
```

### Issue: Wrong Database
**Check:** Are you connected to the right database?

In your `.env` file:
```
DB_NAME=safehaven_db
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
```

### Issue: User Not Authenticated
**Check:** Are you logged in?

The SOS endpoint requires authentication. Make sure you're logged in to the mobile app.

### Issue: Network Connection
**Check:** Can the mobile app reach the backend?

For Android Emulator, use: `http://10.0.2.2:3000/api/v1`
For Physical Device, use: `http://YOUR_IP:3000/api/v1`

---

## Debugging Steps

### 1. Check Backend Logs

Look at the terminal where backend is running. You should see error messages like:

```
Error creating SOS alert: Error: ER_NO_SUCH_TABLE: Table 'safehaven_db.sos_alerts' doesn't exist
```

This confirms the tables need to be created.

### 2. Check Database Connection

```sql
USE safehaven_db;
SHOW TABLES;
```

You should see all your tables including `sos_alerts` and `sos_notifications`.

### 3. Test Backend Directly

Use the test script:
```powershell
cd backend
.\test-sos.ps1
```

This will test the backend without the mobile app.

### 4. Check Mobile App Logs

In Expo, look for:
```
LOG  Sending SOS with data: {...}
ERROR Error sending SOS: [AxiosError: Request failed with status code 500]
```

The 500 error means the backend received the request but couldn't process it (usually database issue).

---

## Success Indicators

### ✅ Tables Created Successfully
```sql
mysql> SHOW TABLES LIKE 'sos%';
+---------------------------+
| Tables_in_safehaven_db    |
+---------------------------+
| sos_alerts                |
| sos_notifications         |
+---------------------------+
2 rows in set
```

### ✅ Backend Running Successfully
```
SafeHaven API Server running on port 3000
Database connected successfully
```

### ✅ SOS Alert Sent Successfully
Mobile app shows:
```
✓ SOS Sent!
Your emergency alert has been sent to authorities and your emergency contacts.
```

Backend logs show:
```
SOS alert created: 1 by user 5
Notifications sent for SOS alert 1
```

Database shows:
```sql
mysql> SELECT * FROM sos_alerts;
+----+---------+------------+-------------+---------------------------+
| id | user_id | latitude   | longitude   | message                   |
+----+---------+------------+-------------+---------------------------+
|  1 |       5 | 13.1752447 | 123.7339790 | Emergency! I need help!   |
+----+---------+------------+-------------+---------------------------+
```

---

## Quick Checklist

- [ ] Database tables created (`sos_alerts`, `sos_notifications`)
- [ ] Backend server running
- [ ] User logged in to mobile app
- [ ] Network connection working
- [ ] Backend logs show no errors
- [ ] Test SOS button again

---

## Still Having Issues?

### Check These Files:
1. `database/sos_alerts.sql` - SQL script
2. `backend/src/services/sos.service.ts` - Service logic
3. `backend/src/controllers/sos.controller.ts` - Controller
4. `backend/src/routes/sos.routes.ts` - Routes

### Common Errors:

**"Table doesn't exist"**
→ Create the tables (see Step 1 above)

**"Authentication required"**
→ Login to the mobile app

**"Network Error"**
→ Check backend is running and accessible

**"User information required"**
→ This is now fixed in the latest code

---

## Need Help?

1. Check backend terminal for error messages
2. Check mobile app console for detailed errors
3. Verify database tables exist
4. Test backend with `test-sos.ps1` script
5. Check `BACKEND_SOS_COMPLETE.md` for full documentation

---

**Most likely fix: Create the database tables using the SQL script!**
