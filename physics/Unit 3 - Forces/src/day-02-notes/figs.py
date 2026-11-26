import math
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon, FancyArrowPatch, Arc

RED = "#c00000"; BLUE = "#1971c2"; PURPLE = "#7048e8"; GRAY = "#555555"
TH = 20  # the notes' ramp angle

def arrow(ax, p0, p1, c, lw=2.2, ls="-"):
    ax.add_patch(FancyArrowPatch(p0, p1, arrowstyle="-|>", mutation_scale=13, color=c, lw=lw, linestyle=ls))

def ramp(ax, L=6.0, th=TH):
    t = math.radians(th); h = L * math.tan(t)
    ax.add_patch(Polygon([(0, 0), (L, 0), (L, h)], closed=True, fc="#f1f3f5", ec="black", lw=1))
    ax.add_patch(Arc((0, 0), 1.6, 1.6, theta1=0, theta2=th, color="black", lw=0.8))
    ax.text(1.0, 0.13, "%d°" % th, fontsize=8)
    return t

def block(ax, s, t, w=1.0, hgt=0.7):
    """a block whose bottom-left corner sits s along the ramp; returns its center"""
    u = (math.cos(t), math.sin(t)); n = (-math.sin(t), math.cos(t))
    p0 = (s * u[0], s * u[1])
    pts = [p0, (p0[0] + w * u[0], p0[1] + w * u[1]),
           (p0[0] + w * u[0] + hgt * n[0], p0[1] + w * u[1] + hgt * n[1]), (p0[0] + hgt * n[0], p0[1] + hgt * n[1])]
    ax.add_patch(Polygon(pts, closed=True, fc="#e7f5ff", ec=BLUE, lw=1.2))
    c = (p0[0] + w / 2 * u[0] + hgt / 2 * n[0], p0[1] + w / 2 * u[1] + hgt / 2 * n[1])
    ax.text(c[0], c[1], "5.0 kg", fontsize=6.5, ha="center", va="center", rotation=math.degrees(t))
    return c, u, n

# ---- fbd: the block on a 20° ramp. Blank: ramp and block. Key: W straight down, N perpendicular, tilted axes dashed. ----
def fbd(key, name):
    fig, ax = plt.subplots(figsize=(3.6, 2.0), dpi=200)
    t = ramp(ax); c, u, n = block(ax, 3.0, t)
    if key:
        arrow(ax, c, (c[0], c[1] - 1.5), RED); ax.text(c[0] + 0.1, c[1] - 1.45, "W (Earth)", fontsize=7, color=RED)
        top = (c[0] + 0.35 * n[0], c[1] + 0.35 * n[1])
        arrow(ax, top, (top[0] + 1.3 * n[0], top[1] + 1.3 * n[1]), RED); ax.text(top[0] + 1.3 * n[0] - 0.9, top[1] + 1.3 * n[1], "N (ramp)", fontsize=7, color=RED)
        for d, lab in [(u, "along"), (n, "")]:
            ax.plot([c[0] - 1.6 * d[0], c[0] + 1.6 * d[0]], [c[1] - 1.6 * d[1], c[1] + 1.6 * d[1]], ls="--", color=GRAY, lw=0.7)
        ax.text(c[0] + 1.7 * u[0], c[1] + 1.7 * u[1], "along", fontsize=7, color=GRAY)
    ax.set_xlim(-0.2, 6.3); ax.set_ylim(-1.0, 3.0); ax.set_aspect("equal"); ax.axis("off")
    fig.tight_layout(pad=0.1); fig.savefig(name); plt.close(fig)

# ---- split: the weight arrow and its two parts. Blank: block and W only. Key: purple parts, the angle θ at the weight. ----
def split(key, name):
    fig, ax = plt.subplots(figsize=(3.6, 2.0), dpi=200)
    t = ramp(ax); c, u, n = block(ax, 3.0, t)
    Wlen = 1.9
    end = (c[0], c[1] - Wlen)
    arrow(ax, c, end, RED); ax.text(c[0] + 0.08, c[1] - Wlen - 0.05, "mg", fontsize=7.5, color=RED)
    if key:
        a = Wlen * math.sin(t); b = Wlen * math.cos(t)
        pa = (c[0] - a * u[0], c[1] - a * u[1])          # down the ramp
        arrow(ax, c, pa, PURPLE); ax.text(pa[0] - 1.05, pa[1] - 0.1, "mg sin θ", fontsize=7, color=PURPLE)
        pb = (c[0] - b * n[0], c[1] - b * n[1])          # into the ramp
        arrow(ax, c, pb, PURPLE); ax.text(pb[0] + 0.12, pb[1] - 0.2, "mg cos θ", fontsize=7, color=PURPLE)
        ax.plot([pa[0], end[0]], [pa[1], end[1]], ls=":", color=PURPLE, lw=0.8)
        ax.plot([pb[0], end[0]], [pb[1], end[1]], ls=":", color=PURPLE, lw=0.8)
        ax.add_patch(Arc(c, 1.0, 1.0, theta1=270, theta2=270 + TH, color=PURPLE, lw=0.8))
        ax.text(c[0] + 0.12, c[1] - 0.75, "θ", fontsize=7, color=PURPLE)
    ax.set_xlim(-0.2, 6.3); ax.set_ylim(-0.6, 3.0); ax.set_aspect("equal"); ax.axis("off")
    fig.tight_layout(pad=0.1); fig.savefig(name); plt.close(fig)

fbd(False, "fbd_blank.png"); fbd(True, "fbd.png")
split(False, "split_blank.png"); split(True, "split.png")
