/* One night at the show · the travelling bird.
   One hummingbird follows the whole scroll: it takes off from the door, flies out of frame and back,
   perches on the tour board, then flies into the Next Show poster and becomes the bird printed on it.
   Works for the desktop stage, the phone stack and the full-screen phone version. */
(() => {
  const root = document.documentElement;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const q = s => document.querySelector(s), desk = () => innerWidth > 900, full = root.classList.contains('full');
  const bird = document.createElement('div');
  bird.className = 'flybird'; bird.setAttribute('aria-hidden', 'true');
  bird.innerHTML = '<img src="assets/venue/desktop/A1-fg.webp" alt="">';
  document.body.appendChild(bird); root.classList.add('has-flybird');
  const R = 312 / 270; // bird image height / width

  const docY = el => el.getBoundingClientRect().top + scrollY;
  function stops(){ // where the bird sits, as scroll ranges; it flies between them
    const vh = innerHeight;
    if (desk()) {
      if (root.classList.contains('still')) return null;
      const u = p => p / 940 * (q('#venue').offsetHeight - vh);
      return [{el: q('[data-l="A1-fg"]'), y0: 0, y1: u(25)}, {el: q('[data-l="A3-fg"]'), y0: u(418), y1: u(485)}, {el: q('[data-l="A5-pbird"]'), y0: u(805), y1: Infinity}];
    }
    if (full) {
      const g = k => docY(q(`.fsgap[data-to="${k}"]`));
      return [{el: q('.fsbg [data-l="m-A1-fg"]'), y0: 0, y1: vh * .1}, {el: q('.fsbg [data-l="m-A3-fg"]'), y0: g('tour') - vh * .22, y1: g('tour') + vh * .3}, {el: q('.fsbg [data-l="m-A5-pbird"]'), y0: g('contact') - vh * .22, y1: Infinity}];
    }
    const top = id => docY(document.getElementById(id));
    return [{el: q('#home [data-l="m-A1-fg"]'), y0: 0, y1: vh * .22}, {el: q('#tour [data-l="m-A3-fg"]'), y0: top('tour') - vh * .45, y1: top('tour') - vh * .02}, {el: q('#contact [data-l="m-A5-pbird"]'), y0: top('contact') - vh * .42, y1: Infinity}];
  }
  let S = null;
  const measure = () => { S = stops(); frame(); };

  const lerp = (a, b, t) => a + (b - a) * t, ease = t => t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
  const box = el => { const b = el.getBoundingClientRect(); return {x: b.left + b.width / 2, y: b.top + b.height / 2, w: b.width}; };
  function place(x, y, w, dir, flying, alpha){
    bird.style.width = w + 'px';
    bird.style.transform = `translate(${x - w / 2}px,${y - w * R / 2}px) scaleX(${dir < 0 ? -1 : 1})`;
    bird.style.opacity = alpha; bird.classList.toggle('flying', flying);
  }
  function frame(){
    S = stops(); // positions shift as lazy images load, so read them fresh
    if (!S || S.some(s => !s.el)) { bird.style.opacity = 0; return; }
    const y = scrollY, vw = innerWidth, vh = innerHeight, size = desk() ? 110 : 62;
    let i = S.findIndex(s => y < s.y1); if (i < 0) i = S.length - 1;
    const s = S[i], last = i === S.length - 1;
    if (y >= s.y0 || i === 0) { // perched: ride along with the scene; at the end, melt into the poster
      const t = box(s.el); return place(t.x, t.y, t.w, 1, false, last ? Math.max(0, 1 - (y - s.y0) / (vh * .3)) : 1);
    }
    const a = S[i - 1], A = box(a.el), B = box(s.el), t = Math.min(1, Math.max(0, (y - a.y1) / (s.y0 - a.y1)));
    const odd = i % 2, out = odd ? {x: vw + 140, y: -90} : {x: -140, y: vh * .12}, inn = odd ? {x: -140, y: vh * .3} : {x: vw + 140, y: vh * .05};
    let x, yy, w, dir;
    if (t < .5) { const u = ease(t * 2); x = lerp(A.x, out.x, u); yy = lerp(A.y, out.y, u) - Math.sin(u * Math.PI) * vh * .12; w = lerp(A.w, size, Math.min(1, u * 3)); dir = out.x - A.x; }
    else { const u = ease((t - .5) * 2); x = lerp(inn.x, B.x, u); yy = lerp(inn.y, B.y, u) - Math.sin(u * Math.PI) * vh * .1; w = lerp(size, B.w, Math.max(0, u * 3 - 2)); dir = B.x - inn.x; }
    place(x, yy + Math.sin(y / 40) * 6, w, dir, true, 1);
  }
  let raf = 0; const tick = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; frame(); }); };
  addEventListener('scroll', tick, {passive: true});
  addEventListener('resize', () => setTimeout(measure, 50));
  addEventListener('load', () => setTimeout(measure, 100));
  if (window.gsap) gsap.ticker.add(tick); // keep up with the scrubbed camera while it eases
  measure();
})();
