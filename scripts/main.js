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
let food = { x: 5, y: 5 };
let score = 0;
let gameInterval;
let isGameRunning = false;

// Скорость (по умолчанию нормальная, меняется меню)
window.gameSpeed = 40;

// ================== РАЗМЕР КАНВАСА ==================

function resizeCanvas() {
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.8;

    const cols = Math.floor(maxWidth / GRID_SIZE);
    const rows = Math.floor(maxHeight / GRID_SIZE);

    canvas.width = cols * GRID_SIZE;
    canvas.height = rows * GRID_SIZE;

    tileCountX = cols;
    tileCountY = rows;
}

// ================== ИНИЦИАЛИЗАЦИЯ ИГРЫ ==================

function initSnakeGame() {
    if (isGameRunning) return;

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    document.addEventListener("keydown", keyDownEvent);

    snake = [{ x: 10, y: 10 }];
    score = 0;
    scoreEl.innerText = score;
    velocityX = 0;
    velocityY = 0;

    spawnFood();

    isGameRunning = true;
    gameInterval = setInterval(update, window.gameSpeed);

    createMatrixRain();
} // ← вот этой скобки у тебя не хватало

function stopSnakeGame() {
    isGameRunning = false;
    clearInterval(gameInterval);
    document.removeEventListener("keydown", keyDownEvent);
}

// ================== ОБНОВЛЕНИЕ ИГРЫ ==================

function update() {
    if (!isGameRunning) return;

    const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };

    // Столкновение со стеной
    if (
        head.x < 0 ||
        head.x >= tileCountX ||
        head.y < 0 ||
        head.y >= tileCountY
    ) {
        gameOver();
        return;
    }

    // Столкновение с собой
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            if (velocityX !== 0 || velocityY !== 0) {
                gameOver();
                return;
            }
        }
    }

    snake.unshift(head);

    // Еда
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreEl.innerText = score;
        spawnFood();
    } else {
        if (velocityX !== 0 || velocityY !== 0) {
            snake.pop();
        } else {
            snake.pop();
        }
    }

    draw();
}
// ================== ОТРИСОВКА ==================

function draw() {
    console.log("draw frame"); // проверка

    // убираем предыдущий кадр змейки
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // лёгкое затемнение (стекло)
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // змейка
    ctx.fillStyle = "#00ff41";
    for (let i = 0; i < snake.length; i++) {
        ctx.fillRect(
            snake[i].x * GRID_SIZE + 1,
            snake[i].y * GRID_SIZE + 1,
            GRID_SIZE - 2,
            GRID_SIZE - 2
        );
    }

    // еда
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(
        food.x * GRID_SIZE + 1,
        food.y * GRID_SIZE + 1,
        GRID_SIZE - 2,
        GRID_SIZE - 2
    );
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
            food = { x: newX, y: newY };
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

function gameOver() {
    alert(`GAME OVER\nSCORE: ${score}`);
    stopSnakeGame();
    if (window.returnToMenu) window.returnToMenu();
}

// ================== МАТРИЦА НА ЗАДНЕМ ФОНЕ ==================

function createMatrixRain() {
    const matrixCanvas = document.createElement("canvas");
    matrixCanvas.id = "matrix-bg";
    matrixCanvas.style.position = "fixed";
    matrixCanvas.style.inset = "0";
    matrixCanvas.style.zIndex = "-1";
    document.body.appendChild(matrixCanvas);

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

function draw() {
    console.log("draw frame"); // проверка

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ...
}
