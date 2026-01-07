# Dubai Filmmaker CMS - Project Setup Guide

## 🚀 Complete Project Management System with Authentication

This is a production-ready CMS built with Next.js 16, NextAuth.js, and Cloudflare D1 database featuring:

- ✅ **Full Authentication System** (Login/Logout with session management)
- ✅ **Protected Routes** (Middleware-based route protection)
- ✅ **Project Management** (Complete CRUD operations)
- ✅ **Cloudflare D1 Integration** (Serverless SQLite database)
- ✅ **Modern UI Components** (TailwindCSS with dark mode)
- ✅ **TypeScript** (Full type safety)
- ✅ **Production Ready** (Optimized for deployment)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Cloudflare account (for D1 database)
- Wrangler CLI (`npm install -g wrangler`)

## 🛠️ Installation & Setup

### 1. Install Dependencies

```bash
cd final_cms
npm install
```

### 2. Environment Configuration

Update `.env.local` with your configuration:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Database Setup (Cloudflare D1)

```bash
# Setup D1 database
npm run db:setup

# Apply database schema
npm run db:migrate

# Seed with sample data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` and sign in with demo credentials:
- **Admin**: `admin@example.com` / `admin123`
- **User**: `user@example.com` / `user123`

## 🎯 Features Overview

### Authentication System
- **NextAuth.js** integration with credentials and Google OAuth
- **Protected routes** with middleware
- **Role-based access** (admin/user roles)
- **Session management** with JWT tokens
- **Secure logout** functionality

### Project Management
- **Full CRUD operations** (Create, Read, Update, Delete)
- **Advanced filtering** (by category, status, featured)
- **Search functionality** across projects
- **Image management** with Cloudinary integration
- **Video integration** with Vimeo
- **Credits system** for team members
- **Order management** for project display
- **Status management** (published/draft, featured)

### Database Schema
```sql
projects (
  id, title, client, category, data_cat, languages,
  classification, vimeo_id, video_url, poster_image,
  credits, order_index, is_featured, is_published,
  created_at, updated_at
)
```

### UI Components
- **Responsive design** (mobile-first)
- **Dark/Light mode** toggle
- **Loading states** and error handling
- **Form validation** and user feedback
- **Data tables** with sorting and pagination
- **Modal dialogs** for forms
- **Toast notifications** for actions

## 📁 Project Structure

```
final_cms/
├── src/
│   ├── app/
│   │   ├── (admin)/           # Protected admin routes
│   │   │   └── projects/      # Project management page
│   │   ├── (auth)/           # Authentication pages
│   │   └── api/              # API routes
│   │       └── projects/     # Project CRUD endpoints
│   ├── components/
│   │   ├── auth/             # Authentication components
│   │   ├── projects/         # Project management components
│   │   ├── form/             # Reusable form components
│   │   └── ui/               # UI components library
│   ├── context/              # React contexts
│   ├── lib/                  # Utilities and configurations
│   └── middleware.ts         # Route protection
├── database/                 # Database schemas and migrations
└── scripts/                  # Setup and deployment scripts
```

## 🔧 API Endpoints

### Projects API
- `GET /api/projects` - List all projects with filtering
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get single project
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Authentication API
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signout` - Sign out user
- `GET /api/auth/session` - Get current session

## 🚀 Deployment

### Cloudflare Pages + D1

1. **Connect to Cloudflare Pages**:
   ```bash
   wrangler pages project create dubai-filmmaker-cms
   ```

2. **Deploy with D1 binding**:
   ```bash
   wrangler pages deploy --project-name=dubai-filmmaker-cms
   ```

3. **Set environment variables** in Cloudflare dashboard

### Vercel (Alternative)

1. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

2. **Configure environment variables** in Vercel dashboard

## 🔐 Security Features

- **CSRF protection** with NextAuth.js
- **SQL injection prevention** with parameterized queries
- **XSS protection** with input sanitization
- **Route protection** with middleware
- **Session security** with secure cookies
- **Environment variable protection**

## 📊 Database Management

### Available Commands
```bash
npm run db:setup     # Create D1 database
npm run db:migrate   # Apply schema changes
npm run db:seed      # Insert sample data
npm run db:studio    # View database info
```

### Manual Database Operations
```bash
# Execute custom SQL
wrangler d1 execute dubai-filmmaker-cms --command="SELECT * FROM projects"

# Backup database
wrangler d1 export dubai-filmmaker-cms --output=backup.sql
```

## 🎨 Customization

### Adding New Fields
1. Update database schema in `database/d1-schema.sql`
2. Update TypeScript types in `src/lib/db.ts`
3. Update API endpoints in `src/app/api/projects/`
4. Update UI components in `src/components/projects/`

### Styling
- **TailwindCSS** configuration in `tailwind.config.ts`
- **Custom themes** in `src/app/globals.css`
- **Component styles** in individual component files

## 🐛 Troubleshooting

### Common Issues

1. **Database connection errors**:
   - Verify D1 database ID in `wrangler.toml`
   - Check Cloudflare authentication: `wrangler whoami`

2. **Authentication issues**:
   - Verify `NEXTAUTH_SECRET` is set
   - Check `NEXTAUTH_URL` matches your domain

3. **Build errors**:
   - Clear Next.js cache: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

### Development Tips

- Use `console.log` in API routes for debugging
- Check browser Network tab for API call issues
- Use React DevTools for component state debugging
- Monitor Cloudflare dashboard for D1 database metrics

## 📈 Performance Optimization

- **Image optimization** with Next.js Image component
- **Code splitting** with dynamic imports
- **Caching** with SWR or React Query (can be added)
- **Database indexing** for faster queries
- **CDN integration** with Cloudflare

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

---

## 🎉 You're Ready!

Your Dubai Filmmaker CMS is now fully functional with:
- ✅ Secure authentication system
- ✅ Complete project management
- ✅ Production-ready database
- ✅ Modern, responsive UI
- ✅ Full CRUD operations

Start managing your film projects! 🎬