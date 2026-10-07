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
  function closeMenu(){ if (!menu) return; menu.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.textContent = 'Menu'; }
  if (menu && menuBtn) {
    menuBtn.addEventListener('click', () => {
      const open = !menu.classList.contains('open');
      menu.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.textContent = open ? 'Close' : 'Menu';
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
      birds.forEach((b, i) => {
        const local = Math.max(0, Math.min(1, p * 1.6 - i * .2 + .25)); // the first bird starts part-colored
        b.querySelector('.color').style.setProperty('--p', (local * 100).toFixed(1) + '%');
        b.style.translate = `${(p * 30 * (i + 1)).toFixed(1)}px ${(-p * 40 * (i + 1)).toFixed(1)}px`;
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
  const opened = document.getElementById('opened');
  function openRecord(btn, scroll){
    const d = btn.dataset, img = btn.querySelector('img').getAttribute('src');
    opened.style.setProperty('--lbl', `url('${img}')`);
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
