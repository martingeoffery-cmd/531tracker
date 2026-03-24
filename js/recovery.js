// ============ RECOVERY ============
function loadRecoveryUI() {
  const today = new Date().toDateString();
  const saved = S.todayMetrics && S.todayMetrics.date === today ? S.todayMetrics : {};
  ['hrv', 'rhr', 'sleep', 'energy', 'soreness', 'stress'].forEach(k => {
    const el = document.getElementById('met-' + k);
    if(el && saved[k]) el.value = saved[k];
  });
  updateHRVAvg();
  updateRHRAvg();
  if(S.todayMetrics && S.todayMetrics.score !== undefined) renderReadinessResult(S.todayMetrics);
  renderMetricHistory();
}

function updateHRVAvg() {
  const hist = S.metricHistory || [];
  if(!hist.length) { document.getElementById('hrv-avg').textContent = '—'; return; }
  const vals = hist.slice(0, 7).map(d => d.hrv).filter(Boolean);
  if(vals.length) document.getElementById('hrv-avg').textContent = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) + ' ms';
}

function updateRHRAvg() {
  const hist = S.metricHistory || [];
  if(!hist.length) { document.getElementById('rhr-avg').textContent = '—'; return; }
  const vals = hist.slice(0, 7).map(d => d.rhr).filter(Boolean);
  if(vals.length) document.getElementById('rhr-avg').textContent = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) + ' bpm';
}

function saveMetrics() {
  const today = new Date().toDateString();
  const m = {
    date: today,
    hrv: parseFloat(document.getElementById('met-hrv')?.value) || null,
    rhr: parseFloat(document.getElementById('met-rhr')?.value) || null,
    sleep: parseFloat(document.getElementById('met-sleep')?.value) || null,
    energy: parseInt(document.getElementById('met-energy')?.value) || null,
    soreness: parseInt(document.getElementById('met-soreness')?.value) || null,
    stress: parseInt(document.getElementById('met-stress')?.value) || null
  };
  S.todayMetrics = m;
  save();
}

function calcReadiness() {
  saveMetrics();
  const m = S.todayMetrics;
  if(!m) { toast('Enter at least some metrics!'); return; }

  const hist = S.metricHistory || [];
  const scores = {};

  if(m.hrv) {
    const vals = hist.slice(0, 14).map(d => d.hrv).filter(Boolean);
    if(vals.length >= 3) {
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      const ratio = m.hrv / avg;
      scores.hrv = ratio >= 1.1 ? 100 : ratio >= 0.95 ? 75 : ratio >= 0.8 ? 45 : 20;
    } else {
      scores.hrv = m.hrv >= 60 ? 90 : m.hrv >= 45 ? 75 : m.hrv >= 30 ? 55 : 35;
    }
  }

  if(m.rhr) {
    const vals = hist.slice(0, 14).map(d => d.rhr).filter(Boolean);
    if(vals.length >= 3) {
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      const delta = m.rhr - avg;
      scores.rhr = delta <= -2 ? 100 : delta <= 0 ? 80 : delta <= 3 ? 55 : delta <= 6 ? 35 : 15;
    } else {
      scores.rhr = m.rhr <= 55 ? 90 : m.rhr <= 65 ? 75 : m.rhr <= 75 ? 55 : 35;
    }
  }

  if(m.sleep) scores.sleep = m.sleep >= 8 ? 100 : m.sleep >= 7 ? 85 : m.sleep >= 6 ? 60 : m.sleep >= 5 ? 35 : 15;
  if(m.energy) scores.energy = Math.round(m.energy * 10);
  if(m.soreness) scores.soreness = Math.round((11 - m.soreness) * 10);
  if(m.stress) scores.stress = Math.round((11 - m.stress) * 10);

  const weights = { hrv: 0.25, rhr: 0.2, sleep: 0.25, energy: 0.15, soreness: 0.1, stress: 0.05 };
  let total = 0, wSum = 0;
  Object.entries(scores).forEach(([k, v]) => { total += v * (weights[k] || 0.1); wSum += (weights[k] || 0.1); });
  const score = wSum > 0 ? Math.round(total / wSum) : null;

  Object.entries(scores).forEach(([k, v]) => {
    const box = document.getElementById('mb-' + k);
    if(box) { box.classList.remove('good', 'warn', 'bad'); box.classList.add(v >= 70 ? 'good' : v >= 45 ? 'warn' : 'bad'); }
  });

  const result = { ...m, score, scores };
  S.todayMetrics = result;

  if(!S.metricHistory) S.metricHistory = [];
  const todayStr = new Date().toDateString();
  S.metricHistory = S.metricHistory.filter(d => d.date !== todayStr);
  S.metricHistory.unshift({ ...result });
  S.metricHistory = S.metricHistory.slice(0, 30);
  save();

  renderReadinessResult(result);
  renderMetricHistory();
}

function renderReadinessResult(m) {
  if(m.score === undefined || m.score === null) return;
  const score = m.score;
  const isGreen = score >= 70, isYellow = score >= 45 && score < 70;
  const color = isGreen ? 'var(--green)' : isYellow ? 'var(--orange)' : 'var(--red)';
  const ring = document.getElementById('readiness-ring');
  const sc = document.getElementById('readiness-score');
  const lbl = document.getElementById('readiness-label');
  const rec = document.getElementById('readiness-rec');

  ring.style.borderColor = color; ring.style.background = `${color}11`;
  sc.style.color = color; sc.textContent = score;
  lbl.style.color = color;

  if(isGreen) {
    lbl.textContent = 'READY TO TRAIN';
    rec.textContent = 'Recovery is solid. Push hard on your AMRAP sets today — this is a good day to chase PRs.';
  } else if(isYellow) {
    lbl.textContent = 'TRAIN WITH CAUTION';
    rec.textContent = 'Recovery is moderate. Complete your prescribed sets but back off on AMRAP — stop 2–3 reps short. Prioritize sleep tonight.';
  } else {
    lbl.textContent = 'CONSIDER RECOVERY';
    rec.textContent = 'Recovery is low. Consider a deload, active recovery, or rest day. If you do train, keep intensity at 70–75% and skip AMRAP.';
  }

  const bd = document.getElementById('readiness-breakdown');
  bd.style.display = 'block';
  const labels = { hrv: 'HRV', rhr: 'Rest HR', sleep: 'Sleep', energy: 'Energy', soreness: 'Soreness', stress: 'Stress' };
  const scores = m.scores || {};
  document.getElementById('breakdown-content').innerHTML =
    Object.entries(labels).map(([k, l]) => {
      if(scores[k] === undefined) return '';
      const v = scores[k];
      const c = v >= 70 ? 'var(--green)' : v >= 45 ? 'var(--orange)' : 'var(--red)';
      return `<div class="bk-row"> <span class="bk-label">${l}</span> <div class="bk-bar-w"><div class="bk-bar" style="width:${v}%;background:${c};"></div></div> <span class="bk-val" style="color:${c}">${v}</span> </div>`;
    }).join('');

  document.getElementById('training-rec-box').innerHTML = ` <div class="rec-box" style="background:${isGreen ? 'rgba(74,222,128,0.1)' : isYellow ? 'rgba(251,146,60,0.1)' : 'rgba(239,68,68,0.1)'};border:1px solid ${color}44;"> <div class="rec-icon">${isGreen ? '🟢' : isYellow ? '🟡' : '🔴'}</div> <div class="rec-title" style="color:${color}">${lbl.textContent}</div> <div class="rec-detail">${rec.textContent}</div> </div>`;
}

function renderMetricHistory() {
  const hist = (S.metricHistory || []).slice(0, 7);
  const card = document.getElementById('metric-history-card');
  if(!hist.length) { if(card) card.style.display = 'none'; return; }
  if(card) card.style.display = 'block';
  const el = document.getElementById('metric-trend'); if(!el) return;
  el.innerHTML = hist.map(d => {
    const c = d.score >= 70 ? 'var(--green)' : d.score >= 45 ? 'var(--orange)' : 'var(--red)';
    const dStr = new Date(d.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05);"> <span style="font-size:12px;color:var(--slate);">${dStr}</span> <div style="display:flex;gap:6px;align-items:center;"> ${d.hrv ? `<span style="font-size:11px;color:#93c5fd;">HRV ${d.hrv}ms</span>` : ''} ${d.sleep ? `<span style="font-size:11px;color:var(--slate);">${d.sleep}h</span>` : ''} <span style="font-family:'Oswald',sans-serif;font-size:16px;color:${c};min-width:30px;text-align:right;">${d.score ?? '—'}</span> </div> </div>`;
  }).join('');
}