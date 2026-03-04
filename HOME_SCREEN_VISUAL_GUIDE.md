# 📱 Home Screen Visual Guide

## New Layout

```
╔═══════════════════════════════════════╗
║  SafeHaven                      [≡]   ║
╠═══════════════════════════════════════╣
║                                       ║
║  ┌─────────────────────────────────┐ ║
║  │  🕐 10:45:32 AM                 │ ║  ← NEW: Real-time clock
║  │  Wednesday, March 4, 2026       │ ║  ← NEW: Full date
║  │  ─────────────────────────────  │ ║
║  │  📍 Current Location            │ ║  ← NEW: Location header
║  │  Cebu City, Philippines         │ ║  ← NEW: Location name
║  │  10.315700°N, 123.885400°E      │ ║  ← NEW: Coordinates
║  └─────────────────────────────────┘ ║
║                                       ║
║  ┌─────────────────────────────────┐ ║
║  │  🛡️  Hello, Juan! 👋            │ ║
║  │  ✨ Stay safe and informed      │ ║
║  └─────────────────────────────────┘ ║
║                                       ║
║  ┌─────────────────────────────────┐ ║
║  │  🚨 CRITICAL ALERTS             │ ║
║  │  Typhoon Warning - Signal #3    │ ║
║  └─────────────────────────────────┘ ║
║                                       ║
║  ┌──────────────┐  ┌──────────────┐ ║
║  │  ⚠️  3       │  │  🏢  1       │ ║
║  │  Active      │  │  Nearest     │ ║
║  │  Alerts      │  │  Center      │ ║
║  └──────────────┘  └──────────────┘ ║
║                                       ║
║  Nearest Evacuation Center            ║
║  ┌─────────────────────────────────┐ ║
║  │  🏢 Cebu City Sports Complex    │ ║
║  │  Cebu City, Cebu         2.3 km │ ║
║  │  150 / 500 occupied             │ ║
║  │  ▓▓▓▓▓░░░░░ 30%                │ ║
║  └─────────────────────────────────┘ ║
║                                       ║
║  Quick Actions                        ║
║  ┌────┐ ┌────┐ ┌────┐              ║
║  │ ⚠️ │ │ 🏢 │ │ 📖 │              ║
║  │View│ │Find│ │Guid│              ║
║  │Alrt│ │Cntr│ │es  │              ║
║  └────┘ └────┘ └────┘              ║
║                                       ║
╚═══════════════════════════════════════╝
```

---

## Widget Details

### Date/Time/Location Widget

```
┌─────────────────────────────────────┐
│                                     │
│  🕐 10:45:32 AM          ← Large   │
│     ↑                               │
│     Primary color (blue)            │
│     36px, bold                      │
│                                     │
│  Wednesday, March 4, 2026           │
│  ↑                                  │
│  Secondary color (gray)             │
│  16px, medium                       │
│                                     │
│  ─────────────────────────────      │  ← Divider
│                                     │
│  📍 Current Location    ← Icon      │
│     ↑                               │
│     Primary color label             │
│                                     │
│  Cebu City, Philippines             │
│  ↑                                  │
│  Dark text, 16px                    │
│                                     │
│  10.315700°N, 123.885400°E          │
│  ↑                                  │
│  Monospace, 12px, gray              │
│                                     │
└─────────────────────────────────────┘
```

---

## Color Scheme

### Time Display
```
Color: #3B82F6 (Primary Blue)
Size: 36px
Weight: 800 (Extra Bold)
```

### Date Display
```
Color: #6B7280 (Gray)
Size: 16px
Weight: 500 (Medium)
```

### Location Label
```
Color: #3B82F6 (Primary Blue)
Size: 14px
Weight: 600 (Semi-Bold)
```

### Location Text
```
Color: #1F2937 (Dark Gray)
Size: 16px
Weight: 500 (Medium)
```

### Coordinates
```
Color: #6B7280 (Gray)
Size: 12px
Font: Monospace
```

---

## Spacing

```
Widget Card:
  Margin: 16px (all sides)
  Padding: 20px
  Border Radius: 20px

Internal Spacing:
  Time → Date: 8px
  Date → Divider: 16px
  Divider → Location: 16px
  Location Label → Text: 8px
  Location Text → Coordinates: 8px
```

---

## States

### 1. Normal State (Location Enabled)

```
┌─────────────────────────────────┐
│  10:45:32 AM                    │
│  Wednesday, March 4, 2026       │
│  ─────────────────────────────  │
│  📍 Current Location            │
│  Cebu City, Philippines         │
│  10.315700°N, 123.885400°E      │
└─────────────────────────────────┘
```

### 2. Location Disabled State

```
┌─────────────────────────────────┐
│  10:45:32 AM                    │
│  Wednesday, March 4, 2026       │
│  ─────────────────────────────  │
│  ┌───────────────────────────┐ │
│  │ 📍 Enable location to see │ │
│  │    your current position  │ │
│  └───────────────────────────┘ │
│         ↑ Tappable             │
└─────────────────────────────────┘
```

### 3. Loading State

```
┌─────────────────────────────────┐
│  10:45:32 AM                    │
│  Wednesday, March 4, 2026       │
│  ─────────────────────────────  │
│  📍 Current Location            │
│  Fetching location...           │
│  ⏳ Please wait                 │
└─────────────────────────────────┘
```

---

## Responsive Behavior

### Portrait Mode (Normal)
```
Full width widget
All text visible
Comfortable spacing
```

### Landscape Mode
```
Widget adjusts width
Text wraps if needed
Maintains readability
```

### Small Screens
```
Font sizes scale down slightly
Spacing reduces proportionally
All content remains visible
```

---

## Animation

### Time Update
```
Every 1 second:
  - Text changes smoothly
  - No flicker
  - Minimal re-render
```

### Location Update
```
When GPS changes:
  - Fade transition
  - Smooth text change
  - No jarring updates
```

---

## Accessibility

### Screen Reader
```
"Current time: 10:45:32 AM"
"Current date: Wednesday, March 4, 2026"
"Current location: Cebu City, Philippines"
"Coordinates: 10.315700 degrees North, 123.885400 degrees East"
```

### High Contrast
```
✅ Text meets WCAG AA standards
✅ Sufficient color contrast
✅ Clear visual hierarchy
```

---

## Comparison

### Before
```
┌─────────────────────────────────┐
│  Hello, Juan! 👋                │  ← First thing user sees
│  Stay safe and informed         │
├─────────────────────────────────┤
│  [Enable Location]              │
│  ...                            │
```

### After
```
┌─────────────────────────────────┐
│  10:45:32 AM                    │  ← NEW: Immediate context
│  Wednesday, March 4, 2026       │  ← NEW: Date awareness
│  📍 Cebu City, Philippines      │  ← NEW: Location awareness
├─────────────────────────────────┤
│  Hello, Juan! 👋                │
│  Stay safe and informed         │
├─────────────────────────────────┤
│  ...                            │
```

---

## User Flow

### Opening App

```
1. App launches
   ↓
2. Widget appears at top
   ↓
3. Time starts updating (1s intervals)
   ↓
4. Location loads from GPS
   ↓
5. Coordinates display
   ↓
6. User sees full context
```

### Scrolling

```
1. User scrolls down
   ↓
2. Widget scrolls off screen
   ↓
3. Time continues updating (background)
   ↓
4. User scrolls back up
   ↓
5. Widget reappears with current time
```

---

## Summary

### Visual Hierarchy

```
1. Time (Largest, Primary Color)
2. Date (Medium, Secondary Color)
3. Location Label (Small, Primary Color)
4. Location Text (Medium, Dark)
5. Coordinates (Smallest, Monospace)
```

### Information Priority

```
High:    Current Time
High:    Current Date
Medium:  Location Name
Low:     Exact Coordinates
```

### User Benefits

```
✅ Immediate time awareness
✅ Date context at a glance
✅ Location verification
✅ Professional appearance
✅ Emergency preparedness
```

---

**Status**: ✅ Design Complete  
**Date**: March 4, 2026  
**Feature**: Home Screen Enhancement

