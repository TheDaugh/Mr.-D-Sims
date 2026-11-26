import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import Rectangle, FancyArrowPatch

RED = "#c00000"; BLUE = "#1971c2"; GRAY = "#555555"

def coil(ax, x, y0, y1, w=0.25, n=9):
    ys = np.linspace(y0, y1, 2 * n + 1); xs = [x] + [x + (w if i % 2 else -w) for i in range(1, 2 * n)] + [x]
    ax.plot(xs, ys, color="#444", lw=1.1)

# ---- a spring at its natural length beside the same spring stretched by a hanging mass. Key labels x. ----
def stretch(key, name):
    fig, ax = plt.subplots(figsize=(2.6, 2.1), dpi=200)
    ax.plot([0, 4], [4, 4], color="black", lw=1.6)
    coil(ax, 1.0, 4, 2.6); ax.text(1.0, 2.35, "natural\nlength", ha="center", va="top", fontsize=6.5, color=GRAY)
    coil(ax, 3.0, 4, 1.7, n=9); ax.add_patch(Rectangle((2.65, 1.0), 0.7, 0.7, fc="#e7f5ff", ec=BLUE, lw=1.2))
    ax.plot([0.3, 3.7], [2.6, 2.6], ls="--", color=GRAY, lw=0.6)
    ax.plot([2.3, 3.7], [1.7, 1.7], ls="--", color=GRAY, lw=0.6)
    if key:
        ax.add_patch(FancyArrowPatch((2.25, 2.6), (2.25, 1.7), arrowstyle="<|-|>", mutation_scale=8, color=RED, lw=1.2))
        ax.text(2.1, 2.15, "x", fontsize=8, color=RED, ha="right", va="center")
    ax.set_xlim(0, 4); ax.set_ylim(0.8, 4.1); ax.set_aspect("equal"); ax.axis("off")
    fig.tight_layout(pad=0.1); fig.savefig(name); plt.close(fig)

# ---- force against stretch for the notes' spring (3 N per 0.025 m). Both sheets show the points; the key adds the line and slope. ----
def graph(key, name):
    fig, ax = plt.subplots(figsize=(3.0, 2.1), dpi=200)
    xs = [0, 0.025, 0.050, 0.075]; fs = [0, 3, 6, 9]
    ax.plot(xs, fs, "o", color=BLUE, ms=4)
    ax.set_xlim(0, 0.1); ax.set_ylim(0, 12); ax.set_xticks([0, 0.025, 0.05, 0.075, 0.1]); ax.set_yticks([0, 3, 6, 9, 12])
    ax.tick_params(labelsize=7); ax.set_xlabel("stretch x (m)", fontsize=8); ax.set_ylabel("force F (N)", fontsize=8); ax.grid(alpha=0.3)
    for s in ["top", "right"]: ax.spines[s].set_visible(False)
    if key:
        ax.plot([0, 0.1], [0, 12], color=RED, lw=1.5)
        ax.plot([0.025, 0.075, 0.075], [3, 3, 9], color=RED, lw=0.9, ls=":")
        ax.text(0.05, 1.8, "run 0.050 m", fontsize=6.5, color=RED, ha="center"); ax.text(0.077, 5.6, "rise 6 N", fontsize=6.5, color=RED)
    fig.tight_layout(pad=0.2); fig.savefig(name); plt.close(fig)

# ---- the Day 4 carts with a spring scale in the rope ----
def carts(name):
    fig, ax = plt.subplots(figsize=(3.6, 1.0), dpi=200)
    ax.plot([0, 7.6], [0, 0], color="black", lw=1)
    for x, w, t in [(0.5, 1.4, "2.0 kg"), (3.4, 1.8, "4.0 kg")]:
        ax.add_patch(Rectangle((x, 0.1), w, 0.8, fc="#e7f5ff", ec=BLUE, lw=1.2)); ax.text(x + w / 2, 0.5, t, ha="center", va="center", fontsize=7.5)
    xs = np.linspace(1.9, 3.4, 15); ax.plot(xs, 0.5 + 0.15 * np.array([0] + [(-1) ** i for i in range(1, 14)] + [0]), color="#444", lw=1)
    ax.add_patch(FancyArrowPatch((5.2, 0.5), (7.0, 0.5), arrowstyle="-|>", mutation_scale=11, color=BLUE, lw=1.6)); ax.text(6.1, 0.65, "12 N", fontsize=7.5, color=BLUE, ha="center")
    ax.set_xlim(0, 7.6); ax.set_ylim(-0.1, 1.05); ax.set_aspect("equal"); ax.axis("off")
    fig.tight_layout(pad=0.1); fig.savefig(name); plt.close(fig)

stretch(False, "stretch_blank.png"); stretch(True, "stretch.png")
graph(False, "graph_blank.png"); graph(True, "graph.png"); carts("carts.png")
