(function () {
  const canvas = document.getElementById('star-canvas');
  const ctx = canvas.getContext('2d');
  let width, height, dpr;
  let stars = [];

  function resize() {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  const STAR_COUNT = 200;
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({ x: Math.random() * width, y: Math.random() * height, radius: Math.random() * 1.5, alpha: Math.random(), speed: (Math.random() * 0.02) + 0.005 });
  }

  function drawStars() {
    ctx.clearRect(0, 0, width, height);
    for (const s of stars) {
      s.alpha += s.speed;
      if (s.alpha > 1 || s.alpha < 0) s.speed = -s.speed;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(s.alpha)})`;
      ctx.fill();
      s.y -= 0.2;
      if (s.y < 0) s.y = height;
    }
    requestAnimationFrame(drawStars);
  }
  requestAnimationFrame(drawStars);
  window.starfield = { getSize: () => ({ width, height }) };
})();
