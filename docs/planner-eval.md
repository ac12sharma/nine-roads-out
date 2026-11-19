# Trip planner evaluation

The trip planner answers questions in the browser from the site's own data, with no AI model unless one is switched on. This page is how its answers are measured.

```bash
npm test                                   # includes the evaluation
node --test tests/planner-eval.test.mjs    # just the evaluation, with every wrong answer listed
```

## How it works

- **The code under test.** The parsing and answer logic lives in [`src/shared/planner.mjs`](../src/shared/planner.mjs). It has no DOM or network code. The browser runs the same file, inlined into `app.js` by [`src/bundle.mjs`](../src/bundle.mjs), so the evaluation tests what visitors get.
- **The questions.** [`tests/planner-cases.mjs`](../tests/planner-cases.mjs) holds questions people might type. Each one says which kind of answer is right (a list of drives, one drive, places to eat, a driving topic, or "I can't help with that") and what the answer must contain: which drives, in what order, or which restaurants.
- **Where the expected answers come from.** They come from the content files (minutes from Dublin, tags, the restaurant list), not from whatever the planner happened to say.
- **Conversations.** Some cases ask follow-ups after earlier questions ("Glendalough", then "something similar"). Some are asked on a drive's page, where the planner starts by talking about that drive.
- **The threshold.** The test fails if fewer than 90% of all questions are answered correctly. A single wrong answer doesn't break the build, but a drop in accuracy does.

## Two sets of questions

| Set | Questions | Written | Used to tune the parser? |
| --- | ---: | --- | --- |
| Tuning | 96 | Before any parser changes | Yes |
| Held out | 28 | After the parser changes | No, never |

The tuning set's score is optimistic, because the parser was changed to fix its failures. The held-out set was written afterwards and is never used for tuning, so its score is the fairer estimate for questions nobody has seen. When a held-out question fails, the fix goes with a new, similar case in the tuning set, and the held-out set stays as it is.

## Results

| Date | Parser | Tuning set | Held-out set | Overall |
| --- | --- | ---: | ---: | ---: |
| 6 Nov 2026 | As launched (commit `57a3cc2`) | 90 / 96 (93.8%) | not yet written | |
| 6 Nov 2026 | After the fixes below (commit `084ec63`) | 96 / 96 (100%) | 25 / 28 (89.3%) | 121 / 124 (97.6%) |

### What the first run found, and the fix for each

| Question | Wrong answer | Fix |
| --- | --- | --- |
| "two and a half hours" | Didn't understand it | Number words (one to five, "and a half", "half an hour") become minutes |
| "the longest drive" | Didn't understand it | "Longest" counts as wanting a long drive |
| "cheap eats in Birr" | Described the drive instead of listing food | "Eats" is a food word |
| "thai food in Carlingford" | Listed every place on the drive | Cuisines that aren't in the listings get an honest "none listed" |
| "beaches near dublin" | "None of the nine drives match" | When only a vague word ("near", "quick") sets the limit and nothing fits, it shows the closest drives instead |
| "drives with mountains and the sea" | Glendalough first, which has no coast | Drives with more of the scenery asked for come first |

### Known gaps (held-out failures)

- "how fast can I drive on a national road" gets the general fallback. It should give the speed limits. The parser only knows "speed", "limit" and "km/h".
- "do I need an international driving permit" gets the general fallback. Licence and permit questions aren't recognised, and the car hire answer doesn't cover them yet. The licence facts on the car hire page also still need checking against an official source before the planner should repeat them.
- "shortest drive" gets the general fallback. "Shortest" isn't recognised, even though "short" and "closest" are.

## Limits of this evaluation

- I wrote the questions. Real visitors will phrase things differently, so after launch the questions people actually type (if the owner chooses to collect them, which needs a privacy notice) would make a better test set.
- It checks that the right drives or places appear. It does not judge the wording of the answers.
- The AI fallback (`functions/api/chat.js`) is not evaluated here. It is off unless switched on in `site.config.mjs`.
