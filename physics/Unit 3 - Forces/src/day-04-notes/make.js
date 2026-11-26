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
const gap=(n=1)=>Array.from({length:n},()=>new Paragraph({children:[new TextRun({text:'',font:F})],spacing:{after:90}}));
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
 new TableRow({children:[cell([P([{bold:'Cornell Notes'}]),P(['Physics'],{size:20})],CUE,{shade:"D9D9D9"}),cell([P([{bold:'Topic: '},'Connected Objects']),P([{bold:'Unit 3: '},'Forces'],{size:20})],NOTE-2700),cell([P([{bold:'Name:'}]),P([{bold:'Date:'}])],2700)]}),
 new TableRow({children:[cell([P([{bold:'Essential question:'},' When objects are tied together, how do we find how fast they speed up and how hard the string pulls?'],{size:24})],W,{span:3})]})]});
const rowsMain=[
 row([P([{bold:'PART 1: SYSTEMS'}],{size:20,after:40}),cueQ('Why do the string forces drop out?'),...cueT('System','the objects you choose to treat as one',1),...cueT('Internal force','a force between two objects inside the system',1),...cueT('External force','a force from something outside the system',1)],[
  P(['Treat the tied objects as one ',{b:'system'},'. The string pulls the two objects with equal and ',{b:'opposite'},' forces, so tension is ',{b:'internal'},' and cancels. Only ',{b:'external'},' forces change how the system moves.']),
  img(KEY?'carts.png':'carts_blank.png',290,97),
  P(['System: ',{i:'a'},' = (net external force) ÷ (total mass). Then look at ',{b:'one'},' object to find the tension.'],{bullet:true}),
  P([{bold:'Example. '},'2.0 kg and 4.0 kg carts, frictionless floor, pulled with 12 N. ',{i:'a'},' = 12 ÷ 6.0 = ',{b:'2.0 m/s²'},'. The back cart: ',{i:'T'},' = 2.0 × 2.0 = ',{b:'4.0 N'},'.'],{before:60}),
  ...chk('A student says the rope between the two carts pulls with 12 N, because that is the pull. What is wrong?','The rope only has to speed up the 2.0 kg cart: T = 2.0 × 2.0 = 4.0 N. The 12 N speeds up both carts.',1)]),
 row([P([{bold:'PART 2: A TABLE AND A HANGING MASS'}],{size:20,after:40}),cueQ('What pulls the system along?')],[
  P(['The only external force along the string is the hanging mass’s ',{b:'weight'},'. It has to speed up ',{b:'both'},' masses.']),
  img(KEY?'table.png':'table_blank.png',250,140),
  P([{bold:'Example. '},'5.0 kg cart, frictionless table, 2.0 kg hanging. System: ',{i:'a'},' = 19.6 ÷ 7.0 = ',{b:'2.8 m/s²'},'. Cart alone: ',{i:'T'},' = 5.0 × 2.8 = ',{b:'14 N'},'.'],{before:40}),
  P(['Check with the hanging mass: 19.6 − ',{i:'T'},' = 2.0 × 2.8, so ',{i:'T'},' = 14 N. ',{i:'T'},' is ',{b:'less'},' than its weight, because it speeds up downward.'],{bullet:true}),
  ...chk('A student says the hanging mass falls with a = g = 9.8 m/s². What is wrong?','The weight must speed up the cart too, so a is less than g: 2.8 m/s². The string holds the hanging mass back.',1)]),
 row([P([{bold:'PART 3: THE ATWOOD MACHINE'}],{size:20,after:40}),cueQ('Two masses over one pulley: which way, how fast?'),...cueT('Atwood machine','two masses hanging on one string over a pulley',1)],[
  P(['The ',{b:'heavier'},' side goes down. The net external force is the ',{b:'difference'},' of the two weights, and it speeds up the ',{b:'total'},' mass.']),
  img(KEY?'atwood.png':'atwood_blank.png',150,136),
  P([{bold:'Example. '},'4.0 kg and 6.0 kg. ',{i:'a'},' = (58.8 − 39.2) ÷ 10 = ',{b:'1.96 m/s²'},'. The 4.0 kg mass goes up: ',{i:'T'},' − 39.2 = 4.0 × 1.96, so ',{i:'T'},' = ',{b:'47 N'},'.'],{before:40}),
  ...chk('Two 3.0 kg masses hang over a pulley. Find a and T.','Equal weights: a = 0, and T = 3.0 × 9.8 = 29.4 N.',1)]),
 row([P([{bold:'PART 4: FRICTION ON THE TABLE'}],{size:20,after:40}),cueQ('What changes if the table has friction?')],[
  P(['Friction is one more external force, pointing ',{b:'against'},' the motion. It acts only on the table mass, so use ',{b:'that mass’s'},' ',{i:'N'},'.']),
  P([{bold:'Example. '},'The 5.0 kg cart with ',{i:'μ'},{sub:'k'},' = 0.20: ',{i:'f'},{sub:'k'},' = 0.20 × 49 = ',{b:'9.8 N'},'. ',{i:'a'},' = (19.6 − 9.8) ÷ 7.0 = ',{b:'1.4 m/s²'},'. Cart: ',{i:'T'},' − 9.8 = 5.0 × 1.4, so ',{i:'T'},' = ',{b:'16.8 N'},'.'],{before:40}),
  ...chk('A student finds the friction with N = (5.0 + 2.0) × 9.8. What is wrong?','Only the cart presses on the table. N = 5.0 × 9.8 = 49 N; the hanging mass is not on the table.',1)]),
 row([P([{bold:'EXIT CHECK'}],{size:20,after:40}),cueQ('Show what you know')],[
  P(['A 3.0 kg block on a frictionless table is tied over a pulley to a 1.5 kg hanging mass. Find the acceleration.'],{num:'n1'}),
  ...(KEY?[P([{key:'a = 14.7 ÷ 4.5 = 3.3 m/s².'}])]:gap(1)),
  P(['Find the tension in the string.'],{num:'n1'}),
  ...(KEY?[P([{key:'T = 3.0 × 3.27 = 9.8 N (check: 14.7 − 1.5 × 3.27 = 9.8 N).'}])]:gap(1)),
  P(['An Atwood machine holds 2.0 kg and 8.0 kg. Which side goes down, and how fast does it speed up?'],{num:'n1'}),
  ...(KEY?[P([{key:'The 8.0 kg side; a = (78.4 − 19.6) ÷ 10 = 5.9 m/s².'}])]:gap(1)),
  P([{bold:'Summary. '},'Answer the essential question in two or three sentences. Use the words “system” and “tension.”'],{before:120,after:40}),
  ...(KEY?[P([{key:'Treat the tied objects as one system: the tension is internal and cancels, so a = net external force ÷ total mass. Then look at one object alone to find the tension.'}])]:gap(2))]),
];
const body=new Table({width:{size:W,type:WidthType.DXA},columnWidths:[CUE,NOTE],rows:rowsMain});
const num=(r,fmt,text)=>({reference:r,levels:[{level:0,format:fmt,text,alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:360,hanging:280}}}}]});
const doc=new Document({numbering:{config:[{reference:"b",levels:[{level:0,format:LevelFormat.BULLET,text:"•",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:360,hanging:240}}}}]},
 num("n1",LevelFormat.LOWER_LETTER,"%1."),num("s1",LevelFormat.DECIMAL,"Step %1.")]},
 styles:{default:{document:{run:{font:F,size:22}}}},
 sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:720,bottom:720,left:720,right:720}}},
 children:[...(KEY?[P([{bold:'KEY'}],{size:24})]:[]),header,new Paragraph({children:[],spacing:{after:80}}),body]}]});
Packer.toBuffer(doc).then(b=>fs.writeFileSync(KEY?'day-04-systems-notes-key.docx':'day-04-systems-notes.docx',b));
