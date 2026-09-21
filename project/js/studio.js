/**
 * studio.js
 * A flowering-plant diagram the visitor can turn, label, pull apart,
 * and trace. Geometry is built here so the page stays offline.
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

function paintedTexture(w, h, draw) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext("2d");
  draw(g, w, h);
  const img = g.getImageData(0, 0, w, h);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 16;
    img.data[i] = Math.max(0, Math.min(255, img.data[i] + n));
    img.data[i + 1] = Math.max(0, Math.min(255, img.data[i + 1] + n));
    img.data[i + 2] = Math.max(0, Math.min(255, img.data[i + 2] + n));
  }
  g.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function organic(color, map, extra = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    map,
    roughness: 0.48,
    metalness: 0,
    clearcoat: 0.18,
    clearcoatRoughness: 0.55,
    sheen: 0.35,
    sheenColor: new THREE.Color(color),
    ...extra
  });
}

function curlGeometry(geo, bend) {
  const pos = geo.attributes.position;
  geo.computeBoundingBox();
  const minY = geo.boundingBox.min.y;
  geo.translate(0, -minY, 0);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const along = y * y * bend;
    const cup = x * x * 0.55;
    pos.setZ(i, z - along + cup);
  }
  geo.computeVertexNormals();
  return geo;
}

function leafBladeGeometry(length, width) {
  const rows = 14;
  const cols = 10;
  const positions = [];
  const uvs = [];
  const indices = [];
  for (let y = 0; y <= rows; y++) {
    const t = y / rows;
    const bell = Math.sin(Math.PI * Math.pow(t, 0.7));
    const halfW = width * 0.5 * bell;
    for (let x = 0; x <= cols; x++) {
      const u = x / cols;
      const side = u * 2 - 1;
      const px = t * length;
      const py = side * halfW;
      const pz = -side * side * halfW * 0.12;
      positions.push(px, py, pz);
      uvs.push(u, t);
    }
  }
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const a = y * (cols + 1) + x;
      const b = a + 1;
      const c = a + cols + 1;
      const d = c + 1;
      indices.push(a, b, d, a, d, c);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  const normal = geo.attributes.normal;
  let up = 0;
  for (let i = 0; i < normal.count; i++) up += normal.getZ(i);
  if (up < 0) {
    for (let i = 0; i < indices.length; i += 3) {
      const tmp = indices[i + 1];
      indices[i + 1] = indices[i + 2];
      indices[i + 2] = tmp;
    }
    geo.setIndex(indices);
    geo.computeVertexNormals();
  }
  return geo;
}

function bladeGeometry(length, width, depth, bend) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(width * 0.55, length * 0.18, width * 0.95, length * 0.62, width * 0.08, length);
  s.bezierCurveTo(0, length * 1.04, 0, length * 1.04, -width * 0.08, length);
  s.bezierCurveTo(-width * 0.95, length * 0.62, -width * 0.55, length * 0.18, 0, 0);
  const geo = new THREE.ExtrudeGeometry(s, {
    depth,
    bevelEnabled: true,
    bevelThickness: depth * 0.45,
    bevelSize: width * 0.04,
    bevelSegments: 2,
    curveSegments: 14
  });
  return curlGeometry(geo, bend);
}

function initStudio(canvas, specimen, hooks) {
  const onPick = typeof hooks === "function" ? hooks : hooks.onPick;
  const onHover = typeof hooks === "function" ? () => {} : (hooks.onHover || (() => {}));
  const onTrace = typeof hooks === "function" ? () => {} : (hooks.onTrace || (() => {}));
  const parent = canvas.parentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!webglAvailable()) {
    parent.classList.add("is-fallback");
    return { markFound() {}, flash() {}, toggleExplode() {}, traceWater() {}, resetView() {}, setPaused() {}, setActive() {} };
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 40);
  camera.position.set(0.45, 1.2, 4.85);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.add(new THREE.HemisphereLight(0xfff0d8, 0x1a2030, 1));
  const warm = new THREE.Mesh(new THREE.SphereGeometry(4, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffd7a0 }));
  warm.position.set(6, 5, 4);
  envScene.add(warm);
  scene.environment = pmrem.fromScene(envScene, 0.06).texture;
  envScene.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) o.material.dispose();
  });
  pmrem.dispose();

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.domElement.className = "studio-labels";
  labelRenderer.domElement.style.position = "absolute";
  labelRenderer.domElement.style.inset = "0";
  labelRenderer.domElement.style.pointerEvents = "none";
  parent.appendChild(labelRenderer.domElement);

  scene.add(new THREE.HemisphereLight(0xf4ecdf, 0x141820, 0.55));
  const key = new THREE.SpotLight(0xfff1dc, 26, 18, 0.46, 0.4, 1.1);
  key.position.set(2.2, 4.8, 3.6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);
  const keyTarget = new THREE.Object3D();
  keyTarget.position.set(0, 1.05, 0);
  scene.add(keyTarget);
  key.target = keyTarget;
  const fill = new THREE.DirectionalLight(0x9eb4d4, 0.7);
  fill.position.set(-3.5, 2.2, -1.5);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffe2c4, 0.45);
  rim.position.set(-1.2, 3.4, -3.2);
  scene.add(rim);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 3.1;
  controls.maxDistance = 7.2;
  controls.target.set(0, 0.92, 0);
  controls.maxPolarAngle = Math.PI * 0.72;
  const homeTarget = controls.target.clone();
  const homeCamera = camera.position.clone();

  const leafMap = paintedTexture(256, 512, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, "#4caf63");
    grd.addColorStop(0.45, "#6fbf72");
    grd.addColorStop(1, "#3d8f4a");
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(20, 60, 28, 0.55)";
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(w / 2, h * 0.04);
    g.lineTo(w / 2, h * 0.96);
    g.stroke();
    g.lineWidth = 2;
    for (let i = 1; i <= 7; i++) {
      const y = h * (0.15 + i * 0.09);
      g.beginPath();
      g.moveTo(w / 2, y);
      g.quadraticCurveTo(w * 0.72, y - 18, w * 0.9, y - 36);
      g.moveTo(w / 2, y);
      g.quadraticCurveTo(w * 0.28, y - 18, w * 0.1, y - 36);
      g.stroke();
    }
  });

  const petalMap = paintedTexture(256, 512, (g, w, h) => {
    const grd = g.createLinearGradient(w / 2, 0, w / 2, h);
    grd.addColorStop(0, "#fff6f4");
    grd.addColorStop(0.35, "#f3a3b4");
    grd.addColorStop(1, "#c4536e");
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(160, 60, 80, 0.28)";
    g.lineWidth = 2;
    for (let i = -3; i <= 3; i++) {
      g.beginPath();
      g.moveTo(w / 2 + i * 10, h);
      g.quadraticCurveTo(w / 2 + i * 18, h * 0.4, w / 2 + i * 6, 8);
      g.stroke();
    }
  });

  const soilMap = paintedTexture(256, 256, (g, w, h) => {
    g.fillStyle = "#3a2a1c";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 80; i++) {
      g.fillStyle = `rgba(90, 60, 36, ${0.25 + Math.random() * 0.4})`;
      g.beginPath();
      g.ellipse(Math.random() * w, Math.random() * h, 6 + Math.random() * 16, 4 + Math.random() * 8, Math.random(), 0, Math.PI * 2);
      g.fill();
    }
  });

  const clayMap = paintedTexture(256, 256, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, "#a24b38");
    grd.addColorStop(1, "#6e2e24");
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
  });

  const leafMat = organic(0xffffff, leafMap, {
    roughness: 0.46,
    sheen: 0.4,
    sheenColor: new THREE.Color("#c5e2a8"),
    side: THREE.DoubleSide
  });
  const petalMat = organic(0xffffff, petalMap, { roughness: 0.32, clearcoat: 0.35, sheen: 0.8, sheenColor: new THREE.Color("#ffe4ea") });
  const sepalMat = organic(0x3c6a40, null, { color: 0x3c6a40, roughness: 0.6 });
  const stemMat = organic(0x3f7a45, null, { color: 0x3f7a45, roughness: 0.55, sheen: 0.2 });
  const rootMat = organic(0x8d6840, null, { color: 0x8d6840, roughness: 0.78 });
  const soilMat = organic(0xffffff, soilMap, { color: 0xffffff, roughness: 0.95, sheen: 0 });
  const clayMat = organic(0xffffff, clayMap, { color: 0xffffff, roughness: 0.62, clearcoat: 0.08 });

  const plant = new THREE.Group();
  scene.add(plant);
  const pickables = [];
  const labels = new Map();
  const movers = [];
  const swayers = [];

  function track(obj, apart) {
    obj.userData.home = obj.position.clone();
    obj.userData.apart = obj.position.clone().add(apart);
    movers.push(obj);
  }

  function addLabel(obj, text, offset) {
    const el = document.createElement("div");
    el.className = "studio-label";
    el.textContent = text;
    const lab = new CSS2DObject(el);
    lab.position.copy(offset);
    obj.add(lab);
    labels.set(obj.userData.partId, el);
  }

  function partName(id, fallback) {
    return specimen.parts.find((p) => p.id === id)?.label || fallback;
  }

  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 1.05, 0.1, 48),
    new THREE.MeshPhysicalMaterial({ color: 0x141311, roughness: 0.28, metalness: 0.42, clearcoat: 0.7 })
  );
  plinth.position.y = -0.72;
  plinth.receiveShadow = true;
  plant.add(plinth);

  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.72, 0.56, 0.5, 40, 1, true),
    clayMat
  );
  pot.position.y = -0.18;
  pot.castShadow = true;
  plant.add(pot);
  const potRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.72, 0.035, 10, 40),
    new THREE.MeshPhysicalMaterial({ color: 0xc4a36a, metalness: 0.85, roughness: 0.28 })
  );
  potRim.rotation.x = Math.PI / 2;
  potRim.position.y = 0.1;
  plant.add(potRim);

  const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.68, 0.08, 32), soilMat);
  soil.position.y = 0.04;
  soil.receiveShadow = true;
  plant.add(soil);

  const roots = new THREE.Group();
  roots.userData.partId = "roots";
  const rootLines = [
    [[0, 0.06, 0], [-0.12, -0.02, 0.18], [-0.28, 0.02, 0.48]],
    [[0, 0.05, 0], [0.16, -0.04, 0.16], [0.34, -0.02, 0.46]],
    [[0, 0.04, 0], [0.02, -0.16, 0.08], [0.08, -0.32, 0.22]],
    [[0, 0.04, 0], [-0.14, -0.14, 0.05], [-0.26, -0.28, 0.16]],
    [[0, 0.03, 0], [0.12, -0.18, 0.02], [0.2, -0.34, 0.1]],
    [[0, 0.05, 0], [-0.02, -0.08, 0.22], [0.05, 0.06, 0.52]]
  ];
  rootLines.forEach((pts, i) => {
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 18, 0.028 - i * 0.002, 6, false), rootMat);
    mesh.castShadow = true;
    roots.add(mesh);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), rootMat);
    tip.position.copy(curve.getPoint(1));
    roots.add(tip);
  });
  plant.add(roots);
  pickables.push(roots);
  addLabel(roots, partName("roots", "Roots"), new THREE.Vector3(0.72, -0.15, 0.2));
  track(roots, new THREE.Vector3(0, -0.22, 0.12));

  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.08, 0),
    new THREE.Vector3(0.05, 0.62, 0.03),
    new THREE.Vector3(-0.04, 1.25, -0.02),
    new THREE.Vector3(0.02, 1.92, 0.01)
  ]);
  const stem = new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 28, 0.045, 10, false), stemMat);
  stem.userData.partId = "stem";
  stem.castShadow = true;
  plant.add(stem);
  pickables.push(stem);
  addLabel(stem, partName("stem", "Stem"), new THREE.Vector3(-0.72, 0.85, 0));

  function makeLeaf(height, yaw, scale) {
    const group = new THREE.Group();
    group.position.y = height;
    group.rotation.y = yaw;
    group.userData.partId = "leaf";
    const petiole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.16, 6), stemMat);
    petiole.rotation.z = Math.PI / 2;
    petiole.position.set(0.08, 0, 0);
    group.add(petiole);
    const blade = new THREE.Mesh(leafBladeGeometry(0.82, 0.48), leafMat);
    blade.scale.setScalar(scale);
    blade.position.set(0.12, 0.02, 0);
    blade.rotation.z = -0.22;
    blade.castShadow = true;
    blade.receiveShadow = true;
    blade.userData.baseZ = -0.22;
    blade.userData.phase = yaw;
    group.add(blade);
    swayers.push(blade);
    return group;
  }

  const leafA = makeLeaf(0.58, 0.55, 1.05);
  const leafB = makeLeaf(0.98, Math.PI - 0.35, 0.96);
  const leafC = makeLeaf(1.38, 0.2, 0.82);
  plant.add(leafA, leafB, leafC);
  pickables.push(leafA, leafB, leafC);
  addLabel(leafB, partName("leaf", "Leaf"), new THREE.Vector3(0.95, 0.12, 0));
  track(leafA, new THREE.Vector3(-0.32, 0.02, 0.08));
  track(leafB, new THREE.Vector3(0.34, 0.04, 0));
  track(leafC, new THREE.Vector3(-0.18, 0.1, -0.08));

  const flower = new THREE.Group();
  flower.position.y = 1.98;
  flower.userData.partId = "flower";
  for (let i = 0; i < 5; i++) {
    const pivot = new THREE.Group();
    pivot.rotation.y = (i / 5) * Math.PI * 2;
    const sepal = new THREE.Mesh(bladeGeometry(0.28, 0.1, 0.01, 0.35), sepalMat);
    sepal.rotation.x = 1.15;
    sepal.position.z = 0.02;
    pivot.add(sepal);
    flower.add(pivot);
  }
  function addWhorl(count, tilt, scale, spin) {
    for (let i = 0; i < count; i++) {
      const pivot = new THREE.Group();
      pivot.rotation.y = spin + (i / count) * Math.PI * 2;
      const petal = new THREE.Mesh(bladeGeometry(0.5, 0.26, 0.006, 0.16), petalMat);
      petal.scale.setScalar(scale);
      petal.rotation.x = tilt;
      petal.position.z = 0.02;
      petal.castShadow = true;
      pivot.add(petal);
      flower.add(pivot);
    }
  }
  addWhorl(5, 0.95, 1.15, 0.15);
  addWhorl(5, 0.52, 0.86, 0.15 + Math.PI / 5);
  const disc = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 18, 14),
    new THREE.MeshPhysicalMaterial({ color: 0xe2b15a, roughness: 0.45, sheen: 0.4, sheenColor: new THREE.Color("#fff1c4") })
  );
  flower.add(disc);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const stamen = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.008, 0.16, 5), stemMat);
    stamen.position.set(Math.cos(a) * 0.05, 0.1, Math.sin(a) * 0.05);
    stamen.rotation.z = Math.cos(a) * 0.35;
    stamen.rotation.x = Math.sin(a) * 0.35;
    const anther = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), new THREE.MeshPhysicalMaterial({ color: 0xf0c84a, roughness: 0.35 }));
    anther.position.y = 0.08;
    stamen.add(anther);
    flower.add(stamen);
  }
  plant.add(flower);
  pickables.push(flower);
  addLabel(flower, partName("flower", "Flower"), new THREE.Vector3(0.62, 0.28, 0));
  track(flower, new THREE.Vector3(0, 0.22, 0));
  plant.scale.setScalar(0.92);
  plant.position.y = -0.18;

  const drop = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 16, 16),
    new THREE.MeshPhysicalMaterial({
      color: 0xd7ecff, roughness: 0.05, transmission: 0.9, thickness: 0.2, ior: 1.33, transparent: true
    })
  );
  drop.visible = false;
  scene.add(drop);
  const waterPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.2, -0.35, 0.35),
    new THREE.Vector3(0, 0.15, 0.08),
    new THREE.Vector3(0.04, 0.85, 0.04),
    new THREE.Vector3(-0.02, 1.45, 0),
    new THREE.Vector3(0.35, 1.35, 0.15)
  ]);

  plant.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  function setEmissive(obj, intensity) {
    obj.traverse((n) => {
      if (!n.isMesh || !n.material || !("emissiveIntensity" in n.material)) return;
      if (!n.userData.ownMat) {
        n.material = n.material.clone();
        n.userData.ownMat = true;
      }
      n.material.emissive.setHex(0xfff4e0);
      n.material.emissiveIntensity = intensity;
    });
  }

  let selectedId = null;
  let hoverId = null;
  const found = new Set();
  let explode = 0;
  let explodeTarget = 0;
  let traceT = -1;
  let lastTracePart = "";
  const aim = homeTarget.clone();

  function applySelection() {
    pickables.forEach((obj) => {
      const id = obj.userData.partId;
      let intensity = 0;
      if (found.has(id)) intensity = 0.08;
      if (id === hoverId) intensity = 0.16;
      if (id === selectedId) intensity = 0.28;
      setEmissive(obj, intensity);
    });
    labels.forEach((el, id) => {
      el.classList.toggle("is-on", id === selectedId || id === hoverId || found.has(id));
      el.classList.toggle("is-found", found.has(id));
    });
  }

  function focus(id) {
    const obj = pickables.find((p) => p.userData.partId === id);
    if (!obj) return;
    const box = new THREE.Box3().setFromObject(obj);
    const center = new THREE.Vector3();
    box.getCenter(center);
    aim.lerpVectors(homeTarget, center, 0.28);
  }

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let downPos = null;

  function pick(evt) {
    const rect = renderer.domElement.getBoundingClientRect();
    ndc.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(pickables, true);
    if (!hits.length) return null;
    let obj = hits[0].object;
    while (obj && !obj.userData.partId) obj = obj.parent;
    return obj ? obj.userData.partId : null;
  }

  renderer.domElement.addEventListener("pointerdown", (e) => {
    downPos = { x: e.clientX, y: e.clientY };
  });
  renderer.domElement.addEventListener("pointerup", (e) => {
    if (!downPos) return;
    const moved = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
    downPos = null;
    if (moved > 8) return;
    const id = pick(e);
    if (id) {
      selectedId = id;
      focus(id);
      applySelection();
      if (typeof onPick === "function") onPick(id);
      document.dispatchEvent(new CustomEvent("film:clack"));
    }
  });
  renderer.domElement.addEventListener("pointermove", (e) => {
    const id = pick(e);
    renderer.domElement.style.cursor = id ? "pointer" : "grab";
    if (id !== hoverId) {
      hoverId = id;
      applySelection();
      onHover(id);
    }
  });
  renderer.domElement.addEventListener("pointerleave", () => {
    hoverId = null;
    applySelection();
    onHover(null);
  });

  function resize() {
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    labelRenderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(parent);
  resize();

  const clock = new THREE.Clock();
  let paused = false;
  let active = true;
  let elapsed = 0;
  renderer.setAnimationLoop(() => {
    if (!active) {
      clock.getDelta();
      return;
    }
    const dt = paused ? 0 : clock.getDelta();
    elapsed += dt;
    explode += (explodeTarget - explode) * Math.min(1, dt * 3.2);
    movers.forEach((obj) => {
      obj.position.lerpVectors(obj.userData.home, obj.userData.apart, explode);
    });
    swayers.forEach((blade) => {
      const sway = reduceMotion ? 0 : Math.sin(elapsed * 1.15 + blade.userData.phase) * 0.03;
      blade.rotation.z = blade.userData.baseZ + sway;
    });
    if (!reduceMotion && !paused) plant.rotation.y = Math.sin(elapsed * 0.18) * 0.18;
    if (traceT >= 0) {
      traceT += dt * 0.32;
      const t = Math.min(traceT, 1);
      drop.visible = traceT <= 1.05;
      drop.position.copy(waterPath.getPoint(t));
      const part = t < 0.28 ? "roots" : t < 0.72 ? "stem" : "leaf";
      if (part !== lastTracePart) {
        lastTracePart = part;
        selectedId = part;
        applySelection();
        onTrace(part);
      }
      if (traceT > 1.15) {
        traceT = -1;
        drop.visible = false;
        lastTracePart = "";
      }
    }
    controls.target.lerp(aim, 0.08);
    if (!paused) controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  });

  return {
    markFound(id) {
      found.add(id);
      selectedId = id;
      focus(id);
      applySelection();
    },
    flash(id) {
      selectedId = id;
      const el = labels.get(id);
      if (el) {
        el.classList.add("is-wrong");
        window.setTimeout(() => el.classList.remove("is-wrong"), 700);
      }
      applySelection();
    },
    toggleExplode() {
      explodeTarget = explodeTarget > 0.5 ? 0 : 1;
      aim.copy(homeTarget);
      return explodeTarget > 0.5;
    },
    traceWater() {
      traceT = 0;
      lastTracePart = "";
      drop.visible = true;
    },
    resetView() {
      explodeTarget = 0;
      traceT = -1;
      drop.visible = false;
      aim.copy(homeTarget);
      camera.position.copy(homeCamera);
      controls.target.copy(homeTarget);
    },
    setPaused(v) { paused = Boolean(v); },
    setActive(v) { active = Boolean(v); }
  };
}

export { initStudio };
