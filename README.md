# Mr. D's Sims

Physics simulations for the classroom. Each one is a single HTML file that runs in any modern browser, so there is nothing to install and they work on Chromebooks and phones.

Open `index.html` to see them all.

## Rebuilt from the LabVIEW originals

| Page | Original |
|---|---|
| `graphs.html` | Graphs.exe |
| `bouncing-graphs.html` | Bouncing_Graphs.exe |
| `ticker-timer.html` | Ticker_Timer.exe |
| `motion-graphs.html` | Motion_Graphs.exe |
| `gravity.html` | Gravity.exe |
| `terminal-velocity.html` | Terminal_Velocity.exe |
| `bounce-meter.html` | Bounce_Meter.exe |
| `projectiles.html` | Projectiles.exe |
| `falling-target.html` | Falling_Target.exe |
| `ballistic-trolley.html` | Ballistic_Trolley.exe |

Instructions and theory text come from the originals wherever the executables contained it. The Ticker Timer, Motion Graphs and Projectiles originals held little readable text, so those three follow their titles and may differ from the old programs.

## New

`predict-first.html` has three tabs (Two Carts, Hill Roll, Cut the String). Each asks students to commit to a prediction before the simulation runs, then checks it against the equation.

## Using them

- **Locally:** double-click any `.html` file.
- **On the web:** turn on GitHub Pages for this repo (Settings, Pages, deploy from the `main` branch) and share the link.
- **Bounce Meter** can listen through the microphone. Browsers only allow that over `https` (GitHub Pages is fine) or from a local file. If the microphone is blocked, the page has a simulated ball.

## Editing

Every page is plain HTML with its styles and script inside the file. The physics constants sit at the top of each `<script>` block, and the instruction and theory text is ordinary HTML near the end of the page body.

## Chemistry

The `chemistry/` folder holds virtual labs, with a hub page at `chemistry/index.html` that lists them by unit. Each lab opens with the glassware already set up and the instructions on the page.

| Unit | Lab |
|---|---|
| 2 · Properties of Matter | `heating-curve.html` (phase changes, temperature, energy) |
| 2 · Properties of Matter | `specific-heat.html` (calorimetry with a mystery metal) |

To add a lab, put the page in its unit folder and add one entry to `chemistry/labs.js`. Chemistry pages share `chemistry/shared/lab.css`, so keep the `../shared/lab.css` link when copying one.
