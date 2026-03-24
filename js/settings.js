// ============ SETTINGS, ACCORDIONS & CALC ============
function toggleAcc(id) {
  const body = document.getElementById(id);
  const arrow = document.getElementById('arrow-' + id);
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'block';
  if(arrow) arrow.classList.toggle('open', !open);
}

function loadSettingsUI() {
  const ids = { squat: 's-tms', bench: 's-tmb', dead: 's-tmd', press: 's-tmp' };
  Object.entries(ids).forEach(([k, id]) => { const el = document.getElementById(id); if(el) el.value = S.tms[k]; });
  const cyc = document.getElementById('s-cyc'); if(cyc) cyc.value = S.cycle;
  const snI = document.getElementById('sn-input'); if(snI) snI.value = S.shortcutName;
  const dSN = document.getElementById('disp-sn'); if(dSN) dSN.textContent = S.shortcutName;
  renderSettingsTMDisplay();
  loadScheduleSettings();
}

function renderSettingsTMDisplay() {
  const el = document.getElementById('s-tm-disp'); if(!el) return;
  el.innerHTML = [{ k: 'squat', l: 'Squat' }, { k: 'bench', l: 'Bench' }, { k: 'dead', l: 'Deadlift' }, { k: 'press', l: 'Press' }]
    .map(x => `<div class="tmi"><div class="tn">${x.l}</div><div class="tv">${S.tms[x.k]}</div><div class="tu">lbs TM</div></div>`).join('');
}

function saveSettingsTMs() {
  const ids = { squat: 's-tms', bench: 's-tmb', dead: 's-tmd', press: 's-tmp' };
  Object.entries(ids).forEach(([k, id]) => { const v = parseFloat(document.getElementById(id)?.value); if(v) S.tms[k] = v; });
  S.cycle = parseInt(document.getElementById('s-cyc')?.value) || S.cycle;
  save(); renderTMs(); renderPrescrip(); loadTMInputs(); renderSettingsTMDisplay();
  toast('Training Maxes Saved ✓');
}

function advanceCycleSettings() {
  S.tms.squat += 10; S.tms.dead += 10; S.tms.bench += 5; S.tms.press += 5; S.cycle += 1;
  loadTMInputs(); loadSettingsUI(); save(); renderTMs(); renderPrescrip();
  toast(`Cycle ${S.cycle} — TMs updated ✓`);
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