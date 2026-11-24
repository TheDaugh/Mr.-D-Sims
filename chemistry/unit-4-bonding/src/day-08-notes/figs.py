import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Circle
import random
RED = "#c00000"
def fig(key, name):
    f, ax = plt.subplots(figsize=(5.2, 1.9), dpi=200)
    random.seed(7)
    xs = [0.9 + 1.5 * i for i in range(5)]; ys = [0.55, 1.9, 3.25]
    # rows offset like a metal lattice
    for r, y in enumerate(ys):
        for i, x in enumerate(xs):
            xx = x + (0.75 if r % 2 else 0)
            if xx > 7.6: continue
            ax.add_patch(Circle((xx, y), 0.38, fc="#e9ecef", ec="black", lw=0.9))
            ax.text(xx, y, "+", ha="center", va="center", fontsize=11)
    if key:
        pts = [(1.6, 1.25), (3.1, 0.15), (4.6, 1.3), (6.1, 0.2), (2.3, 2.6), (3.8, 1.25), (5.3, 2.55), (6.8, 1.3), (1.5, 3.9), (4.2, 3.8), (6.6, 3.7), (2.9, 2.55), (5.8, 1.2), (0.3, 2.0)]
        for (x, y) in pts:
            ax.add_patch(Circle((x, y), 0.09, fc=RED, ec="none"))
    ax.set_xlim(-0.2, 8.2); ax.set_ylim(-0.3, 4.3); ax.set_aspect("equal"); ax.axis("off")
    f.tight_layout(pad=0.1); f.savefig(name); plt.close(f)
fig(False, "sea_blank.png"); fig(True, "sea.png")
