# SafeHaven Admin Dashboard Implementation Plan

## Overview
Build a comprehensive admin dashboard for SafeHaven using the existing Next.js + Tailwind template in `web_app/`. This dashboard will allow LGU officials and administrators to manage disaster alerts, incidents, evacuation centers, and users.

---

## 🎯 Goals

### Primary Goals
1. **Alert Broadcasting** - Create and broadcast disaster alerts to mobile users
2. **Incident Management** - View, manage, and respond to incident reports
3. **Center Management** - Manage evacuation centers (CRUD operations)
4. **User Management** - Manage app users and administrators
5. **Analytics Dashboard** - View system statistics and usage metrics

### Secondary Goals
1. **Contact Management** - Manage emergency contacts
2. **Guide Management** - Manage preparedness guides
3. **SOS Monitoring** - View and respond to SOS alerts
4. **Group Management** - Monitor family/group locator usage

---

## 🏗️ Architecture

### Tech Stack (Already in Template)
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4
- **Authentication:** NextAuth.js
- **Database:** MySQL (same as backend)
- **Charts:** ApexCharts
- **Icons:** SVG icons (already in template)
- **Forms:** React Hook Form (to add)
- **Tables:** Built-in components

### Backend Integration
- **API:** Connect to existing Express backend (`http://localhost:3000/api/v1`)
- **Auth:** Use JWT tokens from backend
- **Database:** Share MySQL database with backend

---

## 📁 Project Structure

```
web_app/
├── src/
│   ├── app/
│   │   ├── (admin)/
│   │   │   ├── dashboard/          # Main dashboard
│   │   │   ├── alerts/             # Alert management
│   │   │   │   ├── page.tsx        # List alerts
│   │   │   │   ├── create/         # Create alert
│   │   │   │   └── [id]/           # Edit alert
│   │   │   ├── incidents/          # Incident management
│   │   │   │   ├── page.tsx        # List incidents
│   │   │   │   ├── [id]/           # View incident details
│   │   │   │   └── map/            # Incident heatmap
│   │   │   ├── centers/            # Evacuation centers
│   │   │   │   ├── page.tsx        # List centers
│   │   │   │   ├── create/         # Create center
│   │   │   │   └── [id]/           # Edit center
│   │   │   ├── users/              # User management
│   │   │   │   ├── page.tsx        # List users
│   │   │   │   └── [id]/           # View/edit user
│   │   │   ├── contacts/           # Emergency contacts
│   │   │   ├── guides/             # Preparedness guides
│   │   │   ├── sos/                # SOS alerts
│   │   │   ├── groups/             # Family groups
│   │   │   └── settings/           # System settings
│   │   └── api/
│   │       └── safehaven/          # API routes (proxy to backend)
│   ├── components/
│   │   └── safehaven/              # SafeHaven-specific components
│   │       ├── alerts/
│   │       ├── incidents/
│   │       ├── centers/
│   │       ├── users/
│   │       └── dashboard/
│   ├── lib/
│   │   └── safehaven-api.ts        # API client for backend
│   └── types/
│       └── safehaven.ts            # TypeScript types
```

---

## 🎨 Design System

### Colors (Philippine Flag Theme)
```typescript
// Already in mobile app, replicate in web
const colors = {
  primary: '#0038A8',    // Blue
  secondary: '#CE1126',  // Red
  accent: '#FCD116',     // Yellow
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  // ... existing template colors
}
```

### Components to Reuse from Template
- ✅ Sidebar navigation
- ✅ Header with user menu
- ✅ Cards and panels
- ✅ Tables with sorting/filtering
- ✅ Charts (ApexCharts)
- ✅ Forms and inputs
- ✅ Modals
- ✅ Buttons
- ✅ Badges

---

## 📋 Features Breakdown

### 1. Dashboard (Home Page)
**Route:** `/dashboard`

**Components:**
- Statistics cards (total alerts, incidents, users, centers)
- Recent alerts list
- Recent incidents list
- Active SOS alerts
- System health status
- Quick actions (Create Alert, View Incidents)

**Data:**
- GET `/api/v1/stats/dashboard` (to create)
- GET `/api/v1/alerts?limit=5`
- GET `/api/v1/incidents?limit=5`
- GET `/api/v1/sos?status=active`

---

### 2. Alert Management
**Routes:**
- `/alerts` - List all alerts
- `/alerts/create` - Create new alert
- `/alerts/[id]` - Edit alert

**Features:**
- **List View:**
  - Table with filters (type, severity, status, date)
  - Search by title/description
  - Pagination
  - Quick actions (edit, delete, deactivate)
  
- **Create/Edit Form:**
  - Alert type (typhoon, earthquake, flood, fire, etc.)
  - Severity (low, moderate, high, critical)
  - Title and description
  - Affected areas (location picker)
  - Radius (km)
  - Status (active/inactive)
  - Send push notification toggle
  - Send SMS toggle (future)
  
- **Broadcast:**
  - Preview alert before sending
  - Target audience selection
  - Immediate or scheduled broadcast
  - Confirmation dialog

**API Endpoints:**
- GET `/api/v1/alerts`
- POST `/api/v1/alerts`
- GET `/api/v1/alerts/:id`
- PUT `/api/v1/alerts/:id`
- DELETE `/api/v1/alerts/:id`
- POST `/api/v1/alerts/:id/broadcast` (to create)

---

### 3. Incident Management
**Routes:**
- `/incidents` - List all incidents
- `/incidents/[id]` - View incident details
- `/incidents/map` - Incident heatmap

**Features:**
- **List View:**
  - Table with filters (type, severity, status, date)
  - Search by title/location
  - Status badges (pending, in-progress, resolved)
  - Pagination
  - Export to CSV
  
- **Details View:**
  - Incident information
  - Photos gallery
  - Location on map
  - Reporter information
  - Status update form
  - Add notes/comments
  - Assign to responder
  
- **Heatmap:**
  - Google Maps with incident markers
  - Color-coded by severity
  - Filter by type and date range
  - Click marker to view details

**API Endpoints:**
- GET `/api/v1/incidents`
- GET `/api/v1/incidents/:id`
- PUT `/api/v1/incidents/:id` (update status)
- POST `/api/v1/incidents/:id/notes` (to create)

---

### 4. Evacuation Center Management
**Routes:**
- `/centers` - List all centers
- `/centers/create` - Create new center
- `/centers/[id]` - Edit center

**Features:**
- **List View:**
  - Table with search and filters
  - Status (active/inactive)
  - Capacity information
  - Location
  - Quick actions
  
- **Create/Edit Form:**
  - Center name
  - Address
  - Latitude/longitude (map picker)
  - Capacity
  - Facilities (checkboxes)
  - Contact person
  - Phone number
  - Status
  - Photos (optional)

**API Endpoints:**
- GET `/api/v1/centers`
- POST `/api/v1/centers`
- GET `/api/v1/centers/:id`
- PUT `/api/v1/centers/:id`
- DELETE `/api/v1/centers/:id`

---

### 5. User Management
**Routes:**
- `/users` - List all users
- `/users/[id]` - View/edit user

**Features:**
- **List View:**
  - Table with search
  - Filter by role (user, admin, lgu)
  - Status (active/inactive)
  - Registration date
  - Last login
  
- **Details View:**
  - User information
  - Profile details
  - Medical information
  - Emergency contacts
  - Activity log
  - Change role
  - Deactivate account

**API Endpoints:**
- GET `/api/v1/users`
- GET `/api/v1/users/:id`
- PUT `/api/v1/users/:id`
- DELETE `/api/v1/users/:id`

---

### 6. Emergency Contacts Management
**Routes:**
- `/contacts` - List all contacts
- `/contacts/create` - Create new contact
- `/contacts/[id]` - Edit contact

**Features:**
- List view with categories
- Create/edit form
- Bulk import from CSV
- Export to CSV

**API Endpoints:**
- GET `/api/v1/contacts`
- POST `/api/v1/contacts`
- PUT `/api/v1/contacts/:id`
- DELETE `/api/v1/contacts/:id`

---

### 7. Preparedness Guides Management
**Routes:**
- `/guides` - List all guides
- `/guides/create` - Create new guide
- `/guides/[id]` - Edit guide

**Features:**
- List view by category
- Rich text editor for content
- Preview mode
- Publish/unpublish

**Note:** Currently guides are hardcoded in mobile app. This will allow dynamic management.

---

### 8. SOS Monitoring
**Routes:**
- `/sos` - List all SOS alerts
- `/sos/[id]` - View SOS details

**Features:**
- Real-time SOS alerts
- Status (active, responded, resolved)
- User location on map
- Medical information
- Emergency contacts
- Response actions

**API Endpoints:**
- GET `/api/v1/sos`
- GET `/api/v1/sos/:id`
- PUT `/api/v1/sos/:id/status`

---

### 9. Analytics & Reports
**Routes:**
- `/analytics` - Analytics dashboard

**Features:**
- **Charts:**
  - Alerts over time (line chart)
  - Incidents by type (pie chart)
  - Incidents by severity (bar chart)
  - User registrations over time
  - SOS alerts by location (map)
  
- **Reports:**
  - Generate PDF reports
  - Export data to CSV
  - Date range filters

---

## 🔐 Authentication & Authorization

### Roles
1. **Super Admin** - Full access to everything
2. **LGU Admin** - Manage alerts, incidents, centers
3. **Moderator** - View and update incidents
4. **Viewer** - Read-only access

### Implementation
```typescript
// Use existing backend auth
// Add role-based middleware
// Protect routes based on role
```

---

## 🚀 Implementation Phases

### Phase 1: Setup & Authentication (Week 1)
**Tasks:**
1. Configure Next.js to connect to backend API
2. Create API client (`lib/safehaven-api.ts`)
3. Setup authentication with backend JWT
4. Create login page
5. Setup protected routes
6. Create base layout with sidebar

**Deliverables:**
- Working authentication
- Protected admin routes
- Base layout

---

### Phase 2: Dashboard & Alerts (Week 1-2)
**Tasks:**
1. Create dashboard page with statistics
2. Create alerts list page
3. Create alert creation form
4. Implement alert broadcasting
5. Add filters and search
6. Test alert flow end-to-end

**Deliverables:**
- Functional dashboard
- Complete alert management
- Alert broadcasting working

---

### Phase 3: Incident Management (Week 2)
**Tasks:**
1. Create incidents list page
2. Create incident details page
3. Implement status updates
4. Add photo gallery
5. Create incident heatmap
6. Add filters and export

**Deliverables:**
- Complete incident management
- Incident heatmap
- Status workflow

---

### Phase 4: Center & User Management (Week 2-3)
**Tasks:**
1. Create centers CRUD pages
2. Add map picker for location
3. Create users list page
4. Create user details page
5. Implement role management
6. Add user activity log

**Deliverables:**
- Complete center management
- Complete user management
- Role-based access control

---

### Phase 5: Additional Features (Week 3)
**Tasks:**
1. Create contacts management
2. Create guides management
3. Create SOS monitoring
4. Add analytics dashboard
5. Implement reports
6. Polish UI/UX

**Deliverables:**
- All features complete
- Analytics working
- Reports generation

---

### Phase 6: Testing & Deployment (Week 3)
**Tasks:**
1. End-to-end testing
2. Fix bugs
3. Performance optimization
4. Security audit
5. Deploy to production
6. Create user documentation

**Deliverables:**
- Production-ready dashboard
- Documentation
- Deployment guide

---

## 📦 Dependencies to Add

```json
{
  "dependencies": {
    "axios": "^1.6.0",           // API client
    "react-hook-form": "^7.49.0", // Form handling
    "zod": "^3.22.0",            // Validation (already installed)
    "date-fns": "^3.0.0",        // Date formatting
    "react-hot-toast": "^2.4.1", // Notifications
    "recharts": "^2.10.0"        // Additional charts (optional)
  }
}
```

---

## 🎯 Success Criteria

### Must Have
- ✅ Admin authentication working
- ✅ Alert broadcasting functional
- ✅ Incident management complete
- ✅ Center management complete
- ✅ User management complete
- ✅ Dashboard with statistics
- ✅ Responsive design

### Should Have
- ✅ Analytics dashboard
- ✅ SOS monitoring
- ✅ Contact management
- ✅ Export to CSV
- ✅ Role-based access

### Nice to Have
- ✅ Real-time updates (WebSocket)
- ✅ Email notifications
- ✅ SMS integration
- ✅ Advanced analytics
- ✅ Mobile responsive

---

## 🔧 Technical Considerations

### API Integration
```typescript
// lib/safehaven-api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Environment Variables
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_key_here
DATABASE_URL=mysql://root@localhost:3306/safehaven_db
```

### Database
- Use existing MySQL database
- Share tables with backend
- No need for separate database

---

## 📝 Next Steps

1. **Review this plan** - Confirm features and priorities
2. **Setup environment** - Configure Next.js project
3. **Start Phase 1** - Authentication and base layout
4. **Iterate** - Build features incrementally
5. **Test** - Continuous testing throughout

---

## 🤔 Questions to Clarify

1. **Priority Features:** Which features are most critical?
   - Alerts? Incidents? Centers? All equally important?

2. **User Roles:** Do you need all 4 roles or just Admin/User?

3. **Real-time Updates:** Do you want real-time dashboard updates?

4. **SMS Integration:** Should we integrate SMS for alerts now or later?

5. **Deployment:** Where will you deploy? (Vercel, Cloudflare, VPS?)

---

## 💡 Recommendations

1. **Start with Phase 1 & 2** - Get authentication and alerts working first
2. **Use existing template components** - Leverage what's already built
3. **Keep it simple** - Focus on core features first
4. **Test with real data** - Use actual backend API
5. **Iterate quickly** - Get feedback early and often

---

**Ready to start?** Let me know if you want to:
1. Proceed with Phase 1 (Setup & Authentication)
2. Modify the plan
3. Focus on specific features first
4. Something else?

I'm ready to build this! 🚀
