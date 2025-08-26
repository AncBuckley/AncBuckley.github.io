// muncher.js — fixed 5x5 grid, adaptive troggle seeding, larger tiles (+5%), no mid-word wraps,
// modes: single-category, math-only, words-only, anything-goes; unified progress bar.
// NEW: "Recent Answers" list between the grid and the progress bar (last 10, color-coded, with headings).
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
const esc = s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;');
const isPrime = n=>{if(n<2)return false;if(n%2===0)return n===2;const r=(Math.sqrt(n)|0);for(let i=3;i<=r;i+=2){if(n%i===0)return false}return true};

// ---------- data ----------
let WORD_SETS = {};
let CATEGORIES = [];

function applyCrossHints(wordSets, crossHints){
  if(!crossHints) return wordSets;
  const hasWord = (arr,w)=>arr.some(x=>x.toLowerCase()===String(w).toLowerCase());
  for(const [word,targets] of Object.entries(crossHints)){
    for(const setName of targets){
      wordSets[setName] = wordSets[setName] || [];
      if(!hasWord(wordSets[setName], word)) wordSets[setName].push(word);
    }
  }
  return wordSets;
}

function makeWordCategory(name, correctSet, distractFromKeys=[], labelCase='lower', forcedId, sourceKey){
  const normalize = s =>
    labelCase==='title' ? String(s).replace(/\b\w/g,c=>c.toUpperCase())
    : labelCase==='upper' ? String(s).toUpperCase()
    : String(s);
  const toLower = s => String(s).toLowerCase();
  const correctLower = new Set((correctSet||[]).map(toLower));

  // Build distractor pool: all other sets + any explicit sets
  const pool = [];
  for (const [key, arr] of Object.entries(WORD_SETS)){
    if (!arr) continue;
    if (sourceKey && key === sourceKey) continue;
    pool.push(...arr);
  }
  for (const key of (distractFromKeys||[])){
    const arr = WORD_SETS[key];
    if (arr) pool.push(...arr);
  }
  const poolLower = [...new Set(pool.map(toLower))].filter(w => !correctLower.has(w));
  const hydrate = (wLower) => {
    for (const arr of Object.values(WORD_SETS)){
      const found = (arr||[]).find(x => toLower(x)===wLower);
      if (found) return String(found);
    }
    return wLower;
  };

  function getCorrectList(){ return [...new Set((correctSet||[]).map(String))]; }
  function getDistractorList(){ return poolLower.map(hydrate); }

  return {
    id: forcedId || name.toLowerCase().replace(/\s+/g,'-'),
    name,
    type: 'word',
    sourceKey,
    labelCase,
    getCorrectList,
    getDistractorList,
    normalize,
    generate: (W,H,countCorrect=12) => {
      const total = W*H;
      const correctList = getCorrectList();
      const selectedCorrect = shuffle(correctList).slice(0, Math.min(countCorrect, total));
      const distractNeeded = Math.max(0, total - selectedCorrect.length);
      const src = poolLower.length ? shuffle(poolLower) : [];
      const distractsLower = [];
      for (let i=0; i<distractNeeded; i++){
        if (src.length===0) break;
        distractsLower.push(src[i % src.length]);
      }
      const distracts = distractsLower.map(hydrate);
      const items = [...selectedCorrect, ...distracts].map(w => ({
        label: normalize(w),
        value: String(w),
        correct: correctLower.has(toLower(w))
      }));
      return shuffle(items);
    }
  };
}

function numericCategory(name, predicate, opts={}){
  const min = opts.min ?? 2;
  const max = opts.max ?? 99;
  return {
    id: opts.id || name.toLowerCase().replace(/\s+/g,'-'),
    name,
    type: 'number',
    min, max,
    test: predicate,
    generate: (W,H) => {
      const total = W*H;
      const pool = Array.from({length: max-min+1}, (_,i)=> i+min);
      const chosen = shuffle(pool).slice(0, total);
      return chosen.map(n => ({ label: String(n), value: n, correct: !!predicate(n) }));
    }
  };
}

function buildCategoriesFromJSON(json){
  WORD_SETS = json.wordSets || {};
  WORD_SETS = applyCrossHints(WORD_SETS, json.crossHints);

  const list = [];
  for (const nc of (json.numbers||[])){
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
  for (const wc of (json.words||[])){
    const set = WORD_SETS[wc.set] || [];
    list.push(makeWordCategory(wc.name, set, wc.distractFrom||[], wc.case||'lower', wc.id, wc.set));
  }
  return list;
}

async function loadCategories(){
  const url = new URL('./categories.json', import.meta.url).toString();
  try{
    const res = await fetch(url, {cache:'no-store'});
    if(!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const data = await res.json();
    CATEGORIES = buildCategoriesFromJSON(data);
  }catch(err){
    console.error('Failed to load categories.json, using fallback. URL:', url, err);
    WORD_SETS = { fruits:['apple','pear','mango','plum'], mammals:['cat','dog'], colors:['red','blue'] };
    CATEGORIES = [
      numericCategory('Even Numbers', n=>n%2===0, {id:'even-numbers', min:2, max:50}),
      makeWordCategory('Fruits', WORD_SETS.fruits, ['colors','mammals'], 'lower', 'fruits', 'fruits')
    ];
  }
}

// ---------- modes ----------
const DIRS = { UP:0, RIGHT:1, DOWN:2, LEFT:3 };
const DIR_VECT = [[0,-1],[1,0],[0,1],[-1,0]];
const ENEMY_STEP_MS = 3000;
const TROGGLE_COLORS = ['#ff3b6b','#ffb800','#00e5ff','#7cff00','#ff00e5','#ff7a00','#00ffb3','#ffd700','#00ffd0','#ff4d00'];

const canonicalMode = (raw)=>{
  const v = String(raw||'').toLowerCase().trim();
  if (v==='classic') return 'single-category';
  if (v==='math') return 'math-only';
  if (['single','single category','single-category'].includes(v)) return 'single-category';
  if (['math-only','math only'].includes(v)) return 'math-only';
  if (['words-only','words only'].includes(v)) return 'words-only';
  if (['anything-goes','anything goes','any'].includes(v)) return 'anything-goes';
  return v || 'single-category';
};

const usesProgressBar = (mode)=> ['single-category','math-only','words-only','anything-goes'].includes(mode);

const pickRandomCategory = excludeId =>{
  const choices = CATEGORIES.filter(c=>c.id!==excludeId);
  return choice(choices.length ? choices : CATEGORIES);
};
const pickRandomMathCategory = excludeId =>{
  const nums = CATEGORIES.filter(c=>c.type==='number' && c.id!==excludeId);
  return choice(nums.length ? nums : CATEGORIES.filter(c=>c.type==='number'));
};
const pickRandomWordCategory = excludeId =>{
  const words = CATEGORIES.filter(c=>c.type==='word' && c.id!==excludeId);
  return choice(words.length ? words : CATEGORIES.filter(c=>c.type==='word'));
};
const pickRandomAnyCategory = excludeId => pickRandomCategory(excludeId);

const computeMathNeeded = (level, base)=> Math.max(1, Math.floor(base * Math.pow(2, level-1)));

// ---------- state ----------
let state = {
  running:false, paused:false,
  level:1, score:0, lives:3,
  gridW:5, gridH:5,                // ← fixed 5×5 grid
  tile:64,
  category:null,
  items:[], correctRemaining:0,
  player:null, enemies:[],
  freezeUntil:0, invulnUntil:0, lastTime:0,
  mode:'single-category',
  math:{ progress:0, base:6, needed:6 }
};

let explosions=[]; let starBursts=[]; let sfx=[]; let catFly=null; let star=null;

// ---------- Recent answers log ----------
const MAX_LOG = 10;
let answerLog = []; // entries: {type:'answer', text, correct, time} | {type:'heading', text, time}
let lastHeadingCategoryId = null;

function logAnswer(text, correct){
  answerLog.push({ type:'answer', text:String(text), correct:!!correct, time: now() });
  if(answerLog.length > MAX_LOG) answerLog = answerLog.slice(answerLog.length - MAX_LOG);
}
function logHeading(text){
  answerLog.push({ type:'heading', text:String(text), time: now() });
  if(answerLog.length > MAX_LOG) answerLog = answerLog.slice(answerLog.length - MAX_LOG);
}

// ---------- layout ----------
function resizeCanvas(){
  const dpr = window.devicePixelRatio||1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width*dpr);
  canvas.height = Math.floor(rect.height*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  state.tile = Math.floor(Math.min(rect.width/state.gridW, rect.height/state.gridH));
}
addEventListener('resize', resizeCanvas);

// ---------- board ----------
function minCorrectForBoard(W,H){
  return Math.min(W*H, Math.max(12, (state.math.needed||12)));
}

function buildBoard(){
  if(!state.category){ console.warn('No category yet'); return; }
  const W = state.gridW, H = state.gridH;
  const need = minCorrectForBoard(W,H);

  let items = state.category.generate(W,H,need);

  // keep at least ~20% correct
  let correctCount = items.filter(i=>i.correct).length;
  const targetMin = Math.max(6, Math.floor(W*H*0.2));
  if (correctCount < targetMin){
    let best = items, bestCount = correctCount;
    for (let i=0;i<12;i++){
      const alt = state.category.generate(W,H,need);
      const c = alt.filter(x=>x.correct).length;
      if (c > bestCount){ best = alt; bestCount = c; if (c >= targetMin) break; }
    }
    items = best;
  }

  state.items = items.map((it,idx)=>({
    ...it, eaten:false, gx:idx%W, gy:Math.floor(idx/W)
  }));
  state.correctRemaining = state.items.filter(t=>t.correct).length;
  star = null;
}

// ---------- actors ----------
function spawnPlayer(){ state.player={gx:0,gy:0,x:0,y:0,dir:DIRS.RIGHT,moving:null}; }

function spawnEnemies(){
  const base = state.level<=3?2 : state.level<=6?3 : 4;
  const n = clamp(base + (state.level>6?1:0), 2, 6);
  state.enemies = [];
  const occupied = new Set([`0,0`]);
  const t0 = now();
  for(let i=0;i<n;i++){
    let ex=randi(0,state.gridW), ey=randi(0,state.gridH), tries=0;
    while ((Math.abs(ex-0)+Math.abs(ey-0)) < Math.floor((state.gridW+state.gridH)/4) || occupied.has(`${ex},${ey}`)){
      ex=randi(0,state.gridW); ey=randi(0,state.gridH); if(++tries>50) break;
    }
    occupied.add(`${ex},${ey}`);
    state.enemies.push({gx:ex,gy:ey,x:ex,y:ey,dir:randi(0,4),color:choice(TROGGLE_COLORS),nextStepAt:t0+ENEMY_STEP_MS+i*150});
  }
}

// ---------- input ----------
document.addEventListener('keydown', e=>{
  const k = e.key.toLowerCase();
  if (['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(k)){
    e.preventDefault(); if(e.repeat) return; handlePlayerStep(k); return;
  }
  if (k===' ' || k==='enter'){ tryEat(); }
  if (k==='p'){ togglePause(); }
  if (k==='escape'){ if(!help.classList.contains('hide')) help.classList.add('hide'); else togglePause(); }
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

  const [dx,dy] = DIR_VECT[dir];
  const nx = state.player.gx+dx, ny=state.player.gy+dy;
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
  nextLevel(true);
}

function nextLevel(isFirst=false){
  const m = state.mode;
  const prevId = state.category ? state.category.id : null;

  if (m==='single-category'){
    if (isFirst) launchCategoryFly();
  } else {
    if (m==='math-only') state.category = pickRandomMathCategory(prevId);
    else if (m==='words-only') state.category = pickRandomWordCategory(prevId);
    else if (m==='anything-goes') state.category = pickRandomAnyCategory(prevId);
    launchCategoryFly();
  }

  // Log heading if category changed
  if (state.category && state.category.id !== lastHeadingCategoryId){
    logHeading(state.category.name);
    lastHeadingCategoryId = state.category.id;
  }

  state.math.needed = computeMathNeeded(state.level, state.math.base);
  state.math.progress = 0;

  buildBoard(); spawnPlayer(); spawnEnemies(); updateHUD(); resetEnemyTimers();
  state.invulnUntil = now()+1200;
}

function resetEnemyTimers(){ const base=now(); state.enemies.forEach((e,i)=>e.nextStepAt=base+ENEMY_STEP_MS+i*150); }
function levelCleared(){ state.score+=500; state.level+=1; nextLevel(); }

function loseLife(){
  if(now()<state.invulnUntil) return;
  state.lives -= 1; state.invulnUntil = now()+1500;
  showToast('Ouch!'); spawnExplosion(state.player.gx,state.player.gy);
  if(state.lives<=0){ gameOver(); return; }
  state.player.gx=0; state.player.gy=0; state.player.x=0; state.player.y=0; state.player.dir=DIRS.RIGHT;
}

function gameOver(){
  state.running=false; state.paused=false;
  gameover.classList.remove('hide');
  document.getElementById('finalStats').textContent = `You scored ${state.score}.`;
}

function tryEat(){
  if(!state.running || state.paused) return;
  const tile = getTileAt(state.player.gx, state.player.gy);
  if(!tile || tile.eaten) return;

  tile.eaten = true;
  // Log the pick
  logAnswer(tile.label, !!tile.correct);

  if(tile.correct){
    state.score += 100;
    spawnStarBurstCell(tile.gx,tile.gy);
    state.math.progress = Math.min(state.math.needed, (state.math.progress||0)+1);
    if (state.math.progress >= state.math.needed) setTimeout(levelCleared, 350);
    if (Math.random() < 0.06) spawnPowerUp(tile.gx,tile.gy);
    showToast('Yum! +100');
  } else {
    state.score = Math.max(0, state.score-50);
    state.math.progress = Math.max(0, (state.math.progress||0)-1);
    spawnDisappointAt(state.player.gx,state.player.gy);
    loseLife();
    showToast('Wrong! −50');
  }
  updateHUD();
}

// ---------- pickups & tiles ----------
function spawnPowerUp(gx,gy){ star={gx,gy,active:true,born:now()}; }
function getTileAt(gx,gy){ return state.items.find(t=>t.gx===gx && t.gy===gy); }
function passable(gx,gy){ return gx>=0 && gy>=0 && gx<state.gridW && gy<state.gridH; }

function roundRect(ctx,x,y,w,h,r){ const rr=Math.min(r,w/2,h/2);
  ctx.moveTo(x+rr,y); ctx.arcTo(x+w,y,x+w,y+h,rr); ctx.arcTo(x+w,y+h,x,y+h,rr);
  ctx.arcTo(x,y+h,x,y,rr); ctx.arcTo(x,y,x+w,y,rr);
}

// (legacy wrap; kept for any other use)
function wrapLabel(text,maxWidth,ctx,maxLines=4){
  const words=String(text).split(' '); const lines=[]; let line='';
  for(let w of words){
    const test = line ? line+' '+w : w;
    if(ctx.measureText(test).width <= maxWidth){ line=test; }
    else{
      if(line){ lines.push(line); if(lines.length>=maxLines) return lines; }
      let tmp=w;
      while(ctx.measureText(tmp).width>maxWidth){
        let cut = tmp.length;
        while(cut>1 && ctx.measureText(tmp.slice(0,cut)).width>maxWidth) cut--;
        lines.push(tmp.slice(0,cut)); tmp=tmp.slice(cut);
        if(lines.length>=maxLines) return lines;
      }
      line=tmp;
    }
  }
  if(line && lines.length<maxLines) lines.push(line);
  return lines;
}

// Fit text without breaking words — shrink font until it fits in <= maxLines
function layoutLabelNoBreak(ctx, text, maxWidth, maxLines, basePx, fontFamily='ui-sans-serif, system-ui, -apple-system, Segoe UI'){
  let fs = basePx;
  let lines = [];
  for(let iter=0; iter<14; iter++){
    ctx.font = `${fs}px ${fontFamily}`;
    const words = String(text).trim().split(/\s+/).filter(Boolean);
    let tooWide = false;

    for(const w of words){
      if(ctx.measureText(w).width > maxWidth){ tooWide = true; break; }
    }

    lines = [];
    let line = '';
    if(!tooWide){
      for(const w of words){
        const test = line ? `${line} ${w}` : w;
        if(ctx.measureText(test).width <= maxWidth){
          line = test;
        }else{
          if(line) lines.push(line); else { tooWide = true; break; }
          line = w;
          if(lines.length >= maxLines){ tooWide = true; break; }
        }
      }
      if(line && lines.length < maxLines) lines.push(line);
    }

    if(!tooWide && lines.length <= maxLines) break;
    fs = Math.max(10, Math.floor(fs * 0.92));
  }
  const lineHeight = Math.max(12, Math.floor(fs * 1.08));
  return { lines, font: `${fs}px ${fontFamily}`, fontSize: fs, lineHeight };
}

// ---------- dynamic seeding by troggles ----------
function normalizeLabelCase(s, labelCase){
  if(labelCase === 'title') return String(s).replace(/\b\w/g,c=>c.toUpperCase());
  if(labelCase === 'upper') return String(s).toUpperCase();
  return String(s);
}

function computeSeedCorrectProb(){
  const uneaten = state.items.filter(t=>!t.eaten);
  const correctUneaten = uneaten.filter(t=>t.correct).length;
  const ratio = uneaten.length ? correctUneaten/uneaten.length : 0;
  let p = clamp(0.7 - 0.6*ratio, 0.12, 0.88);
  if (correctUneaten <= 2) p = Math.max(p, 0.80);
  return p;
}

function sampleCorrectNumber(cat){
  for(let tries=0; tries<32; tries++){
    const n = randi(cat.min, cat.max+1);
    if (cat.test(n)) return n;
  }
  for(let n=cat.min;n<=cat.max;n++) if(cat.test(n)) return n;
  return randi(cat.min, cat.max+1);
}

function sampleIncorrectNumber(cat){
  for(let tries=0; tries<32; tries++){
    const n = randi(cat.min, cat.max+1);
    if (!cat.test(n)) return n;
  }
  for(let n=cat.min;n<=cat.max;n++) if(!cat.test(n)) return n;
  return randi(cat.min, cat.max+1);
}

function seedTileAt(gx,gy){
  if(!state.category) return;
  const tile = getTileAt(gx,gy);
  if(!tile || !tile.eaten) return;

  const pCorrect = computeSeedCorrectProb();

  if (state.category.type === 'word'){
    const cat = state.category;
    const correctList = (cat.getCorrectList ? cat.getCorrectList() : []);
    const distractList = (cat.getDistractorList ? cat.getDistractorList() : []);
    let makeCorrect = Math.random() < pCorrect && correctList.length>0;
    if(!makeCorrect && distractList.length===0 && correctList.length>0) makeCorrect = true;

    const pick = makeCorrect
      ? choice(correctList)
      : (distractList.length ? choice(distractList) : choice(correctList));

    tile.label = normalizeLabelCase(pick, cat.labelCase||'lower');
    tile.value = String(pick);
    tile.correct = makeCorrect;
    tile.eaten = false;
    if (tile.correct) state.correctRemaining += 1;
  } else { // number
    const cat = state.category;
    const makeCorrect = Math.random() < pCorrect;
    const n = makeCorrect ? sampleCorrectNumber(cat) : sampleIncorrectNumber(cat);
    tile.label = String(n);
    tile.value = n;
    tile.correct = !!cat.test(n);
    tile.eaten = false;
    if (tile.correct) state.correctRemaining += 1;
  }
}

// ---------- render ----------
function draw(){
  const rect = canvas.getBoundingClientRect();
  const barArea = Math.max(90, rect.width*0.08); // progress bar shown for all modes
  const baseTile = Math.min((rect.width - barArea) / state.gridW, rect.height / state.gridH);
  let tile = baseTile;
  const enlarged = baseTile * 1.05; // ~5% larger if it still fits
  if (enlarged * state.gridW <= (rect.width - barArea) && enlarged * state.gridH <= rect.height){
    tile = enlarged;
  }
  const padX = (rect.width - barArea - state.gridW*tile) / 2;
  const padY = (rect.height - state.gridH*tile) / 2;

  ctx.clearRect(0,0,canvas.width,canvas.height);

  // tween player move
  if(state.player && state.player.moving){
    const m = state.player.moving;
    const t = (now()-m.start)/m.dur;
    if(t>=1){ state.player.x=m.toX; state.player.y=m.toY; state.player.moving=null; }
    else{
      const s=easeOutCubic(clamp(t,0,1));
      state.player.x = m.fromX + (m.toX-m.fromX)*s;
      state.player.y = m.fromY + (m.toY-m.fromY)*s;
    }
  }

  // tiles
  for(const t of state.items){
    const x = padX + t.gx*tile;
    const y = padY + t.gy*tile;
    const r = 16;
    ctx.beginPath(); roundRect(ctx, x+2, y+2, tile-4, tile-4, r);
    const grad = ctx.createLinearGradient(x,y,x+tile,y+tile);
    grad.addColorStop(0, t.eaten?'#0c1430':'#15204a');
    grad.addColorStop(1, t.eaten?'#0a1126':'#0e1737');
    ctx.fillStyle = grad; ctx.fill();
    ctx.strokeStyle = t.eaten?'rgba(255,255,255,.06)':'rgba(255,255,255,.12)';
    ctx.lineWidth=1.2; ctx.stroke();

    if(!t.eaten){
      // no mid-word break, auto-shrink to <= 4 lines
      const maxW = tile * 0.84;
      const baseFs = Math.floor(tile * 0.30);
      const layout = layoutLabelNoBreak(ctx, t.label, maxW, 4, baseFs);

      ctx.save();
      ctx.fillStyle='rgba(230,240,255,.96)';
      ctx.font = layout.font;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      const totalH = layout.lines.length * layout.lineHeight;
      let ly = y + tile/2 - totalH/2 + layout.lineHeight/2;
      for(const line of layout.lines){ ctx.fillText(line, x+tile/2, ly); ly += layout.lineHeight; }
      ctx.restore();
    } else if (t.correct){
      ctx.save(); ctx.globalAlpha=0.2; ctx.fillStyle='#9cff6d';
      ctx.beginPath(); ctx.arc(x+tile/2, y+tile/2, tile*0.18, 0, Math.PI*2); ctx.fill(); ctx.restore();
    }
  }

  // power-up
  if(star && star.active){
    const x=padX+star.gx*tile+tile/2, y=padY+star.gy*tile+tile/2;
    drawStar(ctx,x,y,5,tile*0.22,tile*0.09,'#ffd166');
  }

  // player
  if(state.player){
    const px=padX+state.player.x*tile+tile/2;
    const py=padY+state.player.y*tile+tile/2;
    const inv = now()<state.invulnUntil;
    const panim = Character.computeAnim(state.player, DIR_VECT);
    Character.draw(ctx, px, py, tile*0.34, state.player.dir, inv, panim);
  }

  // enemies
  for(const e of state.enemies){
    const ex=padX+e.x*tile+tile/2;
    const ey=padY+e.y*tile+tile/2;
    const frozen = now()<state.freezeUntil;
    drawTroggle(ctx, ex, ey, tile*0.5, e.dir||0, e.color, frozen);
  }

  drawExplosions(ctx,padX,padY,tile);
  drawStarBursts(ctx,padX,padY,tile);
  drawSFX(ctx,padX,padY,tile);
  drawCategoryFly(ctx,rect);

  const barGeom = drawLevelBar(ctx,rect,Math.max(90, rect.width*0.08));
  drawAnswerList(ctx, rect, barGeom);
}

// small star helper
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
      const n=4;
      for(let i=0;i<n;i++){
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

// category fly-in
function launchCategoryFly(){ catFly = { text: state.category.name, start: now(), delay: 1000, dur: 900 }; }
function getBadgeCenterInCanvas(){
  const br = catBadge.getBoundingClientRect();
  const cr = canvas.getBoundingClientRect();
  return { x:br.left-cr.left+br.width/2, y:br.top-cr.top+br.height/2 };
}
function drawCategoryFly(ctx,rect){
  if(!catFly) return;
  const elapsed = now()-catFly.start;
  const from = { x:rect.width/2, y:rect.height*0.42 };
  const to = getBadgeCenterInCanvas();

  if (elapsed < catFly.delay){
    ctx.save(); ctx.globalAlpha=0.95; ctx.fillStyle='#e8f4ff';
    ctx.font='700 36px system-ui, -apple-system, Segoe UI';
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

// progress bar — returns its geometry so we can draw the recent list beside it
function drawLevelBar(ctx,rect,barArea){
  const barW = Math.max(20, Math.floor(barArea*0.5));
  const margin = 16;
  const x = rect.width - barArea + (barArea-barW)/2;
  const y = margin;
  const h = rect.height - margin*2;

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

  return { x, y, w:barW, h, barArea, margin };
}

// NEW: draw recent answers list between the grid and the progress bar
function drawAnswerList(ctx, rect, barGeom){
  const { x:barX, y, w:barW, h, barArea, margin } = barGeom;
  const pad = 10;
  const listX = rect.width - barArea + pad;
  const listW = (barX - pad) - listX - 8; // space left of the vertical bar
  if (listW < 80) return; // too narrow, skip

  // panel background
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = '#0b1433';
  ctx.strokeStyle = '#23306a';
  ctx.lineWidth = 1;
  roundRect(ctx, listX, y, listW, h, 10);
  ctx.fill(); ctx.stroke();
  ctx.restore();

  // heading "Recent" at top
  ctx.save();
  ctx.fillStyle = '#cfe2ff';
  ctx.font = '600 12px system-ui, -apple-system, Segoe UI';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText('Recent', listX + 10, y + 8);
  ctx.restore();

  // draw entries (newest first)
  const innerX = listX + 10;
  let cursorY = y + 8 + 18;

  // helper ellipsis
  function ellipsize(text){
    ctx.font = '12px system-ui, -apple-system, Segoe UI';
    let s = String(text);
    const maxW = listW - 20;
    if (ctx.measureText(s).width <= maxW) return s;
    while (s.length > 1 && ctx.measureText(s + '…').width > maxW){
      s = s.slice(0, -1);
    }
    return s + '…';
  }

  // show up to MAX_LOG items (already capped), newest first
  const entries = [...answerLog].slice().reverse();
  for (const entry of entries){
    if (cursorY > y + h - 16) break; // no vertical space left
    if (entry.type === 'heading'){
      // section heading for category change
      ctx.save();
      ctx.fillStyle = '#8ea0d0';
      ctx.font = '600 12px system-ui, -apple-system, Segoe UI';
      ctx.textBaseline = 'top'; ctx.textAlign = 'left';
      const text = ellipsize(entry.text);
      ctx.fillText(text, innerX, cursorY);
      // separator
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = 'rgba(255,255,255,.10)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(innerX, cursorY + 16); ctx.lineTo(innerX + listW - 20, cursorY + 16); ctx.stroke();
      ctx.restore();
      cursorY += 20;
    } else {
      // answer line with colored dot
      const color = entry.correct ? '#9cff6d' : '#ff6d8a';
      ctx.save();
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(innerX + 6, cursorY + 8, 5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#e8f0ff';
      ctx.font = '12px system-ui, -apple-system, Segoe UI';
      ctx.textBaseline = 'top'; ctx.textAlign = 'left';
      ctx.fillText(ellipsize(entry.text), innerX + 18, cursorY);
      ctx.restore();
      cursorY += 18;
    }
  }
}

// ---------- AI (enemies) ----------
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
        const dist = Math.abs(nx-state.player.gx)+Math.abs(ny-state.player.gy);
        if(dist<bestDist){ bestDist=dist; bestDir=d; }
      }
      if(Math.random()<0.35) bestDir = choice([0,1,2,3]);
      const [dx,dy]=DIR_VECT[bestDir]; const nx=e.gx+dx, ny=e.gy+dy;
      if(passable(nx,ny)){
        e.gx=nx; e.gy=ny; e.x=nx; e.y=ny; e.dir=bestDir;
        // Seed a tile if the troggle lands on an empty cell
        const landed = getTileAt(nx,ny);
        if (landed && landed.eaten) seedTileAt(nx,ny);
      }
    }
  }
}

function checkCollisions(){
  for(const e of state.enemies){
    if(e.gx===state.player.gx && e.gy===state.player.gy){ loseLife(); }
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
function populateCategories(){
  if(!categorySelect) return;
  if(!CATEGORIES.length){ categorySelect.innerHTML=''; categorySelect.disabled=true; return; }
  categorySelect.innerHTML = CATEGORIES.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
  if(CATEGORIES.length){
    categorySelect.value = (state.category && state.category.id) || CATEGORIES[0].id;
  }
  categorySelect.disabled = !(state.mode==='single-category');
}

function applyMenuSettings(){
  // Fixed grid 5×5 (no UI)
  state.gridW = 5; state.gridH = 5;

  state.mode = canonicalMode(modeSelect?.value || 'single-category');

  if(state.mode==='single-category'){
    const cat = CATEGORIES.find(c=>c.id===categorySelect.value) || CATEGORIES[0];
    state.category = cat;
  }else{
    if(state.mode==='math-only') state.category = pickRandomMathCategory(null);
    else if(state.mode==='words-only') state.category = pickRandomWordCategory(null);
    else if(state.mode==='anything-goes') state.category = pickRandomAnyCategory(null);
  }

  // reset recent log and add heading
  answerLog = [];
  lastHeadingCategoryId = null;
  if (state.category){
    logHeading(state.category.name);
    lastHeadingCategoryId = state.category.id;
  }

  state.math.base = 6;
  state.math.progress = 0;
  state.math.needed = computeMathNeeded(1, state.math.base);

  resizeCanvas(); buildBoard(); spawnPlayer(); spawnEnemies(); resetEnemyTimers();
  updateHUD(); updateProgressBar();

  if (categorySelect) categorySelect.disabled = !(state.mode==='single-category');
}

// Buttons / events
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

const shuffleBtn = document.getElementById('shuffleBtn');
if (shuffleBtn){
  shuffleBtn.addEventListener('click', ()=>{
    if(state.mode==='single-category'){
      const r = choice(CATEGORIES); categorySelect.value=r.id;
    }
  });
}

modeSelect.addEventListener('change', ()=>{
  state.mode = canonicalMode(modeSelect.value);
  categorySelect.disabled = !(state.mode==='single-category');
  if(state.mode==='single-category') populateCategories();
  updateProgressBar();
});

// ---------- init ----------
(async function init(){
  await loadCategories();
  state.category = CATEGORIES[0] || null;

  // Fixed grid 5×5
  state.gridW=5; state.gridH=5;

  // Map legacy mode values if any
  state.mode = canonicalMode(modeSelect?.value || 'single-category');

  populateCategories();
  resizeCanvas();
  updateHUD();
  requestAnimationFrame(loop);
})();
