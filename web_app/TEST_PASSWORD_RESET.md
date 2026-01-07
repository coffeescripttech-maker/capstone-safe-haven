# Password Reset Testing Guide

## Current Status
✅ Database migration complete (`password_reset_tokens` table created)
✅ Email service configured with Gmail
✅ Nodemailer import issue fixed
✅ Dev server running

## Test Users Available
- `admin@example.com` (Dexter Miranda)
- `newdexm@gmail.com` (jamaica banaria)

## Testing Steps

### 1. Test Password Reset Request
1. Go to: https://dubail-film-maker-website-portfolio.vercel.app/reset-password
2. Enter email: `admin@example.com`
3. Click "Send Reset Link"
4. Check the server logs for email sending status
5. Check Gmail inbox for `coffeescripttech@gmail.com`

### 2. Expected Behavior
- ✅ Success message shown in UI
- ✅ Email sent via Gmail SMTP
- ✅ Token stored in database (hashed)
- ✅ Email contains reset link with token

### 3. Check Server Logs
Look for:
```
Sending email via gmail...
Email sent via Gmail: <message-id>
Password reset email sent to: admin@example.com
```

### 4. If Email Fails
Check for errors like:
- `nodemailer.createTransporter is not a function` ❌ (should be fixed now)
- Gmail authentication errors
- SMTP connection issues

### 5. Test Reset Link
1. Copy the reset link from email
2. Should look like: `https://dubail-film-maker-website-portfolio.vercel.app/reset-password/[long-token]`
3. Click the link
4. Enter new password
5. Confirm password
6. Submit

### 6. Verify Password Changed
1. Go to: https://dubail-film-maker-website-portfolio.vercel.app/signin
2. Try logging in with new password
3. Should successfully log in

## Current Fix Applied
Changed from:
```typescript
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
```

To:
```typescript
const nodemailer = require('nodemailer');
const mailer = nodemailer.default || nodemailer;
const transporter = mailer.createTransporter({
```

This handles both CommonJS and ES module exports properly.

## Next Steps
1. Test with `admin@example.com`
2. Check if email is received
3. If still failing, we may need to use a different approach (like using fetch API to call an external email service)
