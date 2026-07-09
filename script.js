(() => {
  const header = document.querySelector('[data-elevate]');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');

  const elevate = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 10);
  };
  elevate();
  window.addEventListener('scroll', elevate, { passive: true });

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      document.body.classList.toggle('nav-open', isOpen);
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      document.body.classList.remove('nav-open');
      menuButton.setAttribute('aria-expanded', 'false');
    }));
  }

  const revealTargets = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    revealTargets.forEach(el => observer.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('in'));
  }

  const tilt = document.querySelector('[data-tilt-card] picture');
  if (tilt && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const reset = () => { tilt.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0)'; };
    tilt.parentElement.addEventListener('mousemove', event => {
      const rect = tilt.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      tilt.style.transform = `rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg) translateZ(14px)`;
    });
    tilt.parentElement.addEventListener('mouseleave', reset);
  }

  const demoForm = document.querySelector('[data-demo-form]');
  const formNote = document.querySelector('[data-form-note]');
  if (demoForm && formNote) {
    demoForm.addEventListener('submit', event => {
      event.preventDefault();
      formNote.textContent = 'Signup form placeholder — connect this to your email provider before publishing.';
    });
  }

  const canvas = document.getElementById('signal-field');
  const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (canvas && ctx) {
    let width = 0;
    let height = 0;
    let columns = [];
    const chars = '010101001101001101011000101101';
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = canvas.width = Math.floor(window.innerWidth * dpr);
      height = canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const columnCount = Math.floor(width / 24);
      columns = Array.from({ length: columnCount }, () => Math.random() * height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      ctx.fillStyle = 'rgba(5, 7, 11, 0.075)';
      ctx.fillRect(0, 0, screenW, screenH);
      ctx.font = '12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
      ctx.fillStyle = 'rgba(85, 213, 238, 0.22)';
      columns.forEach((y, index) => {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = index * 24;
        ctx.fillText(text, x, y);
        columns[index] = y > screenH + Math.random() * 800 ? 0 : y + 11 + Math.random() * 7;
      });
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    if (reduced) {
      draw();
    } else {
      const loop = () => {
        draw();
        requestAnimationFrame(loop);
      };
      loop();
    }
  }
})();
