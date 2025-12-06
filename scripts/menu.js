// Simple menu script: hides menu on Play click and calls startGame() if defined.
(function () {
  const menuEl = document.getElementById('menu');
  const btn = document.getElementById('btn-play');
  const gameRoot = document.getElementById('game-root');
  
  if (!menuEl || !btn) {
    console.warn('Menu elements not found');
    return;
  }

  let isGameRunning = false;

  function beginGame() {
    // Prevent multiple clicks
    if (isGameRunning) return;
    
    isGameRunning = true;
    btn.disabled = true;

    // If there's a global startGame function, call it
    if (typeof window.startGame === 'function') {
      try {
        // Hide menu immediately
        menuEl.classList.add('hidden');
        
        // Show game root
        if (gameRoot) {
          gameRoot.classList.remove('hidden');
        }
        
        // Optional: show starting message
        showStartingMessage();
        
        // Start the game
        window.startGame();
        
        console.log('Game started successfully');
      } catch (err) {
        console.error('Error calling startGame():', err);
        // Reset if there's an error
        resetMenu();
      }
    } else {
      // Fallback if startGame doesn't exist yet
      console.warn('window.startGame is not defined');
      menuEl.classList.add('hidden');
      showStartingMessage('Waiting for game to load...');
      
      setTimeout(() => {
        resetMenu();
      }, 2000);
    }
  }

  function showStartingMessage(text = 'Game starting...') {
    const msg = document.createElement('div');
    msg.className = 'starting-msg';
    msg.textContent = text;
    document.body.appendChild(msg);
    
    // Remove message after animation
    setTimeout(() => {
      msg.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => msg.remove(), 300);
    }, 1200);
  }

  function resetMenu() {
    isGameRunning = false;
    btn.disabled = false;
    menuEl.classList.remove('hidden');
    if (gameRoot) {
      gameRoot.classList.add('hidden');
    }
  }

  // Expose reset function globally so game can call it on game over
  window.resetMenu = resetMenu;

  // Click handler
  btn.addEventListener('click', beginGame);

  // Keyboard support on button
  btn.addEventListener('keydown', (e) => {
    if (e.code === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      beginGame();
    }
  });

  // Global keyboard shortcut (Enter/Space to start)
  document.addEventListener('keydown', (e) => {
    if ((e.code === 'Enter' || e.code === 'Space') && 
        !btn.disabled && 
        !menuEl.classList.contains('hidden')) {
      e.preventDefault();
      beginGame();
    }
  });

  // Focus button on page load for better UX
  window.addEventListener('load', () => {
    if (!menuEl.classList.contains('hidden')) {
      btn.focus();
    }
  });

  console.log('Menu script initialized');
})();
