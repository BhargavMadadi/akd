// Hide/reveal header on scroll
(function(){
  let lastY = window.scrollY;
  const header = document.querySelector('.site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const goingDown = y > lastY && y > 80;
    header.classList.toggle('hide', goingDown);
    lastY = y;
  }, { passive: true });
})();

// Set active nav link based on filename
(function(){
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a=>{
    const href = a.getAttribute('href');
    if (!href) return;
    const target = href.split('#')[0] || 'index.html';
    if (target === path) a.setAttribute('aria-current','page');
  });
})();

// ===== Interactive Starfield for the hero =====
(function(){
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let w, h, dpr, stars = [];
  const STAR_COUNT = 300;          // tweak count here
  const BASE_SPEED = 0.02;         // slow drift
  const TWINKLE_SPEED = 0.015;
  const PARALLAX = 12;             // how much stars shift with mouse
  let mouse = { x: 0.5, y: 0.5 };  // normalized [0..1]

  function resize(){
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const rect = canvas.getBoundingClientRect();
    w = Math.floor(rect.width * dpr);
    h = Math.floor(rect.height * dpr);
    canvas.width = w; canvas.height = h;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    if (!stars.length) initStars();
  }

  function rand(a,b){ return a + Math.random()*(b-a); }

  function initStars(){
    stars = [];
    for (let i=0;i<STAR_COUNT;i++){
      stars.push({
        x: Math.random()*w,
        y: Math.random()*h,
        r: rand(0.6, 1.8) * dpr,            // radius
        a: rand(0.25, 0.85),                // base alpha
        tw: rand(0, Math.PI*2),             // twinkle phase
        z: rand(0.2, 1),                    // depth (parallax)
        hue: rand(220, 280)                 // a cool blue/purple tint
      });
    }
  }

  function draw(){
    ctx.clearRect(0,0,w,h);

    // gentle gradient backdrop to help stars pop
    const grd = ctx.createRadialGradient(
      w*0.65, h*0.35, Math.min(w,h)*0.05,
      w*0.5, h*0.6, Math.max(w,h)*0.9
    );
    grd.addColorStop(0, 'rgba(80,50,160,0.05)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0,0,w,h);

    for (const s of stars){
      // twinkle
      const twA = (Math.sin(s.tw) * 0.5 + 0.5) * 0.7; // 0..0.7
      const alpha = Math.min(1, s.a * 0.5 + twA * 0.5);

      // parallax offset based on mouse
      const px = (mouse.x - 0.5) * PARALLAX * (1 - s.z);
      const py = (mouse.y - 0.5) * PARALLAX * (1 - s.z);

      // soft glow
      ctx.beginPath();
      ctx.arc(s.x + px, s.y + py, s.r*2.2, 0, Math.PI*2);
      ctx.fillStyle = `hsla(${s.hue}, 90%, 70%, ${alpha*0.12})`;
      ctx.fill();

      // star core
      ctx.beginPath();
      ctx.arc(s.x + px, s.y + py, s.r, 0, Math.PI*2);
      ctx.fillStyle = `hsla(${s.hue}, 100%, 88%, ${alpha})`;
      ctx.fill();

      // drift + twinkle phase
      s.x += BASE_SPEED * s.z;     // slow pan to the right
      s.tw += TWINKLE_SPEED + (1 - s.z) * 0.01;

      // wrap
      if (s.x - 10 > w) { s.x = -10; s.y = Math.random()*h; }
    }

    requestAnimationFrame(draw);
  }

  // mouse / touch parallax
  function onMove(e){
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    mouse.x = Math.max(0, Math.min(1, x / rect.width));
    mouse.y = Math.max(0, Math.min(1, y / rect.height));
  }

  // Resize observer keeps canvas matched to hero size
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: true });

  // Kick off
  resize();
  draw();
})();

// ===== Interactive Starfield for the hero =====
(function(){
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;

  const host = canvas.parentElement; // the <section class="hero ...">
  const ctx = canvas.getContext('2d');
  let w, h, dpr, stars = [];
  const STAR_COUNT = 300;
  const BASE_SPEED = 0.02;
  const TWINKLE_SPEED = 0.015;
  const PARALLAX = 12;
  let mouse = { x: 0.5, y: 0.5 };

  function resize(){
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const rect = host.getBoundingClientRect();   // <-- measure the HERO, not the canvas
    w = Math.max(1, Math.floor(rect.width  * dpr));
    h = Math.max(1, Math.floor(rect.height * dpr));
    canvas.width = w;
    canvas.height = h;
    // CSS already stretches the canvas to the hero; no need to set style width/height here.

    // (re)populate stars if empty or after a big size change
    if (!stars.length || stars._w !== w || stars._h !== h) {
      initStars();
      stars._w = w; stars._h = h;
    }
  }

  function rand(a,b){ return a + Math.random()*(b-a); }

  function initStars(){
    stars = [];
    for (let i=0;i<STAR_COUNT;i++){
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

    // gentle backdrop so stars pop
    const grd = ctx.createRadialGradient(
      w*0.65, h*0.35, Math.min(w,h)*0.05,
      w*0.5, h*0.6,  Math.max(w,h)*0.9
    );
    grd.addColorStop(0, 'rgba(80,50,160,0.05)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0,0,w,h);

    for (const s of stars){
      const twA = (Math.sin(s.tw) * 0.5 + 0.5) * 0.7;
      const alpha = Math.min(1, s.a * 0.5 + twA * 0.5);
      const px = (mouse.x - 0.5) * PARALLAX * (1 - s.z);
      const py = (mouse.y - 0.5) * PARALLAX * (1 - s.z);

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

      // wrap
      if (s.x - 10 > w) { s.x = -10; s.y = Math.random()*h; }
    }

    requestAnimationFrame(draw);
  }

  // mouse/touch parallax
  function onMove(e){
    const rect = host.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    mouse.x = Math.max(0, Math.min(1, (src.clientX - rect.left) / rect.width));
    mouse.y = Math.max(0, Math.min(1, (src.clientY - rect.top) / rect.height));
  }

  // Observe the HERO (so canvas follows any size change)
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: true });

  resize();
  draw();
})();
