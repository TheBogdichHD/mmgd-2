import Square from "./square.js";
import Circle from "./circle.js";
import Triangle from "./triangle.js";
import Quadtree from "./quadtree.js";
import { detectCollision } from "./collision.js";

const canvas = document.getElementById("game");

const hud = {
  fps: document.getElementById("fps"),
  pairChecks: document.getElementById("pairChecks"),
  resolvedCollisions: document.getElementById("resolvedCollisions"),
};

const buttons = {
  toggleUi: document.getElementById("toggleUiBtn"),
  stop: document.getElementById("stopBtn"),
  apply: document.getElementById("applyBtn"),
};

const controls = {
  amount: {
    input: document.getElementById("amountRange"),
    value: document.getElementById("amountValue"),
  },
  size: {
    input: document.getElementById("sizeRange"),
    value: document.getElementById("sizeValue"),
  },
  speedMin: {
    input: document.getElementById("speedMinRange"),
    value: document.getElementById("speedMinValue"),
  },
  speedMax: {
    input: document.getElementById("speedMaxRange"),
    value: document.getElementById("speedMaxValue"),
  },
  angularMin: {
    input: document.getElementById("angularMinRange"),
    value: document.getElementById("angularMinValue"),
  },
  angularMax: {
    input: document.getElementById("angularMaxRange"),
    value: document.getElementById("angularMaxValue"),
  },
  collisionBudget: {
    input: document.getElementById("collisionBudgetRange"),
    value: document.getElementById("collisionBudgetValue"),
  },
};

const gameState = {};

const SHAPE_TYPES = [Circle, Square, Triangle];
const TICK_LENGTH_MS = 16;
const FRAME_HISTORY_MS = 1000;
const FPS_UPDATE_RATE = 10;
const SPAWN_BATCH_SIZE = 30;
const MAX_CATCH_UP_TICKS = 2;

function setUiHidden(hidden) {
  gameState.uiHidden = hidden;
  document.body.classList.toggle("ui-hidden", hidden);
  buttons.toggleUi.textContent = hidden ? "Show UI" : "Hide UI";
}

function getSpeedRange() {
  return {
    min: parseFloat(controls.speedMin.input.value),
    max: parseFloat(controls.speedMax.input.value),
  };
}

function getAngularSpeedRange() {
  return {
    min: parseFloat(controls.angularMin.input.value),
    max: parseFloat(controls.angularMax.input.value),
  };
}

function randomInRange(range) {
  return range.min + Math.random() * (range.max - range.min);
}

function randomSign() {
  return Math.random() < 0.5 ? -1 : 1;
}

function resumeGame() {
  if (!gameState.stopCycle) {
    gameState.lastTick = performance.now();
    gameState.lastRender = gameState.lastTick;
    run();
    buttons.stop.textContent = "Stop";
  }
}

function syncControlValue(control) {
  control.value.textContent = control.input.value;
}

function bindControlValue(control) {
  control.input.addEventListener("input", () => {
    syncControlValue(control);
  });
}

function bindUiEvents() {
  buttons.stop.addEventListener("click", () => {
    if (gameState.stopCycle) {
      stopGame(gameState.stopCycle);
      gameState.stopCycle = null;
      buttons.stop.textContent = "Start";
      return;
    }

    gameState.lastTick = performance.now();
    gameState.lastRender = gameState.lastTick;
    run();
    buttons.stop.textContent = "Stop";
  });

  buttons.toggleUi.addEventListener("click", () => {
    setUiHidden(!gameState.uiHidden);
  });

  buttons.apply.addEventListener("click", async () => {
    resumeGame();
    await spawn(controls.amount.input.value);
  });

  bindControlValue(controls.amount);
  bindControlValue(controls.size);
  bindControlValue(controls.speedMin);
  bindControlValue(controls.speedMax);
  bindControlValue(controls.angularMin);
  bindControlValue(controls.angularMax);
  bindControlValue(controls.collisionBudget);

  controls.collisionBudget.input.addEventListener("input", () => {
    gameState.maxCollisionsPerTick = parseInt(
      controls.collisionBudget.input.value,
      10,
    );
  });
}

async function spawn(numToSpawn) {
  gameState.figures = [];

  const currentSpeedRange = getSpeedRange();
  const currentAngularSpeedRange = getAngularSpeedRange();
  const targetCount = Number(numToSpawn);

  for (let i = 0; i < targetCount; i += SPAWN_BATCH_SIZE) {
    const batch = [];
    for (let j = 0; j < SPAWN_BATCH_SIZE && i + j < targetCount; j++) {
      const x = Math.random() * (canvas.width - 100) + 50;
      const y = Math.random() * (canvas.height - 100) + 50;

      const Type = SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)];

      const figure = new Type(x, y, controls.size.input.value, {
        width: canvas.width,
        height: canvas.height,
      });

      figure.setSpeed(
        randomSign() * randomInRange(currentSpeedRange),
        randomSign() * randomInRange(currentSpeedRange),
      );

      if (figure.type === "square" || figure.type === "triangle") {
        figure.setAngularSpeed(
          ((randomSign() * Math.PI) / 180) * randomInRange(currentAngularSpeedRange),
        );
      }

      batch.push(figure);
    }

    gameState.figures.push(...batch);

    if (i + SPAWN_BATCH_SIZE < targetCount) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
  }
}

function queueUpdates(numTicks) {
  for (let i = 0; i < numTicks; i++) {
    gameState.lastTick += gameState.tickLength;
    update();
  }
}

function draw() {
  const context = gameState.ctx;
  const figures = gameState.figures;

  context.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < figures.length; i++) {
    figures[i].draw(context);
  }
}

function overlaps(a, b) {
  return !(
    a.right < b.left ||
    a.left > b.right ||
    a.bottom < b.top ||
    a.top > b.bottom
  );
}

function update() {
  const dt = gameState.tickLength;

  const figures = gameState.figures;
  const totalFigures = figures.length;
  const cachedBounds = gameState.cachedBounds;
  cachedBounds.length = totalFigures;

  for (let i = 0; i < totalFigures; i++) {
    const figure = figures[i];
    let bounds = cachedBounds[i];
    if (!bounds) {
      bounds = { left: 0, right: 0, top: 0, bottom: 0 };
      cachedBounds[i] = bounds;
    }
    figure.fillBounds(bounds);
  }

  const quadtree = gameState.quadtree;

  gameState.quadtreeItems.length = totalFigures;

  for (let index = 0; index < totalFigures; index++) {
    let item = gameState.quadtreeItems[index];
    if (!item) {
      item = { index: 0, figure: null, bounds: null };
      gameState.quadtreeItems[index] = item;
    }
    item.index = index;
    item.figure = figures[index];
    item.bounds = cachedBounds[index];
  }

  quadtree.rebuild(gameState.quadtreeItems);

  const checkedPairs = gameState.checkedPairs;
  checkedPairs.clear();
  let pairChecks = 0;
  let resolvedCollisions = 0;
  const maxPairChecksPerTick = gameState.maxCollisionsPerTick;
  const startIndex = gameState.collisionCursor % Math.max(totalFigures, 1);
  const queryBuffer = gameState.queryBuffer;
  const pairKeyMultiplier = totalFigures + 1;

  outer: for (let offset = 0; offset < totalFigures; offset++) {
    const i1 = (startIndex + offset) % totalFigures;
    const figure1 = figures[i1];

    const bounds1 = cachedBounds[i1];
    const candidates = quadtree.query(bounds1, queryBuffer);

    for (const candidate of candidates) {
      const i2 = candidate.index;
      if (i2 <= i1) continue;

      const figure2 = candidate.figure;

      const pairKey = i1 * pairKeyMultiplier + i2;
      if (checkedPairs.has(pairKey)) continue;
      checkedPairs.add(pairKey);

      const bounds2 = cachedBounds[i2];
      if (!overlaps(bounds1, bounds2)) {
        continue;
      }

      pairChecks++;
      if (pairChecks >= maxPairChecksPerTick) {
        break outer;
      }

      const dx = figure2.x - figure1.x;
      const dy = figure2.y - figure1.y;
      const radiusSum = figure1.getRadius() + figure2.getRadius();
      if (dx * dx + dy * dy > radiusSum * radiusSum) {
        continue;
      }

      const manifold = detectCollision(figure1, figure2);
      if (manifold) {
        figure1.resolveCollision(figure2, manifold);
        resolvedCollisions++;
      }
    }
  }

  gameState.lastPairChecks = pairChecks;
  gameState.lastResolvedCollisions = resolvedCollisions;

  if (totalFigures > 0) {
    gameState.collisionCursor = (startIndex + 1) % totalFigures;
  }

  for (let i = 0; i < totalFigures; i++) {
    figures[i].update(dt);
  }
}

function run(tFrame) {
  gameState.stopCycle = window.requestAnimationFrame(run);

  const nextTick = gameState.lastTick + gameState.tickLength;
  let numTicks = 0;

  if (tFrame > nextTick) {
    const timeSinceTick = tFrame - gameState.lastTick;
    numTicks = Math.floor(timeSinceTick / gameState.tickLength);
  }

  numTicks = Math.min(numTicks, gameState.maxCatchUpTicks);
  queueUpdates(numTicks);
  draw();
  gameState.lastRender = tFrame;

  const now = performance.now();
  gameState.frameTimes.push(now);

  while (
    gameState.frameTimes.length > 0 &&
    gameState.frameTimes[0] <= now - FRAME_HISTORY_MS
  ) {
    gameState.frameTimes.shift();
  }

  gameState.fpsUpdateInterval++;
  if (gameState.fpsUpdateInterval >= FPS_UPDATE_RATE) {
    const fps = Math.round(gameState.frameTimes.length);
    hud.fps.textContent = `FPS: ${fps}`;
    hud.pairChecks.textContent = `Pair checks/tick: ${gameState.lastPairChecks}`;
    hud.resolvedCollisions.textContent =
      `Collisions resolved/tick: ${gameState.lastResolvedCollisions}`;
    gameState.fpsUpdateInterval = 0;
  }
}

function stopGame(handle) {
  window.cancelAnimationFrame(handle);
}

function setup() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  gameState.ctx = canvas.getContext("2d");
  gameState.lastTick = performance.now();
  gameState.lastRender = gameState.lastTick;
  gameState.tickLength = TICK_LENGTH_MS;
  gameState.frameTimes = [];
  gameState.fpsUpdateInterval = 0;
  gameState.lastPairChecks = 0;
  gameState.lastResolvedCollisions = 0;
  gameState.uiHidden = false;

  syncControlValue(controls.amount);
  syncControlValue(controls.size);
  syncControlValue(controls.speedMin);
  syncControlValue(controls.speedMax);
  syncControlValue(controls.angularMin);
  syncControlValue(controls.angularMax);
  syncControlValue(controls.collisionBudget);

  gameState.quadtreeConfig = {
    maxDepth: 7,
    capacity: 12,
  };
  gameState.quadtree = new Quadtree(
    {
      left: 0,
      top: 0,
      right: canvas.width,
      bottom: canvas.height,
    },
    gameState.quadtreeConfig,
  );
  gameState.quadtreeItems = [];
  gameState.cachedBounds = [];
  gameState.queryBuffer = [];
  gameState.checkedPairs = new Set();
  gameState.maxCatchUpTicks = MAX_CATCH_UP_TICKS;
  gameState.maxCollisionsPerTick = parseInt(
    controls.collisionBudget.input.value,
    10,
  );
  gameState.collisionCursor = 0;

  hud.pairChecks.textContent = "Pair checks/tick: 0";
  hud.resolvedCollisions.textContent = "Collisions resolved/tick: 0";
  setUiHidden(false);

  spawn(controls.amount.input.value);
}

bindUiEvents();
setup();
run();
