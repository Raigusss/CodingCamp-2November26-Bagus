/* ============================================================
   script.js — To-Do List Life Dashboard
   Vanilla JS only. All state persisted in localStorage.
   ============================================================ */

"use strict";

/* ============================================================
   SECTION 1 — Local Storage helpers
   ============================================================ */

const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};

/* ============================================================
   SECTION 2 — Theme (light / dark)
   ============================================================ */

const THEME_KEY = "ldash_theme";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const btn = document.getElementById("theme-toggle");
  if (btn) btn.textContent = theme === "dark" ? "Light mode" : "Dark mode";
}

function initTheme() {
  applyTheme(storage.get(THEME_KEY, "light"));

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark"
      ? "light" : "dark";
    storage.set(THEME_KEY, next);
    applyTheme(next);
  });
}

/* ============================================================
   SECTION 3 — Greeting (clock + date + salutation + custom name)
   ============================================================ */

const NAME_KEY = "ldash_name";

function getGreeting(hour) {
  if (hour >= 5  && hour < 12) return "Selamat pagi";
  if (hour >= 12 && hour < 15) return "Selamat siang";
  if (hour >= 15 && hour < 19) return "Selamat sore";
  return "Selamat malam";
}

function formatDate(date) {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    year:    "numeric",
    month:   "long",
    day:     "numeric",
  });
}

function formatTime(date) {
  return date.toLocaleTimeString("id-ID", {
    hour:   "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function initGreeting() {
  const elTime    = document.getElementById("greeting-time");
  const elDate    = document.getElementById("greeting-date");
  const elMessage = document.getElementById("greeting-message");
  const nameInput = document.getElementById("name-input");
  const nameForm  = document.getElementById("name-form");

  nameInput.value = storage.get(NAME_KEY, "");

  nameForm.addEventListener("submit", (e) => {
    e.preventDefault();
    storage.set(NAME_KEY, nameInput.value.trim());
    updateMessage();
  });

  function updateMessage() {
    const name = storage.get(NAME_KEY, "");
    const hour = new Date().getHours();
    elMessage.textContent = name
      ? `${getGreeting(hour)}, ${name}.`
      : `${getGreeting(hour)}.`;
  }

  function tick() {
    const now = new Date();
    elTime.textContent = formatTime(now);
    elDate.textContent = formatDate(now);
    updateMessage();
  }

  tick();
  setInterval(tick, 1000);
}

/* ============================================================
   SECTION 4 — Focus Timer
   Upgrades: tab-title countdown, beep on finish, progress bar
   ============================================================ */

const TIMER_DURATION_KEY = "ldash_timer_duration";

let timerInterval  = null;
let timerRemaining = 0;   // seconds
let timerTotal     = 0;   // seconds (for progress bar ratio)
let timerRunning   = false;

function getTimerDuration() {
  return storage.get(TIMER_DURATION_KEY, 25);
}

function secondsToDisplay(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// Tiny beep via Web Audio API — no external file needed
function playBeep() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type            = "sine";
    osc.frequency.value = 880;        // A5 — clear but not jarring
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.2);
  } catch {
    // AudioContext not available — silent fail
  }
}

function updateTimerDisplay() {
  const elDisplay  = document.getElementById("timer-display");
  const elProgress = document.getElementById("timer-progress-bar");

  elDisplay.textContent = secondsToDisplay(timerRemaining);
  elDisplay.classList.toggle("running", timerRunning);

  // Progress bar: shrinks from 100% → 0% as time elapses
  const pct = timerTotal > 0 ? (timerRemaining / timerTotal) * 100 : 100;
  elProgress.style.width = `${pct}%`;

  // Browser tab title
  if (timerRunning) {
    document.title = `${secondsToDisplay(timerRemaining)} — Life Dashboard`;
  } else {
    document.title = "Life Dashboard";
  }
}

function updateTimerButtons() {
  document.getElementById("btn-start").disabled = timerRunning;
  document.getElementById("btn-stop").disabled  = !timerRunning;
}

function timerStart() {
  if (timerRunning) return;
  timerRunning = true;
  updateTimerButtons();

  timerInterval = setInterval(() => {
    if (timerRemaining <= 0) {
      timerStop();
      playBeep();
      if (Notification.permission === "granted") {
        new Notification("Focus session complete!", { body: "Time for a break." });
      }
      return;
    }
    timerRemaining--;
    updateTimerDisplay();
  }, 1000);
}

function timerStop() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning  = false;
  updateTimerButtons();
  updateTimerDisplay();
}

function timerReset() {
  timerStop();
  timerRemaining = getTimerDuration() * 60;
  timerTotal     = timerRemaining;
  updateTimerDisplay();
}

function initTimer() {
  const durationInput = document.getElementById("timer-duration-input");
  durationInput.value = getTimerDuration();

  timerReset(); // sets timerRemaining + timerTotal, calls updateTimerDisplay

  document.getElementById("btn-start").addEventListener("click", timerStart);
  document.getElementById("btn-stop").addEventListener("click",  timerStop);
  document.getElementById("btn-reset").addEventListener("click", timerReset);

  durationInput.addEventListener("change", () => {
    let val = parseInt(durationInput.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 120)             val = 120;
    durationInput.value = val;
    storage.set(TIMER_DURATION_KEY, val);
    timerReset();
  });

  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

/* ============================================================
   SECTION 5 — To-Do List
   Upgrades: duplicate prevention, sort (A-Z / status),
             filter (All/Active/Done), counter, clear-done btn,
             Enter shortcut (already worked via form submit)
   ============================================================ */

const TODOS_KEY  = "ldash_todos";
const FILTER_KEY = "ldash_filter";
const SORT_KEY   = "ldash_sort";

function loadTodos()       { return storage.get(TODOS_KEY, []); }
function saveTodos(todos)  { storage.set(TODOS_KEY, todos); }

function createTodo(text) {
  return { id: Date.now(), text: text.trim(), done: false };
}

/* Apply current filter to a todos array */
function applyFilter(todos) {
  const filter = storage.get(FILTER_KEY, "all");
  if (filter === "active") return todos.filter((t) => !t.done);
  if (filter === "done")   return todos.filter((t) =>  t.done);
  return todos;
}

/* Apply current sort to a todos array */
function applySort(todos) {
  const sort = storage.get(SORT_KEY, "default");
  const copy = [...todos];
  if (sort === "az") {
    copy.sort((a, b) => a.text.localeCompare(b.text, "id"));
  } else if (sort === "status") {
    // Active first, then done
    copy.sort((a, b) => Number(a.done) - Number(b.done));
  }
  return copy;
}

/* Update the counter label "X of Y done" */
function updateTodoCounter() {
  const todos  = loadTodos();
  const total  = todos.length;
  const done   = todos.filter((t) => t.done).length;
  const el     = document.getElementById("todo-counter");
  el.textContent = total === 0 ? "" : `${done} of ${total} done`;
}

/* Sync active state on filter buttons */
function syncFilterButtons() {
  const active = storage.get(FILTER_KEY, "all");
  document.querySelectorAll(".todo-filter-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === active);
  });
}

/* Full render: apply sort → filter → build DOM */
function renderTodos() {
  const list = document.getElementById("todo-list");
  const todos = applySort(applyFilter(loadTodos()));
  list.innerHTML = "";

  updateTodoCounter();
  syncFilterButtons();

  if (todos.length === 0) {
    const li = document.createElement("li");
    li.className   = "todo-empty";
    li.textContent = "Nothing here. Add a task above.";
    list.appendChild(li);
    return;
  }

  todos.forEach((todo) => list.appendChild(buildTodoItem(todo)));
}

/* Build one <li> */
function buildTodoItem(todo) {
  const li       = document.createElement("li");
  li.className   = `todo-item${todo.done ? " done" : ""}`;
  li.dataset.id  = todo.id;

  // Checkbox
  const checkbox      = document.createElement("input");
  checkbox.type       = "checkbox";
  checkbox.className  = "todo-checkbox";
  checkbox.checked    = todo.done;
  checkbox.setAttribute("aria-label", "Mark as done");
  checkbox.addEventListener("change", () => toggleTodoDone(todo.id));

  // Text span
  const span       = document.createElement("span");
  span.className   = "todo-text";
  span.textContent = todo.text;

  // Actions
  const actions     = document.createElement("div");
  actions.className = "todo-actions";

  const editBtn         = document.createElement("button");
  editBtn.className     = "btn btn-ghost btn-sm";
  editBtn.textContent   = "Edit";
  editBtn.setAttribute("aria-label", "Edit task");
  editBtn.addEventListener("click", () => activateTodoEdit(li, todo));

  const delBtn         = document.createElement("button");
  delBtn.className     = "btn btn-ghost btn-sm";
  delBtn.style.color   = "var(--danger)";
  delBtn.textContent   = "Delete";
  delBtn.setAttribute("aria-label", "Delete task");
  delBtn.addEventListener("click", () => deleteTodo(todo.id));

  actions.appendChild(editBtn);
  actions.appendChild(delBtn);

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(actions);
  return li;
}

/* Inline edit mode */
function activateTodoEdit(li, todo) {
  const span    = li.querySelector(".todo-text");
  const actions = li.querySelector(".todo-actions");

  const input     = document.createElement("input");
  input.type      = "text";
  input.className = "todo-edit-input";
  input.value     = todo.text;
  li.replaceChild(input, span);

  actions.innerHTML = "";

  const saveBtn       = document.createElement("button");
  saveBtn.className   = "btn btn-primary btn-sm";
  saveBtn.textContent = "Save";
  saveBtn.addEventListener("click", () => {
    const newText = input.value.trim();
    if (newText) updateTodoText(todo.id, newText);
  });

  const cancelBtn       = document.createElement("button");
  cancelBtn.className   = "btn btn-secondary btn-sm";
  cancelBtn.textContent = "Cancel";
  cancelBtn.addEventListener("click", renderTodos);

  actions.appendChild(saveBtn);
  actions.appendChild(cancelBtn);

  input.focus();
  input.select();

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter")  saveBtn.click();
    if (e.key === "Escape") cancelBtn.click();
  });
}

/* Check for duplicates (case-insensitive) */
function isDuplicate(text) {
  const normalized = text.trim().toLowerCase();
  return loadTodos().some((t) => t.text.toLowerCase() === normalized);
}

function addTodo(text) {
  if (!text) return false;
  if (isDuplicate(text)) return false; // signal caller: rejected
  const todos = loadTodos();
  todos.push(createTodo(text));
  saveTodos(todos);
  renderTodos();
  return true;
}

function deleteTodo(id) {
  saveTodos(loadTodos().filter((t) => t.id !== id));
  renderTodos();
}

function toggleTodoDone(id) {
  saveTodos(loadTodos().map((t) => t.id === id ? { ...t, done: !t.done } : t));
  renderTodos();
}

function updateTodoText(id, newText) {
  saveTodos(loadTodos().map((t) => t.id === id ? { ...t, text: newText } : t));
  renderTodos();
}

function clearDoneTodos() {
  saveTodos(loadTodos().filter((t) => !t.done));
  renderTodos();
}

function initTodos() {
  const form     = document.getElementById("todo-form");
  const input    = document.getElementById("todo-input");
  const sortSel  = document.getElementById("todo-sort-select");

  // Set saved sort value
  sortSel.value = storage.get(SORT_KEY, "default");

  // Filter buttons
  document.querySelectorAll(".todo-filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      storage.set(FILTER_KEY, btn.dataset.filter);
      renderTodos();
    });
  });

  // Sort select
  sortSel.addEventListener("change", () => {
    storage.set(SORT_KEY, sortSel.value);
    renderTodos();
  });

  // Add task — Enter key via form submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    const accepted = addTodo(text);
    if (accepted) {
      input.value = "";
      input.focus();
    } else {
      // Shake the input to signal duplicate
      input.classList.remove("shake");
      // Force reflow so animation restarts if triggered again
      void input.offsetWidth;
      input.classList.add("shake");
      input.addEventListener("animationend", () => input.classList.remove("shake"), { once: true });
    }
  });

  // Clear done button
  document.getElementById("btn-clear-done").addEventListener("click", clearDoneTodos);

  renderTodos();
}

/* ============================================================
   SECTION 6 — Quick Links
   Upgrade: favicon auto-loaded via Google's favicon service
   ============================================================ */

const LINKS_KEY = "ldash_links";

const DEFAULT_LINKS = [
  { id: 1, label: "Google",  url: "https://google.com"  },
  { id: 2, label: "GitHub",  url: "https://github.com"  },
  { id: 3, label: "YouTube", url: "https://youtube.com" },
];

function loadLinks() { return storage.get(LINKS_KEY, DEFAULT_LINKS); }
function saveLinks(links) { storage.set(LINKS_KEY, links); }

/* Extract origin for favicon lookup */
function faviconUrl(url) {
  try {
    const origin = new URL(url).origin;
    return `https://www.google.com/s2/favicons?domain=${origin}&sz=32`;
  } catch {
    return null;
  }
}

function renderLinks() {
  const container = document.getElementById("links-container");
  container.innerHTML = "";

  loadLinks().forEach((link) => {
    const a     = document.createElement("a");
    a.href      = link.url;
    a.target    = "_blank";
    a.rel       = "noopener noreferrer";
    a.className = "link-btn";
    a.setAttribute("aria-label", link.label);

    // Favicon image
    const fav = faviconUrl(link.url);
    if (fav) {
      const img    = document.createElement("img");
      img.src      = fav;
      img.alt      = "";
      img.className = "link-favicon";
      // Hide broken images gracefully
      img.addEventListener("error", () => img.style.display = "none");
      a.appendChild(img);
    }

    // Label text node
    a.appendChild(document.createTextNode(link.label));

    // Remove button
    const removeBtn = document.createElement("button");
    removeBtn.className   = "link-remove";
    removeBtn.textContent = "×";
    removeBtn.title       = `Remove ${link.label}`;
    removeBtn.setAttribute("aria-label", `Remove ${link.label}`);
    removeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      deleteLink(link.id);
    });

    a.appendChild(removeBtn);
    container.appendChild(a);
  });
}

function addLink(label, url) {
  if (!label || !url) return;
  const links = loadLinks();
  links.push({ id: Date.now(), label: label.trim(), url: url.trim() });
  saveLinks(links);
  renderLinks();
}

function deleteLink(id) {
  saveLinks(loadLinks().filter((l) => l.id !== id));
  renderLinks();
}

function initLinks() {
  const form       = document.getElementById("link-form");
  const labelInput = document.getElementById("link-label-input");
  const urlInput   = document.getElementById("link-url-input");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let url = urlInput.value.trim();
    if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    addLink(labelInput.value.trim(), url);
    labelInput.value = "";
    urlInput.value   = "";
    labelInput.focus();
  });

  renderLinks();
}

/* ============================================================
   SECTION 7 — Bootstrap
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initGreeting();
  initTimer();
  initTodos();
  initLinks();
});
