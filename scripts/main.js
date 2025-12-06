/* ====== CYBERPUNK NOIR THEME 📼⬛ ====== */

:root {
  --bg: #050505;
  --text: #cccccc;
  --accent: #ffffff;
  --btn-bg: #000000;
  --btn-border: #ffffff;
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

/* Эффект цифровой сетки */
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

/* Виньетка */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  background: radial-gradient(circle, transparent 60%, black 100%);
  pointer-events: none;
  z-index: 2;
}

/* Menu */
.menu {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.95);
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.menu-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  padding: 60px;
  border: 2px solid var(--accent);
  background: #000;
  box-shadow: 10px 10px 0px #222;
  min-width: 320px;
  position: relative; /* Важно для z-index контекста */
}

.menu-title {
  font-size: clamp(48px, 10vw, 86px);
  font-weight: 900;
  letter-spacing: 12px;
  margin: 0;
  color: var(--accent);
  text-transform: uppercase;
  text-shadow: 4px 4px 0px #333;
  position: relative;
  z-index: 3;
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

/* Wrapper кнопки - ВИТО ТУТ */
.play-button-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

/* === ВОЗВРАЩЕНИЕ ВИТО === */
.play-button-wrapper::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.4);
  width: 800px; /* Размер фото */
  height: 800px;
  background-image: url('../images/vito.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0;
  z-index: -1; /* За кнопкой */
  pointer-events: none;
  
  /* ЧБ фильтр под стиль Нуар, но фото на месте */
  filter: grayscale(100%) contrast(150%) brightness(0.9);
  
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* При наведении Вито появляется */
.play-button-wrapper:hover::before {
  opacity: 0.6; 
  transform: translate(-50%, -50%) scale(1.1);
}

/* Play button */
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
  box-shadow: 8px 8px 0px #333;
  text-transform: uppercase;
  font-family: 'Courier New', monospace;
  position: relative;
  z-index: 2;
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

/* Nav */
.menu-nav {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
  z-index: 3;
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

/* Modal */
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
  position: relative;
}

.modal-content h2 {
  border-bottom: 2px solid var(--accent);
  padding-bottom: 10px;
  margin-top: 0;
  text-transform: uppercase;
  color: var(--accent);
}

.modal-content p {
  margin: 15px 0;
  font-size: 18px;
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

/* Game root */
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
  display: block;
}

.hidden {
  display: none !important;
}
