(() => {
  if (window.__aylLoaded) return;
  window.__aylLoaded = true;

  const root = document.documentElement;
  const DEFAULTS = { enabled: true, glow: true, intensity: 1, size: 0.8, blur: 18, smooth: 0.3 };
  const SCALE = 4; // glow canvas = viewport / 4 (cheap to draw; blur hides it)
  let cfg = { ...DEFAULTS };

  let lastW = 0, lastH = 0;   // player size in CSS px
  let lastDraw = 0;
  let needClear = true;

  // ---------- glow layers ----------
  const glow = document.createElement('canvas');
  glow.id = 'ayl-glow';
  const vig = document.createElement('div');
  vig.id = 'ayl-vignette';
  const buf = document.createElement('canvas');     // one video frame, drawn once per tick
  const bctx = buf.getContext('2d');
  let gctx = null;

  // Glow lives next to the player (same stacking context), directly beneath it,
  // so nothing else YouTube paints later can cover it.
  function attach() {
    const player = document.querySelector('#movie_player');
    const host = player && player.parentElement;
    if (!host) return;
    if (glow.parentElement !== host || vig.parentElement !== host ||
        glow.nextElementSibling !== vig || vig.nextElementSibling !== player) {
      host.insertBefore(glow, player);
      host.insertBefore(vig, player);
    }
  }

  function sizeCanvas() {
    glow.width = Math.max(16, Math.ceil(innerWidth / SCALE));
    glow.height = Math.max(16, Math.ceil(innerHeight / SCALE));
    gctx = glow.getContext('2d', { alpha: false });
    needClear = true;
  }

  // Video mirrored outward from every edge of the player so the picture
  // "continues" to all four sides and the corners (true mirror tiling).
  function drawGlow(v) {
    const W = glow.width, H = glow.height;
    const sx = W / innerWidth, sy = H / innerHeight;
    const pw = lastW * sx, ph = lastH * sy;
    if (pw < 4 || ph < 4) return;

    const bw = Math.max(8, Math.round(pw)), bh = Math.max(8, Math.round(ph));
    if (buf.width !== bw || buf.height !== bh) { buf.width = bw; buf.height = bh; }
    bctx.drawImage(v, 0, 0, bw, bh);

    const cx = (W - pw) / 2, cy = (H - ph) / 2;
    const nx = Math.ceil(cx / pw) + 1, ny = Math.ceil(cy / ph) + 1;

    // Blending each frame over the previous one = smooth, flowing transitions
    gctx.globalAlpha = needClear ? 1 : cfg.smooth;
    for (let j = -ny; j <= ny; j++) {
      for (let i = -nx; i <= nx; i++) {
        const x = cx + i * pw, y = cy + j * ph;
        if (x + pw < 0 || x > W || y + ph < 0 || y > H) continue;
        gctx.save();
        gctx.translate(x + pw / 2, y + ph / 2);
        gctx.scale(Math.abs(i) % 2 ? -1 : 1, Math.abs(j) % 2 ? -1 : 1);
        // +1px overlap so no hairline seams between tiles
        gctx.drawImage(buf, -pw / 2 - 0.5, -ph / 2 - 0.5, pw + 1, ph + 1);
        gctx.restore();
      }
    }
    gctx.globalAlpha = 1;
    needClear = false;
  }

  function tick() {
    if (!root.classList.contains('ayl-on') || !cfg.glow) return;
    const now = performance.now();
    if (now - lastDraw < 30) return; // ~30fps
    attach();
    const v = document.querySelector('#movie_player video');
    if (!v || v.readyState < 2 || !lastW || !gctx) return;
    lastDraw = now;
    try {
      drawGlow(v);
      root.classList.add('ayl-ready'); // fades the glow in
    } catch (e) {
      console.warn('[Ambient Center] draw error, recovering', e);
      sizeCanvas();
    }
  }

  glow.addEventListener('contextlost', (e) => { e.preventDefault(); });
  glow.addEventListener('contextrestored', () => { sizeCanvas(); });

  function loop() { requestAnimationFrame(loop); tick(); }

  // ---------- layout: perfectly centered, fitted to viewport ----------
  function layout() {
    const v = document.querySelector('#movie_player video');
    if (!v || !v.videoWidth || !v.videoHeight) return;
    const ar = v.videoWidth / v.videoHeight;
    let w = innerWidth * cfg.size;
    let h = w / ar;
    if (h > innerHeight * cfg.size) {
      h = innerHeight * cfg.size;
      w = h * ar;
    }
    w = Math.round(w); h = Math.round(h);
    if (w === lastW && h === lastH) return;
    lastW = w; lastH = h;
    root.style.setProperty('--ayl-w', w + 'px');
    root.style.setProperty('--ayl-h', h + 'px');
    needClear = true;
    setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
  }

  // ---------- state ----------
  function apply() {
    const onWatch = location.pathname === '/watch';
    root.classList.toggle('ayl-on', cfg.enabled && onWatch);
    root.classList.toggle('ayl-glow', cfg.glow);
    root.style.setProperty('--ayl-opacity', cfg.intensity);
    root.style.setProperty('--ayl-blur', cfg.blur + 'px');
    layout();
  }

  chrome.storage.sync.get(DEFAULTS, (s) => { cfg = { ...DEFAULTS, ...s }; apply(); });
  chrome.storage.onChanged.addListener((changes) => {
    for (const k in changes) cfg[k] = changes[k].newValue;
    lastW = lastH = 0;
    apply();
  });

  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { sizeCanvas(); layout(); }, 60);
  });
  document.addEventListener('yt-navigate-start', () => {
    root.classList.remove('ayl-ready');
    lastW = lastH = 0;
    needClear = true;
  });
  document.addEventListener('yt-navigate-finish', apply);
  document.addEventListener('loadedmetadata', layout, true);
  document.addEventListener('emptied', () => { needClear = true; }, true);

  sizeCanvas();
  attach();
  requestAnimationFrame(loop);
  // Watchdog: if rAF is ever throttled/stalled, keep the glow alive anyway
  setInterval(() => {
    apply();
    const v = document.querySelector('#movie_player video');
    const stalled = performance.now() - lastDraw;
    if (stalled > 120) tick();
    // playing but nothing drawn for 2s -> rebuild the canvas from scratch
    if (v && !v.paused && lastW && stalled > 2000 && root.classList.contains('ayl-on') && cfg.glow) {
      sizeCanvas();
      attach();
      lastDraw = 0;
      tick();
    }
  }, 200);
})();
