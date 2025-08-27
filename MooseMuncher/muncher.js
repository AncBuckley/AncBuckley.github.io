// muncher.js — responsive canvas + 5×5 grid + sidebar progress + recent picks
import MooseMan from "./MooseMan.js";

/* ===== DOM ===== */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const help = document.getElementById("help");
const gameover = document.getElementById("gameover");

const startBtn = document.getElementById("startBtn");
const againBtn = document.getElementById("againBtn");
const menuBtn = document.getElementById("menuBtn");
const pauseBtn = document.getElementById("pauseBtn");
const helpBtn = document.getElementById("helpBtn");
const closeHelp = document.getElementById("closeHelp");

const categorySelect = document.getElementById("categorySelect");
const modeSelect = document.getElementById("modeSelect");

const levelSpan = document.getElementById("level");
const scoreSpan = document.getElementById("score");
const livesSpan = document.getElementById("lives");
const toast = document.getElementById("toast");
const catBadge = document.getElementById("categoryBadge");

/* ===== utils ===== */
const rand=(a,b)=>Math.random()*(b-a)+a;
const randi=(a,b)=>Math.floor(rand(a,b));
const choice=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const now=()=>performance.now();
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=randi(0,i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const easeOutCubic=t=>1-Math.pow(1-t,3);
function roundRect(c,x,y,w,h,r){const rr=Math.min(r,w/2,h/2);c.moveTo(x+rr,y);c.arcTo(x+w,y,x+w,y+h,rr);c.arcTo(x+w,y+h,x,y+h,rr);c.arcTo(x,y+h,x,y,rr);c.arcTo(x,y,x+w,y,rr);}

/* ===== categories ===== */
const isPrime=n=>{if(n<2)return false;if(n%2===0)return n===2;const r=(Math.sqrt(n)|0);for(let i=3;i<=r;i+=2){if(n%i===0)return false}return true;};

const wordSets={
  fruits:["apple","banana","grape","orange","pear","peach","cherry","mango","kiwi","plum","lemon","lime","apricot","fig","melon","silver"],
  mammals:["dog","cat","whale","bat","human","elephant","tiger","lion","horse","dolphin","mouse","wolf","bear","otter","giraffe"],
  colors:["red","blue","green","yellow","purple","orange","pink","black","white","gray","brown","cyan","magenta","silver","gold"],
  planets:["mercury","venus","earth","mars","jupiter","saturn","uranus","neptune"],
  usStates:["alabama","alaska","arizona","arkansas","california","colorado","connecticut","delaware","florida","georgia","hawaii","idaho","illinois","indiana","iowa","kansas","kentucky","louisiana","maine","maryland","massachusetts","michigan","minnesota","mississippi","missouri","montana","nebraska","nevada","new hampshire","new jersey","new mexico","new york","north carolina","north dakota","ohio","oklahoma","oregon","pennsylvania","rhode island","south carolina","south dakota","tennessee","texas","utah","vermont","virginia","washington","west virginia","wisconsin","wyoming"],
  elements:["hydrogen","helium","lithium","beryllium","boron","carbon","nitrogen","oxygen","fluorine","neon","sodium","magnesium","aluminum","silicon","phosphorus","sulfur","chlorine","argon","potassium","calcium","iron","copper","zinc","silver","gold","tin","lead","mercury"]
};

function makeWordCategory(name,setKey,labelCase="lower"){
  const set=wordSets[setKey]||[];
  const correct=new Set(set.map(String));
  const distractPool=Object.values(wordSets).flat().filter(w=>!correct.has(String(w)));
  const normalize=s=>labelCase==='title'?String(s).replace(/\b\w/g,c=>c.toUpperCase()):labelCase==='upper'?String(s).toUpperCase():String(s);
  return{
    id:name.toLowerCase().replace(/\s+/g,'-'), name, type:'word', labelCase,
    getCorrectList(){return [...correct];},
    getDistractorList(){return distractPool.slice();},
    generate:(W,H,countCorrect=12)=>{
      const total=W*H;
      const selCorrect=shuffle([...correct]).slice(0,Math.min(total,countCorrect));
      const need=total-selCorrect.length;
      const distract=shuffle(distractPool).slice(0,need);
      return shuffle([...selCorrect,...distract]).map(w=>({label:normalize(w),value:String(w),correct:correct.has(String(w))}));
    }
  };
}
function numericCategory(name,predicate,{min=2,max=99}={}){
  return{
    id:name.toLowerCase().replace(/\s+/g,'-'), name,type:'number',min,max,test:predicate,
    generate:(W,H)=>{const total=W*H;const pool=Array.from({length:max-min+1},(_,i)=>i+min);const chosen=shuffle(pool).slice(0,total);return chosen.map(n=>({label:String(n),value:n,correct:!!predicate(n)}));}
  };
}
const CATEGORIES=[
  numericCategory("Multiples of 3",n=>n%3===0),
  numericCategory("Even Numbers",n=>n%2===0),
  numericCategory("Prime Numbers",isPrime,{min:2,max:199}),
  numericCategory("Squares",n=>Number.isInteger(Math.sqrt(n))),
  numericCategory("Factors of 36",n=>36%n===0,{min:1,max:72}),
  numericCategory("Greater than 50",n=>n>50,{min:1,max:99}),
  makeWordCategory("Fruits","fruits","lower"),
  makeWordCategory("Mammals","mammals","lower"),
  makeWordCategory("Colors","colors","lower"),
  makeWordCategory("Planets","planets","lower"),
  makeWordCategory("US States","usStates","title"),
  makeWordCategory("Chemical Elements","elements","lower"),
];
function pickRandomMathCategory(excludeId){const nums=CATEGORIES.filter(c=>c.type==='number'&&c.id!==excludeId);return choice(nums.length?nums:CATEGORIES.filter(c=>c.type==='number'));}
function computeMathNeeded(level,base){return Math.max(1,Math.floor(base*Math.pow(2,level-1)));}

/* ===== constants ===== */
const DIRS={UP:0,RIGHT:1,DOWN:2,LEFT:3};
const DIR_VECT=[[0,-1],[1,0],[0,1],[-1,0]];
const ENEMY_STEP_MS=3000;
const TROGGLE_COLORS=['#ff3b6b','#ffb800','#00e5ff','#7cff00','#ff00e5','#ff7a00','#00ffb3','#ffd700','#00ffd0','#ff4d00'];

/* ===== state ===== */
let state={
  running:false, paused:false,
  level:1, score:0, lives:3,
  gridW:5, gridH:5, tile:64,          // fixed 5×5
  category:CATEGORIES[0],
  items:[], correctRemaining:0,
  player:null, enemies:[],
  freezeUntil:0, invulnUntil:0,
  mode:'classic',                     // "classic" or "math"
  math:{progress:0, base:6, needed:6},
  single:{totalCorrectAtStart:0},
  recent:[]
};

/* ===== responsive canvas buffer ===== */
function resizeCanvas(){
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width  = Math.floor(rect.width  * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
window.addEventListener('resize', resizeCanvas);
// react to layout/font changes that don't fire window.resize
new ResizeObserver(resizeCanvas).observe(canvas);

/* ===== sidebar (level bar + recent) ===== */
function sidebarWidth(rect){ return Math.max(220, Math.floor(rect.width*0.24)); }
function drawSidebar(rect){
  const sideW = sidebarWidth(rect);
  const x = rect.width - sideW;

  ctx.save();
  ctx.translate(x,0);

  // panel
  ctx.fillStyle='rgba(255,255,255,0.04)';
  ctx.strokeStyle='rgba(255,255,255,0.10)';
  ctx.lineWidth=1;
  ctx.beginPath(); roundRect(ctx, 8, 8, sideW-16, rect.height-16, 14); ctx.fill(); ctx.stroke();

  // header
  ctx.fillStyle='#cfe0ff';
  ctx.font='700 16px system-ui, -apple-system, Segoe UI';
  ctx.textAlign='left'; ctx.textBaseline='top';
  ctx.fillText('Progress', 20, 16);

  // vertical progress bar
  const barH = Math.max(140, rect.height*0.28);
  const barW = 22;
  const bx = 28, by = 42;
  ctx.fillStyle='#0a1437'; ctx.strokeStyle='#20306b'; ctx.lineWidth=1;
  ctx.beginPath(); roundRect(ctx, bx, by, barW, barH, 10); ctx.fill(); ctx.stroke();

  let pct=0, label='';
  if(state.mode==='math'){
    pct = clamp((state.math.progress||0)/(state.math.needed||1),0,1);
    label = `${state.math.progress||0} / ${state.math.needed||0}`;
  }else{
    const eatenCorrect = Math.max(0, (state.single.totalCorrectAtStart||0) - state.correctRemaining);
    pct = state.single.totalCorrectAtStart ? clamp(eatenCorrect/state.single.totalCorrectAtStart,0,1) : 0;
    label = `${eatenCorrect} / ${state.single.totalCorrectAtStart}`;
  }
  const fillH = Math.floor(barH*pct);
  const g=ctx.createLinearGradient(0, by+barH, 0, by+barH-fillH);
  g.addColorStop(0,'#46d4ff'); g.addColorStop(1,'#9cff6d');
  ctx.fillStyle=g;
  ctx.beginPath(); roundRect(ctx, bx, by+barH-fillH, barW, fillH, 10); ctx.fill();

  ctx.fillStyle='#e8f2ff';
  ctx.font='600 13px system-ui, -apple-system, Segoe UI';
  ctx.textAlign='left'; ctx.fillText(label, bx+barW+12, by+barH-18);

  // Recent picks
  ctx.fillStyle='#cfe0ff';
  ctx.font='700 16px system-ui, -apple-system'; ctx.fillText('Recent Picks', 20, by+barH+18);
  ctx.font='13px system-ui, -apple-system';
  let ly = by+barH+40;
  const items = state.recent.slice(-10).reverse(); // newest first
  for(const it of items){
    if(it.type==='heading'){
      ctx.fillStyle='#9fb7ff'; ctx.fillText(`— ${it.text} —`, 20, ly);
    }else{
      ctx.fillStyle = it.correct ? '#77ffb4' : '#ff6d8a';
      ctx.fillText((it.correct?'✓ ':'✗ ') + it.text, 20, ly);
    }
    ly += 18; if(ly > rect.height - 24) break;
  }

  ctx.restore();
  return sideW;
}
function pushRecentHeading(text){ state.recent.push({type:'heading', text}); trimRecent(); }
function pushRecentPick(text, correct){ state.recent.push({type:'pick', text, correct}); trimRecent(); }
function trimRecent(){ if(state.recent.length>60) state.recent.splice(0, state.recent.length-60); }

/* ===== board ===== */
function minCorrectForBoard(W,H){
  const need = state.mode==='math' ? state.math.needed||12 : Math.ceil(W*H*0.35);
  return Math.min(W*H, Math.max(12, need));
}
function buildBoard(){
  const W=state.gridW,H=state.gridH;
  const items=state.category.generate(W,H,minCorrectForBoard(W,H));
  let best=items, bestC=items.filter(t=>t.correct).length;
  const targetMin=Math.max(6,Math.floor(W*H*0.2));
  for(let i=0;i<10&&bestC<targetMin;i++){
    const alt=state.category.generate(W,H,minCorrectForBoard(W,H));
    const c=alt.filter(t=>t.correct).length;
    if(c>bestC){best=alt;bestC=c;}
  }
  state.items=best.map((it,idx)=>({...it,eaten:false,gx:idx%W,gy:Math.floor(idx/W)}));
  state.correctRemaining=state.items.filter(t=>t.correct).length;
  state.single.totalCorrectAtStart = state.correctRemaining;
}

/* ===== entities ===== */
function spawnPlayer(){ state.player={gx:0,gy:0,x:0,y:0,dir:DIRS.RIGHT,moving:null}; }
function spawnEnemies(){
  const base = state.level<=3? 2 : state.level<=6? 3 : 4;
  const n = clamp(base + (state.level>6?1:0), 2, 6);
  state.enemies=[];
  const occupied=new Set(['0,0']);
  const baseTime=now();
  for(let i=0;i<n;i++){
    let ex=randi(0,state.gridW), ey=randi(0,state.gridH), tries=0;
    while((Math.abs(ex-0)+Math.abs(ey-0))<Math.floor((state.gridW+state.gridH)/4)||occupied.has(`${ex},${ey}`)){
      ex=randi(0,state.gridW); ey=randi(0,state.gridH); if(++tries>50)break;
    }
    occupied.add(`${ex},${ey}`);
    state.enemies.push({gx:ex,gy:ey,x:ex,y:ey,dir:randi(0,4),color:choice(TROGGLE_COLORS),nextStepAt:baseTime+ENEMY_STEP_MS+i*150});
  }
}
function resetEnemyTimers(){ const base=now(); state.enemies.forEach((e,i)=>{ e.nextStepAt=base+ENEMY_STEP_MS+i*150; }); }

/* ===== enemy AI (3s per step) + reseeding ===== */
function enemyUpdate(){
  const t=now();
  const frozen=t<state.freezeUntil;
  for(const e of state.enemies){
    if(frozen) continue;
    if(t>=e.nextStepAt){
      e.nextStepAt += ENEMY_STEP_MS;
      const options=[0,1,2,3];
      const bias = randi(0,2)
        ? (Math.abs(state.player.gx-e.gx)>Math.abs(state.player.gy-e.gy)
            ? (state.player.gx>e.gx?DIRS.RIGHT:DIRS.LEFT)
            : (state.player.gy>e.gy?DIRS.DOWN:DIRS.UP))
        : choice(options);
      const dirs=[bias,...options.filter(d=>d!==bias)];
      for(const d of dirs){
        const [dx,dy]=DIR_VECT[d];
        const nx=e.gx+dx, ny=e.gy+dy;
        if(nx>=0&&ny>=0&&nx<state.gridW&&ny<state.gridH){
          e.gx=nx; e.gy=ny; e.x=nx; e.y=ny; e.dir=d;
          const tile=state.items.find(ti=>ti.gx===nx&&ti.gy===ny);
          if(tile && tile.eaten){ seedTileAt(nx,ny); }
          break;
        }
      }
    }
  }
}
function computeSeedCorrectProb(){
  const uneaten=state.items.filter(t=>!t.eaten);
  const correct=uneaten.filter(t=>t.correct).length;
  const ratio=uneaten.length?correct/uneaten.length:0;
  let p=clamp(0.7-0.6*ratio,0.12,0.88);
  if(correct<=2) p=Math.max(p,0.80);
  return p;
}
function seedTileAt(gx,gy){
  const tile=state.items.find(t=>t.gx===gx&&t.gy===gy);
  if(!tile||!tile.eaten) return;
  const pCorrect=computeSeedCorrectProb();
  if(state.category.type==='word'){
    const corr=state.category.getCorrectList?.()||[];
    const dist=state.category.getDistractorList?.()||[];
    let makeCorrect=Math.random()<pCorrect && corr.length>0;
    if(!makeCorrect && dist.length===0 && corr.length>0) makeCorrect=true;
    const pick=makeCorrect?choice(corr):(dist.length?choice(dist):choice(corr));
    const labelCase=state.category.labelCase||'lower';
    const normalized=labelCase==='title'?String(pick).replace(/\b\w/g,c=>c.toUpperCase()):labelCase==='upper'?String(pick).toUpperCase():String(pick);
    tile.label=normalized; tile.value=String(pick); tile.correct=makeCorrect;
  }else{
    const c=state.category; let n;
    if(Math.random()<pCorrect){
      for(let i=0;i<50;i++){n=randi(c.min,c.max+1); if(c.test(n)) break;}
      tile.correct=true;
    }else{
      for(let i=0;i<50;i++){n=randi(c.min,c.max+1); if(!c.test(n)) break;}
      tile.correct=false;
    }
    tile.label=String(n); tile.value=n;
  }
  tile.eaten=false;
  if(tile.correct) state.correctRemaining+=1;
}

/* ===== input ===== */
document.addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();
  if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(k)){
    e.preventDefault(); if(e.repeat) return; handlePlayerStep(k); return;
  }
  if(k===' '||k==='enter'){ tryEat(); }
  if(k==='p'){ togglePause(); }
  if(k==='escape'){ if(!help.classList.contains('hide')) help.classList.add('hide'); else togglePause(); }
});
function handlePlayerStep(k){
  if(!state.running||state.paused||!state.player) return;
  if(state.player.moving) return;
  let dir=null;
  if(k==='arrowup'||k==='w')dir=DIRS.UP;
  else if(k==='arrowright'||k==='d')dir=DIRS.RIGHT;
  else if(k==='arrowdown'||k==='s')dir=DIRS.DOWN;
  else if(k==='arrowleft'||k==='a')dir=DIRS.LEFT;
  if(dir==null) return;
  const[dx,dy]=DIR_VECT[dir];
  const nx=state.player.gx+dx, ny=state.player.gy+dy;
  if(nx>=0&&ny>=0&&nx<state.gridW&&ny<state.gridH){
    const fromX=state.player.x, fromY=state.player.y;
    state.player.gx=nx; state.player.gy=ny; state.player.dir=dir;
    state.player.moving={fromX,fromY,toX:nx,toY:ny,start:now(),dur:200};
  }
}

/* ===== flow ===== */
function startGame(){
  state.running=true; state.paused=false;
  state.level=1; state.score=0; state.lives=3; state.freezeUntil=0; state.invulnUntil=0;
  state.recent.length=0;
  nextLevel(true);
}
function nextLevel(pushHeading=false){
  state.gridW=5; state.gridH=5; // lock
  if((modeSelect?.value||'classic').toLowerCase()==='math'){
    state.mode='math';
    const prev=state.category?state.category.id:null;
    state.category=pickRandomMathCategory(prev);
    state.math.needed=computeMathNeeded(state.level,state.math.base);
    state.math.progress=0;
  }else{
    state.mode='classic';
  }
  buildBoard(); spawnPlayer(); spawnEnemies(); resetEnemyTimers(); updateHUD();
  state.invulnUntil=now()+1200;
  const strong=catBadge.querySelector("strong"); if(strong) strong.textContent=state.category.name;
  if(pushHeading) pushRecentHeading(state.category.name);
}
function levelCleared(){ state.score+=500; state.level+=1; nextLevel(true); }
function loseLife(){
  if(now()<state.invulnUntil) return;
  state.lives-=1; state.invulnUntil=now()+1500; showToast('Ouch!');
  if(state.lives<=0){ gameOver(); return; }
  state.player.gx=0; state.player.gy=0; state.player.x=0; state.player.y=0; state.player.dir=DIRS.RIGHT;
}
function gameOver(){
  state.running=false; state.paused=false;
  gameover.classList.remove('hide');
  document.getElementById('finalStats')?.textContent=`You scored ${state.score}.`;
}

/* ===== eat & scoring ===== */
function tryEat(){
  if(!state.running||state.paused) return;
  const tile=state.items.find(t=>t.gx===state.player.gx&&t.gy===state.player.gy);
  if(!tile||tile.eaten) return;

  tile.eaten=true;
  if(tile.correct){
    state.score+=100;
    if(state.mode==='math'){
      state.math.progress=Math.min(state.math.needed,(state.math.progress||0)+1);
      if(state.math.progress>=state.math.needed) setTimeout(levelCleared,350);
    }else{
      state.correctRemaining-=1;
      if(state.correctRemaining<=0) setTimeout(levelCleared,350);
    }
    pushRecentPick(tile.label,true);
    spawnStarBurstCell(tile.gx,tile.gy);
    if(Math.random()<0.06) spawnPowerUp(tile.gx,tile.gy);
    showToast('Yum! +100');
  }else{
    state.score=Math.max(0,state.score-50);
    if(state.mode==='math') state.math.progress=Math.max(0,(state.math.progress||0)-1);
    pushRecentPick(tile.label,false);
    spawnDisappointAt(state.player.gx,state.player.gy);
    loseLife();
    showToast('Wrong! −50');
  }
  updateHUD();
}

/* ===== powerups & effects ===== */
let star=null;
function spawnPowerUp(gx,gy){ star={gx,gy,active:true,born:now()}; }

let explosions=[]; let starBursts=[]; let sfx=[];
function spawnExplosion(gx,gy){
  const N=18,parts=[]; for(let i=0;i<N;i++) parts.push({ang:rand(0,Math.PI*2),spd:rand(0.6,1.1)});
  explosions.push({gx,gy,born:now(),duration:650,parts});
}
function drawExplosions(padX,padY,tile){
  const tnow=now(); explosions=explosions.filter(ex=>tnow-ex.born<ex.duration);
  for(const ex of explosions){
    const p=clamp((tnow-ex.born)/ex.duration,0,1);
    const cx=padX+ex.gx*tile+tile/2, cy=padY+ex.gy*tile+tile/2;
    ctx.save(); ctx.globalAlpha=0.5*(1-p); ctx.beginPath(); ctx.arc(cx,cy,tile*0.15+tile*0.4*easeOutCubic(p),0,Math.PI*2); ctx.strokeStyle="#ff6d8a"; ctx.lineWidth=2; ctx.stroke(); ctx.restore();
    for(const pr of ex.parts){
      const dist=easeOutCubic(p)*pr.spd*tile*0.9;
      const x=cx+Math.cos(pr.ang)*dist, y=cy+Math.sin(pr.ang)*dist;
      ctx.save(); ctx.globalAlpha=1-p; ctx.fillStyle="#ff6d8a"; ctx.beginPath(); ctx.arc(x,y,Math.max(1.5,3*(1-p)),0,Math.PI*2); ctx.fill(); ctx.restore();
    }
  }
}
function spawnStarBurstCell(gx,gy){
  const N=12,parts=[]; for(let i=0;i<N;i++) parts.push({ang:rand(0,Math.PI*2),spd:rand(0.6,1.1)});
  starBursts.push({gx,gy,born:now(),duration:700,parts});
}
function drawStar(cx,cy,spikes,outerR,innerR,color){
  const step=Math.PI/spikes; let rot=-Math.PI/2;
  ctx.save(); ctx.beginPath();
  for(let i=0;i<spikes;i++){ ctx.lineTo(cx+Math.cos(rot)*outerR, cy+Math.sin(rot)*outerR); rot+=step; ctx.lineTo(cx+Math.cos(rot)*innerR, cy+Math.sin(rot)*innerR); rot+=step; }
  ctx.closePath(); ctx.fillStyle=color; ctx.fill(); ctx.restore();
}
function drawStarBursts(padX,padY,tile){
  const tnow=now(); starBursts=starBursts.filter(s=>tnow-s.born<s.duration);
  for(const sb of starBursts){
    const p=clamp((tnow-sb.born)/sb.duration,0,1);
    const cx=padX+sb.gx*tile+tile/2, cy=padY+sb.gy*tile+tile/2;
    for(const pr of sb.parts){
      const dist=easeOutCubic(p)*pr.spd*tile*0.95;
      const x=cx+Math.cos(pr.ang)*dist, y=cy+Math.sin(pr.ang)*dist;
      ctx.save(); ctx.globalAlpha=1-p; drawStar(x,y,5,Math.max(2,tile*0.10*(1-p)),Math.max(1,tile*0.05*(1-p)),"#ffd166"); ctx.restore();
    }
  }
}
function spawnDisappointAt(gx,gy){ sfx.push({type:"disappoint",gx,gy,born:now(),duration:800}); }
function drawSFX(padX,padY,tile){
  const tnow=now(); sfx=sfx.filter(e=>tnow-e.born<e.duration);
  for(const e of sfx){
    if(e.type==="disappoint"){
      const p=clamp((tnow-e.born)/e.duration,0,1);
      const cx=padX+e.gx*tile+tile/2, cy=padY+e.gy*tile+tile/2 - tile*0.2;
      ctx.save(); ctx.strokeStyle="rgba(70,212,255,0.9)"; ctx.lineWidth=2;
      const n=4; for(let i=0;i<n;i++){const off=(i-(n-1)/2)*tile*0.08; const len=tile*0.22*(1-p); ctx.beginPath(); ctx.moveTo(cx+off, cy - tile*0.2); ctx.lineTo(cx+off, cy - tile*0.2 + len); ctx.stroke();}
      ctx.restore();
      ctx.save(); ctx.globalAlpha=1-p; ctx.fillStyle="#46d4ff";
      ctx.beginPath(); ctx.moveTo(cx + tile*0.18, cy - tile*0.06);
      ctx.quadraticCurveTo(cx + tile*0.24, cy + 0.02, cx + tile*0.14, cy + 0.10);
      ctx.quadraticCurveTo(cx + tile*0.28, cy + 0.00, cx + tile*0.18, cy - tile*0.06);
      ctx.fill(); ctx.restore();
    }
  }
}

/* ===== HUD & helpers ===== */
function updateHUD(){
  levelSpan.textContent=state.level;
  scoreSpan.textContent=state.score;
  livesSpan.textContent=state.lives;
  const strong=catBadge.querySelector("strong"); if(strong) strong.textContent=state.category?state.category.name:'–';
}
function showToast(msg){ toast.textContent=msg; toast.classList.remove('hide'); clearTimeout(showToast._t); showToast._t=setTimeout(()=>toast.classList.add('hide'),1200); }
function togglePause(){ if(!state.running) return; state.paused=!state.paused; pauseBtn.textContent=state.paused?'▶️ Resume':'⏸️ Pause'; }

/* ===== collisions ===== */
function checkCollisions(){
  for(const e of state.enemies){
    if(e.gx===state.player.gx && e.gy===state.player.gy){
      spawnExplosion(state.player.gx,state.player.gy);
      loseLife();
    }
  }
  if(star && star.active && state.player.gx===star.gx && state.player.gy===star.gy){
    star.active=false; state.freezeUntil=now()+3500; showToast("Troggles frozen!");
  }
}

/* ===== label wrapping ===== */
function wrapLabel(text,maxWidth,ctx2,maxLines=4){
  const words=String(text).split(/\s+/); const lines=[]; let line="";
  for(let w of words){
    const test=line?line+" "+w:w;
    if(ctx2.measureText(test).width<=maxWidth){ line=test; }
    else{
      if(line){ lines.push(line); if(lines.length>=maxLines) return lines; }
      let tmp=w;
      while(ctx2.measureText(tmp).width>maxWidth){
        let cut=tmp.length; while(cut>1 && ctx2.measureText(tmp.slice(0,cut)).width>maxWidth) cut--;
        lines.push(tmp.slice(0,cut)); tmp=tmp.slice(cut);
        if(lines.length>=maxLines) return lines;
      }
      line=tmp;
    }
  }
  if(line && lines.length<maxLines) lines.push(line);
  return lines;
}

/* ===== draw ===== */
function draw(){
  const rect=canvas.getBoundingClientRect();
  const sideW = sidebarWidth(rect);

  // compute tile size from actual CSS size each frame
  const tile=Math.min((rect.width - sideW)/state.gridW, rect.height/state.gridH);
  const padX=(rect.width - sideW - state.gridW*tile)/2;
  const padY=(rect.height - state.gridH*tile)/2;

  ctx.clearRect(0,0,canvas.width,canvas.height);

  // tween player
  if(state.player && state.player.moving){
    const m=state.player.moving, t=(now()-m.start)/m.dur;
    if(t>=1){state.player.x=m.toX; state.player.y=m.toY; state.player.moving=null;}
    else{const s=easeOutCubic(clamp(t,0,1)); state.player.x=m.fromX+(m.toX-m.fromX)*s; state.player.y=m.fromY+(m.toY-m.fromY)*s;}
  }

  // tiles
  for(const t of state.items){
    const x=padX+t.gx*tile, y=padY+t.gy*tile;
    ctx.beginPath(); roundRect(ctx,x+2,y+2,tile-4,tile-4,16);
    const grad=ctx.createLinearGradient(x,y,x+tile,y+tile);
    grad.addColorStop(0,t.eaten?'#0c1430':'#15204a'); grad.addColorStop(1,t.eaten?'#0a1126':'#0e1737');
    ctx.fillStyle=grad; ctx.fill();
    ctx.strokeStyle=t.eaten?'rgba(255,255,255,.06)':'rgba(255,255,255,.12)'; ctx.lineWidth=1.2; ctx.stroke();

    if(!t.eaten){
      ctx.save(); ctx.fillStyle='rgba(230,240,255,.96)'; const fontSize=Math.floor(tile*0.30);
      ctx.font=`${fontSize}px ui-sans-serif, system-ui, -apple-system, Segoe UI`; ctx.textAlign='center'; ctx.textBaseline='middle';
      const maxW=tile*0.86, lineH=Math.max(12,Math.floor(fontSize*1.06));
      const lines=wrapLabel(t.label,maxW,ctx,3); const totalH=lines.length*lineH; let ly=y+tile/2 - totalH/2 + lineH/2;
      for(const line of lines){ ctx.fillText(line,x+tile/2,ly); ly+=lineH; }
      ctx.restore();
    }else if(t.correct){
      ctx.save(); ctx.globalAlpha=0.2; ctx.fillStyle='#9cff6d'; ctx.beginPath(); ctx.arc(x+tile/2,y+tile/2,tile*0.18,0,Math.PI*2); ctx.fill(); ctx.restore();
    }
  }

  // powerup
  if(star && star.active){ const x=padX+star.gx*tile+tile/2, y=padY+star.gy*tile+tile/2; drawStar(x,y,5,tile*0.22,tile*0.09,'#ffd166'); }

  // player
  if(state.player){
    const px=padX+state.player.x*tile+tile/2, py=padY+state.player.y*tile+tile/2;
    const inv=now()<state.invulnUntil;
    const panim=MooseMan.computeAnim(state.player, DIR_VECT);
    MooseMan.draw(ctx,px,py,tile*0.34,state.player.dir,inv,panim);
  }

  // enemies
  for(const e of state.enemies){
    const ex=padX+e.x*tile+tile/2, ey=padY+e.y*tile+tile/2;
    const frozen=now()<state.freezeUntil;
    drawTroggle(ex,ey,tile*0.34,e.dir,e.color,frozen);
  }

  // overlays
  drawExplosions(padX,padY,tile);
  drawStarBursts(padX,padY,tile);
  drawSFX(padX,padY,tile);

  // right sidebar
  drawSidebar(rect);
}
function drawTroggle(x,y,size,dir,color,frozen){
  ctx.save(); ctx.translate(x,y); ctx.rotate([-Math.PI/2,0,Math.PI/2,Math.PI][dir]);
  const w=size*1.1, h=size*0.9;
  ctx.shadowColor=color; ctx.shadowBlur=frozen?8:18;
  ctx.beginPath(); ctx.moveTo(-w/2,h/2); ctx.lineTo(0,-h/2); ctx.lineTo(w/2,h/2); ctx.closePath();
  const grd=ctx.createLinearGradient(-w/2,-h/2,w/2,h/2);
  grd.addColorStop(0, frozen? '#8af1ff' : color); grd.addColorStop(1,'#ffffff22');
  ctx.fillStyle=grd; ctx.fill(); ctx.shadowBlur=0; ctx.lineWidth=2; ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.stroke();
  ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(-size*0.2,-size*0.06,size*0.09,0,Math.PI*2); ctx.arc(size*0.2,-size*0.06,size*0.09,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#0b1020'; ctx.beginPath(); ctx.arc(-size*0.2,-size*0.06,size*0.045,0,Math.PI*2); ctx.arc(size*0.2,-size*0.06,size*0.045,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(-w*0.32,h*0.15); ctx.lineTo(w*0.32,h*0.15); ctx.stroke();
  ctx.restore();
}

/* ===== loop ===== */
function loop(){
  if(state.running && !state.paused){
    enemyUpdate();
    checkCollisions();
    draw();
  }
  requestAnimationFrame(loop);
}

/* ===== menu & setup ===== */
function populateCategories(){
  categorySelect.innerHTML=CATEGORIES.map(c=>`<option value="${c.id}">${c.name}</option>`).join("");
  if(CATEGORIES.length) categorySelect.value=state.category?.id||CATEGORIES[0].id;
}
function applyMenuSettings(){
  state.gridW=5; state.gridH=5; // lock
  const wantMath=(modeSelect?.value||'classic').toLowerCase()==='math';
  state.mode= wantMath ? 'math' : 'classic';
  const cat=CATEGORIES.find(c=>c.id===categorySelect.value)||CATEGORIES[0];
  state.category=cat;
  state.math.base=6; state.math.progress=0; state.math.needed=computeMathNeeded(1,state.math.base);
  state.recent.length=0; pushRecentHeading(state.category.name);
  buildBoard(); spawnPlayer(); spawnEnemies(); resetEnemyTimers(); updateHUD();
}
startBtn?.addEventListener('click',()=>{ menu.classList.add('hide'); gameover.classList.add('hide'); applyMenuSettings(); state.running=true; state.paused=false; state.level=1; state.score=0; state.lives=3; state.freezeUntil=0; state.invulnUntil=0; updateHUD(); });
againBtn?.addEventListener('click',()=>{ gameover.classList.add('hide'); menu.classList.add('hide'); applyMenuSettings(); state.running=true; state.paused=false; state.level=1; state.score=0; state.lives=3; state.freezeUntil=0; state.invulnUntil=0; updateHUD(); });
menuBtn?.addEventListener('click',()=>{ gameover.classList.add('hide'); menu.classList.remove('hide'); state.running=false; });
helpBtn?.addEventListener('click',()=>{ help.classList.remove('hide'); state.paused=true; pauseBtn.textContent='▶️ Resume'; });
closeHelp?.addEventListener('click',()=> help.classList.add('hide'));
pauseBtn?.addEventListener('click',togglePause);
document.getElementById('shuffleBtn')?.addEventListener('click',()=>{ const r=choice(CATEGORIES); categorySelect.value=r.id; });

/* ===== init ===== */
(function init(){
  state.category=CATEGORIES[0];
  state.mode=(modeSelect?.value||'classic').toLowerCase()==='math'?'math':'classic';
  populateCategories(); resizeCanvas(); updateHUD(); requestAnimationFrame(loop);
})();
