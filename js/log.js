// ============ LOG & HISTORY ============
let _editId = null;

function renderLog() {
  const logList = document.getElementById('log-list');
  const ov = document.getElementById('log-overview');
  const tc = document.getElementById('trend-card');
  if(!S.log.length) {
    logList.innerHTML = '<div class="empty"><div class="ei">📋</div><p>No sessions yet.<br>Complete a workout to see history here.</p></div>';
    ov.innerHTML = '<div class="sb" style="grid-column:span 2"><div class="sl">No sessions yet</div></div>';
    tc.style.display = 'none'; return;
  }
  tc.style.display = 'block';
  const total = S.log.length;
  const totalVol = Math.round(S.log.reduce((t, e) => t + (e.totalVolume || 0), 0));
  const synced = S.log.filter(e => e.healthSynced).length;
  
  ov.innerHTML = `
    <div class="sb"><div class="sl">Sessions</div><div class="sv" style="color:var(--green)">${total}</div></div>
    <div class="sb"><div class="sl">Cycle</div><div class="sv" style="color:var(--gold)">${S.cycle}</div></div>
    <div class="sb"><div class="sl">Total Volume</div><div class="sv" style="color:var(--blue);font-size:16px;">${(totalVol / 1000).toFixed(1)}k</div><div style="font-size:10px;color:var(--slate)">lbs</div></div>
    <div class="sb"><div class="sl">Health Synced</div><div class="sv" style="color:var(--pink-l)">${synced}</div></div>
  `;
  renderTrend();
  
  logList.innerHTML = S.log.map(e => `
    <div class="log-entry">
      <div class="le-h">
        <div style="flex:1">
          <div class="le-t">${e.liftDisplay || e.lift}</div>
          <div class="le-d">${e.date} · ${e.time}</div>
          <div class="le-badges" style="margin-top:4px;">
            <span class="bdg w">${e.weekLabel || e.week} · Cycle ${e.cycle}</span>
            ${e.healthSynced ? '<span class="bdg h">❤️ HEALTH</span>' : ''}
            ${e.stravaSynced ? '<span class="bdg c">🟠 STRAVA</span>' : ''}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
          <button class="del-btn" onclick="delLog(${e.id})">✕</button>
          <button class="exp-btn" onclick="toggleDetail(${e.id})">DETAIL</button>
          <button class="exp-btn" onclick="openEditLog(${e.id})" style="color:var(--gold);border-color:rgba(255,215,0,0.3);">EDIT</button>
        </div>
      </div>
      <div class="stat-strip">
        <div class="ssi"><div class="ssi-l">Volume</div><div class="ssi-v" style="color:var(--blue);font-size:14px;">${Math.round(e.totalVolume || 0).toLocaleString()}</div><div style="font-size:9px;color:var(--slate)">lbs</div></div>
        ${e.bestE1rm ? `<div class="ssi"><div class="ssi-l">e1RM</div><div class="ssi-v" style="color:#93c5fd;font-size:14px;">${e.bestE1rm}</div><div style="font-size:9px;color:var(--slate)">lbs</div></div>` : ''}
        ${e.topSet ? `<div class="ssi"><div class="ssi-l">Top Set</div><div class="ssi-v" style="color:var(--green);font-size:13px;">${e.topSet.weight}×${e.topSet.reps}</div></div>` : ''}
        ${e.avgRpe ? `<div class="ssi"><div class="ssi-l">Avg RPE</div><div class="ssi-v" style="color:var(--orange);font-size:14px;">${e.avgRpe}</div></div>` : ''}
        <div class="ssi"><div class="ssi-l">Time</div><div class="ssi-v" style="font-size:14px;">${e.duration || 60}</div><div style="font-size:9px;color:var(--slate)">min</div></div>
      </div>
      <div class="le-det" id="det-${e.id}">
        ${e.liftBreakdown && e.liftBreakdown.length > 1 ?
          e.liftBreakdown.map(lb => `
          <div class="ex-sec">
            <div class="ex-sec-t">🏋️ ${lb.liftLabel} — TM ${lb.tm} lbs</div>
            ${lb.mainSets.map((s, i) => {
              const rc = s.rpe <= 4 ? 'var(--green)' : s.rpe <= 7 ? 'var(--orange)' : 'var(--red)';
              return `<div class="sdr"><span class="sdr-n">${i + 1}</span><span class="sdr-w">${s.weight}lbs</span><span style="color:var(--slate);font-size:11px;"> × </span><span class="sdr-r">${s.reps}</span><span style="font-size:10px;padding:1px 6px;border-radius:8px;background:${rc}22;color:${rc};margin-left:4px;">RPE ${s.rpe}</span><span class="sdr-e">e1RM ${s.e1rm}</span></div>`;
            }).join('')}
          </div>`).join('')
          :
          e.mainSets && e.mainSets.length ? `
          <div class="ex-sec">
            <div class="ex-sec-t">Main Lift — ${e.lift}</div>
            ${e.mainSets.map((s, i) => {
              const rc = s.rpe <= 4 ? 'var(--green)' : s.rpe <= 7 ? 'var(--orange)' : 'var(--red)';
              const diff = s.weight !== s.prescribed_w ? ` <span style="color:${s.weight > s.prescribed_w ? 'var(--green)' : '#f87171'};font-size:10px;">(${s.weight > s.prescribed_w ? '+' : ''}${s.weight - s.prescribed_w})</span>` : '';
              return `<div class="sdr"><span class="sdr-n">${i + 1}</span><span class="sdr-w">${s.weight}lbs</span>${diff}<span style="color:var(--slate);font-size:11px;"> × </span><span class="sdr-r">${s.reps}</span><span style="font-size:10px;padding:1px 6px;border-radius:8px;background:${rc}22;color:${rc};margin-left:4px;">RPE ${s.rpe}</span><span class="sdr-e">e1RM ${s.e1rm}</span></div>`;
            }).join('')}
          </div>` : ''}
        ${e.coulsonSets && e.coulsonSets.length ? e.coulsonSets.map(g => `
          <div class="ex-sec">
            <div class="ex-sec-t">${g.label}</div>
            ${g.items.map(item => {
              const vol = item.sets.reduce((t, s) => t + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0), 0);
              const hasWeightedSets = vol > 0;
              return `<div style="margin-bottom:6px;"><div style="font-size:12px;color:#93c5fd;margin-bottom:3px;">${item.name}</div>
                ${item.sets.map((s, j) => {
                  const repDisplay = s.reps || '—';
                  const isTimed = typeof s.reps === 'string' && isNaN(parseFloat(s.reps));
                  const volDisplay = isTimed ? '' : `${((parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0)).toLocaleString()} lbs`;
                  return `<div class="sdr"><span class="sdr-n">${j + 1}</span><span class="sdr-w">${s.weight || 'BW'}</span><span style="color:var(--slate);font-size:11px;"> × </span><span class="sdr-r">${repDisplay}</span>${volDisplay ? `<span class="sdr-e">${volDisplay}</span>` : ''}</div>`;
                }).join('')}
                ${hasWeightedSets ? `<div style="font-size:11px;color:var(--slate);margin-top:3px;">Vol: <strong style="color:var(--blue)">${vol.toLocaleString()} lbs</strong></div>` : ''}
              </div>`;
            }).join('')}
          </div>`).join('') : ''}
        ${e.assistance && e.assistance.length ? `
          <div class="ex-sec">
            <div class="ex-sec-t">Extra Exercises</div>
            ${e.assistance.map(ex => {
              const vol = ex.sets.reduce((t, s) => t + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0), 0);
              return `<div style="margin-bottom:5px;"><div style="font-size:12px;color:var(--slate);margin-bottom:3px;">${ex.name}</div>
                ${ex.sets.map((s, j) => `<div class="sdr"><span class="sdr-n">${j + 1}</span><span class="sdr-w">${s.weight || '—'}lbs</span><span class="sdr-r"> × ${s.reps || '—'}</span><span class="sdr-e">${((parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0)).toLocaleString()} lbs</span></div>`).join('')}
              </div>`;
            }).join('')}
          </div>` : ''}
        ${e.notes ? `<div style="font-size:12px;color:rgba(255,255,255,0.5);font-style:italic;margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.07);">"${e.notes}"</div>` : ''}
      </div>
    </div>`).join('');
}

function toggleDetail(id) { document.getElementById('det-' + id)?.classList.toggle('open'); }
function delLog(id) { S.log = S.log.filter(e => e.id !== id); save(); renderLog(); }
function clearLog() { if(confirm('Clear all history?')) { S.log = []; save(); renderLog(); } }

function openEditLog(id) {
  const entry = S.log.find(e => e.id === id);
  if(!entry) return;
  _editId = id;
  document.getElementById('edit-modal-sub').textContent = `${entry.liftDisplay || entry.lift} · ${entry.weekLabel || entry.week}`;

  const setsToEdit = entry.mainSets || [];
  const setsHTML = setsToEdit.length ? `
    <div style="font-size:11px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">Main Sets</div>
    ${setsToEdit.map((s, i) => `
      <div style="display:flex;gap:6px;align-items:center;margin-bottom:7px;">
        <span style="font-size:11px;color:var(--slate);width:18px;">${i + 1}</span>
        <input type="number" id="es-w-${i}" value="${s.weight}" placeholder="lbs" inputmode="decimal"
          style="background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.2);border-radius:5px;color:var(--green);font-family:'Oswald',sans-serif;font-size:16px;font-weight:700;padding:8px 6px;width:75px;text-align:center;-webkit-appearance:none;">
        <span style="color:var(--slate);font-size:12px;">×</span>
        <input type="number" id="es-r-${i}" value="${s.reps}" placeholder="reps" inputmode="decimal"
          style="background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.2);border-radius:5px;color:var(--orange);font-family:'Oswald',sans-serif;font-size:16px;font-weight:700;padding:8px 6px;width:60px;text-align:center;-webkit-appearance:none;">
        <input type="number" id="es-rpe-${i}" value="${s.rpe || 6}" min="1" max="10" placeholder="RPE" inputmode="decimal"
          style="background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.2);border-radius:5px;color:var(--slate);font-family:'Oswald',sans-serif;font-size:14px;font-weight:700;padding:8px 4px;width:50px;text-align:center;-webkit-appearance:none;">
        <button onclick="removeEditSet(${i})" style="background:none;border:none;color:rgba(239,68,68,0.5);font-size:16px;cursor:pointer;padding:4px;">✕</button>
      </div>`).join('')}
    <button onclick="addEditSet()" class="btn xs sec" style="margin-bottom:12px;">＋ Add Set</button>
    <div class="div"></div>` :
    `<p style="font-size:12px;color:var(--slate);margin-bottom:12px;">No main sets recorded.</p>`;

  document.getElementById('edit-modal-body').innerHTML = `
    ${setsHTML}
    <div style="font-size:11px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">Session Info</div>
    <div class="ir" style="margin-bottom:8px;">
      <label>Duration (minutes)</label>
      <input type="number" id="es-dur" value="${entry.duration || 60}" inputmode="decimal">
    </div>
    <div class="ir" style="margin-bottom:0;">
      <label>Notes</label>
      <textarea id="es-notes" style="background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.2);border-radius:6px;color:white;font-family:'Rajdhani',sans-serif;font-size:14px;padding:9px 12px;width:100%;resize:none;min-height:60px;">${entry.notes || ''}</textarea>
    </div>`;

  document.getElementById('edit-modal').classList.add('open');
}

function removeEditSet(i) {
  const entry = S.log.find(e => e.id === _editId);
  if(!entry) return;
  entry.mainSets.splice(i, 1);
  openEditLog(_editId);
}

function addEditSet() {
  const entry = S.log.find(e => e.id === _editId);
  if(!entry) return;
  entry.mainSets.push({ weight: 0, reps: 0, rpe: 7, e1rm: 0, prescribed_w: 0, prescribed_r: 0, pct: 0, amrap: false });
  openEditLog(_editId);
}

function saveEditLog() {
  const entry = S.log.find(e => e.id === _editId);
  if(!entry) { closeEditModal(); return; }

  const n = entry.mainSets.length;
  const updatedSets = [];
  for(let i = 0; i < n; i++) {
    const wEl = document.getElementById(`es-w-${i}`);
    const rEl = document.getElementById(`es-r-${i}`);
    const rpeEl = document.getElementById(`es-rpe-${i}`);
    if(!wEl) continue;
    const w = parseFloat(wEl.value) || 0;
    const reps = parseInt(rEl.value) || 0;
    const rpe = parseInt(rpeEl.value) || 6;
    const e1rm = reps === 1 ? w : Math.round(Math.round(w * (1 + reps / 30) / 5) * 5);
    updatedSets.push({ ...entry.mainSets[i], weight: w, reps, rpe, e1rm });
  }
  entry.mainSets = updatedSets;

  if(entry.liftBreakdown && entry.liftBreakdown.length > 0) entry.liftBreakdown[0].mainSets = updatedSets;

  const allSets = entry.liftBreakdown ? entry.liftBreakdown.flatMap(l => l.mainSets) : updatedSets;
    
  const mainVol = allSets.reduce((t, s) => t + s.weight * s.reps, 0);
  const coulsonVol = (entry.coulsonSets || []).reduce((t, g) =>
    t + g.items.reduce((t2, item) => t2 + item.sets.reduce((t3, s) => t3 + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0), 0), 0), 0);
  const extrasVol = (entry.assistance || []).reduce((t, ex) =>
    t + ex.sets.reduce((t2, s) => t2 + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0), 0), 0);
    
  entry.totalVolume = mainVol + coulsonVol + extrasVol;
  entry.bestE1rm = allSets.length ? Math.max(...allSets.map(s => s.e1rm).filter(v => v > 0)) : null;
  entry.avgRpe = allSets.length ? Math.round(allSets.reduce((t, s) => t + s.rpe, 0) / allSets.length * 10) / 10 : null;
  entry.topSet = allSets.length ? allSets.reduce((b, s) => s.weight * s.reps > b.weight * b.reps ? s : b, allSets[0]) : null;
  entry.duration = parseInt(document.getElementById('es-dur').value) || 60;
  entry.notes = (document.getElementById('es-notes').value || '').trim();

  save(); closeEditModal(); renderLog(); toast('Session updated ✓');
}

function closeEditModal() { document.getElementById('edit-modal').classList.remove('open'); _editId = null; }

function renderTrend() {
  const lift = document.getElementById('trend-sel')?.value || 'Squat';
  const entries = S.log.filter(e => e.lift === lift && e.bestE1rm);
  const tc = document.getElementById('trend-content');
  if(!tc) return;
  if(entries.length < 2) {
    tc.innerHTML = `<p style="font-size:12px;color:var(--slate);text-align:center;padding:16px 0;">Log ${entries.length === 0 ? '2' : '1'} more ${lift} session${entries.length === 0 ? 's' : ''} to see the trend chart.</p>`;
    return;
  }
  
  const pts = entries.slice(0, 12).reverse();
  const vals = pts.map(e => e.bestE1rm);
  const minV = Math.min(...vals) - 10;
  const maxV = Math.max(...vals) + 10;
  const W = 320, H = 120, padL = 36, padR = 8, padT = 10, padB = 28;
  const cW = W - padL - padR, cH = H - padT - padB;
  const xScale = (i) => padL + i * (cW / (pts.length - 1));
  const yScale = (v) => padT + cH - (cH * (v - minV) / (maxV - minV));
  
  const gridVals = [minV, Math.round((minV + maxV) / 2), maxV].map(v => Math.round(v / 5) * 5);
  const gridLines = gridVals.map(v => {
    const y = yScale(v);
    return `<line class="tc-grid" x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}"/> <text class="tc-ylabel" x="${padL - 4}" y="${y + 3}">${v}</text>`;
  }).join('');
  
  const linePts = pts.map((e, i) => `${i === 0 ? 'M' : 'L'}${xScale(i)},${yScale(e.bestE1rm)}`).join(' ');
  const areaPath = `${linePts} L${xScale(pts.length - 1)},${H - padB} L${padL},${H - padB} Z`;
  
  const dotsSVG = pts.map((e, i) => {
    const x = xScale(i), y = yScale(e.bestE1rm);
    const lbl = e.date.split(',')[0];
    const isMax = e.bestE1rm === Math.max(...vals);
    return `<circle class="tc-dot" cx="${x}" cy="${y}" r="${isMax ? 5 : 3.5}" fill="${isMax ? 'var(--gold)' : '#93c5fd'}" stroke="#0a3d1f" stroke-width="1.5"/> ${isMax ? `<text class="tc-val" x="${x}" y="${y - 8}">${e.bestE1rm}</text>` : ''} <text class="tc-label" x="${x}" y="${H - padB + 14}">${lbl.replace(' ', '&#10;')}</text>`;
  }).join('');
  
  const best = Math.max(...vals);
  const latest = vals[vals.length - 1];
  const delta = latest - (vals[0] || latest);
  
  tc.innerHTML = ` <div class="trend-chart-wrap"> <svg class="trend-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet"> <defs> <linearGradient id="tcGrad" x1="0" y1="0" x2="0" y2="1"> <stop offset="0%" stop-color="#93c5fd" stop-opacity="0.3"/> <stop offset="100%" stop-color="#93c5fd" stop-opacity="0"/> </linearGradient> </defs> ${gridLines} <path class="tc-area" d="${areaPath}"/> <path class="tc-line" d="${linePts}"/> ${dotsSVG} </svg> </div> <div style="display:flex;justify-content:space-between;font-size:12px;padding:0 4px;"> <span style="color:var(--slate)">Best: <strong style="color:var(--gold)">${best} lbs</strong></span> <span style="color:var(--slate)">Latest: <strong style="color:#93c5fd">${latest} lbs</strong></span> <span style="color:${delta >= 0 ? 'var(--green)' : 'var(--red)'}">${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta)} lbs</span> </div>`;
}