// Every student action becomes one small JSON event. The log is the grading record and the teacher view.
export class Log {
  constructor() { this.t0 = performance.now(); this.started = new Date().toISOString(); this.events = []; }
  add(type, data = {}) {
    const e = { t: Math.round((performance.now() - this.t0) / 100) / 10, type, ...data };
    this.events.push(e);
    return e;
  }
  count(type, pred = () => true) { return this.events.filter((e) => e.type === type && pred(e)).length; }
}

export function downloadJSON(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
