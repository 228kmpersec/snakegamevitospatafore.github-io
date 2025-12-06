// MENU LOGIC
(function() {
    const menuEl = document.getElementById('menu');
    const btnPlay = document.getElementById('btn-play');
    const gameRoot = document.getElementById('game-root');
    const btnContact = document.getElementById('btn-contact');
    const modal = document.getElementById('contact-modal');
    const modalClose = document.getElementById('modal-close');
    const btnMenu = document.getElementById('btn-menu');

    // Start Game
    function startGame() {
        menuEl.classList.add('hidden');
        gameRoot.classList.remove('hidden');
        if (window.initSnakeGame) window.initSnakeGame();
    }

    // Return to Menu
    function showMenu() {
        gameRoot.classList.add('hidden');
        menuEl.classList.remove('hidden');
        if (window.stopSnakeGame) window.stopSnakeGame();
    }

    if (btnPlay) {
        btnPlay.addEventListener('click', startGame);
    }

    if (btnMenu) {
        btnMenu.addEventListener('click', showMenu);
    }

    // Modal Logic
    if (btnContact && modal) {
        btnContact.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.remove('hidden');
        });
    }

    if (modalClose && modal) {
        modalClose.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    // Close modal on click outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    // Expose for Game Over
    window.returnToMenu = showMenu;

})();
