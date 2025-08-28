// enemies.js — enemy creation, AI, drawing (ES module)

// Directions (kept to match muncher.js expectations)
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
      blinkSeed: Math.random()*1000
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

/** Draw all enemies with distinct looks + richer animation.
 *  NOTE: Owls never rotate with direction (feet always down).
 */
export function drawEnemies(ctx, enemies, {padX, padY, tile}){
  const t = performance.now()/1000;
  for(const e of enemies){
    const x = padX + e.x*tile + tile/2;
    const y = padY + e.y*tile + tile/2;
    if (e.type === 'slime'){
      drawSlimeDetailed(ctx, x, y, tile*0.40, e.dir, t + (e.wobbleSeed||0));
    } else {
      drawOwlDetailed(ctx, x, y, tile*0.44, e.dir, t + (e.wingSeed||0), e.blinkSeed||0);
    }
  }
}

// ─────────────────── Detailed Visuals ───────────────────

function drawSlimeDetailed(ctx, x, y, r, dir, t){
  ctx.save();
  ctx.translate(x,y);
  // Slimes still face their travel direction
  ctx.rotate([ -Math.PI/2, 0, Math.PI/2, Math.PI ][dir|0]);

  // soft wobble
  const wob = Math.sin(t*3.1)*0.07 + Math.sin(t*1.6 + 1.1)*0.05;
  const w = r*1.95*(1+wob), h = r*1.55*(1-wob);

  // body base
  const grd = ctx.createLinearGradient(-w/2,-h/2, w/2,h/2);
  grd.addColorStop(0,'#2ef2a3');
  grd.addColorStop(0.6,'#16c98d');
  grd.addColorStop(1,'#0b8f60');

  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.moveTo(-w*0.55, h*0.45);
  ctx.quadraticCurveTo(-w*0.65, -h*0.05, 0, -h*0.54);
  ctx.quadraticCurveTo(w*0.65, -h*0.05, w*0.55, h*0.45);
  ctx.quadraticCurveTo(w*0.15, h*0.60, 0, h*0.62);
  ctx.quadraticCurveTo(-w*0.15, h*0.60, -w*0.55, h*0.45);
  ctx.closePath();
  ctx.fill();

  // bottom slime drips
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#0fd18a';
  for(let i=0;i<3;i++){
    const dx = (-w*0.28 + i*(w*0.28)) + Math.sin(t*2 + i)*w*0.03;
    const dy = h*0.48 + Math.sin(t*3 + i)*h*0.05;
    ctx.beginPath(); ctx.ellipse(dx, dy, w*0.08, h*0.09, 0, 0, Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // glossy highlights
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(-w*0.12, -h*0.36, w*0.32, h*0.16, 0.3, 0, Math.PI*2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-w*0.20, -h*0.10, r*0.14, 0, Math.PI*2);
  ctx.arc( w*0.20, -h*0.10, r*0.14, 0, Math.PI*2);
  ctx.fill();

  // pupils tracking
  const px = Math.sin(t*2.2)*r*0.035;
  const py = Math.cos(t*1.9)*r*0.025;
  ctx.fillStyle = '#0b1020';
  ctx.beginPath();
  ctx.arc(-w*0.20+px, -h*0.10+py, r*0.075, 0, Math.PI*2);
  ctx.arc( w*0.20+px, -h*0.10+py, r*0.075, 0, Math.PI*2);
  ctx.fill();

  // rim light
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = '#a6ffe0';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, w*0.52, h*0.58, 0, 0.2, Math.PI*1.8);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.restore();
}

function drawOwlDetailed(ctx, x, y, r, dir, t, blinkSeed){
  ctx.save();
  ctx.translate(x,y);
  // IMPORTANT: Owls always stand upright (feet down), so NO body rotation by dir.
  // We'll add micro head yaw so they feel alive.

  const w = r*1.7, h = r*1.8;

  // body (rounded)
  const bodyGrad = ctx.createLinearGradient(0, -h*0.5, 0, h*0.7);
  bodyGrad.addColorStop(0, '#9b7740');
  bodyGrad.addColorStop(1, '#6f5126');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, w*0.48, h*0.56, 0, 0, Math.PI*2);
  ctx.fill();

  // belly pattern
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, h*0.04, w*0.38, h*0.38, 0, 0, Math.PI*2);
  ctx.clip();
  ctx.fillStyle = '#e2d4b7';
  ctx.globalAlpha = 0.85;
  ctx.beginPath(); ctx.rect(-w, -h, w*2, h*2); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(110,90,55,.45)';
  ctx.lineWidth = Math.max(1, r*0.05);
  for(let i=0;i<5;i++){
    ctx.beginPath();
    const yy = -h*0.12 + i*(h*0.10);
    ctx.moveTo(-w*0.30, yy); ctx.quadraticCurveTo(0, yy+h*0.05, w*0.30, yy);
    ctx.stroke();
  }
  ctx.restore();

  // wings (subtle flap)
  const flap = Math.sin(t*6.0);
  ctx.fillStyle = '#7b5b2d';
  ctx.save();
  ctx.translate(-w*0.44, -h*0.02);
  ctx.rotate(-0.08 + flap*0.06);
  ctx.beginPath();
  ctx.ellipse(0, 0, w*0.26, h*0.36, 0.1, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate( w*0.44, -h*0.02);
  ctx.rotate(0.08 - flap*0.06);
  ctx.beginPath();
  ctx.ellipse(0, 0, w*0.26, h*0.36, -0.1, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();

  // head (slight yaw depending on dir; but still vertical overall)
  const headYaw = (dir === DIRS.LEFT ? -0.12 : dir === DIRS.RIGHT ? 0.12 : 0);
  ctx.save();
  ctx.translate(0, -h*0.38);
  ctx.rotate(headYaw);

  // head shape
  ctx.fillStyle = '#9b7740';
  ctx.beginPath(); ctx.ellipse(0, 0, w*0.30, h*0.22, 0, 0, Math.PI*2); ctx.fill();

  // ear tufts
  ctx.fillStyle = '#7b5b2d';
  ctx.beginPath();
  ctx.moveTo(-w*0.24, -h*0.06); ctx.lineTo(-w*0.12, -h*0.16); ctx.lineTo(-w*0.06, -h*0.02); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo( w*0.24, -h*0.06); ctx.lineTo( w*0.12, -h*0.16); ctx.lineTo( w*0.06, -h*0.02); ctx.closePath(); ctx.fill();

  // eyes
  const blink = (Math.sin(t*2.3 + blinkSeed) > 0.92) ? 0.2 : 1.0;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-w*0.12, -h*0.02, r*0.16, 0, Math.PI*2);
  ctx.arc( w*0.12, -h*0.02, r*0.16, 0, Math.PI*2);
  ctx.fill();

  ctx.fillStyle = '#0b1020';
  ctx.beginPath();
  ctx.ellipse(-w*0.12, -h*0.02, r*0.08, r*0.08*blink, 0, 0, Math.PI*2);
  ctx.ellipse( w*0.12, -h*0.02, r*0.08, r*0.08*blink, 0, 0, Math.PI*2);
  ctx.fill();

  // beak
  ctx.fillStyle = '#e4a11b';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-r*0.12, r*0.12);
  ctx.lineTo( r*0.12, r*0.12);
  ctx.closePath();
  ctx.fill();

  ctx.restore(); // end head

  // feet (always down)
  ctx.strokeStyle = '#e4a11b';
  ctx.lineWidth = Math.max(1.2, r*0.06);
  ctx.lineCap = 'round';
  const fy = h*0.50;
  // left foot
  ctx.beginPath();
  ctx.moveTo(-w*0.16, fy); ctx.lineTo(-w*0.22, fy + r*0.18);
  ctx.moveTo(-w*0.16, fy); ctx.lineTo(-w*0.12, fy + r*0.18);
  ctx.moveTo(-w*0.16, fy); ctx.lineTo(-w*0.06, fy + r*0.18);
  ctx.stroke();
  // right foot
  ctx.beginPath();
  ctx.moveTo( w*0.16, fy); ctx.lineTo( w*0.22, fy + r*0.18);
  ctx.moveTo( w*0.16, fy); ctx.lineTo( w*0.12, fy + r*0.18);
  ctx.moveTo( w*0.16, fy); ctx.lineTo( w*0.06, fy + r*0.18);
  ctx.stroke();

  // subtle shadow under owl
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(0, h*0.58, w*0.30, h*0.06, 0, 0, Math.PI*2); ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}
