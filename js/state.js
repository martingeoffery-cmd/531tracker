// ============ STATE & UTILS ============
let S = { 
  tms: { ...D_TMS }, 
  cycle: 1, 
  week: 1, 
  lift: 'squat', 
  sessType: 'strength', 
  mrutNum: 2, 
  shortcutName: '5/3/1 Log Workout', 
  schedule: '4day', 
  scheduleDay: 0, 
  log: [], 
  session: null 
};

function save() { 
  try { localStorage.setItem('531v5', JSON.stringify(S)); } catch(e) {} 
}

function load() { 
  try { 
    const d = localStorage.getItem('531v5'); 
    if(d) { 
      const p = JSON.parse(d); 
      S = { ...S, ...p }; 
    } 
  } catch(e) {} 
}

function r5(n) { 
  return Math.round(n / 5) * 5; 
}

function toast(msg) { 
  const t = document.getElementById('toast'); 
  t.textContent = msg; 
  t.classList.add('show'); 
  setTimeout(() => t.classList.remove('show'), 2200); 
}