/* ====== BLOOD MOON THEME 🌙🔴 ====== */
:root{
  --bg: linear-gradient(135deg, #1a0a0f 0%, #2d1520 50%, #4a1f33 100%);
  --text: #ff4d6d;
  --accent: #ff4d6d;
  --btn-bg: rgba(255, 77, 109, 0.1);
  --btn-border: #ff4d6d;
  --glow: 0 0 25px rgba(255, 77, 109, 0.8), 0 0 50px rgba(200, 50, 100, 0.4);
}

*{
  box-sizing:border-box;
}

html,body{
  height:100%;
  margin:0;
  font-family:'Courier New', monospace, Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}

body{
  background: var(--bg);
  background-attachment: fixed;
  color:var(--text);
  overflow-x: hidden;
  min-height: 100vh;
}

/* Анімований фон з червоними відтінками */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(255, 77, 109, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(200, 50, 100, 0.08) 0%, transparent 50%);
  animation: bgPulse 8s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes bgPulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* Сканлайн ефект з червоним відтінком */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    rgba(255, 77, 109, 0.03) 1px,
    transparent 2px,
    transparent 4px
  );
  pointer-events: none;
  opacity: 0.5;
  z-index: 1;
}

/* Fullscreen centered menu */
.menu{
  position:fixed;
  inset:0;
  display:flex;
  align-items:center;
  justify-content:center;
  background: transparent;
  z-index:1000;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Menu Container */
.menu-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  padding: 40px;
  position: relative;
}

/* Фонове зображення за кнопкою - Віто вилазить при hover! */
.menu-container::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.7);
  width: 600px;
  height: 600px;
  background-image: url('../images/vito.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0;
  z-index: -1;
  pointer-events: none;
  filter: grayscale(100%) brightness(0.8) sepia(100%) hue-rotate(310deg) saturate(400%);
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Віто вилазить коли наводиш на кнопку! */
.play-button:hover ~ .menu-container::before,
.menu-container:has(.play-button:hover)::before {
  opacity: 0.25;
  transform: translate(-50%, -50%) scale(1.1);
}

/* Menu Title "Snake" */
.menu-title {
  font-size: clamp(48px, 12vw, 96px);
  font-weight: 900;
  letter-spacing: 8px;
  margin: 0;
  color: var(--accent);
  text-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
  animation: titlePulse 3s ease-in-out infinite;
}

@keyframes titlePulse {
  0%, 100% { 
    text-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
  }
  50% { 
    text-shadow: 0 0 30px currentColor, 0 0 60px currentColor, 0 0 80px rgba(255, 77, 109, 0.5);
  }
}

/* Big play button */
.play-button{
  width: min(68vw, 420px);
  max-width: 420px;
  height: min(20vh, 140px);
  max-height: 140px;
  background: var(--btn-bg);
  color: var(--accent);
  border: 4px solid var(--btn-border);
  font-weight: 900;
  font-size: clamp(32px, 6vw, 52px);
  letter-spacing: 6px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  transition: all .3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--glow), 0 12px 40px rgba(0,0,0,0.5);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  text-shadow: 0 0 10px currentColor;
  animation: pulse 2s ease-in-out infinite;
  z-index: 1;
}

/* Анімований градієнт на кнопці */
.play-button::before {
  content: '';
  position: absolute;
  inset: -100%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 77, 109, 0.2) 50%,
    transparent 70%
  );
  animation: shimmer 4s infinite;
  z-index: -1;
}

@keyframes shimmer {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

/* Пульсація */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

/* Hover / active */
.play-button:hover{ 
  transform: translateY(-8px) scale(1.05);
  box-shadow: var(--glow), 0 20px 60px rgba(255, 77, 109, 0.4);
  filter: brightness(1.2);
  animation: none;
}

.play-button:active{ 
  transform: translateY(-2px) scale(1.02); 
  box-shadow: var(--glow), 0 10px 30px rgba(255, 77, 109, 0.4); 
}

/* Menu Navigation */
.menu-nav {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
  justify-content: center;
}

.menu-link {
  color: var(--text);
  text-decoration: none;
  font-size: clamp(18px, 3vw, 24px);
  font-weight: 700;
  letter-spacing: 2px;
  padding: 12px 24px;
  border: 2px solid transparent;
  border-radius: 6px;
  transition: all 0.3s ease;
  position: relative;
  text-shadow: 0 0 5px currentColor;
}

.menu-link::before {
  content: '';
  position: absolute;
  inset: 0;
  border: 2px solid var(--btn-border);
  border-radius: 6px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.menu-link:hover {
  color: var(--accent);
  text-shadow: 0 0 15px currentColor;
  transform: translateY(-2px);
}

.menu-link:hover::before {
  opacity: 1;
  box-shadow: var(--glow);
}

.menu-link:active {
  transform: translateY(0);
}

/* Contact Modal */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: var(--btn-bg);
  backdrop-filter: blur(20px);
  border: 2px solid var(--btn-border);
  border-radius: 12px;
  padding: 40px;
  max-width: 500px;
  width: 90%;
  box-shadow: var(--glow), 0 20px 60px rgba(0, 0, 0, 0.5);
  position: relative;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-content h2 {
  color: var(--accent);
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 32px;
  text-shadow: 0 0 10px currentColor;
}

.modal-content p {
  margin: 15px 0;
  font-size: 18px;
}

.modal-content a {
  color: var(--accent);
  text-decoration: none;
  text-shadow: 0 0 5px currentColor;
  transition: all 0.3s ease;
}

.modal-content a:hover {
  text-shadow: 0 0 15px currentColor;
  filter: brightness(1.2);
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  color: var(--text);
  font-size: 36px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;
  line-height: 1;
}

.modal-close:hover {
  background: rgba(255, 77, 109, 0.2);
  color: #ff4d6d;
  text-shadow: 0 0 10px #ff4d6d;
}

/* Hidden helper */
.hidden{ 
  display:none !important; 
}

/* placeholder area where game canvas will be created */
.game-root{ 
  position:relative; 
  min-height:100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 10;
}

/* Стилі для canvas */
.game-root canvas {
  display: block;
  margin: 0 auto;
  box-shadow: var(--glow), 0 8px 32px rgba(0, 0, 0, 0.5);
}

/* small starting message */
.starting-msg{
  position:fixed;
  top:20px;
  left:50%;
  transform:translateX(-50%);
  background: var(--btn-bg);
  backdrop-filter: blur(10px);
  padding:12px 24px;
  border-radius:6px;
  font-weight:600;
  border: 2px solid var(--btn-border);
  box-shadow: var(--glow);
  color: var(--text);
  animation: slideDown 0.5s ease;
  z-index: 1001;
}

@keyframes slideDown {
  from {
    transform: translateX(-50%) translateY(-100px);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

/* Адаптивність для маленьких екранів */
@media (max-width: 480px) {
  .menu-container {
    gap: 30px;
    padding: 20px;
  }

  .menu-title {
    letter-spacing: 4px;
  }

  .play-button {
    font-size: clamp(24px, 7vw, 40px);
    letter-spacing: 3px;
  }

  .menu-nav {
    gap: 20px;
  }

  .menu-link {
    font-size: 16px;
    padding: 10px 20px;
  }
  
  .game-root {
    padding: 10px;
  }
  
  .starting-msg {
    font-size: 14px;
    padding: 10px 20px;
  }

  .modal-content {
    padding: 30px 20px;
  }
}

/* Додаткові утиліти */
.fade-in {
  animation: fadeIn 0.5s ease;
}

.fade-out {
  animation: fadeOut 0.5s ease;
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
