const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,BorderStyle,ImageRun,AlignmentType,ShadingType,VerticalAlign}=require('docx');
const MODE=process.argv[2]||'sheet';
const F="Calibri", W=10800;
const line={style:BorderStyle.SINGLE,size:6,color:"000000"}, thin={style:BorderStyle.SINGLE,size:4,color:"999999"}, none={style:BorderStyle.NONE,size:0,color:"FFFFFF"};
const borders={top:line,bottom:line,left:line,right:line};
const RED="C00000";
// parts: strings, {b:'bold'}, {i:'italic'}, {r:'red'}, {sub:'x'}
function runs(parts,size=22){return [].concat(parts).map(p=>typeof p==='string'?new TextRun({text:p,font:F,size}):p.b!==undefined?new TextRun({text:p.b,font:F,size,bold:true}):p.i!==undefined?new TextRun({text:p.i,font:F,size,italics:true}):p.r!==undefined?new TextRun({text:p.r,font:F,size,color:RED}):new TextRun({text:p.sub,font:F,size,subScript:true}));}
const P=(parts,o={})=>new Paragraph({children:runs(parts,o.size),spacing:{after:o.after??80,before:o.before??0},indent:o.indent?{left:o.indent}:undefined,keepNext:o.keepNext,alignment:o.align});
const H=(t)=>new Paragraph({children:[new TextRun({text:t,font:F,size:26,bold:true})],spacing:{before:140,after:80},border:{bottom:{style:BorderStyle.SINGLE,size:8,color:"000000",space:2}},keepNext:true});
const ln=(n=1,after=170)=>Array.from({length:n},()=>new Paragraph({children:[new TextRun({text:'',font:F,size:22})],spacing:{before:140,after:after-100>0?after-100:0},border:{bottom:{style:BorderStyle.SINGLE,size:4,color:"777777",space:1}}}));
const gap=(h=100)=>new Paragraph({children:[],spacing:{after:h}});
const img=(f,w,h,al)=>new Paragraph({alignment:al||AlignmentType.LEFT,spacing:{after:60,before:40},children:[new ImageRun({type:'png',data:fs.readFileSync(f),transformation:{width:w,height:h}})]});
const cell=(children,w,o={})=>new TableCell({children,width:{size:w,type:WidthType.DXA},borders:o.borders||borders,margins:{top:60,bottom:60,left:100,right:100},shading:o.shade?{type:ShadingType.CLEAR,fill:o.shade,color:"auto"}:undefined,columnSpan:o.span,verticalAlign:o.va||VerticalAlign.CENTER});
function grid(rows,widths,o={}){return new Table({width:{size:widths.reduce((a,b)=>a+b,0),type:WidthType.DXA},columnWidths:widths,rows:rows.map((r,ri)=>new TableRow({cantSplit:true,height:o.rowH&&ri>0?{value:o.rowH,rule:"atLeast"}:undefined,children:r.map((c,ci)=>cell([P(c,{after:0,align:ri===0||o.center?AlignmentType.CENTER:AlignmentType.LEFT})],widths[ci],{shade:ri===0?"F2F2F2":undefined}))}))});}
const head=(title)=>[new Paragraph({children:[new TextRun({text:title,font:F,size:32,bold:true})],spacing:{after:40}}),new Paragraph({children:[new TextRun({text:'Name: ______________________________      Date: ______________',font:F,size:22})],spacing:{after:80}})];
const item=(n,parts,o={})=>P([{b:n+'.  '},...[].concat(parts)],{after:o.after??60,before:o.before??100,keepNext:true});
const page=(children,margin=720)=>({properties:{page:{size:{width:12240,height:15840},margin:{top:margin,bottom:margin,left:margin,right:margin}}},children});
const save=(sections,name)=>Packer.toBuffer(new Document({styles:{default:{document:{run:{font:F,size:22}}}},sections})).then(b=>fs.writeFileSync(name,b));

/* ---------------- the student sheet: ions, ionic bonds, formulas, names (two pages) ---------------- */
function sheet(){
 const c=[...head('Practice: Ions, Ionic Bonds, Formulas and Names'),
 H('Review'),
 item(1,'How many valence electrons does each atom have?    Al  _____     Se  _____     Rb  _____'),
 item(2,'A student says an atom that loses 2 electrons has a charge of 2−. What is wrong with that?'),...ln(2),
 H('Ions and ionic bonds'),
 item(3,'Complete the table.'),
 grid([['Element','Rb','Sr','Ga','P','Se','I'],['Group','','','','','',''],['Gains or loses, and how many?','','','','','',''],['Ion symbol','','','','','',''],['Ion name','','','','','','']],[2400,1400,1400,1400,1400,1400,1400],{rowH:500,center:true}),
 item(4,'Use Lewis dot symbols to show each pair forming ions. Draw the dots, the brackets and the charges.',{before:140}),
 img('ionic_draw_blank.png',470,198),
 item(5,'Each statement is wrong. Say what is wrong, then fix it.'),
 P(['(a)  A student draws Sr²⁺ with two dots inside the brackets.'],{indent:360,after:0}),...ln(1,150),
 P(['(b)  A student draws Se²⁻ with 6 dots inside the brackets.'],{indent:360,after:0}),...ln(1,150),
 P(['(c)  A student draws the electron moving from iodine to rubidium.'],{indent:360,after:0}),...ln(1,150),
 new Paragraph({children:[new TextRun({text:'Formulas and names',font:F,size:26,bold:true})],spacing:{before:0,after:80},border:{bottom:{style:BorderStyle.SINGLE,size:8,color:'000000',space:2}},keepNext:true,pageBreakBefore:true}),
 item(6,'Write the formula for the compound of each pair. Show the charge of each ion.'),
 grid([['Pair','Ions and charges','Formula'],['lithium and bromine','',''],['magnesium and nitrogen','',''],['aluminum and selenium','',''],['sodium and phosphorus','',''],['strontium and fluorine','','']],[3000,4200,3600],{rowH:440}),
 item(7,'Name each compound.',{before:140}),
 grid([['Formula','Rb₂O','SrBr₂','Mg₃P₂','GaN','BeF₂','Li₂Se'],['Name','','','','','','']],[1600,1500,1500,1500,1500,1600,1600],{rowH:760,center:true}),
 item(8,'A student writes the formula for strontium phosphide as SrP. What is wrong with it? Write the correct formula.',{before:140}),...ln(2),
 item(9,'Why does it take two lithium ions for each selenide ion?'),...ln(2),
 item(10,'Choose a metal from group 1, 2 or 13 and a nonmetal from group 15, 16 or 17 that appear nowhere else on this sheet. Write each ion with its charge, then the formula and the name.'),...ln(3)];
 return save([page(c)],'Sheet.docx');
}

/* ---------------- set B: its own sheet, no labels ---------------- */
function setB(){
 const c=[...head('Practice Set B: Ions, Formulas and Names'),
 item(1,'Strontium forms the same compound with selenium (1 to 1) and with iodine (1 to 2). Explain both, using the charge of each ion. Write your claim, your evidence and your reasoning.',{before:160}),
 P([{b:'Claim: '}],{indent:360,after:0}),...ln(1,190),
 P([{b:'Evidence: '}],{indent:360,after:0}),...ln(2,190),
 P([{b:'Reasoning: '}],{indent:360,after:0}),...ln(3,190),
 item(2,'A compound of aluminum has the formula AlX₃. Which group is X in? How do you know?',{before:240}),...ln(3,190),
 item(3,'An ion has 36 electrons and a charge of 2−. How many protons does it have? Name the atom and the ion.',{before:240}),...ln(4,190)];
 return save([page(c)],'SetB.docx');
}

/* ---------------- exit slips: four to a page ---------------- */
function slips(){
 const slip=()=>[P([{b:'Exit check'},'      Name: ________________________'],{after:100}),
  P([{b:'1.  '},'Write the formula for the compound of strontium and chlorine.'],{after:40}),...ln(1,190),
  P([{b:'2.  '},'Name the compound Rb₃N.'],{after:40,before:60}),...ln(1,190),
  P([{b:'3.  '},'Why does beryllium form Be²⁺ and not Be⁺?'],{after:40,before:60}),...ln(2,190)];
 const cw=5400, mk=()=>cell(slip(),cw,{borders:{top:thin,bottom:thin,left:thin,right:thin},va:VerticalAlign.TOP});
 const t=new Table({width:{size:W,type:WidthType.DXA},columnWidths:[cw,cw],rows:[0,1].map(()=>new TableRow({cantSplit:true,height:{value:7100,rule:"atLeast"},children:[mk(),mk()]}))});
 return save([page([t],500)],'Slips.docx');
}

/* ---------------- the key ---------------- */
function key(){
 const a=(n,ans,err)=>[P([{b:n+'  '},{r:ans}],{after:20,before:70,keepNext:true}),P([{i:'Likely error: '},err],{after:30,indent:360,size:20})];
 const c=[P([{b:'KEY'}],{size:28,after:20}),P([{b:'Practice: Ions, Ionic Bonds, Formulas and Names'}],{size:30,after:100}),
 P([{b:'Review'}],{size:24,before:60}),
 ...a('1.','Al 3, Se 6, Rb 1.','Using the period; forgetting to subtract 10 for groups 13 to 18.'),
 ...a('2.','Losing electrons leaves more protons than electrons, so the charge is positive: 2+.','Calling every ion negative.'),
 P([{b:'Ions and ionic bonds'}],{size:24,before:100}),
 ...a('3.','Rb: group 1, loses 1, Rb⁺, rubidium.  Sr: 2, loses 2, Sr²⁺, strontium.  Ga: 13, loses 3, Ga³⁺, gallium.  P: 15, gains 3, P³⁻, phosphide.  Se: 16, gains 2, Se²⁻, selenide.  I: 17, gains 1, I⁻, iodide.','Writing P⁵⁻; naming an anion without -ide.'),
 ...a('4.','Rb gives its dot to I: [Rb]⁺ with no dots, [I]⁻ with 8 dots. Mg gives both dots to Se: [Mg]²⁺ with no dots, [Se]²⁻ with 8 dots.','Leaving dots in the metal’s brackets; moving the electron from the nonmetal.'),
 img('ionic_draw_key.png',470,198),
 ...a('5.','(a) Sr loses both valence electrons, so no dots remain.  (b) Se²⁻ has gained 2 and has 8 dots.  (c) The electron moves from the metal, rubidium, to the nonmetal, iodine.','Forgetting the metal has no dots left.'),
 P([{b:'Formulas and names'}],{size:24,before:100}),
 ...a('6.','Li⁺, Br⁻: LiBr.  Mg²⁺, N³⁻: Mg₃N₂.  Al³⁺, Se²⁻: Al₂Se₃.  Na⁺, P³⁻: Na₃P.  Sr²⁺, F⁻: SrF₂.','Swapping the subscripts; not showing charges; MgN.'),
 ...a('7.','rubidium oxide; strontium bromide; magnesium phosphide; gallium nitride; beryllium fluoride; lithium selenide.','Writing prefixes; using the element name for the nonmetal.'),
 ...a('8.','Sr²⁺ and P³⁻ do not cancel. Three Sr²⁺ (+6) and two P³⁻ (−6): Sr₃P₂.','Writing Sr₂P₃.'),
 ...a('9.','Li⁺ is 1+ and Se²⁻ is 2−. Two Li⁺ give +2 to cancel it.','Saying lithium “needs” two.'),
 ...a('10.','Any valid pair. Check: each charge from its group; the charges cancel; the metal is named first; the anion ends in -ide.','Same errors as 3, 6 and 7.'),
 P([{b:'Practice Set B'}],{size:24,before:100}),
 ...a('B1.','Sr²⁺ and Se²⁻: 2+ and 2− cancel one to one: SrSe. Sr²⁺ and I⁻: it takes two I⁻: SrI₂.','Naming the formula without the charges.'),
 ...a('B2.','Group 17. Al is 3+, so three X⁻ cancel it, and group 17 atoms form 1−.','Group 15 (guessing from the 3).'),
 ...a('B3.','Se²⁻: 34 protons, 36 electrons. The atom is selenium; the ion is the selenide ion.','Using 36 protons (that is krypton).'),
 P([{b:'Exit check: answers'}],{size:24,before:140}),
 ...a('1.','SrCl₂.','SrCl, or Sr₂Cl.'),
 ...a('2.','rubidium nitride.','“rubidium trinitride”; “rubidium nitrogen.”'),
 ...a('3.','Beryllium is in group 2, so it has 2 valence electrons and loses both to reach a full outer level.','“Beryllium wants 2.”'),
 P([{b:'The 4-of-5 decision'}],{size:24,before:140}),
 P(['Sort the slips into all three right and one or more missed. If 4 of every 5 slips are all right, Day 7 is new material (covalent bonds). Fewer than that: one more practice day. Reteach by the item most often missed:'],{after:40}),
 P([{b:'Item 1: '},'Day 5 board, frame 2 (writing a formula).'],{indent:360,after:20}),
 P([{b:'Item 2: '},'Day 5 board, frame 3 (naming).'],{indent:360,after:20}),
 P([{b:'Item 3: '},'Day 4 board, frame 2 (ion charges).'],{indent:360,after:20})];
 return save([page(c)],'Key.docx');
}

/* ---------------- the teacher run sheet ---------------- */
function run(){
 const rows=[['Clock','Up','Do','Watch for'],
 ['0:00–5:00','Board, frame 0 (#lesson=practice6). Warm-up.','Three items on the board as students walk in. At 3:00 remove the covers.','Ion charges for groups 15 to 17 written as positive.'],
 ['5:00–20:00','trends-explorer.html (Trends Lab), frame 1 on the board.','Stage 2 (one of each) and stage 3 (the dish). Tell them: “Find the formula for each pair. Does it ever not match what you expect?”','Students clicking through without reading the line that says who gives and who takes.'],
 ['20:00–30:00','Board, frame 2. Mini whiteboards.','Rounds: ion charge, ionic bond dots, formula. Hold up, remove the cover. Hand out the practice sheet at 30:00.','Dots left inside the metal’s brackets; swapped subscripts.'],
 ['30:00–45:00','Practice sheet, items 1 to 10.','Walk the room. Items 4 and 6 show the most. Practice Set B goes to students who finish; it has no label.','Item 3: P⁵⁻. Item 6: MgN.'],
 ['45:00–50:00','Board, frame 3. Exit slips.','Slips on paper, alone, silent. Collect at the bell.','Do not review the answers; the slips decide tomorrow.']];
 const c=[P([{b:'Unit 4, Day 6: practice run sheet'}],{size:30,after:60}),
 P(['Ionic bonds, formulas and names (4.3 and 4.4). Half online (the lab’s one-of-each and dish stages), half paper. Board: ',{i:'chemistry/whiteboard/index.html#lesson=practice6'}],{after:100,size:20}),
 grid(rows,[1300,2500,3900,3100],{rowH:600}),
 P([{b:'The 4-of-5 decision. '},'Sort the slips into all three right and one or more missed. If 4 of every 5 are all right, tomorrow is new material (covalent bonds, Day 7). Fewer: another practice day, reteaching the item most missed (the key lists where each one lives).'],{after:60,before:100}),
 P([{b:'If you run short. '},'Cut sheet items 9 and 10 first. Never cut the exit slip.'],{after:60}),
 P([{b:'If you run long. '},'Shorten the lab to stage 2; the whiteboard rounds and the slip decide Day 7.'],{after:60})];
 return save([page(c)],'RunSheet.docx');
}
({sheet,setB,slips,key,run})[MODE==='setb'?'setB':MODE]();
