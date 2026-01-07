# SafeHaven Admin Dashboard - Setup Guide

## Phase 1: Setup & Authentication - COMPLETE ✅

### What We've Built

1. **API Client** (`src/lib/safehaven-api.ts`)
   - Axios instance configured for backend
   - Auth interceptors for JWT tokens
   - API methods for all endpoints

2. **TypeScript Types** (`src/types/safehaven.ts`)
   - All SafeHaven data types
   - API response types
   - Enums for alert types, severities, etc.

3. **Auth Context** (`src/context/SafeHavenAuthContext.tsx`)
   - User authentication state
   - Login/logout functions
   - Token management

4. **Login Page** (`src/app/(full-width-pages)/auth/login/page.tsx`)
   - Beautiful login UI
   - Form validation
   - Loading states
   - Demo credentials display

5. **Dashboard Page** (`src/app/(admin)/dashboard/page.tsx`)
   - Statistics cards
   - Recent alerts and incidents
   - Quick actions
   - Welcome message

---

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd web_app
npm install axios react-hook-form date-fns react-hot-toast
```

Or run the batch file:
```bash
install-dependencies.bat
```

### Step 2: Configure Environment

Copy `.env.safehaven` to `.env.local`:
```bash
copy .env.safehaven .env.local
```

Edit `.env.local` and update:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_key_here
```

### Step 3: Start Backend

Make sure your Express backend is running:
```bash
cd backend
npm run dev
```

Backend should be running on `http://localhost:3000`

### Step 4: Start Admin Dashboard

```bash
cd web_app
npm run dev
```

Dashboard will run on `http://localhost:3001` (or next available port)

### Step 5: Login

Navigate to: `http://localhost:3001/auth/login`

**Demo Credentials:**
- Email: `admin@safehaven.ph`
- Password: `admin123`

(Make sure this user exists in your database)

---

## 📁 File Structure

```
web_app/
├── src/
│   ├── app/
│   │   ├── (admin)/
│   │   │   └── dashboard/
│   │   │       └── page.tsx          ✅ Dashboard home
│   │   └── (full-width-pages)/
│   │       └── auth/
│   │           └── login/
│   │               └── page.tsx      ✅ Login page
│   ├── context/
│   │   └── SafeHavenAuthContext.tsx  ✅ Auth state
│   ├── lib/
│   │   └── safehaven-api.ts          ✅ API client
│   └── types/
│       └── safehaven.ts              ✅ TypeScript types
├── .env.safehaven                    ✅ Environment template
└── install-dependencies.bat          ✅ Dependency installer
```

---

## 🔧 Backend Requirements

### Required API Endpoints

The admin dashboard expects these endpoints to exist:

#### Auth
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/profile` - Get user profile

#### Alerts
- `GET /api/v1/alerts` - List alerts
- `POST /api/v1/alerts` - Create alert
- `GET /api/v1/alerts/:id` - Get alert
- `PUT /api/v1/alerts/:id` - Update alert
- `DELETE /api/v1/alerts/:id` - Delete alert

#### Incidents
- `GET /api/v1/incidents` - List incidents
- `GET /api/v1/incidents/:id` - Get incident
- `PUT /api/v1/incidents/:id` - Update incident status

#### Centers
- `GET /api/v1/centers` - List centers
- `POST /api/v1/centers` - Create center
- `GET /api/v1/centers/:id` - Get center
- `PUT /api/v1/centers/:id` - Update center
- `DELETE /api/v1/centers/:id` - Delete center

#### Users
- `GET /api/v1/users` - List users
- `GET /api/v1/users/:id` - Get user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

#### Contacts
- `GET /api/v1/contacts` - List contacts
- `POST /api/v1/contacts` - Create contact
- `PUT /api/v1/contacts/:id` - Update contact
- `DELETE /api/v1/contacts/:id` - Delete contact

#### SOS
- `GET /api/v1/sos` - List SOS alerts
- `GET /api/v1/sos/:id` - Get SOS alert
- `PUT /api/v1/sos/:id/status` - Update SOS status

---

## 🎨 UI Components Available

From the existing template, you can use:

- **Cards** - For statistics and content
- **Tables** - For data lists
- **Forms** - For create/edit pages
- **Buttons** - Various styles
- **Modals** - For confirmations
- **Charts** - ApexCharts for analytics
- **Badges** - For status indicators
- **Inputs** - Form inputs with validation

---

## 🔐 Authentication Flow

1. User enters email/password on login page
2. Frontend calls `POST /api/v1/auth/login`
3. Backend returns JWT token and user data
4. Token saved to localStorage
5. Token added to all API requests via interceptor
6. If 401 error, user redirected to login

---

## 🧪 Testing

### Test Login
1. Go to `http://localhost:3001/auth/login`
2. Enter credentials
3. Should redirect to `/dashboard`
4. Should see welcome message with user name

### Test API Connection
1. Open browser console
2. Check for any API errors
3. Verify token in localStorage: `safehaven_token`
4. Verify user in localStorage: `safehaven_user`

---

## 🐛 Troubleshooting

### "Cannot connect to backend"
- Check backend is running on port 3000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Check CORS is enabled in backend

### "Login failed"
- Check user exists in database
- Check password is correct
- Check backend auth endpoint is working
- Check browser console for errors

### "Token invalid"
- Clear localStorage
- Login again
- Check token expiry time in backend

### "Page not found"
- Check file is in correct directory
- Check Next.js is running
- Clear `.next` folder and restart

---

## ✅ What's Working

- ✅ Login page with beautiful UI
- ✅ Authentication with backend
- ✅ Token management
- ✅ Protected routes
- ✅ Dashboard home page
- ✅ API client configured
- ✅ TypeScript types defined
- ✅ Toast notifications

---

## 🚧 Next Steps (Phase 2)

1. **Alert Management**
   - Create alerts list page
   - Create alert creation form
   - Implement alert broadcasting
   - Add filters and search

2. **Incident Management**
   - Create incidents list page
   - Create incident details page
   - Implement status updates
   - Add photo gallery

3. **Center Management**
   - Create centers CRUD pages
   - Add map picker
   - Implement search and filters

---

## 📞 Need Help?

If you encounter any issues:
1. Check this guide first
2. Check browser console for errors
3. Check backend logs
4. Verify all dependencies are installed
5. Verify backend is running

---

**Status:** Phase 1 Complete ✅
**Next:** Phase 2 - Alert Management
**Timeline:** Ready to continue!
