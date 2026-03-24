// ============ INITIALIZATION & NAVIGATION ============
function init() {
  load();
  renderTMs(); 
  loadTMInputs(); 
  renderLog();
  renderScheduleUI();
  document.getElementById('sn-input').value = S.shortcutName;
  document.getElementById('disp-sn').textContent = S.shortcutName;
}

function showSc(name, btn) {
  document.querySelectorAll('.sc').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nb').forEach(b => b.classList.remove('active'));
  document.getElementById('sc-' + name).classList.add('active');
  btn.classList.add('active');
  
  if(name === 'log') renderLog();
  if(name === 'workout') renderScheduleUI();
  if(name === 'settings') { 
    loadSettingsUI(); 
    loadScheduleSettings(); 
  }
}

// Start application
init();