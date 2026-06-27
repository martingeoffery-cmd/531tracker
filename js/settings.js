// ============ SETTINGS, ACCORDIONS & CALC ============
const TM_IDS = { squat: 'tms', bench: 'tmb', dead: 'tmd', press: 'tmp' };
const SETTINGS_TM_IDS = { squat: 's-tms', bench: 's-tmb', dead: 's-tmd', press: 's-tmp' };
const TM_LABELS = { squat: 'Squat', bench: 'Bench', dead: 'Deadlift', press: 'Press' };

function toggleAcc(id) {
  const body = document.getElementById(id);
  const arrow = document.getElementById('arrow-' + id);
  if(!body) return;
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'block';
  if(arrow) arrow.classList.toggle('open', !open);
}

function calc1rm() {
  const w = parseFloat(document.getElementById('cw')?.value);
  const reps = parseInt(document.getElementById('cr')?.value);
  if(!w || !reps || reps < 1) { toast('Enter weight and reps!'); return; }

  const epley = reps === 1 ? w : r5(w * (1 + reps / 30));
  const brzycki = reps === 1 ? w : r5(w * (36 / (37 - Math.min(reps, 36))));
  const avg = r5((epley + brzycki) / 2);
  document.getElementById('r1rm').textContent = avg;
  document.getElementById('rtm').textContent = r5(avg * 0.9);
  document.getElementById('rep').textContent = epley;
  document.getElementById('rbr').textContent = brzycki;
  document.getElementById('calc-res').style.display = 'grid';
}

function renderTMs() {
  const html = Object.entries(TM_LABELS).map(([k, label]) =>
    `<div class="tmi"><div class="tn">${label}</div><div class="tv">${S.tms[k]}</div><div class="tu">lbs TM</div></div>`
  ).join('');
  const calcDisplay = document.getElementById('tm-disp');
  if(calcDisplay) calcDisplay.innerHTML = html;
  renderSettingsTMDisplay();
}

function loadTMInputs() {
  Object.entries(TM_IDS).forEach(([k, id]) => {
    const el = document.getElementById(id);
    if(el) el.value = S.tms[k];
  });
  const cyc = document.getElementById('cyc');
  if(cyc) cyc.value = String(S.cycle);
}

function saveTMs() {
  Object.entries(TM_IDS).forEach(([k, id]) => {
    const v = parseFloat(document.getElementById(id)?.value);
    if(v > 0) S.tms[k] = v;
  });
  const cycle = parseInt(document.getElementById('cyc')?.value);
  if(cycle > 0) S.cycle = cycle;
  save();
  renderTMs();
  loadTMInputs();
  loadSettingsUI();
  renderScheduleUI();
  toast('Training Maxes Saved ✓');
}

function advanceCycle() {
  S.tms.squat += 10;
  S.tms.dead += 10;
  S.tms.bench += 5;
  S.tms.press += 5;
  S.cycle += 1;
  save();
  renderTMs();
  loadTMInputs();
  loadSettingsUI();
  renderScheduleUI();
  toast(`Cycle ${S.cycle} — TMs updated ✓`);
}

function loadSettingsUI() {
  Object.entries(SETTINGS_TM_IDS).forEach(([k, id]) => { const el = document.getElementById(id); if(el) el.value = S.tms[k]; });
  const cyc = document.getElementById('s-cyc'); if(cyc) cyc.value = S.cycle;
  const snI = document.getElementById('sn-input'); if(snI) snI.value = S.shortcutName;
  const dSN = document.getElementById('disp-sn'); if(dSN) dSN.textContent = S.shortcutName;
  renderSettingsTMDisplay();
  loadScheduleSettings();
}

function renderSettingsTMDisplay() {
  const el = document.getElementById('s-tm-disp'); if(!el) return;
  el.innerHTML = Object.entries(TM_LABELS)
    .map(([k, label]) => `<div class="tmi"><div class="tn">${label}</div><div class="tv">${S.tms[k]}</div><div class="tu">lbs TM</div></div>`).join('');
}

function saveSettingsTMs() {
  Object.entries(SETTINGS_TM_IDS).forEach(([k, id]) => { const v = parseFloat(document.getElementById(id)?.value); if(v > 0) S.tms[k] = v; });
  S.cycle = parseInt(document.getElementById('s-cyc')?.value) || S.cycle;
  save(); renderTMs(); renderScheduleUI(); loadTMInputs(); renderSettingsTMDisplay();
  toast('Training Maxes Saved ✓');
}

function advanceCycleSettings() {
  advanceCycle();
}

function loadScheduleSettings() {
  const grid = document.getElementById('sched-grid');
  if(!grid) return;
  grid.innerHTML = Object.entries(SCHEDULES).map(([key, sched]) => `
    <div class="sched-btn ${S.schedule === key ? 'active' : ''}" onclick="setSchedule('${key}')">
      <div class="sched-icon">${sched.icon}</div>
      <div class="sched-name">${sched.name}</div>
      <div class="sched-src">${sched.source}</div>
    </div>
  `).join('');
  const desc = document.getElementById('settings-sched-desc');
  if(desc) {
    const sched = SCHEDULES[S.schedule];
    desc.innerHTML = `<strong style="color:white;">${sched.name}</strong><br>${sched.desc}`;
  }
}

function setSchedule(key) {
  if(!SCHEDULES[key]) return;
  S.schedule = key;
  S.scheduleDay = 0;
  save();
  loadScheduleSettings();
  renderScheduleUI();
  toast('Schedule updated ✓');
}

function resetAll() {
  if(confirm('Reset ALL app data? This cannot be undone.')) {
    localStorage.removeItem('531v5');
    location.reload();
  }
}

// Syncing
function launchBoth() {
  window.location.href = `shortcuts://run-shortcut?name=${encodeURIComponent(S.shortcutName)}`;
  if(S.log[0]) { S.log[0].healthSynced = true; S.log[0].stravaSynced = true; save(); }
  closeModal(); toast('Opening Shortcuts…');
}
function launchHealth() {
  window.location.href = `shortcuts://run-shortcut?name=${encodeURIComponent(S.shortcutName)}`;
  if(S.log[0]) { S.log[0].healthSynced = true; save(); }
  closeModal(); toast('Opening Apple Health…');
}
function closeModal() { document.getElementById('sync-modal').classList.remove('open'); }
function testSC() { window.location.href = `shortcuts://run-shortcut?name=${encodeURIComponent(S.shortcutName)}`; }
function saveSN() {
  const n = document.getElementById('sn-input').value.trim();
  if(!n) return;
  S.shortcutName = n; document.getElementById('disp-sn').textContent = n;
  save(); toast('Saved ✓');
}