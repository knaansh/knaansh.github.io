/* One night at the show · full-screen phone version (full.html).
   Each scene fills the screen behind the content; scrolling between cards moves the camera:
   into the door, along the stage, down to the table, out the door. */
(() => {
  const root = document.documentElement, bg = document.querySelector('.fsbg');
  if (!root.classList.contains('full') || !bg) return;
  const arts = [...bg.querySelectorAll('.fsart')], glow = bg.querySelector('.glow');
  const nums = s => s.split(' ').map(Number);

  /* cover the screen with each plate, framed on its focus point; zoom origin sits on the exit (the door, etc.) */
  function fit(){
    const W = bg.clientWidth, H = bg.clientHeight; if (!W) return;
    arts.forEach(a => {
      const p = a.querySelector('.fsplate'), h = +p.dataset.h, s = Math.max(W / 780, H / h);
      const [px, py] = nums(a.dataset.pos), [fx, fy] = nums(a.dataset.o);
      const ox = (W - 780 * s) * px, oy = (H - h * s) * py;
      p.style.transform = `translate(${ox}px,${oy}px) scale(${s})`;
      a.style.transformOrigin = `${ox + fx * 780 * s}px ${oy + fy * h * s}px`;
      if (a.dataset.s === 'home') { glow.style.setProperty('--gx', (ox + fx * 780 * s) / W * 100 + '%'); glow.style.setProperty('--gy', (oy + fy * h * s) / H * 100 + '%'); }
    });
  }
  fit(); addEventListener('resize', fit);

  const gap = k => document.querySelector(`.fsgap[data-to="${k}"]`);
  const [a1, a2, a3, a4, a5] = arts;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !window.gsap || !window.ScrollTrigger) { // no camera moves: just show the scene you're in
    const order = [['home', a1], ['videos', a2], ['tour', a3], ['music', a4], ['contact', a5]];
    const show = () => { let cur = a1; order.slice(1).forEach(([k, a]) => { if (gap(k).getBoundingClientRect().top < innerHeight * .5) cur = a; }); arts.forEach(a => a.style.opacity = a === cur ? 1 : 0); };
    addEventListener('scroll', show, {passive: true}); show(); return;
  }
  gsap.registerPlugin(ScrollTrigger);
  gsap.set([a2, a3, a4, a5], {autoAlpha: 0});
  const move = (k, build) => build(gsap.timeline({defaults: {ease: 'none'},
    scrollTrigger: {trigger: gap(k), start: 'top bottom', end: 'top 20%', scrub: .5}}));

  // the bird drifts toward the door while the title is up
  gsap.to('[data-l="m-A1-fg"]', {x: 26, y: -14, rotate: -6, ease: 'none', scrollTrigger: {trigger: '#home', start: 'top top', end: 'bottom top', scrub: .5}});
  // 1 → 2: walk up to the door, through the warm light, onto the stage
  move('videos', tl => tl
    .to('.herotext', {autoAlpha: 0, y: -30, duration: .2}, .05)
    .fromTo(a1, {scale: 1}, {scale: 3.2, duration: .85, ease: 'power2.in'}, .15)
    .fromTo(glow, {opacity: 0}, {opacity: 1, duration: .35}, .45)
    .set(a1, {autoAlpha: 0}, .8)
    .fromTo(a2, {autoAlpha: 0, scale: 1.25}, {autoAlpha: 1, scale: 1, duration: .45, ease: 'power2.out', immediateRender: false}, .8)
    .to(glow, {opacity: 0, duration: .3}, .85));
  // 2 → 3: the camera turns along the stage to the tour board
  move('tour', tl => tl
    .fromTo(a2, {xPercent: 0, autoAlpha: 1}, {xPercent: -40, autoAlpha: 0, duration: 1, ease: 'power1.inOut', immediateRender: false}, 0)
    .fromTo(a3, {xPercent: 40, autoAlpha: 0}, {xPercent: 0, autoAlpha: 1, duration: 1, ease: 'power1.inOut', immediateRender: false}, 0));
  // 3 → 4: tilt down to the merch table, the record lifts off it
  move('music', tl => tl
    .fromTo(a3, {yPercent: 0, autoAlpha: 1}, {yPercent: -30, autoAlpha: 0, duration: 1, ease: 'power2.inOut', immediateRender: false}, 0)
    .fromTo(a4, {yPercent: 30, autoAlpha: 0}, {yPercent: 0, autoAlpha: 1, duration: 1, ease: 'power2.inOut', immediateRender: false}, 0)
    .fromTo('[data-l="m-A4-fg"]', {x: -60, y: 50, rotate: -2, scale: .8}, {x: 0, y: 0, rotate: 0, scale: 1, duration: .6, ease: 'power2.out', immediateRender: false}, .4));
  // 4 → 5: turn back toward the door and walk out into the night
  move('contact', tl => tl
    .fromTo(a4, {xPercent: 0, autoAlpha: 1}, {xPercent: 35, autoAlpha: 0, duration: 1, ease: 'power2.inOut', immediateRender: false}, 0)
    .fromTo(a5, {xPercent: -35, autoAlpha: 0}, {xPercent: 0, autoAlpha: 1, duration: 1, ease: 'power2.inOut', immediateRender: false}, 0));
  addEventListener('load', () => { fit(); ScrollTrigger.refresh(); });
})();
