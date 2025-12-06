// Simple snake game that exposes window.startGame() to be called from menu.
// Creates a canvas inside #game-root and runs a fixed-timestep loop.

(function () {
  const root = document.getElementById('game-root');

  // create canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'game-canvas';
  canvas.width = 360;
  canvas.height = 420;
  canvas.style.width = '360px';
  canvas.style.height = '420px';
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';
  canvas.style.background = '#000000'; // Dark Matrix background
  canvas.style.border = '2px solid #00ff00'; // Green border
  canvas.style.borderRadius = '8px';
  canvas.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.3)'; // Green glow
  root.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  // game config
  const config = {
    sizeCell: 16,
    sizeBerry: 4,
    UPS: 15 // logical updates per second
  };
  const TICK = 1000 / config.UPS;

  // Matrix colors
  const colors = {
    bg: '#000000',
    snakeHead: '#00ff00',
    snakeBody: '#008800',
    berry: '#ff0000',
    text: '#00ff00',
    grid: 'rgba(0, 255, 0, 0.1)'
  };

  // snake state
  const snake = {
    x: Math.floor((canvas.width / config.sizeCell) / 2) * config.sizeCell,
    y: Math.floor((canvas.height / config.sizeCell) / 2) * config.sizeCell,
    dx: config.sizeCell,
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

  // initialize first berry
  randomPositionBerry();
  drawInitial();

  // keyboard
  document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyW' || e.code === 'ArrowUp') {
      if (snake.dy === 0) { snake.dx = 0; snake.dy = -config.sizeCell; }
    } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
      if (snake.dx === 0) { snake.dx = -config.sizeCell; snake.dy = 0; }
    } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
      if (snake.dy === 0) { snake.dx = 0; snake.dy = config.sizeCell; }
    } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
      if (snake.dx === 0) { snake.dx = config.sizeCell; snake.dy = 0; }
    } else if (e.code === 'Escape') {
      // pause
      stopGame();
      const menuEl = document.getElementById('menu');
      if (menuEl) menuEl.classList.remove('hidden');
    }
  });

  // expose startGame globally so menu.js can call it
  window.startGame = startGame;

  function startGame() {
    // reset state
    score = 0;
    snake.x = Math.floor((canvas.width / config.sizeCell) / 2) * config.sizeCell;
    snake.y = Math.floor((canvas.height / config.sizeCell) / 2) * config.sizeCell;
    snake.tails = [];
    snake.maxTails = 3;
    snake.dx = config.sizeCell;
    snake.dy = 0;
    randomPositionBerry();

    // start loop
    running = true;
    lastTime = performance.now();
    accumulator = 0;
    requestAnimationFrame(loop);
    console.log('Game started (UPS=' + config.UPS + ')');
  }

  function stopGame() {
    running = false;
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

    snake.tails.unshift({ x: snake.x, y: snake.y });
    if (snake.tails.length > snake.maxTails) snake.tails.pop();

    const head = snake.tails[0];
    if (head.x === berry.x && head.y === berry.y) {
      snake.maxTails++;
      score++;
      randomPositionBerry();
    }

    for (let i = 1; i < snake.tails.length; i++) {
      if (head.x === snake.tails[i].x && head.y === snake.tails[i].y) {
        // game over
        gameOver();
        break;
      }
    }
  }

  function render() {
    // Clear with black background
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawGridDots();
    
    // Draw berry with glow effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = colors.berry;
    ctx.beginPath();
    ctx.fillStyle = colors.berry;
    ctx.arc(berry.x + config.sizeCell / 2, berry.y + config.sizeCell / 2, config.sizeBerry, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw snake with glow
    snake.tails.forEach((cell, idx) => {
      if (idx === 0) {
        // Head - brighter green with glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = colors.snakeHead;
        ctx.fillStyle = colors.snakeHead;
      } else {
        // Body - darker green
        ctx.shadowBlur = 5;
        ctx.shadowColor = colors.snakeBody;
        ctx.fillStyle = colors.snakeBody;
      }
      ctx.fillRect(cell.x + 1, cell.y + 1, config.sizeCell - 2, config.sizeCell - 2);
    });
    ctx.shadowBlur = 0;

    // Draw score with glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = colors.text;
    ctx.fillStyle = colors.text;
    ctx.font = "bold 16px 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.fillText("SCORE: " + score, 10, 20);
    ctx.shadowBlur = 0;
  }

  function drawGridDots() {
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

  function drawInitial() {
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGridDots();
  }

  function randomPositionBerry() {
    const cols = Math.floor(canvas.width / config.sizeCell);
    const rows = Math.floor(canvas.height / config.sizeCell);
    
    let attempts = 0;
    let validPosition = false;
    
    // Try to find a position not on snake's body
    while (!validPosition && attempts < 100) {
      berry.x = getRandomInt(0, cols) * config.sizeCell;
      berry.y = getRandomInt(0, rows) * config.sizeCell;
      
      validPosition = true;
      for (let segment of snake.tails) {
        if (segment.x === berry.x && segment.y === berry.y) {
          validPosition = false;
          break;
        }
      }
      attempts++;
    }
  }

  function collisionBorder() {
    if (snake.x < 0) snake.x = canvas.width - config.sizeCell;
    else if (snake.x >= canvas.width) snake.x = 0;
    if (snake.y < 0) snake.y = canvas.height - config.sizeCell;
    else if (snake.y >= canvas.height) snake.y = 0;
  }

  function gameOver() {
    stopGame();
    
    // Draw game over screen
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Game Over text with glow
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff0000';
    ctx.fillStyle = '#ff0000';
    ctx.font = "bold 32px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 40);
    
    // Final score
    ctx.shadowColor = colors.text;
    ctx.fillStyle = colors.text;
    ctx.font = "bold 24px 'Courier New', monospace";
    ctx.fillText("SCORE: " + score, canvas.width / 2, canvas.height / 2 + 10);
    
    // Instructions
    ctx.shadowBlur = 10;
    ctx.font = "16px 'Courier New', monospace";
    ctx.fillText("Press ESC for menu", canvas.width / 2, canvas.height / 2 + 50);
    ctx.shadowBlur = 0;
    
    // Show menu after delay
    setTimeout(() => {
      const menuEl = document.getElementById('menu');
      if (menuEl) menuEl.classList.remove('hidden');
    }, 1500);
  }

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }
})();
