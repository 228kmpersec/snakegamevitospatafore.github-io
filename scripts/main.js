// SNAKE GAME LOGIC + MATRIX BACKGROUND

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score-val");

const GRID_SIZE = 20;
let tileCountX = 20;
let tileCountY = 20;

let velocityX = 0;
let velocityY = 0;
let snake = [];
let food = { x: 5, y: 5, isPoisoned: false };
let score = 0;
let gameInterval;
let isGameRunning = false;
let isPoisoned = false;
let poisonTimer = null;

// Скорость (по умолчанию нормальная, меняется меню)
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
  
  // Ждём загрузки обеих картинок
  let loadedCount = 0;
  
  appleImg.onload = () => {
    loadedCount++;
    if (loadedCount === 2) imagesLoaded = true;
  };
  
  poisonAppleImg.onload = () => {
    loadedCount++;
    if (loadedCount === 2) imagesLoaded = true;
  };
  
  appleImg.onerror = () => {
    console.warn("Не удалось загрузить images/apple.png");
  };
  
  poisonAppleImg.onerror = () => {
    console.warn("Не удалось загрузить images/poisoned_apple.png");
  };
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
  score = 0;
  scoreEl.innerText = score;
  velocityX = 0;
  velocityY = 0;
  isPoisoned = false;
  
  if (poisonTimer) {
    clearTimeout(poisonTimer);
    poisonTimer = null;
  }

  spawnFood();
  isGameRunning = true;
  gameInterval = setInterval(update, window.gameSpeed);
  createMatrixRain();
};

window.stopSnakeGame = function () {
  isGameRunning = false;
  clearInterval(gameInterval);
  document.removeEventListener("keydown", keyDownEvent);
  
  if (poisonTimer) {
    clearTimeout(poisonTimer);
    poisonTimer = null;
  }
};

// ================== ОБНОВЛЕНИЕ ИГРЫ ==================
function update() {
  if (!isGameRunning) return;

  if (isPoisoned) return;

  const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };

  // Столкновение со стеной
  if (
    head.x < 0 ||
    head.x >= tileCountX ||
    head.y < 0 ||
    head.y >= tileCountY
  ) {
    gameOver(false);
    return;
  }

  // Столкновение с собой
  for (let i = 0; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      if (velocityX !== 0 || velocityY !== 0) {
        gameOver(false);
        return;
      }
    }
  }

  snake.unshift(head);

  // Еда
  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.innerText = score;
    
    if (food.isPoisoned) {
      // Отравленное яблоко - играем звук еды (тот же)
      if (foodSound) foodSound.play();
      isPoisoned = true;
      
      poisonTimer = setTimeout(() => {
        gameOver(true);
      }, 2000);
      
      canvas.style.animation = "poisonShake 0.2s infinite";
      
    } else {
      // Обычное яблоко
      if (foodSound) foodSound.play();
    }
    
    spawnFood();
  } else {
    snake.pop();
  }

  draw();
}

// ================== ОТРИСОВКА ==================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Змейка (красная если отравлена)
  ctx.fillStyle = isPoisoned ? "#ff0000" : "#00ff41";
  for (let i = 0; i < snake.length; i++) {
    ctx.fillRect(
      snake[i].x * GRID_SIZE + 1,
      snake[i].y * GRID_SIZE + 1,
      GRID_SIZE - 2,
      GRID_SIZE - 2
    );
  }

  // Еда (картинка яблока)
  if (imagesLoaded) {
    const img = food.isPoisoned ? poisonAppleImg : appleImg;
    ctx.drawImage(
      img,
      food.x * GRID_SIZE,
      food.y * GRID_SIZE,
      GRID_SIZE,
      GRID_SIZE
    );
  } else {
    // Запасной вариант если картинки не загрузились
    if (food.isPoisoned) {
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(
        food.x * GRID_SIZE + 1,
        food.y * GRID_SIZE + 1,
        GRID_SIZE - 2,
        GRID_SIZE - 2
      );
      
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
      ctx.fillRect(
        food.x * GRID_SIZE + 1,
        food.y * GRID_SIZE + 1,
        GRID_SIZE - 2,
        GRID_SIZE - 2
      );
    }
  }
}

// ================== СПАВН ЕДЫ ==================
function spawnFood() {
  let valid = false;
  while (!valid) {
    const newX = Math.floor(Math.random() * tileCountX);
    const newY = Math.floor(Math.random() * tileCountY);
    let overlap = false;
    for (let part of snake) {
      if (part.x === newX && part.y === newY) {
        overlap = true;
        break;
      }
    }
    if (!overlap) {
      // Шанс 1% на отравленное яблоко
      const isPoisonedApple = Math.random() < 1.0;
      
      food = { 
        x: newX, 
        y: newY, 
        isPoisoned: isPoisonedApple 
      };
      valid = true;
    }
  }
}

// ================== УПРАВЛЕНИЕ ==================
function keyDownEvent(e) {
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
  
  // Звук game over
  if (gameoverSound) gameoverSound.play();
  
  const gameOverModal = document.getElementById("game-over-modal");
  const finalScoreEl = document.getElementById("final-score");
  const gameOverTitle = document.querySelector(".game-over-title");
  
  if (gameOverModal && finalScoreEl) {
    finalScoreEl.textContent = score;
    
    if (fromPoison && gameOverTitle) {
      gameOverTitle.textContent = "POISONED!";
      gameOverTitle.style.color = "#ff0000";
    } else if (gameOverTitle) {
      gameOverTitle.textContent = "GAME OVER";
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
