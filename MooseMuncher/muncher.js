import MooseMan from './MooseMan.js';
import {
    updateEnemies,
    drawEnemies,
    notifyBoardHooksForEnemies,
    moveEnemyToBottomRight
} from './enemies.js';

// DOM references
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const menuEl = document.getElementById('menu');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const helpBtn = document.getElementById('helpBtn');
const helpEl = document.getElementById('help');
const closeHelpBtn = document.getElementById('closeHelp');
const againBtn = document.getElementById('againBtn');
const menuBtn = document.getElementById('menuBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const categoryBadge = document.getElementById('categoryBadge');
const levelSpan = document.getElementById('level');
const scoreSpan = document.getElementById('score');
const livesSpan = document.getElementById('lives');
const toastEl = document.getElementById('toast');
const categorySelect = document.getElementById('categorySelect');
const modeSelect = document.getElementById('modeSelect');
const recentAnswersEl = document.getElementById('recentAnswers');
const livesPopup = document.getElementById('livesPopup');

// Enemy colors
const TROGGLE_COLORS = [
    '#3ff1c8', '#a78bfa', '#ffb347', '#ff6d8a', '#46d4ff', '#9cff6d', '#fbbf24'
];

// Helpers
const rand = (a, b) => Math.random() * (b - a) + a;
const randi = (a, b) => (Math.random() * (b - a) + a) | 0;
const choice = arr => arr[(Math.random() * arr.length) | 0];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const now = () => performance.now();
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0;[a[i], a[j]] = [a[j], a[i]] } return a; }
function lerp(a, b, t) { return a + (b - a) * t; }
function show(el) { if (el) el.classList.remove('hide'); }
function hide(el) { if (el) el.classList.add('hide'); }
function setText(el, txt) { if (el) el.textContent = txt; }
function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// Game constants
const GRID_W = 5, GRID_H = 5;
const DIRS = { UP: 0, RIGHT: 1, DOWN: 2, LEFT: 3 };
const DIR_VECT = [[0, -1], [1, 0], [0, 1], [-1, 0]];
const ENEMY_STEP_MS = 3000;
const TELEPORT_MS = 800;

// Modes
const MODES = Object.freeze({
    SINGLE: 'single',
    MATH: 'math',
    WORDS: 'words',
    ANY: 'any'
});

// State
const state = {
    running: false,
    paused: false,
    mode: MODES.ANY,
    level: 1,
    score: 0,
    lives: 3,
    gridW: GRID_W,
    gridH: GRID_H,
    tile: 64,
    category: null,
    items: [],
    correctRemaining: 0,
    player: null,
    teleportingUntil: 0,
    enemies: [],
    progress: 0,
    needed: 4,
    invulnUntil: 0,
    freezeUntil: 0,
    recentAnswers: [],
    caughtAnim: null // {start, duration, player, enemy, livesLeft}
};

// --- Category transition effect ---
let categoryTransition = {
    active: false,
    text: '',
    start: 0,
    duration: 1200,
    from: null, // {x, y}
    to: null    // {x, y}
};

function triggerCategoryTransition(newCategory, rect, padX, padY, tile, barArea) {
    categoryTransition.active = true;
    categoryTransition.text = newCategory;
    categoryTransition.start = now();

    // Center of game area
    const gridW = state.gridW, gridH = state.gridH;
    const centerX = padX + (gridW * tile) / 2;
    const centerY = padY + (gridH * tile) / 2;

    // Header position (above grid)
    const headerX = padX + (gridW * tile) / 2;
    const headerY = Math.max(32, padY - 32);

    categoryTransition.from = { x: centerX, y: centerY };
    categoryTransition.to = { x: headerX, y: headerY };
}

// --- Progress bar and recent answers panel (always visible on right) ---

function drawLevelBar(rect, barArea, padY, tile, gridH) {
    // Place the bar vertically centered to the grid
    const barH = gridH * tile;
    const y0 = padY;
    const x0 = rect.width - barArea;
    const barW = Math.max(20, Math.floor(barArea * 0.5));
    const x = x0 + (barArea - barW) / 2;
    const h = barH;

    ctx.save();
    ctx.fillStyle = '#0a1437';
    ctx.strokeStyle = '#20306b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    roundRect(ctx, x, y0, barW, h, 10);
    ctx.fill();
    ctx.stroke();

    const p = clamp(state.progress / Math.max(1, state.needed), 0, 1);
    const fh = Math.floor((h - 4) * p);
    const fy = y0 + h - 2 - fh;
    const grad = ctx.createLinearGradient(x, fy, x + barW, fy + fh);
    grad.addColorStop(0, '#46d4ff');
    grad.addColorStop(1, '#9cff6d');
    ctx.fillStyle = grad;
    ctx.beginPath();
    roundRect(ctx, x + 2, fy, barW - 4, fh, 8);
    ctx.fill();

    ctx.fillStyle = '#cfe2ff';
    ctx.font = '700 14px system-ui, -apple-system';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${state.progress}/${state.needed}`, x + barW / 2, y0 + 18);

    ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
}

function drawRecentAnswersPanel(rect, padX, padY, tile, barArea, gridH) {
    const list = state.recentAnswers;
    if (!list || list.length === 0) return;

    // Panel fills the vertical space between the top and bottom of the grid
    const areaX = rect.width - barArea;
    const panelW = Math.max(120, Math.floor(barArea * 0.7));
    const panelX = areaX + Math.floor((barArea - panelW) / 2);
    const panelY = padY;
    const panelH = gridH * tile;
    const rowH = Math.max(18, Math.floor(tile * 0.22));
    const maxRows = Math.floor((panelH - 28) / rowH); // 28px for header and some margin

    // Build a list with headers when the category changes
    let visible = [];
    let lastCat = null;
    let count = 0;
    for (let i = 0; i < list.length && count < maxRows; ++i) {
        const r = list[i];
        if (r.categoryName !== lastCat) {
            visible.push({ header: true, text: r.categoryName, level: r.level });
            lastCat = r.categoryName;
            count++;
            if (count >= maxRows) break;
        }
        visible.push(r);
        count++;
    }
    visible = visible.reverse(); // Most recent at top

    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = '#0c132b';
    ctx.strokeStyle = '#273267';
    ctx.lineWidth = 1;
    ctx.beginPath();
    roundRect(ctx, panelX, panelY, panelW, panelH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.font = 'bold 13px system-ui, -apple-system';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#cfe2ff';
    ctx.fillText('Recent Picks', panelX + panelW / 2, panelY + 6);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = '12px system-ui, -apple-system';

    let y = panelY + 26 + rowH / 2;
    for (const it of visible) {
        if (it.header) {
            ctx.font = 'bold 12px system-ui, -apple-system';
            ctx.fillStyle = '#a5b4fc';
            ctx.fillText(`${it.text} (Lv${it.level})`, panelX + 10, y);
            ctx.font = '12px system-ui, -apple-system';
        } else {
            ctx.fillStyle = it.correct ? '#7CFF7E' : '#FF6D8A';
            const txt = it.text.length > 18 ? it.text.slice(0, 17) + '…' : it.text;
            ctx.fillText(txt, panelX + 10, y);
        }
        y += rowH;
    }

    ctx.restore();
}

// --- Resize/layout ---
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    state.tile = Math.floor(Math.min(rect.width / state.gridW, rect.height / state.gridH));
}
window.addEventListener('resize', resizeCanvas);

// --- Main draw function ---
function draw() {
    const rect = canvas.getBoundingClientRect();

    // Reserve a right column for the progress bar + recents
    const barArea = Math.max(110, Math.floor(rect.width * 0.18));
    const tile = Math.min((rect.width - barArea) / state.gridW, rect.height / state.gridH);
    const padX = Math.floor((rect.width - barArea - state.gridW * tile) / 2);
    const padY = Math.floor((rect.height - state.gridH * tile) / 2);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Animate player movement
    if (state.player && state.player.moving) {
        const m = state.player.moving;
        const t = (now() - m.start) / m.dur;
        if (t >= 1) {
            state.player.x = m.toX; state.player.y = m.toY; state.player.moving = null;
        } else {
            const s = easeOutCubic(clamp(t, 0, 1));
            state.player.x = lerp(m.fromX, m.toX, s);
            state.player.y = lerp(m.fromY, m.toY, s);
        }
    }

    // --- Category header above grid ---
    ctx.save();
    ctx.font = `bold ${Math.floor(tile * 0.38)}px system-ui, -apple-system`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = '#a5b4fc';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 8;
    ctx.fillText(state.category?.name || '', padX + (state.gridW * tile) / 2, Math.max(32, padY - 12));
    ctx.restore();

    // --- Category transition effect ---
    if (categoryTransition.active) {
        const t = clamp((now() - categoryTransition.start) / categoryTransition.duration, 0, 1);
        const ease = t < 0.7 ? Math.pow(1 - t, 2) : 0;
        const x = lerp(categoryTransition.from.x, categoryTransition.to.x, t);
        const y = lerp(categoryTransition.from.y, categoryTransition.to.y, t);
        ctx.save();
        ctx.globalAlpha = 1 - ease * 0.5;
        ctx.font = `bold ${Math.floor(tile * 0.5 + 32 * ease)}px system-ui, -apple-system`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 16;
        ctx.fillText(categoryTransition.text, x, y);
        ctx.restore();
        if (t >= 1) categoryTransition.active = false;
    }

    // Draw tiles
    for (const t of state.items) {
        const x = padX + t.gx * tile, y = padY + t.gy * tile;
        ctx.beginPath();
        ctx.rect(x + 2, y + 2, tile - 4, tile - 4);
        ctx.fillStyle = t.eaten ? '#222' : '#444';
        ctx.fill();
        if (!t.eaten) {
            ctx.fillStyle = '#fff';
            ctx.font = `${Math.floor(tile * 0.25)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(t.label, x + tile / 2, y + tile / 2);
        }
    }

    // Draw enemies
    drawEnemies(ctx, state.enemies, { padX, padY, tile });

    // --- Player caught animation ---
    if (state.caughtAnim) {
        const anim = state.caughtAnim;
        const t = clamp((now() - anim.start) / anim.duration, 0, 1);
        // Animate player shrinking/fading out
        const px = padX + anim.player.gx * tile + tile / 2;
        const py = padY + anim.player.gy * tile + tile / 2;
        const radius = tile * 0.21 * (1 - t * 0.7);
        ctx.save();
        ctx.globalAlpha = 1 - t * 0.7;
        MooseMan.draw(ctx, px, py, radius, anim.player.dir, false, { frame: 0 });
        ctx.restore();

        // Animate enemy "eating" (grow slightly)
        const enemy = anim.enemy;
        const ex = padX + enemy.gx * tile + tile / 2;
        const ey = padY + enemy.gy * tile + tile / 2;
        ctx.save();
        ctx.globalAlpha = 1;
        drawEnemies(ctx, [Object.assign({}, enemy, { scale: 1 + t * 0.2 })], { padX, padY, tile });
        ctx.restore();

        // Show lives left in center
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.font = `bold ${Math.floor(tile * 0.7)}px system-ui, -apple-system`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 12;
        ctx.fillText(`Lives: ${anim.livesLeft}`, padX + (state.gridW * tile) / 2, padY + (state.gridH * tile) / 2);
        ctx.restore();
    } else {
        // Draw player (normal)
        if (state.player) {
            const px = padX + state.player.x * tile + tile / 2;
            const py = padY + state.player.y * tile + tile / 2;
            const inv = now() < state.invulnUntil;
            const anim = MooseMan.computeAnim(state.player, DIR_VECT);
            const radius = tile * 0.21;
            MooseMan.draw(ctx, px, py, radius, state.player.dir, inv, anim);
        }
    }

    // Draw progress bar and recent answers panel
    drawLevelBar(rect, barArea, padY, tile, state.gridH);
    drawRecentAnswersPanel(rect, padX, padY, tile, barArea, state.gridH);
}

// --- Category transition trigger on category change ---
let lastCategoryId = null;
function maybeTriggerCategoryTransition(rect, padX, padY, tile, barArea) {
    if (state.category && state.category.id !== lastCategoryId) {
        triggerCategoryTransition(state.category.name, rect, padX, padY, tile, barArea);
        lastCategoryId = state.category.id;
    }
}

// --- All function definitions above this line ---

// --- Level flow ---
function startGame() {
    state.running = true;
    state.paused = false;
    state.level = 1;
    state.score = 0;
    state.lives = 3;
    state.invulnUntil = 0;
    state.recentAnswers = [];
    renderRecentAnswersDOM();
    pickStartingCategory();
    buildBoard();
    spawnPlayer();
    spawnEnemies();
    enemySyncHooks();
    hide(menuEl);
    updateHUD();
}
function levelCleared() {
    state.score += 500;
    state.level += 1;
    const prev = state.category?.id || null;
    if (state.mode === MODES.MATH) {
        state.category = pickRandomMathCategory(prev);
    } else if (state.mode === MODES.WORDS) {
        state.category = pickRandomWordCategory(prev);
    } else if (state.mode === MODES.ANY) {
        state.category = pickRandomCategory(prev);
    }
    buildBoard();
    spawnPlayer();
    spawnEnemies();
    enemySyncHooks();
    state.invulnUntil = now() + 1000;
    updateHUD();
}

// --- Patch levelCleared and startGame to trigger transition ---
const origStartGame = startGame;
startGame = function () {
    origStartGame.apply(this, arguments);
    // Trigger transition on new game
    const rect = canvas.getBoundingClientRect();
    const barArea = Math.max(110, Math.floor(rect.width * 0.18));
    const tile = Math.min((rect.width - barArea) / state.gridW, rect.height / state.gridH);
    const padX = Math.floor((rect.width - barArea - state.gridW * tile) / 2);
    const padY = Math.floor((rect.height - state.gridH * tile) / 2);
    triggerCategoryTransition(state.category?.name || '', rect, padX, padY, tile, barArea);
    lastCategoryId = state.category?.id;
};

const origLevelCleared = levelCleared;
levelCleared = function () {
    origLevelCleared.apply(this, arguments);
    // Trigger transition on category change
    const rect = canvas.getBoundingClientRect();
    const barArea = Math.max(110, Math.floor(rect.width * 0.18));
    const tile = Math.min((rect.width - barArea) / state.gridW, rect.height / state.gridH);
    const padX = Math.floor((rect.width - barArea - state.gridW * tile) / 2);
    const padY = Math.floor((rect.height - state.gridH * tile) / 2);
    triggerCategoryTransition(state.category?.name || '', rect, padX, padY, tile, barArea);
    lastCategoryId = state.category?.id;
};

// --- Player caught animation and life loss ---
function onPlayerCaught(catcherIndex) {
    // Find the enemy that caught the player
    const enemy = typeof catcherIndex === 'number' ? state.enemies[catcherIndex] : null;
    // Start caught animation
    state.caughtAnim = {
        start: now(),
        duration: 1100,
        player: { ...state.player },
        enemy: enemy ? { ...enemy } : { ...state.enemies[0] },
        livesLeft: Math.max(0, state.lives - 1)
    };
    state.teleportingUntil = now() + 1100;
    state.invulnUntil = state.teleportingUntil + 500;

    // After animation, teleport player and enemy
    setTimeout(() => {
        state.caughtAnim = null;
        state.lives -= 1;
        updateHUD();
        // Teleport player to top right, enemy to bottom left
        teleportPlayerTo(state.gridW - 1, 0);
        if (typeof catcherIndex === 'number') {
            // Move enemy to bottom left
            state.enemies[catcherIndex].gx = 0;
            state.enemies[catcherIndex].gy = state.gridH - 1;
            state.enemies[catcherIndex].x = 0;
            state.enemies[catcherIndex].y = state.gridH - 1;
        }
        if (state.lives <= 0) {
            gameOver();
        }
    }, 1100);
}

// --- Effects (starbursts, disappoint, explosions) - unchanged ---
let starBursts = [];
function spawnStarBurstCell(gx, gy) {
    const N = 12; const parts = [];
    for (let i = 0; i < N; i++) parts.push({ ang: rand(0, Math.PI * 2), spd: rand(0.6, 1.05) });
    starBursts.push({ gx, gy, born: now(), duration: 700, parts });
}
let sfx = [];
function spawnDisappointAt(gx, gy) {
    sfx.push({ type: 'disappoint', gx, gy, born: now(), duration: 800 });
}
let explosions = [];
function spawnExplosionAt(gx, gy) {
    const N = 16; const parts = [];
    for (let i = 0; i < N; i++) parts.push({ ang: rand(0, Math.PI * 2), spd: rand(0.6, 1.2) });
    explosions.push({ gx, gy, born: now(), duration: 600, parts });
}

// --- The rest of your unchanged code (input, board setup, etc.) ---

// ... (keep your other functions and logic here, unchanged) ...

// --- Update loop ---
let rafId = 0;
function tick(ts) {
    if (state.running && !state.paused) {
        updateEnemies(state.enemies, {
            gridW: state.gridW, gridH: state.gridH,
            player: state.player,
            stepMs: ENEMY_STEP_MS,
            freezeUntil: state.freezeUntil,
            passable,
            clampTo: (gx, gy) => ({ gx: clamp(gx, 0, state.gridW - 1), gy: clamp(gy, 0, state.gridH - 1) })
        });
    }
    draw();
    rafId = requestAnimationFrame(tick);
}

// --- Menu/buttons and boot logic (unchanged) ---
startBtn?.addEventListener('click', () => {
    const mVal = (modeSelect?.value || 'any').toLowerCase();
    let mode = MODES.ANY;
    if (mVal.includes('single')) mode = MODES.SINGLE;
    else if (mVal.includes('math')) mode = MODES.MATH;
    else if (mVal.includes('word')) mode = MODES.WORDS;
    else mode = MODES.ANY;
    state.mode = mode;
    setCategoryDropdownVisible(mode === MODES.SINGLE);
    startGame();
});
shuffleBtn?.addEventListener('click', () => {
    if (!categorySelect) return;
    const pool = (state.mode === MODES.MATH) ? NUMERIC_CATEGORIES
        : (state.mode === MODES.WORDS) ? WORD_CATEGORY_DEFS
            : CATEGORIES;
    const pick = choice(pool);
    categorySelect.value = pick.id;
});
pauseBtn?.addEventListener('click', () => togglePause());
helpBtn?.addEventListener('click', () => show(helpEl));
closeHelpBtn?.addEventListener('click', () => hide(helpEl));
againBtn?.addEventListener('click', () => { hide(againBtn?.closest('.overlay')); show(menuEl); });
menuBtn?.addEventListener('click', () => { show(menuEl); state.running = false; state.paused = false; });
modeSelect?.addEventListener('change', () => {
    const v = modeSelect.value.toLowerCase();
    setCategoryDropdownVisible(v.includes('single'));
});
function setCategoryDropdownVisible(visible) {
    if (!categorySelect) return;
    const label = categorySelect.closest('label') || categorySelect;
    label.style.display = visible ? '' : 'none';
}
function togglePause() {
    if (!state.running) return;
    state.paused = !state.paused;
    pauseBtn && (pauseBtn.textContent = state.paused ? '▶️ Resume' : '⏸️ Pause');
}

// Boot
function onReady() {
    resizeCanvas();
    bootCategories().then(() => {
        if (modeSelect) {
            const opt = Array.from(modeSelect.options).find(o => o.value.toLowerCase().includes('any'));
            if (opt) modeSelect.value = opt.value;
        }
        setCategoryDropdownVisible((modeSelect?.value || '').toLowerCase().includes('single'));
    }).catch(err => console.error(err));
    cancelAnimationFrame(rafId); rafId = requestAnimationFrame(tick);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', onReady);
else onReady();

window.CategoryAPI = {
    get CATEGORIES() { return CATEGORIES; },
    get WORD_CATEGORY_DEFS() { return WORD_CATEGORY_DEFS; },
    pickRandomCategory, pickRandomWordCategory, pickRandomMathCategory
};
