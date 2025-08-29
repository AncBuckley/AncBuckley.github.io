// Owl.js
export function drawOwl(ctx, x, y, tile, frozen) {
    const size = tile * 0.34; // owl keeps original footprint
    const w = size * 1.45, h = size * 1.7;

    ctx.save();
    ctx.translate(x, y);

    // Body (upright, always; feet point down the screen)
    const grad = ctx.createLinearGradient(0, -h, 0, h);
    grad.addColorStop(0, frozen ? '#b9a7ff' : '#a78bfa'); // purple
    grad.addColorStop(1, frozen ? '#907cfe' : '#7c5cf6');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.55, h * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wings
    ctx.fillStyle = 'rgba(0,0,0,.12)';
    ctx.beginPath(); ctx.ellipse(-w * 0.48, 0, w * 0.26, h * 0.35, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(w * 0.48, 0, w * 0.26, h * 0.35, 0, 0, Math.PI * 2); ctx.fill();

    // Eyes (symmetric)
    const eyeR = size * 0.16;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-size * 0.26, -size * 0.10, eyeR, 0, Math.PI * 2);
    ctx.arc(size * 0.26, -size * 0.10, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(-size * 0.26, -size * 0.10, eyeR * 0.55, 0, Math.PI * 2);
    ctx.arc(size * 0.26, -size * 0.10, eyeR * 0.55, 0, Math.PI * 2);
    ctx.fill();

    // Glasses (identical rims + bridge)
    ctx.strokeStyle = '#2e1065';
    ctx.lineWidth = Math.max(1.5, size * 0.07);
    ctx.beginPath();
    ctx.arc(-size * 0.26, -size * 0.10, eyeR * 1.05, 0, Math.PI * 2);
    ctx.arc(size * 0.26, -size * 0.10, eyeR * 1.05, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-size * 0.12, -size * 0.10);
    ctx.lineTo(size * 0.12, -size * 0.10);
    ctx.stroke();

    // Beak
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.02);
    ctx.lineTo(size * 0.12, size * 0.18);
    ctx.lineTo(-size * 0.12, size * 0.18);
    ctx.closePath(); ctx.fill();

    // Feet (always down)
    ctx.fillStyle = '#fbbf24';
    const fy = h * 0.48;
    for (const sx of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(sx * size * 0.22, fy);
        ctx.lineTo(sx * size * 0.10, fy + size * 0.18);
        ctx.lineTo(sx * size * 0.34, fy + size * 0.18);
        ctx.closePath(); ctx.fill();
    }

    // Rim light
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, w * 0.54, -Math.PI * 0.2, Math.PI * 0.2);
    ctx.stroke();

    ctx.restore();
}
