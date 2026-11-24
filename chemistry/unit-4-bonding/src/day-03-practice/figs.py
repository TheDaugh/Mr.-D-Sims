import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Circle

RED = "#c00000"
# the unit's convention (same as the test and day 2): one dot on each side (top, right, bottom, left), then pair up starting at the top
def sides(n):
    c = {"t": 0, "r": 0, "b": 0, "l": 0}
    order = ["t", "r", "b", "l"]
    for i in range(min(n, 4)): c[order[i]] += 1
    for i in range(max(n - 4, 0)): c[order[i]] += 1
    return c

OFF = {"t": (0, 0.31), "r": (0.3, 0), "b": (0, -0.31), "l": (-0.3, 0)}
def dots(ax, cx, cy, c, color=RED):
    for side, k in c.items():
        dx, dy = OFF[side]
        for j in range(k):
            sh = 0 if k == 1 else (-0.065 if j == 0 else 0.065)
            px, py = (cx + dx + sh, cy + dy) if side in "tb" else (cx + dx, cy + dy + sh)
            ax.add_patch(Circle((px, py), 0.04, fc=color, ec="none"))

def row(items, key, name, w=6.6, h=1.45):
    fig, ax = plt.subplots(figsize=(w, h), dpi=200)
    n = len(items)
    for i, (s, v) in enumerate(items):
        x = i * 1.2
        ax.add_patch(Rectangle((x + 0.03, 0), 1.14, 1.14, fill=False, lw=0.8, ec="#555"))
        cx, cy = x + 0.6, 0.57
        ax.text(cx, cy, s, ha="center", va="center", fontsize=14)
        if key: dots(ax, cx, cy, sides(v))
    ax.set_xlim(0, 1.2 * n); ax.set_ylim(-0.03, 1.18); ax.set_aspect("equal"); ax.axis("off")
    fig.tight_layout(pad=0.1); fig.savefig(name); plt.close(fig)

# item 8: the six atoms students draw (same boxes on the sheet and the key; the key adds the dots)
SIX = [("K", 1), ("Mg", 2), ("Si", 4), ("S", 6), ("Cl", 7), ("Ar", 8)]
row(SIX, False, "draw_blank.png"); row(SIX, True, "draw_key.png")

# item 5: two students' drawings, each wrong (as drawn, in black), and the key's corrections
def errors(name, key):
    fig, ax = plt.subplots(figsize=(4.6, 1.5), dpi=200)
    cases = [("N", {"t": 2, "r": 2, "b": 1, "l": 0}, 5), ("Mg", {"t": 2, "r": 0, "b": 0, "l": 0}, 2)]
    for i, (s, c, v) in enumerate(cases):
        x = i * 2.6
        ax.text(x + 0.6, 1.4, "Student " + "AB"[i], ha="center", va="center", fontsize=9)
        ax.add_patch(Rectangle((x + 0.03, 0), 1.14, 1.14, fill=False, lw=0.8, ec="#555"))
        cx, cy = x + 0.6, 0.57
        ax.text(cx, cy, s, ha="center", va="center", fontsize=14)
        dots(ax, cx, cy, c, color="black")
        ax.add_patch(Rectangle((x + 1.35, 0), 1.14, 1.14, fill=False, lw=0.8, ec=RED if key else "#555"))
        cx2 = x + 1.35 + 0.57
        if key:
            ax.text(cx2, cy, s, ha="center", va="center", fontsize=14, color=RED)
            dots(ax, cx2, cy, sides(v))
    ax.set_xlim(-0.05, 5.3); ax.set_ylim(-0.05, 1.7); ax.set_aspect("equal"); ax.axis("off")
    fig.tight_layout(pad=0.1); fig.savefig(name); plt.close(fig)
errors("err_blank.png", False); errors("err_key.png", True)

# item 11: an unknown atom X with 7 valence electrons (key only)
row([("X", 7)], True, "x7_key.png", w=1.4, h=1.4)

# blank boxes: item 11 (X), item 12 (empty), exit slip (As)
row([("X", 7)], False, "x_blank.png", w=1.4, h=1.4)
row([("", 0)], False, "empty_box.png", w=1.4, h=1.4)
row([("As", 5)], False, "as_blank.png", w=1.4, h=1.4)
row([("As", 5)], True, "as_key.png", w=1.4, h=1.4)
