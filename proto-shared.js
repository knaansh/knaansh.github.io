/* Shared by the three prototype directions. Each page sets window.PROTO hooks before loading this file. */
const HOOKS = window.PROTO || {};
// Real site: widgets load. Inside the Claude preview frame they're blocked, so show stand-ins.
const LIVE = window.self === window.top;

const RECORDS = [
  {id:'tpbtf', title:'Teaching Paper Birds To Fly', kind:'Album', year:'2023', img:'album-tpbtf.png', sp:'74B7WurXoJ1MMDn0ZmAo7s',
   am:'https://music.apple.com/il/album/teaching-paper-birds-to-fly/1655574635', yt:'https://music.youtube.com/playlist?list=PLCCNsoUHoq4o5NijZ62lfa7pSjsUgwJgP', note:''},
  {id:'ffh', title:'Far From Home', kind:'EP', year:'2018', img:'album-ffh.png', sp:'16BuRoF70WWl1MF4a8XRHp',
   am:'https://music.apple.com/il/album/far-from-home-ep/1438834858', yt:'https://music.youtube.com/playlist?list=OLAK5uy_m-f19RqgK8dIMIciOLWZmaoUWYd4WJwZE', note:''},
  {id:'1999', title:'1999', kind:'Single', year:'', img:'album-1999.png', sp:'4MzitlFYPf79nKNswO7tZg',
   am:'https://music.apple.com/il/album/1999-single/1488921222', yt:'https://music.youtube.com/watch?v=iAaRA5j4s1g', note:''},
  {id:'ywsif', title:"You Won't Say It First", kind:'Single', year:'', img:'album-you-wont-say-it-first.png', sp:'1JE4gziBlj4gfkQ1RJfzJh',
   am:'https://music.apple.com/zm/song/you-wont-say-it-first/1462421587', yt:'https://music.youtube.com/watch?v=Sw6MtUzulzc', note:''},
  {id:'anfos', title:'A Night Full Of Stars', kind:'Live EP', year:'', img:'album-night-full-of-stars.png', sp:'2XNUBpDgehvlBzUOSKpUVE',
   am:'https://music.apple.com/il/album/a-night-full-of-stars-live-ep/1454276522', yt:'https://music.youtube.com/playlist?list=OLAK5uy_mfSeTYdqi3SfT1C-vZpZGgWwDKrG9AHpI', note:''},
  {id:'lit', title:'Lost In Time', kind:'EP', year:'2014', img:'album-lost-in-time.png', sp:'2mRCZZTFrL7EN4Kvm7EJyk',
   am:'https://music.apple.com/il/album/lost-in-time-ep/950357700', yt:'https://music.youtube.com/playlist?list=OLAK5uy_moBJATOf3xelXRrgC7LJuLnm-LRJUyrZc',
   note:'Self-released in November 2014. The single Stay A Little Longer reached radio in Switzerland and beyond in early 2015.'},
];
const VIDEOS = [
  ['wY_Nl4oxWm8','The Morning Papers','yt-wY_Nl4oxWm8.jpg'],
  ['DsjrlqTeLkU',"You Won't Say It First",'yt-DsjrlqTeLkU.jpg'],
  ['rWR6Qf7z964','Teaching Paper Birds To Fly','yt-rWR6Qf7z964.jpg'],
  ['Aynt3WShcuI','A Night Full Of Stars (Live)','drive-photos/barby-ADM1430.jpg'],
  ['IbCsw6QKSGc','My Quiet Place Under The Sun (Live)','drive-photos/lev-lev4.jpg'],
  ['IsUUwdtDjZA','Stay For The Night (Live)','drive-photos/barby-ADM1458.jpg'],
  ['CnSLCvRPO8M','Stay A Little Longer (Live Session)','drive-photos/malabia-DSC1221.jpg'],
  ['sVB3mFmFcq8','Sunrise (Live Session)','drive-photos/barby-ADM1661-solo.jpg'],
];
const IMG = p => 'assets/images/' + p;
const esc = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------- shelf ---------- */
function recHTML(r){
  return `<button class="rec" data-open="${r.id}" style="--lbl:url('${IMG(r.img)}')" aria-label="Open ${esc(r.title)}">
    <span class="sleeve"><span class="disc"></span><img src="${IMG(r.img)}" alt="" loading="lazy"></span>
    <span class="meta"><b>${esc(r.title)}</b><small>${r.kind}${r.year ? ' · ' + r.year : ''}</small></span></button>`;
}
document.querySelectorAll('[data-shelf]').forEach(el => el.innerHTML = RECORDS.map(recHTML).join(''));

function openRecord(id){
  const r = RECORDS.find(x => x.id === id); if(!r) return;
  const box = document.getElementById('opened');
  box.style.setProperty('--lbl', `url('${IMG(r.img)}')`);
  box.innerHTML = `
    <div class="turntable"><div class="big-sleeve"><img src="${IMG(r.img)}" alt="${esc(r.title)} cover"></div>
      <div class="big-disc"><span class="label"></span></div></div>
    <div class="notes">
      <p class="eyebrow">${r.kind}${r.year ? ' · ' + r.year : ''}</p>
      <h2>${esc(r.title)}</h2>
      ${r.note ? `<p class="liner">${esc(r.note)}</p>` : `<p class="liner todo">Liner note goes here: a few lines on where this record came from.</p>`}
      <div class="row"><button class="btn" data-play="${r.id}">▶ Play in the bar</button></div>
      <div class="links"><a href="https://open.spotify.com/album/${r.sp}" target="_blank" rel="noopener">Spotify</a><a href="${r.am}" target="_blank" rel="noopener">Apple Music</a><a href="${r.yt}" target="_blank" rel="noopener">YouTube Music</a></div>
      <button class="close" data-close>← Back on the shelf</button>
    </div>`;
  box.classList.add('on');
  syncSpin();
  box.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'center'});
}

/* ---------- videos ---------- */
document.querySelectorAll('[data-videos]').forEach(el => {
  const n = el.dataset.videos === 'all' ? VIDEOS.length : +el.dataset.videos;
  el.innerHTML = VIDEOS.slice(0, n).map(([id,t,fallback], i) => {
    const src = LIVE ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : IMG(fallback);
    return `<a class="vid${i===0?' feat':''}" href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener">
      <span class="thumb"><img src="${src}" onerror="this.onerror=null;this.src='${IMG(fallback)}'" alt="" loading="lazy"><span class="play"></span></span>
      <span>${esc(t)}</span></a>`;
  }).join('');
});

/* ---------- bandsintown ---------- */
const BIT_ATTRS = {
  'data-artist-name':'id_2039791','data-app-id':'c506b1d08fc276d96da2c4661d702c5e',
  'data-background-color':'rgba(251,249,244,1)','data-separator-color':'rgba(20,20,20,0.12)','data-text-color':'rgba(20,20,20,1)',
  'data-display-local-dates':'true','data-local-dates-position':'tab','data-display-past-dates':'false','data-display-details':'false',
  'data-display-lineup':'false','data-display-start-time':'true','data-social-share-icon':'false','data-display-limit':'10',
  'data-date-format':'MMM. D, YYYY','data-date-orientation':'horizontal','data-event-ticket-text':'TICKETS','data-event-ticket-icon':'false',
  'data-event-ticket-cta-size':'large','data-event-ticket-cta-text-color':'rgba(79,126,166,1)','data-event-ticket-cta-bg-color':'rgba(255,255,255,0)',
  'data-event-ticket-cta-border-color':'rgba(79,126,166,1)','data-event-ticket-cta-border-width':'2px','data-event-ticket-cta-border-radius':'0px',
  'data-event-rsvp-position':'hidden','data-follow-section-position':'bottom','data-follow-section-cta-text':'FOLLOW',
  'data-follow-section-cta-text-color':'rgba(79,126,166,1)','data-follow-section-cta-bg-color':'rgba(0,0,0,0)',
  'data-follow-section-cta-border-color':'rgba(79,126,166,1)','data-follow-section-cta-border-width':'2px','data-follow-section-cta-border-radius':'0px',
  'data-play-my-city-position':'hidden','data-language':'en','data-bit-logo-position':'hidden'
};
Object.assign(BIT_ATTRS, HOOKS.bit || {});
const bitSlots = [...document.querySelectorAll('[data-bit]')];
if (LIVE) {
  bitSlots.forEach(slot => {
    const a = document.createElement('a'); a.className = 'bit-widget-initializer';
    for (const [k,v] of Object.entries(BIT_ATTRS)) a.setAttribute(k, v);
    slot.appendChild(a);
  });
  const s = document.createElement('script'); s.charset = 'utf-8'; s.src = 'https://widgetv3.bandsintown.com/main.min.js';
  document.body.appendChild(s);
} else {
  bitSlots.forEach(slot => slot.innerHTML = `<div class="bit-empty"><strong>Your Bandsintown dates load here.</strong>
    <p>On the real site this is the live Bandsintown widget, restyled to sit on the taped-down setlist. The preview frame blocks outside widgets, so this is a stand-in.</p></div>`);
}

/* ---------- player bar ---------- */
const bar = document.getElementById('bar');
let current = RECORDS[0], playing = false;
function setRecord(r, autoplay){
  current = r;
  document.getElementById('bar-cov').src = IMG(r.img);
  document.getElementById('bar-title').textContent = r.title;
  document.getElementById('bar-out').href = 'https://open.spotify.com/album/' + r.sp;
  if (LIVE) {
    bar.classList.add('live');
    document.getElementById('bar-embed').innerHTML = `<iframe title="${esc(r.title)} on Spotify" src="https://open.spotify.com/embed/album/${r.sp}?utm_source=generator&theme=${HOOKS.spotifyTheme ?? 0}" width="100%" height="80" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style="border-radius:8px;display:block;margin-top:6px"></iframe>`;
    document.body.style.setProperty('--bar-h','96px');
    document.getElementById('bar-state').textContent = 'Now playing · press play in the player';
  } else {
    playing = autoplay ?? playing; paint();
  }
}
function paint(){
  bar.classList.toggle('playing', playing);
  document.getElementById('pp').setAttribute('aria-label', playing ? 'Pause' : 'Play');
  document.getElementById('bar-state').textContent = playing ? 'Now playing · preview' : 'Paused';
  syncSpin();
}
function syncSpin(){ document.getElementById('opened').style.setProperty('--spin', (playing && document.querySelector('.turntable')) ? 'running' : 'paused'); }
document.getElementById('pp').addEventListener('click', () => { playing = !playing; paint(); });

/* ---------- routing ---------- */
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
let view = null;
function show(name, animate){
  if (!document.querySelector(`[data-view="${name}"]`)) name = 'home';
  if (name === view) { window.scrollTo({top:0, behavior:'smooth'}); return; }
  const swap = () => {
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('on', v.dataset.view === name));
    document.querySelectorAll('.nav .links a').forEach(a => a.dataset.go === name ? a.setAttribute('aria-current','page') : a.removeAttribute('aria-current'));
    window.scrollTo(0,0); view = name; HOOKS.onView?.(name); HOOKS.onScroll?.(view);
  };
  if (!animate || reduce.matches) return swap();
  HOOKS.transition ? HOOKS.transition(swap) : swap();
}
document.addEventListener('click', e => {
  const go = e.target.closest('[data-go]');
  if (go) { e.preventDefault(); history.replaceState(null,'','#'+go.dataset.go); show(go.dataset.go, true); return; }
  const op = e.target.closest('[data-open]');
  if (op) { if (view !== 'music') { history.replaceState(null,'','#music'); show('music', true); setTimeout(() => openRecord(op.dataset.open), 480); } else openRecord(op.dataset.open); return; }
  const pl = e.target.closest('[data-play]');
  if (pl) { setRecord(RECORDS.find(r => r.id === pl.dataset.play), true); return; }
  if (e.target.closest('[data-close]')) { document.getElementById('opened').classList.remove('on'); return; }
});
document.getElementById('copy').addEventListener('click', async e => {
  try { await navigator.clipboard.writeText('knaanshabtaymusic@gmail.com'); e.target.textContent = 'Copied'; }
  catch { const r = document.createRange(); r.selectNodeContents(document.querySelector('.mail')); getSelection().removeAllRanges(); getSelection().addRange(r); e.target.textContent = 'Selected, press copy'; }
});

if (HOOKS.onScroll) {
  addEventListener('scroll', () => requestAnimationFrame(() => HOOKS.onScroll(view)), {passive:true});
  addEventListener('resize', () => HOOKS.onScroll(view));
}
show((location.hash || '#home').slice(1), false);
setRecord(RECORDS[0], false);
