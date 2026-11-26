# Figures for the Day 6 practice sheet: the two skywalk designs, the hanging chain, and the axes for T against link number (blank and key).
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Ellipse, Polygon, Circle

BLUE = "#1971c2"; GRAY = "#555555"; RED = "#c00000"

def ceiling(ax, x0, x1, y):
    ax.plot([x0, x1], [y, y], color="black", lw=1.6)
    for x in [x0 + 0.15 + i * 0.3 for i in range(int((x1 - x0) / 0.3))]: ax.plot([x, x + 0.2], [y, y + 0.2], color=GRAY, lw=0.7)

def nut(ax, x, y, circle=False):
    ax.add_patch(Rectangle((x - 0.13, y - 0.08), 0.26, 0.16, fc="#495057", ec="black", lw=0.6, zorder=4))
    if circle: ax.add_patch(Circle((x, y), 0.3, fc="none", ec=RED, lw=1.3, zorder=5))

def walk(ax, x, y, label):
    ax.add_patch(Rectangle((x - 1.4, y), 2.8, 0.35, fc="#e7f5ff", ec=BLUE, lw=1.2))
    ax.add_patch(Rectangle((x - 1.5, y - 0.12), 3.0, 0.12, fc="#adb5bd", ec="none"))
    ax.text(x + 1.55, y + 0.12, label, fontsize=7.5, color=GRAY, va="center")

def skywalks(name):
    fig, ax = plt.subplots(figsize=(6.4, 2.6), dpi=200)
    for k, (x, title) in enumerate([(1.8, "On paper: one long rod"), (7.2, "As built: two rods")]):
        top, up, low = 4.2, 2.6, 0.6
        ceiling(ax, x - 1.6, x + 1.6, top); ax.text(x - 1.6, top + 0.45, title, fontsize=8.5, weight="bold")
        walk(ax, x, up, "upper"); walk(ax, x, low, "lower")
        if k == 0:
            ax.plot([x, x], [top, low - 0.25], color="black", lw=2.4); nut(ax, x, up - 0.2, True); nut(ax, x, low - 0.2)
        else:
            ax.plot([x - 0.18, x - 0.18], [top, up - 0.25], color="black", lw=2.4); nut(ax, x - 0.18, up - 0.2, True)
            ax.plot([x + 0.18, x + 0.18], [up + 0.45, low - 0.25], color="black", lw=2.4); nut(ax, x + 0.18, up + 0.43); nut(ax, x + 0.18, low - 0.2)
    ax.text(4.5, 0.0, "circled: the nut under the upper walkway", fontsize=7, color=RED, ha="center")
    ax.set_xlim(0, 9.6); ax.set_ylim(-0.3, 5.0); ax.set_aspect("equal"); ax.axis("off")
    fig.tight_layout(pad=0.1); fig.savefig(name); plt.close(fig)

def chain(name):
    fig, ax = plt.subplots(figsize=(1.6, 3.3), dpi=200)
    ceiling(ax, -0.8, 0.8, 10.6)
    for i in range(10):
        y = 10.1 - i * 0.92; ax.add_patch(Ellipse((0, y), 0.42 if i % 2 else 0.5, 0.95, fc="none", ec="#495057", lw=2))
        ax.text(-0.55, y - 0.1, str(10 - i), fontsize=6.5, color=GRAY, ha="right")
    ax.plot([0, 0], [1.25, 0.8], color=GRAY, lw=1)
    ax.add_patch(Polygon([(-0.55, 0.8), (0.55, 0.8), (0.42, -0.3), (-0.42, -0.3)], closed=True, fc="#e7f5ff", ec=BLUE, lw=1.2))
    ax.text(0, 0.2, "2.5 kg", fontsize=6.5, ha="center", color=BLUE)
    ax.text(0.7, 10.1, "hook", fontsize=6.5, color=GRAY)
    ax.set_xlim(-1.1, 1.3); ax.set_ylim(-0.5, 11.0); ax.set_aspect("equal"); ax.axis("off")
    fig.tight_layout(pad=0.05); fig.savefig(name); plt.close(fig)

def axes(name, key):
    fig, ax = plt.subplots(figsize=(3.0, 2.0), dpi=200)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 60); ax.set_xticks(range(0, 11, 2)); ax.set_yticks(range(0, 61, 10))
    ax.set_xlabel("link number (1 = bottom)", fontsize=7); ax.set_ylabel("tension above it (N)", fontsize=7); ax.tick_params(labelsize=6.5)
    ax.grid(True, lw=0.4, color="#dee2e6")
    if key:
        xs = list(range(1, 11)); ys = [(n * 0.3 + 2.5) * 9.8 for n in xs]; ax.plot(xs, ys, "o-", color=RED, ms=3, lw=1.2)
    for s in ("top", "right"): ax.spines[s].set_visible(False)
    fig.tight_layout(pad=0.2); fig.savefig(name); plt.close(fig)

skywalks("skywalks.png"); chain("chain.png"); axes("axes_blank.png", False); axes("axes_key.png", True)
