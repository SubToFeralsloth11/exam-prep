# Exam Quest

A gamified study site for 8E German and Year 8 Maths, Term 4 2026. Study to earn coins, then spend them on play time in my own games.

Live: https://subtoferalsloth11.github.io/exam-prep/

## What's in it

| Page | Content | Source |
| --- | --- | --- |
| Teach me | Every lesson in order, for when you have no idea where to start. Lessons show one small step at a time, then give you 5 practice questions. | Written from the content below |
| German | Read-alongs that go through each exam-style letter one piece at a time with a mini dictionary and the English meaning, word lists taught five words at a time (Teach → Learn → Test), both Education Perfect word lists, Stile Unit 8 vocab (seasons, time, party food, Halloween), generated drills for dates, ordinals, years, time and seasons, and three reading-comprehension texts | Education Perfect (8E German), Stile "Unit 8: Was feiert man in Deutschland?" |
| Maths | Generated questions for every Term 4 section: 3H–3K percentages, 6A/6B ratios, 6D/6E/6G rates, 8B–8F statistics | Mr Hives' Term 4 planner in the Year 8 Maths OneNote |
| PSMT lab | Your class survey data (8E, 8G, all Year 8s), shown on the page as collected, in order, or as a frequency table. You calculate the statistics and the site checks them, then shows the histograms and asks about skew. It also has the report checklist and marking criteria. | DayMap task sheet and the "8E Data collection" spreadsheet |
| Boss fights | Timed mock exams for German, statistics and the full Term 4 Maths exam | All of the above |
| Arcade | Timbum, Corner to Super, Car Explosion, Drift Legends 3, Any Pilots On Board? and Cook Up Anything | Each game opens **in the site** (web builds on GitHub Pages under `play/`; the private games are built into public `<game>-play` repos that hold only the build) or **in Godot** through DevBoard (`devboard://play`), which warns "Save your game" 30 seconds before play time runs out and then closes it. Cook Up Anything is Godot-only. If you quit the Godot game yourself, DevBoard's status endpoint tells the site and the unused time is kept. |

## Studying

- **Do this next** on Home picks one thing to do now: lessons for the nearest exam first, then your saved mistakes, then flashcards you missed, then your weakest topic.
- **Tips & tricks** on every lesson (maths topics, German skills, word lists, each letter, PSMT) only teaches: memory tricks, traps and a "Do this now" task such as writing something out or saying it aloud. No questions.
- **Flashcards** on every lesson flip with Space; 1 = Again, 2 = Got it. Cards marked Again are saved and come first next time until you get them right in a later round.
- **My mistakes** keeps every question you got wrong (the exact question) until you answer it right, here or anywhere else.
- **Hear it** reads German aloud with the browser's German voice: flashcards (or press H), word teaching, read-alongs, the letter in reading questions, and any German word in a mini dictionary.
- **Key words first**: before a letter's questions, the words they need are listed.

## Help while answering

- **I don't know** (or a wrong answer) walks you through the solution one step at a time, then offers a similar question or the full lesson. Vocab asks you to type the word once to lock it in; reading questions point to the sentence in the letter, with its mini dictionary and meaning.
- **What does this mean?** explains the maths words in the question (median, markup, 2 d.p.…) or shows the letter's mini dictionary.
- **Hint** shows the next step only. A hinted right answer earns 1 coin.
- **Type `?`** in any question to open the mini dictionary and the next hint without leaving the question.
- **Calculator** and **Working out** (type or draw) on every maths question. Working out is kept (even after a reload) until you press Clear.
- **Smart marking.** Answers about meaning are marked on their key words: "8th class", "she's in year 8" and "eight" all match 8, and "the 12th of June" matches 12 June. The right words in a different order count. A small spelling slip counts for English answers; for German answers and maths numbers that are nearly right it says "So close" and lets you try once more.

## Time studied

Home and the top bar show time studied today, over the last 7 days (with a bar per day) and in total, split into German and Maths. It counts while a question, lesson, read-along or the PSMT lab is open and the tab is visible, and pauses after 90 seconds without a key press or click.

## Rewards

- Right answer: 10 XP and 2 coins. A combo doubles the coins from 5 in a row and triples them from 10.
- Daily quests, level-ups, badges and boss wins give bonus coins.
- The Arcade unlocks once you get 20 answers right that day. Play time costs 25 coins a minute, about 3 minutes of study per minute of play.
- Progress is saved in the browser (`localStorage`).

## Updating a game in the Arcade

```
tools/publish_game.sh <project_dir> <git_ref> <pages_repo>
tools/publish_game.sh ~/Code/timbum main timbum
tools/publish_game.sh ~/Code/corner-to-super main corner-to-super-play
tools/publish_game.sh "~/Code/Car Explosion" main car-explosion-play
tools/publish_game.sh ~/Code/DL3/dl-3-overhaul dl3-overhaul drift-legends-3-play
tools/publish_game.sh "~/Code/Friend end-dp" dear-passengers-overhaul any-pilots-on-board
```

Exports a clean worktree of that commit for the web (Godot 4.7, no threads, so it runs on GitHub Pages) and pushes it to `play/` on the `gh-pages` branch of `<pages_repo>`, creating that repo as public if it doesn't exist. Packs over 90 MB are split into parts (GitHub's file limit is 100 MB). `tools/game_loader.js` is added to the game page: it joins the parts, keeps the game files in the browser's cache so only the first launch of each build downloads them, and re-locks the mouse on the next click when the browser refused the game's lock request. Anything else on the branch, such as Timbum's trailer page, is left alone.

While a game runs, the arcade's play timer pauses during loading, when the tab is hidden, and when the game picture hasn't changed for 3 seconds (frozen, or sitting on a pause menu).

## Run locally

```
python3 -m http.server 8765
```

Then open http://localhost:8765/. There's no build step.
