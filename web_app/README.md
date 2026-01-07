# Dubai Filmmaker Portfolio CMS

A production-ready content management system built on **TailAdmin Next.js** template, featuring full authentication, project management with CRUD operations, and Cloudflare D1 database integration.

---

## 🚀 Quick Start

### 📚 **NEW USERS: Start Here!**

**→ [`SETUP_INDEX.md`](./SETUP_INDEX.md)** - Complete documentation index

**→ [`SETUP_SUMMARY.md`](./SETUP_SUMMARY.md)** - Compare all setup options

---

## 🎯 Choose Your Setup Path

### Option 1: Quick Test (5 minutes) ⚡
Use existing configuration for testing:
```bash
npm install
npm run dev
# Login: admin@example.com / admin123
```
**→ Read:** [`QUICK_START.md`](./QUICK_START.md)

### Option 2: Fresh Setup (30-45 minutes) 🆕
Create new instances with default names:
```bash
setup-new-instance.bat
```
**→ Read:** [`FRESH_SETUP_GUIDE.md`](./FRESH_SETUP_GUIDE.md)

### Option 3: Custom Names (30-45 minutes) 🎨
Create new instances with YOUR custom names:
```bash
setup-custom-instance.bat
```
**→ Read:** [`START_HERE_CUSTOM.md`](./START_HERE_CUSTOM.md) | [`CUSTOM_SETUP_GUIDE.md`](./CUSTOM_SETUP_GUIDE.md)

---

## 📖 Documentation Quick Links

### Setup Guides
- [`SETUP_INDEX.md`](./SETUP_INDEX.md) - **Documentation index**
- [`SETUP_SUMMARY.md`](./SETUP_SUMMARY.md) - **Compare options**
- [`START_HERE_CUSTOM.md`](./START_HERE_CUSTOM.md) - Custom setup quick start
- [`CUSTOM_SETUP_GUIDE.md`](./CUSTOM_SETUP_GUIDE.md) - Detailed custom setup
- [`FRESH_SETUP_GUIDE.md`](./FRESH_SETUP_GUIDE.md) - Detailed fresh setup
- [`QUICK_START.md`](./QUICK_START.md) - Quick start (existing config)
- [`MIGRATION_CHECKLIST.md`](./MIGRATION_CHECKLIST.md) - Track your progress

### Reference
- [`QUICK_REFERENCE.md`](./QUICK_REFERENCE.md) - Essential commands
- [`MY_CUSTOM_NAMES.md`](./MY_CUSTOM_NAMES.md) - Command reference template
- [`COMPLETE_FEATURES_GUIDE.md`](./COMPLETE_FEATURES_GUIDE.md) - All features
- [`PUBLIC_API_ENDPOINTS.md`](./PUBLIC_API_ENDPOINTS.md) - API documentation

---

## 🔧 Setup Scripts

- `setup-custom-instance.bat` - Automated custom setup
- `setup-new-instance.bat` - Automated fresh setup  
- `verify-setup.bat` - Verify configuration

![TailAdmin - Next.js Dashboard Preview](./banner.png)

With TailAdmin Next.js, you get access to all the necessary dashboard UI components, elements, and pages required to build a high-quality and complete dashboard or admin panel. Whether you're building a dashboard or admin panel for a complex web application or a simple website.

TailAdmin utilizes the powerful features of **Next.js 16** and common features of Next.js such as server-side rendering (SSR), static site generation (SSG), and seamless API route integration. Combined with the advancements of **React 19** and the robustness of **TypeScript**, TailAdmin is the perfect solution to help get your project up and running quickly.

## Overview

TailAdmin provides essential UI components and layouts for building feature-rich, data-driven admin dashboards and control panels. It's built on:

* Next.js 16.x
* React 19
* TypeScript
* Tailwind CSS V4

### Quick Links

* [✨ Visit Website](https://tailadmin.com)
* [📄 Documentation](https://tailadmin.com/docs)
* [⬇️ Download](https://tailadmin.com/download)
* [🖌️ Figma Design File (Community Edition)](https://www.figma.com/community/file/1463141366275764364)
* [⚡ Get PRO Version](https://tailadmin.com/pricing)

### Demos

* [Free Version](https://nextjs-free-demo.tailadmin.com)
* [Pro Version](https://nextjs-demo.tailadmin.com)

### Other Versions

- [Next.js Version](https://github.com/TailAdmin/free-nextjs-admin-dashboard)
- [React.js Version](https://github.com/TailAdmin/free-react-tailwind-admin-dashboard)
- [Vue.js Version](https://github.com/TailAdmin/vue-tailwind-admin-dashboard)
- [Angular Version](https://github.com/TailAdmin/free-angular-tailwind-dashboard)
- [Laravel Version](https://github.com/TailAdmin/tailadmin-laravel)

## ✨ Features

### Authentication System
- ✅ NextAuth.js with credentials provider
- ✅ Google OAuth support
- ✅ Protected routes with middleware
- ✅ Session management
- ✅ Demo accounts (admin/user roles)

### Project Management
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Advanced filtering (category, status, featured, search)
- ✅ Bulk operations (edit/delete multiple projects)
- ✅ Export to CSV/JSON
- ✅ Credits system for team members
- ✅ Vimeo video integration
- ✅ Image upload with R2 storage

### Database & Storage
- ✅ **Cloudflare D1 (SQLite)** - Remote database
- ✅ **Cloudflare R2** - Object storage for images/videos
- ✅ Automated migration and seeding scripts
- ✅ Analytics tracking (schema ready)

### UI Components
- ✅ 30+ dashboard components
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Charts and data visualization
- ✅ Forms, tables, modals, alerts

## 🛠️ Installation

### Prerequisites

* Node.js 18.x or later
* Cloudflare account (for D1 database and R2 storage)
* Wrangler CLI installed globally: `npm install -g wrangler`

### Setup Steps

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**

   Copy `.env.local` and add your credentials:
   ```env
   # Get these from: wrangler whoami
   CLOUDFLARE_ACCOUNT_ID=your-account-id
   CLOUDFLARE_API_TOKEN=your-api-token
   
   # Already configured
   CLOUDFLARE_DATABASE_ID=908f42f0-ad4d-4ce0-b3a2-9bb13cf54795
   ```

3. **Database is already setup!**
   
   Your remote D1 database is already migrated and seeded with sample data.
   
   Verify: `npm run db:console`

4. **Start development server:**

   ```bash
   npm run dev
   ```

5. **Login to dashboard:**
   
   Go to: http://localhost:3000/auth/signin
   - Email: `admin@example.com`
   - Password: `admin123`

## 📚 Documentation

- [`QUICK_START.md`](./QUICK_START.md) - Get started in 2 minutes
- [`REMOTE_DB_SETUP.md`](./REMOTE_DB_SETUP.md) - Complete database setup guide
- [`DATABASE_GUIDE.md`](./DATABASE_GUIDE.md) - Database commands and operations
- [`R2_SETUP_GUIDE.md`](./R2_SETUP_GUIDE.md) - File upload configuration
- [`COMPLETE_FEATURES_GUIDE.md`](./COMPLETE_FEATURES_GUIDE.md) - Full feature overview
- [`PROJECT_SETUP.md`](./PROJECT_SETUP.md) - Original project setup notes

## 🗄️ Database Commands

```bash
# Remote database (production/testing)
npm run db:migrate          # Apply schema
npm run db:seed             # Add sample data
npm run db:console          # Query database

# Local database (development)
npm run db:migrate:local
npm run db:seed:local
npm run db:console:local

# R2 Storage
npm run r2:setup            # Create R2 bucket
npm run r2:list             # List uploaded files
```

## 🏗️ Project Structure

```
final_cms/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (admin)/           # Protected admin routes
│   │   │   └── projects/      # Project management page
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   ├── projects/      # Project CRUD operations
│   │   │   └── upload/        # File upload endpoints
│   │   └── auth/              # Authentication pages
│   ├── components/            # React components
│   │   ├── auth/              # Auth forms
│   │   ├── projects/          # Project management UI
│   │   └── upload/            # File upload components
│   ├── lib/                   # Utilities
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── d1-client.ts       # D1 database client
│   │   ├── r2-storage.ts      # R2 storage client
│   │   └── analytics.ts       # Analytics tracking
│   └── middleware.ts          # Route protection
├── database/                  # SQL schemas and migrations
├── scripts/                   # Setup and migration scripts
└── .env.local                # Environment variables
```

## 🔐 Authentication

The app uses NextAuth.js with:
- Credentials provider (email/password)
- Google OAuth (optional)
- JWT session strategy
- Protected API routes

**Demo Accounts:**
- Admin: `admin@example.com` / `admin123`
- User: `user@example.com` / `user123`

## 🎨 Components

Built on TailAdmin template with additional custom components:

* Project Management (CRUD interface)
* File Upload (drag & drop with R2 integration)
* Bulk Actions (multi-select operations)
* Export Menu (CSV/JSON export)
* Advanced Filters (category, status, search)
* Sophisticated sidebar navigation
* Data visualization (charts and tables)
* Authentication forms
* Dark mode support 🕶️

## Feature Comparison

### Free Version

* 1 Unique Dashboard
* 30+ dashboard components
* 50+ UI elements
* Basic Figma design files
* Community support

### Pro Version

* 7 Unique Dashboards: Analytics, Ecommerce, Marketing, CRM, SaaS, Stocks, Logistics (more coming soon)
* 500+ dashboard components and UI elements
* Complete Figma design file
* Email support

To learn more about pro version features and pricing, visit our [pricing page](https://tailadmin.com/pricing).

## Changelog

### Version 2.1.0 - [November 15, 2025]

* Updated to Next.js 16.x
* Fixed all reported minor bugs

### Version 2.0.2 - [March 25, 2025]

* Upgraded to Next.js 16.x for [CVE-2025-29927](https://nextjs.org/blog/cve-2025-29927) concerns
* Included overrides vectormap for packages to prevent peer dependency errors during installation.
* Migrated from react-flatpickr to flatpickr package for React 19 support

### Version 2.0.1 - [February 27, 2025]

#### Update Overview

* Upgraded to Tailwind CSS v4 for better performance and efficiency.
* Updated class usage to match the latest syntax and features.
* Replaced deprecated class and optimized styles.

#### Next Steps

* Run npm install or yarn install to update dependencies.
* Check for any style changes or compatibility issues.
* Refer to the Tailwind CSS v4 [Migration Guide](https://tailwindcss.com/docs/upgrade-guide) on this release. if needed.
* This update keeps the project up to date with the latest Tailwind improvements. 🚀

### v2.0.0 (February 2025)

A major update focused on Next.js 16 implementation and comprehensive redesign.

#### Major Improvements

* Complete redesign using Next.js 16 App Router and React Server Components
* Enhanced user interface with Next.js-optimized components
* Improved responsiveness and accessibility
* New features including collapsible sidebar, chat screens, and calendar
* Redesigned authentication using Next.js App Router and server actions
* Updated data visualization using ApexCharts for React

#### Breaking Changes

* Migrated from Next.js 14 to Next.js 16
* Chart components now use ApexCharts for React
* Authentication flow updated to use Server Actions and middleware

[Read more](https://tailadmin.com/docs/update-logs/nextjs) on this release.

### v1.3.4 (July 01, 2024)

* Fixed JSvectormap rendering issues

### v1.3.3 (June 20, 2024)

* Fixed build error related to Loader component

### v1.3.2 (June 19, 2024)

* Added ClickOutside component for dropdown menus
* Refactored sidebar components
* Updated Jsvectormap package

### v1.3.1 (Feb 12, 2024)

* Fixed layout naming consistency
* Updated styles

### v1.3.0 (Feb 05, 2024)

* Upgraded to Next.js 14
* Added Flatpickr integration
* Improved form elements
* Enhanced multiselect functionality
* Added default layout component

## License

TailAdmin Next.js Free Version is released under the MIT License.

## Support
If you find this project helpful, please consider giving it a star on GitHub. Your support helps us continue developing and maintaining this template.
#   d u b a i l - f i l m - m a k e r - w e b s i t e - p o r t f o l i o 
 
 #   d u b a i l - f i l m - m a k e r - w e b s i t e - p o r t f o l i o - c m s 
 
 #   d u b a i l - f i l m - m a k e r - w e b s i t e - p o r t f o l i o - c m s 
 
 