// SNAKE GAME LOGIC + MATRIX BACKGROUND

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score-val");

const GRID_SIZE = 25;
let tileCountX = 20;
let tileCountY = 20;

let velocityX = 0;
let velocityY = 0;
let snake = [];
let snakeSet = new Set(); // Оптимизация для быстрой проверки коллизий
let food = { x: 5, y: 5, isPoisoned: false };
let score = 0;
let isGameRunning = false;
let isPoisoned = false;
let poisonTimer = null;
let isDead = false;

// Для плавного движения
let lastMoveTime = 0;
let moveDelay = 40;
let interpolationProgress = 0;

// Сохраняем предыдущие позиции для интерполяции
let previousSnake = [];

let animationFrame = 0;

// Язык
let tongueOut = false;
let tongueTimer = null;

// Скорость
window.gameSpeed = 40;
window.gameMode = "default";

// Звуки
let foodSound = null;
let gameoverSound = null;

// Картинки яблок
let appleImg = null;
let poisonAppleImg = null;
let imagesLoaded = false;

// Загрузка звуков
function loadSounds() {
  try {
    foodSound = new Audio("sounds/food.mp3");
    gameoverSound = new Audio("sounds/gameover.mp3");
  } catch (e) {
    console.warn("Звуки не загружены:", e);
  }
}

// Загрузка картинок
function loadImages() {
  appleImg = new Image();
  appleImg.src = "images/apple.png";
  
  poisonAppleImg = new Image();
  poisonAppleImg.src = "images/poisoned_apple.png";
  
  let loadedCount = 0;
  
  appleImg.onload = () => {
    loadedCount++;
    if (loadedCount === 2) imagesLoaded = true;
  };
  
  poisonAppleImg.onload = () => {
    loadedCount++;
    if (loadedCount === 2) imagesLoaded = true;
  };
  
  appleImg.onerror = () => console.warn("Не удалось загрузить images/apple.png");
  poisonAppleImg.onerror = () => console.warn("Не удалось загрузить images/poisoned_apple.png");
}

// Хелпер для создания ключа позиции
function posKey(x, y) {
  return `${x},${y}`;
}

// ================== LERP ФУНКЦИЯ ==================
function lerp(start, end, t) {
  return start + (end - start) * t;
}

// ================== РАЗМЕР КАНВАСА ==================
function resizeCanvas() {
  const mode = window.gameMode || "default";
  
  let widthPercent, heightPercent;
  
  if (mode === "easy") {
    widthPercent = 0.5;
    heightPercent = 0.5;
  } else if (mode === "default") {
    widthPercent = 0.7;
    heightPercent = 0.7;
  } else if (mode === "hard") {
    widthPercent = 0.9;
    heightPercent = 0.8;
  }

  const maxWidth = window.innerWidth * widthPercent;
  const maxHeight = window.innerHeight * heightPercent;

  const cols = Math.floor(maxWidth / GRID_SIZE);
  const rows = Math.floor(maxHeight / GRID_SIZE);

  canvas.width = cols * GRID_SIZE;
  canvas.height = rows * GRID_SIZE;

  tileCountX = cols;
  tileCountY = rows;
}

// ================== ИНИЦИАЛИЗАЦИЯ ИГРЫ ==================
window.initSnakeGame = function () {
  if (isGameRunning) return;

  loadSounds();
  loadImages();
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  document.addEventListener("keydown", keyDownEvent);

  snake = [{ x: 10, y: 10 }];
  previousSnake = [{ x: 10, y: 10 }];
  snakeSet = new Set([posKey(10, 10)]);
  
  score = 0;
  scoreEl.innerText = score;
  velocityX = 0;
  velocityY = 0;
  isPoisoned = false;
  isDead = false;
  animationFrame = 0;
  lastMoveTime = performance.now();
  interpolationProgress = 0;
  tongueOut = false;
  
  moveDelay = window.gameSpeed;
  
  if (poisonTimer) {
    clearTimeout(poisonTimer);
    poisonTimer = null;
  }
  
  if (tongueTimer) {
    clearTimeout(tongueTimer);
    tongueTimer = null;
  }

  spawnFood();
  isGameRunning = true;
  
  requestAnimationFrame(gameLoop);
  createMatrixRain();
};

window.stopSnakeGame = function () {
  isGameRunning = false;
  document.removeEventListener("keydown", keyDownEvent);
  
  if (poisonTimer) {
    clearTimeout(poisonTimer);
    poisonTimer = null;
  }
  
  if (tongueTimer) {
    clearTimeout(tongueTimer);
    tongueTimer = null;
  }
};

// ================== ИГРОВОЙ ЦИКЛ ==================
function gameLoop(currentTime) {
  if (!isGameRunning) return;
  
  animationFrame++;
  
  const deltaTime = currentTime - lastMoveTime;
  
  // Обновляем прогресс интерполяции
  interpolationProgress = Math.min(deltaTime / moveDelay, 1);
  
  if (deltaTime >= moveDelay) {
    lastMoveTime = currentTime;
    interpolationProgress = 0;
    updateGame();
  }
  
  draw();
  requestAnimationFrame(gameLoop);
}

// ================== ОБНОВЛЕНИЕ ЛОГИКИ ИГРЫ ==================
function updateGame() {
  if (isDead || isPoisoned || velocityX === 0 && velocityY === 0) return;

  // Сохраняем текущие позиции как "предыдущие" для интерполяции
  previousSnake = snake.map(segment => ({ ...segment }));

  const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };
  const headKey = posKey(head.x, head.y);

  // Столкновение со стеной
  if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) {
    startDeathAnimation(false);
    return;
  }

  // ОПТИМИЗАЦИЯ: Проверка коллизии с собой через Set - O(1) вместо O(n)
  if (snakeSet.has(headKey)) {
    startDeathAnimation(false);
    return;
  }

  snake.unshift(head);
  snakeSet.add(headKey);

  // Еда
  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.innerText = score;
    
    if (score % 8 === 0) {
      showTongue();
    }
    
    if (food.isPoisoned) {
      if (foodSound) foodSound.play();
      isPoisoned = true;
      
      poisonTimer = setTimeout(() => {
        startDeathAnimation(true);
      }, 2000);
      
      canvas.style.animation = "poisonShake 0.2s infinite";
    } else {
      if (foodSound) foodSound.play();
    }
    
    spawnFood();
    
    // При росте змеи добавляем предыдущую позицию хвоста
    previousSnake.push({ ...previousSnake[previousSnake.length - 1] });
  } else {
    const tail = snake.pop();
    snakeSet.delete(posKey(tail.x, tail.y));
  }
}

// ================== ПОКАЗАТЬ ЯЗЫК ==================
function showTongue() {
  tongueOut = true;
  
  if (tongueTimer) clearTimeout(tongueTimer);
  tongueTimer = setTimeout(() => {
    tongueOut = false;
  }, 1000);
}

// ================== ЗАПУСК АНИМАЦИИ СМЕРТИ ==================
function startDeathAnimation(fromPoison) {
  isDead = true;
  
  setTimeout(() => {
    gameOver(fromPoison);
  }, 1500);
}

// ================== ОТРИСОВКА СЕГМЕНТА ЗМЕИ ==================
function drawSnakePart(x, y, isHead) {
  const centerX = x * GRID_SIZE + GRID_SIZE / 2;
  const centerY = y * GRID_SIZE + GRID_SIZE / 2;
  
  const size = GRID_SIZE - 4;
  
  let color;
  
  if (isDead) {
    color = "#666666";
  } else if (isPoisoned) {
    color = "#ff3333";
  } else {
    color = "#00ff41";
  }
  
  ctx.save();
  ctx.translate(centerX, centerY);
  
  ctx.fillStyle = color;
  const radius = size * 0.3;
  ctx.beginPath();
  ctx.roundRect(-size / 2, -size / 2, size, size, radius);
  ctx.fill();
  
  ctx.strokeStyle = isDead ? "#333333" : "#000000";
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Глаза и язык на голове
  if (isHead && !isDead) {
    ctx.fillStyle = "#000000";
    const eyeSize = 4;
    const eyeOffset = size * 0.25;
    
    if (velocityX > 0) {
      ctx.fillRect(size / 2 - 6, -eyeOffset, eyeSize, eyeSize);
      ctx.fillRect(size / 2 - 6, eyeOffset - eyeSize, eyeSize, eyeSize);
      
      if (tongueOut) {
        ctx.strokeStyle = "#ff0066";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(size / 2, 0);
        ctx.lineTo(size / 2 + 8, -3);
        ctx.moveTo(size / 2, 0);
        ctx.lineTo(size / 2 + 8, 3);
        ctx.stroke();
      }
    } else if (velocityX < 0) {
      ctx.fillRect(-size / 2 + 2, -eyeOffset, eyeSize, eyeSize);
      ctx.fillRect(-size / 2 + 2, eyeOffset - eyeSize, eyeSize, eyeSize);
      
      if (tongueOut) {
        ctx.strokeStyle = "#ff0066";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-size / 2, 0);
        ctx.lineTo(-size / 2 - 8, -3);
        ctx.moveTo(-size / 2, 0);
        ctx.lineTo(-size / 2 - 8, 3);
        ctx.stroke();
      }
    } else if (velocityY > 0) {
      ctx.fillRect(-eyeOffset, size / 2 - 6, eyeSize, eyeSize);
      ctx.fillRect(eyeOffset - eyeSize, size / 2 - 6, eyeSize, eyeSize);
      
      if (tongueOut) {
        ctx.strokeStyle = "#ff0066";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, size / 2);
        ctx.lineTo(-3, size / 2 + 8);
        ctx.moveTo(0, size / 2);
        ctx.lineTo(3, size / 2 + 8);
        ctx.stroke();
      }
    } else if (velocityY < 0) {
      ctx.fillRect(-eyeOffset, -size / 2 + 2, eyeSize, eyeSize);
      ctx.fillRect(eyeOffset - eyeSize, -size / 2 + 2, eyeSize, eyeSize);
      
      if (tongueOut) {
        ctx.strokeStyle = "#ff0066";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -size / 2);
        ctx.lineTo(-3, -size / 2 - 8);
        ctx.moveTo(0, -size / 2);
        ctx.lineTo(3, -size / 2 - 8);
        ctx.stroke();
      }
    }
  }
  
  ctx.restore();
}

// ================== ОТРИСОВКА ==================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Рисуем змею с интерполяцией
  for (let i = 0; i < snake.length; i++) {
    let drawX = snake[i].x;
    let drawY = snake[i].y;
    
    // Интерполируем позицию между предыдущей и текущей
    if (i < previousSnake.length) {
      drawX = lerp(previousSnake[i].x, snake[i].x, interpolationProgress);
      drawY = lerp(previousSnake[i].y, snake[i].y, interpolationProgress);
    }
    
    drawSnakePart(drawX, drawY, i === 0);
  }

  // Еда
  if (imagesLoaded) {
    const img = food.isPoisoned ? poisonAppleImg : appleImg;
    const appleSize = GRID_SIZE * 1.3;
    const offset = (GRID_SIZE - appleSize) / 2;
    
    ctx.drawImage(
      img,
      food.x * GRID_SIZE + offset,
      food.y * GRID_SIZE + offset,
      appleSize,
      appleSize
    );
  } else {
    if (food.isPoisoned) {
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
      
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(food.x * GRID_SIZE + 4, food.y * GRID_SIZE + 4);
      ctx.lineTo(food.x * GRID_SIZE + GRID_SIZE - 4, food.y * GRID_SIZE + GRID_SIZE - 4);
      ctx.moveTo(food.x * GRID_SIZE + GRID_SIZE - 4, food.y * GRID_SIZE + 4);
      ctx.lineTo(food.x * GRID_SIZE + 4, food.y * GRID_SIZE + GRID_SIZE - 4);
      ctx.stroke();
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    }
  }
}

// ================== СПАВН ЕДЫ ==================
function spawnFood() {
  let valid = false;
  while (!valid) {
    const newX = Math.floor(Math.random() * tileCountX);
    const newY = Math.floor(Math.random() * tileCountY);
    
    // ОПТИМИЗАЦИЯ: Используем Set для проверки
    if (!snakeSet.has(posKey(newX, newY))) {
      const isPoisonedApple = Math.random() < 0.01;
      food = { x: newX, y: newY, isPoisoned: isPoisonedApple };
      valid = true;
    }
  }
}

// ================== УПРАВЛЕНИЕ ==================
function keyDownEvent(e) {
  if (isDead) return;
  
  const key = e.key.toLowerCase();

  switch (key) {
    case "a":
    case "arrowleft":
      if (velocityX === 1) break;
      velocityX = -1;
      velocityY = 0;
      break;
    case "d":
    case "arrowright":
      if (velocityX === -1) break;
      velocityX = 1;
      velocityY = 0;
      break;
    case "w":
    case "arrowup":
      if (velocityY === 1) break;
      velocityX = 0;
      velocityY = -1;
      break;
    case "s":
    case "arrowdown":
      if (velocityY === -1) break;
      velocityX = 0;
      velocityY = 1;
      break;
  }
}

// ================== КОНЕЦ ИГРЫ ==================
function gameOver(fromPoison) {
  window.stopSnakeGame();
  
  canvas.style.animation = "";
  
  if (gameoverSound) gameoverSound.play();
  
  const gameOverModal = document.getElementById("game-over-modal");
  const finalScoreEl = document.getElementById("final-score");
  const gameOverTitle = document.querySelector(".game-over-title");
  
  if (gameOverModal && finalScoreEl) {
    finalScoreEl.textContent = score;
    
    if (fromPoison && gameOverTitle) {
      gameOverTitle.textContent = "POISONED!";
      gameOverTitle.classList.add("poisoned");
      gameOverTitle.style.color = "#ff0000";
    } else if (gameOverTitle) {
      gameOverTitle.textContent = "GAME OVER";
      gameOverTitle.classList.remove("poisoned");
      gameOverTitle.style.color = "#ffffff";
    }
    
    gameOverModal.classList.remove("hidden");
  }
}

// ================== МАТРИЦА НА ЗАДНЕМ ФОНЕ ==================
function createMatrixRain() {
  let matrixCanvas = document.getElementById("matrix-bg");
  
  if (!matrixCanvas) {
    matrixCanvas = document.createElement("canvas");
    matrixCanvas.id = "matrix-bg";
    matrixCanvas.style.position = "fixed";
    matrixCanvas.style.inset = "0";
    matrixCanvas.style.zIndex = "-1";
    document.body.appendChild(matrixCanvas);
  }

  const ctxM = matrixCanvas.getContext("2d");
  matrixCanvas.width = window.innerWidth;
  matrixCanvas.height = window.innerHeight;

  const columns = Math.floor(matrixCanvas.width / 20);
  const drops = Array(columns).fill(1);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()";

  function drawMatrix() {
    ctxM.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctxM.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    ctxM.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctxM.font = "18px monospace";

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctxM.fillText(text, i * 20, drops[i] * 20);
      if (drops[i] * 20 > matrixCanvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(drawMatrix, 50);
}
