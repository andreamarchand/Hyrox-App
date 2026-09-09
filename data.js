/* ==========================================================================
   HYROX // REDEMPTION CYCLE — Data Model
   Source: HYROX_Redemption_Plan_Nov1_2026_v2.pdf + HYROX_Nutrition_Plan_Simple_Nov1_2026.pdf
   Cycle: Sep 8, 2026 → Nov 1, 2026 (Race Day)
   Travel block: Sep 24 – Oct 4, 2026
   ========================================================================== */

const RACE_DATE = "2026-11-01";
const CYCLE_START = "2026-09-08";
const TRAVEL_START = "2026-09-24";
const TRAVEL_END = "2026-10-04";
const RACE_WEEK_START = "2026-10-27";

const WEEKS = [
  { n: 1, range: "Sep 8 – 14",  title: "Recover the Girl",              subtitle: "Absorb Acapulco. No revenge training.",                                          start: "2026-09-08", end: "2026-09-14" },
  { n: 2, range: "Sep 15 – 21", title: "Rebuild",                        subtitle: "Return to structure. Four run exposures, zero heroics.",                         start: "2026-09-15", end: "2026-09-21" },
  { n: 3, range: "Sep 22 – 28", title: "Build the Engine — Travel Edition", subtitle: "Travel starts Sep 24. Protect the running stimulus, simplify everything else.", start: "2026-09-22", end: "2026-09-28" },
  { n: 4, range: "Sep 29 – Oct 5", title: "Travel-Proof HYROX Engine",   subtitle: "No sled required. The objective is still quality running under fatigue.",        start: "2026-09-29", end: "2026-10-05" },
  { n: 5, range: "Oct 6 – 12",  title: "Specificity",                    subtitle: "Back home. Now we turn the running fitness into HYROX fitness.",                 start: "2026-10-06", end: "2026-10-12" },
  { n: 6, range: "Oct 13 – 19", title: "Peak Week",                      subtitle: "This is where we collect evidence that race day is different this time.",        start: "2026-10-13", end: "2026-10-19" },
  { n: 7, range: "Oct 20 – 26", title: "Taper & Confidence",             subtitle: "Fitness is built. Your only job is to stop interfering with it.",                start: "2026-10-20", end: "2026-10-26" },
  { n: 8, range: "Oct 27 – Nov 1", title: "Redemption Day",              subtitle: "Calm first. Fast later. Extra days = extra freshness, not extra punishment.",     start: "2026-10-27", end: "2026-11-01", isRaceWeek: true },
];

const PACE_TABLE = [
  { type: "Recovery jog",   pace: "7:00–7:40 / km", feel: "Ridiculously easy" },
  { type: "Easy / Z2",      pace: "6:35–7:15 / km", feel: "Conversational" },
  { type: "Long run",       pace: "6:30–7:05 / km", feel: "Steady, relaxed" },
  { type: "Steady",         pace: "6:05–6:25 / km", feel: "Working, controlled" },
  { type: "Tempo",          pace: "5:45–6:00 / km", feel: "Hard but sustainable" },
  { type: "HYROX run reps", pace: "5:45–6:05 / km", feel: "Strong, repeatable" },
  { type: "Short intervals",pace: "5:15–5:35 / km", feel: "Fast, never sprinting" },
];

const GOLDEN_RULE = "If you have to go to war to hit the pace, the pace is wrong for that day. Adjust by 10–20 sec/km and keep the intention of the session.";

const TRAINING_RULES = [
  "Max 4 runs/week.",
  "Max 2 genuinely hard days/week.",
  "Z2 is sacred. Do not accidentally turn it into tempo.",
  "Hot power yoga counts as training stress.",
  "Sharp knee pain, swelling or altered gait = stop and modify.",
  "Missed workout = move on. Never double up to \"pay it back.\"",
];

const TRAVEL_RULE = "The trip is not a problem to solve. During travel, priority order is: run quality > easy mileage > simple strength > HYROX-specific equipment. No sled? Fine. No SkiErg? Fine. We keep the engine alive.";

const PARTNER_SESSIONS = [
  {
    title: "Partner Workout 1", tag: "Run + Stations",
    lines: [
      "Warm-up: 10–12 min easy together + drills.",
      "6 rounds: 1 km run together @ 5:50–6:00/km.",
      "After R1: Ski 1000 m shared.",
      "After R2: Sled push 50 m shared.",
      "After R3: Sled pull 50 m shared.",
      "After R4: Row 1000 m shared.",
      "After R5: Farmers 200 m shared.",
      "After R6: 80 m lunges shared + 40 wall balls shared.",
      "Rule: decide the split BEFORE each station and practice a 3-word handoff cue: \"you / me / switch\".",
    ],
  },
  {
    title: "Partner Workout 2", tag: "Communication Day",
    lines: [
      "5 x 1 km together @ 5:45–5:55/km.",
      "After each km, complete 3 min of work alternating every 30 sec: Ski, burpees, Row, lunges, wall balls.",
      "No racing each other. The stronger partner that day controls effort so both leave the station together.",
      "After each round, rate effort out loud from 1–10. If one is 2+ points higher, slow the next run by 5–10 sec/km.",
    ],
  },
  {
    title: "Partner Workout 3", tag: "Doubles Rehearsal",
    lines: [
      "Do this once, ideally 2–3 weeks before race.",
      "70–80% HYROX simulation with race-style pacing.",
      "Runs @ planned race pace + 5–10 sec/km.",
      "Practice exactly who starts each station, where the switch happens, who counts reps, and who calls the next move.",
      "Final 2 km: stay together no matter who feels better. This is execution practice, not fitness testing.",
    ],
  },
];

const PARTNER_TEAM_RULE = "Before race day, agree on the sentence you will use when one of you is having a bad patch. Example: \"We stay calm, we stay together, next 500 only.\" No blame, no panic, no silent resentment mid-race.";
const PARTNER_BEST_USE = "Replace a Saturday compromised session with one of these — do not add it on top of the plan.";

/* --------------------------------------------------------------------------
   TRAINING — keyed by ISO date. intensity ∈ recovery | easy | moderate | hard | key
   -------------------------------------------------------------------------- */
const TRAINING = {
  "2026-09-08": { week: 1, label: "Yoga / Flow", intensity: "easy", lines: ["45–60 min yoga flow.", "Keep it fluid and restorative-to-moderate, not a max-effort power class.", "Optional 20–30 min easy walk later if it feels good."] },
  "2026-09-09": { week: 1, label: "Recovery", intensity: "recovery", lines: ["30–40 min easy walk + 10–15 min mobility.", "No running yet. Let Tuesday's flow be the first movement back."] },
  "2026-09-10": { week: 1, label: "First Run Back", intensity: "easy", lines: ["5 min walk + 5 min easy jog.", "25 min @ 7:00–7:30/km.", "5 min walk cooldown.", "Goal: observe legs, breathing and HR — no judgment."] },
  "2026-09-11": { week: 1, label: "Easy Strength", intensity: "easy", lines: ["3 rounds, RPE 6/10.", "DB bench press x10.", "1-arm row x10/side.", "Shoulder press x10.", "DB Romanian deadlift x10.", "Glute bridge x15.", "Dead bug x10/side."] },
  "2026-09-12": { week: 1, label: "Easy Run", intensity: "easy", lines: ["5–10 min easy warm-up.", "35 min @ 6:50–7:20/km.", "4 x 15 sec relaxed strides, 60 sec walk between."] },
  "2026-09-13": { week: 1, label: "Recovery", intensity: "recovery", lines: ["Rest or easy yoga 45–60 min."] },
  "2026-09-14": { week: 1, label: "Off", intensity: "recovery", lines: ["Full rest. The assignment is to do less."] },

  "2026-09-15": { week: 2, label: "Intervals", intensity: "hard", lines: ["Warm-up: 10 min easy + leg swings + A-skips + 3 x 20 sec strides.", "Main: 5 x 800 m @ 5:45–5:55/km.", "Recovery: 2 min easy jog/walk.", "Cooldown: 10 min easy.", "Optional upper: DB bench 3x10, row 3x10, shoulder press 3x8, rear delt 3x12, core 3x12."] },
  "2026-09-16": { week: 2, label: "HYROX Strength", intensity: "hard", lines: ["4 rounds: Ski 500 m, sled push 25 m, sled pull 25 m, farmers 100 m, 12 wall balls.", "Rest 2 min between rounds.", "RPE 7/10."] },
  "2026-09-17": { week: 2, label: "Z2", intensity: "easy", lines: ["45 min @ 6:40–7:10/km.", "Keep it truly conversational.", "Gentle yoga optional later."] },
  "2026-09-18": { week: 2, label: "Strength", intensity: "moderate", lines: ["Squat 4x6.", "RDL 3x8.", "Bulgarian split squat 3x8/leg.", "Hip thrust 3x10.", "Calf raise 3x15.", "Pallof press 3x10/side.", "Keep 2–3 reps in reserve."] },
  "2026-09-19": { week: 2, label: "Compromised #1", intensity: "hard", lines: ["10 min warm-up.", "1 km @ 6:00–6:10 + 500 m Ski.", "1 km @ 6:00–6:10 + 20 m burpee broad jumps.", "1 km @ 6:00–6:10 + 500 m Row.", "1 km @ 6:00–6:10 + 50 m walking lunges.", "Goal: km 4 should look like km 1."] },
  "2026-09-20": { week: 2, label: "Long Run", intensity: "moderate", lines: ["7 km @ 6:40–7:10/km.", "Easy. Finish with energy left."] },
  "2026-09-21": { week: 2, label: "Recovery", intensity: "recovery", lines: ["Rest, walking or yoga."] },

  "2026-09-22": { week: 3, label: "1 km Repeats", intensity: "key", lines: ["Warm-up 12 min easy + drills.", "5 x 1 km @ 5:40–5:50/km.", "Recovery: 90 sec easy jog.", "Cooldown 10 min.", "This is the first benchmark session."] },
  "2026-09-23": { week: 3, label: "HYROX", intensity: "hard", lines: ["60 min technique + sleds + Ski/Row.", "RPE 7. Do not trash legs before travel."] },
  "2026-09-24": { week: 3, label: "Travel Day", intensity: "easy", lines: ["If practical: 30–40 min easy @ 6:45–7:15/km.", "If travel is chaotic: 25–40 min walk + 10 min mobility instead."] },
  "2026-09-25": { week: 3, label: "Hotel Strength", intensity: "moderate", lines: ["4 rounds: DB squat x12, DB RDL x12, reverse lunge x10/leg, DB row x12/side, push-ups x8–15, plank 40 sec.", "60–90 sec rest between rounds.", "No dumbbells? Use a backpack and bodyweight."] },
  "2026-09-26": { week: 3, label: "Compromised Travel Run", intensity: "hard", lines: ["Warm-up 10 min.", "5 rounds: 1 km @ 5:55–6:05/km + 12 burpees + 20 walking lunges + 12 air squats.", "Rest only as needed, max 90 sec.", "Treadmill: use 1% incline."] },
  "2026-09-27": { week: 3, label: "Long Run", intensity: "moderate", lines: ["8 km @ 6:35–7:05/km.", "Street or treadmill. Choose safe route and cooler time of day."] },
  "2026-09-28": { week: 3, label: "Recovery", intensity: "recovery", lines: ["Rest or 45–60 min easy yoga / mobility."] },

  "2026-09-29": { week: 4, label: "Tempo", intensity: "moderate", lines: ["2 km easy.", "4 km continuous @ 5:50–6:00/km.", "1 km cooldown.", "Treadmill option: 1% incline."] },
  "2026-09-30": { week: 4, label: "Hotel Strength", intensity: "moderate", lines: ["4 rounds: DB front squat x10, DB RDL x10, split squat x8/leg, shoulder press x10, 1-arm row x10/side, calf raise x18.", "Then 3 rounds: 12 burpees + 20 m or 20 reps walking lunges + 15 thrusters/light wall-ball substitute."] },
  "2026-10-01": { week: 4, label: "Easy Run", intensity: "easy", lines: ["45 min @ 6:40–7:10/km.", "Finish with 6 x 20 sec strides, 60 sec easy between."] },
  "2026-10-02": { week: 4, label: "Recovery", intensity: "recovery", lines: ["Rest or 40–60 min yoga.", "If yoga is hot/power, keep Saturday conservative."] },
  "2026-10-03": { week: 4, label: "Mini HYROX — No Machines", intensity: "hard", lines: ["Warm-up 12 min.", "6 x 1 km @ 5:50–6:00/km.", "After run 1: 20 DB thrusters.", "After run 2: 20 burpees.", "After run 3: 30 reverse lunges total.", "After run 4: 40 m suitcase carry or 60 sec heavy DB carry.", "After run 5: 20 DB deadlifts.", "After run 6: 20 air squats.", "Keep transitions calm. No racing."] },
  "2026-10-04": { week: 4, label: "Travel / Long Easy", intensity: "moderate", lines: ["Option A if schedule allows: 7–8 km @ 6:40–7:10/km.", "Option B if travel day is messy: 35–45 min easy + walk later."] },
  "2026-10-05": { week: 4, label: "Reset", intensity: "recovery", lines: ["Full rest or gentle yoga.", "Back home: sleep, hydration, normal meals, no \"catch-up\" session."] },

  "2026-10-06": { week: 5, label: "Speed", intensity: "hard", lines: ["Warm-up 12–15 min + drills + 3 strides.", "6 x 800 m @ 5:25–5:35/km.", "Recovery: 90 sec easy jog.", "Then 4 x 200 m quick but relaxed, 60 sec walk/jog.", "Cooldown 10 min."] },
  "2026-10-07": { week: 5, label: "HYROX Strength", intensity: "hard", lines: ["4 x 25 m sled push.", "4 x 25 m sled pull.", "4 x 100 m farmers carry.", "4 x 25 m lunges.", "5 x 15 wall balls.", "RPE 7."] },
  "2026-10-08": { week: 5, label: "Z2", intensity: "easy", lines: ["50–55 min @ 6:35–7:05/km."] },
  "2026-10-09": { week: 5, label: "Recovery", intensity: "recovery", lines: ["Rest or yoga."] },
  "2026-10-10": { week: 5, label: "Big Compromised", intensity: "hard", lines: ["7 x 1 km @ 5:45–5:55/km.", "Between runs: Ski 1000 m / sled push 50 m / sled pull 50 m / BBJ 60 m / Row 1000 m / farmers 200 m / lunges 100 m.", "No wall balls. RPE max 8.", "This is controlled work, not a race."] },
  "2026-10-11": { week: 5, label: "Recovery Run", intensity: "easy", lines: ["40 min @ 6:55–7:30/km, OR easy bike/walk if legs are heavy."] },
  "2026-10-12": { week: 5, label: "Off", intensity: "recovery", lines: ["Full rest."] },

  "2026-10-13": { week: 6, label: "Race-Pace Test", intensity: "key", lines: ["Warm-up 15 min.", "4 x 1 km @ 5:30–5:40/km, 90 sec recovery.", "Then 2 x 1 km @ 5:40–5:50/km, 60 sec recovery.", "Cooldown 10 min.", "Record split, HR, RPE, and whether the last rep still feels technically clean."] },
  "2026-10-14": { week: 6, label: "Recovery", intensity: "recovery", lines: ["Yoga, mobility, walking."] },
  "2026-10-15": { week: 6, label: "Z2", intensity: "easy", lines: ["40 min @ 6:40–7:10/km.", "4 x 20 sec strides."] },
  "2026-10-16": { week: 6, label: "Off", intensity: "recovery", lines: ["Sleep, hydrate, eat normally. No \"activation\" workout."] },
  "2026-10-17": { week: 6, label: "Dress Rehearsal", intensity: "key", lines: ["75–80% HYROX simulation.", "1 km + 750 m Ski.", "1 km + sled push.", "1 km + sled pull.", "1 km + 40 m BBJ.", "1 km + 750 m Row.", "1 km + 150 m farmers.", "1 km + 75 m lunges.", "Finish with 50 wall balls.", "Runs initially @ 5:45–5:55/km. Adjust only if training clearly supports faster."] },
  "2026-10-18": { week: 6, label: "Off", intensity: "recovery", lines: ["Complete rest or restorative yoga."] },
  "2026-10-19": { week: 6, label: "Easy Reset", intensity: "easy", lines: ["30–35 min recovery jog @ 6:55–7:25/km OR walk if still fatigued."] },

  "2026-10-20": { week: 7, label: "Sharpen", intensity: "moderate", lines: ["10–12 min easy.", "4 x 800 m @ 5:25–5:35/km.", "2 min recovery.", "10 min cooldown.", "Finish feeling like you could do one more."] },
  "2026-10-21": { week: 7, label: "HYROX Technique", intensity: "easy", lines: ["40 min total, RPE 6.", "Light Ski, Row, a few sled lengths, 30 total wall balls."] },
  "2026-10-22": { week: 7, label: "Easy", intensity: "easy", lines: ["35 min @ 6:45–7:15/km."] },
  "2026-10-23": { week: 7, label: "Off", intensity: "recovery", lines: ["Full rest."] },
  "2026-10-24": { week: 7, label: "Primer", intensity: "easy", lines: ["30 min total.", "3 rounds: 800 m @ ~5:45/km + 250 m Ski/Row + 10 lunges + 10 wall balls.", "Easy recovery. This should feel playful."] },
  "2026-10-25": { week: 7, label: "Recovery", intensity: "recovery", lines: ["Rest or gentle yoga only."] },
  "2026-10-26": { week: 7, label: "Off", intensity: "recovery", lines: ["Walk, mobility, hydration, sleep."] },

  "2026-10-27": { week: 8, label: "Easy + Strides", intensity: "easy", lines: ["25 min @ 6:45–7:15/km.", "4 x 20 sec relaxed strides.", "Stop while you feel fresh."] },
  "2026-10-28": { week: 8, label: "Recovery", intensity: "recovery", lines: ["Rest or 30–40 min easy walk.", "10–15 min mobility."] },
  "2026-10-29": { week: 8, label: "Primer", intensity: "easy", lines: ["20–25 min total.", "10 min easy + 3 x 2 min @ ~5:40–5:50/km with 2 min easy between + cooldown.", "Finish sharp, not tired."] },
  "2026-10-30": { week: 8, label: "Off", intensity: "recovery", lines: ["Full rest.", "Normal meals, carbs, fluids, electrolytes, sleep."] },
  "2026-10-31": { week: 8, label: "Shakeout", intensity: "recovery", lines: ["15–20 min ridiculously easy jog OR 20–30 min walk if you prefer.", "3 x 15 sec relaxed strides only if legs feel great.", "5–10 min mobility. Done."] },
  "2026-11-01": {
    week: 8, label: "HYROX — Redemption Day", intensity: "key",
    lines: [
      "Km 1: ~5:45/km. Should feel almost suspiciously easy.",
      "Km 2: ~5:40/km, still controlled.",
      "Km 3–6: settle into sustainable race pace based on Week 6 data.",
      "Km 7: permission to suffer.",
      "Km 8: empty the tank.",
      "Stations: efficient, clean, no hero moves.",
    ],
    mantra: "I know this feeling. I have been here before. I do not need to panic.",
    kpis: ["Consistency across the block.", "No dramatic pace collapse across the 8 runs.", "A controlled first 2 km."],
  },
};

/* --------------------------------------------------------------------------
   NUTRITION — keyed by ISO date. pre / breakfast / lunch / snack / dinner / post
   -------------------------------------------------------------------------- */
const NUTRITION = {
  "2026-09-08": { breakfast: "250 g Chobani + 1 scoop protein + 100 g banana + 25 g oats + cinnamon", lunch: "160 g chicken + 130 g cooked rice + 250 g green beans/squash + 35 g avocado", snack: "150–200 g Chobani + 1 sugar-free chocolate", dinner: "150 g chicken + 100–130 g cooked rice + 300 g green beans/squash + 30 g avocado" },
  "2026-09-09": { breakfast: "Hotcakes: 40 g oats + 1 egg + 120 g egg whites + ½ scoop protein + 60 g banana; 100 g Chobani on top", lunch: "150 g lean meat + 140 g cooked rice + 250 g nopales/greens + 30 g avocado", snack: "150 g Chobani + 1 fruit (apple or banana)", dinner: "150 g drained tuna + 15 g mayo + 6–8 ultra-thin tortillas + 300 g cucumber/tomato" },
  "2026-09-10": { pre: "½ banana or ½ bagel, 30–45 min before, if hungry", breakfast: "1 bagel (90–100 g) + 100 g turkey/chicken + 30 g panela cheese + tomato/greens", lunch: "160 g chicken + 130 g cooked rice + 250 g green beans/squash + 35 g avocado", snack: "150–200 g Chobani + 1 sugar-free chocolate", dinner: "150 g chicken/meat + 6–8 ultra-thin tortillas + 250 g nopales/greens + salsa" },
  "2026-09-11": { breakfast: "250 g Chobani + 1 scoop protein + 100 g banana + 25 g oats + cinnamon", lunch: "170 g white fish + 150 g cooked rice + 250 g greens + 30 g avocado", snack: "150 g Chobani + 1 fruit (apple or banana)", dinner: "1 bagel (90–100 g) + 150 g lean meat + 200 g greens + 100 g Chobani" },
  "2026-09-12": { pre: "½ bagel + coffee/water", breakfast: "Hotcakes: 40 g oats + 1 egg + 120 g egg whites + ½ scoop protein + 60 g banana; 100 g Chobani on top", lunch: "160 g chicken + 130 g cooked rice + 250 g green beans/squash + 35 g avocado", snack: "150–200 g Chobani + 1 sugar-free chocolate", dinner: "150 g chicken + 100–130 g cooked rice + 300 g green beans/squash + 30 g avocado", post: "If training early: 1 scoop protein + 1 banana right after; then eat breakfast normally." },
  "2026-09-13": { breakfast: "250 g Chobani + 1 scoop protein + 100 g banana + 25 g oats + cinnamon", lunch: "150 g lean meat + 140 g cooked rice + 250 g nopales/greens + 30 g avocado", snack: "150–200 g Chobani + 1 sugar-free chocolate", dinner: "150 g drained tuna + 15 g mayo + 6–8 ultra-thin tortillas + 300 g cucumber/tomato" },
  "2026-09-14": { breakfast: "1 bagel (90–100 g) + 100 g turkey/chicken + 30 g panela cheese + tomato/greens", lunch: "160 g chicken + 130 g cooked rice + 250 g green beans/squash + 35 g avocado", snack: "150 g Chobani + 1 fruit (apple or banana)", dinner: "150 g chicken + 100–130 g cooked rice + 300 g green beans/squash + 30 g avocado" },

  "2026-09-15": { pre: "½–1 bagel + ½ banana", breakfast: "250 g Chobani + 1 scoop protein + 100 g banana + 25 g oats + cinnamon", lunch: "170 g white fish + 150 g cooked rice + 250 g greens + 30 g avocado", snack: "150 g Chobani + 1 fruit (apple or banana)", dinner: "1 bagel (90–100 g) + 150 g lean meat + 200 g greens + 100 g Chobani", post: "If AM session: shake with 1 scoop protein + 1 banana + water/ice." },
  "2026-09-16": { pre: "½ bagel if more than 3 h since last meal", breakfast: "1 bagel (90–100 g) + 100 g turkey/chicken + 30 g panela cheese + tomato/greens", lunch: "160 g chicken + 130 g cooked rice + 250 g green beans/squash + 35 g avocado", snack: "150–200 g Chobani + 1 sugar-free chocolate", dinner: "150 g chicken/meat + 6–8 ultra-thin tortillas + 250 g nopales/greens + salsa" },
  "2026-09-17": { pre: "½ banana, optional", breakfast: "Hotcakes: 40 g oats + 1 egg + 120 g egg whites + ½ scoop protein + 60 g banana; 100 g Chobani on top", lunch: "150 g lean meat + 140 g cooked rice + 250 g nopales/greens + 30 g avocado", snack: "150 g Chobani + 1 fruit (apple or banana)", dinner: "150 g chicken + 100–130 g cooked rice + 300 g green beans/squash + 30 g avocado" },
  "2026-09-18": { breakfast: "250 g Chobani + 1 scoop protein + 100 g banana + 25 g oats + cinnamon", lunch: "160 g chicken + 130 g cooked rice + 250 g green beans/squash + 35 g avocado", snack: "150–200 g Chobani + 1 sugar-free chocolate", dinner: "1 bagel (90–100 g) + 150 g lean meat + 200 g greens + 100 g Chobani" },
  "2026-09-19": { pre: "1 bagel + ½ banana, 60–90 min before", breakfast: "1 bagel (90–100 g) + 100 g turkey/chicken + 30 g panela cheese + tomato/greens", lunch: "170 g white fish + 150 g cooked rice + 250 g greens + 30 g avocado", snack: "150 g Chobani + 1 fruit (apple or banana)", dinner: "150 g chicken/meat + 6–8 ultra-thin tortillas + 250 g nopales/greens + salsa", post: "1 scoop protein + 1 banana right away if the next meal is delayed." },
  "2026-09-20": { pre: "1 bagel + ½ banana", breakfast: "Hotcakes: 40 g oats + 1 egg + 120 g egg whites + ½ scoop protein + 60 g banana; 100 g Chobani on top", lunch: "160 g chicken + 130 g cooked rice + 250 g green beans/squash + 35 g avocado", snack: "150–200 g Chobani + 1 sugar-free chocolate", dinner: "150 g chicken + 100–130 g cooked rice + 300 g green beans/squash + 30 g avocado", post: "Water + electrolytes; full breakfast afterward." },
  "2026-09-21": { breakfast: "250 g Chobani + 1 scoop protein + 100 g banana + 25 g oats + cinnamon", lunch: "150 g lean meat + 140 g cooked rice + 250 g nopales/greens + 30 g avocado", snack: "150 g Chobani + 1 fruit (apple or banana)", dinner: "150 g drained tuna + 15 g mayo + 6–8 ultra-thin tortillas + 300 g cucumber/tomato" },

  "2026-09-22": { pre: "1 bagel + ½ banana", breakfast: "1 bagel (90–100 g) + 100 g turkey/chicken + 30 g panela cheese + tomato/greens", lunch: "160 g chicken + 130 g cooked rice + 250 g green beans/squash + 35 g avocado", snack: "150–200 g Chobani + 1 sugar-free chocolate", dinner: "150 g chicken + 100–130 g cooked rice + 300 g green beans/squash + 30 g avocado", post: "1 scoop protein + fruit if you don't eat within 60 min." },
  "2026-09-23": { pre: "½–1 bagel", breakfast: "250 g Chobani + 1 scoop protein + 100 g banana + 25 g oats + cinnamon", lunch: "170 g white fish + 150 g cooked rice + 250 g greens + 30 g avocado", snack: "150 g Chobani + 1 fruit (apple or banana)", dinner: "150 g chicken/meat + 6–8 ultra-thin tortillas + 250 g nopales/greens + salsa" },
  "2026-09-24": { breakfast: "250 g Chobani + 1 scoop protein + 100 g banana + 25 g oats + cinnamon", lunch: "Bowl out: 150–170 g protein + 1 cup rice/potato + vegetables", snack: "150–200 g Chobani + 1 sugar-free chocolate", dinner: "150 g protein + 1 carb portion + vegetables" },
  "2026-09-25": { breakfast: "1 bagel (90–100 g) + 100 g turkey/chicken + 30 g panela cheese + tomato/greens", lunch: "150–170 g chicken/meat/fish + rice/potato + vegetables", snack: "150 g Chobani + 1 fruit (apple or banana)", dinner: "150 g drained tuna + 15 g mayo + 6–8 ultra-thin tortillas + 300 g cucumber/tomato" },
  "2026-09-26": { pre: "1 bagel or banana + coffee", breakfast: "250 g Chobani + 1 scoop protein + 100 g banana + 25 g oats + cinnamon", lunch: "Bowl: 160 g protein + 150–180 g cooked rice + vegetables", snack: "150–200 g Chobani + 1 sugar-free chocolate", dinner: "1 bagel + 150 g chicken/turkey/meat + vegetables", post: "Protein shake if the next meal is delayed." },
  "2026-09-27": { pre: "1 bagel + 1 banana if running more than 60 min after waking", breakfast: "1 bagel (90–100 g) + 100 g turkey/chicken + 30 g panela cheese + tomato/greens", lunch: "160 g chicken + 170 g rice + vegetables + 30 g avocado", snack: "150 g Chobani + 1 fruit (apple or banana)", dinner: "150 g chicken + 100–130 g cooked rice + 300 g green beans/squash + 30 g avocado" },
  "2026-09-28": { breakfast: "Hotcakes: 40 g oats + 1 egg + 120 g egg whites + ½ scoop protein + 60 g banana; 100 g Chobani on top", lunch: "150 g lean meat + 140 g cooked rice + 250 g nopales/greens + 30 g avocado", snack: "150–200 g Chobani + 1 sugar-free chocolate", dinner: "150 g drained tuna + 15 g mayo + 6–8 ultra-thin tortillas + 300 g cucumber/tomato" },

  "2026-09-29": { pre: "1 bagel + ½ banana", breakfast: "1 bagel (90–100 g) + 100 g turkey/chicken + 30 g panela cheese + tomato/greens", lunch: "160 g chicken + 160 g rice + 250 g vegetables", snack: "150 g Chobani + 1 fruit (apple or banana)", dinner: "150 g chicken + 100–130 g cooked rice + 300 g green beans/squash + 30 g avocado" },
  "2026-09-30": { breakfast: "250 g Chobani + 1 scoop protein + 100 g banana + 25 g oats + cinnamon", lunch: "150 g meat + 140 g rice/potato equivalent + vegetables", snack: "150–200 g Chobani + 1 sugar-free chocolate", dinner: "150 g chicken/meat + 6–8 ultra-thin tortillas + 250 g nopales/greens + salsa" },
  "2026-10-01": { pre: "½ banana, optional", breakfast: "Hotcakes: 40 g oats + 1 egg + 120 g egg whites + ½ scoop protein + 60 g banana; 100 g Chobani on top", lunch: "170 g white fish + 150 g cooked rice + 250 g greens + 30 g avocado", snack: "150 g Chobani + 1 fruit (apple or banana)", dinner: "1 bagel (90–100 g) + 150 g lean meat + 200 g greens + 100 g Chobani" },
  "2026-10-02": { breakfast: "250 g Chobani + 1 scoop protein + 100 g banana + 25 g oats + cinnamon", lunch: "160 g chicken + 130 g cooked rice + 250 g green beans/squash + 35 g avocado", snack: "150–200 g Chobani + 1 sugar-free chocolate", dinner: "150 g drained tuna + 15 g mayo + 6–8 ultra-thin tortillas + 300 g cucumber/tomato" },
  "2026-10-03": { pre: "1 bagel + 1 banana", breakfast: "1 bagel (90–100 g) + 100 g turkey/chicken + 30 g panela cheese + tomato/greens", lunch: "160 g chicken + 180 g rice + vegetables", snack: "150 g Chobani + 1 fruit (apple or banana)", dinner: "150 g chicken/meat + 6–8 ultra-thin tortillas + 250 g nopales/greens + salsa", post: "Protein + fruit if you won't eat soon." },
  "2026-10-04": { pre: "½–1 bagel if running", breakfast: "250 g Chobani + 1 scoop protein + 100 g banana + 25 g oats + cinnamon", lunch: "Bowl: 160 g protein + 150 g rice/potato + vegetables", snack: "150–200 g Chobani + 1 sugar-free chocolate", dinner: "150 g chicken + 100–130 g cooked rice + 300 g green beans/squash + 30 g avocado" },
  "2026-10-05": { breakfast: "Hotcakes: 40 g oats + 1 egg + 120 g egg whites + ½ scoop protein + 60 g banana; 100 g Chobani on top", lunch: "150 g lean meat + 140 g cooked rice + 250 g nopales/greens + 30 g avocado", snack: "150 g Chobani + 1 fruit (apple or banana)", dinner: "150 g drained tuna + 15 g mayo + 6–8 ultra-thin tortillas + 300 g cucumber/tomato" },

  "2026-10-06": { pre: "1 bagel + ½ banana", breakfast: "1 bagel (90–100 g) + 100 g turkey/chicken + 30 g panela cheese + tomato/greens", lunch: "160 g chicken + 130 g cooked rice + 250 g green beans/squash + 35 g avocado", snack: "150–200 g Chobani + 1 sugar-free chocolate", dinner: "150 g chicken + 100–130 g cooked rice + 300 g green beans/squash + 30 g avocado", post: "1 scoop protein + 1 banana if AM." },
  "2026-10-07": { pre: "½ bagel", breakfast: "250 g Chobani + 1 scoop protein + 100 g banana + 25 g oats + cinnamon", lunch: "170 g white fish + 150 g cooked rice + 250 g greens + 30 g avocado", snack: "150 g Chobani + 1 fruit (apple or banana)", dinner: "150 g chicken/meat + 6–8 ultra-thin tortillas + 250 g nopales/greens + salsa" },
  "2026-10-08": { pre: "½ banana, optional", breakfast: "Hotcakes: 40 g oats + 1 egg + 120 g egg whites + ½ scoop protein + 60 g banana; 100 g Chobani on top", lunch: "150 g lean meat + 140 g cooked rice + 250 g nopales/greens + 30 g avocado", snack: "150–200 g Chobani + 1 sugar-free chocolate", dinner: "1 bagel (90–100 g) + 150 g lean meat + 200 g greens + 100 g Chobani" },
  "2026-10-09": { breakfast: "250 g Chobani + 1 scoop protein + 100 g banana + 25 g oats + cinnamon", lunch: "160 g chicken + 130 g cooked rice + 250 g green beans/squash + 35 g avocado", snack: "150 g Chobani + 1 fruit (apple or banana)", dinner: "150 g drained tuna + 15 g mayo + 6–8 ultra-thin tortillas + 300 g cucumber/tomato" },
  "2026-10-10": { pre: "1 bagel + 1 banana, 60–90 min before", breakfast: "1 bagel (90–100 g) + 100 g turkey/chicken + 30 g panela cheese + tomato/greens", lunch: "160 g chicken + 180–200 g rice + vegetables + 30 g avocado", snack: "150–200 g Chobani + 1 sugar-free chocolate", dinner: "150 g meat + 150 g rice + 250 g vegetables", post: "Water + electrolytes; 25–30 g protein if the next meal is delayed." },
  "2026-10-11": { pre: "½ banana, optional", breakfast: "Hotcakes: 40 g oats + 1 egg + 120 g egg whites + ½ scoop protein + 60 g banana; 100 g Chobani on top", lunch: "170 g white fish + 150 g cooked rice + 250 g greens + 30 g avocado", snack: "150 g Chobani + 1 fruit (apple or banana)", dinner: "150 g chicken + 100–130 g cooked rice + 300 g green beans/squash + 30 g avocado" },
  "2026-10-12": { breakfast: "250 g Chobani + 1 scoop protein + 100 g banana + 25 g oats + cinnamon", lunch: "150 g lean meat + 140 g cooked rice + 250 g nopales/greens + 30 g avocado", snack: "150–200 g Chobani + 1 sugar-free chocolate", dinner: "150 g drained tuna + 15 g mayo + 6–8 ultra-thin tortillas + 300 g cucumber/tomato" },

  "2026-10-13": { pre: "1 bagel + ½–1 banana", breakfast: "1 bagel (90–100 g) + 100 g turkey/chicken + 30 g panela cheese + tomato/greens", lunch: "160 g chicken + 170 g rice + vegetables", snack: "150 g Chobani + 1 fruit (apple or banana)", dinner: "150 g chicken + 100–130 g cooked rice + 300 g green beans/squash + 30 g avocado" },
  "2026-10-14": { breakfast: "250 g Chobani + 1 scoop protein + 100 g banana + 25 g oats + cinnamon", lunch: "160 g chicken + 130 g cooked rice + 250 g green beans/squash + 35 g avocado", snack: "150–200 g Chobani + 1 sugar-free chocolate", dinner: "150 g drained tuna + 15 g mayo + 6–8 ultra-thin tortillas + 300 g cucumber/tomato" },
  "2026-10-15": { pre: "½ banana, optional", breakfast: "Hotcakes: 40 g oats + 1 egg + 120 g egg whites + ½ scoop protein + 60 g banana; 100 g Chobani on top", lunch: "170 g white fish + 150 g cooked rice + 250 g greens + 30 g avocado", snack: "150 g Chobani + 1 fruit (apple or banana)", dinner: "150 g chicken/meat + 6–8 ultra-thin tortillas + 250 g nopales/greens + salsa" },
  "2026-10-16": { breakfast: "250 g Chobani + 1 scoop protein + 100 g banana + 25 g oats + cinnamon", lunch: "150 g lean meat + 140 g cooked rice + 250 g nopales/greens + 30 g avocado", snack: "150–200 g Chobani + 1 sugar-free chocolate", dinner: "150 g chicken + 100–130 g cooked rice + 300 g green beans/squash + 30 g avocado" },
  "2026-10-17": { pre: "1 bagel + 1 banana, 60–90 min before", breakfast: "1 bagel (90–100 g) + 100 g turkey/chicken + 30 g panela cheese + tomato/greens", lunch: "160 g chicken + 180–200 g rice + vegetables", snack: "150 g Chobani + 1 fruit (apple or banana)", dinner: "150 g meat/chicken + 150 g rice + vegetables", post: "Electrolytes + 25–30 g protein if you won't eat soon." },
  "2026-10-18": { breakfast: "250 g Chobani + 1 scoop protein + 100 g banana + 25 g oats + cinnamon", lunch: "160 g chicken + 130 g cooked rice + 250 g green beans/squash + 35 g avocado", snack: "150–200 g Chobani + 1 sugar-free chocolate", dinner: "150 g drained tuna + 15 g mayo + 6–8 ultra-thin tortillas + 300 g cucumber/tomato" },
  "2026-10-19": { breakfast: "Hotcakes: 40 g oats + 1 egg + 120 g egg whites + ½ scoop protein + 60 g banana; 100 g Chobani on top", lunch: "150 g lean meat + 140 g cooked rice + 250 g nopales/greens + 30 g avocado", snack: "150 g Chobani + 1 fruit (apple or banana)", dinner: "150 g chicken + 100–130 g cooked rice + 300 g green beans/squash + 30 g avocado" },

  "2026-10-20": { pre: "½–1 bagel + ½ banana", breakfast: "1 bagel (90–100 g) + 100 g turkey/chicken + 30 g panela cheese + tomato/greens", lunch: "160 g chicken + 130 g cooked rice + 250 g green beans/squash + 35 g avocado", snack: "150–200 g Chobani + 1 sugar-free chocolate", dinner: "150 g chicken + 100–130 g cooked rice + 300 g green beans/squash + 30 g avocado" },
  "2026-10-21": { breakfast: "250 g Chobani + 1 scoop protein + 100 g banana + 25 g oats + cinnamon", lunch: "170 g white fish + 150 g cooked rice + 250 g greens + 30 g avocado", snack: "150 g Chobani + 1 fruit (apple or banana)", dinner: "150 g chicken/meat + 6–8 ultra-thin tortillas + 250 g nopales/greens + salsa" },
  "2026-10-22": { breakfast: "Hotcakes: 40 g oats + 1 egg + 120 g egg whites + ½ scoop protein + 60 g banana; 100 g Chobani on top", lunch: "150 g lean meat + 140 g cooked rice + 250 g nopales/greens + 30 g avocado", snack: "150–200 g Chobani + 1 sugar-free chocolate", dinner: "1 bagel (90–100 g) + 150 g lean meat + 200 g greens + 100 g Chobani" },
  "2026-10-23": { breakfast: "250 g Chobani + 1 scoop protein + 100 g banana + 25 g oats + cinnamon", lunch: "160 g chicken + 130 g cooked rice + 250 g green beans/squash + 35 g avocado", snack: "150 g Chobani + 1 fruit (apple or banana)", dinner: "150 g drained tuna + 15 g mayo + 6–8 ultra-thin tortillas + 300 g cucumber/tomato" },
  "2026-10-24": { pre: "½ bagel + ½ banana", breakfast: "1 bagel (90–100 g) + 100 g turkey/chicken + 30 g panela cheese + tomato/greens", lunch: "160 g chicken + 150 g rice + vegetables", snack: "150–200 g Chobani + 1 sugar-free chocolate", dinner: "150 g chicken + 100–130 g cooked rice + 300 g green beans/squash + 30 g avocado" },
  "2026-10-25": { breakfast: "250 g Chobani + 1 scoop protein + 100 g banana + 25 g oats + cinnamon", lunch: "170 g white fish + 150 g cooked rice + 250 g greens + 30 g avocado", snack: "150 g Chobani + 1 fruit (apple or banana)", dinner: "150 g drained tuna + 15 g mayo + 6–8 ultra-thin tortillas + 300 g cucumber/tomato" },
  "2026-10-26": { breakfast: "Hotcakes: 40 g oats + 1 egg + 120 g egg whites + ½ scoop protein + 60 g banana; 100 g Chobani on top", lunch: "160 g chicken + 130 g cooked rice + 250 g green beans/squash + 35 g avocado", snack: "150–200 g Chobani + 1 sugar-free chocolate", dinner: "150 g chicken + 100–130 g cooked rice + 300 g green beans/squash + 30 g avocado" },

  "2026-10-27": { breakfast: "1 bagel (90–100 g) + 100 g turkey/chicken + 30 g panela cheese + tomato/greens", lunch: "160 g chicken + 150 g rice + vegetables", snack: "150 g Chobani + 1 fruit (apple or banana)", dinner: "150 g chicken + 100–130 g cooked rice + 300 g green beans/squash + 30 g avocado" },
  "2026-10-28": { breakfast: "250 g Chobani + 1 scoop protein + 100 g banana + 25 g oats + cinnamon", lunch: "160 g chicken + 150 g rice + vegetables", snack: "150–200 g Chobani + 1 sugar-free chocolate", dinner: "150 g chicken/meat + 6–8 ultra-thin tortillas + 250 g nopales/greens + salsa" },
  "2026-10-29": { pre: "½ bagel + ½ banana", breakfast: "1 bagel (90–100 g) + 100 g turkey/chicken + 30 g panela cheese + tomato/greens", lunch: "160 g chicken + 170 g rice + vegetables", snack: "150 g Chobani + 1 fruit (apple or banana)", dinner: "150 g chicken + 130 g rice + vegetables" },
  "2026-10-30": { breakfast: "250 g Chobani + 1 scoop protein + 100 g banana + 25 g oats + cinnamon", lunch: "160 g chicken + 180 g rice + cooked vegetables", snack: "150–200 g Chobani + 1 sugar-free chocolate", dinner: "150 g chicken/fish + 150 g rice + cooked vegetables" },
  "2026-10-31": { breakfast: "1 bagel (90–100 g) + 100 g turkey/chicken + 30 g panela cheese + tomato/greens", lunch: "160 g chicken + 180–200 g rice + cooked vegetables", snack: "150 g Chobani + banana", dinner: "150 g chicken + 150–180 g rice + a little cooked vegetable. Nothing new." },
  "2026-11-01": {
    pre: "500–750 ml water/electrolytes in the hours before. No chugging liters at once.",
    breakfast: "3–4 h before: 1 bagel + 1 banana + 150 g Chobani. Coffee if that's your normal.",
    lunch: "POST-RACE: a normal meal with protein + carbohydrate + salt + fluids.",
    snack: "If needed 30–45 min before the race: ½ banana or a few sips of sports drink.",
    dinner: "CELEBRATION DINNER. Eat normally, hydrate, and enjoy it.",
    post: "Afterward: 25–35 g protein + carbohydrates.",
  },
};

/* --------------------------------------------------------------------------
   EQUIVALENTS — meal-plan swaps (approximate, not exact macro/calorie matches)
   -------------------------------------------------------------------------- */
const EQUIVALENTS = {
  protein: {
    label: "Protein",
    base: { food: "Chicken", amount: 155, unit: "g", note: "150–160 g cooked" },
    swaps: [
      { food: "Lean beef", amount: 145, unit: "g", note: "140–150 g cooked" },
      { food: "White fish", amount: 175, unit: "g", note: "170–180 g cooked" },
      { food: "Tuna (drained)", amount: 155, unit: "g", note: "150–160 g" },
      { food: "Turkey breast", amount: 150, unit: "g", note: "150 g" },
      { food: "Eggs", amount: 2, unit: "eggs + 190 g whites", note: "2 eggs + 180–200 g egg whites" },
    ],
  },
  proteinSnack: {
    label: "Protein — Snack / Breakfast",
    base: { food: "Chobani + protein", amount: 250, unit: "g", note: "250 g Chobani + ½ scoop protein" },
    swaps: [
      { food: "Protein powder", amount: 1, unit: "scoop", note: "1 scoop protein powder" },
      { food: "Chobani + turkey", amount: 150, unit: "g Chobani", note: "150 g Chobani + 60–80 g turkey" },
    ],
  },
  carb: {
    label: "Carbs",
    base: { food: "Cooked rice", amount: 130, unit: "g", note: "120–140 g cooked" },
    swaps: [
      { food: "Bagel", amount: 1, unit: "bagel", note: "90–100 g" },
      { food: "Potato", amount: 235, unit: "g", note: "220–250 g cooked" },
      { food: "Ultra-thin tortillas", amount: 7, unit: "tortillas", note: "6–8 (check your package)" },
      { food: "Pita + fruit", amount: 1, unit: "pita + 1 fruit", note: "1 medium pita + 1 fruit" },
      { food: "Oats + fruit", amount: 42, unit: "g + 1 fruit", note: "40–45 g oats + 1 fruit" },
    ],
  },
  carbAddOn: {
    label: "Carb — Hard-Day Add-On",
    note: "Use around HYROX, intervals, compromised sessions and long runs.",
    swaps: [
      { food: "Extra bagel", amount: 0.75, unit: "bagel", note: "+ ½–1 bagel" },
      { food: "Banana", amount: 1, unit: "banana", note: "+ 1 banana" },
      { food: "Extra rice", amount: 50, unit: "g", note: "+ 40–60 g extra cooked rice" },
    ],
  },
  fat: {
    label: "Fats",
    base: { food: "Avocado", amount: 32, unit: "g", note: "30–35 g" },
    swaps: [
      { food: "Olive oil", amount: 5, unit: "g / 1 tsp", note: "5 g / 1 tsp" },
      { food: "Nut butter", amount: 11, unit: "g", note: "10–12 g" },
      { food: "Cheese", amount: 27, unit: "g", note: "25–30 g" },
    ],
  },
  vegetables: {
    label: "Vegetables",
    base: { food: "Green beans / squash", amount: 275, unit: "g", note: "250–300 g" },
    swaps: [
      { food: "Nopales", amount: 275, unit: "g" },
      { food: "Cucumber", amount: 275, unit: "g" },
      { food: "Tomato", amount: 275, unit: "g" },
      { food: "Carrots", amount: 275, unit: "g" },
      { food: "Lettuce / spinach", amount: 275, unit: "g" },
    ],
    note: "250–300 g green beans, squash, nopales, cucumber, tomato, carrots, lettuce/spinach. Mix freely.",
  },
};

const QUICK_RULE = "Easy/off day: use the standard menu. Hard HYROX / intervals / long run: keep the standard menu and add the listed pre-fuel or hard-day carb add-on. Recovery: never remove protein or meals just because you did less training.";

const NUTRITION_OBJECTIVES = [
  { title: "Fuel performance.", body: "Hard HYROX, intervals, compromised runs and long runs get more carbohydrate — not less." },
  { title: "Protect muscle and recovery.", body: "Aim for roughly 130–145 g protein/day, spread across the day." },
  { title: "Lean out gradually, never aggressively.", body: "Consistency beats restriction. Rest days are still eating days." },
  { title: "Keep digestion predictable.", body: "Mostly familiar foods, normal salt, plenty of fluids, and no dramatic pre-race experiments." },
  { title: "Travel without drama.", body: "Sep 24–Oct 4: prioritize protein + a clear carb source + vegetables; perfection is not required." },
];

const DAILY_BASICS = {
  fluids: "2–2.5 L baseline + ~500–750 ml per hour of training as needed. Use electrolytes on long/hot/sweaty sessions.",
  vegetables: "Generally 250–300 g at lunch and dinner. If raw vegetables bloat you, choose cooked green beans, squash or nopales.",
  preTraining: "Hard/long morning sessions are not the time to prove you can train fasted. Use the listed pre-fuel.",
  flexibleMeals: "1–2 per week are fine. One flexible meal stays one meal; the next meal goes back to normal.",
};

/* --------------------------------------------------------------------------
   DAILY MESSAGES — rotate by date
   -------------------------------------------------------------------------- */
const DAILY_MESSAGES = [
  "Fuel the work.",
  "Consistency over intensity.",
  "Strong legs need fuel.",
  "Eat. Train. Recover. Repeat.",
  "Easy means easy.",
  "You don't need perfect. You need repeatable.",
  "Trust the work.",
  "Recovery is training.",
  "Built, not rushed.",
  "Race the plan.",
];

/* --------------------------------------------------------------------------
   SOS MEAL GENERATOR TEMPLATES
   -------------------------------------------------------------------------- */
const SOS_PROTEINS = [
  { food: "chicken", amount: "160 g" },
  { food: "lean beef", amount: "150 g" },
  { food: "white fish", amount: "170 g" },
  { food: "tuna", amount: "150 g" },
  { food: "turkey", amount: "150 g" },
];
const SOS_CARBS = [
  { food: "cooked rice", amount: "130 g" },
  { food: "bagel", amount: "1" },
  { food: "ultra-thin tortillas", amount: "6–8" },
  { food: "potato", amount: "230 g" },
];
const SOS_CARBS_HARD = [
  { food: "cooked rice", amount: "180 g" },
  { food: "bagel", amount: "1½" },
  { food: "ultra-thin tortillas", amount: "8" },
  { food: "potato", amount: "280 g" },
];
const SOS_VEG = [
  { food: "green beans/squash", amount: "250–300 g" },
  { food: "cucumber/tomato", amount: "300 g" },
  { food: "mixed greens", amount: "250 g" },
];
const SOS_BREAKFAST_BASES = [
  { text: "250 g Chobani + 1 scoop protein + 100 g banana + 25 g oats + cinnamon" },
  { text: "1 bagel (90–100 g) + 100 g turkey/chicken + 30 g panela cheese + tomato/greens" },
  { text: "Hotcakes: 40 g oats + 1 egg + 120 g egg whites + ½ scoop protein + 60 g banana; 100 g Chobani on top" },
];
const SOS_SNACK_BASES = [
  { text: "150–200 g Chobani + 1 sugar-free chocolate" },
  { text: "150 g Chobani + 1 fruit (apple or banana)" },
];
