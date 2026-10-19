/* ChemPractice: endless mass-ratio problems for the Atom Discovery unit (water, peroxide, nitrogen oxides).
   One generator serves the lesson's "Keep practicing" step and the review portal, so a fix here fixes both.
     ChemPractice.spec(n, band, seed)  ->  { type:"num", q, ans, tol, unit, why, hint, skill, title, band }
   n is the problem number, band 1 to 4 is the level, seed is any string (the lesson uses name|period so each student gets their own numbers).
   Bands: 1 water, one step. 2 water with a limiting gas. 3 peroxide against water. 4 nitrogen oxides. */
(function () {
function seeded(seed){let x=2166136261;seed=String(seed);for(let i=0;i<seed.length;i++){x^=seed.charCodeAt(i);x=Math.imul(x,16777619)}let a=x>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function spec(n,band,seed){
  const r=seeded(seed+"|"+n+"|"+band),pick=a=>a[Math.floor(r()*a.length)],B=Math.max(1,Math.min(4,band));
  let q,ans,unit,why,hint,title;
  if(B===1){
    if(r()<.65){const k=pick([2,3,4,5,6,7,9]);title="Water: oxygen needed";q=`Water always uses 8 g of oxygen for every 1 g of hydrogen. How many grams of oxygen combine completely with <b>${k} g</b> of hydrogen?`;ans=8*k;unit="g O";why=`${k} × 8 = ${8*k} g of oxygen.`;hint="Multiply the grams of hydrogen by 8."}
    else{const j=pick([2,3,4,5,6,7]);title="Water: hydrogen needed";q=`How many grams of hydrogen combine completely with <b>${8*j} g</b> of oxygen to make water?`;ans=j;unit="g H";why=`${8*j} ÷ 8 = ${j} g of hydrogen.`;hint="Every 8 g of oxygen goes with 1 g of hydrogen. How many 8 g groups are there?"}
  }else if(B===2){
    const k=pick([2,3,4,5,6,8]),extra=pick([1,2,3,4,5,6,7,8,9,10,12]),lowO=r()<.5,m=lowO?8*pick(Array.from({length:k-1},(_,i)=>i+1)):8*k+extra,type=pick(["water","left"]);
    title=type==="water"?"Water: limiting gas":"Water: leftover gas";
    if(type==="water"){q=`You spark <b>${k} g</b> of hydrogen with <b>${m} g</b> of oxygen. How many grams of water form?`;ans=9*Math.min(k,m/8);unit="g water";why=`Hydrogen could use ${8*k} g of oxygen and you have ${m} g, so ${m<8*k?"oxygen":"hydrogen"} runs out first. Water = 9 × ${m<8*k?m/8:k} = ${ans} g (the reacting H plus 8 times as much O).`;hint="Find how much oxygen the hydrogen could use (× 8). The gas that runs out first decides how much water forms."}
    else{q=`You spark <b>${k} g</b> of hydrogen with <b>${m} g</b> of oxygen. How many grams of the gas that is <b>left over</b> remain?`;ans=m>8*k?m-8*k:k-m/8;unit="g left";why=m>8*k?`Hydrogen uses only ${8*k} g of the ${m} g of oxygen, so ${m-8*k} g of oxygen is left.`:`Oxygen can only combine with ${m/8} g of the ${k} g of hydrogen, so ${k-m/8} g of hydrogen is left.`;hint="Find how much of each gas gets used. The other one has some left."}
  }else if(B===3){
    const k=pick([2,3,4,5,6]),kind=pick(["pero","diff","both"]);
    if(kind==="pero"){title="Peroxide: oxygen used";q=`Hydrogen peroxide uses 16 g of oxygen for every 1 g of hydrogen. How many grams of oxygen combine with <b>${k} g</b> of hydrogen to make peroxide?`;ans=16*k;unit="g O";why=`${k} × 16 = ${16*k} g.`;hint="Multiply the grams of hydrogen by 16."}
    else if(kind==="diff"){title="Water against peroxide";q=`The same <b>${k} g</b> of hydrogen is turned into water in one flask and into peroxide in another. How many <b>more</b> grams of oxygen does the peroxide flask use?`;ans=8*k;unit="g O";why=`Water uses ${8*k} g of oxygen; peroxide uses ${16*k} g. The difference is ${8*k} g, one more “portion” of oxygen.`;hint="Oxygen for water is 8 × the hydrogen mass. Oxygen for peroxide is 16 × the hydrogen mass. Subtract."}
    else{title="Peroxide: mass formed";q=`How many grams of hydrogen peroxide form when <b>${k} g</b> of hydrogen combines completely with oxygen? (Peroxide is 16 g of oxygen per 1 g of hydrogen.)`;ans=17*k;unit="g peroxide";why=`${16*k} g of oxygen plus ${k} g of hydrogen is ${17*k} g.`;hint="Add the hydrogen mass to the oxygen mass it combines with."}
  }else{
    const a=pick([8,16]),mult=pick([2,3,4]),b=a*mult,kind=pick(["ratio","more"]);
    if(kind==="ratio"){title="Nitrogen oxides: ratio";q=`Two oxides of nitrogen are measured. Oxide P has <b>${a} g</b> of oxygen per 14 g of nitrogen. Oxide Q has <b>${b} g</b> of oxygen per 14 g of nitrogen. Divide Q’s oxygen by P’s. What is the ratio?`;ans=mult;unit="× P’s oxygen";why=`${b} ÷ ${a} = ${mult}, a small whole number, as the Law of Multiple Proportions says.`;hint=`${b} ÷ ${a}.`}
    else{title="Nitrogen oxides: scaling up";q=`Oxide P has <b>${a} g</b> of oxygen per 14 g of nitrogen. How many grams of oxygen combine with <b>${14*mult} g</b> of nitrogen to make oxide P?`;ans=a*mult;unit="g O";why=`${14*mult} g is ${mult} lots of 14 g of nitrogen, so ${mult} × ${a} = ${a*mult} g of oxygen.`;hint="How many lots of 14 g of nitrogen are there? Multiply the oxygen by that."}
  }
  return {type:"num",q,ans:Math.round(ans*1000)/1000,tol:0.01,unit,why,hint,skill:"chem.practice."+(B<3?"water":B===3?"peroxide":"nitrogen-oxides"),title,band:B};
}
  window.ChemPractice = { spec: spec };
})();
