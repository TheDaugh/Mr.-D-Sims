from lib import *
D={}  # key -> (fn, bg, tier)
def reg(key,bg,tier='common'):
    def d(f): D[key]=(f,bg,tier); return f
    return d
INK='#14213D'; W='#FFFFFF'
def atom(x,y,r,fill,label,size=52,lc=INK,stroke=INK):
    return C(x,y,r,fill,stroke,6)+T(x,y+size*.35,label,size,lc)

@reg('give-and-take','#FFD23F')
def _():
    s=arc('GIVE AND TAKE',207,46)
    s+=atom(170,300,66,'#5BC0EB','Na')+atom(430,300,66,'#7BD389','Cl')
    s+=C(262,300,13,INK)+arrow(285,300,350,300,INK,12,28)
    s+=T(170,425,'Na^{+}',64)+T(430,425,'Cl^{-}',64)
    return s

@reg('sharing-covalent','#2EC4B6')
def _():
    s=arc('SHARING IS',207,52)+arc('COVALENT',236,52,'bottom')
    s+=C(235,300,95,'#F7F7F7',INK,6)+C(365,300,95,'#F7F7F7',INK,6)
    s+=f'<clipPath id="cl"><circle cx="235" cy="300" r="95"/></clipPath><circle cx="365" cy="300" r="95" fill="#C9B6FF" clip-path="url(#cl)"/>'
    s+=C(300,278,13,'#6A2CC4')+C(300,322,13,'#6A2CC4')
    s+=T(205,320,'H',60)+T(395,320,'H',60)
    return s

@reg('sea-of-electrons','#12355B','rare')
def _():
    s=arc('SEA OF',207,52,'top',W)+arc('ELECTRONS',236,52,'bottom',W)
    import random; random.seed(4)
    pos=[(300+dx,300+dy) for dy in (-85,0,85) for dx in (-90,0,90)]
    for i,(x,y) in enumerate(pos): pass
    dots=[(190,255),(255,215),(345,255),(410,215),(215,345),(300,300+45),(385,345),(300,255-5),(205,300),(395,300),(300,380),(255,300+0)]
    for x,y in dots: s+=C(x,y,10,'#FFD23F')
    for x,y in pos: s+=C(x,y,34,'#F4F4F4',INK,5)+T(x,y+14,'+',48,INK)
    return s

@reg('no-mono-first','#FF6B6B')
def _():
    s=T(300,200,'MONOCARBON',52,INK)+L(165,187,435,187,W,9)
    s+=T(300,305,'CARBON',88,W)+T(300,395,'DIOXIDE',70,W)
    return s

@reg('tug-of-war','#B8A1FF')
def _():
    s=arc('TUG OF WAR',207,50)+arc('F PULLS HARDER',236,44,'bottom')
    s+=L(190,300,380,300,'#8B5E34',14)
    s+=atom(150,300,52,'#FFF3B0','H',58)+atom(430,300,68,'#7BD389','F',72)
    s+=C(330,300,13,'#6A2CC4')+C(352,300,13,'#6A2CC4')
    return s

@reg('down-is-bigger','#7BD389')
def _():
    s=arc('MORE SHELLS',207,52)+arc('BIGGER ATOM',236,50,'bottom')
    def at(x,r,n,lab):
        o=''
        for i in range(n): o+=C(x,300,r*(0.45+0.55*i/(n-1) if n>1 else 1),'#5BC0EB' if i==n-1 else 'none','#14213D',5,'fill-opacity=".45"' if i==n-1 else '')
        return o
    s=''.join([arc('MORE SHELLS',207,52),arc('BIGGER ATOM',236,50,'bottom')])
    for x,r,n,l in [(150,42,2,'Li'),(265,58,3,'Na'),(415,78,4,'K')]:
        s+=C(x,290,r,'#D6F0FF',INK,6)
        for i in range(1,n): s+=C(x,290,r*i/n,'none',INK,3)
        s+=C(x,290,9,'#E63946')
        s+=T(x,290+r+50,l,50)
    return s

@reg('outer-electron-leaves','#FF9F1C')
def _():
    s=arc('OUTER ELECTRON',207,46)+arc('LEAVES EASILY',236,44,'bottom')
    s+=C(205,335,92,'#FFE6B3',INK,6)+C(205,335,60,'none',INK,3)+C(205,335,28,'none',INK,3)+C(205,335,10,'#E63946')
    s+=T(205,325,'Cs',0,INK) if False else ''
    s+=C(297,335,14,'#2563EB')
    for i,x in enumerate((340,385,430)): s+=L(x,305-8,x+30,305-8,INK,6)+L(x,305+8,x+30,305+8,INK,6) if False else ''
    s+=arrow(325,335,445,335,INK,12,28)+C(470,335,14,'#2563EB')
    s+=T(205,222,'Cs',56)
    return s

@reg('criss-cross','#FFF6D6','rare')
def _():
    s=arc('CRISS-CROSS',207,50)
    s+=T(165,235,'Al',84)+T(240,185,'3+',44,'#E63946')
    s+=T(385,235,'O',84)+T(447,185,'2&#8722;',44,'#E63946')
    s+=arrow(245,200,420,340,'#E63946',9,22)+arrow(447,200,258,340,'#E63946',9,22)
    s+=T(255,420,'Al_{2}O_{3}',92,INK)
    return s

@reg('last-name-ide','#FF8FAB')
def _():
    s=arc('NEW LAST NAME',207,46)
    s+=T(300,265,'CHLOR',92,INK)
    s+=T(300,385,'-IDE',128,W,extra='stroke="#14213D" stroke-width="7" paint-order="stroke"')
    return s

@reg('lone-pair-stays-home','#5BC0EB')
def _():
    s=arc('LONE PAIR',207,52)+arc('STAYS HOME',236,52,'bottom')
    s+=L(195,310,250,310,INK,10)+L(350,310,405,310,INK,10)
    s+=T(150,335,'H',80)+T(300,335,'O',110)+T(450,335,'H',80)
    for dx in (-14,14): s+=C(300+dx,218,11,INK)+C(300+dx,392,11,INK)
    return s

@reg('triple-bond','#E63946')
def _():
    s=arc('3 PAIRS',207,56,'top',W)+arc('HARD TO BREAK UP',236,44,'bottom',W)
    s+=T(150,340,'N',112,W)+T(450,340,'N',112,W)
    for y in (280,310,340): s+=L(215,y-5,385,y-5,'#FFD23F',13)
    return s

@reg('noble-no-thanks','#9BE3C3')
def _():
    s=arc('FULL OCTET',207,52)+arc('NO BONDS, THANKS',236,42,'bottom')
    s+=T(300,330,'Ne',112)
    for dx in (-15,15):
        s+=C(300+dx,205,12,INK)+C(300+dx,420,12,INK)
    for dy in (-15,15):
        s+=C(180,300+dy,12,INK)+C(420,300+dy,12,INK)
    return s

@reg('more-protons','#FF9F7F')
def _():
    s=arc('MORE PROTONS',207,50)+arc('SMALLER ATOM',236,50,'bottom')
    s+=C(165,285,70,'none','#2563EB',7)+C(165,285,24,'#E63946')+T(165,395,'Li',54)
    s+=C(435,285,48,'none','#2563EB',7)+C(435,285,36,'#E63946')+T(435,395,'F',54)
    s+=arrow(250,285,345,285,INK,10,24)
    return s

@reg('charges-cancel','#C9B6FF')
def _():
    s=arc('CHARGES CANCEL',207,46)
    s+=L(140,235,460,235,INK,12)+f'<polygon points="300,240 270,330 330,330" fill="{INK}"/>'
    s+=L(140,235,170,300,INK,6)+L(460,235,430,300,INK,6)
    s+=C(170,330,52,'#FF6B6B',INK,6)+T(170,347,'+3',50,W)
    s+=C(430,330,52,'#2563EB',INK,6)+T(430,347,'-3',50,W)
    s+=T(300,450,'= 0',60)
    return s

@reg('subscripts-matter','#2EC4B6')
def _():
    s=T(300,220,'H_{2}O',100,INK)+T(300,275,'= WATER',46,W)
    s+=T(300,385,'H_{2}O_{2}',100,INK)+T(300,440,'NOT WATER',46,W)
    return s

@reg('bends-not-breaks','#FFD23F')
def _():
    s=arc('IONS SLIDE',207,52)+arc('METALS BEND',236,50,'bottom')
    xs=[-128,-43,43,128]
    for row,dy,off in ((0,-85,0),(1,0,44),(2,85,0)):
        for dx in xs:
            x=300+dx+off-22; y=300+dy
            s+=C(x,y,32,'#F4F4F4',INK,5)+T(x,y+14,'+',46,INK)
    for p in [(250,255),(335,258),(205,342),(360,345),(300,215),(300,385)]: s+=C(p[0],p[1],8,'#2563EB')
    s+=arrow(455,300,500,300,INK,8,16) if False else ''
    return s

@reg('unequal-sharing','#FF8FAB')
def _():
    s=arc('UNEQUAL SHARING',207,44)+arc('= POLAR',236,52,'bottom')
    s+=f'<ellipse cx="365" cy="300" rx="85" ry="58" fill="#C9B6FF"/>'
    s+=L(215,300,375,300,INK,10)
    s+=T(170,335,'H',100)+T(430,335,'F',104)
    s+=T(170,225,'&#948;+',50,'#E63946')+T(430,225,'&#948;&#8722;',50,'#2563EB')
    s+=arrow(230,395,420,395,INK,10,24)
    return s

@reg('capitals-matter','#FFF6D6','rare')
def _():
    s=arc('CAPITALS MATTER',207,44)
    s+=T(165,285,'CO',92)+T(300,275,'&#8800;',80,'#E63946')+T(435,285,'Co',92)
    s+=T(165,350,'GAS',44,'#6A2CC4')+T(435,350,'METAL',44,'#6A2CC4')
    s+=C(130,415,14,'none','#6A2CC4',5)+C(165,430,10,'none','#6A2CC4',5)+C(200,412,16,'none','#6A2CC4',5)
    s+=R(400,395,70,38,'#B8B8C7',6,INK,5)
    return s

@reg('tetra-four','#2EC4B6')
def _():
    s=arc('TETRA = 4',207,54)
    for x,y in ((300,180),(300,420),(165,300),(435,300)): s+=L(300,300,x,y,INK,10)
    s+=C(300,300,46,'#F7F7F7',INK,6)+T(300,320,'C',60)
    for x,y in ((300,175),(300,425),(165,300),(435,300)): s+=C(x,y,50,'#7BD389',INK,6)+T(x,y+17,'Cl',50)
    return s

@reg('gave-two','#FFD23F')
def _():
    s=arc('NO DOTS LEFT',207,50)+arc('I GAVE BOTH AWAY',236,42,'bottom')
    s+=T(285,335,'Mg',100)
    s+=f'<path d="M185 225 H160 V380 H185" fill="none" stroke="{INK}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>'
    s+=f'<path d="M385 225 H410 V380 H385" fill="none" stroke="{INK}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>'
    s+=T(425,250,'2+',52,'#E63946','start')
    return s

@reg('f-takes-gold','#2B2D42','rare')
def _():
    s=arc('ELECTRONEGATIVITY',207,40,'top',W)+arc('F TAKES GOLD',236,46,'bottom','#E9B521')
    s+=R(230,285,140,140,'#E9B521',8)+R(120,335,110,90,'#C0C6D0',8)+R(370,355,110,70,'#C98B4F',8)
    s+=T(300,380,'1',72,INK)+T(175,395,'2',56,INK)+T(425,402,'3',50,INK)
    s+=T(300,262,'F',74,W)+T(175,320,'O',54,W)+T(425,342,'N',54,W)
    return s

@reg('one-per-side','#7BD389')
def _():
    s=arc('ONE PER SIDE',207,52)+arc('THEN PAIR UP',236,52,'bottom')
    s+=T(300,335,'C',112)
    for x,y in ((300,215),(405,300),(300,415),(195,300)): s+=C(x,y,14,INK)
    s+=C(300+0,185,0)+ C(325,215,14,'none',INK,5,'stroke-dasharray="7 6"')
    return s

@reg('metal-nonmetal-ionic','#5BC0EB')
def _():
    s=T(300,200,'METAL +',72,INK)+T(300,285,'NONMETAL',62,INK)+T(300,395,'= IONIC',96,W,extra='stroke="#14213D" stroke-width="6" paint-order="stroke"')
    return s

@reg('salt-vs-water','#FF9F1C')
def _():
    s=f'<clipPath id="r"><rect x="300" y="0" width="300" height="600"/></clipPath><circle cx="300" cy="300" r="268" fill="#5BC0EB" clip-path="url(#r)"/>'
    s+=L(300,115,300,485,INK,8)
    s+=T(195,275,'NaCl',68)+T(195,345,'STEALS',44)
    s+=T(412,275,'H_{2}O',68)+T(412,345,'SHARES',44)
    return s
