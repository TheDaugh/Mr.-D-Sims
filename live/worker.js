// Live view worker for Mr. D's Sims (Cloudflare Workers, free plan).
// Students' pages POST a small progress heartbeat to /beat. The teacher dashboard GETs /class.
// Heartbeats are held in the memory of one Durable Object per class-day, never written to disk, and are
// dropped after 10 minutes without a beat. Nothing here stores a name beyond the first name and period the student typed.
//
// Secrets and variables (Workers dashboard, or `wrangler secret put TEACHER_TOKEN`):
//   TEACHER_TOKEN   a long random string. The teacher dashboard sends it; students never have it.
//   ALLOW_ORIGIN    your site, e.g. https://thedaugh.github.io  (CORS)

export class Room {
  constructor(state, env) { this.beats = new Map(); }
  async fetch(req) {
    const url = new URL(req.url);
    const now = Date.now();
    for (const [k, v] of this.beats) if (now - v.at > 600000) this.beats.delete(k);
    if (url.pathname === "/beat") {
      const b = await req.json();
      const id = (String(b.first || "").toLowerCase() + "|" + String(b.period || "")).slice(0, 40);
      this.beats.set(id, { ...b, at: now });
      return new Response("ok");
    }
    if (url.pathname === "/class") {
      return Response.json([...this.beats.values()].sort((a, b) => (a.period + a.first).localeCompare(b.period + b.first)));
    }
    return new Response("not found", { status: 404 });
  }
}

const SAFE = /^[a-z0-9._-]{1,60}$/i;
export default {
  async fetch(req, env) {
    const cors = {
      "access-control-allow-origin": env.ALLOW_ORIGIN || "*",
      "access-control-allow-headers": "content-type, x-teacher",
      "access-control-allow-methods": "GET, POST, OPTIONS"
    };
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    const url = new URL(req.url);
    let room, path = url.pathname;

    if (path === "/beat" && req.method === "POST") {
      const text = await req.text();
      if (text.length > 2000) return new Response("too big", { status: 413, headers: cors });
      let b; try { b = JSON.parse(text); } catch (e) { return new Response("bad json", { status: 400, headers: cors }); }
      if (!SAFE.test(b.course || "") || !SAFE.test(b.lesson || "") || !SAFE.test(b.day || "")) return new Response("bad", { status: 400, headers: cors });
      room = env.ROOM.get(env.ROOM.idFromName(b.course + "|" + b.lesson + "|" + b.day));
      const r = await room.fetch("https://room/beat", { method: "POST", body: text });
      return new Response(await r.text(), { headers: cors });
    }

    if (path === "/class" && req.method === "GET") {
      if (!env.TEACHER_TOKEN || req.headers.get("x-teacher") !== env.TEACHER_TOKEN) return new Response("no", { status: 401, headers: cors });
      const c = url.searchParams.get("course"), l = url.searchParams.get("lesson"), d = url.searchParams.get("day");
      if (!SAFE.test(c || "") || !SAFE.test(l || "") || !SAFE.test(d || "")) return new Response("bad", { status: 400, headers: cors });
      room = env.ROOM.get(env.ROOM.idFromName(c + "|" + l + "|" + d));
      const r = await room.fetch("https://room/class");
      return new Response(await r.text(), { headers: { ...cors, "content-type": "application/json" } });
    }
    return new Response("Mr. D live view", { headers: cors });
  }
};
