// enemies.js — enemy creation, AI, drawing (ES module)

const DIRS = { UP:0, RIGHT:1, DOWN:2, LEFT:3 };
const DIR_VECT = [[0,-1],[1,0],[0,1],[-1,0]];

const clamp = (v,a,b)=> Math.min(b, Math.max(a,v));

// Hooks provided by the board
let boardHooks = {
  isCellEmpty: (gx,gy)=>false,
  placeWordAt: (gx,gy)=>{},
  onPlayerCaught: (idx)=>{}
};

export function notifyBoardHooksForEnemies(hooks = {}){
  boardHooks = { ...boardHooks, ...hooks };
}

/**
 * Create enemies: alternates AI chaser (slime) and forager (owl)
 */
export function createEnemies({gridW, gridH, level = 1, stepMs = 3000}){
  const list = [];
  const count = Math.min(6, 2 + Math.floor((level - 1) / 2)); // 2..6
  const t0 = performance.now();

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
      nextStepAt: t0 + stepMs * (0.35 + 0.12*i),

      wobbleSeed: Math.random()*Math.PI*2,
      wingSeed: Math.random()*Math.PI*2,
      blinkSeed: Math.random()*1000
    });
  }
  return list;
}

/**
 * Advance enemy logic; checks collision both before and after stepping.
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

    // Pre-step collision (catch if spawned on player or arrived earlier)
    if (player && player.gx === e.gx && player.gy === e.gy){
      try { boardHooks.onPlayerCaught && boardHooks.onPlayerCaught(i); } catch(_){}
    }

    if (tnow < freezeUntil) continue;

    if (tnow >= (e.nextStepAt || 0)){
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

      // Post-step collision
      if (player && player.gx === e.gx && player.gy === e.gy){
        try { boardHooks.onPlayerCaught && boardHooks.onPlayerCaught(i); } catch(_){}
      }

      e.nextStepAt = tnow + e.stepMs;
    }
  }
}

function decideDir(e, {gridW,gridH,player,passable}){
  const DIRS_ARR = [DIRS.UP, DIRS.RIGHT, DIRS.DOWN, DIRS.LEFT];

  // Occasional randomness
  if (Math.random() < 0.14) return DIRS_ARR[(Math.random()*4)|0];

  if (e.ai === 'chaser' && player){
    const best = DIRS_ARR
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
    const cand = DIRS_ARR
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

/** Draw all enemies. Owls are upright (feet down), smaller, purple with glasses.
 *  Slimes are rounder and gloopy with extra drips. */
export function drawEnemies(ctx, enemies, {padX, padY, tile}){
  const t = performance.now()/1000;
  for(const e of enemies){
    const x = padX + e.x*tile + tile/2;
    const y = padY + e.y*tile + tile/2;
    if (e.type === 'slime'){
      drawSlimeGloopy(ctx, x, y, tile*0.40, e.dir, t + (e.wobbleSeed||0));
    } else {
      drawOwlPurpleGlasses(ctx, x, y, tile*0.38, e.dir, t + (e.wingSeed||0), e.blinkSeed||0);
    }
  }
}

// ─────────────────── Visuals ───────────────────

function drawSlimeGloopy(ctx, x, y, r, dir, t){
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate([ -Math.PI/2, 0, Math.PI/2, Math.PI ][dir|0]);

  // wobble & squish
  const wob = Math.sin(t*3.0)*0.08 + Math.sin(t*1.7 + 0.8)*0.05;
  const w = r*2.0*(1+wob), h = r*1.6*(1-wob);

  // body
  const grd = ctx.createLinearGradient(-w/2,-h/2, w/2,h/2);
  grd.addColorStop(0,'#2df2a8');
  grd.addColorStop(0.6,'#17c990');
  grd.addColorStop(1,'#0a8c5d');

  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.moveTo(-w*0.58, h*0.42);
  ctx.quadraticCurveTo(-w*0.66, -h*0.05, 0, -h*0.56);
  ctx.quadraticCurveTo(w*0.66, -h*0.05, w*0.58, h*0.42);
  ctx.quadraticCurveTo(w*0.18, h*0.64, 0, h*0.66);
  ctx.quadraticCurveTo(-w*0.18, h*0.64, -w*0.58, h*0.42);
  ctx.closePath();
  ctx.fill();

  // thick glossy highlight
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.ellipse(-w*0.12, -h*0.36, w*0.36, h*0.18, 0.35, 0, Math.PI*2); ctx.fill();
  ctx.globalAlpha = 1;

  // gloopy drips
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = '#11d48e';
  for(let i=0;i<4;i++){
    const dx = (-w*0.32 + i*(w*0.21)) + Math.sin(t*2.2 + i)*w*0.03;
    const dy = h*0.50 + Math.sin(t*2.9 + i*0.7)*h*0.06;
    ctx.beginPath(); ctx.ellipse(dx, dy, w*0.08, h*0.10, 0, 0, Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-w*0.20, -h*0.10, r*0.15, 0, Math.PI*2);
  ctx.arc( w*0.20, -h*0.10, r*0.15, 0, Math.PI*2);
  ctx.fill();

  const px = Math.sin(t*2.1)*r*0.035;
  const py = Math.cos(t*1.8)*r*0.025;
  ctx.fillStyle = '#0b1020';
  ctx.beginPath();
  ctx.arc(-w*0.20+px, -h*0.10+py, r*0.08, 0, Math.PI*2);
  ctx.arc( w*0.20+px, -h*0.10+py, r*0.08, 0, Math.PI*2);
  ctx.fill();

  // rim light arc
  ctx.globalAlpha = 0.33;
  ctx.strokeStyle = '#a6ffe0';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, w*0.54, h*0.60, 0, 0.2, Math.PI*1.8);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.restore();
}

function drawOwlPurpleGlasses(ctx, x, y, r, dir, t, blinkSeed){
  ctx.save();
  ctx.translate(x,y);
  // Owls: always upright (feet down) — do NOT rotate body by dir.

  const w = r*1.6, h = r*1.75;

  // body (purple)
  const bodyGrad = ctx.createLinearGradient(0, -h*0.5, 0, h*0.7);
  bodyGrad.addColorStop(0, '#8d64e8'); // lighter purple
  bodyGrad.addColorStop(1, '#5a3aa8'); // darker purple
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, w*0.46, h*0.55, 0, 0, Math.PI*2);
  ctx.fill();

  // belly
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, h*0.02, w*0.36, h*0.36, 0, 0, Math.PI*2);
  ctx.clip();
  ctx.fillStyle = '#e8defc';
  ctx.beginPath(); ctx.rect(-w, -h, w*2, h*2); ctx.fill();
  ctx.strokeStyle = 'rgba(110,90,160,.45)';
  ctx.lineWidth = Math.max(1, r*0.05);
  for(let i=0;i<5;i++){
    ctx.beginPath();
    const yy = -h*0.10 + i*(h*0.10);
    ctx.moveTo(-w*0.28, yy); ctx.quadraticCurveTo(0, yy+h*0.05, w*0.28, yy);
    ctx.stroke();
  }
  ctx.restore();

  // wings (gentle flap)
  const flap = Math.sin(t*5.8)*0.12;
  ctx.fillStyle = '#6f4bd0';
  ctx.save();
  ctx.translate(-w*0.42, -h*0.02);
  ctx.rotate(-0.08 + flap);
  ctx.beginPath();
  ctx.ellipse(0, 0, w*0.24, h*0.34, 0.1, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate( w*0.42, -h*0.02);
  ctx.rotate(0.08 - flap);
  ctx.beginPath();
  ctx.ellipse(0, 0, w*0.24, h*0.34, -0.1, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  // head (slight yaw suggestion only)
  const headYaw = (dir === DIRS.LEFT ? -0.10 : dir === DIRS.RIGHT ? 0.10 : 0);
  ctx.save();
  ctx.translate(0, -h*0.36);
  ctx.rotate(headYaw);

  ctx.fillStyle = '#8d64e8';
  ctx.beginPath(); ctx.ellipse(0, 0, w*0.28, h*0.20, 0, 0, Math.PI*2); ctx.fill();

  // ear tufts
  ctx.fillStyle = '#6f4bd0';
  ctx.beginPath();
  ctx.moveTo(-w*0.22, -h*0.06); ctx.lineTo(-w*0.12, -h*0.14); ctx.lineTo(-w*0.06, -h*0.02); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo( w*0.22, -h*0.06); ctx.lineTo( w*0.12, -h*0.14); ctx.lineTo( w*0.06, -h*0.02); ctx.closePath(); ctx.fill();

  // eyes
  const blink = (Math.sin(t*2.1 + blinkSeed) > 0.92) ? 0.2 : 1.0;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-w*0.11, -h*0.02, r*0.14, 0, Math.PI*2);
  ctx.arc( w*0.11, -h*0.02, r*0.14, 0, Math.PI*2);
  ctx.fill();

  // glasses frames
  ctx.strokeStyle = '#2a1a5e';
  ctx.lineWidth = Math.max(1.5, r*0.06);
  ctx.beginPath();
  ctx.arc(-w*0.11, -h*0.02, r*0.16, 0, Math.PI*2);
  ctx.arc( w*0.11, -h*0.02, r*0.16, 0, Math.PI*2);
  ctx.stroke();
  // bridge
  ctx.beginPath();
  ctx.moveTo(-w*0.11 + r*0.16, -h*0.02);
  ctx.lineTo( w*0.11 - r*0.16, -h*0.02);
  ctx.stroke();

  // pupils (blink)
  ctx.fillStyle = '#0b1020';
  ctx.beginPath();
  ctx.ellipse(-w*0.11, -h*0.02, r*0.07, r*0.07*blink, 0, 0, Math.PI*2);
  ctx.ellipse( w*0.11, -h*0.02, r*0.07, r*0.07*blink, 0, 0, Math.PI*2);
  ctx.fill();

  // beak
  ctx.fillStyle = '#e4a11b';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-r*0.10, r*0.12);
  ctx.lineTo( r*0.10, r*0.12);
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

  // shadow
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(0, h*0.58, w*0.30, h*0.06, 0, 0, Math.PI*2); ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}
