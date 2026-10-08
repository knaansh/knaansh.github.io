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
  /* one timeline over the whole page, in pixels of scroll, so scrubbing either way always lands in a clean state */
  let tl;
  function build(){
    if (tl) { tl.scrollTrigger.kill(); tl.kill(); }
    gsap.set(arts, {clearProps: 'transform,opacity,visibility'}); gsap.set(glow, {opacity: 0}); gsap.set('.herotext', {clearProps: 'all'});
    gsap.set([a2, a3, a4, a5], {autoAlpha: 0});
    const vh = innerHeight, max = document.documentElement.scrollHeight - vh;
    const at = k => gap(k).getBoundingClientRect().top + scrollY - vh, len = vh * .8; // a move runs while its gap rises from the bottom edge to 20% from the top
    tl = gsap.timeline({defaults: {ease: 'none'}, scrollTrigger: {start: 0, end: max, scrub: .5}});
    tl.set({}, {}, max);
    let s = at('videos'); // 1 → 2: walk up to the door, through the warm light, onto the stage
    tl.to('.herotext', {autoAlpha: 0, y: -30, duration: len * .2}, s + len * .05)
      .fromTo(a1, {scale: 1}, {scale: 3.2, duration: len * .85, ease: 'power2.in'}, s + len * .15)
      .fromTo(glow, {opacity: 0}, {opacity: 1, duration: len * .35}, s + len * .45)
      .set(a1, {autoAlpha: 0}, s + len * .8)
      .fromTo(a2, {autoAlpha: 0, scale: 1.25}, {autoAlpha: 1, scale: 1, duration: len * .45, ease: 'power2.out', immediateRender: false}, s + len * .8)
      .to(glow, {opacity: 0, duration: len * .3}, s + len * .85);
    s = at('tour'); // 2 → 3: the camera turns along the stage to the tour board
    tl.fromTo(a2, {xPercent: 0}, {xPercent: -40, autoAlpha: 0, duration: len, ease: 'power1.inOut', immediateRender: false}, s)
      .fromTo(a3, {xPercent: 40, autoAlpha: 0}, {xPercent: 0, autoAlpha: 1, duration: len, ease: 'power1.inOut', immediateRender: false}, s);
    s = at('music'); // 3 → 4: tilt down to the merch table, the record lifts off it
    tl.fromTo(a3, {yPercent: 0}, {yPercent: -30, autoAlpha: 0, duration: len, ease: 'power2.inOut', immediateRender: false}, s)
      .fromTo(a4, {yPercent: 30, autoAlpha: 0}, {yPercent: 0, autoAlpha: 1, duration: len, ease: 'power2.inOut', immediateRender: false}, s)
      .fromTo('.fsbg [data-l="m-A4-fg"]', {x: -60, y: 50, scale: .8}, {x: 0, y: 0, scale: 1, duration: len * .6, ease: 'power2.out', immediateRender: false}, s + len * .4);
    s = at('contact'); // 4 → 5: turn back toward the door and walk out into the night
    tl.fromTo(a4, {xPercent: 0}, {xPercent: 35, autoAlpha: 0, duration: len, ease: 'power2.inOut', immediateRender: false}, s)
      .fromTo(a5, {xPercent: -35, autoAlpha: 0}, {xPercent: 0, autoAlpha: 1, duration: len, ease: 'power2.inOut', immediateRender: false}, s);
    tl.progress(Math.min(1, scrollY / max)); // land on the current frame right away after a rebuild
  }
  build();
  let rb; const rebuild = () => { clearTimeout(rb); rb = setTimeout(() => { fit(); build(); }, 120); };
  addEventListener('resize', rebuild);
  new ResizeObserver(rebuild).observe(document.querySelector('.fsflow')); // lazy images and embeds change the page length
})();
