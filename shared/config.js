/* Site-wide settings. Edit this one file.
   liveUrl: address of your live-view worker (see live/README.md). Leave empty to switch live view off.
   pinHash: the teacher PIN, stored only as a hash. The default PIN is  mrd-sub  .
            To change it: open teacher/index.html, unlock, use "Change PIN", paste the new hash here.
   Teacher pages, #key views and codes stay hidden until this PIN is typed on that device.
   This is a deterrent for a static site, not a vault: the page source is public. Real enforcement
   (who can reach your files) needs a login your school controls. */
window.MrD = window.MrD || {};
window.MrD.config = { liveUrl: "", pinHash: "dfc28c9c" };

/* MrD.access: teacher unlock for this device. */
(function () {
  var MrD = window.MrD, KEY = "mrd.teacher.v1";
  function h(s) { var x = 2166136261; s = "mrd|" + String(s).trim().toLowerCase(); for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; } return x.toString(16).padStart(8, "0"); }
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  var A = MrD.access = {
    hash: h,
    unlocked: function () { return get() === MrD.config.pinHash; },
    unlock: function (pin) { if (h(pin) !== MrD.config.pinHash) return false; try { localStorage.setItem(KEY, MrD.config.pinHash); } catch (e) {} A.mark(); return true; },
    lock: function () { try { localStorage.removeItem(KEY); } catch (e) {} A.mark(); },
    mark: function () { document.documentElement.classList.toggle("teacher", A.unlocked()); },
    /* Cover a teacher-only page with a PIN box until unlocked. Call from a script in the page head. */
    guard: function () {
      A.mark();
      var m = /[#&]pin=([^&]+)/.exec(location.hash || "");           // optional sub link: page#pin=...
      if (m && A.unlock(decodeURIComponent(m[1]))) { try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {} }
      if (A.unlocked()) return;
      document.documentElement.style.visibility = "hidden";
      function cover() {
        Array.prototype.slice.call(document.body.children).forEach(function (n) { n.remove(); });
        var d = document.createElement("div");
        d.style.cssText = "position:fixed;inset:0;background:#0f172a;color:#e2e8f0;display:grid;place-items:center;font:16px system-ui,sans-serif;z-index:99999";
        d.innerHTML = '<form style="max-width:320px;padding:24px;text-align:center"><h1 style="font-size:22px;margin:0 0 6px">Teacher page</h1><p style="margin:0 0 14px;color:#94a3b8">Enter the teacher PIN.</p><input type="password" autocomplete="off" style="width:100%;box-sizing:border-box;padding:10px;font-size:18px;border-radius:8px;border:1px solid #475569;background:#1e293b;color:#fff"><button style="margin-top:12px;padding:10px 18px;font-size:16px;border-radius:8px;border:0;background:#38bdf8;color:#082f49;font-weight:700">Unlock</button><p class="e" style="color:#fca5a5;min-height:1.2em"></p></form>';
        document.body.appendChild(d); document.documentElement.style.visibility = "";
        d.querySelector("form").onsubmit = function (ev) { ev.preventDefault(); if (A.unlock(d.querySelector("input").value)) location.reload(); else d.querySelector(".e").textContent = "That is not the PIN."; };
        d.querySelector("input").focus();
      }
      if (document.body) cover(); else document.addEventListener("DOMContentLoaded", cover, { once: true });
    }
  };
  A.mark();
  var st = document.createElement("style"); st.textContent = ".tonly{display:none!important}html.teacher .tonly{display:revert!important}"; document.head.appendChild(st);
})();
