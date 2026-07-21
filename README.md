# Spending Log

> A mobile-first PWA for quickly logging expenses by category, with monthly summaries.

---

## What This Is
A lightweight expense logger built to be used on your phone. Tap to add an expense, pick a category from a dropdown (or type a new one to add it), enter an amount and optional note, and you're done. Expenses are grouped by month and broken down by category so you can see where your money actually goes. No accounts, no bank integration, no subscriptions - just fast, private logging that lives on your device.

---

## Current Status
- **Stage:** In Progress
- **Last updated:** 2026-07-20
- **What's working:** Project structure set up
- **What's not done yet:** All application code

---

## Key Decisions Made
- **2026-07-20** - Chose vanilla HTML/CSS/JS over React because the app is simple enough that a framework would add unnecessary complexity
- **2026-07-20** - Chose localStorage over Supabase because no backend is needed and keeping data on-device is faster and more private
- **2026-07-20** - Chose PWA approach so Sol can install it on his phone home screen and use it offline
- **2026-07-20** - Categories are user-defined via dropdown - no preset list, grows as Sol adds new ones

---

## Tech Stack
- **Frontend:** Vanilla HTML/CSS/JS
- **Backend:** None
- **Database:** localStorage (on-device)
- **Hosting:** GitHub Pages
- **Other:** PWA (manifest.json + service worker for offline + installable)

---

## How to Run It Locally
1. Open `index.html` in any browser - no build step needed
2. Or serve locally with: `python -m http.server 8000` then open `localhost:8000`

---

## Links
- **GitHub repo:** https://github.com/solwatk3/spending-log
- **Live site:** https://solwatk3.github.io/spending-log
- **Design files:** N/A
