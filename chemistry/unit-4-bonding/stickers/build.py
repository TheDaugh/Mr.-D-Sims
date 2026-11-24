import json,subprocess,random
from designs import *
from lib import wrap
START=121
order=list(D.keys()); assert len(order)==24,len(order)
meta={str(START+i):k for i,k in enumerate(order)}
json.dump(meta,open('numbering_new.json','w'),indent=1)
for i,k in enumerate(order):
    f,bg,t=D[k]; svg=wrap(f(),bg,t); n=START+i
    open(f'svg/{n}-{k}.svg','w').write(svg)
    subprocess.run(['rsvg-convert','-w','1000','-h','1000',f'svg/{n}-{k}.svg','-o',f'png/{n}-{k}.png'],check=True)
print('rendered',len(order))
