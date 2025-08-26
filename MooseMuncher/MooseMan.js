// MooseMan.js — character module for MuncherJS
// Exports a single character with animation & drawing logic.

const clamp = (v,a,b)=> Math.min(b, Math.max(a,v));
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

function roundRect(ctx,x,y,w,h,r){
  const rr = Math.min(r, w/2, h/2);
  ctx.moveTo(x+rr,y); ctx.arcTo(x+w,y,x+w,y+h,rr); ctx.arcTo(x+w,y+h,x,y+h,rr);
  ctx.arcTo(x,y+h,x,y,rr); ctx.arcTo(x,y,x+w,y,rr);
}

const MooseMan = {
  id: 'mooseman',
  name: 'Moose Man',

  // Compute animation state from player movement.
  computeAnim(player, DIR_VECT){
    if(!player) return {moving:false, phase:0, vx:0, vy:0, tilt:0, yOffset:0, capeDX:0, capeDY:0, armSwing:0, legSwing:0, capeWiggle:0};
    const moving = !!player.moving;
    const phase = moving ? clamp((performance.now()-player.moving.start)/player.moving.dur, 0, 1) : ((performance.now() % 1000) / 1000);

    // Movement vector: current tween or last facing
    let vx = 0, vy = 0;
    if(moving){ vx = (player.moving.toX - player.moving.fromX); vy = (player.moving.toY - player.moving.fromY); }
    else { const v = DIR_VECT[player.dir] || [0,0]; vx = v[0]; vy = v[1]; }

    // Flying when left/right/up; jumping look when moving down
    const flying = (vx !== 0 || vy < 0);

    // Small lean into horizontal movement, tiny forward for up, tiny back for down
    let tilt = clamp(vx * 0.18 + (vy < 0 ? -0.04 : vy > 0 ? 0.06 : 0), -0.25, 0.25);

    // Vertical bob: gentle for flying, bigger arc for jump (down). Idle hover when not moving.
    let yOffset = flying ? -Math.sin(Math.PI*phase) * 0.18 : -Math.sin(Math.PI*phase) * 0.45;
    if(!moving) yOffset = Math.sin(performance.now()/600) * 0.06;

    // Cape drag opposite movement + time wiggle
    const speedPulse = moving ? Math.sin(Math.PI*phase) : 0.2;
    const capeDX = -vx * (0.6*speedPulse + 0.15);
    const capeDY = -vy * (0.6*speedPulse + 0.15);
    const capeWiggle = Math.sin(performance.now()/130 + phase*3);

    // Limb swing (arms a bit faster than legs)
    const armSwing = (moving ? Math.sin(Math.PI*phase*2) : Math.sin(performance.now()/350)) * 0.9;
    const legSwing = (moving ? Math.sin(Math.PI*phase*2 + Math.PI/2) : Math.sin(performance.now()/420)) * 0.8;

    return { moving, phase, vx, vy, tilt, yOffset, capeDX, capeDY, armSwing, legSwing, capeWiggle };
  },

  // Draw the character. Head stays up; cape billows opposite movement; limbs swing.
  draw(ctx,x,y,radius,dir,invuln,anim={}){
    ctx.save();
    ctx.translate(x,y);

    // Keep head up — no whole-body rotation by movement direction
    const tilt = anim.tilt || 0;
    const yShift = (anim.yOffset || 0) * radius;
    ctx.rotate(tilt);
    ctx.translate(0, yShift);

    const bodyW = radius*1.05;
    const bodyH = radius*1.7;

    // ---- Cape (billows opposite movement) ----
    ctx.save();
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = 14;

    const windX = (anim.capeDX||0) * bodyH * 0.35;
    const windY = (anim.capeDY||0) * bodyH * 0.18;
    const wiggle = (anim.capeWiggle||0) * bodyH * 0.12;

    const cx0 = -bodyW*0.55 + windX*0.3;
    const cy0 = -bodyH*0.3  + windY*0.2;

    ctx.beginPath();
    ctx.moveTo(cx0, cy0);
    ctx.bezierCurveTo(-bodyW*1.2 + windX*0.6, cy0 + bodyH*0.2 + wiggle*0.2 + windY*0.2,
                      -bodyW*0.8 + windX*0.9, cy0 + bodyH*0.9 + wiggle + windY*0.8,
                      -bodyW*0.1 + windX*0.6, cy0 + bodyH*0.8 + wiggle*0.6 + windY*0.7);
    ctx.bezierCurveTo(bodyW*0.3 + windX*0.2, cy0 + bodyH*0.7 + wiggle*0.2 + windY*0.5,
                      bodyW*0.5,            cy0 + bodyH*0.1 + wiggle*0.1 + windY*0.3,
                      bodyW*0.1,            cy0 + bodyH*0.05+ wiggle*0.05+ windY*0.1);
    ctx.closePath();

    const capeGrad = ctx.createLinearGradient(cx0, cy0, bodyW*0.2, cy0+bodyH*0.8);
    capeGrad.addColorStop(0, '#34d399'); capeGrad.addColorStop(1, '#059669');
    ctx.fillStyle = capeGrad; ctx.fill();
    ctx.restore();

    // ---- Torso (green suit) ----
    const torsoX = -bodyW/2, torsoY = -bodyH*0.55, torsoW = bodyW, torsoH = bodyH*1.05;
    const torsoGrad = ctx.createLinearGradient(0, torsoY, 0, torsoY+torsoH);
    torsoGrad.addColorStop(0, '#4ade80'); torsoGrad.addColorStop(1, '#065f46');
    ctx.beginPath(); ctx.fillStyle = torsoGrad; roundRect(ctx, torsoX, torsoY, torsoW, torsoH, 12); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.22)'; ctx.lineWidth=1.5; ctx.stroke();

    // ---- Belt ----
    ctx.fillStyle = '#9cff6d';
    ctx.fillRect(torsoX+4, -bodyH*0.02, torsoW-8, radius*0.18);

    // ---- Emblem (M) ----
    const emX = 0, emY = -bodyH*0.1;
    ctx.beginPath();
    ctx.moveTo(emX, emY - radius*0.18);
    ctx.lineTo(emX + radius*0.16, emY);
    ctx.lineTo(emX, emY + radius*0.18);
    ctx.lineTo(emX - radius*0.16, emY);
    ctx.closePath();
    ctx.fillStyle = '#0f5132'; ctx.fill();
    ctx.fillStyle = '#9cff6d';
    ctx.font = `${Math.max(10, Math.floor(radius*0.34))}px ui-sans-serif, system-ui`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('M', emX, emY+1);

    // ---- Moose Head (always up) ----
    const headR = radius*0.45; const hx = 0, hy = -bodyH*0.95;
    ctx.fillStyle = '#8b5e34';
    ctx.beginPath(); ctx.arc(hx, hy, headR, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#c79a67';
    ctx.beginPath(); ctx.ellipse(hx, hy + headR*0.25, headR*0.9, headR*0.55, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#231f20';
    ctx.beginPath(); ctx.arc(hx - headR*0.18, hy + headR*0.28, headR*0.08, 0, Math.PI*2);
    ctx.arc(hx + headR*0.18, hy + headR*0.28, headR*0.08, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff';
    ctx.beginPath(); ctx.arc(hx - headR*0.28, hy - headR*0.15, headR*0.12, 0, Math.PI*2);
    ctx.arc(hx + headR*0.28, hy - headR*0.15, headR*0.12, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle='#0b1020';
    ctx.beginPath(); ctx.arc(hx - headR*0.28, hy - headR*0.15, headR*0.06, 0, Math.PI*2);
    ctx.arc(hx + headR*0.28, hy - headR*0.15, headR*0.06, 0, Math.PI*2); ctx.fill();

    // ears
    ctx.fillStyle = '#8b5e34';
    ctx.beginPath();
    ctx.moveTo(hx - headR*0.65, hy - headR*0.2);
    ctx.quadraticCurveTo(hx - headR*0.8, hy - headR*0.55, hx - headR*0.4, hy - headR*0.45);
    ctx.quadraticCurveTo(hx - headR*0.55, hy - headR*0.25, hx - headR*0.65, hy - headR*0.2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx + headR*0.65, hy - headR*0.2);
    ctx.quadraticCurveTo(hx + headR*0.8, hy - headR*0.55, hx + headR*0.4, hy - headR*0.45);
    ctx.quadraticCurveTo(hx + headR*0.55, hy - headR*0.25, hx + headR*0.65, hy - headR*0.2); ctx.fill();

    // antlers
    const antler = (side)=>{
      const s = side===-1? -1: 1;
      ctx.save();
      ctx.translate(hx + s*headR*0.2, hy - headR*0.65);
      ctx.scale(s,1);
      ctx.fillStyle = '#e9d8a6';
      ctx.strokeStyle = 'rgba(0,0,0,.2)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.bezierCurveTo(headR*0.4, -headR*0.2, headR*0.8, -headR*0.6, headR*1.1, -headR*0.7);
      ctx.bezierCurveTo(headR*0.9, -headR*0.4, headR*0.9, -headR*0.2, headR*0.7, -headR*0.05);
      ctx.bezierCurveTo(headR*0.8, -headR*0.05, headR*0.9, -headR*0.02, headR*1.0, 0);
      ctx.bezierCurveTo(headR*0.8, headR*0.05, headR*0.4, headR*0.05, 0, 0);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      const tine = (tx,ty,len)=>{ ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(tx+len, ty - headR*0.18); ctx.lineWidth=1.3; ctx.stroke(); };
      tine(headR*0.45, -headR*0.35, headR*0.35);
      tine(headR*0.65, -headR*0.5, headR*0.3);
      tine(headR*0.85, -headR*0.6, headR*0.25);
      ctx.restore();
    };
    antler(-1); antler(1);

    // ---- Limbs with swing ----
    ctx.strokeStyle='#e6f0ff';
    ctx.lineWidth=Math.max(2, radius*0.12);
    ctx.lineCap='round';

    const armLen  = bodyH*0.45;
    const armBaseY= -bodyH*0.25;
    const swingA  = anim.armSwing || 0;

    ctx.beginPath();
    // left arm
    ctx.moveTo(-bodyW*0.42, armBaseY);
    ctx.lineTo(-bodyW*0.42 - armLen*0.6, armBaseY + armLen*(0.2 + 0.25*swingA));
    // right arm
    ctx.moveTo( bodyW*0.42, armBaseY);
    ctx.lineTo( bodyW*0.42 + armLen*0.6, armBaseY + armLen*(0.2 - 0.25*swingA));
    ctx.stroke();

    const legLen  = bodyH*0.55;
    const legBaseY= bodyH*0.42;
    const swingL  = anim.legSwing || 0;

    ctx.beginPath();
    // left leg
    ctx.moveTo(-bodyW*0.25, legBaseY);
    ctx.lineTo(-bodyW*0.25 - legLen*0.15*swingL, legBaseY + legLen*(0.35 - 0.25*swingL));
    // right leg
    ctx.moveTo( bodyW*0.25, legBaseY);
    ctx.lineTo( bodyW*0.25 + legLen*0.15*swingL, legBaseY + legLen*(0.35 + 0.25*swingL));
    ctx.stroke();

    // ---- Invulnerability ring ----
    if(invuln){
      ctx.globalAlpha=0.6; ctx.strokeStyle='#9cff6d'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(0, -bodyH*0.2, radius*1.1, 0, Math.PI*2); ctx.stroke();
    }

    ctx.restore();
  }
};

export default MooseMan;
