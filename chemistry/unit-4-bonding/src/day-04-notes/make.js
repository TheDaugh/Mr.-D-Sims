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
 new TableRow({children:[cell([P([{bold:'Cornell Notes'}]),P(['Chemistry'],{size:20})],CUE,{shade:"D9D9D9"}),cell([P([{bold:'Topic: '},'Ionic Bonds and Ion Charges']),P([{bold:'Unit 4: '},'Trends, Bonding and Naming'],{size:20})],NOTE-2700),cell([P([{bold:'Name:'}]),P([{bold:'Date:'}])],2700)]}),
 new TableRow({children:[cell([P([{bold:'Essential question:'},' When a metal meets a nonmetal, what happens to their electrons, and what holds the atoms together afterward?'],{size:24})],W,{span:3})]})]});
const rowsMain=[
 row([P([{bold:'PART 1: IONS'}],{size:20,after:40}),cueQ('What happens when an atom gains or loses electrons?'),...cueT('Ion','an atom with a charge, because it gained or lost electrons',1),...cueT('Cation','a positive ion',1),...cueT('Anion','a negative ion',1)],[
  P(['An atom is neutral: its protons (+) equal its electrons (−). An ',{b:'ion'},' is an atom that has gained or lost ',{b:'electrons'},'. The number of protons never changes.']),
  strip([['','Protons','Electrons','Charge'],['Mg atom','12','12','0'],['Mg ion',{b:'12',w:3},{b:'10',w:3},{b:'2+',w:3}],['O atom','8','8','0'],['O ion',{b:'8',w:3},{b:'10',w:3},{b:'2−',w:3}]],1500),
  P(['An atom that ',{b:'loses'},' electrons has more protons than electrons, so it is a positive ',{b:'cation'},'. An atom that ',{b:'gains'},' electrons is a negative ',{b:'anion'},'.'],{bullet:true,before:80}),...chk('Sodium loses one electron. A student says it now has 10 protons. What is wrong with that?','Protons never change. Sodium still has 11 protons and now 10 electrons, so the ion is 1+.',2)]),
 row([P([{bold:'PART 2: ION CHARGES'}],{size:20,after:40}),cueQ('How can we predict an ion’s charge?'),...cueT('Ion charge','set by how many electrons an atom must lose or gain to reach an octet',2)],[
  P(['Atoms gain or lose electrons to reach an ',{b:'octet'},'. Metals lose their valence electrons. Nonmetals gain enough to make 8, so the charge is 8 minus the valence electrons, and it is ',{b:'negative'},'.']),
  strip([['Group','1','2','13','15','16','17','18'],['Valence electrons','1','2','3','5','6','7','8'],['Gains or loses?',{b:'loses',w:5},{b:'loses',w:5},{b:'loses',w:5},{b:'gains',w:5},{b:'gains',w:5},{b:'gains',w:5},{b:'neither',w:6}],['Ion charge',{b:'1+',w:4},{b:'2+',w:4},{b:'3+',w:4},{b:'3−',w:4},{b:'2−',w:4},{b:'1−',w:4},{b:'none',w:5}]],1500),
  P([{bold:'Example. '},'Magnesium is in group 2, so it has 2 valence electrons and ',{b:'loses'},' 2: the ion is Mg',{b:'2+',w:4},'. Oxygen is in group 16, so it has 6 and ',{b:'gains'},' 2: the ion is O',{b:'2−',w:4},'.'],{before:80}),...chk('A student writes the oxygen ion as O²⁺. What is wrong with that?','Oxygen gains electrons, so it has more electrons than protons: the charge is negative, O²⁻.',2)]),
 row([P([{bold:'PART 3: THE IONIC BOND'}],{size:20,after:40}),cueQ('What is an ionic bond?'),...cueT('Ionic bond','the attraction between a positive ion and a negative ion',2)],[
  img(KEY?'ionic.png':'ionic_blank.png',400,194),
  P(['In an ionic bond, electrons move from the ',{b:'metal'},' to the ',{b:'nonmetal'},'. Each atom becomes an ion, and opposite charges ',{b:'attract'},'.'],{bullet:true}),
  P(['The brackets show an ion. A metal ion has ',{b:'no'},' dots left, because it lost its valence electrons. A nonmetal ion has ',{b:'8'},' dots.'],{bullet:true}),...chk('A student draws the electron moving from fluorine to lithium. Which way should it move, and why?','From lithium to fluorine: lithium has 1 valence electron to give, and fluorine is one electron short of an octet.',2)]),
 row([P([{bold:'PART 4: NAMING IONS'}],{size:20,after:40}),cueQ('What do we call each ion?'),...cueT('-ide ending','the ending of an anion’s name',1)],[
  P(['A cation keeps the name of its element: Mg²⁺ is the ',{b:'magnesium'},' ion. An anion changes its ending to ',{b:'-ide'},': Cl⁻ is the chloride ion.']),
  strip([['Atom','oxygen','nitrogen','sulfur','bromine','fluorine'],['Anion',{b:'oxide',w:8},{b:'nitride',w:8},{b:'sulfide',w:8},{b:'bromide',w:8},{b:'fluoride',w:8}]],1100),...chk('A student calls the ion made from iodine “iodine ion.” What is the correct name, and why?','Iodide: an anion’s name ends in -ide.',1)]),
 row([P([{bold:'EXIT CHECK'}],{size:20,after:40}),cueQ('Show what you know')],[
  P(['Give the symbol of the ion each atom forms: lithium, aluminum, chlorine.'],{num:'n1'}),
  ...(KEY?[P([{key:'Li⁺, Al³⁺, Cl⁻'}])]:gap(1)),
  P(['Use Lewis dot symbols to show calcium and oxygen forming ions. Label the cation and the anion.'],{num:'n1'}),
  ...(KEY?[P([{key:'Ca (two single dots) gives both to O. [Ca]²⁺ is the cation; [O with 8 dots]²⁻ is the anion.'}])]:gap(3)),
  P(['Why does aluminum form Al³⁺ and not Al⁺?'],{num:'n1'}),
  ...(KEY?[P([{key:'Aluminum has 3 valence electrons. It loses all 3 to reach a full outer level.'}])]:gap(1)),
  P([{bold:'Summary. '},'Answer the essential question in two or three sentences. Use the words “electrons” and “opposite.”'],{before:120,after:40}),
  ...(KEY?[P([{key:'Electrons move from the metal to the nonmetal, so the metal becomes a positive ion and the nonmetal a negative ion. Opposite charges attract, and that attraction is the ionic bond.'}])]:gap(2))]),
];
const body=new Table({width:{size:W,type:WidthType.DXA},columnWidths:[CUE,NOTE],rows:rowsMain});
const doc=new Document({numbering:{config:[{reference:"b",levels:[{level:0,format:LevelFormat.BULLET,text:"•",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:360,hanging:240}}}}]},
 {reference:"n1",levels:[{level:0,format:LevelFormat.LOWER_LETTER,text:"%1.",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:360,hanging:280}}}}]}]},
 styles:{default:{document:{run:{font:F,size:22}}}},
 sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:720,bottom:720,left:720,right:720}}},
 children:[...(KEY?[P([{bold:'KEY'}],{size:24})]:[]),header,new Paragraph({children:[],spacing:{after:80}}),body]}]});
Packer.toBuffer(doc).then(b=>fs.writeFileSync(KEY?'Unit4_Day4_Ionic_Key.docx':'Unit4_Day4_Ionic_Notes.docx',b));
