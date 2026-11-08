// Teaching content. Each lesson is a list of cards; each card shows its lines one at a time,
// so a topic is taught in small steps before you're asked any questions.

export const LESSONS = {
  // ---------- Maths ----------
  '3H Finding & expressing percentages': [
    { t: 'What "per cent" means', s: ['"Per cent" means "out of 100".', 'So 25% means 25 out of 100 = 25/100.', '25 ÷ 100 = 0.25. To turn any percentage into a decimal, divide by 100.'] },
    { t: 'Finding a % of an amount', s: ['Example: find 15% of 80.', 'Step 1: turn 15% into a decimal: 15 ÷ 100 = 0.15.', 'Step 2: "of" means multiply: 0.15 × 80.', 'Step 3: 0.15 × 80 = 12. So 15% of 80 is 12.'] },
    { t: 'Writing one amount as a %', s: ['Example: you got 18 out of 40. What percentage is that?', 'Step 1: make a fraction: 18/40.', 'Step 2: divide, then × 100: 18 ÷ 40 = 0.45, × 100 = 45%.'] },
    { t: 'Watch the units', s: ['Example: 30 minutes as a % of 2 hours.', 'The units must match first: 2 hours = 120 minutes.', 'Now 30 out of 120: 30 ÷ 120 × 100 = 25%.'] },
  ],
  '3I Increasing & decreasing by a %': [
    { t: 'The multiplier trick', s: ['Start with 100% (the whole price).', 'Increase by 20% → 100% + 20% = 120% → multiply by 1.2.', 'Decrease by 20% → 100% − 20% = 80% → multiply by 0.8.'] },
    { t: 'Example: a decrease', s: ['Decrease $50 by 30%.', '100% − 30% = 70% is left.', '70% as a decimal is 0.7.', '50 × 0.7 = $35.'] },
    { t: 'GST', s: ['GST in Australia is 10%.', 'Adding GST: 100% + 10% = 110% → × 1.1.', '$40 + GST = 40 × 1.1 = $44.'] },
    { t: '"How much do I save?"', s: ['The saving is just the percentage of the price.', '25% off $60: you save 0.25 × 60 = $15.', 'You pay 60 − 15 = $45. Read the question: save or pay?'] },
  ],
  '3J % change, profit & loss': [
    { t: 'Profit and loss', s: ['Profit = selling price − cost price.', 'Bought for $40, sold for $55: profit = 55 − 40 = $15.', 'If you sell for LESS than it cost, that is a loss.'] },
    { t: 'Percentage profit', s: ['% profit = profit ÷ COST × 100.', 'Profit $15 on a cost of $40: 15 ÷ 40 × 100 = 37.5%.', 'Always divide by what it COST, not what it sold for.'] },
    { t: 'Percentage change', s: ['% change = change ÷ ORIGINAL × 100.', 'From 80 to 60: change = 60 − 80 = −20.', '−20 ÷ 80 × 100 = −25%. Negative means it went down.'] },
    { t: 'Markup', s: ['A markup is a percentage the shop adds to its cost.', 'Cost $30 with a 50% markup: 100% + 50% = 150% → × 1.5.', '30 × 1.5 = $45.'] },
  ],
  '3K Unitary method (percentages)': [
    { t: 'Work backwards through 1%', s: ['If you know a percentage of something, find 1% first, then 100%.', 'Example: 20% of a number is 14.', '1% = 14 ÷ 20 = 0.7.', '100% = 0.7 × 100 = 70. The number is 70.'] },
    { t: 'Original price after a discount', s: ['After 25% off, a shirt costs $30. What was the original price?', 'You paid 100% − 25% = 75%, so $30 is 75%.', '1% = 30 ÷ 75 = 0.4.', '100% = 0.4 × 100 = $40.'] },
    { t: 'Taking GST off', s: ['A price with GST is $33. That is 110% of the original.', 'GST was added with × 1.1, so undo it with ÷ 1.1.', '33 ÷ 1.1 = $30.'] },
  ],
  '6A Simplifying ratios': [
    { t: 'What a ratio is', s: ['A ratio compares amounts: 2:3 means "2 of these for every 3 of those".', 'You simplify a ratio like a fraction: divide both sides by the same number.'] },
    { t: 'Using the HCF', s: ['Example: simplify 12:18.', 'The highest common factor (biggest number that goes into both) of 12 and 18 is 6.', '12 ÷ 6 = 2 and 18 ÷ 6 = 3.', 'Answer: 2:3.'] },
    { t: 'Decimals and fractions', s: ['Get rid of decimals by multiplying: 1.5:2 → × 2 → 3:4.', 'Get rid of fractions by multiplying by a number both denominators go into:', '1/3 : 1/2 → × 6 → 2:3.'] },
    { t: 'Units must match', s: ['Example: 50 cm : 2 m.', 'Change to the same unit: 2 m = 200 cm, so 50:200.', 'Divide both by 50: 1:4.'] },
  ],
  '6B Solving ratio problems': [
    { t: 'Sharing in a ratio', s: ['Example: share $60 in the ratio 2:3.', 'Step 1: add the parts: 2 + 3 = 5 parts.', 'Step 2: one part = 60 ÷ 5 = $12.', 'Step 3: 2 parts = $24 and 3 parts = $36.', 'Check: 24 + 36 = 60 ✔'] },
    { t: 'When you know one side', s: ['Example: boys:girls = 3:4 and there are 15 boys.', 'The boys are 3 parts, so 3 parts = 15 and 1 part = 5.', 'The girls are 4 parts: 4 × 5 = 20 girls.'] },
  ],
  '6D/6E Rates & rate problems': [
    { t: 'What a rate is', s: ['A rate compares two different units: km/h, $/hour, L/min.', 'The "/" means "per", and "per" means divide.'] },
    { t: 'The speed triangle', s: ['Speed = distance ÷ time.', 'Distance = speed × time.', 'Time = distance ÷ speed.'] },
    { t: 'Examples', s: ['240 km in 3 hours: 240 ÷ 3 = 80 km/h.', 'At 60 km/h for 2.5 hours: 60 × 2.5 = 150 km.', 'Earning $20/hour for 4 hours: 20 × 4 = $80.'] },
    { t: 'km/h ↔ m/s', s: ['1 km = 1000 m and 1 hour = 3600 s, so you × 1000 ÷ 3600.', 'That is the same as ÷ 3.6.', '72 km/h ÷ 3.6 = 20 m/s. Going back: m/s × 3.6 = km/h.'] },
  ],
  '6G Unitary method & best buy': [
    { t: 'Find ONE first', s: ['Unitary means "one". Work out the value of 1, then scale up.', '4 pens cost $12 → 1 pen = 12 ÷ 4 = $3.', '7 pens = 7 × 3 = $21.'] },
    { t: 'Best buy', s: ['Compare unit prices: the price for 1 L (or 1 kg).', '2 L for $3.00 → 3 ÷ 2 = $1.50 per L.', '5 L for $7.00 → 7 ÷ 5 = $1.40 per L.', 'Lower unit price = better buy, so the 5 L one.'] },
    { t: 'More workers, less time', s: ['3 workers take 10 days.', 'Twice as many workers (6) take half the time: 5 days.'] },
  ],
  '8B Types of data & frequency tables': [
    { t: 'Numbers or words?', s: ['Numerical data is numbers (age, height).', 'Categorical data is words or groups (favourite colour).'] },
    { t: 'Two kinds of numerical', s: ['Discrete = counted, whole steps: number of siblings (0, 1, 2…).', 'Continuous = measured, any value: height 152.4 cm, time 13.27 s.'] },
    { t: 'Two kinds of categorical', s: ['Ordinal = the categories have an order: poor / ok / good.', 'Nominal = no order: cat / dog / fish.'] },
    { t: 'Frequency tables', s: ['Frequency = how many times each value appears.', 'Relative frequency = frequency ÷ total.', 'If a score appears 6 times out of 20: 6 ÷ 20 = 0.3.'] },
  ],
  '8C Graphs & shape (skew)': [
    { t: 'Look for the tail', s: ['Skew is named after the side the long TAIL of the histogram is on.', 'Tail to the right → positively skewed (most values low, a few very high).', 'Tail to the left → negatively skewed (most values high, a few very low).', 'Both sides the same → symmetric.'] },
    { t: 'Skew and the mean', s: ['The mean gets pulled towards the tail.', 'Positive skew → mean is bigger than the median.', 'So for skewed data, the median is the better "middle".'] },
  ],
  '8D Measures of centre': [
    { t: 'Mean', s: ['Mean = add them all up ÷ how many there are.', '3, 5, 10 → 3 + 5 + 10 = 18, and there are 3 numbers.', '18 ÷ 3 = 6.'] },
    { t: 'Median', s: ['Median = the middle value once they are IN ORDER.', '2, 9, 4, 7, 5 → in order 2, 4, 5, 7, 9 → middle is 5.', 'Even number of values? Take the two middle ones and go halfway: 2, 4, 6, 8 → (4 + 6) ÷ 2 = 5.'] },
    { t: 'Mode', s: ['Mode = the value that appears most often.', '3, 3, 7, 9 → mode is 3.'] },
    { t: 'Finding a missing score', s: ['4 scores have a mean of 6, so they add to 6 × 4 = 24.', 'You know three of them: 5, 7 and 8, which add to 20.', 'Missing score = 24 − 20 = 4.'] },
  ],
  '8E Measures of spread': [
    { t: 'Range', s: ['Range = highest − lowest.', '4, 9, 15 → 15 − 4 = 11.'] },
    { t: 'Interquartile range (IQR)', s: ['Put the data in order and split it into a lower half and an upper half.', 'If there is an odd number of values, leave out the middle one.', 'Q1 = median of the lower half. Q3 = median of the upper half.', 'IQR = Q3 − Q1.'] },
    { t: 'IQR example', s: ['1, 3, 5, 7, 9, 11, 13 (7 values, so leave out the middle 7).', 'Lower half 1, 3, 5 → Q1 = 3. Upper half 9, 11, 13 → Q3 = 11.', 'IQR = 11 − 3 = 8.'] },
    { t: 'What spread tells you', s: ['Smaller range or IQR = the data is closer together = more consistent.', 'One outlier changes the range a lot, but the IQR hardly at all.'] },
  ],
  '8F Surveying & sampling': [
    { t: 'Population, census, sample', s: ['Population = everyone you want to find out about.', 'Census = you ask the whole population.', 'Sample = you ask only some of them.'] },
    { t: 'Good and bad samples', s: ['A good sample is random and big enough, so it looks like the population.', 'A biased sample does not represent everyone, e.g. asking only people at the gym how much they exercise.'] },
    { t: 'Questions and limitations', s: ['Closed questions have set answers to tick, which are easy to graph.', 'Open questions let people write anything.', 'A limitation is something that makes the data less trustworthy, e.g. people guessing how much money they have.'] },
  ],

  // ---------- German skills ----------
  'Datum: am …ten Monat': [
    { t: 'Dates use ordinals', s: ['In English you say "on the 4th of May". 4th is an ordinal number.', 'German does the same: "am vierten Mai".'] },
    { t: 'Making the ordinal', s: ['1–19: number + t. vier → viert, zehn → zehnt.', 'Four are irregular: 1 erst, 3 dritt, 7 siebt, 8 acht.', '20 and up: number + st. zwanzig → zwanzigst.'] },
    { t: 'Add -en after "am"', s: ['am vierten Mai = on 4 May.', 'am zwanzigsten Juli = on 20 July.', 'am ersten Januar = on 1 January.'] },
    { t: 'Saying your birthday', s: ['Ich habe am zwölften Juni Geburtstag.', '= My birthday is on 12 June.'] },
  ],
  'Ordinalzahlen (1–31)': [
    { t: 'Numbers past 20', s: ['German says the ones BEFORE the tens, joined with "und".', '21 = einundzwanzig (one-and-twenty).', '35 = fünfunddreißig (five-and-thirty).'] },
    { t: 'Ordinals (1st, 2nd…)', s: ['1–19: add -te. 4 → vierte, 12 → zwölfte.', 'Irregular: erste (1st), dritte (3rd), siebte (7th), achte (8th).', '20 and up: add -ste. 25 → fünfundzwanzigste.'] },
  ],
  'Jahre (years)': [
    { t: 'Before 2000', s: ['Say it in hundreds, like "nineteen hundred and eighty-nine".', '1989 = neunzehn + hundert + neunundachtzig.', '= neunzehnhundertneunundachtzig (all one word).'] },
    { t: 'From 2000', s: ['Say "two thousand" = zweitausend, then the rest.', '2009 = zweitausendneun.', '2015 = zweitausendfünfzehn.'] },
    { t: 'No "in"', s: ['English: "I was born in 2009." German leaves out "in":', 'Ich wurde zweitausendneun geboren.'] },
  ],
  'Uhrzeit (time)': [
    { t: 'On the hour', s: ['Uhr = o\'clock. acht Uhr = 8:00.'] },
    { t: 'Quarters', s: ['Viertel nach = quarter past: Viertel nach drei = 3:15.', 'Viertel vor = quarter to: Viertel vor vier = 3:45.'] },
    { t: 'The tricky one: halb', s: ['halb = half TO the next hour, not half past!', 'halb acht = 7:30 (half way to eight).', 'Think: "halb acht" = "half to eight".'] },
    { t: 'Minutes', s: ['nach = past: zehn nach fünf = 5:10.', 'vor = to: zwanzig vor neun = 8:40.'] },
    { t: '24-hour time', s: ['Invitations often use 24-hour time.', 'sechzehn Uhr = 16:00 = 4 pm (16 − 12 = 4).'] },
  ],
  'Jahreszeiten (seasons)': [
    { t: 'The four seasons', s: ['der Frühling = spring.', 'der Sommer = summer.', 'der Herbst = autumn.', 'der Winter = winter.'] },
    { t: 'Flipped seasons', s: ['Germany is in the Northern Hemisphere, so its seasons are the opposite of ours.', 'Summer in Germany: June to August (Juni–August).', 'Summer in Australia: December to February (Dezember–Februar).'] },
    { t: 'A sentence to learn', s: ['Meine Lieblingsjahreszeit ist Sommer, denn es gibt lange Tage.', '= My favourite season is summer, because there are long days.'] },
  ],
};

export const READING_TIPS = [
  { t: 'How to read a German letter', s: ['You do NOT need to understand every word.', 'Read the question first and find its key word: a name, a date, a time, a food.', 'Then look for that part of the text. Names and numbers are easy to spot.', 'Watch out for whose birthday, whose party, who is invited: check who wrote it (bottom) and who it\'s to (top).'] },
];

// Read-along: each letter split into small pieces, each with a mini dictionary of only the
// words you need for that piece, plus the English meaning.
export const READ_ALONG = {
  'Brief von Maike (Stile Week 1)': [
    ['Hallo,', 'Hi,', [['Hallo', 'hello / hi']]],
    ['Meine Familie nennt mich Fritz aber das ist nur mein Spitzname.', 'My family calls me Fritz, but that\'s only my nickname.', [['nennt mich', 'calls me'], ['aber', 'but'], ['nur', 'only'], ['der Spitzname', 'nickname']]],
    ['Ich bin vierzehn Jahre alt und ich gehe in die achte Klasse.', 'I\'m fourteen years old and I\'m in Year 8.', [['vierzehn', '14'], ['Jahre alt', 'years old'], ['ich gehe in', 'I go to / I\'m in'], ['die achte Klasse', 'Year 8 (the eighth class)']]],
    ['Meine Schule ist die Schiller Gesamtschule und ich habe dort viele Freunde.', 'My school is Schiller Comprehensive School and I have lots of friends there.', [['die Schule', 'school'], ['die Gesamtschule', 'comprehensive school'], ['dort', 'there'], ['viele Freunde', 'lots of friends']]],
    ['Sie sind sehr nett zu mir.', 'They are very nice to me.', [['sie sind', 'they are'], ['sehr', 'very'], ['nett', 'nice'], ['zu mir', 'to me']]],
    ['Wie sind deine Freunde und in welche Schule gehst du?', 'What are your friends like, and which school do you go to?', [['wie sind…?', 'what are… like?'], ['deine', 'your'], ['welche', 'which'], ['gehst du', 'do you go']]],
    ['Dieses Jahr feiere ich meinen Geburtstag am sechsundzwanzigsten Juni', 'This year I\'m celebrating my birthday on 26 June', [['dieses Jahr', 'this year'], ['feiere ich', 'I celebrate'], ['der Geburtstag', 'birthday'], ['am sechsundzwanzigsten', 'on the 26th']]],
    ['aber mein eigentlicher Geburtstag ist am zwölften Juni.', 'but my actual birthday is on 12 June.', [['aber', 'but'], ['eigentlicher', 'actual / real'], ['am zwölften', 'on the 12th']]],
    ['Mein Geburtsjahr ist zweitausendneun.', 'My birth year is 2009.', [['das Geburtsjahr', 'year of birth'], ['zweitausendneun', '2009']]],
    ['Wann hast du Geburtstag und was ist dein Geburtsjahr?', 'When is your birthday and what is your birth year?', [['wann', 'when'], ['hast du Geburtstag', 'is your birthday'], ['dein', 'your']]],
    ['Schreib mir bald, Maike', 'Write to me soon, Maike', [['schreib mir', 'write to me'], ['bald', 'soon'], ['Maike', 'the writer\'s name (signed at the bottom)']]],
  ],
  'Inas Einladung (Stile Week 4)': [
    ['Liebe Saskia,', 'Dear Saskia, (so the letter is TO Saskia)', [['Liebe / Lieber', 'Dear (to a girl / to a boy)']]],
    ['Am Samstag, den dreiundzwanzigsten Oktober feiere ich meinen Geburtstag.', 'On Saturday the 23rd of October I\'m celebrating my birthday.', [['Samstag', 'Saturday'], ['dreiundzwanzigsten', '23rd'], ['feiere ich', 'I celebrate'], ['der Geburtstag', 'birthday']]],
    ['Ich möchte dich herzlich zu meiner Party einladen.', 'I would warmly like to invite you to my party.', [['ich möchte', 'I would like'], ['dich', 'you'], ['herzlich', 'warmly'], ['einladen', 'to invite']]],
    ['Die Party findet bei \'Party sind wir\' in der Hohenzollernstraße zehn statt.', 'The party takes place at \'Party sind wir\' at Hohenzollernstraße 10.', [['findet … statt', 'takes place'], ['bei', 'at'], ['die Straße', 'street'], ['zehn', '10']]],
    ['Es geht um sechzehn Uhr los und dauert bis zweiundzwanzig Uhr.', 'It starts at 16:00 (4 pm) and goes until 22:00 (10 pm).', [['es geht los', 'it starts'], ['um … Uhr', 'at … o\'clock'], ['dauert', 'lasts'], ['bis', 'until']]],
    ['Es wird Kuchen, Kekse und Pommes frites zu essen geben', 'There will be cake, biscuits and chips to eat', [['es wird … geben', 'there will be'], ['der Kuchen', 'cake'], ['die Kekse', 'biscuits'], ['Pommes frites', 'chips / fries'], ['essen', 'to eat']]],
    ['und Spezi und Apfelschorle zum Trinken.', 'and Spezi (cola mixed with orange) and apple spritzer to drink.', [['Spezi', 'cola + orange soft drink'], ['die Apfelschorle', 'apple juice with sparkling water'], ['zum Trinken', 'to drink']]],
    ['Bitte sag mir vorher Bescheid, ob du kommen kannst.', 'Please let me know beforehand whether you can come.', [['bitte', 'please'], ['Bescheid sagen', 'to let someone know'], ['vorher', 'beforehand'], ['ob', 'whether / if'], ['kommen kannst', 'can come']]],
    ['Mit lieben Grüßen, Ina Schmidt', 'With kind regards, Ina Schmidt (so Ina wrote it, and it\'s Ina\'s birthday)', [['Mit lieben Grüßen', 'with kind regards']]],
  ],
  'Elenas Party (EP exam list style)': [
    ['Lieber Helmut, liebe Lina,', 'Dear Helmut, dear Lina, (the letter is to these two people)', [['Lieber / liebe', 'Dear (boy / girl)']]],
    ['wie geht es euch?', 'how are you both?', [['wie geht es', 'how is it going'], ['euch', 'you (more than one person)']]],
    ['Eure Tochter, die Elena, wird dieses Jahr vierzehn Jahre alt.', 'Your daughter Elena is turning fourteen this year.', [['eure', 'your (to more than one person)'], ['die Tochter', 'daughter'], ['wird … alt', 'is turning … years old'], ['vierzehn', '14']]],
    ['Ich möchte für meine Mutti und für sie eine große Party organisieren.', 'I\'d like to organise a big party for my mum and for her.', [['ich möchte', 'I would like'], ['für', 'for'], ['die Mutti', 'mum'], ['groß', 'big']]],
    ['Die Feier findet am einunddreißigsten März im Kino \'Unter den Linden\' statt.', 'The celebration takes place on 31 March at the \'Unter den Linden\' cinema.', [['die Feier', 'celebration'], ['findet … statt', 'takes place'], ['einunddreißigsten', '31st'], ['das Kino', 'cinema']]],
    ['Das Kino liegt in der Schillerstraße, Nummer siebzehn.', 'The cinema is on Schillerstraße, number 17.', [['liegt', 'is located'], ['die Straße', 'street'], ['siebzehn', '17']]],
    ['Wir wollen einen Film sehen und dann gibt es leckeres Essen:', 'We want to watch a film and then there\'s tasty food:', [['wir wollen', 'we want'], ['einen Film sehen', 'to watch a film'], ['dann', 'then'], ['es gibt', 'there is'], ['lecker', 'tasty']]],
    ['Kartoffelsalat, Wurst, Apfelstrudel und Schokoladenkuchen.', 'potato salad, sausage, apple strudel and chocolate cake.', [['der Kartoffelsalat', 'potato salad'], ['die Wurst', 'sausage'], ['der Apfelstrudel', 'apple strudel'], ['der Schokoladenkuchen', 'chocolate cake']]],
    ['Zum Trinken gibt es Apfelsaft.', 'To drink there\'s apple juice.', [['zum Trinken', 'to drink'], ['der Apfelsaft', 'apple juice']]],
    ['Die Party beginnt um halb sechs.', 'The party starts at 5:30.', [['beginnt', 'starts'], ['um', 'at'], ['halb sechs', '5:30 (half TO six!)']]],
    ['Bitte sagt Bescheid, ob ihr kommen könnt. Liebe Grüße', 'Please let me know if you can come. Best wishes', [['Bescheid sagen', 'to let someone know'], ['ob', 'whether / if'], ['ihr', 'you (more than one person)'], ['Liebe Grüße', 'best wishes']]],
  ],
};

// Mini maths dictionary: shown under a question for each term it uses, so you know what the
// question is asking for before you start. Each entry: [pattern, term, plain-English meaning].
export const MATHS_TERMS = [
  [/\bpercentage? (profit|loss)\b|% (profit|loss)/i, 'percentage profit / loss', 'How big the profit (or loss) is compared with what it COST, as a %: profit ÷ cost × 100.'],
  [/percentage change/i, 'percentage change', 'How much it went up or down compared with where it STARTED, as a %: change ÷ original × 100.'],
  [/express .* as a percentage|as a percentage/i, 'express as a percentage', 'Write the first amount as "how many out of 100" of the second: first ÷ second × 100.'],
  [/\d+(\.\d+)?% of\b|find \d/i, '% of', '"of" means multiply. 20% of 50 = 0.2 × 50.'],
  [/as a decimal/i, 'as a decimal', 'Write it as a normal number with a decimal point, e.g. 25% = 0.25.'],
  [/\bincrease\b/i, 'increase by', 'Make it bigger by that much.'],
  [/\bdecrease\b/i, 'decrease by', 'Make it smaller by that much.'],
  [/multiplier/i, 'multiplier', 'The single number you multiply by to do the whole change, e.g. × 0.8 takes off 20%.'],
  [/\bGST\b/, 'GST', 'A 10% tax added to prices in Australia.'],
  [/\boff\b|discount/i, 'discount / % off', 'Money taken off the price.'],
  [/\bsave\b/i, 'save', 'How much LESS you pay: the discount amount, not the new price.'],
  [/profit/i, 'profit', 'Money made: selling price − cost price.'],
  [/\bloss\b/i, 'loss', 'Money lost: cost price − selling price.'],
  [/markup/i, 'markup', 'A percentage a shop adds on to what it paid.'],
  [/original price/i, 'original price', 'The price BEFORE any discount or tax.'],
  [/what is the number/i, 'what is the number', 'Find the whole amount (100%).'],
  [/simplify/i, 'simplify (a ratio)', 'Divide both sides by the same number until they can\'t get any smaller.'],
  [/ratio/i, 'ratio', 'A comparison like 2:3 = "2 of these for every 3 of those".'],
  [/share|divide \$/i, 'share in a ratio', 'Split the total into parts that match the ratio.'],
  [/km\/h|speed/i, 'km/h (speed)', 'Kilometres travelled in one hour. Speed = distance ÷ time.'],
  [/m\/s/i, 'm/s', 'Metres travelled in one second.'],
  [/per |\/hour|L\/min|rate/i, 'rate ("per")', '"Per" means "for each one". $20 per hour = $20 for each hour.'],
  [/better buy|best buy/i, 'better buy', 'Which gives you more for your money: compare the price for 1 L (or 1 kg) of each.'],
  [/same rate/i, 'same rate', 'Everyone works at the same speed as before.'],
  [/\bmean\b/i, 'mean', 'The average: add them all up, then divide by how many there are.'],
  [/median/i, 'median', 'The middle number once they\'re in order from smallest to biggest.'],
  [/\bmode\b/i, 'mode', 'The number that appears the most.'],
  [/\brange\b/i, 'range', 'How spread out the numbers are: biggest − smallest.'],
  [/interquartile|IQR/i, 'interquartile range (IQR)', 'The spread of the middle half: Q3 − Q1 (upper-half median − lower-half median).'],
  [/relative frequency/i, 'relative frequency', 'A value\'s frequency ÷ the total, so a fraction of all the data.'],
  [/frequenc/i, 'frequency', 'How many times something appears.'],
  [/consistent/i, 'consistent', 'Scores close together every time, so a small range.'],
  [/outlier/i, 'outlier', 'A value much bigger or smaller than all the rest.'],
  [/skew/i, 'skewed', 'Lopsided: most data bunched on one side with a long tail on the other.'],
  [/histogram/i, 'histogram', 'A column graph for numbers, with the columns touching.'],
  [/symmetric/i, 'symmetric', 'Both sides look the same, like a mirror.'],
  [/census/i, 'census', 'Asking EVERYONE in the group.'],
  [/sample/i, 'sample', 'Asking only some of the group.'],
  [/biased/i, 'biased', 'Unfair: it leans one way and doesn\'t represent everyone.'],
  [/population/i, 'population', 'The whole group you want to find out about.'],
  [/discrete|continuous|categorical|type of data/i, 'type of data', 'Numbers you count = discrete, numbers you measure = continuous, words with an order = ordinal, words without = nominal.'],
  [/2 d\.p\./i, '2 d.p.', 'Round to 2 decimal places, e.g. 3.14159 → 3.14.'],
];

export function mathsTerms(text) {
  const seen = new Set();
  return MATHS_TERMS.filter(([re, term]) => re.test(text) && !seen.has(term) && seen.add(term)).map(([, term, meaning]) => [term, meaning]);
}
