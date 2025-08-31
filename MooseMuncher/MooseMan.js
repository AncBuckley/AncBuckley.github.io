// MooseMan.js
// Exports a function to draw the player character with simple animation support.

export default function MooseMan(ctx, x, y, tile, dir = 1, anim = 0) {
    // Simple "MooseMan" drawing: a brown body, antlers, and a face.
    ctx.save();
    ctx.translate(x, y);
    // Direction: 0=UP, 1=RIGHT, 2=DOWN, 3=LEFT
    ctx.rotate((dir ?? 1) * (Math.PI / 2));
    // Body
    ctx.fillStyle = "#a0522d";
    ctx.beginPath();
    ctx.ellipse(0, 0, tile * 0.28, tile * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    // Head
    ctx.beginPath();
    ctx.ellipse(0, -tile * 0.22, tile * 0.18, tile * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    // Antlers
    ctx.strokeStyle = "#deb887";
    ctx.lineWidth = tile * 0.04;
    ctx.beginPath();
    ctx.moveTo(-tile * 0.09, -tile * 0.32);
    ctx.lineTo(-tile * 0.22, -tile * 0.44);
    ctx.moveTo(tile * 0.09, -tile * 0.32);
    ctx.lineTo(tile * 0.22, -tile * 0.44);
    ctx.stroke();
    // Eyes
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(-tile * 0.05, -tile * 0.23, tile * 0.025, 0, Math.PI * 2);
    ctx.arc(tile * 0.05, -tile * 0.23, tile * 0.025, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.arc(-tile * 0.05, -tile * 0.23, tile * 0.012, 0, Math.PI * 2);
    ctx.arc(tile * 0.05, -tile * 0.23, tile * 0.012, 0, Math.PI * 2);
    ctx.fill();
    // Smile
    ctx.strokeStyle = "#222";
    ctx.lineWidth = tile * 0.012;
    ctx.beginPath();
    ctx.arc(0, -tile * 0.19, tile * 0.04, 0, Math.PI);
    ctx.stroke();
    ctx.restore();
}
