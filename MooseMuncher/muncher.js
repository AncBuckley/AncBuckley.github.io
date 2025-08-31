import MooseMan from './MooseMan.js';
import { createEnemies, updateEnemies, drawEnemies } from './enemies.js';

// --- DOM and constants ---
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const GRID_W = 5, GRID_H = 5;
const DIRS = { UP: 0, RIGHT: 1, DOWN: 2, LEFT: 3 };
const DIR_VECT = [[0, -1], [1, 0], [0, 1], [-1, 0]];
const MODES = { WORDS: 'words', MATH: 'math' };

// --- State ---
const state = {
    mode: MODES.WORDS,
    level: 1,
    score: 0,
    lives: 3,
    tile: 64,
    items: [],
    player: null,
    enemies: [],
    progress: 0,
    needed: 4,
    recentAnswers: [],
    running: false,
    paused: false,
    caughtAnim: null
};

// --- Helpers ---
function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0;[a[i], a[j]] = [a[j], a[i]]; } return a; }
function randInt(a, b) { return (Math.random() * (b - a) + a) | 0; }
function now() { return performance.now(); }

// --- Board generation ---
function generateWords() {
    // Example: 20 animals, 5 distractors
    const animals = ["Cat", "Dog", "Moose", "Bear", "Wolf", "Fox", "Lion", "Tiger", "Horse", "Cow", "Pig", "Sheep", "Goat", "Deer", "Bat", "Duck", "Frog", "Crab", "Shark", "Whale"];
    const distractors = ["Chair", "Table", "Car", "Phone", "Book"];
    const pool = shuffle([...animals, ...distractors]);
    return pool.slice(0, GRID_W * GRID_H).map((label, i) => ({
        label,
        correct: animals.includes(label),
        eaten: false,
        gx: i % GRID_W,
        gy: Math.floor(i / GRID_W)
    }));
}
function generateNumbers() {
    // Example: Multiples of 3 between 1 and 50
    const nums = shuffle(Array.from({ length: 50 }, (_, i) => i + 1));
    return nums.slice(0, GRID_W * GRID_H).map((n, i) => ({
        label: String(n),
        correct: n % 3 === 0,
        eaten: false,
        gx: i % GRID_W,
        gy: Math.floor(i / GRID_W)
    }));
}
function buildBoard() {
    state.items = state.mode === MODES.MATH ? generateNumbers() : generateWords();
    state.progress = 0;
    state.needed = state.items.filter(t => t.correct).length;
}

// --- Entities ---
function spawnPlayer() {
    state.player = { gx: 0, gy: 0, x: 0, y: 0, dir: DIRS.RIGHT, moving: null };
}
function spawnEnemies() {
    state.enemies = createEnemies(GRID_W, GRID_H, state.level);
}

// --- Game logic ---
function getTileAt(gx, gy) { return state.items.find(t => t.gx === gx && t.gy === gy); }
function passable(gx, gy) { return gx >= 0 && gy >= 0 && gx < GRID_W && gy < GRID_H; }
function isCellEmpty(gx, gy) { const t = getTileAt(gx, gy); return !t || t.eaten; }

function tryEat() {
    const tile = getTileAt(state.player.gx, state.player.gy);
    if (!tile || tile.eaten) return;
    tile.eaten = true;
    state.progress++;
    state.recentAnswers.unshift({ text: tile.label, correct: tile.correct });
    if (state.progress >= state.needed) setTimeout(nextLevel, 500);
}
function nextLevel() {
    state.level++;
    buildBoard();
    spawnPlayer();
    spawnEnemies();
}
function onPlayerCaught(enemy) {
    state.caughtAnim = { start: now(), duration: 900, player: { ...state.player }, enemy: { ...enemy } };
    setTimeout(() => {
        state.caughtAnim = null;
        state.player.gx = 0; state.player.gy = 0; state.player.x = 0; state.player.y = 0;
        enemy.gx = GRID_W - 1; enemy.gy = GRID_H - 1; enemy.x = GRID_W - 1; enemy.y = GRID_H - 1;
    }, 900);
}

// --- Drawing ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const tile = state.tile;
    const padX = 24, padY = 24;
    // Draw grid
    for (let gx = 0; gx < GRID_W; gx++) for (let gy = 0; gy < GRID_H; gy++) {
        ctx.fillStyle = "#172554";
        ctx.fillRect(padX + gx * tile, padY + gy * tile, tile, tile);
        ctx.strokeStyle = "#1e293b";
        ctx.strokeRect(padX + gx * tile, padY + gy * tile, tile, tile);
    }
    // Draw items
    for (const item of state.items) {
        if (item.eaten) continue;
        ctx.save();
        ctx.fillStyle = "#172554";
        ctx.fillRect(padX + item.gx * tile, padY + item.gy * tile, tile, tile);
        ctx.fillStyle = "#fff";
        let fontSize = tile * 0.32;
        ctx.font = `${fontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        let text = item.label;
        let maxWidth = tile - 12;
        while (ctx.measureText(text).width > maxWidth && fontSize > 10) {
            fontSize -= 2;
            ctx.font = `${fontSize}px sans-serif`;
        }
        if (ctx.measureText(text).width > maxWidth) {
            while (ctx.measureText(text + "…").width > maxWidth && text.length > 1) text = text.slice(0, -1);
            text += "…";
        }
        ctx.fillText(text, padX + item.gx * tile + tile / 2, padY + item.gy * tile + tile / 2);
        ctx.restore();
    }
    // Draw player
    if (state.player) {
        MooseMan(ctx, padX + state.player.x * tile + tile / 2, padY + state.player.y * tile + tile / 2, tile, state.player.dir);
    }
    // Draw enemies
    drawEnemies(ctx, state.enemies, { padX, padY, tile });
    // Progress bar
    drawProgressBar();
    // Recent answers
    drawRecentAnswers();
}
function drawProgressBar() {
    const barX = 24 + GRID_W * state.tile + 32;
    const barY = 24;
    const barW = 32;
    const barH = GRID_H * state.tile;
    ctx.save();
    ctx.fillStyle = "#222";
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = "#fbbf24";
    const pct = state.needed ? clamp(state.progress / state.needed, 0, 1) : 0;
    ctx.fillRect(barX, barY, barW, barH * pct);
    ctx.strokeStyle = "#a5b4fc";
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barW, barH);
    ctx.restore();
}
function drawRecentAnswers() {
    const x = 24 + GRID_W * state.tile + 80;
    const y = 24;
    ctx.save();
    ctx.font = "18px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    let yy = y;
    for (const r of state.recentAnswers.slice(0, 10)) {
        ctx.fillStyle = r.correct ? "#bef264" : "#f87171";
        ctx.fillText(r.text, x, yy);
        yy += 24;
    }
    ctx.restore();
}

// --- Input ---
document.addEventListener("keydown", (e) => {
    if (!state.running || state.paused || state.caughtAnim) return;
    let dir = null;
    if (e.key === "ArrowUp" || e.key === "w") dir = DIRS.UP;
    else if (e.key === "ArrowDown" || e.key === "s") dir = DIRS.DOWN;
    else if (e.key === "ArrowLeft" || e.key === "a") dir = DIRS.LEFT;
    else if (e.key === "ArrowRight" || e.key === "d") dir = DIRS.RIGHT;
    if (dir !== null) {
        movePlayer(dir);
        e.preventDefault();
    }
    if (e.key === " " || e.key === "Enter") {
        tryEat();
        e.preventDefault();
    }
});
// --- Touch/Swipe for mobile ---
let touchStartX = 0, touchStartY = 0;
canvas.addEventListener("touchstart", e => {
    if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }
});
canvas.addEventListener("touchend", e => {
    if (!state.running || state.paused || state.caughtAnim) return;
    if (e.changedTouches.length === 1) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 20) movePlayer(DIRS.RIGHT);
            else if (dx < -20) movePlayer(DIRS.LEFT);
        } else {
            if (dy > 20) movePlayer(DIRS.DOWN);
            else if (dy < -20) movePlayer(DIRS.UP);
        }
    }
});
function movePlayer(dir) {
    if (!state.player || state.player.moving) return;
    const [dx, dy] = DIR_VECT[dir];
    const nx = state.player.gx + dx, ny = state.player.gy + dy;
    if (!passable(nx, ny)) return;
    state.player.dir = dir;
    state.player.moving = { fromX: state.player.x, fromY: state.player.y, toX: nx, toY: ny, start: now(), dur: 120 };
    state.player.gx = nx; state.player.gy = ny;
}

// --- Main loop ---
function gameLoop() {
    // Animate player
    if (state.player && state.player.moving) {
        const t = clamp((now() - state.player.moving.start) / state.player.moving.dur, 0, 1);
        state.player.x = state.player.moving.fromX + (state.player.moving.toX - state.player.moving.fromX) * t;
        state.player.y = state.player.moving.fromY + (state.player.moving.toY - state.player.moving.fromY) * t;
        if (t >= 1) state.player.moving = null;
    } else if (state.player) {
        state.player.x = state.player.gx; state.player.y = state.player.gy;
    }
    // Animate enemies and update
    updateEnemies(state.enemies, {
        gridW: GRID_W,
        gridH: GRID_H,
        player: state.player,
        passable,
        isCellEmpty
    });
    // Enemy lands on empty: add answer
    for (const e of state.enemies) {
        if (!e.moving) {
            const t = getTileAt(e.gx, e.gy);
            if (!t || t.eaten) {
                // Add a new answer (randomly correct/incorrect)
                const label = state.mode === MODES.MATH ? String(randInt(1, 100)) : ["Cat", "Dog", "Moose", "Bear", "Wolf", "Fox", "Lion", "Tiger", "Horse", "Cow", "Pig", "Sheep", "Goat", "Deer", "Bat", "Duck", "Frog", "Crab", "Shark", "Whale", "Chair", "Table", "Car", "Phone", "Book"][randInt(0, 25)];
                const correct = state.mode === MODES.MATH ? (parseInt(label) % 3 === 0) : (["Cat", "Dog", "Moose", "Bear", "Wolf", "Fox", "Lion", "Tiger", "Horse", "Cow", "Pig", "Sheep", "Goat", "Deer", "Bat", "Duck", "Frog", "Crab", "Shark", "Whale"].includes(label));
                state.items = state.items.filter(t => !(t.gx === e.gx && t.gy === e.gy));
                state.items.push({ label, correct, eaten: false, gx: e.gx, gy: e.gy });
            }
        }
    }
    // Player/enemy collision
    if (!state.caughtAnim && state.player) {
        for (const e of state.enemies) {
            if (Math.round(state.player.x) === Math.round(e.x) && Math.round(state.player.y) === Math.round(e.y)) {
                onPlayerCaught(e);
                break;
            }
        }
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// --- Start game ---
function startGame() {
    state.running = true;
    state.level = 1;
    state.score = 0;
    state.lives = 3;
    buildBoard();
    spawnPlayer();
    spawnEnemies();
    requestAnimationFrame(gameLoop);
}
startGame();
