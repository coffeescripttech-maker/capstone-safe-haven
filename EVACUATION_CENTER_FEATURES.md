# Evacuation Center Features - Mobile App

## Overview
The mobile app includes a comprehensive Evacuation Center feature that helps citizens find and get information about nearby evacuation centers during emergencies.

## Main Features

### 1. **Centers List View** (`CentersListScreen.tsx`)
Displays all evacuation centers in a scrollable list format.

#### Features:
- **📱 List Display**: Shows all evacuation centers with key information
- **🔄 Pull to Refresh**: Swipe down to reload centers
- **📍 Location-Based Sorting**: Centers sorted by distance from user's location
- **🗺️ Map Toggle**: Button in header to switch to map view
- **📡 Offline Support**: 
  - Caches center data for offline viewing
  - Shows "Offline - Showing cached data" indicator
  - Displays last update timestamp (e.g., "Last updated 5m ago")
- **🔍 Smart Filtering**: Filters out invalid/incomplete center data
- **📊 Center Cards**: Each card shows:
  - Center name
  - Address (Barangay, City, Province)
  - Capacity status (Available/Full)
  - Current occupancy (e.g., "50 / 200 people")
  - Distance from user location

### 2. **Centers Map View** (`CentersMapScreen.tsx`)
Interactive map showing all evacuation centers with visual indicators.

#### Features:
- **🗺️ Interactive Map**: Google Maps integration
- **📍 Color-Coded Markers**:
  - 🟢 Green: Available (< 80% capacity)
  - 🟠 Orange: Nearly Full (80-99% capacity)
  - 🔴 Red: Full (100% capacity)
- **📍 User Location**: Shows your current position on map
- **🎯 Radius Circle**: 5km radius circle around user location
- **🔘 My Location Button**: Quickly center map on your location
- **📋 List View Toggle**: Switch back to list view
- **💬 Center Preview Card**: 
  - Tap marker to see quick info
  - Shows name, address, capacity, status
  - "View Details" button for full information
- **🔍 Auto-Zoom**: Automatically zooms to selected center

### 3. **Center Details View** (`CenterDetailsScreen.tsx`)
Comprehensive information about a specific evacuation center.

#### Features:
- **🗺️ Map Preview**: Shows center location on embedded map
- **📍 Location Information**:
  - Full address
  - Barangay
  - City and Province
- **👥 Capacity Details**:
  - Current occupancy vs total capacity
  - Percentage full
  - Visual progress bar with color coding
  - Status badge (Available/Full)
- **🏢 Facilities Available**:
  - Medical facilities
  - Food services
  - Water supply
  - Restrooms
  - Power/Electricity
  - WiFi
  - Shelter
  - Security
  - Displayed as chips with icons
- **📞 Contact Information**:
  - Contact person name
  - Phone number
- **🎯 Action Buttons**:
  - **📞 Call Button**: Direct call to center
  - **🧭 Directions Button**: Opens Google Maps for navigation

### 4. **Home Screen Integration**
Shows nearest evacuation center on the home screen.

#### Features:
- **📍 Nearest Center Card**: Quick access to closest center
- **🚀 One-Tap Navigation**: Tap to view full details
- **📊 Quick Status**: Shows availability at a glance

## Technical Features

### Offline Capabilities
- **💾 Data Caching**: Centers cached locally using AsyncStorage
- **⏰ Cache Expiry**: Configurable cache duration
- **🔄 Smart Sync**: Auto-updates when online
- **📡 Offline Indicator**: Clear visual feedback when offline

### Location Services
- **📍 GPS Integration**: Uses device GPS for accurate location
- **🎯 Distance Calculation**: Calculates distance to each center
- **🔄 Auto-Update**: Updates when user location changes
- **🔐 Permission Handling**: Requests location permission gracefully

### Data Validation
- **✅ Input Validation**: Filters out incomplete/invalid centers
- **🛡️ Error Handling**: Graceful error messages
- **🔍 Data Integrity**: Ensures all required fields present

### Performance
- **⚡ Fast Loading**: Loads cached data first, then updates
- **🎨 Smooth Animations**: Smooth map transitions
- **📱 Responsive UI**: Works on all screen sizes
- **🔄 Efficient Updates**: Only updates when necessary

## User Flow

### Finding a Center:
1. Open app → Navigate to "Centers" tab
2. View list of centers OR switch to map view
3. See centers sorted by distance
4. Tap on a center to view details

### Getting Directions:
1. Open center details
2. Tap "Directions" button
3. Opens Google Maps with route

### Calling a Center:
1. Open center details
2. Tap "Call" button
3. Direct call to center contact number

### Offline Usage:
1. Load centers while online (auto-cached)
2. Go offline
3. Still view cached center information
4. See "Offline" indicator
5. Reconnect to update data

## Data Structure

### Evacuation Center Object:
```typescript
{
  id: number;
  name: string;
  address: string;
  barangay: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
  capacity: number;
  currentOccupancy: number;
  occupancyPercentage: number;
  isFull: boolean;
  facilities: string[];  // ['medical', 'food', 'water', etc.]
  contactPerson: string;
  contactNumber: string;
}
```

## Benefits

✅ **Quick Access**: Find nearest center in seconds
✅ **Real-Time Info**: See current capacity and availability
✅ **Offline Ready**: Works without internet connection
✅ **Easy Navigation**: One-tap directions to center
✅ **Complete Info**: All details in one place
✅ **Visual Indicators**: Color-coded status for quick understanding
✅ **Multiple Views**: List and map views for preference
✅ **Contact Ready**: Direct call functionality

## Use Cases

1. **During Emergency**: Quickly find nearest available center
2. **Planning**: Check capacity before heading to center
3. **Information**: Get contact details and facilities info
4. **Navigation**: Get directions to center location
5. **Offline**: Access cached data when network unavailable

## Future Enhancements (Potential)

- 🔔 Push notifications when center near you opens
- 📊 Historical occupancy data
- 🗓️ Reservation system
- 💬 Real-time updates via WebSocket
- 📸 Photos of facilities
- ⭐ User reviews and ratings
- 🚨 Emergency alerts for center status changes
