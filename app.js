/* ===================================================================
   Nyan Cat — custom edition
   The classic Nyan Cat animation, faithfully recreated in pixel art:
   frosted pop-tart body, galloping legs, waving tail, the stepped
   rainbow that wags between two frames, a twinkling scrolling
   starfield, and deep-blue space — but the cat is redrawn as a
   brown mackerel tabby (green eyes, "M" forehead, pink nose, cream
   muzzle) to match the reference photo. Soundtrack: song.mp3 (looped).
   =================================================================== */

(() => {
  'use strict';

  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');

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
    ctx.imageSmoothingEnabled = false;
  }
  window.addEventListener('resize', resize);
  resize();

  // ---- Palette --------------------------------------------------------
  const C = {
    bg: '#13123a',
    k: '#2a1d12',   // outline / near-black brown
    b: '#9c7a4d',   // brown base coat
    d: '#5e4326',   // dark mackerel stripe
    t: '#efe2bb',   // cream muzzle / belly
    p: '#ff6f91',   // pink nose & cheeks
    g: '#9ccc4b',   // green eye
    i: '#16120b',   // pupil
    w: '#ffffff',   // highlight
    T: '#f3c386',   // pop-tart tan
    O: '#c6883f',   // pop-tart crust
    F: '#ff9ecb',   // frosting
    c: '#9fe9ff',   // cyan sprinkle
    s: '#ffffff',   // white sprinkle
  };

  // ---- Pixel-grid sprites --------------------------------------------
  // Pop-tart: tan crust, pink frosting, scattered sprinkles. 20x14.
  const POPTART = [
    '..OOOOOOOOOOOOOOOO..',
    '.OTTTTTTTTTTTTTTTTO.',
    'OTTTTTTTTTTTTTTTTTTO',
    'OTTFFFFFFFFFFFFFFTTO',
    'OTTFFcFFFFFFFFcFFTTO',
    'OTTFFFFFFsFFFFFFFTTO',
    'OTTFFFFFFFFFFFFFFTTO',
    'OTTFcFFFFFFFFFFsFTTO',
    'OTTFFFFsFFFFFFFFFTTO',
    'OTTFFFFFFFFcFFFFFTTO',
    'OTTFFFFFFFFFFFFFFTTO',
    'OTTTTTTTTTTTTTTTTTTO',
    '.OTTTTTTTTTTTTTTTTO.',
    '..OOOOOOOOOOOOOOOO..',
  ];

  // Head: brown tabby, front-facing, ears top corners, "M" forehead,
  // green eyes, pink nose, cream muzzle. 11x13.
  const HEAD = [
    'kk.......kk',
    'kbk.....kbk',
    'kbbbbbbbbbk',
    'kbbdbdbdbbk',
    'kbbdbdbdbbk',
    'kbbbbbbbbbk',
    'kgwgbbbgwgk',
    'kgigbpbgigk',
    'kbttppttbbk',
    'kbtttttttbk',
    'kbbtttttbbk',
    '.kbbtttbbk.',
    '..kkbbbkk..',
  ];

  function drawGrid(grid, gx, gy, U, ox, oy) {
    for (let r = 0; r < grid.length; r++) {
      const row = grid[r];
      for (let c = 0; c < row.length; c++) {
        const ch = row[c];
        if (ch === '.' || ch === ' ') continue;
        const col = C[ch];
        if (!col) continue;
        ctx.fillStyle = col;
        ctx.fillRect(
          Math.round(ox + (gx + c) * U),
          Math.round(oy + (gy + r) * U),
          Math.ceil(U), Math.ceil(U)
        );
      }
    }
  }

  // A unit-rectangle helper in sprite space.
  function R(ox, oy, U, ux, uy, uw, uh, color) {
    ctx.fillStyle = color;
    ctx.fillRect(
      Math.round(ox + ux * U), Math.round(oy + uy * U),
      Math.ceil(uw * U), Math.ceil(uh * U)
    );
  }

  // ---- Tail (two wag frames) -----------------------------------------
  // base attaches near pop-tart's lower-left; curls up or down.
  const TAIL_UP = [[8, 9], [6, 8], [4, 7], [2, 6], [0, 5]];
  const TAIL_DOWN = [[8, 11], [6, 12], [4, 13], [2, 14], [0, 15]];
  function drawTail(up, U, ox, oy) {
    const seg = up ? TAIL_UP : TAIL_DOWN;
    for (let i = 0; i < seg.length; i++) {
      const [x, y] = seg[i];
      R(ox, oy, U, x - 0.3, y - 0.3, 2.6, 2.6, C.k);        // outline
      R(ox, oy, U, x, y, 2, 2, i % 2 ? C.d : C.b);          // striped
    }
  }

  // ---- Legs (six-frame gallop) ---------------------------------------
  const LEG_X = [12.5, 16.5, 20.5, 24.5];
  const LEG_PHASE = [0, 3, 1, 4];
  const LEG_LIFT = [0, 0, 1, 1, 1, 0];   // vertical offset per cycle step
  function drawLegs(fstep, U, ox, oy) {
    const baseY = 20;
    for (let i = 0; i < 4; i++) {
      const lift = LEG_LIFT[(fstep + LEG_PHASE[i]) % LEG_LIFT.length];
      const y = baseY - lift;
      const x = LEG_X[i];
      R(ox, oy, U, x - 0.3, y - 0.3, 2.6, 3.9, C.k);  // outline
      R(ox, oy, U, x, y, 2, 3, i === 1 || i === 2 ? C.d : C.b); // leg (striped)
      R(ox, oy, U, x, y + 2.4, 2, 1.1, C.t);          // cream paw
    }
  }

  // ---- Whiskers ------------------------------------------------------
  function drawWhiskers(U, ox, oy, hx, hy) {
    ctx.fillStyle = C.t;
    // left side
    R(ox, oy, U, hx - 2.4, hy + 8.3, 2.6, 0.5, C.t);
    R(ox, oy, U, hx - 2.4, hy + 9.6, 2.6, 0.5, C.t);
    // right side
    R(ox, oy, U, hx + 11, hy + 8.3, 2.6, 0.5, C.t);
    R(ox, oy, U, hx + 11, hy + 9.6, 2.6, 0.5, C.t);
  }

  // ===================================================================
  // STARFIELD — white pixel sparkles scrolling left, twinkling
  // ===================================================================
  const STAR_FRAMES = 6;
  const stars = [];
  function makeStar(randomX) {
    return {
      x: randomX ? Math.random() * W : W + Math.random() * 40,
      y: Math.random() * H,
      size: 2 + Math.floor(Math.random() * 4),
      frame: Math.floor(Math.random() * STAR_FRAMES),
      ftime: Math.random() * 0.1,
      speed: 0.55 + Math.random() * 0.5,
    };
  }
  function seedStars() {
    stars.length = 0;
    const count = Math.round((W * H) / 13000);
    for (let i = 0; i < count; i++) stars.push(makeStar(true));
  }
  seedStars();
  window.addEventListener('resize', seedStars);

  const STAR_ARM = [0, 1, 2, 2, 1, 0];
  function drawStar(s) {
    const u = s.size;
    const arm = STAR_ARM[s.frame];
    const cx = Math.round(s.x), cy = Math.round(s.y);
    ctx.fillStyle = '#fff';
    ctx.fillRect(cx - u, cy - u, u * 2, u * 2);
    for (let a = 1; a <= arm; a++) {
      const off = u * 2 * a;
      ctx.fillRect(cx - u, cy - u - off, u * 2, u * 2);
      ctx.fillRect(cx - u, cy - u + off, u * 2, u * 2);
      ctx.fillRect(cx - u - off, cy - u, u * 2, u * 2);
      ctx.fillRect(cx - u + off, cy - u, u * 2, u * 2);
    }
  }

  // ===================================================================
  // RAINBOW — six stripes with the classic two-frame stepped "wag"
  // ===================================================================
  const RAINBOW = ['#ff1e1e', '#ff9d00', '#fff000', '#33dd00', '#00a6ff', '#7a3cff'];
  function drawRainbow(originX, centerY, stripeH, segW, parity) {
    const top0 = centerY - stripeH * 3;
    let seg = 0;
    for (let x = originX; x > -segW; x -= segW, seg++) {
      const lvl = ((seg + parity) & 1) ? 1 : 0;
      const top = top0 + (lvl - 0.5) * stripeH;
      for (let s = 0; s < 6; s++) {
        ctx.fillStyle = RAINBOW[s];
        ctx.fillRect(
          Math.round(x - segW), Math.round(top + s * stripeH),
          Math.ceil(segW) + 1, Math.ceil(stripeH) + 1
        );
      }
    }
  }

  // ===================================================================
  // MAIN LOOP
  // ===================================================================
  let running = false;
  let t = 0;
  let last = performance.now();

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (running) t += dt;

    // background
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    // stars
    for (const s of stars) {
      if (running) {
        s.x -= s.speed * dt * 230;
        s.ftime += dt;
        if (s.ftime > 0.13) { s.ftime = 0; s.frame = (s.frame + 1) % STAR_FRAMES; }
        if (s.x < -20) Object.assign(s, makeStar(false));
      }
      drawStar(s);
    }

    // sprite scale + placement
    const core = Math.max(120, Math.min(Math.min(W, H) * 0.30, 240)); // pop-tart height px
    const U = core / 14;
    // bob: 8-step square bob like the original sprite
    const bobSteps = [0, -1, -2, -1, 0, 1, 2, 1];
    const bob = (running ? bobSteps[Math.floor(t * 12) % 8] : 0) * U * 0.6;
    // local grid: pop-tart center is at (20,13); put it near screen center
    const ox = W * 0.52 - 20 * U;
    const oy = H * 0.5 - 13 * U + bob;

    // rainbow trails from behind the pop-tart's left edge, leftward
    const parity = running ? (Math.floor(t / 0.13) & 1) : 0;
    drawRainbow(ox + 10 * U, oy + 13 * U, U, 2 * U, parity);

    // tail behind the body
    const tailUp = running ? (Math.floor(t / 0.16) & 1) === 0 : true;
    drawTail(tailUp, U, ox, oy);

    // galloping legs (behind pop-tart)
    const legStep = running ? Math.floor(t * 12) % 6 : 0;
    drawLegs(legStep, U, ox, oy);

    // pop-tart body
    drawGrid(POPTART, 10, 6, U, ox, oy);

    // head + whiskers on the right
    const hx = 28, hy = 6;
    drawWhiskers(U, ox, oy, hx, hy);
    drawGrid(HEAD, hx, hy, U, ox, oy);

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // ===================================================================
  // AUDIO — loop the supplied soundtrack (song.mp3)
  // ===================================================================
  let muted = false;
  const music = new Audio('song.mp3');
  music.loop = true;
  music.preload = 'auto';
  music.volume = 0.7;

  function startAudio() {
    music.muted = muted;
    const p = music.play();
    if (p && p.catch) p.catch(() => {});
  }

  // ===================================================================
  // UI — start overlay + mute
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
  if (location.hash === '#auto') window.addEventListener('load', launch);

  muteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    muted = !muted;
    music.muted = muted;
    if (!muted && music.paused && running) startAudio();
    muteBtn.textContent = muted ? '🔇' : '🔊';
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) music.pause();
    else if (running && !muted) music.play().catch(() => {});
  });
})();
