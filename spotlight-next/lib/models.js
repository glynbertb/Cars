import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";


const mat = (c, m = 0.85, r = 0.22) => new THREE.MeshStandardMaterial({ color: c, metalness: m, roughness: r });
const V = (a) => new THREE.Vector3(...a);

function tube(a, b, r, m) {
  const A = V(a), B = V(b), d = B.clone().sub(A);
  const g = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 14), m);
  g.position.copy(A.clone().add(B).multiplyScalar(0.5));
  g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  return g;
}

function wheel(r, w, spokes) {
  const g = new THREE.Group();
  const side = (m) => { m.rotation.x = Math.PI / 2; return m; };
  g.add(side(new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 36), mat("#111", 0.1, 0.8))));
  g.add(side(new THREE.Mesh(new THREE.CylinderGeometry(r * 0.64, r * 0.64, w + 0.02, 32), mat("#c8cdd6", 1, 0.2))));
  g.add(side(new THREE.Mesh(new THREE.CylinderGeometry(r * 0.3, r * 0.3, w + 0.04, 16), mat("#2a2d33", 0.8, 0.4))));
  if (spokes) for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(r * 0.1, r * 0.62, w + 0.05), mat("#2a2d33", 0.8, 0.4));
    s.position.y = r * 0.3; const p = new THREE.Group(); p.add(s); p.rotation.z = (i / 5) * Math.PI * 2; g.add(p);
  }
  return g;
}

function car(it) {
  const g = new THREE.Group(), body = mat(it.color, 0.9, 0.18), R = 1.0 + 0.5 * it.h, wr = it.r || 0.38;
  const s = new THREE.Shape();
  s.moveTo(-2.2, 0.3); s.lineTo(-2.2, 0.85); s.quadraticCurveTo(-2.1, 1.0, -1.5, 1.05); s.lineTo(-1.1, 1.05);
  s.bezierCurveTo(-0.7, R, -0.4, R, 0, R); s.bezierCurveTo(0.4, R, 0.7, R - 0.2, 1.1, 1.0);
  s.lineTo(2.0, 0.85); s.quadraticCurveTo(2.2, 0.8, 2.2, 0.55); s.lineTo(2.2, 0.3); s.lineTo(-2.2, 0.3);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 1.6, bevelEnabled: true, bevelSize: 0.1, bevelThickness: 0.1, bevelSegments: 5, curveSegments: 28 });
  geo.translate(0, wr > 0.4 ? 0.1 : 0, -0.8); g.add(new THREE.Mesh(geo, body));
  const w = new THREE.Shape(); w.moveTo(-0.95, 1.08);
  w.bezierCurveTo(-0.65, R - 0.07, -0.4, R - 0.07, 0, R - 0.07); w.bezierCurveTo(0.35, R - 0.07, 0.6, R - 0.25, 0.95, 1.05); w.lineTo(-0.95, 1.08);
  const wg = new THREE.ExtrudeGeometry(w, { depth: 1.84, bevelEnabled: false }); wg.translate(0, wr > 0.4 ? 0.1 : 0, -0.92);
  g.add(new THREE.Mesh(wg, mat("#0b0f18", 1, 0.05)));
  for (const x of [-1.4, 1.4]) for (const z of [-0.85, 0.85]) { const k = wheel(wr, 0.32, true); k.position.set(x, wr, z); g.add(k); }
  const lamp = (c, x, y) => [-1, 1].forEach((z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.4), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.4 })); m.position.set(x, y, z * 0.55); g.add(m); });
  lamp("#ffffff", 2.3, 0.72); lamp("#ff2a2a", -2.3, 0.8);
  return g;
}

function bike(it) {
  const g = new THREE.Group(), body = mat(it.color, 0.9, 0.2), dark = mat("#20232a", 0.8, 0.35), chrome = mat("#cfd5de", 1, 0.15);
  for (const x of [-1.05, 1.05]) { const k = wheel(0.46, 0.16, false); k.position.set(x, 0.46, 0); g.add(k); }
  const tank = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 24), body); tank.scale.set(1.1, 0.55, 0.62); tank.position.set(0.25, 1.15, 0); g.add(tank);
  const tail = new THREE.Mesh(new THREE.SphereGeometry(0.4, 24, 16), body); tail.scale.set(1.5, 0.4, 0.45); tail.position.set(-0.7, 1.0, 0); g.add(tail);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.12, 0.34), mat("#15171c", 0.1, 0.8)); seat.position.set(-0.35, 0.98, 0); g.add(seat);
  const eng = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.42), dark); eng.position.set(0.1, 0.6, 0); g.add(eng);
  [-0.25, 0.25].forEach((x) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.4, 16), chrome); c.position.set(0.1 + x, 0.95, 0); c.rotation.z = 0.5; g.add(c); });
  for (const z of [-0.12, 0.12]) { g.add(tube([1.05, 0.46, z], [0.7, 1.3, z], 0.04, chrome)); g.add(tube([-1.05, 0.46, z], [-0.1, 0.6, z], 0.04, dark)); }
  g.add(tube([0.7, 1.3, -0.4], [0.7, 1.3, 0.4], 0.03, dark));
  g.add(tube([0.2, 0.9, 0], [0.7, 1.25, 0], 0.07, dark));
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 16), new THREE.MeshStandardMaterial({ color: "#fff", emissive: "#fff", emissiveIntensity: 1.2 })); lamp.position.set(0.95, 1.12, 0); g.add(lamp);
  g.add(tube([0.0, 0.42, 0.24], [-1.15, 0.62, 0.26], 0.07, chrome));
  g.add(tube([-1.15, 0.62, 0.26], [-1.4, 0.7, 0.26], 0.09, dark));
  return g;
}

export function buildModel(it) {
  const m = it.kind === "car" ? car(it) : bike(it);
  m.traverse((o) => { if (o.isMesh) { o.castShadow = false; } });
  return m;
}

export function gradTex(tint) {
  const c = document.createElement("canvas"); c.width = 4; c.height = 256;
  const x = c.getContext("2d"), g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "#e9eff8"); g.addColorStop(0.55, tint); g.addColorStop(1, "#6f88ab");
  x.fillStyle = g; x.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function shadowMesh() {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const x = c.getContext("2d"), g = x.createRadialGradient(64, 64, 4, 64, 64, 64);
  g.addColorStop(0, "rgba(0,0,0,.55)"); g.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 3.4), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.01; return m;
}

export function makeScene(renderer) {
  const scene = new THREE.Scene(), pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
  const key = new THREE.DirectionalLight("#fff", 1.2); key.position.set(4, 6, 3); scene.add(key);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
  return scene;
}

export const camFor = (it) => (it.kind === "car" ? [7, 2.8, 9] : [4.6, 1.9, 5.8]);

export function renderThumb(it) {
  const W = 420, H = 560;
  const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.setSize(W, H);
  const sc = makeScene(r); sc.background = gradTex(it.tint);
  const m = buildModel(it); m.rotation.y = 0.35; sc.add(m, shadowMesh());
  const cam = new THREE.PerspectiveCamera(32, W / H, 0.1, 100);
  cam.position.set(...camFor(it)); cam.lookAt(0, 0.8, 0);
  r.render(sc, cam);
  const url = r.domElement.toDataURL("image/jpeg", 0.9);
  r.dispose(); r.forceContextLoss();
  return url;
}

export const ITEMS = [
  { id: "01", name: "Dodge Challenger", kind: "car", h: 0.75, year: 2023, cat: "Muscle car", score: 9.4,
    color: "#d62828", tint: "#a7c0dd", img: "/images/dodge.jpg", model: "/models/dodge.glb"},
  { id: "02", name: "BMW M 1000 RR", kind: "bike", year: 2025, cat: "Superbike", score: 9.2,
    color: "#1f5eff", tint: "#9bb7d8", img: "/images/BMW.jpg" },
   { id: "03", name: "Bugatti Tourbillon", kind: "car", h: 0.75, year: 2026, cat: "Hypercar", score: 9.6,
    color: "#d62828", tint: "#a7c0dd", img: "/images/bugatti.jpg" },
  { id: "04", name: "Ducati Panigale V4 R", kind: "bike", year: 2025, cat: "Superbike", score: 9.4,
    color: "#1f5eff", tint: "#9bb7d8", img: "/images/ducati.jpg" },
    { id: "05", name: "Aprilia RSV4 Factory", kind: "bike", year: 2025, cat: "Superbike", score: 9.3,
    color: "#1f5eff", tint: "#9bb7d8", img: "/images/aprilia.jpg" },
  { id: "06", name: "Yamaha YZF-R1M", kind: "bike", year: 2025, cat: "Superbike", score: 9.2,
    color: "#1f5eff", tint: "#9bb7d8", img: "/images/yamaha.jpg" , model: "/models/yamaha.glb"}, 
     { id: "07", name: "Porsche 911 GT3 RS (992)", kind: "car", h: 0.75, year: 2025, cat: "Track car", score: 9.5,
    color: "#d62828", tint: "#a7c0dd", img: "/images/porche.jpg" , model: "/models/porche.glb"},
  // ...same for the rest
];
