const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");

const hud = {
  phaseLabel: document.querySelector("#phaseLabel"),
  playerIconButton: document.querySelector("#playerIconButton"),
  playerIconImage: document.querySelector("#playerIconImage"),
  cycleText: document.querySelector("#cycleText"),
  cycleFill: document.querySelector("#cycleFill"),
  quickWoodText: document.querySelector("#quickWoodText"),
  quickDiningMealText: document.querySelector("#quickDiningMealText"),
  zoomOutButton: document.querySelector("#zoomOutButton"),
  zoomResetButton: document.querySelector("#zoomResetButton"),
  zoomInButton: document.querySelector("#zoomInButton"),
  furnaceFuelText: document.querySelector("#furnaceFuelText"),
  furnaceFuelMeter: document.querySelector("#furnaceFuelMeter"),
  cabinHungerText: document.querySelector("#cabinHungerText"),
  cabinHungerMeter: document.querySelector("#cabinHungerMeter"),
  fortHealthCard: document.querySelector("#fortHealthCard"),
  fortHealthText: document.querySelector("#fortHealthText"),
  fortHealthMeter: document.querySelector("#fortHealthMeter"),
  woodCount: document.querySelector("#woodCount"),
  lettuceCount: document.querySelector("#lettuceCount"),
  meatCount: document.querySelector("#meatCount"),
  mealCount: document.querySelector("#mealCount"),
  survivorCount: document.querySelector("#survivorCount"),
  learningPointCount: document.querySelector("#learningPointCount"),
  playerLevelCount: document.querySelector("#playerLevelCount"),
  waveCount: document.querySelector("#waveCount"),
  carryText: document.querySelector("#carryText"),
  eventLog: document.querySelector("#eventLog"),
  actionsToggle: document.querySelector("#actionsToggle"),
  actionsPanel: document.querySelector("#actionsPanel"),
  mainMenuButton: document.querySelector("#mainMenuButton"),
  buildButton: document.querySelector("#buildButton"),
  upgradeMenuButton: document.querySelector("#upgradeMenuButton"),
  customizeButton: document.querySelector("#customizeButton"),
  helpButton: document.querySelector("#helpButton"),
  pauseButton: document.querySelector("#pauseButton"),
  buildTray: document.querySelector("#buildTray"),
  buildTrayToggle: document.querySelector("#buildTrayToggle"),
  buildTrayBody: document.querySelector("#buildTrayBody"),
  pauseLayer: document.querySelector("#pauseLayer"),
  resumeFromPause: document.querySelector("#resumeFromPause"),
  pauseMainMenu: document.querySelector("#pauseMainMenu"),
  modalLayer: document.querySelector("#modalLayer"),
  modalEyebrow: document.querySelector("#modalEyebrow"),
  modalTitle: document.querySelector("#modalTitle"),
  modalBody: document.querySelector("#modalBody"),
  closeModal: document.querySelector("#closeModal"),
  notificationStack: document.querySelector("#notificationStack"),
  centerToast: document.querySelector("#centerToast")
};

const world = { width: 9000, height: 7200 };
const fort = {
  x: 4120,
  y: 3310,
  w: 760,
  h: 560,
  entrance: { x: 4500, y: 3870 },
  attackPoint: { x: 4500, y: 3846 },
  health: 100,
  maxHealth: 100
};

const resourceMeta = {
  wood: { label: "Wood", short: "WD", color: "#b77a43", stack: "#8f5f36" },
  lettuce: { label: "Lettuce", short: "LT", color: "#75df76", stack: "#3ca85c" },
  berries: { label: "Berries", short: "BR", color: "#d94c7c", stack: "#8d2b57" },
  meat: { label: "Meat", short: "MT", color: "#d65d58", stack: "#9a3633" },
  meal: { label: "Meal", short: "ML", color: "#ffcb72", stack: "#d99135" }
};

const buildingData = {
  furnace: {
    id: "furnace",
    name: "Furnace",
    x: 4280,
    y: 3480,
    w: 150,
    h: 130,
    color: "#554255",
    roof: "#2c2032",
    level: 1,
    upgradeCost: 18,
    fuel: 50,
    maxFuel: 100,
    task: "Burning stored wood to keep the fort warm."
  },
  foodPrep: {
    id: "foodPrep",
    name: "Food Prep",
    x: 4490,
    y: 3685,
    w: 190,
    h: 130,
    color: "#46626a",
    roof: "#263842",
    level: 1,
    upgradeCost: 16,
    raw: 0,
    meals: 0,
    processProgress: 0,
    task: "Turns lettuce and meat into meals when the player stands at the prep table."
  },
  diningHall: {
    id: "diningHall",
    name: "Dining Hall",
    x: 4700,
    y: 3665,
    w: 165,
    h: 130,
    color: "#5b4b3c",
    roof: "#2b2534",
    level: 1,
    upgradeCost: 18,
    meals: 0,
    serveProgress: 0,
    servedPulse: 0,
    task: "Serves prepared meals through the order window before hunger can rise."
  },
  cabin: {
    id: "cabin",
    name: "Group Cabin",
    x: 4495,
    y: 3465,
    w: 240,
    h: 160,
    color: "#3c4b5b",
    roof: "#1c2734",
    level: 1,
    upgradeCost: 22,
    hunger: 34,
    maxHunger: 100,
    meals: 0,
    mealUseProgress: 0,
    task: "Tracks how hungry the current residents are."
  },
};

const dropoffs = {
  wood: { x: 4375, y: 3635, label: "Wood Pile" },
  food: { x: 4545, y: 3715, label: "Food Prep" },
  mealPickup: { x: 4650, y: 3715, label: "Meal Stack" },
  dining: { x: 4785, y: 3752, label: "Dining Hall" },
  cabin: { x: 4570, y: 3565, label: "Cabin Table" }
};

const specialtyCatalog = [
  {
    id: "hunter",
    title: "Hunter",
    bonus: "Wolves drop one extra meat.",
    names: ["Mara Pike", "Rowan Holt", "Kira Vale"]
  },
  {
    id: "cook",
    title: "Cook",
    bonus: "Meals fill the cabin hunger meter faster and food prep is quicker.",
    names: ["Eli Brooks", "Talia Reed", "Nora Lake"]
  },
  {
    id: "lumberjack",
    title: "Lumberjack",
    bonus: "Trees break into wood faster.",
    names: ["Mason Stone", "Avery Knox", "Lena Frost"]
  },
  {
    id: "farmer",
    title: "Farmer",
    bonus: "The farm grows lettuce faster.",
    names: ["Iris Snow", "Caleb Moss", "June River"]
  },
  {
    id: "engineer",
    title: "Engineer",
    bonus: "Building upgrades cost less wood.",
    names: ["Niko Lane", "Sasha Cole", "Theo North"]
  },
  {
    id: "guard",
    title: "Guard",
    bonus: "Arrows deal more damage to wolves.",
    names: ["Reid Fox", "Anya Cliff", "Bryn Hale"]
  }
];

let learningTasks = [];

const defaultGameConfig = {
  world: { width: 9000, height: 7200 },
  camera: {
    minZoom: 0.32,
    maxZoom: 1.75,
    defaultZoom: 1
  },
  fort: {
    x: 4120,
    y: 3310,
    w: 760,
    h: 560,
    entrance: { x: 4500, y: 3870 },
    attackPoint: { x: 4500, y: 3846 },
    baseHealth: 100,
    healthPerLevel: 25
  },
  timers: {
    autosaveInterval: 6,
    wolfCheckInterval: 180,
    wolfChance: 0.2,
    survivorCheckInterval: 300,
    survivorChance: 0.2,
    postWaveSurvivorCooldown: 60,
    upgradeFailCooldown: 60,
    waveInterval: 300,
    daySeconds: 300,
    nightSeconds: 60,
    nightSpawnMinSeconds: 6,
    nightSpawnMaxSeconds: 16,
    nightFirstSpawnSeconds: 5
  },
  grid: {
    size: 80,
    alpha: 0.17
  },
  movement: {
    playerSpeed: 250,
    residentSpeed: 78,
    visitorSpeed: 54,
    clickStopDistance: 8,
    walkAnimationDivisor: 45
  },
  characters: {
    defaultPlayerClothes: "blue",
    playerHealth: 100,
    residentHealth: 70,
    visitorHealth: 60,
    clothes: [
      { id: "blue", label: "Glacier Blue", color: "#67c7ff" },
      { id: "orange", label: "Signal Orange", color: "#ff9f43" },
      { id: "green", label: "Pine Green", color: "#72d572" },
      { id: "red", label: "Rescue Red", color: "#ff5d66" },
      { id: "purple", label: "Aurora Violet", color: "#b48cff" },
      { id: "yellow", label: "Lantern Gold", color: "#ffd166" }
    ]
  },
  transfers: {
    flySeconds: 0.38,
    pickupDistance: 48,
    woodDropDistance: 62,
    foodDropDistance: 68,
    mealPickupDistance: 55,
    cabinDropDistance: 70,
    diningDropDistance: 70
  },
  carry: {
    baseCapacity: 10,
    lumberjackBonus: 5,
    playerUpgradeBonus: 5
  },
  farm: {
    baseProduceSeconds: 18,
    levelReductionSeconds: 2.2,
    farmerReductionSeconds: 3,
    minProduceSeconds: 6
  },
  foodPrep: {
    baseProcessSeconds: 3.2,
    levelReductionSeconds: 0.45,
    cookReductionSeconds: 0.45,
    playerCookingReductionSeconds: 0.45,
    minProcessSeconds: 0.75
  },
  cabin: {
    baseHungerGainPerSecond: 0.08,
    survivorHungerGainPerSecond: 0.012,
    levelHungerReductionPerSecond: 0.01,
    minHungerGainPerSecond: 0.04,
    mealUseSeconds: 26,
    diningServeSeconds: 12,
    mealHungerRelief: 12,
    cookMealReliefBonus: 5,
    emptyDiningHungerMultiplier: 4
  },
  furnace: {
    baseFuelDrainPerSecond: 0.42,
    levelDrainReductionPerSecond: 0.08,
    minFuelDrainPerSecond: 0.12,
    emptyHungerGainPerSecond: 0.08,
    woodLoadAmount: 5,
    fuelPerWood: 7
  },
  trees: {
    chopSeconds: 5,
    lumberjackReductionSeconds: 1.1,
    playerLumberReductionSeconds: 0.55,
    minChopSeconds: 1.4,
    progressDecayPerSecond: 0.45,
    respawnSeconds: 75,
    woodDrops: 5,
    clumps: 7,
    treesPerClump: 6,
    clumpRadius: 170,
    fenceClearGridSpaces: 5,
    berryBushRatio: 0.1,
    berryGatherSeconds: 3,
    berryRespawnSeconds: 55,
    berryDrops: 3
  },
  combat: {
    baseArrowCooldown: 0.56,
    towerArrowCooldown: 0.32,
    baseArrowDamage: 22,
    towerLevelDamage: 6,
    playerAttackDamage: 5,
    towerDamageMultiplier: 2.15,
    guardDamageMultiplier: 0.25,
    baseRange: 270,
    towerRange: 380,
    wolfMinSpeed: 58,
    wolfMaxSpeed: 76,
    wolfBaseHp: 80,
    wolfBonusHp: 25,
    wolfDamage: 5,
    wolfAttackSeconds: 1.1,
    wolfAttackRandomDelay: 0.4,
    wolfRaidMinCount: 2,
    wolfRaidBonusCount: 2,
    arrowSeconds: 0.18,
    waveBaseCount: 3,
    waveCountPerTier: 1,
    waveHpPerTier: 22,
    waveDamagePerTier: 1,
    waveSpeedPerTier: 3,
    eagleStartWave: 2,
    eagleBaseHp: 52,
    eagleSpeed: 104,
    eagleDamage: 4,
    eagleAttackSeconds: 1.35,
    eagleEveryWaves: 2,
    eagleBonusPerTier: 1,
    groundDamageMultiplier: 4
  },
  build: {
    fenceCost: 4,
    fenceHealth: 70,
    gateCost: 10,
    gateHealth: 95,
    outpostCost: 28,
    outpostHealth: 90,
    cabinCost: 90,
    farmCost: 55,
    hunterPostCost: 70,
    signalTowerCost: 85,
    iceTrapCost: 60,
    advancedTowerPlayerLevel: 5,
    signalTowerPlayerLevel: 8,
    iceTrapPlayerLevel: 12
  },
  towers: {
    outpost: { range: 250, damage: 6, cooldown: 1.45 },
    hunterPost: { range: 310, damage: 10, cooldown: 1.25 },
    signalTower: { range: 280, damage: 4, cooldown: 1.7, slow: 0.68 },
    iceTrap: { range: 170, damage: 2, cooldown: 2.2, slow: 0.45 },
    stationedMultiplier: 1.8,
    playerMultiplier: 2.3,
    hunterMultiplier: 2.7
  },
  residents: {
    workDistance: 22,
    maxLevel: 10,
    baselineLevel: 5,
    levelWeights: [28, 22, 17, 12, 8, 5, 3, 2, 1, 0.5],
    levelSpeedMultipliers: [0.65, 0.75, 0.85, 0.93, 1, 1.08, 1.16, 1.25, 1.35, 1.5],
    stuckSeconds: 1.15,
    stuckNudgeDistance: 92,
    lumberjackWorkSeconds: 9,
    lumberjackLowLevelWoodAmount: 5,
    lumberjackHighLevelWoodAmount: 10,
    lumberjackHighLevelThreshold: 6,
    farmerWorkSeconds: 11,
    farmerFoodAmount: 1,
    cookWorkSecondsMultiplier: 1.15,
    engineerBuildReductionPerSecond: 0.35,
    hunterArrowCooldown: 1.25,
    hunterArrowDamage: 14,
    guardArrowCooldown: 1.55,
    guardArrowDamage: 10
  },
  failure: {
    furnaceRestorePercent: 20,
    hungerReliefPercent: 20,
    fortRepairPercent: 20,
    minHardGrade: 8,
    minHardLevel: 5
  },
  upgrades: {
    baseSeconds: 24,
    secondsPerLevel: 16,
    engineerReductionSeconds: 6,
    minSeconds: 8,
    engineerCostDiscount: 2,
    minWoodCost: 5,
    failureCostPercent: 0.2,
    fortCostMultiplier: 1.6,
    buildingCostMultiplier: 1.55,
    furnaceFuelCapacityBonus: 25,
    cabinHungerMaxBonus: 20,
    cabinUpgradeHungerRelief: 12,
    fortRepairHealthPerWood: 10,
    repairCostMultiplier: 3
  },
  particles: {
    minSpeed: 80,
    maxSpeed: 210,
    gravity: 180
  },
  snow: {
    count: 150,
    minSpeed: 26,
    maxSpeed: 96,
    minDrift: -20,
    maxDrift: 28
  },
  sprites: {
    furnace: "assets/sprites/furnace-sheet.png",
    cabin: "assets/sprites/cabin-sheet.png",
    diningHall: "assets/sprites/dining-hall-sheet.png",
    foodPrep: "assets/sprites/food-prep-sheet.png",
    tower: "assets/sprites/tower-sheet.png",
    farm: "assets/sprites/farm-sheet.png",
    tree: "assets/sprites/tree-sheet.png",
    "player-blue": "assets/sprites/player-blue-sheet.png",
    "player-orange": "assets/sprites/player-orange-sheet.png",
    "player-green": "assets/sprites/player-green-sheet.png",
    "player-red": "assets/sprites/player-red-sheet.png",
    "player-purple": "assets/sprites/player-purple-sheet.png",
    "player-yellow": "assets/sprites/player-yellow-sheet.png",
    "visitor-blue": "assets/sprites/visitor-blue-sheet.png",
    "visitor-orange": "assets/sprites/visitor-orange-sheet.png",
    "visitor-green": "assets/sprites/visitor-green-sheet.png",
    "visitor-red": "assets/sprites/visitor-red-sheet.png",
    "visitor-purple": "assets/sprites/visitor-purple-sheet.png",
    "visitor-yellow": "assets/sprites/visitor-yellow-sheet.png",
    wolf: "assets/sprites/wolf-sheet.png",
    eagle: "assets/sprites/eagle-sheet.png",
    wood: "assets/sprites/wood-sheet.png",
    lettuce: "assets/sprites/lettuce-sheet.png",
    meat: "assets/sprites/meat-sheet.png",
    meal: "assets/sprites/meal-sheet.png",
    fortWall: "assets/sprites/fort-wall-sheet.png"
  },
  spriteFrames: {
    furnace: 4,
    cabin: 4,
    diningHall: 4,
    foodPrep: 4,
    tower: 4,
    farm: 4,
    tree: 4,
    wolf: 4,
    eagle: 4,
    wood: 4,
    lettuce: 4,
    meat: 4,
    meal: 4,
    fortWall: 4
  },
  spriteRows: {
    furnace: 3,
    cabin: 3,
    diningHall: 3,
    foodPrep: 3,
    tower: 3,
    farm: 3,
    fortWall: 3,
    "player-blue": 3,
    "player-orange": 3,
    "player-green": 3,
    "player-red": 3,
    "player-purple": 3,
    "player-yellow": 3,
    "visitor-blue": 3,
    "visitor-orange": 3,
    "visitor-green": 3,
    "visitor-red": 3,
    "visitor-purple": 3,
    "visitor-yellow": 3
  },
  animation: {
    spriteFps: 7,
    walkFps: 8,
    buildingFps: 2.6
  }
};

let gameConfig = clone(defaultGameConfig);
const spriteImages = {};
const clothingImages = {};
const tintedClothingCache = new Map();
const actorIconCache = new Map();
let spritesReady = false;
let clothingReady = false;

const outfitCategories = [
  { id: "head", label: "Head", folder: "heads", colors: ["#f2a65e", "#c98252", "#8f5a3a", "#f7c99a"], count: 10 },
  { id: "hat", label: "Hat", folder: "hats", colors: ["#173047", "#ff9f43", "#f4f9ff", "#b48cff"] },
  { id: "shirt", label: "Shirt", folder: "shirts", colors: ["#67c7ff", "#ff5d66", "#73df9b", "#ffd166"] },
  { id: "pants", label: "Pants", folder: "pants", colors: ["#25384d", "#5e6f80", "#3b5d47", "#6a4a78"] },
  { id: "shoes", label: "Shoes", folder: "shoes", colors: ["#1c2530", "#704d2e", "#dff7ff", "#3a4654"] }
];

const storageKey = "frozen-frontier-base-v26";
const keys = new Set();
let heldMove = { x: 0, y: 0 };
let touchMove = null;
const activeTouchPointers = new Map();
let pinchZoom = null;
let dpr = 1;
let camera = { x: 0, y: 0, zoom: defaultGameConfig.camera.defaultZoom };
let lastTime = performance.now();
let modalOpen = false;
let pendingVisitor = null;
let pendingRecruit = null;
let replacementRecruit = null;
let activeTask = null;
let activeTaskContext = null;
let buildMode = false;
let selectedBuildType = "fence";
let buildPreview = null;
let moveMode = false;
let removeMode = false;
let selectedMoveTarget = null;
let movePreview = null;
let buildTrayCollapsed = true;
let actionsCollapsed = true;
let paused = false;
let suppressNextCanvasClick = false;
let wolfCheckTimer = 0;
let survivorCheckTimer = 0;
let attackActive = false;
let arrowCooldown = 0;
let starterTowerCooldown = 0;
let messageTimer = 0;
let saveTimer = 0;
let gameOver = false;
let failureLock = null;
let audioContext = null;
let audioUnlocked = false;
let dismissedUpgradeNoticeAt = -1;
let notificationMarkup = "";
let warningState = { furnace: false, hunger: false, fort: false };
let centerToastTimer = 0;
let recentLearningTaskIds = [];
let pendingCarry = 0;
let residentDeathNotices = [];

const defaultState = {
  player: {
    x: 4500,
    y: 3700,
    target: null,
    walkTime: 0,
    facing: 1,
    direction: "down",
    clothes: "blue",
    outfit: {
      head: { id: "head-01", color: "#f2a65e" },
      hat: { id: "hat-01", color: "#173047" },
      shirt: { id: "shirt-01", color: "#67c7ff" },
      pants: { id: "pants-01", color: "#25384d" },
      shoes: { id: "shoes-01", color: "#1c2530" }
    },
    health: 100,
    maxHealth: 100
  },
  stored: { wood: 18, lettuce: 0, meat: 0, meal: 0 },
  carry: { wood: 0, lettuce: 0, berries: 0, meat: 0, meal: 0 },
  survivors: [],
  visitor: null,
  buildings: {},
  fortHealth: 100,
  fortLevel: 1,
  fortUpgradeCost: 35,
  learningPoints: 0,
  playerUpgrades: { attack: 0, carry: 0, lumber: 0, cooking: 0 },
  playerLevel: 1,
  structures: [],
  wave: { number: 0, timer: defaultGameConfig.timers.daySeconds, active: false, survivorCooldown: 0, interWaveVisitorPending: false, spawnTimer: 0, nightSpawned: 0 },
  towerStationedResidentId: null,
  towerInstructionShown: false,
  tutorialFlags: { furnaceUpgrade: false, foodUpgrade: false, cabinUpgrade: false },
  cooldowns: {},
  upgradeJobs: []
};

let state = loadState();
let buildings = hydrateBuildings();
let resources = [];
let trees = [];
let wolves = [];
let arrows = [];
let flies = [];
let particles = [];
let snow = createSnow();
state.player = normalizePlayer(state.player);
state.survivors = state.survivors.map((survivor, index) => normalizeSurvivor(survivor, index));
if (!state.structures.length) state.structures = createInitialDefenseStructures();
state.wave = normalizeNightCycleState({ ...defaultState.wave, ...(state.wave || {}) });
syncFortHealthFromGates();
trees = createTrees();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return clone(defaultState);
    const parsed = JSON.parse(raw);
    return {
      ...clone(defaultState),
      ...parsed,
      stored: { ...defaultState.stored, ...(parsed.stored || {}) },
      carry: { ...defaultState.carry, ...(parsed.carry || {}) },
      player: { ...defaultState.player, ...(parsed.player || {}) },
      playerUpgrades: { ...defaultState.playerUpgrades, ...(parsed.playerUpgrades || {}) },
      playerLevel: parsed.playerLevel || defaultState.playerLevel,
      structures: Array.isArray(parsed.structures) ? parsed.structures : [],
      wave: { ...defaultState.wave, ...(parsed.wave || {}) },
      towerStationedResidentId: parsed.towerStationedResidentId || null,
      tutorialFlags: { ...defaultState.tutorialFlags, ...(parsed.tutorialFlags || {}) },
      cooldowns: parsed.cooldowns || {},
      upgradeJobs: Array.isArray(parsed.upgradeJobs) ? parsed.upgradeJobs : [],
      survivors: Array.isArray(parsed.survivors) ? parsed.survivors : [],
      buildings: parsed.buildings || {}
    };
  } catch (error) {
    return clone(defaultState);
  }
}

function saveState() {
  state.buildings = {};
  Object.values(buildings).forEach((building) => {
    state.buildings[building.id] = {
      level: building.level,
      upgradeCost: building.upgradeCost,
      fuel: building.fuel,
      maxFuel: building.maxFuel,
      hunger: building.hunger,
      maxHunger: building.maxHunger,
      raw: building.raw,
      meals: building.meals,
      mealUseProgress: building.mealUseProgress,
      produceProgress: building.produceProgress,
      processProgress: building.processProgress
    };
  });
  state.fortHealth = fort.health;
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function hydrateBuildings() {
  const result = clone(buildingData);
  Object.values(result).forEach((building) => {
    const saved = state.buildings[building.id];
    if (saved) {
      Object.assign(building, saved);
    }
  });
  fort.maxHealth = fortMaxHealth();
  fort.health = clamp(state.fortHealth || fort.maxHealth, 0, fort.maxHealth);
  Object.values(result).forEach((building) => snapBuildingPositionToGrid(building));
  return result;
}

function createTrees() {
  const config = gameConfig.trees || defaultGameConfig.trees;
  const size = gridSize();
  const clearance = (config.fenceClearGridSpaces || 5) * size;
  const points = [];
  const clumps = config.clumps || 7;
  const treesPerClump = config.treesPerClump || 6;
  let attempts = 0;
  while (points.length < clumps * treesPerClump && attempts < 900) {
    attempts += 1;
    const center = {
      x: 160 + Math.random() * (world.width - 320),
      y: 160 + Math.random() * (world.height - 320)
    };
    if (!treePointAllowed(center, clearance)) continue;
    for (let i = 0; i < treesPerClump; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 24 + Math.random() * (config.clumpRadius || 170);
      const point = {
        x: clamp(center.x + Math.cos(angle) * radius, 90, world.width - 90),
        y: clamp(center.y + Math.sin(angle) * radius, 110, world.height - 90)
      };
      if (treePointAllowed(point, clearance)) points.push([point.x, point.y]);
    }
  }
  const treesList = points.map(([x, y], index) => ({
    id: `tree-${index}`,
    type: "tree",
    x,
    y,
    health: 1,
    progress: 0,
    alive: true,
    respawn: 0,
    shake: 0
  }));
  const bushCount = Math.max(1, Math.round(treesList.length * (config.berryBushRatio || 0.1)));
  for (let i = 0; i < bushCount; i += 1) {
    for (let attempt = 0; attempt < 80; attempt += 1) {
      const point = {
        x: 140 + Math.random() * (world.width - 280),
        y: 130 + Math.random() * (world.height - 260)
      };
      const tooClose = treesList.some((tree) => dist(point, tree) < 80);
      if (tooClose || !treePointAllowed(point, clearance)) continue;
      treesList.push({
        id: `berry-bush-${i}`,
        type: "berryBush",
        x: point.x,
        y: point.y,
        health: 1,
        progress: 0,
        alive: true,
        respawn: 0,
        shake: 0
      });
      break;
    }
  }
  return treesList;
}

function treePointAllowed(point, clearance) {
  if (pointInRect(point, fort, 70)) return false;
  return !state.structures.some((structure) => isBarrierType(structure.type) && dist(point, structure) < clearance);
}

function createSnow() {
  const config = gameConfig.snow;
  return Array.from({ length: config.count }, () => ({
    x: Math.random() * world.width,
    y: Math.random() * world.height,
    r: 1 + Math.random() * 2.6,
    drift: config.minDrift + Math.random() * (config.maxDrift - config.minDrift),
    speed: config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed)
  }));
}

function gridSize() {
  return gameConfig.grid.size || 80;
}

function snapToGrid(point) {
  const size = gridSize();
  return {
    x: Math.floor(point.x / size) * size + size / 2,
    y: Math.floor(point.y / size) * size + size / 2
  };
}

function snapBuildingPositionToGrid(building) {
  const snapped = snapToGrid(buildingCenter(building));
  building.x = snapped.x - building.w / 2;
  building.y = snapped.y - building.h / 2;
}

function snapAllBuildingsToGrid() {
  Object.values(buildings || {}).forEach((building) => snapBuildingPositionToGrid(building));
  syncDropoffsToBuildings();
}

function syncDropoffsToBuildings() {
  if (!buildings || !buildings.furnace || !buildings.foodPrep || !buildings.diningHall || !buildings.cabin) return;
  dropoffs.wood.x = buildings.furnace.x + buildings.furnace.w / 2;
  dropoffs.wood.y = buildings.furnace.y + buildings.furnace.h + 25;
  dropoffs.food.x = buildings.foodPrep.x + buildings.foodPrep.w * 0.3;
  dropoffs.food.y = buildings.foodPrep.y + buildings.foodPrep.h * 0.25;
  dropoffs.mealPickup.x = buildings.foodPrep.x + buildings.foodPrep.w * 0.84;
  dropoffs.mealPickup.y = buildings.foodPrep.y + buildings.foodPrep.h * 0.25;
  dropoffs.dining.x = buildings.diningHall.x + buildings.diningHall.w / 2;
  dropoffs.dining.y = buildings.diningHall.y + buildings.diningHall.h * 0.67;
  dropoffs.cabin.x = buildings.cabin.x + buildings.cabin.w * 0.31;
  dropoffs.cabin.y = buildings.cabin.y + buildings.cabin.h * 0.62;
}

function structureRect(structure) {
  const size = gridSize();
  if (isBarrierType(structure.type)) return { x: structure.x - size / 2, y: structure.y - size / 2, w: size, h: size };
  if (structure.type === "cabin") return { x: structure.x - 90, y: structure.y - 70, w: 180, h: 130 };
  if (structure.type === "farm") return { x: structure.x - 80, y: structure.y - 50, w: 160, h: 110 };
  return { x: structure.x - 48, y: structure.y - 72, w: 96, h: 126 };
}

function createStructure(type, x, y, extras = {}) {
  const build = gameConfig.build;
  const level = isBarrierType(type) ? state.fortLevel || 1 : 1;
  const health = type === "fence" || type === "gate" ? barrierMaxHealth(type, level) : type === "cabin" ? 120 : type === "farm" ? 85 : build.outpostHealth;
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    x,
    y,
    level,
    health,
    maxHealth: health,
    cooldown: Math.random(),
    produceProgress: 0,
    stationedResidentId: null,
    ...extras
  };
}

function createInitialDefenseStructures() {
  const size = defaultGameConfig.grid.size;
  const structures = [];
  const cellCenter = (value) => Math.floor(value / size) * size + size / 2;
  const leftX = cellCenter(fort.x - 48);
  const rightX = cellCenter(fort.x + fort.w + 48);
  const topY = cellCenter(fort.y - 48);
  const bottomY = cellCenter(fort.y + fort.h + 48);
  const gateX = cellCenter(fort.entrance.x);
  for (let x = leftX; x <= rightX; x += size) {
    structures.push(createStructure("fence", x, topY));
    const nearEntrance = x === gateX || x === gateX - size;
    structures.push(createStructure(nearEntrance ? "gate" : "fence", x, bottomY));
  }
  for (let y = topY + size; y <= bottomY - size; y += size) {
    structures.push(createStructure("fence", leftX, y));
    structures.push(createStructure("fence", rightX, y));
  }
  return structures;
}

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function setMessage(text, seconds = 3) {
  hud.eventLog.textContent = text;
  messageTimer = seconds;
}

function showCenterMessage(text, seconds = 1.8) {
  if (!hud.centerToast) return;
  hud.centerToast.textContent = text;
  hud.centerToast.classList.remove("hidden");
  centerToastTimer = seconds;
}

function stopBuildMode(message = "Build mode stopped.") {
  selectedBuildType = null;
  buildMode = false;
  buildPreview = null;
  moveMode = false;
  removeMode = false;
  selectedMoveTarget = null;
  movePreview = null;
  renderBuildTray();
  setMessage(message, 3);
}

function hasSpecialty(id) {
  return state.survivors.some((survivor) => survivor.specialty === id);
}

function specialtyCount(id) {
  return state.survivors.filter((survivor) => survivor.specialty === id).length;
}

function randomResidentLevel() {
  const config = gameConfig.residents;
  const max = config.maxLevel || 10;
  const weights = config.levelWeights || Array.from({ length: max }, (_, index) => max - index);
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let roll = Math.random() * total;
  for (let index = 0; index < max; index += 1) {
    roll -= weights[index] || 0;
    if (roll <= 0) return index + 1;
  }
  return 1;
}

function residentLevel(survivor) {
  const config = gameConfig.residents;
  return clamp(Math.round(survivor.level || config.baselineLevel || 5), 1, config.maxLevel || 10);
}

function residentLevelMultiplier(survivor) {
  const level = residentLevel(survivor);
  const multipliers = gameConfig.residents.levelSpeedMultipliers || [];
  return multipliers[level - 1] || 1;
}

function residentMoveSpeed(survivor) {
  return gameConfig.movement.residentSpeed * residentLevelMultiplier(survivor);
}

function residentWorkSeconds(survivor, seconds) {
  return Math.max(0.2, seconds / residentLevelMultiplier(survivor));
}

function residentCooldown(survivor, seconds) {
  return Math.max(0.18, seconds / residentLevelMultiplier(survivor));
}

function lumberjackCarryAmount(survivor) {
  const config = gameConfig.residents;
  return residentLevel(survivor) >= (config.lumberjackHighLevelThreshold || 6)
    ? (config.lumberjackHighLevelWoodAmount || 10)
    : (config.lumberjackLowLevelWoodAmount || 5);
}

function playerStatBonus(stat) {
  return state.playerUpgrades[stat] || 0;
}

function clothingOptions() {
  return gameConfig.characters.clothes || defaultGameConfig.characters.clothes;
}

function randomClothingId() {
  return randomChoice(clothingOptions()).id;
}

function clothingColor(id) {
  return (clothingOptions().find((option) => option.id === id) || clothingOptions()[0]).color;
}

function outfitCatalog() {
  return outfitCategories.reduce((catalog, category) => {
    catalog[category.id] = Array.from({ length: category.count || 10 }, (_, index) => {
      const number = String(index + 1).padStart(2, "0");
      return {
        id: `${category.id}-${number}`,
        label: `${category.label} ${index + 1}`,
        source: `assets/clothing/${category.folder}/${category.id}-${number}.gif`
      };
    });
    return catalog;
  }, {});
}

function defaultOutfit(tint = gameConfig.characters.defaultPlayerClothes) {
  return {
    head: { id: "head-01", color: "#f2a65e" },
    hat: { id: "hat-01", color: "#173047" },
    shirt: { id: "shirt-01", color: clothingColor(tint || gameConfig.characters.defaultPlayerClothes) },
    pants: { id: "pants-01", color: "#25384d" },
    shoes: { id: "shoes-01", color: "#1c2530" }
  };
}

function normalizeOutfit(outfit = null, tint = null) {
  const base = defaultOutfit(tint);
  const catalog = outfitCatalog();
  outfitCategories.forEach((category) => {
    const saved = outfit?.[category.id] || {};
    const options = catalog[category.id];
    const valid = options.some((option) => option.id === saved.id);
    base[category.id] = {
      id: valid ? saved.id : base[category.id].id,
      color: saved.color || base[category.id].color
    };
  });
  return base;
}

function randomOutfit() {
  const catalog = outfitCatalog();
  return outfitCategories.reduce((outfit, category) => {
    outfit[category.id] = {
      id: randomChoice(catalog[category.id]).id,
      color: randomChoice(category.colors)
    };
    return outfit;
  }, {});
}

function characterSprite(prefix, clothes) {
  return `${prefix}-${clothes || gameConfig.characters.defaultPlayerClothes}`;
}

function setActorDirection(actor, dx, dy) {
  if (Math.abs(dx) > 0.05) actor.facing = dx > 0 ? 1 : -1;
  if (Math.abs(dy) > Math.abs(dx) * 1.15) actor.direction = dy < 0 ? "up" : "down";
  else if (Math.abs(dx) > 0.05) actor.direction = dx > 0 ? "right" : "left";
}

function directionRow(actor) {
  if (actor.direction === "right") return 1;
  if (actor.direction === "up") return 2;
  if (actor.direction === "left") return 3;
  if (actor.direction === "side") return actor.facing < 0 ? 3 : 1;
  return 0;
}

function levelSpriteRow(level) {
  return clamp(Math.max(0, (level || 1) - 1), 0, 2);
}

function normalizePlayer(player = {}) {
  const maxHealth = Number.isFinite(player.maxHealth) ? player.maxHealth : gameConfig.characters.playerHealth;
  return {
    ...defaultState.player,
    ...player,
    clothes: player.clothes || gameConfig.characters.defaultPlayerClothes,
    outfit: normalizeOutfit(player.outfit, player.clothes),
    maxHealth,
    health: clamp(Number.isFinite(player.health) ? player.health : maxHealth, 0, maxHealth)
  };
}

function normalizeSurvivor(survivor, index = 0) {
  const start = survivorPosition(index);
  const maxHealth = Number.isFinite(survivor.maxHealth) ? survivor.maxHealth : gameConfig.characters.residentHealth;
  return {
    ...survivor,
    level: residentLevel(survivor),
    clothes: survivor.clothes || randomClothingId(),
    outfit: normalizeOutfit(survivor.outfit, survivor.clothes),
    x: Number.isFinite(survivor.x) ? survivor.x : start.x,
    y: Number.isFinite(survivor.y) ? survivor.y : start.y,
    maxHealth,
    health: clamp(Number.isFinite(survivor.health) ? survivor.health : maxHealth, 0, maxHealth),
    injuredTimer: Number.isFinite(survivor.injuredTimer) ? survivor.injuredTimer : 0,
    facing: survivor.facing || 1,
    direction: survivor.direction || "down",
    walkTime: Number.isFinite(survivor.walkTime) ? survivor.walkTime : 0,
    carrying: survivor.carrying || null,
    carryAmount: Number.isFinite(survivor.carryAmount) ? survivor.carryAmount : 0,
    workTimer: Number.isFinite(survivor.workTimer) ? survivor.workTimer : Math.random() * 3,
    arrowCooldown: Number.isFinite(survivor.arrowCooldown) ? survivor.arrowCooldown : Math.random(),
    target: survivor.target || null,
    stuckTimer: Number.isFinite(survivor.stuckTimer) ? survivor.stuckTimer : 0,
    pathNudge: survivor.pathNudge || null
  };
}

function survivorPosition(index = 0) {
  return {
    x: buildings.cabin.x + 42 + (index % 4) * 32,
    y: buildings.cabin.y + buildings.cabin.h + 48 + Math.floor(index / 4) * 28
  };
}

function playerUpgradeCost(stat) {
  return 8 + playerStatBonus(stat) * 6;
}

function playerUpgradeOptions() {
  return [
    { id: "attack", name: "Arrow Power", copy: "Adds damage to every arrow." },
    { id: "carry", name: "Carry Stack", copy: "Increases how many items can be carried." },
    { id: "lumber", name: "Woodcutting", copy: "Cuts trees faster." },
    { id: "cooking", name: "Cooking", copy: "Processes food faster." }
  ];
}

function dayDuration() {
  return gameConfig.timers.daySeconds || defaultGameConfig.timers.daySeconds || 300;
}

function nightDuration() {
  return gameConfig.timers.nightSeconds || defaultGameConfig.timers.nightSeconds || 60;
}

function currentPhaseDuration() {
  return state.wave.active ? nightDuration() : dayDuration();
}

function cyclePhaseProgress() {
  const duration = currentPhaseDuration();
  return clamp(1 - (state.wave.timer || 0) / duration, 0, 1);
}

function cycleTimeText() {
  const seconds = Math.max(0, Math.ceil(state.wave.timer || 0));
  return `${state.wave.active ? "Night" : "Day"} ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function normalizeNightCycleState(wave = {}) {
  return {
    ...defaultState.wave,
    ...wave,
    timer: Number.isFinite(wave.timer) ? wave.timer : (wave.active ? nightDuration() : dayDuration()),
    spawnTimer: Number.isFinite(wave.spawnTimer) ? wave.spawnTimer : 0,
    nightSpawned: Number.isFinite(wave.nightSpawned) ? wave.nightSpawned : 0,
    active: Boolean(wave.active)
  };
}

function randomNightSpawnDelay(first = false) {
  const timers = gameConfig.timers;
  if (first) return timers.nightFirstSpawnSeconds || 5;
  const min = timers.nightSpawnMinSeconds || 6;
  const max = Math.max(min, timers.nightSpawnMaxSeconds || 16);
  return min + Math.random() * (max - min);
}

function affordablePlayerUpgrade() {
  return playerUpgradeOptions()
    .map((upgrade) => ({ ...upgrade, cost: playerUpgradeCost(upgrade.id) }))
    .filter((upgrade) => state.learningPoints >= upgrade.cost)
    .sort((a, b) => a.cost - b.cost)[0] || null;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function pointInRect(point, rect, padding = 0) {
  return point.x >= rect.x - padding && point.x <= rect.x + rect.w + padding && point.y >= rect.y - padding && point.y <= rect.y + rect.h + padding;
}

function cameraZoomConfig() {
  const config = gameConfig.camera || defaultGameConfig.camera;
  return {
    min: config.minZoom || defaultGameConfig.camera.minZoom,
    max: config.maxZoom || defaultGameConfig.camera.maxZoom,
    default: config.defaultZoom || defaultGameConfig.camera.defaultZoom
  };
}

function setCameraZoom(value) {
  const config = cameraZoomConfig();
  camera.zoom = clamp(value, config.min, config.max);
  updateCamera();
}

function adjustCameraZoom(multiplier) {
  setCameraZoom(camera.zoom * multiplier);
}

function resetCameraZoom() {
  setCameraZoom(cameraZoomConfig().default);
}

function worldToScreen(point) {
  return { x: (point.x - camera.x) * camera.zoom, y: (point.y - camera.y) * camera.zoom };
}

function screenToWorld(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) / camera.zoom + camera.x,
    y: (event.clientY - rect.top) / camera.zoom + camera.y
  };
}

function carryTotal() {
  return Object.values(state.carry).reduce((sum, value) => sum + value, 0);
}

function carryCapacity() {
  const config = gameConfig.carry;
  return config.baseCapacity + specialtyCount("lumberjack") * config.lumberjackBonus + playerStatBonus("carry") * config.playerUpgradeBonus;
}

function reservedCarryTotal() {
  return carryTotal() + pendingCarry;
}

function availableCarrySpace() {
  return Math.max(0, carryCapacity() - reservedCarryTotal());
}

function reserveCarrySpace(amount) {
  const reserved = Math.min(amount, availableCarrySpace());
  pendingCarry += reserved;
  return reserved;
}

function completeCarryReservation(amount) {
  pendingCarry = Math.max(0, pendingCarry - amount);
}

function buildingCenter(building) {
  return { x: building.x + building.w / 2, y: building.y + building.h / 2 };
}

function randomChoice(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function mergeConfig(base, override) {
  const result = clone(base);
  Object.entries(override || {}).forEach(([key, value]) => {
    if (value && typeof value === "object" && !Array.isArray(value) && result[key] && typeof result[key] === "object") {
      result[key] = mergeConfig(result[key], value);
    } else {
      result[key] = value;
    }
  });
  return result;
}

async function loadGameConfig() {
  try {
    const response = await fetch("game-config.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Config file unavailable");
    gameConfig = mergeConfig(defaultGameConfig, await response.json());
  } catch (error) {
    gameConfig = clone(defaultGameConfig);
  }
  applyGameConfig();
}

function applyGameConfig() {
  Object.assign(world, gameConfig.world || {});
  setCameraZoom(camera.zoom || cameraZoomConfig().default);
  state.player = normalizePlayer(state.player);
  state.survivors = state.survivors.map((survivor, index) => normalizeSurvivor(survivor, index));
  const fortConfig = gameConfig.fort || {};
  ["x", "y", "w", "h"].forEach((key) => {
    if (Number.isFinite(fortConfig[key])) fort[key] = fortConfig[key];
  });
  if (fortConfig.entrance) fort.entrance = { ...fort.entrance, ...fortConfig.entrance };
  if (fortConfig.attackPoint) fort.attackPoint = { ...fort.attackPoint, ...fortConfig.attackPoint };
  fort.maxHealth = fortMaxHealth();
  fort.health = clamp(state.fortHealth || fort.maxHealth, 0, fort.maxHealth);
  state.wave = normalizeNightCycleState(state.wave);
  snapAllBuildingsToGrid();
  snow = createSnow();
}

function fortMaxHealth() {
  const config = gameConfig.fort;
  return config.baseHealth + Math.max(0, state.fortLevel - 1) * config.healthPerLevel;
}

function fibonacciNumber(n) {
  let a = 1;
  let b = 1;
  for (let i = 2; i < n; i += 1) {
    [a, b] = [b, a + b];
  }
  return n <= 1 ? 1 : b;
}

function barrierUpgradeCost(targetLevel = state.fortLevel + 1) {
  return fibonacciNumber(Math.max(1, targetLevel)) * 100;
}

function barrierMaxHealth(type, level = state.fortLevel || 1) {
  const base = type === "gate" ? gameConfig.build.gateHealth : gameConfig.build.fenceHealth;
  return base * (2 ** Math.max(0, level - 1));
}

function gateStructures() {
  return state.structures.filter((structure) => structure.type === "gate");
}

function gateHealthPercent() {
  const gates = gateStructures();
  if (!gates.length) return fort.health / Math.max(1, fort.maxHealth);
  const total = gates.reduce((sum, gate) => sum + clamp(gate.health / gate.maxHealth, 0, 1), 0);
  return total / gates.length;
}

function syncFortHealthFromGates() {
  const gates = gateStructures();
  if (!gates.length) return;
  fort.maxHealth = Math.round(gates.reduce((sum, gate) => sum + gate.maxHealth, 0) / gates.length);
  fort.health = Math.round(gates.reduce((sum, gate) => sum + gate.health, 0) / gates.length);
}

function setGateHealthPercent(percent) {
  const gates = gateStructures();
  gates.forEach((gate) => {
    gate.health = clamp(gate.maxHealth * percent, 0, gate.maxHealth);
  });
  syncFortHealthFromGates();
}

function farmProduceSeconds(level = buildings.farm ? buildings.farm.level : 1) {
  const config = gameConfig.farm;
  return Math.max(
    config.minProduceSeconds,
    config.baseProduceSeconds - level * config.levelReductionSeconds - specialtyCount("farmer") * config.farmerReductionSeconds
  );
}

function foodProcessSeconds() {
  const config = gameConfig.foodPrep;
  return Math.max(
    config.minProcessSeconds,
    config.baseProcessSeconds
      - buildings.foodPrep.level * config.levelReductionSeconds
      - specialtyCount("cook") * config.cookReductionSeconds
      - playerStatBonus("cooking") * config.playerCookingReductionSeconds
  );
}

function cabinHungerGainPerSecond() {
  const config = gameConfig.cabin;
  return Math.max(
    config.minHungerGainPerSecond,
    config.baseHungerGainPerSecond
      + state.survivors.length * config.survivorHungerGainPerSecond
      - buildings.cabin.level * config.levelHungerReductionPerSecond
  );
}

function furnaceFuelDrainPerSecond() {
  const config = gameConfig.furnace;
  return Math.max(
    config.minFuelDrainPerSecond,
    config.baseFuelDrainPerSecond - buildings.furnace.level * config.levelDrainReductionPerSecond
  );
}

function treeChopSeconds() {
  const config = gameConfig.trees;
  return Math.max(
    config.minChopSeconds,
    config.chopSeconds
      - specialtyCount("lumberjack") * config.lumberjackReductionSeconds
      - playerStatBonus("lumber") * config.playerLumberReductionSeconds
  );
}

function playerLevel() {
  return state.playerLevel || 1;
}

function extraCabinLimit() {
  return Math.floor(playerLevel() / 10);
}

function structureDisplayName(type) {
  const names = {
    fence: "Fence",
    gate: "Gate",
    outpost: "Outpost",
    hunterPost: "Hunter Post",
    signalTower: "Signal Tower",
    iceTrap: "Ice Trap",
    cabin: "Cabin",
    farm: "Farm"
  };
  return names[type] || "Structure";
}

function structureCost(type) {
  const build = gameConfig.build;
  const costs = {
    fence: build.fenceCost,
    gate: build.gateCost,
    outpost: build.outpostCost,
    hunterPost: build.hunterPostCost,
    signalTower: build.signalTowerCost,
    iceTrap: build.iceTrapCost,
    cabin: build.cabinCost,
    farm: build.farmCost
  };
  return costs[type] || 999;
}

function buildCatalog() {
  const build = gameConfig.build;
  const extraCabins = state.structures.filter((structure) => structure.type === "cabin").length;
  return [
    { type: "fence", unlocked: true, note: "Blocks attackers and absorbs damage." },
    { type: "gate", unlocked: true, note: "Friendly units pass through. Enemies still have to break it." },
    { type: "outpost", unlocked: true, note: "Basic arrow tower. Can station residents." },
    { type: "hunterPost", unlocked: playerLevel() >= build.advancedTowerPlayerLevel, note: `Unlocks at player level ${build.advancedTowerPlayerLevel}. Stronger arrows.` },
    { type: "signalTower", unlocked: playerLevel() >= build.signalTowerPlayerLevel, note: `Unlocks at player level ${build.signalTowerPlayerLevel}. Slows enemies in range.` },
    { type: "iceTrap", unlocked: playerLevel() >= build.iceTrapPlayerLevel, note: `Unlocks at player level ${build.iceTrapPlayerLevel}. Heavy slow, low damage.` },
    { type: "cabin", unlocked: extraCabins < extraCabinLimit(), note: `One additional cabin unlocks every 10 player levels. Available ${extraCabinLimit() - extraCabins}.` },
    { type: "farm", unlocked: buildings.foodPrep.level >= 3, note: "Unlocks when Food Prep reaches level 3." }
  ];
}

function isTowerType(type) {
  return ["outpost", "hunterPost", "signalTower", "iceTrap"].includes(type);
}

function isBarrierType(type) {
  return type === "fence" || type === "gate";
}

function towerStats(structure) {
  const base = gameConfig.towers[structure.type] || gameConfig.towers.outpost;
  return {
    range: base.range,
    damage: base.damage + Math.max(0, structure.level - 1) * 3,
    cooldown: Math.max(0.55, base.cooldown - Math.max(0, structure.level - 1) * 0.08),
    slow: base.slow || 1
  };
}

function canPlaceStructure(type, point) {
  const entry = buildCatalog().find((item) => item.type === type);
  if (!entry || !entry.unlocked) return { ok: false, reason: "That structure is not unlocked yet." };
  const cost = structureCost(type);
  if (state.stored.wood < cost) return { ok: false, reason: `Need ${cost} wood.` };
  const sameCell = structureAt(point);
  if (type === "gate" && sameCell && sameCell.type === "fence") {
    const replaceIds = gateReplacementIds(sameCell);
    if (replaceIds.length >= 2) return { ok: true, cost, replaceIds };
    return { ok: false, reason: "Gates need two connected fence blocks." };
  }
  if (type === "gate") return { ok: false, reason: "Place gates on an existing fence segment." };
  const rect = structureRect({ type, x: point.x, y: point.y });
  if (rect.x < 60 || rect.y < 80 || rect.x + rect.w > world.width - 60 || rect.y + rect.h > world.height - 60) {
    return { ok: false, reason: "Too close to the wilderness edge." };
  }
  const blockingBuilding = Object.values(buildings).some((building) => rectanglesOverlap(rect, building));
  if (blockingBuilding) return { ok: false, reason: "A starting building is already there." };
  const blockingStructure = state.structures.some((structure) => rectanglesOverlap(rect, structureRect(structure)));
  if (blockingStructure) return { ok: false, reason: "That grid space is occupied." };
  return { ok: true, cost };
}

function structureAt(point) {
  return state.structures.find((structure) => structure.x === point.x && structure.y === point.y);
}

function gateReplacementIds(fence) {
  const size = gridSize();
  const candidates = [
    { x: fence.x + size, y: fence.y },
    { x: fence.x - size, y: fence.y },
    { x: fence.x, y: fence.y + size },
    { x: fence.x, y: fence.y - size }
  ];
  const neighbor = candidates
    .map((point) => structureAt(point))
    .find((structure) => structure && structure.type === "fence");
  return neighbor ? [fence.id, neighbor.id] : [fence.id];
}

function rectanglesOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function loadSprites() {
  const entries = Object.entries(gameConfig.sprites || {});
  return Promise.all(entries.map(([name, source]) => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = source;
    spriteImages[name] = image;
  }))).then(() => {
    spritesReady = true;
  });
}

function loadClothingAssets() {
  const catalog = outfitCatalog();
  const entries = outfitCategories.flatMap((category) => catalog[category.id]);
  return Promise.all(entries.map((item) => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = item.source;
    clothingImages[item.id] = image;
  }))).then(() => {
    clothingReady = true;
  });
}

function spriteFrameCount(name) {
  if (gameConfig.spriteFrames && gameConfig.spriteFrames[name]) return gameConfig.spriteFrames[name];
  if (name.startsWith("player-") || name.startsWith("visitor-")) return 4;
  return 1;
}

function spriteRowCount(name) {
  if (gameConfig.spriteRows && gameConfig.spriteRows[name]) return gameConfig.spriteRows[name];
  return 1;
}

function spriteDefaultFps(name) {
  if (["furnace", "cabin", "diningHall", "foodPrep", "tower", "farm", "tree", "fortWall"].includes(name)) return gameConfig.animation.buildingFps || 2.6;
  return gameConfig.animation.spriteFps || 7;
}

function drawSprite(name, x, y, w, h, options = {}) {
  const image = spriteImages[name];
  if (!spritesReady || !image || !image.complete || !image.naturalWidth) return false;
  const frames = spriteFrameCount(name);
  const rows = spriteRowCount(name);
  const sourceW = image.naturalWidth / frames;
  const sourceH = image.naturalHeight / rows;
  const fps = options.fps || spriteDefaultFps(name);
  const frame = Number.isFinite(options.frame)
    ? Math.floor(options.frame) % frames
    : Math.floor((performance.now() / 1000) * fps) % frames;
  const row = clamp(Number.isFinite(options.row) ? Math.floor(options.row) : 0, 0, rows - 1);
  const sourceX = sourceW * frame;
  const sourceY = sourceH * row;
  ctx.save();
  if (options.flip) {
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
    ctx.drawImage(image, sourceX, sourceY, sourceW, sourceH, 0, 0, w, h);
  } else {
    ctx.drawImage(image, sourceX, sourceY, sourceW, sourceH, x, y, w, h);
  }
  ctx.restore();
  return true;
}

function unlockAudio() {
  if (audioUnlocked) return;
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return;
  audioContext = audioContext || new AudioCtor();
  audioContext.resume();
  audioUnlocked = true;
}

function playSound(name) {
  if (!audioUnlocked || !audioContext) return;
  const presets = {
    pickup: [660, 0.055, "triangle", 0.04],
    drop: [390, 0.07, "sine", 0.05],
    cook: [720, 0.11, "triangle", 0.05],
    arrow: [920, 0.045, "sawtooth", 0.025],
    hit: [120, 0.16, "square", 0.06],
    alarm: [220, 0.28, "sawtooth", 0.045],
    success: [820, 0.12, "triangle", 0.055],
    fail: [95, 0.42, "square", 0.055],
    upgrade: [540, 0.18, "triangle", 0.05]
  };
  const preset = presets[name];
  if (!preset) return;
  const [frequency, duration, type, volume] = preset;
  const now = audioContext.currentTime;
  const gain = audioContext.createGain();
  const osc = audioContext.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(40, frequency * 0.62), now + duration);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

async function loadLearningTasks() {
  try {
    const response = await fetch("challenges.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Challenge file unavailable");
    learningTasks = shuffled(await response.json());
  } catch (error) {
    learningTasks = [
      {
        type: "Math",
        grade: 3,
        minLevel: 1,
        points: 3,
        title: "Emergency Count",
        text: "The camp has 6 logs and finds 4 more. How many logs are there?",
        options: [{ label: "9 logs" }, { label: "10 logs", correct: true }, { label: "12 logs" }],
        feedback: "6 plus 4 makes 10 logs."
      }
    ];
  }
}

function selectLearningTask(level = 1) {
  const targetLevel = clamp(level, 1, 5);
  const eligible = learningTasks.filter((task) => (task.minLevel || 1) <= targetLevel);
  const nearby = eligible.filter((task) => (task.minLevel || 1) >= Math.max(1, targetLevel - 1));
  const pool = Math.random() < 0.75 && nearby.length ? nearby : eligible;
  const candidates = (pool.length ? pool : learningTasks).filter((task) => !recentLearningTaskIds.includes(task.id));
  const task = randomChoice(candidates.length ? candidates : (pool.length ? pool : learningTasks));
  if (task && task.id) {
    recentLearningTaskIds.push(task.id);
    recentLearningTaskIds = recentLearningTaskIds.slice(-24);
  }
  return task;
}

function shuffled(list) {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function awardLearningPoints(task) {
  const points = task.points || Math.max(3, task.grade || 3);
  state.learningPoints += points;
  setMessage(`Learning task complete. +${points} upgrade points.`, 5);
  playSound("success");
}

function spawnResource(type, x, y, amount = 1) {
  resources.push({
    id: `${type}-${Date.now()}-${Math.random()}`,
    type,
    x,
    y,
    amount,
    bob: Math.random() * Math.PI * 2,
    pickupLock: false
  });
}

function addFly(type, from, to, onDone) {
  flies.push({ type, from: { ...from }, to: { ...to }, t: 0, duration: gameConfig.transfers.flySeconds, onDone });
}

function addBurst(x, y, color, count = 10) {
  const config = gameConfig.particles;
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed);
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.45 + Math.random() * 0.35,
      color
    });
  }
}

function pickupResource(resource) {
  if (resource.pickupLock || availableCarrySpace() <= 0) return;
  const amount = reserveCarrySpace(resource.amount);
  if (amount <= 0) return;
  resource.pickupLock = true;
  if (amount >= resource.amount) {
    resources = resources.filter((item) => item !== resource);
  } else {
    resource.amount -= amount;
    resource.pickupLock = false;
  }
  addFly(resource.type, resource, playerHeadPoint(), () => {
    completeCarryReservation(amount);
    state.carry[resource.type] += amount;
    setMessage(`${resourceMeta[resource.type].label} stacked above your head.`);
    playSound("pickup");
  });
}

function playerHeadPoint() {
  return { x: state.player.x, y: state.player.y - 78 };
}

function transferCarry(type, amount, destination, onDone) {
  if (state.carry[type] <= 0) return false;
  const moved = Math.min(amount, state.carry[type]);
  state.carry[type] -= moved;
  addFly(type, playerHeadPoint(), destination, () => onDone(moved));
  playSound("drop");
  return true;
}

function transferStoredMealToCarry() {
  if (buildings.foodPrep.meals <= 0 || availableCarrySpace() <= 0) return;
  const amount = reserveCarrySpace(1);
  if (amount <= 0) return;
  buildings.foodPrep.meals -= 1;
  addFly("meal", dropoffs.mealPickup, playerHeadPoint(), () => {
    completeCarryReservation(amount);
    state.carry.meal += amount;
    setMessage("Meal picked up. Bring it to the dining hall window.");
    playSound("pickup");
  });
}

function updateDropoffs() {
  const p = state.player;
  const transferConfig = gameConfig.transfers;
  if (dist(p, dropoffs.wood) < transferConfig.woodDropDistance && state.carry.wood > 0) {
    transferCarry("wood", 1, dropoffs.wood, (amount) => {
      state.stored.wood += amount;
      setMessage("Wood added to the fort wood pile.");
    });
  }

  if (dist(p, dropoffs.food) < transferConfig.foodDropDistance) {
    if (state.carry.lettuce > 0) {
      transferCarry("lettuce", 1, dropoffs.food, (amount) => {
        buildings.foodPrep.raw += amount;
        setMessage("Lettuce delivered to food prep.");
      });
    } else if (state.carry.berries > 0) {
      transferCarry("berries", 1, dropoffs.food, (amount) => {
        buildings.foodPrep.raw += amount;
        setMessage("Berries delivered to food prep.");
      });
    } else if (state.carry.meat > 0) {
      transferCarry("meat", 1, dropoffs.food, (amount) => {
        buildings.foodPrep.raw += amount;
        setMessage("Meat delivered to food prep.");
      });
    }
  }

  if (dist(p, dropoffs.mealPickup) < transferConfig.mealPickupDistance && state.carry.meal === 0) {
    transferStoredMealToCarry();
  }

  if (dist(p, dropoffs.dining) < transferConfig.diningDropDistance && state.carry.meal > 0) {
    transferCarry("meal", 1, dropoffs.dining, (amount) => {
      buildings.diningHall.meals += amount;
      setMessage("Meal delivered to the dining hall serving window.");
    });
  }
}

function updateFoodPrep(dt) {
  const prep = buildings.foodPrep;
  if (prep.raw <= 0) {
    prep.processProgress = 0;
    return;
  }
  if (!pointInRect(state.player, prep, 20)) return;
  const timeNeeded = foodProcessSeconds();
  prep.processProgress += dt;
  if (prep.processProgress >= timeNeeded) {
    prep.raw -= 1;
    prep.meals += 1;
    prep.processProgress = 0;
    addBurst(dropoffs.mealPickup.x, dropoffs.mealPickup.y, resourceMeta.meal.color, 8);
    setMessage("Food processed into a meal stack.");
    playSound("cook");
  }
}

function updateDiningHall(dt) {
  const dining = buildings.diningHall;
  if (!dining) return;
  dining.servedPulse = Math.max(0, (dining.servedPulse || 0) - dt);
  if (dining.meals <= 0) {
    dining.serveProgress = 0;
    return;
  }
  const serveSeconds = Math.max(4, gameConfig.cabin.diningServeSeconds - Math.max(0, dining.level - 1) * 1.25 - specialtyCount("cook") * 0.75);
  dining.serveProgress += dt;
  if (dining.serveProgress >= serveSeconds) {
    dining.serveProgress = 0;
    dining.meals = Math.max(0, dining.meals - 1);
    dining.servedPulse = 0.9;
    const relief = gameConfig.cabin.mealHungerRelief + specialtyCount("cook") * gameConfig.cabin.cookMealReliefBonus;
    buildings.cabin.hunger = clamp(buildings.cabin.hunger - relief, 0, buildings.cabin.maxHunger);
    setMessage("The chef served a hot meal through the dining hall window.");
    playSound("cook");
  }
}

function updateFarm(dt) {
  if (!buildings.farm) return;
  const farm = buildings.farm;
  const period = farmProduceSeconds();
  farm.produceProgress += dt;
  if (farm.produceProgress >= period) {
    farm.produceProgress = 0;
    const offsetX = -54 + Math.random() * 108;
    const offsetY = -24 + Math.random() * 72;
    spawnResource("lettuce", farm.x + farm.w / 2 + offsetX, farm.y + farm.h / 2 + offsetY, 1);
    setMessage("The farm produced lettuce.");
    playSound("pickup");
  }
}

function updatePlacedFarms(dt) {
  const period = farmProduceSeconds() * 1.25;
  state.structures.filter((structure) => structure.type === "farm").forEach((farm) => {
    farm.produceProgress = (farm.produceProgress || 0) + dt;
    if (farm.produceProgress >= period) {
      farm.produceProgress = 0;
      spawnResource("lettuce", farm.x - 36 + Math.random() * 72, farm.y + 10 + Math.random() * 46, 1);
      setMessage("A placed farm produced lettuce.");
    }
  });
}

function updateFurnace(dt) {
  const furnace = buildings.furnace;
  furnace.fuel = clamp(furnace.fuel - furnaceFuelDrainPerSecond() * dt, 0, furnace.maxFuel);
  if (furnace.fuel <= 0 && buildings.cabin.meals <= 0) {
    buildings.cabin.hunger = clamp(buildings.cabin.hunger + dt * gameConfig.furnace.emptyHungerGainPerSecond, 0, buildings.cabin.maxHunger);
  }
}

function updateCabin(dt) {
  const cabin = buildings.cabin;
  if (buildings.diningHall && buildings.diningHall.meals > 0) {
    cabin.mealUseProgress = 0;
    return;
  }
  cabin.mealUseProgress = 0;
  cabin.hunger = clamp(cabin.hunger + cabinHungerGainPerSecond() * gameConfig.cabin.emptyDiningHungerMultiplier * dt, 0, cabin.maxHunger);
}

function updateTrees(dt) {
  const activeTree = trees
    .filter((tree) => tree.alive && dist(state.player, tree) < 58)
    .sort((a, b) => dist(state.player, a) - dist(state.player, b))[0] || null;
  trees.forEach((tree) => {
    if (!tree.alive) {
      tree.respawn -= dt;
      if (tree.respawn <= 0) {
        tree.alive = true;
        tree.progress = 0;
      }
      return;
    }
    if (tree !== activeTree) {
      tree.progress = Math.max(0, tree.progress - dt * gameConfig.trees.progressDecayPerSecond);
      return;
    }
    const isBush = tree.type === "berryBush";
    const chopTime = isBush ? (gameConfig.trees.berryGatherSeconds || 3) : treeChopSeconds();
    tree.progress += dt;
    tree.shake = 0.15;
    if (tree.progress >= chopTime) {
      tree.alive = false;
      tree.respawn = isBush ? (gameConfig.trees.berryRespawnSeconds || gameConfig.trees.respawnSeconds) : gameConfig.trees.respawnSeconds;
      tree.progress = 0;
      const dropType = isBush ? "berries" : "wood";
      const dropCount = isBush ? (gameConfig.trees.berryDrops || 3) : gameConfig.trees.woodDrops;
      addBurst(tree.x, tree.y, resourceMeta[dropType].color, isBush ? 10 : 16);
      for (let i = 0; i < dropCount; i += 1) {
        spawnResource(dropType, tree.x - 45 + Math.random() * 90, tree.y + 15 + Math.random() * 52, 1);
      }
      setMessage(isBush ? "The berry bush drops food. Pick berries up and bring them to food prep." : "The tree bursts into wood. Pick it up and bring it to the wood pile.");
    }
  });
}

function updateResourcePickup() {
  resources.forEach((resource) => {
    if (dist(state.player, resource) < gameConfig.transfers.pickupDistance) pickupResource(resource);
  });
}

function updateVisitor(dt) {
  if (state.wave.survivorCooldown > 0) {
    state.wave.survivorCooldown = Math.max(0, state.wave.survivorCooldown - dt);
  }

  if ((attackActive || state.wave.active) && pendingVisitor && !pendingVisitor.arrived) {
    pendingVisitor = null;
    state.visitor = null;
    survivorCheckTimer = 0;
    setMessage("The gates stay closed during the attack. Survivors wait for daylight.", 4);
    return;
  }

  const survivorBlocked = attackActive || state.wave.active || (state.wave.survivorCooldown || 0) > 0;
  if (!pendingVisitor && survivorBlocked) {
    survivorCheckTimer = 0;
  } else {
    survivorCheckTimer += dt;
  }

  if (!pendingVisitor && !survivorBlocked && state.wave.interWaveVisitorPending) {
    spawnInterWaveVisitor();
    return;
  }

  if (!pendingVisitor && !survivorBlocked && survivorCheckTimer >= gameConfig.timers.survivorCheckInterval) {
    survivorCheckTimer = 0;
    if (Math.random() < gameConfig.timers.survivorChance) {
      pendingVisitor = createVisitor();
      state.visitor = pendingVisitor;
      setMessage(`${pendingVisitor.name} is approaching the fort entrance.`);
    }
  }
  if (!pendingVisitor) return;
  const target = fort.entrance;
  if (!moveActor(pendingVisitor, target, gameConfig.movement.visitorSpeed, dt)) return;
  if (!pendingVisitor.arrived) {
    pendingVisitor.arrived = true;
    openVisitorModal(pendingVisitor);
  }
}

function createVisitor() {
  const specialty = randomChoice(specialtyCatalog);
  return {
    id: `${specialty.id}-${Date.now()}`,
    name: randomChoice(specialty.names),
    specialty: specialty.id,
    title: specialty.title,
    bonus: specialty.bonus,
    level: randomResidentLevel(),
    clothes: randomClothingId(),
    outfit: randomOutfit(),
    health: gameConfig.characters.visitorHealth,
    maxHealth: gameConfig.characters.visitorHealth,
    x: fort.entrance.x + (-90 + Math.random() * 180),
    y: fort.entrance.y + 295,
    facing: 1,
    direction: "up",
    walkTime: 0,
    arrived: false
  };
}

function startRecruitment(visitor) {
  pendingRecruit = visitor;
  activeTask = selectLearningTask(1 + Math.floor(state.survivors.length / 2));
  activeTaskContext = { kind: "recruit" };
  renderLearningTask(activeTask, activeTaskContext);
}

function completeRecruitment() {
  if (!pendingRecruit) return;
  activeTask = null;
  activeTaskContext = null;
  if (state.survivors.length < survivorCapacity()) {
    const willReachThree = state.survivors.length === 2 && !state.tutorialFlags.cabinUpgrade;
    state.survivors.push(normalizeSurvivor(pendingRecruit, state.survivors.length));
    finishVisitor(`${pendingRecruit.name} joined the camp as a level ${pendingRecruit.level} ${pendingRecruit.title}.`);
    if (willReachThree) window.setTimeout(maybeShowCabinUpgradeTip, 80);
    return;
  }
  replacementRecruit = pendingRecruit;
  renderReplacementMenu(replacementRecruit);
}

function survivorCapacity() {
  const extraCabins = state.structures.filter((structure) => structure.type === "cabin").length;
  return 3 + Math.max(0, buildings.cabin.level - 1) + extraCabins * 3;
}

function finishVisitor(message) {
  setMessage(message, 4);
  pendingVisitor = null;
  pendingRecruit = null;
  replacementRecruit = null;
  activeTask = null;
  activeTaskContext = null;
  state.visitor = null;
  closeModal();
  saveState();
}

function moveActor(actor, target, speed, dt) {
  const finalGap = dist(actor, target);
  if (!actor.pathNudge && finalGap <= gameConfig.residents.workDistance) {
    actor.stuckTimer = 0;
    return true;
  }
  if (actor.pathNudge && (dist(actor, actor.pathNudge) <= gameConfig.residents.workDistance || pointBlockedByBarriers(actor.pathNudge, true))) {
    actor.pathNudge = null;
  }
  const routeTarget = actor.pathNudge || target;
  const dx = routeTarget.x - actor.x;
  const dy = routeTarget.y - actor.y;
  const gap = Math.hypot(dx, dy);
  if (gap <= gameConfig.residents.workDistance) {
    actor.pathNudge = null;
    return false;
  }
  const before = dist(actor, target);
  const step = Math.min(gap, speed * dt);
  const mx = (dx / gap) * step;
  const my = (dy / gap) * step;
  const next = { x: actor.x + mx, y: actor.y + my };
  if (pointBlockedByBarriers(next, true)) {
    const gate = nearestGate(actor, target);
    const gatePoint = gateTransitPoint(actor, target, gate);
    if (gatePoint && dist(actor, gatePoint) > gameConfig.residents.workDistance * 0.55) {
      actor.pathNudge = gatePoint;
      updateActorStuckState(actor, target, before, false, dt);
      return false;
    }
    updateActorStuckState(actor, target, before, false, dt);
    return false;
  }
  actor.x += mx;
  actor.y += my;
  actor.walkTime = (actor.walkTime || 0) + Math.hypot(mx, my) / gameConfig.movement.walkAnimationDivisor;
  setActorDirection(actor, mx, my);
  updateActorStuckState(actor, target, before, true, dt);
  return false;
}

function updateActorStuckState(actor, target, before, moved, dt) {
  const after = dist(actor, target);
  const improved = before - after > 0.4;
  if (!moved || (!improved && after > gameConfig.residents.workDistance * 2)) {
    actor.stuckTimer = (actor.stuckTimer || 0) + dt;
  } else {
    actor.stuckTimer = Math.max(0, (actor.stuckTimer || 0) - dt * 2);
  }
  if (actor.stuckTimer < (gameConfig.residents.stuckSeconds || 1.15)) return;
  const waypoint = escapeWaypoint(actor, target);
  if (waypoint) actor.pathNudge = waypoint;
  actor.stuckTimer = 0;
}

function escapeWaypoint(actor, target) {
  const gate = nearestGate(actor, target);
  const gatePoint = gateTransitPoint(actor, target, gate);
  if (gatePoint && dist(actor, gatePoint) > gameConfig.residents.workDistance * 0.55) return gatePoint;
  const distance = gameConfig.residents.stuckNudgeDistance || gridSize();
  const dx = target.x - actor.x;
  const dy = target.y - actor.y;
  const gap = Math.hypot(dx, dy) || 1;
  const forward = { x: dx / gap, y: dy / gap };
  const directions = [
    { x: -forward.y, y: forward.x },
    { x: forward.y, y: -forward.x },
    { x: forward.x - forward.y, y: forward.y + forward.x },
    { x: forward.x + forward.y, y: forward.y - forward.x },
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ];
  return directions
    .map((direction) => {
      const length = Math.hypot(direction.x, direction.y) || 1;
      return {
        x: clamp(actor.x + (direction.x / length) * distance, 120, world.width - 120),
        y: clamp(actor.y + (direction.y / length) * distance, 90, world.height - 70)
      };
    })
    .filter((point) => !pointBlockedByBarriers(point, true))
    .sort((a, b) => dist(a, target) - dist(b, target))[0] || null;
}

function nearestAliveTree(from) {
  return trees
    .filter((tree) => tree.alive && tree.type !== "berryBush")
    .sort((a, b) => dist(from, a) - dist(from, b))[0] || { x: fort.x - 150, y: fort.entrance.y - 110 };
}

function upgradeJobTarget(job) {
  if (!job) return buildingCenter(buildings.cabin);
  if (job.kind === "fort") return fort.attackPoint;
  return buildingCenter(buildings[job.id] || buildings.cabin);
}

function updateResidents(dt) {
  state.survivors = state.survivors.map((survivor, index) => normalizeSurvivor(survivor, index)).filter((survivor) => survivor.health > 0);
  state.survivors.forEach((survivor, index) => {
    const speed = residentMoveSpeed(survivor);
    const station = stationForResident(survivor.id);
    if (station) {
      moveActor(survivor, station, speed, dt);
    } else if (survivor.specialty === "lumberjack") updateLumberjack(survivor, dt);
    else if (survivor.specialty === "farmer") updateFarmer(survivor, dt);
    else if (survivor.specialty === "cook") updateCook(survivor, dt);
    else if (survivor.specialty === "engineer") updateEngineer(survivor, dt);
    else if (survivor.specialty === "hunter") updateResidentArcher(survivor, dt, hunterDefaultPost(), residentCooldown(survivor, gameConfig.residents.hunterArrowCooldown), gameConfig.residents.hunterArrowDamage);
    else if (survivor.specialty === "guard") updateGuard(survivor, dt);
    else moveActor(survivor, survivorPosition(index), speed, dt);
  });
}

function stationForResident(residentId) {
  if (state.towerStationedResidentId === residentId && buildings.tower) return buildingCenter(buildings.tower);
  const structure = state.structures.find((item) => item.stationedResidentId === residentId);
  return structure ? { x: structure.x, y: structure.y } : null;
}

function hunterDefaultPost() {
  const tower = state.structures.find((structure) => isTowerType(structure.type));
  return tower ? { x: tower.x, y: tower.y, w: 36, h: 36 } : { x: fort.entrance.x - 96, y: fort.entrance.y - 24, w: 36, h: 36 };
}

function updateLumberjack(survivor, dt) {
  const speed = residentMoveSpeed(survivor);
  if (survivor.carrying === "wood") {
    if (moveActor(survivor, dropoffs.wood, speed, dt)) {
      state.stored.wood += survivor.carryAmount || lumberjackCarryAmount(survivor);
      survivor.carrying = null;
      survivor.carryAmount = 0;
      survivor.workTimer = 0;
      playSound("drop");
    }
    return;
  }
  const tree = nearestAliveTree(survivor);
  if (moveActor(survivor, tree, speed, dt)) {
    survivor.workTimer += dt;
    tree.shake = 0.15;
    if (survivor.workTimer >= residentWorkSeconds(survivor, gameConfig.residents.lumberjackWorkSeconds)) {
      survivor.workTimer = 0;
      survivor.carrying = "wood";
      survivor.carryAmount = lumberjackCarryAmount(survivor);
      addBurst(tree.x, tree.y, resourceMeta.wood.color, 5);
      playSound("pickup");
    }
  }
}

function updateFarmer(survivor, dt) {
  const speed = residentMoveSpeed(survivor);
  if (survivor.carrying === "lettuce") {
    if (moveActor(survivor, dropoffs.food, speed, dt)) {
      buildings.foodPrep.raw += gameConfig.residents.farmerFoodAmount;
      survivor.carrying = null;
      survivor.workTimer = 0;
      playSound("drop");
    }
    return;
  }
  const placedFarm = state.structures.find((structure) => structure.type === "farm");
  const target = placedFarm ? { x: placedFarm.x, y: placedFarm.y } : { x: fort.x - 140, y: fort.y + fort.h + 180 };
  if (moveActor(survivor, target, speed, dt)) {
    survivor.workTimer += dt;
    if (survivor.workTimer >= residentWorkSeconds(survivor, gameConfig.residents.farmerWorkSeconds)) {
      survivor.workTimer = 0;
      survivor.carrying = "lettuce";
      playSound("pickup");
    }
  }
}

function updateCook(survivor, dt) {
  const prep = buildings.foodPrep;
  const speed = residentMoveSpeed(survivor);
  const cookSeconds = residentWorkSeconds(survivor, foodProcessSeconds() * gameConfig.residents.cookWorkSecondsMultiplier);
  if (moveActor(survivor, buildingCenter(prep), speed, dt) || pointInRect(survivor, prep, 24)) {
    if (prep.raw <= 0) return;
    survivor.workTimer += dt;
    prep.processProgress = Math.max(prep.processProgress, (survivor.workTimer / cookSeconds) * foodProcessSeconds());
    if (survivor.workTimer >= cookSeconds) {
      survivor.workTimer = 0;
      prep.raw -= 1;
      prep.meals += 1;
      addBurst(dropoffs.mealPickup.x, dropoffs.mealPickup.y, resourceMeta.meal.color, 8);
      playSound("cook");
    }
  }
}

function updateEngineer(survivor, dt) {
  const job = state.upgradeJobs[0];
  if (!job) {
    moveActor(survivor, survivorPosition(state.survivors.indexOf(survivor)), residentMoveSpeed(survivor), dt);
    return;
  }
  const target = upgradeJobTarget(job);
  const offset = {
    x: target.x + Math.sin(performance.now() / 700 + survivor.id.length) * 46,
    y: target.y + Math.cos(performance.now() / 800 + survivor.id.length) * 32
  };
  if (moveActor(survivor, offset, residentMoveSpeed(survivor), dt)) {
    job.remaining = Math.max(0, job.remaining - gameConfig.residents.engineerBuildReductionPerSecond * residentLevelMultiplier(survivor) * dt);
  }
}

function updateGuard(survivor, dt) {
  const post = { x: fort.entrance.x - 96, y: fort.entrance.y - 24 };
  updateResidentArcher(survivor, dt, post, residentCooldown(survivor, gameConfig.residents.guardArrowCooldown), gameConfig.residents.guardArrowDamage);
}

function updateResidentArcher(survivor, dt, post, cooldown, damage) {
  moveActor(survivor, buildingCenter(post.w ? post : { x: post.x - 18, y: post.y - 18, w: 36, h: 36 }), residentMoveSpeed(survivor), dt);
  survivor.arrowCooldown = Math.max(0, (survivor.arrowCooldown || 0) - dt);
  if (!wolves.length || survivor.arrowCooldown > 0) return;
  const range = gameConfig.combat.towerRange;
  const targetWolf = wolves
    .filter((wolf) => dist(survivor, wolf) <= range)
    .sort((a, b) => dist(survivor, a) - dist(survivor, b))[0];
  if (!targetWolf) return;
  survivor.arrowCooldown = cooldown;
  fireArrowFrom({ x: survivor.x, y: survivor.y - 44 }, targetWolf, damage);
}

function updateOutposts(dt) {
  state.structures.filter((structure) => isTowerType(structure.type)).forEach((structure) => {
    structure.cooldown = Math.max(0, (structure.cooldown || 0) - dt);
    if (structure.cooldown <= 0) structure.cooldown = fireTowerLike(structure);
  });
}

function fireTowerLike(structure, cooldownOverride = null) {
  if (!wolves.length) return cooldownOverride || towerStats(structure).cooldown;
  const stats = towerStats(structure);
  const targetWolf = wolves
    .filter((wolf) => dist(structure, wolf) <= stats.range)
    .sort((a, b) => dist(structure, a) - dist(structure, b))[0];
  if (!targetWolf) return cooldownOverride || stats.cooldown;
  const stationed = state.survivors.find((survivor) => survivor.id === structure.stationedResidentId);
  const playerInTower = dist(state.player, structure) < 60;
  let multiplier = 1;
  if (stationed) multiplier *= stationed.specialty === "hunter" ? gameConfig.towers.hunterMultiplier : gameConfig.towers.stationedMultiplier;
  if (playerInTower) multiplier *= gameConfig.towers.playerMultiplier;
  fireArrowFrom({ x: structure.x, y: structure.y - 58 }, targetWolf, stats.damage * multiplier);
  return cooldownOverride || stats.cooldown;
}

function towerSlowMultiplier(wolf) {
  let slow = 1;
  state.structures.filter((structure) => isTowerType(structure.type)).forEach((structure) => {
    const stats = towerStats(structure);
    if (stats.slow < slow && dist(wolf, structure) <= stats.range) slow = stats.slow;
  });
  return slow;
}

function nearestFenceTarget(wolf) {
  const liveFences = state.structures.filter((structure) => isBarrierType(structure.type) && structure.health > 0);
  if (!liveFences.length) return fort.attackPoint;
  return liveFences.sort((a, b) => dist(wolf, a) - dist(wolf, b))[0];
}

function livingPeople(includePlayer = true) {
  const people = state.survivors.filter((survivor) => survivor.health > 0);
  if (includePlayer && state.player.health > 0) people.push(state.player);
  return people;
}

function nearestPersonTarget(enemy, includePlayer = true, preferResidents = false) {
  let people = livingPeople(includePlayer);
  if (preferResidents) {
    const residents = people.filter((person) => person !== state.player);
    if (residents.length) people = residents;
  }
  const actor = people.sort((a, b) => dist(enemy, a) - dist(enemy, b))[0];
  return actor ? { kind: "person", actor, x: actor.x, y: actor.y, distance: dist(enemy, actor) } : null;
}

function enemyTarget(enemy) {
  if (enemy.type === "eagle") {
    return nearestPersonTarget(enemy, true, true) || { kind: "fort", x: fort.attackPoint.x, y: fort.attackPoint.y };
  }
  const gate = nearestGate(enemy) || nearestFenceTarget(enemy);
  const directFence = directFenceOnPath(enemy, gate);
  const gateDistance = dist(enemy, gate);
  if (directFence) {
    const destroyTime = (directFence.health / Math.max(1, enemy.damage)) * (enemy.attackSeconds || gameConfig.combat.wolfAttackSeconds);
    const moveTime = gateDistance / Math.max(1, enemy.speed);
    if (destroyTime < moveTime) {
      return { kind: "barrier", structure: directFence, x: directFence.x, y: directFence.y, distance: dist(enemy, directFence) };
    }
  }
  const barrierTarget = isBarrierType(gate.type) ? { kind: "barrier", structure: gate, x: gate.x, y: gate.y, distance: gateDistance } : { kind: "fort", x: fort.attackPoint.x, y: fort.attackPoint.y, distance: dist(enemy, fort.attackPoint) };
  const person = nearestPersonTarget(enemy, true);
  if (person && person.distance + 18 < barrierTarget.distance) return person;
  return barrierTarget;
}

function directFenceOnPath(enemy, gate) {
  if (!gate) return null;
  return state.structures
    .filter((structure) => structure.type === "fence" && structure.health > 0)
    .map((structure) => {
      const pathDistance = distanceToSegment(structure, enemy, gate);
      return { structure, pathDistance, enemyDistance: dist(enemy, structure) };
    })
    .filter((item) => item.pathDistance < gridSize() * 0.42)
    .sort((a, b) => a.enemyDistance - b.enemyDistance)[0]?.structure || null;
}

function damageFence(target, damage) {
  if (!target || !isBarrierType(target.type)) {
    fort.health = clamp(fort.health - damage, 0, fort.maxHealth);
    return;
  }
  target.health = clamp(target.health - damage, 0, target.maxHealth);
  if (target.type === "gate") syncFortHealthFromGates();
}

function damageActor(actor, damage) {
  actor.health = clamp(actor.health - damage, 0, actor.maxHealth);
  addBurst(actor.x, actor.y - 32, "#ff5d66", 7);
  if (actor !== state.player && actor.health <= 0) {
    removeResident(actor);
  } else if (actor === state.player && actor.health <= 0) {
    actor.health = actor.maxHealth * 0.35;
    actor.target = null;
    actor.x = buildings.cabin.x + buildings.cabin.w / 2;
    actor.y = buildings.cabin.y + buildings.cabin.h + 70;
    setMessage("You were knocked back to the cabin and patched up.", 5);
  }
}

function removeResident(resident) {
  if (!resident || !resident.id) return;
  if (resident.carrying && resourceMeta[resident.carrying]) {
    spawnResource(resident.carrying, resident.x, resident.y, resident.carryAmount || 1);
  }
  state.survivors = state.survivors.filter((survivor) => survivor.id !== resident.id);
  if (state.towerStationedResidentId === resident.id) state.towerStationedResidentId = null;
  state.structures.forEach((structure) => {
    if (structure.stationedResidentId === resident.id) structure.stationedResidentId = null;
  });
  residentDeathNotices.push({
    id: `${resident.id}-${Date.now()}`,
    text: `${resident.name} died. A cabin slot is open.`,
    timer: 12
  });
  setMessage(`${resident.name} died defending the camp. A cabin slot opened.`, 7);
  showCenterMessage(`${resident.name} died.`, 2.4);
  playSound("fail");
  saveState();
}

function damageEnemyTarget(target, damage, enemy) {
  if (target.kind === "person") {
    damageActor(target.actor, damage);
    setMessage(enemy.type === "eagle" ? "An eagle is attacking the crew." : "A wolf lunges at someone outside the wall.", 4);
    return;
  }
  if (target.kind === "barrier") {
    damageFence(target.structure, damage);
    setMessage(target.structure.type === "fence" ? "Enemies are tearing through a fence segment." : "Enemies are battering the gate.", 4);
    return;
  }
  damageFence(null, damage);
  setMessage("Enemies are inside the fort.", 4);
}

function updateWolves(dt) {
  updateNightCycle(dt);
  const wasUnderAttack = attackActive;
  attackActive = wolves.length > 0;

  wolves.forEach((wolf) => {
    const target = enemyTarget(wolf);
    const gap = dist(wolf, target);
    const attackRange = wolf.type === "eagle" ? 34 : 18;
    if (gap > attackRange) {
      const slow = wolf.type === "eagle" ? 1 : towerSlowMultiplier(wolf);
      const step = wolf.speed * slow * dt;
      const next = {
        x: wolf.x + ((target.x - wolf.x) / gap) * step,
        y: wolf.y + ((target.y - wolf.y) / gap) * step
      };
      if (wolf.type !== "eagle" && pointBlockedByBarriers(next, false) && target.kind !== "barrier") {
        const barrier = nearestFenceTarget(wolf);
        const barrierGap = dist(wolf, barrier);
        if (barrierGap > 1) {
          wolf.x += ((barrier.x - wolf.x) / barrierGap) * step;
          wolf.y += ((barrier.y - wolf.y) / barrierGap) * step;
        }
      } else {
        wolf.x = next.x;
        wolf.y = next.y;
      }
      wolf.walkTime = (wolf.walkTime || 0) + step / gameConfig.movement.walkAnimationDivisor;
      if (target.x !== wolf.x) wolf.facing = target.x > wolf.x ? 1 : -1;
      setActorDirection(wolf, target.x - wolf.x, target.y - wolf.y);
    } else {
      wolf.attackTimer -= dt;
      if (wolf.attackTimer <= 0) {
        wolf.attackTimer = wolf.attackSeconds || gameConfig.combat.wolfAttackSeconds;
        damageEnemyTarget(target, wolf.damage, wolf);
        addBurst(target.x, target.y, "#ff5d66", 8);
        playSound("hit");
      }
    }
  });

  arrowCooldown -= dt;
  const inTower = playerNearBuiltTower();
  const range = inTower ? gameConfig.combat.towerRange : gameConfig.combat.baseRange;
  const targetWolf = wolves
    .filter((wolf) => dist(state.player, wolf) <= range)
    .sort((a, b) => dist(state.player, a) - dist(state.player, b))[0];
  if (targetWolf && arrowCooldown <= 0) {
    arrowCooldown = inTower ? gameConfig.combat.towerArrowCooldown : gameConfig.combat.baseArrowCooldown;
    fireArrow(targetWolf);
  }

  wolves = wolves.filter((wolf) => {
    if (wolf.hp > 0) return true;
    const hunterBonus = specialtyCount("hunter");
    const meatAmount = wolf.type === "eagle" ? 1 : 1 + hunterBonus;
    for (let i = 0; i < meatAmount; i += 1) {
      spawnResource("meat", wolf.x - 22 + Math.random() * 44, wolf.y - 12 + Math.random() * 34, 1);
    }
    addBurst(wolf.x, wolf.y, resourceMeta.meat.color, 12);
    setMessage(`${wolf.type === "eagle" ? "An eagle" : "A wolf"} dropped ${meatAmount} meat.`);
    playSound("success");
    return false;
  });
  if (!wolves.length && wasUnderAttack) {
    attackActive = false;
    survivorCheckTimer = 0;
  }
}

function updateNightCycle(dt) {
  state.wave = normalizeNightCycleState(state.wave);
  state.wave.timer -= dt;
  if (state.wave.active) {
    state.wave.spawnTimer -= dt;
    if (state.wave.spawnTimer <= 0) {
      spawnNightAttacker();
      state.wave.spawnTimer = randomNightSpawnDelay();
    }
    if (state.wave.timer <= 0) endNight();
    return;
  }
  if (state.wave.timer <= 0) startNight();
}

function startNight() {
  state.wave.number = (state.wave.number || 0) + 1;
  state.wave.active = true;
  state.wave.timer = nightDuration();
  state.wave.spawnTimer = randomNightSpawnDelay(true);
  state.wave.nightSpawned = 0;
  state.wave.interWaveVisitorPending = false;
  setMessage(`Night ${state.wave.number} has fallen. Attackers may come from the dark until dawn.`, 6);
  playSound("alarm");
}

function endNight() {
  const attackersRemaining = wolves.length;
  wolves = [];
  attackActive = false;
  state.wave.active = false;
  state.wave.timer = dayDuration();
  state.wave.spawnTimer = 0;
  state.wave.survivorCooldown = gameConfig.timers.postWaveSurvivorCooldown || 60;
  state.wave.interWaveVisitorPending = true;
  survivorCheckTimer = 0;
  setMessage(attackersRemaining ? "Dawn breaks. The remaining attackers scatter into the snow." : "Dawn breaks. Repair, gather, and prepare before night returns.", 6);
  maybeShowNightUpgradeTip();
  maybeShowTowerInstruction();
}

function maybeShowNightUpgradeTip() {
  if (state.wave.number === 1) {
    showTutorialTip(
      "furnaceUpgrade",
      "Upgrade The Furnace",
      "The first night is over. Upgrade the Furnace to increase fuel capacity and slow fuel drain so the camp survives longer between wood runs.",
      [{ label: "Open Furnace", action: () => openBuildingMenu(buildings.furnace) }]
    );
  } else if (state.wave.number === 2) {
    showTutorialTip(
      "foodUpgrade",
      "Upgrade Food Systems",
      "Food Prep cooks raw food into meals, and the Dining Hall serves those meals to hold hunger down. Upgrading both makes the camp much steadier during longer nights.",
      [{ label: "Open Food Prep", action: () => openBuildingMenu(buildings.foodPrep) }]
    );
  }
}

function maybeShowCabinUpgradeTip() {
  showTutorialTip(
    "cabinUpgrade",
    "Upgrade The Cabin",
    "The cabin is full. Upgrade the Group Cabin to add more resident space before the next survivor reaches the gate.",
    [{ label: "Open Cabin", action: () => openBuildingMenu(buildings.cabin) }]
  );
}

function maybeShowTowerInstruction() {
  if (state.towerInstructionShown || state.wave.number < 2) return;
  state.towerInstructionShown = true;
  setMessage("Build tip: open Build and place an Outpost. Towers fire on their own, and stationing residents makes them stronger.", 10);
  saveState();
}

function spawnInterWaveVisitor() {
  if (pendingVisitor || state.visitor || attackActive || state.wave.active || (state.wave.survivorCooldown || 0) > 0) return;
  pendingVisitor = createVisitor();
  state.visitor = pendingVisitor;
  state.wave.interWaveVisitorPending = false;
  survivorCheckTimer = 0;
  setMessage(`${pendingVisitor.name} reached the fort during daylight.`, 6);
}

function spawnEnemyPoint(type) {
  const margin = type === "eagle" ? 120 : 90;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const side = Math.floor(Math.random() * 4);
    const point = side === 0
      ? { x: Math.random() * world.width, y: margin }
      : side === 1
        ? { x: world.width - margin, y: Math.random() * world.height }
        : side === 2
          ? { x: Math.random() * world.width, y: world.height - margin }
          : { x: margin, y: Math.random() * world.height };
    if (pointInRect(point, fort, 80)) continue;
    if (type !== "eagle" && pointBlockedByBarriers(point, false)) continue;
    if (isPointInsideBarrierLoop(point)) continue;
    return point;
  }
  return { x: fort.entrance.x - 260 + Math.random() * 520, y: world.height - 140 };
}

function isPointInsideBarrierLoop(point) {
  const segments = state.structures
    .filter((structure) => isBarrierType(structure.type) && structure.health > 0)
    .flatMap((structure) => barrierSegments(structure));
  let crossings = 0;
  segments.forEach((segment) => {
    const ax = segment.a.x;
    const ay = segment.a.y;
    const bx = segment.b.x;
    const by = segment.b.y;
    if (Math.abs(ax - bx) > 1) return;
    const minY = Math.min(ay, by);
    const maxY = Math.max(ay, by);
    if (point.y <= minY || point.y > maxY || ax <= point.x) return;
    crossings += 1;
  });
  return crossings % 2 === 1;
}

function spawnNightAttacker() {
  const config = gameConfig.combat;
  state.wave.nightSpawned = (state.wave.nightSpawned || 0) + 1;
  const tier = Math.floor((state.wave.number - 1) / 2);
  const count = 1 + (Math.random() < Math.min(0.45, 0.12 + tier * 0.08) ? 1 : 0);
  for (let i = 0; i < count; i += 1) {
    const elite = state.wave.number >= 4 && Math.random() < 0.22;
    const hp = config.wolfBaseHp + tier * config.waveHpPerTier + Math.random() * config.wolfBonusHp + (elite ? 60 : 0);
    const spawn = spawnEnemyPoint("wolf");
    wolves.push({
      type: "wolf",
      x: spawn.x,
      y: spawn.y,
      hp,
      maxHp: hp,
      speed: config.wolfMinSpeed + tier * config.waveSpeedPerTier + Math.random() * (config.wolfMaxSpeed - config.wolfMinSpeed) + (elite ? -10 : 0),
      damage: (config.wolfDamage + tier * config.waveDamagePerTier + (elite ? 3 : 0)) * (config.groundDamageMultiplier || 4),
      attackSeconds: config.wolfAttackSeconds,
      attackTimer: config.wolfAttackSeconds + Math.random() * config.wolfAttackRandomDelay,
      walkTime: Math.random() * 4,
      facing: 1
    });
  }
  const eagleCount = state.wave.number >= config.eagleStartWave && Math.random() < Math.min(0.5, 0.18 + tier * 0.08)
    ? 1 + (tier >= 2 && Math.random() < 0.25 ? 1 : 0)
    : 0;
  for (let i = 0; i < eagleCount; i += 1) {
    const hp = config.eagleBaseHp + tier * 14 + Math.random() * 20;
    const spawn = spawnEnemyPoint("eagle");
    wolves.push({
      type: "eagle",
      x: spawn.x,
      y: spawn.y,
      hp,
      maxHp: hp,
      speed: config.eagleSpeed + tier * 5,
      damage: config.eagleDamage + tier,
      attackSeconds: config.eagleAttackSeconds,
      attackTimer: config.eagleAttackSeconds * (0.7 + Math.random() * 0.5),
      walkTime: Math.random() * 4,
      facing: 1
    });
  }
  attackActive = true;
  setMessage(`Night attack. Ground enemies hit walls, eagles dive over them.`, 5);
  playSound("alarm");
}

function fireArrow(wolf) {
  const config = gameConfig.combat;
  const towerBonus = playerNearBuiltTower() ? config.towerDamageMultiplier : 1;
  const guardBonus = 1 + specialtyCount("guard") * config.guardDamageMultiplier;
  const towerLevel = nearestBuiltTowerLevel(state.player);
  const damage = (config.baseArrowDamage + towerLevel * config.towerLevelDamage + playerStatBonus("attack") * config.playerAttackDamage) * towerBonus * guardBonus;
  fireArrowFrom({ x: state.player.x, y: state.player.y - 50 }, wolf, damage);
}

function playerNearBuiltTower() {
  return state.structures.some((structure) => isTowerType(structure.type) && dist(state.player, structure) < 72);
}

function nearestBuiltTowerLevel(point) {
  const tower = state.structures
    .filter((structure) => isTowerType(structure.type))
    .sort((a, b) => dist(point, a) - dist(point, b))[0];
  return tower ? tower.level : 0;
}

function fireArrowFrom(from, wolf, damage) {
  wolf.hp -= damage;
  arrows.push({
    from,
    to: { x: wolf.x, y: wolf.y - 20 },
    t: 0,
    duration: gameConfig.combat.arrowSeconds
  });
  playSound("arrow");
}

function updateArrows(dt) {
  arrows.forEach((arrow) => {
    arrow.t += dt / arrow.duration;
  });
  arrows = arrows.filter((arrow) => arrow.t < 1);
}

function updateFlies(dt) {
  flies.forEach((fly) => {
    fly.t += dt / fly.duration;
    if (fly.t >= 1 && fly.onDone) {
      const done = fly.onDone;
      fly.onDone = null;
      done();
    }
  });
  flies = flies.filter((fly) => fly.t < 1);
}

function updateParticles(dt) {
  particles.forEach((particle) => {
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += gameConfig.particles.gravity * dt;
  });
  particles = particles.filter((particle) => particle.life > 0);
}

function updatePlayer(dt) {
  if (modalOpen) return;
  const inputX = heldMove.x + (keys.has("arrowright") || keys.has("d") ? 1 : 0) - (keys.has("arrowleft") || keys.has("a") ? 1 : 0);
  const inputY = heldMove.y + (keys.has("arrowdown") || keys.has("s") ? 1 : 0) - (keys.has("arrowup") || keys.has("w") ? 1 : 0);
  if (inputX || inputY) {
    const length = Math.hypot(inputX, inputY);
    movePlayer((inputX / length) * gameConfig.movement.playerSpeed * dt, (inputY / length) * gameConfig.movement.playerSpeed * dt);
    state.player.target = null;
    return;
  }
  if (state.player.target) {
    const dx = state.player.target.x - state.player.x;
    const dy = state.player.target.y - state.player.y;
    const gap = Math.hypot(dx, dy);
    if (gap < gameConfig.movement.clickStopDistance) {
      state.player.target = null;
    } else {
      movePlayer((dx / gap) * gameConfig.movement.playerSpeed * dt, (dy / gap) * gameConfig.movement.playerSpeed * dt);
    }
  }
}

function movePlayer(dx, dy) {
  const next = {
    x: clamp(state.player.x + dx, 120, world.width - 120),
    y: clamp(state.player.y + dy, 90, world.height - 70)
  };
  if (pointBlockedByBarriers(next, true)) {
    const gate = state.player.target ? nearestGate(state.player, state.player.target) : null;
    if (gate && dist(state.player, gate) > gameConfig.residents.workDistance) {
      const gap = dist(state.player, gate);
      const step = Math.hypot(dx, dy);
      const routedNext = {
        x: clamp(state.player.x + ((gate.x - state.player.x) / gap) * step, 120, world.width - 120),
        y: clamp(state.player.y + ((gate.y - state.player.y) / gap) * step, 90, world.height - 70)
      };
      if (!pointBlockedByBarriers(routedNext, true)) {
        state.player.x = routedNext.x;
        state.player.y = routedNext.y;
        state.player.walkTime += step / gameConfig.movement.walkAnimationDivisor;
        setActorDirection(state.player, gate.x - state.player.x, gate.y - state.player.y);
      }
      return;
    }
    return;
  }
  state.player.x = next.x;
  state.player.y = next.y;
  state.player.walkTime += Math.hypot(dx, dy) / gameConfig.movement.walkAnimationDivisor;
  setActorDirection(state.player, dx, dy);
}

function pointBlockedByBarriers(point, friendly) {
  const radius = friendly ? 18 : 22;
  if (friendly && nearGatePassage(point)) return false;
  return state.structures.some((structure) => {
    if (!isBarrierType(structure.type) || structure.health <= 0) return false;
    if (friendly && structure.type === "gate") return false;
    if (Math.hypot(point.x - structure.x, point.y - structure.y) <= radius + 8) return true;
    return barrierSegments(structure).some((segment) => distanceToSegment(point, segment.a, segment.b) <= radius);
  });
}

function nearGatePassage(point) {
  const gate = nearestGate(point);
  if (!gate) return false;
  const size = gridSize();
  const axis = gateAxis(gate);
  const dx = Math.abs(point.x - gate.x);
  const dy = Math.abs(point.y - gate.y);
  const aligned = axis === "horizontal"
    ? dx <= size * 1.08 && dy <= size * 0.92
    : dy <= size * 1.08 && dx <= size * 0.92;
  if (!aligned) return false;
  const tooCloseToFence = state.structures.some((structure) => {
    if (structure.type !== "fence" || structure.health <= 0) return false;
    return barrierSegments(structure).some((segment) => distanceToSegment(point, segment.a, segment.b) <= 16);
  });
  return !tooCloseToFence || dist(point, gate) <= size * 0.44;
}

function gateAxis(gate) {
  const size = gridSize();
  const pairedGate = state.structures.find((structure) => {
    if (structure.type !== "gate" || structure.health <= 0 || structure === gate) return false;
    return Math.abs(structure.x - gate.x) <= size * 1.2 && Math.abs(structure.y - gate.y) <= size * 1.2;
  });
  if (pairedGate) return Math.abs(pairedGate.x - gate.x) >= Math.abs(pairedGate.y - gate.y) ? "horizontal" : "vertical";
  const connections = barrierConnections(gate);
  return connections.e || connections.w ? "horizontal" : "vertical";
}

function gatePassagePoints(gate) {
  if (!gate) return [];
  const size = gridSize();
  const offset = size * 0.78;
  return gateAxis(gate) === "horizontal"
    ? [{ x: gate.x, y: gate.y - offset }, { x: gate.x, y: gate.y + offset }]
    : [{ x: gate.x - offset, y: gate.y }, { x: gate.x + offset, y: gate.y }];
}

function gateTransitPoint(actor, target, gate) {
  if (!gate) return null;
  const points = gatePassagePoints(gate).filter((point) => !pointBlockedByBarriers(point, true));
  if (!points.length) return null;
  if (nearGatePassage(actor) || dist(actor, gate) <= gridSize() * 0.96) {
    return points.sort((a, b) => dist(a, target) - dist(b, target))[0];
  }
  return points.sort((a, b) => dist(a, actor) - dist(b, actor))[0];
}

function barrierSegments(structure) {
  const size = gridSize();
  const connections = barrierConnections(structure);
  const segments = [];
  if (connections.n) segments.push({ a: structure, b: { x: structure.x, y: structure.y - size / 2 } });
  if (connections.s) segments.push({ a: structure, b: { x: structure.x, y: structure.y + size / 2 } });
  if (connections.e) segments.push({ a: structure, b: { x: structure.x + size / 2, y: structure.y } });
  if (connections.w) segments.push({ a: structure, b: { x: structure.x - size / 2, y: structure.y } });
  if (!segments.length) segments.push({ a: { x: structure.x - size / 2, y: structure.y }, b: { x: structure.x + size / 2, y: structure.y } });
  return segments;
}

function distanceToSegment(point, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy || 1;
  const t = clamp(((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSq, 0, 1);
  const closest = { x: a.x + dx * t, y: a.y + dy * t };
  return dist(point, closest);
}

function nearestGate(from, to = null) {
  const gates = state.structures.filter((structure) => structure.type === "gate" && structure.health > 0);
  return gates.sort((a, b) => {
    const scoreA = dist(from, a) + (to ? dist(a, to) : 0);
    const scoreB = dist(from, b) + (to ? dist(b, to) : 0);
    return scoreA - scoreB;
  })[0] || null;
}

function updateCamera() {
  const viewW = window.innerWidth / camera.zoom;
  const viewH = window.innerHeight / camera.zoom;
  camera.x = clamp(state.player.x - viewW / 2, 0, Math.max(0, world.width - viewW));
  camera.y = clamp(state.player.y - viewH / 2, 0, Math.max(0, world.height - viewH));
}

function setActionsCollapsed(collapsed) {
  actionsCollapsed = collapsed;
  if (hud.actionsPanel) hud.actionsPanel.classList.toggle("collapsed", actionsCollapsed);
  if (hud.actionsToggle) {
    hud.actionsToggle.setAttribute("aria-expanded", String(!actionsCollapsed));
    hud.actionsToggle.textContent = actionsCollapsed ? "Menu" : "Close";
  }
}

function runHudAction(action) {
  setActionsCollapsed(true);
  action();
}

function updateHud(dt) {
  syncFortHealthFromGates();
  if (messageTimer > 0) messageTimer -= dt;
  if (centerToastTimer > 0) {
    centerToastTimer -= dt;
    if (centerToastTimer <= 0 && hud.centerToast) hud.centerToast.classList.add("hidden");
  }
  residentDeathNotices = residentDeathNotices
    .map((notice) => ({ ...notice, timer: notice.timer - dt }))
    .filter((notice) => notice.timer > 0);
  const furnace = buildings.furnace;
  const cabin = buildings.cabin;
  const fuelPct = furnace.maxFuel ? (furnace.fuel / furnace.maxFuel) * 100 : 0;
  const hungerPct = cabin.maxHunger ? (cabin.hunger / cabin.maxHunger) * 100 : 0;
  if (hud.furnaceFuelText) hud.furnaceFuelText.textContent = `${Math.round(fuelPct)}%`;
  if (hud.furnaceFuelMeter) hud.furnaceFuelMeter.style.width = `${fuelPct}%`;
  if (hud.cabinHungerText) hud.cabinHungerText.textContent = `${Math.round(hungerPct)}%`;
  if (hud.cabinHungerMeter) hud.cabinHungerMeter.style.width = `${hungerPct}%`;
  if (hud.quickWoodText) hud.quickWoodText.textContent = state.stored.wood;
  if (hud.quickDiningMealText) hud.quickDiningMealText.textContent = buildings.diningHall ? buildings.diningHall.meals : 0;
  if (hud.cycleText) hud.cycleText.textContent = cycleTimeText();
  if (hud.cycleFill) {
    hud.cycleFill.style.width = `${cyclePhaseProgress() * 100}%`;
    hud.cycleFill.closest(".cycle-hud")?.classList.toggle("night", state.wave.active);
  }
  if (hud.woodCount) hud.woodCount.textContent = state.stored.wood;
  if (hud.lettuceCount) hud.lettuceCount.textContent = buildings.foodPrep.raw;
  if (hud.meatCount) hud.meatCount.textContent = carryTotal();
  if (hud.mealCount) hud.mealCount.textContent = buildings.foodPrep.meals + (buildings.diningHall ? buildings.diningHall.meals : 0);
  if (hud.survivorCount) hud.survivorCount.textContent = `${state.survivors.length}/${survivorCapacity()}`;
  if (hud.learningPointCount) hud.learningPointCount.textContent = state.learningPoints;
  if (hud.playerLevelCount) hud.playerLevelCount.textContent = playerLevel();
  if (hud.waveCount) hud.waveCount.textContent = state.wave.active ? `Night ${state.wave.number}` : cycleTimeText();
  if (hud.buildButton) hud.buildButton.textContent = buildMode || moveMode || removeMode ? "Build Menu" : "Build";
  if (hud.pauseButton) hud.pauseButton.textContent = paused ? "Resume" : "Pause";
  if (hud.zoomResetButton) hud.zoomResetButton.textContent = `${camera.zoom.toFixed(1)}x`;
  if (hud.playerIconImage && clothingReady) hud.playerIconImage.src = actorIconDataUrl(state.player, 64);
  setActionsCollapsed(actionsCollapsed);
  if (hud.pauseLayer) hud.pauseLayer.classList.toggle("hidden", !paused);
  if (hud.buildTray) hud.buildTray.classList.toggle("collapsed", buildTrayCollapsed);
  const carriedNow = carryTotal();
  if (hud.carryText) hud.carryText.textContent = carriedNow
    ? `${Object.entries(state.carry)
      .filter(([, amount]) => amount > 0)
      .map(([type, amount]) => `${resourceMeta[type].label} ${amount}`)
      .join(", ")} (${carriedNow}/${carryCapacity()} max)`
    : `Empty (${carryCapacity()} max)`;

  if (hud.fortHealthCard) hud.fortHealthCard.classList.remove("hidden");
  const fortPct = fort.maxHealth ? (fort.health / fort.maxHealth) * 100 : 0;
  if (hud.fortHealthText) hud.fortHealthText.textContent = `${Math.round(fortPct)}%`;
  if (hud.fortHealthMeter) hud.fortHealthMeter.style.width = `${fortPct}%`;

  if (hud.phaseLabel) hud.phaseLabel.textContent = paused ? "Paused" : removeMode ? "Remove Mode" : moveMode ? "Move Buildings" : buildMode ? "Build Mode" : gameOver ? "Camp Lost" : failureLock ? "Emergency" : attackActive ? `Night ${state.wave.number}` : pendingVisitor ? "Visitor Approaching" : state.wave.active ? "Night Watch" : "Daylight Prep";
  updateNotifications();
}

function updateNotifications() {
  if (!hud.notificationStack) return;
  const notices = [];
  const upgrade = affordablePlayerUpgrade();
  if (upgrade && dismissedUpgradeNoticeAt !== state.learningPoints) {
    notices.push(`
      <article class="notice-card">
        <strong>Player Upgrade Ready</strong>
        <p>You have ${state.learningPoints} points. ${upgrade.name} costs ${upgrade.cost}.</p>
        <div class="notice-actions">
          <button class="primary" data-notice-action="open-player" type="button">Open Upgrades</button>
          <button data-notice-action="dismiss-upgrade" type="button">Dismiss</button>
        </div>
      </article>
    `);
  }

  const dangerChecks = [
    {
      id: "furnace",
      active: buildings.furnace.fuel > 0 && buildings.furnace.fuel <= buildings.furnace.maxFuel * 0.08,
      title: "Furnace Critical",
      copy: "Fuel is almost gone. Gather wood, drop it at the furnace, or upgrade the furnace so fuel lasts longer."
    },
    {
      id: "hunger",
      active: buildings.cabin.hunger < buildings.cabin.maxHunger && buildings.cabin.hunger >= buildings.cabin.maxHunger * 0.92,
      title: "Cabin Hunger Critical",
      copy: "Hunger is nearly full. Gather berries, lettuce, or meat, process food at Food Prep, then deliver meals to the Dining Hall."
    },
    {
      id: "fort",
      active: fort.health > 0 && fort.health <= fort.maxHealth * 0.08,
      title: "Fort Wall Critical",
      copy: "The gate network is close to collapse. Tap Fort Health and repair all fences and gates with wood."
    }
  ];
  dangerChecks.forEach((warning) => {
    if (warning.active && !warningState[warning.id]) {
      playSound("alarm");
      setMessage(warning.copy, 5);
    }
    warningState[warning.id] = warning.active;
    if (warning.active) {
      notices.push(`
        <article class="notice-card warning">
          <strong>${warning.title}</strong>
          <p>${warning.copy}</p>
        </article>
      `);
    }
  });

  residentDeathNotices.forEach((notice) => {
    notices.push(`
      <article class="notice-card warning">
        <strong>Resident Lost</strong>
        <p>${notice.text}</p>
      </article>
    `);
  });

  const markup = notices.join("");
  if (markup === notificationMarkup) return;
  notificationMarkup = markup;
  hud.notificationStack.innerHTML = markup;
  hud.notificationStack.querySelectorAll("[data-notice-action]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.noticeAction === "open-player") openPlayerMenu();
      if (button.dataset.noticeAction === "dismiss-upgrade") {
        dismissedUpgradeNoticeAt = state.learningPoints;
        updateNotifications();
      }
    });
  });
}

function selectHardLearningTask() {
  const config = gameConfig.failure;
  const pool = learningTasks.filter((task) => (task.grade || 0) >= config.minHardGrade || (task.minLevel || 1) >= config.minHardLevel);
  const candidates = (pool.length ? pool : learningTasks).filter((task) => !recentLearningTaskIds.includes(task.id));
  const task = randomChoice(candidates.length ? candidates : (pool.length ? pool : learningTasks));
  if (task && task.id) {
    recentLearningTaskIds.push(task.id);
    recentLearningTaskIds = recentLearningTaskIds.slice(-24);
  }
  return task;
}

function checkFailureStates() {
  if (gameOver || failureLock || activeTaskContext) return;
  if (buildings.furnace.fuel <= 0) {
    beginFailureChallenge("furnace");
  } else if (buildings.cabin.hunger >= buildings.cabin.maxHunger) {
    beginFailureChallenge("hunger");
  } else if (fort.health <= 0) {
    beginFailureChallenge("fort");
  }
}

function beginFailureChallenge(type) {
  failureLock = type;
  activeTask = selectHardLearningTask();
  activeTaskContext = { kind: "failure", failureType: type };
  const labels = {
    furnace: "The furnace has gone dark.",
    hunger: "The cabin is starving.",
    fort: "The entrance wall has fallen."
  };
  setMessage(`${labels[type]} Solve the emergency challenge to keep the camp alive.`, 6);
  playSound("alarm");
  renderLearningTask(activeTask, activeTaskContext);
}

function resolveFailureChallenge(type) {
  const config = gameConfig.failure;
  if (type === "furnace") {
    buildings.furnace.fuel = Math.max(buildings.furnace.fuel, buildings.furnace.maxFuel * (config.furnaceRestorePercent / 100));
    setMessage("Emergency answer accepted. The furnace catches again.", 6);
  } else if (type === "hunger") {
    buildings.cabin.hunger = clamp(buildings.cabin.hunger - buildings.cabin.maxHunger * (config.hungerReliefPercent / 100), 0, buildings.cabin.maxHunger);
    buildings.cabin.meals = Math.max(buildings.cabin.meals, 1);
    setMessage("Emergency answer accepted. The cabin gets enough food to hold on.", 6);
  } else if (type === "fort") {
    setGateHealthPercent(Math.max(gateHealthPercent(), config.fortRepairPercent / 100));
    setMessage("Emergency answer accepted. The entrance wall is braced.", 6);
  }
  failureLock = null;
  activeTask = null;
  activeTaskContext = null;
  playSound("success");
  saveState();
  closeModal(true);
}

function showGameOver(type) {
  gameOver = true;
  activeTask = null;
  activeTaskContext = null;
  const copy = {
    furnace: "The furnace died and the cold took the camp.",
    hunger: "The cabin ran out of food and morale collapsed.",
    fort: "The fort wall broke and the camp was overrun."
  };
  hud.modalEyebrow.textContent = "Game Over";
  hud.modalTitle.textContent = "The Frontier Claims The Camp";
  hud.modalBody.innerHTML = `
    <p>${copy[type] || "The camp could not survive the disaster."}</p>
    <p>Retry from the beginning and rebuild stronger.</p>
    <div class="modal-actions">
      <button id="retryGame" class="primary" type="button">Retry</button>
    </div>
  `;
  playSound("fail");
  openModal();
  document.querySelector("#retryGame").addEventListener("click", resetGame);
}

function resetGame() {
  localStorage.removeItem(storageKey);
  state = clone(defaultState);
  state.player = normalizePlayer({ clothes: gameConfig.characters.defaultPlayerClothes });
  buildings = hydrateBuildings();
  snapAllBuildingsToGrid();
  state.structures = createInitialDefenseStructures();
  state.wave = normalizeNightCycleState({ ...defaultState.wave, timer: dayDuration(), active: false });
  state.playerLevel = 1;
  state.towerInstructionShown = false;
  resources = [];
  trees = createTrees();
  snow = createSnow();
  wolves = [];
  arrows = [];
  flies = [];
  particles = [];
  pendingVisitor = null;
  pendingRecruit = null;
  replacementRecruit = null;
  state.visitor = null;
  activeTask = null;
  activeTaskContext = null;
  failureLock = null;
  gameOver = false;
  dismissedUpgradeNoticeAt = -1;
  notificationMarkup = "";
  warningState = { furnace: false, hunger: false, fort: false };
  pendingCarry = 0;
  residentDeathNotices = [];
  buildMode = false;
  moveMode = false;
  removeMode = false;
  selectedBuildType = null;
  buildPreview = null;
  selectedMoveTarget = null;
  movePreview = null;
  attackActive = false;
  wolfCheckTimer = 0;
  survivorCheckTimer = 0;
  arrowCooldown = 0;
  starterTowerCooldown = 0;
  saveTimer = 0;
  for (let i = 0; i < 5; i += 1) {
    spawnResource("wood", fort.x - 180 + Math.random() * 180, fort.entrance.y - 110 + Math.random() * 220, 1);
  }
  forceCloseModal();
  setMessage("A fresh camp begins. Gather wood from trees and food from berry bushes.", 7);
  saveState();
}

function update(dt) {
  saveTimer += dt;
  if (gameOver) {
    updateHud(dt);
    return;
  }
  if (activeTaskContext && activeTaskContext.kind === "failure") {
    updateHud(dt);
    return;
  }
  if (paused) {
    updateHud(dt);
    return;
  }
  updatePlayer(dt);
  updateCamera();
  updateFarm(dt);
  updatePlacedFarms(dt);
  updateFurnace(dt);
  updateDiningHall(dt);
  updateCabin(dt);
  updateFoodPrep(dt);
  updateUpgradeJobs(dt);
  updateResidents(dt);
  updateTrees(dt);
  updateResourcePickup();
  updateDropoffs();
  updateOutposts(dt);
  updateWolves(dt);
  updateVisitor(dt);
  updateArrows(dt);
  updateFlies(dt);
  updateParticles(dt);
  checkFailureStates();
  updateHud(dt);
  if (saveTimer >= gameConfig.timers.autosaveInterval) {
    saveTimer = 0;
    saveState();
  }
}

function draw() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.save();
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.x, -camera.y);
  drawWorld();
  ctx.restore();
  drawDangerAura();
}

function drawWorld() {
  drawGround();
  drawGrid();
  drawFort();
  drawStructures();
  drawFarmPlots();
  drawBuildings();
  drawFurnaceSmoke();
  drawDropoffs();
  drawFoodProcessingAnimation();
  drawDiningServiceAnimation();
  drawTrees();
  drawResources();
  drawResidents();
  drawVisitor();
  drawWolves();
  drawPlayer();
  drawArrows();
  drawFlies();
  drawParticles();
  drawBuildPreview();
  drawMovePreview();
  drawDayNightOverlay();
  drawSnow();
}

function drawGround() {
  const gradient = ctx.createLinearGradient(0, 0, 0, world.height);
  gradient.addColorStop(0, "#0b2134");
  gradient.addColorStop(0.55, "#24516a");
  gradient.addColorStop(1, "#d6f2ff");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, world.width, world.height);
}

function drawGrid() {
  const size = gridSize();
  ctx.save();
  ctx.globalAlpha = buildMode || moveMode || removeMode ? 0.34 : gameConfig.grid.alpha;
  ctx.strokeStyle = "#dff7ff";
  ctx.lineWidth = 1;
  for (let x = 0; x <= world.width; x += size) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, world.height);
    ctx.stroke();
  }
  for (let y = 0; y <= world.height; y += size) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(world.width, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawStructures() {
  state.structures.forEach((structure) => {
    if (isBarrierType(structure.type)) drawFenceSegment(structure);
    else if (structure.type === "cabin") drawPlacedCabin(structure);
    else if (structure.type === "farm") drawPlacedFarm(structure);
    else drawOutpostStructure(structure);
  });
}

function drawFenceSegment(segment) {
  const pct = clamp(segment.health / segment.maxHealth, 0, 1);
  const connections = barrierConnections(segment);
  const gateOpen = segment.type === "gate" && isGateOpen(segment);
  const level = Math.max(1, segment.level || 1);
  const theme = levelTheme(level);
  const railColor = segment.type === "gate" ? (level > 1 ? theme.accent : "#b88b54") : pct > 0.45 ? (level > 1 ? theme.trim : "#8f6e50") : "#7a4c3d";
  const postColor = segment.type === "gate" ? (level > 1 ? theme.wall : "#5b3b2e") : (level > 1 ? theme.roof : "#6b4d39");
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(segment.x, segment.y + 18, 30, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = railColor;
  ctx.lineWidth = (segment.type === "gate" ? 12 : 10) + Math.min(4, level - 1);
  ctx.lineCap = "round";
  const size = gridSize();
  Object.entries(connections).forEach(([dir, connected]) => {
    if (!connected) return;
    let endX = segment.x;
    let endY = segment.y;
    if (dir === "n") endY -= size / 2;
    if (dir === "s") endY += size / 2;
    if (dir === "e") endX += size / 2;
    if (dir === "w") endX -= size / 2;
    if (gateOpen) {
      if (dir === "e") endY -= 24;
      if (dir === "w") endY += 24;
      if (dir === "n") endX -= 24;
      if (dir === "s") endX += 24;
    }
    ctx.beginPath();
    ctx.moveTo(segment.x, segment.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  });
  if (!Object.values(connections).some(Boolean)) {
    ctx.beginPath();
    ctx.moveTo(segment.x - size / 2, segment.y);
    ctx.lineTo(segment.x + size / 2, segment.y);
    ctx.stroke();
  }
  ctx.fillStyle = postColor;
  roundRect(segment.x - 9, segment.y - 24, 18, 48, 5);
  if (level > 1) {
    ctx.fillStyle = theme.accent;
    roundRect(segment.x - 13, segment.y - 30, 26, 8, 4);
    roundRect(segment.x - 13, segment.y + 22, 26, 8, 4);
  }
  if (segment.type === "gate") {
    ctx.fillStyle = gateOpen ? "#73df9b" : "#dff7ff";
    ctx.font = "900 12px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(gateOpen ? "O" : "G", segment.x, segment.y + 5);
  }
  if (level > 1) {
    ctx.fillStyle = "rgba(3, 12, 22, 0.66)";
    roundRect(segment.x - 18, segment.y + 30, 36, 18, 6);
    ctx.fillStyle = theme.accent;
    ctx.font = "900 11px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`L${level}`, segment.x, segment.y + 43);
  }
  const rect = structureRect(segment);
  if (pct < 0.98) {
    ctx.fillStyle = "rgba(3, 12, 22, 0.66)";
    roundRect(segment.x - 32, segment.y - 42, 64, 6, 4);
    ctx.fillStyle = "#ff5d66";
    roundRect(segment.x - 32, segment.y - 42, 64 * pct, 6, 4);
  }
  ctx.restore();
}

function barrierConnections(segment) {
  const size = gridSize();
  const barriers = state.structures.filter((structure) => isBarrierType(structure.type) && structure.health > 0);
  return {
    n: barriers.some((structure) => structure.x === segment.x && structure.y === segment.y - size),
    s: barriers.some((structure) => structure.x === segment.x && structure.y === segment.y + size),
    e: barriers.some((structure) => structure.x === segment.x + size && structure.y === segment.y),
    w: barriers.some((structure) => structure.x === segment.x - size && structure.y === segment.y)
  };
}

function isGateOpen(gate) {
  if (gate.type !== "gate") return false;
  const friendlyActors = [state.player, ...state.survivors.filter((survivor) => survivor.health > 0)];
  return friendlyActors.some((actor) => dist(actor, gate) < gridSize() * 0.82);
}

function drawPlacedCabin(structure) {
  const rect = structureRect(structure);
  drawSprite("cabin", rect.x - 20, rect.y - 50, rect.w + 40, rect.h + 60, { row: levelSpriteRow(structure.level) });
  drawStructureLabel(structure, "Cabin");
}

function drawPlacedFarm(structure) {
  const rect = structureRect(structure);
  drawSprite("farm", rect.x - 20, rect.y - 20, rect.w + 40, rect.h + 40, { row: levelSpriteRow(structure.level) });
  drawStructureLabel(structure, "Farm");
}

function drawOutpostStructure(structure) {
  const rect = structureRect(structure);
  const sprite = structure.type === "iceTrap" ? "furnace" : "tower";
  drawSprite(sprite, rect.x - 18, rect.y - 42, rect.w + 36, rect.h + 48, { row: levelSpriteRow(structure.level) });
  if (buildMode || structure.stationedResidentId) {
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = structure.stationedResidentId ? "#73df9b" : "#ffb35c";
    ctx.beginPath();
    ctx.arc(structure.x, structure.y, towerStats(structure).range, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  drawStructureLabel(structure, structureDisplayName(structure.type));
}

function drawStructureLabel(structure, label) {
  ctx.fillStyle = "rgba(3, 12, 22, 0.6)";
  roundRect(structure.x - 58, structure.y + 50, 116, 28, 7);
  ctx.fillStyle = "#f4f9ff";
  ctx.font = "800 12px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label, structure.x, structure.y + 68, 108);
}

function drawBuildPreview() {
  if (!buildMode || !buildPreview) return;
  const placement = canPlaceStructure(selectedBuildType, buildPreview);
  drawPlacementCells(selectedBuildType, buildPreview, placement);
  const fake = createStructure(selectedBuildType, buildPreview.x, buildPreview.y);
  ctx.save();
  ctx.globalAlpha = placement.ok ? 0.65 : 0.34;
  drawStructuresForPreview(fake);
  ctx.restore();
}

function drawMovePreview() {
  if (!moveMode || !selectedMoveTarget || !movePreview) return;
  const placement = canMoveTargetTo(selectedMoveTarget, movePreview);
  const rect = moveTargetRect(selectedMoveTarget, movePreview);
  if (!rect) return;
  drawMovePlacementCells(rect, placement);
  ctx.save();
  ctx.globalAlpha = placement.ok ? 0.42 : 0.22;
  ctx.fillStyle = placement.ok ? "#73df9b" : "#ff5d66";
  roundRect(rect.x, rect.y, rect.w, rect.h, 8);
  ctx.strokeStyle = placement.ok ? "rgba(115, 223, 155, 0.95)" : "rgba(255, 93, 102, 0.95)";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();
}

function drawMovePlacementCells(rect, placement) {
  const size = gridSize();
  const cells = [];
  const startX = Math.floor(rect.x / size) * size + size / 2;
  const endX = Math.floor((rect.x + rect.w) / size) * size + size / 2;
  const startY = Math.floor(rect.y / size) * size + size / 2;
  const endY = Math.floor((rect.y + rect.h) / size) * size + size / 2;
  for (let x = startX; x <= endX; x += size) {
    for (let y = startY; y <= endY; y += size) cells.push({ x, y });
  }
  ctx.save();
  ctx.lineWidth = 3;
  ctx.strokeStyle = placement.ok ? "rgba(115, 223, 155, 0.95)" : "rgba(255, 93, 102, 0.95)";
  ctx.fillStyle = placement.ok ? "rgba(115, 223, 155, 0.18)" : "rgba(255, 93, 102, 0.18)";
  cells.forEach((cell) => {
    roundRect(cell.x - size / 2 + 4, cell.y - size / 2 + 4, size - 8, size - 8, 8);
    ctx.stroke();
  });
  ctx.restore();
}

function drawPlacementCells(type, point, placement) {
  const size = gridSize();
  const cells = placementCells(type, point, placement);
  ctx.save();
  ctx.lineWidth = 3;
  ctx.strokeStyle = placement.ok ? "rgba(115, 223, 155, 0.95)" : "rgba(255, 93, 102, 0.95)";
  ctx.fillStyle = placement.ok ? "rgba(115, 223, 155, 0.18)" : "rgba(255, 93, 102, 0.18)";
  cells.forEach((cell) => {
    roundRect(cell.x - size / 2 + 4, cell.y - size / 2 + 4, size - 8, size - 8, 8);
    ctx.stroke();
  });
  ctx.restore();
}

function placementCells(type, point, placement) {
  const size = gridSize();
  if (type === "gate" && placement && placement.replaceIds) {
    return placement.replaceIds
      .map((id) => state.structures.find((structure) => structure.id === id))
      .filter(Boolean)
      .map((structure) => ({ x: structure.x, y: structure.y }));
  }
  if (isBarrierType(type)) return [point];
  const rect = structureRect({ type, x: point.x, y: point.y });
  const cells = [];
  const startX = Math.floor(rect.x / size) * size + size / 2;
  const endX = Math.floor((rect.x + rect.w) / size) * size + size / 2;
  const startY = Math.floor(rect.y / size) * size + size / 2;
  const endY = Math.floor((rect.y + rect.h) / size) * size + size / 2;
  for (let x = startX; x <= endX; x += size) {
    for (let y = startY; y <= endY; y += size) cells.push({ x, y });
  }
  return cells;
}

function drawStructuresForPreview(structure) {
  if (isBarrierType(structure.type)) drawFenceSegment(structure);
  else if (structure.type === "cabin") drawPlacedCabin(structure);
  else if (structure.type === "farm") drawPlacedFarm(structure);
  else drawOutpostStructure(structure);
}

function drawFort() {
  drawFortDamage();
}

function drawFortDamage() {
  if (fort.health >= fort.maxHealth) return;
  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = "#ff5d66";
  ctx.beginPath();
  ctx.ellipse(fort.entrance.x, fort.entrance.y - 12, 74, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFarmPlots() {
  if (!buildings.farm) return;
  const farm = buildings.farm;
  const theme = levelTheme(farm.level);
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(farm.x + farm.w / 2 + 10, farm.y + farm.h / 2 + 28, farm.w / 2 + 26, farm.h / 2 + 20, 0, 0, Math.PI * 2);
  ctx.fill();
  if (drawSprite("farm", farm.x - 24, farm.y - 30, farm.w + 48, farm.h + 62, { row: levelSpriteRow(farm.level) })) {
    const pct = farm.produceProgress / Math.max(1, farmProduceSeconds());
    for (let i = 0; i < Math.floor(pct * 10); i += 1) {
      drawResourceSprite("lettuce", farm.x + 25 + i * 14, farm.y + farm.h - 30, 18);
    }
    return;
  }
  ctx.fillStyle = theme.ground;
  roundRect(farm.x - 10, farm.y - 10, farm.w + 20, farm.h + 20, 8);
  ctx.fillStyle = "rgba(245, 253, 255, 0.72)";
  roundRect(farm.x - 18, farm.y - 20, farm.w + 36, 18, 8);
  ctx.strokeStyle = "#8f6e50";
  ctx.lineWidth = 6;
  for (let x = farm.x - 14; x <= farm.x + farm.w + 14; x += 36) {
    ctx.beginPath();
    ctx.moveTo(x, farm.y - 6);
    ctx.lineTo(x, farm.y + farm.h + 10);
    ctx.stroke();
  }
  for (let i = 0; i < 4; i += 1) {
    ctx.fillStyle = i % 2 ? "#3b7d4e" : "#315f42";
    roundRect(farm.x + 12, farm.y + 12 + i * 24, farm.w - 24, 14, 6);
    ctx.strokeStyle = "rgba(12, 42, 28, 0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(farm.x + 20, farm.y + 19 + i * 24);
    ctx.lineTo(farm.x + farm.w - 20, farm.y + 19 + i * 24);
    ctx.stroke();
  }
  const pct = farm.produceProgress / Math.max(1, farmProduceSeconds());
  ctx.fillStyle = "#75df76";
  for (let i = 0; i < Math.floor(pct * 12); i += 1) {
    ctx.beginPath();
    ctx.arc(farm.x + 24 + i * 13, farm.y + 95, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBuildings() {
  Object.values(buildings).forEach((building) => {
    const theme = levelTheme(building.level);
    if (building.id === "farm") {
      drawBuildingLabel(building);
      return;
    }
    const spriteName = building.id;
    const spritePad = building.id === "tower" ? 48 : 30;
    const spriteTop = building.id === "tower" ? 74 : 54;
    if (building.id === "tower") drawTowerRange(building);
    if (building.id === "furnace") drawFurnaceGlow(building);
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(building.x + building.w / 2 + 12, building.y + building.h / 2 + 48, building.w / 2 + 30, building.h / 2 + 22, 0, 0, Math.PI * 2);
    ctx.fill();
    if (drawSprite(spriteName, building.x - spritePad, building.y - spriteTop, building.w + spritePad * 2, building.h + spriteTop + 30, { row: levelSpriteRow(building.level) })) {
      ctx.fillStyle = theme.accent;
      roundRect(building.x + 12, building.y + building.h + 4, building.w - 24, 9, 5);
      ctx.fillStyle = "rgba(3, 12, 22, 0.56)";
      roundRect(building.x + building.w - 46, building.y - 34, 38, 28, 8);
      ctx.fillStyle = theme.accent;
      ctx.font = "900 15px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`L${building.level}`, building.x + building.w - 27, building.y - 14);
      drawBuildingLabel(building);
      return;
    }
    drawIsoRect(building.x, building.y, building.w, building.h, theme.wall, theme.roof, 36 + building.level * 4);
    drawBuildingTrim(building);
    drawBuildingWindows(building);
    drawBuildingLabel(building);
    if (building.id === "tower") drawTowerTop(building);
    if (building.id === "furnace") drawFurnaceGlow(building);
  });
}

function levelTheme(level) {
  const themes = [
    { wall: "#4b5a66", roof: "#1f2a38", trim: "#8fa9b8", ground: "#244e38", accent: "#b9e8ff" },
    { wall: "#5f564d", roof: "#3b2c31", trim: "#c18b5a", ground: "#315f42", accent: "#ffb35c" },
    { wall: "#4f6577", roof: "#1b4a5e", trim: "#9fe4ff", ground: "#3d7551", accent: "#67c7ff" },
    { wall: "#536f68", roof: "#245044", trim: "#7ef0b4", ground: "#44825a", accent: "#73df9b" },
    { wall: "#77623f", roof: "#4e3918", trim: "#ffd166", ground: "#5b8a55", accent: "#ffd166" }
  ];
  return themes[clamp(level - 1, 0, themes.length - 1)];
}

function drawIsoRect(x, y, w, h, wall, roof, height) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
  roundRect(x + 18, y + 38, w + 18, h, 12);
  ctx.fillStyle = wall;
  roundRect(x, y + 28, w, h - 14, 8);
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.beginPath();
  ctx.moveTo(x + w, y + 36);
  ctx.lineTo(x + w + 24, y + 20);
  ctx.lineTo(x + w + 24, y + h - 4);
  ctx.lineTo(x + w, y + h + 14);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.09)";
  roundRect(x + 8, y + 38, w - 16, 12, 5);
  ctx.fillStyle = "rgba(0,0,0,0.13)";
  roundRect(x + w - 24, y + 38, 18, h - 34, 6);
  ctx.fillStyle = roof;
  ctx.beginPath();
  ctx.moveTo(x - 24, y + 30);
  ctx.lineTo(x + w / 2, y - height);
  ctx.lineTo(x + w + 24, y + 30);
  ctx.lineTo(x + w, y + 66);
  ctx.lineTo(x + w / 2, y + 8);
  ctx.lineTo(x, y + 66);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.beginPath();
  ctx.moveTo(x, y + h + 10);
  ctx.lineTo(x + w, y + h + 10);
  ctx.lineTo(x + w - 28, y + h + 28);
  ctx.lineTo(x + 24, y + h + 28);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(245, 253, 255, 0.78)";
  ctx.beginPath();
  ctx.moveTo(x - 12, y + 28);
  ctx.lineTo(x + w / 2, y - height + 10);
  ctx.lineTo(x + w + 12, y + 28);
  ctx.lineTo(x + w + 5, y + 40);
  ctx.lineTo(x + w / 2, y - height + 24);
  ctx.lineTo(x - 5, y + 40);
  ctx.closePath();
  ctx.fill();
}

function drawBuildingTrim(building) {
  const theme = levelTheme(building.level);
  ctx.save();
  ctx.strokeStyle = theme.trim;
  ctx.lineWidth = 3;
  for (let y = building.y + 32; y < building.y + building.h - 14; y += 26) {
    ctx.beginPath();
    ctx.moveTo(building.x + 10, y);
    ctx.lineTo(building.x + building.w - 12, y);
    ctx.stroke();
  }
  if (building.id === "furnace") {
    ctx.fillStyle = "#2c2032";
    roundRect(building.x + building.w - 38, building.y - 58, 28, 64, 6);
    ctx.fillStyle = "rgba(218, 240, 255, 0.36)";
    ctx.beginPath();
    ctx.ellipse(building.x + building.w - 24, building.y - 76, 28, 12, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(building.x + building.w + 4, building.y - 106, 34, 14, -0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawBuildingWindows(building) {
  const lit = building.id === "furnace" ? buildings.furnace.fuel / buildings.furnace.maxFuel : 0.72;
  ctx.fillStyle = `rgba(255, 190, 96, ${0.25 + lit * 0.65})`;
  roundRect(building.x + 22, building.y + 46, 34, 28, 4);
  roundRect(building.x + building.w - 56, building.y + 46, 34, 28, 4);
  ctx.strokeStyle = "rgba(22, 32, 43, 0.55)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(building.x + 39, building.y + 46);
  ctx.lineTo(building.x + 39, building.y + 74);
  ctx.moveTo(building.x + building.w - 39, building.y + 46);
  ctx.lineTo(building.x + building.w - 39, building.y + 74);
  ctx.stroke();
}

function drawTowerRange(tower) {
  ctx.fillStyle = "rgba(255, 179, 92, 0.12)";
  ctx.beginPath();
  ctx.arc(tower.x + tower.w / 2, tower.y + tower.h / 2, gameConfig.combat.towerRange * 0.49, 0, Math.PI * 2);
  ctx.fill();
}

function drawTowerTop(tower) {
  ctx.fillStyle = "rgba(255, 179, 92, 0.12)";
  ctx.beginPath();
  ctx.arc(tower.x + tower.w / 2, tower.y + tower.h / 2, 185, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2b1d1b";
  roundRect(tower.x + 28, tower.y + 12, tower.w - 56, 42, 8);
  ctx.strokeStyle = "#2b1d1b";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(tower.x + 22, tower.y + tower.h - 8);
  ctx.lineTo(tower.x + 46, tower.y + 46);
  ctx.moveTo(tower.x + tower.w - 22, tower.y + tower.h - 8);
  ctx.lineTo(tower.x + tower.w - 46, tower.y + 46);
  ctx.stroke();
  ctx.fillStyle = "#ff5d66";
  ctx.beginPath();
  ctx.moveTo(tower.x + tower.w / 2 + 4, tower.y - 88);
  ctx.lineTo(tower.x + tower.w / 2 + 50, tower.y - 72);
  ctx.lineTo(tower.x + tower.w / 2 + 4, tower.y - 56);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#dff7ff";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(tower.x + tower.w / 2, tower.y - 88);
  ctx.lineTo(tower.x + tower.w / 2, tower.y + 12);
  ctx.stroke();
}

function drawFurnaceGlow(furnace) {
  const pct = furnace.fuel / furnace.maxFuel;
  const glow = ctx.createRadialGradient(furnace.x + furnace.w / 2, furnace.y + furnace.h / 2, 10, furnace.x + furnace.w / 2, furnace.y + furnace.h / 2, 170);
  glow.addColorStop(0, `rgba(255, 130, 54, ${0.35 * pct})`);
  glow.addColorStop(1, "rgba(255, 130, 54, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(furnace.x - 120, furnace.y - 120, furnace.w + 240, furnace.h + 240);
}

function drawFurnaceSmoke() {
  const furnace = buildings.furnace;
  if (furnace.fuel <= 0) return;
  const pct = clamp(furnace.fuel / furnace.maxFuel, 0, 1);
  const baseX = furnace.x + furnace.w - 3;
  const baseY = furnace.y - 80;
  const time = performance.now() / 1000;
  ctx.save();
  for (let i = 0; i < 5; i += 1) {
    const t = (time * 0.55 + i * 0.23) % 1;
    const x = baseX + Math.sin(time * 1.7 + i) * 13 + t * 32;
    const y = baseY - t * 92;
    ctx.globalAlpha = (1 - t) * (0.18 + pct * 0.34);
    ctx.fillStyle = "#dff7ff";
    ctx.beginPath();
    ctx.ellipse(x, y, 16 + t * 22, 8 + t * 13, -0.25, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawBuildingLabel(building) {
  const job = getUpgradeJob("building", building.id);
  const theme = levelTheme(building.level);
  ctx.fillStyle = "rgba(3, 12, 22, 0.56)";
  roundRect(building.x + building.w / 2 - 76, building.y + building.h + 24, 152, 43, 8);
  ctx.fillStyle = theme.accent;
  roundRect(building.x + building.w / 2 - 72, building.y + building.h + 28, 148, 6, 4);
  ctx.fillStyle = "#f4f9ff";
  ctx.font = "800 15px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${building.name} L${building.level}`, building.x + building.w / 2, building.y + building.h + 50, 140);
  if (job) {
    ctx.fillStyle = "#ffd166";
    ctx.font = "800 11px Inter, system-ui, sans-serif";
    ctx.fillText(`${Math.ceil(job.remaining)}s`, building.x + building.w / 2, building.y + building.h + 64, 140);
  }
}

function drawDropoffs() {
  drawStack(dropoffs.wood, "wood", Math.min(8, state.stored.wood), "Wood");
  drawStack(dropoffs.food, "lettuce", Math.min(6, buildings.foodPrep.raw), "Raw");
  drawStack(dropoffs.mealPickup, "meal", Math.min(6, buildings.foodPrep.meals), "Meals");
  drawStack(dropoffs.dining, "meal", Math.min(6, buildings.diningHall ? buildings.diningHall.meals : 0), "Dining");
}

function drawStack(point, type, count, label) {
  ctx.fillStyle = "rgba(3, 12, 22, 0.32)";
  ctx.beginPath();
  ctx.ellipse(point.x, point.y + 16, 42, 19, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < count; i += 1) {
    drawResourceSprite(type, point.x - 24 + (i % 4) * 16, point.y - Math.floor(i / 4) * 14, 17);
  }
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 13px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label, point.x, point.y + 46);
}

function drawResourceSprite(type, x, y, size) {
  if (drawSprite(type, x - size / 2, y - size / 2, size, size)) return;
  drawCrate(x, y, resourceMeta[type].stack || resourceMeta[type].color, size);
}

function drawFoodProcessingAnimation() {
  const prep = buildings.foodPrep;
  if (prep.raw <= 0 || prep.processProgress <= 0 || !pointInRect(state.player, prep, 20)) return;
  const cx = prep.x + prep.w / 2;
  const cy = prep.y + prep.h / 2 + 12;
  const progress = clamp(prep.processProgress / foodProcessSeconds(), 0, 1);
  const time = performance.now() / 1000;
  ctx.save();
  ctx.globalAlpha = 0.9;
  for (let i = 0; i < 5; i += 1) {
    const angle = time * 3.6 + i * 1.26;
    const radius = 32 + Math.sin(time * 5 + i) * 8;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * 12 - 30;
    drawResourceSprite(i % 2 ? "meat" : "lettuce", x, y, 18);
  }
  ctx.strokeStyle = "rgba(255, 203, 114, 0.95)";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(cx, cy - 26, 46, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.ellipse(cx - 28 + i * 28, cy - 70 - Math.sin(time * 4 + i) * 8, 9, 18, -0.15, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawDiningServiceAnimation() {
  const dining = buildings.diningHall;
  if (!dining) return;
  const cx = dining.x + dining.w / 2;
  const cy = dining.y + 64;
  const time = performance.now() / 1000;
  const serving = dining.meals > 0 || dining.servedPulse > 0;
  ctx.save();
  ctx.fillStyle = "rgba(3, 12, 22, 0.68)";
  roundRect(dining.x + 38, dining.y + 58, dining.w - 76, 34, 7);
  ctx.fillStyle = "#ffcb72";
  roundRect(dining.x + dining.w - 58, dining.y + 64, 34, 14, 5);
  ctx.fillStyle = "#dff7ff";
  ctx.font = "900 10px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("ORDER", dining.x + dining.w - 41, dining.y + 75);
  if (serving) {
    const t = (dining.serveProgress / Math.max(1, gameConfig.cabin.diningServeSeconds));
    const chefX = dining.x + 56 + Math.sin(time * 2.2) * 6;
    ctx.fillStyle = "#f4f9ff";
    ctx.beginPath();
    ctx.arc(chefX, cy - 12, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff9f43";
    roundRect(chefX - 12, cy, 24, 24, 8);
    const mealX = dining.x + 58 + clamp(t, 0, 1) * (dining.w - 104);
    drawResourceSprite("meal", mealX, dining.y + 104 - Math.sin(time * 8) * 4, 20);
    if (dining.servedPulse > 0) {
      ctx.globalAlpha = dining.servedPulse;
      ctx.fillStyle = "#73df9b";
      ctx.beginPath();
      ctx.ellipse(dining.x + dining.w - 42, dining.y + 98, 32, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawTrees() {
  trees.forEach((tree) => {
    if (!tree.alive) return;
    tree.shake = Math.max(0, tree.shake - 0.02);
    const shake = tree.shake ? Math.sin(performance.now() / 35) * 7 : 0;
    if (tree.type === "berryBush") {
      drawBerryBush(tree, shake);
      return;
    }
    ctx.save();
    ctx.translate(tree.x + shake, tree.y);
    if (drawSprite("tree", -64, -128, 128, 208)) {
      if (tree.progress > 0) {
        ctx.fillStyle = "rgba(3, 12, 22, 0.66)";
        roundRect(-42, 88, 84, 10, 5);
        ctx.fillStyle = "#ffb35c";
        roundRect(-42, 88, 84 * clamp(tree.progress / treeChopSeconds(), 0, 1), 10, 5);
      }
      ctx.restore();
      return;
    }
    ctx.fillStyle = "#4b3325";
    roundRect(-8, 16, 16, 64, 5);
    ctx.fillStyle = "#173a35";
    ctx.beginPath();
    ctx.moveTo(0, -70);
    ctx.lineTo(-56, 50);
    ctx.lineTo(56, 50);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(245, 253, 255, 0.68)";
    ctx.beginPath();
    ctx.moveTo(0, -66);
    ctx.lineTo(-34, 18);
    ctx.lineTo(22, 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#1f4d43";
    ctx.beginPath();
    ctx.moveTo(0, -115);
    ctx.lineTo(-42, 0);
    ctx.lineTo(42, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(245, 253, 255, 0.76)";
    ctx.beginPath();
    ctx.moveTo(0, -108);
    ctx.lineTo(-22, -34);
    ctx.lineTo(15, -48);
    ctx.closePath();
    ctx.fill();
    if (tree.progress > 0) {
      ctx.fillStyle = "rgba(3, 12, 22, 0.66)";
      roundRect(-42, 88, 84, 10, 5);
      ctx.fillStyle = "#ffb35c";
      roundRect(-42, 88, 84 * clamp(tree.progress / treeChopSeconds(), 0, 1), 10, 5);
    }
    ctx.restore();
  });
}

function drawBerryBush(bush, shake = 0) {
  ctx.save();
  ctx.translate(bush.x + shake, bush.y);
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(0, 36, 42, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#284831";
  ctx.beginPath();
  ctx.ellipse(-18, 10, 36, 46, -0.35, 0, Math.PI * 2);
  ctx.ellipse(18, 10, 36, 46, 0.35, 0, Math.PI * 2);
  ctx.ellipse(0, -2, 42, 50, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d94c7c";
  for (let i = 0; i < 9; i += 1) {
    const angle = i * 1.7;
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * 22, -4 + Math.sin(angle) * 22, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  if (bush.progress > 0) {
    const duration = gameConfig.trees.berryGatherSeconds || 3;
    ctx.fillStyle = "rgba(3, 12, 22, 0.66)";
    roundRect(-38, 52, 76, 9, 5);
    ctx.fillStyle = "#d94c7c";
    roundRect(-38, 52, 76 * clamp(bush.progress / duration, 0, 1), 9, 5);
  }
  ctx.restore();
}

function drawResources() {
  resources.forEach((resource) => {
    const meta = resourceMeta[resource.type];
    const bob = Math.sin(performance.now() / 280 + resource.bob) * 5;
    drawResourceSprite(resource.type, resource.x, resource.y + bob, 34);
    ctx.fillStyle = "#06111f";
    ctx.font = "900 12px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(meta.short, resource.x, resource.y + bob + 5);
  });
}

function drawVisitor() {
  if (!pendingVisitor) return;
  drawPerson(pendingVisitor, pendingVisitor.arrived ? "?" : "!");
  drawActorHealth(pendingVisitor, 58);
}

function drawResidents() {
  state.survivors.forEach((survivor) => {
    const badge = survivor.carrying ? `${resourceMeta[survivor.carrying].short}${survivor.carryAmount || ""}` : "";
    drawPerson(survivor, badge);
    drawActorHealth(survivor, 58);
  });
}

function drawWolves() {
  wolves.forEach((wolf) => {
    ctx.save();
    if (wolf.type === "eagle") {
      const bob = Math.sin((wolf.walkTime || 0) * 2.2) * 8;
      ctx.fillStyle = "rgba(0,0,0,0.16)";
      ctx.beginPath();
      ctx.ellipse(wolf.x, wolf.y + 44, 42, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      const frame = Math.floor((wolf.walkTime || 0) * (gameConfig.animation.walkFps || 8)) % spriteFrameCount("eagle");
      if (drawSprite("eagle", wolf.x - 60, wolf.y - 78 + bob, 120, 92, { flip: wolf.facing < 0, frame, fps: 9 })) {
        ctx.fillStyle = "rgba(3, 12, 22, 0.66)";
        roundRect(wolf.x - 34, wolf.y - 72 + bob, 68, 8, 4);
        ctx.fillStyle = "#ff5d66";
        roundRect(wolf.x - 34, wolf.y - 72 + bob, 68 * clamp(wolf.hp / wolf.maxHp, 0, 1), 8, 4);
        ctx.restore();
        return;
      }
    }
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(wolf.x - 2, wolf.y + 24, 48, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    const frame = Math.floor((wolf.walkTime || 0) * (gameConfig.animation.walkFps || 8)) % spriteFrameCount("wolf");
    if (drawSprite("wolf", wolf.x - 70, wolf.y - 78, 128, 106, { flip: wolf.facing < 0, frame, fps: 8 })) {
      ctx.fillStyle = "rgba(3, 12, 22, 0.66)";
      roundRect(wolf.x - 40, wolf.y - 58, 80, 8, 4);
      ctx.fillStyle = "#ff5d66";
      roundRect(wolf.x - 40, wolf.y - 58, 80 * clamp(wolf.hp / wolf.maxHp, 0, 1), 8, 4);
      ctx.restore();
      return;
    }
    ctx.fillStyle = "#2a3038";
    ctx.beginPath();
    ctx.ellipse(wolf.x, wolf.y, 42, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#39424c";
    ctx.beginPath();
    ctx.ellipse(wolf.x - 10, wolf.y - 7, 31, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(wolf.x + 34, wolf.y - 11, 19, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#151a20";
    ctx.beginPath();
    ctx.moveTo(wolf.x + 25, wolf.y - 28);
    ctx.lineTo(wolf.x + 36, wolf.y - 52);
    ctx.lineTo(wolf.x + 47, wolf.y - 26);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffdf9a";
    ctx.beginPath();
    ctx.arc(wolf.x + 42, wolf.y - 14, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#151a20";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(wolf.x - 40, wolf.y - 3);
    ctx.quadraticCurveTo(wolf.x - 72, wolf.y - 22, wolf.x - 88, wolf.y - 2);
    ctx.stroke();
    ctx.strokeStyle = "#151a20";
    ctx.lineWidth = 7;
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(wolf.x - 18 + i * 20, wolf.y + 10);
      ctx.lineTo(wolf.x - 28 + i * 20, wolf.y + 42);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(3, 12, 22, 0.66)";
    roundRect(wolf.x - 40, wolf.y - 58, 80, 8, 4);
    ctx.fillStyle = "#ff5d66";
    roundRect(wolf.x - 40, wolf.y - 58, 80 * clamp(wolf.hp / wolf.maxHp, 0, 1), 8, 4);
    ctx.restore();
  });
}

function drawPlayer() {
  const p = state.player;
  drawPerson(p, "");
  drawActorHealth(p, 58);
  drawCarryStack();
}

function drawActorHealth(actor, yOffset) {
  if (!Number.isFinite(actor.health) || !Number.isFinite(actor.maxHealth) || actor.health >= actor.maxHealth) return;
  const pct = clamp(actor.health / actor.maxHealth, 0, 1);
  ctx.save();
  ctx.fillStyle = "rgba(3, 12, 22, 0.66)";
  roundRect(actor.x - 34, actor.y - yOffset, 68, 7, 4);
  ctx.fillStyle = pct > 0.35 ? "#73df9b" : "#ff5d66";
  roundRect(actor.x - 34, actor.y - yOffset, 68 * pct, 7, 4);
  ctx.restore();
}

function tintedClothingImage(id, color) {
  const image = clothingImages[id];
  if (!clothingReady || !image || !image.complete || !image.naturalWidth) return null;
  const width = image.naturalWidth || 512;
  const height = image.naturalHeight || 864;
  const key = `${id}:${color}:${width}x${height}`;
  if (tintedClothingCache.has(key)) return tintedClothingCache.get(key);
  const layer = document.createElement("canvas");
  layer.width = width;
  layer.height = height;
  const layerCtx = layer.getContext("2d");
  layerCtx.drawImage(image, 0, 0, width, height);
  layerCtx.globalCompositeOperation = "source-in";
  layerCtx.fillStyle = color;
  layerCtx.fillRect(0, 0, width, height);
  tintedClothingCache.set(key, layer);
  return layer;
}

function clothingFrame(actor) {
  if (!actor || !actor.walkTime) return 0;
  return Math.floor(actor.walkTime * (gameConfig.animation.walkFps || 8)) % 4;
}

function drawOutfitLayer(targetCtx, actor, category, x, y, w, h) {
  const part = normalizeOutfit(actor.outfit, actor.clothes)[category];
  const image = tintedClothingImage(part.id, part.color);
  if (!image) return;
  const frames = 4;
  const rows = 4;
  const sourceW = image.width / frames;
  const sourceH = image.height / rows;
  const sourceX = sourceW * clothingFrame(actor);
  const sourceY = sourceH * directionRow(actor);
  targetCtx.drawImage(image, sourceX, sourceY, sourceW, sourceH, x, y, w, h);
}

function drawPerson(actor, badge = "", targetCtx = ctx, scale = 1) {
  const x = actor.x;
  const y = actor.y + Math.sin((actor.walkTime || 0) * 2.6) * 4 * scale;
  const w = 84 * scale;
  const h = 142 * scale;
  const left = x - w / 2;
  const top = y - 104 * scale;
  targetCtx.save();
  targetCtx.fillStyle = "rgba(0,0,0,0.18)";
  targetCtx.beginPath();
  targetCtx.ellipse(x, y + 42 * scale, 38 * scale, 15 * scale, 0, 0, Math.PI * 2);
  targetCtx.fill();
  drawOutfitLayer(targetCtx, actor, "shoes", left, top, w, h);
  drawOutfitLayer(targetCtx, actor, "pants", left, top, w, h);
  drawOutfitLayer(targetCtx, actor, "shirt", left, top, w, h);
  drawOutfitLayer(targetCtx, actor, "head", left, top, w, h);
  drawOutfitLayer(targetCtx, actor, "hat", left, top, w, h);
  if (badge) {
    targetCtx.fillStyle = "#ffffff";
    targetCtx.font = `900 ${20 * scale}px Inter, system-ui, sans-serif`;
    targetCtx.textAlign = "center";
    targetCtx.fillText(badge, x, y - 72 * scale);
  }
  targetCtx.restore();
}

function actorIconDataUrl(actor, size = 56) {
  const key = `${size}:${JSON.stringify(normalizeOutfit(actor.outfit, actor.clothes))}`;
  if (actorIconCache.has(key)) return actorIconCache.get(key);
  const icon = document.createElement("canvas");
  icon.width = size;
  icon.height = size;
  const iconCtx = icon.getContext("2d");
  iconCtx.translate(size / 2, size * 0.73);
  drawPerson({ ...actor, x: 0, y: 0, walkTime: 0, direction: "down", facing: 1 }, "", iconCtx, size / 156);
  const url = icon.toDataURL("image/png");
  actorIconCache.set(key, url);
  return url;
}

function drawCarryStack() {
  const entries = Object.entries(state.carry).flatMap(([type, amount]) => Array.from({ length: amount }, () => type));
  const base = playerHeadPoint();
  entries.slice(0, 12).forEach((type, index) => {
    const x = base.x - 18 + (index % 4) * 12;
    const y = base.y - 16 - Math.floor(index / 4) * 12;
    drawResourceSprite(type, x, y, 15);
  });
}

function drawCrate(x, y, color, size) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(x + 3, y + size * 0.56, size * 0.62, size * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  roundRect(x - size / 2, y - size / 2, size, size, 4);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath();
  ctx.moveTo(x - size / 2, y - size / 2);
  ctx.lineTo(x, y - size * 0.85);
  ctx.lineTo(x + size / 2, y - size / 2);
  ctx.lineTo(x, y - size * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawArrows() {
  arrows.forEach((arrow) => {
    const t = clamp(arrow.t, 0, 1);
    const x = arrow.from.x + (arrow.to.x - arrow.from.x) * t;
    const y = arrow.from.y + (arrow.to.y - arrow.from.y) * t;
    ctx.strokeStyle = "#ffdf9a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 16, y + 8);
    ctx.lineTo(x + 16, y - 8);
    ctx.stroke();
  });
}

function drawFlies() {
  flies.forEach((fly) => {
    const t = easeOut(fly.t);
    const arc = Math.sin(t * Math.PI) * -42;
    const x = fly.from.x + (fly.to.x - fly.from.x) * t;
    const y = fly.from.y + (fly.to.y - fly.from.y) * t + arc;
    drawResourceSprite(fly.type, x, y, 20);
  });
}

function drawParticles() {
  particles.forEach((particle) => {
    ctx.globalAlpha = clamp(particle.life / 0.6, 0, 1);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

function drawSnow() {
  ctx.save();
  ctx.fillStyle = "rgba(244, 251, 255, 0.8)";
  snow.forEach((flake) => {
    ctx.globalAlpha = 0.36;
    ctx.beginPath();
    ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawDayNightOverlay() {
  const progress = cyclePhaseProgress();
  const daylight = state.wave.active ? 0 : Math.sin(progress * Math.PI);
  const darkness = state.wave.active ? 0.48 : 0.42 * (1 - daylight);
  ctx.save();
  ctx.fillStyle = `rgba(2, 8, 20, ${darkness})`;
  ctx.fillRect(0, 0, world.width, world.height);
  const visibleW = window.innerWidth / camera.zoom;
  const orbX = camera.x + visibleW * (0.15 + progress * 0.72);
  const orbY = camera.y + 120 + Math.sin(progress * Math.PI) * -76;
  ctx.globalAlpha = state.wave.active ? 0.85 : 0.75;
  ctx.fillStyle = state.wave.active ? "#dff7ff" : "#ffd166";
  ctx.beginPath();
  ctx.arc(orbX, orbY, state.wave.active ? 24 : 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function dangerAuraLevel() {
  const furnace = buildings.furnace;
  const cabin = buildings.cabin;
  const fuelLevel = furnace.maxFuel ? 1 - furnace.fuel / (furnace.maxFuel * 0.12) : 0;
  const hungerLevel = cabin.maxHunger ? (cabin.hunger / cabin.maxHunger - 0.88) / 0.12 : 0;
  const fortLevel = fort.maxHealth ? 1 - fort.health / (fort.maxHealth * 0.12) : 0;
  return clamp(Math.max(fuelLevel, hungerLevel, fortLevel), 0, 1);
}

function drawDangerAura() {
  const level = dangerAuraLevel();
  if (level <= 0) return;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const alpha = 0.1 + level * 0.24;
  ctx.save();
  const edge = Math.min(120, Math.max(70, Math.min(width, height) * 0.18));
  const left = ctx.createLinearGradient(0, 0, edge, 0);
  left.addColorStop(0, `rgba(255, 93, 102, ${alpha})`);
  left.addColorStop(1, "rgba(255, 93, 102, 0)");
  ctx.fillStyle = left;
  ctx.fillRect(0, 0, edge, height);
  const right = ctx.createLinearGradient(width, 0, width - edge, 0);
  right.addColorStop(0, `rgba(255, 93, 102, ${alpha})`);
  right.addColorStop(1, "rgba(255, 93, 102, 0)");
  ctx.fillStyle = right;
  ctx.fillRect(width - edge, 0, edge, height);
  const top = ctx.createLinearGradient(0, 0, 0, edge);
  top.addColorStop(0, `rgba(255, 93, 102, ${alpha * 0.85})`);
  top.addColorStop(1, "rgba(255, 93, 102, 0)");
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, width, edge);
  const bottom = ctx.createLinearGradient(0, height, 0, height - edge);
  bottom.addColorStop(0, `rgba(255, 93, 102, ${alpha * 0.85})`);
  bottom.addColorStop(1, "rgba(255, 93, 102, 0)");
  ctx.fillStyle = bottom;
  ctx.fillRect(0, height - edge, width, edge);
  ctx.restore();
}

function updateSnow(dt) {
  snow.forEach((flake) => {
    flake.x += flake.drift * dt;
    flake.y += flake.speed * dt;
    if (flake.y > world.height + 20) {
      flake.y = -20;
      flake.x = Math.random() * world.width;
    }
    if (flake.x < -20) flake.x = world.width + 20;
    if (flake.x > world.width + 20) flake.x = -20;
  });
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
  ctx.fill();
}

function easeOut(t) {
  return 1 - Math.pow(1 - clamp(t, 0, 1), 3);
}

function openBuildingMenu(building) {
  const meter = getBuildingMeter(building);
  const cost = adjustedUpgradeCost(building);
  const job = getUpgradeJob("building", building.id);
  const cooldown = getCooldown(`building:${building.id}`);
  const residentSection = building.id === "cabin" ? renderCabinResidents() : building.id === "tower" ? renderStarterTowerStations() : "";
  hud.modalEyebrow.textContent = "Building";
  hud.modalTitle.textContent = building.name;
  hud.modalBody.innerHTML = `
    <p>${building.task}</p>
    <div class="stat-line">
      <span>${meter.label}</span>
      <div class="mini-meter"><i style="width:${meter.pct}%"></i></div>
    </div>
    ${residentSection}
    ${job ? `<p>Upgrade in progress: ${Math.ceil(job.remaining)}s remaining.</p>` : ""}
    ${cooldown ? `<p class="small-note">Upgrade retry cooldown: ${Math.ceil(cooldown)}s.</p>` : ""}
    <p>Level ${building.level}. Upgrade cost: ${cost} wood.</p>
    <div class="modal-actions">
      ${building.id === "furnace" ? `<button id="loadFurnace" type="button">Load ${gameConfig.furnace.woodLoadAmount} wood into furnace</button>` : ""}
      <button id="upgradeBuilding" class="primary" type="button">${job ? "Upgrading" : "Upgrade Options"}</button>
    </div>
  `;
  openModal("main-menu");
  const loadButton = document.querySelector("#loadFurnace");
  if (loadButton) {
    loadButton.addEventListener("click", () => {
      if (state.stored.wood <= 0) {
        showCenterMessage("Not enough wood.");
        setMessage("The wood pile is empty.");
        return;
      }
      const used = Math.min(gameConfig.furnace.woodLoadAmount, state.stored.wood);
      state.stored.wood -= used;
      building.fuel = clamp(building.fuel + used * gameConfig.furnace.fuelPerWood, 0, building.maxFuel);
      setMessage("Wood loaded into the furnace.");
      playSound("drop");
      saveState();
      openBuildingMenu(building);
    });
  }
  document.querySelector("#upgradeBuilding").addEventListener("click", () => {
    if (job) {
      setMessage(`${building.name} is already being upgraded.`);
      return;
    }
    openUpgradePreview({ kind: "building", target: building });
  });
  document.querySelectorAll("[data-starter-station]").forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.starterStation;
      state.towerStationedResidentId = value === "none" ? null : value;
      saveState();
      openBuildingMenu(building);
    });
  });
}

function renderCabinResidents() {
  if (!state.survivors.length) {
    return `
      <div class="resident-list">
        <h3>Current Residents</h3>
        <p>No recruited survivors yet. New survivors can appear at the fort entrance.</p>
      </div>
    `;
  }
  const rows = state.survivors.map((survivor) => `
    <article class="resident-row">
      <img class="resident-icon" src="${actorIconDataUrl(survivor, 56)}" alt="">
      <div>
        <strong>${survivor.name}</strong>
        <span>Level ${residentLevel(survivor)} ${survivor.title}: ${survivor.bonus}</span>
        <span>Health: ${Math.round(survivor.health)}/${survivor.maxHealth}</span>
        <span>Current work: ${residentWorkLabel(survivor)}</span>
      </div>
    </article>
  `).join("");
  return `
    <div class="resident-list">
      <h3>Current Residents</h3>
      ${rows}
    </div>
  `;
}

function renderStarterTowerStations() {
  const rows = [
    `<button data-starter-station="none" type="button">No Resident${!state.towerStationedResidentId ? " Selected" : ""}</button>`,
    ...state.survivors.map((survivor) => `
      <button data-starter-station="${survivor.id}" type="button">
        ${survivor.name} - Lv ${residentLevel(survivor)} ${survivor.title}${state.towerStationedResidentId === survivor.id ? " Selected" : ""}
      </button>
    `)
  ].join("");
  return `
    <div class="resident-list">
      <h3>Station Resident</h3>
      <p>Outposts fire on their own. A stationed resident boosts damage, and Hunters boost it most.</p>
      <div class="option-list">${rows}</div>
    </div>
  `;
}

function residentWorkLabel(survivor) {
  const labels = {
    lumberjack: "Hauling wood to the pile",
    farmer: "Carrying lettuce to food prep",
    cook: "Cooking meals at food prep",
    engineer: "Helping active construction",
    hunter: "Manning the nearest outpost",
    guard: "Patrolling the entrance"
  };
  return labels[survivor.specialty] || "Helping around camp";
}

function getBuildingMeter(building) {
  if (building.id === "furnace") {
    return { label: "Fuel", pct: (building.fuel / building.maxFuel) * 100 };
  }
  if (building.id === "cabin") {
    return { label: "Hunger", pct: (building.hunger / building.maxHunger) * 100 };
  }
  if (building.id === "foodPrep") {
    const pct = building.raw ? (building.processProgress / foodProcessSeconds()) * 100 : 0;
    return { label: "Cooking", pct: clamp(pct, 0, 100) };
  }
  if (building.id === "diningHall") {
    const pct = building.meals ? ((building.serveProgress || 0) / Math.max(1, gameConfig.cabin.diningServeSeconds)) * 100 : 0;
    return { label: `Serving (${building.meals || 0} meals)`, pct: clamp(pct, 0, 100) };
  }
  if (building.id === "farm") {
    const pct = (building.produceProgress / farmProduceSeconds()) * 100;
    return { label: "Growth", pct: clamp(pct, 0, 100) };
  }
  if (building.id === "tower") {
    return { label: "Arrow Power", pct: clamp(38 + building.level * 18, 0, 100) };
  }
  return { label: "Condition", pct: 100 };
}

function adjustedUpgradeCost(building) {
  const engineerDiscount = specialtyCount("engineer") * gameConfig.upgrades.engineerCostDiscount;
  return Math.max(gameConfig.upgrades.minWoodCost, building.upgradeCost - engineerDiscount);
}

function getUpgradeJob(kind, id) {
  return state.upgradeJobs.find((job) => job.kind === kind && job.id === id);
}

function getCooldown(key) {
  return Math.max(0, state.cooldowns[key] || 0);
}

function setCooldown(key, seconds) {
  state.cooldowns[key] = seconds;
}

function adjustedUpgradeTime(level) {
  const base = gameConfig.upgrades.baseSeconds + level * gameConfig.upgrades.secondsPerLevel;
  return Math.max(gameConfig.upgrades.minSeconds, base - specialtyCount("engineer") * gameConfig.upgrades.engineerReductionSeconds);
}

function getUpgradeStats(kind, target) {
  if (kind === "fort") {
    const nextLevel = state.fortLevel + 1;
    return {
      name: "All Fences And Gates",
      level: state.fortLevel,
      cost: barrierUpgradeCost(nextLevel),
      time: adjustedUpgradeTime(state.fortLevel),
      current: [`Gate-linked health max ${fort.maxHealth}`, `Barrier level ${state.fortLevel}`],
      next: [`Every fence and gate HP doubles`, `Barrier level ${nextLevel}`]
    };
  }
  const building = target;
  const stats = {
    name: building.name,
    level: building.level,
    cost: adjustedUpgradeCost(building),
    time: adjustedUpgradeTime(building.level),
    current: [],
    next: []
  };
  if (building.id === "furnace") {
    stats.current = [`Fuel capacity ${building.maxFuel}`, `Fuel drain level ${building.level}`];
    stats.next = [`Fuel capacity ${building.maxFuel + gameConfig.upgrades.furnaceFuelCapacityBonus}`, "Slower fuel drain"];
  } else if (building.id === "cabin") {
    stats.current = [`Survivor capacity ${survivorCapacity()}`, `Hunger max ${building.maxHunger}`];
    stats.next = [`Survivor capacity ${survivorCapacity() + 1}`, `Hunger max ${building.maxHunger + gameConfig.upgrades.cabinHungerMaxBonus}`];
  } else if (building.id === "foodPrep") {
    stats.current = [`Cooking speed level ${building.level}`, `Raw food ${building.raw}`];
    stats.next = ["Faster meal processing", "More efficient prep station"];
  } else if (building.id === "diningHall") {
    stats.current = [`Serving speed level ${building.level}`, `${building.meals || 0} meals waiting`];
    stats.next = ["Faster meal service", "Better order window flow"];
  } else if (building.id === "farm") {
    stats.current = [`Growth speed level ${building.level}`, "Lettuce production"];
    stats.next = ["Faster lettuce growth", "More reliable harvests"];
  } else if (building.id === "tower") {
    stats.current = [`Arrow power level ${building.level}`, "Tower damage zone"];
    stats.next = ["Higher arrow damage", "Stronger tower defense"];
  }
  return stats;
}

function openUpgradePreview(config) {
  const { kind, target } = config;
  const stats = getUpgradeStats(kind, target);
  const key = kind === "fort" ? "fort" : `building:${target.id}`;
  const cooldown = getCooldown(key);
  const hasWood = state.stored.wood >= stats.cost;
  const job = getUpgradeJob(kind, kind === "fort" ? "fort" : target.id);
  hud.modalEyebrow.textContent = "Upgrade";
  hud.modalTitle.textContent = stats.name;
  hud.modalBody.innerHTML = `
    <div class="upgrade-detail">
      <p><strong>Current Level ${stats.level}</strong></p>
      <p>${stats.current.join("<br>")}</p>
      <p><strong>Next Level ${stats.level + 1}</strong></p>
      <p>${stats.next.join("<br>")}</p>
      <p>Cost: ${stats.cost} wood. Build time: ${stats.time}s. Learning level: ${Math.min(5, stats.level)}.</p>
      ${cooldown ? `<p class="small-note">Retry cooldown active: ${Math.ceil(cooldown)}s.</p>` : ""}
      ${job ? `<p class="small-note">Already upgrading: ${Math.ceil(job.remaining)}s remaining.</p>` : ""}
    </div>
    <div class="modal-actions">
      <button id="confirmUpgrade" class="primary" type="button">${hasWood && !cooldown && !job ? "Confirm Upgrade Mission" : "Cannot Start Yet"}</button>
      <button id="backToMenu" type="button">Back</button>
    </div>
  `;
  openModal();
  document.querySelector("#confirmUpgrade").addEventListener("click", () => {
    if (job) {
      setMessage("That upgrade is already in progress.");
      return;
    }
    if (cooldown) {
      setMessage("That upgrade is cooling down after a failed mission.");
      return;
    }
    if (!hasWood) {
      showCenterMessage(`Not enough wood. Need ${stats.cost}.`);
      setMessage("Gather and drop off more wood before upgrading.");
      return;
    }
    beginUpgradeChallenge(kind, target, stats);
  });
  document.querySelector("#backToMenu").addEventListener("click", () => {
    if (kind === "fort") openFortMenu();
    else openBuildingMenu(target);
  });
}

function beginUpgradeChallenge(kind, target, stats) {
  activeTask = selectLearningTask(Math.min(5, stats.level));
  activeTaskContext = { kind: "upgrade", upgradeKind: kind, targetId: kind === "fort" ? "fort" : target.id, stats };
  renderLearningTask(activeTask, activeTaskContext);
}

function startUpgradeJob(kind, targetId, stats) {
  activeTask = null;
  activeTaskContext = null;
  if (state.stored.wood < stats.cost) {
    showCenterMessage(`Not enough wood. Need ${stats.cost}.`);
    setMessage("The camp no longer has enough wood for that upgrade.", 5);
    closeModal();
    return;
  }
  state.stored.wood -= stats.cost;
  state.upgradeJobs.push({
    kind,
    id: targetId,
    name: stats.name,
    remaining: stats.time,
    total: stats.time
  });
  setMessage(`${stats.name} upgrade started. Engineers reduce build time.`, 5);
  playSound("upgrade");
  saveState();
  closeModal();
}

function failUpgradeMission(context) {
  const stats = context.stats;
  const penalty = Math.ceil(stats.cost * gameConfig.upgrades.failureCostPercent);
  state.stored.wood = Math.max(0, state.stored.wood - penalty);
  const key = context.upgradeKind === "fort" ? "fort" : `building:${context.targetId}`;
  setCooldown(key, gameConfig.timers.upgradeFailCooldown);
  setMessage(`Upgrade mission failed. Lost ${penalty} wood and retry is locked for ${gameConfig.timers.upgradeFailCooldown} seconds.`, 6);
  playSound("fail");
  saveState();
}

function updateUpgradeJobs(dt) {
  Object.keys(state.cooldowns).forEach((key) => {
    state.cooldowns[key] = Math.max(0, state.cooldowns[key] - dt);
    if (state.cooldowns[key] <= 0) delete state.cooldowns[key];
  });
  state.upgradeJobs.forEach((job) => {
    job.remaining -= dt;
  });
  const completed = state.upgradeJobs.filter((job) => job.remaining <= 0);
  state.upgradeJobs = state.upgradeJobs.filter((job) => job.remaining > 0);
  completed.forEach((job) => completeUpgradeJob(job));
}

function completeUpgradeJob(job) {
  if (job.kind === "fort") {
    state.fortLevel += 1;
    state.structures.filter((structure) => isBarrierType(structure.type)).forEach((structure) => {
      structure.level = Math.max(structure.level || 1, state.fortLevel);
      structure.maxHealth *= 2;
      structure.health = structure.maxHealth;
    });
    state.fortUpgradeCost = barrierUpgradeCost(state.fortLevel + 1);
    syncFortHealthFromGates();
    setMessage("All fences and gates upgraded. Their HP doubled.", 5);
    playSound("upgrade");
    return;
  }
  const building = buildings[job.id];
  if (!building) return;
  upgradeBuilding(building);
  setMessage(`${building.name} upgrade complete.`, 5);
  playSound("upgrade");
}

function upgradeBuilding(building) {
  building.level += 1;
  building.upgradeCost = Math.ceil(building.upgradeCost * gameConfig.upgrades.buildingCostMultiplier);
  if (building.id === "furnace") {
    building.maxFuel += gameConfig.upgrades.furnaceFuelCapacityBonus;
    building.fuel = building.maxFuel;
  }
  if (building.id === "cabin") {
    building.maxHunger += gameConfig.upgrades.cabinHungerMaxBonus;
    building.hunger = clamp(building.hunger - gameConfig.upgrades.cabinUpgradeHungerRelief, 0, building.maxHunger);
  }
  if (building.id === "tower") {
    setMessage("Watch tower upgraded. Arrows hit harder.");
  } else if (building.id === "farm") {
    setMessage("Farm upgraded. Lettuce grows faster.");
  } else if (building.id === "foodPrep") {
    setMessage("Food prep upgraded. Meals cook faster.");
  } else if (building.id === "diningHall") {
    setMessage("Dining hall upgraded. Meals are served faster.");
  } else {
    setMessage(`${building.name} upgraded.`);
  }
}

function structureRepairCost(structure) {
  const missing = Math.max(0, structure.maxHealth - structure.health);
  if (!missing) return 0;
  return Math.ceil(missing / 12) * (gameConfig.upgrades.repairCostMultiplier || 3);
}

function totalBarrierRepairCost() {
  return state.structures
    .filter((structure) => isBarrierType(structure.type))
    .reduce((sum, structure) => sum + structureRepairCost(structure), 0);
}

function repairAllBarriers() {
  const cost = totalBarrierRepairCost();
  if (cost <= 0) {
    setMessage("All fences and gates are already repaired.");
    return;
  }
  if (state.stored.wood < cost) {
    showCenterMessage(`Not enough wood. Need ${cost}.`);
    setMessage("Not enough wood to repair all fences and gates.");
    return;
  }
  state.stored.wood -= cost;
  state.structures.filter((structure) => isBarrierType(structure.type)).forEach((structure) => {
    structure.health = structure.maxHealth;
  });
  syncFortHealthFromGates();
  setMessage(`Repaired every fence and gate for ${cost} wood.`, 5);
  playSound("upgrade");
  saveState();
  openFortMenu();
}

function openFortMenu() {
  syncFortHealthFromGates();
  const repairCost = totalBarrierRepairCost();
  const fullHealth = repairCost <= 0 && fort.health >= fort.maxHealth;
  const job = getUpgradeJob("fort", "fort");
  const cooldown = getCooldown("fort");
  const upgradeCost = barrierUpgradeCost(state.fortLevel + 1);
  hud.modalEyebrow.textContent = "Fort";
  hud.modalTitle.textContent = "Fence And Gate Network";
  hud.modalBody.innerHTML = `
    <p>The fort health is tied to the gate network. Repairing here fixes every damaged fence and gate at once.</p>
    <div class="stat-line">
      <span>Health</span>
      <div class="mini-meter"><i style="width:${(fort.health / fort.maxHealth) * 100}%"></i></div>
    </div>
    <p>Level ${state.fortLevel}. Health ${Math.round(fort.health)}/${fort.maxHealth}. Next all-wall upgrade: ${upgradeCost} wood.</p>
    ${job ? `<p>Upgrade in progress: ${Math.ceil(job.remaining)}s remaining.</p>` : ""}
    ${cooldown ? `<p class="small-note">Upgrade retry cooldown: ${Math.ceil(cooldown)}s.</p>` : ""}
    <div class="modal-actions">
      ${fullHealth ? `<button id="fortUpgrade" class="primary" type="button">Upgrade All for ${upgradeCost} wood</button>` : `<button id="repairFort" class="primary" type="button">Repair All for ${repairCost} wood</button>`}
      <button id="fortBack" type="button">Main Menu</button>
    </div>
  `;
  openModal();
  const repairButton = document.querySelector("#repairFort");
  if (repairButton) {
    repairButton.addEventListener("click", repairAllBarriers);
  }
  const upgradeButton = document.querySelector("#fortUpgrade");
  if (upgradeButton) {
    upgradeButton.addEventListener("click", () => openUpgradePreview({ kind: "fort", target: null }));
  }
  document.querySelector("#fortBack").addEventListener("click", openMainMenu);
}

function openPlayerMenu() {
  const upgrades = playerUpgradeOptions();
  hud.modalEyebrow.textContent = "Player";
  hud.modalTitle.textContent = "Player Upgrades";
  hud.modalBody.innerHTML = `
    <p>Complete learning challenges to earn points, then spend points here for permanent boosts.</p>
    <p><strong>Player Level ${playerLevel()}.</strong> ${state.learningPoints} learning points available.</p>
    <div class="upgrade-grid">
      ${upgrades.map((upgrade) => {
        const level = playerStatBonus(upgrade.id);
        const cost = playerUpgradeCost(upgrade.id);
        return `
          <button data-player-upgrade="${upgrade.id}" type="button">
            <strong>${upgrade.name} Lv ${level}</strong><br>
            ${upgrade.copy}<br>
            Cost: ${cost} points
          </button>
        `;
      }).join("")}
      <button id="playerBack" type="button">Player Menu</button>
    </div>
  `;
  openModal();
  document.querySelectorAll("[data-player-upgrade]").forEach((button) => {
    button.addEventListener("click", () => upgradePlayer(button.dataset.playerUpgrade));
  });
  document.querySelector("#playerBack").addEventListener("click", openPlayerHubMenu);
}

function upgradePlayer(stat) {
  const cost = playerUpgradeCost(stat);
  if (state.learningPoints < cost) {
    showCenterMessage(`Not enough learning points. Need ${cost}.`);
    setMessage("Complete more learning tasks to earn upgrade points.");
    return;
  }
  state.learningPoints -= cost;
  state.playerUpgrades[stat] += 1;
  state.playerLevel = playerLevel() + 1;
  setMessage(`Player upgrade purchased. Player level is now ${state.playerLevel}.`);
  saveState();
  openPlayerMenu();
}

function openPlayerHubMenu() {
  hud.modalEyebrow.textContent = "Player";
  hud.modalTitle.textContent = "Player";
  hud.modalBody.innerHTML = `
    <div class="player-hub">
      <img class="large-resident-icon" src="${actorIconDataUrl(state.player, 96)}" alt="">
      <div>
        <p><strong>Player Level ${playerLevel()}.</strong> ${state.learningPoints} learning points available.</p>
        <p>Customize layered clothing or buy survival upgrades.</p>
      </div>
    </div>
    <div class="modal-actions">
      <button id="openCharacterCreator" class="primary" type="button">Character Creation</button>
      <button id="openPlayerUpgrades" type="button">Player Upgrades</button>
      <button id="playerHubBack" type="button">Main Menu</button>
    </div>
  `;
  openModal();
  document.querySelector("#openCharacterCreator").addEventListener("click", openCharacterCreator);
  document.querySelector("#openPlayerUpgrades").addEventListener("click", openPlayerMenu);
  document.querySelector("#playerHubBack").addEventListener("click", openMainMenu);
}

function openCustomizationMenu() {
  openCharacterCreator();
}

function openCharacterCreator() {
  hud.modalEyebrow.textContent = "Player";
  hud.modalTitle.textContent = "Character Creation";
  const catalog = outfitCatalog();
  const sections = outfitCategories.map((category) => {
    const current = state.player.outfit[category.id];
    const buttons = catalog[category.id].map((option) => `
      <button class="clothing-option ${current.id === option.id ? "selected" : ""}" data-category="${category.id}" data-outfit-id="${option.id}" type="button">
        <span class="part-thumb" style="background-image:url('${option.source}')"></span>
        <span>${option.label}</span>
      </button>
    `).join("");
    return `
      <section class="creator-section">
        <div class="creator-section-header">
          <h3>${category.label}</h3>
          <label>Color <input data-color-category="${category.id}" type="color" value="${current.color}"></label>
        </div>
        <div class="clothing-grid">${buttons}</div>
      </section>
    `;
  }).join("");
  hud.modalBody.innerHTML = `
    <div class="creator-preview">
      <img class="large-resident-icon" src="${actorIconDataUrl(state.player, 112)}" alt="">
      <p>Pick a head and each clothing part, then choose its color.</p>
    </div>
    ${sections}
    <div class="modal-actions">
      <button id="creatorBack" type="button">Player Menu</button>
    </div>
  `;
  openModal();
  document.querySelectorAll("[data-outfit-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.category;
      state.player.outfit[category].id = button.dataset.outfitId;
      actorIconCache.clear();
      saveState();
      playSound("success");
      openCharacterCreator();
    });
  });
  document.querySelectorAll("[data-color-category]").forEach((input) => {
    input.addEventListener("change", () => {
      state.player.outfit[input.dataset.colorCategory].color = input.value;
      actorIconCache.clear();
      saveState();
      openCharacterCreator();
    });
  });
  document.querySelector("#creatorBack").addEventListener("click", openPlayerHubMenu);
}

function openUpgradeMenu() {
  hud.modalEyebrow.textContent = "Upgrade";
  hud.modalTitle.textContent = "Upgrade Menu";
  const buildingCards = Object.values(buildings).map((building) => {
    const stats = getUpgradeStats("building", building);
    const job = getUpgradeJob("building", building.id);
    return `
      <div class="menu-card">
        <h3>${building.name} Lv ${building.level}</h3>
        <p>${job ? `Upgrading: ${Math.ceil(job.remaining)}s left.` : `Cost ${stats.cost} wood. ${stats.next.join(", ")}.`}</p>
        <button data-upgrade-building="${building.id}" type="button">Upgrade</button>
      </div>
    `;
  }).join("");
  hud.modalBody.innerHTML = `
    <div class="menu-grid">
      <div class="menu-card">
        <h3>Player Lv ${playerLevel()}</h3>
        <p>${state.learningPoints} learning points available.</p>
        <button id="upgradePlayerMenu" type="button">Player Upgrades</button>
      </div>
      <div class="menu-card">
        <h3>Fort Wall Lv ${state.fortLevel}</h3>
        <p>Gate-linked health ${Math.round(fort.health)}/${fort.maxHealth}.</p>
        <button id="upgradeFortMenu" type="button">Fort Options</button>
      </div>
      ${buildingCards}
    </div>
  `;
  openModal();
  document.querySelector("#upgradePlayerMenu").addEventListener("click", openPlayerMenu);
  document.querySelector("#upgradeFortMenu").addEventListener("click", openFortMenu);
  document.querySelectorAll("[data-upgrade-building]").forEach((button) => {
    button.addEventListener("click", () => openUpgradePreview({ kind: "building", target: buildings[button.dataset.upgradeBuilding] }));
  });
}

function selectBuildTypeForPlacement(type) {
  if (buildMode && selectedBuildType === type) {
    stopBuildMode(`Stopped placing ${structureDisplayName(type)}.`);
    return;
  }
  selectedBuildType = type;
  buildMode = true;
  moveMode = false;
  removeMode = false;
  selectedMoveTarget = null;
  movePreview = null;
  buildPreview = null;
  buildTrayCollapsed = false;
  renderBuildTray();
  setMessage(`Build mode: tap a grid cell to place ${structureDisplayName(selectedBuildType)}. Open Build again to stop or choose another structure.`, 5);
}

function enterMoveBuildingMode() {
  buildMode = false;
  selectedBuildType = null;
  buildPreview = null;
  moveMode = true;
  removeMode = false;
  selectedMoveTarget = null;
  movePreview = null;
  buildTrayCollapsed = false;
  renderBuildTray();
  setMessage("Move mode: tap any building or tower, then tap a new grid cell.", 6);
}

function enterRemoveMode() {
  buildMode = false;
  selectedBuildType = null;
  buildPreview = null;
  moveMode = false;
  removeMode = true;
  selectedMoveTarget = null;
  movePreview = null;
  buildTrayCollapsed = false;
  renderBuildTray();
  setMessage("Remove mode: tap a fence, gate, outpost, placed cabin, or farm to remove it.", 6);
}

function renderBuildTray() {
  if (!hud.buildTrayBody) return;
  const stopButton = (buildMode || moveMode || removeMode) ? '<button class="build-token stop-building" data-stop-building type="button">Stop Building</button>' : "";
  const moveButton = `<button class="build-token ${moveMode ? "active" : ""}" data-move-buildings type="button"><strong>Move</strong><br>Buildings</button>`;
  const removeButton = `<button class="build-token ${removeMode ? "active" : ""}" data-remove-buildings type="button"><strong>Remove</strong><br>Objects</button>`;
  hud.buildTrayBody.innerHTML = stopButton + moveButton + removeButton + buildCatalog().map((item) => {
    const cost = structureCost(item.type);
    return `
      <button class="build-token ${buildMode && selectedBuildType === item.type ? "active" : ""}" data-tray-build="${item.type}" draggable="${item.unlocked}" type="button" ${item.unlocked ? "" : "disabled"}>
        <strong>${structureDisplayName(item.type)}</strong><br>
        ${cost} wood
      </button>
    `;
  }).join("");
  const stop = hud.buildTrayBody.querySelector("[data-stop-building]");
  if (stop) stop.addEventListener("click", () => stopBuildMode());
  const move = hud.buildTrayBody.querySelector("[data-move-buildings]");
  if (move) move.addEventListener("click", () => {
    if (moveMode) stopBuildMode("Stopped moving buildings.");
    else enterMoveBuildingMode();
  });
  const remove = hud.buildTrayBody.querySelector("[data-remove-buildings]");
  if (remove) remove.addEventListener("click", () => {
    if (removeMode) stopBuildMode("Stopped removing objects.");
    else enterRemoveMode();
  });
  hud.buildTrayBody.querySelectorAll("[data-tray-build]").forEach((button) => {
    button.addEventListener("click", () => selectBuildTypeForPlacement(button.dataset.trayBuild));
    button.addEventListener("dragstart", (event) => {
      selectedBuildType = button.dataset.trayBuild;
      buildMode = true;
      moveMode = false;
      removeMode = false;
      selectedMoveTarget = null;
      movePreview = null;
      buildPreview = null;
      event.dataTransfer.setData("text/plain", selectedBuildType);
      renderBuildTray();
    });
  });
}

function openBuildMenu() {
  renderBuildTray();
  hud.modalEyebrow.textContent = "Build";
  hud.modalTitle.textContent = "Grid Construction";
  const cards = buildCatalog().map((item) => {
    const cost = structureCost(item.type);
    return `
      <button data-build-type="${item.type}" type="button" ${item.unlocked ? "" : "disabled"}>
        <strong>${structureDisplayName(item.type)} - ${cost} wood</strong><br>
        ${item.unlocked ? item.note : `Locked. ${item.note}`}
      </button>
    `;
  }).join("");
  hud.modalBody.innerHTML = `
    <p>Pick a structure, then tap a grid cell. New defenses snap to the transparent grid.</p>
    <div class="option-list">${cards}</div>
    <div class="modal-actions">
      <button id="moveBuildings" class="${moveMode ? "primary" : ""}" type="button">${moveMode ? "Stop Moving" : "Move Buildings"}</button>
      <button id="removeBuildings" class="${removeMode ? "primary" : ""}" type="button">${removeMode ? "Stop Removing" : "Remove Objects"}</button>
      ${buildMode || moveMode || removeMode ? '<button id="stopBuildMode" class="primary" type="button">Stop Building</button>' : ""}
      <button id="cancelBuildMode" type="button">Close</button>
    </div>
  `;
  openModal();
  document.querySelectorAll("[data-build-type]").forEach((button) => {
    button.addEventListener("click", () => {
      selectBuildTypeForPlacement(button.dataset.buildType);
      closeModal(true);
    });
  });
  document.querySelector("#moveBuildings").addEventListener("click", () => {
    if (moveMode) stopBuildMode("Stopped moving buildings.");
    else enterMoveBuildingMode();
    closeModal(true);
  });
  document.querySelector("#removeBuildings").addEventListener("click", () => {
    if (removeMode) stopBuildMode("Stopped removing objects.");
    else enterRemoveMode();
    closeModal(true);
  });
  const stopBuildButton = document.querySelector("#stopBuildMode");
  if (stopBuildButton) {
    stopBuildButton.addEventListener("click", () => {
      stopBuildMode();
      closeModal(true);
    });
  }
  document.querySelector("#cancelBuildMode").addEventListener("click", () => {
    closeModal(true);
  });
}

function confirmBuildAt(point) {
  const snapped = snapToGrid(point);
  buildPreview = snapped;
  const placement = canPlaceStructure(selectedBuildType, snapped);
  if (!placement.ok) {
    if (placement.reason.startsWith("Need ")) showCenterMessage(`Not enough wood. ${placement.reason}`);
    setMessage(placement.reason, 4);
    return;
  }
  if (["hunterPost", "signalTower", "iceTrap", "cabin", "farm"].includes(selectedBuildType)) {
    activeTask = selectLearningTask(Math.min(5, Math.max(2, Math.floor(playerLevel() / 4))));
    activeTaskContext = { kind: "build", buildType: selectedBuildType, point: snapped, cost: placement.cost, replaceIds: placement.replaceIds || null };
    renderLearningTask(activeTask, activeTaskContext);
    return;
  }
  placeStructure(selectedBuildType, snapped, placement.cost, placement.replaceIds || null);
}

function placeStructure(type, point, cost, replaceIds = null) {
  activeTask = null;
  activeTaskContext = null;
  if (state.stored.wood < cost) {
    setMessage(`Need ${cost} wood.`);
    return;
  }
  state.stored.wood -= cost;
  if (replaceIds && replaceIds.length) {
    replaceIds.forEach((id) => {
      const existing = state.structures.find((structure) => structure.id === id);
      if (!existing) return;
      existing.type = type;
      existing.level = state.fortLevel || 1;
      existing.maxHealth = barrierMaxHealth(type, existing.level);
      existing.health = existing.maxHealth;
      existing.gateGroup = replaceIds.join("-");
    });
  } else {
    state.structures.push(createStructure(type, point.x, point.y));
  }
  const canContinue = state.stored.wood >= structureCost(type);
  buildMode = canContinue;
  buildPreview = null;
  renderBuildTray();
  setMessage(canContinue ? `${structureDisplayName(type)} built. Tap another grid cell to place another.` : `${structureDisplayName(type)} built. Not enough wood for another.`, 5);
  playSound("upgrade");
  saveState();
  closeModal(true);
}

function moveTargetLabel(target) {
  if (!target) return "Building";
  if (target.kind === "building") return buildings[target.id]?.name || "Building";
  const structure = state.structures.find((item) => item.id === target.id);
  return structure ? structureDisplayName(structure.type) : "Building";
}

function moveTargetRect(target, point) {
  if (target.kind === "building") {
    const building = buildings[target.id];
    return { x: point.x - building.w / 2, y: point.y - building.h / 2, w: building.w, h: building.h };
  }
  const structure = state.structures.find((item) => item.id === target.id);
  return structure ? structureRect({ ...structure, x: point.x, y: point.y }) : null;
}

function canMoveTargetTo(target, point) {
  const rect = moveTargetRect(target, point);
  if (!rect) return { ok: false, reason: "Choose a building to move first." };
  if (rect.x < 60 || rect.y < 80 || rect.x + rect.w > world.width - 60 || rect.y + rect.h > world.height - 60) {
    return { ok: false, reason: "Too close to the wilderness edge." };
  }
  const overlapsBuilding = Object.values(buildings).some((building) => {
    if (target.kind === "building" && building.id === target.id) return false;
    return rectanglesOverlap(rect, building);
  });
  if (overlapsBuilding) return { ok: false, reason: "Another building is already there." };
  const overlapsStructure = state.structures.some((structure) => {
    if (target.kind === "structure" && structure.id === target.id) return false;
    return rectanglesOverlap(rect, structureRect(structure));
  });
  if (overlapsStructure) return { ok: false, reason: "That grid space is occupied." };
  return { ok: true };
}

function selectMoveTarget(point) {
  const building = clickedBuilding(point);
  if (building) {
    selectedMoveTarget = { kind: "building", id: building.id };
    movePreview = snapToGrid(buildingCenter(building));
    setMessage(`Move mode: tap a new grid cell for ${building.name}.`, 5);
    return true;
  }
  const structure = clickedStructure(point);
  if (structure && !isBarrierType(structure.type)) {
    selectedMoveTarget = { kind: "structure", id: structure.id };
    movePreview = snapToGrid(structure);
    setMessage(`Move mode: tap a new grid cell for ${structureDisplayName(structure.type)}.`, 5);
    return true;
  }
  setMessage("Tap a building, tower, cabin, or farm to move it. Fences and gates stay in the wall network.", 5);
  return false;
}

function applyMoveTarget(point) {
  const placement = canMoveTargetTo(selectedMoveTarget, point);
  if (!placement.ok) {
    setMessage(placement.reason, 4);
    return;
  }
  if (selectedMoveTarget.kind === "building") {
    const building = buildings[selectedMoveTarget.id];
    building.x = point.x - building.w / 2;
    building.y = point.y - building.h / 2;
    syncDropoffsToBuildings();
  } else {
    const structure = state.structures.find((item) => item.id === selectedMoveTarget.id);
    if (structure) {
      structure.x = point.x;
      structure.y = point.y;
    }
  }
  const label = moveTargetLabel(selectedMoveTarget);
  selectedMoveTarget = null;
  movePreview = null;
  saveState();
  setMessage(`${label} moved. Tap another building to move it, or Stop Building to exit.`, 5);
}

function handleMoveClick(point) {
  if (!selectedMoveTarget) {
    selectMoveTarget(point);
    return;
  }
  applyMoveTarget(snapToGrid(point));
}

function removeObjectAt(point) {
  const structure = clickedStructure(point);
  if (structure) {
    if (structure.stationedResidentId) {
      const resident = state.survivors.find((survivor) => survivor.id === structure.stationedResidentId);
      if (resident) resident.stationedAt = null;
    }
    state.structures = state.structures.filter((item) => item.id !== structure.id);
    if (isBarrierType(structure.type)) syncFortHealthFromGates();
    saveState();
    setMessage(`${structureDisplayName(structure.type)} removed. Tap another object or Stop Building to exit.`, 5);
    playSound("pickup");
    return true;
  }
  const building = clickedBuilding(point);
  if (building) {
    showCenterMessage("Core buildings cannot be removed.");
    setMessage("Move core buildings from the Build menu. Survival systems stay in camp.", 5);
    return false;
  }
  setMessage("Remove mode: tap a fence, gate, tower, placed cabin, or farm.", 4);
  return false;
}

function openMainMenu() {
  hud.modalEyebrow.textContent = "Camp";
  hud.modalTitle.textContent = "Main Menu";
  const buildingCards = Object.values(buildings).map((building) => {
    const job = getUpgradeJob("building", building.id);
    return `
      <div class="menu-card">
        <h3>${building.name} Lv ${building.level}</h3>
        <p>${job ? `Upgrading: ${Math.ceil(job.remaining)}s left.` : building.task}</p>
        <button data-open-building="${building.id}" type="button">Open Options</button>
      </div>
    `;
  }).join("");
  hud.modalBody.innerHTML = `
    <div class="menu-grid">
      ${buildingCards}
      <div class="menu-card">
        <h3>Fort Wall Lv ${state.fortLevel}</h3>
        <p>Health ${Math.round(fort.health)}/${fort.maxHealth}. ${fort.health < fort.maxHealth ? "Repair with wood." : "Full health wall can be upgraded."}</p>
        <button id="openFortMenu" type="button">Fort Options</button>
      </div>
      <div class="menu-card">
        <h3>Player</h3>
        <p>Level ${playerLevel()}. ${state.learningPoints} learning points. Carry ${carryCapacity()} items. Attack +${playerStatBonus("attack") * gameConfig.combat.playerAttackDamage}.</p>
        <button id="openPlayerMenu" type="button">Player Upgrades</button>
        <button id="openCustomizeMenu" type="button">Character Creation</button>
      </div>
      <div class="menu-card">
        <h3>Tower Defense</h3>
        <p>Night ${Math.max(1, state.wave.number || 1)}. ${state.wave.active ? `Night ends in ${Math.ceil(state.wave.timer || 0)}s.` : `Next night in ${Math.ceil(state.wave.timer || 0)}s.`}</p>
        <button id="openBuildMenu" type="button">Build Mode</button>
      </div>
    </div>
  `;
  openModal();
  document.querySelectorAll("[data-open-building]").forEach((button) => {
    button.addEventListener("click", () => openBuildingMenu(buildings[button.dataset.openBuilding]));
  });
  document.querySelector("#openFortMenu").addEventListener("click", openFortMenu);
  document.querySelector("#openPlayerMenu").addEventListener("click", openPlayerMenu);
  document.querySelector("#openCustomizeMenu").addEventListener("click", openCustomizationMenu);
  document.querySelector("#openBuildMenu").addEventListener("click", openBuildMenu);
}

function openHelpMenu() {
  hud.modalEyebrow.textContent = "Help";
  hud.modalTitle.textContent = "Camp Guide";
  hud.modalBody.innerHTML = `
    <div class="menu-grid">
      <div class="menu-card">
        <h3>First Moves</h3>
        <p>Gather wood from trees for the furnace and repairs. Gather berries or lettuce for raw food.</p>
      </div>
      <div class="menu-card">
        <h3>Food Loop</h3>
        <p>Drop raw food at Food Prep, stand there to cook meals, then carry meals to the Dining Hall.</p>
      </div>
      <div class="menu-card">
        <h3>Defense</h3>
        <p>Build outposts during the day. At night, attackers arrive from the dark at random intervals.</p>
      </div>
      <div class="menu-card">
        <h3>Upgrades</h3>
        <p>Open Upgrade to improve buildings and the player. Upgrade missions give learning points and long-term survival boosts.</p>
      </div>
    </div>
    <div class="modal-actions">
      <button id="helpBuild" class="primary" type="button">Open Build</button>
      <button id="helpUpgrade" type="button">Open Upgrade</button>
      <button id="helpClose" type="button">Close</button>
    </div>
  `;
  openModal();
  document.querySelector("#helpBuild").addEventListener("click", openBuildMenu);
  document.querySelector("#helpUpgrade").addEventListener("click", openUpgradeMenu);
  document.querySelector("#helpClose").addEventListener("click", () => closeModal(true));
}

function showTutorialTip(flag, title, copy, actions = []) {
  state.tutorialFlags = { ...defaultState.tutorialFlags, ...(state.tutorialFlags || {}) };
  if (state.tutorialFlags[flag] || modalOpen || paused || gameOver || failureLock || activeTaskContext) return false;
  state.tutorialFlags[flag] = true;
  saveState();
  hud.modalEyebrow.textContent = "Camp Tip";
  hud.modalTitle.textContent = title;
  hud.modalBody.innerHTML = `
    <p>${copy}</p>
    <div class="modal-actions">
      ${actions.map((action, index) => `<button ${index === 0 ? 'class="primary"' : ""} data-tip-action="${index}" type="button">${action.label}</button>`).join("")}
      <button id="tipClose" type="button">Keep Playing</button>
    </div>
  `;
  openModal();
  document.querySelectorAll("[data-tip-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = actions[Number(button.dataset.tipAction)];
      if (action && action.action) action.action();
    });
  });
  document.querySelector("#tipClose").addEventListener("click", () => closeModal(true));
  return true;
}

function openVisitorModal(visitor) {
  hud.modalEyebrow.textContent = "Survivor At The Gate";
  hud.modalTitle.textContent = visitor.name;
  hud.modalBody.innerHTML = `
    <p><strong>Level ${visitor.level} ${visitor.title}</strong></p>
    <p>${visitor.bonus}</p>
    <p>Recruiting them requires one learning task. Camp capacity is ${state.survivors.length}/${survivorCapacity()}.</p>
    <div class="modal-actions">
      <button id="startRecruitment" class="primary" type="button">Recruitment mission</button>
      <button id="turnAway" type="button">Send Away</button>
    </div>
  `;
  openModal();
  document.querySelector("#startRecruitment").addEventListener("click", () => startRecruitment(visitor));
  document.querySelector("#turnAway").addEventListener("click", () => finishVisitor(`${visitor.name} heads back into the snow.`));
}

function renderLearningTask(task, context) {
  hud.modalEyebrow.textContent = task.type;
  hud.modalTitle.textContent = task.title;
  const shownOptions = shuffled(task.options);
  const options = shownOptions.map((option, index) => `<button data-option="${index}" type="button">${option.label}</button>`).join("");
  const missionCopy = context && context.kind === "failure"
    ? "Critical rescue challenge. A correct answer stabilizes the camp. A wrong answer ends the run."
    : `Grade ${task.grade || "?"} challenge. Reward: ${task.points || 3} learning points.`;
  hud.modalBody.innerHTML = `
    <p class="small-note">${missionCopy}</p>
    <p>${task.text}</p>
    <div class="option-list">${options}</div>
  `;
  openModal();
  document.querySelectorAll("[data-option]").forEach((button) => {
    button.addEventListener("click", () => {
      const option = shownOptions[Number(button.dataset.option)];
      document.querySelectorAll("[data-option]").forEach((candidate, index) => {
        candidate.disabled = true;
        if (shownOptions[index].correct) candidate.classList.add("correct");
      });
      if (option.correct) {
        awardLearningPoints(task);
        setMessage(task.feedback, 5);
        if (context && context.kind === "failure") {
          window.setTimeout(() => resolveFailureChallenge(context.failureType), 650);
        } else if (context && context.kind === "build") {
          window.setTimeout(() => placeStructure(context.buildType, context.point, context.cost, context.replaceIds || null), 650);
        } else if (context && context.kind === "upgrade") {
          window.setTimeout(() => startUpgradeJob(context.upgradeKind, context.targetId, context.stats), 650);
        } else {
          window.setTimeout(completeRecruitment, 600);
        }
      } else {
        button.classList.add("wrong");
        if (context && context.kind === "failure") {
          window.setTimeout(() => showGameOver(context.failureType), 850);
        } else if (context && context.kind === "build") {
          state.stored.wood = Math.max(0, state.stored.wood - Math.ceil(context.cost * gameConfig.upgrades.failureCostPercent));
          setMessage("Build mission failed. Some wood was wasted in the storm.", 5);
          playSound("fail");
          window.setTimeout(() => {
            activeTask = null;
            activeTaskContext = null;
            closeModal(true);
          }, 950);
        } else if (context && context.kind === "upgrade") {
          failUpgradeMission(context);
          window.setTimeout(() => {
            activeTask = null;
            activeTaskContext = null;
            closeModal();
          }, 950);
        } else {
          setMessage("The survivor needs a clearer answer and leaves for now.", 5);
          window.setTimeout(() => finishVisitor(`${pendingRecruit.name} leaves the gate.`), 950);
        }
      }
    });
  });
}

function renderReplacementMenu(recruit) {
  hud.modalEyebrow.textContent = "Camp Full";
  hud.modalTitle.textContent = "Choose A Survivor";
  const rows = state.survivors.map((survivor, index) => `
    <article class="resident-list resident-row">
      <img class="resident-icon" src="${actorIconDataUrl(survivor, 56)}" alt="">
      <div>
        <strong>${survivor.name}</strong>
        <span>Level ${residentLevel(survivor)} ${survivor.title}: ${survivor.bonus}</span>
      </div>
      <button data-replace="${index}" type="button">Replace With ${recruit.name}</button>
    </article>
  `).join("");
  hud.modalBody.innerHTML = `
    <p>The camp can only hold ${survivorCapacity()} survivors right now. Choose someone to send away or keep your current crew.</p>
    <div class="replacement-layout">
      <div class="replacement-column">
        <h3>Current Residents</h3>
        ${rows}
      </div>
      <div class="replacement-column">
        <h3>New Survivor</h3>
        <div class="resident-row">
          <img class="resident-icon" src="${actorIconDataUrl(recruit, 56)}" alt="">
          <div>
            <p><strong>${recruit.name}</strong></p>
            <p>Level ${recruit.level} ${recruit.title}: ${recruit.bonus}</p>
          </div>
        </div>
        <button id="keepCrew" type="button">Keep Current Crew</button>
      </div>
    </div>
  `;
  document.querySelectorAll("[data-replace]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.replace);
      const removed = state.survivors[index];
      state.survivors[index] = normalizeSurvivor(recruit, index);
      finishVisitor(`${recruit.name} joins camp. ${removed.name} leaves with supplies.`);
    });
  });
  document.querySelector("#keepCrew").addEventListener("click", () => finishVisitor(`${recruit.name} leaves the fort gate.`));
}

function openModal(mode = "") {
  modalOpen = true;
  hud.modalLayer.classList.toggle("main-menu-open", mode === "main-menu");
  hud.modalLayer.classList.remove("hidden");
}

function closeModal(force = false) {
  if (!force && (gameOver || (activeTaskContext && activeTaskContext.kind === "failure"))) return;
  modalOpen = false;
  hud.modalLayer.classList.add("hidden");
  hud.modalLayer.classList.remove("main-menu-open");
}

function forceCloseModal() {
  closeModal(true);
}

function openStructureMenu(structure) {
  if (isBarrierType(structure.type)) {
    openFortMenu();
    return;
  }
  const cost = Math.ceil(structureCost(structure.type) * 0.8 + structure.level * 8);
  const tower = isTowerType(structure.type);
  const stats = tower ? towerStats(structure) : null;
  const stationRows = tower ? renderStationButtons(structure) : "";
  hud.modalEyebrow.textContent = tower ? "Outpost" : "Structure";
  hud.modalTitle.textContent = `${structureDisplayName(structure.type)} Lv ${structure.level}`;
  hud.modalBody.innerHTML = `
    <p>Health ${Math.round(structure.health)}/${structure.maxHealth}.</p>
    ${tower ? `<p>Range ${stats.range}. Damage ${Math.round(stats.damage)}. ${stats.slow < 1 ? "Slows enemies in range." : "Automatic arrows."}</p>` : ""}
    ${tower ? stationRows : ""}
    <div class="modal-actions">
      <button id="upgradeStructure" class="primary" type="button">Upgrade for ${cost} wood</button>
      ${isBarrierType(structure.type) && structure.health < structure.maxHealth ? `<button id="repairStructure" type="button">Repair for ${structureRepairCost(structure)} wood</button>` : ""}
      <button id="structureBack" type="button">Close</button>
    </div>
  `;
  openModal();
  document.querySelector("#upgradeStructure").addEventListener("click", () => upgradeStructure(structure, cost));
  const repairButton = document.querySelector("#repairStructure");
  if (repairButton) repairButton.addEventListener("click", () => repairStructure(structure));
  document.querySelectorAll("[data-station]").forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.station;
      if (value === "none") structure.stationedResidentId = null;
      else structure.stationedResidentId = value;
      saveState();
      openStructureMenu(structure);
    });
  });
  document.querySelector("#structureBack").addEventListener("click", () => closeModal(true));
}

function renderStationButtons(structure) {
  const rows = [
    `<button data-station="none" type="button">No Resident${!structure.stationedResidentId ? " Selected" : ""}</button>`,
    ...state.survivors.map((survivor) => `
      <button data-station="${survivor.id}" type="button">
        ${survivor.name} - Lv ${residentLevel(survivor)} ${survivor.title}${structure.stationedResidentId === survivor.id ? " Selected" : ""}
      </button>
    `)
  ].join("");
  return `
    <h3>Station Resident</h3>
    <p class="small-note">Stationed residents boost arrows. Hunters give the largest damage boost.</p>
    <div class="option-list">${rows}</div>
  `;
}

function upgradeStructure(structure, cost) {
  if (state.stored.wood < cost) {
    showCenterMessage(`Not enough wood. Need ${cost}.`);
    setMessage("Not enough wood for that defense upgrade.");
    return;
  }
  state.stored.wood -= cost;
  structure.level += 1;
  structure.maxHealth += isBarrierType(structure.type) ? 25 : 35;
  structure.health = structure.maxHealth;
  setMessage(`${structureDisplayName(structure.type)} upgraded.`);
  playSound("upgrade");
  saveState();
  openStructureMenu(structure);
}

function repairStructure(structure) {
  const cost = structureRepairCost(structure);
  if (state.stored.wood < cost) {
    showCenterMessage(`Not enough wood. Need ${cost}.`);
    setMessage(`Not enough wood to repair that ${structureDisplayName(structure.type).toLowerCase()}.`);
    return;
  }
  state.stored.wood -= cost;
  structure.health = structure.maxHealth;
  if (structure.type === "gate") syncFortHealthFromGates();
  setMessage(`${structureDisplayName(structure.type)} repaired.`);
  saveState();
  openStructureMenu(structure);
}

function clickedBuilding(point) {
  return Object.values(buildings).find((building) => pointInRect(point, building, 10));
}

function clickedStructure(point) {
  return state.structures.find((structure) => pointInRect(point, structureRect(structure), 12));
}

function handleCanvasClick(event) {
  if (paused) return;
  if (suppressNextCanvasClick) {
    suppressNextCanvasClick = false;
    return;
  }
  const point = screenToWorld(event);
  if (moveMode) {
    handleMoveClick(point);
    return;
  }
  if (removeMode) {
    removeObjectAt(point);
    return;
  }
  if (buildMode) {
    confirmBuildAt(point);
    return;
  }
  const structure = clickedStructure(point);
  if (structure) {
    if (isBarrierType(structure.type)) {
      openFortMenu();
      return;
    }
    openStructureMenu(structure);
    return;
  }
  const building = clickedBuilding(point);
  if (building) {
    openBuildingMenu(building);
    return;
  }
  state.player.target = point;
}

function canStartTouchMove(point) {
  if (paused || modalOpen || buildMode || moveMode || removeMode || gameOver || failureLock) return false;
  return !clickedBuilding(point) && !clickedStructure(point);
}

function trackedTouches() {
  return Array.from(activeTouchPointers.values());
}

function touchDistance(points) {
  if (points.length < 2) return 0;
  return Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
}

function startPinchZoom() {
  const points = trackedTouches();
  const distance = touchDistance(points);
  if (distance < 12 || paused || modalOpen) return;
  stopTouchMove(false);
  heldMove = { x: 0, y: 0 };
  state.player.target = null;
  pinchZoom = {
    startDistance: distance,
    startZoom: camera.zoom
  };
  suppressNextCanvasClick = true;
}

function updatePinchZoom() {
  const points = trackedTouches();
  if (points.length < 2) return false;
  if (!pinchZoom) startPinchZoom();
  if (!pinchZoom) return false;
  const distance = touchDistance(points);
  if (distance < 12) return false;
  setCameraZoom(pinchZoom.startZoom * (distance / pinchZoom.startDistance));
  suppressNextCanvasClick = true;
  return true;
}

function handleCanvasPointerDown(event) {
  if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
  if (event.pointerType === "touch") {
    activeTouchPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    canvas.setPointerCapture?.(event.pointerId);
    if (activeTouchPointers.size >= 2) {
      event.preventDefault();
      startPinchZoom();
      return;
    }
  }
  const point = screenToWorld(event);
  if (!canStartTouchMove(point)) return;
  touchMove = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    active: false
  };
  canvas.setPointerCapture?.(event.pointerId);
}

function handleCanvasPointerMove(event) {
  if (buildMode) buildPreview = snapToGrid(screenToWorld(event));
  if (moveMode && selectedMoveTarget) movePreview = snapToGrid(screenToWorld(event));
  if (event.pointerType === "touch" && activeTouchPointers.has(event.pointerId)) {
    activeTouchPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pinchZoom || activeTouchPointers.size >= 2) {
      event.preventDefault();
      updatePinchZoom();
      return;
    }
  }
  if (!touchMove || touchMove.pointerId !== event.pointerId) return;
  if (paused || modalOpen) {
    stopTouchMove(false);
    return;
  }
  const dx = event.clientX - touchMove.startX;
  const dy = event.clientY - touchMove.startY;
  const gap = Math.hypot(dx, dy);
  const deadZone = 8;
  if (gap < deadZone && !touchMove.active) return;
  event.preventDefault();
  touchMove.active = true;
  state.player.target = null;
  const radius = 44;
  heldMove = {
    x: clamp(dx / radius, -1, 1),
    y: clamp(dy / radius, -1, 1)
  };
}

function stopTouchMove(blockClick = true) {
  if (!touchMove) return;
  if (touchMove.active && blockClick) suppressNextCanvasClick = true;
  touchMove = null;
  heldMove = { x: 0, y: 0 };
}

function handleCanvasPointerEnd(event, blockClick = true) {
  if (event.pointerType === "touch") {
    activeTouchPointers.delete(event.pointerId);
    if (pinchZoom && activeTouchPointers.size < 2) {
      pinchZoom = null;
      suppressNextCanvasClick = true;
    }
  }
  if (touchMove && touchMove.pointerId === event.pointerId) stopTouchMove(blockClick);
}

function togglePause() {
  setPaused(!paused);
}

function setPaused(value) {
  paused = value;
  if (paused) {
    forceCloseModal();
    setMessage("Paused. Resume from the center menu or open the main menu.", 4);
  } else {
    setMessage("Resumed.", 2);
  }
  updateHud(0);
}

function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  updateSnow(dt);
  update(dt);
  draw();
  window.requestAnimationFrame(frame);
}

window.addEventListener("resize", resize);
window.addEventListener("pointerdown", unlockAudio, { once: true });
window.addEventListener("keydown", unlockAudio, { once: true });
canvas.addEventListener("click", handleCanvasClick);
canvas.addEventListener("pointerdown", handleCanvasPointerDown);
canvas.addEventListener("dragover", (event) => {
  if (!paused) event.preventDefault();
});
canvas.addEventListener("drop", (event) => {
  if (paused) return;
  event.preventDefault();
  const type = event.dataTransfer.getData("text/plain");
  if (type) selectedBuildType = type;
  removeMode = false;
  moveMode = false;
  buildMode = true;
  confirmBuildAt(screenToWorld(event));
});
canvas.addEventListener("pointermove", handleCanvasPointerMove);
canvas.addEventListener("pointerup", (event) => handleCanvasPointerEnd(event, true));
canvas.addEventListener("pointercancel", (event) => handleCanvasPointerEnd(event, false));
canvas.addEventListener("lostpointercapture", (event) => handleCanvasPointerEnd(event, false));
hud.closeModal?.addEventListener("click", () => closeModal());
hud.actionsToggle?.addEventListener("click", () => setActionsCollapsed(!actionsCollapsed));
hud.playerIconButton?.addEventListener("click", () => runHudAction(openPlayerHubMenu));
hud.mainMenuButton?.addEventListener("click", () => runHudAction(openMainMenu));
hud.buildButton?.addEventListener("click", () => runHudAction(openBuildMenu));
hud.upgradeMenuButton?.addEventListener("click", () => runHudAction(openUpgradeMenu));
hud.customizeButton?.addEventListener("click", () => runHudAction(openCharacterCreator));
hud.helpButton?.addEventListener("click", () => runHudAction(openHelpMenu));
hud.pauseButton?.addEventListener("click", () => runHudAction(togglePause));
hud.resumeFromPause?.addEventListener("click", () => setPaused(false));
hud.pauseMainMenu?.addEventListener("click", openMainMenu);
hud.zoomOutButton?.addEventListener("click", () => adjustCameraZoom(0.82));
hud.zoomResetButton?.addEventListener("click", resetCameraZoom);
hud.zoomInButton?.addEventListener("click", () => adjustCameraZoom(1.22));
hud.buildTrayToggle?.addEventListener("click", () => {
  if (paused) return;
  buildTrayCollapsed = !buildTrayCollapsed;
  renderBuildTray();
  updateHud(0);
});
hud.fortHealthCard?.addEventListener("click", openFortMenu);

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
    event.preventDefault();
    keys.add(key);
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

async function init() {
  await loadGameConfig();
  await loadLearningTasks();
  await loadClothingAssets();
  await loadSprites();
  resize();
  renderBuildTray();
  for (let i = 0; i < 5; i += 1) {
    spawnResource("wood", fort.x - 180 + Math.random() * 180, fort.entrance.y - 110 + Math.random() * 220, 1);
  }
  setMessage("Start by gathering wood from trees and food from berry bushes. Wood fuels heat; food becomes meals.", 8);
  window.requestAnimationFrame(frame);
}

init();
