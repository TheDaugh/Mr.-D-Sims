# Live view

Shows you, on `teacher/index.html`, where each student is in a guided lesson: step, level, questions answered, misses, the question on their screen, and how many times they left. It sees the lesson page only. It cannot see a laptop, a tab, or anything outside the page.

It stays off until you turn it on. Student pages send nothing while `liveUrl` in `shared/config.js` is empty.

## Turn it on (about 10 minutes, free Cloudflare account)

1. `npm install -g wrangler`, then `wrangler login`.
2. In this folder: `wrangler deploy`. It prints a URL like `https://mrd-live.YOURNAME.workers.dev`.
3. Set the teacher token: `wrangler secret put TEACHER_TOKEN` and paste a long random string. Keep it; students never get it.
4. If your site is not at `https://thedaugh.github.io`, change `ALLOW_ORIGIN` in `wrangler.toml` and deploy again.
5. Put the worker URL in `shared/config.js` as `liveUrl`, commit, and push.
6. On `teacher/index.html`, open "Live view", paste the worker URL and the token once. They stay in that browser only.

## What is kept

First name and period (what the student typed), step, level, counts, and the question text on screen. It lives in the memory of one worker object per class and day, is never written to disk, and a student drops off the list after ten minutes without a beat.

## Limits

Cloudflare's free plan covers 100,000 requests a day. A class of 25 beating every 10 seconds for 50 minutes is about 7,500.

## Class split on the projector (Unit 3, slot 7)

`chemistry/unit-3-atoms-ions/coulombs-law-board.html`, panel "Class split", reads `/class` with the same worker address and teacher token you saved on the teacher page. Students' locked gate answers (A to D) and a four-number check summary fill the bars, with a period filter. Nothing new to deploy: the worker already keeps whole beats. Turn live on first (steps above), open the projector page, press **Go live**.
