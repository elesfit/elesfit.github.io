(() => {
  const menu = document.querySelector('.mobile-menu');
  if (menu) {
    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => { menu.open = false; });
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.open) {
        menu.open = false;
        menu.querySelector('summary')?.focus();
      }
    });
  }

  const elements = [...document.querySelectorAll('[data-reveal]')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!elements.length || reduceMotion || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries, instance) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        instance.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });

  elements.forEach((element, index) => {
    element.style.setProperty('--reveal-delay', `${(index % 3) * 75}ms`);
  });
  document.documentElement.classList.add('motion-ready');
  elements.forEach((element) => observer.observe(element));
})();
