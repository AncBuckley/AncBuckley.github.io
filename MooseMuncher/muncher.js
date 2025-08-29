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
    recentAnswers: []
};

// Categories (imported/bootstrapped)
export let WORD_CATEGORY_DEFS = [];
export let CATEGORIES = [];
export const NUMERIC_CATEGORIES = [
    numericCategory('Multiples of 3', n => n % 3 === 0, { min: 3, max: 180 }),
    numericCategory('Even Numbers', n => n % 2 === 0, { min: 2, max: 120 }),
    numericCategory('Odd Numbers', n => n % 2 !== 0, { min: 1, max: 119 }),
    numericCategory('Prime Numbers', n => isPrime(n), { min: 2, max: 199 }),
    numericCategory('Perfect Squares', n => Number.isInteger(Math.sqrt(n)), { min: 1, max: 196 })
];

// Numeric category helpers
function isPrime(n) {
    if (n < 2) return false;
    if (n % 2 === 0) return n === 2;
    const r = Math.floor(Math.sqrt(n));
    for (let i = 3; i <= r; i += 2) if (n % i === 0) return false;
    return true;
}
function numericCategory(name, predicate, opts = {}) {
    return {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        type: 'number',
        generate: (W, H) => {
            const total = W * H;
            const min = opts.min ?? 1;
            const max = opts.max ?? 200;
            const pool = Array.from({ length: max - min + 1 }, (_, i) => i + min);
            const take = shuffle(pool).slice(0, total);
            return take.map(n => ({ label: String(n), value: n, correct: !!predicate(n) }));
        }
    };
}

// Category loading (unchanged)
const CASE_RULES = new Map([
    ['countries', 'title'],
    ['continents', 'title']
]);
async function loadWordCategories(url = './categories.json') {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load categories.json (${res.status})`);
    const data = await res.json();
    const rows = Array.isArray(data) ? data : Array.isArray(data.words) ? data.words : [];
    const catMap = new Map();
    for (const row of rows) {
        if (!row || !row.text || !Array.isArray(row.categories)) continue;
        const w = String(row.text).trim();
        for (const raw of row.categories) {
            const c = String(raw).trim();
            if (!catMap.has(c)) catMap.set(c, new Set());
            catMap.get(c).add(w);
        }
    }
    const allWords = new Set();
    for (const s of catMap.values()) for (const w of s) allWords.add(w);
    WORD_CATEGORY_DEFS = Array.from(catMap.entries()).map(([cat, set]) => {
        const caseRule = CASE_RULES.get(cat.toLowerCase()) || 'lower';
        const correctSet = new Set(set);
        const distractPool = [...allWords].filter(w => !correctSet.has(w));
        const normalize = (s) => {
            if (caseRule === 'title') return s.replace(/\b\w/g, c => c.toUpperCase());
            if (caseRule === 'upper') return s.toUpperCase();
            return s.toLowerCase();
        };
        return {
            id: cat.toLowerCase().replace(/\s+/g, '-'),
            name: cat.replace(/\b\w/g, c => c.toUpperCase()),
            type: 'word',
            generate: (W, H, countCorrect = Math.ceil(W * H * 0.4)) => {
                const total = W * H;
                const corr = shuffle([...correctSet]).slice(0, Math.min(countCorrect, correctSet.size));
                const need = Math.max(0, total - corr.length);
                const dist = shuffle(distractPool).slice(0, need);
                return shuffle([...corr, ...dist]).map(w => ({
                    label: normalize(w),
                    value: w,
                    correct: correctSet.has(w)
                }));
            }
        };
    });
}
export async function bootCategories(jsonUrl = './categories.json') {
    await loadWordCategories(jsonUrl);
    CATEGORIES = [...NUMERIC_CATEGORIES, ...WORD_CATEGORY_DEFS];
    populateCategoryDropdown();
}
function populateCategoryDropdown() {
    if (!categorySelect) return;
    categorySelect.innerHTML = '';
    for (const c of CATEGORIES) {
        const opt = document.createElement('option');
        opt.value = c.id; opt.textContent = c.name;
        categorySelect.appendChild(opt);
    }
}
export function getCategoryById(id) {
    return CATEGORIES.find(c => c.id === id) || null;
}
function pickRandomCategory(excludeId) {
    const pool = CATEGORIES.filter(c => c.id !== excludeId);
    return choice(pool.length ? pool : CATEGORIES);
}
function pickRandomWordCategory(excludeId) {
    const pool = WORD_CATEGORY_DEFS.filter(c => c.id !== excludeId);
    return choice(pool.length ? pool : WORD_CATEGORY_DEFS);
}
function pickRandomMathCategory(excludeId) {
    const pool = NUMERIC_CATEGORIES.filter(c => c.id !== excludeId);
    return choice(pool.length ? pool : NUMERIC_CATEGORIES);
}

// Level requirement
function neededForLevel(level) {
    if (level <= 4) return 4;
    const t = Math.floor((level - 5) / 5) + 1;
    let inc = 0;
    for (let i = 0; i < t; i++) inc += (2 << i);
    return 4 + inc;
}

// Board setup
function buildBoard() {
    const W = state.gridW, H = state.gridH;
    const wantCorrect = Math.ceil(W * H * 0.4);
    const raw = state.category.generate(W, H, wantCorrect);
    state.items = raw.map((it, idx) => ({
        ...it,
        eaten: false,
        gx: idx % W,
        gy: Math.floor(idx / W)
    }));
    state.correctRemaining = state.items.filter(t => t.correct && !t.eaten).length;
    state.needed = (state.mode === MODES.MATH || state.mode === MODES.SINGLE)
        ? neededForLevel(state.level)
        : state.correctRemaining;
    state.progress = 0;
}

// Entities
function spawnPlayer() {
    state.player = { gx: 0, gy: 0, x: 0, y: 0, dir: DIRS.RIGHT, moving: null };
}
function teleportPlayerTo(gx, gy) {
    if (!state.player) return;
    state.player.gx = gx; state.player.gy = gy;
    state.player.x = gx; state.player.y = gy;
    state.player.moving = null;
    state.player.dir = DIRS.RIGHT;
}
function spawnEnemies() {
    const base = state.level <= 3 ? 2 : state.level <= 6 ? 3 : 4;
    const n = clamp(base + (state.level > 6 ? 1 : 0), 2, 6);
    state.enemies = [];
    const occupied = new Set([`0,0`]);
    const baseTime = now();
    for (let i = 0; i < n; i++) {
        let ex = randi(0, state.gridW), ey = randi(0, state.gridH), tries = 0;
        while ((Math.abs(ex - 0) + Math.abs(ey - 0)) < Math.floor((state.gridW + state.gridH) / 4) || occupied.has(`${ex},${ey}`)) {
            ex = randi(0, state.gridW); ey = randi(0, state.gridH); if (++tries > 50) break;
        }
        occupied.add(`${ex},${ey}`);
        const kind = Math.random() < 0.5 ? 'slime' : 'owl';
        state.enemies.push({
            gx: ex, gy: ey, x: ex, y: ey,
            dir: randi(0, 4),
            kind,
            color: choice(TROGGLE_COLORS),
            targetBias: rand(0.05, 0.25) + (state.level * 0.01),
            nextStepAt: baseTime + ENEMY_STEP_MS + i * 150
        });
    }
}
function onPlayerCaught(catcherIndex) {
    spawnExplosionAt(state.player.gx, state.player.gy);
    state.teleportingUntil = now() + TELEPORT_MS;
    state.invulnUntil = state.teleportingUntil + 500;
    setTimeout(() => {
        teleportPlayerTo(0, 0);
        if (typeof catcherIndex === 'number') {
            moveEnemyToBottomRight(state.enemies, catcherIndex, state.gridW, state.gridH);
        }
    }, TELEPORT_MS);
    loseLife();
}
function enemySyncHooks() {
    notifyBoardHooksForEnemies({
        isCellEmpty: (gx, gy) => {
            const t = getTileAt(gx, gy);
            return !t || t.eaten;
        },
        placeWordAt: (gx, gy) => {
            const total = state.gridW * state.gridH;
            const currentCorrect = state.items.filter(t => t.correct && !t.eaten).length;
            const targetCorrect = Math.ceil(total * 0.4);
            let bias = clamp((targetCorrect - currentCorrect) / targetCorrect, -0.35, 0.85);
            const roll = Math.random();
            const sample = state.category.generate(1, 1, 1)[0];
            const isCorrect = roll < 0.45 + bias;
            const idx = state.items.findIndex(t => t.gx === gx && t.gy === gy);
            const obj = { label: sample.label, value: sample.value, correct: isCorrect, eaten: false, gx, gy };
            if (idx >= 0) state.items[idx] = obj; else state.items.push(obj);
            state.correctRemaining = state.items.filter(t => t.correct && !t.eaten).length;
            if (state.mode !== MODES.MATH && state.mode !== MODES.SINGLE) {
                state.needed = Math.max(state.progress, state.items.filter(t => t.correct).length);
            }
        },
        onPlayerCaught: (catcherIndex) => onPlayerCaught(catcherIndex)
    });
}

// Input
document.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'escape') {
        if (!helpEl?.classList.contains('hide')) { hide(helpEl); return; }
        togglePause(); return;
    }
    if (!state.running || state.paused) return;
    if (now() < state.teleportingUntil) return;
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(k)) {
        e.preventDefault();
        if (e.repeat) return;
        handlePlayerStep(k);
        return;
    }
    if (k === ' ' || k === 'enter') { e.preventDefault(); tryEat(); }
});
function handlePlayerStep(k) {
    if (!state.player || state.player.moving) return;
    let dir = null;
    if (k === 'arrowup' || k === 'w') dir = DIRS.UP;
    else if (k === 'arrowright' || k === 'd') dir = DIRS.RIGHT;
    else if (k === 'arrowdown' || k === 's') dir = DIRS.DOWN;
    else if (k === 'arrowleft' || k === 'a') dir = DIRS.LEFT;
    if (dir == null) return;
    const [dx, dy] = DIR_VECT[dir];
    const nx = state.player.gx + dx;
    const ny = state.player.gy + dy;
    if (!passable(nx, ny)) return;
    const fromX = state.player.x, fromY = state.player.y;
    state.player.gx = nx; state.player.gy = ny;
    state.player.dir = dir;
    state.player.moving = { fromX, fromY, toX: nx, toY: ny, start: now(), dur: 180 };
}
function getTileAt(gx, gy) { return state.items.find(t => t.gx === gx && t.gy === gy); }
function passable(gx, gy) { return gx >= 0 && gy >= 0 && gx < state.gridW && gy < state.gridH; }

// Eating & scoring
function pushRecent(text, correct) {
    state.recentAnswers.unshift({ text, correct, categoryName: state.category.name, level: state.level, time: Date.now() });
    if (state.recentAnswers.length > 10) state.recentAnswers.length = 10;
    renderRecentAnswersDOM();
}
function renderRecentAnswersDOM() {
    if (!recentAnswersEl) return;
    const items = [];
    let lastCat = null;
    for (const r of state.recentAnswers.slice().reverse()) {
        if (r.categoryName !== lastCat) {
            items.push(`<div class="ans head">${escapeHtml(r.categoryName)} (Lvl ${r.level})</div>`);
            lastCat = r.categoryName;
        }
        items.push(`<div class="ans ${r.correct ? 'good' : 'bad'}">${escapeHtml(r.text)}</div>`);
    }
    recentAnswersEl.innerHTML = items.join('');
}
function tryEat() {
    const tile = getTileAt(state.player.gx, state.player.gy);
    if (!tile || tile.eaten) return;
    tile.eaten = true;
    if (tile.correct) {
        state.score += 100;
        pushRecent(tile.label, true);
        state.progress = Math.min(state.needed, state.progress + 1);
        if (state.mode !== MODES.MATH && state.mode !== MODES.SINGLE) {
            state.correctRemaining = Math.max(0, state.correctRemaining - 1);
        }
        spawnStarBurstCell(tile.gx, tile.gy);
        showToast('Yum! +100');
        if (state.progress >= state.needed) setTimeout(levelCleared, 350);
    } else {
        state.score = Math.max(0, state.score - 50);
        pushRecent(tile.label, false);
        if (state.mode === MODES.MATH || state.mode === MODES.SINGLE) {
            state.progress = Math.max(0, state.progress - 1);
        }
        spawnDisappointAt(state.player.gx, state.player.gy);
        showToast('Oops! −50');
    }
    updateHUD();
}

// Level flow
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
function pickStartingCategory() {
    if (state.mode === MODES.SINGLE) {
        const id = categorySelect?.value;
        state.category = id ? getCategoryById(id) : pickRandomWordCategory(null) || pickRandomCategory(null);
    } else if (state.mode === MODES.MATH) {
        state.category = pickRandomMathCategory(null);
    } else if (state.mode === MODES.WORDS) {
        state.category = pickRandomWordCategory(null);
    } else {
        state.category = pickRandomCategory(null);
    }
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
function loseLife() {
    if (now() < state.invulnUntil) return;
    state.lives -= 1;
    showLivesPopup(state.lives);
    state.invulnUntil = now() + 1200;
    if (state.lives <= 0) { gameOver(); return; }
    teleportPlayerTo(0, 0);
    updateHUD();
}
function gameOver() {
    state.running = false;
    state.paused = false;
    show(document.getElementById('gameover'));
    const finalStats = document.getElementById('finalStats');
    if (finalStats) finalStats.textContent = `You scored ${state.score}. Level ${state.level}.`;
}

// HUD / UI
function updateHUD() {
    if (levelSpan) setText(levelSpan, String(state.level));
    if (scoreSpan) setText(scoreSpan, String(state.score));
    if (livesSpan) setText(livesSpan, String(state.lives));
    if (categoryBadge) {
        const strong = categoryBadge.querySelector('strong');
        if (strong) strong.textContent = state.category?.name || '–';
    }
}
function showLivesPopup(lives, ms = 1200) {
    if (!livesPopup) return;
    livesPopup.textContent = `Lives: ${lives}`;
    livesPopup.classList.remove('hide');
    setTimeout(() => {
        livesPopup.classList.add('hide');
    }, ms);
}
function showToast(text, ms = 1200) {
    if (!toastEl) return;
    toastEl.textContent = text;
    show(toastEl);
    setTimeout(() => hide(toastEl), ms);
}

// Resize/layout
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    state.tile = Math.floor(Math.min(rect.width / state.gridW, rect.height / state.gridH));
}
window.addEventListener('resize', resizeCanvas);

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

function draw() {
    // Calculate layout
    const rect = canvas.getBoundingClientRect();
    const barArea = Math.max(110, Math.floor(rect.width * 0.10));
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

    // Draw player
    if (state.player) {
        const px = padX + state.player.x * tile + tile / 2;
        const py = padY + state.player.y * tile + tile / 2;
        const inv = now() < state.invulnUntil;
        const anim = MooseMan.computeAnim(state.player, DIR_VECT);
        const radius = tile * 0.21;
        MooseMan.draw(ctx, px, py, radius, state.player.dir, inv, anim);
    }

    // Add your effects, overlays, and HUD drawing here as needed
}

// Effects (starbursts, disappoint, explosions) - unchanged, keep your existing implementations

// Render (unchanged, keep your existing draw, drawLevelBar, drawRecentAnswersPanel, etc.)

// Update loop
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

// Menu/buttons
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
