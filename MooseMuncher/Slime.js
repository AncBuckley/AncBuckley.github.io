// Slime.js
export function drawSlime(ctx, x, y, tile, animT = 0) {
    const size = tile * 0.34 * 0.75;
    const w = size * 1.5, h = size * 1.25;
    ctx.save();
    ctx.translate(x, y);

    // Body blob (jiggle)
    const jiggle = Math.sin(animT * 2 + performance.now() / 220) * (h * 0.04);
    ctx.beginPath();
    ctx.moveTo(-w * 0.45, -h * 0.10 + jiggle);
    ctx.bezierCurveTo(-w * 0.60, -h * 0.55 + jiggle, w * 0.60, -h * 0.55 + jiggle, w * 0.45, -h * 0.10 + jiggle);
    ctx.bezierCurveTo(w * 0.55, h * 0.35, -w * 0.55, h * 0.35, -w * 0.45, -h * 0.10 + jiggle);
    const bodyGrad = ctx.createLinearGradient(-w, -h, w, h);
    bodyGrad.addColorStop(0, '#3ff1c8');
    bodyGrad.addColorStop(1, '#1ec49e');
    ctx.fillStyle = bodyGrad;
    ctx.shadowColor = '#1ec49e';
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Eyes
    ctx.fillStyle = '#fff';
    const eyeR = size * 0.13;
    ctx.beginPath();
    ctx.arc(-size * 0.28, -size * 0.08 + jiggle, eyeR, 0, Math.PI * 2);
    ctx.arc(size * 0.28, -size * 0.08 + jiggle, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0b1020';
    ctx.beginPath();
    ctx.arc(-size * 0.28, -size * 0.08 + jiggle, eyeR * 0.55, 0, Math.PI * 2);
    ctx.arc(size * 0.28, -size * 0.08 + jiggle, eyeR * 0.55, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = 'rgba(0,0,0,.5)';
    ctx.lineWidth = Math.max(1.2, size * 0.08);
    ctx.beginPath();
    ctx.arc(0, size * 0.05 + jiggle, size * 0.22, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    // Drips (always down)
    const dripCount = 3;
    for (let i = 0; i < dripCount; i++) {
        const t = (performance.now() / 700 + i * 0.27) % 1;
        const dx = -w * 0.25 + i * (w * 0.25);
        const len = h * 0.28 * (0.25 + 0.75 * (1 - Math.abs(2 * t - 1)));
        const tip = h * 0.38 + len;
        ctx.strokeStyle = 'rgba(48,220,180,0.9)';
        ctx.lineWidth = size * 0.10;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(dx, h * 0.30);
        ctx.lineTo(dx, tip);
        ctx.stroke();
        ctx.fillStyle = '#4ef0c7';
        ctx.beginPath();
        ctx.ellipse(dx, tip + size * 0.10, size * 0.10, size * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}