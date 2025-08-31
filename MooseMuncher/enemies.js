// enemies.js
import { drawSlime } from './Slime.js';
import { drawOwl } from './Owl.js';

const DIRS = { UP: 0, RIGHT: 1, DOWN: 2, LEFT: 3 };
const DIR_VECT = [[0, -1], [1, 0], [0, 1], [-1, 0]];

function randInt(a, b) { return (Math.random() * (b - a) + a) | 0; }
function choice(arr) { return arr[(Math.random() * arr.length) | 0]; }
function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

export function createEnemies(gridW, gridH, level) {
    const n = clamp(2 + Math.floor(level / 3), 2, 6);
    const enemies = [];
    const occupied = new Set(["0,0"]);
    for (let i = 0; i < n; i++) {
        let gx = randInt(0, gridW), gy = randInt(0, gridH), tries = 0;
        while ((Math.abs(gx - 0) + Math.abs(gy - 0)) < 2 || occupied.has(`${gx},${gy}`)) {
            gx = randInt(0, gridW); gy = randInt(0, gridH); if (++tries > 50) break;
        }
        occupied.add(`${gx},${gy}`);
        const kind = Math.random() < 0.5 ? "slime" : "owl";
        enemies.push({
            kind,
            gx, gy, x: gx, y: gy,
            dir: randInt(0, 4),
            moving: null,
            nextMove: performance.now() + randInt(3000, 6000)
        });
    }
    return enemies;
}

export function updateEnemies(enemies, { gridW, gridH, player, passable, isCellEmpty }) {
    const nowT = performance.now();
    for (const e of enemies) {
        if (e.moving) continue;
        if (nowT < e.nextMove) continue;
        let opts = [];
        for (let d = 0; d < 4; d++) {
            const [dx, dy] = DIR_VECT[d];
            const nx = e.gx + dx, ny = e.gy + dy;
            if (nx >= 0 && ny >= 0 && nx < gridW && ny < gridH && (!passable || passable(nx, ny))) {
                opts.push({ dir: d, nx, ny });
            }
        }
        if (opts.length === 0) continue;
        // Bias
        let best;
        if (e.kind === "slime" && player) {
            if (Math.random() < 0.6) {
                best = opts.reduce((a, b) =>
                    (Math.abs(b.nx - player.gx) + Math.abs(b.ny - player.gy)) <
                        (Math.abs(a.nx - player.gx) + Math.abs(a.ny - player.gy)) ? b : a
                );
            }
        } else if (e.kind === "owl" && isCellEmpty) {
            if (Math.random() < 0.6) {
                let minDist = 999, bestOpt = opts[0];
                for (const o of opts) {
                    let dist = 0;
                    for (let r = 1; r <= 3; r++) {
                        for (let dx = -r; dx <= r; dx++) {
                            for (let dy = -r; dy <= r; dy++) {
                                const tx = o.nx + dx, ty = o.ny + dy;
                                if (tx >= 0 && ty >= 0 && tx < gridW && ty < gridH && isCellEmpty(tx, ty)) {
                                    dist = Math.abs(dx) + Math.abs(dy);
                                    if (dist < minDist) { minDist = dist; bestOpt = o; }
                                }
                            }
                        }
                    }
                }
                best = bestOpt;
            }
        }
        if (!best) best = choice(opts);
        e.dir = best.dir;
        e.moving = {
            fromX: e.gx, fromY: e.gy,
            toX: best.nx, toY: best.ny,
            start: performance.now(),
            dur: 220
        };
        e.gx = best.nx; e.gy = best.ny;
        e.nextMove = performance.now() + randInt(3000, 6000);
    }
    // Animate movement
    for (const e of enemies) {
        if (!e.moving) { e.x = e.gx; e.y = e.gy; continue; }
        const t = clamp((performance.now() - e.moving.start) / e.moving.dur, 0, 1);
        e.x = e.moving.fromX + (e.moving.toX - e.moving.fromX) * t;
        e.y = e.moving.fromY + (e.moving.toY - e.moving.fromY) * t;
        if (t >= 1) e.moving = null;
    }
}

export function drawEnemies(ctx, enemies, { padX, padY, tile }) {
    const animT = performance.now() / 1000;
    for (const e of enemies) {
        if (e.kind === "slime") {
            drawSlime(ctx, padX + e.x * tile + tile / 2, padY + e.y * tile + tile / 2, tile, animT);
        } else {
            drawOwl(ctx, padX + e.x * tile + tile / 2, padY + e.y * tile + tile / 2, tile, animT);
        }
    }
}