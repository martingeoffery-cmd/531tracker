// ============ WORKOUT LOGIC ============
let currentCat = 'Push';
let exModalTarget = 'strength'; 
let coulsonSetData = {}; 

// Setup Screen
function setSessType(type, el) {
  S.sessType = type;
  document.querySelectorAll('.sess-type-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('strength-opts').style.display = type === 'strength' ? 'block' : 'none';
  document.getElementById('mrut-opts').style.display = type === 'mrut' ? 'block' : 'none';
}
function setMRUT(num, el) {
  S.mrutNum = num;
  document.querySelectorAll('.mrut-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}
function setWeek(w, el) { S.week = w; document.querySelectorAll('.wt').forEach(t => t.classList.remove('active')); el.classList.add('active'); renderScheduleUI(); }
function setLift(l, el) { S.lift = l; document.querySelectorAll('.lc').forEach(c => c.classList.remove('active')); el.classList.add('active'); renderPrescrip(); }

function renderPrescrip() {
  const tm = S.tms[S.lift];
  const scheme = SCHEMES[S.week];
  const wl = S.week === 4 ? 'DELOAD' : 'WEEK ' + S.week;
  document.getElementById('ph0-title').innerHTML = `${LL[S.lift]} — ${wl} <span class="cbadge">CYCLE ${S.cycle}</span>`;
  document.getElementById('ph0-tm').textContent = tm + ' lbs';
  document.getElementById('prescrip-body').innerHTML = scheme.map((s, i) => {
    const wt = r5(tm * s.p);
    const rep = s.amrap ? `<span class="sr">${s.r}</span> <span class="amtag">AMRAP</span>` : `<span class="sr">${s.r}</span>`;
    return `<tr><td class="sp2">Set ${i + 1}</td><td class="sp2">${Math.round(s.p * 100)}%</td><td class="sw">${wt}</td><td>${rep}</td></tr>`;
  }).join('');
  const multi = document.getElementById('multi-lift-preview');
  if(multi) multi.style.display = 'none';
}

function renderScheduleUI() {
  const daySection = document.getElementById('sched-day-section');
  const manualSection = document.getElementById('manual-lift-section');
  if(!daySection || !manualSection) return;
  const sched = SCHEDULES[S.schedule];
  const isCustom = S.schedule === 'custom';
  daySection.style.display = isCustom ? 'none' : 'block';
  manualSection.style.display = isCustom ? 'block' : 'none';
  if(isCustom) { renderPrescrip(); return; }
  
  const badge = document.getElementById('sched-name-badge');
  if(badge) badge.textContent = sched.name;
  
  const row = document.getElementById('day-pick-row');
  if(!row) return;
  row.innerHTML = sched.days.map((d, i) => {
    const isActive = i === S.scheduleDay;
    const liftBadges = d.lifts.map(l => `<span class="lbadge">${LL[l]}</span>`).join('');
    return `<div class="dp-btn ${isActive ? 'active' : ''}" onclick="setScheduleDay(${i})">
      <div class="dp-name">${d.label}</div>
      <div class="dp-lifts">${liftBadges}</div>
    </div>`;
  }).join('');
  
  updateSchedDayNote();
  syncLiftFromSchedule();
}

function setScheduleDay(i) {
  S.scheduleDay = i; save();
  renderScheduleUI();
}

function syncLiftFromSchedule() {
  const sched = SCHEDULES[S.schedule];
  if(!sched || !sched.days) return;
  const day = sched.days[S.scheduleDay];
  if(!day) return;
  S.lift = day.lifts[0];
  document.querySelectorAll('.lc').forEach(c => c.classList.remove('active'));
  renderSchedulePrescrip(day);
}

function renderSchedulePrescrip(day) {
  const isMulti = day.lifts.length > 1;
  const multi = document.getElementById('multi-lift-preview');
  const tm = S.tms[day.lifts[0]];
  const scheme = SCHEMES[S.week];
  const wl = S.week === 4 ? 'DELOAD' : 'WEEK ' + S.week;
  
  document.getElementById('ph0-title').innerHTML = `${LL[day.lifts[0]]} — ${wl} <span class="cbadge">CYCLE ${S.cycle}</span>${isMulti ? `<span class="ml-badge">MULTI-LIFT DAY</span>` : ''}`;
  document.getElementById('ph0-tm').textContent = tm + ' lbs';
  document.getElementById('prescrip-body').innerHTML = scheme.map((s, i) => {
    const wt = r5(tm * s.p);
    const rep = s.amrap ? `<span class="sr">${s.r}</span> <span class="amtag">AMRAP</span>` : `<span class="sr">${s.r}</span>`;
    return `<tr><td class="sp2">Set ${i + 1}</td><td class="sp2">${Math.round(s.p * 100)}%</td><td class="sw">${wt}</td><td>${rep}</td></tr>`;
  }).join('');
  
  if(isMulti && multi && day.lifts[1]) {
    const lift2 = day.lifts[1];
    const tm2 = S.tms[lift2];
    multi.style.display = 'block';
    multi.innerHTML = `<div class="div"></div>
      <div style="font-size:11px;color:var(--blue);letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Then: ${LL[lift2]} <span style="color:var(--slate)">TM ${tm2} lbs</span></div>
      <table class="stbl"><thead><tr><th>SET</th><th>%TM</th><th>WEIGHT</th><th>REPS</th></tr></thead><tbody>${
        scheme.map((s, i) => { const wt = r5(tm2 * s.p); const rep = s.amrap ? `<span class="sr">${s.r}</span> <span class="amtag">AMRAP</span>` : `<span class="sr">${s.r}</span>`; return `<tr><td class="sp2">Set ${i + 1}</td><td class="sp2">${Math.round(s.p * 100)}%</td><td class="sw">${wt}</td><td>${rep}</td></tr>`; }).join('')
      }</tbody></table>`;
  } else if(multi) {
    multi.style.display = 'none';
  }
}

function updateSchedDayNote() {
  const sched = SCHEDULES[S.schedule];
  if(!sched || !sched.days) return;
  const day = sched.days[S.scheduleDay];
  const note = document.getElementById('sched-day-note');
  if(!note) return;
  const isMulti = day.lifts.length > 1;
  note.innerHTML = `<strong style="color:white;">${day.subtitle}</strong>${isMulti ? ` <span class="ml-badge">2 lifts back-to-back</span>` : ''}<br>${sched.source}`;
}

function startSession() {
  coulsonSetData = {};
  if(S.sessType === 'mrut') {
    S.session = { type: 'mrut', mrutNum: S.mrutNum, extras: [], startTime: Date.now() };
    showPhase('1');
  } else {
    const sched = SCHEDULES[S.schedule];
    let liftQueue = [S.lift];
    let coulsonKey = S.lift;
    if(sched && sched.days && S.schedule !== 'custom') {
      const day = sched.days[S.scheduleDay] || sched.days[0];
      if(day) { liftQueue = [...day.lifts]; coulsonKey = day.coulson; }
    }
    const primaryLift = liftQueue[0];
    S.session = {
      type: 'strength',
      lift: primaryLift, liftLabel: LL[primaryLift],
      liftQueue, liftQueueIdx: 0,
      completedLifts: [],
      coulsonKey,
      week: S.week, cycle: S.cycle,
      weekLabel: S.week === 4 ? 'Deload Week' : `Week ${S.week}`,
      tm: S.tms[primaryLift], scheme: SCHEMES[S.week],
      currentSetIdx: 0, mainSets: [], extras: [], startTime: Date.now()
    };
    showPhase('1');
  }
  startSessionClock();
  renderWarmupChecklist();
}

function showPhase(n) {
  document.querySelectorAll('.phase').forEach(p => p.classList.remove('active'));
  document.getElementById('ph' + n).classList.add('active');
}

// Warmup
function renderWarmupChecklist() {
  const checks = S.session.warmupChecks || Array(WARMUP.length).fill(false);
  S.session.warmupChecks = checks;
  const done = checks.filter(Boolean).length;
  document.getElementById('wu-checklist').innerHTML = WARMUP.map((w, i) => `
    <div onclick="toggleWU(${i})" style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);cursor:pointer;">
      <div style="width:26px;height:26px;border-radius:50%;border:2px solid ${checks[i] ? 'var(--green)' : 'rgba(255,255,255,0.3)'};background:${checks[i] ? 'var(--green)' : 'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.2s;">
        ${checks[i] ? '<span style="color:#1a1a1a;font-weight:700;font-size:14px;">✓</span>' : ''}
      </div>
      <div style="flex:1;font-size:14px;${checks[i] ? 'text-decoration:line-through;color:var(--slate);' : ''}">${w.n}</div>
      <div style="color:var(--orange);font-weight:600;font-size:12px;white-space:nowrap;">${w.r}</div>
    </div>`).join('');
  document.getElementById('wu-prog-txt').textContent = `${done} / ${WARMUP.length}`;
  document.getElementById('wu-prog-bar').style.width = `${Math.round(done / WARMUP.length * 100)}%`;
  const btn = document.getElementById('wu-done-btn');
  btn.style.opacity = (done === WARMUP.length) ? '1' : '0.4';
  btn.style.pointerEvents = (done === WARMUP.length) ? 'auto' : 'none';
}
function toggleWU(i) { S.session.warmupChecks[i] = !S.session.warmupChecks[i]; renderWarmupChecklist(); }
function warmupDone() { S.session.type === 'mrut' ? showMRUTSession() : (showPhase('2'), renderMainLiftUI()); }
function warmupSkip() { S.session.type === 'mrut' ? showMRUTSession() : (showPhase('2'), renderMainLiftUI()); }

// Main Lift
function renderMainLiftUI() {
  const sess = S.session;
  const n = sess.scheme.length;
  document.getElementById('set-dots').innerHTML = Array.from({length: n}, (_, i) => `<div class="dot ${i < sess.currentSetIdx ? 'done' : i === sess.currentSetIdx ? 'cur' : ''}"></div>`).join('');
  
  const lq = sess.liftQueue || [sess.lift];
  const lqIdx = sess.liftQueueIdx || 0;
  const lqBar = lq.length > 1 ? `<div class="lq-bar">${lq.map((lk, i) => {
    const cls = i < lqIdx ? 'done' : i === lqIdx ? 'cur' : 'next';
    return `<div class="lq-step"><div class="lq-dot ${cls}">${i < lqIdx ? '✓' : (i + 1)}</div><span class="lq-label ${cls === 'cur' ? 'cur' : ''}">${LL[lk]}</span></div>${i < lq.length - 1 ? '<span class="lq-arrow">→</span>' : ''}`;
  }).join('')}</div>` : '';
  
  document.getElementById('ph2-title').innerHTML = `${lqBar}${sess.liftLabel} — ${sess.weekLabel} <span class="cbadge">CYCLE ${sess.cycle}</span>`;
  
  if(sess.currentSetIdx >= n) {
    document.getElementById('set-logger').style.display = 'none';
    document.getElementById('done-main-btn').style.display = 'block';
    renderLoggedSets(); return;
  }
  
  document.getElementById('set-logger').style.display = 'block';
  document.getElementById('done-main-btn').style.display = 'none';
  const s = sess.scheme[sess.currentSetIdx];
  const pw = r5(sess.tm * s.p);
  document.getElementById('set-counter').textContent = `SET ${sess.currentSetIdx + 1} OF ${n}`;
  document.getElementById('set-prescrip').innerHTML = `Prescribed: <span>${pw} lbs × ${s.amrap ? s.r + ' (AMRAP)' : s.r}</span>`;
  document.getElementById('inp-w').value = pw;
  document.getElementById('inp-r').value = typeof s.r === 'number' ? s.r : '';
  document.getElementById('inp-rest').value = 3;
  document.getElementById('rpe-slider').value = 6;
  updateRPE(6);
  document.getElementById('e1rm-live').style.display = 'none';
  document.getElementById('rest-timer').style.display = 'none';
  
  if(s.amrap) { showAmrapCoach(sess.week, sess.mainSets.length ? sess.mainSets[sess.mainSets.length - 1].reps : 5); }
  else { const b = document.getElementById('amrap-coach'); if(b) b.style.display = 'none'; }
  
  ['inp-w', 'inp-r'].forEach(id => {
    document.getElementById(id).oninput = () => {
      const w = parseFloat(document.getElementById('inp-w').value);
      const reps = parseInt(document.getElementById('inp-r').value);
      if(w && reps && reps > 0) {
        const e = reps === 1 ? w : r5(w * (1 + reps / 30));
        document.getElementById('e1rm-val').textContent = e + ' lbs';
        document.getElementById('e1rm-live').style.display = 'block';
      }
    };
  });
  renderLoggedSets();
}

function updateRPE(v) {
  const el = document.getElementById('rpe-disp');
  el.textContent = v;
  el.style.color = v <= 4 ? 'var(--green)' : v <= 7 ? 'var(--orange)' : 'var(--red)';
}

function showAmrapCoach(week, reps) {
  const box = document.getElementById('amrap-coach');
  const txt = document.getElementById('amrap-coach-text');
  if(!box || !txt) return;
  let msg = '';
  if(week === 1) msg = `Target <strong>${reps > 5 ? reps : reps + 3}+ reps</strong>. Week 1 — push hard, 1–2 reps in reserve.`;
  else if(week === 2) msg = `Target <strong>${reps > 3 ? reps : reps + 2}+ reps</strong>. Week 2 — solid effort, stop just before failure.`;
  else if(week === 3) msg = `This is your <strong>max effort set</strong>. Week 3 — go for a PR if you feel it.`;
  box.style.display = msg ? 'block' : 'none';
  txt.innerHTML = msg;
}

function logSet() {
  const w = parseFloat(document.getElementById('inp-w').value);
  const reps = parseInt(document.getElementById('inp-r').value);
  const rpe = parseInt(document.getElementById('rpe-slider').value);
  const rest = parseFloat(document.getElementById('inp-rest').value) || 3;
  if(!w || !reps) { toast('Enter weight and reps!'); return; }
  
  const sess = S.session;
  const s = sess.scheme[sess.currentSetIdx];
  const e1rm = reps === 1 ? w : r5(w * (1 + reps / 30));
  
  sess.mainSets.push({ weight: w, reps, rpe, rest, e1rm, prescribed_w: r5(sess.tm * s.p), prescribed_r: s.r, pct: Math.round(s.p * 100), amrap: s.amrap || false });
  sess.currentSetIdx++;
  renderLoggedSets();
  
  if(sess.currentSetIdx < sess.scheme.length) toast(`Set ${sess.currentSetIdx} logged ✓`);
  document.getElementById('set-logger').style.display = 'none';
  startRestTimer(rest);
}

function renderLoggedSets() {
  const sess = S.session;
  const wrap = document.getElementById('logged-sets-wrap');
  if(!sess.mainSets.length) { wrap.innerHTML = ''; return; }
  
  const liftName = sess.liftLabel;
  const histBest = S.log.filter(e => e.lift === liftName && e.bestE1rm).reduce((b, e) => Math.max(b, e.bestE1rm), 0);
  const sessionBest = sess.mainSets.reduce((b, s) => Math.max(b, s.e1rm), 0);
  
  wrap.innerHTML = `<div style="font-size:10px;color:var(--slate);letter-spacing:1px;margin-bottom:6px;text-transform:uppercase;">Logged Sets</div>` +
  sess.mainSets.map((s, i) => {
    const rc = s.rpe <= 4 ? 'var(--green)' : s.rpe <= 7 ? 'var(--orange)' : 'var(--red)';
    const diff = s.weight !== s.prescribed_w ? ` <span style="color:${s.weight > s.prescribed_w ? 'var(--green)' : '#f87171'};font-size:10px;">(${s.weight > s.prescribed_w ? '+' : ''}${s.weight - s.prescribed_w})</span>` : '';
    const isPR = s.e1rm > 0 && s.e1rm >= sessionBest && s.e1rm > histBest;
    const prBadge = isPR ? `<span class="pr-badge">🏆 PR</span>` : '';
    return `<div class="ls"><span class="ls-n">${i + 1}</span><span class="ls-d"><strong style="color:var(--green)">${s.weight}lbs</strong>${diff} × <strong style="color:var(--orange)">${s.reps}</strong>${prBadge}</span><span class="ls-e">e1RM ${s.e1rm}</span><span class="ls-r" style="background:${rc}22;color:${rc};border:1px solid ${rc}44;">RPE ${s.rpe}</span></div>`;
  }).join('');
}

function doneMainLift() {
  const sess = S.session;
  sess.completedLifts.push({ lift: sess.lift, liftLabel: sess.liftLabel, tm: sess.tm, mainSets: [...sess.mainSets] });
  if(sess.liftQueueIdx < sess.liftQueue.length - 1) {
    showLiftTransition();
  } else {
    showPhase('3'); renderCoulsonPrescribed();
  }
}

function showLiftTransition() {
  const sess = S.session;
  const done = sess.completedLifts[sess.completedLifts.length - 1];
  const nextLiftKey = sess.liftQueue[sess.liftQueueIdx + 1];
  const mainSets = done.mainSets;
  const bestE1rm = mainSets.length ? Math.max(...mainSets.map(s => s.e1rm)) : null;
  const totalVol = mainSets.reduce((t, s) => t + s.weight * s.reps, 0);
  
  document.getElementById('lt-done-label').textContent = `${done.liftLabel.toUpperCase()} COMPLETE`;
  document.getElementById('lt-stats').innerHTML =
    (bestE1rm ? `e1RM: <strong style="color:#93c5fd">${bestE1rm} lbs</strong>&nbsp;&nbsp;` : '') +
    (totalVol ? `Volume: <strong style="color:var(--green)">${totalVol.toLocaleString()} lbs</strong>` : '') +
    `<br><span style="font-size:11px">Sets logged: ${mainSets.length}</span>`;
  document.getElementById('lt-next-name').textContent = LL[nextLiftKey];
  showPhase('2b');
}

function advanceLiftQueue() {
  const sess = S.session;
  sess.liftQueueIdx++;
  const nextLiftKey = sess.liftQueue[sess.liftQueueIdx];
  sess.lift = nextLiftKey;
  sess.liftLabel = LL[nextLiftKey];
  sess.tm = S.tms[nextLiftKey];
  sess.currentSetIdx = 0;
  sess.mainSets = [];
  coulsonSetData = {};
  showPhase('2');
  renderMainLiftUI();
}

function skipToAccessories() {
  const sess = S.session;
  if(sess.mainSets.length) {
    sess.completedLifts.push({ lift: sess.lift, liftLabel: sess.liftLabel, tm: sess.tm, mainSets: [...sess.mainSets] });
  }
  showPhase('3'); renderCoulsonPrescribed();
}

function goBackToMain() { showPhase('2'); renderMainLiftUI(); }

function cancelSession() { 
  S.session = null; showPhase('0'); stopSessionClock(); 
  if(_restTimer) { clearInterval(_restTimer); _restTimer = null; } 
  document.getElementById('rest-timer').style.display = 'none'; 
}

// Accessories
function getCoulsonPlan() {
  if(S.session.type === 'mrut') return S.session.mrutNum === 2 ? COULSON.mrut2 : COULSON.mrut4;
  const key = S.session.coulsonKey || S.session.lift;
  return COULSON[key] || COULSON.squat;
}
function ensureSetData(gi, ii, defaultSets, defaultReps, defaultW) {
  const key = `${gi}-${ii}`;
  if(!coulsonSetData[key]) coulsonSetData[key] = Array.from({ length: defaultSets }, () => ({ weight: defaultW || '', reps: defaultReps || '' }));
  return coulsonSetData[key];
}
function groupClass(type) { return type === 'superset' ? 'superset' : type === 'circuit' ? 'circuit' : type === 'finisher' ? 'finisher' : ''; }
function labelClass(type) { return type === 'superset' ? 'sup' : type === 'circuit' ? 'cir' : type === 'finisher' ? 'fin' : 'str'; }

function renderCoulsonPrescribed() {
  const plan = getCoulsonPlan();
  if(!S.session.deletedItems) S.session.deletedItems = [];
  document.getElementById('coulson-header').innerHTML = `<div class="ch-title">${plan.label}</div><div class="ch-sub">${plan.desc}</div>`;
  document.getElementById('coulson-prescribed').innerHTML = plan.groups.map((g, gi) => {
    const itemsHTML = g.items.map((item, ii) => {
      if(S.session.deletedItems.includes(`${gi}-${ii}`)) return '';
      const sets = ensureSetData(gi, ii, item.sets, item.reps, item.w);
      const setsHTML = sets.map((set, si) => `
        <div class="set-row-inp">
          <span class="sn2">${si + 1}</span>
          <input type="number" class="wi2" value="${set.weight}" placeholder="${item.w || 'lbs'}" inputmode="decimal" onchange="updateCoulsonSet(${gi},${ii},${si},'weight',this.value)">
          <span class="xi">×</span>
          <input type="number" class="ri2" value="${set.reps}" placeholder="${item.reps}" inputmode="decimal" onchange="updateCoulsonSet(${gi},${ii},${si},'reps',this.value)">
          <button class="rm-s" onclick="removeCoulsonSet(${gi},${ii},${si})">✕</button>
        </div>`).join('');
      const vol = sets.reduce((t, s) => t + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0), 0);
      const volLine = vol > 0 ? `<span class="set-vol">Vol: <strong style="color:var(--blue)">${vol.toLocaleString()} lbs</strong></span>` : '<span class="set-vol" style="color:rgba(255,255,255,0.25);">BW / Timed</span>';
      return `<div class="ex-row">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
          <div class="ex-name" style="margin-bottom:0;">${item.name}</div>
          ${g.deletable ? `<button class="btn xs red" onclick="deleteCoulsonItem(${gi},${ii})">REMOVE</button>` : ''}
        </div>
        <div class="ex-pres">Prescribed: <strong>${item.pres}</strong>&nbsp;&nbsp;Rest: ${item.rest}</div>
        <div class="set-rows-wrap">${setsHTML}</div>
        <div class="add-set-row">
          <button class="btn xs sec" onclick="addCoulsonSet(${gi},${ii},'${item.reps}')">＋ Set</button>
          ${volLine}
        </div>
      </div>`;
    }).join('');
    return `<div class="ex-group ${groupClass(g.type)}"><div class="eg-label ${labelClass(g.type)}">${g.label}</div>${itemsHTML}</div>`;
  }).join('');
  renderExtras();
}

function deleteCoulsonItem(gi, ii) { S.session.deletedItems.push(`${gi}-${ii}`); renderCoulsonPrescribed(); toast('Exercise removed'); }
function deleteMRUTItem(gi, ii) { S.session.deletedItems.push(`${gi}-${ii}`); showMRUTSession(); toast('Exercise removed'); }
function updateCoulsonSet(gi, ii, si, field, val) { const key = `${gi}-${ii}`; if(coulsonSetData[key] && coulsonSetData[key][si]) coulsonSetData[key][si][field] = val; }
function addCoulsonSet(gi, ii, defaultReps) { const key = `${gi}-${ii}`; if(!coulsonSetData[key]) coulsonSetData[key] = []; coulsonSetData[key].push({ weight: '', reps: '' }); renderCoulsonPrescribed(); }
function removeCoulsonSet(gi, ii, si) { const key = `${gi}-${ii}`; if(coulsonSetData[key] && coulsonSetData[key].length > 1) { coulsonSetData[key].splice(si, 1); renderCoulsonPrescribed(); } }

function showMRUTSession() {
  showPhase('3-mrut');
  if(!S.session.deletedItems) S.session.deletedItems = [];
  const plan = S.session.mrutNum === 2 ? COULSON.mrut2 : COULSON.mrut4;
  document.getElementById('mrut-session-title').textContent = `🔥 ${plan.label}`;
  document.getElementById('mrut-prescribed').innerHTML = plan.groups.map((g, gi) => {
    const itemsHTML = g.items.map((item, ii) => {
      if(S.session.deletedItems.includes(`${gi}-${ii}`)) return '';
      const sets = ensureSetData(gi, ii, item.sets, item.reps, item.w);
      const setsHTML = sets.map((set, si) => `
        <div class="set-row-inp">
          <span class="sn2">${si + 1}</span>
          <input type="number" class="wi2" value="${set.weight}" placeholder="${item.w || 'lbs'}" inputmode="decimal" onchange="updateCoulsonSet(${gi},${ii},${si},'weight',this.value)">
          <span class="xi">×</span>
          <input type="number" class="ri2" value="${set.reps}" placeholder="${item.reps}" inputmode="decimal" onchange="updateCoulsonSet(${gi},${ii},${si},'reps',this.value)">
          <button class="rm-s" onclick="removeCoulsonSet(${gi},${ii},${si})">✕</button>
        </div>`).join('');
      const vol = sets.reduce((t, s) => t + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0), 0);
      const volLine = vol > 0 ? `<span class="set-vol">Vol: <strong style="color:var(--blue)">${vol.toLocaleString()} lbs</strong></span>` : '<span class="set-vol" style="color:rgba(255,255,255,0.25);">BW / Timed</span>';
      return `<div class="ex-row">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
          <div class="ex-name" style="margin-bottom:0;">${item.name}</div>
          <button class="btn xs red" onclick="deleteMRUTItem(${gi},${ii})">REMOVE</button>
        </div>
        <div class="ex-pres">Prescribed: <strong>${item.pres}</strong>&nbsp;&nbsp;Rest: ${item.rest}</div>
        <div class="set-rows-wrap">${setsHTML}</div>
        <div class="add-set-row">
          <button class="btn xs sec" onclick="addCoulsonSet(${gi},${ii},'${item.reps}')">＋ Set</button>
          ${volLine}
        </div>
      </div>`;
    }).join('');
    return `<div class="ex-group ${groupClass(g.type)}"><div class="eg-label ${labelClass(g.type)}">${g.label}</div>${itemsHTML}</div>`;
  }).join('');
  renderMRUTExtras();
}

function renderMRUTExtras() {
  const list = document.getElementById('mrut-extra-list');
  const extras = S.session.extras || [];
  if(!extras.length) { list.innerHTML = ''; return; }
  list.innerHTML = extras.map((ex, ei) => renderExtraCard(ex, ei, 'mrut')).join('');
}

// Extras
function renderExtras() {
  const list = document.getElementById('extra-list');
  const extras = S.session ? S.session.extras : [];
  if(!extras.length) { list.innerHTML = ''; return; }
  list.innerHTML = extras.map((ex, ei) => renderExtraCard(ex, ei, 'strength')).join('');
}
function renderExtraCard(ex, ei, target) {
  const setsHTML = ex.sets.map((set, si) => `
    <div class="set-row-inp">
      <span class="sn2">${si + 1}</span>
      <input type="number" class="wi2" value="${set.weight || ''}" placeholder="lbs" inputmode="decimal" onchange="updateExtra(${ei},${si},'weight',this.value,'${target}')">
      <span class="xi">×</span>
      <input type="number" class="ri2" value="${set.reps || ''}" placeholder="reps" inputmode="decimal" onchange="updateExtra(${ei},${si},'reps',this.value,'${target}')">
      <button class="rm-s" onclick="removeExtraSet(${ei},${si},'${target}')">✕</button>
    </div>`).join('');
  const vol = ex.sets.reduce((t, s) => t + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0), 0);
  return `<div class="extra-ex">
    <div class="ex-name" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
      <span style="font-family:'Oswald',sans-serif;font-size:14px;color:white;letter-spacing:1px;">${ex.name}</span>
      <button class="btn xs red" onclick="removeExtra(${ei},'${target}')">✕</button>
    </div>
    <div class="set-rows-wrap">${setsHTML}</div>
    <div class="add-set-row">
      <button class="btn xs sec" onclick="addExtraSet(${ei},'${target}')">＋ Set</button>
      <span class="set-vol">Vol: <strong style="color:var(--blue)">${vol.toLocaleString()} lbs</strong></span>
    </div>
  </div>`;
}
function updateExtra(ei, si, field, val, target) { S.session.extras[ei].sets[si][field] = val; }
function addExtraSet(ei, target) { S.session.extras[ei].sets.push({ weight: '', reps: '' }); target === 'mrut' ? renderMRUTExtras() : renderExtras(); }
function removeExtraSet(ei, si, target) { S.session.extras[ei].sets.splice(si, 1); target === 'mrut' ? renderMRUTExtras() : renderExtras(); }
function removeExtra(ei, target) { S.session.extras.splice(ei, 1); target === 'mrut' ? renderMRUTExtras() : renderExtras(); }

// Ex Modal
function openExModal() { exModalTarget = 'strength'; renderExModal(); }
function openExModalMRUT() { exModalTarget = 'mrut'; renderExModal(); }
function renderExModal() {
  renderCats(); renderExList();
  document.getElementById('cex-input').value = '';
  document.getElementById('ex-modal').classList.add('open');
}
function closeExModal() { document.getElementById('ex-modal').classList.remove('open'); }
function renderCats() { document.getElementById('cat-tabs').innerHTML = Object.keys(EXERCISES).map(c => `<div class="ct2 ${c === currentCat ? 'active' : ''}" onclick="setCat('${c}',this)">${c}</div>`).join(''); }
function setCat(c, el) { currentCat = c; document.querySelectorAll('.ct2').forEach(t => t.classList.remove('active')); el.classList.add('active'); renderExList(); }
function renderExList() { document.getElementById('ex-list').innerHTML = EXERCISES[currentCat].map(e => `<div class="ex-pill" onclick="addExercise('${e}')">${e}</div>`).join(''); }
function addCustomEx() { const n = document.getElementById('cex-input').value.trim(); if(!n) { toast('Enter exercise name!'); return; } addExercise(n); }
function addExercise(name) {
  if(!S.session) S.session = { extras: [] };
  if(!S.session.extras) S.session.extras = [];
  S.session.extras.push({ name, sets: [{ weight: '', reps: '' }] });
  closeExModal();
  if(exModalTarget === 'mrut') renderMRUTExtras(); else renderExtras();
  toast(`${name} added ✓`);
}

// Finishing Logic
function buildCoulsonSetsLog(plan) {
  const groups = [];
  const deleted = S.session.deletedItems || [];
  plan.groups.forEach((g, gi) => {
    const items = g.items.map((item, ii) => {
      if(deleted.includes(`${gi}-${ii}`)) return null; 
      const key = `${gi}-${ii}`;
      const sets = (coulsonSetData[key] || []).map(s => ({ weight: parseFloat(s.weight) || 0, reps: s.reps || 0 }));
      return { name: item.name, prescribed: item.pres, sets };
    }).filter(Boolean);
    if(items.length) groups.push({ label: g.label, type: g.type, items });
  });
  return groups;
}
function calcTotalCoulsonVol() { let vol = 0; Object.values(coulsonSetData).forEach(sets => sets.forEach(s => vol += (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0))); return vol; }
function calcExtrasVol(extras) { return (extras || []).reduce((t, ex) => t + ex.sets.reduce((t2, s) => t2 + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0), 0), 0); }

function buildSyncModal(entry) {
  document.getElementById('sync-summary').innerHTML = `
    <div class="ir2"><span class="il">Session</span><span class="iv" style="color:var(--gold)">${entry.liftDisplay || entry.lift} · ${entry.weekLabel || entry.week}</span></div>
    <div class="ir2"><span class="il">Total Volume</span><span class="iv" style="color:var(--green)">${Math.round(entry.totalVolume).toLocaleString()} lbs</span></div>
    ${entry.bestE1rm ? `<div class="ir2"><span class="il">Best e1RM</span><span class="iv" style="color:#93c5fd">${entry.bestE1rm} lbs</span></div>` : ''}
    ${entry.avgRpe ? `<div class="ir2"><span class="il">Avg RPE</span><span class="iv" style="color:var(--orange)">${entry.avgRpe}</span></div>` : ''}
    <div class="ir2"><span class="il">Duration</span><span class="iv">${entry.duration} min</span></div>
    <div class="ir2"><span class="il">Est. Calories</span><span class="iv" style="color:var(--orange)">~${entry.estCals} kcal</span></div>
  `;
}

function finishSession() {
  const sess = S.session;
  const dur = parseInt(document.getElementById('sess-dur').value) || 60;
  const notes = document.getElementById('sess-notes').value.trim();

  const allLifts = [...sess.completedLifts];
  if(sess.mainSets.length && !allLifts.some(l => l.lift === sess.lift)) {
    allLifts.push({ lift: sess.lift, liftLabel: sess.liftLabel, tm: sess.tm, mainSets: sess.mainSets });
  }
  const allMainSets = allLifts.flatMap(l => l.mainSets);

  const mainVol = allMainSets.reduce((t, s) => t + s.weight * s.reps, 0);
  const coulsonVol = calcTotalCoulsonVol();
  const extrasVol = calcExtrasVol(sess.extras);
  const totalVol = mainVol + coulsonVol + extrasVol;
  const bestE1rm = allMainSets.length ? Math.max(...allMainSets.map(s => s.e1rm)) : null;
  const avgRpe = allMainSets.length ? Math.round(allMainSets.reduce((t, s) => t + s.rpe, 0) / allMainSets.length * 10) / 10 : null;
  const topSet = allMainSets.length ? allMainSets.reduce((b, s) => s.weight * s.reps > b.weight * b.reps ? s : b) : null;

  const plan = getCoulsonPlan();
  const coulsonSets = buildCoulsonSetsLog(plan);
  const liftDisplay = allLifts.length > 1 ? allLifts.map(l => l.liftLabel).join(' + ') : sess.liftLabel;

  const entry = {
    id: Date.now(),
    date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    type: 'strength',
    lift: allLifts.length > 1 ? liftDisplay : sess.liftLabel,
    liftDisplay,
    week: sess.weekLabel, weekLabel: sess.weekLabel, cycle: sess.cycle, tm: sess.tm,
    mainSets: allMainSets,
    liftBreakdown: allLifts.length > 1 ? allLifts : null,
    coulsonSets, assistance: sess.extras,
    schedule: S.schedule,
    totalVolume: totalVol, bestE1rm, avgRpe, topSet,
    duration: dur, notes, estCals: LCALS[sess.lift] || '300–400',
    healthSynced: false, stravaSynced: false
  };
  
  S.log.unshift(entry); S.session = null;
  document.getElementById('sess-notes').value = '';
  document.getElementById('sess-dur').value = '60';
  save(); stopSessionClock(); buildSyncModal(entry);
  document.getElementById('sync-modal').classList.add('open');
  showPhase('0');
}

function finishMRUT() {
  const dur = parseInt(document.getElementById('mrut-dur').value) || 45;
  const notes = document.getElementById('mrut-notes').value.trim();
  const plan = getCoulsonPlan();
  const coulsonSets = buildCoulsonSetsLog(plan);
  const totalVol = calcTotalCoulsonVol() + calcExtrasVol(S.session.extras);
  
  const entry = {
    id: Date.now(),
    date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    type: 'mrut', lift: 'MRUT', liftDisplay: `MRUT Workout ${S.session.mrutNum}`,
    week: 'MRUT', weekLabel: `Workout ${S.session.mrutNum}`, cycle: S.cycle,
    tm: null, mainSets: [], coulsonSets, assistance: S.session.extras || [],
    totalVolume: totalVol, bestE1rm: null, avgRpe: null,
    duration: dur, notes, estCals: '300–400', healthSynced: false, stravaSynced: false
  };
  
  S.log.unshift(entry); S.session = null; save();
  stopSessionClock(); buildSyncModal(entry);
  document.getElementById('sync-modal').classList.add('open');
  showPhase('0');
}