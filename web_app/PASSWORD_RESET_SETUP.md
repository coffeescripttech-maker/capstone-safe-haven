# Password Reset System - Setup Guide

## Overview

Complete password reset functionality with:
- ✅ Secure token generation and validation
- ✅ Email service integration (Resend)
- ✅ Password update page
- ✅ Database schema for reset tokens
- ✅ Token expiration (1 hour)
- ✅ One-time use tokens
- ✅ Security best practices

## Setup Steps

### Step 1: Install Dependencies

```bash
npm install resend
```

### Step 2: Run Database Migration

```bash
# For remote database
npx wrangler d1 execute DB --remote --file=./database/create-password-reset-tokens.sql

# For local database
npx wrangler d1 execute DB --local --file=./database/create-password-reset-tokens.sql
```

### Step 3: Get Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Verify your domain (or use their test domain for development)
4. Get your API key from dashboard

### Step 4: Configure Environment Variables

Add to `.env.local`:

```env
# Resend Email Service
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@yourdomain.com

# Make sure these are set
NEXTAUTH_URL=http://localhost:3000
```

### Step 5: Restart Development Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

## How It Works

### 1. User Requests Password Reset

**URL**: `/reset-password`

- User enters email
- System checks if email exists
- Generates secure token
- Sends email with reset link
- Always shows success (prevents email enumeration)

### 2. User Clicks Reset Link

**URL**: `/reset-password/[token]`

- System verifies token is valid
- Checks token hasn't expired (1 hour)
- Checks token hasn't been used
- Shows password reset form

### 3. User Sets New Password

- User enters new password (min 8 characters)
- Confirms password
- System updates password
- Marks token as used
- Redirects to signin

## Security Features

### Token Security
- ✅ Cryptographically secure random tokens (32 bytes)
- ✅ Tokens are hashed before storing in database
- ✅ One-time use only
- ✅ 1-hour expiration
- ✅ Automatic cleanup of expired tokens

### Email Security
- ✅ No email enumeration (always shows success)
- ✅ Clear security warnings in email
- ✅ Expiration time mentioned

### Password Security
- ✅ Minimum 8 characters
- ✅ Bcrypt hashing
- ✅ Password confirmation required

## Database Schema

```sql
CREATE TABLE password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,  -- Hashed token
  expires_at DATETIME NOT NULL,
  used BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## API Endpoints

### POST /api/auth/reset-password
Request password reset

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account exists with this email, you will receive password reset instructions."
}
```

### POST /api/auth/verify-reset-token
Verify reset token

**Request:**
```json
{
  "token": "abc123..."
}
```

**Response:**
```json
{
  "valid": true,
  "email": "user@example.com",
  "name": "User Name"
}
```

### POST /api/auth/update-password
Update password

**Request:**
```json
{
  "token": "abc123...",
  "password": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

## Email Template

The system sends a professional HTML email with:
- Clear call-to-action button
- Clickable link as fallback
- Security warning
- Expiration notice
- Branded design

## Testing

### Test Flow

1. **Request Reset**
   ```
   Go to: https://dubail-film-maker-website-portfolio.vercel.app/reset-password
   Enter: admin@example.com
   ```

2. **Check Email**
   - Check your email inbox
   - Click the reset link
   - Or copy/paste the URL

3. **Reset Password**
   ```
   Enter new password (min 8 chars)
   Confirm password
   Click "Update Password"
   ```

4. **Sign In**
   ```
   Go to: https://dubail-film-maker-website-portfolio.vercel.app/signin
   Use new password
   ```

### Test with Resend Test Mode

For development, Resend provides a test mode:
- Emails are sent but not delivered
- You can see them in Resend dashboard
- Perfect for testing without real emails

## Troubleshooting

### Email Not Sending

**Check:**
1. RESEND_API_KEY is set correctly
2. EMAIL_FROM domain is verified in Resend
3. Check Resend dashboard for errors
4. Check server logs for error messages

**Solution:**
```bash
# Check environment variables
echo $RESEND_API_KEY

# Check server logs
# Look for "Email sent successfully" or error messages
```

### Token Invalid/Expired

**Reasons:**
- Token is older than 1 hour
- Token was already used
- Token doesn't exist in database

**Solution:**
- Request a new reset link
- Check database for token:
  ```sql
  SELECT * FROM password_reset_tokens WHERE token = 'hashed_token';
  ```

### Password Not Updating

**Check:**
1. Token is valid
2. Password meets requirements (8+ chars)
3. Database connection is working
4. Check server logs

## Production Considerations

### Email Service
- ✅ Verify your domain in Resend
- ✅ Set up SPF/DKIM records
- ✅ Monitor email delivery rates
- ✅ Set up email templates

### Security
- ✅ Enable rate limiting (3 requests per hour per email)
- ✅ Add CAPTCHA for suspicious activity
- ✅ Monitor for abuse
- ✅ Log all reset attempts

### Monitoring
- ✅ Track email delivery success rate
- ✅ Monitor token usage
- ✅ Alert on unusual patterns
- ✅ Clean up old tokens regularly

## Files Created

### Database
- `database/create-password-reset-tokens.sql` - Schema

### Libraries
- `src/lib/email.ts` - Email service
- `src/lib/reset-token.ts` - Token utilities

### API Routes
- `src/app/api/auth/reset-password/route.ts` - Request reset
- `src/app/api/auth/verify-reset-token/route.ts` - Verify token
- `src/app/api/auth/update-password/route.ts` - Update password

### Pages
- `src/app/(full-width-pages)/reset-password/page.tsx` - Request page (updated)
- `src/app/(full-width-pages)/reset-password/[token]/page.tsx` - Confirmation page

### Documentation
- `PASSWORD_RESET_SETUP.md` - This guide

## Next Steps

1. ✅ Install Resend: `npm install resend`
2. ✅ Run database migration
3. ✅ Get Resend API key
4. ✅ Add environment variables
5. ✅ Restart server
6. ✅ Test the flow

---

**Status**: ✅ Ready to use!
**Email Service**: Resend
**Token Expiration**: 1 hour
**Security**: Production-ready
