@echo off
echo Installing SafeHaven Admin Dashboard dependencies...
cd /d "%~dp0"
call npm install axios react-hook-form date-fns react-hot-toast
echo.
echo Dependencies installed successfully!
echo.
pause
