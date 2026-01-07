# Gmail Setup for Password Reset Emails

## Quick Setup (3 Steps)

### Step 1: Install Nodemailer

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

### Step 2: Get Gmail App Password

1. **Enable 2-Step Verification** (Required!)
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification" → Follow setup

2. **Create App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it: "Dubai Filmmaker CMS"
   - Click "Generate"
   - **Copy the 16-character password** (remove spaces)

### Step 3: Add to `.env.local`

```env
# Email Provider
EMAIL_PROVIDER=gmail

# Gmail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop

# Keep Resend config for future use (commented out)
# RESEND_API_KEY=re_your_api_key_here
# EMAIL_FROM=noreply@dubaifilmmaker.ae
```

### Step 4: Restart Server

```bash
npm run dev
```

## Testing

1. Go to https://dubail-film-maker-website-portfolio.vercel.app/reset-password
2. Enter email of a user in your database
3. Check Gmail inbox
4. Click reset link
5. Set new password

## Switching Email Providers

Change `EMAIL_PROVIDER` in `.env.local`:

```env
# Use Gmail
EMAIL_PROVIDER=gmail

# Or use Resend (when ready)
EMAIL_PROVIDER=resend
```

## Gmail App Password - Detailed Guide

### Why App Password?

Google requires App Passwords for third-party apps. Regular passwords don't work anymore for security reasons.

### Requirements

- ✅ Gmail account
- ✅ 2-Step Verification enabled
- ✅ App Password generated

### Step-by-Step Instructions

#### 1. Enable 2-Step Verification

```
1. Go to: https://myaccount.google.com/security
2. Find "2-Step Verification"
3. Click "Get Started"
4. Follow the prompts (phone verification)
5. Complete setup
```

#### 2. Generate App Password

```
1. Go to: https://myaccount.google.com/apppasswords
2. You might need to sign in again
3. Select app: "Mail"
4. Select device: "Other (Custom name)"
5. Enter name: "Dubai Filmmaker CMS"
6. Click "Generate"
```

#### 3. Copy Password

You'll see something like:
```
abcd efgh ijkl mnop
```

Remove spaces and use:
```
abcdefghijklmnop
```

Add to `.env.local`:
```env
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

## Troubleshooting

### Can't Find App Passwords?

**Problem**: "App passwords" option not showing

**Solutions**:
1. Make sure 2-Step Verification is enabled
2. Try direct link: https://myaccount.google.com/apppasswords
3. Sign out and sign in again
4. Some accounts (work/school) might have restrictions

### Emails Not Sending

**Check these:**

1. **Correct credentials**
   ```env
   GMAIL_USER=your-actual-email@gmail.com
   GMAIL_APP_PASSWORD=no-spaces-16-chars
   ```

2. **2-Step Verification enabled**
   - Must be ON to use App Passwords

3. **Server logs**
   - Check terminal for error messages
   - Look for "Email sent via Gmail" success message

4. **Spam folder**
   - Check recipient's spam folder

### "Invalid credentials" Error

**Causes**:
- Wrong email address
- Wrong App Password
- Spaces in App Password
- Using regular password instead of App Password

**Solution**:
```env
# Make sure no spaces in password
GMAIL_APP_PASSWORD=abcdefghijklmnop

# Not this:
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

### "Less secure app access" Message

**Don't use this!** It's outdated and insecure.

**Use App Passwords instead** (the method above).

## Security Best Practices

### ✅ Do This:
- Use App Passwords (not regular password)
- Keep App Password in `.env.local` (not in code)
- Add `.env.local` to `.gitignore`
- Enable 2-Step Verification
- Use different App Password for each app

### ❌ Don't Do This:
- Don't commit `.env.local` to git
- Don't share App Password
- Don't use regular Gmail password
- Don't enable "Less secure app access"

## Email Limits

### Gmail Sending Limits:
- **Free Gmail**: 500 emails per day
- **Google Workspace**: 2,000 emails per day

For password resets, this is more than enough!

## Example Email Flow

### 1. User Requests Reset
```
User enters: admin@example.com
System generates token
System sends email via Gmail
```

### 2. Email Sent
```
From: "Dubai Filmmaker CMS" <your-email@gmail.com>
To: admin@example.com
Subject: Reset Your Password - Dubai Filmmaker CMS
```

### 3. User Receives Email
```
Professional HTML email with:
- Reset button
- Clickable link
- Security warning
- Expiration notice
```

## Testing Checklist

- [ ] Nodemailer installed
- [ ] 2-Step Verification enabled
- [ ] App Password generated
- [ ] Environment variables set
- [ ] Server restarted
- [ ] Test email sent successfully
- [ ] Email received in inbox
- [ ] Reset link works
- [ ] Password updated successfully

## Production Considerations

### For Production:

1. **Use Professional Email**
   - Consider using Resend or SendGrid
   - Better deliverability
   - Professional sender reputation

2. **Monitor Sending**
   - Track email delivery rates
   - Monitor for bounces
   - Check spam reports

3. **Rate Limiting**
   - Limit reset requests per email
   - Prevent abuse

### When to Switch to Resend:

- Need higher sending limits
- Want better deliverability
- Need professional sender domain
- Want detailed analytics
- Going to production

## Quick Reference

### Environment Variables
```env
EMAIL_PROVIDER=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=16-char-password
```

### Links
- 2-Step Verification: https://myaccount.google.com/security
- App Passwords: https://myaccount.google.com/apppasswords
- Google Account: https://myaccount.google.com

### Commands
```bash
# Install
npm install nodemailer @types/nodemailer

# Test
# Go to https://dubail-film-maker-website-portfolio.vercel.app/reset-password
```

---

**Status**: ✅ Gmail support added!
**Fallback**: Resend code retained for future use
**Switch**: Change `EMAIL_PROVIDER` in `.env.local`
