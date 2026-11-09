/* Zeff: the model and the atom picture for "Effective nuclear charge and shielding" (Unit 3, slot 15).
   Pure model (no DOM, unit tested):
     Zeff.atom(Z)            { Z, sym, name, period, group, rings:[electrons per shell], core, valence, zeff, n, pull:[num,den] }
     Zeff.pullValue(a)       zeff / n^2 as a number (a model number, author_set, never a measurement)
     Zeff.cmp(a, b)          1 if atom a holds its outer electron harder, -1 if b does, 0 if equal
     Zeff.frac(a)            the pull as text, "7/9"
     Zeff.svg(Z, o)          the atom picture. o = { showCore, marks:[bool], hit, tags:{nucleus,core,outer}, tag, alt }
   Scope: neutral atoms Z = 3 to 20 (Li to Ca). Past Ca the 3d subshell fills and "core" needs a rule this lesson does not teach.
   The estimate is Z_eff = Z - core electrons, where core = every electron in a shell below the outermost shell. Valence electrons
   do not shield each other in this estimate. Real values are larger; the ranking is the same. The pull is Z_eff / n^2 with n the
   outer shell number, standing in for distance (slot 7: double the distance, a quarter of the pull). It is a classroom model number. */
(function (root) {
  'use strict';
  var SYM = ['', 'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca'];
  var NAME = ['', 'hydrogen', 'helium', 'lithium', 'beryllium', 'boron', 'carbon', 'nitrogen', 'oxygen', 'fluorine', 'neon',
    'sodium', 'magnesium', 'aluminum', 'silicon', 'phosphorus', 'sulfur', 'chlorine', 'argon', 'potassium', 'calcium'];
  var CAPS = [2, 8, 8, 2];     // electrons per shell through Z = 20 for the neutral ground state: 2, 8, 8, then 4s takes 2 (3d stays empty through Ca)
  var MIN_Z = 3, MAX_Z = 20;

  function rings(Z) {
    var left = Z, out = [], i;
    for (i = 0; i < CAPS.length && left > 0; i++) { var n = Math.min(CAPS[i], left); out.push(n); left -= n; }
    return out;
  }
  function periodOf(Z) { return Z <= 2 ? 1 : Z <= 10 ? 2 : Z <= 18 ? 3 : 4; }
  function groupOf(Z) {
    var p = periodOf(Z), v = rings(Z)[p - 1];
    if (Z === 2) return 18;
    return v <= 2 ? v : v + 10;
  }
  function atom(Z) {
    if (Z < MIN_Z || Z > MAX_Z) throw new Error('Z out of scope: ' + Z);
    var r = rings(Z), n = r.length, valence = r[n - 1], core = Z - valence, zeff = Z - core;
    return { Z: Z, sym: SYM[Z], name: NAME[Z], period: periodOf(Z), group: groupOf(Z), rings: r, core: core, valence: valence, zeff: zeff, n: n, pull: [zeff, n * n] };
  }
  function pullValue(a) { return a.pull[0] / a.pull[1]; }
  function cmp(a, b) {
    var x = a.pull[0] * b.pull[1], y = b.pull[0] * a.pull[1];   // cross-multiplied, so no rounding
    return x > y ? 1 : x < y ? -1 : 0;
  }
  function frac(a) { return a.pull[0] + '/' + a.pull[1]; }

  /* ---------- the picture: nucleus, rings, electron dots.
     o.showCore  paint the inner rings amber (core) and the outer ring blue
     o.marks     the student's marks, one boolean per ring, inner first: a marked ring is amber, an unmarked ring is grey
     o.hit       add a wide invisible target to each ring (data-i) so a click can toggle it
     o.tags      { nucleus:n, core:n, outer:n }: numbered callouts for the huddle label ---------- */
  var AMBER = '#c07a00', AMBER_DOT = '#e0a020', BLUE = '#2a6fb5', GREY = '#7a8a99';
  function svg(Z, o) {
    o = o || {};
    var a = atom(Z), W = 300, H = 300, cx = 150, cy = 150, R0 = 34, STEP = 34, s = '', i, k;
    s += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + (o.alt || (a.name + ' atom: nucleus with plus ' + Z + ', rings holding ' + a.rings.join(', ') + ' electrons')) + '" style="width:100%;max-width:300px">';
    s += '<rect width="' + W + '" height="' + H + '" fill="var(--stage,#f4f7fb)" rx="10"/>';
    for (i = 0; i < a.n; i++) {
      var r = R0 + STEP * i, outer = i === a.n - 1, col = GREY, dot = BLUE, sw = 1.6;
      if (o.showCore) { col = outer ? BLUE : AMBER; dot = outer ? BLUE : AMBER_DOT; sw = 2.4; }
      else if (o.marks) { var m = !!o.marks[i]; col = m ? AMBER : GREY; dot = m ? AMBER_DOT : BLUE; sw = m ? 3 : 1.6; }
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="' + sw + '"/>';
      for (k = 0; k < a.rings[i]; k++) {
        var ang = (2 * Math.PI * k) / a.rings[i] - Math.PI / 2 + (i % 2) * 0.35;
        s += '<circle cx="' + (cx + r * Math.cos(ang)).toFixed(1) + '" cy="' + (cy + r * Math.sin(ang)).toFixed(1) + '" r="5.2" fill="' + dot + '" stroke="#142230" stroke-width="1"/>';
      }
      if (o.hit) s += '<circle class="zr-hit" data-i="' + i + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="transparent" stroke-width="22" style="cursor:pointer;pointer-events:stroke"/>';
    }
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="19" fill="#e5533d" stroke="#142230" stroke-width="1.5"/>';
    s += '<text x="' + cx + '" y="' + (cy + 5) + '" text-anchor="middle" font-family="monospace" font-weight="700" font-size="14" fill="#fff">+' + Z + '</text>';
    if (o.tag) s += '<text x="12" y="' + (H - 12) + '" font-family="monospace" font-weight="700" font-size="15" fill="#142230">' + a.sym + '</text>';
    if (o.tags) {
      var bx = W - 22, spots = [{ key: 'nucleus', tx: cx + 19, ty: cy, by: 36 }, { key: 'core', tx: cx + R0, ty: cy, by: 150 }, { key: 'outer', tx: cx + R0 + STEP * (a.n - 1), ty: cy, by: 264 }];
      spots.forEach(function (sp) {
        if (!o.tags[sp.key]) return;
        s += '<line x1="' + sp.tx + '" y1="' + sp.ty + '" x2="' + (bx - 12) + '" y2="' + sp.by + '" stroke="#142230" stroke-width="1.2"/>';
        s += '<circle cx="' + bx + '" cy="' + sp.by + '" r="12" fill="#fff" stroke="#142230" stroke-width="1.5"/><text x="' + bx + '" y="' + (sp.by + 5) + '" text-anchor="middle" font-family="monospace" font-weight="700" font-size="14" fill="#142230">' + o.tags[sp.key] + '</text>';
      });
    }
    s += '</svg>';
    return s;
  }

  var ZEFF = { MIN_Z: MIN_Z, MAX_Z: MAX_Z, SYM: SYM, NAME: NAME, atom: atom, rings: rings, pullValue: pullValue, cmp: cmp, frac: frac, svg: svg };
  if (typeof module !== 'undefined' && module.exports) module.exports = ZEFF; else root.Zeff = ZEFF;
})(typeof window !== 'undefined' ? window : globalThis);
