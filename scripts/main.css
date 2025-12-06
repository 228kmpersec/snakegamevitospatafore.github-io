// Simple snake game that exposes window.startGame() to be called from menu.
// Creates a canvas inside #game-root and runs a fixed-timestep loop.

(function () {
  const root = document.getElementById('game-root');

  // create canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'game-canvas';
  // choose an easy-to-fit size; CSS will not stretch canvas, so set attributes and style via JS
  canvas.width = 360;
  canvas.height = 420;
  canvas.style.width = '360px';
  canvas.style.height = '420px';
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';
  canvas.style.background = '#ffffff';
  root.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  // game config
  const config = {
    sizeCell: 16,
    sizeBerry: 4,
    UPS: 15 // logical updates per second (change to 60 if you want faster)
  };
  const TICK = 1000 / config.UPS;

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
        stopGame();
        const menuEl = document.getElementById('menu');
        if (menuEl) menuEl.classList.remove('hidden');
        break;
      }
    }
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGridDots();
    // berry
    ctx.beginPath();
    ctx.fillStyle = "#000";
    ctx.arc(berry.x + config.sizeCell / 2, berry.y + config.sizeCell / 2, config.sizeBerry, 0, Math.PI * 2);
    ctx.fill();

    // snake
    snake.tails.forEach((cell, idx) => {
      ctx.fillStyle = idx === 0 ? "#000" : "#222";
      ctx.fillRect(cell.x, cell.y, config.sizeCell, config.sizeCell);
    });

    // small score
    ctx.fillStyle = "#000";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Score: " + score, 8, 14);
  }

  function drawGridDots() {
    const gap = 10;
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    const r = 1.2;
    for (let y = gap; y < canvas.height; y += gap) {
      for (let x = gap; x < canvas.width; x += gap) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawInitial() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGridDots();
  }

  function randomPositionBerry() {
    const cols = Math.floor(canvas.width / config.sizeCell);
    const rows = Math.floor(canvas.height / config.sizeCell);
    berry.x = getRandomInt(0, cols) * config.sizeCell;
    berry.y = getRandomInt(0, rows) * config.sizeCell;
  }

  function collisionBorder() {
    if (snake.x < 0) snake.x = canvas.width - config.sizeCell;
    else if (snake.x >= canvas.width) snake.x = 0;
    if (snake.y < 0) snake.y = canvas.height - config.sizeCell;
    else if (snake.y >= canvas.height) snake.y = 0;
  }

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }
})();
