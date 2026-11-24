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
// a one-row-per-line strip table: rows of cells; a cell is a string (printed), {b:'ans',w:n} (blank / red in key)
function strip(rows,labelW,boldFirstCol=true){
 const n=rows[0].length-1, cw=Math.floor((NOTE-240-labelW)/n);
 const widths=[labelW,...Array(n).fill(cw)];
 return new Table({width:{size:labelW+cw*n,type:WidthType.DXA},columnWidths:widths,rows:rows.map((r,ri)=>new TableRow({cantSplit:true,children:r.map((c,ci)=>new TableCell({width:{size:widths[ci],type:WidthType.DXA},borders,margins:{left:60,right:60,top:40,bottom:40},shading:ri===0?{type:ShadingType.CLEAR,fill:"F2F2F2",color:"auto"}:undefined,children:[new Paragraph({alignment:ci===0?AlignmentType.LEFT:AlignmentType.CENTER,children:runs(ci===0&&boldFirstCol?[{bold:c}]:[].concat(c))})]}))}))});
}

// a check question at the foot of a part: thin rule above, numbered, small answer space
let QN=0;
const chk=(q,ans,lines=1)=>{QN++;return [new Paragraph({border:{top:{style:BorderStyle.SINGLE,size:4,color:"999999",space:4}},spacing:{before:120,after:40},children:runs([{bold:QN+'. '},q])}),...(KEY?[P([{key:ans}],{size:20})]:gap(lines))];};
const header=new Table({width:{size:W,type:WidthType.DXA},columnWidths:[CUE,NOTE-2700,2700],rows:[
 new TableRow({children:[cell([P([{bold:'Cornell Notes'}]),P(['Chemistry'],{size:20})],CUE,{shade:"D9D9D9"}),cell([P([{bold:'Topic: '},'Covalent Bonds and Lewis Structures']),P([{bold:'Unit 4: '},'Trends, Bonding and Naming'],{size:20})],NOTE-2700),cell([P([{bold:'Name:'}]),P([{bold:'Date:'}])],2700)]}),
 new TableRow({children:[cell([P([{bold:'Essential question:'},' How do nonmetal atoms share electrons to complete their outer levels, and how do we draw it?'],{size:24})],W,{span:3})]})]});
const rowsMain=[
 row([P([{bold:'PART 1: SHARING'}],{size:20,after:40}),cueQ('What happens when two nonmetals meet?'),...cueT('Covalent bond','a pair of electrons shared by two atoms',2),...cueT('Molecule','atoms joined by covalent bonds',1)],[
  P(['Two nonmetals both pull hard on electrons, so neither can take one from the other. They ',{b:'share'},'. Each shared pair is a ',{b:'covalent bond'},', and the atoms it joins make a ',{b:'molecule'},'.']),
  strip([['','Ionic','Covalent'],['Made of','metal + nonmetal','nonmetal + nonmetal'],['Electrons',{b:'move',w:5},{b:'are shared',w:10}],['Particles',{b:'ions',w:4},{b:'molecules',w:9}]],1500),
  ...chk('A student says lithium and fluorine share a pair of electrons because both want one. What is wrong with that?','Lithium is a metal. It gives its electron to fluorine, so they form ions and an ionic bond, not a shared pair.',2)]),
 row([P([{bold:'PART 2: THE SHARED PAIR'}],{size:20,after:40}),cueQ('How do we draw a shared pair?'),...cueT('Bonding pair','a pair of electrons shared by two atoms',1),...cueT('Lone pair','a pair of valence electrons that is not shared',1)],[
  P(['Each atom puts one of its ',{b:'unpaired'},' dots into the shared pair. Hydrogen has one unpaired dot, so two hydrogens share one pair and each has 2 electrons, a full outer level. Chlorine has one unpaired dot, so it shares one pair with hydrogen. The other six dots stay as ',{b:'lone pairs'},'.']),
  img(KEY?'share.png':'share_blank.png',340,164),
  ...chk('A student draws HCl with only the shared pair and no other dots on chlorine. What is missing?','Chlorine still has 7 valence electrons. Besides the shared pair it keeps three lone pairs, so it has 8 around it.',2)]),
 row([P([{bold:'PART 3: MORE BONDS'}],{size:20,after:40}),cueQ('How many bonds does an atom make?'),...cueT('Lewis structure','a diagram of a molecule showing every bonding pair and lone pair',2)],[
  P(['An atom makes as many bonds as it has ',{b:'unpaired'},' electrons. Oxygen has 2, nitrogen has 3 and carbon has 4. Each bond is a shared pair with one hydrogen. Draw the Lewis structure of each molecule.']),
  img(KEY?'three.png':'three_blank.png',360,132),
  P(['Water: H₂O      Ammonia: NH₃      Methane: CH₄'],{size:20}),
  ...chk('A student draws H₂S with sulfur bonded to two hydrogens and no other dots. How many lone pairs does sulfur have?','Sulfur is in group 16 like oxygen: 2 bonds and 2 lone pairs.',2)]),
 row([P([{bold:'PART 4: DOUBLE AND TRIPLE'}],{size:20,after:40}),cueQ('What if one shared pair is not enough?'),...cueT('Double bond','two shared pairs',1),...cueT('Triple bond','three shared pairs',1)],[
  P(['An atom with 2 unpaired electrons can share two pairs with the same atom, and an atom with 3 can share three. Each line below stands for one shared pair.']),
  img('multi.png',380,101),
  strip([['Molecule','O₂','N₂','CO₂ (each C–O)'],['Shared pairs',{b:'2',w:3},{b:'3',w:3},{b:'2',w:3}],['Kind of bond',{b:'double',w:7},{b:'triple',w:7},{b:'double',w:7}]],1500),
  ...chk('A student says the bond in N₂ is a double bond. What is wrong with that?','Each nitrogen has 3 unpaired electrons, so they share 3 pairs: a triple bond.',1)]),
 row([P([{bold:'EXIT CHECK'}],{size:20,after:40}),cueQ('Show what you know')],[
  P(['Draw the Lewis structure of PH₃ (phosphorus is the central atom).'],{num:'n1'}),
  ...(KEY?[P([{key:'P with three H, one lone pair on P, each H sharing a pair with P.'}])]:gap(2)),
  P(['How many lone pairs does the oxygen in water have? How many does carbon in methane have?'],{num:'n1'}),
  ...(KEY?[P([{key:'Oxygen: 2. Carbon: 0.'}])]:gap(1)),
  P(['How many pairs of electrons do two nitrogen atoms share, and what is the bond called?'],{num:'n1'}),
  ...(KEY?[P([{key:'3 pairs: a triple bond.'}])]:gap(1)),
  P([{bold:'Summary. '},'Answer the essential question in two or three sentences. Use the words “share” and “unpaired.”'],{before:120,after:40}),
  ...(KEY?[P([{key:'Nonmetals share electrons. Each atom puts its unpaired electrons into shared pairs until every atom has a full outer level; we draw the shared pairs and the lone pairs.'}])]:gap(2))]),
];
const body=new Table({width:{size:W,type:WidthType.DXA},columnWidths:[CUE,NOTE],rows:rowsMain});
const doc=new Document({numbering:{config:[{reference:"b",levels:[{level:0,format:LevelFormat.BULLET,text:"•",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:360,hanging:240}}}}]},
 {reference:"n1",levels:[{level:0,format:LevelFormat.LOWER_LETTER,text:"%1.",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:360,hanging:280}}}}]}]},
 styles:{default:{document:{run:{font:F,size:22}}}},
 sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:720,bottom:720,left:720,right:720}}},
 children:[...(KEY?[P([{bold:'KEY'}],{size:24})]:[]),header,new Paragraph({children:[],spacing:{after:80}}),body]}]});
Packer.toBuffer(doc).then(b=>fs.writeFileSync(KEY?'Unit4_Day7_Covalent_Key.docx':'Unit4_Day7_Covalent_Notes.docx',b));
