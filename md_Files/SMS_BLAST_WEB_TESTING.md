# SMS Blast - Web Interface Testing Guide

## 🌐 Testing via Web Admin Panel

This guide shows you how to test SMS Blast features through the web interface (if you have the admin dashboard).

---

## Part 1: Access the Admin Dashboard

### Step 1: Start the Web Application

```powershell
# Start backend first
cd MOBILE_APP/backend
npm run dev

# In another terminal, start web app
cd MOBILE_APP/web_app
npm run dev
```

### Step 2: Open Browser

Navigate to: `http://localhost:3000` (or your configured port)

### Step 3: Login

**Superadmin Credentials:**
- Email: `superadmin@safehaven.ph`
- Password: `Admin123!`

**Admin Credentials:**
- Email: `admin.manila@safehaven.ph`
- Password: `Admin123!`

---

## Part 2: Navigate to SMS Blast Section

### Option 1: Via Sidebar Menu

1. Look for **"SMS Blast"** or **"Emergency Alerts"** in the left sidebar
2. Click to expand the menu
3. You should see:
   - 📱 **Send SMS Blast**
   - 📊 **SMS History**
   - 📝 **Templates**
   - 👥 **Contact Groups**
   - 💰 **Credits & Usage**

### Option 2: Via Dashboard Cards

1. On the main dashboard, look for **"SMS Blast"** card
2. Click **"Send Alert"** or **"Manage SMS"** button

---

## Part 3: Send Your First SMS Blast

### Step 1: Click "Send SMS Blast" or "New Alert"

You'll see a form with these sections:

### Step 2: Choose Message Type

**Option A: Custom Message**
- Select **"Custom Message"** radio button
- Type your message in the text area
- Watch the character counter update in real-time

**Option B: Use Template**
- Select **"Use Template"** radio button
- Choose a template from the dropdown:
  - Typhoon Alert
  - Earthquake Alert
  - Flood Warning
  - Evacuation Order
  - All-Clear Notice

### Step 3: Fill in Template Variables (if using template)

If you selected a template, you'll see input fields for variables:

**Example: Typhoon Alert Template**
```
Template: "ALERT: Typhoon {name} approaching {location}. Signal #{signal}. Seek shelter immediately."

Fill in:
- Name: Pepito
- Location: Metro Manila
- Signal: 3

Preview: "ALERT: Typhoon Pepito approaching Metro Manila. Signal #3. Seek shelter immediately."
```

### Step 4: Select Recipients

**Filter by Location:**
- **Province:** Select from dropdown (e.g., Metro Manila, Cebu, Davao)
- **City:** Select from dropdown (e.g., Manila, Quezon City, Makati)
- **Barangay:** Select from dropdown (e.g., Ermita, Diliman, Poblacion)

**Or Use Contact Group:**
- Select a pre-defined contact group from dropdown
- Example: "Metro Manila Residents", "Coastal Communities"

**Recipient Count:**
- Watch the recipient count update as you change filters
- Example: "45 recipients will receive this message"

### Step 5: Choose Language

- **English** - Uses GSM-7 encoding (160 chars per SMS)
- **Filipino** - Uses UCS-2 encoding (70 chars per SMS)

### Step 6: Set Priority

- **🔴 Critical** - Highest priority, sent immediately
- **🟡 High** - High priority, sent soon
- **🟢 Normal** - Normal priority, queued

### Step 7: Schedule (Optional)

**Send Now:**
- Leave "Send Immediately" checked
- SMS will be sent within 1 minute

**Schedule for Later:**
- Uncheck "Send Immediately"
- Select date and time
- Example: "January 15, 2024 at 3:00 PM"

### Step 8: Preview and Review

Click **"Preview"** button to see:

```
┌─────────────────────────────────────────┐
│ SMS Preview                             │
├─────────────────────────────────────────┤
│ Message:                                │
│ ALERT: Typhoon Pepito approaching      │
│ Metro Manila. Signal #3. Seek shelter  │
│ immediately.                            │
│                                         │
│ Recipients: 45 users                    │
│ Location: Metro Manila                  │
│ Language: English                       │
│ Character Count: 85 / 160               │
│ SMS Parts: 1                            │
│ Cost per Recipient: 1 credit            │
│ Total Cost: 45 credits                  │
│                                         │
│ Current Balance: 10,000 credits         │
│ Remaining After Send: 9,955 credits     │
└─────────────────────────────────────────┘
```

### Step 9: Send the SMS

1. Click **"Send SMS Blast"** button
2. A confirmation dialog appears:

```
┌─────────────────────────────────────────┐
│ ⚠️  Confirm SMS Blast                   │
├─────────────────────────────────────────┤
│ You are about to send an SMS to:       │
│                                         │
│ Recipients: 45 users                    │
│ Location: Metro Manila                  │
│ Cost: 45 credits                        │
│                                         │
│ Message Preview:                        │
│ "ALERT: Typhoon Pepito approaching..." │
│                                         │
│ This action cannot be undone.           │
│                                         │
│ [Cancel]  [Confirm Send]                │
└─────────────────────────────────────────┘
```

3. Click **"Confirm Send"**
4. Success message appears:

```
✅ SMS Blast Created Successfully!
Blast ID: blast-uuid-123
45 messages queued for delivery
```

---

## Part 4: Monitor SMS Delivery

### Step 1: Go to SMS History

Click **"SMS History"** in the sidebar

### Step 2: View Blast List

You'll see a table with recent SMS blasts:

```
┌──────────────────────────────────────────────────────────────────────────┐
│ SMS Blast History                                                        │
├──────────┬─────────────────┬────────────┬──────────┬──────────┬─────────┤
│ Date/Time│ Message         │ Recipients │ Status   │ Delivery │ Actions │
├──────────┼─────────────────┼────────────┼──────────┼──────────┼─────────┤
│ 10:35 AM │ ALERT: Typhoon  │ 45         │ ✅ Sent  │ 42/45    │ [View]  │
│ Jan 15   │ Pepito...       │            │          │ (93%)    │         │
├──────────┼─────────────────┼────────────┼──────────┼──────────┼─────────┤
│ 09:20 AM │ TEST: Emergency │ 20         │ ⏳ Queue │ 15/20    │ [View]  │
│ Jan 15   │ alert test...   │            │          │ (75%)    │         │
├──────────┼─────────────────┼────────────┼──────────┼──────────┼─────────┤
│ 08:15 AM │ Flood warning   │ 12         │ ✅ Done  │ 12/12    │ [View]  │
│ Jan 15   │ for Manila...   │            │          │ (100%)   │         │
└──────────┴─────────────────┴────────────┴──────────┴──────────┴─────────┘
```

### Step 3: View Blast Details

Click **"View"** on any blast to see detailed information:

```
┌─────────────────────────────────────────────────────────────┐
│ SMS Blast Details - blast-uuid-123                          │
├─────────────────────────────────────────────────────────────┤
│ Status: ✅ Completed                                        │
│ Created: January 15, 2024 at 10:35 AM                      │
│ Completed: January 15, 2024 at 10:42 AM                    │
│ Duration: 7 minutes                                         │
│                                                             │
│ Message:                                                    │
│ "ALERT: Typhoon Pepito approaching Metro Manila.           │
│  Signal #3. Seek shelter immediately."                     │
│                                                             │
│ Delivery Statistics:                                        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ ✅ Delivered: 42 (93%)  ████████████████████░░              │
│ 📤 Sent: 3 (7%)         ██░░░░░░░░░░░░░░░░░░░░              │
│ ❌ Failed: 0 (0%)       ░░░░░░░░░░░░░░░░░░░░░░              │
│ ⏳ Pending: 0 (0%)      ░░░░░░░░░░░░░░░░░░░░░░              │
│                                                             │
│ Cost:                                                       │
│ Estimated: 45 credits                                       │
│ Actual: 45 credits                                          │
│                                                             │
│ Recipients: Metro Manila (45 users)                         │
│ Language: English                                           │
│ Priority: Critical                                          │
│ Sent by: superadmin                                         │
│                                                             │
│ [Export Report] [View Audit Log]                            │
└─────────────────────────────────────────────────────────────┘
```

### Step 4: Real-Time Updates

The delivery statistics update automatically every 30 seconds while the blast is in progress.

---

## Part 5: Manage Templates

### Step 1: Go to Templates Page

Click **"Templates"** in the SMS Blast menu

### Step 2: View Existing Templates

```
┌────────────────────────────────────────────────────────────────┐
│ SMS Templates                                [+ New Template]  │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ 🌀 Typhoon Alerts                                             │
│ ├─ Typhoon Alert - English                                    │
│ │  "ALERT: Typhoon {name} approaching {location}..."          │
│ │  Variables: name, location, signal                          │
│ │  [Edit] [Use] [Delete]                                      │
│ │                                                              │
│ └─ Typhoon Alert - Filipino                                   │
│    "ALERTO: Papalapit ang Bagyong {name}..."                  │
│    Variables: name, location, signal                          │
│    [Edit] [Use] [Delete]                                      │
│                                                                │
│ 🌊 Flood Warnings                                             │
│ └─ Flood Warning - English                                    │
│    "ALERT: Flood warning for {location}..."                   │
│    Variables: location, level                                 │
│    [Edit] [Use] [Delete]                                      │
│                                                                │
│ 🏃 Evacuation Orders                                          │
│ └─ Evacuation Order - English                                 │
│    "EVACUATION: Residents of {location}..."                   │
│    Variables: location, center, time                          │
│    [Edit] [Use] [Delete]                                      │
└────────────────────────────────────────────────────────────────┘
```

### Step 3: Create New Template

1. Click **"+ New Template"** button
2. Fill in the form:

```
┌─────────────────────────────────────────┐
│ Create New Template                     │
├─────────────────────────────────────────┤
│ Template Name:                          │
│ [Custom Evacuation Alert            ]   │
│                                         │
│ Category:                               │
│ [Evacuation ▼]                          │
│                                         │
│ Language:                               │
│ ○ English  ○ Filipino                   │
│                                         │
│ Message Content:                        │
│ ┌─────────────────────────────────────┐ │
│ │ EVACUATION: Residents of {barangay} │ │
│ │ must evacuate to {center} by {time}.│ │
│ │ Bring essentials only.              │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Detected Variables:                     │
│ • barangay                              │
│ • center                                │
│ • time                                  │
│                                         │
│ [Cancel]  [Save Template]               │
└─────────────────────────────────────────┘
```

3. Click **"Save Template"**
4. Success message: "✅ Template created successfully!"

---

## Part 6: Manage Contact Groups

### Step 1: Go to Contact Groups Page

Click **"Contact Groups"** in the SMS Blast menu

### Step 2: View Existing Groups

```
┌────────────────────────────────────────────────────────────┐
│ Contact Groups                          [+ New Group]      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ 📍 Metro Manila Residents                                 │
│    45 members • Province: Metro Manila                    │
│    Last updated: Jan 15, 2024                             │
│    [Edit] [Send SMS] [Delete]                             │
│                                                            │
│ 🏖️ Coastal Communities                                    │
│    128 members • Multiple locations                       │
│    Last updated: Jan 10, 2024                             │
│    [Edit] [Send SMS] [Delete]                             │
│                                                            │
│ 🏔️ Mountain Barangays                                     │
│    67 members • Province: Benguet                         │
│    Last updated: Jan 8, 2024                              │
│    [Edit] [Send SMS] [Delete]                             │
└────────────────────────────────────────────────────────────┘
```

### Step 3: Create New Contact Group

1. Click **"+ New Group"** button
2. Fill in the form:

```
┌─────────────────────────────────────────┐
│ Create Contact Group                    │
├─────────────────────────────────────────┤
│ Group Name:                             │
│ [Quezon City Residents              ]   │
│                                         │
│ Select Recipients:                      │
│                                         │
│ Province:                               │
│ [Metro Manila ▼]                        │
│                                         │
│ City:                                   │
│ [Quezon City ▼]                         │
│                                         │
│ Barangay: (Optional)                    │
│ [All Barangays ▼]                       │
│                                         │
│ Preview:                                │
│ ┌─────────────────────────────────────┐ │
│ │ 23 active users will be included    │ │
│ │ in this contact group               │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Cancel]  [Create Group]                │
└─────────────────────────────────────────┘
```

3. Click **"Create Group"**
4. Success message: "✅ Contact group created with 23 members!"

---

## Part 7: Monitor Credits and Usage

### Step 1: Go to Credits & Usage Page

Click **"Credits & Usage"** in the SMS Blast menu

### Step 2: View Credit Dashboard

```
┌────────────────────────────────────────────────────────────┐
│ SMS Credits & Usage                                        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Current Balance                                            │
│ ┌────────────────────────────────────────────────────────┐ │
│ │  💰 9,955 Credits                                      │ │
│ │  Last updated: 2 minutes ago                           │ │
│ │  [Refresh Balance]                                     │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ Daily Usage                                                │
│ ┌────────────────────────────────────────────────────────┐ │
│ │  Today: 45 credits used                                │ │
│ │  Daily Limit: 10,000 credits                           │ │
│ │  Remaining: 9,955 credits (99.5%)                      │ │
│ │  ████████████████████░                                 │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ Usage by Time Period                                       │
│ ┌────────────────────────────────────────────────────────┐ │
│ │  Today:     45 credits                                 │ │
│ │  This Week: 234 credits                                │ │
│ │  This Month: 1,567 credits                             │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ Usage by User                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │  superadmin:     45 credits (100%)                     │ │
│ │  admin_manila:   0 credits (0%)                        │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ [Export Usage Report]                                      │
└────────────────────────────────────────────────────────────┘
```

---

## Part 8: Test Different User Roles

### Test as Superadmin

**What you CAN do:**
- ✅ Send SMS to any province, city, or barangay
- ✅ Create and edit templates
- ✅ Create contact groups for any location
- ✅ View all SMS history
- ✅ Export audit logs
- ✅ Manage system settings

**Test this:**
1. Send SMS to Metro Manila ✓
2. Send SMS to Cebu ✓
3. Send SMS to Davao ✓
4. All should succeed!

### Test as Admin (Metro Manila)

**What you CAN do:**
- ✅ Send SMS to Metro Manila only
- ✅ Create contact groups for Metro Manila
- ✅ View your own SMS history
- ✅ Use existing templates

**What you CANNOT do:**
- ❌ Send SMS to other provinces (Cebu, Davao, etc.)
- ❌ Create system-wide templates
- ❌ View other admins' SMS history
- ❌ Modify system settings

**Test this:**
1. Login as `admin.manila@safehaven.ph`
2. Try to send SMS to Metro Manila ✓ (Should work)
3. Try to send SMS to Cebu ✗ (Should show error)

**Expected Error:**
```
┌─────────────────────────────────────────┐
│ ❌ Access Denied                        │
├─────────────────────────────────────────┤
│ You do not have permission to send SMS  │
│ to users in Cebu.                       │
│                                         │
│ Your jurisdiction is limited to:        │
│ • Metro Manila                          │
│                                         │
│ [OK]                                    │
└─────────────────────────────────────────┘
```

### Test as Regular User

**What you CANNOT do:**
- ❌ Access SMS Blast section at all
- ❌ Send any SMS
- ❌ View SMS history
- ❌ Create templates or groups

**Test this:**
1. Login as `user@example.com`
2. Look for SMS Blast in sidebar (Should not appear)
3. Try to access directly: `http://localhost:3000/admin/sms-blast`
4. Should redirect to dashboard or show 403 error

---

## Part 9: Visual Testing Checklist

### ✅ UI Elements Working

- [ ] Character counter updates in real-time
- [ ] Recipient count updates when filters change
- [ ] Cost estimate updates automatically
- [ ] Template variables are detected and shown
- [ ] Preview shows final message correctly
- [ ] Confirmation dialog appears before sending
- [ ] Success message appears after sending
- [ ] Delivery statistics update in real-time
- [ ] Filipino characters display correctly
- [ ] Diacritical marks render properly (ñ, á, é, í, ó, ú)

### ✅ Functionality Working

- [ ] Can send simple SMS
- [ ] Can send SMS using template
- [ ] Can schedule SMS for later
- [ ] Can create custom template
- [ ] Can create contact group
- [ ] Can view SMS history
- [ ] Can view blast details
- [ ] Can export reports
- [ ] Can check credit balance
- [ ] Can view usage statistics

### ✅ Role-Based Access Working

- [ ] Superadmin sees all features
- [ ] Admin sees limited features
- [ ] Admin restricted to jurisdiction
- [ ] Regular user cannot access SMS Blast
- [ ] Unauthorized access shows error

---

## Part 10: Common UI Issues and Fixes

### Issue 1: SMS Blast Menu Not Visible

**Problem:** Can't find SMS Blast in sidebar

**Solution:**
1. Check your user role (must be Admin or Superadmin)
2. Refresh the page (Ctrl + F5)
3. Clear browser cache
4. Check if backend is running

### Issue 2: Recipient Count Shows 0

**Problem:** "0 recipients will receive this message"

**Solution:**
1. Check if users exist in selected location
2. Verify users have phone numbers
3. Ensure users are active (not deactivated)
4. Try selecting a different location

### Issue 3: Character Counter Not Updating

**Problem:** Counter stuck at 0 or not changing

**Solution:**
1. Refresh the page
2. Clear browser cache
3. Check browser console for JavaScript errors (F12)
4. Try a different browser

### Issue 4: Filipino Characters Not Displaying

**Problem:** Filipino text shows as boxes or question marks

**Solution:**
1. Ensure browser supports UTF-8
2. Check page encoding (should be UTF-8)
3. Try a different browser (Chrome, Firefox, Edge)
4. Update your browser to latest version

### Issue 5: Send Button Disabled

**Problem:** Cannot click "Send SMS Blast" button

**Possible Reasons:**
- Message is empty
- No recipients selected
- Insufficient credits
- Missing template variables
- Form validation errors

**Solution:**
1. Check for error messages in red
2. Fill in all required fields
3. Verify credit balance
4. Complete all template variables

---

## Summary

You now know how to test the SMS Blast feature through the web interface! 

**Quick Testing Flow:**
1. Login as Superadmin
2. Go to SMS Blast → Send SMS Blast
3. Type a test message
4. Select Metro Manila
5. Choose English language
6. Click Preview
7. Click Send
8. Go to SMS History to monitor delivery

**For detailed API testing, see:**
- `SMS_BLAST_TESTING_GUIDE.md` - Complete API testing guide
- `SMS_BLAST_QUICK_TEST.md` - Quick reference for API tests

Happy Testing! 🎉
