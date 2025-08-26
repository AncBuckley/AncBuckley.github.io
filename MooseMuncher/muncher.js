// ===== Grab DOM =====
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
const difficulty = document.getElementById('difficulty');
const categorySelect = document.getElementById('categorySelect');
const modeSelect = document.getElementById('modeSelect');
const gridSelect = document.getElementById('gridSelect');
const levelSpan = document.getElementById('level');
const scoreSpan = document.getElementById('score');
const livesSpan = document.getElementById('lives');
const toast = document.getElementById('toast');
const catBadge = document.getElementById('categoryBadge');
const levelProgress = document.getElementById('levelProgress');

// ===== Utils =====
const rand = (min,max)=> Math.random()*(max-min)+min;
const randi = (min,max)=> Math.floor(rand(min,max));
const choice = arr => arr[Math.floor(Math.random()*arr.length)];
const clamp = (v,a,b)=> Math.min(b, Math.max(a,v));
const now = ()=> performance.now();
const shuffle = arr => { for(let i=arr.length-1;i>0;i--){ const j=randi(0,i+1); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; };
const easeOutCubic = t => 1 - Math.pow(1-t,3);
const lerp = (a,b,t)=> a + (b-a)*t;
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;');

const isPrime = n => { if(n<2) return false; if(n%2===0) return n===2; const r=(Math.sqrt(n)|0); for(let i=3;i<=r;i+=2){ if(n%i===0) return false; } return true; };

// ===== Categories (JSON-driven) =====
let WORD_SETS = {}; // from categories.json
let CATEGORIES = [];

function makeWordCategory(name, correctSet, distractFromKeys, labelCase='lower', forcedId){
  const correct = new Set(correctSet);
  const distractPool = Object.keys(WORD_SETS).filter(k=>distractFromKeys.includes(k)).flatMap(k=>WORD_SETS[k]);
  const normalize = s => labelCase==='title'? s.replace(/\b\w/g,c=>c.toUpperCase()) : (labelCase==='upper'? s.toUpperCase() : s);
  return {
    id: forcedId || name.toLowerCase().replace(/\s+/g,'-'), name, type:'word',
    generate:(W,H,countCorrect=12)=>{
      const selectedCorrect = shuffle([...correct]).slice(0,countCorrect);
      const total=W*H; const distractNeeded = Math.max(0,total-selectedCorrect.length);
      const distractors = shuffle(distractPool.filter(w=>!correct.has(w))).slice(0,distractNeeded);
      const items = shuffle([...selectedCorrect,...distractors]).map(w=>({label:normalize(w), value:w, correct: correct.has(w)}));
      return items;
    }
  };
}
function numericCategory(name, predicate, opts={}){
  return {
    id: opts.id || name.toLowerCase().replace(/\s+/g,'-'), name, type:'number',
    generate:(W,H)=>{
      const total=W*H, min=opts.min??2, max=opts.max??99; const items=[];
      const pool = Array.from({length:max-min+1},(_,i)=>i+min);
      const chosen = shuffle(pool).slice(0,total);
      for(const n of chosen){ items.push({label:String(n), value:n, correct: !!predicate(n)}); }
      return shuffle(items);
    }
  };
}
function buildCategoriesFromJSON(json){
  WORD_SETS = json.wordSets || {};
  const list = [];
  for(const nc of (json.numbers||[])){
    let predicate = ()=>false;
    switch(nc.kind){
      case 'even': predicate = n=>n%2===0; break;
      case 'odd': predicate = n=>n%2!==0; break;
      case 'prime': predicate = n=>isPrime(n); break;
      case 'multipleOf': { const k = nc.k||1; predicate = n=> n%k===0; break; }
      case 'square': predicate = n=> Number.isInteger(Math.sqrt(n)); break;
      case 'factorsOf': { const N = nc.n||1; predicate = n=> N % n === 0; break; }
      case 'greaterThan': { const T = nc.threshold ?? 0; predicate = n=> n > T; break; }
      case 'lessThan': { const T = nc.threshold ?? 0; predicate = n=> n < T; break; }
    }
    list.push(numericCategory(nc.name, predicate, {id:nc.id, min:nc.min, max:nc.max}));
  }
  for(const wc of (json.words||[])){
    const set = WORD_SETS[wc.set] || [];
    list.push(makeWordCategory(wc.name, set, wc.distractFrom||[], wc.case||'lower', wc.id));
  }
  return list;
}
async function loadCategories(){
  try{
    const res = await fetch('./categories.json', {cache:'no-store'});
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    CATEGORIES = buildCategoriesFromJSON(data);
  }catch(err){
    console.error('Failed to load categories.json, using minimal fallback.', err);
    // Fallback: tiny set so UI still works
    WORD_SETS = { fruits:["apple","pear","mango","plum"], mammals:["cat","dog"], colors:["red","blue"] };
    CATEGORIES = [
      numericCategory("Even Numbers", n=>n%2===0, {id:'even-numbers', min:2, max:50}),
      makeWordCategory("Fruits", WORD_SETS.fruits, ["colors","mammals"], 'lower', 'fruits')
    ];
  }
}
const pickRandomCategory = (excludeId)=>{ const choices=CATEGORIES.filter(c=>c.id!==excludeId); return choice(choices.length?choices:CATEGORIES); };
const pickRandomMathCategory = (excludeId)=>{ const nums=CATEGORIES.filter(c=>c.type==='number' && c.id!==excludeId); return choice(nums.length?nums:CATEGORIES.filter(c=>c.type==='number')); };
const computeMathNeeded = (level, base)=> Math.max(1, Math.floor(base * Math.pow(2, level-1)));

// ===== Game constants =====
const DIRS={UP:0, RIGHT:1, DOWN:2, LEFT:3};
const DIR_VECT=[[0,-1],[1,0],[0,1],[-1,0]];
const ENEMY_STEP_MS=3000; // one step every 3s
const TROGGLE_COLORS=['#ff3b6b','#ffb800','#00e5ff','#7cff00','#ff00e5','#ff7a00','#00ffb3','#ffd700','#00ffd0','#ff4d00'];

// ===== State =====
let state={ running:false, paused:false, level:1, score:0, lives:3, gridW:12, gridH:8, tile:64,
  category:null, items:[], correctRemaining:0, player:null, enemies:[], freezeUntil:0, invulnUntil:0,
  lastTime:0, mode:'classic', math:{progress:0, base:6, needed:6} };

// Effects
let explosions=[]; // lose life boom
let starBursts=[]; // correct pick
let sfx=[];        // anime disappointment
let catFly=null;   // math category fly-in
let star=null;     // freeze power-up

// ===== Canvas & layout =====
function resizeCanvas(){ const dpr=window.devicePixelRatio||1; const rect=canvas.getBoundingClientRect(); canvas.width=Math.floor(rect.width*dpr); canvas.height=Math.floor(rect.height*dpr); ctx.setTransform(dpr,0,0,dpr,0,0); state.tile=Math.floor(Math.min(rect.width/state.gridW, rect.height/state.gridH)); }
addEventListener('resize', resizeCanvas);

// ===== Board =====
function buildBoard(){ if(!state.category){ console.warn('No category yet'); return; } const W=state.gridW, H=state.gridH; const need=state.mode==='math'? Math.min(W*H, Math.max(12, state.math.needed||12)) : undefined; const items=state.category.generate(W,H,need);
  const totalCorrect=items.filter(i=>i.correct).length; if(totalCorrect < Math.max(6, Math.floor(W*H*0.2))){ let tries=0; while(tries<10){ const alt=state.category.generate(W,H,need); if(alt.filter(i=>i.correct).length>totalCorrect){ items.splice(0,items.length,...alt); break; } tries++; } }
  state.items = items.map((it,idx)=>({...it, eaten:false, gx:idx%W, gy:Math.floor(idx/W)})); state.correctRemaining = state.items.filter(t=>t.correct).length; star=null; }

// ===== Entities =====
function spawnPlayer(){ state.player={ gx:0, gy:0, x:0, y:0, dir:DIRS.RIGHT, moving:null }; }
function spawnEnemies(){ const base = state.level<=3?2: state.level<=6?3:4; const n=clamp(base + (state.level>6?1:0), 2, 6); state.enemies=[]; const occupied=new Set([`0,0`]); const t0=now(); for(let i=0;i<n;i++){ let ex=randi(0,state.gridW), ey=randi(0,state.gridH), tries=0; while((Math.abs(ex-0)+Math.abs(ey-0))<Math.floor((state.gridW+state.gridH)/4) || occupied.has(`${ex},${ey}`)){ ex=randi(0,state.gridW); ey=randi(0,state.gridH); if(++tries>50) break; } occupied.add(`${ex},${ey}`); state.enemies.push({ gx:ex, gy:ey, x:ex, y:ey, dir:randi(0,4), color: choice(TROGGLE_COLORS), nextStepAt: t0 + ENEMY_STEP_MS + i*150 }); } }

// ===== Input =====
document.addEventListener('keydown', e=>{ const k=e.key.toLowerCase(); if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(k)){ e.preventDefault(); if(e.repeat) return; handlePlayerStep(k); return; } if(k===' '||k==='enter'){ tryEat(); } if(k==='p'){ togglePause(); } if(k==='escape'){ if(!help.classList.contains('hide')) help.classList.add('hide'); else togglePause(); } });
function handlePlayerStep(k){ if(!state.running||state.paused||!state.player) return; if(state.player.moving) return; let dir=null; if(k==='arrowup'||k==='w') dir=DIRS.UP; else if(k==='arrowright'||k==='d') dir=DIRS.RIGHT; else if(k==='arrowdown'||k==='s') dir=DIRS.DOWN; else if(k==='arrowleft'||k==='a') dir=DIRS.LEFT; if(dir==null) return; const [dx,dy]=DIR_VECT[dir]; const nx=state.player.gx+dx, ny=state.player.gy+dy; if(passable(nx,ny)){ const fromX=state.player.x, fromY=state.player.y; state.player.gx=nx; state.player.gy=ny; state.player.dir=dir; state.player.moving={ fromX, fromY, toX:nx, toY:ny, start:now(), dur:200 }; } }

// ===== Flow =====
function startGame(){ state.running=true; state.paused=false; state.level=1; state.score=0; state.lives=3; state.freezeUntil=0; state.invulnUntil=0; nextLevel(); }
function nextLevel(){ if(state.mode==='math'){ const prev = state.category ? state.category.id : null; state.category = pickRandomMathCategory(prev); state.math.needed = computeMathNeeded(state.level, state.math.base); state.math.progress = 0; launchCategoryFly(); }
  buildBoard(); spawnPlayer(); spawnEnemies(); updateHUD(); resetEnemyTimers(); state.invulnUntil = now() + 1200; }
function resetEnemyTimers(){ const base=now(); state.enemies.forEach((e,i)=> e.nextStepAt = base + ENEMY_STEP_MS + i*150); }
function levelCleared(){ state.score += 500; state.level += 1; nextLevel(); }
function loseLife(){ if(now()<state.invulnUntil) return; state.lives -= 1; state.invulnUntil = now() + 1500; showToast('Ouch!'); spawnExplosion(state.player.gx, state.player.gy); if(state.lives<=0){ gameOver(); return; } state.player.gx=0; state.player.gy=0; state.player.x=0; state.player.y=0; state.player.dir=DIRS.RIGHT; }
function gameOver(){ state.running=false; state.paused=false; gameover.classList.remove('hide'); document.getElementById('finalStats').textContent = `You scored ${state.score}.`; }

function tryEat(){ if(!state.running||state.paused) return; const tile=getTileAt(state.player.gx,state.player.gy); if(!tile || tile.eaten) return; tile.eaten=true; if(tile.correct){ state.score += 100; spawnStarBurstCell(tile.gx, tile.gy); if(state.mode==='math'){ state.math.progress = Math.min(state.math.needed, (state.math.progress||0)+1); if(state.math.progress>=state.math.needed) setTimeout(levelCleared, 350); } else { state.correctRemaining -= 1; if(state.correctRemaining<=0) setTimeout(levelCleared, 350); } if(Math.random()<0.06) spawnPowerUp(tile.gx,tile.gy); showToast('Yum! +100'); }
  else { state.score = Math.max(0, state.score-50); if(state.mode==='math') state.math.progress = Math.max(0, (state.math.progress||0)-1); spawnDisappointAt(state.player.gx, state.player.gy); loseLife(); showToast('Wrong! −50'); }
  updateHUD(); }

// ===== Powerups =====
function spawnPowerUp(gx,gy){ star={gx,gy,active:true, born:now()}; }

// ===== Helpers =====
function getTileAt(gx,gy){ return state.items.find(t=>t.gx===gx && t.gy===gy); }
function passable(gx,gy){ return gx>=0 && gy>=0 && gx<state.gridW && gy<state.gridH; }

// ===== Rendering =====
function roundRect(ctx,x,y,w,h,r){ const rr=Math.min(r,w/2,h/2); ctx.moveTo(x+rr,y); ctx.arcTo(x+w,y,x+w,y+h,rr); ctx.arcTo(x+w,y+h,x,y+h,rr); ctx.arcTo(x,y+h,x,y,rr); ctx.arcTo(x,y,x+w,y,rr); }
function wrapLabel(text,maxWidth,ctx,maxLines=3){ const words=String(text).split(' '); const lines=[]; let line=''; for(let w of words){ const test=line? line+' '+w : w; if(ctx.measureText(test).width<=maxWidth){ line=test; } else { if(line){ lines.push(line); if(lines.length>=maxLines) return lines; } let tmp=w; while(ctx.measureText(tmp).width>maxWidth){ let cut=tmp.length; while(cut>1 && ctx.measureText(tmp.slice(0,cut)).width>maxWidth) cut--; lines.push(tmp.slice(0,cut)); tmp=tmp.slice(cut); if(lines.length>=maxLines) return lines; } line=tmp; } } if(line && lines.length<maxLines) lines.push(line); return lines; }

function draw(){ const rect=canvas.getBoundingClientRect(); const barArea = state.mode==='math' ? Math.max(90, rect.width*0.08) : 0; const tile = Math.min((rect.width - barArea)/state.gridW, rect.height/state.gridH); const padX=(rect.width - barArea - state.gridW*tile)/2; const padY=(rect.height - state.gridH*tile)/2; ctx.clearRect(0,0,canvas.width,canvas.height);
  if(state.player && state.player.moving){ const m=state.player.moving; const t=(now()-m.start)/m.dur; if(t>=1){ state.player.x=m.toX; state.player.y=m.toY; state.player.moving=null; } else { const s=easeOutCubic(clamp(t,0,1)); state.player.x=m.fromX+(m.toX-m.fromX)*s; state.player.y=m.fromY+(m.toY-m.fromY)*s; } }
  for(const t of state.items){ const x=padX + t.gx*tile; const y=padY + t.gy*tile; const r=14; ctx.beginPath(); roundRect(ctx,x+2,y+2,tile-4,tile-4,r); const grad=ctx.createLinearGradient(x,y,x+tile,y+tile); grad.addColorStop(0, t.eaten?'#0c1430':'#15204a'); grad.addColorStop(1, t.eaten?'#0a1126':'#0e1737'); ctx.fillStyle=grad; ctx.fill(); ctx.strokeStyle=t.eaten?'rgba(255,255,255,.06)':'rgba(255,255,255,.12)'; ctx.lineWidth=1.2; ctx.stroke(); if(!t.eaten){ ctx.save(); ctx.fillStyle='rgba(230,240,255,.95)'; const fs=Math.floor(tile*0.23); ctx.font=`${fs}px ui-sans-serif, system-ui, -apple-system, Segoe UI`; ctx.textAlign='center'; ctx.textBaseline='middle'; const maxW=tile*0.82; const lh=Math.max(16, Math.floor(fs*1.05)); const lines=wrapLabel(t.label,maxW,ctx,3); const totalH=lines.length*lh; let ly=y + tile/2 - totalH/2 + lh/2; for(const line of lines){ ctx.fillText(line, x+tile/2, ly); ly+=lh; } ctx.restore(); } else if(t.correct){ ctx.save(); ctx.globalAlpha=0.18; ctx.fillStyle='#9cff6d'; ctx.beginPath(); ctx.arc(x+tile/2, y+tile/2, tile*0.18, 0, Math.PI*2); ctx.fill(); ctx.restore(); } }
  if(star && star.active){ const x=padX+star.gx*tile+tile/2; const y=padY+star.gy*tile+tile/2; drawStar(ctx,x,y,5,tile*0.22,tile*0.09,'#ffd166'); }
  if(state.player){ const px=padX+state.player.x*tile+tile/2; const py=padY+state.player.y*tile+tile/2; const inv=now()<state.invulnUntil; const panim=getPlayerAnim(); drawMuncher(ctx,px,py,tile*0.34,state.player.dir,inv,panim); }
  for(const e of state.enemies){ const ex=padX+e.x*tile+tile/2; const ey=padY+e.y*tile+tile/2; const frozen=now()<state.freezeUntil; drawTroggle(ctx,ex,ey,tile*0.5,e.dir||0,e.color,frozen); }
  drawExplosions(ctx,padX,padY,tile); drawStarBursts(ctx,padX,padY,tile); drawSFX(ctx,padX,padY,tile); drawCategoryFly(ctx, rect);
  if(state.mode==='math') drawLevelBar(ctx, rect, barArea);
}

// ===== Art =====
function drawStar(ctx,cx,cy,spikes,outerR,innerR,color){ const step=Math.PI/spikes; let rot=-Math.PI/2; ctx.save(); ctx.beginPath(); for(let i=0;i<spikes;i++){ ctx.lineTo(cx+Math.cos(rot)*outerR, cy+Math.sin(rot)*outerR); rot+=step; ctx.lineTo(cx+Math.cos(rot)*innerR, cy+Math.sin(rot)*innerR); rot+=step; } ctx.closePath(); ctx.fillStyle=color; ctx.fill(); ctx.restore(); }
function getPlayerAnim(){ const p=state.player; if(!p) return {moving:false, phase:0, tilt:0, yOffset:0, cape:0}; const moving=!!p.moving; const phase = moving ? clamp((now()-p.moving.start)/p.moving.dur, 0, 1) : 0; let tilt=0,yOffset=0,cape=0; if(moving){ if(p.dir===DIRS.DOWN){ yOffset=-Math.sin(Math.PI*phase)*0.45; tilt=-0.15 + 0.1*Math.sin(Math.PI*phase); cape=0.4; } else { tilt=0.25*(1-Math.cos(Math.PI*phase)); yOffset=-Math.sin(Math.PI*phase)*0.18; cape=1.0; } } else { cape=0.3; } return {moving, phase, tilt, yOffset, cape}; }
function drawMuncher(ctx,x,y,radius,dir,invuln,anim={}){ const angle=[-Math.PI/2,0,Math.PI/2,Math.PI][dir]; ctx.save(); ctx.translate(x,y); ctx.rotate(angle); const tilt=anim.tilt||0, yShift=(anim.yOffset||0)*radius; ctx.rotate(tilt); ctx.translate(0,yShift); const bodyW=radius*1.05, bodyH=radius*1.7; // cape
  ctx.save(); ctx.shadowColor='#34d399'; ctx.shadowBlur=14; ctx.beginPath(); const cx0=-bodyW*0.55, cy0=-bodyH*0.3; const wiggle=(anim.cape?1:0)*Math.sin(now()/130+(anim.phase||0)*3)*bodyH*0.12; ctx.moveTo(cx0,cy0); ctx.bezierCurveTo(-bodyW*1.2, cy0+bodyH*0.2+wiggle*0.2, -bodyW*0.8, cy0+bodyH*0.9+wiggle, -bodyW*0.1, cy0+bodyH*0.8+wiggle*0.6); ctx.bezierCurveTo(bodyW*0.3, cy0+bodyH*0.7+wiggle*0.2, bodyW*0.5, cy0+bodyH*0.1+wiggle*0.1, bodyW*0.1, cy0+bodyH*0.05+wiggle*0.05); ctx.closePath(); const capeGrad=ctx.createLinearGradient(cx0,cy0, bodyW*0.2, cy0+bodyH*0.8); capeGrad.addColorStop(0,'#34d399'); capeGrad.addColorStop(1,'#059669'); ctx.fillStyle=capeGrad; ctx.fill(); ctx.restore(); // torso
  const torsoX=-bodyW/2, torsoY=-bodyH*0.55, torsoW=bodyW, torsoH=bodyH*1.05; const torsoGrad=ctx.createLinearGradient(0,torsoY,0,torsoY+torsoH); torsoGrad.addColorStop(0,'#4ade80'); torsoGrad.addColorStop(1,'#065f46'); ctx.beginPath(); ctx.fillStyle=torsoGrad; roundRect(ctx,torsoX,torsoY,torsoW,torsoH,12); ctx.fill(); ctx.strokeStyle='rgba(255,255,255,.22)'; ctx.lineWidth=1.5; ctx.stroke(); // belt
  ctx.fillStyle='#9cff6d'; ctx.fillRect(torsoX+4, -bodyH*0.02, torsoW-8, radius*0.18); // emblem
  const emX=0, emY=-bodyH*0.1; ctx.beginPath(); ctx.moveTo(emX, emY - radius*0.18); ctx.lineTo(emX + radius*0.16, emY); ctx.lineTo(emX, emY + radius*0.18); ctx.lineTo(emX - radius*0.16, emY); ctx.closePath(); ctx.fillStyle='#0f5132'; ctx.fill(); ctx.fillStyle='#9cff6d'; ctx.font=`${Math.max(10, Math.floor(radius*0.34))}px ui-sans-serif, system-ui`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('M', emX, emY+1); // head
  const headR=radius*0.45; const hx=0, hy=-bodyH*0.95; ctx.fillStyle='#8b5e34'; ctx.beginPath(); ctx.arc(hx,hy,headR,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#c79a67'; ctx.beginPath(); ctx.ellipse(hx, hy+headR*0.25, headR*0.9, headR*0.55, 0,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#231f20'; ctx.beginPath(); ctx.arc(hx-headR*0.18, hy+headR*0.28, headR*0.08, 0, Math.PI*2); ctx.arc(hx+headR*0.18, hy+headR*0.28, headR*0.08, 0, Math.PI*2); ctx.fill(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(hx-headR*0.28, hy-headR*0.15, headR*0.12, 0, Math.PI*2); ctx.arc(hx+headR*0.28, hy-headR*0.15, headR*0.12, 0, Math.PI*2); ctx.fill(); ctx.fillStyle='#0b1020'; ctx.beginPath(); ctx.arc(hx-headR*0.28, hy-headR*0.15, headR*0.06, 0, Math.PI*2); ctx.arc(hx+headR*0.28, hy-headR*0.15, headR*0.06, 0, Math.PI*2); ctx.fill(); // ears
  ctx.fillStyle='#8b5e34'; ctx.beginPath(); ctx.moveTo(hx-headR*0.65, hy-headR*0.2); ctx.quadraticCurveTo(hx-headR*0.8, hy-headR*0.55, hx-headR*0.4, hy-headR*0.45); ctx.quadraticCurveTo(hx-headR*0.55, hy-headR*0.25, hx-headR*0.65, hy-headR*0.2); ctx.fill(); ctx.beginPath(); ctx.moveTo(hx+headR*0.65, hy-headR*0.2); ctx.quadraticCurveTo(hx+headR*0.8, hy-headR*0.55, hx+headR*0.4, hy-headR*0.45); ctx.quadraticCurveTo(hx+headR*0.55, hy-headR*0.25, hx+headR*0.65, hy-headR*0.2); ctx.fill(); // antlers
  const antler=(side)=>{ const s=side===-1?-1:1; ctx.save(); ctx.translate(hx + s*headR*0.2, hy-headR*0.65); ctx.scale(s,1); ctx.fillStyle='#e9d8a6'; ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(0,0); ctx.bezierCurveTo(headR*0.4, -headR*0.2, headR*0.8, -headR*0.6, headR*1.1, -headR*0.7); ctx.bezierCurveTo(headR*0.9, -headR*0.4, headR*0.9, -headR*0.2, headR*0.7, -headR*0.05); ctx.bezierCurveTo(headR*0.8, -headR*0.05, headR*0.9, -headR*0.02, headR*1.0, 0); ctx.bezierCurveTo(headR*0.8, headR*0.05, headR*0.4, headR*0.05, 0, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); const tine=(tx,ty,len)=>{ ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(tx+len, ty-headR*0.18); ctx.lineWidth=1.3; ctx.stroke(); }; tine(headR*0.45,-headR*0.35, headR*0.35); tine(headR*0.65,-headR*0.5, headR*0.3); tine(headR*0.85,-headR*0.6, headR*0.25); ctx.restore(); }; antler(-1); antler(1); // limbs
  ctx.strokeStyle='#e6f0ff'; ctx.lineWidth=Math.max(2, radius*0.12); ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(-bodyW*0.45,-bodyH*0.25); ctx.lineTo(-bodyW*0.85,-bodyH*0.05); ctx.moveTo(bodyW*0.45,-bodyH*0.25); ctx.lineTo(bodyW*0.85,0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-bodyW*0.25, bodyH*0.4); ctx.lineTo(-bodyW*0.25, bodyH*0.8); ctx.moveTo(bodyW*0.25, bodyH*0.4); ctx.lineTo(bodyW*0.25, bodyH*0.8); ctx.stroke(); if(invuln){ ctx.globalAlpha=0.6; ctx.strokeStyle='#9cff6d'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,-bodyH*0.2, radius*1.1, 0, Math.PI*2); ctx.stroke(); } ctx.restore(); }
function drawTroggle(ctx,x,y,size,dir,color,frozen){ ctx.save(); ctx.translate(x,y); ctx.rotate([-Math.PI/2,0,Math.PI/2,Math.PI][dir]); const w=size*1.1,h=size*0.9; ctx.shadowColor=color; ctx.shadowBlur=frozen?8:18; ctx.beginPath(); ctx.moveTo(-w/2,h/2); ctx.lineTo(0,-h/2); ctx.lineTo(w/2,h/2); ctx.closePath(); const grd=ctx.createLinearGradient(-w/2,-h/2,w/2,h/2); grd.addColorStop(0, frozen? '#8af1ff' : color); grd.addColorStop(1,'#ffffff22'); ctx.fillStyle=grd; ctx.fill(); ctx.shadowBlur=0; ctx.lineWidth=2; ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.stroke(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(-size*0.2,-size*0.06,size*0.09,0,Math.PI*2); ctx.arc(size*0.2,-size*0.06,size*0.09,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#0b1020'; ctx.beginPath(); ctx.arc(-size*0.2,-size*0.06,size*0.045,0,Math.PI*2); ctx.arc(size*0.2,-size*0.06,size*0.045,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(-w*0.32, h*0.15); ctx.lineTo(w*0.32, h*0.15); ctx.stroke(); ctx.restore(); }

// ===== Effects =====
function spawnExplosion(gx,gy){ const N=18; const parts=[]; for(let i=0;i<N;i++) parts.push({ang:rand(0,Math.PI*2), spd:rand(0.6,1.1)}); explosions.push({gx,gy,born:now(),duration:650,parts}); }
function drawExplosions(ctx,padX,padY,tile){ const tnow=now(); explosions=explosions.filter(ex=> tnow-ex.born<ex.duration); for(const ex of explosions){ const p=clamp((tnow-ex.born)/ex.duration,0,1); const cx=padX+ex.gx*tile+tile/2; const cy=padY+ex.gy*tile+tile/2; ctx.save(); ctx.globalAlpha=0.5*(1-p); ctx.beginPath(); ctx.arc(cx,cy, tile*0.15 + tile*0.4*easeOutCubic(p), 0, Math.PI*2); ctx.strokeStyle='#ff6d8a'; ctx.lineWidth=2; ctx.stroke(); ctx.restore(); for(const pr of ex.parts){ const dist=easeOutCubic(p)*pr.spd*tile*0.9; const x=cx+Math.cos(pr.ang)*dist; const y=cy+Math.sin(pr.ang)*dist; ctx.save(); ctx.globalAlpha=1-p; ctx.fillStyle='#ff6d8a'; ctx.beginPath(); ctx.arc(x,y, Math.max(1.5, 3*(1-p)), 0, Math.PI*2); ctx.fill(); ctx.restore(); } } }
function spawnStarBurstCell(gx,gy){ const N=12; const parts=[]; for(let i=0;i<N;i++) parts.push({ ang: rand(0, Math.PI*2), spd: rand(0.6, 1.1) }); starBursts.push({ gx, gy, born: now(), duration: 700, parts }); }
function drawStarBursts(ctx,padX,padY,tile){ const tnow=now(); starBursts=starBursts.filter(s=> tnow-s.born<s.duration); for(const sb of starBursts){ const p=clamp((tnow-sb.born)/sb.duration,0,1); const cx=padX+sb.gx*tile+tile/2; const cy=padY+sb.gy*tile+tile/2; for(const pr of sb.parts){ const dist=easeOutCubic(p)*pr.spd*tile*0.95; const x=cx+Math.cos(pr.ang)*dist; const y=cy+Math.sin(pr.ang)*dist; ctx.save(); ctx.globalAlpha=1-p; drawStar(ctx,x,y,5, Math.max(2,tile*0.10*(1-p)), Math.max(1,tile*0.05*(1-p)),'#ffd166'); ctx.restore(); } } }
function spawnDisappointAt(gx,gy){ sfx.push({type:'disappoint', gx, gy, born:now(), duration:800}); }
function drawSFX(ctx,padX,padY,tile){ const tnow=now(); sfx=sfx.filter(e=> tnow-e.born<e.duration); for(const e of sfx){ if(e.type==='disappoint'){ const p=clamp((tnow-e.born)/e.duration,0,1); const cx=padX+e.gx*tile+tile/2; const cy=padY+e.gy*tile+tile/2 - tile*0.2; ctx.save(); ctx.strokeStyle='rgba(70,212,255,0.9)'; ctx.lineWidth=2; const n=4; for(let i=0;i<n;i++){ const off=(i-(n-1)/2)*tile*0.08; const len=tile*0.22*(1-p); ctx.beginPath(); ctx.moveTo(cx+off, cy - tile*0.2); ctx.lineTo(cx+off, cy - tile*0.2 + len); ctx.stroke(); } ctx.restore(); ctx.save(); ctx.globalAlpha=1-p; ctx.fillStyle='#46d4ff'; ctx.beginPath(); ctx.moveTo(cx + tile*0.18, cy - tile*0.06); ctx.quadraticCurveTo(cx + tile*0.24, cy + tile*0.02, cx + tile*0.14, cy + tile*0.10); ctx.quadraticCurveTo(cx + tile*0.28, cy + tile*0.00, cx + tile*0.18, cy - tile*0.06); ctx.fill(); ctx.restore(); } } }
// Math mode: fly-in of category name
function launchCategoryFly(){ catFly = { text: state.category.name, start: now(), delay: 1000, dur: 900 }; }
function getBadgeCenterInCanvas(){ const br=catBadge.getBoundingClientRect(); const cr=canvas.getBoundingClientRect(); return { x: br.left - cr.left + br.width/2, y: br.top - cr.top + br.height/2 }; }
function drawCategoryFly(ctx, rect){ if(!catFly) return; const elapsed=now()-catFly.start; const from={ x: rect.width/2, y: rect.height*0.42 }; const to=getBadgeCenterInCanvas(); if(elapsed < catFly.delay){ ctx.save(); ctx.globalAlpha=0.95; ctx.fillStyle='#e8f4ff'; ctx.font='700 36px system-ui, -apple-system, Segoe UI'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.shadowColor='#46d4ff'; ctx.shadowBlur=18; ctx.fillText(catFly.text, from.x, from.y); ctx.restore(); return; } const tt=clamp((elapsed-catFly.delay)/catFly.dur,0,1); const x=lerp(from.x,to.x,easeOutCubic(tt)); const y=lerp(from.y,to.y,easeOutCubic(tt)); const size=Math.round(36*(1.1-0.15*tt)); ctx.save(); ctx.globalAlpha=1-tt*0.9; ctx.fillStyle='#e8f4ff'; ctx.font=`700 ${size}px system-ui, -apple-system, Segoe UI`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.shadowColor='#9cff6d'; ctx.shadowBlur=18; ctx.fillText(catFly.text, x, y); ctx.restore(); if(tt>=1) catFly=null; }
// right-side progress bar in canvas
function drawLevelBar(ctx, rect, barArea){ const barW=Math.max(20, Math.floor(barArea*0.5)); const margin=16; const x=rect.width - barArea + (barArea-barW)/2; const y=margin; const h=rect.height - margin*2; ctx.save(); ctx.fillStyle='#0a1437'; ctx.strokeStyle='#20306b'; ctx.lineWidth=1; roundRect(ctx,x,y,barW,h,10); ctx.fill(); ctx.stroke(); const pct=clamp((state.math.progress||0)/(state.math.needed||1),0,1); ctx.save(); ctx.beginPath(); roundRect(ctx,x+2,y+2, barW-4, (h-4)*pct, 8); const grad=ctx.createLinearGradient(0,y+h,0,y); grad.addColorStop(0,'#46d4ff'); grad.addColorStop(1,'#9cff6d'); ctx.fillStyle=grad; ctx.fill(); ctx.restore(); ctx.fillStyle='#cfe2ff'; ctx.font='12px system-ui, sans-serif'; ctx.textAlign='center'; ctx.textBaseline='bottom'; ctx.fillText(`${(state.math.progress||0)}/${(state.math.needed||1)}`, x+barW/2, y+h-6); ctx.restore(); }

// ===== Enemy step & collision =====
function enemyStep(){ if(now()<state.freezeUntil) return; for(const e of state.enemies){ if(now()>=e.nextStepAt){ e.nextStepAt = now() + ENEMY_STEP_MS; const dirs=[0,1,2,3]; shuffle(dirs); let bestDir=e.dir||0, bestDist=Infinity; for(const d of dirs){ const [dx,dy]=DIR_VECT[d]; const nx=e.gx+dx, ny=e.gy+dy; if(!passable(nx,ny)) continue; const dist=Math.abs(nx-state.player.gx)+Math.abs(ny-state.player.gy); if(dist<bestDist){ bestDist=dist; bestDir=d; } } if(Math.random()<0.35) bestDir = choice([0,1,2,3]); const [dx,dy]=DIR_VECT[bestDir]; const nx=e.gx+dx, ny=e.gy+dy; if(passable(nx,ny)){ e.gx=nx; e.gy=ny; e.x=nx; e.y=ny; e.dir=bestDir; } } } }
function checkCollisions(){ for(const e of state.enemies){ if(e.gx===state.player.gx && e.gy===state.player.gy){ loseLife(); } } if(star && star.active && state.player.gx===star.gx && state.player.gy===star.gy){ star.active=false; state.freezeUntil = now() + 3500; showToast('Troggles frozen!'); } }

// ===== HUD & buttons =====
function updateHUD(){ levelSpan.textContent=state.level; scoreSpan.textContent=state.score; livesSpan.textContent=state.lives; const strong=catBadge.querySelector('strong'); if(strong) strong.textContent = state.category? state.category.name : '–'; updateProgressBar(); }
function updateProgressBar(){ if(state.mode!=='math'){ levelProgress.style.width='0%'; return; } const pct=clamp((state.math.progress||0)/(state.math.needed||1),0,1); levelProgress.style.width=`${Math.round(pct*100)}%`; }
function showToast(msg){ toast.textContent=msg; toast.classList.remove('hide'); clearTimeout(showToast._t); toast._t = setTimeout(()=> toast.classList.add('hide'), 1200); }
function togglePause(){ if(!state.running) return; state.paused=!state.paused; pauseBtn.textContent = state.paused? '▶️ Resume' : '⏸️ Pause'; }

// ===== Loop =====
function loop(){ if(state.running && !state.paused){ enemyStep(); checkCollisions(); draw(); } requestAnimationFrame(loop); }

// ===== Menu & setup =====
function populateCategories(){ if(!categorySelect) return; if(!CATEGORIES.length){ categorySelect.innerHTML=''; categorySelect.disabled=true; return; } categorySelect.innerHTML = CATEGORIES.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join(''); if(CATEGORIES.length){ categorySelect.value = (state.category && state.category.id) || CATEGORIES[0].id; } categorySelect.disabled = (modeSelect.value==='math'); }
function applyMenuSettings(){ const [gw,gh]=gridSelect.value.split('x').map(Number); state.gridW=gw; state.gridH=gh; state.mode=modeSelect.value; if(state.mode==='classic'){ const cat=CATEGORIES.find(c=>c.id===categorySelect.value)||CATEGORIES[0]; state.category=cat; } else { state.category = pickRandomMathCategory(state.category?state.category.id:null); state.math.base=6; state.math.progress=0; state.math.needed=computeMathNeeded(1,state.math.base); } resizeCanvas(); buildBoard(); spawnPlayer(); spawnEnemies(); resetEnemyTimers(); updateHUD(); updateProgressBar(); }

startBtn.addEventListener('click', ()=>{ menu.classList.add('hide'); gameover.classList.add('hide'); applyMenuSettings(); state.running=true; state.paused=false; state.level=1; state.score=0; state.lives=3; state.freezeUntil=0; state.invulnUntil=0; updateHUD(); });
againBtn.addEventListener('click', ()=>{ gameover.classList.add('hide'); menu.classList.add('hide'); applyMenuSettings(); state.running=true; state.paused=false; state.level=1; state.score=0; state.lives=3; state.freezeUntil=0; state.invulnUntil=0; updateHUD(); });
menuBtn.addEventListener('click', ()=>{ gameover.classList.add('hide'); menu.classList.remove('hide'); state.running=false; });
helpBtn.addEventListener('click', ()=>{ help.classList.remove('hide'); state.paused=true; pauseBtn.textContent='▶️ Resume'; });
closeHelp.addEventListener('click', ()=> help.classList.add('hide'));
pauseBtn.addEventListener('click', togglePause);
document.getElementById('shuffleBtn').addEventListener('click', ()=>{ if(modeSelect.value==='classic'){ const r=choice(CATEGORIES); categorySelect.value=r.id; } });
modeSelect.addEventListener('change', ()=>{ categorySelect.disabled=(modeSelect.value==='math'); if(modeSelect.value==='classic') populateCategories(); updateProgressBar(); });

// ===== Boot (async) =====
(async function init(){
  await loadCategories();
  state.category = CATEGORIES[0] || null;
  populateCategories();
  resizeCanvas();
  updateHUD();
  requestAnimationFrame(loop);
})();
