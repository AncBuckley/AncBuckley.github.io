// enemies.js — enemy creation, AI, drawing (ES module)

// Directions
const DIRS = { UP:0, RIGHT:1, DOWN:2, LEFT:3 };
const DIR_VECT = [[0,-1],[1,0],[0,1],[-1,0]];

const clamp = (v,a,b)=> Math.min(b, Math.max(a,v));

// Hooks provided by the board (set from muncher.js)
let boardHooks = {
  isCellEmpty: (gx,gy)=>false,
  placeWordAt: (gx,gy)=>{},
  onPlayerCaught: (idx)=>{}
};

export function notifyBoardHooksForEnemies(hooks = {}){
  boardHooks = { ...boardHooks, ...hooks };
}

/**
 * Create a starting set of enemies.
 * Alternates AI: chaser (slime) vs forager (owl).
 */
export function createEnemies({gridW, gridH, level = 1, stepMs = 3000}){
  const list = [];
  const count = Math.min(6, 2 + Math.floor((level - 1) / 2)); // 2..6
  const t0 = performance.now();

  for(let i=0;i<count;i++){
    const ai = (i % 2 === 0) ? 'chaser' : 'forager';
    const type = ai === 'chaser' ? 'slime' : 'owl';

    // spawn somewhere not (0,0)
    let gx = (Math.random()*gridW)|0;
    let gy = (Math.random()*gridH)|0;
    if (gx === 0 && gy === 0){ gx = gridW - 1; gy = gridH - 1; }

    list.push({
      ai, type,
      gx, gy, x: gx, y: gy,
      dir: DIRS.LEFT,
      stepMs,
      nextStepAt: t0 + stepMs * (0.35 + 0.12*i),

      // animation seeds
      wobbleSeed: Math.random()*Math.PI*2,
      wingSeed: Math.random()*Math.PI*2,
    });
  }
  return list;
}

/**
 * Advance enemy logic; step one tile when their timer elapses.
 */
export function updateEnemies(enemies, opts){
  const {
    gridW, gridH,
    player,
    stepMs = 3000,
    freezeUntil = 0,
    passable = ()=>true,
    clampTo = (gx,gy)=>({gx,gy}),
    onCatch // optional legacy hook; board hook is the source of truth
  } = opts;

  const tnow = performance.now();

  for(let i=0;i<enemies.length;i++){
    const e = enemies[i];
    e.stepMs = stepMs;

    // Skip movement while frozen
    if (tnow < freezeUntil) continue;

    if (tnow >= (e.nextStepAt || 0)){
      // Decide direction
      let dir = decideDir(e, {gridW,gridH,player,passable});
      if (dir == null) dir = (Math.random()*4)|0;

      const [dx,dy] = DIR_VECT[dir];
      let nx = e.gx + dx, ny = e.gy + dy;
      ({gx:nx, gy:ny} = clampTo(nx,ny));

      if (passable(nx,ny)){
        e.gx = nx; e.gy = ny; e.x = nx; e.y = ny; e.dir = dir;

        // If landed on an empty cell, let the board place a word
        try{
          if (boardHooks.isCellEmpty && boardHooks.isCellEmpty(nx,ny)){
            boardHooks.placeWordAt && boardHooks.placeWordAt(nx,ny);
          }
        }catch(_){}
      }

      // Collision with player?
      if (player && player.gx === e.gx && player.gy === e.gy){
        try { boardHooks.onPlayerCaught && boardHooks.onPlayerCaught(i); } catch(_){}
        if (typeof onCatch === 'function'){ try { onCatch(i); } catch(_){} }
      }

      e.nextStepAt = tnow + e.stepMs;
    }
  }
}

function decideDir(e, {gridW,gridH,player,passable}){
  const dirs = [DIRS.UP, DIRS.RIGHT, DIRS.DOWN, DIRS.LEFT];

  // Occasional randomness to prevent perfect predictability
  if (Math.random() < 0.14) return dirs[(Math.random()*4)|0];

  if (e.ai === 'chaser' && player){
    // Move to reduce Manhattan distance to player
    const best = dirs
      .map(d=>({ d, nx:e.gx + DIR_VECT[d][0], ny: e.gy + DIR_VECT[d][1] }))
      .filter(s=>passable(s.nx,s.ny))
      .sort((a,b)=>{
        const da = Math.abs(a.nx - player.gx) + Math.abs(a.ny - player.gy);
        const db = Math.abs(b.nx - player.gx) + Math.abs(b.ny - player.gy);
        return da - db;
      });
    if (best.length) return best[0].d;
  }

  if (e.ai === 'forager'){
    // Prefer empty tiles (to seed new words); otherwise any passable
    const cand = dirs
      .map(d=>({ d, nx:e.gx + DIR_VECT[d][0], ny: e.gy + DIR_VECT[d][1] }))
      .filter(s=>passable(s.nx,s.ny));

    if (boardHooks.isCellEmpty){
      const empties = cand.filter(s=>boardHooks.isCellEmpty(s.nx,s.ny));
      if (empties.length) return empties[(Math.random()*empties.length)|0].d;
    }
    if (cand.length) return cand[(Math.random()*cand.length)|0].d;
  }

  return null;
}

/** Teleport the specified enemy to bottom-right corner. */
export function moveEnemyToBottomRight(enemies, idx, gridW, gridH){
  const e = enemies[idx];
  if (!e) return;
  e.gx = gridW - 1; e.gy = gridH - 1;
  e.x = e.gx; e.y = e.gy;
  e.dir = DIRS.LEFT;
  e.nextStepAt = performance.now() + (e.stepMs || 3000);
}

/** Draw all enemies with distinct looks + light animation per AI type. */
export function drawEnemies(ctx, enemies, {padX, padY, tile}){
  const t = performance.now()/1000;
  for(const e of enemies){
    const x = padX + e.x*tile + tile/2;
    const y = padY + e.y*tile + tile/2;
    if (e.type === 'slime') drawSlime(ctx, x, y, tile*0.38, e.dir, t + (e.wobbleSeed||0));
    else drawOwl(ctx, x, y, tile*0.40, e.dir, t + (e.wingSeed||0));
  }
}

// ─────────────────── Visuals ───────────────────
function drawSlime(ctx, x, y, r, dir, t){
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate([ -Math.PI/2, 0, Math.PI/2, Math.PI ][dir|0]);

  // wobble
  const wob = Math.sin(t*3.2)*0.06 + Math.sin(t*1.7 + 1.3)*0.04;
  const w = r*1.85*(1+wob), h = r*1.45*(1-wob);

  // body
  const grd = ctx.createLinearGradient(-w/2,-h/2, w/2,h/2);
  grd.addColorStop(0,'#2ef2a3');
  grd.addColorStop(1,'#0da36a');

  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.moveTo(-w*0.5, h*0.45);
  ctx.quadraticCurveTo(-w*0.6, -h*0.1, 0, -h*0.52);
  ctx.quadraticCurveTo(w*0.6, -h*0.1, w*0.5, h*0.45);
  ctx.closePath();
  ctx.fill();

  // glossy top
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(0, -h*0.34, w*0.35, h*0.18, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-w*0.18, -h*0.08, r*0.13, 0, Math.PI*2);
  ctx.arc( w*0.18, -h*0.08, r*0.13, 0, Math.PI*2);
  ctx.fill();

  // pupils track slight movement
  const px = Math.sin(t*2.0)*r*0.03;
  const py = Math.cos(t*1.8)*r*0.02;
  ctx.fillStyle = '#0b1020';
  ctx.beginPath();
  ctx.arc(-w*0.18+px, -h*0.08+py, r*0.07, 0, Math.PI*2);
  ctx.arc( w*0.18+px, -h*0.08+py, r*0.07, 0, Math.PI*2);
  ctx.fill();

  ctx.restore();
}

function drawOwl(ctx, x, y, r, dir, t){
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate([ -Math.PI/2, 0, Math.PI/2, Math.PI ][dir|0]);

  // wing flap (−1..1)
  const flap = Math.sin(t*6.0);
  const w = r*1.6, h = r*1.6;

  // body
  ctx.fillStyle = '#8f6a2a';
  ctx.beginPath();
  ctx.ellipse(0, 0, w*0.48, h*0.55, 0, 0, Math.PI*2);
  ctx.fill();

  // wings (flap by scaling)
  ctx.save();
  ctx.translate(-w*0.42, 0);
  ctx.scale(1, 1 + flap*0.12);
  ctx.fillStyle = '#6b4f1f';
  ctx.beginPath(); ctx.ellipse(0, 0, w*0.24, h*0.32, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate( w*0.42, 0);
  ctx.scale(1, 1 - flap*0.12);
  ctx.fillStyle = '#6b4f1f';
  ctx.beginPath(); ctx.ellipse(0, 0, w*0.24, h*0.32, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  // eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-w*0.18, -h*0.2, r*0.14, 0, Math.PI*2);
  ctx.arc( w*0.18, -h*0.2, r*0.14, 0, Math.PI*2);
  ctx.fill();

  // pupils (blink occasionally)
  const blink = (Math.sin(t*2.3 + 1.1) > 0.92) ? 0.2 : 1.0;
  ctx.fillStyle = '#0b1020';
  ctx.beginPath();
  ctx.ellipse(-w*0.18, -h*0.2, r*0.07, r*0.07*blink, 0, 0, Math.PI*2);
  ctx.ellipse( w*0.18, -h*0.2, r*0.07, r*0.07*blink, 0, 0, Math.PI*2);
  ctx.fill();

  // beak
  ctx.fillStyle = '#e4a11b';
  ctx.beginPath();
  ctx.moveTo(0, -h*0.06);
  ctx.lineTo(-r*0.12, 0);
  ctx.lineTo(r*0.12, 0);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
