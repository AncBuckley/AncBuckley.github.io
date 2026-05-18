const canvas = document.querySelector("#scene");
const ctx = canvas.getContext("2d");
const targetBubble = document.querySelector("#targetBubble");
const targetIcon = document.querySelector("#targetIcon");
const targetIconCtx = targetIcon.getContext("2d");
const targetValue = document.querySelector("#targetValue");
const startButton = document.querySelector("#startButton");

const letterSymbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const numberSymbols = "0123456789".split("");
const bubbleColors = ["#ff7a90", "#41c7d7", "#ffd35c", "#8bd761", "#a785ff", "#ff9f43"];
const confettiColors = ["#f94144", "#f9c74f", "#43aa8b", "#577590", "#f3722c", "#9b5de5"];
const correctGoal = 10;
const spriteSize = 88;
const spriteFrames = 4;

const colorItems = [
  { id: "red", label: "Red", type: "color", color: "#f04452" },
  { id: "orange", label: "Orange", type: "color", color: "#ff9736" },
  { id: "yellow", label: "Yellow", type: "color", color: "#ffd43b" },
  { id: "green", label: "Green", type: "color", color: "#52c95f" },
  { id: "blue", label: "Blue", type: "color", color: "#3fa7ff" },
  { id: "purple", label: "Purple", type: "color", color: "#9b6dff" },
  { id: "pink", label: "Pink", type: "color", color: "#ff77b7" },
  { id: "white", label: "White", type: "color", color: "#fff6e8" },
];

const animalItems = [
  { id: "cow", label: "Cow", group: "farm", type: "animal", body: "#f7f4ea", accent: "#3f3441" },
  { id: "pig", label: "Pig", group: "farm", type: "animal", body: "#ff9fbc", accent: "#e8598e" },
  { id: "horse", label: "Horse", group: "farm", type: "animal", body: "#9b623f", accent: "#3c2720" },
  { id: "sheep", label: "Sheep", group: "farm", type: "animal", body: "#f7f3dc", accent: "#4a4a4a" },
  { id: "chicken", label: "Chicken", group: "farm", type: "animal", body: "#fff2c7", accent: "#e64646" },
  { id: "duck", label: "Duck", group: "farm", type: "animal", body: "#ffe066", accent: "#f28c28" },
  { id: "lion", label: "Lion", group: "zoo", type: "animal", body: "#d99a35", accent: "#8c5224" },
  { id: "elephant", label: "Elephant", group: "zoo", type: "animal", body: "#9aa7b8", accent: "#6f7f92" },
  { id: "giraffe", label: "Giraffe", group: "zoo", type: "animal", body: "#e0ae4f", accent: "#8f5b2d" },
  { id: "zebra", label: "Zebra", group: "zoo", type: "animal", body: "#f2f0e8", accent: "#2f2f37" },
  { id: "monkey", label: "Monkey", group: "zoo", type: "animal", body: "#9a6034", accent: "#f2c08b" },
  { id: "panda", label: "Panda", group: "zoo", type: "animal", body: "#f5f1e7", accent: "#24262d" },
];

const categories = [
  { id: "letters", items: letterSymbols.map((symbol) => ({ id: symbol, label: symbol, type: "text" })) },
  { id: "numbers", items: numberSymbols.map((symbol) => ({ id: symbol, label: symbol, type: "text" })) },
  { id: "colors", items: colorItems },
  { id: "farm-animals", items: animalItems.filter((animal) => animal.group === "farm") },
  { id: "zoo-animals", items: animalItems.filter((animal) => animal.group === "zoo") },
];

let width = 0;
let height = 0;
let dpr = 1;
let lastTime = 0;
let spawnTimer = 0;
let target = categories[0].items[0];
let currentCategory = categories[0];
let currentItems = categories[0].items;
let correctCount = 0;
let cakeLayers = 0;
let state = "waiting";
let bubbles = [];
let confetti = [];
let pops = [];
let candles = [];
let draggingMatch = null;
let match = { x: 0, y: 0, angle: -0.22, lit: true };
let audio;
let lastPointerTap = 0;
let animalSpriteSheets = {};

function resize() {
  dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  targetIcon.width = Math.round(128 * dpr);
  targetIcon.height = Math.round(128 * dpr);
  targetIconCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  positionMatch();
  layoutCandles();
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function pickSymbol() {
  return currentItems[Math.floor(Math.random() * currentItems.length)];
}

function chooseTarget() {
  currentCategory = categories[Math.floor(Math.random() * categories.length)];
  currentItems = currentCategory.items;
  target = pickSymbol();
  updateTargetDisplay();
}

function updateTargetDisplay() {
  targetBubble.classList.toggle("has-icon", target.type !== "text");
  targetBubble.classList.toggle("color-target", target.type === "color");
  targetBubble.style.setProperty("--target-color", target.color || "#41c7d7");
  targetValue.textContent = target.label;
  targetBubble.setAttribute("aria-label", `Find ${target.label}`);
}

function makeBubble(mustMatch = false) {
  const radius = rand(34, Math.min(58, width * 0.09));
  const shouldMatch = mustMatch || Math.random() < 0.34;
  return {
    x: rand(radius + 6, width - radius - 6),
    y: -radius - rand(8, height * 0.16),
    radius,
    vy: rand(42, 86),
    wobble: rand(0, Math.PI * 2),
    wobbleSpeed: rand(1.2, 2.4),
    item: shouldMatch ? target : differentSymbol(),
    color: shouldMatch && target.type === "color" ? target.color : bubbleColors[Math.floor(Math.random() * bubbleColors.length)],
    id: crypto.randomUUID ? crypto.randomUUID() : String(Math.random()),
  };
}

function differentSymbol() {
  let symbol = pickSymbol();
  while (symbol.id === target.id) symbol = pickSymbol();
  return symbol;
}

function createAudio() {
  if (audio) return audio;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const context = new AudioContext();
  const master = context.createGain();
  master.gain.value = 0.22;
  master.connect(context.destination);
  audio = { context, master };
  return audio;
}

function popSound(correct) {
  const { context, master } = createAudio();
  const now = context.currentTime;
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(correct ? 760 : 520, now);
  osc.frequency.exponentialRampToValueAtTime(correct ? 1180 : 300, now + 0.12);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.38, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
  osc.connect(gain).connect(master);
  osc.start(now);
  osc.stop(now + 0.17);
}

function hornSound() {
  const { context, master } = createAudio();
  const now = context.currentTime;
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(250, now);
  osc.frequency.linearRampToValueAtTime(680, now + 0.22);
  osc.frequency.linearRampToValueAtTime(360, now + 0.5);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.24, now + 0.03);
  gain.gain.linearRampToValueAtTime(0.001, now + 0.62);
  osc.connect(gain).connect(master);
  osc.start(now);
  osc.stop(now + 0.68);
}

function playHappyBirthday() {
  const { context, master } = createAudio();
  const start = context.currentTime + 0.05;
  const melody = [
    ["G4", 0.28], ["G4", 0.28], ["A4", 0.56], ["G4", 0.56], ["C5", 0.56], ["B4", 1.1],
    ["G4", 0.28], ["G4", 0.28], ["A4", 0.56], ["G4", 0.56], ["D5", 0.56], ["C5", 1.1],
    ["G4", 0.28], ["G4", 0.28], ["G5", 0.56], ["E5", 0.56], ["C5", 0.56], ["B4", 0.56], ["A4", 1.1],
    ["F5", 0.28], ["F5", 0.28], ["E5", 0.56], ["C5", 0.56], ["D5", 0.56], ["C5", 1.2],
  ];
  let time = start;
  melody.forEach(([note, duration]) => {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "triangle";
    osc.frequency.value = noteFrequency(note);
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.26, time + 0.035);
    gain.gain.setValueAtTime(0.21, time + duration * 0.72);
    gain.gain.linearRampToValueAtTime(0.001, time + duration);
    osc.connect(gain).connect(master);
    osc.start(time);
    osc.stop(time + duration + 0.03);
    time += duration;
  });
  window.setTimeout(() => {
    burstConfetti(width / 2, height * 0.24, 170, true);
    hornSound();
    window.setTimeout(resetRound, 2400);
  }, Math.max(0, (time - context.currentTime) * 1000 + 120));
}

function noteFrequency(note) {
  const names = { C: -9, "C#": -8, D: -7, "D#": -6, E: -5, F: -4, "F#": -3, G: -2, "G#": -1, A: 0, "A#": 1, B: 2 };
  const matchNote = note.match(/^([A-G]#?)(\d)$/);
  const semitone = names[matchNote[1]] + (Number(matchNote[2]) - 4) * 12;
  return 440 * Math.pow(2, semitone / 12);
}

function startGame() {
  createAudio().context.resume();
  startButton.classList.add("hidden");
  state = "playing";
  correctCount = 0;
  cakeLayers = 0;
  chooseTarget();
  bubbles = [makeBubble(true), makeBubble(false), makeBubble(false)];
  confetti = [];
  pops = [];
  candles = [];
  spawnTimer = 0;
}

function resetRound() {
  state = "playing";
  correctCount = 0;
  cakeLayers = 0;
  chooseTarget();
  bubbles = [makeBubble(true), makeBubble(false), makeBubble(false)];
  confetti = [];
  pops = [];
  candles = [];
  draggingMatch = null;
  positionMatch();
}

function completeCake() {
  state = "lighting";
  bubbles = [];
  confetti = [];
  layoutCandles();
  positionMatch();
}

function layoutCandles() {
  if (!width || !height || (state !== "lighting" && state !== "celebrating")) return;
  const cake = cakeRect();
  const spacing = cake.w / 6;
  candles = Array.from({ length: 5 }, (_, index) => ({
    x: cake.x + spacing * (index + 1),
    y: cake.y - 24,
    lit: false,
    flamePhase: rand(0, Math.PI * 2),
    flameScale: rand(0.9, 1.14),
    flameLean: rand(-0.18, 0.18),
  }));
}

function positionMatch() {
  match.x = width - Math.min(80, width * 0.15);
  match.y = Math.max(190, height * 0.48);
}

function cakeRect() {
  const w = Math.min(width * 0.62, 520);
  const layerH = Math.min(44, Math.max(28, height * 0.055));
  const totalH = layerH * Math.max(1, cakeLayers);
  return {
    x: (width - w) / 2,
    y: height - Math.max(82, height * 0.12) - totalH,
    w,
    layerH,
  };
}

function burstConfetti(x, y, amount = 45, wide = false) {
  for (let i = 0; i < amount; i += 1) {
    const angle = wide ? rand(-Math.PI, 0) : rand(-Math.PI * 0.94, -Math.PI * 0.06);
    const speed = wide ? rand(160, 560) : rand(120, 360);
    confetti.push({
      x,
      y,
      vx: Math.cos(angle) * speed + rand(-90, 90),
      vy: Math.sin(angle) * speed + rand(-120, 40),
      size: rand(7, 14),
      spin: rand(-9, 9),
      rotation: rand(0, Math.PI),
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      life: rand(1.1, 2.4),
    });
  }
}

function addPop(x, y, color) {
  pops.push({ x, y, color, age: 0, rings: 3 });
}

function popBubble(bubble) {
  const correct = bubble.item.id === target.id;
  popSound(correct);
  addPop(bubble.x, bubble.y, bubble.color);
  bubbles = bubbles.filter((item) => item !== bubble);
  if (correct) {
    correctCount += 1;
    cakeLayers = Math.min(5, Math.ceil(correctCount / 2));
    burstConfetti(bubble.x, bubble.y, 54);
    if (correctCount >= correctGoal) {
      completeCake();
    } else {
      bubbles.push(makeBubble(true));
    }
  }
}

function update(delta) {
  if (state === "playing") {
    spawnTimer -= delta;
    if (spawnTimer <= 0) {
      bubbles.push(makeBubble(bubbles.every((bubble) => bubble.item.id !== target.id)));
      spawnTimer = rand(0.75, 1.25);
    }
    bubbles.forEach((bubble) => {
      bubble.wobble += delta * bubble.wobbleSpeed;
      bubble.x += Math.sin(bubble.wobble) * 22 * delta;
      bubble.y += bubble.vy * delta;
    });
    bubbles = bubbles.filter((bubble) => bubble.y < height + bubble.radius + 20);
  }

  confetti.forEach((piece) => {
    piece.life -= delta;
    piece.x += piece.vx * delta;
    piece.y += piece.vy * delta;
    piece.vy += 520 * delta;
    piece.rotation += piece.spin * delta;
  });
  confetti = confetti.filter((piece) => piece.life > 0 && piece.y < height + 60);

  pops.forEach((pop) => {
    pop.age += delta;
  });
  pops = pops.filter((pop) => pop.age < 0.38);
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  drawBackground();
  drawCake();
  bubbles.forEach(drawBubble);
  pops.forEach(drawPop);
  if (state === "lighting" || state === "celebrating") {
    candles.forEach(drawCandle);
    drawMatch();
  }
  drawConfetti();
  drawTargetIcon();
}

function drawBackground() {
  ctx.save();
  drawAurora();
  drawMoonGlow();
  drawMountains();
  ctx.restore();
}

function drawAurora() {
  const time = performance.now() / 1000;
  const ribbons = [
    { y: height * 0.16, color: "rgba(112, 255, 188, 0.34)", phase: 0, thickness: 30 },
    { y: height * 0.24, color: "rgba(158, 230, 255, 0.24)", phase: 1.7, thickness: 24 },
    { y: height * 0.2, color: "rgba(237, 176, 255, 0.18)", phase: 3.1, thickness: 20 },
  ];

  ribbons.forEach((ribbon) => {
    const gradient = ctx.createLinearGradient(0, ribbon.y - 90, 0, ribbon.y + 90);
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(0.48, ribbon.color);
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.strokeStyle = gradient;
    ctx.lineWidth = ribbon.thickness;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let x = -40; x <= width + 40; x += 26) {
      const y = ribbon.y
        + Math.sin(x * 0.012 + time * 0.75 + ribbon.phase) * 30
        + Math.sin(x * 0.026 - time * 0.42 + ribbon.phase) * 12;
      if (x === -40) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  });
}

function drawMoonGlow() {
  const moonX = width * 0.82;
  const moonY = height * 0.14;
  const radius = Math.min(58, width * 0.06);
  const glow = ctx.createRadialGradient(moonX, moonY, radius * 0.4, moonX, moonY, radius * 2.6);
  glow.addColorStop(0, "rgba(255, 239, 205, 0.7)");
  glow.addColorStop(1, "rgba(255, 239, 205, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(moonX, moonY, radius * 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 241, 207, 0.92)";
  ctx.beginPath();
  ctx.arc(moonX, moonY, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawMountains() {
  const horizon = height * 0.66;
  drawMountainRange(horizon + 18, "#2c4772", [
    [0, 0.95], [0.12, 0.44], [0.25, 0.9], [0.42, 0.34], [0.57, 0.88],
    [0.72, 0.38], [0.86, 0.83], [1, 0.5], [1.08, 0.95],
  ]);
  drawMountainRange(horizon + 42, "#233d61", [
    [-0.08, 0.92], [0.08, 0.56], [0.22, 0.86], [0.36, 0.48], [0.53, 0.9],
    [0.67, 0.5], [0.83, 0.87], [0.96, 0.58], [1.08, 0.92],
  ]);

  ctx.fillStyle = "#5d876f";
  ctx.fillRect(0, horizon + 42, width, height - horizon);

  const lake = ctx.createLinearGradient(0, horizon + 42, 0, height);
  lake.addColorStop(0, "rgba(77, 113, 151, 0.86)");
  lake.addColorStop(1, "rgba(76, 154, 132, 0.72)");
  ctx.fillStyle = lake;
  ctx.fillRect(0, horizon + 42, width, height - horizon);

  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i += 1) {
    const y = horizon + 68 + i * 34;
    ctx.beginPath();
    ctx.moveTo(width * 0.08, y);
    ctx.quadraticCurveTo(width * 0.5, y + 10 * Math.sin(i), width * 0.92, y + 2);
    ctx.stroke();
  }
}

function drawMountainRange(baseY, color, points) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(points[0][0] * width, baseY);
  points.forEach(([x, yFactor]) => {
    ctx.lineTo(x * width, baseY - (1 - yFactor) * height * 0.88);
  });
  ctx.lineTo(width * 1.08, baseY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.82)";
  for (let i = 1; i < points.length - 1; i += 2) {
    const [peakX, peakYFactor] = points[i];
    const peakY = baseY - (1 - peakYFactor) * height * 0.88;
    const capW = width * 0.055;
    const capH = height * 0.055;
    ctx.beginPath();
    ctx.moveTo(peakX * width, peakY);
    ctx.lineTo(peakX * width - capW, peakY + capH);
    ctx.lineTo(peakX * width - capW * 0.14, peakY + capH * 0.72);
    ctx.lineTo(peakX * width + capW * 0.14, peakY + capH * 0.9);
    ctx.lineTo(peakX * width + capW, peakY + capH);
    ctx.closePath();
    ctx.fill();
  }
}

function drawBubble(bubble) {
  const gradient = ctx.createRadialGradient(
    bubble.x - bubble.radius * 0.35,
    bubble.y - bubble.radius * 0.42,
    bubble.radius * 0.12,
    bubble.x,
    bubble.y,
    bubble.radius,
  );
  gradient.addColorStop(0, "rgba(255,255,255,0.96)");
  gradient.addColorStop(0.26, bubble.color);
  gradient.addColorStop(1, "rgba(255,255,255,0.54)");
  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(255,255,255,0.86)";
  ctx.stroke();
  drawBubbleItem(bubble.item, bubble.x, bubble.y, bubble.radius);
  ctx.restore();
}

function drawBubbleItem(item, x, y, radius) {
  if (item.type === "text") {
    ctx.fillStyle = "#23324d";
    ctx.font = `900 ${radius * 1.04}px "Trebuchet MS", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(item.label, x, y + radius * 0.06);
    return;
  }

  if (item.type === "color") {
    drawColorSwatch(ctx, item.color, x, y, radius * 0.68);
    return;
  }

  drawAnimalSprite(ctx, item, x - radius * 0.68, y - radius * 0.68, radius * 1.36);
}

function drawTargetIcon() {
  targetIconCtx.clearRect(0, 0, 128, 128);
  if (target.type === "text") return;
  if (target.type === "color") {
    drawColorSwatch(targetIconCtx, target.color, 64, 64, 44);
    return;
  }
  drawAnimalSprite(targetIconCtx, target, 16, 16, 96);
}

function drawColorSwatch(context, color, x, y, radius) {
  context.save();
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
  context.lineWidth = Math.max(3, radius * 0.1);
  context.strokeStyle = "rgba(255,255,255,0.92)";
  context.stroke();
  context.fillStyle = "rgba(255,255,255,0.48)";
  context.beginPath();
  context.arc(x - radius * 0.32, y - radius * 0.38, radius * 0.25, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawAnimalSprite(context, animal, x, y, size) {
  const sheet = animalSpriteSheets[animal.id];
  if (!sheet) return;
  const frame = Math.floor(performance.now() / 150 + animal.id.length) % spriteFrames;
  context.drawImage(sheet, frame * spriteSize, 0, spriteSize, spriteSize, x, y, size, size);
}

function createAnimalSpriteSheets() {
  animalSpriteSheets = {};
  animalItems.forEach((animal) => {
    const sheet = document.createElement("canvas");
    sheet.width = spriteSize * spriteFrames;
    sheet.height = spriteSize;
    const sheetCtx = sheet.getContext("2d");
    for (let frame = 0; frame < spriteFrames; frame += 1) {
      drawAnimalFrame(sheetCtx, animal, frame, frame * spriteSize, 0, spriteSize);
    }
    animalSpriteSheets[animal.id] = sheet;
  });
}

function drawAnimalFrame(context, animal, frame, x, y, size) {
  const bob = Math.sin(frame / spriteFrames * Math.PI * 2) * size * 0.035;
  const wag = Math.sin(frame / spriteFrames * Math.PI * 2) * size * 0.08;
  const cx = x + size / 2;
  const cy = y + size / 2 + bob;
  const body = animal.body;
  const accent = animal.accent;

  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  context.fillStyle = "rgba(0,0,0,0.12)";
  context.beginPath();
  context.ellipse(cx, y + size * 0.82, size * 0.28, size * 0.08, 0, 0, Math.PI * 2);
  context.fill();

  if (animal.id === "giraffe") {
    drawGiraffe(context, x, y + bob, size, body, accent, wag);
  } else if (animal.id === "elephant") {
    drawElephant(context, x, y + bob, size, body, accent, wag);
  } else if (animal.id === "chicken" || animal.id === "duck") {
    drawBird(context, animal, x, y + bob, size, body, accent, wag);
  } else {
    drawRoundAnimal(context, animal, x, y + bob, size, body, accent, wag);
  }
  context.restore();
}

function drawRoundAnimal(context, animal, x, y, size, body, accent, wag) {
  const cx = x + size * 0.5;
  const cy = y + size * 0.52;
  context.fillStyle = body;
  context.beginPath();
  context.ellipse(cx, cy + size * 0.12, size * 0.3, size * 0.25, 0, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.arc(cx + size * 0.03, cy - size * 0.08, size * 0.28, 0, Math.PI * 2);
  context.fill();

  if (animal.id === "lion") {
    context.fillStyle = accent;
    context.beginPath();
    context.arc(cx + size * 0.03, cy - size * 0.08, size * 0.36, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = body;
    context.beginPath();
    context.arc(cx + size * 0.03, cy - size * 0.08, size * 0.27, 0, Math.PI * 2);
    context.fill();
  }

  context.fillStyle = animal.id === "panda" ? accent : body;
  context.beginPath();
  context.arc(cx - size * 0.18, cy - size * 0.28, size * 0.11, 0, Math.PI * 2);
  context.arc(cx + size * 0.23, cy - size * 0.28, size * 0.11, 0, Math.PI * 2);
  context.fill();

  if (animal.id === "cow") {
    context.fillStyle = accent;
    context.beginPath();
    context.ellipse(cx - size * 0.1, cy - size * 0.12, size * 0.09, size * 0.13, -0.7, 0, Math.PI * 2);
    context.ellipse(cx + size * 0.15, cy + size * 0.02, size * 0.08, size * 0.12, 0.6, 0, Math.PI * 2);
    context.fill();
  }

  if (animal.id === "zebra") {
    context.strokeStyle = accent;
    context.lineWidth = size * 0.045;
    for (let i = -2; i < 3; i += 1) {
      context.beginPath();
      context.moveTo(cx - size * 0.18 + i * size * 0.09, cy - size * 0.22);
      context.lineTo(cx - size * 0.05 + i * size * 0.09, cy + size * 0.12);
      context.stroke();
    }
  }

  if (animal.id === "sheep") {
    context.fillStyle = "rgba(255,255,255,0.78)";
    for (let i = 0; i < 5; i += 1) {
      context.beginPath();
      context.arc(cx - size * 0.22 + i * size * 0.11, cy + size * 0.06 + Math.sin(i) * size * 0.03, size * 0.12, 0, Math.PI * 2);
      context.fill();
    }
  }

  if (animal.id === "monkey") {
    context.fillStyle = accent;
    context.beginPath();
    context.arc(cx + size * 0.03, cy - size * 0.02, size * 0.18, 0, Math.PI * 2);
    context.fill();
  }

  if (animal.id === "horse") {
    context.strokeStyle = accent;
    context.lineWidth = size * 0.08;
    context.beginPath();
    context.moveTo(cx + size * 0.18, cy - size * 0.26);
    context.lineTo(cx + size * 0.18 + wag, cy + size * 0.08);
    context.stroke();
  }

  if (animal.id === "panda") {
    context.fillStyle = accent;
    context.beginPath();
    context.arc(cx - size * 0.1, cy - size * 0.1, size * 0.08, 0, Math.PI * 2);
    context.arc(cx + size * 0.16, cy - size * 0.1, size * 0.08, 0, Math.PI * 2);
    context.fill();
  }

  drawAnimalFace(context, cx + size * 0.03, cy - size * 0.08, size, accent);
}

function drawElephant(context, x, y, size, body, accent, wag) {
  const cx = x + size * 0.5;
  const cy = y + size * 0.52;
  context.fillStyle = body;
  context.beginPath();
  context.ellipse(cx, cy + size * 0.08, size * 0.32, size * 0.25, 0, 0, Math.PI * 2);
  context.arc(cx - size * 0.18, cy - size * 0.05, size * 0.2, 0, Math.PI * 2);
  context.arc(cx + size * 0.18, cy - size * 0.05, size * 0.2, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.arc(cx, cy - size * 0.08, size * 0.27, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = accent;
  context.lineWidth = size * 0.11;
  context.beginPath();
  context.moveTo(cx + size * 0.08, cy + size * 0.04);
  context.quadraticCurveTo(cx + size * 0.18 + wag, cy + size * 0.24, cx + size * 0.02, cy + size * 0.34);
  context.stroke();
  drawAnimalFace(context, cx, cy - size * 0.1, size, "#263142");
}

function drawGiraffe(context, x, y, size, body, accent, wag) {
  const cx = x + size * 0.5;
  const cy = y + size * 0.53;
  context.fillStyle = body;
  roundMini(context, cx - size * 0.17, cy, size * 0.34, size * 0.34, size * 0.12);
  context.fill();
  roundMini(context, cx + size * 0.02, cy - size * 0.35, size * 0.18, size * 0.48, size * 0.08);
  context.fill();
  context.beginPath();
  context.arc(cx + size * 0.15, cy - size * 0.38, size * 0.2, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = accent;
  for (let i = 0; i < 6; i += 1) {
    context.beginPath();
    context.arc(cx - size * 0.24 + (i % 3) * size * 0.14, cy - size * 0.04 - Math.floor(i / 3) * size * 0.12, size * 0.045, 0, Math.PI * 2);
    context.fill();
  }
  context.strokeStyle = accent;
  context.lineWidth = size * 0.035;
  context.beginPath();
  context.moveTo(cx + size * 0.07, cy - size * 0.56);
  context.lineTo(cx + size * 0.07, cy - size * 0.7);
  context.moveTo(cx + size * 0.2, cy - size * 0.56);
  context.lineTo(cx + size * 0.2, cy - size * 0.7);
  context.stroke();
  drawAnimalFace(context, cx + size * 0.15, cy - size * 0.4, size, "#263142");
}

function drawBird(context, animal, x, y, size, body, accent, wag) {
  const cx = x + size * 0.5;
  const cy = y + size * 0.54;
  context.fillStyle = body;
  context.beginPath();
  context.ellipse(cx, cy + size * 0.08, size * 0.28, size * 0.3, 0, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.arc(cx + size * 0.02, cy - size * 0.17, size * 0.2, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = accent;
  context.beginPath();
  context.moveTo(cx + size * 0.18, cy - size * 0.15);
  context.lineTo(cx + size * 0.36, cy - size * 0.08 + wag * 0.2);
  context.lineTo(cx + size * 0.18, cy - size * 0.02);
  context.closePath();
  context.fill();
  if (animal.id === "chicken") {
    context.fillStyle = accent;
    context.beginPath();
    context.arc(cx - size * 0.08, cy - size * 0.36, size * 0.06, 0, Math.PI * 2);
    context.arc(cx + size * 0.02, cy - size * 0.39, size * 0.06, 0, Math.PI * 2);
    context.arc(cx + size * 0.1, cy - size * 0.35, size * 0.06, 0, Math.PI * 2);
    context.fill();
  }
  drawAnimalFace(context, cx + size * 0.02, cy - size * 0.18, size, "#263142");
}

function drawAnimalFace(context, x, y, size, accent) {
  context.fillStyle = "#263142";
  context.beginPath();
  context.arc(x - size * 0.08, y - size * 0.03, size * 0.026, 0, Math.PI * 2);
  context.arc(x + size * 0.09, y - size * 0.03, size * 0.026, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = accent;
  context.lineWidth = size * 0.025;
  context.beginPath();
  context.arc(x + size * 0.01, y + size * 0.07, size * 0.06, 0.15, Math.PI - 0.15);
  context.stroke();
}

function roundMini(context, x, y, w, h, r) {
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + w, y, x + w, y + h, r);
  context.arcTo(x + w, y + h, x, y + h, r);
  context.arcTo(x, y + h, x, y, r);
  context.arcTo(x, y, x + w, y, r);
  context.closePath();
}

function drawPop(pop) {
  ctx.save();
  ctx.globalAlpha = 1 - pop.age / 0.38;
  ctx.strokeStyle = pop.color;
  ctx.lineWidth = 4;
  for (let i = 0; i < pop.rings; i += 1) {
    ctx.beginPath();
    ctx.arc(pop.x, pop.y, pop.age * 210 + i * 18, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCake() {
  const cake = cakeRect();
  const palette = ["#f187b6", "#ffe066", "#7ed6df", "#a3e635", "#ff9f43"];
  ctx.save();
  ctx.fillStyle = "#795548";
  ctx.beginPath();
  ctx.ellipse(width / 2, cake.y + cake.layerH * cakeLayers + 20, cake.w * 0.58, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < cakeLayers; i += 1) {
    const y = cake.y + cake.layerH * (cakeLayers - i - 1);
    const inset = i * 12;
    roundRect(cake.x + inset, y, cake.w - inset * 2, cake.layerH + 6, 16);
    ctx.fillStyle = palette[i % palette.length];
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    for (let dot = 0; dot < 6; dot += 1) {
      ctx.beginPath();
      ctx.arc(cake.x + inset + 38 + dot * ((cake.w - inset * 2 - 76) / 5), y + cake.layerH * 0.52, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawCandle(candle) {
  ctx.save();
  ctx.fillStyle = "#fff7e6";
  roundRect(candle.x - 8, candle.y, 16, 54, 5);
  ctx.fill();
  ctx.strokeStyle = "#e86aa2";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(candle.x - 6, candle.y + 12);
  ctx.lineTo(candle.x + 6, candle.y + 24);
  ctx.moveTo(candle.x - 6, candle.y + 32);
  ctx.lineTo(candle.x + 6, candle.y + 44);
  ctx.stroke();
  ctx.strokeStyle = "#3f2f23";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(candle.x, candle.y);
  ctx.lineTo(candle.x, candle.y - 10);
  ctx.stroke();
  if (candle.lit) drawFlame(candle.x, candle.y - 19, candle.flameScale, candle.flamePhase, candle.flameLean);
  ctx.restore();
}

function drawMatch() {
  ctx.save();
  ctx.translate(match.x, match.y);
  ctx.rotate(match.angle);
  ctx.fillStyle = "#c48742";
  roundRect(-8, -10, 16, 150, 8);
  ctx.fill();
  ctx.fillStyle = "#6b2d23";
  ctx.beginPath();
  ctx.ellipse(0, -22, 17, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  if (match.lit) drawFlame(0, -50, 1.3, 2.4, -0.08);
  ctx.restore();
}

function drawFlame(x, y, scale, phase = 0, lean = 0) {
  const time = performance.now() / 1000;
  const pulse = 1 + Math.sin(time * 10.5 + phase) * 0.13;
  const sway = Math.sin(time * 6.4 + phase * 1.7) * 4 + lean * 18;
  const stretch = 1 + Math.cos(time * 8.2 + phase) * 0.08;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean + Math.sin(time * 4.8 + phase) * 0.06);
  ctx.scale(scale * pulse, scale * stretch);

  const glow = ctx.createRadialGradient(0, -4, 2, 0, -4, 44);
  glow.addColorStop(0, "rgba(255, 224, 94, 0.48)");
  glow.addColorStop(1, "rgba(255, 140, 26, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 44, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ff6f1a";
  ctx.beginPath();
  ctx.moveTo(sway * 0.35, -34);
  ctx.bezierCurveTo(24 + sway * 0.25, -12, 16, 24, 0, 28);
  ctx.bezierCurveTo(-18, 20, -23 + sway * 0.2, -7, sway * 0.35, -34);
  ctx.fill();

  ctx.fillStyle = "#ffba2e";
  ctx.beginPath();
  ctx.moveTo(sway * 0.22, -25);
  ctx.bezierCurveTo(15, -5, 10, 18, -1, 21);
  ctx.bezierCurveTo(-12, 13, -12, -4, sway * 0.22, -25);
  ctx.fill();

  ctx.fillStyle = "#fff7a8";
  ctx.beginPath();
  ctx.moveTo(sway * 0.14, -15);
  ctx.bezierCurveTo(7, -1, 5, 11, -1, 12);
  ctx.bezierCurveTo(-6, 7, -6, -2, sway * 0.14, -15);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 241, 150, 0.76)";
  for (let i = 0; i < 2; i += 1) {
    const sparkY = -24 - ((time * 38 + phase * 17 + i * 16) % 32);
    const sparkX = Math.sin(time * 5 + phase + i) * 8;
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawConfetti() {
  ctx.save();
  confetti.forEach((piece) => {
    ctx.translate(piece.x, piece.y);
    ctx.rotate(piece.rotation);
    ctx.fillStyle = piece.color;
    ctx.fillRect(-piece.size / 2, -piece.size / 4, piece.size, piece.size / 2);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  });
  ctx.restore();
}

function roundRect(x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function handleTap(point) {
  if (state === "waiting") {
    startGame();
    return true;
  }
  if (state === "playing") {
    const hit = [...bubbles].reverse().find((bubble) => distance(point, bubble) <= bubble.radius);
    if (hit) popBubble(hit);
    return true;
  }
  return false;
}

function pointerDown(event) {
  event.preventDefault();
  lastPointerTap = performance.now();
  createAudio().context.resume();
  const point = pointerPoint(event);
  if (handleTap(point)) return;
  if ((state === "lighting" || state === "celebrating") && distance(point, match) < 86) {
    draggingMatch = event.pointerId;
    canvas.setPointerCapture(event.pointerId);
    match.x = point.x;
    match.y = point.y;
  }
}

function pointerMove(event) {
  if ((state !== "lighting" && state !== "celebrating") || draggingMatch !== event.pointerId) return;
  event.preventDefault();
  const point = pointerPoint(event);
  match.x = point.x;
  match.y = point.y;
  if (state === "lighting") lightNearbyCandles();
}

function pointerUp(event) {
  if (draggingMatch === event.pointerId) {
    draggingMatch = null;
    try {
      canvas.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already be gone after a touch cancel.
    }
  }
}

function clickFallback(event) {
  if (performance.now() - lastPointerTap < 350) return;
  if (event.currentTarget === canvas) event.stopPropagation();
  createAudio().context.resume();
  handleTap(pointerPoint(event));
}

function mouseDownFallback(event) {
  if (performance.now() - lastPointerTap < 350) return;
  lastPointerTap = performance.now();
  createAudio().context.resume();
  handleTap(pointerPoint(event));
}

function pointerPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function lightNearbyCandles() {
  let litNewCandle = false;
  const flame = {
    x: match.x + Math.sin(match.angle) * 50,
    y: match.y - Math.cos(match.angle) * 50,
  };
  candles.forEach((candle) => {
    if (!candle.lit && distance(flame, { x: candle.x, y: candle.y - 13 }) < 44) {
      candle.lit = true;
      litNewCandle = true;
      popSound(true);
      burstConfetti(candle.x, candle.y - 42, 24);
    }
  });
  if (litNewCandle && candles.every((candle) => candle.lit)) {
    state = "celebrating";
    draggingMatch = null;
    playHappyBirthday();
  }
}

function loop(time) {
  const delta = Math.min(0.033, (time - lastTime) / 1000 || 0);
  lastTime = time;
  update(delta);
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener("resize", resize);
startButton.addEventListener("click", startGame);
canvas.addEventListener("pointerdown", pointerDown, { passive: false });
canvas.addEventListener("pointermove", pointerMove, { passive: false });
canvas.addEventListener("pointerup", pointerUp);
canvas.addEventListener("pointercancel", pointerUp);
canvas.addEventListener("click", clickFallback);
document.addEventListener("click", clickFallback);
document.addEventListener("mousedown", mouseDownFallback);

createAnimalSpriteSheets();
resize();
chooseTarget();
draw();
requestAnimationFrame(loop);
