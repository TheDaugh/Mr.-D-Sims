/* FoilPractice: endless problems for the Rutherford gold-foil lesson (and the review portal).
     FoilPractice.spec(n, band, seed)  ->  a num or mcq question: { type, q, ans, tol, unit, why, hint, skill, title, band }  (mcq has opts with one ok:1)
   n is the problem number, band 1 to 4 is the level, seed is any string (the lesson uses name|period so each student gets their own numbers).
   Bands: 1 percent of a count, and what a result means. 2 expected counts and "1 in N". 3 foil thickness. 4 nuclear charge (deflections go as charge squared). */
(function () {
function seeded(seed){let x=2166136261;seed=String(seed);for(let i=0;i<seed.length;i++){x^=seed.charCodeAt(i);x=Math.imul(x,16777619)}let a=x>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
var MEAN=[
 ["Almost every alpha particle goes straight through the foil.","The atom is mostly empty space.","Mostly empty space"],
 ["A few alpha particles are bent through large angles.","The positive charge is concentrated in a tiny region.","A concentrated positive charge"],
 ["A very few alpha particles bounce almost straight back.","Something very dense and heavy sits at the center of the atom.","A heavy, dense center"]];
var WRONG=["The positive charge is spread evenly through the atom.","Electrons are heavier than alpha particles.","Atoms cannot be divided.","Alpha particles stick to gold atoms."];
function fmt(x){return x.toLocaleString("en-US")}
function spec(n,band,seed){
  var r=seeded(seed+"|"+n+"|"+band),pick=function(a){return a[Math.floor(r()*a.length)]},B=Math.max(1,Math.min(4,band));
  var q,ans,unit,why,hint,title,tol=0.01;
  if(B===1){
    if(r()<.4){
      var m=pick(MEAN),opts=[{t:m[2],ok:1}];WRONG.slice().sort(function(){return r()-.5}).slice(0,3).forEach(function(w){opts.push({t:w})});
      return {type:"mcq",q:"In the gold-foil experiment: <b>"+m[0]+"</b> What does that result tell you?",opts:opts,why:m[1],hint:"Ask what would have to be true inside the atom for that to happen.",skill:"chem.practice.foil",title:"Foil: what a result means",band:1};
    }
    var T=pick([2000,4000,5000,8000,10000,20000]),p=pick([2,3,4,5,8,10]),d=T*p/100,kind=pick(["through","bent"]);
    title="Foil: percent of a count";
    if(kind==="through"){q="Out of <b>"+fmt(T)+"</b> alpha particles, <b>"+fmt(d)+"</b> were bent by 10° or more. What percent went <b>straight through</b>?";ans=100-p;unit="%";why=fmt(T)+" − "+fmt(d)+" = "+fmt(T-d)+" went straight. "+fmt(T-d)+" ÷ "+fmt(T)+" × 100 = "+(100-p)+"%.";hint="Subtract the bent ones from the total first, then divide by the total and multiply by 100."}
    else{q="Out of <b>"+fmt(T)+"</b> alpha particles, <b>"+fmt(d)+"</b> were bent by 10° or more. What percent were <b>bent</b>?";ans=p;unit="%";why=fmt(d)+" ÷ "+fmt(T)+" × 100 = "+p+"%.";hint="Divide the bent count by the total, then multiply by 100."}
  }else if(B===2){
    var N=pick([2000,4000,5000,8000]),k=pick([2,3,4,5,6]),T2=N*k;
    if(r()<.5){title="Foil: expected rebounds";q="A foil bounces back <b>1 in "+fmt(N)+"</b> alpha particles. About how many bounce back out of <b>"+fmt(T2)+"</b>?";ans=k;unit="particles";why=fmt(T2)+" ÷ "+fmt(N)+" = "+k+".";hint="Divide the number fired by the N in “1 in N”."}
    else{title="Foil: 1 in N";q="In a run of <b>"+fmt(T2)+"</b> alpha particles, <b>"+k+"</b> bounced back. About 1 in how many bounced back?";ans=N;unit="(1 in N)";why=fmt(T2)+" ÷ "+k+" = "+fmt(N)+", so 1 in "+fmt(N)+".";hint="Divide the total fired by the number that bounced back."}
  }else if(B===3){
    var base=pick([4,5,6,8]),f=pick([2,3,4]),kind3=pick(["thick","thin","both"]);
    if(kind3==="thick"){title="Foil: thicker foil";q="A gold foil makes <b>"+base*25+"</b> sharp deflections in a run. The same run with a foil <b>"+f+" times as thick</b> would give about how many?";ans=base*25*f;unit="deflections";why="More layers means more chances to be deflected. "+base*25+" × "+f+" = "+base*25*f+".";hint="Deflections grow in proportion to the thickness."}
    else if(kind3==="thin"){var g=f*base*10;title="Foil: thinner foil";q="A gold foil makes <b>"+g+"</b> sharp deflections in a run. A foil only <b>1/"+f+" as thick</b> would give about how many?";ans=g/f;unit="deflections";why=g+" ÷ "+f+" = "+g/f+".";hint="Thinner foil has fewer layers, so fewer deflections in proportion."}
    else{var c=base*f;title="Foil: thickness and rebounds";q="With foil of thickness 1, <b>"+base+"</b> alpha particles bounce back in a run. How many would you expect with the foil <b>"+f+" times as thick</b>?";ans=c;unit="particles";why=base+" × "+f+" = "+c+".";hint="Rebounds also grow in proportion to the thickness."}
  }else{
    var z=pick([2,3,4]),b0=pick([6,8,10,12]),kind4=pick(["z","both","ratio"]);
    if(kind4==="z"){title="Foil: nuclear charge";q="Target Y gives <b>"+b0+"</b> sharp deflections. Target X has nuclei with <b>"+z+" times the positive charge</b> of Y (same thickness). About how many sharp deflections does X give?";ans=b0*z*z;unit="deflections";why="Deflections go as the charge squared: "+z+"² = "+z*z+". "+b0+" × "+z*z+" = "+b0*z*z+".";hint="Square the charge ratio before you multiply."}
    else if(kind4==="both"){title="Foil: charge and thickness";q="Target Y gives <b>"+b0+"</b> sharp deflections. Target X has <b>"+z+" times the nuclear charge</b> and its foil is <b>2 times as thick</b>. About how many does X give?";ans=b0*z*z*2;unit="deflections";why="Charge squared: "+z*z+". Thickness: 2. "+b0+" × "+z*z+" × 2 = "+b0*z*z*2+".";hint="Two multipliers: the charge ratio squared, and the thickness ratio."}
    else{var za=pick([[79,13],[79,47],[47,13]]);title="Foil: gold against a lighter atom";q="A nucleus of charge <b>"+za[0]+"</b> and one of charge <b>"+za[1]+"</b> are tested in foils of the same thickness. About how many times as many sharp deflections does the first give? (One decimal place.)";ans=Math.round(za[0]*za[0]/(za[1]*za[1])*10)/10;unit="times";why="("+za[0]+" ÷ "+za[1]+")² = "+ans+".";hint="Divide the charges, then square the result.";tol=0.15}
  }
  return {type:"num",q:q,ans:Math.round(ans*1000)/1000,tol:tol,unit:unit,why:why,hint:hint,skill:"chem.practice.foil",title:title,band:B};
}
  window.FoilPractice = { spec: spec };
})();
