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

  const currencySwitcher = document.querySelector('[data-currency-switcher]');
  if (currencySwitcher) {
    const currencyButtons = [...currencySwitcher.querySelectorAll('[data-currency-value]')];
    const currencyNote = currencySwitcher.querySelector('[data-currency-note]');
    const planCards = [...document.querySelectorAll('[data-plan-card]')];

    const setCurrency = (currency) => {
      const isUsd = currency === 'usd';
      currencyButtons.forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.currencyValue === currency));
      });

      planCards.forEach((card) => {
        const planName = card.dataset.planName;
        const amount = isUsd ? card.dataset.priceUsd : card.dataset.priceArs;
        const price = card.querySelector('[data-plan-price]');
        const period = card.querySelector('[data-plan-period]');
        const cta = card.querySelector('[data-plan-cta]');
        const note = card.querySelector('[data-plan-note]');
        const mercadoPagoUrl = (card.dataset.mpUrl || '').trim();

        if (price) price.textContent = amount;
        if (period) period.textContent = isUsd ? 'USD · mes' : 'ARS / mes';

        if (isUsd) {
          const message = `Hola Lean, vengo desde los planes de la web de ELESFIT. Me interesa el plan ${planName} (${amount} por mes) y quisiera consultarte cómo abonarlo en dólares. ¿Qué medios de pago están disponibles y cómo puedo empezar?`;
          if (cta) {
            cta.href = `https://wa.me/5491169128457?text=${encodeURIComponent(message)}`;
            cta.textContent = 'Consultar pago en dólares';
            cta.setAttribute('aria-label', `Consultar medios de pago en dólares para ${planName}, ${amount} por mes`);
            cta.target = '_blank';
            cta.rel = 'noopener';
          }
          if (note) note.textContent = 'WhatsApp se abrirá con un mensaje para consultar cómo abonar este plan en dólares.';
        } else if (mercadoPagoUrl) {
          if (cta) {
            cta.href = mercadoPagoUrl;
            cta.textContent = 'Pagar con Mercado Pago';
            cta.setAttribute('aria-label', `Pagar ${planName} con Mercado Pago, ${amount} por mes`);
            cta.target = '_blank';
            cta.rel = 'noopener';
          }
          if (note) note.textContent = 'Pago en pesos argentinos mediante Mercado Pago.';
        } else {
          const message = `Hola Lean, vi los planes en la web de ELESFIT y me interesa el plan ${planName} (${amount} ARS por mes). Prefiero pagar en pesos argentinos. ¿Me compartís el enlace de Mercado Pago para empezar?`;
          if (cta) {
            cta.href = `https://wa.me/5491169128457?text=${encodeURIComponent(message)}`;
            cta.textContent = 'Pedir link de Mercado Pago';
            cta.setAttribute('aria-label', `Pedir el enlace de Mercado Pago para ${planName}, ${amount} por mes`);
            cta.target = '_blank';
            cta.rel = 'noopener';
          }
          if (note) note.textContent = 'Te comparto por WhatsApp el enlace de Mercado Pago.';
        }
      });

      if (currencyNote) {
        currencyNote.textContent = isUsd
          ? 'En dólares, cada plan muestra su precio mensual y abre WhatsApp para consultar los medios de pago.'
          : 'En pesos argentinos, cada botón abre el enlace de pago de Mercado Pago.';
      }
    };

    currencyButtons.forEach((button) => {
      button.addEventListener('click', () => setCurrency(button.dataset.currencyValue));
    });
    setCurrency('ars');
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
        slide.toggleAttribute('inert', slideIndex !== index);
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

    const screenSwitcher = slider.querySelector('[data-app-screen-switcher]');
    if (screenSwitcher) {
      const tabs = [...screenSwitcher.querySelectorAll('[data-app-screen-tab]')];
      const panels = [...screenSwitcher.querySelectorAll('[data-app-screen-panel]')];
      const activateScreen = (index, moveFocus = false) => {
        tabs.forEach((tab, tabIndex) => {
          const selected = tabIndex === index;
          tab.setAttribute('aria-selected', String(selected));
          tab.tabIndex = selected ? 0 : -1;
        });
        panels.forEach((panel, panelIndex) => {
          panel.hidden = panelIndex !== index;
        });
        if (moveFocus) tabs[index]?.focus();
      };

      tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => activateScreen(index));
        tab.addEventListener('keydown', (event) => {
          let nextIndex;
          if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
          else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
          else if (event.key === 'Home') nextIndex = 0;
          else if (event.key === 'End') nextIndex = tabs.length - 1;
          else return;

          event.preventDefault();
          event.stopPropagation();
          activateScreen(nextIndex, true);
        });
      });

      if (tabs.length && panels.length === tabs.length) activateScreen(0);
    }

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
