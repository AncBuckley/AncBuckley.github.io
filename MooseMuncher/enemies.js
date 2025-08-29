// enemies.js — enemy creation, AI, updates, and drawing
// Exports:
//   createEnemies({gridW,gridH,level,stepMs})
//   updateEnemies(enemies, {gridW,gridH,player,stepMs,freezeUntil,passable,clampTo})
//   drawEnemies(ctx, enemies, {padX,padY,tile})
//   notifyBoardHooksForEnemies(hooks)  // { isCellEmpty(gx,gy), placeWordAt(gx,gy), onPlayerCaught(index) }
//   moveEnemyToBottomRight(enemies, index, gridW, gridH)

import { drawOwl } from './Owl.js';
import { drawSlime } from './Slime.js';

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

export function drawEnemy(ctx, enemy, x, y, tile, frozen) {
    if (enemy.kind === 'slime') {
        drawSlime(ctx, x, y, tile, frozen);
    } else {
        drawOwl(ctx, x, y, tile, frozen);
    }
}
