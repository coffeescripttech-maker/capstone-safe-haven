# Password Reset - Quick Start Guide

## Choose Your Email Provider

### Option 1: Gmail (Easiest for Testing)

```bash
# 1. Install
npm install nodemailer @types/nodemailer

# 2. Get Gmail App Password
# Go to: https://myaccount.google.com/apppasswords
# Generate password for "Dubai Filmmaker CMS"

# 3. Add to .env.local
EMAIL_PROVIDER=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-password

# 4. Run migration
npx wrangler d1 execute DB --remote --file=./database/create-password-reset-tokens.sql

# 5. Restart server
npm run dev
```

### Option 2: Resend (Better for Production)

```bash
# 1. Install
npm install resend nodemailer @types/nodemailer

# 2. Get Resend API Key
# Go to: https://resend.com
# Sign up and get API key

# 3. Add to .env.local
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@dubaifilmmaker.ae

# 4. Run migration
npx wrangler d1 execute DB --remote --file=./database/create-password-reset-tokens.sql

# 5. Restart server
npm run dev
```

## Test It

1. Go to https://dubail-film-maker-website-portfolio.vercel.app/reset-password
2. Enter email: `admin@example.com`
3. Check your email inbox
4. Click the reset link
5. Set new password
6. Sign in with new password

## Switch Providers Anytime

Just change `EMAIL_PROVIDER` in `.env.local`:

```env
# Use Gmail
EMAIL_PROVIDER=gmail

# Or use Resend
EMAIL_PROVIDER=resend
```

## Files Created

- ✅ Database schema for tokens
- ✅ Email service (Gmail + Resend)
- ✅ Token generation utilities
- ✅ 3 API endpoints
- ✅ 2 user pages
- ✅ Professional email template

## Documentation

- **Gmail Setup**: `GMAIL_SETUP_GUIDE.md`
- **Full Guide**: `PASSWORD_RESET_SETUP.md`
- **This Guide**: `PASSWORD_RESET_QUICK_START.md`

---

**Ready to use!** Just install dependencies, configure email, and test! 🚀
