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

  const slider = document.querySelector('[data-app-slider]');
  if (slider) {
    const viewport = slider.querySelector('[data-slider-viewport]');
    const slides = [...slider.querySelectorAll('[data-app-slide]')];
    const previous = slider.querySelector('[data-slider-prev]');
    const next = slider.querySelector('[data-slider-next]');
    const dots = [...slider.querySelectorAll('[data-slider-to]')];
    const current = slider.querySelector('[data-slider-current]');
    let activeIndex = -1;
    let updateFrame = 0;

    const updateActiveSlide = () => {
      updateFrame = 0;
      const width = viewport.clientWidth || 1;
      const index = Math.max(0, Math.min(slides.length - 1, Math.round(viewport.scrollLeft / width)));
      if (index === activeIndex) return;
      activeIndex = index;
      slides.forEach((slide, slideIndex) => {
        slide.setAttribute('aria-hidden', String(slideIndex !== index));
      });
      dots.forEach((dot, dotIndex) => {
        if (dotIndex === index) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      if (current) current.textContent = String(index + 1).padStart(2, '0');
      if (previous) previous.disabled = index === 0;
      if (next) next.disabled = index === slides.length - 1;
    };

    const scheduleUpdate = () => {
      if (!updateFrame) updateFrame = window.requestAnimationFrame(updateActiveSlide);
    };

    const goTo = (index) => {
      const boundedIndex = Math.max(0, Math.min(slides.length - 1, index));
      viewport.scrollTo({
        left: viewport.clientWidth * boundedIndex,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
      scheduleUpdate();
    };

    previous?.addEventListener('click', () => goTo(activeIndex - 1));
    next?.addEventListener('click', () => goTo(activeIndex + 1));
    dots.forEach((dot) => {
      dot.addEventListener('click', () => goTo(Number(dot.dataset.sliderTo)));
    });
    viewport.addEventListener('scroll', scheduleUpdate, { passive: true });
    viewport.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goTo(activeIndex + 1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goTo(activeIndex - 1);
      } else if (event.key === 'Home') {
        event.preventDefault();
        goTo(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        goTo(slides.length - 1);
      }
    });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    updateActiveSlide();
  }
})();
