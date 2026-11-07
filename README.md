# Exam Quest

A gamified study site for 8E German and Year 8 Maths, Term 4 2026. Study to earn coins, then spend them on play time in my own games.

Live: https://subtoferalsloth11.github.io/exam-prep/

## What's in it

| Page | Content | Source |
| --- | --- | --- |
| German | Both Education Perfect word lists, Stile Unit 8 vocab (seasons, time, party food, Halloween), generated drills for dates, ordinals, years, time and seasons, and three reading-comprehension texts | Education Perfect (8E German), Stile "Unit 8: Was feiert man in Deutschland?" |
| Maths | Generated questions for every Term 4 section: 3H–3K percentages, 6A/6B ratios, 6D/6E/6G rates, 8B–8F statistics | Mr Hives' Term 4 planner in the Year 8 Maths OneNote |
| PSMT lab | Your class survey data (8E, 8G, all Year 8s). You calculate the statistics and the site checks them, then shows the histograms and asks about skew. It also has the report checklist and marking criteria. | DayMap task sheet and the "8E Data collection" spreadsheet |
| Boss fights | Timed mock exams for German, statistics and the full Term 4 Maths exam | All of the above |
| Arcade | Starhop, Orbit Snap, Glow Swarm, Slime Idle, Barry's Barn, Squad Arcade and Timbum | My GitHub Pages games |

## Rewards

- Right answer: 10 XP and 2 coins. A combo doubles the coins from 5 in a row and triples them from 10.
- Daily quests, level-ups, badges and boss wins give bonus coins.
- The Arcade unlocks once you get 20 answers right that day. Play time costs 25 coins a minute, about 3 minutes of study per minute of play.
- Progress is saved in the browser (`localStorage`).

## Run locally

```
python3 -m http.server 8765
```

Then open http://localhost:8765/. There's no build step.
