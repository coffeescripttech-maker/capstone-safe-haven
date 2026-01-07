@echo off
echo Setting up CORS for R2 bucket: dexter-media-assets
echo.

wrangler r2 bucket cors set dexter-media-assets --file r2-cors-config.json

echo.
echo CORS configuration applied!
echo.
pause
