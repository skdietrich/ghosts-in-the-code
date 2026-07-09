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

  const closeMenu = () => {
    if (!menuButton || !nav) return;
    nav.classList.remove('open');
    document.body.classList.remove('nav-open');
    menuButton.setAttribute('aria-expanded', 'false');
  };

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      document.body.classList.toggle('nav-open', isOpen);
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) closeMenu();
    }, { passive: true });
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
    }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
    revealTargets.forEach(el => observer.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('in'));
  }

  const tilt = document.querySelector('[data-tilt-card] picture');
  const canTilt = tilt && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (canTilt) {
    const reset = () => { tilt.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0)'; };
    tilt.parentElement.addEventListener('mousemove', event => {
      const rect = tilt.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      tilt.style.transform = `rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg) translateZ(14px)`;
    });
    tilt.parentElement.addEventListener('mouseleave', reset);
  }

  const mailtoForm = document.querySelector('[data-mailto-form]');
  const formNote = document.querySelector('[data-form-note]');
  if (mailtoForm && formNote) {
    mailtoForm.addEventListener('submit', event => {
      event.preventDefault();
      const emailInput = mailtoForm.querySelector('input[type="email"]');
      const readerEmail = emailInput ? emailInput.value.trim() : '';
      const subject = encodeURIComponent('Ghosts in the Code updates');
      const body = encodeURIComponent(`Please add me to the Ghosts in the Code update list.

Reader email: ${readerEmail || '[not provided]'}`);
      window.location.href = `mailto:gitc@wolframtek.de?subject=${subject}&body=${body}`;
      formNote.textContent = 'Opening your email app. Send the message there to request updates.';
    });
  }

  const backToTop = document.querySelector('[data-back-to-top]');
  if (backToTop) {
    const toggleBackToTop = () => {
      backToTop.classList.toggle('visible', window.scrollY > 650);
    };
    toggleBackToTop();
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
  }

  const canvas = document.getElementById('signal-field');
  const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reducedData = window.matchMedia('(prefers-reduced-data: reduce)').matches;
  if (canvas && ctx && !reducedData) {
    let width = 0;
    let height = 0;
    let columns = [];
    let lastFrame = 0;
    const chars = '010101001101001101011000101101';
    const setCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth >= 1920 ? 1.25 : 1.5);
      width = canvas.width = Math.floor(window.innerWidth * dpr);
      height = canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const spacing = window.innerWidth >= 1920 ? 30 : window.innerWidth <= 430 ? 28 : 24;
      const columnCount = Math.max(8, Math.floor(width / spacing));
      columns = Array.from({ length: columnCount }, () => Math.random() * height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = time => {
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const interval = screenW >= 1920 ? 48 : 32;
      if (time && time - lastFrame < interval && !reduced) {
        requestAnimationFrame(draw);
        return;
      }
      lastFrame = time || 0;
      ctx.fillStyle = 'rgba(5, 7, 11, 0.075)';
      ctx.fillRect(0, 0, screenW, screenH);
      const fontSize = screenW <= 430 ? 10 : screenW >= 2560 ? 14 : 12;
      const spacing = screenW >= 1920 ? 30 : screenW <= 430 ? 28 : 24;
      ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      ctx.fillStyle = 'rgba(85, 213, 238, 0.22)';
      columns.forEach((y, index) => {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = index * spacing;
        ctx.fillText(text, x, y);
        columns[index] = y > screenH + Math.random() * 800 ? 0 : y + 9 + Math.random() * 7;
      });
      if (!reduced) requestAnimationFrame(draw);
    };

    let resizeTimer;
    const resize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        setCanvas();
        draw(0);
      }, 80);
    };

    setCanvas();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('orientationchange', resize, { passive: true });
    draw(0);
    if (!reduced) requestAnimationFrame(draw);
  }
})();


// Chapter preview tabs: progressive enhancement, no build system required.
(() => {
  const tabs = Array.from(document.querySelectorAll('[data-preview-tab]'));
  const panels = Array.from(document.querySelectorAll('[data-preview-panel]'));
  if (!tabs.length || !panels.length) return;

  const activate = (key, shouldScroll = false) => {
    let activePanel = null;

    tabs.forEach((tab) => {
      const isActive = tab.dataset.previewTab === key;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.previewPanel === key;
      panel.classList.toggle('active', isActive);
      if (isActive) {
        panel.removeAttribute('hidden');
        activePanel = panel;
      } else {
        panel.setAttribute('hidden', '');
      }
    });

    if (shouldScroll && activePanel) {
      window.setTimeout(() => {
        activePanel.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          block: 'start'
        });
      }, 60);
    }
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activate(tab.dataset.previewTab, true));
    tab.addEventListener('keydown', (event) => {
      const index = tabs.indexOf(tab);
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const nextIndex = event.key === 'ArrowRight'
        ? (index + 1) % tabs.length
        : (index - 1 + tabs.length) % tabs.length;
      tabs[nextIndex].focus();
      activate(tabs[nextIndex].dataset.previewTab, true);
    });
  });
})();


// AI/archive landing-page enhancements. Static GitHub Pages only; no backend and no exposed API keys.
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const boot = document.querySelector('[data-boot]');
  if (boot && !reducedMotion && !sessionStorage.getItem('gitcBootSeen')) {
    window.setTimeout(() => {
      boot.classList.add('done');
      sessionStorage.setItem('gitcBootSeen', '1');
    }, 3600);
  } else if (boot) {
    boot.classList.add('done');
  }

  const consoleData = {
    witness: {
      label: 'FILE 01 · THE WITNESS',
      title: 'The wrong man for easy belief.',
      copy: 'A professional skeptic, historian, and systems investigator becomes the witness. Before the testimony is accepted, the witness is audited. A professional skeptic, historian, and systems investigator becomes part of the evidence.',
      readout: ['signal confidence: narrative', 'reader path: clear', 'action: continue']
    },
    death: {
      label: 'FILE 02 · THE FIVE MINUTES',
      title: 'The body stops. The record continues.',
      copy: 'The ambulance sequence gives the landing page its engine: pain vanishes, the body is below, and the narrator discovers that whatever he is did not end with the machinery.',
      readout: ['threshold event', 'time window: five minutes', 'status: unresolved']
    },
    review: {
      label: 'FILE 03 · THE REVIEW',
      title: 'Not comfort. Accounting.',
      copy: 'The life review turns the book away from soft inspirational territory. The witness is made to experience the cost of his own record from the other side of the transaction.',
      readout: ['motive weighted', 'ledger active', 'comfort denied']
    },
    field: {
      label: 'FILE 11 · FIELD NIGHTS',
      title: 'The hotel floor that stopped taking guests.',
      copy: 'The field-night material gives the site a cinematic location: a twenty-fourth floor, an empty corridor, solo controls, a protected source, and the turn from investigation to search and rescue.',
      readout: ['floor: 24', 'method: solo', 'chorus removed']
    },
    machine: {
      label: 'FILE 06 · THE MACHINE',
      title: 'The newest machine asks the oldest question.',
      copy: 'AI grief technology is already rebuilding voices of the dead. The book asks what should be tested before synthetic presence becomes a product people trust.',
      readout: ['voice risk: high', 'ethics: unresolved', 'human need: active']
    }
  };

  const consoleBox = document.querySelector('[data-console]');
  if (consoleBox) {
    const tabs = Array.from(consoleBox.querySelectorAll('[data-console-tab]'));
    const label = consoleBox.querySelector('[data-console-label]');
    const title = consoleBox.querySelector('[data-console-title]');
    const copy = consoleBox.querySelector('[data-console-copy]');
    const readout = consoleBox.querySelector('.console-readout');
    const activate = key => {
      const item = consoleData[key] || consoleData.witness;
      tabs.forEach(tab => {
        const active = tab.dataset.consoleTab === key;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
      });
      if (label) label.textContent = item.label;
      if (title) title.textContent = item.title;
      if (copy) copy.textContent = item.copy;
      if (readout) readout.innerHTML = item.readout.map(line => `<span>${line}</span>`).join('');
    };
    tabs.forEach(tab => tab.addEventListener('click', () => activate(tab.dataset.consoleTab)));
  }

  const askData = {
    witness: ['QUERY · WITNESS', 'The witness is part of the evidence.', 'Ghosts in the Code does not ask the reader to trust an easy believer. It introduces a man trained to read systems, incentives, fraud, and rooms — then forces that man to become evidence against himself.'],
    ambulance: ['QUERY · AMBULANCE', 'The threshold begins in a moving vehicle.', 'The death event is not staged like a comforting brochure. It begins with illness, misread symptoms, an emergency call, an open door, and a body that becomes something the witness is watching from above.'],
    chapter11: ['QUERY · CHAPTER 11', 'The book becomes fieldwork.', 'Chapter 11 gives readers a haunted location and a method: the Magnolia Hotel, a floor held out of inventory, a solo investigator, and a protected source with access. It turns atmosphere into procedure.'],
    ai: ['QUERY · AI AND THE DEAD', 'The machines learned to answer grief.', 'The book reaches the present moment: companies can rebuild a voice, simulate a personality, and sell an echo back to the living. The old question of contact now has a product team.'],
    proof: ['QUERY · PROOF OR WARNING', 'The answer is the record.', 'The site should not promise easy proof. It should promise a disciplined record: testimony, empty nights, field controls, mediumship under limits, and the ethical warning that imitation is not the same as contact.']
  };
  const ask = document.querySelector('[data-ask-archive]');
  if (ask) {
    const buttons = Array.from(ask.querySelectorAll('[data-question]'));
    const label = ask.querySelector('[data-ask-label]');
    const title = ask.querySelector('[data-ask-title]');
    const copy = ask.querySelector('[data-ask-copy]');
    const activate = key => {
      const item = askData[key] || askData.witness;
      buttons.forEach(button => button.classList.toggle('active', button.dataset.question === key));
      if (label) label.textContent = item[0];
      if (title) title.textContent = item[1];
      if (copy) copy.textContent = item[2];
    };
    buttons.forEach(button => button.addEventListener('click', () => activate(button.dataset.question)));
  }
})();
