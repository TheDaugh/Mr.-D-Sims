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

/* ---------------- the student sheet: review, concepts, practice, the real thing (two pages) ---------------- */
function sheet(){
 const c=[...head('Practice: Friction and Inclines'),
 H('Review'),
 item(1,'A 9.0 kg box rests on a floor with μs = 0.45. You push it sideways with 25 N and it does not move. How big is the friction force?'),...ln(1),
 item(2,'A block sits on a 15° ramp. Which part of its weight is bigger, mg sin θ or mg cos θ? How do you know?'),...ln(1),
 item(3,'A block slides down a ramp. Which way does friction on it point?'),...ln(1),
 H('Concepts'),
 item(4,'A student solved this: “A 10 kg crate with μs = 0.50 is pushed with 30 N and stays put. Friction = μs N = 0.50 × 98 = 49 N.” What is wrong? Fix it.'),...ln(2),
 item(5,'A student drew the forces on a block at rest on a ramp. Find two mistakes. Say what is wrong with each, and redraw the diagram correctly beside it.'),
 img('err_blank.png',245,151),
 P(['Mistake 1:  ________________________________________________________________'],{indent:360,after:60}),
 P(['Mistake 2:  ________________________________________________________________'],{indent:360,after:60}),
 item(6,'True or false? Give a reason for each.'),
 P(['(a)  A heavy crate slides down a frictionless ramp faster than a light one.'],{indent:360,after:0}),...ln(1,150),
 P(['(b)  Once a crate is sliding, pushing it harder makes the friction on it bigger.'],{indent:360,after:0}),...ln(1,150),
 H('Practice'),
 item(7,'An 8.0 kg crate sits on a floor. μs = 0.60 and μk = 0.45.'),
 P(['(a)  Find the normal force and the largest static friction.'],{indent:360,after:0}),...ln(1,150),
 P(['(b)  It is pushed with 40 N. Does it move? How big is the friction?'],{indent:360,after:0}),...ln(1,150),
 P(['(c)  It is pushed with 60 N instead. Find the friction and the acceleration.'],{indent:360,after:0}),...ln(2,150),
 item(8,'A 6.0 kg block sits on a frictionless 28° ramp. Find the part of its weight along the ramp, the normal force, and its acceleration.'),...ln(3,150),
 H('Pittsburgh’s steepest street'),
 P(['Canton Avenue in Beechview has a 37% grade: the road rises 37 m for every 100 m across. It is one of the steepest public streets in the United States, and in winter it is close to impassable.'],{after:60}),
 img('canton.png',300,130),
 item(9,'Find the angle θ of the street.'),...ln(1,150),
 item(10,'A 1500 kg car is parked on it. Find the part of its weight along the street and the normal force.'),...ln(2,150),
 item(11,'How much static friction does the car need to stay put? On dry pavement μs is about 0.70; on ice it is about 0.10. Does the parked car hold on each? Show how you know.'),...ln(3,150),
 item(12,'A friend says a heavier car would hold better on ice because it presses harder into the road. Is the friend right? Explain.'),...ln(2,150),
 item(13,'With μs = 0.70, what is the steepest street a car could park on? Give the angle.'),...ln(2,150)];
 return save([page(c)],'day-03-practice-sheet.docx');
}
/* ---------------- set B: its own sheet, no labels ---------------- */
function setB(){
 const c=[...head('Practice Set B: Friction and Inclines'),
 item(1,'A block rests on a ramp and is just about to slip. Show that tan θ = μs, and say why the block’s mass does not matter.',{before:160}),...ln(5,190),
 item(2,'A block slides down a 32° ramp with μk = 0.25. Find its acceleration.',{before:240}),...ln(4,190),
 item(3,'An icy morning: a car starts sliding down Canton Avenue from rest with μk = 0.05. Find its acceleration down the street, and its speed after it has slid 20 m.',{before:240}),...ln(5,190)];
 return save([page(c)],'day-03-practice-sheet-b.docx');
}
/* ---------------- exit slips: four to a page ---------------- */
function slips(){
 const slip=()=>[P([{b:'Exit check'},'      Name: ________________________'],{after:100}),
  P(['A 15 kg crate sits on a floor. μs = 0.40 and μk = 0.20.'],{after:80}),
  P([{b:'1.  '},'It is pushed with 50 N. How big is the friction?'],{after:40}),...ln(1,170),
  P([{b:'2.  '},'It is pushed with 70 N instead. Find its acceleration.'],{after:40,before:80}),...ln(2,170),
  P([{b:'3.  '},'A 3.0 kg block sits on a frictionless 22° ramp. Find the normal force and its acceleration.'],{after:40,before:80}),...ln(2,170)];
 const cw=5400, mk=()=>cell(slip(),cw,{borders:{top:thin,bottom:thin,left:thin,right:thin},va:VerticalAlign.TOP});
 const t=new Table({width:{size:W,type:WidthType.DXA},columnWidths:[cw,cw],rows:[0,1].map(()=>new TableRow({cantSplit:true,height:{value:7100,rule:"atLeast"},children:[mk(),mk()]}))});
 return save([page([t],500)],'day-03-practice-exit-slips.docx');
}
/* ---------------- the key ---------------- */
function key(){
 const a=(n,ans,err)=>[P([{b:n+'  '},{r:ans}],{after:20,before:70,keepNext:true}),P([{i:'Likely error: '},err],{after:30,indent:360,size:20})];
 const c=[P([{b:'KEY'}],{size:28,after:20}),P([{b:'Practice: Friction and Inclines'}],{size:30,after:100}),
 P([{b:'Review'}],{size:24,before:60,keepNext:true}),
 ...a('1.','25 N. μsN = 0.45 × 88.2 = 39.7 N is only the limit; the box holds, so friction matches the push.','39.7 N (μsN).'),
 ...a('2.','mg cos θ. A 15° ramp is almost flat, and on a flat floor all of the weight presses into the floor (cos 15° = 0.97, sin 15° = 0.26).','Swapping sin and cos.'),
 ...a('3.','Up the ramp, against the sliding.','Down the ramp, “with the motion.”'),
 P([{b:'Concepts'}],{size:24,before:100,keepNext:true}),
 ...a('4.','μsN = 49 N is only the most static friction can give. The crate stays put, so friction matches the push: 30 N.','Agreeing with the student.'),
 ...a('5.','Mistake 1: N is drawn straight up; the ramp pushes perpendicular to its surface. Mistake 2: friction points down the ramp; the block would slide down, so static friction points up the ramp.','Finding only one mistake; “W should be perpendicular to the ramp.”'),
 img('err_key.png',190,117),
 ...a('6.','(a) False: a = g sin θ, the mass cancels. (b) False: kinetic friction is μkN; it does not depend on the push or the speed.','(a) True, “heavier things are pulled harder” without seeing they also need more force to speed up.'),
 P([{b:'Practice'}],{size:24,before:100,keepNext:true}),
 ...a('7.','(a) N = 78.4 N; μsN = 47 N.  (b) 40 N is less than 47 N: it holds, friction = 40 N.  (c) 60 N beats 47 N: it slides. fk = 0.45 × 78.4 = 35.3 N; a = (60 − 35.3) ÷ 8.0 = 3.1 m/s².','(b) 47 N or 35.3 N; (c) using μs, or 60 ÷ 8 = 7.5 m/s² with no friction.'),
 ...a('8.','mg = 58.8 N. Along: 58.8 sin 28° = 27.6 N. N = 58.8 cos 28° = 51.9 N. a = 9.8 sin 28° = 4.6 m/s².','sin and cos swapped; N = mg; calculator in radians.'),
 P([{b:'Canton Avenue'}],{size:24,before:100,keepNext:true}),
 ...a('9.','tan θ = 37 ÷ 100 = 0.37, so θ = 20.3°.','sin θ = 0.37 (21.7°); taking 37% as 37°.'),
 ...a('10.','mg = 14,700 N. Along: 14,700 sin 20.3° = 5,100 N. N = 14,700 cos 20.3° = 13,800 N.','sin and cos swapped.'),
 ...a('11.','It needs 5,100 N of static friction up the street. Dry: μsN = 0.70 × 13,800 = 9,650 N, more than 5,100 N, so it holds. Ice: 0.10 × 13,800 = 1,380 N, less than 5,100 N, so it slides.','Comparing with mg instead of mg sin θ; using mg for N.'),
 ...a('12.','No. A heavier car presses harder (N grows) but is also pulled down the street harder (mg sin θ grows by the same factor). Mass cancels: it holds only if μs ≥ tan θ.','Agreeing with the friend.'),
 ...a('13.','At the edge, μs mg cos θ = mg sin θ, so tan θ = μs = 0.70 and θ = 35° (a 70% grade).','sin θ = 0.70 (44°).'),
 P([{b:'Practice Set B'}],{size:24,before:100,keepNext:true}),
 ...a('B1.','At the edge, the largest static friction just balances the pull along the ramp: μs mg cos θ = mg sin θ. Divide by mg cos θ: tan θ = μs. Both sides carry m, so it cancels.','Leaving cos θ out of the friction.'),
 ...a('B2.','a = g(sin 32° − 0.25 cos 32°) = 9.8(0.530 − 0.212) = 3.1 m/s² down the ramp.','fk = μk mg (the floor’s N).'),
 ...a('B3.','a = 9.8(sin 20.3° − 0.05 cos 20.3°) = 2.9 m/s². v² = 2(2.94)(20) = 118, v = 10.8 m/s (about 24 mph).','Using g sin θ with no friction (3.4 m/s²).'),
 P([{b:'Exit check: answers'}],{size:24,before:140,keepNext:true}),
 ...a('1.','50 N. μsN = 0.40 × 147 = 58.8 N; 50 N is less, so it holds and friction matches the push.','58.8 N or 29.4 N.'),
 ...a('2.','70 N beats 58.8 N: it slides. fk = 0.20 × 147 = 29.4 N. a = (70 − 29.4) ÷ 15 = 2.7 m/s².','70 ÷ 15 = 4.7 (no friction); using μs (0.75 m/s²).'),
 ...a('3.','N = 29.4 cos 22° = 27.3 N. a = 9.8 sin 22° = 3.7 m/s².','N = 29.4 N; sin and cos swapped.'),
 P([{b:'The 4-of-5 decision'}],{size:24,before:140,keepNext:true}),
 P(['Sort the slips into two piles: all three right, and one or more missed. If 4 of every 5 slips are in the first pile, Day 4 is new material (connected objects). Fewer than that means another practice day. Reteach by the item most often missed:'],{after:40}),
 P([{b:'Item 1: '},'Day 1 board, frame 2 (static friction matches the push), then Friction Sandbox checkpoint 1.'],{indent:360,after:20}),
 P([{b:'Item 2: '},'Day 1 board, frame 4 (the three steps), then Friction Sandbox checkpoint 3.'],{indent:360,after:20}),
 P([{b:'Item 3: '},'Day 2 board, frames 2 and 3 (splitting the weight, N = mg cos θ, a = g sin θ).'],{indent:360,after:20})];
 return save([page(c)],'day-03-practice-key.docx');
}
/* ---------------- the teacher run sheet ---------------- */
function run(){
 const rows=[['Clock','Up','Do','Watch for'],
 ['0:00–5:00','Board, frame 0 (#lesson=practice3 on the physics board). Warm-up.','Three items as students walk in. At 3:00 remove the covers: 47 N; mg sin θ; up the ramp.','Item 1: 29 N (μkN) for the largest static friction.'],
 ['5:00–18:00','Friction Sandbox (physics/sandbox/friction-push.html), frame 1.','Free play for 4 minutes. Then everyone turns on the friction graph and grows the push on one surface: “What are the climb, the top and the drop?” Then checkpoints 1 and 3.','Friction “always μsN.” Students who pass early do checkpoint 2 (the mystery crate). Locked students need today’s unlock code.'],
 ['18:00–25:00','Ramp and Pulley Sandbox (physics/sandbox/ramp-pulley.html), counterweight off.','Set μs to 0.37 and raise the ramp until the crate slips. Read the angle: about 20°. “Hold on to that number.” Then μs 0.70: about 35°.','Students adding a counterweight. The slip angle does not depend on the crate’s mass: have one student try 5 kg and 40 kg.'],
 ['25:00–43:00','Practice sheet, items 1 to 13. Board, frame 2 for whiteboard rounds if the room stalls.','Walk the room. Items 4, 5 and 11 show the most. Set B goes to students who finish; it has no label.','Calculators in radians (item 8 gives 0.27). Item 9: 37° for a 37% grade. Item 11: comparing with mg.'],
 ['43:00–50:00','Board, frame 3. Exit slips.','Slips on paper, alone, silent. Collect at the bell.','Do not review the answers; the slips decide tomorrow.']];
 const c=[P([{b:'Forces, Day 3: practice run sheet'}],{size:30,after:60}),
 P(['Friction and inclines (3.11, 3.12). Online first (two sandboxes), then paper (sheet, exit slip). The real thing today: Canton Avenue, Pittsburgh. Board: ',{i:'physics/whiteboard/index.html#lesson=practice3'}],{after:100,size:20}),
 grid(rows,[1300,2500,3900,3100],{rowH:600}),
 P([{b:'The 4-of-5 decision. '},'Sort the exit slips into all three right and one or more missed. If 4 of every 5 are all right, tomorrow is new material: connected objects (Day 4). Fewer: another practice day, reteaching the item most missed (the key lists where each one lives).'],{before:140,after:60}),
 P([{b:'If you run short. '},'Cut the ramp sandbox to one slip angle (μs 0.37), and sheet items 2, 6 and 13. Never cut the exit slip.'],{after:60}),
 P([{b:'If you run long. '},'Shorten free play in the Friction Sandbox to 2 minutes; the Canton Avenue items and the slip are the part that decides Day 4.'],{after:60}),
 P([{b:'Values used. '},'Canton Avenue’s 37% grade is the figure on the city’s sign. The dry (0.70) and icy (0.10) values of μs are typical textbook values, not measured on that street.'],{after:60})];
 return save([page(c)],'day-03-practice-run-sheet.docx');
}
({sheet,setB,slips,key,run})[MODE==='setb'?'setB':MODE]();
