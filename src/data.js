// ============ DATA & CONSTANTS ============
const D_TMS = { squat: 205, bench: 240, dead: 255, press: 120 };

const SCHEMES = {
  1: [{ p: .65, r: 5 }, { p: .75, r: 5 }, { p: .85, r: '5+', amrap: true }],
  2: [{ p: .70, r: 3 }, { p: .80, r: 3 }, { p: .90, r: '3+', amrap: true }],
  3: [{ p: .75, r: 5 }, { p: .85, r: 3 }, { p: .95, r: '1+', amrap: true }],
  4: [{ p: .40, r: 5 }, { p: .50, r: 5 }, { p: .60, r: 5 }]
};

const LL = { squat: 'Squat', bench: 'Bench Press', dead: 'Deadlift', press: 'Standing Press' };
const LCALS = { squat: '350–500', bench: '250–350', dead: '350–500', press: '250–350' };

const SCHEDULES = {
  '4day': {
    name: '4 Day / Week', icon: '4️⃣', source: 'Beyond 5/3/1 — Template 1',
    desc: 'Classic Wendler split. One main lift per day. Best for dedicated lifters with 4 training days.',
    days: [
      { label: 'Day A', subtitle: 'Press', lifts: ['press'], coulson: 'press' },
      { label: 'Day B', subtitle: 'Deadlift', lifts: ['dead'], coulson: 'dead' },
      { label: 'Day C', subtitle: 'Bench Press', lifts: ['bench'], coulson: 'bench' },
      { label: 'Day D', subtitle: 'Squat', lifts: ['squat'], coulson: 'squat' }
    ]
  },
  '3day': {
    name: '3 Day / Week', icon: '3️⃣', source: 'Beyond 5/3/1 — Template 2',
    desc: 'Mon/Wed/Fri. Final day combines Deadlift + Press back-to-back. All four lifts hit each week.',
    days: [
      { label: 'Day A', subtitle: 'Squat', lifts: ['squat'], coulson: 'squat' },
      { label: 'Day B', subtitle: 'Bench Press', lifts: ['bench'], coulson: 'bench' },
      { label: 'Day C', subtitle: 'Deadlift + Press', lifts: ['dead', 'press'], coulson: 'dead' }
    ]
  },
  '3rot': {
    name: '3 Day Rotating', icon: '🔄', source: 'Beyond 5/3/1 — Template 4',
    desc: '3-week rotation. Each lift rotates through the schedule. Takes 3 weeks to hit all 4 lifts on each day.',
    days: [
      { label: 'Week 1 · A', subtitle: 'Squat', lifts: ['squat'], coulson: 'squat' },
      { label: 'Week 1 · B', subtitle: 'Bench Press', lifts: ['bench'], coulson: 'bench' },
      { label: 'Week 1 · C', subtitle: 'Deadlift', lifts: ['dead'], coulson: 'dead' },
      { label: 'Week 2 · A', subtitle: 'Press', lifts: ['press'], coulson: 'press' },
      { label: 'Week 2 · B', subtitle: 'Squat', lifts: ['squat'], coulson: 'squat' },
      { label: 'Week 2 · C', subtitle: 'Bench Press', lifts: ['bench'], coulson: 'bench' },
      { label: 'Week 3 · A', subtitle: 'Deadlift', lifts: ['dead'], coulson: 'dead' },
      { label: 'Week 3 · B', subtitle: 'Press', lifts: ['press'], coulson: 'press' },
      { label: 'Week 3 · C', subtitle: 'Squat', lifts: ['squat'], coulson: 'squat' }
    ]
  },
  '2day': {
    name: '2 Day / Week', icon: '2️⃣', source: '5/3/1 2nd Ed. Option 1 · Beyond T8',
    desc: 'Two paired sessions per week. Lower + upper body each day. Good for busy schedules. Both lifts done back-to-back.',
    days: [
      { label: 'Day 1', subtitle: 'Squat + Bench', lifts: ['squat', 'bench'], coulson: 'squat' },
      { label: 'Day 2', subtitle: 'Deadlift + Press', lifts: ['dead', 'press'], coulson: 'dead' }
    ]
  },
  'custom': {
    name: 'Custom', icon: '⚙️', source: 'Manual selection',
    desc: 'Pick your lift manually each session. Best if your schedule changes week to week.',
    days: null
  }
};

const WARMUP = [
  { n: 'Jumping Jacks', r: '25 reps' }, { n: 'Glute Bridge', r: '20 reps' },
  { n: 'Single Leg Glute Bridge', r: '15/leg' }, { n: 'Cat/Cow', r: '10 reps' },
  { n: "World's Greatest Stretch", r: '10/side' }, { n: 'Bretzle', r: '5/side' },
  { n: 'Wall Slides', r: '10 reps' }, { n: 'Lateral Leg Swing', r: '10/side' },
  { n: 'Ball Slams (or alt)', r: '8 reps' }, { n: 'Bodyweight Squat', r: '15 reps' }
];

const COULSON = {
  squat: {
    label: 'Squat Day — Coulson Accessories',
    desc: 'After your 5/3/1 Squat. KB Front Squat & Goblet Squat here are accessory volume at light weight — not your main lift.',
    groups: [
      { type: 'superset', label: 'Superset B — No rest after B1, 90s after B2', deletable: true, items: [
        { name: 'KB Front Squat', pres: '5 × 8', sets: 5, reps: '8', rest: 'No rest after', w: '', r: '8' },
        { name: 'BW Walking Lunges', pres: '5 × 15/leg', sets: 5, reps: '15', rest: '90 sec', w: 'BW', r: '15' }
      ] },
      { type: 'superset', label: 'Superset C — 15s after C1, 90s after C2', deletable: true, items: [
        { name: 'Barbell Glute Bridge', pres: '4 × 10', sets: 4, reps: '10', rest: '15 sec', w: '', r: '10' },
        { name: 'Alternating Duck-Unders', pres: '4 × 12/leg', sets: 4, reps: '12', rest: '90 sec', w: 'BW', r: '12' }
      ] },
      { type: 'finisher', label: 'Finisher D — Minimal rest D1–D4, 60s after D4', deletable: true, items: [
        { name: 'Goblet Squat', pres: '3 × 10', sets: 3, reps: '10', rest: 'Minimal', w: '', r: '10' },
        { name: 'Plank', pres: '3 × 45 sec', sets: 3, reps: '45s', rest: 'Minimal', w: 'BW', r: '45s' },
        { name: 'Single Leg Glute Bridge', pres: '3 × 12/leg', sets: 3, reps: '12', rest: 'Minimal', w: 'BW', r: '12' },
        { name: 'Farmers Carry', pres: '25 yards', sets: 3, reps: '25yd', rest: '60 sec', w: '', r: '25yd' }
      ] }
    ]
  },
  dead: {
    label: 'Deadlift Day — Coulson Accessories',
    desc: 'After your 5/3/1 Deadlift. The deadlift block from Coulson W1 is skipped — you already pulled heavy. Focus on hip/knee patterns here.',
    groups: [
      { type: 'superset', label: 'Superset B — No rest after B1, 90s after B2', deletable: true, items: [
        { name: 'KB Front Squat', pres: '5 × 8', sets: 5, reps: '8', rest: 'No rest after', w: '', r: '8' },
        { name: 'BW Walking Lunges', pres: '5 × 15/leg', sets: 5, reps: '15', rest: '90 sec', w: 'BW', r: '15' }
      ] },
      { type: 'superset', label: 'Superset C — 15s after C1, 90s after C2', deletable: true, items: [
        { name: 'Barbell Glute Bridge', pres: '4 × 10', sets: 4, reps: '10', rest: '15 sec', w: '', r: '10' },
        { name: 'Alternating Duck-Unders', pres: '4 × 12/leg', sets: 4, reps: '12', rest: '90 sec', w: 'BW', r: '12' }
      ] },
      { type: 'finisher', label: 'Finisher D — Minimal rest D1–D4, 60s after D4', deletable: true, items: [
        { name: 'Goblet Squat', pres: '3 × 10', sets: 3, reps: '10', rest: 'Minimal', w: '', r: '10' },
        { name: 'Plank', pres: '3 × 45 sec', sets: 3, reps: '45s', rest: 'Minimal', w: 'BW', r: '45s' },
        { name: 'Single Leg Glute Bridge', pres: '3 × 12/leg', sets: 3, reps: '12', rest: 'Minimal', w: 'BW', r: '12' },
        { name: 'Farmers Carry', pres: '25 yards', sets: 3, reps: '25yd', rest: '60 sec', w: '', r: '25yd' }
      ] }
    ]
  },
  bench: {
    label: 'Bench Day — Coulson Accessories',
    desc: 'After your 5/3/1 Bench. Incline DB Bench here is lighter accessory volume — different angle, different stimulus than your main lift.',
    groups: [
      { type: 'superset', label: 'Superset A — 30s after A1, 60–90s after A2', deletable: true, items: [
        { name: 'Pull-Ups / Chin-Ups (assisted if needed)', pres: '4 × 6', sets: 4, reps: '6', rest: '30 sec', w: 'BW', r: '6' },
        { name: 'Garhammer Raise', pres: '4 × 8', sets: 4, reps: '8', rest: '60–90 sec', w: 'BW', r: '8' }
      ] },
      { type: 'superset', label: 'Superset B — 30s after B1, 60s after B2', deletable: true, items: [
        { name: 'Slight Incline DB Bench Press', pres: '5 × 8', sets: 5, reps: '8', rest: '30 sec', w: '', r: '8' },
        { name: 'Single Arm DB Row (knee on bench)', pres: '5 × 8/arm', sets: 5, reps: '8', rest: '60 sec', w: '', r: '8' }
      ] },
      { type: 'superset', label: 'Superset C — 45s after C1, 45s after C2', deletable: true, items: [
        { name: 'Overhand Grip Seated Cable Row', pres: '4 × 10', sets: 4, reps: '10', rest: '45 sec', w: '', r: '10' },
        { name: 'DB Seated Shoulder Press', pres: '4 × 10', sets: 4, reps: '10', rest: '45 sec', w: '', r: '10' }
      ] },
      { type: 'finisher', label: 'Finisher D — Minimal rest D1–D4, 60s after D4', deletable: true, items: [
        { name: 'Push-Up', pres: '3 × 10', sets: 3, reps: '10', rest: 'Minimal', w: 'BW', r: '10' },
        { name: 'Pallof Press', pres: '3 × 10/side', sets: 3, reps: '10', rest: 'Minimal', w: '', r: '10' },
        { name: 'DB High Pull', pres: '3 × 10', sets: 3, reps: '10', rest: 'Minimal', w: '', r: '10' },
        { name: 'Wall Slide', pres: '3 × 12', sets: 3, reps: '12', rest: '60 sec', w: 'BW', r: '12' }
      ] }
    ]
  },
  press: {
    label: 'Press Day — Coulson Accessories',
    desc: 'After your 5/3/1 Standing Press. DB Seated Shoulder Press removed — you already pressed overhead. Focus on pulling and horizontal push.',
    groups: [
      { type: 'superset', label: 'Superset A — 30s after A1, 60–90s after A2', deletable: true, items: [
        { name: 'Pull-Ups / Chin-Ups (assisted if needed)', pres: '4 × 6', sets: 4, reps: '6', rest: '30 sec', w: 'BW', r: '6' },
        { name: 'Garhammer Raise', pres: '4 × 8', sets: 4, reps: '8', rest: '60–90 sec', w: 'BW', r: '8' }
      ] },
      { type: 'superset', label: 'Superset B — 30s after B1, 60s after B2', deletable: true, items: [
        { name: 'Slight Incline DB Bench Press', pres: '5 × 8', sets: 5, reps: '8', rest: '30 sec', w: '', r: '8' },
        { name: 'Single Arm DB Row (knee on bench)', pres: '5 × 8/arm', sets: 5, reps: '8', rest: '60 sec', w: '', r: '8' }
      ] },
      { type: 'superset', label: 'Superset C — 45s after C1, 45s after C2', deletable: true, items: [
        { name: 'Overhand Grip Seated Cable Row', pres: '4 × 10', sets: 4, reps: '10', rest: '45 sec', w: '', r: '10' },
        { name: 'Face Pulls', pres: '4 × 15', sets: 4, reps: '15', rest: '45 sec', w: '', r: '15' }
      ] },
      { type: 'finisher', label: 'Finisher D — Minimal rest D1–D4, 60s after D4', deletable: true, items: [
        { name: 'Push-Up', pres: '3 × 10', sets: 3, reps: '10', rest: 'Minimal', w: 'BW', r: '10' },
        { name: 'Pallof Press', pres: '3 × 10/side', sets: 3, reps: '10', rest: 'Minimal', w: '', r: '10' },
        { name: 'DB High Pull', pres: '3 × 10', sets: 3, reps: '10', rest: 'Minimal', w: '', r: '10' },
        { name: 'Wall Slide', pres: '3 × 12', sets: 3, reps: '12', rest: '60 sec', w: 'BW', r: '12' }
      ] }
    ]
  },
  mrut2: {
    label: 'Workout 2 — MRUT',
    desc: 'Move quickly. Minimal rest between exercises. Complete all rounds before active recovery.',
    groups: [
      { type: 'circuit', label: 'Circuit A — 4 Rounds → Active Recovery: Row/Bike 5 min', deletable: true, items: [
        { name: 'Goblet Squat', pres: '10 reps', sets: 4, reps: '10', rest: 'Minimal', w: '', r: '10' },
        { name: 'Push-Up', pres: '8 reps', sets: 4, reps: '8', rest: 'Minimal', w: 'BW', r: '8' },
        { name: 'Plank', pres: '30 sec', sets: 4, reps: '30s', rest: 'Minimal → Row/Bike 5 min', w: 'BW', r: '30s' }
      ] },
      { type: 'circuit', label: 'Circuit B — 4 Rounds → Active Recovery: Row/Bike 3 min', deletable: true, items: [
        { name: 'DB Romanian Deadlift', pres: '10 reps', sets: 4, reps: '10', rest: 'Minimal', w: '', r: '10' },
        { name: 'Single Arm DB Bent Over Row', pres: '8 reps/side', sets: 4, reps: '8', rest: 'Minimal → Row/Bike 3 min', w: '', r: '8' }
      ] },
      { type: 'circuit', label: 'Circuit C — 5 Rounds → Active Recovery: Treadmill 10° incline 15 min', deletable: true, items: [
        { name: 'Walking Lunge', pres: '8 reps/leg', sets: 5, reps: '8', rest: 'Minimal', w: 'BW', r: '8' },
        { name: 'DB Seated Alternating Shoulder Press', pres: '8 reps/arm', sets: 5, reps: '8', rest: 'Minimal', w: '', r: '8' },
        { name: 'DB High Pull', pres: '10 reps', sets: 5, reps: '10', rest: 'Minimal → Treadmill 10° 15 min', w: '', r: '10' }
      ] }
    ]
  },
  mrut4: {
    label: 'Workout 4 — MRUT',
    desc: 'Move quickly. Minimal rest between exercises.',
    groups: [
      { type: 'circuit', label: 'Circuit A — 5 Rounds → Active Recovery: Row/Bike 5 min', deletable: true, items: [
        { name: 'Alternating Reverse Lunge', pres: '10 reps/leg', sets: 5, reps: '10', rest: 'Minimal', w: 'BW', r: '10' },
        { name: 'Single Arm Floor Press', pres: '8 reps/arm', sets: 5, reps: '8', rest: 'Minimal → Row/Bike 5 min', w: '', r: '8' }
      ] },
      { type: 'circuit', label: 'Circuit B — 6 Rounds → Active Recovery: Row/Bike 3 min', deletable: true, items: [
        { name: 'DB Hip Thrust', pres: '15 reps', sets: 6, reps: '15', rest: 'Minimal', w: '', r: '15' },
        { name: 'Inverted Row', pres: '8 reps', sets: 6, reps: '8', rest: 'Minimal', w: 'BW', r: '8' },
        { name: 'Hand Walkout', pres: '8 reps', sets: 6, reps: '8', rest: 'Minimal → Row/Bike 3 min', w: 'BW', r: '8' }
      ] },
      { type: 'circuit', label: 'Circuit C — 5 Rounds → Active Recovery: Treadmill 10° incline 15 min', deletable: true, items: [
        { name: 'Alternating Step Up', pres: '8 reps/leg', sets: 5, reps: '8', rest: 'Minimal', w: 'BW', r: '8' },
        { name: 'Band Pull-Apart', pres: '8 reps', sets: 5, reps: '8', rest: 'Minimal', w: 'Band', r: '8' },
        { name: 'Side Plank', pres: '20 sec/side', sets: 5, reps: '20s', rest: 'Minimal → Treadmill 10° 15 min', w: 'BW', r: '20s' }
      ] }
    ]
  }
};

const EXERCISES = {
  Push: ['Bench Press', 'Incline Bench Press', 'Dumbbell Bench Press', 'Incline DB Press', 'Floor Press', 'DB Floor Press', 'Close Grip Bench', 'Overhead Press', 'Push-Up', 'Dip', 'Landmine Press', 'Cable Chest Fly', 'Pec Deck'],
  Pull: ['Barbell Row', 'Dumbbell Row', 'Cable Row', 'Chest-Supported Row', 'T-Bar Row', 'Pull-Up', 'Chin-Up', 'Lat Pulldown', 'Face Pull', 'Band Pull-Apart', 'Inverted Row', 'Cable Pullover', 'Rear Delt Fly'],
  Legs: ['Squat', 'Front Squat', 'Goblet Squat', 'Box Squat', 'Deadlift', 'Romanian Deadlift', 'Single Leg RDL', 'Leg Press', 'Bulgarian Split Squat', 'Walking Lunge', 'Reverse Lunge', 'Step-Up', 'Hip Thrust', 'Glute Bridge', 'Leg Curl', 'Leg Extension', 'Calf Raise'],
  Core: ['Plank', 'Side Plank', 'Ab Wheel', 'Hanging Leg Raise', 'Cable Crunch', 'Pallof Press', 'Dead Bug', 'Bird Dog', 'Suitcase Carry', 'Farmer Carry', 'Copenhagen Plank', 'Hollow Hold', 'V-Up', 'Russian Twist'],
  Cond: ['Jump Rope', 'Battle Rope', 'Box Jump', 'Sled Push', 'Prowler', 'Assault Bike', 'Row', 'Ski Erg', 'Kettlebell Swing', 'Burpee', 'Mountain Climber', 'Bear Crawl', 'Shuttle Run']
};