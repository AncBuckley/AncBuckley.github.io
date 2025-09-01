// Animation state and drawing for Moose Man
const MooseMan = {
    computeAnim(player, dir) {
        // Return animation state (e.g., for limb swing, cape, etc.)
        return { t: performance.now() % 1000 / 1000, dir };
    },
    draw(ctx, x, y, radius, dir, invuln, anim) {
        ctx.save();
        ctx.translate(x, y);
        // Head (always up)
        ctx.beginPath();
        ctx.arc(0, -radius * 0.2, radius * 0.6, 0, 2 * Math.PI);
        ctx.fillStyle = invuln ? '#ff8' : '#fff';
        ctx.fill();
        // Antlers
        ctx.strokeStyle = '#b97';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-radius * 0.3, -radius * 0.7);
        ctx.lineTo(-radius * 0.6, -radius * 1.1);
        ctx.moveTo(radius * 0.3, -radius * 0.7);
        ctx.lineTo(radius * 0.6, -radius * 1.1);
        ctx.stroke();
        // Body
        ctx.beginPath();
        ctx.ellipse(0, radius * 0.5, radius * 0.5, radius * 0.7, 0, 0, 2 * Math.PI);
        ctx.fillStyle = '#a85';
        ctx.fill();
        // Cape (billows opposite movement)
        ctx.save();
        ctx.rotate(Math.atan2(-dir[0], dir[1]));
        ctx.beginPath();
        ctx.moveTo(0, radius * 0.7);
        ctx.bezierCurveTo(-radius * 0.5, radius * 1.2, radius * 0.5, radius * 1.2, 0, radius * 0.7);
        ctx.fillStyle = '#36a';
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.restore();
        // Arms/legs (simple swing)
        ctx.strokeStyle = '#a85';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(-radius * 0.3, radius * 0.2);
        ctx.lineTo(-radius * 0.5, radius * 0.7);
        ctx.moveTo(radius * 0.3, radius * 0.2);
        ctx.lineTo(radius * 0.5, radius * 0.7);
        ctx.stroke();
        ctx.restore();
    }
};
export default MooseMan;
