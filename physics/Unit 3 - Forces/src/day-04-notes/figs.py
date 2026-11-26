import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Circle, FancyArrowPatch

RED = "#c00000"; BLUE = "#1971c2"; GRAY = "#555555"

def arrow(ax, p0, p1, c=RED, lw=1.8):
    ax.add_patch(FancyArrowPatch(p0, p1, arrowstyle="-|>", mutation_scale=11, color=c, lw=lw))

def box(ax, x, y, w, h, t):
    ax.add_patch(Rectangle((x, y), w, h, fc="#e7f5ff", ec=BLUE, lw=1.2)); ax.text(x + w / 2, y + h / 2, t, ha="center", va="center", fontsize=7.5)

def floor(ax, x0, x1, y=0):
    ax.plot([x0, x1], [y, y], color="black", lw=1)
    for x in [x0 + 0.15 + 0.3 * i for i in range(int((x1 - x0) / 0.3))]: ax.plot([x, x - 0.15], [y, y - 0.18], color=GRAY, lw=0.6)

def finish(fig, ax, name, xl, yl):
    ax.set_xlim(*xl); ax.set_ylim(*yl); ax.set_aspect("equal"); ax.axis("off"); fig.tight_layout(pad=0.1); fig.savefig(name); plt.close(fig)

# ---- two carts joined by a rope, pulled with 12 N on a frictionless floor. Key: T on each cart, the system box. ----
def carts(key, name):
    fig, ax = plt.subplots(figsize=(3.6, 1.2), dpi=200)
    floor(ax, 0, 7.6)
    box(ax, 0.5, 0.15, 1.4, 0.8, "2.0 kg"); box(ax, 3.2, 0.15, 1.8, 0.8, "4.0 kg")
    ax.plot([1.9, 3.2], [0.55, 0.55], color="#6d4b2a", lw=1.2)
    arrow(ax, (5.0, 0.55), (6.9, 0.55), BLUE); ax.text(6.0, 0.72, "12 N", fontsize=7.5, color=BLUE, ha="center")
    if key:
        arrow(ax, (1.9, 0.55), (2.5, 0.55)); ax.text(2.2, 0.3, "T", fontsize=7.5, color=RED, ha="center")
        arrow(ax, (3.2, 0.55), (2.6, 0.55)); ax.text(2.9, 0.75, "T", fontsize=7.5, color=RED, ha="center")
        ax.add_patch(Rectangle((0.3, 0.02), 4.9, 1.1, fill=False, ec=GRAY, lw=0.8, ls="--")); ax.text(2.75, 1.25, "system: 6.0 kg", fontsize=7, color=GRAY, ha="center")
    finish(fig, ax, name, (0, 7.6), (-0.3, 1.45))

# ---- a 5.0 kg cart on a table, a string over a pulley to a 2.0 kg hanging mass. Key: T on both, W of the hanging mass. ----
def table(key, name):
    fig, ax = plt.subplots(figsize=(3.4, 1.9), dpi=200)
    ax.plot([0, 5.0], [2.0, 2.0], color="black", lw=1.2); ax.plot([5.0, 5.0], [2.0, -0.4], color="black", lw=1.2)
    ax.add_patch(Circle((5.25, 2.18), 0.18, fc="#ced4da", ec="black", lw=0.8))
    box(ax, 1.0, 2.0, 1.6, 0.8, "5.0 kg")
    ax.plot([2.6, 5.25], [2.36, 2.36], color="#6d4b2a", lw=1.1); ax.plot([5.43, 5.43], [2.18, 0.9], color="#6d4b2a", lw=1.1)
    box(ax, 5.08, 0.1, 0.7, 0.8, ""); ax.text(5.95, 0.5, "2.0 kg", fontsize=7.5, va="center")
    if key:
        arrow(ax, (2.6, 2.36), (3.6, 2.36)); ax.text(3.1, 2.5, "T", fontsize=7.5, color=RED, ha="center")
        arrow(ax, (5.43, 0.9), (5.43, 1.7)); ax.text(5.57, 1.35, "T", fontsize=7.5, color=RED)
        arrow(ax, (5.43, 0.1), (5.43, -0.8)); ax.text(5.57, -0.7, "W = 19.6 N", fontsize=7, color=RED)
    finish(fig, ax, name, (-0.1, 7.0), (-0.9, 3.0))

# ---- Atwood: 4.0 kg and 6.0 kg over a pulley. Key: T up on both, weights down, the motion. ----
def atwood(key, name):
    fig, ax = plt.subplots(figsize=(2.2, 2.0), dpi=200)
    ax.plot([0.6, 3.4], [3.4, 3.4], color="black", lw=1.4); ax.plot([2.0, 2.0], [3.4, 3.0], color="black", lw=1)
    ax.add_patch(Circle((2.0, 2.8), 0.6, fc="#ced4da", ec="black", lw=0.8))
    ax.plot([1.4, 1.4], [2.8, 1.5], color="#6d4b2a", lw=1.1); ax.plot([2.6, 2.6], [2.8, 1.0], color="#6d4b2a", lw=1.1)
    box(ax, 1.05, 0.8, 0.7, 0.7, "4.0"); box(ax, 2.25, 0.2, 0.7, 0.8, "6.0")
    if key:
        arrow(ax, (1.25, 1.5), (1.25, 2.1)); ax.text(0.95, 1.9, "T", fontsize=7.5, color=RED)
        arrow(ax, (2.75, 1.0), (2.75, 1.6)); ax.text(2.85, 1.4, "T", fontsize=7.5, color=RED)
        arrow(ax, (3.25, 1.0), (3.25, 0.3), BLUE); ax.text(3.32, 0.55, "a", fontsize=7.5, color=BLUE)
        arrow(ax, (0.75, 0.9), (0.75, 1.6), BLUE); ax.text(0.5, 1.2, "a", fontsize=7.5, color=BLUE)
    finish(fig, ax, name, (0.3, 3.6), (0.0, 3.6))

carts(False, "carts_blank.png"); carts(True, "carts.png")
table(False, "table_blank.png"); table(True, "table.png")
atwood(False, "atwood_blank.png"); atwood(True, "atwood.png")
