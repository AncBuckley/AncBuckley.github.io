// MooseMan.js
const MooseMan = {
    draw(ctx, x, y, size, dir, teleporting, anim) {
        ctx.save();
        ctx.translate(x, y);

        // Animation timers
        const now = performance.now();
        const t = (now / 400) % (2 * Math.PI);

        // Determine movement state
        let moving = dir && (dir[0] !== 0 || dir[1] !== 0);
        let pose = "rest";
        if (moving) {
            if (Math.abs(dir[0]) > Math.abs(dir[1])) {
                pose = "side";
            } else {
                pose = "rear";
            }
        }

        // --- At rest: upright, gentle left-right bounce ---
        if (pose === "rest") {
            ctx.translate(Math.sin(t) * size * 0.08, 0);
            drawUprightMoose(ctx, size, t);
        }
        // --- Side view: flying left or right ---
        else if (pose === "side") {
            // Face left or right
            let flip = dir[0] < 0 ? -1 : 1;
            ctx.scale(flip, 1);
            // Tilt body slightly forward for flying
            ctx.rotate(-0.18 + Math.sin(t) * 0.05);
            // Bob up and down a bit
            ctx.translate(0, Math.sin(t * 2) * size * 0.07);
            drawSideMoose(ctx, size, t, dir[0]);
        }
        // --- Rear view: flying up or down ---
        else if (pose === "rear") {
            // If moving down, flip vertically
            if (dir[1] > 0) ctx.scale(1, -1);
            // Tilt body slightly forward for flying
            ctx.rotate(-0.18 + Math.sin(t) * 0.05);
            // Bob left and right a bit
            ctx.translate(Math.sin(t * 2) * size * 0.07, 0);
            drawRearMoose(ctx, size, t, dir[1]);
        }

        ctx.restore();
    }
};

// --- Drawing helpers ---

function drawUprightMoose(ctx, size, t) {
    // Cape (behind everything)
    drawCape(ctx, size, 0, t, "rest");

    // Body
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, size * 0.45, size * 0.32, size * 0.45, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#2a4cff";
    ctx.fill();
    ctx.restore();

    // Belt
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, size * 0.75, size * 0.25, size * 0.07, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#ffcc00";
    ctx.fill();
    ctx.restore();

    // Chest Emblem
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

    // Arms (down, slightly out, gentle swing)
    let armSwing = Math.sin(t) * 0.12;
    drawArm(ctx, -1, size, 0.25, 0.55, 0.13, t, false, false, armSwing);
    drawArm(ctx, 1, size, 0.25, 0.55, 0.13, t, false, false, -armSwing);

    // Legs (down, gentle swing)
    let legSwing = Math.sin(t + Math.PI) * 0.10;
    drawLeg(ctx, -1, size, 0.85, 1.15, 0.13, t, false, false, legSwing);
    drawLeg(ctx, 1, size, 0.85, 1.15, 0.13, t, false, false, -legSwing);

    // Head and antlers
    drawHeadAndAntlers(ctx, size, t, "front", 0);
}

function drawSideMoose(ctx, size, t, dirX) {
    // Cape (trails behind, more flutter)
    drawCape(ctx, size, Math.PI / 2, t, "side");

    // Body (side ellipse)
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, size * 0.45, size * 0.23, size * 0.45, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#2a4cff";
    ctx.fill();
    ctx.restore();

    // Belt
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, size * 0.75, size * 0.18, size * 0.07, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#ffcc00";
    ctx.fill();
    ctx.restore();

    // Chest Emblem
    ctx.save();
    ctx.beginPath();
    ctx.arc(size * 0.07, size * 0.35, size * 0.09, 0, Math.PI * 2);
    ctx.fillStyle = "#ffcc00";
    ctx.fill();
    ctx.font = `bold ${Math.floor(size * 0.11)}px sans-serif`;
    ctx.fillStyle = "#2a4cff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("M", size * 0.07, size * 0.35);
    ctx.restore();

    // Arms (flying, big swing)
    let armSwing = Math.sin(t * 2) * 0.5;
    drawArm(ctx, -1, size, 0.15, 0.0, 0.13, t, true, false, -armSwing); // back arm
    drawArm(ctx, 1, size, 0.15, 0.7, 0.13, t, true, false, armSwing); // front arm

    // Legs (flying, big swing)
    let legSwing = Math.sin(t * 2 + Math.PI) * 0.4;
    drawLeg(ctx, -1, size, 0.85, 1.15, 0.13, t, true, false, -legSwing); // back leg
    drawLeg(ctx, 1, size, 0.85, 1.15, 0.13, t, true, false, legSwing); // front leg

    // Head and antlers (side, tilt slightly up/down based on direction)
    let headTilt = Math.sin(t) * 0.08 + (dirX > 0 ? -0.08 : 0.08);
    drawHeadAndAntlers(ctx, size, t, "side", headTilt);
}

function drawRearMoose(ctx, size, t, dirY) {
    // Cape (trails behind, more flutter)
    drawCape(ctx, size, 0, t, "rear");

    // Body (rear ellipse)
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, size * 0.45, size * 0.32, size * 0.45, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#2a4cff";
    ctx.fill();
    ctx.restore();

    // Belt
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, size * 0.75, size * 0.25, size * 0.07, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#ffcc00";
    ctx.fill();
    ctx.restore();

    // Chest Emblem (not visible from rear)

    // Arms (out to sides, flying pose, big swing)
    let armSwing = Math.sin(t * 2) * 0.5;
    drawArm(ctx, -1, size, 0.25, 0.25, 0.13, t, true, true, -armSwing);
    drawArm(ctx, 1, size, 0.25, 0.25, 0.13, t, true, true, armSwing);

    // Legs (down, flying pose, big swing)
    let legSwing = Math.sin(t * 2 + Math.PI) * 0.4;
    drawLeg(ctx, -1, size, 0.85, 1.15, 0.13, t, true, true, -legSwing);
    drawLeg(ctx, 1, size, 0.85, 1.15, 0.13, t, true, true, legSwing);

    // Head and antlers (rear, tilt slightly)
    let headTilt = Math.sin(t) * 0.08 + (dirY > 0 ? 0.08 : -0.08);
    drawHeadAndAntlers(ctx, size, t, "rear", headTilt);
}

function drawCape(ctx, size, angle, t, pose) {
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    let flutter = Math.sin(t * (pose === "rest" ? 1 : 2)) * size * (pose === "rest" ? 0.08 : 0.13);
    ctx.moveTo(0, size * 0.2);
    ctx.bezierCurveTo(
        -size * 0.7, size * 0.7 + flutter,
        size * 0.7, size * 0.7 - flutter,
        0, size * 1.2
    );
    ctx.closePath();
    ctx.fillStyle = "#b22";
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
}

function drawArm(ctx, side, size, y1, y2, width, t, flying, rear = false, swing = 0) {
    ctx.save();
    let x1 = side * size * 0.28;
    let x2 = side * size * (flying ? 0.55 : 0.5);
    let yStart = size * y1;
    let yEnd = size * y2;
    // For flying, arms are more forward/back
    if (flying) {
        x2 = side * size * 0.55;
        yEnd = size * (rear ? 0.25 : 0.7);
    }
    // Swing animation
    ctx.translate(x1, yStart);
    ctx.rotate(swing);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(x2 - x1, yEnd - yStart);
    ctx.lineWidth = size * 0.13;
    ctx.strokeStyle = "#2a4cff";
    ctx.lineCap = "round";
    ctx.stroke();
    // Glove
    ctx.beginPath();
    ctx.arc(x2 - x1, yEnd - yStart, size * 0.09, 0, Math.PI * 2);
    ctx.fillStyle = "#ffcc00";
    ctx.fill();
    ctx.restore();
}

function drawLeg(ctx, side, size, y1, y2, width, t, flying, rear = false, swing = 0) {
    ctx.save();
    let x = side * size * 0.13;
    let yStart = size * y1;
    let yEnd = size * y2;
    if (flying) {
        x = side * size * (rear ? 0.18 : 0.13);
        yEnd = size * (rear ? 1.05 : 1.15);
    }
    // Swing animation
    ctx.translate(x, yStart);
    ctx.rotate(swing);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, yEnd - yStart);
    ctx.lineWidth = size * 0.13;
    ctx.strokeStyle = "#2a4cff";
    ctx.lineCap = "round";
    ctx.stroke();
    // Boot
    ctx.beginPath();
    ctx.arc(0, yEnd - yStart, size * 0.09, 0, Math.PI * 2);
    ctx.fillStyle = "#ffcc00";
    ctx.fill();
    ctx.restore();
}

function drawHeadAndAntlers(ctx, size, t, view, tilt = 0) {
    ctx.save();
    ctx.rotate(tilt);
    if (view === "side") {
        ctx.beginPath();
        ctx.ellipse(size * 0.13, 0, size * 0.23, size * 0.18, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#a87b4a";
        ctx.fill();

        // Snout
        ctx.beginPath();
        ctx.ellipse(size * 0.28, size * 0.04, size * 0.09, size * 0.07, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#c9a06c";
        ctx.fill();
        // Nostril
        ctx.beginPath();
        ctx.arc(size * 0.32, size * 0.08, size * 0.018, 0, Math.PI * 2);
        ctx.fillStyle = "#6b4b2a";
        ctx.fill();

        // Eye
        ctx.beginPath();
        ctx.arc(size * 0.19, -size * 0.03, size * 0.04, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(size * 0.19, -size * 0.03, size * 0.018, 0, Math.PI * 2);
        ctx.fillStyle = "#222";
        ctx.fill();

        // Antlers (side)
        drawAntlerSide(ctx, size, 1);
    } else if (view === "rear") {
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.28, size * 0.23, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#a87b4a";
        ctx.fill();
        // Antlers (rear)
        drawAntlerRear(ctx, size);
    } else {
        // front
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.28, size * 0.23, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#a87b4a";
        ctx.fill();

        // Snout
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

        // Eyes
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

        // Antlers (front)
        drawAntlerFront(ctx, size);
    }
    ctx.restore();
}

function drawAntlerFront(ctx, size) {
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
}

function drawAntlerSide(ctx, size, side) {
    ctx.save();
    ctx.strokeStyle = "#e6d8b8";
    ctx.lineWidth = size * 0.08;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(size * 0.13, -size * 0.13);
    ctx.lineTo(size * 0.38, -size * 0.32);
    ctx.lineTo(size * 0.48, -size * 0.18);
    ctx.moveTo(size * 0.32, -size * 0.28);
    ctx.lineTo(size * 0.36, -size * 0.42);
    ctx.moveTo(size * 0.38, -size * 0.32);
    ctx.lineTo(size * 0.54, -size * 0.38);
    ctx.stroke();
    ctx.restore();
}

function drawAntlerRear(ctx, size) {
    // Draw both antlers, slightly wider
    function drawAntler(side) {
        ctx.save();
        ctx.strokeStyle = "#e6d8b8";
        ctx.lineWidth = size * 0.08;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(side * size * 0.18, -size * 0.13);
        ctx.lineTo(side * size * 0.48, -size * 0.38);
        ctx.lineTo(side * size * 0.58, -size * 0.18);
        ctx.moveTo(side * size * 0.42, -size * 0.34);
        ctx.lineTo(side * size * 0.46, -size * 0.48);
        ctx.moveTo(side * size * 0.48, -size * 0.38);
        ctx.lineTo(side * 0.64 * size, -size * 0.44);
        ctx.stroke();
        ctx.restore();
    }
    drawAntler(1);
    drawAntler(-1);
}

export default MooseMan;
