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
 new TableRow({children:[cell([P([{bold:'Cornell Notes'}]),P(['Physics'],{size:20})],CUE,{shade:"D9D9D9"}),cell([P([{bold:'Topic: '},'Inclines']),P([{bold:'Unit 3: '},'Forces'],{size:20})],NOTE-2700),cell([P([{bold:'Name:'}]),P([{bold:'Date:'}])],2700)]}),
 new TableRow({children:[cell([P([{bold:'Essential question:'},' What part of an object’s weight pulls it down a ramp, and how hard does the ramp push back?'],{size:24})],W,{span:3})]})]});
const mu=(s)=>['μ',{sub:s}];
const rowsMain=[
 row([P([{bold:'PART 1: TILTED AXES'}],{size:20,after:40}),cueQ('Which way do the forces on a ramp point?'),...cueT('Incline','a ramp: a flat surface tilted at an angle θ',1),...cueT('Perpendicular','at 90° to a surface',1)],[
  P(['On a ramp, the normal force points ',{b:'perpendicular'},' to the surface, not straight up. Weight still points straight ',{b:'down'},'.']),
  img(KEY?'fbd.png':'fbd_blank.png',290,161),
  P(['Tilt the axes: one ',{b:'along'},' the ramp, the way the object can move, and one into the ramp.'],{bullet:true}),
  ...chk('A student draws the normal force on a block on a ramp pointing straight up. What is wrong?','The ramp pushes perpendicular to its own surface, so N tilts with the ramp.',1)]),
 row([P([{bold:'PART 2: SPLITTING THE WEIGHT'}],{size:20,after:40}),cueQ('How much of the weight pulls along the ramp?'),...cueT('Component','one part of a force along one axis',1)],[
  P(['Split the weight ',{i:'mg'},' into two ',{b:'components'},'. The angle between the weight and the into-the-ramp part is the ramp angle θ.']),
  img(KEY?'split.png':'split_blank.png',290,161),
  strip([['','Along the ramp (down)','Into the ramp'],['Part of the weight',{b:'mg sin θ',w:10},{b:'mg cos θ',w:10}],['At θ = 0° (flat)',{b:'0',w:4},{b:'mg',w:4}],['At θ = 90° (wall)',{b:'mg',w:4},{b:'0',w:4}]],1900),
  P([{bold:'Example. '},'5.0 kg on a 20° ramp: ',{i:'mg'},' = 49 N. Along: 49 sin 20° = ',{b:'16.8 N'},'. Into: 49 cos 20° = ',{b:'46 N'},'.'],{before:80}),
  ...chk('On a 10° ramp, which part of the weight is bigger: along or into the ramp? How can you tell without a calculator?','Into the ramp. A 10° ramp is almost flat, and on a flat floor all of the weight is into the floor.',1)]),
 row([P([{bold:'PART 3: NORMAL FORCE AND ACCELERATION'}],{size:20,after:40}),cueQ('How hard does the ramp push? How fast does it slide?')],[
  P(['The block does not sink into the ramp, so ',{i:'N'},' balances the into-the-ramp part: ',{i:'N'},' = ',{b:'mg cos θ'},'. On a ramp, ',{i:'N'},' is ',{b:'less'},' than ',{i:'mg'},'.']),
  P(['With no friction, the only force along the ramp is ',{i:'mg'},' sin θ, so ',{i:'a'},' = ',{b:'g sin θ'},'. The mass ',{b:'cancels'},'.'],{bullet:true}),
  P([{bold:'Example. '},'The 5.0 kg block: ',{i:'N'},' = ',{b:'46 N'},'. With no friction, ',{i:'a'},' = 9.8 sin 20° = ',{b:'3.4 m/s²'},' down the ramp.'],{before:60}),
  ...chk('A student says a heavy crate slides down a frictionless ramp faster than a light one. What is wrong?','a = g sin θ. The mass cancels, so both have the same acceleration.',2)]),
 row([P([{bold:'PART 4: FRICTION ON A RAMP'}],{size:20,after:40}),cueQ('What holds a block still on a ramp?')],[
  P(['A block at rest on a ramp would slide ',{b:'down'},', so static friction points ',{b:'up'},' the ramp and matches ',{i:'mg'},' sin θ.']),
  P(['Use the ramp’s ',{i:'N'},' in the friction rules: ',{i:'f'},{sub:'k'},' = ',...mu('k'),' ',{i:'mg'},' cos θ.'],{bullet:true}),
  P([{bold:'Example. '},'The block at rest: friction = ',{b:'16.8 N'},' up the ramp. If it slides down with ',...mu('k'),' = 0.20: ',{i:'f'},{sub:'k'},' = 0.20 × 46 = ',{b:'9.2 N'},', ΣF = 16.8 − 9.2 = 7.6 N, ',{i:'a'},' = ',{b:'1.5 m/s²'},'.'],{before:60}),
  ...chk('A box sits still on a 15° ramp. Which way does friction point, and how big is it compared with mg sin 15°?','Up the ramp, and the same size as mg sin 15°.',1)]),
 row([P([{bold:'EXIT CHECK'}],{size:20,after:40}),cueQ('Show what you know')],[
  P(['A 4.0 kg block sits on a frictionless 35° ramp. Find the part of its weight along the ramp, and the normal force.'],{num:'n1'}),
  ...(KEY?[P([{key:'mg = 39.2 N. Along: 39.2 sin 35° = 22 N. N = 39.2 cos 35° = 32 N.'}])]:gap(2)),
  P(['Find the block’s acceleration.'],{num:'n1'}),
  ...(KEY?[P([{key:'a = 9.8 sin 35° = 5.6 m/s² down the ramp.'}])]:gap(1)),
  P(['Why does the acceleration not depend on the block’s mass?'],{num:'n1'}),
  ...(KEY?[P([{key:'The force along the ramp, mg sin θ, grows with the mass, so a = mg sin θ ÷ m = g sin θ.'}])]:gap(1)),
  P([{bold:'Summary. '},'Answer the essential question in two or three sentences. Use the words “mg sin θ” and “mg cos θ.”'],{before:120,after:40}),
  ...(KEY?[P([{key:'The part of the weight along the ramp is mg sin θ, and it pulls the object down the ramp. The ramp pushes back with N = mg cos θ, which is less than mg.'}])]:gap(2))]),
];
const body=new Table({width:{size:W,type:WidthType.DXA},columnWidths:[CUE,NOTE],rows:rowsMain});
const num=(r,fmt,text)=>({reference:r,levels:[{level:0,format:fmt,text,alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:360,hanging:280}}}}]});
const doc=new Document({numbering:{config:[{reference:"b",levels:[{level:0,format:LevelFormat.BULLET,text:"•",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:360,hanging:240}}}}]},
 num("n1",LevelFormat.LOWER_LETTER,"%1."),num("s1",LevelFormat.DECIMAL,"Step %1.")]},
 styles:{default:{document:{run:{font:F,size:22}}}},
 sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:720,bottom:720,left:720,right:720}}},
 children:[...(KEY?[P([{bold:'KEY'}],{size:24})]:[]),header,new Paragraph({children:[],spacing:{after:80}}),body]}]});
Packer.toBuffer(doc).then(b=>fs.writeFileSync(KEY?'day-02-inclines-notes-key.docx':'day-02-inclines-notes.docx',b));
