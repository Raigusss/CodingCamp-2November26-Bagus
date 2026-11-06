# Structure — To-Do List Life Dashboard

## File tree

```
project-root/
├── index.html          # Single-page entry point; all markup lives here
├── css/
│   └── style.css       # All styles — variables, layout, components, responsive
├── js/
│   └── script.js       # All logic — state, rendering, event wiring
├── .kiro/
│   └── steering/
│       ├── product.md  # What the app is and what it does
│       ├── tech.md     # Stack, constraints, conventions, design tokens
│       └── structure.md  ← this file
└── README.md
```

**Rule: do not add more files.** One HTML, one CSS, one JS. Any new feature goes into the existing three source files.

## index.html layout

The page is divided into three vertical zones:

```
┌─────────────────────────────────────────────────┐
│  TOP BAR  (greeting left · theme toggle right)  │
├──────────────────┬──────────────────────────────┤
│  Focus Timer     │  Quick Links                 │
│  (1 col)         │  (2 cols)                    │
├──────────────────┴──────────────────────────────┤
│  Tasks  (full width)                            │
└─────────────────────────────────────────────────┘
```

The `.grid` div uses `grid-template-columns: 1fr 2fr` for the middle row.  
The `.grid-bottom` div is a single full-width section.  
Both collapse to a single column on narrow screens (≤720 px).

## script.js sections

| Section | Responsibility |
|---|---|
| 1 — Storage helpers | `storage.get(key, fallback)` and `storage.set(key, value)` — thin wrappers around `localStorage` with JSON parse/stringify and error handling |
| 2 — Theme | `initTheme()`, `applyTheme(theme)` — reads/writes `ldash_theme`, sets `data-theme` on `<html>` |
| 3 — Greeting | `initGreeting()` — 1 s `setInterval` that updates clock, date, and salutation; handles name form submission |
| 4 — Focus Timer | `initTimer()`, `timerStart/Stop/Reset()`, `updateTimerDisplay()`, `playBeep()` — countdown logic, progress bar, tab-title update, Web Audio beep, Notification API |
| 5 — To-Do List | `initTodos()`, `renderTodos()`, `buildTodoItem()`, `activateTodoEdit()`, `addTodo/deleteTodo/toggleTodoDone/updateTodoText/clearDoneTodos()`, `applyFilter/applySort()`, `isDuplicate()`, `updateTodoCounter()` |
| 6 — Quick Links | `initLinks()`, `renderLinks()`, `addLink/deleteLink()`, `faviconUrl()` |
| 7 — Bootstrap | `DOMContentLoaded` listener that calls all `init*()` functions in order |

## style.css sections

| Section | Contents |
|---|---|
| Font import | Google Fonts `@import` for Inter |
| CSS variables | `:root` (light) and `[data-theme="dark"]` overrides |
| Reset & base | Box-sizing reset, `body` defaults, theme transition |
| Layout | `.app-wrapper`, `.top-bar`, `.grid`, `.grid-bottom`, responsive breakpoints |
| Panel | `.panel`, `.panel-title` |
| Greeting | `.greeting-time`, `.greeting-date`, `.greeting-message`, `.greeting-name-form` |
| Focus Timer | `.timer-display`, `.timer-progress-track/bar`, `.timer-controls`, `.timer-settings` |
| To-Do List | `.todo-toolbar`, `.todo-filters`, `.todo-filter-btn`, `.todo-meta`, `.todo-counter`, `.todo-input-row`, `.todo-sort-row`, `.todo-list`, `.todo-item`, `.todo-checkbox`, `.todo-text`, `.todo-actions`, `.todo-empty`, `@keyframes shake/fadeIn` |
| Quick Links | `.links-grid`, `.link-btn`, `.link-favicon`, `.link-remove`, `.link-add-form` |
| Buttons | `.btn` base, `.btn-primary/secondary/ghost/danger`, `.btn-sm` |
| Inputs | `input[type="text/url/number"]` base styles |
| Theme toggle | `.theme-toggle` |
| Scrollbar | Webkit custom scrollbar for `.todo-list` |
| Utility | `.sr-only` |

## Adding a new feature — checklist

1. **HTML** — Add the markup inside `index.html`. Use semantic elements. Add `id` attributes for anything JS needs to reference; use classes for styling.
2. **CSS** — Add a clearly labelled section block in `style.css`. Use existing CSS variables; do not introduce new colour values.
3. **JS** — Add a new `SECTION N` block in `script.js`. Write an `initFeature()` function. Call it from the `DOMContentLoaded` bootstrap at the bottom. Store any persistent state under a new `ldash_*` localStorage key; document it in `tech.md`.
4. **Update steering** — If the feature changes the product scope, update `product.md`. If it adds a localStorage key or changes a convention, update `tech.md`. If it changes the file layout, update this file.
