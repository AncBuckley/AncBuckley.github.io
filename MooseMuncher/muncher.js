// muncher.js — main game module (multi-file build)
// Imports
import { applyPreferences } from './prefs.js';
import MooseMan from './MooseMan.js';
import { stepEnemies, resetEnemyTimers, spawnTroggles, drawTroggle } from './enemies.js';

// ---------- DOM ----------
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// HUD
const catBadge = document.getElementById('categoryBadge'); // expects <div id="categoryBadge"><strong>…</strong></div>
const levelEl  = document.getElementById('level');
const scoreEl  = document.getElementById('score');
const livesEl  = document.getElementById('lives');
const toastEl  = document.getElementById('toast');

// Menu overlays & buttons
const menuEl     = document.getElementById('menu');
const helpEl     = document.getElementById('help');
const gameoverEl = document.getElementById('gameover');

const startBtn   = document.getElementById('startBtn');
const againBtn   = document.getElementById('againBtn');
const menuBtn    = document.getElementById('menuBtn');
const helpBtn    = document.getElementById('helpBtn');
const closeHelp  = document.getElementById('closeHelp');

// Controls on HUD/menu
const modeSelect = document.getElementById('modeSelect');      // values: single | words | math | any  (Anything Goes default)
const catSelect  = document.getElementById('categorySelect');  // filled from categories.json
const pauseBtn   = document.getElementById('pauseBtn');
const shuffleBtn = document.getElementById('shuffleBtn');

// ---------- Utils ----------
const now = ()=> performance.now();
const clamp = (v,a,b)=> Math.min(b, Math.max(a,v));
const choice = arr => arr[Math.floor(Math.random()*arr.length)];
const randi = (a,b)=> (Math.random()*(b-a)+a)|0;
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
function shuffle(arr){ for(let i=arr.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; }

function roundRect(ctx, x,y,w,h,r){
  const rr = Math.min(r, w/2, h/2);
  ctx.moveTo(x+rr,y); ctx.arcTo(x+w,y,x+w,y+h,rr);
  ctx.arcTo(x+w,y+h,x,y+h,rr); ctx.arcTo(x,y+h,x,y,rr); ctx.arcTo(x,y,x+w,y,rr);
}

function showToast(text, ms=1300){
  if(!toastEl) return;
  toastEl.textContent = text;
  toastEl.classList.remove('hide');
  const t0 = now();
  const id = setInterval(()=>{
    if(now()-t0 > ms){ clearInterval(id); toastEl.classList.add('hide'); }
  }, 60);
}

// ---------- Directions ----------
const DIRS = { UP:0, RIGHT:1, DOWN:2, LEFT:3 };
const DIR_VECT = [ [0,-1],[1,0],[0,1],[-1,0] ];

// ---------- Categories (from categories.json) ----------
let CATEGORIES = [];   // mixed list (numbers + words)
let WORD_CATS = [];
let MATH_CATS = [];
let CROSS_HINTS = {};

async function loadCategories(){
  const res = await fetch('./categories.json', {cache:'no-store'});
  const data = await res.json();

  // Build word maps with cross hints
  const wordSets = structuredClone(data.wordSets || {});
  CROSS_HINTS = data.crossHints || {};

  // Inject cross-hints (e.g., silver -> colors + metals + elements)
  for(const [word, sets] of Object.entries(CROSS_HINTS)){
    for(const setKey of sets){
      if(!wordSets[setKey]) wordSets[setKey] = [];
      if(!wordSets[setKey].includes(word)) wordSets[setKey].push(word);
    }
  }

  // Word categories
  WORD_CATS = (data.words || []).map(wc => {
    const set = wordSets[wc.set] || [];
    const labCase = wc.case || 'lower';
    const normalize = s => labCase==='title'
      ? s.replace(/\b\w/g, c=>c.toUpperCase())
      : (labCase==='upper' ? s.toUpperCase() : s.toLowerCase());
    return {
      id: wc.id,
      name: wc.name,
      type: 'word',
      case: labCase,
      generate(W,H, wantCorrect = Math.floor(W*H*0.4)){
        const total = W*H;
        const correctPool = [...set];
        const otherPools = Object.keys(wordSets)
          .filter(k => k !== wc.set)
          .flatMap(k => wordSets[k]);

        const chosenCorrect = shuffle(correctPool).slice(0, Math.min(wantCorrect, correctPool.length));
        const distractNeed  = Math.max(0, total - chosenCorrect.length);
        const chosenDistract= shuffle(otherPools.filter(x => !chosenCorrect.includes(x))).slice(0, distractNeed);

        const items = shuffle([
          ...chosenCorrect.map(label => ({ label: normalize(label), value: label, correct: true })),
          ...chosenDistract.map(label => ({ label: normalize(label), value: label, correct: false }))
        ]);
        return items;
      }
    };
  });

  // Number categories
  const isPrime = n => {
    if (n<2) return false; if (n%2===0) return n===2; const r=Math.sqrt(n)|0;
    for(let i=3;i<=r;i+=2){ if(n%i===0) return false } return true;
  };
  MATH_CATS = (data.numbers || []).map(nc => {
    let pred;
    if(nc.kind === 'even') pred = n => n%2===0;
    else if(nc.kind === 'odd') pred = n => n%2!==0;
    else if(nc.kind === 'prime') pred = n => isPrime(n);
    else if(nc.kind === 'multipleOf') pred = n => n % (nc.k||2) === 0;
    else if(nc.kind === 'square') pred = n => Number.isInteger(Math.sqrt(n));
    else pred = _ => false;

    const min = nc.min ?? 1;
    const max = nc.max ?? 199;
    return {
      id: nc.id,
      name: nc.name,
      type: 'number',
      generate(W,H){
        const total = W*H;
        const pool = Array.from({length:max-min+1}, (_,i)=> i+min);
        const pick = shuffle(pool).slice(0,total);
        return pick.map(n => ({ label: String(n), value: n, correct: !!pred(n) }));
      }
    };
  });

  CATEGORIES = [...MATH_CATS, ...WORD_CATS];

  // Populate dropdown (for Single Category mode only)
  if(catSelect){
    catSelect.innerHTML = WORD_CATS.concat(MATH_CATS)
      .map(c => `<option value="${c.id}">${c.name}</option>`)
      .join('');
  }
}

// ---------- Game State ----------
const state = {
  running: false,
  paused: false,

  gridW: 5,
  gridH: 5,
  tile: 64,

  level: 1,
  score: 0,
  lives: 3,

  mode: 'any',             // 'single' | 'words' | 'math' | 'any'  (Anything Goes default)
  category: null,

  items: [],               // tiles
  correctRemaining: 0,

  player: null,
  enemies: [],

  freezeUntil: 0,
  invulnUntil: 0,

  // level progress bar config
  math: { base: 6, needed: 6, progress: 0 },

  // Troggle catch animation state
  catchAnim: null,

  // Recent answers list (we render last 10)
  recent: []
};

const RECENT_RENDER_MAX = 10;

// ---------- Recent answers helpers ----------
function pushRecentHeading(text){
  state.recent.push({ type:'heading', text:String(text), ts: now() });
  trimRecent();
}
function pushRecentAnswer(text, correct){
  state.recent.push({ type:'answer', text:String(text), correct: !!correct, ts: now() });
  trimRecent();
}
function trimRecent(){
  // keep up to ~30 entries to reduce churn; we display last 10
  const MAX_KEEP = 30;
  if(state.recent.length > MAX_KEEP){
    state.recent.splice(0, state.recent.length - MAX_KEEP);
  }
}

// ---------- Canvas & Resize ----------
function resizeCanvas(){
  const dpr = devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);

  // Fixed 5×5 grid — compute tile from available area
  const barW = needsBar() ? Math.max(90, rect.width*0.08) : 0;
  state.tile = Math.floor(Math.min((rect.width - barW)/state.gridW, rect.height/state.gridH));
}
addEventListener('resize', resizeCanvas);

// ---------- UI helpers ----------
function needsBar(){ return true; } // keep bar in all modes per your earlier change

function updateHUD(){
  if(levelEl) levelEl.textContent = String(state.level);
  if(scoreEl) scoreEl.textContent = String(state.score);
  if(livesEl) livesEl.textContent = String(state.lives);
  const strong = catBadge?.querySelector('strong');
  if(strong) strong.textContent = state.category ? state.category.name : '—';
}

function readModeFromSelect(){
  if(!modeSelect) return state.mode;
  const v = modeSelect.value;
  if(v==='single') return 'single';
  if(v==='words')  return 'words';
  if(v==='math')   return 'math';
  return 'any';
}

function syncCategorySelectDisabled(){
  if(!catSelect) return;
  const single = state.mode === 'single';
  catSelect.disabled = !single;
  catSelect.parentElement?.classList.toggle('hide', !single);
}

function pickRandom(arr, excludeId){
  const pool = excludeId ? arr.filter(c => c.id !== excludeId) : arr;
  return pool.length ? choice(pool) : null;
}

function pickRandomAnyCategory(prevId){ return pickRandom(CATEGORIES, prevId); }
function pickRandomWordCategory(prevId){ return pickRandom(WORD_CATS, prevId); }
function pickRandomMathCategory(prevId){ return pickRandom(MATH_CATS, prevId); }

// Every 5th level, increase the per-level requirement by larger increments: +2 at 5, +4 at 10, +6 at 15, …
function computeMathNeeded(level, base){
  const block = Math.floor(level/5);        // 0,1,2,3…
  const extra = block * (block + 1);        // 0,2,6,12,…  (2,4,6 added cumulatively)
  return Math.max(1, Math.floor(base * Math.pow(2, level-1) + extra));
}

// ---------- Word-wrap helpers (no mid-word breaking with auto font scaling) ----------
const TILE_FONT_FAMILY = "ui-sans-serif, system-ui, -apple-system, Segoe UI";
function measureLongestWordPx(text, ctx){
  let m = 0;
  const words = String(text).split(/\s+/).filter(Boolean);
  for(const w of words){ m = Math.max(m, ctx.measureText(w).width); }
  return m;
}
function fitFontPxForWidth(text, ctx, basePx, minPx, maxWidth){
  let px = basePx;
  ctx.font = `${px}px ${TILE_FONT_FAMILY}`;
  while(px > minPx && measureLongestWordPx(text, ctx) > maxWidth){
    px -= 1;
    ctx.font = `${px}px ${TILE_FONT_FAMILY}`;
  }
  return px;
}
function wrapNoBreak(text, ctx, maxWidth, maxLines){
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for(const w of words){
    const test = line ? (line + ' ' + w) : w;
    if(ctx.measureText(test).width <= maxWidth){
      line = test;
    }else{
      if(line){ lines.push(line); line = w; }
      else { // single very long word (should be avoided by fitFont, fallback just push)
        lines.push(w);
        line = '';
      }
      if(lines.length >= maxLines){
        // add ellipsis to last line
        let last = lines[lines.length-1];
        while(last.length && ctx.measureText(last + '…').width > maxWidth){
          last = last.slice(0, -1);
        }
        lines[lines.length-1] = last + '…';
        return lines;
      }
    }
  }
  if(line){
    if(lines.length < maxLines) lines.push(line);
    else{
      // overflow: ellipsize last line
      let last = lines[lines.length-1];
      while(last.length && ctx.measureText(last + '…').width > maxWidth){
        last = last.slice(0, -1);
      }
      lines[lines.length-1] = last + '…';
    }
  }
  return lines;
}
function layoutTextBlock({text, ctx, maxWidth, maxLines, basePx, minPx, lineHeightFactor=1.05}){
  // choose a font size so the longest word fits
  const fontPx = fitFontPxForWidth(text, ctx, basePx, minPx, maxWidth);
  ctx.font = `${fontPx}px ${TILE_FONT_FAMILY}`;
  const lineHeight = Math.max(12, Math.floor(fontPx * lineHeightFactor));
  const lines = wrapNoBreak(text, ctx, maxWidth, maxLines);
  return { fontPx, lineHeight, lines };
}

// ---------- Board & Entities ----------
function buildBoard(){
  const W = state.gridW, H = state.gridH;
  const wantCorrect = Math.min(W*H, Math.max(8, state.math.needed||8));
  const items = state.category.generate(W,H, wantCorrect).slice(0, W*H);

  state.items = items.map((it, idx)=>({
    ...it,
    eaten:false,
    gx: idx % W,
    gy: (idx / W) | 0
  }));
  state.correctRemaining = state.items.filter(t=>t.correct).length;
}

function spawnPlayer(){
  state.player = { gx:0, gy:0, x:0, y:0, dir:DIRS.RIGHT, moving:null };
}

// ---------- Game Flow ----------
function applyMenuSettings(){
  state.gridW = 5; state.gridH = 5;

  state.mode = readModeFromSelect();
  syncCategorySelectDisabled();

  if (state.mode === 'single'){
    const selected = CATEGORIES.find(c => c.id === catSelect?.value) || CATEGORIES[0];
    state.category = selected || null;
  } else if (state.mode === 'words'){
    state.category = pickRandomWordCategory();
  } else if (state.mode === 'math'){
    state.category = pickRandomMathCategory();
  } else { // any
    state.category = pickRandomAnyCategory();
  }

  // Reset stats & bar
  state.level = 1; state.score = 0; state.lives = 3;
  state.freezeUntil = 0; state.invulnUntil = 0;

  state.math.base = 6;
  state.math.progress = 0;
  state.math.needed = computeMathNeeded(1, state.math.base);

  // Reset and add heading for the starting category
  state.recent.length = 0;
  if (state.category) pushRecentHeading(state.category.name);

  buildBoard();
  spawnPlayer();
  state.enemies.length = 0;
  spawnTroggles(state);
  resetEnemyTimers(state);
  updateHUD();
}

function startGame(){
  // Hide overlays
  menuEl?.classList.add('hide');
  gameoverEl?.classList.add('hide');

  applyMenuSettings();
  state.running = true;
  state.paused = false;
  state.invulnUntil = now() + 1200;
}

function nextLevel(){
  const prev = state.category ? state.category.id : null;
  if (state.mode === 'single'){
    const sel = CATEGORIES.find(c => c.id === catSelect?.value) || state.category;
    state.category = sel || state.category;
  } else if (state.mode === 'words'){
    state.category = pickRandomWordCategory(prev);
  } else if (state.mode === 'math'){
    state.category = pickRandomMathCategory(prev);
  } else {
    state.category = pickRandomAnyCategory(prev);
  }

  state.level += 1;
  state.math.needed = computeMathNeeded(state.level, state.math.base);
  state.math.progress = 0;

  // New category heading for the recent list
  if (state.category) pushRecentHeading(state.category.name);

  buildBoard();
  spawnPlayer();
  state.enemies.length = 0;
  spawnTroggles(state);
  resetEnemyTimers(state);
  state.invulnUntil = now() + 1000;
  updateHUD();
}

function levelCleared(){
  state.score += 500;
  nextLevel();
}

function loseLife(){
  if (now() < state.invulnUntil) return;
  state.lives -= 1;
  state.invulnUntil = now() + 1500;
  showToast('Ouch!');
  if(state.lives <= 0){ gameOver(); return; }

  // Respawn player at (0,0)
  if(state.player){
    state.player.gx=0; state.player.gy=0;
    state.player.x=0;  state.player.y=0;
    state.player.dir = DIRS.RIGHT;
    state.player.moving = null;
  }
  updateHUD();
}

function gameOver(){
  state.running = false;
  state.paused  = false;

  // show overlay with final score
  const finalStats = document.getElementById('finalStats');
  if(finalStats) finalStats.textContent = `You scored ${state.score}.`;
  gameoverEl?.classList.remove('hide');
}

// ---------- Input ----------
document.addEventListener('keydown', e=>{
  const k = e.key.toLowerCase();
  if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(k)){
    e.preventDefault();
    if(e.repeat) return;
    handlePlayerStep(k);
    return;
  }
  if(k===' ' || k==='enter'){ tryEat(); }
  if(k==='p'){ togglePause(); }
  if(k==='escape'){
    if(!helpEl?.classList.contains('hide')) helpEl?.classList.add('hide');
    else togglePause();
  }
});

function handlePlayerStep(k){
  if(!state.running || state.paused || !state.player) return;
  if(state.player.moving) return;
  let dir = null;
  if(k==='arrowup'||k==='w') dir = DIRS.UP;
  else if(k==='arrowright'||k==='d') dir = DIRS.RIGHT;
  else if(k==='arrowdown'||k==='s') dir = DIRS.DOWN;
  else if(k==='arrowleft'||k==='a') dir = DIRS.LEFT;
  if(dir==null) return;

  const [dx,dy] = DIR_VECT[dir];
  const nx = state.player.gx + dx;
  const ny = state.player.gy + dy;
  if(inBounds(nx,ny)){
    const fromX = state.player.x, fromY = state.player.y;
    state.player.gx = nx; state.player.gy = ny;
    state.player.dir = dir;
    state.player.moving = { fromX, fromY, toX:nx, toY:ny, start: now(), dur: 200 };
  }
}

function togglePause(){
  if(!state.running) return;
  state.paused = !state.paused;
  pauseBtn && (pauseBtn.textContent = state.paused ? '▶️ Resume' : '⏸️ Pause');
}

// ---------- Eating ----------
function getTileAt(gx,gy){ return state.items.find(t => t.gx===gx && t.gy===gy); }
function inBounds(gx,gy){ return gx>=0 && gy>=0 && gx<state.gridW && gy<state.gridH; }

function tryEat(){
  if(!state.running || state.paused) return;
  const tile = getTileAt(state.player.gx, state.player.gy);
  if(!tile || tile.eaten) return;

  tile.eaten = true;

  if(tile.correct){
    state.score += 100;
    state.math.progress = Math.min(state.math.needed, (state.math.progress||0) + 1);
    state.correctRemaining = Math.max(0, state.correctRemaining - 1);
    showToast('Yum! +100');

    // Record recent (correct)
    pushRecentAnswer(tile.label, true);

    if(state.math.progress >= state.math.needed || state.correctRemaining<=0){
      setTimeout(levelCleared, 350);
    }
  } else {
    state.score = Math.max(0, state.score - 50);
    showToast('Wrong! −50');
    // In bar modes, drain a bit
    state.math.progress = Math.max(0, (state.math.progress||0) - 1);

    // Record recent (wrong)
    pushRecentAnswer(tile.label, false);
  }

  updateHUD();
}

// ---------- Collisions & Catch Animation ----------
function checkCollisions(){
  if(state.catchAnim) return; // don't retrigger mid-animation
  for(let i=0;i<state.enemies.length;i++){
    const e = state.enemies[i];
    if(e.gx === state.player.gx && e.gy === state.player.gy){
      startCatchAnimation(i);
      return;
    }
  }
}

function startCatchAnimation(enemyIndex){
  const e = state.enemies[enemyIndex];
  state.catchAnim = {
    active: true,
    enemyIndex,
    start: now(),
    duration: 900,
    gx: e.gx, gy: e.gy
  };
}

function finalizeCatchAnimation(){
  const ca = state.catchAnim;
  if(!ca) return;

  // Move troggle to bottom-right corner
  const e = state.enemies[ca.enemyIndex];
  if(e){
    e.gx = state.gridW - 1;
    e.gy = state.gridH - 1;
    e.x = e.gx; e.y = e.gy;
    e.dir = DIRS.LEFT;
  }

  // Apply life loss (respawn player at 0,0)
  loseLife();

  // Keep enemy cadence clean post-teleport
  resetEnemyTimers(state);

  // Clear flag
  state.catchAnim = null;
}

// ---------- Draw helpers ----------
function drawLevelBar(ctx, rect, barArea){
  const barW = Math.max(22, Math.floor(barArea*0.5));
  const x = rect.width - barArea + (barArea - barW)/2;
  const y = 16;
  const h = rect.height - 32;

  ctx.save();
  // panel
  ctx.fillStyle = '#0a1437'; ctx.strokeStyle = '#20306b'; ctx.lineWidth = 1;
  ctx.beginPath(); roundRect(ctx, x, y, barW, h, 10); ctx.fill(); ctx.stroke();

  // fill
  const p = clamp(state.math.progress / (state.math.needed || 1), 0, 1);
  const fillH = Math.floor((h-6) * p);
  const grd = ctx.createLinearGradient(0,y+h-3-fillH, 0, y+h-3);
  grd.addColorStop?.(0, '#46d4ff'); grd.addColorStop?.(1, '#9cff6d');
  ctx.fillStyle = grd;
  ctx.fillRect(x+3, y+h-3-fillH, barW-6, fillH);
  ctx.restore();
}

// Render the recent answers panel between grid and the right level bar
function drawRecentList(ctx, rect, padX, tile, barArea){
  const gridLeft  = padX;
  const gridRight = padX + state.gridW*tile;
  const left = Math.floor(gridRight + 8);
  const right = Math.floor(rect.width - barArea - 8);
  const width = right - left;

  if(width < 90) return; // not enough space to render the panel

  // Panel
  const top = 16;
  const height = Math.floor(rect.height - 32);
  ctx.save();
  ctx.fillStyle = 'rgba(12,20,43,0.85)';
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath(); roundRect(ctx, left, top, width, height, 10); ctx.fill(); ctx.stroke();

  // Title
  ctx.fillStyle = '#cfe2ff';
  // Scale the "Recent" title a touch based on panel width
  const titlePx = Math.max(12, Math.floor(width*0.12));
  ctx.font = `700 ${titlePx}px ${TILE_FONT_FAMILY}`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText('Recent', left + 10, top + 8);

  // Entries
  const innerX = left + 10;
  const innerY = top + 8 + titlePx + 6;
  const innerW = width - 20;

  const entries = state.recent.slice(-RECENT_RENDER_MAX);
  let y = innerY;

  for(const ent of entries){
    if (ent.type === 'heading'){
      // headings slightly bigger; shrink to keep words intact
      ctx.fillStyle = '#9bb6ff';
      const basePx = 13;
      const { fontPx, lineHeight, lines } = layoutTextBlock({
        text: ent.text, ctx, maxWidth: innerW, maxLines: 2, basePx, minPx: 10, lineHeightFactor: 1.05
      });
      ctx.font = `600 ${fontPx}px ${TILE_FONT_FAMILY}`;
      for(const ln of lines){
        ctx.fillText(ln, innerX, y); y += lineHeight;
      }
      // divider
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(innerX, y+2); ctx.lineTo(innerX + innerW, y+2); ctx.stroke();
      y += 6;
    } else if (ent.type === 'answer'){
      ctx.fillStyle = ent.correct ? '#75ff9b' : '#ff6d8a';
      const basePx = 13;
      const { fontPx, lineHeight, lines } = layoutTextBlock({
        text: ent.text, ctx, maxWidth: innerW, maxLines: 2, basePx, minPx: 10, lineHeightFactor: 1.05
      });
      ctx.font = `500 ${fontPx}px ${TILE_FONT_FAMILY}`;
      for(const ln of lines){
        ctx.fillText(ln, innerX, y); y += lineHeight;
      }
      y += 2;
    }
    if (y > top + height - 10) break; // clipped
  }

  ctx.restore();
}

function drawCatchAnimation(padX, padY, tile){
  const ca = state.catchAnim; if(!ca) return;
  const t = clamp((now() - ca.start) / ca.duration, 0, 1);
  const cx = padX + ca.gx * tile + tile/2;
  const cy = padY + ca.gy * tile + tile/2;

  // Pulse rings
  const rings = 2;
  for(let i=0;i<rings;i++){
    const p = clamp(t*1.15 - i*0.22, 0, 1);
    const r = tile * (0.25 + 0.55 * easeOutCubic(p));
    const a = 0.55 * (1 - p);
    if(a<=0) continue;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.strokeStyle = '#ff6d8a'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  }

  // Player shrink/fade
  if(state.player){
    const k = 1 - 0.85 * t;
    const alpha = 1 - t * 0.8;
    const px = padX + state.player.x * tile + tile/2;
    const py = padY + state.player.y * tile + tile/2;
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.translate(px, py);
    ctx.scale(k, k);
    const anim = MooseMan.computeAnim(state.player, DIR_VECT);
    MooseMan.draw(ctx, 0, 0, tile*0.34, state.player.dir, false, anim);
    ctx.restore();
  }
}

// ---------- Draw ----------
function draw(){
  const rect = canvas.getBoundingClientRect();
  const barArea = needsBar() ? Math.max(90, rect.width*0.08) : 0;
  const tile = Math.min((rect.width - barArea)/state.gridW, rect.height/state.gridH);
  const padX = Math.floor((rect.width - barArea - state.gridW*tile)/2);
  const padY = Math.floor((rect.height - state.gridH*tile)/2);

  ctx.clearRect(0,0,canvas.width, canvas.height);

  // Update player tween
  if(state.player?.moving){
    const m = state.player.moving;
    const t = (now()-m.start)/m.dur;
    if(t>=1){
      state.player.x = m.toX; state.player.y = m.toY; state.player.moving = null;
    } else {
      const s = easeOutCubic(clamp(t,0,1));
      state.player.x = m.fromX + (m.toX - m.fromX)*s;
      state.player.y = m.fromY + (m.toY - m.fromY)*s;
    }
  }

  // Tiles
  for(const t of state.items){
    const x = padX + t.gx*tile;
    const y = padY + t.gy*tile;
    ctx.beginPath();
    roundRect(ctx, x+2, y+2, tile-4, tile-4, 12);
    const grad = ctx.createLinearGradient(x,y, x+tile, y+tile);
    grad.addColorStop(0, t.eaten ? '#0c1430' : '#15204a');
    grad.addColorStop(1, t.eaten ? '#0a1126' : '#0e1737');
    ctx.fillStyle = grad; ctx.fill();
    ctx.strokeStyle = t.eaten ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.12)';
    ctx.lineWidth = 1.2; ctx.stroke();

    if(!t.eaten){
      // label with adaptive font (no mid-word breaks)
      ctx.save();
      ctx.fillStyle = 'rgba(230,240,255,.95)';
      const maxWidth = tile*0.84;
      const basePx = Math.floor(tile*0.23);
      const minPx  = Math.max(10, Math.floor(tile*0.12));
      const { fontPx, lineHeight, lines } = layoutTextBlock({
        text: t.label, ctx, maxWidth, maxLines: 3, basePx, minPx, lineHeightFactor: 1.05
      });
      ctx.font = `${fontPx}px ${TILE_FONT_FAMILY}`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const totalH = lines.length * lineHeight;
      let ly = y + tile/2 - totalH/2 + lineHeight/2;
      for(const line of lines){ ctx.fillText(line, x+tile/2, ly); ly += lineHeight; }
      ctx.restore();
    } else if (t.correct){
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = '#9cff6d';
      ctx.beginPath(); ctx.arc(x+tile/2, y+tile/2, tile*0.18, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
  }

  // Player (skip normal draw during catch animation)
  if(state.player && !state.catchAnim){
    const px = padX + state.player.x*tile + tile/2;
    const py = padY + state.player.y*tile + tile/2;
    const inv = now() < state.invulnUntil;
    const panim = MooseMan.computeAnim(state.player, DIR_VECT);
    MooseMan.draw(ctx, px, py, tile*0.34, state.player.dir, inv, panim);
  }

  // Enemies
  for(const e of state.enemies){
    const ex = padX + e.x*tile + tile/2;
    const ey = padY + e.y*tile + tile/2;
    const frozen = now() < state.freezeUntil;
    drawTroggle(ctx, ex, ey, tile*0.34, e.dir, e.color, frozen);
  }

  // Catch overlay
  if(state.catchAnim){
    drawCatchAnimation(padX, padY, tile);
  }

  // Recent answers panel (between grid and bar)
  if(needsBar()){
    drawRecentList(ctx, rect, padX, tile, barArea);
  }

  // Level bar (right)
  if(needsBar()){
    drawLevelBar(ctx, rect, barArea);
  }
}

// ---------- Loop ----------
function tick(){
  if(state.running && !state.paused){
    // Move enemies (enemies.js skips movement while catch animation is active)
    stepEnemies(state);

    // Collision checks (no re-trigger during active animation)
    checkCollisions();

    // End catch animation if time elapsed
    if(state.catchAnim && (now() - state.catchAnim.start >= state.catchAnim.duration)){
      finalizeCatchAnimation();
    }

    // Draw
    draw();
  }
  requestAnimationFrame(tick);
}

// ---------- Wiring ----------
function bindUI(){
  // Start → hide menu and start game
  startBtn?.addEventListener('click', () => {
    menuEl?.classList.add('hide');
    gameoverEl?.classList.add('hide');
    startGame();
  });

  // Game Over → Play again
  againBtn?.addEventListener('click', () => {
    gameoverEl?.classList.add('hide');
    startGame();
  });

  // Game Over → Back to menu
  menuBtn?.addEventListener('click', () => {
    gameoverEl?.classList.add('hide');
    menuEl?.classList.remove('hide');
    state.running = false;
  });

  // Help open/close
  helpBtn?.addEventListener('click', () => helpEl?.classList.remove('hide'));
  closeHelp?.addEventListener('click', () => helpEl?.classList.add('hide'));

  // Pause
  pauseBtn?.addEventListener('click', togglePause);

  // Random category quick-pick
  shuffleBtn?.addEventListener('click', ()=>{
    if(!catSelect) return;
    const all = WORD_CATS.concat(MATH_CATS);
    const pick = choice(all);
    catSelect.value = pick?.id || catSelect.value;
  });

  // Mode changes affect category dropdown availability
  modeSelect?.addEventListener('change', ()=>{
    state.mode = readModeFromSelect();
    syncCategorySelectDisabled();
  });
}

async function boot(){
  applyPreferences?.(); // theme/fonts
  bindUI();
  await loadCategories();
  // Default mode is "any" (Anything Goes)
  if(modeSelect) modeSelect.value = 'any';
  state.mode = readModeFromSelect();
  syncCategorySelectDisabled();

  resizeCanvas();
  updateHUD();
  requestAnimationFrame(tick);
}
boot();

// Exports (if needed elsewhere)
export { state, DIRS, DIR_VECT, inBounds, getTileAt, startGame, nextLevel, tryEat };
