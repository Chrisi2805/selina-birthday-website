(function () {
  const canvas = document.getElementById('heart-canvas');
  const ctx = canvas.getContext('2d');

  const words = [
    'Selina', 'Liebe', 'Lachen', 'Wunderschön', 'Ohnezahn', 'Mein Engel', 'Zusammen',
    '14. Geburtstag', 'Lego Blumen', 'Passau', 'Perfekt', 'Glück', 'Süß', 'Traum',
    'Einzigartig', 'Abenteuer', 'Für immer', '❤️', 'Mein Herz', 'Magie', 'Du & Ich',
    'Schatz', 'Traumfrau', 'Zukunft', 'Vertrauen', 'Geborgenheit', 'Schmetterlinge',
    'Seelenverwandte', 'Zweisamkeit', 'Knistern', 'Herzklopfen', 'Augenblick', 'Leidenschaft',
    'Unendlich', 'Sternenstaub', 'Wunder', 'Unvergesslich', 'Mein Licht', 'Hoffnung'
  ];

  const NEON_PALETTE = ['#ff1493', '#00ffff', '#b967ff', '#ff80ab', '#39ff14'];

  let width, height, dpr, centerX, centerY, worldScale;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    centerX = width / 2;
    centerY = height / 2;
    worldScale = Math.min(width, height) * 0.42;
  }
  window.addEventListener('resize', resize);
  resize();

  function heartVal(x, y, z) {
    const my = -y;
    const x2 = x * x, y2 = my * my, z2 = z * z;
    return Math.pow(x2 + 2.25 * z2 + y2 - 1, 3) - (x2 * y2 * my) - (0.1125 * z2 * y2 * my);
  }

  function surfacePoint(theta, phi) {
    const dx = Math.sin(phi) * Math.sin(theta);
    const dy = Math.cos(phi);
    const dz = Math.sin(phi) * Math.cos(theta);

    let r = 0.02, step = 0.02, prevR = 0;
    let val = heartVal(dx * r, dy * r, dz * r);
    while (val <= 0 && r < 2.2) {
      prevR = r;
      r += step;
      val = heartVal(dx * r, dy * r, dz * r);
    }
    let lo = prevR, hi = r;
    for (let i = 0; i < 6; i++) {
      const mid = (lo + hi) / 2;
      const v = heartVal(dx * mid, dy * mid, dz * mid);
      if (v <= 0) lo = mid; else hi = mid;
    }
    const rr = (lo + hi) / 2;
    return { x: dx * rr, y: dy * rr, z: dz * rr };
  }

  const NU = 48;
  const NV = 30;
  const grid = [];
  for (let u = 0; u < NU; u++) {
    const theta = (u / NU) * Math.PI * 2;
    const col = [];
    for (let v = 0; v <= NV; v++) {
      col.push(surfacePoint(theta, (v / NV) * Math.PI));
    }
    grid.push(col);
  }

  const RIB_MERIDIANS = 12;
  const RIB_PARALLELS = 4;
  const ribs = [];
  for (let i = 0; i < RIB_MERIDIANS; i++) {
    const u = Math.floor((i / RIB_MERIDIANS) * NU);
    ribs.push({
      points: grid[u], closed: false,
      color: NEON_PALETTE[i % NEON_PALETTE.length],
      posA: Math.random() * NV, posB: Math.random() * NV,
      speed: (Math.random() * 0.3 + 0.25)
    });
  }
  for (let j = 1; j <= RIB_PARALLELS; j++) {
    const v = Math.floor((j / (RIB_PARALLELS + 1)) * NV);
    const pts = [];
    for (let u = 0; u <= NU; u++) pts.push(grid[u % NU][v]);
    ribs.push({
      points: pts, closed: true,
      color: NEON_PALETTE[(j + 2) % NEON_PALETTE.length],
      posA: Math.random() * NU, posB: Math.random() * NU,
      speed: (Math.random() * 0.3 + 0.2)
    });
  }
  const TRAIL_LEN = 14;

  function pingpong(x, length) {
    if (length <= 0) return 0;
    const period = 2 * length;
    let m = x % period;
    if (m < 0) m += period;
    return m <= length ? m : period - m;
  }

  const WORD_COUNT = 130;
  const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
  const wordPoints = [];

  ctx.font = '700 100px Montserrat, sans-serif';
  const widthRatio = {};
  for (const w of words) {
    widthRatio[w] = ctx.measureText(w).width / 100;
  }

  for (let i = 0; i < WORD_COUNT; i++) {
    const phi = Math.acos(1 - 2 * (i + 0.5) / WORD_COUNT);
    const theta = (GOLDEN_ANGLE * i) % (Math.PI * 2);
    const p = surfacePoint(theta, phi);
    const word = words[Math.floor(Math.random() * words.length)];
    wordPoints.push({
      base: p,
      explodeDir: p,
      word,
      widthRatio: widthRatio[word],
      color: Math.random() > 0.78 ? '#ff1493' : (Math.random() > 0.52 ? '#ffb6c1' : '#ffffff'),
      baseSize: 15 + Math.random() * 5
    });
  }

  let angleX = 0.26, angleY = 0;
  let zoom = 1;
  let isDragging = false;
  let autoRotate = true;
  let exploding = false;
  let explodeStart = 0;

  function rotate(p) {
    const cosY = Math.cos(angleY), sinY = Math.sin(angleY);
    let x = p.x * cosY + p.z * sinY;
    let z = -p.x * sinY + p.z * cosY;
    const cosX = Math.cos(angleX), sinX = Math.sin(angleX);
    let y = p.y * cosX - z * sinX;
    z = p.y * sinX + z * cosX;
    return { x, y, z };
  }

  const FOCAL = 900;
  function project(p) {
    const persp = FOCAL / (FOCAL + p.z * worldScale);
    return {
      x: centerX + p.x * worldScale * persp * zoom,
      y: centerY + p.y * worldScale * persp * zoom,
      scale: persp * zoom
    };
  }

  const projectedWords = new Array(WORD_COUNT);
  const order = new Array(WORD_COUNT);
  for (let i = 0; i < WORD_COUNT; i++) order[i] = i;
  const accepted = [];

  function draw(now) {
    ctx.clearRect(0, 0, width, height);

    let explodeT = 0;
    if (exploding) explodeT = Math.min(1, (now - explodeStart) / 1200);

    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    for (const rib of ribs) {
      ctx.beginPath();
      let started = false;
      for (const basePt of rib.points) {
        const proj = project(rotate(basePt));
        if (!started) { ctx.moveTo(proj.x, proj.y); started = true; }
        else ctx.lineTo(proj.x, proj.y);
      }
      ctx.strokeStyle = rib.color;
      ctx.globalAlpha = exploding ? Math.max(0, 0.18 * (1 - explodeT)) : 0.14;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    if (!exploding) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.shadowBlur = 16;
      for (const rib of ribs) {
        const L = rib.points.length;
        const maxIdx = rib.closed ? L : L - 1;
        rib.posA += rib.speed * 0.16;
        rib.posB -= rib.speed * 0.13;

        for (const [pos, dirSign] of [[rib.posA, -1], [rib.posB, 1]]) {
          const headIdx = rib.closed
            ? (((pos % maxIdx) + maxIdx) % maxIdx)
            : pingpong(pos, maxIdx);
          ctx.shadowColor = rib.color;
          for (let k = TRAIL_LEN; k >= 0; k--) {
            let idx = headIdx + dirSign * k;
            idx = rib.closed ? ((idx % maxIdx) + maxIdx) % maxIdx : Math.max(0, Math.min(maxIdx, idx));
            const pt = rib.points[Math.round(idx)];
            if (!pt) continue;
            const proj = project(rotate(pt));
            const t = 1 - k / TRAIL_LEN;
            const isHot = k < 2;
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, (isHot ? 3 : 2.2) * t + 0.5, 0, Math.PI * 2);
            ctx.fillStyle = isHot ? '#ffffff' : rib.color;
            ctx.globalAlpha = t * t * (exploding ? 0 : 1);
            ctx.fill();
          }
        }
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    for (let i = 0; i < WORD_COUNT; i++) {
      const wp = wordPoints[i];
      let px = wp.base.x, py = wp.base.y, pz = wp.base.z;
      if (exploding) {
        const ease = 1 - Math.pow(1 - explodeT, 3);
        const mult = 1 + ease * 7;
        px = wp.explodeDir.x * mult;
        py = wp.explodeDir.y * mult;
        pz = wp.explodeDir.z * mult;
      }
      const proj = project(rotate({ x: px, y: py, z: pz }));
      const fontSize = wp.baseSize * Math.max(0.4, Math.min(proj.scale, 2.4));
      const alpha = exploding
        ? Math.max(0, 1 - (1 - Math.pow(1 - explodeT, 3)))
        : Math.min(1, Math.max(0.15, (proj.scale - 0.45) / 1.2));
      projectedWords[i] = {
        x: proj.x, y: proj.y, scale: proj.scale, fontSize, alpha,
        halfW: (wp.widthRatio * fontSize) / 2,
        halfH: fontSize * 0.5,
        word: wp.word, color: wp.color
      };
      order[i] = i;
    }

    order.sort((a, b) => projectedWords[b].scale - projectedWords[a].scale);

    accepted.length = 0;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 0;

    const visible = [];
    for (const i of order) {
      const w = projectedWords[i];
      if (!exploding && w.alpha < 0.12) continue;

      if (!exploding) {
        let overlaps = false;
        for (let a = 0; a < accepted.length; a++) {
          const acc = accepted[a];
          if (Math.abs(w.x - acc.x) < (w.halfW + acc.halfW) * 0.72 &&
              Math.abs(w.y - acc.y) < (w.halfH + acc.halfH) * 1.1) {
            overlaps = true;
            break;
          }
        }
        if (overlaps) continue;
        accepted.push({ x: w.x, y: w.y, halfW: w.halfW, halfH: w.halfH });
      }
      visible.push(w);
    }

    visible.sort((a, b) => a.scale - b.scale);
    for (const w of visible) {
      ctx.font = `700 ${w.fontSize.toFixed(1)}px Montserrat, sans-serif`;
      ctx.fillStyle = w.color;
      ctx.globalAlpha = w.alpha;
      ctx.fillText(w.word, w.x, w.y);
    }
    ctx.globalAlpha = 1;

    if (autoRotate && !exploding) angleY += 0.006;

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

  let lastX = 0, lastY = 0;
  canvas.style.pointerEvents = 'none';

  document.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'BUTTON') return;
    isDragging = true; autoRotate = false;
    lastX = e.clientX; lastY = e.clientY;
  });
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    angleY += (e.clientX - lastX) * 0.006;
    angleX += (e.clientY - lastY) * 0.006;
    angleX = Math.max(-1.3, Math.min(1.3, angleX));
    lastX = e.clientX; lastY = e.clientY;
  });
  document.addEventListener('mouseup', () => { isDragging = false; autoRotate = true; });

  document.addEventListener('wheel', (e) => {
    zoom -= e.deltaY * 0.001;
    zoom = Math.max(0.55, Math.min(zoom, 2.4));
  }, { passive: true });

  let startTouchX, startTouchY, initialPinchDist = null;
  document.addEventListener('touchstart', (e) => {
    if (e.target.tagName === 'BUTTON') return;
    if (e.touches.length === 1) {
      isDragging = true; autoRotate = false;
      startTouchX = e.touches[0].clientX; startTouchY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      initialPinchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (e.target.tagName === 'BUTTON') return;
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - startTouchX;
      const dy = e.touches[0].clientY - startTouchY;
      angleY += dx * 0.006;
      angleX += dy * 0.006;
      angleX = Math.max(-1.3, Math.min(1.3, angleX));
      startTouchX = e.touches[0].clientX; startTouchY = e.touches[0].clientY;
    } else if (e.touches.length === 2 && initialPinchDist) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      zoom += (currentDist - initialPinchDist) * 0.0035;
      zoom = Math.max(0.55, Math.min(zoom, 2.4));
      initialPinchDist = currentDist;
    }
  }, { passive: true });

  document.addEventListener('touchend', () => {
    isDragging = false; autoRotate = true; initialPinchDist = null;
  });

  window.heartScene = {
    explode() { exploding = true; explodeStart = performance.now(); }
  };
})();
