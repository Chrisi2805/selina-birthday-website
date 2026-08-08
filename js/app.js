(function () {
  const startScreen = document.getElementById('start-screen');
  const scene = document.getElementById('scene');
  const starCanvas = document.getElementById('star-canvas');
  const hint = document.getElementById('hint');
  const revealBtn = document.getElementById('reveal-btn');
  const coreGlow = document.getElementById('core-glow');
  const letterOverlay = document.getElementById('letter-overlay');
  const audio = document.getElementById('bg-music');

  startScreen.addEventListener('click', function start() {
    this.style.opacity = '0';
    setTimeout(() => { this.style.display = 'none'; }, 2000);

    audio.volume = 0;
    const playPromise = audio.play();
    if (playPromise && playPromise.then) {
      playPromise.then(() => {
        let vol = 0;
        const fade = setInterval(() => {
          if (vol < 0.6) { vol += 0.02; audio.volume = vol; }
          else clearInterval(fade);
        }, 100);
      }).catch(() => {});
    }

    scene.style.opacity = '1';
    starCanvas.style.opacity = '1';
    setTimeout(() => { hint.style.opacity = '1'; }, 1000);
    setTimeout(() => { revealBtn.classList.add('visible'); }, 3000);
  }, { once: true });

  revealBtn.addEventListener('click', function () {
    this.classList.remove('visible');
    hint.style.opacity = '0';
    if (window.heartScene) window.heartScene.explode();
    coreGlow.style.opacity = '0';
    setTimeout(() => { letterOverlay.classList.add('open'); }, 1200);
  }, { once: true });
})();
