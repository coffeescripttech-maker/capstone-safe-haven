# SafeHaven Mobile App - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (you already have this)
- npm or yarn
- Expo CLI
- Expo Go app on your phone (for testing)

### Step 1: Install Expo CLI
```bash
npm install -g expo-cli
# or
npm install -g eas-cli
```

### Step 2: Create the Mobile App
```bash
# From the project root
npx create-expo-app mobile --template expo-template-blank-typescript

# Navigate to mobile folder
cd mobile

# Install dependencies
npm install
```

### Step 3: Install Required Packages
```bash
# Navigation
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs @react-navigation/drawer

# React Navigation dependencies
npx expo install react-native-screens react-native-safe-area-context

# API & Storage
npm install axios @react-native-async-storage/async-storage

# Maps
npx expo install react-native-maps

# Location
npx expo install expo-location

# Notifications
npx expo install expo-notifications expo-device expo-constants

# UI Components
npm install react-native-paper react-native-vector-icons

# Forms
npm install react-hook-form

# Date handling
npm install date-fns

# Icons
npx expo install @expo/vector-icons
```

### Step 4: Start Development
```bash
# Start Expo dev server
npm start

# Or specific platform
npm run android
npm run ios
npm run web
```

---

## 📁 Project Structure

```
mobile/
├── app/                    # App screens (Expo Router)
├── src/
│   ├── components/        # Reusable components
│   │   ├── common/       # Buttons, Cards, etc.
│   │   ├── alerts/       # Alert-specific components
│   │   ├── centers/      # Evacuation center components
│   │   └── contacts/     # Emergency contact components
│   ├── screens/          # Screen components
│   │   ├── auth/         # Login, Register
│   │   ├── home/         # Home screen
│   │   ├── alerts/       # Alerts feed, details
│   │   ├── centers/      # Centers map, list
│   │   ├── contacts/     # Emergency contacts
│   │   └── profile/      # User profile
│   ├── navigation/       # Navigation setup
│   ├── services/         # API services
│   │   ├── api.ts        # Axios instance
│   │   ├── auth.ts       # Auth API calls
│   │   ├── alerts.ts     # Alerts API calls
│   │   ├── centers.ts    # Centers API calls
│   │   └── contacts.ts   # Contacts API calls
│   ├── store/            # State management (Context API)
│   │   ├── AuthContext.tsx
│   │   ├── AlertContext.tsx
│   │   └── LocationContext.tsx
│   ├── utils/            # Utility functions
│   │   ├── storage.ts    # AsyncStorage helpers
│   │   ├── location.ts   # Location helpers
│   │   └── notifications.ts # Notification helpers
│   ├── types/            # TypeScript types
│   │   ├── api.ts        # API response types
│   │   ├── models.ts     # Data models
│   │   └── navigation.ts # Navigation types
│   ├── constants/        # Constants
│   │   ├── colors.ts     # Color palette
│   │   ├── config.ts     # App config
│   │   └── api.ts        # API endpoints
│   └── hooks/            # Custom hooks
│       ├── useAuth.ts
│       ├── useAlerts.ts
│       └── useLocation.ts
├── assets/               # Images, fonts, etc.
├── app.json             # Expo config
├── package.json
└── tsconfig.json
```

---

## 🎨 Design System

### Colors (Philippine-inspired)
```typescript
export const colors = {
  primary: '#0038A8',      // Blue from Philippine flag
  secondary: '#CE1126',    // Red from Philippine flag
  accent: '#FCD116',       // Yellow from Philippine flag
  
  // Severity colors
  critical: '#DC2626',     // Red
  high: '#F59E0B',        // Orange
  moderate: '#3B82F6',    // Blue
  low: '#10B981',         // Green
  
  // UI colors
  background: '#F9FAFB',
  surface: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  
  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};
```

### Typography
```typescript
export const typography = {
  h1: { fontSize: 32, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: 'normal' },
  caption: { fontSize: 14, fontWeight: 'normal' },
  small: { fontSize: 12, fontWeight: 'normal' },
};
```

---

## 🔧 Configuration

### API Configuration (`src/constants/config.ts`)
```typescript
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://10.0.2.2:3000/api/v1'  // Android emulator
    : 'https://your-production-api.com/api/v1',
  TIMEOUT: 10000,
};
```

### Firebase Configuration (`app.json`)
```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json",
      "package": "com.safehaven.app"
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist",
      "bundleIdentifier": "com.safehaven.app"
    }
  }
}
```

---

## 📱 Features to Implement

### Week 1: Foundation
- [x] Project setup
- [ ] Navigation structure
- [ ] API service layer
- [ ] Authentication screens
- [ ] State management
- [ ] Storage utilities

### Week 2: Core Features
- [ ] Disaster alerts feed
- [ ] Alert details screen
- [ ] Evacuation centers map
- [ ] Centers list view
- [ ] Emergency contacts list
- [ ] Contact details

### Week 3: Advanced Features
- [ ] Push notifications
- [ ] Location services
- [ ] Offline support
- [ ] Profile management
- [ ] Settings screen
- [ ] Testing & polish

---

## 🧪 Testing

### On Physical Device (Recommended)
1. Install Expo Go from Play Store/App Store
2. Run `npm start`
3. Scan QR code with Expo Go
4. App runs on your phone!

### On Emulator
```bash
# Android
npm run android

# iOS (Mac only)
npm run ios
```

---

## 🚀 Deployment

### Build for Testing
```bash
# Android APK
eas build --platform android --profile preview

# iOS (requires Apple Developer account)
eas build --platform ios --profile preview
```

### Production Build
```bash
# Android
eas build --platform android --profile production

# iOS
eas build --platform ios --profile production
```

---

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)

---

## 🎯 Next Steps

1. Run the setup commands above
2. I'll create the initial project structure
3. We'll build authentication first
4. Then add core features one by one

Ready to start? Let's build! 🚀
