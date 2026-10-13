// Turns a lab record (what a student actually did) into a report. Pure data, used by the sim and teacher.html.
export function gradeNotebook(unknowns, notebook, truth) {
  const cells = []; let identified = 0, wrong = 0;
  for (const u of unknowns) {
    const row = notebook[u.label] || {};
    for (const test of Object.keys(row)) {
      const answer = row[test]; if (!answer) continue;
      const correct = test === "id" ? u.id : truth[u.id][test], ok = answer === correct;
      if (test === "id" && ok) identified++;
      if (!ok) wrong++;
      cells.push({ unknown: u.label, test, answer, correct, ok });
    }
  }
  return { cells, identified, wrong, filled: cells.length, total: unknowns.length };
}

export function buildReport(record, truth, hazards = {}) {
  const ev = record.events || [], by = (t) => ev.filter((e) => e.type === t);
  const ppe = { goggles: false, apron: false, tongs: false };
  let atFirstAdd = null;
  for (const e of ev) {
    if (e.type === "ppe") ppe[e.item] = e.on;
    if (e.type === "add" && !atFirstAdd) atFirstAdd = { ...ppe };
  }
  const hz = by("hazard"), incidents = by("incident");
  const didAdd = (id) => by("add").some((e) => e.substance === id);
  const door = by("door")[0];
  const setup = [
    { label: "Goggles on before handling any chemical", ok: atFirstAdd ? atFirstAdd.goggles : null },
    { label: "Apron on before handling any chemical", ok: atFirstAdd ? atFirstAdd.apron : null },
    { label: "Entered the lab with goggles and apron", ok: door ? door.outcome === "entered" : null },
    { label: "No hot-glass mistakes (tongs used)", ok: !hz.some((e) => e.id === "hot_container") },
    { label: "Weighed solids on the balance", ok: !by("procedure").some((e) => e.id === "solid_off_balance") },
    { label: "No containers overflowed", ok: !hz.some((e) => e.id === "overflow") },
    { label: "No safety incidents", ok: incidents.length === 0 }
  ];
  const tests = [
    { label: "Solubility in water", done: didAdd("water") },
    { label: "Conductivity", done: by("conductivity").length > 0 },
    { label: "Reaction with vinegar", done: didAdd("vinegar") },
    { label: "Iodine test", done: didAdd("iodine") },
    { label: "Heating", done: by("hotplate").some((e) => e.on) }
  ];
  return {
    student: record.student || "(no name)", mode: record.mode || "guided", started: record.started, seed: record.seed,
    seconds: ev.length ? Math.round(ev[ev.length - 1].t) : 0,
    grade: gradeNotebook(record.unknowns, record.notebook || {}, truth),
    setup, tests,
    incidents: incidents.map((e) => ({ id: e.id, title: (hazards[e.id] || {}).title || e.id, why: (hazards[e.id] || {}).why || "", treated: e.treated, escalated: e.escalated, quizCorrect: e.quiz_correct, pointsLost: e.points_lost })),
    blocked: { hazards: hz.filter((e) => e.outcome === "blocked").length, procedures: by("procedure").length },
    points: record.safety ? record.safety.points : null,
    scouted: by("visit").map((e) => e.object)
  };
}
