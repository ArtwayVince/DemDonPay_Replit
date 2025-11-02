# Dem Don Pay - Real-time Salary Alert Platform

## Project Overview
A mobile-first web application that helps Nigerian workers track salary payments across organizations in real-time. Users can report when they receive their salary, see live statistics of payment percentages per organization, chat with colleagues in organization-specific rooms, and receive notifications when salaries start entering.

**Tagline:** "Know when salary enter — before you ask!"

## Tech Stack
- **Frontend:** React + TypeScript + Vite
- **UI:** Tailwind CSS + Shadcn UI components
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (Neon) via Drizzle ORM
- **Real-time:** WebSocket (ws library)
- **State Management:** TanStack Query (React Query v5)
- **Routing:** Wouter
- **Forms:** React Hook Form + Zod validation
- **Date Handling:** date-fns

## Features

### MVP Features (Current Implementation)
1. **Phone Number Authentication**
   - OTP-based login (mock implementation for development)
   - Session management via localStorage
   - Protected routes

2. **Organization Management**
   - Pre-seeded database with 100+ Nigerian organizations
   - Search and filter by type (government/private), sector, and state
   - Organization detail pages with stats and live updates
   - Custom organization submission

3. **Salary Reporting**
   - "SALARY DON ENTER!" reporting button
   - Date selection, optional amount and proof upload
   - Anonymous reporting option
   - Real-time percentage calculations

4. **Live Dashboard**
   - Top organizations with payment percentages
   - Progress bars (green for paid, red for unpaid)
   - Recent activity feed
   - Quick stats overview

5. **Organization-Specific Chat**
   - Real-time chat rooms for each organization
   - WhatsApp-style interface
   - Message history

6. **Follow & Notifications**
   - Follow organizations for updates
   - Push notification alerts when 70%+ report paid
   - In-app notification center

7. **Mobile-First UI**
   - Bottom navigation
   - Responsive design
   - Nigerian pidgin integration in CTAs
   - PWA support (manifest configured)

## Database Schema

### Tables
- **users**: Phone-based authentication, OTP verification
- **organizations**: Pre-seeded Nigerian companies and government bodies
- **reports**: Salary payment reports linked to users and organizations
- **messages**: Chat messages for organization rooms
- **follows**: User-organization follow relationships
- **notifications**: Push notifications and alerts

### Key Relationships
- Users → Reports (one-to-many)
- Organizations → Reports (one-to-many)
- Organizations → Messages (one-to-many)
- Users → Follows → Organizations (many-to-many)

## Project Structure

```
client/
  src/
    components/        # Reusable UI components
      bottom-nav.tsx
      organization-card.tsx
      salary-report-button.tsx
      chat-interface.tsx
      organization-search.tsx
      report-card.tsx
      stats-card.tsx
      loading-skeleton.tsx
      empty-state.tsx
      ui/              # Shadcn components
    pages/             # Route pages
      home.tsx
      organizations.tsx
      organization-detail.tsx
      profile.tsx
      notifications.tsx
      login.tsx
      not-found.tsx
    lib/
      queryClient.ts   # TanStack Query setup
server/
  routes.ts            # API routes + WebSocket setup
  storage.ts           # Database interface
  db.ts                # Drizzle database connection
shared/
  schema.ts            # Drizzle ORM schemas + types
```

## Development Status

### Phase 1: Schema & Frontend ✅ (Current)
- [x] Complete data models defined
- [x] App icon/logo generated
- [x] Design tokens configured (Nigerian fintech colors)
- [x] All React components built:
  - [x] Auth flow (phone + OTP)
  - [x] Dashboard with live stats
  - [x] Organization search and filters
  - [x] Organization detail pages
  - [x] Salary report form
  - [x] Chat interface
  - [x] Profile page
  - [x] Notifications page
  - [x] Bottom navigation
  - [x] All reusable components

### Phase 2: Backend (Next)
- [ ] Database schema implementation
- [ ] DatabaseStorage class
- [ ] API endpoints for all features
- [ ] WebSocket server for real-time chat
- [ ] Seed 100+ Nigerian organizations
- [ ] Real-time percentage calculations
- [ ] Notification triggers

### Phase 3: Integration (Final)
- [ ] Connect frontend to backend APIs
- [ ] WebSocket client integration
- [ ] Error handling and loading states
- [ ] Optimistic updates
- [ ] PWA service worker
- [ ] End-to-end testing

## Design Guidelines
Following `design_guidelines.md`:
- **Colors:** Primary green (#16a34a) for paid, destructive red for unpaid
- **Typography:** Inter (body) + Space Grotesk (headings)
- **Spacing:** Consistent 4px/8px/16px/24px grid
- **Components:** Shadcn UI with hover-elevate/active-elevate-2
- **Mobile-first:** Bottom nav, 56px tap targets, responsive breakpoints
- **Nigerian Pidgin:** Strategic use in CTAs and alerts

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (auto-configured by Replit)
- `SESSION_SECRET`: Session encryption key
- Optional: `TWILIO_*` for production SMS/OTP

## Running the Application
```bash
npm run dev  # Starts both frontend (Vite) and backend (Express)
npm run db:push  # Push schema changes to database
```

## Recent Changes
- **2025-11-02**: Initial project setup with complete frontend implementation
  - Generated app icon and configured PWA manifest
  - Built all MVP components following design guidelines
  - Implemented mock authentication for development
  - Set up routing with protected routes
  - Created comprehensive component library

## Next Steps
1. Implement backend API endpoints and database operations
2. Seed Nigerian organizations database
3. Set up WebSocket server for real-time chat
4. Integrate frontend with backend APIs
5. Test complete user journeys
6. Deploy and configure production SMS provider
