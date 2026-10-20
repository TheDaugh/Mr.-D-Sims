/* lessoncore.js: small helpers shared by guided lessons.
   LC.forLesson('lesson-id') returns { today, hashStr, codeFor(kind), encodeHandIn(name, nums), decodeHandIn(name, code), CODE_FIELDS }.
   The class code is a four-digit hash of lesson id, kind and today's date, so it changes daily with no server. */
(function (root) {
  'use strict';
  function hashStr(s) { var x = 5381; for (var i = 0; i < s.length; i++) x = ((x * 33) + s.charCodeAt(i)) % 1000000; return String(x % 10000).padStart(4, '0'); }
  function today() { return new Date().toLocaleDateString('en-CA'); }
  var CODE_FIELDS = ['version', 'start level', 'peak level', 'warm-up misses (bitmask)', 'check items right (of 4)', 'concept item right', 'check attempts',
    'assisted items', 'hints used', 'active minutes', 'flags (1 solo huddle, 2 needs conference)', 'clean items', 'items answered'];
  function codeChk(name, payload) {
    var s = String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '') + '|' + payload, h = 7;
    for (var i = 0; i < s.length; i++) h = (h * 131 + s.charCodeAt(i)) % 46656;
    return h.toString(36).toUpperCase().padStart(3, '0');
  }
  function forLesson(id, prefix) {
    prefix = prefix || 'PR2';
    return {
      LESSON: id, hashStr: hashStr, today: today, CODE_FIELDS: CODE_FIELDS,
      codeFor: function (kind) { return hashStr(id + '|' + kind + '|' + today()); },
      codeForDate: function (kind, date) { return hashStr(id + '|' + kind + '|' + date); },
      encodeHandIn: function (name, nums) {
        var payload = nums.map(function (n) { return Math.max(0, Math.round(n)).toString(36); }).join('.').toUpperCase();
        return prefix + '-' + payload + '-' + codeChk(name, payload);
      },
      decodeHandIn: function (name, code) {
        var m = new RegExp('^' + prefix + '-([0-9A-Z.]+)-([0-9A-Z]{3})$').exec(String(code || '').trim().toUpperCase());
        if (!m) return { ok: false, why: 'That is not a ' + prefix + ' code.' };
        if (codeChk(name, m[1]) !== m[2]) return { ok: false, why: 'The checksum does not match that name. Check the spelling, or the code was edited.' };
        var nums = m[1].split('.').map(function (t) { return parseInt(t, 36); });
        return { ok: true, nums: nums, rows: CODE_FIELDS.map(function (l, i) { return [l, nums[i]]; }) };
      }
    };
  }
  root.LC = { forLesson: forLesson, hashStr: hashStr, today: today };
})(typeof window !== 'undefined' ? window : globalThis);
