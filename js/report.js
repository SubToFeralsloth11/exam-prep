// PSMT final report writer: walks through every part of "3.8 Maths Assignment (Data) Final submission",
// saves each answer as you type, and exports the filled-in Word document (or a plain-text backup).
// It never writes answers for you: it explains each part, shows your paper draft notes and gives
// sentence starters with gaps.
import { SURVEY, SURVEY_QUESTIONS } from './data.js';
import { stats } from './maths.js';

const KEY = 'examquest.report.v1';
const DUE = new Date('2026-11-13T15:00:00+10:00');
const TEMPLATE = 'assets/psmt-final-template.docx';
const QUESTIONS = ['How many hours do you sleep in a day?', 'How much money do you have in your bank account?', 'How many siblings do you have in your family?'];
const UNITS = [' hours', '', ' siblings'];
const GROUPS = [['8E (your class)', (c) => c === '8E'], ['8G (other class)', (c) => c === '8G'], ['All Year 8s', () => true]];

// Each part: section in the Word document, what it asks, steps to follow, keyword checks, sentence
// starters (gaps in [brackets]) and what you wrote on the paper draft. `mins` = suggested share of time.
const PARTS = [
  { id: 'survey', sec: 'survey', title: 'Survey question investigated', mins: 2, ask: 'Write the ONE survey question your report is about, exactly as it was asked.',
    steps: ['Pick one of the three class questions (the picker above).', 'Copy its wording. It should be a question with a number answer.'],
    checks: [['ends with a question mark', /\?\s*$/]], starters: [], draft: ['Paper draft: sleep, money in bank, siblings. Your draft results talk about sleep.'] },

  { id: 'aim', sec: 'intro', title: 'Introduction: the aim', mins: 5, ask: 'Describe the aim of the investigation: what are you trying to find out, and why?',
    steps: ['Say what you are comparing: 8E with another class and the whole Year 8 cohort.', 'Name your survey question.', 'Say what "average class" means: its results are close to the whole year group.'],
    checks: [['mentions 8E / our class', /8e|our class|my class/i], ['mentions the whole Year 8 / cohort', /cohort|year 8|yr ?8/i], ['says what "average" means', /average|typical|represent/i]],
    starters: ['The aim of this investigation is to find out whether [what you want to know] .', 'To do this, I will compare [which groups] using the question "[survey question]".'],
    draft: ['Investigation question: Can the opinions of our class be used to represent the "average" Year 8 class at The Gap?'] },

  { id: 'obs', sec: 'intro', title: 'Introduction: observations', mins: 5, ask: 'Background facts you know that help you plan the investigation (context).',
    steps: ['How many students are in 8E, in 8G, and in all of Year 8 who answered? (Use the data card below.)', 'Anything you already know about the topic, e.g. how much sleep teenagers are told to get.', 'Write 2 or 3 facts, each with a number if you can.'],
    checks: [['uses a number', /\d/], ['mentions how many students', /students|responses|people/i]],
    starters: ['There are [number] students in 8E who answered the survey, compared with [number] across all Year 8 classes.', 'I already know that [a fact about the topic].'],
    draft: ['Task sheet example: "There are 312 students in the Year 8 cohort this year."'] },

  { id: 'assume', sec: 'intro', title: 'Introduction: assumptions', mins: 5, ask: 'Things you pretend are true even though they might affect accuracy, and what to think about before starting.',
    steps: ['Think about honesty: did people tell the truth?', 'Think about accuracy: did they guess or round (whole numbers only)?', 'Think about who answered: is everyone who answered really in that class?', 'For each one, say how it could affect your results.'],
    checks: [['an assumption ("we assume…")', /assum/i], ['says how it affects results', /affect|impact|accura|because|so /i]],
    starters: ['We assume that [something about the people answering], so [how that affects the data].', 'Before beginning, we need to consider [something that could go wrong].'],
    draft: ['Task sheet example: "We assume that everyone who answers the survey questions is being honest, so our data is accurate."'] },

  { id: 'steps', sec: 'intro', title: 'Introduction: steps to investigate', mins: 4, ask: 'Describe the steps you will take, in order.',
    steps: ['Turn your paper draft boxes into sentences.', 'Use order words: first, then, next, finally.'],
    checks: [['uses order words', /first|then|next|finally/i], ['mentions collecting data', /collect|survey/i], ['mentions analysing (mean/median/graphs)', /analys|mean|median|graph|histogram/i]],
    starters: ['First, [step 1]. Then [step 2]. Next, [step 3]. Finally, [step 4].'],
    draft: ['Your draft (Step 2): Design survey questions with numerical responses -> Collect survey data from our class and other Yr 8 classes -> Analyse and compare using mean, median, mode and range, and show (graphs) -> Analyse to determine whether our class represents the avg Yr 8 cohort.'] },

  { id: 'collect', sec: 'solve', title: 'Solve: collecting, collating and analysing', mins: 6, ask: 'Describe how the data was collected (the survey), collated (put into Excel and frequency tables) and analysed.',
    steps: ['Collected: how was the survey given? (an online form all Year 8 classes filled in).', 'Collated: the answers went into the spreadsheet, then sorted and put in frequency tables.', 'Analysed: calculated count, mean, median, mode and range, and made histograms.'],
    checks: [['collected', /collect|survey|form/i], ['collated (spreadsheet / frequency table)', /excel|spreadsheet|frequency|table|sort/i], ['analysed (stats / histogram)', /mean|median|histogram|graph/i]],
    starters: ['The data was collected by [how].', 'It was then collated by [what you did in Excel].', 'To analyse it, I [what you calculated and made].'],
    draft: [] },

  { id: 'describe', sec: 'solve', title: 'Solve: centre, spread and shape of 8E', mins: 8, ask: 'Describe YOUR class data with numbers: centre (mean, median, mode), spread (range) and shape (skew).',
    steps: ['Copy the 8E mean, median and mode from your Excel sheet (check them against the data card).', 'Give the range and say what it tells you (how spread out answers are).', 'Look at the 8E histogram: where is the long tail? Right = positively skewed, left = negatively skewed, even = symmetric.', 'Mention any outlier (an unusual value far from the rest).'],
    checks: [['mean', /mean/i], ['median', /median/i], ['mode', /mode/i], ['range', /range/i], ['shape / skew', /skew|symmetric/i]],
    starters: ['For 8E, the mean was [number], the median was [number] and the mode was [number].', 'The range was [number], which shows [how spread out the answers were].', 'The histogram is [shape] because [where the tail is / mean vs median].'],
    draft: ['Your draft: "most results were 8-9 hrs of sleep but some students put down 0 hrs of sleep."'] },

  { id: 'compare', sec: 'solve', title: 'Solve: compare 8E, 8G and all Year 8s', mins: 10, ask: 'Compare your class with another class AND the whole cohort, using numbers and differences. The histograms go in your document after this part.',
    steps: ['Centre: compare the 8E mean and median with 8G and with all Year 8s. Say the difference ("0.3 hours less").', 'Spread: compare the ranges. Bigger range = more spread out.', 'Shape: are the histograms the same shape?', 'Say which group 8E is closer to.'],
    checks: [['mentions 8G', /8g/i], ['mentions all Year 8s / cohort', /cohort|all year 8|all yr|whole year/i], ['gives a difference', /differ|more than|less than|higher|lower|bigger|smaller/i], ['compares spread', /range|spread/i]],
    starters: ['The 8E mean was [number] compared with [number] for 8G and [number] for all Year 8s, a difference of [number].', 'The range for 8E was [number], while all Year 8s had a range of [number], so [which one is more spread out].', 'Both histograms are [shape], which shows [similar / different].'],
    draft: [] },

  { id: 'solveend', sec: 'solve', title: 'Solve: what the data tells you', mins: 4, ask: 'Draw a conclusion from your data to answer the original question.',
    steps: ['Look at your comparisons: were the numbers close or far apart?', 'Answer the question with "can" or "cannot", plus your main reason with a number.'],
    checks: [['answers can / cannot', /\bcan(not|'t)?\b/i], ['backs it with a number', /\d/]],
    starters: ['From this data, 8E [can / cannot] represent the average Year 8 class for this question, because [reason with numbers].'],
    draft: ['Your draft: "8E can be used to represent an avg class based on a small sample."'] },

  { id: 'reasonable', sec: 'eval', title: 'Evaluate: is the conclusion reasonable?', mins: 4, ask: 'Do you think your conclusion is reasonable? Link back to your assumptions and observations.',
    steps: ['Re-read your assumptions: did any turn out to be wrong (e.g. someone answered 0 hours)?', 'Say whether that changes how much you trust your conclusion.'],
    checks: [['refers to an assumption or observation', /assum|observ|honest/i], ['gives a judgement', /reasonable|trust|reliable|accurate/i]],
    starters: ['I think my conclusion is [reasonable / partly reasonable] because [reason].', 'Our assumption that [assumption] may not be true, because [evidence from the data].'],
    draft: ['Your draft: "Data was expected, most results were 8-9 hrs of sleep but some students put down 0 hrs of sleep."'] },

  { id: 'census', sec: 'eval', title: 'Evaluate: sample vs census', mins: 5, ask: 'Explain the difference between sample and census data, which one yours is, and how that affects the evidence.',
    steps: ['Sample = part of the population; census = everyone in the population.', 'Is 8E a sample or a census of Year 8? Is the "All Year 8s" data a census? (Did all ~312 answer?)', 'Give one benefit and one disadvantage of each (your draft table has these).'],
    checks: [['sample', /sample/i], ['census', /census/i], ['says which one yours is', /(is|was) a (sample|census)/i]],
    starters: ['A sample is [meaning], while a census is [meaning].', 'Our 8E data is a [sample / census] of Year 8, because [reason].', 'A benefit of a sample is [benefit], but [disadvantage].'],
    draft: ['Your draft table: Sample = a smaller group of a population, used when you want data quickly. Benefits: easier to collect, easier to manage. Disadvantages: could be inaccurate, could lead to bias.', 'Census = a survey completed by the whole population, used every couple of years. Benefits: more to work with, see the whole picture. Disadvantages: time consuming to collect.'] },

  { id: 'strengths', sec: 'eval', title: 'Evaluate: strengths and limitations', mins: 5, ask: 'Strengths and limitations of how the investigation was done.',
    steps: ['One or two strengths (what worked well).', 'Two or three limitations (what makes the data less reliable).', 'For each limitation, say how it affects the results.'],
    checks: [['a strength', /strength|good|worked well|easy/i], ['a limitation', /limitation|problem|dishonest|not every|small/i]],
    starters: ['A strength of our investigation was [strength], because [why it helped].', 'A limitation was [limitation], which means [effect on the data].'],
    draft: ['Your draft: Strengths: easy to collect; class can identify spread of data. Limitations: some answers dishonest; not every student in Yr 8 answered the survey; sample too small.'] },

  { id: 'improve', sec: 'eval', title: 'Evaluate: improvements', mins: 4, ask: 'Suggest improvements that fix EACH limitation you named (that is what the marker checks).',
    steps: ['Go through your limitations one at a time.', 'Write one improvement that fixes each one.'],
    checks: [['an improvement', /improv|next time|should|could/i]],
    starters: ['To fix [limitation], next time we could [improvement].'],
    draft: ['Your draft: answers should be multiple choice; needs reasonable questions; should be completed at the same time.'] },

  { id: 'size', sec: 'eval', title: 'Evaluate: why sample size matters', mins: 4, ask: 'Why the size of the data sets (22 students vs 196 students) matters for your conclusions.',
    steps: ['Compare the sizes using numbers (data card below).', 'A small group is affected more by one unusual answer (outlier).', 'So what does that mean for comparing 8E to the whole year?'],
    checks: [['uses the sizes', /\d{2,3}/], ['mentions outliers or reliability', /outlier|unusual|reliab|accura|affect/i]],
    starters: ['8E only had [number] responses, compared with [number] for the whole year.', 'This matters because in a small sample [what one unusual answer does].'],
    draft: ['Your draft: "It impacted our conclusions as it was a small sample size."'] },

  { id: 'restate', sec: 'concl', title: 'Conclusion: context and aim', mins: 3, ask: 'Restate what you were investigating and why.',
    steps: ['One or two sentences. Same idea as your aim, but in different words.'],
    checks: [['mentions 8E', /8e|our class/i]],
    starters: ['This investigation aimed to [aim].'],
    draft: ['Your draft (Q): "Can the opinions of 8E be used to represent the average Yr 8 class?"'] },

  { id: 'evidence', sec: 'concl', title: 'Conclusion: summary of evidence', mins: 4, ask: 'Summarise the evidence, using one or two specific numbers (centre, spread).',
    steps: ['Pick your strongest one or two numbers (e.g. 8E mean vs all Year 8 mean, and the ranges).', 'Say what they show.'],
    checks: [['uses numbers', /\d/], ['uses a measure (mean/median/range)', /mean|median|mode|range/i]],
    starters: ['The data showed that [main finding with numbers].'],
    draft: ['Your draft (E): "the majority of Yr 8 students sleep 8-9 hrs a day."'] },

  { id: 'answer', sec: 'concl', title: 'Conclusion: answer the question', mins: 3, ask: 'Answer the original investigation question clearly, and say how confident you are.',
    steps: ['Can or cannot?', 'Add the "but": how sample size or limitations affect your answer.'],
    checks: [['answers can / cannot', /\bcan(not|'t)?\b/i]],
    starters: ['Therefore, 8E [can / cannot] be used to represent the average Year 8 class, although [limitation].'],
    draft: ['Your draft (O): "8E can be used to represent an avg class based on a small sample."'] },
];
const SECTIONS = { intro: 'Introduction', solve: 'Solve', eval: 'Evaluate and verify', concl: 'Conclusion' };

const load = () => Object.assign({ name: '', teacher: 'Mr Hives', q: 0, a: {}, hist: true }, JSON.parse(localStorage.getItem(KEY) || '{}'));
let R = load(), cur = 0;
const save = () => localStorage.setItem(KEY, JSON.stringify(R));
const words = (s = '') => (s.trim() ? s.trim().split(/\s+/).length : 0);
const totalWords = () => PARTS.reduce((n, p) => n + words(R.a[p.id]), 0);

function groupStats(q) {
  return GROUPS.map(([g, t]) => {
    const xs = Object.entries(SURVEY).filter(([c]) => t(c)).flatMap(([, rows]) => rows.map((r) => r[q])), s = stats.sorted(xs);
    const f = {}; xs.forEach((x) => (f[x] = (f[x] || 0) + 1)); const top = Math.max(...Object.values(f));
    return { g, xs, n: xs.length, mean: stats.r2(stats.mean(xs)), median: stats.median(xs), mode: Object.keys(f).filter((k) => f[k] === top).join(', '), range: s.at(-1) - s[0], min: s[0], max: s.at(-1) };
  });
}

// ---------- timer ----------
function left() {
  const ms = DUE - Date.now();
  if (ms <= 0) return 'Time is up: download it now';
  const h = Math.floor(ms / 36e5), m = Math.floor((ms % 36e5) / 6e4), s = Math.floor((ms % 6e4) / 1e3);
  return `${h ? `${h}h ` : ''}${m}m ${String(s).padStart(2, '0')}s left until 3:00 pm`;
}
// Where you should be by now if the remaining time is shared out by each unfinished part's `mins`.
function pace() {
  const todo = PARTS.filter((p) => words(R.a[p.id]) < 15);
  if (!todo.length) return 'Every part has an answer. Read it through, then download.';
  const ms = DUE - Date.now(), need = todo.reduce((n, p) => n + p.mins, 0) + 5;
  const per = Math.max(0, ms / 6e4) / need;
  return `${todo.length} parts to go. At this pace: about ${Math.max(1, Math.round(per * todo[0].mins))} min for "${todo[0].title}", leaving 5 min to check and download.`;
}
let tick;

// ---------- page ----------
export function report({ view, esc, toast }) {
  clearInterval(tick);
  const p = PARTS[cur], st = groupStats(R.q), unit = UNITS[R.q], money = R.q === 1 ? '$' : '';
  const text = R.a[p.id] || '';
  view.innerHTML = `
    <div class="rp-timer card"><b id="rp-left">${left()}</b><span class="small muted" id="rp-pace">${esc(pace())}</span></div>
    <h1>PSMT final report</h1>
    <p class="muted small">Write every answer in your own words; the Word file saves your typing straight into the real assignment layout. Everything saves as you type, in this browser.</p>
    <div class="card row">
      <label>Your name <input id="rp-name" value="${esc(R.name)}" size="16"></label>
      <label>Teacher <input id="rp-teacher" value="${esc(R.teacher)}" size="12"></label>
      <label>Survey question <select id="rp-q">${SURVEY_QUESTIONS.map((q, i) => `<option value="${i}" ${i === R.q ? 'selected' : ''}>${esc(q)}</option>`).join('')}</select></label>
      <span class="pill" id="rp-words">${totalWords()} words (aim 400–600)</span>
    </div>
    <div class="rp-wrap">
      <ol class="rp-list">${PARTS.map((x, i) => `<li class="${i === cur ? 'on' : ''} ${words(R.a[x.id]) >= 15 ? 'done' : ''}" data-i="${i}">${esc(x.title)}</li>`).join('')}</ol>
      <div>
        <div class="card">
          <p class="small muted">Part ${cur + 1} of ${PARTS.length}</p>
          <h2 style="margin-top:0">${esc(p.title)}</h2>
          <p>${esc(p.ask)}</p>
          <h3>Do it step by step</h3><ol>${p.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
          ${p.draft.length ? `<h3>From your paper draft</h3>${p.draft.map((d) => `<p class="small rp-draft">${esc(d)}</p>`).join('')}` : ''}
          ${p.starters.length ? `<details><summary>Stuck? Show sentence starters</summary><p class="small muted">Replace every [bracket] with your own words and numbers. Don't copy the brackets.</p><ul>${p.starters.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></details>` : ''}
          <textarea id="rp-text" rows="9" placeholder="Type your answer here…">${esc(text)}</textarea>
          <div class="row small"><span id="rp-pw">${words(text)} words</span>${p.checks.map(([l, re]) => `<span class="rp-chk ${re.test(text) ? 'ok' : ''}" data-l="${esc(l)}">${re.test(text) ? 'Has' : 'Missing'}: ${esc(l)}</span>`).join('')}</div>
          <div class="row" style="margin-top:10px">${cur ? '<button class="btn alt" id="rp-prev">Back</button>' : ''}${cur < PARTS.length - 1 ? '<button class="btn" id="rp-next">Next part</button>' : ''}</div>
        </div>
        ${['describe', 'compare', 'solveend', 'obs', 'size', 'evidence'].includes(p.id) ? `<div class="card" style="margin-top:14px"><h3 style="margin-top:0">Data card: ${esc(SURVEY_QUESTIONS[R.q])}</h3>
          <p class="small muted">Check these against your Excel sheet ("8E Data collection (Hives) - with graphs.xlsx" in Downloads).</p>
          <table><tr><th></th><th>Count</th><th>Mean</th><th>Median</th><th>Mode</th><th>Lowest</th><th>Highest</th><th>Range</th></tr>
          ${st.map((s) => `<tr><th>${s.g}</th><td>${s.n}</td><td>${money}${s.mean}</td><td>${money}${s.median}</td><td>${money}${s.mode}</td><td>${money}${s.min}</td><td>${money}${s.max}</td><td>${money}${s.range}${unit}</td></tr>`).join('')}</table>
          <div class="grid">${st.map((s, i) => `<div><p class="small"><b>${s.g}</b></p><canvas data-h="${i}" width="420" height="240"></canvas></div>`).join('')}</div></div>` : ''}
        <div class="card" style="margin-top:14px">
          <h3 style="margin-top:0">Finish</h3>
          <label class="small"><input type="checkbox" id="rp-hist" ${R.hist ? 'checked' : ''}> Put the three histograms into the Word file (after the comparison). Untick if you paste your Excel graphs in yourself.</label>
          <div class="row" style="margin-top:10px"><button class="btn" id="rp-docx">Download Word document (.docx)</button><button class="btn alt" id="rp-txt">Download backup (.txt)</button><button class="btn alt" id="rp-copy">Copy all answers</button></div>
          <p class="small muted">If the Word download fails: download the backup, open the assignment in Word, and paste each part under its heading.</p>
        </div>
      </div>
    </div>`;

  const $ = (s) => view.querySelector(s);
  view.querySelectorAll('canvas[data-h]').forEach((c) => drawHist(c, st[c.dataset.h].xs, R.q));
  tick = setInterval(() => { if (!document.body.contains($('#rp-left'))) return clearInterval(tick); $('#rp-left').textContent = left(); $('#rp-pace').textContent = pace(); }, 1000);
  const ta = $('#rp-text');
  ta.oninput = () => {
    R.a[p.id] = ta.value; save();
    $('#rp-pw').textContent = `${words(ta.value)} words`; $('#rp-words').textContent = `${totalWords()} words (aim 400–600)`;
    view.querySelectorAll('.rp-chk').forEach((el, i) => { const ok = p.checks[i][1].test(ta.value); el.classList.toggle('ok', ok); el.textContent = `${ok ? 'Has' : 'Missing'}: ${p.checks[i][0]}`; });
  };
  ta.focus();
  if (p.id === 'survey' && !text) ta.placeholder = `e.g. the exact wording of "${SURVEY_QUESTIONS[R.q]}" from the survey`;
  const rerender = () => report({ view, esc, toast });
  $('#rp-name').oninput = (e) => { R.name = e.target.value; save(); };
  $('#rp-teacher').oninput = (e) => { R.teacher = e.target.value; save(); };
  $('#rp-q').onchange = (e) => { R.q = Number(e.target.value); save(); rerender(); };
  $('#rp-hist').onchange = (e) => { R.hist = e.target.checked; save(); };
  view.querySelectorAll('.rp-list li').forEach((li) => (li.onclick = () => { cur = Number(li.dataset.i); rerender(); }));
  if ($('#rp-prev')) $('#rp-prev').onclick = () => { cur--; rerender(); };
  if ($('#rp-next')) $('#rp-next').onclick = () => { cur++; rerender(); };
  $('#rp-txt').onclick = () => download(new Blob([plainText()], { type: 'text/plain' }), 'PSMT report answers (backup).txt');
  $('#rp-copy').onclick = () => navigator.clipboard.writeText(plainText()).then(() => toast('All answers copied'), () => toast('Copy failed: use the backup download'));
  $('#rp-docx').onclick = async () => {
    try {
      const tpl = new Uint8Array(await (await fetch(TEMPLATE)).arrayBuffer());
      const imgs = R.hist ? await Promise.all(st.map(async (s) => ({ title: `${s.g}: ${SURVEY_QUESTIONS[R.q]}`, png: await histPng(s.xs, R.q) }))) : [];
      download(new Blob([await buildDocx(tpl, R, imgs)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), `3.8 Maths Assignment (Data) Final submission - ${R.name || 'me'}.docx`);
      toast('Word document downloaded');
    } catch (e) { console.error(e); toast('Word export failed: downloading the backup instead'); $('#rp-txt').click(); }
  };
}

function plainText() {
  const out = [`Student name: ${R.name}`, 'Class: 8E', `Teacher name: ${R.teacher}`, '', 'Investigation question: Can we use the opinions of our class to represent the "average" Year 8 class?'];
  let sec = '';
  for (const p of PARTS) {
    if (p.sec !== sec) { sec = p.sec; out.push('', p.sec === 'survey' ? 'Survey question investigated:' : SECTIONS[sec].trim().toUpperCase()); }
    out.push(`[${p.title}]`, R.a[p.id] || '', '');
  }
  return out.join('\n');
}
function download(blob, name) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

// ---------- histograms ----------
function bins(xs, q) {
  const s = stats.sorted(xs), lo = q === 1 ? 0 : Math.min(0, s[0]), hi = s.at(-1);
  const w = q === 1 ? 1000 : q === 0 ? 2 : 1, n = Math.floor((hi - lo) / w) + 1;
  const counts = Array(n).fill(0); xs.forEach((x) => counts[Math.floor((x - lo) / w)]++);
  return counts.map((c, i) => [w === 1 ? `${lo + i}` : `${lo + i * w}–${lo + (i + 1) * w - 1}`, c]);
}
function drawHist(c, xs, q, light, W = c.width, H = c.height) {
  const g = c.getContext('2d'), b = bins(xs, q), max = Math.max(...b.map(([, n]) => n));
  const fg = light ? '#222' : '#c8cede', L = 34, B = 40, bw = (W - L - 10) / b.length;
  g.clearRect(0, 0, W, H); if (light) { g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); }
  g.font = '11px Arial'; g.textAlign = 'center'; g.strokeStyle = fg; g.fillStyle = fg;
  b.forEach(([lab, n], i) => {
    const h = (n / max) * (H - B - 16), x = L + i * bw, y = H - B - h;
    g.fillStyle = '#5b8cff'; g.fillRect(x, y, bw, h); g.strokeStyle = light ? '#fff' : '#111'; g.strokeRect(x, y, bw, h);
    g.fillStyle = fg; g.fillText(lab, x + bw / 2, H - B + 13); if (n) g.fillText(n, x + bw / 2, y - 3);
  });
  g.fillText(['Hours of sleep', 'Money in bank ($)', 'Number of siblings'][q], L + (W - L) / 2, H - 8);
  g.save(); g.translate(11, (H - B) / 2); g.rotate(-Math.PI / 2); g.fillText('Frequency', 0, 0); g.restore();
}
function histPng(xs, q) {
  const c = document.createElement('canvas'); c.width = 840; c.height = 420;
  c.getContext('2d').scale(2, 2);
  drawHist(c, xs, q, true, 420, 210);
  return new Promise((ok) => c.toBlob(async (bl) => ok(new Uint8Array(await bl.arrayBuffer())), 'image/png'));
}

// ---------- .docx (zip) ----------
const CRC = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = (d) => { let c = ~0; for (const b of d) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return ~c >>> 0; };
async function inflate(d) { return new Uint8Array(await new Response(new Blob([d]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer()); }
async function unzip(buf) {
  const v = new DataView(buf.buffer, buf.byteOffset); let e = buf.length - 22; while (v.getUint32(e, true) !== 0x06054b50) e--;
  const files = new Map(); let p = v.getUint32(e + 16, true);
  for (let i = v.getUint16(e + 10, true); i--;) {
    const method = v.getUint16(p + 10, true), size = v.getUint32(p + 20, true), nl = v.getUint16(p + 28, true), xl = v.getUint16(p + 30, true), cl = v.getUint16(p + 32, true), off = v.getUint32(p + 42, true);
    const name = new TextDecoder().decode(buf.subarray(p + 46, p + 46 + nl));
    const start = off + 30 + v.getUint16(off + 26, true) + v.getUint16(off + 28, true), raw = buf.subarray(start, start + size);
    files.set(name, method === 8 ? await inflate(raw) : raw.slice());
    p += 46 + nl + xl + cl;
  }
  return files;
}
function zip(files) {
  const parts = [], central = []; let off = 0;
  for (const [name, data] of files) {
    const n = new TextEncoder().encode(name), crc = crc32(data);
    const h = new DataView(new ArrayBuffer(30)); h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, n.length, true);
    const c = new DataView(new ArrayBuffer(46)); c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true); c.setUint16(28, n.length, true); c.setUint32(42, off, true);
    parts.push(new Uint8Array(h.buffer), n, data); central.push(new Uint8Array(c.buffer), n); off += 30 + n.length + data.length;
  }
  const size = central.reduce((s, x) => s + x.length, 0), e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.size, true); e.setUint16(10, files.size, true); e.setUint32(12, size, true); e.setUint32(16, off, true);
  return new Blob([...parts, ...central, new Uint8Array(e.buffer)]);
}

const xmlEsc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const run = (t, bold) => `<w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>${bold ? '<w:b/>' : ''}<w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr><w:t xml:space="preserve">${xmlEsc(t)}</w:t></w:r>`;
const para = (inner) => `<w:p><w:pPr><w:spacing w:line="360" w:lineRule="auto"/></w:pPr>${inner}</w:p>`;
const paras = (t) => t.split(/\n+/).map((l) => l.trim()).filter(Boolean).map((l) => para(run(l))).join('');
function picture(rid, id, title) {
  const cx = 5486400, cy = 2743200;
  return para(run(title, true)) + `<w:p><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${900 + id}" name="Histogram ${id}"/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="${900 + id}" name="hist${id}.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
}
// Inserts `xml` right after the first match of `after` at or beyond `from`.
function insertAfter(doc, from, after, xml) { const i = doc.indexOf(after, doc.indexOf(from)); if (i < 0) throw new Error(`missing ${after} after ${from}`); return doc.slice(0, i + after.length) + xml + doc.slice(i + after.length); }

export async function buildDocx(template, r, imgs = []) {
  const files = await unzip(template), dec = new TextDecoder(), enc = new TextEncoder();
  let doc = dec.decode(files.get('word/document.xml'));
  doc = insertAfter(doc, '>Student name:<', '</w:r>', run(` ${r.name}`));
  doc = insertAfter(doc, '>lass<', '<w:t>8</w:t></w:r>', run('E'));
  doc = insertAfter(doc, '>Teacher name<', '<w:t xml:space="preserve">: </w:t></w:r>', run(r.teacher));
  doc = insertAfter(doc, '>Final </w:t>', '<w:t xml:space="preserve"> </w:t></w:r>', run('13 November 2026'));
  const sq = doc.indexOf('</w:pPr></w:p>', doc.indexOf('Survey question investigated'));
  doc = doc.slice(0, sq) + '</w:pPr>' + run(r.a.survey || '') + '</w:p>' + doc.slice(sq + 14);
  let rels = dec.decode(files.get('word/_rels/document.xml.rels')), types = dec.decode(files.get('[Content_Types].xml'));
  const pics = imgs.map((im, i) => {
    files.set(`word/media/eqhist${i}.png`, im.png);
    rels = rels.replace('</Relationships>', `<Relationship Id="rIdEQ${i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/eqhist${i}.png"/></Relationships>`);
    return picture(`rIdEQ${i}`, i, im.title);
  }).join('');
  if (imgs.length && !/Extension="png"/i.test(types)) types = types.replace('<Default ', '<Default Extension="png" ContentType="image/png"/><Default ');
  for (const [sec, heading] of Object.entries(SECTIONS)) {
    const body = PARTS.filter((p) => p.sec === sec).map((p) => paras(r.a[p.id] || '') + (p.id === 'compare' ? pics : '')).join('');
    doc = insertAfter(doc, `>${heading}<`, '</w:tbl>', body);
  }
  files.set('word/document.xml', enc.encode(doc));
  files.set('word/_rels/document.xml.rels', enc.encode(rels));
  files.set('[Content_Types].xml', enc.encode(types));
  return zip(files);
}
