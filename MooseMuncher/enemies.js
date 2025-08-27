// enemies.js — enemy spawn, stepping, and drawing
// Used by munch.js

export const ENEMY_STEP_MS = 3000;
const DIRS = { UP:0, RIGHT:1, DOWN:2, LEFT:3 };
const DIR_VECT = [ [0,-1],[1,0],[0,1],[-1,0] ];
const TROGGLE_COLORS = ['#ff3b6b','#ffb800','#00e5ff','#7cff00','#ff00e5','#ff7a00','#00ffb3','#ffd700','#00ffd0','#ff4d00'];

const now = ()=> performance.now();
const clamp = (v,a,b)=> Math.min(b, Math.max(a,v));
const randi = (a,b)=> (Math.random()*(b-a)+a)|0;
const choice = arr => arr[Math.floor(Math.random()*arr.length)];

function inBounds(state, gx,gy){ return gx>=0 && gy>=0 && gx<state.gridW && gy<state.gridH; }

export function resetEnemyTimers(state){
  const base = now();
  state.enemies.forEach((e,i)=>{ e.nextStepAt = base + ENEMY_STEP_MS + i*150; });
}

export function spawnTroggles(state){
  const n = clamp(2 + Math.floor((state.level-1)/2), 2, 6);
  state.enemies.length = 0;
  const occ = new Set(['0,0']);
  const baseTime = now();
  for(let i=0;i<n;i++){
    let gx = randi(0, state.gridW), gy = randi(0, state.gridH), tries=0;
    while((Math.abs(gx-0)+Math.abs(gy-0)) < Math.floor((state.gridW+state.gridH)/4) || occ.has(`${gx},${gy}`)){
      gx = randi(0, state.gridW); gy = randi(0, state.gridH); if(++tries>50) break;
    }
    occ.add(`${gx},${gy}`);
    state.enemies.push({
      gx, gy, x:gx, y:gy,
      dir: randi(0,4),
      color: choice(TROGGLE_COLORS),
      nextStepAt: baseTime + ENEMY_STEP_MS + i*150
    });
  }
}

export function stepEnemies(state){
  // Pause all stepping during the troggle catch animation
  if(state.catchAnim) return;

  const t = now();
  const frozen = t < state.freezeUntil;

  for(const e of state.enemies){
    if(frozen) { e.nextStepAt = Math.max(e.nextStepAt, t + 50); continue; }
    if(t < (e.nextStepAt||0)) continue;

    // pick a direction — weak bias toward player
    const dx = state.player.gx - e.gx;
    const dy = state.player.gy - e.gy;

    const prefs = [];
    if(Math.abs(dx) > Math.abs(dy)){
      prefs.push(dx>0?1:3, dy>0?2:0, dx>0?1:3, (Math.random()<.5? (dy>0?2:0) : (dx>0?1:3)));
    } else {
      prefs.push(dy>0?2:0, dx>0?1:3, dy>0?2:0, (Math.random()<.5? (dx>0?1:3):(dy>0?2:0)));
    }

    let moved=false;
    for(const dir of prefs){
      const [vx,vy] = DIR_VECT[dir];
      const nx = e.gx + vx;
      const ny = e.gy + vy;
      if(!inBounds(state, nx, ny)) continue;
      // Move
      e.gx = nx; e.gy = ny; e.x = nx; e.y = ny; e.dir = dir;
      moved = true;
      break;
    }

    // If landed on an empty/eaten tile, re-seed with a new word per your rule
    if(moved){
      maybeSeedTile(state, e.gx, e.gy);
    }

    e.nextStepAt = t + ENEMY_STEP_MS;
  }
}

// When a troggle lands on an empty/eaten square, inject a new label.
// Chance the label is CORRECT is higher when few correct remain, and lower when many remain.
function maybeSeedTile(state, gx, gy){
  const idx = state.items.findIndex(t => t.gx===gx && t.gy===gy);
  if(idx < 0) return;
  const tile = state.items[idx];

  // Only seed if tile is eaten (i.e., visually empty)
  if(!tile.eaten) return;

  const total = state.gridW * state.gridH;
  const correctLeft = state.items.filter(t => !t.eaten && t.correct).length;
  const density = correctLeft / total; // higher means many correct already on board

  // Probability of seeding a correct tile
  const pCorrect = clamp(0.75 - density, 0.15, 0.85);

  // We need a new sample from the current category’s generator.
  // Generate a small batch and pick a label that isn't currently on this tile
  const batch = state.category.generate(3,3,5); // small batch
  const poolCorrect = batch.filter(b => b.correct);
  const poolWrong   = batch.filter(b => !b.correct);

  let pick;
  if(Math.random() < pCorrect && poolCorrect.length){
    pick = poolCorrect[randi(0, poolCorrect.length)];
  } else if (poolWrong.length){
    pick = poolWrong[randi(0, poolWrong.length)];
  } else {
    pick = batch[0];
  }

  // Replace tile content; keep it "uneaten"
  state.items[idx] = {
    ...tile,
    label: pick.label,
    value: pick.value,
    correct: !!pick.correct,
    eaten: false
  };

  // Update remaining count if we added a correct tile
  if(pick.correct) {
    // It was eaten; now it's fresh and correct
    // (no change if we previously counted eaten corrects)
    // To be safe, recompute:
    state.correctRemaining = state.items.filter(t => !t.eaten && t.correct).length;
  }
}

// ------- Drawing -------

export function drawTroggle(ctx, x,y, size, dir, color, frozen){
  ctx.save(); ctx.translate(x,y); ctx.rotate([ -Math.PI/2, 0, Math.PI/2, Math.PI ][dir]);
  const w=size*1.1, h=size*0.9;

  ctx.shadowColor = color;
  ctx.shadowBlur = frozen? 8 : 18;
  ctx.beginPath();
  ctx.moveTo(-w/2, h/2); ctx.lineTo(0, -h/2); ctx.lineTo(w/2, h/2); ctx.closePath();
  const grd = ctx.createLinearGradient(-w/2,-h/2, w/2,h/2);
  grd.addColorStop(0, frozen? '#8af1ff' : color);
  grd.addColorStop(1, '#ffffff22');
  ctx.fillStyle = grd; ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth=2; ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(-size*0.2, -size*0.06, size*0.09, 0, Math.PI*2);
  ctx.arc(size*0.2, -size*0.06, size*0.09, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#0b1020';
  ctx.beginPath(); ctx.arc(-size*0.2, -size*0.06, size*0.045, 0, Math.PI*2);
  ctx.arc(size*0.2, -size*0.06, size*0.045, 0, Math.PI*2); ctx.fill();

  ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.moveTo(-w*0.32, h*0.15); ctx.lineTo(w*0.32, h*0.15); ctx.stroke();
  ctx.restore();
}
