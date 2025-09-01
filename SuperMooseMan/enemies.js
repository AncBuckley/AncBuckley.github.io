import { drawSlime } from './Slime.js';
import { drawOwl } from './Owl.js';

export function createEnemies(level, player, board, mode, category) {
    // Spawn 2-6 enemies, not at (0,0), no duplicates
    let count = Math.min(2 + Math.floor(level / 3), 6);
    let positions = [];
    while (positions.length < count) {
        let x = Math.floor(Math.random() * 5), y = Math.floor(Math.random() * 5);
        if ((x === 0 && y === 0) || positions.some(p => p[0] === x && p[1] === y)) continue;
        positions.push([x, y]);
    }
    // Alternate types
    return positions.map((pos, i) => ({
        type: i % 2 === 0 ? 'slime' : 'owl',
        x: pos[0], y: pos[1], frozen: false
    }));
}

export function updateEnemies(enemies, player, board) {
    for (const enemy of enemies) {
        if (enemy.frozen) continue;
        if (enemy.type === 'slime') {
            // Chaser: reduce Manhattan distance
            let dx = player.x - enemy.x, dy = player.y - enemy.y;
            if (Math.abs(dx) > Math.abs(dy)) enemy.x += Math.sign(dx);
            else if (dy !== 0) enemy.y += Math.sign(dy);
        } else if (enemy.type === 'owl') {
            // Forager: seek empty/eaten tiles (BFS radius 3), else random
            // TODO: Implement BFS search for empty/eaten
            // Fallback: random step
            let dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
            let d = dirs[Math.floor(Math.random() * dirs.length)];
            enemy.x = Math.max(0, Math.min(4, enemy.x + d[0]));
            enemy.y = Math.max(0, Math.min(4, enemy.y + d[1]));
        }
    }
}

export function drawEnemies(ctx, enemies, tileSize, tileCenter) {
    for (const enemy of enemies) {
        const [cx, cy] = tileCenter(enemy.x, enemy.y);
        if (enemy.type === 'slime') drawSlime(ctx, cx, cy, tileSize, enemy.frozen);
        else if (enemy.type === 'owl') drawOwl(ctx, cx, cy, tileSize, enemy.frozen);
    }
}

export function notifyBoardHooksForEnemies(hooks) {
    // hooks: { isCellEmpty, placeWordAt, onPlayerCaught }
    // Call when enemies land on empty/eaten tiles, etc.
}

export function moveEnemyToBottomRight(enemy) {
    enemy.x = 4; enemy.y = 4;
}
