(() => {
  'use strict';

  /* ── Dark mode ─────────────────────────────────
     html starts with class="dark" (default).
     On first visit: respect prefers-color-scheme.
     After that: persist choice to localStorage.
   ────────────────────────────────────────────── */
  const STORAGE_KEY = 'cognifillz-dark';
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored !== null) {
    document.documentElement.classList.toggle('dark', stored === 'true');
  } else if (!window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.remove('dark');
  }

  function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem(STORAGE_KEY, String(isDark));
  }

  document.getElementById('theme-btn').addEventListener('click', toggleDarkMode);

  const mobilThemeBtn = document.getElementById('theme-btn-mobile');
  if (mobilThemeBtn) {
    mobilThemeBtn.addEventListener('click', toggleDarkMode);
  }

  /* ── Scroll-triggered animations ───────────── */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.anim').forEach((el) => observer.observe(el));

  /* ── Nav scroll state ──────────────────────── */
  const nav = document.getElementById('nav');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 40);
        ticking = false;
      });
      ticking = true;
    }
  });

  /* ── Mobile nav toggle ─────────────────────── */
  const toggle = document.getElementById('nav-toggle');
  const mobile = document.getElementById('nav-mobile');

  toggle.addEventListener('click', () => {
    mobile.classList.toggle('open');
    const spans = toggle.querySelectorAll('span');
    const isOpen = mobile.classList.contains('open');
    spans[0].style.transform = isOpen ? 'rotate(45deg) translate(5px, 5px)' : '';
    spans[1].style.opacity = isOpen ? '0' : '1';
    spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px, -5px)' : '';
  });

  function closeMobileNav() {
    mobile.classList.remove('open');
    const spans = toggle.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity = '1';
    spans[2].style.transform = '';
  }

  mobile.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', closeMobileNav);
  });

  /* ── Smooth scroll for anchor links ────────── */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        closeMobileNav();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
