// Achievement badge drawn in code. Gold ring when the challenge sample is done.
export function drawBadge(cv, { title, student, gold, minutes, code, date }) {
  const g = cv.getContext("2d"), W = cv.width, H = cv.height, cx = W / 2, cy = H * 0.42, R = Math.min(W, H) * 0.34;
  g.clearRect(0, 0, W, H);
  const ring = gold ? ["#fff2a8", "#d4a017", "#8a6500"] : ["#e6c9a8", "#b87333", "#6e4010"];
  const gr = g.createLinearGradient(cx - R, cy - R, cx + R, cy + R); gr.addColorStop(0, ring[0]); gr.addColorStop(0.5, ring[1]); gr.addColorStop(1, ring[2]);
  g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
  g.fillStyle = "#12304a"; g.beginPath(); g.arc(cx, cy, R * 0.82, 0, 7); g.fill();
  // flask
  g.fillStyle = "#cfe8ff"; g.beginPath(); g.moveTo(cx - R * 0.12, cy - R * 0.5); g.lineTo(cx + R * 0.12, cy - R * 0.5); g.lineTo(cx + R * 0.12, cy - R * 0.15); g.lineTo(cx + R * 0.45, cy + R * 0.45); g.lineTo(cx - R * 0.45, cy + R * 0.45); g.lineTo(cx - R * 0.12, cy - R * 0.15); g.closePath(); g.fill();
  g.fillStyle = gold ? "#ffd84a" : "#6fd3a0"; g.beginPath(); g.moveTo(cx - R * 0.3, cy + R * 0.08); g.lineTo(cx + R * 0.3, cy + R * 0.08); g.lineTo(cx + R * 0.45, cy + R * 0.45); g.lineTo(cx - R * 0.45, cy + R * 0.45); g.closePath(); g.fill();
  if (gold) { g.fillStyle = "#fff"; star(g, cx, cy - R * 0.68, R * 0.14); }
  g.textAlign = "center"; g.fillStyle = "#111";
  g.font = `bold ${Math.round(H * 0.06)}px system-ui,sans-serif`; g.fillText(gold ? "CHALLENGE COMPLETE" : "LAB COMPLETE", cx, H * 0.82);
  g.font = `${Math.round(H * 0.048)}px system-ui,sans-serif`; g.fillText(title, cx, H * 0.88);
  g.fillText(`${student || "Student"} · ${minutes} active min · ${date}`, cx, H * 0.935);
  g.font = `${Math.round(H * 0.04)}px ui-monospace,monospace`; g.fillText(code, cx, H * 0.985);
}
function star(g, x, y, r) { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); }
