import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Circle, FancyArrowPatch
rows=[["H","","","","","","","He"],["Li","Be","B","C","N","O","F","Ne"],["Na","Mg","Al","Si","P","S","Cl","Ar"],["K","Ca","Ga","Ge","As","Se","Br","Kr"],["Rb","Sr","In","Sn","Sb","Te","I","Xe"]]
grp=["1","2","13","14","15","16","17","18"]
def table(key,name,arrows):
    fig,ax=plt.subplots(figsize=(5.6,3.3),dpi=200)
    for r,row in enumerate(rows):
        for c,s in enumerate(row):
            if s: ax.add_patch(Rectangle((c,-r),1,1,fill=False,lw=0.8)); ax.text(c+.5,-r+.5,s,ha="center",va="center",fontsize=8)
    for c,g in enumerate(grp): ax.text(c+.5,1.25,g,ha="center",fontsize=7,color="#555")
    for r in range(5): ax.text(-.35,-r+.5,str(r+1),ha="center",va="center",fontsize=7,color="#555")
    if key:
        for (x0,y0,x1,y1,lab,col) in arrows:
            ax.add_patch(FancyArrowPatch((x0,y0),(x1,y1),arrowstyle="-|>",mutation_scale=14,lw=2.2,color=col))
            ax.text((x0+x1)/2,(y0+y1)/2+0.25 if y0==y1 else (y0+y1)/2,lab,color=col,fontsize=8,ha="center",weight="bold",bbox=dict(fc="white",ec="none",pad=1))
    ax.set_xlim(-0.8,9.6);ax.set_ylim(-4.3,1.7);ax.set_aspect("equal");ax.axis("off")
    fig.tight_layout();fig.savefig(name);plt.close(fig)
table(False,"pt_blank.png",[])
table(True,"pt_size.png",[(8.9,1.0,8.9,-3.8,"bigger","#1f4e79"),(0.2,-4.6+0.4,7.8,-4.2,"smaller","#c00000")])
table(True,"pt_en.png",[(8.9,-3.8,8.9,1.0,"more EN","#1f4e79"),(0.2,-4.2,7.8,-4.2,"more EN","#c00000")])
# atom sizes to scale (pm): periods 2-4, groups 1, 2, 13-17, group 1 shared
grid=[["Li",152],["Be",112],["B",85],["C",77],["N",75],["O",73],["F",72]],[["Na",186],["Mg",160],["Al",143],["Si",118],["P",110],["S",103],["Cl",99]],[["K",227],["Ca",197],["Ga",135],["Ge",122],["As",120],["Se",119],["Br",114]]
fig,ax=plt.subplots(figsize=(6.6,3.3),dpi=200)
s=1/250
for r,row in enumerate(grid):
    for c,(e,pm) in enumerate(row):
        x=1.0+c*1.9; y=-r*2.0
        ax.add_patch(Circle((x,y),pm*s,fc="#f1f3f5",ec="#555"))
        ax.text(x,y,e,ha="center",va="center",fontsize=8)
    ax.text(-0.4,-r*2.0,"Period %d"%(r+2),ha="right",va="center",fontsize=7,color="#555")
for c,g in enumerate(["1","2","13","14","15","16","17"]):
    ax.text(1.0+c*1.9,1.25,"Group "+g if c==0 else g,ha="center",fontsize=7,color="#555")
ax.set_xlim(-2.2,13.3);ax.set_ylim(-5.1,1.6);ax.set_aspect("equal");ax.axis("off")
fig.tight_layout();fig.savefig("sizes.png");plt.close(fig)
