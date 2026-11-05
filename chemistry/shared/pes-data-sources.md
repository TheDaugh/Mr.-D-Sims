# Sources for `pes-data.js`

Every number in `pes-data.js` has one source id below. Values are gas-phase binding energies in eV unless a row says otherwise. MJ/mol = eV × 0.0964853.

## NIST: outermost subshell = first ionization energy (all Z = 1 to 20)

**Source:** NIST Physical Measurement Laboratory, *Handbook of Basic Atomic Spectroscopic Data*, one table per element, "Ionization energy" for the neutral atom (I). Pages: `https://physics.nist.gov/PhysRefData/Handbook/Tables/<element>table1.htm`, from the NIST Atomic Spectra Database (ground states and ionization energies). Accessed 2 Nov 2026.

| Id | Z | Value (eV) |
|---|---|---|
| NIST-IE | 1 H | 13.598433 |
| NIST-IE | 2 He | 24.587387 |
| NIST-IE | 3 Li | 5.391719 |
| NIST-IE | 4 Be | 9.32270 |
| NIST-IE | 5 B | 8.29802 |
| NIST-IE | 6 C | 11.26030 |
| NIST-IE | 7 N | 14.5341 |
| NIST-IE | 8 O | 13.61805 |
| NIST-IE | 9 F | 17.4228 |
| NIST-IE | 10 Ne | 21.56454 |
| NIST-IE | 11 Na | 5.139076 |
| NIST-IE | 12 Mg | 7.646235 |
| NIST-IE | 13 Al | 5.985768 |
| NIST-IE | 14 Si | 8.15168 |
| NIST-IE | 15 P | 10.48669 |
| NIST-IE | 16 S | 10.36001 |
| NIST-IE | 17 Cl | 12.96763 |
| NIST-IE | 18 Ar | 15.759610 |
| NIST-IE | 19 K | 4.3406633 |
| NIST-IE | 20 Ca | 6.11316 |

Check: the outermost subshell of each neutral atom is the one the first ionization removes (1s for H and He; 2s for Li; 2p for B to Ne; 3s for Na and Mg; 3p for Al to Ar; 4s for K and Ca). `node --test` confirms the outermost value matches this table within 10%.

## XDB: inner values, Table 1-1a (solid-state and rare-gas reference levels)

**Source:** Thompson, A. et al., *X-ray Data Booklet*, Lawrence Berkeley National Laboratory, Section 1.1 "Electron Binding Energies", Table 1-1a. `https://xdb.lbl.gov/Section1/Table_1-1a.htm`. The booklet states its reference levels: vacuum level for the rare gases, Fermi level for metals, valence-band top for semiconductors. **Only the rare-gas rows are gas-phase.** The other rows are kept out of the sim.

| Id | Element | Column | Value (eV) |
|---|---|---|---|
| XDB-K | Ar (Z = 18) | K 1s | 3205.9 |
| XDB-M1 | Ar (Z = 18) | M1 3s | 29.3 |

## TARTU: inner gas-phase values from the Tartu database

**Source:** UT-XPS, *Gas phase core electron binding energy database* (Tartu), `https://xps.ut.ee/database.html`; data repository `https://github.com/UT-XPS/gas-phase-database` (commit `7ed673e`, dataset `database_2023_05_30`). Each id below is an entry folder in `digitized_data/<n>/BE_data`. The entry gives its own reference DOI, which is cited here.

| Id | Element | Core level | Value (eV) | Reference DOI |
|---|---|---|---|---|
| TARTU-1587 | Li | 1s | 64.39 | 10.1088/0031-8949/16/5-6/002 |
| TARTU-1947 | Ne | 1s | 870.37 | 10.1016/0368-2048(73)80022-2 |
| TARTU-1949 | Ne | 2s | 48.47 | 10.1016/0368-2048(73)80022-2 |
| TARTU-1943 | Na | 1s | 1078.1 | 10.1088/0031-8949/16/5-6/002 |
| TARTU-1945 | Na | 2s | 70.86 | 10.1088/0031-8949/16/5-6/002 |
| TARTU-1590 | Mg | 1s | 1311.3 | 10.1088/0031-8949/16/5-6/002 |
| TARTU-1592 | Mg | 2s | 96.5 | 10.1088/0031-8949/16/5-6/002 |
| TARTU-1595 | Mg | 2p3/2 | 57.57 | 10.1088/0031-8949/16/5-6/002 |
| TARTU-6 | Ar | 2s | 326.37 | 10.1016/0368-2048(74)85066-8 |
| TARTU-7 | Ar | 2p3/2 | 248.60 | 10.1016/0368-2048(74)85066-8 |


## NISTDFT-LDA: calculated free-atom values for the lab (not measured)

**Added for the virtual lab (slot 11), Ian's decision of 5 Nov 2026.** The values above leave 42 occupied subshells with no gas-phase measurement (listed under "Not in the sim" below). The lab fills exactly those, and only those, from a published free-atom calculation.

**Source:** Kotochigova, S.; Levine, Z. H.; Shirley, E. L.; Stiles, M. D.; Clark, C. W. *Atomic Reference Data for Electronic Structure Calculations*, NIST Standard Reference Database 141 (DOI 10.18434/T4ZP4F, data content updated March 2009). Page per element, "Atomic Total Energies and Eigenvalues", neutral atom, **LDA column** (non-relativistic local density approximation). `https://www.nist.gov/pml/atomic-reference-data-electronic-structure-calculations` (pages `.../atomic-reference-data-electronic-7-<n>`, one per element). Accessed 5 Nov 2026.

**Conversion:** the table gives the orbital energy in hartree (negative). The binding energy used is its magnitude, times 27.211386245988 eV per hartree (CODATA 2018), then times 0.0964853 MJ/mol per eV.

**What these are:** orbital energies of a calculated neutral free atom. They are not measured gas-phase binding energies. Core levels come out about 3 to 20 percent below measurement, and calculated valence 2s and 3s values sit well below measured ones. The ordering 1s > 2s > 2p > 3s > 3p > 4s holds for every element, and the sim shows ordering and relative position, not the third digit. Every such value is marked "calculated" in the data, the sources file and the teacher key.

| Id | Element | Subshell | Orbital energy (hartree) | Binding energy used (eV) |
|---|---|---|---|---|
| NISTDFT-LDA | 4 Be | 1s | 3.856411 | 104.94 |
| NISTDFT-LDA | 5 B | 1s | 6.564347 | 178.62 |
| NISTDFT-LDA | 5 B | 2s | 0.344701 | 9.38 |
| NISTDFT-LDA | 6 C | 1s | 9.947718 | 270.69 |
| NISTDFT-LDA | 6 C | 2s | 0.500866 | 13.63 |
| NISTDFT-LDA | 7 N | 1s | 14.011501 | 381.27 |
| NISTDFT-LDA | 7 N | 2s | 0.676151 | 18.40 |
| NISTDFT-LDA | 8 O | 1s | 18.758245 | 510.44 |
| NISTDFT-LDA | 8 O | 2s | 0.871362 | 23.71 |
| NISTDFT-LDA | 9 F | 1s | 24.189391 | 658.23 |
| NISTDFT-LDA | 9 F | 2s | 1.086859 | 29.57 |
| NISTDFT-LDA | 11 Na | 2p | 1.060636 | 28.86 |
| NISTDFT-LDA | 13 Al | 1s | 55.156044 | 1500.87 |
| NISTDFT-LDA | 13 Al | 2s | 3.934827 | 107.07 |
| NISTDFT-LDA | 13 Al | 2p | 2.564018 | 69.77 |
| NISTDFT-LDA | 13 Al | 3s | 0.286883 | 7.81 |
| NISTDFT-LDA | 14 Si | 1s | 65.184426 | 1773.76 |
| NISTDFT-LDA | 14 Si | 2s | 5.075056 | 138.10 |
| NISTDFT-LDA | 14 Si | 2p | 3.514938 | 95.65 |
| NISTDFT-LDA | 14 Si | 3s | 0.398139 | 10.83 |
| NISTDFT-LDA | 15 P | 1s | 76.061897 | 2069.75 |
| NISTDFT-LDA | 15 P | 2s | 6.329346 | 172.23 |
| NISTDFT-LDA | 15 P | 2p | 4.576617 | 124.54 |
| NISTDFT-LDA | 15 P | 3s | 0.512364 | 13.94 |
| NISTDFT-LDA | 16 S | 1s | 87.789937 | 2388.89 |
| NISTDFT-LDA | 16 S | 2s | 7.699940 | 209.53 |
| NISTDFT-LDA | 16 S | 2p | 5.751257 | 156.50 |
| NISTDFT-LDA | 16 S | 3s | 0.630912 | 17.17 |
| NISTDFT-LDA | 17 Cl | 1s | 100.369229 | 2731.19 |
| NISTDFT-LDA | 17 Cl | 2s | 9.187993 | 250.02 |
| NISTDFT-LDA | 17 Cl | 2p | 7.039982 | 191.57 |
| NISTDFT-LDA | 17 Cl | 3s | 0.754458 | 20.53 |
| NISTDFT-LDA | 19 K | 1s | 128.414957 | 3494.35 |
| NISTDFT-LDA | 19 K | 2s | 12.839001 | 349.37 |
| NISTDFT-LDA | 19 K | 2p | 10.283851 | 279.84 |
| NISTDFT-LDA | 19 K | 3s | 1.281897 | 34.88 |
| NISTDFT-LDA | 19 K | 3p | 0.693776 | 18.88 |
| NISTDFT-LDA | 20 Ca | 1s | 143.935181 | 3916.68 |
| NISTDFT-LDA | 20 Ca | 2s | 15.046905 | 409.45 |
| NISTDFT-LDA | 20 Ca | 2p | 12.285376 | 334.30 |
| NISTDFT-LDA | 20 Ca | 3s | 1.706331 | 46.43 |
| NISTDFT-LDA | 20 Ca | 3p | 1.030572 | 28.04 |


## Choices made in the data (name them in the key)

- **Li 1s:** a second gas-phase entry gives 64.89 eV (TARTU-1588, DOI 10.1016/0368-2048(82)85033-0). The two differ by 0.5 eV. The sim uses 64.39 so that all Li values come from one paper. Shown as an open question in the key.
- **Ne 1s:** other entries give 870.21 and 870.31 eV. The sim uses the 1973 paper that also gives Ne 2s.
- **Mg 1s:** other entries give 1311.2 and 1311.5 eV. The sim uses the paper that also gives Mg 2s and 2p.
- **2p is one peak.** Spin-orbit doublets are not shown (2p3/2 and 2p1/2 are about 0.3 eV apart for Mg and about 2.2 eV for Ar, XDB L3 248.4 and L2 250.6). The 2p3/2 value stands for the subshell. Simplification named in the key.
- **Ar 3s** comes from XDB's M1 column as printed. The XDB table's footnote marks are kept in the source table, not in the data.

## Not in the sim: values with no gas-phase source

The Tartu database has no atomic core-level entry for these subshells (checked by hand: every digitized entry whose formula is a single element symbol from H to Ca, 28 entries). They are listed by `PESData.unverified()` and left out. Elements that have any of these are not in the periodic table of the sim.

- Be 1s; B 1s, 2s, 2p; C 1s, 2s, 2p; N 1s, 2s, 2p; O 1s, 2s, 2p; F 1s, 2s, 2p
- Na 2p (Na 1s and 2s are sourced above; Na is blocked by 2p alone)
- Al 1s, 2s, 2p; Si 1s, 2s, 2p; P 1s, 2s, 2p; S 1s, 2s, 2p; Cl 1s, 2s, 2p
- K 1s, 2s, 2p, 3s, 3p; Ca 1s, 2s, 2p, 3s, 3p (K 2p and Ca 2p, 3p appear in Tartu but are not used until the rest of their subshells are sourced)
- Ar and Ne need no more.
