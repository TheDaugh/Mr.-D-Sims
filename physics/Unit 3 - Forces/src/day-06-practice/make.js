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

/* ---------------- the student sheet: review, concepts, practice, the skywalks, the chain (two pages) ---------------- */
function sheet(){
 const sub=(t)=>P([t],{indent:360,after:0});
 const c=[...head('Practice: Strings, Springs and What Hangs Below'),
 H('Review'),
 item(1,'A spring stretches 6.0 cm when it is pulled with 9.0 N. Find its spring constant.'),...ln(1),
 item(2,'A 4.0 kg crate sits on a floor with μs = 0.45. You push it sideways with 15 N and it does not move. How big is the friction force?'),...ln(1),
 item(3,'A 2.0 kg cart sits on a frictionless table. A string runs from it over a pulley to a 0.50 kg hanging mass. Find the acceleration and the tension.'),...ln(2),
 H('Concepts'),
 item(4,'A spring scale sits in the string of item 3. Held still, it reads 4.9 N. Once the cart is let go, does it read more, less or the same? Draw a free-body diagram of the hanging mass and use it to explain.'),...ln(2),
 item(5,'A student wrote: “A chain of 6 links, each 0.50 kg, hangs from a hook. It is one chain, so the tension is the same everywhere: T = 0.50 × 9.8 = 4.9 N.” What is wrong? Find the tension just above the bottom link and at the hook.'),...ln(2),
 item(6,'True or false? Give a reason for each.'),
 sub('(a)  A light string over a frictionless pulley pulls with the same tension on both sides.'),...ln(1,150),
 sub('(b)  Two people pull on the two ends of a spring scale, each with 20 N. The scale reads 40 N.'),...ln(1,150),
 H('Practice'),
 item(7,'A student hangs masses on a spring scale and reads the stretch on a ruler.'),
 grid([['mass (kg)','0.10','0.20','0.30','0.40'],['weight (N)','','','',''],['stretch (cm)','3.3','6.5','9.8','13.1']],[2000,1300,1300,1300,1300],{center:true}),
 sub('(a)  Fill in the weights.   (b)  Find k.   (c)  How far does it stretch with 0.65 kg?'),...ln(2,150),
 item(8,'A 1.5 kg cart sits on a frictionless table. A string runs over a pulley to a 0.60 kg hanging mass, and a spring scale with k = 120 N/m sits in the string. Find the acceleration, the tension, and the scale’s stretch once the cart is let go.'),...ln(1,150),
 H('A chain with mass'),
 new Table({width:{size:W,type:WidthType.DXA},columnWidths:[1300,5300,4200],rows:[new TableRow({children:[cell([img('chain.png',80,165,AlignmentType.CENTER)],1300,{borders:{top:none,bottom:none,left:none,right:none},va:VerticalAlign.TOP}),
  cell([item(9,'Ten links, each 0.30 kg, hang from a hook with a 2.5 kg bucket on the bottom link. Find the tension',{before:0}),
   sub('(a)  just above link 1'),...ln(1,150),sub('(b)  just above link 6'),...ln(1,150),sub('(c)  at the hook'),...ln(1,150),
   sub('(d)  Plot the tension above each link against the link number.')],5300,{borders:{top:none,bottom:none,left:none,right:none},va:VerticalAlign.TOP}),
  cell([img('axes_blank.png',260,173,AlignmentType.CENTER)],4200,{borders:{top:none,bottom:none,left:none,right:none},va:VerticalAlign.TOP})]})]}),
 H('The Hyatt Regency skywalks, Kansas City, 1981'),
 new Table({width:{size:W,type:WidthType.DXA},columnWidths:[5000,5800],rows:[new TableRow({children:[cell([P(['Two walkways hung one above the other from rods in a hotel lobby. On paper, one long rod ran past the upper walkway to the lower one, and each walkway sat on its own nut. As built, the rod was cut in two, and the lower rod hung from the upper walkway’s beam. On July 17, 1981, during a dance, the nut pulled through that beam and both walkways fell. 114 people died.'],{after:0})],5000,{borders:{top:none,bottom:none,left:none,right:none},va:VerticalAlign.TOP}),
  cell([img('skywalks.png',370,150,AlignmentType.CENTER)],5800,{borders:{top:none,bottom:none,left:none,right:none},va:VerticalAlign.TOP})]})]}),
 P(['Suppose each walkway puts 40 kN on each rod: its own weight plus the crowd.'],{after:40}),
 new Table({width:{size:W,type:WidthType.DXA},columnWidths:[5400,5400],rows:[new TableRow({cantSplit:true,height:{value:2300,rule:"atLeast"},children:[
  cell([item(10,'On paper: draw a free-body diagram of the upper walkway. Find the force from its nut, the tension in the rod above it, and the tension in the rod below it.',{before:0})],5400,{borders:{top:none,bottom:none,left:none,right:thin},va:VerticalAlign.TOP}),
  cell([item(11,'As built: draw a free-body diagram of the upper walkway. Find the force from its nut.',{before:0})],5400,{borders:{top:none,bottom:none,left:thin,right:none},va:VerticalAlign.TOP})]})]}),
 item(12,'Suppose the beam can take about 60 kN at the nut before the nut pulls through. Which design holds? By what factor did the change raise the load on that nut? A friend says thicker rods would have saved the walkways. Use 10 and 11 to say whether the friend is right.'),...ln(3,150),
 item(13,'A rope with a mass of 2.0 kg hangs from a ceiling with a 6.0 kg crate tied to its bottom end. Find the tension at the bottom of the rope, in the middle, and at the top. Why is a light string different?'),...ln(3,170)];
 return save([page(c,600)],'day-06-practice-sheet.docx');
}
/* ---------------- set B: its own sheet, no labels ---------------- */
function setB(){
 const c=[...head('Practice Set B: Strings, Springs and What Hangs Below'),
 item(1,'A 2.0 kg cart on a table with μk = 0.15 is pulled by a string over a pulley to a 0.80 kg hanging mass. A spring scale with k = 90 N/m sits in the string. Find the acceleration, the tension and the scale’s stretch.',{before:160}),...ln(5,190),
 item(2,'A rope with a mass of 1.5 kg pulls a 4.0 kg cart across a frictionless table. Your hand pulls the front end of the rope with 11 N. Find the acceleration, the tension where the rope meets the cart, and the tension in the middle of the rope.',{before:240}),...ln(5,190),
 item(3,'A 2.0 kg mass hangs from a spring scale with k = 80 N/m inside an elevator. Find the reading and the stretch when the elevator speeds up going up at 1.5 m/s², and again when it slows down going up at 1.5 m/s².',{before:240}),...ln(5,190)];
 return save([page(c)],'day-06-practice-sheet-b.docx');
}
/* ---------------- exit slips: four to a page ---------------- */
function slips(){
 const slip=()=>[P([{b:'Exit check'},'      Name: ________________________'],{after:100}),
  P([{b:'1.  '},'A spring scale stretches 4.0 cm when a 0.30 kg mass hangs still on it. Find its spring constant.'],{after:40}),...ln(2,170),
  P([{b:'2.  '},'A 3.5 kg cart sits on a frictionless table, with a string over a pulley to a 0.70 kg hanging mass. Once it is let go, what is the tension?'],{after:40,before:80}),...ln(2,170),
  P([{b:'3.  '},'Five links, each 0.20 kg, hang from a hook with a 1.0 kg lamp on the bottom link. Find the tension just above link 2 (link 1 is the bottom one), and at the hook.'],{after:40,before:80}),...ln(2,170)];
 const cw=5400, mk=()=>cell(slip(),cw,{borders:{top:thin,bottom:thin,left:thin,right:thin},va:VerticalAlign.TOP});
 const t=new Table({width:{size:W,type:WidthType.DXA},columnWidths:[cw,cw],rows:[0,1].map(()=>new TableRow({cantSplit:true,height:{value:7100,rule:"atLeast"},children:[mk(),mk()]}))});
 return save([page([t],500)],'day-06-practice-exit-slips.docx');
}
/* ---------------- the key ---------------- */
function key(){
 const a=(n,ans,err)=>[P([{b:n+'  '},{r:ans}],{after:20,before:70,keepNext:true}),P([{i:'Likely error: '},err],{after:30,indent:360,size:20})];
 const c=[P([{b:'KEY'}],{size:28,after:20}),P([{b:'Practice: Strings, Springs and What Hangs Below'}],{size:30,after:100}),
 P([{b:'Review'}],{size:24,before:60,keepNext:true}),
 ...a('1.','k = F ÷ x = 9.0 ÷ 0.060 = 150 N/m.','9.0 ÷ 6.0 = 1.5 (centimetres left in).'),
 ...a('2.','15 N. μsN = 0.45 × 39.2 = 17.6 N is only the limit; the crate holds, so friction matches the push.','17.6 N (μsN).'),
 ...a('3.','System: a = 0.50 × 9.8 ÷ 2.5 = 1.96 m/s². Cart: T = 2.0 × 1.96 = 3.9 N.','T = mg = 4.9 N; a = 4.9 ÷ 2.0 (only the cart’s mass).'),
 P([{b:'Concepts'}],{size:24,before:100,keepNext:true}),
 ...a('4.','Less. The hanging mass speeds up downward, so the net force on it points down: mg is bigger than T. T = m(g − a) = 0.50(9.8 − 1.96) = 3.9 N.','“The same, the string still holds the mass.”'),
 ...a('5.','Each piece of chain holds everything below it, so the tension grows toward the top. Above the bottom link: 4.9 N. At the hook: 6 × 4.9 = 29.4 N.','Agreeing; or giving 29.4 N everywhere.'),
 ...a('6.','(a) True: an ideal pulley only turns the string. (b) False: it reads 20 N. One person is the wall the other pulls against; the scale holds 20 N at each end.','(b) 40 N, adding the two pulls.'),
 P([{b:'Practice'}],{size:24,before:100,keepNext:true}),
 ...a('7.','(a) 0.98, 1.96, 2.94, 3.92 N.  (b) k = 0.98 ÷ 0.033 = 30 N/m (any row, or the slope of F against x).  (c) x = 6.37 ÷ 30 = 0.21 m = 21 cm.','Using the mass for the force (k ≈ 3); centimetres left in (k ≈ 0.30).'),
 ...a('8.','a = 0.60 × 9.8 ÷ 2.1 = 2.8 m/s². T = 1.5 × 2.8 = 4.2 N. Stretch = 4.2 ÷ 120 = 0.035 m = 3.5 cm.','T = 5.9 N (held value); stretch from mg.'),
 P([{b:'The chain'}],{size:24,before:100,keepNext:true}),
 ...a('9.','(a) (0.30 + 2.5) × 9.8 = 27 N.  (b) (1.8 + 2.5) × 9.8 = 42 N.  (c) (3.0 + 2.5) × 9.8 = 54 N.  (d) A straight line rising 2.9 N a link, from 27 N to 54 N.','Leaving out the bucket (2.9, 17.6, 29.4 N); counting links from the top.'),
 img('axes_key.png',190,127),
 P([{b:'The skywalks'}],{size:24,before:100,keepNext:true}),
 ...a('10.','The upper walkway has its weight down (40 kN) and its nut up: the nut gives 40 kN. Rod above it holds both walkways: 80 kN. Rod below it holds the lower walkway: 40 kN.','80 kN on the nut (the rod’s tension, not the nut’s).'),
 ...a('11.','Nut up; the walkway’s own 40 kN and the lower rod’s 40 kN down. The nut gives 80 kN.','40 kN, the on-paper answer.'),
 ...a('12.','On paper, 40 kN is under 60 kN: it holds. As built, 80 kN is over 60 kN: it pulls through. The change doubled the load on that nut. The friend is wrong: the rod tensions are the same in both designs (80 kN above, 40 kN below). What changed was the load where the upper beam meets its nut, and that is what failed.','“Both hold, the rods carry the same load”; agreeing with the friend.'),
 ...a('13.','Bottom: 6.0 × 9.8 = 59 N. Middle: (6.0 + 1.0) × 9.8 = 69 N. Top: 8.0 × 9.8 = 78 N. A light string has no weight of its own to hold, so its tension is the same all along.','59 N everywhere.'),
 P([{b:'Practice Set B'}],{size:24,before:100,keepNext:true}),
 ...a('B1.','System: a = (7.84 − 0.15 × 19.6) ÷ 2.8 = 1.75 m/s². Hanging mass: T = 0.80(9.8 − 1.75) = 6.4 N (cart check: 2.0 × 1.75 + 2.94 = 6.4 N). Stretch = 6.4 ÷ 90 = 0.072 m = 7.2 cm.','Friction from the whole system’s weight.'),
 ...a('B2.','a = 11 ÷ 5.5 = 2.0 m/s². At the cart: T = 4.0 × 2.0 = 8.0 N. Middle: (4.0 + 0.75) × 2.0 = 9.5 N.','11 N everywhere along the rope.'),
 ...a('B3.','Speeding up going up: T = 2.0(9.8 + 1.5) = 22.6 N, stretch 0.28 m. Slowing down going up (a points down): T = 2.0(9.8 − 1.5) = 16.6 N, stretch 0.21 m.','Using + 1.5 both times (the direction of motion, not of a).'),
 P([{b:'Exit check: answers'}],{size:24,before:140,keepNext:true}),
 ...a('1.','k = 0.30 × 9.8 ÷ 0.040 = 74 N/m.','7.5 (mass for force) or 0.74 (centimetres).'),
 ...a('2.','a = 6.86 ÷ 4.2 = 1.63 m/s². T = 3.5 × 1.63 = 5.7 N.','6.9 N (the held value, mg).'),
 ...a('3.','Above link 2: (0.40 + 1.0) × 9.8 = 13.7 N. At the hook: (1.0 + 1.0) × 9.8 = 19.6 N.','Forgetting the lamp; counting from the top.'),
 P([{b:'The 4-of-5 decision'}],{size:24,before:140,keepNext:true}),
 P(['Sort the slips into two piles: all three right, and one or more missed. If 4 of every 5 slips are in the first pile, Day 7 is the quiz as planned. Fewer than that: open Day 7 with the flex reteach on the item most often missed, then give the quiz. Where each item lives:'],{after:40}),
 P([{b:'Item 1: '},'Day 5 board (#lesson=springs), frames 1 and 3, then the lab’s check 1.'],{indent:360,after:20}),
 P([{b:'Item 2: '},'Day 4 board (#lesson=systems), frame 2 (system for a, one object for T), then the lab’s check 2.'],{indent:360,after:20}),
 P([{b:'Item 3: '},'Today’s board (#lesson=practice6), frame 1 (cut the chain: what hangs below?), then the lab’s Part D.'],{indent:360,after:20})];
 return save([page(c)],'day-06-practice-key.docx');
}
/* ---------------- the teacher run sheet ---------------- */
function run(){
 const rows=[['Clock','Up','Do','Watch for'],
 ['0:00–3:00','Board, frame 0 (#lesson=practice6 on the physics board).','Students open Virtual Lab 6 (physics hub, or physics/virtual-lab/index.html?lab=06-spring-scales), type their name, read the two cards and walk to the bench.','The hook question on the board: leave it covered until Part C.'],
 ['3:00–13:00','The lab, Parts A and B.','Part A: three masses, then k (checks 1). Part B: held, then predict and release on two setups (check 2).','k typed with centimetres (the hint says so). Students who lock: type today’s unlock code on their screen (teacher page).'],
 ['13:00','Board, frame 1. The bell calls the huddle on every screen.','Eyes up. Uncover the five blanks one at a time and draw T and mg on the held and released boxes. Give today’s huddle code (teacher page).','“Released, T = mg.” Ask which arrow is longer and why.'],
 ['13:00–25:00','The lab, Parts C and D.','Part C: both designs, then the question; the true story follows. Part D: three gaps, predict the top, read it. Check 3, hand in.','Students who finish early start the sheet. The lab can be shortened for one class with ?min=NN on the address.'],
 ['25:00–43:00','Practice sheet, items 1 to 13. Board, frame 2 for whiteboard rounds if the room stalls.','Walk the room. Items 4, 9 and 11 show the most. Set B goes to students who finish; it has no label.','Item 9: the bucket left out. Item 10: 80 kN on the nut (the rod’s tension).'],
 ['43:00–50:00','Board, frame 3. Exit slips.','Slips on paper, alone, silent. Collect at the bell.','Do not review the answers; the slips decide tomorrow.']];
 const c=[P([{b:'Forces, Day 6: practice run sheet'}],{size:30,after:60}),
 P(['Connected objects and springs (3.13, 3.14). Online first (Virtual Lab 6, 25 minutes from the bell, one huddle at minute 13), then paper (sheet, exit slip). The real things today: the Hyatt Regency skywalks and a hanging chain. Board: ',{i:'physics/whiteboard/index.html#lesson=practice6'}],{after:100,size:20}),
 grid(rows,[1300,2500,3900,3100],{rowH:600}),
 P([{b:'The 4-of-5 decision. '},'Sort the exit slips into all three right and one or more missed. If 4 of every 5 are all right, Day 7 is the quiz as planned. Fewer: open Day 7 with the flex reteach on the item most missed (the key says where each one lives), then the quiz.'],{before:140,after:60}),
 P([{b:'If you run short. '},'Run the lab with ?min=22 (the huddle moves to minute 11). Cut sheet items 6 and 13. Never cut the exit slip.'],{after:60}),
 P([{b:'If you run long. '},'Whiteboard rounds on frame 2 before the sheet; items 4, 5, 9, 10 and 11 make good rounds.'],{after:60}),
 P([{b:'Values used. '},'The date, the city and the 114 deaths are the historical record. The 40 kN load and the 60 kN limit on the sheet are made-up round numbers ("suppose"); the real point holds: the change doubled the load on the upper connection. The lab’s walkway model uses kilograms on a bench, not the hotel’s loads.'],{after:60})];
 return save([page(c)],'day-06-practice-run-sheet.docx');
}
({sheet,setB,slips,key,run})[MODE==='setb'?'setB':MODE]();
