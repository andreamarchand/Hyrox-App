/* ==========================================================================
   HYROX // REDEMPTION CYCLE — App Logic
   ========================================================================== */

(function () {
"use strict";

/* ---------------------------------------------------------------------
   Date helpers (all local-time, ISO 'YYYY-MM-DD')
   --------------------------------------------------------------------- */
function pad(n) { return String(n).padStart(2, "0"); }
function toISO(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function parseISO(iso) { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); }
function addDays(iso, n) { const d = parseISO(iso); d.setDate(d.getDate() + n); return toISO(d); }
function daysBetween(a, b) { return Math.round((parseISO(b) - parseISO(a)) / 86400000); }
function todayISO() { return toISO(new Date()); }
function clampISO(iso, lo, hi) { if (iso < lo) return lo; if (iso > hi) return hi; return iso; }

const WEEKDAY_NAMES = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const WEEKDAY_SHORT = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_NAMES = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function weekdayName(iso) { return WEEKDAY_NAMES[parseISO(iso).getDay()]; }
function weekdayShort(iso) { return WEEKDAY_SHORT[parseISO(iso).getDay()]; }
function monthDay(iso) { const d = parseISO(iso); return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`; }
function monthDayShort(iso) { const d = parseISO(iso); return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`; }

const CYCLE_END = RACE_DATE;
const NAV_MIN = addDays(CYCLE_START, -3);
const NAV_MAX = addDays(RACE_DATE, 3);

/* ---------------------------------------------------------------------
   Storage
   --------------------------------------------------------------------- */
const STORE_KEY = "hyrox_redemption_v1";

function defaultSettings() {
  return {
    supplements: [
      { id: "magnesium", name: "Magnesium", meta: "Every night", countsInScore: true, core: true },
      { id: "creatine", name: "Creatine", meta: "Optional · 3 g/day", countsInScore: false, core: true },
    ],
  };
}

function defaultStore() {
  return { days: {}, weeklyCheckins: {}, settings: defaultSettings() };
}

let STORE = loadStore();

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return defaultStore();
    const parsed = JSON.parse(raw);
    if (!parsed.days) parsed.days = {};
    if (!parsed.weeklyCheckins) parsed.weeklyCheckins = {};
    if (!parsed.settings) parsed.settings = defaultSettings();
    if (!parsed.settings.supplements) parsed.settings.supplements = defaultSettings().supplements;
    return parsed;
  } catch (e) {
    return defaultStore();
  }
}

function saveStore() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(STORE)); }
  catch (e) { showToast("Storage full — export your data to back it up."); }
}

function defaultDay() {
  return {
    sleep: { h: null, m: null },
    readiness: { energy: null, soreness: null, stress: null, digestion: null },
    water: 0,
    supplements: {},
    training: { status: "pending", rpe: null, feel: null, distance: null, time: null, hr: null, totalTime: null, splits: "", notes: "" },
    meals: {
      breakfast: { eaten: false, override: null },
      lunch: { eaten: false, override: null },
      snack: { eaten: false, override: null },
      dinner: { eaten: false, override: null },
    },
  };
}

function getDay(iso) {
  if (!STORE.days[iso]) STORE.days[iso] = defaultDay();
  const d = STORE.days[iso];
  if (!d.readiness) d.readiness = { energy: null, soreness: null, stress: null, digestion: null };
  if (!d.meals) d.meals = defaultDay().meals;
  if (!d.training) d.training = defaultDay().training;
  if (d.water == null) d.water = 0;
  if (!d.supplements) d.supplements = {};
  if (!d.sleep) d.sleep = { h: null, m: null };
  return d;
}

function mutateDay(iso, fn) {
  const d = getDay(iso);
  fn(d);
  saveStore();
}

/* ---------------------------------------------------------------------
   App state (not persisted)
   --------------------------------------------------------------------- */
const App = {
  view: "today",
  todayViewDate: clampISO(todayISO(), NAV_MIN, NAV_MAX),
  planWeekIndex: 0,
  fuelViewDate: clampISO(todayISO(), NAV_MIN, NAV_MAX),
  swap: null,   // { date, mealType, components: [...], step, activeIndex, activeCatKey }
  sos: null,    // { step, meal, dayType, options }
  logIso: null, // date currently being logged in modal
};
window.App = App;

/* Initialize planWeekIndex to the week containing today (or nearest) */
(function initPlanWeek() {
  const t = clampISO(todayISO(), CYCLE_START, RACE_DATE);
  let idx = WEEKS.findIndex(w => t >= w.start && t <= w.end);
  App.planWeekIndex = idx === -1 ? 0 : idx;
})();

/* ---------------------------------------------------------------------
   Mode helpers
   --------------------------------------------------------------------- */
function isTravel(iso) { return iso >= TRAVEL_START && iso <= TRAVEL_END; }
function isRaceWeek(iso) { return iso >= RACE_WEEK_START && iso <= RACE_DATE; }
function isRaceDay(iso) { return iso === RACE_DATE; }

function intensityLabel(i) {
  return { recovery: "RECOVERY", easy: "EASY", moderate: "MODERATE", hard: "HARD", key: "KEY SESSION" }[i] || i.toUpperCase();
}
function tagHTML(intensity) {
  return `<span class="tag tag-${intensity}">${intensityLabel(intensity)}</span>`;
}

/* ---------------------------------------------------------------------
   Log type inference
   --------------------------------------------------------------------- */
function getLogType(iso) {
  const t = TRAINING[iso];
  if (!t) return "run";
  const label = t.label.toLowerCase();
  if (/hyrox|compromised|dress rehearsal|mini hyrox/.test(label)) return "hyrox";
  if (/strength|yoga|flow/.test(label)) return "strength";
  if (t.intensity === "recovery" && /off|recovery|reset/.test(label)) return "rest";
  return "run";
}
function isBenchmark(iso) {
  const t = TRAINING[iso];
  if (!t) return false;
  return /repeats|race-pace test|dress rehearsal/i.test(t.label);
}

/* ---------------------------------------------------------------------
   Toast
   --------------------------------------------------------------------- */
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

/* ---------------------------------------------------------------------
   Navigation
   --------------------------------------------------------------------- */
function switchView(name) {
  App.view = name;
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById("view-" + name).classList.add("active");
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.nav === name));
  renderCurrentView();
  document.getElementById("app").scrollTop = 0;
  window.scrollTo(0, 0);
}

function renderCurrentView() {
  if (App.view === "today") renderToday();
  else if (App.view === "plan") renderPlan();
  else if (App.view === "fuel") renderFuel();
  else if (App.view === "progress") renderProgress();
}

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => switchView(btn.dataset.nav));
});

/* ==========================================================================
   SHARED COMPONENTS
   ========================================================================== */

function renderDailyMessage(iso) {
  const idx = Math.abs(hashCode(iso)) % DAILY_MESSAGES.length;
  return `<div class="daily-message">"${DAILY_MESSAGES[idx]}"</div>`;
}
function hashCode(str) { let h = 0; for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; } return h; }

function renderModeBanner(iso) {
  if (isRaceDay(iso)) {
    return `<div class="mode-banner race-week">
      <div class="mb-title">Redemption Day</div>
      <div class="mb-body">${TRAINING[iso].mantra ? `"${TRAINING[iso].mantra}"` : "Calm first. Fast later."}</div>
      <div class="mb-priorities">
        <span class="mb-chip">Sleep</span><span class="mb-chip">Fuel</span><span class="mb-chip">Hydrate</span><span class="mb-chip">Move</span><span class="mb-chip">Trust the work</span>
      </div>
    </div>`;
  }
  if (isRaceWeek(iso)) {
    return `<div class="mode-banner race-week">
      <div class="mb-title">Race Week</div>
      <div class="mb-body">Calm first. Fast later. Extra days = extra freshness, not extra punishment.</div>
      <div class="mb-priorities">
        <span class="mb-chip">Sleep</span><span class="mb-chip">Fuel</span><span class="mb-chip">Hydrate</span><span class="mb-chip">Move</span><span class="mb-chip">Trust the work</span>
      </div>
    </div>`;
  }
  if (isTravel(iso)) {
    return `<div class="mode-banner travel">
      <div class="mb-title">Travel Mode</div>
      <div class="mb-body">Choose a protein + choose a carb + add vegetables. Planned quantities still shown below — use hotel-friendly swaps freely.</div>
    </div>`;
  }
  return "";
}

function pctBar(pct, complete) {
  return `<div class="bar-track"><div class="bar-fill${complete ? " complete" : ""}" style="width:${Math.max(0, Math.min(100, pct))}%"></div></div>`;
}

/* ---------------- Readiness card ---------------- */
function sleepNote(hours) {
  if (hours == null || isNaN(hours)) return "Log last night's sleep.";
  if (hours >= 8) return "Well recovered.";
  if (hours >= 7) return "Sleep goal reached.";
  if (hours >= 6) return "Recovery needs attention.";
  return "Recovery needs attention.";
}

function renderReadinessCard(iso) {
  const day = getDay(iso);
  const h = day.sleep.h, m = day.sleep.m;
  const hours = (h != null && m != null) ? (h + m / 60) : null;
  const pct = hours != null ? (hours / 7) * 100 : 0;
  const complete = hours != null && hours >= 7;
  const dims = [
    ["energy", "Energy"], ["soreness", "Soreness"], ["stress", "Stress"], ["digestion", "Digestion"],
  ];
  return `
  <div class="card">
    <div class="section-head" style="margin-bottom:14px;">
      <div><div class="eyebrow">Recovery</div><div class="section-title" style="font-size:17px;">Readiness</div></div>
    </div>
    <div class="sleep-inputs">
      <div class="sleep-field">
        <label>Hours</label>
        <input type="number" min="0" max="14" placeholder="–" value="${h ?? ""}" oninput="App.setSleep('${iso}', this.value, null)">
      </div>
      <div class="sleep-field">
        <label>Minutes</label>
        <input type="number" min="0" max="59" placeholder="–" value="${m ?? ""}" oninput="App.setSleep('${iso}', null, this.value)">
      </div>
    </div>
    ${pctBar(pct, complete)}
    <div class="card-row">
      <span class="readiness-note">${sleepNote(hours)}</span>
      <span class="readiness-note" style="font-style:normal;color:var(--taupe);">Goal 7h min</span>
    </div>
    <div class="divider"></div>
    ${dims.map(([key, label]) => `
      <div class="readiness-row">
        <span class="readiness-label">${label}</span>
        <div class="dot-select">
          ${[1,2,3,4,5].map(n => `<button class="${day.readiness[key] === n ? "on" : ""}" onclick="App.setReadiness('${iso}','${key}',${n})">${n}</button>`).join("")}
        </div>
      </div>
    `).join("")}
  </div>`;
}

/* ---------------- Water card ---------------- */
function renderWaterCard(iso) {
  const day = getDay(iso);
  const goal = 3000;
  const ml = day.water;
  const liters = (ml / 1000).toFixed(1);
  const pct = Math.min(100, (ml / goal) * 100);
  const r = 34, c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const t = TRAINING[iso];
  const showNote = t && (t.intensity === "hard" || t.intensity === "key");
  return `
  <div class="card">
    <div class="section-head" style="margin-bottom:6px;">
      <div><div class="eyebrow">Hydration</div><div class="section-title" style="font-size:17px;">Water</div></div>
      <span style="font-family:var(--font-serif);font-size:15px;">${liters} / 3.0 L</span>
    </div>
    <div class="water-wrap">
      <div class="water-ring">
        <svg width="84" height="84" viewBox="0 0 84 84">
          <circle cx="42" cy="42" r="${r}" fill="none" stroke="var(--sand-soft)" stroke-width="8"/>
          <circle cx="42" cy="42" r="${r}" fill="none" stroke="${pct >= 100 ? "var(--green)" : "var(--espresso)"}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${offset}"/>
        </svg>
        <div class="ring-value"><span class="rv-num">${Math.round(pct)}%</span><span class="rv-unit">OF 3L</span></div>
      </div>
      <div class="water-actions">
        <div class="water-btn-row">
          <button class="chip-btn" onclick="App.addWater('${iso}',250)">+250 ml</button>
          <button class="chip-btn" onclick="App.addWater('${iso}',500)">+500 ml</button>
          <button class="chip-btn" onclick="App.addWater('${iso}',750)">+750 ml</button>
          <button class="chip-btn subtle" onclick="App.addWater('${iso}',-250)">−250 ml</button>
        </div>
      </div>
    </div>
    ${showNote ? `<div class="context-note">Training day: additional fluids/electrolytes may be useful.</div>` : ""}
  </div>`;
}

/* ---------------- Supplements card ---------------- */
function renderSupplementsCard(iso) {
  const day = getDay(iso);
  const list = STORE.settings.supplements;
  return `
  <div class="card">
    <div class="section-head" style="margin-bottom:4px;">
      <div><div class="eyebrow">Daily</div><div class="section-title" style="font-size:17px;">Supplements</div></div>
      <button class="link-btn" onclick="App.openSuppSettings()">Edit</button>
    </div>
    ${list.map(s => `
      <div class="supp-row">
        <div class="supp-info"><div class="supp-name">${s.name}</div><div class="supp-meta">${s.meta}</div></div>
        <button class="checkbox ${day.supplements[s.id] ? "on" : ""}" onclick="App.toggleSupp('${iso}','${s.id}')">
          <svg viewBox="0 0 24 24"><path d="M4 12l6 6L20 6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    `).join("")}
  </div>`;
}

/* ---------------- Training card ---------------- */
function feelEmoji(feel) {
  return { amazing: "Amazing", good: "Good", okay: "Okay", hard: "Hard", terrible: "Terrible" }[feel] || feel;
}

function renderTrainingCard(iso) {
  const t = TRAINING[iso];
  if (!t) return `<div class="card empty-note">No plan data for this date.</div>`;
  const day = getDay(iso);
  const n = NUTRITION[iso] || {};
  const status = day.training.status;
  const logType = getLogType(iso);

  let fuelFlags = "";
  if (n.pre || n.post) {
    fuelFlags = `<div class="fuel-flags">
      ${n.pre ? `<div class="fuel-flag"><span class="ff-label">Pre-workout</span><span class="ff-text">${n.pre}</span></div>` : ""}
      ${n.post ? `<div class="fuel-flag"><span class="ff-label">Post-workout</span><span class="ff-text">${n.post}</span></div>` : ""}
    </div>`;
  }

  let actions = "";
  if (status === "completed") {
    const parts = [];
    if (day.training.distance) parts.push(`${day.training.distance} km`);
    if (day.training.time) parts.push(day.training.time);
    if (day.training.totalTime) parts.push(`Total ${day.training.totalTime}`);
    if (day.training.rpe) parts.push(`RPE ${day.training.rpe}`);
    if (day.training.feel) parts.push(feelEmoji(day.training.feel));
    actions = `
      <div class="card-row" style="margin-top:14px;">
        <span class="tag tag-easy">Completed</span>
        <button class="link-btn" onclick="App.openLogModal('${iso}')">Edit log</button>
      </div>
      ${parts.length ? `<div class="rest-note" style="margin-top:8px;">${parts.join(" · ")}</div>` : ""}
      ${day.training.notes ? `<div class="rest-note" style="margin-top:6px;font-style:italic;">"${day.training.notes}"</div>` : ""}
    `;
  } else {
    actions = `
      <div class="workout-actions">
        <button class="pill-btn pill-btn-ghost" onclick="App.startTraining('${iso}')">${status === "started" ? "In Progress" : "Start"}</button>
        <button class="pill-btn pill-btn-dark" onclick="App.openLogModal('${iso}')">Complete</button>
      </div>
    `;
  }

  return `
  <div class="card workout-card">
    <div class="workout-head">
      ${tagHTML(t.intensity)}
      <span style="font-size:11px;color:var(--taupe);font-weight:700;letter-spacing:0.05em;">WEEK ${t.week}</span>
    </div>
    <div class="workout-title">${t.label}</div>
    <ul class="workout-lines">${t.lines.map(l => `<li>${l}</li>`).join("")}</ul>
    ${fuelFlags}
    ${actions}
  </div>`;
}

/* ---------------- Meal cards ---------------- */
const MEAL_META = {
  breakfast: { key: "breakfast", label: "Breakfast" },
  lunch: { key: "lunch", label: "Lunch" },
  snack: { key: "snack", label: "Snack" },
  dinner: { key: "dinner", label: "Dinner" },
};

function renderMealCards(iso, opts) {
  opts = opts || {};
  const n = NUTRITION[iso];
  if (!n) return `<div class="card empty-note">No meal data for this date.</div>`;
  const day = getDay(iso);
  const keys = ["breakfast", "lunch", "snack", "dinner"];
  return `<div class="meal-grid">
    ${keys.map(key => {
      const planned = n[key];
      if (!planned) return "";
      const state = day.meals[key];
      const text = state.override || planned;
      const swapped = !!state.override;
      return `
      <div class="meal-card ${state.eaten ? "eaten" : ""}">
        <div class="meal-head">
          <span class="meal-name">${MEAL_META[key].label}</span>
          <button class="meal-check" onclick="App.toggleMeal('${iso}','${key}')">
            <svg viewBox="0 0 24 24"><path d="M4 12l6 6L20 6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
        ${swapped ? `<div class="meal-swapped-badge">Swapped for today</div>` : ""}
        <p class="meal-text">${text}</p>
        <div class="meal-actions">
          <button class="chip-btn" onclick="App.toggleMeal('${iso}','${key}')">${state.eaten ? "✓ Eaten" : "Mark Eaten"}</button>
          <button class="chip-btn subtle" onclick="App.openSwap('${iso}','${key}')">Swap</button>
          ${swapped ? `<button class="chip-btn subtle" onclick="App.resetMeal('${iso}','${key}')">Reset</button>` : ""}
        </div>
      </div>`;
    }).join("")}
  </div>`;
}

/* ==========================================================================
   TODAY VIEW
   ========================================================================== */

function renderToday() {
  const iso = App.todayViewDate;
  const realToday = todayISO();
  const day = getDay(iso);
  const t = TRAINING[iso];
  const n = NUTRITION[iso];

  const daysToRace = daysBetween(iso, RACE_DATE);
  let countdownHTML;
  if (isRaceDay(iso)) countdownHTML = `<div class="cs-count">IT'S HERE <span>GO RACE IT</span></div>`;
  else if (daysToRace < 0) countdownHTML = `<div class="cs-count">RACE COMPLETE <span>${-daysToRace}d ago</span></div>`;
  else countdownHTML = `<div class="cs-count">${daysToRace} <span>DAYS TO HYROX</span></div>`;

  const modeChip = isRaceDay(iso) ? "REDEMPTION DAY" : isRaceWeek(iso) ? "RACE WEEK" : isTravel(iso) ? "TRAVEL MODE" : (t ? `WEEK ${t.week}` : "");

  // status grid values
  const hours = (day.sleep.h != null && day.sleep.m != null) ? (day.sleep.h + day.sleep.m / 60) : null;
  const sleepVal = hours != null ? `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m` : "—";
  const waterVal = `${(day.water / 1000).toFixed(1)} / 3.0 L`;
  const mealsCount = Object.values(day.meals).filter(m => m.eaten).length;
  const mealsVal = `${mealsCount} / 4 meals`;
  const trainVal = day.training.status === "completed" ? "Complete" : (t ? (t.intensity === "recovery" ? "Rest day" : "Pending") : "—");

  const html = `
    <div class="today-header">
      <div class="today-date">
        <div class="weekday">${weekdayName(iso)}${iso === realToday ? "" : ` · ${iso < realToday ? "PAST" : "UPCOMING"}`}</div>
        <div class="daynum">${monthDay(iso)}</div>
      </div>
      <div class="day-nav">
        <button onclick="App.navToday(-1)"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <button onclick="App.navToday(1)"><svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      </div>
    </div>

    <div class="cycle-strap">
      <div>
        <div class="cs-label">HYROX // Redemption Cycle</div>
        ${countdownHTML}
      </div>
      <div class="cs-mode">${modeChip}</div>
    </div>

    ${renderModeBanner(iso)}

    <div class="status-grid">
      <div class="status-cell ${hours != null && hours >= 7 ? "done" : ""}"><div class="sc-icon">☾</div><div class="sc-value">${sleepVal}</div><div class="sc-label">Sleep</div></div>
      <div class="status-cell ${day.water >= 3000 ? "done" : ""}"><div class="sc-icon">◌</div><div class="sc-value">${waterVal}</div><div class="sc-label">Water</div></div>
      <div class="status-cell ${mealsCount === 4 ? "done" : ""}"><div class="sc-icon">◇</div><div class="sc-value">${mealsVal}</div><div class="sc-label">Meals</div></div>
      <div class="status-cell ${day.training.status === "completed" ? "done" : ""}"><div class="sc-icon">↗</div><div class="sc-value">${trainVal}</div><div class="sc-label">Training</div></div>
    </div>

    <div class="section">${renderReadinessCard(iso)}</div>
    <div class="section">${renderWaterCard(iso)}</div>
    <div class="section">${renderSupplementsCard(iso)}</div>

    <div class="section">
      <div class="section-head"><div><div class="eyebrow">Today's</div><div class="section-title">Training</div></div></div>
      ${renderTrainingCard(iso)}
    </div>

    <div class="section">
      <div class="section-head"><div><div class="eyebrow">Today's</div><div class="section-title">Fuel</div></div></div>
      ${renderMealCards(iso)}
    </div>

    ${renderDailyMessage(iso)}
  `;
  document.getElementById("today-page").innerHTML = html;
}

App.navToday = function (delta) {
  App.todayViewDate = clampISO(addDays(App.todayViewDate, delta), NAV_MIN, NAV_MAX);
  renderToday();
};

App.setSleep = function (iso, hVal, mVal) {
  mutateDay(iso, d => {
    if (hVal !== null) d.sleep.h = hVal === "" ? null : Math.max(0, Math.min(14, parseInt(hVal, 10)));
    if (mVal !== null) d.sleep.m = mVal === "" ? null : Math.max(0, Math.min(59, parseInt(mVal, 10)));
  });
  renderCurrentView();
};

App.setReadiness = function (iso, key, val) {
  mutateDay(iso, d => { d.readiness[key] = d.readiness[key] === val ? null : val; });
  renderCurrentView();
};

App.addWater = function (iso, amount) {
  mutateDay(iso, d => { d.water = Math.max(0, d.water + amount); });
  renderCurrentView();
};

App.toggleSupp = function (iso, id) {
  mutateDay(iso, d => { d.supplements[id] = !d.supplements[id]; });
  renderCurrentView();
};

App.toggleMeal = function (iso, key) {
  mutateDay(iso, d => { d.meals[key].eaten = !d.meals[key].eaten; });
  renderCurrentView();
  const day = getDay(iso);
  if (day.meals[key].eaten) showToast(`${MEAL_META[key].label} logged.`);
};

App.startTraining = function (iso) {
  mutateDay(iso, d => { d.training.status = "started"; });
  renderCurrentView();
};

/* ==========================================================================
   TRAINING LOG MODAL
   ========================================================================== */

function openModal(id) {
  document.getElementById("modal-backdrop").classList.add("open");
  document.getElementById(id).classList.add("open");
}
function closeModals() {
  document.getElementById("modal-backdrop").classList.remove("open");
  document.querySelectorAll(".modal-panel").forEach(m => m.classList.remove("open"));
}
window.closeModals = closeModals;
document.getElementById("modal-backdrop").addEventListener("click", closeModals);

const RPE_RANGE = [1,2,3,4,5,6,7,8,9,10];
const FEEL_OPTIONS = [["amazing","Amazing"],["good","Good"],["okay","Okay"],["hard","Hard"],["terrible","Terrible"]];

App.openLogModal = function (iso) {
  App.logIso = iso;
  renderLogModal();
  openModal("log-modal");
};

function renderLogModal() {
  const iso = App.logIso;
  const t = TRAINING[iso];
  const day = getDay(iso);
  const tr = day.training;
  const logType = getLogType(iso);
  const benchmark = isBenchmark(iso);

  let fields = "";
  if (logType === "run") {
    fields += `
      <div class="field"><label>Distance (km)</label><input type="number" step="0.1" id="log-distance" value="${tr.distance ?? ""}"></div>
      <div class="field"><label>Time (mm:ss)</label><input type="text" placeholder="e.g. 32:15" id="log-time" value="${tr.time ?? ""}"></div>
      <div class="field"><label>Average HR (optional)</label><input type="number" id="log-hr" value="${tr.hr ?? ""}"></div>
    `;
  } else if (logType === "hyrox") {
    fields += `
      <div class="field"><label>Total time (mm:ss)</label><input type="text" placeholder="e.g. 58:40" id="log-totalTime" value="${tr.totalTime ?? ""}"></div>
    `;
  }
  if (benchmark) {
    fields += `<div class="field"><label>Splits (optional)</label><textarea id="log-splits" placeholder="km1 5:44, km2 5:41...">${tr.splits ?? ""}</textarea></div>`;
  }

  const html = `
    <div class="modal-body">
      <div class="section-head" style="margin-bottom:16px;">
        <div><div class="eyebrow">${t ? t.label : ""}</div><div class="section-title">Log Training</div></div>
        <button class="icon-btn" onclick="closeModals()"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg></button>
      </div>
      ${fields}
      <div class="field">
        <label>RPE</label>
        <div class="option-grid" style="grid-template-columns:repeat(5,1fr);">
          ${RPE_RANGE.map(n => `<button class="option-btn ${tr.rpe === n ? "selected" : ""}" onclick="App.setLogField('rpe',${n})" style="padding:10px 0;">${n}</button>`).join("")}
        </div>
      </div>
      <div class="field">
        <label>How did it feel?</label>
        <div class="feel-row">
          ${FEEL_OPTIONS.map(([k,l]) => `<button class="feel-btn ${tr.feel === k ? "selected" : ""}" onclick="App.setLogField('feel','${k}')">${l}</button>`).join("")}
        </div>
      </div>
      <div class="field"><label>Notes</label><textarea id="log-notes" placeholder="Anything worth remembering...">${tr.notes ?? ""}</textarea></div>
      <button class="pill-btn pill-btn-dark full" onclick="App.saveLog()">Save & Complete</button>
    </div>
  `;
  document.getElementById("log-modal").innerHTML = html;
}

App.setLogField = function (key, val) {
  mutateDay(App.logIso, d => { d.training[key] = d.training[key] === val ? null : val; });
  renderLogModal();
};

App.saveLog = function () {
  const iso = App.logIso;
  const distEl = document.getElementById("log-distance");
  const timeEl = document.getElementById("log-time");
  const hrEl = document.getElementById("log-hr");
  const totalEl = document.getElementById("log-totalTime");
  const splitsEl = document.getElementById("log-splits");
  const notesEl = document.getElementById("log-notes");
  mutateDay(iso, d => {
    d.training.status = "completed";
    if (distEl) d.training.distance = distEl.value ? parseFloat(distEl.value) : null;
    if (timeEl) d.training.time = timeEl.value || null;
    if (hrEl) d.training.hr = hrEl.value ? parseInt(hrEl.value, 10) : null;
    if (totalEl) d.training.totalTime = totalEl.value || null;
    if (splitsEl) d.training.splits = splitsEl.value || "";
    if (notesEl) d.training.notes = notesEl.value || "";
  });
  closeModals();
  renderCurrentView();
  showToast("Training logged.");
};

/* ==========================================================================
   SWAP SYSTEM
   ========================================================================== */

const CATEGORY_TABS = [
  { key: "protein", label: "Protein" },
  { key: "carb", label: "Carbs" },
  { key: "fat", label: "Fats" },
  { key: "vegetables", label: "Vegetables" },
];

// Order matters: check the most specific/unambiguous food groups first so a
// stray word (e.g. "hotcakes") never shadows the real ingredient (oats).
function detectCategory(text) {
  const s = text.toLowerCase();
  if (/\brice\b|\bbagel\b|tortilla|\bpotato\b|\bpita\b|\boats\b|\barroz\b|\bpapa\b|\bavena\b/.test(s)) return "carb";
  if (/avocado|aguacate|olive oil|\boil\b|nut butter|\bbutter\b|\bcheese\b|panela|\bmayo\b|mayonesa/.test(s)) return "fat";
  if (/green bean|squash|nopales|cucumber|\btomato\b|carrot|lettuce|spinach|vegetable|verdura|\bgreens\b|ejotes|calabaza|pepino|jitomate/.test(s)) return "vegetables";
  if (/chicken|\bbeef\b|\bfish\b|\btuna\b|turkey|\bmeat\b|\begg\b|egg white|pollo|\bcarne\b|pescado|atún|\bpavo\b|huevo|chobani|\bscoop\b|protein|yogurt|yogur/.test(s)) return "protein";
  return null;
}

// Some meal entries carry a short leading label like "Hotcakes:" or
// "Bowl out:" before the actual ingredient list — pull it off so it doesn't
// get treated (or mis-categorized) as a swappable food itself.
function extractLabelPrefix(text) {
  const m = text.match(/^([^:+]{2,26}):\s*/);
  if (m && !/\d\s*(g|ml|kg)\b/i.test(m[1])) return { prefix: m[0], rest: text.slice(m[0].length) };
  return { prefix: "", rest: text };
}

function splitComponents(text) {
  return text.split(/[+;]/).map(s => s.trim()).filter(Boolean);
}

// Groups every component into its macro bucket so a meal has AT MOST one
// swappable slot per category (Protein / Carbs / Fats / Vegetables) — several
// ingredients (egg + egg whites + protein powder + Chobani) can all belong to
// the same "protein" slot for that meal, and swap out together as one unit.
function parseMealText(text) {
  const { prefix, rest } = extractLabelPrefix(text);
  const components = splitComponents(rest).map(t => ({ text: t, category: detectCategory(t) }));
  const buckets = { protein: null, carb: null, fat: null, vegetables: null };
  const extras = [];
  components.forEach(c => {
    if (c.category) buckets[c.category] = buckets[c.category] ? `${buckets[c.category]} + ${c.text}` : c.text;
    else extras.push(c.text);
  });
  return { prefix, buckets, extras };
}

function assembleMealText(prefix, buckets, extras) {
  const parts = CATEGORY_TABS.map(t => buckets[t.key]).filter(Boolean).concat(extras || []);
  return (prefix + parts.join(" + ")).trim();
}

// "Protein" always shows whole-food options (chicken, beef, fish...) together
// with protein-powder/Chobani-style options in one list, since either can
// stand in for the other in this plan.
function categorySwapList(catKey) {
  if (catKey === "protein") {
    const seen = new Set();
    return [EQUIVALENTS.protein.base, ...EQUIVALENTS.protein.swaps, EQUIVALENTS.proteinSnack.base, ...EQUIVALENTS.proteinSnack.swaps]
      .filter(item => { const k = item.food.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
  }
  const cat = EQUIVALENTS[catKey];
  if (!cat) return [];
  const seen = new Set();
  return [cat.base, ...cat.swaps].filter(Boolean).filter(item => { const k = item.food.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
}

App.openSwap = function (iso, mealType) {
  const n = NUTRITION[iso];
  const day = getDay(iso);
  const currentText = day.meals[mealType].override || n[mealType];
  const parsed = parseMealText(currentText);
  const plannedParsed = parseMealText(n[mealType]);
  App.swap = {
    date: iso, mealType,
    prefix: parsed.prefix, buckets: parsed.buckets, extras: parsed.extras,
    plannedText: n[mealType],
    normalizedPlanned: assembleMealText(plannedParsed.prefix, plannedParsed.buckets, plannedParsed.extras),
    step: "list", activeCatKey: null,
  };
  renderSwapSheet();
  openSheet("swap-sheet");
};

function renderSwapSheet() {
  const sw = App.swap;
  if (!sw) return;
  const el = document.getElementById("swap-sheet");
  const currentAssembled = assembleMealText(sw.prefix, sw.buckets, sw.extras);
  const filledTabs = CATEGORY_TABS.filter(t => sw.buckets[t.key]);

  let body;
  if (sw.step === "list") {
    body = `
      <div class="swap-current">
        <div class="sc-label">Current — ${MEAL_META[sw.mealType].label}</div>
        <div class="sc-food">${currentAssembled}</div>
      </div>
      ${filledTabs.length ? filledTabs.map(t => `
        <div class="swap-option" onclick="App.selectSwapBucket('${t.key}')">
          <div><div class="so-food">${sw.buckets[t.key]}</div><div class="so-note">Tap to swap · ${t.label}</div></div>
          <span class="so-arrow">›</span>
        </div>
      `).join("") : `<div class="empty-note">Nothing categorized to swap in this meal.</div>`}
      ${sw.extras.length ? `<div class="rest-note" style="margin-top:10px;color:var(--taupe);">Also in this meal (not swappable): ${sw.extras.join(", ")}</div>` : ""}
    `;
  } else {
    const cat = sw.activeCatKey;
    const options = categorySwapList(cat);
    body = `
      <button class="link-btn" style="margin-bottom:12px;display:inline-block;" onclick="App.swapBack()">‹ Back</button>
      <div class="swap-current">
        <div class="sc-label">Current — ${CATEGORY_TABS.find(t=>t.key===cat).label}</div>
        <div class="sc-food">${sw.buckets[cat] || "—"}</div>
      </div>
      <div class="swap-cat-tabs">
        ${CATEGORY_TABS.map(t => `<button class="swap-cat-tab ${t.key === cat ? "active" : ""}" onclick="App.setSwapCategory('${t.key}')">${t.label}</button>`).join("")}
      </div>
      ${options.map((o, oi) => `
        <div class="swap-option" onclick="App.applySwap(${oi})">
          <div><div class="so-food">${o.food}</div><div class="so-note">${o.note || (o.amount + " " + o.unit)}</div></div>
          <span class="so-arrow">›</span>
        </div>
      `).join("")}
    `;
  }

  el.innerHTML = `
    <div class="sheet-handle"></div>
    <div class="sheet-header" style="position:relative;">
      <div class="sh-title">Swap</div>
      <div class="sh-sub">${MEAL_META[sw.mealType].label} · ${monthDayShort(sw.date)} — one swap per macro</div>
      <button class="sheet-close" onclick="App.closeSheet()"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg></button>
    </div>
    <div class="sheet-body">${body}</div>
    <div class="sheet-footer">
      <div style="display:flex;gap:10px;">
        <button class="pill-btn pill-btn-ghost" style="flex:1;" onclick="App.resetSwapDraft()">Reset</button>
        <button class="pill-btn pill-btn-dark" style="flex:2;" onclick="App.saveSwap()">Save Swap</button>
      </div>
    </div>
  `;
}

App.selectSwapBucket = function (key) {
  App.swap.activeCatKey = key;
  App.swap.step = "category";
  renderSwapSheet();
};
App.swapBack = function () {
  App.swap.step = "list";
  renderSwapSheet();
};
App.setSwapCategory = function (key) {
  App.swap.activeCatKey = key;
  renderSwapSheet();
};
App.applySwap = function (optionIndex) {
  const sw = App.swap;
  const opt = categorySwapList(sw.activeCatKey)[optionIndex];
  const newText = `${opt.amount} ${opt.unit} ${opt.food}`.replace(/\s+/g, " ").trim();
  sw.buckets[sw.activeCatKey] = newText;
  sw.step = "list";
  renderSwapSheet();
  showToast("Swapped — remember to Save.");
};
App.resetSwapDraft = function () {
  const sw = App.swap;
  const parsed = parseMealText(sw.plannedText);
  sw.prefix = parsed.prefix;
  sw.buckets = parsed.buckets;
  sw.extras = parsed.extras;
  sw.step = "list";
  renderSwapSheet();
};
App.saveSwap = function () {
  const sw = App.swap;
  const newText = assembleMealText(sw.prefix, sw.buckets, sw.extras);
  mutateDay(sw.date, d => {
    d.meals[sw.mealType].override = (newText === sw.normalizedPlanned) ? null : newText;
  });
  App.closeSheet();
  renderCurrentView();
  showToast("Meal updated for today.");
};

App.resetMeal = function (iso, mealType) {
  mutateDay(iso, d => { d.meals[mealType].override = null; });
  renderCurrentView();
  showToast("Reverted to planned meal.");
};

/* ---------------- Sheet open/close ---------------- */
function openSheet(id) {
  document.getElementById("sheet-backdrop").classList.add("open");
  document.getElementById(id).classList.add("open");
}
App.closeSheet = function () {
  document.getElementById("sheet-backdrop").classList.remove("open");
  document.querySelectorAll(".sheet").forEach(s => s.classList.remove("open"));
};
document.getElementById("sheet-backdrop").addEventListener("click", () => App.closeSheet());

/* ==========================================================================
   SOS — WHAT DO I EAT?
   ========================================================================== */

const SOS_MEALS = [["breakfast","Breakfast"],["lunch","Lunch"],["snack","Snack"],["dinner","Dinner"]];
const SOS_DAYTYPES = [["recovery","Recovery"],["easy","Easy training"],["hard","Hard training"],["hyrox","HYROX"],["long","Long run"]];

App.openSOS = function () {
  App.sos = { step: "meal", meal: null, dayType: null };
  renderSOSSheet();
  openSheet("sos-sheet");
};

function generateSOSOptions(meal, dayType) {
  const hard = dayType === "hard" || dayType === "hyrox" || dayType === "long";
  const carbs = hard ? SOS_CARBS_HARD : SOS_CARBS;
  if (meal === "breakfast") {
    return SOS_BREAKFAST_BASES.map((b, i) => ({ text: hard ? `${b.text} + hard-day carb add-on (½ bagel or 1 banana)` : b.text }));
  }
  if (meal === "snack") {
    return SOS_SNACK_BASES.map(b => ({ text: b.text }));
  }
  // lunch / dinner: combine protein + carb + veg, three varied options
  const combos = [
    [SOS_PROTEINS[0], carbs[0], SOS_VEG[0]],
    [SOS_PROTEINS[1], carbs[1], SOS_VEG[1]],
    [SOS_PROTEINS[2], carbs[2], SOS_VEG[2]],
  ];
  return combos.map(([p, c, v]) => ({ text: `${p.amount} ${p.food} + ${c.amount} ${c.food} + ${v.amount} ${v.food}` }));
}

function renderSOSSheet() {
  const sos = App.sos;
  const el = document.getElementById("sos-sheet");
  let body;
  if (sos.step === "meal") {
    body = `
      <div class="option-grid">
        ${SOS_MEALS.map(([k,l]) => `<button class="option-btn" onclick="App.sosSetMeal('${k}')">${l}</button>`).join("")}
      </div>
    `;
  } else if (sos.step === "daytype") {
    body = `
      <button class="link-btn" style="margin-bottom:12px;display:inline-block;" onclick="App.sosBack()">‹ Back</button>
      <div class="eyebrow" style="margin-bottom:10px;">What kind of day?</div>
      <div class="option-grid">
        ${SOS_DAYTYPES.map(([k,l]) => `<button class="option-btn" onclick="App.sosSetDayType('${k}')">${l}</button>`).join("")}
      </div>
    `;
  } else {
    const options = generateSOSOptions(sos.meal, sos.dayType);
    body = `
      <button class="link-btn" style="margin-bottom:12px;display:inline-block;" onclick="App.sosStep('daytype')">‹ Back</button>
      <div class="eyebrow" style="margin-bottom:10px;">${MEAL_META[sos.meal].label} // ${SOS_DAYTYPES.find(d=>d[0]===sos.dayType)[1]}</div>
      ${options.map((o, i) => `
        <div class="swap-option" style="align-items:flex-start;">
          <div style="flex:1;"><div class="so-food" style="margin-bottom:6px;">Option ${String(i+1).padStart(2,"0")}</div><div class="so-note" style="font-size:13px;color:var(--espresso-70);line-height:1.5;">${o.text}</div></div>
        </div>
        <button class="pill-btn pill-btn-ghost full" style="margin:-2px 0 12px;" onclick="App.sosUse(${i})">Use This Meal</button>
      `).join("")}
    `;
  }
  el.innerHTML = `
    <div class="sheet-handle"></div>
    <div class="sheet-header" style="position:relative;">
      <div class="sh-title">SOS — What Do I Eat?</div>
      <div class="sh-sub">Built only from planned foods and equivalents.</div>
      <button class="sheet-close" onclick="App.closeSheet()"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg></button>
    </div>
    <div class="sheet-body">${body}</div>
  `;
}
App.sosSetMeal = function (k) { App.sos.meal = k; App.sos.step = "daytype"; renderSOSSheet(); };
App.sosSetDayType = function (k) { App.sos.dayType = k; App.sos.step = "options"; renderSOSSheet(); };
App.sosStep = function (s) { App.sos.step = s; renderSOSSheet(); };
App.sosBack = function () { App.sos.step = "meal"; renderSOSSheet(); };
App.sosUse = function (i) {
  const sos = App.sos;
  const options = generateSOSOptions(sos.meal, sos.dayType);
  const iso = App.view === "fuel" ? App.fuelViewDate : App.todayViewDate;
  mutateDay(iso, d => { d.meals[sos.meal].override = options[i].text; });
  App.closeSheet();
  renderCurrentView();
  showToast(`${MEAL_META[sos.meal].label} updated.`);
};

/* ==========================================================================
   PLAN VIEW — 7-week calendar + day detail + reference cards
   ========================================================================== */

function mealsDoneCount(iso) {
  const day = STORE.days[iso];
  if (!day) return 0;
  return Object.values(day.meals).filter(m => m.eaten).length;
}
function sleepMetGoal(iso) {
  const day = STORE.days[iso];
  if (!day || day.sleep.h == null) return null;
  const hours = day.sleep.h + (day.sleep.m || 0) / 60;
  return hours >= 7;
}

function renderPlan() {
  const week = WEEKS[App.planWeekIndex];
  const realToday = todayISO();

  let days = [];
  let cur = week.start;
  while (cur <= week.end) { days.push(cur); cur = addDays(cur, 1); }

  const dayRows = days.map(iso => {
    const t = TRAINING[iso];
    const trained = STORE.days[iso] && STORE.days[iso].training.status === "completed";
    const meals = mealsDoneCount(iso);
    const sleepOk = sleepMetGoal(iso);
    return `
      <div class="day-row ${iso === realToday ? "today" : ""}" onclick="App.openDayModal('${iso}')">
        <div class="dr-date"><div class="dr-dow">${weekdayShort(iso)}</div><div class="dr-num">${parseISO(iso).getDate()}</div></div>
        <div class="dr-mid">
          <div class="dr-workout">${t ? t.label : "—"}</div>
          <div class="dr-meta">
            <span class="dot-indicator ${trained ? "green" : ""}"></span> Training
            <span class="dot-indicator ${meals === 4 ? "green" : ""}"></span> ${meals}/4 meals
            ${sleepOk === true ? `<span class="dot-indicator green"></span> Sleep ✓` : ""}
          </div>
        </div>
        <div class="dr-tag">${t ? tagHTML(t.intensity) : ""}</div>
      </div>
    `;
  }).join("");

  const html = `
    <div class="section-head" style="margin-bottom:18px;">
      <div><div class="eyebrow">HYROX // Redemption Cycle</div><div class="section-title">Plan</div></div>
    </div>

    <div class="week-nav">
      <button ${App.planWeekIndex === 0 ? "disabled" : ""} onclick="App.navWeek(-1)"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <div class="wn-title">
        <div class="wt-range">WEEK ${week.n} // ${week.range.toUpperCase()}</div>
        <div class="wt-name">${week.title}</div>
      </div>
      <button ${App.planWeekIndex === WEEKS.length - 1 ? "disabled" : ""} onclick="App.navWeek(1)"><svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    </div>
    <div class="week-sub">${week.subtitle}</div>

    <div class="day-list">${dayRows}</div>

    <div class="section" style="margin-top:28px;">
      <div class="section-head"><div><div class="eyebrow">Reference</div><div class="section-title">Training Rules</div></div></div>
      <div class="card">
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:12.5px;">
            <thead><tr style="text-align:left;color:var(--taupe);font-size:10.5px;letter-spacing:0.06em;text-transform:uppercase;">
              <th style="padding:6px 8px 6px 0;">Run type</th><th style="padding:6px 8px;">Pace</th><th style="padding:6px 0 6px 8px;">Feel</th>
            </tr></thead>
            <tbody>
              ${PACE_TABLE.map(p => `<tr style="border-top:1px solid var(--line-soft);"><td style="padding:7px 8px 7px 0;font-weight:700;">${p.type}</td><td style="padding:7px 8px;color:var(--espresso-70);">${p.pace}</td><td style="padding:7px 0 7px 8px;color:var(--espresso-70);">${p.feel}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
        <div class="context-note" style="margin-top:14px;"><strong>Golden rule:</strong> ${GOLDEN_RULE}</div>
        <div class="divider"></div>
        ${TRAINING_RULES.map((r,i) => `<div class="rest-note" style="margin-bottom:6px;">${i+1}. ${r}</div>`).join("")}
        <div class="context-note" style="margin-top:10px;"><strong>Travel rule (Sep 24–Oct 4):</strong> ${TRAVEL_RULE}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-head"><div><div class="eyebrow">Optional</div><div class="section-title">Partner Sessions</div></div></div>
      <div class="rest-note" style="margin-bottom:12px;">Andrea + Val — use occasionally when training together. ${PARTNER_BEST_USE}</div>
      ${PARTNER_SESSIONS.map(p => `
        <div class="card">
          <div class="card-row" style="margin-bottom:8px;"><span style="font-weight:700;font-family:var(--font-serif);font-size:15px;">${p.title}</span><span class="tag">${p.tag}</span></div>
          <ul class="workout-lines">${p.lines.map(l => `<li>${l}</li>`).join("")}</ul>
        </div>
      `).join("")}
      <div class="info-card" style="margin-top:10px;"><div class="ic-title">Team rule</div><div class="ic-body">${PARTNER_TEAM_RULE}</div></div>
    </div>
  `;
  document.getElementById("plan-page").innerHTML = html;
}

App.navWeek = function (delta) {
  App.planWeekIndex = Math.max(0, Math.min(WEEKS.length - 1, App.planWeekIndex + delta));
  renderPlan();
};

App.openDayModal = function (iso) {
  const t = TRAINING[iso];
  const html = `
    <div class="modal-body">
      <div class="section-head" style="margin-bottom:4px;">
        <div><div class="eyebrow">${weekdayName(iso)}</div><div class="section-title">${monthDay(iso)}</div></div>
        <button class="icon-btn" onclick="closeModals()"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg></button>
      </div>
      ${renderModeBanner(iso)}
      <div class="section">${renderTrainingCard(iso)}</div>
      <div class="section">
        <div class="section-head"><div><div class="eyebrow">Fuel</div><div class="section-title" style="font-size:17px;">Meals</div></div></div>
        ${renderMealCards(iso)}
      </div>
      <button class="pill-btn pill-btn-ghost full" onclick="App.jumpToday('${iso}')">Open in Today</button>
    </div>
  `;
  document.getElementById("day-modal").innerHTML = html;
  openModal("day-modal");
};

App.jumpToday = function (iso) {
  closeModals();
  App.todayViewDate = clampISO(iso, NAV_MIN, NAV_MAX);
  switchView("today");
};

/* ==========================================================================
   FUEL VIEW — today's meals, equivalents, swap calculator, SOS
   ========================================================================== */

const FOOD_INDEX = (function buildFoodIndex() {
  const cats = [
    ["protein", EQUIVALENTS.protein],
    ["proteinSnack", EQUIVALENTS.proteinSnack],
    ["carb", EQUIVALENTS.carb],
    ["fat", EQUIVALENTS.fat],
    ["vegetables", EQUIVALENTS.vegetables],
  ];
  const list = [];
  cats.forEach(([catKey, cat]) => {
    const all = [cat.base, ...cat.swaps].filter(Boolean);
    all.forEach(item => list.push({ ...item, catKey, catLabel: cat.label }));
  });
  return list;
})();

function roundResult(val, unit) {
  if (/^g/.test(unit.trim())) return Math.round(val / 5) * 5;
  const r = Math.round(val * 2) / 2;
  return r;
}

function renderFuel() {
  const iso = App.todayViewDate;
  const n = NUTRITION[iso];

  const html = `
    <div class="section-head" style="margin-bottom:18px;">
      <div><div class="eyebrow">HYROX // Fueling Cycle</div><div class="section-title">Fuel</div></div>
      <button class="pill-btn pill-btn-dark pill-btn-sm" onclick="App.openSOS()">SOS</button>
    </div>

    ${renderModeBanner(iso)}

    <div class="section">
      <div class="section-head"><div><div class="eyebrow">${weekdayName(iso)} · ${monthDayShort(iso)}</div><div class="section-title" style="font-size:17px;">Today's Meals</div></div></div>
      ${renderMealCards(iso)}
    </div>

    <div class="section">
      <div class="card" style="background:var(--sand-soft);border:none;">
        <div class="card-row" style="align-items:flex-start;">
          <div style="flex:1;"><div class="ic-title" style="margin-bottom:4px;">Easy / Recovery Day</div><div class="ic-body">Standard portions.</div></div>
          <div style="flex:1;"><div class="ic-title" style="margin-bottom:4px;">Hard Training Day</div><div class="ic-body">Standard portions + planned workout fuel.</div></div>
        </div>
        <div class="divider"></div>
        <div class="ic-body" style="text-align:center;font-weight:700;color:var(--espresso);">Hard training = fuel the work — not earn food.</div>
      </div>
    </div>

    <div class="section">
      <div class="section-head"><div><div class="eyebrow">Calculator</div><div class="section-title">Swap Calculator</div></div></div>
      <div class="card">
        <div class="field">
          <label>I Have</label>
          <select id="calc-from" onchange="App.calcFromChanged()">
            ${FOOD_INDEX.map((f,i) => `<option value="${i}">${f.food} (${f.catLabel})</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label>Amount</label>
          <input type="number" id="calc-amount" value="${FOOD_INDEX[0].amount}" step="any">
        </div>
        <div class="swap-cal-arrow">↓</div>
        <div class="field">
          <label>Swap For</label>
          <select id="calc-to">
            ${FOOD_INDEX.map((f,i) => `<option value="${i}" ${i===1?"selected":""}>${f.food} (${f.catLabel})</option>`).join("")}
          </select>
        </div>
        <button class="pill-btn pill-btn-dark full" onclick="App.calcResult()">Calculate</button>
        <div id="calc-result-slot"></div>
      </div>
    </div>

    <div class="section">
      <div class="section-head"><div><div class="eyebrow">Reference</div><div class="section-title">Equivalents</div></div></div>
      <div class="card">
        ${["protein","proteinSnack","carb","fat","vegetables"].map(k => {
          const cat = EQUIVALENTS[k];
          return `
            <div style="margin-bottom:14px;">
              <div style="font-weight:700;font-size:12.5px;margin-bottom:6px;">${cat.label}${cat.base ? ` <span style="color:var(--taupe);font-weight:600;">— ${cat.base.food} ${cat.base.note || cat.base.amount + " " + cat.base.unit}</span>` : ""}</div>
              <div class="rest-note">${(cat.swaps||[]).map(s => `${s.food} ${s.note || (s.amount + " " + s.unit)}`).join(" · ")}</div>
            </div>
          `;
        }).join("")}
        <div class="divider"></div>
        <div class="ic-body">${EQUIVALENTS.carbAddOn.note}</div>
        <div class="rest-note" style="margin-top:6px;">${EQUIVALENTS.carbAddOn.swaps.map(s=>s.note).join(" · ")}</div>
        <div class="divider"></div>
        <div class="ic-body"><strong>Quick rule:</strong> ${QUICK_RULE}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-head"><div><div class="eyebrow">Daily</div><div class="section-title">Basics</div></div></div>
      <div class="card">
        <div class="ic-body" style="margin-bottom:10px;"><strong>Fluids:</strong> ${DAILY_BASICS.fluids}</div>
        <div class="ic-body" style="margin-bottom:10px;"><strong>Vegetables:</strong> ${DAILY_BASICS.vegetables}</div>
        <div class="ic-body" style="margin-bottom:10px;"><strong>Pre-training:</strong> ${DAILY_BASICS.preTraining}</div>
        <div class="ic-body"><strong>Flexible meals:</strong> ${DAILY_BASICS.flexibleMeals}</div>
      </div>
    </div>
  `;
  document.getElementById("fuel-page").innerHTML = html;
}

App.calcFromChanged = function () {
  const idx = parseInt(document.getElementById("calc-from").value, 10);
  document.getElementById("calc-amount").value = FOOD_INDEX[idx].amount;
};

App.calcResult = function () {
  const fromIdx = parseInt(document.getElementById("calc-from").value, 10);
  const toIdx = parseInt(document.getElementById("calc-to").value, 10);
  const amount = parseFloat(document.getElementById("calc-amount").value) || 0;
  const from = FOOD_INDEX[fromIdx], to = FOOD_INDEX[toIdx];
  const ratio = amount / from.amount;
  const result = roundResult(ratio * to.amount, to.unit);
  document.getElementById("calc-result-slot").innerHTML = `
    <div class="result-box">
      <div class="rb-eyebrow">Result</div>
      <div class="rb-value">≈ ${result} ${to.unit} ${to.food}</div>
      <div class="rb-note">Approximate meal-plan equivalent</div>
    </div>
  `;
};

/* ==========================================================================
   PROGRESS VIEW — stats, consistency score, trends, weekly check-in, data
   ========================================================================== */

function timeToSeconds(str) {
  if (!str) return null;
  const parts = str.split(":").map(s => parseFloat(s));
  if (parts.some(isNaN)) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}
function secondsToClock(s) {
  if (s == null || isNaN(s)) return "—";
  const m = Math.floor(s / 60), sec = Math.round(s % 60);
  return `${m}:${pad(sec)}`;
}

function elapsedDates() {
  const end = clampISO(todayISO(), CYCLE_START, RACE_DATE);
  const dates = [];
  let cur = CYCLE_START;
  while (cur <= end) { dates.push(cur); cur = addDays(cur, 1); }
  return dates;
}

function computeScore(iso) {
  const t = TRAINING[iso];
  const day = STORE.days[iso];
  if (!day || !t) return null;
  let score = 0;
  score += (t.intensity === "recovery") ? 30 : (day.training.status === "completed" ? 30 : 0);
  const mealsEaten = Object.values(day.meals).filter(m => m.eaten).length;
  score += (mealsEaten / 4) * 30;
  const hours = (day.sleep.h != null && day.sleep.m != null) ? (day.sleep.h + day.sleep.m / 60) : null;
  score += hours != null ? Math.min(20, (hours / 7) * 20) : 0;
  score += Math.min(15, (day.water / 3000) * 15);
  score += day.supplements.magnesium ? 5 : 0;
  return Math.round(Math.max(0, Math.min(100, score)));
}
function scoreStatus(score) {
  if (score == null) return { label: "No data yet", cls: "" };
  if (score >= 80) return { label: "On Track", cls: "green" };
  if (score >= 60) return { label: "Solid Day", cls: "amber" };
  return { label: "Reset Tomorrow", cls: "" };
}

function computeStats() {
  const dates = elapsedDates();
  let trainTotal = 0, trainDone = 0;
  let mealsEaten = 0;
  let sleepSum = 0, sleepCount = 0;
  let waterDaysLogged = 0, waterGoalMet = 0;
  let energySum = 0, energyCount = 0;
  let rpeSum = 0, rpeCount = 0;

  dates.forEach(iso => {
    const t = TRAINING[iso];
    const day = STORE.days[iso];
    if (t && t.intensity !== "recovery") {
      trainTotal++;
      if (day && day.training.status === "completed") trainDone++;
    }
    if (day) {
      mealsEaten += Object.values(day.meals).filter(m => m.eaten).length;
      if (day.sleep.h != null && day.sleep.m != null) { sleepSum += day.sleep.h + day.sleep.m / 60; sleepCount++; }
      if (day.water > 0) { waterDaysLogged++; if (day.water >= 3000) waterGoalMet++; }
      if (day.readiness.energy != null) { energySum += day.readiness.energy; energyCount++; }
      if (day.training.status === "completed" && day.training.rpe != null) { rpeSum += day.training.rpe; rpeCount++; }
    }
  });

  return {
    trainingPct: trainTotal ? Math.round((trainDone / trainTotal) * 100) : null,
    mealPct: dates.length ? Math.round((mealsEaten / (dates.length * 4)) * 100) : null,
    avgSleep: sleepCount ? sleepSum / sleepCount : null,
    waterPct: waterDaysLogged ? Math.round((waterGoalMet / waterDaysLogged) * 100) : null,
    avgEnergy: energyCount ? (energySum / energyCount) : null,
    avgRpe: rpeCount ? (rpeSum / rpeCount) : null,
  };
}

function collectTrend(logTypeFilter, valueFn) {
  const dates = elapsedDates();
  const out = [];
  dates.forEach(iso => {
    const day = STORE.days[iso];
    if (!day || day.training.status !== "completed") return;
    if (getLogType(iso) !== logTypeFilter) return;
    const v = valueFn(day.training);
    if (v != null) out.push({ iso, v });
  });
  return out.slice(-8);
}

function renderTrendChart(entries, formatFn, fasterIsBetter) {
  if (!entries.length) return `<div class="empty-note">Log a session to see your trend.</div>`;
  const vals = entries.map(e => e.v);
  const min = Math.min(...vals), max = Math.max(...vals);
  return `<div class="trend-row">
    ${entries.map(e => {
      let h;
      if (max === min) h = 60;
      else h = fasterIsBetter ? (10 + ((max - e.v) / (max - min)) * 50) : (10 + ((e.v - min) / (max - min)) * 50);
      return `<div class="trend-bar filled" style="height:${h}px;" title="${monthDayShort(e.iso)}: ${formatFn(e.v)}"></div>`;
    }).join("")}
  </div>
  <div class="card-row" style="margin-top:2px;"><span class="rest-note">${monthDayShort(entries[0].iso)}</span><span class="rest-note">${monthDayShort(entries[entries.length-1].iso)}</span></div>`;
}

function renderProgress() {
  const iso = clampISO(todayISO(), CYCLE_START, RACE_DATE);
  const stats = computeStats();
  const score = computeScore(iso);
  const status = scoreStatus(score);
  const scoreRing = (() => {
    const r = 52, c = 2 * Math.PI * r;
    const pct = score == null ? 0 : score;
    const offset = c - (pct / 100) * c;
    const color = score == null ? "var(--sand)" : score >= 80 ? "var(--green)" : score >= 60 ? "var(--amber)" : "var(--taupe)";
    return `<svg width="130" height="130" viewBox="0 0 130 130">
      <circle cx="65" cy="65" r="${r}" fill="none" stroke="var(--sand-soft)" stroke-width="10"/>
      <circle cx="65" cy="65" r="${r}" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${offset}" transform="rotate(-90 65 65)"/>
      <text x="65" y="60" text-anchor="middle" font-family="Fraunces, serif" font-size="30" fill="var(--espresso)">${score ?? "–"}</text>
      <text x="65" y="80" text-anchor="middle" font-family="Manrope, sans-serif" font-size="10" letter-spacing="1" fill="var(--taupe)">/ 100</text>
    </svg>`;
  })();

  const paceEntries = collectTrend("run", tr => {
    if (!tr.distance || !tr.time) return null;
    const secs = timeToSeconds(tr.time);
    if (!secs) return null;
    return secs / tr.distance;
  });
  const hyroxEntries = collectTrend("hyrox", tr => timeToSeconds(tr.totalTime));

  const weekOf = WEEKS.find(w => iso >= w.start && iso <= w.end) || WEEKS[0];
  const checkin = STORE.weeklyCheckins[weekOf.start];

  const html = `
    <div class="section-head" style="margin-bottom:18px;">
      <div><div class="eyebrow">HYROX // Redemption Cycle</div><div class="section-title">Progress</div></div>
    </div>

    <div class="section">
      <div class="card">
        <div style="text-align:center;">
          <div class="eyebrow" style="margin-bottom:6px;">Today's Consistency</div>
          <div class="score-ring-wrap">${scoreRing}</div>
          <div class="score-status" style="color:${score>=80?'var(--green-deep)':score>=60?'#7A5E30':'var(--taupe)'}">${status.label}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-head"><div><div class="eyebrow">Performance &amp;</div><div class="section-title">Consistency</div></div></div>
      <div class="stat-grid">
        <div class="stat-card"><div class="stat-label">Training Completion</div><div class="stat-value">${stats.trainingPct ?? "—"}${stats.trainingPct!=null?"%":""}</div></div>
        <div class="stat-card"><div class="stat-label">Meal Consistency</div><div class="stat-value">${stats.mealPct ?? "—"}${stats.mealPct!=null?"%":""}</div></div>
        <div class="stat-card"><div class="stat-label">Average Sleep</div><div class="stat-value">${stats.avgSleep!=null ? Math.floor(stats.avgSleep)+"h "+Math.round((stats.avgSleep%1)*60)+"m" : "—"}</div></div>
        <div class="stat-card"><div class="stat-label">Water Goal</div><div class="stat-value">${stats.waterPct ?? "—"}${stats.waterPct!=null?"%":""}</div></div>
        <div class="stat-card"><div class="stat-label">Average Energy</div><div class="stat-value">${stats.avgEnergy!=null ? stats.avgEnergy.toFixed(1) : "—"}<span style="font-size:13px;color:var(--taupe);"> /5</span></div></div>
        <div class="stat-card"><div class="stat-label">Average RPE</div><div class="stat-value">${stats.avgRpe!=null ? stats.avgRpe.toFixed(1) : "—"}<span style="font-size:13px;color:var(--taupe);"> /10</span></div></div>
      </div>
    </div>

    <div class="section">
      <div class="section-head"><div><div class="eyebrow">Trend</div><div class="section-title">Running Pace</div></div></div>
      <div class="card">${renderTrendChart(paceEntries, v => secondsToClock(v)+"/km", true)}</div>
    </div>

    <div class="section">
      <div class="section-head"><div><div class="eyebrow">Trend</div><div class="section-title">HYROX Sessions</div></div></div>
      <div class="card">${renderTrendChart(hyroxEntries, v => secondsToClock(v), true)}</div>
    </div>

    <div class="section">
      <div class="section-head">
        <div><div class="eyebrow">Weekly</div><div class="section-title">Check-In</div></div>
        <button class="pill-btn pill-btn-ghost pill-btn-sm" onclick="App.openCheckin()">${checkin ? "Edit" : "Start"}</button>
      </div>
      <div class="card">
        ${checkin ? `
          <div class="rest-note" style="margin-bottom:8px;">Week of ${monthDayShort(weekOf.start)} — energy ${checkin.energy}/5 · hunger ${checkin.hunger}/5 · digestion ${checkin.digestion}/5 · soreness ${checkin.soreness}/5 · sleep ${checkin.sleep}/5 · confidence ${checkin.confidence}/5</div>
          ${checkin.text ? `<div class="rest-note" style="font-style:italic;">"${checkin.text}"</div>` : ""}
        ` : `<div class="empty-note">No check-in yet for this week.</div>`}
      </div>
    </div>

    <div class="section">
      <div class="section-head"><div><div class="eyebrow">Data</div><div class="section-title">Backup &amp; Reset</div></div></div>
      <div class="card">
        <div class="settings-row">
          <div><div class="sr-label">Export Data</div><div class="sr-sub">Save everything as a JSON file</div></div>
          <button class="pill-btn pill-btn-ghost pill-btn-sm" onclick="App.exportData()">Export</button>
        </div>
        <div class="settings-row">
          <div><div class="sr-label">Import Data</div><div class="sr-sub">Restore from a backup file</div></div>
          <button class="pill-btn pill-btn-ghost pill-btn-sm" onclick="document.getElementById('import-file').click()">Import</button>
          <input type="file" id="import-file" accept="application/json" style="display:none" onchange="App.importData(event)">
        </div>
        <div class="settings-row">
          <div><div class="sr-label">Reset Data</div><div class="sr-sub">Erase everything on this device</div></div>
          <button class="pill-btn pill-btn-outline pill-btn-sm" onclick="App.confirmReset()">Reset</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById("progress-page").innerHTML = html;
}

/* ---------------- Weekly check-in ---------------- */
App.openCheckin = function () {
  const iso = clampISO(todayISO(), CYCLE_START, RACE_DATE);
  const weekOf = WEEKS.find(w => iso >= w.start && iso <= w.end) || WEEKS[0];
  const existing = STORE.weeklyCheckins[weekOf.start] || { energy: null, hunger: null, digestion: null, soreness: null, sleep: null, confidence: null, text: "" };
  App._checkinWeek = weekOf.start;
  App._checkinDraft = { ...existing };
  renderCheckinModal();
  openModal("checkin-modal");
};

const CHECKIN_DIMS = [["energy","How was your energy?"],["hunger","How was your hunger?"],["digestion","How was your digestion?"],["soreness","How was your soreness?"],["sleep","How was your sleep?"],["confidence","How confident do you feel about HYROX?"]];

function renderCheckinModal() {
  const d = App._checkinDraft;
  const html = `
    <div class="modal-body">
      <div class="section-head" style="margin-bottom:14px;">
        <div><div class="eyebrow">Week of ${monthDayShort(App._checkinWeek)}</div><div class="section-title">Weekly Check-In</div></div>
        <button class="icon-btn" onclick="closeModals()"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg></button>
      </div>
      ${CHECKIN_DIMS.map(([key,label]) => `
        <div class="field">
          <label>${label}</label>
          <div class="check-in-scale">
            ${[1,2,3,4,5].map(n => `<button class="${d[key]===n?"on":""}" onclick="App.setCheckin('${key}',${n})">${n}</button>`).join("")}
          </div>
        </div>
      `).join("")}
      <div class="field">
        <label>How did this week feel?</label>
        <textarea id="checkin-text" placeholder="Write freely...">${d.text || ""}</textarea>
      </div>
      <button class="pill-btn pill-btn-dark full" onclick="App.saveCheckin()">Save Check-In</button>
    </div>
  `;
  document.getElementById("checkin-modal").innerHTML = html;
}
App.setCheckin = function (key, val) {
  App._checkinDraft[key] = App._checkinDraft[key] === val ? null : val;
  renderCheckinModal();
};
App.saveCheckin = function () {
  App._checkinDraft.text = document.getElementById("checkin-text").value;
  STORE.weeklyCheckins[App._checkinWeek] = App._checkinDraft;
  saveStore();
  closeModals();
  renderCurrentView();
  showToast("Check-in saved.");
};

/* ---------------- Supplement settings ---------------- */
App.openSuppSettings = function () {
  renderSuppModal();
  openModal("supp-modal");
};
function renderSuppModal() {
  const list = STORE.settings.supplements;
  const html = `
    <div class="modal-body">
      <div class="section-head" style="margin-bottom:14px;">
        <div><div class="eyebrow">Daily</div><div class="section-title">Edit Supplements</div></div>
        <button class="icon-btn" onclick="closeModals()"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg></button>
      </div>
      ${list.map((s,i) => `
        <div class="settings-row">
          <div><div class="sr-label">${s.name}</div><div class="sr-sub">${s.meta}${s.countsInScore ? " · counts toward score" : ""}</div></div>
          ${s.core ? "" : `<button class="link-btn" onclick="App.removeSupp(${i})">Remove</button>`}
        </div>
      `).join("")}
      <div class="divider"></div>
      <div class="field"><label>New supplement name</label><input type="text" id="new-supp-name" placeholder="e.g. Vitamin D"></div>
      <div class="field"><label>Note (optional)</label><input type="text" id="new-supp-meta" placeholder="e.g. Morning · 2000 IU"></div>
      <button class="pill-btn pill-btn-ghost full" onclick="App.addSupp()">Add Supplement</button>
    </div>
  `;
  document.getElementById("supp-modal").innerHTML = html;
}
App.addSupp = function () {
  const name = document.getElementById("new-supp-name").value.trim();
  if (!name) return;
  const meta = document.getElementById("new-supp-meta").value.trim() || "Daily";
  const id = "s_" + Date.now();
  STORE.settings.supplements.push({ id, name, meta, countsInScore: false, core: false });
  saveStore();
  renderSuppModal();
  renderCurrentView();
};
App.removeSupp = function (i) {
  STORE.settings.supplements.splice(i, 1);
  saveStore();
  renderSuppModal();
  renderCurrentView();
};

/* ---------------- Export / Import / Reset ---------------- */
App.exportData = function () {
  const blob = new Blob([JSON.stringify(STORE, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hyrox-redemption-backup-${todayISO()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Data exported.");
};

App.importData = function (evt) {
  const file = evt.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!parsed || typeof parsed !== "object") throw new Error("bad file");
      STORE = { ...defaultStore(), ...parsed };
      if (!STORE.settings || !STORE.settings.supplements) STORE.settings = defaultSettings();
      saveStore();
      renderCurrentView();
      showToast("Data imported.");
    } catch (err) {
      showToast("Could not read that file.");
    }
  };
  reader.readAsText(file);
  evt.target.value = "";
};

App.confirmReset = function () {
  const html = `
    <div class="modal-body">
      <div class="cm-icon">⚠</div>
      <div class="cm-title">Reset all data?</div>
      <div class="cm-body">This permanently deletes every logged day, check-in, and setting on this device. Export a backup first if you want to keep it.</div>
      <div class="cm-actions">
        <button class="pill-btn pill-btn-ghost" onclick="closeModals()">Cancel</button>
        <button class="pill-btn pill-btn-dark" onclick="App.doReset()">Delete Everything</button>
      </div>
    </div>
  `;
  document.getElementById("confirm-modal").innerHTML = html;
  openModal("confirm-modal");
};
App.doReset = function () {
  STORE = defaultStore();
  saveStore();
  closeModals();
  renderCurrentView();
  showToast("All data reset.");
};

/* ==========================================================================
   INIT
   ========================================================================== */

document.addEventListener("keydown", e => { if (e.key === "Escape") { closeModals(); App.closeSheet(); } });

switchView("today");

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}

})();
