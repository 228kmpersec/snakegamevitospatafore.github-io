// scripts/main.js
// Логика игры (бывший game.js)

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

function initSnakeGame() {
    if (isGameRunning) return;
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('keydown', keyDownEvent);

    snake = [{ x: 10, y: 10 }];
    score = 0;
    scoreEl.innerText = score;
    velocityX = 0; 
    velocityY = 0;
    
    spawnFood();
    isGameRunning = true;
    gameInterval = setInterval(update, 40); 
}

function stopSnakeGame() {
    isGameRunning = false;
    clearInterval(gameInterval);
    document.removeEventListener('keydown', keyDownEvent);
}

function update() {
    if (!isGameRunning) return;

    const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };

    if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) {
        gameOver();
        return;
    }

    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            if (velocityX !== 0 || velocityY !== 0) {
                gameOver();
                return;
            }
        }
    }

    snake.unshift(head);

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

function draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00ff41';
    for (let i = 0; i < snake.length; i++) {
        ctx.fillRect(snake[i].x * GRID_SIZE + 1, snake[i].y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
    }

    ctx.fillStyle = 'white';
    ctx.fillRect(food.x * GRID_SIZE + 1, food.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
    
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'white';
    ctx.fillRect(food.x * GRID_SIZE + 1, food.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
    ctx.shadowBlur = 0;
}

function spawnFood() {
    let validPosition = false;
    while (!validPosition) {
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
            validPosition = true;
        }
    }
}

function keyDownEvent(e) {
    switch (e.keyCode) {
        case 37: 
            if (velocityX === 1) break; 
            velocityX = -1;
            velocityY = 0;
            break;
        case 38: 
            if (velocityY === 1) break;
            velocityX = 0;
            velocityY = -1;
            break;
        case 39: 
            if (velocityX === -1) break;
            velocityX = 1;
            velocityY = 0;
            break;
        case 40: 
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

window.initSnakeGame = initSnakeGame;
window.stopSnakeGame = stopSnakeGame;
