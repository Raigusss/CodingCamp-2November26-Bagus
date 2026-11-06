# Product — To-Do List Life Dashboard

## What it is

A personal productivity dashboard that lives entirely in the browser. No accounts, no server, no install. Open `index.html` and it works.

## Target user

Someone who wants a lightweight daily tool: check the time, run a focus session, manage a short task list, and jump to their most-used websites — all from one tab.

## Core features

| Feature | Description |
|---|---|
| Greeting | Live clock (HH:MM:SS), full Indonesian date, time-aware salutation (pagi / siang / sore / malam), and a customisable name that persists across sessions. |
| Focus Timer | Configurable countdown (1–120 min, default 25). Start / Stop / Reset. Progress bar shrinks in real time. Tab title shows remaining time while running. Plays a soft beep and fires a browser notification when the session ends. |
| To-Do List | Add tasks (Enter or button). Duplicate detection — identical text (case-insensitive) is rejected with a shake animation. Inline edit (click Edit → type → Enter or Save). Mark done via checkbox. Delete individual tasks. Filter by All / Active / Done. Sort by default order, A→Z, or Active-first. Counter shows "X of Y done". "Clear done" removes all completed tasks at once. All data persisted in localStorage. |
| Quick Links | One-click buttons that open favourite URLs in a new tab. Auto-loads favicon via Google's favicon service. Add by label + URL; remove with the × button. Defaults to Google, GitHub, YouTube on first load. |
| Dark / Light mode | Toggle in the top-right corner. Preference stored in localStorage. |

## Design principles

- **Tool, not landing page.** Dense information, left-aligned text, clear hierarchy.
- **Flat and solid.** No gradients, no glassmorphism, no glow/neon effects, no heavy shadows.
- **Single accent.** Terracotta (`#c0614a`) is the only non-neutral colour. Everything else is background, surface, border, or text.
- **Minimal decoration.** No emoji used as icons or decorative elements.
- **Responsive.** Collapses to a single column on mobile (≤480 px).

## Non-goals

- No user accounts or cloud sync.
- No collaboration or sharing.
- No recurring tasks, due dates, or calendar integration.
- No backend of any kind.
