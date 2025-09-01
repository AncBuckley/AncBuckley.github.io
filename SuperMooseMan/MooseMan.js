// MooseMan.js
const MooseMan = {
    draw(ctx, x, y, size, dir, teleporting, anim) {
        ctx.save();
        ctx.translate(x, y);

        // Bobbing animation
        let t = (performance.now() / 400) % (2 * Math.PI);
        ctx.translate(0, Math.sin(t) * size * 0.07);

        // Directional facing
        let angle = 0;
        if (dir && (dir[0] !== 0 || dir[1] !== 0)) {
            angle = Math.atan2(dir[1], dir[0]);
        }

        // --- Cape trailing angle ---
        // Cape trails opposite to movement, with a little flutter
        let capeAngle = angle + Math.PI + Math.sin(performance.now() / 200) * 0.18;

        // --- Body/limbs rotate with movement ---
        ctx.save();
        ctx.rotate(angle);

        // --- Cape ---
        ctx.save();
        ctx.rotate(capeAngle - angle); // rotate relative to body
        ctx.beginPath();
        ctx.moveTo(0, size * 0.2);
        ctx.bezierCurveTo(
            -size * 0.7, size * 0.7 + Math.sin(t) * size * 0.08,
            size * 0.7, size * 0.7 - Math.sin(t) * size * 0.08,
            0, size * 1.2
        );
        ctx.closePath();
        ctx.fillStyle = "#b22"; // Red cape
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();

        // --- Body (super suit) ---
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(0, size * 0.45, size * 0.32, size * 0.45, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#2a4cff"; // Blue suit
        ctx.fill();
        ctx.restore();

        // --- Belt ---
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(0, size * 0.75, size * 0.25, size * 0.07, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#ffcc00";
        ctx.fill();
        ctx.restore();

        // --- Chest Emblem ---
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, size * 0.35, size * 0.11, 0, Math.PI * 2);
        ctx.fillStyle = "#ffcc00";
        ctx.fill();
        ctx.font = `bold ${Math.floor(size * 0.13)}px sans-serif`;
        ctx.fillStyle = "#2a4cff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("M", 0, size * 0.35);
        ctx.restore();

        // --- Arm/leg swing animation ---
        let swing = Math.sin(performance.now() / 200) * 0.18 * (dir && (dir[0] !== 0 || dir[1] !== 0) ? 1 : 0);

        // --- Arms (with gloves) ---
        // Left arm
        ctx.save();
        ctx.rotate(-swing);
        ctx.beginPath();
        ctx.moveTo(-size * 0.28, size * 0.25);
        ctx.lineTo(-size * 0.5, size * 0.55);
        ctx.lineWidth = size * 0.13;
        ctx.strokeStyle = "#2a4cff";
        ctx.lineCap = "round";
        ctx.stroke();
        // Glove
        ctx.beginPath();
        ctx.arc(-size * 0.5, size * 0.55, size * 0.09, 0, Math.PI * 2);
        ctx.fillStyle = "#ffcc00";
        ctx.fill();
        ctx.restore();

        // Right arm
        ctx.save();
        ctx.rotate(swing);
        ctx.beginPath();
        ctx.moveTo(size * 0.28, size * 0.25);
        ctx.lineTo(size * 0.5, size * 0.55);
        ctx.lineWidth = size * 0.13;
        ctx.strokeStyle = "#2a4cff";
        ctx.lineCap = "round";
        ctx.stroke();
        // Glove
        ctx.beginPath();
        ctx.arc(size * 0.5, size * 0.55, size * 0.09, 0, Math.PI * 2);
        ctx.fillStyle = "#ffcc00";
        ctx.fill();
        ctx.restore();

        // --- Legs (with boots) ---
        // Left leg
        ctx.save();
        ctx.rotate(swing);
        ctx.beginPath();
        ctx.moveTo(-size * 0.13, size * 0.85);
        ctx.lineTo(-size * 0.13, size * 1.15);
        ctx.lineWidth = size * 0.13;
        ctx.strokeStyle = "#2a4cff";
        ctx.lineCap = "round";
        ctx.stroke();
        // Boot
        ctx.beginPath();
        ctx.arc(-size * 0.13, size * 1.15, size * 0.09, 0, Math.PI * 2);
        ctx.fillStyle = "#ffcc00";
        ctx.fill();
        ctx.restore();

        // Right leg
        ctx.save();
        ctx.rotate(-swing);
        ctx.beginPath();
        ctx.moveTo(size * 0.13, size * 0.85);
        ctx.lineTo(size * 0.13, size * 1.15);
        ctx.lineWidth = size * 0.13;
        ctx.strokeStyle = "#2a4cff";
        ctx.lineCap = "round";
        ctx.stroke();
        // Boot
        ctx.beginPath();
        ctx.arc(size * 0.13, size * 1.15, size * 0.09, 0, Math.PI * 2);
        ctx.fillStyle = "#ffcc00";
        ctx.fill();
        ctx.restore();

        ctx.restore(); // End body/limbs/cape rotation

        // --- Head (moose) always upright ---
        ctx.save();
        // Do not rotate with body, so head is always up
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.28, size * 0.23, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#a87b4a"; // Moose brown
        ctx.fill();
        ctx.restore();

        // --- Snout ---
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(0, size * 0.13, size * 0.13, size * 0.09, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#c9a06c";
        ctx.fill();
        // Nostrils
        ctx.beginPath();
        ctx.arc(-size * 0.04, size * 0.17, size * 0.018, 0, Math.PI * 2);
        ctx.arc(size * 0.04, size * 0.17, size * 0.018, 0, Math.PI * 2);
        ctx.fillStyle = "#6b4b2a";
        ctx.fill();
        ctx.restore();

        // --- Eyes ---
        ctx.save();
        ctx.beginPath();
        ctx.arc(-size * 0.09, -size * 0.03, size * 0.04, 0, Math.PI * 2);
        ctx.arc(size * 0.09, -size * 0.03, size * 0.04, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        // Pupils
        ctx.beginPath();
        ctx.arc(-size * 0.09, -size * 0.03, size * 0.018, 0, Math.PI * 2);
        ctx.arc(size * 0.09, -size * 0.03, size * 0.018, 0, Math.PI * 2);
        ctx.fillStyle = "#222";
        ctx.fill();
        ctx.restore();

        // --- Antlers ---
        function drawAntler(side) {
            ctx.save();
            ctx.strokeStyle = "#e6d8b8";
            ctx.lineWidth = size * 0.08;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(side * size * 0.18, -size * 0.13);
            ctx.lineTo(side * size * 0.38, -size * 0.32);
            ctx.lineTo(side * size * 0.48, -size * 0.18);
            ctx.moveTo(side * size * 0.32, -size * 0.28);
            ctx.lineTo(side * size * 0.36, -size * 0.42);
            ctx.moveTo(side * size * 0.38, -size * 0.32);
            ctx.lineTo(side * 0.54 * size, -size * 0.38);
            ctx.stroke();
            ctx.restore();
        }
        drawAntler(1);
        drawAntler(-1);

        ctx.restore();
    }
};

export default MooseMan;
