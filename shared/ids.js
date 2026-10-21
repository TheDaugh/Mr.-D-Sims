/* MrD.ids: anonymous student IDs, so nobody types a name on a lesson and nothing graded carries one.

   How it works
   - On YOUR device (teacher/index.html, "Student IDs") you paste a roster of name and period. Each student's ID is derived
     from name + period with HMAC-SHA256 and a secret that is made on first use and kept only in your browser (and in a backup
     file you download). The secret is never in the repo and never on a student's device, so an ID cannot be worked out from a name.
   - An ID is 7 characters, shown like K7Q-4M2. The last character is a check character, so a student's typo is caught on the
     page without any server. Pages validate the shape and the check character only.
   - Everything that used to carry a name carries the ID instead: stamps, lock codes, live view, profile records, seeds.
     A lesson stores the ID in the same field it used for the first name, so no other code has to change.
   - To read an ID back, the teacher page recomputes every ID from the roster and matches. Lose the secret and you re-issue cards.

   Student side (any lesson page)
     MrD.ids.me()                       { id, period } remembered on this device, or null
     MrD.ids.setMe(id, period)          remember it, so every lesson prefills
     MrD.ids.validate(text)             { ok, id } or { ok:false, why:"empty"|"shape"|"check" }
     MrD.ids.ask(host, opts)            draw the ID + period fields.  opts: { id, period, onChange(info) }  info: { id, period, valid, why }

   Teacher side (needs https or localhost for crypto.subtle)
     MrD.ids.parseRoster(text)          [{ name, period }]  from lines like "Jane Smith, 3" or pasted spreadsheet rows
     MrD.ids.deriveRoster(rows, secret) Promise of [{ name, period, id }]  (re-derives on the rare collision)
     MrD.ids.decode(id, table)          { name, period } or null
     MrD.ids.ensureSecret() / getSecret() / setSecret(s) / getRoster() / setRoster(rows) / backup() / restore(text) */
(function () {
  "use strict";
  var root = typeof window !== "undefined" ? window : globalThis;
  var MrD = (root.MrD = root.MrD || {});

  var AB = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";        // no I, L, O, U: nothing to confuse on a Chromebook keyboard
  var W = [1, 3, 5, 7, 9, 11];                        // odd weights: any single wrong character always changes the check
  var K_SECRET = "mrd.ids.secret", K_ROSTER = "mrd.ids.roster", K_ME = "mrd.ids.me";

  function norm(s) { return String(s == null ? "" : s).toLowerCase().replace(/\s+/g, " ").trim(); }
  function checkChar(six) { var s = 0, i; for (i = 0; i < 6; i++) s += AB.indexOf(six.charAt(i)) * W[i]; return AB.charAt(s % 32); }
  function format(seven) { return seven.slice(0, 3) + "-" + seven.slice(3); }
  function clean(t) { return String(t == null ? "" : t).toUpperCase().replace(/[\s\-_.]/g, "").replace(/O/g, "0").replace(/[IL]/g, "1").replace(/U/g, "V"); }

  function validate(text) {
    var s = clean(text);
    if (!s) return { ok: false, why: "empty" };
    if (s.length !== 7 || /[^0-9A-HJKMNP-TV-Z]/.test(s)) return { ok: false, why: "shape" };
    if (checkChar(s.slice(0, 6)) !== s.charAt(6)) return { ok: false, why: "check" };
    return { ok: true, id: format(s) };
  }

  /* ---------- derivation (teacher device) ---------- */
  function subtle() { var c = root.crypto; return c && c.subtle; }
  function sixFrom(b) {
    var v = (b[0] << 22) | (b[1] << 14) | (b[2] << 6) | (b[3] >> 2), out = "", i;     // the first 30 bits of the digest
    for (i = 5; i >= 0; i--) out += AB.charAt((v >>> (5 * i)) & 31);
    return out;
  }
  function derive(secret, name, period, n) {
    if (!subtle()) return Promise.reject(new Error("This browser cannot make IDs here. Open the teacher page over https or localhost."));
    var enc = new TextEncoder(), msg = norm(name) + "|" + norm(period) + (n ? "|#" + n : "");
    return subtle().importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
      .then(function (k) { return subtle().sign("HMAC", k, enc.encode(msg)); })
      .then(function (buf) { var six = sixFrom(new Uint8Array(buf)); return format(six + checkChar(six)); });
  }
  function deriveRoster(rows, secret) {
    var taken = {}, out = [];
    return rows.reduce(function (p, r) {
      return p.then(function () {
        function go(n) {
          return derive(secret, r.name, r.period, n).then(function (id) {
            if (taken[id]) return go(n + 1);
            taken[id] = true; out.push({ name: r.name, period: r.period, id: id });
          });
        }
        return go(0);
      });
    }, Promise.resolve()).then(function () { return out; });
  }
  function decode(text, table) {
    var v = validate(text); if (!v.ok) return null;
    for (var i = 0; i < table.length; i++) if (table[i].id === v.id) return { name: table[i].name, period: table[i].period };
    return null;
  }
  function parseRoster(text) {
    var rows = [];
    String(text || "").split(/\r?\n/).forEach(function (line) {
      line = line.trim(); if (!line) return;
      var parts = line.indexOf("\t") >= 0 ? line.split("\t") : line.split(/,(?=[^,]*$)/);
      if (parts.length < 2) return;
      var period = parts[parts.length - 1].trim(), name = parts.slice(0, -1).join(", ").trim();
      if (!name || !period || /^name$/i.test(name) && /^period$/i.test(period)) return;
      rows.push({ name: name, period: period });
    });
    return rows;
  }
  function randomSecret() {
    var b = new Uint8Array(16), s = "", i;
    (root.crypto && root.crypto.getRandomValues ? root.crypto.getRandomValues(b) : b.forEach(function (_, j) { b[j] = Math.floor(Math.random() * 256); }));
    for (i = 0; i < b.length; i++) s += AB.charAt(b[i] & 31) + AB.charAt((b[i] >> 3) & 31);
    return s;
  }

  /* ---------- storage ---------- */
  function ls() { try { return root.localStorage; } catch (e) { return null; } }
  function get(k) { var s = ls(); try { return s ? s.getItem(k) : null; } catch (e) { return null; } }
  function set(k, v) { var s = ls(); try { if (s) s.setItem(k, v); return !!s; } catch (e) { return false; } }
  function getSecret() { return get(K_SECRET) || ""; }
  function setSecret(s) { return set(K_SECRET, String(s)); }
  function ensureSecret() { var s = getSecret(); if (!s) { s = randomSecret(); setSecret(s); } return s; }
  function getRoster() { try { var v = JSON.parse(get(K_ROSTER)); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  function setRoster(rows) { return set(K_ROSTER, JSON.stringify(rows || [])); }
  function backup() { return JSON.stringify({ app: "mrd-ids", version: 1, exported: new Date().toISOString(), secret: getSecret(), roster: getRoster() }, null, 1); }
  function restore(text) {
    var j; try { j = JSON.parse(text); } catch (e) { throw new Error("That file is not valid JSON."); }
    if (!j || j.app !== "mrd-ids" || !j.secret) throw new Error("That is not an ID backup file.");
    setSecret(j.secret); setRoster(Array.isArray(j.roster) ? j.roster : []); return { students: (j.roster || []).length };
  }
  function me() { try { var v = JSON.parse(get(K_ME)); return v && v.id ? v : null; } catch (e) { return null; } }
  function setMe(id, period) { return set(K_ME, JSON.stringify({ id: id, period: period || "" })); }

  /* ---------- the student's fields ---------- */
  var MSG = { empty: "", shape: "An ID has 7 letters and numbers, like K7Q-4M2.", check: "That ID has a typo. Check the last character." };
  function ask(host, o) {
    o = o || {};
    var m = me() || {}, wrap = document.createElement("div"); wrap.className = "mrd-idask";
    function field(label, id, val, w) {
      var l = document.createElement("label"); l.textContent = label + " ";
      var i = document.createElement("input"); i.type = "text"; i.id = id; i.autocomplete = "off"; i.spellcheck = false; i.value = val || ""; i.style.width = w;
      i.setAttribute("aria-label", label); l.appendChild(i); return { l: l, i: i };
    }
    var f1 = field("Your ID", "mrd-id", o.id || m.id || "", "9em"), f2 = field("Period", "mrd-period", o.period || m.period || "", "5em");
    f1.i.setAttribute("autocapitalize", "characters"); f1.i.maxLength = 12; f2.i.maxLength = 4;
    var msg = document.createElement("p"); msg.className = "hint mrd-idmsg"; msg.setAttribute("aria-live", "polite");
    wrap.appendChild(f1.l); wrap.appendChild(f2.l); wrap.appendChild(msg);
    function info() {
      var v = validate(f1.i.value), p = f2.i.value.trim();
      return { id: v.ok ? v.id : "", period: p, valid: v.ok && p.length > 0, why: v.ok ? (p ? "" : "period") : v.why };
    }
    function upd(commit) {
      var r = info(); msg.textContent = r.why === "period" ? "Add your class period." : (MSG[r.why] || (r.valid ? "ID accepted." : ""));
      msg.className = "hint mrd-idmsg" + (r.valid ? " ok" : (r.why && r.why !== "empty" ? " bad" : ""));
      if (commit && r.id) f1.i.value = r.id;
      if (r.valid) setMe(r.id, r.period);
      if (o.onChange) o.onChange(r);
    }
    f1.i.addEventListener("input", function () { upd(false); });
    f1.i.addEventListener("blur", function () { upd(true); });
    f2.i.addEventListener("input", function () { upd(false); });
    host.appendChild(wrap); upd(false);
    return { get: info, el: wrap };
  }

  MrD.ids = {
    ALPHABET: AB, checkChar: checkChar, format: format, clean: clean, validate: validate, derive: derive, deriveRoster: deriveRoster,
    decode: decode, parseRoster: parseRoster, randomSecret: randomSecret,
    getSecret: getSecret, setSecret: setSecret, ensureSecret: ensureSecret, getRoster: getRoster, setRoster: setRoster, backup: backup, restore: restore,
    me: me, setMe: setMe, ask: ask
  };
  if (typeof module !== "undefined" && module.exports) module.exports = MrD.ids;
})();
