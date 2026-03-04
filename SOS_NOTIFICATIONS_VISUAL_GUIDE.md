# SOS Real-Time Notifications - Visual Guide

## 📍 Location in Header

```
┌─────────────────────────────────────────────────────────┐
│  ☰  SafeHaven                          🔔(3)⭕  👤      │
│  ^                                      ^        ^       │
│  Menu                                   Bell     User    │
└─────────────────────────────────────────────────────────┘
```

## 🔔 Bell Icon States

### 1. No Notifications
```
┌─────┐
│ 🔔  │  ← Gray bell icon
│     │     No badge
└─────┘
```

### 2. New Notifications (Unread)
```
┌─────┐
│ 🔔  │  ← Bell icon
│  (3)│  ← Red badge with count
│  ⭕ │  ← Pulse animation
└─────┘
```

### 3. Many Notifications (10+)
```
┌─────┐
│ 🔔  │  ← Bell icon
│ (9+)│  ← Shows "9+" for 10 or more
│  ⭕ │  ← Pulse animation
└─────┘
```

### 4. Hover State
```
┌─────┐
│ 🔔  │  ← Changes to red color
│  (3)│     Background lightens
└─────┘
```

## 📋 Notification Dropdown

### Full Dropdown Layout
```
┌──────────────────────────────────────────────────┐
│ 🚨 SOS Alerts                [3 new]        [X]  │ ← Header (Red gradient)
├──────────────────────────────────────────────────┤
│                                                   │
│  🔴  John Doe                    🚨 ALL      👁️  │ ← Alert 1 (Critical)
│      Emergency - need immediate help!            │
│      ⏰ 2:30 PM  📍 Location available           │
│                                                   │
├──────────────────────────────────────────────────┤
│                                                   │
│  🟠  Jane Smith                  🚒 BFP      👁️  │ ← Alert 2 (High)
│      Fire emergency at building!                 │
│      ⏰ 2:28 PM  📍 Location available           │
│                                                   │
├──────────────────────────────────────────────────┤
│                                                   │
│  🟡  Mike Johnson                👮 PNP      👁️  │ ← Alert 3 (Medium)
│      Suspicious activity reported                │
│      ⏰ 2:25 PM                                  │
│                                                   │
├──────────────────────────────────────────────────┤
│  Clear all                    [View All Alerts]  │ ← Footer
└──────────────────────────────────────────────────┘
```

### Empty State
```
┌──────────────────────────────────────────────────┐
│ 🚨 SOS Alerts                              [X]   │
├──────────────────────────────────────────────────┤
│                                                   │
│                    🔔                             │
│                                                   │
│           No new SOS alerts                       │
│           You're all caught up!                   │
│                                                   │
└──────────────────────────────────────────────────┘
```

## 🎨 Priority Color Coding

### Critical Priority
```
┌─────┐
│ 🔴  │  ← Red background
│     │     Red text
└─────┘
```

### High Priority
```
┌─────┐
│ 🟠  │  ← Orange background
│     │     Orange text
└─────┘
```

### Medium Priority
```
┌─────┐
│ 🟡  │  ← Yellow background
│     │     Yellow text
└─────┘
```

### Low Priority
```
┌─────┐
│ ⚪  │  ← Gray background
│     │     Gray text
└─────┘
```

## 🏢 Agency Icons

| Agency | Icon | Color |
|--------|------|-------|
| All Agencies | 🚨 | Purple |
| Barangay | 🏘️ | Green |
| LGU | 🏛️ | Blue |
| BFP (Fire) | 🚒 | Red |
| PNP (Police) | 👮 | Indigo |
| MDRRMO | ⚠️ | Orange |

## 📱 Mobile View

### Header (Mobile)
```
┌─────────────────────────────┐
│ ☰  SafeHaven  🔔(3)⭕  ⋮   │
└─────────────────────────────┘
```

### Dropdown (Mobile)
```
┌─────────────────────────────┐
│ 🚨 SOS Alerts    [3]   [X] │
├─────────────────────────────┤
│ 🔴 John Doe      🚨 ALL 👁️ │
│    Emergency!               │
│    ⏰ 2:30 PM               │
├─────────────────────────────┤
│ Clear | View All            │
└─────────────────────────────┘
```

## ⚡ Animation States

### Pulse Animation
```
Frame 1:  🔔 (3)
Frame 2:  🔔 (3) ⭕
Frame 3:  🔔 (3) ⭕⭕
Frame 4:  🔔 (3) ⭕⭕⭕
Frame 5:  🔔 (3) ⭕⭕
Frame 6:  🔔 (3) ⭕
Frame 1:  🔔 (3)
(Repeats)
```

### Dropdown Open Animation
```
Frame 1:  [Closed]
Frame 2:  [Opening - 25%]
Frame 3:  [Opening - 50%]
Frame 4:  [Opening - 75%]
Frame 5:  [Fully Open]
```

## 🔊 Audio Notification

### Sound Wave Visualization
```
Playing notification sound...

 /\    /\    /\
/  \  /  \  /  \
    \/    \/    

Duration: 0.5 seconds
Frequency: 800 Hz
Volume: 50%
```

## 🎯 User Interaction Flow

### Step 1: New SOS Arrives
```
Mobile App → Backend → Database
                ↓
        [SOS Alert Created]
```

### Step 2: Polling Detects Alert
```
Web Portal (Every 10s)
        ↓
   API Request
        ↓
   New Alert Found!
```

### Step 3: Notification Triggered
```
🔊 Sound Plays
🔴 Badge Appears
⭕ Pulse Animation
```

### Step 4: User Clicks Bell
```
Click 🔔
    ↓
Dropdown Opens
    ↓
Shows Alerts
```

### Step 5: User Views Alert
```
Click Alert
    ↓
Navigate to /sos-alerts/{id}
    ↓
View Full Details
```

## 📊 Real-Time Updates

### Timeline View
```
Time    Event                   UI Update
────────────────────────────────────────────
2:30:00 SOS sent from mobile   (Backend)
2:30:05 Poll #1                (No change)
2:30:15 Poll #2 - Alert found! 🔔(1)⭕ + 🔊
2:30:25 Poll #3                (No change)
2:30:30 User clicks bell       Dropdown opens
2:30:35 User views alert       Navigate to details
2:30:45 Poll #4                (Continues polling)
```

## 🎨 Color Palette

### Primary Colors
- **Error Red**: #EF4444 (Critical alerts)
- **Orange**: #F97316 (High priority)
- **Warning Yellow**: #F59E0B (Medium priority)
- **Gray**: #6B7280 (Low priority)

### Background Colors
- **Error Light**: #FEE2E2 (Critical background)
- **Orange Light**: #FFEDD5 (High background)
- **Warning Light**: #FEF3C7 (Medium background)
- **Gray Light**: #F3F4F6 (Low background)

### Agency Colors
- **Purple**: #9333EA (All agencies)
- **Green**: #10B981 (Barangay)
- **Blue**: #3B82F6 (LGU)
- **Red**: #DC2626 (BFP)
- **Indigo**: #6366F1 (PNP)
- **Orange**: #F97316 (MDRRMO)

## 📐 Dimensions

### Bell Icon
- Width: 40px (10 in Tailwind)
- Height: 40px (10 in Tailwind)
- Icon Size: 20px (5 in Tailwind)

### Badge
- Min Width: 20px (5 in Tailwind)
- Height: 20px (5 in Tailwind)
- Font Size: 12px (xs in Tailwind)

### Dropdown
- Width: 384px (96 in Tailwind)
- Max Height: 384px (96 in Tailwind)
- Border Radius: 12px (xl in Tailwind)

### Alert Item
- Padding: 16px (4 in Tailwind)
- Icon Size: 40px (10 in Tailwind)
- Gap: 12px (3 in Tailwind)

## 🖱️ Interactive Elements

### Hover States
```
Bell Icon:
  Normal:  bg-white text-gray-700
  Hover:   bg-error-50 text-error-600

Alert Item:
  Normal:  bg-white
  Hover:   bg-gray-50

View Button:
  Normal:  text-brand-600
  Hover:   bg-brand-50
```

### Click States
```
Bell Icon:
  Click → Toggle dropdown

Alert Item:
  Click → Navigate to details

View All Button:
  Click → Navigate to /sos-alerts

Clear All Button:
  Click → Clear notifications
```

## 📱 Responsive Breakpoints

### Desktop (lg: 1024px+)
```
┌────────────────────────────────────────┐
│ ☰  SafeHaven        🔔(3)⭕  👤       │
│                                        │
│  [Full width content]                  │
└────────────────────────────────────────┘
```

### Tablet (md: 768px - 1023px)
```
┌──────────────────────────────┐
│ ☰  SafeHaven  🔔(3)⭕  ⋮    │
│                              │
│  [Adjusted content]          │
└──────────────────────────────┘
```

### Mobile (< 768px)
```
┌─────────────────────────┐
│ ☰  Logo  🔔(3)⭕  ⋮    │
│                         │
│  [Mobile content]       │
└─────────────────────────┘
```

---

## 🎯 Visual Summary

The SOS notification system provides clear, immediate visual feedback with:
- ✅ Prominent bell icon in header
- ✅ Attention-grabbing red badge
- ✅ Pulsing animation for urgency
- ✅ Clean dropdown with alert previews
- ✅ Color-coded priorities
- ✅ Agency-specific icons
- ✅ Smooth animations and transitions

All designed for maximum visibility and quick response! 🚀
