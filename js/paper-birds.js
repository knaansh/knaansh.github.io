/* Paper Birds site behavior. No build step; plain script loaded at the end of each page. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Embeds (Spotify, YouTube) only run on the real site, not inside a preview frame that blocks them.
  const EMBEDS = window.self === window.top;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  /* ---------- fold between pages ---------- */
  const fold = document.querySelector('.fold');
  const root = document.documentElement;
  // arriving from a fold: open the sheet
  if (root.classList.contains('fold-in')) {
    fold.classList.add('on', 'shut');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      root.classList.remove('fold-in');
      fold.classList.remove('shut');
      setTimeout(() => fold.classList.remove('on'), 450);
    }));
  }
  try { sessionStorage.removeItem('pb-fold'); } catch {}
  addEventListener('pageshow', e => { if (e.persisted) fold.classList.remove('on', 'shut'); });

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || reduce || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname)) return;
    if (url.pathname === location.pathname) return; // same page (hash links scroll normally)
    e.preventDefault();
    closeMenu();
    try { sessionStorage.setItem('pb-fold', '1'); } catch {}
    fold.classList.add('on');
    requestAnimationFrame(() => requestAnimationFrame(() => fold.classList.add('shut')));
    setTimeout(() => { location.href = url.href; }, 440);
  });

  /* ---------- mobile menu ---------- */
  const menu = document.querySelector('.sheet-menu');
  const menuBtn = document.querySelector('.menu-btn');
  function closeMenu(){ if (!menu) return; menu.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Open menu'); }
  if (menu && menuBtn) {
    menuBtn.addEventListener('click', () => {
      const open = !menu.classList.contains('open');
      menu.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---------- scroll: birds color in, sheets unfold ---------- */
  const birds = [...document.querySelectorAll('.bird')];
  const sheets = [...document.querySelectorAll('.sheet')];
  function onScroll(){
    if (reduce) return;
    const vh = innerHeight, y = scrollY;
    if (birds.length) {
      const p = Math.min(1, y / (vh * .7));
      const drift = innerWidth < 820 ? .35 : 1; // birds drift less on phones so they don't overlap
      birds.forEach((b, i) => {
        const local = Math.max(0, Math.min(1, p * 1.6 - i * .2 + .25)); // the first bird starts part-colored
        b.querySelector('.color').style.setProperty('--p', (local * 100).toFixed(1) + '%');
        b.style.translate = `${(p * 30 * drift * (i + 1)).toFixed(1)}px ${(-p * 40 * drift * (i + 1)).toFixed(1)}px`;
      });
    }
    sheets.forEach(s => {
      const top = s.getBoundingClientRect().top;
      s.style.setProperty('--u', Math.max(0, Math.min(1, (top - vh * .45) / (vh * .55))).toFixed(3));
    });
  }
  addEventListener('scroll', () => requestAnimationFrame(onScroll), {passive: true});
  addEventListener('resize', onScroll);
  onScroll();

  /* ---------- the companion: one paper bird travels down the page ----------
     It leaves the hero flock, perches on each section or page title, and lands by the footer logo,
     gaining a little more color at every stop. */
  if (!reduce) {
    const comp = document.createElement('div');
    comp.className = 'companion';
    comp.setAttribute('aria-hidden', 'true');
    comp.innerHTML = '<span class="flap"><img class="line" src="assets/images/hummingbird-line.png" alt=""><img class="color" src="assets/images/hummingbird.png" alt=""></span>';
    document.body.appendChild(comp);
    const nights = [...document.querySelectorAll('.night, .foot, .dark-page main')];
    let W = [], size = 64, lastX = null, lastY = null;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    function measure(){
      size = innerWidth < 820 ? 44 : 64;
      comp.style.setProperty('--size', size + 'px');
      const sx = scrollX, sy = scrollY, maxX = document.documentElement.clientWidth - size - 8;
      W = [];
      root.classList.add('measuring'); // flatten the folding sheets so positions are true
      const lead = document.querySelector('.bird:nth-child(4)');
      if (lead) { // start just beyond the last bird in the hero, ignoring its scroll drift
        const r = lead.getBoundingClientRect();
        const [tx, ty] = (lead.style.translate || '0px 0px').split(' ').map(parseFloat);
        W.push({x: clamp(r.right - (tx || 0) + sx - size * .2, 8, maxX), y: r.top - (ty || 0) + sy + r.height * .55});
      }
      document.querySelectorAll('.sec-head .title, .page-head .title').forEach(t => {
        const rg = document.createRange(); rg.selectNodeContents(t);
        const r = rg.getClientRects()[0]; if (!r) return;
        const fs = parseFloat(getComputedStyle(t).fontSize);
        // sit on top of the last letter of the first line
        W.push({x: clamp(r.right + sx - size * .62, 8, maxX), y: r.top + sy + fs * .14 - size * .86});
      });
      const logo = document.querySelector('.foot .logo img');
      if (logo) { const r = logo.getBoundingClientRect(); W.push({x: clamp(r.right + sx + 10, 8, maxX), y: r.top + sy - size * .55}); }
      root.classList.remove('measuring');
      W.sort((a, b) => a.y - b.y);
      place();
    }

    function place(){
      if (W.length < 2) { comp.hidden = true; return; }
      comp.hidden = false;
      // the line the bird follows; it slides lower near the end so the bird can reach the footer
      const end = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const L = scrollY + innerHeight * (.55 + .42 * Math.pow(clamp(scrollY / end, 0, 1), 4));
      let k = 0;
      while (k < W.length - 2 && L >= W[k + 1].y) k++;
      const a = W[k], b = W[k + 1];
      const u = clamp((L - a.y) / Math.max(1, b.y - a.y), 0, 1);
      const e = ease(clamp((u - .3) / .7, 0, 1)); // perch for the first part of each stretch, then fly
      const swoop = Math.sin(Math.PI * e) * (innerWidth < 820 ? 28 : 90);
      const x = a.x + (b.x - a.x) * e + swoop, y = a.y + (b.y - a.y) * e;
      const flying = e > 0 && e < 1;
      let tilt = 0, flip = 1;
      if (lastX !== null && flying) {
        const dx = x - lastX, dy = y - lastY;
        if (Math.abs(dx) > .5) flip = dx < 0 ? -1 : 1;
        tilt = clamp(Math.atan2(dy, Math.abs(dx) + 20) * 57.3, -25, 35);
      }
      lastX = x; lastY = y;
      comp.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      comp.style.setProperty('--tilt', tilt.toFixed(1) + 'deg');
      comp.style.setProperty('--flip', flip);
      comp.classList.toggle('flying', flying);
      const fill = clamp((k + (u >= 1 ? 1 : e)) / (W.length - 1), 0, 1);
      comp.style.setProperty('--fill', (15 + fill * 85).toFixed(1) + '%');
      // white ink when the bird is over a dark band
      const vy = y - scrollY + size / 2;
      comp.classList.toggle('on-dark', nights.some(n => { const r = n.getBoundingClientRect(); return vy > r.top && vy < r.bottom; }));
    }

    addEventListener('scroll', () => requestAnimationFrame(place), {passive: true});
    addEventListener('resize', measure);
    addEventListener('load', measure);
    if (document.fonts) document.fonts.ready.then(measure);
    new ResizeObserver(() => measure()).observe(document.body);
    measure();
  }

  /* ---------- Spotify players ---------- */
  function spotify(id, title, height){
    return EMBEDS
      ? `<iframe title="${esc(title)} on Spotify" src="https://open.spotify.com/embed/album/${id}?utm_source=generator&theme=0" height="${height}" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`
      : `<a class="btn" href="https://open.spotify.com/album/${id}" target="_blank" rel="noopener">▶ Listen on Spotify</a>`;
  }
  document.querySelectorAll('[data-spotify]').forEach(el => {
    if (EMBEDS) el.innerHTML = spotify(el.dataset.spotify, el.dataset.title || '', el.dataset.height || 352);
  });

  /* ---------- records: open one off the shelf ---------- */
  // A url() inside a CSS variable resolves against the stylesheet (css/), so hand the label an absolute URL.
  const abs = src => new URL(src, location.href).href;
  document.querySelectorAll('.rec').forEach(r => r.style.setProperty('--lbl', `url("${abs(r.querySelector('img').getAttribute('src'))}")`));
  const opened = document.getElementById('opened');
  function openRecord(btn, scroll){
    const d = btn.dataset, img = btn.querySelector('img').getAttribute('src');
    opened.style.setProperty('--lbl', `url("${abs(img)}")`);
    opened.innerHTML = `
      <div class="turntable"><div class="big-sleeve"><img src="${img}" alt="${esc(d.title)} cover"></div><div class="big-disc"><span class="label"></span></div></div>
      <div class="notes">
        <p class="eyebrow">${esc(d.kind)}${d.year ? ' · ' + esc(d.year) : ''}</p>
        <h2>${esc(d.title)}</h2>
        ${d.note ? `<p class="liner">${esc(d.note)}</p>` : ''}
        <div class="player">${spotify(d.sp, d.title, 352)}</div>
        <div class="links"><a href="https://open.spotify.com/album/${d.sp}" target="_blank" rel="noopener">Spotify</a><a href="${d.am}" target="_blank" rel="noopener">Apple Music</a><a href="${d.yt}" target="_blank" rel="noopener">YouTube Music</a></div>
        <button class="close" type="button">← Back on the shelf</button>
      </div>`;
    opened.classList.add('on');
    opened.querySelector('.close').addEventListener('click', () => { opened.classList.remove('on'); history.replaceState(null, '', location.pathname); btn.focus(); });
    history.replaceState(null, '', '#' + btn.dataset.rid);
    if (scroll) opened.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block: 'start'});
  }
  if (opened) {
    document.querySelectorAll('button.rec').forEach(b => b.addEventListener('click', () => openRecord(b, true)));
    // records use data-rid, not id, so the browser's own jump to #hash doesn't fight this scroll
    const start = location.hash && document.querySelector(`button.rec[data-rid="${CSS.escape(location.hash.slice(1))}"]`);
    if (start) openRecord(start, true);
  }

  /* ---------- video lightbox ---------- */
  const lb = document.querySelector('.lightbox');
  if (lb && EMBEDS) {
    const frame = lb.querySelector('.frame');
    const close = () => { lb.classList.remove('open'); frame.innerHTML = ''; };
    document.querySelectorAll('a.vid[data-yt]').forEach(a => a.addEventListener('click', e => {
      e.preventDefault();
      frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${a.dataset.yt}?autoplay=1&rel=0" title="${esc(a.querySelector('.vt').textContent)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
      lb.classList.add('open'); lb.querySelector('.x').focus();
    }));
    lb.querySelector('.x').addEventListener('click', close);
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* ---------- Bandsintown: say so if the widget can't load ---------- */
  document.querySelectorAll('.bit-slot').forEach(slot => {
    setTimeout(() => {
      // the fallback is hidden, so a slot with almost no height means the widget never drew anything
      if (slot.getBoundingClientRect().height < 40) slot.classList.add('empty');
    }, 5000);
  });

  /* ---------- contact: copy email ---------- */
  const copy = document.getElementById('copy');
  if (copy) copy.addEventListener('click', async () => {
    const mail = document.querySelector('.mail');
    try { await navigator.clipboard.writeText(mail.textContent.trim()); copy.textContent = 'Copied'; }
    catch { const r = document.createRange(); r.selectNodeContents(mail); getSelection().removeAllRanges(); getSelection().addRange(r); copy.textContent = 'Selected. Press copy'; }
  });
})();
