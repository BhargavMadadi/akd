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

// Simple basketball countdown timer
const eventDate = new Date("November 16, 2025 18:30:00").getTime();

function updateTimer() {
  const now = new Date().getTime();
  const distance = eventDate - now;

  if (distance <= 0) {
    document.getElementById("timer").innerText = "Game On!";
    return;
  }

  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  document.getElementById("timer").innerText = 
    `${hours.toString().padStart(2,"0")}:${minutes.toString().padStart(2,"0")}:${seconds.toString().padStart(2,"0")}`;
}

setInterval(updateTimer, 1000);


// =========================
//  FLIP COUNTDOWN LOGIC
// =========================

// Set your event date/time here:
const akdEventTime = new Date("November 16, 2025 18:30:00").getTime(); // 6:30 PM show

// Helper: pad with 0s
function pad(num, size) {
  let s = num.toString();
  while (s.length < size) s = "0" + s;
  return s;
}

// Render one unit (days / hours / minutes / seconds)
function updateFlipUnit(unitElement, newValueStr) {
  const front = unitElement.querySelector(".flip-front");
  const back = unitElement.querySelector(".flip-back");
  const card = unitElement.querySelector(".flip-card");

  const currentValue = front.textContent;

  if (currentValue === newValueStr) return; // nothing changed

  // Set new values: front shows current, back shows next
  front.textContent = currentValue;
  back.textContent = newValueStr;

  // Trigger flip animation
  card.classList.add("flip-play");

  // When animation ends, lock in the new value and reset
  setTimeout(() => {
    front.textContent = newValueStr;
    card.classList.remove("flip-play");
  }, 600); // matches CSS transition 0.6s
}

function updateCountdown() {
  const now = new Date().getTime();
  let diff = akdEventTime - now;

  if (diff <= 0) {
    // If event is live or past
    ["days", "hours", "minutes", "seconds"].forEach((unit) => {
      const el = document.querySelector(`.flip-unit[data-unit="${unit}"] .flip-front`);
      if (el) el.textContent = "00";
    });
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff %= (1000 * 60 * 60 * 24);

  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff %= (1000 * 60 * 60);

  const minutes = Math.floor(diff / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const daysStr = pad(days, 3);
  const hoursStr = pad(hours, 2);
  const minutesStr = pad(minutes, 2);
  const secondsStr = pad(seconds, 2);

  const units = [
    { name: "days", value: daysStr },
    { name: "hours", value: hoursStr },
    { name: "minutes", value: minutesStr },
    { name: "seconds", value: secondsStr },
  ];

  units.forEach(({ name, value }) => {
    const unitEl = document.querySelector(`.flip-unit[data-unit="${name}"]`);
    if (unitEl) updateFlipUnit(unitEl, value);
  });
}

// Kick it off
updateCountdown();
setInterval(updateCountdown, 1000);
