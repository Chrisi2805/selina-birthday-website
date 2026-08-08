(() => {
  const canvas = document.getElementById('heart-canvas');
  const ctx = canvas.getContext('2d');
  const colors = ['#ff5db1', '#65f4ff', '#ff9fce', '#b967ff', '#ffffff'];
  let w = 0, h = 0, dpr = 1, cx = 0, cy = 0, radius = 1;
  let yaw = 0.25, pitch = -0.18, dragging = false, lastX = 0, lastY = 0;
  let autoRotate = true, exploding = false, explodeStart = 0;
  const points = [];
  const words = ['SELINA', 'LIEBE', 'GLÜCK', 'MAGIE', 'WUNDER', 'HERZ', 'ZUSAMMEN', 'FÜR IMMER'];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = innerWidth;
    h = innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = w / 2;
    cy = h / 2;
    radius = Math.min(w, h) * (w < 720 ? 0.24 : 0.3);
  }

  function heart2D(t) {
    return {
      x: 16 * Math.sin(t) ** 3 / 18,
      y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 18
    };
  }

  function createHeart() {
    points.length = 0;
    const layers = 18;
    const samples = 130;
    for (let layer = 0; layer < layers; layer++) {
      const depth = (layer / (layers - 1) - 0.5) * 0.9;
      for (let i = 0; i < samples; i++) {
        const t = (i / samples) * Math.PI * 2;
        const outline = heart2D(t);
        const fill = Math.sqrt(Math.random());
        points.push({
          x: outline.x * fill,
          y: outline.y * fill,
          z: depth + (Math.random() - 0.5) * 0.035,
          color: colors[(i + layer) % colors.length],
          size: 0.7 + Math.random() * 1.5,
          word: i % 19 === 0 ? words[(i + layer) % words.length] : ''
        });
      }
    }
  }

  function rotate(point) {
    const cyaw = Math.cos(yaw), syaw = Math.sin(yaw);
    const cpitch = Math.cos(pitch), spitch = Math.sin(pitch);
    const x1 = point.x * cyaw - point.z * syaw;
    const z1 = point.x * syaw + point.z * cyaw;
    return {
      x: x1,
      y: point.y * cpitch - z1 * spitch,
      z: point.y * spitch + z1 * cpitch
    };
  }

  function project(point, spread = 1) {
    const focal = 2.8;
    const depth = focal / (focal - point.z);
    return {
      x: cx + point.x * radius * depth * spread,
      y: cy + point.y * radius * depth * spread,
      scale: depth
    };
  }

  function render(now) {
    ctx.clearRect(0, 0, w, h);
    const progress = exploding ? Math.min(1, (now - explodeStart) / 1100) : 0;
    const spread = exploding ? 1 + progress * 5 : 1 + Math.sin(now * 0.0015) * 0.018;
    const opacity = 1 - progress;

    ctx.globalCompositeOperation = 'lighter';
    const projected = [];
    for (const point of points) {
      const rotated = rotate({ x: point.x * spread, y: point.y * spread, z: point.z });
      const screen = project(rotated);
      projected.push({ point, screen, rotated });
    }
    projected.sort((a, b) => a.rotated.z - b.rotated.z);

    for (const item of projected) {
      const { point, screen } = item;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, Math.max(.7, point.size * screen.scale), 0, Math.PI * 2);
      ctx.fillStyle = point.color;
      ctx.globalAlpha = opacity * Math.max(.14, Math.min(1, screen.scale * .65));
      ctx.shadowBlur = 10 * screen.scale;
      ctx.shadowColor = point.color;
      ctx.fill();
      if (point.word && screen.scale > .75 && !exploding) {
        ctx.font = `700 ${Math.max(8, 9 * screen.scale)}px DM Sans, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = .72 * opacity;
        ctx.fillText(point.word, screen.x, screen.y);
      }
    }

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    if (autoRotate && !dragging && !exploding) yaw += .0035;
    requestAnimationFrame(render);
  }

  function begin(x, y) {
    dragging = true;
    autoRotate = false;
    lastX = x;
    lastY = y;
  }

  function move(x, y) {
    if (!dragging) return;
    const dx = x - lastX;
    const dy = y - lastY;
    yaw += dx * .006;
    pitch += dy * .006;
    pitch = Math.max(-1.15, Math.min(1.15, pitch));
    lastX = x;
    lastY = y;
  }

  function end() {
    dragging = false;
    autoRotate = true;
  }

  resize();
  createHeart();
  requestAnimationFrame(render);
  addEventListener('resize', resize, { passive: true });
  addEventListener('pointerdown', e => { if (e.target.tagName !== 'BUTTON') begin(e.clientX, e.clientY); }, { passive: true });
  addEventListener('pointermove', e => move(e.clientX, e.clientY), { passive: true });
  addEventListener('pointerup', end, { passive: true });
  addEventListener('pointercancel', end, { passive: true });
  addEventListener('touchstart', e => { if (e.target.tagName !== 'BUTTON' && e.touches.length === 1) begin(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
  addEventListener('touchmove', e => { if (e.touches.length === 1) move(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
  addEventListener('touchend', end, { passive: true });

  window.heartScene = {
    explode() {
      exploding = true;
      explodeStart = performance.now();
    }
  };
})();