(function () {
  'use strict';

  // ───── Topbar reveal on scroll ─────
  const topbar = document.getElementById('topbar');
  if (topbar) {
    let ticking = false;
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 0.8) {
        topbar.classList.add('visible');
      } else {
        topbar.classList.remove('visible');
      }
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });
  }

  // ───── Mobile menu ─────
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeMenu = () => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  };
  const openMenu = () => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.classList.add('open');
    mobileMenu.classList.add('open');
    document.body.classList.add('menu-open');
    menuToggle.setAttribute('aria-expanded', 'true');
  };
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      if (mobileMenu.classList.contains('open')) closeMenu();
      else openMenu();
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        closeMenu();
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            // small delay so menu close animation begins first
            setTimeout(() => {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 80);
          }
        }
      });
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu();
    });
  }

  // ───── Day tabs ─────
  document.querySelectorAll('.days-nav button').forEach(btn => {
    btn.addEventListener('click', () => {
      const day = btn.dataset.day;
      document.querySelectorAll('.days-nav button').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.day').forEach(d => d.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById('day' + day);
      if (target) target.classList.add('active');
      const itin = document.getElementById('itinerary');
      if (itin) itin.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ───── Checklist tabs ─────
  const tabLabels = { book: 'BOOK & PLAN', pack: 'PACKING LIST', day: 'DAILY REMINDERS' };
  document.querySelectorAll('.checklist-tabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.checklist-tabs button').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.checklist-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const pane = document.getElementById('pane-' + tab);
      if (pane) pane.classList.add('active');
      const title = document.getElementById('progressTitle');
      if (title) title.textContent = tabLabels[tab] || tab.toUpperCase();
      updateProgress();
    });
  });

  // ───── Checklist items ─────
  document.querySelectorAll('.check-item').forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('checked');
      saveChecklistState();
      updateProgress();
    });
  });

  function updateProgress() {
    const activePane = document.querySelector('.checklist-pane.active');
    if (!activePane) return;
    const items = activePane.querySelectorAll('.check-item');
    const checked = activePane.querySelectorAll('.check-item.checked');
    const pct = items.length === 0 ? 0 : (checked.length / items.length) * 100;
    const fill = document.getElementById('progressFill');
    const count = document.getElementById('progressCount');
    if (fill) fill.style.width = pct + '%';
    if (count) count.textContent = checked.length + ' of ' + items.length;
  }

  // Persist checklist progress in localStorage so revisits keep the state
  const STORAGE_KEY = 'niagara-checklist-v1';
  function saveChecklistState() {
    try {
      const state = {};
      document.querySelectorAll('.check-item').forEach((item, idx) => {
        const text = item.querySelector('.check-text');
        const key = (text ? text.textContent.trim().slice(0, 80) : '') + '#' + idx;
        state[key] = item.classList.contains('checked');
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* storage may be unavailable */ }
  }
  function restoreChecklistState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const state = JSON.parse(raw);
      document.querySelectorAll('.check-item').forEach((item, idx) => {
        const text = item.querySelector('.check-text');
        const key = (text ? text.textContent.trim().slice(0, 80) : '') + '#' + idx;
        if (state[key]) item.classList.add('checked');
      });
    } catch (e) { /* ignore */ }
  }
  restoreChecklistState();
  updateProgress();

  // ───── Topbar nav anchor smoothing ─────
  document.querySelectorAll('.topbar-nav a').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
