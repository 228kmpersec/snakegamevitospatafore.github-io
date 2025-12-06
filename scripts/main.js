<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>SNAKE // NOIR_PROTOCOL</title>
  <style>
    /* ====== CYBERPUNK NOIR THEME 📼⬛ ====== */
    :root {
      --bg: #050505;
      --text: #e0e0e0;
      --accent: #ffffff;
      --btn-bg: #000000;
      --btn-border: #ffffff;
      /* Холодное белое свечение */
      --glow: 0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.2);
      --scanline: rgba(255, 255, 255, 0.05);
    }

    * {
      box-sizing: border-box;
    }

    html, body {
      height: 100%;
      margin: 0;
      font-family: 'Courier New', monospace, system-ui, Arial;
    }

    body {
      background-color: var(--bg);
      color: var(--text);
      overflow-x: hidden;
      min-height: 100vh;
    }

    /* Цифровая сетка на фоне страницы */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image: 
        linear-gradient(var(--scanline) 1px, transparent 1px),
        linear-gradient(90deg, var(--scanline) 1px, transparent 1px);
      background-size: 40px 40px;
      background-position: center;
      z-index: 0;
      pointer-events: none;
    }

    /* Эффект старого ЭЛТ монитора (виньетка) */
    body::after {
      content: '';
      position: fixed;
      inset: 0;
      background: radial-gradient(circle, transparent 60%, black 100%);
      pointer-events: none;
      z-index: 2;
    }

    /* Fullscreen menu */
    .menu {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.9);
      z-index: 1000;
      backdrop-filter: blur(5px);
    }

    /* Menu Container */
    .menu-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 40px;
      padding: 60px;
      border: 2px solid var(--accent);
      background: #000;
      box-shadow: 10px 10px 0px #222;
      min-width: 300px;
    }

    /* Menu Title - Глитч эффект */
    .menu-title {
      font-size: clamp(48px, 10vw, 86px);
      font-weight: 900;
      letter-spacing: 12px;
      margin: 0;
      color: var(--accent);
      text-transform: uppercase;
      text-shadow: 4px 4px 0px #333;
      position: relative;
    }

    .menu-title::before {
      content: '> SYSTEM_READY';
      position: absolute;
      top: -25px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 14px;
      letter-spacing: 4px;
      opacity: 0.7;
      white-space: nowrap;
    }

    /* Play button wrapper */
    .play-button-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }

    /* Play button - Строгий стиль */
    .play-button {
      padding: 20px 60px;
      background: #000;
      color: var(--accent);
      border: 4px solid var(--btn-border);
      font-weight: 900;
      font-size: 32px;
      letter-spacing: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.1s steps(2);
      box-shadow: 8px 8px 0px #333; /* Жесткая тень */
      text-transform: uppercase;
      font-family: 'Courier New', monospace;
    }

    .play-button:hover {
      transform: translate(-2px, -2px);
      box-shadow: 10px 10px 0px var(--accent);
      background: var(--accent);
      color: #000;
    }

    .play-button:active {
      transform: translate(4px, 4px);
      box-shadow: 2px 2px 0px #333;
    }

    /* Menu Navigation */
    .menu-nav {
      display: flex;
      gap: 20px;
    }

    .menu-link {
      color: var(--text);
      text-decoration: none;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 2px;
      padding: 10px 20px;
      border: 1px solid transparent;
      text-transform: uppercase;
      transition: all 0.2s;
    }

    .menu-link:hover {
      background: var(--accent);
      color: #000;
      box-shadow: 4px 4px 0px #333;
    }

    /* Modal - Терминал стиль */
    .modal {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    }

    .modal-content {
      background: #000;
      border: 2px solid var(--accent);
      padding: 40px;
      max-width: 500px;
      width: 90%;
      box-shadow: 15px 15px 0px #222;
      font-family: 'Courier New', monospace;
    }

    .modal-content h2 {
      border-bottom: 2px solid var(--accent);
      padding-bottom: 10px;
      margin-top: 0;
      text-transform: uppercase;
    }

    .modal-content a {
      color: #fff;
      text-decoration: underline;
    }

    .modal-close {
      position: absolute;
      top: 10px;
      right: 15px;
      background: transparent;
      border: none;
      color: var(--text);
      font-size: 30px;
      cursor: pointer;
    }

    .modal-close:hover {
      color: var(--accent);
    }

    /* Game canvas */
    .game-root {
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #000;
      z-index: 10;
    }

    .game-root canvas {
      border: 4px solid var(--accent);
      box-shadow: var(--glow);
      width: 800px;
      height: 600px;
      max-width: 100%;
      background: #000;
    }

    .hidden {
      display: none !important;
    }
  </style>
</head>
<body>
  <!-- Fullscreen menu -->
  <div id="menu" class="menu">
    <div class="menu-container">
      <!-- Logo/Title -->
      <h1 class="menu-title">SNAKE</h1>
      
      <!-- Main Play Button -->
      <div class="play-button-wrapper">
        <button id="btn-play" class="play-button">INITIALIZE</button>
      </div>
      
      <!-- Navigation Links -->
      <nav class="menu-nav">
        <a href="#" class="menu-link" onclick="alert('Discord link placeholder')">
          UPLINK
        </a>
        <a href="#contact" class="menu-link" id="btn-contact">
          DATA
        </a>
      </nav>
    </div>
  </div>

  <!-- Game root -->
  <main id="game-root" class="game-root hidden"></main>

  <!-- Contact Modal -->
  <div id="contact-modal" class="modal hidden">
    <div class="modal-content">
      <button class="modal-close" id="modal-close">&times;</button>
      <h2>SYSTEM DATA</h2>
      <p>DEV: <a href="mailto:your@email.com">ADMIN</a></p>
      <p>REPO: <a href="#" target="_blank">GITHUB_ACCESS</a></p>
    </div>
  </div>

 <!-- Script Block -->
<script>
    // --- MAIN.JS LOGIC START ---
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const gameRoot = document.getElementById('game-root');

    // Настройки игры
    const GRID_SIZE = 20; 
    let TILE_COUNT_X = 40;
    let TILE_COUNT_Y = 30;

    // === ЦВЕТА (CYBERPUNK NOIR) ===
    const COLOR_BG = '#000000';         
    const COLOR_SNAKE = '#ffffff';      
    const COLOR_FOOD = '#ffffff';       
    const COLOR_GRID = '#1a1a1a';       

    // Переменные состояния
    let snake = [];
    let food = { x: 10, y: 10 };
    let dx = 0;
    let dy = 0;
    let score = 0;
    let gameInterval;
    let isGameRunning = false;

    function resizeCanvas() {
        const width = Math.min(800, window.innerWidth - 40);
        const height = Math.min(600, window.innerHeight - 40);
        
        canvas.width = width;
        canvas.height = height;
        
        TILE_COUNT_X = Math.floor(width / GRID_SIZE);
        TILE_COUNT_Y = Math.floor(height / GRID_SIZE);
    }

    function initGame() {
        gameRoot.innerHTML = ''; 
        gameRoot.appendChild(canvas);
        resizeCanvas();
        
        // Старт в центре
        const centerX = Math.floor(TILE_COUNT_X / 2);
        const centerY = Math.floor(TILE_COUNT_Y / 2);

        snake = [
            { x: centerX, y: centerY },
            { x: centerX - 1, y: centerY },
            { x: centerX - 2, y: centerY }
        ];
        
        score = 0;
        dx = 1; 
        dy = 0;
        
        placeFood();
        document.addEventListener('keydown', handleInput);
        
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, 100); 
        isGameRunning = true;
    }

    // Экспорт для меню
    window.startGame = initGame;

    function gameLoop() {
        if (!isGameRunning) return;
        update();
        draw();
    }

    function update() {
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        
        // Телепорт через стены
        if (head.x < 0) head.x = TILE_COUNT_X - 1;
        if (head.x >= TILE_COUNT_X) head.x = 0;
        if (head.y < 0) head.y = TILE_COUNT_Y - 1;
        if (head.y >= TILE_COUNT_Y) head.y = 0;
        
        // Самоубийство
        for (let part of snake) {
            if (head.x === part.x && head.y === part.y) {
                gameOver();
                return;
            }
        }
        
        snake.unshift(head); 
        
        // Еда
        if (head.x === food.x && head.y === food.y) {
            score++;
            placeFood();
        } else {
            snake.pop(); 
        }
    }

    function draw() {
        // 1. Фон
        ctx.fillStyle = COLOR_BG;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 2. Сетка
        ctx.strokeStyle = COLOR_GRID;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
        }
        for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
        }
        ctx.stroke();
        
        // 3. Змейка
        snake.forEach((part, index) => {
            if (index === 0) {
                ctx.fillStyle = '#ffffff';
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#ffffff';
            } else {
                ctx.fillStyle = '#cccccc';
                ctx.shadowBlur = 0;
            }
            
            ctx.fillRect(
                part.x * GRID_SIZE + 1, 
                part.y * GRID_SIZE + 1, 
                GRID_SIZE - 2, 
                GRID_SIZE - 2
            );
        });
        ctx.shadowBlur = 0; 
        
        // 4. Еда
        ctx.fillStyle = COLOR_FOOD;
        ctx.shadowBlur = 15;
        ctx.shadowColor = COLOR_FOOD;
        const pad = 4;
        ctx.fillRect(
            food.x * GRID_SIZE + pad, 
            food.y * GRID_SIZE + pad, 
            GRID_SIZE - (pad*2), 
            GRID_SIZE - (pad*2)
        );
        ctx.shadowBlur = 0;
        
        // 5. HUD (Счет)
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px "Courier New"';
        ctx.fillText(`BUFFER: ${score}`, 20, 30);
        
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(20, 40);
        ctx.lineTo(150, 40);
        ctx.stroke();
    }

    function placeFood() {
        food = {
            x: Math.floor(Math.random() * TILE_COUNT_X),
            y: Math.floor(Math.random() * TILE_COUNT_Y)
        };
        for (let part of snake) {
            if (part.x === food.x && part.y === food.y) {
                placeFood();
                break;
            }
        }
    }

    function handleInput(e) {
        switch(e.key) {
            case 'ArrowUp': case 'w': case 'W': if (dy !== 1) { dx = 0; dy = -1; } break;
            case 'ArrowDown': case 's': case 'S': if (dy !== -1) { dx = 0; dy = 1; } break;
            case 'ArrowLeft': case 'a': case 'A': if (dx !== 1) { dx = -1; dy = 0; } break;
            case 'ArrowRight': case 'd': case 'D': if (dx !== -1) { dx = 1; dy = 0; } break;
        }
    }

    function gameOver() {
        isGameRunning = false;
        clearInterval(gameInterval);
        alert(`CONNECTION LOST. DATA COLLECTED: ${score}`);
        document.getElementById('menu').classList.remove('hidden');
        gameRoot.classList.add('hidden');
    }

    window.addEventListener('resize', () => {
        if (isGameRunning) {
            resizeCanvas();
            placeFood(); 
        }
    });

    // --- MENU.JS LOGIC START ---
    document.addEventListener('DOMContentLoaded', () => {
        const menu = document.getElementById('menu');
        const gameRoot = document.getElementById('game-root');
        const playBtn = document.getElementById('btn-play');
        const contactBtn = document.getElementById('btn-contact');
        const contactModal = document.getElementById('contact-modal');
        const modalCloseBtn = document.getElementById('modal-close');

        playBtn.addEventListener('click', () => {
            menu.classList.add('hidden');
            gameRoot.classList.remove('hidden');
            if (window.startGame) window.startGame();
        });

        contactBtn.addEventListener('click', (e) => {
            e.preventDefault();
            contactModal.classList.remove('hidden');
        });

        modalCloseBtn.addEventListener('click', () => {
            contactModal.classList.add('hidden');
        });

        window.addEventListener('click', (e) => {
            if (e.target === contactModal) {
                contactModal.classList.add('hidden');
            }
        });
    });
</script>
</body>
</html>
