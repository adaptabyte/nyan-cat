/* ===================================================================
   Nyan Cat — custom edition
   Canvas animation: scrolling starfield + waving rainbow + pop-tart
   body + your cat, all bobbing in space. Original chiptune via WebAudio.
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
  function drawStar(s, scrollPx) {
    const u = s.size;                 // pixel unit
    const phase = s.frame;            // 0..5
    // arm length per frame: small -> big -> small (twinkle)
    const armTable = [0, 1, 2, 2, 1, 0];
    const arm = armTable[phase];
    const cx = Math.round(s.x);
    const cy = Math.round(s.y);
    ctx.fillStyle = '#fff';
    // center block
    ctx.fillRect(cx - u, cy - u, u * 2, u * 2);
    // four arms
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
    // Cat sized relative to viewport, clamped so it reads well on phones.
    const catH = Math.max(150, Math.min(H * 0.42, 360));
    const catW = catH * catAspect;
    const cx = W * 0.5;                 // cat center x (rainbow trails left of it)
    const cyBase = H * 0.5;
    return { catH, catW, cx, cyBase };
  }

  // ===================================================================
  // 4. RAINBOW — six stripes with the classic stepped "wag" wave
  // ===================================================================
  const RAINBOW = ['#ff1e1e', '#ff9900', '#ffe600', '#33dd00', '#0099ff', '#6633ff'];
  function drawRainbow(originX, centerY, stripeH, scroll) {
    const totalH = stripeH * RAINBOW.length;
    const seg = stripeH;                       // width of each wave segment
    const step = stripeH;                      // vertical wag amount
    // square-ish wave pattern (in units of `step`)
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
    // toasted pastry base
    roundRect(x, y, w, h, r);
    ctx.fillStyle = '#f0c891';
    ctx.fill();
    ctx.strokeStyle = '#caa166';
    ctx.lineWidth = Math.max(2, w * 0.02);
    ctx.stroke();
    // pink frosting inset
    const m = w * 0.12;
    roundRect(x + m, y + m, w - m * 2, h - m * 2, r * 0.7);
    ctx.fillStyle = '#ff8ec6';
    ctx.fill();
    // sprinkles
    const colors = ['#ffffff', '#7fffd4', '#fff44f', '#7ec8ff', '#ff5fa2'];
    const sCount = Math.round((w * h) / 1600);
    // deterministic-ish sprinkle placement
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

    // background
    ctx.fillStyle = '#1a1a3a';
    ctx.fillRect(0, 0, W, H);

    // stars
    for (const s of stars) {
      if (running) {
        s.x -= s.speed * dt * 220;
        s.ftime += dt;
        if (s.ftime > 0.12) { s.ftime = 0; s.frame = (s.frame + 1) % STAR_FRAMES; }
        if (s.x < -20) { Object.assign(s, makeStar(false)); }
      }
      drawStar(s, scroll);
    }

    const { catH, catW, cx, cyBase } = layout();
    // bob: 6-step square bob like the original sprite
    const bobSteps = [0, -1, -2, -1, 0, 1, 2, 1];
    const bobIdx = Math.floor(t * 12) % bobSteps.length;
    const bob = bobSteps[bobIdx] * (catH * 0.025);
    const cy = cyBase + bob;

    // rainbow trails from just behind the pop-tart, leftward
    const stripeH = catH * 0.085;
    drawRainbow(cx - catW * 0.18, cy + catH * 0.06, stripeH, scroll);

    // pop-tart body roughly over the cat's torso
    const ptW = catW * 0.62, ptH = catH * 0.5;
    drawPopTart(cx - ptW * 0.62, cy - ptH * 0.35, ptW, ptH);

    // the cat, on top
    if (catReady) {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(catSprite, cx - catW / 2, cy - catH / 2, catW, catH);
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // ===================================================================
  // 7. AUDIO — original looping chiptune (square melody + bass + drums)
  //    NOTE: this is an original tune, not the copyrighted Nyan Cat song.
  // ===================================================================
  let audioCtx = null;
  let master = null;
  let musicTimer = null;
  let muted = false;

  // Note frequencies (a small table, A4=440 equal temperament)
  const NOTE = (() => {
    const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const map = {};
    for (let oct = 2; oct <= 6; oct++) {
      for (let i = 0; i < 12; i++) {
        const midi = (oct + 1) * 12 + i;
        map[names[i] + oct] = 440 * Math.pow(2, (midi - 69) / 12);
      }
    }
    map['-'] = 0; // rest
    return map;
  })();

  // An upbeat original loop in A minor-ish, 16 steps per bar, 2 bars.
  const TEMPO = 0.13; // seconds per step (~115 steps -> bright & bouncy)
  const melody = [
    'E5','A5','B5','C6','B5','A5','E5','-',
    'D5','E5','F5','E5','D5','C5','D5','-',
    'E5','A5','B5','C6','D6','C6','B5','A5',
    'G5','A5','B5','A5','G5','E5','A5','-',
  ];
  const bass = [
    'A2','-','A3','-','E2','-','E3','-',
    'F2','-','F3','-','C3','-','G2','-',
    'A2','-','A3','-','E2','-','E3','-',
    'F2','-','C3','-','G2','-','A2','-',
  ];

  function blip(freq, time, dur, type, gain, pan) {
    if (!freq) return;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(gain, time + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    let node = g;
    if (pan !== undefined && audioCtx.createStereoPanner) {
      const p = audioCtx.createStereoPanner();
      p.pan.value = pan;
      g.connect(p); node = p;
    }
    osc.connect(g);
    node.connect(master);
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  function hat(time) {
    const n = audioCtx.createBufferSource();
    const len = Math.floor(audioCtx.sampleRate * 0.03);
    const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    n.buffer = buf;
    const g = audioCtx.createGain();
    g.gain.value = 0.06;
    const hp = audioCtx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 7000;
    n.connect(hp); hp.connect(g); g.connect(master);
    n.start(time); n.stop(time + 0.04);
  }

  function kick(time) {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.frequency.setValueAtTime(160, time);
    osc.frequency.exponentialRampToValueAtTime(50, time + 0.12);
    g.gain.setValueAtTime(0.5, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
    osc.connect(g); g.connect(master);
    osc.start(time); osc.stop(time + 0.2);
  }

  let step = 0;
  let nextTime = 0;
  function scheduler() {
    if (!audioCtx) return;
    while (nextTime < audioCtx.currentTime + 0.1) {
      const i = step % melody.length;
      blip(NOTE[melody[i]], nextTime, TEMPO * 0.9, 'square', 0.14, 0.15);
      blip(NOTE[bass[i]], nextTime, TEMPO * 1.6, 'triangle', 0.22, -0.1);
      if (i % 4 === 0) kick(nextTime);
      if (i % 2 === 1) hat(nextTime);
      // sparkle harmony on accents
      if (i % 8 === 0 && NOTE[melody[i]]) blip(NOTE[melody[i]] * 2, nextTime, TEMPO * 0.5, 'square', 0.05, 0.4);
      nextTime += TEMPO;
      step++;
    }
  }

  function startAudio() {
    if (audioCtx) { audioCtx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();
    master = audioCtx.createGain();
    master.gain.value = muted ? 0 : 0.5;
    master.connect(audioCtx.destination);
    nextTime = audioCtx.currentTime + 0.1;
    step = 0;
    musicTimer = setInterval(scheduler, 25);
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
    if (master) master.gain.value = muted ? 0 : 0.5;
    muteBtn.textContent = muted ? '🔇' : '🔊';
  });

  // pause audio scheduling when tab is hidden (saves battery)
  document.addEventListener('visibilitychange', () => {
    if (!audioCtx) return;
    if (document.hidden) audioCtx.suspend(); else if (running) audioCtx.resume();
  });
})();
