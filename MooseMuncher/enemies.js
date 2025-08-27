// enemies.js — pluggable enemy system (Troggle extracted here)
console.log('[Enemies] loaded v1.0');

const rand = (a,b)=>Math.random()*(b-a)+a;
const randi=(a,b)=>Math.floor(rand(a,b));
const choice=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=randi(0,i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const now=()=>performance.now();

export const ENEMY_STEP_MS = 3000; // one grid step every 3s

// -------- rendering helper (Troggle’s body) --------
function drawTrogglePrimitive(ctx,x,y,size,dir,color,frozen){
  ctx.save(); ctx.translate(x,y); ctx.rotate([-Math.PI/2,0,Math.PI/2,Math.PI][dir]);
  const w=size*1.1,h=size*0.9;
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

// -------- EnemySystem --------
export class EnemySystem {
  /**
   * @param {{DIR_VECT:number[][], passable:(x:number,y:number)=>boolean, getTileAt:(x:number,y:number)=>any, seedTileAt:(x:number,y:number,state:any)=>void, stepMs?:number}} api
   */
  constructor(api){
    this.api = { stepMs: ENEMY_STEP_MS, ...api };
    this.registry = new Map(); // id -> type
  }
  register(type){ this.registry.set(type.id, type); return this; }
  get(id){ return this.registry.get(id); }
  listTypes(){ return [...this.registry.values()]; }

  spawnForLevel(state, {mix}={}){
    const types = mix && mix.length ? mix.map(id=>this.get(id)).filter(Boolean) : [this.listTypes()[0]];
    if(!types.length) throw new Error('No enemy types registered');

    const base = state.level<=3?2 : state.level<=6?3 : 4;
    const n = clamp(base + (state.level>6?1:0), 2, 6);

    const entities=[];
    const occupied=new Set([`0,0`]);
    const t0=now();

    for(let i=0;i<n;i++){
      // choose a type (support mixed spawns later)
      const T = choice(types);
      // find a spawn cell away from (0,0)
      let gx=randi(0,state.gridW), gy=randi(0,state.gridH), tries=0;
      while( (Math.abs(gx-0)+Math.abs(gy-0)) < Math.floor((state.gridW+state.gridH)/4) || occupied.has(`${gx},${gy}`) ){
        gx=randi(0,state.gridW); gy=randi(0,state.gridH); if(++tries>50) break;
      }
      occupied.add(`${gx},${gy}`);

      const e = T.create({gx,gy, t0, index:i, state});
      e.type = T.id;
      e.nextStepAt = t0 + this.api.stepMs + i*150;
      entities.push(e);
    }

    state.enemies = entities; // keep compatibility with existing code
  }

  resetTimers(state){
    const t = now();
    for(const e of (state.enemies||[])) e.nextStepAt = t + this.api.stepMs;
  }

  update(state){
    if(!state.enemies) return;
    const frozen = now() < state.freezeUntil;
    if(frozen) return;
    for(const e of state.enemies){
      if(now() >= e.nextStepAt){
        const T = this.get(e.type); if(!T) continue;
        e.nextStepAt = now() + this.api.stepMs;
        const dir = T.pickDirection(e, state, this.api);
        const [dx,dy] = this.api.DIR_VECT[dir] || [0,0];
        const nx = e.gx + dx, ny = e.gy + dy;
        if(this.api.passable(nx,ny)){
          e.gx=nx; e.gy=ny; e.x=nx; e.y=ny; e.dir=dir;
          T.onLand?.(e, state, this.api);
        }
      }
    }
  }

  draw(ctx, state, padX, padY, tile){
    if(!state.enemies) return;
    for(const e of state.enemies){
      const T = this.get(e.type); if(!T) continue;
      T.draw(ctx, e, padX, padY, tile, state, this.api);
    }
  }

  getAll(state){ return state.enemies || []; }
}

// -------- Troggle type --------
const TROGGLE_COLORS = ['#ff3b6b','#ffb800','#00e5ff','#7cff00','#ff00e5','#ff7a00','#00ffb3','#ffd700','#00ffd0','#ff4d00'];

function computeSeedCorrectProb(state){
  const uneaten = state.items.filter(t=>!t.eaten);
  const correct = uneaten.filter(t=>t.correct).length;
  const ratio = uneaten.length ? correct/uneaten.length : 0;
  let p = clamp(0.7 - 0.6*ratio, 0.12, 0.88);
  if (correct <= 2) p = Math.max(p, 0.80);
  return p;
}
function seedTileAtDefault(gx,gy,state,api){
  const tile = api.getTileAt(gx,gy);
  if(!tile || !tile.eaten) return;
  const pCorrect = computeSeedCorrectProb(state);

  if(state.category.type==='word'){
    const corr = state.category.getCorrectList?.() || [];
    const dist = state.category.getDistractorList?.() || [];
    let makeCorrect = Math.random() < pCorrect && corr.length>0;
    if(!makeCorrect && dist.length===0 && corr.length>0) makeCorrect = true;
    const pick = makeCorrect ? choice(corr) : (dist.length ? choice(dist) : choice(corr));
    const c = state.category;
    const normalized = c.labelCase==='title' ? String(pick).replace(/\b\w/g,m=>m.toUpperCase())
                    : c.labelCase==='upper' ? String(pick).toUpperCase()
                    : String(pick);
    tile.label=normalized; tile.value=String(pick); tile.correct=makeCorrect;
  }else{
    const c = state.category;
    let n;
    if(Math.random()<pCorrect){
      for(let i=0;i<50;i++){ n=randi(c.min, c.max+1); if(c.test(n)) break; }
      tile.correct=true;
    }else{
      for(let i=0;i<50;i++){ n=randi(c.min, c.max+1); if(!c.test(n)) break; }
      tile.correct=false;
    }
    tile.label=String(n); tile.value=n;
  }
  tile.eaten=false;
  if(tile.correct) state.correctRemaining += 1;
}

export function createTroggleType(){
  return {
    id: 'troggle',
    name: 'Troggle',
    create({gx,gy}){
      return { gx, gy, x:gx, y:gy, dir:randi(0,4), color: choice(TROGGLE_COLORS) };
    },
    pickDirection(e, state, api){
      const dirs=[0,1,2,3]; shuffle(dirs);
      let best=e.dir||0, bestDist=Infinity;
      for(const d of dirs){
        const [dx,dy]=api.DIR_VECT[d]; const nx=e.gx+dx, ny=e.gy+dy;
        if(!api.passable(nx,ny)) continue;
        const dist=Math.abs(nx - state.player.gx) + Math.abs(ny - state.player.gy);
        if(dist<bestDist){bestDist=dist; best=d;}
      }
      if(Math.random()<0.35) best = choice([0,1,2,3]); // some chaos
      return best;
    },
    onLand(e, state, api){
      // When Troggle lands on an empty (eaten) tile, seed a new word/number
      const s = api.seedTileAt || ((gx,gy)=>seedTileAtDefault(gx,gy,state,api));
      const tile = api.getTileAt(e.gx,e.gy);
      if(tile && tile.eaten) s(e.gx,e.gy,state);
    },
    draw(ctx,e,padX,padY,tile,state){
      const ex = padX + e.x*tile + tile/2;
      const ey = padY + e.y*tile + tile/2;
      const frozen = now() < state.freezeUntil;
      drawTrogglePrimitive(ctx, ex, ey, tile*0.5, e.dir||0, e.color, frozen);
    }
  };
}
