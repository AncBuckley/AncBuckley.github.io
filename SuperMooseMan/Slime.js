export function drawSlime(ctx, cx, cy, tile, frozen) {
    ctx.save();
    ctx.translate(cx, cy);
    let r = tile * 0.35;
    // Body
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.8, 0, 0, 2 * Math.PI);
    ctx.fillStyle = frozen ? '#8cf' : '#3fa';
    ctx.globalAlpha = 0.85;
    ctx.fill();
    // Gloss
    ctx.beginPath();
    ctx.ellipse(-r * 0.3, -r * 0.3, r * 0.3, r * 0.15, 0, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.3;
    ctx.fill();
    // Drips (always down)
    for (let i = -1; i <= 1; ++i) {
        ctx.beginPath();
        ctx.ellipse(i * r * 0.4, r * 0.7, r * 0.12, r * 0.25, 0, 0, 2 * Math.PI);
        ctx.fillStyle = '#3fa';
        ctx.globalAlpha = 0.7;
        ctx.fill();
    }
    ctx.restore();
}
