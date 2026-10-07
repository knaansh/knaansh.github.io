/* A folded-paper hummingbird that travels down the page in 3D.
   It starts beside the hero flock, perches on each section or page title, swoops out of frame
   between them and comes back in, and fills in with the album's colors as it goes.
   Needs Three.js (loaded before this file). Skipped for reduced motion or without WebGL. */
(() => {
  if (!window.THREE || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const T = THREE;

  const canvas = document.createElement('canvas');
  canvas.className = 'bird-layer';
  canvas.setAttribute('aria-hidden', 'true');
  let renderer;
  try { renderer = new T.WebGLRenderer({canvas, alpha: true, antialias: true}); } catch { return; }
  document.body.appendChild(canvas);
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 12);
  scene.add(new T.AmbientLight(0xffffff, 0.62));
  const sun = new T.DirectionalLight(0xffffff, 0.75);
  sun.position.set(-3, 6, 8);
  scene.add(sun);

  /* ---------- paper texture that fills with color ---------- */
  const tex = document.createElement('canvas');
  tex.width = 256; tex.height = 64;
  const g = tex.getContext('2d');
  const map = new T.CanvasTexture(tex);
  let painted = -1;
  function paint(f){ // f: 0..1, colors spread from the tail toward the beak
    if (Math.abs(f - painted) < 0.01) return;
    painted = f;
    g.fillStyle = '#fbf9f4'; g.fillRect(0, 0, 256, 64);
    const grad = g.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0, '#24315f');   // tail, deep navy
    grad.addColorStop(0.3, '#6c5fb4'); // purple
    grad.addColorStop(0.55, '#5b8fc4'); // blue
    grad.addColorStop(0.78, '#86bd78'); // green
    grad.addColorStop(1, '#e6d65a');   // yellow head
    g.fillStyle = grad; g.fillRect(0, 0, 256 * f, 64);
    map.needsUpdate = true;
  }
  paint(0.15);
  const paper = new T.MeshLambertMaterial({map, side: T.DoubleSide});
  const ink = new T.LineBasicMaterial({color: 0x141414});

  // u runs along the body from tail (x=-1.5) to beak (x=1.7)
  function part(verts, faces){
    const geo = new T.BufferGeometry();
    const pos = [], uv = [];
    faces.forEach(f => f.forEach(i => { const v = verts[i]; pos.push(...v); uv.push((v[0] + 1.5) / 3.2, 0.5); }));
    geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
    geo.computeVertexNormals();
    const m = new T.Mesh(geo, paper);
    m.add(new T.LineSegments(new T.EdgesGeometry(geo, 1), ink));
    return m;
  }

  /* ---------- the origami hummingbird, nose along +x ---------- */
  const body = new T.Group();
  body.add(part(
    [[0.75, 0.12, 0], [-0.9, 0.18, 0], [0.05, -0.28, 0], [0.05, 0.16, 0.16], [0.05, 0.16, -0.16], [1.0, 0.2, 0]],
    [[0, 3, 2], [0, 2, 4], [1, 2, 3], [1, 4, 2], [0, 4, 3], [1, 3, 4], [0, 3, 5], [0, 5, 4]]
  ));
  body.add(part([[0.95, 0.2, 0.03], [0.95, 0.2, -0.03], [1.7, 0.14, 0], [0.98, 0.15, 0]], [[0, 2, 3], [3, 2, 1], [0, 1, 2]])); // beak
  body.add(part([[-0.85, 0.18, 0], [-1.5, 0.45, 0.28], [-1.45, 0.3, 0], [-1.5, 0.45, -0.28]], [[0, 1, 2], [0, 2, 3]])); // tail fan
  function wing(side){
    const hinge = new T.Group(); hinge.position.set(0, 0.16, 0.12 * side);
    const inner = part([[0.35, 0, 0], [-0.45, 0, 0], [-0.55, 0, 0.75 * side], [0.15, 0, 0.8 * side]], [[0, 1, 2], [0, 2, 3]]);
    const elbow = new T.Group(); elbow.position.set(0, 0, 0.78 * side);
    elbow.add(part([[0.15, 0, 0], [-0.55, 0, -0.03 * side], [-0.25, 0, 0.75 * side]], [[0, 1, 2]]));
    hinge.add(inner); hinge.add(elbow);
    return {hinge, elbow};
  }
  const L = wing(1), R = wing(-1);
  body.add(L.hinge); body.add(R.hinge);
  const facing = new T.Group(); facing.rotation.y = -Math.PI / 2; facing.add(body); // nose now along +z
  const bird = new T.Group(); bird.add(facing); scene.add(bird);

  /* ---------- screen <-> world ---------- */
  const ray = new T.Raycaster(), plane = new T.Plane(new T.Vector3(0, 0, 1), 0), tmp = new T.Vector2();
  let W = innerWidth, H = innerHeight;
  function toWorld(x, y){
    tmp.set((x / W) * 2 - 1, -(y / H) * 2 + 1);
    ray.setFromCamera(tmp, camera);
    const out = new T.Vector3();
    ray.ray.intersectPlane(plane, out);
    return out;
  }
  function worldPerPixel(){ return 2 * camera.position.z * Math.tan(T.MathUtils.degToRad(camera.fov / 2)) / H; }

  /* ---------- perches, in page coordinates ---------- */
  let perches = [];
  const root = document.documentElement;
  function measure(){
    W = innerWidth; H = innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    root.classList.add('measuring');
    const sx = scrollX, sy = scrollY;
    perches = [];
    const lead = document.querySelector('.bird:nth-child(4)');
    if (lead) {
      const r = lead.getBoundingClientRect();
      const [tx, ty] = (lead.style.translate || '0px 0px').split(' ').map(parseFloat);
      perches.push({x: Math.min(r.right - (tx || 0) + sx + 30, W - 50), y: r.top - (ty || 0) + sy + r.height * .7, hover: true});
    }
    document.querySelectorAll('.sec-head .title, .page-head .title').forEach(t => {
      const rg = document.createRange(); rg.selectNodeContents(t);
      const r = rg.getClientRects()[0]; if (!r) return;
      const fs = parseFloat(getComputedStyle(t).fontSize);
      perches.push({x: Math.min(r.right + sx - fs * .35, W - 40), y: r.top + sy + fs * .12});
    });
    const logo = document.querySelector('.foot .logo img');
    if (logo) { const r = logo.getBoundingClientRect(); perches.push({x: Math.min(r.right + sx + 34, W - 40), y: r.top + sy + r.height * .2}); }
    root.classList.remove('measuring');
    perches.sort((a, b) => a.y - b.y);
  }

  /* ---------- flight ---------- */
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const bez = (a, b, c, d, t) => { const u = 1 - t; return a.clone().multiplyScalar(u * u * u).add(b.clone().multiplyScalar(3 * u * u * t)).add(c.clone().multiplyScalar(3 * u * t * t)).add(d.clone().multiplyScalar(t * t * t)); };
  const look = new T.Object3D(), want = new T.Quaternion();
  let flying = false, t0 = performance.now(), last = null;

  function frame(now){
    requestAnimationFrame(frame);
    if (perches.length < 2) { renderer.clear(); return; }
    const time = (now - t0) / 1000, sy = scrollY;
    // the camera drifts a little as you scroll
    camera.rotation.set(Math.cos(sy / 1100) * 0.05, Math.sin(sy / 900) * 0.09, 0);
    camera.updateMatrixWorld();

    const end = Math.max(1, root.scrollHeight - H);
    const Lr = sy + H * (.55 + .42 * Math.pow(clamp(sy / end, 0, 1), 4)); // reading line in page px
    let k = 0;
    while (k < perches.length - 2 && Lr >= perches[k + 1].y) k++;
    const A = perches[k], B = perches[k + 1];
    const u = clamp((Lr - A.y) / Math.max(1, B.y - A.y), 0, 1);
    const e = ease(clamp((u - .28) / .72, 0, 1));
    flying = e > 0.001 && e < 0.999;

    const pA = toWorld(A.x - scrollX, A.y - sy), pB = toWorld(B.x - scrollX, B.y - sy);
    // swoop out of frame toward the camera on alternating sides, then come back in
    const side = k % 2 ? -1 : 1, off = side > 0 ? W * 1.5 : -W * .5;
    const c1 = toWorld(off, A.y - sy + H * .15); c1.z = 4.2;
    const c2 = toWorld(off, B.y - sy - H * .25); c2.z = 4.2;
    const pos = bez(pA, c1, c2, pB, e);
    const ahead = bez(pA, c1, c2, pB, Math.min(1, e + .02));

    const s = (innerWidth < 820 ? 70 : 120) * worldPerPixel() / 3.2; // bird length in px -> world
    bird.scale.setScalar(s);
    // feet on the perch: lift by the belly depth
    bird.position.copy(pos).add(new T.Vector3(0, 0.05 * s, 0));

    // face the way it flies; when perched, look along the title toward the viewer
    look.position.copy(bird.position);
    if (flying) look.lookAt(ahead.add(new T.Vector3(0, 0.05 * s, 0)));
    else look.lookAt(bird.position.clone().add(new T.Vector3(0.8, 0.05, 0.9))); // perched: three-quarter view
    if (flying && last) look.rotateZ(clamp((pos.x - last.x) * -2.5 / s, -0.7, 0.7)); // bank into the turn
    want.copy(look.quaternion);
    bird.quaternion.slerp(want, flying ? 0.18 : 0.08);
    last = pos;

    // wings: fast beats in flight and while hovering at the start, folded up when perched
    const hover = !flying && e < .5 && A.hover;
    const beat = flying || hover;
    const a = beat ? Math.sin(time * (hover ? 34 : 22)) * 0.85 : 0.55 + Math.sin(time * 2) * 0.04; // resting: wings half raised
    L.hinge.rotation.x = -a; R.hinge.rotation.x = a;
    L.elbow.rotation.x = -(beat ? a * .6 : -0.35); R.elbow.rotation.x = beat ? a * .6 : -0.35; // tips droop at rest
    if (hover) bird.position.y += Math.sin(time * 3) * 0.08 * s;

    paint(clamp(0.15 + 0.85 * (k + e) / (perches.length - 1), 0, 1));
    renderer.render(scene, camera);
  }

  addEventListener('resize', measure);
  addEventListener('load', measure);
  if (document.fonts) document.fonts.ready.then(measure);
  new ResizeObserver(() => measure()).observe(document.body);
  measure();
  requestAnimationFrame(frame);
})();
