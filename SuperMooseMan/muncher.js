import MooseMan from './MooseMan.js';
import { createEnemies, updateEnemies, drawEnemies, notifyBoardHooksForEnemies, moveEnemyToBottomRight } from './enemies.js';

// --- Constants ---
const GRID_SIZE = 5;
const TILE_GAP = 12;
const BOARD_MARGIN = 32;
const ENEMY_STEP_MS = 3000;
const FREEZE_DURATION = 3500;
const TELEPORT_DURATION = 900;
const INVULN_DURATION = 1200;
const RECENT_ANSWERS_MAX = 10;

// --- State ---
let canvas, ctx, width, height, tileSize, boardOrigin;
let gameState = 'menu'; // 'menu', 'playing', 'paused', 'help', 'gameover'
let player, enemies, board, category, mode, level, score, lives, progress, recentAnswers, freezeTimer, teleporting, invulnTimer, requiredCorrect;
let categories, numericCategories, allCategories, wordCategoryList, numericCategoryList;
let lastEnemyStep = 0, lastFrame = 0;
let overlay, mainMenu, helpMenu, gameOverMenu;
let categoriesData = [];

// --- Init ---
window.addEventListener('DOMContentLoaded', async () => {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    overlay = document.getElementById('overlay');
    mainMenu = document.getElementById('main-menu');
    helpMenu = document.getElementById('help');
    gameOverMenu = document.getElementById('game-over');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Load categories.json dynamically
    try {
        const resp = await fetch('./categories.json');
        categoriesData = await resp.json();
        if (!Array.isArray(categoriesData) || categoriesData.length === 0) {
            throw new Error('categories.json is empty or not an array.');
        }
    } catch (e) {
        alert('Failed to load or parse categories.json: ' + e.message);
        categoriesData = [];
        // Optionally, you can stop the game here:
        return;
    }

    setupCategories();
    showMainMenu();
    setupInput();
    requestAnimationFrame(gameLoop);
});

// --- Responsive Canvas ---
function resizeCanvas() {
    const minDim = Math.min(window.innerWidth, window.innerHeight) - 40;
    canvas.width = canvas.height = Math.max(400, minDim);
    width = canvas.width;
    height = canvas.height;
    tileSize = Math.floor((width - 2 * BOARD_MARGIN - (GRID_SIZE - 1) * TILE_GAP) / GRID_SIZE);
    boardOrigin = {
        x: Math.floor((width - (tileSize * GRID_SIZE + TILE_GAP * (GRID_SIZE - 1))) / 2),
        y: Math.floor((height - (tileSize * GRID_SIZE + TILE_GAP * (GRID_SIZE - 1))) / 2)
    };
}

// --- Categories ---
function setupCategories() {
    // Build word categories from JSON
    categories = {};
    for (const entry of categoriesData) {
        if (!entry || !entry.categories || !Array.isArray(entry.categories) || typeof entry.text !== 'string') continue;
        for (const cat of entry.categories) {
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(entry.text);
        }
    }
    wordCategoryList = Object.keys(categories);

    // Numeric categories
    numericCategories = {
        even: { label: "Even Numbers", predicate: n => n % 2 === 0 },
        odd: { label: "Odd Numbers", predicate: n => n % 2 === 1 },
        prime: { label: "Prime Numbers", predicate: n => isPrime(n) },
        square: { label: "Perfect Squares", predicate: n => Number.isInteger(Math.sqrt(n)) }
        // Add more as needed
    };
    numericCategoryList = Object.keys(numericCategories);

    allCategories = { ...categories, ...numericCategories };
}

function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i * i <= n; ++i) if (n % i === 0) return false;
    return true;
}

// --- Main Menu ---
function showMainMenu() {
    gameState = 'menu';
    overlay.classList.add('active');
    mainMenu.style.display = '';
    helpMenu.style.display = 'none';
    gameOverMenu.style.display = 'none';
    mainMenu.innerHTML = `
        <h2>MuncherJS</h2>
        <div>
            <label>Mode:
                <select id="mode-select">
                    <option value="anything">Anything Goes</option>
                    <option value="words">Words Only</option>
                    <option value="math">Math Only</option>
                    <option value="single">Single Category</option>
                </select>
            </label>
        </div>
        <div id="cat-select-wrap" style="display:none">
            <label>Category:
                <select id="cat-select">
                    ${wordCategoryList.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                </select>
            </label>
        </div>
        <button id="start-btn">Start</button>
        <button id="help-btn">Help</button>
    `;
    document.getElementById('mode-select').onchange = e => {
        document.getElementById('cat-select-wrap').style.display = e.target.value === 'single' ? '' : 'none';
    };
    document.getElementById('start-btn').onclick = startGame;
    document.getElementById('help-btn').onclick = showHelp;
}

// --- Help Overlay ---
function showHelp() {
    gameState = 'help';
    mainMenu.style.display = 'none';
    helpMenu.style.display = '';
    helpMenu.innerHTML = `
        <h2>How to Play</h2>
        <ul>
            <li>Move: Arrow keys or WASD</li>
            <li>Eat: Space or Enter</li>
            <li>Pause: Esc</li>
            <li>Eat correct tiles to progress. Avoid enemies!</li>
        </ul>
        <button id="close-help">Close</button>
    `;
    document.getElementById('close-help').onclick = () => {
        helpMenu.style.display = 'none';
        showMainMenu();
    };
}

// --- Game Over Overlay ---
function showGameOver() {
    gameState = 'gameover';
    overlay.classList.add('active');
    gameOverMenu.style.display = '';
    mainMenu.style.display = 'none';
    helpMenu.style.display = 'none';
    gameOverMenu.innerHTML = `
        <h2>Game Over</h2>
        <div>Final Score: <b>${score}</b></div>
        <div>Level Reached: <b>${level}</b></div>
        <button id="play-again">Play Again</button>
        <button id="main-menu-btn">Main Menu</button>
    `;
    document.getElementById('play-again').onclick = startGame;
    document.getElementById('main-menu-btn').onclick = showMainMenu;
}

// --- Start Game ---
function startGame() {
    // Read mode/category
    mode = document.getElementById('mode-select').value;
    category = mode === 'single'
        ? document.getElementById('cat-select').value
        : null;
    level = 1;
    score = 0;
    lives = 3;
    progress = 0;
    recentAnswers = [];
    freezeTimer = 0;
    teleporting = false;
    invulnTimer = 0;
    requiredCorrect = requiredCorrectForLevel(level);

    // Build board
    board = createBoard();

    // Place player
    player = {
        x: 0, y: 0, dir: [0, -1], moving: false, anim: 0
    };

    // Enemies
    enemies = createEnemies(level, player, board, mode, category);

    // Hide menu
    overlay.classList.remove('active');
    mainMenu.style.display = 'none';
    helpMenu.style.display = 'none';
    gameOverMenu.style.display = 'none';
    gameState = 'playing';
}

// --- Board Generation ---
function createBoard() {
    // Fill with random words/numbers per mode/category
    let tiles = [];
    let correctWords = [];
    let wrongWords = [];
    let correctCount = 0;
    let totalTiles = GRID_SIZE * GRID_SIZE;

    // Determine category for this level
    let cat = pickCategoryForLevel();

    // Numeric or word?
    let isNumeric = numericCategories[cat] !== undefined;
    let correctSet = new Set();
    let allLabels = [];

    if (isNumeric) {
        // Generate numbers in a range (e.g., 1-99)
        let nums = [];
        for (let i = 1; i <= 99; ++i) nums.push(i);
        shuffle(nums);
        for (let n of nums) {
            if (numericCategories[cat].predicate(n)) {
                correctWords.push(n.toString());
                correctSet.add(n.toString());
            } else {
                wrongWords.push(n.toString());
            }
            if (correctWords.length >= Math.ceil(totalTiles * 0.4)) break;
        }
        // Fill up wrongWords if needed
        for (let n of nums) {
            if (!correctSet.has(n.toString())) {
                wrongWords.push(n.toString());
                if (wrongWords.length + correctWords.length >= totalTiles) break;
            }
        }
        allLabels = correctWords.concat(wrongWords);
    } else {
        // Word category
        let all = categories[cat] || [];
        let correctPool = [...all];
        shuffle(correctPool);
        correctWords = correctPool.slice(0, Math.ceil(totalTiles * 0.4));
        correctSet = new Set(correctWords);
        // Wrong words: from other categories
        let wrongPool = [];
        for (let c in categories) {
            if (c !== cat) wrongPool.push(...categories[c]);
        }
        shuffle(wrongPool);
        wrongWords = wrongPool.filter(w => !correctSet.has(w)).slice(0, totalTiles - correctWords.length);
        allLabels = correctWords.concat(wrongWords);
    }

    shuffle(allLabels);

    for (let i = 0; i < totalTiles; ++i) {
        let label = allLabels[i];
        let isCorrect = correctSet.has(label);
        tiles.push({
            x: i % GRID_SIZE,
            y: Math.floor(i / GRID_SIZE),
            label: label,
            correct: isCorrect,
            eaten: false,
            effect: null
        });
    }
    return tiles;
}

function pickCategoryForLevel() {
    if (mode === 'single') return category;
    if (mode === 'math') {
        // Rotate numeric categories
        return numericCategoryList[(level - 1) % numericCategoryList.length];
    }
    if (mode === 'words') {
        return wordCategoryList[(level - 1) % wordCategoryList.length];
    }
    // Anything Goes: mix
    let all = wordCategoryList.concat(numericCategoryList);
    return all[(level - 1) % all.length];
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; --i) {
        let j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

// --- Input ---
function setupInput() {
    window.addEventListener('keydown', e => {
        if (gameState !== 'playing') return;
        if (teleporting) return;
        if (e.repeat) return;
        let moved = false;
        let dx = 0, dy = 0;
        switch (e.key) {
            case 'ArrowUp': case 'w': case 'W': dy = -1; break;
            case 'ArrowDown': case 's': case 'S': dy = 1; break;
            case 'ArrowLeft': case 'a': case 'A': dx = -1; break;
            case 'ArrowRight': case 'd': case 'D': dx = 1; break;
            case ' ': case 'Enter':
                eatTile();
                return;
            case 'Escape':
                togglePause();
                return;
        }
        if (dx !== 0 || dy !== 0) {
            movePlayer(dx, dy);
        }
    });

    // Pause/help from HUD buttons
    window.addEventListener('pause', togglePause);
    window.addEventListener('help', () => {
        if (gameState === 'playing' || gameState === 'paused') {
            showHelp();
        }
    });
}

function movePlayer(dx, dy) {
    let nx = player.x + dx, ny = player.y + dy;
    if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) return;
    player.x = nx;
    player.y = ny;
    player.dir = [dx, dy];
    player.anim = performance.now();
}

function eatTile() {
    let tile = board && board.find(t => t.x === player.x && t.y === player.y);
    if (!tile || tile.eaten) return;
    tile.eaten = true;
    let correct = tile.correct;
    recentAnswers.push({ text: tile.label, correct });
    if (recentAnswers.length > RECENT_ANSWERS_MAX) recentAnswers.shift();
    if (correct) {
        score += 100;
        progress += 1;
        // TODO: Starburst effect
    } else {
        score = Math.max(0, score - 50);
        // TODO: Stress lines/sweat effect
        if (mode === 'math') {
            progress = Math.max(0, progress - 1);
        }
    }
    checkLevelProgress();
}

function checkLevelProgress() {
    if (progress >= requiredCorrect) {
        score += 500;
        level += 1;
        progress = 0;
        requiredCorrect = requiredCorrectForLevel(level);
        // New board/category
        board = createBoard();
        // Move player to (0,0)
        player.x = 0; player.y = 0;
        // Respawn enemies
        enemies = createEnemies(level, player, board, mode, category);
        // Add heading to recent answers
        recentAnswers.push({ text: `Level ${level} - ${pickCategoryForLevel()}`, correct: null });
        if (recentAnswers.length > RECENT_ANSWERS_MAX) recentAnswers.shift();
    }
}

function togglePause() {
    if (gameState === 'playing') {
        gameState = 'paused';
        overlay.classList.add('active');
        mainMenu.style.display = 'none';
        helpMenu.style.display = 'none';
        gameOverMenu.style.display = 'none';
        // Show pause overlay
        if (!document.getElementById('pause-menu')) {
            let pauseDiv = document.createElement('div');
            pauseDiv.id = 'pause-menu';
            pauseDiv.style.background = '#222';
            pauseDiv.style.padding = '2em';
            pauseDiv.style.borderRadius = '12px';
            pauseDiv.style.minWidth = '320px';
            pauseDiv.style.textAlign = 'center';
            pauseDiv.innerHTML = `
                <h2>Paused</h2>
                <button id="resume-btn">Resume</button>
                <button id="main-menu-btn2">Main Menu</button>
            `;
            overlay.appendChild(pauseDiv);
            document.getElementById('resume-btn').onclick = () => {
                gameState = 'playing';
                overlay.classList.remove('active');
                pauseDiv.remove();
            };
            document.getElementById('main-menu-btn2').onclick = () => {
                pauseDiv.remove();
                showMainMenu();
            };
        }
    } else if (gameState === 'paused') {
        gameState = 'playing';
        overlay.classList.remove('active');
        let pauseDiv = document.getElementById('pause-menu');
        if (pauseDiv) pauseDiv.remove();
    }
}

// --- Game Loop ---
function gameLoop(ts) {
    if (!lastFrame) lastFrame = ts;
    const dt = ts - lastFrame;
    lastFrame = ts;

    // --- Render ---
    ctx.clearRect(0, 0, width, height);

    // Only draw board/game if board is defined (i.e., in playing or paused state)
    if (board && (gameState === 'playing' || gameState === 'paused')) {
        drawBoard();
        drawHUD();
        drawRecentAnswers();
        drawLevelBar();
        // Player
        MooseMan.draw(ctx, ...tileCenter(player.x, player.y), tileSize * 0.45, player.dir, teleporting, player.anim);
        // Enemies
        drawEnemies(ctx, enemies, tileSize, tileCenter);
    }

    if (gameState === 'playing') {
        // Update freeze/teleport/invuln timers
        if (freezeTimer > 0) freezeTimer -= dt;
        if (teleporting) {
            invulnTimer -= dt;
            if (invulnTimer <= 0) teleporting = false;
        }
        // Enemies step
        if (ts - lastEnemyStep > ENEMY_STEP_MS && freezeTimer <= 0) {
            updateEnemies(enemies, player, board);
            lastEnemyStep = ts;
        }
        // Check collisions
        for (const enemy of enemies) {
            if (enemy.x === player.x && enemy.y === player.y && !teleporting && invulnTimer <= 0) {
                // Player caught!
                lives -= 1;
                // TODO: Explosion effect
                teleporting = true;
                invulnTimer = INVULN_DURATION;
                player.x = 0; player.y = 0;
                moveEnemyToBottomRight(enemy);
                if (lives <= 0) {
                    showGameOver();
                }
                break;
            }
        }
    }

    requestAnimationFrame(gameLoop);
}

// --- Board Drawing ---
function drawBoard() {
    if (!Array.isArray(board)) return;
    for (const tile of board) {
        const [cx, cy] = tileCenter(tile.x, tile.y);
        // Tile background
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx - tileSize / 2 + 12, cy - tileSize / 2);
        ctx.arcTo(cx + tileSize / 2, cy - tileSize / 2, cx + tileSize / 2, cy + tileSize / 2, 16);
        ctx.arcTo(cx + tileSize / 2, cy + tileSize / 2, cx - tileSize / 2, cy + tileSize / 2, 16);
        ctx.arcTo(cx - tileSize / 2, cy + tileSize / 2, cx - tileSize / 2, cy - tileSize / 2, 16);
        ctx.arcTo(cx - tileSize / 2, cy - tileSize / 2, cx + tileSize / 2, cy - tileSize / 2, 16);
        ctx.closePath();
        // Gradient
        let grad = ctx.createLinearGradient(cx, cy - tileSize / 2, cx, cy + tileSize / 2);
        grad.addColorStop(0, tile.eaten ? '#b6f7c1' : '#3a4250');
        grad.addColorStop(1, tile.eaten ? '#e0ffe7' : '#23272e');
        ctx.fillStyle = grad;
        ctx.fill();
        // Halo for eaten-correct
        if (tile.eaten && tile.correct) {
            ctx.shadowColor = 'rgba(80,255,120,0.5)';
            ctx.shadowBlur = 16;
            ctx.globalAlpha = 0.7;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }
        ctx.restore();
        // Label
        drawTileLabel(tile, cx, cy, tileSize * 0.8);
    }
}

function tileCenter(x, y) {
    return [
        boardOrigin.x + x * (tileSize + TILE_GAP) + tileSize / 2,
        boardOrigin.y + y * (tileSize + TILE_GAP) + tileSize / 2
    ];
}

// --- Tile Label Fitting ---
function drawTileLabel(tile, cx, cy, maxWidth) {
    let text = tile.label;
    if (!text) return;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let fontSize = 28, lines = [text];
    // Try to fit in 2 lines, shrink font if needed, ellipsis if still too long
    while (fontSize > 12) {
        ctx.font = `bold ${fontSize}px sans-serif`;
        let metrics = ctx.measureText(text);
        if (metrics.width <= maxWidth) break;
        fontSize -= 2;
    }
    if (fontSize <= 12) {
        // Ellipsis
        let ellip = text;
        while (ctx.measureText(ellip + '…').width > maxWidth && ellip.length > 1) {
            ellip = ellip.slice(0, -1);
        }
        text = ellip + '…';
    }
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = tile.eaten ? '#6a7' : '#fff';
    ctx.fillText(text, cx, cy);
    ctx.restore();
}

// --- HUD, Recent Answers, Level Bar ---
function drawHUD() {
    const hud = document.getElementById('hud');
    let catLabel = mode === 'single' ? category : pickCategoryForLevel();
    hud.innerHTML = `
        <div style="padding:8px 24px;">
            <span style="font-size:1.5em;font-weight:bold;">MuncherJS</span>
            <span style="margin-left:24px;">Level: ${level}</span>
            <span style="margin-left:24px;">Score: ${score}</span>
            <span style="margin-left:24px;">Lives: ${lives}</span>
            <span style="margin-left:24px;background:#4a7;border-radius:8px;padding:2px 10px;">${catLabel || 'Any'}</span>
            <button style="float:right;pointer-events:auto;" onclick="window.dispatchEvent(new Event('pause'))">Pause</button>
            <button style="float:right;margin-right:8px;pointer-events:auto;" onclick="window.dispatchEvent(new Event('help'))">Help</button>
        </div>
    `;
}
function drawRecentAnswers() {
    const panel = document.getElementById('recent-answers');
    if (!recentAnswers) {
        panel.innerHTML = '';
        return;
    }
    panel.innerHTML = `<b>Recent Answers</b><br>` +
        recentAnswers.slice(-RECENT_ANSWERS_MAX).map(ans =>
            ans.correct === null
                ? `<div style="color:#aaa;font-size:0.95em;margin-top:0.5em;"><b>${ans.text}</b></div>`
                : `<div style="color:${ans.correct ? '#3f6' : '#f66'}">${ans.text}</div>`
        ).join('');
}
function drawLevelBar() {
    const bar = document.getElementById('level-bar');
    if (!requiredCorrect) {
        bar.innerHTML = '';
        return;
    }
    let pct = Math.min(1, progress / requiredCorrect);
    bar.innerHTML = `<div style="height:${Math.floor(220 * pct)}px;background:#4a7;border-radius:16px 16px 0 0;"></div>`;
}
function requiredCorrectForLevel(lvl) {
    if (lvl < 5) return 4;
    if (lvl < 10) return 6;
    if (lvl < 15) return 10;
    if (lvl < 20) return 18;
    return 18 + 16 * Math.floor((lvl - 15) / 5 + 1);
}

// --- Exported for other modules (if needed) ---
export {
    GRID_SIZE, tileSize, tileCenter, boardOrigin, board, player, enemies, mode, category, level, score, lives,
    requiredCorrectForLevel
};
