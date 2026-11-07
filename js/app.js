import { EXAMS, GERMAN, READINGS, SURVEY, SURVEY_QUESTIONS, GAMES, PSMT, SOURCES } from './data.js';
import { TOPICS, checkMaths, stats } from './maths.js';
import { DRILLS, checkGerman, variants } from './german.js';

// ---------- state ----------
const KEY = 'examquest.v1';
const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' });
const fresh = () => ({ xp: 0, coins: 0, streak: { last: '', n: 0 }, day: {}, mastery: {}, topic: {}, badges: [], bosses: {}, playSec: 0, total: 0, bestCombo: 0, psmt: {}, claimed: {} });
let S = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || '{}'));
const save = () => localStorage.setItem(KEY, JSON.stringify(S));
function day() {
  if (S.day.date !== today()) S.day = { date: today(), correct: 0, german: 0, maths: 0, boss: 0, combo: 0, quests: {} };
  return S.day;
}
const level = (xp = S.xp) => Math.floor(Math.sqrt(xp / 60)) + 1;
const xpFor = (l) => 60 * (l - 1) ** 2;

const $ = (sel, el = document) => el.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const view = $('#view');

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), 2600);
}

function hud() {
  const l = level(), lo = xpFor(l), hi = xpFor(l + 1);
  $('#hud-level').textContent = `Lv ${l}`;
  $('#hud-xp i').style.width = `${((S.xp - lo) / (hi - lo)) * 100}%`;
  $('#hud-coins').textContent = `🪙 ${S.coins}`;
  $('#hud-streak').textContent = `🔥 ${S.streak.n}`;
  document.querySelectorAll('nav a').forEach((a) => a.classList.toggle('on', a.getAttribute('href') === location.hash.split('/')[0]));
}

function reward(xp, coins, why) {
  const before = level();
  S.xp += xp; S.coins += coins; save(); hud();
  if (level() > before) { toast(`⬆️ Level ${level()}! +50 bonus coins`); S.coins += 50; save(); hud(); }
  else if (why) toast(why);
}

// Streak counts days with at least 20 correct answers.
function bumpStreak() {
  const d = day();
  if (d.correct !== 20) return;
  const y = new Date(Date.now() - 864e5).toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' });
  S.streak.n = S.streak.last === y ? S.streak.n + 1 : S.streak.last === today() ? S.streak.n : 1;
  S.streak.last = today();
  reward(20, 20, `🔥 Streak day ${S.streak.n}! Arcade unlocked for today.`);
}

// ---------- quests & badges ----------
const QUESTS = [
  { id: 'q30', text: 'Get 30 answers right', goal: 30, get: (d) => d.correct, coins: 40 },
  { id: 'qger', text: 'Get 20 German answers right', goal: 20, get: (d) => d.german, coins: 30 },
  { id: 'qmat', text: 'Get 20 Maths answers right', goal: 20, get: (d) => d.maths, coins: 30 },
  { id: 'qcombo', text: 'Hit a 10× combo', goal: 10, get: (d) => d.combo, coins: 25 },
  { id: 'qboss', text: 'Fight a boss', goal: 1, get: (d) => d.boss, coins: 25 },
];
function checkQuests() {
  const d = day();
  for (const q of QUESTS) if (!d.quests[q.id] && q.get(d) >= q.goal) { d.quests[q.id] = 1; reward(30, q.coins, `✅ Quest done: ${q.text} (+${q.coins} 🪙)`); }
  if (QUESTS.every((q) => d.quests[q.id]) && !d.quests.all) { d.quests.all = 1; reward(100, 100, '🏆 All daily quests done! +100 🪙'); }
}

const BADGES = [
  ['first', '🎯', 'First correct answer', () => S.total >= 1],
  ['c100', '💯', '100 correct answers', () => S.total >= 100],
  ['c500', '🧠', '500 correct answers', () => S.total >= 500],
  ['combo10', '⚡', '10× combo', () => S.bestCombo >= 10],
  ['combo25', '🌩️', '25× combo', () => S.bestCombo >= 25],
  ['lv5', '⭐', 'Reach level 5', () => level() >= 5],
  ['lv10', '🌟', 'Reach level 10', () => level() >= 10],
  ['streak3', '🔥', '3-day streak', () => S.streak.n >= 3],
  ['bger', '🇩🇪', 'Beat the German boss', () => S.bosses.ger?.won],
  ['bmat', '📐', 'Beat the Maths boss', () => S.bosses.mat?.won],
  ['bpsmt', '📊', 'Beat the Statistics boss', () => S.bosses.psmt?.won],
  ['psmt', '🔬', 'Finish the PSMT lab (all 3 questions)', () => [0, 1, 2].every((i) => S.psmt[i]?.done)],
  ['vocab', '📚', 'Master 50 German words', () => Object.entries(S.mastery).filter(([k, v]) => k.startsWith('v:') && v >= 3).length >= 50],
];
function checkBadges() {
  for (const [id, icon, name, ok] of BADGES) if (!S.badges.includes(id) && ok()) { S.badges.push(id); save(); toast(`${icon} Badge unlocked: ${name} (+30 🪙)`); S.coins += 30; }
}

// ---------- question engine ----------
// A question: { id, prompt, passage?, kind: 'text'|'mc', choices?, check(input) -> 'right'|'accent'|'wrong', answer, steps, keys?, subject }
let session = null;
function play({ title, next, limit = 20, boss = null, onEnd }) {
  session = { title, next, limit, boss, onEnd, n: 0, right: 0, combo: 0, q: null, locked: false, hp: boss ? boss.hp : 0, hearts: boss ? 3 : 0, start: Date.now(), wrongs: [] };
  ask();
}

function ask() {
  const s = session;
  if (s.n >= s.limit || (s.boss && (s.hp <= 0 || s.hearts <= 0))) return finish();
  s.q = s.next(s);
  if (!s.q) return finish();
  s.locked = false;
  const q = s.q;
  view.innerHTML = `
    <div class="play">
      <div class="row" style="justify-content:space-between">
        <a href="#" id="quit" class="muted">✕ ${esc(s.title)}</a>
        <span class="muted">${s.n + 1} / ${s.limit} · <span class="combo">${s.combo >= 3 ? `🔥 ${s.combo}× combo` : ''}</span></span>
      </div>
      <div class="bar" style="margin-top:8px"><i style="width:${(s.n / s.limit) * 100}%"></i></div>
      ${s.boss ? `<div class="boss" id="boss">${s.boss.icon}</div><div class="hp"><i style="width:${(s.hp / s.boss.hp) * 100}%"></i></div><p class="center">${'❤️'.repeat(s.hearts)}${'🖤'.repeat(3 - s.hearts)} <span class="muted" id="timer"></span></p>` : ''}
      ${q.passage ? `<details ${s.n === 0 ? 'open' : ''}><summary class="muted">Text</summary><div class="passage">${esc(q.passage)}</div></details>` : ''}
      <div class="q">${esc(q.prompt)}</div>
      ${q.kind === 'mc'
        ? `<div class="choices">${q.choices.map((c, i) => `<button data-i="${i}">${esc(c)}</button>`).join('')}</div>`
        : `<input type="text" id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type your answer, Enter to check">
           ${q.keys ? `<div class="keys">${['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'].map((k) => `<button data-k="${k}">${k}</button>`).join('')}</div>` : ''}
           <div class="row"><button class="btn" id="check">Check</button><button class="btn alt" id="idk">I don't know</button></div>`}
      <div class="feedback" id="fb"><span class="muted">${s.boss ? 'Every right answer hits the boss. 3 wrong and you lose.' : 'Right answers earn XP and 🪙. Combos multiply coins.'}</span></div>
    </div>`;
  $('#quit').onclick = (e) => { e.preventDefault(); finish(); };
  if (q.kind === 'mc') view.querySelectorAll('.choices button').forEach((b) => (b.onclick = () => answer(q.choices[b.dataset.i], b)));
  else {
    const inp = $('#ans'); inp.focus();
    inp.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); s.locked ? ask() : answer(inp.value); } };
    $('#check').onclick = () => (s.locked ? ask() : answer(inp.value));
    $('#idk').onclick = () => !s.locked && answer('');
    view.querySelectorAll('.keys button').forEach((b) => (b.onclick = () => { const p = inp.selectionStart; inp.value = inp.value.slice(0, p) + b.dataset.k + inp.value.slice(inp.selectionEnd); inp.focus(); inp.setSelectionRange(p + 1, p + 1); }));
  }
  if (s.boss) tickTimer();
}

function tickTimer() {
  const s = session; clearInterval(s.timer);
  const left = () => Math.max(0, s.boss.seconds - Math.floor((Date.now() - s.start) / 1000));
  const draw = () => { const t = $('#timer'); if (t) t.textContent = `⏱ ${Math.floor(left() / 60)}:${String(left() % 60).padStart(2, '0')}`; if (!left()) { clearInterval(s.timer); finish(); } };
  draw(); s.timer = setInterval(draw, 500);
}

function answer(input, btn) {
  const s = session, q = s.q;
  if (s.locked) return;
  s.locked = true; s.n++;
  const res = q.check(input);
  const fb = $('#fb'), d = day();
  if (res === 'right' || res === 'accent') {
    s.right++; s.combo++; S.total++; d.correct++; d[q.subject]++;
    d.combo = Math.max(d.combo, s.combo); S.bestCombo = Math.max(S.bestCombo, s.combo);
    const mult = s.combo >= 10 ? 3 : s.combo >= 5 ? 2 : 1;
    reward(res === 'right' ? 10 : 6, 2 * mult);
    if (q.id) S.mastery[q.id] = Math.min(5, (S.mastery[q.id] || 0) + 1);
    if (q.topic) { const t = (S.topic[q.topic] ||= { seen: 0, right: 0 }); t.seen++; t.right++; }
    if (s.boss) { s.hp--; const b = $('#boss'); b.classList.add('hit'); setTimeout(() => b.classList.remove('hit'), 150); }
    fb.innerHTML = res === 'right'
      ? `<b class="done">✔ Correct!</b> +${2 * mult} 🪙 ${mult > 1 ? `<span class="combo">(${mult}× combo bonus)</span>` : ''}${q.steps ? `<div class="muted small">${esc(q.steps)}</div>` : ''}`
      : `<b style="color:var(--warn)">≈ Almost — check your umlauts/ß:</b> ${esc(q.answer)}`;
    bumpStreak();
  } else {
    s.combo = 0; s.wrongs.push(q);
    if (q.id) S.mastery[q.id] = 0;
    if (q.topic) { const t = (S.topic[q.topic] ||= { seen: 0, right: 0 }); t.seen++; }
    if (s.boss) s.hearts--;
    fb.innerHTML = `<b style="color:var(--bad)">✘ Answer:</b> ${esc(q.answer)}${q.steps ? `<div class="muted small">${esc(q.steps)}</div>` : ''}`;
  }
  if (btn) { btn.classList.add(res === 'wrong' ? 'wrong' : 'right'); view.querySelectorAll('.choices button').forEach((b) => { if (b.textContent === String(q.answer)) b.classList.add('right'); b.disabled = true; }); }
  const inp = $('#ans'); if (inp) { inp.classList.add(res); inp.readOnly = true; }
  const nextBtn = document.createElement('button'); nextBtn.className = 'btn'; nextBtn.textContent = 'Next →'; nextBtn.style.marginTop = '10px'; nextBtn.onclick = ask; fb.appendChild(document.createElement('br')); fb.appendChild(nextBtn);
  if (q.kind === 'mc') nextBtn.focus(); else inp?.focus();
  save(); checkQuests(); checkBadges(); hud();
  if (q.kind === 'mc' || res !== 'wrong') document.onkeydown = (e) => { if (e.key === 'Enter' && s.locked && q.kind === 'mc') { document.onkeydown = null; ask(); } };
}

function finish() {
  const s = session; if (!s) return;
  clearInterval(s.timer); document.onkeydown = null; session = null;
  const pct = s.n ? Math.round((s.right / s.n) * 100) : 0;
  let extra = '';
  if (s.boss) {
    const won = s.hp <= 0;
    const b = (S.bosses[s.boss.id] ||= { tries: 0, won: false, best: 0 });
    b.tries++; b.best = Math.max(b.best, s.right); day().boss++;
    if (won) { const first = !b.won; b.won = true; reward(150, first ? 200 : 60, first ? `🏆 Boss defeated! +200 🪙` : '🏆 Boss defeated again! +60 🪙'); }
    extra = won ? `<h2>🏆 ${esc(s.boss.name)} defeated!</h2>` : `<h2>💀 The boss won this time</h2><p class="muted">It had ${s.hp} HP left. Practise the topics below and try again.</p>`;
  } else if (s.n >= 10 && pct >= 90) { reward(30, 15, '🎉 90%+ round bonus: +15 🪙'); }
  save(); checkQuests(); checkBadges();
  const wrongs = [...new Map(s.wrongs.map((q) => [q.prompt, q])).values()];
  view.innerHTML = `<div class="play">
    ${extra}<h1>${s.right} / ${s.n} correct (${pct}%)</h1>
    ${wrongs.length ? `<h2>Fix these</h2><table>${wrongs.map((q) => `<tr><td>${esc(q.prompt)}</td><td><b>${esc(q.answer)}</b></td></tr>`).join('')}</table>` : '<p>No mistakes. 🔥</p>'}
    <div class="row" style="margin-top:20px"><button class="btn" id="again">Go again</button><a class="btn alt" href="#home">Home</a><a class="btn gold" href="#arcade">Arcade 🪙 ${S.coins}</a></div></div>`;
  $('#again').onclick = () => s.onEnd ? s.onEnd() : play({ title: s.title, next: s.next, limit: s.limit, boss: s.boss });
  hud();
}

// ---------- question builders ----------
const shuffle = (xs) => xs.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);

function vocabQ(list, dir, word) {
  const [de, en] = word;
  const id = `v:${dir}:${de}`;
  if (dir === 'de-en') return { id, subject: 'german', topic: list, prompt: `${de}`, kind: 'text', answer: en, check: (i) => checkGerman(i, variants(en)), steps: '' };
  return { id, subject: 'german', topic: list, prompt: `${en}`, kind: 'text', keys: true, answer: de, check: (i) => checkGerman(i, [de]), steps: /^(der|die|das) /.test(de) ? 'Learn the article with the noun.' : '' };
}

// Leitner-style queue: weakest words first, wrong words come back 3 questions later.
function vocabNext(list, dir) {
  const words = GERMAN[list];
  const later = [];
  return (s) => {
    const due = later.find((l) => l.at <= s.n); if (due) { later.splice(later.indexOf(due), 1); return vocabQ(list, dir, due.w); }
    if (s.wrongs.length && s.wrongs.at(-1)._req !== true) { const w = s.wrongs.at(-1); w._req = true; later.push({ at: s.n + 3, w: w._w }); }
    const ranked = shuffle(words).sort((a, b) => (S.mastery[`v:${dir}:${a[0]}`] || 0) - (S.mastery[`v:${dir}:${b[0]}`] || 0));
    const w = ranked[Math.floor(Math.random() * Math.min(5, ranked.length))];
    const q = vocabQ(list, dir, w); q._w = w; return q;
  };
}

function drillNext(name) {
  return () => { const d = DRILLS[name](); return { subject: 'german', topic: name, prompt: d.q, kind: 'text', keys: true, answer: d.a[0], check: (i) => checkGerman(i, d.a), steps: d.steps }; };
}

function readingNext(r) {
  const order = shuffle(r.qs);
  return (s) => {
    const q = order[s.n % order.length];
    return { subject: 'german', topic: 'Reading', passage: r.text, prompt: q[0], kind: 'text', answer: q[1][0], steps: q[2],
      check: (i) => { const c = i.toLowerCase().replace(/[.,!?]/g, '').replace(/\s+/g, ' ').trim(); if (!c) return 'wrong'; return q[1].some((a) => c === a || (a.length > 3 && c.includes(a))) ? 'right' : checkGerman(i, q[1]); } };
  };
}

function mathsQ(topic) {
  const g = TOPICS[topic]();
  return { subject: 'maths', topic, prompt: g.q, kind: g.choices ? 'mc' : 'text', choices: g.choices, answer: g.a, steps: g.steps,
    check: (i) => (g.choices ? (i === g.a ? 'right' : 'wrong') : checkMaths(i, g.a) ? 'right' : 'wrong') };
}
const mixedMaths = (topics) => () => mathsQ(topics[Math.floor(Math.random() * topics.length)]);
const germanMix = () => {
  const lists = Object.keys(GERMAN), drills = Object.keys(DRILLS);
  return (s) => {
    const r = Math.random();
    if (r < 0.45) { const l = lists[Math.floor(Math.random() * lists.length)]; const w = GERMAN[l][Math.floor(Math.random() * GERMAN[l].length)]; return vocabQ(l, Math.random() < 0.6 ? 'de-en' : 'en-de', w); }
    if (r < 0.75) return drillNext(drills[Math.floor(Math.random() * drills.length)])();
    const rd = READINGS[Math.floor(Math.random() * READINGS.length)]; return readingNext(rd)({ n: Math.floor(Math.random() * 20) });
  };
};

// ---------- pages ----------
function countdown(due) {
  const ms = Date.parse(due) - Date.now();
  if (ms < 0) return 'Done';
  const d = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5);
  return d ? `${d}d ${h}h` : `${h}h`;
}

function weakest(prefix) {
  const names = prefix === 'maths' ? Object.keys(TOPICS) : [...Object.keys(GERMAN), ...Object.keys(DRILLS)];
  return names.map((n) => { const t = S.topic[n] || { seen: 0, right: 0 }; return [n, t.seen ? t.right / t.seen : -1, t.seen]; }).sort((a, b) => a[1] - b[1] || a[2] - b[2])[0][0];
}

function home() {
  const d = day();
  const arcadeOpen = d.correct >= 20;
  view.innerHTML = `
    <h1>G'day Thomas 👋</h1>
    <p class="muted">Study → earn 🪙 → spend them on your own games in the Arcade. Content synced from your DayMap, Stile, Education Perfect and Maths OneNote on 8 Nov.</p>
    <div class="grid">${[...EXAMS].sort((a, b) => Date.parse(a.due) - Date.parse(b.due)).map((e) => { const days = (Date.parse(e.due) - Date.now()) / 864e5; return `
      <div class="card exam ${days < 4 ? 'urgent' : ''}"><div class="pill">${e.subject}</div><h3 style="margin-top:6px">${esc(e.name)}</h3>
      <div class="big">${countdown(e.due)}</div><div class="small muted">${new Date(e.due).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Australia/Brisbane' })}</div>
      <p class="small muted">${esc(e.note)}</p></div>`; }).join('')}</div>

    <h2>Today's quests</h2>
    <div class="card">${QUESTS.map((q) => { const v = Math.min(q.goal, q.get(d)); return `<div class="quest"><span class="${d.quests[q.id] ? 'done' : ''}">${d.quests[q.id] ? '✅' : '⬜'} ${q.text}</span><span class="small muted">${v}/${q.goal} · +${q.coins} 🪙</span></div>`; }).join('')}
      <p class="small muted">Arcade ${arcadeOpen ? '<b class="done">unlocked</b>' : `unlocks after <b>${20 - d.correct}</b> more correct answers today`}.</p></div>

    <h2>Study next</h2>
    <div class="grid">
      <div class="card click" data-go="ger"><h3>🇩🇪 German</h3><p class="muted small">Weakest: ${esc(weakest('german'))}</p><button class="btn">Mixed German round</button></div>
      <div class="card click" data-go="mat"><h3>📐 Maths</h3><p class="muted small">Weakest: ${esc(weakest('maths'))}</p><button class="btn">Mixed Term 4 round</button></div>
      <div class="card click" data-go="psmt"><h3>📊 PSMT due Fri 13 Nov</h3><p class="muted small">Check your own survey calculations before you write the report.</p><button class="btn">Open PSMT lab</button></div>
    </div>

    <h2>Badges (${S.badges.length}/${BADGES.length})</h2>
    <div class="row">${BADGES.map(([id, icon, name]) => `<div class="badge ${S.badges.includes(id) ? '' : 'off'}"><b>${icon}</b>${esc(name)}</div>`).join('')}</div>
    <p class="small muted" style="margin-top:30px">Sources: ${esc(SOURCES)} <button class="btn alt" id="reset" style="padding:4px 10px;font-size:12px">Reset progress</button></p>`;
  view.querySelector('[data-go=ger]').onclick = () => play({ title: 'Mixed German', next: germanMix(), limit: 20 });
  view.querySelector('[data-go=mat]').onclick = () => play({ title: 'Mixed Maths', next: mixedMaths(Object.keys(TOPICS)), limit: 20 });
  view.querySelector('[data-go=psmt]').onclick = () => (location.hash = '#psmt');
  $('#reset').onclick = () => { if (confirm('Wipe all XP, coins and progress?')) { S = fresh(); save(); route(); } };
}

function mastery(list) {
  const w = GERMAN[list]; const m = w.filter(([de]) => (S.mastery[`v:de-en:${de}`] || 0) >= 2 && (S.mastery[`v:en-de:${de}`] || 0) >= 2).length;
  return [m, w.length];
}

function german() {
  view.innerHTML = `
    <h1>🇩🇪 German – Unit 8: Was feiert man in Deutschland?</h1>
    <p class="muted">The exam is <b>reading comprehension</b> ("locating and responding"): read a German text such as an invitation or letter, and answer questions in English or in German sentences. Practise all three parts below.</p>
    <h2>1 · Word lists (exact Education Perfect + Stile lists)</h2>
    <div class="grid">${Object.keys(GERMAN).map((l) => { const [m, n] = mastery(l); return `
      <div class="card"><h3>${esc(l)}</h3><div class="bar"><i style="width:${(m / n) * 100}%"></i></div><p class="small muted">${m}/${n} mastered both ways</p>
      <div class="row"><button class="btn alt" data-l="${esc(l)}" data-m="learn">Learn</button><button class="btn" data-l="${esc(l)}" data-m="de-en">DE → EN</button><button class="btn" data-l="${esc(l)}" data-m="en-de">EN → DE</button></div></div>`; }).join('')}</div>
    <h2>2 · Skill drills (generated, never run out)</h2>
    <div class="grid">${Object.keys(DRILLS).map((d) => { const t = S.topic[d]; return `<div class="card click" data-d="${esc(d)}"><h3>${esc(d)}</h3><p class="small muted">${t ? `${t.right}/${t.seen} right` : 'Not started'}</p></div>`; }).join('')}</div>
    <h2>3 · Reading comprehension (exam style)</h2>
    <div class="grid">${READINGS.map((r, i) => `<div class="card click" data-r="${i}"><h3>📄 ${esc(r.title)}</h3><p class="small muted">${r.qs.length} questions</p></div>`).join('')}</div>
    <p class="small muted">Tip from your teacher's Week 5 lesson: <i>halb acht</i> = 7:30 (half TO eight). Dates after <i>am</i> end in -en: am einunddreißigsten März.</p>`;
  view.querySelectorAll('[data-l]').forEach((b) => (b.onclick = () => b.dataset.m === 'learn' ? learn(b.dataset.l) : play({ title: `${b.dataset.l} (${b.dataset.m})`, next: vocabNext(b.dataset.l, b.dataset.m), limit: Math.min(25, GERMAN[b.dataset.l].length + 5) })));
  view.querySelectorAll('[data-d]').forEach((c) => (c.onclick = () => play({ title: c.dataset.d, next: drillNext(c.dataset.d), limit: 15 })));
  view.querySelectorAll('[data-r]').forEach((c) => { const r = READINGS[c.dataset.r]; c.onclick = () => play({ title: r.title, next: readingNext(r), limit: r.qs.length }); });
}

// Flashcards: flip, then rate yourself. Small XP, no coins (coins are for recall, not peeking).
function learn(list) {
  const words = shuffle(GERMAN[list]); let i = 0, flipped = false;
  const draw = () => {
    if (i >= words.length) { reward(20, 0, `📚 Finished learning ${list}. Now test yourself for coins!`); return german(); }
    const [de, en] = words[i];
    view.innerHTML = `<div class="play"><a href="#german" class="muted">✕ ${esc(list)}</a><p class="muted">${i + 1} / ${words.length} — click the card to flip</p>
      <div class="flash"><div class="face" id="face">${esc(flipped ? en : de)}</div></div>
      <div class="row" style="margin-top:14px"><button class="btn alt" id="again">Again</button><button class="btn good" id="got">Got it →</button></div></div>`;
    $('#face').onclick = () => { flipped = !flipped; draw(); };
    $('#again').onclick = () => { words.push(words[i]); i++; flipped = false; draw(); };
    $('#got').onclick = () => { i++; flipped = false; S.xp += 1; save(); hud(); draw(); };
  };
  draw();
}

function maths() {
  const t4 = Object.keys(TOPICS);
  view.innerHTML = `
    <h1>📐 Maths – Term 4 (Cambridge Essential 8)</h1>
    <p class="muted">These are exactly the sections on Mr Hives' Term 4 planner: percentages 3H–3K, ratios 6A–6B, rates 6D–6G and statistics 8B–8F. Exam: Week 8 (Wed 25 Nov).</p>
    <div class="row"><button class="btn" id="mix">Mixed exam round (20)</button><button class="btn alt" id="stat">Statistics only (PSMT prep)</button></div>
    <div class="grid" style="margin-top:16px">${t4.map((n) => { const t = S.topic[n]; const p = t ? Math.round((t.right / t.seen) * 100) : 0; return `
      <div class="card click" data-t="${esc(n)}"><h3>${esc(n)}</h3><div class="bar"><i style="width:${p}%;background:${p >= 80 ? 'var(--good)' : p >= 50 ? 'var(--warn)' : 'var(--bad)'}"></i></div><p class="small muted">${t ? `${t.right}/${t.seen} right (${p}%)` : 'Not started'}</p></div>`; }).join('')}</div>
    <p class="small muted">Answers: round to 2 decimal places when asked. Ratios as 3:2. Money without the $ is fine.</p>`;
  $('#mix').onclick = () => play({ title: 'Term 4 mix', next: mixedMaths(t4), limit: 20 });
  $('#stat').onclick = () => play({ title: 'Statistics', next: mixedMaths(t4.filter((n) => n.startsWith('8'))), limit: 20 });
  view.querySelectorAll('[data-t]').forEach((c) => (c.onclick = () => play({ title: c.dataset.t, next: () => mathsQ(c.dataset.t), limit: 12 })));
}

// ---------- PSMT lab ----------
const GROUPS = [['8E (your class)', (c) => c === '8E'], ['8G (other class)', (c) => c === '8G'], ['All Year 8s', () => true]];
function groupData(q, test) { return Object.entries(SURVEY).filter(([c]) => test(c)).flatMap(([, rows]) => rows.map((r) => r[q])); }
function modes(xs) { const f = {}; xs.forEach((x) => (f[x] = (f[x] || 0) + 1)); const m = Math.max(...Object.values(f)); return Object.keys(f).filter((k) => f[k] === m).map(Number); }
function skew(xs) {
  const m = stats.mean(xs), md = stats.median(xs), s = stats.sorted(xs); const spread = s.at(-1) - s[0] || 1;
  return (m - md) / spread > 0.05 ? 'positively skewed' : (md - m) / spread > 0.05 ? 'negatively skewed' : 'roughly symmetric';
}

function histogram(xs, q) {
  const s = stats.sorted(xs), lo = s[0], hi = s.at(-1);
  const bins = q === 1 ? 8 : Math.min(12, hi - lo + 1);
  const w = Math.max(1, Math.ceil((hi - lo + 1) / bins));
  const counts = Array(bins).fill(0); xs.forEach((x) => counts[Math.min(bins - 1, Math.floor((x - lo) / w))]++);
  const max = Math.max(...counts), W = 600, H = 200, bw = (W - 40) / bins;
  return `<svg class="hist" viewBox="0 0 ${W} ${H + 30}">${counts.map((c, i) => `<rect x="${30 + i * bw}" y="${H - (c / max) * (H - 10)}" width="${bw - 2}" height="${(c / max) * (H - 10)}" fill="#7c5cff"/><text x="${30 + i * bw + bw / 2}" y="${H + 14}" fill="#9aa0c3" font-size="10" text-anchor="middle">${w === 1 ? lo + i * w : `${lo + i * w}–${lo + (i + 1) * w - 1}`}</text>${c ? `<text x="${30 + i * bw + bw / 2}" y="${H - (c / max) * (H - 10) - 3}" fill="#eef0ff" font-size="10" text-anchor="middle">${c}</text>` : ''}`).join('')}</svg>`;
}

function psmt() {
  const qi = Number(location.hash.split('/')[1] || 0);
  const st = (S.psmt[qi] ||= { cells: {}, shapes: {}, done: false });
  const fields = [['n', 'Count'], ['mean', 'Mean (2 d.p.)'], ['median', 'Median'], ['mode', 'Mode'], ['range', 'Range']];
  const truth = GROUPS.map(([, t]) => { const xs = groupData(qi, t); const s = stats.sorted(xs); return { xs, n: xs.length, mean: stats.r2(stats.mean(xs)), median: stats.median(xs), mode: modes(xs), range: s.at(-1) - s[0] }; });
  const allCells = GROUPS.length * fields.length, okCells = Object.values(st.cells).filter(Boolean).length;
  const unlocked = okCells === allCells;
  view.innerHTML = `
    <h1>📊 PSMT lab – ${esc(PSMT.question)}</h1>
    <p class="muted">Due <b>Fri 13 Nov</b> on DayMap. ${esc(PSMT.rules)}</p>
    <div class="row">${SURVEY_QUESTIONS.map((q, i) => `<a class="btn ${i === qi ? '' : 'alt'}" href="#psmt/${i}">${S.psmt[i]?.done ? '✅ ' : ''}Q${i + 1}: ${esc(q)}</a>`).join('')}</div>
    <h2>Step 1 · Calculate it yourself (+5 🪙 per correct cell)</h2>
    <p class="small muted">Use your spreadsheet "8E Data collection (Hives)(1-196).xlsx" in OneDrive → Yr 8 → Term 4. Type your answer and press Enter. For more than one mode, type them separated by commas.</p>
    <div class="card" style="overflow-x:auto"><table><tr><th></th>${fields.map(([, l]) => `<th>${l}</th>`).join('')}</tr>
      ${GROUPS.map(([g], gi) => `<tr><th>${g}</th>${fields.map(([f]) => { const k = `${gi}:${f}`; return `<td><input type="text" data-k="${k}" value="${esc(st.cells[k] ? (f === 'mode' ? truth[gi].mode.join(', ') : truth[gi][f]) : '')}" ${st.cells[k] ? 'readonly style="border-color:var(--good)"' : ''} size="7"></td>`; }).join('')}</tr>`).join('')}</table>
      <p class="small muted">${okCells}/${allCells} correct</p></div>
    <h2>Step 2 · Shape of each distribution ${unlocked ? '' : '🔒 (finish step 1 to unlock the histograms)'}</h2>
    ${unlocked ? `<div class="grid">${GROUPS.map(([g], gi) => `<div class="card"><h3>${g}</h3>${histogram(truth[gi].xs, qi)}
      <div class="row">${['positively skewed', 'roughly symmetric', 'negatively skewed'].map((sh) => `<button class="btn ${st.shapes[gi] === sh ? 'good' : 'alt'}" data-g="${gi}" data-s="${sh}" style="padding:6px 10px;font-size:13px">${sh}</button>`).join('')}</div>
      ${st.shapes[gi] ? `<p class="small ${st.shapes[gi] === skew(truth[gi].xs) ? 'done' : ''}">${st.shapes[gi] === skew(truth[gi].xs) ? '✔ Matches the data (mean vs median agrees).' : `Hmm. Mean ${truth[gi].mean} vs median ${truth[gi].median}: where is the long tail?`}</p>` : ''}</div>`).join('')}</div>` : ''}
    <h2>Step 3 · Report checklist (from the task sheet)</h2>
    <div class="card">${PSMT.sections.map(([h, t]) => `<div class="quest"><span><b>${esc(h)}</b><br><span class="small muted">${esc(t)}</span></span></div>`).join('')}</div>
    <h2>Marking criteria</h2><ul>${PSMT.criteria.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
    <p class="small muted">Sentence starters you can adapt in your own words: "The mean for 8E was … compared with … for all Year 8s, a difference of …" · "The data is positively skewed because …" · "A limitation of our survey is …" · "To improve this investigation, I would …".</p>`;
  view.querySelectorAll('input[data-k]').forEach((inp) => (inp.onkeydown = (e) => {
    if (e.key !== 'Enter' || inp.readOnly) return;
    const [gi, f] = inp.dataset.k.split(':'); const t = truth[gi];
    const ok = f === 'mode' ? (() => { const got = inp.value.split(/[ ,]+/).filter(Boolean).map(Number).sort((a, b) => a - b); return got.length === t.mode.length && got.every((v, i) => v === [...t.mode].sort((a, b) => a - b)[i]); })() : checkMaths(inp.value, t[f]);
    if (ok) { st.cells[inp.dataset.k] = 1; day().maths++; S.total++; reward(15, 5, '✔ Correct'); if (Object.values(st.cells).filter(Boolean).length === allCells) toast('🔓 Histograms unlocked!'); save(); psmt(); }
    else { inp.style.borderColor = 'var(--bad)'; toast('Not quite: check your working (order the data, count carefully).'); }
  }));
  view.querySelectorAll('[data-g]').forEach((b) => (b.onclick = () => {
    const gi = b.dataset.g; const first = !st.shapes[gi]; st.shapes[gi] = b.dataset.s;
    if (first && b.dataset.s === skew(truth[gi].xs)) reward(15, 10);
    if (GROUPS.every((_, i) => st.shapes[i] === skew(truth[i].xs)) && !st.done) { st.done = true; reward(80, 60, `🔬 PSMT question ${qi + 1} complete! +60 🪙`); }
    save(); checkBadges(); psmt();
  }));
}

// ---------- bosses ----------
const BOSSES = [
  { id: 'ger', name: 'Der Geburtstagsdrache', icon: '🐉', hp: 15, seconds: 600, title: 'German exam boss', make: germanMix },
  { id: 'psmt', name: 'The Skewed Statistic', icon: '👾', hp: 12, seconds: 480, title: 'Statistics boss', make: () => mixedMaths(Object.keys(TOPICS).filter((n) => n.startsWith('8'))) },
  { id: 'mat', name: 'The Percentage Titan', icon: '🗿', hp: 18, seconds: 900, title: 'Term 4 Maths exam boss', make: () => mixedMaths(Object.keys(TOPICS)) },
];
function bosses() {
  view.innerHTML = `<h1>⚔️ Boss fights</h1><p class="muted">Timed mock exams. Every right answer hits the boss; 3 wrong answers or running out of time and you lose. First win: +200 🪙 and a badge.</p>
    <div class="grid">${BOSSES.map((b) => { const r = S.bosses[b.id]; return `<div class="card click" data-b="${b.id}"><div class="boss">${b.icon}</div><h3>${esc(b.name)}</h3><p class="small muted">${esc(b.title)} · ${b.hp} HP · ${b.seconds / 60} min</p><p class="small">${r ? `${r.won ? '🏆 Defeated' : '💀 Not yet beaten'} · ${r.tries} tries · best ${r.best} hits` : 'Not fought yet'}</p><button class="btn">Fight</button></div>`; }).join('')}</div>`;
  view.querySelectorAll('[data-b]').forEach((c) => { const b = BOSSES.find((x) => x.id === c.dataset.b); c.onclick = () => play({ title: b.name, next: b.make(), limit: b.hp + 3, boss: b }); });
}

// ---------- arcade ----------
const PER_MIN = 25;
function arcade() {
  const open = day().correct >= 20;
  view.innerHTML = `<h1>🕹️ Arcade</h1>
    <p class="muted">Your own games. Play time costs <b>${PER_MIN} 🪙 per minute</b> (about 3 minutes of study per minute of play). ${open ? '' : `<b>Locked today:</b> get ${20 - day().correct} more answers right first.`}</p>
    <div class="card row" style="justify-content:space-between"><span>Banked play time: <b>${Math.floor(S.playSec / 60)}:${String(S.playSec % 60).padStart(2, '0')}</b> · You have <b>${S.coins} 🪙</b></span>
      <span class="row">${[5, 10, 15].map((m) => `<button class="btn gold" data-buy="${m}" ${S.coins < m * PER_MIN ? 'disabled' : ''}>Buy ${m} min (${m * PER_MIN} 🪙)</button>`).join('')}</span></div>
    <div class="grid" style="margin-top:16px">${GAMES.map((g) => `<div class="card ${open && S.playSec > 0 ? 'click' : 'locked'}" data-g="${g.id}"><h3>🎮 ${esc(g.name)}</h3><p class="small muted">${open ? (S.playSec > 0 ? 'Click to play' : 'Buy play time first') : '🔒 Study first'}</p></div>`).join('')}</div>`;
  view.querySelectorAll('[data-buy]').forEach((b) => (b.onclick = () => { const m = Number(b.dataset.buy); if (S.coins < m * PER_MIN) return; S.coins -= m * PER_MIN; S.playSec += m * 60; save(); hud(); arcade(); }));
  view.querySelectorAll('[data-g]').forEach((c) => (c.onclick = () => { if (!open || S.playSec <= 0) return toast(open ? 'Buy play time first 🪙' : 'Get 20 answers right today to unlock 🔒'); launch(GAMES.find((g) => g.id === c.dataset.g)); }));
}

function launch(game) {
  const wrap = document.createElement('div'); wrap.className = 'arcade-frame';
  wrap.innerHTML = `<header><span>🎮 ${esc(game.name)}</span><span id="left"></span><button class="btn alt" id="stop">Stop & save time</button></header><iframe src="${game.url}" allow="autoplay; fullscreen; gamepad; cross-origin-isolated" allowfullscreen></iframe>`;
  document.body.appendChild(wrap);
  const close = () => { clearInterval(tick); wrap.remove(); save(); hud(); arcade(); };
  const tick = setInterval(() => {
    S.playSec = Math.max(0, S.playSec - 1);
    $('#left', wrap).textContent = `⏱ ${Math.floor(S.playSec / 60)}:${String(S.playSec % 60).padStart(2, '0')} left`;
    if (S.playSec % 10 === 0) save();
    if (!S.playSec) { close(); toast('⏰ Play time is up. Back to study to earn more!'); }
  }, 1000);
  $('#stop', wrap).onclick = close;
}

// ---------- router ----------
const ROUTES = { home, german, maths, psmt, boss: bosses, arcade };
function route() {
  if (session) { clearInterval(session.timer); session = null; }
  document.onkeydown = null;
  const r = (location.hash.slice(1).split('/')[0]) || 'home';
  (ROUTES[r] || home)(); hud(); window.scrollTo(0, 0);
}
addEventListener('hashchange', route);
day(); route();
