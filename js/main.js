/* ============================================
   KNAAN SHABTAY — MUSICIAN WEBSITE
   Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Navbar Scroll Effect ---------- */
  const navbar = document.querySelector('.navbar');

  function handleNavScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* ---------- Mobile Hamburger Menu ---------- */
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const navCenter = document.querySelector('.nav-center');
  const navOverlay = document.querySelector('.nav-overlay');

  function openMenu() {
    hamburger.classList.add('open');
    navLinks.classList.add('open');
    if (navCenter) navCenter.classList.add('open');
    if (navOverlay) navOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    if (navCenter) navCenter.classList.remove('open');
    if (navOverlay) navOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (navOverlay) {
    navOverlay.addEventListener('click', closeMenu);
  }

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* ---------- Active Nav Link ---------- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  navLinks.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ---------- Scroll-Triggered Fade-In Animations ---------- */
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

  /* ---------- Video Lightbox ---------- */
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

    const wrapper = lightboxContent.querySelector('.video-wrapper');
    if (wrapper) {
      setTimeout(() => wrapper.remove(), 300);
    }
  }

  videoCards.forEach(card => {
    card.addEventListener('click', () => {
      const videoId = card.getAttribute('data-video-id');
      if (videoId) openLightbox(videoId);
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  /* ---------- Album Thumbnail Tap-to-Show (Mobile) ---------- */
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

  document.addEventListener('click', () => {
    albumThumbnails.forEach(t => t.classList.remove('overlay-visible'));
  });

  /* ---------- Smooth Scroll for Anchor Links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offsetTop = target.offsetTop - parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'));
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      }
    });
  });

});
