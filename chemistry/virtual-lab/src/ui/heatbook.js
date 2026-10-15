// The heating-lab notebook: a table the student types into, and a blank graph the student plots on by hand.
// The computer never draws the curve. It only keeps the dots and lines the student places.
import { h } from "./dom.js";

const STATES = ["", "solid", "solid + liquid", "liquid", "liquid + gas", "solid + gas", "gas"];
const M = { l: 66, r: 16, t: 34, b: 56 };
const num = (v) => v !== "" && v != null && Number.isFinite(+v);
export const goodRows = (d) => d.rows.filter((r) => num(r.t) && num(r.T));

export function drawGraph(canvas, d, a, pend, hover) {
  const c = canvas.getContext("2d"), W = canvas.width, H = canvas.height;
  const px = (x, y) => [M.l + (x / a.xmax) * (W - M.l - M.r), H - M.b - ((y - a.ymin) / (a.ymax - a.ymin)) * (H - M.t - M.b)];
  c.fillStyle = "#fff"; c.fillRect(0, 0, W, H); c.lineWidth = 1; c.font = "12px system-ui";
  for (let x = 0; x <= a.xmax + 1e-9; x += a.xs / 5) { const [X] = px(x, a.ymin); c.strokeStyle = Math.abs(x % a.xs) < 1e-6 ? "#b9b9b9" : "#ececec"; c.beginPath(); c.moveTo(X, M.t); c.lineTo(X, H - M.b); c.stroke(); }
  for (let y = a.ymin; y <= a.ymax + 1e-9; y += a.ys / 5) { const [, Y] = px(0, y); c.strokeStyle = Math.abs((y - a.ymin) % a.ys) < 1e-6 ? "#b9b9b9" : "#ececec"; c.beginPath(); c.moveTo(M.l, Y); c.lineTo(W - M.r, Y); c.stroke(); }
  c.fillStyle = "#333"; c.textAlign = "center"; for (let x = 0; x <= a.xmax; x += a.xs) c.fillText(String(x), px(x, a.ymin)[0], H - M.b + 16);
  c.textAlign = "right"; for (let y = a.ymin; y <= a.ymax; y += a.ys) c.fillText(String(y), M.l - 6, px(0, y)[1] + 4);
  c.strokeStyle = "#111"; c.lineWidth = 2; c.strokeRect(M.l, M.t, W - M.l - M.r, H - M.t - M.b);
  c.fillStyle = "#111"; c.textAlign = "center"; c.font = "bold 13px system-ui";
  c.fillText(d.axes.title || "(title)", (W + M.l) / 2, 20); c.fillText(d.axes.x || "(label the x-axis)", (W + M.l) / 2, H - 10);
  c.save(); c.translate(16, (H - M.b + M.t) / 2); c.rotate(-Math.PI / 2); c.fillText(d.axes.y || "(label the y-axis)", 0, 0); c.restore();
  for (const it of d.items) if (it.k === "l") { const [x1, y1] = px(it.x1, it.y1), [x2, y2] = px(it.x2, it.y2); c.strokeStyle = "#1f5fbf"; c.lineWidth = 2; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); }
  for (const it of d.items) if (it.k === "p") { const [X, Y] = px(it.x, it.y); c.fillStyle = "#c62828"; c.beginPath(); c.arc(X, Y, 4.5, 0, 6.3); c.fill(); }
  if (pend) { const [X, Y] = px(pend.x, pend.y); c.strokeStyle = "#1f5fbf"; c.lineWidth = 2; c.beginPath(); c.arc(X, Y, 6, 0, 6.3); c.stroke(); if (hover) { c.setLineDash([5, 4]); c.beginPath(); c.moveTo(X, Y); c.lineTo(...px(hover[0], hover[1])); c.stroke(); c.setLineDash([]); } }
}

// o: { getData() -> {X:{rows,items,axes}, Y:..}, axesFor(k), allowed(), act(type, data), onChange() }
export function createHeatBook(o) {
  let active = Object.keys(o.getData())[0], tool = "p", pend = null, hover = null, clearArm = false;
  const D = () => o.getData()[active], A = () => o.axesFor(active);
  const tabs = h("div", { class: "tabs" }), rowsT = h("table", { id: "rows" }), count = h("span", { class: "hint" });
  const gc = h("canvas", { id: "graph", width: 640, height: 400, "aria-label": "Blank graph. Click to plot points." }), hint = h("p", { class: "hint" });
  const bP = h("button", { class: "on", onclick: () => setTool("p") }, "• Point"), bL = h("button", { onclick: () => setTool("l") }, "╱ Line");
  const inTitle = h("input", { type: "text", placeholder: "Name the graph", oninput: (e) => { D().axes.title = e.target.value; draw(); } }), inX = h("input", { type: "text", placeholder: "label and unit", oninput: (e) => { D().axes.x = e.target.value; draw(); } }), inY = h("input", { type: "text", placeholder: "label and unit", oninput: (e) => { D().axes.y = e.target.value; draw(); } });
  const clearBtn = h("button", { onclick: () => { if (!clearArm) { clearArm = true; clearBtn.textContent = "Really clear?"; setTimeout(() => { clearArm = false; clearBtn.textContent = "Clear graph"; }, 3000); return; } D().items = []; clearArm = false; clearBtn.textContent = "Clear graph"; draw(); o.onChange(); } }, "Clear graph");
  const dataPane = h("div", {}, h("div", { class: "scrollx" }, rowsT), h("div", { class: "controls" }, h("button", { onclick: () => addRow() }, "+ Add row"), h("button", { onclick: () => { D().rows.pop(); renderRows(); } }, "Remove last row"), count),
    h("p", { class: "hint" }, "Type the time and the temperature yourself, and choose what state you see in the beaker and under the microscope. Nothing is filled in for you."));
  const graphPane = h("div", { hidden: true }, gc, h("div", { class: "gtools" }, h("span", { class: "seg" }, bP, bL), h("button", { onclick: () => { D().items.pop(); pend = null; draw(); o.onChange(); } }, "Undo"), clearBtn),
    h("div", { class: "gtools" }, h("label", {}, "Title ", inTitle), h("label", {}, "x-axis ", inX), h("label", {}, "y-axis ", inY)), hint);
  const tData = h("button", { class: "on", onclick: () => pane("data") }, "Data table"), tGraph = h("button", { onclick: () => pane("graph") }, "Graph");
  const el = h("div", {}, tabs, h("div", { class: "tabs" }, tData, tGraph), dataPane, graphPane);

  function renderTabs() { tabs.replaceChildren(...Object.keys(o.getData()).map((k) => h("button", { class: k === active ? "on" : "", onclick: () => select(k) }, "Sample " + k))); }
  function select(k) { active = k; pend = null; refresh(); }
  function pane(n) { dataPane.hidden = n !== "data"; graphPane.hidden = n !== "graph"; tData.classList.toggle("on", n === "data"); tGraph.classList.toggle("on", n === "graph"); if (n === "graph") draw(); }
  function renderRows() {
    const d = D();
    rowsT.replaceChildren(h("thead", {}, h("tr", {}, ["#", "Time (s)", "Temp (°C)", "State"].map((t) => h("th", {}, t)))),
      h("tbody", {}, d.rows.map((r, i) => {
        const sel = h("select", { "aria-label": "State", onchange: (e) => { r.s = e.target.value; } }, STATES.map((s) => h("option", { value: s }, s || "— choose —"))); sel.value = r.s || "";
        const inp = (key, label) => h("input", { type: "number", step: "any", value: r[key] ?? "", "aria-label": label, oninput: (e) => { r[key] = e.target.value; recount(); } });
        return h("tr", {}, h("td", {}, String(i + 1)), h("td", {}, inp("t", "Time in seconds")), h("td", {}, inp("T", "Temperature in degrees Celsius")), h("td", {}, sel));
      })));
    recount();
  }
  function recount() { const n = goodRows(D()).length; count.textContent = `${n} complete row${n === 1 ? "" : "s"} (aim for 12 or more).`; o.onChange(); }
  function addRow(row) { if (!o.allowed()) return; D().rows.push(row || { t: "", T: "", s: "" }); renderRows(); if (!row) { const t = rowsT.querySelector("tbody tr:last-child input"); if (t) t.focus(); o.act("row_added", { sample: active, n: D().rows.length }); } }
  function draw() { drawGraph(gc, D(), A(), pend, hover); }
  const toPx = (a, x, y) => [M.l + (x / a.xmax) * (gc.width - M.l - M.r), gc.height - M.b - ((y - a.ymin) / (a.ymax - a.ymin)) * (gc.height - M.t - M.b)];
  const fromPx = (a, px, py) => { const x = ((px - M.l) / (gc.width - M.l - M.r)) * a.xmax, y = a.ymin + ((gc.height - M.b - py) / (gc.height - M.t - M.b)) * (a.ymax - a.ymin), sx = a.xs / 5, sy = a.ys / 5; return [Math.round(x / sx) * sx, a.ymin + Math.round((y - a.ymin) / sy) * sy]; };
  const mouse = (e) => { const r = gc.getBoundingClientRect(); return [(e.clientX - r.left) * gc.width / r.width, (e.clientY - r.top) * gc.height / r.height]; };
  function setTool(t) { tool = t; pend = null; bP.classList.toggle("on", t === "p"); bL.classList.toggle("on", t === "l"); draw(); }
  gc.addEventListener("mousemove", (e) => { const [x, y] = mouse(e); hover = fromPx(A(), x, y); hint.textContent = `Cursor: ${Math.round(hover[0] * 10) / 10} s, ${Math.round(hover[1] * 10) / 10} °C. ${tool === "p" ? "Click to place a point. Click a point to remove it." : pend ? "Click the other end of the line." : "Click where the line starts."}`; if (pend) draw(); });
  gc.addEventListener("click", (e) => {
    if (!o.allowed()) return; const d = D(), a = A(), [mx, my] = mouse(e);
    if (mx < M.l || mx > gc.width - M.r || my < M.t || my > gc.height - M.b) return;
    const [x, y] = fromPx(a, mx, my);
    if (tool === "p") {
      const hit = d.items.findIndex((it) => { if (it.k !== "p") return false; const [px, py] = toPx(a, it.x, it.y); return Math.hypot(px - mx, py - my) < 8; });
      if (hit >= 0) { d.items.splice(hit, 1); o.act("point_removed", { sample: active }); } else { d.items.push({ k: "p", x, y }); o.act("point", { sample: active, x, y }); }
    } else if (!pend) pend = { x, y };
    else { if (pend.x !== x || pend.y !== y) { d.items.push({ k: "l", x1: pend.x, y1: pend.y, x2: x, y2: y }); o.act("line", { sample: active }); } pend = null; }
    draw(); o.onChange();
  });
  function refresh() { renderTabs(); renderRows(); const a = D().axes; inTitle.value = a.title; inX.value = a.x; inY.value = a.y; if (!graphPane.hidden) draw(); }
  refresh();
  return { el, refresh, pane, setTool, select, addRow, draw, current: () => active, addPoint(x, y) { D().items.push({ k: "p", x, y }); draw(); o.onChange(); }, addLine(l) { D().items.push({ k: "l", ...l }); draw(); o.onChange(); }, setAxes(a) { Object.assign(D().axes, a); refresh(); } };
}
