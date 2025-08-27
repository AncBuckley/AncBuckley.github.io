// muncher.js — adds "Recent Answers" list between grid and level bar (last 10, green/red), with category headings.
// Also ensures the sidebar always has space so the list actually renders.
import MooseMan from "./MooseMan.js";
let Character = MooseMan;

// ---------- DOM ----------
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const menu = document.getElementById('menu');
const help = document.getElementById('help');
const gameover = document.getElementById('gameover');

const startBtn = document.getElementById('startBtn');
const againBtn = document.getElementById('againBtn');
const menuBtn = document.getElementById('menuBtn');
const pauseBtn = document.getElementById('pauseBtn');
const helpBtn = document.getElementById('helpBtn');
const closeHelp = document.getElementById('closeHelp');

const categorySelect = document.getElementById('categorySelect');
const modeSelect = document.getElementById('modeSelect');
const gridSelect = document.getElementById('gridSelect');

const levelSpan = document.getElementById('level');
const scoreSpan = document.getElementById('score');
const livesSpan = document.getElementById('lives');
const toast = document.getElementById('toast');
const catBadge = document.getElementById('categoryBadge');
const levelProgress = document.getElementById('levelProgress');

// ---------- utils ----------
const rand = (min,max)=>Math.random()*(max-min)+min;
const randi = (min,max)=>Math.floor(rand(min,max));
const choice = arr=>arr[Math.floor(Math.random()*arr.length)];
const clamp = (v,a,b)=>Math.min(b,Math.max(a,v));
const now = ()=>performance.now();
const shuffle = arr=>{for(let i=arr.length-1;i>0;i--){const j=randi(0,i+1);[arr[i],arr[j]]=[arr[j],arr[i]]}return arr};
const easeOutCubic = t=>1-Math.pow(1-t,3);
const lerp = (a,b,t)=>a+(b-a)*t;
const isPrime = n=>{if(n<2)return false;if(n%2===0)return n===2;const r=(Math.sqrt(n)|0);for(let i=3;i<=r;i+=2){if(n%i===0)return false}return true;};
const esc = s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;');

// ---------- categories (inline like your current Index expects) ----------
const wordSets = {
  fruits:["apple","banana","grape","orange","pear","peach","cherry","mango","kiwi","plum","lemon","lime","apricot","fig","melon","silver"], // "silver" cross-fit example
  mammals:["dog","cat","whale","bat","human","elephant","tiger","lion","horse","dolphin","mouse","wolf","bear","otter","giraffe"],
  colors:["red","blue","green","yellow","purple","orange","pink","black","white","gray","brown","cyan","magenta","silver"],
  planets:["mercury","venus","earth","mars","jupiter","saturn","uranus","neptune"],
  usStates:["alabama","alaska","arizona","arkansas","california","colorado","connecticut","delaware","florida","georgia","hawaii","idaho","illinois","indiana","iowa","kansas","kentucky","louisiana","maine","maryland","massachusetts","michigan","minnesota","mississippi","missouri","montana","nebraska","nevada","new hampshire","new jersey","new mexico","new york","north carolina","north dakota","ohio","oklahoma","oregon","pennsylvania","rhode island","south carolina","south dakota","tennessee","texas","utah","vermont","virginia","washington","west virginia","wisconsin","wyoming"],
  elements:["hydrogen","helium","lithium","beryllium","boron","carbon","nitrogen","oxygen","fluorine","neon","sodium","magnesium","aluminum","silicon","phosphorus","sulfur","chlorine","argon","potassium","calcium","iron","copper","zinc","silver","gold","tin","lead","mercury"]
};

function makeWordCategory(name, correctSet, distractFromKeys, labelCase='lower'){
  const correct = new Set(correctSet.map(String));
  const distractPool = Object.keys(wordSets)
    .filter(k=>distractFromKeys.includes(k) || k!==name.toLowerCase().replace(/\s+/g,'-'))
    .flatMap(k=>wordSets[k]||[]);
  const normalize = s => labelCase==='title' ? String(s).replace(/\b\w/g,c=>c.toUpperCase()) : labelCase==='upper'? String(s).toUpperCase(): String(s);
  return {
    id: name.toLowerCase().replace(/\s+/g,'-'),
    name,
    type:'word',
    labelCase,
    generate: (W,H,countCorrect=12)=>{
      const totalTiles = W*H;
      const selectedCorrect = shuffle([...correct]).slice(0, Math.min(countCorrect,totalTiles));
      const distractNeeded = Math.max(0, totalTiles - selectedCorrect.length);
      const distractors = shuffle(distractPool.filter(w=>!correct.has(w))).slice(0, distractNeeded);
      return shuffle([...selectedCorrect, ...distractors]).map(w=>({ label: normalize(w), value:w, correct: correct.has(String(w)) }));
    },
    getCorrectList(){ return [...correct]; },
    getDistractorList(){ return distractPool.filter(w=>!correct.has(String(w))); }
  };
}
function numericCategory(name, predicate, opts={}){
  const min = opts.min ?? 2, max = opts.max ?? 99;
  return {
    id: name.toLowerCase().replace(/\s+/g,'-'),
    name, type:'number', min, max, test:predicate,
    generate: (W,H)=>{
      const total=W*H; const pool = Array.from({length:max-min+1},(_,i)=>i+min);
      const chosen = shuffle(pool).slice(0,total);
      return chosen.map(n=>({label:String(n), value:n, correct:!!predicate(n)}));
    }
  };
}

const CATEGORIES = [
  numericCategory("Multiples of 3", n=>n%3===0),
  numericCategory("Even Numbers", n=>n%2===0),
  numericCategory("Prime Numbers", n=>isPrime(n), {min:2,max:199}),
  numericCategory("Squares", n=>Number.isInteger(Math.sqrt(n))),
  numericCategory("Factors of 36", n=>36%n===0, {min:1,max:72}),
  numericCategory("Greater than 50", n=>n>50, {min:1,max:99}),
  makeWordCategory("Fruits", wordSets.fruits, ["mammals","colors","planets","elements"], 'lower'),
  makeWordCategory("Mammals", wordSets.mammals, ["fruits","colors","planets","elements"], 'lower'),
  makeWordCategory("Colors", wordSets.colors, ["fruits","mammals","planets","elements"], 'lower'),
  makeWordCategory("Planets", wordSets.planets, ["fruits","mammals","colors","elements"], 'lower'),
  makeWordCategory("US States", wordSets.usStates, ["fruits","mammals","colors","planets"], 'title'),
  makeWordCategory("Chemical Elements", wordSets.elements, ["fruits","mammals","colors","planets"], 'lower')
];

function pickRandomCategory(excludeId){
  const choices = CATEGORIES.filter(c=>c.id!==excludeId);
  return choice(choices.length?choices:CATEGORIES);
}
function pickRandomMathCategory(excludeId){
  const nums = CATEGORIES.filter(c=>c.type==='number' && c.id!==excludeId);
  return choice(nums.length?nums:CATEGORIES.filter(c=>c.type==='number'));
}
function computeMathNeeded(level, base){ return Math.max(1, Math.floor(base * Math.pow(2, level-1))); }

// ---------- constants ----------
const DIRS = { UP:0, RIGHT:1, DOWN:2, LEFT:3 };
const DIR_VECT = [[0,-1],[1,0],[0,1],[-1,0]];
const ENEMY_STEP_MS = 3000;
const TROGGLE_COLORS = ['#ff3b6b','#ffb800','#00e5ff','#7cff00','#ff00e5','#ff7a00','#00ffb3','#ffd700','#00ffd0','#ff4d00'];

// ---------- state ----------
let state = {
  running:false, paused:false,
  level:1, score:0, lives:3,
  gridW:12, gridH:8, tile:64,
  category: CATEGORIES[0],
  items:[], correctRemaining:0,
  player:null, enemies:[],
  freezeUntil:0, invulnUntil:0, lastTime:0,
  mode:'classic',
  math:{progress:0, base:6, needed:6}
};

// VFX & UI
let explosions=[]; let starBursts=[]; let sfx=[]; let catFly=null; let star=null;

// ---------- Recent answers (NEW) ----------
const MAX_LOG = 10;
let answerLog = []; // entries: {type:'answer', text, correct, time} | {type:'heading', text, time}
let lastHeadingCategoryId = null;

function logAnswer(text, correct){
  answerLog.push({ type:'answer', text:String(text), correct:!!correct, time: now() });
  if(answerLog.length > MAX_LOG) answerLog = answerLog.slice(-MAX_LOG);
}
function logHeading(text){
  answerLog.push({ type:'heading', text:String(text), time: now() });
  if(answerLog.length > MAX_LOG) answerLog = answerLog.slice(-MAX_LOG);
}

// ---------- layout ----------
function resizeCanvas(){
  const dpr = window.devicePixelRatio||1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width*dpr);
  canvas.height = Math.floor(rect.height*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  state.tile = Math.floor(Math.min((rect.width-240)/state.gridW, rect.height/state.gridH)); // leave room for sidebar
}
addEventListener('resize', resizeCanvas);

// ---------- board ----------
function minCorrectForBoard(W,H){
  const need = state.mode==='math' ? state.math.needed||12 : Math.ceil(W*H*0.35);
  return Math.min(W*H, Math.max(12, need));
}
function buildBoard(){
  const W=state.gridW, H=state.gridH;
  const items = state.category.generate(W,H, minCorrectForBoard(W,H));
  // try to keep at least ~20% correct
  let correctCount = items.filter(i=>i.correct).length;
  const targetMin = Math.max(6, Math.floor(W*H*0.2));
  let best = items, bestCount = correctCount;
  if (correctCount < targetMin){
    for (let i=0;i<10;i++){
      const alt = state.category.generate(W,H, minCorrectForBoard(W,H));
      const c = alt.filter(x=>x.correct).length;
      if (c > bestCount){ best = alt; bestCount = c; if (c>=targetMin) break; }
    }
  }
  state.items = best.map((it, idx)=>({ ...it, eaten:false, gx: idx % W, gy: Math.floor(idx / W) }));
  state.correctRemaining = state.items.filter(t=>t.correct).length;
}

// ---------- actors ----------
function spawnPlayer(){ state.player={gx:0,gy:0,x:0,y:0,dir:DIRS.RIGHT,moving:null}; }
function spawnEnemies(){
  const base = state.level<=3?2 : state.level<=6?3 : 4;
  const n = clamp(base + (state.level>6?1:0), 2, 6);
  state.enemies = [];
  const occupied = new Set([`0,0`]);
  const baseTime = now();
  for(let i=0;i<n;i++){
    let ex=randi(0,state.gridW), ey=randi(0,state.gridH), tries=0;
    while( (Math.abs(ex-0)+Math.abs(ey-0)) < Math.floor((state.gridW+state.gridH)/4) || occupied.has(`${ex},${ey}`)){
      ex=randi(0,state.gridW); ey=randi(0,state.gridH); if(++tries>50) break;
    }
    occupied.add(`${ex},${ey}`);
    state.enemies.push({ gx:ex, gy:ey, x:ex, y:ey, dir:randi(0,4), color:choice(TROGGLE_COLORS), nextStepAt: baseTime + ENEMY_STEP_MS + i*150 });
  }
}

// ---------- input ----------
document.addEventListener('keydown', e=>{
  const k = e.key.toLowerCase();
  if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(k)){
    e.preventDefault(); if(e.repeat) return; handlePlayerStep(k); return;
  }
  if(k===' '|| k==='enter'){ tryEat(); }
  if(k==='p'){ togglePause(); }
  if(k==='escape'){ if(!help.classList.contains('hide')) help.classList.add('hide'); else togglePause(); }
});
function handlePlayerStep(k){
  if(!state.running || state.paused || !state.player) return;
  if(state.player.moving) return;
  let dir=null;
  if(k==='arrowup'||k==='w') dir=DIRS.UP;
  else if(k==='arrowright'||k==='d') dir=DIRS.RIGHT;
  else if(k==='arrowdown'||k==='s') dir=DIRS.DOWN;
  else if(k==='arrowleft'||k==='a') dir=DIRS.LEFT;
  if(dir==null) return;
  const [dx,dy]=DIR_VECT[dir];
  const nx=state.player.gx+dx, ny=state.player.gy+dy;
  if(passable(nx,ny)){
    const fromX=state.player.x, fromY=state.player.y;
    state.player.gx=nx; state.player.gy=ny; state.player.dir=dir;
    state.player.moving={fromX,fromY,toX:nx,toY:ny,start:now(),dur:200};
  }
}

// ---------- game flow ----------
function startGame(){
  state.running=true; state.paused=false;
  state.level=1; state.score=0; state.lives=3;
  state.freezeUntil=0; state.invulnUntil=0;
  answerLog = [];
  if(state.category){ logHeading(state.category.name); lastHeadingCategoryId = state.category.id; }
  nextLevel(true);
}
function nextLevel(isFirst=false){
  if(state.mode==='math'){
    const prev = state.category ? state.category.id : null;
    state.category = pickRandomMathCategory(prev);
    state.math.needed = computeMathNeeded(state.level, state.math.base);
    state.math.progress = 0;
    launchCategoryFly();
  }
  if (state.category && state.category.id !== lastHeadingCategoryId){
    logHeading(state.category.name);
    lastHeadingCategoryId = state.category.id;
  }
  buildBoard(); spawnPlayer(); spawnEnemies(); updateHUD(); resetEnemyTimers();
  state.invulnUntil = now()+1200;
}
function resetEnemyTimers(){ const base=now(); state.enemies.forEach((e,i)=>e.nextStepAt=base+ENEMY_STEP_MS+i*150); }
function levelCleared(){ state.score+=500; state.level+=1; nextLevel(); }
function loseLife(){
  if(now()<state.invulnUntil) return;
  state.lives -= 1; state.invulnUntil = now()+1500;
  showToast('Ouch!');
  if(state.lives<=0){ gameOver(); return; }
  state.player.gx=0; state.player.gy=0; state.player.x=0; state.player.y=0; state.player.dir=DIRS.RIGHT;
}
function gameOver(){
  state.running=false; state.paused=false;
  gameover.classList.remove('hide');
  document.getElementById('finalStats')?.textContent = `You scored ${state.score}.`;
}

// ---------- eat ----------
function tryEat(){
  if(!state.running || state.paused) return;
  const tile = getTileAt(state.player.gx, state.player.gy);
  if(!tile || tile.eaten) return;

  // log BEFORE mutating so we capture the original label and correctness
  logAnswer(tile.label, !!tile.correct);

  tile.eaten = true;
  if(tile.correct){
    state.score += 100;
    if(state.mode==='math'){
      state.math.progress = Math.min(state.math.needed, (state.math.progress||0)+1);
      if(state.math.progress >= state.math.needed){ setTimeout(levelCleared, 350); }
    }else{
      state.correctRemaining -= 1;
      if(state.correctRemaining<=0){ setTimeout(levelCleared, 350); }
    }
    spawnStarBurstCell(tile.gx,tile.gy);
    if(Math.random()<0.06) spawnPowerUp(tile.gx,tile.gy);
    showToast('Yum! +100');
  } else {
    state.score = Math.max(0, state.score-50);
    if(state.mode==='math'){
      state.math.progress = Math.max(0, (state.math.progress||0)-1);
    }
    spawnDisappointAt(state.player.gx,state.player.gy);
    loseLife();
    showToast('Wrong! −50');
  }
  updateHUD();
}

// ---------- pickups & helpers ----------
function spawnPowerUp(gx,gy){ star={gx,gy,active:true,born:now()}; }
function getTileAt(gx,gy){ return state.items.find(t=>t.gx===gx && t.gy===gy); }
function passable(gx,gy){ return gx>=0 && gy>=0 && gx<state.gridW && gy<state.gridH; }
function roundRect(ctx,x,y,w,h,r){ const rr=Math.min(r,w/2,h/2);
  ctx.moveTo(x+rr,y); ctx.arcTo(x+w,y,x+w,y+h,rr); ctx.arcTo(x+w,y+h,x,y+h,rr);
  ctx.arcTo(x,y+h,x,y,rr); ctx.arcTo(x,y,x+w,y,rr);
}

// word wrap (used for tiles)
function wrapLabel(text,maxWidth,ctx,maxLines=4){
  const words=String(text).split(/\s+/); const lines=[]; let line='';
  for(let w of words){
    const test = line ? line+' '+w : w;
    if(ctx.measureText(test).width <= maxWidth){ line=test; }
    else{
      if(line){ lines.push(line); if(lines.length>=maxLines) return lines; }
      let tmp=w;
      while(ctx.measureText(tmp).width>maxWidth){
        let cut=tmp.length; while(cut>1 && ctx.measureText(tmp.slice(0,cut)).width>maxWidth) cut--;
        lines.push(tmp.slice(0,cut)); tmp=tmp.slice(cut);
        if(lines.length>=maxLines) return lines;
      }
      line=tmp;
    }
  }
  if(line && lines.length<maxLines) lines.push(line);
  return lines;
}

// ---------- dynamic seeding when Troggle lands on empty ----------
function computeSeedCorrectProb(){
  const uneaten = state.items.filter(t=>!t.eaten);
  const correctUneaten = uneaten.filter(t=>t.correct).length;
  const ratio = uneaten.length ? correctUneaten/uneaten.length : 0;
  let p = clamp(0.7 - 0.6*ratio, 0.12, 0.88);
  if (correctUneaten <= 2) p = Math.max(p, 0.80);
  return p;
}
function seedTileAt(gx,gy){
  const tile = state.items.find(t=>t.gx===gx && t.gy===gy);
  if(!tile || !tile.eaten) return;
  const pCorrect = computeSeedCorrectProb();
  if(state.category.type==='word'){
    const cat=state.category, corr = cat.getCorrectList(), dist = cat.getDistractorList();
    let makeCorrect = Math.random()<pCorrect && corr.length>0;
    if(!makeCorrect && dist.length===0 && corr.length>0) makeCorrect=true;
    const pick = makeCorrect ? choice(corr) : (dist.length? choice(dist) : choice(corr));
    tile.label = cat.labelCase==='title' ? String(pick).replace(/\b\w/g,c=>c.toUpperCase()) : (cat.labelCase==='upper'? String(pick).toUpperCase(): String(pick));
    tile.value = String(pick);
    tile.correct = makeCorrect;
  }else{
    const cat=state.category;
    let n; if(Math.random()<pCorrect){
      for(let i=0;i<50;i++){ n=randi(cat.min,cat.max+1); if(cat.test(n)) break; }
      tile.correct=true;
    }else{
      for(let i=0;i<50;i++){ n=randi(cat.min,cat.max+1); if(!cat.test(n)) break; }
      tile.correct=false;
    }
    tile.label=String(n); tile.value=n;
  }
  tile.eaten=false;
  if(tile.correct) state.correctRemaining+=1;
}

// ---------- render ----------
function draw(){
  const rect = canvas.getBoundingClientRect();

  // Reserve a generous sidebar so the Recent list always has room.
  const sidebarW = Math.max(240, Math.floor(rect.width*0.22)); // <- FIX: gives list enough space
  const baseTile = Math.min((rect.width - sidebarW) / state.gridW, rect.height / state.gridH);
  let tile = baseTile;
  const enlarged = baseTile * 1.05;
  if (enlarged * state.gridW <= (rect.width - sidebarW) && enlarged * state.gridH <= rect.height){ tile = enlarged; }

  const padX = (rect.width - sidebarW - state.gridW*tile) / 2;
  const padY = (rect.height - state.gridH*tile) / 2;

  ctx.clearRect(0,0,canvas.width,canvas.height);

  // player tween
  if(state.player && state.player.moving){
    const m=state.player.moving, t=(now()-m.start)/m.dur;
    if(t>=1){ state.player.x=m.toX; state.player.y=m.toY; state.player.moving=null; }
    else{
      const s=easeOutCubic(clamp(t,0,1));
      state.player.x = m.fromX + (m.toX-m.fromX)*s;
      state.player.y = m.fromY + (m.toY-m.fromY)*s;
    }
  }

  // tiles
  for(const t of state.items){
    const x=padX + t.gx*tile, y=padY + t.gy*tile, r=16;
    ctx.beginPath(); roundRect(ctx,x+2,y+2,tile-4,tile-4,r);
    const grad=ctx.createLinearGradient(x,y,x+tile,y+tile);
    grad.addColorStop(0, t.eaten?'#0c1430':'#15204a'); grad.addColorStop(1, t.eaten?'#0a1126':'#0e1737');
    ctx.fillStyle=grad; ctx.fill();
    ctx.strokeStyle=t.eaten?'rgba(255,255,255,.06)':'rgba(255,255,255,.12)'; ctx.lineWidth=1.2; ctx.stroke();
    if(!t.eaten){
      ctx.save();
      const fontSize = Math.floor(tile*0.28);
      ctx.font = `${fontSize}px ui-sans-serif, system-ui, -apple-system, Segoe UI`;
      ctx.fillStyle='rgba(230,240,255,.96)'; ctx.textAlign='center'; ctx.textBaseline='middle';
      const maxW = tile*0.84; const lineH=Math.max(12, Math.floor(fontSize*1.06));
      const lines = wrapLabel(t.label, maxW, ctx, 4);
      const totalH = lines.length*lineH; let ly = y + tile/2 - totalH/2 + lineH/2;
      for(const line of lines){ ctx.fillText(line, x+tile/2, ly); ly+=lineH; }
      ctx.restore();
    }else if(t.correct){
      ctx.save(); ctx.globalAlpha=0.2; ctx.fillStyle='#9cff6d';
      ctx.beginPath(); ctx.arc(x+tile/2,y+tile/2,tile*0.18,0,Math.PI*2); ctx.fill(); ctx.restore();
    }
  }

  // powerup
  if(star && star.active){
    const x=padX+star.gx*tile+tile/2, y=padY+star.gy*tile+tile/2;
    drawStar(ctx,x,y,5,tile*0.22,tile*0.09,'#ffd166');
  }

  // player
  if(state.player){
    const px=padX+state.player.x*tile+tile/2, py=padY+state.player.y*tile+tile/2;
    const inv = now()<state.invulnUntil;
    const panim = Character.computeAnim(state.player, DIR_VECT);
    Character.draw(ctx, px, py, tile*0.34, state.player.dir, inv, panim);
  }

  // enemies
  for(const e of state.enemies){
    const ex=padX+e.x*tile+tile/2, ey=padY+e.y*tile+tile/2;
    const frozen = now()<state.freezeUntil;
    drawTroggle(ctx, ex, ey, tile*0.5, e.dir||0, e.color, frozen);
  }

  drawExplosions(ctx,padX,padY,tile);
  drawStarBursts(ctx,padX,padY,tile);
  drawSFX(ctx,padX,padY,tile);
  drawCategoryFly(ctx,rect);

  // draw sidebar: progress bar + recent list
  const barGeom = drawLevelBar(ctx,rect,sidebarW);
  drawAnswerList(ctx, rect, barGeom);
}

// star helper
function drawStar(ctx,cx,cy,spikes,outerR,innerR,color){
  const step=Math.PI/spikes; let rot=-Math.PI/2;
  ctx.save(); ctx.beginPath();
  for(let i=0;i<spikes;i++){ ctx.lineTo(cx+Math.cos(rot)*outerR, cy+Math.sin(rot)*outerR); rot+=step; ctx.lineTo(cx+Math.cos(rot)*innerR, cy+Math.sin(rot)*innerR); rot+=step; }
  ctx.closePath(); ctx.fillStyle=color; ctx.fill(); ctx.restore();
}
function drawTroggle(ctx,x,y,size,dir,color,frozen){
  ctx.save(); ctx.translate(x,y); ctx.rotate([-Math.PI/2,0,Math.PI/2,Math.PI][dir]);
  const w=size*1.1, h=size*0.9;
  ctx.shadowColor=color; ctx.shadowBlur=frozen?8:18;
  ctx.beginPath(); ctx.moveTo(-w/2,h/2); ctx.lineTo(0,-h/2); ctx.lineTo(w/2,h/2); ctx.closePath();
  const grd=ctx.createLinearGradient(-w/2,-h/2,w/2,h/2);
  grd.addColorStop(0, frozen?'#8af1ff':color); grd.addColorStop(1,'#ffffff22');
  ctx.fillStyle=grd; ctx.fill(); ctx.shadowBlur=0; ctx.lineWidth=2; ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.stroke();
  ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(-size*0.2,-size*0.06,size*0.09,0,Math.PI*2); ctx.arc(size*0.2,-size*0.06,size*0.09,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#0b1020'; ctx.beginPath(); ctx.arc(-size*0.2,-size*0.06,size*0.045,0,Math.PI*2); ctx.arc(size*0.2,-size*0.06,size*0.045,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(-w*0.32,h*0.15); ctx.lineTo(w*0.32,h*0.15); ctx.stroke();
  ctx.restore();
}

// explosions & sfx
function spawnExplosion(gx,gy){ const N=18, parts=[]; for(let i=0;i<N;i++) parts.push({ang:rand(0,Math.PI*2), spd:rand(0.6,1.1)}); explosions.push({gx,gy,born:now(),duration:650,parts}); }
function drawExplosions(ctx,padX,padY,tile){
  const tnow=now(); explosions = explosions.filter(ex=>tnow-ex.born<ex.duration);
  for(const ex of explosions){
    const p=clamp((tnow-ex.born)/ex.duration,0,1);
    const cx=padX+ex.gx*tile+tile/2, cy=padY+ex.gy*tile+tile/2;
    ctx.save(); ctx.globalAlpha=0.5*(1-p); ctx.beginPath(); ctx.arc(cx,cy,tile*0.15+tile*0.4*easeOutCubic(p),0,Math.PI*2); ctx.strokeStyle='#ff6d8a'; ctx.lineWidth=2; ctx.stroke(); ctx.restore();
    for(const pr of ex.parts){
      const dist=easeOutCubic(p)*pr.spd*tile*0.9;
      const x=cx+Math.cos(pr.ang)*dist, y=cy+Math.sin(pr.ang)*dist;
      ctx.save(); ctx.globalAlpha=1-p; ctx.fillStyle='#ff6d8a'; ctx.beginPath(); ctx.arc(x,y,Math.max(1.5,3*(1-p)),0,Math.PI*2); ctx.fill(); ctx.restore();
    }
  }
}
function spawnStarBurstCell(gx,gy){ const N=12, parts=[]; for(let i=0;i<N;i++) parts.push({ang:rand(0,Math.PI*2), spd:rand(0.6,1.1)}); starBursts.push({gx,gy,born:now(),duration:700,parts}); }
function drawStarBursts(ctx,padX,padY,tile){
  const tnow=now(); starBursts = starBursts.filter(s=>tnow-s.born<s.duration);
  for(const sb of starBursts){
    const p=clamp((tnow-sb.born)/sb.duration,0,1);
    const cx=padX+sb.gx*tile+tile/2, cy=padY+sb.gy*tile+tile/2;
    for(const pr of sb.parts){
      const dist=easeOutCubic(p)*pr.spd*tile*0.95;
      const x=cx+Math.cos(pr.ang)*dist, y=cy+Math.sin(pr.ang)*dist;
      ctx.save(); ctx.globalAlpha=1-p; drawStar(ctx,x,y,5,Math.max(2,tile*0.10*(1-p)),Math.max(1,tile*0.05*(1-p)),'#ffd166'); ctx.restore();
    }
  }
}
function spawnDisappointAt(gx,gy){ sfx.push({type:'disappoint',gx,gy,born:now(),duration:800}); }
function drawSFX(ctx,padX,padY,tile){
  const tnow=now(); sfx = sfx.filter(e=>tnow-e.born<e.duration);
  for(const e of sfx){
    if(e.type==='disappoint'){
      const p=clamp((tnow-e.born)/e.duration,0,1);
      const cx=padX+e.gx*tile+tile/2, cy=padY+e.gy*tile+tile/2 - tile*0.2;
      ctx.save(); ctx.strokeStyle='rgba(70,212,255,0.9)'; ctx.lineWidth=2;
      const n=4; for(let i=0;i<n;i++){
        const off=(i-(n-1)/2)*tile*0.08; const len=tile*0.22*(1-p);
        ctx.beginPath(); ctx.moveTo(cx+off, cy - tile*0.2); ctx.lineTo(cx+off, cy - tile*0.2 + len); ctx.stroke();
      }
      ctx.restore();
      ctx.save(); ctx.globalAlpha=1-p; ctx.fillStyle='#46d4ff';
      ctx.beginPath(); ctx.moveTo(cx + tile*0.18, cy - tile*0.06);
      ctx.quadraticCurveTo(cx + tile*0.24, cy + tile*0.02, cx + tile*0.14, cy + tile*0.10);
      ctx.quadraticCurveTo(cx + tile*0.28, cy + 0, cx + tile*0.18, cy - tile*0.06);
      ctx.fill(); ctx.restore();
    }
  }
}

// ---------- category fly-in ----------
function launchCategoryFly(){ catFly = { text: state.category.name, start: now(), delay: 1000, dur: 900 }; }
function getBadgeCenterInCanvas(){
  const br = catBadge.getBoundingClientRect();
  const cr = canvas.getBoundingClientRect();
  return { x: br.left - cr.left + br.width/2, y: br.top - cr.top + br.height/2 };
}
function drawCategoryFly(ctx, rect){
  if(!catFly) return;
  const elapsed = now() - catFly.start;
  const from = { x: rect.width/2, y: rect.height*0.42 };
  const to = getBadgeCenterInCanvas();
  if(elapsed < catFly.delay){
    ctx.save(); ctx.globalAlpha = 0.95; ctx.fillStyle = '#e8f4ff';
    ctx.font = '700 36px system-ui, -apple-system, Segoe UI';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.shadowColor='#46d4ff'; ctx.shadowBlur=18;
    ctx.fillText(catFly.text, from.x, from.y);
    ctx.restore(); return;
  }
  const tt = clamp((elapsed-catFly.delay)/catFly.dur, 0, 1);
  const x = lerp(from.x, to.x, easeOutCubic(tt));
  const y = lerp(from.y, to.y, easeOutCubic(tt));
  const size = Math.round(36 * (1.1 - 0.15*tt));
  ctx.save(); ctx.globalAlpha = 1 - tt*0.9; ctx.fillStyle='#e8f4ff';
  ctx.font = `700 ${size}px system-ui, -apple-system, Segoe UI`;
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.shadowColor='#9cff6d'; ctx.shadowBlur=18;
  ctx.fillText(catFly.text, x, y);
  ctx.restore();
  if (tt>=1) catFly=null;
}

// ---------- progress bar (always shown to keep the list beside it) ----------
function drawLevelBar(ctx, rect, sidebarW){
  const margin = 16;
  const colX = rect.width - sidebarW;
  const colY = margin;
  const colW = sidebarW - margin*1;
  const colH = rect.height - margin*2;

  // background column
  ctx.save();
  ctx.globalAlpha = 0.78;
  ctx.fillStyle = '#0b1433';
  ctx.strokeStyle = '#23306a';
  ctx.lineWidth = 1;
  roundRect(ctx, colX + 8, colY, colW - 16, colH, 12);
  ctx.fill(); ctx.stroke();
  ctx.restore();

  // vertical bar on the right side of the column
  const barW = 38;
  const x = rect.width - 8 - barW;
  const y = colY;
  const h = colH;

  ctx.save();
  ctx.fillStyle='#0a1437'; ctx.strokeStyle='#20306b'; ctx.lineWidth=1;
  roundRect(ctx,x,y,barW,h,10); ctx.fill(); ctx.stroke();

  const pct = clamp((state.math.progress||0)/(state.math.needed||1), 0, 1);
  ctx.save(); ctx.beginPath(); roundRect(ctx, x+2, y+2, barW-4, (h-4)*pct, 8);
  const grad = ctx.createLinearGradient(0,y+h,0,y);
  grad.addColorStop(0,'#46d4ff'); grad.addColorStop(1,'#9cff6d');
  ctx.fillStyle=grad; ctx.fill(); ctx.restore();

  ctx.fillStyle='#cfe2ff'; ctx.font='12px system-ui, sans-serif';
  ctx.textAlign='center'; ctx.textBaseline='bottom';
  ctx.fillText(`${(state.math.progress||0)}/${(state.math.needed||1)}`, x+barW/2, y+h-6);
  ctx.restore();

  // geometry for list on the left side of the column
  return { listX: colX + 16, listY: colY + 12, listW: (x - 12) - (colX + 16), listH: colH };
}

// ---------- "Recent Answers" list (NEW) ----------
function drawAnswerList(ctx, rect, g){
  if(!g) return;
  const { listX, listY, listW, listH } = g;
  if (listW < 100 || listH < 80) return;

  // title
  ctx.save();
  ctx.fillStyle = '#cfe2ff';
  ctx.font = '600 12px system-ui, -apple-system, Segoe UI';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText('Recent', listX, listY);
  ctx.restore();

  // entries (newest first)
  const entries = [...answerLog].slice().reverse();
  const top = listY + 18;
  let y = top;

  function ellipsize(text){
    ctx.font = '12px system-ui, -apple-system, Segoe UI';
    let s = String(text); const maxW = listW - 10;
    if(ctx.measureText(s).width <= maxW) return s;
    while (s.length > 1 && ctx.measureText(s + '…').width > maxW) s = s.slice(0,-1);
    return s + '…';
  }

  for(const entry of entries){
    if (y > listY + listH - 12) break;

    if (entry.type === 'heading'){
      ctx.save();
      ctx.fillStyle = '#8ea0d0';
      ctx.font = '600 12px system-ui, -apple-system, Segoe UI';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(ellipsize(entry.text), listX, y);
      // separator
      ctx.globalAlpha = 0.6; ctx.strokeStyle = 'rgba(255,255,255,.10)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(listX, y + 16); ctx.lineTo(listX + listW, y + 16); ctx.stroke();
      ctx.restore();
      y += 20;
    } else {
      const color = entry.correct ? '#9cff6d' : '#ff6d8a';
      ctx.save();
      ctx.fillStyle = color; ctx.beginPath();
      ctx.arc(listX + 6, y + 8, 5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#e8f0ff';
      ctx.font = '12px system-ui, -apple-system, Segoe UI';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(ellipsize(entry.text), listX + 18, y);
      ctx.restore();
      y += 18;
    }
  }
}

// ---------- enemy AI ----------
function enemyStep(){
  if(now()<state.freezeUntil) return;
  for(const e of state.enemies){
    if(now()>=e.nextStepAt){
      e.nextStepAt = now()+ENEMY_STEP_MS;
      const dirs=[0,1,2,3]; shuffle(dirs);
      let bestDir=e.dir||0, bestDist=Infinity;
      for(const d of dirs){
        const [dx,dy]=DIR_VECT[d]; const nx=e.gx+dx, ny=e.gy+dy;
        if(!passable(nx,ny)) continue;
        const dist=Math.abs(nx-state.player.gx)+Math.abs(ny-state.player.gy);
        if(dist<bestDist){ bestDist=dist; bestDir=d; }
      }
      if(Math.random()<0.35) bestDir = choice([0,1,2,3]);
      const [dx,dy]=DIR_VECT[bestDir]; const nx=e.gx+dx, ny=e.gy+dy;
      if(passable(nx,ny)){
        e.gx=nx; e.gy=ny; e.x=nx; e.y=ny; e.dir=bestDir;
        const landed = getTileAt(nx,ny);
        if (landed && landed.eaten) seedTileAt(nx,ny);
      }
    }
  }
}
function checkCollisions(){
  for(const e of state.enemies){
    if(e.gx===state.player.gx && e.gy===state.player.gy){
      spawnExplosion(state.player.gx,state.player.gy);
      loseLife();
    }
  }
  if(star && star.active && state.player.gx===star.gx && state.player.gy===star.gy){
    star.active=false; state.freezeUntil=now()+3500; showToast('Troggles frozen!');
  }
}

// ---------- HUD ----------
function updateHUD(){
  levelSpan.textContent = state.level;
  scoreSpan.textContent = state.score;
  livesSpan.textContent = state.lives;
  const strong = catBadge.querySelector('strong');
  if (strong) strong.textContent = state.category ? state.category.name : '–';
  updateProgressBar();
}
function updateProgressBar(){
  const pct = clamp((state.math.progress||0)/(state.math.needed||1), 0, 1);
  levelProgress.style.width = `${Math.round(pct*100)}%`;
}
function showToast(msg){
  toast.textContent = msg; toast.classList.remove('hide');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=>toast.classList.add('hide'), 1200);
}
function togglePause(){ if(!state.running) return; state.paused=!state.paused; pauseBtn.textContent = state.paused ? '▶️ Resume' : '⏸️ Pause'; }
function loop(){ if(state.running && !state.paused){ enemyStep(); checkCollisions(); draw(); } requestAnimationFrame(loop); }

// ---------- menu / setup ----------
function parseGridSelect(){
  const v = gridSelect?.value || '12x8';
  const m = v.match(/(\d+)\s*x\s*(\d+)/i); if(!m) return {w:12,h:8};
  return {w:parseInt(m[1],10), h:parseInt(m[2],10)};
}
function populateCategories(){
  if(!categorySelect) return;
  categorySelect.innerHTML = CATEGORIES.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
  if(CATEGORIES.length){
    categorySelect.value = state.category?.id || CATEGORIES[0].id;
  }
}
function applyMenuSettings(){
  // grid
  const g = parseGridSelect(); state.gridW=g.w; state.gridH=g.h;

  // mode
  const m = (modeSelect?.value||'classic').toLowerCase();
  state.mode = (m==='math') ? 'math' : 'classic';

  // category
  const choiceCat = CATEGORIES.find(c=>c.id===categorySelect.value) || CATEGORIES[0];
  state.category = choiceCat;

  // reset log heading
  answerLog = [];
  lastHeadingCategoryId = null;
  if(state.category){ logHeading(state.category.name); lastHeadingCategoryId = state.category.id; }

  state.math.base = 6;
  state.math.progress = 0;
  state.math.needed = computeMathNeeded(1, state.math.base);

  resizeCanvas(); buildBoard(); spawnPlayer(); spawnEnemies(); resetEnemyTimers();
  updateHUD(); updateProgressBar();
}

startBtn.addEventListener('click', ()=>{
  menu.classList.add('hide'); gameover.classList.add('hide');
  applyMenuSettings();
  state.running=true; state.paused=false;
  state.level=1; state.score=0; state.lives=3;
  state.freezeUntil=0; state.invulnUntil=0;
  updateHUD();
});
againBtn.addEventListener('click', ()=>{
  gameover.classList.add('hide'); menu.classList.add('hide');
  applyMenuSettings();
  state.running=true; state.paused=false;
  state.level=1; state.score=0; state.lives=3;
  state.freezeUntil=0; state.invulnUntil=0;
  updateHUD();
});
menuBtn.addEventListener('click', ()=>{ gameover.classList.add('hide'); menu.classList.remove('hide'); state.running=false; });
helpBtn.addEventListener('click', ()=>{ help.classList.remove('hide'); state.paused=true; pauseBtn.textContent='▶️ Resume'; });
closeHelp.addEventListener('click', ()=> help.classList.add('hide'));
pauseBtn.addEventListener('click', togglePause);

// ---------- init ----------
(function init(){
  state.category = CATEGORIES[0];
  populateCategories();
  resizeCanvas();
  updateHUD();
  requestAnimationFrame(loop);
})();
