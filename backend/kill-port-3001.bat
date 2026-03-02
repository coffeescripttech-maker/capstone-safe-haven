@echo off
echo ========================================
echo  Kill Process Using Port 3001
echo ========================================
echo.

echo Finding process using port 3001...
echo.

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    set PID=%%a
    goto :found
)

echo No process found using port 3001
echo Port 3001 is available!
pause
exit /b 0

:found
echo Found process with PID: %PID%
echo.

set /p CONFIRM="Do you want to kill this process? (Y/N): "

if /i "%CONFIRM%"=="Y" (
    echo.
    echo Killing process %PID%...
    taskkill /PID %PID% /F
    echo.
    echo Done! You can now run 'npm run dev'
) else (
    echo.
    echo Operation cancelled
)

echo.
pause
