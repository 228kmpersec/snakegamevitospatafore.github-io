// scripts/menu.js
// Логика меню и выбор режима сложности

(function () {
  const menuEl = document.getElementById("menu");
  const gameRoot = document.getElementById("game-root");
  const modeWrapper = document.getElementById("mode-wrapper");
  const btnPlay = document.getElementById("btn-play");
  const btnEasy = document.getElementById("btn-easy");
  const btnHard = document.getElementById("btn-hard");
  const btnMenu = document.getElementById("btn-menu");
  const btnContact = document.getElementById("btn-contact");
  const modal = document.getElementById("contact-modal");
  const modalClose = document.getElementById("modal-close");

  const gameOverModal = document.getElementById("game-over-modal");
  const btnRetry = document.getElementById("btn-retry");
  const btnMainMenu = document.getElementById("btn-main-menu");

  if (!menuEl || !btnPlay || !modeWrapper) {
    console.warn("Menu elements missing");
    return;
  }

  // ---------- РАСКРЫТИЕ ВЫБОРА РЕЖИМА ----------
  let modesOpened = false;
  let lastMode = "default";
  let lastSpeed = 40;

  btnPlay.addEventListener("click", () => {
    if (!modesOpened) {
      modesOpened = true;
      modeWrapper.classList.add("modes-visible");
      btnPlay.textContent = "DEFAULT";
    } else {
      startGameWithMode("default", 40);
    }
  });

  if (btnEasy) {
    btnEasy.addEventListener("click", () => {
      startGameWithMode("easy", 150);
    });
  }

  if (btnHard) {
    btnHard.addEventListener("click", () => {
      startGameWithMode("hard", 16);
    });
  }

  // ---------- ЗАПУСК ИГРЫ ----------
  function startGameWithMode(mode, speedMs) {
    if (typeof window.initSnakeGame !== "function") {
      alert("Ошибка: игра ещё не загрузилась (initSnakeGame не найден).");
      return;
    }

    lastMode = mode;
    lastSpeed = speedMs;
    window.gameSpeed = speedMs;
    window.gameMode = mode;

    menuEl.classList.add("hidden");
    gameRoot.classList.remove("hidden");
    if (gameOverModal) {
      gameOverModal.classList.add("hidden");
    }

    window.initSnakeGame();
  }

  // ---------- ВЫХОД В МЕНЮ ----------
  function showMenu() {
    gameRoot.classList.add("hidden");
    menuEl.classList.remove("hidden");
    if (gameOverModal) {
      gameOverModal.classList.add("hidden");
    }

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

  window.returnToMenu = showMenu;

  // ---------- GAME OVER КНОПКИ ----------
  if (btnRetry) {
    btnRetry.addEventListener("click", () => {
      startGameWithMode(lastMode, lastSpeed);
    });
  }

  if (btnMainMenu) {
    btnMainMenu.addEventListener("click", () => {
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

  // ---------- ЗВЁЗДНЫЙ ФОН ДЛЯ МЕНЮ ----------
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
    for (let i = 0; i < 300; i++) {
      stars.push({
        x: Math.random() * bgCanvas.width,
        y: Math.random() * bgCanvas.height,
        radius: Math.random() * 2.5 + 0.5,
        speed: Math.random() * 0.8 + 0.2,
        opacity: Math.random() * 0.5 + 0.5
      });
    }

    function drawStars() {
      ctxBg.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctxBg.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

      stars.forEach(star => {
        star.opacity += (Math.random() - 0.5) * 0.05;
        star.opacity = Math.max(0.3, Math.min(1, star.opacity));

        ctxBg.beginPath();
        ctxBg.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctxBg.shadowBlur = 8;
        ctxBg.shadowColor = `rgba(255, 255, 255, ${star.opacity})`;
        ctxBg.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctxBg.fill();
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

  // ВЫЗЫВАЕМ СОЗДАНИЕ ФОНА
  createMenuStarryBackground();
})();
