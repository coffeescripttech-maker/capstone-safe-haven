# 🔔 Expo Push Notifications - Current Status

## 📊 Summary

**Status:** ⚠️ PARTIALLY IMPLEMENTED BUT CURRENTLY DISABLED

The push notification system was previously implemented but is currently **disabled** in the mobile app. However, the backend infrastructure is fully ready to send notifications.

---

## ✅ What's Already Implemented (Backend)

### 1. Backend API Endpoints
- ✅ `POST /api/v1/auth/device-token` - Register device FCM token
- ✅ `POST /api/v1/alerts/:id/broadcast` - Send push notifications to users
- ✅ Firebase Admin SDK initialized and configured
- ✅ Device tokens stored in `device_tokens` table

### 2. Database Schema
```sql
CREATE TABLE device_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    platform ENUM('android', 'ios') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_token (token)
);
```

### 3. Notification Service
- ✅ `NotificationService.sendPushNotification()` - Sends via Firebase Cloud Messaging
- ✅ Supports batch sending (up to 500 tokens per request)
- ✅ Handles success/failure tracking
- ✅ Severity-based emoji icons (🚨 critical, ⚠️ high, ⚡ moderate, ℹ️ low)

### 4. Alert Targeting Service
- ✅ `AlertTargetingService.getUsersByCity()` - Target users by city
- ✅ `AlertTargetingService.getUsersByRadius()` - Target users within radius
- ✅ Filters users with valid FCM tokens
- ✅ Respects user notification preferences

### 5. Alert Automation Integration
- ✅ When alerts are approved in `/alert-automation`, push notifications are sent automatically
- ✅ Weather alerts target by city
- ✅ Earthquake alerts target by radius
- ✅ Works alongside SMS blast system

---

## ⚠️ What's Currently Disabled (Mobile App)

### 1. Package Dependencies
**Missing:** `expo-notifications` package is NOT installed in `package.json`

Current dependencies don't include:
```json
{
  "expo-notifications": "~0.XX.X"  // ❌ NOT INSTALLED
}
```

### 2. Notification Context (Disabled)
File: `MOBILE_APP/mobile/src/store/NotificationContext.tsx`

```typescript
// Currently returns dummy/disabled implementation
export const NotificationProvider = ({ children }) => {
  console.log('⚠️ NotificationProvider: Push notifications are disabled');
  
  return (
    <NotificationContext.Provider
      value={{
        hasPermission: false,
        fcmToken: null,
        unreadCount: 0,
        requestPermission: async () => false,  // ❌ Disabled
        registerToken: async () => {},          // ❌ Disabled
        clearBadge: async () => {}              // ❌ Disabled
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
```

### 3. Notification Utils (Disabled)
File: `MOBILE_APP/mobile/src/utils/notifications.ts`

```typescript
export const scheduleLocalNotification = async (...) => {
  console.log('⚠️ Local notifications are disabled in this build');
};
```

### 4. App.tsx (Skipped)
File: `MOBILE_APP/mobile/App.tsx`

```typescript
// NotificationProvider is skipped entirely
const NotificationProvider = ({ children }: any) => <>{children}</>;
```

---

## 🚀 How to Enable Expo Push Notifications

### Step 1: Install expo-notifications Package

```bash
cd MOBILE_APP/mobile
npm install expo-notifications
```

### Step 2: Update NotificationContext.tsx

Replace the disabled implementation with the full implementation:

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { authService } from '../services/api';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Request permission
  const requestPermission = async (): Promise<boolean> => {
    if (!Device.isDevice) {
      console.warn('Push notifications only work on physical devices');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Permission not granted for push notifications');
      return false;
    }

    setHasPermission(true);
    return true;
  };

  // Register token with backend
  const registerToken = async () => {
    try {
      const token = await Notifications.getExpoPushTokenAsync();
      setFcmToken(token.data);

      // Send to backend
      await authService.registerDeviceToken({
        token: token.data,
        platform: Platform.OS as 'android' | 'ios'
      });

      console.log('✅ Device token registered with backend');
    } catch (error) {
      console.error('Failed to register device token:', error);
    }
  };

  // Listen for notifications
  useEffect(() => {
    // Notification received while app is open
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      setUnreadCount(prev => prev + 1);

      // Show alert for critical notifications
      if (notification.request.content.data?.severity === 'critical') {
        Alert.alert(
          notification.request.content.title || 'Alert',
          notification.request.content.body || ''
        );
      }
    });

    // Notification tapped
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      // Handle navigation based on notification data
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  const clearBadge = async () => {
    setUnreadCount(0);
    await Notifications.setBadgeCountAsync(0);
  };

  return (
    <NotificationContext.Provider
      value={{
        hasPermission,
        fcmToken,
        unreadCount,
        requestPermission,
        registerToken,
        clearBadge
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
```

### Step 3: Update App.tsx

Remove the skip and use the real NotificationProvider:

```typescript
// Remove this line:
// const NotificationProvider = ({ children }: any) => <>{children}</>;

// Import the real one:
import { NotificationProvider } from './src/store/NotificationContext';

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NetworkProvider>
          <AuthProvider>
            <RoleProvider>
              <LocationProvider>
                <AlertProvider>
                  <NotificationProvider>  {/* ✅ Now enabled */}
                    <RootNavigator />
                    <OfflineBanner />
                  </NotificationProvider>
                </AlertProvider>
              </LocationProvider>
            </RoleProvider>
          </AuthProvider>
        </NetworkProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
```

### Step 4: Update app.json

Add notification configuration:

```json
{
  "expo": {
    "name": "SafeHaven",
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ],
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#DC2626",
      "androidMode": "default",
      "androidCollapsedTitle": "SafeHaven Alerts"
    }
  }
}
```

### Step 5: Test with Expo Go

1. Start the app:
```bash
cd MOBILE_APP/mobile
npm start
```

2. Scan QR code with Expo Go app

3. Login to the app

4. Grant notification permission when prompted

5. Check console for: "✅ Device token registered with backend"

6. Test by approving an alert in the admin dashboard at `http://localhost:3000/alert-automation`

---

## 🧪 Testing Push Notifications

### Option 1: Test via Alert Automation (Recommended)

1. Open admin dashboard: `http://localhost:3000/alert-automation`
2. Find a pending alert
3. Click "Approve" button
4. Backend will automatically:
   - Send SMS to affected users
   - Send push notifications to users with FCM tokens
5. Check mobile app for notification

### Option 2: Test via Expo Push Notification Tool

1. Get your Expo push token from the app console
2. Go to: https://expo.dev/notifications
3. Enter your token
4. Send test notification
5. Check mobile app

### Option 3: Test via Backend API

```bash
# First, get a device token from the database
SELECT token FROM device_tokens WHERE user_id = 1;

# Then use Firebase Admin SDK to send (backend does this automatically)
```

---

## 📱 Expected User Flow (Once Enabled)

### 1. First Launch
```
Home Screen shows:
┌─────────────────────────┐
│ 🔔 Enable Notifications │
│ Get instant disaster    │
│ alerts              →   │
└─────────────────────────┘
```

### 2. User Taps Card
```
System Permission Dialog:
┌─────────────────────────┐
│ "SafeHaven" Would Like  │
│ to Send You             │
│ Notifications           │
│                         │
│ [Don't Allow] [Allow]   │
└─────────────────────────┘
```

### 3. Permission Granted
- Expo push token generated
- Token sent to backend
- Stored in `device_tokens` table
- User can now receive notifications

### 4. Alert Approved
- Admin approves alert in dashboard
- Backend sends push notification
- User receives notification on device
- Tapping opens app to alert details

---

## 🔧 Backend Configuration

### Firebase Admin SDK (Already Configured)

The backend already has Firebase configured via environment variables:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

File: `MOBILE_APP/backend/src/services/notification.service.ts`

The service automatically:
- ✅ Initializes Firebase Admin SDK
- ✅ Sends notifications to multiple devices
- ✅ Handles batch sending (500 tokens per batch)
- ✅ Tracks success/failure
- ✅ Logs errors

---

## 📊 Current Integration Points

### 1. Alert Automation
When alerts are approved, push notifications are sent automatically:

File: `MOBILE_APP/backend/src/services/alertAutomation.service.ts`

```typescript
// After SMS is sent, push notifications are also sent
const tokens = targetUsers
  .map(user => user.fcm_token)
  .filter(token => token);

if (tokens.length > 0) {
  await notificationService.sendPushNotification(tokens, {
    id: alert.id,
    title: alert.title,
    description: alert.description,
    severity: alert.severity,
    alert_type: alert.alert_type
  });
}
```

### 2. Manual Alert Broadcasting
Endpoint: `POST /api/v1/alerts/:id/broadcast`

Sends push notifications to all users in affected areas.

---

## ✅ Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Backend API | ✅ Ready | Fully implemented |
| Database Schema | ✅ Ready | `device_tokens` table exists |
| Firebase Admin SDK | ✅ Ready | Configured and working |
| Alert Integration | ✅ Ready | Auto-sends on approval |
| Mobile Package | ❌ Missing | Need to install `expo-notifications` |
| Mobile Context | ⚠️ Disabled | Code exists but disabled |
| Mobile UI | ⚠️ Disabled | Permission card disabled |

---

## 🎯 Next Steps to Enable

1. **Install Package:**
   ```bash
   cd MOBILE_APP/mobile
   npm install expo-notifications
   ```

2. **Enable NotificationContext:**
   - Implement full notification logic
   - Add permission request
   - Add token registration
   - Add notification listeners

3. **Update App.tsx:**
   - Remove skip logic
   - Use real NotificationProvider

4. **Test:**
   - Run app in Expo Go
   - Grant permission
   - Approve alert in dashboard
   - Verify notification received

---

## 📚 Documentation

- ✅ `MOBILE_APP/mobile/PUSH_NOTIFICATIONS_SETUP.md` - Complete setup guide
- ✅ `MOBILE_APP/PHASE_3_PUSH_NOTIFICATIONS_COMPLETE.md` - Implementation details
- ✅ Backend notification service fully documented

---

## 🎉 Conclusion

The push notification infrastructure is **fully ready on the backend**. The mobile app just needs:
1. Install `expo-notifications` package
2. Enable the NotificationContext
3. Test with Expo Go

Once enabled, users will receive instant push notifications when:
- ✅ Alerts are approved in alert automation
- ✅ Emergency broadcasts are sent
- ✅ Critical warnings are issued

**Estimated time to enable: 30 minutes** ⏱️
