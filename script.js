(() => {
  const WHATSAPP = 'https://wa.me/5491169128457';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = window.matchMedia('(min-width: 900px)');
  const waLink = (message) => `${WHATSAPP}?text=${encodeURIComponent(message)}`;

  /* ---------- Menú del celular ---------- */
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

  /* ---------- Aparición al hacer scroll ---------- */
  const revealItems = [...document.querySelectorAll('[data-reveal]')];
  if (revealItems.length && !reduceMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          instance.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -34px 0px' });
    revealItems.forEach((item, index) => item.style.setProperty('--reveal-delay', `${(index % 3) * 70}ms`));
    document.documentElement.classList.add('motion-ready');
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  /* ---------- Parallax suave de la portada (escritorio) ---------- */
  const parallaxItems = [...document.querySelectorAll('[data-parallax]')];
  if (parallaxItems.length && !reduceMotion) {
    let frame = 0;
    const updateParallax = () => {
      frame = 0;
      if (!desktop.matches) return;
      parallaxItems.forEach((item) => {
        const y = Math.min(window.scrollY, window.innerHeight) * 0.18;
        item.style.setProperty('--parallax-y', `${y.toFixed(1)}px`);
      });
    };
    window.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(updateParallax); }, { passive: true });
    updateParallax();
  }

  /* ---------- Moneda de los planes ---------- */
  let currentCurrency = 'ars';
  const currencyListeners = [];
  const switcher = document.querySelector('[data-currency-switcher]');
  if (switcher) {
    const buttons = [...switcher.querySelectorAll('[data-currency-value]')];
    const note = switcher.querySelector('[data-currency-note]');
    const cards = [...document.querySelectorAll('[data-plan-card]')];

    const setCurrency = (currency) => {
      currentCurrency = currency;
      const isUsd = currency === 'usd';
      buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.currencyValue === currency)));

      cards.forEach((card) => {
        const planName = card.dataset.planName;
        const amount = isUsd ? card.dataset.priceUsd : card.dataset.priceArs;
        const price = card.querySelector('[data-plan-price]');
        const period = card.querySelector('[data-plan-period]');
        const perDay = card.querySelector('[data-plan-perday]');
        const cta = card.querySelector('[data-plan-cta]');
        const planNote = card.querySelector('[data-plan-note]');
        const mpUrl = (card.dataset.mpUrl || '').trim();

        if (price) price.textContent = amount;
        if (period) period.textContent = isUsd ? 'USD · mes' : 'ARS / mes';
        if (perDay) perDay.textContent = isUsd ? perDay.dataset.perdayUsd : perDay.dataset.perdayArs;
        if (!cta) return;
        cta.target = '_blank';
        cta.rel = 'noopener';

        if (isUsd) {
          cta.href = waLink(`Hola Lean, vengo desde los planes de la web de ELESFIT. Me interesa el plan ${planName} (${amount} por mes) y quisiera consultarte cómo abonarlo en dólares. ¿Qué medios de pago están disponibles y cómo puedo empezar?`);
          cta.textContent = 'Consultar pago en dólares';
          cta.setAttribute('aria-label', `Consultar medios de pago en dólares para ${planName}, ${amount} por mes`);
          if (planNote) planNote.textContent = 'WhatsApp se abrirá con un mensaje para consultar cómo abonar este plan en dólares.';
        } else if (mpUrl) {
          cta.href = mpUrl;
          cta.textContent = 'Pagar con Mercado Pago';
          cta.setAttribute('aria-label', `Pagar ${planName} con Mercado Pago, ${amount} por mes`);
          if (planNote) planNote.textContent = 'Pago en pesos argentinos mediante Mercado Pago.';
        } else {
          cta.href = waLink(`Hola Lean, vi los planes en la web de ELESFIT y me interesa el plan ${planName} (${amount} ARS por mes). Prefiero pagar en pesos argentinos. ¿Me compartís el enlace de Mercado Pago para empezar?`);
          cta.textContent = 'Pedir link de Mercado Pago';
          cta.setAttribute('aria-label', `Pedir el enlace de Mercado Pago para ${planName}, ${amount} por mes`);
          if (planNote) planNote.textContent = 'Te comparto por WhatsApp el enlace de Mercado Pago.';
        }
      });

      if (note) {
        note.textContent = isUsd
          ? 'En dólares, cada plan muestra su precio mensual y abre WhatsApp para consultar los medios de pago.'
          : 'En pesos argentinos, cada botón abre el enlace de pago de Mercado Pago.';
      }
      currencyListeners.forEach((listener) => listener());
    };

    buttons.forEach((button) => button.addEventListener('click', () => setCurrency(button.dataset.currencyValue)));
    setCurrency('ars');
  }

  /* ---------- App: el teléfono cambia de pantalla con el scroll ---------- */
  const showcase = document.querySelector('[data-app-showcase]');
  if (showcase) {
    const features = [...showcase.querySelectorAll('[data-feature]')];
    const screens = [...showcase.querySelectorAll('.app-stage [data-screen]')];
    const dots = [...showcase.querySelectorAll('.stage-dots i')];
    const stageNum = showcase.querySelector('[data-stage-num]');
    const stageCount = showcase.querySelector('[data-stage-count]');
    const stageLabel = showcase.querySelector('[data-stage-label]');
    let active = -1;

    const activate = (index) => {
      if (index === active) return;
      active = index;
      const label = features[index]?.querySelector('.feature-label')?.textContent || '';
      const number = String(index + 1).padStart(2, '0');
      features.forEach((feature, i) => feature.classList.toggle('is-active', i === index));
      screens.forEach((screen, i) => {
        screen.classList.toggle('is-active', i === index);
        screen.classList.toggle('is-before', i < index);
      });
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
      if (stageNum) stageNum.textContent = number;
      if (stageCount) stageCount.textContent = number;
      if (stageLabel) stageLabel.textContent = label;
    };

    if ('IntersectionObserver' in window) {
      const featureObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) activate(Number(entry.target.dataset.feature));
        });
      }, { rootMargin: '-45% 0px -45% 0px' });
      features.forEach((feature) => featureObserver.observe(feature));
    }
    activate(0);
  }

  /* ---------- Test: ¿qué plan te conviene? ---------- */
  const test = document.querySelector('[data-plan-test]');
  if (test) {
    const answers = { q1: null, q2: null, q3: null };
    const empty = document.querySelector('[data-test-empty]');
    const result = document.querySelector('[data-test-result]');
    const count = document.querySelector('[data-test-count]');
    const out = {
      name: document.querySelector('[data-result-name]'),
      why: document.querySelector('[data-result-why]'),
      price: document.querySelector('[data-result-price]'),
      period: document.querySelector('[data-result-period]'),
      cta: document.querySelector('[data-result-cta]'),
      wa: document.querySelector('[data-result-wa]')
    };
    const reasons = {
      base: 'Tenés experiencia y te organizás solo: necesitás un plan a medida y la app para seguirlo.',
      pro: 'Querés que alguien siga tu progreso, responda tus dudas y ajuste el plan cada mes.',
      elite: 'Buscás el acompañamiento más completo: corrección técnica por video, guía alimentaria y ajustes quincenales.'
    };

    const recommend = () => {
      if (!answers.q1 || !answers.q2 || !answers.q3) return null;
      if (answers.q3 === 'si' || answers.q2 === 'todo') return 'elite';
      if (answers.q2 === 'soporte' || answers.q1 === 'nuevo') return 'pro';
      return 'base';
    };

    const render = () => {
      const answered = Object.values(answers).filter(Boolean).length;
      if (count) count.textContent = String(answered);
      const key = recommend();
      if (!key) {
        if (result) result.hidden = true;
        if (empty) empty.hidden = false;
        return;
      }
      const card = document.querySelector(`[data-plan-card][data-plan-key="${key}"]`);
      if (!card) return;
      const isUsd = currentCurrency === 'usd';
      const planName = card.dataset.planName;
      const shortName = planName.replace('ELESFIT ', '');
      const amount = isUsd ? card.dataset.priceUsd : card.dataset.priceArs;
      const planCta = card.querySelector('[data-plan-cta]');

      out.name.textContent = shortName;
      out.why.textContent = reasons[key];
      out.price.textContent = amount;
      out.period.textContent = isUsd ? 'USD · mes' : 'ARS / mes';
      if (planCta) {
        out.cta.href = planCta.href;
        out.cta.firstChild.textContent = `${planCta.textContent} `;
      }
      out.wa.href = waLink(`Hola Lean, hice el test de la web y me recomendó el plan ${planName}. Quiero consultarte.`);

      const wasHidden = result.hidden;
      empty.hidden = true;
      result.hidden = false;
      if (wasHidden && !reduceMotion && !desktop.matches) {
        result.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    test.querySelectorAll('[data-q]').forEach((button) => {
      button.addEventListener('click', () => {
        const question = button.dataset.q;
        answers[question] = button.dataset.value;
        test.querySelectorAll(`[data-q="${question}"]`).forEach((option) => {
          option.setAttribute('aria-pressed', String(option === button));
        });
        render();
      });
    });
    currencyListeners.push(render);
    render();
  }

  /* ---------- Videos: solo se reproducen en pantalla ---------- */
  const videos = [...document.querySelectorAll('[data-autoplay-video]')];
  videos.forEach((video) => {
    if (reduceMotion) {
      video.removeAttribute('autoplay');
      video.pause();
      video.setAttribute('controls', '');
    }
  });
  if (videos.length && !reduceMotion && 'IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      });
    }, { threshold: 0.2 });
    videos.forEach((video) => videoObserver.observe(video));
  }

  /* ---------- WhatsApp flotante después de la portada ---------- */
  const waFloat = document.querySelector('[data-wa-float]');
  const hero = document.querySelector('.hero');
  if (waFloat && hero && 'IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(([entry]) => {
      waFloat.classList.toggle('is-visible', !entry.isIntersecting);
    }, { threshold: 0.05 });
    heroObserver.observe(hero);
  }
})();
