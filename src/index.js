import Square from "./square.js";
import Circle from "./circle.js";
import Triangle from "./triangle.js";

const canvas = document.getElementById("game");
const fpsCounter = document.getElementById("fps");
const stopButton = document.getElementById("stopBtn");
const applyButton = document.getElementById("applyBtn");

const amountRangeInput = document.getElementById("amountRange");
const amountValueLabel = document.getElementById("amountValue");
const sizeRangeInput = document.getElementById("sizeRange");
const sizeValueLabel = document.getElementById("sizeValue");

const speedMinRangeInput = document.getElementById("speedMinRange");
const speedMinValueLabel = document.getElementById("speedMinValue");
const speedMaxRangeInput = document.getElementById("speedMaxRange");
const speedMaxValueLabel = document.getElementById("speedMaxValue");
const angularMinRangeInput = document.getElementById("angularMinRange");
const angularMinValueLabel = document.getElementById("angularMinValue");
const angularMaxRangeInput = document.getElementById("angularMaxRange");
const angularMaxValueLabel = document.getElementById("angularMaxValue");

const gameState = {};

function getSpeedRange() {
  return {
    min: parseFloat(speedMinRangeInput.value),
    max: parseFloat(speedMaxRangeInput.value),
  };
}

function getAngularSpeedRange() {
  return {
    min: parseFloat(angularMinRangeInput.value),
    max: parseFloat(angularMaxRangeInput.value),
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
    stopButton.textContent = "Stop";
  }
}

stopButton.addEventListener("click", () => {
  if (gameState.stopCycle) {
    stopGame(gameState.stopCycle);
    gameState.stopCycle = null;
    stopButton.textContent = "Start";
  } else {
    gameState.lastTick = performance.now();
    gameState.lastRender = gameState.lastTick;
    run();
    stopButton.textContent = "Stop";
  }
});

applyButton.addEventListener("click", async () => {
  resumeGame();
  const numToSpawn = amountRangeInput.value;
  await spawn(numToSpawn);
});

amountRangeInput.addEventListener("input", () => {
  amountValueLabel.textContent = amountRangeInput.value;
});

sizeRangeInput.addEventListener("input", () => {
  sizeValueLabel.textContent = sizeRangeInput.value;
});

speedMinRangeInput.addEventListener("input", () => {
  speedMinValueLabel.textContent = speedMinRangeInput.value;
});

speedMaxRangeInput.addEventListener("input", () => {
  speedMaxValueLabel.textContent = speedMaxRangeInput.value;
});

angularMinRangeInput.addEventListener("input", () => {
  angularMinValueLabel.textContent = angularMinRangeInput.value;
});

angularMaxRangeInput.addEventListener("input", () => {
  angularMaxValueLabel.textContent = angularMaxRangeInput.value;
});

async function spawn(numToSpawn) {
  gameState.figures = [];

  const batchSize = 30;
  const currentSpeedRange = getSpeedRange();
  const currentAngularSpeedRange = getAngularSpeedRange();

  for (let i = 0; i < numToSpawn; i += batchSize) {
    const batch = [];
    for (let j = 0; j < batchSize && i + j < numToSpawn; j++) {
      const x = Math.random() * (canvas.width - 100) + 50;
      const y = Math.random() * (canvas.height - 100) + 50;

      const types = [Circle, Square, Triangle];
      const Type = types[Math.floor(Math.random() * types.length)];

      const figure = new Type(x, y, sizeRangeInput.value, {
        width: canvas.width,
        height: canvas.height,
      });

      figure.setSpeed(
        randomSign() * randomInRange(currentSpeedRange),
        randomSign() * randomInRange(currentSpeedRange),
      );

      if (figure.type === "square" || figure.type === "triangle") {
        figure.setAngularSpeed(
          ((randomSign() * Math.PI) / 180) *
            randomInRange(currentAngularSpeedRange),
        );
      }

      batch.push(figure);
    }

    gameState.figures.push(...batch);

    if (i + batchSize < numToSpawn) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
  }
}

function queueUpdates(numTicks) {
  for (let i = 0; i < numTicks; i++) {
    gameState.lastTick = gameState.lastTick + gameState.tickLength;
    update(gameState.lastTick);
  }
}

function draw(tFrame) {
  const context = canvas.getContext("2d");

  context.clearRect(0, 0, canvas.width, canvas.height);

  gameState.figures.forEach((figure) => {
    figure.draw(context);
  });
}
function update(tick) {
  const dt = gameState.tickLength;
  const gridSize = gameState.gridSize;
  const buckets = new Map();

  const cachedBounds = gameState.figures.map((figure) => figure.getBounds());

  gameState.figures.forEach((figure, index) => {
    const bounds = cachedBounds[index];
    const bucketX = Math.floor(bounds.left / gridSize);
    const bucketY = Math.floor(bounds.top / gridSize);
    const key = `${bucketX},${bucketY}`;

    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push({ figure, index });
  });

  const activeFigures = gameState.figures.filter(
    (f, i) => f.collisionCooldown === 0,
  );

  activeFigures.forEach((figure1, idx1) => {
    const i1 = gameState.figures.indexOf(figure1);
    const bounds1 = cachedBounds[i1];
    const bucketX1 = Math.floor(bounds1.left / gridSize);
    const bucketY1 = Math.floor(bounds1.top / gridSize);

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${bucketX1 + dx},${bucketY1 + dy}`;
        const bucket = buckets.get(key);
        if (!bucket) continue;

        for (let { figure: figure2, index: i2 } of bucket) {
          if (figure1 === figure2) continue;

          if (figure2.collisionCooldown > 0) continue;

          const bounds2 = cachedBounds[i2];
          if (
            bounds1.right < bounds2.left ||
            bounds1.left > bounds2.right ||
            bounds1.bottom < bounds2.top ||
            bounds1.top > bounds2.bottom
          ) {
            continue;
          }

          if (figure1.collidesWith(figure2)) {
            figure1.resolveCollision(figure2);
            return;
          }
        }
      }
    }
  });

  gameState.figures.forEach((figure) => figure.update(dt));
}

function run(tFrame) {
  gameState.stopCycle = window.requestAnimationFrame(run);

  const nextTick = gameState.lastTick + gameState.tickLength;
  let numTicks = 0;

  if (tFrame > nextTick) {
    const timeSinceTick = tFrame - gameState.lastTick;
    numTicks = Math.floor(timeSinceTick / gameState.tickLength);
  }
  queueUpdates(numTicks);
  draw(tFrame);
  gameState.lastRender = tFrame;

  const now = performance.now();
  gameState.frameTimes.push(now);

  while (
    gameState.frameTimes.length > 0 &&
    gameState.frameTimes[0] <= now - 1000
  ) {
    gameState.frameTimes.shift();
  }

  gameState.fpsUpdateInterval++;
  if (gameState.fpsUpdateInterval >= 10) {
    const fps = Math.round(gameState.frameTimes.length);
    fpsCounter.textContent = `FPS: ${fps}`;
    gameState.fpsUpdateInterval = 0;
  }
}

function stopGame(handle) {
  window.cancelAnimationFrame(handle);
}

function setup() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gameState.lastTick = performance.now();
  gameState.lastRender = gameState.lastTick;
  gameState.tickLength = 16;
  gameState.frameTimes = [];
  gameState.fpsUpdateInterval = 0;

  amountValueLabel.textContent = amountRangeInput.value;
  sizeValueLabel.textContent = sizeRangeInput.value;
  speedMinValueLabel.textContent = speedMinRangeInput.value;
  speedMaxValueLabel.textContent = speedMaxRangeInput.value;
  angularMinValueLabel.textContent = angularMinRangeInput.value;
  angularMaxValueLabel.textContent = angularMaxRangeInput.value;

  gameState.gridSize = parseFloat(sizeRangeInput.value) * 2;

  spawn(amountRangeInput.value);
}

setup();
run();
