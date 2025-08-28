// enemies.js — enemy spawning, AI, drawing (slime chasers & owl grazers)

const now = () => performance.now();

export const DIRS = { UP:0, RIGHT:1, DOWN:2, LEFT:3 };
export const DIR_VECT = [ [0,-1],[1,0],[0,1],[-1,0] ];
const DIR_ANGLE = [ -Math.PI/2, 0, Math.PI/2, Math.PI ];

export const ENEMY_STEP_MS = 3000; // one tile every 3 seconds

// ---- Helpers bound to state ----
function inBounds(state,gx,gy){ return gx>=0 && gy>=0 && gx<state.gridW && gy<state.gridH; }
function neighbors(state,gx,gy){
  return [
    {dir:DIRS.UP,    nx:gx,   ny:gy-1},
    {dir:DIRS.RIGHT, nx:gx+1, ny:gy  },
    {dir:DIRS.DOWN,  nx:gx,   ny:gy+1},
    {dir:DIRS.LEFT,  nx:gx-1, ny:gy  }
  ].filter(n => inBounds(state,n.nx,n.ny));
}
function manhattan(ax,ay,bx,by){ return Math.abs(ax-bx) + Math.abs(ay-by); }

function nearestNonAnswerDist(state, gx,gy){
  let best = Infinity;
  for(const t of state.items){
    if(!t.eaten && !t.correct){
      const d = manhattan(gx,gy,t.gx,t.gy);
      if(d < best) best = d;
    }
  }
  return best;
}

function chooseStepChaser(state, e){
  const p = state.player;
  if(!p) return null;
  const opts = neighbors(state, e.gx, e.gy);
  let best = [], bestScore = Infinity;
  for(const o of opts){
    const d = manhattan(o.nx, o.ny, p.gx, p.gy);
    if(d < bestScore){ bestScore = d; best = [o]; }
    else if(d === bestScore){ best.push(o); }
  }
  return best.length ? best[(Math.random()*best.length)|0] : null;
}

function chooseStepGrazer(state, e){
  const opts = neighbors(state, e.gx, e.gy);
  let best = [], bestScore = Infinity;
  for(const o of opts){
    const d = nearestNonAnswerDist(state, o.nx, o.ny);
    if(d < bestScore){ bestScore = d; best = [o]; }
    else if(d === bestScore){ best.push(o); }
  }
  if(!isFinite(bestScore)){
    // No non-answer tiles left; fallback to mild chase
    return chooseStepChaser(state, e);
  }
  return best.length ? best[(Math.random()*best.length)|0] : null;
}

// Public: step enemies based on role
export function stepEnemies(state){
  if(!state.enemies?.length) return;
  if(state.catchAnim) return; // freeze pathing during catch/teleport animation
  const t = now();
  for(const e of state.enemies){
    if(t < e.nextStepAt) continue;

    // choose step by role
    let step = null;
    if(e.role === 'chaser'){
      step = chooseStepChaser(state, e) || chooseStepGrazer(state, e);
    }else{
      step = chooseStepGrazer(state, e) || chooseStepChaser(state, e);
    }

    if(step){
      e.gx = e.x = step.nx;
      e.gy = e.y = step.ny;
      e.dir = step.dir;
    }
    e.nextStepAt += ENEMY_STEP_MS;
  }
}

// Public: reset timers
export function resetEnemyTimers(state){
  const base = now();
  state.enemies.forEach((e,i)=>{ e.nextStepAt = base + ENEMY_STEP_MS + i*150; });
}

// Public: spawn enemies with roles
export function spawnTroggles(state){
  const base = state.level<=3? 2 : state.level<=6? 3 : 4;
  const n = Math.max(2, Math.min(6, base + (state.level>6?1:0)));
  state.enemies = [];
  const occupied = new Set([`0,0`]);
  const baseTime = now();

  for(let i=0;i<n;i++){
    let ex = (Math.random()*state.gridW)|0, ey = (Math.random()*state.gridH)|0, tries=0;
    while( (Math.abs(ex-0)+Math.abs(ey-0)) < Math.floor((state.gridW+state.gridH)/4) || occupied.has(`${ex},${ey}`) ){
      ex = (Math.random()*state.gridW)|0; ey = (Math.random()*state.gridH)|0; if(++tries>50) break;
    }
    occupied.add(`${ex},${ey}`);

    state.enemies.push({
      gx:ex, gy:ey, x:ex, y:ey,
      dir:(Math.random()*4)|0,
      // Visual color is retained but role decides sprite
      color: ['#ff3b6b','#ffb800','#00e5ff','#7cff00','#ff00e5','#ff7a00','#00ffb3','#ffd700','#00ffd0','#ff4d00'][(Math.random()*10)|0],
      role: Math.random() < 0.55 ? 'chaser' : 'grazer',   // slime vs owl
      nextStepAt: baseTime + ENEMY_STEP_MS + i*150
    });
  }
}

// ---- Drawing (slime & owl) ----

// Slime monster (for chasers)
function drawSlime(ctx, x, y, size, dir, frozen){
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(DIR_ANGLE[dir]|0);

  const w = size*1.2, h = size*0.95;

  // Jelly body
  const base = frozen ? '#8af1ff' : '#39ff97';
  const hi   = frozen ? '#c9fbff' : '#b7ffd8';
  const lo   = frozen ? '#5be7ff' : '#18c76a';

  const grd = ctx.createLinearGradient(-w*0.5, -h*0.5, w*0.5, h*0.7);
  grd.addColorStop(0, hi);
  grd.addColorStop(0.6, base);
  grd.addColorStop(1, lo);

  ctx.shadowColor = frozen ? '#7ae8ff' : '#39ff97';
  ctx.shadowBlur = frozen ? 6 : 16;

  ctx.beginPath();
  ctx.moveTo(-w*0.45, h*0.25);
  ctx.bezierCurveTo(-w*0.55, -h*0.10, -w*0.25, -h*0.55, 0, -h*0.55);
  ctx.bezierCurveTo( w*0.25, -h*0.55,  w*0.55, -h*0.10,  w*0.45, h*0.25);
  ctx.bezierCurveTo( w*0.25, h*0.45,  -w*0.25, h*0.45, -w*0.45, h*0.25);
  ctx.closePath();
  ctx.fillStyle = grd; ctx.fill();

  // Slime drips
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(-w*0.15, h*0.15); ctx.quadraticCurveTo(-w*0.18, h*0.36, -w*0.10, h*0.42);
  ctx.moveTo( w*0.10, h*0.15); ctx.quadraticCurveTo( w*0.08, h*0.34,  w*0.02, h*0.40);
  ctx.strokeStyle = '#ffffff55'; ctx.lineWidth = 2; ctx.stroke();
  ctx.globalAlpha = 1;

  // Eyes on stalks
  const ey = -h*0.38;
  const dx = size*0.22;
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(-dx, ey, size*0.12, 0, Math.PI*2);
  ctx.arc( dx, ey, size*0.12, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#0b1020';
  ctx.beginPath(); ctx.arc(-dx, ey, size*0.06, 0, Math.PI*2);
  ctx.arc( dx, ey, size*0.06, 0, Math.PI*2); ctx.fill();

  // Jagged mouth
  ctx.beginPath();
  ctx.moveTo(-size*0.28, h*0.02);
  ctx.lineTo(-size*0.18, h*0.06);
  ctx.lineTo(-size*0.08, 0);
  ctx.lineTo(0,           h*0.06);
  ctx.lineTo(size*0.10,   0);
  ctx.lineTo(size*0.22,   h*0.06);
  ctx.lineTo(size*0.30,   0);
  ctx.strokeStyle = '#073'; ctx.lineWidth = 2.2; ctx.stroke();

  ctx.restore();
}

// Scary owl (for grazers)
function drawOwl(ctx, x, y, size, dir, frozen){
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(DIR_ANGLE[dir]|0);

  const w = size*1.15, h = size*1.15;

  // Body
  const grd = ctx.createLinearGradient(0, -h*0.5, 0, h*0.5);
  grd.addColorStop(0, frozen ? '#9cd9ff' : '#4a2c57');
  grd.addColorStop(1, frozen ? '#6ba9d8' : '#2a1631');
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.ellipse(0, 0, w*0.45, h*0.55, 0, 0, Math.PI*2);
  ctx.fill();

  // Tufts
  ctx.fillStyle = frozen ? '#bfe9ff' : '#6b3b7b';
  ctx.beginPath();
  ctx.moveTo(-w*0.32, -h*0.36); ctx.lineTo(-w*0.15, -h*0.55); ctx.lineTo(-w*0.06, -h*0.36); ctx.closePath();
  ctx.moveTo( w*0.32, -h*0.36); ctx.lineTo( w*0.15, -h*0.55); ctx.lineTo( w*0.06, -h*0.36); ctx.closePath();
  ctx.fill();

  // Eyes
  const ex = w*0.18, ey = -h*0.1, rOuter = size*0.15, rInner = size*0.07;
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(-ex, ey, rOuter, 0, Math.PI*2); ctx.arc(ex, ey, rOuter, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = frozen ? '#144a7a' : '#ffcf00';
  ctx.beginPath(); ctx.arc(-ex, ey, rInner, 0, Math.PI*2); ctx.arc(ex, ey, rInner, 0, Math.PI*2); ctx.fill();

  // Beak
  ctx.fillStyle = frozen ? '#e9f6ff' : '#ff9b28';
  ctx.beginPath();
  ctx.moveTo(0, ey + size*0.02);
  ctx.lineTo(-size*0.07, ey + size*0.20);
  ctx.lineTo( size*0.07, ey + size*0.20);
  ctx.closePath(); ctx.fill();

  // Wings (slightly “clawed”)
  ctx.strokeStyle = frozen ? '#cfeeff' : '#7b4a8a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-w*0.45, 0); ctx.quadraticCurveTo(-w*0.62, h*0.05, -w*0.50, h*0.22);
  ctx.moveTo( w*0.45, 0); ctx.quadraticCurveTo( w*0.62, h*0.05,  w*0.50, h*0.22);
  ctx.stroke();

  // Talons
  ctx.fillStyle = frozen ? '#e9f6ff' : '#ffb84d';
  for(const sx of [-w*0.18, w*0.18]){
    ctx.beginPath();
    ctx.moveTo(sx,  h*0.38);
    ctx.lineTo(sx - size*0.06, h*0.50);
    ctx.lineTo(sx + size*0.06, h*0.50);
    ctx.closePath(); ctx.fill();
  }

  ctx.restore();
}

// Public: draw dispatcher
export function drawEnemy(ctx, pixelX, pixelY, size, dir, enemyObj, frozen){
  if(enemyObj?.role === 'chaser') drawSlime(ctx, pixelX, pixelY, size, dir, frozen);
  else                            drawOwl  (ctx, pixelX, pixelY, size, dir, frozen);
}

// Back-compat (if any old code still calls drawTroggle)
export function drawTroggle(ctx, x, y, size, dir, color, frozen, enemyObj){
  drawEnemy(ctx, x, y, size, dir, enemyObj || {role:'grazer'}, frozen);
}
