import MooseMan from './MooseMan.js';
import { createEnemies, updateEnemies, drawEnemies } from './enemies.js';

// --- DOM and constants ---
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const menuEl = document.getElementById('menu');
const startBtn = document.getElementById('startBtn');
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
    caughtAnim: null,
    category: null,
    lastCategory: null,
    showCategoryTransition: false,
    transitionStart: 0
};

// --- Helpers ---
function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0;[a[i], a[j]] = [a[j], a[i]]; } return a; }
function randInt(a, b) { return (Math.random() * (b - a) + a) | 0; }
function now() { return performance.now(); }

// --- Board generation ---
const categories = [
    { name: "Animals", type: "words", correct: ["Cat", "Dog", "Moose", "Bear", "Wolf", "Fox", "Lion", "Tiger", "Horse", "Cow", "Pig", "Sheep", "Goat", "Deer", "Bat", "Duck", "Frog", "Crab", "Shark", "Whale"], distractors: ["Chair", "Table", "Car", "Phone", "Book"] },
    { name: "Multiples of 3", type: "math", correct: Array.from({ length: 33 }, (_, i) => String((i + 1) * 3)), distractors: Array.from({ length: 50 }, (_, i) => String(i * 2 + 1)).filter(n => parseInt(n) % 3 !== 0) }
];
function pickCategory() {
    const pool = categories.filter(c => c.type === (state.mode === MODES.MATH ? "math" : "words"));
    return pool[randInt(0, pool.length)];
}
function buildBoard() {
    state.lastCategory = state.category;
    state.category = pickCategory();
    state.showCategoryTransition = true;
    state.transitionStart = now();
    let pool = shuffle([...state.category.correct, ...state.category.distractors]);
    pool = pool.slice(0, GRID_W * GRID_H);
    state.items = pool.map((label, i) => ({
        label,
        correct: state.category.correct.includes(label),
        eaten: false,
        gx: i % GRID_W,
        gy: Math.floor(i / GRID_W)
    }));
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
    state.recentAnswers.unshift({
        text: tile.label,
        correct: tile.correct,
        categoryName: state.category.name,
        level: state.level
    });
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
    // Responsive sizing
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    state.tile = Math.floor(Math.min(rect.width / (GRID_W + 2), rect.height / GRID_H));
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const tile = state.tile;
    const padX = tile, padY = (rect.height - tile * GRID_H) / 2;

    // Board background
    ctx.fillStyle = "#0a174e";
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    // Draw grid
    for (let gx = 0; gx < GRID_W; gx++) for (let gy = 0; gy < GRID_H; gy++) {
        ctx.fillStyle = "#172554";
        ctx.fillRect(padX + gx * tile, padY + gy * tile, tile, tile);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
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
        const isFlying = !!state.player.moving;
        const animT = (now() % 1000) / 1000;
        MooseMan(ctx, padX + state.player.x * tile + tile / 2, padY + state.player.y * tile + tile / 2, tile, state.player.dir, isFlying, animT);
    }
    // Draw enemies
    drawEnemies(ctx, state.enemies, { padX, padY, tile });

    // Progress bar
    drawProgressBar(tile, padX, padY);
    // Recent answers
    drawRecentAnswers(tile, padX, padY);

    // Category transition
    if (state.showCategoryTransition) {
        const t = clamp((now() - state.transitionStart) / 1200, 0, 1);
        ctx.save();
        ctx.globalAlpha = 1 - t;
        ctx.font = `bold ${Math.floor(tile * 0.7)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#0a174e";
        ctx.lineWidth = 8;
        ctx.strokeText(state.category.name, padX + (GRID_W * tile) / 2, padY + (GRID_H * tile) / 2);
        ctx.fillText(state.category.name, padX + (GRID_W * tile) / 2, padY + (GRID_H * tile) / 2);
        ctx.restore();
        if (t >= 1) state.showCategoryTransition = false;
    }
}
function drawProgressBar(tile, padX, padY) {
    const barX = padX + GRID_W * tile + tile * 0.5;
    const barY = padY;
    const barW = tile * 0.5;
    const barH = GRID_H * tile;
    ctx.save();
    ctx.fillStyle = "#222";
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = "#fbbf24";
    const pct = state.needed ? clamp(state.progress / state.needed, 0, 1) : 0;
    ctx.fillRect(barX, barY, barW, barH * pct);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barW, barH);
    ctx.font = "bold 18px sans-serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${state.progress} / ${state.needed}`, barX + barW / 2, barY + barH / 2);
    ctx.restore();
}
function drawRecentAnswers(tile, padX, padY) {
    const x = padX + GRID_W * tile + tile * 1.2;
    const y = padY;
    ctx.save();
    ctx.font = "18px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    let yy = y;
    let lastCat = null;
    for (const r of state.recentAnswers.slice(0, 10)) {
        if (r.categoryName !== lastCat) {
            ctx.fillStyle = "#818cf8";
            ctx.fillText(`${r.categoryName} (Lvl ${r.level})`, x, yy);
            yy += 24;
            lastCat = r.categoryName;
        }
        ctx.fillStyle = r.correct ? "#bef264" : "#f87171";
        ctx.fillText(r.text, x + 16, yy);
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
                // Add a new answer (bias: more likely correct if few correct left)
                let correctBias = Math.max(0.5, 1 - state.progress / state.needed);
                let isCorrect = Math.random() < correctBias;
                let label;
                if (state.category.type === "math") {
                    if (isCorrect) {
                        label = state.category.correct[randInt(0, state.category.correct.length)];
                    } else {
                        label = state.category.distractors[randInt(0, state.category.distractors.length)];
                    }
                } else {
                    if (isCorrect) {
                        label = state.category.correct[randInt(0, state.category.correct.length)];
                    } else {
                        label = state.category.distractors[randInt(0, state.category.distractors.length)];
                    }
                }
                state.items = state.items.filter(t => !(t.gx === e.gx && t.gy === e.gy));
                state.items.push({ label, correct: isCorrect, eaten: false, gx: e.gx, gy: e.gy });
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
    state.recentAnswers = [];
    buildBoard();
    spawnPlayer();
    spawnEnemies();
    if (menuEl) menuEl.style.display = 'none';
    canvas.style.display = '';
    requestAnimationFrame(gameLoop);
}

// --- Show menu and hide game on load ---
function showMenu() {
    if (menuEl) menuEl.style.display = '';
    canvas.style.display = 'none';
}
showMenu();

// --- Start button event ---
if (startBtn) {
    startBtn.addEventListener('click', () => {
        startGame();
    });
}