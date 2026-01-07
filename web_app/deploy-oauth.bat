@echo off
echo.
echo ========================================
echo   Dubai Filmmaker CMS - OAuth Deploy
echo ========================================
echo.

echo Step 1: Logging in with OAuth...
echo (This will open your browser)
echo.
call wrangler login

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Login failed. Please try again.
    pause
    exit /b 1
)

echo.
echo ✅ Login successful!
echo.
echo Step 2: Building the application...
echo.
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Build failed. Please fix errors and try again.
    pause
    exit /b 1
)

echo.
echo ✅ Build successful!
echo.
echo Step 3: Deploying to Cloudflare Pages...
echo.
call npx wrangler pages deploy .next --project-name=dubai-filmmaker-cms

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   ✅ Deployment Successful!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Go to Cloudflare Dashboard
    echo 2. Add environment variables
    echo 3. Configure D1 and R2 bindings
    echo 4. Redeploy once more
    echo.
    echo See DEPLOY_NOW.md for details
    echo.
) else (
    echo.
    echo ❌ Deployment failed.
    echo Check the error messages above.
    echo.
)

pause
