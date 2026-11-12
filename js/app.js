import { EXAMS, GERMAN, READINGS, SURVEY, SURVEY_QUESTIONS, GAMES, PSMT, SOURCES } from './data.js';
import { TOPICS, checkMaths, nearMaths, stats } from './maths.js';
import { DRILLS, checkGerman, checkMeaning, variants } from './german.js';
import { LESSONS, READING_TIPS, READ_ALONG, mathsTerms } from './teach.js';
import { report } from './report.js';
import { TRICKS, WORD_TIPS, WORD_HOOKS, READING_TRICKS, LETTER_TRICKS, PSMT_TRICKS } from './tricks.js';

// ---------- state ----------
const KEY = 'examquest.v1';
const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' });
const fresh = () => ({ xp: 0, coins: 0, streak: { last: '', n: 0 }, day: {}, mastery: {}, topic: {}, badges: [], bosses: {}, playSec: 0, total: 0, bestCombo: 0, psmt: {}, claimed: {}, lessons: {}, study: {} });
let S = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || '{}'));
const save = () => localStorage.setItem(KEY, JSON.stringify(S));
function day() {
  if (S.day.date !== today()) S.day = { date: today(), correct: 0, german: 0, maths: 0, boss: 0, combo: 0, quests: {} };
  return S.day;
}
const level = (xp = S.xp) => Math.floor(Math.sqrt(xp / 60)) + 1;
const xpFor = (l) => 60 * (l - 1) ** 2;

const $ = (sel, el = document) => el.querySelector(sel);
// German pronunciation through the browser's built-in voices. Any element with data-say reads its text.
function speak(text) {
  if (!('speechSynthesis' in window)) return toast('This browser can\'t read aloud.');
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text), voice = speechSynthesis.getVoices().find((v) => v.lang.startsWith('de'));
  u.lang = 'de-DE'; u.rate = 0.85; if (voice) u.voice = voice;
  speechSynthesis.speak(u);
}
const hearBtn = (text) => `<button class="btn alt hear" data-say="${esc(text)}">Hear it</button>`;
document.addEventListener('click', (e) => { const b = e.target.closest?.('[data-say]'); if (b) { e.stopPropagation(); speak(b.dataset.say); } });
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const view = $('#view');

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), 2600);
}

// ---------- study time ----------
// Counts a second while a study screen is open, the tab is visible and you did something in the
// last 90 seconds. `studying` is the subject of the current screen, or null (home, arcade, results).
let studying = null, lastActive = Date.now();
for (const ev of ['keydown', 'pointerdown', 'input', 'wheel']) addEventListener(ev, () => (lastActive = Date.now()), true);
const studied = (date) => (S.study[date] ||= { german: 0, maths: 0, total: 0 });
const mins = (sec) => (sec >= 3600 ? `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}m` : `${Math.floor(sec / 60)}m`);
setInterval(() => {
  if (!studying || document.visibilityState !== 'visible' || Date.now() - lastActive > 90e3) return;
  const d = studied(today()); d[studying]++; d.total++;
  if (d.total % 10 === 0) save();
  if (d.total % 60 === 0) hud();
}, 1000);
function lastDays(n) {
  return Array.from({ length: n }, (_, i) => new Date(Date.now() - (n - 1 - i) * 864e5).toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' }));
}

function hud() {
  const l = level(), lo = xpFor(l), hi = xpFor(l + 1);
  $('#hud-level').textContent = `Lv ${l}`;
  $('#hud-xp i').style.width = `${((S.xp - lo) / (hi - lo)) * 100}%`;
  $('#hud-coins').textContent = `${S.coins} coins`;
  $('#hud-streak').textContent = `${S.streak.n} day streak`;
  $('#hud-time').textContent = `${mins(studied(today()).total)} today`;
  document.querySelectorAll('nav a').forEach((a) => a.classList.toggle('on', a.getAttribute('href') === location.hash.split('/')[0]));
}

function reward(xp, coins, why) {
  const before = level();
  S.xp += xp; S.coins += coins; save(); hud();
  if (level() > before) { toast(`Level ${level()} reached. +50 bonus coins`); S.coins += 50; save(); hud(); }
  else if (why) toast(why);
}

// Streak counts days with at least 20 correct answers.
function bumpStreak() {
  const d = day();
  if (d.correct !== 20) return;
  const y = new Date(Date.now() - 864e5).toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' });
  S.streak.n = S.streak.last === y ? S.streak.n + 1 : S.streak.last === today() ? S.streak.n : 1;
  S.streak.last = today();
  reward(20, 20, `Streak day ${S.streak.n}. Arcade unlocked for today.`);
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
  for (const q of QUESTS) if (!d.quests[q.id] && q.get(d) >= q.goal) { d.quests[q.id] = 1; reward(30, q.coins, `Quest done: ${q.text} (+${q.coins} coins)`); }
  if (QUESTS.every((q) => d.quests[q.id]) && !d.quests.all) { d.quests.all = 1; reward(100, 100, 'All daily quests done. +100 coins'); }
}

const BADGES = [
  ['first', '1', 'First correct answer', () => S.total >= 1],
  ['c100', '100', '100 correct answers', () => S.total >= 100],
  ['c500', '500', '500 correct answers', () => S.total >= 500],
  ['combo10', '10×', '10× combo', () => S.bestCombo >= 10],
  ['combo25', '25×', '25× combo', () => S.bestCombo >= 25],
  ['lv5', 'L5', 'Reach level 5', () => level() >= 5],
  ['lv10', 'L10', 'Reach level 10', () => level() >= 10],
  ['streak3', '3d', '3-day streak', () => S.streak.n >= 3],
  ['bger', 'DE', 'Beat the German boss', () => S.bosses.ger?.won],
  ['bmat', 'MA', 'Beat the Maths boss', () => S.bosses.mat?.won],
  ['bpsmt', 'ST', 'Beat the Statistics boss', () => S.bosses.psmt?.won],
  ['psmt', 'PS', 'Finish the PSMT lab (all 3 questions)', () => [0, 1, 2].every((i) => S.psmt[i]?.done)],
  ['vocab', '50', 'Master 50 German words', () => Object.entries(S.mastery).filter(([k, v]) => k.startsWith('v:') && v >= 3).length >= 50],
];
function checkBadges() {
  for (const [id, , name, ok] of BADGES) if (!S.badges.includes(id) && ok()) { S.badges.push(id); save(); toast(`Badge unlocked: ${name} (+30 coins)`); S.coins += 30; }
}

// ---------- question engine ----------
// A question: { id, prompt, passage?, dict?, kind: 'text'|'mc', choices?, check(input) -> 'right'|'accent'|'wrong', answer,
//   steps (array of small steps, or a sentence string), teach?() -> steps, retype?, keys?, subject, topic?, similar?() -> question }
// Steps are strings, or { html } for pre-built markup.
let session = null;
const tools = { calc: false, work: false, expr: '' };
const WORK_KEY = 'examquest.work.';
const stepList = (q) => (q.teach ? q.teach() : Array.isArray(q.steps) ? q.steps : String(q.steps || '').split(/(?<=[.!?])\s+|;\s+/)).filter(Boolean);
const stepHtml = (x) => (typeof x === 'string' ? esc(x) : x.html);
// German words in a mini dictionary can be clicked to hear them (maths terms are English, so not).
const dictTable = (rows, say = true) => `<table class="dict">${rows.map(([de, en]) => `<tr><td><b${say ? ` class="say" data-say="${esc(de)}" title="Click to hear it"` : ''}>${esc(de)}</b></td><td>${esc(en)}</td></tr>`).join('')}</table>`;

function play({ title, next, limit = 20, boss = null, onEnd }) {
  session = { title, next, limit, boss, onEnd, n: 0, right: 0, combo: 0, q: null, locked: false, hp: boss ? boss.hp : 0, hearts: boss ? 3 : 0, start: Date.now(), wrongs: [], pending: null, advance: null };
  // Enter checks the answer, then steps through the explanation, then moves on. Typing ? opens help.
  document.onkeydown = (e) => {
    const s = session; if (!s) return;
    if (e.target.closest?.('#toolbox, .retype')) return;
    if (e.key === '?') { if (!s.locked) { e.preventDefault(); s.help?.(); } return; }
    if (e.key !== 'Enter') return;
    if (!s.locked) { if (e.target.id === 'ans') { e.preventDefault(); answer(e.target.value); } return; }
    e.preventDefault(); s.advance?.();
  };
  ask();
}

function ask() {
  const s = session;
  if (!s.pending && (s.n >= s.limit || (s.boss && (s.hp <= 0 || s.hearts <= 0)))) return finish();
  s.q = s.pending || s.next(s); s.pending = null;
  if (!s.q) return finish();
  s.locked = false; s.advance = null; s.hint = 0;
  const q = s.q, maths = q.subject === 'maths';
  studying = q.subject;
  const terms = maths ? mathsTerms(q.prompt) : [];
  const hints = stepList(q).length > 1;
  view.innerHTML = `
    <div class="play">
      <div class="row playhead">
        <span><a href="#" id="quit" class="quit">Exit</a><span class="crumb">${esc(s.title)}</span></span>
        <span class="muted small">${s.combo >= 3 ? `<span class="combo">${s.combo}× combo</span> · ` : ''}${s.n + 1} / ${Math.max(s.limit, s.n + 1)}</span>
      </div>
      <div class="bar" style="margin-top:8px"><i style="width:${Math.min(1, s.n / s.limit) * 100}%"></i></div>
      ${s.boss ? `<div class="bossbar"><div class="boss" id="boss">${s.boss.icon}</div><div class="bossinfo"><div class="row" style="justify-content:space-between"><b>${esc(s.boss.name)}</b><span class="small muted">${s.hp} / ${s.boss.hp} HP</span></div><div class="hp"><i style="width:${(s.hp / s.boss.hp) * 100}%"></i></div><div class="row small muted" style="justify-content:space-between;margin-top:6px"><span class="lives">Lives ${'<i class="on"></i>'.repeat(s.hearts)}${'<i></i>'.repeat(3 - s.hearts)}</span><span id="timer"></span></div></div></div>` : ''}
      ${q.passage ? `<details open><summary class="muted">The letter</summary><div class="passage">${esc(q.passage)}</div><div class="row" style="margin-top:6px">${hearBtn(q.passage)}</div></details>` : ''}
      <div class="q">${esc(q.prompt)}</div>
      <div class="row tools">
        ${terms.length || q.dict ? '<button class="tool" id="t-means">What does this mean?</button>' : ''}
        ${hints ? '<button class="tool" id="t-hint">Hint</button>' : ''}
        ${maths ? `<button class="tool ${tools.calc ? 'on' : ''}" id="t-calc">Calculator</button><button class="tool ${tools.work ? 'on' : ''}" id="t-work">Working out</button>` : ''}
        ${LESSONS[q.topic] && !s.boss ? '<button class="tool" id="t-teach">Teach me this</button>' : ''}
      </div>
      <div id="helpbox"></div>
      <div id="toolbox"></div>
      ${q.kind === 'mc'
        ? `<div class="choices">${q.choices.map((c, i) => `<button data-i="${i}">${esc(c)}</button>`).join('')}</div>
           <div class="row" style="margin-top:10px"><button class="btn alt" id="idk">I don't know</button></div>`
        : `<input type="text" id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type your answer, Enter to check, ? for help">
           ${q.keys ? `<div class="keys">${['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'].map((k) => `<button data-k="${k}">${k}</button>`).join('')}</div>` : ''}
           <div class="row"><button class="btn" id="check">Check</button><button class="btn alt" id="idk">I don't know</button></div>`}
      <div class="feedback" id="fb"><span class="muted">${s.boss ? 'Every right answer hits the boss. 3 wrong and you lose.' : 'Stuck? Type <b>?</b> for help, or press "I don\'t know" and I\'ll show you how, one step at a time.'}</span></div>
    </div>`;
  $('#quit').onclick = (e) => { e.preventDefault(); finish(); };
  $('#idk').onclick = () => !s.locked && answer('');
  if (q.kind === 'mc') view.querySelectorAll('.choices button').forEach((b) => (b.onclick = () => answer(q.choices[b.dataset.i], b)));
  else {
    const inp = $('#ans'); inp.focus();
    $('#check').onclick = () => (s.locked ? s.advance?.() : answer(inp.value));
    view.querySelectorAll('.keys button').forEach((b) => (b.onclick = () => { const p = inp.selectionStart; inp.value = inp.value.slice(0, p) + b.dataset.k + inp.value.slice(inp.selectionEnd); inp.focus(); inp.setSelectionRange(p + 1, p + 1); }));
  }
  const help = $('#helpbox');
  help.innerHTML = '<div id="h-means"></div><div id="h-hints"></div>';
  const showMeans = () => {
    $('#h-means').innerHTML = `<div class="card help"><b>Mini dictionary</b>${terms.length ? `<p class="small muted">What the words in this question mean:</p>${dictTable(terms, false)}` : ''}${q.dict ? `<p class="small muted">Click a German word to hear it.</p>${dictTable(q.dict)}` : ''}</div>`;
  };
  const showHint = () => {
    const steps = stepList(q); if (s.locked || s.hint >= steps.length - 1) return false;
    q.hinted = true;
    const box = $('#h-hints');
    if (!box.innerHTML) box.innerHTML = '<div class="card help"><b>Hints</b> <span class="small muted">(a hinted answer earns 1 coin)</span><ol class="steps hints"></ol></div>';
    box.querySelector('.hints').insertAdjacentHTML('beforeend', `<li>${stepHtml(steps[s.hint++])}</li>`);
    if (s.hint >= steps.length - 1) $('#t-hint').disabled = true;
    return true;
  };
  $('#t-means') && ($('#t-means').onclick = showMeans);
  $('#t-hint') && ($('#t-hint').onclick = showHint);
  // "?" shows what the words mean and the next hint; if there's nothing left, it says what to do.
  s.help = () => {
    if (terms.length || q.dict) showMeans();
    if (!showHint() && !(terms.length || q.dict)) $('#h-hints').innerHTML = `<div class="card help">No more hints for this one. Press <b>I don't know</b> and I'll show you how it's done${LESSONS[q.topic] && !s.boss ? ', or <b>Teach me this</b> for the full lesson' : ''}.</div>`;
  };
  $('#t-teach') && ($('#t-teach').onclick = () => { session = null; lesson(q.topic); });
  const ansBox = $('#ans');
  if (ansBox) ansBox.oninput = () => { if (ansBox.value.includes('?')) { ansBox.value = ansBox.value.replace(/\?/g, ''); s.help(); } }; // phones may skip keydown
  if (maths) {
    $('#t-calc').onclick = () => { tools.calc = !tools.calc; $('#t-calc').classList.toggle('on', tools.calc); drawTools(); };
    $('#t-work').onclick = () => { tools.work = !tools.work; $('#t-work').classList.toggle('on', tools.work); drawTools(); };
    drawTools();
  }
  if (s.boss) tickTimer();
}

// ---------- calculator & working-out pad ----------
// Safe arithmetic: numbers, + − × ÷ ^ %, brackets. No eval.
function calculate(text) {
  const src = text.replace(/×|x|\*/g, '*').replace(/÷|\//g, '/').replace(/−|–/g, '-').replace(/,/g, '').replace(/\s+/g, '');
  let i = 0;
  const expr = () => { let v = term(); while (src[i] === '+' || src[i] === '-') v = src[i++] === '+' ? v + term() : v - term(); return v; };
  const term = () => { let v = power(); while (src[i] === '*' || src[i] === '/' || src[i] === '(') { if (src[i] === '(') v *= power(); else v = src[i++] === '*' ? v * power() : v / power(); } return v; };
  const power = () => { const v = unary(); if (src[i] === '^') { i++; return v ** power(); } return v; };
  const unary = () => { if (src[i] === '-') { i++; return -unary(); } if (src[i] === '+') { i++; return unary(); } let v = atom(); while (src[i] === '%') { i++; v /= 100; } return v; };
  const atom = () => {
    if (src[i] === '(') { i++; const v = expr(); if (src[i] !== ')') throw new Error('missing )'); i++; return v; }
    const m = src.slice(i).match(/^\d*\.?\d+/); if (!m) throw new Error('number expected');
    i += m[0].length; return Number(m[0]);
  };
  const v = expr();
  if (i < src.length || !Number.isFinite(v)) throw new Error('bad input');
  return Math.round(v * 1e10) / 1e10;
}

function drawTools() {
  const box = $('#toolbox'); if (!box) return;
  box.innerHTML = `${tools.calc ? `<div class="card calc"><input type="text" id="calc-in" placeholder="e.g. 0.15 × 80" value="${esc(tools.expr)}" autocomplete="off"><div class="calc-out" id="calc-out">&nbsp;</div>
      <div class="keypad">${['7', '8', '9', '÷', '(', '4', '5', '6', '×', ')', '1', '2', '3', '−', '^', '0', '.', '%', '+', 'Del', 'C', '='].map((k) => `<button data-c="${k}" class="${k === '=' ? 'eq' : ''}">${k}</button>`).join('')}</div>
      <button class="btn alt" id="calc-use" style="margin-top:8px">Put result in my answer</button></div>` : ''}
    ${tools.work ? `<div class="card work"><b>Working out</b> <span class="small muted">type or draw; nothing here is marked</span>
      <textarea id="work-txt" rows="4" placeholder="Write your steps here…">${esc(localStorage.getItem(WORK_KEY + 'txt') || '')}</textarea>
      <canvas id="work-pad" height="220"></canvas><div class="row"><button class="btn alt" id="work-clear">Clear drawing</button><button class="btn alt" id="work-clear-txt">Clear writing</button></div></div>` : ''}`;
  if (tools.calc) {
    const inp = $('#calc-in'), out = $('#calc-out');
    const run = () => { try { const v = calculate(inp.value); out.textContent = `= ${v}`; tools.last = v; } catch { out.textContent = inp.value.trim() ? 'Check the sum (brackets, signs)' : '\u00a0'; tools.last = null; } };
    inp.oninput = () => { tools.expr = inp.value; };
    inp.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); run(); } };
    box.querySelectorAll('[data-c]').forEach((b) => (b.onclick = () => {
      const k = b.dataset.c;
      if (k === '=') return run();
      inp.value = k === 'C' ? '' : k === 'Del' ? inp.value.slice(0, -1) : inp.value + k;
      tools.expr = inp.value; if (k === 'C') out.innerHTML = '&nbsp;';
    }));
    $('#calc-use').onclick = () => { run(); const a = $('#ans'); if (a && tools.last != null && !session?.locked) { a.value = tools.last; a.focus(); } };
  }
  if (tools.work) {
    // Writing and drawing are kept in localStorage, so they survive new questions, switching the
    // calculator on/off and reloading, until you clear them.
    const t = $('#work-txt'); t.oninput = () => localStorage.setItem(WORK_KEY + 'txt', t.value);
    $('#work-clear-txt').onclick = () => { t.value = ''; localStorage.removeItem(WORK_KEY + 'txt'); };
    const c = $('#work-pad'), g = c.getContext('2d');
    c.width = c.clientWidth || 600;
    const saved = localStorage.getItem(WORK_KEY + 'pad');
    if (saved) { const img = new Image(); img.onload = () => g.drawImage(img, 0, 0); img.src = saved; }
    g.lineWidth = 2.5; g.lineCap = 'round'; g.strokeStyle = '#e6e9ef';
    let down = false;
    const at = (e) => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) * (c.width / r.width), (e.clientY - r.top) * (c.height / r.height)]; };
    c.onpointerdown = (e) => { down = true; c.setPointerCapture(e.pointerId); g.beginPath(); g.moveTo(...at(e)); };
    c.onpointermove = (e) => { if (down) { g.lineTo(...at(e)); g.stroke(); } };
    c.onpointerup = c.onpointercancel = () => { if (!down) return; down = false; try { localStorage.setItem(WORK_KEY + 'pad', c.toDataURL()); } catch {} };
    $('#work-clear').onclick = () => { g.clearRect(0, 0, c.width, c.height); localStorage.removeItem(WORK_KEY + 'pad'); };
  }
}

// Keyboard: 1-4 picks a multiple-choice answer; when the calculator is open, number/operator keys
// typed outside a text box go into it (Enter = work it out).
addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const t = e.target, typing = t.matches?.('input, textarea');
  if (typing) return;
  const btns = [...view.querySelectorAll('.choices button')];
  if (/^[1-9]$/.test(e.key) && btns.length) {
    const b = btns[Number(e.key) - 1];
    if (b && !b.disabled) { e.preventDefault(); e.stopImmediatePropagation(); b.click(); }
    return;
  }
  const inp = $('#calc-in'); if (!inp) return;
  const map = { '*': '×', x: '×', '/': '÷', '-': '−' };
  if (/^[0-9.+()^%]$/.test(e.key) || map[e.key]) { e.preventDefault(); inp.value += map[e.key] || e.key; tools.expr = inp.value; inp.focus(); }
}, true);

function tickTimer() {
  const s = session; clearInterval(s.timer);
  const left = () => Math.max(0, s.boss.seconds - Math.floor((Date.now() - s.start) / 1000));
  const draw = () => { const t = $('#timer'); if (t) t.textContent = `${Math.floor(left() / 60)}:${String(left() % 60).padStart(2, '0')}`; if (!left()) { clearInterval(s.timer); finish(); } };
  draw(); s.timer = setInterval(draw, 500);
}

function answer(input, btn) {
  const s = session, q = s.q;
  if (s.locked) return;
  const fb = $('#fb'), d = day();
  let res = q.check(input);
  // A small slip: English answers just count; otherwise say "close" and allow one more try.
  if (res === 'close') {
    if (q.lenient) res = 'typo';
    else if (!q.closeTried) {
      q.closeTried = true;
      fb.innerHTML = `<b style="color:var(--warn)">So close.</b> ${q.subject === 'maths' ? 'Your number is nearly right. Check your working and the rounding, then try again.' : 'One or two letters are off. Check the spelling and try again.'}`;
      const inp = $('#ans'); inp?.classList.add('accent'); inp?.focus(); inp?.select();
      return;
    } else res = q.subject === 'maths' ? 'wrong' : 'typo';
  }
  s.locked = true; s.n++;
  if (res === 'right' || res === 'order' || res === 'accent' || res === 'typo') {
    s.right++; s.combo++; S.total++; d.correct++; d[q.subject]++;
    d.combo = Math.max(d.combo, s.combo); S.bestCombo = Math.max(S.bestCombo, s.combo);
    const mult = s.combo >= 10 ? 3 : s.combo >= 5 ? 2 : 1, coins = q.hinted ? 1 : 2 * mult;
    reward(res === 'right' || res === 'order' ? 10 : res === 'typo' ? 8 : 6, coins);
    if (q.id) S.mastery[q.id] = Math.min(5, (S.mastery[q.id] || 0) + 1);
    noteMistake(q, false);
    if (q.topic) { const t = (S.topic[q.topic] ||= { seen: 0, right: 0 }); t.seen++; t.right++; }
    if (s.boss) { s.hp--; const b = $('#boss'); b.classList.add('hit'); setTimeout(() => b.classList.remove('hit'), 150); }
    fb.innerHTML = res === 'right'
      ? `<b class="done">Correct</b> +${coins} coins ${mult > 1 && !q.hinted ? `<span class="combo">(${mult}× combo bonus)</span>` : ''}${stepList(q).length && !q.teach ? `<div class="muted small">${stepList(q).map(stepHtml).join(' → ')}</div>` : ''}`
      : res === 'order' ? `<b class="done">Right</b> +${coins} coins <span class="muted">Same words, different order. The usual way: <b>${esc(q.answer)}</b></span>`
      : res === 'typo' ? `<b class="done">Right</b> +${coins} coins <span style="color:var(--warn)">Watch the spelling: <b>${esc(q.answer)}</b></span>`
        : `<b style="color:var(--warn)">Almost. Check your umlauts and ß:</b> ${esc(q.answer)}`;
    const nb = document.createElement('button'); nb.className = 'btn'; nb.textContent = 'Next'; nb.style.marginTop = '10px'; nb.onclick = ask;
    fb.appendChild(document.createElement('br')); fb.appendChild(nb); nb.focus();
    s.advance = ask;
    bumpStreak();
  } else {
    s.combo = 0; s.wrongs.push(q);
    if (q.id) S.mastery[q.id] = 0;
    noteMistake(q, true);
    if (q.topic) { const t = (S.topic[q.topic] ||= { seen: 0, right: 0 }); t.seen++; }
    if (s.boss) s.hearts--;
    walkthrough(fb, q, input.trim() ? 'Not quite. Let\'s work it out together, one step at a time.' : 'No worries. Here\'s how to do it, one step at a time.');
  }
  if (btn) btn.classList.add(res === 'wrong' ? 'wrong' : 'right');
  view.querySelectorAll('.choices button').forEach((b) => { if (b.textContent === String(q.answer) && res !== 'wrong') b.classList.add('right'); b.disabled = true; });
  const inp = $('#ans'); if (inp) { inp.classList.add(res); inp.readOnly = true; }
  const hb = $('#t-hint'); if (hb) hb.disabled = true;
  save(); checkQuests(); checkBadges(); hud();
}

// Shows the explanation one step per click (or Enter), then the answer, then what to do next.
function walkthrough(fb, q, intro) {
  const s = session, steps = [...stepList(q).map(stepHtml), `<b>Answer: ${esc(q.answer)}</b>`];
  let i = 0;
  fb.innerHTML = `<b style="color:${intro.startsWith('Not quite') ? 'var(--bad)' : 'var(--accent2)'}">${esc(intro)}</b><ol class="steps" id="steps"></ol><div class="row" id="wbtns"></div>`;
  const ol = $('#steps', fb), btns = $('#wbtns', fb);
  const end = () => {
    if (q.kind === 'mc') view.querySelectorAll('.choices button').forEach((b) => { if (b.textContent === String(q.answer)) b.classList.add('right'); });
    btns.innerHTML = `${q.retype ? `<div class="retype"><span class="small muted">Type it once to lock it in:</span> <input type="text" id="retype" autocomplete="off" spellcheck="false"> <span id="retype-ok"></span></div>` : ''}
      ${q.similar && !s.boss ? '<button class="btn alt" id="w-sim">Try a similar one</button>' : ''}
      ${LESSONS[q.topic] && !s.boss ? '<button class="btn alt" id="w-teach">Teach me this topic</button>' : ''}
      <button class="btn" id="w-next">Next question</button>`;
    s.advance = ask;
    $('#w-next', fb).onclick = ask;
    $('#w-sim', fb) && ($('#w-sim', fb).onclick = () => { s.pending = q.similar(); ask(); });
    $('#w-teach', fb) && ($('#w-teach', fb).onclick = () => { session = null; lesson(q.topic); });
    const rt = $('#retype', fb);
    if (rt) {
      rt.focus();
      rt.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); if (rt.readOnly) ask(); } };
      rt.oninput = () => { if (checkGerman(rt.value, [q.retype]) !== 'wrong') { rt.readOnly = true; rt.classList.add('right'); $('#retype-ok', fb).textContent = 'Locked in. Press Enter for the next one.'; } };
    } else $('#w-next', fb).focus();
  };
  const more = () => {
    ol.insertAdjacentHTML('beforeend', `<li>${steps[i++]}</li>`);
    ol.lastElementChild.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    if (i >= steps.length) return end();
    btns.innerHTML = `<button class="btn" id="w-step">Next step <span class="small">(${i}/${steps.length})</span></button>`;
    $('#w-step', fb).onclick = more; $('#w-step', fb).focus();
  };
  s.advance = () => (i < steps.length ? more() : ask());
  more();
}

function finish() {
  const s = session; if (!s) return;
  clearInterval(s.timer); document.onkeydown = null; session = null; studying = null;
  const pct = s.n ? Math.round((s.right / s.n) * 100) : 0;
  let extra = '';
  if (s.boss) {
    const won = s.hp <= 0;
    const b = (S.bosses[s.boss.id] ||= { tries: 0, won: false, best: 0 });
    b.tries++; b.best = Math.max(b.best, s.right); day().boss++;
    if (won) { const first = !b.won; b.won = true; reward(150, first ? 200 : 60, first ? 'Boss defeated. +200 coins' : 'Boss defeated again. +60 coins'); }
    extra = won ? `<h2>${esc(s.boss.name)} defeated</h2>` : `<h2>The boss won this time</h2><p class="muted">It had ${s.hp} HP left. Practise the topics below and try again.</p>`;
  } else if (s.n >= 10 && pct >= 90) { reward(30, 15, '90%+ round bonus: +15 coins'); }
  save(); checkQuests(); checkBadges();
  const wrongs = [...new Map(s.wrongs.map((q) => [q.prompt, q])).values()];
  const weakTopics = [...new Set(wrongs.map((q) => q.topic).filter((t) => LESSONS[t]))];
  view.innerHTML = `<div class="play">
    ${extra}<h1>${s.right} / ${s.n} correct (${pct}%)</h1>
    ${wrongs.length ? `<h2>Fix these</h2><table>${wrongs.map((q) => `<tr><td>${esc(q.prompt)}</td><td><b>${esc(q.answer)}</b></td></tr>`).join('')}</table>` : '<p>No mistakes.</p>'}
    ${weakTopics.length ? `<h2>Learn these again</h2><div class="row">${weakTopics.map((t) => `<button class="btn alt" data-lesson="${esc(t)}">${esc(t)}</button>`).join('')}</div>` : ''}
    <div class="row" style="margin-top:20px"><button class="btn" id="again">Go again</button><a class="btn alt" href="#home">Home</a><a class="btn gold" href="#arcade">Arcade · ${S.coins} coins</a></div></div>`;
  $('#again').onclick = () => s.onEnd ? s.onEnd() : play({ title: s.title, next: s.next, limit: s.limit, boss: s.boss });
  view.querySelectorAll('[data-lesson]').forEach((b) => (b.onclick = () => lesson(b.dataset.lesson)));
  hud();
}

// ---------- question builders ----------
const shuffle = (xs) => xs.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);

function vocabQ(list, dir, word) {
  const [de, en] = word;
  const id = `v:${dir}:${de}`;
  const art = de.match(/^(der|die|das) /)?.[1];
  const tip = art ? `It's a "${art}" word. Learn der/die/das together with the noun: ${de}.` : '';
  const redo = { v: [list, dir, de] };
  if (dir === 'de-en') return { id, redo, subject: 'german', topic: list, prompt: `What does "${de}" mean in English?`, kind: 'text', lenient: true, answer: en, retype: en, check: (i) => checkMeaning(i, variants(en)), steps: '', teach: () => [`"${de}" means "${en}".`, tip].filter(Boolean) };
  return { id, redo, subject: 'german', topic: list, prompt: `How do you say "${en}" in German?`, kind: 'text', keys: true, answer: de, retype: de, check: (i) => checkGerman(i, [de]), steps: tip, teach: () => [`"${en}" in German is "${de}".`, tip].filter(Boolean) };
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

function drillQ(name, d = DRILLS[name]()) {
  return { redo: { d: name, g: d }, subject: 'german', topic: name, prompt: d.q, kind: 'text', keys: true, answer: d.a[0], check: (i) => checkMeaning(i, d.a), steps: d.steps, similar: () => drillQ(name) };
}
const drillNext = (name) => () => drillQ(name);

// The pieces of the letter a reading question is about: the one sharing the most words with the
// explanation and accepted answers, plus any piece that literally contains an answer (e.g. the
// signature "Ina Schmidt" for "Whose birthday is it?", which the best-matching piece doesn't name).
function findChunks(chunks, q) {
  const words = `${q[2]} ${q[1].join(' ')}`.toLowerCase().match(/[a-zäöüß0-9]{3,}/g) || [];
  let best = chunks[0], top = -1;
  for (const c of chunks) { const t = `${c[0]} ${c[1]}`.toLowerCase(); const n = words.filter((w) => t.includes(w)).length; if (n > top) { top = n; best = c; } }
  const hasAnswer = (c) => q[1].some((a) => a.length >= 3 && new RegExp(`(^|[^a-zäöüß])${a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^a-zäöüß])`, 'i').test(c[0]));
  return hasAnswer(best) ? [best] : [best, ...chunks.filter((c) => c !== best && hasAnswer(c)).slice(0, 1)];
}

function readingQ(r, q) {
  const chunks = READ_ALONG[r.title] || [];
  const dict = [...new Map(chunks.flatMap((c) => c[2]).map((w) => [w[0], w])).values()];
  const found = chunks.length ? findChunks(chunks, q) : [];
  return { redo: { r: [r.title, r.qs.indexOf(q)] }, subject: 'german', topic: 'Reading', passage: r.text, dict, prompt: q[0], kind: 'text', lenient: true, answer: q[1][0], steps: q[2],
    teach: found.length ? () => [
      { html: `Find the part${found.length > 1 ? 's' : ''} of the letter this is about:${found.map((c) => `<div class="quote">${esc(c[0])}</div>`).join('')}` },
      { html: `Mini dictionary for that:${dictTable(found.flatMap((c) => c[2]))}` },
      `In English: ${found.map((c) => `"${c[1]}"`).join(' ... ')}`, q[2]] : null,
    check: (i) => checkMeaning(i, q[1]) };
}
function readingNext(r) {
  const order = shuffle(r.qs);
  return (s) => readingQ(r, order[s.n % order.length]);
}

function mathsQ(topic, g = TOPICS[topic]()) {
  return { redo: { m: topic, g }, subject: 'maths', topic, prompt: g.q, kind: g.choices ? 'mc' : 'text', choices: g.choices, answer: g.a, steps: g.steps, similar: () => mathsQ(topic),
    check: (i) => (g.choices ? (i === g.a ? 'right' : 'wrong') : checkMaths(i, g.a) ? 'right' : nearMaths(i, g.a) ? 'close' : 'wrong') };
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

// ---------- my mistakes ----------
// Every question you get wrong is saved (as the exact question, so it can be asked again) until you
// get it right, here or anywhere else.
const mistakeKey = (r) => JSON.stringify(r.v || r.r || [r.d || r.m, r.g?.q]);
function noteMistake(q, wrong) {
  if (!q.redo) return;
  const k = mistakeKey(q.redo);
  S.mistakes = (S.mistakes || []).filter((m) => mistakeKey(m) !== k);
  if (wrong) S.mistakes.push(q.redo);
}
function redoQ(r) {
  if (r.v) { const [list, dir, de] = r.v; const w = GERMAN[list]?.find((x) => x[0] === de); return w && vocabQ(list, dir, w); }
  if (r.r) { const rd = READINGS.find((x) => x.title === r.r[0]); return rd?.qs[r.r[1]] && readingQ(rd, rd.qs[r.r[1]]); }
  if (r.d) return DRILLS[r.d] && drillQ(r.d, r.g);
  if (r.m) return TOPICS[r.m] && mathsQ(r.m, r.g);
  return null;
}
const mistakesOf = (subject) => (S.mistakes || []).filter((m) => (subject === 'maths') === !!m.m);
function mistakesRound(subject) {
  const list = shuffle(subject ? mistakesOf(subject) : [...(S.mistakes || [])]);
  if (!list.length) return toast('No mistakes saved. Nice.');
  let i = 0;
  play({ title: 'My mistakes', limit: list.length, next: () => { while (i < list.length) { const q = redoQ(list[i++]); if (q) return q; } return null; } });
}

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

function studyCard() {
  const t = studied(today()), week = lastDays(7).map((d) => [d, S.study[d]?.total || 0]);
  const weekSum = week.reduce((x, [, s]) => x + s, 0), all = Object.values(S.study).reduce((x, d) => x + d.total, 0);
  const top = Math.max(60, ...week.map(([, s]) => s));
  return `<div class="card"><div class="row" style="gap:28px">
      <div><div class="small muted">Today</div><div class="big-num">${mins(t.total)}</div><div class="small muted">German ${mins(t.german)} · Maths ${mins(t.maths)}</div></div>
      <div><div class="small muted">Last 7 days</div><div class="big-num">${mins(weekSum)}</div></div>
      <div><div class="small muted">All time</div><div class="big-num">${mins(all)}</div></div></div>
    <div class="studybars">${week.map(([d, s]) => `<div title="${d}: ${mins(s)}"><i style="height:${(s / top) * 100}%"></i><span>${new Date(`${d}T12:00:00+10:00`).toLocaleDateString('en-AU', { weekday: 'short', timeZone: 'Australia/Brisbane' })}</span></div>`).join('')}</div>
    <p class="small muted">Counts while you're on a question, lesson, read-along or the PSMT lab, and pauses after 90 seconds of doing nothing.</p></div>`;
}

function home() {
  const d = day();
  const arcadeOpen = d.correct >= 20;
  view.innerHTML = `
    <h1>G'day Thomas</h1>
    <p class="muted">Study to earn coins, then spend them on your own games in the Arcade. Content synced from your DayMap, Stile, Education Perfect and Maths OneNote on 8 Nov.</p>
    ${(() => { const n = nextStep(); return `<div class="card next-step"><div><div class="pill">Do this next</div><h2>${esc(n.title)}</h2><p class="muted">${esc(n.why)}</p></div><button class="btn" id="next-step">Start</button></div>`; })()}
    <div class="grid">${[...EXAMS].sort((a, b) => Date.parse(a.due) - Date.parse(b.due)).map((e) => { const days = (Date.parse(e.due) - Date.now()) / 864e5; return `
      <div class="card exam ${days < 4 ? 'urgent' : ''}"><div class="pill">${e.subject}</div><h3 style="margin-top:6px">${esc(e.name)}</h3>
      <div class="big">${countdown(e.due)}</div><div class="small muted">${new Date(e.due).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Australia/Brisbane' })}</div>
      <p class="small muted">${esc(e.note)}</p></div>`; }).join('')}</div>

    <h2>Time studied</h2>
    ${studyCard()}

    <h2>Today's quests</h2>
    <div class="card">${QUESTS.map((q) => { const v = Math.min(q.goal, q.get(d)); return `<div class="quest"><span class="${d.quests[q.id] ? 'done' : ''}"><i class="check ${d.quests[q.id] ? 'on' : ''}"></i>${q.text}</span><span class="small muted">${v}/${q.goal} · +${q.coins} coins</span></div>`; }).join('')}
      <p class="small muted">Arcade ${arcadeOpen ? '<b class="done">unlocked</b>' : `unlocks after <b>${20 - d.correct}</b> more correct answers today`}.</p></div>

    <h2>Study next</h2>
    <div class="grid">
      <div class="card click" data-go="teach"><h3>No idea where to start?</h3><p class="muted small">Lessons that go one small step at a time, before any questions.</p><button class="btn">Teach me</button></div>
      <div class="card click" data-go="ger"><h3>German</h3><p class="muted small">Weakest: ${esc(weakest('german'))}</p><button class="btn">Mixed German round</button></div>
      <div class="card click" data-go="mat"><h3>Maths</h3><p class="muted small">Weakest: ${esc(weakest('maths'))}</p><button class="btn">Mixed Term 4 round</button></div>
      <div class="card click" data-go="report"><h3>PSMT final report: due 3:00 pm today</h3><p class="muted small">Write it part by part with your draft notes, then download the Word document.</p><button class="btn">Write the report</button></div>
      <div class="card click" data-go="psmt"><h3>PSMT due Fri 13 Nov</h3><p class="muted small">Check your own survey calculations before you write the report.</p><button class="btn">Open PSMT lab</button></div>
      <div class="card ${S.mistakes?.length ? 'click' : 'locked'}" data-go="mistakes"><h3>My mistakes (${S.mistakes?.length || 0})</h3><p class="muted small">Every question you got wrong, until you get it right.</p><button class="btn" ${S.mistakes?.length ? '' : 'disabled'}>Redo them</button></div>
    </div>

    <h2>Badges (${S.badges.length}/${BADGES.length})</h2>
    <div class="row">${BADGES.map(([id, icon, name]) => `<div class="badge ${S.badges.includes(id) ? '' : 'off'}"><b>${icon}</b>${esc(name)}</div>`).join('')}</div>
    <p class="small muted" style="margin-top:30px">Sources: ${esc(SOURCES)} <button class="btn alt" id="reset" style="padding:4px 10px;font-size:12px">Reset progress</button></p>`;
  view.querySelector('[data-go=ger]').onclick = () => play({ title: 'Mixed German', next: germanMix(), limit: 20 });
  view.querySelector('[data-go=mat]').onclick = () => play({ title: 'Mixed Maths', next: mixedMaths(Object.keys(TOPICS)), limit: 20 });
  view.querySelector('[data-go=psmt]').onclick = () => (location.hash = '#psmt');
  view.querySelector('[data-go=report]').onclick = () => (location.hash = '#report');
  view.querySelector('[data-go=teach]').onclick = () => (location.hash = '#teach');
  view.querySelector('[data-go=mistakes]').onclick = () => mistakesRound();
  $('#next-step').onclick = () => nextStep().run();
  $('#reset').onclick = () => { if (confirm('Wipe all XP, coins and progress?')) { S = fresh(); save(); route(); } };
}

// The single most useful thing to do now: work for the nearest exam first (new lessons before
// practice), then saved mistakes, then flashcards you missed, then your weakest topic.
function nextStep() {
  const soon = EXAMS.filter((e) => Date.parse(e.due) > Date.now()).sort((a, b) => Date.parse(a.due) - Date.parse(b.due));
  const order = [...new Set([...soon.map((e) => e.id), 'ger', 'mat'])];
  const dueCards = (german) => Object.keys(S.cardsAgain || {}).find((k) => (/^(words|letter):/.test(k) || k === 'reading' || !!DRILLS[k]) === german && studyPack(k).cards);
  const cardTitle = (k) => studyPack(k).title;
  for (const id of order) {
    const exam = EXAMS.find((e) => e.id === id), when = exam ? ` The ${exam.subject} ${id === 'psmt' ? 'PSMT' : 'exam'} is ${countdown(exam.due).toLowerCase() === 'done' ? 'done' : `in ${countdown(exam.due)}`}.` : '';
    if (id === 'ger') {
      if (!taught('read:tips')) return { title: 'How to read a German letter', why: `The exam is reading a letter, so start with how to tackle one.${when}`, run: readingTips };
      const practice = (r) => r.title.startsWith('Practice');
      const ri = READINGS.findIndex((r) => !practice(r) && !taught(`read:${r.title}`));
      if (ri >= 0) return { title: `Read with me: ${READINGS[ri].title}`, why: `Go through a letter piece by piece with a mini dictionary.${when}`, run: () => readAlong(ri) };
      // Unseen letters are the real exam skill: straight to the questions, like the exam.
      const ui = READINGS.findIndex((r) => practice(r) && !S.lessons[`tried:${r.title}`]);
      if (ui >= 0) return { title: `Unseen letter: ${READINGS[ui].title.replace(/^Practice:\s*/, '')}`, why: `A letter you haven't seen, straight to the questions like the real exam. "What does this mean?" still helps.${when}`, run: () => { S.lessons[`tried:${READINGS[ui].title}`] = 1; save(); play({ title: READINGS[ui].title, next: readingNext(READINGS[ui]), limit: READINGS[ui].qs.length }); } };
      if (mistakesOf('german').length) return { title: `Redo your German mistakes (${mistakesOf('german').length})`, why: `Questions you got wrong before. Fix them while they're fresh.${when}`, run: () => mistakesRound('german') };
      const k = dueCards(true); if (k) return { title: `Flashcards: ${cardTitle(k)}`, why: `You marked some of these "Again" last time.${when}`, run: () => flashcards(k) };
      const d = Object.keys(DRILLS).find((x) => !taught(x)); if (d) return { title: `Learn: ${d}`, why: `Letters are full of dates, times and numbers.${when}`, run: () => lesson(d) };
      const ri2 = (S.readNext || 0) % READINGS.length;
      return { title: `Practise a letter: ${READINGS[ri2].title}`, why: `Read the key words, then answer the questions.${when}`, run: () => { S.readNext = ri2 + 1; save(); readingWords(ri2); } };
    }
    if (id === 'psmt' && SURVEY_QUESTIONS.some((_, i) => !S.psmt[i]?.done)) return { title: 'PSMT lab: check your calculations', why: `Get every survey question checked before you write the report.${when}`, run: () => (location.hash = '#psmt') };
    if (id === 'mat') {
      const t = Object.keys(TOPICS).find((x) => !taught(x)); if (t) return { title: `Learn: ${t}`, why: `A short lesson, one step at a time, then 5 questions.${when}`, run: () => lesson(t) };
      if (mistakesOf('maths').length) return { title: `Redo your maths mistakes (${mistakesOf('maths').length})`, why: `The exact questions you got wrong.${when}`, run: () => mistakesRound('maths') };
      const k = dueCards(false); if (k) return { title: `Flashcards: ${cardTitle(k)}`, why: `You marked some of these "Again" last time.${when}`, run: () => flashcards(k) };
      const w = weakest('maths'); return { title: `Practise: ${w}`, why: `Your weakest maths topic right now.${when}`, run: () => play({ title: w, next: () => mathsQ(w), limit: 12 }) };
    }
  }
  return { title: 'Mixed German round', why: 'Keep it fresh.', run: () => play({ title: 'Mixed German', next: germanMix(), limit: 20 }) };
}

function mastery(list) {
  const w = GERMAN[list]; const m = w.filter(([de]) => (S.mastery[`v:de-en:${de}`] || 0) >= 2 && (S.mastery[`v:en-de:${de}`] || 0) >= 2).length;
  return [m, w.length];
}

const taught = (key) => !!S.lessons[key];
const tick = (key) => (taught(key) ? '<span class="pill ok">Done</span> ' : '');

function german() {
  view.innerHTML = `
    <h1>German – Unit 8: Was feiert man in Deutschland?</h1>
    <p class="muted">The exam is <b>reading comprehension</b>: read a German letter (like an invitation) and answer questions about it. New to something? Do it in this order: <b>Teach</b>, then <b>Learn</b>, then <b>Test</b>.</p>
    <h2>1 · Reading a letter (the actual exam)</h2>
    <div class="grid">
      <div class="card"><h3>${tick('read:tips')}How to read a German letter</h3><p class="small muted">Start here: what to look for, so the big block of text isn't scary.</p><div class="row"><button class="btn alt" id="tips">Teach</button>${studyButtons('reading')}</div></div>
      ${READINGS.map((r, i) => `<div class="card"><h3>${tick(`read:${r.title}`)}${esc(r.title)}</h3><p class="small muted">${r.qs.length} questions</p>
        <div class="row"><button class="btn alt" data-ra="${i}">Read it with me</button>${studyButtons(`letter:${i}`)}<button class="btn" data-r="${i}">Answer questions</button></div></div>`).join('')}
    </div>
    <h2>2 · Word lists (exact Education Perfect + Stile lists)</h2>
    <div class="grid">${Object.keys(GERMAN).map((l) => { const [m, n] = mastery(l); return `
      <div class="card"><h3>${tick(`words:${l}`)}${esc(l)}</h3><div class="bar"><i style="width:${(m / n) * 100}%"></i></div><p class="small muted">${m}/${n} mastered both ways</p>
      <div class="row"><button class="btn alt" data-l="${esc(l)}" data-m="teach">Teach</button>${studyButtons(`words:${l}`)}<button class="btn alt" data-l="${esc(l)}" data-m="learn">Learn</button><button class="btn" data-l="${esc(l)}" data-m="de-en">Test DE to EN</button><button class="btn" data-l="${esc(l)}" data-m="en-de">Test EN to DE</button></div></div>`; }).join('')}</div>
    <h2>3 · Skills (dates, numbers, years, time, seasons)</h2>
    <div class="grid">${Object.keys(DRILLS).map((d) => { const t = S.topic[d]; return `<div class="card"><h3>${tick(d)}${esc(d)}</h3><p class="small muted">${t ? `${t.right}/${t.seen} right` : 'Not started'}</p>
      <div class="row"><button class="btn alt" data-teach="${esc(d)}">Teach</button>${studyButtons(d)}<button class="btn" data-d="${esc(d)}">Practise</button></div></div>`; }).join('')}</div>`;
  $('#tips').onclick = () => readingTips();
  view.querySelectorAll('[data-l]').forEach((b) => (b.onclick = () => { const l = b.dataset.l, m = b.dataset.m; if (m === 'teach') return teachWords(l); if (m === 'learn') return learn(l); play({ title: `${l} (${m})`, next: vocabNext(l, m), limit: Math.min(25, GERMAN[l].length + 5) }); }));
  view.querySelectorAll('[data-teach]').forEach((b) => (b.onclick = () => lesson(b.dataset.teach)));
  bindStudyButtons();
  view.querySelectorAll('[data-d]').forEach((b) => (b.onclick = () => play({ title: b.dataset.d, next: drillNext(b.dataset.d), limit: 15 })));
  view.querySelectorAll('[data-ra]').forEach((b) => (b.onclick = () => readAlong(Number(b.dataset.ra))));
  view.querySelectorAll('[data-r]').forEach((b) => (b.onclick = () => readingWords(Number(b.dataset.r))));
}

// Before the questions: every word the letter needs, so no question asks about a word you've never seen.
function readingWords(ri) {
  const r = READINGS[ri], words = [...new Map((READ_ALONG[r.title] || []).flatMap((c) => c[2]).map((w) => [w[0], w])).values()];
  const go = () => play({ title: r.title, next: readingNext(r), limit: r.qs.length });
  if (!words.length) return go();
  view.innerHTML = `<div class="play"><a href="#german" class="quit">Exit</a><span class="crumb">${esc(r.title)}</span>
    <h1 style="margin-top:14px">Key words first</h1><p class="muted">These are the words the questions need. Read down the list, say each German word out loud, and write down any you didn't know.</p>
    <div class="card">${dictTable(words)}</div>
    <div class="row" style="margin-top:12px"><button class="btn" id="go">I've read them, start the questions</button><button class="btn alt" id="ra">Read the letter with me first</button></div></div>`;
  $('#go').onclick = go;
  $('#ra').onclick = () => readAlong(ri);
}

// Flashcards: pick the meaning out of 4 (press 1-4). Small XP, no coins (coins are for recall, not peeking).
function learn(list) {
  studying = 'german';
  const all = GERMAN[list], words = shuffle(all); let i = 0;
  const draw = () => {
    if (i >= words.length) { reward(20, 0, `Finished learning ${list}. Now test yourself for coins.`); return german(); }
    const [de, en] = words[i];
    const opts = shuffle([en, ...shuffle([...new Set(all.map((x) => x[1]).filter((x) => x !== en))]).slice(0, 3)]);
    view.innerHTML = `<div class="play"><a href="#german" class="quit">Exit</a><span class="crumb">${esc(list)}</span><p class="muted">${i + 1} / ${words.length} — press 1, 2, 3 or 4</p>
      <div class="flash"><div class="face" style="cursor:default">${esc(de)}</div></div><div class="row" style="justify-content:center;margin:8px 0">${hearBtn(de)}</div>
      <div class="choices">${opts.map((o) => `<button>${esc(o)}</button>`).join('')}</div><div class="feedback" id="fb"></div></div>`;
    view.querySelectorAll('.choices button').forEach((b) => (b.onclick = () => {
      const ok = b.textContent === en;
      view.querySelectorAll('.choices button').forEach((x) => { x.disabled = true; if (x.textContent === en) x.classList.add('right'); });
      if (ok) { S.xp += 1; save(); hud(); } else { b.classList.add('wrong'); words.push(words[i]); }
      i++;
      $('#fb').innerHTML = ok ? '<b class="done">Yes</b> ' : `<b style="color:var(--bad)">Not quite: "${esc(de)}" means "${esc(en)}".</b> It'll come back later. `;
      const nb = document.createElement('button'); nb.className = 'btn'; nb.textContent = 'Next'; nb.onclick = draw; $('#fb').appendChild(nb); nb.focus();
    }));
  };
  draw();
}

function maths() {
  const t4 = Object.keys(TOPICS);
  view.innerHTML = `
    <h1>Maths – Term 4 (Cambridge Essential 8)</h1>
    <p class="muted">These are exactly the sections on Mr Hives' Term 4 planner: percentages 3H–3K, ratios 6A–6B, rates 6D–6G and statistics 8B–8F. Exam: Week 8 (Wed 25 Nov).
      No idea where to start? Press <b>Teach</b> on a topic: it explains one small step at a time, then gives you 5 practice questions. Every question has a calculator, a working-out pad and a button that explains the words.</p>
    <div class="row"><button class="btn" id="mix">Mixed exam round (20)</button><button class="btn alt" id="stat">Statistics only (PSMT prep)</button></div>
    <div class="grid" style="margin-top:16px">${t4.map((n) => { const t = S.topic[n]; const p = t ? Math.round((t.right / t.seen) * 100) : 0; return `
      <div class="card"><h3>${tick(n)}${esc(n)}</h3><div class="bar"><i style="width:${p}%;background:${p >= 80 ? 'var(--good)' : p >= 50 ? 'var(--warn)' : 'var(--bad)'}"></i></div><p class="small muted">${t ? `${t.right}/${t.seen} right (${p}%)` : 'Not started'}</p>
      <div class="row"><button class="btn alt" data-teach="${esc(n)}">Teach</button>${studyButtons(n)}<button class="btn" data-t="${esc(n)}">Practise</button></div></div>`; }).join('')}</div>
    <p class="small muted">Answers: round to 2 decimal places when asked. Ratios as 3:2. Money without the $ is fine.</p>`;
  $('#mix').onclick = () => play({ title: 'Term 4 mix', next: mixedMaths(t4), limit: 20 });
  $('#stat').onclick = () => play({ title: 'Statistics', next: mixedMaths(t4.filter((n) => n.startsWith('8'))), limit: 20 });
  view.querySelectorAll('[data-teach]').forEach((b) => (b.onclick = () => lesson(b.dataset.teach)));
  bindStudyButtons();
  view.querySelectorAll('[data-t]').forEach((b) => (b.onclick = () => play({ title: b.dataset.t, next: () => mathsQ(b.dataset.t), limit: 12 })));
}

// ---------- tips & tricks, flashcards ----------
// Tips & tricks only teach: memory tricks plus a "Do this now" task (write it, say it, draw it). No questions.
// Flashcards flip; you mark each one "Got it" or "Again" (Again cards come back). Keys: 'reading',
// 'words:<list>' or a LESSONS key.
const doBox = (d) => (d ? `<div class="do-it"><b>Do this now</b><p>${esc(d)}</p></div>` : '');
const asCards = (tips) => tips.map((x) => ({ t: x.t, s: x.s, html: doBox(x.do) }));
function studyPack(key) {
  if (key === 'reading') return { title: 'Reading German letters', tips: READING_TRICKS.tips, cards: READING_TRICKS.cards };
  if (key === 'psmt') return { title: 'PSMT: comparing data', tips: PSMT_TRICKS.tips, cards: PSMT_TRICKS.cards };
  if (key.startsWith('letter:')) {
    const r = READINGS[Number(key.slice(7))];
    const words = [...new Map((READ_ALONG[r.title] || []).flatMap((c) => c[2]).map((w) => [w[0], w])).values()];
    return { title: r.title, tips: LETTER_TRICKS[r.title], cards: words };
  }
  if (key.startsWith('words:')) {
    const list = key.slice(6), words = GERMAN[list], groups = [];
    for (let k = 0; k < words.length; k += 5) groups.push(words.slice(k, k + 5));
    const tips = [...WORD_TIPS, ...groups.map((g, i) => ({
      t: `Words ${i * 5 + 1} to ${i * 5 + g.length}`,
      s: g.map(([de, en]) => `${de} = ${en}${WORD_HOOKS[de] ? `. Memory hook: ${WORD_HOOKS[de]}` : ''}`),
      do: 'Write these words in your book, German on the left and English on the right. Say each German word out loud. Then cover the English side and say what each one means.',
    }))];
    return { title: list, tips, cards: words.map(([de, en]) => [de, WORD_HOOKS[de] ? `${en}\n\n${WORD_HOOKS[de]}` : en]) };
  }
  return { title: key, tips: TRICKS[key]?.tips, cards: TRICKS[key]?.cards };
}
function studyButtons(key) {
  return `<button class="btn alt" data-tricks="${esc(key)}">Tips & tricks</button><button class="btn alt" data-cards="${esc(key)}">Flashcards</button>`;
}
function bindStudyButtons() {
  const on = (sel, fn) => view.querySelectorAll(sel).forEach((b) => (b.onclick = (e) => { e.stopPropagation(); fn(b); }));
  on('[data-tricks]', (b) => tricks(b.dataset.tricks));
  on('[data-cards]', (b) => flashcards(b.dataset.cards));
}
function tricks(key) {
  const p = studyPack(key);
  runCards(`${p.title}: tips & tricks`, asCards(p.tips), () => {
    if (!S.lessons[`tricks:${key}`]) { S.lessons[`tricks:${key}`] = 1; reward(15, 3, 'Tips & tricks done. +3 coins'); }
    view.innerHTML = `<div class="play center"><h1>Tips & tricks done</h1><p class="muted">Lock it in: run through the flashcards for <b>${esc(p.title)}</b>.</p>
      <div class="row" style="justify-content:center"><button class="btn" id="fc">Flashcards</button><button class="btn alt" id="again">Go through it again</button><button class="btn alt" id="back">Back</button></div></div>`;
    $('#fc').onclick = () => flashcards(key);
    $('#again').onclick = () => tricks(key);
    $('#back').onclick = () => route();
  });
}
// "Again" cards are saved per lesson and come first next time, until you mark them "Got it".
function flashcards(key) {
  const p = studyPack(key), saved = new Set((S.cardsAgain ||= {})[key] || []);
  const queue = [...shuffle(p.cards.filter((c) => saved.has(c[0]))), ...shuffle(p.cards.filter((c) => !saved.has(c[0])))].map((c) => [...c]);
  const total = queue.length; let known = 0, flipped = false;
  const german = /^(words|letter):/.test(key) || key === 'reading' || !!DRILLS[key];
  studying = german ? 'german' : 'maths';
  const keep = () => { S.cardsAgain[key] = [...saved]; if (!saved.size) delete S.cardsAgain[key]; save(); };
  const draw = () => {
    if (!queue.length) {
      document.onkeydown = null; S.xp += 10; save(); hud();
      view.innerHTML = `<div class="play center"><h1>All ${total} cards known</h1><p class="muted">${esc(p.title)}. Come back tomorrow and run them again: that's when it really sticks.</p>
        <div class="row" style="justify-content:center"><button class="btn" id="again">Shuffle and go again</button><button class="btn alt" id="back">Back</button></div></div>`;
      $('#again').onclick = () => flashcards(key); $('#back').onclick = () => route();
      return;
    }
    const [front, back] = queue[0];
    view.innerHTML = `<div class="play"><a href="#" id="quit" class="quit">Exit</a><span class="crumb">${esc(p.title)}: flashcards</span>
      <p class="muted small" style="margin-top:10px">${known} of ${total} known.${saved.has(front) ? ' <b style="color:var(--warn)">You missed this one last time.</b>' : ''} Say the answer in your head, then flip.</p><div class="bar"><i style="width:${(known / total) * 100}%"></i></div>
      <div class="flash"><div class="face${flipped ? ' back' : ''}" id="card">${esc(flipped ? back : front).replace(/\n/g, '<br>')}</div></div>
      <div class="row" style="margin-top:12px;justify-content:center">${flipped
        ? '<button class="btn alt" id="again">Again (1)</button><button class="btn" id="got">Got it (2)</button>'
        : `<button class="btn" id="flip">Flip (Space)</button>${german ? '<button class="btn alt" id="hear">Hear it (H)</button>' : ''}`}</div></div>`;
    $('#quit').onclick = (e) => { e.preventDefault(); document.onkeydown = null; route(); };
    $('#card').onclick = flip;
    if (flipped) { $('#again').onclick = again; $('#got').onclick = got; } else { $('#flip').onclick = flip; if (german) $('#hear').onclick = () => speak(front); }
  };
  const flip = () => { flipped = !flipped; draw(); };
  // Getting a card right after missing it this round still leaves it due next time.
  const missed = new Set();
  const got = () => { if (!missed.has(queue[0][0])) saved.delete(queue[0][0]); keep(); queue.shift(); known++; flipped = false; draw(); };
  const again = () => { missed.add(queue[0][0]); saved.add(queue[0][0]); keep(); queue.push(queue.shift()); flipped = false; draw(); };
  document.onkeydown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!flipped) flip(); else got(); }
    else if (flipped && e.key === '1') again();
    else if (flipped && e.key === '2') got();
    else if (german && !flipped && (e.key === 'h' || e.key === 'H')) speak(queue[0][0]);
  };
  draw();
}

// ---------- teaching ----------
function markTaught(key) {
  if (taught(key)) return;
  S.lessons[key] = 1; reward(20, 5, 'Lesson done. +5 coins');
}

// Steps through cards one line at a time. Enter / → goes forward, ← goes back.
function runCards(title, cards, onDone) {
  studying = title.includes('German') || !Object.keys(TOPICS).some((t) => title.includes(t)) ? 'german' : 'maths';
  let c = 0, l = 0;
  const fwd = () => { if (l + 1 < cards[c].s.length) l++; else if (c + 1 < cards.length) { c++; l = 0; } else { document.onkeydown = null; return onDone(); } draw(); };
  const back = () => { if (l > 0) l--; else if (c > 0) { c--; l = cards[c].s.length - 1; } draw(); };
  const draw = () => {
    const card = cards[c], last = l + 1 >= card.s.length;
    view.innerHTML = `<div class="play"><a href="#" id="quit" class="quit">Exit</a><span class="crumb">${esc(title)}</span>
      <p class="muted small" style="margin-top:10px">Part ${c + 1} of ${cards.length}</p><div class="bar"><i style="width:${((c + (l + 1) / card.s.length) / cards.length) * 100}%"></i></div>
      <div class="card lesson"><h2>${esc(card.t)}</h2><ol class="steps">${card.s.slice(0, l + 1).map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
        ${card.html || ''}</div>
      <div class="row"><button class="btn alt" id="back" ${c || l ? '' : 'disabled'}>Back</button><button class="btn" id="fwd">${!last ? 'Next step' : c + 1 < cards.length ? 'Next part' : 'Done'}</button></div>
      <p class="small muted">Tip: press Enter or the right arrow key to go on, the left arrow key to go back.</p></div>`;
    $('#quit').onclick = (e) => { e.preventDefault(); document.onkeydown = null; route(); };
    $('#back').onclick = back; $('#fwd').onclick = fwd; $('#fwd').focus();
  };
  document.onkeydown = (e) => { if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); fwd(); } else if (e.key === 'ArrowLeft') back(); };
  draw();
}

function practiceFor(key) {
  if (TOPICS[key]) return () => mathsQ(key);
  if (DRILLS[key]) return drillNext(key);
  return null;
}

function lesson(key) {
  runCards(key, LESSONS[key], () => {
    markTaught(key);
    const next = practiceFor(key);
    view.innerHTML = `<div class="play center"><h1>Lesson done</h1><p class="muted">Now try 5 questions on <b>${esc(key)}</b>. If you get one wrong or press "I don't know", it's explained step by step.</p>
      <div class="row" style="justify-content:center"><button class="btn" id="go">Your turn (5 questions)</button><button class="btn alt" id="again">Read it again</button></div></div>`;
    $('#go').onclick = () => play({ title: key, next, limit: 5 });
    $('#again').onclick = () => lesson(key);
  });
}

function readingTips() {
  runCards('How to read a German letter', READING_TIPS, () => { markTaught('read:tips'); german(); });
}

// One piece of the letter at a time, with a mini dictionary and the meaning on request.
function readAlong(ri) {
  studying = 'german';
  const r = READINGS[ri], chunks = READ_ALONG[r.title];
  let i = 0, shown = false;
  const fwd = () => { if (!shown) { shown = true; return draw(); } if (i + 1 < chunks.length) { i++; shown = false; return draw(); } done(); };
  const back = () => { if (shown) shown = false; else if (i > 0) { i--; shown = true; } draw(); };
  const draw = () => {
    const [de, en, words] = chunks[i];
    view.innerHTML = `<div class="play"><a href="#" id="quit" class="quit">Exit</a><span class="crumb">${esc(r.title)}</span>
      <p class="muted small" style="margin-top:10px">Piece ${i + 1} of ${chunks.length}. Read the German, use the mini dictionary, try to work out the meaning, then check.</p>
      <div class="bar"><i style="width:${((i + (shown ? 1 : 0.5)) / chunks.length) * 100}%"></i></div>
      ${i ? `<div class="passage faded">${chunks.slice(Math.max(0, i - 2), i).map((c) => esc(c[0])).join(' ')}</div>` : ''}
      <div class="passage now">${esc(de)}</div><div class="row" style="margin:-4px 0 10px">${hearBtn(de)}</div>
      <div class="card help"><b>Mini dictionary</b>${dictTable(words)}</div>
      ${shown ? `<div class="card"><b>In English:</b> ${esc(en)}</div>` : ''}
      <div class="row" style="margin-top:12px"><button class="btn alt" id="back" ${i || shown ? '' : 'disabled'}>Back</button><button class="btn" id="fwd">${!shown ? 'Show me what it means' : i + 1 < chunks.length ? 'Next piece' : 'Done'}</button></div></div>`;
    $('#quit').onclick = (e) => { e.preventDefault(); document.onkeydown = null; route(); };
    $('#back').onclick = back; $('#fwd').onclick = fwd; $('#fwd').focus();
  };
  const done = () => {
    document.onkeydown = null; markTaught(`read:${r.title}`);
    view.innerHTML = `<div class="play center"><h1>You read the whole letter</h1><p class="muted">Now answer the questions. The mini dictionary is still there (the What does this mean? button), and wrong answers point you to the right sentence.</p>
      <div class="row" style="justify-content:center"><button class="btn" id="go">Answer the questions</button><button class="btn alt" id="again">Read it again</button></div></div>`;
    $('#go').onclick = () => play({ title: r.title, next: readingNext(r), limit: r.qs.length });
    $('#again').onclick = () => readAlong(ri);
  };
  document.onkeydown = (e) => { if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); fwd(); } else if (e.key === 'ArrowLeft') back(); };
  draw();
}

// Teaches a word list five words at a time: meet each word, then a quick check on those five.
function teachWords(list) {
  studying = 'german';
  const all = GERMAN[list], groups = [];
  for (let k = 0; k < all.length; k += 5) groups.push(all.slice(k, k + 5));
  let g = 0, w = 0, queue = null;
  const header = () => `<a href="#" id="quit" class="quit">Exit</a><span class="crumb">${esc(list)}</span><p class="muted small" style="margin-top:10px">Group ${g + 1} of ${groups.length}</p><div class="bar"><i style="width:${((g + (queue ? 0.5 : (w + 1) / groups[g].length / 2)) / groups.length) * 100}%"></i></div>`;
  const bind = () => { $('#quit').onclick = (e) => { e.preventDefault(); document.onkeydown = null; route(); }; };
  const meet = () => {
    const grp = groups[g], [de, en] = grp[w], art = de.match(/^(der|die|das) /)?.[1];
    view.innerHTML = `<div class="play">${header()}
      <div class="flash"><div class="face" style="cursor:default">${esc(de)}<div class="small muted" style="font-weight:400;margin-top:8px">${esc(en)}</div></div></div><div class="row" style="justify-content:center;margin:8px 0">${hearBtn(de)}</div>
      ${art ? `<p class="small muted center">"${art}" word: learn the der/die/das with it.</p>` : ''}
      ${w ? `<div class="card help"><b>This group so far</b>${dictTable(grp.slice(0, w))}</div>` : ''}
      <div class="row" style="margin-top:12px"><button class="btn" id="fwd">${w + 1 < grp.length ? 'Next word' : 'Quick check on these words'}</button></div></div>`;
    bind(); $('#fwd').onclick = fwdMeet; $('#fwd').focus();
  };
  const fwdMeet = () => { if (w + 1 < groups[g].length) { w++; meet(); } else { queue = shuffle(groups[g]); check(); } };
  const check = () => {
    if (!queue.length) { queue = null; if (g + 1 < groups.length) { g++; w = 0; return meet(); } return done(); }
    const [de, en] = queue[0];
    const opts = shuffle([en, ...shuffle(all.filter((x) => x[1] !== en)).slice(0, 3).map((x) => x[1])]);
    view.innerHTML = `<div class="play">${header()}<div class="q">What does "${esc(de)}" mean?</div>
      <div class="choices">${opts.map((o) => `<button>${esc(o)}</button>`).join('')}</div><div class="feedback" id="fb"></div></div>`;
    bind();
    view.querySelectorAll('.choices button').forEach((b) => (b.onclick = () => {
      const ok = b.textContent === en;
      view.querySelectorAll('.choices button').forEach((x) => { x.disabled = true; if (x.textContent === en) x.classList.add('right'); });
      if (!ok) b.classList.add('wrong');
      queue.shift(); if (!ok) queue.push([de, en]);
      $('#fb').innerHTML = ok ? '<b class="done">Yes</b> ' : `<b style="color:var(--bad)">Not quite: "${esc(de)}" means "${esc(en)}".</b> It'll come back in a moment. `;
      const nb = document.createElement('button'); nb.className = 'btn'; nb.textContent = 'Next'; nb.onclick = check; $('#fb').appendChild(nb); nb.focus();
    }));
  };
  const done = () => {
    document.onkeydown = null; markTaught(`words:${list}`);
    view.innerHTML = `<div class="play center"><h1>You've met every word in ${esc(list)}</h1><p class="muted">Next: learn them with flashcards, then test yourself for coins.</p>
      <div class="row" style="justify-content:center"><button class="btn" id="learn">Learn (flashcards)</button><button class="btn alt" id="test">Test DE to EN</button></div></div>`;
    $('#learn').onclick = () => learn(list);
    $('#test').onclick = () => play({ title: `${list} (de-en)`, next: vocabNext(list, 'de-en'), limit: Math.min(25, all.length + 5) });
  };
  meet();
}

// Every lesson in order, for "I have no idea where to start".
function teach() {
  const item = (key, label, attrs, pack) => `<div class="card click" ${attrs}><h3>${taught(key) ? '<span class="pill ok">Done</span> ' : ''}${esc(label)}</h3><p class="small muted">${taught(key) ? 'Done. Click to go over it again.' : 'Not done yet'}</p><div class="row">${studyButtons(pack)}</div></div>`;
  view.innerHTML = `<h1>Teach me</h1>
    <p class="muted">Start here if you have no idea. Every lesson goes one small step at a time, then you practise. Order: <b>Teach</b>, then <b>Learn</b>, then <b>Test</b>.</p>
    <h2>German: reading a letter</h2>
    <div class="grid">${item('read:tips', 'How to read a German letter', 'data-tips', 'reading')}${READINGS.map((r, i) => item(`read:${r.title}`, `Read with me: ${r.title}`, `data-ra="${i}"`, `letter:${i}`)).join('')}</div>
    <h2>German: skills</h2>
    <div class="grid">${Object.keys(DRILLS).map((d) => item(d, d, `data-teach="${esc(d)}"`, d)).join('')}</div>
    <h2>German: word lists</h2>
    <div class="grid">${Object.keys(GERMAN).map((l) => item(`words:${l}`, l, `data-words="${esc(l)}"`, `words:${l}`)).join('')}</div>
    <h2>Maths: PSMT</h2>
    <div class="grid"><div class="card"><h3>PSMT: comparing data</h3><p class="small muted">Centre, spread and shape for your report.</p><div class="row">${studyButtons('psmt')}</div></div></div>
    <h2>Maths</h2>
    <div class="grid">${Object.keys(TOPICS).map((t) => item(t, t, `data-teach="${esc(t)}"`, t)).join('')}</div>`;
  bindStudyButtons();
  $('[data-tips]').onclick = readingTips;
  view.querySelectorAll('[data-ra]').forEach((c) => (c.onclick = () => readAlong(Number(c.dataset.ra))));
  view.querySelectorAll('[data-teach]').forEach((c) => (c.onclick = () => lesson(c.dataset.teach)));
  view.querySelectorAll('[data-words]').forEach((c) => (c.onclick = () => teachWords(c.dataset.words)));
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
  return `<svg class="hist" viewBox="0 0 ${W} ${H + 30}">${counts.map((c, i) => `<rect x="${30 + i * bw}" y="${H - (c / max) * (H - 10)}" width="${bw - 2}" height="${(c / max) * (H - 10)}" fill="#5b8cff"/><text x="${30 + i * bw + bw / 2}" y="${H + 14}" fill="#8b93a7" font-size="10" text-anchor="middle">${w === 1 ? lo + i * w : `${lo + i * w}–${lo + (i + 1) * w - 1}`}</text>${c ? `<text x="${30 + i * bw + bw / 2}" y="${H - (c / max) * (H - 10) - 3}" fill="#e6e9ef" font-size="10" text-anchor="middle">${c}</text>` : ''}`).join('')}</svg>`;
}

let dataView = 'sorted';
function dataBlock(xs) {
  if (dataView === 'freq') {
    const f = new Map(); stats.sorted(xs).forEach((x) => f.set(x, (f.get(x) || 0) + 1));
    return `<div class="databox"><table><tr><th>Value</th><th>Frequency</th></tr>${[...f].map(([v, n]) => `<tr><td>${v}</td><td>${n}</td></tr>`).join('')}<tr><th>Total</th><th>${xs.length}</th></tr></table></div>`;
  }
  return `<div class="databox nums">${(dataView === 'sorted' ? stats.sorted(xs) : xs).join(', ')}</div>`;
}

// Report sentence starters for one survey question. Every gap says what goes in it; once the
// numbers have been worked out in Step 1 they are filled in.
function starters(qi, truth, unlocked, st) {
  const unit = [' hours', '', ' siblings'][qi], money = qi === 1 ? '$' : '';
  const v = (x) => `${money}${stats.r2(x)}${unit}`;
  const gap = (label) => `<mark>[${label}]</mark>`;
  const fill = (x, label) => (unlocked ? `<mark>${v(x)}</mark>` : gap(label));
  const [e, , all] = truth;
  const shape = GROUPS.every((_, i) => st.shapes[i] === skew(truth[i].xs)) ? skew(e.xs) : null;
  const why = shape === 'positively skewed' ? `the long tail is on the right and the mean (${v(e.mean)}) is bigger than the median (${v(e.median)})`
    : shape === 'negatively skewed' ? `the long tail is on the left and the mean (${v(e.mean)}) is smaller than the median (${v(e.median)})`
      : shape ? `both sides are about even and the mean (${v(e.mean)}) is close to the median (${v(e.median)})` : null;
  return [
    `The mean for 8E was ${fill(e.mean, "8E's mean from Step 1")} compared with ${fill(all.mean, "the All Year 8s mean from Step 1")} for all Year 8s, a difference of ${fill(Math.abs(e.mean - all.mean), 'the bigger mean minus the smaller mean')}.`,
    `The median for 8E was ${fill(e.median, "8E's median")} and for all Year 8s it was ${fill(all.median, "the All Year 8s median")}.`,
    `The range for 8E was ${fill(e.range, "8E's range")} compared with ${fill(all.range, "the All Year 8s range")} for all Year 8s, so 8E's answers are ${unlocked ? `<mark>${e.range > all.range ? 'more' : e.range < all.range ? 'less' : 'just as'} spread out</mark>` : gap('"more" or "less" spread out: a bigger range means more spread out')} than the whole year group.`,
    `The 8E data is ${shape ? `<mark>${shape}</mark>` : gap('the shape you picked for 8E in Step 2')} because ${why ? `<mark>${why}</mark>` : gap('where the long tail of the histogram is, and whether the mean is bigger or smaller than the median')}.`,
    `So 8E ${gap('"can" or "cannot"')} be considered the average Year 8 class for this question, because ${gap('whether the mean, median and range above are close to the whole year\'s or far from them')}.`,
    `A limitation of our survey is ${gap(['one thing that makes the data less reliable, e.g. students guessed how many hours they sleep', 'one thing that makes the data less reliable, e.g. students guessed or didn\'t want to say how much money they have', 'one thing that makes the data less reliable, e.g. some students may have counted step- or half-siblings differently'][qi])}.`,
    `To improve this investigation, I would ${gap('one change that fixes that limitation, e.g. survey a random sample from every Year 8 class, or ask a clearer question')}.`,
  ];
}

function psmt() {
  studying = 'maths';
  const qi = Number(location.hash.split('/')[1] || 0);
  const st = (S.psmt[qi] ||= { cells: {}, shapes: {}, done: false });
  const fields = [['n', 'Count'], ['mean', 'Mean (2 d.p.)'], ['median', 'Median'], ['mode', 'Mode'], ['range', 'Range']];
  const truth = GROUPS.map(([, t]) => { const xs = groupData(qi, t); const s = stats.sorted(xs); return { xs, n: xs.length, mean: stats.r2(stats.mean(xs)), median: stats.median(xs), mode: modes(xs), range: s.at(-1) - s[0] }; });
  const allCells = GROUPS.length * fields.length, okCells = Object.values(st.cells).filter(Boolean).length;
  const unlocked = okCells === allCells;
  view.innerHTML = `
    <h1>PSMT lab – ${esc(PSMT.question)}</h1>
    <p class="muted">Due <b>Fri 13 Nov</b> on DayMap. ${esc(PSMT.rules)}</p>
    <div class="row" style="margin-bottom:12px">${studyButtons('psmt')}</div>
    <div class="row">${SURVEY_QUESTIONS.map((q, i) => `<a class="btn ${i === qi ? '' : 'alt'}" href="#psmt/${i}">Q${i + 1}: ${esc(q)}${S.psmt[i]?.done ? ' (done)' : ''}</a>`).join('')}</div>
    <h2>The data</h2>
    <p class="small muted">Your class survey answers for "${esc(SURVEY_QUESTIONS[qi])}" (from "8E Data collection (Hives)(1-196).xlsx"). Each number is one student.</p>
    <div class="row" style="margin-bottom:10px"><button class="btn ${dataView === 'raw' ? '' : 'alt'}" data-view="raw">As collected</button><button class="btn ${dataView === 'sorted' ? '' : 'alt'}" data-view="sorted">In order (smallest to biggest)</button><button class="btn ${dataView === 'freq' ? '' : 'alt'}" data-view="freq">Frequency table</button></div>
    <div class="grid">${GROUPS.map(([g], gi) => `<div class="card"><h3>${g}</h3><p class="small muted">${truth[gi].n} students</p>${dataBlock(truth[gi].xs)}</div>`).join('')}</div>
    <h2>Step 1 · Calculate it yourself (+5 coins per correct cell)</h2>
    <p class="small muted">Use the data above (or your spreadsheet). Type your answer and press Enter. For more than one mode, type them separated by commas. Stuck? The Teach lessons for 8D and 8E show how.</p>
    <div class="card" style="overflow-x:auto"><table><tr><th></th>${fields.map(([, l]) => `<th>${l}</th>`).join('')}</tr>
      ${GROUPS.map(([g], gi) => `<tr><th>${g}</th>${fields.map(([f]) => { const k = `${gi}:${f}`; return `<td><input type="text" data-k="${k}" value="${esc(st.cells[k] ? (f === 'mode' ? truth[gi].mode.join(', ') : truth[gi][f]) : '')}" ${st.cells[k] ? 'readonly style="border-color:var(--good)"' : ''} size="7"></td>`; }).join('')}</tr>`).join('')}</table>
      <p class="small muted">${okCells}/${allCells} correct</p></div>
    <h2>Step 2 · Shape of each distribution ${unlocked ? '' : '<span class="pill">Locked</span> <span class="small muted">finish step 1 to unlock the histograms</span>'}</h2>
    ${unlocked ? `<div class="grid">${GROUPS.map(([g], gi) => `<div class="card"><h3>${g}</h3>${histogram(truth[gi].xs, qi)}
      <div class="row">${['positively skewed', 'roughly symmetric', 'negatively skewed'].map((sh) => `<button class="btn ${st.shapes[gi] === sh ? 'good' : 'alt'}" data-g="${gi}" data-s="${sh}" style="padding:6px 10px;font-size:13px">${sh}</button>`).join('')}</div>
      ${st.shapes[gi] ? `<p class="small ${st.shapes[gi] === skew(truth[gi].xs) ? 'done' : ''}">${st.shapes[gi] === skew(truth[gi].xs) ? 'Matches the data (mean vs median agrees).' : `Hmm. Mean ${truth[gi].mean} vs median ${truth[gi].median}: where is the long tail?`}</p>` : ''}</div>`).join('')}</div>` : ''}
    <h2>Step 3 · Report checklist (from the task sheet)</h2>
    <div class="card">${PSMT.sections.map(([h, t]) => `<div class="quest"><span><b>${esc(h)}</b><br><span class="small muted">${esc(t)}</span></span></div>`).join('')}</div>
    <h2>Marking criteria</h2><ul>${PSMT.criteria.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
    <h2>Step 4 · Sentences for your report</h2>
    <p class="small muted">Each <mark>highlighted</mark> part tells you exactly what to put there. ${unlocked ? 'The numbers are filled in from Step 1, so check them against yours.' : 'Finish Step 1 and the numbers fill themselves in.'} Rewrite them in your own words.</p>
    <div class="card"><ol class="starters">${starters(qi, truth, unlocked, st).map((x) => `<li>${x}</li>`).join('')}</ol></div>`;
  view.querySelectorAll('[data-view]').forEach((b) => (b.onclick = () => { dataView = b.dataset.view; psmt(); }));
  view.querySelectorAll('input[data-k]').forEach((inp) => (inp.onkeydown = (e) => {
    if (e.key !== 'Enter' || inp.readOnly) return;
    const [gi, f] = inp.dataset.k.split(':'); const t = truth[gi];
    const ok = f === 'mode' ? (() => { const got = inp.value.split(/[ ,]+/).filter(Boolean).map(Number).sort((a, b) => a - b); return got.length === t.mode.length && got.every((v, i) => v === [...t.mode].sort((a, b) => a - b)[i]); })() : checkMaths(inp.value, t[f]);
    if (ok) { st.cells[inp.dataset.k] = 1; day().maths++; S.total++; reward(15, 5, 'Correct'); if (Object.values(st.cells).filter(Boolean).length === allCells) toast('Histograms unlocked'); save(); psmt(); }
    else { inp.style.borderColor = 'var(--bad)'; toast('Not quite: check your working (order the data, count carefully).'); }
  }));
  view.querySelectorAll('[data-g]').forEach((b) => (b.onclick = () => {
    const gi = b.dataset.g; const first = !st.shapes[gi]; st.shapes[gi] = b.dataset.s;
    if (first && b.dataset.s === skew(truth[gi].xs)) reward(15, 10);
    if (GROUPS.every((_, i) => st.shapes[i] === skew(truth[i].xs)) && !st.done) { st.done = true; reward(80, 60, `PSMT question ${qi + 1} complete. +60 coins`); }
    save(); checkBadges(); psmt();
  }));
  bindStudyButtons();
}

// ---------- bosses ----------
const BOSSES = [
  { id: 'ger', name: 'Der Geburtstagsdrache', icon: 'GD', hp: 15, seconds: 600, title: 'German exam boss', make: germanMix },
  { id: 'psmt', name: 'The Skewed Statistic', icon: 'SS', hp: 12, seconds: 480, title: 'Statistics boss', make: () => mixedMaths(Object.keys(TOPICS).filter((n) => n.startsWith('8'))) },
  { id: 'mat', name: 'The Percentage Titan', icon: 'PT', hp: 18, seconds: 900, title: 'Term 4 Maths exam boss', make: () => mixedMaths(Object.keys(TOPICS)) },
];
function bosses() {
  view.innerHTML = `<h1>Boss fights</h1><p class="muted">Timed mock exams. Every right answer hits the boss; 3 wrong answers or running out of time and you lose. First win: +200 coins and a badge.</p>
    <div class="grid">${BOSSES.map((b) => { const r = S.bosses[b.id]; return `<div class="card click bosscard" data-b="${b.id}"><div class="boss">${b.icon}</div><h3>${esc(b.name)}</h3><p class="small muted">${esc(b.title)} · ${b.hp} HP · ${b.seconds / 60} min</p><p class="small">${r ? `${r.won ? '<span class="pill ok">Defeated</span>' : 'Not yet beaten'} · ${r.tries} tries · best ${r.best} hits` : 'Not fought yet'}</p><button class="btn">Fight</button></div>`; }).join('')}</div>`;
  view.querySelectorAll('[data-b]').forEach((c) => { const b = BOSSES.find((x) => x.id === c.dataset.b); c.onclick = () => play({ title: b.name, next: b.make(), limit: b.hp + 3, boss: b }); });
}

// ---------- arcade ----------
const PER_MIN = 25;
function arcade() {
  const open = day().correct >= 20;
  view.innerHTML = `<h1>Arcade</h1>
    <p class="muted">Your own games. Play time costs <b>${PER_MIN} coins per minute</b> (about 3 minutes of study per minute of play). ${open ? '' : `<b>Locked today:</b> get ${20 - day().correct} more answers right first.`}</p>
    <div class="card row" style="justify-content:space-between"><span>Banked play time: <b>${Math.floor(S.playSec / 60)}:${String(S.playSec % 60).padStart(2, '0')}</b> · You have <b>${S.coins} coins</b></span>
      <span class="row">${[5, 10, 15].map((m) => `<button class="btn gold" data-buy="${m}" ${S.coins < m * PER_MIN ? 'disabled' : ''}>Buy ${m} min (${m * PER_MIN} coins)</button>`).join('')}</span></div>
    <div class="grid" style="margin-top:16px">${GAMES.map((g) => `<div class="card ${open && S.playSec > 0 ? 'click' : 'locked'}" data-g="${g.id}"><h3>${esc(g.name)}</h3><p class="small muted">${open ? (S.playSec > 0 ? 'Click to play' : 'Buy play time first') : 'Locked: study first'}</p></div>`).join('')}</div>`;
  view.querySelectorAll('[data-buy]').forEach((b) => (b.onclick = () => { const m = Number(b.dataset.buy); if (S.coins < m * PER_MIN) return; S.coins -= m * PER_MIN; S.playSec += m * 60; save(); hud(); arcade(); }));
  view.querySelectorAll('[data-g]').forEach((c) => (c.onclick = () => { if (!open || S.playSec <= 0) return toast(open ? 'Buy play time first' : 'Get 20 answers right today to unlock'); choose(GAMES.find((g) => g.id === c.dataset.g)); }));
  if (S.godot && S.godot.ends > Date.now()) godotSession();
}

// Pick where to play. Godot runs the real project on this Mac through DevBoard (devboard:// link);
// games without a web build are Godot-only.
function choose(game) {
  if (!game.url) return startGodot(game);
  if (!game.godot) return launch(game);
  const wrap = document.createElement('div'); wrap.className = 'modal';
  wrap.innerHTML = `<div class="card"><h2>${esc(game.name)}</h2><p class="muted">Where do you want to play?</p>
    <div class="row"><button class="btn" id="in-godot">Open in Godot</button><button class="btn alt" id="in-site">Play in site</button><button class="btn alt" id="cancel">Cancel</button></div></div>`;
  document.body.appendChild(wrap);
  const done = () => wrap.remove();
  $('#in-godot', wrap).onclick = () => { done(); startGodot(game); };
  $('#in-site', wrap).onclick = () => { done(); launch(game); };
  $('#cancel', wrap).onclick = done;
  wrap.onclick = (e) => { if (e.target === wrap) done(); };
}

function startGodot(game) {
  const sid = Math.random().toString(36).slice(2, 10);
  S.godot = { id: game.id, name: game.name, sid, ends: Date.now() + S.playSec * 1000 };
  save();
  location.href = `devboard://play?dir=${encodeURIComponent(game.godot)}&secs=${S.playSec}&name=${encodeURIComponent(game.name)}&sid=${sid}`;
  godotSession();
}

// The game runs outside the browser, so the clock is wall time and keeps going with the tab hidden.
// DevBoard warns "Save your game" 30 s before the end and then closes Godot. Ending early tells
// DevBoard to start that 30 s warning now, and those 30 s are charged. DevBoard also reports on
// 127.0.0.1:47620 whether this session's game is still running: if you quit the game yourself, the
// time you didn't use is kept. If DevBoard can't be reached, the timer just keeps running.
function godotSession() {
  if ($('.godot-session')) return;
  const wrap = document.createElement('div'); wrap.className = 'modal godot-session';
  wrap.innerHTML = `<div class="card"><h2>Playing ${esc(S.godot.name)} in Godot</h2>
    <p class="big-num" id="g-left"></p><p class="muted" id="g-msg">DevBoard will remind you to save 30 seconds before your time runs out, then close the game.</p>
    <p class="small muted">Nothing opened? Make sure DevBoard is running, then allow the link when the browser asks.</p>
    <div class="row"><button class="btn alt" id="g-end">End now</button></div></div>`;
  document.body.appendChild(wrap);
  const left = () => Math.max(0, Math.ceil((S.godot.ends - Date.now()) / 1000));
  const finish = (msg) => { clearInterval(tick); S.godot = null; save(); hud(); wrap.remove(); if (location.hash === '#arcade') arcade(); toast(msg); };
  const tick = setInterval(() => {
    S.playSec = left();
    $('#g-left', wrap).textContent = `${Math.floor(S.playSec / 60)}:${String(S.playSec % 60).padStart(2, '0')} left`;
    if (S.playSec <= 30) $('#g-msg', wrap).textContent = 'Save your game. DevBoard is closing it when the timer hits zero.';
    if (S.playSec % 10 === 0) save();
    hud();
    if (!S.playSec) finish('Play time is up. Back to study to earn more.');
  }, 1000);
  let seen = false;
  const poll = setInterval(async () => {
    if (!S.godot) return clearInterval(poll);
    try {
      const st = await (await fetch('http://127.0.0.1:47620/game', { cache: 'no-store' })).json();
      if (st.sid !== S.godot?.sid) return;
      if (st.running) { seen = true; return; }
      if (!seen) return;
      clearInterval(poll);
      const rest = left(); S.playSec = rest;
      finish(`${S.godot.name} closed. ${Math.floor(rest / 60)}:${String(rest % 60).padStart(2, '0')} play time kept.`);
    } catch { /* DevBoard not running or blocked: keep the wall-clock timer */ }
  }, 3000);
  $('#g-end', wrap).onclick = () => {
    location.href = 'devboard://end';
    const rest = Math.max(0, left() - 30);
    S.godot.ends = Date.now(); S.playSec = rest;
    finish(`Session ended. The game closes in 30 seconds, save now. ${Math.floor(rest / 60)}:${String(rest % 60).padStart(2, '0')} play time kept.`);
  };
}

function launch(game) {
  const wrap = document.createElement('div'); wrap.className = 'arcade-frame';
  wrap.innerHTML = `<header><span>${esc(game.name)}</span><span id="left"></span><button class="btn alt" id="stop">Stop & save time</button></header><div class="game-loading" id="loading"><div class="spinner"></div><p><b>Loading ${esc(game.name)}…</b></p><p class="small muted" id="load-msg">Your play timer is paused until the game is ready.</p></div><iframe src="${game.url}" allow="autoplay; fullscreen; gamepad; cross-origin-isolated" allowfullscreen></iframe>`;
  document.body.appendChild(wrap);
  const frame = $('iframe', wrap), loading = $('#loading', wrap);
  let pageLoaded = false, ready = false, waited = 0;
  frame.onload = () => { pageLoaded = true; };
  const fmt = () => `${Math.floor(S.playSec / 60)}:${String(S.playSec % 60).padStart(2, '0')}`;
  // Godot web exports hide their #status splash once the engine has started.
  // The games share this site's origin, so we can look inside; if not, the page load counts as ready.
  const gameStarted = () => {
    if (!pageLoaded) return false;
    try { const st = frame.contentDocument.getElementById('status'); return !st || getComputedStyle(st).display === 'none' || st.style.visibility === 'hidden'; } catch { return true; }
  };
  // Freeze / pause-menu detection. Right after each frame the game draws, take a tiny 16x16 sample
  // of its canvas (WebGL clears the image after the frame, so it has to be sampled inside that frame).
  // If no frames arrive, or the picture hasn't changed for STILL seconds, the game is frozen or sitting
  // on a pause menu, so the timer stops until the picture moves again.
  const STILL = 3;
  const probe = document.createElement('canvas'); probe.width = probe.height = 16;
  const pctx = probe.getContext('2d', { willReadFrequently: true });
  let lastFrame = 0, lastChange = 0, lastSig = '', lastSample = 0, hooked = null, hookFailed = false;
  const sample = () => {
    const now = Date.now(); lastFrame = now;
    if (now - lastSample < 250) return; lastSample = now;
    try {
      const c = frame.contentDocument.querySelector('canvas'); if (!c || !c.width) return;
      pctx.clearRect(0, 0, 16, 16); pctx.drawImage(c, 0, 0, 16, 16);
      const d = pctx.getImageData(0, 0, 16, 16).data; let h = 0;
      for (let i = 0; i < d.length; i++) h = (h * 31 + d[i]) | 0;
      if (h !== lastSig) { lastSig = h; lastChange = now; }
    } catch { lastChange = now; } // can't read the picture: never block the timer
  };
  const hook = () => {
    const w = frame.contentWindow; if (!w || w === hooked) return;
    hooked = w; lastFrame = lastChange = Date.now();
    try {
      const raf = w.requestAnimationFrame.bind(w);
      w.requestAnimationFrame = (cb) => raf((t) => { cb(t); sample(); });
    } catch { hookFailed = true; } // other-origin game: can't look inside, timer just runs
  };
  const frozen = () => !hookFailed && Date.now() - Math.min(lastFrame, lastChange) > STILL * 1000;
  const close = () => { clearInterval(tick); wrap.remove(); save(); hud(); arcade(); };
  const tick = setInterval(() => {
    hook();
    if (!ready) {
      waited++;
      if (gameStarted()) { ready = true; loading.remove(); lastFrame = lastChange = Date.now(); }
      else {
        $('#left', wrap).textContent = `Paused · ${fmt()} left (waiting for the game to load)`;
        if (waited >= 6) $('#load-msg', wrap).textContent = `Still working, this one is taking a while (${waited}s). Big games can take up to a minute. Your timer stays paused.`;
        return;
      }
    }
    if (document.visibilityState !== 'visible' || frozen()) {
      $('#left', wrap).textContent = `Paused · ${fmt()} left (game frozen or on a pause screen)`;
      return;
    }
    S.playSec = Math.max(0, S.playSec - 1);
    $('#left', wrap).textContent = `${fmt()} left`;
    if (S.playSec % 10 === 0) save();
    if (!S.playSec) { close(); toast('Play time is up. Back to study to earn more.'); }
  }, 1000);
  $('#stop', wrap).onclick = close;
}

// ---------- router ----------
function reportPage() { studying = 'maths'; report({ view, esc, toast }); }
const ROUTES = { home, teach, german, maths, psmt, report: reportPage, boss: bosses, arcade };
function route() {
  studying = null;
  if (session) { clearInterval(session.timer); session = null; }
  document.onkeydown = null;
  const r = (location.hash.slice(1).split('/')[0]) || 'home';
  (ROUTES[r] || home)(); hud(); window.scrollTo(0, 0);
}
addEventListener('hashchange', route);
day(); route();
