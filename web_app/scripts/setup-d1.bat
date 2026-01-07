@echo off
echo 🚀 Setting up Cloudflare D1 Database for Dubai Filmmaker CMS

REM Check if wrangler is installed
wrangler --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Wrangler CLI not found. Please install it first:
    echo npm install -g wrangler
    exit /b 1
)

REM Login to Cloudflare (if not already logged in)
echo 🔐 Checking Cloudflare authentication...
wrangler whoami
if %errorlevel% neq 0 (
    echo Please login to Cloudflare:
    wrangler login
)

REM Create D1 database
echo 📊 Creating D1 database...
wrangler d1 create dubai-filmmaker-cms

echo ✅ Database created! Please update your wrangler.toml with the database_id from above.
echo.
echo 📝 Next steps:
echo 1. Copy the database_id from above and update wrangler.toml
echo 2. Run: npm run db:migrate
echo 3. Run: npm run db:seed
echo.
echo 🔧 Available commands:
echo   npm run db:migrate  - Apply database schema
echo   npm run db:seed     - Insert sample data
echo   npm run db:studio   - Open D1 database studio