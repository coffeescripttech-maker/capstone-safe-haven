# 🗄️ Database Setup Guide - Local vs Remote

## Understanding D1 Database Modes

Cloudflare D1 supports two modes:

### 🏠 Local Database (Development)
- Stored in `.wrangler/state/v3/d1`
- Fast for development
- No internet required
- Data is isolated to your machine

### ☁️ Remote Database (Production/Testing)
- Stored on Cloudflare's edge network
- Accessible from anywhere
- Persistent across deployments
- **Recommended for testing and production**

---

## 🚀 Quick Setup (Remote Database)

Since you want to test with the remote database, use these commands:

### 1. Apply Schema to Remote Database
```bash
npm run db:migrate
```

### 2. Seed with Sample Data
```bash
npm run db:seed
```

### 3. Verify Data
```bash
npm run db:console
```

---

## 📋 Available Commands

### Remote Database (Default - Recommended for Testing)
```bash
npm run db:migrate          # Apply schema to remote database
npm run db:seed             # Seed remote database with sample data
npm run db:console          # Query remote database
```

### Local Database (Development Only)
```bash
npm run db:migrate:local    # Apply schema to local database
npm run db:seed:local       # Seed local database
npm run db:console:local    # Query local database
```

### Management Commands
```bash
npm run db:studio           # View database info
npm run r2:setup            # Setup R2 storage
npm run r2:list             # List R2 objects
```

---

## 🔧 Manual Database Operations

### Execute Custom SQL on Remote Database
```bash
wrangler d1 execute dubai-filmmaker-cms --remote --command="SELECT * FROM projects;"
```

### Execute SQL File on Remote Database
```bash
wrangler d1 execute dubai-filmmaker-cms --remote --file="./database/custom-query.sql"
```

### Backup Remote Database
```bash
wrangler d1 export dubai-filmmaker-cms --remote --output=backup.sql
```

### View All Tables
```bash
wrangler d1 execute dubai-filmmaker-cms --remote --command="SELECT name FROM sqlite_master WHERE type='table';"
```

---

## 🎯 Current Setup Status

Based on your migration output:
- ✅ Database ID: `908f42f0-ad4d-4ce0-b3a2-9bb13cf54795`
- ✅ Schema applied successfully (18 commands executed)
- 📍 Currently using: **Local database**

### To Switch to Remote:
Simply run the commands without `--local` flag (they use remote by default now):

```bash
# This will use the REMOTE database
npm run db:migrate
npm run db:seed
```

---

## 🔍 Verify Your Setup

After running the remote migration and seed:

```bash
# Check if data exists in remote database
npm run db:console
```

You should see your sample projects listed!

---

## 💡 Best Practices

1. **Development**: Use local database for fast iteration
2. **Testing**: Use remote database to test real-world scenarios
3. **Production**: Always use remote database
4. **Backups**: Regularly backup your remote database

---

## 🐛 Troubleshooting

### "Resource location: local" message
This means you're using the local database. Add `--remote` flag or use the default commands (which now use remote by default).

### Authentication errors
```bash
wrangler login
```

### View database location
```bash
wrangler d1 info dubai-filmmaker-cms
```

---

## 🎉 You're Ready!

Your database is now configured to use the **remote Cloudflare D1 database** by default, which is perfect for testing and production!