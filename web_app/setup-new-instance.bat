@echo off
REM Dubai Filmmaker CMS - Fresh Instance Setup Script
REM This script helps you set up new Cloudflare instances

echo ========================================
echo Dubai Filmmaker CMS - Fresh Setup
echo ========================================
echo.

REM Check if wrangler is installed
where wrangler >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Wrangler CLI not found!
    echo Please install it first: npm install -g wrangler
    pause
    exit /b 1
)

echo [1/7] Checking Cloudflare authentication...
wrangler whoami
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [INFO] Not logged in. Opening browser for authentication...
    wrangler login
)

echo.
echo ========================================
echo Step 1: Get Account ID
echo ========================================
echo.
echo Please copy your Account ID from the output above.
echo You'll need it for the .env.local file.
echo.
set /p ACCOUNT_ID="Enter your Cloudflare Account ID: "

echo.
echo ========================================
echo Step 2: Create D1 Database
echo ========================================
echo.
set /p CREATE_DB="Create new D1 database? (y/n): "
if /i "%CREATE_DB%"=="y" (
    echo Creating database 'dubai-filmmaker-cms'...
    wrangler d1 create dubai-filmmaker-cms
    echo.
    echo [IMPORTANT] Copy the database_id from above!
    echo.
    set /p DATABASE_ID="Enter the database_id: "
    
    echo.
    echo Updating wrangler.toml...
    REM Note: Manual update required for wrangler.toml
    echo [ACTION REQUIRED] Please update wrangler.toml with:
    echo database_id = "%DATABASE_ID%"
    echo.
    pause
)

echo.
echo ========================================
echo Step 3: Create R2 Bucket
echo ========================================
echo.
set /p CREATE_R2="Create new R2 bucket? (y/n): "
if /i "%CREATE_R2%"=="y" (
    echo Creating bucket 'dubai-filmmaker-assets'...
    wrangler r2 bucket create dubai-filmmaker-assets
    
    echo.
    echo Enabling public access...
    wrangler r2 bucket update dubai-filmmaker-assets --public-access
    
    echo.
    echo [SUCCESS] R2 bucket created!
    echo.
    echo [NEXT STEPS]
    echo 1. Go to: https://dash.cloudflare.com/
    echo 2. Navigate to R2 ^> dubai-filmmaker-assets
    echo 3. Create API Token with Read ^& Write permissions
    echo 4. Copy the Access Key ID and Secret Access Key
    echo 5. Get the Public Bucket URL from Settings
    echo.
    pause
)

echo.
echo ========================================
echo Step 4: Apply Database Schema
echo ========================================
echo.
set /p APPLY_SCHEMA="Apply database schema? (y/n): "
if /i "%APPLY_SCHEMA%"=="y" (
    echo Applying projects schema...
    wrangler d1 execute dubai-filmmaker-cms --remote --file=database/d1-schema.sql
    
    echo.
    echo Applying users schema...
    wrangler d1 execute dubai-filmmaker-cms --remote --file=database/users-schema.sql
    
    echo.
    echo Applying header config schema...
    wrangler d1 execute dubai-filmmaker-cms --remote --file=database/update-header-config.sql
    
    echo.
    echo [SUCCESS] Database schema applied!
)

echo.
echo ========================================
echo Step 5: Seed Sample Data
echo ========================================
echo.
set /p SEED_DATA="Seed sample projects? (y/n): "
if /i "%SEED_DATA%"=="y" (
    echo Seeding projects...
    wrangler d1 execute dubai-filmmaker-cms --remote --file=database/insert_projects_d1.sql
    
    echo.
    echo [SUCCESS] Sample data seeded!
)

echo.
echo ========================================
echo Step 6: Generate NextAuth Secret
echo ========================================
echo.
echo Generating random secret...
node -e "console.log('NEXTAUTH_SECRET=' + require('crypto').randomBytes(32).toString('base64'))"
echo.
echo [ACTION REQUIRED] Copy the secret above and add it to .env.local
echo.
pause

echo.
echo ========================================
echo Step 7: Create Admin User
echo ========================================
echo.
echo [INFO] You need to hash your password first.
echo.
set /p ADMIN_EMAIL="Enter admin email (default: admin@example.com): "
if "%ADMIN_EMAIL%"=="" set ADMIN_EMAIL=admin@example.com

set /p ADMIN_PASSWORD="Enter admin password: "

echo.
echo Hashing password...
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('%ADMIN_PASSWORD%', 10))" > temp_hash.txt
set /p HASHED_PASSWORD=<temp_hash.txt
del temp_hash.txt

echo.
echo Creating admin user...
wrangler d1 execute dubai-filmmaker-cms --remote --command="INSERT INTO users (email, password, name, role) VALUES ('%ADMIN_EMAIL%', '%HASHED_PASSWORD%', 'Admin User', 'admin');"

echo.
echo [SUCCESS] Admin user created!
echo Email: %ADMIN_EMAIL%
echo Password: %ADMIN_PASSWORD%
echo.
echo [IMPORTANT] Save these credentials securely!
echo.
pause

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo [NEXT STEPS]
echo.
echo 1. Create Cloudflare API Token:
echo    - Go to: https://dash.cloudflare.com/profile/api-tokens
echo    - Create token with D1 and R2 permissions
echo.
echo 2. Create R2 API Token:
echo    - Go to: https://dash.cloudflare.com/
echo    - Navigate to R2 ^> Manage R2 API Tokens
echo    - Create token for dubai-filmmaker-assets bucket
echo.
echo 3. Setup Gmail App Password:
echo    - Go to: https://myaccount.google.com/apppasswords
echo    - Create app password for "Dubai Filmmaker CMS"
echo.
echo 4. Update .env.local with all credentials
echo.
echo 5. Test the setup:
echo    npm run dev
echo.
echo 6. Login at: http://localhost:3000/auth/signin
echo.
echo For detailed instructions, see: FRESH_SETUP_GUIDE.md
echo.
pause
