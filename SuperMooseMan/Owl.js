export function drawOwl(ctx, cx, cy, tile, frozen) {
    ctx.save();
    ctx.translate(cx, cy);
    let r = tile * 0.38;
    // Body
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.7, r, 0, 0, 2 * Math.PI);
    ctx.fillStyle = frozen ? '#b8a' : '#84a';
    ctx.fill();
    // Eyes
    ctx.beginPath();
    ctx.arc(-r * 0.25, -r * 0.3, r * 0.18, 0, 2 * Math.PI);
    ctx.arc(r * 0.22, -r * 0.3, r * 0.16, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    // Pupils (right eye slightly higher)
    ctx.beginPath();
    ctx.arc(-r * 0.25, -r * 0.3, r * 0.07, 0, 2 * Math.PI);
    ctx.arc(r * 0.22, -r * 0.28, r * 0.07, 0, 2 * Math.PI);
    ctx.fillStyle = '#222';
    ctx.fill();
    // Glasses
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-r * 0.25, -r * 0.3, r * 0.2, 0, 2 * Math.PI);
    ctx.arc(r * 0.22, -r * 0.3, r * 0.18, 0, 2 * Math.PI);
    ctx.moveTo(-r * 0.05, -r * 0.3); ctx.lineTo(r * 0.05, -r * 0.3);
    ctx.stroke();
    // Beak
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.1);
    ctx.lineTo(-r * 0.05, r * 0.1);
    ctx.lineTo(r * 0.05, r * 0.1);
    ctx.closePath();
    ctx.fillStyle = '#fc3';
    ctx.fill();
    // Feet (always down)
    ctx.strokeStyle = '#fc3';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-r * 0.2, r * 0.95); ctx.lineTo(-r * 0.2, r * 1.15);
    ctx.moveTo(r * 0.2, r * 0.95); ctx.lineTo(r * 0.2, r * 1.15);
    ctx.stroke();
    ctx.restore();
}
