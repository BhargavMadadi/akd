/* ============================================================
   AKD script.js (single source of truth)
   - Mobile nav drawer (ONE system) — aligned to styles.css (body.menu-open)
   - Stars + parallax (home only; safely guarded)
   - Countdown flip (home only; safely guarded)
   - Timeline scroll reveal (history only; safely guarded)
   ============================================================ */

/* =========================
   Helpers
   ========================= */
function onReady(fn) {
  if (document.readyState !== "loading") fn();
  else document.addEventListener("DOMContentLoaded", fn);
}

/* ============================================================
   1) MOBILE NAV DRAWER — SINGLE SYSTEM
   CSS expects:
   - .mobile-nav-overlay (backdrop)
   - .mobile-nav (drawer)
   - body.menu-open toggled
   Markup (recommended):
   - #navToggle (button)  class="nav-toggle"
   - #navBackdrop (div)   class="mobile-nav-overlay" hidden
   - #mobileNav (aside)   class="mobile-nav" hidden
   - #navClose (button)   class="mobile-nav-close" (optional)
   ============================================================ */
onReady(() => {
  // Remove duplicates first (avoid wiring to a removed node)
  const dupDrawers = document.querySelectorAll("#mobileNav");
  if (dupDrawers.length > 1) {
    for (let i = 1; i < dupDrawers.length; i++) dupDrawers[i].remove();
  }
  const dupBackdrops = document.querySelectorAll("#navBackdrop");
  if (dupBackdrops.length > 1) {
    for (let i = 1; i < dupBackdrops.length; i++) dupBackdrops[i].remove();
  }

  const toggle = document.getElementById("navToggle");
  const drawer = document.getElementById("mobileNav");
  const backdrop = document.getElementById("navBackdrop");
  const closeBtn = document.getElementById("navClose");

  // If a page doesn't have the drawer markup, do nothing
  if (!toggle || !drawer || !backdrop) return;

  // Ensure aria-expanded has a default
  if (!toggle.hasAttribute("aria-expanded")) {
    toggle.setAttribute("aria-expanded", "false");
  }

  const isOpen = () => toggle.getAttribute("aria-expanded") === "true";

  function openMenu() {
    // Unhide so it is in the a11y tree and can animate
    drawer.hidden = false;
    backdrop.hidden = false;

    // Let the browser apply display before starting transition
    requestAnimationFrame(() => {
      document.body.classList.add("menu-open"); // matches styles.css
    });

    toggle.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    document.body.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");

    // Let slide-out transition finish before hiding
    window.setTimeout(() => {
      drawer.hidden = true;
      backdrop.hidden = true;
    }, 220);
  }

  // Toggle open/close
  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation(); // prevent "same click" closing via overlay
    if (isOpen()) closeMenu();
    else openMenu();
  });

  // Close interactions
  backdrop.addEventListener("click", closeMenu);
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeMenu();
    });
  }

  // Prevent clicks inside the drawer from bubbling to the backdrop
  drawer.addEventListener("click", (e) => {
    e.stopPropagation();
    const link = e.target.closest("a");
    if (link) closeMenu();
  });

  // Close on Escape
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) closeMenu();
  });

  // Optional: if the viewport becomes desktop while open, close it
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900 && isOpen()) closeMenu();
  });
});

/* ============================================================
   2) STARS + PARALLAX (HOME)
   - Runs only if #stars-canvas and .hero exist
   ============================================================ */
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
  const TWINKLE_SPEED = 0.02;
  const PARALLAX = 18;
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
      w * 0.65,
      h * 0.35,
      Math.min(w, h) * 0.05,
      w * 0.5,
      h * 0.6,
      Math.max(w, h) * 0.9
    );
    grd.addColorStop(0, "rgba(80,50,160,0.05)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    const heroRect = hero.getBoundingClientRect();
    const mx = Math.max(
      0,
      Math.min(1, (mouse.x - heroRect.left) / heroRect.width)
    );
    const my = Math.max(
      0,
      Math.min(1, (mouse.y - heroRect.top) / heroRect.height)
    );

    for (const s of stars) {
      const twA = (Math.sin(s.tw) * 0.5 + 0.5) * 0.8;
      let alpha = Math.min(1, s.a * 0.4 + twA * 0.6);

      const px = (mx - 0.5) * PARALLAX * (1 - s.z);
      const py = (my - 0.5) * PARALLAX * (1 - s.z);

      const sx = s.x / w;
      const sy = s.y / h;
      const dx = sx - mx;
      const dy = sy - my * BLEED;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const highlight = Math.max(0, 1 - dist * 2.1);
      alpha *= 1 + 0.9 * highlight;

      ctx.beginPath();
      ctx.arc(s.x + px, s.y + py, s.r * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue}, 90%, 70%, ${alpha * 0.16})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(s.x + px, s.y + py, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue}, 100%, 88%, ${alpha})`;
      ctx.fill();

      s.x += BASE_SPEED * s.z;
      s.tw += TWINKLE_SPEED + (1 - s.z) * 0.012;

      if (s.x - 10 > w) {
        s.x = -10;
        s.y = Math.random() * h;
      }
    }

    requestAnimationFrame(draw);
  }

  function updateParallax(e) {
    const rect = hero.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;

    mouse.x = src.clientX;
    mouse.y = src.clientY;

    const x = src.clientX - rect.left;
    const y = src.clientY - rect.top;

    const nx = Math.max(0, Math.min(1, x / rect.width)) - 0.5;
    const ny = Math.max(0, Math.min(1, y / rect.height)) - 0.5;

    const planetShiftX = nx * 20;
    const planetShiftY = ny * 16;
    const textShiftX = nx * -9;
    const textShiftY = ny * -7;

    if (planetGroup)
      planetGroup.style.transform = `translate3d(${planetShiftX}px, ${planetShiftY}px, 0)`;
    if (heroInner)
      heroInner.style.transform = `translate3d(${textShiftX}px, ${textShiftY}px, 0)`;
  }

  const ro = new ResizeObserver(resize);
  ro.observe(hero);

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("mousemove", updateParallax, { passive: true });
  window.addEventListener("touchmove", updateParallax, { passive: true });

  resize();
  draw();
})();

/* ============================================================
   3) COUNTDOWN FLIP (HOME)
   - Runs only if .flip-unit elements exist
   ============================================================ */
(function () {
  const anyFlipUnit = document.querySelector('.flip-unit[data-unit="days"]');
  if (!anyFlipUnit) return;

  const tipOffDate = new Date("2026-03-07T17:30:00");

  const flipUnits = {
    days: document.querySelector('.flip-unit[data-unit="days"]'),
    hours: document.querySelector('.flip-unit[data-unit="hours"]'),
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
    const inner = unit.querySelector(".flip-inner");

    const currentValue = front ? front.textContent.trim() : "";
    if (currentValue === newValue) return;

    if (back) back.textContent = newValue;

    if (card) card.classList.add("is-flipping");
    if (inner && !card) inner.classList.add("is-flipping");

    setTimeout(() => {
      if (front) front.textContent = newValue;
      if (card) card.classList.remove("is-flipping");
      if (inner && !card) inner.classList.remove("is-flipping");
    }, 650);
  }

  function updateCountdown() {
    const now = new Date();
    let diff = tipOffDate - now;

    if (diff <= 0) {
      setFlip("days", "000");
      setFlip("hours", "00");
      setFlip("minutes", "00");
      setFlip("seconds", "00");
      return;
    }

    const seconds = Math.floor(diff / 1000) % 60;
    const minutes = Math.floor(diff / (1000 * 60)) % 60;
    const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    setFlip("days", pad(days, 3));
    setFlip("hours", pad(hours, 2));
    setFlip("minutes", pad(minutes, 2));
    setFlip("seconds", pad(seconds, 2));
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
})();

/* ============================================================
   4) TIMELINE SCROLL REVEAL (HISTORY)
   - Runs only if .timeline-item exists
   ============================================================ */
(function () {
  const items = document.querySelectorAll(".timeline-item");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("timeline-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("timeline-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25 }
  );

  items.forEach((el) => observer.observe(el));
})();
