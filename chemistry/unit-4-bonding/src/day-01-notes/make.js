const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,BorderStyle,ImageRun,AlignmentType,ShadingType,VerticalAlign,LevelFormat}=require('docx');
const KEY=process.argv[2]==='key';
const F="Calibri";
const W=10800, CUE=2700, NOTE=W-CUE;
const line={style:BorderStyle.SINGLE,size:6,color:"000000"};
const borders={top:line,bottom:line,left:line,right:line};
// rich text: string parts; {b:'ans', w:n} blank; {i:'x'} italic; {sub:'1'}; {sup:'+'}; {bold:'x'}
function runs(parts,size=22){const out=[];for(const p of [].concat(parts)){
 if(typeof p==='string')out.push(new TextRun({text:p,font:F,size}));
 else if(p.b!==undefined){ if(KEY) out.push(new TextRun({text:' '+p.b+' ',font:F,size,bold:true,color:"C00000",underline:{}}));
   else out.push(new TextRun({text:'_'.repeat(p.w||Math.max(8,Math.round(p.b.length*1.6))),font:F,size}));}
 else if(p.bold)out.push(new TextRun({text:p.bold,font:F,size,bold:true}));
 else if(p.i)out.push(new TextRun({text:p.i,font:F,size,italics:true}));
 else if(p.sub)out.push(new TextRun({text:p.sub,font:F,size,subScript:true}));
 else if(p.sup)out.push(new TextRun({text:p.sup,font:F,size,superScript:true}));
 else if(p.key)out.push(new TextRun({text:KEY?p.key:'',font:F,size,italics:true,color:"C00000"}));
 } return out;}
const P=(parts,o={})=>new Paragraph({children:runs(parts,o.size),spacing:{after:o.after??80,before:o.before??0},alignment:o.align,numbering:o.bullet?{reference:"b",level:0}:o.num?{reference:o.num,level:0}:undefined,keepNext:o.keepNext});
const H=(t)=>new Paragraph({children:[new TextRun({text:t,font:F,size:24,bold:true})],spacing:{after:80}});
const gap=(n=1)=>Array.from({length:n},()=>new Paragraph({children:[new TextRun({text:'',font:F})],spacing:{after:110}}));
const img=(f,w,h)=>new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:80},children:[new ImageRun({type:'png',data:fs.readFileSync(f),transformation:{width:w,height:h}})]});
const cell=(children,w,o={})=>new TableCell({children,width:{size:w,type:WidthType.DXA},borders,margins:{top:80,bottom:80,left:120,right:120},shading:o.shade?{type:ShadingType.CLEAR,fill:o.shade,color:"auto"}:undefined,columnSpan:o.span,verticalAlign:o.va});
// cue: question or term with dash, space to write
const cueQ=(t)=>P([{bold:t}],{after:120});
const cueT=(t,def,lines=2)=>[P([{bold:t+' –'}],{after:40}), ...(KEY?[P([{key:def}],{after:160,size:20})]:gap(lines))];
const row=(cue,notes)=>new TableRow({cantSplit:true,children:[cell(cue,CUE),cell(notes,NOTE)]});
const band=(t)=>new TableRow({cantSplit:true,children:[cell([new Paragraph({children:[new TextRun({text:t,font:F,size:24,bold:true})]})],W,{span:2,shade:"D9D9D9"})]});
const full=(children)=>new TableRow({cantSplit:true,children:[cell(children,W,{span:2})]});
// small data table
function ietable(rows,ansRatios,given){ // rows: [n, IE, ratio]
 const cw=[900,2000,2000];const hdr=['n','IE (kJ/mol)','ratio to previous'];
 const mk=(t,w,bold)=>new TableCell({width:{size:w,type:WidthType.DXA},borders,margins:{left:100,right:100},children:[new Paragraph({alignment:AlignmentType.CENTER,children:runs([bold?{bold:t}:t])})]});
 return new Table({width:{size:4900,type:WidthType.DXA},columnWidths:cw,rows:[new TableRow({children:hdr.map((h,i)=>mk(h,cw[i],true))}),
  ...rows.map((r,i)=>new TableRow({children:[mk(String(r[0]),cw[0]),mk(r[1],cw[1]),
    new TableCell({width:{size:cw[2],type:WidthType.DXA},borders,children:[new Paragraph({alignment:AlignmentType.CENTER,children:runs(i===0?['']:(given&&given.includes(i)?[r[2]]:[{b:r[2],w:8}]))})]})]}))]});}


// a check question at the foot of a part: thin rule above, numbered, small answer space
let QN=0;
const chk=(q,ans,lines=1)=>{QN++;return [new Paragraph({border:{top:{style:BorderStyle.SINGLE,size:4,color:"999999",space:4}},spacing:{before:120,after:40},children:runs([{bold:QN+'. '},q])}),...(KEY?[P([{key:ans}],{size:20})]:gap(lines))];};
const header=new Table({width:{size:W,type:WidthType.DXA},columnWidths:[CUE,NOTE-2700,2700],rows:[
 new TableRow({children:[cell([P([{bold:'Cornell Notes'}]),P(['Chemistry'],{size:20})],CUE,{shade:"D9D9D9"}),cell([P([{bold:'Topic: '},'Periodic Trends']),P([{bold:'Unit 4: '},'Trends, Bonding and Naming'],{size:20})],NOTE-2700),cell([P([{bold:'Name:'}]),P([{bold:'Date:'}])],2700)]}),
 new TableRow({children:[cell([P([{bold:'Essential question:'},' Why are the atoms at the bottom left of the table big and reactive, and the ones at the top right small and grabby?'],{size:24})],W,{span:3})]})]});
const rowsMain=[
 row([P([{bold:'PART 1: TWO BIG IDEAS'}],{size:20,after:40}),cueQ('What is a periodic trend?'),...cueT('Period','a row; same number of shells',2),...cueT('Group','a column; same number of valence electrons',2)],[
  P(['A trend is a pattern that changes steadily across a ',{b:'period'},' or down a ',{b:'group'},'.']),
  img(KEY?'pt_size.png':'pt_blank.png',270,159),
  P([{bold:'Idea 1. '},'Going down a group, each atom adds a new ',{b:'shell'},', so the outer electrons are ',{b:'farther'},' from the nucleus.'],{bullet:true}),
  P([{bold:'Idea 2. '},'Going across a period, each atom adds one more ',{b:'proton'},' but keeps the same ',{b:'shell'},', so the nucleus pulls the outer electrons ',{b:'harder'},'.'],{bullet:true}),...chk('Sodium and chlorine are both in period 3. Which one has more protons pulling on its outer shell?','Chlorine (17 protons to sodium\u2019s 11), on the same shell.')]),
 row([P([{bold:'PART 2: ATOMIC SIZE'}],{size:20,after:40}),cueQ('How does the size of an atom change?'),...cueT('Atomic radius','the distance from the nucleus to the outer edge of the atom')],[
  img('sizes.png',400,200),
  P(['Down a group, atoms get ',{b:'bigger'},' because they have more ',{b:'shells'},'.'],{bullet:true}),
  P(['Across a period, atoms get ',{b:'smaller'},' because more ',{b:'protons'},' pull the same shell in closer.'],{bullet:true}),
  P([{bold:'Example. '},'Which is larger, potassium or bromine? Both are in period 4, so they have the same number of shells. Bromine has more protons pulling inward, so ',{b:'potassium'},' is larger.'],{before:80}),...chk('A student says chlorine is bigger than sodium because it has more electrons. What is wrong with that?','Chlorine\u2019s extra electrons are on the same shell, and its extra protons pull that shell in, so chlorine is smaller.',2)]),
 row([P([{bold:'PART 3: REACTIVITY'}],{size:20,after:40}),cueQ('Which atoms react most easily?'),...cueT('Reactivity','how easily an atom reacts (gives up or takes electrons)')],[
  new Table({width:{size:NOTE-240,type:WidthType.DXA},columnWidths:[2300,(NOTE-240-2300)/2,(NOTE-240-2300)/2],rows:[
   ['','Metals','Nonmetals'],
   ['React by…',{b:'losing'},{b:'gaining'}],
   ['Easier when the outer electron is…',{b:'far from'},' the nucleus',{b:'close to'}],
   ['Most reactive corner',{b:'bottom left'},{b:'top right'}],
   ['Most reactive element (of these)',{b:'cesium'},{b:'fluorine'}]].map((r,ri)=>new TableRow({children:(r.length===3?r:[r[0],[r[1],r[2]],r[3]]).map((c,ci)=>new TableCell({width:{size:ci===0?2300:(NOTE-240-2300)/2,type:WidthType.DXA},borders,margins:{left:100,right:100,top:40,bottom:40},shading:ri===0?{type:ShadingType.CLEAR,fill:"F2F2F2",color:"auto"}:undefined,children:[new Paragraph({children:runs(ri===0||ci===0?[{bold:c}]:[].concat(c))})]}))}))}),
  P(['Noble gases are the exception: their outer shell is already ',{b:'full'},', so they hardly react at all.'],{before:100}),
  P([{bold:'Example. '},'Which is more reactive, sodium or potassium? Potassium’s outer electron is one shell ',{b:'farther'},' out, so it is lost more easily: ',{b:'potassium'},'.'],{before:60}),...chk('Neon is at the top right. Why is it not the most reactive nonmetal?','Its outer shell is already full, so it has no reason to gain an electron.')]),
 row([P([{bold:'PART 4: ELECTRONEGATIVITY'}],{size:20,after:40}),cueQ('Which atoms pull hardest on shared electrons?'),...cueT('Electronegativity','how strongly an atom pulls shared electrons in a bond')],[
  img(KEY?'pt_en.png':'pt_blank.png',220,130),
  P(['Electronegativity ',{b:'increases'},' across a period and ',{b:'decreases'},' down a group.'],{bullet:true}),
  P(['The most electronegative element is ',{b:'fluorine'},', at the top right.'],{bullet:true}),
  P(['Noble gases are usually left out because they rarely ',{b:'bond'},'.'],{bullet:true}),
  P([{bold:'Why it matters: '},'next lesson, a big difference in electronegativity means one atom ',{b:'takes'},' the electron (ionic). A small difference means the atoms ',{b:'share'},' it (covalent).'],{before:60}),
  P([{bold:'Example. '},'Rank Cl, Na and P from least to most electronegative: all in period 3, so left to right: ',{b:'Na, P, Cl',w:14},'.'],{before:60}),...chk('Which pulls harder on shared electrons, bromine or fluorine? Why?','Fluorine: same group, fewer shells, so its nucleus is closer to the shared electrons.')]),
 row([P([{bold:'EXIT CHECK'}],{size:20,after:40}),cueQ('Show what you know')],[
  P(['Circle the larger atom: (a) Mg   Ba      (b) N   Li'],{num:'n1'}),
  ...(KEY?[P([{key:'(a) Ba: more shells. (b) Li: same period, fewer protons.'}])]:gap(1)),
  P(['Rank from least to most electronegative: O, Li, C'],{num:'n1'}),
  ...(KEY?[P([{key:'Li, C, O'}])]:gap(1)),
  P(['Which is more reactive, calcium or magnesium? Explain in one sentence.'],{num:'n1'}),
  ...(KEY?[P([{key:'Calcium: its outer electrons are one shell farther out, so they are lost more easily.'}])]:gap(1)),
  P([{bold:'Summary. '},'Answer the essential question in two or three sentences. Use the words \u201cshell\u201d and \u201cproton.\u201d'],{before:120,after:40}),
  ...(KEY?[P([{key:'Atoms at the bottom left have the most shells and the fewest protons pulling on them, so they are big and lose electrons easily. Atoms at the top right have few shells and many protons on the same shell, so they are small and pull hard on electrons.'}])]:gap(2))]),
];
const body=new Table({width:{size:W,type:WidthType.DXA},columnWidths:[CUE,NOTE],rows:rowsMain});
const doc=new Document({numbering:{config:[{reference:"b",levels:[{level:0,format:LevelFormat.BULLET,text:"•",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:360,hanging:240}}}}]},
 {reference:"n1",levels:[{level:0,format:LevelFormat.LOWER_LETTER,text:"%1.",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:360,hanging:280}}}}]}]},
 styles:{default:{document:{run:{font:F,size:22}}}},
 sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:720,bottom:720,left:720,right:720}}},
 children:[...(KEY?[P([{bold:'KEY'}],{size:24})]:[]),header,new Paragraph({children:[],spacing:{after:80}}),body]}]});
Packer.toBuffer(doc).then(b=>fs.writeFileSync(KEY?'Unit4_Day1_Trends_Key.docx':'Unit4_Day1_Trends_Notes.docx',b));
