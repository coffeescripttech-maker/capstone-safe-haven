# Offline Mode Implementation Plan

## Overview
Implement offline functionality for SafeHaven app to ensure critical features work without internet connectivity during emergencies.

## Priority: HIGH
**Rationale:** During disasters, network connectivity is often unreliable or unavailable. Users must access critical information offline.

---

## Phase 1: Network Detection & Status

### 1.1 Network State Management
**Package:** `@react-native-community/netinfo`

**Implementation:**
```typescript
// mobile/src/store/NetworkContext.tsx
- Monitor network connectivity
- Detect connection type (wifi, cellular, none)
- Track online/offline state
- Provide network status to all components
```

**Features:**
- Real-time network status
- Connection quality detection
- Automatic reconnection handling
- Network change notifications

### 1.2 Offline Indicator UI
**Component:** `OfflineBanner`

**Features:**
- Persistent banner when offline
- Shows "You're offline" message
- Auto-hide when back online
- Non-intrusive design

---

## Phase 2: Data Caching Strategy

### 2.1 Cache Storage Structure
**Storage:** AsyncStorage + SQLite (for complex data)

```
Cache Structure:
├── alerts/
│   ├── list (last 50 alerts)
│   ├── details (viewed alerts)
│   └── timestamp
├── centers/
│   ├── list (all centers)
│   ├── nearby (within 50km)
│   └── timestamp
├── contacts/
│   ├── list (all emergency contacts)
│   └── timestamp
├── guides/
│   ├── list (all guides)
│   ├── content (full guide text)
│   └── timestamp
├── incidents/
│   ├── my_reports (user's incidents)
│   ├── pending_uploads (offline reports)
│   └── timestamp
└── user/
    ├── profile
    └── settings
```

### 2.2 Cache Management
**Features:**
- Automatic cache on data fetch
- Cache expiration (24 hours default)
- Manual cache refresh
- Cache size limits
- Clear cache option

---

## Phase 3: Offline-First Features

### 3.1 Critical Features (Must Work Offline)

#### ✅ Disaster Alerts
**Strategy:** Cache-first with background sync
```typescript
Priority: CRITICAL
Cache: Last 50 alerts
Expiry: 6 hours
Sync: Every 30 minutes when online
```

**Implementation:**
1. Load from cache immediately
2. Show cached data with timestamp
3. Fetch fresh data in background
4. Update cache when online
5. Show "Last updated X ago" indicator

#### ✅ Evacuation Centers
**Strategy:** Full offline access
```typescript
Priority: CRITICAL
Cache: All centers in database
Expiry: 7 days
Sync: Daily when online
```

**Features:**
- View all centers offline
- Search and filter offline
- View center details
- Show distance (using cached location)
- Map view with cached tiles

#### ✅ Emergency Contacts
**Strategy:** Always available offline
```typescript
Priority: CRITICAL
Cache: All contacts
Expiry: Never (manual refresh only)
Sync: On app start when online
```

**Features:**
- View all contacts offline
- Call/SMS works offline
- Search contacts offline
- No internet required

#### ✅ Preparedness Guides
**Strategy:** Full offline library
```typescript
Priority: CRITICAL
Cache: All guides with full content
Expiry: 30 days
Sync: Weekly when online
```

**Features:**
- Read all guides offline
- Search guides offline
- Share guide text offline
- No images required

#### ⚠️ Incident Reporting
**Strategy:** Queue for upload
```typescript
Priority: HIGH
Cache: Store locally, sync when online
Expiry: Never (until uploaded)
Sync: Automatic when online
```

**Features:**
- Create reports offline
- Store photos locally
- Queue for upload
- Auto-upload when online
- Show upload status
- Retry failed uploads

#### ⚠️ Family Locator
**Strategy:** Last known locations
```typescript
Priority: MEDIUM
Cache: Last known locations
Expiry: 1 hour
Sync: Real-time when online
```

**Features:**
- Show last known locations
- Display "Last seen X ago"
- Disable location sharing when offline
- Queue alerts for sending
- Show offline indicator

#### ❌ SOS Alerts
**Strategy:** Requires connectivity
```typescript
Priority: CRITICAL (but needs network)
Fallback: Show emergency numbers
```

**Features:**
- Show "Requires internet" message
- Provide alternative: Call emergency numbers
- Queue SOS for sending when online
- Show offline emergency guide

---

## Phase 4: Implementation Details

### 4.1 Cache Service
**File:** `mobile/src/services/cache.ts`

```typescript
Features:
- get(key): Get cached data
- set(key, data, expiry): Store data
- remove(key): Delete cached data
- clear(): Clear all cache
- isExpired(key): Check if cache is stale
- getTimestamp(key): Get last update time
```

### 4.2 Sync Service
**File:** `mobile/src/services/sync.ts`

```typescript
Features:
- syncAll(): Sync all data
- syncAlerts(): Sync alerts
- syncCenters(): Sync centers
- syncContacts(): Sync contacts
- syncGuides(): Sync guides
- uploadPending(): Upload queued data
- getLastSync(): Get last sync time
```

### 4.3 Offline Queue
**File:** `mobile/src/services/offlineQueue.ts`

```typescript
Features:
- addToQueue(action): Queue an action
- processQueue(): Process all queued actions
- retryFailed(): Retry failed actions
- clearQueue(): Clear all queued actions
- getQueueStatus(): Get queue statistics
```

---

## Phase 5: UI/UX Considerations

### 5.1 Offline Indicators
**Locations:**
- Top banner (persistent when offline)
- Screen headers (show last update time)
- List items (show cached indicator)
- Action buttons (disable when offline)

### 5.2 User Feedback
**Messages:**
- "You're offline. Showing cached data"
- "Last updated 2 hours ago"
- "This feature requires internet"
- "Report saved. Will upload when online"
- "X items waiting to upload"

### 5.3 Visual Cues
**Indicators:**
- Gray/muted colors for cached data
- Clock icon for timestamps
- Upload icon for pending items
- Offline badge on affected features

---

## Phase 6: Testing Strategy

### 6.1 Test Scenarios
1. **Full Offline Mode**
   - Turn off all connectivity
   - Test all features
   - Verify cached data loads
   - Check error messages

2. **Intermittent Connectivity**
   - Toggle network on/off
   - Test sync behavior
   - Verify queue processing
   - Check data consistency

3. **Slow Network**
   - Simulate 2G connection
   - Test timeout handling
   - Verify fallback to cache
   - Check user feedback

4. **Cache Expiry**
   - Test with expired cache
   - Verify refresh behavior
   - Check stale data indicators
   - Test manual refresh

5. **Storage Limits**
   - Fill cache to limit
   - Test cache eviction
   - Verify oldest data removed
   - Check performance

### 6.2 Edge Cases
- App killed while offline
- Cache corruption
- Partial sync failures
- Network timeout during sync
- Storage full
- Multiple pending uploads

---

## Phase 7: Implementation Steps

### Week 1: Foundation
**Day 1-2: Network Detection**
- [ ] Install @react-native-community/netinfo
- [ ] Create NetworkContext
- [ ] Implement network monitoring
- [ ] Create OfflineBanner component
- [ ] Test network detection

**Day 3-4: Cache Infrastructure**
- [ ] Create cache service
- [ ] Implement cache storage
- [ ] Add cache expiry logic
- [ ] Create cache utilities
- [ ] Test cache operations

**Day 5: Sync Service**
- [ ] Create sync service
- [ ] Implement background sync
- [ ] Add sync scheduling
- [ ] Test sync operations

### Week 2: Critical Features
**Day 1: Alerts Offline**
- [ ] Implement alerts caching
- [ ] Add cache-first loading
- [ ] Show last update time
- [ ] Test offline alerts

**Day 2: Centers Offline**
- [ ] Cache all centers
- [ ] Implement offline search
- [ ] Add offline maps
- [ ] Test offline centers

**Day 3: Contacts & Guides**
- [ ] Cache emergency contacts
- [ ] Cache all guides
- [ ] Implement offline search
- [ ] Test offline access

**Day 4: Incident Queue**
- [ ] Create offline queue
- [ ] Store reports locally
- [ ] Implement auto-upload
- [ ] Test queue processing

**Day 5: Family Locator**
- [ ] Cache last locations
- [ ] Show offline indicator
- [ ] Queue alerts
- [ ] Test offline behavior

### Week 3: Polish & Testing
**Day 1-2: UI/UX**
- [ ] Add offline indicators
- [ ] Implement feedback messages
- [ ] Add visual cues
- [ ] Polish animations

**Day 3-4: Testing**
- [ ] Test all offline scenarios
- [ ] Test sync behavior
- [ ] Test edge cases
- [ ] Fix bugs

**Day 5: Documentation**
- [ ] Write user guide
- [ ] Document API
- [ ] Create troubleshooting guide
- [ ] Update README

---

## Phase 8: Performance Optimization

### 8.1 Cache Optimization
- Compress cached data
- Use efficient storage format
- Implement lazy loading
- Optimize cache size

### 8.2 Sync Optimization
- Batch sync operations
- Use delta sync (only changes)
- Implement smart sync (priority-based)
- Optimize network usage

### 8.3 Storage Optimization
- Set cache size limits
- Implement LRU eviction
- Compress images
- Clean old data

---

## Phase 9: Monitoring & Analytics

### 9.1 Metrics to Track
- Offline usage time
- Cache hit rate
- Sync success rate
- Queue processing time
- Storage usage
- Network errors

### 9.2 Error Tracking
- Cache failures
- Sync failures
- Queue failures
- Storage errors
- Network timeouts

---

## Technical Requirements

### Dependencies
```json
{
  "@react-native-community/netinfo": "^11.0.0",
  "@react-native-async-storage/async-storage": "^1.21.0" (already installed),
  "react-native-sqlite-storage": "^6.0.1" (optional, for complex data)
}
```

### Storage Estimates
```
Alerts: ~500KB (50 alerts)
Centers: ~200KB (all centers)
Contacts: ~50KB (all contacts)
Guides: ~1MB (all guides with content)
Incidents: ~5MB (pending uploads with photos)
Total: ~7MB (reasonable for offline cache)
```

### Performance Targets
- Cache load time: < 100ms
- Sync time: < 5s
- Queue processing: < 10s
- Storage access: < 50ms

---

## Success Criteria

### Must Have
✅ All critical features work offline
✅ Data syncs automatically when online
✅ Clear offline indicators
✅ Pending actions queue properly
✅ No data loss during offline usage

### Should Have
✅ Smart cache management
✅ Efficient sync strategy
✅ Good user feedback
✅ Reasonable storage usage
✅ Fast cache access

### Nice to Have
✅ Offline maps
✅ Background sync
✅ Conflict resolution
✅ Advanced analytics
✅ Compression

---

## Risks & Mitigation

### Risk 1: Storage Limits
**Mitigation:** 
- Set cache size limits
- Implement LRU eviction
- Compress data
- Clean old cache

### Risk 2: Data Inconsistency
**Mitigation:**
- Use timestamps
- Implement conflict resolution
- Show data age
- Force refresh option

### Risk 3: Sync Failures
**Mitigation:**
- Retry logic
- Queue persistence
- Error handling
- User notifications

### Risk 4: Performance Impact
**Mitigation:**
- Lazy loading
- Background operations
- Efficient storage
- Optimize queries

---

## Future Enhancements

### Phase 2 (Optional)
- Offline maps with tiles
- P2P data sharing (Bluetooth/WiFi Direct)
- Mesh networking for alerts
- Advanced conflict resolution
- Differential sync
- Background sync workers

---

## Conclusion

Offline mode is essential for SafeHaven's mission. This plan ensures users can access critical disaster information even without internet connectivity.

**Estimated Timeline:** 3 weeks
**Complexity:** Medium-High
**Impact:** Very High
**Priority:** Critical for production

---

**Next Steps:**
1. Review and approve plan
2. Install dependencies
3. Start with Week 1 implementation
4. Test thoroughly
5. Deploy incrementally
