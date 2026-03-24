# SafeHaven Notification System Setup Guide

## Overview

The SafeHaven notification system provides real-time push notifications, badge counters, audio alerts, and haptic feedback for emergency alerts. This guide walks through the complete setup process.

## Architecture Flow

```
Admin Web App → Backend API → Push Notification Service → Mobile App
                     ↓
              Database Triggers → User Notifications → Badge Updates
```

## Setup Steps

### 1. Database Setup

Apply the notification system migration:

```bash
cd MOBILE_APP/database
./apply-notification-system.ps1
```

This creates:
- `device_tokens` - Store mobile device tokens
- `user_notifications` - Track notifications per user
- `user_notification_settings` - User preferences
- Database triggers for automatic notification creation

### 2. Backend Configuration

The notification routes are already integrated. Ensure your `.env` has:

```env
# Firebase configuration (for push notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# SMS configuration (optional)
SMS_API_KEY=your-sms-api-key
SMS_SENDER_NAME=SafeHaven
```

### 3. Mobile App Integration

#### Initialize Notification System

In your main App component or after user login:

```typescript
import { notificationIntegration } from './src/services/notifications/NotificationIntegration';

// After user login
await notificationIntegration.initialize(user.id);
```

#### Add Badge Provider

Wrap your app with the BadgeProvider:

```typescript
import { BadgeProvider } from './src/store/BadgeContext';

export default function App() {
  return (
    <BadgeProvider>
      {/* Your app content */}
    </BadgeProvider>
  );
}
```

#### Use Badge Counters in Components

```typescript
import { useBadgeCounter } from '../store/BadgeContext';
import ConnectedBadge from '../components/common/ConnectedBadge';

// In your component
const { badgeCounts } = useBadgeCounter();

// Display badge
<ConnectedBadge 
  location="header"
  size="small"
  position="top-right"
/>
```

### 4. Web App Integration

The web app notification bells are already implemented and will trigger notifications when:
- New incidents are reported
- New SOS alerts are created
- Admins create new alerts

### 5. Testing the System

Run the integration test:

```bash
./test-notification-integration.ps1
```

This tests:
- Device token registration
- Notification delivery
- Badge synchronization
- Settings management
- Automatic triggers

## How It Works

### Admin Triggers Notification

1. Admin creates alert in web app
2. Database trigger creates `user_notifications` records
3. Backend sends push notifications to registered devices
4. Mobile app receives notification and updates badges

### Mobile App Processing

1. `NotificationManager` receives push notification
2. `BadgeCounterService` updates badge counts
3. `AudioAlertService` plays severity-based sounds
4. `HapticFeedbackService` triggers vibration patterns
5. UI components automatically update via `BadgeContext`

### Badge Locations

- **Header**: Notification bell in app header
- **Alerts Tab**: Bottom navigation alerts tab
- **Home Cards**: Critical alerts section on home screen

### Notification Types

- **Alert**: Emergency alerts from admin
- **SOS**: Emergency SOS requests
- **Incident**: Incident reports requiring attention

### Severity Levels

- **Critical**: Urgent sound + strong vibration + red badge
- **High**: Alert sound + medium vibration + orange badge
- **Medium**: Standard sound + light vibration + yellow badge
- **Low**: Subtle sound + light vibration + gray badge

## API Endpoints

### Device Registration
```
POST /api/notifications/register-device
{
  "deviceToken": "ExponentPushToken[...]",
  "platform": "mobile"
}
```

### Get Unread Notifications
```
GET /api/notifications/unread
```

### Mark as Read
```
POST /api/notifications/mark-read
{
  "notificationIds": ["1", "2"] // or "all"
}
```

### Test Notification
```
POST /api/notifications/test
{
  "severity": "high",
  "title": "Test Alert",
  "message": "Test message"
}
```

### Notification Settings
```
GET /api/notifications/settings
PUT /api/notifications/settings
{
  "soundEnabled": true,
  "vibrationEnabled": true,
  "pushEnabled": true,
  "smsEnabled": true
}
```

## Troubleshooting

### No Notifications Received

1. Check device token registration:
   ```sql
   SELECT * FROM device_tokens WHERE user_id = ?;
   ```

2. Verify Firebase configuration in backend `.env`

3. Check notification permissions on device

4. Test with integration script

### Badge Counts Not Updating

1. Ensure `BadgeProvider` wraps your app
2. Check `NotificationIntegration.initialize()` was called
3. Verify badge counter service is working:
   ```typescript
   console.log(notificationIntegration.getBadgeCounts());
   ```

### Sounds/Vibrations Not Working

1. Check notification settings:
   ```typescript
   const settings = await notificationIntegration.getNotificationSettings();
   ```

2. Verify device permissions for sounds/vibrations

3. Test with notification settings screen

### Database Triggers Not Firing

1. Check trigger creation:
   ```sql
   SHOW TRIGGERS LIKE '%notification%';
   ```

2. Verify user roles and active status

3. Check notification log:
   ```sql
   SELECT * FROM user_notifications ORDER BY created_at DESC LIMIT 10;
   ```

## Performance Considerations

- Badge counts are cached in memory and persisted to AsyncStorage
- Notifications are batched for better performance
- Old notifications are automatically cleaned up (50 max per user)
- Database indexes optimize notification queries

## Security

- Device tokens are encrypted in database
- Notification content is sanitized
- User permissions control notification visibility
- Rate limiting prevents notification spam

## Next Steps

1. Configure Firebase project for production
2. Set up SMS provider for backup notifications
3. Add notification analytics and monitoring
4. Implement notification scheduling for maintenance alerts
5. Add notification categories for better organization

## Support

For issues or questions:
1. Check the integration test results
2. Review backend logs for errors
3. Test with the notification settings screen
4. Verify database trigger execution