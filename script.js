(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    document.addEventListener('click', (event) => {
      if (menu.open && !menu.contains(event.target)) menu.open = false;
    });
  }

  const elements = [...document.querySelectorAll('[data-reveal]')];
  if (elements.length && !reduceMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          instance.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -34px 0px' });

    elements.forEach((element, index) => {
      element.style.setProperty('--reveal-delay', `${(index % 3) * 60}ms`);
    });
    document.documentElement.classList.add('motion-ready');
    elements.forEach((element) => observer.observe(element));
  }

  const parallaxItems = [...document.querySelectorAll('[data-parallax]')];
  if (parallaxItems.length && !reduceMotion && window.matchMedia('(min-width: 821px)').matches) {
    let frame = 0;
    const updateParallax = () => {
      frame = 0;
      const viewHeight = window.innerHeight;
      parallaxItems.forEach((item) => {
        const bounds = item.getBoundingClientRect();
        if (bounds.bottom < 0 || bounds.top > viewHeight) return;
        const distance = (viewHeight / 2 - (bounds.top + bounds.height / 2)) * 0.018;
        item.style.setProperty('--parallax-y', `${Math.max(-11, Math.min(11, distance))}px`);
      });
    };
    const queueParallax = () => {
      if (!frame) frame = window.requestAnimationFrame(updateParallax);
    };
    window.addEventListener('scroll', queueParallax, { passive: true });
    window.addEventListener('resize', queueParallax, { passive: true });
    updateParallax();
  }
})();
