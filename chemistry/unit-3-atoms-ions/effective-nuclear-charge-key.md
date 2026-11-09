# Effective Nuclear Charge and Shielding: teacher key (slot 15)

Open `effective-nuclear-charge.html#key` for every tab, the answer line on the Pull Meter and the marked huddle blanks.

## Model
Z_eff = Z − core, core = every electron below the outer ring. Valence electrons do not shield each other, so Z_eff equals the valence count. Pull = Z_eff ÷ n². This is a classroom model number (`author_set`), not a measurement. Real Z_eff is larger and the ranking is the same.

## Answers
- Warm-up: W1 sodium outer ring = 1. W2 sodium core = 10. W3 doubling the distance gives one quarter.
- Predict P1: lithium holds harder (ring 2 against ring 3).
- Models: M1 lithium Z_eff 1, pull 1/4. M2 sodium Z_eff 1, pull 1/9. M3 chlorine core 10, Z_eff 7, n 3, pull 7/9.
- Crux: K1 magnesium Z_eff 2. K2 potassium core 18. K3 sodium holds harder than potassium (both Z_eff 1).
- Exit: X1 sulfur Z_eff 6. X2 chlorine. X3 sodium. Scoring: 3 first try is secure, 2 developing, 0 or 1 not yet (teacher-only labels).
- Period 3 Z_eff, Na to Ar: 1, 2, 3, 4, 5, 6, 7, 8.
- Worksheet key: `effective-nuclear-charge-worksheet-key.pdf`.

## Misconceptions
1. "More protons, so K holds harder." Core cancels most of it. Li, Na, K all have Z_eff 1. Pair Li/K shows it.
2. "The pull is Z." Sodium has 11 protons and Z_eff 1 (model M2).
3. "Same period means equal hold." Core is the same, Z grows, Z_eff grows by one each step (Na/Si).
4. "Subtract only ring 1." Every inner ring is core. Sodium: 2 + 8 = 10 (model M3).

## Deliberately left out
The measured dips (Al under Mg, S under P, and the other 11 pairs where the model and the NIST data disagree) are excluded from every generated pair. They are slot 17. The code is in `DIP_PAIRS` and the unit test recomputes it from `chemistry/shared/pes-data.js`.

## To check
- Pull = Z_eff ÷ n² is my choice of classroom number. Change it in `chemistry/shared/zeff.js` only.
- Three hidden bands: band 1 Li/Na/K; band 2 adds Be/Mg/Ca, F/Cl and Na to S pairs; band 3 is every pair from Z = 3 to 20 without dips.
- The page has no projector board. Say if you want one.
