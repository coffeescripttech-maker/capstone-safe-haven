# Fix "Port 3001 Already in Use" Error

## The Problem
You're getting this error:
```
Error: listen EADDRINUSE: address already in use :::3001
```

This means **something is already running on port 3001**. It's probably an old backend server that didn't shut down properly.

## Quick Fix (Choose One Method)

### Method 1: Use the PowerShell Script (Easiest) ✅

I created a script to automatically find and kill the process:

```powershell
cd MOBILE_APP/backend
.\kill-port-3001.ps1
```

The script will:
1. Find what's using port 3001
2. Show you the process name
3. Ask if you want to kill it
4. Kill it for you

Then try starting the backend again:
```powershell
npm run dev
```

### Method 2: Manual PowerShell Commands

**Step 1: Find the process using port 3001**
```powershell
netstat -ano | findstr :3001
```

You'll see output like:
```
TCP    0.0.0.0:3001    0.0.0.0:0    LISTENING    12345
```

The last number (12345) is the Process ID (PID).

**Step 2: Kill the process**
```powershell
taskkill /PID 12345 /F
```

Replace `12345` with the actual PID from step 1.

**Step 3: Start backend again**
```powershell
npm run dev
```

### Method 3: One-Line PowerShell Command

This will automatically find and kill the process:

```powershell
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

Then start the backend:
```powershell
npm run dev
```

### Method 4: Restart Your Computer (Last Resort)

If nothing else works, restart your computer. This will close all processes.

## After Fixing

Once you've killed the process, start the backend:

```powershell
cd MOBILE_APP/backend
npm run dev
```

You should see:
```
✅ SafeHaven API Server running on port 3001
```

## Prevent This in the Future

### Always Stop Servers Properly

**To stop the backend:**
- Press `Ctrl + C` in the terminal where it's running
- Wait for it to say "Server stopped" or similar
- Don't just close the terminal window!

**To stop the web app:**
- Press `Ctrl + C` in the terminal
- Wait for it to stop completely

### Check What's Running

Before starting servers, check if ports are free:

```powershell
# Check port 3001 (backend)
netstat -ano | findstr :3001

# Check port 3000 (web app)
netstat -ano | findstr :3000
```

If nothing shows up, the port is free!

## Common Causes

1. **Terminal closed without stopping server** - Always use Ctrl+C
2. **Computer crashed/restarted** - Old processes may still be running
3. **Multiple terminals** - You might have started the server in another terminal
4. **VS Code integrated terminal** - Check all VS Code terminals
5. **Background process** - Server might be running as a background service

## Troubleshooting

### "Access Denied" when killing process

Run PowerShell as Administrator:
1. Right-click PowerShell
2. Select "Run as Administrator"
3. Run the kill command again

### Process keeps coming back

Check if you have:
- Multiple terminals open running the backend
- A process manager (PM2, nodemon) running in the background
- Windows Task Scheduler running the server

### Still can't kill it

1. Open Task Manager (Ctrl + Shift + Esc)
2. Go to "Details" tab
3. Find "node.exe" processes
4. Right-click → End Task
5. Try starting the backend again

## Quick Reference

```powershell
# Find what's using port 3001
netstat -ano | findstr :3001

# Kill process by PID
taskkill /PID <PID> /F

# Or use the script
.\kill-port-3001.ps1

# Start backend
npm run dev
```

## Need More Help?

If you're still having issues:
1. Check Task Manager for node.exe processes
2. Restart your computer
3. Make sure no other applications are using port 3001
4. Try changing the port in `backend/.env` to 3002 temporarily
