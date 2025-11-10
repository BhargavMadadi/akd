// ===== Interactive Starfield with vertical bleed =====
(function(){
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;

  const host = canvas.closest('.hero');  // size to the hero
  const ctx = canvas.getContext('2d');

  let w, h, dpr, stars = [];
  const STAR_COUNT = 320;
  const BASE_SPEED = 0.02;
  const TWINKLE_SPEED = 0.015;
  const PARALLAX = 12;

  // how much taller than the hero the canvas should be
  const HEIGHT_BLEED = 1.25;   // must match CSS (height: 125%)
  // canvas is vertically centered around the hero (CSS top: -12.5%)

  let mouse = { x: 0.5, y: 0.5 };

  function resize(){
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const rect = host.getBoundingClientRect();
    const cw = Math.max(1, Math.floor(rect.width  * dpr));
    const ch = Math.max(1, Math.floor(rect.height * HEIGHT_BLEED * dpr));
    canvas.width  = w = cw;
    canvas.height = h = ch;

    initStars(); // regenerate on size to keep density even
  }

  function rand(a,b){ return a + Math.random()*(b-a); }

  function initStars(){
    stars = [];
    const count = Math.round(STAR_COUNT * (w*h) / (1200*700)); // density scale
    for (let i=0;i<count;i++){
      stars.push({
        x: Math.random()*w,
        y: Math.random()*h,
        r: rand(0.6, 1.8) * dpr,
        a: rand(0.25, 0.85),
        tw: rand(0, Math.PI*2),
        z: rand(0.2, 1),
        hue: rand(220, 280)
      });
    }
  }

  function draw(){
    ctx.clearRect(0,0,w,h);

    // gentle backdrop
    const grd = ctx.createRadialGradient(
      w*0.65, h*0.35, Math.min(w,h)*0.05,
      w*0.5, h*0.6,  Math.max(w,h)*0.9
    );
    grd.addColorStop(0, 'rgba(80,50,160,0.05)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0,0,w,h);

    // compute parallax from hero, not canvas (they align)
    const heroRect = host.getBoundingClientRect();
    const mx = Math.max(0, Math.min(1, (mouse.x - heroRect.left) / heroRect.width));
    const my = Math.max(0, Math.min(1, (mouse.y - heroRect.top)  / heroRect.height));

    for (const s of stars){
      const twA = (Math.sin(s.tw) * 0.5 + 0.5) * 0.7;
      const alpha = Math.min(1, s.a * 0.5 + twA * 0.5);
      const px = (mx - 0.5) * PARALLAX * (1 - s.z);
      const py = (my - 0.5) * PARALLAX * (1 - s.z);

      // glow
      ctx.beginPath();
      ctx.arc(s.x + px, s.y + py, s.r*2.2, 0, Math.PI*2);
      ctx.fillStyle = `hsla(${s.hue}, 90%, 70%, ${alpha*0.12})`;
      ctx.fill();

      // core
      ctx.beginPath();
      ctx.arc(s.x + px, s.y + py, s.r, 0, Math.PI*2);
      ctx.fillStyle = `hsla(${s.hue}, 100%, 88%, ${alpha})`;
      ctx.fill();

      // drift + twinkle
      s.x += BASE_SPEED * s.z;
      s.tw += TWINKLE_SPEED + (1 - s.z) * 0.01;

      // wrap horizontally
      if (s.x - 10 > w) { s.x = -10; s.y = Math.random()*h; }
    }
    requestAnimationFrame(draw);
  }

  function onMove(e){
    const src = e.touches ? e.touches[0] : e;
    mouse.x = src.clientX; mouse.y = src.clientY;
  }

  const ro = new ResizeObserver(resize);
  ro.observe(host);

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: true });

  resize();
  draw();
})();
