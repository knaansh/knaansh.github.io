/* One night at the show · Version A. Scroll engine and live content.
   Timeline units are "vh of scroll" exactly as in MOTION-SPEC.md (total 940). */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesk = () => innerWidth > 900;
  const EMBEDS = window.self === window.top; // YouTube, Spotify and Bandsintown only run on the real site, not in a preview frame
  const still = reduce || !window.gsap || !window.ScrollTrigger;
  if (still) root.classList.add('still');

  /* ---------- layer placement (1920×1080 plate space, from LAYERS-ASSETS.md) ---------- */
  const L = {
    'A1-fg': [1181, 338, 135, 156], 'A2-hero-still': [820, 107, 740, 579], 'A2-fg': [84, 635, 1245, 445],
    'A3-fg': [965, 118, 132, 147], 'A3-board': [600, 345, 490, 335],
    'A4-fg': [1111, 281, 603, 599], 'A4-ffh': [225, 330, 440, 290], 'A4-lit': [552, 440, 478, 320],
    'A5-card': [752, 396, 356, 272], 'A5-flyer': [352, 268, 272, 382],
    'm-A1-fg': [581, 180, 113, 130], 'm-A2-fg': [0, 480, 554, 280], 'm-A3-fg': [342, 41, 96, 104], 'm-A4-fg': [457, 161, 323, 360], 
  };
  document.querySelectorAll('[data-l]').forEach(el => {
    const b = L[el.dataset.l]; if (!b) return;
    if (el.dataset.l.startsWith('m-')) { // phone layers: percentages of the 780-wide art band
      const art = el.parentElement.querySelector('img'); const h = +art.getAttribute('height');
      Object.assign(el.style, {left: b[0] / 7.8 + '%', top: b[1] / h * 100 + '%', width: b[2] / 7.8 + '%'});
    } else Object.assign(el.style, {left: b[0] + 'px', top: b[1] + 'px', width: b[2] + 'px', height: b[3] + 'px'});
  });

  /* ---------- fit each plate to cover its scene ---------- */
  const scenes = [...document.querySelectorAll('.scene')];
  function fit(){
    scenes.forEach(sc => {
      const W = sc.clientWidth, H = sc.clientHeight, plate = sc.querySelector('.plate'); if (!W) return;
      const s = Math.max(W / 1920, H / 1080);
      plate.style.transform = `translate(${(W - 1920 * s) / 2}px,${(H - 1080 * s) / 2}px) scale(${s})`;
      plate.style.setProperty('--s', s);
      sc.querySelector('.cam').style.transformOrigin = sc.dataset.origin;
      const hero = sc.querySelector('.hero-type'); // the title sits in the art, where the sky begins
      if (hero) Object.assign(hero.style, {left: (W - 1920 * s) / 2 + 480 * s + 'px', top: (H - 1080 * s) / 2 + 138 * s + 'px'});
    });
  }
  fit(); addEventListener('resize', fit);

  /* ---------- the night: one scrubbed timeline ---------- */
  const REEL = root.classList.contains('vid-reel'); // Videos as a scroll-driven film reel (adds scroll length after the stage)
  const E = REEL ? 160 : 0, T = x => x >= 320 ? x + E : x, TOTAL = 1060 + E;
  document.getElementById('venue').style.setProperty('--extra', E + 'vh'); // desktop only: the phone stack sets its own height
  const SETTLED = {home: 0, videos: 220, tour: T(420), music: T(630), contact: T(795), list: T(965)}; // where each scene's content is in place
  const RANGES = [['home', 0], ['videos', 160], ['tour', T(400)], ['music', T(580)], ['contact', T(780)], ['list', T(890)]];
  const REVEALS = [['#s-tour .rv', T(415)], ['#s-music .card-title', T(590)], ['#s-music .spot-card', T(630)], ['#s-contact .rv', T(790)], ['#s-list .rv', T(950)]];
  let pos = 0, tl;
  const $ = s => document.querySelector(s);
  if (!still) {
    gsap.registerPlugin(ScrollTrigger);
    const [s1, s2, s3, s4, s5, s6] = scenes, cam = s => s.querySelector('.cam');
    gsap.set([s2, s3, s4, s5, s6], {autoAlpha: 0});
    tl = gsap.timeline({defaults: {ease: 'none'}, scrollTrigger: {trigger: '#venue', start: 'top top', end: 'bottom bottom', scrub: .6,
      onUpdate: self => { pos = self.progress * TOTAL; onPos(); }}});
    tl.set({}, {}, TOTAL); // pin the length
    // S1 Outside: dolly toward the door; the bird flies to it; the title lifts away
    tl.fromTo(cam(s1), {scale: 1, x: 0, y: 0}, {scale: 1.18, x: '-6vw', y: '-2vh', duration: 100}, 0)
      .fromTo('[data-l="A1-fg"]', {x: 0, y: 0, rotate: 8}, {x: '9vw', y: '-3vh', rotate: -4, duration: 100}, 0)
      .to('#s-home .hero-type', {autoAlpha: 0, y: -40, duration: 40}, 0)
    // 1→2 through the door: keep zooming in, the stage is revealed from the doorway
      .to(cam(s1), {scale: 2.4, duration: 60, ease: 'power2.inOut'}, 100)
      .to(s1, {autoAlpha: 0, duration: 24}, 136)
      .fromTo(s2, {autoAlpha: 1, clipPath: 'inset(44% 30% 40% 62%)'}, {clipPath: 'inset(0% 0% 0% 0%)', duration: 60, ease: 'power2.inOut', immediateRender: false}, 100)
      .fromTo(cam(s2), {scale: 1.12}, {scale: 1, duration: 60, ease: 'power2.inOut', immediateRender: false}, 100)
    // S2 Inside = Videos: lights come up, the Videos panel rises from behind the stage lip
      .fromTo('#s-videos .ink', {opacity: .45}, {opacity: 0, duration: 30, ease: 'power1.out'}, 160)
      .to(cam(s2), {scale: 1.05, duration: 30}, 160)
      .fromTo('#s-videos .vwall', {y: '22vh', rotate: REEL ? 0 : -2.5, autoAlpha: 0}, {y: 0, rotate: 0, autoAlpha: 1, duration: 40, ease: 'power3.out'}, 180);
    if (REEL) { // the reel runs right to left while you keep scrolling, then the camera moves on
      const track = $('[data-vtrack]'), dist = () => -(track.scrollWidth - innerWidth * .84);
      tl.fromTo(track, {x: '30vw'}, {x: dist, duration: 40 + E, ease: 'none', immediateRender: false}, 205);
    }
    tl
    // 2→3 pan right along the stage
      .to(s2, {x: '-35vw', duration: 80, ease: 'power1.inOut'}, T(320))
      .to(s2, {autoAlpha: 0, duration: 24}, T(376))
      .fromTo(s3, {autoAlpha: 0, x: '35vw'}, {autoAlpha: 1, x: 0, duration: 80, ease: 'power1.inOut', immediateRender: false}, T(320))
    // S3 Tour: the board settles, the bird hops
      .fromTo(cam(s3), {scale: 1.04}, {scale: 1, duration: 100, immediateRender: false}, T(400))
      .to('[data-l="A3-fg"]', {keyframes: [{y: -10, x: '-.5vw'}, {y: 0, x: '-1vw'}], duration: 100}, T(400))
    // 3→4 tilt down to the merch table
      .to(s3, {y: '-40vh', autoAlpha: 0, duration: 80, ease: 'power2.inOut'}, T(500))
      .fromTo(s4, {autoAlpha: 0, y: '40vh'}, {autoAlpha: 1, y: 0, duration: 80, ease: 'power2.inOut', immediateRender: false}, T(500))
      .fromTo(cam(s4), {scale: 1.08}, {scale: 1, duration: 80, ease: 'power2.inOut', immediateRender: false}, T(500))
    // S4 Music: pick up the record
      .fromTo('[data-l="A4-fg"]', {x: '-14vw', y: '16vh', rotate: -2, scale: .72}, {x: 0, y: 0, rotate: -7, scale: 1, duration: 50, ease: 'power2.out', immediateRender: false}, T(580))
    // 4→5 walk out: the camera turns
      .to(s4, {x: '30vw', autoAlpha: 0, duration: 80, ease: 'power2.inOut'}, T(700))
      .fromTo(s5, {autoAlpha: 0, x: '-30vw'}, {autoAlpha: 1, x: 0, duration: 80, ease: 'power2.inOut', immediateRender: false}, T(700))
    // 5→6 step out into the street under the stars: the mailing list
      .to(cam(s5), {scale: 1.55, x: '-20vw', y: '6vh', duration: 80, ease: 'power2.inOut'}, T(860))
      .to(s5, {autoAlpha: 0, duration: 30}, T(905))
      .fromTo(s6, {autoAlpha: 0}, {autoAlpha: 1, duration: 30, immediateRender: false}, T(900))
      .fromTo(cam(s6), {scale: 1.35, x: '8vw'}, {scale: 1.08, x: 0, duration: 70, ease: 'power2.out', immediateRender: false}, T(900))
    // S6: the camera eases back as the night ends
      .to(cam(s6), {scale: 1, duration: 40, ease: 'power2.inOut'}, T(1020));
  }

  /* ---------- per-position updates: reveals, nav state, lazy embeds ---------- */
  const navLinks = [...document.querySelectorAll('[data-go]')];
  function current(){
    if (!isDesk() || still) {
      let id = 'home';
      document.querySelectorAll(isDesk() ? '.scene' : '.msec').forEach(s => { if (s.getBoundingClientRect().top < innerHeight * .45) id = (s.id || '').replace('s-', ''); });
      return id;
    }
    let id = 'home'; RANGES.forEach(([k, v]) => { if (pos >= v) id = k; }); return id;
  }
  function onPos(){
    if (!still && isDesk()) {
      REVEALS.forEach(([sel, at]) => document.querySelectorAll(sel).forEach(el => el.classList.toggle('in', pos >= at)));
      $('.back-start').classList.toggle('on', pos >= T(1025));
      if (pos > T(360)) stopMain('[data-player]'); // pause a playing video once Videos leaves the frame
      if (pos > T(550)) loadSpotify();
    }
    const id = current();
    navLinks.forEach(a => { const on = a.dataset.go === id && id !== 'home'; a.toggleAttribute('aria-current', on); if (on) a.setAttribute('aria-current', a.closest('#site-menu') ? 'page' : 'true'); });
    document.querySelectorAll('.rail a').forEach(a => a.toggleAttribute('aria-current', a.dataset.go === id) || (a.dataset.go === id && a.setAttribute('aria-current', 'true')));
  }
  addEventListener('scroll', () => { if (still || !isDesk()) requestAnimationFrame(onPos); }, {passive: true});
  if (still) document.querySelectorAll('.rv').forEach(el => el.classList.add('in'));

  /* ---------- navigation ---------- */
  function go(id){ // jump straight to the scene, no scroll-through
    let y;
    if (isDesk() && !still) y = SETTLED[id] / TOTAL * (document.getElementById('venue').offsetHeight - innerHeight);
    else { const el = isDesk() ? document.getElementById('s-' + id) : document.getElementById(id); if (!el) return; y = el.getBoundingClientRect().top + scrollY - (isDesk() ? 0 : 64); }
    scrollTo({top: Math.max(0, y), behavior: 'instant'});
    if (tl) { ScrollTrigger.update(); const tw = tl.scrollTrigger.getTween(); if (tw) tw.progress(1); onPos(); } // skip the scrub catch-up
    history.replaceState(null, '', id === 'home' ? location.pathname : '#' + id);
  }
  navLinks.forEach(a => a.addEventListener('click', e => { e.preventDefault(); const id = a.dataset.go; if (menu.classList.contains('open')) { setMenu(false); setTimeout(() => go(id), 280); } else go(id); }));
  addEventListener('load', () => { const h = location.hash.slice(1); if (SETTLED[h] !== undefined && h !== 'home') setTimeout(() => go(h), 60); onPos(); });

  /* ---------- phone menu: drop-down paper sheet with scroll lock and focus trap ---------- */
  const menu = document.getElementById('site-menu'), toggle = document.querySelector('.nav-toggle'), scrim = document.querySelector('.scrim'), venue = document.getElementById('venue');
  let savedY = 0;
  function setMenu(open){
    menu.classList.toggle('open', open); scrim.classList.toggle('on', open);
    toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
    if (open) { menu.setAttribute('role', 'dialog'); menu.setAttribute('aria-modal', 'true'); savedY = scrollY; root.style.overflow = 'hidden'; venue.inert = true; setTimeout(() => menu.querySelector('a').focus(), 60); }
    else { menu.removeAttribute('role'); menu.removeAttribute('aria-modal'); root.style.overflow = ''; venue.inert = false; scrollTo(0, savedY); toggle.focus({preventScroll: true}); }
  }
  toggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  scrim.addEventListener('click', () => setMenu(false));
  addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (menu.classList.contains('open')) setMenu(false); closePop(); }
    if (pop.classList.contains('cinema') && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) openVideo(vNow + (e.key === 'ArrowRight' ? 1 : -1));
    if (e.key === 'Tab' && menu.classList.contains('open')) {
      const f = [...menu.querySelectorAll('a'), toggle], i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ---------- videos: the main one plays in place, the rest open a pop-up ---------- */
  const VIDEOS = [ // TPB uses the album cover, never the YouTube thumbnail
    ['wY_Nl4oxWm8', 'The Morning Papers', 'assets/venue/media/yt-wY_Nl4oxWm8.webp'],
    ['DsjrlqTeLkU', "You Won't Say It First", 'assets/venue/media/yt-DsjrlqTeLkU.webp'],
    ['rWR6Qf7z964', 'Teaching Paper Birds To Fly', 'assets/venue/media/album-tpbtf.webp'],
    ['SyzsT22DwO8', 'Something Is Missing', 'yt'], ['Aynt3WShcuI', 'A Night Full Of Stars (Live)', 'yt'],
    ['IbCsw6QKSGc', 'My Quiet Place Under The Sun (Live)', 'yt'], ['IsUUwdtDjZA', 'Stay For The Night (Live)', 'yt'],
    ['CnSLCvRPO8M', 'Stay A Little Longer (Live Session)', 'yt'], ['sVB3mFmFcq8', 'Sunrise (Live Session)', 'yt'],
  ];
  const FALLBACK = ['barby-ADM1458', 'barby-ADM1430', 'lev-lev4', 'barby-ADM1661-solo', 'malabia-DSC1221', 'barby-ADM1430'];
  const thumb = (v, i) => v[2] !== 'yt' ? v[2] : (EMBEDS ? `https://i.ytimg.com/vi/${v[0]}/hqdefault.jpg` : `assets/venue/media/${FALLBACK[(i - 3) % FALLBACK.length]}.webp`);
  const ytFrame = (id, t) => `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&enablejsapi=1" title="${t}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  const facade = (v, i) => `<img src="${thumb(v, i)}" alt=""><span class="t">Knaan Shabtay — ${v[1]}</span><a class="yt" href="https://www.youtube.com/watch?v=${v[0]}" data-play="${i}" aria-label="Play ${v[1]}"></a>`;
  document.querySelectorAll('[data-player]').forEach(p => p.innerHTML = facade(VIDEOS[0], 0));
  function stopMain(sel){ document.querySelectorAll(sel).forEach(p => { if (p.querySelector('iframe')) p.innerHTML = facade(VIDEOS[0], 0); }); }
  const cardHTML = (v, i, cls) => `<button class="${cls}" type="button" data-v="${i}"><img src="${thumb(v, i)}" alt="" loading="lazy"><span><small>Knaan Shabtay</small><b>${v[1]}</b></span></button>`;
  document.querySelectorAll('[data-upnext]').forEach(u => u.innerHTML = VIDEOS.slice(1).map((v, j) => cardHTML(v, j + 1, 'vcard')).join(''));
  const wallCard = (v, i) => `<button class="wcard" type="button" data-v="${i}"><span class="ph"><img src="${thumb(v, i)}" alt="" loading="lazy"><i class="yt"></i></span><span class="tx"><small>${String(i + 1).padStart(2, '0')}</small><b>${v[1]}</b></span></button>`;
  document.querySelectorAll('[data-vtrack]').forEach(t => t.innerHTML = VIDEOS.map(wallCard).join(''));
  document.querySelectorAll('[data-vrows]').forEach(u => u.innerHTML = VIDEOS.slice(1).map((v, j) => cardHTML(v, j + 1, 'vrow')).join(''));
  function note(btn){ const box = btn.closest('.player, .vplayer'); if (!box || box.querySelector('.pnote')) return;
    box.insertAdjacentHTML('beforeend', `<div class="pnote"><p>On the live site the video plays right here.</p><a href="${btn.href}" target="_blank" rel="noopener">Open on YouTube ↗</a></div>`); }

  /* ---------- records ---------- */
  const RECORDS = { // id: title, kind, year, spotify, apple music, youtube music, liner note
    tpbtf: ['Teaching Paper Birds To Fly', 'Album', '2023', '74B7WurXoJ1MMDn0ZmAo7s', 'https://music.apple.com/il/album/teaching-paper-birds-to-fly/1655574635', 'https://music.youtube.com/playlist?list=PLCCNsoUHoq4o5NijZ62lfa7pSjsUgwJgP', ''],
    ffh: ['Far From Home', 'EP', '2018', '16BuRoF70WWl1MF4a8XRHp', 'https://music.apple.com/il/album/far-from-home-ep/1438834858', 'https://music.youtube.com/playlist?list=OLAK5uy_m-f19RqgK8dIMIciOLWZmaoUWYd4WJwZE', ''],
    'lost-in-time': ['Lost In Time', 'EP', '2014', '2mRCZZTFrL7EN4Kvm7EJyk', 'https://music.apple.com/il/album/lost-in-time-ep/950357700', 'https://music.youtube.com/playlist?list=OLAK5uy_moBJATOf3xelXRrgC7LJuLnm-LRJUyrZc', 'Self-released in November 2014. The single Stay A Little Longer reached radio in Switzerland and beyond in early 2015.'],
    'you-wont-say-it-first': ["You Won't Say It First", 'Single', '', '1JE4gziBlj4gfkQ1RJfzJh', 'https://music.apple.com/zm/song/you-wont-say-it-first/1462421587', 'https://music.youtube.com/watch?v=Sw6MtUzulzc', ''],
    '1999': ['1999', 'Single', '', '4MzitlFYPf79nKNswO7tZg', 'https://music.apple.com/il/album/1999-single/1488921222', 'https://music.youtube.com/watch?v=iAaRA5j4s1g', ''],
    'night-full-of-stars': ['A Night Full Of Stars', 'Live EP', '', '2XNUBpDgehvlBzUOSKpUVE', 'https://music.apple.com/il/album/a-night-full-of-stars-live-ep/1454276522', 'https://music.youtube.com/playlist?list=OLAK5uy_mfSeTYdqi3SfT1C-vZpZGgWwDKrG9AHpI', ''],
  };
  const alias = {lit: 'lost-in-time'};
  const cover = id => `assets/venue/media/album-${id}.webp`;
  const spotFrame = (r, cls = '') => `<iframe class="${cls}" title="${r[0]} on Spotify" src="https://open.spotify.com/embed/album/${r[3]}?utm_source=generator&theme=0" height="152" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
  let picked = 'tpbtf', spotOn = false;
  function renderSpot(){
    const r = RECORDS[picked];
    document.querySelectorAll('[data-spot]').forEach(el => {
      el.innerHTML = EMBEDS && spotOn ? spotFrame(r)
        : `<button class="spot" type="button" data-rec="${picked}"><img src="${cover(picked)}" alt=""><span><b>${r[0]}</b><small>Knaan Shabtay · ${r[1]}</small><em>Open the record</em></span></button>`;
    });
    document.querySelectorAll('[data-covers]').forEach(c => c.innerHTML = Object.keys(RECORDS).map(k => `<button type="button" data-rec="${k}" aria-label="Open ${RECORDS[k][0]}"><img src="${cover(k)}" alt=""></button>`).join(''));
    document.querySelectorAll('[data-rrows]').forEach(c => c.innerHTML = Object.keys(RECORDS).filter(k => k !== picked).map(k => `<button class="rrow" type="button" data-rec="${k}"><img src="${cover(k)}" alt="" loading="lazy"><span><b>${RECORDS[k][0]} (${RECORDS[k][1]})</b><small>Spotify · Apple Music · YouTube Music</small></span></button>`).join(''));
  }
  function loadSpotify(){ if (!spotOn) { spotOn = true; renderSpot(); } }
  renderSpot();

  /* ---------- pop-ups (record and video) ---------- */
  const pop = document.getElementById('pop'), box = pop.querySelector('.box');
  function openRecord(id){
    id = alias[id] || id; const r = RECORDS[id]; if (!r) return;
    box.innerHTML = `<div class="tt"><div class="slv"><img src="${cover(id)}" alt="${r[0]} cover"></div><div class="disc" style="--lbl:url('${new URL(cover(id), location.href).href}')"><i></i></div></div>
      <div class="info"><p class="kicker">${r[1]}${r[2] ? ' · ' + r[2] : ''}</p><h3>${r[0]}</h3>${r[6] ? `<p class="liner">${r[6]}</p>` : ''}${EMBEDS ? spotFrame(r, 'spotify') : ''}
        <div class="stream"><a href="https://open.spotify.com/album/${r[3]}" target="_blank" rel="noopener">Spotify</a><a href="${r[4]}" target="_blank" rel="noopener">Apple Music</a><a href="${r[5]}" target="_blank" rel="noopener">YouTube Music</a></div></div>`;
    pop.classList.remove('video', 'cinema'); pop.classList.add('open'); pop.querySelector('.x').focus();
    picked = id; renderSpot();
  }
  let vNow = 0;
  function openVideo(i){ // cinema: the video takes the whole window, with previous / next
    i = (i + VIDEOS.length) % VIDEOS.length; const v = VIDEOS[i]; if (!v) return; stopMain('[data-player]'); vNow = i;
    box.innerHTML = `<div class="vplayer">${EMBEDS ? ytFrame(v[0], v[1]) : facade(v, i)}</div>
      <div class="cbar"><div><p class="kicker">${String(i + 1).padStart(2, '0')} / ${String(VIDEOS.length).padStart(2, '0')} · Knaan Shabtay</p><h3>${v[1]}</h3></div>
        <div class="cnav"><button type="button" data-vstep="-1" aria-label="Previous video">←</button><button type="button" data-vstep="1" aria-label="Next video">→</button><a href="https://www.youtube.com/watch?v=${v[0]}" target="_blank" rel="noopener">YouTube ↗</a></div></div>`;
    pop.classList.add('video', 'cinema', 'open'); pop.querySelector('.x').focus();
  }
  function closePop(){ if (!pop.classList.contains('open')) return; pop.classList.remove('open', 'video', 'cinema'); box.innerHTML = ''; }
  document.addEventListener('click', e => {
    const play = e.target.closest('[data-play]');
    if (play) { e.preventDefault(); if (!EMBEDS) return note(play); const p = play.closest('[data-player]'); if (p) p.innerHTML = ytFrame(VIDEOS[+play.dataset.play][0], VIDEOS[+play.dataset.play][1]); return; }
    const st = e.target.closest('[data-vstep]'); if (st) return openVideo(vNow + +st.dataset.vstep);
    const v = e.target.closest('[data-v]'); if (v) return openVideo(+v.dataset.v);
    const r = e.target.closest('[data-rec]'); if (r) return openRecord(r.dataset.rec);
    if (e.target.closest('[data-close]') || e.target === pop) closePop();
  });

  /* ---------- mailing list: Mailchimp, sent in the background so visitors stay on the page ---------- */
  const MC_URL = ''; // Mailchimp › Audience › Signup forms › Embedded form › the form's action="…list-manage.com/subscribe/post?u=…&id=…"
  document.querySelectorAll('[data-mc]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const input = f.querySelector('input[type=email]'), msg = f.querySelector('.mc-msg'), email = input.value.trim();
    const say = (t, cls) => { msg.textContent = t; msg.className = 'mc-msg ' + (cls || ''); };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return say('That email doesn\u2019t look right.', 'err');
    if (!MC_URL || !EMBEDS) return say('Sign-ups open soon. Thanks for your patience!', 'err');
    const cb = 'mc' + Date.now(), s = document.createElement('script');
    const done = () => { delete window[cb]; s.remove(); f.querySelector('button').disabled = false; };
    const timer = setTimeout(() => { done(); say('Something went wrong. Please try again.', 'err'); }, 9000);
    window[cb] = d => { clearTimeout(timer); done();
      if (d.result === 'success') { say('You\u2019re on the list. Thanks!', 'ok'); input.value = ''; }
      else say(/already subscribed/i.test(d.msg) ? 'You\u2019re already on the list.' : 'Something went wrong. Please try again.', 'err'); };
    f.querySelector('button').disabled = true; say('Sending\u2026');
    s.src = MC_URL.replace('/post?', '/post-json?') + '&EMAIL=' + encodeURIComponent(email) + '&c=' + cb;
    document.body.appendChild(s);
  }));

  /* ---------- Bandsintown: the visible slot gets the real widget ---------- */
  function loadBIT(){
    const boxes = [...document.querySelectorAll('[data-bit]')];
    if (!EMBEDS) return boxes.forEach(b => b.classList.add('empty'));
    const target = boxes.find(b => b.offsetParent !== null) || boxes[0];
    boxes.filter(b => b !== target).forEach(b => b.classList.add('empty'));
    const a = document.createElement('a'); a.className = 'bit-widget-initializer';
    Object.entries({'data-artist-name': 'id_2039791', 'data-app-id': 'c506b1d08fc276d96da2c4661d702c5e', 'data-background-color': 'rgba(251,249,244,1)', 'data-separator-color': 'rgba(20,20,20,0.12)', 'data-text-color': 'rgba(20,20,20,1)', 'data-display-local-dates': 'true', 'data-local-dates-position': 'tab', 'data-display-past-dates': 'false', 'data-display-details': 'false', 'data-display-lineup': 'false', 'data-display-start-time': 'true', 'data-social-share-icon': 'false', 'data-display-limit': '10', 'data-date-format': 'MMM. D, YYYY', 'data-date-orientation': 'horizontal', 'data-event-ticket-text': 'TICKETS', 'data-event-ticket-icon': 'false', 'data-event-ticket-cta-text-color': 'rgba(79,126,166,1)', 'data-event-ticket-cta-bg-color': 'rgba(255,255,255,0)', 'data-event-ticket-cta-border-color': 'rgba(79,126,166,1)', 'data-event-ticket-cta-border-width': '2px', 'data-event-ticket-cta-border-radius': '0px', 'data-event-rsvp-position': 'hidden', 'data-follow-section-position': 'bottom', 'data-follow-section-cta-text': 'FOLLOW', 'data-follow-section-cta-text-color': 'rgba(79,126,166,1)', 'data-follow-section-cta-bg-color': 'rgba(0,0,0,0)', 'data-follow-section-cta-border-color': 'rgba(79,126,166,1)', 'data-follow-section-cta-border-width': '2px', 'data-follow-section-cta-border-radius': '0px', 'data-play-my-city-position': 'hidden', 'data-language': 'en', 'data-bit-logo-position': 'hidden'}).forEach(([k, v]) => a.setAttribute(k, v));
    target.querySelector('.bit-slot').appendChild(a);
    const s = document.createElement('script'); s.src = 'https://widgetv3.bandsintown.com/main.min.js'; s.charset = 'utf-8'; document.body.appendChild(s);
    setTimeout(() => { if (target.querySelector('.bit-slot').getBoundingClientRect().height < 30) target.classList.add('empty'); }, 6000);
  }
  let bitDone = false; const bitOnce = () => { if (!bitDone) { bitDone = true; loadBIT(); } };
  addEventListener('scroll', () => { if (scrollY > innerHeight * .8) bitOnce(); }, {passive: true});
  setTimeout(bitOnce, 4000);

  /* ---------- phone: reveals and the Spotify player load as sections come near ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); if (e.target.closest('#music')) loadSpotify(); io.unobserve(e.target); } }), {rootMargin: '0px 0px -10% 0px'});
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  if (still) loadSpotify();
  onPos();
})();
