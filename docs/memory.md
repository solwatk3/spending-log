# Spending Log - Working Memory

*Notes carried across sessions. Read this at the start of any work on this project; update it as things change.*

---

## What This App Is
A mobile-first PWA expense logger. Sol taps a big "Add Expense" button, enters an amount, picks or types a category (which gets saved to the dropdown for future use), adds an optional note, and saves. The main view shows the current month's expenses and a breakdown by category. All data lives in localStorage - no accounts, no backend, no internet required after install.

## Tech Stack
- Frontend: Vanilla HTML/CSS/JS
- Backend: None
- Database: localStorage (on-device only)
- Hosting: GitHub Pages
- PWA: manifest.json + service worker (offline + home screen installable)

## Project Structure
```
spending-log/
  index.html          - main app (shell + add form + monthly summary)
  style.css           - mobile-first styles
  app.js              - all logic (localStorage, categories, summary)
  manifest.json       - PWA manifest
  sw.js               - service worker for offline support
  icon-192.png        - PWA icon (192x192)
  icon-512.png        - PWA icon (512x512)
  docs/
    memory.md         - this file
```

## Key Facts
- GitHub repo: https://github.com/solwatk3/spending-log
- Live URL: https://solwatk3.github.io/spending-log
- Sol uses this on his phone - everything must be touch-friendly

## Key Decisions Made
- **2026-07-20** - Vanilla HTML/CSS/JS chosen - no framework needed for this scope
- **2026-07-20** - localStorage chosen - no backend needed, keeps data private and fast
- **2026-07-20** - PWA chosen so Sol can install on phone home screen and use offline
- **2026-07-20** - Categories are user-defined only - no hardcoded list, dropdown grows as Sol adds new ones

## Working Preferences
- Concise, direct - no unnecessary explanation.
- Straight-talk, no hedging.

## Coding Rules
- No em dashes anywhere in code, comments, or written content. Use a hyphen or rewrite the sentence.
- All code comments must be ASCII-only. No special punctuation, curly quotes, or Unicode characters.
- Comment everything meaningfully. Every function, section, or non-obvious line needs a plain-English comment.
- Surgical edits only. Never rewrite working code.
- Prefer simple over clever.
- Consistent formatting throughout.

## Open Items / Not Yet Decided
- Color theme / visual design not yet defined

## Session Notes Log
- **2026-07-20**: Project kicked off. Folder structure and all docs created. No code written yet.
