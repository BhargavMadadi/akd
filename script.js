// ===== AAJ KA DHAMAKA – interactive stars + parallax =====
(function () {
  const canvas = document.getElementById("stars-canvas");
  const hero = document.querySelector(".hero");
  const planetGroup = document.querySelector(".planet-bg");
  const heroInner = document.querySelector(".hero-inner");

  if (!canvas || !hero) return;

  const ctx = canvas.getContext("2d");
  let w, h, dpr, stars = [];

  const STAR_BASE = 320;
  const BASE_SPEED = 0.02;
  const TWINKLE_SPEED = 0.02;   // a bit faster twinkle
  const PARALLAX = 18;          // stronger parallax effect
  const BLEED = 1.25;

  let mouse = { x: 0.5, y: 0.5 };

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function resize() {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const rect = hero.getBoundingClientRect();
    w = Math.max(1, Math.floor(rect.width * dpr));
    h = Math.max(1, Math.floor(rect.height * BLEED * dpr));

    canvas.width = w;
    canvas.height = h;

    const count = Math.round(STAR_BASE * (w * h) / (1200 * 700));
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rand(0.6, 1.8) * dpr,
        a: rand(0.25, 0.85),
        tw: rand(0, Math.PI * 2),
        z: rand(0.2, 1),
        hue: rand(220, 280),
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    const grd = ctx.createRadialGradient(
      w * 0.65, h * 0.35, Math.min(w, h) * 0.05,
      w * 0.5, h * 0.6,  Math.max(w, h) * 0.9
    );
    grd.addColorStop(0, "rgba(80,50,160,0.05)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    const heroRect = hero.getBoundingClientRect();
    const mx = Math.max(0, Math.min(1, (mouse.x - heroRect.left) / heroRect.width));
    const my = Math.max(0, Math.min(1, (mouse.y - heroRect.top) / heroRect.height));

    for (const s of stars) {
      const twA = (Math.sin(s.tw) * 0.5 + 0.5) * 0.8;
      let alpha = Math.min(1, s.a * 0.4 + twA * 0.6);

      // parallax offset
      const px = (mx - 0.5) * PARALLAX * (1 - s.z);
      const py = (my - 0.5) * PARALLAX * (1 - s.z);

      // interactive highlight: stars near cursor get brighter
      const sx = (s.x / w);
      const sy = (s.y / h);
      const dx = sx - mx;
      const dy = sy - (my * BLEED); // account for tall canvas
      const dist = Math.sqrt(dx*dx + dy*dy);  // 0 .. ~1.4
      const highlight = Math.max(0, 1 - dist * 2.1);  // tight radius

      alpha *= (1 + 0.9 * highlight); // brighten near cursor

      // glow
      ctx.beginPath();
      ctx.arc(s.x + px, s.y + py, s.r * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue}, 90%, 70%, ${alpha * 0.16})`;
      ctx.fill();

      // core
      ctx.beginPath();
      ctx.arc(s.x + px, s.y + py, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue}, 100%, 88%, ${alpha})`;
      ctx.fill();

      // drift + twinkle
      s.x += BASE_SPEED * s.z;
      s.tw += TWINKLE_SPEED + (1 - s.z) * 0.012;

      if (s.x - 10 > w) {
        s.x = -10;
        s.y = Math.random() * h;
      }
    }

    requestAnimationFrame(draw);
  }

  // parallax for planet + hero text
  function updateParallax(e) {
    const rect = hero.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    const x = src.clientX - rect.left;
    const y = src.clientY - rect.top;

    mouse.x = src.clientX;
    mouse.y = src.clientY;

    const nx = Math.max(0, Math.min(1, x / rect.width)) - 0.5;
    const ny = Math.max(0, Math.min(1, y / rect.height)) - 0.5;

    const planetShiftX = nx * 20;
    const planetShiftY = ny * 16;
    const textShiftX = nx * -9;
    const textShiftY = ny * -7;

    if (planetGroup) {
      planetGroup.style.transform = `translate3d(${planetShiftX}px, ${planetShiftY}px, 0)`;
    }
    if (heroInner) {
      heroInner.style.transform = `translate3d(${textShiftX}px, ${textShiftY}px, 0)`;
    }
  }

  const ro = new ResizeObserver(resize);
  ro.observe(hero);

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("mousemove", updateParallax, { passive: true });
  window.addEventListener("touchmove", updateParallax, { passive: true });

  resize();
  draw();
})();
