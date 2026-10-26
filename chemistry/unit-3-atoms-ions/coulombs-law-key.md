# Coulomb's Law and the Shell Model: teacher key

Scan, then tweak. The same numbers show in `coulombs-law.html#key`, built from `chemistry/shared/coulomb-practice.js`; edit the items there. Student-ready? Not until you have marked it so: the six simple questions are placeholders (see "To check").

## Push and Pull check (ungraded, 8 items)
| # | Item | Correct | Wrong options (tag) |
|---|---|---|---|
| c1 | Two charged particles sit 1 cm apart and pull on each other. Move them to 2 cm apart. The force becomes: | ¼ as big | 4 times as big (other); 2 times as big (lin); the same (other); ½ as big (inv) |
| c2 | Same pair, now moved from 1 cm to 3 cm apart. The force becomes: | 1⁄9 as big | 3 times as big (lin); ⅓ as big (inv); 1⁄6 as big (other); 9 times as big (other) |
| c3 | Two charges are 4 cm apart. Move them to 2 cm apart (half the distance). The force becomes: | 4 times as big | ½ as big (lin); 2 times as big (inv); ¼ as big (other); the same (other) |
| c4 | Same distance. The charge on one particle is doubled. The force becomes: | 2 times as big | 4 times as big (other); ½ as big (inv); ¼ as big (invsq); the same (other) |
| c5 | Same distance. The charge on one particle is tripled. The force becomes: | 3 times as big | 9 times as big (other); ⅓ as big (inv); 1⁄9 as big (invsq); 6 times as big (other) |
| c6 | Same distance. The charge on both particles is doubled. The force becomes: | 4 times as big | 8 times as big (other); 2 times as big (lin); ½ as big (inv); the same (other) |
| c7 | The force is 36 units when the distance is 1. Fill in the force at each new distance. Charges stay the same. | distance 2: 9; distance 3: 4; distance 6: 1 | 72, 108… or equal steps down = lin; 18, 12, 6 = inv |
| c8 | Charges +1 and +1 give a force of 6 units at a fixed distance. Fill in the force for each new pair at that same distance. | +2 and +1: 12; +1 and +3: 18; +2 and +3: 36 | half or quarter of the base = invsq |

Tags: **lin** linear guess, **inv** inverse guess, **invsq** inverse-square applied to a charge, **other**.
Routing: **scaffolded** if 2+ lin or ≤3 right. **Fluent** if 7–8 right and no lin. Else **standard**. Counts go to the stamp text as `check right/8 [lin,inv,invsq,other]`.

## Six quick questions (placeholders)
| # | Question | Answer |
|---|---|---|
| s1 | Which pair of particles attracts? | a proton and an electron |
| s2 | The nucleus holds the protons and the neutrons. What is its overall charge? | positive |
| s3 | Two electrons are close together. They… | repel each other |
| s4 | Coulomb’s law: when two charges are pulled farther apart, the force between them gets… | weaker |
| s5 | Coulomb’s law: when the charge on one particle gets bigger, the force between them gets… | stronger |
| s6 | “Double” means ×2. A force of 10 units doubles. What is the new force? | 20 units |

## Sim values (force units; 36 = two +1 charges at distance 1)
Predictions to expect: distance 3 → **4**, left charge 3 → **108**, distance 2 with left charge 2 → **18**.

| Run | Left,right | Distance | Force | × first |
|---|---|---|---|---|
| Distance | 1,1 | 1 | 36 | 1 |
| Distance | 1,1 | 2 | 9 | 0.25 |
| Distance | 1,1 | 3 | 4 | 0.111 (1/9) |
| Charge | 2,1 | 1 | 72 | 2 |
| Charge | 3,1 | 1 | 108 | 3 |
| Both | 2,1 | 2 | 18 | 0.5 |
| Both | 2,2 | 2 | 36 | 1 |

## Shell model (one electron; H shell 1 = 1)
| Ion | Shell | Distance × | Pull |
|---|---|---|---|
| H | 1 | 1 | 1 |
| H | 2 | 4 | 1/16 |
| H | 3 | 9 | 1/81 |
| He⁺ | 1 | 1 | 2 |
| Li²⁺ | 1 | 1 | 3 |
| Li²⁺ | 2 | 4 | 3/16 |
Shell 1 vs shell 3, same ion: **81×**.

## Gate (≈ minute 32): 2 cm to 6 cm
A ⅓ (inv) · **B 1⁄9** · C 1⁄6 (mixed) · D ×3 (lin). Huddle script:
1. "Fingers for A, B, C or D. Do not change after you see the room." Tally on the projector page, Class split.
2. Biggest wrong column A: "÷3 is distance alone. Force follows the square: show me 3 × 3."
3. D: "Far means weak. Which way does the force go when charges move apart?"
4. C: "Add or multiply? Distance ×3 divides by 3 × 3."
5. Say it once with a hand motion: **double the distance, quarter the force; double a charge, double the force.** Then give the huddle code.

## Closing ladder (slot × band)
| Slot | Band 1 | Band 2 | Band 3 | Band 4 |
|---|---|---|---|---|
| 1 | 0.25 of B’s pull | 0.0625 of the shell 1 pull | 2 × | 243 × |
| 2 | 24 units | 4 units | 36 units | 32 units |
| 3 | 0.1 N | 0.1 N | 0.5 N | 0.25 N |
| 4 | 2 × | 3 × | 5 × | 4 × |

Slots: 1 shell ratios, 2 combined changes, 3 real pair (band 3 adds a cm to m change), 4 working backward. Fluent route adds two shielding items: 0.0625 and 0.0123 of the H shell 1 pull.
Start band: scaffolded 1, standard 2, fluent 3. Two firsts climb, two misses drop. After minute 36 in class: 2 slots. After minute 40: none (CER only).

## CER (printed scale: 1 point each)
Prompt: He⁺ ion, electron in shell 1; another in shell 3. Which is held harder and by how many times?
- **Claim:** the shell 1 electron, about 81 times as hard.
- **Evidence:** shell 3 is 9 times as far, so the force is divided by 9 × 9.
- **Reasoning:** force goes as 1 ÷ distance², and both electrons have the same charge.
Common miss: dividing by 9, not 81.

## Common errors and fixes
| Error | Sounds like | Fix |
|---|---|---|
| Linear guess | "Twice as far, twice the force" or "half" | Sim at distance 2, then 9 ÷ 36 on paper |
| Inverse guess | "It just halves" | Ratio column, then ask what 2 × 2 and 3 × 3 are doing |
| Squaring a charge | "Double charge, four times" | Which Sim 2 row shows ×4? None |
| Adding changes | "÷4 and ×2 so …" | Write each factor, multiply |
| Shell n = n times as far | 1/4 for shell 2 | Shell 2 is 4 times as far. Divide by 4 × 4 |
| Charge confusion | "Far electrons have less charge" | Same charge. Only distance differs |

## Simplifications
- Force units are invented (36 = two +1 charges at distance 1). No k, no SI.
- Arrow length has a 14 px stub so a weak force shows; jitter follows force. The meter number is exact.
- Shell spacing 1 : 4 : 9 is Bohr spacing for one electron. The same spacing is used for H, He⁺ and Li²⁺ to keep charge and distance separate. Real orbits shrink as Z rises.
- Only one-electron ions appear, so nothing is shielded. The fluent look-ahead treats inner electrons as cancelling protons fully at the same distance (Li ≈ +1; Slater gives ≈ +1.3, slot 15).

## To check before marking student-ready
1. The six quick questions are mine. You said yours were unapproved and not attached.
2. The approved content spec and the ladder addendum were not attached. Items are original, shaped by the AP and olympiad pages.
3. Photo: `img/balloon-hair.png` is a labeled placeholder (Wikimedia refused downloads, HTTP 429). Add the file and keep the credit.
4. The gate's live class split needs the live worker (`shared/config.js` liveUrl). Without it use the projector page tally.
