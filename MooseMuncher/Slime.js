// Slime.js
export function drawSlime(ctx, x, y, tile, frozen) {
    const size = tile * 0.34 * 0.75; // 25% smaller than before
    const w = size * 1.5, h = size * 1.25;

    ctx.save();
    ctx.translate(x, y);

    // Body blob (upright, no rotation so drips ALWAYS go down)
    const jiggle = Math.sin(performance.now() / 220) * (h * 0.04);
    ctx.beginPath();
    ctx.moveTo(-w * 0.45, -h * 0.10 + jiggle);
    ctx.bezierCurveTo(-w * 0.60, -h * 0.55 + jiggle, w * 0.60, -h * 0.55 + jiggle, w * 0.45, -h * 0.10 + jiggle);
    ctx.bezierCurveTo(w * 0.55, h * 0.35, -w * 0.55, h * 0.35, -w * 0.45, -h * 0.10 + jiggle);
    const bodyGrad = ctx.createLinearGradient(-w, -h, w, h);
    bodyGrad.addColorStop(0, frozen ? '#aef7ff' : '#3ff1c8');
    bodyGrad.addColorStop(1, frozen ? '#7fe9ff' : '#1ec49e');
    ctx.fillStyle = bodyGrad;
    ctx.shadowColor = frozen ? '#9defff' : '#1ec49e';
    ctx.shadowBlur = frozen ? 8 : 14;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Glossy highlight
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-w * 0.18, -h * 0.22 + jiggle, w * 0.35, h * 0.22, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Face (symmetrical)
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
    ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = Math.max(1.2, size * 0.08);
    ctx.beginPath();
    ctx.arc(0, size * 0.05 + jiggle, size * 0.22, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    // Slimy drips downward (regardless of "dir")
    const dripCount = 3;
    for (let i = 0; i < dripCount; i++) {
        const t = (performance.now() / 700 + i * 0.27) % 1;
        const dx = -w * 0.25 + i * (w * 0.25);
        const len = h * 0.28 * (0.25 + 0.75 * (1 - Math.abs(2 * t - 1)));
        const tip = h * 0.38 + len;

        ctx.strokeStyle = frozen ? 'rgba(160,240,255,0.9)' : 'rgba(48,220,180,0.9)';
        ctx.lineWidth = size * 0.10;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(dx, h * 0.30);
        ctx.lineTo(dx, tip);
        ctx.stroke();

        // droplet
        ctx.fillStyle = frozen ? '#bdf2ff' : '#4ef0c7';
        ctx.beginPath();
        ctx.ellipse(dx, tip + size * 0.10, size * 0.10, size * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // Subtle rim light
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-w * 0.48, -h * 0.12 + jiggle);
    ctx.lineTo(-w * 0.10, -h * 0.38 + jiggle);
    ctx.stroke();

    ctx.restore();
}
