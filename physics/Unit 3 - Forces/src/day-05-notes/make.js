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
 new TableRow({children:[cell([P([{bold:'Cornell Notes'}]),P(['Physics'],{size:20})],CUE,{shade:"D9D9D9"}),cell([P([{bold:'Topic: '},'Springs']),P([{bold:'Unit 3: '},'Forces'],{size:20})],NOTE-2700),cell([P([{bold:'Name:'}]),P([{bold:'Date:'}])],2700)]}),
 new TableRow({children:[cell([P([{bold:'Essential question:'},' How does a spring tell us how big a force is?'],{size:24})],W,{span:3})]})]});
const rowsMain=[
 row([P([{bold:'PART 1: HOOKE’S LAW'}],{size:20,after:40}),cueQ('How hard does a stretched spring pull?'),...cueT('Stretch (x)','how far the spring is pulled past its natural length',1),...cueT('Spring constant (k)','the force per meter of stretch, in N/m',1)],[
  P(['A spring pulls back with a force that grows with its ',{b:'stretch'},': ',{i:'F'},' = ',{b:'kx'},'. Double the stretch, ',{b:'double'},' the force.']),
  img(KEY?'stretch.png':'stretch_blank.png',200,161),
  P([{i:'x'},' is measured from the ',{b:'natural'},' length, not the total length. A stiffer spring has a ',{b:'bigger'},' ',{i:'k'},'.'],{bullet:true}),
  P([{bold:'Example. '},{i:'k'},' = 80 N/m, stretched 0.15 m: ',{i:'F'},' = 80 × 0.15 = ',{b:'12 N'},'.'],{before:40}),
  ...chk('A spring with k = 100 N/m is 20 cm long. It is stretched to 26 cm. A student says F = 100 × 0.26 = 26 N. What is wrong?','x is the stretch, 0.06 m, not the total length: F = 100 × 0.06 = 6 N.',1)]),
 row([P([{bold:'PART 2: k FROM A GRAPH'}],{size:20,after:40}),cueQ('How do we measure k?')],[
  P(['Hang known forces and measure each stretch. ',{i:'F'},' against ',{i:'x'},' is a ',{b:'straight line'},' through the origin, and its ',{b:'slope'},' is ',{i:'k'},'.']),
  img(KEY?'graph.png':'graph_blank.png',250,175),
  P([{bold:'Example. '},'Slope = rise ÷ run = 6 N ÷ 0.050 m = ',{b:'120 N/m'},'.'],{before:40}),
  ...chk('Two springs are graphed on the same F against x axes. Line A is steeper than line B. Which spring is stiffer? How do you know?','A. Its slope, k, is bigger: it takes more force for each meter of stretch.',1)]),
 row([P([{bold:'PART 3: A HANGING MASS'}],{size:20,after:40}),cueQ('How far does a spring stretch under a mass?'),...cueT('Spring scale','a spring with a scale that reads its force in newtons',1)],[
  P(['A mass hanging at rest has ',{b:'zero'},' net force, so the spring force equals the weight: ',{i:'kx'},' = ',{b:'mg'},'. A ',{b:'spring scale'},' reads that force in newtons.']),
  P([{bold:'Example. '},'0.60 kg on the 120 N/m spring: ',{i:'mg'},' = 5.88 N, ',{i:'x'},' = 5.88 ÷ 120 = ',{b:'0.049 m'},'.'],{before:40}),
  ...chk('The mass on a spring is doubled. What happens to the stretch?','It doubles: kx = mg, so x grows in step with m.',1)]),
 row([P([{bold:'PART 4: A SPRING IN A SYSTEM'}],{size:20,after:40}),cueQ('What does a spring between two objects read?')],[
  P(['A spring in a string acts like the string: it pulls with the ',{b:'tension'},', and its stretch shows that tension, ',{i:'x'},' = ',{i:'T'},' ÷ ',{i:'k'},'.']),
  img('carts.png',270,75),
  P([{bold:'Example. '},'The Day 4 carts with a 200 N/m spring in the rope, pulled with 12 N: ',{i:'T'},' = ',{b:'4.0 N'},', so ',{i:'x'},' = 4.0 ÷ 200 = ',{b:'0.020 m'},'.'],{before:40}),
  ...chk('The carts are pulled with 24 N instead. How far does the spring stretch now?','a = 4.0 m/s², T = 2.0 × 4.0 = 8.0 N, x = 8.0 ÷ 200 = 0.040 m.',1)]),
 row([P([{bold:'EXIT CHECK'}],{size:20,after:40}),cueQ('Show what you know')],[
  P(['A spring with k = 250 N/m is stretched 0.040 m. How hard does it pull?'],{num:'n1'}),
  ...(KEY?[P([{key:'F = 250 × 0.040 = 10 N.'}])]:gap(1)),
  P(['A spring stretches 0.050 m under 4.0 N and 0.100 m under 8.0 N. Find k.'],{num:'n1'}),
  ...(KEY?[P([{key:'k = 4.0 ÷ 0.050 = 80 N/m (the slope).'}])]:gap(1)),
  P(['A 0.50 kg mass hangs at rest on that spring. Find the stretch.'],{num:'n1'}),
  ...(KEY?[P([{key:'mg = 4.9 N; x = 4.9 ÷ 80 = 0.061 m (6.1 cm).'}])]:gap(1)),
  P([{bold:'Summary. '},'Answer the essential question in two or three sentences. Use the words “stretch” and “spring constant.”'],{before:120,after:40}),
  ...(KEY?[P([{key:'A spring pulls with F = kx, so its stretch is a measure of the force on it. Once you know its spring constant, from the slope of F against x, the stretch tells you the force.'}])]:gap(2))]),
];
const body=new Table({width:{size:W,type:WidthType.DXA},columnWidths:[CUE,NOTE],rows:rowsMain});
const num=(r,fmt,text)=>({reference:r,levels:[{level:0,format:fmt,text,alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:360,hanging:280}}}}]});
const doc=new Document({numbering:{config:[{reference:"b",levels:[{level:0,format:LevelFormat.BULLET,text:"•",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:360,hanging:240}}}}]},
 num("n1",LevelFormat.LOWER_LETTER,"%1."),num("s1",LevelFormat.DECIMAL,"Step %1.")]},
 styles:{default:{document:{run:{font:F,size:22}}}},
 sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:720,bottom:720,left:720,right:720}}},
 children:[...(KEY?[P([{bold:'KEY'}],{size:24})]:[]),header,new Paragraph({children:[],spacing:{after:80}}),body]}]});
Packer.toBuffer(doc).then(b=>fs.writeFileSync(KEY?'day-05-springs-notes-key.docx':'day-05-springs-notes.docx',b));
