# CLAUDE.md — job-radar-pwa

> Context file for Claude sessions working on this repo.
> Always read this first before making any changes.

---

## What this repo is

**job-radar-pwa** is the user-facing Progressive Web App for India Job Radar. It's an invite-only job feed for analyst, strategy, and business analyst roles at Indian companies. Jobs are scraped by three separate backend scrapers and pushed to Supabase — this PWA reads from Supabase and displays them.

Live URL: **job-radar-pwa.vercel.app**  
Repo: **github.com/Rashtriyarifles/job-radar-pwa**  
Deploy: Vercel GitHub integration (auto-deploys on push to `main`)

---

## Stack

| Layer | Tech |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS (custom design tokens, see below) |
| Backend | Supabase (Postgres + Auth + JS client) |
| Hosting | Vercel (SPA rewrites via `vercel.json`) |
| PWA | `vite-plugin-pwa` + Workbox |

---

## File structure

```
job-radar-pwa/
├── index.html
├── vite.config.js                  ← Vite + PWA plugin
├── tailwind.config.js              ← Custom color tokens
├── postcss.config.js
├── vercel.json                     ← SPA rewrites + SW cache headers
├── package.json
├── .env                            ← VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (not in git)
├── .env.example
├── pipeline_tracker.html           ← Standalone task tracker (no build needed)
├── push_jobs_to_supabase.py        ← Reference copy of the push script
├── src/
│   ├── main.jsx                    ← Entry point: BrowserRouter + AuthProvider + App
│   ├── App.jsx                     ← Routes + auth guard (ProtectedRoute) + ADMIN_EMAILS
│   ├── index.css                   ← Tailwind base + scrollbar-hide utility
│   ├── lib/
│   │   └── supabase.jsx            ← Supabase client (reads from import.meta.env)
│   ├── hooks/
│   │   ├── useAuth.jsx             ← AuthContext: user, profile, signUp, signIn, signOut, updateProfile
│   │   └── useJobs.jsx             ← useJobs(filters) + useSavedJobs(userId)
│   ├── components/
│   │   ├── JobCard.jsx             ← Job card with badges, apply/save/applied buttons
│   │   ├── FilterBar.jsx           ← Search input + category pills + expanded filter panel
│   │   └── BottomNav.jsx           ← Fixed bottom nav: Jobs / Saved / Profile / Admin
│   └── pages/
│       ├── Auth.jsx                ← Sign in / Sign up form
│       ├── Onboarding.jsx          ← 4-step profile setup (full name mandatory at step 0)
│       ├── Jobs.jsx                ← Main feed: new today + all openings
│       ├── Saved.jsx               ← Saved + Applied tabs
│       ├── Profile.jsx             ← Profile view + edit name/role + sign out
│       ├── Admin.jsx               ← Admin console: requests / all users / system tabs
│       └── Pending.jsx             ← Access pending or denied screen
```

---

## Supabase

**URL:** `https://ajoymshdwmloeuxxltgs.supabase.co`  
Same Supabase instance shared with `job-radar` and `career-scraper` repos.

### Tables used by the PWA

**`jobs`** — main feed (written by scrapers, read-only from PWA)
```
id, title, company, url, location, category, pay_level, ats,
first_seen, is_iim, posted_pretty, ...
```

**`profiles`** — one row per auth user
```
id (= auth.uid), email, full_name, status ('pending'|'approved'|'denied'),
current_role, experience_years, domains[], locations[], linkedin_url,
onboarding_complete, created_at, approved_at
```

**`saved_jobs`** — user bookmarks and applications
```
user_id, job_id, status ('saved'|'applied')
```

---

## Auth & access flow

```
Sign up → profile created with status='pending'
Admin sees request in Admin console → approves or denies
Approved → user can access /jobs
Denied → locked on /pending screen

Admin detection: email in ADMIN_EMAILS list (hardcoded in 3 files)
Admins bypass approval check entirely
```

### ADMIN_EMAILS (hardcoded — must be kept in sync across all 3 files)

```
App.jsx          → const ADMIN_EMAILS = [...]
Admin.jsx        → const ADMIN_EMAILS = [...]
Onboarding.jsx   → const ADMIN_EMAILS = [...]
```

Current admin accounts:
- `abhijeetsinghtomer@gmail.com`
- `abhijeet.monotype@gmail.com`
- `abhijeet.tomar@monotype.com`

---

## Design tokens (Tailwind)

Always use these tokens — never raw hex values inline:

| Token | Hex | Use |
|---|---|---|
| `radar-dark` | `#1a1a18` | Header bg, primary buttons, active states |
| `radar-bg` | `#f5f4ee` | Page background |
| `radar-border` | `#e5e4dc` | All borders |
| `radar-muted` | `#888780` | Secondary text, icons |
| `radar-green` | `#1d9e75` | New badge, success states, progress |
| `radar-blue` | `#378add` | Info states |
| `radar-amber` | `#ba7517` | Warning states |

---

## Data flow

```
job_radar.py (ATS APIs, 135 cos)
career_scraper.py (60 cos)           → push_jobs_to_supabase.py → Supabase jobs table
beacon/career_scraper.py (196 cos)                                        ↓
                                                               PWA fetches via Supabase JS
                                                               Filters applied client-side
                                                               User clicks Apply → career page
```

---

## Key logic notes

### useJobs filters (useJobs.jsx)
```js
filters.category  → .eq('category', value)
filters.location  → .ilike('location', '%value%')
filters.pay       → .eq('pay_level', value)
filters.search    → .or('title.ilike.%v%,company.ilike.%v%')
filters.source    → .eq('ats', value)
// Always: order by first_seen DESC, limit 50
```

### New today logic (Jobs.jsx)
Jobs where `Date.now() - new Date(first_seen) < 86400000` (24h) appear in the "New Today" section.

### useSavedJobs
`savedIds` is a `Map<job_id, status>` where status is `'saved'` or `'applied'`.
Pass `savedIds instanceof Map ? savedIds.get(job.id) : null` as `savedStatus` to JobCard.

### JobCard badges
- **Category**: consulting / finance / mnc / startup / vc_fund / accelerator / staffing / fmcg
- **Pay**: Very High / High / Mid-High / Mid
- **Source**: greenhouse / lever / workday / career_page / linkedin / wellfound
- **is_iim**: shows "IIM Recruiter" badge in emerald
- **isNew**: green "New" badge passed from parent

---

## Routing

```
/               → Auth (sign in/up) — redirects to /jobs if already logged in
/onboarding     → Onboarding (auth required, no approval check)
/pending        → Pending/denied screen (auth required)
/jobs           → Main feed (auth + approved)
/saved          → Saved/applied (auth + approved)
/profile        → Profile (auth + approved)
/admin          → Admin console (auth required; non-admin sees locked screen)
*               → Redirect to /
```

---

## Environment variables

```bash
VITE_SUPABASE_URL=https://ajoymshdwmloeuxxltgs.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

For Vercel: set in project settings → Environment Variables.  
For local dev: copy `.env.example` → `.env` and fill in values.

---

## Dev commands

```bash
npm install          # install dependencies
npm run dev          # local dev server (localhost:5173)
npm run build        # production build → dist/
npm run preview      # preview production build locally
```

Vercel auto-deploys on push to `main`. No manual deploy needed.

---

## Pipeline tracker

`pipeline_tracker.html` in the repo root is a standalone HTML task tracker (no build step). Open it in any browser. State is saved in `localStorage`. It tracks all pending work across the 3-scraper architecture including PWA tasks.

---

## Sibling repos (do NOT mix code across these)

| Repo | Purpose |
|---|---|
| `Rashtriyarifles/job-radar` | ATS API scraper (Greenhouse/Lever/Workday/Wellfound/LinkedIn/Staffing) — 135 cos |
| `Rashtriyarifles/career-scraper` | Career page scraper (60 cos, 4-layer extraction) |
| `Rashtriyarifles/beacon` | Beacon scraper (196 cos, career pages only, Playwright-heavy) |
| `Rashtriyarifles/job-radar-pwa` | **This repo** — React PWA |

All 4 push to the same Supabase instance. The PWA is read-only from the jobs table.

---

## Common tasks reference

**Add a new filter option** → edit `FilterBar.jsx` (CATEGORIES / PAY_LEVELS / LOCATIONS / SOURCES arrays)

**Add a new admin email** → edit ADMIN_EMAILS in `App.jsx`, `Admin.jsx`, and `Onboarding.jsx`

**Change job card badge style** → edit `CAT_STYLES`, `PAY_STYLES`, or `SOURCE_LABELS` in `JobCard.jsx`

**Change fetch limit or sort** → edit `useJobs.jsx` query (`.limit()` or `.order()`)

**Add a new page** → create `src/pages/NewPage.jsx`, add route in `App.jsx`, add nav link in `BottomNav.jsx` if needed

**Add new Supabase table** → update `src/lib/supabase.jsx` if needed (client is already initialised), add query in relevant hook or page

**Update onboarding steps** → edit `Onboarding.jsx` (DOMAINS / LOCATIONS / EXPERIENCE arrays + step JSX blocks)
