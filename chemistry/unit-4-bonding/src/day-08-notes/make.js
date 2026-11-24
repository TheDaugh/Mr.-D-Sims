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
 new TableRow({children:[cell([P([{bold:'Cornell Notes'}]),P(['Chemistry'],{size:20})],CUE,{shade:"D9D9D9"}),cell([P([{bold:'Topic: '},'Naming Molecules and Bond Types']),P([{bold:'Unit 4: '},'Trends, Bonding and Naming'],{size:20})],NOTE-2700),cell([P([{bold:'Name:'}]),P([{bold:'Date:'}])],2700)]}),
 new TableRow({children:[cell([P([{bold:'Essential question:'},' How do we name a molecular compound, and how do the elements in a substance tell us which kind of bond holds it together?'],{size:24})],W,{span:3})]})]});
const rowsMain=[
 row([P([{bold:'PART 1: PREFIXES'}],{size:20,after:40}),cueQ('How do we name a molecular compound?'),...cueT('Molecular compound','a compound made only of nonmetals',1),...cueT('Prefix','the start of a name that tells how many atoms',2)],[
  P(['Name the first element by its element name and the second with the ',{b:'-ide'},' ending. A ',{b:'prefix'},' before each name says how many atoms. Leave ',{b:'mono-'},' off the ',{b:'first'},' element.']),
  strip([['Prefix','mono-','di-','tri-','tetra-','penta-'],['Atoms',{b:'1',w:3},{b:'2',w:3},{b:'3',w:3},{b:'4',w:3},{b:'5',w:3}]],1100),
  P([{bold:'Examples. '},'NF₃ is nitrogen ',{b:'tri'},'fluoride. N₂O is ',{b:'di'},'nitrogen ',{b:'mon'},'oxide.'],{before:80}),
  ...chk('A student names SO₃ “monosulfur trioxide.” What is wrong with that?','Mono- is never used on the first element. The name is sulfur trioxide.',2)]),
 row([P([{bold:'PART 2: NAME AND FORMULA'}],{size:20,after:40}),cueQ('How do we go between names and formulas?')],[
  P(['A prefix gives the ',{b:'subscript'},' of the element right after it. A missing prefix on the first element means ',{b:'1'},'.']),
  strip([['Formula','CS₂','Cl₂O','PCl₅','SiF₄'],['Name',{b:'carbon disulfide',w:14},{b:'dichlorine monoxide',w:17},{b:'phosphorus pentachloride',w:21},{b:'silicon tetrafluoride',w:18}]],1100),
  strip([['Name','dinitrogen trioxide','sulfur dichloride'],['Formula',{b:'N₂O₃',w:7},{b:'SCl₂',w:7}]],1700),
  ...chk('A student writes the formula for dinitrogen trioxide as N₃O₂. What is wrong with that?','The prefix goes with the element after it: di- is on nitrogen (N₂) and tri- is on oxygen (O₃).',2)]),
 row([P([{bold:'PART 3: THREE KINDS OF BONDS'}],{size:20,after:40}),cueQ('How do the elements tell us the bond?'),...cueT('Metallic bond','the attraction that holds the atoms of a metal together',2)],[
  P(['Look at what the substance is made of.']),
  strip([['Made of','Bond','Electrons'],['metal + nonmetal',{b:'ionic',w:6},{b:'move',w:5}],['nonmetal + nonmetal',{b:'covalent',w:9},{b:'are shared',w:10}],['metal only',{b:'metallic',w:9},{b:'move freely',w:11}]],1500),
  strip([['Substance','LiBr','NH₃','Zn','SrCl₂','Al'],['Bond',{b:'ionic',w:6},{b:'covalent',w:9},{b:'metallic',w:9},{b:'ionic',w:6},{b:'metallic',w:9}]],1100),
  ...chk('A student says H₂S is ionic because it contains sulfur. What is wrong with that?','Hydrogen and sulfur are both nonmetals, so the bond is covalent.',1)]),
 row([P([{bold:'PART 4: SEA OF ELECTRONS'}],{size:20,after:40}),cueQ('Why do metals conduct and bend?'),...cueT('Sea of electrons','the valence electrons of a metal, free to move through all of it',2)],[
  P(['In a metal, each atom gives up its valence electrons to a shared ',{b:'sea'},'. The atoms are left as positive ions. Draw the electrons between the ions.']),
  img(KEY?'sea.png':'sea_blank.png',300,110),
  P(['The electrons are free to ',{b:'move'},', so a metal carries current. The ions can slide past each other and the sea stays around them, so a metal ',{b:'bends'},' without breaking.'],{bullet:true}),
  ...chk('A student says aluminum foil carries current because its atoms flow along the foil. What is wrong?','The atoms stay in place. The free electrons in the sea are what move.',1)]),
 row([P([{bold:'EXIT CHECK'}],{size:20,after:40}),cueQ('Show what you know')],[
  P(['Name NI₃. Write the formula for oxygen difluoride.'],{num:'n1'}),
  ...(KEY?[P([{key:'nitrogen triiodide; OF₂'}])]:gap(1)),
  P(['Classify the bond in each: Mg, HI, KF.'],{num:'n1'}),
  ...(KEY?[P([{key:'Mg metallic; HI covalent; KF ionic'}])]:gap(1)),
  P(['Why can a metal be bent without breaking?'],{num:'n1'}),
  ...(KEY?[P([{key:'The ions slide past each other and the sea of electrons stays around them.'}])]:gap(2)),
  P([{bold:'Summary. '},'Answer the essential question in two or three sentences. Use the words “prefix” and “sea.”'],{before:120,after:40}),
  ...(KEY?[P([{key:'A molecular compound is named with prefixes for the number of atoms. Metal plus nonmetal is ionic, two nonmetals is covalent, and a metal alone is metallic, with a sea of electrons.'}])]:gap(2))]),
];
const body=new Table({width:{size:W,type:WidthType.DXA},columnWidths:[CUE,NOTE],rows:rowsMain});
const doc=new Document({numbering:{config:[{reference:"b",levels:[{level:0,format:LevelFormat.BULLET,text:"•",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:360,hanging:240}}}}]},
 {reference:"n1",levels:[{level:0,format:LevelFormat.LOWER_LETTER,text:"%1.",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:360,hanging:280}}}}]}]},
 styles:{default:{document:{run:{font:F,size:22}}}},
 sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:720,bottom:720,left:720,right:720}}},
 children:[...(KEY?[P([{bold:'KEY'}],{size:24})]:[]),header,new Paragraph({children:[],spacing:{after:80}}),body]}]});
Packer.toBuffer(doc).then(b=>fs.writeFileSync(KEY?'Unit4_Day8_Naming_Key.docx':'Unit4_Day8_Naming_Notes.docx',b));
