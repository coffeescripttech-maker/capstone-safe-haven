@echo off
echo ========================================
echo Adding Logo Fields to Database
echo ========================================
echo.

echo Choose environment:
echo 1. Local Development
echo 2. Production
echo.
set /p choice="Enter choice (1 or 2): "

if "%choice%"=="1" (
    echo.
    echo Running migration on LOCAL database...
    npx wrangler d1 execute DB --local --file=./database/add-logo-fields.sql
    echo.
    echo Migration completed for LOCAL database!
) else if "%choice%"=="2" (
    echo.
    echo WARNING: This will modify your PRODUCTION database!
    set /p confirm="Are you sure? (yes/no): "
    if /i "%confirm%"=="yes" (
        echo.
        echo Running migration on PRODUCTION database...
        npx wrangler d1 execute DB --file=./database/add-logo-fields.sql
        echo.
        echo Migration completed for PRODUCTION database!
    ) else (
        echo.
        echo Migration cancelled.
    )
) else (
    echo.
    echo Invalid choice. Please run the script again.
)

echo.
pause
