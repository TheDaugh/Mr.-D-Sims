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

def fig_share(key, name):
    f, ax = plt.subplots(figsize=(6.0, 2.9), dpi=200)
    # row 1: H2 worked (always shown)
    y = 0
    sym(ax, 0.6, y, "H"); dots(ax, 0.6, y, 1)
    ax.text(1.75, y, "+", ha="center", va="center", fontsize=15)
    sym(ax, 2.9, y, "H"); dots(ax, 2.9, y, 1)
    ax.add_patch(FancyArrowPatch((3.8, y), (4.7, y), arrowstyle="-|>", mutation_scale=14, lw=1.6, color="black"))
    sym(ax, 6.0, y, "H"); sym(ax, 7.2, y, "H"); pair_at(ax, 6.6, y, True, PUR)
    # row 2: HCl
    y = -1.9
    sym(ax, 0.6, y, "H"); dots(ax, 0.6, y, 1)
    ax.text(1.75, y, "+", ha="center", va="center", fontsize=15)
    sym(ax, 2.9, y, "Cl"); dots(ax, 2.9, y, 7)
    ax.add_patch(FancyArrowPatch((3.9, y), (4.8, y), arrowstyle="-|>", mutation_scale=14, lw=1.6, color="black"))
    box(ax, 5.4, y - 0.8, 4.0, 1.6)
    if key:
        sym(ax, 6.6, y, "H"); sym(ax, 7.85, y, "Cl"); pair_at(ax, 7.2, y, True, PUR)
        lone_pairs(ax, 7.85, y, ["t", "b", "r"])
        for t, (lx, ly) in {"shared pair": (7.0, y - 1.15), "lone pairs": (8.9, y - 1.15)}.items():
            ax.text(lx, ly, t, ha="center", fontsize=8, color=RED, weight="bold")
    ax.set_xlim(-0.2, 9.6); ax.set_ylim(-3.05, 1.0); ax.set_aspect("equal"); ax.axis("off")
    f.tight_layout(pad=0.15); f.savefig(name); plt.close(f)

def fig_three(key, name):
    f, ax = plt.subplots(figsize=(6.0, 2.2), dpi=200)
    for i in range(3):
        box(ax, i * 3.2, -1.5, 3.0, 3.0)
    if key:
        mol(ax, 1.5, 0, "O", [("H", "l"), ("H", "r")], ["t", "b"], PUR)
        mol(ax, 4.7 + 0.0, 0.25, "N", [("H", "l"), ("H", "r"), ("H", "b")], ["t"], PUR)
        mol(ax, 7.9, 0, "C", [("H", "l"), ("H", "r"), ("H", "t"), ("H", "b")], [], PUR)
    ax.set_xlim(-0.1, 9.7); ax.set_ylim(-1.6, 1.6); ax.set_aspect("equal"); ax.axis("off")
    f.tight_layout(pad=0.1); f.savefig(name); plt.close(f)

def bond_lines(ax, x1, x2, y, n):
    off = {1: [0], 2: [-0.09, 0.09], 3: [-0.14, 0, 0.14]}[n]
    for o in off: ax.plot([x1, x2], [y + o, y + o], color="black", lw=1.2)

def fig_multi(name):
    f, ax = plt.subplots(figsize=(6.0, 1.6), dpi=200)
    # O2
    sym(ax, 0.6, 0, "O"); sym(ax, 1.9, 0, "O"); bond_lines(ax, 0.85, 1.65, 0, 2)
    lone_pairs(ax, 0.6, 0, ["t", "b", "l"][:2]); lone_pairs(ax, 1.9, 0, ["t", "b"])
    # N2
    sym(ax, 3.9, 0, "N"); sym(ax, 5.2, 0, "N"); bond_lines(ax, 4.15, 4.95, 0, 3)
    lone_pairs(ax, 3.9, 0, ["l"]); lone_pairs(ax, 5.2, 0, ["r"])
    # CO2
    sym(ax, 7.0, 0, "O"); sym(ax, 8.3, 0, "C"); sym(ax, 9.6, 0, "O")
    bond_lines(ax, 7.25, 8.05, 0, 2); bond_lines(ax, 8.55, 9.35, 0, 2)
    lone_pairs(ax, 7.0, 0, ["t", "b"]); lone_pairs(ax, 9.6, 0, ["t", "b"])
    ax.text(1.25, -0.95, "O\u2082", ha="center", fontsize=11); ax.text(4.55, -0.95, "N\u2082", ha="center", fontsize=11); ax.text(8.3, -0.95, "CO\u2082", ha="center", fontsize=11)
    ax.set_xlim(-0.3, 10.2); ax.set_ylim(-1.3, 0.9); ax.set_aspect("equal"); ax.axis("off")
    f.tight_layout(pad=0.1); f.savefig(name); plt.close(f)

fig_share(False, "share_blank.png"); fig_share(True, "share.png")
fig_three(False, "three_blank.png"); fig_three(True, "three.png")
fig_multi("multi.png")
