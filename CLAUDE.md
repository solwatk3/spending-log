# AI Instructions - Spending Log

> Project-specific instructions for any AI working in this folder.
> For Sol's general preferences and rules, see the global system instructions.

---

## What This Project Is
A mobile-first PWA (Progressive Web App) for logging daily expenses by category. Categories are user-defined via a dropdown that grows as you add new ones. Shows monthly summaries with a breakdown by category. All data stored locally on the device via localStorage - no backend, no accounts.

## Where We Are
Project just kicked off. Folder structure created. No code written yet.

## How to Get Up to Speed
1. Read `docs/memory.md` first before doing anything else.
2. Read `README.md` for full project context and key decisions.
3. Read `session-log.md` starting from the most recent entry at the top.
4. Check `progress.md` to see what's done and what's next.
5. Then ask Sol if anything is unclear before starting work.

## Project-Specific Rules
- This is a PWA - always maintain the manifest.json and service worker for offline/installable support.
- Mobile-first design only. Touch targets must be large and finger-friendly.
- No external APIs, no accounts, no backend. Everything lives in localStorage.
- Categories are user-defined via dropdown - never hardcode a category list.
- Keep the UI dead simple. Sol uses this on his phone on the go.
