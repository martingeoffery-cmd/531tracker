// ============ SESSION CLOCK & REST TIMER ============
let _clockInterval = null;
let _restTimer = null;
let _restTotal = 0;
let _restRemaining = 0;
const RT_CIRCUMFERENCE = 220;

function startSessionClock() {
  const el = document.getElementById('sess-clock');
  const timeEl = document.getElementById('sess-clock-time');
  if(!el || !timeEl) return;
  el.classList.add('active');
  if(_clockInterval) clearInterval(_clockInterval);
  _clockInterval = setInterval(() => {
    if(!S.session) { stopSessionClock(); return; }
    const elapsed = Math.floor((Date.now() - (S.session.startTime || Date.now())) / 1000);
    const m = Math.floor(elapsed / 60), s = elapsed % 60;
    timeEl.textContent = `${m}:${String(s).padStart(2, '0')}`;
  }, 1000);
}

function stopSessionClock() {
  const el = document.getElementById('sess-clock');
  if(el) el.classList.remove('active');
  if(_clockInterval) { clearInterval(_clockInterval); _clockInterval = null; }
}

function startRestTimer(mins) {
  const secs = Math.round((mins || 3) * 60);
  _restTotal = secs;
  _restRemaining = secs;
  document.getElementById('rest-timer').style.display = 'block';
  document.getElementById('done-main-btn').style.display = 'none';
  updateRestDisplay();
  
  if(_restTimer) clearInterval(_restTimer);
  _restTimer = setInterval(() => {
    _restRemaining--;
    updateRestDisplay();
    if(_restRemaining <= 0) {
      clearInterval(_restTimer); 
      _restTimer = null;
      onRestComplete();
    }
  }, 1000);
}

function updateRestDisplay() {
  const m = Math.floor(_restRemaining / 60), s = _restRemaining % 60;
  document.getElementById('rt-num').textContent = _restRemaining > 0 ? `${m}:${String(s).padStart(2, '0')}` : 'GO!';
  const fill = document.getElementById('rt-fill');
  const msg = document.getElementById('rt-msg');
  const progress = _restRemaining / _restTotal;
  const offset = RT_CIRCUMFERENCE * (1 - progress);
  fill.style.strokeDashoffset = offset;
  
  if(_restRemaining <= 10 && _restRemaining > 0) {
    fill.style.stroke = 'var(--orange)';
    msg.textContent = 'ALMOST…';
    msg.className = 'rt-msg';
  } else if(_restRemaining <= 0) {
    fill.style.stroke = 'var(--green)';
    fill.classList.add('done');
    msg.textContent = 'GO!';
    msg.className = 'rt-msg go';
  } else {
    fill.style.stroke = 'var(--blue)';
    fill.classList.remove('done');
    msg.textContent = 'REST UP';
    msg.className = 'rt-msg';
  }
}

function onRestComplete() {
  if(navigator.vibrate) navigator.vibrate([200, 100, 200]);
  setTimeout(() => {
    document.getElementById('rest-timer').style.display = 'none';
    renderActiveBlock(); // <-- FIXED HERE
  }, 2000);
}

function skipRest() {
  if(_restTimer) { clearInterval(_restTimer); _restTimer = null; }
  document.getElementById('rest-timer').style.display = 'none';
  renderActiveBlock(); // <-- FIXED HERE
}

function addRestTime(seconds) {
  _restRemaining += seconds;
  _restTotal += seconds;
  updateRestDisplay();
}