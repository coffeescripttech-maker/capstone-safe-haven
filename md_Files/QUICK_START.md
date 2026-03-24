# SafeHaven - Quick Start Guide

## 🚀 Get Started in 15 Minutes

This guide will help you set up and run SafeHaven locally for development.

---

## Step 1: Install Prerequisites (5 minutes)

### Required Software

1. **Node.js** (v18+)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **MySQL** (v8.0+)
   - Download: https://dev.mysql.com/downloads/mysql/
   - Or use XAMPP: https://www.apachefriends.org/

3. **Git**
   - Download: https://git-scm.com/

4. **Android Studio** (for mobile development)
   - Download: https://developer.android.com/studio

---

## Step 2: Setup Database (3 minutes)

### Option A: Using MySQL Command Line
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE safehaven_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Exit
exit
```

### Option B: Using XAMPP phpMyAdmin
1. Start XAMPP (Apache + MySQL)
2. Open http://localhost/phpmyadmin
3. Click "New" to create database
4. Name: `safehaven_db`
5. Collation: `utf8mb4_unicode_ci`

### Import Schema
```bash
cd "C:\Users\ACER\Desktop\2025 Capstone Project\SAFE-HAVEN"
mysql -u root -p safehaven_db < database/schema.sql
```

---

## Step 3: Setup Backend (4 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Edit .env with your settings
notepad .env
```

### Update .env file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=safehaven_db
JWT_SECRET=change_this_to_random_string_123456
```

### Start backend server:
```bash
npm run dev
```

✅ Backend should be running on http://localhost:3000

Test it: Open http://localhost:3000/health in your browser

---

## Step 4: Test the API (3 minutes)

### Using PowerShell or CMD:

**Register a user:**
```powershell
curl -X POST http://localhost:3000/api/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"phone\":\"09123456789\",\"password\":\"password123\",\"firstName\":\"Juan\",\"lastName\":\"Dela Cruz\"}'
```

**Login:**
```powershell
curl -X POST http://localhost:3000/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"password123\"}'
```

Copy the `accessToken` from the response.

**Get Profile:**
```powershell
curl http://localhost:3000/api/v1/auth/me `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## Step 5: Next Steps

### For Mobile App Development:
```bash
cd mobile-app
npm install -g expo-cli
npx create-expo-app@latest . --template blank-typescript
npm install
npx expo start
```

### For Admin Dashboard:
```bash
cd admin-dashboard
npx create-react-app . --template typescript
npm install
npm start
```

---

## 📁 Project Structure Overview

```
SAFE-HAVEN/
├── backend/              ✅ READY - API server
│   ├── src/
│   │   ├── routes/      ✅ Auth routes working
│   │   ├── controllers/ ✅ Auth controller ready
│   │   ├── services/    ✅ Auth service ready
│   │   └── middleware/  ✅ Auth & error handling
│   └── package.json
│
├── database/            ✅ READY - Schema created
│   └── schema.sql
│
├── mobile-app/          ⏳ TODO - Next phase
├── admin-dashboard/     ⏳ TODO - Later phase
└── docs/               📝 Documentation
```

---

## 🔧 Troubleshooting

### Backend won't start
- Check if MySQL is running
- Verify .env database credentials
- Check if port 3000 is available

### Database connection error
```bash
# Check MySQL status (XAMPP)
# Start MySQL from XAMPP Control Panel

# Or check Windows Services
services.msc
# Find "MySQL" and start it
```

### Port 3000 already in use
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID_NUMBER> /F
```

---

## 📚 What's Working Now

✅ **Backend API Server**
- User registration & login
- JWT authentication
- Profile management
- Database connection
- Error handling
- Request logging

✅ **Database**
- Complete schema for all features
- User management
- Disaster alerts structure
- Evacuation centers
- SOS alerts
- Incident reports
- And more...

---

## 🎯 Development Phases

### ✅ Phase 1: Foundation (CURRENT)
- [x] Project structure
- [x] Database schema
- [x] Backend setup
- [x] Authentication system

### ⏳ Phase 2: Core Features (NEXT)
- [ ] Disaster alerts API
- [ ] Evacuation centers API
- [ ] Emergency contacts API
- [ ] Mobile app initialization

### 📅 Phase 3: Advanced Features
- [ ] Family/Group locator
- [ ] SOS alert system
- [ ] Incident reporting
- [ ] Offline sync

### 📅 Phase 4: Admin Dashboard
- [ ] Dashboard UI
- [ ] Alert broadcasting
- [ ] Analytics

---

## 🤝 Need Help?

1. Check `DEVELOPMENT_ROADMAP.md` for detailed tasks
2. Review `PROJECT_STRUCTURE.md` for architecture
3. Read `GETTING_STARTED.md` for comprehensive setup
4. Check API documentation (coming soon)

---

## 🎉 You're Ready!

Your backend is now running and ready for development. Start building the remaining features following the roadmap!

**Next recommended steps:**
1. Test all auth endpoints with Postman
2. Implement disaster alerts API
3. Add evacuation centers endpoints
4. Start mobile app development
