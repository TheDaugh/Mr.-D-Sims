// Mode comes from the assignment link. Guided is the default. A stronger mode needs a signature the
// teacher generated from a secret code; the page only stores a hash of that signature, so students
// cannot forge the link for a mode they were not assigned.
export async function sha256Hex(s) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
export const makeSig = (code, mode) => sha256Hex(`${code}:${mode}`);
export async function resolveMode(params, config) {
  const mode = params.get("mode") || "guided";
  if (mode === "guided") return { mode };
  const verifier = config && config.modeVerifiers && config.modeVerifiers[mode];
  if (verifier && (await sha256Hex(params.get("sig") || "")) === verifier) return { mode };
  return { mode: "guided", rejected: mode };
}
