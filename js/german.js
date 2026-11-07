// German answer checking plus generated drills for Unit 8 (dates, years, time, seasons).
const ONES = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
const TENS = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];
export const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const R = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const pick = (xs) => xs[R(0, xs.length - 1)];

export function zahl(n) {
  if (n < 20) return ONES[n];
  if (n < 100) { const o = n % 10, t = TENS[Math.floor(n / 10)]; return o ? `${o === 1 ? 'ein' : ONES[o]}und${t}` : t; }
  if (n < 1000) { const h = Math.floor(n / 100), r = n % 100; return `${h === 1 ? 'ein' : ONES[h]}hundert${r ? zahl(r) : ''}`; }
  return n === 1000 ? 'tausend' : '';
}

export function jahr(y) {
  if (y >= 2000 && y < 2100) { const r = y % 100; return `zweitausend${r ? zahl(r) : ''}`; }
  const hi = Math.floor(y / 100), r = y % 100;
  return `${zahl(hi)}hundert${r ? zahl(r) : ''}`;
}

// Ordinal stem: erste, zweite, dritte, siebte, achte, then -te up to 19 and -ste from 20.
export function ordinal(n) {
  const special = { 1: 'erst', 3: 'dritt', 7: 'siebt', 8: 'acht' };
  if (special[n]) return special[n];
  return n < 20 ? `${zahl(n)}t` : `${zahl(n)}st`;
}
export const amDatum = (d, m) => `am ${ordinal(d)}en ${MONTHS[m]}`;

const EN_ORD = (n) => n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th');

// Clock times in the informal way taught on Stile (halb, Viertel, nach, vor).
function uhrzeit(h, m) {
  const H = (x) => (x % 12 === 0 ? 'zwölf' : x % 12 === 1 ? 'eins' : zahl(x % 12));
  if (m === 0) return `${H(h) === 'eins' ? 'ein' : H(h)} Uhr`;
  if (m === 30) return `halb ${H(h + 1)}`;
  if (m === 15) return `Viertel nach ${H(h)}`;
  if (m === 45) return `Viertel vor ${H(h + 1)}`;
  if (m < 30) return `${zahl(m)} nach ${H(h)}`;
  return `${zahl(60 - m)} vor ${H(h + 1)}`;
}

export const DRILLS = {
  'Datum: am …ten Monat': () => {
    const d = R(1, 31), m = R(0, 11);
    return pick([
      { q: `Write in German: on the ${EN_ORD(d)} of ${MONTHS_EN[m]}`, a: [amDatum(d, m)], steps: `${d} → ${ordinal(d)} + en after "am". 1–19 add -ten, 20+ add -sten. Irregular: ersten, dritten, siebten, achten.` },
      { q: `What date is "${amDatum(d, m)}"? (e.g. 3 May or 3/5)`, a: [`${d} ${MONTHS_EN[m]}`.toLowerCase(), `${MONTHS_EN[m]} ${d}`.toLowerCase(), `${EN_ORD(d)} ${MONTHS_EN[m]}`.toLowerCase(), `${EN_ORD(d)} of ${MONTHS_EN[m]}`.toLowerCase(), `${d}/${m + 1}`, `${d}.${m + 1}`, `${d}.${String(m + 1).padStart(2, '0')}`], steps: `${ordinal(d)}en = ${EN_ORD(d)}` },
      { q: `Wann hast du Geburtstag? Answer: "Ich habe ___ Geburtstag." (${d}. ${MONTHS[m]})`, a: [amDatum(d, m)], steps: `Ich habe ${amDatum(d, m)} Geburtstag.` },
    ]);
  },
  'Ordinalzahlen (1–31)': () => {
    const n = R(1, 31);
    return pick([
      { q: `Ordinal of ${n} in German (der/die/das ___e), e.g. 4 → vierte`, a: [`${ordinal(n)}e`], steps: n < 20 ? '1–19: number + te (erste, dritte, siebte, achte are irregular)' : '20+: number + ste' },
      { q: `Write the number ${n} in German`, a: [zahl(n)], steps: 'Units before tens: einundzwanzig = one-and-twenty' },
    ]);
  },
  'Jahre (years)': () => {
    const y = pick([R(1950, 1999), R(2000, 2015), 1978, 1981, 2009, 2010, 2001, 1989, 1986, 1972, 1998]);
    return pick([
      { q: `Write the year ${y} in German`, a: [jahr(y)], steps: y < 2000 ? 'Up to 1999: neunzehnhundert + rest' : 'From 2000: zweitausend + rest' },
      { q: `Which year is "${jahr(y)}"?`, a: [String(y)], steps: '' },
      { q: `"I was born in ${y}." → Ich wurde ___ geboren.`, a: [jahr(y)], steps: `Ich wurde ${jahr(y)} geboren.` },
    ]);
  },
  'Uhrzeit (time)': () => {
    const h = R(1, 12), m = pick([0, 15, 30, 45, 10, 20, 40, 50]);
    const digital = `${h}:${String(m).padStart(2, '0')}`;
    const h24 = h + 12;
    return pick([
      { q: `What time is "${uhrzeit(h, m)}"? (h:mm)`, a: [digital, `${h}.${String(m).padStart(2, '0')}`, `${h24}:${String(m).padStart(2, '0')}`], steps: m === 30 ? 'halb = half TO the next hour: halb acht = 7:30!' : m === 45 ? 'Viertel vor = quarter TO the next hour' : '' },
      { q: `Say ${digital} the informal German way`, a: [uhrzeit(h, m).toLowerCase()], steps: 'halb + NEXT hour, Viertel nach / Viertel vor, X nach / X vor' },
      { q: `${h24} Uhr in 12-hour time? (e.g. 8pm)`, a: [`${h}pm`, `${h} pm`, `${h}:00pm`, `${h}:00 pm`], steps: `${h24} − 12 = ${h} → ${h}pm` },
    ]);
  },
  'Jahreszeiten (seasons)': () => pick([
    { q: 'Wann beginnt der Sommer in Deutschland? (month in German)', a: ['juni', 'im juni', 'am einundzwanzigsten juni'], steps: 'Northern Hemisphere: summer starts in June (21 June).' },
    { q: 'Wann beginnt der Sommer in Australien? (month in German)', a: ['dezember', 'im dezember', 'am ersten dezember'], steps: 'Southern Hemisphere: summer starts 1 December.' },
    { q: 'Wann beginnt der Herbst in Deutschland?', a: ['september', 'im september', 'am dreiundzwanzigsten september', 'am zweiundzwanzigsten september'], steps: 'Autumn in Germany starts in September.' },
    { q: 'Wann beginnt der Frühling in Deutschland?', a: ['märz', 'im märz', 'am einundzwanzigsten märz', 'am zwanzigsten märz'], steps: 'Spring in Germany starts in March.' },
    { q: 'Wann beginnt der Winter in Deutschland?', a: ['dezember', 'im dezember', 'am einundzwanzigsten dezember'], steps: 'Winter in Germany starts in December.' },
    { q: 'German word for the season "autumn"?', a: ['der herbst', 'herbst'], steps: 'der Herbst' },
    { q: 'German word for "spring"?', a: ['der frühling', 'frühling'], steps: 'der Frühling' },
    { q: 'Translate: My favourite season is summer because there are long days.', a: ['meine lieblingsjahreszeit ist sommer, denn es gibt lange tage', 'meine lieblingsjahreszeit ist der sommer, denn es gibt lange tage'], steps: 'Meine Lieblingsjahreszeit ist Sommer, denn es gibt lange Tage.' },
  ]),
};

// Answer checking: case-insensitive, ignores punctuation; umlaut spelled ae/oe/ue or without dots counts as "almost".
const clean = (s) => s.toLowerCase().normalize('NFC').replace(/[.,!?;:"'()…]/g, ' ').replace(/\s+/g, ' ').trim();
const flat = (s) => clean(s).replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss').replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u');

export function variants(answer) {
  // "to make, to do" / "there / here" → each alternative accepted; "(name)" notes dropped.
  return answer.split(/\s*[\/,]\s*(?=to |the |a |an |\w)/).map((s) => s.replace(/\(.*?\)/g, '').trim()).concat([answer.replace(/\(.*?\)/g, '').trim(), answer]).filter(Boolean);
}

export function checkGerman(input, accepted) {
  const i = clean(input);
  if (!i) return 'wrong';
  for (const a of accepted) {
    const c = clean(a);
    if (i === c) return 'right';
    // English answers: leading "to/the/a/an/at/on" optional
    const lead = /^(to|the|a|an|at|on) /;
    if (i.replace(lead, '') === c.replace(lead, '')) return 'right';
  }
  for (const a of accepted) if (flat(input) === flat(a)) return 'accent';
  return 'wrong';
}
