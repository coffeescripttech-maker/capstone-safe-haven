@echo off
echo 🚀 Applying Incident Types Migration...
echo.

REM Load database credentials from .env file
for /f "tokens=1,2 delims==" %%a in ('type ..\backend\.env ^| findstr /v "^#"') do (
    if "%%a"=="DB_HOST" set DB_HOST=%%b
    if "%%a"=="DB_USER" set DB_USER=%%b
    if "%%a"=="DB_PASSWORD" set DB_PASSWORD=%%b
    if "%%a"=="DB_NAME" set DB_NAME=%%b
)

echo 📊 Database: %DB_NAME%
echo 🖥️  Host: %DB_HOST%
echo.

echo 🔄 Applying migration...
mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < migrations\add_incident_types.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Migration applied successfully!
    echo ✅ Created incident_types table
    echo ✅ Created incident_type_responders table
    echo ✅ Inserted 20 incident types
    echo ✅ Configured responders for each type
    echo.
    echo 📊 Verifying data...
    mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% -e "SELECT COUNT(*) as count FROM incident_types;"
    echo.
    echo 🎉 Incident Types System is ready!
) else (
    echo.
    echo ❌ Error applying migration
    exit /b 1
)

pause
