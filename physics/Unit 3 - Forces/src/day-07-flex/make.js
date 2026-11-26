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

/* ---------------- the flex sheet: one short set per standard, one page ---------------- */
function sheet(){
 const sub=(t)=>P([t],{indent:360,after:0});
 const c=[...head('Before the Quiz: Friction, Inclines, Systems, Springs'),
 H('Friction'),
 item(1,'A 14 kg crate sits on a floor. μs = 0.30 and μk = 0.15.'),
 sub('(a)  It is pushed with 30 N. Does it move? How big is the friction?'),...ln(1,150),
 sub('(b)  It is pushed with 50 N instead. Find its acceleration.'),...ln(2,150),
 H('Inclines'),
 item(2,'A 5.0 kg block sits on a frictionless 25° ramp. Find the part of its weight along the ramp, the normal force, and its acceleration.'),...ln(3,150),
 H('Connected objects'),
 item(3,'A 2.5 kg cart on a frictionless table is tied to a 0.50 kg hanging mass over a pulley. Find the acceleration and the tension.'),...ln(2,150),
 item(4,'An Atwood machine holds a 6.0 kg mass and a 2.0 kg mass. Find the acceleration and the tension.'),...ln(2,150),
 H('Springs'),
 item(5,'A spring stretches 0.030 m when it is pulled with 2.4 N. Find k.'),...ln(1,150),
 item(6,'A 0.45 kg mass hangs at rest on a spring with k = 60 N/m. How far does the spring stretch?'),...ln(1,150)];
 return save([page(c)],'day-07-flex-sheet.docx');
}
function key(){
 const a=(n,ans,err)=>[P([{b:n+'  '},{r:ans}],{after:20,before:70,keepNext:true}),P([{i:'Likely error: '},err],{after:30,indent:360,size:20})];
 const c=[P([{b:'KEY'}],{size:28,after:20}),P([{b:'Before the Quiz: Friction, Inclines, Systems, Springs'}],{size:30,after:100}),
 ...a('1.','N = 137.2 N; μsN = 41.2 N. (a) 30 N is less: it holds, friction = 30 N. (b) 50 N beats 41.2 N: fk = 20.6 N, a = (50 − 20.6) ÷ 14 = 2.1 m/s².','(a) 41.2 N; (b) using μs, or 50 ÷ 14.'),
 ...a('2.','mg = 49 N. Along: 49 sin 25° = 20.7 N. N = 49 cos 25° = 44.4 N. a = 9.8 sin 25° = 4.1 m/s².','sin and cos swapped; calculator in radians.'),
 ...a('3.','a = 4.9 ÷ 3.0 = 1.63 m/s². T = 2.5 × 1.63 = 4.1 N.','T = 4.9 N; dividing by the cart’s mass only.'),
 ...a('4.','a = (6.0 − 2.0)(9.8) ÷ 8.0 = 4.9 m/s². T = 2.0(9.8 + 4.9) = 29.4 N; check 6.0(9.8 − 4.9) = 29.4 N.','Dividing by 4.0 kg; T = 58.8 N.'),
 ...a('5.','k = 2.4 ÷ 0.030 = 80 N/m.','0.0125 (x ÷ F).'),
 ...a('6.','F = 4.41 N; x = 4.41 ÷ 60 = 0.074 m.','0.45 ÷ 60 (mass for force).')];
 return save([page(c)],'day-07-flex-key.docx');
}
function run(){
 const rows=[['Clock','Up','Do','Watch for'],
 ['Before class','Day 6 exit slips, sorted.','Note which item each student missed: 1 springs, 2 the string, 3 what hangs below.','Students who got all three right.'],
 ['0:00–20:00','Flex sheet (day-07-flex-sheet). Day 6 board (#lesson=practice6), frames 1 and 2.','If 4 of 5 slips were all right: everyone works the flex sheet, then compares answers in pairs. If not: reteach the item most missed for 8 minutes (springs: Day 5 board, frames 1 and 3; the string: Day 4 board, frame 2; what hangs below: Day 6 board, frame 1), then the flex sheet.','Students who got the slip right start the flex sheet at once. Do not give the key until after the quiz.'],
 ['20:00–23:00','Equation sheet out (forces-equation-sheet).','Clear desks, calculators out, quiz face down.',''],
 ['23:00–48:00','Quiz (forces-quiz).','25 minutes, alone, silent. Collect at 48:00.','The quiz covers 3.11 to 3.14 only; the third law had its own quiz.'],
 ['48:00–50:00','','Day 8 preview: the cargo ramp in the ramp-and-pulley sandbox.','']];
 const c=[P([{b:'Forces, Day 7: flex and quiz run sheet'}],{size:30,after:60}),
 P(['Friction, inclines, connected objects and springs (3.11 to 3.14). Flex first, driven by the Day 6 exit slips, then a 25-minute quiz (28 points, 8 questions). Quiz key: ',{i:'forces-quiz-key.pdf'},'.'],{after:100,size:20}),
 grid(rows,[1300,2700,4000,2800],{rowH:600}),
 P([{b:'Scoring. '},'Points are in brackets on the quiz; the key gives the point for each step. A right answer with no work earns the answer point only.'],{before:140,after:60}),
 P([{b:'After the quiz. '},'Mark it before Day 9 (review). Any question under 60 percent across the class goes first on the review day.'],{after:60}),
 P([{b:'Numbers. '},'No quiz or flex item uses a test number.'],{after:60})];
 return save([page(c)],'day-07-run-sheet.docx');
}
({sheet,key,run})[MODE]();
