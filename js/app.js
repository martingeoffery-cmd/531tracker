// ============ INITIALIZATION & NAVIGATION ============
function init() {
  load();
  renderTMs(); 
  loadTMInputs(); 
  loadSettingsUI();
  renderLog();
  renderScheduleUI();
  syncSetupControls();
  const snInput = document.getElementById('sn-input');
  const dispSN = document.getElementById('disp-sn');
  if(snInput) snInput.value = S.shortcutName;
  if(dispSN) dispSN.textContent = S.shortcutName;
}

function showSc(name, btn) {
  document.querySelectorAll('.sc').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nb').forEach(b => b.classList.remove('active'));
  document.getElementById('sc-' + name).classList.add('active');
  btn.classList.add('active');
  
  if(name === 'log') renderLog();
  if(name === 'workout') renderScheduleUI();
  if(name === 'recovery') loadRecoveryUI();
  if(name === 'settings') { 
    loadSettingsUI(); 
    loadScheduleSettings(); 
  }
}

function syncSetupControls() {
  document.querySelectorAll('.sess-type-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`stype-${S.sessType}`)?.classList.add('active');
  const strengthOpts = document.getElementById('strength-opts');
  const mrutOpts = document.getElementById('mrut-opts');
  if(strengthOpts) strengthOpts.style.display = S.sessType === 'strength' ? 'block' : 'none';
  if(mrutOpts) mrutOpts.style.display = S.sessType === 'mrut' ? 'block' : 'none';

  document.querySelectorAll('.wt').forEach((el, i) => el.classList.toggle('active', i + 1 === S.week));
  document.querySelectorAll('.lc').forEach(el => el.classList.toggle('active', el.textContent.toLowerCase().includes(S.lift === 'dead' ? 'dead' : S.lift)));
  document.querySelectorAll('.mrut-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`mrut-w${S.mrutNum}`)?.classList.add('active');
}

// Start application
init();