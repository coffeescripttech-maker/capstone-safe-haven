@echo off
REM Cloudflare Pages Deployment Script for Windows
REM This script builds and deploys your Next.js app to Cloudflare Pages

echo.
echo 🚀 Dubai Filmmaker CMS - Cloudflare Pages Deployment
echo ==================================================
echo.

REM Check if wrangler is installed
where wrangler >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Wrangler CLI not found. Installing...
    call npm install -g wrangler
)

REM Login check
echo 🔐 Checking Cloudflare authentication...
wrangler whoami >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Not logged in to Cloudflare. Please login:
    wrangler login
)

REM Build the application
echo.
echo 📦 Building Next.js application...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed. Please fix errors and try again.
    exit /b 1
)

echo ✅ Build completed successfully!
echo.

REM Deploy to Cloudflare Pages
echo 🌐 Deploying to Cloudflare Pages...
echo.

REM Ask for project name
set /p PROJECT_NAME="Enter your Pages project name (default: dubai-filmmaker-cms): "
if "%PROJECT_NAME%"=="" set PROJECT_NAME=dubai-filmmaker-cms

REM Deploy
call npx wrangler pages deploy .next --project-name=%PROJECT_NAME% --branch=main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Deployment successful!
    echo.
    echo 📝 Next steps:
    echo 1. Go to Cloudflare Dashboard → Pages → %PROJECT_NAME%
    echo 2. Add environment variables (NEXTAUTH_URL, NEXTAUTH_SECRET, etc.^)
    echo 3. Configure bindings:
    echo    - D1 Database: DB → dubai-filmmaker-cms
    echo    - R2 Bucket: dubailfilmmaker → dubailfilmmaker
    echo 4. Set up custom domain (optional^)
    echo.
    echo 📚 See CLOUDFLARE_PAGES_DEPLOYMENT.md for detailed instructions
) else (
    echo.
    echo ❌ Deployment failed. Check the error messages above.
    exit /b 1
)
