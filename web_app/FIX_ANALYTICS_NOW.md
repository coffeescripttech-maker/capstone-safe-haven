# Fix Analytics in 3 Steps

## The Problem
Dashboard shows simulated data because API token lacks Analytics permissions.

## The Solution

### Step 1: Update Token Permissions (2 minutes)

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Find your token or click "Create Token"
3. Add these permissions:
   - **Account** → **Analytics** → **Read**
   - **Account** → **Account Analytics** → **Read**
4. Save (or copy new token)

### Step 2: Update .env.local (if new token)

Only needed if you created a new token:

```bash
# Edit final_cms/.env.local
CLOUDFLARE_API_TOKEN=your_new_token_here
```

### Step 3: Restart Server

```bash
npm run dev
```

## How to Verify It Worked

Open browser console (F12) and look for:

✅ **Success**:
```
✅ GraphQL query successful
✅ Fetched real analytics: 1234 page views, 567 visits
```

❌ **Still failing**:
```
❌ API Error Response: Unable to authenticate request
⚠️ Falling back to simulated data
```

If still failing, check `ANALYTICS_DEBUG.md` for detailed troubleshooting.

## Current Configuration

- ✅ Web Analytics beacon installed on portfolio
- ✅ Site ID: `112f2993056f45899af5e412b84cc1f2`
- ✅ Account ID: `4e369248fbb93ecfab45e53137a9980d`
- ❌ API token missing Analytics permissions

## What You'll Get

Once fixed, the dashboard will show **real data**:
- Actual page views from your portfolio
- Real visitor counts
- True geographic distribution
- Accurate time series charts
- Top pages based on real traffic

---

**Time to fix**: ~2 minutes
**Difficulty**: Easy
**Impact**: Real analytics instead of simulated data
