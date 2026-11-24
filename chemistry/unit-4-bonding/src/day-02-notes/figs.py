import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Circle, FancyArrowPatch
import math

BLUE = "#1971c2"; RED = "#c00000"; GREEN = "#2f9e44"

# ---- octet.png: Ne, Na, Cl shells. Same picture on both sheets; the key adds red labels. ----
def bohr(ax, cx, cy, shells, sym, z):
    for k, n in enumerate(shells, start=1):
        r = 0.42 * k
        ax.add_patch(Circle((cx, cy), r, fill=False, ec=BLUE, lw=1.2))
        for i in range(n):
            a = math.pi / 2 + 2 * math.pi * i / n
            ax.add_patch(Circle((cx + r * math.cos(a), cy + r * math.sin(a)), 0.065, fc="black", ec="none"))
    ax.add_patch(Circle((cx, cy), 0.2, fc="#ffe3e3", ec=RED, lw=1))
    ax.text(cx, cy, "+%d" % z, ha="center", va="center", fontsize=6.5, color=RED)
    ax.text(cx, cy - 0.42 * len(shells) - 0.34, sym, ha="center", va="center", fontsize=10, weight="bold")

def octet(key, name):
    fig, ax = plt.subplots(figsize=(6.0, 2.15), dpi=200)
    bohr(ax, 1.4, 0, [2, 8], "Ne", 10)
    bohr(ax, 4.7, 0, [2, 8, 1], "Na", 11)
    bohr(ax, 8.0, 0, [2, 8, 7], "Cl", 17)
    if key:
        for x, t in [(1.4, "outer level full:\nno bond"), (4.7, "loses 1 electron"), (8.0, "gains 1 electron")]:
            ax.text(x, -1.95, t, ha="center", va="center", fontsize=8, color=RED, weight="bold", linespacing=1.1)
    ax.set_xlim(-0.2, 9.6); ax.set_ylim(-2.45, 1.45); ax.set_aspect("equal"); ax.axis("off")
    fig.tight_layout(pad=0.2); fig.savefig(name); plt.close(fig)

# ---- lewis: one row, period 2, dots drawn on the key only ----
ROW = [("Li", "1", 1), ("Be", "2", 2), ("B", "13", 3), ("C", "14", 4), ("N", "15", 5), ("O", "16", 6), ("F", "17", 7), ("Ne", "18", 8)]
# the unit's convention (same as the test): one dot on each side (top, right, bottom, left), then pair up starting at the top
def sides(n):
    c = {"t": 0, "r": 0, "b": 0, "l": 0}
    order = ["t", "r", "b", "l"]
    for i in range(min(n, 4)): c[order[i]] += 1
    for i in range(max(n - 4, 0)): c[order[i]] += 1
    return c

def lewis(key, name):
    fig, ax = plt.subplots(figsize=(6.4, 1.25), dpi=200)
    for i, (s, g, n) in enumerate(ROW):
        x = i * 1.0
        ax.add_patch(Rectangle((x + 0.03, 0), 0.94, 0.94, fill=False, lw=0.8, ec="#555"))
        ax.text(x + 0.5, 1.12, g if i else "Group 1", ha="center", va="center", fontsize=9, color="#555")
        cx, cy = x + 0.5, 0.47
        ax.text(cx, cy, s, ha="center", va="center", fontsize=13)
        if key:
            c = sides(n)
            off = {"t": (0, 0.31), "r": (0.3, 0), "b": (0, -0.31), "l": (-0.3, 0)}
            for side, k in c.items():
                dx, dy = off[side]
                for j in range(k):
                    sh = 0 if k == 1 else (-0.065 if j == 0 else 0.065)
                    px, py = (cx + dx + sh, cy + dy) if side in "tb" else (cx + dx, cy + dy + sh)
                    ax.add_patch(Circle((px, py), 0.04, fc="#c00000", ec="none"))
    ax.set_xlim(0, 8); ax.set_ylim(-0.05, 1.3); ax.set_aspect("equal"); ax.axis("off")
    fig.tight_layout(pad=0.1); fig.savefig(name); plt.close(fig)

octet(False, "octet_blank.png")
octet(True, "octet.png")
lewis(False, "lewis_blank.png")
lewis(True, "lewis.png")
