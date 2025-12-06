// SNAKE GAME LOGIC
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score-val');

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

// Resize canvas to fit window but keep grid alignment
function resizeCanvas() {
    // Make canvas fill most of the screen but keep it multiple of GRID_SIZE
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.8;

    const cols = Math.floor(maxWidth / GRID_SIZE);
    const rows = Math.floor(maxHeight / GRID_SIZE);

    canvas.width = cols * GRID_SIZE;
    canvas.height = rows * GRID_SIZE;

    tileCountX = cols;
    tileCountY = rows;
}

function initSnakeGame() {
    if (isGameRunning) return;
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('keydown', keyDownEvent);

    // Reset State
    snake = [{ x: 10, y: 10 }]; // Head
    score = 0;
    scoreEl.innerText = score;
    velocityX = 0; // Start stationary
    velocityY = 0;
    
    spawnFood();
    isGameRunning = true;
    gameInterval = setInterval(update, 100); // 10 FPS
}

function stopSnakeGame() {
    isGameRunning = false;
    clearInterval(gameInterval);
    document.removeEventListener('keydown', keyDownEvent);
}

function update() {
    if (!isGameRunning) return;

    // Move Snake
    const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };

    // Wall Collision (Wrap around or Die? Let's die for classic matrix feel)
    // Actually, Matrix is infinite... let's Wrap Around for fun, or Die for difficulty.
    // User asked to fix errors. Usually walls kill or wrap. 
    // Let's implement Wall Death for standard snake.
    if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) {
        gameOver();
        return;
    }

    // Body Collision
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            // Only die if moving (ignore initial stationary state collision check)
            if (velocityX !== 0 || velocityY !== 0) {
                gameOver();
                return;
            }
        }
    }

    // Add new head
    snake.unshift(head);

    // Check Food
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreEl.innerText = score;
        spawnFood();
    } else {
        // Remove tail if no food eaten (only if moving)
        if (velocityX !== 0 || velocityY !== 0) {
            snake.pop();
        } else {
            // If not moving, don't grow, keep size 1 (removes the duplicate unshift)
             snake.pop();
        }
    }

    draw();
}

function draw() {
    // Clear Screen (Black)
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Snake (Green)
    ctx.fillStyle = '#00ff41'; // Matrix Green
    for (let i = 0; i < snake.length; i++) {
        // Slightly smaller rect for grid effect
        ctx.fillRect(snake[i].x * GRID_SIZE + 1, snake[i].y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
    }

    // Draw Food (White/Bright Green)
    ctx.fillStyle = 'white';
    ctx.fillRect(food.x * GRID_SIZE + 1, food.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
    
    // Optional: Glow effect on food
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'white';
    ctx.fillRect(food.x * GRID_SIZE + 1, food.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
    ctx.shadowBlur = 0;
}

function spawnFood() {
    let validPosition = false;
    while (!validPosition) {
        // Random Grid Position
        const newX = Math.floor(Math.random() * tileCountX);
        const newY = Math.floor(Math.random() * tileCountY);

        // Check against snake body
        let overlap = false;
        for (let part of snake) {
            if (part.x === newX && part.y === newY) {
                overlap = true;
                break;
            }
        }

        if (!overlap) {
            food = { x: newX, y: newY };
            validPosition = true;
        }
    }
}

function keyDownEvent(e) {
    switch (e.keyCode) {
        case 37: // Left
            if (velocityX === 1) break; // Prevent 180 turn
            velocityX = -1;
            velocityY = 0;
            break;
        case 38: // Up
            if (velocityY === 1) break;
            velocityX = 0;
            velocityY = -1;
            break;
        case 39: // Right
            if (velocityX === -1) break;
            velocityX = 1;
            velocityY = 0;
            break;
        case 40: // Down
            if (velocityY === -1) break;
            velocityX = 0;
            velocityY = 1;
            break;
    }
}

function gameOver() {
    alert(`GAME OVER\nSCORE: ${score}`);
    stopSnakeGame();
    if (window.returnToMenu) window.returnToMenu();
}

// Expose globally
window.initSnakeGame = initSnakeGame;
window.stopSnakeGame = stopSnakeGame;
