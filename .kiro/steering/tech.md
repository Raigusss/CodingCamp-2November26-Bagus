# Tech — To-Do List Life Dashboard

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Markup | HTML5 (semantic elements: `<header>`, `<section>`, `<form>`, `<ul>`) | Structure and accessibility without overhead |
| Styles | CSS3 with custom properties (variables) | Theming (light/dark) via a single `data-theme` attribute swap on `<html>` |
| Logic | Vanilla JavaScript (ES2020+, `"use strict"`) | No build step, no dependencies, runs directly in any modern browser |
| Persistence | `localStorage` (JSON serialised) | Zero-backend; survives page refresh and browser restart |
| Font | Inter via Google Fonts (`@import` in CSS) | Clean, legible, widely available; falls back to `system-ui` |
| Audio | Web Audio API (`AudioContext`) | Generates the end-of-session beep in code — no audio file required |
| Favicon fetch | `https://www.google.com/s2/favicons?domain=<origin>&sz=32` | Automatic favicons for Quick Links without storing image data |
| Notifications | Browser Notification API | Optional; permission requested once on page load |

## Browser support

Targets current versions of Chrome, Firefox, Edge, and Safari. No polyfills needed for the APIs used.

## Constraints (enforced)

- **No frameworks.** React, Vue, Svelte, Alpine, etc. are all off-limits.
- **No CSS frameworks.** No Tailwind, Bootstrap, or utility libraries.
- **No build tools.** No Webpack, Vite, Parcel, or TypeScript compilation. The source files are the deployment artefacts.
- **No backend.** No Node.js server, no API calls to a first-party endpoint, no database.
- **One CSS file, one JS file.** All styles in `css/style.css`; all logic in `js/script.js`. Do not split into modules or partials.

## localStorage keys

| Key | Type | Description |
|---|---|---|
| `ldash_theme` | `"light"` \| `"dark"` | Active colour theme |
| `ldash_name` | `string` | Custom name shown in greeting |
| `ldash_timer_duration` | `number` (minutes) | Configurable Pomodoro length |
| `ldash_todos` | `Array<{id, text, done}>` | All tasks |
| `ldash_filter` | `"all"` \| `"active"` \| `"done"` | Active task filter |
| `ldash_sort` | `"default"` \| `"az"` \| `"status"` | Active task sort order |
| `ldash_links` | `Array<{id, label, url}>` | Saved quick links |

## Code conventions

- `"use strict"` at the top of `script.js`.
- Each feature is grouped into a clearly labelled section (`SECTION 1`, `SECTION 2`, …).
- `init*()` functions wire up DOM event listeners and call the first render; they are called once from the `DOMContentLoaded` handler at the bottom.
- `render*()` functions are pure in effect: they read state from localStorage and rebuild the relevant DOM subtree from scratch. Never patch the DOM incrementally outside of the inline-edit flow.
- Comments are written in English.
- No inline styles except for one-off overrides that don't warrant a CSS class (e.g. `max-width: 180px` on the name input).

## Design tokens (CSS variables)

All colours, radius, gap, and font are defined as CSS custom properties on `:root` and overridden under `[data-theme="dark"]`. Never hard-code colour values outside these two rule-sets.

```
--bg            background of the page
--surface       background of panels/cards
--border        1 px border colour
--text          primary text
--text-muted    secondary / placeholder text
--accent        terracotta #c0614a  (the only accent)
--accent-text   text on accent backgrounds (#fff)
--danger        destructive action colour
--radius        border-radius (5 px)
--gap           base spacing unit (16 px)
```
