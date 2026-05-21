const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "assets", "clothing");
const cell = { w: 128, h: 216 };
const frames = 4;
// This row order matches game.js directionRow: down, left, up, right.
const directions = ["down", "left", "up", "right"];

const categories = {
  heads: { singular: "head", count: 10 },
  hats: { singular: "hat", count: 10 },
  shirts: { singular: "shirt", count: 10 },
  pants: { singular: "pants", count: 10 },
  shoes: { singular: "shoes", count: 10 }
};

const PRIMARY = "#ffffff";
const BRASS = "#d89b34";
const DARK_BRASS = "#9a6425";
const COPPER = "#b7643e";
const LEATHER = "#5b3b2e";
const DARK_LEATHER = "#2f241f";
const FUR = "#e2d0ad";
const DARK = "#172632";
const SHADOW = "#0c151d";
const GLASS = "#9fe8ff";
const STEEL = "#aab9bf";
const RED = "#b34a3c";
const CREAM = "#f1dfbb";

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16)
  ];
}

function shade(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  const mix = (value) => Math.max(0, Math.min(255, Math.round(value + amount)));
  return `#${[mix(r), mix(g), mix(b)].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function le16(value) {
  return [value & 0xff, (value >> 8) & 0xff];
}

class Canvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.pixels = Array(width * height).fill(null);
  }

  set(x, y, color) {
    const px = Math.round(x);
    const py = Math.round(y);
    if (px < 0 || py < 0 || px >= this.width || py >= this.height) return;
    this.pixels[py * this.width + px] = color.toLowerCase();
  }

  rect(x, y, w, h, color) {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const x1 = Math.ceil(x + w);
    const y1 = Math.ceil(y + h);
    for (let py = y0; py < y1; py += 1) {
      for (let px = x0; px < x1; px += 1) this.set(px, py, color);
    }
  }

  ellipse(cx, cy, rx, ry, color) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y += 1) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x += 1) {
        if (((x - cx) ** 2) / (rx ** 2) + ((y - cy) ** 2) / (ry ** 2) <= 1) this.set(x, y, color);
      }
    }
  }

  line(x1, y1, x2, y2, color, thickness = 1) {
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1))));
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      this.ellipse(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, thickness, thickness, color);
    }
  }

  capsule(x1, y1, x2, y2, radius, color) {
    const steps = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / Math.max(1, radius * 0.65)));
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      this.ellipse(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, radius, radius, color);
    }
  }

  poly(points, color) {
    const minX = Math.floor(Math.min(...points.map((p) => p.x)));
    const maxX = Math.ceil(Math.max(...points.map((p) => p.x)));
    const minY = Math.floor(Math.min(...points.map((p) => p.y)));
    const maxY = Math.ceil(Math.max(...points.map((p) => p.y)));
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        let inside = false;
        for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
          const pi = points[i];
          const pj = points[j];
          if (((pi.y > y) !== (pj.y > y)) && x < ((pj.x - pi.x) * (y - pi.y)) / (pj.y - pi.y) + pi.x) {
            inside = !inside;
          }
        }
        if (inside) this.set(x, y, color);
      }
    }
  }
}

function lzwEncode(indices, colorCount) {
  const minCodeSize = Math.max(2, Math.ceil(Math.log2(colorCount)));
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let nextCode = endCode + 1;
  const dict = new Map();
  for (let i = 0; i < clearCode; i += 1) dict.set(String(i), i);
  const codes = [clearCode];
  let phrase = String(indices[0]);
  for (let i = 1; i < indices.length; i += 1) {
    const key = String(indices[i]);
    const joined = `${phrase},${key}`;
    if (dict.has(joined)) {
      phrase = joined;
    } else {
      codes.push(dict.get(phrase));
      if (nextCode < 4096) {
        dict.set(joined, nextCode);
        nextCode += 1;
        if (nextCode === (1 << codeSize) && codeSize < 12) codeSize += 1;
      }
      phrase = key;
    }
  }
  codes.push(dict.get(phrase));
  codes.push(endCode);

  const bytes = [];
  let current = 0;
  let bitCount = 0;
  codeSize = minCodeSize + 1;
  nextCode = endCode + 1;
  let sinceClear = 0;
  for (const code of codes) {
    current |= code << bitCount;
    bitCount += codeSize;
    while (bitCount >= 8) {
      bytes.push(current & 255);
      current >>= 8;
      bitCount -= 8;
    }
    if (code === clearCode) {
      codeSize = minCodeSize + 1;
      nextCode = endCode + 1;
      sinceClear = 0;
    } else if (code !== endCode) {
      sinceClear += 1;
      if (sinceClear > 1) {
        nextCode += 1;
        if (nextCode === (1 << codeSize) && codeSize < 12) codeSize += 1;
      }
    }
  }
  if (bitCount > 0) bytes.push(current & 255);
  return { minCodeSize, bytes };
}

function gifBuffer(canvas) {
  const colors = ["#000000"];
  const colorMap = new Map([["#000000", 0]]);
  canvas.pixels.forEach((color) => {
    if (color && !colorMap.has(color)) {
      colorMap.set(color, colors.length);
      colors.push(color);
    }
  });
  if (colors.length > 256) throw new Error(`Too many GIF colors: ${colors.length}`);
  while (colors.length < 4) colors.push("#000000");
  let tableSize = 2;
  while ((1 << tableSize) < colors.length) tableSize += 1;
  const tableLength = 1 << tableSize;
  while (colors.length < tableLength) colors.push("#000000");

  const chunks = [];
  const push = (...values) => chunks.push(...values);
  const text = (value) => push(...Buffer.from(value, "ascii"));
  const word = (value) => push(...le16(value));

  text("GIF89a");
  word(canvas.width);
  word(canvas.height);
  push(0x80 | ((tableSize - 1) << 4) | (tableSize - 1));
  push(0);
  push(0);
  colors.forEach((color) => push(...hexToRgb(color)));
  push(0x21, 0xf9, 0x04, 0x09);
  word(0);
  push(0, 0);
  push(0x2c);
  word(0);
  word(0);
  word(canvas.width);
  word(canvas.height);
  push(0);

  const indices = canvas.pixels.map((color) => (color ? colorMap.get(color) : 0));
  const lzw = lzwEncode(indices, colors.length);
  push(lzw.minCodeSize);
  for (let i = 0; i < lzw.bytes.length; i += 255) {
    const block = lzw.bytes.slice(i, i + 255);
    push(block.length, ...block);
  }
  push(0, 0x3b);
  return Buffer.from(chunks);
}

function phase(frame) {
  return [0, -1, 0, 1][frame];
}

function bob(frame) {
  return frame % 2 ? -1.3 : 0;
}

function drawGear(c, x, y, r, color = BRASS) {
  c.ellipse(x, y, r, r, color);
  c.ellipse(x, y, Math.max(2, r - 4), Math.max(2, r - 4), SHADOW);
  c.ellipse(x, y, Math.max(1, r - 7), Math.max(1, r - 7), color);
  for (let i = 0; i < 8; i += 1) {
    const angle = (Math.PI * 2 * i) / 8;
    c.rect(x + Math.cos(angle) * (r + 1) - 1, y + Math.sin(angle) * (r + 1) - 1, 3, 3, color);
  }
}

function drawGoggles(c, x, y, narrow = 1) {
  c.ellipse(x - 8 * narrow, y, 8 * narrow, 6, BRASS);
  c.ellipse(x + 8 * narrow, y, 8 * narrow, 6, BRASS);
  c.ellipse(x - 8 * narrow, y, 5 * narrow, 3, GLASS);
  c.ellipse(x + 8 * narrow, y, 5 * narrow, 3, GLASS);
  c.rect(x - 2 * narrow, y - 1, 4 * narrow, 2, DARK_BRASS);
}

function drawSideGoggle(c, x, y, sign = 1) {
  c.capsule(x - sign * 22, y - 1, x + sign * 4, y - 1, 2, DARK_BRASS);
  c.ellipse(x + sign * 8, y, 10, 7, BRASS);
  c.ellipse(x + sign * 8, y, 6, 4, GLASS);
  c.ellipse(x + sign * 18, y + 1, 3, 4, DARK_BRASS);
}

function drawButtons(c, x, y, count, step = 13) {
  for (let i = 0; i < count; i += 1) c.ellipse(x, y + i * step, 2.2, 2.2, BRASS);
}

function drawHead(c, style, dir, frame) {
  const side = dir === "right" || dir === "left";
  const sign = dir === "left" ? -1 : 1;
  const y = bob(frame);
  const shapes = [
    [18, 20], [21, 22], [17, 24], [23, 19], [18, 22],
    [22, 21], [17, 20], [20, 24], [24, 20], [19, 23]
  ][style];
  const x = 64 + phase(frame) * 0.7 + (side ? sign * 2 : 0);
  c.ellipse(x, 52 + y, side ? shapes[0] * 0.62 : shapes[0], shapes[1], PRIMARY);
  c.ellipse(x + (side ? -sign * 4 : 0), 69 + y, side ? 8 : 10, 7, shade(PRIMARY, -12));
  if (side) {
    c.ellipse(x + sign * 12, 51 + y, 4, 5, PRIMARY);
    c.ellipse(x + sign * 9, 51 + y, 1.8, 1.8, SHADOW);
    c.line(x + sign * 10, 59 + y, x + sign * 19, 60 + y, LEATHER, 1);
  } else if (dir === "down") {
    c.ellipse(x - 7, 51 + y, 1.8, 1.8, SHADOW);
    c.ellipse(x + 7, 51 + y, 1.8, 1.8, SHADOW);
    c.line(x - 6, 61 + y, x + 6, 61 + y, LEATHER, style % 3 === 0 ? 2 : 1);
    if (style % 4 === 1) {
      c.ellipse(x - 9, 62 + y, 4, 2, DARK_LEATHER);
      c.ellipse(x + 9, 62 + y, 4, 2, DARK_LEATHER);
    }
  } else {
    c.rect(x - 14, 38 + y, 28, 9, shade(PRIMARY, -22));
    if (style % 3 === 2) c.capsule(x - 17, 57 + y, x + 17, 57 + y, 3, shade(PRIMARY, -18));
  }
}

function drawProfileHat(c, style, dir, frame) {
  const sign = dir === "left" ? -1 : 1;
  const y = bob(frame) - 4;
  const x = 64 + phase(frame) * 0.6 + sign * 2;
  const front = (distance) => x + sign * distance;
  const back = (distance) => x - sign * distance;

  if (style === 0) {
    c.ellipse(back(2), 45 + y, 24, 15, PRIMARY);
    c.poly([
      { x: back(27), y: 52 + y },
      { x: front(35), y: 52 + y },
      { x: front(28), y: 60 + y },
      { x: back(23), y: 58 + y }
    ], DARK_LEATHER);
    drawSideGoggle(c, front(2), 42 + y, sign);
    c.ellipse(front(28), 39 + y, 5, 5, BRASS);
  } else if (style === 1) {
    c.ellipse(front(2), 57 + y, 38, 5, DARK_LEATHER);
    c.poly([
      { x: back(16), y: 22 + y },
      { x: front(18), y: 22 + y },
      { x: front(22), y: 56 + y },
      { x: back(20), y: 56 + y }
    ], PRIMARY);
    c.line(back(17), 44 + y, front(21), 46 + y, BRASS, 3);
    drawGear(c, front(18), 38 + y, 5);
  } else if (style === 2) {
    c.ellipse(back(1), 43 + y, 28, 18, PRIMARY);
    c.poly([
      { x: back(31), y: 49 + y },
      { x: front(34), y: 49 + y },
      { x: front(29), y: 61 + y },
      { x: back(26), y: 60 + y }
    ], FUR);
    c.capsule(back(20), 55 + y, back(17), 74 + y, 6, FUR);
    c.capsule(front(21), 55 + y, front(18), 67 + y, 5, FUR);
    drawSideGoggle(c, front(1), 43 + y, sign);
  } else if (style === 3) {
    c.ellipse(front(4), 56 + y, 38, 5, DARK_LEATHER);
    c.poly([
      { x: back(22), y: 36 + y },
      { x: front(23), y: 34 + y },
      { x: front(27), y: 54 + y },
      { x: back(23), y: 54 + y }
    ], PRIMARY);
    c.poly([
      { x: back(14), y: 28 + y },
      { x: front(17), y: 27 + y },
      { x: front(22), y: 36 + y },
      { x: back(17), y: 36 + y }
    ], BRASS);
    c.ellipse(front(15), 29 + y, 7, 5, GLASS);
  } else if (style === 4) {
    c.ellipse(front(2), 55 + y, 35, 5, DARK_LEATHER);
    c.ellipse(back(2), 42 + y, 27, 14, PRIMARY);
    c.poly([
      { x: back(21), y: 46 + y },
      { x: front(25), y: 46 + y },
      { x: front(29), y: 53 + y },
      { x: back(18), y: 53 + y }
    ], BRASS);
    drawGear(c, back(20), 43 + y, 5);
  } else if (style === 5) {
    c.ellipse(back(1), 48 + y, 25, 18, PRIMARY);
    c.poly([
      { x: back(30), y: 55 + y },
      { x: front(38), y: 55 + y },
      { x: front(32), y: 63 + y },
      { x: back(26), y: 62 + y }
    ], DARK_LEATHER);
    c.line(back(16), 36 + y, back(27), 24 + y, BRASS, 2);
    c.line(front(17), 36 + y, front(31), 25 + y, BRASS, 2);
    drawSideGoggle(c, front(2), 50 + y, sign);
  } else if (style === 6) {
    c.ellipse(front(4), 58 + y, 45, 5, DARK_LEATHER);
    c.poly([
      { x: back(25), y: 55 + y },
      { x: front(30), y: 55 + y },
      { x: front(20), y: 33 + y },
      { x: back(16), y: 35 + y }
    ], PRIMARY);
    c.line(back(19), 48 + y, front(26), 47 + y, BRASS, 3);
  } else if (style === 7) {
    c.ellipse(front(3), 57 + y, 37, 5, DARK_LEATHER);
    c.poly([
      { x: back(18), y: 34 + y },
      { x: front(19), y: 33 + y },
      { x: front(23), y: 56 + y },
      { x: back(21), y: 55 + y }
    ], PRIMARY);
    c.capsule(front(18), 22 + y, front(21), 46 + y, 4, COPPER);
    c.ellipse(front(21), 19 + y, 5, 4, STEEL);
  } else if (style === 8) {
    c.ellipse(front(2), 55 + y, 36, 5, DARK_LEATHER);
    c.ellipse(back(1), 43 + y, 29, 12, PRIMARY);
    c.line(back(20), 48 + y, front(25), 48 + y, BRASS, 3);
    for (let i = -2; i <= 2; i += 1) c.line(back(9 - i * 4), 34 + y, front(10 + i * 5), 50 + y, shade(PRIMARY, -30), 1);
  } else {
    c.ellipse(front(3), 54 + y, 37, 6, DARK_LEATHER);
    c.ellipse(back(3), 42 + y, 25, 16, PRIMARY);
    c.poly([
      { x: back(12), y: 27 + y },
      { x: front(15), y: 25 + y },
      { x: front(20), y: 35 + y },
      { x: back(13), y: 36 + y }
    ], BRASS);
    c.line(front(10), 26 + y, front(16), 12 + y, BRASS, 2);
    c.ellipse(front(17), 11 + y, 4, 4, GLASS);
  }
}

function drawHat(c, style, dir, frame) {
  const side = dir === "right" || dir === "left";
  if (side) {
    drawProfileHat(c, style, dir, frame);
    return;
  }
  const sign = dir === "left" ? -1 : 1;
  const y = bob(frame) - 4;
  const narrow = dir === "up" ? 0.9 : 1;
  const x = 64 + phase(frame) * 0.6;
  const brim = 32 + (style % 3) * 4;

  if (style === 0) {
    c.ellipse(x, 45 + y, 25 * narrow, 15, PRIMARY);
    c.rect(x - 26 * narrow, 52 + y, 52 * narrow, 7, DARK_LEATHER);
    if (side) drawSideGoggle(c, x, 42 + y, sign);
    else drawGoggles(c, x, 42 + y, narrow);
    c.ellipse(x + sign * 22 * narrow, 39 + y, 5, 5, BRASS);
  } else if (style === 1) {
    c.ellipse(x, 56 + y, brim * narrow, 5, DARK_LEATHER);
    c.rect(x - 18 * narrow, 22 + y, 36 * narrow, 35, PRIMARY);
    c.rect(x - 20 * narrow, 43 + y, 40 * narrow, 7, BRASS);
    drawGear(c, x + 15 * narrow, 38 + y, 5);
  } else if (style === 2) {
    c.ellipse(x, 43 + y, 26 * narrow, 17, PRIMARY);
    c.rect(x - 30 * narrow, 49 + y, 60 * narrow, 9, FUR);
    c.capsule(x - 24 * narrow, 55 + y, x - 20 * narrow, 72 + y, 6, FUR);
    c.capsule(x + 24 * narrow, 55 + y, x + 20 * narrow, 72 + y, 6, FUR);
    if (side) drawSideGoggle(c, x, 43 + y, sign);
    else drawGoggles(c, x, 43 + y, narrow);
  } else if (style === 3) {
    c.ellipse(x, 55 + y, 34 * narrow, 5, DARK_LEATHER);
    c.rect(x - 24 * narrow, 35 + y, 48 * narrow, 18, PRIMARY);
    c.rect(x - 17 * narrow, 28 + y, 34 * narrow, 8, BRASS);
    c.ellipse(x + 2 * narrow, 29 + y, 7, 5, GLASS);
  } else if (style === 4) {
    c.ellipse(x, 54 + y, 32 * narrow, 5, DARK_LEATHER);
    c.ellipse(x, 42 + y, 25 * narrow, 13, PRIMARY);
    c.rect(x - 20 * narrow, 46 + y, 40 * narrow, 7, BRASS);
    drawGear(c, x - 16 * narrow, 43 + y, 5);
  } else if (style === 5) {
    c.ellipse(x, 48 + y, 24 * narrow, 18, PRIMARY);
    c.rect(x - 30 * narrow, 55 + y, 60 * narrow, 8, DARK_LEATHER);
    c.line(x - 18 * narrow, 36 + y, x - 27 * narrow, 24 + y, BRASS, 2);
    c.line(x + 18 * narrow, 36 + y, x + 27 * narrow, 24 + y, BRASS, 2);
    if (side) drawSideGoggle(c, x, 50 + y, sign);
    else drawGoggles(c, x, 50 + y, narrow);
  } else if (style === 6) {
    c.ellipse(x, 57 + y, 43 * narrow, 5, DARK_LEATHER);
    c.poly([
      { x: x - 27 * narrow, y: 55 + y },
      { x: x + 27 * narrow, y: 55 + y },
      { x: x + 18 * narrow, y: 34 + y },
      { x: x - 18 * narrow, y: 34 + y }
    ], PRIMARY);
    c.rect(x - 23 * narrow, 47 + y, 46 * narrow, 5, BRASS);
  } else if (style === 7) {
    c.ellipse(x, 56 + y, 34 * narrow, 5, DARK_LEATHER);
    c.rect(x - 18 * narrow, 33 + y, 36 * narrow, 22, PRIMARY);
    c.rect(x + 16 * narrow, 22 + y, 8 * narrow, 24, COPPER);
    c.ellipse(x + 20 * narrow, 19 + y, 5, 4, STEEL);
  } else if (style === 8) {
    c.ellipse(x, 54 + y, 33 * narrow, 5, DARK_LEATHER);
    c.ellipse(x, 43 + y, 28 * narrow, 11, PRIMARY);
    c.rect(x - 20 * narrow, 48 + y, 40 * narrow, 5, BRASS);
    for (let i = -2; i <= 2; i += 1) c.line(x + i * 7 * narrow, 34 + y, x + i * 10 * narrow, 50 + y, shade(PRIMARY, -30), 1);
  } else {
    c.ellipse(x, 53 + y, 34 * narrow, 6, DARK_LEATHER);
    c.ellipse(x, 41 + y, 24 * narrow, 16, PRIMARY);
    c.rect(x - 14 * narrow, 27 + y, 28 * narrow, 8, BRASS);
    c.line(x, 28 + y, x, 13 + y, BRASS, 2);
    c.ellipse(x, 11 + y, 4, 4, GLASS);
  }
}

function drawProfileShirt(c, style, dir, frame) {
  const sign = dir === "left" ? -1 : 1;
  const p = phase(frame);
  const bulky = [1, 4, 7].includes(style);
  const arm = bulky ? 9 : 7;
  const x = 64 + sign * 2;
  const front = (distance) => x + sign * distance;
  const back = (distance) => x - sign * distance;
  const longCoat = [0, 5, 8, 9].includes(style);
  const hem = longCoat ? 168 : 151;

  c.capsule(back(10), 90, back(16 + p * 3), 127, Math.max(5, arm - 2), shade(PRIMARY, -24));
  c.poly([
    { x: back(20), y: 78 },
    { x: back(7), y: 73 },
    { x: front(14), y: 78 },
    { x: front(21), y: 101 },
    { x: front(18), y: hem },
    { x: back(18), y: hem - (longCoat ? 0 : 3) }
  ], PRIMARY);
  c.poly([
    { x: back(7), y: 74 },
    { x: front(13), y: 79 },
    { x: front(7), y: 94 },
    { x: back(3), y: 88 }
  ], shade(PRIMARY, -20));
  c.line(back(18), 84, back(19), hem - 4, shade(PRIMARY, -42), 2);
  c.capsule(front(11), 86, front(28 + p * 5), 133, arm + 1, PRIMARY);
  c.ellipse(front(29 + p * 5), 136, 5, 5, DARK_LEATHER);

  if (style === 0) {
    c.line(front(14), 84, front(17), hem - 8, LEATHER, 4);
    drawButtons(c, front(12), 93, 4, 13);
    c.line(back(18), 75, front(15), 80, BRASS, 4);
    c.line(back(22), 153, front(21), 156, DARK_LEATHER, 3);
  } else if (style === 1) {
    c.capsule(back(13), 78, front(13), 81, 7, FUR);
    c.line(back(18), 145, front(18), 149, FUR, 5);
    c.line(back(4), 92, front(14), 132, LEATHER, 2);
  } else if (style === 2) {
    c.poly([
      { x: back(12), y: 84 },
      { x: front(13), y: 87 },
      { x: front(15), y: 143 },
      { x: back(12), y: 140 }
    ], DARK);
    c.line(back(7), 84, front(11), 126, LEATHER, 3);
    drawGear(c, front(9), 113, 7);
  } else if (style === 3) {
    c.poly([
      { x: back(13), y: 92 },
      { x: front(16), y: 95 },
      { x: front(17), y: 149 },
      { x: back(14), y: 146 }
    ], LEATHER);
    c.line(back(10), 100, front(13), 103, shade(LEATHER, 24), 3);
    c.line(back(18), 149, front(18), 152, BRASS, 3);
    drawButtons(c, front(8), 89, 3, 12);
  } else if (style === 4) {
    c.capsule(back(11), 80, front(11), 84, 6, STEEL);
    c.ellipse(front(10), 112, 10, 10, GLASS);
    c.line(back(20), 145, front(20), 150, BRASS, 4);
  } else if (style === 5) {
    c.line(back(17), 78, front(15), 82, DARK_LEATHER, 5);
    c.poly([
      { x: back(18), y: 88 },
      { x: back(1), y: 90 },
      { x: back(10), y: 163 },
      { x: back(22), y: 157 }
    ], shade(PRIMARY, -24));
    c.poly([
      { x: front(2), y: 84 },
      { x: front(15), y: 88 },
      { x: front(9), y: 102 }
    ], RED);
    c.line(front(6), 97, front(8), 152, RED, 3);
  } else if (style === 6) {
    c.line(back(8), 84, front(15), 139, LEATHER, 3);
    c.line(back(17), 112, front(18), 116, DARK_LEATHER, 4);
    drawGear(c, front(14), 102, 5);
  } else if (style === 7) {
    c.capsule(back(13), 78, front(12), 81, 5, FUR);
    c.poly([
      { x: front(1), y: 84 },
      { x: front(15), y: 87 },
      { x: front(14), y: 152 },
      { x: front(4), y: 151 }
    ], CREAM);
    c.line(back(16), 101, front(17), 104, BRASS, 2);
  } else if (style === 8) {
    c.poly([
      { x: back(11), y: 92 },
      { x: front(14), y: 95 },
      { x: front(17), y: 144 },
      { x: back(12), y: 141 }
    ], DARK_LEATHER);
    for (let i = 0; i < 4; i += 1) c.line(back(7), 101 + i * 9, front(12), 97 + i * 9, BRASS, 1);
    c.line(back(20), 146, front(20), 151, BRASS, 4);
  } else {
    c.poly([
      { x: back(12), y: 91 },
      { x: front(15), y: 94 },
      { x: front(17), y: 150 },
      { x: back(13), y: 147 }
    ], CREAM);
    c.line(front(5), 101, front(11), 130, RED, 4);
    c.line(back(19), 147, front(19), 152, BRASS, 3);
    drawButtons(c, front(13), 88, 3, 12);
  }
}

function torsoPoints(side, x, w, longCoat = false, sign = 1) {
  if (side) {
    const bottom = longCoat ? 168 : 151;
    return [
      { x: x - sign * w * 0.42, y: 76 },
      { x: x + sign * w * 0.5, y: 79 },
      { x: x + sign * w * 0.46, y: bottom },
      { x: x - sign * w * 0.54, y: bottom - (longCoat ? 0 : 2) }
    ];
  }
  return [
    { x: x - w / 2, y: 76 },
    { x: x + w / 2, y: 76 },
    { x: x + w / 2 - 7, y: longCoat ? 168 : 151 },
    { x: x - w / 2 + 7, y: longCoat ? 168 : 151 }
  ];
}

function drawArms(c, dir, frame, bulky = false) {
  const p = phase(frame);
  const side = dir === "right" || dir === "left";
  const sign = dir === "left" ? -1 : 1;
  const r = bulky ? 9 : 7;
  if (side) {
    c.capsule(64 - sign * 10, 89, 64 - sign * (18 + p * 3), 126, Math.max(5, r - 2), PRIMARY);
    c.capsule(64 + sign * 14, 86, 64 + sign * (28 + p * 5), 133, r + 1, PRIMARY);
    c.ellipse(64 + sign * (29 + p * 5), 136, 5, 5, DARK_LEATHER);
  } else {
    c.capsule(43, 86, 27 - p * 7, 132, r, PRIMARY);
    c.capsule(85, 86, 101 + p * 7, 132, r, PRIMARY);
    c.ellipse(27 - p * 7, 135, 5, 5, DARK_LEATHER);
    c.ellipse(101 + p * 7, 135, 5, 5, DARK_LEATHER);
  }
}

function drawShirt(c, style, dir, frame) {
  const side = dir === "right" || dir === "left";
  if (side) {
    drawProfileShirt(c, style, dir, frame);
    return;
  }
  const sign = dir === "left" ? -1 : 1;
  const x = 64 + (side ? sign * 2 : 0);
  const w = side ? 40 + (style % 3) * 3 : 45 + (style % 4) * 2;
  const longCoat = [0, 5, 8, 9].includes(style);
  drawArms(c, dir, frame, [1, 4, 7].includes(style));
  c.poly(torsoPoints(side, x, w, longCoat, sign), PRIMARY);
  c.rect(x - w / 2 + 4, 82, w - 8, 8, shade(PRIMARY, -28));

  if (style === 0) {
    c.rect(x - 4, 81, 8, 82, LEATHER);
    drawButtons(c, x + 8 * (side ? sign : 1), 88, 5);
    c.rect(x - w / 2 - 3, 74, w + 6, 9, BRASS);
    c.rect(x - 23, 151, 46, 7, DARK_LEATHER);
  } else if (style === 1) {
    c.rect(x - w / 2 - 6, 76, w + 12, 12, FUR);
    c.rect(x - w / 2 - 3, 144, w + 6, 10, FUR);
    c.ellipse(x, 80, 18, 7, FUR);
    c.line(x - w / 2 + 8, 93, x + w / 2 - 8, 139, LEATHER, 2);
  } else if (style === 2) {
    c.rect(x - w / 2 + 5, 78, w - 10, 65, DARK);
    c.line(x - 17, 83, x + 17, 139, LEATHER, 3);
    c.line(x + 17, 83, x - 17, 139, LEATHER, 3);
    drawGear(c, x, 112, 7);
  } else if (style === 3) {
    c.rect(x - 18, 92, 36, 58, LEATHER);
    c.rect(x - 15, 96, 30, 8, shade(LEATHER, 24));
    c.rect(x - 21, 148, 42, 6, BRASS);
    drawButtons(c, x, 88, 4, 11);
  } else if (style === 4) {
    c.rect(x - w / 2 - 2, 78, w + 4, 15, STEEL);
    c.rect(x - 13, 100, 26, 28, DARK);
    c.ellipse(x, 114, 10, 10, GLASS);
    c.rect(x - 27, 144, 54, 8, BRASS);
  } else if (style === 5) {
    c.rect(x - w / 2 - 4, 76, w + 8, 12, DARK_LEATHER);
    c.poly([
      { x: x - w / 2 - 9, y: 86 },
      { x: x - 8, y: 88 },
      { x: x - 16, y: 165 },
      { x: x - w / 2 - 14, y: 158 }
    ], shade(PRIMARY, -24));
    c.rect(x - 10, 84, 20, 13, RED);
    c.rect(x - 2, 97, 5, 54, RED);
  } else if (style === 6) {
    c.line(x - 18, 82, x + 18, 146, LEATHER, 3);
    c.line(x + 18, 82, x - 18, 146, LEATHER, 3);
    c.rect(x - 22, 108, 44, 8, DARK_LEATHER);
    drawGear(c, x + 16, 101, 5);
  } else if (style === 7) {
    c.rect(x - w / 2 - 4, 76, w + 8, 9, FUR);
    c.rect(x - 17, 83, 34, 10, CREAM);
    c.rect(x - 5, 83, 10, 70, CREAM);
    c.line(x - 20, 101, x + 20, 101, BRASS, 2);
  } else if (style === 8) {
    c.rect(x - 18, 91, 36, 52, DARK_LEATHER);
    for (let i = 0; i < 4; i += 1) c.line(x - 15, 100 + i * 10, x + 15, 96 + i * 10, BRASS, 1);
    c.rect(x - 25, 145, 50, 9, BRASS);
    drawGear(c, x - 22, 119, 5);
  } else {
    c.rect(x - 20, 90, 40, 60, CREAM);
    c.rect(x - 4, 101, 8, 28, RED);
    c.rect(x - 14, 111, 28, 8, RED);
    c.rect(x - 22, 146, 44, 7, BRASS);
    drawButtons(c, x + 17, 87, 4, 12);
  }

  if (side) {
    const bottom = longCoat ? 164 : 147;
    c.capsule(x - sign * (w * 0.42), 84, x - sign * (w * 0.48), bottom, 2, shade(PRIMARY, -42));
    c.poly([
      { x: x - sign * 5, y: 78 },
      { x: x + sign * 10, y: 80 },
      { x: x + sign * 16, y: 101 },
      { x: x + sign * 2, y: 94 }
    ], shade(PRIMARY, -20));
    c.line(x + sign * 5, 82, x + sign * 14, 103, BRASS, 1);
  }
}

function drawPants(c, style, dir, frame) {
  const p = phase(frame);
  const side = dir === "right" || dir === "left";
  const sign = dir === "left" ? -1 : 1;
  c.rect(side ? 53 : 43, 123, side ? 24 : 42, 20, PRIMARY);
  if (side) {
    c.capsule(63, 136, 65 + sign * (6 + p * 5), 184, 9, PRIMARY);
    c.capsule(60, 136, 58 - sign * (3 + p * 4), 180, 7, PRIMARY);
    c.rect(55, 139, 22, 6, LEATHER);
  } else {
    c.capsule(55, 136, 50 + p * 7, 184, 9, PRIMARY);
    c.capsule(73, 136, 78 - p * 7, 184, 9, PRIMARY);
    c.rect(42, 137, 44, 6, LEATHER);
  }

  if (style === 0) {
    c.rect(48, 151, 11, 19, LEATHER);
    c.rect(69, 151, 11, 19, LEATHER);
    c.rect(41, 126, 46, 6, BRASS);
  } else if (style === 1) {
    c.rect(45, 145, 38, 12, FUR);
    c.rect(47, 170, 13, 7, BRASS);
    c.rect(68, 170, 13, 7, BRASS);
  } else if (style === 2) {
    c.line(51, 123, 58, 91, LEATHER, 3);
    c.line(77, 123, 70, 91, LEATHER, 3);
    c.rect(47, 132, 34, 8, BRASS);
    drawGear(c, 82, 139, 5);
  } else if (style === 3) {
    c.rect(39, 123, 50, 30, shade(PRIMARY, -28));
    c.rect(43, 153, 42, 7, BRASS);
  } else if (style === 4) {
    c.rect(47, 151, 12, 14, STEEL);
    c.rect(69, 151, 12, 14, STEEL);
    c.line(55, 136, 49, 180, DARK_BRASS, 2);
    c.line(73, 136, 79, 180, DARK_BRASS, 2);
  } else if (style === 5) {
    c.rect(43, 176, 42, 9, FUR);
    c.rect(41, 126, 46, 5, DARK_LEATHER);
    c.rect(51, 128, 7, 53, shade(PRIMARY, -24));
    c.rect(70, 128, 7, 53, shade(PRIMARY, -24));
  } else if (style === 6) {
    c.rect(44, 132, 40, 7, BRASS);
    c.line(46, 144, 61, 183, LEATHER, 2);
    c.line(82, 144, 67, 183, LEATHER, 2);
    c.ellipse(52, 158, 5, 5, GLASS);
  } else if (style === 7) {
    c.rect(43, 123, 42, 18, DARK_LEATHER);
    c.rect(49, 143, 11, 40, PRIMARY);
    c.rect(68, 143, 11, 40, PRIMARY);
    c.rect(47, 155, 13, 5, BRASS);
    c.rect(68, 155, 13, 5, BRASS);
  } else if (style === 8) {
    c.line(50, 126, 82, 126, BRASS, 2);
    for (let i = 0; i < 3; i += 1) {
      c.rect(47, 147 + i * 10, 13, 3, DARK_LEATHER);
      c.rect(68, 147 + i * 10, 13, 3, DARK_LEATHER);
    }
  } else {
    c.rect(43, 123, 42, 22, CREAM);
    c.rect(45, 147, 15, 36, PRIMARY);
    c.rect(68, 147, 15, 36, PRIMARY);
    c.rect(42, 141, 44, 5, BRASS);
  }
}

function drawShoes(c, style, dir, frame) {
  const p = phase(frame);
  const side = dir === "right" || dir === "left";
  const sign = dir === "left" ? -1 : 1;
  if (side) {
    c.ellipse(65 + sign * (7 + p * 5), 190, 15, 6, PRIMARY);
    c.ellipse(58 - sign * (2 + p * 3), 187, 11, 5, PRIMARY);
  } else {
    c.ellipse(50 + p * 7, 190, 13, 6, PRIMARY);
    c.ellipse(78 - p * 7, 190, 13, 6, PRIMARY);
  }
  if (style === 0) {
    c.line(42, 187, 58, 194, BRASS, 1);
    c.line(70, 187, 86, 194, BRASS, 1);
  } else if (style === 1) {
    c.rect(38, 185, 22, 7, STEEL);
    c.rect(68, 185, 22, 7, STEEL);
    c.ellipse(49, 188, 4, 3, BRASS);
    c.ellipse(79, 188, 4, 3, BRASS);
  } else if (style === 2) {
    c.rect(39, 178, 20, 9, FUR);
    c.rect(69, 178, 20, 9, FUR);
  } else if (style === 3) {
    c.rect(40, 171, 18, 19, PRIMARY);
    c.rect(70, 171, 18, 19, PRIMARY);
    c.rect(43, 176, 12, 4, BRASS);
    c.rect(73, 176, 12, 4, BRASS);
  } else if (style === 4) {
    c.rect(40, 176, 48, 8, CREAM);
    c.rect(42, 184, 46, 4, BRASS);
  } else if (style === 5) {
    for (let i = 0; i < 3; i += 1) {
      c.line(42 + i * 6, 194, 45 + i * 6, 198, STEEL, 1);
      c.line(72 + i * 6, 194, 75 + i * 6, 198, STEEL, 1);
    }
  } else if (style === 6) {
    c.rect(39, 180, 20, 11, shade(PRIMARY, -28));
    c.rect(69, 180, 20, 11, shade(PRIMARY, -28));
    c.line(40, 187, 90, 187, BRASS, 1);
  } else if (style === 7) {
    c.rect(39, 180, 20, 5, BRASS);
    c.rect(69, 180, 20, 5, BRASS);
    c.ellipse(48, 183, 3, 3, DARK_BRASS);
    c.ellipse(78, 183, 3, 3, DARK_BRASS);
  } else if (style === 8) {
    c.rect(41, 168, 17, 22, PRIMARY);
    c.rect(70, 168, 17, 22, PRIMARY);
    c.rect(41, 184, 47, 5, DARK_LEATHER);
  } else {
    c.line(30, 196, 62, 196, FUR, 3);
    c.line(66, 196, 98, 196, FUR, 3);
    c.line(33, 192, 59, 200, BRASS, 1);
    c.line(69, 192, 95, 200, BRASS, 1);
  }
}

function drawPart(c, category, style, dir, frame) {
  if (category === "heads") drawHead(c, style, dir, frame);
  if (category === "hats") drawHat(c, style, dir, frame);
  if (category === "shirts") drawShirt(c, style, dir, frame);
  if (category === "pants") drawPants(c, style, dir, frame);
  if (category === "shoes") drawShoes(c, style, dir, frame);
}

function writeSpriteSheet(folder, style) {
  const canvas = new Canvas(cell.w * frames, cell.h * directions.length);
  directions.forEach((dir, row) => {
    for (let frame = 0; frame < frames; frame += 1) {
      const part = new Canvas(cell.w, cell.h);
      drawPart(part, folder, style, dir, frame);
      for (let y = 0; y < cell.h; y += 1) {
        for (let x = 0; x < cell.w; x += 1) {
          const color = part.pixels[y * cell.w + x];
          if (color) canvas.set(frame * cell.w + x, row * cell.h + y, color);
        }
      }
    }
  });
  return gifBuffer(canvas);
}

for (const [folder, config] of Object.entries(categories)) {
  const dir = path.join(root, folder);
  fs.mkdirSync(dir, { recursive: true });
  for (let index = 0; index < config.count; index += 1) {
    const id = `${config.singular}-${String(index + 1).padStart(2, "0")}`;
    fs.writeFileSync(path.join(dir, `${id}.gif`), writeSpriteSheet(folder, index));
  }
}

console.log("steampunk clothing gif sprite sheets generated");
