/**
 * chamber.js — sealed teaching lab with real 3D specimens.
 * Click a part, explode / assemble, drag to turn. Models stay in the tube.
 */
import * as THREE from "three";

const TUBE_R = 3.35;
const Y_MIN = -2.15;
const Y_MAX = 2.45;

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

function phys(color, extra = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.38,
    metalness: 0.12,
    clearcoat: 0.45,
    clearcoatRoughness: 0.32,
    ...extra
  });
}

function mark(obj, partId) {
  obj.userData.partId = partId;
  obj.traverse((o) => { o.userData.partId = partId; });
  return obj;
}

function pin(parent, x, y, z) {
  const o = new THREE.Object3D();
  o.position.set(x, y, z);
  parent.add(o);
  return o;
}

function makeEnv(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.add(new THREE.HemisphereLight(0xf4f0ea, 0xb8c2cc, 1.15));
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(3.2, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0xfff1dc })
  );
  bulb.position.set(6, 8, 4);
  envScene.add(bulb);
  const env = pmrem.fromScene(envScene, 0.06).texture;
  envScene.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) o.material.dispose();
  });
  pmrem.dispose();
  return env;
}

function buildAtom() {
  const root = new THREE.Group();
  const parts = [];

  const nucleus = new THREE.Group();
  mark(nucleus, "nucleus");
  const pMat = phys(0xe07068, { metalness: 0.35, roughness: 0.22, emissive: 0xc04540, emissiveIntensity: 0.35 });
  const nMat = phys(0x6a8ad8, { metalness: 0.35, roughness: 0.22, emissive: 0x3a58b0, emissiveIntensity: 0.28 });
  for (let i = 0; i < 8; i++) {
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), i % 2 ? nMat : pMat);
    const a = (i / 8) * Math.PI * 2;
    ball.position.set(Math.cos(a) * 0.12, (i % 3 - 1) * 0.08, Math.sin(a) * 0.12);
    nucleus.add(ball);
  }
  root.add(nucleus);
  parts.push({ id: "nucleus", object: nucleus, labelAnchor: pin(nucleus, 0.42, 0.22, 0.1), dir: new THREE.Vector3(0, 0, 0.2) });

  const inner = new THREE.Group();
  mark(inner, "inner");
  inner.add(new THREE.Mesh(
    new THREE.TorusGeometry(0.62, 0.012, 10, 64),
    phys(0x9ad4ea, { metalness: 0.7, roughness: 0.18, emissive: 0x4aa0c8, emissiveIntensity: 0.4, transparent: true, opacity: 0.85 })
  ));
  const e1 = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 14), phys(0xb8e8ff, { emissive: 0x7ec8e8, emissiveIntensity: 0.8, roughness: 0.12 }));
  e1.position.set(0.62, 0, 0);
  inner.add(e1);
  const e2 = e1.clone();
  e2.position.set(-0.62, 0, 0);
  inner.add(e2);
  inner.rotation.x = 0.4;
  root.add(inner);
  parts.push({ id: "inner", object: inner, labelAnchor: pin(inner, -0.62, 0.22, 0), dir: new THREE.Vector3(0.7, 0.2, 0) });

  const outer = new THREE.Group();
  mark(outer, "outer");
  [[1.12, 0.55, 0.2], [1.12, -0.35, 1.1], [1.38, 0.15, -0.7]].forEach(([r, tilt, yaw], i) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.01, 8, 72),
      phys(0x7ec8e8, { metalness: 0.65, roughness: 0.2, emissive: 0x3a88b0, emissiveIntensity: 0.32, transparent: true, opacity: 0.7 })
    );
    ring.rotation.set(tilt, yaw, i * 0.3);
    outer.add(ring);
    const elc = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), phys(0xd4f4ff, { emissive: 0x9ad8f0, emissiveIntensity: 0.85, roughness: 0.1 }));
    elc.position.set(r, 0, 0);
    const hold = new THREE.Group();
    hold.rotation.copy(ring.rotation);
    hold.add(elc);
    hold.userData.spin = 0.55 + i * 0.35;
    outer.add(hold);
  });
  root.add(outer);
  parts.push({ id: "outer", object: outer, labelAnchor: pin(outer, 0.15, 1.42, 0.2), dir: new THREE.Vector3(-0.55, 0.45, 0.4) });

  root.userData.orbit = true;
  return { root, parts };
}

function buildDNA() {
  const root = new THREE.Group();
  const parts = [];
  const backbone = new THREE.Group();
  mark(backbone, "backbone");
  const bases = new THREE.Group();
  mark(bases, "bases");

  const ptsA = [];
  const ptsB = [];
  const turns = 3.2;
  const steps = 80;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = THREE.MathUtils.lerp(-1.35, 1.35, t);
    const a = t * Math.PI * 2 * turns;
    const r = 0.42;
    ptsA.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
    ptsB.push(new THREE.Vector3(Math.cos(a + Math.PI) * r, y, Math.sin(a + Math.PI) * r));
  }
  const curveA = new THREE.CatmullRomCurve3(ptsA);
  const curveB = new THREE.CatmullRomCurve3(ptsB);
  const tubeA = new THREE.Mesh(
    new THREE.TubeGeometry(curveA, 120, 0.055, 8, false),
    phys(0x4f8fd4, { metalness: 0.45, roughness: 0.22, clearcoat: 0.7, emissive: 0x1a4a88, emissiveIntensity: 0.12 })
  );
  const tubeB = new THREE.Mesh(
    new THREE.TubeGeometry(curveB, 120, 0.055, 8, false),
    phys(0xd45c58, { metalness: 0.45, roughness: 0.22, clearcoat: 0.7, emissive: 0x7a2824, emissiveIntensity: 0.12 })
  );
  backbone.add(tubeA, tubeB);
  root.add(backbone);
  parts.push({ id: "backbone", object: backbone, labelAnchor: pin(backbone, 0.78, 1.05, 0), dir: new THREE.Vector3(0.55, 0, 0) });

  const at = phys(0xe8c45a, { roughness: 0.28, metalness: 0.2 });
  const gc = phys(0x5cb88a, { roughness: 0.28, metalness: 0.2 });
  for (let i = 0; i < steps; i += 5) {
    const t = i / steps;
    const a = t * Math.PI * 2 * turns;
    const y = THREE.MathUtils.lerp(-1.35, 1.35, t);
    const r = 0.42;
    const p1 = new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
    const p2 = new THREE.Vector3(Math.cos(a + Math.PI) * r, y, Math.sin(a + Math.PI) * r);
    const mid = p1.clone().add(p2).multiplyScalar(0.5);
    const len = p1.distanceTo(p2);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, len * 0.92), i % 10 === 0 ? at : gc);
    bar.position.copy(mid);
    bar.lookAt(p2);
    bases.add(bar);
  }
  root.add(bases);
  parts.push({ id: "bases", object: bases, labelAnchor: pin(bases, -0.78, 0.15, 0), dir: new THREE.Vector3(-0.55, 0, 0) });
  return { root, parts };
}

function buildEarth(maps) {
  const root = new THREE.Group();
  const parts = [];
  const gap = Math.PI / 2;
  const gapCenter = Math.PI * 0.58;
  const phiStart = gapCenter + gap / 2;
  const phiLength = Math.PI * 2 - gap;
  const cuts = [phiStart, phiStart + phiLength];
  const layers = [
    { id: "inner", r0: 0, r1: 0.4, color: 0xfff4b8, emissive: 0xffe08a, em: 0.7, rough: 0.22, metal: 0.28, y: -0.55 },
    { id: "outer", r0: 0.4, r1: 0.72, color: 0xf6a31a, emissive: 0xe06808, em: 0.38, rough: 0.32, metal: 0.12, y: -0.12 },
    { id: "mantle", r0: 0.72, r1: 1.08, color: 0xd24a28, emissive: 0x8a2814, em: 0.2, rough: 0.58, metal: 0.04, y: 0.32 },
    { id: "crust", r0: 1.08, r1: 1.16, color: 0xc4a574, emissive: 0x6a5030, em: 0.06, rough: 0.8, metal: 0.02, y: 0.72 }
  ];

  function faceMat(color, emissive, em, rough) {
    return phys(color, {
      roughness: rough,
      metalness: 0.04,
      clearcoat: 0.05,
      emissive,
      emissiveIntensity: em,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    });
  }

  layers.forEach((L, i) => {
    const group = new THREE.Group();
    const shellMat = phys(L.color, {
      roughness: L.rough,
      metalness: L.metal,
      clearcoat: L.id === "crust" ? 0.25 : 0.06,
      emissive: L.emissive,
      emissiveIntensity: L.em,
      side: THREE.FrontSide
    });
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(L.r1, 80, 56, phiStart, phiLength),
      shellMat
    );
    group.add(shell);
    const lining = new THREE.Mesh(shell.geometry, phys(L.color, {
      roughness: L.rough,
      emissive: L.emissive,
      emissiveIntensity: L.em * 0.85,
      side: THREE.BackSide
    }));
    group.add(lining);
    cuts.forEach((phi) => {
      const mat = faceMat(L.color, L.emissive, Math.min(0.85, L.em + 0.15), L.rough);
      const face = L.r0 <= 0
        ? new THREE.Mesh(new THREE.CircleGeometry(L.r1, 48), mat)
        : new THREE.Mesh(new THREE.RingGeometry(L.r0, L.r1, 64), mat);
      face.rotation.y = phi;
      group.add(face);
    });
    mark(group, L.id);
    root.add(group);

    const front = cuts[1];
    const c = Math.cos(front);
    const s = Math.sin(front);
    const y = L.id === "crust" ? L.r1 + 0.04 : (L.r0 + L.r1) * 0.5;
    const side = [0, 0.16, -0.14, 0.12][i];
    const anchor = new THREE.Object3D();
    anchor.position.set(side * c, y, -side * s);
    group.add(anchor);
    const out = (i - 1.5) * 0.36;
    parts.push({
      id: L.id,
      object: group,
      labelAnchor: anchor,
      dir: new THREE.Vector3(out * 0.22, out, out * 0.08)
    });
  });

  if (maps?.day) {
    const crust = root.children.find((c) => c.userData.partId === "crust");
    const shell = crust?.children.find((c) => c.geometry?.type === "SphereGeometry" && c.material.side === THREE.FrontSide);
    if (shell) {
      shell.material.map = maps.day;
      shell.material.color.set(0xffffff);
      shell.material.emissive.set(0x111111);
      shell.material.emissiveIntensity = 0.04;
      shell.material.needsUpdate = true;
    }
    const lining = crust?.children.find((c) => c.material?.side === THREE.BackSide);
    if (lining) {
      lining.material.color.set(0xb08968);
      lining.material.emissive.set(0x5c4030);
    }
  }

  root.scale.setScalar(1.2);
  return { root, parts };
}

function buildWater() {
  const root = new THREE.Group();
  const parts = [];
  const ang = (104.5 * Math.PI) / 180 / 2;
  const hr = 0.92;
  const hx = Math.sin(ang) * hr;
  const hy = -Math.cos(ang) * hr;

  const oxygen = mark(new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 32, 24),
    new THREE.MeshPhysicalMaterial({
      color: 0xe24b4b,
      roughness: 0.12,
      metalness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      emissive: 0x7a1818,
      emissiveIntensity: 0.12
    })
  ), "oxygen");
  oxygen.position.y = 0.18;
  root.add(oxygen);
  parts.push({ id: "oxygen", object: oxygen, labelAnchor: pin(oxygen, 0, 0.55, 0), dir: new THREE.Vector3(0, 0.7, 0) });

  const hMat = new THREE.MeshPhysicalMaterial({
    color: 0xf4f7fb,
    roughness: 0.1,
    metalness: 0,
    clearcoat: 0.9,
    transmission: 0.15,
    thickness: 0.3
  });
  const hydrogens = new THREE.Group();
  mark(hydrogens, "hydrogen");
  const h1 = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 18), hMat);
  h1.position.set(-hx, hy + 0.18, 0);
  const h2 = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 18), hMat);
  h2.position.set(hx, hy + 0.18, 0);
  hydrogens.add(h1, h2);
  root.add(hydrogens);
  parts.push({ id: "hydrogen", object: hydrogens, labelAnchor: pin(hydrogens, 0, hy - 0.15, 0), dir: new THREE.Vector3(0, -0.75, 0) });

  const bonds = new THREE.Group();
  mark(bonds, "bond");
  const bMat = phys(0xc5d6e8, { roughness: 0.2, metalness: 0.15, transparent: true, opacity: 0.85 });
  function bond(target) {
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.72, 12), bMat);
    bar.position.copy(oxygen.position).lerp(target.position, 0.5);
    bar.lookAt(target.position);
    bar.rotateX(Math.PI / 2);
    bonds.add(bar);
  }
  bond(h1);
  bond(h2);
  root.add(bonds);
  parts.push({ id: "bond", object: bonds, labelAnchor: pin(bonds, 0.55, 0.05, 0.15), dir: new THREE.Vector3(0.15, 0, 0.7) });
  return { root, parts };
}

const BUILDERS = { atom: buildAtom, dna: buildDNA, earth: buildEarth, water: buildWater };

function initChamber(canvas, spec, onPart) {
  const parent = canvas.parentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const noop = {
    setPaused() {}, setActive() {}, scatter() {}, setModel() {},
    setExplode() {}, selectPart() {}, nextModel() {}, getModelId() { return ""; }
  };
  if (!canvas || !parent || !webglAvailable()) {
    parent?.classList.add("is-fallback");
    return noop;
  }

  const models = spec?.models || [];
  let modelIndex = 0;
  let explodeT = 0;
  let explodeGoal = 0;
  let selected = "";
  let specimen = null;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xc5ced6, 0.012);
  scene.background = new THREE.Color(0xc5ced6);

  const camera = new THREE.PerspectiveCamera(36, 1, 0.08, 40);
  camera.position.set(3.05, 0.55, 6.2);
  camera.lookAt(0, 0.2, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0xc5ced6, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.localClippingEnabled = true;
  if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
  scene.environment = makeEnv(renderer);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xc5ccd4, 1.15));
  const key = new THREE.DirectionalLight(0xffffff, 2.35);
  key.position.set(3.2, 7.2, 5.0);
  scene.add(key);
  scene.add(new THREE.DirectionalLight(0xffffff, 0.95).translateX(-5).translateY(2.2).translateZ(-2.4));

  const tube = new THREE.Mesh(
    new THREE.CylinderGeometry(TUBE_R, TUBE_R, Y_MAX - Y_MIN, 64, 1, true),
    new THREE.MeshPhysicalMaterial({
      color: 0xe8eef4, transparent: true, opacity: 0.08, roughness: 0.12,
      metalness: 0.05, side: THREE.DoubleSide, depthWrite: false, clearcoat: 1
    })
  );
  tube.position.y = (Y_MAX + Y_MIN) / 2;
  scene.add(tube);
  const ribMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.28 });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.012, Y_MAX - Y_MIN, 0.012), ribMat);
    rib.position.set(Math.cos(a) * TUBE_R, (Y_MAX + Y_MIN) / 2, Math.sin(a) * TUBE_R);
    scene.add(rib);
  }
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
  for (let i = 1; i <= 7; i++) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(i * 0.42 - 0.012, i * 0.42 + 0.012, 64), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = Y_MIN + 0.02;
    scene.add(ring);
  }
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(TUBE_R, 64),
    new THREE.MeshStandardMaterial({ color: 0xcfd6de, roughness: 0.85, metalness: 0.05 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = Y_MIN;
  scene.add(floor);

  const stage = new THREE.Group();
  scene.add(stage);

  const maps = { day: null };
  new THREE.TextureLoader().load("assets/textures/earth-day-hi.jpg", (t) => {
    if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    maps.day = t;
    if (models[modelIndex]?.id === "earth") setModel("earth");
  }, undefined, () => {});

  const labelsRoot = document.getElementById("chamberLabels");
  const ray = new THREE.Raycaster();
  const mouseNdc = new THREE.Vector2();
  const world = new THREE.Vector3();
  let holding = false;
  let paused = false;
  let active = false;
  let spinY = 0.35;
  let spinX = 0.12;
  let dragY = 0.35;
  let dragX = 0.12;
  let downPos = null;
  let dragging = false;
  let idle = 0;

  function currentSpec() {
    return models[modelIndex];
  }

  function emitIntro() {
    const m = currentSpec();
    if (m) onPart?.({ id: "", label: m.label, fact: m.intro }, m);
  }

  function selectPart(partId) {
    selected = partId || "";
    if (!specimen) return;
    specimen.parts.forEach((p) => {
      p.object.traverse((o) => {
        if (!o.material || !o.material.emissive) return;
        const on = !selected || p.id === selected;
        o.material.emissiveIntensity = selected && on
          ? Math.max(o.material.userData.em0 || 0.12, 0.38)
          : (o.material.userData.em0 ?? 0.08);
        if (o.material.userData.keepOpaque) return;
        o.material.opacity = on ? 1 : 0.86;
        o.material.transparent = !on && Boolean(selected);
      });
    });
    syncLabels();
    const m = currentSpec();
    const part = m?.parts?.find((p) => p.id === selected);
    if (part) onPart?.(part, m);
  }

  function syncLabels() {
    if (!labelsRoot) return;
    const parts = currentSpec()?.parts || [];
    labelsRoot.innerHTML = "";
    parts.forEach((p) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chamber-label";
      btn.dataset.id = p.id;
      btn.textContent = p.label;
      if (p.id === selected) btn.classList.add("is-on");
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        selectPart(p.id);
      });
      labelsRoot.appendChild(btn);
    });
  }

  function layoutLabels() {
    if (!labelsRoot || !specimen) return;
    const rect = canvas.getBoundingClientRect();
    labelsRoot.querySelectorAll(".chamber-label").forEach((node) => {
      const part = specimen.parts.find((p) => p.id === node.dataset.id);
      if (!part) { node.hidden = true; return; }
      const target = part.labelAnchor || part.object;
      target.updateWorldMatrix(true, false);
      target.getWorldPosition(world);
      world.project(camera);
      const behind = world.z > 1 || world.z < 0;
      node.hidden = behind;
      node.style.left = `${(world.x * 0.5 + 0.5) * rect.width}px`;
      node.style.top = `${(-world.y * 0.5 + 0.5) * rect.height}px`;
      node.style.transform = currentSpec()?.id === "earth" ? "translate(-50%, -50%)" : "";
      node.classList.toggle("is-on", node.dataset.id === selected);
    });
  }

  function mount(id) {
    if (specimen) stage.remove(specimen.root);
    const builder = BUILDERS[id] || BUILDERS.atom;
    specimen = builder(maps);
    specimen.parts.forEach((p) => {
      p.rest = p.object.position.clone();
      p.object.traverse((o) => {
        if (o.material?.emissiveIntensity != null) o.material.userData.em0 = o.material.emissiveIntensity;
      });
    });
    stage.add(specimen.root);
    if (id === "earth") {
      spinY = 0.22;
      dragY = spinY;
      spinX = 0.16;
      dragX = spinX;
    }
    selected = "";
    explodeGoal = 0;
    explodeT = 0;
    syncLabels();
    emitIntro();
  }

  function setModel(id) {
    const idx = models.findIndex((m) => m.id === id);
    if (idx < 0) return;
    modelIndex = idx;
    mount(models[idx].id);
  }

  function nextModel(dir) {
    if (!models.length) return;
    modelIndex = (modelIndex + dir + models.length) % models.length;
    mount(models[modelIndex].id);
  }

  function pick(e) {
    const r = canvas.getBoundingClientRect();
    mouseNdc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouseNdc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(mouseNdc, camera);
    const hits = ray.intersectObjects(specimen?.root.children || [], true);
    const hit = hits.find((h) => h.object.userData.partId);
    if (hit) selectPart(hit.object.userData.partId);
  }

  canvas.addEventListener("pointermove", (e) => {
    if (!downPos) return;
    const dx = e.clientX - downPos.x;
    const dy = e.clientY - downPos.y;
    if ((e.pointerType === "touch" || e.pointerType === "pen") && !dragging) {
      if (Math.abs(dy) > 8 && Math.abs(dy) >= Math.abs(dx)) {
        downPos = null;
        holding = false;
        return;
      }
      if (Math.abs(dx) < 14) return;
      dragging = true;
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    } else if (Math.hypot(dx, dy) > 6) {
      dragging = true;
    }
    if (dragging) {
      spinY = dragY + dx * 0.008;
      spinX = THREE.MathUtils.clamp(dragX + dy * 0.004, -0.7, 0.7);
    }
  }, { passive: true });
  canvas.addEventListener("pointerdown", (e) => {
    holding = e.pointerType !== "touch" && e.pointerType !== "pen";
    dragging = false;
    downPos = { x: e.clientX, y: e.clientY };
    if (holding) canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointerup", (e) => {
    holding = false;
    dragY = spinY;
    dragX = spinX;
    if (!dragging) pick(e);
    downPos = null;
    dragging = false;
  });
  canvas.addEventListener("pointerleave", () => { holding = false; downPos = null; });

  function resize() {
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }
  new ResizeObserver(resize).observe(parent);
  resize();
  mount(models[0]?.id || "atom");

  const clock = new THREE.Clock();

  function tick() {
    if (!active) {
      if (labelsRoot) labelsRoot.style.visibility = "hidden";
      clock.getDelta();
      return;
    }
    if (labelsRoot) labelsRoot.style.visibility = "";
    const dt = paused ? 0 : Math.min(clock.getDelta(), 0.033);
    const t = clock.elapsedTime;
    const holdCut = models[modelIndex]?.id === "earth";
    if (!paused && !reduceMotion && !holdCut) idle += dt * 0.08;
    explodeT += (explodeGoal - explodeT) * Math.min(1, (dt || 0.016) * 6);

    stage.rotation.y = spinY + (holdCut ? 0 : idle);
    stage.rotation.x = spinX;

    if (specimen) {
      specimen.parts.forEach((p) => {
        const d = p.dir;
        p.object.position.set(
          p.rest.x + d.x * explodeT * 1.15,
          p.rest.y + d.y * explodeT * 1.05,
          p.rest.z + d.z * explodeT * 1.15
        );
      });
      if (specimen.root.userData.orbit && !paused) {
        specimen.root.children.forEach((ch) => {
          if (ch.userData.partId === "inner") ch.rotation.y += dt * 1.1;
          if (ch.userData.partId === "outer") {
            ch.children.forEach((hold) => {
              if (hold.userData.spin) hold.rotation.y += dt * hold.userData.spin;
            });
          }
        });
      }
    }

    camera.position.x = 3.05 + Math.sin(t * 0.12) * 0.1;
    camera.position.y = 0.55 + Math.sin(t * 0.17) * 0.05;
    camera.lookAt(0, 0.2, 0);
    layoutLabels();
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(tick);

  return {
    scatter() {},
    setPaused(vOn) { paused = Boolean(vOn); },
    setActive(vOn) {
      active = Boolean(vOn);
      if (active) renderer.render(scene, camera);
    },
    setModel,
    nextModel,
    setExplode(on) { explodeGoal = on ? 1 : 0; },
    selectPart,
    getModelId() { return models[modelIndex]?.id || ""; }
  };
}

export { initChamber };
