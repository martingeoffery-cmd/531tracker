// ============ WORKOUT ENGINE ============
let currentCat = 'Push';

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

function setScheduleDay(i) { S.scheduleDay = i; save(); renderScheduleUI(); }

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
  } else if(multi) multi.style.display = 'none';
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

// ============ ENGINE CORE ============

function startSession() {
  // Build Unified Workout Plan
  const blocks = [];
  
  if (S.sessType === 'strength') {
    const sched = SCHEDULES[S.schedule];
    const lifts = (sched && S.schedule !== 'custom') ? sched.days[S.scheduleDay].lifts : [S.lift];
    
    // Generate Main Lift Blocks
    lifts.forEach(liftKey => {
      blocks.push({
        id: `main-${liftKey}-${Date.now()}`,
        type: 'main',
        lift: liftKey,
        label: `${LL[liftKey]} 5/3/1`,
        desc: `Cycle ${S.cycle} · Week ${S.week}`,
        tm: S.tms[liftKey],
        scheme: SCHEMES[S.week],
        totalRounds: SCHEMES[S.week].length,
        logged: []
      });
    });

    // Generate Accessory Blocks
    const coulsonKey = (sched && S.schedule !== 'custom') ? sched.days[S.scheduleDay].coulson : S.lift;
    const plan = COULSON[coulsonKey] || COULSON.squat;
    plan.groups.forEach((g, idx) => {
      blocks.push({
        id: `acc-${idx}-${Date.now()}`,
        type: 'accessory',
        groupType: g.type,
        label: g.label,
        desc: '',
        items: JSON.parse(JSON.stringify(g.items)),
        totalRounds: g.items[0]?.sets || 3,
        defaultRest: parseInt(g.items[g.items.length-1].rest) || 60,
        logged: []
      });
    });

  } else if (S.sessType === 'mrut') {
    const plan = S.mrutNum === 2 ? COULSON.mrut2 : COULSON.mrut4;
    plan.groups.forEach((g, idx) => {
      blocks.push({
        id: `mrut-${idx}-${Date.now()}`,
        type: 'accessory',
        groupType: g.type,
        label: g.label,
        desc: '',
        items: JSON.parse(JSON.stringify(g.items)),
        totalRounds: g.items[0]?.sets || 4,
        defaultRest: parseInt(g.items[g.items.length-1].rest) || 60,
        logged: []
      });
    });
  }

  S.session = {
    sessType: S.sessType,
    blocks: blocks,
    currentBlockIdx: 0,
    startTime: Date.now()
  };

  showPhase('1');
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
function warmupDone() { showPhase('2'); renderActiveBlock(); }
function warmupSkip() { showPhase('2'); renderActiveBlock(); }

// ============ UNIFIED LOGGER ============

function renderActiveBlock() {
  const block = S.session.blocks[S.session.currentBlockIdx];
  const currentSet = block.logged.length;
  const isDone = currentSet >= block.totalRounds;

  document.getElementById('active-block-title').innerHTML = block.label;
  document.getElementById('active-block-desc').innerHTML = block.desc || block.groupType || '';

  // Render Dots
  document.getElementById('set-dots').innerHTML = Array.from({length: block.totalRounds}, (_, i) => `<div class="dot ${i < currentSet ? 'done' : i === currentSet ? 'cur' : ''}"></div>`).join('');

  if(isDone) {
    document.getElementById('set-logger').style.display = 'none';
    document.getElementById('done-main-btn').style.display = 'block';
    renderLoggedSets();
    return;
  }

  document.getElementById('set-logger').style.display = 'block';
  document.getElementById('done-main-btn').style.display = 'none';
  document.getElementById('set-counter').textContent = `ROUND ${currentSet + 1} OF ${block.totalRounds}`;
  document.getElementById('rest-timer').style.display = 'none';

  const inputsContainer = document.getElementById('dynamic-inputs');
  
  if (block.type === 'main') {
    // MAIN LIFT UI
    const s = block.scheme[currentSet];
    const pw = r5(block.tm * s.p);
    
    document.getElementById('set-prescrip').style.display = 'block';
    document.getElementById('set-prescrip').innerHTML = `Prescribed: <span>${pw} lbs × ${s.amrap ? s.r + ' (AMRAP)' : s.r}</span>`;
    
    if(s.amrap) { 
      document.getElementById('amrap-coach').style.display = 'block';
      let prevReps = block.logged.length ? block.logged[block.logged.length - 1].reps : 5;
      document.getElementById('amrap-coach-text').innerHTML = `Target <strong>${prevReps > 5 ? prevReps : prevReps + 2}+ reps</strong>. Go for max quality reps.`;
    } else { 
      document.getElementById('amrap-coach').style.display = 'none'; 
    }

    inputsContainer.innerHTML = `
      <div class="si-grid">
        <div class="si-box"><label>WEIGHT (lbs)</label><input type="number" class="wi" id="inp-main-w" inputmode="decimal" value="${pw}"></div>
        <div class="si-box"><label>REPS</label><input type="number" class="ri" id="inp-main-r" inputmode="decimal" value="${typeof s.r === 'number' ? s.r : ''}"></div>
        <div class="si-box"><label>REST (min)</label><input type="number" id="inp-main-rest" inputmode="decimal" value="3"></div>
      </div>
      <div class="rpe-w">
        <div class="rpe-lr"><span class="rpe-t">RPE (1–10)</span><span class="rpe-v" id="rpe-disp" style="color:var(--green)">6</span></div>
        <input type="range" min="1" max="10" value="6" id="inp-main-rpe" oninput="updateRPE(this.value)">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--slate);margin-top:3px;"><span>1 Easy</span><span>5 Moderate</span><span>10 Max</span></div>
      </div>
      <div class="e1rm-b" id="e1rm-live" style="display:none;"><div class="el">Estimated 1RM this set</div><div class="ev" id="e1rm-val">—</div></div>
    `;

    ['inp-main-w', 'inp-main-r'].forEach(id => {
      document.getElementById(id).oninput = () => {
        const w = parseFloat(document.getElementById('inp-main-w').value);
        const reps = parseInt(document.getElementById('inp-main-r').value);
        if(w && reps && reps > 0) {
          const e = reps === 1 ? w : r5(w * (1 + reps / 30));
          document.getElementById('e1rm-val').textContent = e + ' lbs';
          document.getElementById('e1rm-live').style.display = 'block';
        }
      };
    });

  } else if (block.type === 'accessory') {
    // ACCESSORY UI
    document.getElementById('set-prescrip').style.display = 'none';
    document.getElementById('amrap-coach').style.display = 'none';

    let html = '';
    block.items.forEach((item, idx) => {
      const prevW = block.logged.length > 0 ? block.logged[block.logged.length-1].items[idx].w : (item.w || '');
      const prevR = block.logged.length > 0 ? block.logged[block.logged.length-1].items[idx].r : (item.r || '');
      html += `
        <div class="acc-log-row">
          <div class="alr-name">${item.name} <span class="alr-pres">(${item.pres})</span></div>
          <div class="alr-inputs">
            <div style="flex:1"><label>WEIGHT / BW</label><input type="text" class="wi acc-w" data-idx="${idx}" value="${prevW}" placeholder="lbs"></div>
            <span style="color:var(--slate); padding-top:14px;">×</span>
            <div style="flex:1"><label>REPS / TIME</label><input type="text" class="ri acc-r" data-idx="${idx}" value="${prevR}" placeholder="reps"></div>
          </div>
        </div>
      `;
    });
    html += `<div class="si-box" style="margin-top:12px;"><label>REST (sec)</label><input type="number" id="inp-acc-rest" value="${block.defaultRest}"></div>`;
    inputsContainer.innerHTML = html;
  }
  
  renderLoggedSets();
}

function updateRPE(v) {
  const el = document.getElementById('rpe-disp');
  if(el) {
    el.textContent = v;
    el.style.color = v <= 4 ? 'var(--green)' : v <= 7 ? 'var(--orange)' : 'var(--red)';
  }
}

function logActiveBlock() {
  const block = S.session.blocks[S.session.currentBlockIdx];
  const currentSet = block.logged.length;
  let restTime = 60;

  if (block.type === 'main') {
    const w = parseFloat(document.getElementById('inp-main-w').value);
    const r = parseInt(document.getElementById('inp-main-r').value);
    const rpe = parseInt(document.getElementById('inp-main-rpe').value);
    restTime = (parseFloat(document.getElementById('inp-main-rest').value) || 3) * 60;
    
    if(!w || !r) { toast('Enter weight and reps!'); return; }
    const s = block.scheme[currentSet];
    const e1rm = r === 1 ? w : r5(w * (1 + r / 30));
    
    block.logged.push({ w, r, rpe, e1rm, prescribed_w: r5(block.tm * s.p), prescribed_r: s.r, amrap: s.amrap || false });
  
  } else if (block.type === 'accessory') {
    const ws = document.querySelectorAll('.acc-w');
    const rs = document.querySelectorAll('.acc-r');
    restTime = parseInt(document.getElementById('inp-acc-rest').value) || 60;
    
    const roundItems = [];
    let isValid = true;
    block.items.forEach((item, idx) => {
      const wVal = ws[idx].value.trim();
      const rVal = rs[idx].value.trim();
      if(!wVal || !rVal) isValid = false;
      roundItems.push({ w: wVal, r: rVal });
    });

    if(!isValid) { toast('Fill all fields for this round!'); return; }
    block.logged.push({ items: roundItems, rest: restTime });
  }

  save();
  renderLoggedSets();

  if(block.logged.length < block.totalRounds) {
    toast(`Round ${block.logged.length} logged ✓`);
    document.getElementById('set-logger').style.display = 'none';
    startRestTimer(restTime / 60); // timer uses mins, passing secs/60 handles it
  } else {
    document.getElementById('set-logger').style.display = 'none';
    document.getElementById('set-dots').innerHTML = Array.from({length: block.totalRounds}, () => `<div class="dot done"></div>`).join('');
    document.getElementById('done-main-btn').style.display = 'block';
    
    // Optional: Pop timer even after last set of block to rest before next block
    startRestTimer(restTime / 60);
  }
}

function renderLoggedSets() {
  const block = S.session.blocks[S.session.currentBlockIdx];
  const wrap = document.getElementById('logged-sets-wrap');
  if(!block.logged.length) { wrap.innerHTML = ''; return; }
  
  let html = `<div style="font-size:10px;color:var(--slate);letter-spacing:1px;margin-bottom:6px;text-transform:uppercase;">Logged Rounds</div>`;
  
  if (block.type === 'main') {
    html += block.logged.map((s, i) => {
      const rc = s.rpe <= 4 ? 'var(--green)' : s.rpe <= 7 ? 'var(--orange)' : 'var(--red)';
      const diff = s.w !== s.prescribed_w ? ` <span style="color:${s.w > s.prescribed_w ? 'var(--green)' : '#f87171'};font-size:10px;">(${s.w > s.prescribed_w ? '+' : ''}${s.w - s.prescribed_w})</span>` : '';
      return `<div class="ls"><span class="ls-n">${i + 1}</span><span class="ls-d"><strong style="color:var(--green)">${s.w}lbs</strong>${diff} × <strong style="color:var(--orange)">${s.r}</strong></span><span class="ls-e">e1RM ${s.e1rm}</span><span class="ls-r" style="background:${rc}22;color:${rc};border:1px solid ${rc}44;">RPE ${s.rpe}</span></div>`;
    }).join('');
  } else if (block.type === 'accessory') {
    html += block.logged.map((rnd, i) => {
      const itemsStr = rnd.items.map(it => `${it.w} × ${it.r}`).join(' &nbsp;|&nbsp; ');
      return `<div class="ls"><span class="ls-n">${i + 1}</span><span class="ls-d" style="color:var(--slate)">${itemsStr}</span></div>`;
    }).join('');
  }

  wrap.innerHTML = html;
}

// ============ BLOCK TRANSITIONS ============

function finishActiveBlock() {
  save();
  renderTransition();
}

function renderTransition() {
  const currentBlock = S.session.blocks[S.session.currentBlockIdx];
  const nextBlock = S.session.blocks[S.session.currentBlockIdx + 1];

  document.getElementById('lt-done-label').textContent = `${currentBlock.label.toUpperCase()} COMPLETE`;
  
  // Calculate Stats for Completed Block
  let statsHtml = '';
  if (currentBlock.type === 'main') {
    const bestE1rm = currentBlock.logged.length ? Math.max(...currentBlock.logged.map(s => s.e1rm)) : null;
    const totalVol = currentBlock.logged.reduce((t, s) => t + s.w * s.r, 0);
    statsHtml = (bestE1rm ? `Best e1RM: <strong style="color:#93c5fd">${bestE1rm} lbs</strong><br>` : '') +
                (totalVol ? `Volume: <strong style="color:var(--green)">${totalVol.toLocaleString()} lbs</strong>` : '');
  } else {
    let vol = 0;
    currentBlock.logged.forEach(rnd => {
      rnd.items.forEach(it => { vol += (parseFloat(it.w) || 0) * (parseInt(it.r) || 0); });
    });
    statsHtml = vol > 0 ? `Volume Added: <strong style="color:var(--blue)">${vol.toLocaleString()} lbs</strong>` : 'Block Completed';
  }
  document.getElementById('lt-stats').innerHTML = statsHtml;

  // Next Area logic
  if (nextBlock) {
    document.getElementById('trans-next-area').style.display = 'block';
    document.getElementById('trans-finish-area').style.display = 'none';
    document.getElementById('lt-next-name').textContent = nextBlock.label;
  } else {
    document.getElementById('trans-next-area').style.display = 'none';
    document.getElementById('trans-finish-area').style.display = 'block';
  }

  showPhase('-trans');
}

function startNextBlock() {
  S.session.currentBlockIdx++;
  save();
  showPhase('2');
  renderActiveBlock();
}

function skipNextBlock() {
  if(confirm("Skip the next block entirely?")) {
    S.session.currentBlockIdx++;
    save();
    renderTransition(); // Re-render transition to check if there's another block or if we are done
  }
}

function gotoFinish() {
  showPhase('-finish');
}

function cancelSession() { 
  if(confirm("Discard this entire workout?")) {
    S.session = null; showPhase('0'); stopSessionClock(); 
    if(_restTimer) { clearInterval(_restTimer); _restTimer = null; } 
    document.getElementById('rest-timer').style.display = 'none'; 
  }
}

// ============ EXTRAS MODAL ============
function openExModal() { 
  renderCats(); renderExList();
  document.getElementById('cex-input').value = '';
  document.getElementById('ex-modal').classList.add('open');
}
function closeExModal() { document.getElementById('ex-modal').classList.remove('open'); }
function renderCats() { document.getElementById('cat-tabs').innerHTML = Object.keys(EXERCISES).map(c => `<div class="ct2 ${c === currentCat ? 'active' : ''}" onclick="setCat('${c}',this)">${c}</div>`).join(''); }
function setCat(c, el) { currentCat = c; document.querySelectorAll('.ct2').forEach(t => t.classList.remove('active')); el.classList.add('active'); renderExList(); }
function renderExList() { document.getElementById('ex-list').innerHTML = EXERCISES[currentCat].map(e => `<div class="ex-pill" onclick="addExercise('${e}')">${e}</div>`).join(''); }
function addCustomEx() { const n = document.getElementById('cex-input').value.trim(); if(!n) { toast('Enter name!'); return; } addExercise(n); }

function addExercise(name) {
  // Push a new block to the plan dynamically
  S.session.blocks.push({
    id: `extra-${Date.now()}`,
    type: 'accessory',
    groupType: 'Extra Exercise',
    label: name,
    desc: 'Custom Addition',
    items: [{ name: name, pres: 'Custom', w: '', r: '' }],
    totalRounds: 3,
    defaultRest: 60,
    logged: [],
    isExtra: true
  });
  save();
  closeExModal();
  toast(`${name} added to queue ✓`);
  // Re-render transition so "Next Up" updates dynamically
  if(document.getElementById('ph-trans').classList.contains('active')) {
    renderTransition();
  }
}

// ============ FINISH & LOG GENERATION ============

function finishSession() {
  const dur = parseInt(document.getElementById('sess-dur').value) || 60;
  const notes = document.getElementById('sess-notes').value.trim();

  // Extract Main Sets
  const mainBlocks = S.session.blocks.filter(b => b.type === 'main' && b.logged.length > 0);
  const allMainSets = mainBlocks.flatMap(b => b.logged.map(l => ({
    weight: l.w, reps: l.r, rpe: l.rpe, e1rm: l.e1rm, prescribed_w: l.prescribed_w, prescribed_r: l.prescribed_r, amrap: l.amrap
  })));

  // Format Lift Breakdown for history UI
  const liftBreakdown = mainBlocks.length > 1 ? mainBlocks.map(b => ({
    lift: b.lift, liftLabel: LL[b.lift], tm: b.tm, mainSets: b.logged.map(l => ({
      weight: l.w, reps: l.r, rpe: l.rpe, e1rm: l.e1rm, prescribed_w: l.prescribed_w, prescribed_r: l.prescribed_r, amrap: l.amrap
    }))
  })) : null;

  // Extract Accessories & Extras
  const accBlocks = S.session.blocks.filter(b => b.type === 'accessory' && b.logged.length > 0 && !b.isExtra);
  const extraBlocks = S.session.blocks.filter(b => b.type === 'accessory' && b.logged.length > 0 && b.isExtra);

  const formatAccs = (blocks) => {
    return blocks.map(b => {
      const itemsOut = b.items.map((itemDef, idx) => {
        const setsOut = b.logged.map(round => ({ weight: round.items[idx].w, reps: round.items[idx].r }));
        return { name: itemDef.name, prescribed: itemDef.pres, sets: setsOut };
      });
      return { label: b.label, type: b.groupType, items: itemsOut };
    });
  };

  const coulsonSets = formatAccs(accBlocks);
  const assistance = formatAccs(extraBlocks).flatMap(b => b.items); // flatten extras slightly to fit legacy UI

  // Calcs
  const mainVol = allMainSets.reduce((t, s) => t + s.weight * s.reps, 0);
  let accVol = 0;
  [...accBlocks, ...extraBlocks].forEach(b => {
    b.logged.forEach(rnd => rnd.items.forEach(it => accVol += (parseFloat(it.w)||0) * (parseInt(it.r)||0)));
  });

  const totalVol = mainVol + accVol;
  const bestE1rm = allMainSets.length ? Math.max(...allMainSets.map(s => s.e1rm)) : null;
  const avgRpe = allMainSets.length ? Math.round(allMainSets.reduce((t, s) => t + s.rpe, 0) / allMainSets.length * 10) / 10 : null;
  const topSet = allMainSets.length ? allMainSets.reduce((b, s) => s.weight * s.reps > b.weight * b.reps ? s : b) : null;

  // Primary label logic
  let primaryLift = 'Workout';
  let liftDisplay = 'Workout';
  if (S.session.sessType === 'strength') {
    primaryLift = mainBlocks.length ? mainBlocks[0].liftLabel : 'Strength';
    liftDisplay = mainBlocks.length > 1 ? mainBlocks.map(b => LL[b.lift]).join(' + ') : primaryLift;
  } else {
    primaryLift = 'MRUT';
    liftDisplay = `MRUT Workout ${S.session.mrutNum}`;
  }

  const entry = {
    id: Date.now(),
    date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    type: S.session.sessType,
    lift: primaryLift,
    liftDisplay,
    week: S.session.sessType === 'strength' ? `Week ${S.week}` : 'MRUT', 
    weekLabel: S.session.sessType === 'strength' ? (S.week===4?'Deload':`Week ${S.week}`) : `Workout ${S.mrutNum}`, 
    cycle: S.cycle, 
    tm: mainBlocks.length ? mainBlocks[0].tm : null,
    mainSets: allMainSets,
    liftBreakdown,
    coulsonSets, 
    assistance,
    schedule: S.schedule,
    totalVolume: totalVol, bestE1rm, avgRpe, topSet,
    duration: dur, notes, estCals: LCALS[primaryLift.toLowerCase()] || '300–400',
    healthSynced: false, stravaSynced: false
  };
  
  S.log.unshift(entry); S.session = null;
  document.getElementById('sess-notes').value = '';
  document.getElementById('sess-dur').value = '60';
  save(); stopSessionClock(); buildSyncModal(entry);
  document.getElementById('sync-modal').classList.add('open');
  showPhase('0');
}

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
