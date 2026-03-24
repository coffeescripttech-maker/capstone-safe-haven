# SafeHaven Brand Colors & Design System

## 🎨 Current Color Palette

Based on your existing codebase, SafeHaven uses colors inspired by the **Philippine Flag**:

### Primary Colors

```
Primary Blue:   #0038A8  (Philippine Flag Blue)
Secondary Red:  #CE1126  (Philippine Flag Red)
Accent Yellow:  #FCD116  (Philippine Flag Yellow/Gold)
```

### Color Usage

**Primary Blue (#0038A8)**
- Main brand color
- Primary buttons
- Links and interactive elements
- User location markers
- Trust and reliability

**Secondary Red (#CE1126)**
- Emergency/SOS buttons
- Critical alerts
- Danger indicators
- Map markers
- Urgency and action

**Accent Yellow (#FCD116)**
- Highlights
- Warning states
- Attention-grabbing elements
- Sunshine/hope symbolism

---

## 🚨 Severity & Alert Colors

### Disaster Alert Severity

```css
Critical:  #DC2626  (Red-600)    - Immediate danger, life-threatening
High:      #F59E0B  (Amber-500)  - High risk, take action now
Moderate:  #3B82F6  (Blue-500)   - Moderate risk, be prepared
Low:       #10B981  (Green-500)  - Low risk, stay informed
```

### Alert Type Colors

```css
Typhoon:       #3B82F6  (Blue)
Earthquake:    #8B5CF6  (Purple)
Flood:         #06B6D4  (Cyan)
Storm Surge:   #0EA5E9  (Sky Blue)
Volcanic:      #EF4444  (Red)
Tsunami:       #0891B2  (Teal)
Landslide:     #92400E  (Brown)
```

---

## 🎯 UI Color System

### Backgrounds

```css
Background:    #F9FAFB  (Gray-50)   - Main app background
Surface:       #FFFFFF  (White)     - Cards, modals
Card:          #FFFFFF  (White)     - Content containers
```

### Text Colors

```css
Primary:       #1F2937  (Gray-800)  - Main text
Secondary:     #6B7280  (Gray-500)  - Supporting text
Disabled:      #9CA3AF  (Gray-400)  - Inactive text
Inverse:       #FFFFFF  (White)     - Text on dark backgrounds
```

### Border Colors

```css
Light:         #E5E7EB  (Gray-200)  - Subtle borders
Default:       #D1D5DB  (Gray-300)  - Standard borders
Dark:          #9CA3AF  (Gray-400)  - Emphasized borders
```

### Status Colors

```css
Success:       #10B981  (Green-500)  - Successful actions
Warning:       #F59E0B  (Amber-500)  - Warnings
Error:         #EF4444  (Red-500)    - Errors
Info:          #3B82F6  (Blue-500)   - Information
```

---

## 🖼️ Logo Analysis Guide

Since I cannot view the image directly, here's how to extract colors from your logo:

### Method 1: Using Online Tools

1. **Upload to Color Picker**:
   - https://imagecolorpicker.com/
   - https://www.canva.com/colors/color-palette-generator/
   - Upload `orignal_logo.jpg`
   - Click on different parts to extract hex codes

2. **Adobe Color**:
   - https://color.adobe.com/create/image
   - Upload image
   - Get complete color palette

### Method 2: Using Design Software

**Photoshop/GIMP**:
1. Open `orignal_logo.jpg`
2. Use Eyedropper Tool (I)
3. Click on colors to see hex values
4. Note down all main colors

**Figma**:
1. Import image
2. Use Eyedropper
3. Create color styles

### What to Look For

When analyzing your logo, identify:

1. **Primary Brand Color** - Most dominant color
2. **Secondary Color** - Supporting color
3. **Accent Colors** - Highlight colors
4. **Text Color** - If logo has text
5. **Background Color** - If logo has background

---

## 🎨 Recommended Color Palette Structure

Based on disaster management best practices:

### Core Brand Colors (From Logo)
```
Primary:    [Extract from logo]
Secondary:  [Extract from logo]
Accent:     [Extract from logo]
```

### Functional Colors (Keep Current)
```
Success:    #10B981  ✅ Good for confirmations
Warning:    #F59E0B  ⚠️ Good for cautions
Error:      #EF4444  ❌ Good for errors
Info:       #3B82F6  ℹ️ Good for information
```

### Emergency Colors (Keep Current)
```
Critical:   #DC2626  🚨 Immediate danger
SOS:        #CE1126  🆘 Emergency button
Safe:       #10B981  ✅ All clear
```

---

## 🎯 Design Principles

### Color Psychology for Disaster Management

**Blue (#0038A8)**
- Trust, reliability, calm
- Official government color
- Use for: Main interface, navigation, informational content

**Red (#CE1126)**
- Urgency, danger, action
- Grabs attention immediately
- Use for: SOS, critical alerts, emergency actions

**Yellow (#FCD116)**
- Warning, caution, visibility
- High contrast for readability
- Use for: Warnings, highlights, important notices

**Green (#10B981)**
- Safety, success, go-ahead
- Positive reinforcement
- Use for: Safe zones, successful actions, all-clear

---

## 📱 Application Examples

### Mobile App

```typescript
// Current implementation (mobile/src/constants/colors.ts)
export const colors = {
  primary: '#0038A8',      // Philippine Blue
  secondary: '#CE1126',    // Philippine Red
  accent: '#FCD116',       // Philippine Yellow
  
  // ... rest of colors
};
```

### Web Admin Dashboard

```css
/* Tailwind config or CSS variables */
:root {
  --color-brand-50: #eff6ff;
  --color-brand-100: #dbeafe;
  --color-brand-200: #bfdbfe;
  --color-brand-300: #93c5fd;
  --color-brand-400: #60a5fa;
  --color-brand-500: #0038A8;  /* Primary */
  --color-brand-600: #002d86;
  --color-brand-700: #002264;
  --color-brand-800: #001742;
  --color-brand-900: #000c21;
}
```

---

## 🔧 How to Update Colors

### 1. Extract Logo Colors

Run this PowerShell script to help identify colors:

```powershell
# Open logo in default image viewer
Start-Process "web_app/public/images/logo/orignal_logo.jpg"

# Then use online tool to extract colors
Write-Host "Upload to: https://imagecolorpicker.com/" -ForegroundColor Cyan
Write-Host "Or use: https://www.canva.com/colors/color-palette-generator/" -ForegroundColor Cyan
```

### 2. Update Mobile App Colors

Edit `mobile/src/constants/colors.ts`:

```typescript
export const colors = {
  primary: '#YOUR_PRIMARY_COLOR',
  secondary: '#YOUR_SECONDARY_COLOR',
  accent: '#YOUR_ACCENT_COLOR',
  // ... rest
};
```

### 3. Update Web App Colors

Edit `web_app/tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#...',
          500: '#YOUR_PRIMARY_COLOR',
          // ... rest
        }
      }
    }
  }
}
```

---

## 📊 Color Accessibility

### Contrast Ratios (WCAG 2.1)

Ensure your logo colors meet accessibility standards:

- **Normal text**: 4.5:1 minimum
- **Large text**: 3:1 minimum
- **UI components**: 3:1 minimum

### Testing Tools

- https://webaim.org/resources/contrastchecker/
- https://color.adobe.com/create/color-accessibility
- Chrome DevTools Lighthouse

---

## 🎨 Next Steps

1. **Extract Logo Colors**:
   - Use online color picker tool
   - Identify 3-5 main colors
   - Note hex codes

2. **Document Colors**:
   - Create color swatches
   - Name each color
   - Define usage rules

3. **Update Codebase**:
   - Mobile app colors
   - Web app Tailwind config
   - Component styles

4. **Test Accessibility**:
   - Check contrast ratios
   - Test with colorblind simulators
   - Ensure readability

---

## 📝 Color Documentation Template

Once you extract the colors, fill this in:

```markdown
## SafeHaven Official Brand Colors

### Primary Palette
- **Brand Blue**: #______ (Main brand color)
- **Brand Red**: #______ (Emergency/Action)
- **Brand Yellow**: #______ (Warning/Highlight)

### Secondary Palette
- **Dark Blue**: #______ (Headers, emphasis)
- **Light Blue**: #______ (Backgrounds, subtle)
- **Gray**: #______ (Text, borders)

### Usage Guidelines
- Primary Blue: Navigation, buttons, links
- Red: SOS, critical alerts, danger
- Yellow: Warnings, highlights
- Green: Success, safe zones
```

---

## 🤝 Need Help?

If you can describe the logo or share the colors you see, I can:
1. Generate a complete color palette
2. Create Tailwind config
3. Update all color constants
4. Ensure accessibility compliance

**Just tell me the colors you see in the logo!** 🎨
