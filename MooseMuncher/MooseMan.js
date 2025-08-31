// MooseMan.js
// Draws a superhero moose in a green costume, with flying animation when moving.

export default function MooseMan(ctx, x, y, tile, dir = 1, isFlying = false, animT = 0) {
    ctx.save();
    ctx.translate(x, y);

    // Always upright (no rotation)
    // Flying animation: bob up/down and arms out
    let flyBob = isFlying ? Math.sin(animT * 10) * tile * 0.06 : 0;
    let armAngle = isFlying ? -Math.PI / 3 : -Math.PI / 6;

    // Cape
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = "#1de9b6";
    ctx.beginPath();
    ctx.moveTo(0, tile * 0.12 + flyBob);
    ctx.bezierCurveTo(tile * 0.18, tile * 0.32, tile * 0.18, tile * 0.6, 0, tile * 0.7);
    ctx.bezierCurveTo(-tile * 0.18, tile * 0.6, -tile * 0.18, tile * 0.32, 0, tile * 0.12 + flyBob);
    ctx.fill();
    ctx.restore();

    // Body (green suit)
    ctx.save();
    ctx.fillStyle = "#2ecc40";
    ctx.beginPath();
    ctx.ellipse(0, tile * 0.12 + flyBob, tile * 0.22, tile * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Arms (flying out or at side)
    ctx.save();
    ctx.strokeStyle = "#2ecc40";
    ctx.lineWidth = tile * 0.08;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, tile * 0.12 + flyBob);
    ctx.lineTo(tile * 0.22 * Math.cos(armAngle), tile * 0.12 + flyBob + tile * 0.22 * Math.sin(armAngle));
    ctx.moveTo(0, tile * 0.12 + flyBob);
    ctx.lineTo(-tile * 0.22 * Math.cos(armAngle), tile * 0.12 + flyBob + tile * 0.22 * Math.sin(armAngle));
    ctx.stroke();
    ctx.restore();

    // Head
    ctx.save();
    ctx.fillStyle = "#a0522d";
    ctx.beginPath();
    ctx.ellipse(0, -tile * 0.13 + flyBob, tile * 0.16, tile * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Antlers
    ctx.save();
    ctx.strokeStyle = "#deb887";
    ctx.lineWidth = tile * 0.04;
    ctx.beginPath();
    ctx.moveTo(-tile * 0.09, -tile * 0.23 + flyBob);
    ctx.lineTo(-tile * 0.22, -tile * 0.34 + flyBob);
    ctx.moveTo(tile * 0.09, -tile * 0.23 + flyBob);
    ctx.lineTo(tile * 0.22, -tile * 0.34 + flyBob);
    ctx.stroke();
    ctx.restore();

    // Mask (superhero)
    ctx.save();
    ctx.fillStyle = "#009688";
    ctx.beginPath();
    ctx.ellipse(0, -tile * 0.13 + flyBob, tile * 0.16, tile * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Eyes
    ctx.save();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(-tile * 0.05, -tile * 0.15 + flyBob, tile * 0.018, 0, Math.PI * 2);
    ctx.arc(tile * 0.05, -tile * 0.15 + flyBob, tile * 0.018, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.arc(-tile * 0.05, -tile * 0.15 + flyBob, tile * 0.008, 0, Math.PI * 2);
    ctx.arc(tile * 0.05, -tile * 0.15 + flyBob, tile * 0.008, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Smile
    ctx.save();
    ctx.strokeStyle = "#222";
    ctx.lineWidth = tile * 0.012;
    ctx.beginPath();
    ctx.arc(0, -tile * 0.10 + flyBob, tile * 0.04, 0, Math.PI);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
}
