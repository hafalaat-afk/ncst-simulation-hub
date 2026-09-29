// ---------- General navigation ----------
const tabs = [...document.querySelectorAll('.tab')];
const panels = [...document.querySelectorAll('.panel')];
function openTab(id){
  tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === id));
  panels.forEach(p => p.classList.toggle('active-panel', p.id === id));
  window.scrollTo({top:0,behavior:'smooth'});
  if(id === 'field') drawField();
  if(id === 'static') drawStatic();
  if(id === 'hooke') drawHooke();
}
tabs.forEach(t => t.addEventListener('click',()=>openTab(t.dataset.tab)));
document.querySelectorAll('.jump-button').forEach(b=>b.addEventListener('click',()=>openTab(b.dataset.target)));

document.getElementById('themeToggle').addEventListener('click',()=>{
  document.body.classList.toggle('dark');
  document.getElementById('themeToggle').textContent = document.body.classList.contains('dark') ? '☀' : '☾';
  drawStatic(); drawField(); drawCurrent(); drawHooke();
});
function css(name){return getComputedStyle(document.body).getPropertyValue(name).trim();}
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}

// ---------- SI Units ----------
const units={
  length:{m:1,km:1000,cm:.01,mm:.001,'µm':1e-6,nm:1e-9},
  mass:{kg:1,g:.001,mg:1e-6,'µg':1e-9},
  time:{s:1,ms:.001,min:60,h:3600}
};
const quantitySelect=document.getElementById('quantitySelect'),fromUnit=document.getElementById('fromUnit'),toUnit=document.getElementById('toUnit');
function populateUnits(){const set=units[quantitySelect.value];fromUnit.innerHTML='';toUnit.innerHTML='';Object.keys(set).forEach((u,i)=>{fromUnit.add(new Option(u,u));toUnit.add(new Option(u,u));});toUnit.selectedIndex=Math.min(1,toUnit.options.length-1);convertUnits();}
function convertUnits(){const q=quantitySelect.value,v=parseFloat(document.getElementById('unitValue').value)||0;const ans=v*units[q][fromUnit.value]/units[q][toUnit.value];document.getElementById('conversionResult').textContent=`${Number(ans.toPrecision(8))} ${toUnit.value}`;}
quantitySelect.addEventListener('change',populateUnits);document.getElementById('convertButton').addEventListener('click',convertUnits);populateUnits();
function sciNotation(){let n=parseFloat(document.getElementById('sciInput').value);const out=document.getElementById('sciResult');if(!Number.isFinite(n)){out.textContent='Enter a valid number';return;}if(n===0){out.textContent='0';return;}const exp=Math.floor(Math.log10(Math.abs(n)));const coeff=n/10**exp;out.innerHTML=`${Number(coeff.toPrecision(4))} × 10<sup>${exp}</sup>`;}
document.getElementById('sciButton').addEventListener('click',sciNotation);

// ---------- Static electricity ----------
const staticCanvas=document.getElementById('staticCanvas'),sctx=staticCanvas.getContext('2d');
let staticCharge=0;
let papers=Array.from({length:18},(_,i)=>({x:60+(i%9)*72,y:320+Math.floor(i/9)*34,baseX:60+(i%9)*72,baseY:320+Math.floor(i/9)*34,r:(i%3)*.18}));
const chargeSlider=document.getElementById('chargeStrength');
function setCharge(v){staticCharge=+v;chargeSlider.value=v;document.getElementById('chargeOutput').textContent=`${v}%`;document.getElementById('staticStatus').textContent=v>0?`The rod has gained electrons. Charge level: ${v}%.`:'The rod is neutral. Rub it to transfer electrons.';drawStatic();}
chargeSlider.addEventListener('input',e=>setCharge(e.target.value));document.getElementById('rubRod').addEventListener('click',()=>setCharge(Math.min(100,staticCharge+25)));document.getElementById('resetStatic').addEventListener('click',()=>{papers.forEach(p=>{p.x=p.baseX;p.y=p.baseY});setCharge(0);});
function drawStatic(){
  const w=staticCanvas.width,h=staticCanvas.height;sctx.clearRect(0,0,w,h);sctx.fillStyle=css('--surface-2');sctx.fillRect(0,0,w,h);
  // table
  sctx.fillStyle='#a77a4f';sctx.fillRect(0,300,w,120);
  // rod
  const rodX=340,rodY=105;sctx.lineCap='round';sctx.lineWidth=30;sctx.strokeStyle='#8e5cbd';sctx.beginPath();sctx.moveTo(rodX-120,rodY);sctx.lineTo(rodX+120,rodY);sctx.stroke();
  // electrons
  const count=Math.floor(staticCharge/10);sctx.fillStyle='#2f7adf';sctx.font='bold 16px sans-serif';for(let i=0;i<count;i++){const x=rodX-100+(i%5)*50,y=rodY-6+Math.floor(i/5)*18;sctx.beginPath();sctx.arc(x,y,7,0,Math.PI*2);sctx.fill();sctx.fillStyle='white';sctx.fillText('−',x-5,y+5);sctx.fillStyle='#2f7adf';}
  sctx.fillStyle=css('--text');sctx.font='700 17px sans-serif';sctx.fillText('Plastic rod',275,55);sctx.font='14px sans-serif';sctx.fillStyle=css('--muted');sctx.fillText(staticCharge? 'Extra electrons create a negative charge':'Neutral rod',300,148);
  // papers pulled upward based on charge
  papers.forEach((p,i)=>{const influence=(staticCharge/100)*(1-(Math.abs(p.baseX-rodX)/520));const targetY=p.baseY-influence*(150+(i%4)*10);p.y += (targetY-p.y)*.12;sctx.save();sctx.translate(p.x,p.y);sctx.rotate(p.r);sctx.fillStyle=i%2?'#f2d58e':'#f7e4b2';sctx.fillRect(-10,-6,20,12);sctx.restore();});
  if(staticCharge>0) requestAnimationFrame(()=>{if(document.getElementById('static').classList.contains('active-panel'))drawStatic();});
}
drawStatic();

// ---------- Electric field ----------
const fieldCanvas=document.getElementById('fieldCanvas'),fctx=fieldCanvas.getContext('2d');
let charges=[];let dragging=-1;
function resetCharges(){const mode=document.getElementById('fieldMode').value;if(mode==='positive')charges=[{x:380,y:210,q:1}];if(mode==='negative')charges=[{x:380,y:210,q:-1}];if(mode==='dipole')charges=[{x:275,y:210,q:1},{x:485,y:210,q:-1}];if(mode==='like')charges=[{x:275,y:210,q:1},{x:485,y:210,q:1}];drawField();}
document.getElementById('fieldMode').addEventListener('change',resetCharges);document.getElementById('resetField').addEventListener('click',resetCharges);document.getElementById('fieldMagnitude').addEventListener('input',e=>{document.getElementById('fieldMagnitudeOut').textContent=e.target.value;drawField();});
function fieldAt(x,y){let ex=0,ey=0;const mag=+document.getElementById('fieldMagnitude').value;charges.forEach(c=>{let dx=x-c.x,dy=y-c.y;let r2=dx*dx+dy*dy;r2=Math.max(r2,900);let r=Math.sqrt(r2);let factor=c.q*mag/r2;ex+=factor*dx/r;ey+=factor*dy/r;});return{ex,ey,m:Math.sqrt(ex*ex+ey*ey)};}
function arrow(ctx,x,y,dx,dy,len){const ang=Math.atan2(dy,dx);ctx.beginPath();ctx.moveTo(x-len*.5*Math.cos(ang),y-len*.5*Math.sin(ang));ctx.lineTo(x+len*.5*Math.cos(ang),y+len*.5*Math.sin(ang));ctx.stroke();const tx=x+len*.5*Math.cos(ang),ty=y+len*.5*Math.sin(ang);ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(tx-6*Math.cos(ang-.55),ty-6*Math.sin(ang-.55));ctx.moveTo(tx,ty);ctx.lineTo(tx-6*Math.cos(ang+.55),ty-6*Math.sin(ang+.55));ctx.stroke();}
function drawField(){const w=fieldCanvas.width,h=fieldCanvas.height;fctx.clearRect(0,0,w,h);fctx.fillStyle=css('--surface-2');fctx.fillRect(0,0,w,h);fctx.strokeStyle=css('--muted');fctx.lineWidth=1.3;for(let y=40;y<h;y+=42){for(let x=40;x<w;x+=42){let {ex,ey,m}=fieldAt(x,y);if(m===0)continue;let norm=Math.hypot(ex,ey),len=clamp(10+m*280000,10,24);fctx.globalAlpha=.55;arrow(fctx,x,y,ex/norm,ey/norm,len);}}fctx.globalAlpha=1;charges.forEach(c=>{fctx.beginPath();fctx.arc(c.x,c.y,25,0,Math.PI*2);fctx.fillStyle=c.q>0?'#dd514b':'#347bd1';fctx.fill();fctx.fillStyle='white';fctx.font='bold 28px sans-serif';fctx.textAlign='center';fctx.textBaseline='middle';fctx.fillText(c.q>0?'+':'−',c.x,c.y+1);});}
function canvasPoint(ev,canvas){const r=canvas.getBoundingClientRect();const touch=ev.touches?ev.touches[0]:ev;return{x:(touch.clientX-r.left)*canvas.width/r.width,y:(touch.clientY-r.top)*canvas.height/r.height};}
fieldCanvas.addEventListener('pointerdown',e=>{const p=canvasPoint(e,fieldCanvas);dragging=charges.findIndex(c=>Math.hypot(c.x-p.x,c.y-p.y)<35);fieldCanvas.setPointerCapture(e.pointerId);});fieldCanvas.addEventListener('pointermove',e=>{if(dragging<0)return;const p=canvasPoint(e,fieldCanvas);charges[dragging].x=clamp(p.x,30,fieldCanvas.width-30);charges[dragging].y=clamp(p.y,30,fieldCanvas.height-30);drawField();});fieldCanvas.addEventListener('pointerup',()=>dragging=-1);resetCharges();

// ---------- Current & Voltage ----------
const currentCanvas=document.getElementById('currentCanvas'),cctx=currentCanvas.getContext('2d');let electronPhase=0;
const vS=document.getElementById('voltageSlider'),rS=document.getElementById('resistanceSlider');
function circuitValues(){const V=+vS.value,R=+rS.value,I=V/R;document.getElementById('voltageOut').textContent=`${V} V`;document.getElementById('resistanceOut').textContent=`${R} Ω`;document.getElementById('currentResult').textContent=`${I.toFixed(2)} A`;return{V,R,I};}
[vS,rS].forEach(x=>x.addEventListener('input',()=>{circuitValues();drawCurrent();}));document.getElementById('resetCurrent').addEventListener('click',()=>{vS.value=6;rS.value=6;circuitValues();drawCurrent();});
function pathPoint(t){const pts=[[140,90],[620,90],[620,320],[140,320],[140,90]];const lengths=[];let total=0;for(let i=0;i<pts.length-1;i++){const l=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]);lengths.push(l);total+=l;}let d=(t%1)*total;for(let i=0;i<lengths.length;i++){if(d<=lengths[i]){let a=pts[i],b=pts[i+1],u=d/lengths[i];return{x:a[0]+(b[0]-a[0])*u,y:a[1]+(b[1]-a[1])*u};}d-=lengths[i];}return{x:140,y:90};}
function drawCurrent(){const {V,R,I}=circuitValues();const w=currentCanvas.width,h=currentCanvas.height;cctx.clearRect(0,0,w,h);cctx.fillStyle=css('--surface-2');cctx.fillRect(0,0,w,h);cctx.strokeStyle=css('--text');cctx.lineWidth=5;cctx.beginPath();cctx.moveTo(140,90);cctx.lineTo(620,90);cctx.lineTo(620,320);cctx.lineTo(140,320);cctx.lineTo(140,90);cctx.stroke();
  // battery
  cctx.fillStyle=css('--surface');cctx.fillRect(110,170,60,75);cctx.strokeStyle=css('--text');cctx.lineWidth=4;cctx.strokeRect(110,170,60,75);cctx.font='bold 18px sans-serif';cctx.fillStyle=css('--text');cctx.fillText('+',132,195);cctx.fillText('−',132,232);cctx.font='13px sans-serif';cctx.fillText(`${V} V`,118,265);
  // resistor
  cctx.strokeStyle='#d99432';cctx.lineWidth=7;cctx.beginPath();cctx.moveTo(340,90);for(let i=0;i<8;i++){cctx.lineTo(350+i*20,90+(i%2?18:-18));}cctx.lineTo(520,90);cctx.stroke();cctx.fillStyle=css('--text');cctx.font='14px sans-serif';cctx.fillText(`${R} Ω`,398,55);
  // charge dots
  for(let i=0;i<14;i++){const p=pathPoint((electronPhase+i/14)%1);cctx.beginPath();cctx.arc(p.x,p.y,7,0,Math.PI*2);cctx.fillStyle='#2f7adf';cctx.fill();cctx.fillStyle='white';cctx.font='bold 12px sans-serif';cctx.textAlign='center';cctx.fillText('−',p.x,p.y+4);}cctx.textAlign='left';cctx.fillStyle=css('--muted');cctx.font='14px sans-serif';cctx.fillText(`Current = ${I.toFixed(2)} A`,310,220);electronPhase=(electronPhase+0.0018*clamp(I,.2,5))%1;
}
function animateCurrent(){if(document.getElementById('current').classList.contains('active-panel'))drawCurrent();requestAnimationFrame(animateCurrent);}circuitValues();animateCurrent();

// ---------- Hooke's Law ----------
const springCanvas=document.getElementById('springCanvas'),spctx=springCanvas.getContext('2d'),graphCanvas=document.getElementById('graphCanvas'),gctx=graphCanvas.getContext('2d');
const kS=document.getElementById('kSlider'),forceS=document.getElementById('forceSlider'),limitS=document.getElementById('limitSlider');
function hookeVals(){const k=+kS.value,F=+forceS.value,L=+limitS.value;let x=F/k;let beyond=F>L;if(beyond)x=L/k+(F-L)/k*1.8;document.getElementById('kOut').textContent=`${k} N/m`;document.getElementById('forceOut').textContent=`${F.toFixed(1)} N`;document.getElementById('limitOut').textContent=`${L.toFixed(1)} N`;document.getElementById('extensionResult').textContent=`${x.toFixed(3)} m`;const st=document.getElementById('elasticStatus');st.textContent=beyond?'Beyond elastic limit: permanent deformation may occur':'Within elastic limit';st.className='status-box '+(beyond?'danger':'success');return{k,F,L,x,beyond};}
[kS,forceS,limitS].forEach(s=>s.addEventListener('input',drawHooke));document.getElementById('resetHooke').addEventListener('click',()=>{kS.value=40;forceS.value=4;limitS.value=8;drawHooke();});
function drawHooke(){const {k,F,L,x,beyond}=hookeVals();let w=springCanvas.width,h=springCanvas.height;spctx.clearRect(0,0,w,h);spctx.fillStyle=css('--surface-2');spctx.fillRect(0,0,w,h);spctx.strokeStyle=css('--text');spctx.lineWidth=5;spctx.beginPath();spctx.moveTo(70,40);spctx.lineTo(290,40);spctx.stroke();let endY=130+clamp(x*600,0,220);spctx.strokeStyle=beyond?css('--danger'):css('--primary-2');spctx.lineWidth=4;spctx.beginPath();spctx.moveTo(180,40);const coils=13;for(let i=0;i<=coils;i++){let y=50+(endY-60)*i/coils;let xx=i===0||i===coils?180:180+(i%2?35:-35);spctx.lineTo(xx,y);}spctx.lineTo(180,endY);spctx.stroke();spctx.fillStyle='#5b6774';spctx.fillRect(135,endY,90,60);spctx.fillStyle='white';spctx.font='bold 16px sans-serif';spctx.textAlign='center';spctx.fillText(`${F.toFixed(1)} N`,180,endY+35);spctx.fillStyle=css('--muted');spctx.font='14px sans-serif';spctx.fillText(`x = ${x.toFixed(3)} m`,180,h-22);
  // graph
  w=graphCanvas.width;h=graphCanvas.height;gctx.clearRect(0,0,w,h);gctx.fillStyle=css('--surface-2');gctx.fillRect(0,0,w,h);const ox=52,oy=350,gW=275,gH=285;gctx.strokeStyle=css('--text');gctx.lineWidth=2;gctx.beginPath();gctx.moveTo(ox,45);gctx.lineTo(ox,oy);gctx.lineTo(330,oy);gctx.stroke();gctx.fillStyle=css('--muted');gctx.font='12px sans-serif';gctx.fillText('Force (N)',8,55);gctx.fillText('Extension (m)',245,382);let maxX=.8,maxF=12;gctx.strokeStyle=css('--primary-2');gctx.lineWidth=4;gctx.beginPath();for(let f=0;f<=12;f+=.25){let xx=f<=L?f/k:L/k+(f-L)/k*1.8;let px=ox+xx/maxX*gW,py=oy-f/maxF*gH;if(f===0)gctx.moveTo(px,py);else gctx.lineTo(px,py);}gctx.stroke();let px=ox+x/maxX*gW,py=oy-F/maxF*gH;gctx.fillStyle=beyond?css('--danger'):css('--success');gctx.beginPath();gctx.arc(px,py,7,0,Math.PI*2);gctx.fill();gctx.textAlign='left';}
drawHooke();

// ---------- pH ----------
const phS=document.getElementById('phSlider');
function phColor(ph,indicator){if(indicator==='universal'){if(ph<3)return '#d84343';if(ph<5)return '#f08b42';if(ph<6.5)return '#e5c44d';if(ph<7.5)return '#68b96b';if(ph<10)return '#4f9fd1';if(ph<12)return '#566ac7';return '#793da4';}if(indicator==='litmus'){return ph<7?'#d65353':ph>7?'#476fd0':'#8d67a9';}return ph>8.2?'#ec6aa7':'#e9eef3';}
function colorName(ph,indicator){if(indicator==='litmus')return ph<7?'Red':ph>7?'Blue':'Purple';if(indicator==='phenolphthalein')return ph>8.2?'Pink':'Colourless';if(ph<3)return'Red';if(ph<5)return'Orange';if(ph<6.5)return'Yellow';if(ph<7.5)return'Green';if(ph<10)return'Blue';if(ph<12)return'Indigo';return'Purple';}
function updatePh(){const ph=+phS.value,ind=document.getElementById('indicatorSelect').value;document.getElementById('phOut').textContent=ph.toFixed(1);document.getElementById('phLiquid').style.background=phColor(ph,ind);document.getElementById('indicatorResult').textContent=colorName(ph,ind);document.getElementById('phLabel').textContent=ph<7?'Acidic':ph>7?'Basic / Alkaline':'Neutral';}
phS.addEventListener('input',updatePh);document.getElementById('indicatorSelect').addEventListener('change',updatePh);
const acidS=document.getElementById('acidSlider'),baseS=document.getElementById('baseSlider');
function updateMix(){const a=+acidS.value,b=+baseS.value,total=Math.max(1,a+b);let pH;if(a===b)pH=7;else if(a>b){const excess=(a-b)/total;pH=clamp(-Math.log10(Math.max(excess,.000001)),0,7);}else{const excess=(b-a)/total;const pOH=clamp(-Math.log10(Math.max(excess,.000001)),0,7);pH=14-pOH;}document.getElementById('acidOut').textContent=`${a} mL`;document.getElementById('baseOut').textContent=`${b} mL`;document.getElementById('mixPh').textContent=pH.toFixed(1);document.getElementById('neutralMarker').style.left=`${clamp(pH/14*100,0,100)}%`;}
[acidS,baseS].forEach(s=>s.addEventListener('input',updateMix));document.getElementById('resetPh').addEventListener('click',()=>{phS.value=7;acidS.value=25;baseS.value=25;document.getElementById('indicatorSelect').value='universal';updatePh();updateMix();});updatePh();updateMix();

// ---------- Periodic trends ----------
const elements=[
 {s:'Li',n:'Lithium',r:152,i:520,e:0.98,note:'Lithium has a large radius and relatively low ionization energy, so it tends to lose one electron.'},
 {s:'Be',n:'Beryllium',r:112,i:900,e:1.57,note:'Beryllium holds its outer electrons more strongly than lithium.'},
 {s:'B',n:'Boron',r:85,i:801,e:2.04,note:'Boron shows the general decrease in atomic radius across Period 2.'},
 {s:'C',n:'Carbon',r:77,i:1086,e:2.55,note:'Carbon has moderate electronegativity and commonly forms covalent bonds.'},
 {s:'N',n:'Nitrogen',r:75,i:1402,e:3.04,note:'Nitrogen has high ionization energy and electronegativity.'},
 {s:'O',n:'Oxygen',r:73,i:1314,e:3.44,note:'Oxygen strongly attracts shared electrons in covalent bonds.'},
 {s:'F',n:'Fluorine',r:72,i:1681,e:3.98,note:'Fluorine is the most electronegative element in this selection.'},
 {s:'Ne',n:'Neon',r:71,i:2081,e:0,note:'Neon has a full outer shell and is very unreactive.'},
 {s:'Na',n:'Sodium',r:186,i:496,e:0.93,note:'Sodium has a relatively large atomic radius and low ionization energy, so it readily loses an outer electron.'},
 {s:'Mg',n:'Magnesium',r:160,i:738,e:1.31,note:'Magnesium is smaller than sodium and requires more energy to remove an electron.'},
 {s:'Al',n:'Aluminium',r:143,i:578,e:1.61,note:'Aluminium generally forms positive ions and metallic bonding in the solid metal.'},
 {s:'Si',n:'Silicon',r:118,i:787,e:1.90,note:'Silicon is a metalloid and commonly forms strong covalent structures.'},
 {s:'P',n:'Phosphorus',r:110,i:1012,e:2.19,note:'Phosphorus has higher ionization energy and electronegativity than silicon.'},
 {s:'S',n:'Sulfur',r:103,i:1000,e:2.58,note:'Sulfur is relatively electronegative and commonly gains or shares electrons.'},
 {s:'Cl',n:'Chlorine',r:99,i:1251,e:3.16,note:'Chlorine strongly attracts electrons and readily forms chloride ions.'},
 {s:'Ar',n:'Argon',r:98,i:1521,e:0,note:'Argon has a full outer shell and is very unreactive.'}
];
const mini=document.getElementById('miniPeriodic');
function selectElement(el,btn){document.querySelectorAll('.element-btn').forEach(b=>b.classList.remove('active'));if(btn)btn.classList.add('active');document.getElementById('elementName').textContent=`${el.n} (${el.s})`;document.getElementById('radiusMeter').value=el.r;document.getElementById('radiusValue').textContent=`${el.r} pm`;document.getElementById('ionMeter').max=2100;document.getElementById('ionMeter').value=el.i;document.getElementById('ionValue').textContent=`${el.i} kJ/mol`;document.getElementById('enMeter').value=el.e;document.getElementById('enValue').textContent=el.e?el.e.toFixed(2):'N/A';document.getElementById('trendSummary').textContent=el.note;}
elements.forEach(el=>{const b=document.createElement('button');b.className='element-btn';b.innerHTML=`${el.s}<small>${el.n}</small>`;b.addEventListener('click',()=>selectElement(el,b));mini.appendChild(b);});selectElement(elements.find(e=>e.s==='Na'),[...mini.children].find(b=>b.textContent.startsWith('Na')));
