const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "assets", "clothing");
const cell = { w: 128, h: 216 };
const frames = 4;
const directions = ["down", "right", "up", "left"];

const categories = {
  heads: { singular: "head", count: 10 },
  hats: { singular: "hat", count: 10 },
  shirts: { singular: "shirt", count: 10 },
  pants: { singular: "pants", count: 10 },
  shoes: { singular: "shoes", count: 10 }
};

function le16(value) {
  return [value & 0xff, (value >> 8) & 0xff];
}

class BitWriter {
  constructor() {
    this.bytes = [];
    this.buffer = 0;
    this.bits = 0;
  }

  write(code, size) {
    this.buffer |= code << this.bits;
    this.bits += size;
    while (this.bits >= 8) {
      this.bytes.push(this.buffer & 0xff);
      this.buffer >>= 8;
      this.bits -= 8;
    }
  }

  finish() {
    if (this.bits > 0) this.bytes.push(this.buffer & 0xff);
    return this.bytes;
  }
}

function lzwEncode(indices, minCodeSize = 2) {
  const clear = 1 << minCodeSize;
  const end = clear + 1;
  let codeSize = minCodeSize + 1;
  const writer = new BitWriter();

  for (let i = 0; i < indices.length; i += 2) {
    writer.write(clear, codeSize);
    writer.write(indices[i] || 0, codeSize);
    if (i + 1 < indices.length) writer.write(indices[i + 1] || 0, codeSize);
  }
  writer.write(end, codeSize);
  return writer.finish();
}

function gifBuffer(width, height, indices) {
  const imageData = lzwEncode(indices, 2);
  const blocks = [];
  for (let i = 0; i < imageData.length; i += 255) {
    const chunk = imageData.slice(i, i + 255);
    blocks.push(chunk.length, ...chunk);
  }
  blocks.push(0);
  return Buffer.from([
    ...Buffer.from("GIF89a", "ascii"),
    ...le16(width),
    ...le16(height),
    0xf0,
    0,
    0,
    0, 0, 0,
    255, 255, 255,
    0x21, 0xf9, 0x04, 0x01, 0, 0, 0, 0,
    0x2c,
    0, 0, 0, 0,
    ...le16(width),
    ...le16(height),
    0,
    2,
    ...blocks,
    0x3b
  ]);
}

function setPixel(sheet, width, height, x, y) {
  const px = Math.round(x);
  const py = Math.round(y);
  if (px < 0 || py < 0 || px >= width || py >= height) return;
  sheet[py * width + px] = 1;
}

function fillEllipse(sheet, width, height, ox, oy, cx, cy, rx, ry) {
  const minX = Math.floor(cx - rx);
  const maxX = Math.ceil(cx + rx);
  const minY = Math.floor(cy - ry);
  const maxY = Math.ceil(cy + ry);
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const nx = (x - cx) / rx;
      const ny = (y - cy) / ry;
      if (nx * nx + ny * ny <= 1) setPixel(sheet, width, height, ox + x, oy + y);
    }
  }
}

function fillRect(sheet, width, height, ox, oy, x, y, w, h) {
  for (let py = Math.floor(y); py <= Math.ceil(y + h); py += 1) {
    for (let px = Math.floor(x); px <= Math.ceil(x + w); px += 1) {
      setPixel(sheet, width, height, ox + px, oy + py);
    }
  }
}

function fillPolygon(sheet, width, height, ox, oy, points) {
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
      if (inside) setPixel(sheet, width, height, ox + x, oy + y);
    }
  }
}

function fillCapsule(sheet, width, height, ox, oy, x1, y1, x2, y2, radius) {
  const steps = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / Math.max(1, radius * 0.7)));
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    fillEllipse(sheet, width, height, ox, oy, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, radius, radius);
  }
}

function phase(frame) {
  return [0, -1, 0, 1][frame];
}

function drawHead(sheet, width, height, ox, oy, style, dir, frame) {
  const side = dir === "right" || dir === "left";
  const bob = frame % 2 ? -1.3 : 0;
  const variants = [
    [18, 19], [20, 22], [17, 23], [22, 18], [16, 22],
    [21, 20], [18, 24], [23, 19], [17, 21], [22, 22]
  ][style];
  fillEllipse(sheet, width, height, ox, oy, 64 + phase(frame) * 0.8, 52 + bob, side ? variants[0] * 0.66 : variants[0], variants[1]);
  if (dir === "down") {
    fillEllipse(sheet, width, height, ox, oy, 58, 52 + bob, 2, 2);
    fillEllipse(sheet, width, height, ox, oy, 70, 52 + bob, 2, 2);
  }
}

function drawHat(sheet, width, height, ox, oy, style, dir, frame) {
  const side = dir === "right" || dir === "left";
  const bob = frame % 2 ? -1.4 : 0;
  const lift = 4;
  const y = bob - lift;
  const narrow = side ? 0.72 : dir === "up" ? 0.92 : 1;
  const x = 64 + phase(frame) * 0.6 + (dir === "right" ? 2 : dir === "left" ? -2 : 0);
  const brim = 34 + (style % 4) * 3;
  fillEllipse(sheet, width, height, ox, oy, x, 55 + y, brim * narrow, 5 + (style % 3));
  if (style % 5 === 0) {
    fillPolygon(sheet, width, height, ox, oy, [
      { x: x - 28 * narrow, y: 54 + y },
      { x: x + 28 * narrow, y: 54 + y },
      { x: x + 20 * narrow, y: 35 + y },
      { x: x - 20 * narrow, y: 35 + y }
    ]);
  } else if (style % 5 === 1) {
    fillRect(sheet, width, height, ox, oy, x - 21 * narrow, 35 + y, 42 * narrow, 22);
  } else if (style % 5 === 2) {
    fillEllipse(sheet, width, height, ox, oy, x, 42 + y, 26 * narrow, 15);
    fillEllipse(sheet, width, height, ox, oy, x, 26 + y, 6, 6);
  } else if (style % 5 === 3) {
    fillPolygon(sheet, width, height, ox, oy, [
      { x: x - 24 * narrow, y: 56 + y },
      { x: x + 24 * narrow, y: 56 + y },
      { x: x, y: 28 + y }
    ]);
  } else {
    fillEllipse(sheet, width, height, ox, oy, x, 43 + y, 25 * narrow, 13);
    fillEllipse(sheet, width, height, ox, oy, x + 24 * narrow, 37 + y, 7, 7);
  }
}

function drawShirt(sheet, width, height, ox, oy, style, dir, frame) {
  const p = phase(frame);
  const side = dir === "right" || dir === "left";
  const sign = dir === "left" ? -1 : 1;
  const torsoW = side ? 28 + (style % 3) * 2 : 43 + (style % 4) * 2;
  const torsoX = 64 - torsoW / 2 + (side ? sign * 3 : 0);
  fillPolygon(sheet, width, height, ox, oy, [
    { x: torsoX, y: 77 },
    { x: torsoX + torsoW, y: 77 },
    { x: torsoX + torsoW - 6, y: 164 },
    { x: torsoX + 6, y: 164 }
  ]);
  if (side) {
    fillCapsule(sheet, width, height, ox, oy, 64 + sign * 12, 86, 64 + sign * (22 + p * 5), 133, 8);
    fillCapsule(sheet, width, height, ox, oy, 64 - sign * 4, 89, 64 - sign * (9 + p * 3), 126, 6);
  } else {
    fillCapsule(sheet, width, height, ox, oy, 43, 86, 27 - p * 7, 132, 8);
    fillCapsule(sheet, width, height, ox, oy, 85, 86, 101 + p * 7, 132, 8);
  }
  if (style % 3 === 0) fillRect(sheet, width, height, ox, oy, 58, 83, 12, 80);
  if (style % 4 === 1) fillEllipse(sheet, width, height, ox, oy, 64, 116, 9, 9);
}

function drawPants(sheet, width, height, ox, oy, style, dir, frame) {
  const p = phase(frame);
  const side = dir === "right" || dir === "left";
  const sign = dir === "left" ? -1 : 1;
  fillRect(sheet, width, height, ox, oy, side ? 52 : 43, 122, side ? 24 : 42, 19);
  if (side) {
    fillCapsule(sheet, width, height, ox, oy, 63, 136, 65 + sign * (6 + p * 5), 184, 9);
    fillCapsule(sheet, width, height, ox, oy, 60, 136, 58 - sign * (3 + p * 4), 180, 7);
  } else {
    fillCapsule(sheet, width, height, ox, oy, 55, 136, 50 + p * 7, 184, 9);
    fillCapsule(sheet, width, height, ox, oy, 73, 136, 78 - p * 7, 184, 9);
  }
  if (style % 3 === 0) fillRect(sheet, width, height, ox, oy, 55, 128, 18, 15);
}

function drawShoes(sheet, width, height, ox, oy, style, dir, frame) {
  const p = phase(frame);
  const side = dir === "right" || dir === "left";
  const sign = dir === "left" ? -1 : 1;
  if (side) {
    fillEllipse(sheet, width, height, ox, oy, 65 + sign * (7 + p * 5), 190, 15, 6);
    fillEllipse(sheet, width, height, ox, oy, 58 - sign * (2 + p * 3), 187, 11, 5);
  } else {
    fillEllipse(sheet, width, height, ox, oy, 50 + p * 7, 190, 13, 6);
    fillEllipse(sheet, width, height, ox, oy, 78 - p * 7, 190, 13, 6);
  }
  if (style % 4 === 0) fillRect(sheet, width, height, ox, oy, 42, 189, 45, 4);
}

function drawPart(sheet, width, height, ox, oy, category, style, dir, frame) {
  if (category === "heads") drawHead(sheet, width, height, ox, oy, style, dir, frame);
  if (category === "hats") drawHat(sheet, width, height, ox, oy, style, dir, frame);
  if (category === "shirts") drawShirt(sheet, width, height, ox, oy, style, dir, frame);
  if (category === "pants") drawPants(sheet, width, height, ox, oy, style, dir, frame);
  if (category === "shoes") drawShoes(sheet, width, height, ox, oy, style, dir, frame);
}

function writeSpriteSheet(folder, style) {
  const width = cell.w * frames;
  const height = cell.h * directions.length;
  const sheet = new Uint8Array(width * height);
  directions.forEach((dir, row) => {
    for (let frame = 0; frame < frames; frame += 1) {
      drawPart(sheet, width, height, frame * cell.w, row * cell.h, folder, style, dir, frame);
    }
  });
  return gifBuffer(width, height, sheet);
}

for (const [folder, config] of Object.entries(categories)) {
  const dir = path.join(root, folder);
  fs.mkdirSync(dir, { recursive: true });
  for (let index = 0; index < config.count; index += 1) {
    const id = `${config.singular}-${String(index + 1).padStart(2, "0")}`;
    fs.writeFileSync(path.join(dir, `${id}.gif`), writeSpriteSheet(folder, index));
  }
}

console.log("gif clothing sprite sheets generated");
