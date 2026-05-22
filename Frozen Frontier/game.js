const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");

const hud = {
  phaseLabel: document.querySelector("#phaseLabel"),
  playerIconButton: document.querySelector("#playerIconButton"),
  playerIconImage: document.querySelector("#playerIconImage"),
  playerLevelBadge: document.querySelector("#playerLevelBadge"),
  cycleText: document.querySelector("#cycleText"),
  cycleFill: document.querySelector("#cycleFill"),
  quickWoodText: document.querySelector("#quickWoodText"),
  quickDiningMealText: document.querySelector("#quickDiningMealText"),
  quickVisitorChip: document.querySelector("#quickVisitorChip"),
  quickVisitorText: document.querySelector("#quickVisitorText"),
  quickResidentChip: document.querySelector("#quickResidentChip"),
  quickResidentText: document.querySelector("#quickResidentText"),
  zoomOutButton: document.querySelector("#zoomOutButton"),
  zoomResetButton: document.querySelector("#zoomResetButton"),
  zoomInButton: document.querySelector("#zoomInButton"),
  furnaceMeterCard: document.querySelector("#furnaceMeterCard"),
  furnaceFuelText: document.querySelector("#furnaceFuelText"),
  furnaceFuelMeter: document.querySelector("#furnaceFuelMeter"),
  generatorAlert: document.querySelector("#generatorAlert"),
  cabinHungerCard: document.querySelector("#cabinHungerCard"),
  cabinHungerText: document.querySelector("#cabinHungerText"),
  cabinHungerMeter: document.querySelector("#cabinHungerMeter"),
  hungerAlert: document.querySelector("#hungerAlert"),
  woodCount: document.querySelector("#woodCount"),
  lettuceCount: document.querySelector("#lettuceCount"),
  meatCount: document.querySelector("#meatCount"),
  mealCount: document.querySelector("#mealCount"),
  survivorCount: document.querySelector("#survivorCount"),
  learningPointCount: document.querySelector("#learningPointCount"),
  playerLevelCount: document.querySelector("#playerLevelCount"),
  waveCount: document.querySelector("#waveCount"),
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
  repairAllButton: document.querySelector("#repairAllButton"),
  repairAllCost: document.querySelector("#repairAllCost"),
  buildTrayBody: document.querySelector("#buildTrayBody"),
  buildScrollLeft: document.querySelector("#buildScrollLeft"),
  buildScrollRight: document.querySelector("#buildScrollRight"),
  pauseBadge: document.querySelector("#pauseBadge"),
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
  blueberries: { label: "Blueberries", short: "BL", color: "#5078e7", stack: "#334893" },
  salmonberries: { label: "Salmonberries", short: "SB", color: "#ff8b6b", stack: "#b85157" },
  crowberries: { label: "Crowberries", short: "CB", color: "#9266d9", stack: "#50327d" },
  berries: { label: "Stored Berries", short: "BR", color: "#d94c7c", stack: "#8d2b57" },
  deerMeat: { label: "Venison", short: "VN", color: "#d78362", stack: "#9a4e3a" },
  wolfMeat: { label: "Wolf Meat", short: "WM", color: "#b95b59", stack: "#773836" },
  eagleMeat: { label: "Eagle Meat", short: "EM", color: "#d8a36c", stack: "#9d6b3f" },
  ptarmiganMeat: { label: "Ptarmigan Meat", short: "PM", color: "#ead6bb", stack: "#a47d60" },
  birdMeat: { label: "Stored Game Bird", short: "GB", color: "#d8a36c", stack: "#9d6b3f" },
  meat: { label: "Stored Meat", short: "MT", color: "#d65d58", stack: "#9a3633" },
  meal: { label: "Meal", short: "ML", color: "#ffcb72", stack: "#d99135" }
};

const berryFoodTypes = ["blueberries", "salmonberries", "crowberries"];
const meatFoodTypes = ["deerMeat", "wolfMeat", "eagleMeat", "ptarmiganMeat"];
const rawFoodTypes = ["lettuce", ...berryFoodTypes, ...meatFoodTypes, "berries", "birdMeat", "meat"];
const berryBushStyles = {
  blueberries: { label: "Blueberry Bush", foliage: "#254f3e", bright: "#39785c", berry: "#5078e7", berryShape: "round" },
  salmonberries: { label: "Salmonberry Thicket", foliage: "#31523b", bright: "#4a7d4b", berry: "#ff8b6b", berryShape: "cluster" },
  crowberries: { label: "Crowberry Mat", foliage: "#1d4038", bright: "#2d6857", berry: "#9266d9", berryShape: "oval" }
};

const recipeCatalog = [
  {
    id: "wildBerryCup",
    name: "Wild Berry Cup",
    copy: "A fast warm cup of gathered berries.",
    ingredients: [{ type: "wildBerry", amount: 1, label: "any wild berry" }],
    meals: 1,
    starter: true
  },
  {
    id: "lettuceBroth",
    name: "Lettuce Broth",
    copy: "A quick green broth learned from the first farm leaf.",
    unlockOnIngredient: "lettuce",
    ingredients: [{ type: "lettuce", amount: 1 }],
    meals: 1,
    site: false
  },
  {
    id: "blueberryMash",
    name: "Blueberry Mash",
    copy: "A bright berry mash that needs only blueberries.",
    unlockOnIngredient: "blueberries",
    ingredients: [{ type: "blueberries", amount: 1 }],
    meals: 1,
    site: false
  },
  {
    id: "salmonberryCup",
    name: "Salmonberry Cup",
    copy: "A warm cup of tart salmonberries.",
    unlockOnIngredient: "salmonberries",
    ingredients: [{ type: "salmonberries", amount: 1 }],
    meals: 1,
    site: false
  },
  {
    id: "crowberryTea",
    name: "Crowberry Tea",
    copy: "A dark warming tea from fresh crowberries.",
    unlockOnIngredient: "crowberries",
    ingredients: [{ type: "crowberries", amount: 1 }],
    meals: 1,
    site: false
  },
  {
    id: "venisonRoast",
    name: "Venison Roast",
    copy: "A simple roast from a fresh deer hunt.",
    unlockOnIngredient: "deerMeat",
    ingredients: [{ type: "deerMeat", amount: 1 }],
    meals: 1,
    site: false
  },
  {
    id: "wolfJerky",
    name: "Wolf Jerky",
    copy: "A careful strip of wolf meat dried over camp heat.",
    unlockOnIngredient: "wolfMeat",
    ingredients: [{ type: "wolfMeat", amount: 1 }],
    meals: 1,
    site: false
  },
  {
    id: "eagleSkewer",
    name: "Eagle Skewer",
    copy: "A fast skewer made from an eagle hunt.",
    unlockOnIngredient: "eagleMeat",
    ingredients: [{ type: "eagleMeat", amount: 1 }],
    meals: 1,
    site: false
  },
  {
    id: "ptarmiganRoast",
    name: "Ptarmigan Roast",
    copy: "A small roast from a willow ptarmigan.",
    unlockOnIngredient: "ptarmiganMeat",
    ingredients: [{ type: "ptarmiganMeat", amount: 1 }],
    meals: 1,
    site: false
  },
  {
    id: "forestSalad",
    name: "Forest Salad",
    copy: "Lettuce and bright berries make a filling cold lunch.",
    ingredients: [{ type: "lettuce", amount: 1 }, { type: "wildBerry", amount: 1, label: "any wild berry" }],
    meals: 2
  },
  {
    id: "venisonStew",
    name: "Venison Stew",
    copy: "A heavy stew built from venison and cellar greens.",
    ingredients: [{ type: "deerMeat", amount: 1 }, { type: "lettuce", amount: 1 }],
    meals: 3
  },
  {
    id: "hunterSkillet",
    name: "Hunter Skillet",
    copy: "Wolf meat cooks down with tart crowberries.",
    ingredients: [{ type: "wolfMeat", amount: 1 }, { type: "crowberries", amount: 1 }],
    meals: 2
  },
  {
    id: "skyTrailRoast",
    name: "Sky Trail Roast",
    copy: "Ptarmigan and salmonberries travel well after a long day.",
    ingredients: [{ type: "ptarmiganMeat", amount: 1 }, { type: "salmonberries", amount: 1 }],
    meals: 3
  },
  {
    id: "frontierPlatter",
    name: "Frontier Platter",
    copy: "A feast that uses every part of a successful hunt.",
    ingredients: [{ type: "deerMeat", amount: 1 }, { type: "eagleMeat", amount: 1 }, { type: "blueberries", amount: 1 }],
    meals: 4
  }
];

const buildingData = {
  furnace: {
    id: "furnace",
    name: "Generator",
    x: 4280,
    y: 3480,
    w: 150,
    h: 130,
    color: "#4f4a55",
    roof: "#2c2032",
    level: 1,
    upgradeCost: 18,
    fuel: 50,
    maxFuel: 100,
    hatchPulse: 0,
    task: "Burns logs from Storage Sheds to power towers and camp work."
  },
  storageShed: {
    id: "storageShed",
    name: "Storage Shed",
    x: 4100,
    y: 3480,
    w: 150,
    h: 130,
    color: "#5b4b3c",
    roof: "#345246",
    level: 1,
    upgradeCost: 14,
    task: "Shared wood storage. Any Storage Shed adds to and draws from the same wood inventory."
  },
  rootCellar: {
    id: "rootCellar",
    name: "Root Cellar",
    x: 4310,
    y: 3685,
    w: 150,
    h: 118,
    color: "#4c4339",
    roof: "#243528",
    level: 1,
    upgradeCost: 18,
    task: "Shared raw food storage. Drop berries, greens, and hunted meat here for recipes."
  },
  foodPrep: {
    id: "foodPrep",
    name: "Kitchen Hall",
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
    serveProgress: 0,
    servedPulse: 0,
    task: "Cooks Root Cellar recipes and serves finished meals through its dining window."
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
    task: "Houses recruited Experts and increases Expert capacity when upgraded."
  },
};

const dropoffs = {
  wood: { x: 4375, y: 3635, label: "Storage Shed" },
  food: { x: 4385, y: 3724, label: "Root Cellar" },
  cabin: { x: 4570, y: 3565, label: "Cabin Table" }
};

const specialtyCatalog = [
  {
    id: "hunter",
    title: "Hunter",
    bonus: "Hunts deer and birds, then carries meat to Root Cellars.",
    names: ["Mara Pike", "Rowan Holt", "Kira Vale"]
  },
  {
    id: "forager",
    title: "Forager",
    bonus: "Gathers berry bushes and stocks Root Cellars.",
    names: ["Wren Alder", "Silas Berry", "Mika Spruce"]
  },
  {
    id: "cook",
    title: "Chef",
    bonus: "Cooks raw food into meals.",
    names: ["Eli Brooks", "Talia Reed", "Nora Lake"]
  },
  {
    id: "courier",
    title: "Courier",
    bonus: "Collects loose camp resources and carries them to collection points.",
    names: ["Pax Mercer", "Remy Flint", "Skye Brass"]
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
    bonus: "Building upgrades and repairs cost less wood.",
    names: ["Niko Lane", "Sasha Cole", "Theo North"]
  },
  {
    id: "doctor",
    title: "Doctor",
    bonus: "Heals hurt NPCs from Medical Tents and field rounds.",
    names: ["Dr. Ada Snow", "Dr. Leo Quinn", "Dr. Mina Shore"]
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
    nightSeconds: 120,
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
      { id: "blue", label: "Boiler Teal", color: "#315b67" },
      { id: "orange", label: "Copper Orange", color: "#b7643e" },
      { id: "green", label: "Pine Canvas", color: "#4d6b45" },
      { id: "red", label: "Oxblood Red", color: "#7b3f34" },
      { id: "purple", label: "Workshop Violet", color: "#4a3a58" },
      { id: "yellow", label: "Brass Gold", color: "#d89b34" }
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
  resources: {
    groundTtlSeconds: 60,
    popSeconds: 0.35
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
    baseProcessSeconds: 6.4,
    levelReductionSeconds: 0.45,
    cookReductionSeconds: 0,
    minProcessSeconds: 0.75,
    cookingMiniGame: {
      roundSeconds: 6,
      minimumWordLength: 3,
      baseWordBonusFraction: 0.055,
      letterBonusFraction: 0.012,
      speedBonusFraction: 0.045,
      streakBonusFraction: 0.01,
      maxStreakBonusFraction: 0.04,
      clearBoardBonusFraction: 0.08,
      correctTimeGainSeconds: 0.55,
      wrongTimePenaltySeconds: 1.1,
      wordBank: [
        "ate", "eat", "tea", "team", "steam", "steak", "stake", "take", "late", "plate", "map", "mat", "mate", "loam", "oak",
        "ice", "pie", "piece", "spice", "stew", "wet", "pew", "heat", "heap", "pan", "pans", "pants",
        "broth", "rot", "saute", "sat", "meat", "step", "seat", "same", "mane", "pane"
      ],
      boards: [
        { letters: "STEAPLAMROATSTEK", words: ["steam", "plate", "team", "tea", "eat", "ate"] },
        { letters: "SPICETEWHEATPANS", words: ["spice", "ice", "stew", "heat", "pan", "pea", "tea"] },
        { letters: "BROTSAUHMETEPANS", words: ["broth", "saute", "meat", "pan", "ate"] }
      ]
    }
  },
  cabin: {
    baseHungerGainPerSecond: 0.11,
    survivorHungerGainPerSecond: 0.018,
    residentHungerGainPerSecond: 0.006,
    levelHungerReductionPerSecond: 0.01,
    minHungerGainPerSecond: 0.04,
    mealUseSeconds: 26,
    diningServeSeconds: 10,
    mealHungerRelief: 12,
    cookMealReliefBonus: 0,
    emptyDiningHungerMultiplier: 7,
    mealPopulationSpeedBonus: 0.18
  },
  furnace: {
    baseFuelDrainPerSecond: 0.42,
    levelDrainReductionPerSecond: 0.08,
    minFuelDrainPerSecond: 0.12,
    outageProductivityMultiplier: 0.25,
    woodLoadAmount: 5,
    fuelPerWood: 7
  },
  trees: {
    chopSeconds: 15,
    lumberjackReductionSeconds: 1.1,
    minChopSeconds: 1.4,
    progressDecayPerSecond: 0.45,
    respawnSeconds: 225,
    woodDrops: 5,
    clumps: 35,
    treesPerClump: 6,
    clumpRadius: 170,
    fenceClearGridSpaces: 5,
    berryBushRatio: 0.1,
    berryGatherSeconds: 3,
    berryRespawnSeconds: 165,
    berryDrops: 3,
    chopMiniGame: {
      segmentCount: 4,
      correctBonusFraction: 0.25,
      correctWoodBonus: 2,
      correctBerryBonus: 2,
      wrongPenaltyFraction: 0.1,
      startDelaySeconds: 1,
      endDelaySeconds: 1,
      zoom: 1
    }
  },
  worldGeneration: {
    groundPatchCount: 130,
    lakeMinCount: 3,
    lakeMaxCount: 5,
    lakeMinCoverage: 0.2,
    lakeMaxCoverage: 0.3
  },
  combat: {
    baseArrowCooldown: 0.56,
    towerArrowCooldown: 0.32,
    baseArrowDamage: 22,
    damageGrowthMultiplier: 1.61803398875,
    towerDamageMultiplier: 2.15,
    guardDamageMultiplier: 0.25,
    baseRange: 270,
    towerRange: 380,
    wolfMinSpeed: 58,
    wolfMaxSpeed: 76,
    wolfBaseHp: 144,
    wolfBonusHp: 45,
    wolfDamage: 5,
    wolfAttackSeconds: 1.1,
    wolfAttackRandomDelay: 0.4,
    wolfRaidMinCount: 2,
    wolfRaidBonusCount: 2,
    arrowSeconds: 0.18,
    waveBaseCount: 3,
    waveCountPerTier: 20,
    waveHpPerTier: 40,
    waveDamagePerTier: 1,
    waveSpeedPerTier: 3,
    eagleStartWave: 2,
    eagleBaseHp: 94,
    eagleSpeed: 104,
    eagleDamage: 4,
    eagleAttackSeconds: 1.35,
    eagleEveryWaves: 2,
    eagleBonusPerTier: 1,
    groundDamageMultiplier: 4
  },
  deer: {
    count: 10,
    hp: 132,
    speed: 42,
    fleeSpeed: 148,
    fleeSeconds: 7,
    roamRadius: 520,
    meatDrops: 2
  },
  ptarmigan: {
    count: 8,
    hp: 52,
    speed: 84,
    fleeSpeed: 150,
    roamRadius: 460,
    meatDrops: 1
  },
  medical: {
    patientThreshold: 0.7,
    tentHealPerSecond: 1.4,
    doctorHealPerSecond: 2.5,
    fieldHealRange: 34
  },
  variableFlow: {
    machineCount: 5,
    respawnDays: 5,
    baseLearningPointReward: 6
  },
  build: {
    fenceCost: 4,
    fenceHealth: 70,
    gateCost: 10,
    gateHealth: 95,
    outpostCost: 28,
    outpostHealth: 90,
    cabinCost: 2000,
    storageShedCost: 50,
    rootCellarCost: 60,
    blacksmithCost: 90,
    medicalTentCost: 80,
    foodPrepCost: 50,
    farmCost: 55,
    welcomeCenterCost: 120,
    houseCost: 70,
    shrubCost: 8,
    torchCost: 10,
    pathCost: 2,
    fountainCost: 35,
    benchCost: 12,
    largeFountainCost: 95,
    statueCost: 75,
    gardenCost: 55,
    hunterPostCost: 70,
    signalTowerCost: 85,
    iceTrapCost: 60,
    welcomeCenterPlayerLevel: 10,
    advancedTowerPlayerLevel: 5,
    blacksmithPlayerLevel: 4,
    storageShedPlayerLevel: 12,
    medicalTentPlayerLevel: 3,
    foodPrepPlayerLevel: 14,
    signalTowerPlayerLevel: 8,
    iceTrapPlayerLevel: 12,
    cabinPlayerLevel: 30
  },
  city: {
    houseCapacity: 5,
    visitorIntervalSeconds: 55,
    visitorChance: 0.7,
    maxVisitors: 3,
    residentSpeed: 62,
    visitorSpeed: 58,
    interactionSeconds: 3.4,
    roamRadius: 260
  },
  towers: {
    outpost: { range: 250, damage: 24, cooldown: 1.45 },
    hunterPost: { range: 310, damage: 40, cooldown: 1.25 },
    signalTower: { range: 280, damage: 16, cooldown: 1.7, netSeconds: 3 },
    iceTrap: { range: 170, damage: 8, cooldown: 2.2, slow: 0.45 },
    rangeGrowthMultiplier: 1.12,
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
    routeRefreshSeconds: 1.2,
    routeSearchCells: 10000,
    pathMoveCost: 0.58,
    lumberjackWorkSeconds: 9,
    lumberjackLowLevelWoodAmount: 5,
    lumberjackHighLevelWoodAmount: 10,
    lumberjackHighLevelThreshold: 6,
    farmerWorkSeconds: 11,
    farmerFoodAmount: 1,
    foragerWorkSeconds: 6,
    foragerBerryAmount: 3,
    cookWorkSecondsMultiplier: 1,
    engineerBuildReductionPerSecond: 0.35,
    hunterArrowCooldown: 1.25,
    hunterArrowDamage: 14,
    guardArrowCooldown: 1.55,
    guardArrowDamage: 10,
    retrainLearningCost: 10,
    retrainWoodCost: 200
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
    buildingCostMultiplier: 1.61803398875,
    furnaceFuelCapacityBonus: 25,
    cabinHungerMaxBonus: 20,
    cabinUpgradeHungerRelief: 12,
    fortRepairHealthPerWood: 10,
    repairCostMultiplier: 3
  },
  blacksmith: {
    baseBasketPointCost: 8,
    baseWeaponPointCost: 10,
    pointCostMultiplier: 1.61803398875,
    basketCapacityBonus: 5,
    weaponDamageMultiplier: 1.22,
    weaponFireRateMultiplier: 1.14
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
    foodPrep: "assets/sprites/food-prep-sheet.png",
    storageShed: "assets/sprites/storage-shed-sheet.png",
    house: "assets/sprites/house-sheet.png",
    welcomeCenter: "assets/sprites/welcome-center-sheet.png",
    tower: "assets/sprites/tower-sheet.png",
    outpost: "assets/sprites/outpost-sheet.png",
    hunterPost: "assets/sprites/hunter-post-sheet.png",
    signalTower: "assets/sprites/net-tower-sheet.png",
    iceTrap: "assets/sprites/ice-trap-sheet.png",
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
    deer: "assets/sprites/deer-sheet.png",
    wood: "assets/sprites/wood-sheet.png",
    lettuce: "assets/sprites/lettuce-sheet.png",
    meat: "assets/sprites/meat-sheet.png",
    meal: "assets/sprites/meal-sheet.png",
    fortWall: "assets/sprites/fort-wall-sheet.png"
  },
  spriteFrames: {
    furnace: 4,
    cabin: 4,
    foodPrep: 4,
    storageShed: 4,
    house: 4,
    welcomeCenter: 4,
    tower: 4,
    outpost: 4,
    hunterPost: 4,
    signalTower: 4,
    iceTrap: 4,
    farm: 4,
    tree: 7,
    wolf: 7,
    eagle: 8,
    deer: 7,
    ptarmigan: 6,
    wood: 4,
    lettuce: 4,
    meat: 4,
    meal: 4,
    fortWall: 4
  },
  spriteRows: {
    furnace: 10,
    cabin: 10,
    foodPrep: 10,
    storageShed: 10,
    house: 10,
    welcomeCenter: 10,
    tower: 3,
    outpost: 10,
    hunterPost: 10,
    signalTower: 10,
    iceTrap: 10,
    farm: 10,
    tree: 4,
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
    "visitor-yellow": 3,
    wolf: 2,
    eagle: 2,
    deer: 3,
    ptarmigan: 1
  },
  animation: {
    spriteFps: 7,
    walkFps: 8,
    buildingFps: 2.6
  }
};

let gameConfig = clone(defaultGameConfig);
const spriteImages = {};
const spriteFrameBoundsCache = new Map();
const clothingImages = {};
const tintedClothingCache = new Map();
const actorIconCache = new Map();
let spritesReady = false;
let clothingReady = false;

const outfitCategories = [
  { id: "head", label: "Head", folder: "heads", colors: ["#f2a65e", "#c98252", "#8f5a3a", "#f7c99a"], count: 10 },
  { id: "hat", label: "Hat", folder: "hats", colors: ["#2f261f", "#8f5a2f", "#1d3b45", "#7b3f34"] },
  { id: "shirt", label: "Shirt", folder: "shirts", colors: ["#315b67", "#7b3f34", "#4d6b45", "#d89b34"] },
  { id: "pants", label: "Pants", folder: "pants", colors: ["#3d3229", "#314652", "#5a4936", "#4a3a58"] },
  { id: "shoes", label: "Shoes", folder: "shoes", colors: ["#2b211b", "#704d2e", "#1f2e36", "#5b3b2e"] }
];

const clothingAssetVersion = "steam-4";

const storageKey = "frozen-frontier-base-v28";
const keys = new Set();
const friendlyRouteCache = new WeakMap();
const groundEnemyRouteCache = new WeakMap();
let heldMove = { x: 0, y: 0 };
let touchMove = null;
const activeTouchPointers = new Map();
let pinchZoom = null;
let cursorScreen = { x: 0, y: 0, active: false };
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
let repairMode = false;
let selectedMoveTarget = null;
let movePreview = null;
let buildTrayCollapsed = true;
let buildTrayRenderKey = "";
const buildTrayGroupState = {
  tools: true,
  defense: true,
  survival: true,
  settlement: false,
  decor: false
};
let actionsCollapsed = true;
let paused = false;
let modalPauseActive = false;
let suppressNextCanvasClick = false;
let wolfCheckTimer = 0;
let survivorCheckTimer = 0;
let attackActive = false;
let arrowCooldown = 0;
let starterTowerCooldown = 0;
let messageTimer = 0;
let saveTimer = 0;
let audioContext = null;
let audioUnlocked = false;
let dismissedUpgradeNoticeAt = -1;
let notificationMarkup = "";
let centerToastTimer = 0;
let recentLearningTaskIds = [];
let pendingCarry = 0;
let notifications = [];
let residentDeathNotices = [];
let cityVisitorTimer = 0;
let woodChopMiniGame = null;
let woodChopReturnZoom = null;
let cookingMiniGame = null;
let variableFlowGame = null;
let enteredMachineSiteId = null;
let cookingTracePointer = null;

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
  stored: { wood: 18, lettuce: 0, blueberries: 0, salmonberries: 0, crowberries: 0, berries: 0, deerMeat: 0, wolfMeat: 0, eagleMeat: 0, ptarmiganMeat: 0, birdMeat: 0, meat: 0, meal: 0 },
  carry: { wood: 0, lettuce: 0, blueberries: 0, salmonberries: 0, crowberries: 0, berries: 0, deerMeat: 0, wolfMeat: 0, eagleMeat: 0, ptarmiganMeat: 0, birdMeat: 0, meat: 0, meal: 0 },
  survivors: [],
  expertSpecialtyBag: [],
  cityResidents: [],
  cityVisitors: [],
  city: { visitorTimer: 0 },
  visitor: null,
  buildings: {},
  fortLevel: 1,
  fortUpgradeCost: 35,
  learningPoints: 0,
  blacksmithTech: { basket: 0, weapon: 0 },
  playerLevel: 1,
  structures: [],
  wave: { number: 0, timer: defaultGameConfig.timers.daySeconds, active: false, survivorCooldown: 0, interWaveVisitorPending: false, spawnTimer: 0, nightSpawned: 0 },
  towerStationedResidentId: null,
  towerInstructionShown: false,
  tutorialFlags: { basics: false, furnaceUpgrade: false, foodUpgrade: false, cabinUpgrade: false, blacksmithUnlock: false, cityUnlock: false },
  unlockedRecipes: recipeCatalog.filter((recipe) => recipe.starter).map((recipe) => recipe.id),
  machineCooldowns: {},
  cooldowns: {},
  upgradeJobs: [],
  worldSeed: "",
  seedChosen: false
};

let state = loadState();
let buildings = hydrateBuildings();
syncDropoffsToBuildings();
let resources = [];
let trees = [];
let recipeSites = [];
let machineSites = [];
let wolves = [];
let deer = [];
let ptarmigans = [];
let arrows = [];
let flies = [];
let particles = [];
let groundPatches = [];
let lakes = [];
let snow = createSnow();
state.player = normalizePlayer(state.player);
state.survivors = state.survivors.map((survivor, index) => normalizeSurvivor(survivor, index));
state.cityResidents = (state.cityResidents || []).map((resident, index) => normalizeCityPerson(resident, index, "resident"));
state.cityVisitors = (state.cityVisitors || []).map((visitor, index) => normalizeCityPerson(visitor, index, "visitor"));
if (!state.structures.length) state.structures = createInitialDefenseStructures();
syncCabinLinkedUpgrades(buildings.cabin.level);
state.wave = normalizeNightCycleState({ ...defaultState.wave, ...(state.wave || {}) });
trees = createTrees();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeBlacksmithTech(saved = {}) {
  const legacy = saved.playerUpgrades || {};
  const tech = saved.blacksmithTech || {};
  return {
    basket: Math.max(0, Math.round(tech.basket || legacy.carry || 0)),
    weapon: Math.max(0, Math.round(tech.weapon || legacy.attack || 0))
  };
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
      blacksmithTech: normalizeBlacksmithTech(parsed),
      playerLevel: parsed.playerLevel || defaultState.playerLevel,
      structures: Array.isArray(parsed.structures) ? parsed.structures : [],
      wave: { ...defaultState.wave, ...(parsed.wave || {}) },
      towerStationedResidentId: parsed.towerStationedResidentId || null,
      tutorialFlags: { ...defaultState.tutorialFlags, ...(parsed.tutorialFlags || {}) },
      cooldowns: parsed.cooldowns || {},
      upgradeJobs: Array.isArray(parsed.upgradeJobs) ? parsed.upgradeJobs : [],
      survivors: Array.isArray(parsed.survivors) ? parsed.survivors : [],
      expertSpecialtyBag: Array.isArray(parsed.expertSpecialtyBag) ? parsed.expertSpecialtyBag : [],
      cityResidents: Array.isArray(parsed.cityResidents) ? parsed.cityResidents : [],
      cityVisitors: Array.isArray(parsed.cityVisitors) ? parsed.cityVisitors : [],
      city: { ...defaultState.city, ...(parsed.city || {}) },
      buildings: parsed.buildings || {},
      machineCooldowns: parsed.machineCooldowns || {},
      unlockedRecipes: Array.isArray(parsed.unlockedRecipes) && parsed.unlockedRecipes.length
        ? parsed.unlockedRecipes
        : [...defaultState.unlockedRecipes],
      worldSeed: parsed.worldSeed || "",
      seedChosen: Boolean(parsed.seedChosen)
    };
  } catch (error) {
    return clone(defaultState);
  }
}

function saveState() {
  state.buildings = {};
  Object.values(buildings).forEach((building) => {
    state.buildings[building.id] = {
      x: building.x,
      y: building.y,
      w: building.w,
      h: building.h,
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
      processProgress: building.processProgress,
      serveProgress: building.serveProgress,
      wordMealBonus: building.wordMealBonus,
      selectedRecipeId: building.selectedRecipeId
    };
  });
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
  const legacyDiningMeals = state.buildings.diningHall?.meals || 0;
  if (legacyDiningMeals && result.foodPrep) {
    result.foodPrep.meals = (result.foodPrep.meals || 0) + legacyDiningMeals;
  }
  fort.maxHealth = fortMaxHealth();
  fort.health = fort.maxHealth;
  Object.values(result).forEach((building) => snapBuildingPositionToGrid(building));
  return result;
}

function hashSeed(seed) {
  const text = String(seed || "frozen-frontier");
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRandom(seed) {
  let value = hashSeed(seed);
  return () => {
    value += 0x6D2B79F5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomBetween(rng, min, max) {
  return min + rng() * (max - min);
}

function currentWorldSeed() {
  if (!state.worldSeed) state.worldSeed = String(Math.floor(Math.random() * 1000000000));
  return state.worldSeed;
}

function generateWorldLayout() {
  const rng = createSeededRandom(currentWorldSeed());
  groundPatches = createGroundPatches(rng);
  lakes = createLakes(rng);
  trees = createTrees(rng);
  recipeSites = createRecipeSites(rng);
  machineSites = createBrokenMachineSites(rng);
  deer = createDeer(rng);
  ptarmigans = createPtarmigans(rng);
}

function createGroundPatches(rng) {
  const config = gameConfig.worldGeneration || defaultGameConfig.worldGeneration;
  const colors = [
    { type: "grass", color: "rgba(64, 116, 83, 0.18)" },
    { type: "gravel", color: "rgba(188, 197, 197, 0.12)" },
    { type: "moss", color: "rgba(83, 137, 95, 0.11)" }
  ];
  return Array.from({ length: config.groundPatchCount || 120 }, (_, index) => {
    const choice = colors[Math.floor(rng() * colors.length)];
    return {
      id: `ground-${index}`,
      type: choice.type,
      color: choice.color,
      x: randomBetween(rng, 80, world.width - 80),
      y: randomBetween(rng, 80, world.height - 80),
      rx: randomBetween(rng, 80, 260),
      ry: randomBetween(rng, 32, 116),
      rot: randomBetween(rng, -0.8, 0.8),
      flecks: Math.floor(randomBetween(rng, 3, 9))
    };
  });
}

function createLakes(rng) {
  const config = gameConfig.worldGeneration || defaultGameConfig.worldGeneration;
  const minCount = config.lakeMinCount || 3;
  const maxCount = Math.max(minCount, config.lakeMaxCount || 5);
  const count = minCount + Math.floor(rng() * (maxCount - minCount + 1));
  const coverage = randomBetween(rng, config.lakeMinCoverage || 0.2, config.lakeMaxCoverage || 0.3);
  const targetArea = world.width * world.height * coverage;
  const lakeArea = targetArea / count;
  const result = [];
  for (let i = 0; i < count; i += 1) {
    let center = null;
    for (let attempt = 0; attempt < 80; attempt += 1) {
      const candidate = {
        x: randomBetween(rng, 450, world.width - 450),
        y: randomBetween(rng, 380, world.height - 380)
      };
      if (pointInRect(candidate, fort, 1600)) continue;
      center = candidate;
      break;
    }
    if (!center) center = { x: 700 + i * 900, y: 700 + i * 520 };
    const aspect = randomBetween(rng, 0.72, 1.45);
    const rx = Math.sqrt(lakeArea / Math.PI * aspect);
    const ry = Math.sqrt(lakeArea / Math.PI / aspect);
    const blobCount = 5 + Math.floor(rng() * 4);
    const blobs = Array.from({ length: blobCount }, (_, index) => {
      const angle = (Math.PI * 2 * index) / blobCount + randomBetween(rng, -0.35, 0.35);
      const radius = index === 0 ? 0 : randomBetween(rng, 0.18, 0.52);
      return {
        x: clamp(center.x + Math.cos(angle) * rx * radius, 180, world.width - 180),
        y: clamp(center.y + Math.sin(angle) * ry * radius, 180, world.height - 180),
        rx: rx * randomBetween(rng, 0.42, 0.76),
        ry: ry * randomBetween(rng, 0.42, 0.78),
        rot: randomBetween(rng, -0.55, 0.55)
      };
    });
    const speckles = Array.from({ length: 26 + Math.floor(rng() * 18) }, () => {
      const blob = blobs[Math.floor(rng() * blobs.length)];
      const angle = rng() * Math.PI * 2;
      const radius = Math.sqrt(rng()) * 0.78;
      return {
        x: blob.x + Math.cos(angle) * blob.rx * radius,
        y: blob.y + Math.sin(angle) * blob.ry * radius,
        rx: randomBetween(rng, 10, 34),
        ry: randomBetween(rng, 4, 13),
        rot: randomBetween(rng, -0.8, 0.8),
        alpha: randomBetween(rng, 0.12, 0.24)
      };
    });
    result.push({ id: `lake-${i}`, x: center.x, y: center.y, blobs, speckles });
  }
  return result;
}

function pointInLake(point, padding = 0) {
  return lakes.some((lake) => lake.blobs.some((blob) => {
    const cos = Math.cos(-(blob.rot || 0));
    const sin = Math.sin(-(blob.rot || 0));
    const dx = point.x - blob.x;
    const dy = point.y - blob.y;
    const x = dx * cos - dy * sin;
    const y = dx * sin + dy * cos;
    const rx = blob.rx + padding;
    const ry = blob.ry + padding;
    return (x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1;
  }));
}

function rectTouchesWater(rect) {
  const samples = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.w, y: rect.y },
    { x: rect.x, y: rect.y + rect.h },
    { x: rect.x + rect.w, y: rect.y + rect.h },
    { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 }
  ];
  return samples.some((point) => pointInLake(point, 18));
}

function createTrees(rng = Math.random) {
  const config = gameConfig.trees || defaultGameConfig.trees;
  const size = gridSize();
  const clearance = (config.fenceClearGridSpaces || 5) * size;
  const points = [];
  const clumps = config.clumps || 7;
  const treesPerClump = config.treesPerClump || 6;
  let attempts = 0;
  const maxAttempts = Math.max(900, clumps * treesPerClump * 70);
  while (points.length < clumps * treesPerClump && attempts < maxAttempts) {
    attempts += 1;
    const center = {
      x: 160 + rng() * (world.width - 320),
      y: 160 + rng() * (world.height - 320)
    };
    if (!treePointAllowed(center, clearance)) continue;
    for (let i = 0; i < treesPerClump; i += 1) {
      const angle = rng() * Math.PI * 2;
      const radius = 24 + rng() * (config.clumpRadius || 170);
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
    shake: 0,
    spriteRow: Math.floor(rng() * spriteRowCount("tree"))
  }));
  const bushCount = Math.max(1, Math.round(treesList.length * (config.berryBushRatio || 0.1)));
  for (let i = 0; i < bushCount; i += 1) {
    for (let attempt = 0; attempt < 80; attempt += 1) {
      const point = {
        x: 140 + rng() * (world.width - 280),
        y: 130 + rng() * (world.height - 260)
      };
      const tooClose = treesList.some((tree) => dist(point, tree) < 80);
      if (tooClose || !treePointAllowed(point, clearance)) continue;
      treesList.push({
        id: `berry-bush-${i}`,
        type: "berryBush",
        berryType: berryFoodTypes[Math.floor(rng() * berryFoodTypes.length)],
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

function createRecipeSites(rng = Math.random) {
  return recipeCatalog
    .filter((recipe) => !recipe.starter && recipe.site !== false && !recipe.unlockOnIngredient)
    .map((recipe, index) => {
      let point = null;
      for (let attempt = 0; attempt < 120; attempt += 1) {
        const candidate = {
          x: 180 + rng() * (world.width - 360),
          y: 180 + rng() * (world.height - 360)
        };
        if (pointInRect(candidate, fort, 900) || pointInLake(candidate, 80) || groundSpawnBlocked(candidate, 60)) continue;
        point = candidate;
        break;
      }
      return {
        id: `recipe-site-${recipe.id}-${index}`,
        recipeId: recipe.id,
        x: point ? point.x : fort.x + fort.w + 560 + index * 180,
        y: point ? point.y : fort.y + 240 + index * 120,
        bob: rng() * Math.PI * 2
      };
    });
}

function createBrokenMachineSites(rng = Math.random) {
  const config = gameConfig.variableFlow || defaultGameConfig.variableFlow;
  const result = [];
  for (let index = 0; index < (config.machineCount || 5); index += 1) {
    let point = null;
    for (let attempt = 0; attempt < 140; attempt += 1) {
      const candidate = {
        x: 220 + rng() * (world.width - 440),
        y: 220 + rng() * (world.height - 440)
      };
      const closeToSite = recipeSites.some((site) => dist(candidate, site) < 240)
        || result.some((site) => dist(candidate, site) < 420);
      const closeToTree = trees.some((tree) => tree.alive && dist(candidate, tree) < 110);
      if (pointInRect(candidate, fort, 920) || pointInLake(candidate, 100) || groundSpawnBlocked(candidate, 80) || closeToSite || closeToTree) continue;
      point = candidate;
      break;
    }
    result.push({
      id: `broken-machine-${index}`,
      x: point ? point.x : fort.x + fort.w + 720 + index * 220,
      y: point ? point.y : fort.y + 340 + index * 150,
      bob: rng() * Math.PI * 2,
      puzzleSeed: Math.floor(rng() * 1000000)
    });
  }
  return result;
}

function treePointAllowed(point, clearance) {
  if (pointInRect(point, fort, 70)) return false;
  if (pointInLake(point, 90)) return false;
  if (groundSpawnBlocked(point, 44)) return false;
  return !state.structures.some((structure) => isBarrierType(structure.type) && dist(point, structure) < clearance);
}

function createDeer(rng = Math.random) {
  const config = gameConfig.deer || defaultGameConfig.deer;
  const herd = [];
  for (let i = 0; i < (config.count || 10); i += 1) {
    const point = randomFreeWorldPoint(rng, 180);
    herd.push({
      id: `deer-${i}`,
      type: "deer",
      x: point.x,
      y: point.y,
      hp: config.hp,
      maxHp: config.hp,
      target: randomFreeWorldPoint(rng, 180),
      walkTime: rng() * 4,
      facing: rng() > 0.5 ? 1 : -1,
      direction: "down",
      grazeTimer: randomBetween(rng, 1, 5),
      fleeTimer: 0,
      hitFlash: 0
    });
  }
  return herd;
}

function createPtarmigans(rng = Math.random) {
  const config = gameConfig.ptarmigan || defaultGameConfig.ptarmigan;
  return Array.from({ length: config.count || 8 }, (_, index) => {
    const point = randomFreeWorldPoint(rng, 180);
    return {
      id: `ptarmigan-${index}`,
      type: "ptarmigan",
      x: point.x,
      y: point.y,
      hp: config.hp,
      maxHp: config.hp,
      target: ptarmiganRoamTarget(point, rng),
      walkTime: rng() * 4,
      facing: rng() > 0.5 ? 1 : -1,
      direction: "right",
      fleeTimer: 0,
      hitFlash: 0,
      altitude: 24 + rng() * 28
    };
  });
}

function randomFreeWorldPoint(rng = Math.random, edge = 120) {
  for (let attempt = 0; attempt < 160; attempt += 1) {
    const point = {
      x: randomBetween(rng, edge, world.width - edge),
      y: randomBetween(rng, edge, world.height - edge)
    };
    if (pointInRect(point, fort, 190)) continue;
    if (pointInLake(point, 46)) continue;
    if (groundSpawnBlocked(point, 26)) continue;
    return point;
  }
  return { x: fort.x - 420, y: fort.y - 420 };
}

function createSnow() {
  const config = gameConfig.snow;
  return Array.from({ length: config.count * 5 }, () => ({
    x: Math.random() * world.width,
    y: Math.random() * world.height,
    r: 1 + Math.random() * 2.6,
    drift: config.minDrift + Math.random() * (config.maxDrift - config.minDrift),
    speed: config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed)
  }));
}

function snowDensityMultiplier() {
  if (!state.wave.active) return 1;
  return 1 + Math.sin(cyclePhaseProgress() * Math.PI) * 4;
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
  if (!buildings || !buildings.furnace || !buildings.storageShed || !buildings.rootCellar || !buildings.foodPrep || !buildings.cabin) return;
  const storage = storageShedDropoff(buildings.storageShed);
  const rootCellar = rootCellarDropoff(buildings.rootCellar);
  dropoffs.wood.x = storage.x;
  dropoffs.wood.y = storage.y;
  dropoffs.food.x = rootCellar.x;
  dropoffs.food.y = rootCellar.y;
  dropoffs.cabin.x = buildings.cabin.x + buildings.cabin.w * 0.31;
  dropoffs.cabin.y = buildings.cabin.y + buildings.cabin.h * 0.62;
}

function structureRect(structure) {
  const size = gridSize();
  if (isBarrierType(structure.type)) return { x: structure.x - size / 2, y: structure.y - size / 2, w: size, h: size };
  if (structure.type === "cabin") return { x: structure.x - 90, y: structure.y - 70, w: 180, h: 130 };
  if (structure.type === "foodPrep") return { x: structure.x - 95, y: structure.y - 65, w: 190, h: 130 };
  if (structure.type === "storageShed") return { x: structure.x - 75, y: structure.y - 65, w: 150, h: 130 };
  if (structure.type === "rootCellar") return { x: structure.x - 78, y: structure.y - 60, w: 156, h: 120 };
  if (structure.type === "medicalTent") return { x: structure.x - 86, y: structure.y - 62, w: 172, h: 124 };
  if (structure.type === "blacksmith") return { x: structure.x - 98, y: structure.y - 70, w: 196, h: 140 };
  if (structure.type === "house") return { x: structure.x - 82, y: structure.y - 64, w: 164, h: 124 };
  if (structure.type === "welcomeCenter") return { x: structure.x - 104, y: structure.y - 68, w: 208, h: 136 };
  if (structure.type === "farm") return { x: structure.x - 80, y: structure.y - 50, w: 160, h: 110 };
  if (isLargeDecorationType(structure.type)) return { x: structure.x - 82, y: structure.y - 66, w: 164, h: 132 };
  if (isDecorationType(structure.type)) return { x: structure.x - size / 2, y: structure.y - size / 2, w: size, h: size };
  return { x: structure.x - 48, y: structure.y - 72, w: 96, h: 126 };
}

function createStructure(type, x, y, extras = {}) {
  const build = gameConfig.build;
  const level = isCabinLinkedStructure(type) ? cabinLinkedLevel() : 1;
  const health = type === "fence" || type === "gate"
    ? barrierMaxHealth(type, level)
    : type === "cabin" || type === "house" || type === "welcomeCenter" || type === "storageShed" || type === "rootCellar" || type === "medicalTent" || type === "blacksmith"
      ? 120
      : type === "farm" || type === "foodPrep"
        ? 85
        : isDecorationType(type)
          ? decorationMaxHealth(level)
          : build.outpostHealth;
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    x,
    y,
    level,
    health,
    maxHealth: health,
    cooldown: Math.random(),
    raw: 0,
    meals: 0,
    selectedRecipeId: recipeCatalog[0].id,
    processProgress: 0,
    produceProgress: 0,
    stationedResidentId: null,
    ...extras
  };
}

function createInitialDefenseStructures() {
  return [];
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
  repairMode = false;
  selectedMoveTarget = null;
  movePreview = null;
  renderBuildTray();
  setMessage(message, 3);
}

function hasSpecialty(id) {
  return state.survivors.some((survivor) => survivor.specialty === id);
}

function specialtyCount(id) {
  return state.survivors.filter((survivor) => survivor.specialty === id && survivor.health > 0).length;
}

function specialtyLevelTotal(id) {
  return state.survivors
    .filter((survivor) => survivor.specialty === id && survivor.health > 0)
    .reduce((sum, survivor) => sum + residentLevel(survivor), 0);
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

function damageGrowthMultiplier() {
  return gameConfig.combat.damageGrowthMultiplier || gameConfig.upgrades.buildingCostMultiplier || 1.61803398875;
}

function damageLevelScale(level) {
  return damageGrowthMultiplier() ** Math.max(0, (level || 1) - 1);
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
        source: `assets/clothing/${category.folder}/${category.id}-${number}.gif?v=${clothingAssetVersion}`
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
  if (actor.direction === "right") return 3;
  if (actor.direction === "up") return 2;
  if (actor.direction === "left") return 1;
  if (actor.direction === "side") return actor.facing < 0 ? 1 : 3;
  return 0;
}

function levelSpriteRow(level, spriteName = "") {
  const maxRow = spriteName ? Math.max(0, spriteRowCount(spriteName) - 1) : 2;
  return clamp(Math.max(0, (level || 1) - 1), 0, maxRow);
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
  const specialty = specialtyCatalog.find((entry) => entry.id === survivor.specialty);
  return {
    ...survivor,
    title: specialty ? specialty.title : survivor.title,
    bonus: specialty ? specialty.bonus : survivor.bonus,
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

function expertProtestPoint(index = 0) {
  const center = buildingCenter(buildings.cabin);
  return {
    x: center.x - Math.min(80, buildings.cabin.w * 0.28) + (index % 4) * 42,
    y: buildings.cabin.y + buildings.cabin.h + 30 + Math.floor(index / 4) * 32
  };
}

const cityResidentNames = [
  "Nora Fields", "Eli Ward", "Mina Brook", "Tessa Vale", "Owen Hart",
  "Ivy Stone", "Finn Cross", "Luca Reed", "Maya Snow", "Rafi Lane",
  "June Harbor", "Cole Birch", "Anya Pike", "Theo Glass", "Sage North"
];

const suitColors = ["#26384a", "#1c2530", "#344a5f", "#4a3d5c", "#5a4938", "#204c48", "#6b3f57"];
const dressColors = ["#ff9fbe", "#ffd166", "#73df9b", "#67c7ff", "#b48cff", "#ff8a4c", "#f4f9ff"];
const cityPatterns = ["pinstripe", "check", "dots", "solid"];

function nextCityGender() {
  const people = [...(state.cityVisitors || []), ...(state.cityResidents || [])];
  const men = people.filter((person) => person.gender === "man").length;
  const women = people.filter((person) => person.gender === "woman").length;
  if (men > women) return "woman";
  if (women > men) return "man";
  return Math.random() < 0.5 ? "man" : "woman";
}

function randomCityStyle(gender = "man") {
  return {
    gender,
    main: randomChoice(gender === "woman" ? dressColors : suitColors),
    accent: randomChoice(["#f4f9ff", "#ffd166", "#ff5d66", "#67c7ff", "#1c2530"]),
    pattern: randomChoice(cityPatterns),
    hair: randomChoice(["#1c2530", "#6c4529", "#c08a4b", "#d7c1a2", "#3a2b24"]),
    skin: randomChoice(["#f2a65e", "#c98252", "#8f5a3a", "#f7c99a"])
  };
}

function cityResidentCapacity() {
  return state.structures.filter((structure) => structure.type === "house").length * (gameConfig.city.houseCapacity || 5);
}

function availableCityHousing() {
  return Math.max(0, cityResidentCapacity() - state.cityResidents.length);
}

function welcomeCenters() {
  return state.structures.filter((structure) => structure.type === "welcomeCenter");
}

function cityAttractions() {
  return state.structures.filter((structure) => isDecorationType(structure.type) || isCityBuildingType(structure.type));
}

function normalizeCityPerson(person = {}, index = 0, kind = "resident") {
  const welcome = welcomeCenters()[0];
  const start = welcome ? { x: welcome.x, y: welcome.y + 70 } : { x: fort.entrance.x + 42 + index * 22, y: fort.entrance.y + 120 };
  const maxHealth = Number.isFinite(person.maxHealth) ? person.maxHealth : gameConfig.characters.residentHealth;
  const gender = person.gender || (Math.random() < 0.5 ? "man" : "woman");
  return {
    id: person.id || `${kind}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: person.name || randomChoice(cityResidentNames),
    role: kind,
    gender,
    cityStyle: person.cityStyle || randomCityStyle(gender),
    clothes: person.clothes || randomClothingId(),
    outfit: normalizeOutfit(person.outfit, person.clothes),
    x: Number.isFinite(person.x) ? person.x : start.x,
    y: Number.isFinite(person.y) ? person.y : start.y,
    target: person.target || null,
    homeId: person.homeId || null,
    arrived: Boolean(person.arrived),
    interactTimer: Number.isFinite(person.interactTimer) ? person.interactTimer : Math.random() * 2,
    chatTimer: Number.isFinite(person.chatTimer) ? person.chatTimer : 0,
    facing: person.facing || 1,
    direction: person.direction || "down",
    walkTime: Number.isFinite(person.walkTime) ? person.walkTime : 0,
    stuckTimer: Number.isFinite(person.stuckTimer) ? person.stuckTimer : 0,
    pathNudge: person.pathNudge || null,
    maxHealth,
    health: clamp(Number.isFinite(person.health) ? person.health : maxHealth, 0, maxHealth)
  };
}

const blacksmithWeaponCatalog = [
  { name: "Basic Bow", family: "Bow" },
  { name: "Workshop Bow", family: "Bow" },
  { name: "Recurve Bow", family: "Bow" },
  { name: "Scout Crossbow", family: "Crossbow" },
  { name: "Repeating Crossbow", family: "Crossbow" },
  { name: "Flintlock Rifle", family: "Gun" },
  { name: "Gearlock Carbine", family: "Gun" },
  { name: "Frontier Repeater", family: "Gun" }
];

function blacksmithTechLevel(id) {
  state.blacksmithTech = normalizeBlacksmithTech(state);
  return state.blacksmithTech[id] || 0;
}

function blacksmithTechCost(id) {
  const config = gameConfig.blacksmith || defaultGameConfig.blacksmith;
  const base = id === "weapon" ? config.baseWeaponPointCost : config.baseBasketPointCost;
  return Math.ceil(base * ((config.pointCostMultiplier || gameConfig.upgrades.buildingCostMultiplier) ** blacksmithTechLevel(id)));
}

function currentWeaponTech() {
  return blacksmithWeaponCatalog[Math.min(blacksmithWeaponCatalog.length - 1, blacksmithTechLevel("weapon"))];
}

function nextWeaponTech() {
  return blacksmithWeaponCatalog[Math.min(blacksmithWeaponCatalog.length - 1, blacksmithTechLevel("weapon") + 1)];
}

function blacksmithTechOptions() {
  const carryBonus = gameConfig.blacksmith.basketCapacityBonus || gameConfig.carry.playerUpgradeBonus || 5;
  return [
    {
      id: "basket",
      name: "Basket Tech",
      level: blacksmithTechLevel("basket"),
      copy: `Reinforce straps and panniers for +${carryBonus} carry capacity.`
    },
    {
      id: "weapon",
      name: "Weapon Tech",
      level: blacksmithTechLevel("weapon"),
      copy: blacksmithTechLevel("weapon") >= blacksmithWeaponCatalog.length - 1
        ? `${currentWeaponTech().name} is the best weapon in this workshop.`
        : `Forge ${nextWeaponTech().name} for more damage and faster shots.`
    }
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

function cycleClockProgress() {
  const fullDuration = dayDuration() + nightDuration();
  const daySlice = fullDuration ? dayDuration() / fullDuration : 0.5;
  return state.wave.active
    ? daySlice + cyclePhaseProgress() * (1 - daySlice)
    : cyclePhaseProgress() * daySlice;
}

function worldDayNumber() {
  const nightsStarted = Math.max(0, state.wave.number || 0);
  return Math.max(1, nightsStarted + (state.wave.active ? 0 : 1));
}

function cycleTimeText() {
  return state.wave.active
    ? `Night ${Math.max(1, state.wave.number || 1)}`
    : `Day ${worldDayNumber()}`;
}

function worldDaySeconds() {
  return dayDuration() + nightDuration();
}

function variableFlowRepairCooldownSeconds() {
  const config = gameConfig.variableFlow || defaultGameConfig.variableFlow;
  return worldDaySeconds() * (config.respawnDays || 5);
}

function machineCooldownSeconds(site) {
  return Math.max(0, state.machineCooldowns?.[site.id] || 0);
}

function machineSiteReady(site) {
  return machineCooldownSeconds(site) <= 0;
}

function updateMachineCooldowns(dt) {
  state.machineCooldowns = state.machineCooldowns || {};
  Object.entries(state.machineCooldowns).forEach(([siteId, seconds]) => {
    if (seconds <= 0) {
      delete state.machineCooldowns[siteId];
      return;
    }
    state.machineCooldowns[siteId] = Math.max(0, seconds - dt);
  });
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

function affordableBlacksmithTech() {
  if (!blacksmithStructures().length) return null;
  return blacksmithTechOptions()
    .filter((tech) => tech.id !== "weapon" || tech.level < blacksmithWeaponCatalog.length - 1)
    .map((tech) => ({ ...tech, cost: blacksmithTechCost(tech.id) }))
    .filter((tech) => state.learningPoints >= tech.cost)
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
  return config.baseCapacity
    + specialtyCount("lumberjack") * config.lumberjackBonus
    + blacksmithTechLevel("basket") * (gameConfig.blacksmith.basketCapacityBonus || config.playerUpgradeBonus);
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

function rectCenter(rect) {
  return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
}

function storageSheds() {
  return [
    buildings.storageShed,
    ...state.structures.filter((structure) => structure.type === "storageShed")
  ].filter(Boolean);
}

function storageShedRect(shed) {
  return shed.id === "storageShed" ? shed : structureRect(shed);
}

function storageShedDropoff(shed) {
  const rect = storageShedRect(shed);
  return {
    x: rect.x + rect.w / 2,
    y: rect.y + rect.h + 28
  };
}

function closestStorageShedDropoff(point) {
  const shed = storageSheds().sort((a, b) => dist(point, storageShedDropoff(a)) - dist(point, storageShedDropoff(b)))[0];
  return shed ? storageShedDropoff(shed) : dropoffs.wood;
}

function rootCellars() {
  return [
    buildings.rootCellar,
    ...state.structures.filter((structure) => structure.type === "rootCellar")
  ].filter(Boolean);
}

function rootCellarRect(cellar) {
  return cellar.id === "rootCellar" ? cellar : structureRect(cellar);
}

function rootCellarDropoff(cellar) {
  const rect = rootCellarRect(cellar);
  return { x: rect.x + rect.w / 2, y: rect.y + rect.h + 24 };
}

function closestRootCellarDropoff(point) {
  const cellar = rootCellars().sort((a, b) => dist(point, rootCellarDropoff(a)) - dist(point, rootCellarDropoff(b)))[0];
  return cellar ? rootCellarDropoff(cellar) : dropoffs.food;
}

function medicalTents() {
  return state.structures.filter((structure) => structure.type === "medicalTent" && structure.health > 0);
}

function blacksmithStructures() {
  return state.structures.filter((structure) => structure.type === "blacksmith" && structure.health > 0);
}

function medicalTentCarePoint(tent) {
  return tent ? { x: tent.x, y: tent.y + 24 } : survivorPosition(0);
}

function closestMedicalTent(point) {
  return medicalTents().sort((a, b) => dist(point, a) - dist(point, b))[0] || null;
}

function actorNeedsMedicalTent(actor) {
  if (!actor || actor.health <= 0 || !actor.maxHealth) return false;
  return actor.health / actor.maxHealth <= (gameConfig.medical.patientThreshold || 0.7);
}

function healActor(actor, amount) {
  if (!actor || actor.health <= 0 || !actor.maxHealth || amount <= 0) return false;
  const before = actor.health;
  actor.health = clamp(actor.health + amount, 0, actor.maxHealth);
  return actor.health > before;
}

function updatePatientRoute(actor, dt, speed) {
  if (!actorNeedsMedicalTent(actor)) return false;
  const tent = closestMedicalTent(actor);
  if (!tent) return false;
  const carePoint = medicalTentCarePoint(tent);
  actor.target = carePoint;
  if (moveActor(actor, carePoint, speed, dt) || pointInRect(actor, structureRect(tent), 28)) {
    healActor(actor, (gameConfig.medical.tentHealPerSecond || 1.4) * dt);
  }
  return true;
}

function doctorPatients() {
  return [
    ...state.survivors.filter((survivor) => survivor.health > 0 && survivor.specialty !== "doctor"),
    ...(state.cityResidents || []).filter((resident) => resident.health > 0),
    ...(state.cityVisitors || []).filter((visitor) => visitor.health > 0)
  ].filter((actor) => actor.health < actor.maxHealth);
}

function foodPreps() {
  return [
    buildings.foodPrep,
    ...state.structures.filter((structure) => structure.type === "foodPrep")
  ].filter(Boolean).map(ensureFoodPrepState);
}

function ensureFoodPrepState(prep) {
  prep.raw = Number.isFinite(prep.raw) ? prep.raw : 0;
  prep.meals = Number.isFinite(prep.meals) ? prep.meals : 0;
  prep.processProgress = Number.isFinite(prep.processProgress) ? prep.processProgress : 0;
  prep.serveProgress = Number.isFinite(prep.serveProgress) ? prep.serveProgress : 0;
  prep.servedPulse = Number.isFinite(prep.servedPulse) ? prep.servedPulse : 0;
  prep.wordMealBonus = Number.isFinite(prep.wordMealBonus) ? prep.wordMealBonus : 0;
  prep.selectedRecipeId = prep.selectedRecipeId || unlockedRecipes()[0]?.id || recipeCatalog[0].id;
  prep.level = prep.level || 1;
  return prep;
}

function foodPrepId(prep) {
  return prep.id || prep.type || "foodPrep";
}

function foodPrepRect(prep) {
  return prep.id === "foodPrep" ? prep : structureRect(prep);
}

function foodPrepCenter(prep) {
  return rectCenter(foodPrepRect(prep));
}

function foodPrepRawDropoff(prep) {
  const rect = foodPrepRect(prep);
  return { x: rect.x + rect.w * 0.3, y: rect.y + rect.h * 0.25 };
}

function foodPrepMealDropoff(prep) {
  const rect = foodPrepRect(prep);
  return { x: rect.x + rect.w * 0.84, y: rect.y + rect.h * 0.25 };
}

function closestFoodPrep(point, requireMeals = false) {
  return foodPreps()
    .filter((prep) => !requireMeals || prep.meals > 0)
    .sort((a, b) => dist(point, foodPrepCenter(a)) - dist(point, foodPrepCenter(b)))[0] || buildings.foodPrep;
}

function totalRawFood() {
  return rawFoodTypes.reduce((sum, type) => sum + (state.stored[type] || 0), 0);
}

function totalPreparedMeals() {
  return foodPreps().reduce((sum, prep) => sum + (prep.meals || 0), 0);
}

function recipeById(id) {
  return recipeCatalog.find((recipe) => recipe.id === id) || recipeCatalog[0];
}

function unlockedRecipes() {
  const unlocked = new Set(state.unlockedRecipes || []);
  return recipeCatalog.filter((recipe) => recipe.starter || unlocked.has(recipe.id));
}

function recipeUnlocked(recipeId) {
  return unlockedRecipes().some((recipe) => recipe.id === recipeId);
}

function currentPrepRecipe(prep) {
  prep = ensureFoodPrepState(prep);
  if (!recipeUnlocked(prep.selectedRecipeId)) prep.selectedRecipeId = unlockedRecipes()[0]?.id || recipeCatalog[0].id;
  return recipeById(prep.selectedRecipeId);
}

function ingredientStoredAmount(ingredient) {
  if (ingredient.type === "wildBerry") {
    return [...berryFoodTypes, "berries"].reduce((sum, type) => sum + (state.stored[type] || 0), 0);
  }
  return ingredientStorageTypes(ingredient.type).reduce((sum, type) => sum + (state.stored[type] || 0), 0);
}

function ingredientStorageTypes(type) {
  if (type === "eagleMeat" || type === "ptarmiganMeat") return [type, "birdMeat"];
  return [type];
}

function recipeHasIngredients(recipe) {
  return recipe.ingredients.every((ingredient) => ingredientStoredAmount(ingredient) >= ingredient.amount);
}

function consumeRecipeIngredient(ingredient) {
  let remaining = ingredient.amount;
  const choices = ingredient.type === "wildBerry" ? [...berryFoodTypes, "berries"] : ingredientStorageTypes(ingredient.type);
  choices.forEach((type) => {
    if (remaining <= 0) return;
    const amount = Math.min(remaining, state.stored[type] || 0);
    state.stored[type] = Math.max(0, (state.stored[type] || 0) - amount);
    remaining -= amount;
  });
  return remaining <= 0;
}

function consumeRecipeIngredients(recipe) {
  if (!recipeHasIngredients(recipe)) return false;
  recipe.ingredients.forEach(consumeRecipeIngredient);
  return true;
}

function recipeIngredientsText(recipe) {
  return recipe.ingredients.map((ingredient) => {
    const meta = resourceMeta[ingredient.type];
    return `${ingredient.amount} ${ingredient.label || meta?.label || ingredient.type}`;
  }).join(", ");
}

function chefMealYield(survivor, recipe = recipeCatalog[0]) {
  return Math.max(1, Math.floor((recipe.meals || 1) * (1 + residentLevel(survivor) * 0.5)));
}

function randomChoice(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function specialtyById(id) {
  return specialtyCatalog.find((specialty) => specialty.id === id) || null;
}

function refreshExpertSpecialtyBag() {
  state.expertSpecialtyBag = shuffled(specialtyCatalog.map((specialty) => specialty.id));
}

function nextVisitorSpecialty() {
  const validIds = new Set(specialtyCatalog.map((specialty) => specialty.id));
  state.expertSpecialtyBag = (state.expertSpecialtyBag || []).filter((id) => validIds.has(id));
  if (!state.expertSpecialtyBag.length) refreshExpertSpecialtyBag();
  return specialtyById(state.expertSpecialtyBag.shift()) || specialtyCatalog[0];
}

function allExpertNames() {
  return specialtyCatalog.flatMap((specialty) => specialty.names || []);
}

function reservedExpertNames() {
  return new Set([
    ...(state.survivors || []),
    pendingVisitor,
    pendingRecruit,
    replacementRecruit
  ].filter(Boolean).map((expert) => expert.name));
}

function uniqueExpertName(specialty) {
  const reserved = reservedExpertNames();
  const specialtyNames = (specialty.names || []).filter((name) => !reserved.has(name));
  if (specialtyNames.length) return randomChoice(specialtyNames);
  const globalNames = allExpertNames().filter((name) => !reserved.has(name));
  if (globalNames.length) return randomChoice(globalNames);
  const base = randomChoice(specialty.names || ["Frontier Expert"]);
  let suffix = 2;
  while (reserved.has(`${base} ${suffix}`)) suffix += 1;
  return `${base} ${suffix}`;
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
  fort.health = fort.maxHealth;
  state.wave = normalizeNightCycleState(state.wave);
  snapAllBuildingsToGrid();
  generateWorldLayout();
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
  return Math.ceil(100 * (gameConfig.upgrades.buildingCostMultiplier ** Math.max(0, targetLevel - 2)));
}

function barrierMaxHealth(type, level = state.fortLevel || 1) {
  const base = type === "gate" ? gameConfig.build.gateHealth : gameConfig.build.fenceHealth;
  return base * (2 ** Math.max(0, level - 1));
}

function gateStructures() {
  return state.structures.filter((structure) => structure.type === "gate");
}

function farmProduceSeconds(level = buildings.farm ? buildings.farm.level : 1) {
  const config = gameConfig.farm;
  return Math.max(
    config.minProduceSeconds,
    config.baseProduceSeconds - level * config.levelReductionSeconds - specialtyCount("farmer") * config.farmerReductionSeconds
  );
}

function foodProcessSeconds(prep = buildings.foodPrep) {
  prep = ensureFoodPrepState(prep);
  const config = gameConfig.foodPrep;
  return Math.max(
    config.minProcessSeconds,
    config.baseProcessSeconds
      - prep.level * config.levelReductionSeconds
  );
}

function cookExpertProcessSeconds(survivor, prep = buildings.foodPrep) {
  prep = ensureFoodPrepState(prep);
  const config = gameConfig.foodPrep;
  const playerUpgradeEquivalent = Math.max(0, (residentLevel(survivor) - 1) / 4);
  return Math.max(
    config.minProcessSeconds,
    config.baseProcessSeconds
      - prep.level * config.levelReductionSeconds
      - playerUpgradeEquivalent * config.levelReductionSeconds
  );
}

function cabinHungerGainPerSecond() {
  const config = gameConfig.cabin;
  return Math.max(
    config.minHungerGainPerSecond,
    config.baseHungerGainPerSecond
      + state.survivors.length * config.survivorHungerGainPerSecond
      + (state.cityResidents || []).length * (config.residentHungerGainPerSecond || 0)
      - buildings.cabin.level * config.levelHungerReductionPerSecond
  );
}

function furnaceFuelDrainPerSecond() {
  return furnaceFuelDrainForLevel(buildings.furnace.level);
}

function generatorPowered() {
  return buildings.furnace.fuel > 0;
}

function generatorProductivityMultiplier() {
  return generatorPowered() ? 1 : (gameConfig.furnace.outageProductivityMultiplier || 0.25);
}

function hungerProtestActive() {
  return buildings.cabin.hunger >= buildings.cabin.maxHunger;
}

function furnaceDrainUpgradeCount(level) {
  return 1 + Math.floor(Math.max(1, level) / 2);
}

function furnaceCapacityUpgradeCount(level) {
  return Math.max(0, Math.floor((Math.max(1, level) - 1) / 2));
}

function furnaceFuelDrainForLevel(level) {
  const config = gameConfig.furnace;
  return Math.max(
    config.minFuelDrainPerSecond,
    config.baseFuelDrainPerSecond - furnaceDrainUpgradeCount(level) * config.levelDrainReductionPerSecond
  );
}

function furnaceUpgradeTypeForLevel(nextLevel) {
  return nextLevel % 2 === 0 ? "drain" : "capacity";
}

function treeChopSeconds() {
  const config = gameConfig.trees;
  return Math.max(
    config.minChopSeconds,
    config.chopSeconds
      - specialtyCount("lumberjack") * config.lumberjackReductionSeconds
  );
}

function chopMiniGameConfig() {
  return gameConfig.trees.chopMiniGame || defaultGameConfig.trees.chopMiniGame;
}

function woodChopTargetPoint() {
  return { x: state.player.x, y: state.player.y - 158 };
}

function randomWoodChopFactor() {
  return Math.floor(Math.random() * 11);
}

function createWoodChopProblem() {
  const factorA = randomWoodChopFactor();
  const factorB = randomWoodChopFactor();
  return { factorA, factorB, answer: factorA * factorB };
}

function setWoodChopProblem() {
  if (!woodChopMiniGame) return;
  Object.assign(woodChopMiniGame, createWoodChopProblem());
}

function woodChopProblemText() {
  if (!woodChopMiniGame) return "";
  return `${woodChopMiniGame.factorA} x ${woodChopMiniGame.factorB}`;
}

function woodChopLogLayout() {
  const config = chopMiniGameConfig();
  const count = config.segmentCount || 4;
  const segmentW = 64;
  const segmentH = 50;
  const gap = 4;
  const totalW = count * segmentW + (count - 1) * gap;
  return {
    count,
    segmentW,
    segmentH,
    gap,
    x: state.player.x - totalW / 2,
    y: state.player.y - 250
  };
}

function woodChopSegmentRect(index) {
  const layout = woodChopLogLayout();
  return {
    x: layout.x + index * (layout.segmentW + layout.gap),
    y: layout.y,
    w: layout.segmentW,
    h: layout.segmentH
  };
}

function startWoodChopMiniGame(tree, chopTime) {
  const config = chopMiniGameConfig();
  woodChopMiniGame = {
    treeId: tree.id,
    kind: tree.type === "berryBush" ? "berry" : "wood",
    ...createWoodChopProblem(),
    totalTime: chopTime,
    choices: [],
    active: false,
    startDelay: config.startDelaySeconds || 1,
    previousZoom: null
  };
}

function activateWoodChopMiniGame() {
  if (!woodChopMiniGame || woodChopMiniGame.active) return;
  const config = chopMiniGameConfig();
  woodChopMiniGame.active = true;
  woodChopMiniGame.previousZoom = woodChopReturnZoom?.zoom || camera.zoom;
  woodChopReturnZoom = null;
  setCameraZoom(Number.isFinite(config.zoom) ? config.zoom : 1);
  refreshWoodChopLogChoices();
  setMessage(woodChopMiniGame.kind === "berry"
    ? `Berry challenge: pick the basket with the answer to ${woodChopProblemText()}.`
    : `Chop challenge: split the log with the answer to ${woodChopProblemText()}.`, 4);
}

function stopWoodChopMiniGame() {
  if (woodChopMiniGame?.active && Number.isFinite(woodChopMiniGame.previousZoom)) {
    woodChopReturnZoom = {
      zoom: woodChopMiniGame.previousZoom,
      timer: chopMiniGameConfig().endDelaySeconds || 1
    };
  }
  woodChopMiniGame = null;
}

function updateWoodChopMiniGame(tree, chopTime, dt) {
  if (!woodChopMiniGame || woodChopMiniGame.treeId !== tree.id) {
    if (woodChopMiniGame) stopWoodChopMiniGame();
    startWoodChopMiniGame(tree, chopTime);
  }
  woodChopMiniGame.totalTime = chopTime;
  if (!woodChopMiniGame.active) {
    woodChopMiniGame.startDelay = Math.max(0, woodChopMiniGame.startDelay - dt);
    if (woodChopMiniGame.startDelay <= 0) activateWoodChopMiniGame();
    return;
  }
  woodChopMiniGame.choices.forEach((choice) => {
    choice.flash = Math.max(0, (choice.flash || 0) - dt);
  });
}

function updateWoodChopZoomRestore(dt) {
  if (!woodChopReturnZoom) return;
  woodChopReturnZoom.timer -= dt;
  if (woodChopReturnZoom.timer > 0) return;
  setCameraZoom(woodChopReturnZoom.zoom);
  woodChopReturnZoom = null;
}

function refreshWoodChopLogChoices() {
  if (!woodChopMiniGame) return;
  const config = chopMiniGameConfig();
  const count = config.segmentCount || 4;
  const correctValue = woodChopMiniGame.answer;
  const wrongValues = shuffled(Array.from({ length: 101 }, (_, value) => value).filter((value) => value !== correctValue)).slice(0, count - 1);
  woodChopMiniGame.choices = shuffled([
    { value: correctValue, correct: true, flash: 0 },
    ...wrongValues.map((value) => ({ value, correct: false, flash: 0 }))
  ]);
}

function handleWoodChopBubbleClick(point) {
  if (!woodChopMiniGame || buildMode || moveMode || removeMode || repairMode) return false;
  if (!woodChopMiniGame.active) return false;
  const segment = woodChopSegmentAt(point);
  if (!segment) return false;
  const tree = trees.find((candidate) => candidate.id === woodChopMiniGame.treeId && candidate.alive);
  if (!tree) {
    stopWoodChopMiniGame();
    return false;
  }
  const config = chopMiniGameConfig();
  const total = woodChopMiniGame.totalTime || (tree.type === "berryBush" ? (gameConfig.trees.berryGatherSeconds || 3) : treeChopSeconds());
  const choice = segment.choice;
  const problem = woodChopProblemText();
  if (choice.correct) {
    tree.progress = clamp(tree.progress + total * (config.correctBonusFraction || 0.25), 0, total);
    const berryPick = woodChopMiniGame.kind === "berry";
    const bonusType = berryPick ? (tree.berryType || "blueberries") : "wood";
    const bonus = berryPick ? (config.correctBerryBonus || 2) : (config.correctWoodBonus || 2);
    for (let index = 0; index < bonus; index += 1) {
      spawnResource(bonusType, tree.x - 30 + Math.random() * 60, tree.y + 12 + Math.random() * 32, 1);
    }
    addBurst(segment.x, segment.y, "#73df9b", 8);
    setMessage(berryPick
      ? `${problem} = ${choice.value}. The thicket gives ${bonus} bonus berries.`
      : `${problem} = ${choice.value}. The log splits faster and drops ${bonus} bonus wood.`, 3);
    playSound("success");
    setWoodChopProblem();
    refreshWoodChopLogChoices();
  } else {
    tree.progress = clamp(tree.progress - total * (config.wrongPenaltyFraction || 0.1), 0, total);
    choice.flash = 0.45;
    addBurst(segment.x, segment.y, "#ff5d66", 8);
    setMessage(woodChopMiniGame.kind === "berry"
      ? `${problem} is not ${choice.value}. The berry search slips back.`
      : `${problem} is not ${choice.value}. The cut slips back.`, 3);
    playSound("fail");
  }
  return true;
}

function woodChopBubbleAt(point) {
  return woodChopSegmentAt(point);
}

function woodChopSegmentAt(point) {
  if (!woodChopMiniGame?.active) return null;
  for (let index = woodChopMiniGame.choices.length - 1; index >= 0; index -= 1) {
    const rect = woodChopSegmentRect(index);
    if (pointInRect(point, rect, 8)) {
      return {
        ...rect,
        x: rect.x + rect.w / 2,
        y: rect.y + rect.h / 2,
        choice: woodChopMiniGame.choices[index],
        index
      };
    }
  }
  return null;
}

function cookingMiniGameConfig() {
  return gameConfig.foodPrep.cookingMiniGame || defaultGameConfig.foodPrep.cookingMiniGame;
}

function cookingBoard() {
  const boards = cookingMiniGameConfig().boards || [];
  return clone(randomChoice(boards.length ? boards : [{ letters: "STEAMROASTPLATEK", words: ["steam", "meat", "roast", "plate"] }]));
}

function cookingWordBank() {
  const config = cookingMiniGameConfig();
  return new Set([
    ...(config.wordBank || []),
    ...((config.boards || []).flatMap((board) => board.words || []))
  ].map((word) => String(word).trim().toLowerCase()).filter(Boolean));
}

function cookingWordKnown(word) {
  return word.length >= (cookingMiniGameConfig().minimumWordLength || 3) && cookingWordBank().has(word);
}

function cookingWordEnteredThisSession(word) {
  return Boolean(cookingMiniGame?.foundWords.includes(word));
}

function cookingRoundSeconds() {
  return cookingMiniGameConfig().roundSeconds || 6;
}

function loadCookingSpeedBoard(game = cookingMiniGame) {
  if (!game) return;
  const board = cookingBoard();
  game.letters = board.letters.slice(0, 16).padEnd(16, "X").split("");
  game.words = (board.words || []).map((word) => word.toLowerCase());
  game.usedWords = [];
  game.selected = [];
  game.typed = "";
  game.roundTimeLeft = cookingRoundSeconds();
  game.round = (game.round || 0) + 1;
  game.boardPulse = 0.32;
}

function startCookingMiniGame(prep, recipe, totalTime) {
  const prepId = foodPrepId(prep);
  if (cookingMiniGame?.prepId === prepId && cookingMiniGame.recipeId === recipe.id) {
    cookingMiniGame.totalTime = totalTime;
    return;
  }
  cookingMiniGame = {
    prepId,
    recipeId: recipe.id,
    foundWords: [],
    score: 0,
    streak: 0,
    round: 0,
    flash: 0,
    boardPulse: 0,
    totalTime
  };
  loadCookingSpeedBoard();
  setMessage(`Speed Boggle: trace fast cooking words while ${recipe.name} simmers.`, 4);
}

function stopCookingMiniGame(celebrate = false) {
  if (celebrate && cookingMiniGame) addBurst(state.player.x, state.player.y - 108, "#ffcb72", 8);
  cookingMiniGame = null;
  cookingTracePointer = null;
}

function updateCookingMiniGame(dt) {
  if (!cookingMiniGame) return;
  cookingMiniGame.flash = Math.max(0, (cookingMiniGame.flash || 0) - dt);
  cookingMiniGame.boardPulse = Math.max(0, (cookingMiniGame.boardPulse || 0) - dt);
  cookingMiniGame.roundTimeLeft = Math.max(0, (cookingMiniGame.roundTimeLeft || 0) - dt);
  if (cookingMiniGame.roundTimeLeft > 0) return;
  cookingMiniGame.streak = 0;
  loadCookingSpeedBoard();
  setMessage("The pan flips to a fresh Speed Boggle board.", 2.5);
}

function cookingMiniGamePanel() {
  return { x: state.player.x - 184, y: state.player.y - 492, w: 368, h: 326 };
}

function cookingLetterRect(index) {
  const panel = cookingMiniGamePanel();
  const col = index % 4;
  const row = Math.floor(index / 4);
  return { x: panel.x + 32 + col * 58, y: panel.y + 92 + row * 43, w: 48, h: 36 };
}

function cookingActionRect(action) {
  const panel = cookingMiniGamePanel();
  return action === "clear"
    ? { x: panel.x + 248, y: panel.y + 278, w: 88, h: 34 }
    : { x: panel.x + 118, y: panel.y + 278, w: 118, h: 34 };
}

function cookingLetterIndexAt(point) {
  if (!cookingMiniGame) return -1;
  return cookingMiniGame.letters.findIndex((letter, index) => (
    !cookingMiniGame.selected.includes(index) && pointInRect(point, cookingLetterRect(index), 5)
  ));
}

function cookingMiniGameAt(point) {
  if (!cookingMiniGame) return null;
  const letterIndex = cookingLetterIndexAt(point);
  if (letterIndex >= 0) return { type: "letter", index: letterIndex };
  if (pointInRect(point, cookingActionRect("serve"), 5)) return { type: "serve" };
  if (pointInRect(point, cookingActionRect("clear"), 5)) return { type: "clear" };
  return pointInRect(point, cookingMiniGamePanel(), 8) ? { type: "panel" } : null;
}

function resetCookingSelection() {
  if (!cookingMiniGame) return;
  cookingMiniGame.selected = [];
  cookingMiniGame.typed = "";
}

function selectCookingLetter(index) {
  if (!cookingMiniGame || index < 0 || cookingMiniGame.selected.includes(index)) return false;
  const lastIndex = cookingMiniGame.selected[cookingMiniGame.selected.length - 1];
  if (Number.isFinite(lastIndex) && !cookingBoggleAdjacent(lastIndex, index)) {
    cookingMiniGame.flash = 0.24;
    setMessage("Speed Boggle letters must touch.", 2.2);
    playSound("fail");
    return false;
  }
  cookingMiniGame.selected.push(index);
  cookingMiniGame.typed += cookingMiniGame.letters[index];
  playSound("pickup");
  if (cookingWordKnown(cookingMiniGame.typed) && !cookingWordEnteredThisSession(cookingMiniGame.typed)) {
    submitCookingWord();
  }
  return true;
}

function cookingSpeedWordBonusFraction(word) {
  const config = cookingMiniGameConfig();
  const timeRatio = clamp((cookingMiniGame.roundTimeLeft || 0) / cookingRoundSeconds(), 0, 1);
  const streakBonus = Math.min(config.maxStreakBonusFraction || 0.04, Math.max(0, (cookingMiniGame.streak - 1) * (config.streakBonusFraction || 0.01)));
  return (config.baseWordBonusFraction || 0.055)
    + word.length * (config.letterBonusFraction || 0.012)
    + timeRatio * (config.speedBonusFraction || 0.045)
    + streakBonus;
}

function submitCookingWord() {
  if (!cookingMiniGame) return false;
  const word = cookingMiniGame.typed.toLowerCase();
  const prep = foodPreps().find((item) => foodPrepId(item) === cookingMiniGame.prepId);
  const config = cookingMiniGameConfig();
  if (!prep || word.length < (config.minimumWordLength || 3)) {
    setMessage(`Trace a ${config.minimumWordLength || 3}+ letter cooking word first.`, 2.5);
    return false;
  }
  if (!cookingWordKnown(word) || cookingWordEnteredThisSession(word)) {
    cookingMiniGame.flash = 0.42;
    cookingMiniGame.streak = 0;
    cookingMiniGame.roundTimeLeft = Math.max(0, cookingMiniGame.roundTimeLeft - (config.wrongTimePenaltySeconds || 1.1));
    setMessage(cookingWordEnteredThisSession(word) ? `${word.toUpperCase()} already added a meal this cooking session.` : `${word.toUpperCase()} is not in the cooking word bank.`, 2.8);
    playSound("fail");
  } else {
    cookingMiniGame.usedWords.push(word);
    cookingMiniGame.foundWords.push(word);
    prep.wordMealBonus = (prep.wordMealBonus || 0) + 1;
    cookingMiniGame.streak += 1;
    cookingMiniGame.score += Math.max(1, Math.round(word.length * (1 + cookingMiniGame.streak * 0.2)));
    const bonus = foodProcessSeconds(prep) * cookingSpeedWordBonusFraction(word);
    prep.processProgress = clamp(prep.processProgress + bonus, 0, foodProcessSeconds(prep));
    cookingMiniGame.roundTimeLeft = Math.min(cookingRoundSeconds(), cookingMiniGame.roundTimeLeft + (config.correctTimeGainSeconds || 0.55));
    addBurst(state.player.x, state.player.y - 186, "#73df9b", 8);
    setMessage(`${word.toUpperCase()} adds 1 meal and speeds the dish.`, 2.6);
    playSound("success");
    if (cookingMiniGame.usedWords.length >= cookingMiniGame.words.length) {
      prep.processProgress = clamp(prep.processProgress + foodProcessSeconds(prep) * (config.clearBoardBonusFraction || 0.08), 0, foodProcessSeconds(prep));
      addBurst(state.player.x, state.player.y - 208, "#ffcb72", 10);
      setMessage("Board cleared. A fresh pan hits the stove.", 2.8);
      loadCookingSpeedBoard();
      return true;
    }
  }
  resetCookingSelection();
  return true;
}

function handleCookingMiniGameClick(point) {
  if (!cookingMiniGame || buildMode || moveMode || removeMode || repairMode) return false;
  const action = cookingMiniGameAt(point);
  if (!action) return false;
  if (action.type === "letter") return selectCookingLetter(action.index) || true;
  if (action.type === "clear") {
    resetCookingSelection();
    return true;
  }
  if (action.type === "serve") {
    submitCookingWord();
    return true;
  }
  return true;
}

function cookingBoggleAdjacent(a, b) {
  const colA = a % 4;
  const rowA = Math.floor(a / 4);
  const colB = b % 4;
  const rowB = Math.floor(b / 4);
  return Math.max(Math.abs(colA - colB), Math.abs(rowA - rowB)) === 1;
}

function playerLevel() {
  return state.playerLevel || 1;
}

function gainPlayerLevel(reason = "Camp tech advanced") {
  state.playerLevel = playerLevel() + 1;
  pushNotification({
    id: `player-level-${state.playerLevel}`,
    title: `Player Level ${state.playerLevel}`,
    copy: reason
  });
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
    signalTower: "Net Tower",
    iceTrap: "Ice Trap",
    cabin: "Cabin",
    storageShed: "Storage Shed",
    rootCellar: "Root Cellar",
    medicalTent: "Medical Tent",
    blacksmith: "Blacksmith",
    foodPrep: "Kitchen Hall",
    farm: "Farm",
    welcomeCenter: "Welcome Center",
    house: "House",
    shrub: "Shrub",
    torch: "Torch",
    path: "Path",
    fountain: "Fountain",
    bench: "Bench",
    largeFountain: "Large Fountain",
    statue: "Statue",
    garden: "Garden"
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
    storageShed: build.storageShedCost,
    rootCellar: build.rootCellarCost,
    medicalTent: build.medicalTentCost,
    blacksmith: build.blacksmithCost,
    foodPrep: build.foodPrepCost,
    farm: build.farmCost,
    welcomeCenter: build.welcomeCenterCost,
    house: build.houseCost,
    shrub: build.shrubCost,
    torch: build.torchCost,
    path: build.pathCost,
    fountain: build.fountainCost,
    bench: build.benchCost,
    largeFountain: build.largeFountainCost,
    statue: build.statueCost,
    garden: build.gardenCost
  };
  return costs[type] || 999;
}

function buildCatalog() {
  const build = gameConfig.build;
  return [
    { type: "path", unlocked: true, note: "A walkable town path for city layout." },
    { type: "torch", unlocked: true, note: "Warm light that makes paths feel safer." },
    { type: "shrub", unlocked: true, note: "Small decoration for cozy streets." },
    { type: "bench", unlocked: true, note: "Residents pause here and chat." },
    { type: "fence", unlocked: true, note: "Blocks attackers and absorbs damage." },
    { type: "gate", unlocked: true, note: "Friendly units pass through. Enemies still have to break it." },
    { type: "outpost", unlocked: true, note: "Basic arrow tower. Can station Experts." },
    { type: "medicalTent", unlocked: playerLevel() >= build.medicalTentPlayerLevel, note: `Unlocks at player level ${build.medicalTentPlayerLevel}. Hurt NPCs recover here.` },
    { type: "blacksmith", unlocked: playerLevel() >= build.blacksmithPlayerLevel, note: `Unlocks at player level ${build.blacksmithPlayerLevel}. Spend learning points on baskets and weapons.` },
    { type: "house", unlocked: true, note: `Adds ${gameConfig.city.houseCapacity || 5} Resident housing spaces.` },
    { type: "fountain", unlocked: true, note: "A small attraction for the center of town." },
    { type: "hunterPost", unlocked: playerLevel() >= build.advancedTowerPlayerLevel, note: `Unlocks at player level ${build.advancedTowerPlayerLevel}. Stronger arrows.` },
    { type: "signalTower", unlocked: playerLevel() >= build.signalTowerPlayerLevel, note: `Unlocks at player level ${build.signalTowerPlayerLevel}. Nets animals in place.` },
    { type: "storageShed", unlocked: playerLevel() >= build.storageShedPlayerLevel, note: `Unlocks at player level ${build.storageShedPlayerLevel}. Shared wood storage.` },
    { type: "rootCellar", unlocked: true, note: "Shared raw food storage for recipe ingredients." },
    { type: "iceTrap", unlocked: playerLevel() >= build.iceTrapPlayerLevel, note: `Unlocks at player level ${build.iceTrapPlayerLevel}. Heavy slow, low damage.` },
    { type: "foodPrep", unlocked: playerLevel() >= build.foodPrepPlayerLevel, note: `Unlocks at player level ${build.foodPrepPlayerLevel}. Chefs can work here.` },
    { type: "garden", unlocked: true, note: "A larger attraction and gathering spot." },
    { type: "statue", unlocked: true, note: "A landmark attraction for the settlement." },
    { type: "largeFountain", unlocked: true, note: "A large attraction for future city appeal systems." },
    { type: "farm", unlocked: maxFoodPrepLevel() >= 3, note: "Unlocks when Kitchen Hall reaches level 3." },
    { type: "welcomeCenter", unlocked: playerLevel() >= build.welcomeCenterPlayerLevel, note: `Unlocks at player level ${build.welcomeCenterPlayerLevel}. Lets visitors enter and become Residents.` },
    { type: "cabin", unlocked: playerLevel() >= build.cabinPlayerLevel, note: `Unlocks at player level ${build.cabinPlayerLevel}. Adds Expert capacity.` }
  ];
}

const buildCatalogGroups = [
  { id: "defense", label: "Defense", types: ["fence", "gate", "outpost", "hunterPost", "signalTower", "iceTrap"] },
  { id: "survival", label: "Survival", types: ["medicalTent", "blacksmith", "storageShed", "rootCellar", "foodPrep", "farm", "cabin"] },
  { id: "settlement", label: "Settlement", types: ["house", "welcomeCenter"] },
  { id: "decor", label: "Paths & Decor", types: ["path", "torch", "shrub", "bench", "fountain", "garden", "statue", "largeFountain"] }
];

function isTowerType(type) {
  return ["outpost", "hunterPost", "signalTower", "iceTrap"].includes(type);
}

function isBarrierType(type) {
  return type === "fence" || type === "gate";
}

function isDecorationType(type) {
  return ["shrub", "torch", "path", "fountain", "bench", "largeFountain", "statue", "garden"].includes(type);
}

function isCabinLinkedStructure(type) {
  return isBarrierType(type) || isDecorationType(type);
}

function cabinLinkedLevel() {
  return Math.max(1, buildings?.cabin?.level || state.fortLevel || 1);
}

function decorationMaxHealth(level = cabinLinkedLevel()) {
  return 40 + Math.max(0, level - 1) * 35;
}

function isLargeDecorationType(type) {
  return ["largeFountain", "statue", "garden"].includes(type);
}

function isCityBuildingType(type) {
  return type === "house" || type === "welcomeCenter";
}

function towerStats(structure) {
  const base = gameConfig.towers[structure.type] || gameConfig.towers.outpost;
  const rangeGrowth = gameConfig.towers.rangeGrowthMultiplier || 1.12;
  const rangeScale = rangeGrowth ** Math.max(0, (structure.level || 1) - 1);
  return {
    range: Math.round(base.range * rangeScale),
    damage: base.damage * damageLevelScale(structure.level),
    cooldown: Math.max(0.55, base.cooldown - Math.max(0, structure.level - 1) * 0.08),
    slow: base.slow || 1,
    netSeconds: base.netSeconds ? base.netSeconds * damageLevelScale(structure.level) : 0
  };
}

function maxFoodPrepLevel() {
  return Math.max(...foodPreps().map((prep) => prep.level || 1));
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
  if (rectTouchesWater(rect)) return { ok: false, reason: "Water covers that grid space." };
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
    const deerImage = spriteImages.deer;
    const deerReady = deerImage && (deerImage.naturalWidth || deerImage.width);
    if (!deerReady) createGeneratedDeerSpriteSheet();
    createGeneratedPtarmiganSpriteSheet();
    spritesReady = true;
  });
}

function createGeneratedDeerSpriteSheet() {
  const frames = gameConfig.spriteFrames?.deer || 4;
  const rows = gameConfig.spriteRows?.deer || 3;
  const frameW = 128;
  const frameH = 96;
  const sheet = document.createElement("canvas");
  sheet.width = frameW * frames;
  sheet.height = frameH * rows;
  const sheetCtx = sheet.getContext("2d");
  for (let row = 0; row < rows; row += 1) {
  for (let frame = 0; frame < frames; frame += 1) {
    const x = frame * frameW + frameW / 2;
    const y = row * frameH + frameH / 2 + 12;
    const stride = Math.sin((frame / frames) * Math.PI * 2);
    sheetCtx.save();
    sheetCtx.translate(x, y);
    sheetCtx.fillStyle = "rgba(0,0,0,0.16)";
    sheetCtx.beginPath();
    sheetCtx.ellipse(0, 28, 42, 12, 0, 0, Math.PI * 2);
    sheetCtx.fill();
    sheetCtx.fillStyle = "#8a5a36";
    sheetCtx.beginPath();
    sheetCtx.ellipse(-4, -6, 42, 20, 0, 0, Math.PI * 2);
    sheetCtx.fill();
    sheetCtx.fillStyle = "#a87549";
    if (row === 2) {
      sheetCtx.beginPath();
      sheetCtx.ellipse(42, 16, 21, 14, 0.28, 0, Math.PI * 2);
      sheetCtx.fill();
    } else {
      sheetCtx.beginPath();
      sheetCtx.ellipse(36, -23, 21, 14, -0.18, 0, Math.PI * 2);
      sheetCtx.fill();
    }
    sheetCtx.fillStyle = "#f4e0bd";
    sheetCtx.beginPath();
    sheetCtx.ellipse(-32, -4, 12, 9, 0, 0, Math.PI * 2);
    sheetCtx.fill();
    sheetCtx.strokeStyle = "#5d3923";
    sheetCtx.lineWidth = 5;
    for (let i = -1; i <= 1; i += 2) {
      sheetCtx.beginPath();
      sheetCtx.moveTo(-22 + i * 12, 10);
      sheetCtx.lineTo(-24 + i * 14, 44 + stride * i * 7);
      sheetCtx.stroke();
      sheetCtx.beginPath();
      sheetCtx.moveTo(14 + i * 11, 9);
      sheetCtx.lineTo(20 + i * 12, 43 - stride * i * 7);
      sheetCtx.stroke();
    }
    sheetCtx.strokeStyle = "#d9c08e";
    sheetCtx.lineWidth = 3;
    sheetCtx.beginPath();
    const antlerY = row === 2 ? 2 : -35;
    sheetCtx.moveTo(42, antlerY);
    sheetCtx.lineTo(52, antlerY - 23);
    sheetCtx.moveTo(44, antlerY);
    sheetCtx.lineTo(35, antlerY - 21);
    sheetCtx.stroke();
    sheetCtx.restore();
  }
  }
  spriteImages.deer = sheet;
}

function createGeneratedPtarmiganSpriteSheet() {
  if (spriteImages.ptarmigan) return;
  const frames = spriteFrameCount("ptarmigan");
  const frameW = 92;
  const frameH = 72;
  const sheet = document.createElement("canvas");
  sheet.width = frameW * frames;
  sheet.height = frameH;
  const sheetCtx = sheet.getContext("2d");
  for (let frame = 0; frame < frames; frame += 1) {
    const x = frame * frameW + frameW / 2;
    const y = frameH / 2 + 6;
    const flap = Math.sin((frame / frames) * Math.PI * 2);
    sheetCtx.save();
    sheetCtx.translate(x, y);
    sheetCtx.fillStyle = "rgba(0,0,0,0.16)";
    sheetCtx.beginPath();
    sheetCtx.ellipse(-2, 24, 28, 7, 0, 0, Math.PI * 2);
    sheetCtx.fill();
    sheetCtx.fillStyle = "#efe9dc";
    sheetCtx.beginPath();
    sheetCtx.ellipse(-2, 0, 24, 14, -0.08, 0, Math.PI * 2);
    sheetCtx.fill();
    sheetCtx.fillStyle = "#d6c5ad";
    sheetCtx.beginPath();
    sheetCtx.ellipse(-12, -8 + flap * 7, 27, 8, -0.52, 0, Math.PI * 2);
    sheetCtx.ellipse(4, 6 - flap * 5, 26, 7, 0.48, 0, Math.PI * 2);
    sheetCtx.fill();
    sheetCtx.fillStyle = "#f7f3e9";
    sheetCtx.beginPath();
    sheetCtx.arc(22, -8, 9, 0, Math.PI * 2);
    sheetCtx.fill();
    sheetCtx.fillStyle = "#2f261f";
    sheetCtx.beginPath();
    sheetCtx.arc(25, -10, 2, 0, Math.PI * 2);
    sheetCtx.fill();
    sheetCtx.fillStyle = "#7a5831";
    sheetCtx.beginPath();
    sheetCtx.moveTo(31, -8);
    sheetCtx.lineTo(40, -4);
    sheetCtx.lineTo(31, -1);
    sheetCtx.closePath();
    sheetCtx.fill();
    sheetCtx.strokeStyle = "#9b7850";
    sheetCtx.lineWidth = 2;
    sheetCtx.beginPath();
    sheetCtx.moveTo(-3, 11);
    sheetCtx.lineTo(1, 22);
    sheetCtx.moveTo(6, 10);
    sheetCtx.lineTo(10, 22);
    sheetCtx.stroke();
    sheetCtx.restore();
  }
  spriteImages.ptarmigan = sheet;
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
  if (["furnace", "cabin", "foodPrep", "storageShed", "house", "welcomeCenter", "tower", "outpost", "hunterPost", "signalTower", "iceTrap", "farm", "tree", "fortWall"].includes(name)) return gameConfig.animation.buildingFps || 2.6;
  return gameConfig.animation.spriteFps || 7;
}

function trimmedSpriteSource(name, image, sourceX, sourceY, sourceW, sourceH, padding = 4) {
  const sx = Math.floor(sourceX);
  const sy = Math.floor(sourceY);
  const sw = Math.max(1, Math.ceil(sourceX + sourceW) - sx);
  const sh = Math.max(1, Math.ceil(sourceY + sourceH) - sy);
  const key = `${name}:${sx}:${sy}:${sw}:${sh}:${padding}`;
  if (spriteFrameBoundsCache.has(key)) return spriteFrameBoundsCache.get(key);
  const scratch = document.createElement("canvas");
  scratch.width = sw;
  scratch.height = sh;
  const scratchCtx = scratch.getContext("2d");
  scratchCtx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);
  const pixels = scratchCtx.getImageData(0, 0, sw, sh).data;
  const visited = new Uint8Array(sw * sh);
  const components = [];
  for (let y = 0; y < sh; y += 1) {
    for (let x = 0; x < sw; x += 1) {
      const startIndex = y * sw + x;
      if (visited[startIndex] || pixels[startIndex * 4 + 3] <= 8) continue;
      const stack = [startIndex];
      visited[startIndex] = 1;
      let minX = x;
      let minY = y;
      let maxX = x;
      let maxY = y;
      let area = 0;
      while (stack.length) {
        const index = stack.pop();
        const cx = index % sw;
        const cy = Math.floor(index / sw);
        area += 1;
        minX = Math.min(minX, cx);
        minY = Math.min(minY, cy);
        maxX = Math.max(maxX, cx);
        maxY = Math.max(maxY, cy);
        for (let oy = -1; oy <= 1; oy += 1) {
          for (let ox = -1; ox <= 1; ox += 1) {
            if (!ox && !oy) continue;
            const nx = cx + ox;
            const ny = cy + oy;
            if (nx < 0 || ny < 0 || nx >= sw || ny >= sh) continue;
            const neighborIndex = ny * sw + nx;
            if (visited[neighborIndex] || pixels[neighborIndex * 4 + 3] <= 8) continue;
            visited[neighborIndex] = 1;
            stack.push(neighborIndex);
          }
        }
      }
      components.push({ minX, minY, maxX, maxY, area });
    }
  }
  const largest = components.sort((a, b) => b.area - a.area)[0];
  const kept = largest
    ? components.filter((component) => {
      if (component === largest) return true;
      const touchesSide = component.minX <= 2 || component.maxX >= sw - 3;
      return component.area >= Math.max(48, largest.area * 0.02) && !touchesSide;
    })
    : [];
  const bounds = kept.reduce((acc, component) => ({
    minX: Math.min(acc.minX, component.minX),
    minY: Math.min(acc.minY, component.minY),
    maxX: Math.max(acc.maxX, component.maxX),
    maxY: Math.max(acc.maxY, component.maxY)
  }), { minX: sw, minY: sh, maxX: -1, maxY: -1 });
  const left = Math.max(0, bounds.minX - padding);
  const top = Math.max(0, bounds.minY - padding);
  const right = Math.min(sw, bounds.maxX + 1 + padding);
  const bottom = Math.min(sh, bounds.maxY + 1 + padding);
  const result = bounds.maxX < 0
    ? { sourceX, sourceY, sourceW, sourceH }
    : {
      sourceX: sx + left,
      sourceY: sy + top,
      sourceW: Math.max(1, right - left),
      sourceH: Math.max(1, bottom - top)
    };
  spriteFrameBoundsCache.set(key, result);
  return result;
}

function drawSprite(name, x, y, w, h, options = {}) {
  const image = spriteImages[name];
  const imageW = image?.naturalWidth || image?.width || 0;
  const imageH = image?.naturalHeight || image?.height || 0;
  if (!spritesReady || !image || image.complete === false || !imageW || !imageH) return false;
  const frames = spriteFrameCount(name);
  const rows = spriteRowCount(name);
  const sourceW = imageW / frames;
  const sourceH = imageH / rows;
  const fps = options.fps || spriteDefaultFps(name);
  const frame = Number.isFinite(options.frame)
    ? Math.floor(options.frame) % frames
    : Math.floor((performance.now() / 1000) * fps) % frames;
  const row = clamp(Number.isFinite(options.row) ? Math.floor(options.row) : 0, 0, rows - 1);
  const sourceX = sourceW * frame;
  const sourceY = sourceH * row;
  const source = options.trim
    ? trimmedSpriteSource(name, image, sourceX, sourceY, sourceW, sourceH, options.trimPadding || 4)
    : { sourceX, sourceY, sourceW, sourceH };
  ctx.save();
  if (options.flip) {
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
    ctx.drawImage(image, source.sourceX, source.sourceY, source.sourceW, source.sourceH, 0, 0, w, h);
  } else {
    ctx.drawImage(image, source.sourceX, source.sourceY, source.sourceW, source.sourceH, x, y, w, h);
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

function recipeSiteNear(point) {
  return recipeSites.find((site) => !recipeUnlocked(site.recipeId) && dist(point, site) < 72) || null;
}

function machineSiteNear(point) {
  return machineSites.find((site) => machineSiteReady(site) && dist(point, site) < 84) || null;
}

function machineSiteUnderPlayer() {
  return machineSites.find((site) => machineSiteReady(site) && dist(state.player, site) < 92) || null;
}

function updateMachineSiteEntry() {
  const site = machineSiteUnderPlayer();
  if (!site) {
    enteredMachineSiteId = null;
    return false;
  }
  if (enteredMachineSiteId === site.id || modalOpen || variableFlowGame || buildMode || moveMode || removeMode || repairMode) return false;
  enteredMachineSiteId = site.id;
  beginVariableFlowRepair(site);
  return true;
}

function beginRecipeChallenge(site) {
  const recipe = recipeById(site.recipeId);
  if (dist(state.player, site) > 132) {
    showCenterMessage("Move closer to the recipe cache.");
    setMessage("A recipe cache is waiting out there. Walk close before opening it.", 4);
    return;
  }
  activeTask = selectLearningTask(Math.min(5, Math.max(1, recipe.ingredients.length + 1)));
  activeTaskContext = { kind: "recipe", recipeId: recipe.id, siteId: site.id };
  setMessage(`Solve the field note challenge to learn ${recipe.name}.`, 4);
  renderLearningTask(activeTask, activeTaskContext);
}

const variableFlowDirections = [
  { id: 0, dx: 0, dy: -1 },
  { id: 1, dx: 1, dy: 0 },
  { id: 2, dx: 0, dy: 1 },
  { id: 3, dx: -1, dy: 0 }
];

const variableFlowTemplates = [
  {
    source: [0, 2],
    receiver: [4, 2],
    path: [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2]],
    operationSlots: [1, 2, 3]
  },
  {
    source: [0, 1],
    receiver: [4, 3],
    path: [[0, 1], [1, 1], [1, 2], [2, 2], [3, 2], [3, 3], [4, 3]],
    operationSlots: [1, 3, 5]
  },
  {
    source: [0, 3],
    receiver: [4, 1],
    path: [[0, 3], [1, 3], [2, 3], [2, 2], [2, 1], [3, 1], [4, 1]],
    operationSlots: [1, 3, 5]
  },
  {
    source: [0, 2],
    receiver: [4, 1],
    path: [[0, 2], [1, 2], [1, 3], [2, 3], [3, 3], [3, 2], [3, 1], [4, 1]],
    operationSlots: [2, 4, 6]
  }
];

const variableFlowOperationSets = [
  { xValue: 3, operations: [{ kind: "add", amount: 4 }, { kind: "multiply", amount: 2 }, { kind: "subtract", amount: 3 }] },
  { xValue: 5, operations: [{ kind: "multiply", amount: 3 }, { kind: "subtract", amount: 4 }, { kind: "add", amount: 6 }] },
  { xValue: 8, operations: [{ kind: "divide", amount: 2 }, { kind: "add", amount: 5 }, { kind: "multiply", amount: 3 }] },
  { xValue: 6, operations: [{ kind: "add", amount: 6 }, { kind: "divide", amount: 3 }, { kind: "multiply", amount: 4 }] },
  { xValue: 4, operations: [{ kind: "multiply", amount: 2 }, { kind: "add", amount: 3 }, { kind: "subtract", amount: 5 }] },
  { xValue: 2, operations: [{ kind: "add", amount: 7 }, { kind: "multiply", amount: 4 }, { kind: "subtract", amount: 5 }] },
  { xValue: 12, operations: [{ kind: "divide", amount: 3 }, { kind: "multiply", amount: 4 }, { kind: "add", amount: 7 }] },
  { xValue: 9, operations: [{ kind: "add", amount: 3 }, { kind: "divide", amount: 2 }, { kind: "multiply", amount: 5 }] },
  { xValue: 10, operations: [{ kind: "subtract", amount: 4 }, { kind: "divide", amount: 2 }, { kind: "multiply", amount: 3 }] },
  { xValue: 7, operations: [{ kind: "multiply", amount: 3 }, { kind: "subtract", amount: 6 }, { kind: "divide", amount: 3 }] },
  { xValue: 15, operations: [{ kind: "subtract", amount: 5 }, { kind: "divide", amount: 2 }, { kind: "add", amount: 9 }] },
  { xValue: 2, operations: [{ kind: "add", amount: 1 }, { kind: "square" }, { kind: "subtract", amount: 4 }] },
  { xValue: 3, operations: [{ kind: "square" }, { kind: "add", amount: 5 }, { kind: "divide", amount: 2 }] },
  { xValue: 4, operations: [{ kind: "negate" }, { kind: "add", amount: 10 }, { kind: "multiply", amount: 2 }] },
  { xValue: 6, operations: [{ kind: "subtract", amount: 8 }, { kind: "negate" }, { kind: "multiply", amount: 3 }] }
];

const variableFlowDecoyOperationAmounts = {
  add: [1, 2, 3, 4, 5, 6, 8, 9],
  subtract: [1, 2, 3, 4, 5, 6, 7],
  multiply: [2, 3, 4, 5],
  divide: [2, 3, 4, 5]
};

function variableFlowOperationLabel(operation) {
  if (operation.kind === "multiply") return `x${operation.amount}`;
  if (operation.kind === "divide") return `/${operation.amount}`;
  if (operation.kind === "square") return "x^2";
  if (operation.kind === "negate") return "-x";
  return `${operation.kind === "add" ? "+" : "-"}${operation.amount}`;
}

function variableFlowOperationKey(operation) {
  return `${operation.kind}:${operation.amount}`;
}

function variableFlowDecoyOperation(rng, solutionOperations = []) {
  const solutionKeys = new Set(solutionOperations.map(variableFlowOperationKey));
  const kinds = [...Object.keys(variableFlowDecoyOperationAmounts), "square", "negate"];
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const kind = kinds[Math.floor(rng() * kinds.length)];
    const amounts = variableFlowDecoyOperationAmounts[kind];
    const operation = amounts
      ? { kind, amount: amounts[Math.floor(rng() * amounts.length)] }
      : { kind };
    if (!solutionKeys.has(variableFlowOperationKey(operation))) return operation;
  }
  return { kind: "add", amount: 1 };
}

function variableFlowApply(value, operation) {
  if (operation.kind === "add") return value + operation.amount;
  if (operation.kind === "subtract") return value - operation.amount;
  if (operation.kind === "multiply") return value * operation.amount;
  if (operation.kind === "square") return value ** 2;
  if (operation.kind === "negate") return -value;
  return value / operation.amount;
}

function variableFlowExpression(expression, operation) {
  if (operation.kind === "add") return `${expression} + ${operation.amount}`;
  if (operation.kind === "subtract") return `${expression} - ${operation.amount}`;
  if (operation.kind === "multiply") return `${operation.amount}(${expression})`;
  if (operation.kind === "square") return `(${expression})^2`;
  if (operation.kind === "negate") return `-(${expression})`;
  return `(${expression}) / ${operation.amount}`;
}

function variableFlowCellIndex(x, y) {
  return y * 5 + x;
}

function variableFlowCellPoint(index) {
  return { x: index % 5, y: Math.floor(index / 5) };
}

function variableFlowDirectionBetween(from, to) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  return variableFlowDirections.find((direction) => direction.dx === dx && direction.dy === dy)?.id ?? 1;
}

function variableFlowRotatedPorts(ports, rotation = 0) {
  return ports.map((port) => (port + rotation) % 4).sort((a, b) => a - b);
}

function variableFlowPortsKey(ports) {
  return [...ports].sort((a, b) => a - b).join("-");
}

function variableFlowBasePorts(kind) {
  if (kind === "straight") return [0, 2];
  if (kind === "elbow") return [0, 1];
  if (kind === "tee") return [0, 1, 2];
  if (kind === "cross") return [0, 1, 2, 3];
  return [];
}

function variableFlowPipeForPorts(requiredPorts) {
  const required = variableFlowPortsKey(requiredPorts);
  const kinds = requiredPorts.length === 2 ? ["straight", "elbow"] : ["tee", "cross"];
  for (const kind of kinds) {
    for (let rotation = 0; rotation < 4; rotation += 1) {
      if (variableFlowPortsKey(variableFlowRotatedPorts(variableFlowBasePorts(kind), rotation)) === required) {
        return { kind, solutionRotation: rotation };
      }
    }
  }
  return { kind: "straight", solutionRotation: 1 };
}

function variableFlowTransformCell(cell, rotation = 0, mirror = false) {
  let [x, y] = mirror ? [4 - cell[0], cell[1]] : cell;
  for (let turn = 0; turn < rotation; turn += 1) {
    [x, y] = [4 - y, x];
  }
  return [x, y];
}

function variableFlowTemplateVariant(template, rotation = 0, mirror = false) {
  const path = template.path.map((cell) => variableFlowTransformCell(cell, rotation, mirror));
  return {
    ...template,
    source: path[0],
    receiver: path[path.length - 1],
    path
  };
}

function createVariableFlowPuzzle(site) {
  const rng = createSeededRandom(`${state.worldSeed || "flow"}:${site.puzzleSeed}:${worldDayNumber()}:${state.wave.number}`);
  const template = variableFlowTemplateVariant(
    variableFlowTemplates[Math.floor(rng() * variableFlowTemplates.length)],
    Math.floor(rng() * 4),
    rng() < 0.5
  );
  const operationSet = variableFlowOperationSets[Math.floor(rng() * variableFlowOperationSets.length)];
  const board = Array.from({ length: 25 }, () => null);
  const operations = operationSet.operations.map((operation) => ({ ...operation }));
  const operationBySlot = new Map(template.operationSlots.map((slot, index) => [slot, operations[index]]));
  template.path.forEach((cell, pathIndex) => {
    const index = variableFlowCellIndex(cell[0], cell[1]);
    const previous = template.path[pathIndex - 1];
    const next = template.path[pathIndex + 1];
    if (!previous) {
      board[index] = { kind: "source", ports: [variableFlowDirectionBetween(cell, next)], rotatable: false };
      return;
    }
    if (!next) {
      board[index] = { kind: "receiver", ports: [variableFlowDirectionBetween(cell, previous)], rotatable: false };
      return;
    }
    const ports = [variableFlowDirectionBetween(cell, previous), variableFlowDirectionBetween(cell, next)];
    const pipe = variableFlowPipeForPorts(ports);
    board[index] = {
      ...pipe,
      rotation: (pipe.solutionRotation + 1 + Math.floor(rng() * 3)) % 4,
      rotatable: true,
      operation: operationBySlot.get(pathIndex) || null,
      onSolutionPath: true
    };
  });
  board.forEach((tile, index) => {
    if (tile) return;
    const distractionKinds = ["straight", "elbow", "elbow", "tee", "tee", "cross"];
    const kind = distractionKinds[Math.floor(rng() * distractionKinds.length)];
    board[index] = {
      kind,
      rotation: Math.floor(rng() * 4),
      rotatable: true,
      distraction: true,
      operation: rng() < 0.88 ? variableFlowDecoyOperation(rng, operations) : null
    };
  });
  const target = operations.reduce((value, operation) => variableFlowApply(value, operation), operationSet.xValue);
  return {
    board,
    sourceIndex: variableFlowCellIndex(template.source[0], template.source[1]),
    receiverIndex: variableFlowCellIndex(template.receiver[0], template.receiver[1]),
    operations,
    xValue: operationSet.xValue,
    target,
    reward: gameConfig.variableFlow.baseLearningPointReward || defaultGameConfig.variableFlow.baseLearningPointReward || 6
  };
}

function variableFlowTilePorts(tile) {
  if (!tile) return [];
  if (tile.kind === "source" || tile.kind === "receiver") return tile.ports || [];
  return variableFlowRotatedPorts(variableFlowBasePorts(tile.kind), tile.rotation || 0);
}

function variableFlowNeighborIndex(index, directionId) {
  const point = variableFlowCellPoint(index);
  const direction = variableFlowDirections[directionId];
  const x = point.x + direction.dx;
  const y = point.y + direction.dy;
  return x < 0 || x >= 5 || y < 0 || y >= 5 ? -1 : variableFlowCellIndex(x, y);
}

function variableFlowConnectedPaths(game, maxPaths = 64) {
  const paths = [];
  const findPath = (index, path, visited) => {
    if (paths.length >= maxPaths) return;
    if (index === game.puzzle.receiverIndex) {
      paths.push([...path]);
      return;
    }
    const tile = game.puzzle.board[index];
    const options = variableFlowTilePorts(tile)
      .map((port) => {
        const nextIndex = variableFlowNeighborIndex(index, port);
        const next = game.puzzle.board[nextIndex];
        return { port, nextIndex, next };
      })
      .filter(({ port, nextIndex, next }) => nextIndex >= 0
        && !visited.has(nextIndex)
        && variableFlowTilePorts(next).includes((port + 2) % 4))
      .sort((left, right) => Number(Boolean(right.next?.onSolutionPath)) - Number(Boolean(left.next?.onSolutionPath)));
    options.forEach(({ nextIndex }) => {
      if (paths.length >= maxPaths) return;
      visited.add(nextIndex);
      path.push(nextIndex);
      findPath(nextIndex, path, visited);
      path.pop();
      visited.delete(nextIndex);
    });
  };
  findPath(game.puzzle.sourceIndex, [game.puzzle.sourceIndex], new Set([game.puzzle.sourceIndex]));
  return paths;
}

function variableFlowTraceForPath(game, path) {
  let value = game.puzzle.xValue;
  let expression = "x";
  const steps = [{ expression, value }];
  path.forEach((index) => {
    const operation = game.puzzle.board[index]?.operation;
    if (!operation) return;
    expression = variableFlowExpression(expression, operation);
    value = variableFlowApply(value, operation);
    steps.push({ expression, value, operation });
  });
  return steps;
}

function beginVariableFlowRepair(site) {
  if (dist(state.player, site) > 148) {
    showCenterMessage("Move closer to the broken machine.");
    setMessage("A generator repair machine is sparking nearby. Step onto it to route its flow.", 5);
    return;
  }
  enteredMachineSiteId = site.id;
  variableFlowGame = {
    siteId: site.id,
    puzzle: createVariableFlowPuzzle(site),
    status: "Rotate brass pipe pieces, then send algebra steam to the target receiver.",
    outcome: "",
    path: [],
    trace: [],
    rewarded: false
  };
  setMessage("Broken machine opened. Stabilize its Variable Flow Network for learning points.", 5);
  renderVariableFlowRepair();
}

function variableFlowTileMarkup(tile, index, activePath, puzzle) {
  if (!tile) return '<span class="flow-cell flow-empty" aria-hidden="true"></span>';
  const active = activePath.includes(index) ? " flow-active" : "";
  if (tile.kind === "source") {
    return `
      <span class="flow-cell flow-terminal flow-source${active}">
        <small>Source</small>
        <strong>x=${puzzle.xValue}</strong>
      </span>
    `;
  }
  if (tile.kind === "receiver") {
    return `
      <span class="flow-cell flow-terminal flow-receiver${active}">
        <small>Target</small>
        <strong>${puzzle.target}</strong>
      </span>
    `;
  }
  return `
    <button class="flow-cell flow-pipe flow-${tile.kind}${active} ${tile.operation ? "flow-operation" : ""}" style="--pipe-turn:${tile.rotation || 0}" data-flow-rotate="${index}" type="button" ${variableFlowGame?.rewarded ? "disabled" : ""} aria-label="Rotate pipe">
      <i class="flow-pipe-shape" aria-hidden="true"></i>
      ${tile.operation ? `<strong>${variableFlowOperationLabel(tile.operation)}</strong>` : ""}
    </button>
  `;
}

function renderVariableFlowRepair() {
  if (!variableFlowGame) return;
  const game = variableFlowGame;
  const trace = game.trace.length
    ? game.trace.map((step, index) => `<span>${index ? step.expression : "x"} = ${Number.isInteger(step.value) ? step.value : step.value.toFixed(2)}</span>`).join("")
    : '<span>Current equation waits inside the source crystal.</span>';
  hud.modalEyebrow.textContent = "Broken Machine";
  hud.modalTitle.textContent = "Variable Flow Network";
  hud.modalBody.innerHTML = `
    <section class="variable-flow-console ${game.outcome}">
      <p class="flow-status">${game.status}</p>
      <section class="flow-equation-panel">
        <small>Algebra Flow</small>
        <div class="flow-equation-trace" aria-live="polite">${trace}</div>
      </section>
      <div class="variable-flow-grid" aria-label="Variable Flow pipe grid">
        ${game.puzzle.board.map((tile, index) => variableFlowTileMarkup(tile, index, game.path, game.puzzle)).join("")}
      </div>
      <div class="modal-actions flow-actions">
        <button id="flowSimulate" class="primary" type="button" ${game.rewarded ? "disabled" : ""}>Send Steam</button>
        <button id="flowClose" type="button">${game.rewarded ? "Return To Camp" : "Leave Machine"}</button>
      </div>
    </section>
  `;
  openModal();
  document.querySelectorAll("[data-flow-rotate]").forEach((button) => {
    button.addEventListener("click", () => rotateVariableFlowPipe(Number(button.dataset.flowRotate)));
  });
  document.querySelector("#flowSimulate")?.addEventListener("click", simulateVariableFlowRepair);
  document.querySelector("#flowClose")?.addEventListener("click", () => {
    variableFlowGame = null;
    closeModal(true);
  });
}

function rotateVariableFlowPipe(index) {
  const tile = variableFlowGame?.puzzle.board[index];
  if (!tile?.rotatable || variableFlowGame.rewarded) return;
  tile.rotation = ((tile.rotation || 0) + 1) % 4;
  variableFlowGame.path = [];
  variableFlowGame.trace = [];
  variableFlowGame.outcome = "";
  variableFlowGame.status = tile.operation
    ? `${variableFlowOperationLabel(tile.operation)} regulator turned. Recheck the pressure path.`
    : "Pipe ring turned. Send steam when the network looks continuous.";
  playSound("pickup");
  renderVariableFlowRepair();
}

function rewardVariableFlowRepair(game) {
  if (game.rewarded) return;
  const reward = game.puzzle.reward;
  game.rewarded = true;
  state.learningPoints += reward;
  state.machineCooldowns = state.machineCooldowns || {};
  state.machineCooldowns[game.siteId] = variableFlowRepairCooldownSeconds();
  pushNotification({
    id: `flow-repair-${game.siteId}-${Date.now()}`,
    title: "Machine Stabilized",
    copy: `Variable Flow repair complete. +${reward} learning points.`
  });
  setMessage(`Variable Flow repair stabilized. +${reward} learning points. The machine will fail again in five in-game days.`, 7);
  playSound("upgrade");
  saveState();
}

function simulateVariableFlowRepair() {
  if (!variableFlowGame || variableFlowGame.rewarded) return;
  const paths = variableFlowConnectedPaths(variableFlowGame);
  if (!paths.length) {
    variableFlowGame.path = [];
    variableFlowGame.trace = [];
    variableFlowGame.outcome = "failed";
    variableFlowGame.status = "Pressure sputters before the receiver. Rotate disconnected pipes and retry.";
    playSound("fail");
    renderVariableFlowRepair();
    return;
  }
  const flows = paths.map((path) => {
    const trace = variableFlowTraceForPath(variableFlowGame, path);
    return { path, trace, result: trace[trace.length - 1]?.value };
  });
  const stableFlow = flows.find((flow) => Math.abs(flow.result - variableFlowGame.puzzle.target) <= 0.001);
  const visibleFlow = stableFlow || flows[0];
  variableFlowGame.path = visibleFlow.path;
  variableFlowGame.trace = visibleFlow.trace;
  if (!stableFlow) {
    variableFlowGame.outcome = "failed";
    variableFlowGame.status = `Pressure overload: the receiver measured ${visibleFlow.result}, not ${variableFlowGame.puzzle.target}.`;
    playSound("fail");
    renderVariableFlowRepair();
    return;
  }
  variableFlowGame.outcome = "success";
  variableFlowGame.status = "Generator stabilized. Brass pipes glow and the receiver holds steady.";
  rewardVariableFlowRepair(variableFlowGame);
  renderVariableFlowRepair();
}

function unlockRecipe(recipeId) {
  const recipe = recipeById(recipeId);
  state.unlockedRecipes = Array.from(new Set([...(state.unlockedRecipes || []), recipe.id]));
  activeTask = null;
  activeTaskContext = null;
  setMessage(`${recipe.name} unlocked. Select it at the Kitchen Hall when its Root Cellar ingredients are ready.`, 6);
  playSound("upgrade");
  saveState();
  closeModal(true);
}

function unlockIngredientRecipe(ingredientType) {
  const recipe = recipeCatalog.find((entry) => entry.unlockOnIngredient === ingredientType);
  if (!recipe || recipeUnlocked(recipe.id)) return false;
  state.unlockedRecipes = Array.from(new Set([...(state.unlockedRecipes || []), recipe.id]));
  pushNotification({
    id: `recipe-${recipe.id}`,
    title: "Recipe Learned",
    copy: `${recipe.name} unlocked from your first ${resourceMeta[ingredientType]?.label || "ingredient"}.`
  });
  setMessage(`${recipe.name} unlocked. Select it at the Kitchen Hall.`, 6);
  playSound("success");
  saveState();
  return true;
}

function groundSpawnBlocked(point, padding = 24) {
  if (pointInLake(point, padding)) return true;
  const rect = { x: point.x - padding, y: point.y - padding, w: padding * 2, h: padding * 2 };
  if (Object.values(buildings || {}).some((building) => rectanglesOverlap(rect, building))) return true;
  return state.structures.some((structure) => rectanglesOverlap(rect, structureRect(structure)));
}

function clearTreesInRect(rect) {
  let removed = 0;
  trees.forEach((tree) => {
    if (!tree.alive) return;
    const treeRect = { x: tree.x - 38, y: tree.y - 58, w: 76, h: 116 };
    if (!rectanglesOverlap(rect, treeRect)) return;
    tree.alive = false;
    tree.progress = 0;
    tree.respawn = tree.type === "berryBush"
      ? gameConfig.trees.berryRespawnSeconds
      : gameConfig.trees.respawnSeconds;
    removed += 1;
  });
  if (removed) addBurst(rect.x + rect.w / 2, rect.y + rect.h / 2, resourceMeta.wood.color, Math.min(18, removed * 2));
  return removed;
}

function freeGroundPointNear(x, y) {
  const origin = { x: clamp(x, 80, world.width - 80), y: clamp(y, 80, world.height - 80) };
  if (!groundSpawnBlocked(origin)) return origin;
  for (let attempt = 0; attempt < 36; attempt += 1) {
    const ring = 38 + attempt * 12;
    const angle = attempt * 2.399963229728653;
    const point = {
      x: clamp(origin.x + Math.cos(angle) * ring, 80, world.width - 80),
      y: clamp(origin.y + Math.sin(angle) * ring, 80, world.height - 80)
    };
    if (!groundSpawnBlocked(point)) return point;
  }
  return null;
}

function spawnResource(type, x, y, amount = 1) {
  const point = freeGroundPointNear(x, y);
  if (!point) return;
  resources.push({
    id: `${type}-${Date.now()}-${Math.random()}`,
    type,
    x: point.x,
    y: point.y,
    amount,
    bob: Math.random() * Math.PI * 2,
    age: 0,
    pop: 0,
    expiring: false,
    pickupLock: false
  });
}

function updateGroundResources(dt) {
  const config = gameConfig.resources || defaultGameConfig.resources;
  const ttl = config.groundTtlSeconds || 120;
  const popSeconds = config.popSeconds || 0.35;
  resources.forEach((resource) => {
    if (resource.pickupLock) return;
    resource.age = (resource.age || 0) + dt;
    if (resource.age >= ttl && !resource.expiring) {
      resource.expiring = true;
      resource.pop = popSeconds;
      addBurst(resource.x, resource.y, resourceMeta[resource.type]?.color || "#dff7ff", 8);
    } else if (resource.expiring) {
      resource.pop -= dt;
    }
  });
  resources = resources.filter((resource) => resource.pickupLock || !resource.expiring || resource.pop > 0);
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
  if (resource.pickupLock || resource.expiring || availableCarrySpace() <= 0) return;
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
    unlockIngredientRecipe(resource.type);
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

function updateDropoffs() {
  const p = state.player;
  const transferConfig = gameConfig.transfers;
  const woodDropoff = closestStorageShedDropoff(p);
  if (dist(p, woodDropoff) < transferConfig.woodDropDistance && state.carry.wood > 0) {
    transferCarry("wood", 1, woodDropoff, (amount) => {
      state.stored.wood += amount;
      setMessage("Wood added to Storage Shed inventory.");
    });
  }

  const foodDropoff = closestRootCellarDropoff(p);
  const carriedFood = rawFoodTypes.find((type) => (state.carry[type] || 0) > 0);
  if (carriedFood && dist(p, foodDropoff) < transferConfig.foodDropDistance) {
    transferCarry(carriedFood, 1, foodDropoff, (amount) => {
      state.stored[carriedFood] = (state.stored[carriedFood] || 0) + amount;
      setMessage(`${resourceMeta[carriedFood].label} stored in the Root Cellar.`);
    });
  }

  const mealPrep = closestFoodPrep(p);
  if (mealPrep && dist(p, foodPrepMealDropoff(mealPrep)) < transferConfig.diningDropDistance && state.carry.meal > 0) {
    transferCarry("meal", 1, foodPrepMealDropoff(mealPrep), (amount) => {
      mealPrep.meals += amount;
      setMessage("Meal added to the Kitchen Hall serving counter.");
    });
  }
}

function updateFoodPrep(dt) {
  const workDt = dt * generatorProductivityMultiplier();
  foodPreps().forEach((prep) => {
    const rect = foodPrepRect(prep);
    const recipe = currentPrepRecipe(prep);
    const playerCooking = pointInRect(state.player, rect, 20);
    if (!recipeHasIngredients(recipe)) {
      prep.processProgress = 0;
      prep.wordMealBonus = 0;
      if (cookingMiniGame?.prepId === foodPrepId(prep)) stopCookingMiniGame();
      return;
    }
    if (!playerCooking) {
      if (cookingMiniGame?.prepId === foodPrepId(prep)) stopCookingMiniGame();
      return;
    }
    const timeNeeded = foodProcessSeconds(prep);
    startCookingMiniGame(prep, recipe, timeNeeded);
    prep.processProgress += workDt;
    if (prep.processProgress >= timeNeeded) {
      if (!consumeRecipeIngredients(recipe)) {
        prep.processProgress = 0;
        stopCookingMiniGame();
        return;
      }
      const meals = (recipe.meals || 1) + (prep.wordMealBonus || 0);
      prep.meals += meals;
      prep.processProgress = 0;
      prep.wordMealBonus = 0;
      stopCookingMiniGame(true);
      const mealPoint = foodPrepMealDropoff(prep);
      addBurst(mealPoint.x, mealPoint.y, resourceMeta.meal.color, 8);
      setMessage(`${recipe.name} added ${meals} meal${meals === 1 ? "" : "s"} to the Kitchen Hall counter.`);
      playSound("cook");
    }
  });
}

function updateDiningHall(dt) {
  const populationBonus = 1 + Math.max(0, mealServingDemand() - 1) * (gameConfig.cabin.mealPopulationSpeedBonus || 0.18);
  foodPreps().forEach((prep) => {
    prep.servedPulse = Math.max(0, (prep.servedPulse || 0) - dt);
    if (prep.meals <= 0) {
      prep.serveProgress = 0;
      return;
    }
    const serveSeconds = Math.max(2.2, (gameConfig.cabin.diningServeSeconds - Math.max(0, prep.level - 1) * 1.25) / populationBonus);
    prep.serveProgress += dt * generatorProductivityMultiplier();
    if (prep.serveProgress < serveSeconds) return;
    prep.serveProgress = 0;
    const servings = Math.min(prep.meals, mealServingDemand());
    prep.meals = Math.max(0, prep.meals - servings);
    prep.servedPulse = 0.9;
    const relief = servings * gameConfig.cabin.mealHungerRelief;
    buildings.cabin.hunger = clamp(buildings.cabin.hunger - relief, 0, buildings.cabin.maxHunger);
    setMessage(`The Kitchen Hall served ${servings} meal${servings === 1 ? "" : "s"}.`);
    playSound("cook");
  });
}

function mealServingDemand() {
  const experts = state.survivors.filter((survivor) => survivor.health > 0).length;
  const residents = (state.cityResidents || []).filter((resident) => resident.health > 0).length;
  return Math.max(1, experts + residents + 1);
}

function updateFarm(dt) {
  if (!buildings.farm) return;
  const farm = buildings.farm;
  const period = farmProduceSeconds();
  farm.produceProgress += dt * generatorProductivityMultiplier();
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
    farm.produceProgress = (farm.produceProgress || 0) + dt * generatorProductivityMultiplier();
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
  furnace.hatchPulse = Math.max(0, (furnace.hatchPulse || 0) - dt * 0.72);
}

function updateCabin(dt) {
  const cabin = buildings.cabin;
  if (totalPreparedMeals() > 0) {
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
  if (activeTree) updateWoodChopMiniGame(activeTree, activeTree.type === "berryBush" ? (gameConfig.trees.berryGatherSeconds || 3) : treeChopSeconds(), dt);
  else stopWoodChopMiniGame();
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
    if (!(woodChopMiniGame?.treeId === tree.id && woodChopMiniGame.active)) return;
    tree.progress += dt;
    tree.shake = 0.15;
    if (tree.progress >= chopTime) {
      tree.alive = false;
      tree.respawn = isBush ? (gameConfig.trees.berryRespawnSeconds || gameConfig.trees.respawnSeconds) : gameConfig.trees.respawnSeconds;
      tree.progress = 0;
      const dropType = isBush ? (tree.berryType || "blueberries") : "wood";
      const dropCount = isBush ? (gameConfig.trees.berryDrops || 3) : gameConfig.trees.woodDrops;
      addBurst(tree.x, tree.y, resourceMeta[dropType].color, isBush ? 10 : 16);
      for (let i = 0; i < dropCount; i += 1) {
        spawnResource(dropType, tree.x - 45 + Math.random() * 90, tree.y + 15 + Math.random() * 52, 1);
      }
      setMessage(isBush ? `${berryBushStyles[dropType]?.label || "Berry bush"} drops food. Carry it to a Root Cellar.` : "The tree bursts into wood. Pick it up and bring it to a Storage Shed.");
      if (woodChopMiniGame?.treeId === tree.id) stopWoodChopMiniGame();
    }
  });
}

function updateResourcePickup() {
  resources.forEach((resource) => {
    if (!resource.expiring && dist(state.player, resource) < gameConfig.transfers.pickupDistance) pickupResource(resource);
  });
}

function updateVisitor(dt) {
  if (state.wave.survivorCooldown > 0) {
    state.wave.survivorCooldown = Math.max(0, state.wave.survivorCooldown - dt);
  }

  if (pendingVisitor && pendingVisitor.joining) {
    const target = cabinRecruitmentPoint();
    if (!moveActor(pendingVisitor, target, gameConfig.movement.visitorSpeed, dt)) return;
    finishRecruitmentAtCabin();
    return;
  }

  if ((attackActive || state.wave.active) && pendingVisitor && !pendingVisitor.arrived) {
    pendingVisitor = null;
    state.visitor = null;
    survivorCheckTimer = 0;
    setMessage("The gates stay closed during the attack. Experts wait for daylight.", 4);
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
      saveState();
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
  const specialty = nextVisitorSpecialty();
  return {
    id: `${specialty.id}-${Date.now()}`,
    name: uniqueExpertName(specialty),
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
  pendingRecruit.joining = true;
  pendingRecruit.arrived = true;
  pendingRecruit.willReachThree = state.survivors.length === 2 && !state.tutorialFlags.cabinUpgrade;
  if (pendingVisitor) pendingVisitor.joining = true;
  closeModal(true);
  setMessage(`${pendingRecruit.name} accepted the mission and is heading to the Group Cabin.`, 5);
}

function cabinRecruitmentPoint() {
  const center = buildingCenter(buildings.cabin);
  return { x: center.x, y: center.y + buildings.cabin.h * 0.3 };
}

function finishRecruitmentAtCabin() {
  const recruit = pendingRecruit || pendingVisitor;
  if (!recruit) return;
  if (state.survivors.length < survivorCapacity()) {
    const willReachThree = recruit.willReachThree;
    const survivor = normalizeSurvivor(recruit, state.survivors.length);
    if (survivor.specialty === "cook") assignedCookFoodPrep(survivor);
    state.survivors.push(survivor);
    finishVisitor(`${recruit.name} reached the Group Cabin and joined as a level ${recruit.level} ${recruit.title} Expert.`);
    if (willReachThree) window.setTimeout(maybeShowCabinUpgradeTip, 80);
    return;
  }
  replacementRecruit = recruit;
  pendingRecruit = recruit;
  setMessage(`${recruit.name} reached the Group Cabin, but the Expert roster is full.`, 5);
  renderReplacementMenu(replacementRecruit);
  openModal();
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
    clearFriendlyRoute(actor);
    return true;
  }
  const routedWaypoint = friendlyRouteWaypoint(actor, target);
  if (!actor.pathNudge && routedWaypoint) {
    actor.pathNudge = routedWaypoint;
  }
  const gateRoute = barrierRoutePoint(actor, target);
  if (!actor.pathNudge && gateRoute) {
    actor.pathNudge = gateRoute;
  }
  const pathRoute = !actor.pathNudge ? pathRoutePoint(actor, target) : null;
  if (pathRoute) actor.pathNudge = pathRoute;
  if (actor.pathNudge && (dist(actor, actor.pathNudge) <= gameConfig.residents.workDistance || friendlyNavigationPointBlocked(actor.pathNudge))) {
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
  const next = pathBiasedNext(actor, { x: actor.x + mx, y: actor.y + my });
  if (friendlyNavigationPointBlocked(next)) {
    clearFriendlyRoute(actor);
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
  const actualMx = next.x - actor.x;
  const actualMy = next.y - actor.y;
  actor.x = next.x;
  actor.y = next.y;
  actor.walkTime = (actor.walkTime || 0) + Math.hypot(actualMx, actualMy) / gameConfig.movement.walkAnimationDivisor;
  setActorDirection(actor, actualMx, actualMy);
  updateActorStuckState(actor, target, before, true, dt);
  return false;
}

function pathStructures() {
  return state.structures.filter((structure) => structure.type === "path");
}

function nearestPathStructure(point, maxDistance = gridSize()) {
  return pathStructures()
    .map((path) => ({ path, distance: dist(point, path) }))
    .filter((entry) => entry.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)[0]?.path || null;
}

function pathBiasedNext(actor, next) {
  const size = gridSize();
  if (!actorUsesPathRouting(actor)) return next;
  const route = friendlyRouteCache.get(actor);
  if (route && route.index < route.points.length) return next;
  const nearbyPath = nearestPathStructure(next, size * 0.7) || nearestPathStructure(actor, size * 0.95);
  if (!nearbyPath) return next;
  const pull = actor.role === "visitor" || actor.role === "resident" ? 0.34 : 0.24;
  return {
    x: next.x * (1 - pull) + nearbyPath.x * pull,
    y: next.y * (1 - pull) + nearbyPath.y * pull
  };
}

function actorUsesPathRouting(actor) {
  return Boolean(actor && (actor.role === "visitor" || actor.role === "resident" || actor.specialty));
}

function friendlyNavigationPointBlocked(point) {
  return pointInLake(point, 18) || pointBlockedByBarriers(point, true);
}

function friendlyRouteState(actor) {
  if (!friendlyRouteCache.has(actor)) {
    friendlyRouteCache.set(actor, { targetKey: "", points: [], index: 0, retryAt: 0 });
  }
  return friendlyRouteCache.get(actor);
}

function clearFriendlyRoute(actor) {
  const route = friendlyRouteCache.get(actor);
  if (!route) return;
  route.points = [];
  route.index = 0;
  route.retryAt = 0;
}

function friendlyRouteWaypoint(actor, target) {
  const route = friendlyRouteState(actor);
  const targetCell = navigationCell(target);
  const targetKey = navigationCellKey(targetCell);
  if (route.targetKey !== targetKey) {
    route.targetKey = targetKey;
    route.points = [];
    route.index = 0;
    route.retryAt = 0;
    actor.pathNudge = null;
  }

  while (route.index < route.points.length && dist(actor, route.points[route.index]) <= gameConfig.residents.workDistance * 0.82) {
    route.index += 1;
  }
  const waypoint = route.points[route.index];
  if (waypoint && !friendlyNavigationPointBlocked(waypoint)) return waypoint;
  if (waypoint) clearFriendlyRoute(actor);

  if (navigationCellKey(navigationCell(actor)) === targetKey) return null;
  if (route.retryAt > performance.now()) return null;
  route.retryAt = performance.now() + (gameConfig.residents.routeRefreshSeconds || 1.2) * 1000;
  route.points = findFriendlyRoute(actor, target);
  route.index = 0;
  return route.points[0] || null;
}

function navigationGridBounds() {
  const size = gridSize();
  return {
    minCol: Math.ceil((120 - size / 2) / size),
    maxCol: Math.floor((world.width - 120 - size / 2) / size),
    minRow: Math.ceil((90 - size / 2) / size),
    maxRow: Math.floor((world.height - 70 - size / 2) / size)
  };
}

function navigationCell(point) {
  const size = gridSize();
  const bounds = navigationGridBounds();
  return {
    col: clamp(Math.floor(point.x / size), bounds.minCol, bounds.maxCol),
    row: clamp(Math.floor(point.y / size), bounds.minRow, bounds.maxRow)
  };
}

function navigationCellKey(cell) {
  return `${cell.col}:${cell.row}`;
}

function navigationCellPoint(cell) {
  const size = gridSize();
  return {
    x: cell.col * size + size / 2,
    y: cell.row * size + size / 2
  };
}

function navigationCellBlocked(cell, startKey, targetKey, fenceKeys) {
  const key = navigationCellKey(cell);
  if (key === startKey || key === targetKey) return false;
  if (fenceKeys.has(key)) return true;
  return pointInLake(navigationCellPoint(cell), 18);
}

function pathCellKeys() {
  return new Set(pathStructures().map((path) => navigationCellKey(navigationCell(path))));
}

function fenceCellKeys() {
  return new Set(state.structures
    .filter((structure) => structure.type === "fence" && structure.health > 0)
    .map((fence) => navigationCellKey(navigationCell(fence))));
}

function groundBarrierCellKeys() {
  return new Set(state.structures
    .filter((structure) => isBarrierType(structure.type) && structure.health > 0)
    .map((barrier) => navigationCellKey(navigationCell(barrier))));
}

function findFriendlyRoute(actor, target) {
  const start = navigationCell(actor);
  const finish = navigationCell(target);
  const startKey = navigationCellKey(start);
  const targetKey = navigationCellKey(finish);
  if (startKey === targetKey) return [];

  const bounds = navigationGridBounds();
  const pathKeys = actorUsesPathRouting(actor) ? pathCellKeys() : new Set();
  const fenceKeys = fenceCellKeys();
  const pathCost = clamp(gameConfig.residents.pathMoveCost || 0.58, 0.35, 1);
  const minStepCost = pathKeys.size ? pathCost : 1;
  const searchLimit = gameConfig.residents.routeSearchCells || 10000;
  const open = [];
  const closed = new Set();
  const cameFrom = new Map();
  const cells = new Map([[startKey, start]]);
  const scores = new Map([[startKey, 0]]);
  routeHeapPush(open, {
    key: startKey,
    cell: start,
    g: 0,
    f: navigationHeuristic(start, finish) * minStepCost
  });

  const directions = [
    { col: 1, row: 0, cost: 1 },
    { col: -1, row: 0, cost: 1 },
    { col: 0, row: 1, cost: 1 },
    { col: 0, row: -1, cost: 1 },
    { col: 1, row: 1, cost: Math.SQRT2 },
    { col: 1, row: -1, cost: Math.SQRT2 },
    { col: -1, row: 1, cost: Math.SQRT2 },
    { col: -1, row: -1, cost: Math.SQRT2 }
  ];

  let searched = 0;
  while (open.length && searched < searchLimit) {
    const current = routeHeapPop(open);
    if (!current || closed.has(current.key)) continue;
    if (current.key === targetKey) return routePointsFromCells(cameFrom, cells, targetKey, target);
    closed.add(current.key);
    searched += 1;

    directions.forEach((direction) => {
      const cell = { col: current.cell.col + direction.col, row: current.cell.row + direction.row };
      if (cell.col < bounds.minCol || cell.col > bounds.maxCol || cell.row < bounds.minRow || cell.row > bounds.maxRow) return;
      const key = navigationCellKey(cell);
      if (closed.has(key) || navigationCellBlocked(cell, startKey, targetKey, fenceKeys)) return;
      if (direction.col && direction.row) {
        const xCell = { col: current.cell.col + direction.col, row: current.cell.row };
        const yCell = { col: current.cell.col, row: current.cell.row + direction.row };
        if (navigationCellBlocked(xCell, startKey, targetKey, fenceKeys) || navigationCellBlocked(yCell, startKey, targetKey, fenceKeys)) return;
      }
      const tileCost = pathKeys.has(key) ? pathCost : 1;
      const nextScore = current.g + direction.cost * tileCost;
      if (nextScore >= (scores.get(key) ?? Infinity)) return;
      cameFrom.set(key, current.key);
      cells.set(key, cell);
      scores.set(key, nextScore);
      routeHeapPush(open, {
        key,
        cell,
        g: nextScore,
        f: nextScore + navigationHeuristic(cell, finish) * minStepCost
      });
    });
  }
  return [];
}

function groundEnemyPointBlocked(point) {
  return pointInLake(point, 22) || pointBlockedByBarriers(point, false);
}

function groundEnemyRouteState(enemy) {
  if (!groundEnemyRouteCache.has(enemy)) {
    groundEnemyRouteCache.set(enemy, { targetKey: "", points: [], index: 0, retryAt: 0, reachable: false });
  }
  return groundEnemyRouteCache.get(enemy);
}

function clearGroundEnemyRoute(enemy) {
  const route = groundEnemyRouteCache.get(enemy);
  if (!route) return;
  route.points = [];
  route.index = 0;
  route.retryAt = 0;
  route.reachable = false;
}

function groundEnemyTargetKey(target) {
  const cell = navigationCell(target);
  const id = target.actor?.id
    || (target.actor === state.player ? "player" : "")
    || target.building?.id
    || target.structure?.id
    || target.kind;
  return `${id}:${navigationCellKey(cell)}`;
}

function prepareGroundEnemyRoute(enemy, target) {
  const route = groundEnemyRouteState(enemy);
  const targetKey = groundEnemyTargetKey(target);
  if (route.targetKey !== targetKey) {
    route.targetKey = targetKey;
    route.points = [];
    route.index = 0;
    route.retryAt = 0;
    route.reachable = false;
  }

  while (route.index < route.points.length && dist(enemy, route.points[route.index]) <= gameConfig.residents.workDistance * 0.82) {
    route.index += 1;
  }
  const waypoint = route.points[route.index];
  if (waypoint && groundEnemyPointBlocked(waypoint)) clearGroundEnemyRoute(enemy);
  if (route.reachable && (route.points[route.index] || navigationCellKey(navigationCell(enemy)) === navigationCellKey(navigationCell(target)))) {
    return route;
  }
  if (route.retryAt > performance.now()) return route;

  route.retryAt = performance.now() + (gameConfig.residents.routeRefreshSeconds || 1.2) * 1000;
  const points = findGroundEnemyRoute(enemy, target);
  route.reachable = points !== null;
  route.points = points || [];
  route.index = 0;
  return route;
}

function groundEnemyRoutePoint(enemy, target) {
  const route = prepareGroundEnemyRoute(enemy, target);
  return route.reachable ? route.points[route.index] || target : target;
}

function findGroundEnemyRoute(enemy, target) {
  const start = navigationCell(enemy);
  const finish = navigationCell(target);
  const startKey = navigationCellKey(start);
  const targetKey = navigationCellKey(finish);
  if (startKey === targetKey) return [];

  const bounds = navigationGridBounds();
  const barrierKeys = groundBarrierCellKeys();
  const searchLimit = gameConfig.residents.routeSearchCells || 10000;
  const open = [];
  const closed = new Set();
  const cameFrom = new Map();
  const cells = new Map([[startKey, start]]);
  const scores = new Map([[startKey, 0]]);
  routeHeapPush(open, { key: startKey, cell: start, g: 0, f: navigationHeuristic(start, finish) });

  const directions = [
    { col: 1, row: 0, cost: 1 },
    { col: -1, row: 0, cost: 1 },
    { col: 0, row: 1, cost: 1 },
    { col: 0, row: -1, cost: 1 },
    { col: 1, row: 1, cost: Math.SQRT2 },
    { col: 1, row: -1, cost: Math.SQRT2 },
    { col: -1, row: 1, cost: Math.SQRT2 },
    { col: -1, row: -1, cost: Math.SQRT2 }
  ];

  let searched = 0;
  while (open.length && searched < searchLimit) {
    const current = routeHeapPop(open);
    if (!current || closed.has(current.key)) continue;
    if (current.key === targetKey) return routePointsFromCells(cameFrom, cells, targetKey, target);
    closed.add(current.key);
    searched += 1;

    directions.forEach((direction) => {
      const cell = { col: current.cell.col + direction.col, row: current.cell.row + direction.row };
      if (cell.col < bounds.minCol || cell.col > bounds.maxCol || cell.row < bounds.minRow || cell.row > bounds.maxRow) return;
      const key = navigationCellKey(cell);
      if (closed.has(key) || navigationCellBlocked(cell, startKey, targetKey, barrierKeys)) return;
      if (direction.col && direction.row) {
        const xCell = { col: current.cell.col + direction.col, row: current.cell.row };
        const yCell = { col: current.cell.col, row: current.cell.row + direction.row };
        if (navigationCellBlocked(xCell, startKey, targetKey, barrierKeys) || navigationCellBlocked(yCell, startKey, targetKey, barrierKeys)) return;
      }
      const nextScore = current.g + direction.cost;
      if (nextScore >= (scores.get(key) ?? Infinity)) return;
      cameFrom.set(key, current.key);
      cells.set(key, cell);
      scores.set(key, nextScore);
      routeHeapPush(open, {
        key,
        cell,
        g: nextScore,
        f: nextScore + navigationHeuristic(cell, finish)
      });
    });
  }
  return null;
}

function navigationHeuristic(a, b) {
  return Math.hypot(a.col - b.col, a.row - b.row);
}

function routePointsFromCells(cameFrom, cells, targetKey, target) {
  const route = [];
  let key = targetKey;
  while (cameFrom.has(key)) {
    route.push(navigationCellPoint(cells.get(key)));
    key = cameFrom.get(key);
  }
  route.reverse();
  if (route.length) route[route.length - 1] = { x: target.x, y: target.y };
  return route;
}

function routeHeapPush(heap, node) {
  heap.push(node);
  let index = heap.length - 1;
  while (index > 0) {
    const parent = Math.floor((index - 1) / 2);
    if (heap[parent].f <= node.f) break;
    heap[index] = heap[parent];
    heap[parent] = node;
    index = parent;
  }
}

function routeHeapPop(heap) {
  if (!heap.length) return null;
  const first = heap[0];
  const last = heap.pop();
  if (!heap.length) return first;
  heap[0] = last;
  let index = 0;
  while (index < heap.length) {
    let child = index * 2 + 1;
    if (child >= heap.length) break;
    if (child + 1 < heap.length && heap[child + 1].f < heap[child].f) child += 1;
    if (heap[index].f <= heap[child].f) break;
    [heap[index], heap[child]] = [heap[child], heap[index]];
    index = child;
  }
  return first;
}

function pathRoutePoint(actor, target) {
  if (!actorUsesPathRouting(actor)) return null;
  const paths = pathStructures();
  if (paths.length < 2) return null;
  const size = gridSize();
  const directBlocks = Math.max(1, dist(actor, target) / size);
  const start = nearestPathStructure(actor, Infinity);
  const end = nearestPathStructure(target, Infinity);
  if (!start || !end) return null;
  const routeBlocks = (dist(actor, start) + Math.abs(start.x - end.x) + Math.abs(start.y - end.y) + dist(end, target)) / size;
  if (routeBlocks > directBlocks * 2) return null;
  if (dist(actor, start) > size * 0.9) return start;
  if (dist(actor, end) > size * 0.9 && dist(target, end) > size * 0.9) return end;
  return null;
}

function insideFortPerimeter(point) {
  const margin = gridSize() * 0.82;
  return point.x >= fort.x - margin
    && point.x <= fort.x + fort.w + margin
    && point.y >= fort.y - margin
    && point.y <= fort.y + fort.h + margin;
}

function barrierRoutePoint(actor, target) {
  if (insideFortPerimeter(actor) === insideFortPerimeter(target)) return null;
  if (nearGatePassage(actor)) return null;
  const gate = nearestGate(actor, target);
  return gateTransitPoint(actor, target, gate);
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
  clearFriendlyRoute(actor);
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
    .filter((point) => !friendlyNavigationPointBlocked(point))
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
    if (updatePatientRoute(survivor, dt, speed)) return;
    if (hungerProtestActive()) {
      survivor.workTimer = 0;
      moveActor(survivor, expertProtestPoint(index), speed, dt);
      return;
    }
    const station = stationForResident(survivor.id);
    if (station) {
      moveActor(survivor, station, speed, dt);
    } else if (survivor.specialty === "lumberjack") updateLumberjack(survivor, dt);
    else if (survivor.specialty === "farmer") updateFarmer(survivor, dt);
    else if (survivor.specialty === "forager") updateForager(survivor, dt);
    else if (survivor.specialty === "cook") updateCook(survivor, dt);
    else if (survivor.specialty === "courier") updateCourier(survivor, dt);
    else if (survivor.specialty === "engineer") updateEngineer(survivor, dt);
    else if (survivor.specialty === "hunter") updateHunter(survivor, dt);
    else if (survivor.specialty === "doctor") updateDoctor(survivor, dt);
    else if (survivor.specialty === "guard") updateGuard(survivor, dt);
    else moveActor(survivor, survivorPosition(index), speed, dt);
  });
}

function updateCityResidents(dt) {
  state.cityResidents = (state.cityResidents || []).map((resident, index) => normalizeCityPerson(resident, index, "resident")).filter((resident) => resident.health > 0);
  state.cityVisitors = (state.cityVisitors || []).map((visitor, index) => normalizeCityPerson(visitor, index, "visitor")).filter((visitor) => visitor.health > 0);
  spawnCityVisitors(dt);
  updateCityVisitors(dt);
  updateCityResidentRoaming(dt);
}

function spawnCityVisitors(dt) {
  if (!welcomeCenters().length || playerLevel() < (gameConfig.build.welcomeCenterPlayerLevel || 10)) return;
  if (state.cityVisitors.length >= (gameConfig.city.maxVisitors || 3)) return;
  state.city.visitorTimer = (state.city.visitorTimer || 0) + dt;
  cityVisitorTimer = state.city.visitorTimer;
  if (state.city.visitorTimer < (gameConfig.city.visitorIntervalSeconds || 55)) return;
  state.city.visitorTimer = 0;
  if (Math.random() > (gameConfig.city.visitorChance || 0.7)) return;
  const visitor = createCityVisitor();
  state.cityVisitors.push(visitor);
  setMessage(`${visitor.name} arrived at the Welcome Center to look around.`, 5);
}

function createCityVisitor() {
  const welcome = welcomeCenters()[0];
  const spawn = nearestGate(welcome || fort.entrance) || fort.entrance;
  const gender = nextCityGender();
  return normalizeCityPerson({
    id: `city-visitor-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: randomChoice(cityResidentNames),
    role: "visitor",
    gender,
    cityStyle: randomCityStyle(gender),
    clothes: randomClothingId(),
    outfit: randomOutfit(),
    x: spawn.x,
    y: spawn.y + 100,
    target: welcome ? { x: welcome.x, y: welcome.y + 44 } : { x: fort.entrance.x, y: fort.entrance.y }
  }, 0, "visitor");
}

function updateCityVisitors(dt) {
  state.cityVisitors.forEach((visitor) => {
    if (updatePatientRoute(visitor, dt, gameConfig.city.visitorSpeed || gameConfig.movement.visitorSpeed)) return;
    const welcome = welcomeCenters()[0];
    if (!welcome) {
      visitor.target = { x: fort.entrance.x, y: fort.entrance.y + 180 };
      moveActor(visitor, visitor.target, gameConfig.city.visitorSpeed || gameConfig.movement.visitorSpeed, dt);
      return;
    }
    const target = visitor.target || { x: welcome.x, y: welcome.y + 44 };
    if (!moveActor(visitor, target, gameConfig.city.visitorSpeed || gameConfig.movement.visitorSpeed, dt)) return;
    visitor.interactTimer += dt;
    if (visitor.interactTimer < 1.25) return;
    if (availableCityHousing() > 0) {
      convertVisitorToResident(visitor);
    } else {
      visitor.target = randomCityDestination(visitor);
      visitor.interactTimer = 0;
      setMessage(`${visitor.name} likes the city, but there is no open house yet.`, 4);
    }
  });
}

function convertVisitorToResident(visitor) {
  const house = state.structures.find((structure) => structure.type === "house" && cityHouseOccupants(structure.id) < (gameConfig.city.houseCapacity || 5));
  const resident = normalizeCityPerson({
    ...visitor,
    role: "resident",
    homeId: house ? house.id : null,
    target: randomCityDestination(visitor),
    arrived: true,
    interactTimer: 0
  }, state.cityResidents.length, "resident");
  state.cityResidents.push(resident);
  state.cityVisitors = state.cityVisitors.filter((item) => item.id !== visitor.id);
  setMessage(`${resident.name} became a Resident. Housing ${state.cityResidents.length}/${cityResidentCapacity()}.`, 5);
  playSound("success");
}

function cityHouseOccupants(houseId) {
  return state.cityResidents.filter((resident) => resident.homeId === houseId).length;
}

function updateCityResidentRoaming(dt) {
  state.cityResidents.forEach((resident, index) => {
    if (updatePatientRoute(resident, dt, gameConfig.city.residentSpeed || gameConfig.movement.residentSpeed * 0.82)) return;
    resident.chatTimer = Math.max(0, (resident.chatTimer || 0) - dt);
    if (resident.interactTimer > 0 && resident.target && dist(resident, resident.target) <= gameConfig.residents.workDistance * 1.2) {
      resident.interactTimer = Math.max(0, resident.interactTimer - dt);
      maybeStartCityChat(resident);
      return;
    }
    if (!resident.target || dist(resident, resident.target) <= gameConfig.residents.workDistance * 1.2) {
      resident.target = randomCityDestination(resident, index);
      resident.interactTimer = gameConfig.city.interactionSeconds || 3.4;
    }
    moveActor(resident, resident.target, gameConfig.city.residentSpeed || gameConfig.movement.residentSpeed * 0.82, dt);
  });
}

function randomCityDestination(resident, index = 0) {
  const destinations = cityAttractions().map((structure) => ({ x: structure.x, y: structure.y + (structure.type === "house" ? 50 : 28) }));
  pathStructures().forEach((path) => destinations.push({ x: path.x, y: path.y }));
  pathStructures().forEach((path) => destinations.push({ x: path.x, y: path.y }));
  Object.values(buildings).forEach((building) => destinations.push({ x: building.x + building.w / 2, y: building.y + building.h + 36 }));
  if (resident?.homeId) {
    const home = state.structures.find((structure) => structure.id === resident.homeId);
    if (home) destinations.push({ x: home.x, y: home.y + 52 });
  }
  if (!destinations.length) {
    return {
      x: fort.x + 120 + ((index % 5) * 42),
      y: fort.y + fort.h + 90 + Math.floor(index / 5) * 38
    };
  }
  const base = randomChoice(destinations);
  const spread = gameConfig.city.roamRadius || 260;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = {
      x: clamp(base.x + (Math.random() - 0.5) * spread * 0.5, 90, world.width - 90),
      y: clamp(base.y + (Math.random() - 0.5) * spread * 0.35, 90, world.height - 90)
    };
    if (!friendlyNavigationPointBlocked(candidate)) return candidate;
  }
  return friendlyNavigationPointBlocked(base) ? randomWalkableRoamPoint(index) : base;
}

function randomWalkableRoamPoint(index = 0) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidate = {
      x: clamp(fort.x + fort.w / 2 + (Math.random() - 0.5) * (gameConfig.city.roamRadius || 260) * 1.6, 120, world.width - 120),
      y: clamp(fort.y + fort.h / 2 + (Math.random() - 0.5) * (gameConfig.city.roamRadius || 260) * 1.25, 90, world.height - 70)
    };
    if (!friendlyNavigationPointBlocked(candidate)) return candidate;
  }
  return {
    x: fort.x + 120 + ((index % 5) * 42),
    y: fort.y + fort.h + 90 + Math.floor(index / 5) * 38
  };
}

function maybeStartCityChat(resident) {
  if ((resident.chatTimer || 0) > 0 || Math.random() > 0.02) return;
  const neighbor = state.cityResidents.find((other) => other.id !== resident.id && dist(other, resident) < 70);
  if (!neighbor) return;
  resident.chatTimer = 2.2;
  neighbor.chatTimer = 2.2;
}

function stationForResident(residentId) {
  if (state.towerStationedResidentId === residentId && buildings.tower) return buildingCenter(buildings.tower);
  const structure = state.structures.find((item) => item.stationedResidentId === residentId);
  return structure ? { x: structure.x, y: structure.y } : null;
}

function stationAssignmentLabel(expertId, currentStructure = null, starterTower = false) {
  if (state.towerStationedResidentId === expertId) {
    return starterTower ? "Stationed here" : "Stationed at Watch Tower";
  }
  const structure = state.structures.find((item) => item.stationedResidentId === expertId);
  if (!structure) return "Available";
  if (currentStructure && structure.id === currentStructure.id) return "Stationed here";
  return `Stationed at ${structureDisplayName(structure.type)}`;
}

function clearExpertStations(expertId, keepStructureId = null) {
  if (state.towerStationedResidentId === expertId && keepStructureId !== "starter") {
    state.towerStationedResidentId = null;
  }
  state.structures.forEach((structure) => {
    if (structure.stationedResidentId === expertId && structure.id !== keepStructureId) {
      structure.stationedResidentId = null;
    }
  });
}

function stationExpertAtStarter(expertId) {
  if (expertId === "none") {
    state.towerStationedResidentId = null;
    return;
  }
  clearExpertStations(expertId, "starter");
  state.towerStationedResidentId = expertId;
}

function stationExpertAtStructure(structure, expertId) {
  if (expertId === "none") {
    structure.stationedResidentId = null;
    return;
  }
  clearExpertStations(expertId, structure.id);
  structure.stationedResidentId = expertId;
}

function hunterDefaultPost() {
  const tower = state.structures.find((structure) => isTowerType(structure.type));
  return tower ? { x: tower.x, y: tower.y, w: 36, h: 36 } : { x: fort.entrance.x - 96, y: fort.entrance.y - 24, w: 36, h: 36 };
}

function assignedCookFoodPrep(cook) {
  if (cook.specialty !== "cook") return buildings.foodPrep;
  const preps = foodPreps();
  const current = preps.find((prep) => foodPrepId(prep) === cook.assignedFoodPrepId);
  const duplicate = current && state.survivors.some((survivor) => (
    survivor.id !== cook.id
    && survivor.specialty === "cook"
    && survivor.assignedFoodPrepId === cook.assignedFoodPrepId
    && survivor.health > 0
  ));
  if (current && !duplicate) return current;
  const otherAssigned = new Set(state.survivors
    .filter((survivor) => survivor.id !== cook.id && survivor.specialty === "cook" && survivor.health > 0)
    .map((survivor) => survivor.assignedFoodPrepId)
    .filter(Boolean));
  const available = preps.filter((prep) => !otherAssigned.has(foodPrepId(prep)));
  const choice = (available.length ? available : preps)
    .sort((a, b) => dist(cook, foodPrepCenter(a)) - dist(cook, foodPrepCenter(b)))[0] || buildings.foodPrep;
  cook.assignedFoodPrepId = foodPrepId(choice);
  return choice;
}

function updateLumberjack(survivor, dt) {
  const speed = residentMoveSpeed(survivor);
  if (survivor.carrying === "wood") {
    const shedDropoff = closestStorageShedDropoff(survivor);
    if (moveActor(survivor, shedDropoff, speed, dt)) {
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
    const cellarDropoff = closestRootCellarDropoff(survivor);
    if (moveActor(survivor, cellarDropoff, speed, dt)) {
      state.stored.lettuce += gameConfig.residents.farmerFoodAmount;
      survivor.carrying = null;
      survivor.workTimer = 0;
      playSound("drop");
    }
    return;
  }
  const placedFarm = state.structures.find((structure) => structure.type === "farm");
  const target = placedFarm ? { x: placedFarm.x, y: placedFarm.y } : { x: fort.x - 140, y: fort.y + fort.h + 180 };
  if (moveActor(survivor, target, speed, dt)) {
    survivor.workTimer += dt * generatorProductivityMultiplier();
    if (survivor.workTimer >= residentWorkSeconds(survivor, gameConfig.residents.farmerWorkSeconds)) {
      survivor.workTimer = 0;
      survivor.carrying = "lettuce";
      playSound("pickup");
    }
  }
}

function expertDeliverFood(survivor, dt) {
  if (!rawFoodTypes.includes(survivor.carrying)) return false;
  const cellarDropoff = closestRootCellarDropoff(survivor);
  if (moveActor(survivor, cellarDropoff, residentMoveSpeed(survivor), dt)) {
    state.stored[survivor.carrying] = (state.stored[survivor.carrying] || 0) + (survivor.carryAmount || 1);
    unlockIngredientRecipe(survivor.carrying);
    survivor.carrying = null;
    survivor.carryAmount = 0;
    survivor.workTimer = 0;
    playSound("drop");
  }
  return true;
}

function nearestBerryBush(point) {
  return trees
    .filter((tree) => tree.alive && tree.type === "berryBush")
    .sort((a, b) => dist(point, a) - dist(point, b))[0] || null;
}

function harvestBerryBush(bush) {
  bush.alive = false;
  bush.progress = 0;
  bush.respawn = gameConfig.trees.berryRespawnSeconds;
  bush.shake = 0.25;
  addBurst(bush.x, bush.y, resourceMeta[bush.berryType].color, 6);
}

function updateForager(survivor, dt) {
  if (expertDeliverFood(survivor, dt)) return;
  if (state.wave.active) {
    returnExpertToCabin(survivor, dt);
    return;
  }
  const bush = nearestBerryBush(survivor);
  if (!bush) {
    moveActor(survivor, survivorPosition(state.survivors.indexOf(survivor)), residentMoveSpeed(survivor), dt);
    return;
  }
  if (moveActor(survivor, bush, residentMoveSpeed(survivor), dt)) {
    survivor.workTimer += dt * generatorProductivityMultiplier();
    bush.shake = 0.15;
    if (survivor.workTimer >= residentWorkSeconds(survivor, gameConfig.residents.foragerWorkSeconds || 6)) {
      survivor.workTimer = 0;
      survivor.carrying = bush.berryType;
      survivor.carryAmount = gameConfig.residents.foragerBerryAmount || gameConfig.trees.berryDrops || 3;
      harvestBerryBush(bush);
      playSound("pickup");
    }
  }
}

function nearestExpertMeatResource(point) {
  return resources
    .filter((resource) => meatFoodTypes.includes(resource.type) && !resource.expiring && !resource.pickupLock)
    .sort((a, b) => dist(point, a) - dist(point, b))[0] || null;
}

function nearestCourierResource(point) {
  return resources
    .filter((resource) => (
      (resource.type === "wood" || resource.type === "meal" || rawFoodTypes.includes(resource.type))
      && !resource.expiring
      && !resource.pickupLock
    ))
    .sort((a, b) => dist(point, a) - dist(point, b))[0] || null;
}

function expertPickupGroundResource(survivor, resource) {
  if (!resource || resource.amount <= 0) return false;
  survivor.carrying = resource.type;
  survivor.carryAmount = 1;
  resource.amount -= 1;
  if (resource.amount <= 0) resources = resources.filter((item) => item !== resource);
  addBurst(resource.x, resource.y, resourceMeta[resource.type].color, 4);
  playSound("pickup");
  return true;
}

function expertDeliverCourierLoad(survivor, dt) {
  if (expertDeliverFood(survivor, dt)) return true;
  const speed = residentMoveSpeed(survivor);
  if (survivor.carrying === "wood") {
    const shedDropoff = closestStorageShedDropoff(survivor);
    if (moveActor(survivor, shedDropoff, speed, dt)) {
      state.stored.wood += survivor.carryAmount || 1;
      survivor.carrying = null;
      survivor.carryAmount = 0;
      survivor.workTimer = 0;
      playSound("drop");
    }
    return true;
  }
  if (survivor.carrying === "meal") {
    const prep = closestFoodPrep(survivor);
    const mealDropoff = foodPrepMealDropoff(prep);
    if (moveActor(survivor, mealDropoff, speed, dt)) {
      prep.meals += survivor.carryAmount || 1;
      survivor.carrying = null;
      survivor.carryAmount = 0;
      survivor.workTimer = 0;
      playSound("drop");
    }
    return true;
  }
  return false;
}

function updateCourier(survivor, dt) {
  if (expertDeliverCourierLoad(survivor, dt)) return;
  const resource = nearestCourierResource(survivor);
  if (!resource) {
    returnExpertToCabin(survivor, dt);
    return;
  }
  if (moveActor(survivor, resource, residentMoveSpeed(survivor), dt)) {
    expertPickupGroundResource(survivor, resource);
  }
}

function returnExpertToCabin(survivor, dt) {
  survivor.workTimer = 0;
  moveActor(survivor, survivorPosition(state.survivors.indexOf(survivor)), residentMoveSpeed(survivor), dt);
}

function updateHunter(survivor, dt) {
  if (expertDeliverFood(survivor, dt)) return;
  if (state.wave.active) {
    returnExpertToCabin(survivor, dt);
    return;
  }
  if (wolves.length) {
    updateResidentArcher(survivor, dt, hunterDefaultPost(), residentCooldown(survivor, gameConfig.residents.hunterArrowCooldown), gameConfig.residents.hunterArrowDamage);
    return;
  }
  const meat = nearestExpertMeatResource(survivor);
  if (meat) {
    if (moveActor(survivor, meat, residentMoveSpeed(survivor), dt)) expertPickupGroundResource(survivor, meat);
    return;
  }
  const prey = [...deer, ...ptarmigans]
    .filter((animal) => animal.hp > 0)
    .sort((a, b) => dist(survivor, a) - dist(survivor, b))[0];
  if (!prey) {
    moveActor(survivor, hunterDefaultPost(), residentMoveSpeed(survivor), dt);
    return;
  }
  survivor.arrowCooldown = Math.max(0, (survivor.arrowCooldown || 0) - dt);
  const huntRange = gameConfig.combat.baseRange * 0.72;
  if (dist(survivor, prey) > huntRange * 0.64) moveActor(survivor, prey, residentMoveSpeed(survivor), dt);
  if (dist(survivor, prey) <= huntRange && survivor.arrowCooldown <= 0) {
    survivor.arrowCooldown = residentCooldown(survivor, gameConfig.residents.hunterArrowCooldown);
    fireArrowFrom({ x: survivor.x, y: survivor.y - 44 }, prey, gameConfig.residents.hunterArrowDamage * residentLevelMultiplier(survivor));
  }
}

function updateDoctor(survivor, dt) {
  const speed = residentMoveSpeed(survivor);
  const tent = closestMedicalTent(survivor);
  const healRate = (gameConfig.medical.doctorHealPerSecond || 2.5) * residentLevelMultiplier(survivor);
  if (state.wave.active) {
    if (!tent) {
      moveActor(survivor, survivorPosition(state.survivors.indexOf(survivor)), speed, dt);
      return;
    }
    const target = medicalTentCarePoint(tent);
    if (moveActor(survivor, target, speed, dt) || pointInRect(survivor, structureRect(tent), 32)) {
      doctorPatients()
        .filter((patient) => pointInRect(patient, structureRect(tent), 46))
        .forEach((patient) => healActor(patient, healRate * dt));
    }
    return;
  }
  const patient = doctorPatients().sort((a, b) => dist(survivor, a) - dist(survivor, b))[0];
  if (!patient) {
    moveActor(survivor, tent ? medicalTentCarePoint(tent) : survivorPosition(state.survivors.indexOf(survivor)), speed, dt);
    return;
  }
  if (moveActor(survivor, patient, speed, dt) || dist(survivor, patient) <= (gameConfig.medical.fieldHealRange || 34)) {
    healActor(patient, healRate * dt);
    if (Math.random() < dt * 0.5) addBurst(patient.x, patient.y - 22, "#73df9b", 2);
  }
}

function updateCook(survivor, dt) {
  const prep = assignedCookFoodPrep(survivor);
  const recipe = currentPrepRecipe(prep);
  const speed = residentMoveSpeed(survivor);
  const cookSeconds = cookExpertProcessSeconds(survivor, prep) * (gameConfig.residents.cookWorkSecondsMultiplier || 1);
  const center = foodPrepCenter(prep);
  const rect = foodPrepRect(prep);
  if (moveActor(survivor, center, speed, dt) || pointInRect(survivor, rect, 24)) {
    if (!recipeHasIngredients(recipe)) return;
    survivor.workTimer += dt * generatorProductivityMultiplier();
    prep.processProgress = Math.max(prep.processProgress, (survivor.workTimer / cookSeconds) * foodProcessSeconds(prep));
    if (survivor.workTimer >= cookSeconds) {
      survivor.workTimer = 0;
      if (!consumeRecipeIngredients(recipe)) return;
      const meals = chefMealYield(survivor, recipe) + (prep.wordMealBonus || 0);
      prep.meals += meals;
      prep.wordMealBonus = 0;
      const mealPoint = foodPrepMealDropoff(prep);
      addBurst(mealPoint.x, mealPoint.y, resourceMeta.meal.color, 8);
      setMessage(`${survivor.name} cooked ${meals} meal${meals === 1 ? "" : "s"} from ${recipe.name}.`, 4);
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
    job.remaining = Math.max(0, job.remaining - gameConfig.residents.engineerBuildReductionPerSecond * residentLevelMultiplier(survivor) * dt * generatorProductivityMultiplier());
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
  if (!generatorPowered()) return;
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
  if (stats.netSeconds) {
    fireNetFrom({ x: structure.x, y: structure.y - 58 }, targetWolf, stats.damage * multiplier, stats.netSeconds);
  } else {
    fireArrowFrom({ x: structure.x, y: structure.y - 58 }, targetWolf, stats.damage * multiplier);
  }
  return cooldownOverride || stats.cooldown;
}

function towerSlowMultiplier(wolf) {
  if (!generatorPowered()) return 1;
  let slow = 1;
  state.structures.filter((structure) => isTowerType(structure.type)).forEach((structure) => {
    const stats = towerStats(structure);
    if (stats.slow < slow && dist(wolf, structure) <= stats.range) slow = stats.slow;
  });
  return slow;
}

function nearestFenceTarget(wolf) {
  const liveFences = state.structures.filter((structure) => isBarrierType(structure.type) && structure.health > 0);
  if (!liveFences.length) return cabinAttackPoint();
  return liveFences.sort((a, b) => dist(wolf, a) - dist(wolf, b))[0];
}

function cabinAttackPoint() {
  return {
    kind: "building",
    building: buildings.cabin,
    x: buildings.cabin.x + buildings.cabin.w / 2,
    y: buildings.cabin.y + buildings.cabin.h + 36
  };
}

function livingPeople(includePlayer = true) {
  const people = [
    ...state.survivors.filter((survivor) => survivor.health > 0),
    ...(state.cityResidents || []).filter((resident) => resident.health > 0),
    ...(state.cityVisitors || []).filter((visitor) => visitor.health > 0)
  ];
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
    return nearestPersonTarget(enemy, true, true) || cabinAttackPoint();
  }
  const cabinTarget = cabinAttackPoint();
  const person = nearestPersonTarget(enemy, true);
  const prey = person && person.distance + 18 < dist(enemy, cabinTarget) ? person : { ...cabinTarget, distance: dist(enemy, cabinTarget) };
  if (prepareGroundEnemyRoute(enemy, prey).reachable) return prey;

  const barrier = nearestGate(enemy, prey) || nearestFenceTarget(enemy);
  if (!isBarrierType(barrier.type)) return prey;
  return { kind: "barrier", structure: barrier, x: barrier.x, y: barrier.y, distance: dist(enemy, barrier) };
}

function damageFence(target, damage) {
  if (!target || !isBarrierType(target.type)) {
    return;
  }
  target.health = clamp(target.health - damage, 0, target.maxHealth);
}

function damageActor(actor, damage) {
  actor.health = clamp(actor.health - damage, 0, actor.maxHealth);
  addBurst(actor.x, actor.y - 32, "#ff5d66", 7);
  if (actor !== state.player && actor.health <= 0 && actor.role === "resident") {
    removeCityResident(actor);
  } else if (actor !== state.player && actor.health <= 0 && actor.role === "visitor") {
    state.cityVisitors = state.cityVisitors.filter((visitor) => visitor.id !== actor.id);
    setMessage(`${actor.name} fled the city after the attack.`, 5);
  } else if (actor !== state.player && actor.health <= 0) {
    removeResident(actor);
  } else if (actor === state.player && actor.health <= 0) {
    actor.health = actor.maxHealth * 0.35;
    actor.target = null;
    actor.x = buildings.cabin.x + buildings.cabin.w / 2;
    actor.y = buildings.cabin.y + buildings.cabin.h + 70;
    setMessage("You were knocked back to the cabin and patched up.", 5);
  }
}

function removeCityResident(resident) {
  if (!resident || !resident.id) return;
  state.cityResidents = state.cityResidents.filter((item) => item.id !== resident.id);
  residentDeathNotices.push({
    id: `${resident.id}-${Date.now()}`,
    text: `${resident.name} was lost. A house space is open.`,
    timer: 12
  });
  pushNotification({
    id: `lost-${resident.id}-${Date.now()}`,
    title: "Person Lost",
    copy: `${resident.name} was lost. A house space is open.`,
    warning: true
  });
  setMessage(`${resident.name} was lost during the attack. A house space opened.`, 7);
  showCenterMessage(`${resident.name} lost.`, 2.4);
  playSound("fail");
  saveState();
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
    text: `${resident.name} died. An Expert slot is open.`,
    timer: 12
  });
  pushNotification({
    id: `lost-${resident.id}-${Date.now()}`,
    title: "Expert Lost",
    copy: `${resident.name} died. An Expert slot is open.`,
    warning: true
  });
  setMessage(`${resident.name} died defending the camp. An Expert slot opened.`, 7);
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
  if (target.kind === "building") {
    setMessage("Enemies are attacking the Group Cabin.", 4);
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
    wolf.netTimer = Math.max(0, (wolf.netTimer || 0) - dt);
    if (wolf.netTimer > 0) return;
    const target = enemyTarget(wolf);
    const gap = dist(wolf, target);
    const attackRange = wolf.type === "eagle" ? 34 : 18;
    if (gap > attackRange) {
      wolf.attacking = false;
      const routeTarget = wolf.type === "eagle" || target.kind === "barrier"
        ? target
        : groundEnemyRoutePoint(wolf, target);
      const routeGap = Math.max(1, dist(wolf, routeTarget));
      const lightSlow = wolf.type === "wolf" && pointInTorchLight(wolf) ? 0.9 : 1;
      const slow = wolf.type === "eagle" ? 1 : towerSlowMultiplier(wolf) * lightSlow;
      const step = Math.min(routeGap, wolf.speed * slow * dt);
      const next = {
        x: wolf.x + ((routeTarget.x - wolf.x) / routeGap) * step,
        y: wolf.y + ((routeTarget.y - wolf.y) / routeGap) * step
      };
      if (wolf.type !== "eagle" && groundEnemyPointBlocked(next) && target.kind !== "barrier") {
        clearGroundEnemyRoute(wolf);
      } else {
        wolf.x = next.x;
        wolf.y = next.y;
      }
      wolf.walkTime = (wolf.walkTime || 0) + step / gameConfig.movement.walkAnimationDivisor;
      if (routeTarget.x !== wolf.x) wolf.facing = routeTarget.x > wolf.x ? 1 : -1;
      setActorDirection(wolf, routeTarget.x - wolf.x, routeTarget.y - wolf.y);
    } else {
      wolf.attacking = true;
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
  const daylightPrey = state.wave.active ? [] : [...deer, ...ptarmigans];
  const targetPrey = targetWolf ? null : daylightPrey
    .filter((animal) => animal.hp > 0 && dist(state.player, animal) <= range)
    .sort((a, b) => dist(state.player, a) - dist(state.player, b))[0];
  const arrowTarget = targetWolf || targetPrey;
  if (arrowTarget && arrowCooldown <= 0) {
    arrowCooldown = playerWeaponCooldown(inTower ? gameConfig.combat.towerArrowCooldown : gameConfig.combat.baseArrowCooldown);
    fireArrow(arrowTarget);
  }

  wolves = wolves.filter((wolf) => {
    if (wolf.hp > 0) return true;
    const hunterBonus = specialtyCount("hunter");
    const meatAmount = wolf.type === "eagle" ? 1 : 1 + hunterBonus;
    const meatType = wolf.type === "eagle" ? "eagleMeat" : "wolfMeat";
    for (let i = 0; i < meatAmount; i += 1) {
      spawnResource(meatType, wolf.x - 22 + Math.random() * 44, wolf.y - 12 + Math.random() * 34, 1);
    }
    addBurst(wolf.x, wolf.y, resourceMeta[meatType].color, 12);
    setMessage(`${wolf.type === "eagle" ? "An eagle" : "A wolf"} dropped ${meatAmount} ${resourceMeta[meatType].label.toLowerCase()}.`);
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

function updateDeer(dt) {
  const config = gameConfig.deer || defaultGameConfig.deer;
  deer.forEach((animal) => {
    animal.hitFlash = Math.max(0, (animal.hitFlash || 0) - dt);
    animal.fleeTimer = Math.max(0, (animal.fleeTimer || 0) - dt);
    if (pointInTorchLight(animal)) {
      animal.fleeTimer = Math.max(animal.fleeTimer, 1.4);
      animal.grazeTimer = 0;
      animal.target = deerAvoidLightTarget(animal);
    }
    if (animal.fleeTimer > 0) animal.grazeTimer = 0;
    if (animal.fleeTimer <= 0 && (animal.grazeTimer || 0) > 0) {
      animal.grazeTimer = Math.max(0, animal.grazeTimer - dt);
      animal.walkTime = (animal.walkTime || 0) + dt * 0.7;
      return;
    }
    if (animal.fleeTimer <= 0 && animal.target && dist(animal, animal.target) < 28) {
      animal.grazeTimer = randomBetween(Math.random, 2.5, 6);
      animal.target = null;
      return;
    }
    if (!animal.target || dist(animal, animal.target) < 28 || pointInLake(animal.target, 28) || pointBlockedByBarriers(animal.target, true)) {
      animal.target = animal.fleeTimer > 0
        ? deerFleeTarget(animal)
        : deerRoamTarget(animal);
    }
    const speed = animal.fleeTimer > 0 ? config.fleeSpeed : config.speed;
    moveActor(animal, animal.target, speed, dt);
  });
  deer = deer.filter((animal) => {
    if (animal.hp > 0) return true;
    const drops = config.meatDrops || 2;
    for (let i = 0; i < drops; i += 1) {
      spawnResource("deerMeat", animal.x - 18 + Math.random() * 36, animal.y - 8 + Math.random() * 24, 1);
    }
    addBurst(animal.x, animal.y, resourceMeta.deerMeat.color, 12);
    setMessage(`A deer dropped ${drops} venison.`);
    playSound("success");
    return false;
  });
}

function updatePtarmigans(dt) {
  const config = gameConfig.ptarmigan || defaultGameConfig.ptarmigan;
  if (state.wave.active) return;
  ptarmigans.forEach((bird) => {
    bird.hitFlash = Math.max(0, (bird.hitFlash || 0) - dt);
    bird.fleeTimer = Math.max(0, (bird.fleeTimer || 0) - dt);
    if (!bird.target || dist(bird, bird.target) < 34 || pointInLake(bird.target, 28)) {
      bird.target = bird.fleeTimer > 0 ? ptarmiganFleeTarget(bird) : ptarmiganRoamTarget(bird);
    }
    moveActor(bird, bird.target, bird.fleeTimer > 0 ? config.fleeSpeed : config.speed, dt);
    bird.walkTime = (bird.walkTime || 0) + dt;
  });
  ptarmigans = ptarmigans.filter((bird) => {
    if (bird.hp > 0) return true;
    const drops = config.meatDrops || 1;
    for (let index = 0; index < drops; index += 1) {
      spawnResource("ptarmiganMeat", bird.x - 16 + Math.random() * 32, bird.y - 8 + Math.random() * 18, 1);
    }
    addBurst(bird.x, bird.y, resourceMeta.ptarmiganMeat.color, 8);
    setMessage(`A willow ptarmigan dropped ${drops} ptarmigan meat.`);
    return false;
  });
}

function ptarmiganRoamTarget(bird, rng = Math.random) {
  const config = gameConfig.ptarmigan || defaultGameConfig.ptarmigan;
  const origin = bird || fort.entrance;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const angle = rng() * Math.PI * 2;
    const radius = randomBetween(rng, 120, config.roamRadius || 460);
    const point = {
      x: clamp(origin.x + Math.cos(angle) * radius, 100, world.width - 100),
      y: clamp(origin.y + Math.sin(angle) * radius, 100, world.height - 100)
    };
    if (!pointInLake(point, 28)) return point;
  }
  return randomFreeWorldPoint(rng, 140);
}

function ptarmiganFleeTarget(bird) {
  const dx = bird.x - state.player.x;
  const dy = bird.y - state.player.y;
  const gap = Math.hypot(dx, dy) || 1;
  const point = {
    x: clamp(bird.x + (dx / gap) * 520, 100, world.width - 100),
    y: clamp(bird.y + (dy / gap) * 520, 100, world.height - 100)
  };
  return pointInLake(point, 28) ? ptarmiganRoamTarget(bird) : point;
}

function deerRoamTarget(animal) {
  const rng = Math.random;
  const config = gameConfig.deer || defaultGameConfig.deer;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const angle = rng() * Math.PI * 2;
    const radius = randomBetween(rng, 160, config.roamRadius || 520);
    const point = {
      x: clamp(animal.x + Math.cos(angle) * radius, 120, world.width - 120),
      y: clamp(animal.y + Math.sin(angle) * radius, 120, world.height - 120)
    };
    if (!pointInLake(point, 42) && !pointBlockedByBarriers(point, true) && !groundSpawnBlocked(point, 20)) return point;
  }
  return randomFreeWorldPoint(rng, 160);
}

function deerAvoidLightTarget(animal) {
  const light = nearestLightSource(animal);
  if (!light) return deerFleeTarget(animal);
  const dx = animal.x - light.x;
  const dy = animal.y - light.y;
  const gap = Math.hypot(dx, dy) || 1;
  const point = {
    x: clamp(animal.x + (dx / gap) * 520, 120, world.width - 120),
    y: clamp(animal.y + (dy / gap) * 520, 120, world.height - 120)
  };
  if (pointInLake(point, 42) || pointBlockedByBarriers(point, true)) return deerRoamTarget(animal);
  return point;
}

function deerFleeTarget(animal) {
  const dx = animal.x - state.player.x;
  const dy = animal.y - state.player.y;
  const gap = Math.hypot(dx, dy) || 1;
  const point = {
    x: clamp(animal.x + (dx / gap) * 620, 120, world.width - 120),
    y: clamp(animal.y + (dy / gap) * 620, 120, world.height - 120)
  };
  if (pointInLake(point, 42) || pointBlockedByBarriers(point, true)) return deerRoamTarget(animal);
  return point;
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
      "Upgrade The Generator",
      "The first night is over. The next Generator upgrade slows fuel drain; later upgrades alternate between slower drain and higher fuel capacity.",
      [{ label: "Open Generator", action: () => openBuildingMenu(buildings.furnace) }]
    );
  } else if (state.wave.number === 2) {
    showTutorialTip(
      "foodUpgrade",
      "Upgrade Food Systems",
      "The Kitchen Hall cooks Root Cellar ingredients and serves its finished meals automatically to hold hunger down. Upgrades speed the recipes and serving line up.",
      [{ label: "Open Kitchen Hall", action: () => openBuildingMenu(buildings.foodPrep) }]
    );
  }
}

function maybeShowCabinUpgradeTip() {
  showTutorialTip(
    "cabinUpgrade",
    "Upgrade The Cabin",
    "The Expert roster is full. Upgrade the Group Cabin to add more Expert space before the next candidate reaches the gate.",
    [{ label: "Open Cabin", action: () => openBuildingMenu(buildings.cabin) }]
  );
}

function maybeShowCityUnlockTip() {
  const unlockLevel = gameConfig.build.welcomeCenterPlayerLevel || 10;
  if (playerLevel() < unlockLevel || state.tutorialFlags.cityUnlock) return;
  showTutorialTip(
    "cityUnlock",
    "City Building Unlocked",
    "You can now build houses, paths, decorations, and a Welcome Center. Visitors will tour the settlement and become Residents when there is housing space.",
    [
      { label: "Open Build", action: openBuildMenu },
      { label: "Upgrades", action: openUpgradeMenu }
    ]
  );
}

function maybeShowBlacksmithUnlockTip() {
  const unlockLevel = gameConfig.build.blacksmithPlayerLevel || 4;
  if (playerLevel() < unlockLevel || state.tutorialFlags.blacksmithUnlock) return;
  showTutorialTip(
    "blacksmithUnlock",
    "Build A Blacksmith",
    "A Blacksmith is ready to join the settlement. Build the workshop to turn learning points into stronger baskets and better weapons.",
    [{ label: "Open Build", action: openBuildMenu }]
  );
}

function maybeShowBasicsTutorial() {
  showTutorialTip(
    "basics",
    "Survive Your First Day",
    "Gather wood from trees to keep the Generator fueled. Store raw food in the Root Cellar and choose recipes at the Kitchen Hall so meals are cooked and served before hunger slows your Experts. The Build tray adds defenses and support buildings; learning challenges unlock recipes, Experts, and upgrades.",
    [
      { label: "Open Build", action: openBuildMenu },
      { label: "Help", action: openHelpMenu }
    ]
  );
}

function maybeShowTowerInstruction() {
  if (state.towerInstructionShown || state.wave.number < 2) return;
  state.towerInstructionShown = true;
  setMessage("Build tip: open Build and place an Outpost. Towers fire on their own, and stationing Experts makes them stronger.", 10);
  saveState();
}

function spawnInterWaveVisitor() {
  if (pendingVisitor || state.visitor || attackActive || state.wave.active || (state.wave.survivorCooldown || 0) > 0) return;
  pendingVisitor = createVisitor();
  state.visitor = pendingVisitor;
  state.wave.interWaveVisitorPending = false;
  survivorCheckTimer = 0;
  saveState();
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
  const tier = Math.floor((state.wave.number - 1) / Math.max(1, config.waveCountPerTier || 20));
  const count = 1 + (Math.random() < Math.min(0.45, 0.12 + tier * 0.08) ? 1 : 0);
  for (let i = 0; i < count; i += 1) {
    const elite = tier >= 1 && Math.random() < 0.22;
    const hp = config.wolfBaseHp + tier * config.waveHpPerTier + Math.random() * config.wolfBonusHp + (elite ? 108 : 0);
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
    const hp = config.eagleBaseHp + tier * 26 + Math.random() * 36;
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
  const towerBoostActive = playerNearBuiltTower();
  const towerBonus = towerBoostActive ? config.towerDamageMultiplier : 1;
  const guardBonus = 1 + specialtyCount("guard") * config.guardDamageMultiplier;
  const towerLevel = towerBoostActive ? nearestBuiltTowerLevel(state.player) : 1;
  const damage = config.baseArrowDamage
    * playerWeaponDamageScale()
    * damageLevelScale(towerLevel)
    * towerBonus
    * guardBonus;
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
  if (wolf.type === "deer" && wolf.hp > 0) {
    wolf.fleeTimer = gameConfig.deer.fleeSeconds || 7;
    wolf.hitFlash = 0.28;
    wolf.target = deerFleeTarget(wolf);
  }
  if (wolf.type === "ptarmigan" && wolf.hp > 0) {
    wolf.fleeTimer = Math.max(wolf.fleeTimer || 0, 5);
    wolf.hitFlash = 0.28;
    wolf.target = ptarmiganFleeTarget(wolf);
  }
  arrows.push({
    from,
    to: { x: wolf.x, y: wolf.y - 20 },
    t: 0,
    duration: gameConfig.combat.arrowSeconds
  });
  playSound("arrow");
}

function fireNetFrom(from, wolf, damage, netSeconds) {
  wolf.hp -= damage;
  wolf.netTimer = Math.max(wolf.netTimer || 0, netSeconds || 0);
  wolf.hitFlash = Math.max(wolf.hitFlash || 0, 0.24);
  arrows.push({
    kind: "net",
    from,
    to: { x: wolf.x, y: wolf.y - 18 },
    t: 0,
    duration: gameConfig.combat.arrowSeconds * 1.25
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
  if (pointInLake(next, 18)) {
    state.player.target = null;
    return;
  }
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
  if (updateMachineSiteEntry()) state.player.target = null;
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

function buildToolActive() {
  return buildMode || moveMode || removeMode || repairMode;
}

function updateBuildCameraPan(dt) {
  if (!cursorScreen.active) return;
  const viewW = window.innerWidth / camera.zoom;
  const viewH = window.innerHeight / camera.zoom;
  const edge = 58;
  const speed = (gameConfig.camera.edgePanSpeed || 760) / camera.zoom;
  const xPower = cursorScreen.x < edge
    ? -1 + cursorScreen.x / edge
    : cursorScreen.x > window.innerWidth - edge
      ? 1 - (window.innerWidth - cursorScreen.x) / edge
      : 0;
  const yPower = cursorScreen.y < edge
    ? -1 + cursorScreen.y / edge
    : cursorScreen.y > window.innerHeight - edge
      ? 1 - (window.innerHeight - cursorScreen.y) / edge
      : 0;
  if (!xPower && !yPower) return;
  camera.x = clamp(camera.x + xPower * speed * dt, 0, Math.max(0, world.width - viewW));
  camera.y = clamp(camera.y + yPower * speed * dt, 0, Math.max(0, world.height - viewH));
}

function updateCamera(dt = 0) {
  if (buildToolActive()) {
    updateBuildCameraPan(dt);
    return;
  }
  const viewW = window.innerWidth / camera.zoom;
  const viewH = window.innerHeight / camera.zoom;
  camera.x = clamp(state.player.x - viewW / 2, 0, Math.max(0, world.width - viewW));
  camera.y = clamp(state.player.y - viewH * 0.65, 0, Math.max(0, world.height - viewH));
}

function setActionsCollapsed(collapsed) {
  actionsCollapsed = collapsed;
  if (hud.actionsPanel) hud.actionsPanel.classList.toggle("collapsed", actionsCollapsed);
  if (hud.actionsToggle) {
    hud.actionsToggle.setAttribute("aria-expanded", "false");
    hud.actionsToggle.textContent = "Menu";
  }
}

function updateCanvasToolCursor() {
  canvas.classList.toggle("tool-build", buildMode);
  canvas.classList.toggle("tool-move", moveMode);
  canvas.classList.toggle("tool-remove", removeMode);
  canvas.classList.toggle("tool-repair", repairMode);
}

function runHudAction(action) {
  setActionsCollapsed(true);
  action();
}

function setMeterAlert(card, label, copy, critical = false, offline = false) {
  card?.classList.toggle("critical", critical);
  card?.classList.toggle("offline", offline);
  if (!label) return;
  label.textContent = copy;
  label.classList.toggle("hidden", !copy);
}

function updateHud(dt) {
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
  setMeterAlert(
    hud.furnaceMeterCard,
    hud.generatorAlert,
    fuelPct <= 0 ? "Offline: towers stopped" : fuelPct <= 8 ? "Load wood now" : "",
    fuelPct <= 8,
    fuelPct <= 0
  );
  setMeterAlert(
    hud.cabinHungerCard,
    hud.hungerAlert,
    hungerProtestActive() ? "Experts protesting" : hungerPct >= 92 ? "Serve meals now" : "",
    hungerPct >= 92,
    hungerProtestActive()
  );
  if (hud.quickWoodText) hud.quickWoodText.textContent = state.stored.wood;
  if (hud.quickDiningMealText) hud.quickDiningMealText.textContent = totalPreparedMeals();
  const cityUnlocked = playerLevel() >= (gameConfig.build.welcomeCenterPlayerLevel || 10);
  if (hud.quickVisitorChip) hud.quickVisitorChip.classList.toggle("hidden", !cityUnlocked);
  if (hud.quickResidentChip) hud.quickResidentChip.classList.toggle("hidden", !cityUnlocked);
  if (hud.quickVisitorText) hud.quickVisitorText.textContent = (state.cityVisitors || []).length;
  if (hud.quickResidentText) hud.quickResidentText.textContent = (state.cityResidents || []).length;
  if (hud.cycleText) hud.cycleText.textContent = cycleTimeText();
  if (hud.cycleFill) {
    const cycleProgress = cycleClockProgress();
    const fullCycleDuration = dayDuration() + nightDuration();
    const daySweep = fullCycleDuration ? dayDuration() / fullCycleDuration * 360 : 180;
    const cycleHud = hud.cycleFill.closest(".cycle-hud");
    cycleHud?.style.setProperty("--cycle-angle", `${cycleProgress * 360}deg`);
    cycleHud?.style.setProperty("--day-sweep", `${daySweep}deg`);
    cycleHud?.classList.toggle("night", state.wave.active);
    cycleHud?.classList.toggle("day", !state.wave.active);
  }
  if (hud.woodCount) hud.woodCount.textContent = state.stored.wood;
  if (hud.lettuceCount) hud.lettuceCount.textContent = totalRawFood();
  if (hud.meatCount) hud.meatCount.textContent = carryTotal();
  if (hud.mealCount) hud.mealCount.textContent = totalPreparedMeals();
  if (hud.survivorCount) hud.survivorCount.textContent = `${state.survivors.length}/${survivorCapacity()}`;
  if (hud.learningPointCount) hud.learningPointCount.textContent = state.learningPoints;
  if (hud.playerLevelCount) hud.playerLevelCount.textContent = playerLevel();
  if (hud.waveCount) hud.waveCount.textContent = cycleTimeText();
  if (hud.buildButton) hud.buildButton.textContent = buildMode || moveMode || removeMode ? "Build Menu" : "Build";
  if (hud.pauseButton) hud.pauseButton.textContent = paused ? "Resume" : "Pause";
  if (hud.zoomResetButton) hud.zoomResetButton.textContent = `${camera.zoom.toFixed(1)}x`;
  if (hud.playerIconImage && clothingReady) hud.playerIconImage.src = actorIconDataUrl(state.player, 64);
  if (hud.playerLevelBadge) hud.playerLevelBadge.textContent = `Lv ${playerLevel()}`;
  setActionsCollapsed(actionsCollapsed);
  if (hud.pauseLayer) hud.pauseLayer.classList.toggle("hidden", !paused || modalOpen);
  if (hud.pauseBadge) hud.pauseBadge.classList.toggle("hidden", !paused);
  if (hud.buildTray) hud.buildTray.classList.toggle("collapsed", buildTrayCollapsed);
  if (hud.buildTrayToggle) hud.buildTrayToggle.setAttribute("aria-expanded", String(!buildTrayCollapsed));
  const repairAllCost = totalStructureRepairCost();
  if (hud.repairAllCost) hud.repairAllCost.textContent = repairAllCost > 0 ? `${repairAllCost} wood` : "All repaired";
  if (hud.repairAllButton) hud.repairAllButton.disabled = repairAllCost <= 0;
  refreshBuildTrayIfNeeded();

  if (hud.phaseLabel) hud.phaseLabel.textContent = paused ? "Paused" : repairMode ? "Repair Mode" : removeMode ? "Remove Mode" : moveMode ? "Move Buildings" : buildMode ? "Build Mode" : attackActive ? `Night ${state.wave.number}` : pendingVisitor ? "Visitor Approaching" : state.wave.active ? "Night Watch" : "Daylight Prep";
  updateCanvasToolCursor();
  updateNotifications(dt);
}

function pushNotification(notice) {
  const id = notice.id || `${notice.title}-${Date.now()}`;
  const existing = notifications.find((item) => item.id === id);
  if (existing) {
    existing.timer = 30;
    return;
  }
  notifications.push({ ...notice, id, timer: 30 });
  while (notifications.length > 3) notifications.shift();
}

function renderNoticeCard(notice) {
  const actions = notice.actions || [];
  return `
    <article class="notice-card ${notice.warning ? "warning" : ""} ${notice.timer < 5 ? "fading" : ""}">
      <strong>${notice.title}</strong>
      <p>${notice.copy}</p>
      ${actions.length ? `<div class="notice-actions">${actions.map((action) => `<button ${action.primary ? 'class="primary"' : ""} data-notice-action="${action.action}" data-notice-id="${notice.id}" type="button">${action.label}</button>`).join("")}</div>` : ""}
    </article>
  `;
}

function updateNotifications(dt = 0) {
  if (!hud.notificationStack) return;
  notifications = notifications
    .map((notice) => ({ ...notice, timer: notice.timer - dt }))
    .filter((notice) => notice.timer > 0)
    .slice(-3);
  const upgrade = affordableBlacksmithTech();
  if (upgrade && dismissedUpgradeNoticeAt !== state.learningPoints) {
    pushNotification({
      id: `upgrade-${state.learningPoints}-${upgrade.id}`,
      title: "Blacksmith Tech Ready",
      copy: `You have ${state.learningPoints} points. ${upgrade.name} costs ${upgrade.cost}.`,
      actions: [
        { action: "open-blacksmith", label: "Open Blacksmith", primary: true },
        { action: "dismiss-upgrade", label: "Dismiss" }
      ]
    });
  }

  const markup = notifications.map(renderNoticeCard).join("");
  if (markup === notificationMarkup) return;
  notificationMarkup = markup;
  hud.notificationStack.innerHTML = markup;
  hud.notificationStack.querySelectorAll("[data-notice-action]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.noticeAction === "open-blacksmith") openBlacksmithTechMenu();
      if (button.dataset.noticeAction === "dismiss-upgrade") {
        dismissedUpgradeNoticeAt = state.learningPoints;
        notifications = notifications.filter((notice) => notice.id !== button.dataset.noticeId);
        updateNotifications(0);
      }
    });
  });
}

function resetGame() {
  localStorage.removeItem(storageKey);
  state = clone(defaultState);
  state.player = normalizePlayer({ clothes: gameConfig.characters.defaultPlayerClothes });
  buildings = hydrateBuildings();
  snapAllBuildingsToGrid();
  state.structures = createInitialDefenseStructures();
  syncCabinLinkedUpgrades(buildings.cabin.level);
  state.worldSeed = "";
  state.seedChosen = false;
  state.cityResidents = [];
  state.cityVisitors = [];
  state.city = { ...defaultState.city };
  state.wave = normalizeNightCycleState({ ...defaultState.wave, timer: dayDuration(), active: false });
  state.playerLevel = 1;
  state.towerInstructionShown = false;
  resources = [];
  generateWorldLayout();
  snow = createSnow();
  wolves = [];
  arrows = [];
  flies = [];
  particles = [];
  pendingVisitor = null;
  pendingRecruit = null;
  replacementRecruit = null;
  woodChopMiniGame = null;
  woodChopReturnZoom = null;
  cookingMiniGame = null;
  variableFlowGame = null;
  enteredMachineSiteId = null;
  state.visitor = null;
  activeTask = null;
  activeTaskContext = null;
  dismissedUpgradeNoticeAt = -1;
  notificationMarkup = "";
  notifications = [];
  pendingCarry = 0;
  residentDeathNotices = [];
  buildMode = false;
  moveMode = false;
  removeMode = false;
  repairMode = false;
  buildTrayCollapsed = true;
  buildTrayRenderKey = "";
  selectedBuildType = null;
  buildPreview = null;
  selectedMoveTarget = null;
  movePreview = null;
  attackActive = false;
  wolfCheckTimer = 0;
  survivorCheckTimer = 0;
  cityVisitorTimer = 0;
  paused = false;
  modalPauseActive = false;
  modalOpen = false;
  arrowCooldown = 0;
  starterTowerCooldown = 0;
  saveTimer = 0;
  spawnStarterResources();
  forceCloseModal();
  setMessage("A fresh camp begins. Gather wood from trees and food from berry bushes.", 7);
  saveState();
  window.setTimeout(openSeedMenu, 80);
}

function update(dt) {
  saveTimer += dt;
  updateWoodChopZoomRestore(dt);
  if (paused) {
    updateHud(dt);
    return;
  }
  updatePlayer(dt);
  if (paused || updateMachineSiteEntry()) {
    updateCamera(dt);
    updateHud(dt);
    return;
  }
  updateCamera(dt);
  updateFarm(dt);
  updatePlacedFarms(dt);
  updateFurnace(dt);
  updateDiningHall(dt);
  updateCabin(dt);
  updateFoodPrep(dt);
  updateCookingMiniGame(dt);
  updateUpgradeJobs(dt);
  updateResidents(dt);
  updateCityResidents(dt);
  updateTrees(dt);
  updateMachineCooldowns(dt);
  updateGroundResources(dt);
  updateResourcePickup();
  updateDropoffs();
  updateOutposts(dt);
  updateDeer(dt);
  updatePtarmigans(dt);
  updateWolves(dt);
  updateVisitor(dt);
  updateArrows(dt);
  updateFlies(dt);
  updateParticles(dt);
  maybeShowBlacksmithUnlockTip();
  maybeShowCityUnlockTip();
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
  drawCabinDirectionIndicator();
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
  drawBlacksmithWorkAnimation();
  drawRecipeSites();
  drawBrokenMachineSites();
  drawTrees();
  drawResources();
  drawResidents();
  drawCityResidents();
  drawVisitor();
  drawDeer();
  drawPtarmigans();
  drawWolves();
  drawPlayer();
  drawWoodChopMiniGame();
  drawCookingMiniGame();
  drawArrows();
  drawFlies();
  drawParticles();
  drawBuildPreview();
  drawMovePreview();
  drawDayNightOverlay();
  drawLighting();
  drawSnow();
}

function drawGround() {
  const gradient = ctx.createLinearGradient(0, 0, 0, world.height);
  gradient.addColorStop(0, "#0b2134");
  gradient.addColorStop(0.55, "#24516a");
  gradient.addColorStop(1, "#d6f2ff");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, world.width, world.height);
  drawGroundPatches();
  drawLakes();
}

function drawGroundPatches() {
  ctx.save();
  groundPatches.forEach((patch, index) => {
    ctx.fillStyle = patch.color;
    ctx.beginPath();
    ctx.ellipse(patch.x, patch.y, patch.rx, patch.ry, patch.rot, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = patch.type === "gravel" ? "rgba(231, 241, 241, 0.08)" : "rgba(221, 247, 206, 0.06)";
    for (let i = 0; i < patch.flecks; i += 1) {
      const angle = (i * 2.399963229728653 + index) % (Math.PI * 2);
      const radius = (0.18 + ((i * 37) % 67) / 100) * patch.rx;
      ctx.beginPath();
      ctx.ellipse(
        patch.x + Math.cos(angle) * radius,
        patch.y + Math.sin(angle) * radius * 0.4,
        12 + (i % 3) * 6,
        4 + (i % 2) * 3,
        patch.rot + angle * 0.2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  });
  ctx.restore();
}

function drawLakes() {
  const time = performance.now() / 1000;
  lakes.forEach((lake, lakeIndex) => {
    ctx.save();
    ctx.beginPath();
    lake.blobs.forEach((blob) => {
      ctx.ellipse(blob.x, blob.y, blob.rx, blob.ry, blob.rot, 0, Math.PI * 2);
    });
    ctx.fillStyle = "#72cdb9";
    ctx.fill();
    ctx.save();
    ctx.clip();
    const bounds = lakeBounds(lake);
    lake.speckles?.forEach((speckle) => {
      ctx.fillStyle = `rgba(26, 73, 75, ${speckle.alpha})`;
      ctx.beginPath();
      ctx.ellipse(speckle.x, speckle.y, speckle.rx, speckle.ry, speckle.rot, 0, Math.PI * 2);
      ctx.fill();
    });
    const shimmer = ctx.createRadialGradient(lake.x - 120, lake.y - 90, 80, lake.x, lake.y, Math.max(bounds.w, bounds.h));
    shimmer.addColorStop(0, "rgba(227, 255, 239, 0.22)");
    shimmer.addColorStop(1, "rgba(27, 99, 92, 0)");
    ctx.fillStyle = shimmer;
    ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
    ctx.restore();
    lake.blobs.forEach((blob, blobIndex) => {
      const pulse = Math.sin(time * 1.4 + lakeIndex + blobIndex * 0.7) * 4;
      ctx.strokeStyle = "rgba(220, 255, 237, 0.24)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(blob.x, blob.y, blob.rx + pulse, blob.ry + pulse * 0.45, blob.rot, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(24, 76, 74, 0.18)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(blob.x, blob.y, blob.rx - 8 - pulse * 0.4, blob.ry - 4 - pulse * 0.2, blob.rot, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.restore();
  });
}

function lakeBounds(lake) {
  const xs = lake.blobs.flatMap((blob) => [blob.x - blob.rx, blob.x + blob.rx]);
  const ys = lake.blobs.flatMap((blob) => [blob.y - blob.ry, blob.y + blob.ry]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

function drawGrid() {
  const size = gridSize();
  ctx.save();
  ctx.globalAlpha = buildMode || moveMode || removeMode || repairMode ? 0.34 : gameConfig.grid.alpha;
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

function structureDrawY(structure) {
  const rect = structureRect(structure);
  return rect.y + rect.h;
}

function structureDrawPriority(structure) {
  if (structure.type === "path") return 0;
  if (isBarrierType(structure.type)) return 1;
  if (structure.type === "shrub" || structure.type === "bench") return 2;
  if (structure.type === "torch") return 3;
  if (isDecorationType(structure.type)) return 4;
  return 5;
}

function structureDrawCompare(a, b) {
  const yDiff = structureDrawY(a) - structureDrawY(b);
  if (Math.abs(yDiff) > 0.1) return yDiff;
  return structureDrawPriority(a) - structureDrawPriority(b);
}

function drawStructures() {
  [...state.structures].sort(structureDrawCompare).forEach((structure) => {
    if (isBarrierType(structure.type)) drawFenceSegment(structure);
    else if (structure.type === "cabin") drawPlacedCabin(structure);
    else if (structure.type === "foodPrep") drawPlacedFoodPrep(structure);
    else if (structure.type === "storageShed") drawPlacedStorageShed(structure);
    else if (structure.type === "rootCellar") drawPlacedRootCellar(structure);
    else if (structure.type === "medicalTent") drawPlacedMedicalTent(structure);
    else if (structure.type === "blacksmith") drawPlacedBlacksmith(structure);
    else if (structure.type === "farm") drawPlacedFarm(structure);
    else if (isCityBuildingType(structure.type) || isDecorationType(structure.type)) drawCityStructure(structure);
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
  ctx.fillStyle = "#5b3b2e";
  roundRect(segment.x + 10, segment.y - 32, 6, 26, 3);
  if (state.wave.active) {
    ctx.fillStyle = `rgba(255, ${154 + Math.sin(performance.now() / 120 + segment.x) * 28}, 70, 0.92)`;
    ctx.beginPath();
    ctx.ellipse(segment.x + 13, segment.y - 39, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }
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
  const friendlyActors = [
    state.player,
    ...state.survivors.filter((survivor) => survivor.health > 0),
    ...(state.cityResidents || []).filter((resident) => resident.health > 0),
    ...(state.cityVisitors || []).filter((visitor) => visitor.health > 0)
  ];
  return friendlyActors.some((actor) => dist(actor, gate) < gridSize() * 0.82);
}

function drawPlacedCabin(structure) {
  const rect = structureRect(structure);
  drawSprite("cabin", rect.x - 20, rect.y - 50, rect.w + 40, rect.h + 60, { row: levelSpriteRow(structure.level, "cabin") });
  drawStructureLabel(structure, "Cabin");
}

function drawPlacedFoodPrep(structure) {
  const rect = structureRect(structure);
  drawSprite("foodPrep", rect.x - 18, rect.y - 44, rect.w + 36, rect.h + 58, { row: levelSpriteRow(structure.level, "foodPrep") });
  drawStructureLabel(structure, "Kitchen Hall");
}

function drawPlacedStorageShed(structure) {
  const rect = structureRect(structure);
  if (drawSprite("storageShed", rect.x - 24, rect.y - 48, rect.w + 48, rect.h + 72, { row: levelSpriteRow(structure.level, "storageShed") })) {
    drawStructureLabel(structure, "Storage");
    return;
  }
  drawStorageShed({ ...structure, ...rect, id: structure.id, level: structure.level || 1 });
  drawStructureLabel(structure, "Storage");
}

function drawPlacedRootCellar(structure) {
  const rect = structureRect(structure);
  drawRootCellar({ ...structure, ...rect, id: structure.id, level: structure.level || 1 });
  drawStructureLabel(structure, "Root Cellar");
}

function drawPlacedMedicalTent(structure) {
  const rect = structureRect(structure);
  const theme = levelTheme(structure.level || 1);
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(structure.x, structure.y + 48, 92, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dce7da";
  ctx.beginPath();
  ctx.moveTo(rect.x + 12, rect.y + rect.h - 14);
  ctx.lineTo(structure.x, rect.y + 14);
  ctx.lineTo(rect.x + rect.w - 12, rect.y + rect.h - 14);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = theme.roof;
  ctx.beginPath();
  ctx.moveTo(structure.x, rect.y + 14);
  ctx.lineTo(structure.x, rect.y + rect.h - 14);
  ctx.lineTo(rect.x + rect.w - 12, rect.y + rect.h - 14);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#b23b42";
  roundRect(structure.x - 11, rect.y + 44, 22, 56, 4);
  roundRect(structure.x - 28, rect.y + 61, 56, 22, 4);
  ctx.fillStyle = "#243528";
  roundRect(rect.x + 67, rect.y + 84, 38, 27, 5);
  ctx.fill();
  ctx.restore();
  drawStructureLabel(structure, "Medical Tent");
}

function drawPlacedBlacksmith(structure) {
  const rect = structureRect(structure);
  const theme = levelTheme(structure.level || 1);
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.beginPath();
  ctx.ellipse(structure.x + 4, structure.y + 58, 112, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = theme.wall;
  roundRect(rect.x + 14, rect.y + 44, rect.w - 28, rect.h - 48, 10);
  ctx.fill();
  ctx.fillStyle = "#222c32";
  ctx.beginPath();
  ctx.moveTo(rect.x + 2, rect.y + 56);
  ctx.lineTo(structure.x - 4, rect.y + 8);
  ctx.lineTo(rect.x + rect.w - 4, rect.y + 56);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = theme.trim;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(rect.x + 12, rect.y + 56);
  ctx.lineTo(structure.x - 4, rect.y + 16);
  ctx.lineTo(rect.x + rect.w - 12, rect.y + 56);
  ctx.stroke();
  ctx.fillStyle = "#1d252c";
  roundRect(rect.x + 30, rect.y + 74, 78, 48, 7);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 132, 42, 0.78)";
  roundRect(rect.x + 40, rect.y + 84, 58, 22, 8);
  ctx.fill();
  ctx.fillStyle = "#28343d";
  roundRect(rect.x + 124, rect.y + 70, 42, 56, 7);
  ctx.fill();
  ctx.fillStyle = theme.accent;
  roundRect(rect.x + 128, rect.y + 78, 34, 12, 5);
  ctx.fill();
  ctx.fillStyle = "#20202a";
  roundRect(rect.x + rect.w - 40, rect.y - 8, 22, 66, 7);
  ctx.fill();
  ctx.fillStyle = theme.trim;
  roundRect(rect.x + 28, rect.y + 119, rect.w - 54, 9, 5);
  ctx.fill();
  ctx.restore();
  drawStructureLabel(structure, "Blacksmith");
}

function drawPlacedFarm(structure) {
  const rect = structureRect(structure);
  drawSprite("farm", rect.x - 20, rect.y - 20, rect.w + 40, rect.h + 40, { row: levelSpriteRow(structure.level, "farm") });
  drawStructureLabel(structure, "Farm");
}

function drawCityStructure(structure) {
  if (structure.type === "house") return drawCityHouse(structure);
  if (structure.type === "welcomeCenter") return drawWelcomeCenter(structure);
  return drawDecoration(structure);
}

function drawCityHouse(structure) {
  const rect = structureRect(structure);
  if (drawSprite("house", rect.x - 20, rect.y - 46, rect.w + 40, rect.h + 70, { row: levelSpriteRow(structure.level, "house") })) {
    drawStructureLabel(structure, `House ${cityHouseOccupants(structure.id)}/${gameConfig.city.houseCapacity || 5}`);
    return;
  }
  const theme = levelTheme(structure.level || 1);
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(structure.x, structure.y + 50, 92, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = theme.wall;
  roundRect(rect.x + 16, rect.y + 46, rect.w - 32, rect.h - 52, 8);
  ctx.fill();
  ctx.fillStyle = theme.roof;
  ctx.beginPath();
  ctx.moveTo(rect.x + 4, rect.y + 56);
  ctx.lineTo(structure.x, rect.y + 10);
  ctx.lineTo(rect.x + rect.w - 4, rect.y + 56);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255, 190, 96, 0.82)";
  roundRect(rect.x + 36, rect.y + 72, 26, 24, 4);
  ctx.fill();
  roundRect(rect.x + rect.w - 62, rect.y + 72, 26, 24, 4);
  ctx.fill();
  ctx.fillStyle = "#172231";
  roundRect(structure.x - 15, rect.y + 86, 30, 32, 4);
  ctx.fill();
  ctx.restore();
  drawStructureLabel(structure, `House ${cityHouseOccupants(structure.id)}/${gameConfig.city.houseCapacity || 5}`);
}

function drawWelcomeCenter(structure) {
  const rect = structureRect(structure);
  if (drawSprite("welcomeCenter", rect.x - 26, rect.y - 54, rect.w + 52, rect.h + 82, { row: levelSpriteRow(structure.level, "welcomeCenter") })) {
    drawStructureLabel(structure, "Welcome");
    return;
  }
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(structure.x, structure.y + 54, 116, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#405a68";
  roundRect(rect.x + 20, rect.y + 42, rect.w - 40, rect.h - 48, 8);
  ctx.fill();
  ctx.fillStyle = "#173047";
  ctx.beginPath();
  ctx.moveTo(rect.x + 8, rect.y + 52);
  ctx.lineTo(structure.x, rect.y + 8);
  ctx.lineTo(rect.x + rect.w - 8, rect.y + 52);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffb35c";
  roundRect(structure.x - 46, rect.y + 76, 92, 24, 5);
  ctx.fill();
  ctx.fillStyle = "#06111f";
  ctx.font = "900 13px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("WELCOME", structure.x, rect.y + 93);
  ctx.fillStyle = "#73df9b";
  ctx.beginPath();
  ctx.arc(rect.x + rect.w - 34, rect.y + 32, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  drawStructureLabel(structure, "Welcome");
}

function drawDecoration(structure) {
  const t = performance.now() / 1000;
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(structure.x, structure.y + 24, isLargeDecorationType(structure.type) ? 76 : 34, isLargeDecorationType(structure.type) ? 18 : 10, 0, 0, Math.PI * 2);
  ctx.fill();
  if (structure.type === "path") {
    ctx.fillStyle = "#6e8290";
    roundRect(structure.x - 38, structure.y - 38, 76, 76, 8);
    ctx.fill();
    ctx.strokeStyle = "rgba(223,247,255,0.18)";
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (structure.type === "torch") {
    ctx.fillStyle = "#5b3b2e";
    roundRect(structure.x - 5, structure.y - 28, 10, 54, 4);
    ctx.fill();
    if (state.wave.active) {
      ctx.fillStyle = `rgba(255, ${150 + Math.sin(t * 9) * 35}, 70, 0.9)`;
      ctx.beginPath();
      ctx.ellipse(structure.x, structure.y - 38, 14, 22, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (structure.type === "shrub") {
    ctx.fillStyle = "#2f6d45";
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath();
      ctx.ellipse(structure.x - 22 + i * 11, structure.y + (i % 2) * 6, 20, 18, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (structure.type === "bench") {
    ctx.fillStyle = "#7f5838";
    roundRect(structure.x - 36, structure.y - 6, 72, 12, 4);
    ctx.fill();
    roundRect(structure.x - 32, structure.y + 12, 64, 10, 4);
    ctx.fill();
    ctx.fillStyle = "#26384a";
    roundRect(structure.x - 28, structure.y + 22, 8, 18, 3);
    ctx.fill();
    roundRect(structure.x + 20, structure.y + 22, 8, 18, 3);
    ctx.fill();
  } else if (structure.type === "fountain" || structure.type === "largeFountain") {
    const scale = structure.type === "largeFountain" ? 1.45 : 1;
    ctx.fillStyle = "#466b80";
    ctx.beginPath();
    ctx.ellipse(structure.x, structure.y + 10, 42 * scale, 22 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#88d9ff";
    ctx.beginPath();
    ctx.ellipse(structure.x, structure.y + 5, 30 * scale, 13 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#b9e8ff";
    ctx.lineWidth = 3;
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(structure.x, structure.y - 8);
      ctx.quadraticCurveTo(structure.x + i * 20 * scale, structure.y - 36 * scale, structure.x + i * 26 * scale, structure.y + 2);
      ctx.stroke();
    }
  } else if (structure.type === "statue") {
    ctx.fillStyle = "#8fa9b8";
    roundRect(structure.x - 34, structure.y + 26, 68, 18, 4);
    ctx.fill();
    roundRect(structure.x - 20, structure.y - 36, 40, 64, 6);
    ctx.fill();
    ctx.fillStyle = "#dff7ff";
    ctx.beginPath();
    ctx.arc(structure.x, structure.y - 50, 15, 0, Math.PI * 2);
    ctx.fill();
  } else if (structure.type === "garden") {
    ctx.fillStyle = "#315f42";
    roundRect(structure.x - 74, structure.y - 44, 148, 88, 18);
    ctx.fill();
    ["#ffb35c", "#73df9b", "#d94c7c", "#b48cff", "#ffd166"].forEach((color, index) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(structure.x - 48 + index * 24, structure.y - 4 + Math.sin(index) * 16, 8, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  ctx.restore();
}

function drawOutpostStructure(structure) {
  const rect = structureRect(structure);
  const sprite = towerSpriteName(structure.type);
  drawSprite(sprite, rect.x - 22, rect.y - 48, rect.w + 44, rect.h + 58, { row: levelSpriteRow(structure.level, sprite) });
  if (structure.stationedResidentId) {
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = structure.stationedResidentId ? "#73df9b" : "#ffb35c";
    ctx.beginPath();
    ctx.arc(structure.x, structure.y, towerStats(structure).range, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  if (structure.type === "signalTower") {
    ctx.save();
    ctx.strokeStyle = "#dff7ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(structure.x, structure.y - 42, 22, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(structure.x - 24, structure.y - 42 + i * 9);
      ctx.lineTo(structure.x + 24, structure.y - 42 + i * 9);
      ctx.moveTo(structure.x + i * 9, structure.y - 64);
      ctx.lineTo(structure.x + i * 9, structure.y - 20);
      ctx.stroke();
    }
    ctx.restore();
  }
  drawStructureLabel(structure, structureDisplayName(structure.type));
}

function towerSpriteName(type) {
  const sprites = {
    outpost: "outpost",
    hunterPost: "hunterPost",
    signalTower: "signalTower",
    iceTrap: "iceTrap"
  };
  return sprites[type] || "tower";
}

function drawStructureLabel(structure, label) {
  const job = getUpgradeJob("structure", structure.id);
  if (job) drawUpgradeConstructionEffect(structureRect(structure), job);
  const labelHeight = job ? 42 : 28;
  ctx.fillStyle = "rgba(3, 12, 22, 0.6)";
  roundRect(structure.x - 58, structure.y + 50, 116, labelHeight, 7);
  ctx.fillStyle = "#f4f9ff";
  ctx.font = "800 12px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label, structure.x, structure.y + 68, 108);
  if (job) {
    ctx.fillStyle = "#ffd166";
    ctx.font = "900 11px Inter, system-ui, sans-serif";
    ctx.fillText(`${Math.ceil(job.remaining)}s`, structure.x, structure.y + 84, 108);
  }
}

function drawUpgradeConstructionEffect(rect, job) {
  const time = performance.now() / 1000;
  const progress = job.total ? clamp(1 - job.remaining / job.total, 0, 1) : 0;
  ctx.save();
  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 4;
  ctx.setLineDash([12, 8]);
  ctx.lineDashOffset = -time * 28;
  ctx.strokeRect(rect.x - 10, rect.y - 12, rect.w + 20, rect.h + 24);
  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(255, 209, 102, 0.12)";
  roundRect(rect.x - 8, rect.y - 10, rect.w + 16, rect.h + 20, 12);
  ctx.fill();
  ctx.fillStyle = "rgba(3, 12, 22, 0.78)";
  roundRect(rect.x + rect.w / 2 - 50, rect.y - 34, 100, 22, 8);
  ctx.fillStyle = "#ffd166";
  roundRect(rect.x + rect.w / 2 - 46, rect.y - 30, 92 * progress, 14, 7);
  ctx.fillStyle = "#f4f9ff";
  ctx.font = "900 11px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${Math.ceil(job.remaining)}s`, rect.x + rect.w / 2, rect.y - 19);
  const sparkX = rect.x + (rect.w * ((time * 0.35) % 1));
  const sparkY = rect.y - 16 + Math.sin(time * 8) * 6;
  ctx.fillStyle = "#ffb35c";
  ctx.beginPath();
  ctx.arc(sparkX, sparkY, 5 + Math.sin(time * 12) * 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBuildPreview() {
  if (!buildMode || !buildPreview) return;
  const placement = canPlaceStructure(selectedBuildType, buildPreview);
  drawPlacementCells(selectedBuildType, buildPreview, placement);
  const fake = createStructure(selectedBuildType, buildPreview.x, buildPreview.y);
  if (isTowerType(fake.type)) drawTowerRangePreview(fake, placement.ok);
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
  const tower = moveTowerPreview(selectedMoveTarget, movePreview);
  if (tower) drawTowerRangePreview(tower, placement.ok);
  ctx.save();
  ctx.globalAlpha = placement.ok ? 0.42 : 0.22;
  ctx.fillStyle = placement.ok ? "#73df9b" : "#ff5d66";
  roundRect(rect.x, rect.y, rect.w, rect.h, 8);
  ctx.strokeStyle = placement.ok ? "rgba(115, 223, 155, 0.95)" : "rgba(255, 93, 102, 0.95)";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();
}

function moveTowerPreview(target, point) {
  if (!target || target.kind !== "structure") return null;
  const structure = state.structures.find((item) => item.id === target.id);
  return structure && isTowerType(structure.type) ? { ...structure, x: point.x, y: point.y } : null;
}

function drawTowerRangePreview(tower, allowed) {
  const stats = towerStats(tower);
  ctx.save();
  ctx.fillStyle = allowed ? "rgba(115, 223, 155, 0.1)" : "rgba(255, 93, 102, 0.09)";
  ctx.strokeStyle = allowed ? "rgba(115, 223, 155, 0.92)" : "rgba(255, 93, 102, 0.92)";
  ctx.lineWidth = Math.max(3, 2 / camera.zoom);
  ctx.setLineDash([14, 9]);
  ctx.beginPath();
  ctx.arc(tower.x, tower.y, stats.range, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(3, 12, 22, 0.76)";
  roundRect(tower.x - 48, tower.y - stats.range - 34, 96, 24, 7);
  ctx.fill();
  ctx.fillStyle = allowed ? "#dff7ff" : "#ffd0d6";
  ctx.font = "900 12px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`Range ${stats.range}`, tower.x, tower.y - stats.range - 17, 88);
  ctx.restore();
}

function drawMovePlacementCells(rect, placement) {
  const size = gridSize();
  const cells = [];
  const startX = Math.floor(rect.x / size) * size + size / 2;
  const endX = Math.floor((rect.x + rect.w - 1) / size) * size + size / 2;
  const startY = Math.floor(rect.y / size) * size + size / 2;
  const endY = Math.floor((rect.y + rect.h - 1) / size) * size + size / 2;
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
  if (isDecorationType(type) && !isLargeDecorationType(type)) return [point];
  const rect = structureRect({ type, x: point.x, y: point.y });
  const cells = [];
  const startX = Math.floor(rect.x / size) * size + size / 2;
  const endX = Math.floor((rect.x + rect.w - 1) / size) * size + size / 2;
  const startY = Math.floor(rect.y / size) * size + size / 2;
  const endY = Math.floor((rect.y + rect.h - 1) / size) * size + size / 2;
  for (let x = startX; x <= endX; x += size) {
    for (let y = startY; y <= endY; y += size) cells.push({ x, y });
  }
  return cells;
}

function drawStructuresForPreview(structure) {
  if (isBarrierType(structure.type)) drawFenceSegment(structure);
  else if (structure.type === "cabin") drawPlacedCabin(structure);
  else if (structure.type === "foodPrep") drawPlacedFoodPrep(structure);
  else if (structure.type === "storageShed") drawPlacedStorageShed(structure);
  else if (structure.type === "rootCellar") drawPlacedRootCellar(structure);
  else if (structure.type === "medicalTent") drawPlacedMedicalTent(structure);
  else if (structure.type === "blacksmith") drawPlacedBlacksmith(structure);
  else if (structure.type === "farm") drawPlacedFarm(structure);
  else if (isCityBuildingType(structure.type) || isDecorationType(structure.type)) drawCityStructure(structure);
  else drawOutpostStructure(structure);
}

function drawFort() {
  drawFortDamage();
}

function drawFortDamage() {
}

function drawFarmPlots() {
  if (!buildings.farm) return;
  const farm = buildings.farm;
  const theme = levelTheme(farm.level);
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(farm.x + farm.w / 2 + 10, farm.y + farm.h / 2 + 28, farm.w / 2 + 26, farm.h / 2 + 20, 0, 0, Math.PI * 2);
  ctx.fill();
  if (drawSprite("farm", farm.x - 24, farm.y - 30, farm.w + 48, farm.h + 62, { row: levelSpriteRow(farm.level, "farm") })) {
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
    if (building.id === "furnace") {
      drawFurnaceGlow(building);
      ctx.fillStyle = "rgba(0,0,0,0.24)";
      ctx.beginPath();
      ctx.ellipse(building.x + building.w / 2 + 16, building.y + building.h / 2 + 52, building.w / 2 + 62, building.h / 2 + 26, 0, 0, Math.PI * 2);
      ctx.fill();
      if (drawSprite("furnace", building.x - 66, building.y - 94, building.w + 132, building.h + 128, { row: levelSpriteRow(building.level, "furnace") })) {
        drawFurnaceLoadAnimation(building);
      } else {
        drawFurnaceBoiler(building);
      }
      drawBuildingLabel(building);
      return;
    }
    if (building.id === "storageShed") {
      if (!drawSprite("storageShed", building.x - 38, building.y - 58, building.w + 76, building.h + 84, { row: levelSpriteRow(building.level, "storageShed") })) {
        drawStorageShed(building);
      }
      drawBuildingLabel(building);
      return;
    }
    if (building.id === "rootCellar") {
      drawRootCellar(building);
      drawBuildingLabel(building);
      return;
    }
    const spriteName = building.id;
    const spritePad = building.id === "tower" ? 48 : 30;
    const spriteTop = building.id === "tower" ? 74 : 54;
    if (building.id === "tower") drawTowerRange(building);
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(building.x + building.w / 2 + 12, building.y + building.h / 2 + 48, building.w / 2 + 30, building.h / 2 + 22, 0, 0, Math.PI * 2);
    ctx.fill();
    if (drawSprite(spriteName, building.x - spritePad, building.y - spriteTop, building.w + spritePad * 2, building.h + spriteTop + 30, { row: levelSpriteRow(building.level, spriteName) })) {
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
  });
}

function drawFurnaceBoiler(furnace) {
  const theme = levelTheme(furnace.level);
  const pct = furnace.maxFuel ? clamp(furnace.fuel / furnace.maxFuel, 0, 1) : 0;
  const pulse = clamp(furnace.hatchPulse || 0, 0, 1);
  const hatchOpen = Math.sin(pulse * Math.PI);
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.beginPath();
  ctx.ellipse(furnace.x + furnace.w / 2 + 16, furnace.y + furnace.h / 2 + 52, furnace.w / 2 + 36, furnace.h / 2 + 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#35323c";
  roundRect(furnace.x + 18, furnace.y + 44, furnace.w - 36, furnace.h - 28, 14);
  ctx.fillStyle = "#5f6670";
  roundRect(furnace.x + 34, furnace.y + 18, furnace.w - 68, 58, 28);
  ctx.fillStyle = "#20202a";
  roundRect(furnace.x + furnace.w - 34, furnace.y - 64, 24, 104, 7);
  ctx.fillStyle = theme.trim;
  roundRect(furnace.x + 28, furnace.y + 54, furnace.w - 56, 9, 5);
  roundRect(furnace.x + 28, furnace.y + 92, furnace.w - 56, 9, 5);
  ctx.fillStyle = `rgba(255, ${106 + pct * 84}, 48, ${0.38 + pct * 0.48})`;
  roundRect(furnace.x + 48, furnace.y + 78, furnace.w - 96, 38, 12);
  ctx.fillStyle = "#211919";
  roundRect(furnace.x + 42, furnace.y + 72 - hatchOpen * 14, furnace.w - 84, 14, 6);
  roundRect(furnace.x + 42, furnace.y + 112 + hatchOpen * 8, furnace.w - 84, 10, 5);
  const storagePoint = storageShedDropoff(buildings.storageShed);
  const hatch = { x: furnace.x + furnace.w / 2, y: furnace.y + 96 };
  if (pulse > 0) {
    for (let i = 0; i < 3; i += 1) {
      const t = clamp(1 - pulse + i * 0.12, 0, 1);
      const x = storagePoint.x + (hatch.x - storagePoint.x) * t;
      const y = storagePoint.y - 12 + (hatch.y - storagePoint.y) * t - Math.sin(t * Math.PI) * 28;
      drawResourceSprite("wood", x, y, 18);
    }
  }
  ctx.fillStyle = "rgba(245,253,255,0.75)";
  roundRect(furnace.x + 60, furnace.y + 30, 30, 16, 8);
  ctx.fillStyle = "#67c7ff";
  roundRect(furnace.x + 62, furnace.y + 32, 26 * pct, 12, 6);
  ctx.restore();
}

function drawFurnaceLoadAnimation(furnace) {
  const pulse = clamp(furnace.hatchPulse || 0, 0, 1);
  if (pulse <= 0) return;
  const hatchOpen = Math.sin(pulse * Math.PI);
  const storagePoint = storageShedDropoff(buildings.storageShed);
  const hatch = { x: furnace.x + furnace.w / 2 + 2, y: furnace.y + 91 };
  ctx.save();
  ctx.fillStyle = `rgba(255, 118, 42, ${0.28 + hatchOpen * 0.45})`;
  roundRect(hatch.x - 34, hatch.y - 10, 68, 28, 10);
  ctx.fillStyle = "#211919";
  roundRect(hatch.x - 36, hatch.y - 18 - hatchOpen * 11, 72, 12, 6);
  roundRect(hatch.x - 36, hatch.y + 17 + hatchOpen * 7, 72, 9, 5);
  for (let i = 0; i < 3; i += 1) {
    const t = clamp(1 - pulse + i * 0.12, 0, 1);
    const x = storagePoint.x + (hatch.x - storagePoint.x) * t;
    const y = storagePoint.y - 12 + (hatch.y - storagePoint.y) * t - Math.sin(t * Math.PI) * 28;
    drawResourceSprite("wood", x, y, 18);
  }
  ctx.restore();
}

function drawStorageShed(shed) {
  const theme = levelTheme(shed.level || 1);
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(shed.x + shed.w / 2, shed.y + shed.h / 2 + 52, shed.w / 2 + 34, shed.h / 2 + 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = theme.roof;
  ctx.beginPath();
  ctx.moveTo(shed.x - 10, shed.y + 54);
  ctx.lineTo(shed.x + shed.w / 2, shed.y + 4);
  ctx.lineTo(shed.x + shed.w + 10, shed.y + 54);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#5b3b2e";
  ctx.lineWidth = 8;
  [["left", shed.x + 24], ["right", shed.x + shed.w - 24]].forEach(([, x]) => {
    ctx.beginPath();
    ctx.moveTo(x, shed.y + 50);
    ctx.lineTo(x, shed.y + shed.h - 8);
    ctx.stroke();
  });
  ctx.fillStyle = "rgba(112, 77, 46, 0.78)";
  roundRect(shed.x + 38, shed.y + 70, shed.w - 76, 46, 8);
  for (let i = 0; i < Math.min(10, state.stored.wood); i += 1) {
    drawResourceSprite("wood", shed.x + 48 + (i % 5) * 14, shed.y + 100 - Math.floor(i / 5) * 13, 18);
  }
  ctx.restore();
}

function drawRootCellar(cellar) {
  const theme = levelTheme(cellar.level || 1);
  const inventory = rawFoodTypes.reduce((sum, type) => sum + (state.stored[type] || 0), 0);
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.beginPath();
  ctx.ellipse(cellar.x + cellar.w / 2, cellar.y + cellar.h / 2 + 45, cellar.w / 2 + 28, cellar.h / 2 + 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#355446";
  ctx.beginPath();
  ctx.ellipse(cellar.x + cellar.w / 2, cellar.y + cellar.h / 2 + 22, cellar.w / 2 + 14, cellar.h / 2 + 14, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = theme.roof;
  ctx.beginPath();
  ctx.moveTo(cellar.x + 20, cellar.y + 72);
  ctx.lineTo(cellar.x + cellar.w / 2, cellar.y + 20);
  ctx.lineTo(cellar.x + cellar.w - 20, cellar.y + 72);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#5a3926";
  roundRect(cellar.x + cellar.w / 2 - 32, cellar.y + 58, 64, 56, 8);
  ctx.fillStyle = "#261915";
  roundRect(cellar.x + cellar.w / 2 - 23, cellar.y + 68, 46, 39, 6);
  ctx.fillStyle = theme.accent;
  roundRect(cellar.x + cellar.w / 2 - 36, cellar.y + 50, 72, 9, 5);
  const foods = rawFoodTypes.filter((type) => (state.stored[type] || 0) > 0).slice(0, 6);
  foods.forEach((type, index) => drawResourceSprite(type, cellar.x + 24 + index * 18, cellar.y + cellar.h - 8 - (index % 2) * 12, 18));
  ctx.fillStyle = "rgba(3, 12, 22, 0.72)";
  roundRect(cellar.x + cellar.w - 50, cellar.y + 18, 42, 20, 6);
  ctx.fillStyle = "#dff7ff";
  ctx.font = "900 11px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(String(inventory), cellar.x + cellar.w - 29, cellar.y + 32);
  ctx.restore();
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
  if (job) drawUpgradeConstructionEffect(building, job);
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
  storageSheds().forEach((shed) => drawStack(storageShedDropoff(shed), "wood", Math.min(8, state.stored.wood), "Wood"));
  rootCellars().forEach((cellar) => {
    const foodType = rawFoodTypes.find((type) => (state.stored[type] || 0) > 0) || "lettuce";
    drawStack(rootCellarDropoff(cellar), foodType, Math.min(6, totalRawFood()), "Food");
  });
  foodPreps().forEach((prep) => {
    drawStack(foodPrepMealDropoff(prep), "meal", Math.min(6, prep.meals || 0), "Meals");
  });
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
  const time = performance.now() / 1000;
  foodPreps().forEach((prep) => {
    const rect = foodPrepRect(prep);
    const recipe = currentPrepRecipe(prep);
    if (!recipeHasIngredients(recipe) || prep.processProgress <= 0 || !pointInRect(state.player, rect, 20)) return;
    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h / 2 + 12;
    const progress = clamp(prep.processProgress / foodProcessSeconds(prep), 0, 1);
    ctx.save();
    ctx.globalAlpha = 0.9;
    for (let i = 0; i < 5; i += 1) {
      const angle = time * 3.6 + i * 1.26;
      const radius = 32 + Math.sin(time * 5 + i) * 8;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * 12 - 30;
      const ingredient = recipe.ingredients[i % recipe.ingredients.length];
      const type = ingredient.type === "wildBerry" ? "blueberries" : ingredient.type;
      drawResourceSprite(type, x, y, 18);
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
  });
}

function drawDiningServiceAnimation() {
  const time = performance.now() / 1000;
  foodPreps().forEach((prep) => {
    const dining = foodPrepRect(prep);
    const cy = dining.y + dining.h * 0.52;
    const serving = prep.meals > 0 || prep.servedPulse > 0;
    ctx.save();
    ctx.fillStyle = "rgba(3, 12, 22, 0.68)";
    roundRect(dining.x + 34, dining.y + dining.h * 0.42, dining.w - 68, 34, 7);
    ctx.fillStyle = "#ffcb72";
    roundRect(dining.x + dining.w - 60, dining.y + dining.h * 0.47, 36, 14, 5);
    ctx.fillStyle = "#dff7ff";
    ctx.font = "900 10px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("ORDER", dining.x + dining.w - 42, dining.y + dining.h * 0.47 + 11);
    if (serving) {
      const t = (prep.serveProgress / Math.max(1, gameConfig.cabin.diningServeSeconds));
      const chefX = dining.x + 52 + Math.sin(time * 2.2 + dining.x * 0.01) * 6;
      ctx.fillStyle = "#f4f9ff";
      ctx.beginPath();
      ctx.arc(chefX, cy - 12, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ff9f43";
      roundRect(chefX - 12, cy, 24, 24, 8);
      const mealX = dining.x + 54 + clamp(t, 0, 1) * (dining.w - 106);
      drawResourceSprite("meal", mealX, dining.y + dining.h * 0.77 - Math.sin(time * 8) * 4, 20);
      if (prep.servedPulse > 0) {
        ctx.globalAlpha = prep.servedPulse;
        ctx.fillStyle = "#73df9b";
        ctx.beginPath();
        ctx.ellipse(dining.x + dining.w - 44, dining.y + dining.h * 0.74, 32, 12, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  });
}

function drawBlacksmithWorkAnimation() {
  const time = performance.now() / 1000;
  blacksmithStructures().forEach((structure) => {
    const rect = structureRect(structure);
    const hammerLift = Math.max(0, Math.sin(time * 4.8 + structure.x * 0.01));
    const spark = Math.max(0, Math.sin(time * 4.8 + structure.x * 0.01 - 0.36));
    const workerX = rect.x + rect.w * 0.68;
    const workerY = rect.y + rect.h * 0.62;
    ctx.save();
    ctx.fillStyle = "rgba(3,12,22,0.62)";
    roundRect(workerX - 40, workerY - 38, 80, 62, 8);
    ctx.fillStyle = "#f0b17b";
    ctx.beginPath();
    ctx.arc(workerX - 8, workerY - 18, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#35424b";
    roundRect(workerX - 19, workerY - 8, 25, 31, 7);
    ctx.fillStyle = "#b46a32";
    roundRect(workerX - 6, workerY + 4, 40, 14, 4);
    ctx.fillStyle = "#79858c";
    ctx.beginPath();
    ctx.moveTo(workerX + 16, workerY + 2);
    ctx.lineTo(workerX + 34, workerY - 8);
    ctx.lineTo(workerX + 42, workerY + 4);
    ctx.lineTo(workerX + 24, workerY + 14);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#5d3b25";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(workerX - 2, workerY);
    ctx.lineTo(workerX + 19, workerY - 24 - hammerLift * 23);
    ctx.stroke();
    ctx.strokeStyle = "#9aa6ae";
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(workerX + 13, workerY - 30 - hammerLift * 23);
    ctx.lineTo(workerX + 29, workerY - 21 - hammerLift * 23);
    ctx.stroke();
    if (spark > 0.78) {
      ctx.strokeStyle = `rgba(255, 203, 114, ${(spark - 0.78) * 4.2})`;
      ctx.lineWidth = 2;
      for (let index = 0; index < 4; index += 1) {
        ctx.beginPath();
        ctx.moveTo(workerX + 28, workerY + 4);
        ctx.lineTo(workerX + 34 + index * 7, workerY - 10 + index * 7);
        ctx.stroke();
      }
    }
    ctx.restore();
  });
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
    const row = clamp(Number.isFinite(tree.spriteRow) ? tree.spriteRow : 0, 0, spriteRowCount("tree") - 1);
    if (drawSprite("tree", -64, -128, 128, 208, { row, trim: true, trimPadding: 6 })) {
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

function drawRecipeSites() {
  recipeSites.forEach((site) => {
    if (recipeUnlocked(site.recipeId)) return;
    const bob = Math.sin(performance.now() / 450 + site.bob) * 5;
    ctx.save();
    ctx.translate(site.x, site.y + bob);
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(0, 30, 40, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6d4327";
    roundRect(-34, -20, 68, 52, 8);
    ctx.fillStyle = "#d7a35c";
    roundRect(-40, -28, 80, 18, 6);
    ctx.strokeStyle = "#362317";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(20, 0);
    ctx.stroke();
    ctx.fillStyle = "#ffe4a8";
    roundRect(-13, -9, 26, 29, 5);
    ctx.strokeStyle = "#b67a32";
    ctx.beginPath();
    ctx.moveTo(-7, -2);
    ctx.lineTo(7, -2);
    ctx.moveTo(-7, 5);
    ctx.lineTo(7, 5);
    ctx.moveTo(-7, 12);
    ctx.lineTo(4, 12);
    ctx.stroke();
    if (dist(state.player, site) < 132) {
      ctx.fillStyle = "rgba(3,12,22,0.76)";
      roundRect(-54, -62, 108, 24, 7);
      ctx.fillStyle = "#ffcb72";
      ctx.font = "900 11px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("RECIPE CHALLENGE", 0, -46);
    }
    ctx.restore();
  });
}

function drawBrokenMachineSites() {
  machineSites.forEach((site) => {
    if (!machineSiteReady(site)) return;
    const pulse = Math.sin(performance.now() / 220 + site.bob);
    ctx.save();
    ctx.translate(site.x, site.y + pulse * 3);
    ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
    ctx.beginPath();
    ctx.ellipse(0, 42, 62, 17, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#26313a";
    roundRect(-52, -25, 104, 62, 12);
    ctx.strokeStyle = "#bf7e38";
    ctx.lineWidth = 4;
    ctx.strokeRect(-44, -18, 88, 48);
    ctx.fillStyle = "#c69244";
    ctx.beginPath();
    ctx.arc(-23, 4, 18, 0, Math.PI * 2);
    ctx.arc(24, -2, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#13222a";
    ctx.beginPath();
    ctx.arc(-23, 4, 9, 0, Math.PI * 2);
    ctx.arc(24, -2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#8b582c";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-48, -9);
    ctx.lineTo(-72, -28);
    ctx.moveTo(40, 18);
    ctx.lineTo(70, 2);
    ctx.stroke();
    ctx.strokeStyle = "#6be9ce";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-11, -13);
    ctx.lineTo(3, 5);
    ctx.lineTo(12, -12);
    ctx.stroke();
    ctx.fillStyle = `rgba(118, 255, 226, ${0.45 + Math.max(0, pulse) * 0.35})`;
    ctx.beginPath();
    ctx.arc(3, 5, 10 + Math.max(0, pulse) * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffd166";
    [[-58, -36], [58, -22], [49, -45]].forEach(([x, y], index) => {
      const spark = Math.max(0, Math.sin(performance.now() / 120 + site.bob + index * 1.7));
      ctx.globalAlpha = spark;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 10, y - 8);
      ctx.lineTo(x + 5, y + 5);
      ctx.closePath();
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    if (dist(state.player, site) < 142) {
      ctx.fillStyle = "rgba(3, 12, 22, 0.8)";
      roundRect(-70, -80, 140, 26, 7);
      ctx.fillStyle = "#7af5db";
      ctx.font = "900 11px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("STEP ON TO REPAIR", 0, -62);
    }
    ctx.restore();
  });
}

function drawBerryBush(bush, shake = 0) {
  const style = berryBushStyles[bush.berryType] || berryBushStyles.blueberries;
  ctx.save();
  ctx.translate(bush.x + shake, bush.y);
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(0, 36, 42, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = style.foliage;
  ctx.beginPath();
  ctx.ellipse(-18, 10, 36, 46, -0.35, 0, Math.PI * 2);
  ctx.ellipse(18, 10, 36, 46, 0.35, 0, Math.PI * 2);
  ctx.ellipse(0, -2, 42, 50, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = style.bright;
  ctx.beginPath();
  ctx.ellipse(-18, 20, 22, 18, -0.25, 0, Math.PI * 2);
  ctx.ellipse(20, 18, 24, 19, 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = style.berry;
  for (let i = 0; i < 9; i += 1) {
    const angle = i * 1.7;
    ctx.beginPath();
    const berryX = Math.cos(angle) * 22;
    const berryY = -4 + Math.sin(angle) * 22;
    if (style.berryShape === "oval") ctx.ellipse(berryX, berryY, 6, 4, angle, 0, Math.PI * 2);
    else if (style.berryShape === "cluster") ctx.ellipse(berryX, berryY, 5, 6, angle * 0.2, 0, Math.PI * 2);
    else ctx.arc(berryX, berryY, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  if (bush.progress > 0) {
    const duration = gameConfig.trees.berryGatherSeconds || 3;
    ctx.fillStyle = "rgba(3, 12, 22, 0.66)";
    roundRect(-38, 52, 76, 9, 5);
    ctx.fillStyle = style.berry;
    roundRect(-38, 52, 76 * clamp(bush.progress / duration, 0, 1), 9, 5);
  }
  ctx.restore();
}

function drawResources() {
  resources.forEach((resource) => {
    const meta = resourceMeta[resource.type];
    const bob = Math.sin(performance.now() / 280 + resource.bob) * 5;
    const popSeconds = (gameConfig.resources || defaultGameConfig.resources).popSeconds || 0.35;
    const popProgress = resource.expiring ? clamp(1 - (resource.pop || 0) / popSeconds, 0, 1) : 0;
    const size = 34 * (1 + popProgress * 0.65);
    ctx.save();
    ctx.globalAlpha = resource.expiring ? 1 - popProgress : 1;
    drawResourceSprite(resource.type, resource.x, resource.y + bob, size);
    ctx.fillStyle = "#06111f";
    ctx.font = "900 12px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(meta.short, resource.x, resource.y + bob + 5);
    ctx.restore();
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

function drawCityResidents() {
  (state.cityVisitors || []).forEach((visitor) => {
    drawCityPerson(visitor, "");
    drawActorHealth(visitor, 58);
  });
  (state.cityResidents || []).forEach((resident) => {
    drawCityPerson(resident, resident.chatTimer > 0 ? "..." : "");
    drawActorHealth(resident, 58);
  });
}

function drawDeer() {
  deer.forEach((animal) => {
    const row = animal.fleeTimer > 0 ? 0 : (animal.grazeTimer || 0) > 0 ? 2 : 1;
    const fps = row === 0 ? 10 : row === 1 ? 6 : 3;
    const frame = Math.floor((animal.walkTime || 0) * fps) % spriteFrameCount("deer");
    if (drawSprite("deer", animal.x - 64, animal.y - 70, 128, 96, { row, flip: animal.facing < 0, frame, fps, trim: true, trimPadding: 10 })) {
      if (animal.hp < animal.maxHp) {
        ctx.save();
        ctx.fillStyle = "rgba(3, 12, 22, 0.66)";
        roundRect(animal.x - 34, animal.y - 58, 68, 7, 4);
        ctx.fillStyle = "#ff5d66";
        roundRect(animal.x - 34, animal.y - 58, 68 * clamp(animal.hp / animal.maxHp, 0, 1), 7, 4);
        ctx.restore();
      }
      return;
    }
    const side = animal.direction === "left" || animal.direction === "right";
    const stride = Math.sin((animal.walkTime || 0) * 6);
    const flip = animal.facing < 0 ? -1 : 1;
    ctx.save();
    ctx.translate(animal.x, animal.y);
    ctx.scale(flip, 1);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath();
    ctx.ellipse(0, 25, 42, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = animal.hitFlash > 0 ? "#ffdf9a" : "#8a5a36";
    ctx.beginPath();
    ctx.ellipse(0, -4, side ? 45 : 38, 21, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#a87549";
    ctx.beginPath();
    ctx.ellipse(34, -22, 22, 15, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f4e0bd";
    ctx.beginPath();
    ctx.ellipse(-28, -1, 12, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#5d3923";
    ctx.lineWidth = 5;
    for (let i = -1; i <= 1; i += 2) {
      ctx.beginPath();
      ctx.moveTo(-18 + i * 14, 12);
      ctx.lineTo(-22 + i * 16, 46 + stride * i * 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(18 + i * 10, 10);
      ctx.lineTo(24 + i * 12, 44 - stride * i * 4);
      ctx.stroke();
    }
    ctx.strokeStyle = "#d9c08e";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(42, -34);
    ctx.lineTo(52, -56);
    ctx.moveTo(44, -34);
    ctx.lineTo(35, -55);
    ctx.stroke();
    ctx.restore();
    if (animal.hp < animal.maxHp) {
      ctx.save();
      ctx.fillStyle = "rgba(3, 12, 22, 0.66)";
      roundRect(animal.x - 34, animal.y - 58, 68, 7, 4);
      ctx.fillStyle = "#ff5d66";
      roundRect(animal.x - 34, animal.y - 58, 68 * clamp(animal.hp / animal.maxHp, 0, 1), 7, 4);
      ctx.restore();
    }
  });
}

function drawPtarmigans() {
  if (state.wave.active) return;
  ptarmigans.forEach((bird) => {
    const flap = Math.sin((bird.walkTime || 0) * 9) * 5;
    const bob = Math.sin((bird.walkTime || 0) * 4 + bird.x * 0.01) * 6;
    const frame = Math.floor((bird.walkTime || 0) * 8) % spriteFrameCount("ptarmigan");
    if (drawSprite("ptarmigan", bird.x - 42, bird.y - (bird.altitude || 28) - 43 + bob, 84, 66, { frame, flip: bird.facing < 0, trim: true, trimPadding: 4 })) {
      if (bird.hp < bird.maxHp) drawAnimalHealth(bird, bird.y - (bird.altitude || 28) - 38);
      return;
    }
    ctx.save();
    ctx.translate(bird.x, bird.y - (bird.altitude || 28) + bob);
    ctx.scale(bird.facing < 0 ? -1 : 1, 1);
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.beginPath();
    ctx.ellipse(0, (bird.altitude || 28), 26, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = bird.hitFlash > 0 ? "#fff2b0" : "#efe9dc";
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d6c5ad";
    ctx.beginPath();
    ctx.ellipse(-12, -6 + flap, 26, 7, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f7f3e9";
    ctx.beginPath();
    ctx.arc(21, -7, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    if (bird.hp < bird.maxHp) drawAnimalHealth(bird, bird.y - (bird.altitude || 28) - 36);
  });
}

function drawAnimalHealth(animal, y) {
  ctx.save();
  ctx.fillStyle = "rgba(3, 12, 22, 0.66)";
  roundRect(animal.x - 28, y, 56, 6, 4);
  ctx.fillStyle = "#ff5d66";
  roundRect(animal.x - 28, y, 56 * clamp(animal.hp / animal.maxHp, 0, 1), 6, 4);
  ctx.restore();
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
      const row = wolf.attacking ? 1 : 0;
      if (drawSprite("eagle", wolf.x - 70, wolf.y - 88 + bob, 140, 104, { flip: wolf.facing < 0, frame, row, fps: 9, trim: true, trimPadding: 10 })) {
        ctx.fillStyle = "rgba(3, 12, 22, 0.66)";
        roundRect(wolf.x - 34, wolf.y - 72 + bob, 68, 8, 4);
        ctx.fillStyle = "#ff5d66";
        roundRect(wolf.x - 34, wolf.y - 72 + bob, 68 * clamp(wolf.hp / wolf.maxHp, 0, 1), 8, 4);
        drawNetStatus(wolf, bob);
        ctx.restore();
        return;
      }
    }
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(wolf.x - 2, wolf.y + 24, 48, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    const frame = Math.floor((wolf.walkTime || 0) * (gameConfig.animation.walkFps || 8)) % spriteFrameCount("wolf");
    const row = wolf.attacking ? 1 : 0;
    if (drawSprite("wolf", wolf.x - 70, wolf.y - 78, 128, 106, { flip: wolf.facing < 0, frame, row, fps: 8, trim: true, trimPadding: 10 })) {
      ctx.fillStyle = "rgba(3, 12, 22, 0.66)";
      roundRect(wolf.x - 40, wolf.y - 58, 80, 8, 4);
      ctx.fillStyle = "#ff5d66";
      roundRect(wolf.x - 40, wolf.y - 58, 80 * clamp(wolf.hp / wolf.maxHp, 0, 1), 8, 4);
      drawNetStatus(wolf);
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
    drawNetStatus(wolf);
    ctx.restore();
  });
}

function drawNetStatus(wolf, yOffset = 0) {
  if (!wolf.netTimer) return;
  ctx.save();
  ctx.strokeStyle = "rgba(223,247,255,0.86)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(wolf.x, wolf.y - 12 + yOffset, 46, 28, 0, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath();
    ctx.moveTo(wolf.x - 44, wolf.y - 12 + yOffset + i * 10);
    ctx.lineTo(wolf.x + 44, wolf.y - 12 + yOffset + i * 10);
    ctx.moveTo(wolf.x + i * 18, wolf.y - 38 + yOffset);
    ctx.lineTo(wolf.x + i * 18, wolf.y + 15 + yOffset);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPlayer() {
  const p = state.player;
  drawPerson(p, "");
  drawActorHealth(p, 58);
  drawCarryStack();
}

function drawWoodChopMiniGame() {
  if (!woodChopMiniGame) return;
  const time = performance.now() / 1000;
  const berryPick = woodChopMiniGame.kind === "berry";
  ctx.save();
  if (!woodChopMiniGame.active) {
    const pct = 1 - clamp(woodChopMiniGame.startDelay / Math.max(0.1, chopMiniGameConfig().startDelaySeconds || 1), 0, 1);
    ctx.fillStyle = "rgba(3, 12, 22, 0.7)";
    roundRect(state.player.x - 56, state.player.y - 226, 112, 22, 11);
    ctx.fillStyle = "#ffcb72";
    roundRect(state.player.x - 52, state.player.y - 222, 104 * pct, 14, 8);
    ctx.fillStyle = "#f4f9ff";
    ctx.font = "800 10px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(berryPick ? "READY BASKET" : "READY AXE", state.player.x, state.player.y - 210);
    ctx.restore();
    return;
  }
  const targetPoint = woodChopTargetPoint();
  const factors = [woodChopMiniGame.factorA, woodChopMiniGame.factorB];
  ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
  roundRect(targetPoint.x - 86, targetPoint.y - 34, 172, 66, 16);
  ctx.fillStyle = berryPick ? "#31523b" : "#6d4327";
  roundRect(targetPoint.x - 82, targetPoint.y - 38, 164, 58, 16);
  ctx.fillStyle = berryPick ? "rgba(115, 223, 155, 0.18)" : "rgba(255, 221, 160, 0.16)";
  roundRect(targetPoint.x - 72, targetPoint.y - 30, 144, 9, 5);
  ctx.strokeStyle = berryPick ? "#183227" : "#3f2a1c";
  ctx.lineWidth = 3;
  ctx.strokeRect(targetPoint.x - 78, targetPoint.y - 34, 156, 50);
  factors.forEach((factor, index) => {
    const x = targetPoint.x + (index === 0 ? -38 : 38);
    ctx.fillStyle = berryPick ? (index ? "#ff8b6b" : "#5078e7") : "#b77742";
    ctx.beginPath();
    ctx.ellipse(x, targetPoint.y - 7, 24, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = berryPick ? "rgba(26, 57, 42, 0.82)" : "rgba(61, 36, 20, 0.62)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, targetPoint.y - 7, 14, 11, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#fff7df";
    ctx.font = "900 20px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(factor), x, targetPoint.y + 1);
  });
  ctx.strokeStyle = berryPick ? "#fff1c8" : "#d9edf7";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(targetPoint.x - 10, targetPoint.y - 22);
  ctx.lineTo(targetPoint.x + 10, targetPoint.y + 8);
  ctx.moveTo(targetPoint.x + 10, targetPoint.y - 22);
  ctx.lineTo(targetPoint.x - 10, targetPoint.y + 8);
  ctx.stroke();
  ctx.fillStyle = "rgba(244,249,255,0.92)";
  ctx.font = "800 10px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(berryPick ? "BERRY TOTAL" : "SPLIT TOTAL", targetPoint.x, targetPoint.y + 28);
  const layout = woodChopLogLayout();
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(state.player.x, layout.y + layout.segmentH + 10, 150, 19, 0, 0, Math.PI * 2);
  ctx.fill();
  woodChopMiniGame.choices.forEach((choice, index) => {
    const rect = woodChopSegmentRect(index);
    const wobble = choice.flash > 0 ? Math.sin(time * 36) * 4 : 0;
    ctx.save();
    ctx.translate(wobble, 0);
    const flash = choice.flash > 0;
    if (berryPick) {
      ctx.fillStyle = flash ? "#7b3d35" : (index % 2 ? "#6d4327" : "#7f5838");
      roundRect(rect.x + 5, rect.y + 16, rect.w - 10, rect.h - 12, 15);
      ctx.strokeStyle = "#c58b53";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(rect.x + rect.w / 2, rect.y + 23, rect.w * 0.28, Math.PI, Math.PI * 2);
      ctx.stroke();
      ["#5078e7", "#ff8b6b", "#9266d9"].forEach((color, berryIndex) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(rect.x + 17 + berryIndex * 15, rect.y + 20 + (berryIndex % 2) * 4, 7, 0, Math.PI * 2);
        ctx.fill();
      });
    } else {
      const end = index === 0 || index === woodChopMiniGame.choices.length - 1;
      ctx.fillStyle = flash ? "#7b3d35" : (index % 2 ? "#9b6337" : "#b77742");
      roundRect(rect.x, rect.y, rect.w, rect.h, end ? 18 : 8);
      ctx.fillStyle = "rgba(255, 221, 160, 0.2)";
      roundRect(rect.x + 8, rect.y + 7, rect.w - 16, 8, 4);
      ctx.strokeStyle = "#5b3b2e";
      ctx.lineWidth = 3;
      ctx.strokeRect(rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4);
      if (end) {
        ctx.strokeStyle = "rgba(61, 36, 20, 0.55)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w * 0.32, rect.h * 0.32, 0, 0, Math.PI * 2);
        ctx.ellipse(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w * 0.2, rect.h * 0.2, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.fillStyle = "#fff7df";
    ctx.font = choice.value >= 10 ? "900 18px Inter, system-ui, sans-serif" : "900 22px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(choice.value), rect.x + rect.w / 2, rect.y + rect.h / 2 + 8);
    ctx.restore();
  });
  ctx.restore();
}

function drawCookingMiniGame() {
  if (!cookingMiniGame) return;
  const panel = cookingMiniGamePanel();
  const recipe = recipeById(cookingMiniGame.recipeId);
  const roundSeconds = cookingRoundSeconds();
  const timerPct = clamp((cookingMiniGame.roundTimeLeft || 0) / roundSeconds, 0, 1);
  const urgent = timerPct <= 0.28;
  ctx.save();
  ctx.fillStyle = cookingMiniGame.flash ? "rgba(108, 25, 33, 0.92)" : "rgba(38, 25, 18, 0.92)";
  roundRect(panel.x, panel.y, panel.w, panel.h, 8);
  if (cookingMiniGame.boardPulse) {
    ctx.strokeStyle = `rgba(255, 203, 114, ${clamp(cookingMiniGame.boardPulse * 2.2, 0, 0.66)})`;
    ctx.lineWidth = 5;
    ctx.strokeRect(panel.x + 3, panel.y + 3, panel.w - 6, panel.h - 6);
  }
  ctx.fillStyle = "#ffcb72";
  roundRect(panel.x + 10, panel.y + 10, 144, 28, 7);
  ctx.fillStyle = "#412710";
  ctx.font = "900 12px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SPEED KITCHEN BOGGLE", panel.x + 82, panel.y + 29);
  ctx.fillStyle = "rgba(255, 244, 213, 0.16)";
  roundRect(panel.x + 168, panel.y + 13, 146, 20, 10);
  ctx.fillStyle = urgent ? "#ff7b6e" : "#73df9b";
  roundRect(panel.x + 168, panel.y + 13, 146 * timerPct, 20, 10);
  ctx.fillStyle = urgent ? "#fff0dc" : "#11241c";
  ctx.font = "950 11px Inter, system-ui, sans-serif";
  ctx.fillText(`${Math.max(0, cookingMiniGame.roundTimeLeft || 0).toFixed(1)}s`, panel.x + 241, panel.y + 27);
  ctx.fillStyle = "#f4f9ff";
  ctx.font = "800 12px Inter, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`${recipe.name}: ${cookingMiniGame.typed || "trace fast"}`, panel.x + 18, panel.y + 61);
  ctx.fillStyle = "#ffddb0";
  ctx.font = "850 10px Inter, system-ui, sans-serif";
  ctx.fillText(`Round ${cookingMiniGame.round}  Heat ${cookingMiniGame.score}  Streak ${cookingMiniGame.streak}`, panel.x + 18, panel.y + 78);
  ["serve", "clear"].forEach((action) => {
    const rect = cookingActionRect(action);
    ctx.fillStyle = action === "serve" ? "#73df9b" : "#77544a";
    roundRect(rect.x, rect.y, rect.w, rect.h, 7);
    ctx.fillStyle = action === "serve" ? "#0c2b22" : "#fff1e3";
    ctx.textAlign = "center";
    ctx.font = "900 11px Inter, system-ui, sans-serif";
    ctx.fillText(action === "serve" ? "SERVE WORD" : "CLEAR", rect.x + rect.w / 2, rect.y + 22);
  });
  ctx.strokeStyle = "rgba(115, 223, 155, 0.68)";
  ctx.lineWidth = 4;
  ctx.lineJoin = "round";
  ctx.beginPath();
  cookingMiniGame.selected.forEach((index, order) => {
    const rect = cookingLetterRect(index);
    const x = rect.x + rect.w / 2;
    const y = rect.y + rect.h / 2;
    if (!order) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  cookingMiniGame.letters.forEach((letter, index) => {
    const rect = cookingLetterRect(index);
    const used = cookingMiniGame.selected.includes(index);
    ctx.fillStyle = used ? "#6f5a43" : "#e0a65d";
    roundRect(rect.x, rect.y, rect.w, rect.h, 7);
    ctx.fillStyle = "rgba(255,244,213,0.18)";
    roundRect(rect.x + 5, rect.y + 5, rect.w - 10, 8, 4);
    ctx.fillStyle = used ? "#ffe5b8" : "#3d2614";
    ctx.textAlign = "center";
    ctx.font = "950 19px Inter, system-ui, sans-serif";
    ctx.fillText(letter, rect.x + rect.w / 2, rect.y + 24);
  });
  ctx.fillStyle = "#e9cfab";
  ctx.font = "800 10px Inter, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Words fire instantly when the traced letters make a fresh word.", panel.x + 18, panel.y + 263);
  ctx.fillText(`Words this pan ${cookingMiniGame.usedWords.length}. Session meal bonuses ${cookingMiniGame.foundWords.length}.`, panel.x + 18, panel.y + 304);
  ctx.restore();
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

function colorToRgb(color) {
  const value = String(color || "#ffffff").replace("#", "").trim();
  const normalized = value.length === 3
    ? value.split("").map((digit) => digit + digit).join("")
    : value.padEnd(6, "f").slice(0, 6);
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16)
  };
}

function isPrimaryClothingPixel(data, index) {
  return data[index + 3] > 0 && data[index] > 248 && data[index + 1] > 248 && data[index + 2] > 248;
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
  const tint = colorToRgb(color);
  const imageData = layerCtx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  for (let index = 0; index < pixels.length; index += 4) {
    if (!isPrimaryClothingPixel(pixels, index)) continue;
    pixels[index] = tint.r;
    pixels[index + 1] = tint.g;
    pixels[index + 2] = tint.b;
  }
  layerCtx.putImageData(imageData, 0, 0);
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

function drawCityPattern(style, x, y, w, h) {
  if (!style || style.pattern === "solid") return;
  ctx.save();
  ctx.strokeStyle = style.pattern === "pinstripe" ? "rgba(244,249,255,0.42)" : "rgba(3,12,22,0.2)";
  ctx.fillStyle = "rgba(244,249,255,0.45)";
  if (style.pattern === "dots") {
    for (let px = x + 6; px < x + w - 4; px += 10) {
      for (let py = y + 7; py < y + h - 4; py += 10) {
        ctx.beginPath();
        ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (style.pattern === "check") {
    ctx.lineWidth = 1.5;
    for (let px = x + 5; px < x + w; px += 12) {
      ctx.beginPath();
      ctx.moveTo(px, y);
      ctx.lineTo(px, y + h);
      ctx.stroke();
    }
    for (let py = y + 5; py < y + h; py += 12) {
      ctx.beginPath();
      ctx.moveTo(x, py);
      ctx.lineTo(x + w, py);
      ctx.stroke();
    }
  } else {
    ctx.lineWidth = 1.5;
    for (let px = x + 5; px < x + w; px += 8) {
      ctx.beginPath();
      ctx.moveTo(px, y);
      ctx.lineTo(px, y + h);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawFlowerPattern(style, x, y, w, h) {
  ctx.save();
  const colors = [style.accent || "#ffd166", "#f4f9ff", "#ff5d66"];
  for (let i = 0; i < 8; i += 1) {
    const px = x + 8 + (i % 4) * (w / 4);
    const py = y + 12 + Math.floor(i / 4) * (h / 2.4);
    ctx.fillStyle = colors[i % colors.length];
    for (let petal = 0; petal < 5; petal += 1) {
      const angle = (petal / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(px + Math.cos(angle) * 3, py + Math.sin(angle) * 3, 2.6, 1.8, angle, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#ffd166";
    ctx.beginPath();
    ctx.arc(px, py, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawCityPerson(actor, badge = "") {
  const style = actor.cityStyle || randomCityStyle(actor.gender || "man");
  const x = actor.x;
  const y = actor.y + Math.sin((actor.walkTime || 0) * 2.6) * 4;
  const side = actor.direction === "left" || actor.direction === "right" || actor.direction === "side";
  const back = actor.direction === "up";
  const stride = Math.sin((actor.walkTime || 0) * 5.5);
  const bodyW = side ? 28 : 42;
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(x, y + 42, 34, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1c2530";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - 10, y + 8);
  ctx.lineTo(x - 12 - stride * 5, y + 42);
  ctx.moveTo(x + 10, y + 8);
  ctx.lineTo(x + 12 + stride * 5, y + 42);
  ctx.stroke();
  ctx.strokeStyle = style.main;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(x - bodyW / 2, y - 42);
  ctx.lineTo(x - bodyW / 2 - stride * 3, y - 4);
  ctx.moveTo(x + bodyW / 2, y - 42);
  ctx.lineTo(x + bodyW / 2 + stride * 3, y - 4);
  ctx.stroke();
  if (actor.gender === "woman") {
    ctx.fillStyle = style.main;
    ctx.beginPath();
    ctx.moveTo(x, y - 48);
    ctx.lineTo(x - bodyW / 2 - 10, y + 22);
    ctx.lineTo(x + bodyW / 2 + 10, y + 22);
    ctx.closePath();
    ctx.fill();
    drawFlowerPattern(style, x - bodyW / 2 - 8, y - 35, bodyW + 16, 52);
  } else {
    ctx.fillStyle = style.main;
    roundRect(x - bodyW / 2, y - 50, bodyW, 58, 6);
    ctx.fill();
    drawCityPattern(style, x - bodyW / 2 + 2, y - 48, bodyW - 4, 54);
    if (!back) {
      ctx.fillStyle = "#f4f9ff";
      roundRect(x - 7, y - 48, 14, 34, 3);
      ctx.fill();
      ctx.fillStyle = style.accent;
      ctx.beginPath();
      ctx.moveTo(x, y - 42);
      ctx.lineTo(x - 5, y - 16);
      ctx.lineTo(x + 5, y - 16);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.fillStyle = style.skin;
  ctx.beginPath();
  ctx.arc(x, y - 70, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = style.hair;
  if (back) {
    ctx.beginPath();
    ctx.arc(x, y - 72, 20, Math.PI, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.ellipse(x, y - 82, 19, 10, 0, Math.PI, Math.PI * 2);
    ctx.fill();
  }
  if (badge) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 18px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(badge, x, y - 96);
  }
  ctx.restore();
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
  if (!entries.length) return;
  const base = playerHeadPoint();
  entries.slice(0, 12).forEach((type, index) => {
    const x = base.x - 18 + (index % 4) * 12;
    const y = base.y - 16 - Math.floor(index / 4) * 12;
    drawResourceSprite(type, x, y, 15);
  });
  const badgeScale = clamp(1 / camera.zoom, 0.82, 2);
  const label = `${carryTotal()}/${carryCapacity()}`;
  const fontSize = 12 * badgeScale;
  const badgePadX = 7 * badgeScale;
  const badgeH = 22 * badgeScale;
  const badgeX = base.x + 30;
  const badgeY = base.y - 42;
  ctx.save();
  ctx.font = `950 ${fontSize}px Inter, system-ui, sans-serif`;
  const badgeW = ctx.measureText(label).width + badgePadX * 2;
  ctx.fillStyle = "rgba(4, 14, 24, 0.84)";
  roundRect(badgeX, badgeY, badgeW, badgeH, badgeH / 2);
  ctx.strokeStyle = "rgba(255, 209, 102, 0.82)";
  ctx.lineWidth = Math.max(1.5, badgeScale);
  ctx.stroke();
  ctx.fillStyle = "#fff0c7";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(label, badgeX + badgePadX, badgeY + badgeH / 2 + badgeScale * 0.5);
  ctx.restore();
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
    if (arrow.kind === "net") {
      ctx.strokeStyle = "#dff7ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 18 + t * 12, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.moveTo(x - 22, y + i * 9);
        ctx.lineTo(x + 22, y + i * 9);
        ctx.moveTo(x + i * 9, y - 22);
        ctx.lineTo(x + i * 9, y + 22);
        ctx.stroke();
      }
    } else {
      ctx.strokeStyle = "#ffdf9a";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x - 16, y + 8);
      ctx.lineTo(x + 16, y - 8);
      ctx.stroke();
    }
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
  const visible = Math.min(snow.length, Math.ceil((gameConfig.snow.count || 150) * snowDensityMultiplier()));
  snow.slice(0, visible).forEach((flake) => {
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

function drawLightGlow(x, y, radius, alpha = 0.36) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, `rgba(255, 186, 96, ${alpha})`);
  gradient.addColorStop(0.38, `rgba(255, 150, 70, ${alpha * 0.34})`);
  gradient.addColorStop(1, "rgba(255, 150, 70, 0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function lightSources() {
  if (!state.wave.active) return [];
  const size = gridSize();
  return state.structures
    .filter((structure) => (structure.type === "torch" || isBarrierType(structure.type)) && structure.health > 0)
    .map((structure) => ({
      x: structure.type === "torch" ? structure.x : structure.x + 13,
      y: structure.type === "torch" ? structure.y - 20 : structure.y - 39,
      radius: structure.type === "torch" ? size * 4 : size * 2
    }));
}

function nearestLightSource(point) {
  return lightSources().sort((a, b) => dist(point, a) - dist(point, b))[0] || null;
}

function pointInTorchLight(point) {
  return lightSources().some((light) => dist(point, light) <= light.radius);
}

function drawLighting() {
  if (!state.wave.active) return;
  const size = gridSize();
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  lightSources().forEach((light) => {
    drawLightGlow(light.x, light.y, light.radius, light.radius > size * 3 ? 0.58 : 0.32);
  });
  ctx.restore();
}

function dangerAuraLevel() {
  const furnace = buildings.furnace;
  const cabin = buildings.cabin;
  const fuelLevel = furnace.maxFuel ? 1 - furnace.fuel / (furnace.maxFuel * 0.12) : 0;
  const hungerLevel = cabin.maxHunger ? (cabin.hunger / cabin.maxHunger - 0.88) / 0.12 : 0;
  return clamp(Math.max(fuelLevel, hungerLevel), 0, 1);
}

function drawDangerAura() {
  const level = dangerAuraLevel();
  if (level <= 0) return;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const pulse = 0.82 + Math.sin(performance.now() / 180) * 0.18;
  const alpha = (0.12 + level * 0.28) * pulse;
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
  const frame = 8 + level * 12;
  ctx.strokeStyle = `rgba(255, 68, 82, ${0.46 + level * 0.38})`;
  ctx.lineWidth = frame;
  ctx.strokeRect(frame / 2, frame / 2, width - frame, height - frame);
  ctx.strokeStyle = `rgba(255, 216, 166, ${0.08 + level * 0.18})`;
  ctx.lineWidth = Math.max(2, frame * 0.24);
  ctx.strokeRect(frame * 1.18, frame * 1.18, width - frame * 2.36, height - frame * 2.36);
  ctx.restore();
}

function drawCabinDirectionIndicator() {
  if (!buildings?.cabin) return;
  const cabin = buildings.cabin;
  const cabinScreen = worldToScreen(buildingCenter(cabin));
  const width = window.innerWidth;
  const height = window.innerHeight;
  const halfW = cabin.w * camera.zoom * 0.5;
  const halfH = cabin.h * camera.zoom * 0.5;
  const cabinVisible = cabinScreen.x + halfW > 0
    && cabinScreen.x - halfW < width
    && cabinScreen.y + halfH > 0
    && cabinScreen.y - halfH < height;
  if (cabinVisible) return;

  const compact = Math.min(width, height) < 720;
  const edgeX = compact ? 42 : 54;
  const edgeTop = compact ? 104 : 90;
  const edgeBottom = compact ? 110 : 78;
  const marker = {
    x: clamp(cabinScreen.x, edgeX, width - edgeX),
    y: clamp(cabinScreen.y, edgeTop, height - edgeBottom)
  };
  const angle = Math.atan2(cabinScreen.y - marker.y, cabinScreen.x - marker.x);
  const pulse = 0.88 + Math.sin(performance.now() / 280) * 0.12;

  ctx.save();
  ctx.translate(marker.x, marker.y);
  ctx.shadowColor = "rgba(122, 245, 219, 0.45)";
  ctx.shadowBlur = 12;
  ctx.fillStyle = `rgba(5, 19, 30, ${0.8 + pulse * 0.12})`;
  ctx.strokeStyle = "rgba(255, 209, 102, 0.68)";
  ctx.lineWidth = 2;
  roundRect(-31, -31, 62, 62, 18);
  ctx.stroke();
  ctx.rotate(angle);
  ctx.fillStyle = "#7af5db";
  ctx.beginPath();
  ctx.moveTo(24, 0);
  ctx.lineTo(-8, -15);
  ctx.lineTo(-2, 0);
  ctx.lineTo(-8, 15);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = "rgba(3, 12, 22, 0.8)";
  roundRect(marker.x - 30, marker.y + 34, 60, 20, 7);
  ctx.fillStyle = "#ffda9c";
  ctx.font = "900 10px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("CABIN", marker.x, marker.y + 48);
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

function furnaceLogsToFill(building = buildings.furnace) {
  const remainingFuel = Math.max(0, building.maxFuel - building.fuel);
  if (remainingFuel <= 0) return 0;
  return Math.ceil(remainingFuel / gameConfig.furnace.fuelPerWood);
}

function furnaceLoadButtonAmount(building = buildings.furnace) {
  return Math.min(gameConfig.furnace.woodLoadAmount, furnaceLogsToFill(building));
}

function warnFurnaceFull() {
  showCenterMessage("Generator is full. Upgrade it to increase capacity.", 2.4);
  setMessage("The generator is full. Upgrade it to increase capacity.", 5);
}

function loadFurnaceLogs(building, requestedLogs) {
  const logsToFit = furnaceLogsToFill(building);
  if (logsToFit <= 0) {
    warnFurnaceFull();
    return;
  }
  if (state.stored.wood <= 0) {
    showCenterMessage("Not enough wood.");
    setMessage("Storage Shed inventory is empty.");
    return;
  }
  const used = Math.min(Math.max(1, requestedLogs || 1), logsToFit, state.stored.wood);
  const remainingFuel = building.maxFuel - building.fuel;
  state.stored.wood -= used;
  building.fuel = clamp(building.fuel + Math.min(remainingFuel, used * gameConfig.furnace.fuelPerWood), 0, building.maxFuel);
  building.hatchPulse = 1;
  setMessage(`Loaded ${used} log${used === 1 ? "" : "s"} from Storage Shed inventory into the generator.`);
  playSound("drop");
  saveState();
  openBuildingMenu(building);
}

function openBuildingMenu(building) {
  const meter = getBuildingMeter(building);
  const cost = adjustedUpgradeCost(building);
  const job = getUpgradeJob("building", building.id);
  const cooldown = getCooldown(`building:${building.id}`);
  const residentSection = building.id === "cabin" ? renderCabinResidents() : building.id === "tower" ? renderStarterTowerStations() : "";
  const recipeSection = building.id === "foodPrep" ? foodPrepRecipeMarkup(building) : building.id === "rootCellar" ? rawFoodInventoryMarkup() : "";
  const furnaceLoadAmount = building.id === "furnace" ? furnaceLoadButtonAmount(building) : 0;
  const furnaceFillLogs = building.id === "furnace" ? furnaceLogsToFill(building) : 0;
  const meterMarkup = building.id === "cabin" ? "" : `
    <div class="stat-line">
      <span>${meter.label}</span>
      <div class="mini-meter"><i style="width:${meter.pct}%"></i></div>
    </div>
  `;
  hud.modalEyebrow.textContent = "Building";
  hud.modalTitle.textContent = building.name;
  hud.modalBody.innerHTML = `
    <p>${building.task}</p>
    ${meterMarkup}
    ${recipeSection}
    ${residentSection}
    ${job ? `<p>Upgrade in progress: ${Math.ceil(job.remaining)}s remaining.</p>` : ""}
    ${cooldown ? `<p class="small-note">Upgrade retry cooldown: ${Math.ceil(cooldown)}s.</p>` : ""}
    <p>Level ${building.level}.${canUpgradeBuilding(building) ? ` Upgrade cost: ${cost} wood.` : " Upgrades follow the Group Cabin."}</p>
    <div class="modal-actions">
      ${building.id === "furnace" ? `<button id="loadFurnace" type="button">${furnaceLoadAmount ? `Load ${furnaceLoadAmount} log${furnaceLoadAmount === 1 ? "" : "s"}` : "Generator full"}</button><button id="fillFurnace" type="button">Fill generator${furnaceFillLogs ? ` (${furnaceFillLogs} logs)` : ""}</button>` : ""}
      ${canUpgradeBuilding(building) ? `<button id="upgradeBuilding" class="primary" type="button">${job ? "Upgrading" : "Upgrade Options"}</button>` : ""}
    </div>
  `;
  openModal();
  const loadButton = document.querySelector("#loadFurnace");
  if (loadButton) {
    loadButton.addEventListener("click", () => loadFurnaceLogs(building, furnaceLoadButtonAmount(building)));
  }
  const fillButton = document.querySelector("#fillFurnace");
  if (fillButton) {
    fillButton.addEventListener("click", () => loadFurnaceLogs(building, furnaceLogsToFill(building)));
  }
  document.querySelector("#upgradeBuilding")?.addEventListener("click", () => {
    if (job) {
      setMessage(`${building.name} is already being upgraded.`);
      return;
    }
    openUpgradePreview({ kind: "building", target: building });
  });
  document.querySelectorAll("[data-starter-station]").forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.starterStation;
      stationExpertAtStarter(value);
      saveState();
      openBuildingMenu(building);
    });
  });
  document.querySelectorAll("[data-train-expert]").forEach((button) => {
    button.addEventListener("click", () => openExpertTrainingMenu(button.dataset.trainExpert));
  });
  bindFoodPrepRecipeButtons(() => openBuildingMenu(building));
}

function renderCabinResidents() {
  if (!state.survivors.length) {
    return `
      <div class="resident-list">
        <h3>Current Experts</h3>
        <p>No recruited Experts yet. Expert candidates can appear at the fort entrance.</p>
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
        <div class="resident-actions">
          <button data-train-expert="${survivor.id}" type="button">Train</button>
        </div>
      </div>
    </article>
  `).join("");
  const cost = expertRetrainCost();
  return `
    <div class="resident-list">
      <h3>Current Experts</h3>
      <p class="small-note">Train an Expert into a different job for ${cost.points} learning points and ${cost.wood} wood.</p>
      ${rows}
    </div>
  `;
}

function expertRetrainCost() {
  const config = gameConfig.residents || {};
  return {
    points: Number.isFinite(config.retrainLearningCost) ? config.retrainLearningCost : 10,
    wood: Number.isFinite(config.retrainWoodCost) ? config.retrainWoodCost : 200
  };
}

function openExpertTrainingMenu(expertId) {
  const survivor = state.survivors.find((expert) => expert.id === expertId);
  if (!survivor) {
    showCenterMessage("That Expert is no longer in camp.", 2);
    openBuildingMenu(buildings.cabin);
    return;
  }
  const cost = expertRetrainCost();
  const options = specialtyCatalog
    .filter((specialty) => specialty.id !== survivor.specialty)
    .map((specialty) => `
      <button data-retrain-specialty="${specialty.id}" type="button">
        <strong>${specialty.title}</strong>
        <span>${specialty.bonus}</span>
      </button>
    `).join("");
  hud.modalEyebrow.textContent = "Expert Training";
  hud.modalTitle.textContent = survivor.name;
  hud.modalBody.innerHTML = `
    <div class="resident-row training-profile">
      <img class="resident-icon" src="${actorIconDataUrl(survivor, 56)}" alt="">
      <div>
        <strong>Current job: Level ${residentLevel(survivor)} ${survivor.title}</strong>
        <span>${survivor.bonus}</span>
        <span>Cost: ${cost.points} learning points and ${cost.wood} wood.</span>
      </div>
    </div>
    <div class="option-list">${options}</div>
    <div class="modal-actions">
      <button id="backToCabin" type="button">Back To Cabin</button>
    </div>
  `;
  openModal();
  document.querySelector("#backToCabin")?.addEventListener("click", () => openBuildingMenu(buildings.cabin));
  document.querySelectorAll("[data-retrain-specialty]").forEach((button) => {
    button.addEventListener("click", () => trainExpert(expertId, button.dataset.retrainSpecialty));
  });
}

function trainExpert(expertId, specialtyId) {
  const survivorIndex = state.survivors.findIndex((expert) => expert.id === expertId);
  const survivor = state.survivors[survivorIndex];
  const specialty = specialtyById(specialtyId);
  if (!survivor || !specialty) {
    showCenterMessage("That Expert is no longer in camp.", 2);
    openBuildingMenu(buildings.cabin);
    return;
  }
  if (survivor.specialty === specialty.id) {
    showCenterMessage(`${survivor.name} already has that job.`, 2);
    return;
  }
  const cost = expertRetrainCost();
  if (state.learningPoints < cost.points) {
    showCenterMessage(`Need ${cost.points} learning points.`, 2.4);
    setMessage("Complete Recruitment missions to earn more learning points.", 5);
    return;
  }
  if (state.stored.wood < cost.wood) {
    showCenterMessage(`Need ${cost.wood} wood.`, 2.4);
    setMessage("Gather and drop off more wood before training an Expert.", 5);
    return;
  }
  state.learningPoints -= cost.points;
  state.stored.wood -= cost.wood;
  clearExpertStations(survivor.id);
  survivor.specialty = specialty.id;
  survivor.title = specialty.title;
  survivor.bonus = specialty.bonus;
  survivor.carrying = null;
  survivor.carryAmount = 0;
  survivor.workTimer = 0;
  survivor.target = null;
  survivor.pathNudge = null;
  survivor.stuckTimer = 0;
  survivor.assignedFoodPrepId = null;
  if (survivor.specialty === "cook") assignedCookFoodPrep(survivor);
  state.survivors[survivorIndex] = normalizeSurvivor(survivor, survivorIndex);
  playSound("upgrade");
  setMessage(`${survivor.name} trained as a ${specialty.title}.`, 6);
  showCenterMessage(`${specialty.title} training complete.`, 2.2);
  saveState();
  openBuildingMenu(buildings.cabin);
}

function renderStarterTowerStations() {
  const rows = [
    `<button data-starter-station="none" type="button">No Expert${!state.towerStationedResidentId ? " Selected" : ""}</button>`,
    ...state.survivors.map((survivor) => `
      <button data-starter-station="${survivor.id}" type="button">
        <img class="resident-icon" src="${actorIconDataUrl(survivor, 42)}" alt="">
        <span>${survivor.name} - Lv ${residentLevel(survivor)} ${survivor.title}${state.towerStationedResidentId === survivor.id ? " Selected" : ""}</span>
        <small>${stationAssignmentLabel(survivor.id, null, true)}</small>
      </button>
    `)
  ].join("");
  return `
    <div class="resident-list">
      <h3>Station Expert</h3>
      <p>Outposts fire on their own. A stationed Expert boosts damage, and Hunters boost it most.</p>
      <div class="option-list">${rows}</div>
    </div>
  `;
}

function residentWorkLabel(survivor) {
  const labels = {
    lumberjack: "Hauling wood to Storage Sheds",
    farmer: "Carrying lettuce to Root Cellars",
    forager: "Gathering berries for Root Cellars",
    cook: "Cooking meals at the Kitchen Hall",
    courier: "Collecting loose resources",
    engineer: "Helping active construction",
    hunter: "Hunting deer and daylight birds",
    doctor: "Treating hurt NPCs",
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
    const recipe = currentPrepRecipe(building);
    const pct = recipeHasIngredients(recipe) ? (building.processProgress / foodProcessSeconds(building)) * 100 : 0;
    return { label: `${recipe.name} cooking (${building.meals || 0} meals ready)`, pct: clamp(pct, 0, 100) };
  }
  if (building.id === "storageShed") {
    return { label: `Shared wood (${state.stored.wood})`, pct: 100 };
  }
  if (building.id === "rootCellar") {
    return { label: `Stored raw food (${totalRawFood()})`, pct: clamp(totalRawFood() * 8, 0, 100) };
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

function rawFoodInventoryMarkup() {
  const rows = rawFoodTypes
    .filter((type) => (state.stored[type] || 0) > 0)
    .map((type) => `<span>${resourceMeta[type].label}: ${state.stored[type]}</span>`)
    .join("");
  return rows ? `<div class="ingredient-list">${rows}</div>` : '<p class="small-note">The Root Cellar has no raw food yet.</p>';
}

function foodPrepRecipeMarkup(prep) {
  const current = currentPrepRecipe(prep);
  const recipeOptions = unlockedRecipes()
    .map((recipe, index) => ({ recipe, index, ready: recipeHasIngredients(recipe) }));
  const recipeButton = ({ recipe, ready }) => `
      <button data-select-recipe="${recipe.id}" data-prep-id="${foodPrepId(prep)}" class="recipe-option ${current.id === recipe.id ? "selected active" : ""} ${ready ? "recipe-ready" : "recipe-missing"}" type="button">
        <strong>${recipe.name}</strong>
        <small>${ready ? "Ingredients ready" : "Missing ingredients"}</small><br>
        ${recipeIngredientsText(recipe)} -> ${recipe.meals} meal${recipe.meals === 1 ? "" : "s"}
      </button>
    `;
  const readyRecipes = recipeOptions.filter((option) => option.ready).sort((a, b) => a.index - b.index);
  const missingRecipes = recipeOptions.filter((option) => !option.ready).sort((a, b) => a.index - b.index);
  const readyButtons = readyRecipes.map(recipeButton).join("");
  const missingButtons = missingRecipes.map(recipeButton).join("");
  return `
    <section class="recipe-menu">
      <h3>Recipe</h3>
      <p>${current.copy}</p>
      ${rawFoodInventoryMarkup()}
      ${readyButtons ? `
        <section class="recipe-ready-group">
          <h4>Ready to cook</h4>
          <div class="option-list">${readyButtons}</div>
        </section>
      ` : ""}
      ${missingButtons ? `
        <details class="recipe-missing-group" ${readyButtons ? "" : "open"}>
          <summary>Missing ingredients recipes <strong>${missingRecipes.length}</strong></summary>
          <div class="option-list">${missingButtons}</div>
        </details>
      ` : ""}
    </section>
  `;
}

function bindFoodPrepRecipeButtons(reopen) {
  document.querySelectorAll("[data-select-recipe]").forEach((button) => {
    button.addEventListener("click", () => {
      const prep = foodPreps().find((item) => foodPrepId(item) === button.dataset.prepId);
      if (!prep) return;
      prep.selectedRecipeId = button.dataset.selectRecipe;
      prep.processProgress = 0;
      prep.wordMealBonus = 0;
      if (cookingMiniGame?.prepId === foodPrepId(prep)) stopCookingMiniGame();
      saveState();
      playSound("success");
      reopen();
    });
  });
}

function adjustedUpgradeCost(building) {
  const engineerDiscount = specialtyLevelTotal("engineer") * gameConfig.upgrades.engineerCostDiscount;
  const baseCost = building.id === "cabin" ? building.upgradeCost * 2 : building.upgradeCost;
  return Math.max(gameConfig.upgrades.minWoodCost, baseCost - engineerDiscount);
}

function canUpgradeBuilding(building) {
  return Boolean(building);
}

function canUpgradeStructure(structure) {
  return Boolean(structure) && !isBarrierType(structure.type) && !isDecorationType(structure.type);
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
  return Math.max(gameConfig.upgrades.minSeconds, base - specialtyLevelTotal("engineer") * gameConfig.upgrades.engineerReductionSeconds);
}

function upgradeTargetId(kind, target) {
  return kind === "fort" ? "fort" : target.id;
}

function upgradeCooldownKey(kind, targetId) {
  if (kind === "fort") return "fort";
  if (kind === "structure") return `structure:${targetId}`;
  return `building:${targetId}`;
}

function structureUpgradeCost(structure) {
  const base = Math.ceil(structureCost(structure.type) * 0.8 + 8);
  const level = Math.max(1, structure.level || 1);
  return Math.ceil(base * (gameConfig.upgrades.buildingCostMultiplier ** (level - 1)));
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
  if (kind === "structure") {
    const structure = target;
    const level = structure.level || 1;
    const nextStructure = { ...structure, level: level + 1 };
    const currentTower = isTowerType(structure.type) ? towerStats(structure) : null;
    const nextTower = isTowerType(structure.type) ? towerStats(nextStructure) : null;
    const nextHealth = structure.maxHealth + (isBarrierType(structure.type) ? 25 : 35);
    const towerCurrent = currentTower
      ? [`Health ${Math.round(structure.health)}/${structure.maxHealth}`, currentTower.netSeconds ? `Net hold ${currentTower.netSeconds.toFixed(1)}s` : `Damage ${Math.round(currentTower.damage)}`, `Range ${currentTower.range}`]
      : null;
    const towerNext = nextTower
      ? [`Health max ${nextHealth}`, nextTower.netSeconds ? `Net hold ${nextTower.netSeconds.toFixed(1)}s` : `Damage ${Math.round(nextTower.damage)}`, `Range ${nextTower.range}`]
      : null;
    const utilityCurrent = structure.type === "foodPrep"
      ? [`Health ${Math.round(structure.health)}/${structure.maxHealth}`, `Cooking speed level ${level}`, `Root Cellar ingredients ${totalRawFood()}`]
      : structure.type === "storageShed"
        ? [`Health ${Math.round(structure.health)}/${structure.maxHealth}`, `Shared wood inventory ${state.stored.wood}`]
        : null;
    const utilityNext = structure.type === "foodPrep"
      ? [`Health max ${nextHealth}`, "Faster meal processing", `Level ${level + 1}`]
      : structure.type === "storageShed"
        ? [`Health max ${nextHealth}`, "Sturdier shared wood depot", `Level ${level + 1}`]
        : null;
    return {
      name: structureDisplayName(structure.type),
      level,
      cost: structureUpgradeCost(structure),
      time: adjustedUpgradeTime(level),
      current: towerCurrent || utilityCurrent || [`Health ${Math.round(structure.health)}/${structure.maxHealth}`, `Level ${level}`],
      next: towerNext || utilityNext || [`Health max ${nextHealth}`, `Level ${level + 1}`]
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
    const nextLevel = building.level + 1;
    const nextType = furnaceUpgradeTypeForLevel(nextLevel);
    stats.current = [`Fuel capacity ${building.maxFuel}`, `Fuel drain ${furnaceFuelDrainForLevel(building.level).toFixed(2)}/sec`];
    stats.next = nextType === "drain"
      ? [`Fuel drain ${furnaceFuelDrainForLevel(nextLevel).toFixed(2)}/sec`, "Fuel lasts longer before needing wood"]
      : [`Fuel capacity ${building.maxFuel + gameConfig.upgrades.furnaceFuelCapacityBonus}`, "Stores more fuel from each refill run"];
  } else if (building.id === "cabin") {
    stats.current = [`Expert capacity ${survivorCapacity()}`, `Hunger max ${building.maxHunger}`, `Town-linked objects level ${building.level}`];
    stats.next = [`Expert capacity ${survivorCapacity() + 1}`, `Hunger max ${building.maxHunger + gameConfig.upgrades.cabinHungerMaxBonus}`, "Fences, gates, and decorations level up too"];
  } else if (building.id === "foodPrep") {
    stats.current = [`Cooking speed level ${building.level}`, `${building.meals || 0} meals ready to serve`, `Root Cellar ingredients ${totalRawFood()}`];
    stats.next = ["Faster meal processing", "Quicker dining window service"];
  } else if (building.id === "storageShed") {
    stats.current = [`Shared wood inventory ${state.stored.wood}`, `Shed level ${building.level}`];
    stats.next = ["Stronger storage platform", "Clearer shared wood drop point"];
  } else if (building.id === "rootCellar") {
    stats.current = [`Stored recipe ingredients ${totalRawFood()}`, `Cellar level ${building.level}`];
    stats.next = ["Refined ingredient shelter", "Clearer recipe storage stacks"];
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
  const targetId = upgradeTargetId(kind, target);
  const key = upgradeCooldownKey(kind, targetId);
  const cooldown = getCooldown(key);
  const hasWood = state.stored.wood >= stats.cost;
  const job = getUpgradeJob(kind, targetId);
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
    else if (kind === "structure") openStructureMenu(target);
    else openBuildingMenu(target);
  });
}

function beginUpgradeChallenge(kind, target, stats) {
  activeTask = selectLearningTask(Math.min(5, stats.level));
  activeTaskContext = { kind: "upgrade", upgradeKind: kind, targetId: upgradeTargetId(kind, target), stats };
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
  const key = upgradeCooldownKey(context.upgradeKind, context.targetId);
  setCooldown(key, gameConfig.timers.upgradeFailCooldown);
  notifyChallengeResourceCost("Upgrade Mission Failed", penalty, `${stats.name} retry is locked for ${gameConfig.timers.upgradeFailCooldown} seconds.`);
  setMessage(`Upgrade mission failed. Lost ${penalty} wood and retry is locked for ${gameConfig.timers.upgradeFailCooldown} seconds.`, 6);
  playSound("fail");
  saveState();
}

function notifyChallengeResourceCost(title, woodCost, detail = "") {
  pushNotification({
    id: `challenge-cost-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    copy: `Resource cost: ${woodCost} wood.${detail ? ` ${detail}` : ""}`,
    warning: true
  });
}

function updateUpgradeJobs(dt) {
  Object.keys(state.cooldowns).forEach((key) => {
    state.cooldowns[key] = Math.max(0, state.cooldowns[key] - dt);
    if (state.cooldowns[key] <= 0) delete state.cooldowns[key];
  });
  state.upgradeJobs.forEach((job) => {
    job.remaining -= dt * generatorProductivityMultiplier();
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
    setMessage("All fences and gates upgraded. Their HP doubled.", 5);
    playSound("upgrade");
    return;
  }
  if (job.kind === "structure") {
    const structure = state.structures.find((candidate) => candidate.id === job.id);
    if (!structure) return;
    applyStructureUpgrade(structure);
    gainPlayerLevel(`${structureDisplayName(structure.type)} upgrade complete.`);
    setMessage(`${structureDisplayName(structure.type)} upgrade complete.`, 5);
    playSound("upgrade");
    return;
  }
  const building = buildings[job.id];
  if (!building) return;
  upgradeBuilding(building);
  gainPlayerLevel(`${building.name} upgrade complete.`);
  setMessage(`${building.name} upgrade complete.`, 5);
  playSound("upgrade");
}

function upgradeBuilding(building) {
  building.level += 1;
  building.upgradeCost = Math.ceil(building.upgradeCost * gameConfig.upgrades.buildingCostMultiplier);
  if (building.id === "furnace") {
    if (furnaceUpgradeTypeForLevel(building.level) === "capacity") {
      building.maxFuel += gameConfig.upgrades.furnaceFuelCapacityBonus;
      building.fuel = building.maxFuel;
    } else {
      building.fuel = clamp(building.fuel + building.maxFuel * 0.12, 0, building.maxFuel);
    }
  }
  if (building.id === "cabin") {
    building.maxHunger += gameConfig.upgrades.cabinHungerMaxBonus;
    building.hunger = clamp(building.hunger - gameConfig.upgrades.cabinUpgradeHungerRelief, 0, building.maxHunger);
    syncCabinLinkedUpgrades(building.level);
  }
  if (building.id === "tower") {
    setMessage("Watch tower upgraded. Arrows hit harder.");
  } else if (building.id === "farm") {
    setMessage("Farm upgraded. Lettuce grows faster.");
  } else if (building.id === "foodPrep") {
    setMessage("Kitchen Hall upgraded. Meals cook and serve faster.");
  } else if (building.id === "storageShed") {
    setMessage("Storage shed upgraded. The shared wood depot is sturdier.");
  } else if (building.id === "cabin") {
    setMessage("Group Cabin upgraded. Barriers and decorations grew with it.");
  } else {
    setMessage(`${building.name} upgraded.`);
  }
}

function syncCabinLinkedUpgrades(level = cabinLinkedLevel()) {
  const targetLevel = Math.max(1, level);
  state.fortLevel = targetLevel;
  state.structures.forEach((structure) => {
    if (!isCabinLinkedStructure(structure.type)) return;
    const currentLevel = structure.level || 1;
    const nextLevel = Math.max(currentLevel, targetLevel);
    const nextMaxHealth = isBarrierType(structure.type)
      ? barrierMaxHealth(structure.type, currentLevel)
      : decorationMaxHealth(currentLevel);
    structure.level = nextLevel;
    structure.maxHealth = isBarrierType(structure.type)
      ? barrierMaxHealth(structure.type, nextLevel)
      : decorationMaxHealth(nextLevel);
    structure.health = nextLevel > currentLevel
      ? structure.maxHealth
      : clamp(Number.isFinite(structure.health) ? structure.health : nextMaxHealth, 0, structure.maxHealth);
  });
}

function applyStructureUpgrade(structure) {
  structure.level = (structure.level || 1) + 1;
  structure.maxHealth += isBarrierType(structure.type) ? 25 : 35;
  structure.health = structure.maxHealth;
}

function structureRepairCost(structure) {
  const missing = Math.max(0, structure.maxHealth - structure.health);
  if (!missing) return 0;
  const baseCost = Math.ceil(missing / 12) * (gameConfig.upgrades.repairCostMultiplier || 3);
  return Math.max(1, Math.ceil(baseCost * (1 - engineerRepairDiscount())));
}

function engineerRepairDiscount() {
  return Math.min(0.6, specialtyLevelTotal("engineer") * 0.02);
}

function totalStructureRepairCost() {
  return state.structures.reduce((sum, structure) => sum + structureRepairCost(structure), 0);
}

function repairAllStructures() {
  const cost = totalStructureRepairCost();
  if (cost <= 0) {
    showCenterMessage("All built structures are repaired.");
    setMessage("All built structures are already fully repaired.", 4);
    return false;
  }
  if (state.stored.wood < cost) {
    showCenterMessage(`Not enough wood. Need ${cost}.`);
    setMessage(`Repair All needs ${cost} wood.`, 4);
    return false;
  }
  state.stored.wood -= cost;
  state.structures.forEach((structure) => {
    structure.health = structure.maxHealth;
  });
  setMessage(`Repaired every built structure for ${cost} wood.`, 5);
  playSound("upgrade");
  saveState();
  updateHud(0);
  return true;
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
  setMessage(`Repaired every fence and gate for ${cost} wood.`, 5);
  playSound("upgrade");
  saveState();
  openFortMenu();
}

function openFortMenu() {
  setMessage("Use the Repair tool in Build to fix damaged fences and gates.", 5);
}

function openBlacksmithTechMenu() {
  const smith = blacksmithStructures().sort((a, b) => dist(state.player, a) - dist(state.player, b))[0];
  if (smith) {
    openStructureMenu(smith);
    return;
  }
  const unlockLevel = gameConfig.build.blacksmithPlayerLevel || 4;
  showCenterMessage(playerLevel() >= unlockLevel ? "Build a Blacksmith first." : `Blacksmith unlocks at level ${unlockLevel}.`, 2.6);
  setMessage("Blacksmith workshops turn learning points into basket and weapon tech.", 5);
}

function openPlayerHubMenu() {
  hud.modalEyebrow.textContent = "Player";
  hud.modalTitle.textContent = "Player";
  hud.modalBody.innerHTML = `
    <div class="player-hub">
      <img class="large-resident-icon" src="${actorIconDataUrl(state.player, 96)}" alt="">
      <div>
        <p><strong>Player Level ${playerLevel()}.</strong> ${state.learningPoints} learning points available.</p>
        <p>Customize layered clothing here. Blacksmith workshops handle basket and weapon tech.</p>
      </div>
    </div>
    <div class="modal-actions">
      <button id="openCharacterCreator" class="primary" type="button">Character Creation</button>
      <button id="openBlacksmithTech" type="button">Blacksmith Tech</button>
      <button id="playerHubBack" type="button">Main Menu</button>
    </div>
  `;
  openModal();
  document.querySelector("#openCharacterCreator").addEventListener("click", openCharacterCreator);
  document.querySelector("#openBlacksmithTech").addEventListener("click", openBlacksmithTechMenu);
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
  const buildingCards = Object.values(buildings).filter(canUpgradeBuilding).map((building) => {
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
  const structureCards = state.structures
    .filter(canUpgradeStructure)
    .map((structure) => {
      const stats = getUpgradeStats("structure", structure);
      const job = getUpgradeJob("structure", structure.id);
      return `
        <div class="menu-card">
          <h3>${structureDisplayName(structure.type)} Lv ${structure.level || 1}</h3>
          <p>${job ? `Upgrading: ${Math.ceil(job.remaining)}s left.` : `Cost ${stats.cost} wood. ${stats.next.join(", ")}.`}</p>
          <button data-upgrade-structure="${structure.id}" type="button">Upgrade</button>
        </div>
      `;
  }).join("");
  hud.modalBody.innerHTML = `
    <p><strong>Player Level ${playerLevel()}.</strong> Finishing building upgrades and Blacksmith tech raises level unlocks.</p>
    <div class="menu-grid">
      ${buildingCards}
      ${structureCards}
    </div>
  `;
  openModal();
  document.querySelectorAll("[data-upgrade-building]").forEach((button) => {
    button.addEventListener("click", () => openUpgradePreview({ kind: "building", target: buildings[button.dataset.upgradeBuilding] }));
  });
  document.querySelectorAll("[data-upgrade-structure]").forEach((button) => {
    button.addEventListener("click", () => {
      const structure = state.structures.find((candidate) => candidate.id === button.dataset.upgradeStructure);
      if (structure) openUpgradePreview({ kind: "structure", target: structure });
    });
  });
}

function selectBuildTypeForPlacement(type) {
  const entry = buildCatalog().find((item) => item.type === type);
  const cost = structureCost(type);
  if (!entry || !entry.unlocked) {
    showCenterMessage(`${structureDisplayName(type)} is locked.`);
    setMessage(entry ? entry.note : "That build option is locked.", 4);
    return;
  }
  if (state.stored.wood < cost) {
    showInsufficientBuildResources(type, cost);
    return;
  }
  if (buildMode && selectedBuildType === type) {
    stopBuildMode(`Stopped placing ${structureDisplayName(type)}.`);
    return;
  }
  selectedBuildType = type;
  buildMode = true;
  moveMode = false;
  removeMode = false;
  repairMode = false;
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
  repairMode = false;
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
  repairMode = false;
  selectedMoveTarget = null;
  movePreview = null;
  buildTrayCollapsed = false;
  renderBuildTray();
  setMessage("Remove mode: tap a fence, gate, tower, city building, decoration, cabin, storage shed, Kitchen Hall, or farm to remove it.", 6);
}

function enterRepairMode() {
  buildMode = false;
  selectedBuildType = null;
  buildPreview = null;
  moveMode = false;
  removeMode = false;
  repairMode = true;
  selectedMoveTarget = null;
  movePreview = null;
  buildTrayCollapsed = false;
  renderBuildTray();
  setMessage("Repair mode: tap a damaged fence, gate, tower, house, cabin, storage shed, Kitchen Hall, farm, or decoration to repair it with wood.", 6);
}

function renderBuildTray() {
  if (!hud.buildTrayBody) return;
  buildTrayRenderKey = buildTrayStateKey();
  const stopButton = (buildMode || moveMode || removeMode || repairMode) ? '<button class="build-token stop-building" data-stop-building type="button">Stop Building</button>' : "";
  const moveButton = `<button class="build-token tool-token ${moveMode ? "active" : ""}" data-move-buildings type="button"><span class="tool-icon move-tool-icon"></span><strong>Move</strong><br>Buildings</button>`;
  const removeButton = `<button class="build-token tool-token ${removeMode ? "active" : ""}" data-remove-buildings type="button"><span class="tool-icon remove-tool-icon"></span><strong>Remove</strong><br>Objects</button>`;
  const repairButton = `<button class="build-token tool-token ${repairMode ? "active" : ""}" data-repair-buildings type="button"><span class="tool-icon repair-tool-icon"></span><strong>Repair</strong><br>Objects</button>`;
  const repairAllCost = totalStructureRepairCost();
  const repairAllButton = `
    <button class="build-token tool-token repair-all-tool" data-repair-all type="button" ${repairAllCost <= 0 ? "disabled" : ""}>
      <span class="tool-icon repair-tool-icon"></span>
      <strong>Repair All</strong>
      <small data-repair-all-cost>${repairAllCost > 0 ? `${repairAllCost} wood` : "All repaired"}</small>
    </button>
  `;
  const buildToken = (item) => {
    const cost = structureCost(item.type);
    const affordable = state.stored.wood >= cost;
    const locked = !item.unlocked;
    const active = buildMode && selectedBuildType === item.type;
    const classes = ["build-token", active ? "active" : "", locked ? "locked" : "", !locked && !affordable ? "not-affordable" : ""].filter(Boolean).join(" ");
    const draggable = item.unlocked && affordable;
    const need = Math.max(0, cost - state.stored.wood);
    return `
      <button class="${classes}" data-tray-build="${item.type}" draggable="${draggable}" type="button" ${locked ? "disabled" : ""} ${!locked && !affordable ? 'aria-disabled="true"' : ""}>
        ${locked ? '<span class="lock-icon" aria-hidden="true"></span>' : ""}
        <strong>${structureDisplayName(item.type)}</strong>
        <span>${cost} wood</span>
        <small>${locked ? item.note : affordable ? item.note : `Need ${need} more wood`}</small>
      </button>
    `;
  };
  const groupMarkup = (id, label, tokens, count) => `
    <details class="build-group build-group-${id}" data-build-group="${id}" ${buildTrayGroupState[id] ? "open" : ""}>
      <summary><strong>${label}</strong><span>${count}</span></summary>
      <div class="build-group-items">${tokens}</div>
    </details>
  `;
  const catalog = buildCatalog();
  const toolTokens = stopButton + moveButton + removeButton + repairButton + repairAllButton;
  const placeableGroups = buildCatalogGroups.map((group) => {
    const entries = catalog.filter((item) => group.types.includes(item.type));
    return groupMarkup(group.id, group.label, entries.map(buildToken).join(""), entries.length);
  }).join("");
  hud.buildTrayBody.innerHTML = groupMarkup("tools", "Tools", toolTokens, stopButton ? 5 : 4) + placeableGroups;
  hud.repairAllButton = hud.buildTrayBody.querySelector("[data-repair-all]");
  hud.repairAllCost = hud.buildTrayBody.querySelector("[data-repair-all-cost]");
  hud.buildTrayBody.querySelectorAll("[data-build-group]").forEach((group) => {
    group.addEventListener("toggle", () => {
      buildTrayGroupState[group.dataset.buildGroup] = group.open;
    });
  });
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
  const repair = hud.buildTrayBody.querySelector("[data-repair-buildings]");
  if (repair) repair.addEventListener("click", () => {
    if (repairMode) stopBuildMode("Stopped repairing objects.");
    else enterRepairMode();
  });
  if (hud.repairAllButton) hud.repairAllButton.addEventListener("click", () => {
    if (paused) return;
    repairAllStructures();
  });
  hud.buildTrayBody.querySelectorAll("[data-tray-build]").forEach((button) => {
    button.addEventListener("click", () => selectBuildTypeForPlacement(button.dataset.trayBuild));
    button.addEventListener("dragstart", (event) => {
      const type = button.dataset.trayBuild;
      const cost = structureCost(type);
      const entry = buildCatalog().find((item) => item.type === type);
      if (!entry || !entry.unlocked || state.stored.wood < cost) {
        event.preventDefault();
        if (entry && entry.unlocked) showInsufficientBuildResources(type, cost);
        return;
      }
      selectedBuildType = type;
      buildMode = true;
      moveMode = false;
      removeMode = false;
      repairMode = false;
      selectedMoveTarget = null;
      movePreview = null;
      buildPreview = null;
      event.dataTransfer.setData("text/plain", selectedBuildType);
      renderBuildTray();
    });
  });
}

function buildTrayStateKey() {
  return [
    state.stored.wood,
    playerLevel(),
    maxFoodPrepLevel(),
    state.structures.length,
    buildMode ? selectedBuildType : "",
    moveMode ? "move" : "",
    removeMode ? "remove" : "",
    repairMode ? "repair" : "",
    buildTrayCollapsed ? "closed" : "open"
  ].join(":");
}

function refreshBuildTrayIfNeeded() {
  if (!hud.buildTrayBody) return;
  const key = buildTrayStateKey();
  if (key !== buildTrayRenderKey) renderBuildTray();
}

function showInsufficientBuildResources(type, cost = structureCost(type)) {
  const missing = Math.max(1, cost - state.stored.wood);
  const message = `Need ${missing} more wood to build ${structureDisplayName(type)}.`;
  showCenterMessage(message, 2.2);
  setMessage(message, 4);
}

function openBuildMenu() {
  renderBuildTray();
  buildTrayCollapsed = false;
  if (modalOpen) closeModal(true);
  setMessage("Build menu opened. Scroll left or right, then choose a structure to place.", 4);
  updateHud(0);
}

function scrollBuildTray(direction) {
  if (!hud.buildTrayBody) return;
  const amount = Math.max(180, hud.buildTrayBody.clientWidth * 0.75) * direction;
  if (typeof hud.buildTrayBody.scrollBy === "function") {
    hud.buildTrayBody.scrollBy({ left: amount, behavior: "smooth" });
  } else {
    hud.buildTrayBody.scrollLeft += amount;
  }
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
  if (["hunterPost", "signalTower", "iceTrap", "cabin", "storageShed", "rootCellar", "medicalTent", "blacksmith", "foodPrep", "farm", "welcomeCenter", "house", "largeFountain", "statue", "garden"].includes(selectedBuildType)) {
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
    showInsufficientBuildResources(type, cost);
    return;
  }
  state.stored.wood -= cost;
  if (replaceIds && replaceIds.length) {
    replaceIds.forEach((id) => {
      const existing = state.structures.find((structure) => structure.id === id);
      if (!existing) return;
      existing.type = type;
      existing.level = cabinLinkedLevel();
      existing.maxHealth = barrierMaxHealth(type, existing.level);
      existing.health = existing.maxHealth;
      existing.gateGroup = replaceIds.join("-");
    });
  } else {
    const structure = createStructure(type, point.x, point.y);
    clearTreesInRect(structureRect(structure));
    state.structures.push(structure);
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
  if (rectTouchesWater(rect)) return { ok: false, reason: "Water covers that grid space." };
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
  setMessage("Tap a building, tower, cabin, storage shed, Kitchen Hall, farm, house, attraction, or decoration to move it. Fences and gates stay in the wall network.", 5);
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
    clearTreesInRect(building);
    syncDropoffsToBuildings();
  } else {
    const structure = state.structures.find((item) => item.id === selectedMoveTarget.id);
    if (structure) {
      structure.x = point.x;
      structure.y = point.y;
      clearTreesInRect(structureRect(structure));
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
    if (structure.type === "house") {
      state.cityResidents.forEach((resident) => {
        if (resident.homeId === structure.id) resident.homeId = null;
      });
    }
    if (structure.type === "welcomeCenter") {
      state.cityVisitors = [];
    }
    state.structures = state.structures.filter((item) => item.id !== structure.id);
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
  setMessage("Remove mode: tap a fence, gate, tower, city building, decoration, cabin, storage shed, Kitchen Hall, or farm.", 4);
  return false;
}

function openMainMenu() {
  hud.modalEyebrow.textContent = "Camp";
  hud.modalTitle.textContent = "Main Menu";
  hud.modalBody.innerHTML = `
    <div class="modal-actions main-menu-actions">
      <button id="openHelpMenu" class="primary" type="button">Help</button>
      <button id="openUpgradeCenter" type="button">Upgrades</button>
    </div>
  `;
  openModal("main-menu");
  document.querySelector("#openUpgradeCenter").addEventListener("click", openUpgradeMenu);
  document.querySelector("#openHelpMenu").addEventListener("click", openHelpMenu);
}

function openHelpMenu() {
  hud.modalEyebrow.textContent = "Help";
  hud.modalTitle.textContent = "Camp Guide";
  hud.modalBody.innerHTML = `
    <div class="menu-grid">
      <div class="menu-card">
        <h3>First Moves</h3>
        <p>Gather wood from trees, drop it at Storage Sheds, then load the generator from storage. Gather berries or lettuce for raw food.</p>
      </div>
      <div class="menu-card">
        <h3>Food Loop</h3>
        <p>Drop raw food at a Root Cellar, then select unlocked recipes at the Kitchen Hall. It cooks and serves finished meals automatically. If hunger fills, Experts protest at the Group Cabin until meals bring it down.</p>
      </div>
      <div class="menu-card">
        <h3>Defense</h3>
        <p>Build outposts during the day. At night, attackers arrive from the dark at random intervals, and towers need generator fuel to fire.</p>
      </div>
      <div class="menu-card">
        <h3>Variable Flow Repairs</h3>
        <p>Explore for sparking broken machines. Step onto one and route algebra steam through its pipe network for learning points. Repaired machines break again after five in-game days.</p>
      </div>
      <div class="menu-card">
        <h3>Upgrades</h3>
        <p>Open Upgrade to improve buildings. After the Blacksmith unlocks, learning points can become basket and weapon tech there.</p>
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
  if (state.tutorialFlags[flag] || modalOpen || paused || activeTaskContext) return false;
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
  hud.modalEyebrow.textContent = "Expert At The Gate";
  hud.modalTitle.textContent = visitor.name;
  hud.modalBody.innerHTML = `
    <p><strong>Level ${visitor.level} ${visitor.title}</strong></p>
    <p>${visitor.bonus}</p>
    <p>Recruiting them as an Expert requires one learning task. Expert capacity is ${state.survivors.length}/${survivorCapacity()}.</p>
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
  const missionCopy = `Grade ${task.grade || "?"} challenge. Reward: ${task.points || 3} learning points.`;
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
        if (context && context.kind === "build") {
          window.setTimeout(() => placeStructure(context.buildType, context.point, context.cost, context.replaceIds || null), 650);
        } else if (context && context.kind === "upgrade") {
          window.setTimeout(() => startUpgradeJob(context.upgradeKind, context.targetId, context.stats), 650);
        } else if (context && context.kind === "recipe") {
          window.setTimeout(() => unlockRecipe(context.recipeId), 650);
        } else {
          window.setTimeout(completeRecruitment, 600);
        }
      } else {
        button.classList.add("wrong");
        showCenterMessage(task.feedback || option.feedback || "That answer misses the clue. Read it again carefully.", 4);
        if (context && context.kind === "build") {
          const penalty = Math.ceil(context.cost * gameConfig.upgrades.failureCostPercent);
          state.stored.wood = Math.max(0, state.stored.wood - penalty);
          notifyChallengeResourceCost("Build Mission Failed", penalty, `${structureDisplayName(context.buildType)} was not placed.`);
          setMessage(`Build mission failed. Lost ${penalty} wood in the storm.`, 5);
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
        } else if (context && context.kind === "recipe") {
          setMessage("The recipe cache stays sealed. Try its field note again when ready.", 5);
          playSound("fail");
          window.setTimeout(() => {
            activeTask = null;
            activeTaskContext = null;
            closeModal(true);
          }, 950);
        } else {
          setMessage("The Expert candidate needs a clearer answer and leaves for now.", 5);
          window.setTimeout(() => finishVisitor(`${pendingRecruit.name} leaves the gate.`), 950);
        }
      }
    });
  });
}

function renderReplacementMenu(recruit) {
  hud.modalEyebrow.textContent = "Camp Full";
  hud.modalTitle.textContent = "Choose An Expert";
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
    <p>The camp can only hold ${survivorCapacity()} Experts right now. Choose someone to send away or keep your current crew.</p>
    <div class="replacement-layout">
      <div class="replacement-column">
        <h3>Current Experts</h3>
        ${rows}
      </div>
      <div class="replacement-column">
        <h3>New Expert</h3>
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
      const survivor = normalizeSurvivor(recruit, index);
      state.survivors[index] = survivor;
      if (survivor.specialty === "cook") assignedCookFoodPrep(survivor);
      finishVisitor(`${recruit.name} joins camp. ${removed.name} leaves with supplies.`);
    });
  });
  document.querySelector("#keepCrew").addEventListener("click", () => finishVisitor(`${recruit.name} leaves the Group Cabin and heads back into the snow.`));
}

function openModal(mode = "") {
  modalOpen = true;
  modalPauseActive = true;
  paused = true;
  hud.modalLayer.classList.toggle("main-menu-open", mode === "main-menu");
  hud.modalLayer.classList.remove("hidden");
  updateHud(0);
}

function closeModal(force = false) {
  modalOpen = false;
  if (modalPauseActive) {
    paused = false;
    modalPauseActive = false;
  }
  hud.modalLayer.classList.add("hidden");
  hud.modalLayer.classList.remove("main-menu-open");
  updateHud(0);
}

function forceCloseModal() {
  closeModal(true);
}

function openStructureMenu(structure) {
  if (isBarrierType(structure.type)) {
    setMessage("Use the Repair tool in Build to fix damaged fences and gates.", 4);
    return;
  }
  const canUpgrade = canUpgradeStructure(structure);
  const upgradeStats = canUpgrade ? getUpgradeStats("structure", structure) : null;
  const job = getUpgradeJob("structure", structure.id);
  const cooldown = getCooldown(upgradeCooldownKey("structure", structure.id));
  const tower = isTowerType(structure.type);
  const stats = tower ? towerStats(structure) : null;
  const stationRows = tower ? renderStationButtons(structure) : "";
  const cityCopy = structure.type === "house"
    ? `<p>Residents housed here: ${cityHouseOccupants(structure.id)}/${gameConfig.city.houseCapacity || 5}. Total city housing ${state.cityResidents.length}/${cityResidentCapacity()}.</p>`
    : structure.type === "welcomeCenter"
      ? `<p>Visitors enter through this building. Visitors become Residents when they like the city and housing is available.</p>`
      : structure.type === "foodPrep"
        ? `<p>Meals ready to serve ${structure.meals || 0}. Chefs can be assigned here automatically.</p>${foodPrepRecipeMarkup(structure)}`
        : structure.type === "storageShed"
          ? `<p>Shared wood inventory: ${state.stored.wood}. Wood dropped at any Storage Shed becomes available to every generator load action.</p>`
          : structure.type === "rootCellar"
            ? `<p>All Root Cellars share raw recipe ingredients.</p>${rawFoodInventoryMarkup()}`
            : structure.type === "medicalTent"
              ? `<p>Hurt NPCs recover here. Doctors wait here at night and make field rounds by day.</p>`
              : structure.type === "blacksmith"
                ? blacksmithTechMarkup()
      : isDecorationType(structure.type)
        ? `<p>Decoration and attraction piece. Future city appeal metrics can use this placement.</p>`
        : "";
  const utility = structure.type === "foodPrep" || structure.type === "storageShed" || structure.type === "rootCellar" || structure.type === "medicalTent" || structure.type === "blacksmith";
  hud.modalEyebrow.textContent = tower ? "Tower" : isCityBuildingType(structure.type) ? "City Building" : utility ? "Camp Building" : isDecorationType(structure.type) ? "City Decor" : "Structure";
  hud.modalTitle.textContent = `${structureDisplayName(structure.type)} Lv ${structure.level}`;
  hud.modalBody.innerHTML = `
    <p>Health ${Math.round(structure.health)}/${structure.maxHealth}.</p>
    ${cityCopy}
    ${tower ? `<p>Range ${stats.range}. ${stats.netSeconds ? `Nets animals for ${stats.netSeconds.toFixed(1)}s.` : `Damage ${Math.round(stats.damage)}.`} ${stats.slow < 1 ? "Slows enemies in range." : stats.netSeconds ? "Stops animals in place." : "Automatic arrows."}</p>` : ""}
    ${job ? `<p class="small-note">Upgrade in progress: ${Math.ceil(job.remaining)}s remaining.</p>` : ""}
    ${cooldown ? `<p class="small-note">Upgrade retry cooldown: ${Math.ceil(cooldown)}s.</p>` : ""}
    ${tower ? stationRows : ""}
    <div class="modal-actions">
      ${canUpgrade ? `<button id="upgradeStructure" class="primary" type="button">${job ? "Upgrade Running" : `Upgrade Mission for ${upgradeStats.cost} wood`}</button>` : '<span class="small-note">This object upgrades with the Group Cabin.</span>'}
      ${isBarrierType(structure.type) && structure.health < structure.maxHealth ? `<button id="repairStructure" type="button">Repair for ${structureRepairCost(structure)} wood</button>` : ""}
      <button id="structureBack" type="button">Close</button>
    </div>
  `;
  openModal();
  document.querySelector("#upgradeStructure")?.addEventListener("click", () => openUpgradePreview({ kind: "structure", target: structure }));
  const repairButton = document.querySelector("#repairStructure");
  if (repairButton) repairButton.addEventListener("click", () => repairStructure(structure));
  document.querySelectorAll("[data-station]").forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.station;
      stationExpertAtStructure(structure, value);
      saveState();
      openStructureMenu(structure);
    });
  });
  document.querySelectorAll("[data-blacksmith-tech]").forEach((button) => {
    button.addEventListener("click", () => buyBlacksmithTech(button.dataset.blacksmithTech, structure));
  });
  bindFoodPrepRecipeButtons(() => openStructureMenu(structure));
  document.querySelector("#structureBack").addEventListener("click", () => closeModal(true));
}

function blacksmithTechMarkup() {
  const weapon = currentWeaponTech();
  const fireRate = playerWeaponFireRateScale();
  return `
    <section class="recipe-menu">
      <h3>Workshop Tech</h3>
      <p>Learning points become field gear here. Current weapon: ${weapon.name}. Current basket capacity bonus: +${blacksmithTechLevel("basket") * (gameConfig.blacksmith.basketCapacityBonus || 5)}.</p>
      <p class="small-note">Weapon tech changes both attack damage and fire rate. Current fire rate x${fireRate.toFixed(2)}.</p>
      <div class="option-list">
        ${blacksmithTechOptions().map((tech) => {
          const atMax = tech.id === "weapon" && tech.level >= blacksmithWeaponCatalog.length - 1;
          return `
            <button data-blacksmith-tech="${tech.id}" type="button" ${atMax ? "disabled" : ""}>
              <strong>${tech.name} Lv ${tech.level}</strong>
              <span>${tech.copy}</span>
              <small>${atMax ? "Max forged" : `Cost: ${blacksmithTechCost(tech.id)} learning points`}</small>
            </button>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function playerWeaponDamageScale() {
  const config = gameConfig.blacksmith || defaultGameConfig.blacksmith;
  return (config.weaponDamageMultiplier || 1.22) ** blacksmithTechLevel("weapon");
}

function playerWeaponFireRateScale() {
  const config = gameConfig.blacksmith || defaultGameConfig.blacksmith;
  return (config.weaponFireRateMultiplier || 1.14) ** blacksmithTechLevel("weapon");
}

function playerWeaponCooldown(baseCooldown) {
  return Math.max(0.16, baseCooldown / playerWeaponFireRateScale());
}

function buyBlacksmithTech(id, structure) {
  const tech = blacksmithTechOptions().find((option) => option.id === id);
  if (!tech) return;
  if (id === "weapon" && tech.level >= blacksmithWeaponCatalog.length - 1) {
    showCenterMessage("That workshop weapon line is complete.", 2.2);
    return;
  }
  const cost = blacksmithTechCost(id);
  if (state.learningPoints < cost) {
    showCenterMessage(`Need ${cost} learning points.`, 2.4);
    setMessage("Complete repair puzzles, recipe challenges, and Recruitment missions to earn learning points.", 5);
    return;
  }
  state.learningPoints -= cost;
  state.blacksmithTech[id] = blacksmithTechLevel(id) + 1;
  gainPlayerLevel(`${id === "weapon" ? currentWeaponTech().name : "Basket Tech"} forged`);
  playSound("upgrade");
  setMessage(id === "weapon"
    ? `${currentWeaponTech().name} forged. Player shots hit harder and fire faster.`
    : `Basket Tech upgraded. Carry capacity is now ${carryCapacity()}.`, 6);
  saveState();
  openStructureMenu(structure);
}

function renderStationButtons(structure) {
  const rows = [
    `<button data-station="none" type="button">No Expert${!structure.stationedResidentId ? " Selected" : ""}</button>`,
    ...state.survivors.map((survivor) => `
      <button data-station="${survivor.id}" type="button">
        <img class="resident-icon" src="${actorIconDataUrl(survivor, 42)}" alt="">
        <span>${survivor.name} - Lv ${residentLevel(survivor)} ${survivor.title}${structure.stationedResidentId === survivor.id ? " Selected" : ""}</span>
        <small>${stationAssignmentLabel(survivor.id, structure)}</small>
      </button>
    `)
  ].join("");
  return `
    <h3>Station Expert</h3>
    <p class="small-note">Stationed Experts boost tower shots. Hunters give the largest damage boost.</p>
    <div class="option-list">${rows}</div>
  `;
}

function repairStructure(structure, reopenMenu = true) {
  const cost = structureRepairCost(structure);
  if (cost <= 0) {
    setMessage(`${structureDisplayName(structure.type)} is already fully repaired.`, 4);
    return false;
  }
  if (state.stored.wood < cost) {
    showCenterMessage(`Not enough wood. Need ${cost}.`);
    setMessage(`Not enough wood to repair that ${structureDisplayName(structure.type).toLowerCase()}.`);
    return false;
  }
  state.stored.wood -= cost;
  structure.health = structure.maxHealth;
  setMessage(`${structureDisplayName(structure.type)} repaired.`);
  saveState();
  if (reopenMenu) openStructureMenu(structure);
  return true;
}

function repairObjectAt(point) {
  const structure = clickedStructure(point);
  if (!structure) {
    setMessage("Tap a damaged fence, gate, tower, house, cabin, storage shed, Kitchen Hall, farm, or decoration to repair it.", 5);
    return;
  }
  if (repairStructure(structure, false)) {
    playSound("upgrade");
    setMessage(`${structureDisplayName(structure.type)} repaired. Tap another damaged object or Stop Building to exit.`, 5);
    renderBuildTray();
  }
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
  if (handleCookingMiniGameClick(point)) return;
  if (handleWoodChopBubbleClick(point)) return;
  if (moveMode) {
    handleMoveClick(point);
    return;
  }
  if (removeMode) {
    removeObjectAt(point);
    return;
  }
  if (repairMode) {
    repairObjectAt(point);
    return;
  }
  if (buildMode) {
    confirmBuildAt(point);
    return;
  }
  const machineSite = machineSiteNear(point);
  if (machineSite) {
    beginVariableFlowRepair(machineSite);
    return;
  }
  const recipeSite = recipeSiteNear(point);
  if (recipeSite) {
    beginRecipeChallenge(recipeSite);
    return;
  }
  const structure = clickedStructure(point);
  if (structure) {
    if (isBarrierType(structure.type)) {
      setMessage("Use the Repair tool in Build to fix damaged fences and gates.", 4);
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
  if (pointInLake(point, 18)) {
    showCenterMessage("Water blocks the route.");
    setMessage("The player cannot walk onto water.", 4);
    return;
  }
  state.player.target = point;
}

function canStartTouchMove(point) {
  if (paused || modalOpen || buildMode || moveMode || removeMode || repairMode) return false;
  if (cookingMiniGameAt(point)) return false;
  if (woodChopBubbleAt(point)) return false;
  return !clickedBuilding(point) && !clickedStructure(point);
}

function startCookingTrace(event, point) {
  if (!cookingMiniGame || paused || modalOpen || buildMode || moveMode || removeMode || repairMode) return false;
  const index = cookingLetterIndexAt(point);
  if (index < 0) return false;
  selectCookingLetter(index);
  cookingTracePointer = {
    pointerId: event.pointerId,
    startCount: cookingMiniGame.selected.length,
    lastIndex: index,
    dragging: false
  };
  canvas.setPointerCapture?.(event.pointerId);
  event.preventDefault();
  return true;
}

function updateCookingTrace(event) {
  if (!cookingTracePointer || cookingTracePointer.pointerId !== event.pointerId || !cookingMiniGame) return false;
  const index = cookingLetterIndexAt(screenToWorld(event));
  if (index >= 0 && index !== cookingTracePointer.lastIndex) {
    cookingTracePointer.lastIndex = index;
    if (selectCookingLetter(index)) cookingTracePointer.dragging = cookingMiniGame.selected.length > cookingTracePointer.startCount;
  }
  event.preventDefault();
  return true;
}

function finishCookingTrace(event) {
  if (!cookingTracePointer || cookingTracePointer.pointerId !== event.pointerId) return false;
  const trace = cookingTracePointer;
  cookingTracePointer = null;
  if (trace.dragging) submitCookingWord();
  suppressNextCanvasClick = true;
  event.preventDefault();
  return true;
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
  const point = screenToWorld(event);
  if (startCookingTrace(event, point)) return;
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
  cursorScreen = { x: event.clientX, y: event.clientY, active: true };
  if (buildMode) buildPreview = snapToGrid(screenToWorld(event));
  if (moveMode && selectedMoveTarget) movePreview = snapToGrid(screenToWorld(event));
  if (updateCookingTrace(event)) return;
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
  if (finishCookingTrace(event)) return;
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
  repairMode = false;
  buildMode = true;
  confirmBuildAt(screenToWorld(event));
});
canvas.addEventListener("pointermove", handleCanvasPointerMove);
canvas.addEventListener("pointerleave", () => {
  cursorScreen.active = false;
});
canvas.addEventListener("pointerup", (event) => handleCanvasPointerEnd(event, true));
canvas.addEventListener("pointercancel", (event) => handleCanvasPointerEnd(event, false));
canvas.addEventListener("lostpointercapture", (event) => handleCanvasPointerEnd(event, false));
hud.closeModal?.addEventListener("click", () => closeModal());
hud.actionsToggle?.addEventListener("click", () => runHudAction(openMainMenu));
hud.playerIconButton?.addEventListener("click", () => runHudAction(openPlayerHubMenu));
hud.furnaceMeterCard?.addEventListener("click", () => runHudAction(() => openBuildingMenu(buildings.furnace)));
hud.cabinHungerCard?.addEventListener("click", () => runHudAction(() => openBuildingMenu(buildings.foodPrep)));
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
  if (buildTrayCollapsed && (buildMode || moveMode || removeMode || repairMode)) {
    stopBuildMode("Build tools disabled.");
  }
  renderBuildTray();
  updateHud(0);
});
hud.buildScrollLeft?.addEventListener("click", () => scrollBuildTray(-1));
hud.buildScrollRight?.addEventListener("click", () => scrollBuildTray(1));

function spawnStarterResources() {
  const rng = createSeededRandom(`${currentWorldSeed()}:starter`);
  for (let i = 0; i < 5; i += 1) {
    spawnResource("wood", fort.x - 180 + rng() * 180, fort.entrance.y - 110 + rng() * 220, 1);
  }
}

function applyWorldSeed(seed) {
  const cleanSeed = String(seed || Math.floor(Math.random() * 1000000000)).trim() || "frontier";
  state.worldSeed = cleanSeed;
  state.seedChosen = true;
  resources = [];
  generateWorldLayout();
  spawnStarterResources();
  saveState();
  closeModal(true);
  setMessage(`World seed ${cleanSeed} loaded. The same seed will recreate this wilderness layout.`, 7);
  window.setTimeout(maybeShowBasicsTutorial, 90);
}

function openSeedMenu() {
  hud.modalEyebrow.textContent = "World Seed";
  hud.modalTitle.textContent = "Choose Your Frontier";
  const seedValue = state.worldSeed || String(Math.floor(Math.random() * 1000000000));
  hud.modalBody.innerHTML = `
    <p>Enter a seed number to replay a specific wilderness layout, or randomize for a new Alaska map.</p>
    <label class="seed-input">
      <span>Seed</span>
      <input id="worldSeedInput" type="number" inputmode="numeric" value="${seedValue}">
    </label>
    <div class="modal-actions">
      <button id="startSeedWorld" class="primary" type="button">Start World</button>
      <button id="randomSeedWorld" type="button">Random Seed</button>
    </div>
  `;
  openModal();
  document.querySelector("#startSeedWorld").addEventListener("click", () => applyWorldSeed(document.querySelector("#worldSeedInput").value));
  document.querySelector("#randomSeedWorld").addEventListener("click", () => applyWorldSeed(String(Math.floor(Math.random() * 1000000000))));
}

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
  generateWorldLayout();
  spawnStarterResources();
  setMessage("Start by gathering wood from trees and food from berry bushes. Wood fuels the generator; food becomes meals.", 8);
  if (!state.seedChosen) window.setTimeout(openSeedMenu, 80);
  else window.setTimeout(maybeShowBasicsTutorial, 80);
  window.requestAnimationFrame(frame);
}

init();
