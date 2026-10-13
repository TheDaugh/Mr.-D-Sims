export const $ = (s, r = document) => r.querySelector(s);
export function h(tag, props = {}, ...kids) {
  const e = document.createElement(tag);
  for (const k in props) {
    if (k === "class") e.className = props[k];
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), props[k]);
    else if (props[k] !== false && props[k] != null) e.setAttribute(k, props[k] === true ? "" : props[k]);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) e.append(kid.nodeType ? kid : document.createTextNode(kid));
  return e;
}
export function mulberry32(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export const wordCount = (s) => (String(s).trim().match(/\S+/g) || []).length;
