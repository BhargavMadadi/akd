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
  const BLEED = 1.05;

  let mouse = { x: 0.5, y: 0.5 };

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function resize() {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    w = window.innerWidth * dpr;
    h = window.innerHeight * dpr;


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


// ============ TIP-OFF FLIP COUNTDOWN ============

// Set your event date & time (local time)
const tipOffDate = new Date("2026-03-07T17:30:00"); // March 7, 2026, 5:30 PM

const flipUnits = {
  days:    document.querySelector('.flip-unit[data-unit="days"]'),
  hours:   document.querySelector('.flip-unit[data-unit="hours"]'),
  minutes: document.querySelector('.flip-unit[data-unit="minutes"]'),
  seconds: document.querySelector('.flip-unit[data-unit="seconds"]'),
};

function pad(value, length) {
  return value.toString().padStart(length, "0");
}

function setFlip(unitKey, newValue) {
  const unit = flipUnits[unitKey];
  if (!unit) return;

  const card = unit.querySelector(".flip-card");
  const front = unit.querySelector(".flip-front");
  const back = unit.querySelector(".flip-back");

  const currentValue = front.textContent.trim();
  if (currentValue === newValue) return; // no change, no flip

  // Prepare back face with the new value
  back.textContent = newValue;

  // Trigger flip
  card.classList.add("is-flipping");

  // After animation, lock in new value on front and reset
  setTimeout(() => {
    front.textContent = newValue;
    card.classList.remove("is-flipping");
  }, 650); // slightly longer than CSS transition
}

function updateCountdown() {
  const now = new Date();
  let diff = tipOffDate - now;

  if (diff <= 0) {
    // Event started / passed
    setFlip("days", "000");
    setFlip("hours", "00");
    setFlip("minutes", "00");
    setFlip("seconds", "00");
    return;
  }

  const seconds = Math.floor(diff / 1000) % 60;
  const minutes = Math.floor(diff / (1000 * 60)) % 60;
  const hours   = Math.floor(diff / (1000 * 60 * 60)) % 24;
  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));

  setFlip("days",    pad(days, 3));
  setFlip("hours",   pad(hours, 2));
  setFlip("minutes", pad(minutes, 2));
  setFlip("seconds", pad(seconds, 2));
}

// ============ TIMELINE SCROLL FADE-IN ============

(function () {
  const items = document.querySelectorAll(".timeline-item");
  if (!items.length) return;

  // If the browser doesn't support IntersectionObserver, just show everything
  if (!("IntersectionObserver" in window)) {
    items.forEach(el => el.classList.add("timeline-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("timeline-visible");
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    {
      threshold: 0.25,
    }
  );

  items.forEach(el => observer.observe(el));
})();


// kick it off
updateCountdown();
setInterval(updateCountdown, 1000);
