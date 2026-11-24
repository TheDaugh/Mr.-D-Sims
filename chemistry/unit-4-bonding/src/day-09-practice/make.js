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

/* ---------------- the student sheet: molecules, names, bond types (two pages) ---------------- */
function sheet(){
 const c=[...head('Practice: Molecules, Names and Bond Types'),
 H('Review'),
 item(1,'Write the formula for gallium and fluorine, and name Rb₃P.     Formula: ____________     Name: ____________________'),
 item(2,'Draw the Lewis dot symbol for sulfur and say how many bonds it usually makes.'),
 img('empty_box.png',90,90),
 P(['Bonds: _______'],{indent:360,after:60}),
 H('Lewis structures'),
 item(3,'Draw the Lewis structure of each molecule. The central atom is first.'),
 P(['HF                       H₂S                       PH₃                       SiH₄'],{indent:560,after:20,size:22}),
 img('four_blank.png',450,162),
 item(4,'Each student made a mistake. Say what is wrong, then fix it.'),
 P(['(a)  A student draws HF with two shared pairs between H and F.'],{indent:360,after:0}),...ln(1,150),
 P(['(b)  A student draws SiH₄ with silicon bonded to only three hydrogens.'],{indent:360,after:0}),...ln(1,150),
 P(['(c)  A student says the bond in F₂ is a double bond.'],{indent:360,after:0}),...ln(1,150),
 item(5,'The three structures below are shown to you. For each, say how many pairs of electrons each bond shares and name the bond.'),
 img('shown.png',400,106),
 grid([['Molecule','A  F₂','B  CS₂ (each C–S)','C  HCN (the C–N bond)'],['Shared pairs','','',''],['Kind of bond','','','']],[2400,2400,3000,3000],{rowH:380,center:true}),
 new Paragraph({children:[new TextRun({text:'Names and bond types',font:F,size:26,bold:true})],spacing:{before:0,after:80},border:{bottom:{style:BorderStyle.SINGLE,size:8,color:'000000',space:2}},keepNext:true,pageBreakBefore:true}),
 item(6,'Name each molecular compound.'),
 grid([['Formula','PBr₃','SiCl₄','P₂S₃','SF₄','NBr₃'],['Name','','','','','']],[1600,1840,1840,1840,1840,1840],{rowH:900,center:true}),
 item(7,'Write the formula for each compound.',{before:140}),
 grid([['Name','carbon tetrabromide','nitrogen monoxide','phosphorus pentafluoride','disulfur dichloride'],['Formula','','','','']],[1600,2300,2300,2300,2300],{rowH:760,center:true}),
 item(8,'A student names N₂S₃ “nitrogen trisulfide.” What is wrong with that? Write the correct name.',{before:140}),...ln(2),
 item(9,'Classify the bond in each substance as ionic, covalent or metallic.'),
 grid([['Substance','BaF₂','I₂','Ni','HBr','K₂S','Ag'],['Bond','','','','','','']],[1800,1500,1500,1500,1500,1500,1500],{rowH:560,center:true}),
 item(10,'A silver wire is bent into a ring and carries a current. Which part of the metal carries the current, and which part stays in place when it bends? Use the words “sea of electrons.”',{before:140}),...ln(3),
 item(11,'Choose a nonmetal from group 15, 16 or 17 that does not appear anywhere else on this sheet. Draw its Lewis structure with hydrogen, then name the bond and give the formula.'),
 img('empty_box.png',110,110),
 P(['Formula: _______________     Number of shared pairs: _______'],{indent:360,after:0})];
 return save([page(c)],'Sheet.docx');
}

/* ---------------- set B ---------------- */
function setB(){
 const c=[...head('Practice Set B: Molecules and Bond Types'),
 item(1,'Carbon forms CH₄ but nitrogen forms NH₃, not NH₄. Explain both using unpaired electrons. Write your claim, your evidence and your reasoning.',{before:160}),
 P([{b:'Claim: '}],{indent:360,after:0}),...ln(1,190),
 P([{b:'Evidence: '}],{indent:360,after:0}),...ln(2,190),
 P([{b:'Reasoning: '}],{indent:360,after:0}),...ln(3,190),
 item(2,'Selenium is in the same group as oxygen. Predict the formula of its compound with hydrogen and draw the Lewis structure. How do you know?',{before:240}),...ln(4,190),
 item(3,'Two solids are made from a metal. Zinc bends without breaking and carries a current as a solid. Potassium fluoride does neither. Which has metallic bonding, and why does that explain both properties?',{before:240}),...ln(4,190)];
 return save([page(c)],'SetB.docx');
}

/* ---------------- exit slips ---------------- */
function slips(){
 const slip=()=>[P([{b:'Exit check'},'      Name: ________________________'],{after:100}),
  P([{b:'1.  '},'Draw the Lewis structure of H₂Se. Selenium is in the center.'],{after:40}),
  img('empty_box.png',90,90),
  P([{b:'2.  '},'Name N₂S₄.'],{after:40,before:60}),...ln(1,190),
  P([{b:'3.  '},'Classify the bond in each:   Ag      I₂      Rb₂S'],{after:40,before:60}),...ln(1,190)];
 const cw=5400, mk=()=>cell(slip(),cw,{borders:{top:thin,bottom:thin,left:thin,right:thin},va:VerticalAlign.TOP});
 const t=new Table({width:{size:W,type:WidthType.DXA},columnWidths:[cw,cw],rows:[0,1].map(()=>new TableRow({cantSplit:true,height:{value:7100,rule:"atLeast"},children:[mk(),mk()]}))});
 return save([page([t],500)],'Slips.docx');
}

/* ---------------- the key ---------------- */
function key(){
 const a=(n,ans,err)=>[P([{b:n+'  '},{r:ans}],{after:20,before:70,keepNext:true}),P([{i:'Likely error: '},err],{after:30,indent:360,size:20})];
 const c=[P([{b:'KEY'}],{size:28,after:20}),P([{b:'Practice: Molecules, Names and Bond Types'}],{size:30,after:100}),
 P([{b:'Review'}],{size:24,before:60}),
 ...a('1.','GaF₃; rubidium phosphide.','Ga₃F; naming with a prefix.'),
 ...a('2.','Sulfur: top pair, right pair, one dot each on the bottom and left. It usually makes 2 bonds (2 unpaired electrons).','Saying 6 bonds (the valence electrons).'),
 P([{b:'Lewis structures'}],{size:24,before:100}),
 ...a('3.','HF: one shared pair, three lone pairs on F. H₂S: two shared pairs, two lone pairs on S. PH₃: three shared pairs, one lone pair on P. SiH₄: four shared pairs, no lone pairs.','Leaving off lone pairs; giving P or Si the wrong number of H.'),
 img('four.png',500,180),
 ...a('4.','(a) H has one unpaired electron, so it shares one pair with F, not two.  (b) Silicon has 4 unpaired electrons, so it bonds to four hydrogens.  (c) Each fluorine has 1 unpaired electron, so F₂ shares one pair: a single bond.','Copying the oxygen pattern for fluorine.'),
 ...a('5.','A (F₂): 1 pair, single.  B (CS₂): 2 pairs, double.  C (HCN): 3 pairs, triple.','Counting the lone pairs or the dots; mixing up double and triple.'),
 P([{b:'Names and bond types'}],{size:24,before:100}),
 ...a('6.','phosphorus tribromide; silicon tetrachloride; diphosphorus trisulfide; sulfur tetrafluoride; nitrogen tribromide.','“monophosphorus”; dropping the prefix from the second element.'),
 ...a('7.','CBr₄; NO; PF₅; S₂Cl₂.','Putting the prefix number on the wrong element; writing N₂O for nitrogen monoxide.'),
 ...a('8.','Mono- is never used on the first element, but di- is needed: the first element has 2 atoms. The name is dinitrogen trisulfide.','Dropping di-.'),
 ...a('9.','BaF₂ ionic; I₂ covalent; Ni metallic; HBr covalent; K₂S ionic; Ag metallic.','Calling I₂ ionic or HBr ionic.'),
 ...a('10.','The electrons in the sea of electrons carry the current. The positive ions stay in place and slide past each other when the wire bends.','Saying the atoms carry the current.'),
 ...a('11.','Any valid choice: the compound with hydrogen is H× with one pair for group 17 (HBr), two for group 16 (H₂Se), three for group 15 (AsH₃). Check the formula and the number of shared pairs.','Wrong number of hydrogens for the group.'),
 P([{b:'Practice Set B'}],{size:24,before:100}),
 ...a('B1.','Carbon has 4 unpaired electrons, so it shares four pairs with four H: CH₄. Nitrogen has 3 unpaired electrons, so it shares three pairs with three H: NH₃. A fourth H would have no unpaired electron to share with.','Saying nitrogen “wants” 8 and takes a fourth H.'),
 ...a('B2.','H₂Se. Selenium is in group 16, like oxygen: 2 unpaired electrons, so 2 shared pairs with H, and 2 lone pairs.','HSe₂.'),
 ...a('B3.','Zinc. Its sea of electrons moves, so it carries current, and the ions slide past each other so it bends. KF is a metal and a nonmetal, ionic, with no free electrons.','Choosing KF because it contains a metal.'),
 P([{b:'Exit check: answers'}],{size:24,before:140}),
 ...a('1.','Se with two H (a shared pair on each side) and two lone pairs on Se.','Giving Se no lone pairs, or three H.'),
 ...a('2.','dinitrogen tetrasulfide.','“nitrogen tetrasulfide”; “dinitrogen tetrasulfur.”'),
 ...a('3.','Ag metallic; I₂ covalent; Rb₂S ionic.','Calling I₂ ionic.'),
 P([{b:'The 4-of-5 decision'}],{size:24,before:140}),
 P(['Sort the slips into all three right and one or more missed. If 4 of every 5 slips are all right, Day 10 is the review day. Fewer: one more practice day before the review. Reteach by the item most often missed:'],{after:40}),
 P([{b:'Item 1: '},'Day 7 board, frames 2 and 3.'],{indent:360,after:20}),
 P([{b:'Item 2: '},'Day 8 board, frames 1 and 2.'],{indent:360,after:20}),
 P([{b:'Item 3: '},'Day 8 board, frames 3 and 4.'],{indent:360,after:20})];
 return save([page(c)],'Key.docx');
}

/* ---------------- the teacher run sheet ---------------- */
function run(){
 const rows=[['Clock','Up','Do','Watch for'],
 ['0:00–5:00','Board, frame 0 (#lesson=practice9). Warm-up.','Three items on the board as students walk in. At 3:00 remove the covers.','Ion charges and formulas slipping from Days 4 to 6.'],
 ['5:00–20:00','trends-explorer.html (Trends Lab), frame 1 on the board.','Stage 2: pair hydrogen with oxygen, nitrogen, carbon and chlorine. Then stage 3: build water, ammonia and methane in the dish. Ask: “How many hydrogens does each one take, and why?”','Students clicking through without reading how many pairs are shared.'],
 ['20:00–30:00','Board, frame 2. Mini whiteboards.','Rounds: Lewis structure, name, formula, bond type. Hold up, remove the cover. Hand out the practice sheet at 30:00.','Missing lone pairs; the prefix on the wrong element; mono- on the first element.'],
 ['30:00–45:00','Practice sheet, items 1 to 11.','Walk the room. Items 3 and 6 show the most. Practice Set B goes to students who finish; it has no label.','Item 3: SiH₄ with three H. Item 9: I₂ as ionic.'],
 ['45:00–50:00','Board, frame 3. Exit slips.','Slips on paper, alone, silent. Collect at the bell.','Do not review the answers; the slips decide tomorrow.']];
 const c=[P([{b:'Unit 4, Day 9: practice run sheet'}],{size:30,after:60}),
 P(['Lewis structures, molecular names and bond types (4.5 to 4.7). Half online (the lab’s one-of-each and dish stages), half paper. Board: ',{i:'chemistry/whiteboard/index.html#lesson=practice9'}],{after:100,size:20}),
 grid(rows,[1300,2500,3900,3100],{rowH:600}),
 P([{b:'The 4-of-5 decision. '},'Sort the slips into all three right and one or more missed. If 4 of every 5 are all right, tomorrow is the review day (Day 10). Fewer: another practice day first, reteaching the item most missed (the key lists where each one lives).'],{after:60,before:100}),
 P([{b:'If you run short. '},'Cut sheet items 10 and 11 first. Never cut the exit slip.'],{after:60}),
 P([{b:'If you run long. '},'Shorten the lab to stage 2; the whiteboard rounds and the slip decide Day 10.'],{after:60})];
 return save([page(c)],'RunSheet.docx');
}
({sheet,setB,slips,key,run})[MODE==='setb'?'setB':MODE]();
