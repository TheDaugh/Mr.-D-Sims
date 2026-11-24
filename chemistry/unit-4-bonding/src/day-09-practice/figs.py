import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Circle, FancyArrowPatch

RED = "#c00000"; BLUE = "#1971c2"; PUR = "#7048e8"
# the unit's dot rule (same as the test): one dot on each side (top, right, bottom, left), then pair up starting at the top
def sides(n):
    c = {"t": 0, "r": 0, "b": 0, "l": 0}; order = ["t", "r", "b", "l"]
    for i in range(min(n, 4)): c[order[i]] += 1
    for i in range(max(n - 4, 0)): c[order[i]] += 1
    return c
OFF = {"t": (0, 0.4), "r": (0.38, 0), "b": (0, -0.4), "l": (-0.38, 0)}
def dots(ax, cx, cy, n, color="black", skip=0):
    c = sides(n)
    for side, k in c.items():
        dx, dy = OFF[side]
        for j in range(k):
            sh = 0 if k == 1 else (-0.08 if j == 0 else 0.08)
            px, py = (cx + dx + sh, cy + dy) if side in "tb" else (cx + dx, cy + dy + sh)
            ax.add_patch(Circle((px, py), 0.05, fc=color, ec="none"))
def sym(ax, cx, cy, s, color="black"): ax.text(cx, cy, s, ha="center", va="center", fontsize=15, color=color)
def bracket(ax, cx, cy, w=0.62, color="black"):
    for sgn in (-1, 1):
        x = cx + sgn * w
        ax.plot([x, x], [cy - 0.62, cy + 0.62], color=color, lw=1.2)
        ax.plot([x, x - sgn * 0.14], [cy + 0.62, cy + 0.62], color=color, lw=1.2)
        ax.plot([x, x - sgn * 0.14], [cy - 0.62, cy - 0.62], color=color, lw=1.2)


D = 1.15
DIR = {"t": (0, 1), "r": (1, 0), "b": (0, -1), "l": (-1, 0)}
def pair_at(ax, x, y, vert, color="black"):
    # two dots; vert=True means the pair is stacked left/right of the point (for top/bottom sides), else stacked up/down
    for sg in (-1, 1):
        px, py = (x + sg * 0.08, y) if vert else (x, y + sg * 0.08)
        ax.add_patch(Circle((px, py), 0.052, fc=color, ec="none"))
def mol(ax, cx, cy, center, partners, lone, shared_color="black"):
    """partners: list of (symbol, side). lone: list of sides that carry a lone pair on the centre atom."""
    sym(ax, cx, cy, center)
    for p, side in partners:
        dx, dy = DIR[side]
        sym(ax, cx + dx * D, cy + dy * D, p)
        pair_at(ax, cx + dx * D / 2, cy + dy * D / 2, dx == 0, shared_color)
    for side in lone:
        dx, dy = DIR[side]
        pair_at(ax, cx + dx * 0.42, cy + dy * 0.42, dx == 0)
def lone_pairs(ax, cx, cy, sides):
    for side in sides:
        dx, dy = DIR[side]; pair_at(ax, cx + dx * 0.42, cy + dy * 0.42, dx == 0)
def box(ax, x, y, w, h): ax.add_patch(plt.Rectangle((x, y), w, h, fc="none", ec="black", lw=1.0))

def bond_lines(ax, x1, x2, y, n):
    off = {1: [0], 2: [-0.09, 0.09], 3: [-0.14, 0, 0.14]}[n]
    for o in off: ax.plot([x1, x2], [y + o, y + o], color="black", lw=1.2)


def four(key, name):
    f, ax = plt.subplots(figsize=(6.4, 2.3), dpi=200)
    for i in range(4): box(ax, i * 3.1, -1.5, 2.9, 3.0)
    if key:
        mol(ax, 1.45, 0, "F", [("H", "l")], ["t", "b", "r"], PUR)
        mol(ax, 4.55, 0, "S", [("H", "l"), ("H", "r")], ["t", "b"], PUR)
        mol(ax, 7.65, 0.25, "P", [("H", "l"), ("H", "r"), ("H", "b")], ["t"], PUR)
        mol(ax, 10.75, 0, "Si", [("H", "l"), ("H", "r"), ("H", "t"), ("H", "b")], [], PUR)
    ax.set_xlim(-0.1, 12.4); ax.set_ylim(-1.6, 1.6); ax.set_aspect("equal"); ax.axis("off")
    f.tight_layout(pad=0.1); f.savefig(name); plt.close(f)
def shown(name):
    f, ax = plt.subplots(figsize=(6.4, 1.7), dpi=200)
    # F2
    sym(ax, 0.6, 0, "F"); sym(ax, 1.9, 0, "F"); bond_lines(ax, 0.85, 1.65, 0, 1)
    lone_pairs(ax, 0.6, 0, ["t", "b", "l"]); lone_pairs(ax, 1.9, 0, ["t", "b", "r"])
    # CS2
    sym(ax, 4.0, 0, "S"); sym(ax, 5.3, 0, "C"); sym(ax, 6.6, 0, "S")
    bond_lines(ax, 4.25, 5.05, 0, 2); bond_lines(ax, 5.55, 6.35, 0, 2)
    lone_pairs(ax, 4.0, 0, ["t", "b"]); lone_pairs(ax, 6.6, 0, ["t", "b"])
    # HCN
    sym(ax, 8.5, 0, "H"); sym(ax, 9.8, 0, "C"); sym(ax, 11.1, 0, "N")
    bond_lines(ax, 8.75, 9.55, 0, 1); bond_lines(ax, 10.05, 10.85, 0, 3)
    lone_pairs(ax, 11.1, 0, ["r"])
    ax.text(1.25, -1.0, "A", ha="center", fontsize=11); ax.text(5.3, -1.0, "B", ha="center", fontsize=11); ax.text(9.8, -1.0, "C", ha="center", fontsize=11)
    ax.set_xlim(-0.3, 12.0); ax.set_ylim(-1.3, 0.9); ax.set_aspect("equal"); ax.axis("off")
    f.tight_layout(pad=0.1); f.savefig(name); plt.close(f)
four(False, "four_blank.png"); four(True, "four.png"); shown("shown.png")
