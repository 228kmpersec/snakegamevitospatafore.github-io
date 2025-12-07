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
let hasSecondChance = false;
let isSpeedBoosted = false;
let speedBoostTimer = null;
let isBlurred = false;
let blurTimer = null;
let blurOpacity = 0;

// Starberry визуальные эффекты
let starberryActive = false;
let starberryTimer = null;
let starberryProgress = 1;
let stars = [];
let starberryOverlay = null;
let starberryHue = 0; // Для радужного эффекта
let particles = []; // Магические частицы

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
    probability: 0.01,
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
    probability: 1.0,
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

// HSL в RGB для радужного эффекта
function hslToRgb(h, s, l) {
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
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

// Создание Starberry оверлея на весь экран с анимацией
function createStarberryOverlay() {
  if (starberryOverlay) {
    starberryOverlay.remove();
  }
  
  starberryOverlay = document.createElement("div");
  starberryOverlay.id = "starberry-overlay";
  starberryOverlay.style.position = "fixed";
  starberryOverlay.style.inset = "0";
  starberryOverlay.style.pointerEvents = "none";
  starberryOverlay.style.zIndex = "5";
  starberryOverlay.style.transition = "opacity 2s ease-out";
  
  // CSS анимация для переливов
  const style = document.createElement("style");
  style.textContent = `
    @keyframes starberryGlow {
      0% {
        background: radial-gradient(
          ellipse at center,
          transparent 0%,
          transparent 30%,
          rgba(0, 191, 255, 0.1) 60%,
          rgba(135, 206, 235, 0.25) 100%
        );
        box-shadow: 
          inset 0 0 80px rgba(0, 191, 255, 0.3),
          inset 0 0 150px rgba(135, 206, 235, 0.2);
      }
      25% {
        background: radial-gradient(
          ellipse at center,
          transparent 0%,
          transparent 30%,
          rgba(138, 43, 226, 0.1) 60%,
          rgba(147, 112, 219, 0.25) 100%
        );
        box-shadow: 
          inset 0 0 80px rgba(138, 43, 226, 0.3),
          inset 0 0 150px rgba(147, 112, 219, 0.2);
      }
      50% {
        background: radial-gradient(
          ellipse at center,
          transparent 0%,
          transparent 30%,
          rgba(255, 20, 147, 0.1) 60%,
          rgba(255, 105, 180, 0.25) 100%
        );
        box-shadow: 
          inset 0 0 80px rgba(255, 20, 147, 0.3),
          inset 0 0 150px rgba(255, 105, 180, 0.2);
      }
      75% {
        background: radial-gradient(
          ellipse at center,
          transparent 0%,
          transparent 30%,
          rgba(0, 255, 255, 0.1) 60%,
          rgba(64, 224, 208, 0.25) 100%
        );
        box-shadow: 
          inset 0 0 80px rgba(0, 255, 255, 0.3),
          inset 0 0 150px rgba(64, 224, 208, 0.2);
      }
      100% {
        background: radial-gradient(
          ellipse at center,
          transparent 0%,
          transparent 30%,
          rgba(0, 191, 255, 0.1) 60%,
          rgba(135, 206, 235, 0.25) 100%
        );
        box-shadow: 
          inset 0 0 80px rgba(0, 191, 255, 0.3),
          inset 0 0 150px rgba(135, 206, 235, 0.2);
      }
    }
    
    #starberry-overlay {
      animation: starberryGlow 4s ease-in-out infinite;
    }
  `;
  
  if (!document.getElementById("starberry-style")) {
    style.id = "starberry-style";
    document.head.appendChild(style);
  }
  
  document.body.appendChild(starberryOverlay);
}

// Обновление прозрачности оверлея
function updateStarberryOverlay() {
  if (starberryOverlay) {
    starberryOverlay.style.opacity = starberryProgress.toString();
  }
}

// Создание магических частиц
function createMagicParticles() {
  // Создаём частицы вокруг всего экрана
  for (let i = 0; i < 3; i++) {
    const side = Math.floor(Math.random() * 4);
    let x, y, vx, vy;
    
    switch (side) {
      case 0: // top
        x = Math.random() * window.innerWidth;
        y = 0;
        vx = (Math.random() - 0.5) * 2;
        vy = Math.random() * 2 + 1;
        break;
      case 1: // right
        x = window.innerWidth;
        y = Math.random() * window.innerHeight;
        vx = -(Math.random() * 2 + 1);
        vy = (Math.random() - 0.5) * 2;
        break;
      case 2: // bottom
        x = Math.random() * window.innerWidth;
        y = window.innerHeight;
        vx = (Math.random() - 0.5) * 2;
        vy = -(Math.random() * 2 + 1);
        break;
      case 3: // left
        x = 0;
        y = Math.random() * window.innerHeight;
        vx = Math.random() * 2 + 1;
        vy = (Math.random() - 0.5) * 2;
        break;
    }
    
    particles.push({
      x: x,
      y: y,
      vx: vx,
      vy: vy,
      size: 2 + Math.random() * 4,
      life: 1,
      hue: Math.random()
    });
  }
}

// Обновление магических частиц
function updateMagicParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.005;
    p.hue += 0.01;
    if (p.hue > 1) p.hue = 0;
    
    if (p.life <= 0 || p.x < -50 || p.x > window.innerWidth + 50 || 
        p.y < -50 || p.y > window.innerHeight + 50) {
      particles.splice(i, 1);
    }
  }
}

// Рисование магических частиц на canvas
function drawMagicParticles() {
  const canvasRect = canvas.getBoundingClientRect();
  
  for (const p of particles) {
    // Конвертируем screen координаты в canvas координаты
    const canvasX = p.x - canvasRect.left;
    const canvasY = p.y - canvasRect.top;
    
    if (canvasX >= 0 && canvasX <= canvas.width && canvasY >= 0 && canvasY <= canvas.height) {
      ctx.save();
      ctx.globalAlpha = p.life * starberryProgress;
      
      const rgb = hslToRgb(p.hue, 1, 0.6);
      const gradient = ctx.createRadialGradient(canvasX, canvasY, 0, canvasX, canvasY, p.size);
      gradient.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1)`);
      gradient.addColorStop(0.5, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.5)`);
      gradient.addColorStop(1, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, p.size * 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
  }
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
  particles = [];
  steamParticles = [];
  blurOpacity = 0;
  starberryProgress = 1;
  starberryHue = 0;
  
  // Удаляем оверлей если есть
  if (starberryOverlay) {
    starberryOverlay.remove();
    starberryOverlay = null;
  }
  
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
  
  // Удаляем оверлей
  if (starberryOverlay) {
    starberryOverlay.remove();
    starberryOverlay = null;
  }
  
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
  
  // Обновление Starberry эффектов
  if (starberryActive) {
    starberryHue += 0.005;
    if (starberryHue > 1) starberryHue = 0;
    
    if (animationFrame % 2 === 0) {
      createMagicParticles();
    }
    updateMagicParticles();
    updateStarberryOverlay();
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

  // Столкновение со стеной - используем второй шанс
  if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) {
    if (hasSecondChance) {
      hasSecondChance = false;
      showSecondChanceEffect();
      // Телепортируем змею в безопасное место
      snake[0].x = Math.floor(tileCountX / 2);
      snake[0].y = Math.floor(tileCountY / 2);
      velocityX = 0;
      velocityY = 0;
      return;
    }
    startDeathAnimation(false);
    return;
  }

  // Столкновение с собой - используем второй шанс
  if (snakeSet.has(headKey)) {
    if (hasSecondChance) {
      hasSecondChance = false;
      showSecondChanceEffect();
      // Телепортируем змею в безопасное место
      snake[0].x = Math.floor(tileCountX / 2);
      snake[0].y = Math.floor(tileCountY / 2);
      velocityX = 0;
      velocityY = 0;
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
  
  moveDelay = baseSpeed / 5;
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
  if (animationFrame % 3 === 0) {
    const head = snake[0];
    const headX = head.x * GRID_SIZE + GRID_SIZE / 2;
    const headY = head.y * GRID_SIZE + GRID_SIZE / 2;
    
    steamParticles.push({
      x: headX - GRID_SIZE / 2,
      y: headY,
      vx: -2 - Math.random() * 2,
      vy: -1 + Math.random() * 2,
      life: 1,
      size: 3 + Math.random() * 4
    });
    
    steamParticles.push({
      x: headX + GRID_SIZE / 2,
      y: headY,
      vx: 2 + Math.random() * 2,
      vy: -1 + Math.random() * 2,
      life: 1,
      size: 3 + Math.random() * 4
    });
  }
  
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
  particles = [];
  
  // Создаём оверлей на весь экран
  createStarberryOverlay();
  
  // Создаём звёздочки по краям
  stars = [];
  for (let i = 0; i < 40; i++) {
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
      size: 3 + Math.random() * 6,
      speed: 1 + Math.random() * 3,
      angle: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.15,
      hue: Math.random()
    });
  }
  
  if (starberryTimer) clearTimeout(starberryTimer);
  
  // Через 15 секунд начинаем плавное угасание
  starberryTimer = setTimeout(() => {
    const fadeInterval = setInterval(() => {
      starberryProgress -= 0.015;
      if (starberryProgress <= 0) {
        starberryActive = false;
        stars = [];
        particles = [];
        if (starberryOverlay) {
          starberryOverlay.remove();
          starberryOverlay = null;
        }
        clearInterval(fadeInterval);
      }
    }, 50);
  }, 15000);
}

// Эффект второго шанса
function showSecondChanceEffect() {
  const flash = document.createElement("div");
  flash.style.position = "fixed";
  flash.style.inset = "0";
  flash.style.background = "radial-gradient(circle, rgba(0, 255, 255, 0.8), rgba(138, 43, 226, 0.5))";
  flash.style.zIndex = "999";
  flash.style.pointerEvents = "none";
  document.body.appendChild(flash);
  
  setTimeout(() => {
    flash.style.transition = "opacity 0.6s";
    flash.style.opacity = "0";
    setTimeout(() => flash.remove(), 600);
  }, 150);
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
  } else if (starberryActive && hasSecondChance) {
    // Радужный эффект для змеи при Starberry
    const rgb = hslToRgb(starberryHue, 0.8, 0.6);
    color = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
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
  
  // Свечение при Starberry
  if (starberryActive && hasSecondChance) {
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
  }
  
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

// Рисование звезды с радужным эффектом
function drawStar(x, y, size, rotation, hue) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  
  const rgb = hslToRgb(hue, 1, 0.6);
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
  gradient.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${starberryProgress})`);
  gradient.addColorStop(0.7, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${starberryProgress * 0.6})`);
  gradient.addColorStop(1, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0)`);
  
  ctx.fillStyle = gradient;
  ctx.shadowBlur = 10;
  ctx.shadowColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${starberryProgress})`;
  
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
  
  ctx.restore();
}

// Отрисовка
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Рисуем магические частицы под всем
  if (starberryActive) {
    drawMagicParticles();
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
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  
  // Рисуем звёздочки (Starberry)
  if (starberryActive) {
    for (const star of stars) {
      star.x += Math.cos(star.angle) * star.speed;
      star.y += Math.sin(star.angle) * star.speed;
      star.rotation += star.rotationSpeed;
      star.hue += 0.01;
      if (star.hue > 1) star.hue = 0;
      
      // Wrap around edges
      if (star.x < -30) star.x = canvas.width + 30;
      if (star.x > canvas.width + 30) star.x = -30;
      if (star.y < -30) star.y = canvas.height + 30;
      if (star.y > canvas.height + 30) star.y = -30;
      
      drawStar(star.x, star.y, star.size, star.rotation, star.hue);
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
