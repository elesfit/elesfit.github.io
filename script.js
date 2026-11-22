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

  const carousel = document.querySelector('.app-carousel');
  if (carousel) {
    const track = carousel.querySelector('.app-gallery');
    const slides = [...carousel.querySelectorAll('.app-slide')];
    const dots = [...carousel.querySelectorAll('[data-slide-to]')];
    const previous = carousel.querySelector('[data-gallery-prev]');
    const next = carousel.querySelector('[data-gallery-next]');
    const counter = carousel.querySelector('.app-counter');
    let activeIndex = 0;
    let updateQueued = false;

    const setActive = (index) => {
      activeIndex = Math.max(0, Math.min(index, slides.length - 1));
      dots.forEach((dot, dotIndex) => {
        if (dotIndex === activeIndex) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      if (previous) previous.disabled = activeIndex === 0;
      if (next) next.disabled = activeIndex === slides.length - 1;
      if (counter) counter.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    };

    const goTo = (index) => {
      const targetIndex = Math.max(0, Math.min(index, slides.length - 1));
      const left = slides[targetIndex].offsetLeft - slides[0].offsetLeft;
      track.scrollTo({ left, behavior: reduceMotion ? 'auto' : 'smooth' });
      setActive(targetIndex);
    };

    const updateFromScroll = () => {
      updateQueued = false;
      const scrollLeft = track.scrollLeft;
      let nearestIndex = 0;
      let nearestDistance = Infinity;
      slides.forEach((slide, index) => {
        const distance = Math.abs((slide.offsetLeft - slides[0].offsetLeft) - scrollLeft);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });
      setActive(nearestIndex);
    };

    track.addEventListener('scroll', () => {
      if (!updateQueued) {
        updateQueued = true;
        window.requestAnimationFrame(updateFromScroll);
      }
    }, { passive: true });
    previous?.addEventListener('click', () => goTo(activeIndex - 1));
    next?.addEventListener('click', () => goTo(activeIndex + 1));
    dots.forEach((dot) => dot.addEventListener('click', () => goTo(Number(dot.dataset.slideTo))));
    track.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goTo(activeIndex - 1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goTo(activeIndex + 1);
      }
    });
    window.addEventListener('resize', () => window.requestAnimationFrame(updateFromScroll), { passive: true });
    setActive(0);
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
