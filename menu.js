// Simple menu script: hides menu on Play click and calls startGame() if defined.

(function () {
  const menuEl = document.getElementById('menu');
  const btn = document.getElementById('btn-play');

  if (!menuEl || !btn) return;

  function beginGame() {
    btn.disabled = true;

    // If there's a global startGame function, call it
    if (typeof window.startGame === 'function') {
      try {
        window.startGame();
      } catch (err) {
        console.error('Error calling startGame():', err);
      }
      menuEl.classList.add('hidden');
      return;
    }

    // Otherwise hide menu and show a temporary message
    menuEl.classList.add('hidden');

    const msg = document.createElement('div');
    msg.className = 'starting-msg';
    msg.textContent = 'Game starting...';
    document.body.appendChild(msg);

    setTimeout(() => {
      msg.remove();
      btn.disabled = false;
    }, 1200);
  }

  btn.addEventListener('click', beginGame);

  // support keyboard (Enter / Space)
  btn.addEventListener('keydown', (e) => {
    if (e.code === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      beginGame();
    }
  });

  // allow pressing Enter anywhere to start
  document.addEventListener('keydown', (e) => {
    if ((e.code === 'Enter' || e.code === 'Space') && !btn.disabled && !menuEl.classList.contains('hidden')) {
      beginGame();
    }
  });
})();
