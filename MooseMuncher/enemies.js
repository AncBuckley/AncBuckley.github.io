// enemies.js — enemy creation, AI, updates, and drawing
// Exports:
//   createEnemies({gridW,gridH,level,stepMs})
//   updateEnemies(enemies, {gridW,gridH,player,stepMs,freezeUntil,passable,clampTo})
//   drawEnemies(ctx, enemies, {padX,padY,tile})
//   notifyBoardHooksForEnemies(hooks)  // { isCellEmpty(gx,gy), placeWordAt(gx,gy), onPlayerCaught(index) }
//   moveEnemyToBottomRight(enemies, index, gridW, gridH)

const now = () => performance.now();
const randi = (a,b)=> (Math.random()*(b-a)+a)|0;
const rand  = (a,b)=> Math.random()*(b-a)+a;
const choice = (arr)=> arr[(Math.random()*arr.length)|0];
const clamp = (v,a,b)=> Math.min(b, Math.max(a,v));
const DIRS = { UP:0, RIGHT:1, DOWN:2, LEFT:3 };
const DIR_VECT = [ [0,-1],[1,0],[0,1],[-1,0] ];

let boardHooks = {
  isCellEmpty: null,
  placeWordAt: null,
  onPlayerCaught: null
};

export function notifyBoardHooksForEnemies(hooks){
  boardHooks = { ...boardHooks, ...hooks };
}

export function createEnemies({gridW, gridH, level, stepMs}){
  const base = level<=3? 2 : level<=6? 3 : 4;
  const n = clamp(base + (level>8?1:0), 2, 6);

  const enemies = [];
  const occupied = new Set([`0,0`]);
  const baseTime = now();

  for(let i=0;i<n;i++){
    let gx = randi(0,gridW), gy = randi(0,gridH), tries=0;
    // keep away from the player spawn (0,0) and avoid duplicate spawns
    while(((Math.abs(gx-0)+Math.abs(gy-0)) < Math.floor((gridW+gridH)/4)) || occupied.has(`${gx},${gy}`)){
      gx = randi(0,gridW); gy = randi(0,gridH); if(++tries>60) break;
    }
    occupied.add(`${gx},${gy}`);

    // Assign AI/type: half slimes (chase), half owls (seek empties)
    const kind = Math.random()<0.5 ? 'slime' : 'owl';

    enemies.push({
      kind,                // 'slime' or 'owl'
      gx, gy, x: gx, y: gy,
      dir: randi(0,4),
      nextStepAt: baseTime + stepMs + i*150
    });
  }

  return enemies;
}

function manhattan(ax,ay,bx,by){ return Math.abs(ax-bx)+Math.abs(ay-by); }

function bestStepToward(gx,gy, tx,ty, gridW,gridH, passable){
  let best = {gx,gy, dir:null, score: Infinity};
  const opts = [
    {dir:DIRS.UP,    nx:gx,   ny:gy-1},
    {dir:DIRS.RIGHT, nx:gx+1, ny:gy  },
    {dir:DIRS.DOWN,  nx:gx,   ny:gy+1},
    {dir:DIRS.LEFT,  nx:gx-1, ny:gy  },
  ];
  for(const o of opts){
    if(o.nx<0||o.ny<0||o.nx>=gridW||o.ny>=gridH) continue;
    if(passable && !passable(o.nx,o.ny)) continue;
    const d = manhattan(o.nx,o.ny, tx,ty);
    if(d < best.score){ best = {gx:o.nx, gy:o.ny, dir:o.dir, score:d}; }
  }
  return best.dir==null ? {gx,gy,dir:null} : best;
}

function bestStepTowardEmpty(gx,gy, gridW,gridH, passable){
  // Prefer moving toward any empty/eaten cell (boardHooks.isCellEmpty) with BFS ring search (radius up to 3)
  const isEmpty = boardHooks.isCellEmpty || (()=>false);
  let target = null;
  for(let radius=1; radius<=3 && !target; radius++){
    for(let dy=-radius; dy<=radius; dy++){
      for(let dx=-radius; dx<=radius; dx++){
        const nx = gx+dx, ny = gy+dy;
        if(nx<0||ny<0||nx>=gridW||ny>=gridH) continue;
        if(isEmpty(nx,ny)){ target = {tx:nx,ty:ny}; break; }
      }
      if(target) break;
    }
  }
  if(!target){
    // fallback: random legal step
    const opts = [
      {dir:DIRS.UP,    nx:gx,   ny:gy-1},
      {dir:DIRS.RIGHT, nx:gx+1, ny:gy  },
      {dir:DIRS.DOWN,  nx:gx,   ny:gy+1},
      {dir:DIRS.LEFT,  nx:gx-1, ny:gy  },
    ].filter(o => !(o.nx<0||o.ny<0||o.nx>=gridW||o.ny>=gridH) && (!passable || passable(o.nx,o.ny)));
    return opts.length ? choice(opts) : {nx:gx,ny:gy,dir:null};
  }
  const res = bestStepToward(gx,gy, target.tx, target.ty, gridW,gridH, passable);
  return { nx: res.gx, ny: res.gy, dir: res.dir };
}

export function updateEnemies(enemies, {gridW,gridH,player,stepMs,freezeUntil,passable,clampTo}){
  const frozen = freezeUntil && now() < freezeUntil;

  for(let i=0;i<enemies.length;i++){
    const e = enemies[i];
    if(frozen) continue;
    if(now() < e.nextStepAt) continue;

    let nx=e.gx, ny=e.gy, ndir=e.dir;

    if(e.kind==='slime' && player){
      const best = bestStepToward(e.gx, e.gy, player.gx, player.gy, gridW,gridH, passable);
      nx = best.gx; ny = best.gy; ndir = best.dir ?? e.dir;
    } else if(e.kind==='owl'){
      const b = bestStepTowardEmpty(e.gx, e.gy, gridW,gridH, passable);
      nx = b.nx; ny = b.ny; ndir = b.dir ?? e.dir;
    } else {
      // fallback random step
      const opts = [
        {dir:DIRS.UP,    nx:e.gx,   ny:e.gy-1},
        {dir:DIRS.RIGHT, nx:e.gx+1, ny:e.gy  },
        {dir:DIRS.DOWN,  nx:e.gx,   ny:e.gy+1},
        {dir:DIRS.LEFT,  nx:e.gx-1, ny:e.gy  },
      ].filter(o => !(o.nx<0||o.ny<0||o.nx>=gridW||o.ny>=gridH) && (!passable || passable(o.nx,o.ny)));
      if(opts.length){ const o = choice(opts); nx=o.nx; ny=o.ny; ndir=o.dir; }
    }

    if(clampTo){
      const c = clampTo(nx,ny); nx = c.gx; ny = c.gy;
    }

    e.gx = nx; e.gy = ny; e.x = nx; e.y = ny; e.dir = ndir;
    e.nextStepAt = now() + stepMs;

    // Landing on an empty square: let the board place a new word
    if(boardHooks.isCellEmpty && boardHooks.isCellEmpty(nx,ny) && boardHooks.placeWordAt){
      boardHooks.placeWordAt(nx,ny);
    }

    // Player collision is handled by the main loop, but you can ping here if desired:
    // if(player && player.gx===nx && player.gy===ny && boardHooks.onPlayerCaught){ boardHooks.onPlayerCaught(i); }
  }
}

export function drawEnemies(ctx, enemies, {padX, padY, tile}){
  const frozen = false; // purely visual tint handled inside draw if needed; main "freeze" handled in update timing
  for(const e of enemies){
    const x = padX + e.x*tile + tile/2;
    const y = padY + e.y*tile + tile/2;
    if(e.kind==='slime') drawSlime(ctx, x, y, tile, frozen);
    else drawOwl(ctx, x, y, tile, frozen);
  }
}

export function moveEnemyToBottomRight(enemies, index, gridW, gridH){
  const e = enemies[index]; if(!e) return;
  e.gx = gridW-1; e.gy = gridH-1; e.x = e.gx; e.y = e.gy; e.dir = DIRS.LEFT;
  e.nextStepAt = now() + 400; // slight delay before it starts again
}

// ───────────────────────────────────────────────
// Drawing helpers

// Slimier, 25% smaller slime with downward drips (orientation invariant)
function drawSlime(ctx, cx, cy, tile, frozen){
  const scale = 0.75;                   // 25% smaller
  const size = tile * 0.34 * scale;
  const w = size * 1.5, h = size * 1.25;

  ctx.save();
  ctx.translate(cx, cy);

  // Body blob (no rotation; drips always straight down)
  const jiggle = Math.sin(performance.now()/220) * (h*0.04);
  ctx.beginPath();
  ctx.moveTo(-w*0.45,  -h*0.10 + jiggle);
  ctx.bezierCurveTo(-w*0.60, -h*0.55 + jiggle,  w*0.60, -h*0.55 + jiggle,  w*0.45, -h*0.10 + jiggle);
  ctx.bezierCurveTo( w*0.55,  h*0.35,           -w*0.55,  h*0.35,          -w*0.45, -h*0.10 + jiggle);

  const bodyGrad = ctx.createLinearGradient(-w, -h, w, h);
  bodyGrad.addColorStop(0, frozen ? '#aef7ff' : '#3ff1c8');
  bodyGrad.addColorStop(1, frozen ? '#7fe9ff' : '#1ec49e');
  ctx.fillStyle = bodyGrad;
  ctx.shadowColor = frozen ? '#9defff' : '#1ec49e';
  ctx.shadowBlur = frozen ? 8 : 14;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Gloss
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(-w*0.18, -h*0.22 + jiggle, w*0.35, h*0.22, -0.35, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();

  // Eyes (symmetric)
  ctx.fillStyle = '#fff';
  const eyeR = size*0.13;
  ctx.beginPath();
  ctx.arc(-size*0.28, -size*0.08 + jiggle, eyeR, 0, Math.PI*2);
  ctx.arc( size*0.28, -size*0.08 + jiggle, eyeR, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = '#0b1020';
  ctx.beginPath();
  ctx.arc(-size*0.28, -size*0.08 + jiggle, eyeR*0.55, 0, Math.PI*2);
  ctx.arc( size*0.28, -size*0.08 + jiggle, eyeR*0.55, 0, Math.PI*2);
  ctx.fill();

  // Mouth
  ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = Math.max(1.2, size*0.08);
  ctx.beginPath();
  ctx.arc(0, size*0.05 + jiggle, size*0.22, 0.15*Math.PI, 0.85*Math.PI);
  ctx.stroke();

  // 3 animated drips straight down
  const dripCount = 3;
  for(let i=0;i<dripCount;i++){
    const t = (performance.now()/700 + i*0.27) % 1;
    const dx = -w*0.25 + i*(w*0.25);
    const len = h*0.28 * (0.25 + 0.75*(1 - Math.abs(2*t-1)));
    const tip = h*0.38 + len;

    ctx.strokeStyle = frozen ? 'rgba(160,240,255,0.9)' : 'rgba(48,220,180,0.9)';
    ctx.lineWidth = size*0.10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(dx, h*0.30);
    ctx.lineTo(dx, tip);
    ctx.stroke();

    ctx.fillStyle = frozen ? '#bdf2ff' : '#4ef0c7';
    ctx.beginPath();
    ctx.ellipse(dx, tip + size*0.10, size*0.10, size*0.16, 0, 0, Math.PI*2);
    ctx.fill();
  }

  // Subtle rim light
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-w*0.48, -h*0.12 + jiggle);
  ctx.lineTo(-w*0.10, -h*0.38 + jiggle);
  ctx.stroke();

  ctx.restore();
}

// Owl with symmetric eyes, purple body, glasses; feet point downwards
function drawOwl(ctx, cx, cy, tile, frozen){
  const size = tile * 0.34;
  const w = size*1.45, h = size*1.7;

  ctx.save();
  ctx.translate(cx, cy);

  // Body (upright)
  const grad = ctx.createLinearGradient(0, -h, 0, h);
  grad.addColorStop(0, frozen ? '#b9a7ff' : '#a78bfa'); // purple
  grad.addColorStop(1, frozen ? '#907cfe' : '#7c5cf6');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, w*0.55, h*0.52, 0, 0, Math.PI*2);
  ctx.fill();

  // Wings
  ctx.fillStyle = 'rgba(0,0,0,.12)';
  ctx.beginPath(); ctx.ellipse(-w*0.48, 0, w*0.26, h*0.35, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse( w*0.48, 0, w*0.26, h*0.35, 0, 0, Math.PI*2); ctx.fill();

  // Eyes (left and right identical sizing/placement relative to center)
  const eyeR = size*0.16;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-size*0.26, -size*0.10, eyeR, 0, Math.PI*2);
  ctx.arc( size*0.26, -size*0.10, eyeR, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.arc(-size*0.26, -size*0.10, eyeR*0.55, 0, Math.PI*2);
  ctx.arc( size*0.26, -size*0.10, eyeR*0.55, 0, Math.PI*2);
  ctx.fill();

  // Glasses
  ctx.strokeStyle = '#2e1065';
  ctx.lineWidth = Math.max(1.5, size*0.07);
  ctx.beginPath();
  ctx.arc(-size*0.26, -size*0.10, eyeR*1.05, 0, Math.PI*2);
  ctx.arc( size*0.26, -size*0.10, eyeR*1.05, 0, Math.PI*2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size*0.12, -size*0.10);
  ctx.lineTo( size*0.12, -size*0.10);
  ctx.stroke();

  // Beak
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(0, -size*0.02);
  ctx.lineTo(size*0.12,  size*0.18);
  ctx.lineTo(-size*0.12, size*0.18);
  ctx.closePath(); ctx.fill();

  // Feet (always down)
  ctx.fillStyle = '#fbbf24';
  const fy = h*0.48;
  for(const sx of [-1, 1]){
    ctx.beginPath();
    ctx.moveTo(sx*size*0.22, fy);
    ctx.lineTo(sx*size*0.10, fy + size*0.18);
    ctx.lineTo(sx*size*0.34, fy + size*0.18);
    ctx.closePath(); ctx.fill();
  }

  // Rim light
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, w*0.54, -Math.PI*0.2, Math.PI*0.2);
  ctx.stroke();

  ctx.restore();
}
