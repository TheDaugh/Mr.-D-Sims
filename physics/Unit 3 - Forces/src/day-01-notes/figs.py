import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, FancyArrowPatch

RED = "#c00000"; BLUE = "#1971c2"; GRAY = "#555555"

def arrow(ax, x0, y0, x1, y1, c, lw=2.2):
    ax.add_patch(FancyArrowPatch((x0, y0), (x1, y1), arrowstyle="-|>", mutation_scale=14, color=c, lw=lw))

# ---- fbd: a 12 kg crate pushed right on a floor. Both sheets show the crate, the floor and the push;
#      the key adds friction, normal force and weight in red. ----
def fbd(key, name):
    fig, ax = plt.subplots(figsize=(4.2, 2.2), dpi=200)
    ax.add_patch(Rectangle((0, -0.25), 6, 0.25, hatch="////", fill=False, ec=GRAY, lw=0))
    ax.plot([0, 6], [0, 0], color="black", lw=1)
    ax.add_patch(Rectangle((2.3, 0), 1.4, 1.2, fc="#eeeeee", ec="black", lw=1))
    ax.text(3.0, 0.6, "12 kg", ha="center", va="center", fontsize=9)
    arrow(ax, 0.6, 0.6, 2.25, 0.6, BLUE)
    ax.text(1.4, 0.78, "push", ha="center", fontsize=9, color=BLUE)
    if key:
        arrow(ax, 3.0, 0.02, 1.9, 0.02, RED)
        ax.text(1.6, -0.55, "friction (floor)", ha="center", fontsize=8.5, color=RED)
        arrow(ax, 3.0, 1.2, 3.0, 2.3, RED)
        ax.text(3.15, 2.05, "N (floor)", fontsize=8.5, color=RED)
        arrow(ax, 3.35, 0.6, 3.35, -0.9, RED)
        ax.text(3.5, -0.85, "W (Earth)", fontsize=8.5, color=RED)
    ax.set_xlim(0, 6); ax.set_ylim(-1.0, 2.45); ax.set_aspect("equal"); ax.axis("off")
    fig.tight_layout(pad=0.1); fig.savefig(name); plt.close(fig)

# ---- graph: friction against push for the 12 kg crate (mu_s N = 47 N, mu_k N = 29 N).
#      Blank: axes and the two dashed levels. Key: the line rises with the push, then drops to mu_k N. ----
def graph(key, name):
    fig, ax = plt.subplots(figsize=(4.0, 2.3), dpi=200)
    ax.set_xlim(0, 80); ax.set_ylim(0, 60)
    ax.set_xlabel("push (N)", fontsize=9); ax.set_ylabel("friction (N)", fontsize=9)
    ax.set_xticks([0, 20, 40, 60, 80]); ax.set_yticks([0, 20, 40, 60])
    ax.tick_params(labelsize=8)
    for y, t in [(47, r"$\mu_s N$ = 47 N"), (29.4, r"$\mu_k N$ = 29 N")]:
        ax.axhline(y, ls="--", color=GRAY, lw=0.8)
        ax.text(79, y + 1.5, t, ha="right", fontsize=8, color=GRAY)
    ax.grid(alpha=0.25)
    if key:
        ax.plot([0, 47], [0, 47], color=RED, lw=2.2)
        ax.plot([47, 47], [47, 29.4], color=RED, lw=1.2, ls=":")
        ax.plot([47, 80], [29.4, 29.4], color=RED, lw=2.2)
        ax.text(24, 8, "static:\nfriction = push", fontsize=8, color=RED, ha="center")
        ax.text(64, 18, "kinetic:\nsame size", fontsize=8, color=RED, ha="center")
    for s in ["top", "right"]: ax.spines[s].set_visible(False)
    fig.tight_layout(pad=0.2); fig.savefig(name); plt.close(fig)

fbd(False, "fbd_blank.png"); fbd(True, "fbd.png")
graph(False, "graph_blank.png"); graph(True, "graph.png")
