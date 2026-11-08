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

// How a date's ordinal is built, for the step-by-step explanations.
function ordinalWhy(d) {
  const irregular = { 1: 'eins → erst', 3: 'drei → dritt', 7: 'sieben → siebt', 8: 'acht → acht' };
  if (irregular[d]) return `${d} is irregular: ${irregular[d]}.`;
  return d < 20 ? `${d} = ${zahl(d)}. For 1–19 add -t: ${ordinal(d)}.` : `${d} = ${zahl(d)}. For 20 and up add -st: ${ordinal(d)}.`;
}

export const DRILLS = {
  'Datum: am …ten Monat': () => {
    const d = R(1, 31), m = R(0, 11);
    return pick([
      { q: `Write in German: on the ${EN_ORD(d)} of ${MONTHS_EN[m]}`, a: [amDatum(d, m)], steps: [`"On the …" = "am".`, `Turn ${d} into an ordinal (1st, 2nd…). ${ordinalWhy(d)}`, `After "am" the ordinal ends in -en: ${ordinal(d)}en.`, `${MONTHS_EN[m]} = ${MONTHS[m]}.`, `Together: ${amDatum(d, m)}`] },
      { q: `What date is "${amDatum(d, m)}"? (e.g. 3 May or 3/5)`, a: [`${d} ${MONTHS_EN[m]}`.toLowerCase(), `${MONTHS_EN[m]} ${d}`.toLowerCase(), `${EN_ORD(d)} ${MONTHS_EN[m]}`.toLowerCase(), `${EN_ORD(d)} of ${MONTHS_EN[m]}`.toLowerCase(), `${d}/${m + 1}`, `${d}.${m + 1}`, `${d}.${String(m + 1).padStart(2, '0')}`], steps: [`"am" = "on the". Drop the -en ending: ${ordinal(d)}en → ${ordinal(d)}.`, `${ordinalWhy(d)} So it's the ${EN_ORD(d)}.`, `${MONTHS[m]} = ${MONTHS_EN[m]}.`, `Answer: ${d} ${MONTHS_EN[m]}`] },
      { q: `Wann hast du Geburtstag? (When is your birthday?) Fill the gap for ${d}. ${MONTHS[m]}: "Ich habe ___ Geburtstag."`, a: [amDatum(d, m)], steps: [`Birthdays use "am" + ordinal + -en + month.`, `${ordinalWhy(d)} With -en: ${ordinal(d)}en.`, `Ich habe ${amDatum(d, m)} Geburtstag.`] },
    ]);
  },
  'Ordinalzahlen (1–31)': () => {
    const n = R(1, 31), o = n % 10, t = Math.floor(n / 10);
    return pick([
      { q: `Ordinal of ${n} in German (der/die/das ___e), e.g. 4 → vierte`, a: [`${ordinal(n)}e`], steps: [ordinalWhy(n), `Ordinals after der/die/das end in -e: ${ordinal(n)}e.`] },
      { q: `Write the number ${n} in German`, a: [zahl(n)], steps: n > 20 && o ? [`German says the ones BEFORE the tens, joined by "und".`, `${n} = ${o} and ${t * 10}: ${o === 1 ? 'ein' : zahl(o)} + und + ${zahl(t * 10)}.`, zahl(n)] : [`${n} is a word you just learn: ${zahl(n)}.`] },
    ]);
  },
  'Jahre (years)': () => {
    const y = pick([R(1950, 1999), R(2000, 2015), 1978, 1981, 2009, 2010, 2001, 1989, 1986, 1972, 1998]), hi = Math.floor(y / 100), r = y % 100;
    const how = y < 2000
      ? [`Up to 1999 you say it in hundreds: ${y} = ${hi} hundred and ${r}.`, `${hi} = ${zahl(hi)}, then "hundert", then ${r} = ${zahl(r)}.`, `All one word: ${jahr(y)}`]
      : [`From 2000 you say "two thousand" = zweitausend.`, r ? `Then add ${r} = ${zahl(r)}.` : 'Nothing to add.', `All one word: ${jahr(y)}`];
    return pick([
      { q: `Write the year ${y} in German`, a: [jahr(y)], steps: how },
      { q: `Which year is "${jahr(y)}"?`, a: [String(y)], steps: [y < 2000 ? `Split it at "hundert": ${zahl(hi)} | hundert | ${zahl(r)}.` : `Split it: zweitausend | ${r ? zahl(r) : ''}.`, y < 2000 ? `${zahl(hi)} = ${hi}, hundert = hundred, ${zahl(r)} = ${r}. So ${hi} hundred and ${r}.` : `zweitausend = 2000${r ? `, ${zahl(r)} = ${r}` : ''}.`, `= ${y}`] },
      { q: `"I was born in ${y}." → Ich wurde ___ geboren.`, a: [jahr(y)], steps: [`In German you don't say "in" before a year. Just the year.`, ...how, `Ich wurde ${jahr(y)} geboren.`] },
    ]);
  },
  'Uhrzeit (time)': () => {
    const h = R(1, 12), m = pick([0, 15, 30, 45, 10, 20, 40, 50]);
    const digital = `${h}:${String(m).padStart(2, '0')}`;
    const h24 = h + 12, next = (h % 12) + 1;
    const why = m === 0 ? [`"Uhr" = o'clock.`, `${uhrzeit(h, m)} = ${h}:00`]
      : m === 30 ? [`"halb" means half TO the next hour (not half past!).`, `halb ${uhrzeit(h, m).split(' ')[1]} = half way to ${next}:00 = ${h}:30`]
        : m === 15 ? [`"Viertel nach" = quarter past.`, `Viertel nach ${h} = ${h}:15`]
          : m === 45 ? [`"Viertel vor" = quarter TO the next hour.`, `Viertel vor ${next} = 15 minutes before ${next}:00 = ${h}:45`]
            : m < 30 ? [`"nach" = past.`, `${zahl(m)} nach = ${m} minutes past ${h} = ${digital}`]
              : [`"vor" = to (before the next hour).`, `${zahl(60 - m)} vor = ${60 - m} minutes before ${next}:00 = ${digital}`];
    return pick([
      { q: `What time is "${uhrzeit(h, m)}"? (h:mm)`, a: [digital, `${h}.${String(m).padStart(2, '0')}`, `${h24}:${String(m).padStart(2, '0')}`], steps: why },
      { q: `Say ${digital} the informal German way`, a: [uhrzeit(h, m).toLowerCase()], steps: [m === 0 ? 'On the hour: number + Uhr.' : m === 30 ? `:30 → "halb" + the NEXT hour (${next}).` : m === 15 ? ':15 → "Viertel nach" + this hour.' : m === 45 ? `:45 → "Viertel vor" + the NEXT hour (${next}).` : m < 30 ? `${m} minutes past → "${zahl(m)} nach" + this hour.` : `${60 - m} minutes before ${next} → "${zahl(60 - m)} vor" + the next hour.`, `= ${uhrzeit(h, m)}`] },
      { q: `${h24} Uhr in 12-hour time? (e.g. 8pm)`, a: [`${h}pm`, `${h} pm`, `${h}:00pm`, `${h}:00 pm`], steps: [`Over 12 means afternoon/evening: subtract 12.`, `${h24} − 12 = ${h} → ${h}pm`] },
    ]);
  },
  'Jahreszeiten (seasons)': () => pick([
    { q: 'Wann beginnt der Sommer in Deutschland? (When does summer start in Germany? Answer with the month in German)', a: ['juni', 'im juni', 'am einundzwanzigsten juni'], steps: ['Germany is in the Northern Hemisphere, so its seasons are the opposite of Australia\'s.', 'Summer there starts in June (21 June) = Juni.'] },
    { q: 'Wann beginnt der Sommer in Australien? (When does summer start in Australia? Month in German)', a: ['dezember', 'im dezember', 'am ersten dezember'], steps: ['Australia is in the Southern Hemisphere: summer starts 1 December.', 'December = Dezember.'] },
    { q: 'Wann beginnt der Herbst in Deutschland? (When does autumn start in Germany? Month in German)', a: ['september', 'im september', 'am dreiundzwanzigsten september', 'am zweiundzwanzigsten september'], steps: ['der Herbst = autumn.', 'In the Northern Hemisphere autumn starts in September = September.'] },
    { q: 'Wann beginnt der Frühling in Deutschland? (When does spring start in Germany? Month in German)', a: ['märz', 'im märz', 'am einundzwanzigsten märz', 'am zwanzigsten märz'], steps: ['der Frühling = spring.', 'In the Northern Hemisphere spring starts in March = März.'] },
    { q: 'Wann beginnt der Winter in Deutschland? (When does winter start in Germany? Month in German)', a: ['dezember', 'im dezember', 'am einundzwanzigsten dezember'], steps: ['Northern Hemisphere: winter starts in December.', 'December = Dezember.'] },
    { q: 'German word for the season "autumn"?', a: ['der herbst', 'herbst'], steps: ['autumn = der Herbst (sounds a bit like "harvest").'] },
    { q: 'German word for "spring"?', a: ['der frühling', 'frühling'], steps: ['spring = der Frühling ("früh" means early: the early part of the year).'] },
    { q: 'Translate: My favourite season is summer because there are long days.', a: ['meine lieblingsjahreszeit ist sommer, denn es gibt lange tage', 'meine lieblingsjahreszeit ist der sommer, denn es gibt lange tage'], steps: ['My favourite season = meine Lieblingsjahreszeit (Lieblings- = favourite, Jahreszeit = season).', 'is summer = ist Sommer.', 'because = denn. there are = es gibt. long days = lange Tage.', 'Meine Lieblingsjahreszeit ist Sommer, denn es gibt lange Tage.'] },
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
