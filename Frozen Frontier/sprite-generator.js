const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "assets", "sprites");
fs.mkdirSync(outDir, { recursive: true });

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

function createCanvas(width, height) {
  return {
    width,
    height,
    pixels: Array(width * height).fill(null),
    set(x, y, color) {
      x = Math.round(x);
      y = Math.round(y);
      if (x < 0 || y < 0 || x >= width || y >= height) return;
      this.pixels[y * width + x] = color;
    },
    rect(x, y, w, h, color) {
      for (let py = Math.round(y); py < Math.round(y + h); py += 1) {
        for (let px = Math.round(x); px < Math.round(x + w); px += 1) this.set(px, py, color);
      }
    },
    ellipse(cx, cy, rx, ry, color) {
      for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y += 1) {
        for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x += 1) {
          if (((x - cx) ** 2) / (rx ** 2) + ((y - cy) ** 2) / (ry ** 2) <= 1) this.set(x, y, color);
        }
      }
    },
    tri(x1, y1, x2, y2, x3, y3, color) {
      const minX = Math.floor(Math.min(x1, x2, x3));
      const maxX = Math.ceil(Math.max(x1, x2, x3));
      const minY = Math.floor(Math.min(y1, y2, y3));
      const maxY = Math.ceil(Math.max(y1, y2, y3));
      const area = (x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1);
      for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) {
          const a = ((x2 - x) * (y3 - y) - (y2 - y) * (x3 - x)) / area;
          const b = ((x3 - x) * (y1 - y) - (y3 - y) * (x1 - x)) / area;
          const c = 1 - a - b;
          if (a >= 0 && b >= 0 && c >= 0) this.set(x, y, color);
        }
      }
    },
    line(x1, y1, x2, y2, color, thickness = 1) {
      const steps = Math.max(1, Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)));
      for (let i = 0; i <= steps; i += 1) {
        const x = x1 + (x2 - x1) * (i / steps);
        const y = y1 + (y2 - y1) * (i / steps);
        this.ellipse(x, y, thickness, thickness, color);
      }
    },
    poly(points, color) {
      const [first, ...rest] = points;
      for (let i = 1; i < rest.length; i += 1) this.tri(first[0], first[1], rest[i - 1][0], rest[i - 1][1], rest[i][0], rest[i][1], color);
    }
  };
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

function encodeGif(frames, fileName, delay = 12) {
  const frameList = Array.isArray(frames) ? frames : [frames];
  const colors = ["#000000"];
  const colorMap = new Map([["#000000", 0]]);
  frameList.forEach((canvas) => {
    canvas.pixels.forEach((color) => {
      if (color && !colorMap.has(color)) {
        colorMap.set(color, colors.length);
        colors.push(color);
      }
    });
  });
  while (colors.length < 4) colors.push("#000000");
  let tableSize = 2;
  while ((1 << tableSize) < colors.length) tableSize += 1;
  const tableLength = 1 << tableSize;
  while (colors.length < tableLength) colors.push("#000000");

  const chunks = [];
  const push = (...values) => chunks.push(...values);
  const text = (value) => push(...Buffer.from(value, "ascii"));
  const word = (value) => push(value & 255, (value >> 8) & 255);

  text("GIF89a");
  word(frameList[0].width);
  word(frameList[0].height);
  push(0x80 | ((tableSize - 1) << 4) | (tableSize - 1));
  push(0);
  push(0);
  colors.forEach((color) => push(...hexToRgb(color)));
  push(0x21, 0xff, 0x0b);
  text("NETSCAPE2.0");
  push(0x03, 0x01, 0x00, 0x00, 0x00);

  frameList.forEach((canvas) => {
    const indices = canvas.pixels.map((color) => (color ? colorMap.get(color) : 0));
    push(0x21, 0xf9, 0x04, 0x09);
    word(delay);
    push(0, 0);
    push(0x2c);
    word(0);
    word(0);
    word(canvas.width);
    word(canvas.height);
    push(0);
    const lzw = lzwEncode(indices, colors.length);
    push(lzw.minCodeSize);
    for (let i = 0; i < lzw.bytes.length; i += 255) {
      const block = lzw.bytes.slice(i, i + 255);
      push(block.length, ...block);
    }
    push(0);
  });
  push(0x3b);
  fs.writeFileSync(path.join(outDir, fileName), Buffer.from(chunks));
}

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let c = index;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data = Buffer.alloc(0)) {
  const name = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])), 0);
  return Buffer.concat([length, name, data, checksum]);
}

function encodePng(canvas, fileName) {
  const zlib = require("zlib");
  const header = Buffer.alloc(13);
  header.writeUInt32BE(canvas.width, 0);
  header.writeUInt32BE(canvas.height, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  const rows = [];
  for (let y = 0; y < canvas.height; y += 1) {
    const row = Buffer.alloc(1 + canvas.width * 4);
    row[0] = 0;
    for (let x = 0; x < canvas.width; x += 1) {
      const color = canvas.pixels[y * canvas.width + x];
      const offset = 1 + x * 4;
      if (color) {
        const [r, g, b] = hexToRgb(color);
        row[offset] = r;
        row[offset + 1] = g;
        row[offset + 2] = b;
        row[offset + 3] = color === "#000000" ? 90 : 255;
      }
    }
    rows.push(row);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const data = zlib.deflateSync(Buffer.concat(rows));
  fs.writeFileSync(path.join(outDir, fileName), Buffer.concat([
    signature,
    pngChunk("IHDR", header),
    pngChunk("IDAT", data),
    pngChunk("IEND")
  ]));
}

function blit(target, source, dx, dy) {
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const color = source.pixels[y * source.width + x];
      if (color) target.set(dx + x, dy + y, color);
    }
  }
}

function encodeSheet(frames, fileName) {
  const rows = Array.isArray(frames[0]) ? frames : [frames];
  const frameW = rows[0][0].width;
  const frameH = rows[0][0].height;
  const sheet = createCanvas(frameW * rows[0].length, frameH * rows.length);
  rows.forEach((row, rowIndex) => {
    row.forEach((frame, frameIndex) => blit(sheet, frame, frameW * frameIndex, frameH * rowIndex));
  });
  encodePng(sheet, fileName);
}

function drawBuildingFrame({ file, wall, roof, accent, chimney = false, light = "#ffb35c", frame = 0, level = 0 }) {
  const c = createCanvas(192, 192);
  const glow = frame % 2 ? light : shade(light, -22);
  const trim = level === 2 ? "#ffd166" : level === 1 ? "#73df9b" : "#9fb2bf";
  const awning = level === 2 ? "#dff7ff" : shade(wall, 18);
  c.ellipse(99, 159, 72, 20, "#000000");
  c.rect(41, 72, 104, 78, wall);
  c.rect(132, 82, 22, 68, shade(wall, -22));
  c.tri(24, 74, 96, 14, 168, 74, roof);
  c.tri(38, 72, 96, 28, 154, 72, "#dff7ff");
  c.rect(58, 101, 24, 20, glow);
  c.rect(110, 101, 24, 20, glow);
  c.rect(83, 124, 27, 26, "#172334");
  c.line(45, 84, 145, 84, trim, 2 + level);
  c.line(45, 108, 145, 108, trim, 2 + level);
  c.line(45, 132, 145, 132, trim, 2 + level);
  c.rect(50, 148, 95, 7 + level * 2, awning);
  if (level >= 1) {
    c.rect(28, 143, 132, 10, trim);
    c.rect(37, 64, 118, 8, trim);
  }
  if (level >= 2) {
    c.rect(74, 54, 44, 10, "#ffd166");
    c.ellipse(96, 36, 12, 12, "#ffd166");
  }
  if (chimney) {
    c.rect(132, 22, 24, 56, "#2c2032");
    c.rect(128, 18, 32, 10, "#1b1724");
  }
  return c;
}

function animatedBuilding(file, wall, roof, accent, options = {}) {
  const frames = [0, 1, 2].map((level) => [0, 1, 2, 3].map((frame) => drawBuildingFrame({ file, wall, roof, accent, light: accent, chimney: options.chimney, frame, level })));
  encodeGif(frames[0], file, 18);
  encodeSheet(frames, file.replace(".gif", "-sheet.png"));
}

function tower() {
  const rows = [0, 1, 2].map((level) => [0, 1, 2, 3].map((frame) => {
    const c = createCanvas(160, 192);
    const flagWave = [-7, 2, 8, 1][frame];
    const light = frame % 2 ? "#ffb35c" : "#e99347";
    const trim = level === 2 ? "#ffd166" : level === 1 ? "#73df9b" : "#dff7ff";
    c.ellipse(80, 168, 56, 16, "#000000");
    c.line(53, 171, 68, 71, level ? "#3a2a24" : "#241a18", 5 + level);
    c.line(106, 171, 91, 71, level ? "#3a2a24" : "#241a18", 5 + level);
    c.line(63, 137, 98, 137, trim, 3 + level);
    c.rect(50, 55, 60, 48, "#5f4633");
    c.rect(40, 44, 80, 22, "#2b1d1b");
    c.tri(38, 45, 80, 9, 122, 45, "#1b2431");
    c.line(80, 10, 80, 139, trim, 2 + level);
    c.poly([[83, 14], [132, 27 + flagWave], [83, 42], [99, 28 + flagWave]], level === 2 ? "#ffd166" : "#ff5d66");
    c.rect(61, 72, 16, 16, light);
    c.rect(84, 72, 16, 16, light);
    if (level >= 1) c.rect(43, 103, 74, 9, trim);
    if (level >= 2) c.ellipse(80, 40, 9, 9, "#ffd166");
    return c;
  }));
  encodeGif(rows[0], "tower.gif", 12);
  encodeSheet(rows, "tower-sheet.png");
}

function farm() {
  const rows = [0, 1, 2].map((level) => [0, 1, 2, 3].map((frame) => {
    const c = createCanvas(192, 128);
    const trim = level === 2 ? "#ffd166" : level === 1 ? "#73df9b" : "#dff7ff";
    c.ellipse(96, 107, 82, 16, "#000000");
    c.rect(22, 30, 148, 76, "#244e38");
    c.rect(16, 15, 160, 18 + level * 2, trim);
    for (let y = 47; y < 99; y += 17) c.rect(38, y, 116, 9, y % 2 ? "#3b7d4e" : "#315f42");
    for (let x = 38; x < 158; x += 26) c.line(x, 30, x, 106, level ? trim : "#8f6e50", 2);
    for (let x = 45; x < 150; x += 16) c.ellipse(x, 96 - Math.sin(frame + x) * 2, 7, 7, frame % 2 ? "#75df76" : "#68c96d");
    if (level >= 1) c.rect(28, 24, 136, 5, "#ffd166");
    if (level >= 2) c.ellipse(158, 42, 11, 11, "#ffd166");
    return c;
  }));
  encodeGif(rows[0], "farm.gif", 16);
  encodeSheet(rows, "farm-sheet.png");
}

function tree() {
  const frames = [0, 1, 2, 3].map((frame) => {
    const c = createCanvas(128, 192);
    const sway = [-3, 0, 3, 0][frame];
    c.ellipse(66, 168, 44, 12, "#000000");
    c.rect(58, 103, 16, 61, "#4b3325");
    c.tri(64 + sway, 7, 14 + sway, 105, 114 + sway, 105, "#1f4d43");
    c.tri(64 - sway, 45, 4 - sway, 146, 124 - sway, 146, "#173a35");
    c.tri(63 + sway, 13, 33 + sway, 72, 75 + sway, 57, "#dff7ff");
    c.tri(54 - sway, 72, 14 - sway, 132, 60 - sway, 113, "#dff7ff");
    return c;
  });
  encodeGif(frames, "tree.gif", 14);
  encodeSheet(frames, "tree-sheet.png");
}

function drawPersonPose(coat, hat, frame, direction) {
    const c = createCanvas(128, 176);
    const step = [-9, 4, 9, -4][frame];
    const arm = [6, -5, -7, 4][frame];
    c.ellipse(65, 154, 44, 13, "#000000");
    if (direction === "side") {
      c.line(55, 98, 39 - step, 153, "#182332", 5);
      c.line(76, 98, 91 + step, 153, "#182332", 5);
      c.line(55, 77, 30, 113 + arm, "#182332", 5);
      c.line(77, 77, 97, 108 - arm, "#182332", 5);
      c.ellipse(70, 43, 22, 24, "#f2a65e");
      c.rect(41, 63, 47, 62, coat);
      c.rect(52, 70, 27, 12, "#f6fbff");
      c.rect(78, 70, 12, 48, shade(coat, -32));
      c.rect(41, 20, 52, 19, hat);
      c.rect(52, 14, 34, 14, shade(hat, 18));
      c.rect(78, 40, 6, 6, "#dff7ff");
    } else if (direction === "up") {
      c.line(49, 98, 33 - step, 153, "#182332", 5);
      c.line(78, 98, 95 + step, 153, "#182332", 5);
      c.line(49, 78, 25, 114 + arm, "#182332", 5);
      c.line(79, 78, 103, 114 - arm, "#182332", 5);
      c.ellipse(64, 43, 25, 25, shade("#f2a65e", -18));
      c.rect(36, 63, 56, 62, coat);
      c.rect(44, 72, 40, 32, shade(coat, -28));
      c.rect(35, 20, 58, 20, hat);
      c.rect(43, 13, 42, 16, shade(hat, 18));
      c.rect(53, 118, 13, 8, "#243244");
      c.rect(70, 118, 13, 8, "#243244");
      return c;
    } else {
      c.line(49, 98, 33 - step, 153, "#182332", 5);
      c.line(78, 98, 95 + step, 153, "#182332", 5);
      c.line(48, 77, 18, 112 + arm, "#182332", 5);
      c.line(80, 77, 110, 112 - arm, "#182332", 5);
      c.ellipse(64, 43, 25, 25, "#f2a65e");
      c.rect(36, 63, 56, 62, coat);
      c.rect(47, 70, 34, 12, "#f6fbff");
      c.rect(76, 70, 14, 48, shade(coat, -32));
      c.rect(35, 20, 58, 19, hat);
      c.rect(44, 14, 40, 14, shade(hat, 18));
      c.rect(54, 39, 6, 6, "#dff7ff");
      c.rect(70, 39, 6, 6, "#dff7ff");
    }
    c.rect(53, 118, 13, 8, "#243244");
    c.rect(70, 118, 13, 8, "#243244");
    return c;
}

function person(file, coat, hat = "#173047") {
  const rows = ["down", "side", "up"].map((direction) => [0, 1, 2, 3].map((frame) => drawPersonPose(coat, hat, frame, direction)));
  encodeGif(rows[0], file, 10);
  encodeSheet(rows, file.replace(".gif", "-sheet.png"));
}

function wolf() {
  const frames = [0, 1, 2, 3].map((frame) => {
    const c = createCanvas(160, 104);
    const step = [-6, 4, 7, -3][frame];
    c.ellipse(74, 83, 57, 13, "#000000");
    c.ellipse(69, 54, 57, 24, "#2a3038");
    c.ellipse(58, 44, 42, 15, "#39424c");
    c.ellipse(116, 42, 27, 23, "#2a3038");
    c.tri(104, 24, 116, 2, 126, 25, "#151a20");
    c.ellipse(126, 40, 3, 3, "#ffdf9a");
    c.line(21, 48, 2, 27 + step, "#151a20", 5);
    c.line(44, 67, 29 + step, 101, "#151a20", 4);
    c.line(78, 68, 67 - step, 101, "#151a20", 4);
    c.line(101, 66, 113 + step, 101, "#151a20", 4);
    return c;
  });
  encodeGif(frames, "wolf.gif", 9);
  encodeSheet(frames, "wolf-sheet.png");
}

function eagle() {
  const frames = [0, 1, 2, 3].map((frame) => {
    const c = createCanvas(168, 128);
    const wing = [-20, 2, 20, 2][frame];
    c.ellipse(84, 102, 42, 11, "#000000");
    c.poly([[82, 53], [20, 35 + wing], [48, 69], [78, 67]], "#3b3028");
    c.poly([[86, 53], [148, 35 + wing], [120, 69], [90, 67]], "#3b3028");
    c.ellipse(84, 60, 32, 18, "#5b4636");
    c.ellipse(112, 52, 20, 15, "#dff7ff");
    c.tri(128, 50, 151, 57, 128, 64, "#ffd166");
    c.ellipse(116, 49, 3, 3, "#06111f");
    c.line(73, 72, 65, 91, "#ffd166", 2);
    c.line(94, 72, 101, 91, "#ffd166", 2);
    c.line(62, 88, 53, 94, "#ffd166", 1);
    c.line(104, 88, 114, 94, "#ffd166", 1);
    c.tri(52, 58, 28, 71 + wing * 0.2, 61, 72, "#2f261f");
    c.tri(116, 58, 140, 71 + wing * 0.2, 107, 72, "#2f261f");
    return c;
  });
  encodeGif(frames, "eagle.gif", 8);
  encodeSheet(frames, "eagle-sheet.png");
}

function resource(file, color) {
  const frames = [0, 1, 2, 3].map((frame) => {
    const c = createCanvas(64, 64);
    const bob = Math.sin(frame * Math.PI / 2) * 2;
    c.ellipse(34, 50, 24, 8, "#000000");
    c.rect(15, 17 + bob, 34, 34, color);
    c.tri(15, 17 + bob, 32, 5 + bob, 49, 17 + bob, "#dff7ff");
    c.rect(23, 31 + bob, 18, 6, "#06111f");
    return c;
  });
  encodeGif(frames, file, 16);
  encodeSheet(frames, file.replace(".gif", "-sheet.png"));
}

function fortWall() {
  const rows = [0, 1, 2].map((level) => [0, 1, 2, 3].map((frame) => {
    const c = createCanvas(256, 192);
    const light = frame % 2 ? "#d8edf4" : "#cbe3ec";
    const trim = level === 2 ? "#ffd166" : level === 1 ? "#73df9b" : "#6f513c";
    c.rect(7, 16, 242, 148, "#8f6e50");
    c.rect(20, 29, 216, 120, light);
    c.rect(0, 0, 256, 21 + level * 2, trim);
    c.rect(0, 154, 94, 31, trim);
    c.rect(160, 154, 96, 31, trim);
    c.rect(112, 146, 34, 46, "#d8edf4");
    for (let x = 20; x < 242; x += 30) c.line(x, 0, x, 178, "#4d382e", 2);
    c.line(0, 154, 94, 154, "#3f2e27", 3);
    c.line(160, 154, 256, 154, "#3f2e27", 3);
    if (level >= 1) c.rect(22, 22, 212, 7, trim);
    if (level >= 2) c.rect(100, 139, 56, 9, "#ffd166");
    return c;
  }));
  encodeGif(rows[0], "fort-wall.gif", 20);
  encodeSheet(rows, "fort-wall-sheet.png");
}

const clothes = {
  blue: "#67c7ff",
  orange: "#ff9f43",
  green: "#72d572",
  red: "#ff5d66",
  purple: "#b48cff",
  yellow: "#ffd166"
};

animatedBuilding("furnace.gif", "#554255", "#2c2032", "#ffb35c", { chimney: true });
animatedBuilding("cabin.gif", "#3c4b5b", "#1c2734", "#ffb35c");
animatedBuilding("dining-hall.gif", "#5b4b3c", "#2b2534", "#ffcb72");
animatedBuilding("food-prep.gif", "#46626a", "#263842", "#ffcb72");
tower();
farm();
tree();
Object.entries(clothes).forEach(([name, color]) => {
  person(`player-${name}.gif`, color, "#173047");
  person(`visitor-${name}.gif`, color, "#362b3c");
});
wolf();
eagle();
resource("wood.gif", "#b77a43");
resource("lettuce.gif", "#75df76");
resource("meat.gif", "#d65d58");
resource("meal.gif", "#ffcb72");
fortWall();

console.log(`Generated animated sprite sheets in ${outDir}`);
