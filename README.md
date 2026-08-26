# Lensreel — Videographer Portfolio & Booking Site

Next.js (App Router, TypeScript) + MongoDB. Portfolio covering weddings,
conferences/corporate events, school events, and college events, plus a
live booking calendar backed by a database.

## Design

Cinematic teal-and-orange color-grade palette (the classic film grading
look) on a near-black base, condensed display type for headings, and a
timecode motif (`00:00:12:04`) used throughout as section dividers —
mirroring how the videographer's own editing timeline works. The homepage
hero is framed like a video player, with the four event categories shown
as chapter markers on a scrubber bar.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4)
- **MongoDB** via Mongoose
- Self-hosted fonts (`@fontsource`) — no external font requests at runtime
- Zero extra UI kit — the calendar, cards, and form are hand-built to match the design system exactly

## Pages

| Route | What it does |
|---|---|
| `/` | Hero, featured work, category overview, booking CTA |
| `/portfolio` | Full project gallery, filterable by category |
| `/booking` | Calendar + booking form, backed by live availability |
| `/admin` | Passcode-gated list of bookings; confirm/decline each one |

## API routes

| Route | Method | Purpose |
|---|---|---|
| `/api/availability` | GET | Public — returns already-booked dates so the calendar can grey them out |
| `/api/bookings` | POST | Public — submits a new booking request (rejects if the date is already taken) |
| `/api/bookings` | GET | Admin — `?passcode=...` — lists all bookings |
| `/api/bookings/[id]` | PATCH | Admin — updates a booking's status (`confirmed` / `declined`) |

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the env file and fill in your own values:
   ```bash
   cp .env.local.example .env.local
   ```
   - `MONGODB_URI` — a MongoDB Atlas (or self-hosted) connection string. Atlas has a free tier — create a cluster, add a database user, and copy the connection string in.
   - `ADMIN_PASSCODE` — any string you choose. This gates `/admin`; it's a simple shared secret, not full authentication, so keep it private and treat it as a placeholder if you later want real login.
3. Run the dev server:
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:3000`. Submit a test booking on `/booking`, then check it on `/admin` with your passcode.

## Editing the portfolio content

Project entries and category descriptions live in `src/lib/portfolio-data.ts`
— no CMS wired up yet, so update that file (or swap it for a database
collection later) as real work comes in. Card thumbnails are currently a
placeholder film-strip pattern; drop real cover images in and update
`PortfolioCard.tsx` when you have photos/stills to use.

## Deploying

Works well on Vercel (same team as Next.js):
1. Push this to a GitHub repo.
2. Import it in Vercel.
3. Add `MONGODB_URI` and `ADMIN_PASSCODE` as environment variables in the Vercel project settings.
4. Deploy.

Make sure your MongoDB Atlas cluster's network access allows connections
from anywhere (`0.0.0.0/0`) or from Vercel's IP ranges, since serverless
functions don't have a fixed IP.

## Notes / next steps

- Double-booking is checked both in the API (rejects a POST for a taken date) and reflected instantly in the UI calendar.
- `/admin` passcode is a lightweight gate for a single-operator studio. If more than one person needs access, swap it for real auth (NextAuth, Clerk, etc.) later.
- Email confirmations aren't wired up — bookings currently just land in MongoDB with `status: "pending"`. Adding a transactional email step (Resend, Postmark) on successful POST would be a natural next addition.
