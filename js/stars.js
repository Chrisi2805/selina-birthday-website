(() => {
  const canvas = document.getElementById('star-canvas');
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = 1, stars = [];

  function resize() {
    dpr = window.devicePixelRatio || 1;
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = Array.from({ length: Math.min(180, Math.floor((w * h) / 9000)) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.35 + 0.25,
      a: Math.random(),
      s: Math.random() * 0.012 + 0.002
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    for (const star of stars) {
      star.a += star.s;
      if (star.a > 1 || star.a < 0) star.s = -star.s;
      star.y -= 0.1;
      if (star.y < 0) star.y = h;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${Math.abs(star.a)})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  resize();
  draw();
  addEventListener('resize', resize, { passive: true });
})();