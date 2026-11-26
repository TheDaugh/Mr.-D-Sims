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
 new TableRow({children:[cell([P([{bold:'Cornell Notes'}]),P(['Physics'],{size:20})],CUE,{shade:"D9D9D9"}),cell([P([{bold:'Topic: '},'Friction']),P([{bold:'Unit 3: '},'Forces'],{size:20})],NOTE-2700),cell([P([{bold:'Name:'}]),P([{bold:'Date:'}])],2700)]}),
 new TableRow({children:[cell([P([{bold:'Essential question:'},' How big is the friction force, and why is starting a slide harder than keeping it going?'],{size:24})],W,{span:3})]})]});
const mu=(s)=>['μ',{sub:s}];
const rowsMain=[
 row([P([{bold:'PART 1: WHAT FRICTION IS'}],{size:20,after:40}),cueQ('Which way does friction point?'),...cueT('Friction','a contact force from a surface, along the surface, against sliding',1),...cueT('Normal force','the push of a surface on an object, perpendicular to the surface',1)],[
  P(['Friction is a ',{b:'contact'},' force. The surface exerts it ',{b:'along'},' the surface, and it points against the ',{b:'sliding'},', or against the way the object would slide.']),
  img(KEY?'fbd.png':'fbd_blank.png',240,126),
  P(['On a flat floor, with the push sideways, the floor holds the crate up: N = ',{b:'mg'},'.'],{bullet:true}),
  P([{bold:'Example. '},'The 12 kg crate: N = 12 × 9.8 = ',{b:'118 N'},'.'],{before:40}),
  ...chk('A box is pushed to the right but does not move. Which way does friction point? Why?','To the left. Without friction the box would slide right, so friction points against that.',2)]),
 row([P([{bold:'PART 2: STATIC FRICTION'}],{size:20,after:40}),cueQ('How big is friction when nothing slides?'),...cueT('Static friction','friction on an object that is not sliding; it matches the push, up to a limit',1),...cueT('Coefficient of static friction','μs, a number for the two surfaces (no units)',1)],[
  P(['When the object is not sliding, friction ',{b:'matches'},' the push, so the net force is ',{b:'zero'},'.']),
  P(['Static friction has a limit: ',{i:'f'},{sub:'s'},' ≤ ',...mu('s'),{i:'N'},'. Past ',...mu('s'),{i:'N'},', the object starts to ',{b:'slide'},'.'],{bullet:true}),
  P([{bold:'Example. '},'The crate has ',...mu('s'),' = 0.40, so the largest static friction is 0.40 × 118 = ',{b:'47 N'},'.'],{before:60}),
  strip([['Push (N)','0','10','30','50'],['Friction (N)',{b:'0',w:4},{b:'10',w:4},{b:'30',w:4},{b:'slides',w:6}]],1600),
  ...chk('A 10 kg box has μs = 0.60. It is pushed with 20 N and does not move. A student says friction is 58.8 N. What is wrong?','58.8 N is only the limit. Static friction matches the push, so it is 20 N.',2)]),
 row([P([{bold:'PART 3: KINETIC FRICTION'}],{size:20,after:40}),cueQ('How big is friction once it slides?'),...cueT('Kinetic friction','friction on a sliding object: fk = μk N',1),...cueT('Coefficient of kinetic friction','μk, usually smaller than μs',1)],[
  P(['Once the object slides, ',{i:'f'},{sub:'k'},' = ',...mu('k'),{i:'N'},'. It stays the ',{b:'same'},' however hard you push and however fast it goes.']),
  P([...mu('k'),' is usually ',{b:'smaller'},' than ',...mu('s'),', so friction ',{b:'drops'},' when the slide starts. That is why starting is harder than keeping it going.'],{bullet:true}),
  img(KEY?'graph.png':'graph_blank.png',250,144),
  strip([['','Static','Kinetic'],['When',{b:'not sliding',w:12},{b:'sliding',w:12}],['Size',{b:'matches the push, up to μsN',w:20},{b:'μkN, constant',w:16}]],1000),
  P([{bold:'Example. '},'The crate has ',...mu('k'),' = 0.25, so once it slides, ',{i:'f'},{sub:'k'},' = 0.25 × 118 = ',{b:'29 N'},'.'],{before:80}),
  ...chk('A student says pushing a sliding box harder makes kinetic friction bigger. What is wrong?','fk = μkN depends only on the surfaces and N, not on the push or the speed.',2)]),
 row([P([{bold:'PART 4: SOLVING FRICTION PROBLEMS'}],{size:20,after:40}),cueQ('Does it move? If it does, what is a?')],[
  P(['Find ',{i:'N'},'.'],{num:'s1'}),
  P(['Compare the push with ',...mu('s'),{i:'N'},'. Smaller: it stays put, friction = push, ',{i:'a'},' = ',{b:'0'},'. Bigger: it ',{b:'slides'},'.'],{num:'s1'}),
  P(['If it slides, use ',{i:'f'},{sub:'k'},' = ',...mu('k'),{i:'N'},' and ',{b:'ΣF = ma'},'.'],{num:'s1'}),
  P([{bold:'Example. '},'The 12 kg crate is pushed with 55 N. 55 N is more than 47 N, so it ',{b:'slides'},'. ΣF = 55 − 29 = ',{b:'26 N'},', so ',{i:'a'},' = 26 ÷ 12 = ',{b:'2.1 m/s²'},'.'],{before:80}),
  ...chk('An 8.0 kg box has μs = 0.55. It is pushed with 40 N. Does it move? Show how you know.','μsN = 0.55 × 78.4 = 43 N. 40 N is less, so it stays put and friction is 40 N.',2)]),
 row([P([{bold:'EXIT CHECK'}],{size:20,after:40}),cueQ('Show what you know')],[
  P(['A 15 kg toolbox slides across a floor with μk = 0.15. Find the kinetic friction.'],{num:'n1'}),
  ...(KEY?[P([{key:'N = 147 N, fk = 0.15 × 147 = 22 N.'}])]:gap(1)),
  P(['The toolbox is pulled sideways with 50 N while it slides. Find its acceleration.'],{num:'n1'}),
  ...(KEY?[P([{key:'ΣF = 50 − 22 = 28 N, a = 28 ÷ 15 = 1.9 m/s².'}])]:gap(2)),
  P(['A hockey puck slides to the left. Which way does friction point?'],{num:'n1'}),
  ...(KEY?[P([{key:'To the right, against the sliding.'}])]:gap(1)),
  P([{bold:'Summary. '},'Answer the essential question in two or three sentences. Use the words “static” and “kinetic.”'],{before:120,after:40}),
  ...(KEY?[P([{key:'Static friction matches the push up to μsN, so an object stays put until the push beats that limit. Once it slides, kinetic friction is μkN, which is usually smaller, so keeping it moving takes less force than starting it.'}])]:gap(2))]),
];
const body=new Table({width:{size:W,type:WidthType.DXA},columnWidths:[CUE,NOTE],rows:rowsMain});
const num=(r,fmt,text)=>({reference:r,levels:[{level:0,format:fmt,text,alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:360,hanging:280}}}}]});
const doc=new Document({numbering:{config:[{reference:"b",levels:[{level:0,format:LevelFormat.BULLET,text:"•",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:360,hanging:240}}}}]},
 num("n1",LevelFormat.LOWER_LETTER,"%1."),num("s1",LevelFormat.DECIMAL,"Step %1.")]},
 styles:{default:{document:{run:{font:F,size:22}}}},
 sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:720,bottom:720,left:720,right:720}}},
 children:[...(KEY?[P([{bold:'KEY'}],{size:24})]:[]),header,new Paragraph({children:[],spacing:{after:80}}),body]}]});
Packer.toBuffer(doc).then(b=>fs.writeFileSync(KEY?'day-01-friction-notes-key.docx':'day-01-friction-notes.docx',b));
