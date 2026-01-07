# Getting Started with SafeHaven Development

## Prerequisites

Before starting development, ensure you have the following installed:

### Required Software
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Package manager
- **Git** - Version control
- **Android Studio** - For Android development
- **MySQL** - Database (v8.0+)
- **VS Code** - Recommended IDE

### Mobile Development Tools
- **Expo CLI**: `npm install -g expo-cli`
- **EAS CLI**: `npm install -g eas-cli`
- **Android SDK** (via Android Studio)
- **Java Development Kit (JDK)** 11 or higher

### Accounts Needed
- **Expo Account** - [Sign up](https://expo.dev/)
- **Firebase Account** - For FCM push notifications
- **Mapbox Account** - For maps (free tier available)
- **SMS Provider** - Semaphore (PH) or Twilio

---

## Step 1: Initial Setup

### 1.1 Clone Repository
```bash
cd "C:\Users\ACER\Desktop\2025 Capstone Project\SAFE-HAVEN"
git init
```

### 1.2 Create Environment Files

Create `.env` files for each project:

**Backend (.env)**
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=safehaven_db
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
SMS_API_KEY=your_sms_api_key
FIREBASE_SERVER_KEY=your_firebase_key
```

**Mobile App (.env)**
```env
API_URL=http://localhost:3000/api
MAPBOX_ACCESS_TOKEN=your_mapbox_token
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_PROJECT_ID=your_project_id
```

---

## Step 2: Database Setup

### 2.1 Create MySQL Database
```sql
CREATE DATABASE safehaven_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2.2 Run Migrations
```bash
cd backend
npm run migrate
npm run seed
```

---

## Step 3: Backend Setup

### 3.1 Install Dependencies
```bash
cd backend
npm install
```

### 3.2 Start Development Server
```bash
npm run dev
```

Server should run on `http://localhost:3000`

---

## Step 4: Mobile App Setup

### 4.1 Initialize Expo Project
```bash
cd mobile-app
npx create-expo-app@latest . --template blank-typescript
```

### 4.2 Install Dependencies
```bash
npm install @react-navigation/native @react-navigation/stack
npm install expo-sqlite expo-location expo-task-manager
npm install @react-native-mapbox-gl/maps
npm install zustand react-query axios
npm install @react-native-firebase/app @react-native-firebase/messaging
```

### 4.3 Configure for Bare Workflow
```bash
npx expo prebuild
```

### 4.4 Run on Android
```bash
npx expo run:android
```

---

## Step 5: Admin Dashboard Setup

### 5.1 Create React App
```bash
cd admin-dashboard
npx create-react-app . --template typescript
```

### 5.2 Install Dependencies
```bash
npm install react-router-dom axios
npm install tailwindcss daisyui
npm install mapbox-gl chart.js react-chartjs-2
npm install @tanstack/react-query
```

### 5.3 Start Development Server
```bash
npm start
```

---

## Development Workflow

### Daily Development
1. Pull latest changes: `git pull`
2. Start backend: `cd backend && npm run dev`
3. Start mobile app: `cd mobile-app && npx expo start`
4. Start dashboard: `cd admin-dashboard && npm start`

### Testing
```bash
# Backend tests
cd backend && npm test

# Mobile app tests
cd mobile-app && npm test
```

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format
```

---

## Project Structure Commands

### Create New Feature
```bash
# Backend
cd backend/src
mkdir features/feature-name
cd features/feature-name
touch controller.ts service.ts routes.ts model.ts

# Mobile
cd mobile-app/src
mkdir screens/FeatureName
mkdir components/FeatureName
```

---

## Troubleshooting

### Common Issues

**1. Metro bundler cache issues**
```bash
cd mobile-app
npx expo start -c
```

**2. Android build fails**
```bash
cd mobile-app/android
./gradlew clean
cd ..
npx expo run:android
```

**3. Database connection fails**
- Check MySQL is running
- Verify credentials in `.env`
- Check firewall settings

**4. Port already in use**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## Next Steps

1. Review `PROJECT_STRUCTURE.md` for architecture
2. Check `DEVELOPMENT_ROADMAP.md` for tasks
3. Read `docs/architecture/` for design decisions
4. Start with Phase 1 tasks
5. Join team communication channel

---

## Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [Mapbox SDK](https://docs.mapbox.com/)
- [Express.js Guide](https://expressjs.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

---

## Support

For questions or issues:
- Check documentation in `/docs`
- Review existing issues on GitHub
- Contact team lead
- Refer to architecture diagrams
