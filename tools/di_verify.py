#!/usr/bin/env python3
"""Deterministic release checks for one direct-instruction day.

Use from the day generator:
    from di_verify import verify, close
    verify(spec, student_files=["notes.pdf", "sheet.pdf"], slips=("slips.pdf", 18))
or from the shell:
    python3 -I di_verify.py spec.json --student notes.pdf sheet.pdf --slips slips.pdf 18

spec keys (all optional except period/blocks):
  period: int minutes            blocks: {name: minutes}
  big_question: str              chunks: int
  live_questions: int            core_items: int      keepers: int
  practice_minutes: int          shared_notes / shared_script: [str, ...]
Exit code 0 = pass; prints every failure, then exits 1.
"""
import json, re, subprocess, sys, shutil, math

TEACHER_NAMES = re.compile(r"\b(Mr\.?\s*D(augherty)?|Ian|Daugherty)\b")
STAGE_DIRECTIONS = re.compile(
    r"\((no talking|in your notebook|silent|individually|work alone|pens down)\)"
    r"|\bCHECK\b|\bwhiteboards?\s+box", re.I)
PLACEHOLDER = re.compile(r"@@\w+@@")


def close(a, b, tol=1e-6):
    """Assert two independently computed answers agree (recompute two ways)."""
    assert math.isclose(a, b, rel_tol=tol, abs_tol=tol), f"{a} != {b}"
    return a


def _norm(s):
    return re.sub(r"\s+", " ", s).strip()


def _pdf_text(path):
    if not shutil.which("pdftotext"):
        return None
    return subprocess.run(["pdftotext", path, "-"], capture_output=True, text=True).stdout


def _pdf_pages(path):
    out = subprocess.run(["pdfinfo", path], capture_output=True, text=True).stdout
    m = re.search(r"Pages:\s+(\d+)", out)
    return int(m.group(1)) if m else None


def verify(spec, student_files=(), slips=None):
    errs = []

    # 1 clock
    blocks = spec.get("blocks")
    if blocks and sum(blocks.values()) != spec["period"]:
        errs.append(f"clock: blocks total {sum(blocks.values())}, period is {spec['period']}")

    # 2 content budget
    caps = [("chunks", 2), ("live_questions", 3), ("keepers", 9)]
    for key, cap in caps:
        if key in spec and spec[key] > cap:
            errs.append(f"budget: {key} = {spec[key]}, max {cap}")
    pm = spec.get("practice_minutes", 15)
    if "core_items" in spec and spec["core_items"] > pm * 8 / 15:
        errs.append(f"budget: {spec['core_items']} core items will not fit {pm} min of practice")

    # 3 big question
    q = spec.get("big_question")
    if q:
        if len(q.split()) > 14:
            errs.append(f"big question is {len(q.split())} words (aim for 12 or fewer)")
        if re.search(r"\b(you|your|I)\b", q, re.I):
            errs.append("big question addresses the student")
        if not q.strip().endswith("?"):
            errs.append("big question is not a question")
        if re.search(r"\band\b", q, re.I):
            print("WARN big question has an 'and': check it is not two days")

    # 4 notes and script share text word for word
    a, b = spec.get("shared_notes"), spec.get("shared_script")
    if a is not None and b is not None:
        if len(a) != len(b):
            errs.append(f"shared text: notes has {len(a)} rows, script has {len(b)}")
        for i, (x, y) in enumerate(zip(a, b)):
            if _norm(x) != _norm(y):
                errs.append(f"shared text row {i} differs between notes and script")

    # 5 built student-facing files
    for f in student_files:
        text = _pdf_text(f) if f.endswith(".pdf") else open(f, encoding="utf-8").read()
        if text is None:
            errs.append(f"{f}: pdftotext not available, file not checked")
            continue
        for pat, label in [(PLACEHOLDER, "unresolved @@placeholder@@"),
                           (TEACHER_NAMES, "teacher named on student material"),
                           (STAGE_DIRECTIONS, "stage direction on student material")]:
            hit = pat.search(text)
            if hit:
                errs.append(f"{f}: {label}: {hit.group(0)!r}")

    # 6 exit slips: six per page
    if slips:
        path, count = slips
        pages = _pdf_pages(path)
        if pages is not None and pages != math.ceil(count / 6):
            errs.append(f"{path}: {pages} pages for {count} slips (expected {math.ceil(count/6)})")

    if errs:
        print("\n".join("FAIL " + e for e in errs))
        raise SystemExit(1)
    print("di_verify: all checks passed")


if __name__ == "__main__":
    args = sys.argv[1:]
    spec = json.load(open(args[0]))
    stu, slips = [], None
    if "--student" in args:
        i = args.index("--student") + 1
        while i < len(args) and not args[i].startswith("--"):
            stu.append(args[i]); i += 1
    if "--slips" in args:
        i = args.index("--slips"); slips = (args[i + 1], int(args[i + 2]))
    verify(spec, stu, slips)
