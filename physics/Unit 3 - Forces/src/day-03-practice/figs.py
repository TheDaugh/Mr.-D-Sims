import math
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon, FancyArrowPatch, Arc, Rectangle, Circle

RED = "#c00000"; BLUE = "#1971c2"; GRAY = "#555555"

def arrow(ax, p0, p1, c, lw=2.0):
    ax.add_patch(FancyArrowPatch(p0, p1, arrowstyle="-|>", mutation_scale=12, color=c, lw=lw))

def ramp_block(ax, th=20, L=6.0, s=2.6):
    t = math.radians(th); h = L * math.tan(t)
    ax.add_patch(Polygon([(0, 0), (L, 0), (L, h)], closed=True, fc="#f1f3f5", ec="black", lw=1))
    ax.add_patch(Arc((0, 0), 1.6, 1.6, theta1=0, theta2=th, lw=0.8)); ax.text(1.0, 0.12, "%d°" % th, fontsize=8)
    u = (math.cos(t), math.sin(t)); n = (-math.sin(t), math.cos(t)); w, hh = 1.2, 0.8
    p0 = (s * u[0], s * u[1])
    pts = [p0, (p0[0] + w * u[0], p0[1] + w * u[1]), (p0[0] + w * u[0] + hh * n[0], p0[1] + w * u[1] + hh * n[1]), (p0[0] + hh * n[0], p0[1] + hh * n[1])]
    ax.add_patch(Polygon(pts, closed=True, fc="#e7f5ff", ec=BLUE, lw=1.2))
    c = (p0[0] + w / 2 * u[0] + hh / 2 * n[0], p0[1] + w / 2 * u[1] + hh / 2 * n[1])
    return t, u, n, c, p0

# ---- a student's FBD with two mistakes: N straight up, friction down the ramp on a block at rest. The key shows the fix. ----
def err(fixed, name):
    fig, ax = plt.subplots(figsize=(3.4, 2.1), dpi=200)
    t, u, n, c, p0 = ramp_block(ax)
    arrow(ax, c, (c[0], c[1] - 1.6), RED); ax.text(c[0] + 0.1, c[1] - 1.55, "W", fontsize=8, color=RED)
    top = (c[0] + 0.4 * n[0], c[1] + 0.4 * n[1]); bot = (p0[0] + 0.6 * u[0], p0[1] + 0.6 * u[1])
    if not fixed:
        arrow(ax, top, (top[0], top[1] + 1.4), RED); ax.text(top[0] + 0.1, top[1] + 1.3, "N", fontsize=8, color=RED)
        arrow(ax, bot, (bot[0] - 1.3 * u[0], bot[1] - 1.3 * u[1]), RED); ax.text(bot[0] - 1.6 * u[0] - 0.1, bot[1] - 1.3 * u[1] - 0.35, "f", fontsize=8, color=RED)
        ax.text(5.9, 3.0, "The block is at rest.", fontsize=7.5, ha="right", color=GRAY)
    else:
        arrow(ax, top, (top[0] + 1.4 * n[0], top[1] + 1.4 * n[1]), RED); ax.text(top[0] + 1.4 * n[0] - 0.35, top[1] + 1.4 * n[1], "N", fontsize=8, color=RED)
        arrow(ax, bot, (bot[0] + 1.3 * u[0], bot[1] + 1.3 * u[1]), RED); ax.text(bot[0] + 1.3 * u[0] + 0.05, bot[1] + 1.3 * u[1] - 0.35, "f", fontsize=8, color=RED)
    ax.set_xlim(-0.2, 6.2); ax.set_ylim(-0.4, 3.3); ax.set_aspect("equal"); ax.axis("off")
    fig.tight_layout(pad=0.1); fig.savefig(name); plt.close(fig)

# ---- Canton Avenue: a 37% grade drawn to scale (37 m up for every 100 m across), a parked car, the angle unknown. ----
def canton(name):
    fig, ax = plt.subplots(figsize=(4.4, 1.9), dpi=200)
    L, H = 10.0, 3.7; t = math.atan2(H, L)
    ax.add_patch(Polygon([(0, 0), (L, 0), (L, H)], closed=True, fc="#e9ecef", ec="black", lw=1))
    ax.annotate("", xy=(L, -0.35), xytext=(0, -0.35), arrowprops=dict(arrowstyle="<->", lw=0.8, color=GRAY)); ax.text(L / 2, -0.75, "100 m across", ha="center", fontsize=7.5, color=GRAY)
    ax.annotate("", xy=(L + 0.35, H), xytext=(L + 0.35, 0), arrowprops=dict(arrowstyle="<->", lw=0.8, color=GRAY)); ax.text(L + 0.5, H / 2, "37 m\nup", va="center", fontsize=7.5, color=GRAY)
    ax.add_patch(Arc((0, 0), 2.4, 2.4, theta1=0, theta2=math.degrees(t), lw=0.8)); ax.text(1.4, 0.2, "θ", fontsize=9)
    u = (math.cos(t), math.sin(t)); n = (-math.sin(t), math.cos(t)); s = 5.2
    def P(a, b): return (s * u[0] + a * u[0] + b * n[0], s * u[1] + a * u[1] + b * n[1])
    ax.add_patch(Polygon([P(0, 0.25), P(2.2, 0.25), P(2.2, 0.75), P(1.6, 0.75), P(1.3, 1.15), P(0.6, 1.15), P(0.3, 0.75), P(0, 0.75)], closed=True, fc="#4f7fb3", ec="#1f3c5c", lw=0.9))
    for a in (0.45, 1.75): ax.add_patch(Circle(P(a, 0.22), 0.22, fc="#222", ec="none"))
    ax.text(0.2, 3.2, "Canton Avenue, Pittsburgh", fontsize=8, weight="bold")
    ax.set_xlim(-0.2, 11.4); ax.set_ylim(-1.0, 3.9); ax.set_aspect("equal"); ax.axis("off")
    fig.tight_layout(pad=0.1); fig.savefig(name); plt.close(fig)

err(False, "err_blank.png"); err(True, "err_key.png"); canton("canton.png")
