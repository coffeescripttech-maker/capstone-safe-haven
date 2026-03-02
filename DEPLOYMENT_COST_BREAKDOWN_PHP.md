# SafeHaven Deployment Cost Breakdown (Philippine Peso)

**Exchange Rate Used**: $1 USD = ₱56 PHP (as of 2025)

---

## 📱 MOBILE APP (Expo Go)

### Option 1: Expo Go Only (Development/Testing)
| Service | Cost | Notes |
|---------|------|-------|
| Expo Go App | **FREE** | Users download from Play Store |
| Expo Account | **FREE** | Free tier sufficient |
| **TOTAL** | **₱0/month** | ✅ Best for testing |

### Option 2: Standalone APK (Production)
| Service | Cost (USD) | Cost (PHP) | Notes |
|---------|-----------|-----------|-------|
| EAS Build (Free Tier) | $0 | **₱0** | 30 builds/month free |
| EAS Build (Paid) | $29/month | **₱1,624/month** | Unlimited builds (optional) |
| Google Play Console | $25 one-time | **₱1,400 one-time** | To publish on Play Store |
| **TOTAL (Free)** | **$0/month** | **₱0/month** | ✅ Recommended |
| **TOTAL (Paid)** | **$29/month** | **₱1,624/month** | Only if you need >30 builds |

---

## 🖥️ BACKEND (Render)

### Database Options

#### Option A: Render PostgreSQL (Recommended)
| Plan | Storage | Cost (USD) | Cost (PHP) | Notes |
|------|---------|-----------|-----------|-------|
| Free | 1GB | $0 | **₱0** | Expires after 90 days |
| Starter | 10GB | $7/month | **₱392/month** | ✅ Good for small scale |
| Standard | 100GB | $20/month | **₱1,120/month** | For production |

#### Option B: External MySQL (Your Current Setup)
| Service | Cost (USD) | Cost (PHP) | Notes |
|---------|-----------|-----------|-------|
| PlanetScale (Free) | $0 | **₱0** | 5GB storage, 1B row reads |
| PlanetScale (Scaler) | $29/month | **₱1,624/month** | 10GB storage |
| Railway MySQL (Free) | $0 | **₱0** | $5 credit/month |
| Railway MySQL (Paid) | $5-20/month | **₱280-1,120/month** | Pay as you go |

### Backend Server (Render)
| Plan | RAM | CPU | Cost (USD) | Cost (PHP) | Notes |
|------|-----|-----|-----------|-----------|-------|
| Free | 512MB | 0.1 CPU | $0 | **₱0** | Spins down after 15min inactive |
| Starter | 512MB | 0.5 CPU | $7/month | **₱392/month** | ✅ Always on |
| Standard | 2GB | 1 CPU | $25/month | **₱1,400/month** | Better performance |
| Pro | 4GB | 2 CPU | $85/month | **₱4,760/month** | High traffic |

### Backend Total (Recommended Setup)
| Component | Plan | Cost (PHP) |
|-----------|------|-----------|
| Database | PlanetScale Free | ₱0 |
| Server | Render Starter | ₱392/month |
| **TOTAL** | | **₱392/month** |

---

## 🌐 WEB APP (Frontend)

### Option A: Vercel (Recommended)
| Plan | Bandwidth | Cost (USD) | Cost (PHP) | Notes |
|------|-----------|-----------|-----------|-------|
| Hobby | 100GB | $0 | **₱0** | ✅ Perfect for small projects |
| Pro | 1TB | $20/month | **₱1,120/month** | For production |
| Enterprise | Custom | Custom | Custom | Large scale |

### Option B: Render Static Site
| Plan | Bandwidth | Cost (USD) | Cost (PHP) | Notes |
|------|-----------|-----------|-----------|-------|
| Free | 100GB | $0 | **₱0** | ✅ Good alternative |
| Paid | Custom | $1-10/month | **₱56-560/month** | More bandwidth |

### Option C: Cloudflare Pages
| Plan | Bandwidth | Cost (USD) | Cost (PHP) | Notes |
|------|-----------|-----------|-----------|-------|
| Free | Unlimited | $0 | **₱0** | ✅ Best free option |
| Pro | Unlimited | $20/month | **₱1,120/month** | Advanced features |

### Web App Total (Recommended)
| Service | Plan | Cost (PHP) |
|---------|------|-----------|
| Vercel | Hobby (Free) | **₱0/month** |

---

## 🌦️ WEATHER API

### Open-Meteo (Current)
| Feature | Cost | Notes |
|---------|------|-------|
| API Calls | **FREE** | Unlimited, no key required |
| Data | **FREE** | Weather forecasts worldwide |
| **TOTAL** | **₱0/month** | ✅ You're already using this |

### Alternative: OpenWeatherMap
| Plan | Calls/day | Cost (USD) | Cost (PHP) | Notes |
|------|-----------|-----------|-----------|-------|
| Free | 1,000 | $0 | **₱0** | Limited |
| Startup | 60,000 | $40/month | **₱2,240/month** | Not needed |

---

## 🌍 EARTHQUAKE API

### USGS Earthquake API (Current)
| Feature | Cost | Notes |
|---------|------|-------|
| API Calls | **FREE** | Unlimited, no key required |
| Data | **FREE** | Real-time earthquake data |
| **TOTAL** | **₱0/month** | ✅ You're already using this |

---

## 🗺️ MAPS API

### Google Maps API (Current)
| Service | Free Tier | Cost After Free | Notes |
|---------|-----------|----------------|-------|
| Maps SDK | 28,000 loads/month | $7 per 1,000 loads | ₱392 per 1,000 |
| Geocoding | 40,000 requests/month | $5 per 1,000 requests | ₱280 per 1,000 |
| **TOTAL** | **₱0/month** | If under free tier | ✅ Likely free for small scale |

**Your API Key**: `AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao`

---

## 📧 EMAIL SERVICE (Optional)

### SendGrid
| Plan | Emails/day | Cost (USD) | Cost (PHP) | Notes |
|------|-----------|-----------|-----------|-------|
| Free | 100 | $0 | **₱0** | For password reset |
| Essentials | 50,000 | $19.95/month | **₱1,117/month** | If needed |

### Alternative: Gmail SMTP
| Service | Cost | Notes |
|---------|------|-------|
| Gmail | **FREE** | 500 emails/day limit |

---

## 📱 SMS SERVICE (Optional - Philippines)

### Semaphore (Philippine SMS)
| Plan | Credits | Cost (PHP) | Notes |
|------|---------|-----------|-------|
| Pay as you go | 1 SMS = ₱0.50 | **₱500 for 1,000 SMS** | For OTP/alerts |
| Bulk | 10,000 SMS | **₱4,000** | Discounted rate |

### Alternative: Twilio
| Service | Cost (USD) | Cost (PHP) | Notes |
|---------|-----------|-----------|-------|
| SMS (PH) | $0.0395/SMS | **₱2.21/SMS** | More expensive |

---

## 🔥 PUSH NOTIFICATIONS

### Firebase Cloud Messaging (FCM)
| Feature | Cost | Notes |
|---------|------|-------|
| Push Notifications | **FREE** | Unlimited |
| Analytics | **FREE** | Basic analytics |
| **TOTAL** | **₱0/month** | ✅ Completely free |

---

## 💾 FILE STORAGE (Optional)

### Cloudflare R2
| Plan | Storage | Cost (USD) | Cost (PHP) | Notes |
|------|---------|-----------|-----------|-------|
| Free | 10GB | $0 | **₱0** | For incident photos |
| Paid | Per GB | $0.015/GB | **₱0.84/GB** | Very cheap |

### Alternative: AWS S3
| Service | Cost (USD) | Cost (PHP) | Notes |
|---------|-----------|-----------|-------|
| Storage | $0.023/GB | **₱1.29/GB** | More expensive |

---

## 📊 TOTAL COST BREAKDOWN

### Scenario 1: FREE TIER (Development/Testing)
| Component | Service | Cost (PHP) |
|-----------|---------|-----------|
| Mobile | Expo Go | ₱0 |
| Backend | Render Free + PlanetScale Free | ₱0 |
| Web App | Vercel Free | ₱0 |
| Weather API | Open-Meteo | ₱0 |
| Earthquake API | USGS | ₱0 |
| Maps API | Google Maps (under limit) | ₱0 |
| Push Notifications | Firebase FCM | ₱0 |
| **TOTAL** | | **₱0/month** |

**✅ RECOMMENDED FOR CAPSTONE PROJECT**

---

### Scenario 2: MINIMAL PRODUCTION (Small Scale)
| Component | Service | Cost (PHP) |
|-----------|---------|-----------|
| Mobile | EAS Free + Play Store | ₱1,400 one-time |
| Backend | Render Starter + PlanetScale Free | ₱392/month |
| Web App | Vercel Free | ₱0/month |
| Weather API | Open-Meteo | ₱0/month |
| Earthquake API | USGS | ₱0/month |
| Maps API | Google Maps (under limit) | ₱0/month |
| Push Notifications | Firebase FCM | ₱0/month |
| **TOTAL (Monthly)** | | **₱392/month** |
| **TOTAL (First Month)** | | **₱1,792** |

**✅ RECOMMENDED FOR PRODUCTION LAUNCH**

---

### Scenario 3: FULL PRODUCTION (Medium Scale)
| Component | Service | Cost (PHP) |
|-----------|---------|-----------|
| Mobile | EAS Paid + Play Store | ₱1,400 one-time + ₱1,624/month |
| Backend | Render Standard + PlanetScale Starter | ₱1,400 + ₱1,624 = ₱3,024/month |
| Web App | Vercel Pro | ₱1,120/month |
| Weather API | Open-Meteo | ₱0/month |
| Earthquake API | USGS | ₱0/month |
| Maps API | Google Maps (over limit) | ~₱500/month |
| Push Notifications | Firebase FCM | ₱0/month |
| SMS (Optional) | Semaphore | ~₱500/month |
| **TOTAL (Monthly)** | | **₱6,768/month** |
| **TOTAL (First Month)** | | **₱8,168** |

---

## 💡 RECOMMENDATIONS

### For Capstone Project (Now):
```
✅ Use Scenario 1: FREE TIER
Total Cost: ₱0/month
```

**Why?**
- All features work
- No credit card needed
- Perfect for demonstration
- Can handle 100-1000 users

### For Production Launch (After Graduation):
```
✅ Use Scenario 2: MINIMAL PRODUCTION
Total Cost: ₱392/month + ₱1,400 one-time
```

**Why?**
- Always-on backend
- Professional APK on Play Store
- Can handle 1,000-10,000 users
- Very affordable

### For Scaling Up (If Successful):
```
Use Scenario 3: FULL PRODUCTION
Total Cost: ₱6,768/month
```

**Why?**
- Better performance
- More bandwidth
- SMS notifications
- Can handle 10,000+ users

---

## 📝 NOTES

### Free Tier Limitations:
1. **Render Free**: Spins down after 15min inactive (30-60s cold start)
2. **PlanetScale Free**: 5GB storage, 1B row reads/month
3. **Vercel Free**: 100GB bandwidth/month
4. **Google Maps**: 28,000 map loads/month free

### When to Upgrade:
- **Backend**: When you need always-on (no cold starts)
- **Database**: When you exceed 5GB or 1B reads
- **Web App**: When you exceed 100GB bandwidth
- **Maps**: When you exceed 28,000 loads/month

### Cost Saving Tips:
1. ✅ Use free tiers for capstone
2. ✅ Keep Open-Meteo and USGS (both free forever)
3. ✅ Use Cloudflare Pages instead of Vercel (unlimited bandwidth)
4. ✅ Optimize images to reduce bandwidth
5. ✅ Cache API responses to reduce calls

---

## 🎯 FINAL RECOMMENDATION FOR YOUR CAPSTONE

### Current Setup (Perfect!):
```
Mobile: Expo Go (FREE)
Backend: Render Free + MySQL (FREE)
Web App: Vercel/Cloudflare (FREE)
Weather: Open-Meteo (FREE)
Earthquake: USGS (FREE)
Maps: Google Maps (FREE under limit)
Push: Firebase FCM (FREE)

TOTAL: ₱0/month
```

**This is perfect for your capstone project!** 🎉

### After Graduation (If you want to launch):
```
Mobile: Build APK (₱1,400 one-time)
Backend: Render Starter (₱392/month)
Everything else: Keep free

TOTAL: ₱392/month + ₱1,400 one-time
```

---

## 📞 SUPPORT

If you need help with deployment:
1. Render: https://render.com/docs
2. Vercel: https://vercel.com/docs
3. Expo: https://docs.expo.dev
4. Google Maps: https://developers.google.com/maps

**Good luck with your capstone! 🚀**
