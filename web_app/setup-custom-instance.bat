@echo off
REM Dubai Filmmaker CMS - Custom Instance Setup Script
REM This script helps you set up with YOUR OWN database and bucket names

echo ========================================
echo Dubai Filmmaker CMS - Custom Setup
echo ========================================
echo.
echo This script will help you create:
echo - Cloudflare D1 Database (your custom name)
echo - Cloudflare R2 Bucket (your custom name)
echo - Admin user
echo - Environment configuration
echo.

REM Check if wrangler is installed
where wrangler >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Wrangler CLI not found!
    echo Please install it first: npm install -g wrangler
    pause
    exit /b 1
)

echo ========================================
echo Step 1: Choose Your Names
echo ========================================
echo.
echo Naming rules:
echo - Lowercase letters, numbers, and hyphens only
echo - No spaces or special characters
echo - Must be unique across Cloudflare
echo.

set /p DB_NAME="Enter your database name (e.g., my-portfolio-db): "
if "%DB_NAME%"=="" (
    echo [ERROR] Database name cannot be empty!
    pause
    exit /b 1
)

set /p BUCKET_NAME="Enter your bucket name (e.g., my-media-assets): "
if "%BUCKET_NAME%"=="" (
    echo [ERROR] Bucket name cannot be empty!
    pause
    exit /b 1
)

echo.
echo You chose:
echo Database: %DB_NAME%
echo Bucket:   %BUCKET_NAME%
echo.
set /p CONFIRM="Is this correct? (y/n): "
if /i not "%CONFIRM%"=="y" (
    echo Setup cancelled.
    pause
    exit /b 0
)

echo.
echo ========================================
echo Step 2: Cloudflare Authentication
echo ========================================
echo.
wrangler whoami
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Not logged in. Opening browser for authentication...
    wrangler login
)

echo.
echo Please copy your Account ID from above.
set /p ACCOUNT_ID="Enter your Cloudflare Account ID: "

echo.
echo ========================================
echo Step 3: Create D1 Database
echo ========================================
echo.
echo Creating database '%DB_NAME%'...
wrangler d1 create %DB_NAME%

echo.
echo [IMPORTANT] Copy the database_id from above!
set /p DATABASE_ID="Enter the database_id: "

echo.
echo ========================================
echo Step 4: Update wrangler.toml
echo ========================================
echo.
echo [ACTION REQUIRED] Please manually update wrangler.toml:
echo.
echo [[d1_databases]]
echo binding = "DB"
echo database_name = "%DB_NAME%"
echo database_id = "%DATABASE_ID%"
echo.
echo Press any key after you've updated wrangler.toml...
pause >nul

echo.
echo ========================================
echo Step 5: Apply Database Schema
echo ========================================
echo.
echo Applying projects schema...
wrangler d1 execute %DB_NAME% --remote --file=database/d1-schema.sql

echo.
echo Applying users schema...
wrangler d1 execute %DB_NAME% --remote --file=database/users-schema.sql

echo.
echo Applying header config schema...
wrangler d1 execute %DB_NAME% --remote --file=database/update-header-config.sql

echo.
echo [SUCCESS] Database schema applied!

echo.
echo ========================================
echo Step 6: Seed Sample Data (Optional)
echo ========================================
echo.
set /p SEED="Seed sample projects? (y/n): "
if /i "%SEED%"=="y" (
    echo Seeding projects...
    wrangler d1 execute %DB_NAME% --remote --file=database/insert_projects_d1.sql
    echo [SUCCESS] Sample data seeded!
)

echo.
echo ========================================
echo Step 7: Create R2 Bucket
echo ========================================
echo.
echo Creating bucket '%BUCKET_NAME%'...
wrangler r2 bucket create %BUCKET_NAME%

echo.
echo Enabling public access...
wrangler r2 bucket update %BUCKET_NAME% --public-access

echo.
echo [SUCCESS] R2 bucket created!
echo.
echo [NEXT STEPS FOR R2]
echo 1. Go to: https://dash.cloudflare.com/
echo 2. Navigate to R2 ^> %BUCKET_NAME%
echo 3. Create API Token with Read ^& Write permissions
echo 4. Copy the Access Key ID and Secret Access Key
echo 5. Get the Public Bucket URL from Settings
echo.
pause

echo.
echo ========================================
echo Step 8: R2 Configuration
echo ========================================
echo.
set /p R2_ACCESS_KEY="Enter R2 Access Key ID: "
set /p R2_SECRET_KEY="Enter R2 Secret Access Key: "
set /p R2_PUBLIC_URL="Enter R2 Public URL (e.g., https://pub-xxx.r2.dev): "

echo.
echo ========================================
echo Step 9: Cloudflare API Token
echo ========================================
echo.
echo [ACTION REQUIRED] Create Cloudflare API Token:
echo 1. Go to: https://dash.cloudflare.com/profile/api-tokens
echo 2. Create Custom Token with:
echo    - Account ^> D1 ^> Edit
echo    - Account ^> Workers R2 Storage ^> Edit
echo 3. Copy the token
echo.
set /p API_TOKEN="Enter Cloudflare API Token: "

echo.
echo ========================================
echo Step 10: Generate NextAuth Secret
echo ========================================
echo.
echo Generating random secret...
for /f "delims=" %%i in ('node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"') do set NEXTAUTH_SECRET=%%i
echo Generated: %NEXTAUTH_SECRET%

echo.
echo ========================================
echo Step 11: Gmail Configuration
echo ========================================
echo.
echo [ACTION REQUIRED] Setup Gmail App Password:
echo 1. Enable 2FA: https://myaccount.google.com/security
echo 2. Create App Password: https://myaccount.google.com/apppasswords
echo 3. Copy the 16-character password
echo.
set /p GMAIL_USER="Enter Gmail address: "
set /p GMAIL_PASSWORD="Enter Gmail App Password (16 chars): "

echo.
echo ========================================
echo Step 12: Create Admin User
echo ========================================
echo.
set /p ADMIN_EMAIL="Enter admin email: "
set /p ADMIN_PASSWORD="Enter admin password: "

echo.
echo Hashing password...
for /f "delims=" %%i in ('node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('%ADMIN_PASSWORD%', 10))"') do set HASHED_PASSWORD=%%i

echo.
echo Creating admin user...
wrangler d1 execute %DB_NAME% --remote --command="INSERT INTO users (email, password, name, role) VALUES ('%ADMIN_EMAIL%', '%HASHED_PASSWORD%', 'Admin User', 'admin');"

echo.
echo [SUCCESS] Admin user created!

echo.
echo ========================================
echo Step 13: Create .env.local File
echo ========================================
echo.
echo Creating .env.local with your configuration...

(
echo # ========================================
echo # NextAuth Configuration
echo # ========================================
echo NEXTAUTH_URL=http://localhost:3000
echo NEXTAUTH_SECRET=%NEXTAUTH_SECRET%
echo.
echo # ========================================
echo # Google OAuth ^(Optional^)
echo # ========================================
echo GOOGLE_CLIENT_ID=your-google-client-id
echo GOOGLE_CLIENT_SECRET=your-google-client-secret
echo.
echo # ========================================
echo # Cloudflare R2 Storage Configuration
echo # ========================================
echo R2_ENDPOINT=https://%ACCOUNT_ID%.r2.cloudflarestorage.com
echo R2_ACCESS_KEY_ID=%R2_ACCESS_KEY%
echo R2_SECRET_ACCESS_KEY=%R2_SECRET_KEY%
echo R2_BUCKET_NAME=%BUCKET_NAME%
echo R2_PUBLIC_URL=%R2_PUBLIC_URL%
echo.
echo # ========================================
echo # Supabase ^(Optional^)
echo # ========================================
echo NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
echo SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
echo.
echo # ========================================
echo # Cloudflare D1 Database Configuration
echo # ========================================
echo CLOUDFLARE_ACCOUNT_ID=%ACCOUNT_ID%
echo CLOUDFLARE_API_TOKEN=%API_TOKEN%
echo CLOUDFLARE_DATABASE_ID=%DATABASE_ID%
echo.
echo # ========================================
echo # Cloudflare Pages Analytics
echo # ========================================
echo CLOUDFLARE_PROJECT_NAME=my-portfolio-cms
echo.
echo # ========================================
echo # Cloudflare Web Analytics ^(Optional^)
echo # ========================================
echo CLOUDFLARE_WEB_ANALYTICS_SITE_ID=your-site-id
echo.
echo # ========================================
echo # App Configuration
echo # ========================================
echo NEXT_PUBLIC_APP_URL=http://localhost:3000
echo.
echo # ========================================
echo # Email Configuration
echo # ========================================
echo EMAIL_PROVIDER=gmail
echo GMAIL_USER=%GMAIL_USER%
echo GMAIL_APP_PASSWORD=%GMAIL_PASSWORD%
) > .env.local

echo.
echo [SUCCESS] .env.local file created!

echo.
echo ========================================
echo Step 14: Save Your Configuration
echo ========================================
echo.
echo Creating configuration summary...

(
echo ========================================
echo Your Custom Configuration
echo ========================================
echo.
echo Database Name:     %DB_NAME%
echo Database ID:       %DATABASE_ID%
echo Bucket Name:       %BUCKET_NAME%
echo R2 Public URL:     %R2_PUBLIC_URL%
echo Account ID:        %ACCOUNT_ID%
echo.
echo Admin Email:       %ADMIN_EMAIL%
echo Admin Password:    %ADMIN_PASSWORD%
echo.
echo NextAuth Secret:   %NEXTAUTH_SECRET%
echo.
echo ========================================
echo KEEP THIS FILE SECURE!
echo ========================================
) > MY_CONFIGURATION.txt

echo [SUCCESS] Configuration saved to MY_CONFIGURATION.txt
echo [WARNING] Keep this file secure and do not commit to Git!

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Your custom instances have been created:
echo - Database: %DB_NAME%
echo - Bucket:   %BUCKET_NAME%
echo.
echo [NEXT STEPS]
echo.
echo 1. Install dependencies:
echo    npm install
echo.
echo 2. Start development server:
echo    npm run dev
echo.
echo 3. Login at:
echo    http://localhost:3000/auth/signin
echo.
echo 4. Use these credentials:
echo    Email:    %ADMIN_EMAIL%
echo    Password: %ADMIN_PASSWORD%
echo.
echo 5. Update package.json scripts (optional):
echo    - Replace database name in db:console
echo    - Replace bucket name in r2:list
echo.
echo For detailed instructions, see: CUSTOM_SETUP_GUIDE.md
echo.
pause
