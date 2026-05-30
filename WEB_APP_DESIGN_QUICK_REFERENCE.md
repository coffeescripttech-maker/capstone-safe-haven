# Web App Design System - Quick Reference

## 🎨 SafeHaven Color Palette

### Primary Colors
```tsx
// Safe Blue (Primary)
className="bg-brand-500 text-white"           // Buttons, primary actions
className="hover:bg-brand-600"                // Hover states
className="border-brand-500"                  // Borders
className="text-brand-600"                    // Text links

// Emergency Red
className="bg-emergency-500 text-white"       // Emergency alerts
className="text-emergency-600"                // Emergency text

// Electric Yellow (Accent)
className="bg-electric-500 text-gray-900"     // Highlights, warnings
```

### Status Colors
```tsx
// Success (Green)
className="bg-success-500 text-white"         // Success buttons
className="bg-success-50 text-success-700"    // Success badges
className="text-success-600"                  // Success text

// Error (Red)
className="bg-error-500 text-white"           // Error buttons
className="bg-error-50 text-error-700"        // Error badges
className="text-error-600"                    // Error text

// Warning (Amber)
className="bg-warning-500 text-white"         // Warning buttons
className="bg-warning-50 text-warning-700"    // Warning badges
className="text-warning-600"                  // Warning text

// Info (Blue)
className="bg-info-500 text-white"            // Info buttons
className="bg-info-50 text-info-700"          // Info badges
className="text-info-600"                     // Info text
```

### Disaster-Specific Colors
```tsx
// Fire Orange
className="bg-orange-500 text-white"          // Fire incidents
className="from-orange-500 to-orange-600"     // Fire gradients

// Storm Blue
className="bg-storm-500 text-white"           // Storm/flood alerts
className="from-storm-500 to-storm-600"       // Storm gradients
```

### Severity Colors
```tsx
// Critical
className="bg-emergency-500"                  // Critical severity
className="from-emergency-500 to-emergency-600"

// High
className="bg-orange-500"                     // High severity
className="from-orange-500 to-orange-600"

// Moderate
className="bg-warning-500"                    // Moderate severity
className="from-warning-500 to-warning-600"

// Low
className="bg-success-500"                    // Low severity
className="from-success-500 to-success-600"
```

## 📝 Typography

### Headings
```tsx
// H1 - Page titles
className="text-3xl font-bold text-gray-900"
// or
className="text-title-lg font-bold text-gray-900"

// H2 - Section titles
className="text-2xl font-bold text-gray-900"
// or
className="text-title-md font-bold text-gray-900"

// H3 - Subsection titles
className="text-xl font-bold text-gray-900"
// or
className="text-title-sm font-semibold text-gray-900"

// H4 - Card titles
className="text-lg font-semibold text-gray-900"
```

### Body Text
```tsx
// Regular body text
className="text-base text-gray-700"

// Secondary text
className="text-sm text-gray-600"
// or
className="text-theme-sm text-gray-600"

// Small text / captions
className="text-xs text-gray-500"
// or
className="text-theme-xs text-gray-500"
```

### Font Weights
```tsx
className="font-normal"    // 400
className="font-medium"    // 500
className="font-semibold"  // 600
className="font-bold"      // 700
```

## 🎯 Common Patterns

### Buttons

#### Primary Button
```tsx
<button className="px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium shadow-md hover:shadow-lg">
  Primary Action
</button>
```

#### Secondary Button
```tsx
<button className="px-6 py-3 bg-white text-brand-600 border-2 border-brand-500 rounded-lg hover:bg-brand-50 transition-colors font-medium">
  Secondary Action
</button>
```

#### Danger Button
```tsx
<button className="px-6 py-3 bg-error-500 text-white rounded-lg hover:bg-error-600 transition-colors font-medium shadow-md hover:shadow-lg">
  Delete
</button>
```

#### Success Button
```tsx
<button className="px-6 py-3 bg-success-500 text-white rounded-lg hover:bg-success-600 transition-colors font-medium shadow-md hover:shadow-lg">
  Confirm
</button>
```

#### Button with Icon
```tsx
<button className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition flex items-center gap-2">
  <Icon className="w-4 h-4" />
  Action
</button>
```

### Cards

#### Standard Card
```tsx
<div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
  {/* Card content */}
</div>
```

#### Elevated Card (Hover Effect)
```tsx
<div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 p-6 border border-gray-100 hover:border-brand-300">
  {/* Card content */}
</div>
```

#### Card with Gradient Icon
```tsx
<div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
  <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg mb-4">
    <Icon className="w-6 h-6" />
  </div>
  {/* Card content */}
</div>
```

### Badges

#### Status Badge
```tsx
<span className="px-3 py-1 rounded-full text-xs font-medium bg-success-100 text-success-700">
  Active
</span>
```

#### Severity Badge
```tsx
<span className="px-3 py-1 rounded-full text-xs font-medium bg-emergency-100 text-emergency-700">
  Critical
</span>
```

#### Count Badge
```tsx
<span className="px-2.5 py-1 rounded-full text-xs font-bold bg-error-500 text-white">
  5
</span>
```

### Form Inputs

#### Text Input
```tsx
<input
  type="text"
  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
  placeholder="Enter text..."
/>
```

#### Input with Error
```tsx
<input
  type="text"
  className="w-full px-4 py-3 border-2 border-error-500 rounded-lg focus:ring-2 focus:ring-error-500 transition"
  placeholder="Enter text..."
/>
<p className="text-sm text-error-600 mt-1">Error message</p>
```

#### Select Dropdown
```tsx
<select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

### Alerts/Notifications

#### Success Alert
```tsx
<div className="p-4 bg-success-50 border border-success-200 rounded-lg flex items-start gap-3">
  <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0" />
  <div>
    <h4 className="font-semibold text-success-900">Success!</h4>
    <p className="text-sm text-success-700">Your action was completed successfully.</p>
  </div>
</div>
```

#### Error Alert
```tsx
<div className="p-4 bg-error-50 border border-error-200 rounded-lg flex items-start gap-3">
  <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0" />
  <div>
    <h4 className="font-semibold text-error-900">Error!</h4>
    <p className="text-sm text-error-700">Something went wrong.</p>
  </div>
</div>
```

#### Warning Alert
```tsx
<div className="p-4 bg-warning-50 border border-warning-200 rounded-lg flex items-start gap-3">
  <AlertTriangle className="w-5 h-5 text-warning-600 flex-shrink-0" />
  <div>
    <h4 className="font-semibold text-warning-900">Warning!</h4>
    <p className="text-sm text-warning-700">Please review this information.</p>
  </div>
</div>
```

### Loading States

#### Spinner
```tsx
<div className="flex items-center justify-center">
  <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
</div>
```

#### Button Loading
```tsx
<button className="px-6 py-3 bg-brand-500 text-white rounded-lg flex items-center gap-2" disabled>
  <Loader2 className="w-4 h-4 animate-spin" />
  Loading...
</button>
```

### Empty States
```tsx
<div className="text-center py-12">
  <div className="text-gray-300 mb-3 flex justify-center">
    <Icon className="w-16 h-16" />
  </div>
  <h3 className="text-lg font-semibold text-gray-900 mb-1">No items found</h3>
  <p className="text-sm text-gray-600">Get started by creating a new item.</p>
</div>
```

## 🎭 Gradients

### Background Gradients
```tsx
// Primary gradient
className="bg-gradient-to-br from-brand-500 to-brand-600"

// Emergency gradient
className="bg-gradient-to-br from-emergency-500 to-emergency-600"

// Success gradient
className="bg-gradient-to-br from-success-500 to-success-600"

// Fire gradient
className="bg-gradient-to-br from-orange-500 to-orange-600"

// Storm gradient
className="bg-gradient-to-br from-storm-500 to-storm-600"
```

## 📦 Spacing

### Padding
```tsx
className="p-4"    // 16px all sides
className="p-6"    // 24px all sides
className="px-4 py-3"  // 16px horizontal, 12px vertical
```

### Margin
```tsx
className="mb-4"   // 16px bottom
className="mb-6"   // 24px bottom
className="mt-8"   // 32px top
```

### Gap (Flexbox/Grid)
```tsx
className="gap-2"  // 8px
className="gap-4"  // 16px
className="gap-6"  // 24px
```

## 🎨 Shadows

```tsx
className="shadow-sm"          // Subtle shadow
className="shadow-md"          // Medium shadow (default for cards)
className="shadow-lg"          // Large shadow
className="shadow-xl"          // Extra large shadow (hover states)
className="shadow-theme-md"    // Custom theme shadow
```

## 🔲 Border Radius

```tsx
className="rounded-lg"   // 12px (standard for cards)
className="rounded-xl"   // 16px (larger cards)
className="rounded-full" // Fully rounded (badges, avatars)
className="rounded-md"   // 8px (buttons, inputs)
```

## 🌙 Dark Mode

All colors automatically support dark mode via the `dark:` prefix:

```tsx
className="bg-white dark:bg-gray-900"
className="text-gray-900 dark:text-white"
className="border-gray-200 dark:border-gray-800"
```

## 🎯 Best Practices

1. **Use semantic colors**: `brand-500` for primary actions, `emergency-500` for alerts
2. **Consistent spacing**: Use multiples of 4 (4, 8, 12, 16, 24, 32, 48)
3. **Hover states**: Always add hover effects to interactive elements
4. **Transitions**: Add `transition` or `transition-all` for smooth animations
5. **Shadows**: Use shadows to create depth and hierarchy
6. **Border radius**: Use `rounded-lg` for cards, `rounded-md` for buttons
7. **Font weights**: Use `font-semibold` for headings, `font-medium` for buttons
8. **Icons**: Size icons consistently (w-4 h-4 for inline, w-6 h-6 for cards)

## 📱 Responsive Design

```tsx
// Mobile first approach
className="text-sm md:text-base lg:text-lg"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
className="p-4 md:p-6 lg:p-8"
```

## 🔗 Links

```tsx
// Primary link
className="text-brand-600 hover:text-brand-700 font-semibold"

// Link with icon
className="text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 group"
```

---

**Remember:** The web app already has all these colors and utilities configured in `globals.css`. Just use the class names directly!
