// Term 4 Year 8 Maths (Cambridge Essential 8), from Mr Hives' Term 4 planner:
// 3H–3K percentages, 6A/6B ratios, 6D/6E/6G rates, 8B–8F statistics.
// Each generator returns { q, a, steps, choices? }. `a` is a number or a string.
const R = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const pick = (xs) => xs[R(0, xs.length - 1)];
const r2 = (x) => Math.round(x * 100) / 100;
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const money = (x) => `$${r2(x).toFixed(2).replace(/\.00$/, '')}`;
const shuffle = (xs) => xs.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);
const sorted = (xs) => [...xs].sort((a, b) => a - b);
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const median = (xs) => { const s = sorted(xs), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const mc = (q, right, wrong, steps) => ({ q, a: right, choices: shuffle([right, ...wrong]), steps });

export const TOPICS = {
  '3H Finding & expressing percentages': () => pick([
    () => { const p = pick([5, 10, 12, 15, 20, 25, 30, 40, 75]), x = R(2, 40) * 20; return { q: `Find ${p}% of ${x}`, a: r2(p / 100 * x), steps: `${p} ÷ 100 × ${x} = ${r2(p / 100 * x)}` }; },
    () => { const b = pick([20, 25, 40, 50, 80, 200]), a = R(1, b - 1); return { q: `Express ${a} out of ${b} as a percentage`, a: r2(a / b * 100), steps: `${a} ÷ ${b} × 100 = ${r2(a / b * 100)}%` }; },
    () => { const a = R(15, 90), b = pick([1, 2, 4]) * 60; return { q: `Express ${a} minutes as a percentage of ${b / 60} hour(s) (2 d.p.)`, a: r2(a / b * 100), steps: `Same units first: ${b / 60} h = ${b} min. ${a} ÷ ${b} × 100 = ${r2(a / b * 100)}%` }; },
    () => { const a = R(20, 95) * 10, b = pick([1, 2, 5]); return { q: `Express ${a} g as a percentage of ${b} kg`, a: r2(a / (b * 1000) * 100), steps: `${b} kg = ${b * 1000} g. ${a} ÷ ${b * 1000} × 100 = ${r2(a / (b * 1000) * 100)}%` }; },
    () => { const p = pick([12.5, 25, 37.5, 60, 87.5]); return { q: `Write ${p}% as a decimal`, a: p / 100, steps: `÷ 100 → ${p / 100}` }; },
  ])(),
  '3I Increasing & decreasing by a %': () => pick([
    () => { const p = pick([10, 15, 20, 25, 30, 40]), x = R(4, 40) * 10; return { q: `Decrease ${money(x)} by ${p}%`, a: r2(x * (1 - p / 100)), steps: `Multiplier ${1 - p / 100}: ${x} × ${1 - p / 100} = ${r2(x * (1 - p / 100))}` }; },
    () => { const p = pick([5, 10, 12, 15, 20, 50]), x = R(4, 40) * 10; return { q: `Increase ${x} by ${p}%`, a: r2(x * (1 + p / 100)), steps: `Multiplier ${1 + p / 100}: ${x} × ${1 + p / 100} = ${r2(x * (1 + p / 100))}` }; },
    () => { const x = R(5, 60) * 10; return { q: `A ${money(x)} item has 10% GST added. Final price?`, a: r2(x * 1.1), steps: `${x} × 1.1 = ${r2(x * 1.1)}` }; },
    () => { const p = pick([15, 20, 25, 30]), x = R(4, 30) * 10; return { q: `Jeans cost ${money(x)}. They're ${p}% off. How much do you SAVE?`, a: r2(x * p / 100), steps: `${p}% of ${x} = ${r2(x * p / 100)}` }; },
    () => { const p = pick([10, 20, 25]); return mc(`Which multiplier decreases an amount by ${p}%?`, String(1 - p / 100), [String(p / 100), String(1 + p / 100), String(100 - p)], `100% − ${p}% = ${100 - p}% = ${1 - p / 100}`); },
  ])(),
  '3J % change, profit & loss': () => pick([
    () => { const c = R(4, 30) * 10, s = c + R(1, 8) * 5; return { q: `Bought for ${money(c)}, sold for ${money(s)}. Profit?`, a: s - c, steps: `Profit = selling − cost = ${s} − ${c} = ${s - c}` }; },
    () => { const c = R(4, 30) * 10, s = c + R(1, 8) * 5; const p = r2((s - c) / c * 100); return { q: `Cost ${money(c)}, sold ${money(s)}. Percentage profit? (2 d.p.)`, a: p, steps: `(${s - c} ÷ ${c}) × 100 = ${p}%` }; },
    () => { const c = R(6, 30) * 10, s = c - R(1, 5) * 10; const p = r2((c - s) / c * 100); return { q: `Cost ${money(c)}, sold ${money(s)}. Percentage LOSS? (2 d.p.)`, a: p, steps: `Loss = ${c - s}; (${c - s} ÷ ${c}) × 100 = ${p}%` }; },
    () => { const o = R(4, 20) * 10, n = o + pick([-1, 1]) * R(1, 8) * 5; const pc = r2((n - o) / o * 100); return { q: `From ${o} to ${n}. Percentage change? (negative = decrease, 2 d.p.)`, a: pc, steps: `change ÷ ORIGINAL × 100 = ${n - o} ÷ ${o} × 100 = ${pc}%` }; },
    () => { const c = R(5, 20) * 10, p = pick([10, 20, 25, 50]); return { q: `A shop buys a game for ${money(c)} and adds a ${p}% markup. Selling price?`, a: r2(c * (1 + p / 100)), steps: `${c} × ${1 + p / 100} = ${r2(c * (1 + p / 100))}` }; },
  ])(),
  '3K Unitary method (percentages)': () => pick([
    () => { const p = pick([5, 10, 20, 25, 40]), w = R(2, 30) * p / 5 * 5; const whole = w * 100 / p; return { q: `${p}% of a number is ${w}. What is the number?`, a: r2(whole), steps: `1% = ${w} ÷ ${p} = ${r2(w / p)}; 100% = ${r2(whole)}` }; },
    () => { const p = pick([10, 20, 25]), full = R(5, 40) * 10, sale = full * (1 - p / 100); return { q: `After a ${p}% discount a jacket costs ${money(sale)}. Original price?`, a: full, steps: `${sale} is ${100 - p}%. 1% = ${r2(sale / (100 - p))}; 100% = ${full}` }; },
    () => { const full = R(5, 50) * 10; return { q: `A price including 10% GST is ${money(full * 1.1)}. Price before GST?`, a: full, steps: `${r2(full * 1.1)} is 110%; ÷ 1.1 = ${full}` }; },
  ])(),
  '6A Simplifying ratios': () => pick([
    () => { const g = R(2, 12), a = R(1, 7), b = R(1, 7); if (gcd(a, b) !== 1 || a === b) return TOPICS['6A Simplifying ratios'](); return { q: `Simplify ${a * g}:${b * g}`, a: `${a}:${b}`, steps: `HCF ${g}: ${a}:${b}` }; },
    () => { const a = R(1, 9), b = R(1, 9); if (gcd(a, b) !== 1 || a === b) return TOPICS['6A Simplifying ratios'](); return { q: `Simplify ${a / 2}:${b / 2}`, a: `${a}:${b}`, steps: `× 2 to clear decimals: ${a}:${b}` }; },
    () => { const a = R(1, 5), b = R(1, 5); if (gcd(a, b) !== 1 || a === b) return TOPICS['6A Simplifying ratios'](); return { q: `Simplify ${a * 50} cm : ${b / 2} m`, a: `${a * 50 / gcd(a * 50, b * 50)}:${b * 50 / gcd(a * 50, b * 50)}`, steps: `Same units: ${a * 50} cm : ${b * 50} cm → ÷ ${gcd(a * 50, b * 50)}` }; },
    () => { const a = R(1, 4), b = R(2, 5); return { q: `Simplify ${a}/${b} : 1/2`, a: `${2 * a / gcd(2 * a, b)}:${b / gcd(2 * a, b)}`, steps: `× ${2 * b}: ${2 * a}:${b} → simplest form` }; },
    () => { const a = R(2, 9), b = R(2, 9), c = R(2, 9); const g = gcd(gcd(a, b), c); return { q: `Simplify ${a * 4}:${b * 4}:${c * 4}`, a: `${a * 4 / (4 * g)}:${b * 4 / (4 * g)}:${c * 4 / (4 * g)}`, steps: `÷ ${4 * g}` }; },
  ])(),
  '6B Solving ratio problems': () => pick([
    () => { const a = R(1, 5), b = R(1, 5), k = R(2, 15); return { q: `Divide $${(a + b) * k} in the ratio ${a}:${b}. Smaller share?`, a: Math.min(a, b) * k, steps: `${a + b} parts; 1 part = ${k}; smaller = ${Math.min(a, b)} × ${k}` }; },
    () => { const a = R(1, 5), b = R(1, 5), k = R(2, 12); return { q: `Boys:girls = ${a}:${b}. There are ${a * k} boys. How many girls?`, a: b * k, steps: `1 part = ${a * k} ÷ ${a} = ${k}; girls = ${b} × ${k} = ${b * k}` }; },
    () => { const a = R(1, 4), b = R(2, 6), k = R(2, 10); return { q: `Cordial:water = ${a}:${b}. How much cordial for ${b * k * 50} mL of water? (mL)`, a: a * k * 50, steps: `1 part = ${b * k * 50} ÷ ${b} = ${k * 50}; cordial = ${a} × ${k * 50}` }; },
    () => { const a = R(1, 4), b = R(1, 4), c = R(1, 4), k = R(3, 10); return { q: `Share ${(a + b + c) * k} lollies in the ratio ${a}:${b}:${c}. Largest share?`, a: Math.max(a, b, c) * k, steps: `${a + b + c} parts; 1 part = ${k}` }; },
  ])(),
  '6D/6E Rates & rate problems': () => pick([
    () => { const d = R(6, 40) * 10, t = pick([2, 4, 5]); return { q: `${d} km in ${t} hours. Speed in km/h?`, a: d / t, steps: `${d} ÷ ${t}` }; },
    () => { const s = R(40, 110), t = pick([1.5, 2.5, 3, 0.5]); return { q: `Travelling at ${s} km/h for ${t} h. Distance (km)?`, a: r2(s * t), steps: `distance = speed × time = ${r2(s * t)}` }; },
    () => { const p = R(12, 30), h = pick([3, 4, 5, 6, 7.5]); return { q: `You earn $${p}/hour. Pay for ${h} hours?`, a: r2(p * h), steps: `${p} × ${h}` }; },
    () => { const L = R(2, 9) * 10, t = R(2, 8); return { q: `A tap fills ${L * t} L in ${t} min. Rate in L/min?`, a: L, steps: `${L * t} ÷ ${t}` }; },
    () => { const b = R(60, 100); return { q: `Heart beats ${b * 15} times in 15 minutes. Beats per minute?`, a: b, steps: `${b * 15} ÷ 15` }; },
    () => { const k = R(36, 108); return { q: `Convert ${k} km/h to m/s (2 d.p.)`, a: r2(k / 3.6), steps: `× 1000 ÷ 3600 = ÷ 3.6` }; },
    () => { const L = R(5, 9), km = 100; return { q: `A car uses ${L} L per 100 km. Fuel for ${km * 3} km (L)?`, a: L * 3, steps: `${km * 3} km = 3 × 100 km → 3 × ${L}` }; },
  ])(),
  '6G Unitary method & best buy': () => pick([
    () => { const n = R(2, 6), p = R(2, 9), m = n * R(2, 4); return { q: `${n} pens cost $${n * p}. Cost of ${m} pens?`, a: m * p, steps: `1 pen = $${p}; × ${m}` }; },
    () => { const a = R(3, 7), pa = r2(a * (R(80, 120) / 100)), b = a * 2, pb = r2(b * (R(80, 120) / 100)); const ua = pa / a, ub = pb / b; if (Math.abs(ua - ub) < 0.02) return TOPICS['6G Unitary method & best buy']();
      return mc(`Better buy: ${a} L for ${money(pa)} or ${b} L for ${money(pb)}?`, ua < ub ? `${a} L` : `${b} L`, [ua < ub ? `${b} L` : `${a} L`], `Unit price: ${money(ua)}/L vs ${money(ub)}/L`); },
    () => { const w = R(3, 8), d = R(2, 6) * 10; return { q: `${w} workers take ${d} days. How long for ${w * 2} workers (same rate)?`, a: d / 2, steps: `Twice as many workers → half the time` }; },
  ])(),
  '8B Types of data & frequency tables': () => pick([
    () => { const x = pick([['number of siblings', 'numerical discrete'], ['height in cm', 'numerical continuous'], ['favourite colour', 'categorical nominal'], ['hours of sleep (whole numbers)', 'numerical discrete'], ['shoe size', 'numerical discrete'], ['time to run 100 m', 'numerical continuous'], ['rating: poor/ok/good/excellent', 'categorical ordinal'], ['year level (7, 8, 9…) as a group', 'categorical ordinal'], ['type of pet', 'categorical nominal'], ['money in a bank account (whole dollars)', 'numerical discrete']]);
      return mc(`What type of data is "${x[0]}"?`, x[1], ['numerical discrete', 'numerical continuous', 'categorical nominal', 'categorical ordinal'].filter((t) => t !== x[1]), 'Counted → discrete, measured → continuous, words with order → ordinal, words without order → nominal.'); },
    () => { const xs = Array.from({ length: R(12, 20) }, () => R(0, 4)), v = R(0, 4); return { q: `Siblings data: ${xs.join(', ')}. What is the frequency of ${v}?`, a: xs.filter((x) => x === v).length, steps: `Count the ${v}s` }; },
    () => { const f = [R(1, 6), R(2, 8), R(1, 6), R(0, 4)]; const n = f.reduce((a, b) => a + b); return { q: `Frequency table – score: 1,2,3,4 with frequencies ${f.join(', ')}. Relative frequency of score 2? (2 d.p.)`, a: r2(f[1] / n), steps: `${f[1]} ÷ total ${n}` }; },
  ])(),
  '8C Graphs & shape (skew)': () => pick([
    () => mc('A histogram has a long tail to the RIGHT (most data low, a few very high values). Shape?', 'positively skewed', ['negatively skewed', 'symmetric', 'bi-modal'], 'Tail to the right = positive skew. e.g. bank balances.'),
    () => mc('A histogram has a long tail to the LEFT. Shape?', 'negatively skewed', ['positively skewed', 'symmetric', 'bi-modal'], 'Tail to the left = negative skew.'),
    () => mc('Most values in the middle, tails equal on both sides. Shape?', 'symmetric', ['positively skewed', 'negatively skewed', 'bi-modal'], 'Mean ≈ median when symmetric.'),
    () => mc('In a positively skewed set, which is usually bigger?', 'mean', ['median', 'they are always equal'], 'High outliers pull the mean up.'),
    () => mc('Best graph for discrete numerical data like "number of siblings"?', 'column graph / histogram', ['pie chart only', 'line graph over time', 'scatter plot'], 'Frequencies of each value → column graph or histogram.'),
    () => mc('Best measure of centre for skewed data with outliers (e.g. bank balances)?', 'median', ['mean', 'range'], 'The median is not dragged by outliers.'),
  ])(),
  '8D Measures of centre': () => {
    const n = R(5, 9), xs = Array.from({ length: n }, () => R(1, 25)), s = sorted(xs);
    return pick([
      () => ({ q: `Mean of ${xs.join(', ')} (2 d.p.)`, a: r2(mean(xs)), steps: `sum ${xs.reduce((a, b) => a + b)} ÷ ${n} = ${r2(mean(xs))}` }),
      () => ({ q: `Median of ${xs.join(', ')}`, a: median(xs), steps: `Order: ${s.join(', ')} → middle = ${median(xs)}` }),
      () => { const v = R(1, 9), d = shuffle([v, v, v, R(10, 20), R(21, 30), R(31, 40)]); return { q: `Mode of ${d.join(', ')}`, a: v, steps: `${v} appears most` }; },
      () => { const target = R(5, 12), k = 4, base = Array.from({ length: k - 1 }, () => R(1, 15)); const need = target * k - base.reduce((a, b) => a + b); if (need < 0) return { q: `Mean of ${base.join(', ')} (2 d.p.)`, a: r2(mean(base)), steps: 'sum ÷ count' };
        return { q: `Scores ${base.join(', ')} and one more. The mean of all 4 is ${target}. Missing score?`, a: need, steps: `Total needed ${target}×4 = ${target * 4}; minus ${base.reduce((a, b) => a + b)}` }; },
    ])();
  },
  '8E Measures of spread': () => {
    const n = pick([7, 8, 9, 11]), xs = Array.from({ length: n }, () => R(1, 40)), s = sorted(xs);
    const lower = s.slice(0, Math.floor(n / 2)), upper = s.slice(Math.ceil(n / 2));
    return pick([
      () => ({ q: `Range of ${xs.join(', ')}`, a: s[n - 1] - s[0], steps: `highest − lowest = ${s[n - 1]} − ${s[0]}` }),
      () => ({ q: `Interquartile range (IQR) of ${xs.join(', ')}`, a: median(upper) - median(lower), steps: `Order: ${s.join(', ')}. Q1 = ${median(lower)}, Q3 = ${median(upper)}, IQR = ${median(upper) - median(lower)}` }),
      () => { const a = Array.from({ length: 6 }, () => R(10, 14)), b = Array.from({ length: 6 }, () => R(2, 25)); const ra = Math.max(...a) - Math.min(...a), rb = Math.max(...b) - Math.min(...b); if (ra === rb) return { q: `Range of ${b.join(', ')}`, a: rb, steps: 'max − min' };
        return mc(`Player A: ${a.join(', ')}. Player B: ${b.join(', ')}. Who is more consistent (by range)?`, ra < rb ? 'Player A' : 'Player B', [ra < rb ? 'Player B' : 'Player A'], `Ranges: A = ${ra}, B = ${rb}. Smaller range = more consistent.`); },
      () => mc('An outlier of 900 is added to data mostly between 5 and 20. Which changes MOST?', 'range', ['median', 'mode'], 'Range uses the extreme value directly.'),
    ])();
  },
  '8F Surveying & sampling': () => pick([
    () => mc('Surveying EVERY Year 8 student is called a…', 'census', ['sample', 'biased survey', 'experiment'], 'Whole population = census.'),
    () => mc('Surveying only 8E to represent all Year 8s is using a…', 'sample', ['census', 'population'], 'Part of the population = sample.'),
    () => mc('Asking only students at the gym how often they exercise gives a…', 'biased sample', ['random sample', 'census'], 'The sample is not representative.'),
    () => mc('Which makes a sample MORE reliable?', 'a larger, random sample', ['a smaller sample of friends', 'only volunteers who like the topic'], 'Bigger + random = more representative.'),
    () => mc('"How much money do you have in the bank?" — a limitation is…', 'people may not know or may not answer honestly', ['the data is categorical', 'it is a census'], 'Self-reported numbers can be guessed or exaggerated.'),
    () => mc('A closed survey question…', 'has set answers to choose from', ['lets people write anything', 'cannot be analysed'], 'Closed = fixed responses, easy to graph.'),
    () => mc('Population for the PSMT investigation?', 'all Year 8 students at The Gap', ['only 8E', 'everyone in Brisbane'], 'The question asks about the "average" Year 8 class at The Gap.'),
  ])(),
};

const norm = (s) => String(s).toLowerCase().replace(/\s+/g, '').replace(/[$%°]|km\/h|m\/s|l\/min|cm|kg|ml|km|mins?|g$|l$|m$/g, '').replace(/−/g, '-');

export function checkMaths(input, answer) {
  const i = norm(input);
  if (!i) return false;
  if (typeof answer === 'number') {
    const frac = i.match(/^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
    const v = frac ? Number(frac[1]) / Number(frac[2]) : Number(i.replace(/,/g, ''));
    return Number.isFinite(v) && Math.abs(v - answer) <= Math.max(0.011, Math.abs(answer) * 0.001);
  }
  return i === norm(answer);
}

export const stats = { mean, median, sorted, r2 };
