/* ============================================
   KNAAN SHABTAY — MUSICIAN WEBSITE
   Shared behavior for the current site and the
   Paper Cuts pages. Shop still uses .navbar;
   the redesign uses .site-nav and #lb.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Legacy navbar (shop and older pages) ---------- */
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const navCenter = document.querySelector('.nav-center');
  const navOverlay = document.querySelector('.nav-overlay');

  if (navbar) {
    function handleNavScroll() {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();
  }

  function openMenu() {
    if (!hamburger || !navLinks) return;
    hamburger.classList.add('open');
    navLinks.classList.add('open');
    if (navCenter) navCenter.classList.add('open');
    if (navOverlay) navOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!hamburger || !navLinks) return;
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    if (navCenter) navCenter.classList.remove('open');
    if (navOverlay) navOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    if (navOverlay) {
      navOverlay.addEventListener('click', closeMenu);
    }

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.querySelectorAll('a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  /* ---------- Scroll-triggered fade-in (legacy pages) ---------- */
  const fadeElements = document.querySelectorAll('.fade-in');

  if (fadeElements.length > 0) {
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(el => fadeObserver.observe(el));
  }

  /* ---------- Legacy video lightbox (.lightbox / .video-card) ---------- */
  const lightbox = document.querySelector('.lightbox');
  const lightboxContent = document.querySelector('.lightbox-content');
  const lightboxClose = document.querySelector('.lightbox-close');
  const videoCards = document.querySelectorAll('.video-card[data-video-id]');

  function openLightbox(videoId) {
    if (!lightbox || !lightboxContent) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'video-wrapper';
    wrapper.innerHTML = `<iframe
      src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0"
      title="Video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen></iframe>`;

    const existing = lightboxContent.querySelector('.video-wrapper');
    if (existing) existing.remove();

    lightboxContent.appendChild(wrapper);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';

    const wrapper = lightboxContent && lightboxContent.querySelector('.video-wrapper');
    if (wrapper) {
      setTimeout(() => wrapper.remove(), 300);
    }
  }

  if (lightbox) {
    videoCards.forEach(card => {
      card.addEventListener('click', () => {
        const videoId = card.getAttribute('data-video-id');
        if (videoId) openLightbox(videoId);
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  /* ---------- Paper Cuts video lightbox ---------- */
  const lb = document.getElementById('lb');
  const lbBox = document.getElementById('lb-box');

  if (lb && lbBox) {
    function openPaper(id) {
      lbBox.innerHTML = '<iframe src="https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="YouTube video"></iframe>';
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closePaper() {
      lb.classList.remove('open');
      lbBox.innerHTML = '';
      document.body.style.overflow = '';
    }

    document.querySelectorAll('[data-video-id]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const id = el.getAttribute('data-video-id');
        if (id) openPaper(id);
      });
    });

    const lbClose = lb.querySelector('.lb-close');
    if (lbClose) lbClose.addEventListener('click', closePaper);
    lb.addEventListener('click', (e) => { if (e.target === lb) closePaper(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePaper(); });
  }

  /* ---------- Album thumbnail tap-to-show (legacy music page) ---------- */
  const albumThumbnails = document.querySelectorAll('.album-thumbnail');

  albumThumbnails.forEach(thumbnail => {
    thumbnail.addEventListener('click', (e) => {
      if (e.target.closest('.album-thumbnail-links a')) return;

      e.stopPropagation();
      const isOpen = thumbnail.classList.contains('overlay-visible');

      albumThumbnails.forEach(t => t.classList.remove('overlay-visible'));
      if (!isOpen) {
        thumbnail.classList.add('overlay-visible');
      }
    });
  });

  if (albumThumbnails.length) {
    document.addEventListener('click', () => {
      albumThumbnails.forEach(t => t.classList.remove('overlay-visible'));
    });
  }

  /* ---------- Smooth scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navVar = getComputedStyle(document.documentElement).getPropertyValue('--nav-height');
      const offset = navVar ? parseInt(navVar, 10) || 0 : 0;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    });
  });

});
