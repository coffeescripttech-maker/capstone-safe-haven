# Real-Time WebSocket - Quick Reference Card

## 🚀 Quick Start (3 Steps)

### 1. Start Backend
```powershell
cd MOBILE_APP/backend
npm run dev
```
Look for: `✅ WebSocket server initialized`

### 2. Start Mobile
```powershell
cd MOBILE_APP/mobile
npx expo start --clear
```
Login with: `admin@test.safehaven.com` / `Test123!`

### 3. Test Real-Time
```powershell
cd MOBILE_APP
.\test-realtime-quick.ps1
```
Alert should appear in < 1 second!

---

## 📊 What to Expect

### Backend Console
```
✅ WebSocket server initialized
🔌 New WebSocket connection: abc123
✅ User 11 authenticated on socket abc123
📢 Broadcasting new alert: 456
```

### Mobile Console
```
🔌 Connecting to WebSocket: http://192.168.43.25:3001
✅ WebSocket connected
✅ WebSocket authenticated: 11
📢 Received new alert: {...}
```

### Mobile App
- Alert appears instantly (< 1 second)
- Badge counter updates automatically
- No refresh needed

---

## 🔧 Troubleshooting

### WebSocket Not Connecting?
```powershell
# Check backend health
curl http://192.168.43.25:3001/health

# Check API_URL
cat MOBILE_APP/mobile/.env | Select-String API_URL

# Restart both
cd MOBILE_APP/backend && npm run dev
cd MOBILE_APP/mobile && npx expo start --clear
```

### Alerts Not Appearing?
1. Check backend logs for "📢 Broadcasting"
2. Check mobile logs for "📢 Received"
3. Verify user is logged in
4. Restart mobile with `--clear`

---

## 📈 Performance Targets

| Metric | Target | Critical |
|--------|--------|----------|
| Alert Delivery | < 1 second | ✅ |
| Connection Time | < 500ms | ✅ |
| Reconnection | < 2 seconds | ✅ |
| Battery Impact | Minimal | ✅ |

---

## 🎯 Success Checklist

- [ ] Backend shows "✅ WebSocket server initialized"
- [ ] Mobile shows "✅ WebSocket connected"
- [ ] Mobile shows "✅ WebSocket authenticated"
- [ ] Test alert appears in < 1 second
- [ ] Badge counter updates automatically
- [ ] No manual refresh needed

---

## 📚 Documentation

- **Setup**: `REALTIME_WEBSOCKET_SETUP.md`
- **Testing**: `WEBSOCKET_TESTING_GUIDE.md`
- **Complete**: `REALTIME_NOTIFICATIONS_COMPLETE.md`
- **Ready**: `REALTIME_READY_TO_TEST.md`

---

## 🆘 Quick Commands

```powershell
# Install dependencies
.\setup-realtime.ps1

# Start backend
cd backend && npm run dev

# Start mobile
cd mobile && npx expo start --clear

# Test real-time
.\test-realtime-quick.ps1

# Check health
curl http://192.168.43.25:3001/health

# View backend logs
cd backend && npm run dev

# Clear mobile cache
cd mobile && npx expo start --clear --reset-cache
```

---

## 💡 Key Features

✅ **Instant Updates**: < 1 second delivery
✅ **Auto Reconnect**: Reconnects automatically
✅ **Low Battery**: Minimal power usage
✅ **No Polling**: Persistent connection
✅ **Auto Badges**: Badge counters update automatically

---

## 🎉 Status

**Installation**: ✅ Complete
**Code Changes**: ✅ Applied
**Dependencies**: ✅ Installed
**Ready to Test**: ✅ YES!

**Next Action**: Start backend and mobile, then test!
