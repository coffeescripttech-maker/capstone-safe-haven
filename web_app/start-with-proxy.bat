@echo off
echo Setting up proxy configuration...
set HTTP_PROXY=http://192.168.43.1:8080
set HTTPS_PROXY=http://192.168.43.1:8080
set NO_PROXY=localhost,127.0.0.1

echo Starting development server with proxy...
npm run dev
