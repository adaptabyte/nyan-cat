/* ===================================================================
   Nyan Cat — custom edition
   Canvas animation: scrolling starfield + waving rainbow + pop-tart
   body + your cat, all bobbing in space. Looping soundtrack: song.mp3.
   =================================================================== */

(() => {
  'use strict';

  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');

  // ---- Responsive sizing (cap DPR so big retina screens stay smooth) ----
  let W = 0, H = 0, DPR = 1;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  // ===================================================================
  // 1. CAT IMAGE — load + chroma-key the white background to transparent
  // ===================================================================
  const catSprite = document.createElement('canvas');
  const catCtx = catSprite.getContext('2d');
  let catReady = false;
  let catAspect = 1;

  const catImg = new Image();
  catImg.src = 'cat.jpg';
  catImg.onload = () => {
    catSprite.width = catImg.width;
    catSprite.height = catImg.height;
    catCtx.drawImage(catImg, 0, 0);
    try {
      const data = catCtx.getImageData(0, 0, catImg.width, catImg.height);
      const px = data.data;
      // Knock out near-white pixels; feather the edge to avoid a halo.
      const HI = 243, LO = 224;
      for (let i = 0; i < px.length; i += 4) {
        const mn = Math.min(px[i], px[i + 1], px[i + 2]);
        if (mn >= HI) {
          px[i + 3] = 0;
        } else if (mn > LO) {
          px[i + 3] = Math.round(((HI - mn) / (HI - LO)) * px[i + 3]);
        }
      }
      catCtx.putImageData(data, 0, 0);
    } catch (e) {
      /* cross-origin guard — same-origin here, so this won't trip */
    }
    catAspect = catImg.width / catImg.height;
    catReady = true;
  };

  // ===================================================================
  // 2. STARFIELD — pixel "+" stars scrolling left, twinkling per frame
  // ===================================================================
  const STAR_FRAMES = 6;        // twinkle animation length
  const stars = [];
  function makeStar(randomX) {
    return {
      x: randomX ? Math.random() * W : W + Math.random() * 40,
      y: Math.random() * H,
      size: 2 + Math.floor(Math.random() * 4),   // pixel scale
      frame: Math.floor(Math.random() * STAR_FRAMES),
      ftime: 0,
      speed: 0.5 + Math.random() * 0.5,
    };
  }
  function seedStars() {
    stars.length = 0;
    const count = Math.round((W * H) / 14000);
    for (let i = 0; i < count; i++) stars.push(makeStar(true));
  }
  seedStars();
  window.addEventListener('resize', seedStars);

  // A star is drawn as a small "+" whose arms grow then shrink (6 frames).
  function drawStar(s) {
    const u = s.size;                 // pixel unit
    const armTable = [0, 1, 2, 2, 1, 0];
    const arm = armTable[s.frame];
    const cx = Math.round(s.x);
    const cy = Math.round(s.y);
    ctx.fillStyle = '#fff';
    ctx.fillRect(cx - u, cy - u, u * 2, u * 2);   // center
    for (let a = 1; a <= arm; a++) {
      const off = u * 2 * a;
      ctx.fillRect(cx - u, cy - u - off, u * 2, u * 2);   // up
      ctx.fillRect(cx - u, cy - u + off, u * 2, u * 2);   // down
      ctx.fillRect(cx - u - off, cy - u, u * 2, u * 2);   // left
      ctx.fillRect(cx - u + off, cy - u, u * 2, u * 2);   // right
    }
  }

  // ===================================================================
  // 3. LAYOUT helpers — everything scales off the cat's height
  // ===================================================================
  function layout() {
    const catH = Math.max(150, Math.min(H * 0.42, 360));
    const catW = catH * catAspect;
    const cx = W * 0.5;
    const cyBase = H * 0.5;
    return { catH, catW, cx, cyBase };
  }

  // ===================================================================
  // 4. RAINBOW — six stripes with the classic stepped "wag" wave
  // ===================================================================
  const RAINBOW = ['#ff1e1e', '#ff9900', '#ffe600', '#33dd00', '#0099ff', '#6633ff'];
  function drawRainbow(originX, centerY, stripeH, scroll) {
    const totalH = stripeH * RAINBOW.length;
    const seg = stripeH;
    const step = stripeH;
    const pattern = [0, 0, 1, 1];
    const top0 = centerY - totalH / 2;

    for (let x = originX; x > -seg; x -= seg) {
      const idx = Math.floor((x - originX - scroll) / seg);
      const lvl = pattern[((idx % pattern.length) + pattern.length) % pattern.length];
      const yOff = lvl * step - step / 2;
      const top = top0 + yOff;
      for (let s = 0; s < RAINBOW.length; s++) {
        ctx.fillStyle = RAINBOW[s];
        ctx.fillRect(Math.round(x - seg), Math.round(top + s * stripeH), seg + 1, stripeH + 1);
      }
    }
  }

  // ===================================================================
  // 5. POP-TART body (the iconic frosted toaster pastry)
  // ===================================================================
  function drawPopTart(x, y, w, h) {
    const r = Math.min(w, h) * 0.16;
    roundRect(x, y, w, h, r);
    ctx.fillStyle = '#f0c891';
    ctx.fill();
    ctx.strokeStyle = '#caa166';
    ctx.lineWidth = Math.max(2, w * 0.02);
    ctx.stroke();
    const m = w * 0.12;
    roundRect(x + m, y + m, w - m * 2, h - m * 2, r * 0.7);
    ctx.fillStyle = '#ff8ec6';
    ctx.fill();
    const colors = ['#ffffff', '#7fffd4', '#fff44f', '#7ec8ff', '#ff5fa2'];
    const sCount = Math.round((w * h) / 1600);
    let seed = 1337;
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (let i = 0; i < sCount; i++) {
      const sx = x + m + rnd() * (w - m * 2);
      const sy = y + m + rnd() * (h - m * 2);
      ctx.fillStyle = colors[Math.floor(rnd() * colors.length)];
      const ss = w * 0.025;
      ctx.fillRect(sx, sy, ss, ss);
    }
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // ===================================================================
  // 6. MAIN LOOP
  // ===================================================================
  let running = false;
  let scroll = 0;
  let t = 0;
  let last = performance.now();

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (running) { t += dt; scroll += dt * 220; }

    ctx.fillStyle = '#1a1a3a';
    ctx.fillRect(0, 0, W, H);

    for (const s of stars) {
      if (running) {
        s.x -= s.speed * dt * 220;
        s.ftime += dt;
        if (s.ftime > 0.12) { s.ftime = 0; s.frame = (s.frame + 1) % STAR_FRAMES; }
        if (s.x < -20) { Object.assign(s, makeStar(false)); }
      }
      drawStar(s);
    }

    const { catH, catW, cx, cyBase } = layout();
    const bobSteps = [0, -1, -2, -1, 0, 1, 2, 1];
    const bobIdx = Math.floor(t * 12) % bobSteps.length;
    const bob = bobSteps[bobIdx] * (catH * 0.025);
    const cy = cyBase + bob;

    const stripeH = catH * 0.085;
    drawRainbow(cx - catW * 0.18, cy + catH * 0.06, stripeH, scroll);

    const ptW = catW * 0.62, ptH = catH * 0.5;
    drawPopTart(cx - ptW * 0.62, cy - ptH * 0.35, ptW, ptH);

    if (catReady) {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(catSprite, cx - catW / 2, cy - catH / 2, catW, catH);
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // ===================================================================
  // 7. AUDIO — loop the supplied soundtrack (song.mp3)
  // ===================================================================
  let muted = false;
  const music = new Audio('song.mp3');
  music.loop = true;          // seamless repeat
  music.preload = 'auto';
  music.volume = 0.7;

  function startAudio() {
    music.muted = muted;
    const p = music.play();
    if (p && p.catch) p.catch(() => { /* will retry on next user gesture */ });
  }

  // ===================================================================
  // 8. UI wiring — start overlay + mute
  // ===================================================================
  const overlay = document.getElementById('start-overlay');
  const startBtn = document.getElementById('start-btn');
  const muteBtn = document.getElementById('mute-btn');

  function launch() {
    if (running) return;
    running = true;
    last = performance.now();
    overlay.classList.add('hidden');
    muteBtn.hidden = false;
    startAudio();
  }
  startBtn.addEventListener('click', launch);
  overlay.addEventListener('click', launch);
  // Auto-start the visuals when loaded with #auto (audio still needs a tap).
  if (location.hash === '#auto') window.addEventListener('load', launch);

  muteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    muted = !muted;
    music.muted = muted;
    if (!muted && music.paused && running) startAudio();
    muteBtn.textContent = muted ? '🔇' : '🔊';
  });

  // pause music when tab is hidden (saves battery), resume when back
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      music.pause();
    } else if (running && !muted) {
      music.play().catch(() => {});
    }
  });
})();
