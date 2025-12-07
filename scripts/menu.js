// scripts/menu.js

// Логика меню и выбор режима сложности

(function () {
const menuEl = document.getElementById("menu");
const gameRoot = document.getElementById("game-root");
const modeWrapper = document.getElementById("mode-wrapper");
const btnPlay = document.getElementById("btn-play"); // центральная
const btnEasy = document.getElementById("btn-easy"); // левая
const btnHard = document.getElementById("btn-hard"); // правая
const btnMenu = document.getElementById("btn-menu");
const btnContact = document.getElementById("btn-contact");
const modal = document.getElementById("contact-modal");
const modalClose = document.getElementById("modal-close");

// Game Over элементы
const gameOverModal = document.getElementById("game-over-modal");
const btnRetry = document.getElementById("btn-retry");
const btnMainMenu = document.getElementById("btn-main-menu");

if (!menuEl || !btnPlay || !modeWrapper) {
  console.warn("Menu elements missing");
  return;
}

// ---------- РАСКРЫТИЕ ВЫБОРА РЕЖИМА ----------
let modesOpened = false;
let lastMode = "default"; // сохраняем последний выбранный режим для retry
let lastSpeed = 40;

btnPlay.addEventListener("click", () => {
  if (!modesOpened) {
    // Первый клик – открыть режимы, переименовать кнопку
    modesOpened = true;
    modeWrapper.classList.add("modes-visible");
    btnPlay.textContent = "DEFAULT"; // дефолтная скорость
  } else {
    // Если уже открыты – запускать дефолтный режим
    startGameWithMode("default", 40);
  }
});

// EASY (очень медленно, маленькое поле)
if (btnEasy) {
  btnEasy.addEventListener("click", () => {
    startGameWithMode("easy", 150);
  });
}

// HARD (быстро, большое поле)
if (btnHard) {
  btnHard.addEventListener("click", () => {
    startGameWithMode("hard", 16);
  });
}

// ---------- ЗАПУСК ИГРЫ С ВЫБРАННОЙ СКОРОСТЬЮ И РЕЖИМОМ ----------
function startGameWithMode(mode, speedMs) {
  if (typeof window.initSnakeGame !== "function") {
    alert("Ошибка: игра ещё не загрузилась (initSnakeGame не найден).");
    return;
  }

  lastMode = mode;
  lastSpeed = speedMs;
  window.gameSpeed = speedMs;
  window.gameMode = mode; // передаём режим

  // Скрываем меню и Game Over, показываем игру
  menuEl.classList.add("hidden");
  gameRoot.classList.remove("hidden");
  if (gameOverModal) {
    gameOverModal.classList.add("hidden");
  }

  // Старт игры
  window.initSnakeGame();
}

// ---------- ВЫХОД В МЕНЮ ИЗ ИГРЫ ----------
function showMenu() {
  gameRoot.classList.add("hidden");
  menuEl.classList.remove("hidden");
  if (gameOverModal) {
    gameOverModal.classList.add("hidden");
  }

  // Сброс состояния меню
  modesOpened = false;
  modeWrapper.classList.remove("modes-visible");
  btnPlay.textContent = "PLAY";

  if (typeof window.stopSnakeGame === "function") {
    window.stopSnakeGame();
  }
}

if (btnMenu) {
  btnMenu.addEventListener("click", showMenu);
}

// Чтобы игру могла завершать сама
window.returnToMenu = showMenu;

// ---------- GAME OVER КНОПКИ ----------
if (btnRetry) {
  btnRetry.addEventListener("click", () => {
    // Перезапускаем игру с тем же режимом
    startGameWithMode(lastMode, lastSpeed);
  });
}

if (btnMainMenu) {
  btnMainMenu.addEventListener("click", () => {
    // Возврат в главное меню
    showMenu();
  });
}

// ---------- МОДАЛКА CONTACT ----------
if (btnContact && modal && modalClose) {
  btnContact.addEventListener("click", (e) => {
    e.preventDefault();
    modal.classList.remove("hidden");
  });

  modalClose.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });
}

function createMenuStarryBackground() {
  let bgCanvas = document.getElementById("menu-stars-bg");
  
  if (!bgCanvas) {
    bgCanvas = document.createElement("canvas");
    bgCanvas.id = "menu-stars-bg";
    bgCanvas.style.position = "fixed";
    bgCanvas.style.inset = "0";
    bgCanvas.style.zIndex = "-1"; // ← ИСПРАВЛЕНО
    bgCanvas.style.pointerEvents = "none";
    document.body.appendChild(bgCanvas);
  }

  const ctxBg = bgCanvas.getContext("2d");
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;

  const stars = [];
  for (let i = 0; i < 200; i++) {
    stars.push({
      x: Math.random() * bgCanvas.width,
      y: Math.random() * bgCanvas.height,
      radius: Math.random() * 2,
      speed: Math.random() * 0.5 + 0.1,
      opacity: Math.random()
    });
  }

 function createMenuStarryBackground() {
  let bgCanvas = document.getElementById("menu-stars-bg");
  
  if (!bgCanvas) {
    bgCanvas = document.createElement("canvas");
    bgCanvas.id = "menu-stars-bg";
    bgCanvas.style.position = "fixed";
    bgCanvas.style.inset = "0";
    bgCanvas.style.zIndex = "-1";
    bgCanvas.style.pointerEvents = "none";
    document.body.appendChild(bgCanvas);
  }

  const ctxBg = bgCanvas.getContext("2d");
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;

  const stars = [];
  for (let i = 0; i < 300; i++) { // ← Больше звёзд (было 200)
    stars.push({
      x: Math.random() * bgCanvas.width,
      y: Math.random() * bgCanvas.height,
      radius: Math.random() * 2.5 + 0.5, // ← Крупнее (было 2)
      speed: Math.random() * 0.8 + 0.2, // ← Быстрее
      opacity: Math.random() * 0.5 + 0.5 // ← Ярче (минимум 0.5)
    });
  }

  function drawStars() {
    ctxBg.fillStyle = "rgba(0, 0, 0, 0.05)"; // ← Медленнее затухание (было 0.1)
    ctxBg.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

    stars.forEach(star => {
      star.opacity += (Math.random() - 0.5) * 0.05; // ← Плавнее мерцание
      star.opacity = Math.max(0.3, Math.min(1, star.opacity)); // ← Минимум 0.3 (было 0.1)
      
      ctxBg.beginPath();
      ctxBg.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      
      // ← Добавил свечение
      ctxBg.shadowBlur = 8;
      ctxBg.shadowColor = `rgba(255, 255, 255, ${star.opacity})`;
      ctxBg.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      ctxBg.fill();
      
      // Сброс тени
      ctxBg.shadowBlur = 0;
      
      star.y += star.speed;
      if (star.y > bgCanvas.height) {
        star.y = 0;
        star.x = Math.random() * bgCanvas.width;
      }
    });
  }

  setInterval(drawStars, 30);
}
