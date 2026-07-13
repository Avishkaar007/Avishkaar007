(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------- Avatar fallback ----------------
  const avatarImg = document.getElementById('avatarImg');
  const avatar = document.getElementById('avatar');
  if (avatarImg) {
    avatarImg.addEventListener('error', () => {
      avatarImg.style.display = 'none';
      avatar.classList.add('avatar-fallback');
    });
  }

  // ---------------- Scroll reveal ----------------
  const revealEls = document.querySelectorAll('.reveal');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => observer.observe(el));
  }

  // ---------------- 3D tilt on cards ----------------
  if (!prefersReducedMotion) {
    document.querySelectorAll('.tilt').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateZ(6px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0)';
      });
    });
  }

  // ---------------- Animated background blobs ----------------
  const canvas = document.getElementById('bgCanvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    const colors = [
      { r: 255, g: 182, b: 39 },  // signal
      { r: 255, g: 61, b: 129 },  // pulse
      { r: 35, g: 229, b: 219 },  // wire
    ];
    let blobs = colors.map((c, i) => ({
      color: c,
      x: 0.2 + 0.6 * ((i * 0.37) % 1),
      y: 0.15 + 0.5 * ((i * 0.61) % 1),
      vx: (Math.random() - 0.5) * 0.0006,
      vy: (Math.random() - 0.5) * 0.0006,
      r: 0.28 + Math.random() * 0.14,
    }));

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function frame() {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.filter = 'blur(110px)';
      blobs.forEach((b) => {
        b.x += b.vx; b.y += b.vy;
        if (b.x < 0.05 || b.x > 0.95) b.vx *= -1;
        if (b.y < 0.05 || b.y > 0.95) b.vy *= -1;
        const grad = ctx.createRadialGradient(
          b.x * w, b.y * h, 0,
          b.x * w, b.y * h, b.r * Math.max(w, h)
        );
        grad.addColorStop(0, `rgba(${b.color.r},${b.color.g},${b.color.b},0.35)`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      });
      ctx.filter = 'none';
      requestAnimationFrame(frame);
    }
    frame();
  }

  // ---------------- Theme toggle ----------------
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const root = document.documentElement;
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      localStorage.setItem('jin-theme', next);
    });
  }

  // ---------------- Site customization (from edit.html) ----------------
  // content/sites.json contains editable project cards and footer links.
  // and extra project cards without touching this file. Safe to skip —
  // if the file 404s, the page just uses what's already in index.html.
  fetch('content/sites.json')
    .then((r) => (r.ok ? r.json() : null))
    .then((cfg) => cfg && applySiteConfig(cfg))
    .catch(() => {});

  function applySiteConfig(cfg) {
    try {
      if (Array.isArray(cfg.extraCards)) {
        cfg.extraCards.forEach((c) => {
          const grid = document.querySelector(`#${c.section} .card-grid`);
          if (!grid) return;
          const placeholder = grid.querySelector('.card-empty, .card-placeholder');
          const card = document.createElement('article');
          card.className = `card card-${c.accent || 'signal'} tilt reveal is-visible`;
          card.innerHTML = `
            <p class="card-eyebrow mono">${c.eyebrow || ''}</p>
            <h3 class="card-title">${c.title || ''}</h3>
            <p class="card-body">${c.body || ''}</p>
            ${c.tags ? `<div class="card-tags mono">${c.tags.map((t) => `<span>#${t}</span>`).join('')}</div>` : ''}
          `;
          if (placeholder) grid.insertBefore(card, placeholder);
          else grid.appendChild(card);
          if (!prefersReducedMotion) {
            card.addEventListener('mousemove', (e) => {
              const rect = card.getBoundingClientRect();
              const x = (e.clientX - rect.left) / rect.width - 0.5;
              const y = (e.clientY - rect.top) / rect.height - 0.5;
              card.style.transform = `rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateZ(6px)`;
            });
            card.addEventListener('mouseleave', () => { card.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0)'; });
          }
        });
      }
      if (Array.isArray(cfg.extraFooterLinks)) {
        const wrap = document.querySelector('.footer-links');
        cfg.extraFooterLinks.forEach((l) => {
          if (!wrap) return;
          const a = document.createElement('a');
          a.href = l.url; a.className = 'footer-link'; a.textContent = l.label;
          wrap.appendChild(a);
        });
      }
    } catch (e) { /* malformed config shouldn't break the page */ }
  }

  // ---------------- Command palette ----------------
  const paletteOverlay = document.getElementById('paletteOverlay');
  const paletteInput = document.getElementById('paletteInput');
  const paletteList = document.getElementById('paletteList');
  const paletteTrigger = document.getElementById('paletteTrigger');

  const COMMANDS = [
    { label: 'Go to top', hint: 'hero', action: () => scrollToId('top') },
    { label: 'Browser Extensions', hint: 'section', action: () => scrollToId('extensions') },
    { label: 'Android Apps', hint: 'section', action: () => scrollToId('android') },
    { label: 'Web Apps', hint: 'section', action: () => scrollToId('webapps') },
    { label: 'Articles', hint: 'section', action: () => scrollToId('articles') },
    { label: 'Open GitHub', hint: 'github.com/Avishkaar007', action: () => window.open('https://github.com/Avishkaar007', '_blank') },
    { label: 'Copy email', hint: 'clipboard', action: () => copyEmail() },
  ];

  function scrollToId(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }

  function copyEmail() {
    const link = document.querySelector('.footer-link[href^="mailto:"]');
    const email = link ? link.getAttribute('href').replace('mailto:', '') : '';
    if (email && navigator.clipboard) navigator.clipboard.writeText(email);
  }

  let activeIndex = 0;
  let filtered = COMMANDS;

  function renderPalette() {
    paletteList.innerHTML = '';
    if (filtered.length === 0) {
      paletteList.innerHTML = '<li class="palette-empty">No matching commands</li>';
      return;
    }
    filtered.forEach((cmd, i) => {
      const li = document.createElement('li');
      li.className = 'palette-item' + (i === activeIndex ? ' is-active' : '');
      li.innerHTML = `<span>${cmd.label}</span><span class="hint mono">${cmd.hint}</span>`;
      li.addEventListener('click', () => runCommand(cmd));
      li.addEventListener('mousemove', () => { activeIndex = i; renderPalette(); });
      paletteList.appendChild(li);
    });
  }

  function runCommand(cmd) {
    cmd.action();
    closePalette();
  }

  function openPalette() {
    paletteOverlay.classList.add('is-open');
    paletteInput.value = '';
    filtered = COMMANDS;
    activeIndex = 0;
    renderPalette();
    setTimeout(() => paletteInput.focus(), 10);
  }
  function closePalette() {
    paletteOverlay.classList.remove('is-open');
  }

  paletteTrigger.addEventListener('click', openPalette);
  paletteOverlay.addEventListener('click', (e) => {
    if (e.target === paletteOverlay) closePalette();
  });

  paletteInput.addEventListener('input', () => {
    const q = paletteInput.value.trim().toLowerCase();
    filtered = COMMANDS.filter((c) => c.label.toLowerCase().includes(q));
    activeIndex = 0;
    renderPalette();
  });

  document.addEventListener('keydown', (e) => {
    const isOpen = paletteOverlay.classList.contains('is-open');
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      isOpen ? closePalette() : openPalette();
      return;
    }
    if (!isOpen) return;
    if (e.key === 'Escape') { closePalette(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex = Math.min(activeIndex + 1, filtered.length - 1); renderPalette(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0); renderPalette(); }
    if (e.key === 'Enter') { e.preventDefault(); if (filtered[activeIndex]) runCommand(filtered[activeIndex]); }
  });

  // ---------------- Articles list ----------------
  const articlesList = document.getElementById('articlesList');
  if (articlesList) {
    fetch('content/articles.json')
      .then((r) => (r.ok ? r.json() : []))
      .then((articles) => renderArticles(articles || []))
      .catch(() => renderArticles([]));
  }

  function renderArticles(articles) {
    if (!articles.length) {
      articlesList.innerHTML = `
        <div class="article-empty">
          <p>Nothing published yet.</p>
          <p class="mono">add entries to content/articles.json to list them here</p>
        </div>`;
      return;
    }
    articlesList.innerHTML = '';
    articles.forEach((article) => {
      const row = document.createElement('article');
      row.className = 'article-row';
      const button = document.createElement('button');
      button.className = 'article-open';
      button.type = 'button';
      button.textContent = article.title || 'Untitled';
      const date = document.createElement('span');
      date.className = 'article-date mono';
      date.textContent = article.date || '';
      const body = document.createElement('div');
      body.className = 'article-body';
      body.textContent = article.body || '';
      button.addEventListener('click', () => {
  const isAlreadyOpen = row.classList.contains('is-open');

  // Close all articles
  articlesList.querySelectorAll('.article-row').forEach((item) => {
    item.classList.remove('is-open');
    item.querySelector('.article-open')
      .setAttribute('aria-expanded', 'false');
  });

  // Open the clicked one (unless it was already open)
  if (!isAlreadyOpen) {
    row.classList.add('is-open');
    button.setAttribute('aria-expanded', 'true');
  }
});
      row.append(button, date, body);
      articlesList.appendChild(row);
    });
  }
})();
