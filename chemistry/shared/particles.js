/* ChemParticles: the particle-counting model for the Counting Particles lesson (Unit 3, Day 4) and the review portal.
     protons = Z (atomic number)      neutrons = A - Z (mass number minus atomic number)      electrons = Z - q (q = charge)
   Everything the lesson asks is computed from those three lines, so a wrong answer key is impossible by hand.

     ChemParticles.EL            { Z: {s:"Na", n:"sodium", a:[23], ...} }   real mass numbers only; a[0] is the common one
     ChemParticles.counts(Z,A,q) { p, n, e }
     ChemParticles.sup(x)        unicode superscript of a number or sign
     ChemParticles.chg(q)        "+", "2−", ... as plain text         ChemParticles.chgSup(q)  "⁺", "²⁻" ...
     ChemParticles.symText(Z,A,q)  "²³₁₁Na⁺"   ChemParticles.symHTML(Z,A,q)  stacked symbol for the page
     ChemParticles.spec(n, band, seed)  endless practice: a num, mcq or sym question
          { type, q, ans (num) | opts (mcq, one ok:1) | ans {Z,A,q} (sym), unit, why, hint, skill, title, band, m:{...inputs} }
   Bands: 1 neutral atoms. 2 ions. 3 write the symbol. 4 isotopes, unusual ions, naming (carbon-14). */
(function () {
var EL = {
  1:{s:"H",n:"hydrogen",a:[1,2,3]}, 2:{s:"He",n:"helium",a:[4,3]}, 3:{s:"Li",n:"lithium",a:[7,6]}, 4:{s:"Be",n:"beryllium",a:[9]},
  5:{s:"B",n:"boron",a:[11,10]}, 6:{s:"C",n:"carbon",a:[12,13,14]}, 7:{s:"N",n:"nitrogen",a:[14,15]}, 8:{s:"O",n:"oxygen",a:[16,17,18]},
  9:{s:"F",n:"fluorine",a:[19]}, 10:{s:"Ne",n:"neon",a:[20,21,22]}, 11:{s:"Na",n:"sodium",a:[23]}, 12:{s:"Mg",n:"magnesium",a:[24,25,26]},
  13:{s:"Al",n:"aluminum",a:[27]}, 14:{s:"Si",n:"silicon",a:[28,29,30]}, 15:{s:"P",n:"phosphorus",a:[31]}, 16:{s:"S",n:"sulfur",a:[32,33,34,36]},
  17:{s:"Cl",n:"chlorine",a:[35,37]}, 18:{s:"Ar",n:"argon",a:[40,36,38]}, 19:{s:"K",n:"potassium",a:[39,40,41]}, 20:{s:"Ca",n:"calcium",a:[40,42,44]},
  24:{s:"Cr",n:"chromium",a:[52,53]}, 25:{s:"Mn",n:"manganese",a:[55]}, 26:{s:"Fe",n:"iron",a:[56,54,57,58]}, 27:{s:"Co",n:"cobalt",a:[59]},
  28:{s:"Ni",n:"nickel",a:[58,60]}, 29:{s:"Cu",n:"copper",a:[63,65]}, 30:{s:"Zn",n:"zinc",a:[64,66,68]}, 35:{s:"Br",n:"bromine",a:[79,81]},
  47:{s:"Ag",n:"silver",a:[107,109]}, 50:{s:"Sn",n:"tin",a:[120,118]}, 53:{s:"I",n:"iodine",a:[127]}, 56:{s:"Ba",n:"barium",a:[138]},
  82:{s:"Pb",n:"lead",a:[208,206,207]}, 92:{s:"U",n:"uranium",a:[238,235]}
};
var ZS = Object.keys(EL).map(Number).sort(function (a, b) { return a - b; });
/* Ions that really form: [Z, charge].  "Unusual" are the multi-charge metals. */
var ION_COMMON = [[3,1],[11,1],[19,1],[12,2],[20,2],[13,3],[9,-1],[17,-1],[8,-2],[16,-2],[7,-3],[35,-1],[4,2],[1,1]];
var ION_UNUSUAL = [[26,2],[26,3],[29,1],[29,2],[30,2],[24,3],[25,2],[27,2],[28,2],[47,1],[50,2],[50,4],[56,2],[82,2],[53,-1],[15,-3]];
var SUPD = "⁰¹²³⁴⁵⁶⁷⁸⁹", SUBD = "₀₁₂₃₄₅₆₇₈₉";
function sup(x) { return String(x).replace(/\d/g, function (d) { return SUPD[d]; }).replace(/\+/g, "⁺").replace(/[-−]/g, "⁻"); }
function sub(x) { return String(x).replace(/\d/g, function (d) { return SUBD[d]; }); }
function counts(Z, A, q) { return { p: Z, n: A - Z, e: Z - q }; }
function chg(q) { return q === 0 ? "" : (Math.abs(q) === 1 ? "" : String(Math.abs(q))) + (q > 0 ? "+" : "−"); }
function chgSup(q) { return q === 0 ? "" : (Math.abs(q) === 1 ? "" : sup(Math.abs(q))) + (q > 0 ? "⁺" : "⁻"); }
function symText(Z, A, q) { return sup(A) + sub(Z) + EL[Z].s + chgSup(q || 0); }
function symHTML(Z, A, q) {
  return '<span class="sy"><span class="sn"><sup>' + A + '</sup><sub>' + Z + '</sub></span><span class="se">' + EL[Z].s + '</span>' +
    (q ? '<sup class="sc">' + chg(q) + '</sup>' : "") + "</span>";
}
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function seeded(seed) { var x = 2166136261; seed = String(seed); for (var i = 0; i < seed.length; i++) { x ^= seed.charCodeAt(i); x = Math.imul(x, 16777619); } var a = x >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function nameAndSign(q) { return q > 0 ? "positive" : "negative"; }

function spec(n, band, seed) {
  var r = seeded(seed + "|" + n + "|" + band), B = Math.max(1, Math.min(4, band));
  var pick = function (a) { return a[Math.floor(r() * a.length)]; };
  var atomZ = function () { return pick([3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]); };
  var massA = function (Z) { return pick(EL[Z].a.slice(0, 2)); };
  var out = { skill: "chem.particles.b" + B, band: B };
  function numQ(title, q, ans, unit, why, hint, m) { out.type = "num"; out.title = title; out.q = q; out.ans = ans; out.tol = 0.01; out.unit = unit; out.why = why; out.hint = hint; out.m = m; return out; }
  var Z, A, q, c, k;
  if (B === 1) {
    Z = atomZ(); A = massA(Z); c = counts(Z, A, 0); k = pick(["n", "n", "e", "A", "p"]);
    var S = symHTML(Z, A, 0);
    if (k === "n") return numQ("Neutrons in an atom", "A neutral atom is written " + S + ". How many <b>neutrons</b> does it have?", c.n, "neutrons", "Neutrons = mass number − atomic number = " + A + " − " + Z + " = " + c.n + ".", "Subtract the bottom number from the top number.", { kind: "n", Z: Z, A: A, q: 0 });
    if (k === "e") return numQ("Electrons in a neutral atom", "A neutral atom is written " + S + ". How many <b>electrons</b> does it have?", c.e, "electrons", "A neutral atom has as many electrons as protons: " + Z + ".", "Neutral means the charges cancel. Match the electrons to the protons.", { kind: "e", Z: Z, A: A, q: 0 });
    if (k === "p") return numQ("Protons from the name", "A neutral atom has " + c.e + " electrons and " + c.n + " neutrons. How many <b>protons</b> does it have?", c.p, "protons", "Neutral, so protons = electrons = " + c.p + ".", "Neutral means protons equal electrons.", { kind: "p", Z: Z, A: A, q: 0 });
    return numQ("Mass number", "An atom of " + EL[Z].n + " has " + c.p + " protons and " + c.n + " neutrons. What is its <b>mass number</b>?", A, "(mass number)", "Mass number = protons + neutrons = " + c.p + " + " + c.n + " = " + A + ".", "Add the particles that sit in the nucleus.", { kind: "A", Z: Z, A: A, q: 0 });
  }
  if (B === 2) {
    var ion = pick(ION_COMMON); Z = ion[0]; q = ion[1]; A = EL[Z].a[0]; c = counts(Z, A, q); k = pick(["e", "e", "q", "kind"]);
    if (k === "e") return numQ("Electrons in an ion", "An ion is written " + symHTML(Z, A, q) + ". How many <b>electrons</b> does it have?", c.e, "electrons", EL[Z].s + (q > 0 ? " lost " : " gained ") + Math.abs(q) + " electron" + (Math.abs(q) > 1 ? "s" : "") + ". Electrons = " + Z + (q > 0 ? " − " : " + ") + Math.abs(q) + " = " + c.e + ".", "A positive ion has lost electrons. A negative ion has gained them.", { kind: "e", Z: Z, A: A, q: q });
    if (k === "q") return numQ("Charge of an ion", "An ion has <b>" + c.p + " protons</b> and <b>" + c.e + " electrons</b>. What is its charge? Type it with its sign (like 2 or -2).", q, "(charge)", "Charge = protons − electrons = " + c.p + " − " + c.e + " = " + (q > 0 ? "+" : "−") + Math.abs(q) + ".", "Protons are positive, electrons are negative. More of which one?", { kind: "q", Z: Z, A: A, q: q });
    out.type = "mcq"; out.title = "Cation or anion"; out.q = "An atom of " + EL[Z].n + " becomes " + symHTML(Z, A, q) + ". What happened to it?";
    out.opts = q > 0 ? [{ t: "It lost " + q + " electron" + (q > 1 ? "s" : "") + ".", ok: 1 }, { t: "It gained " + q + " electron" + (q > 1 ? "s" : "") + "." }, { t: "It lost " + q + " proton" + (q > 1 ? "s" : "") + "." }, { t: "It gained " + q + " neutron" + (q > 1 ? "s" : "") + "." }]
      : [{ t: "It gained " + -q + " electron" + (q < -1 ? "s" : "") + ".", ok: 1 }, { t: "It lost " + -q + " electron" + (q < -1 ? "s" : "") + "." }, { t: "It gained " + -q + " proton" + (q < -1 ? "s" : "") + "." }, { t: "It lost " + -q + " neutron" + (q < -1 ? "s" : "") + "." }];
    out.why = "Only electrons move in a change like this. A " + nameAndSign(q) + " charge means " + (q > 0 ? "electrons were lost" : "electrons were gained") + ".";
    out.hint = "Protons stay put. Which charged particle can an atom gain or lose?"; out.m = { kind: "kind", Z: Z, A: A, q: q };
    return out;
  }
  if (B === 3) {
    var useIon = r() < .6, pool = useIon ? ION_COMMON : [[atomZ(), 0]], it = pick(pool); Z = it[0]; q = useIon ? it[1] : 0; A = massA(Z); c = counts(Z, A, q);
    out.type = "sym"; out.title = "Write the symbol"; out.q = "A particle has <b>" + c.p + " protons</b>, <b>" + c.n + " neutrons</b> and <b>" + c.e + " electrons</b>. Write its symbol.";
    out.ans = { Z: Z, A: A, q: q }; out.why = "Protons " + c.p + " give the element, " + EL[Z].s + " (atomic number " + Z + "). Mass number = " + c.p + " + " + c.n + " = " + A + ". Charge = " + c.p + " − " + c.e + " = " + (q === 0 ? "0" : (q > 0 ? "+" : "−") + Math.abs(q)) + ". So " + symText(Z, A, q) + ".";
    out.hint = "Three steps: element from the protons, mass number from protons + neutrons, charge from protons − electrons."; out.m = { kind: "sym", Z: Z, A: A, q: q };
    return out;
  }
  /* band 4 */
  k = pick(["name", "diff", "ionIso", "unusual", "unusual", "ident", "total"]);
  var zz = pick([6, 8, 17, 26, 29, 35, 12, 19, 10, 16, 30]); var isos = EL[zz].a;
  if (k === "name") { Z = pick([6, 7, 8, 17, 26, 29, 35, 82, 92, 47]); A = massA(Z); return numQ("Isotope names", cap(EL[Z].n) + "-" + A + " is written " + EL[Z].s + "-" + A + " or " + symHTML(Z, A, 0) + ". How many <b>neutrons</b> does an atom of " + EL[Z].n + "-" + A + " have?", A - Z, "neutrons", "The number in the name is the mass number (" + A + "), not the neutron count. Neutrons = " + A + " − " + Z + " = " + (A - Z) + ".", "The number after the name is the mass number. Subtract the atomic number.", { kind: "n", Z: Z, A: A, q: 0 }); }
  if (k === "diff") { var z2 = pick([1, 6, 8, 17, 19, 26, 29, 35, 12, 10]); var a = EL[z2].a.slice(); var a1 = a[0], a2 = a[1 + Math.floor(r() * (a.length - 1))]; if (a2 === undefined) a2 = a1 + 1;
    var big = Math.max(a1, a2), small = Math.min(a1, a2); return numQ("Isotope difference", "Compare " + EL[z2].n + "-" + big + " with " + EL[z2].n + "-" + small + ". How many <b>more neutrons</b> does the heavier one have?", big - small, "neutrons", "Same protons (" + z2 + "), so the whole mass difference is neutrons: " + big + " − " + small + " = " + (big - small) + ".", "Isotopes have the same protons. Compare the mass numbers.", { kind: "diff", Z: z2, A: big, A2: small, q: 0 }); }
  if (k === "ionIso") { Z = pick([26, 29, 12, 20, 8, 17, 30, 13]); var q2 = { 26: pick([2, 3]), 29: pick([1, 2]), 12: 2, 20: 2, 8: -2, 17: -1, 30: 2, 13: 3 }[Z]; A = pick(EL[Z].a); c = counts(Z, A, q2);
    var wh = pick(["e", "n", "total"]);
    if (wh === "total") return numQ("Total particles in an ion", "How many particles in all (protons + neutrons + electrons) are in one " + symHTML(Z, A, q2) + " ion?", c.p + c.n + c.e, "particles", "p = " + c.p + ", n = " + c.n + ", e = " + c.e + ". Sum = " + (c.p + c.n + c.e) + ".", "Find each count first, then add.", { kind: "total", Z: Z, A: A, q: q2 });
    if (wh === "n") return numQ("Neutrons in an ion", "How many <b>neutrons</b> are in one " + symHTML(Z, A, q2) + " ion?", c.n, "neutrons", "Charge never changes the nucleus. Neutrons = " + A + " − " + Z + " = " + c.n + ".", "Does gaining or losing electrons change the neutron count?", { kind: "n", Z: Z, A: A, q: q2 });
    return numQ("Electrons in an isotope ion", "How many <b>electrons</b> are in one " + symHTML(Z, A, q2) + " ion?", c.e, "electrons", "Electrons = " + Z + (q2 > 0 ? " − " : " + ") + Math.abs(q2) + " = " + c.e + ".", "Start from the protons, then adjust for the charge.", { kind: "e", Z: Z, A: A, q: q2 }); }
  if (k === "unusual") { var u = pick(ION_UNUSUAL); Z = u[0]; q = u[1]; A = EL[Z].a[0]; c = counts(Z, A, q); var w2 = pick(["e", "n", "sym"]);
    if (w2 === "sym") { out.type = "sym"; out.title = "Write an unusual ion"; out.q = "An ion of <b>" + EL[Z].n + "</b> has <b>" + c.n + " neutrons</b> and <b>" + c.e + " electrons</b>. Write its symbol."; out.ans = { Z: Z, A: A, q: q }; out.why = EL[Z].n + " has " + Z + " protons. Mass number = " + Z + " + " + c.n + " = " + A + ". Charge = " + Z + " − " + c.e + " = " + (q > 0 ? "+" : "−") + Math.abs(q) + ". So " + symText(Z, A, q) + "."; out.hint = "The name gives the protons. Then mass number and charge."; out.m = { kind: "sym", Z: Z, A: A, q: q }; return out; }
    if (w2 === "n") return numQ("Neutrons in a metal ion", "How many <b>neutrons</b> are in " + symHTML(Z, A, q) + "?", c.n, "neutrons", "Neutrons = " + A + " − " + Z + " = " + c.n + ". The charge does not touch the nucleus.", "Charge is about electrons. Neutrons come from the mass number.", { kind: "n", Z: Z, A: A, q: q });
    return numQ("Electrons in a metal ion", "How many <b>electrons</b> are in " + symHTML(Z, A, q) + "?", c.e, "electrons", "Electrons = " + Z + (q > 0 ? " − " : " + ") + Math.abs(q) + " = " + c.e + ".", "Start from the protons, then adjust for the charge.", { kind: "e", Z: Z, A: A, q: q }); }
  if (k === "ident") { Z = pick([6, 8, 17, 26, 29, 12, 20, 13]); var q3 = pick([0, 0, 1, -1]); A = massA(Z); c = counts(Z, A, q3); var wrongZ = [];
    while (wrongZ.length < 3) { var cand = pick(ZS.filter(function (x) { return x < 40; })); if (cand !== Z && wrongZ.indexOf(cand) < 0) wrongZ.push(cand); }
    out.type = "mcq"; out.title = "Which element"; out.q = "A particle has <b>" + c.p + " protons</b>, <b>" + c.n + " neutrons</b> and <b>" + c.e + " electrons</b>. Which element is it?";
    out.opts = [{ t: cap(EL[Z].n), ok: 1 }].concat(wrongZ.map(function (z) { return { t: cap(EL[z].n) }; }));
    out.why = "The proton count names the element. " + c.p + " protons is " + EL[Z].n + " (" + EL[Z].s + ")."; out.hint = "Which count decides the element?"; out.m = { kind: "ident", Z: Z, A: A, q: q3 }; return out; }
  /* total in a neutral isotope */
  Z = zz; A = pick(isos); c = counts(Z, A, 0);
  return numQ("Count the nucleus", "How many particles are in the <b>nucleus</b> of one " + EL[Z].n + "-" + A + " atom?", A, "particles", "The nucleus holds protons and neutrons. That is the mass number, " + A + ".", "Electrons live outside the nucleus. Protons plus neutrons is what number?", { kind: "A", Z: Z, A: A, q: 0 });
}
window.ChemParticles = { EL: EL, ZS: ZS, ION_COMMON: ION_COMMON, ION_UNUSUAL: ION_UNUSUAL, counts: counts, sup: sup, sub: sub, chg: chg, chgSup: chgSup, symText: symText, symHTML: symHTML, seeded: seeded, spec: spec, cap: cap };
})();
