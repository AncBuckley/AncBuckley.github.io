// Owl.js
export function drawOwl(ctx, x, y, tile) {
    ctx.save();
    ctx.translate(x, y);
    // Body
    ctx.fillStyle = "#a78bfa";
    ctx.beginPath();
    ctx.ellipse(0, 0, tile * 0.22, tile * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = "#fde68a";
    ctx.beginPath();
    ctx.arc(-tile * 0.06, -tile * 0.08, tile * 0.03, 0, Math.PI * 2);
    ctx.arc(tile * 0.06, -tile * 0.08, tile * 0.03, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.arc(-tile * 0.06, -tile * 0.08, tile * 0.012, 0, Math.PI * 2);
    ctx.arc(tile * 0.06, -tile * 0.08, tile * 0.012, 0, Math.PI * 2);
    ctx.fill();
    // Beak
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.moveTo(0, -tile * 0.04);
    ctx.lineTo(-tile * 0.015, tile * 0.02);
    ctx.lineTo(tile * 0.015, tile * 0.02);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}
