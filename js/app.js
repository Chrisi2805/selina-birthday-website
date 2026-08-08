(() => {
  const startBtn = document.getElementById('start-btn');
  const revealBtn = document.getElementById('reveal-btn');
  const scene = document.getElementById('scene');
  const hint = document.getElementById('hint');
  const coreGlow = document.getElementById('core-glow');
  const letterOverlay = document.getElementById('letter-overlay');
  const music = document.getElementById('bg-music');

  function start() {
    document.body.classList.add('opened');
    music.volume = 0;
    music.play().then(() => {
      let v = 0;
      const id = setInterval(() => {
        v = Math.min(.7, v + .03);
        music.volume = v;
        if (v >= .7) clearInterval(id);
      }, 90);
    }).catch(() => {});
    scene.style.opacity = '1';
    setTimeout(() => hint.style.opacity = '1', 700);
    setTimeout(() => revealBtn.classList.add('visible'), 1800);
  }

  startBtn.addEventListener('click', start, { once: true });
  startBtn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') start();
  }, { once: true });

  revealBtn.addEventListener('click', () => {
    revealBtn.classList.remove('visible');
    hint.style.opacity = '0';
    coreGlow.style.opacity = '0';
    if (window.heartScene) window.heartScene.explode();
    setTimeout(() => letterOverlay.classList.add('open'), 1000);
  });
})();