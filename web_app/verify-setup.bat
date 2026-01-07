@echo off
REM Dubai Filmmaker CMS - Setup Verification Script
REM This script verifies your setup is complete

echo ========================================
echo Dubai Filmmaker CMS - Setup Verification
echo ========================================
echo.

REM Check if .env.local exists
if not exist ".env.local" (
    echo [ERROR] .env.local file not found!
    echo.
    echo Please create .env.local from .env.local.template
    echo and fill in all the required values.
    echo.
    pause
    exit /b 1
)

echo [1/8] Checking .env.local file... OK
echo.

REM Check if wrangler is installed
where wrangler >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Wrangler CLI not found!
    echo Please install: npm install -g wrangler
    pause
    exit /b 1
)

echo [2/8] Checking Wrangler CLI... OK
echo.

REM Check Cloudflare authentication
echo [3/8] Checking Cloudflare authentication...
wrangler whoami >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Not logged in to Cloudflare!
    echo Please run: wrangler login
    pause
    exit /b 1
)
echo     Authenticated OK
echo.

REM Check if database exists
echo [4/8] Checking D1 database...
wrangler d1 list | findstr "dubai-filmmaker-cms" >nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Database 'dubai-filmmaker-cms' not found!
    echo Please create it: wrangler d1 create dubai-filmmaker-cms
) else (
    echo     Database exists OK
)
echo.

REM Check if R2 bucket exists
echo [5/8] Checking R2 bucket...
wrangler r2 bucket list | findstr "dubai-filmmaker-assets" >nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Bucket 'dubai-filmmaker-assets' not found!
    echo Please create it: wrangler r2 bucket create dubai-filmmaker-assets
) else (
    echo     Bucket exists OK
)
echo.

REM Check if node_modules exists
echo [6/8] Checking dependencies...
if not exist "node_modules" (
    echo [WARNING] Dependencies not installed!
    echo Please run: npm install
) else (
    echo     Dependencies installed OK
)
echo.

REM Test database connection
echo [7/8] Testing database connection...
wrangler d1 execute dubai-filmmaker-cms --remote --command="SELECT COUNT(*) FROM projects;" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Cannot query database!
    echo Schema may not be applied yet.
    echo Please run: npm run db:migrate
) else (
    echo     Database connection OK
)
echo.

REM Check if users exist
echo [8/8] Checking admin user...
wrangler d1 execute dubai-filmmaker-cms --remote --command="SELECT COUNT(*) FROM users;" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Users table not found!
    echo Please apply schema: npm run db:users:setup
) else (
    echo     Users table exists OK
)
echo.

echo ========================================
echo Verification Complete!
echo ========================================
echo.
echo [NEXT STEPS]
echo.
echo 1. If any warnings appeared, fix them first
echo 2. Start development server: npm run dev
echo 3. Open: http://localhost:3000
echo 4. Login at: http://localhost:3000/auth/signin
echo.
echo [USEFUL COMMANDS]
echo.
echo npm run db:console       - Query database
echo npm run db:users:list    - List users
echo npm run r2:list          - List R2 files
echo npm run dev              - Start dev server
echo.
pause
