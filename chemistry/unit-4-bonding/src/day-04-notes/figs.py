import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Circle, FancyArrowPatch

RED = "#c00000"; BLUE = "#1971c2"
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

# rows: (metal, metal dots, nonmetal, nonmetal dots, metal charge, nonmetal charge, electrons moved)
ROWS = [("Li", 1, "F", 7, "+", "−", 1), ("Mg", 2, "O", 6, "2+", "2−", 2)]

def fig(key, name):
    f, ax = plt.subplots(figsize=(6.0, 2.9), dpi=200)
    for r, (m, mn, n, nn, mc, nc, mv) in enumerate(ROWS):
        y = -r * 1.95
        sym(ax, 0.6, y, m); dots(ax, 0.6, y, mn)
        ax.text(1.75, y, "+", ha="center", va="center", fontsize=15)
        sym(ax, 2.9, y, n); dots(ax, 2.9, y, nn)
        ax.add_patch(FancyArrowPatch((3.9, y), (4.8, y), arrowstyle="-|>", mutation_scale=14, lw=1.6, color="black"))
        # the ions
        bracket(ax, 6.0, y); sym(ax, 6.0, y, m)
        bracket(ax, 8.2, y); sym(ax, 8.2, y, n)
        if key:
            ax.text(6.0 + 0.72, y + 0.62, mc, fontsize=11, color=RED, va="bottom", ha="left", weight="bold")
            dots(ax, 8.2, y, 8, color=RED)
            ax.text(8.2 + 0.72, y + 0.62, nc, fontsize=11, color=RED, va="bottom", ha="left", weight="bold")
            # the electron(s) that move: red arrows from the metal's dots to the nonmetal's open sides
            for k in range(mv):
                rad = -0.45 - 0.12 * k
                ax.add_patch(FancyArrowPatch((0.6 + (0.38 if k else 0), y + (0.4 if not k else 0.0) + (0.12 if not k else 0)), (2.9 - 0.4, y + (0.0 if not k else 0.0) + (0.08 if not k else -0.12)), connectionstyle="arc3,rad=%.2f" % rad, arrowstyle="-|>", mutation_scale=11, lw=1.3, color=RED))
            ax.text(6.0, y - 0.95, "cation", ha="center", fontsize=9, color=RED, weight="bold")
            ax.text(8.2, y - 0.95, "anion", ha="center", fontsize=9, color=RED, weight="bold")
    ax.set_xlim(-0.2, 9.6); ax.set_ylim(-2.95, 1.0); ax.set_aspect("equal"); ax.axis("off")
    f.tight_layout(pad=0.15); f.savefig(name); plt.close(f)
fig(False, "ionic_blank.png"); fig(True, "ionic.png")
