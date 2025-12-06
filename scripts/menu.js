// scripts/menu.js
// Логика меню и выбор режима сложности

(function () {
    const menuEl = document.getElementById("menu");
    const gameRoot = document.getElementById("game-root");

    const modeWrapper = document.getElementById("mode-wrapper");
    const btnPlay = document.getElementById("btn-play");   // центральная
    const btnEasy = document.getElementById("btn-easy");   // левая
    const btnHard = document.getElementById("btn-hard");   // правая

    const btnMenu = document.getElementById("btn-menu");

    const btnContact = document.getElementById("btn-contact");
    const modal = document.getElementById("contact-modal");
    const modalClose = document.getElementById("modal-close");

    if (!menuEl || !btnPlay || !modeWrapper) {
        console.warn("Menu elements missing");
        return;
    }

    // ---------- РАСКРЫТИЕ ВЫБОРА РЕЖИМА ----------

    let modesOpened = false;

    btnPlay.addEventListener("click", () => {
        if (!modesOpened) {
            // Первый клик – открыть режимы, переименовать кнопку
            modesOpened = true;
            modeWrapper.classList.add("modes-visible");
            btnPlay.textContent = "DEFAULT"; // дефолтная скорость
        } else {
            // Если уже открыты – запускать дефолтный режим
            startGameWithSpeed(40);
        }
    });

    // EASY (очень медленно)
    if (btnEasy) {
        btnEasy.addEventListener("click", () => {
            startGameWithSpeed(150); // лёгкий режим
        });
    }

    // HARD (быстро)
    if (btnHard) {
        btnHard.addEventListener("click", () => {
            startGameWithSpeed(16); // хард
        });
    }

    // ---------- ЗАПУСК ИГРЫ С ВЫБРАННОЙ СКОРОСТЬЮ ----------

    function startGameWithSpeed(speedMs) {
        if (typeof window.initSnakeGame !== "function") {
            alert("Ошибка: игра ещё не загрузилась (initSnakeGame не найден).");
            return;
        }

        window.gameSpeed = speedMs;   // глобальная переменная читается в main.js

        // Скрываем меню, показываем игру
        menuEl.classList.add("hidden");
        gameRoot.classList.remove("hidden");

        // Старт игры
        window.initSnakeGame();
    }

    // ---------- ВЫХОД В МЕНЮ ИЗ ИГРЫ ----------

    function showMenu() {
        gameRoot.classList.add("hidden");
        menuEl.classList.remove("hidden");

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
})();
