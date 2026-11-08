// Term 4 Year 8 Maths (Cambridge Essential 8), from Mr Hives' Term 4 planner:
// 3H–3K percentages, 6A/6B ratios, 6D/6E/6G rates, 8B–8F statistics.
// Each generator returns { q, a, steps, choices? }. `a` is a number or a string; `steps` is the
// worked solution, one small step per entry, shown one at a time when you get it wrong.
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
    () => { const p = pick([5, 10, 12, 15, 20, 25, 30, 40, 75]), x = R(2, 40) * 20, d = p / 100, a = r2(d * x);
      return { q: `Find ${p}% of ${x}`, a, steps: [`"Per cent" means "out of 100", so ${p}% = ${p} ÷ 100 = ${d}.`, `"Of" means multiply: ${d} × ${x}.`, `${d} × ${x} = ${a}`] }; },
    () => { const b = pick([20, 25, 40, 50, 80, 200]), a = R(1, b - 1), ans = r2(a / b * 100);
      return { q: `Express ${a} out of ${b} as a percentage`, a: ans, steps: [`Write it as a fraction: ${a}/${b}.`, `To turn a fraction into a percentage, multiply by 100.`, `${a} ÷ ${b} × 100 = ${ans}%`] }; },
    () => { const a = R(15, 90), b = pick([1, 2, 4]) * 60, ans = r2(a / b * 100);
      return { q: `Express ${a} minutes as a percentage of ${b / 60} hour(s) (2 d.p.)`, a: ans, steps: [`Both amounts need the same unit. ${b / 60} hour(s) = ${b} minutes.`, `Now it's ${a} out of ${b}: the fraction ${a}/${b}.`, `${a} ÷ ${b} × 100 = ${ans}%`] }; },
    () => { const a = R(20, 95) * 10, b = pick([1, 2, 5]), ans = r2(a / (b * 1000) * 100);
      return { q: `Express ${a} g as a percentage of ${b} kg`, a: ans, steps: [`Same units first: ${b} kg = ${b * 1000} g.`, `Now it's ${a} out of ${b * 1000}.`, `${a} ÷ ${b * 1000} × 100 = ${ans}%`] }; },
    () => { const p = pick([12.5, 25, 37.5, 60, 87.5]);
      return { q: `Write ${p}% as a decimal`, a: p / 100, steps: [`Per cent means out of 100, so divide by 100.`, `Dividing by 100 moves the decimal point 2 places left: ${p} → ${p / 100}`] }; },
  ])(),
  '3I Increasing & decreasing by a %': () => pick([
    () => { const p = pick([10, 15, 20, 25, 30, 40]), x = R(4, 40) * 10, m = r2(1 - p / 100), a = r2(x * m);
      return { q: `Decrease ${money(x)} by ${p}%`, a, steps: [`"Decrease by ${p}%" means take ${p}% of ${x} OFF ${x}.`, `Amount taken off: ${p}% of ${x} = ${p / 100} × ${x} = ${r2(x * p / 100)}.`, `(Shortcut for next time: you keep 100% − ${p}% = ${100 - p}% = ${m}, so ${x} × ${m} gives the same answer.)`, `${x} − ${r2(x * p / 100)} = ${a}`] }; },
    () => { const p = pick([5, 10, 12, 15, 20, 50]), x = R(4, 40) * 10, m = r2(1 + p / 100), a = r2(x * m);
      return { q: `Increase ${x} by ${p}%`, a, steps: [`"Increase by ${p}%" means ADD ${p}% of ${x} on to ${x}.`, `Amount added: ${p}% of ${x} = ${p / 100} × ${x} = ${r2(x * p / 100)}.`, `(Shortcut for next time: 100% + ${p}% = ${100 + p}% = ${m}, so ${x} × ${m} gives the same answer.)`, `${x} + ${r2(x * p / 100)} = ${a}`] }; },
    () => { const x = R(5, 60) * 10, a = r2(x * 1.1);
      return { q: `A ${money(x)} item has 10% GST added. Final price?`, a, steps: [`GST is 10%, so the final price is 100% + 10% = 110% of the price.`, `110% as a decimal is 1.1.`, `${x} × 1.1 = ${a}`] }; },
    () => { const p = pick([15, 20, 25, 30]), x = R(4, 30) * 10, a = r2(x * p / 100);
      return { q: `Jeans cost ${money(x)}. They're ${p}% off. How much do you SAVE?`, a, steps: [`The amount you save is the discount itself: ${p}% of ${x}.`, `${p}% = ${p / 100}`, `${p / 100} × ${x} = ${a}`] }; },
    () => { const p = pick([10, 20, 25]), m = r2(1 - p / 100);
      return mc(`Which multiplier decreases an amount by ${p}%?`, String(m), [String(p / 100), String(r2(1 + p / 100)), String(100 - p)], [`After taking off ${p}%, 100% − ${p}% = ${100 - p}% is left.`, `${100 - p}% as a decimal is ${m}.`]); },
  ])(),
  '3J % change, profit & loss': () => pick([
    () => { const c = R(4, 30) * 10, s = c + R(1, 8) * 5;
      return { q: `Bought for ${money(c)}, sold for ${money(s)}. Profit?`, a: s - c, steps: [`Profit = selling price − cost price.`, `${s} − ${c} = ${s - c}`] }; },
    () => { const c = R(4, 30) * 10, s = c + R(1, 8) * 5, p = r2((s - c) / c * 100);
      return { q: `Cost ${money(c)}, sold ${money(s)}. Percentage profit? (2 d.p.)`, a: p, steps: [`Find the profit first: ${s} − ${c} = ${s - c}.`, `Percentage profit compares the profit with the COST: ${s - c} ÷ ${c}.`, `× 100: ${s - c} ÷ ${c} × 100 = ${p}%`] }; },
    () => { const c = R(6, 30) * 10, s = c - R(1, 5) * 10, p = r2((c - s) / c * 100);
      return { q: `Cost ${money(c)}, sold ${money(s)}. Percentage LOSS? (2 d.p.)`, a: p, steps: [`Find the loss first: ${c} − ${s} = ${c - s}.`, `Percentage loss compares the loss with the COST: ${c - s} ÷ ${c}.`, `× 100: ${c - s} ÷ ${c} × 100 = ${p}%`] }; },
    () => { const o = R(4, 20) * 10, n = o + pick([-1, 1]) * R(1, 8) * 5, pc = r2((n - o) / o * 100);
      return { q: `From ${o} to ${n}. Percentage change? (negative = decrease, 2 d.p.)`, a: pc, steps: [`Change = new − original = ${n} − ${o} = ${n - o}.`, `Divide by the ORIGINAL (the starting number): ${n - o} ÷ ${o}.`, `× 100 = ${pc}%. ${pc < 0 ? 'Negative, so it went down.' : 'Positive, so it went up.'}`] }; },
    () => { const c = R(5, 20) * 10, p = pick([10, 20, 25, 50]), m = r2(1 + p / 100), a = r2(c * m);
      return { q: `A shop buys a game for ${money(c)} and adds a ${p}% markup. Selling price?`, a, steps: [`A markup is a percentage added on to the cost, so the price becomes ${100 + p}% of ${c}.`, `${100 + p}% as a decimal is ${m}.`, `${c} × ${m} = ${a}`] }; },
  ])(),
  '3K Unitary method (percentages)': () => pick([
    () => { const p = pick([5, 10, 20, 25, 40]), w = R(2, 30) * p / 5 * 5, whole = r2(w * 100 / p), one = r2(w / p);
      return { q: `${p}% of a number is ${w}. What is the number?`, a: whole, steps: [`You know ${p}% = ${w}. You want 100%.`, `Find 1% by dividing by ${p}: ${w} ÷ ${p} = ${one}.`, `100% is 100 times that: ${one} × 100 = ${whole}`] }; },
    () => { const p = pick([10, 20, 25]), full = R(5, 40) * 10, sale = r2(full * (1 - p / 100)), one = r2(sale / (100 - p));
      return { q: `After a ${p}% discount a jacket costs ${money(sale)}. Original price?`, a: full, steps: [`After ${p}% off you pay 100% − ${p}% = ${100 - p}%. So ${sale} is ${100 - p}% of the original.`, `Find 1%: ${sale} ÷ ${100 - p} = ${one}.`, `100% = ${one} × 100 = ${full}`] }; },
    () => { const full = R(5, 50) * 10, gst = r2(full * 1.1);
      return { q: `A price including 10% GST is ${money(gst)}. Price before GST?`, a: full, steps: [`The price with GST is 110% of the original (original × 1.1).`, `To undo × 1.1, divide by 1.1.`, `${gst} ÷ 1.1 = ${full}`] }; },
  ])(),
  '6A Simplifying ratios': () => pick([
    () => { const g = R(2, 12), a = R(1, 7), b = R(1, 7); if (gcd(a, b) !== 1 || a === b) return TOPICS['6A Simplifying ratios']();
      return { q: `Simplify ${a * g}:${b * g}`, a: `${a}:${b}`, steps: [`Find the highest common factor (HCF) of ${a * g} and ${b * g}: the biggest number that goes into both. It's ${g}.`, `Divide both sides by ${g}: ${a * g} ÷ ${g} = ${a} and ${b * g} ÷ ${g} = ${b}.`, `Simplest form: ${a}:${b}`] }; },
    () => { const a = R(1, 9), b = R(1, 9); if (gcd(a, b) !== 1 || a === b) return TOPICS['6A Simplifying ratios']();
      return { q: `Simplify ${a / 2}:${b / 2}`, a: `${a}:${b}`, steps: [`Ratios are easiest with whole numbers. Multiply both sides by 2 to get rid of the .5.`, `${a / 2} × 2 = ${a} and ${b / 2} × 2 = ${b}.`, `${a} and ${b} have no common factor, so the answer is ${a}:${b}`] }; },
    () => { const a = R(1, 5), b = R(1, 5); if (gcd(a, b) !== 1 || a === b) return TOPICS['6A Simplifying ratios']();
      const g = gcd(a * 50, b * 50);
      return { q: `Simplify ${a * 50} cm : ${b / 2} m`, a: `${a * 50 / g}:${b * 50 / g}`, steps: [`Make the units the same: ${b / 2} m = ${b * 50} cm.`, `Now it's ${a * 50}:${b * 50}. The HCF is ${g}.`, `Divide both by ${g}: ${a * 50 / g}:${b * 50 / g}`] }; },
    () => { const a = R(1, 4), b = R(2, 5), g = gcd(2 * a, b);
      return { q: `Simplify ${a}/${b} : 1/2`, a: `${2 * a / g}:${b / g}`, steps: [`Fractions are awkward, so multiply both sides by ${2 * b} (both denominators, ${b} and 2, go into it).`, `${a}/${b} × ${2 * b} = ${2 * a} and 1/2 × ${2 * b} = ${b}. Now it's ${2 * a}:${b}.`, g > 1 ? `Divide both by the HCF ${g}: ${2 * a / g}:${b / g}` : `${2 * a} and ${b} have no common factor, so the answer is ${2 * a}:${b}`] }; },
    () => { const a = R(2, 9), b = R(2, 9), c = R(2, 9), g = 4 * gcd(gcd(a, b), c);
      return { q: `Simplify ${a * 4}:${b * 4}:${c * 4}`, a: `${a * 4 / g}:${b * 4 / g}:${c * 4 / g}`, steps: [`Find the HCF of all three numbers: ${g}.`, `Divide every part by ${g}.`, `${a * 4 / g}:${b * 4 / g}:${c * 4 / g}`] }; },
  ])(),
  '6B Solving ratio problems': () => pick([
    () => { const a = R(1, 5), b = R(1, 5), k = R(2, 15), lo = Math.min(a, b);
      return { q: `Divide $${(a + b) * k} in the ratio ${a}:${b}. Smaller share?`, a: lo * k, steps: [`Add the parts: ${a} + ${b} = ${a + b} parts altogether.`, `1 part = $${(a + b) * k} ÷ ${a + b} = $${k}.`, `The smaller share is ${lo} parts: ${lo} × $${k} = $${lo * k}`] }; },
    () => { const a = R(1, 5), b = R(1, 5), k = R(2, 12);
      return { q: `Boys:girls = ${a}:${b}. There are ${a * k} boys. How many girls?`, a: b * k, steps: [`Boys are ${a} part(s), and there are ${a * k} boys.`, `1 part = ${a * k} ÷ ${a} = ${k}.`, `Girls are ${b} part(s): ${b} × ${k} = ${b * k}`] }; },
    () => { const a = R(1, 4), b = R(2, 6), k = R(2, 10), w = b * k * 50;
      return { q: `Cordial:water = ${a}:${b}. How much cordial for ${w} mL of water? (mL)`, a: a * k * 50, steps: [`Water is ${b} parts, and there's ${w} mL of water.`, `1 part = ${w} ÷ ${b} = ${k * 50} mL.`, `Cordial is ${a} part(s): ${a} × ${k * 50} = ${a * k * 50} mL`] }; },
    () => { const a = R(1, 4), b = R(1, 4), c = R(1, 4), k = R(3, 10), hi = Math.max(a, b, c);
      return { q: `Share ${(a + b + c) * k} lollies in the ratio ${a}:${b}:${c}. Largest share?`, a: hi * k, steps: [`Add the parts: ${a} + ${b} + ${c} = ${a + b + c} parts.`, `1 part = ${(a + b + c) * k} ÷ ${a + b + c} = ${k}.`, `The largest share is ${hi} parts: ${hi} × ${k} = ${hi * k}`] }; },
  ])(),
  '6D/6E Rates & rate problems': () => pick([
    () => { const d = R(6, 40) * 10, t = pick([2, 4, 5]);
      return { q: `${d} km in ${t} hours. Speed in km/h?`, a: d / t, steps: [`Speed = distance ÷ time ("km per hour" tells you: km ÷ hours).`, `${d} ÷ ${t} = ${d / t} km/h`] }; },
    () => { const s = R(40, 110), t = pick([1.5, 2.5, 3, 0.5]);
      return { q: `Travelling at ${s} km/h for ${t} h. Distance (km)?`, a: r2(s * t), steps: [`Distance = speed × time.`, `${s} × ${t} = ${r2(s * t)} km`] }; },
    () => { const p = R(12, 30), h = pick([3, 4, 5, 6, 7.5]);
      return { q: `You earn $${p}/hour. Pay for ${h} hours?`, a: r2(p * h), steps: [`Pay = rate × hours.`, `${p} × ${h} = ${r2(p * h)}`] }; },
    () => { const L = R(2, 9) * 10, t = R(2, 8);
      return { q: `A tap fills ${L * t} L in ${t} min. Rate in L/min?`, a: L, steps: [`"L/min" means litres ÷ minutes.`, `${L * t} ÷ ${t} = ${L} L/min`] }; },
    () => { const b = R(60, 100);
      return { q: `Heart beats ${b * 15} times in 15 minutes. Beats per minute?`, a: b, steps: [`"Per minute" means divide by the number of minutes.`, `${b * 15} ÷ 15 = ${b}`] }; },
    () => { const k = R(36, 108);
      return { q: `Convert ${k} km/h to m/s (2 d.p.)`, a: r2(k / 3.6), steps: [`1 km = 1000 m and 1 hour = 3600 seconds.`, `So multiply by 1000 and divide by 3600, which is the same as dividing by 3.6.`, `${k} ÷ 3.6 = ${r2(k / 3.6)} m/s`] }; },
    () => { const L = R(5, 9);
      return { q: `A car uses ${L} L per 100 km. Fuel for 300 km (L)?`, a: L * 3, steps: [`300 km is 3 lots of 100 km.`, `3 × ${L} L = ${L * 3} L`] }; },
  ])(),
  '6G Unitary method & best buy': () => pick([
    () => { const n = R(2, 6), p = R(2, 9), m = n * R(2, 4);
      return { q: `${n} pens cost $${n * p}. Cost of ${m} pens?`, a: m * p, steps: [`Unitary method: find the cost of ONE first.`, `1 pen = $${n * p} ÷ ${n} = $${p}.`, `${m} pens = ${m} × $${p} = $${m * p}`] }; },
    () => { const a = R(3, 7), pa = r2(a * (R(80, 120) / 100)), b = a * 2, pb = r2(b * (R(80, 120) / 100)); const ua = pa / a, ub = pb / b; if (Math.abs(ua - ub) < 0.02) return TOPICS['6G Unitary method & best buy']();
      return mc(`Better buy: ${a} L for ${money(pa)} or ${b} L for ${money(pb)}?`, ua < ub ? `${a} L` : `${b} L`, [ua < ub ? `${b} L` : `${a} L`], [`Find the price of 1 litre (the unit price) for each.`, `${money(pa)} ÷ ${a} = ${money(ua)} per L, and ${money(pb)} ÷ ${b} = ${money(ub)} per L.`, `The lower unit price is the better buy: ${ua < ub ? `${a} L` : `${b} L`}`]); },
    () => { const w = R(3, 8), d = R(2, 6) * 10;
      return { q: `${w} workers take ${d} days. How long for ${w * 2} workers (same rate)?`, a: d / 2, steps: [`More workers means LESS time.`, `Twice as many workers finish in half the time.`, `${d} ÷ 2 = ${d / 2} days`] }; },
  ])(),
  '8B Types of data & frequency tables': () => pick([
    () => { const x = pick([['number of siblings', 'numerical discrete'], ['height in cm', 'numerical continuous'], ['favourite colour', 'categorical nominal'], ['hours of sleep (whole numbers)', 'numerical discrete'], ['shoe size', 'numerical discrete'], ['time to run 100 m', 'numerical continuous'], ['rating: poor/ok/good/excellent', 'categorical ordinal'], ['year level (7, 8, 9…) as a group', 'categorical ordinal'], ['type of pet', 'categorical nominal'], ['money in a bank account (whole dollars)', 'numerical discrete']]);
      return mc(`What type of data is "${x[0]}"?`, x[1], ['numerical discrete', 'numerical continuous', 'categorical nominal', 'categorical ordinal'].filter((t) => t !== x[1]), [`First ask: is it a number (numerical) or a word or group (categorical)?`, `Numbers: counted → discrete. Measured → continuous.`, `Words: with an order → ordinal. No order → nominal.`, `"${x[0]}" is ${x[1]}.`]); },
    () => { const xs = Array.from({ length: R(12, 20) }, () => R(0, 4)), v = R(0, 4), n = xs.filter((x) => x === v).length;
      return { q: `Siblings data: ${xs.join(', ')}. What is the frequency of ${v}?`, a: n, steps: [`Frequency = how many times a value appears.`, `Count every ${v} in the list: there ${n === 1 ? 'is 1' : `are ${n}`}.`] }; },
    () => { const f = [R(1, 6), R(2, 8), R(1, 6), R(0, 4)], n = f.reduce((a, b) => a + b), a = r2(f[1] / n);
      return { q: `Frequency table – score: 1,2,3,4 with frequencies ${f.join(', ')}. Relative frequency of score 2? (2 d.p.)`, a, steps: [`Add the frequencies to get the total: ${f.join(' + ')} = ${n}.`, `Relative frequency = frequency ÷ total. Score 2 has frequency ${f[1]}.`, `${f[1]} ÷ ${n} = ${a}`] }; },
  ])(),
  '8C Graphs & shape (skew)': () => pick([
    () => mc('A histogram has a long tail to the RIGHT (most data low, a few very high values). Shape?', 'positively skewed', ['negatively skewed', 'symmetric', 'bi-modal'], ['Skew is named after the side the TAIL is on.', 'Tail on the right (the positive end of the number line) → positively skewed. Example: bank balances.']),
    () => mc('A histogram has a long tail to the LEFT. Shape?', 'negatively skewed', ['positively skewed', 'symmetric', 'bi-modal'], ['Skew is named after the side the TAIL is on.', 'Tail on the left (the negative end) → negatively skewed.']),
    () => mc('Most values in the middle, tails equal on both sides. Shape?', 'symmetric', ['positively skewed', 'negatively skewed', 'bi-modal'], ['Both sides look the same, like a mirror.', 'That is symmetric, and the mean ≈ the median.']),
    () => mc('In a positively skewed set, which is usually bigger?', 'mean', ['median', 'they are always equal'], ['Positive skew = a few very HIGH values.', 'The mean adds every value, so those high values pull the mean up. The median (middle value) barely moves.']),
    () => mc('Best graph for discrete numerical data like "number of siblings"?', 'column graph / histogram', ['pie chart only', 'line graph over time', 'scatter plot'], ['You want to show how often each value (0, 1, 2…) happens.', 'Frequencies of each value → column graph or histogram.']),
    () => mc('Best measure of centre for skewed data with outliers (e.g. bank balances)?', 'median', ['mean', 'range'], ['Outliers drag the mean towards them.', 'The median is just the middle value, so outliers barely change it.']),
  ])(),
  '8D Measures of centre': () => {
    const n = R(5, 9), xs = Array.from({ length: n }, () => R(1, 25)), s = sorted(xs), sum = xs.reduce((a, b) => a + b);
    return pick([
      () => ({ q: `Mean of ${xs.join(', ')} (2 d.p.)`, a: r2(mean(xs)), steps: [`Add them all up: ${xs.join(' + ')} = ${sum}.`, `Count how many numbers: ${n}.`, `Mean = sum ÷ count = ${sum} ÷ ${n} = ${r2(mean(xs))}`] }),
      () => ({ q: `Median of ${xs.join(', ')}`, a: median(xs), steps: [`Put them in order: ${s.join(', ')}.`, n % 2 ? `There are ${n} numbers (odd), so the median is the middle one: number ${(n + 1) / 2} in the list.` : `There are ${n} numbers (even), so take the middle two: ${s[n / 2 - 1]} and ${s[n / 2]}, and find halfway between them.`, `Median = ${median(xs)}`] }),
      () => { const v = R(1, 9), d = shuffle([v, v, v, R(10, 20), R(21, 30), R(31, 40)]);
        return { q: `Mode of ${d.join(', ')}`, a: v, steps: [`The mode is the value that appears most often.`, `${v} appears 3 times; everything else appears once. Mode = ${v}`] }; },
      () => { const target = R(5, 12), base = Array.from({ length: 3 }, () => R(1, 15)), have = base.reduce((a, b) => a + b), need = target * 4 - have;
        if (need < 0) return { q: `Mean of ${base.join(', ')} (2 d.p.)`, a: r2(mean(base)), steps: [`Add them: ${base.join(' + ')} = ${have}.`, `Divide by how many (3): ${have} ÷ 3 = ${r2(mean(base))}`] };
        return { q: `Scores ${base.join(', ')} and one more. The mean of all 4 is ${target}. Missing score?`, a: need, steps: [`Mean × count = total, so all 4 scores must add to ${target} × 4 = ${target * 4}.`, `The three scores you know add to ${base.join(' + ')} = ${have}.`, `Missing score = ${target * 4} − ${have} = ${need}`] }; },
    ])();
  },
  '8E Measures of spread': () => {
    const n = pick([7, 8, 9, 11]), xs = Array.from({ length: n }, () => R(1, 40)), s = sorted(xs);
    const lower = s.slice(0, Math.floor(n / 2)), upper = s.slice(Math.ceil(n / 2)), q1 = median(lower), q3 = median(upper);
    return pick([
      () => ({ q: `Range of ${xs.join(', ')}`, a: s[n - 1] - s[0], steps: [`Range = highest − lowest.`, `Highest is ${s[n - 1]}, lowest is ${s[0]}.`, `${s[n - 1]} − ${s[0]} = ${s[n - 1] - s[0]}`] }),
      () => ({ q: `Interquartile range (IQR) of ${xs.join(', ')}`, a: q3 - q1, steps: [`Put them in order: ${s.join(', ')}.`, `Split into a lower half (${lower.join(', ')}) and an upper half (${upper.join(', ')})${n % 2 ? `, leaving out the middle value ${s[(n - 1) / 2]}` : ''}.`, `Q1 = median of the lower half = ${q1}. Q3 = median of the upper half = ${q3}.`, `IQR = Q3 − Q1 = ${q3} − ${q1} = ${q3 - q1}`] }),
      () => { const a = Array.from({ length: 6 }, () => R(10, 14)), b = Array.from({ length: 6 }, () => R(2, 25)); const ra = Math.max(...a) - Math.min(...a), rb = Math.max(...b) - Math.min(...b);
        if (ra === rb) return { q: `Range of ${b.join(', ')}`, a: rb, steps: [`Range = highest − lowest.`, `${Math.max(...b)} − ${Math.min(...b)} = ${rb}`] };
        return mc(`Player A: ${a.join(', ')}. Player B: ${b.join(', ')}. Who is more consistent (by range)?`, ra < rb ? 'Player A' : 'Player B', [ra < rb ? 'Player B' : 'Player A'], [`Find each player's range (highest − lowest).`, `A: ${Math.max(...a)} − ${Math.min(...a)} = ${ra}. B: ${Math.max(...b)} − ${Math.min(...b)} = ${rb}.`, `A smaller range means the scores are closer together = more consistent: ${ra < rb ? 'Player A' : 'Player B'}.`]); },
      () => mc('An outlier of 900 is added to data mostly between 5 and 20. Which changes MOST?', 'range', ['median', 'mode'], ['Range = highest − lowest, so it uses the extreme value directly.', 'The highest value jumps to 900, so the range jumps too. The median and mode barely move.']),
    ])();
  },
  '8F Surveying & sampling': () => pick([
    () => mc('Surveying EVERY Year 8 student is called a…', 'census', ['sample', 'biased survey', 'experiment'], ['The population is everyone you want to know about.', 'Asking the whole population = a census.']),
    () => mc('Surveying only 8E to represent all Year 8s is using a…', 'sample', ['census', 'population'], ['8E is only part of Year 8.', 'Asking part of the population = a sample.']),
    () => mc('Asking only students at the gym how often they exercise gives a…', 'biased sample', ['random sample', 'census'], ['People at the gym exercise more than most people.', 'So they do not represent everyone: that is a biased sample.']),
    () => mc('Which makes a sample MORE reliable?', 'a larger, random sample', ['a smaller sample of friends', 'only volunteers who like the topic'], ['A good sample should look like the whole population.', 'Bigger + chosen randomly = more representative.']),
    () => mc('"How much money do you have in the bank?" — a limitation is…', 'people may not know or may not answer honestly', ['the data is categorical', 'it is a census'], ['A limitation is something that makes the data less trustworthy.', 'People might guess, round, or exaggerate how much money they have.']),
    () => mc('A closed survey question…', 'has set answers to choose from', ['lets people write anything', 'cannot be analysed'], ['Closed = the answers are fixed (tick a box).', 'Open = people can write anything.']),
    () => mc('Population for the PSMT investigation?', 'all Year 8 students at The Gap', ['only 8E', 'everyone in Brisbane'], ['The population is the whole group your question is about.', 'The PSMT asks about the "average" Year 8 class at The Gap, so it is all Year 8s at The Gap.']),
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

// Nearly right: a rounding slip or a small arithmetic error (within 2%, or 0.1).
export function nearMaths(input, answer) {
  if (typeof answer !== 'number') return false;
  const v = Number(norm(input).replace(/,/g, ''));
  return Number.isFinite(v) && Math.abs(v - answer) <= Math.max(0.1, Math.abs(answer) * 0.02);
}

export const stats = { mean, median, sorted, r2 };
