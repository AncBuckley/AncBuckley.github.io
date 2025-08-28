// enemies.js — enemy creation, AI, drawing (ES module)

const DIRS = { UP:0, RIGHT:1, DOWN:2, LEFT:3 };
const DIR_VECT = [[0,-1],[1,0],[0,1],[-1,0]];

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
 * Half are "chaser" (slime monsters), half are "forager" (owls).
 */
export function createEnemies({gridW, gridH, level = 1, stepMs = 3000}){
  const list = [];
  const count = Math.min(6, 2 + Math.floor((level - 1) / 2)); // 2..6
  for(let i=0;i<count;i++){
    const ai = (i % 2 === 0) ? 'chaser' : 'forager';
    const type = ai === 'chaser' ? 'slime' : 'owl';
    let gx = (Math.random()*gridW)|0;
    let gy = (Math.random()*gridH)|0;
    if (gx === 0 && gy === 0){ gx = gridW - 1; gy = gridH - 1; }
    list.push({
      ai, type,
      gx, gy, x: gx, y: gy,
      dir: DIRS.LEFT,
      stepMs,
      nextStepAt: performance.now() + stepMs * (0.3 + 0.1*i)
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
    clampTo = (gx,gy)=>({gx,gy})
  } = opts;

  const tnow = performance.now();

  for(let i=0;i<enemies.length;i++){
    const e = enemies[i];
    e.stepMs = stepMs;

    // Freeze check
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
        try{ boardHooks.onPlayerCaught && boardHooks.onPlayerCaught(i); }catch(_){}
      }

      e.nextStepAt = tnow + e.stepMs;
    }
  }
}

function decideDir(e, {gridW,gridH,player,passable}){
  const dirs = [DIRS.UP, DIRS.RIGHT, DIRS.DOWN, DIRS.LEFT];

  // Some randomness
  if (Math.random() < 0.12) return dirs[(Math.random()*4)|0];

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

/** Draw all enemies with distinct looks per AI type. */
export function drawEnemies(ctx, enemies, {padX, padY, tile}){
  for(const e of enemies){
    const x = padX + e.x*tile + tile/2;
    const y = padY + e.y*tile + tile/2;
    if (e.type === 'slime') drawSlime(ctx, x, y, tile*0.38, e.dir);
    else drawOwl(ctx, x, y, tile*0.40, e.dir);
  }
}

// ---------- Visuals ----------
function drawSlime(ctx, x, y, r, dir){
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate([ -Math.PI/2, 0, Math.PI/2, Math.PI ][dir|0]);

  const w = r*1.8, h = r*1.4;
  const grd = ctx.createLinearGradient(-w/2,-h/2, w/2,h/2);
  grd.addColorStop(0,'#2ef2a3'); grd.addColorStop(1,'#0da36a');

  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.moveTo(-w*0.5, h*0.4);
  ctx.quadraticCurveTo(-w*0.6, -h*0.1, 0, -h*0.45);
  ctx.quadraticCurveTo(w*0.6, -h*0.1, w*0.5, h*0.4);
  ctx.closePath();
  ctx.fill();

  // eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-w*0.18, -h*0.1, r*0.13, 0, Math.PI*2);
  ctx.arc( w*0.18, -h*0.1, r*0.13, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = '#0b1020';
  ctx.beginPath();
  ctx.arc(-w*0.18, -h*0.1, r*0.07, 0, Math.PI*2);
  ctx.arc( w*0.18, -h*0.1, r*0.07, 0, Math.PI*2);
  ctx.fill();

  ctx.restore();
}

function drawOwl(ctx, x, y, r, dir){
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate([ -Math.PI/2, 0, Math.PI/2, Math.PI ][dir|0]);

  const w = r*1.6, h = r*1.6;

  // body
  ctx.fillStyle = '#8f6a2a';
  ctx.beginPath();
  ctx.ellipse(0, 0, w*0.48, h*0.55, 0, 0, Math.PI*2);
  ctx.fill();

  // wings
  ctx.fillStyle = '#6b4f1f';
  ctx.beginPath(); ctx.ellipse(-w*0.42, 0, w*0.24, h*0.32, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse( w*0.42, 0, w*0.24, h*0.32, 0, 0, Math.PI*2); ctx.fill();

  // eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-w*0.18, -h*0.2, r*0.14, 0, Math.PI*2);
  ctx.arc( w*0.18, -h*0.2, r*0.14, 0, Math.PI*2);
  ctx.fill();

  ctx.fillStyle = '#0b1020';
  ctx.beginPath();
  ctx.arc(-w*0.18, -h*0.2, r*0.07, 0, Math.PI*2);
  ctx.arc( w*0.18, -h*0.2, r*0.07, 0, Math.PI*2);
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
