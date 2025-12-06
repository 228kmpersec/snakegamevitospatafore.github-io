// Snake game with Blood Moon theme
// Creates a canvas inside #game-root and runs a fixed-timestep loop.

(function () {
  const root = document.getElementById('game-root');
  
  if (!root) {
    console.error('game-root element not found');
    return;
  }

  let canvas = null;
  let ctx = null;
  let keyboardListener = null;

  // game config
  const config = {
    sizeCell: 16,
    sizeBerry: 4,
    UPS: 15, // logical updates per second
    debug: false // Встанови true щоб бачити координати
  };
  const TICK = 1000 / config.UPS;

  // Blood Moon colors 🌙🔴
  const colors = {
    bg: '#1a0a0f', // Dark burgundy background
    snakeHead: '#ff4d6d', // Bright red-pink
    snakeBody: '#c43d5a', // Darker red
    berry: '#ff0040', // Bright crimson
    text: '#ff4d6d', // Red-pink text
    grid: 'rgba(255, 77, 109, 0.1)' // Subtle red grid
  };

  // snake state
  let snake = {
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    tails: [],
    maxTails: 3
  };

  let berry = { x: 0, y: 0 };
  let score = 0;

  // loop control
  let lastTime = 0;
  let accumulator = 0;
  let running = false;
  let gameInitialized = false;

  // expose startGame globally so menu.js can call it
  window.startGame = startGame;

  function initCanvas() {
    // Remove old canvas if exists
    if (canvas) {
      canvas.remove();
    }

    // Create new canvas with Blood Moon styling
    canvas = document.createElement('canvas');
    canvas.id = 'game-canvas';
    canvas.width = 360;
    canvas.height = 420;
    canvas.style.width = '360px';
    canvas.style.height = '420px';
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.background = colors.bg;
    canvas.style.border = '2px solid #ff4d6d';
    canvas.style.borderRadius = '8px';
    canvas.style.boxShadow = '0 0 25px rgba(255, 77, 109, 0.5), 0 8px 32px rgba(0, 0, 0, 0.5)';
    root.appendChild(canvas);

    ctx = canvas.getContext('2d');
    gameInitialized = true;
  }

  function setupKeyboard() {
    // Remove old listener if exists
    if (keyboardListener) {
      document.removeEventListener('keydown', keyboardListener);
    }

    // Create new listener
    keyboardListener = (e) => {
      // Only handle keys when game is running
      if (!running) return;

      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        if (snake.dy === 0) { 
          snake.dx = 0; 
          snake.dy = -config.sizeCell; 
          e.preventDefault();
        }
      } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        if (snake.dx === 0) { 
          snake.dx = -config.sizeCell; 
          snake.dy = 0; 
          e.preventDefault();
        }
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        if (snake.dy === 0) { 
          snake.dx = 0; 
          snake.dy = config.sizeCell; 
          e.preventDefault();
        }
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        if (snake.dx === 0) { 
          snake.dx = config.sizeCell; 
          snake.dy = 0; 
          e.preventDefault();
        }
      } else if (e.code === 'Escape') {
        e.preventDefault();
        pauseGame();
      }
    };

    document.addEventListener('keydown', keyboardListener);
  }

  function startGame() {
    // Prevent multiple game instances
    if (running) {
      console.warn('Game already running');
      return;
    }

    // Initialize canvas if not done yet
    if (!gameInitialized) {
      initCanvas();
    }

    // Setup keyboard controls
    setupKeyboard();

    // Reset state
    score = 0;
    snake.x = Math.floor((canvas.width / config.sizeCell) / 2) * config.sizeCell;
    snake.y = Math.floor((canvas.height / config.sizeCell) / 2) * config.sizeCell;
    snake.tails = [];
    snake.maxTails = 3;
    snake.dx = config.sizeCell;
    snake.dy = 0;
    
    randomPositionBerry();

    // Start loop
    running = true;
    lastTime = performance.now();
    accumulator = 0;
    requestAnimationFrame(loop);
    
    console.log('🌙 Blood Moon Snake started! (UPS=' + config.UPS + ')');
  }

  function stopGame() {
    running = false;
  }

  function pauseGame() {
    stopGame();
    
    // Call resetMenu to properly show menu and hide game
    if (typeof window.resetMenu === 'function') {
      window.resetMenu();
    } else {
      // Fallback if resetMenu doesn't exist
      const menuEl = document.getElementById('menu');
      if (menuEl) menuEl.classList.remove('hidden');
    }
  }

  function loop(time) {
    if (!running) return;
    
    let dt = time - lastTime;
    lastTime = time;

    if (dt > 1000) dt = 1000;
    accumulator += dt;

    while (accumulator >= TICK) {
      update();
      accumulator -= TICK;
    }

    render();
    requestAnimationFrame(loop);
  }

  function update() {
    snake.x += snake.dx;
    snake.y += snake.dy;

    collisionBorder();

    // Перевірка зіткнення з ягодою ПЕРЕД додаванням голови
    let ateFood = false;
    if (snake.x === berry.x && snake.y === berry.y) {
      snake.maxTails++;
      score++;
      ateFood = true;
      randomPositionBerry();
    }

    snake.tails.unshift({ x: snake.x, y: snake.y });
    
    // Видаляємо хвіст тільки якщо НЕ з'їли ягоду
    if (!ateFood && snake.tails.length > snake.maxTails) {
      snake.tails.pop();
    }

    // Перевірка самопоїдання (починаємо з індексу 1, щоб не перевіряти голову з собою)
    const head = snake.tails[0];
    for (let i = 1; i < snake.tails.length; i++) {
      if (head.x === snake.tails[i].x && head.y === snake.tails[i].y) {
        // game over
        gameOver();
        break;
      }
    }
  }

  function render() {
    if (!ctx) return;

    // Clear with dark background
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawGridDots();
    
    // Draw berry with crimson glow effect
    ctx.shadowBlur = 20;
    ctx.shadowColor = colors.berry;
    ctx.beginPath();
    ctx.fillStyle = colors.berry;
    ctx.arc(berry.x + config.sizeCell / 2, berry.y + config.sizeCell / 2, config.sizeBerry, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw snake with red glow
    snake.tails.forEach((cell, idx) => {
      if (idx === 0) {
        // Head - bright red-pink with glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = colors.snakeHead;
        ctx.fillStyle = colors.snakeHead;
      } else {
        // Body - darker red
        ctx.shadowBlur = 8;
        ctx.shadowColor = colors.snakeBody;
        ctx.fillStyle = colors.snakeBody;
      }
      ctx.fillRect(cell.x + 1, cell.y + 1, config.sizeCell - 2, config.sizeCell - 2);
    });
    ctx.shadowBlur = 0;

    // Draw score with red glow
    ctx.shadowBlur = 12;
    ctx.shadowColor = colors.text;
    ctx.fillStyle = colors.text;
    ctx.font = "bold 16px 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.fillText("SCORE: " + score, 10, 20);
    
    // Debug info (якщо увімкнено)
    if (config.debug) {
      ctx.font = "12px 'Courier New', monospace";
      ctx.fillText("Head: (" + snake.x + ", " + snake.y + ")", 10, 40);
      ctx.fillText("Berry: (" + berry.x + ", " + berry.y + ")", 10, 55);
      ctx.fillText("Distance: " + Math.abs(snake.x - berry.x) + ", " + Math.abs(snake.y - berry.y), 10, 70);
    }
    
    ctx.shadowBlur = 0;
  }

  function drawGridDots() {
    if (!ctx) return;
    
    const gap = 20;
    ctx.fillStyle = colors.grid;
    const r = 1;
    for (let y = gap; y < canvas.height; y += gap) {
      for (let x = gap; x < canvas.width; x += gap) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function randomPositionBerry() {
    if (!canvas) return;
    
    const cols = Math.floor(canvas.width / config.sizeCell);
    const rows = Math.floor(canvas.height / config.sizeCell);
    
    let attempts = 0;
    let validPosition = false;
    
    // Try to find a position not on snake's body AND not on current head position
    while (!validPosition && attempts < 100) {
      berry.x = getRandomInt(0, cols) * config.sizeCell;
      berry.y = getRandomInt(0, rows) * config.sizeCell;
      
      validPosition = true;
      
      // Перевірка чи не на тілі змійки
      for (let segment of snake.tails) {
        if (segment.x === berry.x && segment.y === berry.y) {
          validPosition = false;
          break;
        }
      }
      
      // Перевірка чи не на поточній позиції голови
      if (validPosition && berry.x === snake.x && berry.y === snake.y) {
        validPosition = false;
      }
      
      attempts++;
    }
    
    // Fallback: якщо не знайшли місце за 100 спроб, ставимо в рандомне місце
    if (!validPosition) {
      console.warn('Could not find valid berry position, placing randomly');
      berry.x = getRandomInt(0, cols) * config.sizeCell;
      berry.y = getRandomInt(0, rows) * config.sizeCell;
    }
  }

  function collisionBorder() {
    if (!canvas) return;
    
    if (snake.x < 0) snake.x = canvas.width - config.sizeCell;
    else if (snake.x >= canvas.width) snake.x = 0;
    if (snake.y < 0) snake.y = canvas.height - config.sizeCell;
    else if (snake.y >= canvas.height) snake.y = 0;
  }

  function gameOver() {
    stopGame();
    
    if (!ctx || !canvas) return;
    
    // Draw game over screen with Blood Moon colors
    ctx.fillStyle = 'rgba(26, 10, 15, 0.92)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Game Over text with red glow
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#ff0040';
    ctx.fillStyle = '#ff0040';
    ctx.font = "bold 32px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 40);
    
    // Final score
    ctx.shadowColor = colors.text;
    ctx.fillStyle = colors.text;
    ctx.font = "bold 24px 'Courier New', monospace";
    ctx.fillText("SCORE: " + score, canvas.width / 2, canvas.height / 2 + 10);
    
    // Instructions
    ctx.shadowBlur = 12;
    ctx.font = "16px 'Courier New', monospace";
    ctx.fillText("Returning to menu...", canvas.width / 2, canvas.height / 2 + 50);
    ctx.shadowBlur = 0;
    
    // Use resetMenu to properly reset everything
    setTimeout(() => {
      if (typeof window.resetMenu === 'function') {
        window.resetMenu();
      } else {
        // Fallback
        const menuEl = document.getElementById('menu');
        if (menuEl) menuEl.classList.remove('hidden');
      }
    }, 1500);
  }

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  console.log('🌙 Blood Moon Snake game initialized');
})();
