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

