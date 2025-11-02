# Design Guidelines for "Dem Don Pay" - Salary Alert Platform

## Design Framework
**Material Design** + Nigerian fintech aesthetic + WhatsApp-style chat familiarity

**Core Principles:**
1. Mobile-first urgency - critical data at thumb-reach
2. Cultural resonance - natural pidgin integration
3. Real-time clarity - obvious live updates
4. Trust through transparency

---

## Typography

**Fonts:**
- Primary: Inter (UI, data, body)
- Accent: Space Grotesk (headlines, pidgin)

**Scale:**
```
Hero Headlines: Space Grotesk Bold, 28px mobile / 36px tablet+
Section Headers: Space Grotesk SemiBold, 20px mobile / 24px desktop
Body Text: Inter Regular, 16px
Buttons: Inter SemiBold, 15px (ALL CAPS for primary)
Data/Stats: Inter Bold, 18-24px
Chat: Inter Regular, 15px
Captions: Inter Regular, 13px
```

---

## Layout & Spacing

**Spacing:** Tailwind units 2, 4, 6, 8
- Component padding: `p-4` mobile, `p-6` tablet+
- Section spacing: `mb-6`, `gap-6`
- Card spacing: `p-4` internal, `mb-4` between
- Buttons: `px-6 py-3`

**Grid:**
- Mobile: Single column, `px-4` margins
- Tablet (768px+): `max-w-4xl` centered
- Desktop: 2-column where appropriate, `max-w-6xl` for dashboards
- Main content: `max-w-2xl mx-auto`
- Chat: Full viewport height minus nav/input

---

## Color System

*[Note: Original guidelines missing - implement with Nigerian fintech palette: Primary green (success/paid), Red (unpaid), Neutral grays, Accent yellow/gold for highlights]*

---

## Components

### Navigation
**Bottom Nav (Mobile Primary):**
- Fixed bottom, 4 tabs: Home | Organizations | Notifications | Profile
- Heroicons (outline/solid), labels below (13px)
- 56px height, safe area padding (`pb-safe`)

**Top Header:**
- Fixed, 56px height, logo left, search/menu right
- Drop shadow on scroll

### Organization Cards
```
Structure:
- Org name (Bold, 18px)
- Type badge + Location (13px, muted)
- Large percentage (32px Bold) + trend arrow
- Progress bar (h-2, rounded-full)
- "Last paid" timestamp (13px, right)
- Min 56px tap target, full-width
```

### Primary Action Button
**"SALARY DON ENTER! ✅":**
- FAB or full-width pill (h-14)
- Fixed above bottom nav (`bottom-20`)
- `shadow-lg`, ripple effect on tap

### Progress Visualization
- Horizontal bars: `h-3 rounded-full`, animate fill 0.5s
- Stats cards: 2-column mobile, large number (28px Bold) + label (14px muted)
- Circular rings for detail pages

### Search
- Prominent bar (h-12, rounded-lg), search icon left
- Instant filter, group by category
- Filter pills: horizontal scroll, `rounded-full px-4 py-2`

### Chat
**Bubbles:**
- WhatsApp layout (sent right, received left)
- Max-width 80%, `rounded-2xl`
- Timestamp 11px, avatar 32px circle

**Input:**
- Fixed bottom, `rounded-full`, expandable to 3 lines
- Send button: 44px circular icon

### Report Cards
- Timeline vertical layout, left accent bar
- Avatar 40px, amount Bold 18px
- Verification badge, swipe to flag

### Modals
**Bottom Sheet (Mobile):**
- Slides up, sticky header
- Form inputs with Material Design calendar
- Submit button fixed at bottom

**Full-Screen Detail:**
- Close button top-left, scrollable
- Tabs: Reports | Chat | About
- Pull-to-refresh

---

## Page Templates

### Dashboard
1. Header (logo, search, notifications)
2. Quick stats (2-3 cards grid)
3. Filter pills (horizontal scroll)
4. Organization list (vertical scroll)
5. FAB + Bottom nav

### Organization Detail
1. Hero: name, logo, type badge, follow button
2. Live stats banner (large % paid)
3. Tab nav: Reports | Chat | Info
4. Content area (infinite scroll)
5. Action bar (report/chat input)

### Report Flow
1. Org confirmation
2. Date picker (default today)
3. Optional amount (numeric keypad)
4. Optional proof upload (camera)
5. Success (confetti + share)

### Profile
1. Avatar, name/phone, edit
2. Stats row (reports, following, notifications)
3. Following list (unfollow action)
4. Settings

---

## Interactions

**States:**
- Loading: Skeleton screens (shimmer), spinners
- Empty: Illustration + headline + CTA
- Error: Toast (bottom) or inline (red text)

**Gestures:**
- Pull-to-refresh: all lists
- Infinite scroll: load indicator at bottom
- Swipe right: reply (chat)
- Swipe left: flag (reports)
- Swipe down: dismiss modal

---

## Icons
**Library:** Heroicons (outline/solid)

```
Home: Building-Office
Organizations: Building-Library  
Notifications: Bell
Profile: User-Circle
Search: Magnifying-Glass
Report: Plus-Circle / Check-Circle
Chat: Chat-Bubble-Left-Right
Follow: Heart / Star
Share: Arrow-Up-Tray
Calendar: Calendar-Days
Upload: Cloud-Arrow-Up
Filter: Funnel
More: Ellipsis-Horizontal
```

---

## Data Visualization

- **Percentages:** Always visible (e.g., "87%")
- **Trends:** Arrow icons (↑↓→) + comparison text
- **Charts:** Simple bars (7-day trend), minimal grid lines

---

## Nigerian Pidgin Usage

**Strategic Placement:**
```
Buttons:
- "SALARY DON ENTER! ✅"
- "Dem Never Pay 😤"
- "E Don Drop! 💃"

Notifications:
- "Dem don pay for [Org]! 92% confirmed 🎉"

Empty States:
- "No organization yet o! Add your workplace"

Chat:
- "Wetin Dey Happen?", "Gist Me"
```

**Keep English for:** Form labels, settings, legal text, org names

---

## Images

**Organization Logos:**
- 1:1 ratio, 200x200px min
- 48px mobile cards, 80px detail hero
- Fallback: Letter avatar with initials

**User Avatars:**
- Circular: 40px lists, 32px chat, 80px profile

**Proof Screenshots:**
- 60x60px rounded thumbnails
- Full-screen lightbox with zoom

**Empty States:**
- Simple line illustrations, 200px max height, centered

---

## PWA Specifics

**Install Prompt:**
- Custom banner after 3 visits: "Add Dem Don Pay to Home Screen"

**Offline:**
- Cached org list + user data
- Top banner indicator
- Disabled actions with tooltip

**App Icon:**
- 512x512px, vibrant "DDP" monogram or salary symbol
- Safe area for OS masking

---

## Accessibility

- **Tap Targets:** Min 56px height/width
- **Color Contrast:** WCAG AA minimum for all text
- **Focus States:** Visible keyboard navigation
- **Screen Readers:** Semantic HTML, ARIA labels for icons
- **Touch Gestures:** Alternative tap actions for all swipes

---

## Development Notes

- Use Tailwind CSS utilities for spacing consistency
- Implement Material Design ripple effects on interactive elements
- Animate progress bars and percentage changes (0.5s ease)
- Safe area insets for iOS devices
- Test all interactions at 320px viewport minimum