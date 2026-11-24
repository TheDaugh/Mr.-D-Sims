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

/* ---------------- the student sheet: review, concepts, practice (two pages) ---------------- */
function sheet(){
 const c=[...head('Practice: Trends, Octets and Dots'),
 H('Review'),
 item(1,'Circle the larger atom in each pair. Give the reason in a few words.'),
 P(['(a)  Rb      Li        Reason: _______________________________________________'],{indent:360,after:90}),
 P(['(b)  Al      Cl        Reason: _______________________________________________'],{indent:360,after:60}),
 item(2,['Rank from least to most electronegative:  K,  Br,  Ca        ______________________']),
 item(3,'Which is more reactive, rubidium or sodium? Explain using shells.'),...ln(2),
 H('Concepts'),
 item(4,'Each statement is false. Rewrite it so it is true.'),
 P(['(a)  Chlorine has 17 valence electrons.'],{indent:360,after:0}),...ln(1,150),
 P(['(b)  A Lewis dot symbol shows every electron in an atom.'],{indent:360,after:0}),...ln(1,150),
 P(['(c)  Helium has 8 valence electrons because it is a noble gas.'],{indent:360,after:0}),...ln(1,150),
 item(5,'Each student drew a Lewis dot symbol and made a mistake. Say what is wrong with each one, then draw it correctly in the empty box.'),
 img('err_blank.png',330,108),
 P(['A:  ___________________________________________________________________________'],{indent:360,after:60}),
 P(['B:  ___________________________________________________________________________'],{indent:360,after:60}),
 item(6,'Why do most atoms form bonds? Why does krypton not?'),...ln(2),
 H('Practice'),
 item(7,'Complete the table.'),
 grid([['Element','Li','Mg','Ga','Si','S','I'],['Group','','','','','',''],['Valence electrons','','','','','','']],[2400,1400,1400,1400,1400,1400,1400],{rowH:420,center:true}),
 item(8,'Draw the Lewis dot symbol for each atom.',{before:140}),
 img('draw_blank.png',640,141),
 item(9,'How many unpaired electrons does each atom have?'),
 P(['(a)  Ge  _______        (b)  Ga  _______        (c)  I  _______        (d)  Kr  _______'],{indent:360,after:60}),
 item(10,'Sort these atoms by how close each is to a full outer level:   Ne,  F,  Na,  Ar,  Cl,  K,  Kr,  Li,  Br'),
 grid([['Full outer level','One electron short','One electron past a full level'],['','','']],[3600,3600,3600],{rowH:760}),
 item(11,'An atom has 7 valence electrons. Draw its Lewis dot symbol, using X for the symbol. Then count its unpaired electrons.',{before:140}),
 img('x_blank.png',120,120),
 P(['Unpaired electrons:  _______'],{indent:360,after:60}),
 item(12,'Choose an element from period 3 or 4 that appears nowhere else on this sheet. Draw its Lewis dot symbol and give its group, valence electrons and unpaired electrons.'),
 img('empty_box.png',120,120),
 P(['Element: _______     Group: _______     Valence electrons: _______     Unpaired electrons: _______'],{indent:360,after:0})];
 return save([page(c)],'Sheet.docx');
}

/* ---------------- set B: its own sheet, no labels ---------------- */
function setB(){
 const c=[...head('Practice Set B: Trends, Octets and Dots'),
 item(1,'Rank Mg, Cl and K from the largest atom to the smallest. Write your claim, your evidence from the periodic table, and your reasoning.',{before:160}),
 P([{b:'Claim: '}],{indent:360,after:0}),...ln(1,190),
 P([{b:'Evidence: '}],{indent:360,after:0}),...ln(2,190),
 P([{b:'Reasoning: '}],{indent:360,after:0}),...ln(3,190),
 item(2,'A period 3 atom has exactly 2 unpaired electrons. Name both atoms it could be and say how you could tell them apart.',{before:240}),...ln(4,190),
 item(3,'A student says, “All noble gases have 8 valence electrons, so every noble gas has 8 dots.” Which noble gas shows that the student is wrong? Explain why that atom still does not bond.',{before:240}),...ln(4,190)];
 return save([page(c)],'SetB.docx');
}

/* ---------------- exit slips: four to a page ---------------- */
function slips(){
 const slip=()=>[P([{b:'Exit check'},'      Name: ________________________'],{after:100}),
  P([{b:'1.  '},'Circle the more electronegative atom:   Se    Br'],{after:100}),
  P([{b:'2.  '},'Draw the Lewis dot symbol for arsenic. Then circle its unpaired electrons.'],{after:40}),
  img('as_blank.png',96,96),
  P([{b:'3.  '},'Why does fluorine bond but xenon does not?'],{after:40,before:60}),...ln(2,190)];
 const cw=5400, mk=()=>cell(slip(),cw,{borders:{top:thin,bottom:thin,left:thin,right:thin},va:VerticalAlign.TOP});
 const t=new Table({width:{size:W,type:WidthType.DXA},columnWidths:[cw,cw],rows:[0,1].map(()=>new TableRow({cantSplit:true,height:{value:7100,rule:"atLeast"},children:[mk(),mk()]}))});
 return save([page([t],500)],'Slips.docx');
}

/* ---------------- the key: every item, the likely error, then the exit slip and the 4-of-5 decision ---------------- */
function key(){
 const a=(n,ans,err)=>[P([{b:n+'  '},{r:ans}],{after:20,before:70,keepNext:true}),P([{i:'Likely error: '},err],{after:30,indent:360,size:20})];
 const c=[P([{b:'KEY'}],{size:28,after:20}),P([{b:'Practice: Trends, Octets and Dots'}],{size:30,after:100}),
 P([{b:'Review'}],{size:24,before:60}),
 ...a('1.','(a) Rb: it has more shells (5 to 2).  (b) Al: same shell, but Cl has more protons pulling it in.','Choosing by atomic number or electron count; ignoring that (b) is one period.'),
 ...a('2.','K, Ca, Br (same period, left to right).','Reversing the order, or thinking big atoms are more electronegative.'),
 ...a('3.','Rubidium: its outer electron is in a shell farther out, so it is lost more easily.','“More electrons, so more reactive.”'),
 P([{b:'Concepts'}],{size:24,before:100}),
 ...a('4.','(a) Chlorine has 7 valence electrons (group 17, minus 10).  (b) A Lewis dot symbol shows only the valence electrons.  (c) Helium has 2 valence electrons; its one shell is full with 2.','Counting all electrons; keeping 8 for helium.'),
 ...a('5.','A (N): the right side was paired before the left side got a dot. Correct: a pair on top and one dot each on the right, bottom and left. B (Mg): the two dots are paired. Correct: one dot on top and one on the right (two unpaired).','Saying “wrong number of dots”; both drawings have the right count.'),
 ...a('6.','Atoms bond to get a full outer level (an octet). Krypton already has 8 valence electrons, a full outer level.','“To be stable” with no mention of the outer level; “krypton has 8 electrons.”'),
 P([{b:'Practice'}],{size:24,before:100}),
 ...a('7.','Li 1, 1.  Mg 2, 2.  Ga 13, 3.  Si 14, 4.  S 16, 6.  I 17, 7.','Writing the period as the valence count; forgetting to subtract 10 (Ga: 13 valence electrons).'),
 ...a('8.','K: 1 dot.  Mg: 2 single dots (top, right).  Si: 4 single dots.  S: top pair, right pair, singles bottom and left.  Cl: pairs top, right, bottom, single left.  Ar: four pairs.','Pairing before every side has a dot; counting inner electrons.'),
 img('draw_key.png',400,88),
 ...a('9.','(a) 4  (b) 3  (c) 1  (d) 0','Giving the valence count for I (7) and Kr (8); forgetting 8 minus valence from group 15 on.'),
 ...a('10.','Full outer level: Ne, Ar, Kr.  One electron short: F, Cl, Br.  One electron past a full level: Na, K, Li.','Putting Ne with F (neighbors on the table) or swapping the last two columns.'),
 ...a('11.','Top, right and bottom pairs and a single dot on the left. Unpaired: 1.','Writing 7 unpaired, or 3.'),
 ...a('12.','Any valid choice. Check: valence electrons equal the group (groups 1 and 2) or the group minus 10; one dot on each side before any pair; unpaired equals the single dots.','Same errors as 7 to 9.'),
 P([{b:'Practice Set B'}],{size:24,before:100}),
 ...a('B1.','K, Mg, Cl. K is in period 4 (4 shells); Mg and Cl are in period 3 (3 shells). Cl has more protons than Mg pulling on the same shell, so Cl is smaller.','Ranking by group or atomic number alone, or by electron count.'),
 ...a('B2.','Mg and S. Mg: group 2, 2 valence electrons, both unpaired. S: group 16, 6 valence electrons, 8 minus 6 is 2 unpaired. Tell apart: Mg has 2 valence electrons and is a metal on the left; S has 6 and is a nonmetal on the right.','Finding only one atom; naming Si (4 unpaired).'),
 ...a('B3.','Helium: 2 valence electrons. Its only shell holds 2, so it is already full and does not bond.','Naming neon or another gas; saying helium “needs 6 more.”'),
 P([{b:'Exit check: answers'}],{size:24,before:140}),
 ...a('1.','Br: same period, farther right, so more protons pull on the shared electrons.','Picking Se because it is “bigger.”'),
 ...a('2.','As: a pair on top and single dots on the right, bottom and left; 3 unpaired (circle the three single dots).','Pairing early; circling the pair; counting 5.'),
 img('as_key.png',90,90),
 ...a('3.','Fluorine has 7 valence electrons, one short of an octet. Xenon already has 8, a full outer level.','“Xenon is stable” with no mention of the outer level.'),
 P([{b:'The 4-of-5 decision'}],{size:24,before:140}),
 P(['Sort the slips into two piles: all three right, and one or more missed. If 4 of every 5 slips are in the first pile, Day 4 is new material (ionic bonds). Fewer than that means another practice day. Reteach by the item most often missed:'],{after:40}),
 P([{b:'Item 1: '},'back to the Trends Lab, or the Day 1 board, frame 4.'],{indent:360,after:20}),
 P([{b:'Item 2: '},'whiteboard rounds, “one on each side, then pair at the top” (Day 2 board, frame 3).'],{indent:360,after:20}),
 P([{b:'Item 3: '},'Day 2 board, frame 2: a full outer level is the reason atoms bond.'],{indent:360,after:20})];
 return save([page(c)],'Key.docx');
}

/* ---------------- the teacher run sheet ---------------- */
function run(){
 const rows=[['Clock','Up','Do','Watch for'],
 ['0:00–5:00','Board, frame 0 (#lesson=practice3). Warm-up.','Three items on the board as students walk in. At 3:00 remove the covers: 2; Na; Mg²⁺.','Counting the inner electrons in item 1. Mg is in period 3, so Na is larger.'],
 ['5:00–20:00','trends-explorer.html (Trends Lab), frame 1 on the board.','Tell them one thing before they start: “ionization energy” is how hard it is to pull an outer electron off (the lab says easy or hard to remove). Then: find the pattern for size and for electronegativity, across and down.','Stage 2 opens after 3 ionization energies and stage 3 after 3 pairs. Locked students need today’s override code. The page goes dark at 20:00 on the clock. Students who finish early answer “why?” with shells or protons.'],
 ['20:00–30:00','Board, frame 2. Mini whiteboards.','Rounds: draw it, hold it up, remove the cover. Hand out the practice sheet at 30:00.','Pairing before every side has a dot. Counting group number as valence electrons.'],
 ['30:00–45:00','Practice sheet, items 1 to 12.','Walk the room. Items 5 and 8 show the most about dots. Practice Set B goes to students who finish; it has no label.','Item 7: Ga as 13. Item 9: giving the valence count for I and Kr.'],
 ['45:00–50:00','Board, frame 3. Exit slips.','Slips on paper, alone, silent. Collect at the bell.','Do not review the answers; the slips decide tomorrow.']];
 const c=[P([{b:'Unit 4, Day 3: practice run sheet'}],{size:30,after:60}),
 P(['Trends and Lewis symbols (4.0 to 4.2). Half online (the Trends Lab), half paper (whiteboards, sheet, exit slip). Board: ',{i:'chemistry/whiteboard/index.html#lesson=practice3'}],{after:100,size:20}),
 grid(rows,[1300,2500,3900,3100],{rowH:600}),
 P([{b:'The 4-of-5 decision. '},'Sort the exit slips into all three right and one or more missed. If 4 of every 5 are all right, tomorrow is new material: ionic bonds (Day 4). Fewer: another practice day, reteaching the item most missed (the key lists where each one lives).'],{before:140,after:60}),
 P([{b:'If you run short. '},'Cut sheet items 10 and 12 first. Never cut the exit slip.'],{after:60}),
 P([{b:'If you run long. '},'Shorten the lab to its first stage; the Lewis rounds and the slip are the part that decides Day 4.'],{after:60})];
 return save([page(c)],'RunSheet.docx');
}
({sheet,setB,slips,key,run})[MODE==='setb'?'setB':MODE]();
