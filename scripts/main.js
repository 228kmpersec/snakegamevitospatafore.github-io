// SNAKE GAME LOGIC + MATRIX BACKGROUND + FRUITS

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score-val");

const GRID_SIZE = 25;
let tileCountX = 20;
let tileCountY = 20;

let velocityX = 0;
let velocityY = 0;
let snake = [];
let snakeSet = new Set();
let food = { x: 5, y: 5, type: "apple" };
let score = 0;
let isGameRunning = false;
let isPoisoned = false;
let poisonTimer = null;
let isDead = false;

// Эффекты фруктов
let hasSecondChance = false; // Starberry эффект
let isSpeedBoosted = false;
let speedBoostTimer = null;
let isBlurred = false;
let blurTimer = null;
let blurOpacity = 0;

// Starberry визуальные эффекты
let starberryActive = false;
let starberryTimer = null;
let starberryProgress = 1; // 1 = полный эффект, 0 = нет эффекта
let stars = [];

// Pepper эффекты
let pepperActive = false;
let pepperTimer = null;
let steamParticles = [];

// Для плавного движения
let lastMoveTime = 0;
let moveDelay = 40;
let baseSpeed = 40;
let interpolationProgress = 0;

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

// Картинки фруктов
let appleImg = null;
let poisonAppleImg = null;
let pepperImg = null;
let plumImg = null;
let starberryImg = null;
let imagesLoaded = false;
let loadedImagesCount = 0;

// Типы фруктов с шансами
const FRUIT_TYPES = {
  apple: {
    probability: 0.85,
    score: 1,
    color: "#ffffff"
  },
  poisonApple: {
    probability: 0.01,
    score: 1,
    color: "#ff0000"
  },
  pepper: {
    probability: 0.04,
    score: 1,
    color: "#FF4500",
    speedMultiplier: 5,
    duration: 5000
  },
  plum: {
    probability: 0.08,
    score: 1,
    color: "#8B008B",
    blurDuration: 8000
  },
  starberry: {
    probability: 0.02,
    score: 3,
    color: "#87CEEB",
    duration: 15000
  }
};

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
  const totalImages = 5;
  
  appleImg = new Image();
  appleImg.src = "images/apple.png";
  
  poisonAppleImg = new Image();
  poisonAppleImg.src = "images/poisoned_apple.png";
  
  pepperImg = new Image();
  pepperImg.src = "images/pepper.png";
  
  plumImg = new Image();
  plumImg.src = "images/plum.png";
  
  starberryImg = new Image();
  starberryImg.src = "images/starberry.png";
  
  const onLoad = () => {
    loadedImagesCount++;
    if (loadedImagesCount === totalImages) imagesLoaded = true;
  };
  
  appleImg.onload = onLoad;
  poisonAppleImg.onload = onLoad;
  pepperImg.onload = onLoad;
  plumImg.onload = onLoad;
  starberryImg.onload = onLoad;
  
  appleImg.onerror = () => console.warn("Не удалось загрузить images/apple.png");
  poisonAppleImg.onerror = () => console.warn("Не удалось загрузить images/poisoned_apple.png");
  pepperImg.onerror = () => console.warn("Не удалось загрузить images/pepper.png");
  plumImg.onerror = () => console.warn("Не удалось загрузить images/plum.png");
  starberryImg.onerror = () => console.warn("Не удалось загрузить images/starberry.png");
}

// Хелпер для создания ключа позиции
function posKey(x, y) {
  return `${x},${y}`;
}

// LERP функция
function lerp(start, end, t) {
  return start + (end - start) * t;
}

// Размер канваса
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

// Инициализация игры
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
  
  baseSpeed = window.gameSpeed;
  moveDelay = baseSpeed;
  
  // Сброс всех эффектов
  hasSecondChance = false;
  isSpeedBoosted = false;
  isBlurred = false;
  starberryActive = false;
  pepperActive = false;
  stars = [];
  steamParticles = [];
  blurOpacity = 0;
  starberryProgress = 1;
  
  // Очистка таймеров
  if (poisonTimer) {
    clearTimeout(poisonTimer);
    poisonTimer = null;
  }
  
  if (tongueTimer) {
    clearTimeout(tongueTimer);
    tongueTimer = null;
  }
  
  if (speedBoostTimer) {
    clearTimeout(speedBoostTimer);
    speedBoostTimer = null;
  }
  
  if (blurTimer) {
    clearTimeout(blurTimer);
    blurTimer = null;
  }
  
  if (starberryTimer) {
    clearTimeout(starberryTimer);
    starberryTimer = null;
  }
  
  if (pepperTimer) {
    clearTimeout(pepperTimer);
    pepperTimer = null;
  }

  spawnFood();
  isGameRunning = true;
  
  requestAnimationFrame(gameLoop);
  createMatrixRain();
};

window.stopSnakeGame = function () {
  isGameRunning = false;
  document.removeEventListener("keydown", keyDownEvent);
  
  // Очистка всех таймеров
  if (poisonTimer) clearTimeout(poisonTimer);
  if (tongueTimer) clearTimeout(tongueTimer);
  if (speedBoostTimer) clearTimeout(speedBoostTimer);
  if (blurTimer) clearTimeout(blurTimer);
  if (starberryTimer) clearTimeout(starberryTimer);
  if (pepperTimer) clearTimeout(pepperTimer);
};

// Игровой цикл
function gameLoop(currentTime) {
  if (!isGameRunning) return;
  
  animationFrame++;
  
  const deltaTime = currentTime - lastMoveTime;
  
  interpolationProgress = Math.min(deltaTime / moveDelay, 1);
  
  if (deltaTime >= moveDelay) {
    lastMoveTime = currentTime;
    interpolationProgress = 0;
    updateGame();
  }
  
  // Обновление частиц пара (pepper)
  if (pepperActive) {
    updateSteamParticles();
  }
  
  draw();
  requestAnimationFrame(gameLoop);
}

// Обновление логики игры
function updateGame() {
  if (isDead || isPoisoned || velocityX === 0 && velocityY === 0) return;

  previousSnake = snake.map(segment => ({ ...segment }));

  const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };
  const headKey = posKey(head.x, head.y);

  // Столкновение со стеной
  if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) {
    if (hasSecondChance) {
      // Используем второй шанс!
      hasSecondChance = false;
      showSecondChanceEffect();
      return;
    }
    startDeathAnimation(false);
    return;
  }

  // Столкновение с собой
  if (snakeSet.has(headKey)) {
    if (hasSecondChance) {
      hasSecondChance = false;
      showSecondChanceEffect();
      return;
    }
    startDeathAnimation(false);
    return;
  }

  snake.unshift(head);
  snakeSet.add(headKey);

  // Еда
  if (head.x === food.x && head.y === food.y) {
    const fruitType = food.type;
    const fruitConfig = FRUIT_TYPES[fruitType];
    
    score += fruitConfig.score;
    scoreEl.innerText = score;
    
    if (score % 8 === 0) {
      showTongue();
    }
    
    // Применяем эффекты фруктов
    applyFruitEffect(fruitType);
    
    if (foodSound) foodSound.play();
    
    spawnFood();
    previousSnake.push({ ...previousSnake[previousSnake.length - 1] });
  } else {
    const tail = snake.pop();
    snakeSet.delete(posKey(tail.x, tail.y));
  }
}

// Применение эффектов фруктов
function applyFruitEffect(fruitType) {
  switch (fruitType) {
    case "poisonApple":
      isPoisoned = true;
      poisonTimer = setTimeout(() => {
        startDeathAnimation(true);
      }, 2000);
      canvas.style.animation = "poisonShake 0.2s infinite";
      break;
      
    case "pepper":
      activatePepperEffect();
      break;
      
    case "plum":
      activatePlumEffect();
      break;
      
    case "starberry":
      activateStarberryEffect();
      break;
  }
}

// Pepper эффект
function activatePepperEffect() {
  pepperActive = true;
  isSpeedBoosted = true;
  
  moveDelay = baseSpeed / 5; // В 5 раз быстрее
  steamParticles = [];
  
  if (pepperTimer) clearTimeout(pepperTimer);
  
  pepperTimer = setTimeout(() => {
    pepperActive = false;
    isSpeedBoosted = false;
    moveDelay = baseSpeed;
    steamParticles = [];
  }, 5000);
}

// Обновление частиц пара
function updateSteamParticles() {
  // Добавляем новые частицы
  if (animationFrame % 3 === 0) {
    const head = snake[0];
    const headX = head.x * GRID_SIZE + GRID_SIZE / 2;
    const headY = head.y * GRID_SIZE + GRID_SIZE / 2;
    
    // Левая сторона
    steamParticles.push({
      x: headX - GRID_SIZE / 2,
      y: headY,
      vx: -2 - Math.random() * 2,
      vy: -1 + Math.random() * 2,
      life: 1,
      size: 3 + Math.random() * 4
    });
    
    // Правая сторона
    steamParticles.push({
      x: headX + GRID_SIZE / 2,
      y: headY,
      vx: 2 + Math.random() * 2,
      vy: -1 + Math.random() * 2,
      life: 1,
      size: 3 + Math.random() * 4
    });
  }
  
  // Обновляем существующие частицы
  for (let i = steamParticles.length - 1; i >= 0; i--) {
    const p = steamParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.02;
    p.size *= 1.05;
    
    if (p.life <= 0) {
      steamParticles.splice(i, 1);
    }
  }
}

// Plum эффект
function activatePlumEffect() {
  isBlurred = true;
  blurOpacity = 0.85;
  
  if (blurTimer) clearTimeout(blurTimer);
  
  blurTimer = setTimeout(() => {
    isBlurred = false;
    blurOpacity = 0;
  }, 8000);
}

// Starberry эффект
function activateStarberryEffect() {
  hasSecondChance = true;
  starberryActive = true;
  starberryProgress = 1;
  
  // Создаём звёздочки по краям
  stars = [];
  for (let i = 0; i < 30; i++) {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    
    switch (side) {
      case 0: // top
        x = Math.random() * canvas.width;
        y = -10;
        break;
      case 1: // right
        x = canvas.width + 10;
        y = Math.random() * canvas.height;
        break;
      case 2: // bottom
        x = Math.random() * canvas.width;
        y = canvas.height + 10;
        break;
      case 3: // left
        x = -10;
        y = Math.random() * canvas.height;
        break;
    }
    
    stars.push({
      x: x,
      y: y,
      size: 3 + Math.random() * 5,
      speed: 1 + Math.random() * 2,
      angle: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1
    });
  }
  
  if (starberryTimer) clearTimeout(starberryTimer);
  
  starberryTimer = setTimeout(() => {
    // Начинаем плавное угасание
    const fadeInterval = setInterval(() => {
      starberryProgress -= 0.02;
      if (starberryProgress <= 0) {
        starberryActive = false;
        stars = [];
        clearInterval(fadeInterval);
      }
    }, 50);
  }, 15000);
}

// Эффект второго шанса
function showSecondChanceEffect() {
  // Вспышка экрана
  const flash = document.createElement("div");
  flash.style.position = "fixed";
  flash.style.inset = "0";
  flash.style.background = "rgba(135, 206, 235, 0.5)";
  flash.style.zIndex = "999";
  flash.style.pointerEvents = "none";
  document.body.appendChild(flash);
  
  setTimeout(() => {
    flash.style.transition = "opacity 0.5s";
    flash.style.opacity = "0";
    setTimeout(() => flash.remove(), 500);
  }, 100);
}

// Показать язык
function showTongue() {
  tongueOut = true;
  
  if (tongueTimer) clearTimeout(tongueTimer);
  tongueTimer = setTimeout(() => {
    tongueOut = false;
  }, 1000);
}

// Запуск анимации смерти
function startDeathAnimation(fromPoison) {
  isDead = true;
  
  setTimeout(() => {
    gameOver(fromPoison);
  }, 1500);
}

// Отрисовка сегмента змеи
function drawSnakePart(x, y, isHead) {
  const centerX = x * GRID_SIZE + GRID_SIZE / 2;
  const centerY = y * GRID_SIZE + GRID_SIZE / 2;
  
  const size = GRID_SIZE - 4;
  
  let color;
  
  if (isDead) {
    color = "#666666";
  } else if (isPoisoned) {
    color = "#ff3333";
  } else if (pepperActive) {
    color = "#FF4500";
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

// Рисование звезды
function drawStar(x, y, size, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  
  ctx.fillStyle = `rgba(135, 206, 235, ${starberryProgress * 0.9})`;
  ctx.beginPath();
  
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const x = Math.cos(angle) * size;
    const y = Math.sin(angle) * size;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  
  ctx.closePath();
  ctx.fill();
  
  ctx.strokeStyle = `rgba(255, 255, 255, ${starberryProgress})`;
  ctx.lineWidth = 1;
  ctx.stroke();
  
  ctx.restore();
}

// Отрисовка
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Starberry голубое свечение по краям
  if (starberryActive) {
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      Math.min(canvas.width, canvas.height) / 4,
      canvas.width / 2,
      canvas.height / 2,
      Math.max(canvas.width, canvas.height) / 1.5
    );
    
    gradient.addColorStop(0, "transparent");
    gradient.addColorStop(1, `rgba(135, 206, 235, ${starberryProgress * 0.15})`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Рисуем звёздочки
    for (const star of stars) {
      star.x += Math.cos(star.angle) * star.speed;
      star.y += Math.sin(star.angle) * star.speed;
      star.rotation += star.rotationSpeed;
      
      // Wrap around edges
      if (star.x < -20) star.x = canvas.width + 20;
      if (star.x > canvas.width + 20) star.x = -20;
      if (star.y < -20) star.y = canvas.height + 20;
      if (star.y > canvas.height + 20) star.y = -20;
      
      drawStar(star.x, star.y, star.size, star.rotation);
    }
  }

  // Рисуем змею с интерполяцией
  for (let i = 0; i < snake.length; i++) {
    let drawX = snake[i].x;
    let drawY = snake[i].y;
    
    if (i < previousSnake.length) {
      drawX = lerp(previousSnake[i].x, snake[i].x, interpolationProgress);
      drawY = lerp(previousSnake[i].y, snake[i].y, interpolationProgress);
    }
    
    drawSnakePart(drawX, drawY, i === 0);
  }
  
  // Рисуем пар (pepper эффект)
  if (pepperActive) {
    for (const particle of steamParticles) {
      ctx.save();
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Эффект затемнения (plum)
  if (isBlurred && blurOpacity > 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${blurOpacity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Еда
  let foodImg = null;
  let foodColor = "#ffffff";
  
  switch (food.type) {
    case "apple":
      foodImg = appleImg;
      foodColor = FRUIT_TYPES.apple.color;
      break;
    case "poisonApple":
      foodImg = poisonAppleImg;
      foodColor = FRUIT_TYPES.poisonApple.color;
      break;
    case "pepper":
      foodImg = pepperImg;
      foodColor = FRUIT_TYPES.pepper.color;
      break;
    case "plum":
      foodImg = plumImg;
      foodColor = FRUIT_TYPES.plum.color;
      break;
    case "starberry":
      foodImg = starberryImg;
      foodColor = FRUIT_TYPES.starberry.color;
      break;
  }
  
  // Применяем затемнение к еде если активен plum
  const foodAlpha = (isBlurred && blurOpacity > 0) ? 1 - blurOpacity : 1;
  ctx.save();
  ctx.globalAlpha = foodAlpha;
  
  if (imagesLoaded && foodImg) {
    const appleSize = GRID_SIZE * 1.3;
    const offset = (GRID_SIZE - appleSize) / 2;
    
    ctx.drawImage(
      foodImg,
      food.x * GRID_SIZE + offset,
      food.y * GRID_SIZE + offset,
      appleSize,
      appleSize
    );
  } else {
    ctx.fillStyle = foodColor;
    ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    
    if (food.type === "poisonApple") {
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(food.x * GRID_SIZE + 4, food.y * GRID_SIZE + 4);
      ctx.lineTo(food.x * GRID_SIZE + GRID_SIZE - 4, food.y * GRID_SIZE + GRID_SIZE - 4);
      ctx.moveTo(food.x * GRID_SIZE + GRID_SIZE - 4, food.y * GRID_SIZE + 4);
      ctx.lineTo(food.x * GRID_SIZE + 4, food.y * GRID_SIZE + GRID_SIZE - 4);
      ctx.stroke();
    }
  }
  
  ctx.restore();
}

// Спавн еды
function spawnFood() {
  let valid = false;
  while (!valid) {
    const newX = Math.floor(Math.random() * tileCountX);
    const newY = Math.floor(Math.random() * tileCountY);
    
    if (!snakeSet.has(posKey(newX, newY))) {
      // Определяем тип фрукта по вероятности
      const rand = Math.random();
      let cumulativeProbability = 0;
      let selectedType = "apple";
      
      for (const [type, config] of Object.entries(FRUIT_TYPES)) {
        cumulativeProbability += config.probability;
        if (rand < cumulativeProbability) {
          selectedType = type;
          break;
        }
      }
      
      food = { x: newX, y: newY, type: selectedType };
      valid = true;
    }
  }
}

// Управление
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

// Конец игры
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

// Матрица на заднем фоне
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
