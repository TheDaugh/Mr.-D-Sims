import re, math
from PIL import ImageFont
FI='/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf'
_f={}
def adv(ch,size):
    k=size
    if k not in _f:_f[k]=ImageFont.truetype(FI,size)
    return _f[k].getlength(ch)
NAVY='#14213D'
def T(x,y,s,size=56,fill='#14213D',anchor='middle',extra=''):
    """text with markup: _{2} subscript, ^{2+} superscript"""
    parts=re.split(r'(_\{[^}]*\}|\^\{[^}]*\})',s); out=''; pend=0
    for p in parts:
        if not p: continue
        if p[0]=='_' and p[1]=='{':
            out+=f'<tspan font-size="{max(40,int(size*.62))}" dy="{size*.2:.1f}">{p[2:-1]}</tspan>'; pend=-size*.2
        elif p[0]=='^' and p[1]=='{':
            out+=f'<tspan font-size="{max(40,int(size*.62))}" dy="{-size*.38:.1f}">{p[2:-1]}</tspan>'; pend=size*.38
        else:
            out+=f'<tspan dy="{pend:.1f}">{p}</tspan>' if pend else p; pend=0
    return f'<text x="{x}" y="{y}" font-family="Inter" font-weight="800" font-size="{size}" fill="{fill}" text-anchor="{anchor}" {extra}>{out}</text>'
def C(x,y,r,fill='none',stroke='none',sw=0,extra=''):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>'
def L(x1,y1,x2,y2,stroke='#14213D',sw=10,extra=''):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" {extra}/>'
def R(x,y,w,h,fill,rx=0,stroke='none',sw=0):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
def arrow(x1,y1,x2,y2,col='#14213D',sw=12,head=26):
    a=math.atan2(y2-y1,x2-x1); bx=x2-head*math.cos(a); by=y2-head*math.sin(a)
    p=[(x2,y2),(bx+head*.6*math.sin(a),by-head*.6*math.cos(a)),(bx-head*.6*math.sin(a),by+head*.6*math.cos(a))]
    return L(x1,y1,bx,by,col,sw)+f'<polygon points="{" ".join(f"{u:.1f},{v:.1f}" for u,v in p)}" fill="{col}"/>'
def arc(text,Rr,size,pos='top',fill='#14213D'):
    size=max(size,40)
    adv_=[adv(c,size) for c in text]; tot=sum(adv_); span=tot/Rr
    assert math.degrees(span)<=150,(text,math.degrees(span))
    out='';cur=0
    for c,a in zip(text,adv_):
        mid=(cur+a/2)-tot/2; th=mid/Rr; cur+=a
        if c==' ':continue
        if pos=='top':
            ang=-math.pi/2+th; rot=math.degrees(th)
        else:
            ang=math.pi/2-th; rot=-math.degrees(th)
        x=300+Rr*math.cos(ang); y=300+Rr*math.sin(ang)
        out+=f'<text transform="translate({x:.1f} {y:.1f}) rotate({rot:.1f})" font-family="Inter" font-weight="800" font-size="{size}" fill="{fill}" text-anchor="middle">{c}</text>'
    return out
def wrap(inner,bg,tier):
    ring='#E9B521' if tier=='rare' else '#FFFFFF'; rw=9 if tier=='rare' else 4
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 -30 660 660" width="660" height="660">'
            f'{C(300,300,330,NAVY)}{C(300,300,268,bg)}{C(300,300,284,"none",ring,rw)}{inner}</svg>')
