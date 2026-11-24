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
 new TableRow({children:[cell([P([{bold:'Cornell Notes'}]),P(['Chemistry'],{size:20})],CUE,{shade:"D9D9D9"}),cell([P([{bold:'Topic: '},'Ionic Formulas and Names']),P([{bold:'Unit 4: '},'Trends, Bonding and Naming'],{size:20})],NOTE-2700),cell([P([{bold:'Name:'}]),P([{bold:'Date:'}])],2700)]}),
 new TableRow({children:[cell([P([{bold:'Essential question:'},' How do we write the formula and the name of an ionic compound from the ions that make it?'],{size:24})],W,{span:3})]})]});
const rowsMain=[
 row([P([{bold:'PART 1: BALANCED CHARGE'}],{size:20,after:40}),cueQ('What must be true of every ionic compound?'),...cueT('Ionic compound','a metal and a nonmetal held together by opposite charges',2),...cueT('Formula','the symbols of the ions with subscripts that show how many of each',2)],[
  P(['An ionic compound is ',{b:'neutral'},'. The positive charges and the negative charges must ',{b:'cancel'},', so the total charge is zero.']),
  strip([['Ions','Na⁺ and O²⁻','Mg²⁺ and Br⁻'],['Total charge',{b:'+1 − 2 = −1',w:10},{b:'+2 − 1 = +1',w:10}],['Balanced?',{b:'no',w:6},{b:'no',w:6}],['Fix it',{b:'2 Na⁺ for each O²⁻',w:12},{b:'2 Br⁻ for each Mg²⁺',w:12}]],1500),
  P(['The ',{b:'subscript'},' in a formula says how many of that ion. A ',{b:'1'},' is never written.'],{bullet:true,before:80}),...chk('A student says the formula for the compound of magnesium and bromine is MgBr because both ions have a charge of 1. What is wrong with that?','Mg²⁺ has a charge of 2+ and Br⁻ has 1−, so the charges do not cancel. It takes two Br⁻: MgBr₂.',2)]),
 row([P([{bold:'PART 2: WRITING A FORMULA'}],{size:20,after:40}),cueQ('How do we get the subscripts?'),...cueT('Lowest ratio','the smallest whole numbers of each ion that make the charges cancel',2)],[
  P(['Step 1: write each ion with its charge. Step 2: use the ',{b:'number'},' of one ion’s charge as the subscript of the other. Step 3: ',{b:'reduce'},' to the lowest ratio.']),
  strip([['Ions','Al³⁺ and S²⁻','Ca²⁺ and N³⁻','Mg²⁺ and O²⁻'],['Subscripts','Al 2, S 3','Ca 3, N 2','Mg 2, O 2'],['Formula',{b:'Al₂S₃',w:9},{b:'Ca₃N₂',w:9},{b:'MgO',w:9}]],1500),
  P([{bold:'Check. '},'Magnesium and oxygen first give Mg₂O₂. The charges cancel, but the ratio can be ',{b:'reduced'},' by 2, so the formula is ',{b:'MgO'},'.'],{before:80}),...chk('A student writes the formula for aluminum and sulfur as Al₃S₂. What is wrong with that?','The subscripts are swapped. Al³⁺ gives its 3 to sulfur and S²⁻ gives its 2 to aluminum: Al₂S₃.',2)]),
 row([P([{bold:'PART 3: NAMING'}],{size:20,after:40}),cueQ('How do we name an ionic compound from its formula?'),...cueT('Binary compound','a compound made of just two elements',1)],[
  P(['Name the ',{b:'metal'},' first, with its element name. Then name the nonmetal with the ',{b:'-ide'},' ending. The subscripts are not in the name.']),
  strip([['Formula','Li₂O','MgBr₂','BaF₂','Al₂S₃'],['Name',{b:'lithium oxide',w:12},{b:'magnesium bromide',w:14},{b:'barium fluoride',w:13},{b:'aluminum sulfide',w:13}]],1100),
  ...chk('A student names Al₂S₃ “dialuminum trisulfide.” What is wrong with that?','Ionic names do not show the subscripts. The name is aluminum sulfide.',1)]),
 row([P([{bold:'PART 4: FORMULA FROM A NAME'}],{size:20,after:40}),cueQ('How do we go from a name back to a formula?')],[
  P(['Find each ion’s charge from its ',{b:'group'},'. Balance the charges, then reduce. Example: ',{bold:'potassium oxide'},'. K is group 1, so K⁺. O is group 16, so O²⁻. It takes two K⁺ to cancel one O²⁻: ',{b:'K₂O'},'.']),
  P([{bold:'Try it: '},'calcium fluoride. Ca is group 2, so ',{b:'Ca²⁺'},'. F is group 17, so ',{b:'F⁻'},'. The formula is ',{b:'CaF₂'},'.'],{before:80}),...chk('A student writes the formula for potassium phosphide as KP. What is wrong with that?','Phosphorus is in group 15, so it forms P\u00b3\u207b. It takes three K\u207a to cancel it: K\u2083P.',2)]),
 row([P([{bold:'EXIT CHECK'}],{size:20,after:40}),cueQ('Show what you know')],[
  P(['Write the formula for the compound of barium and chlorine.'],{num:'n1'}),
  ...(KEY?[P([{key:'Ba\u00b2\u207a and Cl\u207b: BaCl\u2082'}])]:gap(1)),
  P(['Name the compound Li\u2082S.'],{num:'n1'}),
  ...(KEY?[P([{key:'lithium sulfide'}])]:gap(1)),
  P(['Write the formula for the compound of gallium and oxygen. Show the charge of each ion.'],{num:'n1'}),
  ...(KEY?[P([{key:'Ga is group 13: Ga\u00b3\u207a. O is group 16: O\u00b2\u207b. Two Ga\u00b3\u207a (+6) and three O\u00b2\u207b (\u22126): Ga\u2082O\u2083.'}])]:gap(2)),
  P([{bold:'Summary. '},'Answer the essential question in two or three sentences. Use the words \u201Cneutral\u201D and \u201Cratio.\u201D'],{before:120,after:40}),
  ...(KEY?[P([{key:'An ionic compound must be neutral, so the positive and negative charges cancel. We use each ion\u2019s charge to find the lowest ratio of ions, write the metal first, and name the nonmetal with -ide.'}])]:gap(2))]),
];
const body=new Table({width:{size:W,type:WidthType.DXA},columnWidths:[CUE,NOTE],rows:rowsMain});
const doc=new Document({numbering:{config:[{reference:"b",levels:[{level:0,format:LevelFormat.BULLET,text:"\u2022",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:360,hanging:240}}}}]},
 {reference:"n1",levels:[{level:0,format:LevelFormat.LOWER_LETTER,text:"%1.",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:360,hanging:280}}}}]}]},
 styles:{default:{document:{run:{font:F,size:22}}}},
 sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:720,bottom:720,left:720,right:720}}},
 children:[...(KEY?[P([{bold:'KEY'}],{size:24})]:[]),header,new Paragraph({children:[],spacing:{after:80}}),body]}]});
Packer.toBuffer(doc).then(b=>fs.writeFileSync(KEY?'Unit4_Day5_Formulas_Key.docx':'Unit4_Day5_Formulas_Notes.docx',b));
