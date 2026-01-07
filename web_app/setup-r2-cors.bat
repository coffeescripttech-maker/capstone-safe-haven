@echo off
echo Setting up CORS for R2 bucket: dubai-filmmaker-assets
echo.

wrangler r2 bucket cors put dubai-filmmaker-assets --file r2-cors-config.json

echo.
echo CORS configuration applied!
echo.
echo Testing CORS configuration...
wrangler r2 bucket cors get dubai-filmmaker-assets

pause
