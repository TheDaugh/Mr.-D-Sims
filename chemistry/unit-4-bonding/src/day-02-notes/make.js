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
 new TableRow({children:[cell([P([{bold:'Cornell Notes'}]),P(['Chemistry'],{size:20})],CUE,{shade:"D9D9D9"}),cell([P([{bold:'Topic: '},'Why Atoms Bond and Lewis Dot Symbols']),P([{bold:'Unit 4: '},'Trends, Bonding and Naming'],{size:20})],NOTE-2700),cell([P([{bold:'Name:'}]),P([{bold:'Date:'}])],2700)]}),
 new TableRow({children:[cell([P([{bold:'Essential question:'},' Why do atoms bond, and what do the dots in a Lewis symbol show?'],{size:24})],W,{span:3})]})]});
const rowsMain=[
 row([P([{bold:'PART 1: VALENCE ELECTRONS'}],{size:20,after:40}),cueQ('Which electrons do the bonding?'),...cueT('Valence electron','an electron in the outermost shell of an atom',2)],[
  P(['The electrons in an atom’s outermost shell are its ',{b:'valence'},' electrons. Atoms in the same ',{b:'group'},' have the same number of them.']),
  strip([['Group','1','2','13','14','15','16','17','18'],['Period 3','Na','Mg','Al','Si','P','S','Cl','Ar'],['Valence electrons',{b:'1',w:2},{b:'2',w:2},{b:'3',w:2},{b:'4',w:2},{b:'5',w:2},{b:'6',w:2},{b:'7',w:2},{b:'8',w:2}]],1500),
  P(['For groups 13 to 18, subtract ',{b:'10'},' from the group number. Helium is the exception: it has only ',{b:'2'},'.'],{bullet:true,before:80}),
  P(['The period number is the number of ',{b:'shells'},', not the number of valence electrons.'],{bullet:true}),...chk('A student says sulfur has 3 valence electrons because it is in period 3. What is wrong with that?','Period 3 means 3 shells. Sulfur is in group 16, so it has 6 valence electrons.',2)]),
 row([P([{bold:'PART 2: THE OCTET RULE'}],{size:20,after:40}),cueQ('Why do atoms bond?'),...cueT('Octet rule','atoms bond to end up with 8 valence electrons, a full outer level (2 for H and He)',3)],[
  img(KEY?'octet.png':'octet_blank.png',440,158),
  P(['Noble gases already have a ',{b:'full'},' outer level: 8 valence electrons (helium has 2). That makes them very ',{b:'stable'},', so they hardly bond.'],{bullet:true}),
  P(['Every other atom bonds to get a full outer level. This is the ',{b:'octet'},' rule.'],{bullet:true}),
  P([{bold:'Example. '},'Sodium has 1 valence electron, so it ',{b:'loses'},' it and is left with a full level, like neon. Chlorine has 7, so it ',{b:'gains'},' 1 to make 8.'],{before:80}),...chk('Neon has 8 valence electrons and fluorine has 7. Why does fluorine bond but neon does not?','Neon’s outer level is already full. Fluorine is one electron short of an octet.',2)]),
 row([P([{bold:'PART 3: LEWIS DOT SYMBOLS'}],{size:20,after:40}),cueQ('How do we draw an atom’s valence electrons?'),...cueT('Lewis dot symbol','the element’s symbol with one dot for each valence electron',2)],[
  P(['A Lewis dot symbol shows only the ',{b:'valence'},' electrons. The symbol stands for the nucleus and the inner electrons.']),
  P(['Put one dot on each of the four sides (top, right, bottom, left) before you ',{b:'pair'},' any dots. Then pair up, starting at the top.'],{bullet:true}),
  img(KEY?'lewis.png':'lewis_blank.png',430,81),
  P([{bold:'Example. '},'Nitrogen is in group 15, so it has ',{b:'5'},' valence electrons: one dot on each side, and the fifth pairs with the ',{b:'top'},' dot.'],{before:40}),...chk('A student draws carbon with two pairs of dots, one on top and one on the right. Which rule did they break?','One dot goes on each side before any pair forms. Carbon has four single dots.',2)]),
 row([P([{bold:'PART 4: UNPAIRED ELECTRONS'}],{size:20,after:40}),cueQ('Which electrons can an atom use to bond?'),...cueT('Unpaired electron','a dot alone on its side',2)],[
  P(['An ',{b:'unpaired'},' electron is a dot that is alone on its side. Count the single dots.']),
  strip([['Group','1','2','13','14','15','16','17','18'],['Unpaired electrons',{b:'1',w:2},{b:'2',w:2},{b:'3',w:2},{b:'4',w:2},{b:'3',w:2},{b:'2',w:2},{b:'1',w:2},{b:'0',w:2}]],1500),
  P(['Up to group 14, every valence electron is unpaired. From group 15 on, unpaired electrons = ',{b:'8'},' minus the valence electrons.'],{bullet:true,before:80}),
  P(['Noble gases have ',{b:'0'},' unpaired electrons, so there is nothing to pair up and they do not bond.'],{bullet:true}),
  P([{bold:'Example. '},'Nitrogen has 5 valence electrons, so 8 − 5 = ',{b:'3'},' unpaired electrons.'],{before:60}),...chk('Oxygen is in group 16. How many unpaired electrons does it have? Show how you know.','6 valence electrons, so 8 − 6 = 2 unpaired electrons.',2)]),
 row([P([{bold:'EXIT CHECK'}],{size:20,after:40}),cueQ('Show what you know')],[
  P(['Draw the Lewis dot symbol for magnesium and for chlorine.'],{num:'n1'}),
  ...(KEY?[P([{key:'Mg: two single dots (top and right). Cl: pairs on top, right and bottom, one dot on the left.'}])]:gap(2)),
  P(['How many unpaired electrons does silicon have?'],{num:'n1'}),
  ...(KEY?[P([{key:'4: group 14 has 4 valence electrons, all unpaired.'}])]:gap(1)),
  P(['Why does argon not form bonds? Explain in one sentence.'],{num:'n1'}),
  ...(KEY?[P([{key:'Argon has 8 valence electrons, a full outer level, and no unpaired electrons.'}])]:gap(1)),
  P([{bold:'Summary. '},'Answer the essential question in two or three sentences. Use the words “octet” and “valence.”'],{before:120,after:40}),
  ...(KEY?[P([{key:'Atoms bond to reach an octet, a full outer level of 8 valence electrons. A Lewis dot symbol shows an atom’s valence electrons as dots, and the single dots show which electrons it can use to bond.'}])]:gap(2))]),
];
const body=new Table({width:{size:W,type:WidthType.DXA},columnWidths:[CUE,NOTE],rows:rowsMain});
const doc=new Document({numbering:{config:[{reference:"b",levels:[{level:0,format:LevelFormat.BULLET,text:"•",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:360,hanging:240}}}}]},
 {reference:"n1",levels:[{level:0,format:LevelFormat.LOWER_LETTER,text:"%1.",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:360,hanging:280}}}}]}]},
 styles:{default:{document:{run:{font:F,size:22}}}},
 sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:720,bottom:720,left:720,right:720}}},
 children:[...(KEY?[P([{bold:'KEY'}],{size:24})]:[]),header,new Paragraph({children:[],spacing:{after:80}}),body]}]});
Packer.toBuffer(doc).then(b=>fs.writeFileSync(KEY?'Unit4_Day2_Bonding_Key.docx':'Unit4_Day2_Bonding_Notes.docx',b));
