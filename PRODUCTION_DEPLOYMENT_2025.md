# SafeHaven - Production Deployment Pricing 2025

**Updated**: February 2025
**Exchange Rate**: $1 USD = ₱58 PHP (Current rate)

---

## 🎯 RECOMMENDED PRODUCTION SETUP

### Total: **₱580/month** (₱19/day)

**Best for**: Real production deployment with good performance

---

## 📦 DETAILED BREAKDOWN

### 1. 📱 MOBILE APP - **₱0/month**

#### Option A: Expo Go (Testing) - FREE
```
Cost: ₱0
Use: Development and testing
Limitation: Requires Expo Go app
```

#### Option B: Standalone APK (Production) - FREE
```
EAS Build: 30 builds/month FREE
Distribution: Share APK directly FREE
Google Play Store: ₱1,450 one-time (optional)
```

**Recommendation**: Use EAS Build Free + Direct APK sharing

✅ **Cost: ₱0/month**

---

### 2. 🖥️ BACKEND SERVER

#### Current Pricing (February 2025):

| Provider | Plan | RAM | CPU | Price (USD) | Price (PHP) | Notes |
|----------|------|-----|-----|-------------|-------------|-------|
| **Render** | Free | 512MB | 0.1 | $0 | ₱0 | Sleeps after 15min |
| **Render** | Starter | 512MB | 0.5 | $7 | ₱406 | Always on ✅ |
| **Railway** | Starter | 512MB | Shared | $5 | ₱290 | $5 credit/month |
| **Railway** | Pro | 8GB | Shared | $20 | ₱1,160 | Pay as you go |
| **Fly.io** | Shared | 256MB | Shared | $0 | ₱0 | 3 VMs free |
| **Fly.io** | Dedicated | 1GB | 1 CPU | $5.69 | ₱330 | Better performance |

**Best Choice**: **Railway Starter - ₱290/month** ⭐

**Why Railway?**
- ✅ Cheaper than Render (₱290 vs ₱406)
- ✅ Always on (no cold starts)
- ✅ $5 free credit included
- ✅ Pay only for what you use
- ✅ Better performance
- ✅ Easy database integration

✅ **Cost: ₱290/month**

---

### 3. 💾 DATABASE

#### Current Options (February 2025):

| Provider | Plan | Storage | Price (USD) | Price (PHP) | Notes |
|----------|------|---------|-------------|-------------|-------|
| **PlanetScale** | Free | 5GB | $0 | ₱0 | 1B reads/month ✅ |
| **PlanetScale** | Scaler | 10GB | $29 | ₱1,682 | Production |
| **Railway** | Postgres | 1GB | Included | ₱0 | With Railway plan ✅ |
| **Supabase** | Free | 500MB | $0 | ₱0 | Postgres + APIs |
| **Supabase** | Pro | 8GB | $25 | ₱1,450 | Better limits |
| **Neon** | Free | 3GB | $0 | ₱0 | Serverless Postgres |

**Best Choice**: **Railway Postgres (Included)** ⭐

**Why Railway Postgres?**
- ✅ Included with Railway plan (no extra cost!)
- ✅ 1GB storage (enough for start)
- ✅ Automatic backups
- ✅ Same network as backend (faster)
- ✅ Easy to scale

**Alternative**: PlanetScale Free (5GB) if you need more storage

✅ **Cost: ₱0/month** (included with Railway)

---

### 4. 🌐 WEB APP (Frontend)

#### Current Options (February 2025):

| Provider | Plan | Bandwidth | Price (USD) | Price (PHP) | Notes |
|----------|------|-----------|-------------|-------------|-------|
| **Cloudflare Pages** | Free | Unlimited | $0 | ₱0 | Best free option ✅ |
| **Vercel** | Hobby | 100GB | $0 | ₱0 | Good for small |
| **Vercel** | Pro | 1TB | $20 | ₱1,160 | Production |
| **Netlify** | Free | 100GB | $0 | ₱0 | Similar to Vercel |
| **Railway** | Static | Unlimited | Included | ₱0 | With Railway plan |

**Best Choice**: **Cloudflare Pages Free** ⭐

**Why Cloudflare?**
- ✅ Unlimited bandwidth (no limits!)
- ✅ Global CDN (fast worldwide)
- ✅ Auto SSL/HTTPS
- ✅ DDoS protection
- ✅ Unlimited builds
- ✅ Better than Vercel free tier

✅ **Cost: ₱0/month**

---

### 5. 🗺️ MAPS API

#### Google Maps Pricing (2025):

| Service | Free Tier | After Free | Cost (PHP) |
|---------|-----------|------------|------------|
| Maps JavaScript API | 28,000 loads/month | $7/1,000 | ₱406/1,000 |
| Static Maps | 28,000 loads/month | $2/1,000 | ₱116/1,000 |
| Geocoding | 40,000 requests/month | $5/1,000 | ₱290/1,000 |

**Optimization Strategy**:
```javascript
// Cache map tiles locally
// Use static maps when possible
// Limit map refreshes
// Batch geocoding requests
```

**Expected Cost**: ₱0-290/month (if optimized)

✅ **Cost: ₱290/month** (buffer for safety)

---

### 6. 🌦️ WEATHER API - **₱0/month**

**Current**: Open-Meteo (FREE, unlimited)

**Alternatives**:
- OpenWeatherMap: $0 (1,000 calls/day free)
- WeatherAPI: $0 (1M calls/month free)

✅ **Cost: ₱0/month**

---

### 7. 🌍 EARTHQUAKE API - **₱0/month**

**Current**: USGS (FREE, unlimited)

✅ **Cost: ₱0/month**

---

### 8. 🔥 PUSH NOTIFICATIONS - **₱0/month**

**Firebase Cloud Messaging**: FREE unlimited

✅ **Cost: ₱0/month**

---

### 9. 💾 FILE STORAGE

#### Current Options (2025):

| Provider | Plan | Storage | Bandwidth | Price (USD) | Price (PHP) |
|----------|------|---------|-----------|-------------|-------------|
| **Cloudflare R2** | Free | 10GB | 10GB/month | $0 | ₱0 ✅ |
| **Cloudflare R2** | Paid | Per GB | Unlimited | $0.015/GB | ₱0.87/GB |
| **AWS S3** | Standard | Per GB | Per GB | $0.023/GB | ₱1.33/GB |
| **Backblaze B2** | Free | 10GB | 1GB/day | $0 | ₱0 |

**Best Choice**: **Cloudflare R2 Free** ⭐

✅ **Cost: ₱0/month**

---

## 💰 TOTAL MONTHLY COST

### Production Setup (Recommended):

| Component | Service | Monthly Cost |
|-----------|---------|--------------|
| 📱 Mobile App | EAS Build Free | ₱0 |
| 🖥️ Backend | Railway Starter | ₱290 |
| 💾 Database | Railway Postgres | ₱0 (included) |
| 🌐 Web App | Cloudflare Pages | ₱0 |
| 🗺️ Maps API | Google Maps | ₱290 (buffer) |
| 🌦️ Weather | Open-Meteo | ₱0 |
| 🌍 Earthquake | USGS | ₱0 |
| 🔥 Push | Firebase FCM | ₱0 |
| 💾 Storage | Cloudflare R2 | ₱0 |
| **TOTAL** | | **₱580/month** |

**Per Day**: ₱19/day (less than 2 jeepney rides!)

---

## 📊 PRICING TIERS COMPARISON

### Tier 1: FREE (Demo/Testing)
```
Backend: Render Free (sleeps)
Database: PlanetScale Free
Web: Cloudflare Free
Everything else: Free

TOTAL: ₱0/month
Good for: Capstone presentation
Issue: 30-60s cold start
```

### Tier 2: PRODUCTION (Recommended) ⭐
```
Backend: Railway Starter
Database: Railway Postgres (included)
Web: Cloudflare Free
Maps: Google (optimized)
Everything else: Free

TOTAL: ₱580/month
Good for: Real deployment
Benefit: Always fast, professional
```

### Tier 3: PREMIUM (High Traffic)
```
Backend: Railway Pro (₱1,160)
Database: PlanetScale Scaler (₱1,682)
Web: Vercel Pro (₱1,160)
Maps: Google (₱500)
CDN: Cloudflare Pro (₱1,160)

TOTAL: ₱5,662/month
Good for: 10,000+ users
```

---

## 🎯 MY RECOMMENDATION

### For Production Launch: **₱580/month**

**What you get**:
- ⚡ Always-on backend (no delays)
- 💾 1GB database (expandable)
- 🌐 Unlimited web bandwidth
- 🗺️ Maps API (optimized)
- 📱 Unlimited APK builds
- 🔥 Unlimited push notifications
- 💾 10GB file storage

**Can handle**:
- 1,000-5,000 active users
- 10,000-50,000 API requests/day
- 100-500 incident reports/day
- 1,000-5,000 map loads/day

**Cost breakdown**:
```
₱580/month = ₱19/day
= 2 cups of coffee ☕☕
= 2 jeepney rides 🚌🚌
= 1 fast food meal 🍔
```

---

## 💡 COST OPTIMIZATION TIPS

### 1. Reduce Maps API Costs (Save ₱200/month)
```javascript
// Cache map data for 1 hour
const CACHE_DURATION = 3600000;

// Use static maps for thumbnails
<img src={`https://maps.googleapis.com/maps/api/staticmap?...`} />

// Lazy load maps
{showMap && <MapView />}

// Batch geocoding requests
const addresses = await geocodeBatch(locations);
```

### 2. Optimize Database Queries (Better performance)
```javascript
// Add indexes
CREATE INDEX idx_alerts_location ON alerts(latitude, longitude);

// Use pagination
SELECT * FROM incidents LIMIT 20 OFFSET 0;

// Cache frequent queries
const cachedCenters = await cache.get('evacuation_centers');
```

### 3. Compress Images (Save bandwidth)
```javascript
// Compress before upload
quality: 0.3, // 30% quality
maxWidth: 1024,
maxHeight: 1024,

// Use WebP format
format: 'webp'
```

### 4. Use CDN (Faster loading)
```
Cloudflare Pages = Automatic CDN
- Caches static assets
- Serves from nearest location
- Reduces server load
```

**Potential savings**: ₱200-300/month

---

## 📈 SCALING PLAN

### Phase 1: Launch (₱580/month)
```
Users: 0-5,000
Backend: Railway Starter
Database: Railway Postgres 1GB
```

### Phase 2: Growth (₱1,450/month)
```
Users: 5,000-20,000
Backend: Railway Pro
Database: PlanetScale Scaler 10GB
Add: CDN optimization
```

### Phase 3: Scale (₱5,662/month)
```
Users: 20,000-100,000
Backend: Multiple instances
Database: Dedicated server
Add: Load balancer, caching
```

---

## 🔄 WHEN TO UPGRADE

### Upgrade Backend (₱290 → ₱1,160):
- Response time >2 seconds
- CPU usage >80%
- Memory usage >400MB
- 5,000+ concurrent users

### Upgrade Database (₱0 → ₱1,682):
- Storage >1GB
- Queries >1M/day
- Need better performance
- Need more connections

### Upgrade Web (₱0 → ₱1,160):
- Bandwidth >100GB/month
- Need team collaboration
- Need advanced analytics
- Need priority support

**Most likely**: Stay at ₱580/month for 1-2 years!

---

## 💳 PAYMENT SETUP

### Railway (₱290/month):
1. Sign up: https://railway.app
2. Add credit/debit card
3. $5 free credit included
4. Billed monthly

**Accepted**:
- Visa, Mastercard
- Debit cards
- PayPal (via card)

### Google Maps (₱0-290/month):
1. Enable billing: https://console.cloud.google.com
2. Add credit/debit card
3. $200 free credit (first time)
4. Only charged if over free tier

---

## 🎓 STUDENT BENEFITS

### GitHub Student Developer Pack:
**Free credits**:
- $100 DigitalOcean
- $50 Microsoft Azure
- $13/month Heroku
- Free .me domain

**Apply**: https://education.github.com/pack

### Railway Student Discount:
- Extra $5 credit/month
- Apply with student email

---

## 📅 FIRST MONTH COSTS

### Setup Costs:
```
Railway: ₱290 (includes $5 credit)
Google Maps: ₱0 ($200 free credit)
Everything else: ₱0

TOTAL FIRST MONTH: ₱290
```

### Ongoing Costs:
```
Month 2+: ₱580/month
```

---

## 🆚 PROVIDER COMPARISON

### Why Railway over Render?

| Feature | Railway | Render |
|---------|---------|--------|
| Price | ₱290/month | ₱406/month |
| Database | Included | Separate |
| Performance | Better | Good |
| Scaling | Easier | Manual |
| Free Credit | $5/month | None |
| **Winner** | ✅ Railway | Render |

**Savings**: ₱116/month (₱1,392/year)

---

## ✅ FINAL RECOMMENDATION

### Production Setup (Best Value):

```
✅ Mobile: EAS Build Free (₱0)
✅ Backend: Railway Starter (₱290) ⭐
✅ Database: Railway Postgres (₱0, included)
✅ Web: Cloudflare Pages (₱0)
✅ Maps: Google Maps optimized (₱290)
✅ APIs: All free (₱0)

TOTAL: ₱580/month (₱19/day)
```

**This setup gives you**:
- ⚡ Fast performance (always on)
- 💰 Low cost (affordable)
- 🚀 Production-ready
- 📈 Scalable (easy to upgrade)
- 💼 Professional quality

**Perfect for real deployment!** 🎯

---

## 📊 COST COMPARISON SUMMARY

| Setup | Monthly | Daily | Best For |
|-------|---------|-------|----------|
| Free | ₱0 | ₱0 | Demo only |
| **Production** | **₱580** | **₱19** | **Real use** ⭐ |
| Premium | ₱5,662 | ₱189 | High traffic |

---

## 🎉 CONCLUSION

**For your SafeHaven production deployment:**

✅ **Start with ₱580/month**
- Affordable for students
- Professional quality
- Can handle real users
- Easy to scale up later

**This is the sweet spot between cost and performance!** 💯

---

## 📞 NEED HELP?

### Setup Guides:
- Railway: https://docs.railway.app
- Cloudflare: https://developers.cloudflare.com/pages
- Google Maps: https://developers.google.com/maps

### Support:
- Railway Discord: https://discord.gg/railway
- Cloudflare Community: https://community.cloudflare.com

**Good luck with your deployment! 🚀**
