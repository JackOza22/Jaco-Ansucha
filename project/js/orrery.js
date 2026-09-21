/**
 * orrery.js — cinematic Earth.
 * Scroll dollies from a distant globe to a limb / horizon.
 * A day–night slider drives the sun. Drag turns the planet.
 * The globe keeps turning through a full circle.
 */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

const EARTH_R = 1.78;

function blob(ctx, x, y, rx, ry, rot, fill) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot || 0);
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

function makeFallbackMaps() {
  const w = 2048;
  const h = 1024;
  const color = document.createElement("canvas");
  color.width = w;
  color.height = h;
  const ctx = color.getContext("2d");
  const ocean = ctx.createLinearGradient(0, 0, 0, h);
  ocean.addColorStop(0, "#d7e6ef");
  ocean.addColorStop(0.12, "#1a5f86");
  ocean.addColorStop(0.5, "#0c355c");
  ocean.addColorStop(0.88, "#1a5f86");
  ocean.addColorStop(1, "#d7e6ef");
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, w, h);
  blob(ctx, w * 0.22, h * 0.32, w * 0.16, h * 0.12, -0.35, "#3f6a44");
  blob(ctx, w * 0.18, h * 0.38, w * 0.07, h * 0.08, 0.4, "#3f6a44");
  blob(ctx, w * 0.28, h * 0.62, w * 0.07, h * 0.16, 0.25, "#3f6a44");
  blob(ctx, w * 0.52, h * 0.48, w * 0.09, h * 0.18, 0.1, "#3f6a44");
  blob(ctx, w * 0.52, h * 0.38, w * 0.07, h * 0.06, 0, "#c4a56a");
  blob(ctx, w * 0.68, h * 0.34, w * 0.18, h * 0.12, 0.15, "#3f6a44");
  blob(ctx, w * 0.74, h * 0.42, w * 0.12, h * 0.08, -0.2, "#c4a56a");
  blob(ctx, w * 0.82, h * 0.64, w * 0.07, h * 0.045, 0.3, "#3f6a44");
  blob(ctx, w * 0.5, h * 0.04, w * 0.5, h * 0.07, 0, "#eef3f6");
  blob(ctx, w * 0.5, h * 0.97, w * 0.5, h * 0.08, 0, "#eef3f6");

  const night = document.createElement("canvas");
  night.width = w;
  night.height = h;
  const nctx = night.getContext("2d");
  nctx.fillStyle = "#02040c";
  nctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 900; i++) {
    nctx.fillStyle = `rgba(255, ${180 + Math.random() * 50}, 120, ${0.15 + Math.random() * 0.55})`;
    nctx.fillRect(Math.random() * w, h * (0.18 + Math.random() * 0.55), 1 + Math.random() * 2, 1);
  }

  const spec = document.createElement("canvas");
  spec.width = w;
  spec.height = h;
  const sctx = spec.getContext("2d");
  sctx.fillStyle = "#e8eef4";
  sctx.fillRect(0, 0, w, h);

  const clouds = document.createElement("canvas");
  clouds.width = w;
  clouds.height = h;
  const cctx = clouds.getContext("2d");
  for (let i = 0; i < 90; i++) {
    cctx.fillStyle = `rgba(255,255,255,${0.08 + Math.random() * 0.2})`;
    cctx.beginPath();
    cctx.ellipse(Math.random() * w, h * (0.18 + Math.random() * 0.64), 40 + Math.random() * 120, 12 + Math.random() * 28, Math.random(), 0, Math.PI * 2);
    cctx.fill();
  }

  function tex(canvas, srgb) {
    const t = new THREE.CanvasTexture(canvas);
    if (srgb && THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 16;
    return t;
  }
  return { day: tex(color, true), night: tex(night, true), spec: tex(spec, false), clouds: tex(clouds, true) };
}

function prepTex(t, srgb) {
  if (srgb && THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 16;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.ClampToEdgeWrapping;
  t.needsUpdate = true;
  return t;
}

function loadTex(url, srgb) {
  return new Promise((resolve) => {
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (t) => resolve(prepTex(t, srgb)),
      undefined,
      () => resolve(null)
    );
  });
}

function loadFirst(urls, srgb) {
  return urls.reduce(
    (p, url) => p.then((got) => got || loadTex(url, srgb)),
    Promise.resolve(null)
  );
}

function starTexture() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 30);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.18, "rgba(230,238,255,0.9)");
  grd.addColorStop(0.45, "rgba(180,200,255,0.25)");
  grd.addColorStop(1, "rgba(140,170,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}

function makeStars(count, radius, size) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = radius + Math.random() * radius * 0.85;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);
    const warm = Math.random();
    col[i * 3] = 0.82 + warm * 0.18;
    col[i * 3 + 1] = 0.86 + warm * 0.1;
    col[i * 3 + 2] = 1;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({
    map: starTexture(),
    size,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    sizeAttenuation: true,
    vertexColors: true,
    blending: THREE.AdditiveBlending
  }));
}

function glowSprite(color, size) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(128, 128, 6, 128, 128, 124);
  grd.addColorStop(0, color);
  grd.addColorStop(0.18, "rgba(255,236,210,0.55)");
  grd.addColorStop(0.45, "rgba(255,180,90,0.18)");
  grd.addColorStop(1, "rgba(255,180,80,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const map = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({ map, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
  const spr = new THREE.Sprite(mat);
  spr.scale.set(size, size, 1);
  return spr;
}

function earthMaterial(maps) {
  return new THREE.ShaderMaterial({
    uniforms: {
      dayMap: { value: maps.day },
      nightMap: { value: maps.night },
      specMap: { value: maps.spec },
      normalMap: { value: maps.spec },
      sunDirection: { value: new THREE.Vector3(0.7, 0.35, 0.45).normalize() },
      nightBoost: { value: 0.58 },
      entry: { value: 0 }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormalW;
      varying vec3 vViewDir;
      void main() {
        vUv = uv;
        vec4 world = modelMatrix * vec4(position, 1.0);
        vNormalW = normalize(mat3(modelMatrix) * normal);
        vViewDir = cameraPosition - world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: `
      uniform sampler2D dayMap;
      uniform sampler2D nightMap;
      uniform sampler2D specMap;
      uniform sampler2D normalMap;
      uniform vec3 sunDirection;
      uniform float nightBoost;
      uniform float entry;
      varying vec2 vUv;
      varying vec3 vNormalW;
      varying vec3 vViewDir;
      void main() {
        vec3 n = normalize(vNormalW);
        vec3 bump = texture2D(normalMap, vUv).xyz * 2.0 - 1.0;
        n = normalize(n + vec3(bump.x, bump.y, 0.0) * 0.12);
        vec3 sun = normalize(sunDirection);
        vec3 day = pow(texture2D(dayMap, vUv).rgb, vec3(0.9));
        day *= 0.96;
        vec3 lights = texture2D(nightMap, vUv).rgb;
        float ndl = dot(n, sun);
        float light = smoothstep(-0.08, 0.12, ndl);
        float terminator = exp(-pow(ndl / 0.22, 2.0));
        vec3 night = day * 0.028 + lights * (1.8 + nightBoost * 2.4);
        vec3 color = mix(night, day, light);
        color += vec3(1.0, 0.42, 0.14) * terminator * (1.0 - light) * 0.22;
        vec3 view = normalize(vViewDir);
        vec3 halfV = normalize(sun + view);
        float spec = pow(max(dot(n, halfV), 0.0), 64.0) * texture2D(specMap, vUv).r * light;
        color += vec3(0.85, 0.94, 1.0) * spec * 0.38;
        float fres = pow(1.0 - max(dot(n, view), 0.0), 4.2);
        color += vec3(0.55, 0.82, 1.0) * fres * 0.07;
        color *= 1.0 - entry * 0.08;
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
}

function atmoMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      sunDirection: { value: new THREE.Vector3(0.7, 0.35, 0.45) },
      entry: { value: 0 }
    },
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      varying vec3 vNormalW;
      varying vec3 vViewDir;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vNormalW = normalize(mat3(modelMatrix) * normal);
        vViewDir = cameraPosition - world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: `
      uniform vec3 sunDirection;
      uniform float entry;
      varying vec3 vNormalW;
      varying vec3 vViewDir;
      void main() {
        vec3 n = normalize(vNormalW);
        vec3 view = normalize(vViewDir);
        vec3 sun = normalize(sunDirection);
        float ndv = max(dot(n, view), 0.0);
        float graze = 1.0 - ndv;
        float limb = smoothstep(0.0, 0.18, graze) * (1.0 - smoothstep(0.22, 0.62, graze));
        limb = pow(limb, 0.55);
        float halo = pow(graze, 4.2) * 0.16;
        float sunI = dot(n, sun);
        float day = smoothstep(-0.05, 0.42, sunI);
        float twilight = exp(-pow(sunI / 0.28, 2.0));
        vec3 rayleigh = vec3(0.42, 0.68, 1.0);
        vec3 sunset = vec3(1.0, 0.40, 0.12);
        vec3 col = mix(rayleigh * 0.2, rayleigh, day);
        col = mix(col, sunset, twilight * 0.85);
        col = mix(col, vec3(0.82, 0.94, 1.0), limb * day * 0.55);
        float vis = mix(0.04, 1.0, max(day, twilight * 0.75));
        float alpha = (limb * 0.48 + halo) * vis;
        alpha *= 1.0 - entry * 0.25;
        gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.92));
      }
    `
  });
}

function cloudMaterial(map) {
  return new THREE.ShaderMaterial({
    uniforms: {
      cloudMap: { value: map },
      sunDirection: { value: new THREE.Vector3(0.7, 0.35, 0.45) }
    },
    transparent: true,
    depthWrite: false,
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormalW;
      varying vec3 vViewDir;
      void main() {
        vUv = uv;
        vec4 world = modelMatrix * vec4(position, 1.0);
        vNormalW = normalize(mat3(modelMatrix) * normal);
        vViewDir = cameraPosition - world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: `
      uniform sampler2D cloudMap;
      uniform vec3 sunDirection;
      varying vec2 vUv;
      varying vec3 vNormalW;
      varying vec3 vViewDir;
      void main() {
        vec4 c = texture2D(cloudMap, vUv);
        float lum = max(c.r, max(c.g, c.b));
        float alpha = c.a < 0.995 ? c.a : lum;
        vec3 n = normalize(vNormalW);
        float light = smoothstep(-0.15, 0.22, dot(n, normalize(sunDirection)));
        vec3 col = mix(vec3(0.05, 0.07, 0.12), vec3(1.0, 0.99, 0.97), light);
        float fres = pow(1.0 - max(dot(n, normalize(vViewDir)), 0.0), 3.2);
        gl_FragColor = vec4(col, alpha * mix(0.08, 0.4, light) * (1.0 - fres * 0.22));
      }
    `
  });
}

function innerAtmoMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      sunDirection: { value: new THREE.Vector3(0.7, 0.35, 0.45) },
      entry: { value: 0 }
    },
    side: THREE.FrontSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      varying vec3 vNormalW;
      varying vec3 vViewDir;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vNormalW = normalize(mat3(modelMatrix) * normal);
        vViewDir = cameraPosition - world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: `
      uniform vec3 sunDirection;
      uniform float entry;
      varying vec3 vNormalW;
      varying vec3 vViewDir;
      void main() {
        vec3 n = normalize(vNormalW);
        vec3 view = normalize(vViewDir);
        float fres = pow(1.0 - max(dot(n, view), 0.0), 7.2);
        float sun = pow(max(dot(n, normalize(sunDirection)), 0.0), 2.4);
        vec3 col = mix(vec3(0.28, 0.55, 1.0), vec3(1.0, 0.72, 0.38), sun * 0.45);
        gl_FragColor = vec4(col, fres * 0.16 * (0.35 + sun) + sun * 0.02);
      }
    `
  });
}

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

function initOrrery(canvas) {
  const parent = canvas.parentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const useBloom = window.innerWidth >= 700;

  const noop = {
    setProgress() {},
    setPointer() {},
    setLook() {},
    setDayNight() {},
    lockSun() {},
    resetSpin() {},
    setPaused() {},
    setActive() {}
  };

  if (!webglAvailable()) {
    parent.classList.add("is-fallback");
    return noop;
  }

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x010206, 0.0022);

  const camera = new THREE.PerspectiveCamera(26, 1, 0.08, 140);
  const camCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.04, 0.16, 9.6),
    new THREE.Vector3(0.14, 0.02, 7.35),
    new THREE.Vector3(0.1, -0.18, 5.95)
  ], false, "centripetal");
  camera.position.copy(camCurve.getPoint(0));
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x03050c, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.72;
  if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;

  scene.add(new THREE.HemisphereLight(0x9eb4d0, 0x070b14, 0.16));
  const sun = new THREE.DirectionalLight(0xffe6c2, 1.35);
  sun.position.set(5, 2, 4);
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0x243656, 0.08);
  fill.position.set(-4, -1, -3);
  scene.add(fill);

  const sunGlow = glowSprite("rgba(255,244,220,1)", 4.4);
  scene.add(sunGlow);

  const stars = makeStars(5600, 18, 0.16);
  const starsFar = makeStars(2400, 30, 0.34);
  scene.add(stars, starsFar);

  const earth = new THREE.Group();
  scene.add(earth);

  const maps = makeFallbackMaps();
  const earthMat = earthMaterial(maps);
  const globe = new THREE.Mesh(new THREE.SphereGeometry(EARTH_R, 160, 112), earthMat);
  earth.add(globe);

  const cloudMat = cloudMaterial(maps.clouds);
  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_R * 1.008, 96, 64),
    cloudMat
  );
  earth.add(clouds);

  const atmoMat = atmoMaterial();
  earth.add(new THREE.Mesh(new THREE.SphereGeometry(EARTH_R * 1.055, 96, 64), atmoMat));
  const innerMat = innerAtmoMaterial();
  earth.add(new THREE.Mesh(new THREE.SphereGeometry(EARTH_R * 1.006, 64, 48), innerMat));

  Promise.all([
    loadFirst(["assets/textures/earth-day-hi.jpg", "assets/textures/earth-day.jpg"], true),
    loadFirst(["assets/textures/earth-night-hi.jpg", "assets/textures/earth-night.png"], true),
    loadFirst(["assets/textures/earth-spec-hi.jpg", "assets/textures/earth-spec.jpg"], false),
    loadFirst(["assets/textures/earth-clouds-hi.png", "assets/textures/earth-clouds.png"], true),
    loadTex("assets/textures/earth-normal.jpg", false)
  ]).then(([day, night, spec, cloudTex, normal]) => {
    if (day) earthMat.uniforms.dayMap.value = day;
    if (night) earthMat.uniforms.nightMap.value = night;
    if (spec) earthMat.uniforms.specMap.value = spec;
    if (normal) earthMat.uniforms.normalMap.value = normal;
    if (cloudTex) cloudMat.uniforms.cloudMap.value = cloudTex;
  });

  let composer = null;
  let bloomPass = null;
  if (useBloom) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.22, 0.55, 0.42);
    composer.addPass(bloomPass);
  }

  function resize() {
    const w = parent.clientWidth, h = parent.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (composer) {
      composer.setSize(w, h);
      if (bloomPass) bloomPass.setSize(w, h);
    }
    paint();
  }
  new ResizeObserver(resize).observe(parent);
  resize();

  let extraY = 0;
  let extraX = 0;
  let dragY = 0;
  let dragX = 0;
  let downPos = null;
  let dragging = false;
  let holding = false;

  function yawFromDrag(dx) {
    const span = Math.max(1, renderer.domElement.clientWidth);
    return (dx / span) * Math.PI * 2;
  }

  function endHold() {
    dragY = extraY;
    dragX = extraX;
    downPos = null;
    dragging = false;
    holding = false;
  }

  renderer.domElement.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    downPos = { x: e.clientX, y: e.clientY };
    dragging = false;
    holding = true;
    renderer.domElement.setPointerCapture(e.pointerId);
  });
  renderer.domElement.addEventListener("pointermove", (e) => {
    if (!downPos) return;
    const dx = e.clientX - downPos.x;
    const dy = e.clientY - downPos.y;
    if (Math.hypot(dx, dy) > 5) dragging = true;
    if (dragging) {
      extraY = dragY + yawFromDrag(dx);
      extraX = THREE.MathUtils.clamp(dragX + dy * 0.0025, -0.42, 0.42);
    }
  });
  renderer.domElement.addEventListener("pointerup", endHold);
  renderer.domElement.addEventListener("pointercancel", endHold);
  renderer.domElement.addEventListener("wheel", (e) => {
    extraY += e.deltaY * 0.0014;
    dragY = extraY;
  }, { passive: true });
  renderer.domElement.addEventListener("dblclick", () => {
    extraY = extraX = dragY = dragX = 0;
  });

  let scrollT = 0;
  let scrollGoal = 0;
  let dayNight = 0.42;
  let sunLocked = false;
  const curveCam = camCurve.getPoint(0);
  const desiredCam = curveCam.clone();
  const look = new THREE.Vector3(0, 0, 0);
  const lookTarget = new THREE.Vector3(0, 0, 0);
  const sunDir = new THREE.Vector3();
  let lookNX = 0;
  let lookNY = 0;
  let paused = false;
  let active = true;

  function applySun() {
    const wobble = Math.sin(cineT * 0.32) * 0.22;
    const a = THREE.MathUtils.lerp(Math.PI * 1.08, 0.52, dayNight) + wobble;
    const y = THREE.MathUtils.lerp(-0.55, 2.05, dayNight) + Math.cos(cineT * 0.21) * 0.18;
    sunDir.set(Math.cos(a) * 7.6, y, Math.sin(a) * 6.8);
    sun.position.copy(sunDir);
    sunGlow.position.copy(sunDir);
    sun.intensity = (0.78 + dayNight * 0.95) * (0.9 + Math.sin(cineT * 0.55) * 0.1);
    const sunN = sunDir.clone().normalize();
    earthMat.uniforms.sunDirection.value.copy(sunN);
    earthMat.uniforms.nightBoost.value = 1 - dayNight;
    earthMat.uniforms.entry.value = Math.max(0, (scrollT - 0.78) / 0.22);
    cloudMat.uniforms.sunDirection.value.copy(sunN);
    atmoMat.uniforms.sunDirection.value.copy(sunN);
    atmoMat.uniforms.entry.value = earthMat.uniforms.entry.value;
    innerMat.uniforms.sunDirection.value.copy(sunN);
    innerMat.uniforms.entry.value = earthMat.uniforms.entry.value;
    renderer.toneMappingExposure = 0.62 + dayNight * 0.1;
    stars.material.opacity = 0.55 + (1 - dayNight) * 0.45;
    starsFar.material.opacity = 0.4 + (1 - dayNight) * 0.55;
    if (bloomPass) {
      bloomPass.strength = 0.1 + dayNight * 0.06;
      bloomPass.threshold = 0.42 + dayNight * 0.08;
    }
    sunGlow.scale.setScalar(1.15 + dayNight * 1.1);
    parent.dataset.daynight = dayNight < 0.38 ? "night" : dayNight > 0.62 ? "day" : "dusk";
    parent.parentElement?.classList.toggle("is-night-globe", dayNight < 0.45);
  }

  function smootherstep(t) {
    t = THREE.MathUtils.clamp(t, 0, 1);
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  function damp(current, target, speed, dt) {
    if (dt <= 0) return current;
    return current + (target - current) * (1 - Math.exp(-speed * dt));
  }

  function applyScrollCam() {
    const eased = smootherstep(scrollT);
    camCurve.getPoint(eased, curveCam);
    camera.fov = THREE.MathUtils.lerp(26, 27.4, eased);
    camera.updateProjectionMatrix();
    if (scene.fog) scene.fog.density = 0.0024;
    if (!sunLocked) {
      dayNight = THREE.MathUtils.lerp(0.22, 0.78, eased);
      const slider = document.getElementById("globeDayNight");
      if (slider && document.activeElement !== slider) slider.value = String(Math.round(dayNight * 100));
    }
    applySun();
    parent.classList.toggle("is-close", scrollT > 0.42);
    parent.classList.toggle("is-entering", scrollT > 0.72);
  }

  function setProgress(t) {
    scrollGoal = THREE.MathUtils.clamp(t, 0, 1);
    if (reduceMotion) {
      scrollT = scrollGoal;
      applyScrollCam();
    }
  }

  function paint() {
    if (composer) composer.render();
    else renderer.render(scene, camera);
  }

  function setDayNight(t) {
    dayNight = THREE.MathUtils.clamp(t, 0, 1);
    applySun();
  }

  function setLook(nx, ny) {
    lookNX = nx;
    lookNY = ny;
  }

  const clock = new THREE.Clock();
  let idle = 0;
  let cloudSpin = 0;
  let cineT = 0;

  function tick() {
    const dt = paused ? 0 : clock.getDelta();
    const t = clock.elapsedTime;
    if (!paused && !holding) {
      idle += dt * 0.13;
      cloudSpin += dt * 0.012;
      cineT += dt;
    }
    earth.rotation.y = idle + extraY;
    earth.rotation.x = extraX;

    if (reduceMotion) scrollT = scrollGoal;
    else scrollT = damp(scrollT, scrollGoal, 7.2, dt);
    applyScrollCam();

    lookTarget.set(
      lookNX * 0.05,
      THREE.MathUtils.lerp(0, -0.14, scrollT) + lookNY * 0.035,
      0
    );
    const follow = reduceMotion ? 1 : (dt > 0 ? 1 - Math.exp(-8.2 * dt) : 0);
    look.lerp(lookTarget, reduceMotion ? 1 : (dt > 0 ? 1 - Math.exp(-8.5 * dt) : 0));
    desiredCam.copy(curveCam);
    desiredCam.x += Math.sin(cineT * 0.16) * 0.28 + lookNX * 0.16;
    desiredCam.y += Math.cos(cineT * 0.12) * 0.12 + lookNY * 0.07;
    desiredCam.z += Math.sin(cineT * 0.09) * 0.22;
    camera.position.lerp(desiredCam, follow);
    camera.lookAt(look);

    stars.rotation.y = t * 0.0045;
    starsFar.rotation.y = t * -0.0024;
    starsFar.rotation.x = t * 0.0008;
    clouds.rotation.y = cloudSpin;
    sunGlow.material.opacity = 0.38 + Math.sin(t * 1.1) * 0.06;

    if (composer) composer.render();
    else renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(tick);
  applySun();
  paint();

  return {
    setProgress,
    setPointer() {},
    setLook,
    setDayNight,
    lockSun(v) { sunLocked = Boolean(v); },
    resetSpin() { extraY = extraX = dragY = dragX = 0; },
    setPaused(v) { paused = Boolean(v); },
    setActive(v) {
      active = Boolean(v);
      if (active) paint();
    }
  };
}

export { initOrrery };
