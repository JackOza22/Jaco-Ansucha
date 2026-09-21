/**
 * cinematic.js — loader, Lenis, cursor, scroll-driven takes, slate, sound, chapters.
 */
const finePointer = window.matchMedia("(pointer: fine)").matches;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const wide = () => window.innerWidth > 900;

function lerp(a, b, t) { return a + (b - a) * t; }

function sectionProgress(el) {
  const r = el.getBoundingClientRect();
  const total = Math.max(1, el.offsetHeight - window.innerHeight);
  return Math.max(0, Math.min(1, -r.top / total));
}

function inViewProgress(el) {
  const r = el.getBoundingClientRect();
  const h = window.innerHeight;
  const start = h * 0.85;
  const end = -r.height + h * 0.15;
  const t = (start - r.top) / (start - end);
  return Math.max(0, Math.min(1, t));
}

function pad(n, w = 2) {
  return String(n).padStart(w, "0");
}

function timecode(pageT) {
  const totalFrames = Math.floor(pageT * 180 * 24);
  const frames = totalFrames % 24;
  const secs = Math.floor(totalFrames / 24) % 60;
  const mins = Math.floor(totalFrames / (24 * 60));
  return `${pad(mins)}:${pad(secs)}:${pad(frames)}`;
}

function filmCopy() {
  return CONTENT.film || {};
}

export function initCinematic({ orrery, studio, chamber }) {
  const root = document.documentElement;
  const cinema = document.getElementById("model");
  const copy = document.getElementById("stageCopy");
  const bar = document.getElementById("scrollProgress");
  const topbar = document.getElementById("topbar");
  const loader = document.getElementById("loader");
  const letterbox = document.querySelectorAll(".letterbox span");
  const hold = document.getElementById("hold");
  const stage = document.getElementById("orreryStage");

  if (CONTENT.overture) {
    const kicker = document.getElementById("loaderKicker");
    const mark = document.getElementById("loaderMark");
    const line = document.getElementById("loaderLine");
    const take = document.getElementById("loaderTake");
    if (kicker) kicker.textContent = CONTENT.overture.kicker || "";
    if (mark) mark.textContent = CONTENT.overture.mark;
    if (line) line.textContent = CONTENT.overture.line;
    if (take) take.textContent = filmCopy().take || "";
  }
  const skipBtn = document.getElementById("loaderSkip");
  if (skipBtn) skipBtn.textContent = filmCopy().skip || "Skip";
  if (hold) hold.textContent = filmCopy().paused || "Hold";
  if (stage && filmCopy().stageLabel) stage.setAttribute("aria-label", filmCopy().stageLabel);

  const sound = initSound();
  initKeysHint();
  initCursor();
  initAtmosphere();
  initMagnetic();
  const lenis = initLenis();
  const chapters = initChapters((id) => scrollToId(id), lenis);
  initPersonColor();
  initReveals();
  initPeopleSpot();
  initTilt(".ref-card", 4, 3);
  initTilt(".postcard", 5, 4);
  initTilt(".work-shot", 6, 4);
  initTilt(".gallery-hero", 4, 3);
  initTilt(".curriculum-btn", 3, 2);
  initCounters();
  initStamps();
  initHash(lenis);
  initKeyboard({ orrery, studio, chamber, sound, chapters, hold });
  bindVisibility(document.getElementById("orreryStage") || cinema, orrery);
  bindVisibility(document.getElementById("studio"), studio);
  bindVisibility(document.getElementById("chamber"), chamber);
  document.addEventListener("film:clack", () => sound.clack());

  playLoader(loader).then(() => {
    document.body.classList.remove("is-loading");
    revealStage();
    const hash = location.hash.replace("#", "");
    if (hash) scrollToId(hash, true, lenis);
    onScroll();
  });

  let lookNX = 0, lookNY = 0;
  window.addEventListener("pointermove", (e) => {
    lookNX = (e.clientX / window.innerWidth) * 2 - 1;
    lookNY = -((e.clientY / window.innerHeight) * 2 - 1);
    if (orrery && orrery.setLook) orrery.setLook(lookNX, lookNY);
  }, { passive: true });

  let lastPageT = 0;
  let vel = 0;
  let lastScene = "";
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const doc = document.documentElement;
      const pageT = doc.scrollTop / Math.max(1, doc.scrollHeight - window.innerHeight);
      vel = lerp(vel, Math.abs(pageT - lastPageT) * 28, 0.22);
      lastPageT = pageT;
      if (bar) bar.style.transform = `scaleX(${pageT})`;
      const slateTime = document.getElementById("slateTime");
      if (slateTime) slateTime.textContent = timecode(pageT);

      const cinemaT = cinema ? sectionProgress(cinema) : 0;
      const exitT = Math.max(0, Math.min(1, (cinemaT - 0.7) / 0.3));
      root.style.setProperty("--exit", exitT.toFixed(3));
      if (orrery && orrery.setProgress) orrery.setProgress(cinemaT);
      if (copy) {
        const main = copy.querySelector(".stage-copy-main");
        const extras = copy.querySelectorAll(".hero-cast, .hero-pills");
        const fadeTitle = 1 - Math.min(1, cinemaT / 0.46);
        const fadeSide = 1 - Math.min(1, cinemaT / 0.3);
        if (main) {
          main.style.opacity = String(fadeTitle);
          main.style.transform = `translate3d(0, ${cinemaT * -40}px, 0)`;
        }
        extras.forEach((el) => { el.style.opacity = String(fadeSide); });
        const cue = copy.querySelector(".hero-scrollcue");
        if (cue) cue.style.opacity = String(1 - Math.min(1, cinemaT / 0.22));
      }
      const tools = document.getElementById("globeTools");
      if (tools) tools.style.opacity = String(Math.max(0, 0.85 - cinemaT * 1.35));
      const veil = document.getElementById("entryVeil");
      if (veil) {
        const entry = Math.max(0, (cinemaT - 0.78) / 0.22);
        veil.style.opacity = String(Math.min(1, entry * 1.15));
        document.documentElement.style.setProperty("--entry", entry.toFixed(3));
      }
      if (cinema) cinema.classList.toggle("is-entering", cinemaT > 0.7);

      const people = document.getElementById("people");
      if (people && !reduceMotion) {
        const t = inViewProgress(people);
        people.style.setProperty("--cast", t.toFixed(3));
        people.querySelectorAll(".person-photo img").forEach((img, i) => {
          const dir = i === 0 ? 1 : -1;
          const card = img.closest(".person");
          const mx = parseFloat(card?.style.getPropertyValue("--mx") || "50") - 50;
          const my = parseFloat(card?.style.getPropertyValue("--my") || "28") - 28;
          img.style.transform = `scale(${1.08 + t * 0.06}) translate3d(${mx * 0.18}px, ${(0.5 - t) * 36 * dir + my * 0.12}px, 0)`;
        });
      }
      const problem = document.getElementById("problem");
      if (problem && !reduceMotion) {
        const t = inViewProgress(problem);
        const app = problem.querySelector(".fake-app");
        const plans = problem.querySelector(".fake-plans");
        if (app) app.style.transform = `translateY(${(0.5 - t) * 36}px)`;
        if (plans) plans.style.transform = `rotate(-1.2deg) translateY(${(t - 0.5) * 28}px)`;
      }

      const box = 10 + Math.sin(cinemaT * Math.PI) * 22 + vel * 70;
      letterbox.forEach((el) => { el.style.height = `${Math.max(8, Math.min(56, box))}px`; });

      const studioEl = document.getElementById("studio");
      if (studio && studio.setSpin && studioEl) {
        studio.setSpin(inViewProgress(studioEl));
      }

      let mix = cinemaT * 0.55 + pageT * 0.45;
      const hover = document.body.dataset.hover;
      if (hover === "jaco") mix = lerp(mix, 0.08, 0.65);
      if (hover === "anuscha") mix = lerp(mix, 0.92, 0.65);
      root.style.setProperty("--mix", mix.toFixed(3));
      root.style.setProperty("--vel", vel.toFixed(3));
      root.style.setProperty("--lx", `${((lookNX * 0.5 + 0.5) * 100).toFixed(2)}%`);
      root.style.setProperty("--ly", `${((0.42 - lookNY * 0.28) * 100).toFixed(2)}%`);

      const night = isNightFrame();
      document.body.classList.toggle("is-night-grade", night);
      if (topbar) topbar.classList.toggle("topbar--night", night);

      updateDay();
      updateStrip();
      updatePlayhead();

      const scene = currentScene();
      if (scene && scene.n !== lastScene) {
        lastScene = scene.n;
        flashScene();
        sound.clack();
      }
      updateSlate(scene);
    });
  }

  function scrollToId(id, immediate, scroller = lenis) {
    const target = document.getElementById(id === "top" ? "top" : id);
    if (!target) return;
    if (scroller && typeof scroller.scrollTo === "function") {
      scroller.scrollTo(target, { offset: 0, immediate: Boolean(immediate) });
    } else {
      target.scrollIntoView({ behavior: immediate || reduceMotion ? "auto" : "smooth" });
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  if (lenis && typeof lenis.on === "function") lenis.on("scroll", onScroll);
  onScroll();

  document.addEventListener("film:lightbox", (e) => {
    if (!lenis) return;
    if (e.detail?.open) lenis.stop();
    else lenis.start();
  });
}

function currentScene() {
  const scenes = CONTENT.scenes || [];
  let current = scenes[0];
  for (const scene of scenes) {
    const el = document.getElementById(scene.id);
    if (!el) continue;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.55) current = scene;
  }
  return current;
}

function isNightFrame() {
  const ids = ["model", "problem", "people", "studio", "moments", "contact"];
  return ids.some((id) => {
    const el = document.getElementById(id);
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight * 0.5 && r.bottom > 90;
  });
}

function updateSlate(scene) {
  const sceneEl = document.getElementById("slateScene");
  const titleEl = document.getElementById("slateTitle");
  if (!scene || !sceneEl) return;
  if (sceneEl.textContent !== scene.n) sceneEl.textContent = scene.n;
  if (titleEl && titleEl.textContent !== scene.title) titleEl.textContent = scene.title;
}

function flashScene() {
  const flash = document.getElementById("sceneFlash");
  if (!flash || reduceMotion) return;
  flash.classList.remove("is-on");
  void flash.offsetWidth;
  flash.classList.add("is-on");
}

function updateDay() {
  const day = document.getElementById("day");
  const clock = document.getElementById("dayClock");
  const beats = [...document.querySelectorAll(".rhythm-beat")];
  if (!day || !beats.length) return;
  if (!wide()) {
    beats.forEach((b) => b.classList.add("is-on"));
    document.body.removeAttribute("data-day");
    return;
  }
  const t = sectionProgress(day);
  const i = Math.min(beats.length - 1, Math.floor(t * beats.length + 0.001));
  beats.forEach((b, n) => b.classList.toggle("is-on", n === i));
  const names = ["morning", "afternoon", "always"];
  document.body.dataset.day = names[i] || names[0];
  if (clock) {
    const time = beats[i]?.querySelector(".rhythm-time")?.textContent || "";
    clock.textContent = time;
  }
}

function updateStrip() {}

function updatePlayhead() {
  const exp = document.getElementById("experience");
  if (!exp) return;
  exp.style.setProperty("--play", inViewProgress(exp).toFixed(3));
}

function playLoader(loader) {
  return new Promise((resolve) => {
    const done = () => {
      document.body.classList.remove("is-loading");
      resolve();
    };
    if (!loader || reduceMotion) {
      if (loader) loader.remove();
      done();
      return;
    }
    const count = document.getElementById("loaderCount");
    const fill = document.getElementById("loaderBar");
    const gsap = window.gsap;
    const obj = { n: 0 };
    let finished = false;

    function finish(instant) {
      if (finished) return;
      finished = true;
      if (gsap) gsap.killTweensOf(obj);
      if (!gsap || instant) {
        loader.remove();
        done();
        return;
      }
      gsap.to(loader, {
        clipPath: "circle(0% at 50% 50%)",
        duration: 0.9,
        ease: "power4.inOut",
        onComplete() {
          loader.remove();
          done();
        }
      });
    }

    const skip = () => finish(false);
    document.getElementById("loaderSkip")?.addEventListener("click", skip);
    window.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === "Escape") skip();
    }, { once: true });

    if (!gsap) {
      finish(true);
      return;
    }
    gsap.to(obj, {
      n: 100,
      duration: 2.05,
      ease: "power2.inOut",
      onUpdate() {
        const n = Math.round(obj.n);
        if (count) count.textContent = pad(n);
        if (fill) fill.style.transform = `scaleX(${obj.n / 100})`;
      },
      onComplete() { finish(false); }
    });
  });
}

function revealStage() {
  const gsap = window.gsap;
  if (!gsap || reduceMotion) return;
  gsap.from(".stage-copy-main, .stage-copy .hero-sub, .stage-copy .hero-cast, .stage-copy .hero-scrollcue", {
    y: 36, opacity: 0, duration: 1.35, stagger: 0.1, ease: "power3.out", delay: 0.06
  });
}

function initLenis() {
  if (reduceMotion || !finePointer || typeof window.Lenis !== "function") return null;
  document.documentElement.style.scrollBehavior = "auto";
  const lenis = new window.Lenis({
    lerp: 0.075,
    duration: 1.15,
    smoothWheel: true,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.05
  });
  const gsap = window.gsap;
  if (gsap) {
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }
  return lenis;
}

function initHash(lenis) {
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    if (lenis && typeof lenis.scrollTo === "function") lenis.scrollTo(target, { offset: 0 });
    else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    history.replaceState(null, "", `#${id}`);
  });
}

function fieldHit(x, y) {
  const stack = document.elementsFromPoint(x, y);
  return stack.find((n) => !n.closest("#atmosphere, #cursor, #topbar, .letterbox, .slate, .scroll-progress, .grain"));
}

function fieldTone(x, y) {
  const node = fieldHit(x, y);
  const sec = node?.closest("section, header");
  const id = sec?.id || "";
  if (id === "model" || id === "moments" || sec?.classList.contains("cinema")) return [176, 206, 220];
  if (id === "problem") return [168, 198, 214];
  if (id === "alternative") return [196, 154, 96];
  if (id === "people") {
    const who = node.closest("[data-person]")?.dataset.person;
    if (who === "jaco") return [150, 196, 156];
    if (who === "anuscha") return [214, 132, 124];
    return [214, 186, 140];
  }
  if (id === "studio") return [154, 186, 146];
  if (id === "chamber") return [156, 182, 204];
  if (id === "together") return [206, 150, 132];
  if (id === "contact") return [196, 154, 96];
  return [186, 142, 68];
}

function initAtmosphere() {
  const canvas = document.createElement("canvas");
  canvas.id = "atmosphere";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const orbs = Array.from({ length: 28 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 90 + Math.random() * 180,
    v: 0.16 + Math.random() * 0.34,
    p: Math.random() * Math.PI * 2
  }));
  const specks = Array.from({ length: 48 }, () => ({
    x: Math.random(),
    y: Math.random(),
    s: 1.2 + Math.random() * 2.2,
    v: 0.25 + Math.random() * 0.7,
    p: Math.random() * Math.PI * 2
  }));
  let mx = window.innerWidth * 0.62;
  let my = window.innerHeight * 0.38;
  let tone = [186, 142, 68];
  const shown = tone.slice();
  let frameN = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    const node = fieldHit(mx, my);
    const sec = node?.closest("section, header");
    if (!sec) return;
    const rect = sec.getBoundingClientRect();
    sec.style.setProperty("--sx", `${((mx - rect.left) / Math.max(1, rect.width)) * 100}%`);
    sec.style.setProperty("--sy", `${((my - rect.top) / Math.max(1, rect.height)) * 100}%`);
  }, { passive: true });

  function paint() {
    frameN += 1;
    if (frameN % 4 === 0) tone = fieldTone(mx, my);
    shown[0] += (tone[0] - shown[0]) * 0.08;
    shown[1] += (tone[1] - shown[1]) * 0.08;
    shown[2] += (tone[2] - shown[2]) * 0.08;
    const r = shown[0] | 0;
    const g = shown[1] | 0;
    const b = shown[2] | 0;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const t = frameN * 0.01;
    ctx.fillStyle = "#f4efe6";
    ctx.fillRect(0, 0, w, h);
    const drift = ctx.createLinearGradient(Math.sin(t * 0.2) * w, 0, w, h);
    drift.addColorStop(0, `rgba(${r},${g},${b},0.28)`);
    drift.addColorStop(0.55, "rgba(244,239,230,0)");
    drift.addColorStop(1, `rgba(${Math.min(255, r + 30)},${g},${Math.max(0, b - 20)},0.22)`);
    ctx.fillStyle = drift;
    ctx.fillRect(0, 0, w, h);
    for (const orb of orbs) {
      const baseX = orb.x * w + Math.sin(t * orb.v + orb.p) * 70;
      const baseY = orb.y * h + Math.cos(t * orb.v * 0.85 + orb.p) * 54;
      const dx = baseX - mx;
      const dy = baseY - my;
      const dist = Math.hypot(dx, dy) || 1;
      const push = dist < 260 ? (260 - dist) / 260 : 0;
      const x = baseX + (dx / dist) * push * 72;
      const y = baseY + (dy / dist) * push * 72;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, orb.r);
      glow.addColorStop(0, `rgba(${r},${g},${b},${0.2 + push * 0.28})`);
      glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, orb.r, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const speck of specks) {
      const baseX = (speck.x * w + t * speck.v * 28) % (w + 40) - 20;
      const baseY = speck.y * h + Math.sin(t * speck.v + speck.p) * 24;
      const dx = baseX - mx;
      const dy = baseY - my;
      const dist = Math.hypot(dx, dy) || 1;
      const push = dist < 140 ? (140 - dist) / 140 : 0;
      const x = baseX + (dx / dist) * push * 36;
      const y = baseY + (dy / dist) * push * 36;
      ctx.fillStyle = `rgba(${r},${g},${b},${0.35 + push * 0.45})`;
      ctx.beginPath();
      ctx.arc(x, y, speck.s + push * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    const wash = ctx.createRadialGradient(mx, my, 0, mx, my, 380);
    wash.addColorStop(0, `rgba(${r},${g},${b},0.34)`);
    wash.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = wash;
    ctx.beginPath();
    ctx.arc(mx, my, 380, 0, Math.PI * 2);
    ctx.fill();
    document.documentElement.style.setProperty("--cursor-ink", `rgb(${r},${g},${b})`);
    requestAnimationFrame(paint);
  }
  paint();
}

function initCursor() {
  const el = document.getElementById("cursor");
  if (!el || !finePointer) return;
  el.hidden = false;
  el.classList.add("is-on");
  document.body.classList.add("has-cursor");
  const dot = el.querySelector(".cursor-dot");
  const ring = el.querySelector(".cursor-ring");
  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let rx = x;
  let ry = y;
  window.addEventListener("pointermove", (e) => {
    x = e.clientX;
    y = e.clientY;
    const person = e.target.closest("[data-person]")?.dataset.person;
    document.body.dataset.cursor = person || "";
    const hot = e.target.closest("a, button, .postcard, .stamp, summary, .film-tool, .work-shot, .curriculum-btn, .gallery-hero, .gallery-filter, .gallery-more");
    el.classList.toggle("is-hot", Boolean(hot));
  });
  function tick() {
    rx = lerp(rx, x, 0.16);
    ry = lerp(ry, y, 0.16);
    if (dot) dot.style.transform = `translate(${x}px, ${y}px)`;
    if (ring) ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(tick);
  }
  tick();
}

function initMagnetic() {
  if (!finePointer || reduceMotion) return;
  document.querySelectorAll("[data-magnetic]").forEach((node) => {
    node.addEventListener("pointermove", (e) => {
      const r = node.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      node.style.transform = `translate(${dx * 0.18}px, ${dy * 0.18}px)`;
    });
    node.addEventListener("pointerleave", () => {
      node.style.transform = "";
    });
  });
}

function initPersonColor() {
  document.addEventListener("pointerover", (e) => {
    const p = e.target.closest("[data-person]")?.dataset.person;
    if (p) document.body.dataset.hover = p;
  });
  document.addEventListener("pointerout", (e) => {
    if (!e.target.closest("[data-person]")) document.body.dataset.hover = "";
  });
}

function initReveals() {
  const nodes = document.querySelectorAll("[data-reveal]");
  if (!nodes.length) return;
  if (reduceMotion) {
    nodes.forEach((n) => n.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("is-in");
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  nodes.forEach((n) => io.observe(n));
}

function initPeopleSpot() {
  if (!finePointer) return;
  document.querySelectorAll(".person").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
      card.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
    });
  });
}

function initTilt(selector, rx = 8, ry = 6) {
  if (!finePointer || reduceMotion) return;
  document.addEventListener("pointermove", (e) => {
    const node = e.target.closest(selector);
    if (!node) return;
    const r = node.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    node.style.transform = `perspective(1200px) rotateY(${px * rx}deg) rotateX(${-py * ry}deg)`;
  });
  document.addEventListener("pointerout", (e) => {
    const node = e.target.closest(selector);
    if (node) node.style.transform = "";
  });
}

function initCounters() {
  const nums = document.querySelectorAll("[data-count]");
  if (!nums.length) return;
  const run = (el) => {
    const target = Number(el.dataset.count) || 0;
    const suffix = el.dataset.suffix || "";
    const gsap = window.gsap;
    if (!gsap || reduceMotion) {
      el.textContent = `${target}${suffix}`;
      return;
    }
    const obj = { n: 0 };
    gsap.to(obj, {
      n: target,
      duration: 1.7,
      ease: "power2.out",
      onUpdate() { el.textContent = `${Math.round(obj.n)}${suffix}`; }
    });
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      run(en.target);
      io.unobserve(en.target);
    });
  }, { threshold: 0.45 });
  nums.forEach((n) => io.observe(n));
}

function initStamps() {
  const cells = document.querySelectorAll(".stamp-cell");
  if (!cells.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) en.target.classList.add("is-stamped");
    });
  }, { threshold: 0.25 });
  cells.forEach((c) => io.observe(c));
}

function initKeysHint() {
  const el = document.getElementById("keysHint");
  if (!el || !finePointer || reduceMotion) return;
  el.textContent = filmCopy().keys || "";
  el.hidden = false;
  window.setTimeout(() => { el.classList.add("is-gone"); }, 5200);
}

function initSound() {
  const btn = document.getElementById("soundToggle");
  const copy = filmCopy();
  let ctx = null;
  let master = null;
  let enabled = false;

  function label() {
    if (!btn) return;
    btn.textContent = enabled ? (copy.soundOn || "Sound on") : (copy.soundOff || "Sound off");
    btn.setAttribute("aria-pressed", String(enabled));
  }
  label();

  function boot() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC || ctx) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    [98, 146.83].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      g.gain.value = i === 0 ? 0.028 : 0.018;
      osc.connect(g);
      g.connect(master);
      osc.start();
    });

    const seconds = 2;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1800;
    filter.Q.value = 0.6;
    const ng = ctx.createGain();
    ng.gain.value = 0.035;
    src.connect(filter);
    filter.connect(ng);
    ng.connect(master);
    src.start();
  }

  function setEnabled(on) {
    enabled = on;
    boot();
    if (!ctx || !master) return;
    ctx.resume();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(on ? 0.85 : 0, ctx.currentTime + 0.45);
    document.body.classList.toggle("has-sound", on);
    label();
  }

  function clack() {
    if (!enabled || !ctx || !master) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = 1400;
    g.gain.setValueAtTime(0.05, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    osc.connect(g);
    g.connect(master);
    osc.start(t);
    osc.stop(t + 0.07);
  }

  btn?.addEventListener("click", () => setEnabled(!enabled));
  return { clack, setEnabled, isOn: () => enabled };
}

function initChapters(scrollToId, lenis) {
  const overlay = document.getElementById("chapters");
  const list = document.getElementById("chapterList");
  const toggle = document.getElementById("chaptersToggle");
  const closeBtn = document.getElementById("chaptersClose");
  const kicker = document.getElementById("chaptersKicker");
  const copy = filmCopy();
  if (toggle) toggle.textContent = copy.chapters || "Chapters";
  if (closeBtn) closeBtn.textContent = copy.close || "Close";
  if (kicker) kicker.textContent = copy.chapters || "Chapters";

  (CONTENT.scenes || []).forEach((scene) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.innerHTML = `<span>${scene.n}</span>${scene.title}`;
    btn.addEventListener("click", () => {
      close();
      scrollToId(scene.id);
    });
    li.appendChild(btn);
    list?.appendChild(li);
  });

  function open() {
    if (!overlay) return;
    overlay.hidden = false;
    document.body.classList.add("is-chapters");
    lenis?.stop?.();
    closeBtn?.focus();
  }
  function close() {
    if (!overlay) return;
    overlay.hidden = true;
    document.body.classList.remove("is-chapters");
    lenis?.start?.();
  }

  toggle?.addEventListener("click", () => (overlay?.hidden === false ? close() : open()));
  closeBtn?.addEventListener("click", close);
  overlay?.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  return { open, close, isOpen: () => overlay && !overlay.hidden };
}

function typingTarget(el) {
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

function initKeyboard({ orrery, studio, chamber, sound, chapters, hold }) {
  let paused = false;
  function setPaused(on) {
    paused = on;
    orrery?.setPaused?.(on);
    studio?.setPaused?.(on);
    chamber?.setPaused?.(on);
    if (hold) hold.hidden = !on;
    document.body.classList.toggle("is-held", on);
  }

  window.addEventListener("keydown", (e) => {
    if (typingTarget(e.target)) return;
    const lightboxOpen = !document.getElementById("lightbox")?.hidden;

    if (e.key === "Escape") {
      if (chapters.isOpen()) chapters.close();
      return;
    }
    if (e.key === "c" || e.key === "C") {
      if (lightboxOpen) return;
      e.preventDefault();
      chapters.isOpen() ? chapters.close() : chapters.open();
      return;
    }
    if (e.key === "m" || e.key === "M") {
      e.preventDefault();
      sound.setEnabled(!sound.isOn());
      return;
    }
    if (e.code === "Space" && !lightboxOpen && !chapters.isOpen()) {
      e.preventDefault();
      setPaused(!paused);
      return;
    }
    function sectionInView(id) {
      const node = document.getElementById(id);
      if (!node) return false;
      const r = node.getBoundingClientRect();
      return r.top < window.innerHeight * 0.62 && r.bottom > 140;
    }
    if (e.key === "ArrowRight" && !lightboxOpen) {
      e.preventDefault();
      const kind = sectionInView("chamber") ? "chamber:step" : sectionInView("moments") ? "gallery:nudge" : "curriculum:step";
      document.dispatchEvent(new CustomEvent(kind, { detail: 1 }));
      sound.clack();
    }
    if (e.key === "ArrowLeft" && !lightboxOpen) {
      e.preventDefault();
      const kind = sectionInView("chamber") ? "chamber:step" : sectionInView("moments") ? "gallery:nudge" : "curriculum:step";
      document.dispatchEvent(new CustomEvent(kind, { detail: -1 }));
      sound.clack();
    }
  });

  const stage = document.getElementById("orreryStage");
  stage?.addEventListener("dblclick", () => orrery?.resetSpin?.());
}

function bindVisibility(el, api) {
  if (!el || !api?.setActive) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => api.setActive(en.isIntersecting));
  }, { rootMargin: "15% 0px" });
  io.observe(el);
}
