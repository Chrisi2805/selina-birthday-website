(function () {
  const startScreen = document.getElementById('start-screen');
  const scene = document.getElementById('scene');
  const starCanvas = document.getElementById('star-canvas');
  const hint = document.getElementById('hint');
  const revealBtn = document.getElementById('reveal-btn');
  const coreGlow = document.getElementById('core-glow');
  const letterOverlay = document.getElementById('letter-overlay');
  const audio = document.getElementById('bg-music');

  // Keep the page working even when the optional music element/file is unavailable.
  function startMusic() {
    if (!audio) return;

    audio.volume = 0;
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(() => {
        let vol = 0;
        const fade = setInterval(() => {
          if (vol < 0.6) {
            vol = Math.min(0.6, vol + 0.02);
            audio.volume = vol;
          } else {
            clearInterval(fade);
          }
        }, 100);
      }).catch(() => {
        // Autoplay can be blocked by the browser; the rest of the experience still works.
      });
    }
  }

  if (startScreen) {
    startScreen.addEventListener('click', function start() {
      this.style.opacity = '0';
      setTimeout(() => { this.style.display = 'none'; }, 2000);

      startMusic();

      if (scene) scene.style.opacity = '1';
      if (starCanvas) starCanvas.style.opacity = '1';
      if (hint) setTimeout(() => { hint.style.opacity = '1'; }, 1000);
      if (revealBtn) setTimeout(() => { revealBtn.classList.add('visible'); }, 3000);
    }, { once: true });
  }

  if (revealBtn) {
    revealBtn.addEventListener('click', function () {
      this.classList.remove('visible');
      if (hint) hint.style.opacity = '0';
      if (window.heartScene) window.heartScene.explode();
      if (coreGlow) coreGlow.style.opacity = '0';
      if (letterOverlay) {
        setTimeout(() => { letterOverlay.classList.add('open'); }, 1200);
      }
    }, { once: true });
  }
})();
